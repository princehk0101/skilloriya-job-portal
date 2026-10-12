import os
import io
import time
import uuid
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Try importing imagekitio and supabase
try:
    from imagekitio import ImageKit
except ImportError:
    ImageKit = None

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None


def is_imagekit_configured():
    pub = getattr(settings, 'IMAGEKIT_PUBLIC_KEY', '') or os.getenv('IMAGEKIT_PUBLIC_KEY', '')
    priv = getattr(settings, 'IMAGEKIT_PRIVATE_KEY', '') or os.getenv('IMAGEKIT_PRIVATE_KEY', '')
    endpoint = getattr(settings, 'IMAGEKIT_URL_ENDPOINT', '') or os.getenv('IMAGEKIT_URL_ENDPOINT', '')
    return bool(pub and priv and endpoint and not pub.startswith('your_'))


def is_supabase_configured():
    url = getattr(settings, 'SUPABASE_URL', '') or os.getenv('SUPABASE_URL', '')
    key = getattr(settings, 'SUPABASE_KEY', '') or os.getenv('SUPABASE_KEY', '') or os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    return bool(url and key and not url.startswith('your_') and not str(url).startswith('https://your-project'))


def get_imagekit_client():
    if not ImageKit or not is_imagekit_configured():
        return None
    try:
        priv = getattr(settings, 'IMAGEKIT_PRIVATE_KEY', '') or os.getenv('IMAGEKIT_PRIVATE_KEY', '')
        return ImageKit(private_key=priv)
    except Exception as e:
        logger.exception("Failed initializing ImageKit client: %s", e)
        return None


def upload_image_to_imagekit(file_obj, file_name=None, folder="profile_images"):
    """
    Upload an image file to ImageKit using ImageKit SDK or direct REST API.
    Returns: The public CDN URL if successful, otherwise None.
    """
    priv = getattr(settings, 'IMAGEKIT_PRIVATE_KEY', '') or os.getenv('IMAGEKIT_PRIVATE_KEY', '')
    if not priv:
        return None

    try:
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
        content = file_obj.read() if hasattr(file_obj, 'read') else file_obj
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)

        original_name = getattr(file_obj, 'name', '') or file_name or f"image_{int(time.time())}.jpg"
        clean_name = f"{uuid.uuid4().hex[:12]}_{os.path.basename(original_name)}"

        ik = get_imagekit_client()
        if ik and hasattr(ik, 'files') and hasattr(ik.files, 'upload'):
            res = ik.files.upload(
                file=content,
                file_name=clean_name,
                folder=folder,
                use_unique_file_name=True
            )
            url = getattr(res, 'url', None) or (res.get('url') if isinstance(res, dict) else None)
            if url:
                logger.info("Successfully uploaded image to ImageKit: %s", url)
                return url

        # Direct REST API fallback
        import requests
        from requests.auth import HTTPBasicAuth
        resp = requests.post(
            'https://upload.imagekit.io/api/v1/files/upload',
            files={'file': (clean_name, content)},
            data={'fileName': clean_name, 'folder': folder, 'useUniqueFileName': 'true'},
            auth=HTTPBasicAuth(priv, ''),
            timeout=20
        )
        if resp.status_code == 200:
            data = resp.json()
            url = data.get('url')
            logger.info("Uploaded via ImageKit REST API: %s", url)
            return url
        else:
            logger.error("ImageKit upload failed (%s): %s", resp.status_code, resp.text)
            return None
    except Exception as e:
        logger.exception("ImageKit upload error: %s", e)
        return None


def upload_pdf_to_supabase(file_obj, file_name=None, bucket="resumes"):
    """
    Upload a PDF or document file to Supabase Storage.
    Returns: The public URL of the uploaded document, otherwise None.
    """
    supabase = get_supabase_client()
    if not supabase:
        return None

    try:
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)

        if hasattr(file_obj, 'read'):
            content = file_obj.read()
            if hasattr(file_obj, 'seek'):
                file_obj.seek(0)
        else:
            content = file_obj

        original_name = getattr(file_obj, 'name', '') or file_name or f"doc_{int(time.time())}.pdf"
        target_bucket = getattr(settings, 'SUPABASE_BUCKET_NAME', bucket) or bucket
        storage_path = f"{uuid.uuid4().hex[:8]}_{os.path.basename(original_name)}"

        # Attempt upload with upsert
        supabase.storage.from_(target_bucket).upload(
            path=storage_path,
            file=content,
            file_options={
                "content-type": "application/pdf" if original_name.lower().endswith('.pdf') else "application/octet-stream",
                "upsert": "true"
            }
        )

        # Retrieve public URL
        url_res = supabase.storage.from_(target_bucket).get_public_url(storage_path)
        logger.info("Successfully uploaded PDF to Supabase Storage: %s", url_res)
        return url_res
    except Exception as e:
        logger.exception("Supabase Storage upload error: %s", e)
        return None


def upload_pdf_to_imagekit(file_obj, file_name=None, folder="resumes"):
    """
    Upload a PDF, DOCX, or document file to ImageKit.
    ImageKit supports storing all binary types including PDFs, DOCX, TXT.
    Returns: The public CDN URL of the document, otherwise None.
    """
    priv = getattr(settings, 'IMAGEKIT_PRIVATE_KEY', '') or os.getenv('IMAGEKIT_PRIVATE_KEY', '')
    if not priv:
        return None

    try:
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
        content = file_obj.read() if hasattr(file_obj, 'read') else file_obj
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)

        original_name = getattr(file_obj, 'name', '') or file_name or f"resume_{int(time.time())}.pdf"
        clean_name = f"{uuid.uuid4().hex[:12]}_{os.path.basename(original_name)}"

        ik = get_imagekit_client()
        if ik and hasattr(ik, 'files') and hasattr(ik.files, 'upload'):
            res = ik.files.upload(
                file=content,
                file_name=clean_name,
                folder=folder,
                use_unique_file_name=True
            )
            url = getattr(res, 'url', None) or (res.get('url') if isinstance(res, dict) else None)
            if url:
                logger.info("Successfully uploaded PDF to ImageKit: %s", url)
                return url

        # Direct REST API fallback
        import requests
        from requests.auth import HTTPBasicAuth
        resp = requests.post(
            'https://upload.imagekit.io/api/v1/files/upload',
            files={'file': (clean_name, content)},
            data={'fileName': clean_name, 'folder': folder, 'useUniqueFileName': 'true'},
            auth=HTTPBasicAuth(priv, ''),
            timeout=30
        )
        if resp.status_code == 200:
            data = resp.json()
            url = data.get('url')
            logger.info("Uploaded PDF via ImageKit REST API: %s", url)
            return url
        else:
            logger.error("ImageKit PDF upload failed (%s): %s", resp.status_code, resp.text)
            return None
    except Exception as e:
        logger.exception("ImageKit PDF upload error: %s", e)
        return None


def upload_file_any(file_obj, file_name=None, folder="resumes"):
    """
    Unified uploader:
    1. First tries ImageKit (if configured).
    2. Then tries Supabase (if configured).
    3. Returns the resulting cloud URL, or None if no cloud storage is configured.
    """
    if is_imagekit_configured():
        return upload_pdf_to_imagekit(file_obj, file_name=file_name, folder=folder)
    if is_supabase_configured():
        return upload_pdf_to_supabase(file_obj, file_name=file_name, bucket=folder)
    return None

