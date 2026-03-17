from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User
from .models import Chatroom, ChatroomUser, Message


def create_active_user(email, username, password="StrongPass123!"):
    user = User.objects.create_user(email=email, username=username, password=password)
    user.is_active = True
    user.save()
    return user


def auth_client(client, user):
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")


class ConversationAPITest(APITestCase):
    def setUp(self):
        self.user1 = create_active_user("user1@example.com", "user1")
        self.user2 = create_active_user("user2@example.com", "user2")
        auth_client(self.client, self.user1)
        self.list_url = reverse("conversation-list")

    def _detail_url(self, pk, suffix):
        return reverse(f"conversation-{suffix}", kwargs={"pk": pk})

    def test_create_conversation(self):
        response = self.client.post(self.list_url, {"user_id": self.user2.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Chatroom.objects.count(), 1)
        self.assertEqual(response.data["room_type"], "PERSONAL_CHAT")

    def test_create_conversation_reuse(self):
        self.client.post(self.list_url, {"user_id": self.user2.id})
        response = self.client.post(self.list_url, {"user_id": self.user2.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Chatroom.objects.count(), 1)

    def test_create_conversation_self(self):
        response = self.client.post(self.list_url, {"user_id": self.user1.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_conversations(self):
        chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user1)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user2)

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_list_unread_count(self):
        chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user1)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user2)

        # user2がメッセージを送信
        Message.objects.create(chatroom=chatroom, sender=self.user2, content="hello")
        Message.objects.create(chatroom=chatroom, sender=self.user2, content="world")

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["unread_count"], 2)

    def test_send_message(self):
        chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user1)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user2)

        url = self._detail_url(chatroom.id, "messages")
        response = self.client.post(url, {"content": "こんにちは"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["content"], "こんにちは")
        self.assertEqual(response.data["sender"]["username"], self.user1.username)
        self.assertEqual(response.data["sender"]["id"], self.user1.id)  # 整数型であることを確認

    def test_get_messages(self):
        chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user1)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user2)
        Message.objects.create(chatroom=chatroom, sender=self.user1, content="msg1")
        Message.objects.create(chatroom=chatroom, sender=self.user2, content="msg2")

        url = self._detail_url(chatroom.id, "messages")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

    def test_mark_read(self):
        chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user1)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user2)
        Message.objects.create(chatroom=chatroom, sender=self.user2, content="unread")

        url = self._detail_url(chatroom.id, "mark-read")
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        list_response = self.client.get(self.list_url)
        self.assertEqual(list_response.data["results"][0]["unread_count"], 0)

    def test_mark_read_no_messages(self):
        """メッセージが0件の状態で既読マークしても正常終了すること"""
        chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user1)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user2)

        url = self._detail_url(chatroom.id, "mark-read")
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        list_response = self.client.get(self.list_url)
        self.assertEqual(list_response.data["results"][0]["unread_count"], 0)

    def test_unauthorized_access(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_member_access(self):
        chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
        user3 = create_active_user("user3@example.com", "user3")
        ChatroomUser.objects.create(chatroom=chatroom, user=user3)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user2)

        url = self._detail_url(chatroom.id, "messages")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_member_cannot_post_message(self):
        """非メンバーはメッセージの送信もできないこと"""
        chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
        user3 = create_active_user("user3@example.com", "user3")
        ChatroomUser.objects.create(chatroom=chatroom, user=user3)
        ChatroomUser.objects.create(chatroom=chatroom, user=self.user2)

        url = self._detail_url(chatroom.id, "messages")
        response = self.client.post(url, {"content": "不正アクセス"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_conversation_nonexistent_user(self):
        """存在しないuser_idを指定すると400が返ること"""
        response = self.client.post(self.list_url, {"user_id": "99999999"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_conversation_response_fields(self):
        """create()のレスポンスにlast_message/unread_countフィールドが含まれること"""
        response = self.client.post(self.list_url, {"user_id": self.user2.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("last_message", response.data)
        self.assertIn("unread_count", response.data)
        self.assertIsNone(response.data["last_message"])
        self.assertEqual(response.data["unread_count"], 0)

    def test_create_conversation_reuse_response_fields(self):
        """既存ルーム返却(200)時もlast_message/unread_countが含まれること"""
        create_resp = self.client.post(self.list_url, {"user_id": self.user2.id})
        chatroom_id = create_resp.data["id"]
        self.client.post(
            reverse("conversation-messages", kwargs={"pk": chatroom_id}),
            {"content": "hello"},
        )
        response = self.client.post(self.list_url, {"user_id": self.user2.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data["last_message"])
        self.assertEqual(response.data["last_message"]["content"], "hello")
