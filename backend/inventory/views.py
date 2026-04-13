from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import DonorCar, InventoryItem, AftermarketPart
from .serializers import DonorCarSerializer, InventoryItemSerializer, AftermarketPartSerializer

# --- USED PARTS ---
class UsedPartListCreateView(generics.ListCreateAPIView):
    queryset = InventoryItem.objects.all().order_by('-id')
    serializer_class = InventoryItemSerializer

class UsedPartDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer

# --- AFTERMARKET ---
class AftermarketListCreateView(generics.ListCreateAPIView):
    queryset = AftermarketPart.objects.all().order_by('-id')
    serializer_class = AftermarketPartSerializer

class AftermarketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AftermarketPart.objects.all()
    serializer_class = AftermarketPartSerializer

# --- DISMANTLE & CARS ---
class DonorCarListView(generics.ListCreateAPIView):
    queryset = DonorCar.objects.all().order_by('-date_added')
    serializer_class = DonorCarSerializer

class BulkPartCreateView(APIView):
    def post(self, request):
        car_id = request.data.get('car_id')
        parts = request.data.get('parts', [])
        try:
            car = DonorCar.objects.get(id=car_id)
            for p in parts:
                InventoryItem.objects.create(
                    donor_car=car, 
                    part_name=p.get('part_name'), 
                    price=p.get('price', 0), 
                    category=p.get('category', 'Uncategorized'), 
                    condition=p.get('condition', 'Used')
                )
            return Response({"message": "Success"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
