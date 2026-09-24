from django.contrib import admin
from .models import Device

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('short_guid', 'user', 'model', 'serial_number', 'software_version')
    search_fields = ('user__username', 'serial_number', 'model')
    list_filter = ('model', 'software_version')
