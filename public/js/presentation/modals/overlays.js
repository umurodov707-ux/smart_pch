/**
 * SMART OVERLAYS
 * Synchronizes real-time data onto the PCH Map
 */
const SmartOverlays = {
    map: null,
    layers: {
        defects: null,
        okno: null
    },

    init: function(mapInstance) {
        this.map = mapInstance;
        this.layers.defects = L.layerGroup().addTo(this.map);
        this.layers.okno = L.layerGroup().addTo(this.map);

        this.refresh();
        setInterval(() => this.refresh(), 10000); // 10s refresh
    },

    refresh: async function() {
        if (!this.map) return;
        await this.syncDefects();
        await this.syncOKNO();
    },

    syncDefects: async function() {
        try {
            // Updated route to use global defects (if implemented) or fallback
            let defects = [];
            try {
                defects = await ApiClient.get('/api/defects');
            } catch(e) {
                // Fallback to specific bolinmas if global fails
                defects = await ModernizationRepo.getDefects('bolinma1');
            }
            
            this.layers.defects.clearLayers();

            defects.forEach(defect => {
                // Find approximate coordinates based on KM if lat/lng not in defect
                // Strategy: Find station with closest KM
                const coords = this.getCoordsFromKM(defect.km || defect.pk);
                if (coords) {
                    const icon = L.divIcon({
                        className: 'defect-pulse',
                        html: `<div style="background:rgba(239, 68, 68, 0.8); width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 0 15px #ef4444; animation: pulse 1.5s infinite;"></div>`,
                        iconSize: [16, 16]
                    });

                    L.marker(coords, { icon })
                        .bindPopup(`
                            <div style="padding:10px; min-width:150px;">
                                <div style="color:#ef4444; font-weight:900; margin-bottom:5px;"><i class="fas fa-exclamation-triangle"></i> NOSOZLIK</div>
                                <div style="color:#fff; font-size:0.9rem; margin-bottom:8px;">${defect.issue}</div>
                                <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">KM: ${defect.km || defect.pk} | ${defect.date}</div>
                            </div>
                        `, { className: 'modern-popup' })
                        .addTo(this.layers.defects);
                }
            });
        } catch (err) {
            console.error('Defect overlay sync error:', err);
        }
    },

    syncOKNO: async function() {
        try {
            const plans = await ModernizationRepo.getOKNOPlans();
            const activePlans = plans.filter(p => p.status === 'planned');

            this.layers.okno.clearLayers();

            activePlans.forEach(plan => {
                const coords = this.getCoordsFromKM(plan.km);
                if (coords) {
                    const icon = L.divIcon({
                        className: 'okno-marker',
                        html: `<div style="background:rgba(139, 92, 246, 0.9); width:40px; height:24px; border-radius:12px; border:1px solid #a78bfa; color:white; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; box-shadow:0 0 10px rgba(139, 92, 246, 0.5);">OKNO</div>`,
                        iconSize: [40, 24]
                    });

                    L.marker(coords, { icon })
                        .bindPopup(`
                            <div style="padding:10px; min-width:200px;">
                                <div style="color:#a78bfa; font-weight:900; margin-bottom:5px;"><i class="fas fa-hammer"></i> TA'MIRLASH ISHLARI (OKNO)</div>
                                <div style="color:#fff; font-size:0.9rem; margin-bottom:8px;">${escapeHtml(plan.title)}</div>
                                <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">Vaxt: ${new Date(plan.start_time).toLocaleTimeString()} - ${new Date(plan.end_time).toLocaleTimeString()}</div>
                            </div>
                        `, { className: 'modern-popup' })
                        .addTo(this.layers.okno);
                }
            });
        } catch (err) {
            console.error('OKNO overlay sync error:', err);
        }
    },

    getCoordsFromKM: function(km) {
        if (!km) return null;
        const targetKM = parseInt(km);
        
        // Use PCH16 stations as reference (approximate mapping)
        const stations = window.PCH_STATIONS_DATA?.pch16 || [];
        if (stations.length === 0) return null;

        // Find the closest station
        let closest = stations[0];
        let minDiff = Math.abs(parseInt(stations[0].km) - targetKM);

        for (let i = 1; i < stations.length; i++) {
            const diff = Math.abs(parseInt(stations[i].km) - targetKM);
            if (diff < minDiff) {
                minDiff = diff;
                closest = stations[i];
            }
        }

        // Add a small random offset to avoid direct overlapping with station marker
        return [closest.lat + (Math.random() - 0.5) * 0.005, closest.lng + (Math.random() - 0.5) * 0.005];
    }
};

window.SmartOverlays = SmartOverlays;
