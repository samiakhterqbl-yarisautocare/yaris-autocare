import os

from django.apps import AppConfig
from django.db.models.signals import post_migrate


def create_bootstrap_admin(sender, **kwargs):
    from django.contrib.auth.models import User

    username = os.getenv('BOOTSTRAP_ADMIN_USERNAME', 'admin')
    email = os.getenv('BOOTSTRAP_ADMIN_EMAIL', 'info@yarisautocare.com.au')
    password = os.getenv('BOOTSTRAP_ADMIN_PASSWORD', '12345678')
    enabled = os.getenv('BOOTSTRAP_ADMIN_ENABLED', 'True').lower() == 'true'

    if not enabled:
        return

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        print(f'Bootstrap admin created: {username}')


class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inventory'

    def ready(self):
        post_migrate.connect(create_bootstrap_admin, sender=self)