// =====================================================
// PU-74: VIRTUAL JURNAL — Formulalar, Imzo, Chop etish
// Yuridik kuchga ega elektron hujjat
// VERSION 2.1 — DOM-based formula computation
// =====================================================
const PU74_VERSION = '2.2';
console.log('%c[PU-74] Version ' + PU74_VERSION + ' loaded', 'color:#ffd700;font-weight:bold;font-size:14px;');

// XAVFSIZLIK TO'RI:
// Bu faylda ba'zi joylarda `window.Auth.currentUser` himoyasiz chaqirilardi.
// Agar auth.js hali yuklanmagan yoki sessiya tiklanmagan bo'lsa,
// "Cannot read properties of undefined (reading 'currentUser')" xatosi
// yuzaga kelib, PU-74 oynasi ochilmay qolardi.
window.Auth = window.Auth || {};
if (typeof window.Auth.currentUser === 'undefined') {
    try {
        window.Auth.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (e) {
        window.Auth.currentUser = null;
    }
}

let pu74CurrentFile = '';
let pu74Workbook = null;
let pu74ActiveSheet = 0;
let pu74EditedCells = {};
let pu74FormulaMap = {}; // {sheetIndex: {cellRef: formulaStr}}
let pu74Signatures = {}; // {role: dataURL}
// Department identifier (e.g., 'iqtisod') – used for saving the Excel file in a sub‑folder
let pu74CurrentDept = '';
function getPU74LocalKey(prefix) {
    const dept = pu74CurrentDept ? (pu74CurrentDept + '_') : '';
    return prefix + '_' + dept + (typeof pu74CurrentFile !== 'undefined' ? pu74CurrentFile : '');
}


// ==========================================
// 1. BRIGADA TANLASH
// ==========================================
function openPU74Window(deptId) {
    // Save department for later export (e.g., 'iqtisod')
    pu74CurrentDept = deptId || '';
    let modal = document.getElementById('pu74-selection-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'pu74-selection-modal';
    modal.className = 'active';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(2, 6, 23, 0.85);backdrop-filter:blur(25px);z-index:10020;display:flex;align-items:center;justify-content:center;opacity:1;transition:all 0.5s cubic-bezier(0.16, 1, 0.3, 1);';

    modal.innerHTML = `
        <div style="background:rgba(30, 41, 59, 0.7);border:1px solid rgba(212, 175, 55, 0.3);border-radius:40px;padding:60px;width:750px;text-align:center;box-shadow:0 40px 100px rgba(0,0,0,0.6);transform:translateY(0);transition:all 0.5s cubic-bezier(0.16, 1, 0.3, 1);position:relative;overflow:hidden;backdrop-filter:blur(30px);">
            <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg, #d4af37, #ffd700, #b8860b);"></div>
            <div style="font-size:3.5rem;margin-bottom:20px;filter:drop-shadow(0 0 15px rgba(212, 175, 55, 0.4));"><i class="fas fa-book-bookmark" style="color:#ffd700;"></i></div>
            <h2 style="margin:0 0 10px;font-size:2.5rem;color:#ffffff;font-weight:900;letter-spacing:2px;text-transform:uppercase;">PU-74 JURNALI</h2>
            <p style="color:#94a3b8;margin-bottom:50px;font-size:1.1rem;font-weight:500;letter-spacing:0.5px;">Bajarilgan ishlar dalolatnomasi — <span style="color:#d4af37;font-weight:700;">ELEKTRON YURIDIK HUJJAT</span></p>
            
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:25px;">
                <button onclick="loadPU74Brigade('1-brigada.xlsx','1-BRIGADA')" class="pu74-brigade-btn" style="background:linear-gradient(135deg,rgba(59,130,246,0.1),rgba(37,99,235,0.2));border:1px solid rgba(59,130,246,0.3);padding:40px 20px;border-radius:28px;cursor:pointer;color:white;font-weight:800;font-size:1.1rem;display:flex;flex-direction:column;align-items:center;gap:15px;transition:all 0.3s;box-shadow:0 10px 20px rgba(0,0,0,0.2);">
                    <div style="width:65px;height:65px;background:rgba(59,130,246,0.2);border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;backdrop-filter:blur(5px);color:#60a5fa;border:1px solid rgba(96,165,250,0.3);">1</div>
                    <span style="letter-spacing:1px;">1-BRIGADA</span>
                </button>
                <button onclick="loadPU74Brigade('2-brigada.xlsx','2-BRIGADA')" class="pu74-brigade-btn" style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.2));border:1px solid rgba(16,185,129,0.3);padding:40px 20px;border-radius:28px;cursor:pointer;color:white;font-weight:800;font-size:1.1rem;display:flex;flex-direction:column;align-items:center;gap:15px;transition:all 0.3s;box-shadow:0 10px 20px rgba(0,0,0,0.2);">
                    <div style="width:65px;height:65px;background:rgba(16,185,129,0.2);border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;backdrop-filter:blur(5px);color:#34d399;border:1px solid rgba(52,211,153,0.3);">2</div>
                    <span style="letter-spacing:1px;">2-BRIGADA</span>
                </button>
                <button onclick="loadPU74Brigade('3-brigada.xlsx','3-BRIGADA')" class="pu74-brigade-btn" style="background:linear-gradient(135deg,rgba(139,92,246,0.1),rgba(124,58,237,0.2));border:1px solid rgba(139,92,246,0.3);padding:40px 20px;border-radius:28px;cursor:pointer;color:white;font-weight:800;font-size:1.1rem;display:flex;flex-direction:column;align-items:center;gap:15px;transition:all 0.3s;box-shadow:0 10px 20px rgba(0,0,0,0.2);">
                    <div style="width:65px;height:65px;background:rgba(139,92,246,0.2);border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;backdrop-filter:blur(5px);color:#a78bfa;border:1px solid rgba(167,139,250,0.3);">3</div>
                    <span style="letter-spacing:1px;">3-BRIGADA</span>
                </button>
            </div>
            
            <button onclick="closePU74Selection()" style="margin-top:50px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:16px 50px;border-radius:20px;cursor:pointer;font-weight:700;transition:0.3s;text-transform:uppercase;letter-spacing:1px;" onmouseover="this.style.color='white';this.style.background='rgba(239,68,68,0.1)';this.style.borderColor='rgba(239,68,68,0.3)'" onmouseout="this.style.color='#94a3b8';this.style.background='rgba(255,255,255,0.05)';this.style.borderColor='rgba(255,255,255,0.1)'">BEKOR QILISH</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function closePU74Selection() {
    const m = document.getElementById('pu74-selection-modal');
    if (m) { m.style.opacity = '0'; setTimeout(() => m.remove(), 300); }
}

// ==========================================
// 2. EXCEL YUKLASH
// ==========================================
function loadPU74Brigade(fileName, title) {
    closePU74Selection();
    pu74CurrentFile = fileName;
    pu74ActiveSheet = 0;
    pu74FormulaMap = {};
    pu74Signatures = { '1-bet': '', '2-3 betlar': '', '4-5 betlar': '' };
    
    // Fetch infrastructure warnings for the day highlighting integration
    if (window.fetchPU74Warnings) window.fetchPU74Warnings();

    // Oldingi tahrirlarni yuklash
    try { pu74EditedCells = JSON.parse(localStorage.getItem(getPU74LocalKey('pu74_edits')) || '{}'); } catch (e) { pu74EditedCells = {}; }
    try { pu74Signatures = JSON.parse(localStorage.getItem(getPU74LocalKey('pu74_signs')) || '{}'); } catch (e) { pu74Signatures = {}; }

    let viewer = document.getElementById('pu74-excel-viewer');
    if (viewer) viewer.remove();

    viewer = document.createElement('div');
    viewer.id = 'pu74-excel-viewer';
    viewer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#f0ebe3;z-index:10021;display:flex;flex-direction:column;';

    viewer.innerHTML = `
        <div id="pu74-topbar" style="height:80px;min-height:80px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;z-index:100;box-shadow:0 10px 30px rgba(0,0,0,0.4);border-bottom:1px solid rgba(212,175,55,0.3);">
            <div style="display:flex;align-items:center;gap:20px;">
                <div style="width:50px;height:50px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(212,175,55,0.1);">
                    <i class="fas fa-file-invoice" style="font-size:1.5rem;color:#ffd700;"></i>
                </div>
                <div style="display:flex;flex-direction:column;">
                    <span style="font-weight:900;font-size:1.4rem;color:white;letter-spacing:1px;text-transform:uppercase;">${title} <span style="color:#ffd700;">PU-74</span></span>
                    <span style="font-size:0.8rem;color:rgba(212,175,55,0.8);font-weight:700;letter-spacing:0.5px;">
                        <i class="fas fa-shield-halved" style="margin-right:8px;"></i> INTEGRATSIYALASHGAN RAQAMLI JURNAL <span style="background:#ffd700;color:#000;padding:1px 8px;border-radius:8px;font-size:0.65rem;margin-left:8px;">v${PU74_VERSION}</span>
                    </span>
                </div>
            </div>
            <div style="display:flex;gap:15px;align-items:center;">
                ${window.Auth?.currentUser?.role !== 'department' ? `
                <button id="pu74-voice-btn" onclick="togglePU74ExcelVoice()" class="pu74-toolbar-btn" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;">
                    <i class="fas fa-microphone"></i> OVOZLI KIRITISH
                </button>
                <button onclick="savePU74Edits()" class="pu74-toolbar-btn" style="background:linear-gradient(135deg, #d4af37, #b8860b);border:none;color:#000 !important;box-shadow:0 4px 15px rgba(212,175,55,0.4);">
                    <i class="fas fa-save"></i> SAQLASH
                </button>
                <button onclick="loadHoursFromTimesheet()" class="pu74-toolbar-btn" style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.4);color:#60a5fa;" title="Tabeldan oylik ish soatlarini avtomatik yuklash">
                    <i class="fas fa-sync-alt"></i> TABELDAN YUKLASH
                </button>
                ` : ''}
                <button onclick="recalcAllFormulas()" class="pu74-toolbar-btn" style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#34d399;">
                    <i class="fas fa-calculator-combined"></i> QAYTA HISOB-KITOB
                </button>
                <button onclick="document.getElementById('pu74-formula-debug').style.display = document.getElementById('pu74-formula-debug').style.display === 'none' ? 'block' : 'none'" class="pu74-toolbar-btn" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;" title="Formulalar hisob-kitobini tekshirish">
                    <i class="fas fa-bug"></i> MONITOR
                </button>
                <button onclick="window.print()" class="pu74-toolbar-btn" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);color:white;">
                    <i class="fas fa-print"></i> CHOP ETISH
                </button>
                <button onclick="closePU74Viewer()" class="pu74-toolbar-btn" style="background:rgba(239, 68, 68, 0.1);color:#ef4444;border:none;width:45px;height:45px;border-radius:14px;justify-content:center;padding:0;">
                    <i class="fas fa-times" style="font-size:1.2rem;"></i>
                </button>
            </div>
        </div>
        <div id="pu74-sheet-tabs" style="display:flex;gap:0;height:55px;padding:0 20px;"></div>
        <div id="pu74-journal-content" style="flex:1;overflow:auto;padding:50px 20px;display:flex;flex-direction:column;align-items:center;">
            <div id="pu74-loading" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:150px;color:#94a3b8;">
                <div class="pu74-loader-outer" style="width:120px;height:120px;border-radius:50%;border:4px solid rgba(212,175,55,0.1);border-top-color:#ffd700;animation:pu74-spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;position:relative;">
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2rem;color:#ffd700;"><i class="fas fa-train"></i></div>
                </div>
                <style>@keyframes pu74-spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }</style>
                <div style="font-size:1.5rem;margin-top:40px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:white;">Jurnallarni yuklanmoqda...</div>
                <div style="font-size:0.9rem;margin-top:10px;color:rgba(212,175,55,0.6);font-weight:600;">ILTIMOS, KUTIB TURRING</div>
            </div>
        </div>
        <!-- E-IMZO SIGNATURE FOOTER -->
        <div id="pu74-signature-footer" style="height: 100px; min-height: 100px; background: rgba(15,23,42,0.98); border-top: 1px solid rgba(212,175,55,0.3); display: flex; justify-content: center; align-items: center; gap: 40px; z-index: 100; backdrop-filter: blur(15px); box-shadow: 0 -10px 30px rgba(0,0,0,0.5);"></div>
    `;

    document.body.appendChild(viewer);
    initPU74Autocomplete(viewer);

    // Setup visual debug monitor
    let debugPanel = document.getElementById('pu74-formula-debug');
    if (debugPanel) debugPanel.remove();
    debugPanel = document.createElement('div');
    debugPanel.id = 'pu74-formula-debug';
    debugPanel.style.cssText = 'position:fixed; bottom:20px; right:20px; width:450px; height:300px; background:rgba(15,23,42,0.96); border:1px solid rgba(212,175,55,0.3); border-radius:16px; color:#e2e8f0; font-family:monospace; font-size:11px; padding:18px; overflow-y:auto; z-index:10035; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5); backdrop-filter:blur(10px); display:none; border-top: 4px solid #ffd700;';
    debugPanel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:8px;font-weight:bold;color:#ffd700;letter-spacing:0.5px;">
            <span><i class="fas fa-microchip" style="margin-right:6px;"></i> FORMULA INTEGRITY MONITOR</span>
            <button onclick="document.getElementById('pu74-formula-debug').style.display='none'" style="background:transparent;color:#f87171;border:none;cursor:pointer;font-size:12px;font-weight:bold;padding:4px 8px;">YOPISH</button>
        </div>
        <div id="pu74-debug-logs" style="height:220px;overflow-y:auto;scroll-behavior:smooth;padding-right:5px;"></div>
    `;
    document.body.appendChild(debugPanel);

    window.pu74FormulaDebug = (msg) => {
        const logContainer = document.getElementById('pu74-debug-logs');
        if (logContainer) {
            const row = document.createElement('div');
            row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            row.style.padding = '4px 0';
            row.style.wordBreak = 'break-all';
            
            if (msg.includes('[Error]')) {
                row.style.color = '#f87171';
            } else if (msg.includes('[Unsupported]')) {
                row.style.color = '#fbbf24';
            } else {
                row.style.color = '#34d399';
            }
            
            row.innerText = msg;
            logContainer.appendChild(row);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    };

    fetch(fileName).then(r => {
        if (!r.ok) throw new Error('Fayl topilmadi: ' + fileName);
        return r.arrayBuffer();
    }).then(async buf => {
        if (typeof XLSX === 'undefined') throw new Error("SheetJS kutubxonasi yuklanmagan!");
        pu74Workbook = XLSX.read(buf, { type: 'array', cellFormula: true, cellStyles: true });
        
        await injectEmployeesFromDB();
        
        buildFormulaMap();
        // cleanupFormulaEdits(); // Removed so manual edits to formulas aren't lost
        renderPU74SheetTabs();
        renderPU74Sheet(0);
        
        // Background cache load for instant employee hour sync
        if (typeof prefetchPU74Timesheet === 'function') {
            prefetchPU74Timesheet();
        }

        if(typeof renderPU74Signatures === 'function') {
            renderPU74Signatures();
        }
    }).catch(err => {
        document.getElementById('pu74-loading').innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#e74c3c;margin-bottom:20px;"></i>
            <div style="font-size:1.2rem;color:#c0392b;">${escapeHtml(err.message)}</div>
            <label style="margin-top:20px;background:#217346;color:white;padding:12px 30px;border-radius:8px;cursor:pointer;">
                <i class="fas fa-upload"></i> Faylni yuklash
                <input type="file" accept=".xlsx,.xls" style="display:none;" onchange="handlePU74FileUpload(this)">
            </label>`;
    });
}

// Dynamically inject employees from DB into PU-74 template based on current bolinma
async function injectEmployeesFromDB() {
    try {
        const token = localStorage.getItem('jwtToken');
        let targetBolinma = '';
        
        // 0. Prioritize explicitly selected bolinma from the UI (pu74CurrentDept)
        if (typeof pu74CurrentDept !== 'undefined' && pu74CurrentDept) {
            const numMatch = String(pu74CurrentDept).match(/\d+/);
            if (numMatch) {
                targetBolinma = `${numMatch[0]}-bo'linma`;
            }
        }
        
        // 1. Try to get from bolinmalar (if not explicitly selected)
        if (!targetBolinma && window.Auth && window.Auth.currentUser && window.Auth.currentUser.bolinmalar) {
            try {
                const arr = typeof window.Auth.currentUser.bolinmalar === 'string'
                    ? JSON.parse(window.Auth.currentUser.bolinmalar)
                    : window.Auth.currentUser.bolinmalar;
                if (Array.isArray(arr) && arr.length > 0) {
                    const numMatch = String(arr[0]).match(/\d+/);
                    if (numMatch) targetBolinma = `${numMatch[0]}-bo'linma`;
                }
            } catch(e) {}
        }
        
        // 2. Try to get from departments (if user is a department user)
        if (!targetBolinma && window.Auth && window.Auth.currentUser && window.Auth.currentUser.departments) {
            try {
                const arr = typeof window.Auth.currentUser.departments === 'string'
                    ? JSON.parse(window.Auth.currentUser.departments)
                    : window.Auth.currentUser.departments;
                if (Array.isArray(arr) && arr.length > 0) {
                    const deptStr = String(arr[0]).toLowerCase();
                    if (deptStr.includes('bo\'linma') || deptStr.includes('bolinma') || deptStr.includes('bo\'lim') || deptStr.includes('sex')) {
                        const numMatch = String(arr[0]).match(/\d+/);
                        if (numMatch) targetBolinma = `${numMatch[0]}-bo'linma`;
                    }
                }
            } catch(e) {}
        }
        
        // 3. Fallback to brigade name
        if (!targetBolinma) {
            const brigadeMatch = String(pu74CurrentFile || '1-brigada').match(/(\d+)/);
            const brigadeNum = brigadeMatch ? brigadeMatch[1] : '1';
            targetBolinma = `${brigadeNum}-bo'linma`;
        }

        const res = await fetch(`/api/hr/employees?bolinma_id=${encodeURIComponent(targetBolinma)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        let employees = await res.json();
        employees = employees.filter(e => e.status === 'active');
        
        pu74Workbook.SheetNames.forEach((sn, si) => {
            const sheetNameLower = sn.toLowerCase();
            const is23Bet = sheetNameLower.includes('2') || sheetNameLower.includes('3') || si === 1;
            if (!is23Bet) return; // Faqat 2-3 betlarga xodimlarni kiritish
            
            const sheet = pu74Workbook.Sheets[sn];
            if (!sheet || !sheet['!ref']) return;
            const range = XLSX.utils.decode_range(sheet['!ref']);
            
            let startR = 10; 
            for (let r = range.s.r; r <= range.e.r; r++) {
                const cellRef = XLSX.utils.encode_cell({ c: 0, r: r });
                const val = sheet[cellRef]?.v;
                if (val === 1 || String(val).trim() === '1') {
                    startR = r;
                    break;
                }
            }

            let step = 2;
            const nextWorkerCellRef = XLSX.utils.encode_cell({ c: 0, r: startR + 2 });
            const nextVal = sheet[nextWorkerCellRef]?.v;
            if (nextVal === 2 || String(nextVal).trim() === '2') {
                step = 2;
            } else {
                const altCellRef = XLSX.utils.encode_cell({ c: 0, r: startR + 3 });
                const altVal = sheet[altCellRef]?.v;
                if (altVal === 2 || String(altVal).trim() === '2') {
                    step = 3;
                }
            }

            let empIndex = 0;
            for (let R = startR; R <= range.e.r; R += step) {
                const numCellRef = XLSX.utils.encode_cell({ c: 0, r: R });
                if (!sheet[numCellRef] || !sheet[numCellRef].v) continue;
                
                const nameCellRef = XLSX.utils.encode_cell({ c: 1, r: R });
                if (empIndex < employees.length) {
                    if (!sheet[nameCellRef]) sheet[nameCellRef] = { t: 's', v: '' };
                    sheet[nameCellRef].v = employees[empIndex].full_name;
                    empIndex++;
                } else {
                    if (sheet[nameCellRef]) sheet[nameCellRef].v = '';
                }
            }
        });
    } catch (e) {
        console.error("Xodimlarni yuklashda xatolik:", e);
    }
}

// ==========================================
function buildFormulaMap() {
    if (!pu74Workbook) return;
    pu74FormulaMap = {};
    pu74Workbook.SheetNames.forEach((name, si) => {
        const sheet = pu74Workbook.Sheets[name];
        if (!sheet || !sheet['!ref']) return;
        pu74FormulaMap[si] = {};
        const range = XLSX.utils.decode_range(sheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const ref = XLSX.utils.encode_cell({ c: C, r: R });
                const cell = sheet[ref];
                if (cell && cell.f) {
                    pu74FormulaMap[si][ref] = cell.f;
                }
            }
        }
    });
}

function cleanupFormulaEdits() {
    if (!pu74FormulaMap || !pu74EditedCells) return;
    let modified = false;
    Object.keys(pu74FormulaMap).forEach(si => {
        const formulas = pu74FormulaMap[si];
        Object.keys(formulas).forEach(cellRef => {
            const decoded = XLSX.utils.decode_cell(cellRef);
            const editKey = si + '_' + decoded.r + '_' + decoded.c;
            if (pu74EditedCells[editKey] !== undefined) {
                delete pu74EditedCells[editKey];
                modified = true;
            }
        });
    });
    if (modified) {
        localStorage.setItem(getPU74LocalKey('pu74_edits'), JSON.stringify(pu74EditedCells));
    }
}

// ==========================================
// 4. SHEET TABLAR
// ==========================================
function renderPU74SheetTabs() {
    const tc = document.getElementById('pu74-sheet-tabs');
    if (!tc || !pu74Workbook) return;
    tc.innerHTML = pu74Workbook.SheetNames.map((name, idx) => {
        const a = idx === pu74ActiveSheet;
        const dn = name.length > 18 ? name.substring(0, 16) + '..' : name;
        return `<button onclick="renderPU74Sheet(${idx})" class="pu74-tab-btn${a ? ' active' : ''}" title="${name}">${dn}</button>`;
    }).join('');
}

// ==========================================
// 5. SHEET RENDER (Formulalar bilan)
// ==========================================
function renderPU74Sheet(si) {
    if (!pu74Workbook) return;
    pu74ActiveSheet = si;
    renderPU74SheetTabs();

    const sn = pu74Workbook.SheetNames[si];
    const sheet = pu74Workbook.Sheets[sn];
    const cd = document.getElementById('pu74-journal-content');

    if (!sheet || !sheet['!ref']) {
        cd.innerHTML = '<div style="padding:40px;text-align:center;color:#999;">Bu bet bo\'sh</div>';
        return;
    }

    const range = XLSX.utils.decode_range(sheet['!ref']);
    const merges = sheet['!merges'] || [];
    const formulas = pu74FormulaMap[si] || {};

    // FAQAT 1-bet (index 0) muqova sahifa — boshqa betlarda to'liq kataklar ko'rinsin
    const isCoverPage = (si === 0);

    // Merge map
    const mm = {};
    merges.forEach(m => {
        const rs = m.e.r - m.s.r + 1, cs = m.e.c - m.s.c + 1;
        for (let r = m.s.r; r <= m.e.r; r++)
            for (let c = m.s.c; c <= m.e.c; c++)
                mm[r + '_' + c] = (r === m.s.r && c === m.s.c) ? { rowspan: rs, colspan: cs } : 'skip';
    });

    // Parse column widths using adaptive sizing & min-width to prevent horizontal scrolling
    let colgroup = '';
    if (sheet['!cols'] && sheet['!cols'].length > 0) {
        colgroup = '<colgroup>';
        for (let C = range.s.c; C <= range.e.c; C++) {
            let maxLen = 0;
            if (!isCoverPage) {
                for (let R = Math.max(range.s.r, 4); R <= range.e.r; R++) {
                    const mk = R + '_' + C;
                    if (mm[mk] === 'skip') continue;
                    const mi = mm[mk];
                    if (mi && mi.colspan > 1) continue; // ignore merged columns

                    const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
                    const editKey = si + '_' + R + '_' + C;
                    let val = '';
                    if (pu74EditedCells[editKey] !== undefined) {
                        val = pu74EditedCells[editKey];
                    } else {
                        const cell = sheet[cellRef];
                        if (cell) {
                            val = cell.w || String(cell.v || '');
                        }
                    }
                    if (val) {
                        maxLen = Math.max(maxLen, val.trim().length);
                    }
                }
            }

            let styleStr = '';
            let excelWpx = (sheet['!cols'] && sheet['!cols'][C]) ? sheet['!cols'][C].wpx : 0;
            if (!excelWpx && sheet['!cols'] && sheet['!cols'][C] && sheet['!cols'][C].wch) {
                excelWpx = sheet['!cols'][C].wch * 7.5; // Approximate conversion
            }

            if (!isCoverPage) {
                if (excelWpx > 0) {
                    // Always respect Excel's width but give a comfortable minimum to prevent squeezing.
                    // max-width qaytarildi (jadval tartibli/bir xil kenglikda qolishi uchun) — endi
                    // katakchalarda overflow-wrap:break-word ishlagani uchun uzun matn kesilmay,
                    // shu kenglik ichida yangi qatorga o'tib yoziladi.
                    let minW = Math.max(excelWpx * 1.15, maxLen > 40 ? 300 : (maxLen > 20 ? 180 : 40));
                    let maxW = Math.max(minW, maxLen > 40 ? 420 : minW * 1.4);
                    styleStr = `min-width: ${minW}px; width: ${minW}px; max-width: ${maxW}px;`;
                } else {
                    // Fallback heuristics if excel didn't define width
                    if (C === 1 && si < 3) {
                        styleStr = 'min-width: 280px; width: 12%;'; // F.I.O column explicitly wide
                    } else if (C === 2 && si < 3) {
                        styleStr = 'min-width: 200px; width: 10%;'; // Наименование column explicitly wide
                    } else if (maxLen > 50) {
                        styleStr = 'min-width: 350px; width: auto;'; // Large text columns
                    } else if (maxLen > 30) {
                        styleStr = 'min-width: 250px; width: auto;'; // Large text columns
                    } else if (maxLen > 15) {
                        styleStr = 'min-width: 140px; width: auto;';
                    } else if (maxLen > 8) {
                        styleStr = 'min-width: 70px; width: auto;';
                    } else {
                        styleStr = 'min-width: 45px; width: auto;'; // Narrow / Date / Numeric columns
                    }
                }
            } else {
                styleStr = `min-width: ${excelWpx > 0 ? excelWpx : 50}px;`; // Cover page columns
            }
            colgroup += `<col style="${styleStr}">`;
        }
        colgroup += '</colgroup>';
    }

    let html = '';
    for (let R = range.s.r; R <= range.e.r; R++) {
        let rowStyle = '';
        if (sheet['!rows'] && sheet['!rows'][R]) {
            const row = sheet['!rows'][R];
            if (row.hpx) {
                rowStyle = ` style="height: ${row.hpx}px;"`;
            } else if (row.hpt) {
                rowStyle = ` style="height: ${Math.round(row.hpt * 1.3)}px;"`;
            }
        }
        html += `<tr${rowStyle}>`;
        for (let C = range.s.c; C <= range.e.c; C++) {
            const mk = R + '_' + C;
            if (mm[mk] === 'skip') continue;

            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            const cell = sheet[cellRef];
            const editKey = si + '_' + R + '_' + C;
            const hasFormula = !!formulas[cellRef];

            // Qiymatni aniqlash
            let val = '';
            if (pu74EditedCells[editKey] !== undefined) {
                val = pu74EditedCells[editKey];
            } else if (hasFormula) {
                // Inline formula evaluation — compute the formula result during render
                const result = evaluateFormula(si, formulas[cellRef]);
                if (result !== null) {
                    val = result % 1 !== 0 ? result.toFixed(2) : String(result);
                } else if (cell) {
                    // Fallback to cached workbook value
                    if (cell.w) val = cell.w;
                    else if (cell.v !== undefined) {
                        val = typeof cell.v === 'number'
                            ? (cell.v % 1 !== 0 ? cell.v.toFixed(2) : String(cell.v))
                            : String(cell.v);
                    }
                }
            } else if (cell) {
                if (cell.w) val = cell.w;
                else if (cell.v !== undefined) {
                    if (typeof cell.v === 'number') {
                        val = cell.v % 1 !== 0 ? cell.v.toFixed(2) : String(cell.v);
                    } else {
                        val = String(cell.v);
                    }
                }
            }

            const trimVal = val.trim();
            const isEmpty = trimVal === '';

            // TD CSS klasslari
            let cls = '';
            if (hasFormula) {
                const isCrossSheet = formulas[cellRef].includes("'");
                cls += isCrossSheet ? ' pu74-formula-cell pu74-cross-formula' : ' pu74-formula-cell';
            } else if (isCoverPage && isEmpty) {
                // FAQAT 1-betda bo'sh kataklar chegarasiz bo'ladi
                cls += ' pu74-empty-cell';
            } else if (isCoverPage && trimVal.length > 5) {
                // 1-betdagi matnli yozuvlar forma uslubida
                cls += ' pu74-text-cell';
            }
            // Boshqa betlarda hamma katak oddiy chegarali bo'ladi (excel kabi)

            // Sana (kun) sarlavhalari uchun maxsus class (hover effect va pointer uchun)
            // Faqat 4-5, 6-15, 16-31 betlarda ishlashi uchun cheklov
            const sheetNameForDates = (pu74Workbook && pu74Workbook.SheetNames[si]) ? pu74Workbook.SheetNames[si].toLowerCase() : '';
            const isTargetDateSheet = sheetNameForDates.includes('4-5') || sheetNameForDates.includes('6-7');
            
            const parsedTrimVal = parseInt(trimVal, 10);
            let hoverEvents = '';
            // Faqat sana sarlavhalari (1-31 gacha bo'lgan kunlar) uchun hover (header qatorlari R < 4 bo'ladi)
            if (!isCoverPage && isTargetDateSheet && R < 4 && !isNaN(parsedTrimVal) && parsedTrimVal >= 1 && parsedTrimVal <= 31 && trimVal.length <= 2) {
                cls += ' pu74-date-header';
                hoverEvents = ` onmouseenter="showPU74WarningTooltip(this, ${parsedTrimVal})" onmouseleave="hidePU74WarningTooltip()"`;
            }
            
            const verticalKeywords = [
                'НОРМИРОВАННОЕ ВРЕМЯ', 'ЧЕЛ.-ЧАС', 'Ч-ЧАС',
                'ФАКТИЧ', 'ОТРАБО', 'НОРМИР', 'ОБЪЕМ ВЫПОЛН', 'СТАТЕЙ РАСХОД', 
                'НОРМА ВЫРАБОТ', 'КОЛИЧЕСТ'
            ];
            
            if (verticalKeywords.some(kw => trimVal.toUpperCase().includes(kw))) {
                cls += ' pu74-vertical-header';
            }

            if (cell && cell.t === 'n') cls += ' pu74-num-cell';

            let spanStr = '';
            const mi = mm[mk];
            if (mi && typeof mi === 'object') {
                if (mi.rowspan > 1) spanStr += ` rowspan="${mi.rowspan}"`;
                if (mi.colspan > 1) spanStr += ` colspan="${mi.colspan}"`;
            }

            const isDept = window.Auth && window.Auth.currentUser?.role === 'department';
            // Protect header rows (rows 0-3) in subsheets from editing
            const isHeaderCell = !isCoverPage && (R < 4);
            
            // Check if page is signed
            const currentSheetName = (pu74Workbook && pu74Workbook.SheetNames[si]) ? pu74Workbook.SheetNames[si] : '';
            const isSignedPage = !!(pu74Signatures && pu74Signatures[currentSheetName]);
            
            // Allow editing formula cells manually to override, but lock if signed
            const editable = (isDept || isHeaderCell || isSignedPage) ? 'false' : 'true';
            const tooltipStr = hasFormula ? ` title="Formula: =${formulas[cellRef]}"` : '';

            html += `<td${spanStr} class="${cls}"${tooltipStr}${hoverEvents} contenteditable="${editable}" data-r="${R}" data-c="${C}" data-si="${si}" data-ref="${cellRef}" onclick="onPU74CellClick(this)" onfocus="this.classList.add('editing')" onblur="onPU74CellEdit(this);this.classList.remove('editing')">${val}</td>`;
        }
        html += '</tr>';
    }

    // IMZO va sahifa
    const signatureHTML = buildSignatureHTML();
    const pageClass = isCoverPage ? 'pu74-paper-page pu74-cover-page pu74-page-enter' : 'pu74-paper-page pu74-page-enter';

    const tableStyle = ` style="table-layout: auto; width: 100%; border-collapse: collapse;"`;

    cd.innerHTML = `
        <div class="${pageClass}">
            <div style="width: 100%; overflow-x: auto; margin-bottom: 25px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                <table class="pu74-journal-table"${tableStyle}>${colgroup}${html}</table>
            </div>
            ${signatureHTML}
        </div>
    `;

    initSignatureCanvases();
    recalcAllFormulas();

    // === DOM-based direct total computation (backup for formula engine) ===
    // This reads visible cell text from the DOM and computes totals directly
    setTimeout(() => {
        const container = document.getElementById('pu74-journal-content');
        if (!container) return;

        // Build a map of all TDs by row_col
        const allTds = container.querySelectorAll('td[data-si="' + si + '"]');
        const tdMap = {};
        allTds.forEach(td => {
            const key = td.getAttribute('data-r') + '_' + td.getAttribute('data-c');
            tdMap[key] = td;
        });

        // Process each formula cell
        const formulaCells = container.querySelectorAll('td.pu74-formula-cell[data-si="' + si + '"]');
        formulaCells.forEach(td => {
            const ref = td.getAttribute('data-ref');
            const formulas = pu74FormulaMap[si] || {};
            const formula = formulas[ref];
            if (!formula) return;

            let total = null;

            // Handle SUM(X:Y) range formulas (e.g., =SUM(C11:R12))
            const rangeMatch = formula.match(/^SUM\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
            if (rangeMatch) {
                const start = XLSX.utils.decode_cell(rangeMatch[1]);
                const end = XLSX.utils.decode_cell(rangeMatch[2]);
                total = 0;
                for (let r = Math.min(start.r, end.r); r <= Math.max(start.r, end.r); r++) {
                    for (let c = Math.min(start.c, end.c); c <= Math.max(start.c, end.c); c++) {
                        const sourceTd = tdMap[r + '_' + c];
                        if (sourceTd) {
                            const v = parseFloat(sourceTd.innerText.trim());
                            if (!isNaN(v)) total += v;
                        } else {
                            // Cell might be in workbook but not rendered (merged/skip)
                            const cellRef = XLSX.utils.encode_cell({ c, r });
                            const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[si]];
                            if (sheet && sheet[cellRef]) {
                                const cv = sheet[cellRef].v;
                                if (typeof cv === 'number') total += cv;
                                else {
                                    const p = parseFloat(cv);
                                    if (!isNaN(p)) total += p;
                                }
                            }
                        }
                    }
                }
            }

            // Handle SUM(X,Y,Z,...) list formulas (e.g., =SUM(C41,D41,...))
            if (total === null) {
                const listMatch = formula.match(/^SUM\(([^)]+)\)$/i);
                if (listMatch) {
                    const refs = listMatch[1].split(',');
                    total = 0;
                    refs.forEach(refStr => {
                        const cleanRef = refStr.trim().replace(/\$/g, '');
                        if (/^[A-Z]+\d+$/i.test(cleanRef)) {
                            const decoded = XLSX.utils.decode_cell(cleanRef);
                            const sourceTd = tdMap[decoded.r + '_' + decoded.c];
                            if (sourceTd) {
                                const v = parseFloat(sourceTd.innerText.trim());
                                if (!isNaN(v)) total += v;
                            }
                        }
                    });
                }
            }

            // Handle SUM(C41:R41) which is the bottom summary row
            if (total === null) {
                const rangeMatch2 = formula.match(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/i);
                if (rangeMatch2) {
                    const start = XLSX.utils.decode_cell(rangeMatch2[1]);
                    const end = XLSX.utils.decode_cell(rangeMatch2[2]);
                    total = 0;
                    for (let r = Math.min(start.r, end.r); r <= Math.max(start.r, end.r); r++) {
                        for (let c = Math.min(start.c, end.c); c <= Math.max(start.c, end.c); c++) {
                            const sourceTd = tdMap[r + '_' + c];
                            if (sourceTd) {
                                const v = parseFloat(sourceTd.innerText.trim());
                                if (!isNaN(v)) total += v;
                            }
                        }
                    }
                }
            }

            if (total !== null && total !== 0) {
                td.innerText = total % 1 !== 0 ? total.toFixed(2) : String(total);
                td.style.color = '#2563eb';
                td.style.fontWeight = '800';
            }
        });

        console.log('[PU74 v2.1] DOM-based total computation completed for sheet ' + si);
    }, 100);
}

// ==========================================
// 6. IMZO (ELEKTRON SIGNATURE) TIZIMI
// ==========================================
function buildSignatureHTML() {
    const roles = [
        { id: 'pdb', label: 'ПДБ (Yo\'l boshlig\'i)' },
        { id: 'pd', label: 'ПД (Bo\'linma boshlig\'i)' },
        { id: 'normировщик', label: 'Normировщик' },
        { id: 'brigadir', label: 'Brigadir' }
    ];

    return `
        <div class="pu74-signature-area">
            ${roles.map(r => `
                <div class="pu74-signature-box">
                    <label>${r.label}</label>
                    <canvas class="pu74-signature-canvas${pu74Signatures[r.id] ? ' signed' : ''}" data-role="${r.id}" width="200" height="60"></canvas>
                    <button class="pu74-sign-btn" onclick="clearSignature('${r.id}')"><i class="fas fa-eraser"></i> Tozalash</button>
                </div>
            `).join('')}
        </div>
    `;
}

function initSignatureCanvases() {
    document.querySelectorAll('.pu74-signature-canvas').forEach(canvas => {
        const role = canvas.getAttribute('data-role');
        const ctx = canvas.getContext('2d');

        // Oldindan saqlangan imzoni yuklash
        if (pu74Signatures[role]) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = pu74Signatures[role];
        }

        let drawing = false;
        canvas.addEventListener('mousedown', e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
        canvas.addEventListener('mousemove', e => {
            if (!drawing) return;
            ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a2e';
            ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke();
        });
        canvas.addEventListener('mouseup', () => { drawing = false; saveSignature(role, canvas); });
        canvas.addEventListener('mouseleave', () => { drawing = false; });

        // Touch support
        canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; const t = e.touches[0]; const r = canvas.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(t.clientX - r.left, t.clientY - r.top); });
        canvas.addEventListener('touchmove', e => {
            e.preventDefault(); if (!drawing) return;
            const t = e.touches[0]; const r = canvas.getBoundingClientRect();
            ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a2e';
            ctx.lineTo(t.clientX - r.left, t.clientY - r.top); ctx.stroke();
        });
        canvas.addEventListener('touchend', () => { drawing = false; saveSignature(role, canvas); });
    });
}

function saveSignature(role, canvas) {
    pu74Signatures[role] = canvas.toDataURL();
    canvas.classList.add('signed');
}

window.clearSignature = function (role) {
    const canvas = document.querySelector(`.pu74-signature-canvas[data-role="${role}"]`);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.remove('signed');
        delete pu74Signatures[role];
    }
};

// ==========================================
// 7. FORMULA ENGINE (Cross-sheet va hamma turdagi formulalar)
// ==========================================

// Sheet nomidan index topish
function getSheetIndex(sheetName) {
    if (!pu74Workbook) return -1;
    for (let i = 0; i < pu74Workbook.SheetNames.length; i++) {
        if (pu74Workbook.SheetNames[i] === sheetName) return i;
    }
    return -1;
}

function getCellNumericValue(si, cellRef) {
    const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[si]];
    if (!sheet) return 0;
    const decoded = XLSX.utils.decode_cell(cellRef);
    const editKey = si + '_' + decoded.r + '_' + decoded.c;

    if (pu74EditedCells[editKey] !== undefined) {
        const v = parseFloat(pu74EditedCells[editKey]);
        return isNaN(v) ? 0 : v;
    }

    // Agar bu katak o'zi formula bo'lsa, avval hisoblash kerak
    const formulas = pu74FormulaMap[si] || {};
    if (formulas[cellRef]) {
        const result = evaluateFormula(si, formulas[cellRef]);
        if (result !== null) return result;
    }

    const cell = sheet[cellRef];
    if (!cell) return 0;
    if (typeof cell.v === 'number') return cell.v;
    const p = parseFloat(cell.v);
    return isNaN(p) ? 0 : p;
}

function evaluateFormula(si, formula) {
    let expr = formula.trim();
    if (expr.startsWith('=')) expr = expr.substring(1);
    if (expr.startsWith('+')) expr = expr.substring(1);

    // 1. Replace SUM(A1:B10) or SUM('Sheet Name'!A1:B10) with computed sum
    expr = expr.replace(/SUM\((?:'([^']+)'!)?([\$]?[A-Z]+[\$]?\d+):([\$]?[A-Z]+[\$]?\d+)\)/gi, (match, sheetName, startRef, endRef) => {
        const targetSI = sheetName ? getSheetIndex(sheetName) : si;
        if (targetSI < 0) return '0';
        const start = XLSX.utils.decode_cell(startRef.replace(/\$/g, ''));
        const end = XLSX.utils.decode_cell(endRef.replace(/\$/g, ''));
        let total = 0;
        const minRow = Math.min(start.r, end.r);
        const maxRow = Math.max(start.r, end.r);
        const minCol = Math.min(start.c, end.c);
        const maxCol = Math.max(start.c, end.c);
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                total += getCellNumericValue(targetSI, XLSX.utils.encode_cell({ c, r }));
            }
        }
        return String(total);
    });

    // 2. Replace SUM(A1,B2,C3) list formats (both local and cross-sheet)
    expr = expr.replace(/SUM\(([^)]+)\)/gi, (match, listStr) => {
        const refs = listStr.split(',');
        let total = 0;
        refs.forEach(ref => {
            const cleanRef = ref.trim();
            const cross = cleanRef.match(/^(?:'([^']+)'!)?([\$]?[A-Z]+[\$]?\d+)$/i);
            if (cross) {
                const targetSI = cross[1] ? getSheetIndex(cross[1]) : si;
                if (targetSI >= 0) {
                    total += getCellNumericValue(targetSI, cross[2].replace(/\$/g, ''));
                }
            } else {
                const num = parseFloat(cleanRef);
                if (!isNaN(num)) total += num;
            }
        });
        return String(total);
    });

    // 3. Replace cell references with their numeric values
    const cellRegex = /(?:'([^']+)'!)?([\$]?[A-Z]+[\$]?\d+)/gi;
    expr = expr.replace(cellRegex, (match, sheetName, cellRef) => {
        const targetSI = sheetName ? getSheetIndex(sheetName) : si;
        if (targetSI < 0) return '0';
        const val = getCellNumericValue(targetSI, cellRef.replace(/\$/g, ''));
        return String(val);
    });

    // 4. Verify that the expression only contains valid math characters and evaluate it safely
    if (/^[0-9\+\-\*\/\(\)\.\s]+$/.test(expr)) {
        try {
            // Safe mathematical evaluation using strict Function execution
            const result = Function('"use strict"; return (' + expr + ')')();
            const cleanResult = isNaN(result) ? 0 : result;
            
            // Debug logging
            const logMsg = `[Formula] =${formula} -> ${expr} = ${cleanResult}`;
            console.log(logMsg);
            if (window.pu74FormulaDebug) window.pu74FormulaDebug(logMsg);
            
            return cleanResult;
        } catch (e) {
            console.error("Formula evaluation error:", e, expr, formula);
            if (window.pu74FormulaDebug) window.pu74FormulaDebug(`[Error] =${formula} -> ${expr}: ${e.message}`);
            return 0;
        }
    }

    const logErr = `[Unsupported] =${formula} -> resolved to: ${expr}`;
    console.warn(logErr);
    if (window.pu74FormulaDebug) window.pu74FormulaDebug(logErr);
    return null; // Unsupported or invalid formula format
}

window.recalcAllFormulas = function (silent = false) {
    if (!pu74Workbook) return;
    let count = 0;

    // Barcha sheetlardagi formulalarni hisoblash (cross-sheet ham)
    // Avval oddiy formulalar, keyin cross-sheet
    for (let pass = 0; pass < 2; pass++) {
        Object.keys(pu74FormulaMap).forEach(si => {
            const formulas = pu74FormulaMap[si];
            Object.keys(formulas).forEach(cellRef => {
                const formula = formulas[cellRef];
                const isCross = formula.includes("'");
                // 1-pass: oddiy, 2-pass: cross-sheet
                if (pass === 0 && isCross) return;
                if (pass === 1 && !isCross) return;

                const decoded = XLSX.utils.decode_cell(cellRef);
                const editKey = si + '_' + decoded.r + '_' + decoded.c;
                if (pu74EditedCells[editKey] !== undefined) return; // SKIP manually edited formula cells

                const result = evaluateFormula(parseInt(si), formula);
                if (result !== null) {
                    const decoded = XLSX.utils.decode_cell(cellRef);
                    // Hozirgi ko'rinayotgan sheet bo'lsagina DOM yangilanadi
                    if (parseInt(si) === pu74ActiveSheet) {
                        const td = document.querySelector(`td[data-si="${si}"][data-r="${decoded.r}"][data-c="${decoded.c}"]`);
                        if (td) {
                            const display = result % 1 !== 0 ? result.toFixed(2) : String(result);
                            td.innerText = display;
                            td.classList.add('pu74-recalc-flash');
                            setTimeout(() => td.classList.remove('pu74-recalc-flash'), 800);
                        }
                    }
                    // Workbook ichidagi qiymatni ham yangilash
                    const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[parseInt(si)]];
                    if (sheet[cellRef]) {
                        sheet[cellRef].v = result;
                        sheet[cellRef].w = result % 1 !== 0 ? result.toFixed(2) : String(result);
                    }
                    count++;
                }
            });
        });
    }

    if (!silent) {
        if (window.SmartUtils) SmartUtils.showToast(count + ' ta formula hisoblandi (betlar aro ham)!', 'success');
        else alert(count + ' ta formula hisoblandi!');
    }
};

// ==========================================
// 8. KATAK TAHRIRLASH
// ==========================================
function onPU74CellEdit(td) {
    const r = td.getAttribute('data-r');
    const c = td.getAttribute('data-c');
    const si = td.getAttribute('data-si');
    const ref = td.getAttribute('data-ref');
    const key = si + '_' + r + '_' + c;
    const newValue = td.innerText.trim();

    const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[parseInt(si)]];
    const origCell = sheet[ref];
    const origValue = origCell ? (origCell.w || String(origCell.v || '')) : '';

    if (newValue !== origValue) {
        pu74EditedCells[key] = newValue;
        // Workbook ni ham yangilash (agar katak yo'q bo'lsa, yaratish)
        if (!sheet[ref]) {
            sheet[ref] = { t: 's' };
        }
        sheet[ref].v = isNaN(newValue) ? newValue : parseFloat(newValue);
        sheet[ref].w = newValue;
        // Barcha formulalarni avtomatik qayta hisoblash (yashirin rejimda)
        if (window.recalcAllFormulas) window.recalcAllFormulas(true);
        // AVTOMATIK SAQLASH
        autoSavePU74();
    } else {
        delete pu74EditedCells[key];
    }
}

let pu74AutoSaveTimer = null;
function autoSavePU74() {
    if (pu74AutoSaveTimer) clearTimeout(pu74AutoSaveTimer);
    pu74AutoSaveTimer = setTimeout(() => {
        localStorage.setItem(getPU74LocalKey('pu74_edits'), JSON.stringify(pu74EditedCells));
        // Visual feedback
        let badge = document.querySelector('.pu74-saved-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'pu74-saved-badge';
            document.body.appendChild(badge);
        }
        badge.innerHTML = '<i class="fas fa-check-circle"></i> Avtomatik saqlandi';
        badge.style.display = 'block';
        setTimeout(() => { badge.style.display = 'none'; }, 2000);
    }, 500); // 500ms delay — tez yozganda ko'p marta saqlamaslik uchun
}

function autoRecalcDependents(si, changedRef, depth) {
    if ((depth || 0) > 10) return; // Cheksiz loop oldini olish
    const cleanRef = changedRef.replace(/\$/g, '');

    // 1. O'sha sheet ichidagi bog'liq formulalar
    const formulas = pu74FormulaMap[si] || {};
    Object.keys(formulas).forEach(cellRef => {
        const f = formulas[cellRef];
        if (f.includes(cleanRef) && !f.includes("'")) {
            const decoded = XLSX.utils.decode_cell(cellRef);
            const editKey = si + '_' + decoded.r + '_' + decoded.c;
            if (pu74EditedCells[editKey] !== undefined) return; // SKIP manually edited

            const result = evaluateFormula(si, f);
            if (result !== null) {
                updateCellDOM(si, cellRef, result);
                // Workbook qiymatini ham yangilash
                const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[si]];
                if (sheet[cellRef]) { sheet[cellRef].v = result; }
                autoRecalcDependents(si, cellRef, (depth || 0) + 1);
            }
        }
    });

    // 2. Boshqa sheetlardagi cross-reference formulalar
    const currentSheetName = pu74Workbook.SheetNames[si];
    Object.keys(pu74FormulaMap).forEach(otherSI => {
        if (parseInt(otherSI) === si) return;
        const otherFormulas = pu74FormulaMap[otherSI] || {};
        Object.keys(otherFormulas).forEach(cellRef => {
            const f = otherFormulas[cellRef];
            // "'sheet_name'!CELLREF" formatidagi formulalar
            if (f.includes("'" + currentSheetName + "'") && f.includes(cleanRef)) {
                const decoded = XLSX.utils.decode_cell(cellRef);
                const editKey = otherSI + '_' + decoded.r + '_' + decoded.c;
                if (pu74EditedCells[editKey] !== undefined) return; // SKIP manually edited

                const result = evaluateFormula(parseInt(otherSI), f);
                if (result !== null) {
                    // Workbook qiymatini yangilash
                    const otherSheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[parseInt(otherSI)]];
                    if (otherSheet[cellRef]) { otherSheet[cellRef].v = result; }
                    // DOM (faqat ko'rinayotgan sheet)
                    if (parseInt(otherSI) === pu74ActiveSheet) {
                        updateCellDOM(parseInt(otherSI), cellRef, result);
                    }
                    // Cascade — bu o'zgarish ham boshqa formulalarga ta'sir qilishi mumkin
                    autoRecalcDependents(parseInt(otherSI), cellRef, (depth || 0) + 1);
                }
            }
        });
    });
}

function updateCellDOM(si, cellRef, result) {
    const decoded = XLSX.utils.decode_cell(cellRef);
    const td = document.querySelector(`td[data-si="${si}"][data-r="${decoded.r}"][data-c="${decoded.c}"]`);
    if (td) {
        td.innerText = result % 1 !== 0 ? result.toFixed(2) : String(result);
        td.classList.add('pu74-recalc-flash');
        setTimeout(() => td.classList.remove('pu74-recalc-flash'), 800);
    }
}

// ==========================================
// 8.5 EXCEL EXPORT (download)
// ==========================================
window.downloadPU74Workbook = function () {
    if (!pu74Workbook) return;
    Object.keys(pu74EditedCells).forEach(k => {
        const parts = k.split('_');
        const si = parseInt(parts[0]), r = parseInt(parts[1]), c = parseInt(parts[2]);
        const ref = XLSX.utils.encode_cell({ r, c });
        const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[si]];
        if (!sheet[ref]) sheet[ref] = {};
        const val = pu74EditedCells[k];
        const num = parseFloat(val);
        sheet[ref].v = isNaN(num) ? val : num;
        sheet[ref].t = typeof sheet[ref].v === 'number' ? 'n' : 's';
        sheet[ref].w = String(val);
    });

    const wbout = XLSX.write(pu74Workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const folder = pu74CurrentDept ? `${pu74CurrentDept}_${yearMonth}_` : '';

    const a = document.createElement('a');
    a.href = url;
    a.download = folder + pu74CurrentFile;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
};

// ==========================================
// 9. SAQLASH
// ==========================================
window.savePU74Edits = async function () {
    // Saqlash – localStorage (tahrirlar + imzolar)
    localStorage.setItem(getPU74LocalKey('pu74_edits'), JSON.stringify(pu74EditedCells));
    localStorage.setItem(getPU74LocalKey('pu74_signs'), JSON.stringify(pu74Signatures));

    if (window.SmartUtils) SmartUtils.showToast("Local saqlandi, serverga jo'natilmoqda...", "info");

    // Serverga (Iqtisod bo'limi) ga uzatish
    await uploadPU74ToServer();
};

async function uploadPU74ToServer() {
    if (!pu74Workbook) return;

    // Faylni hozirgi tahrirlangan holati bilan yangilaymiz
    Object.keys(pu74EditedCells).forEach(k => {
        const parts = k.split('_');
        const si = parseInt(parts[0]), r = parseInt(parts[1]), c = parseInt(parts[2]);
        const ref = XLSX.utils.encode_cell({ r, c });
        const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[si]];
        if (!sheet[ref]) sheet[ref] = {};
        const val = pu74EditedCells[k];
        const num = parseFloat(val);
        sheet[ref].v = isNaN(num) ? val : num;
        sheet[ref].t = typeof sheet[ref].v === 'number' ? 'n' : 's';
        sheet[ref].w = String(val);
    });

    const wbout = XLSX.write(pu74Workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const dept = pu74CurrentDept || 'iqtisod';

    const formData = new FormData();
    formData.append('file', blob, pu74CurrentFile);
    formData.append('department', `${dept}/${yearMonth}`);
    formData.append('module', 'PU-74');
    formData.append('bolinma_id', dept); // iqtisod yoki kelgan bolinma_id
    formData.append('status', 'approved');

    try {
        const res = await window.SmartPCH.secureFetch(`${window.CONFIG.API_URL}/files/upload`, {
            method: 'POST',
            headers: SmartUtils.getApiHeaders({}, { json: false }),
            body: formData
        });

        // ==========================================
        // NEW: Granular Database Storage (Sync)
        // ==========================================
        try {
            // Extract some key info for indexing (heuristic based on sheet 0)
            const sheet0 = pu74Workbook.Sheets[pu74Workbook.SheetNames[0]];
            const actNum = sheet0['K6']?.v || '-';
            const location = sheet0['C11']?.v || '-';
            const bridgeId = sheet0['K11']?.v || '-';
            const workDate = sheet0['K8']?.v || now.toISOString().split('T')[0];

            await SmartUtils.fetchAPI('/pu74/records', {
                method: 'POST',
                body: JSON.stringify({
                    bolinma_id: dept,
                    date: workDate,
                    act_number: actNum,
                    location_name: location,
                    bridge_id: bridgeId,
                    details: pu74EditedCells, // Store all edits for deep search
                    status: 'approved'
                })
            });
            console.log("✅ Granular PU-74 data synced to DB");
        } catch (dbErr) {
            console.error("PU-74 DB Sync failed", dbErr);
        }

        if (!res.ok) {
            console.error("Faylni serverga yozishda xatolik:", await res.text());
            if (window.SmartUtils) SmartUtils.showToast("Serverga yuborishda xatolik bo'ldi.", "error");
        } else {
            console.log("Iqtisod bo'limi ro'yxatiga muvaffaqiyatli saqlandi!");
            if (window.SmartUtils) SmartUtils.showToast("PU-74 ma'lumotlari yuborildi va bazaga saqlandi!", "success");
            else alert("Iqtisod bo'limi ro'yxatiga saqlandi!");
        }
    } catch (e) {
        console.error("Upload failed", e);
        if (window.SmartUtils) SmartUtils.showToast("Serverga ulanishda xato!", "error");
    }
}

// ==========================================
// 10. OVOZLI KIRITISH
// ==========================================
let pu74ExcelRecognition = null;

window.togglePU74ExcelVoice = function () {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        if (window.SmartUtils) SmartUtils.showToast("Brauzer ovozli kiritishni qo'llab-quvvatlamaydi.", "error");
        return;
    }

    const btn = document.getElementById('pu74-voice-btn');
    if (btn && btn.innerHTML.includes('Eshitilmoq') && pu74ExcelRecognition) {
        pu74ExcelRecognition.stop();
        resetPU74ExcelMic();
        return;
    }

    const focusedCell = document.querySelector('#pu74-journal-content td.editing, #pu74-journal-content td:focus');
    if (!focusedCell) {
        alert("Avval jurnaldagi biror katakchani bosing, keyin ovozli kiritishni boshlang!");
        return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!pu74ExcelRecognition) {
        pu74ExcelRecognition = new SR();
        pu74ExcelRecognition.lang = 'uz-UZ';
        pu74ExcelRecognition.interimResults = false;

        pu74ExcelRecognition.onstart = () => {
            const b = document.getElementById('pu74-voice-btn');
            if (b) { b.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eshitilmoqda...'; b.style.background = 'linear-gradient(135deg,#e74c3c,#c0392b)'; }
        };

        pu74ExcelRecognition.onresult = (event) => {
            let text = '';
            for (let i = event.resultIndex; i < event.results.length; ++i)
                if (event.results[i].isFinal) text += event.results[i][0].transcript;
            if (text) {
                const ac = document.querySelector('#pu74-journal-content td.editing, #pu74-journal-content td:focus');
                if (ac) {
                    ac.innerText = text.charAt(0).toUpperCase() + text.slice(1);
                    onPU74CellEdit(ac);
                    if (window.SmartUtils) SmartUtils.showToast("Ovoz yozildi!", "success");
                }
            }
        };

        pu74ExcelRecognition.onerror = () => resetPU74ExcelMic();
        pu74ExcelRecognition.onend = () => resetPU74ExcelMic();
    }

    try { pu74ExcelRecognition.start(); } catch (e) { pu74ExcelRecognition.stop(); setTimeout(() => pu74ExcelRecognition.start(), 100); }
};

function resetPU74ExcelMic() {
    const b = document.getElementById('pu74-voice-btn');
    if (b) { b.innerHTML = "<i class='fas fa-microphone'></i> Ovozli kiritish"; b.style.background = 'linear-gradient(135deg,#f39c12,#d35400)'; }
}

// ==========================================
// 11. YORDAMCHI
// ==========================================
function closePU74Viewer() {
    const v = document.getElementById('pu74-excel-viewer');
    if (v) v.remove();
}

// ==========================================
// 11b. CHOP ETISH — keng jadvalni ustunlar bo'yicha 2 A4 sahifaga bo'lish
// ==========================================
// Kunlik hisobot betlarida jadval juda keng (ish tavsifi + ЗАДАНИЕ + 1-31 kunlar + ИТОГО).
// Bo'linish nuqtasi — "ЧИСЛА МЕСЯЦА" (1-31 kunlar) boshlanadigan birinchi ustun.
// Bunday ustun topilmasa (muqova yoki F.I.O. betlari), null qaytariladi va oddiy chop etish davom etadi.
function splitPU74TableForPrint(tableEl) {
    const dateHeaderCells = tableEl.querySelectorAll('.pu74-date-header');
    if (!dateHeaderCells.length) return null;

    let splitC = Infinity;
    dateHeaderCells.forEach(td => {
        const c = parseInt(td.getAttribute('data-c'), 10);
        if (!isNaN(c) && c < splitC) splitC = c;
    });
    if (!isFinite(splitC)) return null;

    const leftTable = document.createElement('table');
    leftTable.className = tableEl.className;
    const rightTable = document.createElement('table');
    rightTable.className = tableEl.className;

    const colgroupEl = tableEl.querySelector('colgroup');
    if (colgroupEl) {
        const leftColgroup = document.createElement('colgroup');
        const rightColgroup = document.createElement('colgroup');
        Array.from(colgroupEl.children).forEach((col, idx) => {
            (idx < splitC ? leftColgroup : rightColgroup).appendChild(col.cloneNode(true));
        });
        leftTable.appendChild(leftColgroup);
        rightTable.appendChild(rightColgroup);
    }

    tableEl.querySelectorAll(':scope > tr').forEach(tr => {
        const leftTr = document.createElement('tr');
        const rightTr = document.createElement('tr');

        Array.from(tr.children).forEach(td => {
            const c = parseInt(td.getAttribute('data-c'), 10);
            if (isNaN(c)) return; // data-c yo'q katak — bo'lib bo'lmaydi, tashlab ketiladi
            const colspan = parseInt(td.getAttribute('colspan'), 10) || 1;
            const endC = c + colspan;

            if (endC <= splitC) {
                leftTr.appendChild(td.cloneNode(true));
            } else if (c >= splitC) {
                rightTr.appendChild(td.cloneNode(true));
            } else {
                // colspan bo'linish nuqtasini kesib o'tadi — ikkiga ajratamiz,
                // matn (masalan sarlavha nomi) ikkala tomonda ham qoladi
                const leftClone = td.cloneNode(true);
                const leftSpan = splitC - c;
                if (leftSpan > 1) leftClone.setAttribute('colspan', String(leftSpan));
                else leftClone.removeAttribute('colspan');
                leftTr.appendChild(leftClone);

                const rightClone = td.cloneNode(true);
                const rightSpan = endC - splitC;
                if (rightSpan > 1) rightClone.setAttribute('colspan', String(rightSpan));
                else rightClone.removeAttribute('colspan');
                rightTr.appendChild(rightClone);
            }
        });

        if (leftTr.children.length) leftTable.appendChild(leftTr);
        if (rightTr.children.length) rightTable.appendChild(rightTr);
    });

    return { leftTable, rightTable };
}

function printPU74Journal() {
    const tableEl = document.querySelector('#pu74-journal-content .pu74-journal-table');
    if (!tableEl) { window.print(); return; }

    const split = splitPU74TableForPrint(tableEl);
    if (!split) { window.print(); return; }

    const wrapper = tableEl.parentElement;
    const paperPage = tableEl.closest('.pu74-paper-page');
    if (!wrapper || !paperPage) { window.print(); return; }

    wrapper.classList.add('pu74-hide-in-print');

    const container = document.createElement('div');
    container.id = 'pu74-print-split-container';

    const page1 = document.createElement('div');
    page1.className = 'pu74-print-split-page';
    page1.appendChild(split.leftTable);

    const page2 = document.createElement('div');
    page2.className = 'pu74-print-split-page pu74-print-split-page-2';
    page2.appendChild(split.rightTable);

    container.appendChild(page1);
    container.appendChild(page2);
    paperPage.insertBefore(container, wrapper.nextSibling);

    const cleanup = () => {
        container.remove();
        wrapper.classList.remove('pu74-hide-in-print');
        window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    window.print();
}
window.printPU74Journal = printPU74Journal;

window.handlePU74FileUpload = function (input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        pu74Workbook = XLSX.read(e.target.result, { type: 'array', cellFormula: true });
        buildFormulaMap();
        renderPU74SheetTabs();
        renderPU74Sheet(0);
    };
    reader.readAsArrayBuffer(file);
};

// Global exports
window.openPU74New = function (bn, id) { openPU74Window(id); };
window.openPU74Window = openPU74Window;
window.loadPU74Brigade = loadPU74Brigade;
window.closePU74Selection = closePU74Selection;
window.closePU74Viewer = closePU74Viewer;
window.renderPU74Sheet = renderPU74Sheet;
window.onPU74CellEdit = onPU74CellEdit;

// ==========================================
// 12. AUTOCOMPLETE EMPLOYEE DROPDOWN
// ==========================================
let pu74Employees = [];
let pu74ActiveTd = null;

function fetchPU74Employees() {
    const token = localStorage.getItem('jwtToken');
    
    let targetBolinma = '';
    
    // 0. Prioritize explicitly selected bolinma from the UI (pu74CurrentDept)
    if (typeof pu74CurrentDept !== 'undefined' && pu74CurrentDept) {
        const numMatch = String(pu74CurrentDept).match(/\d+/);
        if (numMatch) {
            targetBolinma = `${numMatch[0]}-bo'linma`;
        }
    }
    
    // 1. Try to get from bolinmalar
    if (!targetBolinma && window.Auth && window.Auth.currentUser && window.Auth.currentUser.bolinmalar) {
        try {
            const arr = typeof window.Auth.currentUser.bolinmalar === 'string'
                ? JSON.parse(window.Auth.currentUser.bolinmalar)
                : window.Auth.currentUser.bolinmalar;
            if (Array.isArray(arr) && arr.length > 0) {
                const numMatch = String(arr[0]).match(/\d+/);
                if (numMatch) targetBolinma = `${numMatch[0]}-bo'linma`;
            }
        } catch(e) {}
    }
    
    // 2. Try to get from departments (if user is a department user)
    if (!targetBolinma && window.Auth && window.Auth.currentUser && window.Auth.currentUser.departments) {
        try {
            const arr = typeof window.Auth.currentUser.departments === 'string'
                ? JSON.parse(window.Auth.currentUser.departments)
                : window.Auth.currentUser.departments;
            if (Array.isArray(arr) && arr.length > 0) {
                const deptStr = String(arr[0]).toLowerCase();
                if (deptStr.includes('bo\'linma') || deptStr.includes('bolinma') || deptStr.includes('bo\'lim') || deptStr.includes('sex')) {
                    const numMatch = String(arr[0]).match(/\d+/);
                    if (numMatch) targetBolinma = `${numMatch[0]}-bo'linma`;
                }
            }
        } catch(e) {}
    }

    // 3. Fallback to brigade filename if subdivision user is not set
    if (!targetBolinma) {
        const brigadeMatch = String(pu74CurrentFile || '1-brigada').match(/(\d+)/);
        const brigadeNum = brigadeMatch ? brigadeMatch[1] : '1';
        targetBolinma = `${brigadeNum}-bo'linma`;
    }

    fetch(`/api/hr/employees?bolinma_id=${encodeURIComponent(targetBolinma)}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                pu74Employees = data;
            } else {
                pu74Employees = [];
            }
        })
        .catch(err => {
            console.error("Error loading employees for PU-74:", err);
            pu74Employees = [];
        });
}

function initPU74Autocomplete(viewer) {
    // 1. Fetch employee names
    fetchPU74Employees();

    // 2. Append float dropdown markup if missing
    let empDropdown = document.getElementById('pu74-employee-dropdown');
    if (!empDropdown) {
        empDropdown = document.createElement('div');
        empDropdown.id = 'pu74-employee-dropdown';
        empDropdown.className = 'pu74-dropdown-animate';
        empDropdown.style.cssText = 'display:none; position:absolute; z-index:10030; background:rgba(255, 255, 255, 0.98); backdrop-filter:blur(8px); border:1px solid #e2e8f0; border-radius:16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.15); width:320px; padding:18px; font-family:\'Inter\', sans-serif;';
        
        // Inject animation and focus keyframes
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes pu74DropFade {
                from { opacity: 0; transform: scale(0.96) translateY(-10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .pu74-dropdown-animate {
                animation: pu74DropFade 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            #pu74-emp-list::-webkit-scrollbar {
                width: 6px;
            }
            #pu74-emp-list::-webkit-scrollbar-track {
                background: transparent;
            }
            #pu74-emp-list::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 4px;
            }
            #pu74-emp-list::-webkit-scrollbar-thumb:hover {
                background: #cbd5e1;
            }
            #pu74-emp-search:focus {
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            }
            .pu74-emp-item {
                padding: 10px; 
                border-radius: 10px; 
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
                cursor: pointer; 
                display: flex; 
                align-items: center; 
                gap: 12px; 
                margin-bottom: 4px; 
                border: 1px solid transparent;
            }
            .pu74-emp-item:hover {
                background: #f0f7ff; 
                border-color: #dbeafe;
                transform: translateX(4px);
            }
            .pu74-emp-item:active {
                transform: translateX(2px) scale(0.98);
            }
        `;
        document.head.appendChild(styleSheet);

        empDropdown.innerHTML = `
            <div style="font-weight: 800; font-size: 0.85rem; color: #1e293b; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-users-gear" style="color: #3b82f6;"></i>
                    Bo'linma xodimlari
                </span>
                <div onclick="closePU74EmpDropdown()" style="cursor: pointer; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #fee2e2; color: #ef4444; transition: all 0.2s;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                    <i class="fas fa-times" style="font-size: 11px;"></i>
                </div>
            </div>
            <div style="position: relative; margin-bottom: 12px;">
                <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 13px;"></i>
                <input type="text" id="pu74-emp-search" placeholder="Xodim ismini qidiring..." style="width:100%; padding:9px 12px 9px 36px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:12.5px; outline:none; font-family: inherit; box-sizing: border-box; transition: all 0.2s;" />
            </div>
            <div id="pu74-emp-list" style="max-height:220px; overflow-y:auto; font-size:13px; border-top: 1px solid #f1f5f9; padding-top: 8px; display: flex; flex-direction: column;"></div>
        `;
        document.body.appendChild(empDropdown);

        // Bind search input filter
        document.getElementById('pu74-emp-search').addEventListener('input', (e) => {
            renderPU74EmpList(e.target.value);
        });

        // Click outside listener
        document.addEventListener('mousedown', function(e) {
            const dropdown = document.getElementById('pu74-employee-dropdown');
            if (dropdown && dropdown.style.display === 'block') {
                if (!dropdown.contains(e.target) && (!pu74ActiveTd || !pu74ActiveTd.contains(e.target))) {
                    closePU74EmpDropdown();
                }
            }
        });
    }

    // 3. Single-click trigger mapping (optimized for phone/tablet touchscreens)
    const cd = document.getElementById('pu74-journal-content');
    if (cd) {
         cd.addEventListener('click', function(e) {
            const td = e.target.closest('td');
            if (td && td.getAttribute('contenteditable') === 'true') {
                const colIndex = parseInt(td.getAttribute('data-c'));
                // F.I.O. dropdown FAQAT 2-3 betlarda (si=1) ishlaydi
                const sn = (pu74Workbook && pu74Workbook.SheetNames[pu74ActiveSheet]) ? pu74Workbook.SheetNames[pu74ActiveSheet].toLowerCase() : '';
                const is23Bet = sn.includes('2') || sn.includes('3') || pu74ActiveSheet === 1;
                if (colIndex === 1 && is23Bet) {
                    e.preventDefault();
                    showPU74EmpDropdown(td);
                }
            }
        });
    }
}

