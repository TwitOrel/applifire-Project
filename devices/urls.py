from django.urls import path
from .views import DeviceCreateView, DeviceDetailView, DeviceListView, DeviceUpdateView, DeviceDeleteView

urlpatterns = [
    path('devices/', DeviceListView.as_view(), name='device-list'),  
    path('devices/create/', DeviceCreateView.as_view(), name='device-create'), 
    path('devices/<str:serial_number>/', DeviceDetailView.as_view(), name='device-detail'),
    path('devices/<str:serial_number>/update/', DeviceUpdateView.as_view(), name='device-update'),
    path('devices/<str:serial_number>/delete/', DeviceDeleteView.as_view(), name='device-delete')
]