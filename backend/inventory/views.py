from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Sum, F
from django.utils import timezone
from .models import *
from .serializers import *

# --- 1. INVENTORY: USED & AFTERMARKET ---

class UsedPartListCreateView(generics.ListCreateAPIView):
    queryset = InventoryItem.objects.all().order_by('-id')
    serializer_class = InventoryItemSerializer

class UsedPartDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer

class AftermarketListCreateView(generics.ListCreateAPIView):
    queryset = AftermarketPart.objects.all().order_by('-id')
    serializer_class = AftermarketPartSerializer

class AftermarketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AftermarketPart.objects.all()
    serializer_class = AftermarketPartSerializer

# --- 2. IMAGE MANAGEMENT (AWS S3) ---

class ImageUploadView(generics.CreateAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer

@api_view(['POST'])
def set_main_image(request, image_id):
    """ Toggles the 'is_main' flag for a specific image and clears others for that part """
    try:
        image = ProductImage.objects.get(id=image_id)
        # Clear main flag for all other images of this part
        if image.inventory_item:
            ProductImage.objects.filter(inventory_item=image.inventory_item).update(is_main=False)
        elif image.aftermarket_part:
            ProductImage.objects.filter(aftermarket_part=image.aftermarket_part).update(is_main=False)
        
        image.is_main = True
        image.save()
        return Response({"status": "Main image set successfully"})
    except ProductImage.DoesNotExist:
        return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)

# --- 3. DISMANTLE ENGINE (BULK CREATION) ---

class BulkDismantleView(APIView):
    def post(self, request):
        car_id = request.data.get('car_id')
        parts = request.data.get('parts', [])  # Expected: [{part_name, price, category, grading}]
        try:
            car = DonorCar.objects.get(id=car_id)
            created_parts = []
            for p in parts:
                item = InventoryItem.objects.create(
                    donor_car=car,
                    part_name=p['part_name'],
                    price=p.get('price', 0),
                    category=p.get('category', 'General'),
                    grading=p.get('grading', 'A'), # Default to Grade A
                    usage_type="Sale"
                )
                created_parts.append(item.id)
            return Response({
                "status": "Success",
                "message": f"Dismantled {len(parts)} parts from {car.stock_number}",
                "part_ids": created_parts
            }, status=status.HTTP_201_CREATED)
        except DonorCar.DoesNotExist:
            return Response({"error": "Donor Car not found"}, status=status.HTTP_404_NOT_FOUND)

# --- 4. SALES & INVOICING ENGINE ---

class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all().order_by('-date')
    serializer_class = InvoiceSerializer

    def perform_create(self, serializer):
        # Auto-calculate GST (10%) and generate Invoice Number
        total = self.request.data.get('total_amount', 0)
        gst = float(total) / 11  # Standard Australian GST calculation
        inv_no = f"INV-{timezone.now().strftime('%Y%m%d')}-{Invoice.objects.count() + 1}"
        
        serializer.save(
            invoice_number=inv_no,
            gst_amount=round(gst, 2)
        )

# --- 5. BUSINESS INTELLIGENCE (SUMMARY) ---

class BusinessSummaryView(APIView):
    def get(self, request):
        revenue = Invoice.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        used_count = InventoryItem.objects.count()
        new_count = AftermarketPart.objects.count()
        low_stock = AftermarketPart.objects.filter(quantity__lte=F('min_stock_level')).count()
        
        return Response({
            "total_revenue": revenue,
            "used_parts_count": used_count,
            "aftermarket_count": new_count,
            "low_stock_alerts": low_stock
        })

class LowStockListView(generics.ListAPIView):
    serializer_class = AftermarketPartSerializer
    def get_queryset(self):
        return AftermarketPart.objects.filter(quantity__lte=F('min_stock_level'))
