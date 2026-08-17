
// Smart-PCH: PU-29 Ultimate Premium Dashboard (KPI Fix & Data Stability)

let currentPU29Bolinma = 'bolinma1';
let currentPU29Switch = null;
window.pu29DataStore = {}; 

window.pu29Pages = {
    'bolinma1': ['1', '2', '3', '100'], 'bolinma2': ['1', '2', '3', '4', '5', '6', '10', '100', '102'],
    'bolinma3': ['1', '2', '3', '100', '101'], 'bolinma4': ['1', '2', '4', '5', '6', '100'],
    'bolinma5': ['1', '2', '3', '201'], 'bolinma6': ['1', '2', '3', '5', '6'],
    'bolinma7': ['1', '2', '4', '100', '101'], 'bolinma9': ['1', '2', '3', '4', '5', '6', '8', '10'],
    'bolinma10': ['1', '2', '3', '201', '203'],
};

// --- DATA LOGIC ---
window.getPU29SwitchData = function(bolinmaId, swNum) {
    const key = `${bolinmaId}_${swNum}`;
    if (!window.pu29DataStore[key]) {
        const stNames = { 'bolinma1': 'Navbaxor', 'bolinma2': 'Yaxshilik', 'bolinma3': 'Parvoz', 'bolinma4': 'Qorlitog\'', 'bolinma5': 'Kiyikli', 'bolinma6': 'Xizirbobo', 'bolinma7': 'Jayxun', 'bolinma9': 'Dautepa', 'bolinma10': 'Turon' };
        
        // Deterministic mock generation based on swNum
        const num = parseInt(swNum) || 1;
        const cat = (num % 5 === 0) ? 'boshqa' : ((num % 2 === 0) ? 'qabul' : 'asosiy');
        ext = new Array(30).fill('');
        if (num % 3 === 0) {
            // OK / NORMAL
            sh = [1520, 1522, 1520, 1521, 1520, 1520, 1520, 1520, 1521, 1522, 1521, 1520, 1520, 1520];
            ur = [0, 1, -1, 0, 2, 0, 0];
            g = [45, 46, 48, 50];
            w = [1, 2, 1, 2, 1];
            t = [3, 2, 'OK', 155, 'Пл.', 30 + (num % 10) * 5, 'Нет', 1520, 1524, '+50', 5160];
            ext[20] = '45'; // spalling <=6 (green)
        } else if (num % 3 === 1) {
            // WARNING / DIQQAT
            sh = [1520, 1524, 1521, 1522, 1520, 1520, 1520, 1520, 1521, 1522, 1521, 1514, 1520, 1520];
            ur = [0, 7, -1, 0, 2, 0, 0];
            g = [45, 46, 48, 74];
            w = [2, 1, 7, 2, 1];
            t = [3, 2, 'OK', 155, 'Пл.', 60 + (num % 10) * 8, 'Нет', 1520, 1524, '+50', 5160];
            ext[20] = cat === 'asosiy' ? '165' : (cat === 'qabul' ? '275' : '375'); // spalling yellow
        } else {
            // DANGER / NOSOZ
            sh = [1520, 1524, 1521, 1522, 1520, 1520, 1520, 1520, 1521, 1522, 1521, 1510, 1520, 1520];
            ur = [0, 12, -1, 0, 2, 0, 0];
            g = [45, 46, 48, 78];
            w = [2, 1, 11, 2, 1];
            t = [3, 2, 'OK', 155, 'Пл.', 110 + (num % 10) * 12, 'Нет', 1520, 1524, '+50', 5160];
            ext[20] = cat === 'asosiy' ? '195' : (cat === 'qabul' ? '295' : '395'); // spalling red
        }
        
        const records = [];
        const baseDate = new Date(2026, 5, 8); // June 8, 2026
        for (let i = 0; i <= 3; i++) {
            const dateObj = new Date(baseDate);
            dateObj.setDate(baseDate.getDate() - i * 7);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dateStr = `${day}.${month}.${dateObj.getFullYear()}`;
            
            // Add slight variations for historical data: older data is closer to normal
            const factor = i === 0 ? 1 : (i === 1 ? 0.755 : (i === 2 ? 0.555 : 0.355));
            
            const histSh = sh.map(v => {
                const diff = v - 1520;
                return Math.round(1520 + diff * factor);
            });
            const histUr = ur.map(v => Math.round(v * factor));
            const histG = g.map(v => Math.round(48 + (v - 48) * factor));
            const histW = w.map(v => Math.max(0, Math.round(v * factor * 10) / 10));
            const histT = [...t];
            const histExt = [...ext];
            if (ext[20] !== '') {
                histExt[20] = String(Math.max(0, Math.round(parseFloat(ext[20]) * factor)));
            }
            
            records.push({
                createdAt: Date.now() - i * 7 * 24 * 3600000,
                date: dateStr,
                sh: histSh,
                ur: histUr,
                p1: 1472,
                p2: 1391,
                g: histG,
                w: histW,
                t: histT,
                ext: histExt
            });
        }
        
        window.pu29DataStore[key] = {
            meta: { 
                station: stNames[bolinmaId] || 'Navbaxor', 
                pathNumber: (num % 2 === 0) ? '1-asosiy' : '2-asosiy', 
                type: (num % 4 === 0) ? 'R-50' : 'R-65', 
                lineCategory: (num % 5 === 0) ? 'boshqa' : ((num % 2 === 0) ? 'qabul' : 'asosiy'),
                marka: '1/11', 
                yearOfManufacture: String(2015 + (num % 8)), 
                switchType: 'Krivolineyniy', 
                sleeperType: (num % 2 === 0) ? 'Beton' : 'Derevo' 
            },
            records: records
        };
    }
    return window.pu29DataStore[key];
};

window.getPU29SwitchStatus = function(bolinmaId, swNum) {
    try {
        const data = window.getPU29SwitchData(bolinmaId, swNum);
        const last = data.records[0];
        if (!last) return 'none';
        
        let hasDanger = false;
        let hasWarning = false;
        
        if (last.sh) {
            const marka = data.meta.marka || '1/11';
            const lineCat = data.meta.lineCategory || 'asosiy';
            last.sh.forEach((v, i) => {
                const colorKey = window.validateGaugeValue(v, i, marka, lineCat);
                if (colorKey === 'red') hasDanger = true;
                else if (colorKey === 'yellow') hasWarning = true;
            });
        }
        if (last.ur) {
            last.ur.forEach(v => {
                const val = Math.abs(parseFloat(v) || 0);
                if (val > 10) hasDanger = true;
                else if (val > 6) hasWarning = true;
            });
        }
        if (last.g) {
            const marka = data.meta ? (data.meta.marka || '1/11') : '1/11';
            last.g.forEach((v, idx) => {
                const val = parseFloat(v);
                if (!isNaN(val)) {
                    const norms = window.getPU29GutterNorms(marka, idx);
                    if (val < norms.yellow[0] || val > norms.yellow[1]) hasDanger = true;
                    else if (val < norms.green[0] || val > norms.green[1]) hasWarning = true;
                }
            });
        }
        if (last.w) {
            const railType = data.meta ? (data.meta.type || 'R-65') : 'R-65';
            const norms = window.getPU29WearNorms(railType);
            last.w.forEach(v => {
                const val = parseFloat(v);
                if (!isNaN(val)) {
                    if (val > norms.yellowMax) hasDanger = true;
                    else if (val > norms.greenMax) hasWarning = true;
                }
            });
        }

        if (last.ext && last.ext[20] !== undefined && last.ext[20] !== '') {
            const chipVal = parseFloat(last.ext[20]);
            if (!isNaN(chipVal)) {
                const sev = window.getChippingSeverity(chipVal, data.meta.lineCategory);
                if (sev === 'qizil') hasDanger = true;
                else if (sev === 'sariq') hasWarning = true;
            }
        }
        if (last.t && last.t[5] !== undefined && last.t[5] !== '') {
            const gruzVal = parseFloat(last.t[5]);
            if (!isNaN(gruzVal)) {
                const sev = window.getGruzSeverity(gruzVal, data.meta.lineCategory, data.meta.marka);
                if (sev === 'qizil') hasDanger = true;
                else if (sev === 'sariq') hasWarning = true;
            }
        }
        if (last.p1 !== undefined && last.p1 !== '') {
            const val = parseFloat(last.p1);
            if (!isNaN(val)) {
                const marka = data.meta ? (data.meta.marka || '1/11') : '1/11';
                const norms = window.getPU29DistanceNorms(marka);
                if (val < norms.kMin) hasDanger = true;
            }
        }
        if (last.p2 !== undefined && last.p2 !== '') {
            const val = parseFloat(last.p2);
            if (!isNaN(val) && val > 1435) hasDanger = true;
        }
        if (last.t) {
            if (last.t[0] !== undefined && last.t[0] !== '') {
                const val = parseFloat(last.t[0]);
                if (!isNaN(val)) {
                    if (val >= 2.0) hasDanger = true;
                    else if (val >= 1.5) hasWarning = true;
                }
            }
            if (last.t[1] !== undefined && last.t[1] !== '') {
                const val = parseFloat(last.t[1]);
                if (!isNaN(val)) {
                    if (val >= 2.0) hasDanger = true;
                    else if (val >= 1.5) hasWarning = true;
                }
            }
            if (last.t[2] !== undefined && last.t[2] !== '') {
                const val = parseFloat(last.t[2]);
                if (!isNaN(val)) {
                    if (val < 4 || val > 6) hasDanger = true;
                } else {
                    const str = String(last.t[2]).toLowerCase().trim();
                    if (str.includes('неиспр') || str.includes('дефект') || str.includes('neisp') || str.includes('def') || str.includes('xavfli')) {
                        hasDanger = true;
                    }
                }
            }
            if (last.t[3] !== undefined && last.t[3] !== '') {
                const val = parseFloat(last.t[3]);
                if (!isNaN(val)) {
                    if (val < 100) {
                        if (val > 3) hasDanger = true;
                    } else {
                        if (val < 152) hasDanger = true;
                    }
                }
            }
            if (last.t[7] !== undefined && last.t[7] !== '') {
                const val = parseFloat(last.t[7]);
                if (!isNaN(val)) {
                    if (val < 1512 || val > 1548) hasDanger = true;
                    else if (val < 1519 || val > 1521) hasWarning = true;
                }
            }
            if (last.t[8] !== undefined && last.t[8] !== '') {
                const val = parseFloat(last.t[8]);
                if (!isNaN(val)) {
                    if (val < 1512 || val > 1548) hasDanger = true;
                    else if (val < 1523 || val > 1525) hasWarning = true;
                }
            }
            if (last.t[9] !== undefined && last.t[9] !== '') {
                const val = Math.abs(parseFloat(last.t[9]) || 0);
                if (val > 50) hasDanger = true;
                else if (val > 30) hasWarning = true;
            }
            if (last.t[10] !== undefined && last.t[10] !== '') {
                const val = parseFloat(last.t[10]);
                if (!isNaN(val)) {
                    if (val < 5150 || val > 5170) hasDanger = true;
                    else if (val < 5155 || val > 5165) hasWarning = true;
                }
            }
        }
        
        if (hasDanger) return 'danger';
        if (hasWarning) return 'warning';
        return 'ok';
    } catch (e) {
        return 'none';
    }
};

window.getPU29SwitchIssues = function(bolinmaId, swNum) {
    try {
        const data = window.getPU29SwitchData(bolinmaId, swNum);
        const last = data.records[0];
        if (!last) return [];
        const issues = [];
        
        if (last.sh) {
            const marka = data.meta.marka || '1/11';
            const lineCat = data.meta.lineCategory || 'asosiy';
            last.sh.forEach((v, i) => {
                const colorKey = window.validateGaugeValue(v, i, marka, lineCat);
                const norms = window.getPU29GaugeNorms(marka, lineCat);
                const secInfo = norms.sections ? norms.sections[Math.min(i, norms.sections.length - 1)] : null;
                const normText = secInfo ? `${secInfo.nom} ±2 мм` : '1520 ±2 мм';
                if (colorKey === 'red') issues.push({type:'sh', label:'Ширина колеи', val: parseFloat(v), norm: normText, severity:'danger', idx:i});
                else if (colorKey === 'yellow') issues.push({type:'sh', label:'Ширина колеи', val: parseFloat(v), norm: normText, severity:'warning', idx:i});
            });
        }
        if (last.ur) {
            last.ur.forEach((v, i) => {
                const val = Math.abs(parseFloat(v) || 0);
                if (val > 10) issues.push({type:'ur', label:'Уровень', val, norm:'±10', severity:'danger', idx:i});
                else if (val > 6) issues.push({type:'ur', label:'Уровень', val, norm:'±6', severity:'warning', idx:i});
            });
        }
        if (last.g) {
            const marka = data.meta ? (data.meta.marka || '1/11') : '1/11';
            last.g.forEach((v, i) => {
                const val = parseFloat(v);
                if (!isNaN(val)) {
                    const norms = window.getPU29GutterNorms(marka, i);
                    if (val < norms.yellow[0] || val > norms.yellow[1]) {
                        issues.push({type:'g', label:'Ширина желоба', val, norm:norms.text, severity:'danger', idx:i});
                    } else if (val < norms.green[0] || val > norms.green[1]) {
                        issues.push({type:'g', label:'Ширина желоба', val, norm:norms.text, severity:'warning', idx:i});
                    }
                }
            });
        }
        if (last.w) {
            const railType = data.meta ? (data.meta.type || 'R-65') : 'R-65';
            const norms = window.getPU29WearNorms(railType);
            last.w.forEach((v, i) => {
                const val = parseFloat(v);
                if (!isNaN(val)) {
                    if (val > norms.yellowMax) issues.push({type:'w', label:'Износ', val, norm:norms.text, severity:'danger', idx:i});
                    else if (val > norms.greenMax) issues.push({type:'w', label:'Износ', val, norm:norms.text, severity:'warning', idx:i});
                }
            });
        }
        if (last.ext && last.ext[20] !== undefined && last.ext[20] !== '') {
            const chipVal = parseFloat(last.ext[20]);
            if (!isNaN(chipVal)) {
                const cat = window.normalizePUCategory(data.meta.lineCategory);
                const sev = window.getChippingSeverity(chipVal, data.meta.lineCategory);
                let normText = '0-149';
                if (cat === 'qabul') normText = '0-224';
                else if (cat === 'boshqa') normText = '0-299';
                
                if (sev === 'qizil') {
                    issues.push({type:'chip', label:'Выкрашивание', val:chipVal, norm:normText, severity:'danger', idx:20});
                } else if (sev === 'sariq') {
                    issues.push({type:'chip', label:'Выкрашивание', val:chipVal, norm:normText, severity:'warning', idx:20});
                }
            }
        }
        if (last.t && last.t[5] !== undefined && last.t[5] !== '') {
            const gruzVal = parseFloat(last.t[5]);
            if (!isNaN(gruzVal)) {
                const marka = data.meta.marka || '1/11';
                const sev = window.getGruzSeverity(gruzVal, data.meta.lineCategory, marka);
                let normText = '≤ 60 млн. т';
                if (marka === '1/9') normText = '≤ 50 млн. т';
                else if (marka === '1/6') normText = '≤ 30 млн. т';
                
                if (sev === 'qizil') {
                    issues.push({type:'gruz', label:'Грузонапряженность', val:gruzVal, norm:normText, severity:'danger', idx:5});
                } else if (sev === 'sariq') {
                    issues.push({type:'gruz', label:'Грузонапряженность', val:gruzVal, norm:normText, severity:'warning', idx:5});
                }
            }
        }
        if (last.p1 !== undefined && last.p1 !== '') {
            const val = parseFloat(last.p1);
            if (!isNaN(val)) {
                const marka = data.meta ? (data.meta.marka || '1/11') : '1/11';
                const norms = window.getPU29DistanceNorms(marka);
                if (val < norms.kMin) {
                    issues.push({type:'p1', label:'Сердечник-Контррельс (С-К)', val, norm:norms.kText, severity:'danger', idx:-1});
                }
            }
        }
        if (last.p2 !== undefined && last.p2 !== '') {
            const val = parseFloat(last.p2);
            if (!isNaN(val) && val > 1435) {
                issues.push({type:'p2', label:'Контррельс-Усовик (К-У)', val, norm:'≤ 1435 мм', severity:'danger', idx:-1});
            }
        }
        if (last.t) {
            if (last.t[0] !== undefined && last.t[0] !== '') {
                const val = parseFloat(last.t[0]);
                if (!isNaN(val)) {
                    if (val >= 2.0) issues.push({type:'t', label:'Понижение остряка', val, norm:'< 2.0 мм', severity:'danger', idx:0});
                    else if (val >= 1.5) issues.push({type:'t', label:'Понижение остряка', val, norm:'< 1.5 мм', severity:'warning', idx:0});
                }
            }
            if (last.t[1] !== undefined && last.t[1] !== '') {
                const val = parseFloat(last.t[1]);
                if (!isNaN(val)) {
                    if (val >= 2.0) issues.push({type:'t', label:'Отставание остряка', val, norm:'< 2.0 мм', severity:'danger', idx:1});
                    else if (val >= 1.5) issues.push({type:'t', label:'Отставание остряка', val, norm:'< 1.5 мм', severity:'warning', idx:1});
                }
            }
            if (last.t[2] !== undefined && last.t[2] !== '') {
                const val = parseFloat(last.t[2]);
                if (!isNaN(val)) {
                    if (val < 4 || val > 6) {
                        issues.push({type:'t', label:'КОР', val, norm:'4-6 мм', severity:'danger', idx:2});
                    }
                } else {
                    const str = String(last.t[2]).toLowerCase().trim();
                    if (str.includes('неиспр') || str.includes('дефект') || str.includes('neisp') || str.includes('def') || str.includes('xavfli')) {
                        issues.push({type:'t', label:'КОР', val:last.t[2], norm:'Исправно', severity:'danger', idx:2});
                    }
                }
            }
            if (last.t[3] !== undefined && last.t[3] !== '') {
                const val = parseFloat(last.t[3]);
                if (!isNaN(val)) {
                    if (val < 100) {
                        if (val > 3) issues.push({type:'t', label:'Шаг остряка', val, norm:'≤ 3 мм', severity:'danger', idx:3});
                    } else {
                        if (val < 152) issues.push({type:'t', label:'Шаг остряка', val, norm:'≥ 152 мм', severity:'danger', idx:3});
                    }
                }
            }
            if (last.t[7] !== undefined && last.t[7] !== '') {
                const val = parseFloat(last.t[7]);
                if (!isNaN(val)) {
                    if (val < 1512 || val > 1548) issues.push({type:'t', label:'Примыкание 1520', val, norm:'1512-1548', severity:'danger', idx:7});
                    else if (val < 1519 || val > 1521) issues.push({type:'t', label:'Примыкание 1520', val, norm:'1519-1521', severity:'warning', idx:7});
                }
            }
            if (last.t[8] !== undefined && last.t[8] !== '') {
                const val = parseFloat(last.t[8]);
                if (!isNaN(val)) {
                    if (val < 1512 || val > 1548) issues.push({type:'t', label:'Острие 1524', val, norm:'1512-1548', severity:'danger', idx:8});
                    else if (val < 1523 || val > 1525) issues.push({type:'t', label:'Острие 1524', val, norm:'1523-1525', severity:'warning', idx:8});
                }
            }
            if (last.t[9] !== undefined && last.t[9] !== '') {
                const val = parseFloat(last.t[9]);
                if (!isNaN(val)) {
                    const absVal = Math.abs(val);
                    if (absVal > 50) issues.push({type:'t', label:'Зазор стыка (±50)', val, norm:'±50 мм', severity:'danger', idx:9});
                    else if (absVal > 30) issues.push({type:'t', label:'Зазор стыка (±50)', val, norm:'±30 мм', severity:'warning', idx:9});
                }
            }
            if (last.t[10] !== undefined && last.t[10] !== '') {
                const val = parseFloat(last.t[10]);
                if (!isNaN(val)) {
                    if (val < 5150 || val > 5170) issues.push({type:'t', label:'Длина плети 5160', val, norm:'5150-5170', severity:'danger', idx:10});
                    else if (val < 5155 || val > 5165) issues.push({type:'t', label:'Длина плети 5160', val, norm:'5155-5165', severity:'warning', idx:10});
                }
            }
        }
        return issues;
    } catch (e) {
        return [];
    }
};

