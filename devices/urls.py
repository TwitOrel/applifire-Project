from django.urls import path
from .views import DeviceListCreateView, DeviceDetailView

urlpatterns = [
    path('devices/', DeviceListCreateView.as_view()),
    path('devices/<str:serial_number>/', DeviceDetailView.as_view()),
]