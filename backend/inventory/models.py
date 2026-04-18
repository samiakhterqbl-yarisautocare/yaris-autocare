from decimal import Decimal
import uuid

from django.db import models
from django.utils import timezone


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

    def __str__(self):
        return f"{self.stock_number} - {self.make} {self.model} {self.year}"


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

    def __str__(self):
        return self.part_name


class UsedPart(models.Model):
    USAGE_TYPE_CHOICES = [
        ('FOR_SALE', 'For Sale'),
        ('INTERNAL_USE', 'Internal Use'),
    ]

    SALE_STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('RESERVED', 'Reserved'),
        ('SOLD', 'Sold'),
        ('REMOVED', 'Removed'),
        ('DAMAGED', 'Damaged'),
        ('HOLD', 'Hold'),
    ]

    GRADE_CHOICES = [
        ('A', 'Grade A'),
        ('B', 'Grade B'),
        ('C', 'Grade C'),
        ('D', 'Grade D'),
    ]

    RATING_CHOICES = [
        ('Excellent', 'Excellent'),
        ('Good', 'Good'),
        ('Fair', 'Fair'),
        ('Poor', 'Poor'),
    ]

    CONDITION_CHOICES = [
        ('New Old Stock', 'New Old Stock'),
        ('Used Excellent', 'Used Excellent'),
        ('Used Good', 'Used Good'),
        ('Used Fair', 'Used Fair'),
        ('Reconditioned', 'Reconditioned'),
        ('Damaged', 'Damaged'),
    ]

    CATEGORY_CHOICES = [
        ('Engine', 'Engine'),
        ('Transmission', 'Transmission'),
        ('Suspension', 'Suspension'),
        ('Steering', 'Steering'),
        ('Brakes', 'Brakes'),
        ('Electrical', 'Electrical'),
        ('Lighting', 'Lighting'),
        ('Interior', 'Interior'),
        ('Exterior', 'Exterior'),
        ('Body Panels', 'Body Panels'),
        ('Cooling', 'Cooling'),
        ('Fuel System', 'Fuel System'),
        ('Exhaust', 'Exhaust'),
        ('Wheels & Tyres', 'Wheels & Tyres'),
        ('Doors & Windows', 'Doors & Windows'),
        ('Mirrors', 'Mirrors'),
        ('AC & Heating', 'AC & Heating'),
        ('Sensors', 'Sensors'),
        ('ECU / Modules', 'ECU / Modules'),
        ('Accessories', 'Accessories'),
        ('Other', 'Other'),
    ]

    part_name = models.CharField(max_length=200)
    part_number = models.CharField(max_length=100, blank=True, null=True)

    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Other')
    subcategory = models.CharField(max_length=100, blank=True, null=True)

    make = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    variant = models.CharField(max_length=100, blank=True, null=True)

    year_from = models.IntegerField(blank=True, null=True)
    year_to = models.IntegerField(blank=True, null=True)

    description = models.TextField(blank=True, null=True)

    grade = models.CharField(max_length=10, choices=GRADE_CHOICES, default='B')
    rating = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    condition = models.CharField(max_length=50, choices=CONDITION_CHOICES, default='Used Good')
    condition_notes = models.TextField(blank=True, null=True)

    usage_type = models.CharField(max_length=20, choices=USAGE_TYPE_CHOICES, default='FOR_SALE')
    sale_status = models.CharField(max_length=20, choices=SALE_STATUS_CHOICES, default='AVAILABLE')

    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, blank=True, null=True)

    quantity = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=100, blank=True, null=True)
    shelf_code = models.CharField(max_length=100, blank=True, null=True)

    sku = models.CharField(max_length=50, unique=True, blank=True)
    label_id = models.CharField(max_length=100, unique=True, blank=True)
    qr_code_value = models.CharField(max_length=255, unique=True, blank=True)

    public_notes = models.TextField(blank=True, null=True)
    internal_notes = models.TextField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    sold_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.sku:
            category_prefix = ''.join(word[0] for word in self.category.split()[:3]).upper() or 'UP'
            random_segment = str(uuid.uuid4()).split('-')[0][:6].upper()
            self.sku = f"UP-{category_prefix}-{random_segment}"

        if not self.label_id:
            clean_name = ''.join(ch for ch in self.part_name.upper() if ch.isalnum())[:20]
            self.label_id = f"{self.sku}-{clean_name}"

        if not self.qr_code_value:
            self.qr_code_value = self.label_id

        if self.sale_status == 'SOLD' and not self.sold_at:
            self.sold_at = timezone.now()

        if self.sale_status != 'SOLD':
            self.sold_at = None

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.part_name} ({self.sku})"


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

    def __str__(self):
        return f"{self.part_name} ({self.sku})"


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
    used_part = models.ForeignKey(
        UsedPart,
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

    def __str__(self):
        target = self.used_part or self.aftermarket_part or self.inventory_item or self.donor_car
        return f"Image {self.id} - {target}"


class Invoice(models.Model):
    INVOICE_TYPE_CHOICES = [
        ('USED_PART', 'Used Part'),
        ('AFTERMARKET', 'Aftermarket'),
        ('DISMANTLE', 'Dismantle'),
        ('SERVICING', 'Servicing'),
        ('DIAGNOSTIC', 'Diagnostic'),
        ('LABOUR', 'Labour'),
        ('REPAIR', 'Mechanical Repair'),
        ('CUSTOM', 'Custom Invoice'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PARTIAL', 'Partial'),
        ('PAID', 'Paid'),
    ]

    invoice_number = models.CharField(max_length=30, unique=True)
    invoice_type = models.CharField(max_length=20, choices=INVOICE_TYPE_CHOICES, default='CUSTOM')

    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=30, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    customer_address = models.TextField(blank=True, null=True)
    customer_company = models.CharField(max_length=200, blank=True, null=True)
    customer_abn = models.CharField(max_length=50, blank=True, null=True)

    rego = models.CharField(max_length=30, blank=True, null=True)
    make = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    vin = models.CharField(max_length=50, blank=True, null=True)
    odometer = models.PositiveIntegerField(blank=True, null=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    balance_due = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='UNPAID')
    payment_method = models.CharField(max_length=50, blank=True, null=True)

    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.invoice_number


class InvoiceItem(models.Model):
    ITEM_TYPE_CHOICES = [
        ('STOCK', 'Stock Item'),
        ('MANUAL', 'Manual Item'),
        ('SERVICE', 'Service Item'),
        ('LABOUR', 'Labour'),
    ]

    SOURCE_TYPE_CHOICES = [
        ('USED_PART', 'Used Part'),
        ('AFTERMARKET', 'Aftermarket'),
        ('DISMANTLE', 'Dismantle'),
        ('MANUAL', 'Manual'),
    ]

    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES, default='MANUAL')
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES, default='MANUAL')
    source_id = models.PositiveIntegerField(blank=True, null=True)

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1.00'))
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    gst_included = models.BooleanField(default=True)
    line_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.name}"


class ServiceDetail(models.Model):
    invoice = models.OneToOneField(Invoice, related_name='service_detail', on_delete=models.CASCADE)
    service_at_km = models.PositiveIntegerField(blank=True, null=True)
    next_service_at_km = models.PositiveIntegerField(blank=True, null=True)
    next_service_date = models.DateField(blank=True, null=True)
    oil_grade = models.CharField(max_length=50, blank=True, null=True)
    service_notes = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Service Detail - {self.invoice.invoice_number}"