// --- REAL DATA READER for Dashboard ---
// TONNA  ← t[5]  (Грузонапряж.)
// YEYILISH ← w (Износ) - maksimal qiymat (xavflik darajasi)
// ORALIQ ← g (Ширина желоба) - maksimal qiymat
window.getPU29LiveStats = function(bolinmaId, swNum) {
    const data = window.getPU29SwitchData(bolinmaId, swNum);
    const r = (data.records && data.records[0]) ? data.records[0] : null;
    const railType = data.meta ? (data.meta.type || 'R-65') : 'R-65';
    const wNorms = window.getPU29WearNorms(railType);
    if (!r) return { tonna: '—', wear: '—', gap: '—', wearNorm: wNorms.text, gapNorm: '45-73', type: railType };
    
    const tonna = (r.t && r.t[5] !== undefined && r.t[5] !== '') ? r.t[5] : '—';
    
    let wear = '—', wearNorm = wNorms.text;
    if (r.w && r.w.length > 0) {
        const wValues = r.w.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (wValues.length > 0) {
            wear = Math.max(...wValues);
            wearNorm = wNorms.text;
        }
    }
    
    let gap = '—', gapNorm = '45-73';
    if (r.g && r.g.length > 0) {
        const gValues = r.g.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (gValues.length > 0) {
            gap = Math.max(...gValues);
            gapNorm = '45-73';
        }
    }
    
    return { tonna, wear, gap, wearNorm, gapNorm, type: railType };
};


// --- SMART DASHBOARD WITH FILTERS ---
window.getPU29FilteredSwitches = function(bolinmaId, filters = {}) {
    const switches = window.pu29Pages[bolinmaId] || window.pu29Pages['bolinma1'];
    return switches.filter(sw => {
        const data = window.getPU29SwitchData(bolinmaId, sw);
        const meta = data.meta;
        const status = window.getPU29SwitchStatus(bolinmaId, sw);
        
        if (filters.category && filters.category !== 'all') {
            if (window.normalizePUCategory(meta.lineCategory) !== filters.category) return false;
        }
        if (filters.type && filters.type !== 'all') {
            if (meta.type !== filters.type) return false;
        }
        if (filters.status && filters.status !== 'all') {
            if (status !== filters.status) return false;
        }
        return true;
    });
};

