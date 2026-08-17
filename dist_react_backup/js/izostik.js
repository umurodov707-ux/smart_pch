/**
 * SMART IZOSTIK MONITOR v1.0
 * Izolyatsiyalangan birikmalarni monitoring qilish va rejalashtirish tizimi
 */

window.openIzostikWindow = function (bolinmaId) {
    let modal = document.getElementById('izostik-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'izostik-modal';
        modal.className = 'integration-window';
        modal.style.setProperty('z-index', '200000', 'important');
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid rgba(56, 189, 248, 0.2); padding: 15px 30px;">
            <h2 class="department-name" style="font-size: 1.3rem; margin: 0; display: flex; align-items: center; gap: 12px; font-weight: 800; color: #fff;">
                <i class="fas fa-microchip" style="color: #38bdf8;"></i> IZOSTIKLAR MONITORING VA REJA (2025-2026)
            </h2>
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="position: relative;">
                    <i class="fas fa-search" style="position: absolute; left: 12px; top: 11px; color: #94a3b8; font-size: 0.8rem;"></i>
                    <input type="text" id="izostik-search" placeholder="Izlash (KM, №...)" oninput="filterIzostikTable()" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 15px 8px 35px; border-radius: 10px; font-size: 0.85rem; width: 200px;">
                </div>
                <button class="action-btn" onclick="openIzostikEditor(null, '${bolinmaId}')" style="background: var(--accent-blue, #38bdf8); color: #000; border: none; padding: 8px 20px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(56, 189, 248, 0.2);">
                    <i class="fas fa-plus"></i> YANGI QO'SHISH
                </button>
                <button class="action-btn delete" onclick="document.getElementById('izostik-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div id="izostik-editor-container" style="display:none; padding: 20px; background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid rgba(255,255,255,0.1);">
            <!-- Form will be injected here -->
        </div>
        <div class="window-content" style="padding: 0; background: #070b14; color: #f8fafc; overflow-y: auto; height: calc(100% - 70px); box-sizing: border-box;">
            
            <!-- Statistical Tiles -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 25px;">
                <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 20px;">
                    <div style="color: #94a3b8; font-size: 0.75rem; text-transform: uppercase;">JAMI IZOSTIKLAR</div>
                    <div id="izostik-stat-total" style="font-size: 2rem; font-weight: 900;">0</div>
                </div>
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 20px; border-radius: 20px;">
                    <div style="color: #ef4444; font-size: 0.75rem; text-transform: uppercase;">MUDDATI O'TGAN</div>
                    <div id="izostik-stat-expired" style="font-size: 2rem; font-weight: 900; color: #ef4444;">0</div>
                </div>
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); padding: 20px; border-radius: 20px;">
                    <div style="color: #f59e0b; font-size: 0.75rem; text-transform: uppercase;">MUDDATI YAQIN</div>
                    <div id="izostik-stat-warning" style="font-size: 2rem; font-weight: 900; color: #f59e0b;">0</div>
                </div>
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 20px;">
                    <div style="color: #10b981; font-size: 0.75rem; text-transform: uppercase;">BAJARILDI</div>
                    <div id="izostik-stat-done" style="font-size: 2rem; font-weight: 900; color: #10b981;">0</div>
                </div>
            </div>

            <!-- Management Table -->
            <div style="padding: 0 25px 40px 25px;">
                <div style="background: rgba(30, 41, 59, 0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: rgba(0,0,0,0.4);">
                            <tr>
                                <th style="padding: 15px 20px; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">№</th>
                                <th style="padding: 15px 20px; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">№ Izostik</th>
                                <th style="padding: 15px 20px; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">Turi</th>
                                <th style="padding: 15px 20px; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">Joylashuvi</th>
                                <th style="padding: 15px 20px; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">Oxirgi sana</th>
                                <th style="padding: 15px 20px; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">Keyingi sana</th>
                                <th style="padding: 15px 20px; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">Holati</th>
                                <th style="padding: 15px 20px; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">Amallar</th>
                            </tr>
                        </thead>
                        <tbody id="izostik-table-body">
                            <!-- Data injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    loadIzostikData(bolinmaId);
};

