from django.contrib import admin
from .models import DonorCar, InventoryItem, AftermarketPart, ProductImage

# --- IMAGE INLINES ---
# This allows you to upload/manage photos directly inside the Part or Car pages
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1  # Shows 1 empty slot for a new photo by default
    fields = ['image', 'is_main']

# --- ADMIN MODELS ---

@admin.register(DonorCar)
class DonorCarAdmin(admin.ModelAdmin):
    list_display = ('stock_number', 'make', 'model', 'year', 'transmission', 'write_off_status')
    search_fields = ('stock_number', 'vin', 'make', 'model')
    list_filter = ('make', 'transmission', 'write_off_status')
    inlines = [ProductImageInline]

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('part_name', 'get_stock_number', 'price', 'quantity', 'status')
    list_filter = ('status', 'condition', 'category')
    search_fields = ('part_name', 'donor_car__stock_number')
    inlines = [ProductImageInline]

    # Helper to show the stock number in the list view
    def get_stock_number(self, obj):
        return obj.donor_car.stock_number if obj.donor_car else "Loose Stock"
    get_stock_number.short_description = 'Donor Stock #'

@admin.register(AftermarketPart)
class AftermarketPartAdmin(admin.ModelAdmin):
    list_display = ('sku', 'part_name', 'quantity', 'sale_price', 'location', 'min_stock_level')
    search_fields = ('sku', 'part_name', 'supplier')
    list_filter = ('supplier', 'location')
    inlines = [ProductImageInline]

# Optional: Register ProductImage separately if you want to see all photos in one list
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_part_name', 'image', 'is_main', 'created_at')
    
    def get_part_name(self, obj):
        if obj.aftermarket_part: return obj.aftermarket_part.part_name
        if obj.inventory_item: return obj.inventory_item.part_name
        if obj.donor_car: return obj.donor_car.stock_number
        return "Unlinked"