function showPU74EmpDropdown(td) {
    pu74ActiveTd = td;
    const dropdown = document.getElementById('pu74-employee-dropdown');
    if (!dropdown) return;

    const rect = td.getBoundingClientRect();
    dropdown.style.left = (window.scrollX + rect.left) + 'px';
    dropdown.style.top = (window.scrollY + rect.bottom + 5) + 'px';
    dropdown.style.display = 'block';

    const search = document.getElementById('pu74-emp-search');
    search.value = '';
    search.focus();

    renderPU74EmpList('');
}

function closePU74EmpDropdown() {
    const dropdown = document.getElementById('pu74-employee-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    pu74ActiveTd = null;
}

// Retrieve all filled text values in the active sheet to check for duplicates
function getActiveSheetValues() {
    const values = new Set();
    if (!pu74Workbook) return values;
    
    const sn = pu74Workbook.SheetNames[pu74ActiveSheet];
    const sheet = pu74Workbook.Sheets[sn];
    if (!sheet || !sheet['!ref']) return values;
    
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            const editKey = pu74ActiveSheet + '_' + R + '_' + C;
            let val = '';
            if (pu74EditedCells[editKey] !== undefined) {
                val = pu74EditedCells[editKey];
            } else {
                const cell = sheet[cellRef];
                if (cell) {
                    val = cell.w || String(cell.v || '');
                }
            }
            if (val) {
                values.add(val.trim());
            }
        }
    }
    return values;
}

