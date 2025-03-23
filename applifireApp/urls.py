from django.urls import path
from .views import register_user, login_user, user_profile, reset_password_request, reset_password_confirm, verify_email
from.views import google_login_success, user_profile_view, api_key_view, change_password, delete_account

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('profile-name/', user_profile, name='profile-name'),

    # for showing profile
    path('profile/', user_profile_view, name='user-profile'),
    
    path('api-key/', api_key_view, name='api-key'),

    # let user change password
    path('change-password/', change_password, name='change-password'),

    # let user delete his own account
    path('delete-account/', delete_account, name='delete-account'),


    # confirm email after register
    path("api/verify-email/<uuid:token>/", verify_email, name="verify-email"),


    path('forgot-password/', reset_password_request, name='reset_password_request'),
    path('reset-password/<uidb64>/<token>/', reset_password_confirm, name='reset_password_confirm'),

    # login with google
    path("google-login-success/", google_login_success, name="google_login_success"),

]
