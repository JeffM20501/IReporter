from flask import request
from flask_restful import Resource
from server.services.cloudinary import upload_image, upload_video
from server.models.image.image import Image
from server.models.video.video import Video
from server.config import db
from flasgger import swag_from

class UploadImage(Resource):
    @swag_from({
        'tags': ['Image'],
        'summary': 'Upload an image for a record',
        'security': [{'Bearer': []}],
        'consumes': ['multipart/form-data'],
        'parameters': [
            {
                'name': 'record_id',
                'in': 'formData',
                'type': 'integer',
                'required': True,
                'description': 'ID of the record to attach the image to'
            },
            {
                'name': 'image',
                'in': 'formData',
                'type': 'file',
                'required': True,
                'description': 'Image file (max 8MB)'
            }
        ],
        'responses': {
            201: {
                'description': 'Image uploaded',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'data': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'integer'},
                                'image_url': {'type': 'string'}
                            }
                        }
                    }
                }
            },
            400: {'description': 'Missing file or record_id'},
            401: {'description': 'Unauthorized'},
            404: {'description': 'Record not found or not owned by user'}
        }
    })
    def post(self):
        file = request.files.get('image')
        record_id = request.form.get('record_id')

        if not file or not record_id:
            return {"message": "Missing file or record_id"}, 400

        url = upload_image(file)

        image = Image(image_url=url, record_id=record_id)
        db.session.add(image)
        db.session.commit()

        return {"data": {"id": image.id, "image_url": image.image_url}}, 201


class UploadVideo(Resource):
    @swag_from({
        'tags': ['Video'],
        'summary': 'Upload a video for a record',
        'security': [{'Bearer': []}],
        'consumes': ['multipart/form-data'],
        'parameters': [
            {
                'name': 'record_id',
                'in': 'formData',
                'type': 'integer',
                'required': True,
                'description': 'ID of the record to attach the video to'
            },
            {
                'name': 'video',
                'in': 'formData',
                'type': 'file',
                'required': True,
                'description': 'Video file (max 100MB)'
            }
        ],
        'responses': {
            201: {
                'description': 'Video uploaded',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'data': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'integer'},
                                'video_url': {'type': 'string'}
                            }
                        }
                    }
                }
            },
            400: {'description': 'Missing file or record_id'},
            401: {'description': 'Unauthorized'},
            404: {'description': 'Record not found or not owned by user'}
        }
    })
    def post(self):
        file = request.files.get('video')
        record_id = request.form.get('record_id')

        if not file or not record_id:
            return {"message": "Missing file or record_id"}, 400

        url = upload_video(file)

        video = Video(video_url=url, record_id=record_id)
        db.session.add(video)
        db.session.commit()

        return {"data": {"id": video.id, "video_url": video.video_url}}, 201