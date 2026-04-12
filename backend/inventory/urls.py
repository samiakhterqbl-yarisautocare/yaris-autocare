from django.urls import path
from .views import BulkPartCreateView, get_car_details, PartCreateView

urlpatterns = [
    # This must match your React Axios call
    path('parts/', PartCreateView.as_view(), name='create-part'), 
    path('bulk-create/', BulkPartCreateView.as_view(), name='bulk-create-parts'),
    path('car-details/<int:car_id>/', get_car_details, name='car-details'),
]
