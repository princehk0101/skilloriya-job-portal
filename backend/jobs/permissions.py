from rest_framework.permissions import BasePermission


class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'employer' or request.user.is_staff or request.user.is_superuser))


class IsSeeker(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'seeker' or request.user.is_staff or request.user.is_superuser))