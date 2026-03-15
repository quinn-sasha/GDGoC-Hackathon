from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated


class ProjectViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return []
