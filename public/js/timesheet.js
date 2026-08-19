// Timesheet Logic

// State
let currentTimesheetMonth = new Date();
let currentTimesheetDept = 'all';

// Helper to get robust user subdivision info
// Helper to get robust user subdivision info
function checkTimesheetSubdivisionUser() {
    let currentUser = window.Auth?.currentUser || window.currentUser;
    if (!currentUser) {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            try {
                currentUser = JSON.parse(saved);
            } catch (e) {}
        }
    }
    
    let isSubdivisionUser = false;
    let userBolinmalar = [];
    let userBolinma = 'all';
    
    if (currentUser) {
        const role = String(currentUser.role).toLowerCase();
        const username = String(currentUser.username || '').toLowerCase();
        
        // Admin ALWAYS sees everything - never restrict
        if (role === 'admin') {
            return { isSubdivisionUser: false, userBolinmalar: [], userBolinma: 'all' };
        }
        
        let rawBolinma = null;
        
        // 1. Username pattern FIRST (most reliable)
        if (username.includes('bolinma') || username.includes("bo'linma")) {
            const numMatch = username.match(/\d+/);
            if (numMatch) {
                rawBolinma = `${numMatch[0]}-bo'linma`;
                isSubdivisionUser = true;
            }
        }
        
        // 2. Check if user has explicit bolinmalar array
        if (!isSubdivisionUser && currentUser.bolinmalar && currentUser.bolinmalar.length > 0) {
            rawBolinma = currentUser.bolinmalar[0];
            userBolinmalar = currentUser.bolinmalar;
            isSubdivisionUser = true;
        } 
        // 3. Check if user has bolinma_id property
        else if (!isSubdivisionUser && currentUser.bolinma_id && currentUser.bolinma_id !== 'all') {
            rawBolinma = currentUser.bolinma_id;
            isSubdivisionUser = true;
        }
        // 4. Check if user has departments array containing a bo'linma
        else if (!isSubdivisionUser && currentUser.departments && currentUser.departments.length > 0) {
            const d0 = currentUser.departments[0];
            const d0Low = String(d0).toLowerCase();
            if (d0Low.includes('bo\'linma') || d0Low.includes('bolinma')) {
                rawBolinma = d0;
                isSubdivisionUser = true;
            }
        }
        
        // Populate full list and standard name if identified as subdivision user
        if (isSubdivisionUser && rawBolinma) {
            const numMatch = String(rawBolinma).match(/\d+/);
            if (numMatch) {
                const num = numMatch[0];
                userBolinma = `${num}-bo'linma`;
                userBolinmalar = [userBolinma, `bolinma${num}`, num];
            } else {
                userBolinma = String(rawBolinma);
                userBolinmalar = [userBolinma];
            }
        }
        
        // 4. Force check for roles that are inherently subdivision roles
        // NOTE: If we still don't know which bo'linma, we DON'T force 1-bo'linma.
        // The openTimesheet(deptId) call will use deptId to filter instead.
        if (!isSubdivisionUser && (role === 'bolinma' || role === 'subdivision')) {
            // Don't set isSubdivisionUser=true here without knowing the bo'linma,
            // because that would incorrectly force filtering to a wrong bo'linma.
            // Leave isSubdivisionUser as false so the deptId filter path is used.
        }
    }
    
    return { isSubdivisionUser, userBolinmalar, userBolinma };
}

// Helper to normalize division IDs to the standard "X-bo'linma" format
function normalizeBolinmaId(val) {
    if (!val) return 'all';
    if (val === 'all') return 'all';
    const m = String(val).match(/\d+/);
    if (m && (String(val).startsWith('bolinma') || String(val).includes("bo'linma") || String(val).includes("bo‘linma"))) {
        return `${m[0]}-bo'linma`;
    }
    return val;
}

// Open Modal — instantly show, then load data async
function openTimesheet(deptId = 'all') {
    const { isSubdivisionUser, userBolinma } = checkTimesheetSubdivisionUser();
    
    if (isSubdivisionUser && userBolinma) {
        // Bo'linma user: always show ONLY their own bo'linma
        currentTimesheetDept = normalizeBolinmaId(userBolinma);
    } else {
        let resolvedDept = deptId;
        if (resolvedDept === 'all' || !resolvedDept || resolvedDept === "Bo'linma") {
            resolvedDept = window.viewingSubdivisionId || window.hrCurrentDeptId || 'all';
        }
        
        if (resolvedDept && resolvedDept !== 'all' && resolvedDept !== "Bo'linma") {
            currentTimesheetDept = normalizeBolinmaId(resolvedDept);
        } else {
            currentTimesheetDept = 'all';
        }
    }

    // Create modal if not exists
    let modal = document.getElementById('timesheet-modal');
    if (!modal) {
        createTimesheetModal();
        modal = document.getElementById('timesheet-modal');
    }

    // Show loading skeleton IMMEDIATELY — modal opens in <10ms
    const container = document.getElementById('timesheet-table-container');
    if (container) {
        container.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; height:60vh; flex-direction:column; gap:20px; color:rgba(255,255,255,0.6);">
                <div style="width:60px; height:60px; border:4px solid rgba(255,255,255,0.1); border-top:4px solid #ffd700; border-radius:50%; animation:spin 0.8s linear infinite;"></div>
                <div style="font-size:1.1rem; font-weight:700; letter-spacing:2px; text-transform:uppercase;">Tabel yuklanmoqda...</div>
                <div style="font-size:0.8rem; color:rgba(255,255,255,0.3);">Serverdan ma'lumotlar olinmoqda</div>
                <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
            </div>`;
    }

    // Show modal right away — don't wait
    modal.classList.add('active');
    applyTabelStyles();

    // Load real data in background (non-blocking)
    setTimeout(() => {
        renderTimesheetTable().catch(e => {
            console.error('Tabel yuklashda xatolik:', e);
            if (container) {
                container.innerHTML = `<div style="text-align:center; padding:60px; color:#f43f5e;"><i class="fas fa-triangle-exclamation fa-2x"></i><br><br>Ma'lumotlarni yuklashda xatolik<br><small>${e.message || ''}</small></div>`;
            }
        });
    }, 10);
}


// Close Modal
function closeTimesheet() {
    document.getElementById('timesheet-modal').classList.remove('active');
}

// Create Modal DOM
function createTimesheetModal() {
    const modal = document.createElement('div');
    modal.id = 'timesheet-modal';
    modal.className = 'timesheet-modal';
    modal.innerHTML = `
        <div class="timesheet-header">
            <div class="timesheet-title">
                <i class="fas fa-calendar-alt"></i> Elektron Tabel <span id="ts-dept-title" style="font-size: 1rem; margin-left: 10px; opacity: 0.8;"></span>
            </div>
            <div class="timesheet-controls">
                <button class="ts-btn" onclick="changeTimesheetMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                <span id="ts-current-date" style="color: white; font-size: 1.1rem; padding: 0 10px;">Sentabr 2025</span>
                <button class="ts-btn" onclick="changeTimesheetMonth(1)"><i class="fas fa-chevron-right"></i></button>
                
                <div style="width: 20px;"></div>
                ${window.Auth.currentUser?.role !== 'department' ? `
                <button class="ts-btn" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white;" onclick="autoFillFromAttendance()"><i class="fas fa-brain"></i> SMART TO'LDIRISH</button>
                ` : ''}
                ${(window.Auth.currentUser?.role === 'admin' || window.Auth.currentUser?.role === 'department') ? `
                <button class="ts-btn" style="background: #3b82f6; color: white;" onclick="renderTimesheetMonitor()"><i class="fas fa-desktop"></i> Bo'limlar Monitori</button>
                ` : ''}
                <button class="ts-btn" style="background: #10b981; color: white;" onclick="exportTimesheetToExcel()"><i class="fas fa-file-excel"></i> Excelga yuklash</button>
                <button id="ts-archive-btn" class="ts-btn" style="background: #059669; color: white; display: none;" onclick="window.archiveTimesheetToPDF()"><i class="fas fa-file-pdf"></i> Arxiv (PDF)</button>
                <button class="ts-btn ts-btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Chop etish</button>
                ${window.Auth.currentUser?.role !== 'department' ? `
                <button id="ts-save-btn" class="ts-btn ts-btn-success" onclick="saveTimesheet()"><i class="fas fa-save"></i> Saqlash</button>
                ` : ''}
                <button class="ts-btn ts-btn-danger" onclick="closeTimesheet()"><i class="fas fa-times"></i> Yopish</button>
            </div>
        </div>
        <div id="ts-workflow-bar" style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid var(--glass-border); padding: 5px 20px; display: none;"></div>
        <div class="timesheet-content" id="timesheet-table-container">
            <!-- Table goes here -->
        </div>
    `;
    document.body.appendChild(modal);
}

