from django.urls import path
from .views import register_user, login_user, user_profile, reset_password_request, reset_password_confirm, verify_email
<<<<<<< HEAD
=======
from.views import google_login_success
>>>>>>> addingGoogleConnection

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('profile/', user_profile, name='profile'),
    path("api/verify-email/<uuid:token>/", verify_email, name="verify-email"),
    path('forgot-password/', reset_password_request, name='reset_password_request'),
    path('reset-password/<uidb64>/<token>/', reset_password_confirm, name='reset_password_confirm'),
<<<<<<< HEAD
=======

    path("google-login-success/", google_login_success, name="google_login_success"),

>>>>>>> addingGoogleConnection
]