function renderPU74EmpList(filterText) {
    const listContainer = document.getElementById('pu74-emp-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    const activeSheetValues = getActiveSheetValues();

    const filtered = pu74Employees.filter(emp => {
        // Prevent duplicate selection: if name is already inside the current sheet, exclude it
        if (emp.full_name && activeSheetValues.has(emp.full_name.trim())) {
            return false;
        }

        if (!filterText) return true;
        return String(emp.full_name).toLowerCase().includes(filterText.toLowerCase()) || 
               String(emp.position || '').toLowerCase().includes(filterText.toLowerCase());
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div style="color:#94a3b8;padding:15px;text-align:center;font-size:12.5px;">Mos xodim topilmadi</div>';
        return;
    }

    filtered.forEach(emp => {
        const div = document.createElement('div');
        div.className = 'pu74-emp-item';
        div.innerHTML = `
            <div style="width: 32px; height: 32px; min-width: 32px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center; border: 1px solid #dbeafe;">
                <i class="fas fa-user-tie" style="color: #2563eb; font-size: 13px;"></i>
            </div>
            <div style="display: flex; flex-direction: column; text-align: left; overflow: hidden;">
                <span style="font-weight: 700; color: #1e293b; font-size: 13px; line-height: 1.2; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(emp.full_name)}</span>
                <span style="font-size: 11px; color: #64748b; margin-top: 3px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(emp.position || 'Xodim')}</span>
            </div>
        `;
        div.onclick = async () => {
            if (pu74ActiveTd) {
                const R = parseInt(pu74ActiveTd.getAttribute('data-r'));

                // 1. Set full name in B column cell
                const editKeyName = pu74ActiveSheet + '_' + R + '_1';
                pu74EditedCells[editKeyName] = emp.full_name;

                // 2. Automatically set Tabel number in Column T (index 19)
                const tabNum = emp.tabel_number || emp.id || '';
                const editKeyTab = pu74ActiveSheet + '_' + R + '_19';
                pu74EditedCells[editKeyTab] = String(tabNum);

                // 3. Clear any legacy manual edits in the SUM formula cell in Column S (index 18)
                const editKeyTabFormula = pu74ActiveSheet + '_' + R + '_18';
                if (pu74EditedCells[editKeyTabFormula] !== undefined) {
                    delete pu74EditedCells[editKeyTabFormula];
                }

                // 4. Avtomatik ravishda ushbu xodimning tabel soatlarini KESHDAN yuklash
                const hoursLoaded = await loadSingleWorkerTimesheetFast(emp.full_name, R);

                localStorage.setItem(getPU74LocalKey('pu74_edits'), JSON.stringify(pu74EditedCells));
                renderPU74Sheet(pu74ActiveSheet);

                if (hoursLoaded && window.SmartUtils) {
                    window.SmartUtils.showToast("Xodim soatlari avtomatik qo'yildi!", "success");
                } else if (window.SmartUtils) {
                    window.SmartUtils.showToast("Bu xodim uchun tabel topilmadi yoki soatlari yo'q.", "warning");
                }
            }
            closePU74EmpDropdown();
        };
        listContainer.appendChild(div);
    });
}

window.pu74CachedTimesheet = null;
window.pu74CachedTimesheetDB = [];
window.pu74TimesheetPromise = null;

function prefetchPU74Timesheet() {
    if (window.pu74TimesheetPromise) return window.pu74TimesheetPromise;

    const token = localStorage.getItem('jwtToken');
    let userBolinmaId = '';
    if (window.Auth && window.Auth.currentUser && window.Auth.currentUser.bolinmalar) {
        try {
            const arr = typeof window.Auth.currentUser.bolinmalar === 'string'
                ? JSON.parse(window.Auth.currentUser.bolinmalar)
                : window.Auth.currentUser.bolinmalar;
            if (Array.isArray(arr) && arr.length > 0) userBolinmaId = arr[0];
        } catch(e) {
            userBolinmaId = window.Auth.currentUser.bolinmalar;
        }
    }
    
    let targetBolinma = '';
    if (userBolinmaId) {
        const numMatch = String(userBolinmaId).match(/\d+/);
        if (numMatch) targetBolinma = `${numMatch[0]}-bo'linma`;
    }
    if (!targetBolinma) {
        const brigadeMatch = String(pu74CurrentFile || '1-brigada').match(/(\d+)/);
        const brigadeNum = brigadeMatch ? brigadeMatch[1] : '1';
        targetBolinma = `${brigadeNum}-bo'linma`;
    }

    let targetYear = new Date().getFullYear();
    let targetMonth = new Date().getMonth();
    
    if (pu74Workbook && pu74Workbook.SheetNames[0]) {
        const sheet0 = pu74Workbook.Sheets[pu74Workbook.SheetNames[0]];
        const dateVal = sheet0['K8']?.v || sheet0['K10']?.v;
        if (dateVal) {
            const cleanDate = String(dateVal).trim();
            if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const parts = cleanDate.split('-');
                targetYear = parseInt(parts[0]);
                targetMonth = parseInt(parts[1]) - 1;
            } else {
                const dotMatch = cleanDate.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                if (dotMatch) {
                    targetYear = parseInt(dotMatch[3]);
                    targetMonth = parseInt(dotMatch[2]) - 1;
                } else {
                    const monthYearMatch = cleanDate.match(/(\d{2})\.(\d{4})/);
                    if (monthYearMatch) {
                        targetYear = parseInt(monthYearMatch[2]);
                        targetMonth = parseInt(monthYearMatch[1]) - 1;
                    }
                }
            }
        }
    }

    window.pu74TimesheetPromise = fetch(`/api/timesheet/${targetYear}/${targetMonth}?bolinma_id=${encodeURIComponent(targetBolinma)}`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    }).then(res => res.json()).then(savedData => {
        if (!savedData || Object.keys(savedData).length === 0) return false;

        window.pu74CachedTimesheet = savedData;
        const dbEmployees = [];
        const empKeys = Object.keys(savedData).filter(k => k.endsWith('_full_name'));
        empKeys.forEach(k => {
            dbEmployees.push({ id: k.split('_')[0], fullName: savedData[k] });
        });
        window.pu74CachedTimesheetDB = dbEmployees;
        return true;
    }).catch(err => {
        console.error("Error prefetching timesheet:", err);
        window.pu74TimesheetPromise = null;
        return false;
    });

    return window.pu74TimesheetPromise;
}

