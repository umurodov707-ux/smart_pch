/**
 * SMART PCH - Utility Module
 * Contains Shared Helpers and Global Notification System
 */

const SmartUtils = {
    /**
     * Central API Fetch Wrapper
     * Automatically handles Base URL, JWT Token, and JSON conversion
     */
    getApiHeaders: function (extra = {}, opts = {}) {
        return window.SmartPCH
            ? window.SmartPCH.getApiHeaders(extra, opts)
            : {
                'Content-Type': 'application/json',
                'X-Requested-With': 'SmartPCH-WebApp',
                ...(localStorage.getItem('jwtToken')
                    ? { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
                    : {}),
                ...extra
            };
    },

    fetchAPI: async function (endpoint, options = {}) {
        const baseUrl = window.CONFIG?.API_URL || '/api';
        const isFormData = options.body instanceof FormData;
        const headers = this.getApiHeaders(options.headers || {}, { json: !isFormData });

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401) {
                // Token expired or invalid
                console.warn('API Error 401: Token muddati tugagan yoki ruxsat etilmagan.');
                // Foydalanuvchini login sahifasiga yo'naltirish
                window.Auth?.logout?.();
                throw new Error('Sessiya muddati tugagan. Iltimos, qayta kiring.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Call failed (${endpoint}):`, error);
            throw error;
        }
    },

    /**
     * Toast Notification System
     * @param {string} message - The message to show
     * @param {string} type - 'success', 'error', 'info', 'warning'
     * @param {number} duration - Milliseconds to show the toast
     */
    showToast: function (message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" type="button">&times;</button>
        `;

        container.appendChild(toast);

        // Auto remove duration
        const timer = setTimeout(() => {
            SmartUtils.removeToast(toast);
        }, duration);

        // Manual close
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                clearTimeout(timer);
                SmartUtils.removeToast(toast);
            };
        }

        return toast;
    },

    removeToast: function (toast) {
        if (!toast) return;
        toast.classList.add('toast-outgoing');

        // Majburiy o'chirish (Fail-safe) - agar animatsiya ishlamay qolsa
        const forceRemove = setTimeout(() => {
            if (toast && toast.parentNode) toast.remove();
        }, 600);

        toast.addEventListener('animationend', () => {
            clearTimeout(forceRemove);
            if (toast && toast.parentNode) toast.remove();
        }, { once: true });
    },

    /**
     * Normalize Bolinma ID
     * Converts various formats like 'bolinma1', '1-bo'linma', '1' to a clean numeric-like string '1'
     */
    normalizeBolinmaId: function(id) {
        if (!id) return '';
        // Extract numbers from string
        const match = String(id).match(/\d+/);
        return match ? match[0] : String(id).toLowerCase().trim();
    },

    /**
     * Data Persistence Wrapper (LocalStorage with Server Sync)
     */
    save: async function (key, data) {
        try {
            // 1. Try Server Save - faqat autentifikatsiya qilingan bo'lsa
            const token = localStorage.getItem('jwtToken');
            if (token) {
                await this.fetchAPI('/storage/save', {
                    method: 'POST',
                    body: JSON.stringify({ key, data })
                }).catch(e => console.warn('Server storage failed, falling back to local', e));
            }


            // 3. LocalStorage Fallback
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage Save Error:', e);
            localStorage.setItem(key, JSON.stringify(data));
            return false;
        }
    },

    load: async function (key, defaultValue = null) {
        try {
            // 1. Try Server Load - faqat autentifikatsiya qilingan bo'lsa
            // Token yo'q bo'lsa server chaqirilmaydi (cheksiz reload loop oldini oladi)
            const token = localStorage.getItem('jwtToken');
            if (token) {
                const serverData = await this.fetchAPI(`/storage/load/${key}`).catch(() => null);
                if (serverData) return serverData;
            }


            // 3. LocalStorage Fallback
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage Load Error:', e);
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        }
    },

    /**
     * Formatting Helpers
     */
    formatDate: function (dateStr) {
        return new Date(dateStr).toLocaleDateString('uz-UZ');
    },

    formatTime: function (dateStr) {
        return new Date(dateStr).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    },
    /**
     * Data Backup & Restore System
     */
    backupData: function () {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SmartPCH_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Ma\'lumotlar muvaffaqiyatli arxivlandi!', 'success');
    },

    restoreData: function (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, data[key]);
                });
                showToast('Ma\'lumotlar tiklandi! Sahifani yangilang.', 'success');
                setTimeout(() => location.reload(), 2000);
            } catch (err) {
                showToast('Faylni o\'qib bo\'lmadi!', 'error');
            }
        };
        reader.readAsText(file);
    },

    /**
     * Form Validation Helper
     */
    validateInput: function (value, type) {
        if (!value || value.trim() === '') return false;

        const patterns = {
            tel: /^(\+998|998)?\d{9}$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            number: /^\d+$/
        };

        if (patterns[type]) {
            return patterns[type].test(value.replace(/\s/g, ''));
        }
        return true;
    },

    /**
     * 1-Click Table Export to Excel
     */
    exportTableToExcel: function (tableElementOrId, fileName = 'Hisobot_Export') {
        const table = typeof tableElementOrId === 'string' ? document.getElementById(tableElementOrId) : tableElementOrId;
        if (!table) {
            SmartUtils.showToast('Eksport qilish uchun jadval topilmadi!', 'warning');
            return;
        }

        try {
            if (typeof XLSX !== 'undefined') {
                const wb = XLSX.utils.table_to_book(table, { sheet: "Hisobot" });
                XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
                SmartUtils.showToast('Excel fayli muvaffaqiyatli yuklab olindi!', 'success');
            } else {
                let csv = [];
                const rows = table.querySelectorAll("tr");
                for (let i = 0; i < rows.length; i++) {
                    const row = [], cols = rows[i].querySelectorAll("td, th");
                    for (let j = 0; j < cols.length; j++) 
                        row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
                    csv.push(row.join(","));
                }
                const csvFile = new Blob([csv.join("\n")], {type: "text/csv;charset=utf-8;"});
                const downloadLink = document.createElement("a");
                downloadLink.download = `${fileName}.csv`;
                downloadLink.href = window.URL.createObjectURL(csvFile);
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                SmartUtils.showToast('CSV fayli yuklab olindi!', 'success');
            }
        } catch (e) {
            console.error('Excel Export Error:', e);
            SmartUtils.showToast('Excel faylini yaratishda xatolik', 'error');
        }
    },

    /**
     * Professional PDF Export System
     * @param {HTMLElement|string} element - Element or ID to export
     * @param {string} fileName - Name of the file
     * @param {Object} options - Custom options (title, subtitle)
     */
    exportToPDF: function (element, fileName = 'Hisobot', options = {}) {
        const target = typeof element === 'string' ? document.getElementById(element) : element;
        if (!target) {
            showToast('Eksport uchun ma\'lumot topilmadi!', 'error');
            return;
        }

        showToast('PDF tayyorlanmoqda...', 'info');

        // Create a temporary container for styling the report
        const printContainer = document.createElement('div');
        printContainer.className = 'pdf-report-template';
        printContainer.innerHTML = `
            <div class="report-header">
                <div class="header-logo">
                    <img src="img/logo.png" style="width: 80px; height: 80px;">
                </div>
                <div class="header-text">
                    <h2>O'ZBEKISTON TEMIR YO'LLARI</h2>
                    <h3>"${(window.MasofaConfig && window.MasofaConfig.getMasofaInfo && window.MasofaConfig.getMasofaInfo().fullName) ? window.MasofaConfig.getMasofaInfo().fullName.toUpperCase() : 'TEMIR YO\'L MASOFASI'}" FILIALI</h3>
                    <div class="report-title-box">
                        <h1 class="report-main-title">${options.title || 'RASMIY HISOBOT'}</h1>
                        <p class="report-subtitle">${options.subtitle || ''}</p>
                    </div>
                </div>
            </div>
            <div class="report-content">
                ${target.innerHTML}
            </div>
            <div class="report-footer">
                <div class="footer-signatures">
                    <div class="signature">
                        <p>Mas'ul shaxs:</p>
                        <div class="sign-line"></div>
                        <p>${window.Auth?.currentUser ? window.Auth.currentUser.name : '________________'}</p>
                    </div>
                    <div class="signature">
                        <p>Sana:</p>
                        <div class="sign-line"></div>
                        <p>${this.formatDate(new Date())}</p>
                    </div>
                </div>
                <div class="footer-stamp">
                    <div class="stamp-placeholder">M.O'. (Muhr o'rni)</div>
                </div>
            </div>
        `;

        const pdfOptions = {
            margin: [10, 10, 10, 10],
            filename: `${fileName}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(pdfOptions).from(printContainer).save().then(() => {
            showToast('PDF muvaffaqiyatli yuklab olindi!', 'success');
        }).catch(err => {
            console.error('PDF Error:', err);
            showToast('PDF yaratishda xatolik yuz berdi!', 'error');
        });
    },

    /**
     * Empty State Template Generator
 */
    getEmptyState: function (message = "Ma'lumot topilmadi") {
        return `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>${message}</p>
            </div>
        `;
    }
};


