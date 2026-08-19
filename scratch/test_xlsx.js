const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', '1-brigada.xlsx');
if (!fs.existsSync(filePath)) {
    console.error("File not found at:", filePath);
    process.exit(1);
}

const buf = fs.readFileSync(filePath);
const workbook = XLSX.read(buf, { type: 'buffer', cellFormula: true });
console.log("Sheet names:", workbook.SheetNames);

const sheetName = workbook.SheetNames[1]; // active sheet
const sheet = workbook.Sheets[sheetName];

console.log("\n--- Checking cell C11 ---");
console.log("C11:", sheet['C11']);

console.log("\n--- Checking cell S11 ---");
console.log("S11:", sheet['S11']);

console.log("\n--- Checking range ---");
console.log("Ref range:", sheet['!ref']);

// Try to evaluate formula SUM(C11:R12) manually
const start = XLSX.utils.decode_cell("C11");
const end = XLSX.utils.decode_cell("R12");
console.log("Decoded Start (C11):", start);
console.log("Decoded End (R12):", end);

let sum = 0;
for (let r = start.r; r <= end.r; r++) {
    for (let c = start.c; c <= end.c; c++) {
        const ref = XLSX.utils.encode_cell({ c, r });
        const cell = sheet[ref];
        const val = cell ? cell.v : undefined;
        console.log(`Cell ${ref}:`, val);
        if (typeof val === 'number') sum += val;
        else if (typeof val === 'string') {
            const p = parseFloat(val);
            if (!isNaN(p)) sum += p;
        }
    }
}
console.log("\nComputed manual sum of C11:R12 =", sum);