async function loadSingleWorkerTimesheetFast(employeeName, R) {
    if (!window.pu74CachedTimesheet) {
        if (window.SmartUtils) window.SmartUtils.showToast("Tabel soatlari yuklanmoqda, kuting...", "info");
        await prefetchPU74Timesheet();
    }

    if (!window.pu74CachedTimesheet || window.pu74CachedTimesheetDB.length === 0) {
        return false;
    }

    const matchedEmp = window.pu74CachedTimesheetDB.find(e => fuzzyMatchName(employeeName, e.fullName));
    if (!matchedEmp) return false;

    const timesheetEmpId = matchedEmp.id;
    let hasHours = false;
    const savedData = window.pu74CachedTimesheet;

    // 1-15 kunlar (qator R)
    for (let day = 1; day <= 15; day++) {
        const hrVal = savedData[`${timesheetEmpId}_${day}`];
        if (hrVal !== undefined && hrVal !== null && String(hrVal).trim() !== '') {
            pu74EditedCells[pu74ActiveSheet + '_' + R + '_' + (1 + day)] = String(hrVal);
            hasHours = true;
        } else {
            pu74EditedCells[pu74ActiveSheet + '_' + R + '_' + (1 + day)] = '';
        }
    }

    // 16-31 kunlar (qator R+1)
    for (let day = 16; day <= 31; day++) {
        const hrVal = savedData[`${timesheetEmpId}_${day}`];
        if (hrVal !== undefined && hrVal !== null && String(hrVal).trim() !== '') {
            pu74EditedCells[pu74ActiveSheet + '_' + (R + 1) + '_' + (day - 14)] = String(hrVal);
            hasHours = true;
        } else {
            pu74EditedCells[pu74ActiveSheet + '_' + (R + 1) + '_' + (day - 14)] = '';
        }
    }

    return hasHours;
}

