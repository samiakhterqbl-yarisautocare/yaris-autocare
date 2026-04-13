from django.db import models

class DonorCar(models.Model):
    stock_number = models.CharField(max_length=50, unique=True)
    vin = models.CharField(max_length=17, unique=True)
    make = models.CharField(max_length=50, default="Toyota")
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    color = models.CharField(max_length=30)
    # Checklist stores parts available/removed as JSON
    salvage_checklist = models.JSONField(default=dict, blank=True) 
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.stock_number} - {self.model}"

class InventoryItem(models.Model):
    donor_car = models.ForeignKey(DonorCar, on_delete=models.CASCADE, related_name='parts', null=True, blank=True)
    part_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    condition = models.CharField(max_length=20, default='Used')
    status = models.CharField(max_length=20, default='For Sale')
    # QR Code Data (can store a URL or unique ID)
    label_id = models.CharField(max_length=100, unique=True, blank=True, null=True)

    def __str__(self):
        return self.part_name

class AftermarketPart(models.Model):
    part_name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    quantity = models.IntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    min_stock_level = models.IntegerField(default=5)
    location = models.CharField(max_length=100)

class ProductImage(models.Model):
    inventory_item = models.ForeignKey(InventoryItem, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    aftermarket_part = models.ForeignKey(AftermarketPart, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to='inventory_photos/')
    is_main = models.BooleanField(default=False)

class Invoice(models.Model):
    invoice_number = models.CharField(max_length=20, unique=True)
    customer_name = models.CharField(max_length=200)
    items = models.JSONField() # List of objects: [{name, price, qty}]
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    pdf_invoice = models.FileField(upload_to='invoices/', null=True, blank=True)
