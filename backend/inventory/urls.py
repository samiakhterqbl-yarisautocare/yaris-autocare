from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    CreateStaffUserView,

    DonorCarListCreateView,
    DonorCarDetailView,
    UsedPartListCreateView,
    UsedPartDetailView,
    InventoryItemDetailView,
    AftermarketListCreateView,
    AftermarketDetailView,
    BulkDismantleView,
    GlobalSearchView,
    LowStockListView,
    ImageUploadView,
    set_main_image,
    BusinessSummaryView,

    InvoiceListCreateView,
    InvoiceDetailView,
    InvoiceSendEmailView,
)

urlpatterns = [
    # AUTH
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('auth/users/create/', CreateStaffUserView.as_view(), name='auth-create-user'),

    # DONOR CARS
    path('donor-cars/', DonorCarListCreateView.as_view(), name='donor-cars'),
    path('donor-cars/<int:pk>/', DonorCarDetailView.as_view(), name='donor-car-detail'),

    # USED PARTS
    path('used-parts/', UsedPartListCreateView.as_view(), name='used-parts-list'),
    path('used-parts/<int:pk>/', UsedPartDetailView.as_view(), name='used-part-detail'),

    # DISMANTLE PARTS
    path('dismantle-parts/<int:pk>/', InventoryItemDetailView.as_view(), name='dismantle-part-detail'),

    # AFTERMARKET
    path('aftermarket/', AftermarketListCreateView.as_view(), name='aftermarket-list'),
    path('aftermarket/<int:pk>/', AftermarketDetailView.as_view(), name='aftermarket-detail'),

    # OTHER MODULES
    path('bulk-create/', BulkDismantleView.as_view(), name='bulk-dismantle'),
    path('global-search/', GlobalSearchView.as_view(), name='global-search'),
    path('low-stock/', LowStockListView.as_view(), name='low-stock-list'),

    # IMAGES
    path('images/upload/', ImageUploadView.as_view(), name='image-upload'),
    path('images/<int:image_id>/set-main/', set_main_image, name='set-main-image'),

    # DASHBOARD
    path('summary/', BusinessSummaryView.as_view(), name='business-summary'),

    # INVOICES
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('invoices/<int:pk>/send-email/', InvoiceSendEmailView.as_view(), name='invoice-send-email'),
]