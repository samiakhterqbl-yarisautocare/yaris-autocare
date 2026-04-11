from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import DonorCar, InventoryItem
from .serializers import DonorCarSerializer, InventoryItemSerializer

# Existing Bulk Create View
class BulkPartCreateView(APIView):
    def post(self, request):
        car_id = request.data.get('car_id')
        parts_list = request.data.get('parts', [])
        # New: Receive price and condition from React
        price = request.data.get('price', 0)
        condition = request.data.get('condition', 'Grade A')
        
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

# NEW: Fetch Car Details for the Dashboard
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
        return Response({"error": "Car not found"}, status=404)