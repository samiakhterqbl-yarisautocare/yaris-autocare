from django.db import models
import uuid

# --- 1. DONOR CARS ---
class DonorCar(models.Model):
    make = models.CharField(max_length=50, default="Toyota")
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    stock_number = models.CharField(max_length=50, unique=True, editable=False)
    vin = models.CharField(max_length=17, unique=True)
    rego = models.CharField(max_length=20, blank=True, null=True) 
    color = models.CharField(max_length=30, blank=True, null=True)
    
    # These match the columns in your image_428b55.png to prevent crashes
    transmission = models.CharField(max_length=50, blank=True, null=True)
    engine_number = models.CharField(max_length=50, blank=True, null=True)
    write_off_status = models.CharField(max_length=50, blank=True, null=True)
    
    notes = models.TextField(blank=True, null=True)
    salvage_checklist = models.JSONField(default=dict, blank=True) 
    date_added = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.stock_number:
            clean_vin = str(self.vin).strip()
            vin_segment = clean_vin[-4:] if len(clean_vin) >= 4 else "0000"
            prefix = "YAR" if "YARIS" in str(self.model).upper() else "CAM"
            self.stock_number = f"{prefix}-{self.year}-{vin_segment}".upper()
        super().save(*args, **kwargs)

# --- 2. SALVAGED USED PARTS ---
class InventoryItem(models.Model):
    donor_car = models.ForeignKey(DonorCar, on_delete=models.CASCADE, related_name='parts', null=True, blank=True)
    part_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    grading = models.CharField(max_length=50, default='Grade A')
    condition_notes = models.TextField(blank=True, null=True)
    usage_type = models.CharField(max_length=20, default='Sale')
    status = models.CharField(max_length=20, default='Available')
    label_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.label_id and self.donor_car:
            clean_part_name = self.part_name.replace(" ", "").upper()
            self.label_id = f"{self.donor_car.stock_number}-{clean_part_name}"
        super().save(*args, **kwargs)

# --- 3. AFTERMARKET NEW PARTS ---
class AftermarketPart(models.Model):
    part_name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    quantity = models.IntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    min_stock_level = models.IntegerField(default=5)
    location = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='Available')

# --- 4. AWS S3 IMAGE GALLERY ---
class ProductImage(models.Model):
    donor_car = models.ForeignKey(DonorCar, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    inventory_item = models.ForeignKey(InventoryItem, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    aftermarket_part = models.ForeignKey(AftermarketPart, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to='inventory_photos/')
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

# --- 5. SALES & INVOICING ---
class Invoice(models.Model):
    invoice_number = models.CharField(max_length=20, unique=True)
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=15, blank=True, null=True)
    items = models.JSONField() 
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date = models.DateTimeField(auto_now_add=True)
    pdf_invoice = models.FileField(upload_to='invoices/', null=True, blank=True)
