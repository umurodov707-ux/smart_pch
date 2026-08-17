import openpyxl
import os

file_path = r"d:\расм\public\1-brigada.xlsx"
wb = openpyxl.load_workbook(file_path, data_only=False)
sheet = wb.worksheets[1]

max_row = sheet.max_row
print(f"Total rows: {max_row}")

# Print last 15 rows, columns from S to V (index 19 to 22)
print("--- Bottom 15 rows formulas (Cols Q to U) ---")
for r in range(max_row - 15, max_row + 1):
    row_vals = []
    for c in range(17, 23): # Q to V
        cell = sheet.cell(row=r, column=c)
        cell_ref = f"{openpyxl.utils.get_column_letter(c)}{r}"
        row_vals.append(f"{cell_ref}: {cell.value}")
    print(f"Row {r}: {row_vals}")

wb.close()
