"""
GCS (Cloud Storage) への画像アップロードヘルパー
GCS_BUCKET_NAME 環境変数が未設定の場合は ImproperlyConfigured を送出する
"""
import os
import uuid
from django.core.exceptions import ImproperlyConfigured


def upload_image(file_obj, dest_path: str) -> str:
    """
    file_obj を GCS の dest_path にアップロードして公開 URL を返す。

    Args:
        file_obj: Django の UploadedFile オブジェクト
        dest_path: バケット内の保存先パス (例: "projects/uuid/image.jpg")

    Returns:
        公開 URL (例: "https://storage.googleapis.com/{bucket}/{path}")

    Raises:
        ImproperlyConfigured: GCS_BUCKET_NAME が未設定
    """
    bucket_name = os.getenv("GCS_BUCKET_NAME", "")
    if not bucket_name:
        raise ImproperlyConfigured(
            "GCS_BUCKET_NAME 環境変数が設定されていません。"
        )

    from google.cloud import storage

    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(dest_path)
    blob.upload_from_file(file_obj, content_type=file_obj.content_type)
    return f"https://storage.googleapis.com/{bucket_name}/{dest_path}"


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
