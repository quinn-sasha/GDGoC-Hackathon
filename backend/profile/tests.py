from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User
from .models import TechSkill, UserSkill


def create_active_user(email, username, password="StrongPass123!"):
    user = User.objects.create_user(email=email, username=username, password=password)
    user.is_active = True
    user.save()
    return user


def auth_client(client, user):
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")


class MyProfileViewTests(APITestCase):
    def setUp(self):
        self.user = create_active_user("me@example.com", "me_user")
        auth_client(self.client, self.user)
        self.url = reverse("my-profile")

    def test_get_returns_own_profile_with_email(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_get_returns_skills(self):
        skill = TechSkill.objects.create(name="Python")
        UserSkill.objects.create(user=self.user, skill=skill)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["skills"]), 1)
        self.assertEqual(response.data["skills"][0]["name"], "Python")

    def test_patch_updates_profile_bio(self):
        response = self.client.patch(self.url, {"profile_bio": "hello"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.profile_bio, "hello")

    def test_patch_updates_skills(self):
        skill1 = TechSkill.objects.create(name="Python")
        skill2 = TechSkill.objects.create(name="Django")

        response = self.client.patch(self.url, {"skill_ids": [skill1.id, skill2.id]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.skills.count(), 2)

    def test_patch_cannot_change_email(self):
        response = self.client.patch(self.url, {"email": "other@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "me@example.com")

    def test_unauthenticated_user_cannot_access(self):
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserProfileViewTests(APITestCase):
    def setUp(self):
        self.me = create_active_user("me@example.com", "me_user")
        self.other = create_active_user("other@example.com", "other_user")
        auth_client(self.client, self.me)
        self.url = reverse("user-profile", kwargs={"pk": self.other.pk})

    def test_get_returns_profile_without_email(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("email", response.data)

    def test_get_returns_skills(self):
        skill = TechSkill.objects.create(name="Python")
        UserSkill.objects.create(user=self.other, skill=skill)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["skills"]), 1)

    def test_cannot_patch_other_user_profile(self):
        response = self.client.patch(self.url, {"profile_bio": "hacked"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_unauthenticated_user_cannot_access(self):
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
