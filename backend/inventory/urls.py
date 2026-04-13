from django.urls import path
from .views import *

urlpatterns = [
    # Inventory
    path('used-parts/', UsedPartListCreateView.as_view()),
    path('used-parts/<int:pk>/', generics.RetrieveUpdateDestroyAPIView.as_view(queryset=InventoryItem.objects.all(), serializer_class=InventoryItemSerializer)),
    path('aftermarket/', AftermarketListCreateView.as_view()),
    path('aftermarket/<int:pk>/', generics.RetrieveUpdateDestroyAPIView.as_view(queryset=AftermarketPart.objects.all(), serializer_class=AftermarketPartSerializer)),
    
    # Operations
    path('summary/', BusinessSummaryView.as_view()),
    path('low-stock/', LowStockListView.as_view()),
    path('bulk-dismantle/', BulkDismantleView.as_view()),
    path('donor-cars/', generics.ListCreateAPIView.as_view(queryset=DonorCar.objects.all(), serializer_class=DonorCarSerializer)),
    
    # Sales
    path('invoices/', InvoiceListCreateView.as_view()),
]
