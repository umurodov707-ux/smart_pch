// Metrology Department (Standardization & Electricity) - v11.0 (Premium UX Layout & Centered Dashboard)
// Features: Separate Modal Windows, Floating Card Table, Traffic Light LED Indicators, CRUD Modals, Charts

(function () {
    // --- State Management ---
    window.metrologyElectricity = window.metrologyElectricity || {};
    window.metrologyDevices = window.metrologyDevices || [];
    window.metrologyLimits = window.metrologyLimits || JSON.parse(localStorage.getItem('metrologyLimits') || '{}');

    // Filter helpers
    window.metroSearchQuery = window.metroSearchQuery || '';
    window.metroStatusFilter = window.metroStatusFilter || 'all';
    window.metroBolinmaFilter = window.metroBolinmaFilter || 'all';

    // --- Core Functions ---
    window.initMetrologyData = async function () {
        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userBolinmaId = currentUser.bolinmalar?.[0] || 'admin';
        const viewingBolinmaId = window.viewingSubdivisionId || userBolinmaId;

        try {
            // Load all electricity summary records (needed for history charts)
            const summary = await SmartUtils.fetchAPI(`/metrology/electricity/summary`);
            window.metrologyElectricity['summary'] = summary || [];

            // Load single subunit data
            const elec = await SmartUtils.fetchAPI(`/metrology/electricity/${viewingBolinmaId}`);
            window.metrologyElectricity[viewingBolinmaId] = elec || { lastReading: 0, currentMonth: 0 };

            // Load devices list
            const devices = await SmartUtils.fetchAPI(`/metrology/devices?bolinma_id=${viewingBolinmaId === 'admin' ? '' : viewingBolinmaId}`);
            window.metrologyDevices = devices || [];
        } catch (e) {
            console.error("Metrology Init Error:", e);
            window.metrologyDevices = JSON.parse(localStorage.getItem('metrologyDevices') || '[]');
        }
    };

    // --- Helper: Refresh Views After Action ---
    window.refreshMetrologyViews = async function() {
        await window.initMetrologyData();
        if (document.getElementById('metro-devices-table-content')) {
            window.filterDevicesList();
        }
    };

    // --- Helper: Get Device Font Awesome Icon ---
    function getDeviceIcon(name) {
        const n = (name || '').toLowerCase();
        if (n.includes('shablon')) return 'fa-ruler';
        if (n.includes('shtangensirkul')) return 'fa-drafting-compass';
        if (n.includes('termometr')) return 'fa-thermometer-half';
        if (n.includes('spidometr')) return 'fa-tachometer-alt';
        if (n.includes('motosoat')) return 'fa-hourglass-half';
        if (n.includes('nuqson') || n.includes('aravacha')) return 'fa-train';
        if (n.includes('manometr')) return 'fa-compress-arrows-alt';
        if (n.includes('hisoblagich') || n.includes('elektr')) return 'fa-bolt';
        return 'fa-tools';
    }

    // --- Helper: Calibration status (Traffic Light Logic & Dynamic Intervals) ---
    function getDaysInfo(d) {
        const dateStr = d.stampDate || d.lastCalibration;
        if (!dateStr) return { daysPassed: 0, remaining: -999, statusClass: 'expired', statusLabel: "Ma'lumot yo'q", dateStr: '---' };
        
        const name = (d.name || '').toLowerCase().trim();
        const daysPassed = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
        
        // 1. Qiyoslash (Calibration/Verification) Interval
        let qiyoslashInterval = 365; // default 1 year
        let isElektr = false;
        if (name.includes('elektr hisoblagich') || name.includes('hisoblagich')) {
            qiyoslashInterval = 4 * 365; // 4 years
            isElektr = true;
        }
        
        const qiyoslashRemaining = qiyoslashInterval - daysPassed;
        let qiyoslashStatusClass, qiyoslashStatusLabel;
        
        if (isElektr) {
            // Elektr hisoblagichlar: Red <= 180, Yellow <= 500
            if (qiyoslashRemaining <= 180) { 
                qiyoslashStatusClass = 'expired';
                qiyoslashStatusLabel = qiyoslashRemaining < 0 ? `${Math.abs(qiyoslashRemaining)} kun o'tib ketdi` : `${qiyoslashRemaining} kun qoldi`; 
            }
            else if (qiyoslashRemaining <= 500) { 
                qiyoslashStatusClass = 'warning';
                qiyoslashStatusLabel = `${qiyoslashRemaining} kun qoldi`; 
            }
            else { 
                qiyoslashStatusClass = 'active';
                qiyoslashStatusLabel = `${qiyoslashRemaining} kun qoldi`; 
            }
        } else {
            // Oddiy asboblar: Red <= 30, Yellow <= 80
            if (qiyoslashRemaining <= 30) { 
                qiyoslashStatusClass = 'expired';
                qiyoslashStatusLabel = qiyoslashRemaining < 0 ? `${Math.abs(qiyoslashRemaining)} kun o'tib ketdi` : `${qiyoslashRemaining} kun qoldi`; 
            }
            else if (qiyoslashRemaining <= 80) { 
                qiyoslashStatusClass = 'warning';
                qiyoslashStatusLabel = `${qiyoslashRemaining} kun qoldi`; 
            }
            else { 
                qiyoslashStatusClass = 'active';
                qiyoslashStatusLabel = `${qiyoslashRemaining} kun qoldi`; 
            }
        }

        // 2. Shablon (Template) Dual Tracking: Qiyoslash (1 year) + Birka (3 months)
        if (name.includes('shablon')) {
            const birkaDateStr = d.birkaDate || dateStr;
            const birkaDaysPassed = Math.floor((new Date() - new Date(birkaDateStr)) / (1000 * 60 * 60 * 24));
            const birkaInterval = 90; // 3 months
            const birkaRemaining = birkaInterval - birkaDaysPassed;
            let birkaStatusClass, birkaStatusLabel;
            
            // Shablon Birka: Red <= 20, Yellow <= 50
            if (birkaRemaining <= 20) {
                birkaStatusClass = 'expired';
                birkaStatusLabel = birkaRemaining < 0 ? `${Math.abs(birkaRemaining)} kun o'tib ketdi` : `${birkaRemaining} kun qoldi`;
            } else if (birkaRemaining <= 50) {
                birkaStatusClass = 'warning';
                birkaStatusLabel = `${birkaRemaining} kun qoldi`;
            } else {
                birkaStatusClass = 'active';
                birkaStatusLabel = `${birkaRemaining} kun qoldi`;
            }

            // Worse of two is the overall status
            const overallClass = (qiyoslashStatusClass === 'expired' || birkaStatusClass === 'expired') ? 'expired' :
                                 (qiyoslashStatusClass === 'warning' || birkaStatusClass === 'warning') ? 'warning' : 'active';

            return {
                isShablon: true,
                daysPassed,
                dateStr,
                qiyoslash: {
                    remaining: qiyoslashRemaining,
                    statusClass: qiyoslashStatusClass,
                    statusLabel: qiyoslashStatusLabel
                },
                birka: {
                    remaining: birkaRemaining,
                    statusClass: birkaStatusClass,
                    statusLabel: birkaStatusLabel
                },
                statusClass: overallClass,
                statusLabel: qiyoslashStatusLabel
            };
        }

        return {
            isShablon: false,
            daysPassed,
            dateStr,
            qiyoslash: {
                remaining: qiyoslashRemaining,
                statusClass: qiyoslashStatusClass,
                statusLabel: qiyoslashStatusLabel
            },
            statusClass: qiyoslashStatusClass,
            statusLabel: qiyoslashStatusLabel
        };
    }

    window.getMetrologyDashboardHTML = function () {
        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userBolinmaId = currentUser.bolinmalar?.[0] || 'admin';
        const viewingBolinmaId = window.viewingSubdivisionId || userBolinmaId;
        const isAdmin = (currentUser.role === 'admin' || userBolinmaId === 'admin') && viewingBolinmaId === 'admin';

        const devices = window.metrologyDevices || [];
        const expiredCount = devices.filter(d => getDaysInfo(d).statusClass === 'expired').length;
        const warningCount = devices.filter(d => getDaysInfo(d).statusClass === 'warning').length;
        const goodCount = devices.length - expiredCount - warningCount;
        const healthPct = devices.length > 0 ? Math.round((goodCount / devices.length) * 100) : 100;
        const barColor = healthPct >= 80 ? '#10b981, #38bdf8' : healthPct >= 60 ? '#f59e0b, #ef4444' : '#ef4444, #991b1b';

        return `
            ${getMetrologyStyles()}
            <div class="metrology-container ${isAdmin ? 'admin-view' : 'subdivision-view'}">
                <div class="metro-main">
                    
                    <!-- Premium Header -->
                    <div class="metro-header-panel">
                        <div>
                            <div class="header-badge">${isAdmin ? 'CENTRAL HUB - ADMIN' : `${window.getBolinmaName(viewingBolinmaId)} - METROLOGY`}</div>
                            <h1 class="metro-main-title">${isAdmin ? 'Metrologiya Markazi' : 'Metrologiya va Elektr'}</h1>
                            <p class="metro-sub-title">${isAdmin ? 'Barcha bo\'linmalar bo\'yicha integrallashgan monitoring va kalibrovka nazorati' : 'STANDARDIZATION & UTILITIES SYSTEM v3.0'}</p>
                        </div>
                        <div class="metro-time-panel">
                            <span class="metro-time-label">TIZIM VAQTI</span>
                            <span class="metro-time-val">${new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <!-- Navigation Hub -->
                    <div class="metro-hub-grid">
                        <div class="metro-hub-card" style="--card-accent: #ffd700; --card-glow: rgba(212, 175, 55, 0.25); --card-gradient: linear-gradient(135deg, #d97706, #f59e0b);" onclick="window.openMetroDevicesModal()">
                            <div class="metro-hub-icon" style="color: #ffd700;"><i class="fas fa-ruler-combined"></i></div>
                            <h3 class="metro-hub-title">Asboblar Pasporti</h3>
                            <p class="metro-hub-desc">O'lchash vositalari va kalibrovka jurnali</p>
                        </div>
                        
                        <div class="metro-hub-card" style="--card-accent: #38bdf8; --card-glow: rgba(56, 189, 248, 0.25); --card-gradient: linear-gradient(135deg, #0ea5e9, #38bdf8);" onclick="window.openMetroElectricityModal()">
                            <div class="metro-hub-icon" style="color: #38bdf8;"><i class="fas fa-bolt"></i></div>
                            <h3 class="metro-hub-title">Elektr Monitori</h3>
                            <p class="metro-hub-desc">${isAdmin ? 'Barcha bo\'linmalar elektr hisobotlari' : 'Oylik sarf-xarajatlar va ko\'rsatkichlar'}</p>
                        </div>

                        <div class="metro-hub-card" style="--card-accent: #10b981; --card-glow: rgba(16, 185, 129, 0.25); --card-gradient: linear-gradient(135deg, #059669, #10b981);" onclick="window.openMetroChartsModal()">
                            <div class="metro-hub-icon" style="color: #10b981;"><i class="fas fa-chart-bar"></i></div>
                            <h3 class="metro-hub-title">Iste'mol Tahlili</h3>
                            <p class="metro-hub-desc">${isAdmin ? 'Elektr sarfi taqqoslama diagrammalari' : 'Sarflangan energiya va limit grafiklari'}</p>
                        </div>

                        ${isAdmin ? `
                        <div class="metro-hub-card" style="--card-accent: #e11d48; --card-glow: rgba(225, 29, 72, 0.25); --card-gradient: linear-gradient(135deg, #be123c, #e11d48);" onclick="window.openMetroLimitsModal()">
                            <div class="metro-hub-icon" style="color: #e11d48;"><i class="fas fa-sliders-h"></i></div>
                            <h3 class="metro-hub-title">Limit Sozlamalari</h3>
                            <p class="metro-hub-desc">Bo'linmalar oylik elektr limitlari</p>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Statistics Banner -->
                    <div class="metro-stats-row anim-fade-up">
                        <div class="metro-glass-card stat-card blue">
                            <div class="stat-label">${isAdmin ? 'UMUMIY ASBOBLAR' : 'JAMI ASBOBLAR'}</div>
                            <div class="stat-value">${devices.length}</div>
                            <div class="stat-icon"><i class="fas fa-microscope"></i></div>
                        </div>
                        <div class="metro-glass-card stat-card green">
                            <div class="stat-label">SOZ HOLATDA</div>
                            <div class="stat-value">${goodCount}</div>
                            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        </div>
                        <div class="metro-glass-card stat-card yellow">
                            <div class="stat-label">MUDDAT YAQIN</div>
                            <div class="stat-value">${warningCount}</div>
                            <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        </div>
                        <div class="metro-glass-card stat-card red">
                            <div class="stat-label">MUDDATI O'TGAN / CRITICAL</div>
                            <div class="stat-value" style="color:${expiredCount > 0 ? '#ef4444' : 'inherit'}">${expiredCount}</div>
                            <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                        </div>
                    </div>

                    <!-- Compliance Progress Bar -->
                    <div class="metro-glass-card anim-fade-up" style="margin-bottom:25px; padding:18px 25px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <span style="font-size:0.7rem; color:#94a3b8; font-weight:800; letter-spacing:1px;">COMPLIANCE HEALTH</span>
                            <span style="font-weight:900; font-size:1.05rem; color:${healthPct >= 80 ? '#10b981' : '#f59e0b'};">${healthPct}%</span>
                        </div>
                        <div style="height:10px; background:rgba(255,255,255,0.05); border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.04);">
                            <div style="width:${healthPct}%; height:100%; background:linear-gradient(90deg,${barColor}); box-shadow:0 0 15px rgba(56,189,248,0.4);"></div>
                        </div>
                    </div>

                </div>
            </div>
        `;
    };

    // --- MODAL WINDOW 1: DEVICES PASSPORT ---
    window.openMetroDevicesModal = function () {
        let modal = document.getElementById('metro-devices-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'metro-devices-modal';
            modal.className = 'department-window';
            document.body.appendChild(modal);
        }
        modal.style.zIndex = '20005';

        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userBolinmaId = currentUser.bolinmalar?.[0] || 'admin';
        const viewingBolinmaId = window.viewingSubdivisionId || userBolinmaId;
        const isAdmin = (currentUser.role === 'admin' || userBolinmaId === 'admin') && viewingBolinmaId === 'admin';

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #090d16 0%, #111827 100%); border-bottom: 2px solid #ffd700; padding: 15px 30px; position: relative;">
                <div class="metro-table-wrapper" style="display:flex; justify-content:center; align-items:center; margin:0 auto; padding:0; height:auto; overflow:visible;">
                    <h2 class="department-name" style="color: #f8fafc; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px; margin:0;">
                        <i class="fas fa-ruler-combined" style="color: #ffd700; filter: drop-shadow(0 0 5px rgba(255,215,0,0.5));"></i> 
                        ASBOBLAR PASPORTI ${isAdmin ? '(Markaziy)' : `(${window.getBolinmaName(viewingBolinmaId)})`}
                    </h2>
                </div>
                <div style="position: absolute; right: 30px; top: 50%; transform: translateY(-50%); display: flex; gap: 10px; align-items: center;">
                    <button onclick="window.openAddDeviceModal()" class="ts-btn ts-btn-success" style="background: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-plus"></i> Yangi Qo'shish
                    </button>
                    <button class="close-btn" onclick="document.getElementById('metro-devices-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="background: radial-gradient(circle at top left, #0b0f19, #030712); padding: 30px; height: calc(100% - 70px); box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden;">
                <div class="metro-table-wrapper">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 15px; flex-wrap: wrap;">
                        <div style="position: relative; flex-grow: 1; max-width: 320px;">
                            <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.35);"></i>
                            <input type="text" id="metro-dev-search" placeholder="Asbob nomi yoki S/N..." value="${window.metroSearchQuery || ''}" onkeyup="window.filterDevicesList()" style="width: 100%; padding: 12px 15px 12px 45px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; border-radius: 14px; outline: none; border: 1px solid rgba(255,255,255,0.12)">
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <select id="metro-status-filter" onchange="window.filterDevicesList()" style="padding: 12px 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; border-radius: 14px; outline: none; cursor: pointer;">
                                <option value="all" ${window.metroStatusFilter === 'all' ? 'selected' : ''}>Barcha holatlar</option>
                                <option value="active" ${window.metroStatusFilter === 'active' ? 'selected' : ''}>Soz holatda (Green)</option>
                                <option value="warning" ${window.metroStatusFilter === 'warning' ? 'selected' : ''}>Muddati yaqin (Yellow)</option>
                                <option value="expired" ${window.metroStatusFilter === 'expired' ? 'selected' : ''}>Muddati o'tgan / Urgent (Red)</option>
                            </select>
                            ${isAdmin ? `
                            <select id="metro-bolinma-filter" onchange="window.filterDevicesList()" style="padding: 12px 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: white; border-radius: 14px; outline: none; cursor: pointer;">
                                <option value="all" ${window.metroBolinmaFilter === 'all' ? 'selected' : ''}>Barcha bo'linmalar</option>
                                ${Object.keys(window.Auth?.roleStructure || {}).filter(rid => rid.startsWith('bolinma') || rid.includes('sex')).map(rid => `
                                    <option value="${rid}" ${window.metroBolinmaFilter === rid ? 'selected' : ''}>${window.getBolinmaName(rid)}</option>
                                `).join('')}
                            </select>
                            ` : ''}
                            <button onclick="SmartUtils.exportToPDF('metro-devices-table-content', 'Metrologiya_Asboblar_Pasporti')" class="btn-primary" style="padding: 10px 20px; font-size: 0.8rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; border-radius: 14px; cursor: pointer;">
                                <i class="fas fa-file-pdf"></i> PDF Eksport
                            </button>
                        </div>
                    </div>
                    <div style="flex: 1; overflow-y: auto; max-height: calc(100vh - 240px); padding-bottom: 20px;" id="metro-devices-table-content">
                        <!-- Table dynamically injected -->
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
        window.filterDevicesList();
    };

    window.filterDevicesList = function () {
        window.metroSearchQuery = document.getElementById('metro-dev-search')?.value || '';
        window.metroStatusFilter = document.getElementById('metro-status-filter')?.value || 'all';
        const bolinmaSelect = document.getElementById('metro-bolinma-filter');
        if (bolinmaSelect) {
            window.metroBolinmaFilter = bolinmaSelect.value || 'all';
        }

        const tableContainer = document.getElementById('metro-devices-table-content');
        if (tableContainer) {
            tableContainer.innerHTML = renderMetroDevicesTableHTML();
        }
    };

    function renderMetroDevicesTableHTML() {
        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userBolinmaId = currentUser.bolinmalar?.[0] || 'admin';
        const viewingBolinmaId = window.viewingSubdivisionId || userBolinmaId;
        const isAdmin = (currentUser.role === 'admin' || userBolinmaId === 'admin') && viewingBolinmaId === 'admin';

        let filteredDevices = [...window.metrologyDevices];
        if (window.metroSearchQuery) {
            const q = window.metroSearchQuery.toLowerCase();
            filteredDevices = filteredDevices.filter(d => 
                d.name.toLowerCase().includes(q) || 
                (d.serial && d.serial.toLowerCase().includes(q))
            );
        }
        if (window.metroStatusFilter && window.metroStatusFilter !== 'all') {
            filteredDevices = filteredDevices.filter(d => getDaysInfo(d).statusClass === window.metroStatusFilter);
        }
        if (isAdmin && window.metroBolinmaFilter && window.metroBolinmaFilter !== 'all') {
            filteredDevices = filteredDevices.filter(d => d.bolinma_id === window.metroBolinmaFilter);
        }

        return `
            <table class="metro-table">
                <thead>
                    <tr>
                        ${isAdmin ? '<th><i class="fas fa-building" style="margin-right:6px; color:#3b82f6;"></i> Bo\'linma</th>' : ''}
                        <th><i class="fas fa-tools" style="margin-right:6px; color:#38bdf8;"></i> Asbob turi / Nomi</th>
                        <th><i class="fas fa-barcode" style="margin-right:6px; color:#ffd700;"></i> Zavod / Seriya №</th>
                        <th><i class="fas fa-calendar-alt" style="margin-right:6px; color:#10b981;"></i> Oxirgi kalibrovka</th>
                        <th><i class="fas fa-heartbeat" style="margin-right:6px; color:#ef4444;"></i> Holat / Vaqt (Traffic Light)</th>
                        <th style="width: 150px; text-align: right;"><i class="fas fa-cogs" style="margin-right:6px; color:#a855f7;"></i> Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredDevices.length > 0 ? filteredDevices.map(d => {
                        const info = getDaysInfo(d);
                        
                        let statusHTML = '';
                        if (info.isShablon) {
                            statusHTML = `
                                <div style="display:flex; flex-direction:column; gap:10px;">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span class="status-indicator-dot ${info.qiyoslash.statusClass}"></span>
                                        <div>
                                            <span class="status-tab ${info.qiyoslash.statusClass}">${info.qiyoslash.statusLabel.toUpperCase()}</span>
                                            <span style="font-size:0.65rem; color:#94a3b8; font-weight:800; text-transform:uppercase; margin-left:6px; letter-spacing:0.5px;">Qiyoslash (1-yil)</span>
                                        </div>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span class="status-indicator-dot ${info.birka.statusClass}"></span>
                                        <div>
                                            <span class="status-tab ${info.birka.statusClass}">${info.birka.statusLabel.toUpperCase()}</span>
                                            <span style="font-size:0.65rem; color:#94a3b8; font-weight:800; text-transform:uppercase; margin-left:6px; letter-spacing:0.5px;">Birka (3-oy)</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else {
                            statusHTML = `
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span class="status-indicator-dot ${info.statusClass}"></span>
                                    <div>
                                        <span class="status-tab ${info.statusClass}">${info.qiyoslash.statusLabel.toUpperCase()}</span>
                                        <div style="font-size:0.65rem; color:#64748b; font-weight:700; text-transform:uppercase; margin-top:4px; letter-spacing:0.5px;">Qiyoslash muddati</div>
                                    </div>
                                </div>
                            `;
                        }

                        return `
                        <tr>
                            ${isAdmin ? `<td class="bolinma-name" style="font-weight:800;">${window.getBolinmaName(d.bolinma_id)}</td>` : ''}
                            <td>
                                <div class="device-name-container">
                                    <div class="device-icon-wrapper">
                                        <i class="fas ${getDeviceIcon(d.name)}"></i>
                                    </div>
                                    <div>
                                        <div class="device-name-text">${escapeHtml(d.name)}</div>
                                        <div class="device-type-subtitle">O'lchash Vositasi</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="serial-badge">
                                    <i class="fas fa-barcode"></i> ${d.serial || '---'}
                                </span>
                            </td>
                            <td>
                                <div class="calib-date-wrapper">
                                    <div class="calib-icon">
                                        <i class="fas fa-calendar-check"></i>
                                    </div>
                                    <div>
                                        <div class="calib-date-text">Qiyos: ${info.dateStr}</div>
                                        ${info.isShablon ? `<div class="calib-date-text" style="color:#94a3b8; font-size:0.8rem; margin-top:4px;">Birka: ${d.birkaDate || info.dateStr}</div>` : `<div class="calib-days-ago">${info.daysPassed} kun oldin</div>`}
                                    </div>
                                </div>
                            </td>
                            <td style="min-width:210px;">
                                ${statusHTML}
                            </td>
                            <td style="text-align: right; vertical-align: middle;">
                                <div style="display: flex; justify-content: flex-end; width: 100%;">
                                    <div style="display:inline-flex; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 6px; gap: 6px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);">
                                        <button onclick="window.recalibrateDevice('${d.id}')" class="metro-action-btn recal" title="Yangi tekshiruv (Qayta kalibrlash)">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                        <button onclick="window.openEditDeviceModal('${d.id}')" class="metro-action-btn edit" title="Tahrirlash">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="window.deleteDevice('${d.id}')" class="metro-action-btn del" title="O'chirish">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>`;
                    }).join('') : `<tr><td colspan="${isAdmin ? 6 : 5}" class="empty-state">Asboblar topilmadi.</td></tr>`}
                </tbody>
            </table>
        `;
    }

    // --- MODAL WINDOW 2: ELECTRICITY MONITOR ---
    window.openMetroElectricityModal = function () {
        let modal = document.getElementById('metro-electricity-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'metro-electricity-modal';
            modal.className = 'department-window';
            document.body.appendChild(modal);
        }
        modal.style.zIndex = '20005';

        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userBolinmaId = currentUser.bolinmalar?.[0] || 'admin';
        const viewingBolinmaId = window.viewingSubdivisionId || userBolinmaId;
        const isAdmin = (currentUser.role === 'admin' || userBolinmaId === 'admin') && viewingBolinmaId === 'admin';

        const summary = window.metrologyElectricity['summary'] || [];
        const elec = window.metrologyElectricity[viewingBolinmaId] || { lastReading: 0, currentMonth: 0 };
        const consumption = Math.max(0, (elec.currentMonth || 0) - (elec.lastReading || 0));

        let contentHTML = '';
        if (isAdmin) {
            contentHTML = `
                <div class="table-container" style="flex: 1; overflow-y: auto;">
                    <table class="metro-table">
                        <thead>
                            <tr>
                                <th><i class="fas fa-building" style="margin-right:6px; color:#3b82f6;"></i> Bo'linma</th>
                                <th><i class="fas fa-calendar" style="margin-right:6px; color:#10b981;"></i> Sana</th>
                                <th><i class="fas fa-tachometer-alt" style="margin-right:6px; color:#ffd700;"></i> Ko'rsatkich (kWh)</th>
                                <th><i class="fas fa-chart-line" style="margin-right:6px; color:#38bdf8;"></i> Joriy Oy Sarfi</th>
                                <th><i class="fas fa-sliders-h" style="margin-right:6px; color:#a855f7;"></i> Oylik Limit</th>
                                <th><i class="fas fa-heartbeat" style="margin-right:6px; color:#ef4444;"></i> Holat</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summary.length > 0 ? summary.map(s => {
                                const cons = Math.max(0, (s.currentMonth || 0) - (s.lastReading || 0));
                                const limit = window.metrologyLimits[s.bolinma_id] || 0;
                                const isOverLimit = limit > 0 && cons > limit;
                                return `
                                <tr>
                                    <td class="bolinma-name" style="font-weight:800;">${window.getBolinmaName(s.bolinma_id)}</td>
                                    <td style="color:#94a3b8;">${s.date}</td>
                                    <td style="font-weight:700; font-family:'JetBrains Mono', monospace;">${(s.currentMonth||0).toLocaleString()}</td>
                                    <td style="color:#fbbf24; font-weight:800; font-family:'JetBrains Mono', monospace;">${cons.toLocaleString()} kWh</td>
                                    <td style="color:#a7f3d0; font-family:'JetBrains Mono', monospace;">${limit > 0 ? limit.toLocaleString() + ' kWh' : 'Kiritilmagan'}</td>
                                    <td>
                                        ${isOverLimit ? 
                                            `<span class="status-badge" style="background:rgba(239,68,68,0.15); color:#ef4444; font-weight:900;">LIMITDAN OSHDI</span>` : 
                                            `<span class="status-badge active">NORMADA</span>`
                                        }
                                    </td>
                                </tr>`;
                            }).join('') : '<tr><td colspan="6" class="empty-state">Hozircha hisobotlar mavjud emas</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            contentHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 25px; flex: 1;">
                    <div style="display:flex; flex-direction:column; gap:20px;">
                        <div style="background:rgba(0,0,0,0.25); border-radius:16px; padding:25px; border:1px solid rgba(255,255,255,0.05);">
                            <label style="font-size:0.75rem; color:#94a3b8; font-weight:800; letter-spacing:0.5px; display:block; margin-bottom:12px;">JORIY HISOBLAGICH KO'RSATKICHI (kWh)</label>
                            <div style="display:flex; gap:10px;">
                                <input type="number" id="metro-elec-current-input" value="${elec.currentMonth || ''}" placeholder="Masalan: 5220" style="flex:1; background:#020617; border:1px solid rgba(255,255,255,0.1); padding:14px 18px; border-radius:12px; color:#fff; font-weight:700; font-size:1.15rem; outline:none; min-width:0;">
                                <button onclick="window.saveElectricityReading('${viewingBolinmaId}')" style="background:linear-gradient(135deg,#fbbf24,#d97706); color:#000; border:none; padding:0 24px; border-radius:12px; font-weight:900; cursor:pointer; transition:0.2s; white-space:nowrap;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">SAQLASH</button>
                            </div>
                            <div style="margin-top:12px; font-size:0.85rem; color:#64748b;">Oldingi oy yopilish ko'rsatkichi: <b style="color:#e2e8f0; font-family:'JetBrains Mono', monospace;">${(elec.lastReading || 0).toLocaleString()} kWh</b></div>
                        </div>

                        ${consumption > 0 ? `
                        <div style="background:rgba(59,130,246,0.05); border:1px solid rgba(59,130,246,0.15); border-radius:14px; padding:18px 22px; display:flex; flex-direction:column; gap:10px;">
                            <div style="display:flex; align-items:center; gap:14px;">
                                <div style="width:48px; height:48px; background:rgba(59,130,246,0.1); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#3b82f6; font-size:1.5rem; flex-shrink:0;"><i class="fas fa-chart-line"></i></div>
                                <div>
                                    <div style="font-size:0.7rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Joriy oy sarfi</div>
                                    <div style="font-size:1.75rem; font-weight:900; color:#fff; line-height:1; font-family:'JetBrains Mono', monospace;">${consumption.toLocaleString()} <span style="font-size:0.9rem; color:#64748b; font-weight:normal;">kWh</span></div>
                                </div>
                            </div>
                            ${window.metrologyLimits[viewingBolinmaId] ? `
                                <div style="margin-top:5px;">
                                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:800; color:#94a3b8; margin-bottom:6px;">
                                        <span>LIMIT: ${window.metrologyLimits[viewingBolinmaId]} kWh</span>
                                        <span style="color:${consumption > window.metrologyLimits[viewingBolinmaId] ? '#ef4444' : '#10b981'}">${Math.round((consumption/window.metrologyLimits[viewingBolinmaId])*100)}% Ishlatildi</span>
                                    </div>
                                    <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:10px; overflow:hidden;">
                                        <div style="width:${Math.min(100, (consumption/window.metrologyLimits[viewingBolinmaId])*100)}%; height:100%; background:${consumption > window.metrologyLimits[viewingBolinmaId] ? '#ef4444' : '#10b981'};"></div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>` : ''}
                    </div>

                    <div style="background:rgba(30,41,59,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:20px; padding:25px; display:flex; flex-direction:column; justify-content:center; gap:15px;">
                        <h3 class="card-title" style="margin-top:0;"><i class="fas fa-shield-alt" style="color:#10b981;"></i> Xavfsizlik va Limit holati</h3>
                        ${consumption > (window.metrologyLimits[viewingBolinmaId] || 999999) ? `
                        <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:18px; padding:22px; display:flex; gap:16px;">
                            <div style="width:48px; height:48px; background:rgba(239,68,68,0.15); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#ef4444; font-size:1.5rem; flex-shrink:0;"><i class="fas fa-skull-crossbones"></i></div>
                            <div>
                                <div style="color:#ef4444; font-weight:900; font-size:1.05rem;">Limitdan oshib ketildi!</div>
                                <div style="color:#94a3b8; font-size:0.8rem; margin-top:5px; line-height:1.4;">Belgilangan oylik limitdan oshib ketildi. Iltimos, elektr sarfini tejamkorlik rejimiga o'tkazing.</div>
                            </div>
                        </div>` : `
                        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:18px; padding:22px; display:flex; gap:16px;">
                            <div style="width:48px; height:48px; background:rgba(16,185,129,0.15); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#10b981; font-size:1.5rem; flex-shrink:0;"><i class="fas fa-leaf"></i></div>
                            <div>
                                <div style="color:#10b981; font-weight:900; font-size:1.05rem;">Energiya tejash tartibida</div>
                                <div style="color:#94a3b8; font-size:0.8rem; margin-top:5px; line-height:1.4;">Joriy oyda elektr iste'moli normada va limit doirasida saqlanmoqda.</div>
                            </div>
                        </div>`}
                    </div>
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #090d16 0%, #111827 100%); border-bottom: 2px solid #38bdf8; padding: 15px 30px;">
                <div class="metro-table-wrapper" style="display:flex; justify-content:space-between; align-items:center; margin:0 auto; padding:0; height:auto; overflow:visible;">
                    <h2 class="department-name" style="color: #f8fafc; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px; margin:0;">
                        <i class="fas fa-bolt" style="color: #38bdf8; filter: drop-shadow(0 0 5px rgba(56,189,248,0.5));"></i> 
                        ELEKTR MONITORI ${isAdmin ? '(Markaziy)' : `(${window.getBolinmaName(viewingBolinmaId)})`}
                    </h2>
                    <button class="close-btn" onclick="document.getElementById('metro-electricity-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="background: radial-gradient(circle at top left, #0b0f19, #030712); padding: 30px; height: calc(100% - 70px); box-sizing: border-box; display: flex; flex-direction: column; overflow-y: auto;">
                <div class="metro-table-wrapper">
                    ${contentHTML}
                </div>
            </div>
        `;
        modal.classList.add('active');
    };

    // --- MODAL WINDOW 3: CONSUMPTION CHARTS ---
    window.openMetroChartsModal = function () {
        let modal = document.getElementById('metro-charts-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'metro-charts-modal';
            modal.className = 'department-window';
            document.body.appendChild(modal);
        }
        modal.style.zIndex = '20005';

        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userBolinmaId = currentUser.bolinmalar?.[0] || 'admin';
        const viewingBolinmaId = window.viewingSubdivisionId || userBolinmaId;
        const isAdmin = (currentUser.role === 'admin' || userBolinmaId === 'admin') && viewingBolinmaId === 'admin';

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #090d16 0%, #111827 100%); border-bottom: 2px solid #10b981; padding: 15px 30px;">
                <div class="metro-table-wrapper" style="display:flex; justify-content:space-between; align-items:center; margin:0 auto; padding:0; height:auto; overflow:visible;">
                    <h2 class="department-name" style="color: #f8fafc; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px; margin:0;">
                        <i class="fas fa-chart-line" style="color: #10b981; filter: drop-shadow(0 0 5px rgba(16,185,129,0.5));"></i> 
                        ISTE'MOL TAHLILI ${isAdmin ? '(Markaziy)' : `(${window.getBolinmaName(viewingBolinmaId)})`}
                    </h2>
                    <button class="close-btn" onclick="document.getElementById('metro-charts-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="background: radial-gradient(circle at top left, #0b0f19, #030712); padding: 30px; height: calc(100% - 70px); box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
                <div class="metro-table-wrapper" style="flex: 1;">
                    <div style="flex: 1; position: relative; height: 100%; min-height: 350px;">
                        <canvas id="metro-electricity-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
        setTimeout(() => window.initMetrologyCharts(), 100);
    };

    // --- MODAL WINDOW 4: SET LIMITS ---
    window.openMetroLimitsModal = function () {
        let modal = document.getElementById('metro-limits-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'metro-limits-modal';
            modal.className = 'department-window';
            document.body.appendChild(modal);
        }
        modal.style.zIndex = '20005';

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #090d16 0%, #111827 100%); border-bottom: 2px solid #e11d48; padding: 15px 30px;">
                <div class="metro-table-wrapper" style="display:flex; justify-content:space-between; align-items:center; margin:0 auto; padding:0; height:auto; overflow:visible;">
                    <h2 class="department-name" style="color: #f8fafc; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px; margin:0;">
                        <i class="fas fa-sliders-h" style="color: #e11d48; filter: drop-shadow(0 0 5px rgba(225,29,72,0.5));"></i> 
                        LIMIT SOZLAMALARI (ADMIN)
                    </h2>
                    <button class="close-btn" onclick="document.getElementById('metro-limits-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="background: radial-gradient(circle at top left, #0b0f19, #030712); padding: 30px; height: calc(100% - 70px); box-sizing: border-box; display: flex; flex-direction: column; overflow-y: auto;">
                <div class="metro-table-wrapper">
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:15px; padding-top:10px;">
                        ${Object.keys(window.Auth?.roleStructure || {}).filter(rid => rid.startsWith('bolinma') || rid.includes('sex')).map(rid => `
                            <div style="background:rgba(255,255,255,0.02); padding:18px; border-radius:16px; border:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; gap:10px;">
                                <div style="font-size:0.8rem; color:#f8fafc; font-weight:800;">${window.getBolinmaName(rid)}</div>
                                <div style="display:flex; gap:8px;">
                                    <input type="number" id="limit-val-${rid}" value="${window.metrologyLimits[rid] || ''}" placeholder="kWh..." style="width:100%; background:#020617; border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:8px; color:#fff; font-weight:700; font-size:0.85rem; outline:none;">
                                    <button onclick="window.saveMetrologyLimit('${rid}')" style="background:#38bdf8; border:none; border-radius:8px; padding:0 12px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'"><i class="fas fa-save" style="color:#000; font-size:0.95rem;"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    };

    // --- ADD / EDIT / DELETE ACTION LOGIC ---
    window.openAddDeviceModal = function() {
        const existing = document.getElementById('metro-add-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'metro-add-modal';
        modal.className = 'active';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(2,6,23,0.92);backdrop-filter:blur(20px);z-index:999999;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
        <div style="background:radial-gradient(circle at top left,#0f172a,#020617);border:1px solid rgba(56,189,248,0.25);border-radius:24px;width:520px;max-width:95vw;overflow:hidden;box-shadow:0 0 80px rgba(0,0,0,0.8),0 0 120px rgba(56,189,248,0.08);animation:metrIn 0.4s cubic-bezier(0.4,0,0.2,1);">
            <style>@keyframes metrIn{from{opacity:0;transform:scale(0.93) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}</style>
            <div style="padding:25px 30px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;background:rgba(56,189,248,0.03);">
                <div style="display:flex;align-items:center;gap:14px;">
                    <div style="width:44px;height:44px;background:linear-gradient(135deg,#38bdf8,#2563eb);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;"><i class="fas fa-plus-circle"></i></div>
                    <div>
                        <div style="font-weight:900;font-size:1.1rem;color:#fff;">Yangi Asbob Qo'shish</div>
                        <div style="font-size:0.68rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Metrologiya Pasporti</div>
                    </div>
                </div>
                <button onclick="document.getElementById('metro-add-modal').remove()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);width:36px;height:36px;border-radius:10px;color:#94a3b8;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;">&times;</button>
            </div>
            <div style="padding:30px;display:flex;flex-direction:column;gap:18px;">
                <div>
                    <label style="font-size:0.72rem;color:#94a3b8;font-weight:800;letter-spacing:0.8px;display:block;margin-bottom:8px;">ASBOB TURI</label>
                    <select id="metro-dev-type" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;cursor:pointer;" onchange="document.getElementById('metro-type-other').style.display=this.value==='boshqa'?'block':'none'">
                        <option value="">-- Turni tanlang --</option>
                        <option value="Shablon">Shablon (3-oy birka / 1-yil qiyoslash)</option>
                        <option value="Shtangensirkul">Shtangensirkul (1-yil qiyoslash)</option>
                        <option value="Termometr">Termometr (1-yil qiyoslash)</option>
                        <option value="Spidometr">Spidometr (1-yil qiyoslash)</option>
                        <option value="Motosoat">Motosoat (1-yil qiyoslash)</option>
                        <option value="Nuqson izlovchi aravacha">Nuqson izlovchi aravacha (1-yil qiyoslash)</option>
                        <option value="Manometr">Manometr (1-yil qiyoslash)</option>
                        <option value="Elektr hisoblagich">Elektr hisoblagich (4-yil qiyoslash)</option>
                        <option value="boshqa">Boshqa (qo'lda kiriting)</option>
                    </select>
                    <input type="text" id="metro-type-other" placeholder="Asbob nomini kiriting..." style="display:none;margin-top:8px;width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;box-sizing:border-box;">
                </div>
                <div>
                    <label style="font-size:0.72rem;color:#94a3b8;font-weight:800;letter-spacing:0.8px;display:block;margin-bottom:8px;">ZAVOD / SERIYA RAQAMI</label>
                    <input type="text" id="metro-dev-serial" placeholder="Masalan: S/N-2024-0381" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;box-sizing:border-box;">
                </div>
                <div>
                    <label style="font-size:0.72rem;color:#94a3b8;font-weight:800;letter-spacing:0.8px;display:block;margin-bottom:8px;">OXIRGI KALIBROVKA SANASI</label>
                    <input type="date" id="metro-dev-date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;box-sizing:border-box;cursor:pointer;">
                    <div style="margin-top:6px;font-size:0.68rem;color:#475569;"><i class="fas fa-info-circle" style="margin-right:4px;"></i>Muddat asbob turiga qarab avtomatik aniqlanadi.</div>
                </div>
                <div id="birka-date-container" style="display:none; margin-top:10px;">
                    <label style="font-size:0.72rem;color:#94a3b8;font-weight:800;letter-spacing:0.8px;display:block;margin-bottom:8px;">BIRKA ALMASHTIRISH SANASI (Shablon)</label>
                    <input type="date" id="metro-dev-birka-date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;box-sizing:border-box;cursor:pointer;">
                </div>
                <div style="display:flex;gap:12px;margin-top:10px;">
                    <button onclick="document.getElementById('metro-add-modal').remove()" style="flex:1;padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#94a3b8;cursor:pointer;font-weight:700;font-size:0.9rem;transition:0.2s;">Bekor qilish</button>
                    <button onclick="window.saveNewDevice()" style="flex:2;padding:14px;background:linear-gradient(135deg,#3b82f6,#1e40af);border:none;border-radius:14px;color:#fff;cursor:pointer;font-weight:900;font-size:0.95rem;letter-spacing:0.5px;box-shadow:0 4px 15px rgba(59,130,246,0.3);transition:0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <i class="fas fa-save" style="margin-right:8px;"></i>PASPORTNI SAQLASH
                    </button>
                </div>
            </div>
        </div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        
        setTimeout(() => {
            const tSel = document.getElementById('metro-dev-type');
            const tOth = document.getElementById('metro-type-other');
            const bCont = document.getElementById('birka-date-container');
            const checkBirka = () => {
                const n = (tSel.value === 'boshqa' ? tOth.value : tSel.value).toLowerCase();
                if(bCont) bCont.style.display = n.includes('shablon') ? 'block' : 'none';
            };
            if(tSel) tSel.addEventListener('change', checkBirka);
            if(tOth) tOth.addEventListener('input', checkBirka);
        }, 50);
    };

    window.saveNewDevice = async function() {
        const typeSelect = document.getElementById('metro-dev-type');
        const typeOther = document.getElementById('metro-type-other');
        const name = typeSelect.value === 'boshqa' ? typeOther.value.trim() : typeSelect.value;
        const serial = document.getElementById('metro-dev-serial').value.trim();
        const date = document.getElementById('metro-dev-date').value;
        const birkaDate = document.getElementById('metro-dev-birka-date').value;

        if (!name) return SmartUtils.showToast('Asbob turini tanlang yoki kiriting', 'warning');
        if (!date) return SmartUtils.showToast('Kalibrovka sanasini kiriting', 'warning');

        try {
            const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
            const bolinmaId = window.viewingSubdivisionId || currentUser.bolinmalar?.[0] || 'admin';
            await SmartUtils.fetchAPI(`/metrology/devices`, {
                method: 'POST',
                body: JSON.stringify({ bolinma_id: bolinmaId, name, serial: serial || '---', stampDate: date, birkaDate: name.toLowerCase().includes('shablon') ? birkaDate : null })
            });
            document.getElementById('metro-add-modal').remove();
            SmartUtils.showToast("Yangi asbob muvaffaqiyatli ro'yxatga olindi", 'success');
            window.refreshMetrologyViews();
        } catch (e) {
            SmartUtils.showToast('Saqlashda xato yuz berdi', 'error');
        }
    };

    window.openEditDeviceModal = function(deviceId) {
        const dev = window.metrologyDevices.find(d => String(d.id) === String(deviceId));
        if (!dev) return SmartUtils.showToast("Asbob topilmadi", "error");

        const existing = document.getElementById('metro-edit-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'metro-edit-modal';
        modal.className = 'active';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(2,6,23,0.92);backdrop-filter:blur(20px);z-index:999999;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
        <div style="background:radial-gradient(circle at top left,#0f172a,#020617);border:1px solid rgba(255,215,0,0.25);border-radius:24px;width:520px;max-width:95vw;overflow:hidden;box-shadow:0 0 80px rgba(0,0,0,0.8),0 0 120px rgba(255,215,0,0.08);animation:metrIn 0.4s cubic-bezier(0.4,0,0.2,1);">
            <div style="padding:25px 30px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;background:rgba(255,215,0,0.03);">
                <div style="display:flex;align-items:center;gap:14px;">
                    <div style="width:44px;height:44px;background:linear-gradient(135deg,#ffd700,#b59a00);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#000;font-size:1.3rem;"><i class="fas fa-edit"></i></div>
                    <div>
                        <div style="font-weight:900;font-size:1.1rem;color:#fff;">Asbobni Tahrirlash</div>
                        <div style="font-size:0.68rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Metrologiya Pasporti</div>
                    </div>
                </div>
                <button onclick="document.getElementById('metro-edit-modal').remove()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);width:36px;height:36px;border-radius:10px;color:#94a3b8;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;">&times;</button>
            </div>
            <div style="padding:30px;display:flex;flex-direction:column;gap:18px;">
                <div>
                    <label style="font-size:0.72rem;color:#94a3b8;font-weight:800;letter-spacing:0.8px;display:block;margin-bottom:8px;">ASBOB TURI / NOMI</label>
                    <input type="text" id="metro-edit-dev-name" value="${escapeHtml(dev.name)}" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;box-sizing:border-box;">
                </div>
                <div>
                    <label style="font-size:0.72rem;color:#94a3b8;font-weight:800;letter-spacing:0.8px;display:block;margin-bottom:8px;">ZAVOD / SERIYA RAQAMI</label>
                    <input type="text" id="metro-edit-dev-serial" value="${dev.serial || ''}" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;box-sizing:border-box;">
                </div>
                <div>
                    <label style="font-size:0.72rem;color:#94a3b8;font-weight:800;letter-spacing:0.8px;display:block;margin-bottom:8px;">OXIRGI KALIBROVKA SANASI</label>
                    <input type="date" id="metro-edit-dev-date" value="${dev.stampDate || dev.lastCalibration || ''}" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;box-sizing:border-box;cursor:pointer;">
                </div>
                <div id="edit-birka-date-container" style="display:${(dev.name||'').toLowerCase().includes('shablon') ? 'block' : 'none'}; margin-top:10px;">
                    <label style="font-size:0.72rem;color:#94a3b8;font-weight:800;letter-spacing:0.8px;display:block;margin-bottom:8px;">BIRKA ALMASHTIRISH SANASI (Shablon)</label>
                    <input type="date" id="metro-edit-dev-birka-date" value="${dev.birkaDate || ''}" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;box-sizing:border-box;cursor:pointer;">
                </div>
                <div style="display:flex;gap:12px;margin-top:10px;">
                    <button onclick="document.getElementById('metro-edit-modal').remove()" style="flex:1;padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#94a3b8;cursor:pointer;font-weight:700;font-size:0.9rem;transition:0.2s;">Bekor qilish</button>
                    <button onclick="window.saveDeviceEdit('${deviceId}')" style="flex:2;padding:14px;background:linear-gradient(135deg,#ffd700,#b59a00);border:none;border-radius:14px;color:#000;cursor:pointer;font-weight:900;font-size:0.95rem;letter-spacing:0.5px;box-shadow:0 4px 15px rgba(255,215,0,0.3);transition:0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <i class="fas fa-save" style="margin-right:8px;"></i>O'ZGARISHLARNI SAQLASH
                    </button>
                </div>
            </div>
        </div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        setTimeout(() => {
            const eName = document.getElementById('metro-edit-dev-name');
            const bCont = document.getElementById('edit-birka-date-container');
            if(eName) {
                eName.addEventListener('input', () => {
                    if(bCont) bCont.style.display = eName.value.toLowerCase().includes('shablon') ? 'block' : 'none';
                });
            }
        }, 50);
    };

    window.saveDeviceEdit = async function(deviceId) {
        const nameEl = document.getElementById('metro-edit-dev-name');
        const serialEl = document.getElementById('metro-edit-dev-serial');
        const dateEl = document.getElementById('metro-edit-dev-date');
        const birkaDateEl = document.getElementById('metro-edit-dev-birka-date');

        const name = nameEl ? nameEl.value.trim() : '';
        const serial = serialEl ? serialEl.value.trim() : '';
        const date = dateEl ? dateEl.value : '';
        const birkaDate = birkaDateEl ? birkaDateEl.value : '';

        if (!name) return SmartUtils.showToast("Asbob nomini kiriting", "warning");
        if (!date) return SmartUtils.showToast("Kalibrovka sanasini kiriting", "warning");

        try {
            await SmartUtils.fetchAPI(`/metrology/devices/${deviceId}`, {
                method: 'PUT',
                body: JSON.stringify({ name, serial: serial || '---', stampDate: date, birkaDate: name.toLowerCase().includes('shablon') ? birkaDate : null })
            });
            document.getElementById('metro-edit-modal').remove();
            SmartUtils.showToast("Asbob pasporti muvaffaqiyatli yangilandi", "success");
            window.refreshMetrologyViews();
        } catch (e) {
            SmartUtils.showToast("Yangilashda xatolik yuz berdi", "error");
        }
    };

    window.recalibrateDevice = async function(deviceId) {
        const dev = window.metrologyDevices.find(d => String(d.id) === String(deviceId));
        if (!dev) return;

        const todayStr = new Date().toISOString().slice(0, 10);
        if (!confirm(`${dev.name} asbobi kalibrovka sanasini bugungi kunga (${todayStr}) yangilamoqchimisiz?`)) return;

        try {
            await SmartUtils.fetchAPI(`/metrology/devices/${deviceId}`, {
                method: 'PUT',
                body: JSON.stringify({ name: dev.name, serial: dev.serial, stampDate: todayStr })
            });
            SmartUtils.showToast("Kalibrovka sanasi muvaffaqiyatli yangilandi", "success");
            window.refreshMetrologyViews();
        } catch (e) {
            SmartUtils.showToast("Yangilashda xatolik yuz berdi", "error");
        }
    };

    window.deleteDevice = async function(deviceId) {
        const dev = window.metrologyDevices.find(d => String(d.id) === String(deviceId));
        if (!dev) return;

        if (!confirm(`Haqiqatan ham ${dev.name} (S/N: ${dev.serial}) asbobini tizimdan o'chirmoqchimisiz?`)) return;

        try {
            await SmartUtils.fetchAPI(`/metrology/devices/${deviceId}`, {
                method: 'DELETE'
            });
            SmartUtils.showToast("Asbob muvaffaqiyatli o'chirildi", "success");
            window.refreshMetrologyViews();
        } catch (e) {
            SmartUtils.showToast("O'chirishda xatolik yuz berdi", "error");
        }
    };

    // --- Chart.js Trend Visualizer ---
    window.initMetrologyCharts = function () {
        const canvas = document.getElementById('metro-electricity-chart');
        if (!canvas) return;

        if (window.metroChartInstance) {
            window.metroChartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userBolinmaId = currentUser.bolinmalar?.[0] || 'admin';
        const viewingBolinmaId = window.viewingSubdivisionId || userBolinmaId;
        const isAdmin = (currentUser.role === 'admin' || userBolinmaId === 'admin') && viewingBolinmaId === 'admin';

        const summary = window.metrologyElectricity['summary'] || [];

        if (isAdmin) {
            const bolinmalarData = {};
            summary.forEach(r => {
                if (!bolinmalarData[r.bolinma_id]) {
                    bolinmalarData[r.bolinma_id] = r;
                }
            });

            const labels = [];
            const data = [];
            const limits = [];

            Object.keys(bolinmalarData).forEach(bid => {
                labels.push(window.getBolinmaName(bid));
                const r = bolinmalarData[bid];
                const cons = Math.max(0, (r.currentMonth || 0) - (r.lastReading || 0));
                data.push(cons);
                limits.push(window.metrologyLimits[bid] || 0);
            });

            window.metroChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Iste'mol (kWh)",
                            data: data,
                            backgroundColor: 'rgba(56, 189, 248, 0.6)',
                            borderColor: '#38bdf8',
                            borderWidth: 2,
                            borderRadius: 8
                        },
                        {
                            label: "Limit (kWh)",
                            data: limits,
                            type: 'line',
                            borderColor: '#ef4444',
                            borderWidth: 2,
                            fill: false,
                            pointBackgroundColor: '#ef4444'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#94a3b8' } }
                    },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        } else {
            const myHistory = summary
                .filter(r => r.bolinma_id === viewingBolinmaId)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(-6);

            const labels = myHistory.map(r => new Date(r.date).toLocaleDateString('uz-UZ', { month: 'short', year: '2-digit' }));
            const data = myHistory.map(r => Math.max(0, (r.currentMonth || 0) - (r.lastReading || 0)));
            const limitVal = window.metrologyLimits[viewingBolinmaId] || 0;
            const limits = myHistory.map(() => limitVal);

            window.metroChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Iste'mol (kWh)",
                            data: data,
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            borderColor: '#38bdf8',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#38bdf8',
                            pointRadius: 5
                        },
                        {
                            label: "Limit (kWh)",
                            data: limits,
                            borderColor: 'rgba(239, 68, 68, 0.6)',
                            borderDash: [5, 5],
                            borderWidth: 2,
                            fill: false,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#94a3b8' } }
                    },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }
    };

    function getMetrologyStyles() {
        return `<style>
            .metrology-container{padding:0;font-family:'Outfit','Inter',sans-serif;background:linear-gradient(135deg,#090d16 0%,#030712 100%);min-height:100vh;color:#fff;overflow-x:hidden;}
            .metro-main{padding:35px;}
            .metro-header-panel {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding: 10px 0;
                animation: fadeInUp 0.5s ease-out;
            }
            .metro-main-title {
                margin: 0;
                font-size: 2.2rem;
                font-weight: 900;
                background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .metro-sub-title {
                margin: 5px 0 0;
                color: rgba(255,255,255,0.4);
                font-size: 0.8rem;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .metro-time-panel {
                text-align: right;
            }
            .metro-time-label {
                display: block;
                font-size: 0.7rem;
                color: #ffd700;
                font-weight: 800;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .metro-time-val {
                font-size: 1.1rem;
                font-weight: 700;
                color: #f8fafc;
            }
            .metro-hub-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 35px;
                animation: fadeInUp 0.6s ease-out both;
            }
            .metro-hub-card {
                position: relative;
                padding: 24px;
                border-radius: 22px;
                background: rgba(30, 41, 59, 0.4);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.07);
                display: flex;
                flex-direction: column;
                cursor: pointer;
                transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            .metro-hub-card:hover {
                transform: translateY(-8px);
                border-color: var(--card-accent);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px var(--card-glow);
                background: rgba(30, 41, 59, 0.65);
            }
            .metro-hub-icon {
                width: 58px;
                height: 58px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                margin-bottom: 15px;
                transition: all 0.3s;
            }
            .metro-hub-card:hover .metro-hub-icon {
                transform: scale(1.1) rotate(6deg);
                background: rgba(255, 255, 255, 0.07);
                border-color: var(--card-accent);
            }
            .metro-hub-title {
                font-size: 1.05rem;
                font-weight: 800;
                margin: 0;
                color: #fff;
            }
            .metro-hub-desc {
                font-size: 0.75rem;
                color: rgba(248, 250, 252, 0.4);
                margin: 6px 0 0;
                line-height: 1.35;
            }
            .header-badge{background:linear-gradient(90deg,#38bdf8,#2563eb);color:#fff;padding:4px 12px;border-radius:6px;font-size:0.65rem;font-weight:900;letter-spacing:2px;display:inline-block;margin-bottom:12px;}
            .metro-glass-card{background:rgba(30, 41, 59, 0.4);backdrop-filter:blur(20px);border-radius:20px;border:1px solid rgba(255,255,255,0.08);padding:25px;transition:0.4s cubic-bezier(0.16,1,0.3,1);box-shadow:0 10px 40px rgba(0,0,0,0.2);}
            .metro-glass-card:hover{transform:translateY(-3px);border-color:rgba(56,189,248,0.25);}
            .metro-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:25px;}
            .stat-card{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;}
            .stat-label{color:rgba(255,255,255,0.5);font-size:0.72rem;font-weight:700;letter-spacing:1px;}
            .stat-value{font-size:2rem;font-weight:900;margin-top:5px;}
            .stat-icon{position:absolute;right:20px;bottom:10px;font-size:2.5rem;opacity:0.08;}
            .stat-card.blue{border-left:4px solid #38bdf8;}.stat-card.green{border-left:4px solid #10b981;}.stat-card.yellow{border-left:4px solid #f59e0b;}.stat-card.red{border-left:4px solid #ef4444;}
            
            /* High-End Centered Layout Wrapper */
            .metro-table-wrapper {
                max-width: 1400px;
                width: 100%;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            /* Premium Card-Style Grid Table */
            .metro-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0 12px;
                margin-top: 10px;
            }
            .metro-table th {
                text-align: left;
                padding: 18px 24px;
                font-size: 0.8rem;
                color: #e2e8f0;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                font-weight: 800;
                border-bottom: none;
                background: linear-gradient(90deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.85) 100%);
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .metro-table th:first-child {
                border-top-left-radius: 16px;
                border-bottom-left-radius: 16px;
                border-left: 1px solid rgba(255, 255, 255, 0.08);
            }
            .metro-table th:last-child {
                border-top-right-radius: 16px;
                border-bottom-right-radius: 16px;
                border-right: 1px solid rgba(255, 255, 255, 0.08);
                text-align: right;
            }
            .metro-table tr {
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .metro-table tbody tr {
                background: rgba(30, 41, 59, 0.35);
                backdrop-filter: blur(10px);
            }
            .metro-table tbody tr:hover {
                background: rgba(30, 41, 59, 0.6);
                transform: scale(1.008) translateY(-2px);
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(56, 189, 248, 0.05);
            }
            .metro-table td {
                padding: 22px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                font-size: 0.95rem;
                vertical-align: middle;
                color: #f8fafc;
            }
            .metro-table td:first-child {
                border-left: 1px solid rgba(255, 255, 255, 0.05);
                border-top-left-radius: 20px;
                border-bottom-left-radius: 20px;
            }
            .metro-table td:last-child {
                border-right: 1px solid rgba(255, 255, 255, 0.05);
                border-top-right-radius: 20px;
                border-bottom-right-radius: 20px;
                text-align: right;
            }

            /* Device details */
            .device-name-container {
                display: flex;
                align-items: center;
                gap: 14px;
            }
            .device-icon-wrapper {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                background: rgba(56, 189, 248, 0.06);
                border: 1px solid rgba(56, 189, 248, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #38bdf8;
                font-size: 1.15rem;
                flex-shrink: 0;
            }
            .device-name-text {
                font-size: 1.02rem;
                font-weight: 800;
                color: #f8fafc;
            }
            .device-type-subtitle {
                font-size: 0.7rem;
                color: #64748b;
                font-weight: 800;
                text-transform: uppercase;
                margin-top: 3px;
                letter-spacing: 0.5px;
            }

            /* Serial badge */
            .serial-badge {
                background: rgba(255, 215, 0, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.15);
                color: #ffd700;
                padding: 6px 14px;
                border-radius: 10px;
                font-family: 'JetBrains Mono', monospace;
                font-weight: 700;
                font-size: 0.85rem;
                display: inline-flex;
                align-items: center;
                gap: 7px;
                letter-spacing: 0.5px;
            }

            .bolinma-name{font-weight:700;color:#38bdf8;}
            .status-badge{padding:6px 12px;border-radius:20px;font-size:0.68rem;font-weight:900;text-transform:uppercase;}
            .status-badge.active{background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.25);}
            .empty-state{text-align:center;padding:40px;color:#475569;font-style:italic;}
            
            /* Status Tabs */
            .status-tab {
                font-size: 0.72rem;
                font-weight: 900;
                padding: 5px 14px;
                border-radius: 20px;
                white-space: nowrap;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .status-tab.active {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.2);
                color: #10b981;
                text-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
            }
            .status-tab.warning {
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.2);
                color: #f59e0b;
                text-shadow: 0 0 10px rgba(245, 158, 11, 0.15);
            }
            .status-tab.expired {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
                color: #ef4444;
                text-shadow: 0 0 10px rgba(239, 68, 68, 0.15);
            }
            
            /* Action Buttons styling */
            .metro-action-btn {
                width: 38px;
                height: 38px;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.02);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .metro-action-btn i {
                font-size: 0.95rem;
            }
            .metro-action-btn.recal {
                color: #10b981;
            }
            .metro-action-btn.recal:hover {
                background: rgba(16, 185, 129, 0.12);
                border-color: rgba(16, 185, 129, 0.25);
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
                transform: translateY(-2px);
            }
            .metro-action-btn.edit {
                color: #f59e0b;
            }
            .metro-action-btn.edit:hover {
                background: rgba(245, 158, 11, 0.12);
                border-color: rgba(245, 158, 11, 0.25);
                box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
                transform: translateY(-2px);
            }
            .metro-action-btn.del {
                color: #ef4444;
            }
            .metro-action-btn.del:hover {
                background: rgba(239, 68, 68, 0.12);
                border-color: rgba(239, 68, 68, 0.25);
                box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
                transform: translateY(-2px);
            }

            /* Traffic Light Pulsing Dots */
            .status-indicator-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
            }
            .status-indicator-dot.active {
                background: #10b981;
                box-shadow: 0 0 8px #10b981, 0 0 15px #10b981;
            }
            .status-indicator-dot.warning {
                background: #f59e0b;
                box-shadow: 0 0 8px #f59e0b, 0 0 15px #f59e0b;
                animation: pulseYellow 1.5s infinite;
            }
            .status-indicator-dot.expired {
                background: #ef4444;
                box-shadow: 0 0 8px #ef4444, 0 0 15px #ef4444;
                animation: pulseRed 1.2s infinite;
            }
            @keyframes pulseYellow {
                0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
                70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
                100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
            }
            @keyframes pulseRed {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }

            .btn-refresh{background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.15);color:#38bdf8;width:34px;height:34px;border-radius:10px;cursor:pointer;transition:0.2s;}
            .btn-refresh:hover{background:rgba(56,189,248,0.2);}
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(15px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .anim-fade-up { animation: fadeInUp 0.4s ease-out both; }
            .metro-table-wrapper { width: 100%; max-width: 1250px; margin: 0 auto; }
        </style>`;
    }

    window.refreshMetrologyViews = async function () {
        await window.initMetrologyData();
        window.updateMetrologyDOM();
    };

    window.updateMetrologyDOM = function () {
        const containers = document.querySelectorAll('.metrology-dashboard-container');
        const html = window.getMetrologyDashboardHTML();
        containers.forEach(c => {
            c.innerHTML = html;
        });

        if (document.getElementById('metro-devices-modal')?.classList.contains('active')) {
            window.filterDevicesList();
        }
        if (document.getElementById('metro-electricity-modal')?.classList.contains('active')) {
            window.openMetroElectricityModal();
        }
        if (document.getElementById('metro-charts-modal')?.classList.contains('active')) {
            setTimeout(() => window.initMetrologyCharts(), 50);
        }
    };

    window.saveElectricityReading = async function (bolinmaId) {
        const input = document.getElementById('metro-elec-current-input') || document.querySelector('.metrology-dashboard-container #metro-elec-current');
        const val = parseFloat(input?.value);
        if (isNaN(val)) return SmartUtils.showToast('Iltimos, son kiriting', 'warning');
        try {
            const elec = window.metrologyElectricity[bolinmaId] || { lastReading: 0 };
            await SmartUtils.fetchAPI(`/metrology/electricity`, {
                method: 'POST',
                body: JSON.stringify({ bolinmaId, currentMonth: val, lastReading: elec.lastReading || 0 })
            });
            SmartUtils.showToast("Elektr ko'rsatkichi saqlandi", 'success');
            window.refreshMetrologyViews();
        } catch (e) {
            SmartUtils.showToast('Saqlashda xato', 'error');
        }
    };

    // Legacy support
    window.addMetrologyDeviceRecord = window.openAddDeviceModal;

    window.renderMetrologySection = async (windowElement, bolinmaId) => {
        const body = windowElement?.querySelector('.window-content') || windowElement?.querySelector('.department-body') || document.getElementById('main-content');
        if (body) {
            if (bolinmaId && bolinmaId !== 'metrologiya' && bolinmaId !== 'admin') {
                window.viewingSubdivisionId = bolinmaId;
            }
            await window.initMetrologyData();
            body.innerHTML = `<div id="metrology-main-content" class="metrology-dashboard-container" style="width:100%">${window.getMetrologyDashboardHTML()}</div>`;
        }
    };

    window.saveMetrologyLimit = function(bolinmaId) {
        const input = document.getElementById(`limit-val-${bolinmaId}`);
        const val = parseFloat(input?.value);
        if (!isNaN(val)) {
            window.metrologyLimits[bolinmaId] = val;
            localStorage.setItem('metrologyLimits', JSON.stringify(window.metrologyLimits));
            SmartUtils.showToast(`${window.getBolinmaName(bolinmaId)} uchun limit saqlandi`, 'success');
            window.refreshMetrologyViews();
        }
    };

})();
