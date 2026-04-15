from django.urls import path
from rest_framework import generics
from .models import Invoice
from .serializers import InvoiceSerializer
from .views import (
    UsedPartListCreateView, UsedPartDetailView, AftermarketListCreateView, 
    AftermarketDetailView, ImageUploadView, BulkDismantleView, 
    BusinessSummaryView, LowStockListView, DonorCarListCreateView, 
    DonorCarDetailView, GlobalSearchView, set_main_image, InvoiceListCreateView
)

urlpatterns = [
    path('donor-cars/', DonorCarListCreateView.as_view(), name='donor-cars'),
    path('donor-cars/<int:pk>/', DonorCarDetailView.as_view(), name='donor-car-detail'),
    path('used-parts/', UsedPartListCreateView.as_view(), name='used-parts-list'),
    path('used-parts/<int:pk>/', UsedPartDetailView.as_view(), name='used-part-detail'),
    path('bulk-create/', BulkDismantleView.as_view(), name='bulk-dismantle'),
    path('global-search/', GlobalSearchView.as_view(), name='global-search'),
    path('aftermarket/', AftermarketListCreateView.as_view(), name='aftermarket-list'),
    path('aftermarket/<int:pk>/', AftermarketDetailView.as_view(), name='aftermarket-detail'),
    path('low-stock/', LowStockListView.as_view(), name='low-stock-list'),
    path('images/upload/', ImageUploadView.as_view(), name='image-upload'),
    path('images/<int:image_id>/set-main/', set_main_image, name='set-main-image'),
    path('summary/', BusinessSummaryView.as_view(), name='business-summary'),
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', generics.RetrieveAPIView.as_view(queryset=Invoice.objects.all(), serializer_class=InvoiceSerializer), name='invoice-detail'),
]