// Global shorthand
window.showToast = (msg, type, duration) => SmartUtils.showToast(msg, type, duration);
window.backupSystemData = () => SmartUtils.backupData();

/**
 * Check Authentication State
 * Restores saved user session or shows login page
 */
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            if (user && user.username) {
                // User session exists - let DOMContentLoaded in script.js handle actual restoration
                console.log('Auth: Session found for', user.username);
            }
        } catch (e) {
            console.warn('Auth: Invalid session data, clearing.');
            localStorage.removeItem('currentUser');
        }
    }
}

/**
 * Global Initialization Sequence
 */
// initSmartSystem is now centrally managed in script.js

/**
 * Loading Spinner System
 */
SmartUtils.createLoadingSpinner = function () {
    if (document.getElementById('global-loading-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'global-loading-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px);
        display: none; align-items: center; justify-content: center;
        z-index: 999999; transition: opacity 0.3s;
    `;
    overlay.innerHTML = `
        <div style="text-align: center; color: white;">
            <div style="width: 50px; height: 50px; border: 3px solid rgba(0,198,255,0.2);
                border-top: 3px solid #00c6ff; border-radius: 50%;
                animation: spin 0.8s linear infinite; margin: 0 auto 15px;"></div>
            <p id="loading-text" style="font-family: 'Inter', sans-serif; font-size: 0.9rem;
                color: rgba(255,255,255,0.8);">Yuklanmoqda...</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Spin animatsiyasi
    if (!document.getElementById('loading-spin-style')) {
        const style = document.createElement('style');
        style.id = 'loading-spin-style';
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }
};

SmartUtils.showLoading = function (text = 'Yuklanmoqda...') {
    const overlay = document.getElementById('global-loading-overlay');
    const loadingText = document.getElementById('loading-text');
    if (overlay) {
        overlay.style.display = 'flex';
        if (loadingText) loadingText.textContent = text;
    }
};

SmartUtils.hideLoading = function () {
    const overlay = document.getElementById('global-loading-overlay');
    if (overlay) overlay.style.display = 'none';
};

// Global shorthand
window.showLoading = (text) => SmartUtils.showLoading(text);
window.hideLoading = () => SmartUtils.hideLoading();

/**
 * Global Error Handler
 */
SmartUtils.setupGlobalErrorHandler = function () {
    // Unhandled JS errors
    window.addEventListener('error', (event) => {
        console.error('Global Error:', event.error);
        // Foydalanuvchiga ko'rsatish (faqat muhim xatolar)
        if (event.error && event.error.message && !event.error.message.includes('Script error')) {
            SmartUtils.showToast('Tizimda xatolik yuz berdi: ' + event.error.message, 'error');
        }
    });

    // Unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
        const msg = event.reason?.message || '';
        if (msg.includes('Failed to fetch')) {
            const now = Date.now();
            if (window._lastFetchError && (now - window._lastFetchError < 10000)) return;
            window._lastFetchError = now;

            if (typeof SmartUtils !== 'undefined' && SmartUtils.showToast) {
                SmartUtils.showToast('Server bilan aloqa yo\'q. Internet yoki serverni tekshiring.', 'error');
            }
        }
    });
};
/**
 * Server Watchdog - "Always Online" monitoring
 */
