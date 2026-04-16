from django.db.models import Sum, F, Q
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser

from .models import DonorCar, InventoryItem, AftermarketPart, ProductImage, Invoice
from .serializers import (
    DonorCarSerializer,
    InventoryItemSerializer,
    AftermarketPartSerializer,
    ProductImageSerializer,
    InvoiceSerializer,
)


class DonorCarListCreateView(generics.ListCreateAPIView):
    queryset = DonorCar.objects.all().order_by('-date_added')
    serializer_class = DonorCarSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        donor_car = serializer.save()

        images = request.FILES.getlist('images')
        for index, img in enumerate(images):
            ProductImage.objects.create(
                donor_car=donor_car,
                image=img,
                is_main=(index == 0),
            )

        headers = self.get_success_headers(serializer.data)
        return Response(
            DonorCarSerializer(donor_car).data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class DonorCarDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DonorCar.objects.all()
    serializer_class = DonorCarSerializer
    parser_classes = (MultiPartParser, FormParser)


class UsedPartListCreateView(generics.ListCreateAPIView):
    queryset = InventoryItem.objects.select_related('donor_car').all().order_by('-id')
    serializer_class = InventoryItemSerializer
    parser_classes = (MultiPartParser, FormParser)


class UsedPartDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryItem.objects.select_related('donor_car').all()
    serializer_class = InventoryItemSerializer
    parser_classes = (MultiPartParser, FormParser)


class AftermarketListCreateView(generics.ListCreateAPIView):
    queryset = AftermarketPart.objects.all().order_by('-id')
    serializer_class = AftermarketPartSerializer
    parser_classes = (MultiPartParser, FormParser)


class AftermarketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AftermarketPart.objects.all()
    serializer_class = AftermarketPartSerializer
    parser_classes = (MultiPartParser, FormParser)


class BulkDismantleView(APIView):
    def post(self, request):
        car_id = request.data.get('car_id')
        parts = request.data.get('parts', [])

        if not car_id:
            return Response(
                {"error": "car_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(parts, list):
            return Response(
                {"error": "parts must be a list"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            car = DonorCar.objects.get(id=car_id)
        except DonorCar.DoesNotExist:
            return Response(
                {"error": "Donor Car not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        created_parts = []

        for p in parts:
            if isinstance(p, dict):
                part_name = p.get('part_name') or p.get('name') or 'Unnamed Part'
                category = p.get('category') or 'Uncategorized'
                price = p.get('price') or 0
                grading = p.get('grading') or 'Grade A'
                condition_notes = p.get('condition_notes') or ''
                usage_type = p.get('usage_type') or 'Sale'
                part_status = p.get('status') or 'Available'
                location = p.get('location') or ''
            else:
                part_name = str(p)
                category = 'Uncategorized'
                price = 0
                grading = 'Grade A'
                condition_notes = ''
                usage_type = 'Sale'
                part_status = 'Available'
                location = ''

            item = InventoryItem.objects.create(
                donor_car=car,
                part_name=part_name,
                category=category,
                price=price,
                grading=grading,
                condition_notes=condition_notes,
                usage_type=usage_type,
                status=part_status,
                location=location,
            )
            created_parts.append(InventoryItemSerializer(item).data)

        return Response(
            {
                "status": "Success",
                "message": f"Successfully generated {len(created_parts)} labels for {car.stock_number}",
                "parts": created_parts,
            },
            status=status.HTTP_201_CREATED,
        )


class GlobalSearchView(APIView):
    def get(self, request):
        query = (request.query_params.get('q') or '').strip()

        if not query:
            return Response({"used": [], "aftermarket": []})

        used_parts = InventoryItem.objects.select_related('donor_car').filter(
            Q(part_name__icontains=query) |
            Q(label_id__icontains=query) |
            Q(category__icontains=query) |
            Q(location__icontains=query) |
            Q(donor_car__stock_number__icontains=query) |
            Q(donor_car__vin__icontains=query) |
            Q(donor_car__rego__icontains=query)
        ).distinct()[:50]

        aftermarket_parts = AftermarketPart.objects.filter(
            Q(part_name__icontains=query) |
            Q(sku__icontains=query) |
            Q(location__icontains=query) |
            Q(status__icontains=query)
        ).distinct()[:50]

        return Response({
            "used": InventoryItemSerializer(used_parts, many=True).data,
            "aftermarket": AftermarketPartSerializer(aftermarket_parts, many=True).data,
        })


class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all().order_by('-date')
    serializer_class = InvoiceSerializer

    def perform_create(self, serializer):
        total = serializer.validated_data.get('total_amount', 0) or 0
        gst = total / 11 if total else 0
        inv_no = f"INV-{timezone.now().strftime('%Y%m%d')}-{Invoice.objects.count() + 1}"
        serializer.save(
            invoice_number=inv_no,
            gst_amount=round(gst, 2),
        )


class BusinessSummaryView(APIView):
    def get(self, request):
        try:
            revenue = Invoice.objects.aggregate(total=Sum('total_amount'))['total'] or 0
            used_parts_count = InventoryItem.objects.count()
            aftermarket_count = AftermarketPart.objects.count()
            low_stock_alerts = AftermarketPart.objects.filter(
                quantity__lte=F('min_stock_level')
            ).count()

            return Response({
                "total_revenue": float(revenue),
                "used_parts_count": used_parts_count,
                "aftermarket_count": aftermarket_count,
                "low_stock_alerts": low_stock_alerts,
            })
        except Exception as e:
            return Response(
                {
                    "total_revenue": 0.0,
                    "used_parts_count": 0,
                    "aftermarket_count": 0,
                    "low_stock_alerts": 0,
                    "debug_error": str(e),
                },
                status=status.HTTP_200_OK,
            )


class LowStockListView(generics.ListAPIView):
    serializer_class = AftermarketPartSerializer

    def get_queryset(self):
        return AftermarketPart.objects.filter(
            quantity__lte=F('min_stock_level')
        ).order_by('quantity', 'part_name')


class ImageUploadView(generics.CreateAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    parser_classes = (MultiPartParser, FormParser)


@api_view(['POST'])
def set_main_image(request, image_id):
    try:
        image = ProductImage.objects.get(id=image_id)

        if image.inventory_item:
            ProductImage.objects.filter(
                inventory_item=image.inventory_item
            ).update(is_main=False)
        elif image.donor_car:
            ProductImage.objects.filter(
                donor_car=image.donor_car
            ).update(is_main=False)
        elif image.aftermarket_part:
            ProductImage.objects.filter(
                aftermarket_part=image.aftermarket_part
            ).update(is_main=False)
        else:
            return Response(
                {"error": "Image is not linked to any item"},
                status=status.HTTP_400_BAD_REQUEST
            )

        image.is_main = True
        image.save()

        return Response({
            "status": "Success",
            "message": "Main image updated",
        })

    except ProductImage.DoesNotExist:
        return Response(
            {"error": "Image not found"},
            status=status.HTTP_404_NOT_FOUND
        )
