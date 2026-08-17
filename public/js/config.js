/**
 * SMART PCH - Global Configuration
 * Web Environment Configuration
 */

window.CONFIG = {
    APP_NAME: "Smart PCH Dispatcher",
    VERSION: "2.2.0",

    // API URL Detection
    API_URL: (function () {
        const isLocal = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.startsWith('192.168.') ||
            window.location.hostname.startsWith('10.') ||
            window.location.hostname.startsWith('172.');
        const savedApiUrl = localStorage.getItem('custom_api_url');

        if (savedApiUrl) return savedApiUrl;

        // Web (Brauzer) rejimida
        if (window.location.protocol.startsWith('http')) {
            if (isLocal) {
                // Brauzerning joriy portidan foydalanamiz, agar u 3000 (Vite) bo'lsa 6878 (PM2 default) ni ishlatamiz
                const currentPort = window.location.port;
                if (currentPort === '3000') {
                    return `http://${window.location.hostname}:7007/api`;
                }
                return window.location.origin + '/api';
            }
            return window.location.origin + '/api';
        }

        return '/api';
    })(),

    // WebSocket URL Detection
    WS_URL: (function () {
        const isLocal = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.startsWith('192.168.') ||
            window.location.hostname.startsWith('10.') ||
            window.location.hostname.startsWith('172.');

        if (window.location.protocol.startsWith('http')) {
            if (isLocal) {
                const currentPort = window.location.port;
                if (currentPort === '3000') {
                    return `http://${window.location.hostname}:7007`;
                }
                return window.location.origin;
            }
            return window.location.origin;
        }

        return window.location.origin;
    })(),

    // Map Coordinates (Bukhara Central)
    BUKHARA_COORDS: {
        lat: 39.7681,
        lon: 64.4556
    },

    // Google OAuth (index.html meta or .env orqali sozlash mumkin)
    GOOGLE_CLIENT_ID: (function () {
        const meta = document.querySelector('meta[name="smartpch-google-client-id"]');
        const fromMeta = meta && meta.content ? meta.content.trim() : '';
        if (fromMeta && !fromMeta.includes('YOUR_GOOGLE_CLIENT_ID')) return fromMeta;
        return '';
    })()
};

/**
 * Markaziy API headerlari — barcha modullar shu yordamchidan foydalansin.
 * config.js birinchi yuklanadi, shuning uchun offline-manager ham ishlata oladi.
 */
window.SmartPCH = {
    CSRF_HEADER: 'SmartPCH-WebApp',

    getApiHeaders: function (extra = {}, opts = {}) {
        const json = opts.json !== false;
        const token = localStorage.getItem('jwtToken');
        return {
            'X-Requested-With': this.CSRF_HEADER,
            ...(json ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...extra
        };
    },

    secureFetch: async function (url, options = {}) {
        const isFormData = options.body instanceof FormData;
        const headers = this.getApiHeaders(options.headers || {}, { json: !isFormData });
        const response = await fetch(url, { ...options, headers });
        return response;
    }
};

console.log(`[Config] Running on Web/Mobile`);
console.log(`[Config] API Endpoint: ${window.CONFIG.API_URL}`);