SmartUtils.startServerWatchdog = function () {
    console.log('📡 Server Monitoring faollashdi...');

    let isOffline = false;
    let offlineOverlay = null;
    let failureCount = 0;

    function showOfflineMessage() {
        if (offlineOverlay) return;
        offlineOverlay = document.createElement('div');
        offlineOverlay.id = 'server-offline-overlay';
        offlineOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            z-index: 2000000; color: white; text-align: center; font-family: 'Inter', sans-serif;
            transition: all 0.5s ease; opacity: 0;
        `;
        offlineOverlay.innerHTML = `
            <div style="transform: translateY(20px); transition: 0.5s ease;" id="offline-inner">
                <div class="server-error-icon" style="font-size: 4rem; color: #ef4444; margin-bottom: 20px;">
                    <i class="fas fa-server"></i>
                    <i class="fas fa-unlink" style="font-size: 1.5rem; position: absolute; transform: translate(10px, 20px);"></i>
                </div>
                <h2 style="margin: 0 0 10px; font-weight: 800;">Server bilan aloqa uzildi</h2>
                <p style="color: rgba(255,255,255,0.6); margin-bottom: 25px;">Qayta ulanish kutilmoqda... (Urinish: <span id="fail-counter">0</span>/10)</p>
                <div class="connection-dots" style="display: flex; justify-content: center; gap: 8px;">
                    <div class="dot" style="width: 10px; height: 10px; background: #00c6ff; border-radius: 50%; animation: pulse 1s infinite 0s;"></div>
                    <div class="dot" style="width: 10px; height: 10px; background: #00c6ff; border-radius: 50%; animation: pulse 1s infinite 0.2s;"></div>
                    <div class="dot" style="width: 10px; height: 10px; background: #00c6ff; border-radius: 50%; animation: pulse 1s infinite 0.4s;"></div>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button id="retry-health-btn" style="padding: 10px 20px; background: #00c6ff; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">
                        <i class="fas fa-play"></i> Hozir urinib ko'rish
                    </button>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; cursor: pointer; font-size: 0.8rem;">
                        <i class="fas fa-sync"></i> Sahifani yangilash
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(offlineOverlay);

        const retryBtn = document.getElementById('retry-health-btn');
        if (retryBtn) {
            retryBtn.onclick = () => {
                retryBtn.disabled = true;
                retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tekshirilmoqda...';
                checkHealth().finally(() => {
                    if (retryBtn) {
                        retryBtn.disabled = false;
                        retryBtn.innerHTML = '<i class="fas fa-play"></i> Hozir urinib ko\'rish';
                    }
                });
            };
        }

        setTimeout(() => {
            offlineOverlay.style.opacity = '1';
            const inner = document.getElementById('offline-inner');
            if (inner) inner.style.transform = 'translateY(0)';
        }, 10);
    }

    function hideOfflineMessage() {
        if (offlineOverlay) {
            offlineOverlay.style.opacity = '0';
            setTimeout(() => {
                if (offlineOverlay) {
                    offlineOverlay.remove();
                    offlineOverlay = null;
                }
            }, 500);
        }
    }

    window._manualHealthCheck = checkHealth;

    async function checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            const response = await fetch(`${window.CONFIG?.API_URL || '/api'}/health`, {
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                failureCount = 0;
                if (isOffline) {
                    hideOfflineMessage();
                    SmartUtils.showToast('Server bilan aloqa tiklandi!', 'success');
                    isOffline = false;
                    // Agar aloqa uzilganda ma'lumotlar o'zgargan bo'lishi mumkin bo'lsa,
                    // statik yangilash o'rniga bazi qismlarni yangilash mumkin, lekin reload qilmaymiz
                }
            } else {
                throw new Error('Server returned error');
            }
        } catch (err) {
            failureCount++;
            console.warn(`[Watchdog] Server aloqasi uzildi (${failureCount}/10):`, err.message);

            const counterEl = document.getElementById('fail-counter');
            if (counterEl) counterEl.textContent = failureCount;

            if (failureCount >= 10 && !isOffline) {
                showOfflineMessage();
                isOffline = true;
            }
        }
    }

    // Har 60 soniyada tekshirish (Ortiqcha trafikni oldini olish uchun)
    setInterval(checkHealth, 60000);
    checkHealth(); // Initial check
};

