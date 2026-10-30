/**
 * PRESENTATION Layer: Infrastructure Passport Modal
 */

const ModernInfrastructure = {
    open: async function() {
        const modalId = 'modern-infrastructure-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const currentUser = window.Auth.currentUser;
        const canEdit = !!currentUser; // Everyone can add assets

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'department-window active';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 90%; max-width: 1200px; height: 85vh;
            z-index: 10002; display: flex; flex-direction: column;
            background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);
            border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        `;

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, rgba(16, 185, 129, 0.1), transparent); padding: 25px 35px; border-bottom: 1px solid rgba(16, 185, 129, 0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 50px; height: 50px; background: rgba(16, 185, 129, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(16, 185, 129, 0.2);">
                        <i class="fas fa-file-invoice" style="font-size: 1.5rem; color: #10b981;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.6rem; color: #fff; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">INFRATUZILMA <span style="color: #10b981; font-weight: 400;">PASPORTI</span></h2>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Arxitektura: Clean Setup | Raqamli Pasport</div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div style="position: relative;">
                        <input type="text" id="infra-search" oninput="ModernInfrastructure.filterData()" placeholder="Obyekt yoki KM bo'yicha qidiruv..." style="padding: 10px 15px 10px 35px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 0.85rem; width: 250px;">
                        <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.3); font-size: 0.8rem;"></i>
                    </div>
                    <button onclick="ModernInfrastructure.export()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                        <i class="fas fa-file-excel" style="color: #10b981;"></i> EXCEL
                    </button>
                    ${canEdit ? `
                        <button onclick="ModernInfrastructure.toggleAddForm()" style="background: #10b981; border: none; color: #fff; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; transition: 0.3s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                            <i class="fas fa-plus"></i> OBYEKT QO'SHISH
                        </button>
                    ` : ''}
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: rgba(255, 255, 255, 0.05); border: none; color: #fff; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="padding: 35px; flex: 1; overflow-y: auto;">
                
                <!-- Add Form -->
                ${canEdit ? `
                <div id="infra-add-form" style="display: none; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 20px; padding: 25px; margin-bottom: 30px; animation: slideDown 0.3s ease-out;">
                    <h3 style="color: #10b981; margin-top: 0; margin-bottom: 20px; font-size: 1.1rem; text-transform: uppercase;">Yangi infratuzilma obyekti</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <select id="i-bolinma" style="padding: 12px; background: rgba(0,0,10,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                            ${(window.subdivisions || []).map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}
                        </select>
                        <input type="text" id="i-name" placeholder="Obyekt nomi" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <select id="i-type" style="padding: 12px; background: rgba(0,0,10,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                            <option value="bridge">Ko'prik</option>
                            <option value="station">Stansiya</option>
                            <option value="track">Yo'l qismi</option>
                            <option value="tunnel">Tunnel</option>
                            <option value="culvert">Truba</option>
                        </select>
                        <input type="text" id="i-km" placeholder="KM" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <input type="date" id="i-date" placeholder="O'rnatilgan sana" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button onclick="ModernInfrastructure.toggleAddForm()" style="padding: 10px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 10px; cursor: pointer;">BEKOR QILISH</button>
                        <button onclick="ModernInfrastructure.save()" style="padding: 10px 25px; background: #10b981; border: none; color: #fff; border-radius: 10px; cursor: pointer; font-weight: bold;">SAQLASH</button>
                    </div>
                </div>
                ` : ''}

                <div id="infra-loader" style="text-align: center; color: #10b981; padding: 50px;"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
                <div id="infra-actual-content" style="display: none; flex-direction: column; gap: 30px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;" id="infra-grid-container">
                        <!-- Assets injected here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        await this.loadData();
    },

    toggleAddForm: function() {
        const form = document.getElementById('infra-add-form');
        if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    },

    save: async function() {
        const bolinmaId = document.getElementById('i-bolinma').value;
        const name = document.getElementById('i-name').value;
        const type = document.getElementById('i-type').value;
        const km = document.getElementById('i-km').value;
        const date = document.getElementById('i-date').value;

        if (!name || !km) {
            alert('Iltimos ma\'mulotlarni to\'ldiring');
            return;
        }

        try {
            await ModernizationRepo.saveInfrastructureAsset({
                name,
                asset_type: type,
                specification: '', // Leaving empty for now
                install_date: date || new Date().toISOString().split('T')[0],
                next_repair_date: '',
                km,
                pk: 1,
                bolinma_id: bolinmaId
            });
            this.toggleAddForm();
            await this.loadData();
            if (window.showToast) window.showToast('Obyekt saqlandi', 'success');
        } catch (error) {
            console.error('Infra save error:', error);
            alert('Xatolik yuz berdi');
        }
    },

    loadData: async function() {
        try {
            const data = await ModernizationRepo.getInfrastructureAssets();
            this.allData = data;
            
            if (document.getElementById('infra-loader')) document.getElementById('infra-loader').style.display = 'none';
            if (document.getElementById('infra-actual-content')) document.getElementById('infra-actual-content').style.display = 'flex';

            this.renderGrid(data);
        } catch (error) {
            console.error('Infra fetch error:', error);
        }
    },

    renderGrid: function(data) {
        const container = document.getElementById('infra-grid-container');
        if (!container) return;
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = '<div style="text-align: center; opacity: 0.5; grid-column: 1/-1; padding: 50px;">Obyektlar topilmadi.</div>';
            return;
        }

        data.forEach(asset => {
            const div = document.createElement('div');
            div.style.cssText = `
                background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 12px;
                transition: transform 0.3s, background 0.3s; cursor: pointer;
            `;
            div.onmouseover = () => { div.style.background = 'rgba(16, 185, 129, 0.05)'; div.style.transform = 'translateY(-5px)'; };
            div.onmouseout = () => { div.style.background = 'rgba(255,255,255,0.03)'; div.style.transform = 'translateY(0)'; };
            
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; background: rgba(16, 185, 129, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #10b981;">
                        <i class="fas ${this.getIcon(asset.asset_type)}"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0; color: #fff; font-size: 0.95rem;">${escapeHtml(asset.name)}</h4>
                        <div style="font-size: 0.8rem; color: #10b981; font-weight: 600;">KM: ${asset.km}</div>
                    </div>
                </div>
                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); display: flex; justify-content: space-between;">
                    <span>Turi: ${asset.asset_type.toUpperCase()}</span>
                    <span>${asset.install_date || '-'}</span>
                </div>
            `;
            container.appendChild(div);
        });
    },

    getIcon: function(type) {
        switch(type) {
            case 'bridge': return 'fa-bridge';
            case 'tunnel': return 'fa-archway';
            case 'station': return 'fa-train';
            case 'culvert': return 'fa-circle-notch';
            default: return 'fa-tools';
        }
    },

    filterData: function() {
        const query = document.getElementById('infra-search').value.toLowerCase();
        if (!this.allData) return;
        
        const filtered = this.allData.filter(a => 
            (a.name && a.name.toLowerCase().includes(query)) || 
            (a.km && a.km.toString().includes(query)) ||
            (a.asset_type && a.asset_type.toLowerCase().includes(query))
        );
        this.renderGrid(filtered);
    },

    export: function() {
        if (!this.allData || this.allData.length === 0) return alert('Eksport uchun ma\'lumot yo\'q');
        SmartReporting.exportToExcel(this.allData, 'Infratuzilma_Pasporti.xlsx');
    }
};

window.ModernInfrastructure = ModernInfrastructure;

window.ModernInfrastructure = ModernInfrastructure;
