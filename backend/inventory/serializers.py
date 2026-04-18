from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import (
    DonorCar,
    InventoryItem,
    UsedPart,
    AftermarketPart,
    ProductImage,
    Invoice,
    InvoiceItem,
    ServiceDetail,
)


TWOPLACES = Decimal('0.01')


def money(value):
    return Decimal(value).quantize(TWOPLACES, rounding=ROUND_HALF_UP)


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


class UsedPartSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = UsedPart
        fields = '__all__'
        read_only_fields = ['sku', 'label_id', 'qr_code_value', 'sold_at', 'created_at', 'updated_at']


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


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = [
            'id',
            'item_type',
            'source_type',
            'source_id',
            'name',
            'description',
            'quantity',
            'unit_price',
            'discount',
            'gst_included',
            'line_total',
        ]
        read_only_fields = ['id', 'line_total']


class ServiceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceDetail
        fields = [
            'service_at_km',
            'next_service_at_km',
            'next_service_date',
            'oil_grade',
            'service_notes',
            'recommendations',
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    service_detail = ServiceDetailSerializer(required=False, allow_null=True)

    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'invoice_type',

            'customer_name',
            'customer_phone',
            'customer_email',
            'customer_address',
            'customer_company',
            'customer_abn',

            'rego',
            'make',
            'model',
            'year',
            'vin',
            'odometer',

            'subtotal',
            'gst_amount',
            'total_amount',
            'paid_amount',
            'balance_due',

            'payment_status',
            'payment_method',
            'notes',
            'created_at',

            'items',
            'service_detail',
        ]
        read_only_fields = [
            'id',
            'invoice_number',
            'subtotal',
            'gst_amount',
            'total_amount',
            'balance_due',
            'created_at',
        ]

    def validate(self, attrs):
        invoice_type = attrs.get('invoice_type')
        items = attrs.get('items', [])
        service_detail = attrs.get('service_detail')

        if not items:
            raise serializers.ValidationError({'items': 'At least one invoice item is required.'})

        if invoice_type == 'SERVICING' and not service_detail:
            raise serializers.ValidationError({
                'service_detail': 'Service details are required when invoice type is SERVICING.'
            })

        return attrs

    def _next_invoice_number(self):
        date_part = timezone.now().strftime('%Y%m%d')
        count_today = Invoice.objects.filter(created_at__date=timezone.now().date()).count() + 1
        return f"INV-{date_part}-{count_today}"

    def _apply_stock_update(self, item_obj):
        qty = int(Decimal(item_obj.quantity))

        if item_obj.source_type == 'USED_PART' and item_obj.source_id:
            try:
                part = UsedPart.objects.get(pk=item_obj.source_id)
                remaining = max(part.quantity - qty, 0)
                part.quantity = remaining
                if remaining == 0:
                    part.sale_status = 'SOLD'
                part.save()
            except UsedPart.DoesNotExist:
                pass

        elif item_obj.source_type == 'AFTERMARKET' and item_obj.source_id:
            try:
                part = AftermarketPart.objects.get(pk=item_obj.source_id)
                remaining = max(part.quantity - qty, 0)
                part.quantity = remaining
                part.status = 'Out of Stock' if remaining == 0 else 'Available'
                part.save()
            except AftermarketPart.DoesNotExist:
                pass

        elif item_obj.source_type == 'DISMANTLE' and item_obj.source_id:
            try:
                part = InventoryItem.objects.get(pk=item_obj.source_id)
                part.status = 'Sold'
                part.save()
            except InventoryItem.DoesNotExist:
                pass

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        service_detail_data = validated_data.pop('service_detail', None)

        subtotal = Decimal('0.00')
        gst_amount = Decimal('0.00')

        invoice = Invoice.objects.create(
            invoice_number=self._next_invoice_number(),
            subtotal=Decimal('0.00'),
            gst_amount=Decimal('0.00'),
            total_amount=Decimal('0.00'),
            balance_due=Decimal('0.00'),
            **validated_data,
        )

        for item_data in items_data:
            quantity = money(item_data.get('quantity', 1))
            unit_price = money(item_data.get('unit_price', 0))
            discount = money(item_data.get('discount', 0))

            line_total = (quantity * unit_price) - discount
            if line_total < 0:
                line_total = Decimal('0.00')
            line_total = money(line_total)

            item_obj = InvoiceItem.objects.create(
                invoice=invoice,
                line_total=line_total,
                **item_data,
            )

            subtotal += line_total
            if item_obj.gst_included:
                gst_amount += (line_total / Decimal('11'))

            self._apply_stock_update(item_obj)

        subtotal = money(subtotal)
        gst_amount = money(gst_amount)
        total_amount = subtotal
        paid_amount = money(invoice.paid_amount or 0)
        balance_due = money(total_amount - paid_amount)

        if paid_amount <= 0:
            payment_status = 'UNPAID'
        elif paid_amount < total_amount:
            payment_status = 'PARTIAL'
        else:
            payment_status = 'PAID'
            balance_due = Decimal('0.00')

        invoice.subtotal = subtotal
        invoice.gst_amount = gst_amount
        invoice.total_amount = total_amount
        invoice.balance_due = balance_due
        invoice.payment_status = payment_status
        invoice.save()

        if invoice.invoice_type == 'SERVICING' and service_detail_data:
            ServiceDetail.objects.create(invoice=invoice, **service_detail_data)

        return invoice