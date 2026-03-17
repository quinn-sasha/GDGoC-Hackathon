from rest_framework import serializers

from .models import Chatroom, Message


class SenderSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    username = serializers.CharField()
    icon_image_path = serializers.CharField()


class MessageSerializer(serializers.ModelSerializer):
    sender = SenderSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "content", "created_at"]
        read_only_fields = ["id", "sender", "created_at"]


class ConversationListSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    project_id = serializers.UUIDField(read_only=True, allow_null=True)

    class Meta:
        model = Chatroom
        fields = [
            "id",
            "room_type",
            "project_id",
            "other_user",
            "last_message",
            "unread_count",
            "updated_at",
        ]

    def _get_my_membership(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        for member in obj.members.all():
            if member.user_id == request.user.id:
                return member
        return None

    def get_other_user(self, obj):
        if obj.room_type != Chatroom.RoomType.PERSONAL_CHAT:
            return None
        request = self.context.get("request")
        for member in obj.members.all():
            if member.user_id != request.user.id:
                user = member.user
                return {
                    "id": user.id,
                    "username": user.username,
                    "icon_image_path": user.icon_image_path,
                }
        return None

    def get_last_message(self, obj):
        messages = list(obj.messages.all())
        if not messages:
            return None
        last = messages[-1]
        return {
            "id": last.id,
            "sender_username": last.sender.username,
            "content": last.content,
            "created_at": last.created_at,
        }

    def get_unread_count(self, obj):
        membership = self._get_my_membership(obj)
        if membership is None:
            return 0
        if membership.last_read_message is None:
            return obj.messages.count()
        return obj.messages.filter(
            created_at__gt=membership.last_read_message.created_at
        ).count()
