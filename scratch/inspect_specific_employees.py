import sqlite3
import os

db_path = r"d:\расм\server\smart_pch.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

names = ['Barakayev', 'Rebitov', 'Adambayev', 'Satturdiyev', 'Martinov', 'Orazbekov']

print("--- Database records for specific names ---")
for name in names:
    cursor.execute("SELECT id, full_name, tabel_number FROM employees WHERE full_name LIKE ?", (f"%{name}%",))
    rows = cursor.fetchall()
    print(f"\nSearch term: {name}")
    for r in rows:
        print(f"  ID: {r[0]} | Full Name: {r[1]} | Tabel Number: {r[2]}")

conn.close()
