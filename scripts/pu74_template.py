#!/usr/bin/env python3
"""
PU-74 jurnali uchun "qolip" (template) generatori.

Brigada Excel fayllari (public/1-brigada.xlsx, 2-..., 3-...) bir xil tuzilishga
ega. Brauzerdagi SheetJS (bepul versiya) katak chegaralari, shrift va
tekislashni o'qimaydi, shuning uchun jurnalni qog'ozdagidek chizish uchun
kerakli ko'rinish ma'lumotlari shu skript orqali bir marta olinadi va
src/components/pu74/pu74Template.json ga yoziladi.

Qiymatlar va formulalar esa ish vaqtida brigada faylining o'zidan o'qiladi.

Ishga tushirish (Excel shakli o'zgarganda):
    pip install openpyxl
    python3 scripts/pu74_template.py public/1-brigada.xlsx

Test uchun qiymatlar bilan birga chiqarish:
    python3 scripts/pu74_template.py public/1-brigada.xlsx --with-values out.json
"""
import json
import os
import re
import sys

import openpyxl
from openpyxl.utils import get_column_letter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "components", "pu74", "pu74Template.json")

BORDER_WEIGHT = {
    "hair": 1, "thin": 1, "dotted": 1, "dashed": 1, "mediumDashed": 2,
    "dashDot": 1, "mediumDashDot": 2, "dashDotDot": 1, "mediumDashDotDot": 2,
    "slantDashDot": 2, "medium": 2, "double": 3, "thick": 3,
}
BORDER_KIND = {"dotted": "dotted", "dashed": "dashed", "hair": "dotted",
               "mediumDashed": "dashed", "double": "double"}


def col_px(width):
    # Excel ustun kengligi (belgilar) -> piksel (Calibri 11 uchun)
    if width is None:
        width = 8.43
    return int(round(width * 7 + 5))