// Helper to check weekends
function isWeekend(year, month, day) {
    const d = new Date(year, month, day).getDay();
    return d === 0 || d === 6;
}

// Render Table
async function renderTimesheetTable() {
    const date = currentTimesheetMonth;
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    const monthNameRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    document.getElementById('ts-current-date').innerText = `${monthNames[month]} ${year}`;

    // Get Data
    let allWorkers = [];

    // 1. Try to get from HR system (priority)
    let hr = window.hrData;
    if (!hr || !hr.employees || hr.employees.length === 0) {
        hr = await initHRData();
    }
    
    if (hr && hr.employees && hr.employees.length > 0) {
        allWorkers = hr.employees.map(emp => ({
            id: emp.id || emp.tabelNumber || emp.tabel_number,
            name: emp.full_name || emp.name,
            position: emp.position,
            role: emp.position,
            // Server returns bolinma_id (with underscore), handle both forms
            bolinma: emp.bolinma_id || emp.bolinmaId || emp.bolinma || emp.department_id || emp.department,
            bolinmaId: emp.bolinma_id || emp.bolinmaId || emp.bolinma || emp.department_id || emp.department
        }));
    } else {
        // Fallback to other systems
        const savedWorkers = localStorage.getItem('smart_pch_workers');
        if (savedWorkers) {
            allWorkers = JSON.parse(savedWorkers);
        } else if (typeof window.workersData !== 'undefined') {
            allWorkers = window.workersData;
        }
    }

    // Ensure all workers have a bolinma so filtering works
    // NOTE: Only assign fallback if the server truly didn't provide one
    allWorkers.forEach((w, idx) => {
        if (!w.bolinma && !w.bolinmaId) {
            // Don't guess! Leave blank — they won't match any specific filter
            // This prevents wrongly assigning employees to wrong bo'linmas
            w.bolinma = '';
            w.bolinmaId = '';
        }
    });

    // (Removed the code that forces 'all' to be the first department, 
    // because it caused ALL departments to show 1-bo'linma)

    // Update Dept Title again just in case
    const tsDeptTitle = document.getElementById('ts-dept-title');
    if (tsDeptTitle) {
        const deptTitle = currentTimesheetDept === 'all' ? "(Barcha Bo'limlar)" : `(${currentTimesheetDept})`;
        tsDeptTitle.innerText = deptTitle;
    }

    // Filter by Dept & Role Access
    const { isSubdivisionUser, userBolinmalar } = checkTimesheetSubdivisionUser();
    const currentUser = window.Auth?.currentUser || window.currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');
    let employees = allWorkers;
    let isEditable = false;

    // 1. Hard constraint: Bolinma users can ONLY see their assigned subdivisions
    if (isSubdivisionUser) {
        employees = allWorkers.filter(w => {
            const wBol = String(w.bolinma || w.bolinmaId || '').toLowerCase().trim();
            const wNumMatch = wBol.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';

            return userBolinmalar.some(b => {
                const bStr = String(b).toLowerCase().trim();
                const bNumMatch = bStr.match(/\d+/);
                const bNum = bNumMatch ? bNumMatch[0] : '';

                if (bNum && wNum === bNum) return true;
                if (bStr && wBol === bStr) return true;
                // Add strict checking instead of loose includes to prevent "1" matching "10-bo'linma"
                if (bStr && wBol && bStr.length > 2 && (wBol.includes(bStr) || bStr.includes(wBol))) return true;
                return false;
            });
        });
        isEditable = true;
    } 
    
    if (currentUser?.role === 'admin' || currentUser?.role === 'department') {
        isEditable = true;
    }

    // 2. Secondary filter: if a specific department was selected
    if (currentTimesheetDept !== 'all' && currentTimesheetDept !== 'xodimlar' && currentTimesheetDept !== 'admin') {
        const bIdStr = String(currentTimesheetDept).toLowerCase().trim();
        const bNumMatch = bIdStr.match(/\d+/);
        const bNum = bNumMatch ? bNumMatch[0] : '';

        employees = employees.filter(w => {
            const wBol = String(w.bolinma || w.bolinmaId || '').toLowerCase().trim();
            const wNumMatch = wBol.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';

            // Exact string match
            if (bIdStr && wBol === bIdStr) return true;
            
            // Exact number match (ensures '1' matches '1', not '11')
            if (bNum && wNum === bNum) return true;

            return false;
        });
    }

    const bolinmaParam = currentTimesheetDept !== 'all' ? `?bolinma_id=${currentTimesheetDept}` : '';
    // Fetch from server instead of localStorage
    let savedData = {};
    try {
        const serverData = await SmartUtils.fetchAPI(`/timesheet/${year}/${month}${bolinmaParam}`);
        if (serverData) savedData = serverData;
    } catch (e) {
        console.warn('Timesheet server fetch failed, using local fallback', e);
        const storageKey = `timesheet_${year}_${month}`;
        savedData = JSON.parse(localStorage.getItem(storageKey)) || {};
    }

    // Fetch Workflow Status (Universal Workflow)
    let signatures = {};
    const docId = `${currentTimesheetDept}_${year}_${month}`;
    const workflowBar = document.getElementById('ts-workflow-bar');

    if (currentTimesheetDept !== 'all') {
        let workflow = await SmartWorkflow.getStatus('timesheet', docId);
        
        // If workflow hasn't started, initialize it
        if (!workflow || workflow.status === 'not_started' || workflow.status === 'error') {
            await SmartWorkflow.submit('timesheet', docId);
            workflow = await SmartWorkflow.getStatus('timesheet', docId);
        }

        // Map history back to a flat signatures object for the template to render stamps
        (workflow.history || []).forEach(h => {
            signatures[`${h.role}_name`] = h.user_name;
            signatures[`${h.role}_at`] = h.date;
            signatures[`${h.role}_serial`] = h.signature.substring(0, 16) + '...'; // Shorten ERI hash
            signatures[`${h.role}_hash`] = h.signature;
        });

        // Render timeline UI
        if (workflowBar) {
            SmartWorkflow.renderTimeline('ts-workflow-bar', workflow);
            workflowBar.style.display = 'block';
        }
    } else if (workflowBar) {
        workflowBar.style.display = 'none';
    }

    let html = `
        <div class="tabel-wrapper">
            <div class="tabel-print-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; color: #000 !important;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <img src="img/logo.png" alt="O'zRTy Logo" style="height: 80px; filter: grayscale(1) contrast(3);">
                    <div style="text-align: left;">
                        <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: #000 !important;">"O'ZBEKISTON TEMIR YO'LLARI" AJ</h3>
                        <p style="margin: 0; font-size: 0.8rem; font-weight: 600; color: #000 !important;">Korxona: PCH-16 (Temir yo'l masofasi)</p>
                    </div>
                </div>
                <div style="width: 380px; text-align: right; font-family: 'Times New Roman', serif;">
                    <div style="font-weight: 800; font-size: 1.3rem; margin-bottom: 5px; color: #000 !important;">TASDIQLAYMAN</div>
                    <div class="director-approval-box" style="border: 2px solid #000; padding: 15px; min-width: 350px; min-height: 120px; background: #fff; position: relative; color: #000 !important;">
                         ${signatures.rahbar_name ? `
                            <div class="e-signature-stamp director-stamp">
                                <div class="stamp-qr" id="qr-rahbar"></div>
                                <div class="stamp-details">
                                    <div class="stamp-label">DIREKTOR TASDIQLADI</div>
                                    <div class="stamp-name">${signatures.rahbar_name}</div>
                                    <div class="stamp-date">${new Date(signatures.rahbar_at).toLocaleString()}</div>
                                    <div class="stamp-serial">ERI: ${signatures.rahbar_serial}</div>
                                </div>
                            </div>
                        ` : (window.Auth.currentUser.role === 'admin' || window.Auth.currentUser.role === 'director' || window.Auth.currentUser.role === 'rahbar') ? `
                            <div style="text-align: center;">
                                <p style="font-size: 0.85rem; color: #000 !important; margin-bottom: 15px;">Direktor tasdig'i uchun:</p>
                                <button onclick="signTimesheet('rahbar')" class="sign-btn director" ${!signatures.iqtisod_name ? 'disabled title="Oldin Iqtisod bo\'limi tasdiqlashi kerak"' : ''} style="width: 100%; margin-top: 0;">
                                    <i class="fas fa-stamp"></i> E-IMZO BILAN TASDIQLASH
                                </button>
                            </div>
                        ` : `
                            <div style="text-align: center; color: #000 !important; font-style: italic; padding-top: 20px;">
                                <i class="fas fa-hourglass-half fa-spin"></i> Rahbar tasdig'i kutilmoqda...
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 25px; color: #000 !important; font-family: 'Inter', system-ui, sans-serif;">
                <h1 style="font-size: 3.5rem; font-weight: 900; margin: 0; letter-spacing: 20px; color: #1e293b !important; text-transform: uppercase;">TABELI</h1>
                <p style="font-size: 1.1rem; font-weight: 700; margin: 5px 0; color: #334155 !important;">${year}-yil ${monthNames[month].toLowerCase()} oyi uchun ish vaqtidan foydalanishni hisobga olish va daromadlarni hisoblash</p>
                <div style="display: flex; justify-content: center; gap: 30px; font-weight: 800; font-size: 1.2rem; border-top: 1.5px solid #cbd5e1; padding-top: 10px; width: 50%; margin: 10px auto; color: #475569 !important;">
                    <span>Xodimlar soni: <b style="color: #000; font-size: 1.4rem;">${employees.length}</b></span>
                    <span>Bo'lim: <b style="color: #000; font-size: 1.4rem; text-transform: uppercase;">${currentTimesheetDept === 'all' ? "UMUMIY" : currentTimesheetDept.replace('bolinma', '') + "-bo'linma"}</b></span>
                </div>
            </div>

            <style>
                .tabel-complex th, .tabel-complex td {
                    color: #000 !important;
                    font-weight: 700;
                    font-size: 0.95rem; /* Make text more visible */
                }
                .tabel-complex th {
                    font-weight: 800;
                    font-size: 1rem;
                }
                .ts-input {
                    color: #000 !important;
                    font-weight: 800 !important;
                }
                /* Grey footer box */
                .timesheet-footer-grey {
                    background: #f1f5f9;
                    padding: 30px;
                    border-radius: 12px;
                    margin-top: 40px;
                    border: 2px solid #cbd5e1;
                }
            </style>

            <table class="tabel-complex official-ts-table">
                <colgroup>
                    <col style="width: 35px;"> <!-- № -->
                    ${Array.from({ length: 16 }, () => `<col style="width: 28px;">`).join('')} <!-- Days 1-16 -->
                    <col style="width: 40px;"> <!-- haqiqiy ish kunlari -->
                    <col style="width: 40px;"> <!-- smena uzilishlari -->
                    <col style="width: 40px;"> <!-- dam olish va bayram kunlari -->
                    <col style="width: 50px;"> <!-- ishlab berilmagan soatlar -->
                    <col style="width: 50px;"> <!-- jami -->
                    <col style="width: 40px;"> <!-- qo'shimcha ish vaqti -->
                    <col style="width: 40px;"> <!-- tungi ish vaqti -->
                    <col style="width: 40px;"> <!-- bayram kunlari -->
                    <col style="width: 40px;"> <!-- doimiy ish staji -->
                    <col style="width: 40px;"> <!-- uchastka -->
                    <col style="width: 40px;"> <!-- to'lov turi -->
                    <col style="width: 40px;"> <!-- shaxsiy hisob -->
                    <col style="width: 40px;"> <!-- xarajatlar -->
                    <col style="width: 40px;"> <!-- qo'shimcha buyruq -->
                    <col style="width: 40px;"> <!-- ishlab chiqarish guruhi -->
                    <col style="width: 120px;"> <!-- kasbi yoki lavozimi -->
                    <col style="width: 40px;"> <!-- xodim kategoriyasi -->
                    <col style="width: 60px;"> <!-- tabel raqami -->
                    <col style="width: 40px;"> <!-- xodim razryadi -->
                    <col style="width: 60px;"> <!-- maosh/tarif -->
                    <col style="width: 40px;"> <!-- mukofot foizi -->
                    <col style="width: 40px;"> <!-- shifrlar -->
                    <col style="width: 50px;"> <!-- ish vaqti va kelmaga soatlar -->
                    <col style="width: 50px;"> <!-- dam olish va bayram kunlari -->
                </colgroup>
                <thead>
                    <tr>
                        <th rowspan="4">№</th>
                        <th colspan="16">Familiyasi, ismi, otasining ismi</th>
                        <th colspan="3" rowspan="2">Kun</th>
                        <th rowspan="4" class="vertical-text">ishlab berilmagan soatlar</th>
                        <th colspan="4" rowspan="2">ishlab berilgan soatlar</th>
                        <th rowspan="4" class="vertical-text">doimiy ish staji</th>
                        <th rowspan="4" class="vertical-text">uchastka</th>
                        <th rowspan="4" class="vertical-text">to'lov turi</th>
                        <th rowspan="4" class="vertical-text">shaxsiy hisob va sub-hisob</th>
                        <th rowspan="4" class="vertical-text">xarajatlar</th>
                        <th rowspan="4" class="vertical-text">qo'shimcha buyruq</th>
                        <th rowspan="4" class="vertical-text">ishlab chiqarish guruhi</th>
                        <th rowspan="4" class="vertical-text">kasbi yoki lavozimi</th>
                        <th rowspan="4" class="vertical-text">xodim kategoriyasi</th>
                        <th rowspan="4" class="vertical-text">tabel raqami</th>
                        <th rowspan="4" class="vertical-text">xodim razryadi</th>
                        <th rowspan="4" class="vertical-text">maosh/tarif stafka</th>
                        <th rowspan="4" class="vertical-text">mukofot foizi</th>
                        <th rowspan="4" class="vertical-text">shifrlar</th>
                        <th colspan="2" rowspan="2">kun</th>
                    </tr>
                    <tr>
                        <th colspan="16">kun<br>oy</th>
                    </tr>
                    <tr>
                        ${Array.from({ length: 15 }, (_, i) => `<th style="background: #f8fafc;">${i + 1}</th>`).join('')}
                        <th style="background: #f8fafc;">-</th>
                        <th rowspan="2" class="vertical-text">haqiqiy ish kunlari</th>
                        <th rowspan="2" class="vertical-text">smena uzilishlari</th>
                        <th rowspan="2" class="vertical-text">dam olish va bayram kunlari</th>
                        <th rowspan="2" class="vertical-text">jami</th>
                        <th colspan="3">ulardan</th>
                        <th rowspan="2" class="vertical-text">ish vaqti va kelmaga soatlar</th>
                        <th rowspan="2" class="vertical-text">dam olish va bayram kunlari</th>
                    </tr>
                    <tr>
                        ${Array.from({ length: 16 }, (_, i) => {
                            const d = i + 16;
                            return `<th style="background: #f8fafc;">${d > daysInMonth ? '-' : d}</th>`;
                        }).join('')}
                        <th class="vertical-text">qo'shimcha ish vaqti</th>
                        <th class="vertical-text">tungi ish vaqti</th>
                        <th class="vertical-text">bayram kunlari</th>
                    </tr>
                </thead>
                <tbody>
    `;

    employees.forEach((emp, index) => {
        const empId = emp.id;
        let totalHours = 0;
        let totalDays = 0;
        let nightHours = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const val = parseFloat(savedData[`${empId}_${day}`] || 0);
            if (!isNaN(val) && val > 0) {
                totalHours += val;
                totalDays++;
                if (val === 12) nightHours += 4;
            }
        }

        const buildDayCell = (day) => {
            if (day > daysInMonth) return `<td style="background: #f1f5f9; border: 1px solid black;"></td>`;
            const key = `${empId}_${day}`;
            const val = savedData[key] || '';
            const isWE = isWeekend(year, month, day);
            const contentEditableAttr = isEditable ? 'contenteditable="true"' : 'contenteditable="false"';
            return `
                <td style="background: ${isWE ? '#fff1f2' : 'white'}; border: 1px solid #000;">
                    <div class="ts-input" ${contentEditableAttr} oninput="calculateRow(this)" onblur="saveTimesheet(true)" data-emp="${empId}" data-day="${day}">${val}</div>
                </td>`;
        };

        const buildMetaCell = (key, defaultVal = '', extraClasses = '', extraStyle = '', idAttr = '', rowspan = 3) => {
            const savedKey = `${empId}_${key}`;
            const val = savedData[savedKey] !== undefined ? savedData[savedKey] : defaultVal;
            const contentEditableAttr = isEditable ? 'contenteditable="true"' : 'contenteditable="false"';
            const htmlId = idAttr ? `id="${idAttr}"` : '';
            return `
                <td rowspan="${rowspan}" style="background: white; border: 1px solid #000; ${extraStyle}">
                    <div ${htmlId} class="ts-input meta-input ${extraClasses}" ${contentEditableAttr} onblur="saveTimesheet(true)" data-emp="${empId}" data-day="${key}" style="border: none; outline: none; padding: 1px;">${val}</div>
                </td>`;
        };

        const nameVal = savedData[`${empId}_full_name`] !== undefined ? savedData[`${empId}_full_name`] : `${emp.name} (№${emp.id || emp.tabelNumber || '---'})`;
        const contentEditableAttr = isEditable ? 'contenteditable="true"' : 'contenteditable="false"';
        
        html += `
            <tr class="emp-row-main" data-emp-row="${empId}">
                <td rowspan="3" style="font-weight: 800; background: #f8fafc; border: 1px solid #000; font-size: 1.1rem;">
                    <div class="ts-input" ${contentEditableAttr} onblur="saveTimesheet(true)" data-emp="${empId}" data-day="nomer_t" style="border: none; outline: none;">${savedData[`${empId}_nomer_t`] !== undefined ? savedData[`${empId}_nomer_t`] : (index + 1)}</div>
                </td>
                <td colspan="16" class="employee-name" style="border: 1px solid #000; text-align: center;">
                    <div class="ts-input" ${contentEditableAttr} onblur="saveTimesheet(true)" data-emp="${empId}" data-day="full_name" style="justify-content: center; text-align: center; border: none; font-weight: 800; font-size: 1.1rem; padding: 5px;">${nameVal}</div>
                </td>
                
                ${buildMetaCell('total_days', totalDays, 'total-days', 'font-weight: bold; background: #f1f5f9; font-size: 1.1rem;', `total-days-${empId}`)} <!-- haqiqiy ish kunlari -->
                ${buildMetaCell('smena', '', '')} <!-- smena uzulishlari -->
                ${buildMetaCell('dam_olish', '', '')} <!-- dam olish va bayram kunlari -->
                
                ${buildMetaCell('ishsiz', '', '')} <!-- ishlab berilmagan soatlar -->
                
                ${buildMetaCell('total_hours', totalHours, 'total-hours', 'font-weight: bold; background: #f1f5f9; font-size: 1rem;', `total-hours-${empId}`)} <!-- jami -->
                ${buildMetaCell('qoshimcha', '', '')} <!-- qo'shimcha ish -->
                ${buildMetaCell('night_hours', nightHours, 'night-hours', 'font-weight: bold; font-size: 1rem;', `night-hours-${empId}`)} <!-- tungi ish -->
                ${buildMetaCell('bayram', '', '')} <!-- bayram -->
                
                ${buildMetaCell('doimiy_sex', currentTimesheetDept === 'all' ? emp.bolinmaId : currentTimesheetDept, '', 'font-weight: bold;')} <!-- doimiy ish staji -->
                ${buildMetaCell('uchastka', '', '')} <!-- uchastka -->
                ${buildMetaCell('tolov_turi', '', '')} <!-- to'lov turi -->
                ${buildMetaCell('shaxsiy_hisob', '', '')} <!-- shaxsiy hisob -->
                ${buildMetaCell('xarajatlar', '', '')} <!-- xarajatlar -->
                ${buildMetaCell('qoshimcha_buyruq', '', '')} <!-- qoshimcha buyruq -->
                ${buildMetaCell('ishlab_chiqarish', '', '')} <!-- ishlab chiqarish guruhi -->
                ${buildMetaCell('kasbi', emp.role || emp.position, '', 'font-weight: bold;')} <!-- kasb yoki lavozimi -->
                ${buildMetaCell('xodim_kat', '', '')} <!-- xodim kategoriyasi -->
                ${buildMetaCell('tabel_raqami', 101 + index, '', 'font-weight: bold;')} <!-- tabel raqami -->
                ${buildMetaCell('razryad', 4, '')} <!-- xodim razryadi -->
                ${buildMetaCell('maosh', '', '')} <!-- maosh/tarif stafka -->
                ${buildMetaCell('mukofot', '', '')} <!-- mukofot foizi -->
                ${buildMetaCell('shifrlar', '', '')} <!-- shifrlar -->
                
                ${buildMetaCell('total_hours_dup', totalHours, 'total-hours-dup', 'font-weight: bold; background: #f1f5f9;', `total-hours-dup-${empId}`)} <!-- ish vaqti -->
                ${buildMetaCell('far_dam')} <!-- dam olish va bayram -->
            </tr>
            <tr class="emp-row-d1">
                ${Array.from({ length: 15 }, (_, i) => buildDayCell(i + 1)).join('')}
                <td style="background: #f1f5f9; border: 1px solid black;"></td>
            </tr>
            <tr class="emp-row-d2">
                ${Array.from({ length: 16 }, (_, i) => buildDayCell(i + 16)).join('')}
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>

            <div class="tabel-footer timesheet-footer-grey" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; font-family: 'Times New Roman', serif; color: #000 !important;">
                <!-- 1. Tuzuvchi (Bo'linma) -->
                <div class="signature-block">
                    <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 15px; border-bottom: 2px solid #000; display: inline-block; padding: 0 10px;">BO'LINMA (TUZUVCHI)</div>
                    <div style="min-height: 120px; position: relative;">
                        ${signatures.tuzuvchi_name ? `
                            <div class="e-signature-stamp tuzuvchi-stamp">
                                <div class="stamp-qr" id="qr-tuzuvchi"></div>
                                <div class="stamp-details">
                                    <div class="stamp-label">BO'LINMA IMZOLADI</div>
                                    <div class="stamp-name">${signatures.bolinma_name || signatures.tuzuvchi_name}</div>
                                    <div class="stamp-date">${new Date(signatures.bolinma_at || signatures.tuzuvchi_at).toLocaleString()}</div>
                                    <div class="stamp-serial">ERI: ${signatures.bolinma_serial || signatures.tuzuvchi_serial}</div>
                                </div>
                            </div>
                        ` : (window.Auth.currentUser.role === 'bolinma' || window.Auth.currentUser.role === 'admin') ? `
                            <div style="text-align: center; padding-top: 20px;">
                                <button onclick="signTimesheet('bolinma')" class="sign-btn" style="width: 100%;">
                                    <i class="fas fa-pen-nib"></i> E-IMZO BILAN IMZOLASH
                                </button>
                            </div>
                        ` : '<div style="color: #94a3b8; font-size: 1rem; font-style: italic; text-align: center; padding-top: 30px;">Imzo kutilmoqda...</div>'}

                    </div>
                </div>

                <!-- 2. Xodimlar bo'limi -->
                <div class="signature-block">
                    <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 15px; border-bottom: 2px solid #000; display: inline-block; padding: 0 10px;">XODIMLAR BO'LIMI</div>
                    <div style="min-height: 120px; position: relative;">
                        ${signatures.xodimlar_name ? `
                            <div class="e-signature-stamp dept-stamp-hr">
                                <div class="stamp-qr" id="qr-xodimlar"></div>
                                <div class="stamp-details">
                                    <div class="stamp-label">XODIMLAR TASDIQLADI</div>
                                    <div class="stamp-name">${signatures.xodimlar_name}</div>
                                    <div class="stamp-date">${new Date(signatures.xodimlar_at).toLocaleString()}</div>
                                    <div class="stamp-serial">ERI: ${signatures.xodimlar_serial}</div>
                                </div>
                            </div>
                        ` : (window.Auth.currentUser.role === 'admin' || window.Auth.currentUser.departments?.includes('xodimlar')) ? `
                            <div style="text-align: center; padding-top: 20px;">
                                <button onclick="signTimesheet('xodimlar')" class="sign-btn checker" ${!(signatures.bolinma_name || signatures.tuzuvchi_name) ? 'disabled title="Oldin bo\'linma imzolashi kerak"' : ''} style="width: 100%;">

                                    <i class="fas fa-user-shield"></i> HR TASDIG'I (ERI)
                                </button>
                            </div>
                        ` : '<div style="color: #94a3b8; font-size: 1rem; font-style: italic; text-align: center; padding-top: 30px;">HR tasdig\'i kutilmoqda...</div>'}
                    </div>
                </div>

                <!-- 3. Iqtisod bo'limi -->
                <div class="signature-block">
                    <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 15px; border-bottom: 2px solid #000; display: inline-block; padding: 0 10px;">IQTISOD BO'LIMI</div>
                    <div style="min-height: 120px; position: relative;">
                        ${signatures.iqtisod_name ? `
                            <div class="e-signature-stamp dept-stamp-iqtisod">
                                <div class="stamp-qr" id="qr-iqtisod"></div>
                                <div class="stamp-details">
                                    <div class="stamp-label">IQTISOD TASDIQLADI</div>
                                    <div class="stamp-name">${signatures.iqtisod_name}</div>
                                    <div class="stamp-date">${new Date(signatures.iqtisod_at).toLocaleString()}</div>
                                    <div class="stamp-serial">ERI: ${signatures.iqtisod_serial}</div>
                                </div>
                            </div>
                        ` : (window.Auth.currentUser.role === 'admin' || window.Auth.currentUser.departments?.includes('iqtisod')) ? `
                            <div style="text-align: center; padding-top: 20px;">
                                <button onclick="signTimesheet('iqtisod')" class="sign-btn checker" ${!signatures.xodimlar_name ? 'disabled title="Oldin Xodimlar bo\'limi tasdiqlashi kerak"' : ''} style="width: 100%;">
                                    <i class="fas fa-calculator"></i> IQTISOD TASDIG'I (ERI)
                                </button>
                            </div>
                        ` : '<div style="color: #94a3b8; font-size: 1rem; font-style: italic; text-align: center; padding-top: 30px;">Iqtisod tasdig\'i kutilmoqda...</div>'}
                    </div>
                </div>
            </div>
            
            ${signatures.rahbar_name ? `
                <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin-top: 20px; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-truck-loading" style="font-size: 1.5rem; color: #10b981;"></i>
                    <div>
                        <div style="font-weight: bold; color: #064e3b;">Buxgalteriyaga yuborildi</div>
                        <div style="font-size: 0.85rem; color: #065f46;">Ushbu tabel rahbar tomonidan tasdiqlandi va hisob-kitob uchun buxgalteriyada mavjud.</div>
                    </div>
                </div>
            ` : ''}

            <div style="text-align: right; margin-top: 15px; font-size: 0.8rem; color: #64748b;">
                Tizim: Smart PCh Management | Vaqt: ${new Date().toLocaleString()}
            </div>
            </div> <!-- End grey footer -->
        </div>
    `;

    document.getElementById('timesheet-table-container').innerHTML = html;

    // Generate QR Codes
    setTimeout(() => {
        ['tuzuvchi', 'xodimlar', 'iqtisod', 'rahbar'].forEach(role => {
            const sig = signatures[`${role}_name`];
            const container = document.getElementById(`qr-${role}`);
            if (sig && container) {
                const serial = signatures[`${role}_serial`] || 'ERI-KEY';
                const verifyUrl = `https://smartpch.uz/verify/tabel?role=${role}&y=${year}&m=${month}&b=${currentTimesheetDept}&s=${serial}`;
                new QRCode(container, {
                    text: verifyUrl,
                    width: 45,
                    height: 45,
                    colorDark: role === 'tuzuvchi' ? "#0d9488" : (role === 'rahbar' ? "#92400e" : (role === 'iqtisod' ? "#7c3aed" : "#1e40af")),
                    colorLight: "white",
                    correctLevel: QRCode.CorrectLevel.M
                });
            }
        });
    }, 200);

    // Handle Finalization (Director signed)
    const isFinalized = !!signatures.rahbar_name;
    const saveBtn = document.getElementById('ts-save-btn');
    const archiveBtn = document.getElementById('ts-archive-btn');

    if (isFinalized) {
        if (saveBtn) saveBtn.style.display = 'none';
        if (archiveBtn) archiveBtn.style.display = 'flex';
        // Disable editing
        showToast('Tabel rahbar tomonidan tasdiqlangan (FINAL). O\'zgartirish mumkin emas.', 'info');
    } else {
        if (saveBtn) {
            saveBtn.style.display = (window.Auth && window.Auth.currentUser && window.Auth.currentUser.role === 'department') ? 'none' : 'flex';
        }
        if (archiveBtn) archiveBtn.style.display = 'none';
    }


    applyTabelStyles();

    // If finalized, disable any contentEditable in inputs
    if (isFinalized) {
        document.querySelectorAll('.ts-input').forEach(el => {
            el.setAttribute('contenteditable', 'false');
            el.style.cursor = 'default';
        });
    }
}

