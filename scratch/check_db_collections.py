import sys
import os
sys.path.insert(0, os.path.abspath("backend"))
import asyncio
from app.core.database import connect_to_mongo, get_database, close_mongo_connection

async def run():
    await connect_to_mongo()
    db = await get_database()
    cols = await db.list_collection_names()
    print("Collections in DB:", cols)
    for col in cols:
        count = await db[col].count_documents({})
        print(f"  {col}: {count} documents")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run())
