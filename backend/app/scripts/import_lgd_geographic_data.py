"""
Idempotent Import & Seed Script for LGD Geographic Data
Imports States (36), Districts (36), and Subdistricts (358) extracted from
Local Government Directory (LGD) reference PDFs into MongoDB Atlas.

Safe to rerun at any time without duplicating records or damaging existing data.
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.database import get_database, connect_to_mongo

DATA_DIR = BASE_DIR / "app" / "data"

async def import_lgd_data():
    await connect_to_mongo()
    db = await get_database()
    
    print("=" * 70)
    print("STARTING LGD GEOGRAPHIC DATA IMPORT (MongoDB Atlas)")
    print("=" * 70)
    
    # -------------------------------------------------------------------------
    # 1. IMPORT STATES (36 States & UTs)
    # -------------------------------------------------------------------------
    states_file = DATA_DIR / "lgd_states.json"
    with open(states_file, "r", encoding="utf-8") as f:
        states_data = json.load(f)
        
    print(f"\n[1/3] Processing {len(states_data)} States/UTs from {states_file.name}...")
    states_upserted = 0
    for state in states_data:
        # Match by id (e.g. IN-MH) or lgd_code
        filter_q = {"$or": [{"id": state["id"]}, {"lgd_code": state["lgd_code"]}]}
        update_doc = {
            "$set": {
                "id": state["id"],
                "country_id": state.get("country_id", "IN"),
                "name": state["name"],
                "code": state.get("code"),
                "lgd_code": state["lgd_code"],
                "state_version": state.get("state_version", 1),
                "admin_type": state.get("admin_type", "State"),
                "census_2001_code": state.get("census_2001_code"),
                "census_2011_code": state.get("census_2011_code"),
                "source_document": state.get("source_document"),
                "extraction_date": state.get("extraction_date")
            }
        }
        await db["states"].update_one(filter_q, update_doc, upsert=True)
        states_upserted += 1
        
    print(f" -> Successfully upserted {states_upserted} States/UTs.")
    
    # -------------------------------------------------------------------------
    # 2. IMPORT DISTRICTS (36 Maharashtra Districts)
    # -------------------------------------------------------------------------
    districts_file = DATA_DIR / "lgd_districts.json"
    with open(districts_file, "r", encoding="utf-8") as f:
        districts_data = json.load(f)
        
    print(f"\n[2/3] Processing {len(districts_data)} Districts from {districts_file.name}...")
    districts_upserted = 0
    for dist in districts_data:
        # Match by id or (state_id and lgd_code) or name
        filter_q = {
            "$or": [
                {"id": dist["id"]},
                {"state_id": dist["state_id"], "lgd_code": dist["lgd_code"]},
                {"state_id": dist["state_id"], "name": dist["name"]}
            ]
        }
        update_doc = {
            "$set": {
                "id": dist["id"],
                "lgd_code": dist["lgd_code"],
                "code": dist.get("code", str(dist["lgd_code"])),
                "name": dist["name"],
                "state_id": dist["state_id"],
                "state_code": dist.get("state_code", 27),
                "country_id": dist.get("country_id", "IN"),
                "source_document": dist.get("source_document"),
                "extraction_date": dist.get("extraction_date")
            }
        }
        await db["districts"].update_one(filter_q, update_doc, upsert=True)
        districts_upserted += 1

    # Remove any old ungrounded mock entries for Maharashtra that lack official source document
    await db["districts"].delete_many({
        "state_id": "IN-MH",
        "source_document": None
    })
        
    print(f" -> Successfully upserted {districts_upserted} Districts.")
    
    # -------------------------------------------------------------------------
    # 3. IMPORT SUBDISTRICTS (358 Maharashtra Subdistricts)
    # -------------------------------------------------------------------------
    subdistricts_file = DATA_DIR / "lgd_subdistricts.json"
    with open(subdistricts_file, "r", encoding="utf-8") as f:
        subdistricts_data = json.load(f)
        
    print(f"\n[3/3] Processing {len(subdistricts_data)} Subdistricts from {subdistricts_file.name}...")
    subdistricts_upserted = 0
    for sub in subdistricts_data:
        filter_q = {"id": sub["id"]}
        update_doc = {
            "$set": {
                "id": sub["id"],
                "s_no": sub.get("s_no"),
                "code": sub["code"],
                "version": sub.get("version", 1),
                "name": sub["name"],
                "name_local": sub.get("name_local"),
                "district_id": sub["district_id"],
                "district_code": sub["district_code"],
                "district_name": sub["district_name"],
                "state_id": sub.get("state_id", "IN-MH"),
                "state_code": sub.get("state_code", 27),
                "country_id": sub.get("country_id", "IN"),
                "census_2001_code": sub.get("census_2001_code"),
                "census_2011_code": sub.get("census_2011_code"),
                "admin_type": "Subdistrict / Taluka",
                "source_document": sub.get("source_document"),
                "extraction_date": sub.get("extraction_date")
            }
        }
        await db["subdistricts"].update_one(filter_q, update_doc, upsert=True)
        subdistricts_upserted += 1
        
    print(f" -> Successfully upserted {subdistricts_upserted} Subdistricts.")
    
    # -------------------------------------------------------------------------
    # 4. CREATE INDEXES
    # -------------------------------------------------------------------------
    print("\nEnsuring collection indexes...")
    await db["states"].create_index("id", unique=True)
    await db["states"].create_index("country_id")
    await db["states"].create_index("lgd_code")
    
    await db["districts"].create_index("id", unique=True)
    await db["districts"].create_index("state_id")
    await db["districts"].create_index("lgd_code")
    
    await db["subdistricts"].create_index("id", unique=True)
    await db["subdistricts"].create_index("code")
    await db["subdistricts"].create_index("district_id")
    await db["subdistricts"].create_index("district_code")
    await db["subdistricts"].create_index("state_id")
    await db["subdistricts"].create_index("name")
    print(" -> Indexes created successfully.")
    
    # -------------------------------------------------------------------------
    # 5. VERIFICATION REPORT
    # -------------------------------------------------------------------------
    total_states = await db["states"].count_documents({"country_id": "IN"})
    total_mh_districts = await db["districts"].count_documents({"state_id": "IN-MH"})
    total_subdistricts = await db["subdistricts"].count_documents({})
    
    print("\n" + "=" * 70)
    print("IMPORT VERIFICATION REPORT")
    print("=" * 70)
    print(f"States/UTs in Database (India): {total_states} (Target: 36)")
    print(f"Districts in Database (MH):      {total_mh_districts} (Target: 36)")
    print(f"Subdistricts in Database (MH):   {total_subdistricts} (Target: 358)")
    print("=" * 70)
    
    assert total_states == 36, f"Expected 36 states, got {total_states}"
    assert total_mh_districts == 36, f"Expected 36 MH districts, got {total_mh_districts}"
    assert total_subdistricts == 358, f"Expected 358 subdistricts, got {total_subdistricts}"
    print("\nAll counts match the official LGD reference PDFs exactly! Import completed successfully.")

if __name__ == "__main__":
    asyncio.run(import_lgd_data())