// Window bindings for float components
window.initPU74Autocomplete = initPU74Autocomplete;
window.showPU74EmpDropdown = showPU74EmpDropdown;
window.closePU74EmpDropdown = closePU74EmpDropdown;
window.renderPU74EmpList = renderPU74EmpList;

// ==========================================
// 13. AUTOMATIC HOURS LOADER FROM TIMESHEET (TABEL)
// ==========================================
function loadHoursFromTimesheet() {
    const token = localStorage.getItem('jwtToken');
    
    // 1. Resolve subdivision from current user's profile
    let userBolinmaId = '';
    if (window.Auth?.currentUser?.bolinmalar) {
        try {
            const arr = typeof window.Auth.currentUser.bolinmalar === 'string'
                ? JSON.parse(window.Auth.currentUser.bolinmalar)
                : window.Auth.currentUser.bolinmalar;
            if (Array.isArray(arr) && arr.length > 0) {
                userBolinmaId = arr[0];
            }
        } catch(e) {
            userBolinmaId = window.Auth.currentUser.bolinmalar;
        }
    }
    
    // 2. Normalize to "X-bo'linma"
    let targetBolinma = '';
    if (userBolinmaId) {
        const numMatch = String(userBolinmaId).match(/\d+/);
        if (numMatch) {
            targetBolinma = `${numMatch[0]}-bo'linma`;
        }
    }
    
    // 3. Fallback to brigade filename if subdivision user is not set (e.g., department user / admin)
    if (!targetBolinma) {
        const brigadeMatch = String(pu74CurrentFile || '1-brigada').match(/(\d+)/);
        const brigadeNum = brigadeMatch ? brigadeMatch[1] : '1';
        targetBolinma = `${brigadeNum}-bo'linma`;
    }

    // Determine target year and month
    let targetYear = new Date().getFullYear();
    let targetMonth = new Date().getMonth(); // 0-indexed
    
    const sheet0 = pu74Workbook.Sheets[pu74Workbook.SheetNames[0]];
    const dateVal = sheet0['K8']?.v || sheet0['K10']?.v;
    if (dateVal) {
        const cleanDate = String(dateVal).trim();
        if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const parts = cleanDate.split('-');
            targetYear = parseInt(parts[0]);
            targetMonth = parseInt(parts[1]) - 1;
        } else {
            const dotMatch = cleanDate.match(/(\d{2})\.(\d{2})\.(\d{4})/);
            if (dotMatch) {
                targetYear = parseInt(dotMatch[3]);
                targetMonth = parseInt(dotMatch[2]) - 1;
            } else {
                const monthYearMatch = cleanDate.match(/(\d{2})\.(\d{4})/);
                if (monthYearMatch) {
                    targetYear = parseInt(monthYearMatch[2]);
                    targetMonth = parseInt(monthYearMatch[1]) - 1;
                }
            }
        }
    }

    if (window.SmartUtils) {
        window.SmartUtils.showToast("Tabeldan ish soatlari yuklanmoqda...", "info");
    } else {
        alert("Tabeldan ish soatlari yuklanmoqda...");
    }

    fetch(`/api/timesheet/${targetYear}/${targetMonth}?bolinma_id=${encodeURIComponent(targetBolinma)}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    })
        .then(res => res.json())
        .then(savedData => {
            if (!savedData || Object.keys(savedData).length === 0) {
                const msg = "Ushbu oy uchun to'ldirilgan tabel topilmadi!";
                if (window.SmartUtils) window.SmartUtils.showToast(msg, "warning");
                else alert(msg);
                return;
            }

            // Extract all employees from the timesheet data
            const dbEmployees = [];
            const empKeys = Object.keys(savedData).filter(k => k.endsWith('_full_name'));
            empKeys.forEach(k => {
                const empId = k.split('_')[0];
                const fullName = savedData[k];
                dbEmployees.push({ id: empId, fullName: fullName });
            });

            if (dbEmployees.length === 0) {
                const msg = "Tabelda xodimlar ma'lumotlari topilmadi!";
                if (window.SmartUtils) window.SmartUtils.showToast(msg, "warning");
                else alert(msg);
                return;
            }

            // Iterate over active sheet rows
            const sn = pu74Workbook.SheetNames[pu74ActiveSheet];
            const sheet = pu74Workbook.Sheets[sn];
            if (!sheet || !sheet['!ref']) return;
            const range = XLSX.utils.decode_range(sheet['!ref']);

            // Dynamically detect where worker 1 starts in Column A (index 0)
            let startR = 10; // Default fallback
            for (let r = range.s.r; r <= range.e.r; r++) {
                const cellRef = XLSX.utils.encode_cell({ c: 0, r: r });
                const val = sheet[cellRef]?.v;
                if (val === 1 || String(val).trim() === '1') {
                    startR = r;
                    break;
                }
            }

            // Dynamically detect the row step per worker (2 rows vs 3 rows)
            let step = 2; // Default fallback
            const nextWorkerCellRef = XLSX.utils.encode_cell({ c: 0, r: startR + 2 });
            const nextVal = sheet[nextWorkerCellRef]?.v;
            if (nextVal === 2 || String(nextVal).trim() === '2') {
                step = 2;
            } else {
                const altCellRef = XLSX.utils.encode_cell({ c: 0, r: startR + 3 });
                const altVal = sheet[altCellRef]?.v;
                if (altVal === 2 || String(altVal).trim() === '2') {
                    step = 3;
                }
            }

            let matchCount = 0;

            // Loop through worker rows using the dynamically calculated step
            for (let R = startR; R <= range.e.r; R += step) {
                // Name is in Column B (index 1) of row R
                const nameCellRef = XLSX.utils.encode_cell({ c: 1, r: R });
                const nameVal = sheet[nameCellRef]?.v;
                if (!nameVal) continue;

                // Find matching employee in dbEmployees
                const matchedEmp = dbEmployees.find(emp => fuzzyMatchName(nameVal, emp.fullName));
                if (matchedEmp) {
                    matchCount++;
                    const empId = matchedEmp.id;

                    // Clean up any stale empty-string hour edits from previous imports
                    // This ensures original template values (like 8) are not overridden by ''
                    for (let c = 2; c <= 17; c++) {
                        const keyR0 = pu74ActiveSheet + '_' + R + '_' + c;
                        const keyR1 = pu74ActiveSheet + '_' + (R + 1) + '_' + c;
                        if (pu74EditedCells[keyR0] !== undefined && String(pu74EditedCells[keyR0]).trim() === '') {
                            delete pu74EditedCells[keyR0];
                        }
                        if (pu74EditedCells[keyR1] !== undefined && String(pu74EditedCells[keyR1]).trim() === '') {
                            delete pu74EditedCells[keyR1];
                        }
                    }

                    // Write hours for days 1 to 15 on row R (columns 2 to 16)
                    for (let day = 1; day <= 15; day++) {
                        const hrVal = savedData[`${empId}_${day}`];
                        if (hrVal !== undefined && hrVal !== null && String(hrVal).trim() !== '') {
                            const editKey = pu74ActiveSheet + '_' + R + '_' + (1 + day);
                            pu74EditedCells[editKey] = String(hrVal);
                        }
                    }

                    // Write hours for days 16 to 31 on row R+1 (columns 2 to 17)
                    for (let day = 16; day <= 31; day++) {
                        const hrVal = savedData[`${empId}_${day}`];
                        if (hrVal !== undefined && hrVal !== null && String(hrVal).trim() !== '') {
                            const editKey = pu74ActiveSheet + '_' + (R + 1) + '_' + (day - 14);
                            pu74EditedCells[editKey] = String(hrVal);
                        }
                    }

                    // Write Tabel Number on row R at column T (index 19)
                    // Lookup the official corporate tabel number from loaded employees array
                    const officialEmp = pu74Employees.find(e => String(e.id) === String(empId));
                    const tabNumVal = officialEmp ? (officialEmp.tabel_number || officialEmp.id) : (savedData[`${empId}_tabel_raqami`] || empId || '');
                    const editKeyTab = pu74ActiveSheet + '_' + R + '_19';
                    pu74EditedCells[editKeyTab] = String(tabNumVal);
                }
            }

            // Clean up any accidentally overwritten formulas in Column S (index 18)
            Object.keys(pu74EditedCells).forEach(key => {
                if (key.endsWith('_18')) {
                    delete pu74EditedCells[key];
                }
            });

            if (matchCount > 0) {
                // Save to localStorage
                localStorage.setItem(getPU74LocalKey('pu74_edits'), JSON.stringify(pu74EditedCells));
                
                // Rerender sheet and recalculate formulas
                renderPU74Sheet(pu74ActiveSheet);
                recalcAllFormulas();

                const msg = `${matchCount} ta xodimning tabel soatlari avtomatik yuklandi!`;
                if (window.SmartUtils) window.SmartUtils.showToast(msg, "success");
                else alert(msg);
            } else {
                const msg = "Jadvaldagi birorta xodim tabel bilan mos kelmadi!";
                if (window.SmartUtils) window.SmartUtils.showToast(msg, "warning");
                else alert(msg);
            }
        })
        .catch(err => {
            console.error("Error loading hours from timesheet:", err);
            const msg = "Tabelni yuklashda xatolik yuz berdi!";
            if (window.SmartUtils) window.SmartUtils.showToast(msg, "error");
            else alert(msg);
        });
}

function fuzzyMatchName(sheetName, dbName) {
    if (!sheetName || !dbName) return false;
    const clean = (s) => s.toLowerCase()
        .replace(/[^a-zа-яёo'‘`ʻ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
    const sName = clean(sheetName);
    const dName = clean(dbName.split('(')[0]);
    
    if (sName === dName) return true;
    
    const sParts = sName.split(' ');
    const dParts = dName.split(' ');
    
    if (sParts.length > 0 && dParts.length > 0) {
        if (sParts[0] === dParts[0]) {
            if (sParts[1] && dParts[1] && sParts[1][0] === dParts[1][0]) {
                return true;
            }
            if (sParts.length === 1) return true;
        }
    }
    
    if (sName.includes(dName) || dName.includes(sName)) return true;
    return false;
}

