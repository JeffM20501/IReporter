# server/blueprints/auth.py (or similar)
from flask_restful import Resource
from flask import request, g, current_app
from ....utils.auth import create_token, login_required
from ....models import User, PasswordReset
from ....config import db
import jwt
from datetime import datetime, timedelta
from ....services.email_service import send_password_reset_code_email
from sqlalchemy.exc import OperationalError, ProgrammingError
from ....services.cloudinary import upload_image
from flasgger import swag_from

class SignupResource(Resource):
    @swag_from({
        'tags': ['Authentication sign up'],
        'summary': 'Register a new user',
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'username': {'type': 'string', 'example': 'johndoe'},
                        'email': {'type': 'string', 'example': 'john@example.com'},
                        'password': {'type': 'string', 'format': 'password', 'example': 'secret123'},
                        'phone_number': {'type': 'string', 'example': '+254712345678'}
                    },
                    'required': ['username', 'email', 'password']
                }
            }
        ],
        'responses': {
            201: {
                'description': 'User created',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'token': {'type': 'string'},
                        'user': {'type': 'object'}
                    }
                }
            },
            400: {'description': 'Missing fields or duplicate email/username'}
        }
    })
    def post(self):
        data = request.get_json()
        username = data.get('username', '').strip().lower() 
        email = data.get('email', '').strip().lower()       
        password = data.get('password')
        phone_number=data.get('phone_number')

        if not username or not email or not password:
            return {'message': 'Username, email, and password are required'}, 400

        if User.query.filter_by(username=username).first():
            return {'message': 'Username already exists'}, 400
        if User.query.filter_by(email=email).first():
            return {'message': 'Email already exists'}, 400
        
        if phone_number=='':
            phone_number=None

        user = User(username=username, email=email, password=password, phone_number=phone_number)
        try:
            db.session.add(user)
            db.session.commit()
        except OperationalError:
            return {'message': 'Database is currently unavailable'}
        except ProgrammingError:
            return {'message': 'Your request can not be handled at this time'}
        except Exception as e:
            print(f'An unexpected error occurred: {e}')
        

        token = create_token(user.id)
        return {'token': token, 'user': user.to_dict()}, 201

class LoginResource(Resource):
    @swag_from({
        'tags': ['Authentication login'],
        'summary': 'Log in and receive JWT token',
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'email': {'type': 'string', 'example': 'john@example.com'},
                        'password': {'type': 'string', 'format': 'password', 'example': 'secret123'}
                    },
                    'required': ['email', 'password']
                }
            }
        ],
        'responses': {
            200: {
                'description': 'Login successful',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'token': {'type': 'string'},
                        'user': {'type': 'object'}
                    }
                }
            },
            401: {'description': 'Invalid credentials'}
        }
    })
    def post(self):
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            password = data.get('password')
            user = User.query.filter_by(email=email).first()
            if not user or not user.authenticate(password):
                return {'message': 'Invalid credentials'}, 401
            token = create_token(user.id)
            return {'token': token, 'user': user.to_dict()}, 200
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'message': str(e), 'trace': traceback.format_exc()}, 500
class LogoutResource(Resource):
    @login_required
    def post(self):
        # For JWT stored on client, "logout" is purely client‑side.
        return {'message': 'Logged out'}, 200
    
class CurrentUserResource(Resource):
    @swag_from({
        'tags': ['Authentication current user'],
        'summary': 'Get current user profile',
        'security': [{'Bearer': []}],
        'responses': {
            200: {
                'description': 'User data',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'user': {'type': 'object'}
                    }
                }
            },
            401: {'description': 'Unauthorized'}
        }
    })
    @login_required
    def get(self):
        # g.current_user is set by @login_required --remember
        return {'user': g.current_user.to_dict()}, 200
    
    @login_required
    def patch(self):
        """Update current user's profile (username, email, phone_number, profile_pic_url)."""
        data = request.get_json()
        user = g.current_user

        # Update allowed fields
        if 'username' in data:
            new_username = data['username'].strip().lower()
            if User.query.filter(User.id != user.id, User.username == new_username).first():
                return {'message': 'Username already taken'}, 400
            user.username = new_username
        if 'email' in data:
            new_email = data['email'].strip().lower()
            if User.query.filter(User.id != user.id, User.email == new_email).first():
                return {'message': 'Email already in use'}, 400
            user.email = new_email
        if 'phone_number' in data:
            user.phone_number = data['phone_number'] or None
        if 'profile_pic_url' in data:
            user.profile_pic_url = data['profile_pic_url']

        try:
            db.session.commit()
            return {'user': user.to_dict()}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 400
        
