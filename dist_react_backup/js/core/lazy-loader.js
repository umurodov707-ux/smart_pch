/**
 * LazyLoader — og'ir kutubxonalarni faqat kerak bo'lganda yuklash
 */
window.LazyLoader = {
    _promises: {},

    loadScript(src) {
        if (this._promises[src]) return this._promises[src];
        this._promises[src] = new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const el = document.createElement('script');
            el.src = src;
            el.async = true;
            el.onload = () => resolve();
            el.onerror = () => reject(new Error(`Skript yuklanmadi: ${src}`));
            document.head.appendChild(el);
        });
        return this._promises[src];
    },

    loadStylesheet(href) {
        const key = 'css:' + href;
        if (this._promises[key]) return this._promises[key];
        this._promises[key] = new Promise((resolve, reject) => {
            if (document.querySelector(`link[href="${href}"]`)) {
                resolve();
                return;
            }
            const el = document.createElement('link');
            el.rel = 'stylesheet';
            el.href = href;
            el.onload = () => resolve();
            el.onerror = () => reject(new Error(`CSS yuklanmadi: ${href}`));
            document.head.appendChild(el);
        });
        return this._promises[key];
    },

    /** Face-api + FaceService + modellar */
    async loadFaceStack() {
        await this.loadScript('/js/lib/face-api.min.js?v=2026.03.11.1');
        if (!window.FaceService) {
            await this.loadScript('/js/face-service.js?v=2026.03.11.1');
        }
        await window.FaceService.loadModels();
        return window.FaceService;
    },

    /** Leaflet xarita kutubxonasi */
    async loadLeaflet() {
        if (typeof L !== 'undefined') return L;
        await this.loadStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        await this.loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
        return window.L;
    },

    /** Chart.js — lokal nusxa */
    async loadChart() {
        if (typeof Chart !== 'undefined') return Chart;
        await this.loadScript('/js/lib/chart.min.js');
        return window.Chart;
    }
};