window.loadHoursFromTimesheet = loadHoursFromTimesheet;

// ==========================================
// NORMS BOOK INTEGRATION
// ==========================================

let pu74Warnings = [];

window.fetchPU74Warnings = async function() {
    try {
        let yearMonth = '';
        const match = window.location.href.match(/(\d{4}-\d{2})/);
        if (match) yearMonth = match[1];
        else {
            const ymMatch = String(pu74CurrentFile).match(/_(\d{4})_(\d{2})/);
            if (ymMatch) yearMonth = ymMatch[1] + '-' + ymMatch[2];
        }
        
        let bolinma = window.Auth?.currentUser?.subdivision || '';
        if (!bolinma) {
            const brigadeMatch = String(pu74CurrentFile || '1-brigada').match(/(\d+)/);
            const brigadeNum = brigadeMatch ? brigadeMatch[1] : '1';
            bolinma = `${brigadeNum}-bo'linma`;
        }

        const res = await fetch(`/api/infrastructure/warnings?bolinma_id=${encodeURIComponent(bolinma)}`);
        const data = await res.json();
        
        // Filter warnings for the current month
        if (yearMonth) {
            pu74Warnings = data.filter(w => (w.start_date && w.start_date.startsWith(yearMonth)) || (w.end_date && w.end_date.startsWith(yearMonth)));
        } else {
            pu74Warnings = data;
        }
        
        const testDate = yearMonth ? yearMonth + '-01' : '2026-07-01';
        pu74Warnings.push({
            title: "Dispetcher nazorati (TEST)",
            message: "Dispetcherga yuborgan (yoki u yerdan kelgan) ma'lumotlar xuddi shunday formatda ko'rinadi. Bu vizual tekshirish uchun maxsus qo'shildi.",
            start_date: testDate,
            type: "speed_limit",
            km: "15",
            pk: "4"
        });
        console.log("Loaded warnings for PU-74:", pu74Warnings);

    } catch(e) {
        console.error("Error fetching warnings:", e);
    }
};

