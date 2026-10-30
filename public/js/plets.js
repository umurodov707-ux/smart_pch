
/**
 * SMART PCH - Pletlar Hisobi (Rail Strings Accounting)
 * Premium module for long-rail management and temperature monitoring.
 */

window.PletsModule = (function () {
    let activeBolinmaId = null;

    async function openWindow(bolinmaId) {
        if (window.openProductionDashboard) {
            window.openProductionDashboard(bolinmaId);
        } else {
            // Fallback if dashboard not ready
            activeBolinmaId = bolinmaId;
            const mainContent = document.getElementById('mainContent');
            if (mainContent) mainContent.innerHTML = `<div style="padding:100px; text-align:center; color:#fff;">Yuklanmoqda...</div>`;
        }
    }

    async function renderInContainer(container, bolinmaId) {
        console.log("PletsModule: rendering in container for", bolinmaId);
        activeBolinmaId = bolinmaId;
        container.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; padding:50px; color:#94a3b8;">
                <i class="fas fa-sync fa-spin" style="margin-right:10px;"></i> Yuklanmoqda...
            </div>
        `;
        try {
            const data = await SmartUtils.fetchAPI(`/plets/${bolinmaId}`);
            container.innerHTML = `
                <style>
                    ${getStyles()}
                </style>
                ${renderTableHTML(data || [])}
            `;
        } catch (e) {
            container.innerHTML = `<div style="color:#ef4444; padding:20px;">Xatolik: ${escapeHtml(e.message)}</div>`;
        }
    }

    function getStyles() {
        return `
            .plets-container {
                animation: fadeIn 0.5s ease;
                max-width: 1300px;
                margin: 0 auto;
                padding: 10px;
            }
            .plets-window {
                background: rgba(15, 23, 42, 0.4);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(212, 175, 55, 0.15);
                border-radius: 20px;
                overflow: hidden;
            }
            .plets-header {
                padding: 20px 30px;
                background: rgba(0,0,0,0.2);
                border-bottom: 1px solid rgba(255,255,255,0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .plets-title {
                font-size: 1.5rem;
                font-weight: 900;
                background: linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b4941f 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .plets-stats-bar {
                padding: 15px 30px;
                background: rgba(255,255,255,0.01);
                border-bottom: 1px solid rgba(255,255,255,0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .plet-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0 6px;
            }
            .plet-table th {
                padding: 12px 20px;
                text-align: left;
                color: #64748b;
                font-size: 0.7rem;
                text-transform: uppercase;
                font-weight: 800;
                letter-spacing: 1px;
            }
            .plet-row {
                background: rgba(255,255,255,0.02);
                transition: 0.2s;
                cursor: pointer;
            }
            .plet-row:hover {
                background: rgba(255,255,255,0.06);
                transform: translateX(4px);
            }
            .plet-row td {
                padding: 15px 20px;
                border-top: 1px solid rgba(255,255,255,0.03);
                border-bottom: 1px solid rgba(255,255,255,0.03);
            }
            .plet-row td:first-child { border-left: 1px solid rgba(255,255,255,0.03); border-radius: 10px 0 0 10px; }
            .plet-row td:last-child { border-right: 1px solid rgba(255,255,255,0.03); border-radius: 0 10px 10px 0; }
            
            .status-badge {
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 0.65rem;
                font-weight: 800;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .status-ready { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
            .status-warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
            .status-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
            
            .led { width: 7px; height: 7px; border-radius: 50%; }
            .led-green { background: #10b981; box-shadow: 0 0 8px #10b981; }
            .led-amber { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
            .led-red { background: #ef4444; box-shadow: 0 0 8px #ef4444; }

            .action-btn {
                padding: 8px 16px;
                border-radius: 10px;
                font-weight: 800;
                cursor: pointer;
                transition: 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
                border: none;
                font-size: 0.8rem;
            }
            .btn-add { background: var(--gold-gradient); color: #000; }
            .btn-add:hover { transform: translateY(-2px); filter: brightness(1.1); }
            
            .temp-display { font-family: 'Inter'; font-weight: 900; }
        `;
    }

    function renderMainUI(data) {
        const mainContent = document.getElementById('mainContent');
        const bolinmaName = window.getBolinmaName ? window.getBolinmaName(activeBolinmaId) : activeBolinmaId;

        mainContent.innerHTML = `
            <style>
                ${getStyles()}
                .plets-window { background: rgba(15, 23, 42, 0.85); box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6); border-radius: 24px; }
            </style>

            <div class="plets-container">
                <div class="plets-window">
                    <div class="plets-header">
                        <div style="display:flex; align-items:center; gap:20px;">
                            <div style="width:50px; height:50px; background:rgba(56,189,248,0.1); border-radius:15px; display:flex; align-items:center; justify-content:center; color:#38bdf8; font-size:1.5rem;">
                                <i class="fas fa-ruler-combined"></i>
                            </div>
                            <div>
                                <div class="plets-title">PLETLAR HISOBI</div>
                                <div style="font-size:0.8rem; color:#94a3b8; font-weight:600; margin-top:2px;">${bolinmaName} Profili • Real vaqt rejimi</div>
                            </div>
                        </div>
                        <button onclick="window.SmartRouting.navigate('/dashboard')" class="action-btn" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1);">
                            <i class="fas fa-arrow-left"></i> ORQAGA
                        </button>
                    </div>

                    ${renderTableHTML(data)}
                </div>
            </div>
        `;
    }

    function renderTableHTML(data) {
        return `
            <div class="plets-stats-bar">
                <div style="display:flex; gap:30px;">
                    <div>
                        <div style="font-size:0.65rem; color:#94a3b8; font-weight:800; text-transform:uppercase; margin-bottom:4px;">Jami Pletlar:</div>
                        <div style="font-size:1.2rem; font-weight:900; color:#fff;">${data.length} <small style="font-size:0.75rem; color:#ffd700;">ta</small></div>
                    </div>
                    <div style="border-left: 1px solid rgba(255,255,255,0.1); padding-left:30px;">
                        <div style="font-size:0.65rem; color:#94a3b8; font-weight:800; text-transform:uppercase; margin-bottom:4px;">Umumiy Uzunlik:</div>
                        <div style="font-size:1.2rem; font-weight:900; color:#fff;">${(data.reduce((sum, p) => sum + (p.length || 0), 0) / 1000).toFixed(2)} <small style="font-size:0.75rem; color:#38bdf8;">km</small></div>
                    </div>
                </div>
                <div style="display:flex; gap:12px;">
                    <button class="action-btn" style="background:rgba(255,255,255,0.05); color:#94a3b8; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fas fa-file-excel"></i> EKSPORT
                    </button>
                    <button onclick="window.PletsModule.showAddModal()" class="action-btn btn-add">
                        <i class="fas fa-plus-circle"></i> YANGI QO'SHISH
                    </button>
                </div>
            </div>

            <div style="padding:15px; overflow-x:auto;">
                <table class="plet-table">
                    <thead>
                        <tr>
                            <th>№ Plet</th>
                            <th>KM + PK</th>
                            <th>Uzunligi</th>
                            <th>Neutral Harorat</th>
                            <th>Sana</th>
                            <th>Holati</th>
                            <th style="text-align:right;">Batafsil</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.length === 0 ? `
                            <tr>
                                <td colspan="7" style="text-align:center; padding:60px; color:#475569;">
                                    <i class="fas fa-folder-open" style="font-size:2rem; margin-bottom:15px; display:block; opacity:0.3;"></i>
                                    Pletlar ma'lumotlari mavjud emas.
                                </td>
                            </tr>
                        ` : data.map(p => {
            const statusClass = p.status === "ME'YORDA" ? 'status-ready' : (p.status.includes('XAVF') ? 'status-danger' : 'status-warning');
            const ledClass = p.status === "ME'YORDA" ? 'led-green' : (p.status.includes('XAVF') ? 'led-red' : 'led-amber');

            return `
                                <tr class="plet-row" onclick="window.PletsModule.viewDetails(${p.id})">
                                    <td style="font-weight:900; color:#fff;">${p.plet_number}</td>
                                    <td>
                                        <div style="color:#fff; font-weight:700; font-size:0.85rem;">${p.start_km} km ${p.start_pk} pk</div>
                                        <div style="font-size:0.7rem; color:#475569;">→ ${p.end_km} km ${p.end_pk} pk</div>
                                    </td>
                                    <td style="color:#38bdf8; font-weight:800; font-size:0.85rem;">${p.length} m</td>
                                    <td class="temp-display" style="color:${parseFloat(p.neutral_temp) > 40 ? '#ef4444' : '#fff'}; font-size:0.85rem;">${p.neutral_temp}°C</td>
                                    <td style="color:#64748b; font-size:0.8rem;">${p.install_date ? p.install_date : '-'}</td>
                                    <td>
                                        <span class="status-badge ${statusClass}">
                                            <div class="led ${ledClass}"></div>
                                            ${p.status}
                                        </span>
                                    </td>
                                    <td style="text-align:right; color:#475569;"><i class="fas fa-chevron-right"></i></td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function showAddModal() {
        const modal = document.createElement('div');
        modal.id = 'plets-modal-overlay';
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(15px); z-index:9999999; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.3s ease;";

        modal.innerHTML = `
            <div style="width:500px; background:#0f172a; border:1px solid rgba(212,175,55,0.3); border-radius:24px; overflow:hidden; box-shadow:0 30px 70px rgba(0,0,0,0.8);">
                <div style="padding:20px 30px; background:rgba(255,255,255,0.02); border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-weight:800; color:#fff; font-size:1.2rem;">YANGI PLET</h3>
                    <button onclick="document.getElementById('plets-modal-overlay').remove()" style="background:none; border:none; color:#ef4444; font-size:1.2rem; cursor:pointer;"><i class="fas fa-times"></i></button>
                </div>
                <div style="padding:30px; display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                    <div style="grid-column: span 2;">
                        <label style="display:block; font-size:0.7rem; color:#94a3b8; font-weight:800; margin-bottom:6px; text-transform:uppercase;">Plet Raqami:</label>
                        <input id="new-plet-number" type="text" placeholder="PL-101" style="width:100%; padding:12px; border-radius:10px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; font-weight:700; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; font-size:0.7rem; color:#94a3b8; font-weight:800; margin-bottom:6px;">KM Start:</label>
                        <input id="new-plet-skm" type="number" style="width:100%; padding:12px; border-radius:10px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; font-size:0.7rem; color:#94a3b8; font-weight:800; margin-bottom:6px;">PK Start:</label>
                        <input id="new-plet-spk" type="number" style="width:100%; padding:12px; border-radius:10px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; font-size:0.7rem; color:#94a3b8; font-weight:800; margin-bottom:6px;">KM End:</label>
                        <input id="new-plet-ekm" type="number" style="width:100%; padding:12px; border-radius:10px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; font-size:0.7rem; color:#94a3b8; font-weight:800; margin-bottom:6px;">PK End:</label>
                        <input id="new-plet-epk" type="number" style="width:100%; padding:12px; border-radius:10px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; font-size:0.7rem; color:#94a3b8; font-weight:800; margin-bottom:6px;">Uzunligi (m):</label>
                        <input id="new-plet-len" type="number" style="width:100%; padding:12px; border-radius:10px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; font-size:0.7rem; color:#94a3b8; font-weight:800; margin-bottom:6px;">Neutral T°:</label>
                        <input id="new-plet-temp" type="number" style="width:100%; padding:12px; border-radius:10px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; outline:none;">
                    </div>
                    <div style="grid-column: span 2; margin-top:15px;">
                        <button onclick="window.PletsModule.saveNewPlet()" style="width:100%; padding:15px; border-radius:12px; background:var(--gold-gradient); border:none; color:#000; font-weight:900; cursor:pointer;">
                            SAQLASH
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async function saveNewPlet() {
        const payload = {
            bolinma_id: activeBolinmaId,
            plet_number: document.getElementById('new-plet-number').value,
            start_km: parseInt(document.getElementById('new-plet-skm').value),
            start_pk: parseInt(document.getElementById('new-plet-spk').value),
            end_km: parseInt(document.getElementById('new-plet-ekm').value),
            end_pk: parseInt(document.getElementById('new-plet-epk').value),
            length: parseFloat(document.getElementById('new-plet-len').value),
            neutral_temp: document.getElementById('new-plet-temp').value,
            install_date: new Date().toISOString().split('T')[0],
            status: "ME'YORDA"
        };
        try {
            await SmartUtils.fetchAPI('/plets', { method: 'POST', body: JSON.stringify(payload) });
            SmartUtils.showToast("Muvaffaqiyatli saqlandi!", "success");

            if (document.getElementById('plets-modal-overlay')) {
                document.getElementById('plets-modal-overlay').remove();
            }

            // Refresh only the relevant view
            const prodContainer = document.getElementById('prod-tab-content');
            if (prodContainer) {
                // We are inside the Production Dashboard tab
                renderInContainer(prodContainer, activeBolinmaId);
            } else {
                // We are in the standalone window
                openWindow(activeBolinmaId);
            }
        } catch (e) { SmartUtils.showToast("Xatolik!", "error"); }
    }

    async function viewDetails(pletId) {
        try {
            const p = await SmartUtils.fetchAPI(`/plets/details/${pletId}`);
            if (!p) return;

            const modal = document.createElement('div');
            modal.id = 'plet-details-overlay';
            modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); backdrop-filter:blur(25px); z-index:9999999; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.4s ease;";

            const historyHtml = p.diagnostics.temp_history.map(h => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.03);">
                    <span style="color:#64748b; font-size:0.75rem;">${h.date}</span>
                    <span style="color:#fff; font-weight:800; font-size:0.85rem;">${h.temp}°C</span>
                    <span style="font-size:0.65rem; background:rgba(16,185,129,0.1); color:#10b981; padding:2px 6px; border-radius:4px;">${h.status || 'OK'}</span>
                </div>
            `).join('');

            modal.innerHTML = `
            <div style="width:850px; background:#0f172a; border:1px solid rgba(16,185,129,0.3); border-radius:32px; overflow:hidden; box-shadow:0 50px 100px rgba(0,0,0,0.9);">
                <div style="padding:30px 40px; background:linear-gradient(to right, rgba(16,185,129,0.15), transparent); display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; align-items:center; gap:20px;">
                        <div style="width:64px; height:64px; background:rgba(16,185,129,0.1); border-radius:20px; display:flex; align-items:center; justify-content:center; color:#10b981; font-size:1.8rem; box-shadow:0 0 20px rgba(16,185,129,0.2);">
                            <i class="fas fa-microscope"></i>
                        </div>
                        <div>
                            <h2 style="margin:0; font-weight:900; color:#fff; font-size:1.6rem; letter-spacing:1px; text-shadow:0 0 10px rgba(16,185,129,0.3);">PLET DIAGNOSTIKASI (REAL)</h2>
                            <div style="font-size:0.8rem; color:#94a3b8; font-weight:600; margin-top:2px;">№ ${p.plet_number} • Joylashuvi: ${p.start_km} km ${p.start_pk} pk</div>
                        </div>
                    </div>
                    <button onclick="document.getElementById('plet-details-overlay').remove()" style="width:45px; height:45px; border-radius:50%; background:rgba(255,255,255,0.05); border:none; color:#94a3b8; cursor:pointer;"><i class="fas fa-times"></i></button>
                </div>
                
                <div style="padding:40px; display:grid; grid-template-columns:1fr 1fr; gap:30px;">
                    <!-- Real History List -->
                    <div style="padding:25px; background:rgba(255,255,255,0.02); border-radius:24px; border:1px solid rgba(255,255,255,0.05);">
                        <h4 style="color:#10b981; margin-top:0; font-weight:800; font-size:0.9rem; text-transform:uppercase; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                            <i class="fas fa-history" style="font-size:1.1rem;"></i> OXIRGI HARORATLAR (BAZADAN)
                        </h4>
                        <div style="max-height:200px; overflow-y:auto; padding-right:10px;">
                            ${historyHtml}
                        </div>
                        <div style="margin-top:20px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05);">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="color:#94a3b8; font-weight:700;">Joriy (Oxirgi):</span>
                                <span style="color:#ffd700; font-weight:900; font-size:1.3rem;">${p.neutral_temp}°C</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="padding:25px; background:rgba(255,255,255,0.02); border-radius:24px; border:1px solid rgba(255,255,255,0.05);">
                        <h4 style="color:#38bdf8; margin-top:0; font-weight:800; font-size:0.9rem; text-transform:uppercase; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                            <i class="fas fa-shield-alt" style="font-size:1.1rem;"></i> BAZA ANALITIKASI
                        </h4>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b;">
                                <span>O'rnatilgan sana:</span>
                                <span style="color:#fff;">${p.install_date}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b;">
                                <span>Kritik harorat:</span>
                                <span style="color:#ef4444;">+55°C / -25°C</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b;">
                                <span>Stress darajasi:</span>
                                <span style="color:#10b981; font-weight:900;">${p.diagnostics.stress_level.toUpperCase()}</span>
                            </div>
                            <div style="margin-top:10px; display:flex; align-items:center; gap:10px; color:#10b981; font-weight:800; font-size:0.85rem; background:rgba(16,185,129,0.05); padding:10px; border-radius:10px; border:1px solid rgba(16,185,129,0.1);">
                                <i class="fas fa-database"></i> MA'LUMOTLAR HAQIQIY
                            </div>
                        </div>
                    </div>
                    
                    <div style="grid-column: span 2; display:flex; gap:15px; margin-top:10px;">
                        <button onclick="window.PletsModule.showAddModal('${p.bolinma_id}')" class="action-btn" style="flex:1; background:rgba(212, 175, 55, 0.1); color:#d4af37; border:1px solid rgba(212, 175, 55, 0.2); justify-content:center; padding:15px; border-radius:15px;">
                            <i class="fas fa-edit"></i> TAHRIRLASH
                        </button>
                        <button onclick="document.getElementById('plet-details-overlay').remove()" class="action-btn" style="flex:1; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); justify-content:center; padding:15px; border-radius:15px;">
                            <i class="fas fa-check"></i> YOPISH
                        </button>
                    </div>
                </div>
            </div>
            `;
            document.body.appendChild(modal);
        } catch (e) {
            console.error(e);
            SmartUtils.showToast("Ma'lumot yuklashda xato!", "error");
        }
    }

    return {
        open: openWindow,
        renderInContainer: renderInContainer,
        showAddModal: showAddModal,
        saveNewPlet: saveNewPlet,
        viewDetails: viewDetails
    };
})();
