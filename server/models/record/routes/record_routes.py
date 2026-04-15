from flask import request,g, make_response
from flask_restful import Resource
from ....utils.auth import login_required, admin_required, can_edit_record
from ... import Record
from ....config import db
from werkzeug.exceptions import Forbidden
from ....services.email_service import send_status_update_email
from ....services.sms_service import sms_service
from flasgger import swag_from

class RecordResource(Resource):
    @swag_from({
        'tags': ['Update Record'],
        'summary': 'Update a record',
        'security': [{'Bearer': []}],
        'parameters': [
            {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
            {
                'name': 'body',
                'in': 'body',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'title': {'type': 'string'},
                        'description': {'type': 'string'},
                        'latitude': {'type': 'number'},
                        'longitude': {'type': 'number'}
                    }
                }
            }
        ],
        'responses': {
            200: {'description': 'Record updated'},
            401: {'description': 'Unauthorized'},
            403: {'description': 'Forbidden (not owner or status not pending)'},
            404: {'description': 'Record not found'}
        }
    })
    @login_required
    def patch(self,id):
        record=db.session.get(Record,id)
        if not record:
            return {'message':'Record not found!'},404
        if not can_edit_record(record,g.current_user):
            return {'message':'Not allowed to edit this record'},403
        
        for field,value in request.json.items():
            if hasattr(record,field):
                if field =='status':
                    raise Forbidden('Admin privileges required')
                setattr(record,field,value)
        
        try:
            db.session.commit()
            return make_response({'data':record.to_dict()},200)
        except Exception as e:
            db.session.rollback()
            return {'message':[str(e)]}
    
    @login_required
    def delete(self,id):
        record=db.session.get(Record,id)
        if not record:
            return {'message':'Record not found!'},404
        if not can_edit_record(record,g.current_user):
            return {'message':'Not allowed to edit this record'},403
        
        db.session.delete(record)
        db.session.commit()
        
        return make_response({},204)

class RecordCreateResource(Resource):
    @swag_from({
        'tags': ['Create Record'],
        'summary': 'Create a new report',
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'title': {'type': 'string', 'example': 'Corruption at City Hall'},
                        'description': {'type': 'string', 'example': 'Detailed description...'},
                        'type': {'type': 'string', 'enum': ['red flag', 'intervention']},
                        'latitude': {'type': 'number', 'format': 'float'},
                        'longitude': {'type': 'number', 'format': 'float'}
                    },
                    'required': ['title', 'description', 'type']
                }
            }
        ],
        'responses': {
            201: {'description': 'Report created'},
            400: {'description': 'Invalid input'},
            401: {'description': 'Unauthorized'}
        }
    })
    @login_required
    def post(self):
        data=request.get_json()
        record=Record(
            user_id=g.current_user.id,
            title=data.get('title'),
            description=data.get('description'),
            type=data.get('type'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            status='pending'
        )
        try:
            db.session.add(record)
            db.session.commit()
            return make_response({'data':record.to_dict()},201)
        except Exception as e:
            db.session.rollback()
            print(f"Record creation error: {e}")
            return {'message':str(e)},400

class AdminRecordResource(Resource):
    @swag_from({
        'tags': ['Admin record update'],
        'summary': 'Change status of a record (admin only)',
        'security': [{'Bearer': []}],
        'parameters': [
            {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'status': {
                            'type': 'string',
                            'enum': ['pending', 'under investigation', 'rejected', 'resolved']
                        }
                    },
                    'required': ['status']
                }
            }
        ],
        'responses': {
            200: {'description': 'Status updated (email and SMS sent)'},
            400: {'description': 'Invalid status value'},
            401: {'description': 'Unauthorized'},
            403: {'description': 'Forbidden (admin only)'},
            404: {'description': 'Record not found'}
        }
    })
    @admin_required 
    def patch(self, id):
        record = db.session.get(Record, id)
        if not record:
            return {'message': 'Record not found!'}, 404
        
        data = request.get_json()
        if 'status' not in data:
            return {'message': 'Only status field can be updated'}, 400
        new_status = data['status']

        try:
            setattr(record, 'status', new_status)
            db.session.commit()
            
            try:
                send_status_update_email(
                    recipient_email=record.user.email,
                    recipient_name=record.user.username,
                    record_title=record.title,
                    new_status=new_status
                )
            except Exception as e:
                # Log the message but don't break the response
                print(f"Email failed: {e}")
            
            if record.user.phone_number:
                message = f"ℹ️ IReporter: Status of report '{record.title}' changed to '{new_status}'."
                try:
                    sms_service.send_sms(record.user.phone_number, message)
                except Exception as e:
                    print(f"SMS failed: {e}")
            else:
                print(f'SMS not sent: User {record.user.username} has no phone number')
            
            return make_response({'data': record.to_dict()}, 200)
        except ValueError as e:
            return {'message': str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {'message': [str(e)]}, 400