// ==========================================
// 🚀 ENTERPRISE DATABASE SYNC SYSTEM
// ==========================================
(function initDatabaseSync() {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    let syncTimeout = null;
    let pendingUpdates = {};

    // 1. Override setItem so every save automatically goes to the server
    localStorage.setItem = function (key, value) {
        originalSetItem(key, value);

        // Skip synchronizing authentication tokens or UI state
        if (key === 'jwtToken' || key === 'lastWeatherData') return;

        let parsedVal;
        try { parsedVal = JSON.parse(value); } catch (e) { parsedVal = value; }

        pendingUpdates[key] = parsedVal;

        // Debounce sync to avoid spamming the backend
        if (syncTimeout) clearTimeout(syncTimeout);
        syncTimeout = setTimeout(() => {
            const token = originalSetItem.name === 'setItem' ? localStorage.getItem('jwtToken') : null; // fallback check
            const jwt = localStorage.getItem('jwtToken');
            if (jwt && Object.keys(pendingUpdates).length > 0) {
                const keysToSync = Object.keys(pendingUpdates);
                keysToSync.forEach(k => {
                    SmartUtils.fetchAPI('/storage/save', {
                        method: 'POST',
                        body: JSON.stringify({ key: k, data: pendingUpdates[k] })
                    }).catch(e => console.warn('Background sync failed for ' + k, e));
                });
                pendingUpdates = {};
            }
        }, 1500); // 1.5 seconds delay map 
    };

    // 2. Fetch all data from server on startup (Improved Merge Strategy)
    window.pullServerData = async function () {
        const token = localStorage.getItem('jwtToken');
        if (!token) return;

        try {
            const res = await SmartUtils.fetchAPI('/storage/sync');
            if (res && res.data) {
                console.log('🔄 Baza sinxronizatsiyasi boshlandi...');
                let changedCount = 0;
                
                for (let key in res.data) {
                    if (key === 'jwtToken') continue;
                    
                    const serverVal = res.data[key];
                    const serverStr = typeof serverVal === 'object' ? JSON.stringify(serverVal) : String(serverVal);
                    const localVal = localStorage.getItem(key);

                    // Faqat o'zgargan ma'lumotlarni yozamiz (flicker loop'ni oldini olish uchun)
                    if (localVal !== serverStr) {
                        originalSetItem(key, serverStr);
                        changedCount++;
                    }
                }
                
                if (changedCount > 0) {
                    console.log(`✅ Tizim sinxronlanildi: ${changedCount} ta o'zgarish.`);
                    // Faqat o'zgarish bo'lgandagina UI ni yangilashga signal berish mumkin
                    window.dispatchEvent(new Event('storage_synced'));
                }
            }
        } catch (e) {
            console.error('Server ma\'lumotlar bazasiga kirib bo\'lmadi:', e);
        }
    };

    /**
     * XSS Himoyasi - HTML belgilarni xavfsiz holatga o'tkazish
     */
    SmartUtils.sanitizeHTML = function(str) {
        if (!str || typeof str !== 'string') return str;
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    // Tizimga kirishdan keyin ma'lumotlarni tortishni boshlash
    if (localStorage.getItem('jwtToken')) {
        setTimeout(() => window.pullServerData(), 1000);
    }
})();

// ==========================================
// 🚀 REAL-TIME SOCKET.IO PUSH NOTIFICATIONS
// ==========================================
window.AppSocket = window.socket || null;
try {
    if (typeof io !== 'undefined') {
        if (!window.AppSocket) {
            window.AppSocket = io(window.CONFIG?.WS_URL || window.location.origin, {
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
                auth: (cb) => cb({ token: localStorage.getItem('jwtToken') || '' })
            });
        }
        window.socket = window.AppSocket;

        window.AppSocket.on('connect', () => {
            console.log('🔗 WebSocket orqali jonli aloqa (Live Sync) ulangan!');
        });

        // Hozirgi barcha modul yangilanishlarini jonli tutish (Broadcast messages)
        window.AppSocket.on('new_report', (data) => {
            SmartUtils.showToast(`${data.department || 'Bo\'lim'}: Yangi hujjat qo'shildi!`, 'info');
        });

        window.AppSocket.on('system_alert', (data) => {
            SmartUtils.showToast(`⚠️ Diqqat: ${data.message}`, 'warning', 10000);
            const audio = new Audio('https://www.soundjay.com/buttons/beep-07.wav');
            audio.play().catch(e => { });

            // Brauzer bildirishnomasi — tab fonda bo'lsa ham ko'rinadi
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                try {
                    new Notification('Smart PCH — Diqqat!', {
                        body: data.message,
                        icon: '/img/logo.png',
                        tag: 'smart-pch-alert'
                    });
                } catch (e) { /* ba'zi brauzerlarda Notification cheklangan bo'lishi mumkin */ }
            }
        });

        window.AppSocket.on('storage_updated', (data) => {
            // Agar boshqa kompyuterda storage_updated signali kelsa bazani sinxron qiladi
            const userToken = localStorage.getItem('jwtToken');
            if (userToken && data.key !== 'jwtToken') {
                console.log(`Boshqa kompyuterdan o'zgarish: ${data.key}`);
                if (window.pullServerData) { window.pullServerData(); }
            }
        });
    }
} catch (e) {
    console.error('Socket.io error:', e);
}

// Finalize Export
window.SmartUtils = SmartUtils;
