import sqlite3
import os
import json

db_path = r"d:\расм\server\smart_pch.db"

if not os.path.exists(db_path):
    print("Database file not found at:", db_path)
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT id, bolinma_id, year, month, data FROM timesheet_records LIMIT 5")
    rows = cursor.fetchall()
    print(f"Total rows: {len(rows)}")
    for r in rows:
        print(f"\nRow ID: {r[0]} | Bolinma: {r[1]} | Year: {r[2]} | Month: {r[3]}")
        data = json.loads(r[4])
        keys = list(data.keys())
        print(f"Number of keys: {len(keys)}")
        print("First 20 keys:")
        for k in keys[:20]:
            print(f"  {k}: {data[k]}")
except Exception as e:
    print("Error querying timesheet:", e)

conn.close()