window.getPU29GroupedSwitches = function(bolinmaId, filters = {}) {
    const switches = window.getPU29FilteredSwitches(bolinmaId, filters);
    const groups = {
        'asosiy': { label: 'ASOSIY YO\'LLAR', icon: 'fa-road', color: '#3b82f6', items: [] },
        'qabul':  { label: 'QABUL QILISH',   icon: 'fa-arrow-circle-right', color: '#10b981', items: [] },
        'jonash': { label: 'JONASH',          icon: 'fa-exchange-alt', color: '#a855f7', items: [] },
        'boshqa': { label: 'BOSHQA YO\'LLAR', icon: 'fa-ellipsis-h', color: '#64748b', items: [] }
    };
    
    switches.forEach(sw => {
        const data = window.getPU29SwitchData(bolinmaId, sw);
        const category = window.normalizePUCategory(data.meta.lineCategory);
        if (!groups[category]) groups['boshqa'].items.push(sw);
        else groups[category].items.push(sw);
    });
    
    return groups;
};
// --- SMART DASHBOARD WITH FILTERS ---
window.renderPU29Dashboard = function(bolinmaId, filters = {}) {
    if (!bolinmaId) bolinmaId = currentPU29Bolinma;
    currentPU29Bolinma = bolinmaId;
    
    let container = document.getElementById("pu29-window-modal");
    if (!container) {
        container = document.createElement("div");
        container.id = "pu29-window-modal";
        container.className = "active";
        container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#0b0f19;z-index:10025;overflow:auto;";
        document.body.appendChild(container);
    }
    
    const filteredSwitches = window.getPU29FilteredSwitches(bolinmaId, filters);
    const grouped = window.getPU29GroupedSwitches(bolinmaId, filters);
    
    let stats = { ok: 0, warning: 0, danger: 0, none: 0 };
    filteredSwitches.forEach(sw => { 
        const st = window.getPU29SwitchStatus(bolinmaId, sw);
        if (stats[st] !== undefined) stats[st]++;
        else stats.none++;
    });

    container.innerHTML = `
        <div style="background:#0b0f19; min-height:100vh; color:#fff; font-family:'Inter', sans-serif; display:flex;">
            <!-- Main Panel -->
            <div style="flex-grow:1; padding:40px; overflow-y:auto;">
                <!-- KPI Cards -->
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:25px; margin-bottom:50px;">
                    ${[
                        ['JAMI', filteredSwitches.length, '#1e293b'],
                        ['SOZ', stats.ok || 0, '#065f46'],
                        ['OGOHLANTIRISH', stats.warning || 0, '#92400e'],
                        ['XAVFLI', stats.danger || 0, '#991b1b']
                    ].map(([lbl, val, bg]) => `
                        <div style="background:${bg}; padding:30px; border-radius:20px; border:1px solid rgba(255,255,255,0.05); box-shadow:0 15px 30px rgba(0,0,0,0.3);">
                            <div style="font-size:0.7rem; font-weight:900; color:rgba(255,255,255,0.4); margin-bottom:15px; letter-spacing:1px; text-transform:uppercase;">${lbl}</div>
                            <div style="font-size:3.5rem; font-weight:900; color:#fff;">${val}</div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Main Panel -->
                <div style="background:#161b2c; border-radius:25px; padding:40px; border:2px solid rgba(251,191,36,0.1); position:relative;">
                    <div style="position:absolute; top:35px; right:40px;">
                        <button onclick="window.closePU29Window();" style="background:#ef4444; color:#fff; border:none; padding:10px 25px; border-radius:10px; cursor:pointer; font-weight:800; text-transform:uppercase; font-size:0.8rem;">CHIQISH</button>
                    </div>
                    <div style="color:#fbbf24; font-size:0.8rem; font-weight:900; margin-bottom:15px; letter-spacing:2px;">ANALITIKA ZONE</div>
                    <h2 style="margin:0 0 40px; font-size:2.2rem; font-weight:900;">STRELKALAR DIAGNOSTIKASI</h2>
                    
                    <div style="display:flex; gap:30px;">
                        <div style="width:300px; display:flex; flex-direction:column; gap:20px;">
                            <div style="background:rgba(0,0,0,0.2); border-radius:15px; padding:20px; border:1px solid rgba(255,255,255,0.05);">
                                <div style="font-size:0.7rem; color:#64748b; font-weight:700; margin-bottom:10px;">STATISTIKA</div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                    <span style="color:#10b981;">Soz</span>
                                    <span style="font-weight:900; color:#10b981;">${stats.ok || 0}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                    <span style="color:#fbbf24;">Ogohlantirish</span>
                                    <span style="font-weight:900; color:#fbbf24;">${stats.warning || 0}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="color:#ef4444;">Xavfli</span>
                                    <span style="font-weight:900; color:#ef4444;">${stats.danger || 0}</span>
                                </div>
                            </div>
                            
                            <div style="background:rgba(251,191,36,0.05); padding:20px; border-radius:20px; border:1px solid rgba(251,191,36,0.1); font-size:0.75rem; color:rgba(255,255,255,0.6); line-height:1.6;">
                                ${stats.danger > 0 ? `<span style="color:#ef4444; font-weight:700;">⚠ ${stats.danger} ta strelkada kritik nosozliklar aniqlandi!</span><br><br>` : ''}
                                Tanlangan filtr bo'yicha <strong>${filteredSwitches.length}</strong> ta strelka ko'rsatilmoqda.
                            </div>
                        </div>
                        
                        <!-- Grouped Table View -->
                        <div style="flex-grow:1; background:rgba(0,0,0,0.2); border-radius:20px; padding:20px; border:1px solid rgba(255,255,255,0.05); overflow-x:auto;">
                            ${Object.entries(grouped).filter(([k,v]) => v.items.length > 0).map(([catKey, cat]) => {
                                const catStats = { ok: 0, warning: 0, danger: 0 };
                                cat.items.forEach(sw => {
                                    const st = window.getPU29SwitchStatus(bolinmaId, sw);
                                    if (catStats[st] !== undefined) catStats[st]++;
                                });
                                return `
                                <div style="margin-bottom:25px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; background:${cat.color}15; border:1px solid ${cat.color}33; border-radius:10px; margin-bottom:10px;">
                                        <div style="display:flex; align-items:center; gap:10px;">
                                            <i class="fas ${cat.icon}" style="color:${cat.color};"></i>
                                            <span style="font-weight:800; font-size:0.95rem;">${cat.label}</span>
                                            <span style="background:${cat.color}33; color:${cat.color}; padding:2px 10px; border-radius:5px; font-size:0.75rem; font-weight:700;">${cat.items.length} ta</span>
                                        </div>
                                        <div style="display:flex; gap:8px; font-size:0.75rem;">
                                            ${catStats.ok > 0 ? `<span style="color:#10b981;">OK:${catStats.ok}</span>` : ''}
                                            ${catStats.warning > 0 ? `<span style="color:#fbbf24;">W:${catStats.warning}</span>` : ''}
                                            ${catStats.danger > 0 ? `<span style="color:#ef4444;">D:${catStats.danger}</span>` : ''}
                                        </div>
                                    </div>
                                    <table style="width:100%; border-collapse:collapse; color:rgba(255,255,255,0.8); font-size:0.85rem;">
                                        <thead><tr style="text-align:left; color:#64748b; font-size:0.65rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                                            <th style="padding:10px;">№</th>
                                            <th>Holat</th>
                                            <th>Rel'</th>
                                            <th>Tonna</th>
                                            <th>Yeyilish</th>
                                            <th>Oraliq</th>
                                            <th>Nosozliklar</th>
                                        </tr></thead>
                                        <tbody>
                                            ${cat.items.map(sw => {
                                                const st = window.getPU29SwitchStatus(bolinmaId, sw);
                                                const live = window.getPU29LiveStats(bolinmaId, sw);
                                                const issues = window.getPU29SwitchIssues(bolinmaId, sw);
                                                const color = st==='ok'?'#10b981':(st==='warning'?'#fbbf24':'#ef4444');
                                                const typeColor = live.type === 'R-65' ? '#60a5fa' : (live.type === 'R-50' ? '#fbbf24' : '#34d399');
                                                const issuesHtml = issues.length > 0 
                                                    ? issues.map(issue => {
                                                        const sevColor = issue.severity === 'danger' ? '#ef4444' : '#fbbf24';
                                                        return `<span style="display:inline-block; background:${sevColor}22; color:${sevColor}; border:1px solid ${sevColor}44; padding:1px 6px; border-radius:4px; font-size:0.65rem; margin:1px; font-weight:700;">${issue.label}: ${issue.val} (norm: ${issue.norm})</span>`;
                                                    }).join('')
                                                    : '<span style="color:#64748b; font-size:0.8rem;">—</span>';
                                                return `<tr onclick="window.openPU29Window('${bolinmaId}','${sw}')" style="border-bottom:1px solid rgba(255,255,255,0.02); cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                                    <td style="padding:10px; font-weight:800;">№ ${sw}</td>
                                                    <td style="padding:10px;"><span style="color:${color}; border:1px solid ${color}44; padding:2px 8px; border-radius:5px; font-size:0.7rem; font-weight:900;">${st.toUpperCase()}</span></td>
                                                    <td style="padding:10px;"><span style="background:${typeColor}22; color:${typeColor}; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;">${live.type || 'R-65'}</span></td>
                                                    <td style="padding:10px; color:#fbbf24; font-weight:800;">${live.tonna} <span style="font-size:0.6rem; opacity:0.5;">MLN</span></td>
                                                    <td style="padding:10px; color:#10b981; font-weight:700;">${live.wear} <span style="font-size:0.6rem; opacity:0.5;">mm</span></td>
                                                    <td style="padding:10px; color:#10b981; font-weight:700;">${live.gap} <span style="font-size:0.6rem; opacity:0.5;">mm</span></td>
                                                    <td style="padding:10px; font-size:0.7rem; line-height:1.3;">${issuesHtml}</td>
                                                </tr>`;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>`;
                            }).join('')}
                            ${Object.values(grouped).every(g => g.items.length === 0) ? '<div style="color:#64748b; text-align:center; padding:40px;">Tanlangan filtr bo\'yicha strelkalar topilmadi</div>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.applyPU29Filters = function() {
    const status = document.getElementById('filter-status')?.value || 'all';
    const category = document.getElementById('filter-category')?.value || 'all';
    const type = document.getElementById('filter-type')?.value || 'all';
    window.renderPU29Dashboard(currentPU29Bolinma, { status, category, type });
};

// --- PU-29 TABLE VIEW (White Paper) ---
window.openPU29Window = function (bolinmaId, swNum) {
    currentPU29Bolinma = bolinmaId; currentPU29Switch = swNum;
    const data = window.getPU29SwitchData(bolinmaId, swNum); const m = data.meta;
    
    let container = document.getElementById("pu29-window-modal");
    if (!container) {
        container = document.createElement("div");
        container.id = "pu29-window-modal";
        container.className = "active";
        container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#f1f5f9;z-index:10025;overflow:auto;";
        document.body.appendChild(container);
    }
    const switches = window.pu29Pages[bolinmaId] || [];
    const selectOptions = switches.map(sw => `<option value="${sw}" ${sw === swNum ? 'selected' : ''}>№ ${sw}</option>`).join('');
    const selectHtml = `
        <select onchange="window.openPU29Window('${bolinmaId}', this.value)" class="pu29-header-select">
            ${selectOptions}
        </select>
    `;
    container.innerHTML = `
        <div style="background:#f1f5f9; min-height:100vh; padding:15px; font-family:'Inter', sans-serif;">
            <div style="max-width:99%; margin:0 auto; background:#fff; border-radius:15px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); border:1px solid #e2e8f0;">
                <div style="background: #1e293b; padding:15px 30px; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:800; font-size:1.3rem; color:#fbbf24; display:flex; align-items:center;">
                        <span>PU-29 SMART-PCH | </span>
                        ${selectHtml}
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button onclick="window.createNewPU29Record()" style="padding:10px 25px; background:#fbbf24; color:#1e293b; border:none; cursor:pointer; font-weight:800; border-radius:8px;">+ TEKSHIRUV QO'SHISH</button>
                        <button onclick="window.closePU29Window()" style="padding:10px 25px; background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:8px; cursor:pointer;">CHIQISH</button>
                    </div>
                </div>
                <!-- TABS -->
                <div style="display:flex; background:#f8fafc; border-bottom:2px solid #e2e8f0;">
                    <button id="pu29-tab-journal" onclick="window.switchPU29Tab('journal')" style="flex:1; padding:14px; border:none; background:#fff; color:#1e293b; font-weight:800; font-size:0.9rem; cursor:pointer; border-bottom:3px solid #fbbf24; text-transform:uppercase;">TEKSHIRUV JURNALI</button>
                    <button id="pu29-tab-ordinat" onclick="window.switchPU29Tab('ordinat')" style="flex:1; padding:14px; border:none; background:#f1f5f9; color:#64748b; font-weight:800; font-size:0.9rem; cursor:pointer; border-bottom:3px solid transparent; text-transform:uppercase;">ORDINAT O'LCHOVLARI</button>
                </div>
                <!-- TAB: JOURNAL -->
                <div id="pu29-tab-content-journal">
                    <div style="padding:30px 50px 10px; color:#000;">
                        <h1 style="text-align:center; font-size:1.8rem; font-weight:900; text-decoration:underline; margin-bottom:30px; color:#000;">ЖУРНАЛ ПРОВЕРКИ СТРЕЛОЧНОГО ПЕРЕВОДА (ПУ-29)</h1>
                        
                        <div class="pu29-meta-grid">
                            <!-- Station -->
                            <div class="pu29-meta-card">
                                <span class="pu29-meta-label">Станция</span>
                                <input type="text" class="pu29-input" value="${m.station || ''}" onblur="window.savePUMeta('station', this.value)" placeholder="Станция номи" />
                            </div>
                            
                            <!-- Strela No -->
                            <div class="pu29-meta-card">
                                <span class="pu29-meta-label">Стрелка №</span>
                                <div class="pu29-static-val">${swNum}</div>
                            </div>
                            
                            <!-- Tip -->
                            <div class="pu29-meta-card">
                                <span class="pu29-meta-label">Тип</span>
                                <select class="pu29-select" onchange="window.savePUMeta('type', this.value)">
                                    <option value="R-65" ${m.type === 'R-65' ? 'selected' : ''}>R-65</option>
                                    <option value="R-50" ${m.type === 'R-50' ? 'selected' : ''}>R-50</option>
                                    <option value="R-43" ${m.type === 'R-43' ? 'selected' : ''}>R-43</option>
                                </select>
                            </div>
                            
                            <!-- Put No -->
                            <div class="pu29-meta-card">
                                <span class="pu29-meta-label">Путь №</span>
                                <select class="pu29-select" onchange="window.savePUPath(this.value)">
                                    <option value="ASOSIY" ${m.lineCategory === 'ASOSIY' || m.lineCategory === 'asosiy' ? 'selected' : ''}>ASOSIY</option>
                                    <option value="Qabul qilish - Jo'nash" ${m.lineCategory === "Qabul qilish - Jo'nash" || m.lineCategory === 'Qabul qilish - Jonash' || m.lineCategory === 'qabul' || m.lineCategory === 'jonash' ? 'selected' : ''}>Qabul qilish - Jo'nash</option>
                                    <option value="Boshqa" ${m.lineCategory === 'Boshqa' || m.lineCategory === 'boshqa' ? 'selected' : ''}>Boshqa</option>
                                </select>
                            </div>
                            
                            <!-- Marka -->
                            <div class="pu29-meta-card">
                                <span class="pu29-meta-label">Марка</span>
                                ${(() => {
                                    const cat = window.normalizePUCategory(m.lineCategory);
                                    const isAsosiy = cat === 'asosiy';
                                    const isQabul  = cat === 'qabul' || cat === 'jonash';
                                    const label11 = isAsosiy ? ' ✓ (стандарт)' : '';
                                    const label9  = isAsosiy ? ' (только прямое)' : (isQabul ? ' (осн. грузовые)' : '');
                                    const label6  = isAsosiy ? ' ⚠ (не рекомендуется)' : (isQabul ? ' (симм. стрелки)' : '');
                                    return `<select class="pu29-select" onchange="window.savePUMeta('marka', this.value)">
                                        <option value="1/11" ${m.marka === '1/11' ? 'selected' : ''}>1/11${label11}</option>
                                        <option value="1/9"  ${m.marka === '1/9'  ? 'selected' : ''}>1/9${label9}</option>
                                        <option value="1/6"  ${m.marka === '1/6'  ? 'selected' : ''}>1/6${label6}</option>
                                    </select>`;
                                })()}
                            </div>
                            
                            <!-- Ostryaki -->
                            <div class="pu29-meta-card">
                                <span class="pu29-meta-label">Остряки</span>
                                <select class="pu29-select" onchange="window.savePUMeta('switchType', this.value)">
                                    <option value="o'ng" ${m.switchType === "o'ng" || m.switchType === 'Krivolineyniy' ? 'selected' : ''}>o'ng</option>
                                    <option value="chap" ${m.switchType === 'chap' ? 'selected' : ''}>chap</option>
                                </select>
                            </div>
                            
                            <!-- God -->
                            <div class="pu29-meta-card">
                                <span class="pu29-meta-label">Год</span>
                                <select class="pu29-select" onchange="window.savePUMeta('yearOfManufacture', this.value)">
                                    ${[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => `
                                        <option value="${y}" ${String(m.yearOfManufacture) === String(y) ? 'selected' : ''}>${y}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <!-- SleeperType -->
                            <div class="pu29-meta-card">
                                <span class="pu29-meta-label">Брусья</span>
                                <select class="pu29-select" onchange="window.savePUMeta('sleeperType', this.value)">
                                    <option value="temir beton" ${m.sleeperType === 'temir beton' || m.sleeperType === 'Beton' ? 'selected' : ''}>temir beton</option>
                                    <option value="yog'och" ${m.sleeperType === "yog'och" || m.sleeperType === 'Derevo' ? 'selected' : ''}>yog'och</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div id="pu29-live-table" style="padding:20px; overflow-x:auto;">${window.generateMegaTableHTML()}</div>
                </div>
                <!-- TAB: ORDINAT -->
                <div id="pu29-tab-content-ordinat" style="display:none;">
                    ${window.generatePU29OrdinatHTML(bolinmaId, swNum, m)}
                </div>
            </div>
        </div>
    `;
};

// =====================================================
// PU-29 MEYORLAR: Путь № + Марка kombinatsiyasiga qarab
// =====================================================
/**
 * Asosiy yo'l (Главные пути) uchun Марка bo'yicha ширина колеи meyorlari:
 *   1/11: styk_ram=1520, u_ostriya=1524, per_krivaya=1520–1521, v_krest=1520  → nominal ±2 mm
 *   1/9:  faqat to'g'ri yo'nalish, xuddi 1/11 (1520/1524/1521/1520)         → nominal ±2 mm
 *   1/6:  TAVSIYA ETILMAYDI (tabu), lekin minimal ≥1512 dan past = xavfli
 *
 * Qabul qilish-jo'nash (Приёмо-отправочные) uchun:
 *   1/11, 1/9: nominal 1520 ±3 mm  (1517–1523 yashil, 1514–1516/1524–1526 sariq)
 *   1/6:       nominal 1520 ±3 mm
 *
 * Boshqa yo'llar uchun:
 *   Barcha markalar: 1520 ±3 mm
 *
 * sh_position indekslari (0–10):
 *   0: styk_ram (рамный рельс стыки)
 *   1: u_ostriya (острие остряка)
 *   2–3: koren (корень остряка: прямой, боковой)
 *   4: per_krivaya (середина переводной кривой)
 *   5–6: v_krest (крестовина: прямой, боковой)
 *   7–10: zadniy styk / прочие
 */
window.getPU29GaugeNorms = function(marka, lineCategory) {
    const cat = window.normalizePUCategory(lineCategory);
    // Asosiy yo'l — Главный путь
    if (cat === 'asosiy') {
        if (marka === '1/11' || marka === '1/9') {
            // Допустимые отклонения (раздел 4 книги, для всех путей):
            //   Стык рамного рельса, острие остряка : +4 / −2 мм от номинала
            //   Середина переводной кривой          : +10 / −2 мм от номинала
            //   Крестовина и конец кривой           : +3 / −3 мм от номинала
            //
            // Зелёный  = nom+(-min) .. nom+(+max)
            // Жёлтый   = ещё не критично, но выход за зелёный
            // Красный  = < 1512 / > 1548 (абсолютный предел ПТЭ)
            return {
                type: 'asosiy_11_9',
                sections: [
                    // idx 0: Стык рамного рельса   nom=1520, +4/−2
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Стык рамных рельсов' },
                    // idx 1: У острия остряка        nom=1524, +4/−2
                    { nom: 1524, green: [1522, 1528], yellow: [1518, 1532], name: 'У острия остряка' },
                    // idx 2: Корень (прямой)         nom=1520, +4/−2
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (прямой)' },
                    // idx 3: Корень (боковой)        nom=1520, +4/−2
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (боковой)' },
                    // idx 4: Середина перев. кривой  nom=1520, +10/−2
                    { nom: 1520, green: [1518, 1530], yellow: [1514, 1534], name: 'Середина переводной кривой' },
                    // idx 5: Крестовина (прямой)     nom=1520, +3/−3
                    { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (прямой)' },
                    // idx 6: Крестовина (боковой)    nom=1520, +3/−3
                    { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (боковой)' },
                    // idx 7-10: прочие               nom=1520, +4/−2
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Прочие сечения' },
                ],
                danger_abs: [1512, 1548]
            };
        } else if (marka === '1/6') {
            // 1/6 asosiy yo'lda tavsiya etilmaydi — kengaytirilgan sariq zona
            return {
                type: 'asosiy_6',
                sections: [
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Стык рамных рельсов' },
                    { nom: 1524, green: [1522, 1528], yellow: [1518, 1532], name: 'У острия остряка' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (прямой)' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (боковой)' },
                    { nom: 1520, green: [1518, 1530], yellow: [1514, 1534], name: 'Середина переводной кривой' },
                    { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (прямой)' },
                    { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (боковой)' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Прочие сечения' },
                ],
                danger_abs: [1512, 1548]
            };
        }
    }
    // Qabul qilish-jo'nash yo'li (Приёмо-отправочные пути)
    if (cat === 'qabul' || cat === 'jonash') {
        if (marka === '1/11') {
            return {
                type: 'qabul_11',
                sections: [
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Стык рамных рельсов' },
                    { nom: 1524, green: [1522, 1528], yellow: [1518, 1532], name: 'У острия остряка' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (прямой)' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (боковой)' },
                    { nom: 1520, green: [1518, 1530], yellow: [1514, 1534], name: 'Середина перев. кривой' },
                    { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (прямой)' },
                    { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (боковой)' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Прочие сечения' },
                ],
                danger_abs: [1512, 1548]
            };
        } else if (marka === '1/9') {
            // 1/9 qabul: v_krest боковой = 1524 (по боковому направлению)
            return {
                type: 'qabul_9',
                sections: [
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Стык рамных рельсов' },
                    { nom: 1524, green: [1522, 1528], yellow: [1518, 1532], name: 'У острия остряка' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (прямой)' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (боковой)' },
                    { nom: 1521, green: [1519, 1531], yellow: [1515, 1535], name: 'Середина перев. кривой' },
                    { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (прямой)' },
                    // боковой = 1524, +3/−3
                    { nom: 1524, green: [1521, 1527], yellow: [1517, 1531], name: 'В крестовине (боковой) ПО БОК' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Прочие сечения' },
                ],
                danger_abs: [1512, 1548]
            };
        } else if (marka === '1/6') {
            // 1/6 qabul: симметричные стрелки, v_krest боковой = 1524
            return {
                type: 'qabul_6',
                sections: [
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Стык рамных рельсов' },
                    { nom: 1524, green: [1522, 1528], yellow: [1518, 1532], name: 'У острия остряка' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (прямой)' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (боковой)' },
                    { nom: 1520, green: [1518, 1530], yellow: [1514, 1534], name: 'Середина перев. кривой' },
                    { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (прямой)' },
                    // боковой = 1524, +3/−3
                    { nom: 1524, green: [1521, 1527], yellow: [1517, 1531], name: 'В крестовине (боковой) ПО БОК' },
                    { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Прочие сечения' },
                ],
                danger_abs: [1512, 1548]
            };
        }
    }
    // Boshqa yo'llar — barcha markalar uchun
    return {
        type: 'boshqa',
        sections: [
            { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Стык рамных рельсов' },
            { nom: 1524, green: [1522, 1528], yellow: [1518, 1532], name: 'У острия остряка' },
            { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (прямой)' },
            { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Корень (боковой)' },
            { nom: 1520, green: [1518, 1530], yellow: [1514, 1534], name: 'Середина перев. кривой' },
            { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (прямой)' },
            { nom: 1520, green: [1517, 1523], yellow: [1513, 1527], name: 'В крестовине (боковой)' },
            { nom: 1520, green: [1518, 1524], yellow: [1514, 1528], name: 'Прочие сечения' },
        ],
        danger_abs: [1512, 1548]
    };

};

window.getPU29WearNorms = function(railType) {
    const type = railType || 'R-65';
    if (type === 'R-50') {
        return {
            greenMax: 5,
            yellowMax: 7,
            text: '0-5 мм',
            yellowText: '5-7 мм',
            dangerText: '> 7 мм'
        };
    } else if (type === 'R-43') {
        return {
            greenMax: 4,
            yellowMax: 5.5,
            text: '0-4 мм',
            yellowText: '4-5.5 мм',
            dangerText: '> 5.5 мм'
        };
    } else { // R-65 is default
        return {
            greenMax: 6,
            yellowMax: 8,
            text: '0-6 мм',
            yellowText: '6-8 мм',
            dangerText: '> 8 мм'
        };
    }
};

window.getPU29GutterNorms = function(marka, gutterIdx) {
    const m = marka || '1/11';
    if (m === '1/9') {
        if (gutterIdx === 0) { // J1 (контррельс)
            return { nominal: 48, green: [46, 50], yellow: [44, 52], text: '46-50' };
        } else { // J2 (усовик, горло, корень)
            return { nominal: 44, green: [42, 46], yellow: [40, 48], text: '42-46' };
        }
    } else if (m === '1/6') {
        if (gutterIdx === 0) { // J1 (контррельс)
            return { nominal: 50, green: [48, 52], yellow: [46, 54], text: '48-52' };
        } else { // J2 (усовик, горло, корень)
            return { nominal: 46, green: [44, 48], yellow: [42, 50], text: '44-48' };
        }
    } else { // 1/11 (default)
        if (gutterIdx === 0) { // J1 (контррельс)
            return { nominal: 46, green: [45, 48], yellow: [43, 50], text: '45-48' };
        } else { // J2 (усовик, горло, корень)
            return { nominal: 42, green: [41, 44], yellow: [39, 46], text: '41-44' };
        }
    }
};

window.getPU29DistanceNorms = function(marka) {
    const m = marka || '1/11';
    if (m === '1/9') {
        return { kMin: 1475, uMax: 1435, kText: '≥ 1475 мм', uText: '≤ 1435 мм' };
    } else if (m === '1/6') {
        return { kMin: 1480, uMax: 1435, kText: '≥ 1480 мм', uText: '≤ 1435 мм' };
    } else { // 1/11
        return { kMin: 1472, uMax: 1435, kText: '≥ 1472 мм', uText: '≤ 1435 мм' };
    }
};

/**
 * Berilgan sh qiymatini va secheni indeksini validatsiya qiladi
 * @returns 'green'|'yellow'|'red'|''
 */
window.validateGaugeValue = function(val, sectionIdx, marka, lineCategory) {
    const v = parseFloat(val);
    if (isNaN(v) || val === '' || val === null || val === undefined) return '';
    const norms = window.getPU29GaugeNorms(marka, lineCategory);
    let gMin, gMax, yMin, yMax;
    if (norms.sections) {
        const s = norms.sections[Math.min(sectionIdx, norms.sections.length - 1)];
        [gMin, gMax] = s.green;
        [yMin, yMax] = s.yellow;
    } else {
        [gMin, gMax] = norms.green || [1516, 1546];
        [yMin, yMax] = norms.yellow || [1512, 1548];
    }
    const [dMin, dMax] = norms.danger_abs || [1512, 1548];
    if (v < dMin || v > dMax) return 'red';
    if (v >= gMin && v <= gMax) return 'green';
    if (v >= yMin && v <= yMax) return 'yellow';
    return 'red';
};

/** Meyorga mos CSS qoida qaytaradi */
window.gaugeBg = function(colorKey) {
    if (colorKey === 'red')    return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
    if (colorKey === 'yellow') return 'background:#fef9c3; color:#854d0e; font-weight:900;';
    if (colorKey === 'green')  return 'background:#dcfce7; color:#166534; font-weight:900;';
    return '';
};

window.savePUMeta = function(f, v) { 
    const key = `${currentPU29Bolinma}_${currentPU29Switch}`; 
    window.pu29DataStore[key].meta[f] = v;
    // Марка yoki yo'l turi o'zgarganda jadval ranglarini qayta hisoblash
    if (f === 'marka' || f === 'lineCategory') {
        window.openPU29Window(currentPU29Bolinma, currentPU29Switch);
    } else {
        window.openPU29Window(currentPU29Bolinma, currentPU29Switch);
    }
};
window.savePUPath = function(v) {
    const key = `${currentPU29Bolinma}_${currentPU29Switch}`;
    const meta = window.pu29DataStore[key].meta;
    meta.pathNumber = v;
    if (v === 'ASOSIY') {
        meta.lineCategory = 'ASOSIY';
    } else if (v === "Qabul qilish - Jo'nash") {
        meta.lineCategory = 'Qabul qilish - Jonash';
    } else {
        meta.lineCategory = 'Boshqa';
    }
    // Yo'l turi o'zgarganda Марка ro'yxatini ham yangilash
    window.openPU29Window(currentPU29Bolinma, currentPU29Switch);
};
window.normalizePUCategory = function(cat) {
    if (!cat) return 'boshqa';
    const c = String(cat).toLowerCase().trim();
    if (c === 'asosiy' || c.includes('asosiy')) return 'asosiy';
    if (c === 'qabul' || c.includes('qabul') || c.includes('jonash')) return 'qabul';
    if (c === 'jonash') return 'jonash';
    return 'boshqa';
};
window.savePU29Val = function(idx, t, p, v) { const key = `${currentPU29Bolinma}_${currentPU29Switch}`; const r = window.pu29DataStore[key].records[idx]; if(p===-1) r[t]=v; else r[t][p]=v; };
window.createNewPU29Record = function() {
    const key = `${currentPU29Bolinma}_${currentPU29Switch}`;
    window.pu29DataStore[key].records.unshift({ createdAt: Date.now(), date: new Date().toLocaleDateString(), sh: new Array(14).fill(''), ur: new Array(7).fill(''), p1:'', p2:'', g:new Array(4).fill(''), w:new Array(5).fill(''), t:new Array(11).fill(''), ext: new Array(30).fill('') });
    document.getElementById("pu29-live-table").innerHTML = window.generateMegaTableHTML();
};


window.getChippingSeverity = function(val, category) {
    const v = parseFloat(val);
    if (isNaN(v) || v <= 0) return 'yashil';
    const cat = window.normalizePUCategory(category);
    if (cat === 'asosiy') {
        if (v >= 191) return 'qizil';
        if (v >= 150) return 'sariq';
        return 'yashil';
    } else if (cat === 'qabul') {
        if (v >= 286) return 'qizil';
        if (v >= 225) return 'sariq';
        return 'yashil';
    } else {
        if (v >= 381) return 'qizil';
        if (v >= 300) return 'sariq';
        return 'yashil';
    }
};

window.getGruzSeverity = function(val, category, marka) {
    const v = parseFloat(val);
    if (isNaN(v) || v <= 0) return 'yashil';
    const m = marka || '1/11';
    if (m === '1/11') {
        if (v > 60) return 'qizil';
        return 'yashil';
    } else if (m === '1/9') {
        if (v > 50) return 'qizil';
        return 'yashil';
    } else if (m === '1/6') {
        if (v > 30) return 'qizil';
        return 'yashil';
    }
    return 'yashil';
};

window.updatePU29CellColor = function(cell, type, sectionIdx) {
    const val = cell.innerText.trim();
    const bgStyle = window.pu29CellBg(type, val, sectionIdx);
    
    cell.style.backgroundColor = '';
    cell.style.background = '';
    cell.style.color = '';
    cell.style.fontWeight = '';
    
    if (bgStyle) {
        const parts = bgStyle.split(';');
        parts.forEach(part => {
            if (!part.trim()) return;
            const [prop, value] = part.split(':');
            if (prop && value) {
                const camelProp = prop.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                cell.style[camelProp] = value.trim();
            }
        });
    }
};

window.updatePU29SelectCellBg = function(select, type) {
    const val = select.value;
    const bgStyle = window.pu29CellBg(type, val);
    const cell = select.closest('td');
    
    cell.style.backgroundColor = '';
    cell.style.background = '';
    cell.style.color = '';
    cell.style.fontWeight = '';
    
    if (bgStyle) {
        const parts = bgStyle.split(';');
        parts.forEach(part => {
            if (!part.trim()) return;
            const [prop, value] = part.split(':');
            if (prop && value) {
                const camelProp = prop.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                cell.style[camelProp] = value.trim();
            }
        });
    }
};

window.pu29CellBg = function(type, rawVal, sectionIdx) {
    const v = parseFloat(rawVal);
    if (isNaN(v) || rawVal === '' || rawVal === null || rawVal === undefined) return ''; // bo'sh - rangsiz
    switch(type) {
        case 'sh': { // Shablon (Ширина колеи): Марка + Путь № ga qarab
            const swKey = `${currentPU29Bolinma}_${currentPU29Switch}`;
            const swMeta = window.pu29DataStore[swKey] && window.pu29DataStore[swKey].meta;
            const marka = swMeta ? (swMeta.marka || '1/11') : '1/11';
            const lineCat = swMeta ? (swMeta.lineCategory || 'asosiy') : 'asosiy';
            const colorKey = window.validateGaugeValue(rawVal, sectionIdx !== undefined ? sectionIdx : 99, marka, lineCat);
            return window.gaugeBg(colorKey);
        }
        case 'ur': { // Uroven (Уровень): norma ±6 mm
            const absUr = Math.abs(v);
            if (absUr > 10) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (absUr > 6)  return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        }
        case 'g': { // Jelob kengligi (Ширина желоба)
            const swKey = `${currentPU29Bolinma}_${currentPU29Switch}`;
            const swMeta = window.pu29DataStore[swKey] && window.pu29DataStore[swKey].meta;
            const marka = swMeta ? (swMeta.marka || '1/11') : '1/11';
            const norms = window.getPU29GutterNorms(marka, sectionIdx !== undefined ? sectionIdx : 0);
            if (v < norms.yellow[0] || v > norms.yellow[1]) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (v < norms.green[0] || v > norms.green[1]) return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        }
        case 'w': { // Iznos (Износ)
            const swKey = `${currentPU29Bolinma}_${currentPU29Switch}`;
            const swMeta = window.pu29DataStore[swKey] && window.pu29DataStore[swKey].meta;
            const railType = swMeta ? (swMeta.type || 'R-65') : 'R-65';
            const norms = window.getPU29WearNorms(railType);
            if (v > norms.yellowMax) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (v > norms.greenMax) return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        }
        case 'chip': {
            const key = `${currentPU29Bolinma}_${currentPU29Switch}`;
            const swData = window.pu29DataStore[key];
            const category = swData && swData.meta ? swData.meta.lineCategory : 'asosiy';
            const sev = window.getChippingSeverity(rawVal, category);
            if (sev === 'qizil') return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (sev === 'sariq') return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            if (rawVal !== '' && rawVal !== null && rawVal !== undefined) return 'background:#dcfce7; color:#166534; font-weight:900;';
            return '';
        }
        case 'gruz': {
            const key = `${currentPU29Bolinma}_${currentPU29Switch}`;
            const swData = window.pu29DataStore[key];
            const category = swData && swData.meta ? swData.meta.lineCategory : 'asosiy';
            const marka = swData && swData.meta ? (swData.meta.marka || '1/11') : '1/11';
            const sev = window.getGruzSeverity(rawVal, category, marka);
            if (sev === 'qizil') return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (sev === 'sariq') return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            if (rawVal !== '' && rawVal !== null && rawVal !== undefined) return 'background:#dcfce7; color:#166534; font-weight:900;';
            return '';
        }
        case 'p1': { // С-К (Сердечник-Контррельс)
            const swKey = `${currentPU29Bolinma}_${currentPU29Switch}`;
            const swMeta = window.pu29DataStore[swKey] && window.pu29DataStore[swKey].meta;
            const marka = swMeta ? (swMeta.marka || '1/11') : '1/11';
            const norms = window.getPU29DistanceNorms(marka);
            if (v < norms.kMin) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        }
        case 'p2': // К-У (Контррельс-Усовик): norma <= 1435
            if (v > 1435) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        case 'ponijenie':
            if (v >= 2.0) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (v >= 1.5) return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        case 'otstavanie':
            if (v >= 2.0) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (v >= 1.5) return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        case 'kor': {
            const val = parseFloat(rawVal);
            if (!isNaN(val)) {
                if (val < 4 || val > 6) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
                return 'background:#dcfce7; color:#166534; font-weight:900;';
            }
            const str = String(rawVal).toLowerCase().trim();
            if (str.includes('неиспр') || str.includes('дефект') || str.includes('neisp') || str.includes('def') || str.includes('xavfli')) {
                return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            }
            if (str.includes('исправно') || str.includes('soz') || str.includes('ok') || str.includes('норма') || str.includes('yashil')) {
                return 'background:#dcfce7; color:#166534; font-weight:900;';
            }
            return '';
        }
        case 'shag':
            if (v < 100) {
                if (v > 3) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
                return 'background:#dcfce7; color:#166534; font-weight:900;';
            } else {
                if (v < 152) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
                return 'background:#dcfce7; color:#166534; font-weight:900;';
            }
        case 'prileganie': {
            const str = String(rawVal).toLowerCase().trim();
            if (str.includes('неприleg') || str.includes('неприлег') || str.includes('зазор') || str.includes('gap') || str.includes('tirqish')) {
                return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            }
            if (str.includes('плотное') || str.includes('zich') || str.includes('ok') || str.includes('норма') || str.includes('нет просвета') || str.includes('просвета нет')) {
                return 'background:#dcfce7; color:#166534; font-weight:900;';
            }
            return '';
        }
        case 'brusya': {
            const str = String(rawVal).toLowerCase().trim();
            if (str.includes('негодн') || str.includes('yaroqsiz') || str.includes('авар') || str.includes('replacement')) {
                return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            }
            if (str.includes('куст') || str.includes('гниль') || str.includes('chir') || str.includes('yor') || str.includes('трещин')) {
                return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            }
            if (str.includes('испр') || str.includes('soz') || str.includes('ok')) {
                return 'background:#dcfce7; color:#166534; font-weight:900;';
            }
            return '';
        }
        case 'prim_1520':
            if (v < 1512 || v > 1548) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (v < 1519 || v > 1521) return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        case 'ostrie_1524':
            if (v < 1512 || v > 1548) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (v < 1523 || v > 1525) return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        case 'pm50': {
            const absVal = Math.abs(v);
            if (absVal > 50) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (absVal > 30) return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        }
        case 'd5160':
            if (v < 5150 || v > 5170) return 'background:#fee2e2; color:#b91c1c; font-weight:900;';
            if (v < 5155 || v > 5165) return 'background:#fef9c3; color:#854d0e; font-weight:900;';
            return 'background:#dcfce7; color:#166534; font-weight:900;';
        default: return '';
    }
};

window.generateMegaTableHTML = function () {
    const key = `${currentPU29Bolinma}_${currentPU29Switch}`;
    const records = window.pu29DataStore[key].records || [];
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const now = Date.now();
    const S = window.pu29CellBg; // alias
    const td = (val, type, attr, idx, field, pos, extra='', secIdx=undefined) =>
        `<td ${attr} oninput="window.updatePU29CellColor(this, '${type}', ${secIdx !== undefined ? secIdx : 'undefined'}); window.savePU29Val(${idx},'${field}',${pos},this.innerText)" onblur="window.savePU29Val(${idx},'${field}',${pos},this.innerText)" style="border:1px solid #000; text-align:center; min-width:38px; ${S(type, val, secIdx)} ${extra}">${val !== '' && val !== null && val !== undefined ? val : ''}</td>`;

    const rows = records.map((r, idx) => {
        const isLocked = (now - r.createdAt) > THREE_HOURS_MS;
        const attr = isLocked ? 'contenteditable="false"' : 'contenteditable="true"';
        const rowBg = isLocked ? 'background:#f8fafc; color:#94a3b8;' : '';
        return `
        <tr style="${rowBg}">
            <td rowspan="2" ${attr} oninput="window.savePU29Val(${idx},'date',-1,this.innerText)" onblur="window.savePU29Val(${idx},'date',-1,this.innerText)" style="border:1px solid #000; text-align:center; font-weight:700; min-width:70px;">${r.date}</td>
            <td style="border:1px solid #000; text-align:center; font-weight:800; background:#e2e8f0;">Ш</td>
            ${r.sh.slice(0,11).map((v,i) => td(v,'sh',attr,idx,'sh',i,'',i)).join('')}
            <td rowspan="2" ${attr} oninput="window.updatePU29CellColor(this, 'sh', 11); window.savePU29Val(${idx},'sh',11,this.innerText)" onblur="window.savePU29Val(${idx},'sh',11,this.innerText)" style="border:1px solid #000; text-align:center; font-weight:800; ${S('sh',r.sh[11],11)}">${r.sh[11]||''}</td>
            ${td(r.sh[12],'sh',attr,idx,'sh',12,'',12)} ${td(r.sh[13],'sh',attr,idx,'sh',13,'',13)}
            <td style="border:1px solid #000; text-align:center; background:#e2e8f0; font-weight:800;">Пр</td>
            <td ${attr} oninput="window.updatePU29CellColor(this, 'p1'); window.savePU29Val(${idx},'p1',-1,this.innerText)" onblur="window.savePU29Val(${idx},'p1',-1,this.innerText)" style="border:1px solid #000; text-align:center; ${S('p1',r.p1)}">${r.p1||''}</td>
            <td ${attr} oninput="window.updatePU29CellColor(this, 'p2'); window.savePU29Val(${idx},'p2',-1,this.innerText)" onblur="window.savePU29Val(${idx},'p2',-1,this.innerText)" style="border:1px solid #000; text-align:center; ${S('p2',r.p2)}">${r.p2||''}</td>
            ${r.g.map((v,i) => td(v,'g',attr,idx,'g',i)).join('')}
            <td rowspan="2" ${attr} oninput="window.updatePU29CellColor(this, 'w'); window.savePU29Val(${idx},'w',0,this.innerText)" onblur="window.savePU29Val(${idx},'w',0,this.innerText)" style="border:1px solid #000; text-align:center; ${S('w',r.w[0])}">${r.w[0]||''}</td>
            <td rowspan="2" ${attr} oninput="window.updatePU29CellColor(this, 'w'); window.savePU29Val(${idx},'w',1,this.innerText)" onblur="window.savePU29Val(${idx},'w',1,this.innerText)" style="border:1px solid #000; text-align:center; ${S('w',r.w[1])}">${r.w[1]||''}</td>
            ${td(r.w[2],'w',attr,idx,'w',2)} ${td(r.w[3],'w',attr,idx,'w',3)}
            <td rowspan="2" ${attr} oninput="window.updatePU29CellColor(this, 'w'); window.savePU29Val(${idx},'w',4,this.innerText)" onblur="window.savePU29Val(${idx},'w',4,this.innerText)" style="border:1px solid #000; text-align:center; ${S('w',r.w[4])}">${r.w[4]||''}</td>
            <td rowspan="2" ${attr} oninput="window.updatePU29CellColor(this, 'chip'); window.savePU29Val(${idx},'ext',20,this.innerText)" onblur="window.savePU29Val(${idx},'ext',20,this.innerText)" style="border:1px solid #000; text-align:center; ${S('chip',r.ext[20])}">${r.ext[20]||''}</td>
            ${td(r.t[0],'ponijenie',attr,idx,'t',0)}
            ${td(r.t[1],'otstavanie',attr,idx,'t',1)}
            ${td(r.t[2],'kor',attr,idx,'t',2)}
            ${td(r.t[3],'shag',attr,idx,'t',3)}
            ${td(r.t[4],'prileganie',attr,idx,'t',4)}
            <td rowspan="2" ${attr} oninput="window.updatePU29CellColor(this, 'gruz'); window.savePU29Val(${idx},'t',5,this.innerText)" onblur="window.savePU29Val(${idx},'t',5,this.innerText)" style="border:1px solid #000; text-align:center; ${S('gruz', r.t[5])}">${r.t[5]||''}</td>
            <td rowspan="2" ${attr} oninput="window.updatePU29CellColor(this, 'brusya'); window.savePU29Val(${idx},'t',6,this.innerText)" onblur="window.savePU29Val(${idx},'t',6,this.innerText)" style="border:1px solid #000; text-align:center; ${S('brusya', r.t[6])}">${r.t[6]||''}</td>
            <td ${attr} oninput="window.updatePU29CellColor(this, 'prim_1520'); window.savePU29Val(${idx},'t',7,this.innerText)" onblur="window.savePU29Val(${idx},'t',7,this.innerText)" style="border:1px solid #000; text-align:center; ${S('prim_1520', r.t[7])}">${r.t[7]||''}</td>
            <td ${attr} oninput="window.updatePU29CellColor(this, 'ostrie_1524'); window.savePU29Val(${idx},'t',8,this.innerText)" onblur="window.savePU29Val(${idx},'t',8,this.innerText)" style="border:1px solid #000; text-align:center; ${S('ostrie_1524', r.t[8])}">${r.t[8]||''}</td>
            <td rowspan="2" ${attr} oninput="window.updatePU29CellColor(this, 'pm50'); window.savePU29Val(${idx},'t',9,this.innerText)" onblur="window.savePU29Val(${idx},'t',9,this.innerText)" style="border:1px solid #000; text-align:center; ${S('pm50', r.t[9])}">${r.t[9]||''}</td>
            <td rowspan="2" ${attr} oninput="window.updatePU29CellColor(this, 'd5160'); window.savePU29Val(${idx},'t',10,this.innerText)" onblur="window.savePU29Val(${idx},'t',10,this.innerText)" style="border:1px solid #000; text-align:center; ${S('d5160', r.t[10])}">${r.t[10]||''}</td>
            <td rowspan="2" style="border:1px solid #000; text-align:center;">${isLocked ? '🔒' : `<button onclick="this.closest('tr').nextElementSibling.remove(); this.closest('tr').remove();" style="color:#ef4444; border:none; background:none; cursor:pointer;"><i class='fas fa-trash-alt'></i></button>`}</td>
        </tr>
        <tr style="${rowBg}">
            <td style="border:1px solid #000; text-align:center; font-weight:800; background:#e2e8f0;">Ур</td>
            ${r.ur.map((v,i) => td(v,'ur',attr,idx,'ur',i)).join('')}
            ${[0,1,2,3].map((v,i) => `<td ${attr} onblur="window.savePU29Val(${idx},'ext',${i},this.innerText)" style="border:1px solid #000; background:#f8fafc;">${r.ext[i]||''}</td>`).join('')}
            <td ${attr} onblur="window.savePU29Val(${idx},'ext',4,this.innerText)" style="border:1px solid #000; text-align:center;">${r.ext[4]||''}</td>
            <td ${attr} onblur="window.savePU29Val(${idx},'ext',5,this.innerText)" style="border:1px solid #000; text-align:center;">${r.ext[5]||''}</td>
            <td style="border:1px solid #000; text-align:center; background:#e2e8f0; font-weight:800;">Бк</td>
            ${[0,1,2,3,4,5].map((v,i) => `<td ${attr} onblur="window.savePU29Val(${idx},'ext',${i+6},this.innerText)" style="border:1px solid #000; background:#f8fafc;">${r.ext[i+6]||''}</td>`).join('')}
            ${[0,1,2,3,4,5,6,7].map((v,i) => `<td ${attr} onblur="window.savePU29Val(${idx},'ext',${i+12},this.innerText)" style="border:1px solid #000; background:#f1f5f9;">${r.ext[i+12]||''}</td>`).join('')}
        </tr>`;
    }).join('');

    return `
    <table id="pu29-mega-table" style="width:100%; border-collapse:collapse; border:2px solid #000; font-size:0.92rem; color:#000; background:#fff;">
        <style>
            .h-p29 { border:1.5px solid #000; text-align:center; background:#fff; font-weight:700; padding:5px; vertical-align: middle; }
            .v-p29 { writing-mode: vertical-rl; transform: rotate(180deg); height:220px; width:40px; display:flex; align-items:center; justify-content:center; white-space:nowrap; margin:0 auto; }
            .v-p29-l { writing-mode: vertical-rl; transform: rotate(180deg); height:240px; width:50px; margin:0 auto; display:flex; align-items:center; justify-content:center; white-space:normal; line-height:1.1; font-size:0.85rem; }
        </style>
        <thead>
            <tr> <th rowspan="3" class="h-p29" data-norm-id="date"><div class="v-p29">Дата промера</div></th> <th rowspan="3" class="h-p29" data-norm-id="ur_sh"><div class="v-p29">Ур / Ш</div></th> <th colspan="7" class="h-p29" data-norm-id="otstuplenie_group">Отклонения от нормы</th> <th colspan="7" class="h-p29" data-norm-id="strel_group">стрелочных переводов (ННК)</th> <th rowspan="3" class="h-p29" data-norm-id="pr_bk"><div class="v-p29">Прям. / Бок.</div></th> <th colspan="2" class="h-p29" data-norm-id="rasstoyanie_group">Расстояние</th> <th colspan="4" class="h-p29" data-norm-id="jelob_group">Ширина желоба</th> <th colspan="5" class="h-p29" data-norm-id="iznos_group">Износ</th> <th rowspan="3" class="h-p29" data-norm-id="chip"><div class="v-p29">Выкрашивание</div></th> <th rowspan="3" class="h-p29" data-norm-id="ponijenie" style="width:45px;"><div class="v-p29-l">Понижение остр. (сеч. 50мм)</div></th> <th rowspan="3" class="h-p29" data-norm-id="otstavanie" style="width:45px;"><div class="v-p29-l">Отставание остряка</div></th> <th rowspan="3" class="h-p29" data-norm-id="kor" style="width:45px;"><div class="v-p29">КОР</div></th> <th rowspan="3" class="h-p29" data-norm-id="shag" style="width:45px;"><div class="v-p29">Шаг остряка</div></th> <th rowspan="3" class="h-p29" data-norm-id="prileganie" style="width:45px;"><div class="v-p29">Прилегание</div></th> <th rowspan="3" class="h-p29" data-norm-id="gruz" style="width:45px;"><div class="v-p29">Грузонапряж.</div></th> <th rowspan="3" class="h-p29" data-norm-id="brusya" style="width:45px;"><div class="v-p29">Дефекты брусьев</div></th> <th colspan="4" class="h-p29" data-norm-id="uravnit_group">Уравнительный стык</th> <th rowspan="3" class="h-p29">Act</th> </tr>
            <tr> <th rowspan="2" class="h-p29" data-norm-id="styk_ram"><div class="v-p29">Стык рамных рельсов</div></th> <th rowspan="2" class="h-p29" data-norm-id="u_ostriya"><div class="v-p29">У острия остряка</div></th> <th colspan="2" class="h-p29" data-norm-id="koren">Корень остряка</th> <th rowspan="2" class="h-p29" data-norm-id="per_krivaya"><div class="v-p29">В сер. перевод. кривой</div></th> <th colspan="2" class="h-p29" data-norm-id="v_krest_ne">В крестовине</th> <th rowspan="2" class="h-p29" data-norm-id="ser_nnk"><div class="v-p29">В середине ННК</div></th> <th rowspan="2" class="h-p29" data-norm-id="per_styk"><div class="v-p29">В перед. стыке крест.</div></th> <th rowspan="2" class="h-p29" data-norm-id="v_gorle"><div class="v-p29">В горле крестовины</div></th> <th rowspan="2" class="h-p29" data-norm-id="ost_serd"><div class="v-p29">В острие сердечника</div></th> <th rowspan="2" class="h-p29" data-norm-id="ugon_serd" style="width:65px;"><div class="v-p29-l">Угон сердеч. (1338 мм)</div></th> <th colspan="2" class="h-p29" data-norm-id="zad_styk">В заднем стыке крест.</th> <th rowspan="2" class="h-p29" data-norm-id="serd_kontr"><div class="v-p29-l">Сердечник-Контррельс</div></th> <th rowspan="2" class="h-p29" data-norm-id="kontr_usov"><div class="v-p29-l">Контррельс-Усовик</div></th> <th rowspan="2" class="h-p29" data-norm-id="v_kontr"><div class="v-p29">В контррельсе</div></th> <th rowspan="2" class="h-p29" data-norm-id="v_krest"><div class="v-p29">В крестовине</div></th> <th rowspan="2" class="h-p29" data-norm-id="v_gorle2"><div class="v-p29">В горле</div></th> <th rowspan="2" class="h-p29" data-norm-id="v_korne"><div class="v-p29">В корне остряка</div></th> <th rowspan="2" class="h-p29" data-norm-id="iznos_serd"><div class="v-p29">Износ сердечника</div></th> <th rowspan="2" class="h-p29" data-norm-id="iznos_usov"><div class="v-p29">Износ усовика</div></th> <th colspan="2" class="h-p29" data-norm-id="bok_ostr">Бок. износ остряка</th> <th rowspan="2" class="h-p29" data-norm-id="bok_ram"><div class="v-p29">Бок. износ рамного</div></th> <th rowspan="2" class="h-p29" data-norm-id="prim_1520" style="width:45px;"><div class="v-p29-l">Примыкание 1520</div></th> <th rowspan="2" class="h-p29" data-norm-id="ostrie_1524" style="width:45px;"><div class="v-p29-l">Острие 1524</div></th> <th rowspan="2" class="h-p29" data-norm-id="pm50" style="width:45px;"><div class="v-p29-l">Зазор ±50 мм</div></th> <th rowspan="2" class="h-p29" data-norm-id="d5160" style="width:45px;"><div class="v-p29-l">Длина плети 5160</div></th> </tr>
            <tr> <th class="h-p29" data-norm-id="koren_pryam">Прямой</th><th class="h-p29" data-norm-id="koren_bok">Боковой</th><th class="h-p29" data-norm-id="krest_pryam">Прямой</th><th class="h-p29" data-norm-id="krest_bok">Боковой</th><th class="h-p29" data-norm-id="zad_pryam">Прямой</th><th class="h-p29" data-norm-id="zad_bok">Боковой</th><th class="h-p29" data-norm-id="bok_kriv">Крив.</th><th class="h-p29" data-norm-id="bok_pryam">Прямой</th> </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>
    `;
};

window.openPU29EntryForSwitch = function(b, s) { window.openPU29Window(b, s); };
window.initPU29Data = function(b) {
    if (!b) b = currentPU29Bolinma || 'bolinma1';
    currentPU29Bolinma = b;
};
window.getPU29SummaryStats = function(b) {
    let s = { ok: 0, warning: 0, danger: 0, none: 0 };
    let cats = { 'asosiy': 0, 'qabul': 0, 'boshqa': 0 };
    (window.pu29Pages[b]||[]).forEach(sw => {
        const st = window.getPU29SwitchStatus(b, sw);
        if (s[st] !== undefined) s[st]++;
        const cat = window.categorizePU29Switch(sw);
        if (cats[cat] !== undefined) cats[cat]++;
    });
    return { total: (window.pu29Pages[b]||[]).length, ok: s.ok, warning: s.warning, critical: s.danger, categories: cats };
};
window.getPU29CategoryLabels = function() { 
    return { 
        'asosiy': { label: 'Asosiy yo\'llar', icon: 'fa-road', color: '#fbbf24' },
        'qabul': { label: 'Qabul qilish-jo\'nash', icon: 'fa-exchange-alt', color: '#10b981' },
        'boshqa': { label: 'Boshqa yo\'llar', icon: 'fa-ellipsis-h', color: '#64748b' }
    }; 
};
window.categorizePU29Switch = function(s) { 
    const key = `${currentPU29Bolinma || 'bolinma1'}_${s}`;
    const data = window.pu29DataStore[key];
    if (data && data.meta) {
        return window.normalizePUCategory(data.meta.lineCategory);
    }
    return 'boshqa';
};

window.getPU29DefectCounts = function(bolinmaId) {
    const switches = window.pu29Pages[bolinmaId] || [];
    const counts = {
        core_wear: { asosiy: { yashil: 0, sariq: 0, qizil: 0 }, qabul_jonash: { yashil: 0, sariq: 0, qizil: 0 }, boshqa: { yashil: 0, sariq: 0, qizil: 0 } },
        stock_wear: { asosiy: { yashil: 0, sariq: 0, qizil: 0 }, qabul_jonash: { yashil: 0, sariq: 0, qizil: 0 }, boshqa: { yashil: 0, sariq: 0, qizil: 0 } },
        chipping: { asosiy: { yashil: 0, sariq: 0, qizil: 0 }, qabul_jonash: { yashil: 0, sariq: 0, qizil: 0 }, boshqa: { yashil: 0, sariq: 0, qizil: 0 } },
        traffic: { asosiy: { yashil: 0, sariq: 0, qizil: 0 }, qabul_jonash: { yashil: 0, sariq: 0, qizil: 0 }, boshqa: { yashil: 0, sariq: 0, qizil: 0 } }
    };

    switches.forEach(sw => {
        const data = window.getPU29SwitchData(bolinmaId, sw);
        const meta = data.meta;
        const last = data.records[0] || {};
        
        // Group by path type
        const cat = window.normalizePUCategory(meta.lineCategory);
        let groupKey = 'boshqa';
        if (cat === 'asosiy') groupKey = 'asosiy';
        else if (cat === 'qabul' || cat === 'jonash') groupKey = 'qabul_jonash';
        
        // 1. Core Wear (Износ сердеч): last.w[0]
        const w0 = parseFloat(last.w ? last.w[0] : 0) || 0;
        const wNorms = window.getPU29WearNorms(meta.type);
        let cStatus = 'yashil';
        if (w0 > wNorms.yellowMax) cStatus = 'qizil';
        else if (w0 > wNorms.greenMax) cStatus = 'sariq';
        counts.core_wear[groupKey][cStatus]++;
        
        // 2. Stock Rail Wear (Износ рамного рельса): last.w[4]
        const w4 = parseFloat(last.w ? last.w[4] : 0) || 0;
        let sStatus = 'yashil';
        if (w4 > wNorms.yellowMax) sStatus = 'qizil';
        else if (w4 > wNorms.greenMax) sStatus = 'sariq';
        counts.stock_wear[groupKey][sStatus]++;
        
        // 3. Chipping (Выкрашивание): fetched directly from table record (ext[20])
        const chipVal = parseFloat(last.ext ? last.ext[20] : 0) || 0;
        const chipStatus = window.getChippingSeverity(chipVal, meta.lineCategory);
        counts.chipping[groupKey][chipStatus]++;
        
        // 4. Traffic (Грузонапряженность): last.t[5]
        const t5 = parseFloat(last.t ? last.t[5] : 0) || 0;
        const tStatus = window.getGruzSeverity(t5, meta.lineCategory, meta.marka);
        counts.traffic[groupKey][tStatus]++;
    });
    
    return counts;
};

window.showDefectSwitches = function(bolinmaId, defectTitle, grp, status) {
    const switches = window.pu29Pages[bolinmaId] || [];
    const matching = [];
    
    switches.forEach(sw => {
        const data = window.getPU29SwitchData(bolinmaId, sw);
        const meta = data.meta;
        const last = data.records[0] || {};
        
        // Path type filter
        const cat = window.normalizePUCategory(meta.lineCategory);
        let groupKey = 'boshqa';
        if (cat === 'asosiy') groupKey = 'asosiy';
        else if (cat === 'qabul' || cat === 'jonash') groupKey = 'qabul_jonash';
        
        if (groupKey !== grp) return;
        let switchStatus = 'yashil';
        const wNorms = window.getPU29WearNorms(meta.type);
        if (defectTitle === 'Износ сердеч') {
            const w0 = parseFloat(last.w ? last.w[0] : 0) || 0;
            if (w0 > wNorms.yellowMax) switchStatus = 'qizil';
            else if (w0 > wNorms.greenMax) switchStatus = 'sariq';
        } else if (defectTitle === 'Износ рамны рельса' || defectTitle === 'Износ рамного рельса') {
            const w4 = parseFloat(last.w ? last.w[4] : 0) || 0;
            if (w4 > wNorms.yellowMax) switchStatus = 'qizil';
            else if (w4 > wNorms.greenMax) switchStatus = 'sariq';
        } else if (defectTitle === 'Выкрашивание') {
            const chipVal = parseFloat(last.ext ? last.ext[20] : 0) || 0;
            switchStatus = window.getChippingSeverity(chipVal, meta.lineCategory);
        } else if (defectTitle === 'Грузонапряженность') {
            const t5 = parseFloat(last.t ? last.t[5] : 0) || 0;
            switchStatus = window.getGruzSeverity(t5, meta.lineCategory, meta.marka);
        }
        
        if (switchStatus === status) {
            matching.push(sw);
        }
    });

    // Render list in a beautiful modal
    let modal = document.getElementById('pu29-defect-list-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.id = 'pu29-defect-list-modal';
    modal.className = 'active';
    modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 400000; background: #0f172a; border: 1.5px solid rgba(212,175,55,0.4); border-radius: 20px; width: 380px; box-shadow: 0 30px 60px rgba(0,0,0,0.8); padding: 25px; font-family: "Inter", sans-serif; color: #fff;';
    
    const statusText = status === 'yashil' ? 'Soz (Yashil)' : (status === 'sariq' ? 'Ogohlantirish (Sariq)' : 'Xavfli (Qizil)');
    const statusColor = status === 'yashil' ? '#10b981' : (status === 'sariq' ? '#f59e0b' : '#ef4444');
    const grpText = grp === 'asosiy' ? 'Asosiy yo\'l' : (grp === 'qabul_jonash' ? 'Qabul-Jo\'nash' : 'Boshqa yo\'l');
    
    modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
            <h4 style="margin:0; font-size:1rem; font-weight:800; color:#ffd700;">STRELKALAR RO'YXATI</h4>
            <span onclick="document.getElementById('pu29-defect-list-modal').remove()" style="cursor:pointer; color:#ef4444; font-weight:900; font-size:1.2rem;">&times;</span>
        </div>
        <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:15px; font-weight:600;">
            Kategoriya: <span style="color:#fff;">${defectTitle}</span><br>
            Yo'l turi: <span style="color:#fff;">${grpText}</span><br>
            Holati: <span style="color:${statusColor}; font-weight:800;">${statusText}</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:10px; max-height:200px; overflow-y:auto; padding:5px 0;">
            ${matching.map(sw => `
                <button onclick="document.getElementById('pu29-defect-list-modal').remove(); if(document.getElementById('pu29-menu-modal')) document.getElementById('pu29-menu-modal').remove(); window.openPU29EntryForSwitch('${bolinmaId}', '${sw}')"
                    style="background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.3); color:#fff; font-weight:800; padding:8px 16px; border-radius:10px; cursor:pointer; font-size:0.9rem; transition:0.3s; min-width:65px;"
                    onmouseover="this.style.background='#ffd700'; this.style.color='#000';"
                    onmouseout="this.style.background='rgba(212,175,55,0.1)'; this.style.color='#fff';">
                    № ${sw}
                </button>
            `).join('')}
            ${matching.length === 0 ? '<div style="color:#64748b; font-size:0.85rem; width:100%; text-align:center;">Ushbu holat bo\'yicha strelkalar yo\'q</div>' : ''}
        </div>
        <div style="margin-top:20px; text-align:right;">
            <button onclick="document.getElementById('pu29-defect-list-modal').remove()" style="padding:8px 20px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:8px; font-weight:600; cursor:pointer;">Yopish</button>
        </div>
    `;
    document.body.appendChild(modal);
};

window.addPU29Page = function(bolinmaId) {
    const bId = bolinmaId || currentPU29Bolinma || 'bolinma1';
    
    // Check if modal already exists
    let modal = document.getElementById('pu29-add-switch-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.id = 'pu29-add-switch-modal';
    modal.className = 'active';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(2, 6, 23, 0.75); backdrop-filter: blur(8px); z-index: 500000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: #0f172a; border: 1.5px solid rgba(212,175,55,0.4); border-radius: 24px; width: 420px; box-shadow: 0 30px 60px rgba(0,0,0,0.8); padding: 30px; font-family: 'Inter', sans-serif; color: #fff; position: relative;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px;">
                <h4 style="margin:0; font-size:1.15rem; font-weight:800; color:#ffd700; display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-plus-circle"></i> YANGI STRELKA QO'SHISH
                </h4>
                <span onclick="document.getElementById('pu29-add-switch-modal').remove()" style="cursor:pointer; color:#94a3b8; font-weight:900; font-size:1.4rem; line-height: 1;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">&times;</span>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display:block; font-size:0.75rem; color:#94a3b8; font-weight:700; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Strelka raqami</label>
                <input type="text" id="new-switch-input" placeholder="Masalan: 15" autofocus
                       style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 16px; color:#fff; font-size:1rem; outline:none; font-weight:800; transition: border-color 0.2s;"
                       onfocus="this.style.borderColor='#ffd700'"
                       onblur="this.style.borderColor='rgba(255,255,255,0.1)'"
                >
                <div id="add-switch-error" style="color:#ef4444; font-size:0.75rem; margin-top:8px; font-weight:700; display:none;"></div>
            </div>
            
            <div style="display:flex; gap:12px; justify-content:flex-end;">
                <button onclick="document.getElementById('pu29-add-switch-modal').remove()" 
                        style="padding:10px 20px; background:transparent; border:1px solid rgba(255,255,255,0.15); color:#94a3b8; border-radius:10px; font-weight:700; cursor:pointer; transition:0.2s;"
                        onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#fff';"
                        onmouseout="this.style.background='transparent'; this.style.color='#94a3b8';">
                    Bekor qilish
                </button>
                <button id="add-switch-confirm-btn"
                        style="padding:10px 24px; background:#ffd700; color:#000; border:none; border-radius:10px; font-weight:800; cursor:pointer; transition:0.2s; box-shadow:0 4px 12px rgba(255,215,0,0.2);"
                        onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 15px rgba(255,215,0,0.3)';"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(255,215,0,0.2)';"
                >
                    Qo'shish
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = document.getElementById('new-switch-input');
    const errDiv = document.getElementById('add-switch-error');
    const confirmBtn = document.getElementById('add-switch-confirm-btn');
    
    // Auto-focus input helper
    setTimeout(() => input.focus(), 100);
    
    const submitAdd = () => {
        const swNum = input.value.trim();
        if (!swNum) {
            errDiv.innerText = "Strelka raqamini kiriting!";
            errDiv.style.display = 'block';
            return;
        }
        
        if (!window.pu29Pages[bId]) {
            window.pu29Pages[bId] = [];
        }
        
        if (window.pu29Pages[bId].includes(swNum)) {
            errDiv.innerText = "Ushbu raqamdagi strelka allaqachon mavjud!";
            errDiv.style.display = 'block';
            return;
        }
        
        // Add to list of switches
        window.pu29Pages[bId].push(swNum);
        
        // Force initialize data structure
        window.getPU29SwitchData(bId, swNum);
        
        // Remove modals
        document.getElementById('pu29-add-switch-modal').remove();
        const menuModal = document.getElementById('pu29-menu-modal');
        if (menuModal) menuModal.remove();
        
        // Open the details window for the new turnout
        window.openPU29Window(bId, swNum);
        
        if (window.SmartUtils && window.SmartUtils.showToast) {
            window.SmartUtils.showToast("Yangi strelka muvaffaqiyatli qo'shildi", 'success');
        }
    };
    
    confirmBtn.onclick = submitAdd;
    input.onkeydown = (e) => {
        if (e.key === 'Enter') submitAdd();
    };
};

window.deletePU29Page = function(bolinmaId, swNum) {
    if (confirm(`Rostdan ham № ${swNum} strelkani va uning barcha ma'lumotlarini o'chirib tashlamoqchimisiz?`)) {
        if (window.pu29Pages[bolinmaId]) {
            window.pu29Pages[bolinmaId] = window.pu29Pages[bolinmaId].filter(sw => sw !== swNum);
        }
        
        const key = `${bolinmaId}_${swNum}`;
        if (window.pu29DataStore[key]) {
            delete window.pu29DataStore[key];
        }
        
        if (window.openPU29Menu) {
            window.openPU29Menu(bolinmaId);
        }
        
        if (window.SmartUtils && window.SmartUtils.showToast) {
            window.SmartUtils.showToast(`№ ${swNum} strelka muvaffaqiyatli o'chirildi`, 'success');
        }
    }
};

// =====================================================
// PU-29 TOOLTIP SYSTEM — To'liq nomlar va me'yor chegaralari
// =====================================================
window._pu29NormData = {
    // === SARLAVHALAR (guruhlar) ===
    'otstuplenie_group': {
        icon: '📏',
        title_ru: 'Отклонения от нормы (Ширина колеи и уровень)',
        title_uz: 'Normadan chetlanishlar (Koliya kengligi va balandlik farqi)',
        full_ru: 'Отклонения от нормы ширины колеи и уровня по всей длине стрелочного перевода.',
        full_uz: 'Strelka perevodi bo\'ylab koliya kengligi va balandlik farqi (uroven)ning normadan chetlanishi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1516 – 1546 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1512–1516 / 1546–1548 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1512 / > 1548 мм' }
        ],
        note_ru: 'Согласно ПТЭ, номинальный размер колеи 1520 мм. Отклонения по уровню не должны превышать ±6 мм.',
        note_uz: 'PTEga ko\'ra, koliya kengligining nominal o\'lchami 1520 mm. Balandlik farqi (uroven) chetlanishi ±6 mm dan oshmasligi kerak.'
    },
    'strel_group': {
        icon: '🔀',
        title_ru: 'Стрелочные переводы (ННК)',
        title_uz: 'Qo\'zg\'almas nazorat o\'lchov nuqtalari (ННК)',
        full_ru: 'Измерения ширины колеи в недвижных наблюдательных точках стрелочного перевода (всего 7 точек).',
        full_uz: 'Strelka perevodining qo\'zg\'almas nazorat nuqtalarida koliya kengligini o\'lchash (jami 7 ta nuqta).',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1516 – 1546 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1512–1516 / 1546–1548 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1512 / > 1548 мм' }
        ],
        note_ru: 'ННК — Недвижимые Наблюдательные Колеи. Измерения проводятся в установленных сечениях для контроля стабильности геометрии.',
        note_uz: 'ННК — Недвижимые Наблюдательные Колеи. Geometriya barqarorligini nazorat qilish uchun belgilangan kesimlarda o\'lchashlar o\'tkaziladi.'
    },
    'rasstoyanie_group': {
        icon: '📐',
        title_ru: 'Критические расстояния (С-К, К-У)',
        title_uz: 'Kritik masofalar (S-K, K-U)',
        full_ru: 'Расстояния между сердечником и контррельсом (С-К) и между контррельсом и усовиком (К-У).',
        full_uz: 'Serdechnik va kontrrels (S-K) hamda kontrrels va usovik (K-U) orasidagi masofalar.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: 'С-К: ≥ 1472 мм | К-У: ≤ 1435 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: 'С-К < 1472 мм или К-У > 1435 мм' }
        ],
        note_ru: 'По ПТЭ: расстояние С-К должно быть не менее 1472 мм, а расстояние К-У — не более 1435 мм. При нарушении движение закрывается.',
        note_uz: 'PTE bo\'yicha: S-K masofasi 1472 mm dan kam bo\'lmasligi, K-U esa 1435 mm dan ko\'p bo\'lmasligi shart. Buzilganda harakat to\'xtatiladi.'
    },
    'jelob_group': {
        icon: '📊',
        title_ru: 'Ширина желоба',
        title_uz: 'Jeloblar kengligi',
        full_ru: 'Ширина желоба в контррельсе, крестовине, горле и корне.',
        full_uz: 'Kontrrels, krestovina, toriq (gorlo) va ostriyak ildizi (koren) zonalaridagi jelob kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '40 – 45 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '38–39 / 46–48 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 38 / > 48 мм' }
        ],
        note_ru: 'Размеры желобов обеспечивают безопасный проход колесных пар без соударения с сердечником.',
        note_uz: 'Jeloblar o\'lchami g\'ildirak juftliklarining serdechnikka urilmasdan xavfsiz o\'tishini ta\'minlaydi.'
    },
    'iznos_group': {
        icon: '⚠️',
        title_ru: 'Вертикальный и боковой износ',
        title_uz: 'Vertikal va yon yeyilish',
        full_ru: 'Износ металлических частей (сердечника, усовиков, остряков и рамных рельсов).',
        full_uz: 'Metall qismlarning (serdechnik, usovik, ostriyak va ramaviy relslar) yeyilish darajasi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '0 – 4 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '4 – 6 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '> 6 мм' }
        ],
        note_ru: 'Предельный износ металлических частей составляет 4 мм.',
        note_uz: 'Metall qismlarning cheklangan yeyilish darajasi 4 mm ni tashkil etadi.'
    },
    'uravnit_group': {
        icon: '🔗',
        title_ru: 'Уравнительный стык',
        title_uz: 'Uravnitel (muvozanatlovchi) stik',
        full_ru: 'Параметры уравнительного стыка примыкания бесстыкового пути.',
        full_uz: 'Tirqishsiz yo\'lning ulanish joyidagi uravnitel (muvozanatlovchi) stik parametrlari.',
        norms: [
            { color: 'green', label: 'Прим. / Ulanish', value: '1520 ± 1 мм (по книге)' },
            { color: 'green', label: 'Острие / Ostriya', value: '1524 ± 1 мм (по книге)' },
            { color: 'green', label: 'Зазор / Tirqish', value: 'в пределах ±50 мм' },
            { color: 'green', label: 'Длина / Uzunlik', value: '5160 ± 10 мм' }
        ],
        note_ru: 'Служит для компенсации температурных изменений длины рельсовых плетей.',
        note_uz: 'Rels qamchilarining harorat ta\'sirida uzayishi yoki qisqarishini kompensatsiya qilish uchun xizmat qiladi.'
    },

    // === ALOHIDA USTUNLAR ===
    'date': {
        icon: '📅',
        title_ru: 'Дата промера',
        title_uz: 'O\'lchov sanasi',
        full_ru: 'Дата проведения комиссионного осмотра или промера стрелочного перевода.',
        full_uz: 'Strelka perevodini ko\'rikdan o\'tkazish yoki o\'lchash sanasi.',
        norms: [],
        note_ru: 'Главные пути проверяются не менее 2 раз в месяц, приемо-отправочные — 1 раз в месяц.',
        note_uz: 'Asosiy yo\'llar oyiga kamida 2 marta, qabul qilish-jo\'nash yo\'llari esa oyiga 1 marta tekshiriladi.'
    },
    'ur_sh': {
        icon: '↕️',
        title_ru: 'Уровень / Шаблон',
        title_uz: 'Uroven / Shablon',
        full_ru: 'Ур — Уровень (положение рельсов по высоте), Ш — Шаблон (ширина колеи).',
        full_uz: 'Ur — Uroven (relslarning balandlik farqi), Sh — Shablon (koliya kengligi).',
        norms: [
            { color: 'green', label: 'Уровень / Uroven', value: '0 – ±6 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '±6 – ±10 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '> ±10 мм' }
        ],
        note_ru: 'Ширина колеи измеряется на расстоянии 16 мм ниже поверхности катания головок рельсов.',
        note_uz: 'Koliya kengligi rels boshi dumalash yuzasidan 16 mm pastroqda o\'lchanadi.'
    },
    'pr_bk': {
        icon: '↔️',
        title_ru: 'Прямой / Боковой',
        title_uz: 'To\'g\'ri / Yon yo\'nalish',
        full_ru: 'Пр — Прямое направление (главный путь), Бк — Боковое направление (на ответвление).',
        full_uz: 'Pr — To\'g\'ri yo\'nalish (asosiy yo\'l), Bk — Yon yo\'nalish (burilish yo\'li).',
        norms: [],
        note_ru: 'Показатели измеряются отдельно для каждого направления движения.',
        note_uz: 'Ko\'rsatkichlar har bir harakat yo\'nalishi uchun alohida o\'lchanadi.'
    },

    // === OTKLONENIE OT NORMY ===
    'styk_ram': {
        icon: '📏',
        title_ru: 'Стык рамных рельсов',
        title_uz: 'Ramaviy relslar stigi',
        full_ru: 'Ширина колеи в стыке рамного рельса (передняя граница стрелочного перевода).',
        full_uz: 'Ramaviy relsning birlashgan stik joyidagi koliya kengligi (old chegarasi).',
        norms: [
            { color: 'green', label: 'Гл. путь 1/11, 1/9 (Норма)', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Гл. путь (Внимание)',        value: '1514–1517 / 1525–1528 мм' },
            { color: 'red',    label: 'Опасно / Xavfli',           value: '< 1514 / > 1528 мм' }
        ],
        note_ru: 'Номинал 1520 мм. Допустимое отклонение: +4 / −2 мм. Зелёный: 1518–1524 мм.',
        note_uz: 'Nominal 1520 mm. Ruxsat: +4 / −2 mm. Yashil: 1518–1524 mm.'
    },
    'u_ostriya': {
        icon: '📏',
        title_ru: 'У острия остряка',
        title_uz: 'Ostriyak uchi yonida',
        full_ru: 'Ширина колеи у начала остряка. Важнейшая точка для предотвращения схода поезда.',
        full_uz: 'Ostriyak uchi boshlanishida koliya kengligi. Poyezdning izdan chiqishini oldini olishda eng muhim nuqta.',
        norms: [
            { color: 'green', label: 'Гл. + Приём. (1/11, 1/9) Норма', value: '1524 +4/−2 мм → 1522–1528 мм' },
            { color: 'yellow', label: 'Внимание',                   value: '1518–1521 / 1529–1532 мм' },
            { color: 'red',    label: 'Опасно / Xavfli',           value: '< 1512 / > 1548 мм' }
        ],
        note_ru: 'Номинал 1524 мм. Допустимое отклонение: +4 / −2 мм (раздел 4). Зелёный: 1522–1528 мм.',
        note_uz: 'Nominal 1524 mm. Ruxsat: +4 / −2 mm. Yashil: 1522–1528 mm.'
    },
    'koren': {
        icon: '📏',
        title_ru: 'Корень остряка',
        title_uz: 'Ostriyak ildizi (koreni)',
        full_ru: 'Ширина колеи в корне остряков (место гибкого или шарнирного закрепления).',
        full_uz: 'Ostriyaklar ildizida (birikish joyi) koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat',        value: '1514–1517 / 1525–1528 мм' },
            { color: 'red',    label: 'Опасно / Xavfli',           value: '< 1514 / > 1528 мм' }
        ],
        note_ru: 'Номинал 1520 мм. Допустимое отклонение: +4 / −2 мм. По прямому и боковому направлениям.',
        note_uz: 'Nominal 1520 mm. Ruxsat: +4 / −2 mm. To\'g\'ri va yon yo\'nalishlar bo\'yicha.'
    },
    'koren_pryam': {
        icon: '➡️',
        title_ru: 'Корень — Прямой',
        title_uz: 'Ostriyak ildizi — To\'g\'ri',
        full_ru: 'Ширина колеи в корне остряка по прямому направлению.',
        full_uz: 'Ostriyak ildizida to\'g\'ri yo\'nalish bo\'yicha koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1514–1517 / 1525–1528 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1514 / > 1528 мм' }
        ]
    },
    'koren_bok': {
        icon: '↗️',
        title_ru: 'Корень — Боковой',
        title_uz: 'Ostriyak ildizi — Yon',
        full_ru: 'Ширина колеи в корне остряка по боковому направлению.',
        full_uz: 'Ostriyak ildizida yon yo\'nalish bo\'yicha koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1514–1517 / 1525–1528 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1514 / > 1528 мм' }
        ]
    },
    'per_krivaya': {
        icon: '📏',
        title_ru: 'В середине переводной кривой',
        title_uz: 'Perevod egri chizig\'i o\'rtasida',
        full_ru: 'Ширина колеи в середине переводной кривой (соединительного пути).',
        full_uz: 'Egri burilish qismi (birlashtiruvchi yo\'l) o\'rtasida koliya kengligi.',
        norms: [
            { color: 'green', label: 'Гл. + Приём. 1/11 (Норма)', value: '1520 +10/−2 мм → 1518–1530 мм' },
            { color: 'green', label: 'Приём. 1/9 (Норма)',       value: '1521 +10/−2 мм → 1519–1531 мм' },
            { color: 'yellow', label: 'Внимание',                value: '1514–1517 / 1531–1534 мм' },
            { color: 'red',   label: 'Опасно / Xavfli',       value: '< 1512 / > 1548 мм' }
        ],
        note_ru: 'Допустимое отклонение: +10 / −2 мм от номинала (раздел 4 книги). Самый широкий допуск из всех точек.',
        note_uz: 'Ruxsat etilgan chetlanish: +10 / −2 mm nominaldan (kitob bo\'lim 4). Eng keng ruxsat etilgan nuqta.'
    },
    'v_krest_ne': {
        icon: '✖️',
        title_ru: 'В крестовине',
        title_uz: 'Krestovinada',
        full_ru: 'Ширина колеи в зоне крестовины (пересечения рельсовых нитей).',
        full_uz: 'Krestovina zonasida (relslar kesishish qismi) koliya kengligi.',
        norms: [
            { color: 'green', label: 'Гл. путь 1/11 (Норма)', value: '1520 +3/−3 мм → 1517–1523 мм' },
            { color: 'yellow', label: 'Внимание',               value: '1513–1516 / 1524–1527 мм' },
            { color: 'red',   label: 'Опасно / Xavfli',          value: '< 1512 / > 1548 мм' },
            { color: 'green', label: 'Приём. 1/9, 1/6 БОК. (Норма)', value: '1524 +3/−3 мм → 1521–1527 мм' }
        ],
        note_ru: 'Допустимое отклонение: +3 / −3 мм от номинала (раздел 4). Гл. путь 1/11: 1517–1523; приём. 1/9, 1/6 боковой: 1521–1527.',
        note_uz: 'Ruxsat: +3 / −3 mm nominaldan. Gl. 1/11: 1517–1523; qabul 1/9, 1/6 yon: 1521–1527 mm.'
    },
    'krest_pryam': {
        icon: '➡️',
        title_ru: 'Крестовина — Прямой',
        title_uz: 'Krestovina — To\'g\'ri',
        full_ru: 'Ширина колеи в крестовине по прямому направлению.',
        full_uz: 'Krestovinada to\'g\'ri yo\'nalish bo\'yicha koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +3/−3 мм → 1517–1523 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1513–1516 / 1524–1527 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1513 / > 1527 мм (ПТЭ: < 1512 / > 1548)' }
        ]
    },
    'krest_bok': {
        icon: '↗️',
        title_ru: 'Крестовина — Боковой',
        title_uz: 'Krestovina — Yon',
        full_ru: 'Ширина колеи в крестовине по боковому направлению.',
        full_uz: 'Krestovinada yon yo\'nalish bo\'yicha koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +3/−3 мм (1524 +3/−3 мм на приём-отпр. 1/9, 1/6)' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1513–1516 / 1524–1527 мм (1517–1520 / 1528–1531 мм)' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1512 / > 1548 мм' }
        ]
    },

    // === STRELKA PEREVOD NNK ===
    'ser_nnk': {
        icon: '🔀',
        title_ru: 'В середине переводной кривой (ННК)',
        title_uz: 'Perevod egri chizig\'i o\'rtasida (ННК)',
        full_ru: 'Ширина колеи в середине недвижных наблюдательных точек.',
        full_uz: 'Qo\'zg\'almas nazorat o\'lchov nuqtalarining o\'rta qismida koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1514–1517 / 1525–1528 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1514 / > 1528 мм' }
        ]
    },
    'per_styk': {
        icon: '🔀',
        title_ru: 'В переднем стыке крестовины (ННК)',
        title_uz: 'Krestovina oldingi stigida (ННК)',
        full_ru: 'Ширина колеи в переднем стыке недвижных наблюдательных точек крестовины.',
        full_uz: 'Krestovina old stigi (ННК) o\'lchov nuqtasida koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1514–1517 / 1525–1528 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1514 / > 1528 мм' }
        ]
    },
    'v_gorle': {
        icon: '🔀',
        title_ru: 'В горле крестовины (ННК)',
        title_uz: 'Krestovina torig\'ida (gorlovina) (ННК)',
        full_ru: 'Ширина колеи в самом узком месте усовиков (в горле крестовины).',
        full_uz: 'Usoviklar kesishuvining eng tor joyida koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1514–1517 / 1525–1528 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1514 / > 1528 мм' }
        ]
    },
    'ost_serd': {
        icon: '🔀',
        title_ru: 'В острие сердечника (ННК)',
        title_uz: 'Serdechnik o\'tkir uchida (ННК)',
        full_ru: 'Ширина колеи напротив острия сердечника крестовины.',
        full_uz: 'Krestovina serdechigining o\'tkir uchi ro\'parasida koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1514–1517 / 1525–1528 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1514 / > 1528 мм' }
        ]
    },
    'ugon_serd': {
        icon: '📐',
        title_ru: 'Угон сердечника (1338 мм)',
        title_uz: 'Serdechnikning bo\'ylama surilishi (1338 mm)',
        full_ru: 'Проверка размера от наружной грани усовика до передней грани сердечника 1338 мм.',
        full_uz: 'Usovikning tashqi qirrasidan serdechnikning oldingi qirrasigacha bo\'lgan 1338 mm o\'lchami.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1338 ± 3 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1335 мм или > 1341 мм' }
        ],
        note_ru: 'Это важнейший размер для предотвращения удара гребня колеса в сердечник.',
        note_uz: 'G\'ildirak grebinining serdechnikka urilishini oldini oladigan eng muhim o\'lcham hisoblanadi.'
    },
    'zad_styk': {
        icon: '🔀',
        title_ru: 'В заднем стыке крестовины (ННК)',
        title_uz: 'Krestovina orqa stigida (ННК)',
        full_ru: 'Ширина колеи в заднем стыке крестовины.',
        full_uz: 'Krestovinaning orqa stik birlashish joyida koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1514–1517 / 1525–1528 мм' },
            { color: 'red', label: 'Xavfli', value: '< 1514 / > 1528 мм' }
        ]
    },
    'zad_pryam': {
        icon: '➡️',
        title_ru: 'Задний стык — Прямой (ННК)',
        title_uz: 'Orqa stik — To\'g\'ri (ННК)',
        full_ru: 'Ширина колеи в заднем стыке крестовины по прямому направлению.',
        full_uz: 'Krestovina orqa stigida to\'g\'ri yo\'nalish bo\'yicha koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1514–1517 / 1525–1528 мм' },
            { color: 'red', label: 'Xavfli', value: '< 1514 / > 1528 мм' }
        ]
    },
    'zad_bok': {
        icon: '↗️',
        title_ru: 'Задний стык — Боковой (ННК)',
        title_uz: 'Orqa stik — Yon (ННК)',
        full_ru: 'Ширина колеи в заднем стыке крестовины по боковому направлению.',
        full_uz: 'Krestovina orqa stigida yon yo\'nalish bo\'yicha koliya kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 +4/−2 мм → 1518–1524 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '1514–1517 / 1525–1528 мм' },
            { color: 'red', label: 'Xavfli', value: '< 1514 / > 1528 мм' }
        ]
    },

    // === MASOFA ===
    'serd_kontr': {
        icon: '📐',
        title_ru: 'Расстояние Сердечник — Контррельс',
        title_uz: 'Serdechnik — Kontrrels masofasi',
        full_ru: 'Расстояние между рабочей гранью сердечника и рабочей гранью головки контррельса.',
        full_uz: 'Serdechnikning ishchi qirrasi va kontrrels boshining ishchi qirrasi orasidagi masofa.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '≥ 1472 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1472 мм (Движение закрывается!)' }
        ],
        note_ru: 'По ПТЭ: расстояние должно быть не менее 1472 мм. Меньший размер приводит к удару колеса в острие сердечника.',
        note_uz: 'PTEga ko\'ra: masofa 1472 mm dan kam bo\'lmasligi shart. Kichik bo\'lsa, g\'ildirak serdechnik uchiga uriladi.'
    },
    'kontr_usov': {
        icon: '📐',
        title_ru: 'Расстояние Контррельс — Усовик',
        title_uz: 'Kontrrels — Usovik masofasi',
        full_ru: 'Расстояние между рабочими гранями головки контррельса и усовика.',
        full_uz: 'Kontrrels boshining ishchi qirrasi va usovik ishchi qirrasi orasidagi masofa.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '≤ 1435 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '> 1435 мм (Движение закрывается!)' }
        ],
        note_ru: 'По ПТЭ: расстояние должно быть не более 1435 мм. При превышении возникает опасность заклинивания колеса.',
        note_uz: 'PTEga ko\'ra: masofa 1435 mm dan oshmasligi kerak. Oshsa, g\'ildirak qisilib qolish xavfi tug\'iladi.'
    },

    // === JELOB ===
    'v_kontr': {
        icon: '📊',
        title_ru: 'Желоб в контррельсе',
        title_uz: 'Kontrreldagi jelob kengligi',
        full_ru: 'Ширина желоба между путевым рельсом и контррельсом.',
        full_uz: 'Yo\'l relsi va kontrrels orasidagi jelob kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '40 – 45 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '38–39 / 46–48 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 38 / > 48 мм' }
        ]
    },
    'v_krest': {
        icon: '📊',
        title_ru: 'Желоб в крестовине',
        title_uz: 'Krestovinadagi jelob kengligi',
        full_ru: 'Ширина желобов в крестовине.',
        full_uz: 'Krestovinadagi jeloblar kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '40 – 45 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '38–39 / 46–48 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 38 / > 48 мм' }
        ]
    },
    'v_gorle2': {
        icon: '📊',
        title_ru: 'Желоб в горле крестовины',
        title_uz: 'Krestovina torig\'idagi (gorlo) jelob',
        full_ru: 'Ширина желоба в горле крестовины.',
        full_uz: 'Krestovynaning toriq (gorlo) qismidagi jelob kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '40 – 45 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '38–39 / 46–48 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 38 / > 48 мм' }
        ]
    },
    'v_korne': {
        icon: '📊',
        title_ru: 'Желоб в корне остряка',
        title_uz: 'Ostriyak ildizidagi (koren) jelob',
        full_ru: 'Ширина желоба в корне остряка.',
        full_uz: 'Ostriyak ildiz (koren) qismidagi jelob kengligi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '40 – 45 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '38–39 / 46–48 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 38 / > 48 мм' }
        ]
    },

    // === IZNOS ===
    'iznos_serd': {
        icon: '⚠️',
        title_ru: 'Вертикальный износ сердечника',
        title_uz: 'Serdechnikning vertikal yeyilishi',
        full_ru: 'Вертикальный износ сердечника крестовины в сечении, где его ширина 40 мм.',
        full_uz: 'Krestovina serdechigining uning kengligi 40 mm bo\'lgan kesimdagi vertikal yeyilishi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '0 – 4 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '4 – 6 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '> 6 мм' }
        ]
    },
    'iznos_usov': {
        icon: '⚠️',
        title_ru: 'Вертикальный износ усовиков',
        title_uz: 'Usoviklarning vertikal yeyilishi',
        full_ru: 'Вертикальный износ усовиков крестовины.',
        full_uz: 'Krestovina usoviklarining vertikal yeyilishi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '0 – 4 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '4 – 6 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '> 6 мм' }
        ]
    },
    'bok_ostr': {
        icon: '⚠️',
        title_ru: 'Боковой износ остряков',
        title_uz: 'Ostriyaklarning yon yeyilishi',
        full_ru: 'Величина износа остряков с боковой стороны.',
        full_uz: 'Ostriyaklarning yon tomondan yeyilish miqdori.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '0 – 4 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '4 – 6 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '> 6 мм' }
        ]
    },
    'bok_kriv': {
        icon: '↗️',
        title_ru: 'Боковой износ остряка — Кривой',
        title_uz: 'Ostriyak yon yeyilishi — Egri',
        full_ru: 'Боковой износ остряка по боковому (криволинейному) направлению.',
        full_uz: 'Egri (burilish) yo\'nalishidagi ostriyakning yon yeyilishi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '0 – 4 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '4 – 6 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '> 6 мм' }
        ]
    },
    'bok_pryam': {
        icon: '➡️',
        title_ru: 'Боковой износ остряка — Прямой',
        title_uz: 'Ostriyak yon yeyilishi — To\'g\'ri',
        full_ru: 'Боковой износ остряка по прямому направлению.',
        full_uz: 'To\'g\'ri yo\'nalishdagi ostriyakning yon yeyilishi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '0 – 4 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '4 – 6 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '> 6 мм' }
        ]
    },
    'bok_ram': {
        icon: '⚠️',
        title_ru: 'Боковой износ рамного рельса',
        title_uz: 'Ramaviy relsning yon yeyilishi',
        full_ru: 'Величина бокового износа рамных рельсов.',
        full_uz: 'Ramaviy relslarning yon tomondan yeyilish miqdori.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '0 – 4 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '4 – 6 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '> 6 мм' }
        ]
    },
 
     // === MAXSUS PARAMETRLAR ===
     'chip': {
        icon: '💎',
        title_ru: 'Выкрашивание остряка / сердечника',
        title_uz: 'Ostriyak yoki serdechnik parchalanishi (chipping)',
        full_ru: 'Длина выкрашивания металлической головки остряка или сердечника крестовины.',
        full_uz: 'Ostriyak yoki krestovina serdechigi metall bosh qismining parchalanish uzunligi.',
        norms: [
            { color: 'green', label: 'Главный / Asosiy', value: '0 – 149 мм' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: '150 – 199 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: 'Главный >= 200 мм | Приемо-отпр. >= 300 мм | Прочие >= 400 мм (Движение закрывается!)' }
        ],
        note_ru: 'По ПТЭ: выкрашивание не должно превышать 200 мм на главных путях, 300 мм на приемо-отправочных, 400 мм на прочих.',
        note_uz: 'PTEga ko\'ra: parchalanish uzunligi asosiy yo\'llarda 200 mm, qabul qilish-jo\'nashda 300 mm, boshqalarida 400 mm dan oshmasligi kerak.'
    },
    'ponijenie': {
        icon: '⬇️',
        title_ru: 'Понижение остряка против рамного рельса',
        title_uz: 'Ostriyakning ramaviy relsdan pastligi',
        full_ru: 'Понижение остряка против рамного рельса на 2 мм и более (измеряемое в сечении 50 мм и более).',
        full_uz: 'Ostriyakning ramaviy relsga nisbatan pastligi (ostriyak boshi kengligi 50 mm bo\'lgan kesimda o\'lchanadi) 2 mm va undan ortiq bo\'lishiga yo\'l qo\'yilmaydi.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '< 2 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '≥ 2 мм (Движение закрывается!)' }
        ],
        note_ru: 'При понижении на 2 мм и более возникает опасность набегания и наката гребня колеса на остряк.',
        note_uz: 'Pastlik 2 mm yoki undan ko\'p bo\'lsa, g\'ildirak grebinining ostriyak ustiga chiqib ketishi va poyezdning izdan chiqish xavfi yuzaga keladi.'
    },
    'otstavanie': {
        icon: '↔️',
        title_ru: 'Отставание остряка от рамного рельса',
        title_uz: 'Ostriyakning ramaviy relsdan ajralishi',
        full_ru: 'Зазор между остряком и рамным рельсом у первой тяги. Не должен превышать 4 мм.',
        full_uz: 'Ostriyak va ramaviy rels orasidagi birinchi tyagada o\'lchanadigan tirqish. 4 mm dan oshmasligi kerak.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '0 – 3 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '≥ 4 мм (Движение закрывается!)' }
        ],
        note_ru: 'Если зазор составляет 4 мм и более, гребень колеса при движении против шерсти может зайти между остряком и рамным рельсом.',
        note_uz: 'Tirqish 4 mm va undan ortiq bo\'lsa, harakat davomida g\'ildirak grebini ostriyak va ramaviy rels orasiga kirib ketishi mumkin.'
    },
    'kor': {
        icon: '🔧',
        title_ru: 'Контроль остряка и рамного рельса (КОР)',
        title_uz: 'Ostriyaklarni ramaviy relslarga mahkamlash (КОР)',
        full_ru: 'Техническое состояние крепления остряков (КОР) и деталей стрелочного перевода.',
        full_uz: 'Ostriyaklarni ramaviy relslarga mahkamlash (KOR) va strelka perevod detallarining texnik holati.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: 'Исправно / Soz' }
        ],
        note_ru: 'Проверяются болты, вкладыши, тяги и упорные устройства на предмет трещин и ослаблений.',
        note_uz: 'Murvatlar, boltlar, ulovchi tyagalar va tirgak qurilmalari darz ketish yoki bo\'shashishlarga tekshiriladi.'
    },
    'shag': {
        icon: '👣',
        title_ru: 'Шаг остряка',
        title_uz: 'Ostriyak qadami (kattaligi)',
        full_ru: 'Расстояние между рабочей гранью рамного рельса и нерабочей гранью отведенного остряка. Должно быть не менее 152 мм.',
        full_uz: 'Ramaviy relsning ishchi qirrasi va uzoqlashtirilgan ostriyakning ishchi bo\'lmagan qirrasi orasidagi masofa. Kamida 152 mm bo\'lishi kerak.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '≥ 152 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 152 мм' }
        ],
        note_ru: 'При меньшем шаге колесо может задеть отведенный остряк внутренней стороной гребня.',
        note_uz: 'Qadam kichikroq bo\'lganda, g\'ildirak o\'zining ichki tomoni bilan uzoqlashtirilgan ostriyakka tegib ketishi mumkin.'
    },
    'prileganie': {
        icon: '🤝',
        title_ru: 'Плотность прилегания',
        title_uz: 'Yopishish zichligi',
        full_ru: 'Прилегание остряков к рамным рельсам и опорным башмакам.',
        full_uz: 'Ostriyaklarning ramaviy relslarga va tayanch boshmoqlariga yopishish (zich turish) holati.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: 'Плотное / Zich yopishgan' },
            { color: 'red', label: 'Опасно / Xavfli', value: 'Неприлегание / Zich yopishmagan (зазор > 4 мм)' }
        ]
    },
    'gruz': {
        icon: '🚂',
        title_ru: 'Грузонапряженность',
        title_uz: 'Yuk intensivligi',
        full_ru: 'Годовой объем пропущенного груза в миллионах тонн брутто на километр в год.',
        full_uz: 'Yiliga bir kilometrga to\'g\'ri keladigan yuk hajmi (million tonna brutto hisobida).',
        norms: [
            { color: 'green', label: 'Марка 1/11 (Норма)', value: '≤ 60 млн. т' },
            { color: 'green', label: 'Марка 1/9 (Норма)', value: '≤ 50 млн. т' },
            { color: 'green', label: 'Марка 1/6 (Норма)', value: '≤ 30 млн. т' },
            { color: 'red', label: 'Превышение нормы / Xavfli', value: '> нормы для соответствующей марки' }
        ]
    },
    'brusya': {
        icon: '🪵',
        title_ru: 'Дефекты брусьев',
        title_uz: 'Strelka bruslari (shpalalar) kamchiliklari',
        full_ru: 'Состояние деревянных или железобетонных стрелочных брусьев.',
        full_uz: 'Yog\'och yoki temir-beton strelka bruslarining holati.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: 'Исправно / Soz' },
            { color: 'yellow', label: 'Внимание / Diqqat', value: 'Кустовая гнилость, трещины / Chirish, yorilishlar' },
            { color: 'red', label: 'Опасно / Xavfli', value: 'Негодные брусья / Yaroqsiz (требуется замена)' }
        ]
    },
 
     // === URAVNITEL STIK ===
     'prim_1520': {
        icon: '🔗',
        title_ru: 'Примыкание (1520 ± 1 мм)',
        title_uz: 'Ulanish joyi (1520 ± 1 mm)',
        full_ru: 'Ширина колеи в зоне примыкания уравнительного стыка (номинал 1520 мм).',
        full_uz: 'Uravnitel stikning ulanish zonasida koliya kengligi (nominal 1520 mm).',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1520 ± 1 мм (по книге)' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1512 или > 1548 мм' }
        ]
    },
    'ostrie_1524': {
        icon: '🔗',
        title_ru: 'Острие (1524 ± 1 мм)',
        title_uz: 'Ostriye (1524 ± 1 mm)',
        full_ru: 'Ширина колеи в зоне острия уравнительного стыка (номинал 1524 мм).',
        full_uz: 'Uravnitel stikning ostriya zonasida koliya kengligi (nominal 1524 mm).',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '1524 ± 1 мм (по книге)' },
            { color: 'red', label: 'Опасно / Xavfli', value: '< 1512 или > 1548 мм' }
        ]
    },
    'pm50': {
        icon: '🔗',
        title_ru: 'Зазор ±50 мм',
        title_uz: 'Stik tirqishi (zazor ±50 mm)',
        full_ru: 'Стыковой зазор в уравнительном стыке примыкания. Допустимые отклонения составляют ±50 мм.',
        full_uz: 'Ulanish joyidagi uravnitel stik tirqishi (zazor). Ruxsat etilgan chetlanish ±50 mm.',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: 'в пределах ±50 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: 'выход за пределы ±50 мм' }
        ]
    },
    'd5160': {
        icon: '🔗',
        title_ru: 'Длина плети (5160 мм)',
        title_uz: 'Rels uzunligi (5160 mm)',
        full_ru: 'Длина уравнительного рельса (номинал 5160 мм).',
        full_uz: 'Uravnitel relsning nominal uzunligi (5160 mm).',
        norms: [
            { color: 'green', label: 'Норма / Norma', value: '5160 ± 10 мм' },
            { color: 'red', label: 'Опасно / Xavfli', value: 'выход за пределы ±10 мм' }
        ]
    }
 };
 
 // --- TOOLTIP UI LOGIC ---
 window._pu29ActiveTooltip = null;
 
 window._pu29ShowNormTooltip = function(e, normId) {
     window._pu29HideNormTooltip();
     let data = window._pu29NormData[normId];
     if (!data) return;

     // Clone to avoid mutating the static global object
     data = JSON.parse(JSON.stringify(data));

     const wearKeys = ['iznos_serd', 'iznos_usov', 'bok_ostr', 'bok_kriv', 'bok_pryam', 'bok_ram', 'iznos_group'];
     if (wearKeys.includes(normId)) {
         const key = `${currentPU29Bolinma || 'bolinma1'}_${currentPU29Switch}`;
         const swMeta = window.pu29DataStore[key] && window.pu29DataStore[key].meta;
         const railType = swMeta ? (swMeta.type || 'R-65') : 'R-65';
         const wNorms = window.getPU29WearNorms(railType);

         data.norms = [
             { color: 'green', label: 'Норма / Norma', value: `0 – ${wNorms.greenMax} мм` },
             { color: 'yellow', label: 'Внимание / Diqqat', value: `${wNorms.greenMax} – ${wNorms.yellowMax} мм` },
             { color: 'red', label: 'Опасно / Xavfli', value: `> ${wNorms.yellowMax} мм` }
         ];
         data.note_ru = `Предельный вертикальный/боковой износ для рельса типа ${railType} составляет: зеленый до ${wNorms.greenMax} мм, желтый до ${wNorms.yellowMax} мм, красный более ${wNorms.yellowMax} мм.`;
         data.note_uz = `${railType} tipidagi rels uchun yo'l qo'yiladigan vertikal/yon yeyilish: yashil ${wNorms.greenMax} mm gacha, sariq ${wNorms.yellowMax} mm gacha, qizil ${wNorms.yellowMax} mm dan yuqori.`;
     }

    const gaugeKeyToSectionIdx = {
        'styk_ram': 0, 'u_ostriya': 1, 'koren': 2, 'koren_pryam': 2, 'koren_bok': 3,
        'per_krivaya': 4, 'v_krest_ne': 5, 'krest_pryam': 5, 'krest_bok': 6,
        'ser_nnk': 7, 'per_styk': 8, 'v_gorle': 9, 'ost_serd': 10,
        'zad_styk': 12, 'zad_pryam': 12, 'zad_bok': 13
    };

    if (gaugeKeyToSectionIdx[normId] !== undefined) {
        const key = `${currentPU29Bolinma || 'bolinma1'}_${currentPU29Switch}`;
        const swMeta = window.pu29DataStore[key] && window.pu29DataStore[key].meta;
        const marka = swMeta ? (swMeta.marka || '1/11') : '1/11';
        const lineCat = swMeta ? (swMeta.lineCategory || 'asosiy') : 'asosiy';

        const norms = window.getPU29GaugeNorms(marka, lineCat);
        const secIdx = gaugeKeyToSectionIdx[normId];
        const sec = norms.sections[Math.min(secIdx, norms.sections.length - 1)];

        const gMin = sec.green[0];
        const gMax = sec.green[1];
        const yMin = sec.yellow[0];
        const yMax = sec.yellow[1];
        const dMin = norms.danger_abs[0];
        const dMax = norms.danger_abs[1];

        const catNormal = window.normalizePUCategory(lineCat);
        const catNameRu = catNormal === 'asosiy' ? 'Главный путь' : (catNormal === 'qabul' ? 'Приёмо-отправочный путь' : 'Прочие пути');
        const catNameUz = catNormal === 'asosiy' ? 'Asosiy yo\'llar' : (catNormal === 'qabul' ? 'Qabul-jo\'nash yo\'llari' : 'Boshqa yo\'llar');

        data.norms = [
            { color: 'green', label: `Норма / Norma (${marka})`, value: `${sec.nom} +${gMax - sec.nom}/-${sec.nom - gMin} мм → ${gMin}–${gMax} мм` },
            { color: 'yellow', label: 'Внимание / Diqqat', value: `${yMin}–${gMin-1} / ${gMax+1}–${yMax} мм` },
            { color: 'red', label: 'Опасно / Xavfli', value: `< ${dMin} / > ${dMax} мм` }
        ];

        data.note_ru = `Номинал: ${sec.nom} мм. Установленный допуск для категории "${catNameRu}" с маркой ${marka}: зеленый ${gMin}–${gMax} мм, желтый ${yMin}–${yMax} мм.`;
        data.note_uz = `Nominal: ${sec.nom} mm. "${catNameUz}" toifasidagi yo'l uchun marka ${marka} bilan belgilangan ruxsat oralig'i: yashil ${gMin}–${gMax} mm, sariq ${yMin}–${yMax} mm.`;
    }

    const gutterKeyToIdx = {
        'v_kontr': 0,
        'v_krest': 1,
        'v_gorle2': 2,
        'v_korne': 3
    };

    if (gutterKeyToIdx[normId] !== undefined || normId === 'jelob_group') {
        const key = `${currentPU29Bolinma || 'bolinma1'}_${currentPU29Switch}`;
        const swMeta = window.pu29DataStore[key] && window.pu29DataStore[key].meta;
        const marka = swMeta ? (swMeta.marka || '1/11') : '1/11';

        if (normId === 'jelob_group') {
            const normsJ1 = window.getPU29GutterNorms(marka, 0);
            const normsJ2 = window.getPU29GutterNorms(marka, 1);
            data.norms = [
                { color: 'green', label: `Норма / Norma (${marka})`, value: `J1 (контррельс): ${normsJ1.text} мм | J2 (усовик): ${normsJ2.text} мм` },
                { color: 'yellow', label: 'Внимание / Diqqat', value: `J1: ${normsJ1.yellow[0]}–${normsJ1.green[0]-1} / ${normsJ1.green[1]+1}–${normsJ1.yellow[1]} мм | J2: ${normsJ2.yellow[0]}–${normsJ2.green[0]-1} / ${normsJ2.green[1]+1}–${normsJ2.yellow[1]} мм` },
                { color: 'red', label: 'Опасно / Xavfli', value: `J1: < ${normsJ1.yellow[0]} / > ${normsJ1.yellow[1]} мм | J2: < ${normsJ2.yellow[0]} / > ${normsJ2.yellow[1]} мм` }
            ];
            data.note_ru = `Для марки ${marka}: ширина желоба в контррельсе J1 = ${normsJ1.text} мм, в усовиках/горле J2 = ${normsJ2.text} мм.`;
            data.note_uz = `Marka ${marka} uchun: kontrrelsdagi jelob kengligi J1 = ${normsJ1.text} mm, usovik/toriqda J2 = ${normsJ2.text} mm.`;
        } else {
            const idx = gutterKeyToIdx[normId];
            const norms = window.getPU29GutterNorms(marka, idx);
            const labelTypeRu = idx === 0 ? 'в контррельсе' : (idx === 1 ? 'в крестовине' : (idx === 2 ? 'в горле' : 'в корне остряка'));
            const labelTypeUz = idx === 0 ? 'kontrrelsdagi' : (idx === 1 ? 'krestovinadagi' : (idx === 2 ? 'toriqdagi (gorlo)' : 'ostriyak ildizidagi'));
            data.norms = [
                { color: 'green', label: `Норма / Norma (${marka})`, value: `${norms.text} мм` },
                { color: 'yellow', label: 'Внимание / Diqqat', value: `${norms.yellow[0]}–${norms.green[0]-1} / ${norms.green[1]+1}–${norms.yellow[1]} мм` },
                { color: 'red', label: 'Опасно / Xavfli', value: `< ${norms.yellow[0]} / > ${norms.yellow[1]} мм` }
            ];
            data.note_ru = `Номинал ширины желоба ${labelTypeRu} для марки ${marka} составляет ${norms.nominal} мм. Допускается зеленый: ${norms.green[0]}–${norms.green[1]} мм.`;
            data.note_uz = `Marka ${marka} uchun ${labelTypeUz} jelob nominal kengligi ${norms.nominal} mm ni tashkil etadi. Yashil zona: ${norms.green[0]}–${norms.green[1]} mm.`;
        }
    }

    if (normId === 'serd_kontr' || normId === 'kontr_usov' || normId === 'rasstoyanie_group') {
        const key = `${currentPU29Bolinma || 'bolinma1'}_${currentPU29Switch}`;
        const swMeta = window.pu29DataStore[key] && window.pu29DataStore[key].meta;
        const marka = swMeta ? (swMeta.marka || '1/11') : '1/11';
        const norms = window.getPU29DistanceNorms(marka);

        if (normId === 'serd_kontr') {
            data.norms = [
                { color: 'green', label: `Норма / Norma (${marka})`, value: `${norms.kText}` },
                { color: 'red', label: 'Опасно / Xavfli', value: `< ${norms.kMin} мм` }
            ];
            data.note_ru = `Для марки ${marka} расстояние С-К должно быть не менее ${norms.kMin} мм согласно ПТЭ.`;
            data.note_uz = `Marka ${marka} uchun S-K masofasi PTE bo'yicha kamida ${norms.kMin} mm bo'lishi shart.`;
        } else if (normId === 'kontr_usov') {
            data.norms = [
                { color: 'green', label: `Норма / Norma (${marka})`, value: `${norms.uText}` },
                { color: 'red', label: 'Опасно / Xavfli', value: `> ${norms.uMax} мм` }
            ];
            data.note_ru = `Расстояние К-У должно быть не более ${norms.uMax} мм согласно ПТЭ для безопасного прохождения.`;
            data.note_uz = `K-U masofasi poezdlar xavfsiz o'tishi uchun PTE bo'yicha ko'pi bilan ${norms.uMax} mm bo'lishi shart.`;
        } else { // rasstoyanie_group
            data.norms = [
                { color: 'green', label: `Норма / Norma (${marka})`, value: `С-К: ${norms.kText} | К-У: ${norms.uText}` },
                { color: 'red', label: 'Опасно / Xavfli', value: `С-К < ${norms.kMin} мм или К-У > ${norms.uMax} мм` }
            ];
            data.note_ru = `По ПТЭ для марки ${marka}: критическое расстояние С-К не менее ${norms.kMin} мм, К-У не более ${norms.uMax} мм.`;
            data.note_uz = `PTE bo'yicha marka ${marka} uchun: S-K masofasi kamida ${norms.kMin} mm, K-U esa ko'pi bilan ${norms.uMax} mm.`;
        }
    }
 
     // Create overlay
     const overlay = document.createElement('div');
     overlay.className = 'pu29-tooltip-overlay';
     overlay.onclick = () => window._pu29HideNormTooltip();
 
     // Create tooltip
     const tooltip = document.createElement('div');
     tooltip.className = 'pu29-norm-tooltip';
 
     let normsHtml = '';
     if (data.norms && data.norms.length > 0) {
         normsHtml = data.norms.map(n =>
             `<div class="tt-norm-row">
                 <div class="tt-norm-dot ${n.color}"></div>
                 <span class="tt-norm-label" style="min-width: 120px;">${n.label}:</span>
                 <span class="tt-norm-value" style="margin-left: auto; font-weight:800;">${n.value}</span>
             </div>`
         ).join('');
     }
 
     let noteHtml = '';
     if (data.note_ru || data.note_uz) {
         noteHtml = `
             <div class="tt-note" style="font-size:0.75rem; line-height:1.4;">
                 ${data.note_ru ? `<div><i class="fas fa-info-circle" style="color: #60a5fa; margin-right: 5px;"></i><strong>RU:</strong> ${data.note_ru}</div>` : ''}
                 ${data.note_uz ? `<div style="margin-top: 6px; color: #cbd5e1;"><i class="fas fa-info-circle" style="color: #94a3b8; margin-right: 5px;"></i><strong>UZ:</strong> ${data.note_uz}</div>` : ''}
             </div>
         `;
     }
 
     tooltip.innerHTML = `
         <div class="tt-header" style="display:flex; flex-direction:column; align-items:flex-start; gap:4px; padding: 14px 18px 12px;">
             <div style="display:flex; align-items:center; gap:10px;">
                 <div class="tt-icon">${data.icon}</div>
                 <div class="tt-title" style="font-size: 0.95rem; font-weight: 800; color: #fbbf24; line-height: 1.2;">${data.title_ru}</div>
             </div>
             <div class="tt-subtitle" style="font-size: 0.8rem; color: #94a3b8; font-weight: 600; margin-top: 5px; margin-left: 2px;">${data.title_uz}</div>
         </div>
         <div class="tt-body" style="padding: 14px 18px 16px;">
             <div class="tt-full-name" style="font-size: 0.82rem; color: #fff; margin-bottom: 6px; line-height: 1.4; font-weight: 700;"><strong>RU:</strong> ${data.full_ru}</div>
             <div class="tt-full-name-uz" style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 12px; line-height: 1.4; font-style: italic;"><strong>UZ:</strong> ${data.full_uz}</div>
             ${normsHtml ? `<div class="tt-norms" style="margin-bottom:12px;">${normsHtml}</div>` : ''}
             ${noteHtml}
         </div>
     `;
 
     document.body.appendChild(overlay);
     document.body.appendChild(tooltip);
 
     // Position tooltip near the clicked element
     const rect = e.target.closest('th').getBoundingClientRect();
     let left = rect.left + rect.width / 2 - 160;
     let top = rect.bottom + 8;
 
     // Ensure tooltip stays within viewport
     const vw = window.innerWidth;
     const vh = window.innerHeight;
     if (left + 360 > vw) left = vw - 380;
     if (left < 10) left = 10;
     if (top + 340 > vh) top = rect.top - tooltip.offsetHeight - 8;
     if (top < 10) top = 10;
 
     tooltip.style.left = left + 'px';
     tooltip.style.top = top + 'px';
 
     window._pu29ActiveTooltip = { overlay, tooltip };
 };
 
 window._pu29HideNormTooltip = function() {
     if (window._pu29ActiveTooltip) {
         window._pu29ActiveTooltip.overlay.remove();
         window._pu29ActiveTooltip.tooltip.remove();
         window._pu29ActiveTooltip = null;
     }
 };
 
 
