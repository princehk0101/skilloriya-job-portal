from rest_framework.generics import (
    CreateAPIView,
    RetrieveAPIView,
    UpdateAPIView,
    ListAPIView,
    DestroyAPIView
)

from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Company
from .serializers import CompanySerializer
from .permissions import IsEmployer


# Employer creates company
class CompanyCreateView(CreateAPIView):

    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# Public list companies
class CompanyListView(ListAPIView):

    queryset = Company.objects.all().order_by('-created_at')
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]


# Public company detail
class CompanyDetailView(RetrieveAPIView):

    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]


# Employer updates own company
class CompanyUpdateView(UpdateAPIView):

    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Company.objects.filter(owner=self.request.user)


# Employer deletes company
class CompanyDeleteView(DestroyAPIView):

    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Company.objects.filter(owner=self.request.user)