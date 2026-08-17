/**
 * PKZ RELSLAR HISOBI — Piket Zahirasi Relslarini Boshqarish
 * Production Department module
 */

(function () {
    'use strict';

    // ==========================================
    // ASOSIY OYNANI OCHISH
    // ==========================================
    window.openPKZRailsWindow = function (bolinmaId) {
        const modalId = `pkz-rails-window-${bolinmaId}`;
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'integration-window active';
        modal.style.zIndex = '200000';

        // Convert bolinma_id to readable format
        const bolinmaNum = bolinmaId.replace('bolinma', '');
        const readableBolinma = `${bolinmaNum}-bo'linma`;

        modal.innerHTML = `
        <!-- HEADER -->
        <div class="window-header" style="padding: 20px 30px; border-bottom: 2px solid var(--accent-gold); display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);">
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="
                    width:48px; height:48px; border-radius:14px;
                    background: var(--gold-gradient);
                    display:flex; align-items:center; justify-content:center;
                    font-size:1.4rem; color:#000;
                    box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
                "><i class="fas fa-ruler-horizontal"></i></div>
                <div>
                    <h2 style="margin:0; font-size:1.5rem; font-weight:900; background: var(--gold-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        PKZ RELSLAR HISOBI
                    </h2>
                    <div style="font-size:0.8rem; color:#94a3b8; font-weight:600; letter-spacing:0.5px;">
                        Zaxira Relslar | ${readableBolinma} | <span id="pkz-live-stats" style="color:var(--accent-gold);">Yuklanmoqda...</span>
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:15px; align-items:center;">
                <button onclick="window.pkzExportExcel('${bolinmaId}')" class="control-btn green" style="padding:8px 18px; font-size:0.75rem;">
                    <i class="fas fa-file-excel"></i> Excel Eksport
                </button>
                <div class="close-window" onclick="this.closest('.integration-window').remove()" style="width:40px; height:40px; border-radius:50%; background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); display:flex; align-items:center; justify-content:center; cursor:pointer;">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        </div>

        <!-- CONTENT -->
        <div class="window-content" style="padding: 30px; gap: 30px;">
            
            <!-- TOP STATS & SEARCH -->
            <div style="display: grid; grid-template-columns: 1fr 350px; gap: 30px; align-items: stretch;">
                <!-- KPI GRID -->
                <div id="pkz-kpi-row" style="display:grid; grid-template-columns:repeat(4,1fr); gap:15px;">
                    <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:18px; border-left:4px solid #38bdf8; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                        <div style="font-size:0.7rem; color:#94a3b8; font-weight:800; text-transform:uppercase; margin-bottom:5px;">Jami Zahira</div>
                        <div id="pkz-stat-total" style="font-size:1.8rem; font-weight:900; color:#fff;">—</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:18px; border-left:4px solid #10b981; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                        <div style="font-size:0.7rem; color:#94a3b8; font-weight:800; text-transform:uppercase; margin-bottom:5px;">Yaroqli</div>
                        <div id="pkz-stat-yaroqli" style="font-size:1.8rem; font-weight:900; color:#fff;">—</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:18px; border-left:4px solid #f59e0b; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                        <div style="font-size:0.7rem; color:#94a3b8; font-weight:800; text-transform:uppercase; margin-bottom:5px;">Yangi</div>
                        <div id="pkz-stat-yangi" style="font-size:1.8rem; font-weight:900; color:#fff;">—</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:18px; border-left:4px solid #ef4444; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                        <div style="font-size:0.7rem; color:#94a3b8; font-weight:800; text-transform:uppercase; margin-bottom:5px;">Brak</div>
                        <div id="pkz-stat-brak" style="font-size:1.8rem; font-weight:900; color:#fff;">—</div>
                    </div>
                </div>

                <!-- SEARCH & FILTER -->
                <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:18px; display:flex; flex-direction:column; gap:10px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="position:relative;">
                        <i class="fas fa-search" style="position:absolute; left:15px; top:50%; transform:translateY(-50%); color:var(--accent-gold); opacity:0.6;"></i>
                        <input type="text" id="pkz-search" placeholder="KM bo'yicha qidirish..." oninput="window.pkzFilter()" 
                            style="width:100%; padding:12px 15px 12px 45px; background:rgba(0,0,0,0.3); border:1px solid rgba(212,175,55,0.2); border-radius:12px; color:#fff; font-weight:600; outline:none;">
                    </div>
                    <select id="pkz-filter-status" onchange="window.pkzFilter()"
                        style="width:100%; padding:12px 15px; background:rgba(0,0,0,0.3); border:1px solid rgba(212,175,55,0.2); border-radius:12px; color:#fff; font-weight:600; outline:none; cursor:pointer;">
                        <option value="">Barcha holatlar</option>
                        <option value="yangi">Yangi</option>
                        <option value="yaroqli">Yaroqli</option>
                        <option value="brak">Brak</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 400px; gap: 30px; flex: 1; min-height: 0;">
                <!-- TABLE SECTION -->
                <div style="background:rgba(15,23,42,0.5); border-radius:24px; border:1px solid rgba(255,255,255,0.05); overflow:hidden; display:flex; flex-direction:column; box-shadow:var(--glass-shadow);">
                    <div style="overflow-y:auto; flex:1;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:rgba(0,0,0,0.3); border-bottom:2px solid var(--accent-gold);">
                                    <th style="padding:15px; text-align:left; color:#94a3b8; font-size:0.75rem; text-transform:uppercase; width:50px;">#</th>
                                    <th style="padding:15px; text-align:left; color:#94a3b8; font-size:0.75rem; text-transform:uppercase;">KM / PK</th>
                                    <th style="padding:15px; text-align:left; color:#94a3b8; font-size:0.75rem; text-transform:uppercase;">Rels</th>
                                    <th style="padding:15px; text-align:left; color:#94a3b8; font-size:0.75rem; text-transform:uppercase;">Uzl. / Miqd.</th>
                                    <th style="padding:15px; text-align:left; color:#94a3b8; font-size:0.75rem; text-transform:uppercase;">Holati</th>
                                    <th style="padding:15px; text-align:right; color:#94a3b8; font-size:0.75rem; text-transform:uppercase; width:100px;">Amallar</th>
                                </tr>
                            </thead>
                            <tbody id="pkz-tbody">
                                <tr><td colspan="6" style="padding:50px; text-align:center; color:#94a3b8;"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- FORM SECTION -->
                <div style="background:rgba(15,23,42,0.5); border-radius:24px; border:1px solid rgba(212, 175, 55, 0.2); padding:25px; display:flex; flex-direction:column; gap:20px; box-shadow:0 0 40px rgba(212,175,55,0.05);">
                    <div style="display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(212,175,55,0.1); padding-bottom:15px; margin-bottom:10px;">
                        <i class="fas fa-edit" style="color:var(--accent-gold); font-size:1.2rem;"></i>
                        <h3 id="pkz-form-title" style="margin:0; font-size:1.1rem; color:#fff; font-weight:800;">Yangi Rels Qo'shish</h3>
                    </div>
                    <input type="hidden" id="pkz-edit-id">
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div>
                            <div class="pkz-label">Kilometr *</div>
                            <input type="number" id="pkz-km" class="pkz-input" placeholder="KM">
                        </div>
                        <div>
                            <div class="pkz-label">Piket</div>
                            <input type="number" id="pkz-pk" class="pkz-input" placeholder="PK" min="0" max="9">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div>
                            <div class="pkz-label">Yon (Tomon)</div>
                            <select id="pkz-side" class="pkz-input">
                                <option value="">Tanlang</option>
                                <option value="chap">Chap</option>
                                <option value="ong">O'ng</option>
                                <option value="ortada">O'rtada</option>
                            </select>
                        </div>
                        <div>
                            <div class="pkz-label">Rels Turi</div>
                            <select id="pkz-rail-type" class="pkz-input">
                                <option value="R-65">R-65</option>
                                <option value="R-50">R-50</option>
                                <option value="R-43">R-43</option>
                            </select>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div>
                            <div class="pkz-label">Uzunlik (m)</div>
                            <input type="number" id="pkz-length" class="pkz-input" placeholder="12.50" step="0.01">
                        </div>
                        <div>
                            <div class="pkz-label">Miqdori</div>
                            <input type="number" id="pkz-quantity" class="pkz-input" value="1">
                        </div>
                    </div>

                    <div>
                        <div class="pkz-label">Texnik Holati</div>
                        <select id="pkz-status" class="pkz-input">
                            <option value="yangi">Yangi (Foydalanilmagan)</option>
                            <option value="yaroqli" selected>Yaroqli (Eski rels)</option>
                            <option value="brak">Brak (Hisobdan chiqarish)</option>
                        </select>
                    </div>

                    <div>
                        <div class="pkz-label">Izoh (Eslatma)</div>
                        <textarea id="pkz-notes" class="pkz-input" style="height:80px; resize:none;" placeholder="Rels haqida qo'shimcha ma'lumot..."></textarea>
                    </div>

                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button onclick="window.pkzSubmit('${bolinmaId}')" class="btn-gold" style="flex:1; padding:15px; font-weight:900; background:var(--gold-gradient); color:#000; border:none; border-radius:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <i class="fas fa-save"></i> <span id="pkz-submit-label">QO'SHISH</span>
                        </button>
                        <button onclick="window.pkzCancelEdit()" style="padding:15px; background:rgba(255,255,255,0.05); color:#94a3b8; border:1px solid rgba(255,255,255,0.1); border-radius:12px; cursor:pointer;">
                            <i class="fas fa-eraser"></i>
                        </button>
                    </div>
                </div>
            </div>

        </div>

        <style>
            .pkz-label { font-size:0.7rem; color:#94a3b8; font-weight:800; text-transform:uppercase; margin-bottom:8px; letter-spacing:1px; }
            .pkz-input { width:100%; padding:12px 15px; background:rgba(0,0,0,0.3); border:1px solid rgba(212,175,55,0.2); border-radius:12px; color:#fff; font-weight:600; outline:none; transition:0.3s; font-family:inherit; }
            .pkz-input:focus { border-color:var(--accent-gold); box-shadow:0 0 15px rgba(212,175,55,0.2); }
            .pkz-input option { background:#0f172a; }
            .btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 25px rgba(212,175,55,0.3); }
        </style>
        `;

        document.body.appendChild(modal);
        pkzLoadData(bolinmaId);
    };

    // ==========================================
    // MA'LUMOTLARNI YUKLASH
    // ==========================================
    let pkzAllData = [];
    let pkzCurrentBolinma = null;

    async function pkzLoadData(bolinmaId) {
        pkzCurrentBolinma = bolinmaId;
        try {
            const [rows, summary] = await Promise.all([
                SmartUtils.fetchAPI(`/pkz-rails/${bolinmaId}`),
                SmartUtils.fetchAPI(`/pkz-rails/${bolinmaId}/summary`)
            ]);

            pkzAllData = rows || [];
            pkzRenderKPI(summary || {});
            pkzRenderTable(pkzAllData);
            
            const statsEl = document.getElementById('pkz-live-stats');
            if (statsEl) statsEl.textContent = `Jami: ${summary.total || 0} dona`;
        } catch (e) {
            console.error('[PKZ] Load error:', e);
            const tbody = document.getElementById('pkz-tbody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="padding:40px; text-align:center; color:#ef4444;"><i class="fas fa-exclamation-triangle"></i> Ma'lumotlarni yuklashda xatolik</td></tr>`;
        }
    }

    // ==========================================
    // KPI RENDER
    // ==========================================
    function pkzRenderKPI(summary) {
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val ?? 0;
        };
        set('pkz-stat-total', summary.total);
        set('pkz-stat-yaroqli', summary.yaroqli);
        set('pkz-stat-yangi', summary.yangi);
        set('pkz-stat-brak', summary.brak);
    }

    // ==========================================
    // TABLE RENDER
    // ==========================================
    function pkzRenderTable(data) {
        const tbody = document.getElementById('pkz-tbody');
        if (!tbody) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding:80px; text-align:center; color:#475569;">
                <i class="fas fa-inbox" style="font-size:3rem; display:block; margin-bottom:15px; opacity:0.3; color:var(--accent-gold);"></i>
                Hozircha yozuvlar yo'q. O'ng tarafdagi formadan rels ma'lumotlarini kiriting.
            </td></tr>`;
            return;
        }

        tbody.innerHTML = data.map((r, i) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.03); transition:0.2s;" onmouseover="this.style.background='rgba(212,175,55,0.03)'" onmouseout="this.style.background='transparent'">
                <td style="padding:15px; color:#475569; font-size:0.8rem; font-weight:700;">${i + 1}</td>
                <td style="padding:15px; color:#fff; font-weight:700;">
                    <i class="fas fa-map-marker-alt" style="color:var(--accent-gold); margin-right:8px; font-size:0.8rem;"></i>
                    ${r.km} km ${r.pk !== null ? `/ ${r.pk} pk` : ''} 
                    <div style="font-size:0.65rem; color:#64748b; margin-top:3px; text-transform:uppercase;">${r.side || 'Noma\'lum'} tomon</div>
                </td>
                <td style="padding:15px; color:#f59e0b; font-weight:800; letter-spacing:1px;">${r.rail_type || 'R-65'}</td>
                <td style="padding:15px; color:#fff;">
                    <div style="font-weight:700;">${r.length || 0} m</div>
                    <div style="font-size:0.7rem; color:#94a3b8;">${r.quantity || 1} dona</div>
                </td>
                <td style="padding:15px;">${pkzStatusBadge(r.status)}</td>
                <td style="padding:15px; text-align:right;">
                    <div style="display:flex; gap:8px; justify-content:flex-end;">
                        <button onclick='window.pkzStartEdit(${JSON.stringify(r).replace(/'/g, "&apos;")})' 
                            style="width:34px; height:34px; border-radius:10px; background:rgba(56,189,248,0.1); color:#38bdf8; border:1px solid rgba(56,189,248,0.2); cursor:pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.pkzDelete(${r.id}, '${pkzCurrentBolinma}')"
                            style="width:34px; height:34px; border-radius:10px; background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); cursor:pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function pkzStatusBadge(status) {
        const badges = {
            yangi:    `<span style="background:rgba(56,189,248,0.1); color:#38bdf8; border:1px solid rgba(56,189,248,0.2); padding:4px 10px; border-radius:8px; font-size:0.7rem; font-weight:800; text-transform:uppercase;"><i class="fas fa-star" style="margin-right:5px;"></i> Yangi</span>`,
            yaroqli:  `<span style="background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2); padding:4px 10px; border-radius:8px; font-size:0.7rem; font-weight:800; text-transform:uppercase;"><i class="fas fa-check" style="margin-right:5px;"></i> Yaroqli</span>`,
            brak:     `<span style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); padding:4px 10px; border-radius:8px; font-size:0.7rem; font-weight:800; text-transform:uppercase;"><i class="fas fa-times" style="margin-right:5px;"></i> Brak</span>`,
        };
        return badges[status] || `<span style="color:#64748b;">${status || '—'}</span>`;
    }

    // ==========================================
    // FILTER
    // ==========================================
    window.pkzFilter = function () {
        const q = (document.getElementById('pkz-search')?.value || '').toLowerCase();
        const s = document.getElementById('pkz-filter-status')?.value || '';
        const filtered = pkzAllData.filter(r => {
            const matchQ = !q || String(r.km).includes(q) || (r.rail_type || '').toLowerCase().includes(q) || (r.notes || '').toLowerCase().includes(q);
            const matchS = !s || r.status === s;
            return matchQ && matchS;
        });
        pkzRenderTable(filtered);
    };

    // ==========================================
    // SUBMIT (ADD / EDIT)
    // ==========================================
    window.pkzSubmit = async function (bolinmaId) {
        const editId = document.getElementById('pkz-edit-id')?.value;
        const km = document.getElementById('pkz-km')?.value;
        const pk = document.getElementById('pkz-pk')?.value;
        const side = document.getElementById('pkz-side')?.value;
        const rail_type = document.getElementById('pkz-rail-type')?.value;
        const length = document.getElementById('pkz-length')?.value;
        const quantity = document.getElementById('pkz-quantity')?.value;
        const status = document.getElementById('pkz-status')?.value;
        const notes = document.getElementById('pkz-notes')?.value;

        if (!km) {
            SmartUtils.showToast('KM maydonini to\'ldiring!', 'warning');
            return;
        }

        const body = { 
            bolinma_id: bolinmaId, km: parseInt(km), pk: pk ? parseInt(pk) : null,
            side: side || null, rail_type, length: length ? parseFloat(length) : null,
            quantity: quantity ? parseInt(quantity) : 1, status: status || 'yangi', notes: notes || null 
        };

        try {
            if (editId) {
                await SmartUtils.fetchAPI(`/pkz-rails/${editId}`, { method: 'PUT', body: JSON.stringify(body) });
                SmartUtils.showToast('Muvaffaqiyatli yangilandi!', 'success');
            } else {
                await SmartUtils.fetchAPI('/pkz-rails', { method: 'POST', body: JSON.stringify(body) });
                SmartUtils.showToast('Yangi rels bazaga qo\'shildi!', 'success');
            }
            window.pkzCancelEdit();
            pkzLoadData(bolinmaId);
        } catch (e) {
            SmartUtils.showToast('Xatolik: ' + e.message, 'error');
        }
    };

    // ==========================================
    // EDIT
    // ==========================================
    window.pkzStartEdit = function (row) {
        document.getElementById('pkz-edit-id').value = row.id;
        document.getElementById('pkz-km').value = row.km || '';
        document.getElementById('pkz-pk').value = row.pk ?? '';
        document.getElementById('pkz-side').value = row.side || '';
        document.getElementById('pkz-rail-type').value = row.rail_type || 'R-65';
        document.getElementById('pkz-length').value = row.length || '';
        document.getElementById('pkz-quantity').value = row.quantity || 1;
        document.getElementById('pkz-status').value = row.status || 'yangi';
        document.getElementById('pkz-notes').value = row.notes || '';

        const titleEl = document.getElementById('pkz-form-title');
        if (titleEl) titleEl.textContent = 'Rels Ma\'lumotini Tahrirlash';
        const labelEl = document.getElementById('pkz-submit-label');
        if (labelEl) labelEl.textContent = 'SAQLASH';
    };

    window.pkzCancelEdit = function () {
        ['pkz-edit-id','pkz-km','pkz-pk','pkz-length','pkz-quantity','pkz-notes'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const titleEl = document.getElementById('pkz-form-title');
        if (titleEl) titleEl.textContent = 'Yangi Rels Qo\'shish';
        const labelEl = document.getElementById('pkz-submit-label');
        if (labelEl) labelEl.textContent = 'QO\'SHISH';
    };

    // ==========================================
    // DELETE
    // ==========================================
    window.pkzDelete = async function (id, bolinmaId) {
        if (!confirm('Haqiqatdan ham ushbu yozuvni o\'chirmoqchimisiz?')) return;
        try {
            await SmartUtils.fetchAPI(`/pkz-rails/${id}`, { method: 'DELETE' });
            SmartUtils.showToast('Yozuv o\'chirildi', 'success');
            pkzLoadData(bolinmaId);
        } catch (e) {
            SmartUtils.showToast('Xatolik: ' + e.message, 'error');
        }
    };

    // ==========================================
    // EXCEL EXPORT
    // ==========================================
    window.pkzExportExcel = function (bolinmaId) {
        if (!pkzAllData || pkzAllData.length === 0) {
            SmartUtils.showToast('Eksport uchun ma\'lumot yo\'q!', 'warning');
            return;
        }
        try {
            if (typeof XLSX === 'undefined') {
                SmartUtils.showToast('XLSX kutubxonasi topilmadi!', 'error');
                return;
            }
            const headers = ['#', 'KM', 'PK', 'Yon', 'Rels turi', 'Uzunligi', 'Soni', 'Holati', 'Izoh', 'Sana'];
            const rows = pkzAllData.map((r, i) => [
                i + 1, r.km, r.pk ?? '', r.side || '', r.rail_type,
                r.length, r.quantity, r.status, r.notes || '', (r.created_at || '').split('T')[0]
            ]);
            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'PKZ Relslar');
            XLSX.writeFile(wb, `PKZ_Relslar_Hisobi_${bolinmaId}.xlsx`);
        } catch (e) {
            SmartUtils.showToast('Excel eksportda xatolik!', 'error');
        }
    };

})();
