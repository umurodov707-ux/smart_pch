/**
 * PRESENTATION Layer: Warnings Modal
 * Uses ModernizationRepo for data fetching and saving.
 */

const ModernWarnings = {
    open: async function() {
        const modalId = 'modern-warnings-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const currentUser = window.Auth.currentUser;
        const canEdit = !!currentUser; // Everyone can enter warnings now

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'department-window active';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 90%; max-width: 1200px; height: 85vh;
            z-index: 10002; display: flex; flex-direction: column;
            background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);
            border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        `;

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, rgba(212, 175, 55, 0.15), transparent); padding: 25px 35px; border-bottom: 1px solid rgba(212, 175, 55, 0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 50px; height: 50px; background: rgba(212, 175, 55, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(212, 175, 55, 0.2);">
                        <i class="fas fa-bullhorn" style="font-size: 1.5rem; color: #d4af37;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.6rem; color: #fff; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">OGOHLANTIRISHLAR <span style="color: #d4af37; font-weight: 400;">(DU-61)</span></h2>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Arxitektura: Clean Setup | Kunlik ogohlantirishlar</div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    ${canEdit ? `
                        <button onclick="ModernWarnings.toggleAddForm()" style="background: #d4af37; border: none; color: #1a2a3a; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; transition: 0.3s; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
                            <i class="fas fa-plus"></i> YANGI QO'SHISH
                        </button>
                        <button onclick="ModernWarnings.export()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                            <i class="fas fa-file-excel" style="color: #10b981;"></i> EXCEL
                        </button>
                    ` : ''}
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: rgba(255, 255, 255, 0.05); border: none; color: #fff; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="padding: 35px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 30px;">
                
                <!-- Add Form (Hidden by default) -->
                ${canEdit ? `
                <div id="warn-add-form" style="display: none; background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 20px; padding: 25px; animation: slideDown 0.3s ease-out;">
                    <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 20px; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">Yangi ogohlantirish kiritish</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <select id="w-bolinma" style="padding: 12px; background: rgba(0,0,10,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                            ${(window.subdivisions || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                        <input type="text" id="w-km" placeholder="KM" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <input type="text" id="w-pk" placeholder="PK" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <input type="number" id="w-speed" placeholder="Tezlik (km/s)" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <input type="date" id="w-date" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                    </div>
                    <textarea id="w-msg" placeholder="Sabab/Tavsif" style="width: 100%; margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; min-height: 80px;"></textarea>
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button onclick="ModernWarnings.toggleAddForm()" style="padding: 10px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 10px; cursor: pointer;">BEKOR QILISH</button>
                        <button onclick="ModernWarnings.save()" style="padding: 10px 25px; background: #10b981; border: none; color: #fff; border-radius: 10px; cursor: pointer; font-weight: bold;">SAQLASH</button>
                    </div>
                </div>
                ` : ''}

                <div id="warnings-loader" style="text-align: center; color: #d4af37; padding: 50px;"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
                <div id="warnings-actual-content" style="display: none; flex-direction: column; gap: 30px;">
                    <!-- Stats Row -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                        <div class="stat-card" style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Jami Amaldagi</div>
                            <div id="warn-total" style="font-size: 2.5rem; font-weight: 800; color: #d4af37; margin-top: 10px;">0 <span style="font-size: 1rem; color: rgba(255,255,255,0.3); font-weight: 400;">ta</span></div>
                        </div>
                    </div>

                    <!-- Table Content -->
                    <div style="background: rgba(0,0,0,0.2); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <th style="padding: 20px; color: #d4af37;">№</th>
                                    <th style="padding: 20px; color: #d4af37;">BO'LINMA</th>
                                    <th style="padding: 20px; color: #d4af37;">KM / PK</th>
                                    <th style="padding: 20px; color: #d4af37;">TEZLIK</th>
                                    <th style="padding: 20px; color: #d4af37;">SANA</th>
                                    <th style="padding: 20px; color: #d4af37;">HOLAT</th>
                                </tr>
                            </thead>
                            <tbody id="warnings-table-body" style="color: rgba(255,255,255,0.8);">
                                <!-- Data injected here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        await this.loadData();
    },

    toggleAddForm: function() {
        const form = document.getElementById('warn-add-form');
        if (form) {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
    },

    save: async function() {
        const bolinmaId = document.getElementById('w-bolinma').value;
        const km = document.getElementById('w-km').value;
        const pk = document.getElementById('w-pk').value;
        const speed = document.getElementById('w-speed').value;
        const date = document.getElementById('w-date').value;
        const msg = document.getElementById('w-msg').value;

        if (!km || !speed || !date) {
            alert('Iltimos asosiy maydonlarni to\'ldiring');
            return;
        }

        try {
            await ModernizationRepo.saveWarning({
                km: km,
                pk: pk,
                speed_limit: speed,
                start_date: date,
                message: msg,
                title: 'Tezlikni cheklash',
                type: 'daily',
                priority: 'important',
                bolinma_id: bolinmaId
            });
            
            this.toggleAddForm();
            await this.loadData();
            if (window.showToast) window.showToast('Ogohlantirish kiritildi', 'success');
        } catch (error) {
            console.error('Save warning error:', error);
            alert('Saqlashda xatolik yuz berdi');
        }
    },

    loadData: async function() {
        try {
            const data = await ModernizationRepo.getWarnings();
            this.lastData = data;
            
            if (document.getElementById('warnings-loader')) document.getElementById('warnings-loader').style.display = 'none';
            if (document.getElementById('warnings-actual-content')) document.getElementById('warnings-actual-content').style.display = 'flex';

            const tbody = document.getElementById('warnings-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';
            
            const totalEl = document.getElementById('warn-total');
            if (totalEl) totalEl.innerHTML = `${data.length} <span style="font-size: 1rem; color: rgba(255,255,255,0.3); font-weight: 400;">ta</span>`;

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:50px; opacity:0.5;">Ma\'lumotlar mavjud emas</td></tr>';
                return;
            }

            data.forEach((w, i) => {
                const sub = (window.subdivisions || []).find(s => s.id === w.bolinma_id) || { name: w.bolinma_id || '-' };
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
                tr.innerHTML = `
                    <td style="padding: 20px;">${i + 1}</td>
                    <td style="padding: 20px; font-weight: bold; color: #fff;">${sub.name}</td>
                    <td style="padding: 20px;">${w.km || '-'} / ${w.pk || '-'}</td>
                    <td style="padding: 20px; font-weight: bold; color: #f85149;">${w.speed_limit || '0'} km/soat</td>
                    <td style="padding: 20px;">${w.start_date || '-'}</td>
                    <td style="padding: 20px;"><span style="background: rgba(248, 81, 73, 0.1); color: #f85149; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; border: 1px solid rgba(248, 81, 73, 0.2);">AMALDA</span></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Warnings fetch error:', error);
        }
    },

    export: function() {
        if (!this.lastData || this.lastData.length === 0) return alert('Eksport uchun ma\'lumot yo\'q');
        SmartReporting.exportToExcel(this.lastData, 'Ogohlantirishlar_DU61.xlsx');
    }
};

window.ModernWarnings = ModernWarnings;
