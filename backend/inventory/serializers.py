from rest_framework import serializers
from .models import DonorCar, InventoryItem, AftermarketPart, ProductImage

class DonorCarSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorCar
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

# THIS IS THE MISSING PIECE
class AftermarketPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = AftermarketPart
        fields = '__all__'