def border_code(side):
    if side is None or side.style is None:
        return None
    w = BORDER_WEIGHT.get(side.style, 1)
    k = BORDER_KIND.get(side.style, "solid")
    return f"{w}{k[0]}"  # masalan "1s", "2s", "1d" (dashed), "1o" (dotted)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    path = sys.argv[1]
    values_out = None
    if "--with-values" in sys.argv:
        values_out = sys.argv[sys.argv.index("--with-values") + 1]

    wb = openpyxl.load_workbook(path)
    wbv = openpyxl.load_workbook(path, data_only=True) if values_out else None

    styles, style_index = [], {}

    def style_id(d):
        key = json.dumps(d, sort_keys=True)
        if key not in style_index:
            style_index[key] = len(styles)
            styles.append(d)
        return style_index[key]

    sheets, value_sheets = [], []
    for ws in wb.worksheets:
        n_rows, n_cols = ws.max_row, ws.max_column
        cols = []
        for c in range(1, n_cols + 1):
            dim = ws.column_dimensions.get(get_column_letter(c))
            hidden = bool(dim and dim.hidden)
            width = dim.width if dim and dim.width else None
            cols.append(0 if hidden else col_px(width))
        rows = []
        for r in range(1, n_rows + 1):
            dim = ws.row_dimensions.get(r)
            if dim and dim.hidden:
                rows.append(0)
            else:
                ht = dim.height if dim and dim.height else 15
                rows.append(int(round(ht * 4 / 3)))

        merges = []
        merged_of = {}
        for m in ws.merged_cells.ranges:
            r1, c1, r2, c2 = m.min_row - 1, m.min_col - 1, m.max_row - 1, m.max_col - 1
            merges.append([r1, c1, r2, c2])
            for rr in range(r1, r2 + 1):
                for cc in range(c1, c2 + 1):
                    merged_of[(rr, cc)] = (r1, c1, r2, c2)

        cell_styles = {}
        for row in ws.iter_rows(min_row=1, max_row=n_rows, max_col=n_cols):
            for cell in row:
                r, c = cell.row - 1, cell.column - 1
                m = merged_of.get((r, c))
                if m and (r, c) != (m[0], m[1]):
                    continue  # birlashtirilgan katakning faqat bosh katagi
                d = {}
                f = cell.font
                if f is not None:
                    if f.b:
                        d["b"] = 1
                    if f.i:
                        d["i"] = 1
                    if f.u:
                        d["u"] = 1
                    if f.sz and abs(float(f.sz) - 11) > 0.1:
                        d["sz"] = float(f.sz)
                a = cell.alignment
                if a is not None:
                    if a.horizontal and a.horizontal not in ("general",):
                        d["h"] = a.horizontal[0]  # l, c, r, j, f(ill), d(istributed)
                    if a.vertical and a.vertical != "bottom":
                        d["v"] = a.vertical[0]
                    if a.wrap_text:
                        d["w"] = 1
                    if a.textRotation:
                        d["rot"] = int(a.textRotation)
                # chegaralar: birlashtirilgan maydonda chetdagi kataklar hisobga olinadi
                r1, c1, r2, c2 = m if m else (r, c, r, c)

                def side(rr, cc, name):
                    b = ws.cell(rr + 1, cc + 1).border
                    return border_code(getattr(b, name) if b else None)

                top = next((x for x in (side(r1, cc, "top") for cc in range(c1, c2 + 1)) if x), None)
                bot = next((x for x in (side(r2, cc, "bottom") for cc in range(c1, c2 + 1)) if x), None)
                lef = next((x for x in (side(rr, c1, "left") for rr in range(r1, r2 + 1)) if x), None)
                rig = next((x for x in (side(rr, c2, "right") for rr in range(r1, r2 + 1)) if x), None)
                # qo'shni katak chegarasi (Excel ko'pincha faqat bir tomonga yozadi)
                if not top and r1 > 0:
                    top = side(r1 - 1, c1, "bottom")
                if not lef and c1 > 0:
                    lef = side(r1, c1 - 1, "right")
                if top or rig or bot or lef:
                    d["bd"] = [top or "", rig or "", bot or "", lef or ""]
                if d:
                    cell_styles[f"{r},{c}"] = style_id(d)

        page_numbers = []
        for r in range(max(1, n_rows - 6), n_rows + 1):
            for c in range(1, n_cols + 1):
                v = ws.cell(r, c).value
                if isinstance(v, (int, float)) or (isinstance(v, str) and v.strip().isdigit()):
                    if 0 < int(float(v)) < 40 and str(int(float(v))) in re.findall(r"\d+", ws.title):
                        page_numbers.append([r - 1, c - 1, int(float(v))])

        sheets.append({
            "name": ws.title,
            "rows": rows,
            "cols": cols,
            "merges": merges,
            "styles": cell_styles,
            "pageNumbers": page_numbers,
            "landscape": ws.page_setup.orientation == "landscape",
        })

        if wbv is not None:
            wsv = wbv[ws.title]
            cells = {}
            for row in ws.iter_rows(min_row=1, max_row=n_rows, max_col=n_cols):
                for cell in row:
                    v = wsv.cell(cell.row, cell.column).value
                    f = cell.value if isinstance(cell.value, str) and cell.value.startswith("=") else None
                    if v is None and f is None:
                        continue
                    e = {"v": v}
                    if f:
                        e["f"] = f[1:]
                    cells[f"{cell.row - 1},{cell.column - 1}"] = e
            value_sheets.append({"name": ws.title, "cells": cells})

    out = {"source": os.path.basename(path), "styles": styles, "sheets": sheets}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"Qolip yozildi: {OUT} ({os.path.getsize(OUT) // 1024} KB, {len(styles)} uslub)")

    if values_out:
        with open(values_out, "w", encoding="utf-8") as fh:
            json.dump({"sheets": value_sheets}, fh, ensure_ascii=False, default=str)
        print(f"Qiymatlar: {values_out}")


if __name__ == "__main__":
    main()
