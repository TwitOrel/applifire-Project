import os
from django.shortcuts import render
from django.core.mail import send_mail
from django.http import HttpResponse
from django.utils.encoding import force_str
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.core.mail import EmailMultiAlternatives
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.urls import reverse
from django.conf import settings
from django.shortcuts import redirect
from django.db import models
import uuid
from applifireApp.models import UserProfile
from allauth.socialaccount.models import SocialAccount
from .serializers import UserProfileSerializer
import secrets

def home(request):
    return render(request, 'index.html')

def signup_view(request):
    return render(request, 'signup.html')

def login_view(request):
    return redirect('/')

def dashboard_view(request):
    return render(request, "dashboard.html")

def password_reset_view(request):
    return render(request, "password_reset_form.html")

def reset_password_confirm_page_view(request):
    return render(request, 'reset_password_confirm.html')


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    password = request.data.get("password")

    # for user who has no password (like login with google)
    if not user.has_usable_password():
        user.delete()
        return Response({"message": f"User '{user.username}' deleted (OAuth User)"}, status=status.HTTP_204_NO_CONTENT)

    # 
    if not password:
        return Response({"error": "You must enter your password."}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(password):
        return Response({"error": "Invalid password."}, status=status.HTTP_401_UNAUTHORIZED)

    user.delete()
    return Response({"message": f"The user '{user.username}' was deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    # Check if the user has a usable (real) password
    if user.has_usable_password():
        # Require current password from regular users
        if not current_password:
            return Response({"error": "Current password is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    else:
        # Google login users shouldn't provide current password
        if current_password:
            return Response({"error": "This account uses Google login. You can only set a new password."}, status=status.HTTP_400_BAD_REQUEST)

    # Set the new password
    user.set_password(new_password)
    user.save()

    return Response({"message": "✅ Password changed successfully!"})

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def api_key_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response({"api_key": profile.api_key})

    elif request.method == 'POST':
        profile.generate_new_api_key()
        return Response({"api_key": profile.api_key}, status=status.HTTP_201_CREATED)

    elif request.method == 'DELETE':
        profile.api_key = None
        profile.save()
        return Response({"message": "API Key deleted."}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "phone": serializer.data.get("phone"),
            "address": serializer.data.get("address"),
            "api-key": serializer.data.get("api_key"),
            "guid": serializer.data.get("guid")
        })

    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "username": request.user.username,
                "email": request.user.email,
                "phone": serializer.data.get("phone"),
                "address": serializer.data.get("address"), 
                "api-key": serializer.data.get("api_key"),
                "guid": serializer.data.get("guid")  
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "id": user.id
    })

def google_login_success(request):
    if request.user.is_authenticated:
        refresh = RefreshToken.for_user(request.user)
        return JsonResponse({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": request.user.username
        })
    else:
        return JsonResponse({"error": "Authentication failed"}, status=400)

class PendingUser(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    username = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=150)

@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email is already in use"}, status=400)

    if PendingUser.objects.filter(email=email).exists():
        return JsonResponse({"error": "A confirmation email was already sent to this email"}, status=400)

    pending_user = PendingUser.objects.create(username=username, email=email, password=password)
    
    verification_link = request.build_absolute_uri(
        reverse('verify-email', args=[str(pending_user.token)])
    )

    subject = "Confirm your registration - Applifire"
    message = f"""
    Hi {username},

    Click the link below to confirm your registration:
    {verification_link}

    If you didn't sign up, ignore this email.

    Thanks,
    The Applifire Team
    """

    send_mail(
        subject,
        message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[email],
        fail_silently=False,
    )

    return JsonResponse({"message": "Confirmation email sent. Please check your email."})

@api_view(['GET'])
def verify_email(request, token):
    try:
        pending_user = PendingUser.objects.get(token=token)

        user = User.objects.create_user(
            username=pending_user.username,
            email=pending_user.email,
            password=pending_user.password
        )

        pending_user.delete()

        return HttpResponse("""
            <script>
                alert("Registration successful, wellcome! ✅");
                window.location.href = "/";
            </script>
        """)
    
    except PendingUser.DoesNotExist:
        return HttpResponse("""
            <script>
                alert(" Invalid or expired link. ❌");
                window.location.href = "/";
            </script>
        """)

@api_view(['POST'])
def set_new_password(request):
    uidb64 = request.data.get('uidb64')
    token = request.data.get('token')
    password = request.data.get('password')

    if not uidb64 or not token or not password:
        return Response({'error': 'Missing required data'}, status=400)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({'error': 'Invalid user'}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Invalid or expired token'}, status=400)

    user.set_password(password)
    user.save()

    return Response({'message': 'Password has been reset successfully'})

@api_view(['POST'])
def reset_password_confirm(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_object_or_404(User, pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid reset link'}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Invalid or expired reset link'}, status=400)

    new_password = request.data.get('password')
    if not new_password:
        return Response({'error': 'Password is required'}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password successfully reset'})

@api_view(['POST'])
def reset_password_request(request):
    username = request.data.get("username")
    email = request.data.get('email')

    try:
        user = User.objects.get(username=username, email=email)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist'}, status=400)

    # create link for reset password
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = request.build_absolute_uri(
        reverse('reset-password-page') + f'?uidb64={uid}&token={token}'
    )

    subject = 'Reset Your Password - Applifire'
    message = f"""
    Hi {user.username},

    We received a request to reset your password for your Applifire account.

    Click the link below to reset your password:
    {reset_link}

    If you didn't request this, please ignore this email.

    Thanks,
    The Applifire Team
    """

    send_mail(
        subject,
        message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({'message': 'Password reset link generated (check email)'})

@api_view(['POST'])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)

        # TODO test
        profile, created = UserProfile.objects.get_or_create(user=user)
        phone = profile.phone if profile.phone else "לא הוזן"
        print("📞 PHONE FROM PROFILE:", profile.phone)


        return Response({
            "message": "Successfully logged in!",   
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "phone": phone
        })

    return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    return Response({"username": request.user.username})