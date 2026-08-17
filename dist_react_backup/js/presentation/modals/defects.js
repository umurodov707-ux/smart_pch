/**
 * PRESENTATION Layer: Defects Modal
 */

const ModernDefects = {
    open: async function() {
        const modalId = 'modern-defects-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const currentUser = window.Auth.currentUser;
        const canEdit = !!currentUser; // Everyone can register defects now

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'department-window active';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 95%; max-width: 1400px; height: 90vh;
            z-index: 10002; display: flex; flex-direction: column;
            background: rgba(15, 23, 42, 0.98); backdrop-filter: blur(25px);
            border: 1px solid rgba(0, 198, 255, 0.3); border-radius: 28px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            animation: modalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        `;

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, rgba(0, 198, 255, 0.1), transparent); padding: 25px 40px; border-bottom: 1px solid rgba(0, 198, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 50px; height: 50px; background: rgba(0, 198, 255, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0, 198, 255, 0.2);">
                        <i class="fas fa-microscope" style="font-size: 1.5rem; color: #00c6ff;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.6rem; color: #fff; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">DEFEKTOSKOPIYA <span style="color: #00c6ff; font-weight: 400;">NAZORATI</span></h2>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Arxitektura: Clean Setup | Operativ ma'lumotlar</div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div style="position: relative;">
                        <input type="text" id="defect-search" oninput="ModernDefects.filterData()" placeholder="Qidiruv (PK yoki muammo)..." style="padding: 10px 15px 10px 35px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 0.85rem; width: 250px;">
                        <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.3); font-size: 0.8rem;"></i>
                    </div>
                    ${canEdit ? `
                        <button onclick="ModernDefects.toggleAddForm()" style="background: #00c6ff; border: none; color: #1a2a3a; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-plus"></i> NUQSON QO'SHISH
                        </button>
                        <button onclick="ModernDefects.export()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                            <i class="fas fa-file-excel" style="color: #10b981;"></i> EXCEL
                        </button>
                    ` : ''}
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: rgba(255, 255, 255, 0.05); border: none; color: #fff; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="padding: 40px; flex: 1; overflow-y: auto;">
                
                <!-- Add Form -->
                ${canEdit ? `
                <div id="defect-add-form" style="display: none; background: rgba(0, 198, 255, 0.05); border: 1px solid rgba(0, 198, 255, 0.2); border-radius: 20px; padding: 25px; margin-bottom: 30px; animation: slideDown 0.3s ease-out;">
                    <h3 style="color: #00c6ff; margin-top: 0; margin-bottom: 20px; font-size: 1.1rem; text-transform: uppercase;">Yangi nuqsonni ro'yxatga olish</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <select id="d-bolinma" style="padding: 12px; background: rgba(0,0,10,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                            ${(window.subdivisions || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                        <input type="text" id="d-pk" placeholder="PK" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                        <input type="text" id="d-issue" placeholder="Nuqson turi" style="padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;">
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button onclick="ModernDefects.toggleAddForm()" style="padding: 10px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 10px; cursor: pointer;">BEKOR QILISH</button>
                        <button onclick="ModernDefects.save()" style="padding: 10px 25px; background: #00c6ff; border: none; color: #1a2a3a; border-radius: 10px; cursor: pointer; font-weight: bold;">SAQLASH</button>
                    </div>
                </div>
                ` : ''}

                <div id="defects-loader" style="text-align: center; color: #00c6ff; padding: 50px;"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
                <div id="defects-actual-content" style="display: none; flex-direction: column; gap: 35px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;" id="defects-summary-list">
                        <!-- Defects stats injected here -->
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <th style="padding: 20px; color: #00c6ff;">№</th>
                                    <th style="padding: 20px; color: #00c6ff;">BO'LINMA</th>
                                    <th style="padding: 20px; color: #00c6ff;">PK</th>
                                    <th style="padding: 20px; color: #00c6ff;">MUAMMO</th>
                                    <th style="padding: 20px; color: #00c6ff;">SANA</th>
                                </tr>
                            </thead>
                            <tbody id="defects-table-body" style="color: rgba(255,255,255,0.8);">
                                <!-- Detailed data injected here -->
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
        const form = document.getElementById('defect-add-form');
        if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    },

    save: async function() {
        const bolinma = document.getElementById('d-bolinma').value;
        const pk = document.getElementById('d-pk').value;
        const issue = document.getElementById('d-issue').value;

        if (!pk || !issue) {
            alert('Iltimos ma\'lumotlarni kiriting');
            return;
        }

        try {
            await ApiClient.post('/api/defects', { bolinma_id: bolinma, pk, issue, date: new Date().toISOString().split('T')[0] });
            this.toggleAddForm();
            await this.loadData();
            if (window.showToast) window.showToast('Nuqson ro\'yxatga olindi', 'success');
        } catch (error) {
            console.error('Defect save error:', error);
            alert('Xatolik yuz berdi');
        }
    },

    loadData: async function() {
        try {
            const summaryContainer = document.getElementById('defects-summary-list');
            const tableBody = document.getElementById('defects-table-body');
            if (!summaryContainer || !tableBody) return;

            summaryContainer.innerHTML = '';
            tableBody.innerHTML = '';

            const subs = window.subdivisions || [];
            const allDefects = [];
            
            // Parallel fetch for all subdivisions
            const results = await Promise.all(subs.map(s => ModernizationRepo.getDefects(s.id)));
            
            subs.forEach((s, i) => {
                const defects = results[i] || [];
                allDefects.push(...defects.map(d => ({ ...d, subdivisionName: s.name })));
                
                const div = document.createElement('div');
                div.style.cssText = `
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center;
                `;
                div.innerHTML = `
                    <div style="color: rgba(255,255,255,0.8); font-weight: 500; font-size: 0.9rem;">${s.name}</div>
                    <div style="background: ${defects.length > 0 ? 'rgba(248, 81, 73, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${defects.length > 0 ? '#f85149' : '#10b981'}; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.8rem;">
                        ${defects.length} ta
                    </div>
                `;
                summaryContainer.appendChild(div);
            });

            this.lastData = allDefects;
            this.renderTable(allDefects);

            if (document.getElementById('defects-loader')) document.getElementById('defects-loader').style.display = 'none';
            if (document.getElementById('defects-actual-content')) document.getElementById('defects-actual-content').style.display = 'flex';

        } catch (error) {
            console.error('Defects loading error:', error);
        }
    },

    renderTable: function(data) {
        const tbody = document.getElementById('defects-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; opacity:0.5;">Ma\'lumotlar topilmadi</td></tr>';
            return;
        }

        data.forEach((d, i) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            tr.innerHTML = `
                <td style="padding: 15px 20px;">${i + 1}</td>
                <td style="padding: 15px 20px; color: #fff; font-weight: 600;">${d.subdivisionName || d.bolinma_id}</td>
                <td style="padding: 15px 20px;">${d.pk || '-'}</td>
                <td style="padding: 15px 20px; color: #f85149;">${d.issue || '-'}</td>
                <td style="padding: 15px 20px; opacity: 0.7;">${d.date || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    filterData: function() {
        const query = document.getElementById('defect-search').value.toLowerCase();
        if (!this.lastData) return;
        
        const filtered = this.lastData.filter(d => 
            (d.issue && d.issue.toLowerCase().includes(query)) || 
            (d.pk && d.pk.toString().includes(query)) ||
            (d.subdivisionName && d.subdivisionName.toLowerCase().includes(query))
        );
        this.renderTable(filtered);
    },

    export: function() {
        if (!this.lastData || this.lastData.length === 0) return alert('Eksport uchun ma\'lumot yo\'q');
        SmartReporting.exportToExcel(this.lastData, 'Defektoskopiya_Nosozliklar.xlsx');
    }
};

window.ModernDefects = ModernDefects;
