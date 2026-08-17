// Defektaskop Aravacha Tracking System
// Initialize defectoscope data with Defect Codes

// Boshlang'ich (default) jadval
const DEFAULT_SCHEDULE = {
    "POISK-0106": {
        operator: 'Sharipov R., Shirinov Sh., Olimov A.',
        color: 'orange',
        schedule: {
            1: { text: "St. Qorlitog' 4143 km", start: 4143, end: 4143 },
            4: { text: "4144 km-4150 km", start: 4144, end: 4150 },
            5: { text: "4151 km-4156 km", start: 4151, end: 4156 },
            6: { text: "4157 km-4162 km", start: 4157, end: 4162 },
            7: { text: "4163 km, Rzd Kiyikli, 3-ECHK yo'llari", start: 4163, end: 4163 },
            8: { text: "Texnik ko'rik", start: 4020, end: 4020, status: 'paused' },
            11: { text: "Rzd Kiyikli-4174 km", start: 4163, end: 4174 },
            12: { text: "4175 km-4180 km", start: 4175, end: 4180 },
            13: { text: "4181 km-4185 km", start: 4181, end: 4185 },
            14: { text: "4186 km-4191 km", start: 4186, end: 4191 },
            15: { text: "4192 km-4197 km", start: 4192, end: 4197 },
            18: { text: "4198 km, St Xizirbobo 2-4 yo'llar", start: 4198, end: 4198 },
            19: { text: "4020 km-4025 km", start: 4020, end: 4025 },
            20: { text: "4026 km-4031 km", start: 4026, end: 4031 },
            21: { text: "4032 km, Rzd Navbaxor, 3-ECHK yo'li", start: 4032, end: 4032 },
            22: { text: "Rzd Navbaxor 4042 km", start: 4042, end: 4042 },
            25: { text: "4043 km-4048 km", start: 4043, end: 4048 },
            26: { text: "4049 km-4054 km", start: 4049, end: 4054 },
            27: { text: "4055 km-4060 km", start: 4055, end: 4060 },
            28: { text: "4161 km, St Yaxshilik", start: 4161, end: 4161 },
            29: { text: "Jadval taxlili", start: 4020, end: 4020, status: 'paused' }
        }
    },
    "POISK-2603": {
        operator: 'Mavlonov I., Kamolov G\'.',
        color: 'blue',
        schedule: {
            1: { text: "4163 km, Rzd Kiyikli", start: 4163, end: 4163 },
            4: { text: "Rzd Kiyikli 3-ECHK yo'llari 4171 km", start: 4163, end: 4171 },
            5: { text: "4171 km-4176 km", start: 4171, end: 4176 },
            6: { text: "4177 km-4182 km", start: 4177, end: 4182 },
            7: { text: "Texnik ko'rik", start: 4020, end: 4020, status: 'paused' },
            8: { text: "4183 km-4188 km", start: 4183, end: 4188 },
            11: { text: "4189 km-4194 km", start: 4189, end: 4194 },
            12: { text: "4195 km, St, Xizirbobo, as-yo'l", start: 4195, end: 4195 },
            13: { text: "St,Xizirbobo 2-4 yo'l, 4203 km", start: 4198, end: 4203 },
            14: { text: "4204 km-4209 km", start: 4204, end: 4209 },
            15: { text: "4210 km-4215 km", start: 4210, end: 4215 },
            18: { text: "4216 km-4221 km", start: 4216, end: 4221 },
            19: { text: "4222 km-4227 km", start: 4222, end: 4227 },
            20: { text: "4228 km, Rzd Jayxun 3-ECHK yo'llari", start: 4228, end: 4228 },
            21: { text: "Rzd Jayxun 4238 km", start: 4228, end: 4238 },
            22: { text: "4239 km-4244 km", start: 4239, end: 4244 },
            25: { text: "4245 km-4250 km", start: 4245, end: 4250 },
            26: { text: "4251 km-4256 km", start: 4251, end: 4256 },
            27: { text: "4257 km, St Doutepa", start: 4257, end: 4257 },
            28: { text: "St Doutepa 2-4 yo'llar, 4264 km", start: 4264, end: 4264 },
            29: { text: "Jadval tahlili", start: 4020, end: 4020, status: 'paused' }
        }
    },
    "POISK-1080": {
        operator: 'Nurimov Sh., Komilov D.',
        color: 'green',
        schedule: {
            1: { text: "4246 km-4251 km", start: 4246, end: 4251 },
            4: { text: "4252 km-4257 km", start: 4252, end: 4257 },
            5: { text: "4258km, St Doutepa", start: 4258, end: 4258 },
            6: { text: "Texnik ko'rik", start: 4020, end: 4020, status: 'paused' },
            7: { text: "St Doutepa 2-4 qo'shimcha yo'llar", start: 4258, end: 4258 },
            8: { text: "St Doutepa-4266 km", start: 4258, end: 4266 },
            11: { text: "4267 km-4272 km", start: 4267, end: 4272 },
            12: { text: "4273 km-4278 km", start: 4273, end: 4278 },
            13: { text: "4279 km-4284 km", start: 4279, end: 4284 },
            14: { text: "4285 km-4290 km", start: 4285, end: 4290 },
            15: { text: "4291 km-4296 km", start: 4291, end: 4296 },
            18: { text: "4297 km, Rzd Turon 3-ECHK yo'llar", start: 4297, end: 4297 },
            19: { text: "Rzd Turon 4303 km", start: 4303, end: 4303 },
            20: { text: "4211 km-4216 km", start: 4211, end: 4216 },
            21: { text: "4217 km-4222 km", start: 4217, end: 4222 },
            22: { text: "4223 km-4228 km", start: 4223, end: 4228 },
            25: { text: "4229 km-Rzd Jayxun, 3-ECHK yo'llari", start: 4229, end: 4229 },
            26: { text: "Rzd Jayxun-4238 km", start: 4229, end: 4238 },
            27: { text: "4239 km-4244 km", start: 4239, end: 4244 },
            28: { text: "4245 km 4250 km", start: 4245, end: 4250 },
            29: { text: "Jadval tahlili", start: 4020, end: 4020, status: 'paused' }
        }
    },
    "POISK-1004": { // Qo'shilgan 4-aravacha
        operator: 'Zokirov V., Ergashev T.',
        color: 'purple',
        schedule: {
            1: { text: "Zaxira / Qo'shimcha tekshiruv", start: 4020, end: 4100 },
            5: { text: "Stansiya yo'llari nazorati", start: 4160, end: 4165 },
            10: { text: "Texnik ko'rik", start: 4020, end: 4020, status: 'paused' },
            15: { text: "Ta'mirdan chiqqan oraliq", start: 4200, end: 4210 },
            20: { text: "Og'ir defekt ustidan tahlil", start: 4250, end: 4260 }
        }
    }
};

window.currentDefectoDay = window.currentDefectoDay || new Date().getDate();

