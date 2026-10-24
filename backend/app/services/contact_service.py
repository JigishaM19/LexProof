import os
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.models.contact import ContactInquiryCreate, ContactInquiryResponse
from app.core.database import get_database

logger = logging.getLogger("LexProof.ContactService")

STORAGE_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "inquiries.json")

# In-memory store for active session queries and fallback
inquiries_db: Dict[str, dict] = {}

def _init_storage():
    """Load pre-existing inquiries from disk if available."""
    try:
        os.makedirs(os.path.dirname(STORAGE_FILE), exist_ok=True)
        if os.path.exists(STORAGE_FILE):
            with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and "id" in item:
                            inquiries_db[item["id"]] = item
    except Exception as e:
        logger.warning(f"Could not load initial inquiries from {STORAGE_FILE}: {e}")

_init_storage()

def _save_to_disk():
    """Persist inquiries to disk safely."""
    try:
        os.makedirs(os.path.dirname(STORAGE_FILE), exist_ok=True)
        serialized = []
        for item in inquiries_db.values():
            entry = dict(item)
            if isinstance(entry.get("created_at"), datetime):
                entry["created_at"] = entry["created_at"].isoformat()
            serialized.append(entry)

        temp_file = f"{STORAGE_FILE}.tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(serialized, f, indent=2, ensure_ascii=False)
        os.replace(temp_file, STORAGE_FILE)
    except Exception as e:
        logger.error(f"Failed to persist inquiry to {STORAGE_FILE}: {e}")

class ContactService:
    @staticmethod
    async def create_inquiry(
        inquiry_in: ContactInquiryCreate,
        user_id: Optional[str] = None
    ) -> ContactInquiryResponse:
        inquiry_id = f"inq_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)

        record = {
            "id": inquiry_id,
            "name": inquiry_in.name.strip(),
            "email": str(inquiry_in.email).strip().lower(),
            "inquiry_type": inquiry_in.inquiry_type.strip(),
            "message": inquiry_in.message.strip(),
            "status": "RECEIVED",
            "user_id": user_id,
            "created_at": now,
        }

        inquiries_db[inquiry_id] = record
        _save_to_disk()

        try:
            db = await get_database()
            await db["inquiries"].replace_one({"id": inquiry_id}, record, upsert=True)
        except Exception as e:
            logger.warning(f"Could not persist inquiry to MongoDB: {e}")

        logger.info(f"Contact inquiry logged: {inquiry_id} from {record['email']} ({record['inquiry_type']})")

        return ContactInquiryResponse(
            id=record["id"],
            name=record["name"],
            email=record["email"],
            inquiry_type=record["inquiry_type"],
            message=record["message"],
            status=record["status"],
            user_id=record["user_id"],
            created_at=record["created_at"],
        )

    @staticmethod
    async def list_inquiries(limit: int = 100) -> List[ContactInquiryResponse]:
        results = []
        try:
            db = await get_database()
            cursor = db["inquiries"].find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
            docs = await cursor.to_list(length=limit)
            for r in docs:
                created = r.get("created_at")
                if isinstance(created, str):
                    try:
                        created = datetime.fromisoformat(created)
                    except Exception:
                        created = datetime.now(timezone.utc)
                results.append(
                    ContactInquiryResponse(
                        id=r["id"],
                        name=r["name"],
                        email=r["email"],
                        inquiry_type=r["inquiry_type"],
                        message=r["message"],
                        status=r.get("status", "RECEIVED"),
                        user_id=r.get("user_id"),
                        created_at=created or datetime.now(timezone.utc),
                    )
                )
        except Exception as e:
            logger.warning(f"Error reading inquiries from MongoDB: {e}")

        if not results:
            sorted_records = sorted(
                inquiries_db.values(),
                key=lambda x: x["created_at"].isoformat() if isinstance(x["created_at"], datetime) else str(x["created_at"]),
                reverse=True
            )
            for r in sorted_records[:limit]:
                created = r["created_at"]
                if isinstance(created, str):
                    try:
                        created = datetime.fromisoformat(created)
                    except Exception:
                        created = datetime.now(timezone.utc)
                results.append(
                    ContactInquiryResponse(
                        id=r["id"],
                        name=r["name"],
                        email=r["email"],
                        inquiry_type=r["inquiry_type"],
                        message=r["message"],
                        status=r.get("status", "RECEIVED"),
                        user_id=r.get("user_id"),
                        created_at=created,
                    )
                )

        return results

    @staticmethod
    async def get_inquiry(inquiry_id: str) -> Optional[ContactInquiryResponse]:
        try:
            db = await get_database()
            r = await db["inquiries"].find_one({"id": inquiry_id}, {"_id": 0})
            if r:
                created = r.get("created_at")
                if isinstance(created, str):
                    try:
                        created = datetime.fromisoformat(created)
                    except Exception:
                        created = datetime.now(timezone.utc)
                return ContactInquiryResponse(
                    id=r["id"],
                    name=r["name"],
                    email=r["email"],
                    inquiry_type=r["inquiry_type"],
                    message=r["message"],
                    status=r.get("status", "RECEIVED"),
                    user_id=r.get("user_id"),
                    created_at=created or datetime.now(timezone.utc),
                )
        except Exception:
            pass

        record = inquiries_db.get(inquiry_id)
        if not record:
            return None
        created = record["created_at"]
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created)
            except Exception:
                created = datetime.now(timezone.utc)
        return ContactInquiryResponse(
            id=record["id"],
            name=record["name"],
            email=record["email"],
            inquiry_type=record["inquiry_type"],
            message=record["message"],
            status=record.get("status", "RECEIVED"),
            user_id=record.get("user_id"),
            created_at=created,
        )
