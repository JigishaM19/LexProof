import os
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("LexProof.StorageService")

class StorageAdapter(ABC):
    @abstractmethod
    def save_file(self, content: bytes, safe_filename: str, content_type: str = "application/octet-stream") -> str:
        """Saves file and returns persistent storage path or key."""
        pass

    @abstractmethod
    def read_file(self, storage_path: str) -> bytes:
        """Reads file bytes from storage."""
        pass

    @abstractmethod
    def delete_file(self, storage_path: str) -> bool:
        """Deletes file from storage."""
        pass

    @abstractmethod
    def file_exists(self, storage_path: str) -> bool:
        """Checks if file exists in storage."""
        pass

    @abstractmethod
    def get_access_info(self, storage_path: str, filename: Optional[str] = None) -> Dict[str, Any]:
        """Returns access dictionary: {'type': 'local'|'s3_presigned', 'path': ..., 'url': ...}."""
        pass


class LocalStorageAdapter(StorageAdapter):
    def __init__(self, upload_dir: str):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def save_file(self, content: bytes, safe_filename: str, content_type: str = "application/octet-stream") -> str:
        os.makedirs(self.upload_dir, exist_ok=True)
        file_path = os.path.join(self.upload_dir, safe_filename)
        with open(file_path, "wb") as f:
            f.write(content)
        return file_path

    def read_file(self, storage_path: str) -> bytes:
        if not os.path.exists(storage_path):
            raise FileNotFoundError(f"File not found on local disk: {storage_path}")
        with open(storage_path, "rb") as f:
            return f.read()

    def delete_file(self, storage_path: str) -> bool:
        if os.path.exists(storage_path):
            try:
                os.remove(storage_path)
                return True
            except Exception as e:
                logger.warning(f"Error removing local file {storage_path}: {e}")
                return False
        return False

    def file_exists(self, storage_path: str) -> bool:
        return os.path.exists(storage_path)

    def get_access_info(self, storage_path: str, filename: Optional[str] = None) -> Dict[str, Any]:
        return {
            "type": "local",
            "path": storage_path,
            "exists": os.path.exists(storage_path),
            "filename": filename or os.path.basename(storage_path),
        }


