import secrets
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True) 
    api_key = models.CharField(max_length=64, unique=True, blank=True, null=True)

    def generate_new_api_key(self):
        while True:
            key = secrets.token_hex(32)
            if not UserProfile.objects.filter(api_key=key).exists():
                self.api_key = key
                self.save()
                break

    def __str__(self):
        parts = [f"Username: {self.user.username}"]
        if self.phone:
            parts.append(f"Phone: {self.phone}")
        if self.address:
            parts.append(f"Address: {self.address}")
        if self.api_key:
            parts.append(f"API Key: {self.api_key[:8]}...")
        return " | ".join(parts)

