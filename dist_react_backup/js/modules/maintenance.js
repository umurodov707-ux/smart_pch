/**
 * SMART PCH — Texnik xizmat ko'rsatish moduli
 */
let maintenanceLogs = JSON.parse(localStorage.getItem('maintenance_logs') || 'null') || [
    { id: 1, object: 'Lokomotiv #2024', task: 'Dvigatel moyini almashtirish', status: 'repair', person: 'Azimov B.', date: '2026-01-20' },
    { id: 2, object: 'Stansiya A-1 transformator', task: 'Kuchlanishni barqarorlashtirish', status: 'check', person: 'Karimov S.', date: '2026-01-25' },
    { id: 3, object: 'Videokuzatuv tizimi', task: "Kamera #4 signal yo'qolishi", status: 'ok', person: "IT Bo'lim", date: '2026-01-24' }
];

function saveMaintenanceData() {
    localStorage.setItem('maintenance_logs', JSON.stringify(maintenanceLogs));
    initMaintenanceTable();
}

function createMaintenanceSection() {
    const section = document.createElement('section');
    section.id = 'maintenance-section';
    section.className = 'content-section';
    section.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h2><i class="fas fa-tools"></i> Texnik Xizmat Ko'rsatish</h2>
            <button class="action-btn view" onclick="openMaintModal()"><i class="fas fa-plus"></i> Yangi yozuv</button>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
            <div class="stat-card" style="padding:1rem;">
                <div id="maint-repair-count" style="font-size:1.5rem; font-weight:bold; color:white;">0</div>
                <div style="font-size:0.8rem;">Ta'mirlashda</div>
            </div>
            <div class="stat-card" style="padding:1rem; background:linear-gradient(135deg, #f39c12, #e67e22);">
                <div id="maint-check-count" style="font-size:1.5rem; font-weight:bold; color:white;">0</div>
                <div style="font-size:0.8rem;">Rejali Tekshiruv</div>
            </div>
            <div class="stat-card" style="padding:1rem; background:linear-gradient(135deg, #2ecc71, #27ae60);">
                <div style="font-size:1.5rem; font-weight:bold; color:white;">98%</div>
                <div style="font-size:0.8rem;">Tizim Barqarorligi</div>
            </div>
        </div>
        <div class="maintenance-logs">
            <table class="maintenance-table">
                <thead>
                    <tr>
                        <th>Ob'ekt / Qurilma</th>
                        <th>Muammo / Vazifa</th>
                        <th>Holat</th>
                        <th>Mas'ul</th>
                        <th>Sana</th>
                        <th style="text-align:center;">Amallar</th>
                    </tr>
                </thead>
                <tbody id="maintenance-body"></tbody>
            </table>
        </div>`;
    setTimeout(initMaintenanceTable, 100);
    return section;
}
window.createMaintenanceSection = createMaintenanceSection;

function initMaintenanceTable() {
    const body = document.getElementById('maintenance-body');
    if (!body) return;
    body.innerHTML = '';
    let repairCount = 0;
    let checkCount = 0;

    maintenanceLogs.forEach((log, index) => {
        if (log.status === 'repair') repairCount++;
        if (log.status === 'check') checkCount++;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${log.object}</strong></td>
            <td>${log.task}</td>
            <td><span class="status-badge ${log.status}">${getStatusLabel(log.status)}</span></td>
            <td>${log.person}</td>
            <td>${log.date}</td>
            <td style="text-align:center;">
                <button class="action-btn edit" onclick="openMaintModal(${index})" style="padding:5px 8px;"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteMaintLog(${index})" style="padding:5px 8px;"><i class="fas fa-trash"></i></button>
            </td>`;
        body.appendChild(tr);
    });

    const rc = document.getElementById('maint-repair-count');
    const cc = document.getElementById('maint-check-count');
    if (rc) rc.textContent = repairCount;
    if (cc) cc.textContent = checkCount;
}

function getStatusLabel(status) {
    switch (status) {
        case 'repair': return "Ta'mirlash";
        case 'check': return 'Tekshiruv';
        case 'ok': return 'Bajarildi';
        default: return status;
    }
}

function openMaintModal(index = null) {
    const log = index !== null ? maintenanceLogs[index] : {
        object: '', task: '', status: 'repair', person: '',
        date: new Date().toISOString().split('T')[0]
    };

    const modal = document.createElement('div');
    modal.id = 'maint-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:10000;backdrop-filter:blur(5px);';
    modal.innerHTML = `
        <div style="background:rgba(30,39,46,0.95);width:400px;padding:25px;border-radius:15px;border:1px solid rgba(255,255,255,0.2);color:white;">
            <h3>${index !== null ? 'Tahrirlash' : 'Yangi yozuv'}</h3>
            <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;">
                <input type="text" id="m-object" placeholder="Ob'ekt nomi" value="${log.object}" style="padding:10px;border-radius:5px;border:none;background:rgba(255,255,255,0.1);color:white;">
                <input type="text" id="m-task" placeholder="Muammo / Vazifa" value="${log.task}" style="padding:10px;border-radius:5px;border:none;background:rgba(255,255,255,0.1);color:white;">
                <select id="m-status" style="padding:10px;border-radius:5px;border:none;background:rgba(255,255,255,0.1);color:white;">
                    <option value="repair" ${log.status === 'repair' ? 'selected' : ''}>Ta'mirlash</option>
                    <option value="check" ${log.status === 'check' ? 'selected' : ''}>Tekshiruv</option>
                    <option value="ok" ${log.status === 'ok' ? 'selected' : ''}>Bajarildi</option>
                </select>
                <input type="text" id="m-person" placeholder="Mas'ul shaxs" value="${log.person}" style="padding:10px;border-radius:5px;border:none;background:rgba(255,255,255,0.1);color:white;">
                <input type="date" id="m-date" value="${log.date}" style="padding:10px;border-radius:5px;border:none;background:rgba(255,255,255,0.1);color:white;">
                <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
                    <button class="action-btn delete" onclick="document.getElementById('maint-modal').remove()">Bekor qilish</button>
                    <button class="action-btn check" onclick="saveMaintLog(${index === null ? 'null' : index})">Saqlash</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
}
window.openMaintModal = openMaintModal;

function saveMaintLog(index) {
    const object = document.getElementById('m-object').value;
    const task = document.getElementById('m-task').value;
    const status = document.getElementById('m-status').value;
    const person = document.getElementById('m-person').value;
    const date = document.getElementById('m-date').value;

    if (!object || !task) {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
        return;
    }

    const newLog = { id: Date.now(), object, task, status, person, date };
    if (index !== null && index !== 'null') {
        maintenanceLogs[index] = newLog;
    } else {
        maintenanceLogs.push(newLog);
    }

    saveMaintenanceData();
    document.getElementById('maint-modal').remove();
    if (typeof showNotification === 'function') showNotification("Ma'lumot saqlandi!", 'success');
}
window.saveMaintLog = saveMaintLog;

function deleteMaintLog(index) {
    if (confirm("O'chirmoqchimisiz?")) {
        maintenanceLogs.splice(index, 1);
        saveMaintenanceData();
        if (typeof showNotification === 'function') showNotification("Ma'lumot o'chirildi", 'info');
    }
}
window.deleteMaintLog = deleteMaintLog;
