from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

class AuthenticationTests(TestCase):
    def setUp(self):
        """Create a test user before running tests"""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="TestPass123")
        self.login_url = "/api/login/"
        self.register_url = "/api/register/"
        self.profile_url = "/api/profile/"

    def test_user_registration(self):
        """Test if a new user can register"""
        response = self.client.post(self.register_url, {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "NewPass123"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)

    def test_user_login(self):
        """Test if a user can log in successfully"""
        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "TestPass123"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)  # Check if access token is returned

    def test_access_profile_requires_authentication(self):
        """Test if accessing profile requires authentication"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)  # Expect unauthorized

    def test_profile_access_with_valid_token(self):
        """Test if logged-in user can access profile"""
        login_response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "TestPass123"
        })
        access_token = login_response.data.get("access")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_request(self):
        """Test if user can request a password reset"""
        response = self.client.post("/forgot-password/", {
            "email": "testuser@example.com"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

