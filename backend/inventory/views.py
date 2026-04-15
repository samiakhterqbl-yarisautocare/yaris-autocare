from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Sum, F, Q
from django.utils import timezone
from .models import *
from .serializers import *

# --- 1. DONOR CAR REGISTRY ---
class DonorCarListCreateView(generics.ListCreateAPIView):
    queryset = DonorCar.objects.all().order_by('-date_added')
    serializer_class = DonorCarSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            donor_car = serializer.save()
            
            # Match the 'images' key used in DismantleModule.jsx
            images = request.FILES.getlist('images')
            for index, img in enumerate(images):
                ProductImage.objects.create(
                    donor_car=None, # To be linked via inventory_item if needed later
                    image=img,
                    is_main=(index == 0)
                )
            # If you specifically want images linked to the DonorCar model, 
            # ensure your model has a ForeignKey for it. 
            # For now, this saves them to S3 as requested.
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DonorCarDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DonorCar.objects.all()
    serializer_class = DonorCarSerializer
    parser_classes = (MultiPartParser, FormParser)

# --- 2. INVENTORY ---
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

# --- 3. DISMANTLE ENGINE ---
class BulkDismantleView(APIView):
    def post(self, request):
        car_id = request.data.get('car_id')
        parts = request.data.get('parts', [])
        try:
            car = DonorCar.objects.get(id=car_id)
            created_parts = []
            for p in parts:
                item = InventoryItem.objects.create(
                    donor_car=car,
                    part_name=p['part_name'],
                    category=p.get('category', 'General'),
                    status='Available',
                    usage_type='Sale'
                )
                created_parts.append(InventoryItemSerializer(item).data)
            return Response({
                "status": "Success",
                "message": f"Successfully generated {len(parts)} labels",
                "parts": created_parts
            }, status=status.HTTP_201_CREATED)
        except DonorCar.DoesNotExist:
            return Response({"error": "Donor Car not found"}, status=status.HTTP_404_NOT_FOUND)

# --- 4. GLOBAL SEARCH ---
class GlobalSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"used": [], "aftermarket": []})
        used_parts = InventoryItem.objects.filter(
            Q(part_name__icontains=query) | Q(label_id__icontains=query) | 
            Q(donor_car__stock_number__icontains=query) | Q(donor_car__vin__icontains=query)
        ).distinct()[:50] 
        new_parts = AftermarketPart.objects.filter(
            Q(part_name__icontains=query) | Q(sku__icontains=query)
        ).distinct()[:50]
        return Response({
            "used": InventoryItemSerializer(used_parts, many=True).data,
            "aftermarket": AftermarketPartSerializer(new_parts, many=True).data
        })

# --- 5. BUSINESS LOGIC ---
class BusinessSummaryView(APIView):
    def get(self, request):
        revenue = Invoice.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        return Response({
            "total_revenue": float(revenue),
            "used_parts_count": InventoryItem.objects.count(),
            "aftermarket_count": AftermarketPart.objects.count(),
            "low_stock_alerts": AftermarketPart.objects.filter(quantity__lte=F('min_stock_level')).count()
        })

class LowStockListView(generics.ListAPIView):
    serializer_class = AftermarketPartSerializer
    def get_queryset(self):
        return AftermarketPart.objects.filter(quantity__lte=F('min_stock_level'))

class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all().order_by('-date')
    serializer_class = InvoiceSerializer
    def perform_create(self, serializer):
        total = self.request.data.get('total_amount', 0)
        gst = float(total) / 11 
        inv_no = f"INV-{timezone.now().strftime('%Y%m%d')}-{Invoice.objects.count() + 1}"
        serializer.save(invoice_number=inv_no, gst_amount=round(gst, 2))

class ImageUploadView(generics.CreateAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    parser_classes = (MultiPartParser, FormParser)

@api_view(['POST'])
def set_main_image(request, image_id):
    try:
        image = ProductImage.objects.get(id=image_id)
        if image.inventory_item:
            ProductImage.objects.filter(inventory_item=image.inventory_item).update(is_main=False)
            image.is_main = True
            image.save()
            return Response({"status": "Success"})
        return Response({"error": "No linked item"}, status=400)
    except ProductImage.DoesNotExist:
        return Response({"status": "Error"}, status=404)
