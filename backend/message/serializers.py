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

    def _get_members_info(self, obj):
        """prefetchキャッシュを1回走査して自分・相手のメンバー情報を返す。
        PERSONAL_CHAT 専用。PROJECT_CHAT では other_member が不定になる点に注意。
        Returns (my_membership, other_member) タプル。
        """
        request = self.context.get("request")
        if not request:
            return None, None
        my_membership = None
        other_member = None
        for member in obj.members.all():
            if member.user_id == request.user.id:
                my_membership = member
            else:
                other_member = member
        return my_membership, other_member

    def get_other_user(self, obj):
        if obj.room_type != Chatroom.RoomType.PERSONAL_CHAT:
            return None
        _, other = self._get_members_info(obj)
        if other is None:
            return None
        user = other.user
        return {
            "id": user.id,
            "username": user.username,
            "icon_image_path": user.icon_image_path,
        }

    def get_last_message(self, obj):
        # _annotate_conversations() で付加されたアノテーションを使用（N+1 なし）
        if getattr(obj, "last_message_id", None) is None:
            return None
        return {
            "id": obj.last_message_id,
            "sender_username": obj.last_message_sender_username,
            "content": obj.last_message_content,
            "created_at": obj.last_message_created_at,
        }

    def get_unread_count(self, obj):
        # _annotate_conversations() で付加されたアノテーションを使用（N+1 なし）
        return getattr(obj, "unread_count", 0)
