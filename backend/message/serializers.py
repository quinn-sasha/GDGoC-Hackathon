from rest_framework import serializers

from .models import Chatroom, Message


class SenderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
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
    project_id = serializers.UUIDField(read_only=True)

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
        last = obj.messages.select_related("sender").order_by("-created_at").first()
        if last is None:
            return None
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
        # uuid7 は時刻順にソート可能なため、id__gt で既読より新しいメッセージを正確にカウントできる。
        # created_at__gt だとミリ秒以下の精度で同時刻メッセージを取りこぼす可能性があるため使わない。
        return obj.messages.filter(
            id__gt=membership.last_read_message.id
        ).count()
