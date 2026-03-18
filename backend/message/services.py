import logging

from django.db import IntegrityError, transaction

from .models import Chatroom, ChatroomUser, PersonalChatroom

logger = logging.getLogger(__name__)


def get_or_create_personal_chatroom(user_a, user_b):
    """2ユーザー間の PERSONAL_CHAT を取得または作成する。

    user1_id < user2_id に正規化してペアを一意に管理する。

    Returns:
        (chatroom_id, created): chatroom_id は UUID、created は新規作成なら True。

    Raises:
        PersonalChatroom.DoesNotExist: IntegrityError 後に競合レコードが見つからない場合
            （PersonalChatroom 以外の制約違反を示す）。
    """
    u1_id, u2_id = sorted([user_a.id, user_b.id])

    # 既存ルームの確認
    try:
        personal = PersonalChatroom.objects.get(user1_id=u1_id, user2_id=u2_id)
        return personal.chatroom_id, False
    except PersonalChatroom.DoesNotExist:
        pass

    # 新規作成（PersonalChatroom の unique_together が競合時の安全弁）
    try:
        with transaction.atomic():
            chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
            ChatroomUser.objects.create(chatroom=chatroom, user=user_a)
            ChatroomUser.objects.create(chatroom=chatroom, user=user_b)
            PersonalChatroom.objects.create(
                chatroom=chatroom, user1_id=u1_id, user2_id=u2_id
            )
    except IntegrityError:
        # 同時リクエストによる競合 → 既存ルームを返す
        logger.warning(
            "PersonalChatroom 競合: user1_id=%s, user2_id=%s — 既存ルームを返します",
            u1_id,
            u2_id,
        )
        personal = PersonalChatroom.objects.get(user1_id=u1_id, user2_id=u2_id)
        return personal.chatroom_id, False

    return chatroom.id, True
