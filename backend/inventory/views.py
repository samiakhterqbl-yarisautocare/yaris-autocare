from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser # ADDED
from django.db.models import Sum, F, Q
from django.utils import timezone
from .models import *
from .serializers import *

# --- 1. DONOR CAR REGISTRY ---

class DonorCarListCreateView(generics.ListCreateAPIView):
    """ Handles Phase 1: Creating the Donor Car Profile with S3 Photos """
    queryset = DonorCar.objects.all().order_by('-date_added')
    serializer_class = DonorCarSerializer
    # FIXED: Added parsers so request.FILES actually works
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        # We handle FormData manually to extract images
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            donor_car = serializer.save()
            
            # Extract images sent from the terminal's "ADD CAR PHOTOS" button
            images = request.FILES.getlist('images')
            for index, img in enumerate(images):
                ProductImage.objects.create(
                    donor_car=donor_car,
                    image=img,
                    is_main=(index == 0) # Automatically set first photo as main
                )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DonorCarDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DonorCar.objects.all()
    serializer_class = DonorCarSerializer
    parser_classes = (MultiPartParser, FormParser) # Added for updates

# --- 2. INVENTORY: USED & AFTERMARKET ---

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

# --- 3. DISMANTLE ENGINE (PHASE 2: BULK CREATION) ---

class BulkDismantleView(APIView):
    """ Converts checklist selections into individual Part items """
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
                "message": f"Successfully generated {len(parts)} labels for {car.stock_number}",
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
            Q(part_name__icontains=query) | 
            Q(label_id__icontains=query) | 
            Q(donor_car__stock_number__icontains=query) |
            Q(donor_car__vin__icontains=query)
        ).distinct()[:50] 

        new_parts = AftermarketPart.objects.filter(
            Q(part_name__icontains=query) | 
            Q(sku__icontains=query)
        ).distinct()[:50]

        return Response({
            "used": InventoryItemSerializer(used_parts, many=True).data,
            "aftermarket": AftermarketPartSerializer(new_parts, many=True).data
        })

# --- 5. SALES & INVOICING ---

class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all().order_by('-date')
    serializer_class = InvoiceSerializer

    def perform_create(self, serializer):
        total = self.request.data.get('total_amount', 0)
        gst = float(total) / 11 
        inv_no = f"INV-{timezone.now().strftime('%Y%m')}-{Invoice.objects.count() + 1000}"
        
        serializer.save(
            invoice_number=inv_no,
            gst_amount=round(gst, 2)
        )

# --- 6. BUSINESS SUMMARY ---

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

class ImageUploadView(generics.CreateAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    parser_classes = (MultiPartParser, FormParser) # Added for S3 uploads

# --- 7. IMAGE LOGIC ---

@api_view(['POST'])
def set_main_image(request, image_id):
    try:
        image = ProductImage.objects.get(id=image_id)
        part = image.inventory_item 
        
        if part:
            ProductImage.objects.filter(inventory_item=part).update(is_main=False)
            image.is_main = True
            image.save()
            return Response({"status": "Success", "message": "Main image updated"})
        return Response({"error": "Image is not linked to a part"}, status=status.HTTP_400_BAD_REQUEST)
        
    except ProductImage.DoesNotExist:
        return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)
