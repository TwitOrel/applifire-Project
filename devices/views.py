from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Device
from .serializers import DeviceSerializer

# יצירת מכשיר חדש
class DeviceCreateView(generics.CreateAPIView):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        print(self.request.user)
        serializer.save(user=self.request.user)

# הצגת רשימת מכשירים של המשתמש
class DeviceListView(generics.ListAPIView):
    serializer_class = DeviceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # מחזיר את המכשירים של המשתמש המחובר
        return Device.objects.filter(user=self.request.user)

# הצגת מכשיר ספציפי
class DeviceDetailView(generics.RetrieveAPIView):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # מחפשים מכשיר לפי serial_number ולא guid
        return get_object_or_404(Device, serial_number=self.kwargs['serial_number'], user=self.request.user)


# עדכון מכשיר
class DeviceUpdateView(generics.UpdateAPIView):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # מחפשים מכשיר לפי serial_number ולא guid
        return get_object_or_404(Device, serial_number=self.kwargs['serial_number'], user=self.request.user)

# מחיקת מכשיר
class DeviceDeleteView(generics.DestroyAPIView):
    queryset = Device.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # מחפשים מכשיר לפי serial_number ולא guid
        return get_object_or_404(Device, serial_number=self.kwargs['serial_number'], user=self.request.user)

