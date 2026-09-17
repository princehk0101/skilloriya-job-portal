from rest_framework.permissions import BasePermission


class IsSeeker(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'seeker'


class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'employer'