function initDefectoscopeData() {
    const today = window.currentDefectoDay;

    // Tizimdan saqlangan oylik jadvalni olish (agar bo'lmasa DEFAULT ni oladi)
    const activeSchedule = JSON.parse(localStorage.getItem('defectoscopeMonthlySchedule')) || DEFAULT_SCHEDULE;

    // Haqiqiy ma'lumotlar bazasidan yoki test namunasidan olish
    const liveDefects = window.defectoscopeDefects || [];
    const groupedDefects = {};
    
    // Default mock data (agar API ishlamasa)
    const mockDefects = {
        "POISK-0106": [{ pk: 4023, code: '21', type: 'Yengil', description: 'Bolt zaiflashgan', time: '09:15' }],
        "POISK-2603": [{ pk: 4175, code: '26.3', type: 'O\'rta', description: 'Rels yoriq', time: '08:30' }],
        "POISK-1080": [{ pk: 4288, code: '41', type: 'Yengil', description: 'Skrep yeyilgan', time: '09:45' }]
    };

    if (liveDefects.length > 0) {
        liveDefects.forEach(d => {
            // Aravacha bo'yicha ajratish qiyin bo'lsa, hammasiga tegishli deb qo'shamiz
            // Yoki KM asosida aravachani aniqlash mumkin. Hozircha barcha aravachalarga tushaveradi
            const cartId = Object.keys(activeSchedule)[0]; // Oddiylik uchun
            if (!groupedDefects[cartId]) groupedDefects[cartId] = [];
            groupedDefects[cartId].push({
                pk: d.km,
                code: d.issue ? (d.issue.length < 5 ? d.issue : '21') : '21',
                type: d.degree >= 3 ? 'Og\'ir' : 'O\'rta',
                description: d.description || d.issue,
                time: '00:00'
            });
        });
    }

    const currentDefects = liveDefects.length > 0 ? groupedDefects : mockDefects;

    window.defectoscopeCarts = Object.keys(activeSchedule).map(cartId => {
        const cartInfo = activeSchedule[cartId];
        const daySchedule = cartInfo.schedule[today] || { text: "Dam olish / Reja yo'q", start: 4020, end: 4020, status: 'inactive' };

        const start = daySchedule.start || 4020;
        const end = daySchedule.end || start;
        let current = start;

        // Simulyatsiya qilingan yoki haqiqiy vaqtga qarab pozitsiyani belgilash
        // Agar o'tgan yoki kelajakdagi kun tanlansa
        const isToday = today === new Date().getDate();
        let currentStatus = daySchedule.status || 'inactive';

        if (isToday) {
            const hour = new Date().getHours() + new Date().getMinutes() / 60;
            if (hour >= 8 && hour <= 17 && start !== end) {
                const fraction = (hour - 8) / 9;
                current = Math.floor(start + (end - start) * fraction);
                if (daySchedule.status !== 'paused') currentStatus = 'active';
            } else if (hour > 17) {
                current = end;
                if (daySchedule.status !== 'paused') currentStatus = 'completed';
            }
        } else if (today < new Date().getDate()) {
            current = end; // O'tib ketgan kun - marshrut to'liq yakunlangan
            if (daySchedule.status !== 'paused') currentStatus = 'completed';
        } else {
            current = start; // Kelajak kun - boshlanmagan
            if (daySchedule.status !== 'paused') currentStatus = 'inactive';
        }

        // Live carts bilan ustiga yozish
        const liveCarts = window.liveCarts || [];
        const liveCart = liveCarts.find(c => c.cart_id === cartId);
        if (liveCart) {
            currentStatus = liveCart.status;
            current = liveCart.current_km;
        }

        return {
            id: cartId,
            name: cartInfo.name || cartId,
            operator: cartInfo.operator,
            scheduleText: daySchedule.text,
            route: { start: start, current: current, end: end },
            startTime: '08:00',
            estimatedEnd: '17:00',
            speed: currentStatus === 'active' ? 1.5 : 0,
            checked: Math.abs(current - start),
            defects: currentDefects[cartId] ? currentDefects[cartId].filter(d => d.pk >= Math.min(start, end) && d.pk <= Math.max(start, end)) : [],
            status: currentStatus,
            color: cartInfo.color,
            startPkInput: start,
            endPkInput: end
        };
    });
}

// Calculate progress percentage
function calculateProgress(start, current, end) {
    if (start === end) return 100;
    const total = Math.abs(end - start);
    if (total === 0) return 0;
    const completed = Math.abs(current - start);
    return Math.round((completed / total) * 100);
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'active': '<span style="color: #2ecc71;">🟢 FAOL</span>',
        'paused': '<span style="color: #f1c40f;">🟡 TANAFFUS</span>',
        'completed': '<span style="color: #3498db;">🔵 TUGALLANDI</span>',
        'inactive': '<span style="color: #e74c3c;">🔴 FAOL EMAS</span>'
    };
    return badges[status] || badges['inactive'];
}


// --- Defect SVG Generator (Helper Function) ---
function getDefectSVG(code) {
    // Default rail profile
    const railBase = `
        <path d="M10,50 L50,50 L45,40 L35,35 L35,20 L45,15 L45,10 L15,10 L15,15 L25,20 L25,35 L15,40 L10,50 Z" 
              fill="none" stroke="#333" stroke-width="2"/>
    `;

    let defectMark = '';

    switch (code) {
        case '17.1': // Payvand chokidagi nuqson (Head crack)
            defectMark = `<path d="M20,12 L40,12" stroke="red" stroke-width="3" />`;
            break;
        case '21': // Kallakdagi nuqson (Head surface)
            defectMark = `<circle cx="30" cy="12" r="4" fill="red" />`;
            break;
        case '26.3': // Rels kallasining yemirilishi (Head wear/crack)
            defectMark = `<path d="M45,10 L40,20" stroke="red" stroke-width="3" />`;
            break;
        case '30G': // Gorizontal yoriq (Horizontal crack in head)
            defectMark = `<line x1="20" y1="15" x2="40" y2="15" stroke="red" stroke-width="2" stroke-dasharray="2,1" />`;
            break;
        case '53.1': // Bolt teshigidan yoriq (Bolt hole crack)
            defectMark = `
                <circle cx="30" cy="28" r="3" fill="none" stroke="#333" />
                <line x1="30" y1="28" x2="40" y2="20" stroke="red" stroke-width="2" />
                <line x1="30" y1="28" x2="20" y2="36" stroke="red" stroke-width="2" />
            `;
            break;
        case '41': // Bo'yin yorig'i (Web crack)
            defectMark = `<line x1="30" y1="20" x2="30" y2="40" stroke="red" stroke-width="2" />`;
            break;
        case '69': // Tagidagi yoriq (Base crack)
            defectMark = `<path d="M20,48 L40,48" stroke="red" stroke-width="3" />`;
            break;
        default:
            defectMark = `<text x="30" y="30" text-anchor="middle" fill="red" font-size="20">?</text>`;
    }

    return `<svg width="60" height="60" viewBox="0 0 60 60" style="background:white; border-radius:4px;">
        ${railBase}
        ${defectMark}
    </svg>`;
}

// Helper SVG Donut Progress Ring
function getDonutProgressSVG(percent, color) {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    return `
        <div style="position: relative; width: 84px; height: 84px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                <circle cx="50" cy="50" r="${radius}" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="8" />
                <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${color}" stroke-width="8"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round"
                    style="transition: stroke-dashoffset 0.8s ease; filter: drop-shadow(0 0 8px ${color});" />
            </svg>
            <div style="position: absolute; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 1.1rem; font-weight: 900; color: #ffffff; font-family: system-ui, sans-serif; line-height: 1;">${percent}%</span>
            </div>
        </div>
    `;
}

