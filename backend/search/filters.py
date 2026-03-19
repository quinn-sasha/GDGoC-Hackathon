import django_filters
from django.db.models import Q
from project.models import Project

# カンマ区切りの文字列を受け取り、IN検索（OR条件）を行うためのカスタムフィルター
class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


class ProjectSearchFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    category = CharInFilter(field_name='categories__slug', lookup_expr='in')
    technology = CharInFilter(field_name='technologies__name', lookup_expr='in')
    status = django_filters.CharFilter(field_name='progress_status', lookup_expr='exact')

    class Meta:
        model = Project
        fields = ['keyword', 'category', 'technology', 'status']

    def filter_keyword(self, queryset, name, value):
        """キーワード検索用のカスタムメソッド"""
        if not value:
            return queryset

        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(owner__username__icontains=value)
        )