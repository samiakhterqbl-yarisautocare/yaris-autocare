from rest_framework import serializers
from .models import DonorCar, InventoryItem, AftermarketPart, ProductImage, Invoice


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main', 'created_at']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class InventoryItemSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    donor_car_stock = serializers.ReadOnlyField(source='donor_car.stock_number')
    donor_car_make = serializers.ReadOnlyField(source='donor_car.make')
    donor_car_model = serializers.ReadOnlyField(source='donor_car.model')
    donor_car_year = serializers.ReadOnlyField(source='donor_car.year')

    class Meta:
        model = InventoryItem
        fields = '__all__'


class AftermarketPartSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = AftermarketPart
        fields = '__all__'
        read_only_fields = ['sku', 'label_id', 'created_at']


class DonorCarSerializer(serializers.ModelSerializer):
    parts = InventoryItemSerializer(many=True, read_only=True)
    parts_count = serializers.IntegerField(source='parts.count', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = DonorCar
        fields = '__all__'
        read_only_fields = ['stock_number', 'date_added']


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['invoice_number', 'gst_amount', 'date']