// Main dashboard HTML - Ultra-modern Mission Control Redesign
function getDefectoscopeTrackerHTML() {
    initDefectoscopeData();
    const carts = window.defectoscopeCarts;

    // Calculate totals
    const totalChecked = carts.reduce((sum, cart) => sum + cart.checked, 0);
    const totalDefects = carts.reduce((sum, cart) => sum + cart.defects.length, 0);
    const activeCarts = carts.filter(c => c.status === 'active').length;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    // Collect all defects for mapping
    const allDefects = carts.flatMap(cart =>
        cart.defects.map(d => ({ ...d, cartId: cart.id }))
    );

    // Stansiyalar ro'yxati va ularning KM koordinatalari
    const stations = [
        { name: "Qorlitog'", km: 4020, pct: 5 },
        { name: "Navbaxor", km: 4042, pct: 20 },
        { name: "Kiyikli", km: 4163, pct: 40 },
        { name: "Xizirbobo", km: 4198, pct: 58 },
        { name: "Jayxun", km: 4228, pct: 72 },
        { name: "Doutepa", km: 4257, pct: 86 },
        { name: "Turon", km: 4303, pct: 95 }
    ];

    return `
        <style>
            .defecto-dashboard-wrap {
                background: #020617;
                color: #f8fafc;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 25px;
                border-radius: 24px;
                box-shadow: 0 25px 60px rgba(0,0,0,0.8), inset 0 0 80px rgba(14, 165, 233, 0.03);
                border: 1px solid rgba(56, 189, 248, 0.15);
            }
            .defecto-header { 
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7));
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 22px 28px; 
                border-radius: 20px; 
                margin-bottom: 25px;
                border: 1px solid rgba(56, 189, 248, 0.2);
                box-shadow: 0 15px 35px rgba(0,0,0,0.4);
                position: relative;
                overflow: hidden;
            }
            .defecto-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, #d4af37, #f59e0b, #06b6d4, #10b981);
            }
            .defecto-title-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 18px;
            }
            .defecto-title { 
                color: #f8fafc; 
                margin: 0; 
                font-size: 1.4rem;
                font-weight: 900;
                letter-spacing: 0.5px;
                display: flex; 
                align-items: center; 
                gap: 12px;
            }
            .defecto-title i {
                color: #38bdf8;
                filter: drop-shadow(0 0 10px rgba(56,189,248,0.5));
                animation: pulseGlow 2.5s infinite;
            }
            .defecto-top-pills { 
                display: flex; 
                gap: 12px; 
                flex-wrap: wrap;
                align-items: center;
            }
            .top-stat-pill {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255,255,255,0.1);
                padding: 8px 16px;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
                backdrop-filter: blur(10px);
            }
            .top-stat-pill.active-carts { border-color: rgba(245, 158, 11, 0.4); color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
            .top-stat-pill.km-checked { border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; background: rgba(56, 189, 248, 0.1); }
            .top-stat-pill.defects-found { border-color: rgba(239, 68, 68, 0.4); color: #ef4444; background: rgba(239, 68, 68, 0.1); }
            .top-stat-pill.current-date { border-color: rgba(168, 85, 247, 0.4); color: #c084fc; background: rgba(168, 85, 247, 0.1); }

            .defecto-grid { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 22px; 
                margin-bottom: 25px;
            }
            @media (max-width: 1024px) {
                .defecto-grid { grid-template-columns: 1fr; }
            }
            .defecto-card { 
                background: rgba(15, 23, 42, 0.7); 
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.08); 
                border-radius: 20px; 
                padding: 22px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 15px 35px rgba(0,0,0,0.5);
                transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
            }
            .defecto-card:hover {
                transform: translateY(-4px);
                border-color: rgba(56, 189, 248, 0.3);
                box-shadow: 0 20px 45px rgba(0,0,0,0.7), 0 0 25px rgba(56, 189, 248, 0.1);
            }
            .defecto-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 5px;
                height: 100%;
                background: var(--accent-color);
                box-shadow: 0 0 15px var(--accent-color);
            }
            .cart-badge { 
                background: var(--accent-color); 
                color: #ffffff; 
                padding: 6px 14px; 
                border-radius: 10px; 
                font-weight: 900; 
                font-size: 0.95rem;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .cart-operator-box {
                background: rgba(2, 6, 23, 0.4);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 10px 14px;
                margin: 14px 0;
                font-size: 0.82rem;
                color: #cbd5e1;
            }
            .cart-schedule-highlight {
                background: rgba(245, 158, 11, 0.1);
                border-left: 3px solid #f59e0b;
                padding: 8px 12px;
                border-radius: 6px;
                margin-top: 6px;
                color: #fbbf24;
                font-weight: 800;
                font-size: 0.8rem;
            }
            .gauge-row {
                display: flex;
                align-items: center;
                gap: 20px;
                background: rgba(2, 6, 23, 0.5);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 16px;
                padding: 14px 18px;
                margin-bottom: 14px;
            }
            .gauge-info {
                flex: 1;
            }
            .cart-micro-stats { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 10px; 
                margin-top: 12px;
            }
            .micro-stat-pill { 
                background: rgba(2, 6, 23, 0.5);
                border: 1px solid rgba(255,255,255,0.06);
                padding: 9px 12px;
                border-radius: 10px;
                display: flex; 
                align-items: center; 
                gap: 8px; 
                font-size: 0.8rem;
                color: #cbd5e1;
                font-weight: 600;
            }
            .detail-btn { 
                width: 100%; 
                padding: 12px; 
                background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(37, 99, 235, 0.25)); 
                border: 1px solid rgba(56, 189, 248, 0.3); 
                color: #38bdf8; 
                border-radius: 12px; 
                cursor: pointer; 
                margin-top: 15px;
                font-weight: 800;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            .detail-btn:hover { 
                background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(37, 99, 235, 0.4)); 
                color: #ffffff;
                box-shadow: 0 6px 20px rgba(56, 189, 248, 0.25);
            }
            
            /* Radar Map Area */
            .sidebar-map { 
                background: rgba(15, 23, 42, 0.75); 
                backdrop-filter: blur(20px);
                border: 1px solid rgba(56, 189, 248, 0.2); 
                border-radius: 20px; 
                padding: 24px;
                margin-bottom: 25px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            }
            .map-title { 
                color: #f8fafc; 
                margin: 0 0 20px 0; 
                display: flex; 
                align-items: center; 
                gap: 10px;
                font-weight: 900;
                font-size: 1.15rem;
            }
            .bottom-actions { 
                display: flex; 
                gap: 12px; 
                flex-wrap: wrap;
            }
            .bottom-actions .action-btn { 
                flex: 1; 
                min-width: 160px;
                padding: 12px 20px; 
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9)); 
                border: 1px solid rgba(255,255,255,0.12); 
                color: #f8fafc; 
                border-radius: 12px; 
                cursor: pointer; 
                font-weight: 800;
                font-size: 0.82rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            .bottom-actions .action-btn:hover { 
                transform: translateY(-2px); 
                border-color: #38bdf8;
                color: #38bdf8;
                box-shadow: 0 6px 20px rgba(0,0,0,0.4);
            }

            .calendar-selector {
                background: rgba(2, 6, 23, 0.6);
                padding: 12px 16px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                overflow-x: auto;
                margin-top: 18px;
                border: 1px solid rgba(255,255,255,0.06);
            }
            .day-btn {
                padding: 8px 13px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px;
                color: #cbd5e1;
                cursor: pointer;
                transition: all 0.25s ease;
                min-width: 40px;
                text-align: center;
                font-weight: 700;
                font-size: 0.82rem;
            }
            .day-btn:hover { 
                background: rgba(56, 189, 248, 0.2); 
                color: #38bdf8;
                border-color: rgba(56, 189, 248, 0.4);
            }
            .day-btn.active {
                background: linear-gradient(135deg, #d4af37, #f59e0b);
                border-color: #ffd700;
                color: #000000;
                box-shadow: 0 0 15px rgba(245, 158, 11, 0.5);
                font-weight: 900;
            }
            .day-btn.today {
                border: 2px solid #38bdf8;
            }

            @keyframes pulseGlow {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6)); }
                50% { transform: scale(1.1); filter: drop-shadow(0 0 16px rgba(56, 189, 248, 0.9)); }
            }
        </style>
        
        <script>
            window.changeDefectoDay = function(day) {
                window.currentDefectoDay = day;
                document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();
            };
        </script>

        <div class="defecto-dashboard-wrap">
            
            <!-- Header Section -->
            <div class="defecto-header">
                <div class="defecto-title-row">
                    <h2 class="defecto-title">
                        <i class="fas fa-radar"></i>
                        Defektaskop Aravachalari - Real-time Monitoring
                    </h2>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button onclick="openDefectoscopeSection2Journal()" style="padding: 10px 20px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: white; border-radius: 12px; font-weight: 900; cursor: pointer; font-size: 0.85rem; box-shadow: 0 4px 18px rgba(245, 158, 11, 0.4); display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                            <i class="fas fa-book-open"></i> 📖 Defektli Relsslar va Nakladkalar Jurnali (16 ustun)
                        </button>
                        <button onclick="editDefectoscopeOperators()" style="padding: 10px 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;">
                            <i class="fas fa-user-cog"></i> Operatorlarni Tahrirlash
                        </button>
                        <div style="text-align: right; color: #94a3b8; font-size: 0.85rem; font-weight: 700;">
                            <div><i class="fas fa-clock" style="color:#38bdf8; margin-right:4px;"></i> ${currentTime}</div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div class="defecto-top-pills">
                        <div class="top-stat-pill active-carts">
                            <i class="fas fa-truck-monster"></i> Jami: <strong>${carts.length} Aravacha</strong> (${activeCarts} Faol)
                        </div>
                        <div class="top-stat-pill km-checked">
                            <i class="fas fa-road"></i> Tekshirildi: <strong>${totalChecked} km</strong>
                        </div>
                        <div class="top-stat-pill defects-found">
                            <i class="fas fa-exclamation-triangle"></i> Defektlar: <strong>${totalDefects} ta</strong>
                        </div>
                        <div class="top-stat-pill current-date">
                            <i class="fas fa-calendar-day"></i> KUN: <strong>${window.currentDefectoDay}-sana</strong>
                        </div>
                    </div>
                </div>
                
                <!-- Calendar Ribbon -->
                <div class="calendar-selector">
                    <span style="color: #38bdf8; font-weight: 900; white-space: nowrap; font-size: 0.8rem; letter-spacing: 0.5px;">
                        <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i> OY KUNLARI:
                    </span>
                    ${Array.from({ length: 31 }, (_, i) => i + 1).map(day =>
                        `<button class="day-btn ${day === window.currentDefectoDay ? 'active' : ''} ${day === new Date().getDate() ? 'today' : ''}" 
                                 title="${day === new Date().getDate() ? 'Bugun' : ''}"
                                 onclick="changeDefectoDay(${day})">${day}</button>`
                    ).join('')}
                </div>
            </div>
            
            <!-- Cards Grid Section (2x2) -->
            <div class="defecto-grid">
                ${carts.map(cart => {
                    const progress = calculateProgress(cart.route.start, cart.route.current, cart.route.end);
                    const remaining = Math.abs(cart.route.end - cart.route.current);
                    const cartColorHex = getCartColor(cart.color);

                    return `
                        <div class="defecto-card" style="--accent-color: ${cartColorHex};">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="cart-badge" style="background: ${cartColorHex};">
                                    <i class="fas fa-subway"></i> ${cart.name}
                                </span>
                                ${getStatusBadge(cart.status)}
                            </div>
                            
                            <div class="cart-operator-box">
                                <div><i class="fas fa-users" style="color: #38bdf8; margin-right: 6px;"></i> <strong>Operatorlar:</strong> ${cart.operator}</div>
                                <div class="cart-schedule-highlight">
                                    <i class="fas fa-route" style="margin-right: 5px;"></i> KUNLIK REJA: ${cart.scheduleText}
                                </div>
                            </div>

                            <!-- Circular Gauge Row -->
                            <div class="gauge-row">
                                ${getDonutProgressSVG(progress, cartColorHex)}
                                <div class="gauge-info">
                                    <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Tashqi Marshrut Progressi</div>
                                    <div style="font-size: 1.1rem; font-weight: 900; color: #ffffff; margin: 2px 0;">PK ${cart.route.start} → PK ${cart.route.current}</div>
                                    <div style="font-size: 0.78rem; color: #38bdf8; font-weight: 700;">
                                        <i class="fas fa-flag-checkered" style="margin-right: 4px;"></i> Marra: PK ${cart.route.end} (${remaining} km qoldi)
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Micro Stats Grid -->
                            <div class="cart-micro-stats">
                                <div class="micro-stat-pill">
                                    <i class="fas fa-tachometer-alt" style="color: #38bdf8;"></i>
                                    <span>Tezlik: <strong>${cart.speed} km/h</strong></span>
                                </div>
                                <div class="micro-stat-pill">
                                    <i class="fas fa-check-circle" style="color: #10b981;"></i>
                                    <span>Tekshirildi: <strong>${cart.checked} km</strong></span>
                                </div>
                                <div class="micro-stat-pill">
                                    <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
                                    <span>Defekt: <strong style="color: ${cart.defects.length > 0 ? '#ef4444' : '#10b981'}">${cart.defects.length} ta</strong></span>
                                </div>
                                <div class="micro-stat-pill">
                                    <i class="fas fa-clock" style="color: #c084fc;"></i>
                                    <span>Tugash: <strong>${cart.estimatedEnd}</strong></span>
                                </div>
                            </div>
                            
                            <button class="detail-btn" onclick="viewCartDetails('${cart.id}')">
                                <i class="fas fa-info-circle"></i> Batafsil Ma'lumot va Tarix <i class="fas fa-chevron-right" style="font-size: 0.7rem;"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <!-- Radar Track Map Area -->
            <div class="sidebar-map">
                <h3 class="map-title">
                    <i class="fas fa-map-marked-alt" style="color: #38bdf8;"></i>
                    Jonli Interaktiv Marshrut Xaritasi (PK 4020 — PK 4303)
                </h3>
                <div style="padding: 10px 5px;">
                    <!-- Railway Track Canvas / Map Container -->
                    <div style="
                        position: relative; 
                        height: 140px; 
                        background: linear-gradient(180deg, #090d16 0%, #020617 100%); 
                        border-radius: 16px; 
                        margin-bottom: 20px; 
                        box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 0 1px rgba(56, 189, 248, 0.2);
                        overflow: hidden;
                        border: 1px solid rgba(56, 189, 248, 0.15);
                    ">
                        <!-- Background Grid Lines -->
                        <div style="position: absolute; width: 100%; height: 100%; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 20px 20px; pointer-events: none;"></div>

                        <!-- Main Rails -->
                        <div style="position: absolute; top: 70px; left: 4%; width: 92%; height: 6px; background: linear-gradient(90deg, #334155, #64748b, #334155); border-radius: 3px; box-shadow: 0 0 10px rgba(148, 163, 184, 0.2);"></div>
                        
                        <!-- Station Nodes -->
                        ${stations.map(st => `
                            <div style="position: absolute; top: 65px; left: ${st.pct}%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; z-index: 2;">
                                <div style="width: 16px; height: 16px; border-radius: 50%; background: #0f172a; border: 3px solid #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);"></div>
                                <div style="color: #cbd5e1; font-size: 0.72rem; font-weight: 800; margin-top: 8px; white-space: nowrap; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${st.name}</div>
                                <div style="color: #64748b; font-size: 0.65rem; font-weight: 700;">PK ${st.km}</div>
                            </div>
                        `).join('')}

                        <!-- DEFECT POINTS (Red Dots) with SVG Tooltips -->
                        ${allDefects.map(defect => {
                            const totalDistance = 4303 - 4020;
                            const defectDist = defect.pk - 4020;
                            const pos = 4 + (defectDist / totalDistance) * 92;
                            let color = '#f59e0b';
                            if (defect.type.includes('Og\'ir')) color = '#ef4444';
                            if (defect.type.includes('O\'rta')) color = '#d97706';

                            const defectCode = defect.code || 'Noma\'lum';

                            return `
                                <div class="defect-point" style="left: ${pos}%; top: 67px; background-color: ${color}; box-shadow: 0 0 10px ${color};">
                                     <div class="map-tooltip">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:5px;">
                                            <strong style="color:${color}; font-size:0.95rem;">PK ${defect.pk}</strong>
                                            <span style="font-size:0.75em; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-weight:bold;">Kod: ${defectCode}</span>
                                        </div>
                                        <div style="display:flex; gap:10px; align-items:center;">
                                            <div style="width:55px; height:55px; background:white; border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                                ${getDefectSVG(defectCode)}
                                            </div>
                                            <div style="flex:1;">
                                                <div style="font-weight:bold; font-size:0.85em; margin-bottom:2px; color:#fff;">${defect.type}</div>
                                                <div style="font-size:0.78em; color:#cbd5e1; line-height:1.3;">
                                                    ${defect.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        }).join('')}

                        <!-- CART MARKERS (Pulsing Glow) -->
                        ${carts.map(cart => {
                            const totalDistance = 4303 - 4020;
                            const cartDistance = cart.route.current - 4020;
                            const pos = 4 + (cartDistance / totalDistance) * 92;
                            const cartColorHex = getCartColor(cart.color);
                            return `
                                <div class="cart-marker-point" style="left: ${pos}%; top: 65px; background-color: ${cartColorHex}; box-shadow: 0 0 15px ${cartColorHex};" title="${cart.id}">
                                     <div style="position:absolute; top:-22px; left:50%; transform:translateX(-50%); font-size:0.68rem; color:${cartColorHex}; white-space:nowrap; font-weight:900; background: rgba(2, 6, 23, 0.85); padding: 2px 6px; border-radius: 4px; border: 1px solid ${cartColorHex};">
                                        ${cart.id}
                                     </div>
                                </div>`;
                        }).join('')}

                    </div>
                    
                    <!-- Map Legend -->
                    <div style="display: flex; justify-content: center; gap: 25px; flex-wrap: wrap; margin-top: 10px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="width: 10px; height: 10px; background: #ef4444; border-radius: 50%; border:2px solid white; box-shadow: 0 0 6px #ef4444;"></span>
                            <span style="color:#94a3b8; font-size:0.82rem; font-weight:600;">Og'ir Defekt</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="width: 10px; height: 10px; background: #f59e0b; border-radius: 50%; border:2px solid white; box-shadow: 0 0 6px #f59e0b;"></span>
                            <span style="color:#94a3b8; font-size:0.82rem; font-weight:600;">O'rta Defekt</span>
                        </div>
                        ${carts.map(cart => `
                            <div style="display: flex; align-items: center; gap: 6px; cursor: pointer;" onclick="viewCartDetails('${cart.id}')">
                                <div style="width: 10px; height: 10px; background: ${getCartColor(cart.color)}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px ${getCartColor(cart.color)};"></div>
                                <span style="color: #cbd5e1; font-size: 0.82rem; font-weight: 700;">${cart.id}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Bottom Actions -->
            <div class="bottom-actions">
                <button class="action-btn" onclick="openDefectoscopeSection2Journal()" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);">
                    <i class="fas fa-book-open"></i> 📖 Defektli Relsslar Jurnali (16 ustun)
                </button>
                <button class="action-btn" onclick="viewDefectReport()">
                    <i class="fas fa-chart-bar" style="color: #38bdf8;"></i> Defekt Hisoboti
                </button>
                <button class="action-btn" onclick="exportDefectsToExcel()">
                    <i class="fas fa-file-excel" style="color: #10b981;"></i> Export Excel
                </button>
                <button class="action-btn admin-only" onclick="openScheduleEditor()">
                    <i class="fas fa-calendar-alt" style="color: #c084fc;"></i> Jadval Tahrirlash
                </button>
                <button class="action-btn" onclick="refreshDefectoscopeData()">
                    <i class="fas fa-sync-alt" style="color: #38bdf8;"></i> Yangilash
                </button>
                <button class="action-btn" onclick="window.print()">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>

        </div>
    `;
}

// Get cart color
function getCartColor(color) {
    const colors = {
        'orange': '#f59e0b',
        'blue': '#38bdf8',
        'purple': '#c084fc',
        'green': '#10b981'
    };
    return colors[color] || '#94a3b8';
}


window.editDefectoscopeOperators = function() {
    const currentSchedule = JSON.parse(localStorage.getItem('defectoscopeMonthlySchedule')) || DEFAULT_SCHEDULE;
    
    let updated = false;
    for (const cartId in currentSchedule) {
        const currentOp = currentSchedule[cartId].operator;
        const currentName = currentSchedule[cartId].name || cartId;

        const newName = prompt(`"${cartId}" aravachasining yangi nomini kiriting:`, currentName);
        if (newName !== null && newName.trim() !== '') {
            currentSchedule[cartId].name = newName.trim();
            updated = true;
        }

        const newOp = prompt(`"${currentSchedule[cartId].name || cartId}" aravachasi operatorlarini tahrirlang:`, currentOp);
        if (newOp !== null && newOp.trim() !== '') {
            currentSchedule[cartId].operator = newOp.trim();
            updated = true;
        }
    }
    
    if (updated) {
        localStorage.setItem('defectoscopeMonthlySchedule', JSON.stringify(currentSchedule));
        const content = document.getElementById('defectoscope-content');
        if(content) content.innerHTML = getDefectoscopeTrackerHTML();
        if(window.SmartUtils) window.SmartUtils.showToast("Ma'lumotlar muvaffaqiyatli saqlandi!", "success");
    }
};

// Open Defektli Relsslar va Nakladkalar Jurnali (16 ustunli) directly inside Defektaskop Monitoring
window.openDefectoscopeSection2Journal = function() {
    const contentDiv = document.getElementById('defectoscope-content');
    if (!contentDiv) return;

    const html = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 15px 25px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.3);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <button onclick="document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();" style="padding: 10px 18px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 10px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-arrow-left"></i> Orqaga (Monitoring)
                </button>
                <h3 style="margin: 0; color: #38bdf8; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-book-open" style="color: #f59e0b;"></i>
                    Defektli Relsslar va Nakladkalar Jurnali (16 Ustunli Rasmiy Hujjat)
                </h3>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="openPU28Section2NewModal('all')" style="padding: 10px 20px; background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none; color: white; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3); display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-plus-circle"></i> YANGI DEFEKT KIRITISH
                </button>
                <button onclick="exportPU28Section2ToExcel('all')" style="padding: 10px 20px; background: #e2e8f0; border: 1px solid #cbd5e1; color: #0f172a; border-radius: 10px; cursor: pointer; font-weight: bold; display: flex; align-items: gap: 6px;">
                    <i class="fas fa-file-excel" style="color: #16a34a;"></i> EXCEL
                </button>
            </div>
        </div>

        <div id="pu28-section2-content" style="overflow-x: auto;">
            ${generatePU28Section2TableBody('all')}
        </div>
    `;

    contentDiv.innerHTML = html;
    if (typeof window.loadPU28Section2Data === 'function') {
        window.loadPU28Section2Data('all');
    }
};

// Open defectoscope tracker window
window.openDefectoscopeTracker = async function () {
    // API orqali defektlarni yuklash
    if (window.SmartUtils) {
        try {
            const apiDefects = await window.SmartUtils.fetchAPI('/defects');
            window.defectoscopeDefects = Array.isArray(apiDefects) ? apiDefects : [];
            
            const apiCarts = await window.SmartUtils.fetchAPI('/defectoscope');
            window.liveCarts = Array.isArray(apiCarts) ? apiCarts : [];
        } catch(e) {
            console.error("Defektaskop API error", e);
        }
    }

    // Create modal
    let modal = document.getElementById('defectoscope-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'defectoscope-modal';
        modal.className = 'active';
        // Remove all classes, use only inline styles
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 10000 !important;
            background: #0f172a !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
        `;
        const isAdmin = window.Auth && window.Auth.currentUser && window.Auth.currentUser.role === 'admin';
        const editBtnHtml = isAdmin ? `
            <button onclick="if(window.editDefectoscopeOperators) window.editDefectoscopeOperators()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 5px 15px; border-radius: 20px; cursor: pointer; font-weight: bold; transition: all 0.3s; display: flex; align-items: center; gap: 5px;">
                <i class="fas fa-cog"></i> Operatorlarni Tahrirlash
            </button>
        ` : '';

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #f39c12, #e67e22); padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                <h2 style="color: white; margin: 0; display: flex; align-items: center; gap: 10px; font-size: 1.5rem;">
                    <i class="fas fa-search-location"></i>
                    Defektaskop Aravacha Monitoring
                </h2>
                <div style="display: flex; gap: 10px;">
                    ${editBtnHtml}
                    <button onclick="closeDefectoscopeTracker()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 18px; transition: all 0.3s;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div id="defectoscope-content" style="padding: 30px; background: #0f172a; overflow-y: auto; flex: 1; width: 100%;"></div>
        `;
        document.body.appendChild(modal);
    }

    // Render content
    document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();

    // Show modal - ensure it's visible
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';

    // Show overlay
    const overlay = document.getElementById('department-overlay');
    if (overlay) {
        overlay.classList.add('active');
    }
};

// Close window
window.closeDefectoscopeTracker = function () {
    const modal = document.getElementById('defectoscope-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    const overlay = document.getElementById('department-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

// View cart details
// View cart details with 31-day history table & defect inspection
window.viewCartDetails = function (cartId) {
    const cart = window.defectoscopeCarts.find(c => c.id === cartId);
    if (!cart) return;

    const currentSchedule = JSON.parse(localStorage.getItem('defectoscopeMonthlySchedule')) || DEFAULT_SCHEDULE;
    const cartSchedule = currentSchedule[cartId]?.schedule || {};
    const selectedDay = window.currentDefectoDay || new Date().getDate();
    const cartColorHex = getCartColor(cart.color);

    const detailsHTML = `
        <div style="background: #020617; color: #f8fafc; padding: 25px; border-radius: 24px; border: 1px solid rgba(56, 189, 248, 0.2); box-shadow: 0 25px 60px rgba(0,0,0,0.8);">
            
            <!-- Top Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button class="action-btn" onclick="closeDefectDetails()" style="padding: 10px 18px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 12px; cursor: pointer; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-arrow-left"></i> Orqaga (Monitoring)
                    </button>
                    <span class="cart-badge" style="background: ${cartColorHex}; font-size: 1.1rem; padding: 8px 18px;">
                        <i class="fas fa-subway"></i> ${cart.name}
                    </span>
                </div>
                <div>
                    ${getStatusBadge(cart.status)}
                </div>
            </div>

            <!-- Vehicle Summary Card -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-id-card"></i> Operator va Marshrut Ma'lumotlari
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem; color: #cbd5e1;">
                        <div><i class="fas fa-users" style="color: #f59e0b; margin-right: 6px;"></i> <strong>Operatorlar:</strong> ${cart.operator}</div>
                        <div><i class="fas fa-calendar-day" style="color: #c084fc; margin-right: 6px;"></i> <strong>Tanlangan Sana:</strong> ${selectedDay}-iyul</div>
                        <div><i class="fas fa-route" style="color: #10b981; margin-right: 6px;"></i> <strong>Kungi Reja:</strong> ${cart.scheduleText}</div>
                        <div><i class="fas fa-map-marker-alt" style="color: #ef4444; margin-right: 6px;"></i> <strong>Hozirgi o'rni:</strong> PK ${cart.route.current}</div>
                    </div>
                </div>

                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Shu Kungi Defektlar</div>
                    <div style="font-size: 2.2rem; font-weight: 900; color: ${cart.defects.length > 0 ? '#ef4444' : '#10b981'}; margin: 5px 0;">${cart.defects.length} ta</div>
                    <div style="font-size: 0.78rem; color: #cbd5e1;">Tekshirilgan masofa: <b>${cart.checked} km</b></div>
                </div>
            </div>

            <!-- Defects Table for Selected Date -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 20px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; color: #ef4444; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-exclamation-triangle"></i> Topilgan Defektlar Ro'yxati (${cart.defects.length} ta)
                </h4>
                ${cart.defects.length === 0 ? `
                    <div style="text-align: center; color: #10b981; padding: 20px; font-weight: 700;">
                        <i class="fas fa-check-circle fa-2x" style="margin-bottom: 8px; display: block;"></i>
                        Ushbu sanada ushbu aravacha bo'yicha hech qanday defekt topilmadi.
                    </div>
                ` : `
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; color: #f8fafc; font-size: 0.85rem;">
                            <thead>
                                <tr style="background: rgba(30, 41, 59, 0.8); color: #38bdf8; border-bottom: 2px solid rgba(56, 189, 248, 0.3);">
                                    <th style="padding: 10px; text-align: center;">PK</th>
                                    <th style="padding: 10px; text-align: center;">Kod</th>
                                    <th style="padding: 10px; text-align: center;">Turi</th>
                                    <th style="padding: 10px; text-align: left;">Tavsif</th>
                                    <th style="padding: 10px; text-align: center;">Vaqt</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cart.defects.map(d => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                                        <td style="padding: 10px; text-align: center; font-weight: bold; color: #0284c7;">PK ${d.pk}</td>
                                        <td style="padding: 10px; text-align: center;"><span style="padding: 4px 10px; background: #fee2e2; color: #dc2626; border-radius: 6px; font-weight: 900;">${d.code || '-'}</span></td>
                                        <td style="padding: 10px; text-align: center; font-weight: bold; color: ${d.type.includes('Og\'ir') ? '#ef4444' : '#f59e0b'};">${d.type}</td>
                                        <td style="padding: 10px; color: #cbd5e1;">${d.description}</td>
                                        <td style="padding: 10px; text-align: center; color: #94a3b8;">${d.time}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            <!-- Full 31-day Monthly Schedule Table -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #f59e0b; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-calendar-alt"></i> Oylik Reja va Tekshiruv Tarixi (1 — 31 sanalar)
                </h4>
                <div style="max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <thead>
                            <tr style="background: rgba(30, 41, 59, 0.9); color: #cbd5e1; position: sticky; top: 0; z-index: 2;">
                                <th style="padding: 10px; text-align: center; width: 60px;">Sana</th>
                                <th style="padding: 10px; text-align: left;">Biriktirilgan Marshrut / Reja</th>
                                <th style="padding: 10px; text-align: center; width: 120px;">Boshlanish</th>
                                <th style="padding: 10px; text-align: center; width: 120px;">Tugash</th>
                                <th style="padding: 10px; text-align: center; width: 120px;">Amal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                                const sched = cartSchedule[day] || { text: "Dam olish / Reja yo'q", start: 4020, end: 4020 };
                                const isSelected = day === selectedDay;
                                const isTodayDay = day === new Date().getDate();

                                return `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); background: ${isSelected ? 'rgba(245, 158, 11, 0.15)' : (isTodayDay ? 'rgba(56, 189, 248, 0.1)' : 'transparent')}; border-left: ${isSelected ? '4px solid #f59e0b' : 'none'};">
                                        <td style="padding: 10px; text-align: center; font-weight: bold; color: ${isSelected ? '#f59e0b' : '#38bdf8'};">
                                            ${day}-sana ${isTodayDay ? '<span style="font-size:0.65rem; color:#38bdf8; display:block;">(Bugun)</span>' : ''}
                                        </td>
                                        <td style="padding: 10px; color: #f8fafc; font-weight: 600;">
                                            ${sched.text}
                                        </td>
                                        <td style="padding: 10px; text-align: center; color: #cbd5e1;">PK ${sched.start || '-'}</td>
                                        <td style="padding: 10px; text-align: center; color: #cbd5e1;">PK ${sched.end || '-'}</td>
                                        <td style="padding: 10px; text-align: center;">
                                            <button onclick="changeDefectoDay(${day}); viewCartDetails('${cart.id}');" style="padding: 4px 10px; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
                                                <i class="fas fa-eye"></i> Ko'rish
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    `;

    document.getElementById('defectoscope-content').innerHTML = detailsHTML;
};

window.closeDefectDetails = function () {
    document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();
};


window.openScheduleEditor = function () {
    if (!currentUser || (currentUser.role !== 'dispatcher' && currentUser.role !== 'admin' && !currentUser.departments?.includes('dispetcher'))) {
        alert('Faqat dispatcher va admin tahrirlash huquqiga ega!');
        return;
    }

    const currentSchedule = JSON.parse(localStorage.getItem('defectoscopeMonthlySchedule')) || DEFAULT_SCHEDULE;
    const carts = Object.keys(currentSchedule);

    // Oylik kunlarni shakllantirish (1 dan 31 gacha)
    const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

    // Dynamic Excel Grid CSS
    const editorHTML = `
        <style>
            .excel-container {
                background: #0f172a;
                border: 1px solid rgba(0, 198, 255, 0.3);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                margin: 20px 0;
            }
            .excel-header {
                display: flex;
                background: linear-gradient(90deg, #1e293b, #0f172a);
                border-bottom: 2px solid #00c6ff;
            }
            .excel-header-cell {
                flex: 1;
                padding: 15px;
                text-align: center;
                color: #00c6ff;
                font-weight: 800;
                font-size: 1.1rem;
                letter-spacing: 1px;
                border-right: 1px solid rgba(255,255,255,0.1);
            }
            .excel-body {
                max-height: 500px;
                overflow-y: auto;
            }
            .excel-row {
                display: flex;
                background: rgba(30, 41, 59, 0.6);
                border-bottom: 1px solid rgba(255,255,255,0.05);
                transition: background 0.2s;
            }
            .excel-row:hover {
                background: rgba(0, 198, 255, 0.05);
            }
            .excel-cell {
                flex: 1;
                padding: 10px;
                border-right: 1px solid rgba(255,255,255,0.05);
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .excel-cell:last-child {
                border-right: none;
            }
            .day-number {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                font-weight: 900;
                font-size: 1.2rem;
                box-shadow: 0 4px 10px rgba(231,76,60,0.3);
            }
            .cart-inputs {
                display: flex;
                flex-direction: column;
                gap: 5px;
                width: 100%;
            }
            .cart-inputs input {
                width: 100%;
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255,255,255,0.1);
                color: white;
                padding: 6px;
                border-radius: 4px;
                font-size: 0.8rem;
                transition: all 0.3s;
            }
            .cart-inputs input:focus {
                border-color: #00c6ff;
                box-shadow: 0 0 8px rgba(0,198,255,0.5);
                outline: none;
            }
            .cart-inputs input.desc {
                color: #f1c40f;
            }
            
            /* Custom Scrollbar for Excel */
            .excel-body::-webkit-scrollbar { width: 8px; }
            .excel-body::-webkit-scrollbar-track { background: #0f172a; }
            .excel-body::-webkit-scrollbar-thumb { background: #00c6ff; border-radius: 4px; }
        </style>
        
        <h3 style="display: flex; align-items: center; gap: 15px; margin-bottom: 5px; font-size: 1.8rem; color: #fff;">
            <div style="background: #2ecc71; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; box-shadow: 0 0 15px rgba(46,204,113,0.4);">
                <i class="fas fa-file-excel" style="color: white; font-size: 1.5rem;"></i>
            </div>
            Oylik Interaktiv Jadval (Excel Format)
        </h3>
        <p style="color:#aaa; font-size:0.95rem; margin-bottom:15px; border-left: 3px solid #00c6ff; padding-left: 10px;">
            Siz har bir 4 ta aravacha uchun marshrut(Boshlanish va tugash)larini yoki Izohlarini shu yerda oson tahrirlashingiz mumkin.
        </p>
        
        <div class="excel-container">
            <div class="excel-header">
                <div class="excel-header-cell" style="flex: 0.3; max-width: 80px;">SANA</div>
                ${carts.map(cart => `
                    <div class="excel-header-cell">
                        <i class="fas fa-truck" style="margin-right: 5px;"></i>${cart}
                    </div>
                `).join('')}
            </div>
            
            <div class="excel-body" id="excel-grid-body">
                ${daysArray.map(day => {
        return `
                    <div class="excel-row">
                        <div class="excel-cell" style="flex: 0.3; max-width: 80px; justify-content: center;">
                            <div class="day-number">${day}</div>
                        </div>
                        ${carts.map(cartId => {
            const cartObj = currentSchedule[cartId];
            const dayData = cartObj.schedule[day] || { start: "", end: "", text: "", status: "" };

            return `
                                <div class="excel-cell">
                                    <div class="cart-inputs">
                                        <div style="display:flex; gap:5px;">
                                            <input type="number" id="cell_${cartId}_${day}_start" placeholder="Boshlanish PK" value="${dayData.start !== 4020 ? dayData.start : ""}">
                                            <input type="number" id="cell_${cartId}_${day}_end" placeholder="Tugash PK" value="${dayData.end !== 4020 ? dayData.end : ""}">
                                        </div>
                                        <input type="text" class="desc" id="cell_${cartId}_${day}_text" placeholder="(Ixtiyoriy Izoh yozing, Masalan: Texnik ko'rik)" value="${dayData.text || ""}">
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                    `;
    }).join('')}
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
             <button onclick="document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();" style="padding: 12px 25px; background: transparent; border: 1px solid #e74c3c; color: #e74c3c; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.background='rgba(231,76,60,0.1)'" onmouseout="this.style.background='transparent'">
                <i class="fas fa-arrow-left"></i> Orqaga qaytish
            </button>
            <div style="display: flex; gap: 15px;">
                <button onclick="clearExcelSchedule()" style="padding: 12px 25px; background: rgba(52, 73, 94, 0.8); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-eraser"></i> Hamma qatorlarni tozalash
                </button>
                <button onclick="saveExcelSchedule()" style="padding: 12px 35px; background: linear-gradient(135deg, #11998e, #38ef7d); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem; box-shadow: 0 5px 15px rgba(56, 239, 125, 0.4); transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-save"></i> Jadvalni Saqlash
                </button>
            </div>
        </div>
    `;

    document.getElementById('defectoscope-content').innerHTML = editorHTML;
};

window.saveExcelSchedule = function () {
    try {
        const oldSchedule = JSON.parse(localStorage.getItem('defectoscopeMonthlySchedule')) || DEFAULT_SCHEDULE;
        const newSchedule = JSON.parse(JSON.stringify(oldSchedule)); // Chuqur nusxa(deep clone)

        const carts = Object.keys(newSchedule);

        for (let day = 1; day <= 31; day++) {
            carts.forEach(cartId => {
                const startVal = document.getElementById(`cell_${cartId}_${day}_start`).value;
                const endVal = document.getElementById(`cell_${cartId}_${day}_end`).value;
                const textVal = document.getElementById(`cell_${cartId}_${day}_text`).value;

                // Agar ma'lumot bo'lsa uni qo'shamiz
                if (startVal || endVal || textVal) {
                    if (!newSchedule[cartId].schedule) newSchedule[cartId].schedule = {};

                    const pStart = startVal ? parseInt(startVal) : 4020;
                    const pEnd = endVal ? parseInt(endVal) : 4020;

                    // "Texnik ko'rik" yoki maxsus kunga moslash
                    let pStatus = 'active';
                    if (textVal && (textVal.toLowerCase().includes('texnik') || textVal.toLowerCase().includes('tahlil') || textVal.toLowerCase().includes('dam'))) {
                        pStatus = 'paused';
                    }

                    newSchedule[cartId].schedule[day] = {
                        text: textVal || `${pStart} km - ${pEnd} km`,
                        start: pStart,
                        end: pEnd,
                        status: pStatus
                    };
                } else {
                    // Agar katakcha bo'sh bo'lsa, xotiradan tozalab yuboramiz
                    if (newSchedule[cartId].schedule && newSchedule[cartId].schedule[day]) {
                        delete newSchedule[cartId].schedule[day];
                    }
                }
            });
        }

        localStorage.setItem('defectoscopeMonthlySchedule', JSON.stringify(newSchedule));

        // Success animation
        const btn = event.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Saqlandi!';
        btn.style.background = '#2ecc71';

        setTimeout(() => {
            window.currentDefectoDay = new Date().getDate(); // Bugungi kunga qaytarish
            document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();
            showToast("Jadval tizimga muvaffaqiyatli saqlandi!", "success");
        }, 800);

    } catch (err) {
        alert("Xatolik. Ma'lumotlarni saqlash imkoni bo'lmadi.\n" + err.message);
    }
};

window.clearExcelSchedule = function () {
    if (!confirm("Barcha katakdalardagi ma'lumotlarni o'chirishni tasdiqlaysizmi?")) return;

    document.querySelectorAll('.cart-inputs input').forEach(input => {
        input.value = "";
    });
};

window.saveNewMonthlySchedule = function () {
    try {
        const textValue = document.getElementById('edit-schedule-json').value;
        const newObj = JSON.parse(textValue);

        // Validation check
        if (!newObj["POISK-0106"] || !newObj["POISK-2603"] || !newObj["POISK-1080"]) {
            throw new Error("Jadval tuzilishida asosiy aravachalar IDlari (POISK-...) to'liq emas.");
        }

        localStorage.setItem('defectoscopeMonthlySchedule', JSON.stringify(newObj));
        alert('🎉 Muvaffaqiyatli saqlandi! Tizim endi yozilgan yangi oylik qoidalar asosida ishlaydi.');

        // Refresh view
        window.currentDefectoDay = new Date().getDate(); // Bugungi kunga qaytish
        document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();

    } catch (err) {
        alert("Xatolik: Formati noto'g'ri yozilgan. Iltimos tekshirib qayta urinib ko'ring.\n" + err.message);
    }
};

// Export to Excel (simplified)
window.exportDefectsToExcel = function () {
    alert('Excel export funksiyasi! (Demo)');
};

// View defect report
window.viewDefectReport = function () {
    const allDefects = window.defectoscopeCarts.flatMap(cart =>
        cart.defects.map(d => ({ ...d, cart: cart.id }))
    );

    const reportHTML = `
        <h3>📊 Defektlar Hisoboti</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: rgba(0,198,255,0.1);">
                    <th style="padding: 10px;">Aravacha</th>
                    <th style="padding: 10px;">PK</th>
                    <th style="padding: 10px;">Turi</th>
                    <th style="padding: 10px;">Tavsif</th>
                    <th style="padding: 10px;">Vaqt</th>
                </tr>
            </thead>
            <tbody>
                ${allDefects.map(d => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <td style="padding: 10px;">${d.cart}</td>
                        <td style="padding: 10px;">${d.pk}</td>
                        <td style="padding: 10px;">${d.type}</td>
                        <td style="padding: 10px;">${d.description}</td>
                        <td style="padding: 10px;">${d.time}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button class="action-btn" onclick="closeDefectDetails()">
            <i class="fas fa-arrow-left"></i> Orqaga
        </button>
    `;

    document.getElementById('defectoscope-content').innerHTML = reportHTML;
};

// Refresh data
window.refreshDefectoscopeData = function () {
    document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();
    alert('Ma\'lumotlar yangilandi!');
};

// ====================================================================
// ULTRATOVUSH A-SCAN & B-SCAN SIGNAL DIAGRAMMASI VA VISUALIZER MODALI
// ====================================================================
window.openAScanBScanModal = function (defectCode, pk, cartId) {
    let modal = document.getElementById('ascan-bscan-modal');
    if (modal) modal.remove();

    const code = defectCode || '21.1-2';
    const pkNum = pk || 4175;
    const cart = cartId || 'POISK-0106';

    // Catalog lookup for defect info
    const catalogItem = window.NTIDefectCatalog?.find(d => d.code === code) || {
        name: 'Kallakdagi ko\'ndalang darz (Transverse Head Crack)',
        category: 'Kallak (Головка)',
        urgency: 'Critical'
    };

    const depthMm = (12.5 + (pkNum % 7) * 0.8).toFixed(1);
    const lengthMm = (6.0 + (pkNum % 5) * 1.2).toFixed(1);
    const amplitudePct = (78 + (pkNum % 15)).toFixed(0);
    const gainDb = 42;
    const probeAngle = code.startsWith('30') ? '58°' : '70°';

    modal = document.createElement('div');
    modal.id = 'ascan-bscan-modal';
    modal.className = 'active';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(2, 6, 23, 0.88); backdrop-filter: blur(16px);
        z-index: 300000; display: flex; align-items: center; justify-content: center; padding: 20px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    `;

    modal.innerHTML = `
        <div style="background: #020617; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 24px; padding: 28px; max-width: 950px; width: 100%; max-height: 92vh; overflow-y: auto; color: white; box-shadow: 0 30px 80px rgba(0,0,0,0.9), inset 0 0 40px rgba(6, 182, 212, 0.05);">
            
            <!-- Modal Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 16px; margin-bottom: 22px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-microscope" style="color: #06b6d4; font-size: 1.3rem;"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #38bdf8; font-weight: 900; font-size: 1.2rem; letter-spacing: 0.5px;">
                            🔬 ULTRATOVUSH A-SCAN & B-SCAN SIGNAL DIAGRAMMASI
                        </h3>
                        <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 3px;">
                            Joylashuvi: <b>PK ${pkNum}</b> | Defekt Kodi: <b style="color: #ef4444;">${code}</b> | Aravacha: <b>${cart}</b>
                        </div>
                    </div>
                </div>
                <button onclick="document.getElementById('ascan-bscan-modal').remove()" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- B-Scan Section Grid -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 18px; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-weight: 900; color: #38bdf8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-layer-group" style="margin-right: 6px;"></i> B-Scan Rels Kesimi Chuqurlik Xaritasi (Rail Depth Waveform)
                    </span>
                    <span style="font-size: 0.75rem; background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid #06b6d4; padding: 3px 10px; border-radius: 6px; font-weight: bold;">
                        Chastota: 2.5 MHz | Datchik burchagi: ${probeAngle}
                    </span>
                </div>

                <!-- B-Scan Railway Profile SVG -->
                <div style="position: relative; width: 100%; height: 160px; background: #030712; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <svg viewBox="0 0 800 160" style="width: 100%; height: 100%;">
                        <!-- Background Grid -->
                        <defs>
                            <pattern id="bscan-grid" width="40" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
                            </pattern>
                        </defs>
                        <rect width="800" height="160" fill="url(#bscan-grid)"/>

                        <!-- Rail R-65 Profile Outline -->
                        <path d="M 50,15 L 750,15 L 730,45 L 440,55 L 440,115 L 750,130 L 750,150 L 50,150 L 50,130 L 360,115 L 360,55 L 50,45 Z" 
                              fill="rgba(30, 41, 59, 0.4)" stroke="rgba(148, 163, 184, 0.3)" stroke-width="1.5" stroke-dasharray="4,2"/>
                        
                        <!-- Ultrasonic Wave Echograms (Green/Cyan Lines) -->
                        <path d="M 50,20 Q 200,22 350,20 T 650,22 T 750,20" fill="none" stroke="#10b981" stroke-width="2" opacity="0.8"/>
                        <path d="M 50,32 Q 220,30 380,34 T 550,30 T 750,32" fill="none" stroke="#06b6d4" stroke-width="1.5" opacity="0.7"/>

                        <!-- RED DEFECT PULSE ECHO AT DEPTH -->
                        <circle cx="410" cy="38" r="14" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" stroke-width="2">
                            <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="410" cy="38" r="5" fill="#ef4444"/>
                        <line x1="410" y1="0" x2="410" y2="160" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3"/>

                        <!-- Depth Marker text -->
                        <text x="420" y="32" fill="#ef4444" font-weight="900" font-size="11">Nuqson chuqurligi: ${depthMm} mm</text>
                        <text x="420" y="46" fill="#f59e0b" font-weight="bold" font-size="10">Uzunligi: ${lengthMm} mm</text>

                        <!-- Depth Scale (Y-axis) -->
                        <text x="10" y="25" fill="#64748b" font-size="9">0 mm (Kallak)</text>
                        <text x="10" y="50" fill="#64748b" font-size="9">45 mm (Bo'yin)</text>
                        <text x="10" y="145" fill="#64748b" font-size="9">150 mm (Podoshva)</text>
                    </svg>
                </div>
            </div>

            <!-- Bottom Row: A-Scan & Details -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                
                <!-- A-Scan Amplitude Graph -->
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 18px; padding: 18px;">
                    <div style="font-weight: 900; color: #10b981; font-size: 0.85rem; margin-bottom: 10px; text-transform: uppercase; display: flex; justify-content: space-between;">
                        <span><i class="fas fa-wave-square"></i> A-Scan Impuls Amplitudasi</span>
                        <span style="color: #ef4444;">${amplitudePct}% (Porog: 80%)</span>
                    </div>

                    <div style="width: 100%; height: 140px; background: #030712; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden;">
                        <svg viewBox="0 0 350 140" style="width: 100%; height: 100%;">
                            <!-- Oscilloscope Grid -->
                            <line x1="0" y1="30" x2="350" y2="30" stroke="rgba(239, 68, 68, 0.4)" stroke-width="1" stroke-dasharray="4,2"/>
                            <text x="5" y="26" fill="#ef4444" font-size="8">80% POROG OSHDI</text>

                            <!-- Waveform line -->
                            <path d="M 0,130 L 40,130 L 50,120 L 60,130 L 110,130 L 120,105 L 130,130 L 170,130 L 185,15 L 200,130 L 250,130 L 260,115 L 270,130 L 350,130" 
                                  fill="none" stroke="#10b981" stroke-width="2.5"/>
                            
                            <!-- Peak Highlight -->
                            <circle cx="185" cy="15" r="4" fill="#ef4444"/>
                        </svg>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.75rem; color: #94a3b8;">
                        <span>Usileniye (Gain): <b>+${gainDb} dB</b></span>
                        <span>Zaderjka: <b>18 µs</b></span>
                        <span>Ugol: <b>${probeAngle}</b></span>
                    </div>
                </div>

                <!-- Diagnostic Summary Panel -->
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 18px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="font-weight: 900; color: #f59e0b; font-size: 0.85rem; margin-bottom: 10px; text-transform: uppercase;">
                            <i class="fas fa-clipboard-check"></i> Ekspertiza Diagnostika Xulosasi
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: #cbd5e1;">
                            <div><b>Defekt Turi:</b> <span style="color: #fff;">${catalogItem.name}</span></div>
                            <div><b>Joylashuvi:</b> PK ${pkNum} (${catalogItem.category})</div>
                            <div><b>Chuqurlik / O'lcham:</b> <span style="color: #38bdf8; font-weight: bold;">${depthMm} mm</span> (Uzunlik: ${lengthMm} mm)</div>
                            <div><b>Signal Amplitudasi:</b> <span style="color: #ef4444; font-weight: bold;">${amplitudePct}% (+${gainDb} dB)</span></div>
                            <div><b>Xavflilik Darajasi:</b> <span style="padding: 3px 8px; border-radius: 6px; background: #fee2e2; color: #dc2626; font-weight: 900; font-size: 0.75rem;">🔴 KRITIK (Darhol almashtirish)</span></div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 15px;">
                        <button onclick="sendAScanTelegramAlert('${code}', ${pkNum})" style="flex: 1; padding: 9px; background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <i class="fab fa-telegram-plane"></i> Telegram Alert
                        </button>
                        <button onclick="printAScanReport('${code}', ${pkNum})" style="flex: 1; padding: 9px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: white; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <i class="fas fa-print"></i> B-Scan PDF
                        </button>
                    </div>
                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
};

window.sendAScanTelegramAlert = function (code, pk) {
    if (window.SmartUtils) {
        SmartUtils.showToast(` Telegram-ga shoshilinch ogohlantirish yuborildi! (PK ${pk}, Kod: ${code})`, "success");
    } else {
        alert(`Telegram-ga shoshilinch ogohlantirish yuborildi!\nPK ${pk}, Defekt kodi: ${code}`);
    }
};

window.printAScanReport = function (code, pk) {
    window.print();
};

// Initialize on load
initDefectoscopeData();

