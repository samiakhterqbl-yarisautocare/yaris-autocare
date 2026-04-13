from django.urls import path
from .views import *

urlpatterns = [
    # --- 1. USED PARTS & DONOR CARS ---
    path('used-parts/', UsedPartListCreateView.as_view(), name='used-parts-list'),
    path('used-parts/<int:pk>/', UsedPartDetailView.as_view(), name='used-part-detail'),
    path('donor-cars/', generics.ListCreateAPIView.as_view(queryset=DonorCar.objects.all(), serializer_class=DonorCarSerializer), name='donor-cars'),
    path('donor-cars/<int:pk>/', generics.RetrieveUpdateDestroyAPIView.as_view(queryset=DonorCar.objects.all(), serializer_class=DonorCarSerializer), name='donor-car-detail'),

    # --- 2. AFTERMARKET NEW PARTS ---
    path('aftermarket/', AftermarketListCreateView.as_view(), name='aftermarket-list'),
    path('aftermarket/<int:pk>/', AftermarketDetailView.as_view(), name='aftermarket-detail'),
    
    # --- 3. IMAGE MANAGEMENT ---
    path('images/upload/', ImageUploadView.as_view(), name='image-upload'),
    path('images/<int:image_id>/set-main/', set_main_image, name='set-main-image'),

    # --- 4. BUSINESS OPERATIONS ---
    path('summary/', BusinessSummaryView.as_view(), name='business-summary'),
    path('low-stock/', LowStockListView.as_view(), name='low-stock-list'),
    path('bulk-create/', BulkDismantleView.as_view(), name='bulk-dismantle'), # Matches your frontend call

    # --- 5. SALES & INVOICING ---
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', generics.RetrieveAPIView.as_view(queryset=Invoice.objects.all(), serializer_class=InvoiceSerializer), name='invoice-detail'),
]
