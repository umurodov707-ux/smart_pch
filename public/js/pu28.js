/**
 * PU-28: YO'L KO'RIK JURNALI (Word-style 7 ustunli format)
 */

window.openFullPU28Photo = function(photoSrc) {
    let viewer = document.getElementById('pu28-photo-viewer');
    if (!viewer) {
        viewer = document.createElement('div');
        viewer.id = 'pu28-photo-viewer';
        viewer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.95); z-index: 300000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.25s ease; pointer-events: none;';
        viewer.innerHTML = `
            <button onclick="document.getElementById('pu28-photo-viewer').style.opacity = 0; document.getElementById('pu28-photo-viewer').style.pointerEvents = 'none';" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.15); border: none; color: white; width: 44px; height: 44px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 300001;">
                <i class="fas fa-times"></i>
            </button>
            <img id="pu28-photo-viewer-img" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);" />
        `;
        document.body.appendChild(viewer);
    }
    document.getElementById('pu28-photo-viewer-img').src = photoSrc;
    viewer.style.pointerEvents = 'auto';
    viewer.style.opacity = 1;
};

function parseDefectTextHTML(defectText) {
    if (!defectText) return 'Без дефектов';
    try {
        if (defectText.startsWith('{') || defectText.startsWith('{"')) {
            const data = JSON.parse(defectText);
            let html = `<div>${data.desc || 'Без дефектов'}</div>`;
            if (data.photo) {
                html += `
                    <div style="margin-top: 6px;">
                        <img src="${data.photo}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" onclick="window.openFullPU28Photo('${data.photo.replace(/'/g, "\\'")}')" />
                    </div>
                `;
            }
            return html;
        }
    } catch (e) {
        console.error("JSON parse error for defect_desc:", e);
    }
    return `<div>${defectText}</div>`;
}

let pu28Data = [];
let currentPU28Department = null;

function initPU28Data() {
    const savedData = localStorage.getItem('pu28_data');
    if (savedData) {
        pu28Data = JSON.parse(savedData);
    }
    updatePU28PendingBadge();
    // Trigger sync to get latest data from server
    if (window.ApiClient) {
        syncPU28WithServer().then(() => updatePU28PendingBadge());
    }
}

function savePU28DataLocal() {
    localStorage.setItem('pu28_data', JSON.stringify(pu28Data));
}

// --- OFFLINE: kutilayotgan (hali serverga yuborilmagan) yozuvlar ko'rsatkichi ---
function updatePU28PendingBadge() {
    const pending = pu28Data.filter(r => r.id > 1000000000).length;
    let badge = document.getElementById('pu28-pending-badge');
    if (pending === 0) {
        if (badge) badge.remove();
        return;
    }
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'pu28-pending-badge';
        badge.style.cssText = 'position:fixed; bottom:70px; right:20px; z-index:999999; padding:8px 16px; border-radius:20px; font-weight:800; font-size:0.72rem; background:rgba(245,158,11,0.12); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); display:flex; align-items:center; gap:8px;';
        document.body.appendChild(badge);
    }
    badge.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> PU-28: ${pending} ta yozuv navbatda`;
}
window.updatePU28PendingBadge = updatePU28PendingBadge;

// Aloqa tiklanganda, PU-28'da navbatda turgan yozuvlarni avtomatik qayta yuborish
window.addEventListener('online', () => {
    if (currentPU28Department) {
        window.syncPU28WithServer().then(() => updatePU28PendingBadge());
    }
});

window.openPU28Window = function (departmentId) {
    console.log("PU-28 Opened for:", departmentId);
    currentPU28Department = departmentId;
    window.pu28ExtraPages = 0;

    initPU28Data();

    let modal = document.getElementById('pu28-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu28-modal';
        modal.className = 'integration-window';
        modal.style.setProperty('z-index', '200000', 'important');
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid var(--glass-border); padding: 15px 30px;">
            <h2 class="department-name" style="font-size: 1.3rem; margin: 0; display: flex; align-items: center; gap: 12px; font-weight: 800; color: #fff; text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);">
                <i class="fas fa-clipboard-check" style="color: var(--accent-gold);"></i> PU-28: YO'L KO'RIK JURNALI
            </h2>
            <div style="display:flex; align-items:center; gap:25px;">
                <button class="action-btn delete" onclick="document.getElementById('pu28-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; transition: all 0.3s;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="window-content" style="padding: 0; background: #e2e8f0; color: #000; overflow-x: auto; overflow-y: auto; height: calc(100% - 70px); box-sizing: border-box;">
            
            <div style="display:flex; background: #0f172a; padding: 15px 30px 0; border-bottom: 1px solid #333; overflow-x: auto;">
                <button id="pu28-tab-journal" onclick="window.switchPU28Tab('journal')" style="padding:15px 25px; background: #fff; color:#000; border:none; border-radius:14px 14px 0 0; font-weight:900; cursor:pointer; font-size: 0.82rem; text-transform: uppercase; whitespace: nowrap;">1-BO'LIM: YO'L KO'RIK JURNALI</button>
                <button id="pu28-tab-characteristics" onclick="window.switchPU28Tab('characteristics')" style="padding:15px 25px; background:transparent; color:#94a3b8; border:none; border-radius:14px 14px 0 0; cursor:pointer; margin-left:8px; font-weight:700; font-size: 0.82rem; text-transform: uppercase; transition: 0.3s; whitespace: nowrap;">YO'L TAVSIFI (Xarakteristika)</button>
            </div>

            <div id="pu28-main-view">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; background: #0f172a; border-bottom: 1px solid #333;">
                    <h3 style="margin: 0; color: #fff; font-weight: 700; font-size: 1.2rem;">${departmentId === 'ishlab-chiqarish' ? 'Barcha bo\'linmalar' : (window.subdivisions?.find(s => s.id === departmentId)?.name || departmentId)}</h3>
                    <div style="display: flex; gap: 15px;">
                        <button onclick="createNewPU28RecordManual()" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25); transition: 0.3s;">
                            <i class="fas fa-edit"></i> YANGI TEKSHIRUV (QO'LDA)
                        </button>
                        <button onclick="window.pu28ExtraPages = (window.pu28ExtraPages || 0) + 1; window.refreshPU28Table();" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25); transition: 0.3s;">
                            <i class="fas fa-plus"></i> QO'SHIMCHA BET
                        </button>
                        <button onclick="exportPU28ToExcel()" style="background: #e2e8f0; border: 1px solid #cbd5e1; color: #0f172a; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold;">
                            <i class="fas fa-file-excel"></i> EXPORT (EXCEL)
                        </button>
                    </div>
                </div>

                <div id="pu28-table-content" style="padding: 30px; display: flex; justify-content: center; min-height: 100%;">
                    ${generatePU28TableHTML(departmentId)}
                </div>
            </div>


            <div id="pu28-char-view" style="display:none; padding: 30px; justify-content: center; min-height: 100%;">
                ${generatePU28CharacteristicsHTML(departmentId)}
            </div>
        </div>
    `;

    modal.classList.add('active');

    if (window.ApiClient) {
        syncPU28WithServer();
    }
};

window.switchPU28Tab = function (tab) {
    const isJ = tab === 'journal';
    const isC = tab === 'characteristics';

    document.getElementById('pu28-main-view').style.display = isJ ? 'block' : 'none';
    document.getElementById('pu28-char-view').style.display = isC ? 'flex' : 'none';

    const tabJ = document.getElementById('pu28-tab-journal');
    const tabC = document.getElementById('pu28-tab-characteristics');

    if (tabJ) {
        tabJ.style.background = isJ ? '#fff' : 'transparent';
        tabJ.style.color = isJ ? '#000' : '#94a3b8';
    }
    if (tabC) {
        tabC.style.background = isC ? '#fff' : 'transparent';
        tabC.style.color = isC ? '#000' : '#94a3b8';
    }
};

