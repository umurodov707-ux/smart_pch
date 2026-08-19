with open(r"d:\расм\server\schema_manager.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "name: 'employees'" in line:
        print(f"Found employees table name at line {idx+1}")
        # Print next 30 lines
        for offset in range(30):
            if idx + offset < len(lines):
                print(f"{idx+1+offset}: {lines[idx+offset]}", end="")
