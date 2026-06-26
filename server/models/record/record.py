from ...config import db
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates

class Record(db.Model, SerializerMixin):
    __tablename__='records'
    
    serialize_rules=('-images.record', '-videos.record', '-user.records')
    
    id=db.Column(db.Integer, primary_key=True)
    user_id=db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type=db.Column(db.Enum('red flag', 'intervention', name='record_type'), nullable=False)
    title=db.Column(db.String(150), nullable=False)
    description=db.Column(db.Text, nullable=False)
    status=db.Column(db.Enum('pending', 'under investigation', 'rejected', 'resolved', name='record_status'), default='pending')
    latitude=db.Column(db.Float)
    longitude=db.Column(db.Float)
    created_at=db.Column(db.DateTime, server_default=db.func.now())
    updated_at=db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    images=db.relationship('Image', backref='record', cascade='all, delete-orphan')
    videos=db.relationship('Video', backref='record', cascade='all, delete-orphan')
    
    @validates('type')
    def validate_type(self,key,type):
        types=['red flag', 'intervention']
        if not type or type not in types:
            raise ValueError('Type needs to be present can only be either red flag or intevention')
        return type
    
    @validates('user_id')
    def validate_type(self,key,user_id):
        if not user_id:
            raise ValueError('User not verified!')
        return user_id
    
    @validates('status')
    def validate_status(self,key,status):
        status_accepted=['pending', 'under investigation', 'rejected', 'resolved']
        if not status or status not in status_accepted:
            raise ValueError('Status needs to be present and can only be either pending, under investigation, rejected or resolved')
        return status
    
    @validates('title', 'description')
    def validate_fields(self,key,value):
        if key=='title' or key=='description':
            if not value:
                raise ValueError(f'{key.capitalize()} needs to be present')
        return value