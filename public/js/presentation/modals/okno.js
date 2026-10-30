/**
 * PRESENTATION Layer: OKNO Modal
 */

const ModernOKNO = {
    open: async function() {
        const modalId = 'modern-okno-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const currentUser = window.Auth.currentUser;
        const isDispetcher = currentUser && (currentUser.username === 'dispetcher' || currentUser.role === 'admin');

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'department-window active';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 90%; max-width: 1200px; height: 85vh;
            z-index: 10002; display: flex; flex-direction: column;
            background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);
            border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        `;

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent); padding: 25px 35px; border-bottom: 1px solid rgba(139, 92, 246, 0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 50px; height: 50px; background: rgba(139, 92, 246, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(139, 92, 246, 0.2);">
                        <i class="fas fa-calendar-check" style="font-size: 1.5rem; color: #a78bfa;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.6rem; color: #fff; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">"OKNO" <span style="color: #a78bfa; font-weight: 400;">REJALASHTIRISH TIZIMI</span></h2>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Arxitektura: Clean Setup | ${isDispetcher ? 'Dispetcher Nazorati' : 'Bo\'linma Talabnomasi'}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <button onclick="ModernOKNO.toggleAddForm()" style="background: #8b5cf6; border: none; color: #fff; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-plus"></i> ${isDispetcher ? 'REJALASHTIRISH' : 'TALABNOMA YUBORISH'}
                    </button>
                    <button onclick="ModernOKNO.export()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-file-excel" style="color: #10b981;"></i> EXCEL
                    </button>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: rgba(255, 255, 255, 0.05); border: none; color: #fff; width: 40px; height: 40px; border-radius: 12px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="padding: 35px; flex: 1; overflow-y: auto;">
                
                <!-- Add Form -->
                <div id="okno-add-form" style="display: none; background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
                    <h3 style="color: #a78bfa; margin-top: 0; margin-bottom: 20px; font-size: 1.1rem; text-transform: uppercase;">
                        ${isDispetcher ? 'Yangi OKNO rejasini kiritish' : 'Yangi OKNO uchun talabnoma yuborish'}
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        ${isDispetcher ? `
                        <select id="o-bolinma" style="padding: 12px; background: rgba(0,0,10,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                            ${(window.subdivisions || []).map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}
                        </select>
                        ` : ''}
                        <input type="text" id="o-title" placeholder="Ish nomi / Sababi" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <input type="text" id="o-km" placeholder="KM / PK" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <input type="datetime-local" id="o-start" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <input type="datetime-local" id="o-end" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button onclick="ModernOKNO.toggleAddForm()" style="padding: 10px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 10px;">BEKOR QILISH</button>
                        <button onclick="ModernOKNO.save()" style="padding: 10px 25px; background: #8b5cf6; border: none; color: #fff; border-radius: 10px; font-weight: bold;">
                            ${isDispetcher ? 'TASDIQLASH' : 'YUBORISH'}
                        </button>
                    </div>
                </div>

                <div id="okno-loader" style="text-align: center; color: #a78bfa; padding: 50px;"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
                
                <div id="okno-actual-content" style="display: none; flex-direction: column; gap: 30px;">
                    <!-- Tabs for Dispetcher -->
                    ${isDispetcher ? `
                    <div style="display: flex; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
                        <button onclick="ModernOKNO.switchTab('active')" id="tab-active" style="padding: 10px 20px; background: rgba(139, 92, 246, 0.1); border: none; color: #a78bfa; border-radius: 8px; cursor: pointer; font-weight: bold;">TASDIQLANGANLAR</button>
                        <button onclick="ModernOKNO.switchTab('requested')" id="tab-requested" style="padding: 10px 20px; background: transparent; border: none; color: rgba(255,255,255,0.5); border-radius: 8px; cursor: pointer; font-weight: bold;">TALABNOMALAR <span id="req-count" style="background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; margin-left: 5px;">0</span></button>
                    </div>
                    ` : ''}

                    <div id="okno-list" style="display: flex; flex-direction: column; gap: 15px;">
                         <!-- Items injected here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentTab = 'active';
        await this.loadData();
    },

    toggleAddForm: function() {
        const form = document.getElementById('okno-add-form');
        if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    },

    switchTab: function(tab) {
        this.currentTab = tab;
        document.getElementById('tab-active').style.background = tab === 'active' ? 'rgba(139, 92, 246, 0.1)' : 'transparent';
        document.getElementById('tab-active').style.color = tab === 'active' ? '#a78bfa' : 'rgba(255,255,255,0.5)';
        document.getElementById('tab-requested').style.background = tab === 'requested' ? 'rgba(139, 92, 246, 0.1)' : 'transparent';
        document.getElementById('tab-requested').style.color = tab === 'requested' ? '#a78bfa' : 'rgba(255,255,255,0.5)';
        this.renderList();
    },

    save: async function() {
        const currentUser = window.Auth.currentUser;
        const isDispetcher = currentUser && (currentUser.username === 'dispetcher' || currentUser.role === 'admin');
        
        const title = document.getElementById('o-title').value;
        const km = document.getElementById('o-km').value;
        const start = document.getElementById('o-start').value;
        const end = document.getElementById('o-end').value;
        const bolinmaId = isDispetcher ? document.getElementById('o-bolinma').value : currentUser.bolinmalar[0];

        if (!title || !start) {
            alert('Iltimos ma\'lumotlarni to\'ldiring');
            return;
        }

        try {
            await ModernizationRepo.saveOKNO({
                title, km, start_time: start, end_time: end,
                type: 'operativ', resources: '{}',
                bolinma_id: bolinmaId,
                status: isDispetcher ? 'planned' : 'requested'
            });
            this.toggleAddForm();
            await this.loadData();
            if (window.showToast) window.showToast('Muvaffaqiyatli bajarildi', 'success');
        } catch (error) {
            console.error('OKNO save error:', error);
            alert('Xatolik yuz berdi');
        }
    },

    loadData: async function() {
        try {
            this.allData = await ModernizationRepo.getOKNOPlans();
            if (document.getElementById('okno-loader')) document.getElementById('okno-loader').style.display = 'none';
            if (document.getElementById('okno-actual-content')) document.getElementById('okno-actual-content').style.display = 'flex';
            
            const reqCount = this.allData.filter(d => d.status === 'requested').length;
            const reqCountEl = document.getElementById('req-count');
            if (reqCountEl) reqCountEl.textContent = reqCount;

            this.renderList();
        } catch (error) {
            console.error('OKNO fetch error:', error);
        }
    },

    renderList: function() {
        const container = document.getElementById('okno-list');
        if (!container) return;
        container.innerHTML = '';

        const currentUser = window.Auth.currentUser;
        const isDispetcher = currentUser && (currentUser.username === 'dispetcher' || currentUser.role === 'admin');

        let filtered = this.allData;
        if (isDispetcher) {
            filtered = this.allData.filter(d => this.currentTab === 'active' ? d.status !== 'requested' : d.status === 'requested');
        } else {
            // Bolinma sees all planned + their own requested
            filtered = this.allData.filter(d => d.status !== 'requested' || d.bolinma_id === (currentUser.bolinmalar[0]));
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align: center; opacity: 0.5; padding: 50px;">Ma\'lumotlar mavjud emas</div>';
            return;
        }

        filtered.forEach(item => {
            const isRequested = item.status === 'requested';
            const div = document.createElement('div');
            div.style.cssText = `
                background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
                border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center;
                transition: 0.3s;
            `;
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: ${isRequested ? '#ef4444' : '#10b981'}; box-shadow: 0 0 10px ${isRequested ? '#ef4444' : '#10b981'};"></div>
                    <div>
                        <div style="color: #fff; font-weight: bold; font-size: 1rem;">${escapeHtml(item.title)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5);">${item.km || '-'} KM | Bo'linma: ${item.bolinma_id}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 25px;">
                    <div style="text-align: right;">
                        <div style="color: #a78bfa; font-weight: 800; font-size: 0.9rem;">${new Date(item.start_time).toLocaleString()}</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">Muddat: 2 soat</div>
                    </div>
                    ${isDispetcher && isRequested ? `
                        <button onclick="ModernOKNO.approve(${item.id})" style="padding: 8px 15px; background: #10b981; border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.8rem;">TASDIQLASH</button>
                    ` : ''}
                </div>
            `;
            container.appendChild(div);
        });
    },

    approve: async function(id) {
        try {
            await ApiClient.post(`/api/okno/${id}/status`, { status: 'planned' }); // Status update route
            if (window.showToast) window.showToast('OKNO tasdiqlandi', 'success');
            await this.loadData();
        } catch (error) {
            console.error('Approve error:', error);
            alert('Xatolik yuz berdi');
        }
    },

    export: function() {
        if (!this.allData || this.allData.length === 0) return alert('Eksport uchun ma\'lumot yo\'q');
        SmartReporting.exportToExcel(this.allData, 'OKNO_Rejasi.xlsx');
    }
};

window.ModernOKNO = ModernOKNO;
