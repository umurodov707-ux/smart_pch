import zipfile
import xml.etree.ElementTree as ET

xlsx_path = r"d:\расм\public\1-brigada.xlsx"

with zipfile.ZipFile(xlsx_path, 'r') as zip_ref:
    namelist = zip_ref.namelist()
    
    # Read shared strings
    shared_strings = []
    if "xl/sharedStrings.xml" in namelist:
        with zip_ref.open("xl/sharedStrings.xml") as f:
            tree = ET.parse(f)
            root = tree.getroot()
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            for t in root.findall('.//ns:t', ns):
                shared_strings.append(t.text)
                
    # Read workbook sheet names
    sheet_names = []
    if "xl/workbook.xml" in namelist:
        with zip_ref.open("xl/workbook.xml") as f:
            tree = ET.parse(f)
            root = tree.getroot()
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            for s in root.findall('.//ns:sheet', ns):
                sheet_names.append((s.get('sheetId'), s.get('name')))
    
    # Print formulas in all worksheets
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    for i in range(1, 15):
        sheet_file = f"xl/worksheets/sheet{i}.xml"
        if sheet_file in namelist:
            print(f"\nSheet {i} (Index {i-1}):")
            with zip_ref.open(sheet_file) as f:
                tree = ET.parse(f)
                root = tree.getroot()
                
                formulas = []
                for row in root.findall('.//ns:row', ns):
                    r_num = row.get('r')
                    for c in row.findall('ns:c', ns):
                        ref = c.get('r')
                        f_el = c.find('ns:f', ns)
                        if f_el is not None:
                            formulas.append(f"{ref} = {f_el.text}")
                
                print(f"  Total formulas: {len(formulas)}")
                if formulas:
                    print("  Sample formulas:")
                    for f in formulas[:20]:
                        print("    ", f)