window.refreshPU28Table = function () {
    const tableContainer = document.getElementById('pu28-table-content');
    if (tableContainer) {
        tableContainer.innerHTML = generatePU28TableHTML(currentPU28Department);
    }
}

window.exportPU28ToExcel = function() {
    let records = pu28Data;
    if (currentPU28Department !== 'ishlab-chiqarish') {
        records = records.filter(r => r.departmentId === currentPU28Department || r.bolinma_id === currentPU28Department);
    }
    
    if (records.length === 0) {
        if (window.SmartUtils) SmartUtils.showToast("Eksport uchun ma'lumot yo'q!", "warning");
        return;
    }

    const dataForExport = records.map(r => ({
        'Sana': r.date,
        'Usul': r.checkMethod || r.check_method,
        'KM': r.km,
        'PK': r.pk,
        'ZV': r.zv,
        'Nosozlik': r.defectDesc || r.defect_desc,
        'Holat': (r.resolvedStatus || r.resolved_status) === 'resolved' ? 'Bartaraf etildi' : 'Kutilmoqda',
        'Bartaraf sanasi': r.dateResolved || r.date_resolved || '-'
    }));

    if (window.SmartReporting) {
        SmartReporting.exportToExcel(dataForExport, `PU28_Jurnali_${currentPU28Department}.xlsx`);
    } else {
        console.error("SmartReporting utility not found");
    }
};

window.savePU28CharData = function(deptId, rowIdx, colIdx, val) {
    let savedData = [];
    try {
        savedData = JSON.parse(localStorage.getItem(`pu28_char_data_${deptId}`)) || [];
    } catch(e) {}
    
    while(savedData.length <= rowIdx) {
        savedData.push(['', '', '', '', '', '', '', '']);
    }
    
    savedData[rowIdx][colIdx] = val;
    localStorage.setItem(`pu28_char_data_${deptId}`, JSON.stringify(savedData));
};

function generatePU28CharacteristicsHTML(deptId) {
    const minRows = 20; // 20 empty rows
    let tableRows = '';
    let savedData = [];
    try {
        savedData = JSON.parse(localStorage.getItem(`pu28_char_data_${deptId}`)) || [];
    } catch(e) {}
    
    for (let i = 0; i < minRows; i++) {
        const row = savedData[i] || ['', '', '', '', '', '', '', ''];
        tableRows += `
            <tr class="pu28-char-editable-row">
                <td style="padding: 0;"><input type="text" value="${row[0] || ''}" onchange="window.savePU28CharData('${deptId}', ${i}, 0, this.value)" style="width:100%; height:100%; border:none !important; outline:none !important; background:transparent !important; color:#000 !important; border-radius:0 !important; font-family:inherit; text-align:center; box-sizing: border-box; padding: 4px;"></td>
                <td style="padding: 0;"><input type="text" value="${row[1] || ''}" onchange="window.savePU28CharData('${deptId}', ${i}, 1, this.value)" style="width:100%; height:100%; border:none !important; outline:none !important; background:transparent !important; color:#000 !important; border-radius:0 !important; font-family:inherit; text-align:center; box-sizing: border-box; padding: 4px;"></td>
                <td style="padding: 0;"><input type="text" value="${row[2] || ''}" onchange="window.savePU28CharData('${deptId}', ${i}, 2, this.value)" style="width:100%; height:100%; border:none !important; outline:none !important; background:transparent !important; color:#000 !important; border-radius:0 !important; font-family:inherit; text-align:center; box-sizing: border-box; padding: 4px;"></td>
                <td style="padding: 0;"><input type="text" value="${row[3] || ''}" onchange="window.savePU28CharData('${deptId}', ${i}, 3, this.value)" style="width:100%; height:100%; border:none !important; outline:none !important; background:transparent !important; color:#000 !important; border-radius:0 !important; font-family:inherit; text-align:center; box-sizing: border-box; padding: 4px;"></td>
                <td style="padding: 0;"><input type="text" value="${row[4] || ''}" onchange="window.savePU28CharData('${deptId}', ${i}, 4, this.value)" style="width:100%; height:100%; border:none !important; outline:none !important; background:transparent !important; color:#000 !important; border-radius:0 !important; font-family:inherit; text-align:center; box-sizing: border-box; padding: 4px;"></td>
                <td style="padding: 0;"><input type="text" value="${row[5] || ''}" onchange="window.savePU28CharData('${deptId}', ${i}, 5, this.value)" style="width:100%; height:100%; border:none !important; outline:none !important; background:transparent !important; color:#000 !important; border-radius:0 !important; font-family:inherit; text-align:center; box-sizing: border-box; padding: 4px;"></td>
                <td style="padding: 0;"><input type="text" value="${row[6] || ''}" onchange="window.savePU28CharData('${deptId}', ${i}, 6, this.value)" style="width:100%; height:100%; border:none !important; outline:none !important; background:transparent !important; color:#000 !important; border-radius:0 !important; font-family:inherit; text-align:center; box-sizing: border-box; padding: 4px;"></td>
                <td style="padding: 0;"><input type="text" value="${row[7] || ''}" onchange="window.savePU28CharData('${deptId}', ${i}, 7, this.value)" style="width:100%; height:100%; border:none !important; outline:none !important; background:transparent !important; color:#000 !important; border-radius:0 !important; font-family:inherit; box-sizing: border-box; padding: 4px;"></td>
                <td style="padding: 4px; text-align:center;" class="no-print">
                    <button onclick="window.SmartUtils ? window.SmartUtils.showToast('Qator saqlandi!', 'success') : alert('Qator saqlandi!')" style="background:#10b981; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;" title="Saqlash"><i class="fas fa-save"></i></button>
                </td>
            </tr>
        `;
    }

    const deptName = deptId === 'ishlab-chiqarish' ? '__________________' : (window.subdivisions?.find(s => s.id === deptId)?.name || deptId);

    return `
        <div class="pu28-doc" style="background: #fff; color: #000;">
            <h2 style="text-align: center; margin-bottom: 20px; font-weight: bold; text-transform: uppercase; color: #000 !important;">Характеристика пути<br><span style="font-size:16px; font-weight:normal; text-transform:none; color: #000 !important;">на <u style="font-weight:bold; color: #000 !important;">${deptName}</u> рабочем отделении</span></h2>
            <table class="pu28-doc-table" style="color: #000;">
                <thead>
                    <tr>
                        <th rowspan="2" style="width: 80px;">Кило-<br>метр</th>
                        <th colspan="2">Пикеты</th>
                        <th colspan="2">План</th>
                        <th rowspan="2" style="width: 100px;">Возвышен.<br>наружного<br>рельса</th>
                        <th rowspan="2" style="width: 100px;">Норма ши-<br>рины колеи<br>в кривой</th>
                        <th rowspan="2">Примечание</th>
                        <th rowspan="2" class="no-print" style="width: 50px; background:#e2e8f0;">Amallar</th>
                    </tr>
                    <tr>
                        <th style="width: 60px;">от</th>
                        <th style="width: 60px;">до</th>
                        <th style="width: 80px;">прямая<br>(Пр)</th>
                        <th style="width: 80px;">кривая<br>(Р= )</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

function getPU28DefectAgingInfo(recordDate) {
    if (!recordDate) return { days: 0, level: 'green', text: '0 kun', badgeBg: '#dcfce7', badgeColor: '#166534' };
    
    const created = new Date(recordDate);
    const now = new Date();
    const diffTime = Math.max(0, now - created);
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (days >= 5) {
        return {
            days: days,
            level: 'red',
            text: `🚨 MUDDAT O'TDI: ${days} kun!`,
            badgeBg: '#fee2e2',
            badgeColor: '#dc2626',
            border: '2px solid #ef4444'
        };
    } else if (days >= 3) {
        return {
            days: days,
            level: 'yellow',
            text: `⚠️ DIQQAT: ${days} kun`,
            badgeBg: '#fef3c7',
            badgeColor: '#d97706',
            border: '1px solid #f59e0b'
        };
    } else {
        return {
            days: days,
            level: 'green',
            text: `🟢 ${days} kun o'tdi`,
            badgeBg: '#dcfce7',
            badgeColor: '#15803d',
            border: '1px solid #22c55e'
        };
    }
}

