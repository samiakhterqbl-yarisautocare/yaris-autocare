from rest_framework import serializers
from .models import *

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

class DonorCarSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorCar
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    donor_car_stock = serializers.ReadOnlyField(source='donor_car.stock_number')

    class Meta:
        model = InventoryItem
        fields = '__all__'

class AftermarketPartSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    is_low_stock = serializers.SerializerMethodField()

    class Meta:
        model = AftermarketPart
        fields = '__all__'

    def get_is_low_stock(self, obj):
        return obj.quantity <= obj.min_stock_level

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'
