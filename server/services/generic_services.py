from flask import request, session, make_response
from flask_restful import Resource,abort
from ..config import db
from flasgger import swag_from
class AllResource(Resource):
    def __init__(self, model, resource='items', rules=[]):
        super().__init__()
        self.Model=model
        self.resource=resource
        self.rules=rules
    
    @swag_from({
        'tags': ['Records'],
        'summary': 'Get all records',
        'description': 'Returns a paginated list of all records.',
        'parameters': [
            {
                'name': 'per_page',
                'in': 'query',
                'type': 'integer',
                'default': 10,
                'description': 'Number of records per page'
            },
            {
                'name': 'page',
                'in': 'query',
                'type': 'integer',
                'default': 1,
                'description': 'Page number'
            }
        ],
        'responses': {
            200: {
                'description': 'Successful response',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'data': {'type': 'array', 'items': {'type': 'object'}},
                        'total': {'type': 'integer'}
                    }
                }
            },
            401: {'description': 'Authentication required'}
        }
    })
    
    def get(self):
        per_page=int(request.args.get('per_page',10))
        page=int(request.args.get('page',1))
        
        try:
            query = self.Model.query.order_by(self.Model.id.desc()).limit(per_page).offset((page-1)*per_page)
            total_count=self.Model.query.count()
            
            items_dict=[i.to_dict()for i in query.all()]
            
            return make_response({
                'data':items_dict,
                'total':total_count
            },200)
        except Exception as e: 
            return {'message':[str(e)]},400
    
    @swag_from({
        'tags': ['Generic'],
        'summary': 'Create a new item (generic)',
        'security': [{'Bearer': []}],
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'description': 'Item fields (varies by model)'
                }
            }
        ],
        'responses': {
            201: {'description': 'Item created'},
            400: {'description': 'Invalid input'},
            401: {'description': 'Unauthorized'}
        }
    })
    def post(self):
        item=self.Model()
        
        try:
            for field,value in request.json.items():
                setattr(item,field,value)
            db.session.add(item)
            db.session.commit()
            return make_response({'data':item.to_dict(rules=self.rules)},201)
        except Exception as e:
            db.session.rollback()
            return {'message':[str(e)]},400
    

class SingleResource(Resource):
    def __init__(self,model,resource='itmes',rules=[]):
        super().__init__()
        self.Model=model
        self.resource=resource
        self.rules=rules
        
        
        
    @swag_from({
        'tags': ['Generic'],
        'summary': 'Get a single item by ID',
        'security': [{'Bearer': []}],
        'parameters': [
            {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}
        ],
        'responses': {
            200: {'description': 'Item found'},
            401: {'description': 'Unauthorized'},
            404: {'description': 'Item not found'}
        }
    })
    def get(self,id):
        item = db.session.get(self.Model, id)
        
        if not item: 
            abort(404,message=f'{self.resource} not found.')
        
        return make_response({'data':item.to_dict()},200)
    
    @swag_from({
        'tags': ['Generic'],
        'summary': 'Update an item by ID',
        'security': [{'Bearer': []}],
        'parameters': [
            {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'description': 'Fields to update'
                }
            }
        ],
        'responses': {
            200: {'description': 'Item updated'},
            400: {'description': 'Invalid input'},
            401: {'description': 'Unauthorized'},
            404: {'description': 'Item not found'}
        }
    })
    def patch(self,id):
        item = db.session.get(self.Model, id)
        
        if not item:
            abort(404,message=f'{self.resource} not found')
        
        for field,value in request.json.items():
            if hasattr(item,field):
                setattr(item,field,value)
        
        try:
            db.session.commit()
            return make_response({'data':item.to_dict()},200)
        except Exception as e:
            db.session.rollback()
            return {'message':[str(e)]}
    
    @swag_from({
        'tags': ['Generic'],
        'summary': 'Delete an item by ID',
        'security': [{'Bearer': []}],
        'parameters': [
            {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}
        ],
        'responses': {
            204: {'description': 'Item deleted (no content)'},
            401: {'description': 'Unauthorized'},
            404: {'description': 'Item not found'}
        }
    })
    def delete(self,id):
        item = db.session.get(self.Model, id)
        
        if not item:
            abort(404,message=f'{self.resource} not found')
        
        db.session.delete(item)
        db.session.commit()
        
        return make_response({},204)
    