from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    path('admin/', admin.h.urls), # THIS LINE MUST BE HERE

    path('admin/', admin.site.urls),

    path('api/', include('inventory.urls')), # This connects your car parts logic
]

# This helps show images while you are developing locally
if settings.DEBUG:

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

