/**
 * PRESENTATION Layer: Audit Logs Modal
 * Allows admins to track system activity.
 */

const ModernAuditLogs = {
    open: async function() {
        const modalId = 'modern-audit-logs-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const currentUser = window.Auth.currentUser;
        if (currentUser.role !== 'admin') {
            alert('Faqat adminlar uchun ruxsat etilgan');
            return;
        }

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'department-window active';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 95%; max-width: 1400px; height: 90vh;
            z-index: 10005; display: flex; flex-direction: column;
            background: rgba(10, 15, 25, 0.98); backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 28px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7);
            animation: modalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden; color: #fff;
        `;

        modal.innerHTML = `
            <div class="window-header" style="padding: 25px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 50px; height: 50px; background: rgba(59, 130, 246, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(59, 130, 246, 0.2);">
                        <i class="fas fa-shield-halved" style="font-size: 1.5rem; color: #3b82f6;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">TIZIM AUDITI <span style="color: #3b82f6; font-weight: 400;">JOURNALI</span></h2>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Xavfsizlik va kuzatuv | Reall vaqt rejimida</div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px;">
                    <button onclick="ModernAuditLogs.export()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-file-excel" style="color: #10b981;"></i> EXCEL
                    </button>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: rgba(255, 255, 255, 0.05); border: none; color: #fff; width: 40px; height: 40px; border-radius: 12px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="padding: 40px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 30px;">
                <div id="audit-loader" style="text-align: center; color: #3b82f6; padding: 50px;"><i class="fas fa-spinner fa-spin"></i> Audit ma'lumotlari yuklanmoqda...</div>
                
                <div id="audit-actual-content" style="display: none; flex-direction: column; gap: 20px;">
                    <div style="background: rgba(0,0,0,0.2); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead style="background: rgba(255,255,255,0.03);">
                                <tr>
                                    <th style="padding: 20px; color: #3b82f6;">VAQT</th>
                                    <th style="padding: 20px; color: #3b82f6;">FOYDALANUVCHI</th>
                                    <th style="padding: 20px; color: #3b82f6;">AMAL</th>
                                    <th style="padding: 20px; color: #3b82f6;">MODUL</th>
                                    <th style="padding: 20px; color: #3b82f6;">TAFSILOTLAR</th>
                                    <th style="padding: 20px; color: #3b82f6;">IP MANZIL</th>
                                </tr>
                            </thead>
                            <tbody id="audit-table-body" style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">
                                <!-- Data -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        await this.loadData();
    },

    loadData: async function() {
        try {
            const data = await SmartUtils.fetchAPI('/audit/logs');
            this.allData = data;

            if (document.getElementById('audit-loader')) document.getElementById('audit-loader').style.display = 'none';
            if (document.getElementById('audit-actual-content')) document.getElementById('audit-actual-content').style.display = 'flex';

            const tbody = document.getElementById('audit-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            data.forEach(log => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
                
                const details = JSON.parse(log.details || '{}');
                const actionColor = log.action === 'DELETE' ? '#ef4444' : (log.action === 'update' || log.action === 'PUT' ? '#f59e0b' : '#10b981');

                tr.innerHTML = `
                    <td style="padding: 15px 20px; font-family: monospace; color: rgba(255,255,255,0.5);">${new Date(log.created_at).toLocaleString()}</td>
                    <td style="padding: 15px 20px;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 24px; height: 24px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #3b82f6;">${log.username.charAt(0).toUpperCase()}</div>
                            ${escapeHtml(log.username)}
                        </span>
                    </td>
                    <td style="padding: 15px 20px;">
                        <span style="background: ${actionColor}20; color: ${actionColor}; padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800;">${log.action.toUpperCase()}</span>
                    </td>
                    <td style="padding: 15px 20px; color: #3b82f6; font-weight: 500;">${log.entity.replace('/api/', '').toUpperCase()}</td>
                    <td style="padding: 15px 20px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; opacity: 0.7;">
                        ${details.response_message || details.url || '-'}
                    </td>
                    <td style="padding: 15px 20px; color: rgba(255,255,255,0.4); font-size: 0.8rem;">${log.ip_address || '127.0.0.1'}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Audit fetch error:', error);
        }
    },

    export: function() {
        if (!this.allData) return;
        SmartReporting.exportToExcel(this.allData, 'Tizim_Audit_Loglari.xlsx');
    }
};

window.ModernAuditLogs = ModernAuditLogs;
