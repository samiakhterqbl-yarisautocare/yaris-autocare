from django.db import models

# --- DONOR CARS SECTION ---
class DonorCar(models.Model):
    stock_number = models.CharField(max_length=50, unique=True)
    vin = models.CharField(max_length=17, unique=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    color = models.CharField(max_length=30)
    
    TRANSMISSION_CHOICES = [('Auto', 'Automatic'), ('Manual', 'Manual'), ('CVT', 'CVT')]
    transmission = models.CharField(max_length=10, choices=TRANSMISSION_CHOICES)
    engine_number = models.CharField(max_length=50, blank=True, null=True)
    
    WRITE_OFF_CHOICES = [('Repairable', 'Repairable'), ('Statutory', 'Statutory')]
    write_off_status = models.CharField(max_length=20, choices=WRITE_OFF_CHOICES)
    
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.stock_number} - {self.make} {self.model}"

# --- SALVAGED USED PARTS SECTION ---
class InventoryItem(models.Model):
    donor_car = models.ForeignKey(DonorCar, on_delete=models.CASCADE, related_name='parts', null=True, blank=True)
    part_name = models.CharField(max_length=100) 
    category = models.CharField(max_length=50)   
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=1)
    
    CONDITION_CHOICES = [('Used', 'Used'), ('New', 'Aftermarket New'), ('Damaged', 'Damaged')]
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='Used')
    
    STATUS_CHOICES = [('For Sale', 'For Sale'), ('Internal', 'Internal Use Only'), ('Sold', 'Sold')]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='For Sale')

    def __str__(self):
        return f"{self.part_name} - {self.donor_car.stock_number if self.donor_car else 'Loose Stock'}"

# --- AFTERMARKET NEW PARTS SECTION ---
class AftermarketPart(models.Model):
    part_name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    quantity = models.IntegerField(default=0)
    supplier = models.CharField(max_length=200, blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=100)
    min_stock_level = models.IntegerField(default=5)
    description = models.TextField(blank=True, null=True) # Added for the Detail Page
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.part_name} ({self.sku})"

# --- AWS S3 IMAGE GALLERY SECTION ---
class ProductImage(models.Model):
    """
    This model handles multiple images for any type of part.
    It links to AftermarketPart, but can be extended for used parts too.
    """
    aftermarket_part = models.ForeignKey(AftermarketPart, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    inventory_item = models.ForeignKey(InventoryItem, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    donor_car = models.ForeignKey(DonorCar, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    
    # This field triggers the upload to your S3 bucket via django-storages
    image = models.ImageField(upload_to='inventory_photos/') 
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.id}"