from django.db.models import Sum, F, Q
from django.contrib.auth import logout

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token

from .models import (
    DonorCar,
    InventoryItem,
    UsedPart,
    AftermarketPart,
    ProductImage,
    Invoice,
)
from .serializers import (
    DonorCarSerializer,
    InventoryItemSerializer,
    UsedPartSerializer,
    AftermarketPartSerializer,
    ProductImageSerializer,
    InvoiceSerializer,
    LoginSerializer,
    CurrentUserSerializer,
    CreateUserSerializer,
)


class IsAdminRole(IsAuthenticated):
    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        if hasattr(user, 'staff_profile'):
            return user.staff_profile.role == 'ADMIN' and user.staff_profile.is_active_staff

        return False


class IsStaffOrAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        if hasattr(user, 'staff_profile'):
            return user.staff_profile.role in ['ADMIN', 'STAFF'] and user.staff_profile.is_active_staff

        return False


# ======================
# AUTH APIs
# ======================

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': CurrentUserSerializer(user).data,
        })


class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        logout(request)
        return Response({'message': 'Logged out successfully'})


class CurrentUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(CurrentUserSerializer(request.user).data)


class CreateStaffUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminRole]

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            'message': 'User created successfully',
            'user': CurrentUserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


# ======================
# INVENTORY MODULES
# ======================

