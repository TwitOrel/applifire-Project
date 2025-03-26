from rest_framework import serializers
from .models import Device

class DeviceSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Device
        fields = ['serial_number', 'model', 'software_version', 'guid', 'user']
        read_only_fields = ['user'] 

    def get_user(self, obj):
        return obj.user.username 

    def validate(self, data):
        user = self.context['request'].user
        serial = data.get('serial_number')
        if Device.objects.filter(user=user, serial_number=serial).exists():
            raise serializers.ValidationError(
                {"serial_number": "there are allready device with this serial number to this user."}
            )
        return data