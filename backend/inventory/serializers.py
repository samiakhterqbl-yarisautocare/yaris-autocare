from rest_framework import serializers
from .models import *

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main', 'created_at']

class InventoryItemSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    donor_car_stock = serializers.ReadOnlyField(source='donor_car.stock_number')
    donor_car_make = serializers.ReadOnlyField(source='donor_car.make')
    donor_car_model = serializers.ReadOnlyField(source='donor_car.model')
    donor_car_year = serializers.ReadOnlyField(source='donor_car.year')

    class Meta:
        model = InventoryItem
        fields = '__all__'

class DonorCarSerializer(serializers.ModelSerializer):
    parts = InventoryItemSerializer(many=True, read_only=True)
    parts_count = serializers.IntegerField(source='parts.count', read_only=True)

    class Meta:
        model = DonorCar
        fields = ['id', 'make', 'model', 'year', 'stock_number', 'vin', 'rego', 'color', 'notes', 'salvage_checklist', 'date_added', 'parts', 'parts_count']
        read_only_fields = ['stock_number', 'date_added']

class AftermarketPartSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    is_low_stock = serializers.SerializerMethodField()

    class Meta:
        model = AftermarketPart
        fields = '__all__'

    def get_is_low_stock(self, obj):
        return obj.quantity <= obj.min_stock_level

class InvoiceSerializer(serializers.ModelSerializer):
    formatted_date = serializers.DateTimeField(format="%d %B %Y", source='date', read_only=True)
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'customer_name', 'customer_phone', 'items', 'total_amount', 'gst_amount', 'date', 'formatted_date', 'pdf_invoice']
        read_only_fields = ['invoice_number', 'gst_amount', 'pdf_invoice']
