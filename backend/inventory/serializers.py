from rest_framework import serializers
from .models import DonorCar, InventoryItem

class DonorCarSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorCar
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'