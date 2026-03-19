"""
GCS (Cloud Storage) への画像アップロードヘルパー
GCS_BUCKET_NAME 環境変数が未設定の場合はローカルファイルシステムに保存する
"""
import os
import uuid
from rest_framework import serializers

# ---- マジックバイト定義 ----
_MAGIC = [
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"GIF87a", "image/gif"),
    (b"GIF89a", "image/gif"),
    (b"RIFF", "image/webp"),   # RIFF????WEBP — 後続チェックあり
]

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def detect_image_type(file_obj) -> str | None:
    """
    ファイルの先頭バイト（マジックバイト）から実際の画像形式を返す。
    判別できなければ None を返す。
    """
    header = file_obj.read(12)
    file_obj.seek(0)

    for magic, mime in _MAGIC:
        if header[:len(magic)] == magic:
            # WebP は RIFF????WEBP の形式なので追加確認
            if mime == "image/webp" and header[8:12] != b"WEBP":
                continue
            return mime
    return None


def validate_image_file(file) -> None:
    """
    アップロードファイルのサイズ・マジックバイトを検証する。
    バリデーション失敗時は serializers.ValidationError を送出する。
    """
    if file.size > MAX_FILE_SIZE:
        raise serializers.ValidationError("ファイルサイズは 5MB 以内にしてください。")

    actual_type = detect_image_type(file)
    if actual_type not in ALLOWED_CONTENT_TYPES:
        raise serializers.ValidationError(
            "JPEG・PNG・WebP・GIF のみアップロードできます。"
        )


# ---- GCS クライアント（遅延初期化・再利用） ----
_gcs_client = None


def _get_client():
    global _gcs_client
    if _gcs_client is None:
        from google.cloud import storage
        _gcs_client = storage.Client()
    return _gcs_client


def upload_image(file_obj, dest_path: str) -> str:
    """
    file_obj を GCS の dest_path にアップロードして公開 URL を返す。
    GCS_BUCKET_NAME が未設定の場合はローカルファイルシステムに保存する。

    Args:
        file_obj: Django の UploadedFile オブジェクト
        dest_path: 保存先パス (例: "projects/uuid/image.jpg")

    Returns:
        公開 URL
    """
    bucket_name = os.getenv("GCS_BUCKET_NAME", "")
    if not bucket_name:
        return _upload_local(file_obj, dest_path)

    actual_type = detect_image_type(file_obj)
    client = _get_client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(dest_path)
    blob.upload_from_file(file_obj, content_type=actual_type)
    blob.make_public()
    return blob.public_url


def _upload_local(file_obj, dest_path: str) -> str:
    """GCS 未設定時のローカルフォールバック。MEDIA_ROOT に保存してURLを返す。"""
    import pathlib
    from django.conf import settings

    save_path = pathlib.Path(settings.MEDIA_ROOT) / dest_path
    save_path.parent.mkdir(parents=True, exist_ok=True)
    file_obj.seek(0)
    with open(save_path, "wb") as f:
        f.write(file_obj.read())
    base_url = os.getenv("BACKEND_BASE_URL", "http://localhost:8000").rstrip("/")
    media_url = getattr(settings, "MEDIA_URL", "/media/")
    return f"{base_url}{media_url}{dest_path}"


def build_project_image_path(project_id: str, filename: str) -> str:
    ext = _get_ext(filename)
    return f"projects/{project_id}/image{ext}"


def build_user_icon_path(user_id: int, filename: str) -> str:
    ext = _get_ext(filename)
    token = uuid.uuid4().hex[:8]
    return f"users/{user_id}/icon_{token}{ext}"


def _get_ext(filename: str) -> str:
    if "." in filename:
        return "." + filename.rsplit(".", 1)[-1].lower()
    return ""