async function loadIzostikData(bolinmaId) {
    try {
        const data = await SmartUtils.fetchAPI(`/izostiklar/${bolinmaId}`);
        
        // Map backend naming to frontend naming if different
        const mappedData = data.map(r => ({
            id: r.id,
            group: r.group_name,
            num: r.num,
            type: r.type,
            location: r.location,
            km: r.km,
            lastDate: r.last_date,
            performer: r.performer,
            bolinma: r.bolinma_id,
            history: r.history
        }));
        
        renderIzostikTable(mappedData, bolinmaId);
    } catch (err) {
        console.error("Fetch error:", err);
        if (window.SmartUtils) window.SmartUtils.showToast("Ma'lumotlarni yuklashda xatolik!", "error");
    }
}

function renderIzostikTable(data, bolinmaId) {
    const tbody = document.getElementById('izostik-table-body');
    if (!tbody) return;

    let html = '';
    let currentGroup = '';
    let stats = { total: data.length, expired: 0, warning: 0, done: 0 };

    const now = new Date();

    data.forEach((item, index) => {
        if (item.group !== currentGroup) {
            currentGroup = item.group;
            html += `
                <tr style="background: rgba(56, 189, 248, 0.05);">
                    <td colspan="8" style="padding: 10px 20px; color: #38bdf8; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
                        <i class="fas fa-map-signs"></i> ${currentGroup}
                    </td>
                </tr>
            `;
        }

        const lastParts = (item.lastDate || '').split(/[-.]/); // Handle both YYYY-MM-DD and DD.MM.YYYY
        let last = new Date();
        if (lastParts.length === 3) {
            if (lastParts[0].length === 4) {
                // YYYY-MM-DD
                last = new Date(parseInt(lastParts[0]), parseInt(lastParts[1]) - 1, parseInt(lastParts[2]));
            } else {
                // DD.MM.YYYY
                last = new Date(parseInt(lastParts[2]), parseInt(lastParts[1]) - 1, parseInt(lastParts[0]));
            }
        }
        
        const next = new Date(last);
        if (!isNaN(next.getTime())) {
            next.setMonth(next.getMonth() + 6);
        }

        // Normalize 'now' to start of day for accurate day counting
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
        let statusHtml = '';
        
        if (diffDays < 0) {
            statusHtml = `<span style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800;"><i class="fas fa-exclamation-circle"></i> MUDDATI O'TGAN</span>`;
            stats.expired++;
        } else if (diffDays < 15) {
            statusHtml = `<span style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800;"><i class="fas fa-clock"></i> YAQINLASHMOQDA</span>`;
            stats.warning++;
        } else {
            statusHtml = `<span style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800;"><i class="fas fa-check-circle"></i> OK</span>`;
            stats.done++;
        }

        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 15px 20px; color: #94a3b8;">${index + 1}</td>
                <td style="padding: 15px 20px; font-weight: 800;">${item.num}</td>
                <td style="padding: 15px 20px;">${item.type}</td>
                <td style="padding: 15px 20px; color: #cbd5e1;">${item.location}</td>
                <td style="padding: 15px 20px;">${(item.lastDate || '').includes('-') ? (item.lastDate || '').split('-').reverse().join('.') : item.lastDate}</td>
                <td style="padding: 15px 20px; font-weight: bold; color: ${diffDays < 0 ? '#ef4444' : '#f8fafc'}">${!isNaN(next.getTime()) ? next.toLocaleDateString('ru-RU') : '-'}</td>
                <td style="padding: 15px 20px;">${statusHtml}</td>
                <td style="padding: 15px 20px; display: flex; gap: 5px;">
                    <button onclick="rebuildIzostik('${item.id}', '${bolinmaId}')" style="background: ${diffDays < 0 ? 'var(--status-red, #ef4444)' : 'rgba(255,255,255,0.05)'}; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.75rem; font-weight: 600; white-space: nowrap;">
                        <i class="fas fa-tools"></i> ALMASHTIRILDI
                    </button>
                    <button onclick="openIzostikEditor('${item.id}', '${bolinmaId}')" style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); color: #38bdf8; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Tahrirlash">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteIzostik('${item.id}', '${bolinmaId}')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="O'chirish">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    
    // Update stats
    document.getElementById('izostik-stat-total').innerText = stats.total;
    document.getElementById('izostik-stat-expired').innerText = stats.expired;
    document.getElementById('izostik-stat-warning').innerText = stats.warning;
    document.getElementById('izostik-stat-done').innerText = stats.done;
}

window.rebuildIzostik = async function(itemId, bolinmaId) {
    if (!confirm("Ushbu izostik almashtirilganligini tasdiqlaysizmi?")) return;
    
    try {
        const data = await SmartUtils.fetchAPI(`/izostiklar/${bolinmaId}`);
        const item = data.find(i => String(i.id) === String(itemId));
        if (!item) {
            console.error("Izostik topilmadi. ID:", itemId);
            return;
        }

        const userName = (window.Auth && window.Auth.currentUser && (window.Auth.currentUser.name || window.Auth.currentUser.full_name)) || "Admin";
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        let history = item.history ? (typeof item.history === 'string' ? JSON.parse(item.history) : item.history) : [];
        history.push({
            date: dateStr,
            time: now.toLocaleTimeString(),
            user: userName,
            action: "ALMASHTIRILDI"
        });

        await SmartUtils.fetchAPI('/izostiklar', {
            method: 'POST',
            body: JSON.stringify({
                id: itemId,
                group_name: item.group_name,
                num: item.num,
                type: item.type,
                location: item.location,
                km: item.km,
                last_date: dateStr,
                performer: userName,
                bolinma_id: bolinmaId,
                history: history
            })
        });

        loadIzostikData(bolinmaId);
        if (window.SmartUtils) window.SmartUtils.showToast("Muvaffaqiyatli yangilandi!", "success");
    } catch (err) {
        console.error(err);
    }
};
window.filterIzostikTable = function() {
    const q = document.getElementById('izostik-search').value.toLowerCase();
    const rows = document.querySelectorAll('#izostik-table-body tr:not(.group-header)');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
};

window.openIzostikEditor = async function(itemId, bolinmaId) {
    const container = document.getElementById('izostik-editor-container');
    let item = { group_name: "Stations", num: "", type: "R-65", location: "", km: 0, last_date: new Date().toISOString().split('T')[0], history: [] };

    if (itemId) {
        const data = await SmartUtils.fetchAPI(`/izostiklar/${bolinmaId}`);
        const found = data.find(i => String(i.id) === String(itemId));
        if (found) item = found;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:15px; border:1px solid rgba(56, 189, 248, 0.3); padding:20px; border-radius:15px; background:rgba(0,0,0,0.5);">
            <div style="grid-column: span 3; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h4 style="margin:0; color:#38bdf8;">${itemId ? 'IZOSTIKNI TAHRIRLASH' : 'YANGI IZOSTIK QO\'SHISH'}</h4>
            </div>
            <div>
                <label style="display:block; font-size:0.7rem; color:#94a3b8; margin-bottom:5px;">Guruh (Stansiya/Peregon)</label>
                <input type="text" id="edit-group" value="${item.group || item.group_name || ''}" style="width:100%; box-sizing:border-box; padding:8px; border-radius:5px; background:#0f172a; border:1px solid #334155; color:#fff;">
            </div>
            <div>
                <label style="display:block; font-size:0.7rem; color:#94a3b8; margin-bottom:5px;">№ Izostik</label>
                <input type="text" id="edit-num" value="${item.num || ''}" style="width:100%; box-sizing:border-box; padding:8px; border-radius:5px; background:#0f172a; border:1px solid #334155; color:#fff;">
            </div>
            <div>
                <label style="display:block; font-size:0.7rem; color:#94a3b8; margin-bottom:5px;">KM</label>
                <input type="number" id="edit-km" value="${item.km || 0}" style="width:100%; box-sizing:border-box; padding:8px; border-radius:5px; background:#0f172a; border:1px solid #334155; color:#fff;">
            </div>
            <div>
                <label style="display:block; font-size:0.7rem; color:#94a3b8; margin-bottom:5px;">Turi</label>
                <input type="text" id="edit-type" value="${item.type || 'R-65'}" style="width:100%; box-sizing:border-box; padding:8px; border-radius:5px; background:#0f172a; border:1px solid #334155; color:#fff;">
            </div>
            <div>
                <label style="display:block; font-size:0.7rem; color:#94a3b8; margin-bottom:5px;">Joylashuvi</label>
                <input type="text" id="edit-location" value="${item.location || ''}" style="width:100%; box-sizing:border-box; padding:8px; border-radius:5px; background:#0f172a; border:1px solid #334155; color:#fff;">
            </div>
            <div>
                <label style="display:block; font-size:0.7rem; color:#94a3b8; margin-bottom:5px;">Oxirgi almashtirish</label>
                <input type="date" id="edit-lastDate" value="${item.last_date || item.lastDate || ''}" style="width:100%; box-sizing:border-box; padding:8px; border-radius:5px; background:#0f172a; border:1px solid #334155; color:#fff;">
            </div>
            <div style="display:flex; align-items:flex-end; gap:10px;">
                <button onclick="saveIzostik(${itemId}, '${bolinmaId}')" style="flex:2; background:#10b981; color:#000; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;">
                    <i class="fas fa-save"></i> SAQLASH
                </button>
                <button onclick="document.getElementById('izostik-editor-container').style.display='none'" style="flex:1; background:rgba(255,255,255,0.1); color:#fff; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;">
                    YOPISH
                </button>
            </div>
        </div>
    `;
};

window.saveIzostik = async function(itemId, bolinmaId) {
    const userName = (window.Auth && window.Auth.currentUser && (window.Auth.currentUser.name || window.Auth.currentUser.full_name)) || "Admin";
    const now = new Date();
    
    let history = [];
    if (itemId) {
        const data = await SmartUtils.fetchAPI(`/izostiklar/${bolinmaId}`);
        const oldItem = data.find(i => String(i.id) === String(itemId));
        history = oldItem ? (typeof oldItem.history === 'string' ? JSON.parse(oldItem.history) : oldItem.history) : [];
    }

    history.push({
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString(),
        user: userName,
        action: itemId ? "TAHRIRLANDI" : "YANGI QO'SHILDI"
    });

    const payload = {
        id: itemId,
        group_name: document.getElementById('edit-group').value,
        num: document.getElementById('edit-num').value,
        type: document.getElementById('edit-type').value,
        location: document.getElementById('edit-location').value,
        km: parseInt(document.getElementById('edit-km').value),
        last_date: document.getElementById('edit-lastDate').value,
        performer: userName,
        bolinma_id: bolinmaId,
        history: history
    };

    try {
        await SmartUtils.fetchAPI('/izostiklar', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        document.getElementById('izostik-editor-container').style.display = 'none';
        loadIzostikData(bolinmaId);
        if (window.SmartUtils) window.SmartUtils.showToast("Muvaffaqiyatli saqlandi!", "success");
    } catch (err) {
        console.error(err);
    }
};
window.showIzostikHistory = async function(itemId, bolinmaId) {
    const data = await SmartUtils.fetchAPI(`/izostiklar/${bolinmaId}`);
    const item = data.find(i => String(i.id) === String(itemId));
    if (!item) return;

    const modal = document.createElement('div');
    modal.className = 'integration-window active';
    modal.style.zIndex = '300000';
    modal.style.maxWidth = '400px';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    
    const history = typeof item.history === 'string' ? JSON.parse(item.history || "[]") : (item.history || []);
    let historyHtml = history.reverse().map(h => `
        <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.8rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span style="color:#38bdf8; font-weight:bold;">${h.action}</span>
                <span style="color:#94a3b8;">${h.date} ${h.time || ''}</span>
            </div>
            <div style="color:#cbd5e1; font-size:0.75rem;"><i class="fas fa-user-edit"></i> Mas'ul: ${h.user}</div>
        </div>
    `).join('') || '<div style="padding:20px; text-align:center; color:#94a3b8;">Tarix mavjud emas.</div>';

    modal.innerHTML = `
        <div class="window-header" style="background:#0f172a; border-bottom:1px solid rgba(255,255,255,0.1);">
            <h2 style="font-size:1rem; margin:0;"><i class="fas fa-history"></i> IZOSTIK №${item.num} TARIXI</h2>
            <button onclick="this.closest('.integration-window').remove()" style="background:none; border:none; color:#fff; cursor:pointer;"><i class="fas fa-times"></i></button>
        </div>
        <div class="window-content" style="padding:15px; background:#070b14; color:#fff; overflow-y:auto; max-height:400px;">
            ${historyHtml}
        </div>
    `;
    document.body.appendChild(modal);
};

window.deleteIzostik = async function(itemId, bolinmaId) {
    if (!confirm("Ushbu izostikni ro'yxatdan o'chirasizmi?")) return;
    try {
        await SmartUtils.fetchAPI(`/izostiklar/${itemId}`, { method: 'DELETE' });
        loadIzostikData(bolinmaId);
    } catch (err) {
        console.error(err);
    }
};
