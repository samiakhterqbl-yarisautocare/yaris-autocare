from django.contrib import admin
from .models import DonorCar, InventoryItem, AftermarketPart, ProductImage, Invoice

# --- 1. IMAGE INLINE ---
# This allows you to manage photos directly inside the Part pages
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'is_main']

# --- 2. DONOR CAR ADMIN ---
@admin.register(DonorCar)
class DonorCarAdmin(admin.ModelAdmin):
    # Removed transmission and write_off_status as they aren't in your models.py
    list_display = ('stock_number', 'make', 'model', 'year', 'color', 'date_added')
    search_fields = ('stock_number', 'vin', 'make', 'model')
    list_filter = ('make', 'year', 'color')
    # ProductImage in your model links to InventoryItem/AftermarketPart, not DonorCar directly
    # So we do not include the inline here to avoid the E202 error.

# --- 3. USED PARTS ADMIN ---
@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    # Removed 'quantity' (Used parts are unique items)
    list_display = ('part_name', 'get_stock_number', 'price', 'grading', 'status', 'usage_type')
    # Matches the actual fields in your InventoryItem model
    list_filter = ('status', 'grading', 'category', 'usage_type')
    search_fields = ('part_name', 'donor_car__stock_number', 'label_id')
    inlines = [ProductImageInline]

    def get_stock_number(self, obj):
        return obj.donor_car.stock_number if obj.donor_car else "Loose Stock"
    get_stock_number.short_description = 'Donor Stock #'

# --- 4. AFTERMARKET ADMIN ---
@admin.register(AftermarketPart)
class AftermarketPartAdmin(admin.ModelAdmin):
    # Removed 'supplier' as it isn't in your models.py
    list_display = ('sku', 'part_name', 'quantity', 'sale_price', 'location', 'min_stock_level')
    search_fields = ('sku', 'part_name')
    list_filter = ('location',)
    inlines = [ProductImageInline]

# --- 5. INVOICE ADMIN ---
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer_name', 'total_amount', 'date')
    readonly_fields = ('invoice_number', 'gst_amount', 'date')

# --- 6. PRODUCT IMAGE ADMIN ---
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_part_name', 'image', 'is_main', 'created_at')
    
    def get_part_name(self, obj):
        if obj.aftermarket_part: return obj.aftermarket_part.part_name
        if obj.inventory_item: return obj.inventory_item.part_name
        return "Unlinked"
