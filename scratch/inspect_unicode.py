import openpyxl
import os

file_path = r"d:\расм\public\1-brigada.xlsx"
wb = openpyxl.load_workbook(file_path, data_only=False)
sheet = wb.worksheets[1]

# Get S11 cell value (formula)
val = sheet['S11'].value
print(f"S11 Formula: {val}")
if val:
    for char in val:
        print(f"  Character: '{char}' | Code: {ord(char)}")

# Get Q41 cell value (formula)
val_q41 = sheet['Q41'].value
print(f"\nQ41 Formula: {val_q41}")
if val_q41:
    for char in val_q41[:15]:
        print(f"  Character: '{char}' | Code: {ord(char)}")

wb.close()
