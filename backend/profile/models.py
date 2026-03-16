from django.conf import settings
from django.db import models


class TechSkill(models.Model):
    """技術スキルマスター（正規化済みの選択肢）"""

    name = models.CharField("スキル名", max_length=50, unique=True)

    class Meta:
        verbose_name = "技術スキル"
        verbose_name_plural = "技術スキル"

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    """ユーザーが持つ技術スキル（中間テーブル）"""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="ユーザー",
    )
    skill = models.ForeignKey(
        TechSkill,
        on_delete=models.CASCADE,
        verbose_name="スキル",
    )

    class Meta:
        verbose_name = "ユーザースキル"
        verbose_name_plural = "ユーザースキル"
        unique_together = [("user", "skill")]

    def __str__(self):
        return f"{self.user} - {self.skill}"
