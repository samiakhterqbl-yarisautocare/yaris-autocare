from django.contrib import admin
from django.contrib.auth.models import User

from .models import (
    DonorCar,
    InventoryItem,
    UsedPart,
    AftermarketPart,
    ProductImage,
    Invoice,
    InvoiceItem,
    ServiceDetail,
    StaffProfile,
)


@admin.register(DonorCar)
class DonorCarAdmin(admin.ModelAdmin):
    list_display = ('stock_number', 'make', 'model', 'year', 'rego', 'date_added')
    search_fields = ('stock_number', 'make', 'model', 'vin', 'rego')
    readonly_fields = ('stock_number', 'date_added')


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('part_name', 'category', 'price', 'status', 'location', 'donor_car')
    search_fields = ('part_name', 'category', 'label_id', 'location')
    list_filter = ('category', 'status', 'usage_type')


@admin.register(UsedPart)
class UsedPartAdmin(admin.ModelAdmin):
    list_display = ('part_name', 'sku', 'category', 'sale_status', 'quantity', 'price', 'created_at')
    search_fields = ('part_name', 'sku', 'label_id', 'part_number', 'make', 'model')
    list_filter = ('category', 'sale_status', 'usage_type', 'condition', 'grade')
    readonly_fields = ('sku', 'label_id', 'qr_code_value', 'sold_at', 'created_at', 'updated_at')


@admin.register(AftermarketPart)
class AftermarketPartAdmin(admin.ModelAdmin):
    list_display = ('part_name', 'sku', 'category', 'quantity', 'sale_price', 'status', 'created_at')
    search_fields = ('part_name', 'sku', 'label_id', 'supplier', 'location')
    list_filter = ('category', 'status')
    readonly_fields = ('sku', 'label_id', 'created_at')


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'is_main', 'created_at')
    readonly_fields = ('created_at',)


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


@admin.register(ServiceDetail)
class ServiceDetailAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'service_at_km', 'next_service_at_km', 'next_service_date')
    search_fields = ('invoice__invoice_number', 'invoice__customer_name', 'invoice__rego')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        'invoice_number',
        'customer_name',
        'invoice_type',
        'created_at',
        'total_amount',
        'payment_status',
    )
    search_fields = (
        'invoice_number',
        'customer_name',
        'customer_phone',
        'rego',
        'make',
        'model',
    )
    list_filter = ('invoice_type', 'payment_status', 'created_at')
    readonly_fields = (
        'invoice_number',
        'gst_amount',
        'created_at',
        'subtotal',
        'total_amount',
        'balance_due',
    )
    inlines = [InvoiceItemInline]


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'is_active_staff', 'phone')
    search_fields = ('user__username', 'user__email', 'phone')
    list_filter = ('role', 'is_active_staff')