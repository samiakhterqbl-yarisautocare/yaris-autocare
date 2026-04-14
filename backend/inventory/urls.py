from django.urls import path
from rest_framework import generics
from .models import DonorCar, Invoice
from .serializers import DonorCarSerializer, InvoiceSerializer
from .views import *

urlpatterns = [
    # --- 1. DONOR CARS (PHASE 1 & 6) ---
    # We use the explicit views from views.py to handle the ordering and logic
    path('donor-cars/', DonorCarListCreateView.as_view(), name='donor-cars'),
    path('donor-cars/<int:pk>/', DonorCarDetailView.as_view(), name='donor-car-detail'),

    # --- 2. USED PARTS (PHASE 4 & 5) ---
    path('used-parts/', UsedPartListCreateView.as_view(), name='used-parts-list'),
    path('used-parts/<int:pk>/', UsedPartDetailView.as_view(), name='used-part-detail'),

    # --- 3. DISMANTLE ENGINE (PHASE 2) ---
    # This matches the endpoint your frontend will call to save 20+ parts at once
    path('bulk-create/', BulkDismantleView.as_view(), name='bulk-dismantle'),

    # --- 4. GLOBAL SEARCH (PHASE 4 & 6) ---
    # The new "Strong Search" engine
    path('global-search/', GlobalSearchView.as_view(), name='global-search'),

    # --- 5. AFTERMARKET NEW PARTS ---
    path('aftermarket/', AftermarketListCreateView.as_view(), name='aftermarket-list'),
    path('aftermarket/<int:pk>/', AftermarketDetailView.as_view(), name='aftermarket-detail'),
    path('low-stock/', LowStockListView.as_view(), name='low-stock-list'),

    # --- 6. IMAGE MANAGEMENT (AWS S3) ---
    path('images/upload/', ImageUploadView.as_view(), name='image-upload'),
    path('images/<int:image_id>/set-main/', set_main_image, name='set-main-image'),

    # --- 7. BUSINESS OPERATIONS & SALES ---
    path('summary/', BusinessSummaryView.as_view(), name='business-summary'),
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', generics.RetrieveAPIView.as_view(queryset=Invoice.objects.all(), serializer_class=InvoiceSerializer), name='invoice-detail'),
]
