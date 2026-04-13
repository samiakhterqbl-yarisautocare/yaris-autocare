from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, F
from .models import *
from .serializers import *

# --- INVENTORY VIEWS ---
class UsedPartListCreateView(generics.ListCreateAPIView):
    queryset = InventoryItem.objects.all().order_by('-id')
    serializer_class = InventoryItemSerializer

class AftermarketListCreateView(generics.ListCreateAPIView):
    queryset = AftermarketPart.objects.all().order_by('-id')
    serializer_class = AftermarketPartSerializer

# --- LOW STOCK ALERT ---
class LowStockListView(generics.ListAPIView):
    serializer_class = AftermarketPartSerializer
    def get_queryset(self):
        return AftermarketPart.objects.filter(quantity__lte=F('min_stock_level'))

# --- BUSINESS SUMMARY ---
class BusinessSummaryView(APIView):
    def get(self, request):
        revenue = Invoice.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        used_count = InventoryItem.objects.count()
        new_count = AftermarketPart.objects.count()
        return Response({
            "total_revenue": revenue,
            "used_parts_in_stock": used_count,
            "new_parts_in_stock": new_count
        })

# --- BULK DISMANTLE ---
class BulkDismantleView(APIView):
    def post(self, request):
        car_id = request.data.get('car_id')
        parts = request.data.get('parts', []) # Expected: [{part_name, price, category}]
        car = DonorCar.objects.get(id=car_id)
        for p in parts:
            InventoryItem.objects.create(
                donor_car=car, part_name=p['part_name'], 
                price=p['price'], category=p['category'], condition="Used"
            )
        return Response({"status": "Car dismantled successfully"}, status=status.HTTP_201_CREATED)

# --- INVOICING ---
class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
