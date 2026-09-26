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
        
        logger.info("MongoDB production indexes verified and initialized.")
    except Exception as e:
        logger.warning(f"Index initialization notice: {e}")
