from django.urls import path
from .views import BulkPartCreateView, get_car_details

urlpatterns = [
    path('bulk-create/', BulkPartCreateView.as_view(), name='bulk-create-parts'),
    path('car-details/<int:car_id>/', get_car_details, name='car-details'),
]