/**
 * PRESENTATION Layer: Closed Tracks Modal
 */

const ModernClosedTracks = {
    open: async function() {
        const modalId = 'modern-closed-tracks-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const currentUser = window.Auth.currentUser;
        const canEdit = !!currentUser; // Everyone can update tracks now

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'department-window active';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 90%; max-width: 1200px; height: 85vh;
            z-index: 10002; display: flex; flex-direction: column;
            background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px);
            border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        `;

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, rgba(239, 68, 68, 0.1), transparent); padding: 25px 35px; border-bottom: 1px solid rgba(239, 68, 68, 0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 50px; height: 50px; background: rgba(239, 68, 68, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(239, 68, 68, 0.2);">
                        <i class="fas fa-road-circle-exclamation" style="font-size: 1.5rem; color: #ef4444;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.6rem; color: #fff; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">YOPIQ YO'LLAR <span style="color: #ef4444; font-weight: 400;">MONITORINGI</span></h2>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Arxitektura: Clean Setup | Operativ Boshqaruv</div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <button onclick="ModernClosedTracks.export()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                        <i class="fas fa-file-excel" style="color: #10b981;"></i> EXCEL
                    </button>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: rgba(255, 255, 255, 0.05); border: none; color: #fff; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="padding: 35px; flex: 1; overflow-y: auto;">
                <div id="closed-tracks-loader" style="text-align: center; color: #ef4444; padding: 50px;"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
                <div id="closed-tracks-actual-content" style="display: none; flex-direction: column; gap: 25px;">
                    <div id="tracks-cards-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <!-- Track cards injected here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        await this.loadData();
    },

    loadData: async function() {
        try {
            const data = await ModernizationRepo.getClosedTracks();
            this.allData = data;
            const currentUser = window.Auth.currentUser;
            const canEdit = currentUser && (currentUser.username === 'dispetcher' || currentUser.role === 'admin');

            if (document.getElementById('closed-tracks-loader')) document.getElementById('closed-tracks-loader').style.display = 'none';
            if (document.getElementById('closed-tracks-actual-content')) document.getElementById('closed-tracks-actual-content').style.display = 'flex';

            const container = document.getElementById('tracks-cards-container');
            if (!container) return;
            container.innerHTML = '';

            data.forEach(track => {
                const card = document.createElement('div');
                card.style.cssText = `
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px;
                    transition: 0.3s;
                `;
                const isClosed = track.status === 'closed' || track.status === 'blocked';
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="margin: 0; color: #fff; font-size: 1.1rem;">${track.location_name || 'Noma\'lum hudud'}</h4>
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${isClosed ? '#ef4444' : '#10b981'}; box-shadow: 0 0 10px ${isClosed ? '#ef4444' : '#10b981'};"></div>
                    </div>
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.6);">
                        ${track.details || 'Ma\'lumot yo\'q'}
                    </div>
                    ${canEdit ? `
                        <div style="margin-top: 10px; display: flex; gap: 10px;">
                            <button onclick="ModernClosedTracks.updateStatus(${track.id}, 'closed')" style="flex: 1; padding: 8px; background: ${track.status === 'closed' ? '#ef4444' : 'rgba(239,68,68,0.1)'}; border: 1px solid #ef4444; color: #fff; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">YOPIQ</button>
                            <button onclick="ModernClosedTracks.updateStatus(${track.id}, 'open')" style="flex: 1; padding: 8px; background: ${track.status === 'open' ? '#10b981' : 'rgba(16,185,129,0.1)'}; border: 1px solid #10b981; color: #fff; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">OCHIQ</button>
                        </div>
                    ` : `
                        <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.05); text-align: center; border-radius: 8px; color: ${isClosed ? '#ef4444' : '#10b981'}; font-weight: bold; font-size: 0.8rem;">
                            HOLAT: ${track.status.toUpperCase()}
                        </div>
                    `}
                `;
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Tracks fetch error:', error);
        }
    },

    updateStatus: async function(id, status) {
        try {
            const response = await ApiClient.post('/api/infrastructure/status/update', { id, status, details: status === 'closed' ? 'Ta\'mirlash ishlari ketmoqda' : 'Yo\'l ochiq' });
            if (window.showToast) window.showToast('Holat yangilandi', 'success');
            await this.loadData();
        } catch (error) {
            console.error('Update status error:', error);
            alert('Xatolik yuz berdi');
        }
    },

    export: function() {
        if (!this.allData || this.allData.length === 0) return alert('Eksport uchun ma\'lumot yo\'q');
        SmartReporting.exportToExcel(this.allData, 'Yopiq_Yollar_Hisoboti.xlsx');
    }
};

window.ModernClosedTracks = ModernClosedTracks;