// Attach tooltip listeners after table renders
window._pu29AttachTooltipListeners = function() {
    const table = document.getElementById('pu29-mega-table');
    if (!table) return;
    const ths = table.querySelectorAll('th[data-norm-id]');
    ths.forEach(th => {
        // Click tooltip (opens on click, dismisses when clicking overlay or outside)
        th.addEventListener('click', function(e) {
            e.stopPropagation();
            window._pu29ShowNormTooltip(e, th.getAttribute('data-norm-id'));
        });
    });
};

// Monkey-patch openPU29Window to attach listeners after render
 const _origOpenPU29Window = window.openPU29Window;
 window.openPU29Window = function(bolinmaId, swNum) {
     _origOpenPU29Window(bolinmaId, swNum);
     setTimeout(() => window._pu29AttachTooltipListeners(), 100);
 };

window.closePU29Window = function() {
    const container = document.getElementById("pu29-window-modal");
    if (container) container.remove();
    
    // Har doim dashboard modalini o'chirib qaytadan chizamiz, shunda yangilangan qiymatlar darhol aks etadi
    const dashboard = document.getElementById("pu29-menu-modal");
    if (dashboard) dashboard.remove();
    
    if (window.openPU29Menu) {
        window.openPU29Menu(currentPU29Bolinma);
    }
};