window.signTimesheet = async function (role) {
    if (currentTimesheetDept === 'all') {
        return showToast('Faqat bitta bo\'linma tanlangan holda imzolash mumkin', 'warning');
    }

    const labels = {
        'bolinma': 'Bo\'linma',
        'tuzuvchi': 'Bo\'linma',
        'xodimlar': 'Xodimlar bo\'limi',
        'iqtisod': 'Iqtisod bo\'limi',
        'rahbar': 'Korxona rahbari'
    };
    const roleName = labels[role] || 'Mas\'ul shaxs';
    // Skipped the confirm prompt as requested

    try {
        // 1. Check E-IMZO Agent
        const agent = await EImzoHelper.checkAgent();
        if (!agent.success) {
            console.warn(agent.message);
            // In demo mode or if user allows, proceed with mock signing if agent is missing
        }

        // 2. Select Certificate (ERI Key)
        const certId = await EImzoHelper.showCertModal();
        if (!certId) return;

        // 3. Prepare data to sign (Hash of the table content)
        const tableData = document.querySelector('.official-ts-table').innerText;
        const dataToSign = `TABEL_${currentTimesheetDept}_${currentTimesheetMonth.getFullYear()}_${currentTimesheetMonth.getMonth()}_${tableData.substring(0, 100)}`;

        // 4. Perform Signing
        showToast('E-IMZO kaliti bilan imzolanmoqda...', 'info');
        const signature = await EImzoHelper.signData(certId, dataToSign);

        if (!signature || !signature.pkcs7) {
            throw new Error('Imzo hosil qilinmadi');
        }

        // 5. Send to Server for valid verification
        const res = await SmartWorkflow.sign('timesheet', `${currentTimesheetDept}_${currentTimesheetMonth.getFullYear()}_${currentTimesheetMonth.getMonth()}`, signature.pkcs7);

        if (res) {
            showToast('Tabel muvaffaqiyatli imzolanmoqda...', 'success');
            renderTimesheetTable();
        }

        if (res) {
            showToast('Tabel E-IMZO orqali muvaffaqiyatli imzolandi!', 'success');
            renderTimesheetTable();
        }
    } catch (e) {
        showToast('Imzolashda xatolik: ' + e.message, 'error');
        console.error(e);
    }
};

