from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register_user, login_user, user_profile, reset_password_request, reset_password_confirm, verify_email
from .views import google_login_success, user_profile_view, api_key_view, change_password, delete_account, dashboard_view, password_reset_view, reset_password_confirm_page_view
from . import views
from .views import set_new_password, user_info

# 📄 דפי HTML
urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('password_reset/', views.password_reset_view, name='password_reset'),
    path('reset-password/', views.reset_password_confirm_page_view, name='reset-password-page'),

]

# 🌐 API נתיבי
urlpatterns += [
    path('api/login/', login_user, name='api-login'),
    path('api/register/', register_user, name='api-register'),
    path('api/profile-name/', user_profile, name='profile-name'),
    path('api/profile/', user_profile_view, name='user-profile'),
    path('api/api-key/', api_key_view, name='api-key'),
    path('api/change-password/', change_password, name='change-password'),
    path('api/delete-account/', delete_account, name='delete-account'),
    # 2 funcs bellow used for remember me check-box (when log in)
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # confirm email after register
    path('api/verify-email/<uuid:token>/', verify_email, name='verify-email'),
    path('api/forgot-password/', reset_password_request, name='reset_password_request'),
    path('api/set-new-password/', set_new_password, name='set-new-password'),
    ## path('api/reset-password/<uidb64>/<token>/', views.reset_password_confirm, name='reset_password_confirm'),
    # login with google
    path('api/google-login-success/', google_login_success, name='google_login_success'),
]
