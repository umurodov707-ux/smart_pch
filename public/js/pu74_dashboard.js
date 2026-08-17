/**
 * PU-74 DASHBOARD — Economy Department (Iqtisod Bo'limi)
 * Management and Analytics for PU-74 Reports
 */

const PU74Dashboard = {
    // Current state
    brigades: ['1-BRIGADA', '2-BRIGADA', '3-BRIGADA'],
    files: ['1-brigada.xlsx', '2-brigada.xlsx', '3-brigada.xlsx'],
    
    // Bu dashboard faqat Iqtisodiyot bo'limi nuqtai nazaridan saqlangan
    // PU-74 nusxalarini ko'rsatadi — pu74.js shu bo'lim uchun ishlatadigan
    // getPU74LocalKey() kalit formatiga mos kelishi shart.
    dept: 'iqtisod',

    /**
     * Main entry point for the dashboard
     */
    open: function() {
        const content = document.getElementById('mainContent');
        if (!content) return;

        pu74CurrentDept = this.dept;
        content.innerHTML = this.renderTemplate();
        this.updateStatus();
    },

    localKey: function(prefix, file) {
        return prefix + '_' + this.dept + '_' + file;
    },

    /**
     * Render the dashboard HTML
     */
    renderTemplate: function() {
        return `
            <div class="pu74-dash-container" style="padding: 30px; font-family: 'Inter', sans-serif;">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid rgba(212, 175, 55, 0.3); padding-bottom: 20px;">
                    <div>
                        <h2 style="margin: 0; font-size: 2.5rem; background: linear-gradient(45deg, #fff, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; letter-spacing: 1px;">
                            <i class="fas fa-chart-pie" style="color:#ffd700; -webkit-text-fill-color: initial;"></i> IQTISODIYOT TAHLILI — PU-74
                        </h2>
                        <p style="color: #94a3b8; margin: 5px 0 0 0; font-weight: 600;">Brigadalar hisobotlarini monitoring qilish va tasdiqlash markazi</p>
                    </div>
                    <div style="display:flex; gap: 15px;">
                        <button onclick="PU74Dashboard.refresh()" class="pu74-dash-btn" style="background:rgba(212, 175, 55, 0.1); border:1px solid rgba(212, 175, 55, 0.3); color:#ffd700; padding:12px 25px; border-radius:15px; cursor:pointer; font-weight:700; transition:0.3s;">
                            <i class="fas fa-sync-alt"></i> YANGILASH
                        </button>
                        <button onclick="PU74Dashboard.viewSummary()" class="pu74-dash-btn" style="background:linear-gradient(135deg, #d4af37, #b8860b); border:none; color:#000; padding:12px 25px; border-radius:15px; cursor:pointer; font-weight:800; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);">
                            <i class="fas fa-list-check"></i> UMUMIY HISOBOT
                        </button>
                    </div>
                </div>

                <div class="pu74-dash-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 25px;">
                    ${this.brigades.map((b, i) => this.renderBrigadeCard(b, this.files[i])).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render a single brigade card
     */
    renderBrigadeCard: function(name, file) {
        const edits = JSON.parse(localStorage.getItem(this.localKey('pu74_edits', file)) || '{}');
        const signs = JSON.parse(localStorage.getItem(this.localKey('pu74_signs', file)) || '{}');
        const hasEdits = Object.keys(edits).length > 0;
        const signCount = Object.keys(signs).length;
        
        let statusColor = '#94a3b8';
        let statusText = 'KUTILMOQDA';
        let statusIcon = 'fa-clock';
        
        if (signCount >= 4) {
            statusColor = '#10b981';
            statusText = 'TASDIQLANGAN';
            statusIcon = 'fa-check-double';
        } else if (hasEdits || signCount > 0) {
            statusColor = '#f59e0b';
            statusText = 'JARAYONDA';
            statusIcon = 'fa-pen-clip';
        }

        return `
            <div class="pu74-card" style="background:rgba(30, 41, 59, 0.5); border:1px solid rgba(212, 175, 55, 0.15); border-radius:24px; padding:30px; backdrop-filter:blur(20px); transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); cursor:pointer;" onmouseover="this.style.transform='translateY(-10px)';this.style.borderColor='rgba(212, 175, 55, 0.4)';this.style.boxShadow='0 20px 40px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='none';this.style.borderColor='rgba(212, 175, 55, 0.15)';this.style.boxShadow='none'">
                <div style="display:flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
                    <div style="width:60px; height:60px; border-radius:18px; background:rgba(212, 175, 55, 0.1); border:1px solid rgba(212, 175, 55, 0.3); display:flex; align-items:center; justify-content:center; color:#ffd700; font-size:1.8rem;">
                        <i class="fas fa-users-gear"></i>
                    </div>
                    <div style="background:${statusColor}20; color:${statusColor}; padding:6px 15px; border-radius:30px; font-size:0.75rem; font-weight:900; letter-spacing:1px; border:1px solid ${statusColor}40;">
                        <i class="fas ${statusIcon}"></i> ${statusText}
                    </div>
                </div>
                
                <h3 style="margin: 0 0 10px 0; font-size: 1.5rem; color: #fff; font-weight: 800;">${name}</h3>
                <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:25px;">
                    <div style="display:flex; align-items:center; gap:10px; color:#94a3b8; font-size:0.9rem;">
                        <i class="fas fa-calendar-day" style="width:15px;"></i>
                        <span>Oylik hisobot: ${new Date().toLocaleDateString('uz-UZ', {month: 'long', year: 'numeric'})}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; color:#94a3b8; font-size:0.9rem;">
                        <i class="fas fa-signature" style="width:15px;"></i>
                        <span>Imzolar: <b style="color:#ffd700;">${signCount} / 4</b></span>
                    </div>
                </div>
                
                <div style="display:flex; gap:12px;">
                    <button onclick="loadPU74Brigade('${file}', '${name}')" style="flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; padding:12px; border-radius:14px; cursor:pointer; font-weight:700; transition:0.2s;" onmouseover="this.style.background='rgba(59, 130, 246, 0.1)';this.style.borderColor='rgba(59, 130, 246, 0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.05)';this.style.borderColor='rgba(255,255,255,0.1)'">
                        <i class="fas fa-eye"></i> KO'RISH
                    </button>
                    ${statusText === 'TASDIQLANGAN' ? `
                    <button onclick="PU74Dashboard.downloadXLS('${file}')" style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); color:#10b981; width:50px; border-radius:14px; cursor:pointer;">
                        <i class="fas fa-download"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Tasdiqlangan jurnalni yuklab olish uchun ochish
     * (pu74.js hozircha faylni fon rejimida, ko'rinishsiz eksport qilish
     * imkonini bermaydi — shu sabab jurnal ochiladi, u yerda "CHOP ETISH"
     * orqali saqlash mumkin)
     */
    downloadXLS: function(file) {
        const brigade = this.brigades[this.files.indexOf(file)] || file;
        loadPU74Brigade(file, brigade);
        if (window.SmartUtils) SmartUtils.showToast("Jurnal ochildi — \"CHOP ETISH\" tugmasi orqali saqlashingiz mumkin", "info");
    },

    /**
     * Placeholder for summary view
     */
    viewSummary: function() {
        if (window.SmartUtils) SmartUtils.showToast("Umumlashtirilgan tahlil oynasi shakllantirilmoqda...", "info");
        // Logic for collating data would go here
    },

    refresh: function() {
        this.open();
    },

    updateStatus: function() {
        // Any periodic status updates
    }
};

window.PU74Dashboard = PU74Dashboard;
