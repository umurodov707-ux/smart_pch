const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', '1-brigada.xlsx');
const buf = fs.readFileSync(filePath);
const wb = XLSX.read(buf, { type: 'buffer', cellFormula: true });

const si = 1;
const sheetName = wb.SheetNames[si];
const sheet = wb.Sheets[sheetName];

// Replicate pu74FormulaMap
const pu74FormulaMap = {};
wb.SheetNames.forEach((name, idx) => {
    const sh = wb.Sheets[name];
    if (!sh || !sh['!ref']) return;
    pu74FormulaMap[idx] = {};
    const range = XLSX.utils.decode_range(sh['!ref']);
    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const ref = XLSX.utils.encode_cell({ c: C, r: R });
            const cell = sh[ref];
            if (cell && cell.f) {
                pu74FormulaMap[idx][ref] = cell.f;
            }
        }
    }
});

// Replicate pu74EditedCells (empty for now, using template defaults)
const pu74EditedCells = {};

function getSheetIndex(name) {
    return wb.SheetNames.indexOf(name);
}

function getCellNumericValue(targetSI, cellRef) {
    const sh = wb.Sheets[wb.SheetNames[targetSI]];
    if (!sh) return 0;
    const decoded = XLSX.utils.decode_cell(cellRef);
    const editKey = targetSI + '_' + decoded.r + '_' + decoded.c;

    if (pu74EditedCells[editKey] !== undefined) {
        const v = parseFloat(pu74EditedCells[editKey]);
        return isNaN(v) ? 0 : v;
    }

    const formulas = pu74FormulaMap[targetSI] || {};
    if (formulas[cellRef]) {
        const result = evaluateFormula(targetSI, formulas[cellRef]);
        if (result !== null) return result;
    }

    const cell = sh[cellRef];
    if (!cell) return 0;
    if (typeof cell.v === 'number') return cell.v;
    const p = parseFloat(cell.v);
    return isNaN(p) ? 0 : p;
}

function evaluateFormula(targetSI, formula) {
    let expr = formula.trim();
    if (expr.startsWith('=')) expr = expr.substring(1);
    if (expr.startsWith('+')) expr = expr.substring(1);

    // 1. SUM range
    expr = expr.replace(/SUM\((?:'([^']+)'!)?([\$]?[A-Z]+[\$]?\d+):([\$]?[A-Z]+[\$]?\d+)\)/gi, (match, sheetName, startRef, endRef) => {
        const currentSI = sheetName ? getSheetIndex(sheetName) : targetSI;
        if (currentSI < 0) return '0';
        const start = XLSX.utils.decode_cell(startRef.replace(/\$/g, ''));
        const end = XLSX.utils.decode_cell(endRef.replace(/\$/g, ''));
        let total = 0;
        const minRow = Math.min(start.r, end.r);
        const maxRow = Math.max(start.r, end.r);
        const minCol = Math.min(start.c, end.c);
        const maxCol = Math.max(start.c, end.c);
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                total += getCellNumericValue(currentSI, XLSX.utils.encode_cell({ c, r }));
            }
        }
        return String(total);
    });

    // 2. SUM list
    expr = expr.replace(/SUM\(([^)]+)\)/gi, (match, listStr) => {
        const refs = listStr.split(',');
        let total = 0;
        refs.forEach(ref => {
            const cleanRef = ref.trim();
            const cross = cleanRef.match(/^(?:'([^']+)'!)?([\$]?[A-Z]+[\$]?\d+)$/i);
            if (cross) {
                const currentSI = cross[1] ? getSheetIndex(cross[1]) : targetSI;
                if (currentSI >= 0) {
                    total += getCellNumericValue(currentSI, cross[2].replace(/\$/g, ''));
                }
            } else {
                const num = parseFloat(cleanRef);
                if (!isNaN(num)) total += num;
            }
        });
        return String(total);
    });

    // 3. Cell refs
    const cellRegex = /(?:'([^']+)'!)?([\$]?[A-Z]+[\$]?\d+)/gi;
    expr = expr.replace(cellRegex, (match, sheetName, cellRef) => {
        const currentSI = sheetName ? getSheetIndex(sheetName) : targetSI;
        if (currentSI < 0) return '0';
        const val = getCellNumericValue(currentSI, cellRef.replace(/\$/g, ''));
        return String(val);
    });

    // 4. Safe eval
    if (/^[0-9\+\-\*\/\(\)\.\s]+$/.test(expr)) {
        try {
            const result = Function('"use strict"; return (' + expr + ')')();
            return isNaN(result) ? 0 : result;
        } catch (e) {
            console.error("Eval error for:", formula, expr, e);
            return 0;
        }
    }

    return null;
}

console.log("--- Testing individual worker S cells ---");
for (let r = 11; r <= 20; r++) {
    const ref = `S${r}`;
    if (pu74FormulaMap[si][ref]) {
        console.log(`Cell ${ref} formula: ${pu74FormulaMap[si][ref]} -> Evaluated:`, getCellNumericValue(si, ref));
    }
}

console.log("\n--- Testing Q41, R41, S41 ---");
console.log("Q41 formula:", pu74FormulaMap[si]['Q41'], "-> Evaluated:", getCellNumericValue(si, 'Q41'));
console.log("R41 formula:", pu74FormulaMap[si]['R41'], "-> Evaluated:", getCellNumericValue(si, 'R41'));
console.log("S41 formula:", pu74FormulaMap[si]['S41'], "-> Evaluated:", getCellNumericValue(si, 'S41'));

console.log("\n--- Testing S43 (SUM S11:S40) ---");
console.log("S43 formula:", pu74FormulaMap[si]['S43'], "-> Evaluated:", getCellNumericValue(si, 'S43'));