window.switchPU29Tab = function(tabName) {
    const journalTab = document.getElementById('pu29-tab-journal');
    const ordinatTab = document.getElementById('pu29-tab-ordinat');
    const journalContent = document.getElementById('pu29-tab-content-journal');
    const ordinatContent = document.getElementById('pu29-tab-content-ordinat');

    if (!journalTab || !ordinatTab || !journalContent || !ordinatContent) return;

    if (tabName === 'journal') {
        journalTab.style.background = '#fff';
        journalTab.style.color = '#1e293b';
        journalTab.style.borderBottom = '3px solid #fbbf24';
        
        ordinatTab.style.background = '#f1f5f9';
        ordinatTab.style.color = '#64748b';
        ordinatTab.style.borderBottom = '3px solid transparent';
        
        journalContent.style.display = 'block';
        ordinatContent.style.display = 'none';
    } else {
        ordinatTab.style.background = '#fff';
        ordinatTab.style.color = '#1e293b';
        ordinatTab.style.borderBottom = '3px solid #fbbf24';
        
        journalTab.style.background = '#f1f5f9';
        journalTab.style.color = '#64748b';
        journalTab.style.borderBottom = '3px solid transparent';
        
        journalContent.style.display = 'none';
        ordinatContent.style.display = 'block';
    }
};

