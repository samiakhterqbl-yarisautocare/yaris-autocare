from rest_framework import serializers
from .models import DonorCar, InventoryItem, AftermarketPart, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

class DonorCarSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorCar
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    donor_car_stock = serializers.ReadOnlyField(source='donor_car.stock_number')
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = InventoryItem
        fields = '__all__'

class AftermarketPartSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = AftermarketPart
        fields = '__all__'
