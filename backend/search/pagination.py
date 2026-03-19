from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class SearchPagination(PageNumberPagination):
    page_size = 10  # default
    page_size_query_param = 'page_size'
    max_page_size = 50

    def get_paginated_response(self, data):
        """
        レスポンスの構造を { meta: {...}, results: [...] } の形式にカスタマイズ
        """
        return Response({
            'meta': {
                'total_count': self.page.paginator.count,
                'current_page': self.page.number,
                'total_pages': self.page.paginator.num_pages,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
            },
            'results': data
        })