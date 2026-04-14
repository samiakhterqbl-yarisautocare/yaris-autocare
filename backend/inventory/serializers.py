from rest_framework import serializers
from .models import *

# --- 1. IMAGE SERIALIZER ---
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main', 'created_at']

# --- 2. USED PARTS SERIALIZER (Phases 3, 4 & 6) ---
class InventoryItemSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    
    # Industrial Data from Parent Car
    donor_car_stock = serializers.ReadOnlyField(source='donor_car.stock_number')
    donor_car_details = serializers.ReadOnlyField(source='donor_car.__str__')
    donor_car_make = serializers.ReadOnlyField(source='donor_car.make')
    donor_car_model = serializers.ReadOnlyField(source='donor_car.model')
    donor_car_year = serializers.ReadOnlyField(source='donor_car.year')
    
    # Grading & Status Display
    grading_display = serializers.CharField(source='get_grading_display', read_only=True)
    usage_display = serializers.CharField(source='get_usage_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = InventoryItem
        fields = '__all__'

# --- 3. DONOR CAR SERIALIZER (Phase 6 Master View) ---
class DonorCarSerializer(serializers.ModelSerializer):
    # This allows you to see the actual parts list inside the car view
    parts = InventoryItemSerializer(many=True, read_only=True)
    parts_count = serializers.IntegerField(source='parts.count', read_only=True)

    class Meta:
        model = DonorCar
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
    formatted_date = serializers.DateTimeField(format="%d %B %Y", source='date', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer_name', 'customer_phone', 
            'items', 'total_amount', 'gst_amount', 'date', 
            'formatted_date', 'pdf_invoice'
        ]
        read_only_fields = ['invoice_number', 'gst_amount', 'pdf_invoice']
