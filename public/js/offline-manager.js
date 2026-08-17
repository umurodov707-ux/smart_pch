/**
 * OfflineManager
 * PWA keshiga tushmay qolgan yoki internet uzilganida jo'natilmay qolgan 
 * muhim so'rovlarni (POST/PUT) saqlab, aloqa tiklanganda qayta yuboradi.
 */
class OfflineManager {
    static async saveRequest(url, method, body, title = 'Noma\'lum ma\'lumot') {
        const reqs = JSON.parse(localStorage.getItem('smart_offline_reqs') || '[]');
        reqs.push({ url, method, body, title, timestamp: Date.now(), id: Date.now() });
        localStorage.setItem('smart_offline_reqs', JSON.stringify(reqs));
        
        console.log(`[OfflineManager] So'rov saqlandi: ${title}`);

        // Background Sync ro'yxatdan o'tkazish
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            try {
                const swRegistration = await navigator.serviceWorker.ready;
                await swRegistration.sync.register('sync-offline-data');
            } catch (err) {
                console.warn('Background sync xatosi:', err);
            }
        }
    }
    
    static async syncNow() {
        const reqs = JSON.parse(localStorage.getItem('smart_offline_reqs') || '[]');
        if (reqs.length === 0) return;
        
        console.log(`[OfflineManager] ${reqs.length} ta saqlangan so'rov jo'natilmoqda...`);
        const failed = [];
        let successCount = 0;
        
        for (const req of reqs) {
            try {
                const headers = window.SmartPCH
                    ? window.SmartPCH.getApiHeaders()
                    : {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'SmartPCH-WebApp',
                        ...(localStorage.getItem('jwtToken')
                            ? { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
                            : {})
                    };
                const res = await fetch(req.url, {
                    method: req.method,
                    headers,
                    body: JSON.stringify(req.body)
                });
                if (!res.ok) throw new Error('Bad status: ' + res.status);
                successCount++;
            } catch (err) {
                console.error(`[OfflineManager] Jo'natish o'xshamadi (${req.title}):`, err);
                failed.push(req);
            }
        }
        
        localStorage.setItem('smart_offline_reqs', JSON.stringify(failed));
        
        if (successCount > 0 && typeof SmartUtils !== 'undefined') {
            SmartUtils.showToast(`${successCount} ta saqlangan ma'lumot muvaffaqiyatli serverga yetkazildi!`, 'success');
        }
    }

    static getPendingRequests() {
        return JSON.parse(localStorage.getItem('smart_offline_reqs') || '[]');
    }
}

// Global oyna ochish (PWA/Offline testing uchun)
window.OfflineManager = OfflineManager;

// Internet tiklanganda avtomatik sinxronizatsiya
window.addEventListener('online', () => {
    console.log('[OfflineManager] Aloqa tiklandi. Sinxronizatsiya boshlanmoqda...');
    updateOfflineStatus(true);
    OfflineManager.syncNow();
});

window.addEventListener('offline', () => {
    updateOfflineStatus(false);
});

function updateOfflineStatus(isOnline) {
    let indicator = document.getElementById('global-offline-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'global-offline-indicator';
        indicator.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:999999; padding:10px 20px; border-radius:30px; font-weight:800; font-size:0.75rem; display:flex; align-items:center; gap:10px; transition:0.5s; cursor:default;';
        document.body.appendChild(indicator);
    }
    
    if (isOnline) {
        indicator.style.background = 'rgba(16, 185, 129, 0.1)';
        indicator.style.color = '#10b981';
        indicator.style.border = '1px solid rgba(16, 185, 129, 0.2)';
        indicator.innerHTML = '<i class="fas fa-wifi"></i> TIZIM ONLAYN';
        setTimeout(() => indicator.style.opacity = '0', 3000);
    } else {
        indicator.style.opacity = '1';
        indicator.style.background = 'rgba(239, 68, 68, 0.1)';
        indicator.style.color = '#ef4444';
        indicator.style.border = '1px solid rgba(239, 68, 68, 0.2)';
        indicator.innerHTML = '<i class="fas fa-plane"></i> OFFLINE REJIM';
    }
}

// Initial check
setTimeout(() => updateOfflineStatus(navigator.onLine), 2000);
