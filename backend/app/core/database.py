import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("LexProof.Database")

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

db_instance = Database()

async def get_database() -> AsyncIOMotorDatabase:
    if db_instance.db is None:
        await connect_to_mongo()
    return db_instance.db

async def connect_to_mongo():
    try:
        mongo_uri = settings.MONGODB_URI or "mongodb://localhost:27017"
        logger.info(f"Connecting to MongoDB at {mongo_uri} (Database: {settings.DATABASE_NAME})...")
        db_instance.client = AsyncIOMotorClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=50,
            minPoolSize=5
        )
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        
        # Ping the server to verify connection
        await db_instance.client.admin.command("ping")
        logger.info(f"Successfully connected to MongoDB database '{settings.DATABASE_NAME}'.")
        
        # Initialize indexes
        await init_mongo_indexes(db_instance.db)
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        db_instance.client.close()
        db_instance.client = None
        db_instance.db = None
        logger.info("MongoDB connection closed.")

async def init_mongo_indexes(db: AsyncIOMotorDatabase):
    """Ensure production MongoDB indexes are created."""
    try:
        # Users Collection Indexes
        users_col = db["users"]
        await users_col.create_index("id", unique=True)
        await users_col.create_index("email", unique=True)
        await users_col.create_index(
            "mobile",
            unique=True,
            partialFilterExpression={"mobile": {"$type": "string"}}
        )
        await users_col.create_index("google_id", sparse=True)
        
        # OTPs Collection Indexes
        otps_col = db["otps"]
        await otps_col.create_index("identifier")
        # Automatic document expiry based on expires_at TTL
        await otps_col.create_index("expires_at", expireAfterSeconds=0)
        
        # Sessions / Refresh Tokens Collection Indexes
        sessions_col = db["sessions"]
        await sessions_col.create_index("token_id", unique=True)
        await sessions_col.create_index("user_id")
        await sessions_col.create_index("expires_at", expireAfterSeconds=0)
        
        # Password Resets Collection Indexes
        resets_col = db["password_resets"]
        await resets_col.create_index("identifier")
        await resets_col.create_index("expires_at", expireAfterSeconds=0)

        # Geographic Reference Collection Indexes
        await db["countries"].create_index("id", unique=True)
        await db["countries"].create_index("name")

        await db["states"].create_index("id", unique=True)
        await db["states"].create_index("country_id")
        await db["states"].create_index("name")

        await db["districts"].create_index("id", unique=True)
        await db["districts"].create_index("state_id")
        await db["districts"].create_index("country_id")
        await db["districts"].create_index("name")

        # Subdistricts (Talukas / Tehsils) – optimised for cascading district → subdistrict lookups
        await db["subdistricts"].create_index("id", unique=True, sparse=True)
        await db["subdistricts"].create_index("district_id")
        await db["subdistricts"].create_index("district_code")
        await db["subdistricts"].create_index("state_id")
        await db["subdistricts"].create_index("name")
        # Composite index to speed up the most common query: district + name sort
        await db["subdistricts"].create_index([("district_id", 1), ("name", 1)])

        await db["cities"].create_index("id", unique=True)
        await db["cities"].create_index("district_id")
        await db["cities"].create_index("state_id")

        await db["pincodes"].create_index("pincode")
        await db["pincodes"].create_index("state_id")
        await db["pincodes"].create_index("district_id")

        # Academic Reference Collection Indexes
        await db["institutions"].create_index("id", unique=True)
        await db["institutions"].create_index("state_id")
        await db["institutions"].create_index("district_id")
        await db["institutions"].create_index("city_id")
        await db["institutions"].create_index([("name", "text")])

        await db["courses"].create_index("id", unique=True)
        await db["courses"].create_index([("name", "text")])

        await db["branches"].create_index("id", unique=True)
        await db["branches"].create_index("course_id")
        await db["branches"].create_index([("name", "text")])

        # Cases & Documents Collection Indexes
        cases_col = db["cases"]
        await cases_col.create_index("id", unique=True)
        await cases_col.create_index("user_id")
        await cases_col.create_index("created_at")

        docs_col = db["documents"]
        await docs_col.create_index("id", unique=True)
        await docs_col.create_index("case_id")
        await docs_col.create_index("user_id")
        await docs_col.create_index("file_hash_sha256")

        # Inquiries & Institution Requests Collection Indexes
        inq_col = db["inquiries"]
        await inq_col.create_index("id", unique=True)
        await inq_col.create_index("email")
        await inq_col.create_index("created_at")

        inst_req_col = db["institution_requests"]
        await inst_req_col.create_index("id", unique=True)
        await inst_req_col.create_index("applicant_email")

        # Batches Collection Indexes (Organization Verification)
        batches_col = db["batches"]
        await batches_col.create_index("id", unique=True)
        await batches_col.create_index("user_id")
        await batches_col.create_index("created_at")

        logger.info("MongoDB production indexes verified and initialized.")
    except Exception as e:
        logger.warning(f"Index initialization notice: {e}")
