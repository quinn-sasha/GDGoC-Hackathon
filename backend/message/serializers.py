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
        # list() では messages_cache（Prefetch to_attr）を使うため N+1 が発生しない。
        # create() など非プリフェッチ時はフォールバッククエリを使用。
        msgs = getattr(obj, Chatroom.MESSAGES_PREFETCH_ATTR, None)
        if msgs is not None:
            if not msgs:
                return None
            last = msgs[-1]  # order_by("created_at") なので末尾が最新
        else:
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
        membership, _ = self._get_members_info(obj)
        if membership is None:
            return 0
        # list() では messages_cache を使って Python 側で計算（N+1 回避）。
        # uuid7 は時刻順にソート可能なため id 比較が正確。
        msgs = getattr(obj, Chatroom.MESSAGES_PREFETCH_ATTR, None)
        if msgs is not None:
            if membership.last_read_message is None:
                return len(msgs)
            return sum(1 for m in msgs if m.id > membership.last_read_message.id)
        # create() など非プリフェッチ時のフォールバック（単一オブジェクトなので許容）
        if membership.last_read_message is None:
            return obj.messages.count()
        return obj.messages.filter(id__gt=membership.last_read_message.id).count()