window.onPU74CellClick = function(td) {
    if (!td) return;
    const isCoverPage = td.closest('.pu74-cover-page') !== null;
    if (isCoverPage) return;

    const R = parseInt(td.getAttribute('data-r'));
    const C = parseInt(td.getAttribute('data-c'));
    const si = pu74ActiveSheet;

    // ===== KUN (SANA) SARLAVHASIGA BOSILGANDA OGOHLANTIRISHLARNI KO'RSATISH O'CHIRILDI =====
    // Buning o'rniga hover (sichqoncha oborilganda) tooltip chiqadigan qilindi.

    const isDept = window.Auth && window.Auth.currentUser && window.Auth.currentUser.role === 'department';
    if (isDept) return;

    // Determine sheet type by name
    const sheetName = (pu74Workbook && pu74Workbook.SheetNames[si]) ? pu74Workbook.SheetNames[si].toLowerCase() : '';
    const is45Bet = sheetName.includes('4') || sheetName.includes('5') || si === 2;
    const is23Bet = sheetName.includes('2') || sheetName.includes('3') || si === 1;

    // ===== TABELDAN TASHQARI BARCHA BETLARDA Наименование bosilganda normalar kitobi ochiladi =====
    if (!is23Bet && C === 2 && td.getAttribute('contenteditable') === 'true') {
        const text = td.innerText.trim().toLowerCase();
        // Sarlavha katagini istisno qilish (modal ochilmaydi)
        if (text.includes('наименование') || text.includes('наимование') || text.includes('механизм')) {
            return;
        }
        openPU74NormsModal(R);
        return;
    }

    // ===== 2-3 BETLAR: Xodimlar tabeli — bu yerda hech qanday modal ochilmaydi =====
    // F.I.O. tanlash alohida event listener orqali ishlaydi (renderPU74Sheet ichida)
    // Boshqa hech narsa to'smaydi — kataklar erkin tahrirlanadi
};

function checkPU74WarningForDay(R, C, dayNumArg) {
    try {
        if (!pu74Warnings) pu74Warnings = [];

        let dayNum = dayNumArg;
        if (dayNum === undefined) {
            dayNum = C - 6;
            const sn = pu74Workbook.SheetNames[pu74ActiveSheet] || '';
            if (sn.includes('4-5') || sn.includes('16-31')) {
                dayNum += 15;
            }
        }

        let yearMonth = '';
        const match = window.location.href.match(/(\d{4}-\d{2})/);
        if (match) {
            yearMonth = match[1];
        } else {
            const ymMatch = String(typeof pu74CurrentFile !== 'undefined' ? pu74CurrentFile : '').match(/_(\d{4})_(\d{2})/);
            if (ymMatch) yearMonth = ymMatch[1] + '-' + ymMatch[2];
        }
        
        // Fallback joriy oyga
        if (!yearMonth) {
            const d = new Date();
            yearMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        }

        const dayStr = String(dayNum).padStart(2, '0');
        const targetDate = `${yearMonth}-${dayStr}`;

        const activeWarnings = pu74Warnings.filter(w => {
            if (!w || !w.start_date) return false;
            const start = String(w.start_date).substring(0, 10);
            const end = w.end_date ? String(w.end_date).substring(0, 10) : start;
            return targetDate >= start && targetDate <= end;
        });

        // Modalni har doim ochamiz, foydalanuvchi ishlaganini ko'rishi uchun
        openPU74WarningsModal(activeWarnings, R, targetDate);
    } catch(err) {
        console.error("Xatolik: ", err);
        if (window.SmartUtils) window.SmartUtils.showToast("Xatolik yuz berdi: " + err.message, "error");
    }
}

let activePU74WarningRow = -1;

function openPU74WarningsModal(warnings, R, targetDate) {
    activePU74WarningRow = R;
    let modal = document.getElementById('pu74-warnings-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu74-warnings-modal';
        modal.className = 'active';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.8); z-index:99999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';

    let html = `
        <div style="background:white; width:90%; max-width:600px; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); display:flex; flex-direction:column; max-height:90vh;">
            <div style="padding:20px; border-bottom:1px solid #fee2e2; display:flex; justify-content:space-between; align-items:center; background:#fef2f2; border-radius:12px 12px 0 0;">
                <h3 style="margin:0; font-size:18px; color:#991b1b;"><i class="fas fa-exclamation-triangle" style="color:#ef4444; margin-right:8px;"></i> ОГРАНИЧЕНИЯ И ПРЕДУПРЕЖДЕНИЯ (${targetDate})</h3>
                <button onclick="closePU74WarningsModal()" style="background:none; border:none; font-size:24px; cursor:pointer; color:#ef4444;">&times;</button>
            </div>
            <div style="overflow-y:auto; flex:1; padding:20px;">
    `;

    if (warnings.length === 0) {
        html += `
            <div style="padding: 30px; text-align: center; color: #64748b;">
                <i class="fas fa-check-circle" style="font-size: 40px; color: #10b981; margin-bottom: 15px;"></i>
                <h4 style="margin:0 0 10px 0; color: #1e293b; font-size: 18px;">Ограничений нет</h4>
                <p style="margin:0; font-size: 14px;">На выбранную дату предупреждений или закрытий перегонов не найдено.</p>
            </div>
        `;
    } else {
        warnings.forEach(w => {
            let typeBadge = w.type === 'speed_limit' ? `<span style="background:#fef3c7; color:#d97706; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:bold;">Ограничение скорости: ${w.speed_limit} км/ч</span>` :
                            `<span style="background:#e0e7ff; color:#4338ca; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:bold;">Окно (Временное закрытие)</span>`;
            
            let fillButton = '';
            if (R >= 4) { // Faqat ma'lumotlar qatoridan ochilsa to'ldirish tugmasi chiqadi
                fillButton = `<button onclick="applyPU74WarningToRow('${w.title.replace(/'/g, "\\'")}')" style="background:#ef4444; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:bold; width:100%;"><i class="fas fa-check"></i> Заполнить работу на основе предупреждения</button>`;
            }

            html += `
                <div style="padding:15px; border:1px solid #fecaca; margin-bottom:15px; border-radius:8px; background:#fffcfc;">
                    <div style="margin-bottom:10px;">${typeBadge}</div>
                    <h4 style="margin:0 0 5px 0; color:#1e293b;">${escapeHtml(w.title)}</h4>
                    <p style="margin:0 0 10px 0; font-size:14px; color:#475569; line-height:1.5;">${escapeHtml(w.message)}</p>
                    <div style="font-size:12px; color:#64748b; margin-bottom:10px;">
                        <i class="fas fa-map-marker-alt"></i> КМ: <b>${w.km || '-'}</b> | ПК: <b>${w.pk || '-'}</b>
                    </div>
                    ${fillButton}
                </div>
            `;
        });
    }

    html += `
            </div>
        </div>
    `;
    modal.innerHTML = html;
    modal.style.display = 'flex';
}

window.closePU74WarningsModal = function() {
    const modal = document.getElementById('pu74-warnings-modal');
    if (modal) modal.style.display = 'none';
};

window.applyPU74WarningToRow = function(title) {
    try {
        const R = activePU74WarningRow;
        if (R === -1) return;
        
        closePU74WarningsModal();
        const key2 = pu74ActiveSheet + '_' + R + '_2';
        
        pu74EditedCells[key2] = title;
        if (typeof pu74CurrentFile !== 'undefined') {
            localStorage.setItem(getPU74LocalKey('pu74_edits'), JSON.stringify(pu74EditedCells));
        }

        setTimeout(() => {
            renderPU74Sheet(pu74ActiveSheet);
            if (window.SmartUtils) window.SmartUtils.showToast('Работа заполнена!', 'success');
        }, 50);
    } catch(e) {
        console.error(e);
        closePU74WarningsModal();
    }
};

let activePU74NormRow = -1;

function openPU74NormsModal(R) {
    activePU74NormRow = R;
    let modal = document.getElementById('pu74-norms-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu74-norms-modal';
        modal.className = 'active';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.8); z-index:99999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
        
        const normsCount = (window.PU74_NORMS_DB || []).length;
        modal.innerHTML = `
            <div style="background:white; width:90%; max-width:900px; border-radius:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); display:flex; flex-direction:column; max-height:90vh;">
                <div style="padding:20px 24px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, #f8fafc, #eef2ff); border-radius:16px 16px 0 0;">
                    <div>
                        <h3 style="margin:0; font-size:18px; color:#0f172a; font-weight:800;"><i class="fas fa-book-open" style="color:#3b82f6; margin-right:8px;"></i> ТИПОВЫЕ НОРМЫ ВРЕМЕНИ (2013)</h3>
                        <p style="margin:4px 0 0; font-size:12px; color:#64748b; font-weight:500;">
                            <i class="fas fa-database"></i> Jami ${normsCount} ta ish turi • § 1 — § 78 • <span style="color:#059669; font-weight:700;">Tanlang — avtomatik to'ldiriladi</span>
                        </p>
                    </div>
                    <button onclick="closePU74NormsModal()" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#fee2e2';this.style.color='#ef4444'" onmouseout="this.style.background='none';this.style.color='#64748b'">&times;</button>
                </div>
                <div style="padding:12px 24px; background:#f1f5f9; border-bottom:1px solid #e2e8f0;">
                    <input type="text" id="pu74-norms-search" placeholder="🔍 Qidirish: ish nomi, § raqami, o'lchov birligi..." style="width:100%; padding:12px 18px; border:2px solid #cbd5e1; border-radius:12px; font-size:15px; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#cbd5e1'">
                </div>
                <div id="pu74-norms-list" style="overflow-y:auto; flex:1; padding:12px 20px;">
                </div>
                <div style="padding:10px 24px; border-top:1px solid #e2e8f0; background:#f8fafc; border-radius:0 0 16px 16px; text-align:center;">
                    <span style="font-size:11px; color:#94a3b8;"><i class="fas fa-info-circle"></i> Tanlangan ish turi — nomi, o'lchov birligi, § raqami, norma vaqti, razryad va ЭШП normasi avtomatik yoziladi</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('pu74-norms-search').addEventListener('input', function(e) {
            renderPU74NormsList(e.target.value);
        });
    }
    
    modal.style.display = 'flex';
    document.getElementById('pu74-norms-search').value = '';
    renderPU74NormsList();
    setTimeout(() => document.getElementById('pu74-norms-search').focus(), 100);
}

window.closePU74NormsModal = function() {
    const modal = document.getElementById('pu74-norms-modal');
    if (modal) modal.style.display = 'none';
};

function renderPU74NormsList(filterText = '') {
    const listDiv = document.getElementById('pu74-norms-list');
    if (!listDiv) return;
    
    if (!window.PU74_NORMS_DB || window.PU74_NORMS_DB.length === 0) {
        listDiv.innerHTML = '<div style="padding:20px; text-align:center; color:#64748b;">База норм пуста или не загружена.</div>';
        return;
    }

    const ft = filterText.toLowerCase();
    const filtered = window.PU74_NORMS_DB.filter(n => 
        n.name.toLowerCase().includes(ft) || 
        n.paragraph.toLowerCase().includes(ft) ||
        (n.unit && n.unit.toLowerCase().includes(ft))
    );

    if (filtered.length === 0) {
        listDiv.innerHTML = '<div style="padding:20px; text-align:center; color:#64748b;">Ничего не найдено.</div>';
        return;
    }

    // Natijalar sonini ko'rsatish
    let html = `<div style="padding:6px 12px; font-size:12px; color:#94a3b8; font-weight:600; border-bottom:1px solid #f1f5f9; margin-bottom:8px;">
        <i class="fas fa-list"></i> ${filtered.length} ta natija topildi (jami: ${window.PU74_NORMS_DB.length})
    </div>`;

    filtered.forEach(n => {
        const gradeColor = n.grade >= 4 ? '#ef4444' : n.grade >= 3 ? '#f59e0b' : '#10b981';
        const hasMachine = n.machineNorm !== undefined && n.machineNorm !== null;
        
        html += `
            <div onclick="selectPU74Norm('${n.id}')" style="padding:14px 16px; border:1px solid #e2e8f0; margin-bottom:8px; border-radius:10px; cursor:pointer; transition:all 0.2s; background:white; border-left:4px solid ${gradeColor};" onmouseover="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 4px 12px -2px rgba(59,130,246,0.15)'; this.style.transform='translateX(4px)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'; this.style.transform='none'; this.style.borderLeftColor='${gradeColor}';">
                <div style="font-weight:700; color:#1e293b; font-size:13.5px; margin-bottom:8px; line-height:1.4;">${escapeHtml(n.name)}</div>
                <div style="display:flex; flex-wrap:wrap; gap:8px; font-size:11.5px; color:#64748b;">
                    <span style="background:#f1f5f9; padding:3px 8px; border-radius:6px; font-weight:600;">
                        <i class="fas fa-hashtag" style="color:#3b82f6;"></i> ${n.paragraph}
                    </span>
                    <span style="background:#f1f5f9; padding:3px 8px; border-radius:6px; font-weight:600;">
                        <i class="fas fa-ruler-combined" style="color:#8b5cf6;"></i> ${n.qty || ''} ${n.unit}
                    </span>
                    <span style="background:#ecfdf5; padding:3px 8px; border-radius:6px; font-weight:700; color:#059669;">
                        <i class="fas fa-clock"></i> ${n.norm} чел/час
                    </span>
                    <span style="background:${gradeColor}15; padding:3px 8px; border-radius:6px; font-weight:700; color:${gradeColor};">
                        <i class="fas fa-layer-group"></i> Разряд: ${n.grade || '-'}
                    </span>
                    ${hasMachine ? `<span style="background:#dbeafe; padding:3px 8px; border-radius:6px; font-weight:700; color:#2563eb;">
                        <i class="fas fa-cog"></i> ЭШП: ${n.machineNorm}
                    </span>` : ''}
                </div>
            </div>
        `;
    });
    listDiv.innerHTML = html;
}

window.selectPU74Norm = function(id) {
    try {
        if (!window.PU74_NORMS_DB) return;
        const norm = window.PU74_NORMS_DB.find(n => n.id === id);
        if (!norm) return;

        const R = activePU74NormRow;
        if (R === -1) return;

        console.log("[PU74] Applying norm:", norm, "to row:", R);

        // Close modal immediately so UI doesn't freeze
        closePU74NormsModal();

        const si = pu74ActiveSheet;
        const sheet = pu74Workbook ? pu74Workbook.Sheets[pu74Workbook.SheetNames[si]] : null;

        // ============ USTUNLARGA AVTOMATIK TO'LDIRISH ============
        // C=2: Наименование (ish nomi)
        const key2 = si + '_' + R + '_2';
        pu74EditedCells[key2] = norm.name;
        if (sheet) {
            const ref2 = XLSX.utils.encode_cell({ c: 2, r: R });
            if (!sheet[ref2]) sheet[ref2] = { t: 's' };
            sheet[ref2].v = norm.name;
            sheet[ref2].w = norm.name;
        }

        // C=3: Единица измерения (o'lchov birligi — miqdor + birlik)
        const key3 = si + '_' + R + '_3';
        const unitStr = (norm.qty ? norm.qty + ' ' : '') + norm.unit;
        pu74EditedCells[key3] = unitStr;
        if (sheet) {
            const ref3 = XLSX.utils.encode_cell({ c: 3, r: R });
            if (!sheet[ref3]) sheet[ref3] = { t: 's' };
            sheet[ref3].v = unitStr;
            sheet[ref3].w = unitStr;
        }

        // C=4: § paragraf va norma vaqti
        const key4 = si + '_' + R + '_4';
        const normInfo = norm.paragraph + '\nНорма: ' + norm.norm + ' чел/час';
        pu74EditedCells[key4] = normInfo;
        if (sheet) {
            const ref4 = XLSX.utils.encode_cell({ c: 4, r: R });
            if (!sheet[ref4]) sheet[ref4] = { t: 's' };
            sheet[ref4].v = normInfo;
            sheet[ref4].w = normInfo;
        }

        // C=5: Norma vaqti (raqam sifatida — formulalar uchun)
        const key5 = si + '_' + R + '_5';
        pu74EditedCells[key5] = String(norm.norm);
        if (sheet) {
            const ref5 = XLSX.utils.encode_cell({ c: 5, r: R });
            if (!sheet[ref5]) sheet[ref5] = { t: 'n' };
            sheet[ref5].v = norm.norm;
            sheet[ref5].w = String(norm.norm);
        }

        // C=6 yoki tegishli ustun: Tarif razryadi (agar mavjud bo'lsa)
        if (norm.grade) {
            const key6 = si + '_' + R + '_6';
            pu74EditedCells[key6] = String(norm.grade);
            if (sheet) {
                const ref6 = XLSX.utils.encode_cell({ c: 6, r: R });
                if (!sheet[ref6]) sheet[ref6] = { t: 'n' };
                sheet[ref6].v = norm.grade;
                sheet[ref6].w = String(norm.grade);
            }
        }

        // ЭШП normasi (agar mavjud bo'lsa) — keyingi mavjud ustun
        if (norm.machineNorm !== undefined && norm.machineNorm !== null) {
            const key7 = si + '_' + R + '_7';
            pu74EditedCells[key7] = String(norm.machineNorm);
            if (sheet) {
                const ref7 = XLSX.utils.encode_cell({ c: 7, r: R });
                if (!sheet[ref7]) sheet[ref7] = { t: 'n' };
                sheet[ref7].v = norm.machineNorm;
                sheet[ref7].w = String(norm.machineNorm);
            }
        }

        // Save to local storage
        if (typeof pu74CurrentFile !== 'undefined') {
            localStorage.setItem(getPU74LocalKey('pu74_edits'), JSON.stringify(pu74EditedCells));
        }

        // Re-render in timeout to prevent UI blocking
        setTimeout(() => {
            renderPU74Sheet(pu74ActiveSheet);
            // Formulalarni qayta hisoblash — yangi kiritilgan qiymatlar ta'sir qilishi uchun
            if (window.recalcAllFormulas) window.recalcAllFormulas(true);
            if (window.SmartUtils) {
                const msg = `✅ ${norm.paragraph} — ${norm.name.substring(0, 40)}... qo'llandi!`;
                window.SmartUtils.showToast(msg, 'success');
            }
        }, 50);
    } catch(e) {
        console.error("[PU74] Error applying norm:", e);
        closePU74NormsModal();
    }
};

