from ....routes.create_blueprint import api_v1
from .user_routes import *

api_v1.add_resource(
    LoginResource,
    '/auth/login',
    endpoint='/auth/login'
)

api_v1.add_resource(
    LogoutResource,
    '/auth/logout',
    endpoint='/auth/logout'
)

api_v1.add_resource(
    SignupResource,
    '/auth/signup',
    endpoint='/auth/signup'
)

api_v1.add_resource(
    CurrentUserResource,
    '/auth/me',
    endpoint='auth/me'
)

api_v1.add_resource(
    RequestResetCodeResource, 
    '/auth/forgot-password',
    endpoint='/auth/forgot-password'
)

api_v1.add_resource(
    VerifyResetCodeResource, 
    '/auth/verify-reset-code',
    endpoint='/auth/verify-reset-code'
)

api_v1.add_resource(
    ResetPasswordWithCodeResource, 
    '/auth/reset-password',
    endpoint='/auth/reset-password'
)

api_v1.add_resource(
    UploadProfilePicResource, 
    '/auth/me/profile-pic', 
    endpoint='users_me_profile_pic'
)

api_v1.add_resource(
    ChangePasswordResource,
    '/auth/me/password',
    endpoint='/auth/me/password'
)