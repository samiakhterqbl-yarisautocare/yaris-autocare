from django.urls import path
from .views import *

urlpatterns = [
    # Aftermarket
    path('aftermarket/', AftermarketListCreateView.as_view()),
    path('aftermarket/<int:pk>/', AftermarketDetailView.as_view()),
    
    # Used Parts
    path('used-parts/', UsedPartListCreateView.as_view()),
    path('used-parts/<int:pk>/', UsedPartDetailView.as_view()),
    
    # Cars & Dismantle
    path('donor-cars/', DonorCarListView.as_view()),
    path('bulk-create/', BulkPartCreateView.as_view()),
]
