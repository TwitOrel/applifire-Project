from django.db import models
from django.contrib.auth.models import User

class Device(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    serial_number = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    software_version = models.CharField(max_length=100)

    class Meta:
        unique_together = ('user', 'serial_number')

    def __str__(self):
        return f"User: {self.user.username} | Model: {self.model} | Serial: {self.serial_number} | Version: {self.software_version}"
