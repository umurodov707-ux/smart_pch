// Metrology Department (Standardization & Electricity) - v12.0 (Ultra Premium UI Redesign)
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
            <div style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(25px); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 25px 40px; display: flex; justify-content: center; position: relative;">
                <div class="metro-table-wrapper" style="display:flex; justify-content:center; align-items:center;">
                    <h2 style="color: #f8fafc; font-size: 1.6rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px; margin:0;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ffd700, #b59a00); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(255,215,0,0.3);">
                            <i class="fas fa-ruler-combined" style="color: #000; font-size: 1.3rem;"></i> 
                        </div>
                        ASBOBLAR PASPORTI 
                        <span style="font-size: 0.9rem; color: #94a3b8; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 8px;">${isAdmin ? '(Markaziy)' : `(${window.getBolinmaName(viewingBolinmaId)})`}</span>
                    </h2>
                </div>
                <div style="position: absolute; right: 40px; top: 50%; transform: translateY(-50%); display: flex; gap: 15px; align-items: center;">
                    <button onclick="window.openAddDeviceModal()" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <i class="fas fa-plus"></i> YANGI QO'SHISH
                    </button>
                    <button onclick="document.getElementById('metro-devices-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 12px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.transform='rotate(0)'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="background: radial-gradient(circle at top left, #0b0f19, #030712); padding: 30px; height: calc(100% - 100px); box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden;">
                <div class="metro-table-wrapper">
                    <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; backdrop-filter: blur(10px);">
                        <div style="position: relative; flex-grow: 1; max-width: 400px;">
                            <i class="fas fa-search" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 1.1rem;"></i>
                            <input type="text" id="metro-dev-search" placeholder="Asbob nomi yoki seriya raqami bo'yicha izlash..." value="${window.metroSearchQuery || ''}" onkeyup="window.filterDevicesList()" style="width: 100%; padding: 16px 20px 16px 55px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 14px; outline: none; font-size: 0.95rem; font-weight: 600; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2); transition: 0.3s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 3px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='inset 0 2px 5px rgba(0,0,0,0.2)'">
                        </div>
                        <div style="display: flex; gap: 15px;">
                            <select id="metro-status-filter" onchange="window.filterDevicesList()" style="padding: 16px 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 14px; outline: none; cursor: pointer; font-size: 0.95rem; font-weight: 700; appearance: none; -webkit-appearance: none; padding-right: 40px; background-image: url('data:image/svg+xml;utf8,<svg fill=%22%2394a3b8%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>'); background-repeat: no-repeat; background-position: right 15px top 50%;">
                                <option value="all" style="background:#0f172a;" ${window.metroStatusFilter === 'all' ? 'selected' : ''}>BARCHA HOLATLAR</option>
                                <option value="active" style="background:#0f172a; color:#10b981;" ${window.metroStatusFilter === 'active' ? 'selected' : ''}>🟢 SOZ HOLATDA</option>
                                <option value="warning" style="background:#0f172a; color:#f59e0b;" ${window.metroStatusFilter === 'warning' ? 'selected' : ''}>🟡 MUDDATI YAQIN</option>
                                <option value="expired" style="background:#0f172a; color:#ef4444;" ${window.metroStatusFilter === 'expired' ? 'selected' : ''}>🔴 MUDDATI O'TGAN</option>
                            </select>
                            ${isAdmin ? `
                            <select id="metro-bolinma-filter" onchange="window.filterDevicesList()" style="padding: 16px 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 14px; outline: none; cursor: pointer; font-size: 0.95rem; font-weight: 700; appearance: none; -webkit-appearance: none; padding-right: 40px; background-image: url('data:image/svg+xml;utf8,<svg fill=%22%2394a3b8%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>'); background-repeat: no-repeat; background-position: right 15px top 50%;">
                                <option value="all" style="background:#0f172a;" ${window.metroBolinmaFilter === 'all' ? 'selected' : ''}>BARCHA BO'LINMALAR</option>
                                ${Object.keys(window.Auth?.roleStructure || {}).filter(rid => rid.startsWith('bolinma') || rid.includes('sex')).map(rid => `
                                    <option value="${rid}" style="background:#0f172a;" ${window.metroBolinmaFilter === rid ? 'selected' : ''}>${window.getBolinmaName(rid).toUpperCase()}</option>
                                `).join('')}
                            </select>
                            ` : ''}
                            <button onclick="SmartUtils.exportToPDF('metro-devices-table-content', 'Metrologiya_Asboblar_Pasporti')" style="padding: 16px 24px; font-size: 0.95rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.1);" onmouseover="this.style.background='#f59e0b'; this.style.color='#000'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(245, 158, 11, 0.1)'; this.style.color='#f59e0b'; this.style.transform='translateY(0)'">
                                <i class="fas fa-file-pdf"></i> PDF EKSPORT
                            </button>
                        </div>
                    </div>
                    <div style="flex: 1; overflow-y: auto; max-height: calc(100vh - 260px); padding-bottom: 20px; border-radius: 20px;" id="metro-devices-table-content">
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
                        <th style="width: 170px; text-align: right;"><i class="fas fa-cogs" style="margin-right:6px; color:#a855f7;"></i> Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredDevices.length > 0 ? filteredDevices.map(d => {
                        const info = getDaysInfo(d);
                        
                        let statusHTML = '';
                        if (info.isShablon) {
                            statusHTML = `
                                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 14px; display: inline-flex; flex-direction: column; gap: 10px; min-width: 220px;">
                                    <div style="display:flex; align-items:center; justify-content:space-between; gap: 15px;">
                                        <span style="font-size:0.65rem; color:#94a3b8; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Qiyoslash (1-yil)</span>
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span class="status-indicator-dot ${info.qiyoslash.statusClass}"></span>
                                            <span class="status-tab ${info.qiyoslash.statusClass}">${info.qiyoslash.statusLabel.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div style="display:flex; align-items:center; justify-content:space-between; gap: 15px;">
                                        <span style="font-size:0.65rem; color:#94a3b8; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Birka (3-oy)</span>
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span class="status-indicator-dot ${info.birka.statusClass}"></span>
                                            <span class="status-tab ${info.birka.statusClass}">${info.birka.statusLabel.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else {
                            statusHTML = `
                                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 14px; display: inline-flex; align-items:center; justify-content:space-between; gap: 20px; min-width: 220px;">
                                    <span style="font-size:0.65rem; color:#94a3b8; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Qiyoslash holati</span>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span class="status-indicator-dot ${info.statusClass}"></span>
                                        <span class="status-tab ${info.statusClass}">${info.qiyoslash.statusLabel.toUpperCase()}</span>
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
                                        <div class="device-name-text">${d.name}</div>
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
                <div class="table-container" style="flex: 1; overflow-y: auto; border-radius: 20px;">
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
                                    <td class="bolinma-name" style="font-weight:800; font-size:1.1rem; color:#fff;">${window.getBolinmaName(s.bolinma_id)}</td>
                                    <td>
                                        <div class="calib-date-wrapper">
                                            <div class="calib-icon" style="background:rgba(56,189,248,0.1); border-color:rgba(56,189,248,0.25); color:#38bdf8;">
                                                <i class="fas fa-calendar"></i>
                                            </div>
                                            <div class="calib-date-text" style="font-size:0.95rem; color:#94a3b8;">${s.date}</div>
                                        </div>
                                    </td>
                                    <td><span class="serial-badge" style="background:rgba(255,255,255,0.05); color:#fff; border-color:rgba(255,255,255,0.1); box-shadow:none;">${(s.currentMonth||0).toLocaleString()}</span></td>
                                    <td><span class="serial-badge" style="background:linear-gradient(135deg,#38bdf8,#0ea5e9); color:#000;">${cons.toLocaleString()} kWh</span></td>
                                    <td><span class="serial-badge" style="background:transparent; color:#10b981; border:1px dashed rgba(16,185,129,0.4); box-shadow:none;">${limit > 0 ? limit.toLocaleString() + ' kWh' : 'Kiritilmagan'}</span></td>
                                    <td>
                                        ${isOverLimit ? 
                                            `<span class="status-tab expired" style="font-size:0.8rem; padding:8px 16px;">LIMITDAN OSHDI</span>` : 
                                            `<span class="status-tab active" style="font-size:0.8rem; padding:8px 16px;">NORMADA</span>`
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
                <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px; flex: 1; margin-top:20px;">
                    <div style="display:flex; flex-direction:column; gap:25px;">
                        <div style="background:linear-gradient(145deg, rgba(30,41,59,0.6), rgba(15,23,42,0.8)); border-radius:24px; padding:30px; border:1px solid rgba(255,255,255,0.05); box-shadow:0 15px 35px rgba(0,0,0,0.3);">
                            <label style="font-size:0.8rem; color:#94a3b8; font-weight:800; letter-spacing:1px; display:block; margin-bottom:15px;"><i class="fas fa-tachometer-alt" style="color:#38bdf8; margin-right:8px;"></i> JORIY HISOBLAGICH KO'RSATKICHI (kWh)</label>
                            <div style="display:flex; gap:12px;">
                                <input type="number" id="metro-elec-current-input" value="${elec.currentMonth || ''}" placeholder="Masalan: 5220" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); padding:16px 20px; border-radius:16px; color:#fff; font-weight:900; font-size:1.3rem; outline:none; min-width:0; box-shadow:inset 0 2px 6px rgba(0,0,0,0.3); transition:0.3s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 3px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='inset 0 2px 6px rgba(0,0,0,0.3)'">
                                <button onclick="window.saveElectricityReading('${viewingBolinmaId}')" style="background:linear-gradient(135deg,#fbbf24,#d97706); color:#000; border:none; padding:0 30px; border-radius:16px; font-weight:900; font-size:1rem; cursor:pointer; transition:0.3s; white-space:nowrap; box-shadow:0 6px 20px rgba(245,158,11,0.3);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">SAQLASH <i class="fas fa-save" style="margin-left:8px;"></i></button>
                            </div>
                            <div style="margin-top:16px; font-size:0.9rem; color:#64748b; font-weight:700;">Oldingi oy yopilish ko'rsatkichi: <b style="color:#e2e8f0; font-family:'JetBrains Mono', monospace; background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:8px; margin-left:6px;">${(elec.lastReading || 0).toLocaleString()} kWh</b></div>
                        </div>

                        ${consumption > 0 ? `
                        <div style="background:linear-gradient(145deg, rgba(56,189,248,0.05), rgba(37,99,235,0.05)); border:1px solid rgba(56,189,248,0.2); border-radius:24px; padding:30px; display:flex; flex-direction:column; gap:20px; box-shadow:inset 0 0 30px rgba(56,189,248,0.05);">
                            <div style="display:flex; align-items:center; gap:20px;">
                                <div style="width:64px; height:64px; background:linear-gradient(135deg, #38bdf8, #2563eb); border-radius:16px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:2rem; flex-shrink:0; box-shadow:0 10px 25px rgba(56,189,248,0.4);"><i class="fas fa-chart-line"></i></div>
                                <div>
                                    <div style="font-size:0.8rem; color:#94a3b8; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Joriy oy iste'moli</div>
                                    <div style="font-size:2.5rem; font-weight:900; color:#fff; line-height:1; font-family:'JetBrains Mono', monospace; margin-top:5px;">${consumption.toLocaleString()} <span style="font-size:1.1rem; color:#38bdf8; font-weight:800;">kWh</span></div>
                                </div>
                            </div>
                            ${window.metrologyLimits[viewingBolinmaId] ? `
                                <div style="margin-top:10px; background:rgba(0,0,0,0.2); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">
                                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:900; color:#94a3b8; margin-bottom:12px; letter-spacing:0.5px;">
                                        <span>LIMIT: <span style="color:#fff;">${window.metrologyLimits[viewingBolinmaId]} kWh</span></span>
                                        <span style="color:${consumption > window.metrologyLimits[viewingBolinmaId] ? '#ef4444' : '#10b981'}; background:${consumption > window.metrologyLimits[viewingBolinmaId] ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'}; padding:4px 10px; border-radius:8px;">${Math.round((consumption/window.metrologyLimits[viewingBolinmaId])*100)}% Ishlatildi</span>
                                    </div>
                                    <div style="height:10px; background:rgba(0,0,0,0.4); border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
                                        <div style="width:${Math.min(100, (consumption/window.metrologyLimits[viewingBolinmaId])*100)}%; height:100%; background:linear-gradient(90deg, ${consumption > window.metrologyLimits[viewingBolinmaId] ? '#ef4444, #b91c1c' : '#10b981, #059669'}); box-shadow:0 0 10px ${consumption > window.metrologyLimits[viewingBolinmaId] ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'};"></div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>` : ''}
                    </div>

                    <div style="background:linear-gradient(145deg, rgba(30,41,59,0.6), rgba(15,23,42,0.8)); border:1px solid rgba(255,255,255,0.05); border-radius:24px; padding:35px; display:flex; flex-direction:column; justify-content:center; gap:25px; box-shadow:0 15px 35px rgba(0,0,0,0.3);">
                        <h3 style="margin-top:0; font-size:1.3rem; font-weight:900; display:flex; align-items:center; gap:12px; color:#fff;"><i class="fas fa-shield-alt" style="color:#10b981; font-size:1.5rem;"></i> Xavfsizlik va Limit holati</h3>
                        ${consumption > (window.metrologyLimits[viewingBolinmaId] || 999999) ? `
                        <div style="background:linear-gradient(145deg, rgba(239,68,68,0.1), rgba(153,27,27,0.1)); border:1px solid rgba(239,68,68,0.3); border-radius:20px; padding:30px; display:flex; gap:20px; box-shadow:inset 0 0 20px rgba(239,68,68,0.1);">
                            <div style="width:60px; height:60px; background:linear-gradient(135deg, #ef4444, #b91c1c); border-radius:16px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.8rem; flex-shrink:0; box-shadow:0 10px 20px rgba(239,68,68,0.4);"><i class="fas fa-skull-crossbones"></i></div>
                            <div>
                                <div style="color:#ef4444; font-weight:900; font-size:1.2rem; letter-spacing:0.5px;">Limitdan oshib ketildi!</div>
                                <div style="color:#94a3b8; font-size:0.9rem; margin-top:8px; line-height:1.5; font-weight:600;">Belgilangan oylik limitdan oshib ketildi. Iltimos, elektr sarfini tejamkorlik rejimiga o'tkazing va qo'shimcha chora-tadbirlar ko'ring.</div>
                            </div>
                        </div>` : `
                        <div style="background:linear-gradient(145deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border:1px solid rgba(16,185,129,0.3); border-radius:20px; padding:30px; display:flex; gap:20px; box-shadow:inset 0 0 20px rgba(16,185,129,0.1);">
                            <div style="width:60px; height:60px; background:linear-gradient(135deg, #10b981, #059669); border-radius:16px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.8rem; flex-shrink:0; box-shadow:0 10px 20px rgba(16,185,129,0.4);"><i class="fas fa-leaf"></i></div>
                            <div>
                                <div style="color:#10b981; font-weight:900; font-size:1.2rem; letter-spacing:0.5px;">Energiya tejash tartibida</div>
                                <div style="color:#94a3b8; font-size:0.9rem; margin-top:8px; line-height:1.5; font-weight:600;">Joriy oyda elektr iste'moli normada va limit doirasida saqlanmoqda. Barcha ko'rsatkichlar barqaror.</div>
                            </div>
                        </div>`}
                    </div>
                </div>
            `;
        }

        modal.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(25px); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 25px 40px; display: flex; justify-content: center; position: relative;">
                <div class="metro-table-wrapper" style="display:flex; justify-content:center; align-items:center;">
                    <h2 style="color: #f8fafc; font-size: 1.6rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px; margin:0;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #38bdf8, #0ea5e9); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(56,189,248,0.3);">
                            <i class="fas fa-bolt" style="color: #fff; font-size: 1.3rem;"></i> 
                        </div>
                        ELEKTR MONITORI 
                        <span style="font-size: 0.9rem; color: #94a3b8; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 8px;">${isAdmin ? '(Markaziy)' : `(${window.getBolinmaName(viewingBolinmaId)})`}</span>
                    </h2>
                </div>
                <div style="position: absolute; right: 40px; top: 50%; transform: translateY(-50%); display: flex; gap: 15px; align-items: center;">
                    <button onclick="document.getElementById('metro-electricity-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 12px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.transform='rotate(0)'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="background: radial-gradient(circle at top left, #0b0f19, #030712); padding: 30px; height: calc(100% - 100px); box-sizing: border-box; display: flex; flex-direction: column; overflow-y: auto;">
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
            <div style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(25px); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 25px 40px; display: flex; justify-content: center;">
                <div class="metro-table-wrapper" style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="color: #f8fafc; font-size: 1.6rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px; margin:0;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(16,185,129,0.3);">
                            <i class="fas fa-chart-line" style="color: #fff; font-size: 1.3rem;"></i> 
                        </div>
                        ISTE'MOL TAHLILI 
                        <span style="font-size: 0.9rem; color: #94a3b8; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 8px;">${isAdmin ? '(Markaziy)' : `(${window.getBolinmaName(viewingBolinmaId)})`}</span>
                    </h2>
                    <button onclick="document.getElementById('metro-charts-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 12px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.transform='rotate(0)'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="background: radial-gradient(circle at top left, #0b0f19, #030712); padding: 30px; height: calc(100% - 100px); box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
                <div class="metro-table-wrapper" style="flex: 1;">
                    <div style="background: rgba(30,41,59,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; flex: 1; position: relative; height: 100%; min-height: 400px; box-shadow: 0 15px 40px rgba(0,0,0,0.3);">
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
            <div style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(25px); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 25px 40px; display: flex; justify-content: center;">
                <div class="metro-table-wrapper" style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="color: #f8fafc; font-size: 1.6rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px; margin:0;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ef4444, #b91c1c); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(239,68,68,0.3);">
                            <i class="fas fa-sliders-h" style="color: #fff; font-size: 1.3rem;"></i> 
                        </div>
                        LIMIT SOZLAMALARI 
                        <span style="font-size: 0.9rem; color: #94a3b8; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 8px;">(ADMIN)</span>
                    </h2>
                    <button onclick="document.getElementById('metro-limits-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 12px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.transform='rotate(0)'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="background: radial-gradient(circle at top left, #0b0f19, #030712); padding: 30px; height: calc(100% - 100px); box-sizing: border-box; display: flex; flex-direction: column; overflow-y: auto;">
                <div class="metro-table-wrapper">
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:20px; padding-top:10px;">
                        ${Object.keys(window.Auth?.roleStructure || {}).filter(rid => rid.startsWith('bolinma') || rid.includes('sex')).map(rid => `
                            <div style="background:linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8)); padding:24px; border-radius:20px; border:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:12px; box-shadow:0 10px 25px rgba(0,0,0,0.2); transition:0.3s;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='rgba(56,189,248,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.05)'">
                                <div style="font-size:0.9rem; color:#f8fafc; font-weight:800; letter-spacing:0.5px;">${window.getBolinmaName(rid).toUpperCase()}</div>
                                <div style="display:flex; gap:10px; margin-top:5px;">
                                    <input type="number" id="limit-val-${rid}" value="${window.metrologyLimits[rid] || ''}" placeholder="Oylik kWh..." style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); padding:12px 16px; border-radius:12px; color:#fff; font-weight:900; font-size:1rem; outline:none; transition:0.3s;" onfocus="this.style.borderColor='#38bdf8'">
                                    <button onclick="window.saveMetrologyLimit('${rid}')" style="background:linear-gradient(135deg, #38bdf8, #0ea5e9); border:none; border-radius:12px; padding:0 20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.3s; box-shadow:0 4px 15px rgba(56,189,248,0.3);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><i class="fas fa-save" style="color:#000; font-size:1.1rem;"></i></button>
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
                bCont.style.display = n.includes('shablon') ? 'block' : 'none';
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
                    <input type="text" id="metro-edit-dev-name" value="${dev.name}" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);padding:12px 16px;border-radius:12px;color:#fff;font-weight:700;font-size:0.9rem;outline:none;box-sizing:border-box;">
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
                    bCont.style.display = eName.value.toLowerCase().includes('shablon') ? 'block' : 'none';
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
            SmartUtils.showToast("Asbob ma'lumotlari yangilandi", 'success');
            window.refreshMetrologyViews();
        } catch (e) {
            SmartUtils.showToast("Yangilashda xato yuz berdi", "error");
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
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            borderColor: '#10b981',
                            borderWidth: 4,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#10b981',
                            pointRadius: 6,
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        },
                        {
                            label: "Limit (kWh)",
                            data: limits,
                            borderColor: 'rgba(239, 68, 68, 0.8)',
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
                        legend: { labels: { color: '#e2e8f0', font: {size: 14, weight: 'bold'} } },
                        tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleFont: {size:14}, bodyFont: {size:14} }
                    },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: {size:12, weight:'bold'} } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: {size:12, weight:'bold'} } }
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
                max-width: 1250px;
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
                border-spacing: 0 16px;
                margin-top: 10px;
            }
            .metro-table th {
                text-align: left;
                padding: 0 24px 10px;
                font-size: 0.72rem;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                font-weight: 800;
                border-bottom: none;
                background: transparent;
            }
            .metro-table tbody tr {
                background: linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
                backdrop-filter: blur(15px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            .metro-table tbody tr:hover {
                transform: translateY(-5px) scale(1.01);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(56, 189, 248, 0.2);
                background: linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%);
            }
            .metro-table td {
                padding: 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.04);
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                vertical-align: middle;
                color: #f8fafc;
            }
            .metro-table td:first-child {
                border-left: 1px solid rgba(255, 255, 255, 0.04);
                border-top-left-radius: 20px;
                border-bottom-left-radius: 20px;
            }
            .metro-table td:last-child {
                border-right: 1px solid rgba(255, 255, 255, 0.04);
                border-top-right-radius: 20px;
                border-bottom-right-radius: 20px;
                text-align: right;
            }

            /* Device details */
            .device-name-container {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .device-icon-wrapper {
                width: 56px;
                height: 56px;
                border-radius: 16px;
                background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(37, 99, 235, 0.15));
                border: 1px solid rgba(56, 189, 248, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #38bdf8;
                font-size: 1.5rem;
                flex-shrink: 0;
                box-shadow: inset 0 0 15px rgba(56, 189, 248, 0.1);
            }
            .device-name-text {
                font-size: 1.15rem;
                font-weight: 900;
                color: #fff;
                letter-spacing: 0.5px;
            }
            .device-type-subtitle {
                font-size: 0.75rem;
                color: #94a3b8;
                font-weight: 700;
                text-transform: uppercase;
                margin-top: 4px;
                letter-spacing: 1px;
            }

            /* Serial badge */
            .serial-badge {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: #000;
                padding: 8px 16px;
                border-radius: 12px;
                font-family: 'JetBrains Mono', monospace;
                font-weight: 900;
                font-size: 0.95rem;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .bolinma-name{font-weight:700;color:#38bdf8;}
            .status-badge{padding:6px 12px;border-radius:20px;font-size:0.68rem;font-weight:900;text-transform:uppercase;}
            .status-badge.active{background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.25);}
            .empty-state{text-align:center;padding:40px;color:#475569;font-style:italic;}
            
            /* Status Tabs */
            .status-tab {
                font-size: 0.75rem;
                font-weight: 900;
                padding: 6px 14px;
                border-radius: 8px;
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
                width: 42px;
                height: 42px;
                border-radius: 12px;
                border: 1px solid transparent;
                background: transparent;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .metro-action-btn i {
                font-size: 1.1rem;
            }
            .metro-action-btn.recal { color: #10b981; }
            .metro-action-btn.recal:hover {
                background: #10b981; color: #fff; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); transform: translateY(-3px);
            }
            .metro-action-btn.edit { color: #f59e0b; }
            .metro-action-btn.edit:hover {
                background: #f59e0b; color: #fff; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); transform: translateY(-3px);
            }
            .metro-action-btn.del { color: #ef4444; }
            .metro-action-btn.del:hover {
                background: #ef4444; color: #fff; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); transform: translateY(-3px);
            }

            /* Traffic Light Pulsing Dots */
            .status-indicator-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                display: inline-block;
                flex-shrink: 0;
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

            .calib-date-wrapper {
                display: flex;
                align-items: center;
                gap: 14px;
            }
            .calib-icon {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #10b981;
                font-size: 1.2rem;
            }
            .calib-date-text {
                font-weight: 800;
                color: #f8fafc;
                font-size: 1.05rem;
            }
            .calib-days-ago {
                font-size: 0.75rem;
                color: #94a3b8;
                margin-top: 3px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
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
