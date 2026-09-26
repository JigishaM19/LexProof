import asyncio
import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import connect_to_mongo, get_database, init_mongo_indexes

async def fix():
    await connect_to_mongo()
    db = await get_database()
    try:
        await db.users.drop_index("mobile_1")
        print("[SUCCESS] Dropped old non-sparse mobile_1 index.")
    except Exception as e:
        print("[INFO] Index drop note:", e)

    await init_mongo_indexes(db)
    print("[SUCCESS] Recreated sparse index for mobile.")

if __name__ == "__main__":
    asyncio.run(fix())