window.sendPU28TelegramDeadlineAlert = function(recordId) {
    const record = pu28Data.find(r => r.id === recordId);
    if (record) {
        if (window.SmartUtils) {
            SmartUtils.showToast(`Telegram-ga muddati o'tgan nosozlik ogohlantirishi yuborildi! (KM ${record.km}, PK ${record.pk})`, "success");
        } else {
            alert(`Telegram-ga muddati o'tgan nosozlik ogohlantirishi yuborildi!\nKM ${record.km}, PK ${record.pk}`);
        }
    }
};

function generatePU28TableHTML(deptId) {
    let records = pu28Data;
    if (deptId !== 'ishlab-chiqarish') {
        records = records.filter(r => r.departmentId === deptId || r.bolinma_id === deptId);
    }

    // Aging Statistics calculation
    const unresolved = records.filter(r => (r.resolvedStatus || r.resolved_status) !== 'resolved');
    let greenCount = 0, yellowCount = 0, redCount = 0;

    unresolved.forEach(r => {
        const info = getPU28DefectAgingInfo(r.date);
        if (info.level === 'red') redCount++;
        else if (info.level === 'yellow') yellowCount++;
        else greenCount++;
    });

    // Default 15 bo'sh qator ko'rsatish + qo'shimcha betlar (1 bet = 15 qator)
    const minRows = 15 + (window.pu28ExtraPages ? window.pu28ExtraPages * 15 : 0);
    let tableRows = '';

    for (let i = 0; i < Math.max(records.length, minRows); i++) {
        if (i < records.length) {
            const r = records[i];
            const isResolved = (r.resolvedStatus || r.resolved_status) === 'resolved';
            const defectText = r.defectDesc || r.defect_desc;
            const checkMethod = r.checkMethod || r.check_method;
            const agingInfo = getPU28DefectAgingInfo(r.date);

            tableRows += `
            <tr class="pu28-filled-row">
                <td style="text-align: center;">${r.date}</td>
                <td style="text-align: center;">${checkMethod}</td>
                <td style="text-align: center; font-weight: bold;">${r.km}</td>
                <td style="text-align: center; font-weight: bold;">${r.pk}</td>
                <td style="text-align: center; font-weight: bold;">${r.zv}</td>
                <td style="padding: 10px;">
                    ${parseDefectTextHTML(defectText)}
                    ${!isResolved ? `
                    <div style="margin-top:8px; display:flex; gap:8px;">
                        <button onclick="resolvePU28Defect(${r.id})" title="Bajarildi" style="background:#10b981; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;"><i class="fas fa-check"></i></button>
                        <button onclick="deletePU28Entry(${r.id})" title="O'chirish" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                    ` : ''}
                </td>
                <td style="padding: 10px; vertical-align: middle;">
                    ${isResolved 
                        ? `<div style="text-align:center;"><i class="fas fa-check" style="color: #059669;"></i> Bartaraf etildi<br/>${r.dateResolved || r.date_resolved}</div>
                           ${(r.workPhoto || r.work_photo) ? `<div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
                                <img src="${r.workPhoto || r.work_photo}" style="width:45px; height:45px; border-radius:8px; object-fit:cover; border:2px solid #10b981; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1);" onclick="window.open(this.src)" title="Bajarilgan ish rasmi"/>
                                ${(r.facePhoto || r.face_photo) ? `<img src="${r.facePhoto || r.face_photo}" style="width:45px; height:45px; border-radius:8px; object-fit:cover; border:2px solid #3b82f6; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1);" onclick="window.open(this.src)" title="Tasdiqlagan xodim (Face ID)"/>` : ''}
                           </div>` : ''}
                          ` 
                        : `
                           <div style="text-align:center;">
                               <div style="color:#dc2626; font-weight:bold; margin-bottom:4px;">Bartaraf etilmagan</div>
                               <div style="padding: 4px 8px; border-radius: 6px; background: ${agingInfo.badgeBg}; color: ${agingInfo.badgeColor}; border: ${agingInfo.border || 'none'}; font-size: 0.75rem; font-weight: 900; display: inline-block;">
                                   ${agingInfo.text}
                               </div>
                               ${agingInfo.level === 'red' ? `
                                   <div style="margin-top: 6px;">
                                       <button onclick="window.sendPU28TelegramDeadlineAlert(${r.id})" style="padding: 3px 8px; background: #dc2626; color: white; border: none; border-radius: 4px; font-size: 0.7rem; font-weight: bold; cursor: pointer;">
                                           <i class="fab fa-telegram-plane"></i> Telegram Ogohlantirish
                                       </button>
                                   </div>
                               ` : ''}
                           </div>
                          `}
                </td>
            </tr>`;
        } else {
            const todayStr = new Date().toISOString().split('T')[0];
            tableRows += `
            <tr class="pu28-editable-row" id="pu28-row-new-${i}">
                <td style="padding: 4px; text-align: center; vertical-align: middle;">
                    <input type="date" id="pu28-new-date-${i}" value="${todayStr}" style="width: 100%; box-sizing: border-box; background: transparent !important; color: #000 !important; border: none !important; border-radius: 0 !important; font-family: inherit; font-size: 13px; text-align: center; outline: none !important; padding: 4px;">
                </td>
                <td style="padding: 4px; text-align: center; vertical-align: middle;">
                    <select id="pu28-new-method-${i}" style="width: 100%; box-sizing: border-box; background: transparent !important; color: #000 !important; border: none !important; border-radius: 0 !important; font-family: inherit; font-size: 13px; outline: none !important; padding: 4px; cursor: pointer;">
                        <option value="Vizual">👁️ Визуальный</option>
                        <option value="Kommision">👥 Комиссионный</option>
                        <option value="Defektoskop">🔬 Дефектоскоп</option>
                        <option value="Уравнительный стык">🔗 Уравнительный стык</option>
                    </select>
                </td>
                <td style="padding: 4px; text-align: center; vertical-align: middle;">
                    <input type="number" id="pu28-new-km-${i}" placeholder="Км..." style="width: 100%; box-sizing: border-box; background: transparent !important; color: #000 !important; border: none !important; border-radius: 0 !important; font-family: inherit; font-size: 13px; font-weight: bold; text-align: center; outline: none !important; padding: 4px;">
                </td>
                <td style="padding: 4px; text-align: center; vertical-align: middle;">
                    <input type="number" id="pu28-new-pk-${i}" placeholder="Пк..." style="width: 100%; box-sizing: border-box; background: transparent !important; color: #000 !important; border: none !important; border-radius: 0 !important; font-family: inherit; font-size: 13px; font-weight: bold; text-align: center; outline: none !important; padding: 4px;">
                </td>
                <td style="padding: 4px; text-align: center; vertical-align: middle;">
                    <input type="number" id="pu28-new-zv-${i}" placeholder="Зв..." value="2" style="width: 100%; box-sizing: border-box; background: transparent !important; color: #000 !important; border: none !important; border-radius: 0 !important; font-family: inherit; font-size: 13px; font-weight: bold; text-align: center; outline: none !important; padding: 4px;">
                </td>
                <td style="padding: 4px; vertical-align: middle;">
                    <div style="display: flex; gap: 4px; align-items: center;">
                        <input type="text" id="pu28-new-defect-${i}" placeholder="Aniqlangan nosozlik..." onclick="window.openPU28DefectPicker('pu28-new-defect-${i}')" style="width: 100%; box-sizing: border-box; background: transparent !important; color: #000 !important; border: none !important; border-radius: 0 !important; font-family: inherit; font-size: 13px; outline: none !important; padding: 4px;">
                        <button type="button" onclick="window.openPU28DefectPicker('pu28-new-defect-${i}')" title="Nosozlikni tanlash (Yozish / Belgilash / Kamera)" style="background: rgba(14, 165, 233, 0.15); border: 1px solid #0ea5e9; color: #0ea5e9; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; flex-shrink: 0;">
                            <i class="fas fa-list-check"></i>
                        </button>
                    </div>
                </td>
                <td style="padding: 4px; text-align: center; vertical-align: middle;">
                    <button onclick="savePU28InlineRow(${i})" title="Сохранить" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="fas fa-save"></i> Saqlash
                    </button>
                </td>
            </tr>`;
        }
    }

    return `
        <style>
            .pu28-doc {
                width: 100%;
                max-width: 1200px;
                background: #fff;
                padding: 40px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                border: 1px solid #ccc;
                font-family: 'Times New Roman', Times, serif;
            }
            .pu28-doc-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .pu28-doc-table th, .pu28-doc-table td {
                border: 1px solid #000;
                padding: 8px;
                font-size: 14px;
                vertical-align: top;
            }
            .pu28-doc-table th {
                text-align: center;
                font-weight: bold;
                background: #fdfdfd;
                vertical-align: middle;
            }
            .pu28-filled-row:hover {
                background: #f1f5f9;
            }
        </style>
        <div class="pu28-doc">
            <!-- Deadline Aging Tracker Top Summary Widget -->
            <div style="background: #020617; padding: 16px 24px; border-radius: 16px; margin-bottom: 25px; border: 1px solid rgba(56, 189, 248, 0.25); color: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" class="no-print">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div style="font-weight: 900; font-size: 0.95rem; color: #38bdf8; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-clock" style="color: #f59e0b; font-size: 1.2rem;"></i>
                        BARTARAF ETILMAGAN KAMCHILIKLAR TAYMERI (DEADLINE AGING TRACKER)
                    </div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <div style="padding: 6px 14px; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 10px; font-size: 0.8rem; font-weight: bold; color: #ef4444;">
                            🔴 Muddat o'tgan (5+ kun): <strong>${redCount} ta</strong>
                        </div>
                        <div style="padding: 6px 14px; background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; border-radius: 10px; font-size: 0.8rem; font-weight: bold; color: #f59e0b;">
                            🟡 Diqqat (3-5 kun): <strong>${yellowCount} ta</strong>
                        </div>
                        <div style="padding: 6px 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 10px; font-size: 0.8rem; font-weight: bold; color: #10b981;">
                            🟢 Norma (0-3 kun): <strong>${greenCount} ta</strong>
                        </div>
                    </div>
                </div>
            </div>

            <h2 style="text-align: center; margin-bottom: 20px; font-weight: bold; text-transform: uppercase;">YO'LLARDAGI ANIQLANGAN NOSOZLIKLARNI QAYD ETISH JURNALI (PU-28)</h2>
            <table class="pu28-doc-table">
                <thead>
                    <tr>
                        <th style="width: 100px;">Дата проверки<br/><span style="font-weight: normal;">(Tekshiruv sanasi)</span></th>
                        <th style="width: 120px;">Способ проверки<br/><span style="font-weight: normal;">(Tekshirish usuli)</span></th>
                        <th style="width: 60px;">Км<br/><span style="font-weight: normal;">(Km)</span></th>
                        <th style="width: 60px;">Пк<br/><span style="font-weight: normal;">(Pk)</span></th>
                        <th style="width: 60px;">Зв<br/><span style="font-weight: normal;">(Zv)</span></th>
                        <th>Обнаруженные неисправности (величина, дробь, протяжение)<br/><span style="font-weight: normal;">(Aniqlangan nosozliklar (kattaligi, kasr, uzunligi))</span></th>
                        <th style="width: 200px;">Отметка об устранении неисправностей<br/><span style="font-weight: normal;">(Nosozliklar bartaraf etilganligi haqida belgi)</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}


window.pu28ResolveState = { id: null, step: 1, workPhoto: null, facePhoto: null, stream: null };

window.resolvePU28Defect = async function (recordId) {
    window.pu28ResolveState = { id: recordId, step: 1, workPhoto: null, facePhoto: null, stream: null };
    
    let ovr = document.getElementById('pu28-resolve-ovr');
    if (!ovr) {
        ovr = document.createElement('div');
        ovr.id = 'pu28-resolve-ovr';
        ovr.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:999999; display:flex; align-items:center; justify-content:center; flex-direction:column; color:#fff;';
        document.body.appendChild(ovr);
    }
    
    ovr.innerHTML = `
        <div style="background:#1e293b; padding:30px; border-radius:20px; width:450px; max-width:90%; text-align:center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid #334155;">
            <h2 id="pu28-resolve-title" style="margin-top:0; color:#10b981;">1-QADAM: Bajarilgan ishni rasmga oling</h2>
            <p id="pu28-resolve-desc" style="color:#94a3b8; font-size:14px; margin-bottom:20px;">Kamchilik qanday bartaraf etilganini ko'rsatuvchi rasmni oling.</p>
            <div style="width:100%; height:300px; background:#000; border-radius:15px; overflow:hidden; margin-bottom:20px; position:relative;">
                <video id="pu28-resolve-v" autoplay playsinline style="width:100%; height:100%; object-fit:cover;"></video>
            </div>
            <div style="display:flex; gap:15px; justify-content:center;">
                <button onclick="window.closePU28Resolve()" style="padding:12px 25px; background:transparent; border:1px solid #475569; color:#cbd5e1; border-radius:12px; cursor:pointer; font-weight:bold;">BEKOR QILISH</button>
                <button id="pu28-resolve-btn" onclick="window.capturePU28Resolve()" style="padding:12px 25px; background:#10b981; border:none; color:#fff; border-radius:12px; cursor:pointer; font-weight:bold;"><i class="fas fa-camera"></i> RASMGA OLISH</button>
            </div>
        </div>
    `;
    ovr.style.display = 'flex';
    
    try {
        window.pu28ResolveState.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('pu28-resolve-v').srcObject = window.pu28ResolveState.stream;
    } catch (e) {
        alert("Kamera xatosi: " + e.message);
        window.closePU28Resolve();
    }
};

window.closePU28Resolve = function() {
    const ovr = document.getElementById('pu28-resolve-ovr');
    if (ovr) ovr.style.display = 'none';
    if (window.pu28ResolveState.stream) {
        window.pu28ResolveState.stream.getTracks().forEach(t => t.stop());
    }
};

window.capturePU28Resolve = async function() {
    try {
        const v = document.getElementById('pu28-resolve-v');
        const canvas = document.createElement('canvas');
        canvas.width = v.videoWidth || 300;
        canvas.height = v.videoHeight || 300;
        canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height);
        const snapshot = canvas.toDataURL('image/jpeg');

        if (window.pu28ResolveState.step === 1) {
            window.pu28ResolveState.workPhoto = snapshot;
            window.pu28ResolveState.step = 2;
            document.getElementById('pu28-resolve-title').innerText = "2-QADAM: Shaxsni tasdiqlash";
            document.getElementById('pu28-resolve-title').style.color = "#3b82f6";
            document.getElementById('pu28-resolve-desc').innerText = "Kameraga qarang. Bu sizni PDB xodimi sifatida tasdiqlaydi.";
            document.getElementById('pu28-resolve-btn').innerHTML = '<i class="fas fa-fingerprint"></i> TASDIQLASH';
            document.getElementById('pu28-resolve-btn').style.background = "#3b82f6";
        } else {
            window.pu28ResolveState.facePhoto = snapshot;
            const btn = document.getElementById('pu28-resolve-btn');
            btn.disabled = true;
            btn.innerText = "...";
            await window.finalizePU28Resolve(window.pu28ResolveState.id, window.pu28ResolveState.workPhoto, window.pu28ResolveState.facePhoto);
            window.closePU28Resolve();
        }
    } catch(e) {
        console.error(e);
        alert("Xatolik: " + e.message);
    }
};

window.finalizePU28Resolve = async function(recordId, workPhoto, facePhoto) {
    const record = pu28Data.find(r => r.id === recordId || String(r.id) === String(recordId));
    if (record) {
        const now = new Date().toISOString().split('T')[0];
        record.resolvedStatus = 'resolved';
        record.resolved_status = 'resolved';
        record.dateResolved = now;
        record.date_resolved = now;
        record.workPhoto = workPhoto;
        record.work_photo = workPhoto;
        record.facePhoto = facePhoto;
        record.face_photo = facePhoto;
        
        savePU28DataLocal();
        refreshPU28Table();

        try {
            const numId = Number(recordId);
            if (!isNaN(numId) && numId < 1000000000) {
                await ApiClient.put(`/api/pu28/${recordId}/resolve`, {
                    workPhoto: workPhoto,
                    facePhoto: facePhoto
                });
            }
        } catch (err) {
            console.warn("Server resolve PUT warning:", err);
        }

        // Always sync with server to push local changes
        await syncPU28WithServer();
        
        if (window.SmartUtils) SmartUtils.showToast("Kamchilik rasm va yuz tasdig'i bilan 'Bajarildi' etib belgilandi!", 'success');
    }
};

window.deletePU28Entry = async function (recordId) {
    if (confirm("Yozuvni o'chirib yuborasizmi?")) {
        try {
            const numId = Number(recordId);
            if (!isNaN(numId) && numId < 1000000000) {
                await ApiClient.delete(`/api/pu28/${recordId}`);
            }
            pu28Data = pu28Data.filter(r => r.id !== recordId && String(r.id) !== String(recordId));
            savePU28DataLocal();
            refreshPU28Table();
            if (window.SmartUtils) SmartUtils.showToast("O'chirildi", "info");
        } catch (err) {
            console.error("Delete error:", err);
            alert("O'chirishda xatolik");
        }
    }
};

window.syncPU28WithServer = async function() {
    if (!currentPU28Department) return;

    try {
        console.log("Syncing PU-28 with server for:", currentPU28Department);
        
        // 1. Get server data
        const serverData = await ApiClient.get(`/api/pu28/${currentPU28Department}`);
        
        // 2. Identify local-only records (temporary IDs > 1000000000)
        const localOnly = pu28Data.filter(r => r.id > 1000000000 && (r.departmentId === currentPU28Department || r.bolinma_id === currentPU28Department));
        
        if (localOnly.length > 0) {
            await ApiClient.post('/api/pu28/bulk-sync', {
                bolinma_id: currentPU28Department,
                records: localOnly
            });
        }

        // 3. Re-fetch server data after bulk sync
        const updatedServerData = await ApiClient.get(`/api/pu28/${currentPU28Department}`);
        
        // 4. Smart Merge: Preserve resolved status from local data if server status is pending
        const serverMap = new Map();
        (updatedServerData || []).forEach(sr => serverMap.set(String(sr.id), sr));

        for (let r of pu28Data) {
            if (r.departmentId === currentPU28Department || r.bolinma_id === currentPU28Department) {
                const isLocalResolved = r.resolvedStatus === 'resolved' || r.resolved_status === 'resolved';
                if (isLocalResolved && r.id < 1000000000) {
                    const serverRec = serverMap.get(String(r.id));
                    if (serverRec && serverRec.resolved_status !== 'resolved') {
                        try {
                            await ApiClient.put(`/api/pu28/${r.id}/resolve`, {
                                workPhoto: r.workPhoto || r.work_photo,
                                facePhoto: r.facePhoto || r.face_photo
                            });
                            serverRec.resolved_status = 'resolved';
                            serverRec.date_resolved = r.dateResolved || r.date_resolved || new Date().toISOString().split('T')[0];
                            serverRec.work_photo = r.workPhoto || r.work_photo;
                            serverRec.face_photo = r.facePhoto || r.face_photo;
                        } catch(e) {
                            console.warn("Resolve sync error for id", r.id, e);
                        }
                    }
                }
            }
        }

        let mergedDeptData = Array.from(serverMap.values());
        
        if (currentPU28Department === 'ishlab-chiqarish' || currentPU28Department === 'all') {
            pu28Data = mergedDeptData;
        } else {
            const otherDepts = pu28Data.filter(r => (r.departmentId && r.departmentId !== currentPU28Department) && (r.bolinma_id && r.bolinma_id !== currentPU28Department));
            pu28Data = [...otherDepts, ...mergedDeptData];
        }

        savePU28DataLocal();
        refreshPU28Table();
        return true;
    } catch (err) {
        console.error("PU-28 Sync Error:", err);
        return false;
    }
};

// ----------------------------------------------------
// PU-28 HANDLERS
// ----------------------------------------------------
window.createNewPU28RecordVoice = function () {
    if (typeof window.createNewPU28RecordManual === 'function') {
        window.createNewPU28RecordManual();
    }
};

// --- Direct Manual Entry Logic ---

window.createNewPU28RecordManual = function() {
    let modal = document.getElementById('pu28-manual-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.id = 'pu28-manual-modal';
    modal.className = 'integration-window active';
    modal.style.cssText = 'z-index: 200020; max-width: 480px; left: 50%; top: 50%; transform: translate(-50%, -50%); border: 2px solid #10b981; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.85);';
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    modal.innerHTML = `
      <div class="window-header" style="background:#0f172a; border-bottom:1px solid rgba(255,255,255,0.1); padding: 15px 20px;">
          <h2 style="font-size:1.1rem; margin:0; color:#fff; font-weight:800;"><i class="fas fa-edit" style="color:#10b981;"></i> Yangi tekshiruv (PU-28 Manual)</h2>
          <button onclick="document.getElementById('pu28-manual-modal').remove()" style="background:none; border:none; color:#fff; cursor:pointer; font-size:1.2rem;"><i class="fas fa-times"></i></button>
      </div>
      <div class="window-content" style="padding:20px; background:#070b14; color:#fff; display:flex; flex-direction:column; gap:15px; box-sizing:border-box;">
          <div>
              <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:5px;">Sana</label>
              <input type="date" id="pu28-man-date" value="${todayStr}" style="width:100%; box-sizing:border-box; padding:10px; border-radius:8px; background:#1e293b; border:1px solid #334155; color:#fff; outline:none;">
          </div>
          <div>
              <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:5px;">Tekshirish usuli</label>
              <select id="pu28-man-method" style="width:100%; box-sizing:border-box; padding:10px; border-radius:8px; background:#1e293b; border:1px solid #334155; color:#fff; outline:none;">
                  <option value="Vizual">👁️ Визуальный</option>
                  <option value="Kommision">👥 Комиссионный</option>
                  <option value="Defektoskop">🔬 Дефектоскоп</option>
                  <option value="Уравнительный стык">🔗 Уравнительный стык</option>
              </select>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
              <div>
                  <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:5px;">KM</label>
                  <input type="number" id="pu28-man-km" placeholder="KM..." style="width:100%; box-sizing:border-box; padding:10px; border-radius:8px; background:#1e293b; border:1px solid #334155; color:#fff; outline:none;">
              </div>
              <div>
                  <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:5px;">PK</label>
                  <input type="number" id="pu28-man-pk" placeholder="PK..." style="width:100%; box-sizing:border-box; padding:10px; border-radius:8px; background:#1e293b; border:1px solid #334155; color:#fff; outline:none;">
              </div>
              <div>
                  <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:5px;">Zveno (Зв)</label>
                  <input type="number" id="pu28-man-zv" value="2" style="width:100%; box-sizing:border-box; padding:10px; border-radius:8px; background:#1e293b; border:1px solid #334155; color:#fff; outline:none;">
              </div>
          </div>
          <div>
              <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:5px;">Nosozlik / Kamchilik (3 xil usulda kiritish)</label>
              <div style="display:flex; gap:6px; margin-bottom:8px;">
                  <input type="text" id="pu28-man-defect" placeholder="Nosozlikni tanlang yoki yozing..." style="flex:1; box-sizing:border-box; padding:10px; border-radius:8px; background:#1e293b; border:1px solid #334155; color:#fff; outline:none;">
                  <button type="button" onclick="window.openPU28DefectPicker('pu28-man-defect')" style="background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#000; padding:10px 14px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; gap:6px;">
                      <i class="fas fa-list-check"></i> TANLASH
                  </button>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                  <button type="button" onclick="document.getElementById('pu28-man-defect').value='Без дефектов'" style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.25); color:#10b981; padding:5px 8px; border-radius:6px; font-size:0.72rem; cursor:pointer;">✅ Без дефектов</button>
                  <button type="button" onclick="document.getElementById('pu28-man-defect').value='Подтяжка болтов 2шт'" style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.25); color:#f59e0b; padding:5px 8px; border-radius:6px; font-size:0.72rem; cursor:pointer;">🔧 Bolt tortish</button>
                  <button type="button" onclick="document.getElementById('pu28-man-defect').value='Замена резины'" style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.25); color:#f59e0b; padding:5px 8px; border-radius:6px; font-size:0.72rem; cursor:pointer;">🛹 Rezinka almashtirish</button>
              </div>
          </div>
          <div>
              <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:5px;">Nosozlik surati (Photo)</label>
              <input type="file" id="pu28-man-photo-file" accept="image/*" style="display:none;" onchange="handlePU28ManualPhotoSelect(event)">
              <div style="display:flex; align-items:center; gap:10px;">
                  <button type="button" onclick="document.getElementById('pu28-man-photo-file').click()" style="background:#1e293b; border:1px solid #334155; color:#fff; padding:8px 15px; border-radius:8px; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; gap:6px;">
                      <i class="fas fa-camera"></i> Rasmga olish / Yuklash
                  </button>
                  <span id="pu28-man-photo-name" style="font-size:0.75rem; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px;">Rasm tanlanmagan</span>
              </div>
              <input type="hidden" id="pu28-man-photo-base64">
          </div>
          
          <button onclick="submitPU28ManualEntry()" style="background:#10b981; color:#000; border:none; padding:12px; border-radius:10px; font-weight:bold; font-size:0.9rem; cursor:pointer; margin-top:10px; display:flex; align-items:center; justify-content:center; gap:8px;">
              <i class="fas fa-save"></i> Saqlash
          </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto GPS trigger for KM/PK
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            
            const baseLat = 41.2825;
            const baseLon = 69.2065;
            const kmPerLat = 111;
            const distance = Math.sqrt(Math.pow(lat - baseLat, 2) + Math.pow(lon - baseLon, 2)) * kmPerLat;
            const calcKm = Math.floor(3500 + distance);
            const calcPk = Math.floor((distance % 1) * 10) || 1;
            
            const kmInput = document.getElementById('pu28-man-km');
            const pkInput = document.getElementById('pu28-man-pk');
            if (kmInput && !kmInput.value) kmInput.value = calcKm;
            if (pkInput && !pkInput.value) pkInput.value = calcPk;
        }, () => {});
    }
};

