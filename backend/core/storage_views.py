from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .storage_service import (
    upload_image_to_imagekit,
    upload_pdf_to_supabase,
    is_imagekit_configured,
    is_supabase_configured,
)


class StorageStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "imagekit_configured": is_imagekit_configured(),
            "supabase_configured": is_supabase_configured(),
            "mode": "cloud" if (is_imagekit_configured() or is_supabase_configured()) else "local",
        })


class UploadImageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image = request.FILES.get('image') or request.FILES.get('file')
        if not image:
            return Response({"error": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST)

        folder = request.data.get('folder', 'profile_images')
        url = upload_image_to_imagekit(image, folder=folder)
        if url:
            return Response({
                "success": True,
                "url": url,
                "storage": "imagekit",
                "message": "Image uploaded successfully to ImageKit CDN."
            })

        return Response({
            "success": False,
            "error": "ImageKit is not configured or upload failed. Verify your IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env."
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class UploadPDFView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        pdf = request.FILES.get('pdf') or request.FILES.get('resume') or request.FILES.get('file')
        if not pdf:
            return Response({"error": "No PDF file provided."}, status=status.HTTP_400_BAD_REQUEST)

        bucket = request.data.get('bucket', 'resumes')
        url = upload_pdf_to_supabase(pdf, bucket=bucket)
        if url:
            return Response({
                "success": True,
                "url": url,
                "storage": "supabase",
                "message": "PDF uploaded successfully to Supabase Storage."
            })

        return Response({
            "success": False,
            "error": "Supabase Storage is not configured or upload failed. Verify your SUPABASE_URL, SUPABASE_KEY, and SUPABASE_BUCKET_NAME in .env."
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