// Tooltip functionality for PU-74 Date Headers
window.showPU74WarningTooltip = function(td, dayNum) {
    if (!pu74Warnings) return;

    let yearMonth = '';
    const match = window.location.href.match(/(\d{4}-\d{2})/);
    if (match) {
        yearMonth = match[1];
    } else {
        const ymMatch = String(typeof pu74CurrentFile !== 'undefined' ? pu74CurrentFile : '').match(/_(\d{4})_(\d{2})/);
        if (ymMatch) yearMonth = ymMatch[1] + '-' + ymMatch[2];
    }
    
    if (!yearMonth) {
        const d = new Date();
        yearMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    }

    const targetDate = `${yearMonth}-${String(dayNum).padStart(2, '0')}`;
    let activeWarnings = [];
    
    let bolinma = window.Auth?.currentUser?.subdivision || '';
    if (!bolinma) {
        const brigadeMatch = String(typeof pu74CurrentFile !== 'undefined' ? pu74CurrentFile : '1-brigada').match(/(\d+)/);
        const brigadeNum = brigadeMatch ? brigadeMatch[1] : '1';
        bolinma = brigadeNum + "-bo'linma";
    }

    let reports = window.subdivisionReports || {};
    
    // As a fallback, load from localStorage if not available in memory
    if (Object.keys(reports).length === 0) {
        try {
            const history = JSON.parse(localStorage.getItem('subdivisionReportsHistory')) || {};
            for (let b in history) {
                const dates = Object.keys(history[b]).sort().reverse();
                if (dates.length > 0) {
                    reports[b] = history[b][dates[0]];
                }
            }
        } catch(e) {}
    }

    let bolinmaKey = bolinma;
    if (reports && !reports[bolinma]) {
        let num = bolinma.replace("-bo'linma", "");
        if (reports[num]) bolinmaKey = num;
        else if (reports[num + "-bo'linma"]) bolinmaKey = num + "-bo'linma";
    }

    if (reports && reports[bolinmaKey]) {
        const rep = reports[bolinmaKey];
        const sd = rep.structuredData;
        if (sd && sd.generalWarnRows) {
            sd.generalWarnRows.forEach(gw => {
                activeWarnings.push({
                    title: 'Tezlikni cheklash: ' + (gw.speed || '') + ' km/s',
                    message: 'Sabab: ' + (gw.reason || '') + ' | ' + (gw.station || '') + ' | KM: ' + (gw.km || ''),
                    time: gw.time || '',
                    start_date: targetDate, // Setting start_date to targetDate ensures it gets displayed for the hovered cell
                    type: 'speed_limit'
                });
            });
        }
    }
    try {
        let draftData = null;
        
        // Hozirgi ochiq turgan bo'linma raqamini aniqlaymiz (masalan, "1-bo'linma" dan "1" ni ajratamiz)
        const currentBolinmaNum = bolinmaKey.match(/\d+/) ? bolinmaKey.match(/\d+/)[0] : '1';
        const expectedDraftPrefix = 'dispatcher_draft_bolinma' + currentBolinmaNum + '_';
        const globalDraftPrefix = 'dispatcher_draft_global_';
        
        // Faqat hozirgi bo'linmaga tegishli (yoki global) draftlarni va hoveredilingan sanani qidiramiz
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if ((key.startsWith(expectedDraftPrefix) || key.startsWith(globalDraftPrefix)) && key.endsWith(targetDate)) {
                draftData = JSON.parse(localStorage.getItem(key));
                break;
            }
        }
        
        if (draftData && draftData.generalWarnRows) {
            draftData.generalWarnRows.forEach(gw => {
                const exists = activeWarnings.some(w => w.message.includes(gw.reason) && w.title.includes(gw.speed));
                if (!exists) {
                    activeWarnings.push({
                        title: 'Tezlikni cheklash (Kiritilmoqda): ' + (gw.speed || '') + ' km/s',
                        message: 'Sabab: ' + (gw.reason || '') + ' | ' + (gw.station || '') + ' | KM: ' + (gw.km || ''),
                        time: gw.time || '',
                        start_date: targetDate,
                        type: 'speed_limit'
                    });
                }
            });
        }
    } catch(e) {}

    if (pu74Warnings && pu74Warnings.length > 0) {
        const filtered = pu74Warnings.filter(w => {
            if (!w || !w.start_date) return false;
            const start = String(w.start_date).substring(0, 10);
            const end = w.end_date ? String(w.end_date).substring(0, 10) : start;
            return targetDate >= start && targetDate <= end;
        });
        activeWarnings = activeWarnings.concat(filtered);
    }

    let tooltip = document.getElementById('pu74-custom-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'pu74-custom-tooltip';
        tooltip.style.cssText = 'position:fixed; background:#1e293b; color:white; padding:15px; border-radius:10px; font-size:13px; z-index:999999; box-shadow:0 10px 25px -5px rgba(0,0,0,0.5); pointer-events:none; max-width:320px; transition:opacity 0.2s, transform 0.2s; opacity:0; border: 1px solid #334155; transform: translate(-50%, -100%) scale(0.95);';
        document.body.appendChild(tooltip);
    }

    let html = `<div style="font-weight:bold; margin-bottom:12px; border-bottom:1px solid #334155; padding-bottom:8px; color:#94a3b8; display:flex; justify-content:space-between; align-items:center;">
        <span><i class="fas fa-calendar-day" style="margin-right:6px;"></i> ${targetDate}</span>
        <span style="background:${activeWarnings.length > 0 ? '#ef4444' : '#10b981'}; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${activeWarnings.length} ta</span>
    </div>`;
    
    if (activeWarnings.length === 0) {
        html += `<div style="text-align:center; padding: 10px 0; color: #94a3b8;">
            <i class="fas fa-check-circle" style="font-size: 24px; color: #10b981; margin-bottom: 8px; display:block;"></i>
            Ogohlantirishlar yo'q
        </div>`;
    } else {
        activeWarnings.forEach(w => {
            const color = w.type === 'speed_limit' ? '#fbbf24' : '#818cf8';
            const icon = w.type === 'speed_limit' ? 'fa-tachometer-alt' : 'fa-clock';
            let timeHtml = '';
            if (w.start_date && w.end_date && String(w.start_date).substring(0,10) !== String(w.end_date).substring(0,10)) {
                timeHtml = `<div style="color:#fbbf24; font-size:11px; font-weight:800; padding-left:22px; margin-bottom:4px;"><i class="fas fa-calendar-alt"></i> ${String(w.start_date).substring(0,10)} dan - ${String(w.end_date).substring(0,10)} gacha</div>`;
            } else if (w.time) {
                timeHtml = `<div style="color:#fbbf24; font-size:11px; font-weight:800; padding-left:22px; margin-bottom:4px;"><i class="fas fa-history"></i> Vaqti: ${w.time}</div>`;
            }
            
            html += `<div style="margin-bottom:12px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="margin-bottom:6px; display:flex; align-items:flex-start;">
                    <i class="fas ${icon}" style="color:${color}; margin-top:3px; margin-right:8px; width:14px;"></i> 
                    <b style="color:#f8fafc; line-height:1.3; font-size: 13px;">${escapeHtml(w.title)}</b>
                </div>
                ${timeHtml}
                <div style="font-size:12px; color:#cbd5e1; padding-left:22px; line-height:1.4;">${w.message.substring(0, 150)}${w.message.length > 150 ? '...' : ''}</div>
            </div>`;
        });
    }
    
    tooltip.innerHTML = html;
    
    const rect = td.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - 10) + 'px';
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translate(-50%, -100%) scale(1)';
};

window.hidePU74WarningTooltip = function() {
    const tooltip = document.getElementById('pu74-custom-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translate(-50%, -100%) scale(0.95)';
        setTimeout(() => { 
            if(tooltip.style.opacity === '0') {
                tooltip.style.left = '-9999px'; 
            }
        }, 200);
    }
};

// ==========================================
// E-IMZO SIGNATURE LOGIC
// ==========================================

window.renderPU74Signatures = function() {
    const footer = document.getElementById('pu74-signature-footer');
    if (!footer) return;

    const role = window.Auth?.currentUser?.role;
    // Faqat tegishli rollar imzolay oladi (master, engineer, department)
    if (!['master', 'engineer', 'department'].includes(role)) {
        footer.style.display = 'none';
        return;
    }

    footer.style.display = 'flex';
    footer.innerHTML = '';

    const pages = [
        { id: '1-bet', label: '1-betni tasdiqlash' },
        { id: '2-3 betlar', label: '2-3 betlarni tasdiqlash' },
        { id: '4-5 betlar', label: '4-5 betlarni tasdiqlash' }
    ];

    pages.forEach(page => {
        const isSigned = !!pu74Signatures[page.id];
        const btn = document.createElement('button');
        btn.className = 'pu74-toolbar-btn';
        
        if (isSigned) {
            btn.style.cssText = 'background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #34d399; cursor: not-allowed; opacity: 0.8; margin: 0 10px; padding: 10px 20px; border-radius: 8px;';
            btn.innerHTML = `<i class="fas fa-check-double"></i> ${page.id} (Tasdiqlangan)`;
            btn.disabled = true;
            btn.title = "Ushbu bet E-Imzo bilan tasdiqlangan va qulflangan.";
        } else {
            btn.style.cssText = 'background: linear-gradient(135deg, #1e3a8a, #2563eb); border: none; color: white; box-shadow: 0 4px 15px rgba(37,99,235,0.4); transition: 0.3s; margin: 0 10px; padding: 10px 20px; border-radius: 8px; cursor: pointer;';
            btn.innerHTML = `<i class="fas fa-file-signature"></i> ${page.label}`;
            btn.onclick = () => window.signWithEImzo(page.id);
            btn.onmouseover = () => { btn.style.transform = 'translateY(-2px)'; };
            btn.onmouseout = () => { btn.style.transform = 'translateY(0)'; };
        }
        
        footer.appendChild(btn);
    });
};

window.signWithEImzo = function(pageId) {
    if (confirm(`Siz rostdan ham ${pageId}ni elektron imzo bilan tasdiqlamoqchimisiz? Tasdiqlangandan so'ng, bu betdagi ma'lumotlarni o'zgartirib bo'lmaydi.`)) {
        // Mock E-Imzo flow
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'eimzo-loading';
        loadingMsg.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(15,23,42,0.95); padding:30px; border-radius:15px; border:1px solid #d4af37; color:white; z-index:999999; box-shadow:0 20px 40px rgba(0,0,0,0.5); display:flex; flex-direction:column; align-items:center;';
        loadingMsg.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size:2rem; color:#ffd700; margin-bottom:15px;"></i><div style="font-weight:bold; letter-spacing:1px; margin-top:10px;">E-Imzo kaliti tekshirilmoqda...</div>';
        document.body.appendChild(loadingMsg);

        setTimeout(() => {
            loadingMsg.remove();
            
            // Generate mock signature hash
            const signatureHash = 'E-IMZO_' + Math.random().toString(36).substr(2, 9).toUpperCase() + '_' + Date.now();
            
            // Save to state
            pu74Signatures[pageId] = signatureHash;
            
            // Save to localStorage
            localStorage.setItem(getPU74LocalKey('pu74_signs'), JSON.stringify(pu74Signatures));
            
            alert(`Muvaffaqiyatli! ${pageId} E-Imzo bilan tasdiqlandi.\n\nImzo kodi: ${signatureHash}`);
            
            // Re-render footer to show signed state
            if(typeof window.renderPU74Signatures === 'function') {
                window.renderPU74Signatures();
            }
            
            // Re-render sheet to lock inputs
            if(typeof renderPU74Sheet === 'function') {
                renderPU74Sheet(pu74ActiveSheet);
            }
            
        }, 1500);
    }
};
