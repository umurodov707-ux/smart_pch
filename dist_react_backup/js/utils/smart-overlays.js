/**
 * UTILS Layer: Map Overlays (Defects, Warnings, Closures)
 */
const SmartOverlays = {
    layers: {
        defects: L.layerGroup(),
        warnings: L.layerGroup(),
        closures: L.layerGroup()
    },

    init: function(map) {
        if (!map) return;
        this.layers.defects.addTo(map);
        this.layers.warnings.addTo(map);
        this.layers.closures.addTo(map);
        
        this.refreshAll();
        setInterval(() => this.refreshAll(), 30000); // 30s auto-refresh
    },

    refreshAll: async function() {
        await Promise.all([
            this.loadDefects(),
            this.loadWarnings()
        ]);
    },

    loadDefects: async function() {
        try {
            const data = await SmartUtils.fetchAPI('/defects');
            this.layers.defects.clearLayers();
            data.forEach(defect => {
                // Determine coordinates (simulated if missing)
                const lat = defect.lat || (40 + (Math.random() - 0.5) * 2);
                const lng = defect.lng || (65 + (Math.random() - 0.5) * 2);

                const icon = L.divIcon({
                    className: 'defect-marker',
                    html: `<div style="background: #ef4444; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);"></div>`,
                    iconSize: [20, 20]
                });

                L.marker([lat, lng], { icon })
                    .bindPopup(`<strong>DEFEKT:</strong> ${defect.issue}<br><strong>Kilometr:</strong> ${defect.km || 'Noma\'lum'}`)
                    .addTo(this.layers.defects);
            });
        } catch (e) { console.error('Overlay error (defects):', e); }
    },

    loadWarnings: async function() {
        try {
            const data = await SmartUtils.fetchAPI('/infrastructure/warnings'); // Or /api/digital_warnings
            this.layers.warnings.clearLayers();
            data.forEach(warn => {
                const lat = warn.lat || (40 + (Math.random() - 0.5) * 2);
                const lng = warn.lng || (65 + (Math.random() - 0.5) * 2);

                const icon = L.divIcon({
                    className: 'warn-marker',
                    html: `<div style="background: #f59e0b; border: 2px solid white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;"><i class="fas fa-exclamation"></i></div>`,
                    iconSize: [18, 18]
                });

                L.marker([lat, lng], { icon })
                    .bindPopup(`<strong>OGOHLANTIRISH:</strong> ${warn.message}<br><strong>Tezlik:</strong> ${warn.speed_limit} km/soat`)
                    .addTo(this.layers.warnings);
            });
        } catch (e) { console.error('Overlay error (warnings):', e); }
    }
};

window.SmartOverlays = SmartOverlays;