class ChangePasswordResource(Resource):
    @swag_from({
        'tag':['User Profile'],
        'summary':'Change current password',
        'security':[{'Bearer':[]}],
        'parameters':[{
            'name':'body',
            'in':'body',
            'requred':True,
            'schema':{
                'type':'object',
                'properties':{
                    'current_pwd':{'type':'string','format':'password'},
                    'new_pwd':{'type':'string','format':'password'},
                },
                'required':['current_pwd','new_pwd']
            }
        }],
        'responses':{
            200:{'description':'Password Updated'},
            400:{'description':'Missing Fields'},
            401:{'description':'Current password incorrect'}        
        }
    })
    @login_required
    def patch(self):
        data=request.get_json()
        current_pwd=data.get('current_pwd')
        new_pwd=data.get('new_pwd')
        
        if not current_pwd or not new_pwd:
            return {'message':'Current password and new password required'},400
        
        user=g.current_user
        if not user.authenticate(current_pwd):
            return {'message': 'Current password is incorrect'}, 401
        
        user.password=new_pwd
        db.session.commit()
        return {'message':'Password updated successfully'},200
    
class RequestResetCodeResource(Resource):
    @swag_from({
        'tags': ['Request password reset'],
        'summary': 'Request a password reset code (6-digit)',
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'email': {'type': 'string', 'example': 'user@example.com'}
                    },
                    'required': ['email']
                }
            }
        ],
        'responses': {
            200: {'description': 'Reset code sent (if email exists)'},
            400: {'description': 'Email missing'}
        }
    })
    def post(self):
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        if not email:
            return {'message': 'Email is required'}, 400

        user = User.query.filter_by(email=email).first()
        if user:
            code = PasswordReset.create_reset_code(email)
            send_password_reset_code_email(user.email, user.username, code)

        return {'message': 'If your email is registered, you will receive a reset code.'}, 200

class VerifyResetCodeResource(Resource):
    @swag_from({
        'tags': ['Verify Password Reset Code'],
        'summary': 'Verify the 6-digit code and get a reset token',
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'email': {'type': 'string'},
                        'code': {'type': 'string', 'example': '123456'}
                    },
                    'required': ['email', 'code']
                }
            }
        ],
        'responses': {
            200: {
                'description': 'Code verified',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'reset_token': {'type': 'string'}
                    }
                }
            },
            400: {'description': 'Invalid or expired code'}
        }
    })
    def post(self):
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        code = data.get('code', '').strip()

        if not email or not code:
            return {'message': 'Email and code are required'}, 400

        reset = PasswordReset.query.filter_by(email=email, code=code).first()
        if not reset or reset.expires_at < datetime.utcnow():
            return {'message': 'Invalid or expired code.'}, 400

        # Delete used code so it cannot be reused
        db.session.delete(reset)
        db.session.commit()

        # Create a short‑lived JWT token for the next step
        reset_token = jwt.encode(
            {'email': email, 'exp': datetime.utcnow() + timedelta(minutes=10)},
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        return {'message': 'Code verified', 'reset_token': reset_token}, 200

class ResetPasswordWithCodeResource(Resource):
    @swag_from({
        'tags': ['Password Reset'],
        'summary': 'Set new password using reset token',
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'email': {'type': 'string'},
                        'reset_token': {'type': 'string'},
                        'password': {'type': 'string', 'format': 'password'}
                    },
                    'required': ['email', 'reset_token', 'password']
                }
            }
        ],
        'responses': {
            200: {'description': 'Password updated'},
            400: {'description': 'Invalid or expired token'},
            404: {'description': 'User not found'}
        }
    })
    def post(self):
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        reset_token = data.get('reset_token')
        new_password = data.get('password')

        if not email or not reset_token or not new_password:
            return {'message': 'Email, reset token, and new password are required'}, 400

        try:
            payload = jwt.decode(reset_token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            if payload.get('email') != email:
                return {'message': 'Invalid reset token'}, 400
        except jwt.InvalidTokenError:
            return {'message': 'Invalid or expired reset token'}, 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return {'message': 'User not found'}, 404

        user.password = new_password
        db.session.commit()
        return {'message': 'Password updated successfully'}, 200


class UploadProfilePicResource(Resource):
    @swag_from({
        'tags': ['User Profile'],
        'summary': 'Upload a profile picture',
        'security': [{'Bearer': []}],
        'consumes': ['multipart/form-data'],
        'parameters': [
            {
                'name': 'profile_pic',
                'in': 'formData',
                'type': 'file',
                'required': True,
                'description': 'Image file (jpg, png, etc.)'
            }
        ],
        'responses': {
            200: {
                'description': 'Profile picture updated',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'profile_pic_url': {'type': 'string'}
                    }
                }
            },
            400: {'description': 'No file provided'},
            401: {'description': 'Unauthorized'}
        }
    })
    @login_required
    def post(self):
        """Upload a profile picture to Cloudinary and update user."""
        if 'profile_pic' not in request.files:
            return {'message': 'No file provided'}, 400

        file = request.files['profile_pic']
        if file.filename == '':
            return {'message': 'Empty filename'}, 400

        try:
            # Upload to Cloudinary (reuse your existing upload_image function)
            url = upload_image(file)   # make sure this returns the secure URL
            user = g.current_user
            user.profile_pic_url = url
            db.session.commit()
            return {'profile_pic_url': url}, 200
        except Exception as e:
            return {'message': str(e)}, 500