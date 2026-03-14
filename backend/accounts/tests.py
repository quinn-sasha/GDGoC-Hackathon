from django.test import TestCase

from .models import EmailVerificationToken, User
from .serializers import UserRegistrationSerializer


class UserModelTests(TestCase):
    def test_user_ids_are_generated_per_instance(self):
        first_user = User.objects.create_user(
            email="first@example.com",
            username="first_user",
            password="StrongPass123!",
        )
        second_user = User.objects.create_user(
            email="second@example.com",
            username="second_user",
            password="StrongPass123!",
        )

        self.assertNotEqual(first_user.id, second_user.id)

    def test_verification_tokens_are_unique(self):
        first_user = User.objects.create_user(
            email="first@example.com",
            username="first_user",
            password="StrongPass123!",
        )
        second_user = User.objects.create_user(
            email="second@example.com",
            username="second_user",
            password="StrongPass123!",
        )

        first_token = EmailVerificationToken.objects.create(user=first_user)
        second_token = EmailVerificationToken.objects.create(user=second_user)

        self.assertNotEqual(first_token.token, second_token.token)


class UserRegistrationSerializerTests(TestCase):
    def test_rejects_invalid_username(self):
        serializer = UserRegistrationSerializer(
            data={
                "email": "user@example.com",
                "username": "ab",
                "password": "StrongPass123!",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("username", serializer.errors)

    def test_creates_user(self):
        serializer = UserRegistrationSerializer(
            data={
                "email": "user@example.com",
                "username": "valid_user",
                "password": "StrongPass123!",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertEqual(user.email, "user@example.com")
        self.assertEqual(user.username, "valid_user")
        self.assertTrue(user.check_password("StrongPass123!"))
