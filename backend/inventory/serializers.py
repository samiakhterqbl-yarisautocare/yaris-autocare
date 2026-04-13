from rest_framework import serializers
from .models import *

# --- 1. IMAGE SERIALIZER ---
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main', 'created_at']

# --- 2. DONOR CAR SERIALIZER ---
class DonorCarSerializer(serializers.ModelSerializer):
    # This shows how many parts are currently linked to this car
    parts_count = serializers.IntegerField(source='parts.count', read_only=True)

    class Meta:
        model = DonorCar
        fields = '__all__'

# --- 3. USED PARTS SERIALIZER ---
class InventoryItemSerializer(serializers.ModelSerializer):
    # Nested images for the gallery
    images = ProductImageSerializer(many=True, read_only=True)
    
    # Human-readable fields from the donor car
    donor_car_stock = serializers.ReadOnlyField(source='donor_car.stock_number')
    donor_car_details = serializers.ReadOnlyField(source='donor_car.__str__')
    
    # Grading Display (Shows "Grade A - Excellent" instead of just "A")
    grading_display = serializers.CharField(source='get_grading_display', read_only=True)

    class Meta:
        model = InventoryItem
        fields = '__all__'

# --- 4. AFTERMARKET SERIALIZER ---
class AftermarketPartSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    is_low_stock = serializers.SerializerMethodField()

    class Meta:
        model = AftermarketPart
        fields = '__all__'

    def get_is_low_stock(self, obj):
        return obj.quantity <= obj.min_stock_level

# --- 5. SALES & INVOICE SERIALIZER ---
class InvoiceSerializer(serializers.ModelSerializer):
    # Formats the date to a cleaner style (e.g., 13 April 2026)
    formatted_date = serializers.DateTimeField(format="%d %B %Y", source='date', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer_name', 'customer_phone', 
            'items', 'total_amount', 'gst_amount', 'date', 
            'formatted_date', 'pdf_invoice'
        ]
        read_only_fields = ['invoice_number', 'gst_amount', 'pdf_invoice']
