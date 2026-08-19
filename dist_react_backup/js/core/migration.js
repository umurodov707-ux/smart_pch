/**
 * Migration Service
 * Handles syncing legacy localStorage data to the centralized backend.
 * Checks for existing data on startup, sends it to the server, and clears local storage after success.
 */

window.MigrationService = {
    async init() {
        console.log('🚀 Migration Service initialized');
        
        // 1. Accounting Archives
        await this.syncAccountingArchives();
        
        // 2. Safety Logs
        await this.syncSafetyLogs();
        
        // 3. Maintenance Logs
        await this.syncMaintenanceLogs();
        
        // 4. Material Acts (M-29)
        await this.syncMaterialActs();

        // 5. HR Appeals (Murojaat)
        await this.syncHRMurojaatlar();
    },

    async syncAccountingArchives() {
        const localData = JSON.parse(localStorage.getItem('accounting_archive_data')) || [];
        if (localData.length === 0) return;

        console.log(`📦 Syncing ${localData.length} accounting archives...`);
        let count = 0;
        for (const item of localData) {
            try {
                // Map local format to backend format if needed
                const payload = {
                    bolinma_id: item.bolinma || 'unknown',
                    filename: item.filename || 'archive.pdf',
                    period: item.period || '',
                    summary: item.summary || '',
                    data: item.data || []
                };
                const result = await SmartUtils.fetchAPI('/materials/archives', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                if (result) count++;
            } catch (e) {
                console.error('Failed to sync archive item:', e);
            }
        }

        if (count === localData.length) {
            console.log('✅ Accounting archives synced successfully. Clearing localStorage.');
            localStorage.removeItem('accounting_archive_data');
        }
    },

    async syncSafetyLogs() {
        const localLogs = JSON.parse(localStorage.getItem('safety_logs')) || [];
        if (localLogs.length === 0) return;

        console.log(`🛡️ Syncing ${localLogs.length} safety logs...`);
        let count = 0;
        for (const log of localLogs) {
            try {
                const payload = {
                    bolinma_id: log.bolinma || 'all',
                    type: log.type || 'general',
                    employee_id: log.employee_id || null,
                    content: log.description || log.message || '',
                    date: log.date || new Date().toLocaleDateString()
                };
                const result = await SmartUtils.fetchAPI('/safety/logs', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                if (result) count++;
            } catch (e) {
                console.error('Failed to sync safety log:', e);
            }
        }

        if (count === localLogs.length) {
            console.log('✅ Safety logs synced. Clearing localStorage.');
            localStorage.removeItem('safety_logs');
        }
    },

    async syncMaintenanceLogs() {
        const localLogs = JSON.parse(localStorage.getItem('maintenance_logs')) || [];
        if (localLogs.length === 0) return;

        console.log(`🔧 Syncing ${localLogs.length} maintenance logs...`);
        let count = 0;
        for (const log of localLogs) {
            try {
                const payload = {
                    bolinma_id: log.bolinma_id || 'all',
                    category: log.category || 'general',
                    title: log.title || 'Log',
                    content: log.content || '',
                    date: log.date || new Date().toLocaleDateString()
                };
                const result = await SmartUtils.fetchAPI('/mechanics/logs', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                if (result) count++;
            } catch (e) {
                console.error('Failed to sync maintenance log:', e);
            }
        }

        if (count === localLogs.length) {
            console.log('✅ Maintenance logs synced. Clearing localStorage.');
            localStorage.removeItem('maintenance_logs');
        }
    },

    async syncMaterialActs() {
        const acts = JSON.parse(localStorage.getItem('materialActs')) || [];
        if (acts.length === 0) return;

        console.log(`📄 Syncing ${acts.length} M-29 acts...`);
        let count = 0;
        for (const act of acts) {
            // Only sync if not already on server (hacky check: assume ID > 1000000000 are local)
            if (act.id > 1000000) {
                 try {
                    const result = await SmartUtils.fetchAPI('/materials/acts', {
                        method: 'POST',
                        body: JSON.stringify(act)
                    });
                    if (result) count++;
                } catch (e) {
                    console.error('Failed to sync material act:', e);
                }
            } else {
                count++;
            }
        }

        if (count === acts.length) {
            console.log('✅ Material acts synced. Clearing localStorage.');
            localStorage.removeItem('materialActs');
        }
    },

    async syncHRMurojaatlar() {
        const localData = JSON.parse(localStorage.getItem('hr_murojaatlar')) || [];
        if (localData.length === 0) return;

        console.log(`✉️ Syncing ${localData.length} HR murojaatlar...`);
        let count = 0;
        for (const item of localData) {
            try {
                const result = await SmartUtils.fetchAPI('/murojaat', {
                    method: 'POST',
                    body: JSON.stringify(item)
                });
                if (result) count++;
            } catch (e) {
                console.error('Failed to sync murojaat item:', e);
            }
        }

        if (count === localData.length) {
            console.log('✅ HR murojaatlar synced. Clearing localStorage.');
            localStorage.removeItem('hr_murojaatlar');
        }
    }
};

// Auto-run migration if not already started
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.MigrationService.init());
} else {
    window.MigrationService.init();
}
