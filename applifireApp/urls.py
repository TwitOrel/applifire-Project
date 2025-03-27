from django.urls import path
from .views import register_user, login_user, user_profile, reset_password_request, reset_password_confirm, verify_email
from.views import google_login_success, user_profile_view, api_key_view, change_password, delete_account, dashboard_view, password_reset_view
from . import views

# 📄 דפי HTML
urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('password_reset/', views.password_reset_view, name='password_reset'),
]

# 🌐 API נתיבי
urlpatterns += [
    path('api/login/', views.login_user, name='api-login'),
    path('api/register/', views.register_user, name='api-register'),
    path('api/profile-name/', views.user_profile, name='profile-name'),
    path('api/profile/', views.user_profile_view, name='user-profile'),
    path('api/api-key/', views.api_key_view, name='api-key'),
    path('api/change-password/', views.change_password, name='change-password'),
    path('api/delete-account/', views.delete_account, name='delete-account'),
    # confirm email after register
    path('api/verify-email/<uuid:token>/', views.verify_email, name='verify-email'),
    path('api/forgot-password/', views.reset_password_request, name='reset_password_request'),
    path('api/reset-password/<uidb64>/<token>/', views.reset_password_confirm, name='reset_password_confirm'),
    # login with google
    path('api/google-login-success/', views.google_login_success, name='google_login_success'),
]
