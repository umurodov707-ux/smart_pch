/**
 * PRESENTATION Layer: Sand Analysis Modal
 */

const ModernSand = {
    open: async function() {
        const modalId = 'modern-sand-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const currentUser = window.Auth.currentUser;
        const canEdit = !!currentUser; // Everyone can enter sand reports

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'department-window active';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 90%; max-width: 1200px; height: 85vh;
            z-index: 10002; display: flex; flex-direction: column;
            background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);
            border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        `;

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, rgba(245, 158, 11, 0.1), transparent); padding: 25px 35px; border-bottom: 1px solid rgba(245, 158, 11, 0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 50px; height: 50px; background: rgba(245, 158, 11, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(245, 158, 11, 0.2);">
                        <i class="fas fa-wind" style="font-size: 1.5rem; color: #f59e0b;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.6rem; color: #fff; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">QUM BOSISHI <span style="color: #f59e0b; font-weight: 400;">TAHLILI</span></h2>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Arxitektura: Clean Setup | Monitoring</div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <button onclick="ModernSand.export()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                        <i class="fas fa-file-excel" style="color: #10b981;"></i> EXCEL
                    </button>
                    ${canEdit ? `
                        <button onclick="ModernSand.toggleAddForm()" style="background: #f59e0b; border: none; color: #1a2a3a; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; transition: 0.3s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);">
                            <i class="fas fa-plus"></i> TAHLIL KIRITISH
                        </button>
                    ` : ''}
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: rgba(255, 255, 255, 0.05); border: none; color: #fff; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="padding: 35px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 30px;">
                
                <!-- Add Form -->
                ${canEdit ? `
                <div id="sand-add-form" style="display: none; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 20px; padding: 25px; animation: slideDown 0.3s ease-out;">
                    <h3 style="color: #f59e0b; margin-top: 0; margin-bottom: 20px; font-size: 1.1rem; text-transform: uppercase;">Yangi qum tahlili hisoboti</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <input type="text" id="s-loc" placeholder="Joy nomi" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <select id="s-bolinma" style="padding: 12px; background: rgba(0,0,10,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                            ${(window.subdivisions || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                        <input type="text" id="s-km-start" placeholder="KM Start" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <input type="text" id="s-km-end" placeholder="KM End" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <select id="s-risk" style="padding: 12px; background: rgba(0,0,10,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                            <option value="low">PAST</option>
                            <option value="medium">O'RTA</option>
                            <option value="high">YUQORI</option>
                        </select>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button onclick="ModernSand.toggleAddForm()" style="padding: 10px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 10px; cursor: pointer;">BEKOR QILISH</button>
                        <button onclick="ModernSand.save()" style="padding: 10px 25px; background: #f59e0b; border: none; color: #1a2a3a; border-radius: 10px; cursor: pointer; font-weight: bold;">SAQLASH</button>
                    </div>
                </div>
                ` : ''}

                <div id="sand-loader" style="text-align: center; color: #f59e0b; padding: 50px;"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
                <div id="sand-actual-content" style="display: none; flex-direction: column; gap: 30px;">
                    <div id="sand-reports-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
                        <!-- Reports injected here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        await this.loadData();
    },

    toggleAddForm: function() {
        const form = document.getElementById('sand-add-form');
        if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    },

    save: async function() {
        const loc = document.getElementById('s-loc').value;
        const bolinmaId = document.getElementById('s-bolinma').value;
        const kmS = document.getElementById('s-km-start').value;
        const kmE = document.getElementById('s-km-end').value;
        const risk = document.getElementById('s-risk').value;

        if (!loc || !kmS) {
            alert('Iltimos ma\'lumotlarni kiriting');
            return;
        }

        try {
            await ModernizationRepo.saveSandReport({
                location_name: loc,
                km_start: kmS,
                km_end: kmE,
                risk_level: risk,
                wind_speed: 15, // Demo
                analysis_data: '{}',
                bolinma_id: bolinmaId
            });
            this.toggleAddForm();
            await this.loadData();
            if (window.showToast) window.showToast('Tahlil saqlandi', 'success');
        } catch (error) {
            console.error('Sand save error:', error);
            alert('Xatolik yuz berdi');
        }
    },

    loadData: async function() {
        try {
            const data = await ModernizationRepo.getSandAnalysis();
            this.allData = data;
            
            if (document.getElementById('sand-loader')) document.getElementById('sand-loader').style.display = 'none';
            if (document.getElementById('sand-actual-content')) document.getElementById('sand-actual-content').style.display = 'flex';

            const container = document.getElementById('sand-reports-list');
            if (!container) return;
            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = '<div style="text-align: center; opacity: 0.5; grid-column: 1/-1; padding: 50px;">Tahlillar mavjud emas.</div>';
                return;
            }

            data.forEach(report => {
                const card = document.createElement('div');
                card.style.cssText = `
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px;
                `;
                const riskColor = report.risk_level === 'high' ? '#f85149' : (report.risk_level === 'medium' ? '#f59e0b' : '#10b981');
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="margin: 0; color: #fff;">${report.location_name}</h4>
                        <span style="background: ${riskColor}20; color: ${riskColor}; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; border: 1px solid ${riskColor}40;">
                            ${report.risk_level.toUpperCase()} XAVF
                        </span>
                    </div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">
                        <i class="fas fa-map-marker-alt" style="margin-right: 8px;"></i> ${report.km_start} - ${report.km_end} KM oraliqlari
                    </div>
                    <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 0.8rem; color: rgba(255,255,255,0.3);">
                        Sana: ${new Date(report.created_at).toLocaleString()}
                    </div>
                `;
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Sand fetch error:', error);
        }
    },

    export: function() {
        if (!this.allData || this.allData.length === 0) return alert('Eksport uchun ma\'lumot yo\'q');
        SmartReporting.exportToExcel(this.allData, 'Qum_Bosishi_Tahlili.xlsx');
    }
};

window.ModernSand = ModernSand;
