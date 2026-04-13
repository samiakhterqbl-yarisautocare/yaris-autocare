from django.db import models

# --- 1. DONOR CARS ---
class DonorCar(models.Model):
    stock_number = models.CharField(max_length=50, unique=True)
    vin = models.CharField(max_length=17, unique=True)
    make = models.CharField(max_length=50, default="Toyota")
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    color = models.CharField(max_length=30)
    
    # Track which parts were salvaged during dismantle
    salvage_checklist = models.JSONField(default=dict, blank=True) 
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.stock_number} - {self.model}"

# --- 2. SALVAGED USED PARTS ---
class InventoryItem(models.Model):
    # Link to Donor
    donor_car = models.ForeignKey(DonorCar, on_delete=models.CASCADE, related_name='parts', null=True, blank=True)
    part_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # --- GRADING & CONDITION ---
    GRADING_CHOICES = [
        ('A', 'Grade A - Excellent/Low KM'),
        ('B', 'Grade B - Good/Minor Wear'),
        ('C', 'Grade C - Fair/High KM'),
        ('F', 'Grade F - For Parts Only'),
    ]
    grading = models.CharField(max_length=1, choices=GRADING_CHOICES, default='A')
    condition_notes = models.TextField(blank=True, null=True)
    
    # --- USAGE & STATUS ---
    USAGE_CHOICES = [
        ('Sale', 'For Sale (Retail)'),
        ('Internal', 'Internal Use Only'),
        ('Scrap', 'Scrap/Waste'),
    ]
    usage_type = models.CharField(max_length=10, choices=USAGE_CHOICES, default='Sale')
    
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Reserved', 'Reserved'),
        ('Sold', 'Sold'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')

    # --- QR & LABELING ---
    # label_id acts as the QR payload (e.g., "YAR-101-45")
    label_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.part_name} ({self.grading})"

# --- 3. AFTERMARKET NEW PARTS ---
class AftermarketPart(models.Model):
    part_name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    quantity = models.IntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    min_stock_level = models.IntegerField(default=5)
    location = models.CharField(max_length=100)
    
    # New Parts also get a status for Invoicing
    status = models.CharField(max_length=20, default='Available')

    def __str__(self):
        return f"{self.part_name} - {self.sku}"

# --- 4. AWS S3 IMAGE GALLERY ---
class ProductImage(models.Model):
    # Links to either Used or New parts
    inventory_item = models.ForeignKey(InventoryItem, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    aftermarket_part = models.ForeignKey(AftermarketPart, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    
    image = models.ImageField(upload_to='inventory_photos/')
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

# --- 5. SALES & INVOICING ---
class Invoice(models.Model):
    invoice_number = models.CharField(max_length=20, unique=True) # e.g., INV-2026-001
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=15, blank=True, null=True)
    
    # JSON stores specific part details at the time of sale
    # Format: [{"id": 1, "type": "used", "name": "Bumper", "price": 150.00}]
    items = models.JSONField() 
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    date = models.DateTimeField(auto_now_add=True)
    
    # Store the generated PDF on S3
    pdf_invoice = models.FileField(upload_to='invoices/', null=True, blank=True)
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer_name}"
