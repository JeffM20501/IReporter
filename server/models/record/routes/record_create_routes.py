from ....routes.create_blueprint import api_v1
from .record_routes import *


api_v1.add_resource(
    RecordResource,
    '/records/me/<int:id>',
    endpoint='/records/me/<int:id>',
)

api_v1.add_resource(
    AdminRecordResource,
    '/admin/records/<int:id>/status',
    endpoint='/admin/records/<int:id>/status'
)

api_v1.add_resource(
    RecordCreateResource,
    '/records/create',
    endpoint='/records/create'
)

api_v1.add_resource(
    RecentReportResource,
    '/public/recent-reports',
    endpoint='/public/recent-reports'
)