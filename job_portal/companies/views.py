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


# --- Microtask endpoints ---
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
)
from .serializers import MicrotaskSerializer
from .models import Microtask
from rest_framework.permissions import AllowAny
from rest_framework import serializers as drf_serializers


class MicrotaskCreateView(CreateAPIView):
    serializer_class = MicrotaskSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def perform_create(self, serializer):
        try:
            company = Company.objects.get(owner=self.request.user)
        except Company.DoesNotExist:
            raise drf_serializers.ValidationError("Create a company profile before posting microtasks.")

        serializer.save(company=company)


class MicrotaskListView(ListAPIView):
    queryset = Microtask.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = MicrotaskSerializer
    permission_classes = [AllowAny]


class MicrotaskDetailView(RetrieveAPIView):
    queryset = Microtask.objects.all()
    serializer_class = MicrotaskSerializer
    permission_classes = [AllowAny]


class MicrotaskUpdateView(UpdateAPIView):
    serializer_class = MicrotaskSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Microtask.objects.filter(company__owner=self.request.user)


class MicrotaskDeleteView(DestroyAPIView):
    serializer_class = MicrotaskSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Microtask.objects.filter(company__owner=self.request.user)