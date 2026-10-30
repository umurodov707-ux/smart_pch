const path = require('path');
const XLSX = require(path.join('d:', 'расм', 'node_modules', 'xlsx'));
const wb = XLSX.readFile(path.join('d:', 'расм', 'public', 'tabel Namuna aprel lotincha.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
console.log('Sheet:', wb.SheetNames[0]);
const range = XLSX.utils.decode_range(ws['!ref']);
console.log('Range:', ws['!ref']);
console.log();
for (let r = range.s.r; r <= Math.min(range.s.r + 20, range.e.r); r++) {
    let rowData = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({r, c});
        const cell = ws[addr];
        if (cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== '') {
            rowData.push('[' + addr + '] = ' + JSON.stringify(cell.v));
        }
    }
    if (rowData.length > 0) {
        console.log('Row ' + (r+1) + ': ' + rowData.join(' | '));
    }
}
if (ws['!merges']) {
    console.log('\nMerged cells (first 30):');
    ws['!merges'].slice(0, 30).forEach(m => {
        const s = XLSX.utils.encode_cell(m.s);
        const e = XLSX.utils.encode_cell(m.e);
        const cell = ws[s];
        const val = cell ? JSON.stringify(cell.v) : '(empty)';
        console.log('  ' + s + ':' + e + ' = ' + val);
    });
}
