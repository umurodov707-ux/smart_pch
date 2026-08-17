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
    cursor.execute("SELECT id, bolinma_id, year, month, data FROM timesheet_records")
    rows = cursor.fetchall()
    print(f"Total timesheet rows: {len(rows)}")
    for r in rows:
        data = json.loads(r[4])
        filled_hours = {k: v for k, v in data.items() if k.split('_')[-1].isdigit() and v not in ['', '0', 0]}
        if len(filled_hours) > 0:
            print(f"ID: {r[0]} | Bolinma: {r[1]} | Year: {r[2]} | Month: {r[3]} | Active hours keys: {len(filled_hours)}")
            print("  Sample:", list(filled_hours.items())[:5])
except Exception as e:
    print("Error:", e)

conn.close()