class DonorCarListCreateView(generics.ListCreateAPIView):
    queryset = DonorCar.objects.all().order_by('-date_added')
    serializer_class = DonorCarSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsStaffOrAdmin()]
        return [IsAdminRole()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

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
        response_serializer = DonorCarSerializer(
            donor_car,
            context={'request': request}
        )
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class DonorCarDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DonorCar.objects.all()
    serializer_class = DonorCarSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsStaffOrAdmin()]
        return [IsAdminRole()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UsedPartListCreateView(generics.ListCreateAPIView):
    queryset = UsedPart.objects.all().order_by('-id')
    serializer_class = UsedPartSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = UsedPart.objects.all().order_by('-id')

        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        sale_status = self.request.query_params.get('sale_status')
        usage_type = self.request.query_params.get('usage_type')
        condition = self.request.query_params.get('condition')
        grade = self.request.query_params.get('grade')
        make = self.request.query_params.get('make')
        model = self.request.query_params.get('model')
        location = self.request.query_params.get('location')

        if category and category != 'All':
            queryset = queryset.filter(category=category)

        if sale_status and sale_status != 'All':
            queryset = queryset.filter(sale_status=sale_status)

        if usage_type and usage_type != 'All':
            queryset = queryset.filter(usage_type=usage_type)

        if condition and condition != 'All':
            queryset = queryset.filter(condition=condition)

        if grade and grade != 'All':
            queryset = queryset.filter(grade=grade)

        if make:
            queryset = queryset.filter(make__icontains=make)

        if model:
            queryset = queryset.filter(model__icontains=model)

        if location:
            queryset = queryset.filter(location__icontains=location)

        if search:
            queryset = queryset.filter(
                Q(part_name__icontains=search) |
                Q(part_number__icontains=search) |
                Q(category__icontains=search) |
                Q(subcategory__icontains=search) |
                Q(make__icontains=search) |
                Q(model__icontains=search) |
                Q(variant__icontains=search) |
                Q(description__icontains=search) |
                Q(condition_notes__icontains=search) |
                Q(public_notes__icontains=search) |
                Q(internal_notes__icontains=search) |
                Q(sku__icontains=search) |
                Q(label_id__icontains=search) |
                Q(qr_code_value__icontains=search) |
                Q(location__icontains=search) |
                Q(shelf_code__icontains=search)
            ).distinct()

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        used_part = serializer.save()

        images = request.FILES.getlist('images')
        for index, img in enumerate(images):
            ProductImage.objects.create(
                used_part=used_part,
                image=img,
                is_main=(index == 0),
            )

        response_serializer = UsedPartSerializer(
            used_part,
            context={'request': request}
        )
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class UsedPartDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UsedPart.objects.all()
    serializer_class = UsedPartSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        used_part = serializer.save()

        images = request.FILES.getlist('images')
        for index, img in enumerate(images):
            ProductImage.objects.create(
                used_part=used_part,
                image=img,
                is_main=(index == 0 and not used_part.images.filter(is_main=True).exists()),
            )

        response_serializer = UsedPartSerializer(
            used_part,
            context={'request': request}
        )
        return Response(response_serializer.data)


class InventoryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        inventory_item = serializer.save()

        images = request.FILES.getlist('images')
        for index, img in enumerate(images):
            ProductImage.objects.create(
                inventory_item=inventory_item,
                image=img,
                is_main=(index == 0 and not inventory_item.images.filter(is_main=True).exists()),
            )

        response_serializer = InventoryItemSerializer(
            inventory_item,
            context={'request': request}
        )
        return Response(response_serializer.data)


class AftermarketListCreateView(generics.ListCreateAPIView):
    queryset = AftermarketPart.objects.all().order_by('-id')
    serializer_class = AftermarketPartSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = AftermarketPart.objects.all().order_by('category', 'part_name')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if category and category != 'All':
            queryset = queryset.filter(category=category)

        if search:
            queryset = queryset.filter(
                Q(part_name__icontains=search) |
                Q(sku__icontains=search) |
                Q(label_id__icontains=search) |
                Q(location__icontains=search) |
                Q(supplier__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        aftermarket_part = serializer.save()

        images = request.FILES.getlist('images')
        for index, img in enumerate(images):
            ProductImage.objects.create(
                aftermarket_part=aftermarket_part,
                image=img,
                is_main=(index == 0),
            )

        response_serializer = AftermarketPartSerializer(
            aftermarket_part,
            context={'request': request}
        )
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class AftermarketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AftermarketPart.objects.all()
    serializer_class = AftermarketPartSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        aftermarket_part = serializer.save()

        images = request.FILES.getlist('images')
        for index, img in enumerate(images):
            ProductImage.objects.create(
                aftermarket_part=aftermarket_part,
                image=img,
                is_main=(index == 0 and not aftermarket_part.images.filter(is_main=True).exists()),
            )

        response_serializer = AftermarketPartSerializer(
            aftermarket_part,
            context={'request': request}
        )
        return Response(response_serializer.data)


class BulkDismantleView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        car_id = request.data.get('car_id')
        parts = request.data.get('parts', [])

        if not car_id:
            return Response({"error": "car_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(parts, list):
            return Response({"error": "parts must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            car = DonorCar.objects.get(id=car_id)
        except DonorCar.DoesNotExist:
            return Response({"error": "Donor Car not found"}, status=status.HTTP_404_NOT_FOUND)

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
            created_parts.append(
                InventoryItemSerializer(item, context={'request': request}).data
            )

        return Response(
            {
                "status": "Success",
                "message": f"Successfully generated {len(created_parts)} labels for {car.stock_number}",
                "parts": created_parts,
            },
            status=status.HTTP_201_CREATED,
        )


class GlobalSearchView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        query = (request.query_params.get('q') or '').strip()

        if not query:
            return Response({"used": [], "aftermarket": [], "dismantle": []})

        used_parts = UsedPart.objects.filter(
            Q(part_name__icontains=query) |
            Q(part_number__icontains=query) |
            Q(category__icontains=query) |
            Q(subcategory__icontains=query) |
            Q(make__icontains=query) |
            Q(model__icontains=query) |
            Q(variant__icontains=query) |
            Q(description__icontains=query) |
            Q(sku__icontains=query) |
            Q(label_id__icontains=query) |
            Q(qr_code_value__icontains=query) |
            Q(location__icontains=query) |
            Q(shelf_code__icontains=query)
        ).distinct()[:50]

        aftermarket_parts = AftermarketPart.objects.filter(
            Q(part_name__icontains=query) |
            Q(sku__icontains=query) |
            Q(label_id__icontains=query) |
            Q(location__icontains=query) |
            Q(status__icontains=query) |
            Q(category__icontains=query) |
            Q(description__icontains=query) |
            Q(supplier__icontains=query)
        ).distinct()[:50]

        dismantle_parts = InventoryItem.objects.filter(
            Q(part_name__icontains=query) |
            Q(category__icontains=query) |
            Q(label_id__icontains=query) |
            Q(location__icontains=query) |
            Q(status__icontains=query) |
            Q(condition_notes__icontains=query)
        ).distinct()[:50]

        return Response({
            "used": UsedPartSerializer(
                used_parts,
                many=True,
                context={'request': request}
            ).data,
            "aftermarket": AftermarketPartSerializer(
                aftermarket_parts,
                many=True,
                context={'request': request}
            ).data,
            "dismantle": InventoryItemSerializer(
                dismantle_parts,
                many=True,
                context={'request': request}
            ).data,
        })


class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.prefetch_related('items', 'service_detail').all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class BusinessSummaryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        try:
            revenue = Invoice.objects.aggregate(total=Sum('total_amount'))['total'] or 0
            used_parts_count = UsedPart.objects.count()
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
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        return AftermarketPart.objects.filter(
            quantity__lte=F('min_stock_level')
        ).order_by('quantity', 'part_name')


class ImageUploadView(generics.CreateAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStaffOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsStaffOrAdmin])
def set_main_image(request, image_id):
    try:
        image = ProductImage.objects.get(id=image_id)

        if image.used_part:
            ProductImage.objects.filter(used_part=image.used_part).update(is_main=False)
        elif image.inventory_item:
            ProductImage.objects.filter(inventory_item=image.inventory_item).update(is_main=False)
        elif image.donor_car:
            ProductImage.objects.filter(donor_car=image.donor_car).update(is_main=False)
        elif image.aftermarket_part:
            ProductImage.objects.filter(aftermarket_part=image.aftermarket_part).update(is_main=False)
        else:
            return Response({"error": "Image is not linked to any item"}, status=status.HTTP_400_BAD_REQUEST)

        image.is_main = True
        image.save()

        return Response({"status": "Success", "message": "Main image updated"})

    except ProductImage.DoesNotExist:
        return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)