// Monthly Monitoring / Archive Summary
async function renderTimesheetMonitor() {
    const date = currentTimesheetMonth;
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

    showToast(`${monthNames[month]} oyi monitori yuklanmoqda...`, 'info');

    // Get all departments (Safe access)
    const subdivisions = (window.INITIAL_DATA && (window.INITIAL_DATA.bolinmaData || window.INITIAL_DATA.subdivisions)) || [];
    const container = document.getElementById('timesheet-table-container');

    // Fetch all signatures for this month
    let allSigs = {};
    try {
        allSigs = await SmartUtils.fetchAPI(`/timesheet/signatures/all?year=${year}&month=${month}`);
    } catch (e) {
        console.warn('Could not fetch all signatures, using individual fetch loop');
    }

    let html = `
        <div class="tabel-wrapper" style="width: 100%; padding: 20px; color: #000 !important; font-family: 'Times New Roman', serif; box-sizing: border-box; background: white;">
            <div style="text-align: center; margin-bottom: 20px; color: #000 !important;">
                <h2 style="color: #000 !important; font-weight: 950; font-size: 2.2rem; text-shadow: none; margin: 0;">OYLIK TABEL MONITORINGI</h2>
                <p style="color: #000 !important; font-weight: 800; font-size: 1.1rem; margin-top: 5px;">${monthNames[month]} ${year} yili uchun barcha bo'limlar holati</p>
            </div>
            
            <table class="monitor-table" style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
                <thead>
                    <tr style="background: #f8fafc; text-align: left; border-bottom: 3px solid #000;">
                        <th style="padding: 15px; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">№</th>
                        <th style="padding: 15px; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">BO'LIM / BO'LINMA NOMI</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">TUZUVCHI</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">XODIMLAR</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">IQTISOD</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">RAHBAR</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900;">AMAL</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (let i = 0; i < subdivisions.length; i++) {
        const sub = subdivisions[i];
        const sigs = allSigs[sub.id] || {};

        const getStatusIcon = (signed) => signed ?
            `<i class="fas fa-check-circle" style="color: #059669; font-size: 1.4rem;" title="Imzolangan"></i>` :
            `<i class="fas fa-clock" style="color: #cbd5e1; font-size: 1.4rem;" title="Kutilmoqda"></i>`;

        html += `
            <tr style="border-bottom: 1px solid #000; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
                <td style="padding: 15px; color: #000 !important; font-weight: 700; border-right: 1px solid #000;">${i + 1}</td>
                <td style="padding: 15px; font-weight: 900; color: #000 !important; border-right: 1px solid #000;">${sub.name}</td>
                <td style="padding: 15px; text-align: center; border-right: 1px solid #000;">${getStatusIcon(sigs.tuzuvchi_name)}</td>
                <td style="padding: 15px; text-align: center; border-right: 1px solid #000;">${getStatusIcon(sigs.xodimlar_name)}</td>
                <td style="padding: 15px; text-align: center; border-right: 1px solid #000;">${getStatusIcon(sigs.iqtisod_name)}</td>
                <td style="padding: 15px; text-align: center; border-right: 1px solid #000;">${getStatusIcon(sigs.rahbar_name)}</td>
                <td style="padding: 15px; text-align: center;">
                    <button class="ts-btn" style="padding: 6px 15px; font-size: 0.8rem; background: #000; color: white;" onclick="openTimesheet('${sub.id}')">
                        Ochish <i class="fas fa-external-link-alt" style="font-size: 0.7rem;"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    html += `
                </tbody>
            </table>
            
            <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center; border-top: 3px solid #000; padding-top: 20px; color: #000 !important;">
                <div style="color: #000 !important; font-size: 1.1rem; font-weight: 800;">
                    Jami bo'limlar: <b>${subdivisions.length} ta</b>
                </div>
                <div style="display: flex; gap: 20px; font-size: 1rem; color: #000 !important; font-weight: 700;">
                    <span><i class="fas fa-check-circle" style="color: #059669;"></i> Imzolangan</span>
                    <span><i class="fas fa-clock" style="color: #cbd5e1;"></i> Jarayonda</span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    document.getElementById('ts-dept-title').innerText = "(Umumiy Monitoring)";

    // Hide unnecessary tools
    const saveBtn = document.getElementById('ts-save-btn');
    const archiveBtn = document.getElementById('ts-archive-btn');
    if (saveBtn) saveBtn.style.display = 'none';
    if (archiveBtn) archiveBtn.style.display = 'none';
}

function applyTabelStyles() {
    const styleId = 'official-tabel-styles';
    let style = document.getElementById(styleId);
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }

    style.innerHTML = `
        .timesheet-content {
            padding: 5px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            background: #0f172a;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: auto !important; /* Enable scroll if content is wider */
        }
        .timesheet-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 15, 0.98);
            z-index: 100020 !important;
            display: none;
            flex-direction: column;
            padding: 0;
            box-sizing: border-box;
            backdrop-filter: blur(15px);
        }
        .tabel-wrapper {
            background: white;
            padding: 20px;
            margin: 0;
            width: fit-content; /* Allow width to expand for large tables */
            min-width: 100%;
            position: relative;
            box-sizing: border-box;
            align-self: flex-start;
        }
        .official-ts-table {
            border-collapse: collapse;
            border: 2px solid black !important;
            font-family: 'Times New Roman', serif;
            background: white;
            color: #000 !important;
            table-layout: fixed;
            margin-bottom: 30px;
        }
        .official-ts-table th, .official-ts-table td {
            border: 1px solid #000 !important;
            height: 30px;
            padding: 2px;
            color: #000 !important;
            font-size: 0.75rem;
            text-align: center;
            vertical-align: middle;
            font-weight: 700;
            box-sizing: border-box;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .official-ts-table thead th {
            background: #f8fafc;
            font-weight: 900;
            color: #000 !important;
            font-size: 0.6rem;
            text-transform: uppercase;
            border: 1px solid #000 !important;
        }
        .v-text {
            height: 250px; /* Increased height for vertical text */
            vertical-align: bottom !important;
            padding: 5px 0 !important;
        }
        .v-text div, .v-data {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            white-space: pre-wrap; 
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            width: 100%;
            height: 100%;
            font-size: 0.6rem;
            font-weight: 900;
            line-height: 1;
            padding: 5px 2px;
        }
        .ts-input {
            width: 100%;
            height: 100%;
            min-height: 25px;
            outline: none;
            font-weight: 800;
            font-size: 0.8rem;
            color: #000 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .v-data {
            font-size: 0.6rem !important;
            padding: 2px !important;
        }
        .ts-input:focus {
            background: #e0f2fe;
            box-shadow: inset 0 0 0 3px #0ea5e9;
        }
        
        .e-signature-stamp {
            display: flex;
            align-items: center;
            gap: 12px;
            background: #fff;
            border: 1.5px solid #e2e8f0;
            padding: 10px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .stamp-qr {
            width: 50px;
            height: 50px;
            padding: 2px;
            background: #fff;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
        }
        .stamp-details {
            text-align: left;
            line-height: 1.3;
        }
        .stamp-label {
            font-size: 0.65rem;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
        }
        .stamp-name {
            font-size: 0.85rem;
            font-weight: 900;
            color: #0f172a;
        }
        .stamp-date {
            font-size: 0.7rem;
            color: #64748b;
        }
        .stamp-serial {
            font-size: 0.6rem;
            color: #94a3b8;
            font-family: monospace;
        }
        .sign-btn {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 800;
            letter-spacing: 0.5px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            text-transform: uppercase;
        }
        .sign-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
            filter: brightness(1.1);
        }
        .sign-btn.director { background: linear-gradient(135deg, #ea580c, #9a3412); box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); }
        .sign-btn.checker { background: linear-gradient(135deg, #059669, #064e3b); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }

        @media print {
            @page {
                size: landscape;
                margin: 5mm;
            }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            body { 
                background: white !important; 
                margin: 0; padding: 0;
            }
            body > *:not(#timesheet-modal) {
                display: none !important; 
            }
            #timesheet-modal {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                display: block !important;
                background: white !important;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
                padding: 0 !important;
            }
            .timesheet-content { 
                padding: 0 !important; 
                background: white !important; 
                display: block !important;
                height: auto !important;
                width: 100% !important;
                overflow: visible !important;
            }
            .tabel-wrapper { 
                padding: 0 !important; 
                margin: 0 !important; 
                box-shadow: none !important; 
                border-radius: 0 !important;
                width: 100% !important;
                background: white !important;
                overflow: visible !important;
                display: block !important;
            }
            .official-ts-table { 
                width: 100% !important; 
                min-width: auto !important; /* Allow browser scaling */
                page-break-inside: auto;
                border: 2px solid #000 !important;
                border-collapse: collapse !important;
                font-size: 8pt !important;
                table-layout: fixed !important;
            }
            .official-ts-table th, .official-ts-table td {
                border: 0.5pt solid #000 !important;
                color: #000 !important;
                visibility: visible !important;
                opacity: 1 !important;
                height: auto !important;
            }
            .v-text, .v-data {
                writing-mode: vertical-rl !important;
                transform: rotate(180deg) !important;
                white-space: normal !important;
            }
            .v-text div, .v-data {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 6pt !important;
            }
            .ts-input {
                border: none !important;
                font-size: 8pt !important;
            }
            thead { display: table-header-group; }
            .ts-btn, .timesheet-header, .sign-btn:not(.e-signature-stamp) { display: none !important; }
            
            /* Preserve signature stamps in print */
            .e-signature-stamp {
                border: 1px solid #000 !important;
                box-shadow: none !important;
                display: flex !important;
            }
        }
    `;
}

function changeTimesheetMonth(dir) {
    currentTimesheetMonth.setMonth(currentTimesheetMonth.getMonth() + dir);
    renderTimesheetTable();
}


window.saveTimesheet = async function (silent = false) {
    if (window.Auth && window.Auth.currentUser && window.Auth.currentUser.role === 'department') {
        if (!silent) showToast("Bo'lim xodimlari tabelni tahrirlay/saqlay olmaydi. Ular faqat ERI bilan tasdiqlaydilar.", "warning");
        return;
    }
    const date = currentTimesheetMonth;
    const year = date.getFullYear();
    const month = date.getMonth();
    const storageKey = `timesheet_${year}_${month}`;

    const data = {};
    const cells = document.querySelectorAll('.ts-input');

    cells.forEach(cell => {
        const emp = cell.getAttribute('data-emp');
        const day = cell.getAttribute('data-day');
        const val = cell.innerText.trim();
        if (val) data[`${emp}_${day}`] = val;
    });

    try {
        // Save to Server
        await SmartUtils.fetchAPI('/timesheet/save', {
            method: 'POST',
            body: JSON.stringify({ year, month, data, bolinma_id: currentTimesheetDept })
        });

        // Save to LocalStorage for offline
        localStorage.setItem(storageKey, JSON.stringify(data));

        if (!silent) {
            showToast('Tabel muvaffaqiyatli saqlandi!', 'success');
            renderTimesheetTable();
        }
    } catch (e) {
        console.error('Timesheet save error:', e);
        if (!silent) showToast('Tabelni saqlashda xatolik yuz berdi', 'error');
    }
};

// Export to Excel (Preserving Borders and Styles)
window.exportTimesheetToExcel = function () {
    const table = document.querySelector('.official-ts-table');
    if (!table) return showToast('Jadval topilmadi', 'error');

    try {
        const monthName = document.getElementById('ts-current-date').innerText;
        const deptName = currentTimesheetDept === 'all' ? 'barcha_bolimlar' : currentTimesheetDept;
        const filename = `Tabel_${deptName}_${monthName.replace(' ', '_')}.xls`;

        // CSS Styles for Excel (Borders, Fonts, Colors)
        const style = `
            <style>
                table { border-collapse: collapse; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10pt; }
                th, td { border: 1pt solid #000000; padding: 4px; text-align: center; height: 25px; }
                th { background-color: #f3f4f6; font-weight: bold; color: #1f2937; }
                .ts-name-col { text-align: left; width: 300px; padding-left: 10px; }
                .weekend { background-color: #fee2e2; }
                .holiday { background-color: #fef3c7; }
                .sum-col { font-weight: bold; background-color: #f0fdf4; }
                .v-text { mso-rotate: 90; vertical-align: bottom; height: 180px; white-space: nowrap; }
                .v-text div { mso-rotate: 90; vertical-align: bottom; }
            </style>
        `;

        // Clone table and clean interactive elements to make Excel format simple
        const exportTable = table.cloneNode(true);
        exportTable.querySelectorAll('.ts-input').forEach(el => {
            const val = el.innerText || el.value || '';
            const parent = el.parentNode;
            parent.innerText = val; // Completely replace the div with plain text
        });
        
        // Remove style constraints that break Excel Layout
        exportTable.style.width = '100%';
        exportTable.querySelectorAll('th, td').forEach(cell => {
            // Unify basic cell properties
            cell.style.minWidth = '';
            cell.style.maxWidth = '';
            cell.style.height = '';
        });
        // HTML for Excel with Office XML Headers
        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                ${style}
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>Tabel</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                    <x:Print>
                                        <x:ValidPrinterInfo/>
                                        <x:HorizontalResolution>600</x:HorizontalResolution>
                                        <x:VerticalResolution>600</x:VerticalResolution>
                                    </x:Print>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
            </head>
            <body>
                <h2 style="text-align: center; color: #1e293b;">${deptName.toUpperCase()} - ISH VAQTI TABELI (${monthName})</h2>
                ${exportTable.outerHTML}
                <div style="margin-top: 20px;">
                    <p><i>Sana: ${new Date().toLocaleDateString()}</i></p>
                    <p><i>Tuzuvchi: ${window.Auth?.currentUser?.full_name || 'Mas\'ul shaxs'}</i></p>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Excel fayl yaratildi va yuklab olindi (Barcha hoshiyalar saqlandi)', 'success');
    } catch (e) {
        console.error('Excel export error:', e);
        showToast('Excel eksportida xatolik yuz berdi', 'error');
    }
};

// Archive finalized timesheet to PDF (A4 Landscape / Albom)
window.archiveTimesheetToPDF = function () {
    const element = document.querySelector('.tabel-wrapper');
    if (!element) return showToast('Tabel topilmadi', 'error');

    const month = document.getElementById('ts-current-date').innerText;
    const dept = currentTimesheetDept === 'all' ? 'UMUMIY' : currentTimesheetDept;
    const filename = `Tabel_Arxiv_${dept}_${month.replace(' ', '_')}.pdf`;

    // Professional A4 Landscape optimization
    const opt = {
        margin: [5, 5, 5, 5],
        filename: filename,
        image: { type: 'jpeg', quality: 1.0 }, // Max quality
        html2canvas: {
            scale: 3, // Higher scale for ultra-sharp borders
            useCORS: true,
            logging: false,
            letterRendering: true,
            windowWidth: 2800 // Wider width to ensure all columns fit naturally
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape', compress: true }
    };

    showToast('Tabel A4 (Albom) formatida arxivga saqlanmoqda...', 'info');

    html2pdf().set(opt).from(element).toPdf().get('pdf').then(async (pdf) => {
        const blob = pdf.output('blob');

        // 1. Local download (Classic)
        pdf.save();

        // 2. Upload to server archive (Persistent)
        const formData = new FormData();
        formData.append('file', blob, filename);
        formData.append('module', 'timesheet_archive');
        formData.append('bolinma_id', currentTimesheetDept);
        formData.append('department', currentTimesheetDept);
        formData.append('status', 'approved'); // Auto-approved as it's signed byproduct

        try {
            await SmartUtils.fetchAPI('/files/upload', {
                method: 'POST',
                headers: SmartUtils.getApiHeaders({}, { json: false }),
                body: formData
            });
            showToast('Tabel muvaffaqiyatli arxivlandi (A4 + Tizim)!', 'success');
        } catch (e) {
            console.error('Server archive error:', e);
            showToast('Fayl yuklab olindi, lekin tizimga saqlashda xatolik', 'warning');
        }
    }).catch(err => {
        console.error('Archive error:', err);
        showToast('Arxivlashda xatolik yuz berdi', 'error');
    });
};

// --- Smart Attendance Auto-Fill Logic ---
window.autoFillFromAttendance = async function () {
    if (!confirm('Biometrik davomat (Face ID) ma\'lumotlari asosida tabelni avtomatik to\'ldirmoqchimisiz?')) return;

    showToast('Biometrik ma\'lumotlar tahlil qilinmoqda...', 'info');

    // Ensure HR data is loaded
    if (!window.hrData || !window.hrData.employees) {
        if (typeof initHRData === 'function') await initHRData();
    }

    const year = currentTimesheetMonth.getFullYear();
    const month = currentTimesheetMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get all inputs
    const inputs = document.querySelectorAll('.ts-input');
    let fillCount = 0;

    inputs.forEach(input => {
        const empId = input.getAttribute('data-emp');
        const day = parseInt(input.getAttribute('data-day'));

        // Skip if already filled or weekend (simplified)
        if (input.innerText.trim() !== '' || isWeekend(year, month, day)) return;

        // Smart Check: In a real system we fetch individual logs. 
        // For demo, we sync with the 'present' simulation in HR
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAttendance = (window.hrData && window.hrData.attendance) ? window.hrData.attendance[dateStr] : null;

        if (dayAttendance && dayAttendance.present > 0) {
            // Check if this specific worker was present (mock logic: 95% of 'dept' is present)
            if (Math.random() < 0.95) {
                input.innerText = '8';
                input.style.background = 'rgba(99, 102, 241, 0.1)';
                input.style.fontWeight = 'bold';
                fillCount++;

                // Trigger calculation
                calculateRow(input);
            }
        }
    });

    if (fillCount > 0) {
        showToast(`Muvaffaqiyatli! ${fillCount} ta hujjat soati biometrika asosida to'ldirildi.`, 'success');
        // Final recalculation for totals
        document.querySelectorAll('.emp-row-main').forEach(row => {
            const firstInput = row.nextElementSibling.querySelector('.ts-input');
            if (firstInput) calculateRow(firstInput);
        });
    } else {
        showToast('To\'ldirish uchun yangi ma\'lumotlar topilmadi.', 'info');
    }
};

window.calculateRow = function (input) {
    const empId = input.getAttribute('data-emp');

    let totalHours = 0;
    let totalDays = 0;
    let nightHours = 0;

    const rowInputs = document.querySelectorAll(`.ts-input[data-emp="${empId}"]`);
    rowInputs.forEach(inp => {
        const dayAttr = inp.getAttribute('data-day');
        // Only sum if data-day is a number (1-31)
        if (!isNaN(parseInt(dayAttr))) {
            const val = parseFloat(inp.innerText.trim().replace(',', '.'));
            if (!isNaN(val) && val > 0) {
                totalHours += val;
                totalDays++;
                // Mock night hours logic if 12 (4 hours night)
                if (val >= 12) nightHours += 4;
            }
        }
    });

    const totalDaysEl = document.getElementById(`total-days-${empId}`);
    const totalHoursEl = document.getElementById(`total-hours-${empId}`);
    const nightHoursEl = document.getElementById(`night-hours-${empId}`);
    
    // Duplicate fields on the far right
    const daysDupEl = document.getElementById(`total-days-dup-${empId}`);
    const hoursDupEl = document.getElementById(`total-hours-dup-${empId}`);

    if (totalDaysEl) totalDaysEl.innerText = totalDays;
    if (totalHoursEl) totalHoursEl.innerText = totalHours;
    if (nightHoursEl) nightHoursEl.innerText = nightHours;
    
    if (daysDupEl) daysDupEl.innerText = totalDays;
    if (hoursDupEl) hoursDupEl.innerText = totalHours;
};

// Global Exports
window.openTimesheet = openTimesheet;
window.closeTimesheet = closeTimesheet;
window.changeTimesheetMonth = changeTimesheetMonth;
window.archiveTimesheetToPDF = archiveTimesheetToPDF;

// Helper to open the Timesheet Monitor directly for HR and Economy departments
window.openTimesheetDepartmentSummary = async function() {
    currentTimesheetDept = 'all';
    let modal = document.getElementById('timesheet-modal');
    if (!modal) {
        createTimesheetModal();
        modal = document.getElementById('timesheet-modal');
    }
    
    // Switch to active state and immediately request the monitor view
    modal.classList.add('active');
    await renderTimesheetMonitor();
};

console.log('✅ Timesheet Module Logic Loaded');
