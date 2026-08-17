import sqlite3
import os

db_path = r"d:\расм\server\smart_pch.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT id, full_name, tabel_number FROM employees LIMIT 20")
    print("--- Employees ID vs Tabel Number ---")
    for r in cursor.fetchall():
        print(f"  ID: {r[0]} | Name: {r[1]} | Tabel Number: {r[2]}")
except Exception as e:
    print("Error:", e)

conn.close()
