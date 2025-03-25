from django.db import models
import uuid

from django.contrib.auth.models import User

class Device(models.Model):
    guid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    serial_number = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    software_version = models.CharField(max_length=100)

    class Meta:
        unique_together = ('user', 'serial_number')

    def __str__(self):
        return f"User: {self.user.username} | Model: {self.model} | Serial: {self.serial_number} | Version: {self.software_version}"

    # used to show short GUID in admin site
    def short_guid(self):
        return str(self.guid)[:8]
    short_guid.short_description = 'GUID'
