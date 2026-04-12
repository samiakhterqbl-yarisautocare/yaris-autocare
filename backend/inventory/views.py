from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import api_view
from .models import DonorCar, InventoryItem, AftermarketPart  # Added AftermarketPart
from .serializers import DonorCarSerializer, InventoryItemSerializer, AftermarketPartSerializer # Added AftermarketPartSerializer

# --- AFTERMARKET NEW PARTS ---
# This matches your AftermarketNewPage.jsx button
class AftermarketPartCreateView(generics.CreateAPIView):
    queryset = AftermarketPart.objects.all()
    serializer_class = AftermarketPartSerializer

# --- USED/SALVAGED PARTS ---
# View for adding single used items
class PartCreateView(generics.CreateAPIView):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer

# Existing Bulk Create View for Donor Cars
class BulkPartCreateView(APIView):
    def post(self, request):
        car_id = request.data.get('car_id')
        parts_list = request.data.get('parts', [])
        price = request.data.get('price', 0)
        condition = request.data.get('condition', 'Used') # Default to 'Used' based on your model
        
        try:
            car = DonorCar.objects.get(id=car_id)
            for part_name in parts_list:
                InventoryItem.objects.create(
                    donor_car=car,
                    part_name=part_name,
                    category="Uncategorized",
                    status="For Sale",
                    price=price,
                    condition=condition
                )
            return Response({"message": f"Successfully created {len(parts_list)} parts"}, status=status.HTTP_201_CREATED)
        except DonorCar.DoesNotExist:
            return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)

# --- UTILITY VIEWS ---
@api_view(['GET'])
def get_car_details(request, car_id):
    try:
        car = DonorCar.objects.get(id=car_id)
        return Response({
            "model": car.model,
            "year": car.year,
            "color": car.color,
            "stock_number": car.stock_number
        })
    except DonorCar.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)
