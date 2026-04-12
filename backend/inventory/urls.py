from django.urls import path
from .views import (
    AftermarketPartCreateView, 
    BulkPartCreateView, 
    get_car_details,
    PartCreateView
)

urlpatterns = [
    # 1. This matches your React AftermarketNewPage (axios.post to /api/parts/)
    path('parts/', AftermarketPartCreateView.as_view(), name='create-aftermarket-part'), 
    
    # 2. This is for adding used parts (if you use it later)
    path('used-parts/', PartCreateView.as_view(), name='create-used-part'),
    
    # 3. Existing Donor Car routes
    path('bulk-create/', BulkPartCreateView.as_view(), name='bulk-create-parts'),
    path('car-details/<int:car_id>/', get_car_details, name='car-details'),
]