class S3StorageAdapter(StorageAdapter):
    def __init__(self, bucket_name: str, region: str, access_key: Optional[str] = None, 
                 secret_key: Optional[str] = None, endpoint_url: Optional[str] = None, 
                 prefix: str = "documents"):
        self.bucket_name = bucket_name
        self.region = region
        self.prefix = prefix.strip("/")
        self.endpoint_url = endpoint_url
        self.local_fallback = LocalStorageAdapter(settings.UPLOAD_DIR)

        try:
            import boto3
            from botocore.config import Config
            client_kwargs = {
                "service_name": "s3",
                "region_name": self.region,
                "config": Config(signature_version="s3v4")
            }
            if access_key and secret_key:
                client_kwargs["aws_access_key_id"] = access_key
                client_kwargs["aws_secret_access_key"] = secret_key
            if endpoint_url:
                client_kwargs["endpoint_url"] = endpoint_url

            self.s3_client = boto3.client(**client_kwargs)
            self.is_active = True
            logger.info(f"S3StorageAdapter initialized for bucket '{self.bucket_name}' (region: {self.region}).")
        except Exception as e:
            logger.warning(f"Failed to initialize S3 client: {e}. Falling back to local storage.")
            self.s3_client = None
            self.is_active = False

    def _get_key(self, safe_filename: str) -> str:
        return f"{self.prefix}/{safe_filename}" if self.prefix else safe_filename

    def save_file(self, content: bytes, safe_filename: str, content_type: str = "application/octet-stream") -> str:
        # Also maintain local cache copy for fast OCR/vision access
        local_path = self.local_fallback.save_file(content, safe_filename, content_type)
        if not self.is_active or not self.s3_client:
            return local_path

        key = self._get_key(safe_filename)
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=content,
                ContentType=content_type,
            )
            logger.info(f"Successfully uploaded {safe_filename} to s3://{self.bucket_name}/{key}")
            return f"s3://{self.bucket_name}/{key}"
        except Exception as e:
            logger.warning(f"Failed to upload {safe_filename} to S3: {e}. Retaining local copy.")
            return local_path

    def read_file(self, storage_path: str) -> bytes:
        if storage_path.startswith("s3://") and self.is_active and self.s3_client:
            try:
                # s3://bucket/key
                parts = storage_path[5:].split("/", 1)
                bucket = parts[0]
                key = parts[1]
                response = self.s3_client.get_object(Bucket=bucket, Key=key)
                return response["Body"].read()
            except Exception as e:
                logger.warning(f"S3 read failed for {storage_path}: {e}. Trying local fallback.")
        return self.local_fallback.read_file(storage_path)

    def delete_file(self, storage_path: str) -> bool:
        s3_deleted = False
        if storage_path.startswith("s3://") and self.is_active and self.s3_client:
            try:
                parts = storage_path[5:].split("/", 1)
                bucket = parts[0]
                key = parts[1]
                self.s3_client.delete_object(Bucket=bucket, Key=key)
                s3_deleted = True
            except Exception as e:
                logger.warning(f"S3 delete failed for {storage_path}: {e}")

        # Also purge any local cache with matching basename
        filename = os.path.basename(storage_path)
        local_path = os.path.join(settings.UPLOAD_DIR, filename)
        local_deleted = self.local_fallback.delete_file(local_path)
        return s3_deleted or local_deleted

    def file_exists(self, storage_path: str) -> bool:
        if storage_path.startswith("s3://") and self.is_active and self.s3_client:
            try:
                parts = storage_path[5:].split("/", 1)
                bucket = parts[0]
                key = parts[1]
                self.s3_client.head_object(Bucket=bucket, Key=key)
                return True
            except Exception:
                pass
        return self.local_fallback.file_exists(storage_path)

    def get_access_info(self, storage_path: str, filename: Optional[str] = None) -> Dict[str, Any]:
        if storage_path.startswith("s3://") and self.is_active and self.s3_client:
            try:
                parts = storage_path[5:].split("/", 1)
                bucket = parts[0]
                key = parts[1]
                params = {"Bucket": bucket, "Key": key}
                if filename:
                    params["ResponseContentDisposition"] = f'inline; filename="{filename}"'
                presigned_url = self.s3_client.generate_presigned_url(
                    "get_object",
                    Params=params,
                    ExpiresIn=3600
                )
                return {
                    "type": "s3_presigned",
                    "url": presigned_url,
                    "storage_path": storage_path,
                    "filename": filename or os.path.basename(storage_path)
                }
            except Exception as e:
                logger.warning(f"Failed to generate S3 presigned URL for {storage_path}: {e}")

        # Fallback to local access
        local_filename = os.path.basename(storage_path)
        local_path = os.path.join(settings.UPLOAD_DIR, local_filename)
        return self.local_fallback.get_access_info(local_path if os.path.exists(local_path) else storage_path, filename)


# Singleton instance
_adapter: Optional[StorageAdapter] = None

def get_storage_adapter() -> StorageAdapter:
    global _adapter
    if _adapter is not None:
        return _adapter

    backend = (settings.STORAGE_BACKEND or "").lower().strip()
    use_s3 = settings.USE_S3_STORAGE or backend == "s3"

    if use_s3 and settings.S3_BUCKET_NAME:
        _adapter = S3StorageAdapter(
            bucket_name=settings.S3_BUCKET_NAME,
            region=settings.S3_REGION,
            access_key=settings.S3_ACCESS_KEY_ID,
            secret_key=settings.S3_SECRET_ACCESS_KEY,
            endpoint_url=settings.S3_ENDPOINT_URL,
            prefix=settings.S3_PREFIX
        )
    else:
        _adapter = LocalStorageAdapter(settings.UPLOAD_DIR)

    return _adapter