window.pu29OrdinatData = {}; 

window.getPU29OrdinatData = function(bolinmaId, swNum) {
    const key = `pu29_ordinat_${bolinmaId}_${swNum}`;
    if (!window.pu29OrdinatData[key]) {
        const local = localStorage.getItem(key);
        if (local) {
            try {
                window.pu29OrdinatData[key] = JSON.parse(local);
            } catch(e) {
                console.error("Local storage error:", e);
            }
        } 
        
        if (!window.pu29OrdinatData[key]) {
            // Default 15 empty rows
            const rows = [];
            for (let i = 0; i < 15; i++) {
                rows.push({
                    date: '',
                    v_korne: '', m2: '', m4: '', m6: '', m8: '', m10: '', m12: '', m14: '', m16: '', m18: '', m20: '', v_konse: '',
                    prochie: '', otmetka: ''
                });
            }
            window.pu29OrdinatData[key] = rows;
        }
    }
    return window.pu29OrdinatData[key];
};

window.savePU29OrdinatDataLocal = function(bolinmaId, swNum) {
    const key = `pu29_ordinat_${bolinmaId}_${swNum}`;
    if (window.pu29OrdinatData[key]) {
        localStorage.setItem(key, JSON.stringify(window.pu29OrdinatData[key]));
    }
};

