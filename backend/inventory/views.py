from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Sum, F, Q
from django.utils import timezone
from .models import *
from .serializers import *

# --- 1. DONOR CAR REGISTRY ---

class DonorCarListCreateView(generics.ListCreateAPIView):
    """ Handles Phase 1: Creating the Donor Car Profile """
    queryset = DonorCar.objects.all().order_by('-date_added')
    serializer_class = DonorCarSerializer

class DonorCarDetailView(generics.RetrieveUpdateDestroyAPIView):
    """ Handles Phase 6: Viewing specific car status and its parts """
    queryset = DonorCar.objects.all()
    serializer_class = DonorCarSerializer

# --- 2. INVENTORY: USED & AFTERMARKET ---

class UsedPartListCreateView(generics.ListCreateAPIView):
    queryset = InventoryItem.objects.all().order_by('-id')
    serializer_class = InventoryItemSerializer

class UsedPartDetailView(generics.RetrieveUpdateDestroyAPIView):
    """ Handles Phase 4: The Deep-Dive (Updating photos, price, grading) """
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
    """ Converts the Checklist selections into individual Database Parts """
    def post(self, request):
        car_id = request.data.get('car_id')
        parts = request.data.get('parts', [])  # Expected: [{part_name, category}]
        
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
                "message": f"Successfully generated {len(parts)} part labels for Stock# {car.stock_number}",
                "parts": created_parts
            }, status=status.HTTP_201_CREATED)
            
        except DonorCar.DoesNotExist:
            return Response({"error": "Donor Car not found"}, status=status.HTTP_404_NOT_FOUND)

# --- 4. GLOBAL SEARCH & FILTERING (PHASE 6) ---

class GlobalSearchView(APIView):
    """ The search engine for parts across VIN, Stock#, and Name """
    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"used": [], "aftermarket": []})

        # Search in Used Parts (InventoryItem)
        used_parts = InventoryItem.objects.filter(
            Q(part_name__icontains=query) | 
            Q(label_id__icontains=query) | 
            Q(donor_car__stock_number__icontains=query) |
            Q(donor_car__vin__icontains=query)
        ).distinct()[:50] 

        # Search in Aftermarket
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
    """ Handles Invoicing and GST calculations for Launceston operations """
    queryset = Invoice.objects.all().order_by('-date')
    serializer_class = InvoiceSerializer

    def perform_create(self, serializer):
        total = self.request.data.get('total_amount', 0)
        # Australian GST calculation (1/11th of total)
        gst = float(total) / 11 
        inv_no = f"INV-{timezone.now().strftime('%Y%m')}-{Invoice.objects.count() + 1000}"
        
        serializer.save(
            invoice_number=inv_no,
            gst_amount=round(gst, 2)
        )

# --- 6. BUSINESS INTELLIGENCE & IMAGES ---

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

# --- 7. IMAGE LOGIC (FIXES RAILWAY CRASH) ---

@api_view(['POST'])
def set_main_image(request, image_id):
    """ Sets a specific image as 'is_main' and resets others for that part """
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
