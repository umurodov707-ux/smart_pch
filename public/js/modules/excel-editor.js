/**
 * SMART PCH — Excel tahrirlovchi (Google Sheets uslubida)
 */

function createExcelTable(data) {
    const container = document.getElementById('excelEditor');
    if (!container) return;
    container.innerHTML = '';

    const excelContainer = document.createElement('div');
    excelContainer.className = 'excel-container';
    const table = document.createElement('table');
    table.className = 'sheets-table';
    const MAX_COLS = 26;
    const MAX_ROWS = 50;
    let gridData = {};

    if (data && Array.isArray(data)) {
        data.forEach((row, r) => {
            if (Array.isArray(row)) {
                row.forEach((cell, c) => {
                    if (!gridData[r]) gridData[r] = {};
                    gridData[r][c] = cell;
                });
            }
        });
    }

    const headerRow = document.createElement('tr');
    const corner = document.createElement('th');
    corner.className = 'corner-header row-header';
    headerRow.appendChild(corner);
    for (let c = 0; c < MAX_COLS; c++) {
        const th = document.createElement('th');
        th.textContent = String.fromCharCode(65 + c);
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    for (let r = 0; r < MAX_ROWS; r++) {
        const tr = document.createElement('tr');
        const rowHead = document.createElement('th');
        rowHead.className = 'row-header';
        rowHead.textContent = r + 1;
        tr.appendChild(rowHead);

        for (let c = 0; c < MAX_COLS; c++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.dataset.row = r;
            input.dataset.col = c;
            if (gridData[r] && gridData[r][c] !== undefined) input.value = gridData[r][c];

            input.addEventListener('focus', function () {
                highlightHeaders(r, c);
                td.classList.add('active-cell');
                const address = String.fromCharCode(65 + c) + (r + 1);
                const addrEl = document.getElementById('active-cell-address');
                const formulaEl = document.getElementById('formula-input');
                if (addrEl) addrEl.textContent = address;
                if (formulaEl) {
                    formulaEl.value = input.value;
                    formulaEl.oninput = () => { input.value = formulaEl.value; };
                }
            });
            input.addEventListener('blur', () => { clearHighlights(); td.classList.remove('active-cell'); });
            input.addEventListener('keydown', (e) => handleExcelKeydown(e, r, c));
            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    excelContainer.appendChild(table);
    container.appendChild(excelContainer);

    function highlightHeaders(r, c) {
        clearHighlights();
        const colHeaders = table.querySelectorAll('th:not(.row-header)');
        const rowHeaders = table.querySelectorAll('.row-header:not(.corner-header)');
        if (colHeaders[c]) colHeaders[c].classList.add('header-active');
        if (rowHeaders[r]) rowHeaders[r].classList.add('header-active');
    }

    function clearHighlights() {
        table.querySelectorAll('.header-active').forEach(h => h.classList.remove('header-active'));
    }

    function handleExcelKeydown(e, r, c) {
        let nextRow = r;
        let nextCol = c;
        let handled = true;
        switch (e.key) {
            case 'ArrowUp': nextRow = Math.max(0, r - 1); break;
            case 'ArrowDown': nextRow = Math.min(MAX_ROWS - 1, r + 1); break;
            case 'ArrowLeft':
                if (e.target.selectionStart === 0) nextCol = Math.max(0, c - 1);
                else handled = false;
                break;
            case 'ArrowRight':
                if (e.target.selectionEnd === e.target.value.length) nextCol = Math.min(MAX_COLS - 1, c + 1);
                else handled = false;
                break;
            case 'Enter': nextRow = Math.min(MAX_ROWS - 1, r + 1); break;
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    nextCol = Math.max(0, c - 1);
                    if (nextCol === c && r > 0) { nextRow = r - 1; nextCol = MAX_COLS - 1; }
                } else {
                    nextCol = Math.min(MAX_COLS - 1, c + 1);
                    if (nextCol === c && r < MAX_ROWS - 1) { nextRow = r + 1; nextCol = 0; }
                }
                break;
            default: handled = false;
        }
        if (handled && (nextRow !== r || nextCol !== c)) {
            const nextInput = table.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
            if (nextInput) {
                nextInput.focus();
                if (e.key === 'Enter' || e.key === 'Tab') nextInput.select();
            }
        }
    }
}
window.createExcelTable = createExcelTable;

window.formatExcelCell = function (style) {
    const activeInput = document.activeElement;
    if (activeInput && activeInput.tagName === 'INPUT' && activeInput.closest('.sheets-table')) {
        if (style === 'bold') activeInput.style.fontWeight = activeInput.style.fontWeight === 'bold' ? 'normal' : 'bold';
        if (style === 'italic') activeInput.style.fontStyle = activeInput.style.fontStyle === 'italic' ? 'normal' : 'italic';
    }
};

window.saveExcelFile = function () {
    if (!currentEditingFile) return;
    try {
        const table = document.querySelector('.sheets-table');
        if (!table) return;
        const data = [];
        const rows = table.querySelectorAll('tr');
        for (let i = 1; i < rows.length; i++) {
            const rowData = [];
            rows[i].querySelectorAll('input').forEach(input => rowData.push(input.value));
            data.push(rowData);
        }
        while (data.length > 0 && data[data.length - 1].every(c => c === '')) data.pop();

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        currentEditingFile.content = excelBuffer;
        currentEditingFile.status = 'approved';
        saveDatabase();

        alert('Excel fayl muvaffaqiyatli saqlandi!');
        document.getElementById('excel-editor-window').classList.remove('active');
        document.getElementById('department-overlay').classList.remove('active');
        if (typeof updateAllDepartmentWindows === 'function') updateAllDepartmentWindows();
    } catch (e) {
        console.error(e);
        alert('Excel faylni saqlashda xatolik: ' + e.message);
    }
};

window.openExcelEditor = function (file) {
    window.currentEditingFile = file;
    document.getElementById('excel-editor-window').classList.add('active');
    document.getElementById('department-overlay').classList.add('active');

    let data = file.content;
    if (data && typeof data === 'object' && !Array.isArray(data) && !(data instanceof Uint8Array)) {
        data = new Uint8Array(Object.values(data));
    }

    try {
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        createExcelTable(jsonData);
    } catch (e) {
        console.error('Excel Open Error:', e);
        alert("Faylni o'qishda xatolik bo'ldi. Fayl buzilgan bo'lishi mumkin.");
    }
};
