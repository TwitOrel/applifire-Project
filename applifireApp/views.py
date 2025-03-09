import os
from django.shortcuts import render
from django.core.mail import send_mail
from django.http import HttpResponse
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
    
    # יצירת לינק אימות
    verification_link = request.build_absolute_uri(
        reverse('verify-email', args=[str(pending_user.token)])
    )

    subject = "Confirm your registration - Todo List"
    message = f"""
    Hi {username},

    Click the link below to confirm your registration:
    {verification_link}

    If you didn't sign up, ignore this email.

    Thanks,
    The Todo List Team
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
                alert("✅ נרשמת בהצלחה!");
                window.location.href = "/";
            </script>
        """)
    
    except PendingUser.DoesNotExist:
        return HttpResponse("""
            <script>
                alert("❌ קישור לא תקף או שפג תוקפו.");
                window.location.href = "/";
            </script>
        """)

def send_test_email(request):
    subject = "מייל בדיקה מ-Django"
    message = "היי, זה מייל שנשלח מ-Django כדי לוודא שהכל עובד!"
    from_email = os.getenv("EMAIL.HOST_USER")
    recipient_list = ["oreltwito3@gmail.com"]  # שלח לעצמך

    send_mail(subject, message, from_email, recipient_list)
    return HttpResponse("מייל נשלח בהצלחה!")


@api_view(['POST'])
# @permission_classes([AllowAny])
def reset_password_confirm(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_object_or_404(User, pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid reset link'}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Invalid or expired reset link'}, status=400)

    # שינוי הסיסמה
    new_password = request.data.get('password')
    if not new_password:
        return Response({'error': 'Password is required'}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password successfully reset'})

@api_view(['POST'])
# @permission_classes([AllowAny])
def reset_password_request(request):
    email = request.data.get('email')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist'}, status=400)

    # יצירת לינק לאיפוס סיסמה
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    # בניית הלינק החדש - שולח לדף login עם פרמטרים ב-URL
    reset_link = request.build_absolute_uri(
        '/' + f'?reset=1&uidb64={uid}&token={token}'
    )

    # print(f"\n🔗 Password Reset Link: {reset_link}\n") # can print the link to terminal if mail doesnt working
    subject = 'Reset Your Password - Todo List'
    message = f"""
    Hi {user.username},

    We received a request to reset your password for your Todo List account.

    Click the link below to reset your password:
    {reset_link}

    If you didn't request this, please ignore this email.

    Thanks,
    The Todo List Team
    """

    send_mail(
        subject,
        message,
        from_email=os.getenv('EMAIL_HOST_USER'),
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({'message': 'Password reset link generated (check email)'})


def home(request):
    return render(request, 'index.html')

# @api_view(['POST'])
# def register_user(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")

    if not username or not password:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({'message': 'User registered successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "התחברת בהצלחה!",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })

    return Response({"error": "שם משתמש או סיסמה שגויים"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    return Response({"username": request.user.username})