window.savePU29OrdinatRow = function(bolinmaId, swNum, rowIndex) {
    const rowObj = {
        date: document.getElementById(`pu29-ord-date-${rowIndex}`).value,
        v_korne: document.getElementById(`pu29-ord-vkorne-${rowIndex}`).value,
        m2: document.getElementById(`pu29-ord-2m-${rowIndex}`).value,
        m4: document.getElementById(`pu29-ord-4m-${rowIndex}`).value,
        m6: document.getElementById(`pu29-ord-6m-${rowIndex}`).value,
        m8: document.getElementById(`pu29-ord-8m-${rowIndex}`).value,
        m10: document.getElementById(`pu29-ord-10m-${rowIndex}`).value,
        m12: document.getElementById(`pu29-ord-12m-${rowIndex}`).value,
        m14: document.getElementById(`pu29-ord-14m-${rowIndex}`).value,
        m16: document.getElementById(`pu29-ord-16m-${rowIndex}`).value,
        m18: document.getElementById(`pu29-ord-18m-${rowIndex}`).value,
        m20: document.getElementById(`pu29-ord-20m-${rowIndex}`).value,
        v_konse: document.getElementById(`pu29-ord-vkonse-${rowIndex}`).value,
        prochie: document.getElementById(`pu29-ord-prochie-${rowIndex}`).value,
        otmetka: document.getElementById(`pu29-ord-otmetka-${rowIndex}`).value,
    };
    
    const data = window.getPU29OrdinatData(bolinmaId, swNum);
    data[rowIndex] = rowObj;
    window.savePU29OrdinatDataLocal(bolinmaId, swNum);
    
    if (window.SmartUtils) {
        SmartUtils.showToast("Ordinat qatori saqlandi!", 'success');
    }
};

