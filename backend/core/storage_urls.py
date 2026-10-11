from django.urls import path
from .storage_views import StorageStatusView, UploadImageView, UploadPDFView

urlpatterns = [
    path('status/', StorageStatusView.as_view(), name='storage-status'),
    path('upload-image/', UploadImageView.as_view(), name='storage-upload-image'),
    path('upload-pdf/', UploadPDFView.as_view(), name='storage-upload-pdf'),
]