// ====================================================================
// PU-28 3-MODE DEFECT PICKER WIDGET (Yozish ✍️ | Belgilash 📋 | Kamera 📷)
// ====================================================================
window.openPU28DefectPicker = function (targetInputId) {
    let pickerModal = document.getElementById('pu28-defect-picker-modal');
    if (pickerModal) pickerModal.remove();

    const targetInput = document.getElementById(targetInputId);
    const initialVal = targetInput ? targetInput.value : '';

    pickerModal = document.createElement('div');
    pickerModal.id = 'pu28-defect-picker-modal';
    pickerModal.className = 'active';
    pickerModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(2, 6, 23, 0.88); backdrop-filter: blur(16px);
        z-index: 350000; display: flex; align-items: center; justify-content: center; padding: 20px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const commonDefects = [
        // Boltlar & Skrepleniya
        { icon: "🔧", label: "Bolt tortish / Podtyagivaniya boltov 2sht", cat: "bolt" },
        { icon: "🔩", label: "Klemma boltlarini qisish (Zakrepleniye)", cat: "bolt" },
        { icon: "🛹", label: "Rezinka prokladka almashtirish", cat: "bolt" },
        { icon: "🔩", label: "Skrepleniye (klemma) to'g'rilash", cat: "bolt" },
        { icon: "🔩", label: "Zakladnoy boltni almashtirish", cat: "bolt" },
        { icon: "⛓️", label: "Styklarda tirqishni sozlash (Zazor)", cat: "bolt" },
        { icon: "🔩", label: "Nakladkani almashtirish / to'g'rilash", cat: "bolt" },
        { icon: "🔨", label: "Kostillarni qoqish / mustahkamlash", cat: "bolt" },

        // Shpal & Ballast
        { icon: "🪵", label: "Yog'och shpal almashtirish", cat: "shpal" },
        { icon: "🪵", label: "Temir-beton shpal almashtirish", cat: "shpal" },
        { icon: "🪵", label: "Shpallarni shablon bo'yicha sozlash", cat: "shpal" },
        { icon: "🪨", label: "Ballast / Shcheben to'ldirish (Podsypka)", cat: "shpal" },
        { icon: "🪨", label: "Ballast prizmasini tozalash (Ochistka)", cat: "shpal" },
        { icon: "🪵", label: "Shpal surilishini bartaraf etish (Kutoveniye)", cat: "shpal" },

        // Rels & Geometriya
        { icon: "📏", label: "Rels kallasining vertikal yeyilishi (4mm)", cat: "rels" },
        { icon: "📏", label: "Rels kallasining yon yeyilishi (6mm)", cat: "rels" },
        { icon: "⚡", label: "Payvand chok nuqsoni (Стыковой дефект)", cat: "rels" },
        { icon: "🔨", label: "Styk cho'kishi / proyeda (Провисание)", cat: "rels" },
        { icon: "⚡", label: "Rels metali uvalanishi (Выкрашивание)", cat: "rels" },
        { icon: "📐", label: "Koleya kengayishi/torayishini to'g'rilash", cat: "rels" },
        { icon: "📐", label: "Yo'l cho'kishini to'g'rilash (Просадка)", cat: "rels" },
        { icon: "📐", label: "Yo'l qiyshayishini to'g'rilash (Перекос)", cat: "rels" },

        // Strelka & Oddiy
        { icon: "⚠️", label: "Strelkali o'tkazgichni sozlash", cat: "strelka" },
        { icon: "⚠️", label: "Strelka ostryagini almashtirish", cat: "strelka" },
        { icon: "⚠️", label: "Strelka krestovinasini almashtirish", cat: "strelka" },
        { icon: "⚠️", label: "Ostryak jipsligini to'g'rilash (Prileganiye)", cat: "strelka" },
        { icon: "✅", label: "Kamchiliksiz (Без дефектов)", cat: "all" }
    ];

    pickerModal.innerHTML = `
        <div style="background: #020617; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 24px; padding: 24px; max-width: 720px; width: 100%; color: white; box-shadow: 0 30px 80px rgba(0,0,0,0.95);">
            
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; margin-bottom: 16px;">
                <h3 style="margin: 0; color: #38bdf8; font-weight: 900; font-size: 1.15rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-list-check" style="color: #f59e0b;"></i>
                    NOSOZLIKNI KIRITISH (PU-28 Katalog)
                </h3>
                <button onclick="document.getElementById('pu28-defect-picker-modal').remove()" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- 3 Mode Tab Selector Bar -->
            <div style="display: flex; gap: 8px; background: rgba(15, 23, 42, 0.8); padding: 6px; border-radius: 14px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.08);">
                <button id="pu28-mode-tab-select" onclick="window.switchPU28InputMode('select')" style="flex: 1; padding: 10px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4af37, #f59e0b); color: #000; font-weight: 900; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
                    <i class="fas fa-th-large"></i> 📋 2. BELGILASH (Katalog)
                </button>
                <button id="pu28-mode-tab-write" onclick="window.switchPU28InputMode('write')" style="flex: 1; padding: 10px; border: none; border-radius: 10px; background: transparent; color: #cbd5e1; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <i class="fas fa-pen"></i> ✍️ 1. YOZISH (Qo'lda)
                </button>
                <button id="pu28-mode-tab-camera" onclick="window.switchPU28InputMode('camera')" style="flex: 1; padding: 10px; border: none; border-radius: 10px; background: transparent; color: #cbd5e1; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <i class="fas fa-camera"></i> 📷 3. FOTO (Kamera)
                </button>
            </div>

            <!-- MODE 2: BELGILASH (EXPANDED CATALOG & SEARCH) -->
            <div id="pu28-mode-content-select" style="display: block;">
                
                <!-- Category Filter Buttons & Quick Search -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
                        <button onclick="window.filterPU28DefectCat('all', this)" class="pu28-cat-btn active" style="padding: 5px 10px; border-radius: 8px; border: 1px solid #38bdf8; background: #0ea5e9; color: white; font-size: 0.75rem; font-weight: bold; cursor: pointer;">🌐 Barchasi (${commonDefects.length})</button>
                        <button onclick="window.filterPU28DefectCat('bolt', this)" class="pu28-cat-btn" style="padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(15,23,42,0.8); color: #cbd5e1; font-size: 0.75rem; font-weight: bold; cursor: pointer;">🔧 Boltlar</button>
                        <button onclick="window.filterPU28DefectCat('shpal', this)" class="pu28-cat-btn" style="padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(15,23,42,0.8); color: #cbd5e1; font-size: 0.75rem; font-weight: bold; cursor: pointer;">🪵 Shpal/Ballast</button>
                        <button onclick="window.filterPU28DefectCat('rels', this)" class="pu28-cat-btn" style="padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(15,23,42,0.8); color: #cbd5e1; font-size: 0.75rem; font-weight: bold; cursor: pointer;">📏 Rels/Geometriya</button>
                        <button onclick="window.filterPU28DefectCat('strelka', this)" class="pu28-cat-btn" style="padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(15,23,42,0.8); color: #cbd5e1; font-size: 0.75rem; font-weight: bold; cursor: pointer;">⚠️ Strelka</button>
                    </div>
                    <div style="position: relative; width: 180px;">
                        <input type="text" id="pu28-defect-search" oninput="window.searchPU28DefectCatalog(this.value)" placeholder="Qidirish..." style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; color: white; padding: 6px 10px 6px 28px; font-size: 0.78rem; outline: none;">
                        <i class="fas fa-search" style="position: absolute; left: 9px; top: 8px; font-size: 0.75rem; color: #94a3b8;"></i>
                    </div>
                </div>

                <!-- Chips Grid (Scrollable) -->
                <div id="pu28-defect-chips-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 320px; overflow-y: auto; padding-right: 5px;">
                    ${commonDefects.map(d => `
                        <div data-cat="${d.cat}" data-label="${d.label.toLowerCase()}" onclick="window.applyPU28PickedDefect('${targetInputId}', '${d.label.replace(/'/g, "\\'")}')" 
                             style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 10px 12px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s ease;"
                             onmouseover="this.style.borderColor='#38bdf8'; this.style.transform='translateY(-2px)';"
                             onmouseout="this.style.borderColor='rgba(56, 189, 248, 0.2)'; this.style.transform='translateY(0)';">
                            <span style="font-size: 1.2rem;">${d.icon}</span>
                            <span style="font-size: 0.8rem; font-weight: 800; color: #f8fafc; line-height: 1.3;">${d.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- MODE 1: YOZISH (QO'LDA MATN) -->
            <div id="pu28-mode-content-write" style="display: none;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px; font-weight: 700;">Nosozlik matni va izohini yozing:</label>
                    <textarea id="pu28-picker-custom-text" rows="4" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; color: #fff; padding: 12px; font-family: inherit; font-size: 0.9rem; outline: none;">${initialVal}</textarea>
                </div>
                <button onclick="window.applyPU28PickedDefect('${targetInputId}', document.getElementById('pu28-picker-custom-text').value)" style="width: 100%; padding: 12px; background: #10b981; border: none; color: white; border-radius: 12px; font-weight: 900; cursor: pointer;">
                    <i class="fas fa-check"></i> Matnni Saqlash
                </button>
            </div>

            <!-- MODE 3: KAMERA / FOTOSURAT -->
            <div id="pu28-mode-content-camera" style="display: none; text-align: center;">
                <div style="background: rgba(15, 23, 42, 0.9); border: 1px dashed rgba(56, 189, 248, 0.4); border-radius: 16px; padding: 25px; margin-bottom: 15px;">
                    <i class="fas fa-camera fa-3x" style="color: #38bdf8; margin-bottom: 12px; display: block;"></i>
                    <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 15px;">Aniqlangan nosozlikning fotosuratini oling yoki yuklang:</div>
                    <input type="file" id="pu28-picker-file-input" accept="image/*" style="display: none;" onchange="window.handlePU28PickerPhotoSelect(event, '${targetInputId}')">
                    <button onclick="document.getElementById('pu28-picker-file-input').click()" style="padding: 12px 24px; background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none; color: white; border-radius: 12px; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fas fa-camera"></i> Kamera / Rasm Tanlash
                    </button>
                    <div id="pu28-picker-photo-preview" style="margin-top: 15px; display: none;">
                        <img id="pu28-picker-img-tag" style="max-width: 160px; max-height: 120px; border-radius: 10px; border: 2px solid #10b981;" />
                    </div>
                </div>
            </div>

        </div>
    `;

    document.body.appendChild(pickerModal);
};

window.switchPU28InputMode = function (mode) {
    const btnSelect = document.getElementById('pu28-mode-tab-select');
    const btnWrite = document.getElementById('pu28-mode-tab-write');
    const btnCamera = document.getElementById('pu28-mode-tab-camera');

    const contentSelect = document.getElementById('pu28-mode-content-select');
    const contentWrite = document.getElementById('pu28-mode-content-write');
    const contentCamera = document.getElementById('pu28-mode-content-camera');

    if (contentSelect) contentSelect.style.display = mode === 'select' ? 'block' : 'none';
    if (contentWrite) contentWrite.style.display = mode === 'write' ? 'block' : 'none';
    if (contentCamera) contentCamera.style.display = mode === 'camera' ? 'block' : 'none';

    if (btnSelect) {
        btnSelect.style.background = mode === 'select' ? 'linear-gradient(135deg, #d4af37, #f59e0b)' : 'transparent';
        btnSelect.style.color = mode === 'select' ? '#000' : '#cbd5e1';
    }
    if (btnWrite) {
        btnWrite.style.background = mode === 'write' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent';
        btnWrite.style.color = mode === 'write' ? '#fff' : '#cbd5e1';
    }
    if (btnCamera) {
        btnCamera.style.background = mode === 'camera' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent';
        btnCamera.style.color = mode === 'camera' ? '#fff' : '#cbd5e1';
    }
};

window.applyPU28PickedDefect = function (targetInputId, defectText) {
    const targetInput = document.getElementById(targetInputId);
    if (targetInput) {
        targetInput.value = defectText;
    }
    const pickerModal = document.getElementById('pu28-defect-picker-modal');
    if (pickerModal) pickerModal.remove();

    if (window.SmartUtils) {
        SmartUtils.showToast(`Nosozlik kiritildi: ${defectText}`, "success");
    }
};

window.handlePU28PickerPhotoSelect = function (event, targetInputId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const photoBase64 = e.target.result;
        const targetInput = document.getElementById(targetInputId);
        const currentDesc = targetInput ? targetInput.value || 'Aniqlangan nosozlik' : 'Aniqlangan nosozlik';
        const structuredDefect = JSON.stringify({ desc: currentDesc, photo: photoBase64 });
        
        if (targetInput) targetInput.value = structuredDefect;

        const imgTag = document.getElementById('pu28-picker-img-tag');
        const prevBox = document.getElementById('pu28-picker-photo-preview');
        if (imgTag) imgTag.src = photoBase64;
        if (prevBox) prevBox.style.display = 'block';

        setTimeout(() => {
            const pickerModal = document.getElementById('pu28-defect-picker-modal');
            if (pickerModal) pickerModal.remove();
            if (window.SmartUtils) SmartUtils.showToast("Rasm nosozlikka muvaffaqiyatli biriktirildi!", "success");
        }, 800);
    };
    reader.readAsDataURL(file);
};

window.filterPU28DefectCat = function (cat, btnEl) {
    document.querySelectorAll('.pu28-cat-btn').forEach(b => {
        b.style.background = 'rgba(15,23,42,0.8)';
        b.style.color = '#cbd5e1';
        b.style.borderColor = 'rgba(255,255,255,0.15)';
    });
    if (btnEl) {
        btnEl.style.background = '#0ea5e9';
        btnEl.style.color = 'white';
        btnEl.style.borderColor = '#38bdf8';
    }

    const searchVal = (document.getElementById('pu28-defect-search')?.value || '').toLowerCase();

    document.querySelectorAll('#pu28-defect-chips-container > div').forEach(item => {
        const itemCat = item.getAttribute('data-cat');
        const itemLabel = item.getAttribute('data-label') || '';
        const matchCat = cat === 'all' || itemCat === cat || itemCat === 'all';
        const matchSearch = !searchVal || itemLabel.includes(searchVal);

        item.style.display = matchCat && matchSearch ? 'flex' : 'none';
    });
};

window.searchPU28DefectCatalog = function (query) {
    const searchVal = query.toLowerCase();
    document.querySelectorAll('#pu28-defect-chips-container > div').forEach(item => {
        const itemLabel = item.getAttribute('data-label') || '';
        item.style.display = itemLabel.includes(searchVal) ? 'flex' : 'none';
    });
};

window.handlePU28ManualPhotoSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    document.getElementById('pu28-man-photo-name').textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('pu28-man-photo-base64').value = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.submitPU28ManualEntry = async function() {
    const date = document.getElementById('pu28-man-date').value;
    const method = document.getElementById('pu28-man-method').value;
    const km = parseInt(document.getElementById('pu28-man-km').value) || 0;
    const pk = parseInt(document.getElementById('pu28-man-pk').value) || 0;
    const zv = parseInt(document.getElementById('pu28-man-zv').value) || 0;
    const defectVal = document.getElementById('pu28-man-defect').value.trim();
    const photoBase64 = document.getElementById('pu28-man-photo-base64').value;
    
    if (!km || !defectVal) {
        if (window.SmartUtils) window.SmartUtils.showToast("KM va Nosozlik maydonlarini to'ldiring!", "warning");
        return;
    }
    
    const structuredDefect = photoBase64 ? JSON.stringify({ desc: defectVal, photo: photoBase64 }) : defectVal;
    const isNoDefect = defectVal === 'Kamchiliksiz' || defectVal === 'Без дефектов';
    
    const newRecord = {
        id: Date.now(),
        bolinma_id: currentPU28Department,
        departmentId: currentPU28Department,
        date: date,
        check_method: method,
        checkMethod: method,
        km: km,
        pk: pk,
        zv: zv,
        defect_desc: structuredDefect,
        defectDesc: structuredDefect,
        resolved_status: isNoDefect ? 'resolved' : 'pending',
        resolvedStatus: isNoDefect ? 'resolved' : 'pending',
        date_resolved: isNoDefect ? date : null,
        dateResolved: isNoDefect ? date : null
    };

    pu28Data.push(newRecord);
    savePU28DataLocal();
    updatePU28PendingBadge();

    const manualModal = document.getElementById('pu28-manual-modal');
    if (manualModal) manualModal.remove();

    refreshPU28Table();

    if (window.SmartUtils) {
        if (navigator.onLine) {
            SmartUtils.showToast("PU-28 jurnaliga qo'lda saqlandi! Serverga yuborilmoqda...", "success");
        } else {
            SmartUtils.showToast("Internet yo'q — yozuv saqlandi, aloqa tiklanganda avtomatik yuboriladi.", "warning");
        }
    }

    syncPU28WithServer().then(ok => {
        if (ok === false && window.SmartUtils && navigator.onLine) {
            SmartUtils.showToast("Yozuv saqlandi, lekin serverga hali yetkazilmadi — qayta urinib ko'riladi.", "warning");
        }
        updatePU28PendingBadge();
    });
};

window.savePU28InlineRow = async function(index) {
    const date = document.getElementById('pu28-new-date-' + index).value;
    const method = document.getElementById('pu28-new-method-' + index).value;
    const km = parseInt(document.getElementById('pu28-new-km-' + index).value) || 0;
    const pk = parseInt(document.getElementById('pu28-new-pk-' + index).value) || 0;
    const zv = parseInt(document.getElementById('pu28-new-zv-' + index).value) || 0;
    const defectVal = document.getElementById('pu28-new-defect-' + index).value.trim();
    
    if (!km || !defectVal) {
        if (window.SmartUtils) window.SmartUtils.showToast("KM va Nosozlik maydonlarini to'ldiring!", "warning");
        return;
    }
    
    const isNoDefect = defectVal === 'Kamchiliksiz' || defectVal === 'Без дефектов';
    
    const newRecord = {
        id: Date.now(),
        bolinma_id: currentPU28Department,
        departmentId: currentPU28Department,
        date: date,
        check_method: method,
        checkMethod: method,
        km: km,
        pk: pk,
        zv: zv,
        defect_desc: defectVal,
        defectDesc: defectVal,
        resolved_status: isNoDefect ? 'resolved' : 'pending',
        resolvedStatus: isNoDefect ? 'resolved' : 'pending',
        date_resolved: isNoDefect ? date : null,
        dateResolved: isNoDefect ? date : null
    };

    pu28Data.push(newRecord);
    savePU28DataLocal();
    updatePU28PendingBadge();

    refreshPU28Table();

    if (window.SmartUtils) {
        if (navigator.onLine) {
            SmartUtils.showToast("PU-28 jadvaliga saqlandi! Serverga yuborilmoqda...", "success");
        } else {
            SmartUtils.showToast("Internet yo'q — yozuv saqlandi, aloqa tiklanganda avtomatik yuboriladi.", "warning");
        }
    }

    syncPU28WithServer().then(ok => {
        if (ok === false && window.SmartUtils && navigator.onLine) {
            SmartUtils.showToast("Yozuv saqlandi, lekin serverga hali yetkazilmadi — qayta urinib ko'riladi.", "warning");
        }
        updatePU28PendingBadge();
    });
};

// PU-28 Section 2 kod alohida faylga ko'chirildi: public/js/pu28_section2.js