window.getPU29OrdinatNorms = function(type, marka) {
    // Standart me'yorlar (namuna). Kerak bo'lsa aniq loyihalarga (proyektlarga) qarab o'zgartiriladi
    if (type === 'R-65' || type === 'R-50') {
        if (marka === '1/11') {
            return ['144', '236', '350', '485', '641', '819', '1018', '1238', '1478', '-', '-', ''];
        } else if (marka === '1/9') {
            return ['144', '260', '419', '622', '868', '1157', '1488', '-', '-', '-', '-', ''];
        } else if (marka === '1/6') {
            return ['144', '354', '699', '1177', '-', '-', '-', '-', '-', '-', '-', ''];
        }
    }
    return ['', '', '', '', '', '', '', '', '', '', '', ''];
};

window.generatePU29OrdinatHTML = function(bolinmaId, swNum, meta) {
    const data = window.getPU29OrdinatData(bolinmaId, swNum);
    const norms = window.getPU29OrdinatNorms(meta.type, meta.marka);
    
    let rowsHtml = '';
    
    // Add "Ord. po norme" static row first
    rowsHtml += `
        <tr style="background:#f8fafc; font-weight:800; text-align:center; color:#1e293b;">
            <td style="padding:8px; border:1px solid #cbd5e1;">Орд. по норме</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[0]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[1]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[2]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[3]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[4]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[5]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[6]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[7]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[8]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[9]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[10]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${norms[11]}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;"></td>
            <td style="padding:8px; border:1px solid #cbd5e1;"></td>
            <td class="no-print" style="padding:8px; border:1px solid #cbd5e1;"></td>
        </tr>
    `;
    
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const inputStyle = "width:100%; border:none; padding:8px; text-align:center; outline:none; background:#fff !important; color:#000 !important; font-weight:900 !important; box-sizing:border-box;";
        const inputStyleLeft = "width:100%; border:none; padding:8px; outline:none; background:#fff !important; color:#000 !important; font-weight:900 !important; box-sizing:border-box;";
        rowsHtml += `
            <tr style="background:#fff;">
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="date" id="pu29-ord-date-${i}" value="${row.date || ''}" style="${inputStyleLeft}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-vkorne-${i}" value="${row.v_korne || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-2m-${i}" value="${row.m2 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-4m-${i}" value="${row.m4 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-6m-${i}" value="${row.m6 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-8m-${i}" value="${row.m8 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-10m-${i}" value="${row.m10 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-12m-${i}" value="${row.m12 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-14m-${i}" value="${row.m14 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-16m-${i}" value="${row.m16 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-18m-${i}" value="${row.m18 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-20m-${i}" value="${row.m20 || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-vkonse-${i}" value="${row.v_konse || ''}" style="${inputStyle}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-prochie-${i}" value="${row.prochie || ''}" style="${inputStyleLeft}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td style="padding:0; border:1px solid #cbd5e1; background:#fff;"><input type="text" id="pu29-ord-otmetka-${i}" value="${row.otmetka || ''}" style="${inputStyleLeft}" onchange="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})"></td>
                <td class="no-print" style="padding:4px; border:1px solid #cbd5e1; text-align:center; background:#f8fafc;">
                    <button onclick="window.savePU29OrdinatRow('${bolinmaId}', '${swNum}', ${i})" style="background:#10b981; color:#fff; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-weight:700; font-size:0.75rem;">💾 Saqlash</button>
                </td>
            </tr>
        `;
    }

    return `
        <div style="padding:30px 40px; color:#1e293b; background:#fff;">
            
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; border:2px solid #94a3b8; font-size:0.85rem; margin-top:20px;">
                    <thead>
                        <tr style="background:#f1f5f9;">
                            <th rowspan="2" style="border:1px solid #94a3b8; padding:10px; vertical-align:middle;">Дата</th>
                            <th colspan="12" style="border:1px solid #94a3b8; padding:10px; text-align:center;">Величина ординат в расстояниях от корня остряка</th>
                            <th rowspan="2" style="border:1px solid #94a3b8; padding:10px; vertical-align:middle; width:200px;">Прочие неисправности в стрелочном переводе</th>
                            <th rowspan="2" style="border:1px solid #94a3b8; padding:10px; vertical-align:middle; width:200px;">Отметка об исправлении, дата и подпись</th>
                            <th rowspan="2" class="no-print" style="border:1px solid #94a3b8; padding:10px; vertical-align:middle;">Amallar</th>
                        </tr>
                        <tr style="background:#f1f5f9; font-size:0.75rem;">
                            <th style="border:1px solid #94a3b8; padding:5px;">В корне остр.</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">2м</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">4</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">6</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">8</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">10</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">12</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">14</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">16</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">18</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">20</th>
                            <th style="border:1px solid #94a3b8; padding:5px;">В конце пере-<br>водной кривой</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
            
            <div class="no-print" style="margin-top:20px; display:flex; justify-content:flex-end;">
                <button onclick="window.print()" style="background:#3b82f6; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-weight:800; cursor:pointer;">
                    <i class="fas fa-print"></i> CHOP ETISH (PRINT)
                </button>
            </div>
        </div>
    `;
};

