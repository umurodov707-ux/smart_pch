// --- GLOBAL QR LOGIC ---
window.showPU29QRCode = function(bId, swNum) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + window.location.pathname + '?pu29=' + bId + '-' + swNum)}&color=d4af37&bgcolor=030712`;
    
    let qm = document.getElementById('pu29-qr-modal');
    if (qm) qm.remove();

    qm = document.createElement('div');
    qm.id = 'pu29-qr-modal';
    qm.className = 'active';
    qm.setAttribute('style', 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; align-items:center; justify-content:center; z-index:999999999; backdrop-filter:blur(15px); pointer-events:all;');
    qm.onclick = (e) => { if(e.target === qm) qm.remove(); };
    
    qm.innerHTML = `
        <div style="background:#030712; width:340px; padding:30px; border-radius:24px; border:1px solid #d4af37; text-align:center; position:relative;">
            <button onclick="this.parentElement.parentElement.remove()" style="position:absolute; top:15px; right:15px; background:none; border:none; color:#64748b; font-size:1.5rem; cursor:pointer;">&times;</button>
            <div style="background:#fff; padding:15px; border-radius:15px; display:inline-block; margin:20px 0;">
                <img src="${qrUrl}" style="width:200px; height:200px;" alt="QR">
            </div>
            <div style="color:#fff; font-size:1.2rem; font-weight:900;">№ ${swNum} STRELKA</div>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top:20px; width:100%; padding:12px; background:#d4af37; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">YOPISH</button>
        </div>
    `;
    document.body.appendChild(qm);
};

// --- GLOBAL COMMAND PALETTE & CONVENIENCE ENGINE (Ctrl + K) ---
window.COMMAND_ITEMS = [
    { title: "1-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma1') },
    { title: "2-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma2') },
    { title: "3-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma3') },
    { title: "4-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma4') },
    { title: "5-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma5') },
    { title: "6-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma6') },
    { title: "7-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma7') },
    { title: "8-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma8') },
    { title: "9-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma9') },
    { title: "10-bo'linma", sub: "Yo'l masofasi bo'linmasi", icon: "fa-sitemap", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bolinma10') },
    { title: "Ishlab chiqarish bo'limi", sub: "Ishlab chiqarish va rejalashtirish", icon: "fa-industry", action: () => window.openDepartmentWindow && window.openDepartmentWindow('ishlab-chiqarish') },
    { title: "Kadrlar bo'limi (HR)", sub: "Xodimlar va tabel hisobi", icon: "fa-users", action: () => window.openDepartmentWindow && window.openDepartmentWindow('xodimlar') },
    { title: "Mexanika bo'limi", sub: "Mexanizm va avtopark monitoringi", icon: "fa-cog", action: () => window.openDepartmentWindow && window.openDepartmentWindow('mexanika') },
    { title: "Bugalteriya va moliya", sub: "Hisob-kitob va birja", icon: "fa-calculator", action: () => window.openDepartmentWindow && window.openDepartmentWindow('bugalteriya') },
    { title: "PU-74 Pasport jurnali", sub: "Yo'l pasporti ko'rsatkichlari", icon: "fa-passport", action: () => window.openPU74Window ? window.openPU74Window() : (window.openDepartmentWindow && window.openDepartmentWindow('bolinma1')) },
    { title: "PU-28 Yo'l holati jurnali", sub: "Yo'l holati va nuqsonlar jurnali", icon: "fa-road", action: () => window.openPU28Modal ? window.openPU28Modal() : (window.openDepartmentWindow && window.openDepartmentWindow('bolinma1')) },
    { title: "PU-29 Strelka ko'riklari", sub: "Strelka o'tkazgichlar va QR", icon: "fa-code-branch", action: () => window.openPU29Modal ? window.openPU29Modal() : (window.openDepartmentWindow && window.openDepartmentWindow('bolinma1')) },
    { title: "PU-80 Asboblar inventari", sub: "Asbob-uskunalar hisobi", icon: "fa-tools", action: () => window.openPU80Modal ? window.openPU80Modal() : (window.openDepartmentWindow && window.openDepartmentWindow('bolinma1')) },
    { title: "M-29 Materiallar chiqimi", sub: "Materiallar chiqim dalolatnomalari", icon: "fa-boxes-stacked", action: () => window.openMaterialsWindow ? window.openMaterialsWindow('bolinma1') : null },
    { title: "Defektoskopiya & AI", sub: "Nuqsonli relslar va AI tahlil", icon: "fa-microscope", action: () => window.openDefectoscopeWindow ? window.openDefectoscopeWindow() : null },
    { title: "Rahbar Vizasi", sub: "Hujjatlarni tasdiqlash", icon: "fa-file-signature", action: () => window.openRahbarVisaModal ? window.openRahbarVisaModal() : null },
    { title: "Admin Panel", sub: "Tizim va foydalanuvchilar sozlamasi", icon: "fa-user-shield", action: () => window.openAdminPanel ? window.openAdminPanel() : null },
    { title: "PCh Live Map", sub: "Poyezdlar va xodimlar xaritasi", icon: "fa-map-marked-alt", action: () => window.openPchMapModal ? window.openPchMapModal() : null }
];

window.openCommandPalette = function () {
    const modal = document.getElementById('global-command-palette');
    const input = document.getElementById('commandPaletteInput');
    if (!modal) return;

    modal.classList.add('active');
    if (input) {
        input.value = '';
        input.focus();
        window.renderCommandResults('');
    }
};

window.closeCommandPalette = function () {
    const modal = document.getElementById('global-command-palette');
    if (modal) modal.classList.remove('active');
};

window.renderCommandResults = function (query) {
    const resultsEl = document.getElementById('commandPaletteResults');
    if (!resultsEl) return;

    const q = (query || '').toLowerCase().trim();
    const filtered = window.COMMAND_ITEMS.filter(item =>
        !q || item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
        resultsEl.innerHTML = `<div style="text-align:center; color:#94a3b8; padding:20px;">Mos keluvchi bo'lim yoki jurnal topilmadi</div>`;
        return;
    }

    resultsEl.innerHTML = filtered.map((item, idx) => `
        <div class="command-item ${idx === 0 ? 'selected' : ''}" onclick="window.closeCommandPalette(); window.COMMAND_ITEMS[${window.COMMAND_ITEMS.indexOf(item)}].action()">
            <div class="command-item-left">
                <div class="command-item-icon"><i class="fas ${item.icon}"></i></div>
                <div>
                    <div class="command-item-title">${escapeHtml(item.title)}</div>
                    <div class="command-item-sub">${item.sub}</div>
                </div>
            </div>
            <i class="fas fa-chevron-right" style="color: #64748b; font-size: 0.8rem;"></i>
        </div>
    `).join('');
};

document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.openCommandPalette();
    } else if (e.key === 'Escape') {
        window.closeCommandPalette();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('commandPaletteInput');
    if (input) {
        input.addEventListener('input', function (e) {
            window.renderCommandResults(e.target.value);
        });
    }
});

// Quick template text insertion for reporting forms
window.insertReportTemplate = function (targetTextareaId, templateText) {
    const area = document.getElementById(targetTextareaId);
    if (!area) return;

    if (area.value) {
        area.value += '\n' + templateText;
    } else {
        area.value = templateText;
    }
    area.focus();
    if (window.SmartUtils && window.SmartUtils.showToast) {
        SmartUtils.showToast('Shablon matni kiritildi', 'info');
    }
};


// GLOBAL REFERENCES - Auth moduldan olingan
const defaultUsers = (window.Auth && window.Auth.roleStructure) || {};
window.subdivisionReports = window.subdivisionReports || {};
const subdivisionReports = window.subdivisionReports;

// HRM TIZIMI FUNKSIYALARI - js/core/hrm-integration.js fayliga ko'chirildi

// ============ GLOBAL DATA STORE ============
window.roadManagementData = window.roadManagementData || JSON.parse(localStorage.getItem('roadManagementData')) || {};
window.monitoringData = window.monitoringData || JSON.parse(localStorage.getItem('monitoringData')) || {};

// ============ ARTIFICIAL STRUCTURES DATA (Sun'iy inshootlar) ============
window.artificialStructuresData = []; // To be loaded from API

async function loadInfrastructureAssets() {
    try {
        const data = await SmartUtils.fetchAPI('/infrastructure/assets');
        if (data) {
            window.artificialStructuresData = data.map(item => ({
                id: item.id,
                type: item.asset_type,
                name: item.name,
                km: item.km,
                bolinma: item.bolinma_id,
                length: item.specification,
                status: 'good', // Default for now
                lat: item.lat || 0,
                lng: item.lng || 0
            }));
            console.log('Infrastructure assets loaded:', window.artificialStructuresData.length);
        }
    } catch (e) {
        console.error('Failed to load infrastructure assets:', e);
    }
}
loadInfrastructureAssets();

// ============ SOCKET.IO INITIALIZATION ============
if (typeof io !== 'undefined') {
    window.socket = window.AppSocket || window.socket || io(window.CONFIG?.WS_URL || window.location.origin, {
        auth: (cb) => cb({ token: localStorage.getItem('jwtToken') || '' })
    });


    window.socket.on('connect', () => {
        console.log('Connected to real-time server');
        // Join relevant rooms
        const user = (window.Auth && window.Auth.currentUser) || window.currentUser;
        if (user) {
            if (user.departments && user.departments.includes('dispetcher')) {
                window.socket.emit('join_room', 'dispetcher');
            }
            if (user.bolinmalar) {
                user.bolinmalar.forEach(bId => window.socket.emit('join_room', bId));
            }
        }
    });

    window.socket.on('new_report', (data) => {
        showToast(`${data.bolinma_name || data.bolinma_id} dan yangi ish rejasi keldi!`, 'info');
        // Refresh local report cache
        if (typeof loadReportsFromServer === 'function') {
            loadReportsFromServer();
        }
    });

    window.socket.on('broadcast_message', (data) => {
        showBroadcastNotification(data);
    });


} else {
    console.warn('Socket.IO client not loaded. Real-time features will be disabled.');
}

// ============ BROADCAST NOTIFICATION ============
function showBroadcastNotification(data) {
    const { title, message, priority, sender_name, created_at } = data;

    // Create container if not exists
    let container = document.getElementById('broadcast-notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'broadcast-notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 99999;
            width: 380px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(15px);
        border: 1px solid ${priority === 'urgent' ? '#ef4444' : (priority === 'important' ? '#f59e0b' : '#3b82f6')};
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
        color: white;
        pointer-events: auto;
        animation: slideInBroadcast 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
    `;

    // Glow effect for urgent
    if (priority === 'urgent') {
        toast.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.4)';
    }

    const typeLabel = priority === 'urgent' ? '🔴 TEZKOR' : (priority === 'important' ? '🟡 MUHIM' : '🔵 E\'LON');

    toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
            <div style="font-weight: 800; font-size: 0.8rem; letter-spacing: 1px;">${typeLabel}</div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 1.1rem; padding: 4px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        ${title ? `<h4 style="margin: 0 0 8px 0; font-size: 1.1rem; color: #fff; font-weight: 700;">${title}</h4>` : ''}
        <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: rgba(255,255,255,0.9);">${message}</p>
        <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: rgba(255,255,255,0.4);">
            <div><i class="fas fa-user-shield"></i> Admin: ${sender_name}</div>
            <div>${new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;

    // Add animation style if not exists
    if (!document.getElementById('broadcast-style')) {
        const style = document.createElement('style');
        style.id = 'broadcast-style';
        style.textContent = `
            @keyframes slideInBroadcast {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(toast);

    // Audio notify
    try {
        const audio = new Audio(priority === 'urgent' ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' : 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.volume = 0.4;
        audio.play();
    } catch (e) { }

    // Auto remove normal ones after 10s
    if (priority === 'normal') {
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.transform = 'translateX(120%)';
                toast.style.opacity = '0';
                toast.style.transition = 'all 0.5s ease';
                setTimeout(() => toast.remove(), 500);
            }
        }, 12000);
    }
}

// ============ RAQOBAT GRAFIKI ============
let competitionChartInstance = null;
let xSpreadsheet = null;

const bolinmaData = window.INITIAL_DATA.bolinmaData;

// Dashboard widgets initialization
function initDashboardWidgets() {
    setTimeout(() => {
        if (typeof createCompetitionChart === 'function') createCompetitionChart();
        if (typeof loadWeatherData === 'function') loadWeatherData();
    }, 500);
}

// Ma'lumotlar bazasi (LocalStorage bilan ishlaydi)
const DB_NAME = 'smart_pch_db';

// Foydalanuvchilar bazasi
let users = {};

function saveUsers() {
    localStorage.setItem('smart_pch_users', JSON.stringify(users));
}

function initUserSystem() {
    const saved = localStorage.getItem('smart_pch_users');
    if (saved) {
        users = JSON.parse(saved);
        // Ensure admin always exists (failsafe)
        if (!users.admin) {
            users.admin = defaultUsers.admin;
            saveUsers();
        }
    } else {
        // Deep copy defaultUsers
        users = JSON.parse(JSON.stringify(defaultUsers));
        saveUsers();
    }
}

initUserSystem();

// Poyezdlar ma'lumotlari
let trainsData = [...window.INITIAL_DATA.trains];

// Xodimlar (har bir bo'linmadan)
let workersData = [...window.INITIAL_DATA.workers];

// Stansiyalar (temir yo'l bekatlar)
let stationsData = [...window.INITIAL_DATA.stations];

// Poyezd yo'nalishi (stansiyalar orasida)
let trainRoutePoints = stationsData.map(s => [s.lat, s.lng]);

// LocalStorage'dan ma'lumotlarni yuklash (Server API orqali)
async function loadDataFromStorage() {
    workersData = await SmartUtils.load('smart_pch_workers', workersData);
    trainsData = await SmartUtils.load('smart_pch_trains', trainsData);
    stationsData = await SmartUtils.load('smart_pch_stations', stationsData);
    trainRoutePoints = stationsData.map(s => [s.lat, s.lng]);
}

// Ma'lumotlarni LocalStorage'ga saqlash (Server API orqali)
async function saveDataToStorage() {
    await SmartUtils.save('smart_pch_workers', workersData);
    await SmartUtils.save('smart_pch_trains', trainsData);
    await SmartUtils.save('smart_pch_stations', stationsData);
}

// Sahifa yuklanganida ma'lumotlarni yuklash
document.addEventListener('DOMContentLoaded', async () => {
    await loadDataFromStorage();
});

// Xodimlar harakat yo'llari (polylines)
let workerRoutes = {};
workersData.forEach(worker => {
    workerRoutes[worker.id] = [
        [worker.lat, worker.lng],
        [worker.lat + 0.05, worker.lng + 0.03],
        [worker.lat + 0.08, worker.lng - 0.02],
        [worker.lat + 0.12, worker.lng + 0.05]
    ];
});

// trainLiveMap, workerMarkers, trainMarkers, routePolylines declared in map-logic.js

// Bo'limlar ma'lumotlari
const departments = window.INITIAL_DATA.departments;

// Har bir bo'linma uchun ichki bo'limlar
// Generate sections data dynamically or from data.js
const sectionsData = {};
departments.forEach(dept => {
    if (dept.id !== 'dashboard') {
        sectionsData[dept.id] = [
            { id: 1, name: 'Ishlab chiqarish', icon: 'fas fa-industry', description: 'Ishlab chiqarish jarayonlari' },
            { id: 2, name: 'Xodimlar', icon: 'fas fa-users-gear', description: 'Kadrlar boshqaruvi' },
            { id: 3, name: 'Bugalteriya', icon: 'fas fa-calculator', description: 'Moliyaviy hisobotlar' },
            { id: 4, name: 'Mexanika', icon: 'fas fa-gears', description: 'Texnik xizmat ko\'rsatish' },
            { id: 5, name: 'Iqtisodiyot', icon: 'fas fa-chart-line', description: 'Iqtisodiy tahlil' },
            { id: 7, name: 'Metrologiya', icon: 'fas fa-scale-balanced', description: 'O\'lchov standartlari' },
            { id: 8, name: 'Mehnat muhofazasi', icon: 'fas fa-shield-halved', description: 'Ish xavfsizligi' },
            { id: 6, name: 'Dispetcher', icon: 'fas fa-tower-broadcast', description: 'Transport harakatini boshqarish' }
        ];
    }
});

// Dispatcher logic moved to dispatcher.js




function getReportSubmissionPanelHTML(bolinmaId) {
    const report = subdivisionReports[bolinmaId];
    const isSent = report && report.date === new Date().toLocaleDateString();

    const _u = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : (window.Auth && window.Auth.currentUser);
    const isSubUser = _u && _u.role === 'bolinma' && (_u.bolinmalar || []).includes(bolinmaId);

    if (!isSubUser) {
        return `
                                        <div class="dispatcher-control-panel">
                                            <div class="dispatcher-control-header">
                                                <i class="fas fa-info-circle"></i> Bo'linma ish rejasi (Ko'rish rejimida)
                                            </div>
                                            <div style="padding: 20px; text-align: center; background: rgba(0,0,0,0.2); border-radius: 0 0 15px 15px;">
                                                ${isSent ? `
                                                    <div style="color: #2ecc71; margin-bottom: 15px;">
                                                        <i class="fas fa-check-circle" style="font-size: 2.5rem;"></i>
                                                        <div style="margin-top: 10px; font-weight: bold; font-size: 1.1rem;">Bugungi reja yuborilgan</div>
                                                        <div style="font-size: 0.8rem; opacity: 0.6;">Yuborilgan vaqt: ${report.time}</div>
                                                    </div>
                                                    <div id="print-area-${bolinmaId}" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; font-size: 1rem; color: rgba(255,255,255,0.9); line-height: 1.6; text-align: left; border-left: 4px solid #2ecc71; margin-bottom: 10px;">
                                                        "${escapeHtml(report.text)}"
                                                    </div>
                                                    <button onclick="SmartUtils.exportToPDF('print-area-${bolinmaId}', 'Hisobot_${bolinmaId}', {title: 'KUNLIK ISH REJASI', subtitle: '${bolinmaId} - ' + new Date().toLocaleDateString()})" 
                                                            style="background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); color: #e74c3c; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                                                        <i class="fas fa-file-pdf"></i> Hisobotni PDF qilish
                                                    </button>
                                                ` : `
                                                    <div style="color: #f1c40f; padding: 20px;">
                                                        <i class="fas fa-hourglass-half" style="font-size: 2.5rem; animation: pulse 2s infinite;"></i>
                                                        <div style="margin-top: 15px; font-weight: bold; font-size: 1.1rem;">Reja hali yuborilmagan</div>
                                                        <p style="font-size: 0.85rem; opacity: 0.7; margin-top: 10px;">Bo'linma tomonidan ma'lumot kiritilishi kutilmoqda.</p>
                                                    </div>
                                                `}
                                            </div>
                                        </div>
                                    `;
    }

    return `
                                    <div class="dispatcher-control-panel" id="report-panel-${bolinmaId}">
                                        <div class="dispatcher-control-header">
                                            <i class="fas fa-file-alt"></i> Dispetcherga kunlik ish rejasini yuborish
                                        </div>
                                        <div class="dispatcher-form" style="display: ${isSent ? 'none' : 'grid'}">
                                            <div class="form-group" style="grid-column: span 2;">
                                                <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; color: rgba(255,255,255,0.6);">Bugungi ish rejasi:</label>
                                                <textarea id="report-content-input-${bolinmaId.replace(/'/g, '-')}" placeholder="Bugungi rejalashtirilgan ishlar haqida yozing..." style="width: 100%; min-height: 120px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; padding: 12px; outline: none; transition: border-color 0.3s;"></textarea>
                                            </div>
                                            <button class="send-task-btn" onclick="submitSubdivisionReport(\`${bolinmaId}\`)" style="background: linear-gradient(45deg, #2ecc71, #27ae60); border: none; padding: 12px; border-radius: 10px; color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s;">
                                                <i class="fas fa-paper-plane"></i> Yuborish
                                            </button>
                                        </div>
                                        <div class="report-sent-status" style="display: ${isSent ? 'flex' : 'none'}; flex-direction: column; align-items: center; gap: 15px; color: #2ecc71; padding: 20px; background: rgba(46, 204, 113, 0.05); border-radius: 0 0 15px 15px;">
                                            <div style="display: flex; align-items: center; gap: 10px; font-weight: bold;">
                                                <i class="fas fa-check-double"></i> Bugungi hisobot dispetcherga yuborildi.
                                            </div>
                                            <div style="display: flex; gap: 10px;">
                                                <button class="control-btn" style="padding: 8px 15px; font-size: 0.8rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px;" onclick="editSubdivisionReport(\`${bolinmaId}\`)">Tahrirlash</button>
                                                <button class="control-btn" style="padding: 8px 15px; font-size: 0.8rem; background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); color: #e74c3c; border-radius: 8px;" onclick="SmartUtils.exportToPDF(\`print-area-${bolinmaId}\`, \`Hisobot_${bolinmaId}\`, {title: 'KUNLIK ISH REJASI', subtitle: \`${bolinmaId} - \` + new Date().toLocaleDateString()})">
                                                    <i class="fas fa-file-pdf"></i> PDF Yuklash
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `;
}

async function submitSubdivisionReport(bolinmaId) {
    const input = document.getElementById(`report-content-input-${bolinmaId.replace(/'/g, '-')}`);
    const content = input.value.trim();

    if (!content) {
        showToast('Iltimos, ish rejasini kiriting!', 'warning');
        return;
    }

    try {
        const result = await SmartUtils.fetchAPI('/reports', {
            method: 'POST',
            body: JSON.stringify({
                bolinma_id: bolinmaId,
                content: content,
                user_id: (window.currentUser && window.currentUser.id) || (window.Auth && window.Auth.currentUser && window.Auth.currentUser.id)
            })
        });

        if (result) {
            // Update local state for immediate UI feedback
            subdivisionReports[bolinmaId] = {
                text: content,
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'received'
            };

            // Notify via Socket if available
            if (window.socket) {
                window.socket.emit('send_report', {
                    bolinma_id: bolinmaId,
                    bolinma_name: subdivisions.find(s => s.id === bolinmaId)?.name || bolinmaId,
                    content: content,
                    time: subdivisionReports[bolinmaId].time
                });
            }

            showToast("Ish rejasi dispetcherga muvaffaqiyatli yuborildi!", 'success');

            // Refresh current window view
            const panel = document.getElementById(`report-panel-${bolinmaId}`);
            if (panel) {
                panel.querySelector('.dispatcher-form').style.display = 'none';
                panel.querySelector('.report-sent-status').style.display = 'flex';
                // Update text in print area
                const printArea = document.getElementById(`print-area-${bolinmaId}`);
                if (printArea) printArea.innerText = content;
                startConfetti();
            }
        }
    } catch (error) {
        showToast('Hisobotni yuborishda xatolik: ' + error.message, 'error');
    }
}

async function loadReportsFromServer() {
    try {
        const reports = await SmartUtils.fetchAPI('/reports/today');
        if (reports) {
            reports.forEach(r => {
                subdivisionReports[r.bolinma_id] = {
                    text: r.content,
                    time: r.time,
                    date: r.date,
                    status: 'received'
                };
            });
            // Update UI if on dispatcher dashboard
            if (currentUser.departments.includes('dispetcher')) {
                updateDispatcherDashboardUI();
            }
        }
    } catch (error) {
        console.error('Reports load failed:', error);
    }
}

// Partial UI update for dispatcher dashboard without full re-render
function updateDispatcherDashboardUI() {
    const reports = subdivisionReports || {};
    const totalSub = (window.subdivisions || []).length;
    const todayStr = new Date().toLocaleDateString();
    const sentCount = Object.keys(reports).filter(id => reports[id].date === todayStr).length;
    const pendingCount = totalSub - sentCount;

    // Update counts if elements exist
    const sentCountEl = document.getElementById('disp-sent-count');
    const pendingCountEl = document.getElementById('disp-pending-count');
    if (sentCountEl) sentCountEl.textContent = sentCount;
    if (pendingCountEl) pendingCountEl.textContent = pendingCount;

    // If we're already rendering the grid, we might need a full refresh if new reports content changed significantly,
    // but for now, updating counts is the priority to stop the 'flicker' loop.
}

function getDispatcherDashboardHTML() {
    // Security check: Only allow Dispatcher or Admin
    if (!currentUser || (!currentUser.departments.includes('dispetcher') && currentUser.role !== 'admin')) {
        return '';
    }

    const totalSub = subdivisions.length;
    const reports = subdivisionReports || {};
    const sentCount = Object.keys(reports).filter(id => reports[id].date === new Date().toLocaleDateString()).length;
    const pendingCount = totalSub - sentCount;

    return `
                                    <div class="dispatcher-dashboard" style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(25px); border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.2); padding: 30px; margin-bottom: 25px; box-shadow: 0 15px 45px rgba(31, 38, 135, 0.05);">
                                        <!-- Dashboard Header -->
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid rgba(31, 38, 135, 0.1); padding-bottom: 20px;">
                                            <div>
                                                <h2 style="margin: 0; font-size: 2rem; background: linear-gradient(45deg, #1e3a8a, #2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; display: flex; align-items: center; gap: 15px;">
                                                    <i class="fas fa-satellite-dish"></i> Markaziy Dispetcher Nazorati
                                                </h2>
                                                <div style="display: flex; align-items: center; gap: 15px; margin-top: 8px;">
                                                    <span style="font-size: 0.9rem; color: #475569; font-weight: 600;">
                                                        <i class="far fa-calendar-alt"></i> ${new Date().toLocaleDateString()}
                                                    </span>
                                                    <span class="pulse-badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.5px;">
                                                        <i class="fas fa-circle" style="font-size: 0.5rem; vertical-align: middle; margin-right: 5px;"></i> LIVE TRACKING
                                                    </span>
                                                </div>
                                            </div>

                                            <div style="display: flex; gap: 20px;">
                                                <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.1); padding: 12px 20px; border-radius: 18px; min-width: 140px; text-align: center;">
                                                    <div style="color: #059669; font-size: 0.8rem; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Qabul qilindi</div>
                                                    <div id="disp-sent-count" style="color: #1e3a8a; font-size: 1.8rem; font-weight: 900;">${sentCount}</div>
                                                </div>
                                                <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.1); padding: 12px 20px; border-radius: 18px; min-width: 140px; text-align: center;">
                                                    <div style="color: #d97706; font-size: 0.8rem; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Kutilmoqda</div>
                                                    <div id="disp-pending-count" style="color: #1e3a8a; font-size: 1.8rem; font-weight: 900;">${pendingCount}</div>
                                                </div>
                                                <button onclick="openHistoryModal()" style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.1); padding: 0 25px; border-radius: 18px; cursor: pointer; color: #1e40af; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                                    <i class="fas fa-history" style="font-size: 1.3rem; margin-bottom: 4px;"></i>
                                                    <span style="font-size: 0.8rem; font-weight: 800;">Tarix</span>
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Reports Grid -->
                                        <div class="reports-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px;">
                                            ${subdivisions.map(s => {
        const report = reports[s.id];
        const isSent = report && report.date === new Date().toLocaleDateString();

        return `
                                    <div class="report-card" onclick="openAdminSubdivisionView('${s.id}')" style="background: rgba(255,255,255,0.6); border: 1px solid ${isSent ? 'rgba(16, 185, 129, 0.2)' : 'rgba(31, 38, 135, 0.05)'}; border-radius: 20px; padding: 25px; position: relative; transition: all 0.3s var(--transition); cursor: pointer; box-shadow: 0 8px 25px rgba(31, 38, 135, 0.03);">
                                                        ${isSent ? `
                                                            <div style="position: absolute; top: -12px; right: 25px; background: #10b981; color: white; padding: 5px 15px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);">
                                                                <i class="fas fa-check-double"></i> QABUL QILINDI
                                                            </div>
                                                        ` : ''}

                                                        <div style="display: flex; gap: 15px; align-items: flex-start; margin-bottom: 20px;">
                                                            <div style="width: 55px; height: 55px; border-radius: 16px; background: ${isSent ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(31, 38, 135, 0.05)'}; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; color: ${isSent ? 'white' : '#94a3b8'};">
                                                                <i class="fas fa-hard-hat"></i>
                                                            </div>
                                                            <div style="flex: 1;">
                                                                <h4 style="margin: 0; font-size: 1.2rem; color: #1e3a8a; font-weight: 800;">${escapeHtml(s.name)}</h4>
                                                                <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                                                                    <i class="fas fa-user-tie" style="font-size: 0.8rem; color: #64748b;"></i>
                                                                    <span style="font-size: 0.85rem; color: #475569; font-weight: 600;">${s.manager || 'Ma\'sul xodim'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style="background: rgba(255, 255, 255, 0.8); border-radius: 15px; padding: 20px; border-left: 4px solid ${isSent ? '#10b981' : 'rgba(31, 38, 135, 0.1)'}; min-height: 100px; box-shadow: inset 0 2px 8px rgba(31, 38, 135, 0.02);">
                                                            <div style="font-size: 1rem; line-height: 1.7; color: ${isSent ? '#1e293b' : '#94a3b8'}; font-weight: 500; font-style: ${isSent ? 'normal' : 'italic'};">
                                                                ${isSent ? report.text : 'Ushbu bo\'linma tomonidan hali ish rejasi taqdim etilmadi...'}
                                                            </div>
                                                        </div>

                                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 22px;">
                                                            <div style="font-size: 0.8rem; color: #64748b; font-weight: 600;">
                                                                <i class="far fa-clock"></i> ${isSent ? report.time : '--:--'}
                                                            </div>
                                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                                <button onclick="openTrainScheduleModal('${s.id}', event)" style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.2); color: #2563eb; padding: 6px 14px; border-radius: 10px; cursor: pointer; font-size: 0.8rem; font-weight: 700; transition: all 0.2s;" onmouseover="this.style.background='rgba(37,99,235,0.15)', this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(37,99,235,0.08)', this.style.transform='none'">
                                                                    <i class="fas fa-train"></i> Poyezdlar
                                                                </button>
                                                                <div style="font-size: 0.75rem; font-weight: 800; color: ${isSent ? '#10b981' : '#d97706'}; text-transform: uppercase; letter-spacing: 0.8px;">
                                                                    ${isSent ? 'MA\'LUMOT JOVIDA' : 'KUTILMOQDA'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
    }).join('')}
                                        </div>
                                    </div>
                                `;
}

// --- SMART SUBDIVISION DASHBOARD START ---
function getSmartSubdivisionDashboardHTML(user) {
    const bolinmaId = user.bolinmalar && user.bolinmalar[0] ? user.bolinmalar[0] : 'Bo\'linma';
    const bolinmaName = typeof window.getBolinmaName === 'function' ? window.getBolinmaName(bolinmaId) : bolinmaId;

    return `
        <style>
            .smart-dashboard-container {
                padding: 20px;
                font-family: 'Inter', sans-serif;
                color: #f1f5f9;
                max-width: 1600px;
                margin: 0 auto;
            }

            /* Premium Hero Section */
            .dashboard-hero {
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9)), 
                            url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=2000&auto=format&fit=crop');
                background-size: cover;
                background-position: center;
                border-radius: 24px;
                padding: 40px;
                margin-bottom: 30px;
                border: 1px solid rgba(212, 175, 55, 0.3);
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                position: relative;
                overflow: hidden;
            }
            .dashboard-hero::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.15), transparent 50%);
            }

            .hero-content {
                position: relative;
                z-index: 2;
            }
            .hero-welcome {
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 3px;
                color: #ffd700;
                font-weight: 700;
                margin-bottom: 10px;
            }
            .hero-title {
                font-size: 2.8rem;
                font-weight: 800;
                margin: 0;
                background: linear-gradient(to right, #fff, #94a3b8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            /* Status Orbs */
            .status-orbs-container {
                display: flex;
                gap: 20px;
                margin-top: 30px;
            }
            .status-orb {
                background: rgba(255,255,255,0.05);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                padding: 15px 25px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: transform 0.3s;
            }
            .status-orb:hover { transform: translateY(-5px); }
            .orb-icon {
                width: 45px; height: 45px;
                border-radius: 12px;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.2rem;
            }

            /* Main Grid */
            .dashboard-main-grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 25px;
            }

            /* Glass Cards */
            .glass-card {
                background: rgba(30, 41, 59, 0.6);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 20px;
                padding: 25px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                height: 100%;
            }
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .card-title {
                font-size: 1.1rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            /* Pulsing Light */
            .pulse-light {
                width: 8px; height: 8px;
                border-radius: 50%;
                display: inline-block;
                margin-right: 8px;
            }
            .pulse-green { background: #10b981; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite; }
            .pulse-red { background: #ef4444; box-shadow: 0 0 10px #ef4444; animation: pulse 1.5s infinite; }

            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }

            /* Custom List Styles */
            .record-item {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.05);
                padding: 15px;
                border-radius: 12px;
                margin-bottom: 12px;
                transition: 0.2s;
            }
            .record-item:hover { background: rgba(255,255,255,0.07); border-color: rgba(212, 175, 55, 0.3); }

            /* Premium AI Button */
            .ai-floating-btn {
                position: fixed; bottom: 30px; right: 30px;
                width: 65px; height: 65px; border-radius: 50%;
                background: linear-gradient(135deg, #38bdf8, #2563eb);
                color: #fff; display: flex; align-items: center; justify-content: center;
                font-size: 1.8rem; cursor: pointer; z-index: 10000;
                box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);
                border: 2px solid rgba(255,255,255,0.2);
                transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .ai-floating-btn:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 0 40px rgba(56, 189, 248, 0.6); }
            
            #aiChatWindow { 
                position: fixed; bottom: 110px; right: 30px; width: 380px; height: 500px;
                background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(30px);
                border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 30px 60px rgba(0,0,0,0.4);
                display: none; flex-direction: column; overflow: hidden; z-index: 9999;
                transform: translateY(20px); transition: 0.3s; opacity: 0;
            }
            #aiChatWindow.active { display: flex; transform: translateY(0); opacity: 1; }

            .department-dashboard-area { margin-top: 35px; min-height: 400px; }
        </style>

        <div class="smart-dashboard-container">
            
            <!-- HERO HEADER -->
            <div class="dashboard-hero">
                <div class="hero-content">
                    <div class="hero-welcome">SMART PCH BOSHQRUV MARKAZI</div>
                    <h1 class="hero-title">${bolinmaName} Profili</h1>
                    
                    <div class="hero-actions" style="margin-top: 20px; margin-bottom: 25px; display: flex; gap: 15px; flex-wrap: wrap;">
                        <button onclick="window.renderReportingSystem && window.renderReportingSystem('mainContent', '${bolinmaId}')" class="gold-btn" 
                            style="padding: 12px 24px; border-radius: 14px; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3); background: var(--gold-gradient); color: #000; border: none; cursor: pointer;">
                            <i class="fas fa-book-open"></i> DISPETCHER JURNALI
                        </button>
                        <button onclick="window.openTimesheet && window.openTimesheet('${bolinmaId}')" class="glass-btn" 
                            style="padding: 12px 24px; border-radius: 14px; font-size: 0.95rem; font-weight: 600; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <i class="fas fa-calendar-alt"></i> ELEKTRON TABEL
                        </button>
                        <button onclick="window.openProductionDashboard && window.openProductionDashboard('${bolinmaId}')" class="glass-btn" 
                            style="padding: 12px 24px; border-radius: 14px; font-size: 0.95rem; font-weight: 600; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); color: #38bdf8; display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <i class="fas fa-industry"></i> ISHLAB CHIQARISH
                        </button>
                        <button onclick="window.openPU80Window && window.openPU80Window('${bolinmaId}')" class="glass-btn" 
                            style="padding: 12px 24px; border-radius: 14px; font-size: 0.95rem; font-weight: 600; background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.2); color: #60a5fa; display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <i class="fas fa-tools"></i> PU-80
                        </button>
                    </div>

                    <div class="status-orbs-container">
                        <div class="status-orb">
                            <div class="orb-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div>
                                <div style="font-size: 0.75rem; color: #94a3b8;">Xavfsizlik Statusi</div>
                                <div style="font-weight: 700;"><span class="pulse-light pulse-green"></span>NORMAL</div>
                            </div>
                        </div>
                        <div class="status-orb">
                            <div class="orb-icon" style="background: rgba(56, 189, 248, 0.1); color: #38bdf8;">
                                <i class="fas fa-temperature-low"></i>
                            </div>
                            <div>
                                <div style="font-size: 0.75rem; color: #94a3b8;">Rels Harorati</div>
                                <div style="font-weight: 700;" id="dash-rail-temp">+32°C</div>
                            </div>
                        </div>
                        <div class="status-orb">
                            <div class="orb-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
                                <i class="fas fa-cloud-sun"></i>
                            </div>
                            <div>
                                <div style="font-size: 0.75rem; color: #94a3b8;" id="dash-weather-city">Buxoro (Havo)</div>
                                <div style="font-weight: 700;" id="dash-weather-temp">+28°C</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MAIN DASHBOARD CONTENT -->
            <div class="dashboard-main-grid">
                
                <!-- LEFT COLUMN: Operational Tasks & Rail Traffic -->
                <div style="display: flex; flex-direction: column; gap: 25px;">
                    
                    <!-- Rail Traffic Monitor -->
                    <div class="glass-card">
                        <div class="card-header">
                            <div class="card-title"><i class="fas fa-train" style="color: #10b981;"></i> POYEZDLAR QATNOVI (LIVE)</div>
                            <span style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 12px; border-radius: 20px;">
                                <i class="fas fa-broadcast-tower"></i> GPS AKTIV
                            </span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="record-item" style="border-left: 4px solid #10b981;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="font-weight: 700; color: #38bdf8;">№ 345 (YUK)</span>
                                    <span style="font-size: 0.8rem; color: #94a3b8;">12 daq qoldi</span>
                                </div>
                                <div style="font-size: 0.85rem; margin-top: 5px; color: #cbd5e1;">Buxoro - PK 140 yo'nalishi</div>
                            </div>
                            <div class="record-item" style="border-left: 4px solid #f59e0b;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="font-weight: 700; color: #f59e0b;">№ 007 (AFROSIYOB)</span>
                                    <span style="font-size: 0.8rem; color: #94a3b8;">Kutish: 45 daq</span>
                                </div>
                                <div style="font-size: 0.85rem; margin-top: 5px; color: #cbd5e1;">O'tish stansiyasi: Kogon</div>
                            </div>
                        </div>
                    </div>

                    <!-- Task Kanban -->
                    <div class="glass-card">
                        <div class="card-header">
                            <div class="card-title"><i class="fas fa-tasks" style="color: #60a5fa;"></i> KUNLIK VAZIFALAR</div>
                            <span id="dash-tasks-count" style="font-size: 0.8rem; color: #60a5fa;">0 TA FAOL</span>
                        </div>
                        <div id="dash-tasks-list">
                            <div style="text-align: center; padding: 20px; color: #94a3b8;">
                                <i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...
                            </div>
                        </div>
                    </div>

                </div>

                <!-- RIGHT COLUMN: Reports & Telegrams -->
                <div style="display: flex; flex-direction: column; gap: 25px;">
                    
                    <!-- Telegrams Widget -->
                    <div class="glass-card" style="border: 1px solid rgba(239, 68, 68, 0.2);">
                        <div class="card-header">
                            <div class="card-title" style="color: #ef4444;"><i class="fas fa-bolt"></i> SHOSHILINCH XABARLAR</div>
                            <span id="dash-tele-count" class="pulse-light pulse-red"></span>
                        </div>
                        <div id="dash-tele-list">
                            <div style="text-align: center; padding: 10px; color: #94a3b8;">Telegrammalar yo'q</div>
                        </div>
                    </div>

                    <!-- Quick Tools & Journals -->
                    <div class="glass-card">
                        <div class="card-title" style="margin-bottom: 15px;"><i class="fas fa-book-open"></i> JURNALLAR</div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div onclick="window.SmartRouting.navigate('/pu28')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-file-alt" style="color: #ffd700;"></i>
                                    <span>PU-28</span>
                                </div>
                                <span id="dash-pu28-status" style="font-size: 0.75rem; color: #94a3b8;">Kutilmoqda</span>
                            </div>
                            <div onclick="window.SmartRouting.navigate('/pu80')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-tools" style="color: #60a5fa;"></i>
                                    <span>PU-80 (Inventar)</span>
                                </div>
                                <i class="fas fa-chevron-right" style="font-size: 0.8rem; color: #475569;"></i>
                            </div>
                        </div>
                        <button onclick="window.SmartRouting.navigate('/reports')" style="width: 100%; margin-top: 20px; background: linear-gradient(135deg, #ffd700, #b4941f); color: #000; border: none; padding: 12px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                            <i class="fas fa-paper-plane"></i> RAPORT YUBORISH
                        </button>
                    </div>

                    <!-- Attendance Summary -->
                    <div class="glass-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(46, 204, 113, 0.05));">
                        <div class="card-title"><i class="fas fa-user-check" style="color: #2ecc71;"></i> DAVOMAT STATUSI</div>
                        <div id="dash-attendance-summary" style="margin-top: 15px; text-align: center;">
                           <div style="font-size: 2.2rem; font-weight: 800; color: #2ecc71;" id="dash-att-percent">0%</div>
                           <div style="font-size: 0.8rem; color: #94a3b8;">Xodimlar hozirda ishda</div>
                           <button onclick="window.StaffAttendance && window.StaffAttendance.openWidget()" style="background: none; border: 1px solid rgba(46, 204, 113, 0.3); color: #2ecc71; margin-top: 10px; padding: 5px 15px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">Batafsil</button>
                        </div>
                    </div>

                </div>

            </div>

            <!-- STAFF WIDGET TARGET -->
            <div id="staff-attendance-widget-container" style="margin-top: 30px;"></div>

            <!-- DEPARTMENT SPECIFIC DASHBOARD -->
            <div id="department-dashboard-container" class="department-dashboard-area">
                <!-- Specialized content (Metrology, HR, Mechanics) will be injected here -->
                <div style="text-align: center; padding: 50px; opacity: 0.5;">
                    <i class="fas fa-layer-group fa-3x" style="margin-bottom: 15px;"></i>
                    <p>Bo'limga oid qo'shimcha tahlillar yuklanmoqda...</p>
                </div>
            </div>

            <!-- GLOBAL AI ASSISTANT -->
            <div id="aiAssistantBtn" class="ai-floating-btn" title="Smart AI Yordamchi">
                <i class="fas fa-robot"></i>
                <div style="position: absolute; top: 0; right: 0; width: 15px; height: 15px; background: #ef4444; border-radius: 50%; border: 3px solid #0f172a;"></div>
            </div>

            <div id="aiChatWindow">
                <div style="padding: 20px; background: linear-gradient(90deg, #3b82f6, #1d4ed8); display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-robot"></i>
                        <span style="font-weight: 800; font-size: 0.9rem;">SMART AI ASSISTANT</span>
                    </div>
                    <i class="fas fa-times" id="closeAiChat" style="cursor: pointer;"></i>
                </div>
                <div id="aiMessages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px;">
                    <div class="message bot">
                        <div class="message-content" style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; font-size: 0.85rem;">
                            Assalomu alaykum! Men PCH tizimi bo'yicha sizga yordam beruvchi AI assistentman. Qanday savollaringiz bor?
                        </div>
                    </div>
                </div>
                <div style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 10px;">
                    <input type="text" id="aiInput" placeholder="Savollingizni yozing..." 
                           style="flex: 1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px; color: #fff;">
                    <button id="sendAiMsg" style="background: #3b82f6; border: none; color: white; width: 40px; border-radius: 10px; cursor: pointer;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Global helper functions for inline calls
window.allowDrop = function (ev) {
    ev.preventDefault();
}

window.drop = async function (ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    if (draggedElement) {
        var target = ev.target;
        // Need to find the closest column if dropped on a child
        while (target && !target.classList.contains('kanban-col')) {
            target = target.parentElement;
        }
        if (target) {
            const newStatus = target.id.replace('col-', '');
            const taskId = draggedElement.id.split('-').pop();

            try {
                await SmartUtils.fetchAPI(`/tasks/${taskId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newStatus })
                });
                target.appendChild(draggedElement);
                showToast('Vazifa holati yangilandi', 'success');
            } catch (error) {
                showToast('Holatni yangilashda xatolik: ' + error.message, 'error');
            }
        }
    }
}

// Persisting map defects
// Persisting map defects
window.addDefectPrompt = function () {
    const range = getPKRange();
    const pk = prompt(`PK raqamini kiriting (${range.start}-${range.end} oralig'ida):`, Math.floor((range.start + range.end) / 2));
    if (!pk) return;
    const issue = prompt("Nuqson nomini kiriting:", "Bolt bo'shashi");
    if (!issue) return;

    addDefectToMap(pk, issue);
}

window.refreshMap = function () {
    renderMapDefects();
    showToast('Xarita yangilandi', 'success');
}

window.editPKRange = function () {
    const current = getPKRange();
    const newStart = prompt("Boshlanish PK raqamini kiriting:", current.start);
    if (!newStart) return;
    const newEnd = prompt("Tugash PK raqamini kiriting:", current.end);
    if (!newEnd) return;

    const range = { start: parseInt(newStart), end: parseInt(newEnd) };
    localStorage.setItem(getDataKeys().PK_RANGE, JSON.stringify(range));
    renderPKRange(); // Update UI
    renderMapDefects(); // Re-render map with new scale
}

window.addNewTask = async function (columnId) {
    const title = prompt("Vazifa nomini kiriting:");
    if (!title) return;
    const deadline = prompt("Muddatni kiriting (Masalan: 18:00):", "18:00");

    const bolinmaId = currentUser.bolinmalar ? currentUser.bolinmalar[0] : null;
    if (!bolinmaId) return;

    try {
        const result = await SmartUtils.fetchAPI('/tasks', {
            method: 'POST',
            body: JSON.stringify({
                bolinma_id: bolinmaId,
                user_id: currentUser.id,
                title: title,
                deadline: deadline || '18:00',
                status: columnId,
                is_urgent: false
            })
        });

        if (result) {
            renderTask({
                id: result.id,
                title: title,
                deadline: deadline || '18:00',
                column: columnId,
                urgent: false
            });
            showToast('Yangi vazifa qo\'shildi', 'success');
        }
    } catch (error) {
        showToast('Vazifa qo\'shishda xatolik: ' + error.message, 'error');
    }
}


// Helper to map ID to Name (e.g. bolinma1 -> 1-bo'linma)
window.getBolinmaName = (id) => {
    if (!id) return id;
    if (!window.INITIAL_DATA || !window.INITIAL_DATA.departments) return id;
    const dept = window.INITIAL_DATA.departments.find(d => d.id === id);
    return dept ? dept.name : id;
};

function initSubdivisionFeatures(idArg) {
    console.log("Initializing Subdivision Features...", idArg);
    const bolinmaIdRaw = idArg || window.viewingSubdivisionId || (window.currentUser && (window.currentUser.bolinma_id || (window.currentUser.bolinmalar && window.currentUser.bolinmalar[0])));

    const bolinmaId = bolinmaIdRaw; // Task/Telegram APIs use IDs
    const bolinmaName = window.getBolinmaName(bolinmaIdRaw); // Employee lists use names

    // 0. Render PK Range
    if (typeof renderPKRange === 'function') renderPKRange();

    // 1. Load and Render Tasks / Kanban
    if (typeof loadTasks === 'function') loadTasks();
    if (typeof initKanban === 'function') initKanban();

    // 2. Load and Render Map / Radar
    if (typeof renderMapDefects === 'function') renderMapDefects();
    if (typeof initTrainRadar === 'function') initTrainRadar();

    // 3. Render Homepage Monitoring Cards
    if (typeof renderHomepageMonitoring === 'function') renderHomepageMonitoring();

    // 4. External Data
    if (typeof loadWeatherData === 'function') loadWeatherData();
    if (typeof loadNews === 'function') loadNews();
    if (typeof createCompetitionChart === 'function') createCompetitionChart();

    // 5. Staff Attendance Widget for "Control Room"
    if (typeof renderStaffAttendanceWidget === 'function') {
        // Pass both ID and Name to be safe, but mostly Name is needed for filtering names in employees
        renderStaffAttendanceWidget(bolinmaName || bolinmaId);
    }

    // 6. Show Defectoscope Button
    const defectBtn = document.getElementById('openDefectoscopeBtn');
    if (defectBtn) {
        defectBtn.style.display = 'flex';
    }

    // 6.5 Initialize Department-Specific Dashboard
    (async () => {
        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const roles = (currentUser.role || '').toLowerCase();

        const deptContainer = document.getElementById('department-dashboard-container');
        if (deptContainer) {
            // Check if current user is Metrology or looking at a Metrology subunit
            if (roles.includes('metrology') || roles.includes('admin')) {
                if (typeof window.renderMetrologySection === 'function') {
                    deptContainer.innerHTML = '<div class="metrology-dashboard-container"></div>';
                    await window.initMetrologyData();
                    window.renderMetrologySection(deptContainer, bolinmaId);
                }
            } else if (roles.includes('hr') || roles.includes('personnel')) {
                if (typeof window.renderHRDashboard === 'function') {
                    window.renderHRDashboard(deptContainer, bolinmaId);
                }
            } else if (roles.includes('safety')) {
                if (typeof window.renderSafetyDashboard === 'function') {
                    window.renderSafetyDashboard(deptContainer, bolinmaId);
                }
            }
        }

        // Initialize AI Assistant UI listeners
        if (typeof window.initAiAssistant === 'function') {
            window.initAiAssistant();
        }
    })();

    // 7. Dashboard Data Fetching (Weather, Tasks, Telegrams)
    if (bolinmaId) {
        (async () => {
            try {
                // Weather
                const weatherRes = await fetch('/api/weather?lat=39.7681&lon=64.4556');
                if (weatherRes.ok) {
                    const wData = await weatherRes.json();
                    if (document.getElementById('dash-weather-temp')) document.getElementById('dash-weather-temp').innerText = '+' + Math.round(wData.main.temp) + '°C';
                    if (document.getElementById('dash-weather-city')) document.getElementById('dash-weather-city').innerText = 'Buxoro (' + wData.weather[0].description + ')';
                }

                // Inline Tasks for Dashboard
                const tasks = await SmartUtils.fetchAPI('/tasks/' + bolinmaId) || [];
                const activeTasks = tasks.filter(t => t.status !== 'done');
                const tasksCountEl = document.getElementById('dash-tasks-count');
                if (tasksCountEl) tasksCountEl.innerText = activeTasks.length + ' TA FAOL';

                const tasksListEl = document.getElementById('dash-tasks-list');
                if (tasksListEl) {
                    let tasksHtml = activeTasks.length > 0 ? '' : '<div style="color: #94a3b8; text-align: center; padding: 10px;">Vazifalar yo\'q</div>';
                    activeTasks.slice(0, 3).forEach(t => {
                        tasksHtml += `
                            <div class="record-item" style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 700;">${escapeHtml(t.title)}</div>
                                    <div style="font-size: 0.75rem; color: #94a3b8;">${t.deadline || 'Bugun'}</div>
                                </div>
                                <i class="fas fa-chevron-right" style="color: #475569;"></i>
                            </div>
                         `;
                    });
                    tasksListEl.innerHTML = tasksHtml;
                }

                // Telegrams (Broadcasts)
                const broadcasts = await SmartUtils.fetchAPI('/broadcast') || [];
                const myBroadcasts = broadcasts.filter(b => b.target === 'all' || b.target === bolinmaId);
                const teleCountEl = document.getElementById('dash-tele-count');
                if (teleCountEl) teleCountEl.innerText = myBroadcasts.length;

                const teleListEl = document.getElementById('dash-tele-list');
                if (teleListEl && myBroadcasts.length > 0) {
                    const b = myBroadcasts[0];
                    teleListEl.innerHTML = `
                        <div style="background: rgba(239, 68, 68, 0.1); border-radius: 12px; padding: 15px; border: 1px solid rgba(239, 68, 68, 0.2);">
                            <div style="color: #ef4444; font-weight: 800; font-size: 0.85rem; margin-bottom: 5px;">${escapeHtml(b.title)}</div>
                            <div style="font-size: 0.9rem; line-height: 1.4;">${escapeHtml(b.message)}</div>
                            <button onclick="SmartUtils.showToast('Imzolandi', 'success')" style="width: 100%; margin-top: 10px; background: #ef4444; border: none; padding: 8px; border-radius: 8px; font-weight: bold; color: white; cursor: pointer;">TANISHDIM</button>
                        </div>
                     `;
                }

                // Attendance Stats
                (async () => {
                    await window.initHRData();
                    const hrStats = window.getHRStats ? window.getHRStats(bolinmaId) : null;

                    if (hrStats) {
                        const attPercentEl = document.getElementById('dash-att-percent');
                        if (attPercentEl) {
                            attPercentEl.innerText = hrStats.attendance.percent + '%';
                            // Dynamic color based on performance
                            if (hrStats.attendance.percent < 80) attPercentEl.style.color = '#ef4444';
                            else if (hrStats.attendance.percent < 90) attPercentEl.style.color = '#f59e0b';
                            else attPercentEl.style.color = '#10b981';
                        }

                        // Show birthday notification if any
                        if (hrStats.birthdaysThisWeek > 0) {
                            const teleListEl = document.getElementById('dash-tele-list');
                            if (teleListEl && !teleListEl.innerHTML.includes('fa-birthday-cake')) {
                                const bdayNames = hrStats.birthdayEmployees.map(e => e.name).join(', ');
                                const bdayDiv = document.createElement('div');
                                bdayDiv.style.cssText = 'background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 15px; border: 1px solid rgba(139, 92, 246, 0.2); margin-top: 10px;';
                                bdayDiv.innerHTML = `
                                    <div style="color: #8b5cf6; font-weight: 800; font-size: 0.85rem; margin-bottom: 5px;">
                                        <i class="fas fa-birthday-cake"></i> TUG'ILGAN KUNLAR
                                    </div>
                                    <div style="font-size: 0.85rem; opacity: 0.9;">Bu hafta: ${bdayNames}</div>
                                 `;
                                teleListEl.appendChild(bdayDiv);
                            }
                        }
                    }
                })();
            } catch (e) {
                console.error('Subdivision Data Init Error:', e);
            }
        })();
    }

    // 8. Countdown — Oylik hisobot muddati
    if (typeof updateCountdown === 'undefined') {
        window.updateCountdown = function () {
            const now = new Date();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            const distance = endOfMonth - now;
            if (distance < 0) return;
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const dEl = document.getElementById('cnt-days');
            const hEl = document.getElementById('cnt-hours');
            const mEl = document.getElementById('cnt-minutes');
            if (dEl) dEl.innerText = String(days).padStart(2, '0');
            if (hEl) hEl.innerText = String(hours).padStart(2, '0');
            if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
        };
        updateCountdown();
        setInterval(updateCountdown, 60000);
    }

    // 9. Smart Tavsiya (dinamik)
    updateSmartAdvice();
}
window.initSubdivisionFeatures = initSubdivisionFeatures;

// Dinamik Smart Tavsiya generatori
function updateSmartAdvice() {
    const el = document.getElementById('smart-advice-text');
    if (!el) return;

    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth(); // 0-11

    let advices = [];

    // Fasl bo'yicha tavsiyalar
    if (month >= 5 && month <= 8) { // Yoz: iyun-sentyabr
        advices.push('🌡️ <strong>Yozgi ogohlantirish:</strong> Havo harorati yuqori. Rels harorati 50°C dan oshmasligi uchun 12:00–16:00 oralig\'ida tezlikni kamaytiring va haroratni o\'lchash jurnalini yuritish majburiy.');
        advices.push('💧 <strong>Yozgi nazorat:</strong> Rels kengayishi kuzatilishi lozim. Geometrik o\'lchovlarni kundalik rejada bajarishni unutmang.');
    } else if (month >= 11 || month <= 1) { // Qish: dekabr-fevral
        advices.push('❄️ <strong>Qishki ogohlantirish:</strong> Past harorat relslarda sinish xavfini oshiradi. Rel birikmalari va strelkalar har kuni tekshirilsin. Strelka isitish moslamalari faolligi nazorat qilinsin.');
        advices.push('🌨️ <strong>Qorli havo:</strong> Yo\'llarni qordan tozalash dasturini kechiktirmang. Strelkalar o\'tkazuvchanligi tekshirilsin.');
    } else if (month >= 2 && month <= 4) { // Bahor: mart-may
        advices.push('🌸 <strong>Bahorgi nazorat:</strong> Qor erishi natijasida yer cho\'kishi va yon bag\'ir harakati kuzatilishi mumkin. Gidrologik nuqtalarni kuchaytiring.');
        advices.push('🔧 <strong>Bahorgi TA:</strong> Rels va balast holati bahorgi tekshiruvdan o\'tkazilsin. Geometrik o\'lchov rejasini bajaring.');
    } else { // Kuz: oktyabr-noyabr
        advices.push('🍂 <strong>Kuzgi nazorat:</strong> Barglar yo\'lda siqilmasligini nazorat qiling. Tormozlash masofasi uzayishi mumkin. Signalizatsiya tizimlarini tekshiring.');
        advices.push('🌧️ <strong>Yomg\'irli mavsim:</strong> Namlik tufayli to\'siqlar va ko\'priklar holati kuzatilsin. Vodootvedenie tizimini tozalang.');
    }

    // Kun vaqti bo'yicha tavsiya
    if (hour >= 6 && hour < 12) {
        advices.push('🌅 <strong>Ertalabki vazifa:</strong> Navbat boshida yo\'l holatini vizyual tekshiring. Strelka va signalizatsiya ishini tekshiring.');
    } else if (hour >= 12 && hour < 18) {
        advices.push('☀️ <strong>Kunduzi:</strong> Intensiv harakat vaqtida intervalni oshiring. Poyezd o\'tishidan so\'ng darhol tekshiruv bajaring.');
    } else {
        advices.push('🌙 <strong>Kechki navorat:</strong> Tungi nazorat rejimini yoqing. Belgilash chiroqlari va svetoforlar ishlashini tekshiring.');
    }

    // Tasodifiy tavsiya tanlash
    const chosen = advices[Math.floor(Math.random() * advices.length)];
    el.innerHTML = chosen;
}

// --- CORE LOGIC FOR SMART INTERACTIVITY ---

// Dynamic Keys based on logged in user
function getDataKeys() {
    // Use 'currentUser' available in scope
    const uid = (typeof currentUser !== 'undefined' && currentUser.username) ? currentUser.username : 'guest';
    return {
        TASKS: `smart_tasks_${uid}`,
        DEFECTS: `smart_defects_${uid}`,
        PK_RANGE: `smart_pk_range_${uid}`
    };
}

// Default PK Range
function getPKRange() {
    const key = getDataKeys().PK_RANGE;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return { start: 145, end: 165 };
}

function renderPKRange() {
    const range = getPKRange();
    const el = document.getElementById('pk-range-display');
    if (el) el.innerText = `PK ${range.start} - PK ${range.end}`;
}

// Initial Dummy Data if empty
function getInitialTasks() {
    return []; // Start empty so users have their own space
}

function getInitialDefects() {
    return []; // Start empty
}

async function loadTasks() {
    const bolinmaId = window.viewingSubdivisionId || (currentUser.bolinmalar ? currentUser.bolinmalar[0] : null);
    if (!bolinmaId) return;

    // Clear columns
    const colTodo = document.getElementById('col-todo');
    const colProgress = document.getElementById('col-progress');
    const colDone = document.getElementById('col-done');

    if (colTodo) colTodo.innerHTML = `<div class="kanban-header"><span style="color: #f1c40f;">Bajarish kerak (To Do)</span><button class="add-task-btn" onclick="addNewTask('todo')"><i class="fas fa-plus"></i></button></div>`;
    if (colProgress) colProgress.innerHTML = `<div class="kanban-header"><span style="color: #3498db;">Jarayonda (In Progress)</span><button class="add-task-btn" onclick="addNewTask('progress')"><i class="fas fa-plus"></i></button></div>`;
    if (colDone) colDone.innerHTML = `<div class="kanban-header"><span style="color: #2ecc71;">Bajarildi (Done)</span><button class="add-task-btn" onclick="addNewTask('done')"><i class="fas fa-plus"></i></button></div>`;

    try {
        const tasks = await SmartUtils.fetchAPI(`/tasks/${bolinmaId}`);
        if (tasks) {
            tasks.forEach(t => renderTask({
                id: t.id,
                title: t.title,
                deadline: t.deadline,
                column: t.status,
                urgent: t.is_urgent === 1
            }));
        }
    } catch (error) {
        console.error('Task load failed:', error);
    }
}

function saveTasks() {
    const tasks = [];
    ['todo', 'progress', 'done'].forEach(colId => {
        const col = document.getElementById('col-' + colId);
        if (!col) return; // Ustun topilmasa skip qil
        const cards = col.querySelectorAll('.task-card');
        cards.forEach(card => {
            const strongEl = card.querySelector('strong');
            const metaEl = card.querySelector('.task-meta');
            tasks.push({
                id: card.id,
                title: strongEl ? strongEl.innerText : '',
                deadline: metaEl ? metaEl.innerText : '',
                column: colId,
                urgent: card.classList.contains('urgent')
            });
        });
    });
    localStorage.setItem(getDataKeys().TASKS, JSON.stringify(tasks));
}

function renderTask(task) {
    const col = document.getElementById('col-' + task.column);
    if (!col) return;

    const div = document.createElement('div');
    div.className = `task-card ${task.urgent ? 'urgent' : ''}`;
    div.id = task.id;
    div.draggable = true;
    div.innerHTML = `
                                <strong>${escapeHtml(task.title)}</strong>
                                <div class="task-meta" style="font-size: 0.8rem; color: #aaa; margin-top: 5px;">${task.deadline}</div>
                                <div class="task-actions">
                                    <button class="delete-btn" onclick="deleteTask(this, event)" title="O'chirish">&times;</button>
                                </div>
                            `;

    div.addEventListener('dragstart', function (ev) {
        ev.dataTransfer.setData("text", ev.target.id);
        this.style.opacity = '0.4';
    });
    div.addEventListener('dragend', function (ev) {
        this.style.opacity = '1';
    });

    div.ondblclick = function () {
        const newTitle = prompt("Topshiriqni tahrirlash:", task.title);
        if (newTitle) {
            this.querySelector('strong').innerText = newTitle;
            saveTasks();
        }
    };

    // Insert after header
    col.appendChild(div);
}

window.deleteTask = async function (btn, event) {
    if (event) event.stopPropagation();
    const card = btn.closest('.task-card');
    const taskId = card.id.split('-').pop();

    if (confirm("Ushbu vazifani o'chirmoqchimisiz?")) {
        try {
            await SmartUtils.fetchAPI(`/tasks/${taskId}`, { method: 'DELETE' });
            card.remove();
            showToast('Vazifa o\'chirildi', 'success');
        } catch (error) {
            showToast('O\'chirishda xatolik: ' + error.message, 'error');
        }
    }
}

// --- MAP LOGIC ---
// --- MAP LOGIC ---
async function renderMapDefects() {
    const bolinmaId = window.viewingSubdivisionId || (currentUser.bolinmalar ? currentUser.bolinmalar[0] : null);
    if (!bolinmaId) return;

    const track = document.getElementById('track-line');
    if (!track) return;
    track.innerHTML = '';

    const range = getPKRange();

    try {
        const defects = await SmartUtils.fetchAPI(`/defects/${bolinmaId}`);
        if (defects) {
            defects.forEach(d => {
                const totalDist = range.end - range.start;
                let percent = ((d.pk - range.start) / totalDist) * 100;

                if (percent >= 0 && percent <= 100) {
                    const el = document.createElement('div');
                    el.className = d.status === 'active' ? 'track-defect' : 'track-ok';
                    el.style.left = percent + '%';
                    el.title = `PK ${d.pk}: ${d.issue}`;
                    if (d.status === 'active') el.innerText = '!';

                    el.onclick = async function () {
                        if (d.status === 'active') {
                            if (confirm(`PK ${d.pk} dagi "${d.issue}" muammosi bartaraf etildimi?`)) {
                                try {
                                    await SmartUtils.fetchAPI(`/defects/${d.id}/fix`, { method: 'PUT' });
                                    showToast('Nuqson bartaraf etildi', 'success');
                                    renderMapDefects();
                                } catch (e) {
                                    showToast('Xatolik: ' + e.message, 'error');
                                }
                            }
                        }
                    };
                    track.appendChild(el);
                }
            });
        }
    } catch (error) {
        console.error('Defects load failed:', error);
    }
}

async function addDefectToMap(pk, issue) {
    const bolinmaId = window.viewingSubdivisionId || (currentUser.bolinmalar ? currentUser.bolinmalar[0] : null);
    if (!bolinmaId) return;

    try {
        const result = await SmartUtils.fetchAPI('/defects', {
            method: 'POST',
            body: JSON.stringify({
                bolinma_id: bolinmaId,
                pk: parseInt(pk),
                issue: issue
            })
        });

        if (result) {
            showToast('Nuqson xaritaga qo\'shildi', 'success');
            renderMapDefects();
        }
    } catch (error) {
        showToast('Nuqson qo\'shishda xatolik: ' + error.message, 'error');
    }
}

// Homepage Monitoring Cards Render
function renderHomepageMonitoring() {
    const container = document.getElementById('homepage-monitoring-container');
    if (!container) return;

    // Get current user's subdivision ID
    const bolinmaId = currentUser.bolinmalar ? currentUser.bolinmalar[0] : null;
    if (!bolinmaId) return;

    // Get monitoring data
    const roadData = window.roadManagementData[bolinmaId] || {
        switches: { "1/11": 0, "1/9": 0 },
        tracks: { main: 0, reception: 0, other: 0 }
    };

    let monitorData = window.monitoringData[bolinmaId];
    if (!monitorData) {
        monitorData = {
            temp: Math.floor(Math.random() * (55 - 20) + 20),
            defects: 0,
            wearV: 0.0,
            wearH: 0.0,
            bruto: 12.5
        };
        window.monitoringData[bolinmaId] = monitorData;
    }

    // Check edit permission
    const canEdit = currentUser && currentUser.role === 'bolinma';

    // Render cards
    container.innerHTML = `
        <div class="smart-card" style="background: rgba(0, 198, 255, 0.08); border-color: rgba(0, 198, 255, 0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="margin: 0; color: #00c6ff; font-size: 1rem;">
                    <i class="fas fa-thermometer-half"></i> Holat Monitoringi
                </h4>
                ${canEdit ? `
                    <button onclick="editRoadManagement('${bolinmaId}')" style="background:none; border:none; color:#ffd700; cursor:pointer; font-size: 1.1rem;" title="Tahrirlash">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
            </div>
            <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Rels Harorati:</span>
                    <span style="color: ${monitorData.temp > 50 ? '#e74c3c' : (monitorData.temp > 40 ? '#f1c40f' : '#2ecc71')}; font-weight: bold;">
                        +${monitorData.temp}°C
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Nuqsonlar:</span>
                    <span style="color: ${monitorData.defects > 0 ? '#e74c3c' : '#2ecc71'}; font-weight: bold;">
                        ${monitorData.defects} ta
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Yillik tonna bruto:</span>
                    <span style="color: #ffd700; font-weight: bold;">
                        ${monitorData.bruto || 0} mln t.km
                    </span>
                </div>
            </div>
        </div>
        
        <div class="smart-card" style="background: rgba(46, 204, 113, 0.08); border-color: rgba(46, 204, 113, 0.3);">
            <h4 style="margin: 0 0 12px 0; color: #2ecc71; font-size: 1rem;">
                <i class="fas fa-code-branch"></i> Strelkalar
            </h4>
            <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">1/11 marka:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.switches && roadData.switches["1/11"]) || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">1/9 marka:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.switches && roadData.switches["1/9"]) || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 4px;">
                    <span style="color: rgba(255,255,255,0.9);"><strong>Jami:</strong></span>
                    <span style="color: white; font-weight: bold;">${((roadData.switches && roadData.switches["1/11"]) || 0) + ((roadData.switches && roadData.switches["1/9"]) || 0)}</span>
                </div>
            </div>
        </div>
        
        <div class="smart-card" style="background: rgba(155, 89, 182, 0.08); border-color: rgba(155, 89, 182, 0.3);">
            <h4 style="margin: 0 0 12px 0; color: #9b59b6; font-size: 1rem;">
                <i class="fas fa-ruler"></i> Yo'llar Uzunligi (km)
            </h4>
            <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Asosiy:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.tracks && roadData.tracks.main) || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Qabul:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.tracks && roadData.tracks.reception) || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Boshqa:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.tracks && roadData.tracks.other) || 0}</span>
                </div>
            </div>
        </div>
        
        <div class="smart-card" style="background: rgba(255, 159, 64, 0.08); border-color: rgba(255, 159, 64, 0.3);">
            <h4 style="margin: 0 0 12px 0; color: #f39c12; font-size: 1rem;">
                <i class="fas fa-search-location"></i> Defektaskop Nazorati
            </h4>
            <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Faol aravachalar:</span>
                    <span style="color: #2ecc71; font-weight: bold;">4/4</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Bugun tekshirildi:</span>
                    <span style="color: #ffd700; font-weight: bold;">95 km</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Aniqlangan nuqsonlar:</span>
                    <span style="color: #e74c3c; font-weight: bold;">8 ta</span>
                </div>
            </div>
            <button onclick="openDefectoscopeTracker()" style="width: 100%; margin-top: 15px; padding: 8px; background: linear-gradient(135deg, #f39c12, #e67e22); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.9rem;">
                <i class="fas fa-eye"></i> Batafsil Ko'rish
            </button>
        </div>

        <div class="smart-card" style="background: rgba(155, 89, 182, 0.1); border-color: rgba(155, 89, 182, 0.3); border-left: 4px solid #9b59b6; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="margin: 0; color: #9b59b6; font-size: 1rem;">
                    <i class="fas fa-map-marked-alt"></i> Stansiyalar Xaritasi
                </h4>
                <button onclick="if(window.openPCHMap) window.openPCHMap()" style="background: #9b59b6; border: none; color: white; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
                    Xaritani Ochish
                </button>
            </div>
            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.4;">
                <i class="fas fa-location-dot"></i> Qorlitog' TYM hududidagi barcha stansiyalar interaktiv xaritasi.
            </div>
        </div>

        <div class="smart-card" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); border-left: 4px solid #10b981; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="margin: 0; color: #10b981; font-size: 1rem;">
                    <i class="fas fa-bridge"></i> Sun'iy Inshootlar
                </h4>
                <button onclick="if(window.openArtificialStructures) window.openArtificialStructures('${bolinmaId}')" style="background: #10b981; border: none; color: white; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
                    Batafsil
                </button>
            </div>
            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.4;">
                <i class="fas fa-circle-info"></i> Ko'priklar, trubalar va tonnellar holati monitoringi.
            </div>
        </div>
        <!-- DISPETCHERGA ISH YUBORISH CARDI -->
        <div class="smart-card" style="background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3); border-left: 4px solid #38bdf8; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="margin: 0; color: #38bdf8; font-size: 1rem;">
                    <i class="fas fa-paper-plane"></i> Kunlik Ish Rejasi
                </h4>
                <button onclick="if(self.openDepartmentWindow) self.openDepartmentWindow('dispetcher')" style="background: #38bdf8; border: none; color: #0f172a; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
                    Yuborish
                </button>
            </div>
            <div id="quick-task-display-${bolinmaId}" style="font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.4;">
                <i class="fas fa-spinner fa-spin"></i> Tekshirilmoqda...
            </div>
        </div>

        <div class="smart-card" style="background: rgba(230, 126, 34, 0.1); border-color: rgba(230, 126, 34, 0.3); border-left: 4px solid #e67e22; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="margin: 0; color: #e67e22; font-size: 1rem;">
                    <i class="fas fa-truck-monster"></i> Mexanika Holati
                </h4>
                <button onclick="if(window.openDepartmentWindow) window.openDepartmentWindow('mexanika')" style="background: #e67e22; border: none; color: white; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                    Ochish
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 0.85rem;">
                <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; text-align: center;">
                    <div style="color: #2ecc71; font-weight: bold;">${(window.waybillData?.vehicles?.filter(v => v.status === 'free' && (!v.departmentId || v.departmentId === bolinmaId)).length || 0)}</div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 0.7rem;">Tayyor</div>
                </div>
                <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; text-align: center;">
                    <div style="color: #f1c40f; font-weight: bold;">${(window.waybillData?.vehicles?.filter(v => v.status === 'repair' && (!v.departmentId || v.departmentId === bolinmaId)).length || 0)}</div>
                </div>
            </div>
        </div>
    `;

    if (self.initDispatcherData) {
        self.initDispatcherData().then(() => {
            const display = document.getElementById(`quick-task-display-${bolinmaId}`);
            if (display) {
                if (self.subdivisionReports && self.subdivisionReports[bolinmaId]) {
                    const report = self.subdivisionReports[bolinmaId];
                    display.innerHTML = `<span style="color: #2ecc71;"><i class="fas fa-check"></i> Yuborilgan:</span> ${report.content.substring(0, 40)}${report.content.length > 40 ? '...' : ''}`;
                } else {
                    display.innerHTML = `<span style="color: #64748b; font-style: italic;">Bugun hali ish rejasi yuborilmadi</span>`;
                }
            }
        }).catch(e => console.warn("Dispatcher card update failed", e));
    }
}

// --- ADMIN MODAL FOR SUBDIVISION VIEW ---
window.openAdminSubdivisionView = function (subdivisionId) {
    if (typeof currentUser !== 'undefined' && currentUser.role !== 'admin' && !currentUser.departments.includes('dispetcher')) return;

    // Create or get modal
    let modal = document.getElementById('admin-sub-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-sub-modal';
        modal.className = 'active';
        modal.innerHTML = `
                                    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 2000; display: flex; align-items: center; justify-content: center;">
                                        <div style="background: #1e293b; width: 90%; height: 90%; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
                                            <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 1);">
                                                <h2 style="margin: 0; color: white;" id="admin-sub-title">Bo'linma Ko'rinishi</h2>
                                                <button onclick="document.getElementById('admin-sub-modal').style.display='none'" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                                            </div>
                                            <div id="admin-sub-content" style="flex: 1; overflow-y: auto; padding: 30px; background: #0f172a;">
                                                <!-- Content here -->
                                            </div>
                                        </div>
                                    </div>
                                `;
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';

    // Mock a user object for that subdivision to reuse render function
    const subUser = { role: 'bolinma', username: subdivisionId, bolinmalar: [subdivisionId] };

    // Need to temporarily override getDataKeys context or pass context
    // Let's modify getDataKeys to accept an optional override or just swap currentUser context in a hacky but effective way for read-only view?
    // Better: Update getDataKeys to look at a global 'viewingSubdivision' variable if set.

    window.viewingSubdivisionId = subdivisionId;

    const content = document.getElementById('admin-sub-content');
    content.innerHTML = getSmartSubdivisionDashboardHTML(subUser);

    // Update Title
    const subName = subdivisions.find(s => s.id === subdivisionId)?.name || subdivisionId;
    document.getElementById('admin-sub-title').innerText = `${subName} - Smart Boshqaruv Paneli (Kuzatuv)`;

    // Initialize features
    setTimeout(() => {
        initSubdivisionFeatures(); // This will load data based on viewingSubdivisionId because we updated getDataKeys below
    }, 100);
}

// Update getDataKeys to support Admin viewing mode
const originalGetDataKeys = getDataKeys;
window.getDataKeys = function () {
    const uid = window.viewingSubdivisionId || ((typeof currentUser !== 'undefined' && currentUser.username) ? currentUser.username : 'guest');
    // If admin is viewing, reset viewingSubdivisionId after call? No, keep it while modal is open?
    // Best approach: check if modal is open, but simpler is just use the global override
    return {
        TASKS: `smart_tasks_${uid}`,
        DEFECTS: `smart_defects_${uid}`,
        PK_RANGE: `smart_pk_range_${uid}`
    };
}

// Close modal cleanup
const originalClose = window.closeAllWindows || function () { };
window.closeAllWindows = function () {
    const modal = document.getElementById('admin-sub-modal');
    if (modal) modal.style.display = 'none';
    window.viewingSubdivisionId = null; // Reset context
    originalClose();
}

// --- HISTORY MODAL ---
window.openHistoryModal = async function () {
    let modal = document.getElementById('history-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'history-modal';
        modal.className = 'active';
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 2000; display: flex; align-items: center; justify-content: center;">
                <div style="background: #1e293b; width: 90%; max-width: 800px; height: 80%; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
                    <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 1);">
                        <h2 style="margin: 0; color: white;"><i class="fas fa-history"></i> Topshiriqlar Tarixi</h2>
                        <button onclick="document.getElementById('history-modal').style.display='none'" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div id="history-content" style="flex: 1; overflow-y: auto; padding: 20px; background: #0f172a;">
                        <div style="text-align:center; padding:50px; color:white;"><i class="fas fa-spinner fa-spin"></i> Tarix yuklanmoqda...</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';

    try {
        const historyDataRaw = await SmartUtils.fetchAPI('/reports/history');
        const content = document.getElementById('history-content');

        if (!historyDataRaw || historyDataRaw.length === 0) {
            content.innerHTML = `<div style="text-align:center; padding: 50px; color: rgba(255,255,255,0.3);">Tarix bo'sh...</div>`;
            return;
        }

        // Group by Date
        const historyData = {};
        historyDataRaw.forEach(r => {
            if (!historyData[r.date]) historyData[r.date] = {};
            historyData[r.date][r.bolinma_id] = { text: r.content, time: r.time };
        });

        const dates = Object.keys(historyData).sort((a, b) => new Date(b) - new Date(a));

        content.innerHTML = dates.map(date => {
            const dayReports = historyData[date];
            const subIds = Object.keys(dayReports);

            return `
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #3498db; border-bottom: 1px solid rgba(52, 152, 219, 0.3); padding-bottom: 10px; margin-bottom: 15px;">
                        <i class="far fa-calendar-alt"></i> ${date}
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                        ${subIds.map(sid => {
                const rep = dayReports[sid];
                const subName = subdivisions.find(s => s.id === sid)?.name || sid;
                return `
                                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border-left: 3px solid #2ecc71;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong style="color: white; font-size: 1rem;">${subName}</strong>
                                        <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);"><i class="far fa-clock"></i> ${rep.time}</span>
                                    </div>
                                    <div style="color: rgba(255,255,255,0.8); line-height: 1.5; font-size: 0.9rem;">
                                        ${escapeHtml(rep.text)}
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        document.getElementById('history-content').innerHTML = `<div style="color:red; text-align:center; padding:20px;">Xatolik: ${escapeHtml(error.message)}</div>`;
    }
}


// --- SMART SUBDIVISION DASHBOARD END ---

function startConfetti() {
    const container = document.getElementById('confetti-container') || (() => {
        const c = document.createElement('div');
        c.id = 'confetti-container';
        c.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10000;';
        document.body.appendChild(c);
        return c;
    })();

    container.style.display = 'block';
    const colors = ['#fce18a', '#ff726d', '#b48def', '#f4306d', '#00c6ff'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
                                        position: absolute; width: 8px; height: 8px;
                                        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                                        left: ${Math.random() * 100}vw; top: -10px;
                                        opacity: ${Math.random()}; transform: rotate(${Math.random() * 360}deg);
                                        animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
                                    `;
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
    setTimeout(() => container.style.display = 'none', 4000);
}


const functionalDepartments = [
    {
        id: 'ishlab-chiqarish',
        name: 'Ishlab chiqarish bo\'limi',
        manager: 'Anvarov T.',
        icon: 'fas fa-industry',
        description: 'Ishlab chiqarish jarayonlari va mahsulot nazorati'
    },
    {
        id: 'xodimlar',
        name: 'Xodimlar bo\'limi',
        manager: 'Sattorov J.',
        icon: 'fas fa-users-gear',
        description: 'Xodimlarni boshqarish va mehnat munosabatlari'
    },
    {
        id: 'bugalteriya',
        name: 'Bugalteriya bo\'limi',
        manager: 'Karimov S.',
        icon: 'fas fa-calculator',
        description: 'Moliyaviy hisobotlar va buxgalteriya hisobi'
    },
    {
        id: 'mexanika',
        name: 'Mexanika bo\'limi',
        manager: 'Rustamov M.',
        icon: 'fas fa-gears',
        description: 'Texnik xizmat ko\'rsatish va mexanizatsiyalash'
    },
    {
        id: 'iqtisod',
        name: 'Iqtisod bo\'limi',
        manager: 'Zokirov F.',
        icon: 'fas fa-chart-line',
        description: 'Iqtisodiy tahlil va rejalashtirish'
    },
    {
        id: 'metrologiya',
        name: 'Metrologiya va elektr bo\'limi',
        manager: 'Ergashev A.',
        icon: 'fas fa-scale-balanced',
        description: 'O\'lchov standartlari va elektr energiya nazorati'
    },
    {
        id: 'dispetcher',
        name: 'Dispetcher bo\'limi',
        manager: 'Sharopov X',
        icon: 'fas fa-tower-broadcast',
        description: 'Transport harakatini boshqarish va monitoring qilish',
        integrations: ['obs']
    }
];



// Yuklangan fayllar ma'lumotlari
let uploadedFiles = [];
let currentEditingFile = null;
let currentUser = null;
let newsData = [];
// weatherData is declared in weather.js
// currentWeatherView is declared in weather.js
let competitionChart = null;
let currentSelectedCell = null;
let currentPreviewFile = null;
let chartEditor = null;
let currentChartData = null;
// liveMap is declared in map-logic.js
// subdivisionMarkers is declared in map-logic.js
let competitionData = {
    type: 'bar',
    colors: ['rgba(52, 152, 219, 0.7)', 'rgba(46, 204, 113, 0.7)'],
    colors: ['rgba(212, 175, 55, 0.8)', 'rgba(255, 215, 0, 0.6)'],
    textColor: 'white',
    borderWidth: 1,
    height: 400,
    values: {}
};
let folders = [];

// Bo'linmalar ma'lumotlari
const subdivisions = [
    { id: 'bolinma1', name: '1-bo\'linma', manager: 'Rajabov E', department: 'Navbahor(4020km pk1-4050km pk10)', location: { lat: 39.7, lng: 64.4 } },
    { id: 'bolinma2', name: '2-bo\'linma', manager: 'Rustamov A', department: 'Yaxshilik(4051km pk1-4083km pk10)', location: { lat: 39.8, lng: 64.5 } },
    { id: 'bolinma3', name: '3-bo\'linma', manager: 'Islomov S.', department: 'Parvoz(4084km pk1-4117km pk10)', location: { lat: 39.6, lng: 64.3 } },
    { id: 'bolinma4', name: '4-bo\'linma', manager: 'Atadjanov J.', department: 'Qorlitog(4118km pk1-4150km pk10)', location: { lat: 39.9, lng: 64.6 } },
    { id: 'bolinma5', name: '5-bo\'linma', manager: 'Choriyev Y.', department: 'Kiyikli(4151km pk1-4183km pk10)', location: { lat: 39.5, lng: 64.2 } },
    { id: 'bolinma6', name: '6-bo\'linma', manager: 'Islomov F.', department: 'Xizirbobo(4184km pk1-4205km pk10)', location: { lat: 40.0, lng: 64.7 } },
    { id: 'bolinma7', name: '7-bo\'linma', manager: 'Mambetov A', department: 'Jayxun', location: { lat: 39.4, lng: 64.1 } },
    { id: 'bolinma8', name: '8-bo\'linma', manager: 'Qutimov R.', department: 'Dautepa peregon', location: { lat: 40.1, lng: 64.8 } },
    { id: 'bolinma9', name: '9-bo\'linma', manager: 'Kerimov U', department: 'Dautepa(4261km pk1-4289km pk10)', location: { lat: 39.3, lng: 64.0 } },
    { id: 'bolinma10', name: '10-bo\'linma', manager: 'Davletov Sh', department: 'Turon(4290km pk1-4303km pk10)', location: { lat: 40.2, lng: 64.9 } }
];



// Global monitoring data
let monitoringData = {};

// Ma'lumotlar bazasini yuklash
async function loadDatabase() {
    const data = await SmartUtils.load(DB_NAME);
    if (data) {
        uploadedFiles = data.files || [];
        folders = data.folders || [];
        if (data.competitionData) competitionData = data.competitionData;
        monitoringData = data.monitoringData || {};
    } else {
        initializeDatabase();
    }
}

// Ma'lumotlar bazasini saqlash
function saveDatabase() {
    const data = {
        files: uploadedFiles,
        folders: folders,
        competitionData: competitionData,
        monitoringData: monitoringData,
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem(DB_NAME, JSON.stringify(data));
}

// Dastlabki ma'lumotlarni yaratish
function initializeDatabase() {
    // Namuna fayllar
    const sampleFiles = [
        {
            id: '1',
            name: 'Hisobot-noyabr.docx',
            size: 24576,
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            content: 'Noyabr oyi hisoboti mazmuni...',
            department: 'ishlab-chiqarish',
            uploadDate: new Date('2023-11-15').toISOString(),
            status: 'approved',
            uploader: 'admin',
            folder: 'hisobotlar'
        },
        {
            id: '2',
            name: 'Reja-dekabr.xlsx',
            size: 18432,
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            content: '',
            department: 'ishlab-chiqarish',
            uploadDate: new Date('2023-11-20').toISOString(),
            status: 'pending',
            uploader: 'turobov',
            folder: 'reja'
        }
    ];

    uploadedFiles = sampleFiles;
    saveDatabase();
}

// Raqobat grafigini yaratish (1-10 bo'linmalar uchun)
async function createCompetitionChart() {
    const ctx = document.getElementById('competitionChart');
    if (!ctx) return;

    if (window.LazyLoader) await window.LazyLoader.loadChart();

    // Avvalgi chartni yo'q qilish
    if (competitionChart) {
        competitionChart.destroy();
    }

    const subdivisionNames = subdivisions.map(sub => sub.name);
    const performanceData = subdivisions.map(sub => {
        return competitionData.values[sub.id]?.performance || 50;
    });

    const efficiencyData = subdivisions.map(sub => {
        return competitionData.values[sub.id]?.efficiency || 30;
    });

    competitionChart = new Chart(ctx, {
        type: competitionData.type || 'bar',
        data: {
            labels: subdivisionNames,
            datasets: [
                {
                    label: 'PS-126,PS-106 bergan bal',
                    data: performanceData,
                    backgroundColor: competitionData.colors?.[0] || 'rgba(52, 152, 219, 0.7)',
                    borderColor: competitionData.colors?.[0] || 'rgba(52, 152, 219, 1)',
                    backgroundColor: competitionData.colors?.[0] || 'rgba(212, 175, 55, 0.8)',
                    borderColor: competitionData.colors?.[0] || 'rgba(212, 175, 55, 1)',
                    borderWidth: competitionData.borderWidth || 1
                },
                {
                    label: 'Hisobotlarning samaradorligi (%)',
                    data: efficiencyData,
                    backgroundColor: competitionData.colors?.[1] || 'rgba(46, 204, 113, 0.7)',
                    borderColor: competitionData.colors?.[1] || 'rgba(46, 204, 113, 1)',
                    backgroundColor: competitionData.colors?.[1] || 'rgba(255, 215, 0, 0.6)',
                    borderColor: competitionData.colors?.[1] || 'rgba(255, 215, 0, 1)',
                    borderWidth: competitionData.borderWidth || 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: competitionData.textColor || 'white'
                    }
                },
                title: {
                    display: true,
                    text: 'Bo\'linmalar o\'rtasidagi raqobat (1-10 bo\'linmalar)',
                    color: competitionData.textColor || 'white',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 150,
                    ticks: {
                        color: competitionData.textColor || 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: competitionData.textColor || 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Live xaritani yaratish
function createLiveMap() {
    const mapContainer = document.getElementById('live-map');
    if (!mapContainer) return;

    // Xaritani yaratish
    liveMap = L.map('live-map').setView([41.3111, 69.2797], 6); // O'zbekiston markazi

    // Xarita qatlami
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(liveMap);
    // Bo'linmalarni xaritada ko'rsatish
    updateMapMarkers();

    // 10 soniyada bir yangilash (simulyatsiya)
    setInterval(() => {
        updateSubdivisionLocations();
        updateMapMarkers();
    }, 10000);
}

// Xarita markerlarini yangilash
function updateMapMarkers() {
    // Avvalgi markerlarni o'chirish
    subdivisionMarkers.forEach(marker => liveMap.removeLayer(marker));
    subdivisionMarkers = [];

    // Har bir bo'linma uchun marker qo'shish
    subdivisions.forEach(sub => {
        const marker = L.marker([sub.location.lat, sub.location.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: ${getDepartmentColor(sub.department)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white;">${sub.name.substring(0, 1)}</div>`
            })
        }).addTo(liveMap);

        marker.bindPopup(`
                    <div style="color: #333;">
                        <strong>${escapeHtml(sub.name)}</strong><br>
                        <strong>Mas'ul:</strong> ${sub.manager}<br>
                        <strong>Bo'lim:</strong> ${getDepartmentName(sub.department)}<br>
                        <strong>Holat:</strong> Faol<br>
                        <strong>Oxirgi faollik:</strong> ${new Date().toLocaleTimeString('uz-UZ')}
                    </div>
                `);

        subdivisionMarkers.push(marker);
    });
}

// Bo'linma lokatsiyasini yangilash (simulyatsiya)
function updateSubdivisionLocations() {
    subdivisions.forEach(sub => {
        // Kichik o'zgarishlar kiritish (harakatlanayotgandek ko'rinish)
        sub.location.lat += (Math.random() - 0.5) * 0.01;
        sub.location.lng += (Math.random() - 0.5) * 0.01;

        // Chegaralarni belgilash
        sub.location.lat = Math.max(36, Math.min(45, sub.location.lat));
        sub.location.lng = Math.max(56, Math.min(73, sub.location.lng));
    });
}

// Bo'lim nomini olish
function getDepartmentName(departmentId) {
    const dept = functionalDepartments.find(d => d.id === departmentId);
    return dept ? dept.name : departmentId;
}

// Bo'lim rangi
function getDepartmentColor(departmentId) {
    const colors = {
        '1-bolinma': '#e74c3c',
        '2-bolinma': '#3498db',
        '3-bolinma': '#2ecc71',
        '4-bolinma': '#9b59b6',
        '5-bolinma': '#f1c40f',
        '6-bolinma': '#e67e22',
        '7-bolinma': '#1abc9c',
        '8-bolinma': '#34495e',
        '9-bolinma': '#34497e',
        '10-bolinma': '#7f8c8d'
    };
    return colors[departmentId] || '#3498db';
}

// Injecting the goal into the dispatcher content whenever department is opened
function injectDailyGoalToDispatcher() {
    // 1. Main 'Dispetcher' Department
    const mainDispatcher = document.getElementById('dispetcher-window');
    if (mainDispatcher) {
        const body = mainDispatcher.querySelector('.department-body');
        if (body && !body.querySelector('.daily-goal-card')) {
            body.insertAdjacentHTML('afterbegin', getDailyGoalHTML());
        }
    }

    // 2. Subdivision Dispatcher Sections (e.g., bolinma1-6-window or 1-bolinma-6-window)
    // The ID logic seems to be `${bolinmaId}-${sectionId}-window`.
    // Dispatcher section ID is 6.
    // We'll look for any open window that corresponds to a dispatcher section.

    const openWindows = document.querySelectorAll('.department-window.active');
    openWindows.forEach(win => {
        // Check if this window is a Dispatcher window (ID contains 'dispetcher' or ends with '-6-window')
        if ((win.id.includes('dispetcher') || win.id.endsWith('-6-window')) && !win.querySelector('.daily-goal-card')) {
            const body = win.querySelector('.department-body');
            if (body) {
                body.insertAdjacentHTML('afterbegin', getDailyGoalHTML());
            }
        }
    });
}

// Add this to your department switching logic or call intervally
// Faqat asosiy tizim ochiq bo'lganda ishlaydi (performance uchun)
setInterval(() => {
    const mainSystem = document.getElementById('mainSystem');
    if (mainSystem && mainSystem.style.display !== 'none') {
        injectDailyGoalToDispatcher();
    }
}, 5000);

// Weather functions moved to weather.js

// Temir yo'l yangiliklari
const railwayNews = [
    {
        title: "O'zbekistonda yangi tezyurar poyezdlar ishga tushirildi",
        description: "Toshkent-Samarqand-Buxoro yo'nalishida yangi tezyurar poyezdlar qatnovi boshlandi. Poyezdlar Yevropa standartlariga mos keladi va yo'lovchilarga qulaylik yaratadi.",
        category: "Transport",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: new Date(Date.now() - 86400000)
    },
    {
        title: "Temir yo'l xodimlari uchun malaka oshirish kurslari",
        description: "Xalqaro standartlar asosida temir yo'l xodimlari uchun malaka oshirish kurslari tashkil etildi. Kurslar xavfsizlik va zamonaviy texnologiyalarga qaratilgan.",
        category: "Ta'lim",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: new Date(Date.now() - 172800000)
    },
    {
        title: "Yangi temir yo'l loyihalari uchun investitsiyalar jalb qilindi",
        description: "Xalqaro investorlar O'zbekiston temir yo'l infratuzilmasini rivojlantirishga 500 million dollar sarmoya kiritishdi. Loyihalar 2024-yilda boshlanadi.",
        category: "Investitsiyalar",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: new Date(Date.now() - 259200000)
    }
];

// News handling is managed at the end of the file in the newer consolidated function

// Chart editor funksiyalari
async function openChartEditor() {
    const editorWindow = document.getElementById('chart-editor-window');

    await createChartEditor();

    editorWindow.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');
}

async function createChartEditor() {
    const previewCanvas = document.getElementById('chart-editor-preview-canvas');

    if (window.LazyLoader) await window.LazyLoader.loadChart();

    if (chartEditor) {
        chartEditor.destroy();
    }

    const subdivisionNames = subdivisions.map(sub => sub.name);
    const performanceData = subdivisions.map(sub => {
        return competitionData.values[sub.id]?.performance || 50;
    });
    const efficiencyData = subdivisions.map(sub => {
        return competitionData.values[sub.id]?.efficiency || 30;
    });

    chartEditor = new Chart(previewCanvas, {
        type: competitionData.type || 'bar',
        data: {
            labels: subdivisionNames,
            datasets: [
                {
                    label: 'PS-126,PS-106 bergan bal',
                    data: performanceData,
                    backgroundColor: competitionData.colors?.[0] || 'rgba(52, 152, 219, 0.7)',
                    borderColor: competitionData.colors?.[0] || 'rgba(52, 152, 219, 1)',
                    borderWidth: competitionData.borderWidth || 1
                },
                {
                    label: 'Hisobotlarning samaradorligi (%)',
                    data: efficiencyData,
                    backgroundColor: competitionData.colors?.[1] || 'rgba(46, 204, 113, 0.7)',
                    borderColor: competitionData.colors?.[1] || 'rgba(46, 204, 113, 1)',
                    borderWidth: competitionData.borderWidth || 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: competitionData.textColor || 'white'
                    }
                },
                title: {
                    display: true,
                    text: 'Bo\'linmalar o\'rtasidagi raqobat',
                    color: competitionData.textColor || 'white',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 150,
                    ticks: {
                        color: competitionData.textColor || 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: competitionData.textColor || 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    setupChartControls();
}

function setupChartControls() {
    // Diagramma turi
    const chartTypeSelect = document.getElementById('chart-type-select');
    chartTypeSelect.value = competitionData.type || 'bar';
    chartTypeSelect.addEventListener('change', function () {
        chartEditor.config.type = this.value;
        competitionData.type = this.value;
        chartEditor.update();
    });

    // Diagramma balandligi
    const chartHeight = document.getElementById('chart-height');
    const heightValue = document.getElementById('height-value');
    chartHeight.value = competitionData.height || 400;
    heightValue.textContent = (competitionData.height || 400) + 'px';

    chartHeight.addEventListener('input', function () {
        previewCanvas.style.height = this.value + 'px';
        heightValue.textContent = this.value + 'px';
        competitionData.height = parseInt(this.value);
        chartEditor.update();
    });

    // Chegara qalinligi
    const borderWidth = document.getElementById('border-width');
    const borderValue = document.getElementById('border-value');
    borderWidth.value = competitionData.borderWidth || 1;
    borderValue.textContent = (competitionData.borderWidth || 1) + 'px';

    borderWidth.addEventListener('input', function () {
        chartEditor.data.datasets.forEach(dataset => {
            dataset.borderWidth = parseInt(this.value);
        });
        borderValue.textContent = this.value + 'px';
        competitionData.borderWidth = parseInt(this.value);
        chartEditor.update();
    });

    // Matn rangi
    const textColor = document.getElementById('chart-text-color');
    textColor.value = competitionData.textColor || 'white';
    textColor.addEventListener('change', function () {
        chartEditor.options.plugins.legend.labels.color = this.value;
        chartEditor.options.scales.x.ticks.color = this.value;
        chartEditor.options.scales.y.ticks.color = this.value;
        competitionData.textColor = this.value;
        chartEditor.update();
    });

    // Rang tanlash
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-color') === competitionData.colors?.[0]) {
            option.classList.add('active');
        }

        option.addEventListener('click', function () {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');

            const color = this.getAttribute('data-color');
            chartEditor.data.datasets[0].backgroundColor = color;
            chartEditor.data.datasets[0].borderColor = color;

            if (!competitionData.colors) {
                competitionData.colors = [color, competitionData.colors?.[1] || '#2ecc71'];
            } else {
                competitionData.colors[0] = color;
            }

            chartEditor.update();
        });
    });

    // Qiymatlarni tahrirlash
    updateChartValueInputs();
}

function updateChartValueInputs() {
    const valueInputs = document.getElementById('chart-value-inputs');
    valueInputs.innerHTML = '';

    subdivisions.forEach((sub, index) => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'chart-value-input';

        const performance = competitionData.values[sub.id]?.performance || 50;
        const efficiency = competitionData.values[sub.id]?.efficiency || 30;

        inputGroup.innerHTML = `
                    <label>${escapeHtml(sub.name)}</label>
                    <input type="number" class="performance-value" value="${performance}" 
                           data-id="${sub.id}" data-type="performance" min="0" max="200"
                           onchange="updateChartValue(this)">
                    <input type="number" class="efficiency-value" value="${efficiency}" 
                           data-id="${sub.id}" data-type="efficiency" min="0" max="100"
                           onchange="updateChartValue(this)">
                `;

        valueInputs.appendChild(inputGroup);
    });
}

function updateChartValue(input) {
    const subId = input.getAttribute('data-id');
    const type = input.getAttribute('data-type');
    const value = parseInt(input.value);

    if (!competitionData.values[subId]) {
        competitionData.values[subId] = {};
    }

    competitionData.values[subId][type] = value;

    // Chartni yangilash
    const index = subdivisions.findIndex(sub => sub.id === subId);
    if (index !== -1) {
        if (type === 'performance') {
            chartEditor.data.datasets[0].data[index] = value;
        } else if (type === 'efficiency') {
            chartEditor.data.datasets[1].data[index] = value;
        }
        chartEditor.update();
    }
}

function applyChartChanges() {

    // Chart ma'lumotlarini saqlash
    saveDatabase();

    // Asosiy chartni yangilash
    if (competitionChart) {
        competitionChart.destroy();
        createCompetitionChart();
    }

    showToast('Raqobat grafiki yangilandi va saqlandi!', 'success');
    closeChartEditor();
}

function closeChartEditor() {
    document.getElementById('chart-editor-window').classList.remove('active');
    document.getElementById('department-overlay').classList.remove('active');
}

// Ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', async function () {
    // 1. Event listenerlarni DARHOL o'rnatamiz (Login formasi ishlashi uchun)
    setupEventListeners();

    // 2. Keyin ma'lumotlarni yuklaymiz
    try {
        await loadDatabase();
    } catch (e) {
        console.error("Database load failed:", e);
    }

    // 3. Agar avval login qilingan bo'lsa
    if (window.Auth && window.Auth.isLoggedIn()) {
        currentUser = window.Auth.currentUser;
        showMainSystem();
    }
});

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        login();
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', function () {
        logout();
    });

    // Admin controls
    document.getElementById('adminChartBtn')?.addEventListener('click', () => {
        openCompetitionAdminModal();
    });

    document.getElementById('showMapBtn')?.addEventListener('click', () => {
        openRailwayMapModal();
    });

    // Admin modal yopish
    document.querySelectorAll('.admin-modal .close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('competitionAdminModal').classList.remove('active');
        });
    });

    // Map modal yopish
    document.querySelectorAll('.map-modal .close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('railwayMapModal').classList.remove('active');
        });
    });

    // Admin tablar
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchAdminTab(tabId);
        });
    });

    // Bekat qo'shish
    document.getElementById('addStationBtn')?.addEventListener('click', addNewStation);

    // Chart sozlamalarini saqlash
    document.getElementById('applyChartSettings')?.addEventListener('click', saveChartSettings);

    // Tahrirlash oynasini yopish
    document.getElementById('closeTextEditorBtn')?.addEventListener('click', () => {
        document.getElementById('text-editor-window')?.classList.remove('active');
    });

    document.getElementById('cancelTextEditBtn')?.addEventListener('click', () => {
        document.getElementById('text-editor-window')?.classList.remove('active');
    });

    // Excel tahrirlash oynasini yopish
    document.getElementById('closeExcelEditorBtn')?.addEventListener('click', () => {
        document.getElementById('excel-editor-window')?.classList.remove('active');
    });

    document.getElementById('cancelExcelEditBtn')?.addEventListener('click', () => {
        document.getElementById('excel-editor-window')?.classList.remove('active');
    });

    // Fayl ko'rish oynasini yopish
    document.getElementById('closePreviewBtn')?.addEventListener('click', () => {
        document.getElementById('file-preview-window')?.classList.remove('active');
    });

    // Faylni saqlash
    document.getElementById('saveTextFileBtn')?.addEventListener('click', () => {
        saveTextFile();
    });

    // Excel faylni saqlash
    document.getElementById('saveExcelFileBtn')?.addEventListener('click', () => {
        saveExcelFile();
    });

    // Faylni tahrirlash
    document.getElementById('editPreviewFileBtn')?.addEventListener('click', () => {
        editCurrentFile();
    });

    // Faylni yuklab olish
    document.getElementById('downloadPreviewFileBtn')?.addEventListener('click', () => {
        downloadCurrentFile();
    });

    // Google Docs style editor uchun toolbar tugmalari
    document.addEventListener('click', function (e) {
        if (e.target.closest('.docs-btn')) {
            const btn = e.target.closest('.docs-btn');
            const command = btn.getAttribute('data-command');
            document.execCommand(command, false, null);
            document.getElementById('docsEditor').focus();
        }

        if (e.target.closest('.toolbar-btn')) {
            const btn = e.target.closest('.toolbar-btn');
            const command = btn.getAttribute('data-command');
            if (command) {
                document.execCommand(command, false, null);
                document.getElementById('docsEditor').focus();
            }
        }
    });

    // Font o'zgarishi
    document.getElementById('fontSize')?.addEventListener('change', function () {
        document.execCommand('fontSize', false, this.value);
        document.getElementById('docsEditor')?.focus();
    });

    document.getElementById('fontFamily')?.addEventListener('change', function () {
        document.execCommand('fontName', false, this.value);
        document.getElementById('docsEditor')?.focus();
    });

    // Chart turini o'zgartirish
    document.addEventListener('click', function (e) {
        if (e.target.closest('.chart-btn')) {
            const btn = e.target.closest('.chart-btn');
            const chartType = btn.getAttribute('data-chart');

            // Barcha tugmalarni faollashtirish
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Chartni yangilash
            updateChartType(chartType);
        }

        // Havo ma'lumotlarini yangilash
        if (e.target.closest('.refresh-weather')) {
            loadWeatherData();
        }

        // Havo ko'rinishini o'zgartirish
        if (e.target.closest('.weather-btn')) {
            const btn = e.target.closest('.weather-btn');
            const viewType = btn.getAttribute('data-time');

            // Barcha tugmalarni faollashtirish
            document.querySelectorAll('.weather-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Ko'rinishni o'zgartirish
            currentWeatherView = viewType;
            renderWeather();
        }
    });
    // Admin functions - UPDATED WITH USER MANAGEMENT
    function openCompetitionAdminModal() {
        // Create Enhanced Modal dynamically if not exists
        let modal = document.getElementById('admin-panel-overlay');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'admin-panel-overlay';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9000; display:flex; justify-content:center; align-items:center;';

            modal.innerHTML = `
                <div style="background:#1e293b; width:90%; max-width:1200px; height:85vh; border-radius:15px; display:flex; flex-direction:column; overflow:hidden; border:1px solid rgba(255,255,255,0.1); box-shadow:0 0 50px rgba(0,0,0,0.5);">
                    <div style="padding:20px; background:linear-gradient(90deg, #2c3e50, #34495e); display:flex; justify-content:space-between; align-items:center; color:white;">
                        <h2 style="margin:0;"><i class="fas fa-cogs"></i> Tizim Administratori Paneli</h2>
                        <button onclick="document.getElementById('admin-panel-overlay').style.display='none'" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <button onclick="switchAdminPanelTab('users')" class="admin-tab-btn active" style="flex:1; padding:15px; background:transparent; color:white; border:none; cursor:pointer; border-bottom:3px solid #3498db; font-weight:bold;">Foydalanuvchilar</button>
                        <button onclick="switchAdminPanelTab('competition')" class="admin-tab-btn" style="flex:1; padding:15px; background:transparent; color:#aaa; border:none; cursor:pointer; font-weight:bold;">Musobaqa & Reyting</button>
                        <button onclick="switchAdminPanelTab('stations')" class="admin-tab-btn" style="flex:1; padding:15px; background:transparent; color:#aaa; border:none; cursor:pointer; font-weight:bold;">Bekatlar & Xarita</button>
                        <button onclick="switchAdminPanelTab('backup')" class="admin-tab-btn" style="flex:1; padding:15px; background:transparent; color:#aaa; border:none; cursor:pointer; font-weight:bold;">Tizim & Arxiv</button>
                    </div>
                    <div style="flex:1; overflow:hidden; position:relative; background: #0f172a;">
                        <!-- USERS TAB -->
                        <div id="admin-tab-users" class="admin-tab-content" style="padding:20px; height:100%; overflow-y:auto; display:block;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                                <h3 style="color:#3498db; margin:0;">Foydalanuvchilar Ro'yxati</h3>
                                <button onclick="openUserEditModal()" style="background:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;"><i class="fas fa-user-plus"></i> Yangi Foydalanuvchi</button>
                            </div>
                            <div id="admin-users-list"></div>
                        </div>

                        <!-- COMPETITION TAB -->
                        <div id="admin-tab-competition" class="admin-tab-content" style="padding:20px; height:100%; overflow-y:auto; display:none;">
                            <h3 style="color:#f39c12;">Bo'limlar Reytingini Boshqarish</h3>
                            <div id="departmentScoresEditor" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;"></div>
                        </div>

                        <!-- STATIONS TAB -->
                        <div id="admin-tab-stations" class="admin-tab-content" style="padding:20px; height:100%; overflow-y:auto; display:none;">
                            <h3 style="color:#e67e22;">Bekatlar Ro'yxati</h3>
                            <div style="margin-bottom:20px; background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; display:flex; gap:10px;">
                                <input type="text" id="newStationName" placeholder="Bekat nomi" style="padding:10px; border-radius:5px; border:none; flex:2;">
                                <input type="text" id="newStationCode" placeholder="Kod" style="padding:10px; border-radius:5px; border:none; width:80px;">
                                <button onclick="addNewStation()" style="padding:10px 20px; background:#f1c40f; border:none; cursor:pointer; border-radius:5px; font-weight:bold;">Qo'shish</button>
                            </div>
                            <div id="stationsList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;"></div>
                        </div>
                        
                         <!-- BACKUP TAB -->
                        <div id="admin-tab-backup" class="admin-tab-content" style="padding:20px; height:100%; overflow-y:auto; display:none;">
                           <h3 style="color:#9b59b6;">Tizim Ma'lumotlari</h3>
                           <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:10px;">
                               <p style="color:#aaa;">Barcha foydalanuvchilar, stansiyalar va reyting ma'lumotlarini JSON formatida yuklab olish.</p>
                               <button onclick="exportFullSystemBackup()" style="padding:15px 30px; background:#e67e22; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; font-size:1rem;"><i class="fas fa-download"></i> Tizimni To'liq Zaxiralash (Backup)</button>
                           </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            modal.style.display = 'flex';
        }

        // Initialize Data
        renderAdminUserList();
        loadDepartmentScores();
        loadStationsList();
    }

    // --- Tab Switcher ---
    window.switchAdminPanelTab = function (tabName) {
        document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.admin-tab-btn').forEach(el => {
            el.style.borderBottom = 'none';
            el.style.color = '#aaa';
            el.classList.remove('active');
        });

        document.getElementById('admin-tab-' + tabName).style.display = 'block';
        const activeBtn = document.querySelector(`.admin-tab-btn[onclick*="${tabName}"]`);
        if (activeBtn) {
            activeBtn.style.borderBottom = '3px solid #3498db';
            activeBtn.style.color = 'white';
            activeBtn.classList.add('active');
        }
    };

    // --- User Management Logic ---
    window.renderAdminUserList = function () {
        const container = document.getElementById('admin-users-list');
        if (!container) return;

        let html = '<table style="width:100%; border-collapse:collapse; color:white;"><thead><tr style="background:rgba(255,255,255,0.1); text-align:left;"><th style="padding:15px;">Login</th><th style="padding:15px;">Ism</th><th style="padding:15px;">Rol</th><th style="padding:15px;">Bo\'limlar</th><th style="padding:15px; text-align:center;">Amallar</th></tr></thead><tbody>';

        Object.keys(users).forEach(key => {
            const u = users[key];
            html += `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:15px; font-family:monospace; color:#3498db;">${key}</td>
                    <td style="padding:15px; font-weight:bold;">${escapeHtml(u.name)}</td>
                    <td style="padding:15px;"><span style="background:${u.role === 'admin' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)'}; color:${u.role === 'admin' ? '#e74c3c' : '#3498db'}; padding:5px 10px; border-radius:20px; font-size:0.85em; border:1px solid ${u.role === 'admin' ? 'rgba(231, 76, 60, 0.5)' : 'rgba(52, 152, 219, 0.5)'};">${u.role.toUpperCase()}</span></td>
                    <td style="padding:15px; font-size:0.85em; color:#aaa;">${u.role === 'admin' ? 'Barchasi' : (u.departments ? u.departments.join(', ') : '-')}</td>
                    <td style="padding:15px; text-align:center;">
                        <button onclick="openUserEditModal('${key}')" title="Tahrirlash" style="background:rgba(243, 156, 18, 0.2); border:1px solid #f39c12; padding:8px 12px; border-radius:5px; cursor:pointer; color:#f39c12;"><i class="fas fa-edit"></i></button>
                        ${key !== 'admin' ? `<button onclick="deleteAdminUser('${key}')" title="O'chirish" style="background:rgba(231, 76, 60, 0.2); border:1px solid #e74c3c; padding:8px 12px; border-radius:5px; cursor:pointer; color:#e74c3c; margin-left:5px;"><i class="fas fa-trash"></i></button>` : ''}
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    };

    window.openUserEditModal = function (username = null) {
        const user = username ? users[username] : { name: '', password: '', role: 'bolinma' };
        const isEdit = !!username;
        const exists = document.getElementById('user-edit-modal');
        if (exists) exists.remove();

        const formHtml = `
            <div id="user-edit-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9100; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);">
                <div style="background:#2c3e50; padding:30px; border-radius:15px; width:450px; color:white; border:1px solid rgba(255,255,255,0.1); box-shadow:0 10px 40px rgba(0,0,0,0.5);">
                    <h3 style="margin-top:0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px; margin-bottom:20px;">${isEdit ? 'Foydalanuvchini Tahrirlash' : 'Yangi Foydalanuvchi'}</h3>
                    
                    <label style="display:block; margin-bottom:5px; color:#aaa; font-size:0.9em;">Login (ID)*</label>
                    <input type="text" id="edit-user-login" value="${username || ''}" ${isEdit ? 'readonly' : ''} style="width:100%; padding:12px; margin-bottom:15px; background:${isEdit ? '#34495e' : 'rgba(0,0,0,0.2)'}; color:${isEdit ? '#bdc3c7' : 'white'}; border:1px solid rgba(255,255,255,0.1); border-radius:5px;">
                    
                    <label style="display:block; margin-bottom:5px; color:#aaa; font-size:0.9em;">Ism (F.I.SH)*</label>
                    <input type="text" id="edit-user-name" value="${escapeHtml(user.name)}" style="width:100%; padding:12px; margin-bottom:15px; background:rgba(0,0,0,0.2); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:5px;">
                    
                    <label style="display:block; margin-bottom:5px; color:#aaa; font-size:0.9em;">Parol*</label>
                    <input type="text" id="edit-user-pass" value="${user.password}" style="width:100%; padding:12px; margin-bottom:15px; background:rgba(0,0,0,0.2); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:5px;">
                    
                    <label style="display:block; margin-bottom:5px; color:#aaa; font-size:0.9em;">Rol</label>
                    <select id="edit-user-role" style="width:100%; padding:12px; margin-bottom:20px; background:#1e293b; color:white; border:1px solid rgba(255,255,255,0.1); border-radius:5px;">
                        <option value="bolinma" ${user.role === 'bolinma' ? 'selected' : ''}>Bo'linma</option>
                        <option value="department" ${user.role === 'department' ? 'selected' : ''}>Bo'lim (Boshqarma)</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                    
                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
                        <button onclick="document.getElementById('user-edit-modal').remove()" style="padding:10px 20px; background:transparent; border:1px solid #95a5a6; color:#aaa; border-radius:5px; cursor:pointer;">Bekor qilish</button>
                        <button onclick="saveAdminUser('${isEdit ? username : ''}')" style="padding:10px 25px; background:linear-gradient(135deg, #2ecc71, #27ae60); border:none; color:white; border-radius:5px; cursor:pointer; font-weight:bold;">Saqlash</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', formHtml);
    };

    window.saveAdminUser = function (oldLogin) {
        const login = document.getElementById('edit-user-login').value.trim();
        const name = document.getElementById('edit-user-name').value.trim();
        const pass = document.getElementById('edit-user-pass').value.trim();
        const role = document.getElementById('edit-user-role').value;

        if (!login || !name || !pass) {
            showToast("Barcha maydonlarni to'ldiring!", "warning");
            return;
        }

        if (!oldLogin && users[login]) {
            showToast("Bunday login mavjud! Boshqa login tanlang.", "error");
            return;
        }

        // Agar yangi login bo'lsa va eski login bo'lsa (rename is not supported nicely without delete, so we assume ID is immutable or handled)
        // Actually simplest is: if oldLogin exists and != login, delete old one.
        // But here input is readonly if edit. So rename impossible. Good.

        // Departments logic placeholder (defaulting based on role)
        let depts = [];
        let bols = [];

        if (role === 'bolinma') {
            bols = [login]; // Assume login is 'bolinmaX'
            // Default departments for bolinma
            depts = ['ishlab-chiqarish', 'xodimlar', 'bugalteriya', 'mexanika', 'mehnat-muhofazasi'];
        } else if (role === 'department') {
            depts = [login]; // Assume login is 'xodimlar', etc.
        } else {
            // Admin
            depts = defaultUsers.admin.departments;
            bols = defaultUsers.admin.bolinmalar;
        }

        // Preserve existing extra data if editing
        if (oldLogin && users[oldLogin]) {
            depts = users[oldLogin].departments || depts;
            bols = users[oldLogin].bolinmalar || bols;
        }

        users[login] = {
            password: pass,
            name: name,
            role: role,
            departments: depts,
            bolinmalar: bols
        };

        saveUsers();
        renderAdminUserList();
        document.getElementById('user-edit-modal').remove();
    };

    window.deleteAdminUser = function (login) {
        if (confirm(login + " foydalanuvchisini o'chirishni tasdiqlaysizmi?")) {
            delete users[login];
            saveUsers();
            renderAdminUserList();
        }
    };

    window.exportFullSystemBackup = function () {
        const backup = {
            users: users,
            savedWorkers: JSON.parse(localStorage.getItem('smart_pch_workers') || '[]'),
            savedTrains: JSON.parse(localStorage.getItem('smart_pch_trains') || '[]'),
            savedStations: JSON.parse(localStorage.getItem('smart_pch_stations') || '[]'),
            date: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'smart_pch_backup_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
    };


    function loadDepartmentScores() {
        const container = document.getElementById('departmentScoresEditor');
        container.innerHTML = '';

        competitionData.departments.forEach(dept => {
            const item = document.createElement('div');
            item.className = 'department-score-item';
            item.innerHTML = `
                    <label>${escapeHtml(dept.name)}</label>
                    <input type="number" min="0" max="100" value="${dept.score}" 
                           data-dept="${dept.id}" class="score-input">
                    <input type="color" value="${dept.color}" 
                           data-dept="${dept.id}" class="color-input" style="margin-top: 5px;">
                `;
            container.appendChild(item);
        });

        // Input o'zgarishlarini kuzatish
        document.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('change', updateDepartmentScore);
        });

        document.querySelectorAll('.color-input').forEach(input => {
            input.addEventListener('change', updateDepartmentColor);
        });
    }

    function updateDepartmentScore(e) {
        const deptId = e.target.getAttribute('data-dept');
        const score = parseInt(e.target.value);

        const dept = competitionData.departments.find(d => d.id === deptId);
        if (dept) {
            dept.score = score;
            saveDatabase();
            updateCompetitionChart();
        }
    }

    function updateDepartmentColor(e) {
        const deptId = e.target.getAttribute('data-dept');
        const color = e.target.value;

        const dept = competitionData.departments.find(d => d.id === deptId);
        if (dept) {
            dept.color = color;
            saveDatabase();
            updateCompetitionChart();
        }
    }

    function loadStationsList() {
        const container = document.getElementById('stationsList');
        container.innerHTML = '';

        competitionData.stations.forEach(station => {
            const item = document.createElement('div');
            item.className = 'station-item';
            item.innerHTML = `
                    <div>
                        <strong>${escapeHtml(station.name)}</strong> (${station.code})
                        <br>
                        <small>Yo'lovchilar: ${station.passengers} kuniga</small>
                    </div>
                    <div>
                        <button class="edit-station" data-id="${station.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-station" data-id="${station.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            container.appendChild(item);
        });

        // Bekatlarni tahrirlash va o'chirish
        document.querySelectorAll('.edit-station').forEach(btn => {
            btn.addEventListener('click', editStation);
        });

        document.querySelectorAll('.delete-station').forEach(btn => {
            btn.addEventListener('click', deleteStation);
        });
    }

    function addNewStation() {
        const nameInput = document.getElementById('newStationName');
        const codeInput = document.getElementById('newStationCode');

        const name = nameInput.value.trim();
        const code = codeInput.value.trim().toUpperCase();

        if (name && code) {
            const newStation = {
                id: Date.now(),
                name: name,
                code: code,
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                passengers: Math.floor(Math.random() * 1000) + 500
            };

            competitionData.stations.push(newStation);
            saveDatabase();
            loadStationsList();

            nameInput.value = '';
            codeInput.value = '';
            showToast('Yangi bekat qo\'shildi!', 'success');
        } else {
            SmartUtils.showToast('Iltimos, bekat nomi va kodini kiriting!', 'warning');
        }
    }

    function editStation(e) {
        const stationId = parseInt(e.target.closest('button').getAttribute('data-id'));
        const station = competitionData.stations.find(s => s.id === stationId);

        if (station) {
            const newName = prompt('Bekat nomini kiriting:', station.name);
            if (newName) station.name = newName;

            const newCode = prompt('Bekat kodini kiriting:', station.code);
            if (newCode) station.code = newCode.toUpperCase();

            const newPassengers = prompt('Kunlik yo\'lovchilar soni:', station.passengers);
            if (newPassengers) station.passengers = parseInt(newPassengers);

            saveDatabase();
            loadStationsList();
        }
    }

    function deleteStation(e) {
        const stationId = parseInt(e.target.closest('button').getAttribute('data-id'));

        if (confirm('Bu bekatni o\'chirishni istaysizmi?')) {
            competitionData.stations = competitionData.stations.filter(s => s.id !== stationId);
            saveDatabase();
            loadStationsList();
        }
    }

    function loadChartSettings() {
        document.getElementById('chartTypeSelect').value = competitionData.chartSettings.type;
        document.getElementById('chartBgColor').value = competitionData.chartSettings.backgroundColor;
        document.getElementById('showValues').checked = competitionData.chartSettings.showValues;
    }

    function saveChartSettings() {
        competitionData.chartSettings.type = document.getElementById('chartTypeSelect').value;
        competitionData.chartSettings.backgroundColor = document.getElementById('chartBgColor').value;
        competitionData.chartSettings.showValues = document.getElementById('showValues').checked;

        saveDatabase();
        updateCompetitionChart();
        showToast('Chart sozlamalari saqlandi!', 'success');
    }

    function switchAdminTab(tabId) {
        // Barcha tablarni yopish
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Faol tabni ochish
        document.querySelector(`.admin-tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    function openRailwayMapModal() {
        const modal = document.getElementById('railwayMapModal');
        modal.classList.add('active');
        document.getElementById('department-overlay').classList.add('active');
        drawRailwayMap();
    }

    function drawRailwayMap() {
        const mapContainer = document.getElementById('railwayMap');
        mapContainer.innerHTML = '';

        // Harita fonini chizish
        const mapWidth = mapContainer.clientWidth;
        const mapHeight = mapContainer.clientHeight;

        // Yo'l chizish
        const stations = competitionData.stations;

        for (let i = 0; i < stations.length - 1; i++) {
            const from = stations[i];
            const to = stations[i + 1];

            const line = document.createElement('div');
            line.className = 'railway-line';

            // Chiziq uzunligi va burchagini hisoblash
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            line.style.cssText = `
                    position: absolute;
                    left: ${from.x}%;
                    top: ${from.y}%;
                    width: ${length}%;
                    height: 4px;
                    background: linear-gradient(to right, #ffd700, #ff8c00);
                    transform-origin: 0 0;
                    transform: rotate(${angle}deg);
                    z-index: 10;
                `;

            mapContainer.appendChild(line);
        }

        // Bekatlarni chizish
        competitionData.stations.forEach(station => {
            const marker = document.createElement('div');
            marker.className = 'station-marker';
            marker.style.cssText = `
                    left: ${station.x}%;
                    top: ${station.y}%;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                `;
            marker.innerHTML = `<span>${station.code}</span>`;
            marker.setAttribute('data-station', station.id);

            // Tooltip yaratish
            const tooltip = document.createElement('div');
            tooltip.className = 'station-tooltip';
            tooltip.innerHTML = `
                    <strong>${escapeHtml(station.name)}</strong><br>
                    Kodi: ${station.code}<br>
                    Yo'lovchilar: ${station.passengers}/kun<br>
                    Status: Faol
                `;
            marker.appendChild(tooltip);

            // Tooltip ko'rsatish
            marker.addEventListener('mouseenter', function (e) {
                const tooltip = this.querySelector('.station-tooltip');
                tooltip.style.display = 'block';
                tooltip.style.left = '40px';
                tooltip.style.top = '0';
            });

            marker.addEventListener('mouseleave', function (e) {
                this.querySelector('.station-tooltip').style.display = 'none';
            });

            // Marker bosilganda
            marker.addEventListener('click', function () {
                showStationDetails(station);
            });

            mapContainer.appendChild(marker);
        });

        // Bekatlar ma'lumotlarini ko'rsatish
        showStationsInfo();
    }

    function showStationDetails(station) {
        alert(`
                Bekat: ${station.name}
                Kodi: ${station.code}
                Yo'lovchilar: ${station.passengers} kuniga
                Joylashuvi: X=${station.x}%, Y=${station.y}%
                
                Qo'shimcha ma'lumotlar:
                - Barcha poezdlar to'xtaydi
                - Elektron bilet sotuvi mavjud
                - Kutubxona va kafe xizmatlari
                - Wi-Fi mavjud
            `);
    }

    function showStationsInfo() {
        const container = document.getElementById('stationsInfo');
        container.innerHTML = '';

        competitionData.stations.forEach(station => {
            const info = document.createElement('div');
            info.className = 'station-info-item';
            info.innerHTML = `
                    <h5>${escapeHtml(station.name)} (${station.code})</h5>
                    <p><i class="fas fa-users"></i> Kunlik yo'lovchilar: ${station.passengers}</p>
                    <p><i class="fas fa-map-marker-alt"></i> Pozitsiya: ${station.x}%, ${station.y}%</p>
                    <hr>
                `;
            container.appendChild(info);
        });
    }

    // Database functions - tashqi (global) saveDatabase() va loadDatabase() funksiyalaridan foydalanamiz
    // Ular DB_NAME ('smart_pch_db') kaliti bilan ishlaydi

    // Chart functions


    function updateCompetitionChart() {
        if (!competitionChart) return;

        const deptNames = competitionData.departments.map(d => d.name);
        const deptScores = competitionData.departments.map(d => d.score);
        const deptColors = competitionData.departments.map(d => d.color);

        competitionChart.data.labels = deptNames;
        competitionChart.data.datasets[0].data = deptScores;
        competitionChart.data.datasets[0].backgroundColor = deptColors;
        competitionChart.data.datasets[0].borderColor = deptColors.map(c => c.replace('0.8', '1'));
        competitionChart.config.type = competitionData.chartSettings.type;

        competitionChart.update();
    }

    function updateChartType(type) {
        if (!competitionChart) return;

        competitionChart.config.type = type;
        competitionChart.update();
    }


    // Excel toolbar tugmalari
    document.getElementById('boldBtn')?.addEventListener('click', function () {
        document.execCommand('bold', false, null);
    });

    document.getElementById('italicBtn')?.addEventListener('click', function () {
        document.execCommand('italic', false, null);
    });

    document.getElementById('underlineBtn')?.addEventListener('click', function () {
        document.execCommand('underline', false, null);
    });

    document.getElementById('alignLeftBtn')?.addEventListener('click', function () {
        document.execCommand('justifyLeft', false, null);
    });

    document.getElementById('alignCenterBtn')?.addEventListener('click', function () {
        document.execCommand('justifyCenter', false, null);
    });

    document.getElementById('alignRightBtn')?.addEventListener('click', function () {
        document.execCommand('justifyRight', false, null);
    });

    // Excel qator/ustun qo'shish
    document.getElementById('insertRowBtn')?.addEventListener('click', function () {
        // Qator qo'shish logikasi
        showToast('Yangi qator qo\'shildi!', 'success');
    });

    document.getElementById('insertColumnBtn')?.addEventListener('click', function () {
        // Ustun qo'shish logikasi
        SmartUtils.showToast('Yangi ustun qo\'shildi!', 'success');
    });

    // Yangiliklarni yangilash
    document.addEventListener('click', function (e) {
        if (e.target.closest('.refresh-news')) {
            loadNews();
        }
    });
}

function updateChartType(type) {
    if (!competitionChart) return;

    competitionChart.config.type = type;
    competitionChart.update();
}

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('loginError');

    // Mantiqiy validatsiya
    if (!SmartUtils.validateInput(username)) {
        showToast('Iltimos, foydalanuvchi nomini kiriting!', 'warning');
        return;
    }
    if (!SmartUtils.validateInput(password)) {
        showToast('Iltimos, parolni kiriting!', 'warning');
        return;
    }

    const loadingToast = showToast('Tizimga kirilmoqda...', 'info', 10000);

    const result = await window.Auth.login(username, password);

    if (loadingToast) {
        if (window.SmartUtils) {
            window.SmartUtils.removeToast(loadingToast);
        } else {
            loadingToast.remove();
        }
    }

    if (result && result.success) {
        // Use currentUser from Auth module
        currentUser = window.Auth.currentUser;

        showMainSystem();
        errorDiv.style.display = 'none';

        // Premium Feedback
        showToast(`Xush kelibsiz, ${currentUser.name}!`, 'success');

        // Socket ulanishlarini yangi token bilan qayta ulash (agar sahifa tokensiz yuklangan bo'lsa)
        if (window.socket && !window.socket.connected) window.socket.connect();
        if (window.AppSocket && !window.AppSocket.connected) window.AppSocket.connect();

        // Real-vaqt signallar uchun brauzer bildirishnomasiga ruxsat so'rash (faqat bir marta)
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    } else {
        errorDiv.style.display = 'block';
        const msg = (result && result.message) || 'Login yoki parol noto\'g\'ri!';
        showToast(msg, 'error');
    }
}

function logout() {
    window.Auth.logout();
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('mainSystem').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function showMainSystem() {
    const landing = document.getElementById('landingPage');
    if (landing) {
        landing.style.setProperty('display', 'none', 'important');
        landing.style.setProperty('opacity', '0', 'important');
        landing.style.setProperty('visibility', 'hidden', 'important');
        landing.style.setProperty('z-index', '-9999', 'important');
    }

    const login = document.getElementById('loginPage');
    if (login) {
        login.style.setProperty('display', 'none', 'important');
        login.style.setProperty('opacity', '0', 'important');
        login.style.setProperty('visibility', 'hidden', 'important');
    }

    const mainSys = document.getElementById('mainSystem');
    if (mainSys) {
        mainSys.style.setProperty('display', 'flex', 'important');
        mainSys.style.cssText += ' display: flex !important; visibility: visible !important; opacity: 1 !important; ';
    }

    // Foydalanuvchi ma'lumotlarini yangilash
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0);

    // Tizimni ishga tushirish
    initializeSystem();
}

// --- DASHBOARD DATA FUNCTIONS (NEW) ---

function loadNews() {
    const newsContainer = document.querySelector('.news-container');
    if (!newsContainer) return;

    const newsData = [
        { title: "Yangi tezyurar poyezdlar qatnovi yo'lga qo'yildi", date: "25 Yanvar, 2026", icon: "fas fa-train" },
        { title: "Buxoro-Toshkent yo'nalishi bo'yicha qo'shimcha reyslar", date: "24 Yanvar, 2026", icon: "fas fa-route" },
        { title: "Temir yo'l xodimlari uchun yangi imtiyozlar tasdiqlandi", date: "22 Yanvar, 2026", icon: "fas fa-user-shield" },
        { title: "Raqamli tizimga o'tish bo'yicha yangi ko'rsatmalar", date: "20 Yanvar, 2026", icon: "fas fa-laptop-code" }
    ];

    newsContainer.innerHTML = newsData.map(news => `
                                    <div class="news-item" style="display:flex; align-items:center; margin-bottom:15px; padding:15px; background:rgba(255,255,255,0.05); border-radius:12px; border-left: 3px solid #00f2ff; transition:all 0.3s ease;">
                                        <div class="news-icon" style="min-width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(0, 242, 255, 0.1); margin-right:15px; font-size:1.2rem; color:#00f2ff; box-shadow: 0 0 10px rgba(0,242,255,0.2);"><i class="${news.icon}"></i></div>
                                        <div class="news-content">
                                            <h4 style="margin:0 0 5px 0; color:#e0f7ff; font-size:1rem; font-weight:600; text-shadow:0 0 5px rgba(0,198,255,0.3);">${escapeHtml(news.title)}</h4>
                                            <span style="font-size:0.8rem; color:rgba(255,255,255,0.6);"><i class="far fa-clock"></i> ${news.date}</span>
                                        </div>
                                    </div>
                                `).join('');

    // Add hover effects via JS since inline css hover is hard
    document.querySelectorAll('.news-item').forEach(item => {
        item.addEventListener('mouseenter', e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateX(5px)';
        });
        item.addEventListener('mouseleave', e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.transform = 'translateX(0)';
        });
    });
}



// Initialize default competition data if missing or corrupted
if (typeof competitionData === 'undefined' || !competitionData || !competitionData.departments) {
    competitionData = {
        departments: [
            { name: '1-bo\'linma', score: 95, color: '#3498db' },
            { name: '2-bo\'linma', score: 88, color: '#2ecc71' },
            { name: '3-bo\'linma', score: 72, color: '#e74c3c' },
            { name: '4-bo\'linma', score: 91, color: '#9b59b6' },
            { name: '5-bo\'linma', score: 84, color: '#f1c40f' },
            { name: '6-bo\'linma', score: 79, color: '#e67e22' }
        ],
        chartSettings: { type: 'bar' },
        stations: [],
        values: {}
    };
}

function initializeSystem() {
    const safeCall = (fn, name) => {
        try { if (typeof fn === 'function') fn(); }
        catch (e) { console.error(`System Initialization Failed at ${name}:`, e); }
    };

    safeCall(renderSidebar, 'renderSidebar');
    safeCall(renderMainContent, 'renderMainContent');
    safeCall(loadNews, 'loadNews');
    safeCall(loadWeatherData, 'loadWeatherData');
    safeCall(createCompetitionChart, 'createCompetitionChart');
    safeCall(createExcelTable, 'createExcelTable');
    safeCall(showAdminButton, 'showAdminButton');
    safeCall(showDispatcherElements, 'showDispatcherElements');

    // Load initial data from server
    safeCall(() => {
        if (typeof loadReportsFromServer === 'function') loadReportsFromServer();
    }, 'loadReportsFromServer');
}

function showDispatcherElements() {
    const btn = document.getElementById('openDispatcherIntegrationBtn');
    if (btn) {
        if (currentUser && (currentUser.role === 'admin' || (currentUser.departments || []).includes('dispetcher'))) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    }

    // Defektaskop button - show for all logged-in users
    const defectBtn = document.getElementById('openDefectoscopeBtn');
    if (defectBtn && currentUser) {
        defectBtn.style.display = 'flex';
    }
}

function renderSidebar() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    sidebarMenu.innerHTML = '';
    
    // Dashboard (Bosh sahifa) ro'li bo'yicha turlicha nomlanadi
    const dashboardLi = document.createElement('li');
    dashboardLi.setAttribute('data-target', 'dashboard');
    
    if (currentUser.role === 'bolinma') {
        dashboardLi.innerHTML = `
            <i class="fas fa-home"></i>
            <span>Mening Bo'linmam</span>
        `;
    } else {
        dashboardLi.innerHTML = `
            <i class="fas fa-tachometer-alt"></i>
            <span>Umumiy Dashboard</span>
        `;
    }
    
    // Faqat admin, ishlab_chiqarish yoki o'zining bo'linmasini ko'radiganlarga Dashboard ko'rsatiladi
    sidebarMenu.appendChild(dashboardLi);

    // Role based filtering logic
    const allItems = window.INITIAL_DATA.departments || [];
    const userRole = currentUser.role;
    const userDepts = currentUser.departments || [];
    const userBol = currentUser.bolinmalar || [];

    allItems.forEach(dept => {
        if (dept.id === 'dashboard') return;

        let hasAccess = false;
        if (userRole === 'admin') {
            hasAccess = true;
        } else if (userRole === 'department') {
            // Department role users can see their own functional department
            // AND all subdivisions to monitor their section in each
            if (userDepts.includes(dept.id) || dept.type === 'bolinma') hasAccess = true;
        } else if (userRole === 'bolinma') {
            if (userBol.includes(dept.id)) hasAccess = true;
        }

        if (!hasAccess) return;

        const li = document.createElement('li');
        li.setAttribute('data-target', dept.id);
        li.innerHTML = `
                    <i class="${dept.icon}"></i>
                    <span>${escapeHtml(dept.name)}</span>
                `;
        sidebarMenu.appendChild(li);
    });

    if (currentUser && currentUser.role === 'bolinma') {
        const bolinmaArchiveLi = document.createElement('li');
        bolinmaArchiveLi.innerHTML = '<i class="fas fa-archive" style="color: #10b981;"></i> <span>Mening Arxivim</span>';
        bolinmaArchiveLi.style.cursor = 'pointer';
        bolinmaArchiveLi.addEventListener('click', () => {
            const bolId = currentUser.bolinmalar && currentUser.bolinmalar[0] ? currentUser.bolinmalar[0] : null;
            if (window.openBolinmaArchiveDashboard && bolId) {
                document.querySelectorAll(".sidebar-menu li").forEach(li => li.classList.remove("active"));
                bolinmaArchiveLi.classList.add("active");
                window.openBolinmaArchiveDashboard(bolId);
            }
        });
        sidebarMenu.appendChild(bolinmaArchiveLi);
    }

    // Sidebar navigatsiya
    document.querySelectorAll("[data-target]").forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            document.querySelectorAll(".sidebar-menu li").forEach(li => li.classList.remove("active"));
            item.classList.add("active");

            document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
            const section = document.getElementById(target);
            if (section) {
                section.classList.add("active");
            }

            // Har qanday bo'lim yoki bo'linma uchun — tegishli oynani darhol ochish
            if (target !== 'dashboard') {
                const isDept = typeof functionalDepartments !== 'undefined' && functionalDepartments.some(d => d.id === target);
                if (isDept) {
                    if (typeof openDepartmentWindow === "function") {
                        openDepartmentWindow(target);
                    }
                } else if (window.INITIAL_DATA && window.INITIAL_DATA.departments) {
                    // Bo'linma bo'lsa, xodimlar ro'yxati (Face ID davomat) ochiladi
                    const isBolinma = window.INITIAL_DATA.departments.some(d => d.id === target && d.type === 'bolinma');
                    if (isBolinma && window.StaffAttendance) {
                        window.StaffAttendance.init(target);
                    }
                }
            }
        });
    });

    // Faol bo'limni belgilash
    if (currentUser.role === 'bolinma') {
        const firstBolinma = (currentUser.bolinmalar || [])[0];
        if (firstBolinma) {
            const bolinmaLink = sidebarMenu.querySelector(`[data-target="${firstBolinma}"]`);
            if (bolinmaLink) bolinmaLink.classList.add('active');

            // Dashboardni active qilish (qora ekranni oldini olish uchun)
            document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
            const dashSection = document.getElementById('dashboard');
            if (dashSection) {
                dashSection.classList.add('active');
            }

            // To'liq subdivision dashboardini ishga tushirish
            setTimeout(() => {
                if (typeof initSubdivisionFeatures === 'function') {
                    initSubdivisionFeatures(firstBolinma);
                } else if (window.StaffAttendance) {
                    window.StaffAttendance.init(firstBolinma);
                }
            }, 300);
        }
    } else if (currentUser.role !== 'admin' && (currentUser.departments || []).includes('mexanika')) {
        const mexLink = sidebarMenu.querySelector('[data-target="mexanika"]');
        if (mexLink) {
            mexLink.classList.add('active');
            // Contentni ham active qilish kerak
            document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
            const section = document.getElementById('mexanika');
            if (section) section.classList.add("active");
        } else {
            if (sidebarMenu.firstElementChild) sidebarMenu.firstElementChild.classList.add('active');
        }
    } else {
        // Standart holat - birinchi element (Dashboard)
        if (sidebarMenu.firstElementChild) {
            sidebarMenu.firstElementChild.classList.add('active');
            const target = sidebarMenu.firstElementChild.getAttribute('data-target');
            document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
            const section = document.getElementById(target);
            if (section) section.classList.add("active");
        }
    }
}

function createDashboardSection() {
    const section = document.createElement('section');
    section.id = 'dashboard';
    section.className = 'content-section active';

    const userDepts = currentUser.departments || [];
    const userFiles = uploadedFiles.filter(f => userDepts.includes(f.department));
    const totalFiles = userFiles.length;
    const approvedFiles = userFiles.filter(f => f.status === 'approved').length;
    const pendingFiles = userFiles.filter(f => f.status === 'pending').length;

    // HRM bo'limi - faqat admin va xodimlar bo'limi uchun
    let hrmSection = '';
    if (currentUser.role === 'admin' || userDepts.includes('xodimlar')) {
        if (typeof renderHRDashboard === 'function') {
            hrmSection = `
                <div class="hr-integrated-section" style="margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px;">
                    <div style="margin-bottom: 25px;">
                        <h2 style="color: #00c6ff; display: flex; align-items: center; gap: 12px; margin: 0; font-size: 1.8rem; font-weight: 850; text-shadow: 0 0 15px rgba(0, 198, 255, 0.3);">
                            <i class="fas fa-users-cog" style="color: #00c6ff;"></i>
                            Xodimlar Bo'limi - Boshqaruv Paneli
                        </h2>
                    </div>
                    ${renderHRDashboard()}
                </div>
            `;
            // Chartlarni ishga tushirish
            setTimeout(() => {
                if (typeof initHRCharts === 'function') initHRCharts();
                // Ma'lumotlar kelgan bo'lsa darhol jadvalni yangilash
                if (typeof initHRData === 'function') {
                    initHRData().then(() => {
                        if (typeof filterEmployees === 'function') filterEmployees();
                    });
                }
            }, 500);
        } else {
            hrmSection = `
                <div class="hrm-section">
                    <div class="hrm-header">
                        <h2><i class="fas fa-users"></i> HRM - Xodimlar Boshqaruv Tizimi</h2>
                        <div class="hrm-controls">
                            <button class="hrm-btn" onclick="refreshHRM()">
                                <i class="fas fa-sync-alt"></i> Yangilash
                            </button>
                            <button class="hrm-btn primary" onclick="openHRMNewTab()">
                                <i class="fas fa-external-link-alt"></i> Yangi oynada ochish
                            </button>
                        </div>
                    </div>
                    <div class="hrm-container">
                        <iframe 
                            id="hrmFrame"
                            src="https://hrm.railway.uz/hrm/dashboard" 
                            frameborder="0" 
                            allowfullscreen
                            style="width: 100%; height: 800px; border-radius: 15px; background: white;"
                            onerror="handleHRMError()"
                        ></iframe>
                        <div id="hrmFallback" class="hrm-fallback" style="display: none;">
                            <div class="hrm-fallback-content">
                                <i class="fas fa-exclamation-triangle"></i>
                                <h3>HRM tizimini iframe ichida ochib bo'lmadi</h3>
                                <p>Xavfsizlik sababli tashqi sayt bu yerda ko'rsatilmayapti.</p>
                                <button class="hrm-open-btn" onclick="openHRMNewTab()">
                                    <i class="fas fa-external-link-alt"></i> HRM tizimini ochish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Dashboard Content Logic
    let dashboardContent = '';
    const bolinmaId = currentUser.bolinmalar && currentUser.bolinmalar[0] ? currentUser.bolinmalar[0] : 'Bo\'linma';
    const bolinmaName = typeof window.getBolinmaName === 'function' ? window.getBolinmaName(bolinmaId) : bolinmaId;

    // --- PREMIUM GLOBAL HERO ---
    const globalHero = `
        <div class="dashboard-hero" style="margin-bottom: 30px; border-radius: 24px; padding: 40px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1541446543785-f2c92b1fec46?q=80&w=2000&auto=format&fit=crop'); background-size: cover; border: 1px solid rgba(212, 175, 55, 0.3);">
            <div class="hero-content">
                <div class="hero-welcome" style="color: #ffd700; letter-spacing: 3px; font-weight: 800; font-size: 0.8rem; margin-bottom: 10px;">SMART PCH BOSHQRUV MARKAZI</div>
                <h1 class="hero-title" style="font-size: 2.5rem; font-weight: 900; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    ${escapeHtml(currentUser.name || 'Foydalanuvchi')} xush kelibsiz!
                </h1>
                <p style="color: #94a3b8; margin-top: 10px; max-width: 600px;">Bugun tizimda barcha ko'rsatkichlar barqaror. Ish vaqtini samarali tashkil eting.</p>
                
                <div class="hero-actions" style="margin-top: 25px; display: flex; gap: 15px;">
                    <button onclick="window.SmartRouting && window.SmartRouting.navigate('/reports')" class="gold-btn" style="padding: 12px 25px; border-radius: 12px; font-weight: 800; border: none; background: linear-gradient(135deg, #ffd700, #b4941f); color: #000; cursor: pointer;">
                        HISOBOTLARNI KO'RISH
                    </button>
                    <button onclick="document.getElementById('aiAssistantBtn').click()" style="padding: 12px 25px; border-radius: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; cursor: pointer; font-weight: 600;">
                        AI YORDAMCHI
                    </button>
                </div>
            </div>
        </div>
    `;

    if (currentUser.role === 'admin') {
        section.classList.add('admin-dashboard-active');
        // ======== ADMIN DASHBOARD ========
        dashboardContent = `
            <!-- Admin Boshqaruv Markazi -->
            <div style="background: linear-gradient(135deg, rgba(0,198,255,0.08), rgba(0,114,255,0.04)); border: 1px solid rgba(0,198,255,0.12); border-radius: 20px; padding: 28px; margin-bottom: 25px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(0,198,255,0.06), transparent); border-radius: 50%;"></div>
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; position: relative; z-index: 1;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.6rem; background: linear-gradient(45deg, #00c6ff, #0072ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;">
                            <i class="fas fa-crown" style="-webkit-text-fill-color: #ffd700; margin-right: 10px;"></i> Administrator Boshqaruv Markazi
                        </h2>
                        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.5); font-size: 0.9rem;">
                            <i class="far fa-calendar-alt"></i> ${new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })} &bull;
                            <span style="color: #2ecc71;"><i class="fas fa-circle" style="font-size: 0.5rem; vertical-align: middle;"></i> Tizim faol</span>
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button onclick="document.getElementById('openAdminPanelBtn')?.click()" style="padding: 10px 20px; background: linear-gradient(135deg, #e74c3c, #c0392b); border: none; border-radius: 10px; color: white; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; transition: all 0.3s;">
                            <i class="fas fa-cogs"></i> Admin Panel
                        </button>
                        <button onclick="document.getElementById('openTrainMapBtn')?.click()" style="padding: 10px 20px; background: linear-gradient(135deg, #3498db, #2980b9); border: none; border-radius: 10px; color: white; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; transition: all 0.3s;">
                            <i class="fas fa-map-marked-alt"></i> Xarita
                        </button>
                    </div>
                </div>
                ${typeof AdminDashboard !== 'undefined' ? AdminDashboard.render() : '<div style="margin:20px; color:orange;">Admin Dashboard yuklanmoqda...</div>'}
            </div>
            ${hrmSection}
        `;
        setTimeout(() => { if (typeof AdminDashboard !== 'undefined') AdminDashboard.init(); }, 300);
    } else if (userDepts.includes('dispetcher')) {
        dashboardContent = `
        <div style="margin-bottom: 30px;">
            ${getDispatcherDashboardHTML()}
        </div>
        `;
    } else if (currentUser.role === 'bolinma') {
        dashboardContent = getSmartSubdivisionDashboardHTML(currentUser);
        // Bolinma dashboardida umumiy widgetlar kerak emas (faqat AI Assistant qo'shiladi)
        dashboardContent += `
        <!-- GLOBAL AI ASSISTANT OVERRIDE -->
        <div id="aiAssistantBtn" class="ai-floating-btn" title="Smart AI Yordamchi" style="position: fixed; bottom: 30px; right: 30px; width: 65px; height: 65px; border-radius: 50%; background: linear-gradient(135deg, #38bdf8, #2563eb); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; cursor: pointer; z-index: 10000; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4); border: 2px solid rgba(255,255,255,0.2);">
            <i class="fas fa-robot"></i>
        </div>

        <div id="aiChatWindow" style="position: fixed; bottom: 110px; right: 30px; width: 380px; height: 500px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(30px); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 30px 60px rgba(0,0,0,0.4); display: none; flex-direction: column; overflow: hidden; z-index: 9999;">
            <div style="padding: 20px; background: linear-gradient(90deg, #3b82f6, #1d4ed8); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-robot"></i>
                    <span style="font-weight: 800; font-size: 0.9rem;">SMART AI ASSISTANT</span>
                </div>
                <i class="fas fa-times" id="closeAiChat" style="cursor: pointer;"></i>
            </div>
            <div id="aiMessages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px;"></div>
            <div style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 10px;">
                <input type="text" id="aiInput" placeholder="Savollingizni yozing..." style="flex: 1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px; color: #fff;">
                <button id="sendAiMsg" style="background: #3b82f6; border: none; color: white; width: 40px; border-radius: 10px; cursor: pointer;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>`;
        section.innerHTML = dashboardContent;
        // Initialize functionality after render
        setTimeout(() => {
            if (typeof initSubdivisionFeatures === 'function') initSubdivisionFeatures();
            if (typeof window.initAiAssistant === 'function') window.initAiAssistant();
        }, 500);
        return section;
    } else if (userDepts.includes('mexanika') && currentUser.role !== 'admin') {
        // SPECIAL: Render Mechanics Management for Mechanics user dashboard
        setTimeout(() => {
            const container = section.querySelector('#mechanics-dashboard-container');
            if (container && typeof renderMechanicsSection === 'function') {
                renderMechanicsSection(container, 'mexanika');
            }
        }, 100);
        dashboardContent = `<div id="mechanics-dashboard-container">Mexanika tizimi yuklanmoqda...</div>`;
    } else {
        dashboardContent = hrmSection;
    }

    section.innerHTML = `
        <style>
            .standard-grid { display: grid; grid-template-columns: 1fr; gap: 25px; margin-top: 20px; width: 100%; box-sizing: border-box; }
            @media (min-width: 1200px) {
                .standard-grid { grid-template-columns: 2fr 1fr; }
            }
            .premium-card { 
                background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); 
                border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; 
                padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                transition: 0.3s; width: 100%; box-sizing: border-box; overflow: hidden;
            }
            .premium-card:hover { border-color: rgba(212, 175, 55, 0.3); transform: translateY(-3px); }
            .card-title { font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
            .pulse-green { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite; display: inline-block; margin-right: 8px; }
            
            /* Admin Specific Adjustments if needed */
            .admin-dashboard-active .standard-grid { grid-template-columns: 1fr; }
            @media (min-width: 1600px) {
                .admin-dashboard-active .standard-grid { grid-template-columns: 3fr 1fr; }
            }
        </style>

        ${globalHero}

        <div class="standard-grid">
            <div style="display: flex; flex-direction: column; gap: 25px;">
                <!-- Specialized Department Widgets Container -->
                <div id="dashboard-home-widgets" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <!-- Injected dynamically -->
                </div>
                
                ${dashboardContent}

                <!-- Competition Section -->
                <div class="premium-card">
                    <div class="card-title"><i class="fas fa-chart-line" style="color: #38bdf8;"></i> BO'LIMLAR O'RTASIDAGI RAQOBAT</div>
                    <div style="height: 350px; position: relative;">
                        <canvas id="competitionChart"></canvas>
                    </div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 25px;">
                <!-- Weather Widget -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(56, 189, 248, 0.05));">
                    <div class="card-title"><i class="fas fa-cloud-sun" style="color: #f59e0b;"></i> OB-HAVO (BUXORO)</div>
                    <div class="weather-container" style="min-height: 150px;">
                        <!-- Weather injected here -->
                    </div>
                    <div style="display: flex; gap: 5px; margin-top: 15px;">
                        <button class="weather-btn active" data-time="current" style="font-size: 0.7rem; padding: 4px 8px; border-radius: 6px;">Hozir</button>
                        <button class="weather-btn" data-time="hourly" style="font-size: 0.7rem; padding: 4px 8px; border-radius: 6px;">Soatlik</button>
                    </div>
                </div>

                <!-- News Widget -->
                <div class="premium-card">
                    <div class="card-title"><i class="fas fa-newspaper" style="color: #60a5fa;"></i> SO'NGGI YANGILIKLAR</div>
                    <div class="news-container" style="font-size: 0.85rem; line-height: 1.6;">
                        <!-- News items injected here -->
                    </div>
                </div>

                <!-- Department Quick Links if any -->
                <div class="premium-card">
                    <div class="card-title"><i class="fas fa-building" style="color: #ffd700;"></i> SIZNING BO'LIMLARINGIZ</div>
                    <div class="journal-list" style="display: flex; flex-direction: column; gap: 10px;">
                        ${functionalDepartments
            .filter(dept => currentUser.role === 'admin' || userDepts.includes(dept.id))
            .map(dept => `
                                <div onclick="window.SmartRouting.navigate('/${dept.id}')" style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); transition: 0.2s;">
                                    <div style="font-weight: 700; color: #fff;">${escapeHtml(dept.name)}</div>
                                    <div style="font-size: 0.7rem; color: #94a3b8;">${dept.description.substring(0, 50)}...</div>
                                </div>
                            `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- GLOBAL AI ASSISTANT OVERRIDE (ensure it is present) -->
        <div id="aiAssistantBtn" class="ai-floating-btn" title="Smart AI Yordamchi" style="position: fixed; bottom: 30px; right: 30px; width: 65px; height: 65px; border-radius: 50%; background: linear-gradient(135deg, #38bdf8, #2563eb); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; cursor: pointer; z-index: 10000; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4); border: 2px solid rgba(255,255,255,0.2);">
            <i class="fas fa-robot"></i>
        </div>

        <div id="aiChatWindow" style="position: fixed; bottom: 110px; right: 30px; width: 380px; height: 500px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(30px); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 30px 60px rgba(0,0,0,0.4); display: none; flex-direction: column; overflow: hidden; z-index: 9999;">
            <div style="padding: 20px; background: linear-gradient(90deg, #3b82f6, #1d4ed8); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-robot"></i>
                    <span style="font-weight: 800; font-size: 0.9rem;">SMART AI ASSISTANT</span>
                </div>
                <i class="fas fa-times" id="closeAiChat" style="cursor: pointer;"></i>
            </div>
            <div id="aiMessages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px;"></div>
            <div style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 10px;">
                <input type="text" id="aiInput" placeholder="Savollingizni yozing..." style="flex: 1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px; color: #fff;">
                <button id="sendAiMsg" style="background: #3b82f6; border: none; color: white; width: 40px; border-radius: 10px; cursor: pointer;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    // Re-initialize widgets after injection
    setTimeout(() => {
        if (typeof renderWeather === 'function') renderWeather();
        if (typeof loadNews === 'function') loadNews();
        if (typeof createCompetitionChart === 'function') createCompetitionChart();
        if (typeof window.initAiAssistant === 'function') window.initAiAssistant();

        // Specialized Department Home Widgets Injection
        const widgetContainer = section.querySelector('#dashboard-home-widgets');
        if (widgetContainer) {
            if (userDepts.includes('metrologiya')) {
                renderMetrologyHomeWidgets(widgetContainer);
            } else if (userDepts.includes('ishlab-chiqarish')) {
                renderProductionHomeWidgets(widgetContainer);
            } else if (userDepts.includes('mehnat-muhofazasi')) {
                renderSafetyHomeWidgets(widgetContainer);
            } else if (userDepts.includes('mexanika')) {
                renderMechanicsHomeWidgets(widgetContainer);
            } else if (userDepts.includes('bugalteriya')) {
                renderAccountingHomeWidgets(widgetContainer);
            }
        }
    }, 300);

    return section;
}

/**
 * Renders specialized Metrology widgets for the Home dashboard
 * Full SMM (Sarflangan Miqdor Monitoringi) — Elektr hisoblagichlar dashboardi
 */
window.renderMetrologyHomeWidgets = async function renderMetrologyHomeWidgets(container) {
    if (!container) return;

    // Expand container to full width for a proper dashboard feel
    container.style.gridColumn = '1 / -1';
    container.style.display = 'block';

    try {
        const user = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const bolinmaId = (user.bolinmalar && Array.isArray(user.bolinmalar) && user.bolinmalar.length > 0) ? user.bolinmalar[0] : 'admin';

        // Fetch all data in parallel
        let [summary, comp, upcoming] = await Promise.all([
            SmartUtils.fetchAPI(`/metrology/electricity/summary`).catch(err => { console.error("Summary fetch error", err); return []; }),
            SmartUtils.fetchAPI(`/metrology/electricity/compare/${bolinmaId}`).catch(() => null),
            SmartUtils.fetchAPI(`/metrology/devices/upcoming`).catch(() => [])
        ]);

        // Defensive: ensure they are arrays
        if (!Array.isArray(summary)) summary = [];
        if (!Array.isArray(upcoming)) upcoming = [];

        // Demo data for visualization (if server returns empty or invalid)
        if (summary.length === 0) {
            summary = [
                { bolinma_id: 'bolinma1', date: new Date().toLocaleDateString(), lastReading: 12500, currentMonth: 3800, status: 'pending' },
                { bolinma_id: 'bolinma2', date: new Date().toLocaleDateString(), lastReading: 8200, currentMonth: 850, status: 'approved' },
                { bolinma_id: 'bolinma3', date: new Date(Date.now() - 86400000).toLocaleDateString(), lastReading: 45000, currentMonth: 9500, status: 'pending' },
                { bolinma_id: 'bolinma4', date: new Date().toLocaleDateString(), lastReading: 6100, currentMonth: 2200, status: 'approved' },
                { bolinma_id: 'bolinma5', date: '', lastReading: 0, currentMonth: 0, status: 'not_submitted' },
                { bolinma_id: 'bolinma6', date: new Date().toLocaleDateString(), lastReading: 9800, currentMonth: 4100, status: 'pending' },
                { bolinma_id: 'bolinma7', date: new Date(Date.now() - 2 * 86400000).toLocaleDateString(), lastReading: 15300, currentMonth: 1500, status: 'approved' },
                { bolinma_id: 'bolinma8', date: new Date().toLocaleDateString(), lastReading: 22000, currentMonth: 5800, status: 'pending' },
                { bolinma_id: 'bolinma9', date: '', lastReading: 0, currentMonth: 0, status: 'not_submitted' },
                { bolinma_id: 'bolinma10', date: new Date().toLocaleDateString(), lastReading: 11000, currentMonth: 3100, status: 'pending' }
            ];
        }

        const submitted = summary.filter(s => s && s.status !== 'not_submitted');
        const notSubmitted = summary.filter(s => s && s.status === 'not_submitted');

        // Safe number extraction
        const getVal = (v) => (typeof v === 'number' ? v : (parseFloat(v) || 0));

        const maxCons = Math.max(...submitted.map(s => getVal(s.currentMonth)), 1);
        const avgCons = submitted.length > 0 ? submitted.reduce((a, b) => a + getVal(b.currentMonth), 0) / submitted.length : 0;
        const totalConsumption = submitted.reduce((a, b) => a + getVal(b.currentMonth), 0);

        // Smart Alerts
        const overuseAlerts = submitted.filter(s => getVal(s.currentMonth) > avgCons * 1.3);

        // === KPI CARDS ===
        const kpiHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; margin-bottom: 28px;">
            <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(37, 99, 235, 0.08)); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 18px; padding: 22px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(56, 189, 248, 0.15), transparent); border-radius: 50%;"></div>
                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 800; letter-spacing: 1.5px;">UMUMIY SARFIYOT</div>
                <div style="font-size: 2rem; font-weight: 900; color: #38bdf8; margin: 6px 0;">${totalConsumption.toLocaleString()}</div>
                <div style="font-size: 0.75rem; color: #64748b;">kWh (joriy oy)</div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.08)); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 18px; padding: 22px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent); border-radius: 50%;"></div>
                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 800; letter-spacing: 1.5px;">TOPSHIRDI</div>
                <div style="font-size: 2rem; font-weight: 900; color: #10b981; margin: 6px 0;">${submitted.length}</div>
                <div style="font-size: 0.75rem; color: #64748b;">bo'linma</div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(185, 28, 28, 0.08)); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 18px; padding: 22px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(239, 68, 68, 0.15), transparent); border-radius: 50%;"></div>
                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 800; letter-spacing: 1.5px;">TOPSHIRMADI</div>
                <div style="font-size: 2rem; font-weight: 900; color: #ef4444; margin: 6px 0;">${notSubmitted.length}</div>
                <div style="font-size: 0.75rem; color: #64748b;">bo'linma</div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08)); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 18px; padding: 22px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(245, 158, 11, 0.15), transparent); border-radius: 50%;"></div>
                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 800; letter-spacing: 1.5px;">SIGNALLAR</div>
                <div style="font-size: 2rem; font-weight: 900; color: #f59e0b; margin: 6px 0;">${overuseAlerts.length}</div>
                <div style="font-size: 0.75rem; color: #64748b;">ogohlantirish</div>
            </div>
        </div>`;

        // === SMM BAR CHART ===
        const chartHTML = `
        <div class="premium-card" style="margin-bottom: 25px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border: 1px solid rgba(56, 189, 248, 0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div class="card-title" style="margin-bottom: 0;"><i class="fas fa-tachometer-alt" style="color: #38bdf8;"></i> SMM: Sarflangan Miqdor Monitoringi</div>
                <div style="font-size: 0.72rem; color: #475569; font-weight: 700;"><i class="fas fa-calendar-alt"></i> ${new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })}</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${submitted.map(s => {
            const cMonth = getVal(s.currentMonth);
            const pct = Math.max((cMonth / maxCons) * 100, 3);
            const isHigh = cMonth > avgCons * 1.3;
            const color = isHigh ? 'linear-gradient(90deg, #ef4444, #b91c1c)' : 'linear-gradient(90deg, #38bdf8, #2563eb)';
            const bName = typeof window.getBolinmaName === 'function' ? window.getBolinmaName(s.bolinma_id) : s.bolinma_id;
            return `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 120px; font-weight: 700; font-size: 0.82rem; color: ${isHigh ? '#ef4444' : '#cbd5e1'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${bName}">${bName}</div>
                        <div style="flex: 1; background: rgba(255,255,255,0.04); height: 22px; border-radius: 11px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; position: relative;">
                            <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 11px; box-shadow: ${isHigh ? '0 0 12px rgba(239, 68, 68, 0.4)' : '0 0 8px rgba(56, 189, 248, 0.2)'}; transition: width 1s ease;"></div>
                        </div>
                        <div style="width: 80px; text-align: right; font-weight: 800; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: ${isHigh ? '#ef4444' : '#fff'};">${cMonth.toLocaleString()}</div>
                        <div style="width: 40px; text-align: center;">${isHigh ? '<i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 0.8rem;"></i>' : '<i class="fas fa-check-circle" style="color: #10b981; font-size: 0.8rem;"></i>'}</div>
                    </div>`;
        }).join('')}
            </div>
        </div>`;

        // === READINGS TABLE + ALERTS GRID ===
        const gridHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 22px;">
            <!-- Table -->
            <div class="premium-card" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.06);">
                <div class="card-title"><i class="fas fa-clipboard-list" style="color: #f59e0b;"></i> Bo'linmalar Ko'rsatkichlari Jadvali</div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid rgba(56, 189, 248, 0.15);">
                                <th style="text-align: left; padding: 12px; font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 800;">Bo'linma</th>
                                <th style="text-align: left; padding: 12px; font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 800;">Sana</th>
                                <th style="text-align: right; padding: 12px; font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 800;">Oldingi</th>
                                <th style="text-align: right; padding: 12px; font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 800;">Joriy (kWh)</th>
                                <th style="text-align: center; padding: 12px; font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 800;">Holat</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summary.map(s => {
            const bName = typeof window.getBolinmaName === 'function' ? window.getBolinmaName(s.bolinma_id) : s.bolinma_id;
            const cMonth = getVal(s.currentMonth);
            const isHigh = cMonth > avgCons * 1.3;
            const isMissing = s.status === 'not_submitted';
            const statusBadge = isMissing
                ? '<span style="background: rgba(239,68,68,0.1); color: #ef4444; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800;">TOPSHIRMAGAN</span>'
                : s.status === 'approved'
                    ? '<span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800;">✅ TASDIQLANGAN</span>'
                    : '<button onclick="this.innerHTML=\'✅ TASDIQLANDI\'; this.style.background=\'rgba(16,185,129,0.1)\'; this.style.color=\'#10b981\'; this.style.border=\'1px solid rgba(16,185,129,0.3)\'; SmartUtils.showToast(\'Tasdiqlandi!\', \'success\')" style="background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); padding: 4px 12px; border-radius: 8px; cursor: pointer; font-size: 0.72rem; font-weight: 800;"><i class="fas fa-check"></i> Tasdiqlash</button>';
            return `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); ${isMissing ? 'opacity: 0.5;' : ''} ${isHigh ? 'background: rgba(239, 68, 68, 0.04);' : ''}">
                                    <td style="padding: 12px; font-weight: 700; color: #38bdf8; font-size: 0.88rem;">${bName}</td>
                                    <td style="padding: 12px; color: #94a3b8; font-size: 0.82rem;">${s.date || '—'}</td>
                                    <td style="padding: 12px; text-align: right; color: #cbd5e1; font-size: 0.85rem;">${s.lastReading ? getVal(s.lastReading).toLocaleString() : '—'}</td>
                                    <td style="padding: 12px; text-align: right; font-weight: 800; font-size: 0.92rem; color: ${isHigh ? '#ef4444' : '#fff'};">${cMonth ? cMonth.toLocaleString() : '0'}</td>
                                    <td style="padding: 12px; text-align: center;">${statusBadge}</td>
                                </tr>`;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Alerts & LGM Sidebar -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Smart Alerts -->
                <div class="premium-card" style="border: 1px solid ${overuseAlerts.length > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}; background: ${overuseAlerts.length > 0 ? 'rgba(239,68,68,0.04)' : 'rgba(15, 23, 42, 0.8)'};">
                    <div class="card-title"><i class="fas fa-bell" style="color: ${overuseAlerts.length > 0 ? '#ef4444' : '#10b981'};"></i> Aqlli Signallar</div>
                    ${overuseAlerts.length > 0 ? overuseAlerts.map(s => {
            const bName = typeof window.getBolinmaName === 'function' ? window.getBolinmaName(s.bolinma_id) : s.bolinma_id;
            const cMonth = getVal(s.currentMonth);
            return `
                        <div style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); border-radius: 12px; padding: 14px; margin-bottom: 10px;">
                            <div style="font-weight: 800; font-size: 0.85rem; color: #ef4444; margin-bottom: 4px;"><i class="fas fa-bolt"></i> Energiya Oshishi</div>
                            <div style="font-size: 0.78rem; color: #94a3b8;">${bName}: <strong style="color:#fff;">${cMonth.toLocaleString()} kWh</strong></div>
                            <div style="font-size: 0.7rem; color: #ef4444; margin-top: 4px;">Me'yordan ~${Math.round((cMonth / avgCons) * 100 - 100)}% ko'p</div>
                        </div>`;
        }).join('') : `
                        <div style="text-align: center; padding: 25px 0; color: #475569;">
                            <i class="fas fa-leaf" style="font-size: 2.5rem; color: #10b981; opacity: 0.4; margin-bottom: 10px; display: block;"></i>
                            Elektr sarfi me'yorda
                        </div>
                    `}
                </div>

                <!-- Not Submitted -->
                ${notSubmitted.length > 0 ? `
                <div class="premium-card" style="border: 1px solid rgba(245,158,11,0.2); background: rgba(245,158,11,0.04);">
                    <div class="card-title"><i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> Topshirmagan Bo'linmalar</div>
                    ${notSubmitted.map(s => {
            const bName = typeof window.getBolinmaName === 'function' ? window.getBolinmaName(s.bolinma_id) : s.bolinma_id;
            return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <div style="font-weight: 700; font-size: 0.85rem; color: #f59e0b;">${bName}</div>
                            <div style="font-size: 0.7rem; color: #ef4444; font-weight: 800;">KUTILMOQDA</div>
                        </div>`;
        }).join('')}
                </div>
                ` : ''}

                <!-- LGM / Asboblar -->
                <div class="premium-card">
                    <div class="card-title"><i class="fas fa-microscope" style="color: #38bdf8;"></i> LGMga O'TKAZISH (30 KUN)</div>
                    <div style="max-height: 150px; overflow-y: auto; padding-right: 5px;">
                        ${upcoming && upcoming.length > 0 ? upcoming.map(d => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
                                <div>
                                    <div style="font-weight: 700; font-size: 0.82rem; color: #fff;">${escapeHtml(d.name)}</div>
                                    <div style="font-size: 0.65rem; color: #64748b;">S/N: ${d.serial}</div>
                                </div>
                                <div style="color: #f59e0b; font-weight: 800; font-size: 0.72rem;">${d.stampDate || '—'}</div>
                            </div>
                        `).join('') : '<div style="color: #10b981; font-size: 0.85rem; padding: 10px 0;">Barcha asboblar muddati joyida.</div>'}
                    </div>
                </div>
            </div>
        </div>`;

        container.innerHTML = kpiHTML + chartHTML + gridHTML;
    } catch (e) {
        console.error("Metrology home widgets error:", e);
        container.innerHTML = '<div class="premium-card" style="grid-column: span 2; color: #ef4444;">Vidjetlarni yuklashda xatolik yuz berdi.</div>';
    }
}

/**
 * HR (Xodimlar Bo'limi) Bosh sahifa vidjetlari
 */
async function renderHRHomeWidgets(container) {
    if (!container) return;
    try {
        if (typeof window.initHRData === 'function') await window.initHRData();
        const stats = typeof window.getHRStats === 'function' ? window.getHRStats('all') : null;

        if (!stats) {
            container.innerHTML = '<div class="premium-card">HR ma\'lumotlarini yuklab bo\'lmadi.</div>';
            return;
        }

        const statsHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; grid-column: span 2;">
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(56, 189, 248, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">JAMI XODIMLAR</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #fff;">${stats.totalEmployees}</div>
                    <div style="font-size: 0.7rem; color: #10b981; margin-top: 5px;"><i class="fas fa-plus"></i> ${stats.newThisMonth} yangi</div>
                </div>
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(16, 185, 129, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">BUGUNGI DAVOMAT</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #10b981;">${stats.attendance.percent}%</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">${stats.attendance.present} / ${stats.attendance.total}</div>
                </div>
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(239, 68, 68, 0.1)); border-color: ${stats.trainingAlerts > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)'};">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">TIBBIY KO'RIK (ALERTS)</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: ${stats.trainingAlerts > 0 ? '#ef4444' : '#fff'};">${stats.trainingAlerts}</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Muddatidan o'tgan</div>
                </div>
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(245, 158, 11, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">TUG'ILGAN KUNLAR</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #f59e0b;">${stats.birthdaysThisWeek}</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Ushbu haftada</div>
                </div>
            </div>
        `;

        const detailsHTML = `
            <div class="premium-card" style="grid-column: span 2;">
                <div class="card-title"><i class="fas fa-gift" style="color: #f59e0b;"></i> Yaqinlashayotgan Tug'ilgan Kunlar</div>
                <div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">
                    ${stats.birthdayEmployees.length > 0 ? stats.birthdayEmployees.map(emp => `
                        <div style="min-width: 150px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff;">
                                ${emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 3px;">${escapeHtml(emp.name)}</div>
                            <div style="font-size: 0.7rem; color: #94a3b8;">${new Date(emp.birthday).toLocaleDateString('uz-UZ', { month: 'long', day: 'numeric' })}</div>
                        </div>
                    `).join('') : '<div style="color: #64748b; font-size: 0.85rem; padding: 20px;">Hozircha yaqin tug\'ilgan kunlar yo\'q.</div>'}
                </div>
            </div>
        `;

        container.innerHTML = statsHTML + detailsHTML;
    } catch (e) {
        console.error("HR home widgets error:", e);
        container.innerHTML = '<div class="premium-card" style="grid-column: span 2; color: #ef4444;">HR vidjetlarini yuklashda xatolik.</div>';
    }
}

/**
 * PRODUCTION (Ishlab Chiqarish) Bosh sahifa vidjetlari
 */
async function renderProductionHomeWidgets(container) {
    if (!container) return;
    try {
        const defects = typeof window.getGlobalDefects === 'function' ? await window.getGlobalDefects() : [];
        const activeDefects = defects.filter(d => d.status === 'active');

        const statsHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; grid-column: span 2;">
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(239, 68, 68, 0.1)); border-color: ${activeDefects.length > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)'};">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">YO'L NOSOZLIKLARI</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: ${activeDefects.length > 0 ? '#ef4444' : '#10b981'};">${activeDefects.length}</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Ayni damda faol</div>
                </div>
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(212, 175, 55, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">BO'LIMLAR RAQOBATI</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #ffd700;">#1</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Markaziy yo'nalish</div>
                </div>
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(56, 189, 248, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">BUGUNGI RAPORTLAR</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #38bdf8;">85%</div>
                    <div style="font-size: 0.7rem; color: #10b981; margin-top: 5px;">Topshirildi</div>
                </div>
            </div>
            
            <div id="inline-defect-monitor-dashboard" class="premium-card" style="grid-column: span 2; padding: 0; min-height: 300px;">
                <div style="padding: 40px; text-align: center; color: #38bdf8;"><i class="fas fa-spinner fa-spin"></i> Monitoring yuklanmoqda...</div>
            </div>
        `;

        container.innerHTML = statsHTML;

        setTimeout(() => {
            if (window.renderInlineTrackDefectMonitor) {
                window.renderInlineTrackDefectMonitor('inline-defect-monitor-dashboard', 'ishlab-chiqarish');
            }
        }, 300);

    } catch (e) {
        console.error("Production home widgets error:", e);
        container.innerHTML = '<div class="premium-card" style="grid-column: span 2; color: #ef4444;">Monitoringni yuklashda xatolik.</div>';
    }
}

/**
 * SAFETY (Mehnat Muhofazasi) Bosh sahifa vidjetlari
 */
async function renderSafetyHomeWidgets(container) {
    if (!container) return;
    try {
        const statsHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; grid-column: span 2;">
                <!-- TNU-20 Today -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(56, 189, 248, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">TNU-20 (BUGUN)</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #fff;">12</div>
                    <div style="font-size: 0.7rem; color: #10b981; margin-top: 5px;">Test topshirganlar</div>
                </div>
                <!-- Expiry Alerts -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(239, 68, 68, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">GUDOK / SERTIFIKAT</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #ef4444;">3</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Muddati o'tayotgan</div>
                </div>
                <!-- TNU-19 Instruction -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(16, 185, 129, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">YO'RIQNOMA (TNU-19)</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #10b981;">100%</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Kvartal yakunlandi</div>
                </div>
            </div>
            
            <div class="premium-card" style="grid-column: span 2;">
                <div class="card-title"><i class="fas fa-shield-alt" style="color: #ef4444;"></i> Xavfsizlik bo'yicha ogohlantirishlar</div>
                <div style="color: #94a3b8; font-size: 0.85rem;">
                    Barcha bo'linmalar TNU-19 yo'riqnomalaridan muvaffaqiyatli o'tdi. 3 nafar xodimning "Gudok" guvohnomasi muddati tugashiga 15 kundan kam qoldi.
                </div>
            </div>
        `;
        container.innerHTML = statsHTML;
    } catch (e) {
        console.error("Safety home widgets error:", e);
        container.innerHTML = '<div class="premium-card" style="grid-column: span 2; color: #ef4444;">Xatolik yuz berdi.</div>';
    }
}

/**
 * MECHANICS (Mexanika) Bosh sahifa vidjetlari
 */
async function renderMechanicsHomeWidgets(container) {
    if (!container) return;
    try {
        const vehicles = (window.waybillData && window.waybillData.vehicles) || [];
        const free = vehicles.filter(v => v.status === 'free').length;
        const busy = vehicles.filter(v => v.status === 'busy').length;
        const repair = vehicles.filter(v => v.status === 'repair').length;

        const statsHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; grid-column: span 2;">
                <!-- Fleet Status -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(16, 185, 129, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">TAYYOR TEXNIKALAR</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #10b981;">${free}</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Jami ${vehicles.length} tadan</div>
                </div>
                <!-- Repair Status -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(245, 158, 11, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">TA'MIRDA</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #f59e0b;">${repair}</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Hozirgi vaqtda</div>
                </div>
                <!-- Fuel Status -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(239, 68, 68, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">LIMITDAN OSHISH</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #ef4444;">0</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Ushbu oylik sarf</div>
                </div>
            </div>

            <div class="premium-card" style="grid-column: span 2;">
                <div class="card-title"><i class="fas fa-tools" style="color: #f59e0b;"></i> Yaqinlashayotgan TO (Texnik Xizmat)</div>
                <div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">
                    ${vehicles.length > 0 ? vehicles.slice(0, 3).map(v => `
                        <div style="min-width: 150px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 3px;">${escapeHtml(v.name)}</div>
                            <div style="font-size: 0.65rem; color: #94a3b8;">${v.number}</div>
                            <div style="font-size: 0.7rem; color: #38bdf8; margin-top: 8px;">TO-1: 150 km qoldi</div>
                        </div>
                    `).join('') : '<div style="color: #64748b; font-size: 0.85rem; padding: 20px;">Texnikalar topilmadi.</div>'}
                </div>
            </div>
        `;
        container.innerHTML = statsHTML;
    } catch (e) {
        console.error("Mechanics home widgets error:", e);
        container.innerHTML = '<div class="premium-card" style="grid-column: span 2; color: #ef4444;">Xatolik yuz berdi.</div>';
    }
}

/**
 * ACCOUNTING (Bugalteriya) Bosh sahifa vidjetlari
 */
async function renderAccountingHomeWidgets(container) {
    if (!container) return;
    try {
        const materialDataStr = localStorage.getItem('material_report_data');
        const materialData = materialDataStr ? JSON.parse(materialDataStr) : [];
        let totalSum = 0;
        if (Array.isArray(materialData)) {
            totalSum = materialData.reduce((acc, item) => acc + (parseFloat(item.endSum) || 0), 0);
        }

        const statsHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; grid-column: span 2;">
                <!-- Total Stock -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(16, 185, 129, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">OMBOR QOLDIG'I</div>
                    <div style="font-size: 1.5rem; font-weight: 900; color: #10b981;">${totalSum.toLocaleString()} so'm</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Jami aktivlar</div>
                </div>
                <!-- Pending Acts -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(245, 158, 11, 0.1));">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">TASDIQLASH KUTILMOQDA</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #f59e0b;">2</div>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">M-29 aktlari</div>
                </div>
                <!-- 1C Import -->
                <div class="premium-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(56, 189, 248, 0.1)); cursor: pointer;" onclick="document.querySelector('.upload-btn')?.click()">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px;">1C IMPORT</div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #38bdf8;"><i class="fas fa-file-import"></i></div>
                    <div style="font-size: 0.7rem; color: #38bdf8; margin-top: 5px;">Fayl yuklash</div>
                </div>
            </div>

            <div class="premium-card" style="grid-column: span 2;">
                <div class="card-title"><i class="fas fa-history" style="color: #38bdf8;"></i> Ohirgi material aylanmalari</div>
                <div style="color: #94a3b8; font-size: 0.85rem;">
                    Barcha amallar muvaffaqiyatli bajarildi. Oxirgi M-29 akti 2 soat oldin tasdiqlangan.
                </div>
            </div>
        `;
        container.innerHTML = statsHTML;
    } catch (e) {
        console.error("Accounting home widgets error:", e);
        container.innerHTML = '<div class="premium-card" style="grid-column: span 2; color: #ef4444;">Xatolik yuz berdi.</div>';
    }
}

function renderMainContent() {
    try {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        mainContent.innerHTML = '';

        // Dashboard
        const dashboardSection = createDashboardSection();
        if (dashboardSection) mainContent.appendChild(dashboardSection);

        // New Sections
        if (typeof createTasksSection === 'function') {
            const tasksSection = createTasksSection();
            if (tasksSection) mainContent.appendChild(tasksSection);
        }
        if (typeof createMaintenanceSection === 'function') {
            const maintenanceSection = createMaintenanceSection();
            if (maintenanceSection) mainContent.appendChild(maintenanceSection);
        }

        // Bo'linmalar uchun section yaratish
        if (departments && departments.slice) {
            departments.slice(1).forEach(dept => {
                const section = createDepartmentSection(dept);
                if (section) mainContent.appendChild(section);
            });
        }
    } catch (e) {
        console.error("Main Content Rendering Failed:", e);
    }
}

// AI Development section

// Bo'lim oynalarini ochish
document.addEventListener('click', function (e) {
    if (e.target.closest('.journal-card[data-department]')) {
        const card = e.target.closest('.journal-card[data-department]');
        const departmentId = card.getAttribute('data-department');

        if (!currentUser) return;

        // Bo'linma ichidagi bo'lim ekanligini tekshirish
        if (departmentId.includes('-section-')) {
            const parts = departmentId.split('-section-');
            const bolinmaId = parts[0];
            const sectionId = parts[1];
            openBolinmaSectionWindow(bolinmaId, sectionId);
        } else {
            // Functional department — sidebar filtrlaydi, shuning uchun ochishga ruxsat
            openDepartmentWindow(departmentId);
        }
    }
});

// Bo'lim oynalarini yopish
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('close-window')) {
        closeAllWindows();
    }
});

// Overlay orqali yopish
const deptOverlay = document.getElementById('department-overlay');
if (deptOverlay) {
    deptOverlay.addEventListener('click', () => {
        closeAllWindows();
    });
}

// Integratsiya tablari
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('integration-tab')) {
        const tab = e.target;
        const tabId = tab.getAttribute('data-tab');
        const parentWindow = tab.closest('.integration-window');

        // Barcha tablarni yopish
        parentWindow.querySelectorAll('.integration-tab').forEach(t => t.classList.remove('active'));
        parentWindow.querySelectorAll('.integration-frame, .integration-panel').forEach(content => {
            content.style.display = 'none';
        });

        // Faol tabni ochish
        tab.classList.add('active');
        const activeContent = parentWindow.querySelector(`#${tabId} `);
        if (activeContent) {
            activeContent.style.display = activeContent.classList.contains('integration-frame') ? 'block' : 'block';
        }
    }
});

// Dashboard widgetlarini ishga tushirish
initDashboardWidgets();

function createDepartmentSection(department) {
    const section = document.createElement('section');
    section.id = department.id;
    section.className = 'content-section';

    // SPECIAL: Specialized Dashboard Rendering
    if (department.id === 'mexanika' && typeof renderMechanicsSection === 'function') {
        section.innerHTML = '';
        renderMechanicsSection(section, 'mexanika');
        return section;
    }

    if (department.id === 'iqtisod' && typeof renderEconomySection === 'function') {
        section.innerHTML = '';
        renderEconomySection(section, 'iqtisod');
        return section;
    }

    if (department.id === 'metrologiya' && typeof renderMetrologySection === 'function') {
        section.innerHTML = '';
        renderMetrologySection(section, 'metrologiya');
        return section;
    }

    if (department.id === 'xodimlar' && typeof renderHRSection === 'function') {
        section.innerHTML = '';
        renderHRSection(section, 'xodimlar');
        return section;
    }

    const deptFiles = uploadedFiles.filter(f => f.department === department.id);

    const userDepts = currentUser.departments || [];

    // Bo'limlarni aniqlash va filtrlash
    let displaySectionsList = [];
    if (sectionsData[department.id]) {
        displaySectionsList = [...sectionsData[department.id]];

        // Agar foydalanuvchi bo'lim (department) role'ida bo'lsa, 
        // faqat o'ziga tegishli bo'limni ko'rsatish
        if (currentUser.role === 'department') {
            displaySectionsList = displaySectionsList.filter(s => {
                return userDepts.some(userDeptId => {
                    // Case 1: Direct ID-to-slug match
                    // This handles cases like userDeptId="metrologiya" and section.name="Metrologiya"
                    const sectionSlug = s.name.toLowerCase().trim()
                        .replace(/\s+/g, '-')
                        .replace("bo'limi", "")
                        .replace("bo'lim", "")
                        .trim();

                    if (userDeptId === sectionSlug) return true;

                    // Case 2: Functional department name matching
                    const userDept = functionalDepartments.find(d => d.id === userDeptId);
                    if (!userDept) return false;

                    const userDeptNameClean = userDept.name.toLowerCase().split(' ')[0];
                    const sectionNameClean = s.name.toLowerCase();

                    return sectionNameClean.includes(userDeptNameClean) || userDeptNameClean.includes(sectionNameClean);
                });
            });
        }

        // Agar Admin bo'lsa, xodimlar jurnalini qo'shish (failsafe)
        if (currentUser.role === 'admin') {
            const hasHRM = displaySectionsList.some(s => s.id === 'hrm-jurnal' || s.id === 2);
            if (!hasHRM) {
                displaySectionsList.push({
                    id: 'hrm-jurnal',
                    name: 'Xodimlar Jurnali',
                    icon: 'fas fa-users-cog',
                    description: 'Xodimlarni boshqarish va tabel yuritish'
                });
            }
        }
    } else {
        // Admin hamma bo'limlarni ko'rsin, bo'linma/bo'lim xodimi faqat o'zinikini
        if (currentUser.role === 'admin') {
            displaySectionsList = [...functionalDepartments];
        } else {
            displaySectionsList = functionalDepartments.filter(dept => userDepts.includes(dept.id));
        }
    }

    section.innerHTML = `
        <h2><i class="${department.icon}"></i> ${escapeHtml(department.name)}</h2>
            <p>${escapeHtml(department.name)} ma'lumotlari va hisobotlari</p>

                ${department.id.includes('mexanika') || (department.name && department.name.toLowerCase().includes('mexanika')) ? `
                <div class="content-card" style="background: linear-gradient(135deg, rgba(230, 126, 34, 0.2), rgba(211, 84, 0, 0.2));">
                    <h3><i class="fas fa-tools"></i> Texnika Holati</h3>
                    <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
                        <div style="font-size: 2rem; color: #e67e22;"><i class="fas fa-cogs"></i></div>
                        <div>
                            <div style="font-size: 1.2rem; font-weight: bold;">88%</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Ishchi tayyorgarlik</div>
                        </div>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.85rem;">
                        <span style="color: #2ecc71;">● 24 Faol</span> | 
                        <span style="color: #e67e22;">● 5 Ta'mir</span>
                    </div>
                </div>
                ` : ''
        }

                <h3 class="section-title">Bo'limlar</h3>

                <div style="display: flex; gap: 15px; align-items: flex-start;">
                    <div class="journal-list" style="flex: 1; min-width: 0;">
                        ${displaySectionsList.map(s => `
                            <div class="journal-card" data-department="${sectionsData[department.id] ? department.id + '-section-' + s.id : s.id}">
                                <h4><i class="${s.icon}"></i> ${escapeHtml(s.name)}</h4>
                                <p>${escapeHtml(s.description || '')}</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${department.id.startsWith('bolinma') ? `
                    <div class="road-management-sidebar">
                        ${getRoadSidebarHTML(department.id)}
                    </div>
                    ` : ''}
                </div>
    `;

    return section;
}

// Bo'linma ichidagi bo'lim uchun oyna ochish
function openBolinmaSectionWindow(bolinmaId, sectionId) {
    const _u = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : (window.Auth && window.Auth.currentUser);
    if (!_u) return;

    // Simplified security - sidebar already filters visibility
    if (_u.role === 'bolinma') {
        if (!_u.bolinmalar || !_u.bolinmalar.includes(bolinmaId)) {
            if (window.showToast) window.showToast("Sizga ushbu bo'linma ma'lumotlarini ko'rish ruxsati berilmagan!", "error");
            return;
        }
        // Bo'linma xodimi o'z bo'linmasining barcha bo'limlariga kira oladi
    }
    // Admin va department foydalanuvchilari har qanday sectionga kira oladi


    const bolinmaSections = sectionsData[bolinmaId];
    if (!bolinmaSections) return;

    const section = bolinmaSections.find(s => s.id == sectionId);
    if (!section) return;

    // Kompozit ID yaratish
    const compositeId = `${bolinmaId}-${sectionId}`;

    // Mavjud oynani tekshirish
    let existingWindow = document.getElementById(`${compositeId}-window`);

    if (!existingWindow) {
        // Yangi oyna yaratish
        const template = document.getElementById('departmentWindowTemplate');
        const clone = template.content.cloneNode(true);
        existingWindow = clone.querySelector('.department-window');
        existingWindow.id = `${compositeId}-window`;

        // Bo'linma va bo'lim nomini ko'rsatish
        const bolinmaNum = bolinmaId.replace('bolinma', '');
        existingWindow.querySelector('.department-name').textContent = `${bolinmaNum}-bo'linma: ${section.name}`;

        // Integratsiya tugmasini sozlash
        const integrateBtn = existingWindow.querySelector('.integrate-btn');
        if (section.integrations && section.integrations.length > 0) {
            integrateBtn.style.display = 'flex';
            integrateBtn.addEventListener('click', () => {
                openIntegrationWindow(section.integrations[0], compositeId);
            });
        } else {
            integrateBtn.style.display = 'none';
        }

        // Elektron Tabel tugmasini sozlash (Xodimlar bo'limi uchun)
        const timesheetBtn = existingWindow.querySelector('.timesheet-btn');
        if (timesheetBtn) {
            const isXodimlar = section.name.toLowerCase().includes('xodimlar') || section.name.toLowerCase().includes('kadrlar');
            if (isXodimlar) {
                timesheetBtn.style.display = 'inline-flex';
                timesheetBtn.onclick = () => {
                    const bolinmaNum = bolinmaId.replace('bolinma', '');
                    openTimesheet(`${bolinmaNum}-bo'linma`);
                };

                // Murojaat yuborish tugmasini qo'shish
                let murojaatBtn = existingWindow.querySelector('.hr-murojaat-btn');
                const isSubdivision = window.Auth?.currentUser && window.Auth.currentUser.role !== 'hr';
                if (!murojaatBtn && isSubdivision) {
                    murojaatBtn = document.createElement('button');
                    murojaatBtn.className = 'control-btn hr-murojaat-btn';
                    murojaatBtn.style.cssText = `
                        background: var(--gold-gradient);
                        color: #000;
                        margin-left: 8px;
                        border: none;
                        padding: 8px 20px;
                        border-radius: 10px;
                        font-weight: 800;
                        font-size: 0.85rem;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
                        transition: 0.3s;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    `;
                    murojaatBtn.innerHTML = '<i class="fas fa-file-signature"></i> MUROJAAT';
                    murojaatBtn.title = "Xodimlar bo'limiga murojaat yuborish (Face ID & Imzo)";
                    murojaatBtn.onclick = () => {
                        // Pass raw bolinmaId, hr.js will normalize it using SmartUtils
                        if (window.openHRMurojaatWindow) window.openHRMurojaatWindow(bolinmaId);
                        else SmartUtils.showToast("Murojaat moduli yuklanmagan!", "error");
                    };
                    timesheetBtn.parentNode.appendChild(murojaatBtn);
                }

                // Xodimlar bo'limiga faqat tabel kerak, TNU-19/TNU-20/TO jurnallari kerak emas
            } else {
                timesheetBtn.style.display = 'none';
            }
        }

        document.body.appendChild(existingWindow);

        // Event listener'lar
        setupDepartmentWindowEvents(existingWindow, compositeId);
    }

    // 0. Update Upload Button Visibility
    const uploadBtn = existingWindow.querySelector('.upload-file-btn');
    if (uploadBtn) {
        if (currentUser.role === 'bolinma') {
            uploadBtn.style.display = 'inline-flex';
        } else {
            uploadBtn.style.display = 'none';
        }
    }

    // 1. Always update files for all sections (Restored functionality)
    // EXCEPTION: Safety (Mehnat) section handles its own view exclusively.
    if (!section.name.toLowerCase().includes('mehnat')) {
        updateFilesTable(existingWindow, compositeId);
    }

    // 2. Check for Special Sections
    const sName = section.name.toLowerCase();

    // --- Nom asosida bo'lim turini aniqlash ---
    const isIshlab = sName.includes('ishlab') || section.id == 1;
    const isIqtisod = sName.includes('iqtisod');
    const isDispetcher = sName.includes('dispetcher');
    const isMetrology = sName.includes('metrologiya');
    const isBugalter = sName.includes('bugalteriya');
    const isMehnat = sName.includes('mehnat');
    const isMexanika = sName.includes('mexanika');
    const isXodimlar = sName.includes('xodimlar') || sName.includes('kadrlar') || section.id == 2;

    const isSpecialSection = isIshlab || isIqtisod || isDispetcher || isMetrology || isBugalter || isMehnat || isMexanika || isXodimlar;

    // 2. Standart elementlarni boshqarish (yashirish yoki ko'rsatish)
    const fileMgmt = existingWindow.querySelector('.file-management');
    const folderSelector = existingWindow.querySelector('.folder-selector');
    const sectionTitle = existingWindow.querySelector('.section-title');
    const filesTable = existingWindow.querySelector('.files-table');
    const sidebar = existingWindow.querySelector('.road-management-sidebar');

    if (isSpecialSection) {
        if (fileMgmt) fileMgmt.style.display = 'none';
        if (folderSelector) folderSelector.style.display = 'none';
        if (sectionTitle) sectionTitle.style.display = 'none';
        if (filesTable) filesTable.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
    } else {
        if (fileMgmt) fileMgmt.style.display = '';
        if (folderSelector) folderSelector.style.display = '';
        if (sectionTitle) sectionTitle.style.display = '';
        if (filesTable) filesTable.style.display = '';
        if (sidebar) sidebar.style.display = '';
    }

    // A) Xodimlar Section (HR Portal)
    if (isXodimlar && typeof renderHRMainPortal === 'function') {
        const content = existingWindow.querySelector('.window-content') || existingWindow.querySelector('.department-body');
        if (content) {
            content.id = 'hr-dept-content'; // Crucial for hr.js navigation
            content.innerHTML = renderHRMainPortal(bolinmaId);
        }
    }

    // B) Ishlab Chiqarish Section (Production)
    if (isIshlab) {
        renderProductionSection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#production-journals-view')?.remove();
    }

    // C) Iqtisod Section (Economy - PU-74)
    if (isIqtisod) {
        renderEconomySection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#economy-journals-view')?.remove();
    }

    // D) Dispatcher Section
    if (isDispetcher) {
        renderSubdivisionReportSection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#dispatcher-assignment-view')?.remove();
    }

    // E) Metrology Section
    if (isMetrology) {
        renderMetrologySection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#metrology-dashboard-view')?.remove();
    }

    // F) Accounting Section (Bugalteriya)
    if (isBugalter) {
        renderAccountingSection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#accounting-journals-view')?.remove();
    }

    // G) Safety Section (Mehnat Muhofazasi)
    if (isMehnat) {
        renderMehnatSection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#safety-dashboard-view')?.remove();
    }

    // H) Mechanics Section
    if (isMexanika) {
        const _mRole = currentUser ? currentUser.role : 'guest';
        if ((_mRole === 'department' || _mRole === 'admin') && window.injectMexanikaButtons) {
            window.injectMexanikaButtons(existingWindow, bolinmaId);
        }
        renderMechanicsSection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#mechanics-section-view')?.remove();
        existingWindow.querySelector('.mexanika-injected-buttons')?.remove();
    }


    // Oynani ko'rsatish
    existingWindow.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');
}

// ─────────────────────────────────────────────────────────────────
// Accounting Section render (Bugalteriya bo'limi uchun)
// ─────────────────────────────────────────────────────────────────
function renderAccountingSection(winEl, bolinmaId) {
    const contentDiv = winEl.querySelector('.window-content') || winEl.querySelector('.department-body') || winEl;
    if (!contentDiv) return;

    let accView = contentDiv.querySelector('#accounting-journals-view');
    if (!accView) {
        accView = document.createElement('div');
        accView.id = 'accounting-journals-view';
        accView.style.marginTop = '10px';
        accView.style.marginBottom = '20px';

        // Always place it at the VERY TOP of content area
        if (contentDiv.firstChild) {
            contentDiv.insertBefore(accView, contentDiv.firstChild);
        } else {
            contentDiv.appendChild(accView);
        }

        // Toolbar tugmalarini sozlash
        const fileControls = contentDiv.querySelector('.file-management');
        if (fileControls) {
            // Eskilarini tozalash (agar bo'lsa)
            fileControls.querySelectorAll('.accounting-open-btn, .incoming-open-btn, .archive-open-btn').forEach(b => b.remove());

            if (!fileControls.querySelector('.m29-toolbar-btn')) {
                const btnCfg = [
                    {
                        label: '<i class="fas fa-file-signature"></i> M-29',
                        cls: 'm29-toolbar-btn',
                        fn: () => window.openMaterialsWindow && window.openMaterialsWindow(bolinmaId)
                    },
                    {
                        label: '<i class="fas fa-boxes"></i> Materiallar',
                        cls: 'materials-toolbar-btn',
                        fn: () => window.openAccountingJournal && window.openAccountingJournal('MaterialReport', bolinmaId)
                    }
                ];
                btnCfg.forEach(cfg => {
                    const btn = document.createElement('button');
                    btn.className = `control-btn ${cfg.cls}`;
                    btn.style.cssText = 'background:linear-gradient(45deg,#1abc9c,#16a085); border:none; color:white; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:600; display:inline-flex; align-items:center; gap:6px; margin-right:5px;';
                    btn.innerHTML = cfg.label;
                    btn.onclick = cfg.fn;
                    fileControls.appendChild(btn);
                });
            }
        }
    } else {
        // Ensure it's still at the top if it was moved
        if (contentDiv.firstChild !== accView) {
            contentDiv.insertBefore(accView, contentDiv.firstChild);
        }
    }

    // Count pending M-29 acts
    const pendingActs = (JSON.parse(localStorage.getItem('materialActs')) || []).filter(a => a.status === 'pending');
    const pendingCount = pendingActs.length;

    // Rol tekshirish: bo'linma faqat ko'rish, department/admin boshqarish
    const userRole = currentUser ? currentUser.role : 'guest';
    const isDeptOrAdmin = (userRole === 'department' || userRole === 'admin');

    // Bo'linma uchun kartalar (faqat M-29 va Materiallar ro'yxatini ko'rish, Birja)
    let cardsHtml = `
                <div class="acc-card" onclick="window.openMaterialsWindow && window.openMaterialsWindow('${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; cursor:pointer; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-file-signature" style="font-size:1.8rem; color:#f1c40f; margin-bottom:8px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1rem;">M-29</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">Materiallar Dalolatnomasi</div>
                </div>
                <div class="acc-card" onclick="window.openAccountingJournal && window.openAccountingJournal('MaterialReport','${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; cursor:pointer; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-boxes" style="font-size:1.8rem; color:#3498db; margin-bottom:8px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1rem;">Materiallar</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">${isDeptOrAdmin ? "Materiallar qoldig'i va hisoboti" : "Materiallar ro'yxatini ko'rish"}</div>
                </div>
                <div class="acc-card" onclick="if(window.openMarketplaceWindow) window.openMarketplaceWindow('${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; cursor:pointer; border:1px solid rgba(22,160,133,0.4); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-handshake" style="font-size:1.8rem; color:#1abc9c; margin-bottom:8px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1rem;">Birja</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">Materiallar birjasi</div>
                </div>`;

    // Faqat department/admin uchun qo'shimcha kartalar
    if (isDeptOrAdmin) {
        cardsHtml += `
                <div class="acc-card" onclick="document.getElementById('import-excel-bugalteriya-${bolinmaId}').click()" 
                    style="background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; cursor:pointer; border:1px solid rgba(230,126,34,0.4); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-file-excel" style="font-size:1.8rem; color:#e67e22; margin-bottom:8px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1rem;">1C dan Import</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">Excel orqali materiallar yuklash</div>
                    <input type="file" id="import-excel-bugalteriya-${bolinmaId}" accept=".xlsx,.xls,.csv" 
                        onchange="window.importMaterialsFromExcel && window.importMaterialsFromExcel(this)" style="display:none;">
                </div>
                <div class="acc-card" onclick="window.openArchiveWindow && window.openArchiveWindow('${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; cursor:pointer; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-archive" style="font-size:1.8rem; color:#8e44ad; margin-bottom:8px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1rem;">Arxiv</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">Hujjatlar Arxivi</div>
                </div>`;
    }

    // Pending M-29 hujjatlar (faqat department/admin uchun)
    let pendingHtml = '';
    if (isDeptOrAdmin && pendingCount > 0) {
        pendingHtml = `
            <div style="margin-top:15px; padding:12px 15px; background: rgba(243, 156, 18, 0.15); border:1px solid rgba(243,156,18,0.4); border-radius:10px; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-exclamation-triangle" style="color:#f39c12; font-size:1.2rem;"></i>
                    <span style="color:#f39c12; font-weight:bold;">${pendingCount} ta M-29 dalolatnomasi tasdiqlashni kutmoqda</span>
                </div>
                <button onclick="window.openApprovalList && window.openApprovalList()" 
                    style="background:#f39c12; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; animation: pulse 2s infinite;">
                    <i class="fas fa-check-double"></i> Tasdiqlash
                </button>
            </div>`;
    }

    accView.innerHTML = `
        <div style="padding:20px; background:rgba(26,188,152,0.12); border:1px solid rgba(26,188,152,0.4); border-radius:12px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); border-left: 5px solid #1abc9c;">
            <h3 style="color:#1abc9c; margin-top:0; margin-bottom:15px; display:flex; align-items:center; gap:10px; font-size:1.3rem;">
                <i class="fas fa-calculator"></i> Bugalteriya — ${isDeptOrAdmin ? 'Tezkor Amallar va Jurnallar' : "Materiallar ro'yxati"}
            </h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:15px;">
                ${cardsHtml}
            </div>
            ${pendingHtml}
        </div>
        <style>
            .acc-card:hover { 
                border-color: #1abc9c !important; 
                transform: translateY(-5px);
                background: rgba(26, 188, 156, 0.15) !important;
                box-shadow: 0 10px 20px rgba(0,0,0,0.4);
            }
        </style>
    `;
}

function renderSubdivisionReportSection(winEl, bolinmaId) {
    const contentDiv = winEl.querySelector('.window-content');
    if (!contentDiv) return;

    // 1. Standart elementlarni butunlay yashiramiz
    const fileMgmt = contentDiv.querySelector('.file-management');
    const folderSelector = contentDiv.querySelector('.folder-selector');
    const sectionTitle = contentDiv.querySelector('.section-title');
    const filesTable = contentDiv.querySelector('.files-table');
    const sidebar = contentDiv.querySelector('.road-management-sidebar');

    if (fileMgmt) fileMgmt.style.display = 'none';
    if (folderSelector) folderSelector.style.display = 'none';
    if (sectionTitle) sectionTitle.style.display = 'none';
    if (filesTable) filesTable.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';

    // 2. Hisobot konteynerini yaratish yoki tozalash
    let reportView = contentDiv.querySelector('#dispatcher-assignment-view');
    if (!reportView) {
        reportView = document.createElement('div');
        reportView.id = 'dispatcher-assignment-view';
        reportView.style.width = '100%';
        reportView.style.minHeight = '400px';
        contentDiv.insertBefore(reportView, contentDiv.firstChild);
    }

    reportView.style.display = 'block';
    reportView.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; color: #00c6ff;">
            <i class="fas fa-circle-notch fa-spin" style="font-size: 3rem; margin-bottom: 20px;"></i>
            <div style="font-size: 1.2rem; font-weight: 500;">Dispetcher moduli yuklanmoqda...</div>
        </div>
    `;

    // 3. Ma'lumotlarni yuklab yangi PU-74 formasini chiqarish
    const initFunc = window.initDispatcherData || (typeof initDispatcherData === 'function' ? initDispatcherData : null);
    const renderFunc = window.renderSubdivisionReportSendView || (typeof renderSubdivisionReportSendView === 'function' ? renderSubdivisionReportSendView : null);

    if (initFunc) {
        initFunc().then(() => {
            if (renderFunc) {
                reportView.innerHTML = renderFunc(bolinmaId);
            } else {
                reportView.innerHTML = '<div style="padding:20px; color:#ef4444; text-align:center;">Xatolik: renderSubdivisionReportSendView topilmadi.</div>';
            }
        }).catch(err => {
            console.error("Dispetcher yuklashda xato:", err);
            reportView.innerHTML = `<div style="padding:20px; color:#ef4444; text-align:center;">Ma'lumotlarni yuklab bo'lmadi: ${escapeHtml(err.message)}</div>`;
        });
    } else {
        reportView.innerHTML = `
            <div style="padding:40px; text-align:center; background: rgba(239, 68, 68, 0.1); border: 2px dashed #ef4444; border-radius: 20px; color:#ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
                <div style="font-size: 1.1rem; font-weight: bold;">Xatolik: Dispetcher tizimi (dispatcher.js) orqali yuklanmagan.</div>
                <p style="margin-top:10px; opacity:0.8; font-size:0.9rem;">Iltimos, sahifani yangilang yoki keshni tozalab ko'ring.</p>
            </div>`;
    }
}

// --- PRODUCTION SECTION RENDERER ---
function renderProductionSection(winEl, bolinmaId) {
    console.log('Rendering Production Section Content for', bolinmaId);
    const contentDiv = winEl.querySelector('.window-content') || winEl.querySelector('.department-body') || winEl;
    if (!contentDiv) {
        console.error('Content container not found for Production section!');
        return;
    }

    let prodView = contentDiv.querySelector('#production-journals-view');
    if (!prodView) {
        prodView = document.createElement('div');
        prodView.id = 'production-journals-view';
        prodView.style.marginTop = '15px';
        prodView.style.marginBottom = '25px';
        prodView.style.width = '100%';
        prodView.style.display = 'block';

        // Ensure it stays at the very TOP
        if (contentDiv.firstChild) {
            contentDiv.insertBefore(prodView, contentDiv.firstChild);
        } else {
            contentDiv.appendChild(prodView);
        }
    } else {
        prodView.style.display = 'block';
    }

    // Always update innerHTML to ensure latest buttons and handlers
    prodView.innerHTML = `
        <div style="padding: 25px; background: rgba(30, 41, 59, 0.65); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255, 215, 0, 0.15); border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255, 255, 255, 0.02); position: relative; overflow: hidden;">
            
            <!-- Background Glow Effect for Aesthetics -->
            <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 60%); border-radius: 50%; pointer-events: none;"></div>

            <h3 style="color: #fff; margin-top: 0; margin-bottom: 25px; display: flex; align-items: center; gap: 12px; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.5px;">
                <div style="background: linear-gradient(135deg, #d4af37, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    <i class="fas fa-industry"></i> ${bolinmaId && bolinmaId !== 'all' ? (window.getBolinmaName ? window.getBolinmaName(bolinmaId) : bolinmaId) + ': ' : ''} Ishlab Chiqarish Markazi
                </div>
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; z-index: 2; position: relative;">


                <div class="production-journal-card" onclick="window.openJournal('PU-28','${bolinmaId}')" 
                    style="background: rgba(15, 23, 42, 0.5); padding: 25px 20px; border-radius: 16px; cursor: pointer; border: 1px solid rgba(56, 189, 248, 0.2); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #38bdf8, transparent);"></div>
                    <i class="fas fa-clipboard-list" style="font-size: 2.8rem; color: #38bdf8; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 8px rgba(56,189,248,0.3));"></i>
                    <div style="font-weight: 900; color: #fff; font-size: 1.2rem; margin-bottom: 5px; letter-spacing: 1px;">PU-28</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">Yo'l Ko'rik Kitobi</div>
                </div>

                <div class="production-journal-card" onclick="if(window.openPU28Section2Window) window.openPU28Section2Window('${bolinmaId}')" 
                    style="background: rgba(15, 23, 42, 0.5); padding: 25px 20px; border-radius: 16px; cursor: pointer; border: 1px solid rgba(239, 68, 68, 0.25); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #ef4444, #f59e0b, transparent);"></div>
                    <i class="fas fa-exclamation-triangle" style="font-size: 2.8rem; color: #ef4444; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 8px rgba(239,68,68,0.3));"></i>
                    <div style="font-weight: 900; color: #fff; font-size: 1.2rem; margin-bottom: 5px; letter-spacing: 1px;">PU-28/2</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">Defektli Relslar</div>
                </div>


                <div class="production-journal-card" onclick="window.openPU29Menu ? window.openPU29Menu('${bolinmaId}') : window.openJournal('PU-29','${bolinmaId}')" 
                    style="background: rgba(15, 23, 42, 0.5); padding: 25px 20px; border-radius: 16px; cursor: pointer; border: 1px solid rgba(16, 185, 129, 0.2); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #10b981, transparent);"></div>
                    <i class="fas fa-ruler-combined" style="font-size: 2.8rem; color: #10b981; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 8px rgba(16,185,129,0.3));"></i>
                    <div style="font-weight: 900; color: #fff; font-size: 1.2rem; margin-bottom: 5px; letter-spacing: 1px;">PU-29</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">Strelka O'lchash (NPK)</div>
                </div>

                <div class="production-journal-card" onclick="window.openPU74Window ? window.openPU74Window('${bolinmaId}') : window.openJournal('PU-74','${bolinmaId}')" 
                    style="background: rgba(15, 23, 42, 0.5); padding: 25px 20px; border-radius: 16px; cursor: pointer; border: 1px solid rgba(245, 158, 11, 0.2); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #f59e0b, transparent);"></div>
                    <i class="fas fa-file-invoice" style="font-size: 2.8rem; color: #f59e0b; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 8px rgba(245,158,11,0.3));"></i>
                    <div style="font-weight: 900; color: #fff; font-size: 1.2rem; margin-bottom: 5px; letter-spacing: 1px;">PU-74</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">Bajarilgan Ishlar</div>
                </div>

                <div class="production-journal-card" onclick="window.openJournal('PU-80','${bolinmaId}')" 
                    style="background: rgba(15, 23, 42, 0.5); padding: 25px 20px; border-radius: 16px; cursor: pointer; border: 1px solid rgba(139, 92, 246, 0.2); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #8b5cf6, transparent);"></div>
                    <i class="fas fa-toolbox" style="font-size: 2.8rem; color: #8b5cf6; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 8px rgba(139,92,246,0.3));"></i>
                    <div style="font-weight: 900; color: #fff; font-size: 1.2rem; margin-bottom: 5px; letter-spacing: 1px;">PU-80</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">Ish Qurollari Daftari</div>
                </div>

                <div class="production-journal-card" onclick="window.openIzostikWindow && window.openIzostikWindow('${bolinmaId}')" 
                    style="background: rgba(15, 23, 42, 0.5); padding: 25px 20px; border-radius: 16px; cursor: pointer; border: 1px solid rgba(56, 189, 248, 0.2); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #38bdf8, transparent);"></div>
                    <i class="fas fa-microchip" style="font-size: 2.8rem; color: #38bdf8; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 8px rgba(56,189,248,0.3));"></i>
                    <div style="font-weight: 900; color: #fff; font-size: 1.2rem; margin-bottom: 5px; letter-spacing: 1px;">IZOSTIK</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">Izolatsiyalangan Choklar</div>
                </div>

                <div class="production-journal-card" onclick="if(window.openPletlarHisobiWindow) window.openPletlarHisobiWindow('${bolinmaId}')" 
                    style="background: rgba(15, 23, 42, 0.5); padding: 25px 20px; border-radius: 16px; cursor: pointer; border: 1px solid rgba(234, 179, 8, 0.2); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #eab308, transparent);"></div>
                    <i class="fas fa-grip-lines" style="font-size: 2.8rem; color: #eab308; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 8px rgba(234,179,8,0.3));"></i>
                    <div style="font-weight: 900; color: #fff; font-size: 1.2rem; margin-bottom: 5px; letter-spacing: 1px;">PLETLAR</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">Chokli / Chokssiz Relslar</div>
                </div>

                <div class="production-journal-card" onclick="if(window.openPKZRailsWindow) window.openPKZRailsWindow('${bolinmaId}')" 
                    style="background: rgba(15, 23, 42, 0.5); padding: 25px 20px; border-radius: 16px; cursor: pointer; border: 1px solid rgba(168, 85, 247, 0.2); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #a855f7, transparent);"></div>
                    <i class="fas fa-layer-group" style="font-size: 2.8rem; color: #a855f7; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 8px rgba(168,85,247,0.3));"></i>
                    <div style="font-weight: 900; color: #fff; font-size: 1.2rem; margin-bottom: 5px; letter-spacing: 1px;">PKZ RELSLAR</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">Barcha PKZ Relslar Hisobi</div>
                </div>

                <div class="production-journal-card defect-card" onclick="window.openTrackDefectMonitor && window.openTrackDefectMonitor('${bolinmaId}')" 
                    style="background: rgba(15, 23, 42, 0.5); padding: 25px 20px; border-radius: 16px; cursor: pointer; border: 1px solid rgba(239, 68, 68, 0.2); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #ef4444, transparent);"></div>
                    <i class="fas fa-radiation" style="font-size: 2.8rem; color: #ef4444; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 8px rgba(239,68,68,0.3));"></i>
                    <div style="font-weight: 900; color: #fff; font-size: 1.2rem; margin-bottom: 5px; letter-spacing: 1px;">DEFEKTOISLER</div>
                    <div style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">Defektoskoplar Monitoringi</div>
                </div>
            </div>
        </div>
        <style>
            .production-journal-card:hover { 
                transform: translateY(-8px) scale(1.03);
                background: rgba(30, 41, 59, 0.8) !important;
                box-shadow: 0 15px 30px rgba(0,0,0,0.6);
            }
            .defect-card:hover {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(185, 28, 28, 0.6)) !important;
                box-shadow: 0 15px 35px rgba(239, 68, 68, 0.3);
            }
            @keyframes pulseRed {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
            }
        </style>
    `;
}

// --- DIGITAL JOURNAL LOGIC ---
function openJournal(type, bolinmaId) {
    if (window.SmartUtils) window.SmartUtils.showToast(`${type} jurnali ko'rsatilmoqda...`, 'info', 2000);
    console.log(`Opening Journal: ${type} for ${bolinmaId}`);

    if (type === 'PU-28') {
        if (window.openPU28Window) window.openPU28Window(bolinmaId);
        else console.error("PU-28 modul topilmadi!");
    } else if (type === 'PU-29') {
        // Restauratsiya: openPU29Menu orqali dashboardni ochish
        if (window.openPU29Menu) {
            window.openPU29Menu(bolinmaId);
        } else if (window.openPU29Window) {
            window.openPU29Window(bolinmaId);
        } else {
            console.error("PU-29 modul topilmadi!");
        }
    } else if (type === 'PU-80') {
        console.log("PU-80: Triggered from dashboard for", bolinmaId);
        if (typeof window.openPU80Window === 'function') {
            window.openPU80Window(bolinmaId);
        } else {
            // Dinamik yuklash - keshni chetlab o'tish
            console.warn("PU-80: Dinamik yuklanmoqda...");
            const s = document.createElement('script');
            s.src = 'js/pu80.js?t=' + Date.now();
            s.onload = () => {
                if (typeof window.openPU80Window === 'function') {
                    window.openPU80Window(bolinmaId);
                } else {
                    alert("PU-80 moduli yuklanmadi. Ctrl+Shift+R bosib sahifani yangilang.");
                }
            };
            s.onerror = () => alert("PU-80 faylini yuklab bo'lmadi!");
            document.head.appendChild(s);
        }
    } else if (type === 'M-29') {
        openMaterialsWindow(bolinmaId);
    } else {
        SmartUtils.showToast(`"${type}" elektron jurnali hozirda tayyorlanmoqda. Tez orada ishga tushadi!`, 'info');
    }
}

window.openPU29Menu = function (bolinmaId) {
    if (window.initPU29Data) window.initPU29Data(bolinmaId);

    let modal = document.getElementById('pu29-menu-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'pu29-menu-modal';
    modal.className = 'integration-window active';
    modal.style.zIndex = '300000';
    modal.style.maxWidth = '1450px';
    modal.style.width = '98%';
    modal.style.height = '95vh';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.borderRadius = '30px';
    modal.style.overflow = 'hidden';
    modal.style.background = 'var(--bg-deep, #020617)';
    modal.style.boxShadow = '0 50px 100px rgba(0,0,0,0.8), inset 0 0 80px rgba(212, 175, 55, 0.05)';
    modal.style.border = '1px solid rgba(212, 175, 55, 0.2)';

    const pages = (window.pu29Pages && window.pu29Pages[bolinmaId]) || [];
    const stats = window.getPU29SummaryStats ? window.getPU29SummaryStats(bolinmaId) : { total: 0, ok: 0, warning: 0, critical: 0, categories: {} };
    const catLabels = window.getPU29CategoryLabels ? window.getPU29CategoryLabels() : {};
    const recent = window.getPU29RecentActivity ? window.getPU29RecentActivity(bolinmaId) : [];

    modal.innerHTML = `
        <div class="window-header" style="padding: 20px 35px; background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(212, 175, 55, 0.3); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 15px; color: var(--accent-gold, #ffd700); font-weight:900; letter-spacing:1.5px; text-transform: uppercase;">
                <i class="fas fa-microchip" style="animation: pulse 2s infinite;"></i>
                PU-29: HUDUDIY BOSHQARUV PANELI
            </h3>
            <div style="display:flex; align-items:center; gap:25px;">
                <div style="font-size:0.75rem; color:var(--text-main, #fff); font-weight:800; background:rgba(212, 175, 55, 0.1); padding:8px 20px; border-radius:15px; border:1px solid rgba(212, 175, 55, 0.2); display:flex; align-items:center; gap:15px;">
                    <div style="display:flex; align-items:center; gap:8px; color:var(--accent-gold);"><i class="fas fa-sun"></i> +28°C</div>
                    <div style="width:1px; height:15px; background:rgba(255,255,255,0.1);"></div>
                    <div style="display:flex; align-items:center; gap:8px; color:#38bdf8;"><i class="fas fa-wind"></i> 4 м/с</div>
                </div>
                <button onclick="document.getElementById('pu29-menu-modal').remove();" style="width:40px; height:40px; border-radius:50%; background:rgba(239, 68, 68, 0.15); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.3); cursor:pointer; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; transition: 0.3s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff';">&times;</button>
            </div>
        </div>
        
        <div style="display: flex; height: calc(100% - 85px);">
            <!-- Sidebar: Obsidian Style -->
            <div style="width: 320px; background: rgba(15, 23, 42, 0.6); border-right: 1px solid rgba(212, 175, 55, 0.15); padding: 25px; display: flex; flex-direction: column; gap: 20px; overflow-y:auto;">
                <button onclick="document.getElementById('pu29-menu-modal').remove(); const switches = window.pu29Pages['${bolinmaId}'] || []; if(window.openPU29Window) window.openPU29Window('${bolinmaId}', switches[0] || '1');" 
                    style="padding: 18px 25px; border-radius: 18px; border: 1px solid var(--accent-gold); background: rgba(212, 175, 55, 0.1); color: var(--accent-gold); cursor: pointer; text-align: left; display: flex; align-items: center; gap: 15px; transition: 0.4s; font-weight: 900; font-size:0.9rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.1);">
                    <i class="fas fa-book-journal-whills"></i> UMUMIY JURNAL
                </button>
                <button onclick="window.addPU29Page && window.addPU29Page('${bolinmaId}')" 
                    style="padding: 15px 25px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #94a3b8; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 15px; transition: 0.3s; font-weight: 800; font-size:0.8rem;">
                    <i class="fas fa-plus-circle"></i> YANGI STRELKA
                </button>

                <div style="margin-top: 15px; display:flex; flex-direction:column; gap:25px;">
                    ${Object.keys(catLabels).map(catKey => {
                        const cat = catLabels[catKey];
                        const catSwitches = pages.filter(sw => window.categorizePU29Switch && window.categorizePU29Switch(sw) === catKey);
                        if (catSwitches.length === 0) return '';
                        return `
                            <div>
                                <div style="font-size: 0.7rem; color: #64748b; font-weight: 900; letter-spacing: 2px; margin-bottom: 12px; text-transform: uppercase; display:flex; align-items:center; gap:10px;">
                                    <i class="fas ${cat.icon}" style="color:${cat.color};"></i> ${cat.label}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 10px;">
                                    ${catSwitches.map(sw => {
                                        const status = (window.getPU29SwitchStatus && window.getPU29SwitchStatus(bolinmaId, sw)) || 'none';
                                        const statusColors = { 'ok':'#10b981', 'warning':'#f59e0b', 'critical':'#ef4444', 'none':'#6366f1' };
                                        const col = statusColors[status] || '#64748b';
                                        return `
                                        <div class="pu29-sw-dark-item"
                                            style="padding: 12px 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); background: rgba(30, 41, 59, 0.4); color: #f8fafc; transition: 0.3s; display: flex; align-items: center; justify-content: space-between; font-weight:700; font-size: 0.9rem; cursor: pointer;"
                                            onclick="document.getElementById('pu29-menu-modal').remove(); window.openPU29EntryForSwitch('${bolinmaId}', '${sw}')">
                                            <div style="display: flex; align-items: center; gap: 15px;">
                                                <div style="width:10px; height:10px; border-radius:50%; background:${col}; box-shadow:0 0 12px ${col};"></div>
                                                <span>№ ${sw}</span>
                                            </div>
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <button onclick="event.stopPropagation(); window.deletePU29Page && window.deletePU29Page('${bolinmaId}', '${sw}')"
                                                        style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 5px; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; opacity: 0.3; transition: all 0.2s;"
                                                        onmouseover="this.style.opacity='1'; this.style.transform='scale(1.15)';"
                                                        onmouseout="this.style.opacity='0.3'; this.style.transform='scale(1)';"
                                                        title="O'chirish">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                                <i class="fas fa-chevron-right" style="font-size: 0.7rem; color: rgba(255,255,255,0.2);"></i>
                                            </div>
                                        </div>`;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Main Content Area: Dashboard Style -->
            <div id="pu29-dashboard-scroll" style="flex:1; padding: 35px; display: flex; flex-direction: column; gap:35px; overflow-y: auto; background: var(--bg-deep);">
                


                <!-- AI Analysis Zone: Premium Redesign -->
                <div style="background: linear-gradient(145deg, rgba(10,17,34,0.9), rgba(20,30,55,0.7)); border-radius: 32px; border: 1px solid rgba(212,175,55,0.25); padding: 35px; position: relative; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04);">
                    <!-- Animated gold bar on top -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent 0%, #d4af37 30%, #f59e0b 50%, #d4af37 70%, transparent 100%);"></div>
                    <!-- Ambient purple glow -->
                    <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%); pointer-events:none;"></div>
                    <div style="position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px; border-radius: 50%; background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%); pointer-events:none;"></div>

                    <!-- Zone Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
                        <div>
                            <div style="font-size: 0.65rem; color: #a78bfa; font-weight: 900; letter-spacing: 4px; display: flex; align-items: center; gap: 10px; text-transform: uppercase; margin-bottom: 10px;">
                                <i class="fas fa-atom" style="animation: spin 3s linear infinite;"></i> AI PREDICTIVE ANALYSIS ZONE
                            </div>
                            <h2 style="margin: 0; font-size: 1.9rem; font-weight: 900; text-transform: uppercase; background: linear-gradient(135deg, #fff 55%, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">STRELKALAR KOMPLEKS DIAGNOSTIKASI</h2>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); padding: 9px 20px; border-radius: 999px; flex-shrink: 0;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite;"></div>
                            <span style="font-size: 0.68rem; color: #10b981; font-weight: 900; letter-spacing: 1.5px;">REAL VAQT</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 370px 1fr; gap: 28px;">
                        <!-- LEFT PANEL -->
                        <div style="display: flex; flex-direction: column; gap: 16px;">

                            <!-- 4 stat cards -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); border-radius: 20px; padding: 20px 15px; text-align: center; position: relative; overflow: hidden; transition: all 0.3s;" onmouseover="this.style.borderColor='#10b981'; this.style.transform='translateY(-4px)';" onmouseout="this.style.borderColor='rgba(16,185,129,0.2)'; this.style.transform='none';">
                                    <div style="position:absolute; top:-18px; right:-18px; width:60px; height:60px; border-radius:50%; background:rgba(16,185,129,0.07);"></div>
                                    <i class="fas fa-check-circle" style="font-size:1.6rem; color:#10b981; display:block; margin-bottom:10px;"></i>
                                    <div style="font-size:2.2rem; font-weight:900; color:#10b981; line-height:1;">${stats.ok}</div>
                                    <div style="font-size:0.58rem; color:#64748b; font-weight:900; letter-spacing:1.5px; margin-top:6px;">SOZ STRELKALAR</div>
                                </div>
                                <div style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); border-radius: 20px; padding: 20px 15px; text-align: center; position: relative; overflow: hidden; transition: all 0.3s;" onmouseover="this.style.borderColor='#ef4444'; this.style.transform='translateY(-4px)';" onmouseout="this.style.borderColor='rgba(239,68,68,0.2)'; this.style.transform='none';">
                                    <div style="position:absolute; top:-18px; right:-18px; width:60px; height:60px; border-radius:50%; background:rgba(239,68,68,0.07);"></div>
                                    <i class="fas fa-exclamation-triangle" style="font-size:1.6rem; color:${stats.critical>0?'#ef4444':'#475569'}; display:block; margin-bottom:10px; ${stats.critical>0?'animation:pulse 1.5s infinite;':''}"></i>
                                    <div style="font-size:2.2rem; font-weight:900; color:${stats.critical>0?'#ef4444':'#475569'}; line-height:1;">${stats.critical}</div>
                                    <div style="font-size:0.58rem; color:#64748b; font-weight:900; letter-spacing:1.5px; margin-top:6px;">XAVFLI</div>
                                </div>
                                <div style="background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); border-radius: 20px; padding: 20px 15px; text-align: center; transition: all 0.3s;" onmouseover="this.style.borderColor='#f59e0b'; this.style.transform='translateY(-4px)';" onmouseout="this.style.borderColor='rgba(245,158,11,0.2)'; this.style.transform='none';">
                                    <i class="fas fa-bell" style="font-size:1.6rem; color:#f59e0b; display:block; margin-bottom:10px;"></i>
                                    <div style="font-size:2.2rem; font-weight:900; color:#f59e0b; line-height:1;">${stats.warning}</div>
                                    <div style="font-size:0.58rem; color:#64748b; font-weight:900; letter-spacing:1.5px; margin-top:6px;">OGOHLANTIRISH</div>
                                </div>
                                <div style="background: rgba(212,175,55,0.06); border: 1px solid rgba(212,175,55,0.2); border-radius: 20px; padding: 20px 15px; text-align: center; transition: all 0.3s;" onmouseover="this.style.borderColor='#d4af37'; this.style.transform='translateY(-4px)';" onmouseout="this.style.borderColor='rgba(212,175,55,0.2)'; this.style.transform='none';">
                                    <i class="fas fa-layer-group" style="font-size:1.6rem; color:#d4af37; display:block; margin-bottom:10px;"></i>
                                    <div style="font-size:2.2rem; font-weight:900; color:#d4af37; line-height:1;">${stats.total}</div>
                                    <div style="font-size:0.58rem; color:#64748b; font-weight:900; letter-spacing:1.5px; margin-top:6px;">JAMI</div>
                                </div>
                            </div>

                            <!-- Health Score -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; padding: 18px 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <span style="font-size: 0.63rem; color: #64748b; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">UMUMIY SALOMATLIK</span>
                                    <span style="font-size: 1.1rem; font-weight: 900; color: #10b981;">${stats.total > 0 ? Math.round((stats.ok / stats.total) * 100) : 100}%</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.04); border-radius: 999px; height: 8px; overflow: hidden;">
                                    <div style="height: 100%; border-radius: 999px; background: linear-gradient(90deg, #059669, #10b981, #6ee7b7); width: ${stats.total > 0 ? Math.round((stats.ok / stats.total) * 100) : 100}%; box-shadow: 0 0 14px rgba(16,185,129,0.6);"></div>
                                </div>
                            </div>

                            <!-- AI Summary card -->
                            <div style="background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.15); border-radius: 18px; padding: 20px; flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <span style="font-size: 0.63rem; font-weight: 900; color: #a78bfa; text-transform: uppercase; letter-spacing: 2px;">AI XULOSASI</span>
                                    <i class="fas fa-brain" style="color: #a78bfa; font-size: 1.1rem;"></i>
                                </div>
                                <div style="font-size: 0.85rem; color: #94a3b8; line-height: 1.75; font-weight: 500;">
                                    Barcha strelkalar optimal holatda. Tonna brutto limiti doirasida ishlayapti. Keyingi texnik tekshiruv muddati belgilangan.
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT: Premium Diagnostic Table -->
                        <div style="background: rgba(8,14,30,0.7); border-radius: 24px; border: 1px solid rgba(212,175,55,0.12); overflow: hidden; display: flex; flex-direction: column;">
                            <!-- Table topbar -->
                            <div style="padding: 16px 24px; background: rgba(212,175,55,0.04); border-bottom: 1px solid rgba(212,175,55,0.1); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite;"></div>
                                    <span style="font-size: 0.7rem; font-weight: 900; color: #e2e8f0; letter-spacing: 2px; text-transform: uppercase;">KOMPLEKS DIAGNOSTIKA MATRITSA</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 0.65rem; color: #d4af37; font-weight: 800; background: rgba(212,175,55,0.08); padding: 5px 14px; border-radius: 999px; border: 1px solid rgba(212,175,55,0.2);">
                                        <i class="fas fa-database" style="margin-right:5px;"></i>${pages.length} strelka
                                    </span>
                                </div>
                            </div>

                            <div style="overflow-x: auto; flex: 1; padding: 15px;">
                                <div style="overflow: hidden; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(10px); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                                    <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.85rem; color: #f8fafc;">
                                        <thead>
                                            <tr style="background: rgba(30, 41, 59, 0.7); text-align: center;">
                                                <th rowspan="2" style="padding: 18px 24px; border-right: 1px solid rgba(255,255,255,0.08); border-bottom: 2px solid rgba(255,255,255,0.08); text-align: left; font-weight: 800; color: #fff; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; width: 260px; min-width: 260px;">Aniqlangan kamchiliklar</th>
                                                <th colspan="3" style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.08); border-bottom: 2px solid rgba(255,255,255,0.08); font-weight: 900; color: #ffd700; background: rgba(212, 175, 55, 0.06); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fas fa-road" style="margin-right: 6px;"></i> Asosiy yo'l</th>
                                                <th colspan="3" style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.08); border-bottom: 2px solid rgba(255,255,255,0.08); font-weight: 900; color: #38bdf8; background: rgba(56, 189, 248, 0.06); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fas fa-exchange-alt" style="margin-right: 6px;"></i> Qabul qilish-Jo'nash</th>
                                                <th colspan="3" style="padding: 12px; border-bottom: 2px solid rgba(255,255,255,0.08); font-weight: 900; color: #94a3b8; background: rgba(148, 163, 184, 0.06); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fas fa-ellipsis-h" style="margin-right: 6px;"></i> Boshqa yo'l</th>
                                            </tr>
                                            <tr style="background: rgba(15, 23, 42, 0.8); border-bottom: 2px solid rgba(255,255,255,0.08); text-align: center; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                                <th style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.04); color: #10b981; font-weight: 800;">yashil</th>
                                                <th style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.04); color: #f59e0b; font-weight: 800;">sariq</th>
                                                <th style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.08); color: #ef4444; font-weight: 800;">Qizil</th>
                                                <th style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.04); color: #10b981; font-weight: 800;">yashil</th>
                                                <th style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.04); color: #f59e0b; font-weight: 800;">sariq</th>
                                                <th style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.08); color: #ef4444; font-weight: 800;">Qizil</th>
                                                <th style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.04); color: #10b981; font-weight: 800;">yashil</th>
                                                <th style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.04); color: #f59e0b; font-weight: 800;">sariq</th>
                                                <th style="padding: 10px; color: #ef4444; font-weight: 800;">Qizil</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${(() => {
                                                const c = (window.getPU29DefectCounts ? window.getPU29DefectCounts(bolinmaId) : null) || {
                                                    core_wear: { asosiy: { yashil: 0, sariq: 0, qizil: 0 }, qabul_jonash: { yashil: 0, sariq: 0, qizil: 0 }, boshqa: { yashil: 0, sariq: 0, qizil: 0 } },
                                                    stock_wear: { asosiy: { yashil: 0, sariq: 0, qizil: 0 }, qabul_jonash: { yashil: 0, sariq: 0, qizil: 0 }, boshqa: { yashil: 0, sariq: 0, qizil: 0 } },
                                                    chipping: { asosiy: { yashil: 0, sariq: 0, qizil: 0 }, qabul_jonash: { yashil: 0, sariq: 0, qizil: 0 }, boshqa: { yashil: 0, sariq: 0, qizil: 0 } },
                                                    traffic: { asosiy: { yashil: 0, sariq: 0, qizil: 0 }, qabul_jonash: { yashil: 0, sariq: 0, qizil: 0 }, boshqa: { yashil: 0, sariq: 0, qizil: 0 } }
                                                };
                                                const rows = [
                                                    ['Износ сердеч', c.core_wear, 'fa-crosshairs', '#38bdf8'],
                                                    ['Износ рамны рельса', c.stock_wear, 'fa-grip-lines', '#10b981'],
                                                    ['Выкрашивание', c.chipping, 'fa-unlink', '#fbbf24'],
                                                    ['Грузонапряженность', c.traffic, 'fa-train', '#ec4899']
                                                ];
                                                return rows.map(([title, val, icon, iconCol], idx) => {
                                                    const bg = idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent';
                                                    const cellVal = (grp, status) => {
                                                        const num = val[grp][status];
                                                        if (num === 0) return `<span style="color: rgba(255,255,255,0.08); font-weight: 400; font-size: 0.9rem;">0</span>`;
                                                        
                                                        let color, badgeBg, border, shadow;
                                                        if (status === 'yashil') {
                                                            color = '#10b981';
                                                            badgeBg = 'rgba(16, 185, 129, 0.15)';
                                                            border = '1px solid rgba(16, 185, 129, 0.3)';
                                                            shadow = '';
                                                        } else if (status === 'sariq') {
                                                            color = '#000000';
                                                            badgeBg = '#fbbf24';
                                                            border = 'none';
                                                            shadow = 'box-shadow: 0 0 12px rgba(251, 191, 36, 0.6); font-weight: 900;';
                                                        } else { // qizil
                                                            color = '#ffffff';
                                                            badgeBg = '#ef4444';
                                                            border = 'none';
                                                            shadow = 'box-shadow: 0 0 15px rgba(239, 68, 68, 0.85); font-weight: 900;';
                                                        }
                                                        
                                                        return `<span onclick="window.showDefectSwitches && window.showDefectSwitches('${bolinmaId}', '${title}', '${grp}', '${status}')" 
                                                                      style="display: inline-flex; align-items: center; justify-content: center; min-width: 38px; height: 26px; border-radius: 8px; font-weight: 800; font-size: 0.95rem; background: ${badgeBg}; ${border ? 'border: ' + border + ';' : ''} color: ${color}; cursor: pointer; transition: all 0.2s; ${shadow}"
                                                                      onmouseover="this.style.transform='scale(1.15)';"
                                                                      onmouseout="this.style.transform='scale(1)';">
                                                                    ${num}
                                                                </span>`;
                                                    };
                                                    return `
                                                    <tr style="background: ${bg}; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)';" onmouseout="this.style.background='${bg}';">
                                                        <td style="padding: 16px 24px; border-right: 1px solid rgba(255,255,255,0.05); text-align: left; font-weight: 700; color: #e2e8f0; white-space: nowrap; width: 260px; min-width: 260px;">
                                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                                <i class="fas ${icon}" style="color: ${iconCol}; font-size: 1.05rem; width: 22px; text-align: center;"></i>
                                                                <span>${title}</span>
                                                            </div>
                                                        </td>
                                                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.04);">${cellVal('asosiy', 'yashil')}</td>
                                                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.04);">${cellVal('asosiy', 'sariq')}</td>
                                                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.08); background: rgba(239,68,68,0.015);">${cellVal('asosiy', 'qizil')}</td>
                                                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.04);">${cellVal('qabul_jonash', 'yashil')}</td>
                                                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.04);">${cellVal('qabul_jonash', 'sariq')}</td>
                                                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.08); background: rgba(239,68,68,0.015);">${cellVal('qabul_jonash', 'qizil')}</td>
                                                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.04);">${cellVal('boshqa', 'yashil')}</td>
                                                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.04);">${cellVal('boshqa', 'sariq')}</td>
                                                        <td style="padding: 12px; background: rgba(239,68,68,0.015);">${cellVal('boshqa', 'qizil')}</td>
                                                    </tr>`;
                                                }).join('');
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
        
        <style>
            .premium-stat-card { background: rgba(30, 41, 59, 0.7); border-radius: 25px; padding: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 15px 35px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 10px; transition: 0.4s; position: relative; overflow: hidden; }
            .premium-stat-card::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(255,255,255,0.02), transparent); pointer-events: none; }
            .premium-stat-card:hover { transform: translateY(-10px); background: rgba(30, 41, 59, 0.9); border-color: rgba(212, 175, 55, 0.2); }
            .stat-lbl { font-size: 0.7rem; color: #94a3b8; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
            .stat-val { font-size: 3rem; font-weight: 900; color: #fff; line-height: 1; letter-spacing: -2px; }
            .pu29-sw-dark-item:hover { background: rgba(212, 175, 55, 0.1) !important; border-color: var(--accent-gold) !important; transform: translateX(8px); }
            @keyframes pulse { 0% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.6; transform: scale(1); } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            #pu29-dashboard-scroll::-webkit-scrollbar { width: 8px; }
            #pu29-dashboard-scroll::-webkit-scrollbar-track { background: var(--bg-deep); }
            #pu29-dashboard-scroll::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }
            #pu29-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: var(--accent-gold); }
        </style>
    `;

    document.body.appendChild(modal);


}

// --- PU-28: Yo'l Ko'rik Kitobi --- (Yangi pu28.js moduliga o'tkazildi)

// Redundant economy and accounting section old code removed.

// Eski PU-74 (localStorage jadvali) olib tashlandi — yangi jurnal: /dashboard/pu74


// --- EMPLOYEE MANAGEMENT FUNCTIONS ---

function renderEmployeeManagement(window, bolinmaId) {
    const contentDiv = window.querySelector('.window-content');
    if (!contentDiv) return;

    // 1. Find or create container
    let empView = contentDiv.querySelector('#employee-management-view');
    if (!empView) {
        empView = document.createElement('div');
        empView.id = 'employee-management-view';
        empView.style.display = 'none'; // Hidden by default

        // Insert after the file controls (.file-management)
        // The template structure: .window-content > .file-management(controls) > h3 > .files-table
        const fileControls = contentDiv.querySelector('.file-management');
        if (fileControls && fileControls.nextElementSibling) {
            contentDiv.insertBefore(empView, fileControls.nextElementSibling);
        } else {
            contentDiv.appendChild(empView);
        }

        // Add Toggle Button to File Controls
        if (fileControls) {
            if (!fileControls.querySelector('.toggle-employees-btn')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'control-btn toggle-employees-btn';
                toggleBtn.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
                toggleBtn.innerHTML = '<i class="fas fa-users"></i> Xodimlar Jadvali';
                toggleBtn.onclick = () => {
                    const view = window.querySelector('#employee-management-view');
                    if (view.style.display === 'none') {
                        view.style.display = 'block';
                        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Yopish';
                    } else {
                        view.style.display = 'none';
                        toggleBtn.innerHTML = '<i class="fas fa-users"></i> Xodimlar Jadvali';
                    }
                };
                fileControls.appendChild(toggleBtn);

                // Add Murojaat button for Subdivisions
                const isSubdivisionRole = window.Auth?.currentUser && window.Auth.currentUser.role !== 'admin' && window.Auth.currentUser.role !== 'hr';
                if (bolinmaId.startsWith('bolinma') && isSubdivisionRole) {
                    const murojaatBtn = document.createElement('button');
                    murojaatBtn.className = 'control-btn subdivision-murojaat-btn';
                    murojaatBtn.style.cssText = `
                        background: var(--gold-gradient);
                        color: #000;
                        margin-left: 10px;
                        border: none;
                        padding: 10px 24px;
                        border-radius: 12px;
                        font-weight: 800;
                        font-size: 0.9rem;
                        cursor: pointer;
                        box-shadow: 0 5px 20px rgba(212, 175, 55, 0.3);
                        transition: 0.3s;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    `;
                    murojaatBtn.innerHTML = '<i class="fas fa-file-signature"></i> Murojaat yuborish';
                    murojaatBtn.onclick = () => {
                        const bNum = bolinmaId.replace('bolinma', '');
                        const bName = `${bNum}-bo'linma`;
                        if (window.openHRMurojaatWindow) window.openHRMurojaatWindow(bName);
                        else SmartUtils.showToast("Murojaat moduli yuklanmagan!", "error");
                    };
                    fileControls.appendChild(murojaatBtn);
                }
            }
        }
    }

    // 2. Filter workers
    // Try to get from HR module first (database), then fallback to legacy workersData
    const bolinmaNumber = bolinmaId.replace('bolinma', ''); // "1"
    const bolinmaName = `${bolinmaNumber}-bo'linma`; // "1-bo'linma"

    let workers = [];
    if (window.hrData && window.hrData.employees && window.hrData.employees.length > 0) {
        workers = window.hrData.employees.filter(e =>
            e.bolinma === bolinmaName ||
            e.bolinmaId === bolinmaName ||
            e.department === bolinmaName ||
            String(e.bolinmaId) === bolinmaNumber ||
            String(e.department) === bolinmaNumber
        );
    }

    if (workers.length === 0) {
        workers = workersData.filter(w => w.bolinma === bolinmaName);
    }

    // 3. Get Employee Stats (Attendance & Medical) from LocalStorage
    const statsKey = `employee_stats_${bolinmaId}`;
    let stats = JSON.parse(localStorage.getItem(statsKey)) || {};

    // 4. Build HTML
    let html = `
                                    <div class="employee-management" style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; margin-bottom: 20px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                            <h3 class="section-title" style="margin: 0;"><i class="fas fa-users-cog"></i> Xodimlar Jadvali (Elektron Tabel)</h3>
                                            <div style="display: flex; gap: 10px; align-items: center;">
                                                <button onclick="const bn=this.closest('.employee-management').parentElement.getAttribute('data-id') || ''; const bNum=bn.replace('bolinma',''); window.openHRMurojaatWindow(bNum + '-bo\\'linma')" style="padding: 10px 20px; background: var(--gold-gradient); border: none; color: #000; border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 800; box-shadow: 0 4px 15px rgba(212,175,55,0.2); transition: 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                                     <i class="fas fa-file-signature"></i> Murojaat yuborish
                                                </button>
                                                <div style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">
                                                    <i class="fas fa-info-circle"></i> Tahrirlash: "Xodimlar bo'limi"
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style="overflow-x: auto; max-height: 400px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                                            <table class="employee-table" style="margin-top: 0;">
                                                <thead style="position: sticky; top: 0; background: #2c3e50; z-index: 10;">
                                                    <tr>
                                                        <th>F.I.SH</th>
                                                        <th>Lavozim</th>
                                                        <th>Davomat / Smena</th>
                                                        <th>Tibbiy Ko'rik</th>
                                                        <th>Amallar</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                `;

    if (workers.length === 0) {
        html += `<tr><td colspan="5" style="text-align: center; padding: 20px; color: rgba(255,255,255,0.5);">Xodimlar topilmadi</td></tr>`;
    } else {
        workers.forEach(worker => {
            const wStats = stats[worker.id] || {
                attendance: { status: 'rest', checkIn: null },
                medical: { lastCheck: '2023-01-01', nextCheck: '2024-01-01' }
            };

            // Status Badge Logic
            let statusBadge = '';
            if (wStats.attendance.status === 'shift') {
                statusBadge = `<span class="status-badge status-shift"><i class="fas fa-clock"></i> Smenada (${wStats.attendance.checkIn || '08:00'})</span>`;
            } else if (wStats.attendance.status === 'vacation') {
                statusBadge = `<span class="status-badge status-vacation"><i class="fas fa-plane"></i> Ta'tilda</span>`;
            } else {
                statusBadge = `<span class="status-badge status-rest"><i class="fas fa-home"></i> Dam olish</span>`;
            }

            // Medical Badge Logic
            const nextCheckDate = new Date(wStats.medical.nextCheck);
            const today = new Date();
            const warningDate = new Date();
            warningDate.setMonth(today.getMonth() + 1);

            let medicalClass = 'valid';
            let medicalIcon = 'check-circle';
            let medicalText = `Navbatdagi: ${wStats.medical.nextCheck}`;

            if (nextCheckDate < today) {
                medicalClass = 'expired';
                medicalIcon = 'exclamation-circle';
                medicalText = 'MUDDATI O\'TGAN!';
            } else if (nextCheckDate < warningDate) {
                medicalClass = 'warning';
                medicalIcon = 'exclamation-triangle';
                medicalText = `Oz qoldi: ${wStats.medical.nextCheck}`;
            }

            const medicalBadge = `
                                            <span class="medical-badge ${medicalClass}">
                                                <i class="fas fa-${medicalIcon}"></i> ${medicalText}
                                            </span>
                                        `;

            // Edit Button Permission Check
            const canEdit = currentUser.role === 'admin' ||
                currentUser.role === 'xodimlar' ||
                (currentUser.role === 'department' && currentUser.departments.includes('xodimlar')) ||
                (currentUser.role === 'bolinma' && currentUser.departments.includes('xodimlar'));

            const editBtn = canEdit ? `
                                            <button class="action-btn edit" onclick="editEmployeeStats('${bolinmaId}', ${worker.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        ` : `<span style="opacity: 0.3; font-size: 0.8rem;">---</span>`;

            html += `
                                            <tr>
                                                <td><strong>${escapeHtml(worker.name)}</strong></td>
                                                <td style="font-size: 0.9rem; opacity: 0.8;">${worker.role}</td>
                                                <td>${statusBadge}</td>
                                                <td>${medicalBadge}</td>
                                                <td>${editBtn}</td>
                                            </tr>
                                        `;
        });
    }

    html += `
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                `;

    empView.innerHTML = html;
}

function editEmployeeStats(bolinmaId, workerId) {
    // 1. Get Data
    const statsKey = `employee_stats_${bolinmaId}`;
    const stats = JSON.parse(localStorage.getItem(statsKey)) || {};
    const wStats = stats[workerId] || {
        attendance: { status: 'rest', checkIn: '' },
        medical: { lastCheck: '', nextCheck: '' }
    };

    // Find worker name for display
    const bolinmaNumber = bolinmaId.replace('bolinma', '');
    const bolinmaName = `${bolinmaNumber}-bo'linma`;
    const worker = workersData.find(w => w.id === workerId); // Global search is safer if ID is unique, otherwise filter by bolinma
    const workerName = worker ? worker.name : "Xodim";

    // 2. Create Modal
    const modalId = 'employee-stats-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove(); // Clean up old instances

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'integration-window active'; // Use existing class for styling
    modal.style.zIndex = "10001";
    modal.style.display = "flex"; // Override

    modal.innerHTML = `
                                    <div class="window-header">
                                        <h2><i class="fas fa-user-edit"></i> ${workerName}: Ma'lumotlarni Tahrirlash</h2>
                                        <button class="close-window" onclick="document.getElementById('${modalId}').remove()">&times;</button>
                                    </div>
                                    <div class="integration-content" style="padding: 20px;">
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                            <!-- Attendance Section -->
                                            <div class="content-card">
                                                <h3 style="color: #3498db; margin-bottom: 15px;"><i class="fas fa-clock"></i> Davomat / Smena</h3>
                                                
                                                <div class="form-group" style="margin-bottom: 15px;">
                                                    <label style="display: block; margin-bottom: 5px;">Holat:</label>
                                                    <select id="emp-status" style="width: 100%; padding: 8px; border-radius: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white;">
                                                        <option value="rest" ${wStats.attendance.status === 'rest' ? 'selected' : ''}>Dam olish (Uyda)</option>
                                                        <option value="shift" ${wStats.attendance.status === 'shift' ? 'selected' : ''}>Ishda (Smenada)</option>
                                                        <option value="vacation" ${wStats.attendance.status === 'vacation' ? 'selected' : ''}>Ta'tilda</option>
                                                    </select>
                                                </div>

                                                <div class="form-group" style="margin-bottom: 15px;">
                                                    <label style="display: block; margin-bottom: 5px;">Kelgan vaqti (agar ishda bo'lsa):</label>
                                                    <input type="time" id="emp-checkin" value="${wStats.attendance.checkIn || ''}" style="width: 100%; padding: 8px; border-radius: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white;">
                                                </div>
                                            </div>

                                            <!-- Medical Section -->
                                            <div class="content-card">
                                                <h3 style="color: #2ecc71; margin-bottom: 15px;"><i class="fas fa-heartbeat"></i> Tibbiy Ko'rik</h3>
                                                
                                                <div class="form-group" style="margin-bottom: 15px;">
                                                    <label style="display: block; margin-bottom: 5px;">Oxirgi ko'rik sanasi:</label>
                                                    <input type="date" id="emp-lastcheck" value="${wStats.medical.lastCheck || ''}" style="width: 100%; padding: 8px; border-radius: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white;">
                                                </div>

                                                <div class="form-group" style="margin-bottom: 15px;">
                                                    <label style="display: block; margin-bottom: 5px;">Keyingi ko'rik sanasi:</label>
                                                    <input type="date" id="emp-nextcheck" value="${wStats.medical.nextCheck || ''}" style="width: 100%; padding: 8px; border-radius: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white;">
                                                </div>
                                            </div>
                                        </div>

                                        <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                                            <button class="control-btn" onclick="document.getElementById('${modalId}').remove()">Bekor qilish</button>
                                            <button class="control-btn green" onclick="saveEmployeeStats('${bolinmaId}', ${workerId})"><i class="fas fa-save"></i> Saqlash</button>
                                        </div>
                                    </div>
                                `;

    document.body.appendChild(modal);
    document.getElementById('department-overlay').classList.add('active'); // Ensure overlay is on
}

function saveEmployeeStats(bolinmaId, workerId) {
    const status = document.getElementById('emp-status').value;
    const checkIn = document.getElementById('emp-checkin').value;
    const lastCheck = document.getElementById('emp-lastcheck').value;
    const nextCheck = document.getElementById('emp-nextcheck').value;
}

function openDepartmentWindow(departmentId) {
    const _u = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : (window.Auth && window.Auth.currentUser);
    if (!_u) {
        if (window.showToast) window.showToast("Iltimos, avval tizimga kiring!", "warning");
        return;
    }

    const department = functionalDepartments.find(d => d.id === departmentId);
    if (!department) {
        console.warn("Department not found:", departmentId);
        return;
    }

    let win = document.getElementById(`${departmentId}-window`);
    if (!win) {
        const template = document.getElementById('departmentWindowTemplate');
        const clone = template.content.cloneNode(true);
        win = clone.querySelector('.department-window');
        win.id = `${departmentId}-window`;
        win.querySelector('.department-name').textContent = department.name;

        const integrateBtn = win.querySelector('.integrate-btn');
        if (department.integrations && department.integrations.length > 0) {
            integrateBtn.style.display = 'flex';
            integrateBtn.addEventListener('click', () => {
                openIntegrationWindow(department.integrations[0], departmentId);
            });
        } else {
            integrateBtn.style.display = 'none';
        }
        document.body.appendChild(win);
    }

    win.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');
    if (window.syncMobileBottomBar) window.syncMobileBottomBar();

    // Track which subdivision/department window is currently open
    // so that openTimesheet() can filter employees by it.
    if (departmentId && departmentId.startsWith('bolinma')) {
        window.viewingSubdivisionId = departmentId;
    } else {
        // For non-bolinma departments, still track it
        window.viewingSubdivisionId = departmentId;
    }

    const content = win.querySelector('.window-content');
    const isXodimlar = departmentId === 'xodimlar' || departmentId.includes('-xodimlar') || /-2$/.test(departmentId);

    if (isXodimlar && typeof renderHRMainPortal === 'function') {
        content.id = 'hr-dept-content';
        content.innerHTML = renderHRMainPortal(departmentId);
    } else if (departmentId === 'dispetcher') {
        content.innerHTML = '<div class="dispatcher-dashboard-container" style="padding:40px; text-align:center; color:white;"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>';
        if (typeof initDispatcherData === 'function') {
            initDispatcherData().then(() => {
                const dash = content.querySelector('.dispatcher-dashboard-container');
                if (dash) dash.innerHTML = typeof getDispatcherDashboardHTML === 'function' ? getDispatcherDashboardHTML() : 'Dispetcher Error';
            });
        }
    } else if (departmentId === 'metrologiya') {
        content.innerHTML = typeof getMetrologyDashboardHTML === 'function' ? getMetrologyDashboardHTML() : 'Metrologiya Error';
    } else if (departmentId === 'mehnat-muhofazasi' || departmentId === 'mehnat') {
        if (typeof renderSafetyDashboard === 'function') {
            let contextBolinma = 'all';
            if (_u.role === 'bolinma' && _u.bolinmalar?.length > 0) contextBolinma = _u.bolinmalar[0];
            renderSafetyDashboard(win, contextBolinma);
        }
    } else if (departmentId === 'mexanika') {
        if (typeof renderMechanicsSection === 'function') renderMechanicsSection(win, departmentId);
        if (typeof injectMexanikaButtons === 'function') injectMexanikaButtons(win, departmentId);
    } else {
        if (!content.querySelector('.files-area-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'files-area-wrapper';
            while (content.firstChild) wrapper.appendChild(content.firstChild);
            content.appendChild(wrapper);

            const sidebar = document.createElement('div');
            sidebar.className = 'road-management-sidebar';
            sidebar.innerHTML = typeof getRoadSidebarHTML === 'function' ? getRoadSidebarHTML(departmentId) : '';
            content.appendChild(sidebar);
        }
        updateFilesTable(win, departmentId);
    }

    setupDepartmentWindowEvents(win, departmentId);

    const uploadBtn = win.querySelector('.upload-file-btn');
    if (uploadBtn) {
        uploadBtn.style.display = (_u.role === 'bolinma' || _u.role === 'admin') ? 'inline-flex' : 'none';
    }
}


function setupDepartmentWindowEvents(win, departmentId) {
    if (!win) return;

    // --- BASE CONTROLS ---
    const uploadBtnBase = win.querySelector('.upload-file-btn');
    if (uploadBtnBase) {
        uploadBtnBase.onclick = () => win.querySelector('.file-input').click();
    }

    const createFolderBtnBase = win.querySelector('.create-folder-btn');
    if (createFolderBtnBase) {
        createFolderBtnBase.onclick = () => {
            const folderName = win.querySelector('.new-folder-name').value;
            if (folderName) {
                const select = win.querySelector('.folder-select');
                const newOption = document.createElement('option');
                newOption.value = folderName.toLowerCase().replace(/\s+/g, '-');
                newOption.textContent = folderName;
                select.appendChild(newOption);
                SmartUtils.showToast(`"${folderName}" papkasi yaratildi!`, "success");
                win.querySelector('.new-folder-name').value = '';
            } else {
                alert('Iltimos, papka nomini kiriting!');
            }
        };
    }

    const setDeadlineBtnBase = win.querySelector('.set-deadline-btn');
    if (setDeadlineBtnBase) {
        setDeadlineBtnBase.onclick = () => {
            const deadline = win.querySelector('.deadline-date').value;
            if (deadline) {
                alert(`Hisobot topshirish muddati: ${deadline} belgilandi!`);
            } else {
                alert('Iltimos, muddatni tanlang!');
            }
        };
    }

    const fileInput = win.querySelector('.file-input');
    if (fileInput) {
        fileInput.onchange = function (e) {
            const files = e.target.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    uploadFile(files[i], departmentId, win);
                }
                updateFilesTable(win, departmentId);
                this.value = '';
            }
        };
    }

    const folderSelect = win.querySelector('.folder-select');
    if (folderSelect) {
        folderSelect.onchange = function () {
            const folderContents = win.querySelector('.folder-contents');
            if (this.value) {
                folderContents.classList.add('active');
                updateFolderContents(win, departmentId, this.value);
            } else {
                folderContents.classList.remove('active');
            }
        };
    }

    const controls = win.querySelector('.file-controls');
    if (!controls) return;

    // --- DYNAMIC BUTTONS (PU, Tabel, etc) ---
    const isSubdivision = departmentId.startsWith('bolinma');
    const isProduction = departmentId === 'ishlab-chiqarish' || isSubdivision;
    // Xodimlar bo'limi (xodimlar) yoki bo'linma ichidagi xodimlar section (-xodimlar yoki -2)
    // sectionsData definition: Xodimlar turi id: 2 bilan saqlangan (masalan "bolinma1-2")
    const isXodimlarSection = departmentId === 'xodimlar' || departmentId.includes('-xodimlar') || /-2$/.test(departmentId);

    // 1. PU-74
    let pu74Btn = win.querySelector('.pu74-btn');
    if (!pu74Btn) {
        pu74Btn = document.createElement('button');
        pu74Btn.className = 'control-btn pu74-btn';
        pu74Btn.style.background = 'linear-gradient(135deg, #00c6ff, #0072ff)';
        pu74Btn.style.marginLeft = '5px';
        pu74Btn.innerHTML = '<i class="fas fa-clipboard-list"></i> PU-74';
        controls.appendChild(pu74Btn);
    }
    const hasPU74 = !isXodimlarSection && (currentUser.role === 'bolinma' || currentUser.role === 'admin' || departmentId === 'iqtisod' || (currentUser.role === 'department' && currentUser.departments?.includes('iqtisod')));
    pu74Btn.style.display = hasPU74 ? 'inline-flex' : 'none';
    pu74Btn.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (typeof window.openPU74Window === 'function') {
            window.openPU74Window(departmentId);
        } else {
            alert('PU-74 yuklanmagan!');
        }
    };

    // 1b. PU-74 Tahlili (faqat Iqtisodiyot bo'limi uchun — brigadalar holatini umumiy ko'rish)
    let pu74DashBtn = win.querySelector('.pu74-dashboard-btn');
    if (!pu74DashBtn) {
        pu74DashBtn = document.createElement('button');
        pu74DashBtn.className = 'control-btn pu74-dashboard-btn';
        pu74DashBtn.style.background = 'linear-gradient(135deg, #d4af37, #b8860b)';
        pu74DashBtn.style.marginLeft = '5px';
        pu74DashBtn.innerHTML = '<i class="fas fa-chart-pie"></i> PU-74 Tahlili';
        controls.appendChild(pu74DashBtn);
    }
    pu74DashBtn.style.display = departmentId === 'iqtisod' ? 'inline-flex' : 'none';
    pu74DashBtn.onclick = () => {
        if (typeof window.closeAllWindows === 'function') window.closeAllWindows();
        if (window.PU74Dashboard) window.PU74Dashboard.open();
    };

    // 2. PU-29
    let pu29Btn = win.querySelector('.pu29-btn');
    if (!pu29Btn) {
        pu29Btn = document.createElement('button');
        pu29Btn.className = 'control-btn pu29-btn';
        pu29Btn.style.background = 'linear-gradient(135deg, #f093fb, #f5576c)';
        pu29Btn.style.marginLeft = '5px';
        pu29Btn.innerHTML = '<i class="fas fa-road"></i> PU-29';
        controls.appendChild(pu29Btn);
    }
    const hasPU29 = !isXodimlarSection && (isProduction || currentUser.role === 'admin' || (currentUser.role === 'department' && currentUser.departments?.includes('ishlab-chiqarish')));
    pu29Btn.style.display = hasPU29 ? 'inline-flex' : 'none';
    pu29Btn.onclick = () => {
    console.log('PU-29 button clicked', {departmentId, role: currentUser.role, departments: currentUser.departments});
    if (typeof window.openPU29Menu === 'function') {
        console.log('Opening PU-29 menu');
        window.openPU29Menu(departmentId);
    } else if (typeof window.openPU29Window === 'function') {
        console.log('Opening PU-29 window');
        window.openPU29Window(departmentId);
    } else {
        SmartUtils.showToast('PU-29 funksiyasi yuklanmagan!', 'error');
    }
};

    // 3. PU-80
    let pu80Btn = win.querySelector('.pu80-btn');
    if (!pu80Btn) {
        pu80Btn = document.createElement('button');
        pu80Btn.className = 'control-btn pu80-btn';
        pu80Btn.style.background = 'linear-gradient(135deg, #e67e22, #d35400)';
        pu80Btn.style.marginLeft = '5px';
        pu80Btn.innerHTML = '<i class="fas fa-wrench"></i> PU-80';
        controls.appendChild(pu80Btn);
    }
    const hasPU80 = !isXodimlarSection && (isProduction || currentUser.role === 'admin' || (currentUser.role === 'department' && currentUser.departments?.includes('ishlab-chiqarish')));
    pu80Btn.style.display = hasPU80 ? 'inline-flex' : 'none';
    pu80Btn.onclick = () => window.openPU80Window ? window.openPU80Window(departmentId) : SmartUtils.showToast("PU-80 yuklanmagan!", "error");

    // 4. Kirim
    let incomingBtn = win.querySelector('.incoming-btn');
    if (!incomingBtn) {
        incomingBtn = document.createElement('button');
        incomingBtn.className = 'control-btn incoming-btn';
        incomingBtn.style.background = 'linear-gradient(135deg, #1e40af, #3b82f6)';
        incomingBtn.style.color = 'white';
        incomingBtn.style.marginLeft = '10px';
        incomingBtn.innerHTML = '<i class="fas fa-truck-loading"></i> Kirim';
        controls.appendChild(incomingBtn);
    }
    const hasKirim = !isXodimlarSection && (isSubdivision || departmentId === 'bugalteriya' || departmentId === 'iqtisod');
    incomingBtn.style.display = hasKirim ? 'inline-flex' : 'none';
    incomingBtn.onclick = () => window.openIncomingWindow ? window.openIncomingWindow(departmentId) : SmartUtils.showToast("Kirim moduli yuklanmagan!", "error");

    // 5. Tabel (Timesheet)
    let timesheetBtn = win.querySelector('.timesheet-btn');
    if (!timesheetBtn) {
        timesheetBtn = document.createElement('button');
        timesheetBtn.className = 'control-btn timesheet-btn';
        timesheetBtn.style.background = 'linear-gradient(135deg, #7c3aed, #a855f7)';
        timesheetBtn.style.color = 'white';
        timesheetBtn.style.marginLeft = '10px';
        timesheetBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Tabel';
        controls.appendChild(timesheetBtn);
    }
    const hasTabel = isSubdivision || departmentId === 'xodimlar' || departmentId === 'ishlab-chiqarish';
    timesheetBtn.style.display = hasTabel ? 'inline-flex' : 'none';
    timesheetBtn.onclick = () => window.openTimesheet ? window.openTimesheet(departmentId) : showToast("Tabel moduli yuklanmagan!", 'warning');

    // 6. Murojaat
    let murojaatBtn = win.querySelector('.hr-murojaat-btn');
    if (isSubdivision || departmentId === 'xodimlar') {
        if (!murojaatBtn) {
            murojaatBtn = document.createElement('button');
            murojaatBtn.className = 'control-btn hr-murojaat-btn';
            murojaatBtn.style.background = 'linear-gradient(135deg, #d4af37, #b8860b)';
            murojaatBtn.style.marginLeft = '10px';
            murojaatBtn.innerHTML = '<i class="fas fa-file-signature"></i> Murojaat';
            controls.appendChild(murojaatBtn);
        }
        murojaatBtn.style.display = 'inline-flex';
        murojaatBtn.onclick = () => window.openHRMurojaatWindow ? window.openHRMurojaatWindow(departmentId) : showToast("Murojaat moduli yuklanmagan!", 'warning');
    }

    // 7. Texnik o'quv (faqat bo'linmalar va mexanika)
    let trainingBtn = win.querySelector('.training-btn');
    if (!isXodimlarSection && (isSubdivision || departmentId === 'mexanika')) {
        if (!trainingBtn) {
            trainingBtn = document.createElement('button');
            trainingBtn.className = 'control-btn training-btn';
            trainingBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            trainingBtn.style.marginLeft = '5px';
            trainingBtn.innerHTML = '<i class="fas fa-book-reader"></i> Texnik o\'quv';
            controls.appendChild(trainingBtn);
        }
        trainingBtn.onclick = () => {
            const subName = isSubdivision ? `${departmentId.replace('bolinma', '')}-bo'linma` : departmentId;
            if (window.openTechnicalTrainingWindow) window.openTechnicalTrainingWindow(subName);
            else showToast("Texnik o'quv moduli yuklanmagan!", 'warning');
        };
    }

    // 8. M-29 Dalolatnoma (faqat bo'linmalar uchun)
    if (isSubdivision && !isXodimlarSection) {
        let m29Btn = win.querySelector('.m29-btn');
        if (!m29Btn) {
            m29Btn = document.createElement('button');
            m29Btn.className = 'control-btn m29-btn';
            m29Btn.style.background = 'linear-gradient(135deg, #d4af37, #b8860b)';
            m29Btn.style.color = 'white';
            m29Btn.style.marginLeft = '10px';
            m29Btn.style.fontWeight = 'bold';
            m29Btn.innerHTML = '<i class="fas fa-file-signature"></i> M-29';
            controls.appendChild(m29Btn);
        }
        m29Btn.style.display = 'inline-flex';
        m29Btn.onclick = () => window.openMaterialsWindow ? window.openMaterialsWindow(departmentId) : showToast("M-29 moduli yuklanmagan!", 'warning');
    }

    // 9. Marketplace / Birja (Bugalteriya uchun)
    if (departmentId.includes('bugalteriya')) {
        let mpBtn = win.querySelector('.marketplace-btn');
        if (!mpBtn) {
            mpBtn = document.createElement('button');
            mpBtn.className = 'control-btn marketplace-btn';
            mpBtn.style.background = 'linear-gradient(135deg, #16a085, #1abc9c)';
            mpBtn.style.color = 'white';
            mpBtn.style.marginLeft = '5px';
            mpBtn.innerHTML = '<i class="fas fa-handshake"></i> Birja';
            controls.appendChild(mpBtn);
        }
        mpBtn.style.display = 'inline-flex';
        mpBtn.onclick = () => window.openMarketplaceWindow ? window.openMarketplaceWindow(departmentId) : showToast("Birja moduli yuklanmagan!", 'warning');
    }

    // --- GLOBAL FILE ACTIONS (EVENT DELEGATION) ---
    // Only set up once on the window object to avoid duplicate listeners
    if (!win._clickHandled) {
        win.addEventListener('click', function (e) {
            const vBtn = e.target.closest('.action-btn.view');
            if (vBtn) {
                const fileName = vBtn.closest('tr').cells[0].textContent;
                const file = uploadedFiles.find(f => f.name === fileName && f.department === departmentId);
                if (file) previewFile(file);
            }

            const eBtn = e.target.closest('.action-btn.edit');
            if (eBtn) {
                const fileName = eBtn.closest('tr').cells[0].textContent;
                const file = uploadedFiles.find(f => f.name === fileName && f.department === departmentId);
                if (file) editFile(file);
            }

            const dBtn = e.target.closest('.action-btn.delete');
            if (dBtn) {
                if (confirm('Haqiqatan ham bu faylni o\'chirmoqchimisiz?')) {
                    const row = dBtn.closest('tr');
                    const fileName = row.cells[0].textContent;
                    uploadedFiles = uploadedFiles.filter(f => !(f.name === fileName && f.department === departmentId));
                    saveDatabase();
                    row.remove();
                    alert('Fayl muvaffaqiyatli o\'chirildi!');
                }
            }

            const cBtn = e.target.closest('.action-btn.check');
            if (cBtn) {
                const row = cBtn.closest('tr');
                const statusCell = row.querySelector('.status-badge');
                if (cBtn.style.backgroundColor === 'rgb(46, 204, 113)') {
                    statusCell.textContent = 'Tasdiqlangan';
                    statusCell.className = 'status-badge status-approved';
                    cBtn.innerHTML = '<i class="fas fa-times"></i> Rad etish';
                    cBtn.style.backgroundColor = '#e74c3c';
                } else {
                    statusCell.textContent = 'Rad etilgan';
                    statusCell.className = 'status-badge status-rejected';
                    cBtn.innerHTML = '<i class="fas fa-check"></i> Tasdiqlash';
                    cBtn.style.backgroundColor = '#2ecc71';
                }
            }
        });
        win._clickHandled = true;
    }
}
// --- ARTIFICIAL STRUCTURES VIEWER (Sun'iy inshootlar) ---
window.openArtificialStructures = function (bolinmaId) {
    const structures = window.artificialStructuresData.filter(s => !bolinmaId || s.bolinma === bolinmaId || s.bolinma.includes(bolinmaId));

    let html = `
        <div class="structures-list" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #ffd700; margin: 0; font-family: 'Outfit', sans-serif;"><i class="fas fa-bridge"></i> Sun'iy Inshootlar</h2>
                <div style="background: rgba(37, 99, 235, 0.1); padding: 5px 15px; border-radius: 10px; color: #60a5fa; font-size: 0.8rem; font-weight: bold;">
                    Jami: ${structures.length} ta
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${structures.length === 0 ? '<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 40px;">Ushbu hududda sun\'iy inshootlar topilmadi.</div>' : ''}
                ${structures.map(s => `
                    <div class="structure-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 20px; transition: 0.3s; cursor: pointer; position: relative; overflow: hidden;" 
                         onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(212, 175, 55, 0.4)'" 
                         onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'; this.style.borderColor='rgba(255, 255, 255, 0.1)'">
                        
                        <div style="display: flex; gap: 20px; align-items: flex-start;">
                            <div style="width: 50px; height: 50px; background: rgba(37, 99, 235, 0.1); border-radius: 15px; display: flex; align-items: center; justify-content: center; color: #60a5fa; font-size: 1.4rem; border: 1px solid rgba(37, 99, 235, 0.2);">
                                <i class="fas ${s.type === 'bridge' ? 'fa-bridge' : (s.type === 'tunnel' ? 'fa-archway' : 'fa-water')}"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 800; color: white; margin-bottom: 6px; font-size: 1.05rem;">${escapeHtml(s.name)}</div>
                                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); display: flex; flex-direction: column; gap: 4px;">
                                    <span><i class="fas fa-location-dot" style="width: 15px; color: #ffd700;"></i> KM: <strong>${s.km}</strong></span>
                                    <span><i class="fas fa-ruler-horizontal" style="width: 15px; color: #60a5fa;"></i> Uzunligi: <strong>${s.length}</strong></span>
                                    <span><i class="fas fa-shield-halved" style="width: 15px; color: #10b981;"></i> Bo'linma: <strong>${s.bolinma}</strong></span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05);">
                                    <span style="font-size: 0.75rem; color: ${s.status === 'good' ? '#10b981' : (s.status === 'repair' ? '#ef4444' : '#f59e0b')}; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                                        <i class="fas fa-circle" style="font-size: 0.5rem; vertical-align: middle; margin-right: 6px;"></i>
                                        ${s.status === 'good' ? 'Xolati: SOZ' : (s.status === 'repair' ? 'Xolati: TA\'MIRDA' : 'Xolati: NAZORATDA')}
                                    </span>
                                    <button class="control-btn" style="padding: 5px 12px; font-size: 0.75rem; background: rgba(37, 99, 235, 0.2); border-color: rgba(37, 99, 235, 0.3);">PASPORT</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const modalId = 'structures-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'integration-window active';
    modal.style.zIndex = "10001";
    modal.style.display = "flex";
    modal.style.background = 'rgba(15, 23, 42, 0.95)';
    modal.style.backdropFilter = 'blur(25px)';

    modal.innerHTML = `
        <div class="window-header">
            <h2 style="color: #ffd700; font-family: 'Outfit', sans-serif;"><i class="fas fa-bridge"></i> Sun'iy Inshootlar Monitoringi</h2>
            <button class="close-window" onclick="document.getElementById('${modalId}').remove()">&times;</button>
        </div>
        <div class="integration-content" style="max-height: 85vh; overflow-y: auto; padding-bottom: 40px;">
            ${html}
        </div>
    `;

    document.body.appendChild(modal);
    if (document.getElementById('department-overlay')) document.getElementById('department-overlay').classList.add('active');
};

function uploadFile(file, departmentId, window) {
    const reader = new FileReader();
    const selectedFolder = window.querySelector('.folder-select').value || 'umumiy';

    reader.onload = function (e) {
        const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            content: e.target.result,
            department: departmentId,
            uploadDate: new Date().toISOString(),
            status: 'pending',
            uploader: currentUser.username,
            folder: selectedFolder
        };

        uploadedFiles.push(fileData);
        saveDatabase();
        alert(`"${file.name}" fayli muvaffaqiyatli yuklandi!`);
        updateFilesTable(window, departmentId);
    };

    const fileName = file.name.toLowerCase();
    if (file.type.includes('text') && !fileName.endsWith('.docx')) {
        reader.readAsText(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.docx') || fileName.endsWith('.pdf')) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsDataURL(file);
    }
}

// ...

function editFile(file) {
    currentEditingFile = file;
    const fileName = file.name.toLowerCase();


    // BROWSER MODE: Fallback to local editors
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        editExcelFile(file);
    } else if (file.type.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.docx')) {
        editTextFile(file);
    } else {
        alert('Ushbu turdagi faylni tahrirlab bo\'lmaydi');
    }
}

// Helper functions for file actions (ID based)
function downloadFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (!file) {
        alert('Fayl topilmadi!');
        return;
    }

    // Use the existing download logic (adapting from downloadCurrentFile)
    // We temporarily set currentEditingFile to this file so we can reuse logic, 
    // or better, just replicate logic locally to avoid side effects.

    let blob;
    let filename = file.name;
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        blob = new Blob([file.content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else if (file.type.includes('text') && !lowerName.endsWith('.docx')) {
        blob = new Blob([file.content], { type: 'text/plain' });
    } else {
        if (file.content instanceof ArrayBuffer) {
            blob = new Blob([file.content]);
        } else {
            blob = new Blob([file.content], { type: file.type });
        }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Optional: notify user
    // alert(`"${filename}" fayli yuklab olindi!`);
}

function viewFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) previewFile(file);
    else alert('Fayl topilmadi!');
}

function editFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) editFile(file);
    else alert('Fayl topilmadi!');
}

function approveFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) {
        if (confirm(`"${file.name}" faylini tasdiqlaysizmi?`)) {
            file.status = 'approved';

            // --- SINXRONIZATSIYA: Agar M-29 bo'lsa, ikkala nusxani ham yangilash ---
            if (file.virtualType === 'm29' && file.virtualDataId) {
                // Barcha bir xil virtualDataId li fayllarni topish (bo'linma + bugalteriya nusxalari)
                uploadedFiles.forEach(f => {
                    if (f.virtualType === 'm29' && f.virtualDataId == file.virtualDataId) {
                        f.status = 'approved';
                    }
                });

                // Find original act data
                const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
                const actIndex = allActs.findIndex(a => a.id == file.virtualDataId);

                if (actIndex !== -1) {
                    const act = allActs[actIndex];
                    // Ikki marta chiqim bo'lmasligi uchun tekshirish
                    if (act.status !== 'approved') {
                        let deductedCount = 0;
                        const items = act.items || [];

                        // Deduct materials
                        items.forEach(item => {
                            if (typeof window.deductMaterialStock === 'function') {
                                if (window.deductMaterialStock(item.name, item.qty)) {
                                    deductedCount++;
                                }
                            }
                        });

                        // Update Act Status
                        act.status = 'approved';
                        act.approvedDate = new Date().toISOString();
                        allActs[actIndex] = act;
                        localStorage.setItem('materialActs', JSON.stringify(allActs));

                        // Log Transaction
                        if (typeof window.logTransaction === 'function') {
                            window.logTransaction('M-29', {
                                id: act.id,
                                summary: `M-29 Tasdiqlandi: ${act.matSummary}`,
                                items: items
                            });
                        }

                        alert(`✅ Dalolatnoma tasdiqlandi! ${deductedCount} xil material ombordan chiqim qilindi.`);
                    } else {
                        alert("✅ Fayl tasdiqlandi! (Materiallar allaqachon chiqim qilingan)");
                    }
                } else {
                    alert("✅ Fayl tasdiqlandi!");
                }
            } else {
                alert("✅ Fayl tasdiqlandi!");
            }

            saveDatabase();

            // UI ni yangilash - barcha ochiq oynalarni refresh qilish
            document.querySelectorAll('.department-window.active').forEach(win => {
                const deptId = win.id.replace('-window', '');
                updateFilesTable(win, deptId);
            });
        }
    } else {
        alert('Fayl topilmadi!');
    }
}

function rejectFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) {
        const reason = prompt(`"${file.name}" faylini rad etish sababini kiriting:`);
        if (reason !== null) { // Cancel bosilmasa
            file.status = 'rejected';
            file.feedback = reason;

            // --- SINXRONIZATSIYA: M-29 bo'lsa ikkala nusxani ham yangilash ---
            if (file.virtualType === 'm29' && file.virtualDataId) {
                uploadedFiles.forEach(f => {
                    if (f.virtualType === 'm29' && f.virtualDataId == file.virtualDataId) {
                        f.status = 'rejected';
                        f.feedback = reason;
                    }
                });

                // materialActs dagi aktni ham yangilash
                const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
                const actIndex = allActs.findIndex(a => a.id == file.virtualDataId);
                if (actIndex !== -1) {
                    allActs[actIndex].status = 'rejected';
                    allActs[actIndex].rejectedDate = new Date().toISOString();
                    allActs[actIndex].rejectionReason = reason;
                    localStorage.setItem('materialActs', JSON.stringify(allActs));
                }
            }

            saveDatabase();

            // UI ni yangilash - barcha ochiq oynalarni refresh
            document.querySelectorAll('.department-window.active').forEach(win => {
                const deptId = win.id.replace('-window', '');
                updateFilesTable(win, deptId);
            });

            alert("❌ Fayl rad etildi!");
        }
    } else {
        alert('Fayl topilmadi!');
    }
}

function viewRejectionReason(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file && file.feedback) {
        alert(`Rad etish sababi:\n${file.feedback}`);
    } else {
        alert('Sabab ko\'rsatilmagan');
    }
}

function deleteFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) deleteFile(file);
    else alert('Fayl topilmadi!');
}

function updateFilesTable(window, departmentId) {
    const tableBody = window.querySelector('.files-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const departmentFiles = uploadedFiles.filter(f => f.department === departmentId);

    departmentFiles.forEach(file => {
        const sizeInKB = (file.size / 1024).toFixed(2);
        const fileType = file.name.split('.').pop().toUpperCase();
        const uploadDate = new Date(file.uploadDate).toLocaleDateString('uz-UZ');
        const isM29Virtual = file.isVirtual && file.virtualType === 'm29';

        // Status Badge Logic
        let statusHtml = '';
        let statusTitle = '';

        if (file.status === 'approved') {
            statusHtml = '<span class="status-badge status-approved"><i class="fas fa-check-circle"></i> Tasdiqlandi</span>';
        } else if (file.status === 'rejected') {
            statusTitle = file.feedback ? `Sabab: ${file.feedback}` : 'Sabab ko\'rsatilmagan';
            statusHtml = `<span class="status-badge status-rejected" onclick="viewRejectionReason('${file.id}')" title="Sababni ko'rish uchun bosing" style="cursor: pointer;"><i class="fas fa-times-circle"></i> Rad etildi <i class="fas fa-info-circle" style="font-size: 0.8em; margin-left: 5px;"></i></span>`;
        } else {
            statusHtml = '<span class="status-badge status-pending"><i class="fas fa-hourglass-half"></i> Kutilmoqda</span>';
        }

        // ===== ROL ASOSIDA RUXSATLAR =====
        const userRole = currentUser ? currentUser.role : 'guest';
        const isAdmin = userRole === 'admin';
        const isBolinma = userRole === 'bolinma';
        const isDepartment = userRole === 'department';
        const isOwner = currentUser && currentUser.username === file.uploader;

        // Action Buttons Logic
        let actionsHtml = '';

        if (isM29Virtual) {
            // M-29 virtual PDF — ko'rish va chop etish
            actionsHtml += `<button class="action-btn view" onclick="viewM29VirtualFile('${file.id}')" title="Ko'rish" style="background: #3498db;"><i class="fas fa-eye"></i></button>`;
            actionsHtml += `<button class="action-btn" onclick="printM29VirtualFile('${file.id}')" title="Chop etish" style="background: #8e44ad; color: white; margin-left: 5px;"><i class="fas fa-print"></i></button>`;

            // Bugalteriya tasdiqlash — M-29 uchun maxsus
            if ((isDepartment || isAdmin) && file.status === 'pending') {
                actionsHtml += `<button class="action-btn check" onclick="approveM29File('${file.id}')" title="Tasdiqlash va chiqim qilish" style="background-color: #27ae60; color: white; margin-left: 5px;"><i class="fas fa-check-double"></i> Tasdiqlash</button>`;
                actionsHtml += `<button class="action-btn reject" onclick="rejectM29File('${file.id}')" title="Rad etish" style="background-color: #e74c3c; color: white; margin-left: 5px;"><i class="fas fa-times"></i></button>`;
            }
        } else {
            // Oddiy fayllar
            actionsHtml += `<button class="action-btn view" onclick="downloadFileById('${file.id}')" title="Yuklab olish"><i class="fas fa-download"></i></button>`;

            if (isAdmin || (isBolinma && isOwner)) {
                actionsHtml += `<button class="action-btn edit" onclick="editFileById('${file.id}')" title="Tahrirlash" style="margin-left: 5px;"><i class="fas fa-edit"></i></button>`;
            }

            if (isDepartment || isAdmin) {
                const showApprove = !file.status || file.status === 'pending' || file.status === 'rejected';
                const showReject = !file.status || file.status === 'pending' || file.status === 'approved';

                if (showApprove) {
                    actionsHtml += `<button class="action-btn check" onclick="approveFileById('${file.id}')" title="Tasdiqlash" style="background-color: #2ecc71; color: white; margin-left: 5px;"><i class="fas fa-check"></i></button>`;
                }
                if (showReject) {
                    actionsHtml += `<button class="action-btn reject" onclick="rejectFileById('${file.id}')" title="Rad etish" style="background-color: #e74c3c; color: white; margin-left: 5px;"><i class="fas fa-times"></i></button>`;
                }
            }

            if (isAdmin || (isBolinma && isOwner)) {
                actionsHtml += `<button class="action-btn delete" onclick="deleteFileById('${file.id}')" title="O'chirish" style="background-color: #95a5a6; color: white; margin-left: 5px;"><i class="fas fa-trash"></i></button>`;
            }
        }

        // Fayl nomi formati
        let fileNameHtml = file.name;
        if (isM29Virtual) {
            fileNameHtml = `<span style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-file-pdf" style="color: #e74c3c; font-size: 1.2em;"></i>
                <span>${escapeHtml(file.name)}</span>
                <span style="background: ${file.status === 'approved' ? '#27ae60' : '#f39c12'}; padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: white;">${file.status === 'approved' ? 'TASDIQLANGAN' : 'M-29'}</span>
            </span>`;
        }

        const row = document.createElement('tr');
        if (isM29Virtual) {
            row.style.background = file.status === 'approved'
                ? 'rgba(39, 174, 96, 0.1)'
                : 'rgba(243, 156, 18, 0.1)';
        }
        row.innerHTML = `
                    <td>${fileNameHtml}</td>
                    <td>${sizeInKB} KB</td>
                    <td>${fileType}</td>
                    <td>${uploadDate}</td>
                    <td>${statusHtml}</td>
                    <td class="file-actions" style="display: flex; gap: 5px;">
                        ${actionsHtml}
                    </td>
                `;

        tableBody.appendChild(row);
    });
}

// ===== ARXIV / ARCHIVE MODAL LOGIC =====
window.openArchiveWindow = function (departmentId) {
    const archiveWin = document.getElementById('department-archive-window');
    if (!archiveWin) return;

    // Get department name
    const deptNameEl = document.getElementById('archive-dept-name');
    let dName = departmentId;
    if (typeof sectionsData !== 'undefined' && sectionsData) {
        for (const bolinma in sectionsData) {
            const match = sectionsData[bolinma].find(s => departmentId.endsWith('-section-' + s.id) || s.id == departmentId || departmentId === bolinma + '-section-' + s.id);
            if (match) {
                dName = match.name; break;
            }
        }
    }

    if (dName === departmentId && typeof functionalDepartments !== 'undefined') {
        const fDept = functionalDepartments.find(d => d.id === departmentId);
        if (fDept) dName = fDept.name;
    }
    if (deptNameEl) deptNameEl.textContent = dName;

    const departmentFiles = uploadedFiles.filter(f => f.department === departmentId);

    // Group files by year and month
    const archiveData = {};
    departmentFiles.forEach(file => {
        const d = new Date(file.uploadDate);
        const year = d.getFullYear();
        const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
        const month = monthNames[d.getMonth()];
        const monthKey = d.getMonth();

        if (!archiveData[year]) archiveData[year] = {};
        if (!archiveData[year][month]) archiveData[year][month] = { sort: monthKey, files: [] };
        archiveData[year][month].files.push(file);
    });

    const treeEl = document.getElementById('archive-tree');
    treeEl.innerHTML = '';

    if (Object.keys(archiveData).length === 0) {
        treeEl.innerHTML = `<div style="color: rgba(255,255,255,0.5); font-style: italic;">Arxiv bo'sh</div>`;
        updateArchiveFilesTable([]);
    } else {
        let firstMonthFiles = null;
        let firstMonthTitle = '';

        Object.keys(archiveData).sort((a, b) => b - a).forEach(year => {
            const yearObj = archiveData[year];

            const yearDiv = document.createElement('div');
            yearDiv.innerHTML = `<div style="cursor: pointer; padding: 8px; font-weight: bold; color: #fff; background: rgba(255,255,255,0.05); margin-bottom: 2px; border-radius: 5px;">
                                    <i class="fas fa-folder" style="color: var(--accent-gold); margin-right: 5px;"></i> ${year}
                                 </div>`;
            const monthsContainer = document.createElement('div');
            monthsContainer.style.paddingLeft = '15px';
            monthsContainer.style.marginBottom = '10px';

            Object.keys(yearObj).sort((a, b) => yearObj[b].sort - yearObj[a].sort).forEach(month => {
                const monthFiles = yearObj[month].files;
                if (!firstMonthFiles) {
                    firstMonthFiles = monthFiles;
                    firstMonthTitle = `${month} ${year}`;
                }

                const monthDiv = document.createElement('div');
                monthDiv.innerHTML = `<i class="far fa-folder-open" style="color: #3498db; margin-right: 5px;"></i> ${month} <span style="font-size: 0.8rem; opacity:0.5;">(${monthFiles.length})</span>`;
                monthDiv.style.cssText = 'cursor: pointer; padding: 6px 8px; color: rgba(255,255,255,0.8); margin-bottom: 2px; border-radius: 5px; transition: 0.2s;';

                monthDiv.onmouseover = () => monthDiv.style.background = 'rgba(255,255,255,0.1)';
                monthDiv.onmouseout = () => monthDiv.style.background = 'transparent';

                monthDiv.onclick = () => {
                    document.getElementById('archive-month-title').innerHTML = `<i class="fas fa-folder-open"></i> ${month} ${year}`;
                    updateArchiveFilesTable(monthFiles);
                };

                monthsContainer.appendChild(monthDiv);
            });

            yearDiv.appendChild(monthsContainer);
            treeEl.appendChild(yearDiv);
        });

        if (firstMonthFiles) {
            document.getElementById('archive-month-title').innerHTML = `<i class="fas fa-folder-open"></i> ${firstMonthTitle}`;
            updateArchiveFilesTable(firstMonthFiles);
        }
    }

    archiveWin.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');
};

function updateArchiveFilesTable(files) {
    const tableBody = document.getElementById('archive-files-tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    files.forEach(file => {
        const sizeInKB = (file.size / 1024).toFixed(2);
        const fileType = file.name.split('.').pop().toUpperCase();
        const uploadDate = new Date(file.uploadDate).toLocaleDateString('uz-UZ');

        let statusHtml = file.status === 'approved'
            ? '<span class="status-badge status-approved">Tasdiqlandi</span>'
            : (file.status === 'rejected' ? '<span class="status-badge status-rejected">Rad etildi</span>' : '<span class="status-badge status-pending">Kutilmoqda</span>');

        let actionsHtml = `<button class="action-btn view" onclick="downloadFileById('${file.id}')" title="Yuklab olish"><i class="fas fa-download"></i></button>`;

        const isM29Virtual = file.isVirtual && file.virtualType === 'm29';
        if (isM29Virtual) {
            actionsHtml = `<button class="action-btn view" onclick="viewM29VirtualFile('${file.id}')" title="Ko'rish" style="background: #3498db;"><i class="fas fa-eye"></i></button>
                           <button class="action-btn" onclick="printM29VirtualFile('${file.id}')" title="Chop etish" style="background: #8e44ad; color: white; margin-left: 5px;"><i class="fas fa-print"></i></button>`;
        }

        const fileNameHtml = isM29Virtual ? `<i class="fas fa-file-pdf" style="color:#e74c3c;"></i> ${escapeHtml(file.name)}` : file.name;
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${fileNameHtml}</td>
                    <td>${sizeInKB} KB</td>
                    <td>${uploadDate}</td>
                    <td>${statusHtml}</td>
                    <td class="file-actions" style="display: flex; gap: 5px;">${actionsHtml}</td>
                `;
        tableBody.appendChild(row);
    });
}

// ===== M-29 Virtual File Actions =====
function viewM29VirtualFile(fileId) {
    const file = uploadedFiles.find(f => f.id == fileId);
    if (!file || !file.actData) {
        alert("M-29 ma'lumotlari topilmadi!");
        return;
    }
    if (typeof printDocumentAct === 'function') {
        printDocumentAct(file.actData);
    }
}

function printM29VirtualFile(fileId) {
    viewM29VirtualFile(fileId); // Same as view - opens print window
}

function approveM29File(fileId) {
    const file = uploadedFiles.find(f => f.id == fileId);
    if (!file) return;

    if (!confirm("M-29 dalolatnomani tasdiqlaysizmi?\nOmbordan materiallar chiqim qilinadi.")) return;

    // Use accounting.js approveAct function
    if (file.actData && typeof approveAct === 'function') {
        approveAct(file.actData.id);
    } else {
        // Manual approval
        file.status = 'approved';
        file.approvedDate = new Date().toISOString();

        // Deduct materials
        if (file.actData && file.actData.items && typeof deductMaterialStock === 'function') {
            file.actData.items.forEach(item => {
                deductMaterialStock(item.name, item.qty);
            });
        }

        saveDatabase();

        // Find bugalteriya window and refresh
        const bugWin = document.getElementById(file.department + '-window');
        if (bugWin) updateFilesTable(bugWin, file.department);

        alert("M-29 tasdiqlandi va materiallar chiqim qilindi!");
    }
}

function rejectM29File(fileId) {
    const file = uploadedFiles.find(f => f.id == fileId);
    if (!file) return;

    const reason = prompt("Rad etish sababini kiriting:");
    if (reason === null) return;

    file.status = 'rejected';
    file.feedback = reason;
    file.rejectedDate = new Date().toISOString();

    // Also update in materialActs localStorage
    if (file.actData) {
        const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
        const actIdx = allActs.findIndex(a => a.id == file.actData.id);
        if (actIdx !== -1) {
            allActs[actIdx].status = 'rejected';
            allActs[actIdx].feedback = reason;
            localStorage.setItem('materialActs', JSON.stringify(allActs));
        }
    }

    saveDatabase();

    const bugWin = document.getElementById(file.department + '-window');
    if (bugWin) updateFilesTable(bugWin, file.department);

    alert("M-29 rad etildi.");
}

window.viewM29VirtualFile = viewM29VirtualFile;
window.printM29VirtualFile = printM29VirtualFile;
window.approveM29File = approveM29File;
window.rejectM29File = rejectM29File;


function updateSmartMonitoring(section, departmentId) {
    if (!section) return;

    // Load data from storage or generate default randoms if first time
    let data = monitoringData[departmentId];

    if (!data) {
        // Initialize default random data for this department if not exists
        data = {
            temp: Math.floor(Math.random() * (55 - 20) + 20),
            defects: Math.floor(Math.random() * 4),
            wearV: 0.0,
            wearH: 0.0,
            bruto: 12.5
        };
        monitoringData[departmentId] = data;
        saveDatabase(); // Save immediately so it persists
    }

    // Update UI
    const tempEl = section.querySelector('#rail-temp-value');
    const fillEl = section.querySelector('.gauge-fill');
    const statusEl = section.querySelector('.temperature-card .status-text');

    if (tempEl) tempEl.textContent = `+${data.temp}°C`;
    if (fillEl) fillEl.style.width = `${((data.temp - 20) / (60 - 20)) * 100}%`;

    if (statusEl) {
        if (data.temp > 50) {
            statusEl.textContent = "Xavfli harorat";
            statusEl.className = "status-text danger";
        } else if (data.temp > 40) {
            statusEl.textContent = "Yuqori harorat";
            statusEl.className = "status-text warning";
        } else {
            statusEl.textContent = "Normal";
            statusEl.className = "status-text success";
        }
    }

    // Defects
    const defectCountEl = section.querySelector('.defect-stat strong');
    const defectStatusEl = section.querySelector('.defect-card .status-text');

    if (defectCountEl) defectCountEl.textContent = data.defects;
    if (defectStatusEl) {
        if (data.defects > 0) {
            defectStatusEl.textContent = `${data.defects} ta nuqson`;
            defectStatusEl.className = "status-text danger";
        } else {
            defectStatusEl.textContent = "Nuqsonlar yo'q";
            defectStatusEl.className = "status-text success";
        }
    }

    // Wear
    const wearVEl = section.querySelector('.wear-item:nth-child(1) .wear-val');
    const wearHEl = section.querySelector('.wear-item:nth-child(2) .wear-val');
    const wearVBar = section.querySelector('.wear-item:nth-child(1) .progress-bar-fill');
    const wearHBar = section.querySelector('.wear-item:nth-child(2) .progress-bar-fill');

    if (wearVEl) wearVEl.textContent = `${data.wearV}mm`;
    if (wearHEl) wearHEl.textContent = `${data.wearH}mm`;
    if (wearVBar) wearVBar.style.width = `${(data.wearV / 5) * 100}%`;
    if (wearHBar) wearHBar.style.width = `${(data.wearH / 5) * 100}%`;
}

function openSmartMonitoringEdit(deptId) {
    try {
        const modal = document.getElementById('monitoring-edit-modal');

        if (!modal) {
            console.error('CRITICAL ERROR: Modal element #monitoring-edit-modal NOT FOUND in DOM!');
            return;
        }

        let data = monitoringData[deptId];

        // Auto-initialize if missing
        if (!data) {
            data = {
                temp: Math.floor(Math.random() * (55 - 20) + 20),
                defects: 0,
                wearV: 0.0,
                wearH: 0.0,
                bruto: 12.5
            };
            monitoringData[deptId] = data;
        }

        document.getElementById('edit-dept-id').value = deptId;
        document.getElementById('edit-rail-temp').value = data.temp;
        document.getElementById('edit-defect-count').value = data.defects;
        document.getElementById('edit-wear-v').value = data.wearV;
        document.getElementById('edit-wear-h').value = data.wearH;
        if (document.getElementById('edit-bruto')) {
            document.getElementById('edit-bruto').value = data.bruto || 0;
        }

        modal.classList.add('active');
        modal.style.display = 'flex'; // FORCE VISIBILITY
        modal.style.zIndex = '99999'; // FORCE ON TOP

    } catch (error) {
        console.error('Error inside openSmartMonitoringEdit: ' + error.message);
    }
}

function closeSmartMonitoringEdit() {
    document.getElementById('monitoring-edit-modal').classList.remove('active');
}

function saveSmartMonitoringData(e) {
    e.preventDefault();
    const deptId = document.getElementById('edit-dept-id').value;

    const newData = {
        temp: parseInt(document.getElementById('edit-rail-temp').value),
        defects: parseInt(document.getElementById('edit-defect-count').value),
        wearV: parseFloat(parseFloat(document.getElementById('edit-wear-v').value).toFixed(1)),
        wearH: parseFloat(parseFloat(document.getElementById('edit-wear-h').value).toFixed(1)),
        bruto: document.getElementById('edit-bruto') ? parseFloat(document.getElementById('edit-bruto').value) : 0
    };

    monitoringData[deptId] = newData;
    saveDatabase();

    // Refresh current UI
    const activeSection = document.getElementById(deptId);
    if (activeSection) {
        const smSection = activeSection.querySelector('.smart-monitoring-section');
        if (smSection) updateSmartMonitoring(smSection, deptId);
    }

    closeSmartMonitoringEdit();
    // alert('Ma\'lumotlar saqlandi!');
}

// Expose functions to global scope for HTML inline events
window.openSmartMonitoringEdit = openSmartMonitoringEdit;
window.closeSmartMonitoringEdit = closeSmartMonitoringEdit;
window.saveSmartMonitoringData = saveSmartMonitoringData;

function updateFolderContents(window, departmentId, folderName) {
    const folderContents = window.querySelector('.folder-contents');
    folderContents.innerHTML = '';

    const folderFiles = uploadedFiles.filter(f => f.department === departmentId && f.folder === folderName);

    if (folderFiles.length === 0) {
        folderContents.innerHTML = '<div class="folder-item">Bu papka bo\'sh</div>';
    } else {
        folderFiles.forEach(file => {
            const folderItem = document.createElement('div');
            folderItem.className = 'folder-item';
            folderItem.setAttribute('data-file', file.name);

            let fileIcon = 'fas fa-file';
            if (file.name.endsWith('.docx')) fileIcon = 'fas fa-file-word';
            else if (file.name.endsWith('.xlsx')) fileIcon = 'fas fa-file-excel';
            else if (file.name.endsWith('.pdf')) fileIcon = 'fas fa-file-pdf';

            folderItem.innerHTML = `
                        <i class="${fileIcon}"></i>
                        <span>${escapeHtml(file.name)}</span>
                    `;

            folderContents.appendChild(folderItem);
        });
    }
}

function openIntegrationWindow(integrationType, departmentId) {
    let integrationWindow;

    if (integrationType === 'obs' || integrationType === 'kmo') {
        integrationWindow = document.getElementById('obs-integration-window');
    } else if (integrationType === 'exodim') {
        integrationWindow = document.getElementById('exodim-integration-window');
    } else if (integrationType === 'mexanika-monitor') {
        integrationWindow = document.getElementById('mexanika-monitor-window');
        updateMexanikaMonitor(departmentId);
    }

    if (integrationWindow) {
        integrationWindow.classList.add('active');
        document.getElementById('department-overlay').classList.add('active');
    }
}

// Mexanika ma'lumotlarini dinamik yangilash
function updateMexanikaMonitor(departmentId) {
    const window = document.getElementById('mexanika-monitor-window');
    if (!window) return;

    // Departman ID sini saqlash
    window.setAttribute('data-dept-id', departmentId);

    // Departman nomini olish
    let deptName = departmentId;
    if (departmentId.includes('bolinma')) {
        const parts = departmentId.split('-');
        const bNum = parts[0].replace('bolinma', '');
        deptName = `${bNum}-bo'linma Mexanikasi`;
    } else {
        const dept = functionalDepartments.find(d => d.id === departmentId);
        deptName = dept ? dept.name : "Mexanika bo'limi";
    }

    window.querySelector('h2').innerHTML = `<i class="fas fa-cog"></i> ${deptName} Monitoringi`;

    // Ma'lumotlarni localStorage'dan olish yoki standart yaratish
    const seed = departmentId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    let technics = JSON.parse(localStorage.getItem('mex_technics_' + departmentId));
    if (!technics) {
        technics = [
            { name: 'Ekskavator Komatsu', ref: 'EX-' + (200 + (seed % 100)), status: seed % 3 === 0 ? 'Ta\'mir' : 'Faol', fuel: 70 + (seed % 30), insurance: '2024-12-' + (10 + (seed % 15)), inspection: '2024-06-' + (5 + (seed % 20)) },
            { name: 'Buldozer CAT', ref: 'BD-' + (100 + (seed % 50)), status: 'Faol', fuel: 40 + (seed % 50), insurance: '2025-01-' + (15 + (seed % 10)), inspection: '2024-07-' + (10 + (seed % 15)) },
            { name: 'Avtokran XCMG', ref: 'CR-' + (300 + (seed % 80)), status: seed % 4 === 0 ? 'Zaxira' : 'Faol', fuel: 90 - (seed % 20), insurance: '2024-11-' + (20 + (seed % 10)), inspection: '2024-05-' + (12 + (seed % 18)) },
            { name: 'Samosval HOWO', ref: 'TR-' + (500 + (seed % 120)), status: 'Faol', fuel: 65 + (seed % 25), insurance: '2024-10-' + ('0' + (1 + (seed % 9))).slice(-2), inspection: '2024-08-' + (22 + (seed % 8)) }
        ];
        localStorage.setItem('mex_technics_' + departmentId, JSON.stringify(technics));
    }

    // Texnika jadvalini to'ldirish (sug'urta va ko'rik bilan)
    const panel = window.querySelector('#mex-monitor');
    const tableContainer = panel.querySelector('.content-card');

    tableContainer.innerHTML = `
                                    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
                                        <button onclick="openAddTechnicModal()" style="background: #3498db; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                            <i class="fas fa-plus"></i> Texnika qo'shish
                                        </button>
                                    </div>
                                    <table style="width: 100%; border-collapse: collapse; color: white;">
                                        <thead>
                                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                                <th style="padding: 10px; text-align: left;">Texnika nomi</th>
                                                <th style="padding: 10px; text-align: left;">Raqami</th>
                                                <th style="padding: 10px; text-align: left;">Holati</th>
                                                <th style="padding: 10px; text-align: left;">Yoqilg'i</th>
                                                <th style="padding: 10px; text-align: left;">Sug'urta</th>
                                                <th style="padding: 10px; text-align: left;">Ko'rik</th>
                                                <th style="padding: 10px; text-align: center;">Amallar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${technics.map((t, index) => `
                                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                                    <td style="padding: 10px;">${escapeHtml(t.name)}</td>
                                                    <td style="padding: 10px;">${t.ref}</td>
                                                    <td style="padding: 10px;"><span class="status-badge" style="background: ${t.status === 'Faol' ? '#2ecc71' : (t.status === 'Ta\'mir' ? '#e67e22' : '#3498db')}">${t.status}</span></td>
                                                    <td style="padding: 10px;">${t.fuel}%</td>
                                                    <td style="padding: 10px; font-size: 0.85rem; color: ${new Date(t.insurance) < new Date() ? '#e74c3c' : '#bdc3c7'}">${t.insurance}</td>
                                                    <td style="padding: 10px; font-size: 0.85rem;">${t.inspection}</td>
                                                    <td style="padding: 10px; text-align: center; display: flex; justify-content: center; gap: 5px;">
                                                        <button onclick="editTechnic(${index}, '${departmentId}')" style="background: none; border: none; color: #3498db; cursor: pointer; padding: 5px;" title="Tahrirlash">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button onclick="deleteTechnic(${index})" style="background: none; border: none; color: #e74c3c; cursor: pointer; padding: 5px;" title="O'chirish">
                                                            <i class="fas fa-trash-alt"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                `;

    // Statistika kartalarini yangilash
    const activeCount = technics.filter(t => t.status === 'Faol').length;
    const repairCount = technics.filter(t => t.status === 'Ta\'mir').length;
    const reserveCount = technics.filter(t => t.status === 'Zaxira').length;

    const statCards = window.querySelectorAll('.stat-number');
    if (statCards.length >= 3) {
        statCards[0].textContent = activeCount;
        statCards[1].textContent = repairCount;
        statCards[2].textContent = reserveCount;
    }

    // RTX Jadvalini yangilash
    const maintenanceList = window.querySelector('#mex-maintenance ul');
    maintenanceList.innerHTML = technics.slice(0, 3).map(t => `
                                    <li style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between;">
                                        <span>${escapeHtml(t.name)} ${t.ref} (${(technics.indexOf(t) + seed) % 2 === 0 ? 'Moy almashtirish' : 'Profilaktika'})</span>
                                        <span style="color: #ffd700;">${new Date(t.inspection).toLocaleDateString()}</span>
                                    </li>
                                `).join('');
    if (technics.length === 0) maintenanceList.innerHTML = '<li style="padding: 10px; text-align: center; color: rgba(255,255,255,0.5);">Ma\'lumot yo\'q</li>';
}

// Texnika qo'shish modalini ochish
function openAddTechnicModal() {
    const deptId = document.getElementById('mexanika-monitor-window').getAttribute('data-dept-id');
    const modal = document.createElement('div');
    modal.id = 'add-technic-modal';
    modal.className = 'active';
    modal.style = `
                                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                                    background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center;
                                    z-index: 10000; backdrop-filter: blur(5px);
                                `;
    modal.innerHTML = `
                                    <div style="background: rgba(30, 39, 46, 0.95); width: 400px; padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: white;">
                                        <h3 style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;"><i class="fas fa-plus"></i> Yangi texnika qo'shish</h3>
                                        <div style="display: flex; flex-direction: column; gap: 15px;">
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Nomi:</label>
                                                <input type="text" id="t-name" placeholder="Masalan: Ekskavator Komatsu" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Raqami:</label>
                                                <input type="text" id="t-ref" placeholder="Masalan: EX-204" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Holati:</label>
                                                <select id="t-status" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                    <option value="Faol">Faol</option>
                                                    <option value="Ta'mir">Ta'mirlashda</option>
                                                    <option value="Zaxira">Zaxirada</option>
                                                </select>
                                            </div>
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                                <div>
                                                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Sug'urta muddati:</label>
                                                    <input type="date" id="t-insurance" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                </div>
                                                <div>
                                                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Keyingi ko'rik:</label>
                                                    <input type="date" id="t-inspection" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                </div>
                                            </div>
                                            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                                                <button onclick="document.getElementById('add-technic-modal').remove()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Bekor qilish</button>
                                                <button onclick="saveNewTechnic('${deptId}')" style="background: #2ecc71; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer;">Saqlash</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
    document.body.appendChild(modal);
}

// Yangi texnikani saqlash
function saveNewTechnic(deptId) {
    const name = document.getElementById('t-name').value;
    const ref = document.getElementById('t-ref').value;
    const status = document.getElementById('t-status').value;
    const insurance = document.getElementById('t-insurance').value;
    const inspection = document.getElementById('t-inspection').value;

    if (!name || !ref) {
        showNotification('Nomi va raqami majburiy!', 'error');
        return;
    }

    const technics = JSON.parse(localStorage.getItem('mex_technics_' + deptId)) || [];
    technics.push({
        name,
        ref,
        status,
        fuel: Math.floor(Math.random() * 100),
        insurance: insurance || 'Noma\'lum',
        inspection: inspection || 'Noma\'lum'
    });

    localStorage.setItem('mex_technics_' + deptId, JSON.stringify(technics));
    document.getElementById('add-technic-modal').remove();
    updateMexanikaMonitor(deptId);
    showNotification('Yangi texnika qo\'shildi', 'success');
}

// Texnikani o'chirish
function deleteTechnic(index) {
    const deptId = document.getElementById('mexanika-monitor-window').getAttribute('data-dept-id');
    if (confirm('Haqiqatan ham o\'chirmoqchimisiz?')) {
        const technics = JSON.parse(localStorage.getItem('mex_technics_' + deptId)) || [];
        technics.splice(index, 1);
        localStorage.setItem('mex_technics_' + deptId, JSON.stringify(technics));
        updateMexanikaMonitor(deptId);
        showNotification('Texnika o\'chirildi', 'info');
    }
}

// Texnikani tahrirlash
function editTechnic(index, deptId) {
    const technics = JSON.parse(localStorage.getItem('mex_technics_' + deptId)) || [];
    const t = technics[index];
    if (!t) return;

    const modal = document.createElement('div');
    modal.id = 'edit-technic-modal';
    modal.className = 'active';
    modal.style = `
                                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                                    background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center;
                                    z-index: 10000; backdrop-filter: blur(5px);
                                `;
    modal.innerHTML = `
                                    <div style="background: rgba(30, 39, 46, 0.95); width: 400px; padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: white;">
                                        <h3 style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;"><i class="fas fa-edit"></i> Texnikani tahrirlash</h3>
                                        <div style="display: flex; flex-direction: column; gap: 15px;">
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Nomi:</label>
                                                <input type="text" id="edit-t-name" value="${escapeHtml(t.name)}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Raqami:</label>
                                                <input type="text" id="edit-t-ref" value="${t.ref}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Holati:</label>
                                                <select id="edit-t-status" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                    <option value="Faol" ${t.status === 'Faol' ? 'selected' : ''}>Faol</option>
                                                    <option value="Ta'mir" ${t.status === 'Ta\'mir' ? 'selected' : ''}>Ta'mirlashda</option>
                                                    <option value="Zaxira" ${t.status === 'Zaxira' ? 'selected' : ''}>Zaxirada</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Yoqilg'i (%):</label>
                                                <input type="number" id="edit-t-fuel" value="${t.fuel}" min="0" max="100" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                                <div>
                                                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Sug'urta muddati:</label>
                                                    <input type="date" id="edit-t-insurance" value="${t.insurance}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                </div>
                                                <div>
                                                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Keyingi ko'rik:</label>
                                                    <input type="date" id="edit-t-inspection" value="${t.inspection}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                </div>
                                            </div>
                                            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                                                <button onclick="document.getElementById('edit-technic-modal').remove()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Bekor qilish</button>
                                                <button onclick="saveEditedTechnic(${index}, '${deptId}')" style="background: #3498db; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer;">Saqlash</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
    document.body.appendChild(modal);
}

// Tahrirlangan texnikani saqlash
function saveEditedTechnic(index, deptId) {
    const name = document.getElementById('edit-t-name').value;
    const ref = document.getElementById('edit-t-ref').value;
    const status = document.getElementById('edit-t-status').value;
    const fuel = document.getElementById('edit-t-fuel').value;
    const insurance = document.getElementById('edit-t-insurance').value;
    const inspection = document.getElementById('edit-t-inspection').value;

    if (!name || !ref) {
        showNotification('Nomi va raqami majburiy!', 'error');
        return;
    }

    const technics = JSON.parse(localStorage.getItem('mex_technics_' + deptId)) || [];
    technics[index] = {
        name,
        ref,
        status,
        fuel: parseInt(fuel) || 0,
        insurance: insurance || 'Noma\'lum',
        inspection: inspection || 'Noma\'lum'
    };

    localStorage.setItem('mex_technics_' + deptId, JSON.stringify(technics));
    document.getElementById('edit-technic-modal').remove();
    updateMexanikaMonitor(deptId);
    showNotification('Texnika ma\'lumotlari yangilandi', 'success');
}

let quillEditor = null; // Global Quill instance

// Word Ribbon Actions
window.execQuill = function (command, value = null) {
    if (!quillEditor) return;
    if (command === 'align') {
        quillEditor.format('align', value);
    } else {
        const currentFormat = quillEditor.getFormat();
        quillEditor.format(command, !currentFormat[command]);
    }
};

function previewFile(file) {
    // M-29 Virtual File (Custom Viewer)
    if (file.isVirtual && file.virtualType === 'm29') {
        if (typeof viewMaterialAct === 'function') {
            viewMaterialAct(file.virtualDataId, file.department);
        } else {
            console.error("viewMaterialAct function is missing");
            alert("M-29 dalolatnomasini ochishda xatolik yuz berdi. Sahifani yangilab qayta urinib ko'ring.");
        }
        return;
    }

    currentEditingFile = file;
    const previewWindow = document.getElementById('file-preview-window');
    const previewContent = document.getElementById('filePreview');
    const fileName = file.name.toLowerCase();

    previewContent.innerHTML = '';

    if ((file.type.includes('text') || fileName.endsWith('.txt')) && !fileName.endsWith('.docx')) {
        // Matn fayllari
        const textContent = document.createElement('div');
        textContent.className = 'word-preview';
        textContent.innerHTML = `<pre>${escapeHtml(file.content)}</pre>`;
        previewContent.appendChild(textContent);
    } else if (fileName.endsWith('.docx')) {
        // Word fayllari (Mammoth orqali)
        if (file.content) {
            mammoth.convertToHtml({ arrayBuffer: file.content })
                .then(result => {
                    previewContent.innerHTML = `<div class="word-preview" style="background:white; color:black; padding:20px;">${result.value}</div>`;
                })
                .catch(err => {
                    previewContent.innerHTML = `<p>Xatolik: ${escapeHtml(err.message)}</p>`;
                });
        }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Excel fayllari
        try {
            const data = new Uint8Array(file.content);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const html = XLSX.utils.sheet_to_html(firstSheet);
            previewContent.innerHTML = `<div style="background:white; color:black; overflow:auto;">${html}</div>`;
        } catch (e) {
            previewContent.innerHTML = `<p>Excel faylni ko'rsatib bo'lmadi: ${escapeHtml(e.message)}</p>`;
        }
    } else if (fileName.endsWith('.pdf')) {
        // PDF fayllari
        const blob = new Blob([file.content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        previewContent.innerHTML = `<iframe src="${url}" width="100%" height="500px" style="border:none;"></iframe>`;
    } else {
        previewContent.innerHTML = `<p>Ushbu fayl turi ko'rsatilmaydi. Yuklab olish uchun "Yuklab olish" tugmasini bosing.</p>`;
    }

    previewWindow.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');
}

function editFile(file) {
    currentEditingFile = file;
    const fileName = file.name.toLowerCase();


    // BROWSER MODE: Fallback to local editors
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        editExcelFile(file);
    } else if (file.type.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.docx')) {
        editTextFile(file);
    } else {
        alert('Ushbu turdagi faylni tahrirlab bo\'lmaydi');
    }
}

// ============ CUSTOM "OFFLINE" WORD EDITOR ============
function editTextFile(file) {
    const editorWindow = document.getElementById('text-editor-window');

    // Find the wrapper for the editor area
    let wrapper = document.getElementById('docsEditor');
    if (!wrapper) {
        // Create it if missing logic
        wrapper = document.createElement('div');
        wrapper.id = 'docsEditor';
        document.querySelector('#text-editor-window .editor-body').appendChild(wrapper);
    }

    // Reset wrapper styles to be simple
    wrapper.innerHTML = "";
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.height = '60vh';
    wrapper.style.border = '1px solid #444';
    wrapper.style.background = 'white';
    wrapper.style.color = 'black';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.style.padding = '10px';
    toolbar.style.background = '#f1f1f1';
    toolbar.style.borderBottom = '1px solid #ccc';
    toolbar.innerHTML = `
        <button onmousedown="event.preventDefault(); document.execCommand('bold', false, null)" style="font-weight:bold">B</button>
        <button onmousedown="event.preventDefault(); document.execCommand('italic', false, null)" style="font-style:italic">I</button>
        <button onmousedown="event.preventDefault(); document.execCommand('underline', false, null)" style="text-decoration:underline">U</button>
        <span style="border-left:1px solid #ccc; margin:0 5px;"></span>
        <button onmousedown="event.preventDefault(); document.execCommand('justifyLeft', false, null)">Left</button>
        <button onmousedown="event.preventDefault(); document.execCommand('justifyCenter', false, null)">Center</button>
        <button onmousedown="event.preventDefault(); document.execCommand('justifyRight', false, null)">Right</button>
        <span style="border-left:1px solid #ccc; margin:0 5px;"></span>
        <button onmousedown="event.preventDefault(); document.execCommand('insertUnorderedList', false, null)">List</button>
    `;

    // Editable Content
    const contentArea = document.createElement('div');
    contentArea.id = 'simple-content-area';
    contentArea.contentEditable = true;
    contentArea.style.flex = '1';
    contentArea.style.padding = '20px';
    contentArea.style.overflowY = 'auto';
    contentArea.style.outline = 'none';

    // Load Content
    // Try Mammoth if available, else plain text
    try {
        if (typeof mammoth !== 'undefined' && file.name.endsWith('.docx') && file.content) {
            mammoth.convertToHtml({ arrayBuffer: file.content })
                .then(res => contentArea.innerHTML = res.value)
                .catch(e => contentArea.innerText = "DOCX o'qib bo'lmadi, matn kiritishingiz mumkin.");
        } else {
            // Plain text
            contentArea.innerText = typeof file.content === 'string' ? file.content : "";
        }
    } catch (e) {
        contentArea.innerText = typeof file.content === 'string' ? file.content : "";
    }

    wrapper.appendChild(toolbar);
    wrapper.appendChild(contentArea);

    editorWindow.classList.add('active');
    editorWindow.style.display = 'block';
    document.getElementById('department-overlay').classList.add('active');

    // Remove old listeners to prevent duplication? 
    // Usually okay since we replace onclick
    document.getElementById('saveTextFileBtn').onclick = saveTextFile;
    document.getElementById('closeTextEditorBtn').onclick = closeTextEditor;
    document.getElementById('cancelTextEditBtn').onclick = closeTextEditor;
}

function closeTextEditor() {
    const editorWindow = document.getElementById('text-editor-window');
    editorWindow.classList.remove('active');
    editorWindow.style.display = 'none';
    document.getElementById('department-overlay').classList.remove('active');
}

// ============ CUSTOM "OFFLINE" EXCEL EDITOR ============
function editExcelFile(file) {
    const editorWindow = document.getElementById('excel-editor-window');
    const container = document.getElementById('x-spreadsheet-demo');

    // Clear and prepare container
    container.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="padding: 5px; background: #eee; border-bottom: 1px solid #ccc;">
                <button onclick="document.execCommand('bold')"><b>B</b></button>
                <button onclick="document.execCommand('italic')"><i>I</i></button>
                <span style="margin-left: 10px; font-size: 12px; color: #666;">Oddiy Jadval Rejimi (Internet talab qilinmaydi)</span>
            </div>
            <div style="flex: 1; overflow: auto;">
                <table id="simple-excel-table" border="1" style="border-collapse: collapse; width: 100%; min-width: 800px;">
                    <!-- Table content will be generated here -->
                </table>
            </div>
        </div>
    `;

    // Generate Table
    const table = document.getElementById('simple-excel-table');
    let html = '';

    // Headers (A, B, C...)
    html += '<thead><tr><th style="background:#f0f0f0; width: 40px;">#</th>';
    for (let c = 0; c < 10; c++) {
        html += `<th style="background:#f0f0f0; min-width: 100px;">${String.fromCharCode(65 + c)}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Rows
    // Try to load data if XLSX library works, otherwise empty
    let existingData = [];
    try {
        if (file.content && typeof XLSX !== 'undefined') {
            const data = new Uint8Array(file.content);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            existingData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        }
    } catch (e) { console.error("XLSX parse error", e); }

    for (let r = 0; r < 50; r++) { // 50 rows default
        html += `<tr><td style="background:#f0f0f0; text-align: center;">${r + 1}</td>`;
        for (let c = 0; c < 10; c++) {
            let val = "";
            if (existingData[r] && existingData[r][c]) val = existingData[r][c];
            html += `<td contenteditable="true" style="padding: 5px; border: 1px solid #ccc;">${val}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;

    editorWindow.style.display = 'block';
    editorWindow.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');

    // Button Listeners
    const saveBtn = document.getElementById('saveExcelBtn');
    saveBtn.onclick = () => saveExcelContent(file.id);

    document.getElementById('closeExcelEditorBtn').onclick = closeExcelEditor;
}

function saveExcelContent(fileId) {
    try {
        const table = document.getElementById('simple-excel-table');
        const rows = table.querySelectorAll('tbody tr');
        const data = [];

        rows.forEach(tr => {
            const rowData = [];
            const cells = tr.querySelectorAll('td');
            // Skip first cell (row number)
            for (let i = 1; i < cells.length; i++) {
                rowData.push(cells[i].innerText); // Just text for now
            }
            data.push(rowData);
        });

        // Convert back to XLSX if possible
        if (typeof XLSX !== 'undefined') {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

            const fileIndex = uploadedFiles.findIndex(f => f.id == fileId);
            if (fileIndex > -1) {
                uploadedFiles[fileIndex].content = wbout;
                uploadedFiles[fileIndex].lastModified = new Date().toISOString();
                saveDatabase();
            }
        } else {
            alert("Saqlash uchun XLSX kutubxonasi ishlamayapti, lekin ma'lumotlar xotirada qoladi.");
        }

        alert("Saqlandi!");
        closeExcelEditor();

        // Refresh UI
        const file = uploadedFiles.find(f => f.id == fileId);
        if (file) {
            const win = document.getElementById(`${file.department}-window`);
            if (win) updateFilesTable(win, file.department);
        }

    } catch (e) {
        alert("Xatolik: " + e.message);
    }
}

function closeExcelEditor() {
    const editorWindow = document.getElementById('excel-editor-window');
    const container = document.getElementById('x-spreadsheet-demo');

    editorWindow.style.display = 'none';
    editorWindow.classList.remove('active');
    // Don't remove overlay if other windows are open, checking...
    // Simply removing plain active might close others if stacked, but currently we have 1 active modal usually
    // Let's check if department window is active
    const deptWindows = document.querySelectorAll('.department-window.active');
    if (deptWindows.length === 0) {
        document.getElementById('department-overlay').classList.remove('active');
    }

    container.innerHTML = '';
    xSpreadsheet = null;
}

async function saveTextFile() {
    if (!currentEditingFile) return;

    // Use TinyMCE
    const editor = tinymce.activeEditor;
    if (editor) {
        const html = editor.getContent();
        const fileName = currentEditingFile.name.toLowerCase();

        if (fileName.endsWith('.docx')) {
            try {
                if (typeof htmlDocx !== 'undefined') {
                    // html-docx-js accepts html string and valid HTML document structure
                    // Let's wrap it in a basic page
                    const content = `<!DOCTYPE html><html><head></head><body>${html}</body></html>`;

                    const convertedBlob = htmlDocx.asBlob(content);
                    currentEditingFile.content = await convertedBlob.arrayBuffer();
                    currentEditingFile.lastModified = new Date().toISOString();
                } else {
                    alert("DOCX konvertatsiya kutubxonasi yuklanmadi!");
                    return;
                }
            } catch (e) {
                console.error("Docx save error", e);
                alert("Xatolik: " + e.message);
                return;
            }
        } else {
            // Plain text
            currentEditingFile.content = editor.getContent({ format: 'text' });
        }
    } else {
        alert("Tahrirlovchi topilmadi!");
        return;
    }

    currentEditingFile.status = 'approved';
    saveDatabase();

    alert('Fayl muvaffaqiyatli saqlandi!');

    // UI Cleanup
    const editorWindow = document.getElementById('text-editor-window');
    if (editorWindow) {
        editorWindow.classList.remove('active');
        editorWindow.style.display = 'none';

        // Remove TinyMCE to clean up
        if (tinymce && tinymce.activeEditor) {
            tinymce.activeEditor.remove();
        }
    }

    // Update active department window if exists
    const deptId = currentEditingFile.department;
    const activeWindow = document.getElementById(`${deptId}-window`);
    if (activeWindow) {
        updateFilesTable(activeWindow, deptId);
    }

    // General cleanup
    const deptWindows = document.querySelectorAll('.department-window.active');
    if (deptWindows.length === 0) {
        document.getElementById('department-overlay').classList.remove('active');
    }
}

function editCurrentFile() {
    if (!currentEditingFile) return;

    document.getElementById('file-preview-window').classList.remove('active');
    editFile(currentEditingFile);
}

function downloadCurrentFile() {
    if (!currentEditingFile) return;


    let blob;
    let filename = currentEditingFile.name;
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        // Excel fayl
        blob = new Blob([currentEditingFile.content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else if (currentEditingFile.type.includes('text') && !lowerName.endsWith('.docx')) {
        // Matn fayli
        blob = new Blob([currentEditingFile.content], { type: 'text/plain' });
    } else {
        // Boshqa fayllar (DOCX ham shu yerga tushadi agar text/plain bo'lmasa)
        // Aslida DOCX ArrayBuffer bo'lsa uni Blob qilish kerak
        if (currentEditingFile.content instanceof ArrayBuffer) {
            blob = new Blob([currentEditingFile.content]);
        } else {
            blob = new Blob([currentEditingFile.content], { type: currentEditingFile.type });
        }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`"${filename}" fayli yuklab olindi!`);
}


function printCurrentFile() {
    if (!currentEditingFile) return;

    const previewContent = document.getElementById('filePreview');
    if (!previewContent) return;

    // PDF Handlers
    const iframe = previewContent.querySelector('iframe');
    if (iframe) {
        try {
            iframe.contentWindow.print();
        } catch (e) {
            // Agar iframe orqali bo'lmasa, yangi oynada ochib chop etamiz
            const blob = new Blob([currentEditingFile.content], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const win = window.open(url, '_blank');
            if (win) {
                // User manual print usually needed for opened PDF
            } else {
                alert("Chop etish uchun pop-up oynalarni yoqing.");
            }
        }
        return;
    }

    // HTML Content (Word, Excel, Text)
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (!printWindow) {
        alert("Pop-up bloklangan. Chop etish uchun ruxsat bering.");
        return;
    }

    printWindow.document.write('<html><head><title>' + currentEditingFile.name + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: sans-serif; padding: 20px; }');
    printWindow.document.write('table { border-collapse: collapse; width: 100%; }');
    printWindow.document.write('td, th { border: 1px solid black; padding: 8px; text-align: left; }');
    printWindow.document.write('img { max-width: 100%; }');
    printWindow.document.write('.word-preview { white-space: pre-wrap; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');

    // Get content
    let content = previewContent.innerHTML;

    // Agar Excel formati bo'lsa (inputlar bilan)
    if (previewContent.querySelector('input')) {
        // Input qiymatlarini textga aylantirish (chop etish uchun)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        tempDiv.querySelectorAll('input').forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            input.parentNode.replaceChild(span, input);
        });
        content = tempDiv.innerHTML;
    }

    printWindow.document.write(content);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();

    setTimeout(function () {
        printWindow.print();
        printWindow.close();
    }, 500);
}

function updateAllDepartmentWindows() {
    functionalDepartments.forEach(dept => {
        const window = document.getElementById(`${dept.id}-window`);
        if (window) {
            updateFilesTable(window, dept.id);
        }
    });
}

function closeAllWindows() {
    document.querySelectorAll('.department-window, .integration-window, .editor-window').forEach(window => {
        window.classList.remove('active');
    });
    document.getElementById('department-overlay').classList.remove('active');
    currentEditingFile = null;
    currentSelectedCell = null;
    if (window.syncMobileBottomBar) window.syncMobileBottomBar();
}

// ========== VIDEO CHAT FUNKSIYALARI ==========

let localStream = null;
let isCameraOn = false;
let isMicOn = false;
let isScreenSharing = false;



// Defektaskop Tracker tugmasi
document.getElementById('openDefectoscopeBtn')?.addEventListener('click', function () {
    openDefectoscopeTracker();
});



// ============ ADMIN PANEL FUNKSIYALARI ============

// Admin tugmasini ko'rsatish (faqat admin uchun)
function showAdminButton() {
    if (currentUser && currentUser.role === 'admin') {
        // Admin panel tugmasi
        const openAdminPanelBtn = document.getElementById('openAdminPanelBtn');
        if (openAdminPanelBtn) openAdminPanelBtn.style.setProperty('display', 'flex', 'important');
        const adminVisaBtn = document.getElementById('openAdminVisaBtn');
        if (adminVisaBtn) adminVisaBtn.style.setProperty('display', 'flex', 'important');

        const auditLogsBtn = document.getElementById('auditLogsBtn');
        if (auditLogsBtn) auditLogsBtn.style.setProperty('display', 'flex', 'important');

        const analyticsBtn = document.getElementById('analyticsBtn');
        if (analyticsBtn) analyticsBtn.style.setProperty('display', 'flex', 'important');
    } else {
        // Boshqalar uchun admin tugmalarni yashirish
        const openAdminPanelBtn = document.getElementById('openAdminPanelBtn');
        if (openAdminPanelBtn) openAdminPanelBtn.style.setProperty('display', 'none', 'important');
        const adminVisaBtn = document.getElementById('openAdminVisaBtn');
        if (adminVisaBtn) adminVisaBtn.style.setProperty('display', 'none', 'important');

        const auditLogsBtn = document.getElementById('auditLogsBtn');
        if (auditLogsBtn) auditLogsBtn.style.setProperty('display', 'none', 'important');

        const analyticsBtn = document.getElementById('analyticsBtn');
        if (analyticsBtn) analyticsBtn.style.setProperty('display', 'none', 'important');
    }
    // Xarita tugmasi barcha kirgan foydalanuvchilar uchun ko'rinadi
    if (currentUser) {
        const openTrainMapBtn = document.getElementById('openTrainMapBtn');
        if (openTrainMapBtn) openTrainMapBtn.style.setProperty('display', 'flex', 'important');

        // Face ID Davomat tugmasini boshqarish
        const attendanceBtn = document.getElementById('openAttendanceBtn');
        if (attendanceBtn) {
            if (currentUser.role === 'department') {
                // Bo'limlar xodimlar davomatini o'zi kiritmaydi (faqat tasdiqlaydi/kuzatadi)
                attendanceBtn.style.setProperty('display', 'none', 'important');
            } else {
                attendanceBtn.style.setProperty('display', 'flex', 'important');
            }
        }
    }
}

// Admin panelini ochish
const openAdminBtn = document.getElementById('openAdminPanelBtn');
if (openAdminBtn) {
    openAdminBtn.addEventListener('click', function () {
        document.getElementById('adminPanelModal').classList.add('active');
        loadAdminPanelData();
    });
}

// Admin panelini yopish
const closeAdminBtn = document.getElementById('closeAdminPanel');
if (closeAdminBtn) {
    closeAdminBtn.addEventListener('click', function () {
        document.getElementById('adminPanelModal').classList.remove('active');
    });
}

// Admin panel tablarini almashtirish
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const tabId = this.getAttribute('data-admin-tab');

        // Barcha tablarni o'chirish
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

        // Faol tabni yoqish
        this.classList.add('active');
        document.getElementById(`admin-${tabId}-tab`).classList.add('active');
    });
});

// Admin panel ma'lumotlarini yuklash
function loadAdminPanelData() {
    loadAdminBolinmaScores();
    loadAdminTrainsList();
    loadAdminWorkersList();
    loadAdminStationsList();
    // loadAdminBolinmalarList(); // Temporarily removed
    loadAdminUsersList();
    loadAuditLogs();
}

// User tahrirlash oynasini ochish
window.openUserEditModal = function (user) {
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-fullname').value = user.full_name || '';
    document.getElementById('edit-user-role').value = user.role;
    document.getElementById('edit-user-depts').value = user.departments ? user.departments.join(', ') : '';
    document.getElementById('edit-user-bolinmalar').value = user.bolinmalar ? user.bolinmalar.join(', ') : '';
    document.getElementById('user-edit-modal').style.display = 'flex';
};

// User tahrirlashni saqlash
const userEditForm = document.getElementById('user-edit-form');
if (userEditForm) {
    userEditForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-user-id').value;
        const full_name = document.getElementById('edit-user-fullname').value;
        const role = document.getElementById('edit-user-role').value;
        const departments = document.getElementById('edit-user-depts').value.split(',').map(d => d.trim()).filter(d => d);
        const bolinmalar = document.getElementById('edit-user-bolinmalar').value.split(',').map(b => b.trim()).filter(b => b);

        try {
            await SmartUtils.fetchAPI(`/auth/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ full_name, role, departments, bolinmalar })
            });
            showToast("Foydalanuvchi ma'lumotlari yangilandi", "success");
            document.getElementById('user-edit-modal').style.display = 'none';
            loadAdminUsersList(); // Ro'yxatni yangilash
        } catch (err) {
            showToast("Saqlashda xatolik: " + err.message, "error");
        }
    };
}

// User Profile Actions for Admin
window.deleteUserProfile = function (userId) {
    if (confirm('Haqiqatan ham ushbu foydalanuvchini o\'chirmoqchimisiz?')) {
        SmartUtils.showToast('Bu funksiya hozircha cheklangan (demo)', 'info');
    }
}

window.editUserProfile = function (userId) {
    SmartUtils.showToast('Tahrirlash oynasi ochilmoqda...', 'info');
}

// Bo'linmalar ballarini yuklash
function loadAdminBolinmaScores() {
    const container = document.getElementById('adminBolinmaScores');
    container.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const score = competitionData.values[`bolinma${i}`]?.performance || 50;
        container.innerHTML += `
                                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                            <span style="color: white; width: 100px;">${i}-bo'linma:</span>
                                            <input type="number" id="bolinma${i}Score" value="${score}" 
                                                   min="0" max="200" style="flex: 1; padding: 8px; border-radius: 5px;">
                                        </div>
                                    `;
    }
}

// Poyezdlar ro'yxatini yuklash
function loadAdminTrainsList() {
    const container = document.getElementById('adminTrainsList');
    container.innerHTML = '';

    trainsData.forEach(train => {
        container.innerHTML += `
                                        <div class="train-item" style="position: relative;">
                                            <button onclick="deleteTrain(${train.id})" style="position: absolute; top: 5px; right: 5px; background: #e74c3c; border: none; color: white; width: 25px; height: 25px; border-radius: 50%; cursor: pointer;">
                                                <i class="fas fa-times"></i>
                                            </button>
                                            <div class="train-number">${train.number}</div>
                                            <div class="train-route">${train.route}</div>
                                            <div class="train-time">
                                                <span>Jo'nash: ${train.departure}</span>
                                                <span>Kelish: ${train.arrival}</span>
                                            </div>
                                            <span class="train-status ${train.status}">
                                                ${train.status === 'moving' ? 'Yo\'lda' : train.status === 'station' ? 'Bekatda' : 'Kutilmoqda'}
                                            </span>
                                        </div>
                                    `;
    });
}

// Xodimlar ro'yxatini yuklash
function loadAdminWorkersList() {
    const container = document.getElementById('adminWorkersList');
    container.innerHTML = '';

    workersData.forEach(worker => {
        container.innerHTML += `
                                        <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 10px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem;">
                                            <div style="width: 35px; height: 35px; border-radius: 50%; background: ${worker.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.9rem;">
                                                ${worker.name.charAt(0)}
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="color: white; font-weight: 500; font-size: 0.9rem;">${escapeHtml(worker.name)}</div>
                                                <div style="color: rgba(255,255,255,0.7); font-size: 0.75rem;">${worker.bolinma} - ${worker.role}</div>
                                            </div>
                                            <button onclick="deleteWorker(${worker.id})" style="background: #e74c3c; border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer;">
                                                <i class="fas fa-trash" style="font-size: 0.75rem;"></i>
                                            </button>
                                        </div>
                                    `;
    });
}

// Stansiyalar ro'yxatini yuklash
function loadAdminStationsList() {
    const container = document.getElementById('adminStationsList');
    if (!container) return;
    container.innerHTML = '';

    stationsData.forEach(station => {
        container.innerHTML += `
                                        <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 10px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem;">
                                            <div style="width: 35px; height: 35px; border-radius: 50%; background: #e74c3c; display: flex; align-items: center; justify-content: center; color: white;">
                                                <i class="fas fa-map-marker-alt"></i>
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="color: white; font-weight: 500; font-size: 0.9rem;">${escapeHtml(station.name)}</div>
                                                <div style="color: rgba(255,255,255,0.7); font-size: 0.75rem;">${station.bolinma}-bo'linma | ${station.lat.toFixed(2)}, ${station.lng.toFixed(2)}</div>
                                            </div>
                                            <button onclick="deleteStation(${station.id})" style="background: #e74c3c; border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer;">
                                                <i class="fas fa-trash" style="font-size: 0.75rem;"></i>
                                            </button>
                                        </div>
                                    `;
    });
}

// Yangi poyezd qo'shish
function addNewTrain() {
    const number = document.getElementById('newTrainNumber').value;
    const route = document.getElementById('newTrainRoute').value;
    const departure = document.getElementById('newTrainDeparture').value;
    const arrival = document.getElementById('newTrainArrival').value;

    if (!number || !route) {
        alert('Poyezd raqami va yo\'nalishini kiriting!');
        return;
    }

    const newTrain = {
        id: Date.now(),
        number: number,
        route: route,
        departure: departure || '00:00',
        arrival: arrival || '00:00',
        status: 'waiting',
        lat: stationsData[0]?.lat || 39.9,
        lng: stationsData[0]?.lng || 65.8
    };

    trainsData.push(newTrain);
    saveDataToStorage();
    loadAdminTrainsList();

    // Inputlarni tozalash
    document.getElementById('newTrainNumber').value = '';
    document.getElementById('newTrainRoute').value = '';
    document.getElementById('newTrainDeparture').value = '';
    document.getElementById('newTrainArrival').value = '';

    alert('Yangi poyezd qo\'shildi!');
}

// Yangi xodim qo'shish
function addNewWorker() {
    const name = document.getElementById('newWorkerName').value;
    const bolinma = document.getElementById('newWorkerBolinma').value;
    const role = document.getElementById('newWorkerRole').value;
    const color = document.getElementById('newWorkerColor').value;

    if (!name || !bolinma) {
        alert('Xodim ismi va bo\'linmasini kiriting!');
        return;
    }

    // Bo'linma stansiyasini topish
    const bolinmaNum = parseInt(bolinma.replace('-bo\'linma', ''));
    const station = stationsData.find(s => s.bolinma === bolinmaNum);

    const newWorker = {
        id: Date.now(),
        name: name,
        bolinma: bolinma,
        role: role || 'Xodim',
        lat: station?.lat || 39.9 + Math.random() * 0.5,
        lng: station?.lng || 65.5 + Math.random() * 0.5,
        color: color
    };

    workersData.push(newWorker);
    workerRoutes[newWorker.id] = [[newWorker.lat, newWorker.lng]];
    saveDataToStorage();
    loadAdminWorkersList();

    // Inputlarni tozalash
    document.getElementById('newWorkerName').value = '';
    document.getElementById('newWorkerBolinma').value = '';
    document.getElementById('newWorkerRole').value = '';

    alert('Yangi xodim qo\'shildi!');
}

// Yangi stansiya qo'shish
function addNewStation() {
    const name = document.getElementById('newStationName').value;
    const lat = parseFloat(document.getElementById('newStationLat').value);
    const lng = parseFloat(document.getElementById('newStationLng').value);
    const bolinma = parseInt(document.getElementById('newStationBolinma').value);

    if (!name || isNaN(lat) || isNaN(lng)) {
        alert('Stansiya nomi va koordinatlarini kiriting!');
        return;
    }

    const newStation = {
        id: Date.now(),
        name: name,
        lat: lat,
        lng: lng,
        bolinma: bolinma || 0
    };

    stationsData.push(newStation);
    trainRoutePoints = stationsData.map(s => [s.lat, s.lng]);
    saveDataToStorage();
    loadAdminStationsList();

    // Inputlarni tozalash
    document.getElementById('newStationName').value = '';
    document.getElementById('newStationLat').value = '';
    document.getElementById('newStationLng').value = '';
    document.getElementById('newStationBolinma').value = '';

    alert('Yangi stansiya qo\'shildi!');
}

// Poyezdni o'chirish
function deleteTrain(id) {
    if (confirm('Bu poyezdni o\'chirishni istaysizmi?')) {
        trainsData = trainsData.filter(t => t.id !== id);
        saveDataToStorage();
        loadAdminTrainsList();
    }
}

// Xodimni o'chirish
function deleteWorker(id) {
    if (confirm('Bu xodimni o\'chirishni istaysizmi?')) {
        workersData = workersData.filter(w => w.id !== id);
        delete workerRoutes[id];
        saveDataToStorage();
        loadAdminWorkersList();
    }
}

// Stansiyani o'chirish
function deleteStation(id) {
    if (confirm('Bu stansiyani o\'chirishni istaysizmi?')) {
        stationsData = stationsData.filter(s => s.id !== id);
        trainRoutePoints = stationsData.map(s => [s.lat, s.lng]);
        saveDataToStorage();
        loadAdminStationsList();
    }
}

// Event listenerlar
document.getElementById('addNewTrainBtn')?.addEventListener('click', addNewTrain);
document.getElementById('addNewWorkerBtn')?.addEventListener('click', addNewWorker);
document.getElementById('addNewStationBtn')?.addEventListener('click', addNewStation);

// Bo'linmalar statistikasini yuklash
function loadAdminBolinmalarList() {
    const container = document.getElementById('adminBolinmalarList');
    container.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const workerCount = workersData.filter(w => w.bolinma === `${i}-bo'linma`).length;
        container.innerHTML += `
                                        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 10px; margin-bottom: 0.5rem;">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div style="color: #ffd700; font-weight: bold;">${i}-bo'linma</div>
                                                <div style="color: white;">Xodimlar: ${workerCount}</div>
                                            </div>
                                            <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                                                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">Bo'limlar: 8</span>
                                                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">Fayllar: ${Math.floor(Math.random() * 20) + 5}</span>
                                            </div>
                                        </div>
                                    `;
    }
}

// Admin grafik sozlamalarini saqlash
document.getElementById('saveAdminChartBtn').addEventListener('click', function () {
    // Bo'linmalar ballarini saqlash
    for (let i = 1; i <= 10; i++) {
        const score = parseInt(document.getElementById(`bolinma${i}Score`).value) || 50;
        if (!competitionData.values[`bolinma${i}`]) {
            competitionData.values[`bolinma${i}`] = {};
        }
        competitionData.values[`bolinma${i}`].performance = score;
    }

    // Grafik turini saqlash
    competitionData.chartSettings.type = document.getElementById('adminChartType').value;

    saveDatabase();

    // Grafikni yangilash
    if (competitionChart) {
        competitionChart.destroy();
        createCompetitionChart();
    }

    alert('Sozlamalar saqlandi!');
});

// ============ XARITA FUNKSIYALARI ============

// Poyezdlar harakati endi asosiy PCh xaritasiga integratsiya qilindi.




// Stansiya markerlarini qo'shish
function addStationMarkers() {
    stationsData.forEach(station => {
        const marker = L.marker([station.lat, station.lng], {
            icon: L.divIcon({
                className: 'station-marker',
                html: `<div style="background: #e74c3c; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);">
                                                <i class="fas fa-map-marker-alt" style="color: white; font-size: 12px;"></i>
                                            </div>`
            })
        }).addTo(trainLiveMap);

        marker.bindPopup(`
                                        <div style="text-align: center;">
                                            <strong style="color: #1a2a3a;">${escapeHtml(station.name)}</strong><br>
                                            <span>${station.bolinma}-bo'linma</span><br>
                                            <small>Koordinatalar: ${station.lat.toFixed(2)}, ${station.lng.toFixed(2)}</small>
                                        </div>
                                    `);
    });
}

// Poyezd markerlarini qo'shish
function addTrainMarkers() {
    trainMarkers.forEach(m => trainLiveMap.removeLayer(m));
    trainMarkers = [];

    trainsData.forEach(train => {
        const marker = L.marker([train.lat, train.lng], {
            icon: L.divIcon({
                className: 'train-marker',
                html: `<div style="background: #ffd700; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);">
                                                <i class="fas fa-train" style="color: #1a2a3a;"></i>
                                            </div>`
            })
        }).addTo(trainLiveMap);

        marker.bindPopup(`
                                        <div style="text-align: center;">
                                            <strong style="color: #1a2a3a;">${train.number}</strong><br>
                                            <span>${train.route}</span><br>
                                            <small>Jo'nash: ${train.departure} | Kelish: ${train.arrival}</small>
                                        </div>
                                    `);

        trainMarkers.push(marker);
    });
}

// Xodim markerlarini qo'shish
function addWorkerMarkers() {
    workerMarkers.forEach(m => trainLiveMap.removeLayer(m));
    routePolylines.forEach(p => trainLiveMap.removeLayer(p));
    workerMarkers = [];
    routePolylines = [];

    workersData.forEach(worker => {
        // Xodim markeri
        const marker = L.marker([worker.lat, worker.lng], {
            icon: L.divIcon({
                className: 'worker-marker-icon',
                html: `<div class="worker-marker" style="background: ${worker.color};">${worker.name.charAt(0)}</div>`
            })
        }).addTo(trainLiveMap);

        marker.bindPopup(`
                                        <div style="text-align: center;">
                                            <strong style="color: #1a2a3a;">${escapeHtml(worker.name)}</strong><br>
                                            <span>${worker.bolinma}</span><br>
                                            <small>${worker.role}</small>
                                        </div>
                                    `);

        workerMarkers.push(marker);

        // Xodim yo'lini chizish
        const route = workerRoutes[worker.id];
        if (route) {
            const polyline = L.polyline(route, {
                color: worker.color,
                weight: 3,
                opacity: 0.7,
                dashArray: '5, 10'
            }).addTo(trainLiveMap);
            routePolylines.push(polyline);
        }
    });
}

// Poyezdlar jadvalini yuklash
function loadTrainSchedule() {
    const container = document.getElementById('trainScheduleList');
    container.innerHTML = '';

    trainsData.forEach(train => {
        container.innerHTML += `
                                        <div class="train-item">
                                            <div class="train-number"><i class="fas fa-train"></i> ${train.number}</div>
                                            <div class="train-route">${train.route}</div>
                                            <div class="train-time">
                                                <span><i class="fas fa-clock"></i> ${train.departure}</span>
                                                <span><i class="fas fa-flag-checkered"></i> ${train.arrival}</span>
                                            </div>
                                            <span class="train-status ${train.status}">
                                                ${train.status === 'moving' ? 'Yo\'lda' : train.status === 'station' ? 'Bekatda' : 'Kutilmoqda'}
                                            </span>
                                        </div>
                                    `;
    });
}

// Online xodimlarni yuklash
function loadWorkersOnline() {
    const container = document.getElementById('workersOnlineList');
    container.innerHTML = '';

    workersData.forEach(worker => {
        container.innerHTML += `
                                        <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 8px;">
                                            <div style="width: 30px; height: 30px; border-radius: 50%; background: ${worker.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
                                                ${worker.name.charAt(0)}
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="color: white; font-size: 0.85rem;">${escapeHtml(worker.name)}</div>
                                                <div style="color: rgba(255,255,255,0.6); font-size: 0.75rem;">${worker.bolinma}</div>
                                            </div>
                                            <span style="color: #2ecc71; font-size: 0.7rem;"><i class="fas fa-circle"></i></span>
                                        </div>
                                    `;
    });
}

// Pozitsiyalarni yangilash (simulyatsiya)
function updatePositions() {
    // Poyezdlarni harakatlantirish
    trainsData.forEach((train, index) => {
        if (train.status === 'moving') {
            train.lat += (Math.random() - 0.5) * 0.02;
            train.lng += (Math.random() - 0.5) * 0.02;
        }
    });

    // Xodimlarni harakatlantirish
    workersData.forEach((worker, index) => {
        worker.lat += (Math.random() - 0.5) * 0.01;
        worker.lng += (Math.random() - 0.5) * 0.01;

        // Yangi pozitsiyani yo'lga qo'shish
        workerRoutes[worker.id].push([worker.lat, worker.lng]);
        if (workerRoutes[worker.id].length > 10) {
            workerRoutes[worker.id].shift();
        }
    });

    // Markerlarni yangilash
    if (trainLiveMap) {
        addTrainMarkers();
        addWorkerMarkers();
    }
}

// Panel yashirilgan holatda boshlanadi

// === NEW FEATURES JS ===

// Notification System
function showNotification(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'info-circle';
    let color = '#3498db';

    if (type === 'success') { icon = 'check-circle'; color = '#2ecc71'; }
    if (type === 'warning') { icon = 'exclamation-triangle'; color = '#f39c12'; }
    if (type === 'error') { icon = 'times-circle'; color = '#e74c3c'; }

    toast.style.borderLeftColor = color;
    toast.innerHTML = `<i class="fas fa-${icon}" style="color: ${color}; font-size: 1.2rem;"></i> ${msg}`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'all 0.5s ease';
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// AI Chat → js/modules/ai-chat.js
// Kanban Board → js/modules/kanban-board.js
// Maintenance → js/modules/maintenance.js
// Excel Editor → js/modules/excel-editor.js

// Tizimni qayta yuklash (yangi funksiyalar uchun)
setTimeout(() => {
    if (typeof currentUser !== 'undefined' && currentUser && document.getElementById('mainSystem').style.display !== 'none') {
        console.log("New features injected");
        renderSidebar();
        renderMainContent();
    }
}, 500);

// Qor effektini ishga tushirish
function createSnowflakes() {
    const container = document.createElement('div');
    container.className = 'snow-container';
    document.body.appendChild(container);

    const snowflakeCount = 50;
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
        snowflake.style.opacity = Math.random();
        container.appendChild(snowflake);
    }
}
createSnowflakes();

function openHistoryModal() {
    const modal = document.getElementById('history-modal');
    modal.classList.add('active');
    modal.style.display = 'flex';
    loadHistoryDates();
}

function loadHistoryDates() {
    const history = JSON.parse(localStorage.getItem('subdivisionReportsHistory')) || {};
    const list = document.getElementById('historyDateList');
    list.innerHTML = '';

    const dates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a)); // Sort desc (newest first)

    if (dates.length === 0) {
        list.innerHTML = '<div style="padding: 10px; color: #888;">Hozircha tarix mavjud emas</div>';
        return;
    }

    dates.forEach(date => {
        const count = Object.keys(history[date]).length;
        const div = document.createElement('div');
        div.className = 'history-date-item';
        div.innerHTML = `<span><i class="far fa-calendar-alt"></i> ${date}</span> <span style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">${count}</span>`;
        div.onclick = () => loadHistoryDetails(date, div);
        list.appendChild(div);
    });
}

function loadHistoryDetails(date, element) {
    document.querySelectorAll('.history-date-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    const history = JSON.parse(localStorage.getItem('subdivisionReportsHistory')) || {};
    const data = history[date] || {};
    const container = document.getElementById('historyDetails');
    container.innerHTML = '';

    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p>Ma\'lumot topilmadi</p>';
        return;
    }

    container.innerHTML = `<h3 style="margin-bottom: 20px; color: #00c6ff;">${date} sanasidagi hisobotlar</h3>`;

    for (const [bolinmaId, report] of Object.entries(data)) {
        const subName = subdivisions.find(s => s.id === bolinmaId)?.name || bolinmaId;

        const card = document.createElement('div');
        card.className = 'history-report-card';
        card.innerHTML = `
                                        <div class="history-report-header">
                                            <strong style="color: #2ecc71;">${subName}</strong>
                                            <span class="history-report-time"><i class="far fa-clock"></i> ${report.time}</span>
                                        </div>
                                        <div style="line-height: 1.5; color: rgba(255,255,255,0.9);">
                                            ${escapeHtml(report.text)}
                                        </div>
                                    `;
        container.appendChild(card);
    }
}

// ============ ROAD MANAGEMENT FUNCTIONS ============

// ============ ROAD MANAGEMENT SIDEBAR FUNCTIONS ============

function getRoadSidebarHTML(bolinmaId) {
    console.log('getRoadSidebarHTML called with:', bolinmaId);
    console.log('window.roadManagementData:', window.roadManagementData);
    console.log('window.monitoringData:', window.monitoringData);

    const roadData = window.roadManagementData[bolinmaId] || {
        switches: { "1/11": 0, "1/9": 0 },
        tracks: { main: 0, reception: 0, other: 0 }
    };

    // Ensure monitoring data exists or default random
    let monitorData = window.monitoringData[bolinmaId];
    if (!monitorData) {
        monitorData = {
            temp: Math.floor(Math.random() * (55 - 20) + 20),
            defects: 0,
            wearV: 0.0,
            wearH: 0.0,
            bruto: 12.5
        };
        window.monitoringData[bolinmaId] = monitorData;
    }

    console.log('roadData:', roadData);
    console.log('monitorData:', monitorData);

    // Check permissions
    const canEdit = currentUser && currentUser.role === 'bolinma' && currentUser.bolinmalar && currentUser.bolinmalar.includes(bolinmaId);

    return `
        <div class="road-sidebar-header">
            <span><i class="fas fa-chart-bar"></i> Monitoring</span>
            ${canEdit ? `
                <button onclick="editRoadManagement('${bolinmaId}')" style="background:none; border:none; color:#ffd700; cursor:pointer;" title="Tahrirlash">
                    <i class="fas fa-edit"></i>
                </button>
            ` : ''}
        </div>
        
        <!-- Smart Monitoring Card -->
        <div class="road-mini-card">
            <h5><i class="fas fa-thermometer-half"></i> Holat Monitoringi</h5>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Rels Harorati:</span>
                <span class="mini-stat-value" style="color: ${monitorData.temp > 50 ? '#e74c3c' : (monitorData.temp > 40 ? '#f1c40f' : '#2ecc71')}">
                    +${monitorData.temp}°C
                </span>
            </div>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Nuqsonlar:</span>
                <span class="mini-stat-value" style="color: ${monitorData.defects > 0 ? '#e74c3c' : '#2ecc71'}">
                    ${monitorData.defects} ta
                </span>
            </div>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Yillik tonna bruto:</span>
                <span class="mini-stat-value" style="color: #ffd700">
                    ${monitorData.bruto || 0} mln t.km
                </span>
            </div>
        </div>

        <!-- Strelkalar Mini Card -->
        <div class="road-mini-card">
            <h5><i class="fas fa-code-branch"></i> Strelkalar</h5>
            <div class="mini-stat-row">
                <span class="mini-stat-label">1/11 marka:</span>
                <span class="mini-stat-value highlight">${(roadData.switches && roadData.switches["1/11"]) || 0}</span>
            </div>
            <div class="mini-stat-row">
                <span class="mini-stat-label">1/9 marka:</span>
                <span class="mini-stat-value highlight">${(roadData.switches && roadData.switches["1/9"]) || 0}</span>
            </div>
            <div class="mini-stat-row" style="border-top:1px solid rgba(255,255,255,0.1); margin-top:5px; padding-top:5px;">
                <span class="mini-stat-label">Jami:</span>
                <span class="mini-stat-value">${((roadData.switches && roadData.switches["1/11"]) || 0) + ((roadData.switches && roadData.switches["1/9"]) || 0)}</span>
            </div>
        </div>
        
        <!-- Yo'llar Mini Card -->
        <div class="road-mini-card">
            <h5><i class="fas fa-ruler"></i> Yo'llar Uzunligi (km)</h5>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Asosiy:</span>
                <span class="mini-stat-value highlight">${(roadData.tracks && roadData.tracks.main) || 0}</span>
            </div>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Qabul:</span>
                <span class="mini-stat-value highlight">${(roadData.tracks && roadData.tracks.reception) || 0}</span>
            </div>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Boshqa:</span>
                <span class="mini-stat-value highlight">${(roadData.tracks && roadData.tracks.other) || 0}</span>
            </div>
        </div>
    `;
}

function editRoadManagement(bolinmaId) {
    const roadData = window.roadManagementData[bolinmaId] || {
        switches: { "1/11": 0, "1/9": 0 },
        tracks: { main: 0, reception: 0, other: 0 }
    };

    let monitorData = window.monitoringData[bolinmaId] || {
        temp: 25, defects: 0, wearV: 0, wearH: 0, bruto: 0
    };

    let modal = document.getElementById('road-edit-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'road-edit-modal';
    modal.className = 'road-modal active';
    modal.style.maxHeight = '90vh';
    modal.style.overflowY = 'auto'; // Ensure it doesn't clip on small screens

    modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="color:#ffd700; margin:0;"><i class="fas fa-pen"></i> Tahrirlash</h3>
            <button onclick="document.getElementById('road-edit-modal').remove()" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer;">&times;</button>
        </div>
        
        <!-- Monitoring Inputs -->
        <h4 style="color:#2ecc71; font-size:0.95rem; margin-bottom:10px; border-bottom:1px solid rgba(46,204,113,0.3); padding-bottom:5px;">Holat Monitoringi</h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
             <div>
                <label class="road-form-label">Harorat (°C)</label>
                <input type="number" id="input-temp" class="road-input" value="${monitorData.temp}">
             </div>
             <div>
                <label class="road-form-label">Nuqsonlar (soni)</label>
                <input type="number" id="input-defects" class="road-input" value="${monitorData.defects}">
             </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
             <div>
                <label class="road-form-label">Yeyilish V (mm)</label>
                <input type="number" step="0.1" id="input-wear-v" class="road-input" value="${monitorData.wearV}">
             </div>
             <div>
                <label class="road-form-label">Yeyilish G (mm)</label>
                <input type="number" step="0.1" id="input-wear-h" class="road-input" value="${monitorData.wearH}">
             </div>
        </div>
        <div style="margin-bottom:15px;">
            <label class="road-form-label">Yillik tonna bruto (mln t.km)</label>
            <input type="number" step="0.1" id="input-bruto" class="road-input" value="${monitorData.bruto || 0}">
        </div>

        <!-- Road Inputs -->
        <h4 style="color:#00f2ff; font-size:0.95rem; margin-bottom:10px; border-bottom:1px solid rgba(0,242,255,0.3); padding-bottom:5px;">Infratuzilma</h4>
        
        <label class="road-form-label" style="font-size:0.85rem; color:#aaa;">Strelkalar Soni:</label>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
             <div>
                <label class="road-form-label">1/11 marka</label>
                <input type="number" id="input-sw-11" class="road-input" value="${roadData.switches["1/11"]}">
             </div>
             <div>
                <label class="road-form-label">1/9 marka</label>
                <input type="number" id="input-sw-9" class="road-input" value="${roadData.switches["1/9"]}">
             </div>
        </div>
        
        <label class="road-form-label" style="font-size:0.85rem; color:#aaa;">Yo'llar Uzunligi (km):</label>
        <div style="margin-bottom: 10px;">
            <label class="road-form-label">1 - Asosiy yo'l</label>
            <input type="number" step="0.01" id="input-track-1" class="road-input" value="${roadData.tracks.main}">
        </div>
        <div style="margin-bottom: 10px;">
            <label class="road-form-label">3 - Qabul qilish yo'li</label>
            <input type="number" step="0.01" id="input-track-3" class="road-input" value="${roadData.tracks.reception}">
        </div>
        <div style="margin-bottom: 10px;">
            <label class="road-form-label">100 - Boshqa yo'llar</label>
            <input type="number" step="0.01" id="input-track-100" class="road-input" value="${roadData.tracks.other}">
        </div>
        
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button onclick="document.getElementById('road-edit-modal').remove()" class="control-btn" style="padding:6px 12px; font-size:0.9rem;">Bekor qilish</button>
            <button onclick="saveRoadManagement('${bolinmaId}')" class="control-btn green" style="padding:6px 12px; font-size:0.9rem;">Saqlash</button>
        </div>
    `;

    document.body.appendChild(modal);
}

function saveRoadManagement(bolinmaId) {
    // Road Inputs
    const sw11 = document.getElementById('input-sw-11').value;
    const sw9 = document.getElementById('input-sw-9').value;
    const t1 = document.getElementById('input-track-1').value;
    const t3 = document.getElementById('input-track-3').value;
    const t100 = document.getElementById('input-track-100').value;

    // Monitor Inputs
    const temp = document.getElementById('input-temp').value;
    const defects = document.getElementById('input-defects').value;
    const wearV = document.getElementById('input-wear-v').value;
    const wearH = document.getElementById('input-wear-h').value;
    const bruto = document.getElementById('input-bruto').value;

    if (sw11 === '' || t1 === '' || temp === '') { // Basic validation
        alert("Iltimos, asosiy maydonlarni to'ldiring!");
        return;
    }

    // Save Road Data
    window.roadManagementData[bolinmaId] = {
        switches: {
            "1/11": parseInt(sw11) || 0,
            "1/9": parseInt(sw9) || 0
        },
        tracks: {
            main: parseFloat(t1) || 0,
            reception: parseFloat(t3) || 0,
            other: parseFloat(t100) || 0
        }
    };

    // Save Monitor Data
    window.monitoringData[bolinmaId] = {
        temp: parseInt(temp) || 0,
        defects: parseInt(defects) || 0,
        wearV: parseFloat(wearV) || 0,
        wearH: parseFloat(wearH) || 0,
        bruto: parseFloat(bruto) || 0
    };

    // Commit to LocalStorage
    localStorage.setItem('roadManagementData', JSON.stringify(window.roadManagementData));
    localStorage.setItem('monitoringData', JSON.stringify(window.monitoringData));

    // Close modal
    document.getElementById('road-edit-modal').remove();

    // Update View (Re-render Sidebar)
    const activeWindow = document.getElementById(bolinmaId + '-window');
    if (activeWindow) {
        const sidebar = activeWindow.querySelector('.road-management-sidebar');
        if (sidebar) sidebar.innerHTML = getRoadSidebarHTML(bolinmaId);
    }

    // Update Homepage Monitoring Cards if visible
    if (typeof renderHomepageMonitoring === 'function') {
        renderHomepageMonitoring();
    }

    alert("Barcha ma'lumotlar saqlandi!");
}


// Function to initialize Smart System components
function initSmartSystem() {
    console.log('Smart PCH System Initializing...');

    // Core system setups from utils.js
    if (typeof SmartUtils !== 'undefined') {
        SmartUtils.createLoadingSpinner();
        SmartUtils.setupGlobalErrorHandler();
    }

    // Setup Backup Button
    const backupBtn = document.getElementById('backupDataBtn');
    if (backupBtn) {
        backupBtn.onclick = () => typeof window.backupSystemData === 'function' ? window.backupSystemData() : null;
    }

    setTimeout(function () {
        const btn = document.getElementById('openDispatcherIntegrationBtn');
        const win = document.getElementById('dispatcher-integration-window');
        const closeBtn = document.getElementById('closeDispatcherIntegrationBtn');
        const iframe = document.getElementById('dispatcher-integration-iframe');
        const loader = document.getElementById('dispatcher-integration-loader');

        if (btn && win && closeBtn) {
            btn.addEventListener('click', function () {
                // Close nav tools menu if open
                if (document.getElementById('navToolsContainer')) {
                    document.getElementById('navToolsContainer').classList.remove('active');
                }
                win.style.display = 'flex';
                win.style.animation = 'fadeIn 0.3s ease-out forwards';
            });

            closeBtn.addEventListener('click', function () {
                win.style.animation = 'fadeOut 0.3s ease-in forwards';
                setTimeout(() => { win.style.display = 'none'; }, 300);
            });

            const intBtns = win.querySelectorAll('.int-btn');
            intBtns.forEach(t => {
                t.addEventListener('click', () => {
                    const isExternal = t.getAttribute('data-external') === 'true';
                    const url = t.getAttribute('data-url');

                    if (isExternal) {
                        window.open(url, '_blank');
                        return;
                    }

                    intBtns.forEach(b => {
                        b.style.background = b.style.background.replace('0.15', '0.1');
                        b.style.boxShadow = 'none';
                        b.classList.remove('active');
                    });
                    t.style.background = t.style.background.replace('0.1', '0.15');
                    t.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
                    t.classList.add('active');

                    if (iframe && loader) {
                        loader.style.display = 'flex';
                        iframe.src = url;
                        iframe.onload = () => {
                            loader.style.display = 'none';
                        };
                    }
                });
            });

        }

        // Video Chat Logic
        const videoBtn = document.getElementById('openVideoChatBtn');
        const videoWin = document.getElementById('video-chat-window');
        const closeVideoBtn = document.getElementById('closeVideoChatBtn');
        let jitsiApi = null;

        if (videoBtn && videoWin && closeVideoBtn) {
            videoBtn.addEventListener('click', function () {
                videoWin.classList.add('active');
                videoWin.style.display = 'flex';

                // Initialize Jitsi Meet
                if (!jitsiApi) {
                    const domain = 'meet.jit.si';
                    const roomName = 'SmartPCH-Conference-Room-Main';

                    // Set room name safely
                    const roomNameEl = document.getElementById('meet-room-name');
                    if (roomNameEl) roomNameEl.textContent = 'Xona: ' + roomName;

                    const options = {
                        roomName: roomName,
                        width: '100%',
                        height: '100%',
                        parentNode: document.getElementById('meet-container'),
                        // Check for currentUser existence
                        userInfo: {
                            displayName: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.name : 'Foydalanuvchi'
                        },
                        configOverwrite: {
                            startWithAudioMuted: true,
                            startWithVideoMuted: true,
                            prejoinPageEnabled: false
                        },
                        interfaceConfigOverwrite: {
                            TOOLBAR_BUTTONS: [
                                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                                'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                                'security'
                            ]
                        },
                        onload: function () {
                            // console.log('Video chat loaded');
                        }
                    };

                    // Load Jitsi Script dynamically if not present
                    if (!window.JitsiMeetExternalAPI) {
                        const script = document.createElement('script');
                        script.src = 'https://meet.jit.si/external_api.js';
                        script.onload = () => {
                            jitsiApi = new JitsiMeetExternalAPI(domain, options);
                        };
                        document.head.appendChild(script);
                    } else {
                        jitsiApi = new JitsiMeetExternalAPI(domain, options);
                    }
                }
            });

            const closeVideo = function () {
                videoWin.classList.remove('active');
                setTimeout(() => {
                    if (!videoWin.classList.contains('active')) {
                        videoWin.style.display = 'none';
                        if (jitsiApi) {
                            jitsiApi.dispose();
                            jitsiApi = null;
                            document.getElementById('meet-container').innerHTML = '';
                        }
                    }
                }, 300);
            };

            closeVideoBtn.addEventListener('click', closeVideo);
        }
    }, 1000);
}

// Global DOM Initialization - initSmartSystem moved to index.html
document.addEventListener('DOMContentLoaded', function () {
    // Nav Clock Update
    setInterval(() => {
        const clockEl = document.getElementById('nav-clock-time');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('uz-UZ', { hour12: false });
        }
    }, 1000);
});


function openHistoryModal() {
    const modal = document.getElementById('history-modal');
    modal.classList.add('active');
    modal.style.display = 'flex';
    loadHistoryDates();
}

function loadHistoryDates() {
    const history = JSON.parse(localStorage.getItem('subdivisionReportsHistory')) || {};
    const list = document.getElementById('historyDateList');
    list.innerHTML = '';

    const dates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a)); // Sort desc (newest first)

    if (dates.length === 0) {
        list.innerHTML = '<div style="padding: 10px; color: #888;">Hozircha tarix mavjud emas</div>';
        return;
    }

    dates.forEach(date => {
        const count = Object.keys(history[date]).length;
        const div = document.createElement('div');
        div.className = 'history-date-item';
        div.innerHTML = `<span><i class="far fa-calendar-alt"></i> ${date}</span> <span style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">${count}</span>`;
        div.onclick = () => loadHistoryDetails(date, div);
        list.appendChild(div);
    });
}

function loadHistoryDetails(date, element) {
    document.querySelectorAll('.history-date-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    const history = JSON.parse(localStorage.getItem('subdivisionReportsHistory')) || {};
    const data = history[date] || {};
    const container = document.getElementById('historyDetails');
    container.innerHTML = '';

    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p>Ma\'lumot topilmadi</p>';
        return;
    }

    container.innerHTML = `<h3 style="margin-bottom: 20px; color: #00c6ff;">${date} sanasidagi hisobotlar</h3>`;

    for (const [bolinmaId, report] of Object.entries(data)) {
        // Find subdivision name securely
        let subName = bolinmaId;
        const sub = subdivisions.find(s => s.id === bolinmaId);
        if (sub) subName = sub.name;

        const card = document.createElement('div');
        card.className = 'history-report-card';
        card.innerHTML = `
                    <div class="history-report-header">
                        <strong style="color: #2ecc71;">${subName}</strong>
                        <span class="history-report-time"><i class="far fa-clock"></i> ${report.time}</span>
                    </div>
                    <div style="line-height: 1.5; color: rgba(255,255,255,0.9);">
                        ${escapeHtml(report.text)}
                    </div>
                `;
        container.appendChild(card);
    }
}

// Sidebar Collapsing/Toggling Logic
window.toggleSidebar = function (event) {
    if (event && event.target) {
        // Do not toggle if clicked on the changeMasofaBtn
        if (event.target.closest('#changeMasofaBtn')) {
            return;
        }
    }
    const sidebar = document.querySelector('.sidebar');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const toggleIcon = document.getElementById('sidebarToggleIcon');

    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
    if (sidebarMenu) {
        sidebarMenu.classList.toggle('collapsed');
    }
    if (toggleIcon) {
        toggleIcon.classList.toggle('rotate-icon');
    }
};

// --- SAFETY SECTION FUNCTIONS (Mehnat Muhofazasi) ---
// Old render function removed


// --- MECHANICS SECTION FUNCTIONS (Mexanika Bo'limi) ---
// Redundant stubs removed


// --- TRAIN SCHEDULE & RADAR LOGIC ---

// Store for Train Schedules: key = 'train_schedule_bolinmaId'
window.getTrainSchedule = function (bolinmaId) {
    const key = `train_schedule_${bolinmaId}`;
    return JSON.parse(localStorage.getItem(key)) || [];
}

window.openTrainScheduleModal = function (bolinmaId, event) {
    if (event) event.stopPropagation();

    // Remove existing modal if any
    const existing = document.getElementById('train-schedule-modal');
    if (existing) existing.remove();

    const trains = getTrainSchedule(bolinmaId);

    // Create Modal HTML
    const modal = document.createElement('div');
    modal.id = 'train-schedule-modal';
    modal.className = 'active';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
        display: flex; align-items: center; justify-content: center; z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="background: #1e293b; width: 600px; max-width: 90%; border-radius: 20px; border: 1px solid rgba(0, 198, 255, 0.3); overflow: hidden; box-shadow: 0 0 50px rgba(0, 198, 255, 0.2);">
            <div style="padding: 20px; background: linear-gradient(90deg, rgba(0, 198, 255, 0.1), transparent); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: white;"><i class="fas fa-train"></i> Poyezdlar Jadvali (${bolinmaId})</h3>
                <button onclick="document.getElementById('train-schedule-modal').remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div style="padding: 20px; max-height: 70vh; overflow-y: auto;">
                
                <!-- Add New Train Form -->
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #00c6ff;">Yangi poyezd qo'shish</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <input type="text" id="train-name" placeholder="Poyezd Nomi (Masalan: Afrosiyob 760)" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                        <input type="text" id="train-route" placeholder="Yo'nalish (Toshkent - Buxoro)" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                        <input type="time" id="train-time" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                        <select id="train-status" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                            <option value="ontime">O'z vaqtida</option>
                            <option value="delayed">Kechikmoqda</option>
                            <option value="arrived">Yetib keldi</option>
                        </select>
                        <input type="number" id="train-pk" placeholder="Hozirgi PK (Radar uchun)" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                    </div>
                    <button onclick="saveTrainToSchedule('${bolinmaId}')" style="margin-top: 15px; width: 100%; padding: 12px; background: linear-gradient(45deg, #00c6ff, #0072ff); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">
                        <i class="fas fa-plus"></i> Jadvalga qo'shish
                    </button>
                </div>

                <!-- Existing List -->
                <h4 style="color: rgba(255,255,255,0.7); margin-bottom: 15px;">Joriy Jadval</h4>
                <div id="train-list-container">
                    ${trains.length === 0 ? '<div style="text-align:center; color:rgba(255,255,255,0.3);">Poyezdlar yo\'q</div>' : ''}
                    ${trains.map((t, index) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid ${t.status === 'delayed' ? '#e74c3c' : '#2ecc71'};">
                            <div>
                                <div style="font-weight: bold; color: white;">${escapeHtml(t.name)}</div>
                                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5);">${t.route} | PK: ${t.pk}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="font-size: 1.2rem; white-space: nowrap; color: #ffd700; font-family: monospace;">${t.time}</div>
                                <button onclick="deleteTrainFromSchedule('${bolinmaId}', ${index})" style="background: none; border: none; color: #e74c3c; cursor: pointer;"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window.saveTrainToSchedule = function (bolinmaId) {
    const name = document.getElementById('train-name').value;
    const route = document.getElementById('train-route').value;
    const time = document.getElementById('train-time').value;
    const status = document.getElementById('train-status').value;
    const pk = document.getElementById('train-pk').value;

    if (!name || !time) {
        alert("Iltimos, poyezd nomi va vaqtini kiriting!");
        return;
    }

    const trains = getTrainSchedule(bolinmaId);
    trains.push({ name, route, time, status, pk: pk || 0 });

    const key = `train_schedule_${bolinmaId}`;
    localStorage.setItem(key, JSON.stringify(trains));

    // Refresh modal
    document.getElementById('train-schedule-modal').remove();
    openTrainScheduleModal(bolinmaId);

    alert("Poyezd qo'shildi!");
}

window.deleteTrainFromSchedule = function (bolinmaId, index) {
    const trains = getTrainSchedule(bolinmaId);
    trains.splice(index, 1);
    const key = `train_schedule_${bolinmaId}`;
    localStorage.setItem(key, JSON.stringify(trains));

    // Refresh modal
    document.getElementById('train-schedule-modal').remove();
    openTrainScheduleModal(bolinmaId);
}

// Function to render the Radar in Subdivision Dashboard
window.renderTrainRadarWidget = function (bolinmaId) {
    const trains = getTrainSchedule(bolinmaId);
    const range = getPKRange(); // Current user's PK range

    // Safety check for container
    const container = document.getElementById('trainRadarContainer');
    if (!container) return;

    // Filter trains that are loosely relevant? For now show all, or filter by PK range logic if we were complex.
    // We will show all assigned trains in the Table, and trains within range on the Radar.

    let radarHTML = `
        <div style="position: relative; width: 100%; height: 120px; background: rgba(0,0,0,0.3); border-radius: 15px; margin-bottom: 20px; overflow: hidden; display: flex; align-items: center;">
            <div style="position: absolute; width: 100%; height: 1px; background: rgba(255,255,255,0.2); top: 50%;"></div>
            
            <!-- PK Markers -->
            <div style="position: absolute; bottom: 10px; left: 10px; color: rgba(255,255,255,0.3); font-size: 0.7rem;">PK ${range.start}</div>
            <div style="position: absolute; bottom: 10px; right: 10px; color: rgba(255,255,255,0.3); font-size: 0.7rem;">PK ${range.end}</div>
            
            <!-- Dynamic Train Icons -->
            ${trains.map(t => {
        // Calculate position percentage
        // Assume safe range 140-160 etc.
        const totalDist = range.end - range.start;
        let percent = ((t.pk - range.start) / totalDist) * 100;

        // Clamp for visuals
        if (percent < 0) percent = -5; // Just off screen left
        if (percent > 100) percent = 105; // Just off screen right

        const isVisible = percent >= 0 && percent <= 100;
        const color = t.status === 'delayed' ? '#e74c3c' : '#00f2ff';

        return `
                    <div class="train-radar-icon" style="position: absolute; left: ${percent}%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; transition: left 1s ease;">
                        <div style="background: ${color}; padding: 5px; border-radius: 5px; box-shadow: 0 0 15px ${color}; color: black;">
                            <i class="fas fa-subway"></i>
                        </div>
                        <div style="font-size: 0.6rem; color: ${color}; margin-top: 5px; white-space: nowrap; background: rgba(0,0,0,0.8); padding: 2px 5px; border-radius: 4px;">${escapeHtml(t.name)} (PK ${t.pk})</div>
                    </div>
                `;
    }).join('')}
        </div>
        
        <!-- Digital Board -->
        <div class="digital-station-board">
            <h4 style="color: #00f2ff; margin-bottom: 10px; border-bottom: 1px solid rgba(0, 242, 255, 0.2); padding-bottom: 5px;">JADVAL (Online)</h4>
            <div style="display: grid; gap: 10px; max-height: 200px; overflow-y: auto;">
                ${trains.map(t => `
                     <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border-left: 2px solid ${t.status === 'delayed' ? '#e74c3c' : '#2ecc71'}">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-train" style="color: rgba(255,255,255,0.5);"></i>
                            <div>
                                <div style="font-weight: bold; color: white; font-size: 0.9rem;">${escapeHtml(t.name)}</div>
                                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">${t.route}</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                             <div style="font-family: monospace; font-size: 1.1rem; color: #ffd700;">${t.time}</div>
                             <div style="font-size: 0.7rem; color: ${t.status === 'delayed' ? '#e74c3c' : '#2ecc71'};">${t.status === 'delayed' ? 'KECHIKMOQDA' : 'O\'Z VAQTIDA'}</div>
                        </div>
                     </div>
                `).join('')}
                ${trains.length === 0 ? '<div style="padding:10px; color:rgba(255,255,255,0.3); font-style:italic;">Bugungi reyslar yo\'q</div>' : ''}
            </div>
        </div>
    `;

    container.innerHTML = radarHTML;
}

window.initTrainRadar = function () {
    // Current user departments is array
    if (currentUser.bolinmalar && currentUser.bolinmalar.length > 0) {
        renderTrainRadarWidget(currentUser.bolinmalar[0]);
    } else if (currentUser.departments && currentUser.departments.length > 0) {
        // If department array is used like 'bolinma1'
        renderTrainRadarWidget(currentUser.departments.find(d => d.startsWith('bolinma')));
    }
}

// Ensure initSubdivisionFeatures is available globally
// initSubdivisionFeatures moved to line 1008 area

// --- EDITOR EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', function () {
    // Text Editor Save Button
    const saveTextBtn = document.getElementById('saveTextFileBtn');
    if (saveTextBtn) {
        saveTextBtn.addEventListener('click', saveTextFile);
    }

    // Text Editor Close Buttons
    const closeTextBtn = document.getElementById('closeTextEditorBtn');
    const cancelTextBtn = document.getElementById('cancelTextEditBtn');

    function closeTextEditor() {
        const win = document.getElementById('text-editor-window');
        if (win) {
            win.classList.remove('active');
            win.style.display = 'none';
        }

        // Remove overlay only if no other windows active
        const activeWindows = document.querySelectorAll('.department-window.active');
        if (activeWindows.length === 0) {
            document.getElementById('department-overlay').classList.remove('active');
        }
    }

    if (closeTextBtn) closeTextBtn.addEventListener('click', closeTextEditor);
    if (cancelTextBtn) cancelTextBtn.addEventListener('click', closeTextEditor);
});

// ============ DEPARTMENT SECTION RENDERERS ============

// C) Iqtisod Section (Economy - PU-74)
function renderEconomySection(windowElement, bolinmaId) {
    // 1. Clear specific container if exists
    const existingView = windowElement.querySelector('#economy-journals-view');
    if (existingView) existingView.remove();

    // 2. Create View Container
    const view = document.createElement('div');
    view.id = 'economy-journals-view';
    view.className = 'department-section-view';
    view.style.padding = '20px';
    view.style.marginTop = '20px';
    view.style.background = 'rgba(255,255,255,0.05)';
    view.style.borderRadius = '15px';

    view.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #00c6ff; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-wallet"></i> 
                Iqtisodiy Ko'rsatkichlar va Analitika
            </h3>
            <div style="display: flex; gap: 10px;">
                <button class="control-btn" onclick="if(window.openTimesheetDepartmentSummary) window.openTimesheetDepartmentSummary(); else alert('Tabel moduli yuklanmoqda...');" 
                    style="background: linear-gradient(135deg, #9b59b6, #8e44ad); padding: 10px 20px; font-size: 1rem; border: none; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3); transition: transform 0.2s;">
                    <i class="fas fa-check-double"></i> 
                    Tabellarni Tasdiqlash
                </button>
                <button class="control-btn pu74-main-btn" onclick="openPU74Window('${bolinmaId}')" 
                    style="background: linear-gradient(135deg, #00c6ff, #0072ff); padding: 10px 20px; font-size: 1rem; border: none; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0, 198, 255, 0.3); transition: transform 0.2s;">
                    <i class="fas fa-clipboard-list"></i> 
                    PU-74 Jurnalini Ochish
                </button>
            </div>
        </div>
        
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden; box-shadow: inset 0 0 20px rgba(46, 204, 113, 0.05);">
                <div style="position: absolute; right: -10px; top: -10px; font-size: 4.5rem; opacity: 0.05; color: #2ecc71;"><i class="fas fa-coins"></i></div>
                <div style="font-size: 0.9rem; color: #aaa;">Ish haqi fondi (Oylik Reja)</div>
                <div style="font-size: 1.6rem; font-weight: bold; color: white; margin-top: 5px; font-family: monospace;">1.2 mlrd <span style="font-size: 0.9rem; color: #64748b;">UZS</span></div>
                <div style="font-size: 0.85rem; color: #2ecc71; margin-top: 8px; background: rgba(46, 204, 113, 0.1); padding: 4px 8px; border-radius: 4px; display: inline-block;"><i class="fas fa-arrow-up"></i> 100% Ta'minlangan</div>
            </div>
             <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden; box-shadow: inset 0 0 20px rgba(231, 76, 60, 0.05);">
                <div style="position: absolute; right: -10px; top: -10px; font-size: 4.5rem; opacity: 0.05; color: #e74c3c;"><i class="fas fa-clock"></i></div>
                <div style="font-size: 0.9rem; color: #aaa;">Ortiqcha ishlangan vaqt (Overtime)</div>
                <div style="font-size: 1.6rem; font-weight: bold; color: white; margin-top: 5px; font-family: monospace;">+142 <span style="font-size: 0.9rem; color: #64748b;">soat</span></div>
                <div style="font-size: 0.85rem; color: #e74c3c; margin-top: 8px; background: rgba(231, 76, 60, 0.1); padding: 4px 8px; border-radius: 4px; display: inline-block;"><i class="fas fa-exclamation-triangle"></i> Byudjetga ta'sir: 4.5 mln</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden; box-shadow: inset 0 0 20px rgba(52, 152, 219, 0.05);">
                <div style="position: absolute; right: -10px; top: -10px; font-size: 4.5rem; opacity: 0.05; color: #3498db;"><i class="fas fa-user-tie"></i></div>
                <div style="font-size: 0.9rem; color: #aaa;">Vakansiyalar iqtisodi (Tejalgan)</div>
                <div style="font-size: 1.6rem; font-weight: bold; color: white; margin-top: 5px; font-family: monospace;">24.5 mln <span style="font-size: 0.9rem; color: #64748b;">UZS</span></div>
                <div style="font-size: 0.85rem; color: #3498db; margin-top: 8px; background: rgba(52, 152, 219, 0.1); padding: 4px 8px; border-radius: 4px; display: inline-block;"><i class="fas fa-arrow-down"></i> Jami 3 ta bo'sh ish o'rni</div>
            </div>
        </div>

        <!-- Overtime Analytics Chart Area -->
        <h4 style="color: rgba(255,255,255,0.8); margin-bottom: 15px; font-size: 1.1rem;"><i class="fas fa-chart-bar" style="color: #00f2ff;"></i> Bo'limlar bo'yicha Overtime va Tabel Tahlili</h4>
        <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <!-- Bar 1 -->
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 140px; color: #cbd5e1; font-size: 0.9rem; font-weight: 500;">Ishlab chiqarish</div>
                    <div style="flex: 1; background: rgba(255,255,255,0.05); height: 16px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="background: linear-gradient(90deg, #c0392b, #e74c3c); width: 65%; height: 100%; box-shadow: 0 0 10px rgba(231, 76, 60, 0.5); position: relative;">
                            <span style="position: absolute; right: 5px; top: 0; font-size: 0.7rem; line-height: 16px; color: white; font-weight: bold;">65 soat</span>
                        </div>
                    </div>
                </div>
                <!-- Bar 2 -->
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 140px; color: #cbd5e1; font-size: 0.9rem; font-weight: 500;">Mexanika bo'limi</div>
                    <div style="flex: 1; background: rgba(255,255,255,0.05); height: 16px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="background: linear-gradient(90deg, #d35400, #f39c12); width: 42%; height: 100%; box-shadow: 0 0 10px rgba(243, 156, 18, 0.5); position: relative;">
                            <span style="position: absolute; right: 5px; top: 0; font-size: 0.7rem; line-height: 16px; color: white; font-weight: bold;">42 soat</span>
                        </div>
                    </div>
                </div>
                <!-- Bar 3 -->
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 140px; color: #cbd5e1; font-size: 0.9rem; font-weight: 500;">Dispetcherlik</div>
                    <div style="flex: 1; background: rgba(255,255,255,0.05); height: 16px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="background: linear-gradient(90deg, #2980b9, #3498db); width: 20%; height: 100%; box-shadow: 0 0 10px rgba(52, 152, 219, 0.5); position: relative;">
                            <span style="position: absolute; right: 5px; top: 0; font-size: 0.7rem; line-height: 16px; color: white; font-weight: bold;">20 soat</span>
                        </div>
                    </div>
                </div>
                <!-- Bar 4 -->
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 140px; color: #cbd5e1; font-size: 0.9rem; font-weight: 500;">Metrologiya</div>
                    <div style="flex: 1; background: rgba(255,255,255,0.05); height: 16px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="background: linear-gradient(90deg, #27ae60, #2ecc71); width: 15%; height: 100%; box-shadow: 0 0 10px rgba(46, 204, 113, 0.5); position: relative;">
                            <span style="position: absolute; right: 5px; top: 0; font-size: 0.7rem; line-height: 16px; color: white; font-weight: bold;">15 soat</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="economy-info-box" style="padding: 15px; background: rgba(155, 89, 182, 0.1); border-left: 3px solid #9b59b6; border-radius: 5px; display: flex; align-items: center; justify-content: space-between;">
            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 0.95rem;">
                <i class="fas fa-stamp" style="color: #9b59b6; margin-right: 5px;"></i> 
                Barcha bo'limlardan kelgan <strong>Tabel (Ishchi vaqtlari)</strong> byudjetga ta'sirini tekshiring va markazlashgan holda tasdiqlang.
            </p>
        </div>
    `;

    let body = windowElement.querySelector('.department-body') || windowElement.querySelector('.window-content') || windowElement;

    // Insert before file list if possible, or append
    const fileList = body.querySelector('.files-area-wrapper') || body.querySelector('.file-management');
    if (fileList) {
        body.insertBefore(view, fileList);
    } else {
        body.appendChild(view);
    }
}


// B) Ishlab Chiqarish Section (Production) - Already defined above at line 4113


// D) Dispatcher Section - Stub
// (Redundant stub removed, using definition at line 4371)


// E) Metrology Section - Stub
// Redundant stubs removed as they are defined in their respective module files

// F) Mechanics Section - Dashboard
// F) Mechanics Section - Complete Remade Subdivision Dashboard
function renderMechanicsSection(windowElement, bolinmaId) {
    console.log('Rendering Remade Mechanics Dashboard for', bolinmaId);

    // Save global safe bolinmaId reference to avoid HTML attribute single-quote syntax errors (e.g. 1-bo'linma)
    window._currentMexanikaBolinmaId = bolinmaId || 'mexanika';

    // Initial load handling to prevent empty UI
    if (!window._mechanicsDataLoaded && typeof initMechanicsData === 'function') {
        const loadingHtml = `<div id="mechanics-section-view" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:50px 20px; color:#38bdf8; background: rgba(15, 23, 42, 0.7); border-radius: 20px; border: 1px solid rgba(56, 189, 248, 0.25);">
            <i class="fas fa-truck-monster fa-spin" style="font-size:3rem; margin-bottom:16px; color: #38bdf8; filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.6));"></i>
            <h3 style="color:white; font-size: 1.2rem; margin: 0; font-weight: 700;">Mexanika va Transport Bo'limi yuklanmoqda...</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px;">Iltimos, bir oz kuting</p>
        </div>`;
        const body = windowElement.querySelector('.department-body') || windowElement.querySelector('.window-content') || windowElement;
        const fileList = body.querySelector('.files-area-wrapper') || body.querySelector('.file-management');

        let loadingView = document.createElement('div');
        loadingView.innerHTML = loadingHtml;
        loadingView = loadingView.firstElementChild;

        const existingView = windowElement.querySelector('#mechanics-section-view');
        if (existingView) existingView.replaceWith(loadingView);
        else if (fileList) body.insertBefore(loadingView, fileList);
        else body.appendChild(loadingView);

        initMechanicsData().then(() => {
            renderMechanicsSection(windowElement, bolinmaId);
        });
        return;
    }

    const existingView = windowElement.querySelector('#mechanics-section-view');
    if (existingView) existingView.remove();

    // Data filtering
    const data = window.waybillData || { vehicles: [], orders: [] };
    let deptVehicles = (data.vehicles || []).filter(v => 
        v.departmentId === bolinmaId || v.bolinma_id === bolinmaId
    );
    let isFallbackVehicles = false;
    if (deptVehicles.length === 0) {
        deptVehicles = data.vehicles && data.vehicles.length > 0 ? data.vehicles : [...(window.DEFAULT_FALLBACK_VEHICLES || [])];
        isFallbackVehicles = true;
    }

    let deptOrders = (data.orders || []);
    if (bolinmaId && bolinmaId !== 'mexanika') {
        deptOrders = deptOrders.filter(o => o.deptName && (o.deptName.includes(bolinmaId) || o.dept_name?.includes(bolinmaId)));
    }

    // Stats calculation
    const totalVehicles = deptVehicles.length;
    const freeVehicles = deptVehicles.filter(v => v.status === 'free' || (!v.status && v.status !== 'busy')).length;
    const activeVehicles = deptVehicles.filter(v => v.status === 'busy').length;
    const repairVehicles = deptVehicles.filter(v => v.status === 'repair' || v.status === 'maintenance').length;

    const view = document.createElement('div');
    view.id = 'mechanics-section-view';
    view.className = 'department-section-view';
    view.style.marginTop = '15px';

    // Global tab switcher helper
    window.switchMexanikaSubTab = function(tabName, btnEl) {
        const parentView = btnEl.closest('#mechanics-section-view');
        if (!parentView) return;
        parentView.querySelectorAll('.mex-tab-btn').forEach(b => {
            b.style.background = 'rgba(255, 255, 255, 0.05)';
            b.style.color = '#94a3b8';
            b.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        btnEl.style.background = 'linear-gradient(135deg, #0284c7, #38bdf8)';
        btnEl.style.color = '#ffffff';
        btnEl.style.borderColor = '#38bdf8';

        parentView.querySelectorAll('.mex-tab-content').forEach(c => c.style.display = 'none');
        const target = parentView.querySelector(`#mex-tab-content-${tabName}`);
        if (target) target.style.display = 'block';
    };

    // Vehicle cards HTML
    let vehicleCardsHtml = deptVehicles.map(v => {
        let statusColor = v.status === 'free' ? '#2ecc71' : (v.status === 'busy' ? '#ef4444' : '#f59e0b');
        let statusBg = v.status === 'free' ? 'rgba(46, 204, 113, 0.15)' : (v.status === 'busy' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)');
        let statusText = v.status === 'free' ? "Bo'sh" : (v.status === 'busy' ? "Ishda" : "Ta'mirda");

        return `
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid ${statusColor}40; border-radius: 16px; padding: 18px; position: relative; transition: all 0.25s ease;"
                 onmouseover="this.style.borderColor='${statusColor}90'; this.style.transform='translateY(-3px)'" 
                 onmouseout="this.style.borderColor='${statusColor}40'; this.style.transform='translateY(0)'">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div style="background: rgba(56, 189, 248, 0.1); padding: 10px; border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.2);">
                        <i class="fas fa-truck-pickup" style="color: #38bdf8; font-size: 1.2rem;"></i>
                    </div>
                    <span style="background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}50; padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800; display: flex; align-items: center; gap: 5px;">
                        <span style="width: 6px; height: 6px; background: ${statusColor}; border-radius: 50%;"></span>
                        ${statusText}
                    </span>
                </div>

                <h4 style="margin: 0 0 2px 0; color: white; font-size: 1.1rem; font-weight: 700;">${escapeHtml(v.name)}</h4>
                <p style="margin: 0 0 12px 0; color: #38bdf8; font-family: monospace; font-size: 0.85rem; font-weight: 600;">${v.number}</p>

                <div style="background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 10px; font-size: 0.8rem; color: #94a3b8; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.04);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>Garaj №:</span> <span style="color: #e2e8f0; font-weight: 600;">${v.garage || '---'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Yoqilg'i normasi:</span> <span style="color: #e2e8f0; font-weight: 600;">${v.fuelNorm || v.fuel_norm || 10} L/100km</span>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button onclick="event.stopPropagation(); if(window.openWaybillWindow) window.openWaybillWindow(window._currentMexanikaBolinmaId)" 
                        style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; padding: 7px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                        <i class="fas fa-file-invoice"></i> Yo'l Varaqasi
                    </button>
                    <button onclick="event.stopPropagation(); if(window.openPrintableTipovaya712) window.openPrintableTipovaya712('${v.id}')" 
                        style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.35); color: #c084fc; padding: 7px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                        <i class="fas fa-print"></i> Putovka 712
                    </button>
                </div>
            </div>`;
    }).join('');

    // Orders table HTML
    let ordersHtml = deptOrders.length === 0 ? 
        `<tr><td colspan="6" style="padding: 25px; text-align: center; color: #64748b; font-style: italic; font-size: 0.85rem;">Mavjud buyurtmalar mavjud emas</td></tr>` :
        deptOrders.map(o => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                <td style="padding: 12px 14px; color: #94a3b8; font-size: 0.82rem;">${o.date || '---'}</td>
                <td style="padding: 12px 14px; color: #38bdf8; font-weight: 700; font-size: 0.85rem;">${o.deptName || o.dept_name || "Bo'linma"}</td>
                <td style="padding: 12px 14px; color: white; font-weight: 600; font-size: 0.85rem;">${o.vehicleName || o.vehicle_name || 'Texnika'}</td>
                <td style="padding: 12px 14px; color: #cbd5e1; font-size: 0.82rem;">${o.task}</td>
                <td style="padding: 12px 14px;">
                    <span style="background: ${o.status === 'approved' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(243, 156, 18, 0.15)'}; color: ${o.status === 'approved' ? '#2ecc71' : '#f39c12'}; padding: 3px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 700;">
                        ${o.status === 'approved' ? 'Tasdiqlandi' : 'Kutilmoqda'}
                    </span>
                </td>
                <td style="padding: 12px 14px; text-align: right;">
                    ${o.status !== 'approved' ? `<button onclick="if(window.approveOrder) window.approveOrder(${o.id})" style="background: #2ecc71; border: none; color: white; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 700;"><i class="fas fa-check"></i></button>` : ''}
                </td>
            </tr>`).join('');

    view.innerHTML = `
        <div style="padding: 22px; background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); backdrop-filter: blur(15px);">
            
            <!-- Main Header Banner -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h3 style="margin: 0; color: white; display: flex; align-items: center; gap: 10px; font-size: 1.3rem; font-weight: 800;">
                        <span style="background: rgba(56, 189, 248, 0.15); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.3);">
                            <i class="fas fa-truck-monster" style="color: #38bdf8;"></i>
                        </span>
                        Mexanika va Transport Bo'limi
                        <span style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 20px; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3);">
                            ${bolinmaId || 'PCH Garaj'}
                        </span>
                    </h3>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="if(window.openAddVehicleModal) window.openAddVehicleModal()" 
                        style="background: linear-gradient(135deg, #2ecc71, #27ae60); border: none; color: white; padding: 8px 14px; border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 6px; font-size: 0.82rem; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);">
                        <i class="fas fa-plus-circle"></i> Texnika Qo'shish
                    </button>
                    <button onclick="if(window.openOrderWindow) window.openOrderWindow(window._currentMexanikaBolinmaId)" 
                        style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: white; padding: 8px 14px; border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 6px; font-size: 0.82rem;">
                        <i class="fas fa-shipping-fast"></i> Buyurtma Berish
                    </button>
                </div>
            </div>

            <!-- Summary KPI Pill Bar -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 20px;">
                <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.6rem; font-weight: 900; color: white;">${totalVehicles}</div>
                    <div style="color: #94a3b8; font-size: 0.75rem; font-weight: 600;">Jami Texnikalar</div>
                </div>
                <div style="background: rgba(46, 204, 113, 0.08); border: 1px solid rgba(46, 204, 113, 0.3); padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.6rem; font-weight: 900; color: #2ecc71;">${freeVehicles}</div>
                    <div style="color: #2ecc71; font-size: 0.75rem; font-weight: 600;">Bo'sh (Tayyor)</div>
                </div>
                <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.6rem; font-weight: 900; color: #ef4444;">${activeVehicles}</div>
                    <div style="color: #ef4444; font-size: 0.75rem; font-weight: 600;">Ishda / Band</div>
                </div>
                <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.6rem; font-weight: 900; color: #f59e0b;">${repairVehicles}</div>
                    <div style="color: #f59e0b; font-size: 0.75rem; font-weight: 600;">Ta'mirda / TO</div>
                </div>
            </div>

            <!-- Sub-Tab Navigation Bar -->
            <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; overflow-x: auto;">
                <button class="mex-tab-btn" onclick="switchMexanikaSubTab('fleet', this)" style="background: linear-gradient(135deg, #0284c7, #38bdf8); color: white; border: 1px solid #38bdf8; padding: 8px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-truck"></i> Texnikalar Parki
                </button>
                <button class="mex-tab-btn" onclick="switchMexanikaSubTab('waybills', this)" style="background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-file-invoice"></i> Yo'l Varaqalar & Putovka 712
                </button>
                <button class="mex-tab-btn" onclick="switchMexanikaSubTab('repairs', this)" style="background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-wrench"></i> TO & Ta'mir Jurnali
                </button>
                <button class="mex-tab-btn" onclick="switchMexanikaSubTab('parts', this)" style="background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-boxes"></i> Ehtiyot Qismlar
                </button>
                <button class="mex-tab-btn" onclick="switchMexanikaSubTab('fuel', this)" style="background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-gas-pump"></i> Yoqilg'i Hisobi
                </button>
            </div>

            <!-- Tab Content 1: Fleet Grid -->
            <div id="mex-tab-content-fleet" class="mex-tab-content" style="display: block;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
                    ${vehicleCardsHtml}
                </div>
            </div>

            <!-- Tab Content 2: Waybills & Putovka -->
            <div id="mex-tab-content-waybills" class="mex-tab-content" style="display: none;">
                <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                    <button onclick="if(window.openWaybillWindow) window.openWaybillWindow(window._currentMexanikaBolinmaId)" 
                        style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-plus"></i> Yangi Yo'l Varaqasi
                    </button>
                    <button onclick="if(window.openPrintableTipovaya712) window.openPrintableTipovaya712()" 
                        style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-print"></i> Tipovaya f. № 712 Chop Etish
                    </button>
                </div>

                <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px;">
                    <h4 style="margin: 0 0 12px 0; color: white; font-size: 0.95rem;">Kelib tushgan buyurtmalar hamda varaqalar</h4>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                            <thead>
                                <tr style="color: #64748b; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem; text-transform: uppercase;">
                                    <th style="padding: 10px 12px;">Sana</th>
                                    <th style="padding: 10px 12px;">Bo'linma</th>
                                    <th style="padding: 10px 12px;">Texnika</th>
                                    <th style="padding: 10px 12px;">Vazifa</th>
                                    <th style="padding: 10px 12px;">Holat</th>
                                    <th style="padding: 10px 12px; text-align: right;">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>${ordersHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tab Content 3: TO & Repairs -->
            <div id="mex-tab-content-repairs" class="mex-tab-content" style="display: none;">
                <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                    <button onclick="if(window.openTechnicalMaintenanceWindow) window.openTechnicalMaintenanceWindow(window._currentMexanikaBolinmaId)" 
                        style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-wrench"></i> Texnik Xizmat (TO-1/2/3)
                    </button>
                    <button onclick="if(window.openRepairJournal) window.openRepairJournal(window._currentMexanikaBolinmaId)" 
                        style="background: linear-gradient(135deg, #ea580c, #f97316); color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-tools"></i> Ta'mir Jurnalini Ochish
                    </button>
                </div>
                <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px; text-align: center; color: #94a3b8; font-size: 0.88rem;">
                    <i class="fas fa-info-circle text-amber-400" style="margin-right: 6px;"></i> TO va ta'mir modullarini yuqoridagi tugmalar orqali oching.
                </div>
            </div>

            <!-- Tab Content 4: Spare Parts -->
            <div id="mex-tab-content-parts" class="mex-tab-content" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="margin: 0; color: white; font-size: 0.95rem;">Ehtiyot Qismlar Ombori</h4>
                    <button onclick="if(window.openSpareParts) window.openSpareParts(window._currentMexanikaBolinmaId)" 
                        style="background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-boxes"></i> Ombor Modalini Ochish
                    </button>
                </div>
                <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px; text-align: center; color: #94a3b8; font-size: 0.88rem;">
                    Ehtiyot qismlar zaxirasi va qoldiqlarini boshqarish uchun ombor modalini oching.
                </div>
            </div>

            <!-- Tab Content 5: Fuel -->
            <div id="mex-tab-content-fuel" class="mex-tab-content" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="margin: 0; color: white; font-size: 0.95rem;">Yoqilg'i Sarfi va Normasi</h4>
                    <button onclick="if(window.openFuelReport) window.openFuelReport(window._currentMexanikaBolinmaId)" 
                        style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-gas-pump"></i> Yoqilg'i Hisobotini Ochish
                    </button>
                </div>
                <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px; text-align: center; color: #94a3b8; font-size: 0.88rem;">
                    Barcha texnikalarning bak qoldiqlari va 100km me'yoriy sarfi nazorati.
                </div>
            </div>

        </div>
    `;

    let body = windowElement.querySelector('.department-body') || windowElement.querySelector('.window-content') || windowElement;
    const fileList = body.querySelector('.files-area-wrapper') || body.querySelector('.file-management');
    if (fileList) body.insertBefore(view, fileList);
    else body.appendChild(view);
}

// Make functions globally accessible
window.renderMechanicsSection = renderMechanicsSection;
window.renderMexanikaSection = renderMechanicsSection;


// --- MEHNAT SECTION ---
function renderMehnatSection(windowElement, bolinmaId) {
    const contentDiv = windowElement.querySelector('.window-content') || windowElement.querySelector('.department-body');
    if (!contentDiv) return;

    // Fayl boshqaruv panellarini yashirish (safety o'z UI'sini ko'rsatadi)
    const fileMgmt = contentDiv.querySelector('.file-management');
    if (fileMgmt) fileMgmt.style.display = 'none';
    const filesTable = contentDiv.querySelector('.files-table');
    if (filesTable) filesTable.style.display = 'none';
    const folderMgmt = contentDiv.querySelector('.folder-management');
    if (folderMgmt) folderMgmt.style.display = 'none';

    // Agar renderSafetyDashboard mavjud bo'lsa — uni chaqirish
    const fn = typeof renderSafetyDashboard === 'function' ? renderSafetyDashboard
        : (window.renderSafetyDashboard || null);

    if (fn) {
        // Avvalgi safety view ni tozalash
        const old = contentDiv.querySelector('#safety-dashboard-view');
        if (old) old.remove();
        fn(windowElement, bolinmaId);
    } else {
        // safety.js yuklanmagan — oldingi ko'rinishdagi fallback UI
        let fallback = contentDiv.querySelector('#safety-dashboard-view');
        if (!fallback) {
            fallback = document.createElement('div');
            fallback.id = 'safety-dashboard-view';
            contentDiv.insertBefore(fallback, contentDiv.firstChild);
        }
        fallback.innerHTML = `
            <div style="padding: 30px; color: white; height: 100%; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <!-- Header Section -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="img/logo.png" alt="Logo" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'">
                        <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: white;">Mehnat Muhofazasi (Safety)</h2>
                    </div>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; z-index: 100;">
                        <button onclick="window.openSafetyWorkerList && window.openSafetyWorkerList('${bolinmaId}')" 
                            style="background-color: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                            <i class="fas fa-users"></i> Xodimlar Ro'yxati
                        </button>
                        <button onclick="window.openSafetyTNU19 && window.openSafetyTNU19('${bolinmaId}')" 
                            style="background-color: #2c3e50; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                            <i class="fas fa-file-alt"></i> TNU-19 Jurnal
                        </button>
                        <button onclick="window.openSafetyTNU20 && window.openSafetyTNU20('${bolinmaId}')" 
                            style="background-color: #9b59b6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                            <i class="fas fa-graduation-cap"></i> TNU-20 Jurnal
                        </button>
                    </div>
                </div>
                <!-- Stats -->
                <div id="safety-stats"></div>
                <!-- Main Content -->
                <div id="safety-main-view" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px;">
                    <div style="text-align: center; color: rgba(255,255,255,0.4);">
                        <i class="fas fa-shield-alt" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                        <p>Xavfsizlik moduli yuklanmagan</p>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * SMART PCH - GLOBAL SEARCH SYSTEM
 */
function initGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const resultsDropdown = document.getElementById('searchResults');

    if (!input || !resultsDropdown) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            resultsDropdown.classList.remove('active');
            return;
        }

        const results = searchEverything(query);
        displaySearchResults(results, resultsDropdown);
    });

    // Close search on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.global-search-container')) {
            resultsDropdown.classList.remove('active');
        }
    });
}

function searchEverything(query) {
    let results = [];

    // 1. Search Workers
    if (typeof workersData !== 'undefined') {
        workersData.forEach(worker => {
            if (worker.name.toLowerCase().includes(query) || worker.role.toLowerCase().includes(query)) {
                results.push({ type: 'worker', name: worker.name, meta: worker.role + ' - ' + worker.bolinma, icon: 'fa-user-tie' });
            }
        });
    }

    // 2. Search Trains
    if (typeof trainsData !== 'undefined') {
        trainsData.forEach(train => {
            if (train.number.toLowerCase().includes(query) || train.route.toLowerCase().includes(query)) {
                results.push({ type: 'train', name: train.number, meta: train.route, icon: 'fa-train' });
            }
        });
    }

    // 3. Search Sections/Departments
    const allSections = [
        { name: 'Xodimlar', icon: 'fa-users-gear' },
        { name: 'Bugalteriya', icon: 'fa-calculator' },
        { name: 'Ishlab chiqarish', icon: 'fa-industry' },
        { name: 'Mexanika', icon: 'fa-gears' },
        { name: 'Iqtisodiy tahlil', icon: 'fa-chart-line' },
        { name: 'Metrologiya', icon: 'fa-scale-balanced' },
        { name: 'Mehnat muhofazasi', icon: 'fa-shield-halved' },
        { name: 'Dispetcher', icon: 'fa-tower-broadcast' }
    ];
    allSections.forEach(section => {
        if (section.name.toLowerCase().includes(query)) {
            results.push({ type: 'section', name: section.name, meta: 'Bo\'lim', icon: section.icon });
        }
    });

    return results.slice(0, 8); // Limit to top 8
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="search-item"><div class="search-item-info"><span class="search-item-name">Hech narsa topilmadi</span></div></div>';
    } else {
        container.innerHTML = results.map(item => `
            <div class="search-item" onclick="handleSearchClick('${item.type}', '${escapeHtml(item.name)}')">
                <i class="fas ${item.icon}"></i>
                <div class="search-item-info">
                    <span class="search-item-name">${escapeHtml(item.name)}</span>
                    <span class="search-item-meta">${item.meta}</span>
                </div>
            </div>
        `).join('');
    }
    container.classList.add('active');
}

function handleSearchClick(type, name) {
    showToast(`Navigatsiya: ${name}`, 'info');
    document.getElementById('searchResults').classList.remove('active');
    document.getElementById('globalSearchInput').value = '';

    if (type === 'train') {
        if (typeof openRailwayMapModal === 'function') openRailwayMapModal();
    }
}

// --- MOBILE MENU LOGIC ---
function initMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Create toggle button if it doesn't exist
    if (!document.querySelector('.mobile-menu-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; z-index: 2100;
            display: none; /* Only visible via CSS Media Query */
        `;
        document.body.appendChild(toggleBtn);

        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-active');
            updateSidebarOverlay();
        };
    }

    // Create overlay if it doesn't exist
    if (!document.querySelector('.sidebar-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        overlay.onclick = () => {
            sidebar.classList.remove('mobile-active');
            updateSidebarOverlay();
        };
    }

    function updateSidebarOverlay() {
        const overlay = document.querySelector('.sidebar-overlay');
        const isActive = sidebar.classList.contains('mobile-active');
        if (overlay) {
            if (isActive) overlay.classList.add('active');
            else overlay.classList.remove('active');
        }
        if (window.syncMobileBottomBar) window.syncMobileBottomBar();
    }

    // Close menu on clicks outside or on menu items
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !e.target.closest('.mobile-menu-toggle')) {
            sidebar.classList.remove('mobile-active');
            updateSidebarOverlay();
        }
    });

    // Close menu when clicking sidebar items on mobile
    sidebar.addEventListener('click', (e) => {
        if (e.target.closest('li') && window.innerWidth <= 768) {
            setTimeout(() => {
                sidebar.classList.remove('mobile-active');
                updateSidebarOverlay();
            }, 300);
        }
    });
}

function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

async function submitAddUser() {
    const full_name = document.getElementById('new_full_name').value;
    const username = document.getElementById('new_username').value;
    const password = document.getElementById('new_password').value;
    const role = document.getElementById('new_role').value;

    let depts = [];
    let bolinmalar = [];

    if (role === 'admin') {
        depts = ['ishlab-chiqarish', 'xodimlar', 'bugalteriya', 'iqtisod', 'mexanika', 'mehnat-muhofazasi', 'dispetcher', 'metrologiya'];
    } else if (role === 'bolinma') {
        const selectedBol = document.getElementById('new_bolinmalar').value;
        if (selectedBol) bolinmalar.push(selectedBol);
    } else if (role === 'department') {
        const checkBoxes = document.querySelectorAll('input[name="new_depts"]:checked');
        checkBoxes.forEach(cb => depts.push(cb.value));
        if (depts.length === 0) {
            showToast("Kamida bitta bo'limni tanlang!", "warning");
            return;
        }
    }

    try {
        await SmartUtils.fetchAPI('/auth/users', {
            method: 'POST',
            body: JSON.stringify({
                full_name,
                username,
                password,
                role,
                departments: depts,
                bolinmalar,
                status: 'active'
            })
        });

        showToast("Foydalanuvchi muvaffaqiyatli qo'shildi", "success");
        document.getElementById('addUserModal').classList.remove('active');
        document.getElementById('addUserForm').reset();

        // Reset the selects display just in case
        document.getElementById('bolinma_group').style.display = 'block';
        document.getElementById('dept_group').style.display = 'none';

        loadAdminUsersList();
    } catch (err) {
        showToast("Xatolik: " + err.message, "error");
    }
}

// Initializing settings
document.addEventListener('DOMContentLoaded', () => {
    initGlobalSearch();
    initMobileMenu();
    initNavTools();
});

// Navbar Tools Toggle Logic
function initNavTools() {
    const toggleBtn = document.getElementById('navToolsToggle');
    const container = document.getElementById('navToolsContainer');

    if (!toggleBtn || !container || toggleBtn.dataset.initialized) return;
    toggleBtn.dataset.initialized = "true";

    // Use a reusable toggle function
    const toggleMenu = (e) => {
        if (e) e.stopPropagation();
        toggleBtn.classList.toggle('active');
        container.classList.toggle('active');
    };

    // Export to window for inline onclick fallback
    window.toggleNavTools = toggleMenu;

    toggleBtn.addEventListener('click', toggleMenu);

    // Close on external click
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target) && !toggleBtn.contains(e.target)) {
            toggleBtn.classList.remove('active');
            container.classList.remove('active');
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleBtn.classList.remove('active');
            container.classList.remove('active');
        }
    });
}

// Final exports
window.renderMehnatSection = renderMehnatSection;
window.openAddUserModal = openAddUserModal;
window.submitAddUser = submitAddUser;
window.openDepartmentWindow = openDepartmentWindow;
window.openBolinmaSectionWindow = openBolinmaSectionWindow;
window.openJournal = openJournal;



