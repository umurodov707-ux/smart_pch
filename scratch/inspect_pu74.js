const path = require('path');
const XLSX = require(path.join('d:', 'расм', 'node_modules', 'xlsx'));
const wb = XLSX.readFile(path.join('d:', 'расм', 'public', '1-brigada.xlsx'));

console.log('--- SHEET NAMES ---');
console.log(wb.SheetNames);

wb.SheetNames.forEach((name, idx) => {
    const ws = wb.Sheets[name];
    console.log(`\nSheet #${idx} "${name}":`);
    console.log('  Range:', ws['!ref']);
    if (ws['!cols']) {
        console.log('  Cols count:', ws['!cols'].length);
        console.log('  Sample Cols widths:', ws['!cols'].slice(0, 10).map(c => c.wpx || c.wch || c.w));
    } else {
        console.log('  Cols: none');
    }
    if (ws['!rows']) {
        console.log('  Rows count:', ws['!rows'].length);
    }
    
    // Print first 5 rows with data
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
    let printed = 0;
    for (let r = range.s.r; r <= range.e.r && printed < 10; r++) {
        let rowData = [];
        for (let c = range.s.c; c <= range.e.c; c++) {
            const addr = XLSX.utils.encode_cell({r, c});
            const cell = ws[addr];
            if (cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== '') {
                rowData.push('[' + addr + '] = ' + String(cell.v).substring(0, 30));
            }
        }
        if (rowData.length > 0) {
            console.log(`    Row ${r+1}: ` + rowData.join(' | '));
            printed++;
        }
    }
});
