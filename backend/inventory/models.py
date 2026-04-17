from django.db import models
import uuid


class DonorCar(models.Model):
    make = models.CharField(max_length=50, default="Toyota")
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    stock_number = models.CharField(max_length=50, unique=True, editable=False)
    vin = models.CharField(max_length=17, unique=True)
    rego = models.CharField(max_length=20, blank=True, null=True)
    color = models.CharField(max_length=30, blank=True, null=True)

    transmission = models.CharField(max_length=50, blank=True, null=True)
    engine_number = models.CharField(max_length=50, blank=True, null=True)
    write_off_status = models.CharField(max_length=50, blank=True, null=True)

    notes = models.TextField(blank=True, null=True)
    salvage_checklist = models.JSONField(default=dict, blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.stock_number:
            clean_vin = str(self.vin).strip()
            vin_segment = clean_vin[-4:] if len(clean_vin) >= 4 else "0000"
            prefix = "YAR" if "YARIS" in str(self.model).upper() else "CAM"
            self.stock_number = f"{prefix}-{self.year}-{vin_segment}".upper()
        super().save(*args, **kwargs)


class InventoryItem(models.Model):
    donor_car = models.ForeignKey(
        DonorCar,
        on_delete=models.CASCADE,
        related_name='parts',
        null=True,
        blank=True
    )
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


class AftermarketPart(models.Model):
    CATEGORY_CHOICES = [
        ('Oil Filters', 'Oil Filters'),
        ('Air Filters', 'Air Filters'),
        ('Cabin Filters', 'Cabin Filters'),
        ('Fuel Filters', 'Fuel Filters'),
        ('Brake Pads', 'Brake Pads'),
        ('Brake Rotors', 'Brake Rotors'),
        ('Spark Plugs', 'Spark Plugs'),
        ('Ignition Coils', 'Ignition Coils'),
        ('Wiper Blades', 'Wiper Blades'),
        ('Bulbs', 'Bulbs'),
        ('Sensors', 'Sensors'),
        ('Suspension', 'Suspension'),
        ('Cooling', 'Cooling'),
        ('Belts', 'Belts'),
        ('Batteries', 'Batteries'),
        ('Fluids', 'Fluids'),
        ('Accessories', 'Accessories'),
        ('Other', 'Other'),
    ]

    part_name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True, blank=True)
    label_id = models.CharField(max_length=100, unique=True, blank=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Other')
    description = models.TextField(blank=True, null=True)
    supplier = models.CharField(max_length=200, blank=True, null=True)
    quantity = models.IntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    min_stock_level = models.IntegerField(default=5)
    location = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, default='Available')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.sku:
            prefix = ''.join(word[0] for word in self.category.split()[:3]).upper() or 'AM'
            random_segment = str(uuid.uuid4()).split('-')[0][:6].upper()
            self.sku = f"{prefix}-{random_segment}"

        if not self.label_id:
            clean_name = ''.join(ch for ch in self.part_name.upper() if ch.isalnum())[:20]
            self.label_id = f"AM-{self.sku}-{clean_name}"

        super().save(*args, **kwargs)


class ProductImage(models.Model):
    donor_car = models.ForeignKey(
        DonorCar,
        related_name='images',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    inventory_item = models.ForeignKey(
        InventoryItem,
        related_name='images',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    aftermarket_part = models.ForeignKey(
        AftermarketPart,
        related_name='images',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    image = models.ImageField(upload_to='inventory_photos/')
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=20, unique=True)
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=15, blank=True, null=True)
    items = models.JSONField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date = models.DateTimeField(auto_now_add=True)