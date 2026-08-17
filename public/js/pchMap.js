/**
 * PCH STANSIYALAR XARITASI
 * ========================
 * Faol temir yo'l masofasidagi barcha stansiyalarni
 * Leaflet xaritasida ko'rsatadi.
 *
 * Qo'llanish:
 *   window.openPCHMap()  — alohida modal oyna sifatida
 */

// ============================================================
// BARCHA PCH STANSIYALARI MA'LUMOTLARI
// (Haqiqiy koordinatlar, O'zbekiston temir yo'llari)
// ============================================================
window.PCH_STATIONS_DATA = {

    // PCh-16: Qorlitog' TYM — Buxoro → Miskin → Turon (4020–4303 km)
    // Foydalanuvchi o'zi stansiyalarni kiritishi uchun bo'shatildi.
    pch16: [
        { name: "Navbahor", km: 4035, lat: 40.085716, lng: 64.095240, type: "станция", bolinma: 1 },
        { name: "Navbahor-Yaxshilik", km: 4051, lat: 40.244340, lng: 63.973317, type: "разъезд", bolinma: 1 },
        { name: "Yaxshilik", km: 4066, lat: 40.168652, lng: 64.064746, type: "станция", bolinma: 2 },
        { name: "Yaxshilik-Parvoz", km: 4080, lat: 40.396856, lng: 63.780761, type: "разъезд", bolinma: 2 },
        { name: "Parvoz", km: 4098, lat: 40.308671, lng: 63.890941, type: "станция", bolinma: 3 },
        { name: "Parvoz-Qorlitog'", km: 4109, lat: 40.550408, lng: 63.516860, type: "разъезд", bolinma: 3 },
        { name: "Parvoz-Qorlitog'", km: 4122, lat: 40.617715, lng: 63.337179, type: "разъезд", bolinma: 4 },
        { name: "Qorlitog'", km: 4137, lat: 40.506753, lng: 63.631133, type: "станция", bolinma: 4 },
        { name: "Qorlitog'-Kiyikli", km: 4152, lat: 40.738916, lng: 63.014406, type: "разъезд", bolinma: 4 },
        { name: "Kiyikli", km: 4168, lat: 40.661524, lng: 63.220707, type: "станция", bolinma: 5 },
        { name: "Kiyikli-Xizirbobo", km: 4177, lat: 40.830601, lng: 62.796671, type: "разъезд", bolinma: 5 },
        { name: "Kiyikli-Xizirbobo", km: 4182, lat: 40.864685, lng: 62.721925, type: "разъезд", bolinma: 6 },
        { name: "Xizirbobo", km: 4200, lat: 40.790751, lng: 62.889025, type: "станция", bolinma: 6 },
        { name: "Xizirbobo-Jayhun", km: 4216, lat: 40.995852, lng: 62.420577, type: "разъезд", bolinma: 7 },
        { name: "Jayhun", km: 4232, lat: 40.933599, lng: 62.563284, type: "станция", bolinma: 7 },
        { name: "Jayhun-Dautepa", km: 4246, lat: 41.141253, lng: 62.083646, type: "разъезд", bolinma: 8 },
        { name: "Dautepa", km: 4261, lat: 41.209499, lng: 61.922516, type: "станция", bolinma: 9 },
        { name: "Dautepa-Turon", km: 4280, lat: 41.287231, lng: 61.738561, type: "разъезд", bolinma: 9 },
        { name: "Turon", km: 4297, lat: 41.338078, lng: 61.530010, type: "станция", bolinma: 10 }
    ],

    // PCh-1: Salar TYM (2800–2940 km)
    pch1: [
        { name: "Toshkent-Janubiy", km: 2800, lat: 41.2800, lng: 69.2200, type: "станция", bolinma: 1 },
        { name: "Salar", km: 2825, lat: 41.2100, lng: 69.2800, type: "станция", bolinma: 2 },
        { name: "Ohangaron", km: 2860, lat: 40.9100, lng: 69.6500, type: "станция", bolinma: 4 },
        { name: "Yangiyo'l", km: 2900, lat: 41.1100, lng: 69.0400, type: "станция", bolinma: 6 },
        { name: "Tuyabo'g'iz", km: 2940, lat: 41.0500, lng: 69.1000, type: "станция", bolinma: 8 },
    ],

    // PCh-2: Toshkent TYM (2940–3050 km)
    pch2: [
        { name: "Toshkent-Yuk", km: 2940, lat: 41.3200, lng: 69.2700, type: "станция", bolinma: 1 },
        { name: "Keles", km: 2980, lat: 41.3900, lng: 69.0900, type: "станция", bolinma: 3 },
        { name: "Bekobod", km: 3050, lat: 40.2200, lng: 69.2400, type: "станция", bolinma: 7 },
    ],

    // PCh-3: Qamchiq TYM (Angren-Pop)
    pch3: [
        { name: "Angren", km: 116, lat: 41.0200, lng: 70.1500, type: "станция", bolinma: 1 },
        { name: "Angren-Qamchiq", km: 135, lat: 41.0700, lng: 70.3000, type: "разъезд", bolinma: 2 },
        { name: "Qamchiq (tunneli)", km: 190, lat: 41.1000, lng: 70.8000, type: "tunnel", bolinma: 5 },
        { name: "Pop", km: 268, lat: 41.0000, lng: 71.1200, type: "станция", bolinma: 9 },
    ],

    // PCh-5: Jizzax TYM (3170–3310 km)
    pch5: [
        { name: "Xovos", km: 3170, lat: 40.7200, lng: 68.8000, type: "станция", bolinma: 1 },
        { name: "G'allaorol", km: 3210, lat: 40.4500, lng: 68.4000, type: "станция", bolinma: 3 },
        { name: "Jizzax", km: 3310, lat: 40.1200, lng: 67.8400, type: "станция", bolinma: 8 },
    ],

    // PCh-6: Qo'qon TYM (268–430 km)
    pch6: [
        { name: "Pop", km: 268, lat: 41.0000, lng: 71.1200, type: "станция", bolinma: 1 },
        { name: "Qo'qon", km: 320, lat: 40.5300, lng: 70.9400, type: "станция", bolinma: 3 },
        { name: "Margilan", km: 360, lat: 40.4700, lng: 71.7200, type: "станция", bolinma: 5 },
        { name: "Farg'ona", km: 390, lat: 40.3900, lng: 71.7900, type: "станция", bolinma: 7 },
        { name: "Hazratqo'l", km: 430, lat: 40.6600, lng: 72.5400, type: "станция", bolinma: 9 },
    ],

    // PCh-7: Andijon TYM (430–545 km)
    pch7: [
        { name: "Hazratqo'l", km: 430, lat: 40.6600, lng: 72.5400, type: "станция", bolinma: 1 },
        { name: "Xo'jaobod", km: 480, lat: 40.7500, lng: 72.7500, type: "станция", bolinma: 3 },
        { name: "Andijon", km: 545, lat: 40.7800, lng: 72.3400, type: "станция", bolinma: 7 },
    ],

    // PCh-8: Namangan TYM (545–660 km)
    pch8: [
        { name: "Andijon", km: 545, lat: 40.7800, lng: 72.3400, type: "станция", bolinma: 1 },
        { name: "Namangan", km: 615, lat: 41.0000, lng: 71.6700, type: "станция", bolinma: 5 },
        { name: "Chust", km: 660, lat: 40.9900, lng: 71.1200, type: "станция", bolinma: 7 },
    ],

    // PCh-10: Samarqand TYM (3450–3600 km)
    pch10: [
        { name: "Kattaqo'rg'on", km: 3450, lat: 39.9000, lng: 66.2600, type: "станция", bolinma: 1 },
        { name: "Samarqand", km: 3540, lat: 39.6500, lng: 66.9600, type: "станция", bolinma: 5 },
        { name: "Samarqand-Sharq", km: 3600, lat: 39.6200, lng: 67.1000, type: "станция", bolinma: 8 },
    ],

    // PCh-11: Navoiy TYM (3600–3745 km)
    pch11: [
        { name: "Samarqand-Sharq", km: 3600, lat: 39.6200, lng: 67.1000, type: "станция", bolinma: 1 },
        { name: "Navoiy", km: 3745, lat: 40.0800, lng: 65.3700, type: "станция", bolinma: 9 },
    ],

    // PCh-12: Buxoro TYM (3745–3880 km)
    pch12: [
        { name: "Navoiy", km: 3745, lat: 40.0800, lng: 65.3700, type: "станция", bolinma: 1 },
        { name: "Kogon", km: 3820, lat: 39.7200, lng: 64.5500, type: "станция", bolinma: 5 },
        { name: "Buxoro", km: 3880, lat: 39.7700, lng: 64.4500, type: "станция", bolinma: 8 },
    ],

    // PCh-17: Qarshi TYM (4303–4430 km)
    pch17: [
        { name: "Turon", km: 4303, lat: 38.7000, lng: 65.2000, type: "станция", bolinma: 1 },
        { name: "Qarshi", km: 4430, lat: 38.8600, lng: 65.7900, type: "станция", bolinma: 8 },
    ],

    // PCh-19: Termiz TYM (4540–4660 km)
    pch19: [
        { name: "G'uzor", km: 4540, lat: 38.6200, lng: 66.2500, type: "станция", bolinma: 1 },
        { name: "Qarshi-Janub", km: 4575, lat: 38.5000, lng: 66.5000, type: "разъезд", bolinma: 3 },
        { name: "Shahrisabz", km: 4600, lat: 39.0600, lng: 66.8300, type: "станция", bolinma: 5 },
        { name: "Termiz", km: 4660, lat: 37.2200, lng: 67.2800, type: "станция", bolinma: 8 },
    ],

    // PCh-20: Urgench TYM (3880–4030 km)
    pch20: [
        { name: "Buxoro-2", km: 3880, lat: 39.7700, lng: 64.4500, type: "станция", bolinma: 1 },
        { name: "Urgench", km: 4030, lat: 41.5500, lng: 60.6300, type: "станция", bolinma: 9 },
    ],

    // PCh-22: Qo'ng'irot TYM (4135–4370 km)
    pch22: [
        { name: "Xiva", km: 4135, lat: 41.3800, lng: 60.3600, type: "станция", bolinma: 1 },
        { name: "Beruniy", km: 4250, lat: 41.6900, lng: 60.7500, type: "станция", bolinma: 6 },
        { name: "Qo'ng'irot", km: 4370, lat: 43.0800, lng: 58.9000, type: "станция", bolinma: 10 },
    ],
};

// Bo'linma ranglari
const BOLINMA_COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12',
    '#1abc9c', '#e67e22', '#34495e', '#16a085', '#8e44ad'
];

// PREMIUM STANSIYA IKONASI (Dynamic SVG)
function getStationIcon(type, color, name) {
    const isStation = type === 'станция';
    const size = isStation ? 32 : 24;
    const iconColor = color || '#3b82f6';
    
    return L.divIcon({
        className: 'modern-station-marker',
        html: `
            <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
                <!-- Pulsating Glow -->
                <div style="position: absolute; width: 100%; height: 100%; background: ${iconColor}; border-radius: 50%; opacity: 0.3; animation: station-pulse 2s infinite;"></div>
                
                <!-- Main Body -->
                <div style="position: relative; width: ${size-8}px; height: ${size-8}px; background: #0f172a; border: 2px solid ${iconColor}; border-radius: ${isStation ? '8px' : '50%'}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${iconColor}66;">
                    <i class="fas ${isStation ? 'fa-train-subway' : 'fa-circle-dot'}" style="color: ${iconColor}; font-size: ${size/2.5}px;"></i>
                </div>

                <!-- Label -->
                <div style="position: absolute; top: ${size+4}px; left: 50%; transform: translateX(-50%); background: rgba(15,23,42,0.95); backdrop-filter: blur(4px); padding: 2px 10px; border-radius: 4px; border: 1px solid ${iconColor}44; white-space: nowrap; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 10px; color: #fff; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                    ${name.toUpperCase()}
                </div>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
    });
}

// Sun'iy inshoot ikonasi
function getStructureIcon(type) {
    const iconMap = {
        'bridge': { icon: 'fa-bridge', color: '#10b981' },
        'tunnel': { icon: 'fa-archway', color: '#60a5fa' },
        'culvert': { icon: 'fa-water', color: '#f59e0b' },
        'pedestrian_bridge': { icon: 'fa-walking', color: '#9b59b6' }
    };
    const info = iconMap[type] || { icon: 'fa-landmark', color: '#ffffff' };

    return L.divIcon({
        className: '',
        html: `<div style="
            background: rgba(15, 23, 42, 0.9);
            width: 24px;
            height: 24px;
            border-radius: 6px;
            border: 1.5px solid ${info.color};
            color: ${info.color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            box-shadow: 0 0 10px ${info.color}55;
        "><i class="fas ${info.icon}"></i></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

// ============================================================
// XARITANI OCHISH (Railway Observer Dizayni)
// ============================================================
window.TRAIN_SCHEDULE = [
    { id: 't1', name: 'AFROSIYOB 762', from: 'Buxoro', to: 'Turon', depTime: '16:00', arrTime: '17:45', color: '#3b82f6' },
    { id: 't2', name: 'SHARQ 09', from: 'Turon', to: 'Buxoro', depTime: '16:30', arrTime: '18:50', color: '#f59e0b' }
];

window._trainMarkers = {};
window._workerMarkers = {};
window._workerRoutes = {};

window.updateLiveWorkers = function (map) {
    if (!window.INITIAL_DATA || !window.INITIAL_DATA.workers) return;
    
    window.INITIAL_DATA.workers.forEach(worker => {
        // Simulated movement for PCH Map
        worker.lat += (Math.random() - 0.5) * 0.001;
        worker.lng += (Math.random() - 0.5) * 0.001;

        // Path tracking
        if (!window._workerRoutes[worker.id]) window._workerRoutes[worker.id] = [];
        window._workerRoutes[worker.id].push([worker.lat, worker.lng]);
        if (window._workerRoutes[worker.id].length > 50) window._workerRoutes[worker.id].shift();

        // Marker logic
        if (!window._workerMarkers[worker.id]) {
            const workerIcon = L.divIcon({
                className: 'worker-marker',
                html: `<div style="background: ${worker.color}; border: 2px solid #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${worker.color}99; color: #fff; font-size: 12px; position: relative;">
                            <i class="fas fa-user-hard-hat"></i>
                            <div style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); background: rgba(15,23,42,0.9); color: #fff; padding: 1px 6px; border-radius: 4px; font-size: 0.6rem; white-space: nowrap; font-weight: 700; border: 1px solid ${worker.color}55;">${worker.name}</div>
                       </div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
            window._workerMarkers[worker.id] = L.marker([worker.lat, worker.lng], { icon: workerIcon, zIndexOffset: 1500 }).addTo(map);
            
            // Initial path polyline
            if (window._workerRoutes[worker.id].length > 1) {
                window._workerRoutes[worker.id + '_path'] = L.polyline(window._workerRoutes[worker.id], {
                    color: worker.color,
                    weight: 3,
                    opacity: 0.6,
                    smoothFactor: 1
                }).addTo(map);
            }
        } else {
            window._workerMarkers[worker.id].setLatLng([worker.lat, worker.lng]);
            
            // Update polyline
            if (window._workerRoutes[worker.id + '_path']) {
                window._workerRoutes[worker.id + '_path'].setLatLngs(window._workerRoutes[worker.id]);
            } else if (window._workerRoutes[worker.id].length > 1) {
                window._workerRoutes[worker.id + '_path'] = L.polyline(window._workerRoutes[worker.id], {
                    color: worker.color, weight: 3, opacity: 0.6, smoothFactor: 1
                }).addTo(map);
            }
        }
    });
};

window.updateLiveTrains = function (map, stations) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

    window.TRAIN_SCHEDULE.forEach(train => {
        const [dH, dM] = train.depTime.split(':').map(Number);
        const [aH, aM] = train.arrTime.split(':').map(Number);
        const depTotal = dH * 60 + dM;
        const arrTotal = aH * 60 + aM;

        if (currentMinutes >= depTotal && currentMinutes <= arrTotal) {
            const progress = (currentMinutes - depTotal) / (arrTotal - depTotal);

            // Find coordinates
            const fromSt = stations.find(s => s.name.includes(train.from));
            const toSt = stations.find(s => s.name.includes(train.to));

            if (fromSt && toSt) {
                const lat = fromSt.lat + (toSt.lat - fromSt.lat) * progress;
                const lng = fromSt.lng + (toSt.lng - fromSt.lng) * progress;

                if (!window._trainMarkers[train.id]) {
                    const trainIcon = L.divIcon({
                        className: 'train-marker',
                        html: `<div style="background: ${train.color}; border: 2px solid #fff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${train.color}; color: #fff; font-size: 14px; position: relative;">
                                    <i class="fas fa-train"></i>
                                    <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; white-space: nowrap; font-weight: 800;">${train.name}</div>
                               </div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });
                    window._trainMarkers[train.id] = L.marker([lat, lng], { icon: trainIcon, zIndexOffset: 2000 }).addTo(map);
                } else {
                    window._trainMarkers[train.id].setLatLng([lat, lng]);
                }
            }
        } else if (window._trainMarkers[train.id]) {
            map.removeLayer(window._trainMarkers[train.id]);
            delete window._trainMarkers[train.id];
        }
    });
};

// ============================================================
// XARITANI OCHISH (Railway Observer Dizayni)
// ============================================================
window.openPCHMap = function () {
    const activeMasofa = window.ACTIVE_MASOFA || window.getActiveMasofa?.();
    const stations = getStationsForMasofa('pch16');

    // Modal
    const existing = document.getElementById('pch-map-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'pch-map-modal';
    modal.className = 'active';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: #f8f9fa; z-index: 10050;
        display: flex; flex-direction: column;
        font-family: 'Segoe UI', sans-serif;
    `;

    modal.innerHTML = `
        <style>
            /* ====== PREMIUM MAP STYLES ====== */
            .modern-station-marker { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .modern-station-marker:hover { transform: scale(1.25); cursor: pointer; z-index: 9999 !important; }
            @keyframes station-pulse { 0% { transform: scale(0.8); opacity: 0.4; } 50% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(0.8); opacity: 0.4; } }
            
            /* Train glow animation */
            .train-marker { transition: all 1s linear; }
            .train-marker div { animation: trainGlow 1.5s ease-in-out infinite alternate; }
            @keyframes trainGlow { from { box-shadow: 0 0 12px currentColor; } to { box-shadow: 0 0 25px currentColor, 0 0 50px currentColor; } }
            
            /* Speed zone pulse */
            .speed-zone-marker { animation: speedPulse 2s infinite; }
            @keyframes speedPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
            
            /* KM Labels */
            .km-label { opacity: 0.7; transition: opacity 0.3s; }
            .km-label:hover { opacity: 1; }

            /* Leaflet Popup Override */
            .leaflet-popup-content-wrapper { background: rgba(15,23,42,0.95) !important; backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 16px !important; color: #fff !important; box-shadow: 0 15px 40px rgba(0,0,0,0.5) !important; }
            .leaflet-popup-tip { background: rgba(15,23,42,0.95) !important; }
            .leaflet-popup-close-button { color: #fff !important; }
            
            /* Scheduler Panel */
            .scheduler-panel { position: absolute; top: 20px; right: 20px; z-index: 1000; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); width: 280px; padding: 20px; color: #fff; box-shadow: 0 15px 35px rgba(0,0,0,0.4); }
            
            /* Ruler tool */
            .ruler-active { border: 2px solid #ffd700 !important; background: rgba(255,215,0,0.2) !important; color: #ffd700 !important; }
            .leaflet-container.ruler-mode { cursor: crosshair !important; }
        </style>

        <div id="pch-leaflet-map" style="flex: 1; width: 100%; z-index: 1; background: #0f172a;"></div>

        <!-- RIGHT PANEL: SCHEDULER -->
        <div class="scheduler-panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; font-size: 0.85rem; font-weight: 900; color: #3b82f6; letter-spacing: 1px;">TRAIN MOVEMENT GRAFIK</h4>
                <button onclick="window.openTrainAdminModal()" style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; color: #3b82f6; border-radius: 6px; padding: 4px 8px; font-size: 0.65rem; font-weight: 800; cursor: pointer;">
                    <i class="fas fa-edit"></i> EDIT
                </button>
            </div>
            <div id="train-movement-list" style="display: flex; flex-direction: column; gap: 12px;">
                ${window.renderTrainListHTML()}
            </div>
        </div>

        <!-- LEFT PANEL: CONTROLS -->
        <div style="position: absolute; top: 20px; left: 20px; z-index: 1000; background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(25px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; width: 350px; padding: 25px; display: flex; flex-direction: column; gap: 15px; color: white; box-shadow: 0 0 50px rgba(56, 189, 248, 0.15), inset 0 0 20px rgba(56, 189, 248, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                <div>
                    <div style="font-size: 0.65rem; font-weight: 900; color: #38bdf8; letter-spacing: 2px; margin-bottom: 4px; display:flex; align-items:center; gap:6px;">
                        <span style="width:8px; height:8px; background:#38bdf8; border-radius:50%; box-shadow:0 0 10px #38bdf8; animation: pulse 2s infinite;"></span> DIGITAL TWIN MODE
                    </div>
                    <h3 style="margin: 0; font-size: 1.1rem; color: #fff; font-weight: 900; line-height: 1.3; text-transform: uppercase; text-shadow: 0 0 10px rgba(255,255,255,0.3);">Raqamli Egizak Xaritasi</h3>
                </div>
                <button onclick="window.closePCHMapModal()" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: 0.2s; box-shadow: 0 0 15px rgba(239,68,68,0.2);">&times;</button>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <div style="position: relative; flex: 1;">
                    <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 0.8rem;"></i>
                    <input type="text" placeholder="Stansiya qidirish..." oninput="filterStationList(this.value)" 
                        style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; outline: none; background: rgba(0,0,0,0.2); color: white; font-size: 0.82rem; box-sizing: border-box;">
                </div>
                <button onclick="refreshMapData()" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); width: 42px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;"><i class="fas fa-sync-alt"></i></button>
            </div>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="if(window._userLocationMarker) window._pchMap.flyTo(window._userLocationMarker.getLatLng(), 15)" 
                    style="flex: 1; background: #27ae60; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);">
                    <i class="fas fa-crosshairs"></i> GPS
                </button>
                <button onclick="window.toggleRulerMode(this)" id="ruler-btn"
                    style="flex: 1; background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); color: #ffd700; padding: 12px; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s;">
                    <i class="fas fa-ruler"></i> O'LCHASH
                </button>
            </div>
            
            <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 800; text-transform: uppercase;">MODERNIZATION 4.0 TOOLS</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="window.toggleDroneFlyover(this)" 
                    style="flex: 1; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); color: #a78bfa; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.2s;">
                    <i class="fas fa-helicopter"></i> DRON REJIMI
                </button>
                <button onclick="window.toggleHeatmap(this)" 
                    style="flex: 1; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.2s;">
                    <i class="fas fa-fire"></i> HEATMAP
                </button>
                <button onclick="window.toggleWeatherRadar(this)" 
                    style="flex: 1; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #7dd3fc; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.2s; min-width: 100%;">
                    <i class="fas fa-cloud-showers-heavy"></i> OB-HAVO RADARI
                </button>
            </div>
            <div style="background: rgba(255,255,255,0.03); border-radius: 15px; padding: 15px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 10px;">
                <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 800; text-transform: uppercase;">Filtr va Sanalar</div>
                <select style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; outline: none; background: rgba(0,0,0,0.3); color: white; font-size: 0.85rem; appearance: none; cursor:pointer;">
                    <option>Qorlitog' temir yo'l masofasi</option>
                    <option>Samarqand temir yo'l masofasi</option>
                </select>
                
                <div style="display: flex; gap: 8px;">
                    <select style="flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; outline: none; background: rgba(0,0,0,0.3); color: white; font-size: 0.8rem; cursor:pointer;">
                        <option>PD-1</option>
                        <option>PD-2</option>
                    </select>
                    <input type="date" value="2026-03-19" style="flex: 1.5; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; outline: none; background: rgba(0,0,0,0.3); color: white; font-size: 0.8rem; cursor:pointer;">
                </div>
                <!-- Integrated warnings tab or section -->
                <div style="margin-top:20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:0 15px;">
                        <span style="color:white; font-size:0.9rem; font-weight:700; letter-spacing:1px;">
                            <i class="fas fa-exclamation-triangle" style="color:#f59e0b;"></i> OGOHLANTIRISHLAR
                        </span>
                    </div>
                    <div id="digital-warnings-list" style="max-height: 300px; overflow-y:auto; padding: 0 10px;">
                        <!-- Infrastructure.js fills this -->
                    </div>
                </div>
            </div>
            
            <div id="pch-map-container" style="flex: 1; position: relative; overflow: hidden;">
                <div id="station-list-items" style="display: flex; flex-direction: column; gap: 8px;">
                    <!-- Stansiyalar shu yerda chiqadi -->
                </div>
            </div>
        </div>
        
        <!-- BASEMAP SELECTOR -->
        <div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(10px); border-radius: 50px; border: 1px solid rgba(56,189,248,0.3); padding: 6px; display: flex; align-items: center; gap: 5px; box-shadow: 0 10px 40px rgba(56,189,248,0.2);">
            <div id="layer-btn-hybrid" onclick="switchBaseMap('hybrid')" style="padding: 10px 20px; cursor: pointer; color: #94a3b8; font-weight: 700; font-size: 0.8rem; border-radius: 40px; transition: 0.3s;">Koinot (Satellite)</div>
            <div id="layer-btn-cyber" onclick="switchBaseMap('cyber')" style="padding: 10px 20px; cursor: pointer; color: #020617; font-weight: 900; font-size: 0.8rem; border-radius: 40px; background: #38bdf8; box-shadow: 0 0 15px rgba(56,189,248,0.5); transition: 0.3s;">Kiber-Egizak</div>
            <div id="layer-btn-osm" onclick="switchBaseMap('osm')" style="padding: 10px 20px; cursor: pointer; color: #94a3b8; font-weight: 700; font-size: 0.8rem; border-radius: 40px; transition: 0.3s;">Klassik Xarita</div>
        </div>
    `;

    document.body.appendChild(modal);

    // Xaritani ishga tushirish (Kichik pauza Leaflet divni tanib olishi uchun)
    setTimeout(() => {
        initPCHLeafletMap(activeMasofa);
        if (window._pchMap) {
            window._pchMap.invalidateSize(); // Eng muhim qadam: xarita renderini majburlash
            window.initUserLiveTracking(window._pchMap);
        }
    }, 200);
};

// ============================================================
// LEAFLET XARITASINI ISHGA TUSHIRISH (Railway Observer UI)
// ============================================================
let pchBaseLayers = {};

window.switchBaseMap = function (type) {
    const map = window._pchMap;
    if (!map || !pchBaseLayers[type]) return;

    // UI Style Update
    ['hybrid', 'cyber', 'osm'].forEach(t => {
        const btn = document.getElementById('layer-btn-' + t);
        if (btn) {
            btn.style.color = t === type ? '#020617' : '#94a3b8';
            btn.style.background = t === type ? '#38bdf8' : 'transparent';
            btn.style.boxShadow = t === type ? '0 0 15px rgba(56,189,248,0.5)' : 'none';
            btn.style.fontWeight = t === type ? '900' : '700';
        }
    });

    Object.values(pchBaseLayers).forEach(layer => map.removeLayer(layer));
    pchBaseLayers[type].addTo(map);
};

async function initPCHLeafletMap(masofa) {
    try {
        if (window.LazyLoader) await window.LazyLoader.loadLeaflet();
    } catch (e) {
        showToast("Leaflet xarita kutubxonasi yuklanmadi!", "error");
        return;
    }
    if (!window.L) {
        showToast("Leaflet xarita kutubxonasi yuklanmagan!", "error");
        return;
    }

    // Xarita markazi (O'zbekiston markazi)
    const center = [41.2, 65.5];
    const zoom = 6;

    // Leaflet xarita initialization
    const map = L.map('pch-leaflet-map', {
        center: center,
        zoom: zoom,
        zoomControl: false // Custom position
    });

    // Basemaps initialization (Enterprise level Digital Twin)
    pchBaseLayers = {
        hybrid: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: '&copy; Esri' }),
        cyber: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 20, attribution: '&copy; CARTO' }),
        osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' })
    };

    // Default map is Digital Twin Cyber Dark
    pchBaseLayers['cyber'].addTo(map);

    // Zoom control to the bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layers toggle (Right side)
    L.control.layers(pchBaseLayers, null, { collapsed: true, position: 'topright' }).addTo(map);

    // CLICK HANDLER: Yangi stansiya qo'shish (faqat Edit Mode yoniq bo'lsa)
    map.on('click', (e) => {
        if (!window._stationEditMode) return;
        const { lat, lng } = e.latlng;
        const name = prompt("Stansiya nomi:");
        if (!name) return;
        const km = prompt("Kilometr (mas: 4117):");

        const newSt = {
            name: name,
            km: km || 0,
            lat: lat,
            lng: lng,
            type: "станция",
            bolinma: 1
        };

        window.PCH_STATIONS_DATA['pch16'].push(newSt);
        localStorage.setItem('PCH16_CUSTOM_STATIONS', JSON.stringify(window.PCH_STATIONS_DATA['pch16']));

        // Modalni qayta ochib yangilash
        window.openPCHMap();
    });

    // ---- Hamma Temir yo'l liniyalarini chizish ----
    const tracksLayer = L.layerGroup().addTo(map);

    // Cybernetic Neon Colors for Digital Twin
    const polyColors = ['#0ea5e9', '#8b5cf6', '#14b8a6', '#f43f5e', '#f59e0b'];

    const drawRailways = () => {
        if (window.UZB_RAILWAYS_GEO && window.UZB_RAILWAYS_GEO.length > 0) {
            window.UZB_RAILWAYS_GEO.forEach((lineCoords, idx) => {
                const lineColor = polyColors[idx % polyColors.length];
                
                // Outer Cyan/Neon Glow
                L.polyline(lineCoords, {
                    color: lineColor,
                    weight: 8,
                    opacity: 0.15,
                }).addTo(tracksLayer);
                
                // Inner Bright Line (Data Cable aesthetic)
                L.polyline(lineCoords, {
                    color: lineColor,
                    weight: 2,
                    opacity: 0.9,
                    dashArray: '5, 5',
                    className: 'digital-twin-pulse'
                }).addTo(tracksLayer);

                // Base shadow
                L.polyline(lineCoords, {
                    color: '#fff',
                    weight: 1,
                    opacity: 0.5,
                }).addTo(tracksLayer);
            });
        }
    };

    if (window.UZB_RAILWAYS_GEO) {
        drawRailways();
    } else {
        const script = document.createElement('script');
        script.src = 'js/uzb_railways_geo.js';
        script.async = true;
        script.onload = drawRailways;
        document.body.appendChild(script);
    }

    // ====== PREMIUM: TRACK HEALTH COLORING (PCh-16) ======
    // Yo'l holati: yashil=soz, sariq=nazoratda, qizil=xavfli
    const TRACK_HEALTH = {
        4035: 'good', 4051: 'good', 4066: 'warning', 4080: 'good', 
        4098: 'good', 4109: 'good', 4122: 'warning', 4137: 'good',
        4152: 'danger', 4168: 'good', 4177: 'good', 4182: 'good',
        4200: 'good', 4216: 'warning', 4232: 'good', 4246: 'good',
        4261: 'good', 4280: 'good', 4297: 'good'
    };
    const HEALTH_COLORS = { good: '#10b981', warning: '#f59e0b', danger: '#ef4444' };

    // ====== PREMIUM: SPEED LIMIT ZONES ======
    const SPEED_ZONES = [
        { fromKm: 4109, toKm: 4137, limit: 25, reason: "Egrilik" },
        { fromKm: 4152, toKm: 4168, limit: 15, reason: "Ta'mir" },
        { fromKm: 4216, toKm: 4232, limit: 40, reason: "Yangi yo'l" }
    ];

    if (window.PCH_STATIONS_DATA) {
        Object.keys(window.PCH_STATIONS_DATA).forEach((key) => {
            const stationsList = window.PCH_STATIONS_DATA[key];
            if (!stationsList || stationsList.length < 2) return;

            const isPch16 = key === 'pch16';

            if (isPch16) {
                // Draw segments with health coloring
                for (let i = 0; i < stationsList.length - 1; i++) {
                    const from = stationsList[i];
                    const to = stationsList[i + 1];
                    const health = TRACK_HEALTH[from.km] || 'good';
                    const segColor = HEALTH_COLORS[health];

                    // Shadow line
                    L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
                        color: '#000', weight: 7, opacity: 0.2
                    }).addTo(tracksLayer);

                    // Main colored health line
                    L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
                        color: segColor, weight: 4, opacity: 0.9, lineJoin: 'round',
                    }).addTo(tracksLayer);

                    // White dash overlay (railroad ties)
                    L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
                        color: '#fff', weight: 1, opacity: 0.4, dashArray: '4, 12',
                    }).addTo(tracksLayer);

                    // KM Distance Label at midpoint
                    const midLat = (from.lat + to.lat) / 2;
                    const midLng = (from.lng + to.lng) / 2;
                    const dist = Math.abs(to.km - from.km);
                    L.marker([midLat, midLng], {
                        icon: L.divIcon({
                            className: 'km-label',
                            html: `<div style="background: rgba(15,23,42,0.85); backdrop-filter:blur(4px); padding:2px 6px; border-radius:6px; border: 1px solid ${segColor}44; color:${segColor}; font-size:9px; font-weight:900; white-space:nowrap; font-family:monospace;">${dist} km</div>`,
                            iconSize: [0, 0]
                        }),
                        interactive: false
                    }).addTo(tracksLayer);
                }

                // Speed Limit Zone Markers
                SPEED_ZONES.forEach(zone => {
                    const fromSt = stationsList.find(s => s.km === zone.fromKm);
                    const toSt = stationsList.find(s => s.km === zone.toKm);
                    if (fromSt && toSt) {
                        const midLat = (fromSt.lat + toSt.lat) / 2;
                        const midLng = (fromSt.lng + toSt.lng) / 2;

                        // Speed zone overlay line
                        L.polyline([[fromSt.lat, fromSt.lng], [toSt.lat, toSt.lng]], {
                            color: '#f59e0b', weight: 12, opacity: 0.15,
                        }).addTo(tracksLayer);

                        // Speed limit sign
                        L.marker([midLat, midLng], {
                            icon: L.divIcon({
                                className: 'speed-zone-marker',
                                html: `<div style="width:36px; height:36px; background:#fff; border:3px solid #ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:12px; color:#000; box-shadow:0 2px 10px rgba(0,0,0,0.4); font-family:Arial;">${zone.limit}</div>
                                       <div style="position:absolute; top:38px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.9); color:#f59e0b; font-size:8px; font-weight:700; padding:1px 5px; border-radius:3px; white-space:nowrap;">${zone.reason}</div>`,
                                iconSize: [36, 36],
                                iconAnchor: [18, 18]
                            }),
                            zIndexOffset: 800
                        }).addTo(tracksLayer);
                    }
                });

                // Auto-center to this route
                const lineCoords = stationsList.map(s => [s.lat, s.lng]);
                map.fitBounds(L.polyline(lineCoords).getBounds(), { padding: [50, 50] });
            } else {
                const lineCoords = stationsList.map(s => [s.lat, s.lng]);
                L.polyline(lineCoords, {
                    color: '#475569', weight: 2, opacity: 0.6, lineJoin: 'round',
                }).addTo(tracksLayer);
            }
        });
    }

    // ---- Xodimlar va markerlar (Railway Observer Style) ----
    const stationLayer = L.layerGroup().addTo(map);
    const markers = [];

    // Custom blue standard leafet icon to mimic the screenshot
    const blueIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Station Name Labels & Optimized Markers
    if (window.PCH_STATIONS_DATA && window.PCH_STATIONS_DATA['pch16']) {
        window.PCH_STATIONS_DATA['pch16'].forEach((st, idx) => {
            const color = BOLINMA_COLORS[st.bolinma % BOLINMA_COLORS.length];
            const marker = L.marker([st.lat, st.lng], { 
                icon: getStationIcon(st.type, color, st.name),
                zIndexOffset: 1000 
            }).addTo(stationLayer);

            marker.on('click', () => showStationInfo(st, color, masofa));
            
            markers.push({ station: st, marker, color });
        });
    }

    // Global saqlab qo'yish
    window._pchMap = map;
    window._pchMarkers = markers;

    // LIVE UPDATES
    if (window._liveInterval) clearInterval(window._liveInterval);
    window._liveInterval = setInterval(() => {
        if (!window._pchMap) return;
        const stations = getStationsForMasofa('pch16');
        window.updateLiveTrains(window._pchMap, stations);
        window.updateLiveWorkers(window._pchMap);
    }, 2000);

    // Initial run
    // Yana bir marta o'lchamni yangilash
    setTimeout(() => {
        if (window._pchMap) window._pchMap.invalidateSize();
    }, 150);

    // ---- Infrastructure & Warnings Overlay ----
    if (window.SmartOverlays) {
        window.SmartOverlays.init(map);
    }

    // ====== PREMIUM: DAY/NIGHT AUTO-MODE ======
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 20;
    if (isNight) {
        // Switch to dark satellite for night mode
        Object.values(pchBaseLayers).forEach(l => map.removeLayer(l));
        pchBaseLayers['hybrid'].addTo(map);
        // Night overlay
        L.rectangle([[-90, -180], [90, 180]], {
            color: 'transparent', fillColor: '#000', fillOpacity: 0.3, interactive: false
        }).addTo(map);
    }

    // ====== PREMIUM: TRACK HEALTH LEGEND ======
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function() {
        const div = L.DomUtil.create('div');
        div.style.cssText = 'background: rgba(15,23,42,0.92); backdrop-filter: blur(10px); padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.4);';
        div.innerHTML = `
            <div style="font-weight:900; font-size:0.7rem; color:#94a3b8; margin-bottom:10px; letter-spacing:1px;">YO'L HOLATI</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:20px; height:4px; background:#10b981; border-radius:2px;"></div> Soz</div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:20px; height:4px; background:#f59e0b; border-radius:2px;"></div> Nazoratda</div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:20px; height:4px; background:#ef4444; border-radius:2px;"></div> Xavfli</div>
            </div>
            <div style="margin-top:12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top:10px; font-weight:900; font-size:0.7rem; color:#94a3b8; margin-bottom:8px; letter-spacing:1px;">BELGILAR</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:18px; height:18px; background:#fff; border:2px solid #ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900;">25</div> Tezlik chegarasi</div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#ef4444; border-radius:50%; box-shadow:0 0 6px #ef4444;"></div> Defekt</div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:18px; height:10px; background:#8b5cf6; border-radius:4px; font-size:7px; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700;">OK</div> OKNO zona</div>
            </div>
        `;
        return div;
    };
    legend.addTo(map);

    // ====== PREMIUM: LIVE CLOCK ======
    const clockControl = L.control({ position: 'topright' });
    clockControl.onAdd = function() {
        const div = L.DomUtil.create('div');
        div.id = 'map-live-clock';
        div.style.cssText = 'background: rgba(15,23,42,0.92); backdrop-filter: blur(10px); padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); color: #fff; font-family: monospace; font-size: 0.9rem; font-weight: 900; box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center;';
        const update = () => {
            const now = new Date();
            div.innerHTML = `<div style="font-size:0.6rem; color:#94a3b8; margin-bottom:2px;">VAQT</div>${now.toLocaleTimeString()}`;
        };
        update();
        setInterval(update, 1000);
        return div;
    };
    clockControl.addTo(map);

    // ====== PREMIUM: STATION COUNT BADGE ======
    const countBadge = L.control({ position: 'topleft' });
    countBadge.onAdd = function() {
        const div = L.DomUtil.create('div');
        const stations = window.PCH_STATIONS_DATA?.pch16 || [];
        const stCount = stations.filter(s => s.type === 'станция').length;
        const rzCount = stations.filter(s => s.type === 'разъезд').length;
        div.style.cssText = 'background: rgba(15,23,42,0.92); backdrop-filter: blur(10px); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 0.75rem; box-shadow: 0 5px 15px rgba(0,0,0,0.3); margin-top: 80px;';
        div.innerHTML = `
            <div style="font-weight:900; font-size:0.65rem; color:#3b82f6; letter-spacing:1px; margin-bottom:6px;">PCh-16 STATISTIKA</div>
            <div style="display:flex; gap:15px;">
                <div><span style="color:#10b981; font-weight:900; font-size:1.2rem;">${stCount}</span> <span style="color:#94a3b8;">stansiya</span></div>
                <div><span style="color:#f59e0b; font-weight:900; font-size:1.2rem;">${rzCount}</span> <span style="color:#94a3b8;">razezd</span></div>
            </div>
            <div style="margin-top:6px; color:#94a3b8; font-size:0.7rem;">Umumiy: ${stations[stations.length-1]?.km - stations[0]?.km || 0} km</div>
        `;
        return div;
    };
    countBadge.addTo(map);
}

// ============================================================
// PREMIUM STANSIYA MINI-DASHBOARD
// ============================================================
function showStationInfo(st, color, masofa) {
    // Remove old panel
    const oldPanel = document.getElementById('station-dashboard-panel');
    if (oldPanel) oldPanel.remove();

    const bolinmaName = `${st.bolinma}-bo'linma`;
    const isStation = st.type === 'станция';

    // Random live data for demo
    const temp = Math.floor(20 + Math.random() * 25);
    const wind = Math.floor(2 + Math.random() * 12);
    const humidity = Math.floor(30 + Math.random() * 50);
    const defects = Math.floor(Math.random() * 5);
    const lastCheck = Math.floor(1 + Math.random() * 10);
    const trackCond = defects === 0 ? 'SOZ' : (defects < 3 ? 'NAZORATDA' : 'XAVFLI');
    const condColor = defects === 0 ? '#10b981' : (defects < 3 ? '#f59e0b' : '#ef4444');

    const panel = document.createElement('div');
    panel.id = 'station-dashboard-panel';
    panel.style.cssText = `
        position: absolute; bottom: 90px; left: 50%; transform: translateX(-50%); z-index: 2000;
        background: rgba(15, 23, 42, 0.96); backdrop-filter: blur(25px);
        border: 1px solid ${color}44; border-radius: 24px;
        padding: 0; width: 520px; max-width: 90vw;
        box-shadow: 0 25px 60px rgba(0,0,0,0.7), 0 0 40px ${color}22;
        animation: dashSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Segoe UI', system-ui, sans-serif;
    `;

    panel.innerHTML = `
        <style>
            @keyframes dashSlideUp { from { transform: translateX(-50%) translateY(30px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
        </style>

        <!-- HEADER -->
        <div style="padding: 20px 25px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 15px;">
            <div style="width: 48px; height: 48px; background: ${color}22; border: 2px solid ${color}55; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas ${isStation ? 'fa-train-subway' : 'fa-code-branch'}" style="color: ${color}; font-size: 1.3rem;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="color: #fff; font-weight: 900; font-size: 1.15rem; letter-spacing: 0.5px;">${st.name}</div>
                <div style="color: rgba(255,255,255,0.4); font-size: 0.78rem; margin-top: 2px;">${isStation ? 'STANSIYA' : 'RAZEZD'} • KM ${st.km} • ${bolinmaName}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="background: ${condColor}22; border: 1px solid ${condColor}55; padding: 5px 14px; border-radius: 20px; color: ${condColor}; font-weight: 900; font-size: 0.72rem;">${trackCond}</div>
                <button onclick="this.closest('#station-dashboard-panel').remove()" style="background: rgba(255,255,255,0.05); border: none; color: rgba(255,255,255,0.4); width: 34px; height: 34px; border-radius: 10px; cursor: pointer; font-size: 1.1rem;">&times;</button>
            </div>
        </div>

        <!-- WEATHER + STATUS ROW -->
        <div style="padding: 18px 25px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div style="background: rgba(59,130,246,0.08); border-radius: 14px; padding: 14px; text-align: center; border: 1px solid rgba(59,130,246,0.15);">
                <div style="font-size: 1.8rem;">🌡️</div>
                <div style="color: #fff; font-weight: 900; font-size: 1.2rem; margin-top: 4px;">${temp}°C</div>
                <div style="color: rgba(255,255,255,0.35); font-size: 0.65rem; margin-top: 2px;">HARORAT</div>
            </div>
            <div style="background: rgba(139,92,246,0.08); border-radius: 14px; padding: 14px; text-align: center; border: 1px solid rgba(139,92,246,0.15);">
                <div style="font-size: 1.8rem;">💨</div>
                <div style="color: #fff; font-weight: 900; font-size: 1.2rem; margin-top: 4px;">${wind} m/s</div>
                <div style="color: rgba(255,255,255,0.35); font-size: 0.65rem; margin-top: 2px;">SHAMOL</div>
            </div>
            <div style="background: rgba(16,185,129,0.08); border-radius: 14px; padding: 14px; text-align: center; border: 1px solid rgba(16,185,129,0.15);">
                <div style="font-size: 1.8rem;">💧</div>
                <div style="color: #fff; font-weight: 900; font-size: 1.2rem; margin-top: 4px;">${humidity}%</div>
                <div style="color: rgba(255,255,255,0.35); font-size: 0.65rem; margin-top: 2px;">NAMLIK</div>
            </div>
            <div style="background: ${condColor}11; border-radius: 14px; padding: 14px; text-align: center; border: 1px solid ${condColor}22;">
                <div style="font-size: 1.8rem;">🔧</div>
                <div style="color: ${condColor}; font-weight: 900; font-size: 1.2rem; margin-top: 4px;">${defects}</div>
                <div style="color: rgba(255,255,255,0.35); font-size: 0.65rem; margin-top: 2px;">DEFEKT</div>
            </div>
        </div>

        <!-- INFO CARDS -->
        <div style="padding: 0 25px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; text-align: center;">
                <div style="color: rgba(255,255,255,0.4); font-size: 0.65rem;">KOORDINATA</div>
                <div style="color: #fff; font-weight: 700; font-size: 0.8rem; font-family: monospace; margin-top: 4px;">${st.lat.toFixed(4)}°N</div>
                <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem; font-family: monospace;">${st.lng.toFixed(4)}°E</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; text-align: center;">
                <div style="color: rgba(255,255,255,0.4); font-size: 0.65rem;">OXIRGI TEKSHIRUV</div>
                <div style="color: #10b981; font-weight: 700; font-size: 0.85rem; margin-top: 4px;">${lastCheck} kun oldin</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; text-align: center;">
                <div style="color: rgba(255,255,255,0.4); font-size: 0.65rem;">MAS'UL</div>
                <div style="color: #a78bfa; font-weight: 700; font-size: 0.85rem; margin-top: 4px;">PD-${st.bolinma}</div>
            </div>
        </div>
    `;

    document.getElementById('pch-map-modal').appendChild(panel);
}

// ============================================================
// LIVE PERSONNEL TRACKING (GPS)
// ============================================================
window._userLocationMarker = null;
window._watchId = null;

window.initUserLiveTracking = function (map) {
    if (!navigator.geolocation) return;

    const user = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{"full_name": "Xodim"}');

    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="background: #2ecc71; border: 2px solid white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #2ecc71; color: white; position: relative;">
                    <i class="fas fa-user-hard-hat"></i>
                    <div style="position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); background: #2ecc71; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.6rem; font-weight: 800; white-space: nowrap;">${user.full_name}</div>
               </div>`,
        iconSize: [35, 35],
        iconAnchor: [17, 17]
    });

    window._watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            if (!window._userLocationMarker) {
                window._userLocationMarker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 3000 }).addTo(map);
            } else {
                window._userLocationMarker.setLatLng([latitude, longitude]);
            }
        },
        (err) => console.warn("GPS Tracking Error:", err),
        { enableHighAccuracy: true }
    );
};

// ============================================================
// SIDEBAR RO'YXATI
// ============================================================
function renderStationSidebar(stations, markers, map, colorMap, masofa) {
    const container = document.getElementById('station-list-items');
    if (!container) return;

    container.innerHTML = stations.map((st, i) => {
        const color = colorMap[st.bolinma] || '#00c6ff';
        const isStation = st.type === 'станция';
        return `
            <div class="station-list-item" data-name="${st.name.toLowerCase()}"
                onclick="flyToStation(${i})"
                style="padding: 10px 18px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.04);
                display: flex; align-items: center; gap: 10px; transition: background 0.15s;"
                onmouseover="this.style.background='rgba(255,255,255,0.05)'"
                onmouseout="this.style.background='transparent'">
                <div style="width: ${isStation ? 10 : 7}px; height: ${isStation ? 10 : 7}px;
                    border-radius: 50%; background: ${color}; flex-shrink: 0;
                    box-shadow: 0 0 5px ${color};"></div>
                <div style="min-width: 0; flex: 1;">
                    <div style="color: white; font-size: 0.85rem; font-weight: ${isStation ? 600 : 400};
                        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${st.name}</div>
                    <div style="color: rgba(255,255,255,0.35); font-size: 0.7rem;">
                        ${st.km} km &nbsp;·&nbsp; ${st.type === 'станция' ? 'Stansiya' : 'Razezd'}
                    </div>
                </div>
                <div style="color: ${color}; font-size: 0.65rem; white-space: nowrap; opacity: 0.7;">
                    ${st.bolinma}-bo'l
                </div>
            </div>
        `;
    }).join('');

    // Jami ko'rsatish
    container.insertAdjacentHTML('afterbegin', `
        <div style="padding: 8px 18px 4px; color: rgba(255,255,255,0.3); font-size: 0.72rem; display: flex; justify-content: space-between;">
            <span>${stations.length} ta obyekt</span>
            <span>${stations.filter(s => s.type === 'станция').length} stansiya, ${stations.filter(s => s.type !== 'станция').length} razezd</span>
        </div>
    `);
}

// Stansiyaga uchish
window.flyToStation = function (index) {
    const markers = window._pchMarkers;
    const stations = window._pchStations;
    const map = window._pchMap;
    if (!markers || !map || !stations) return;

    const { station, marker, color } = markers[index];
    map.flyTo([station.lat, station.lng], 13, { duration: 1 });
    marker.openTooltip();

    const activeMasofa = window.ACTIVE_MASOFA || window.getActiveMasofa?.();
    showStationInfo(station, color, activeMasofa);
};

// Qidiruv
window.filterStationList = function (query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.station-list-item').forEach(item => {
        const name = item.getAttribute('data-name') || '';
        item.style.display = (!q || name.includes(q)) ? '' : 'none';
    });
};

// ============================================================
// MASOFAGA MOS STANSIYALARNI TOPISH
// ============================================================
function getStationsForMasofa(masofaId, masofa) {
    // 1. Aniq PCH_STATIONS_DATA dan qidirish
    if (masofaId && window.PCH_STATIONS_DATA[masofaId]) {
        return window.PCH_STATIONS_DATA[masofaId];
    }

    // 2. data.js dagi stansiyalar (Qorlitog' uchun default)
    if (window.INITIAL_DATA?.stations?.length > 0) {
        return window.INITIAL_DATA.stations.map((s, i) => ({
            name: s.name,
            km: masofa ? masofa.kmStart + Math.round((i / (window.INITIAL_DATA.stations.length - 1)) * (masofa.kmEnd - masofa.kmStart)) : s.id * 30,
            lat: s.lat,
            lng: s.lng,
            type: 'станция',
            bolinma: s.bolinma || (i + 1)
        }));
    }

    return [];
}

// CSS tooltip
(function addMapStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .pch-map-tooltip {
            background: rgba(13,27,46,0.95) !important;
            border: 1px solid rgba(255,255,255,0.15) !important;
            color: white !important;
            border-radius: 8px !important;
            font-size: 0.82rem !important;
            padding: 8px 12px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        }
        .pch-map-tooltip::before {
            border-top-color: rgba(255,255,255,0.15) !important;
        }
    `;
    document.head.appendChild(style);
})();

window.renderTrainListHTML = function () {
    return window.TRAIN_SCHEDULE.map((t, idx) => `
        <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 12px; border-left: 3px solid ${t.color}; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="font-weight: 800; font-size: 0.8rem;">${t.name}</span>
                <span style="background: ${t.color}22; color: ${t.color}; padding: 2px 6px; border-radius: 5px; font-size: 0.65rem; font-weight: 900;">LIVE</span>
            </div>
            <div style="font-size: 0.72rem; color: #94a3b8;">${t.from} (${t.depTime}) &rarr; ${t.to} (${t.arrTime})</div>
        </div>
    `).join('');
};

window.refreshTrainListUI = function () {
    const list = document.getElementById('train-movement-list');
    if (list) list.innerHTML = window.renderTrainListHTML();
};

window.openTrainAdminModal = function () {
    const existing = document.getElementById('train-admin-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'train-admin-modal';
    modal.className = 'active';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.8); z-index: 10060;
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(8px);
    `;

    modal.innerHTML = `
        <div style="background: #0f172a; width: 450px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); padding: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); color: #fff;">
            <h3 style="margin: 0 0 20px 0; font-size: 1.25rem;">Bugungi poyezdlar grafiki</h3>
            
            <div id="admin-train-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; padding-right: 5px;">
                ${window.TRAIN_SCHEDULE.map((t, i) => `
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 800; font-size: 0.85rem;">${t.name}</div>
                            <div style="font-size: 0.7rem; color: #94a3b8;">${t.from} &rarr; ${t.to}</div>
                        </div>
                        <button onclick="window.deleteTrainRecord(${i})" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                `).join('')}
            </div>

            <h4 style="font-size: 0.9rem; color: #3b82f6; margin-bottom: 15px;">Yangi poyezd qo'shish</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <input id="at-name" placeholder="Poyezd nomi (mas: Sharq 09)" style="grid-column: span 2; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: white; outline: none;">
                <input id="at-from" placeholder="Qayerdan" style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: white; outline: none;">
                <input id="at-to" placeholder="Qayerga" style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: white; outline: none;">
                <input id="at-dep" placeholder="Chiqish (00:00)" style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: white; outline: none;">
                <input id="at-arr" placeholder="Kelish (00:00)" style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: white; outline: none;">
            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="window.addTrainRecord()" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer;">Qo'shish</button>
                <button onclick="document.getElementById('train-admin-modal').remove()" style="flex: 1; background: rgba(255,255,255,0.05); color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer;">Yopish</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.deleteTrainRecord = function (index) {
    const trainId = window.TRAIN_SCHEDULE[index].id;
    if (window._trainMarkers[trainId]) {
        window._pchMap.removeLayer(window._trainMarkers[trainId]);
        delete window._trainMarkers[trainId];
    }
    window.TRAIN_SCHEDULE.splice(index, 1);
    window.openTrainAdminModal();
    window.refreshTrainListUI();
};

window.addTrainRecord = function () {
    const name = document.getElementById('at-name').value;
    const from = document.getElementById('at-from').value;
    const to = document.getElementById('at-to').value;
    const dep = document.getElementById('at-dep').value;
    const arr = document.getElementById('at-arr').value;

    if (!name || !from || !to || !dep || !arr) {
        showToast("Barcha maydonlarni to'ldiring!", "warning");
        return;
    }

    const newTrain = {
        id: 't' + Date.now(),
        name: name.toUpperCase(),
        from: from,
        to: to,
        depTime: dep,
        arrTime: arr,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    };

    window.TRAIN_SCHEDULE.push(newTrain);
    window.openTrainAdminModal();
    window.refreshTrainListUI();
};

window.closePCHMapModal = function () {
    if (window._watchId) navigator.geolocation.clearWatch(window._watchId);
    if (window._trainInterval) clearInterval(window._trainInterval);
    const modal = document.getElementById('pch-map-modal');
    if (modal) modal.remove();

    // Clear markers
    if (window._trainMarkers) {
        Object.values(window._trainMarkers).forEach(m => {
            if (window._pchMap) window._pchMap.removeLayer(m);
        });
    }
    window._trainMarkers = {};

    window._userLocationMarker = null;
    window._watchId = null;
    window._pchMap = null;
};

window.initUserLiveTracking = function (map) {
    if (!navigator.geolocation) return;

    const user = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{"full_name": "Xodim"}');

    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="background: #27ae60; border: 2px solid white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #27ae60; color: white; position: relative;">
                    <i class="fas fa-user-hard-hat"></i>
                    <div style="position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); background: #27ae60; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.6rem; font-weight: 800; white-space: nowrap;">${user.full_name}</div>
               </div>`,
        iconSize: [35, 35],
        iconAnchor: [17, 17]
    });

    window._watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            if (!window._userLocationMarker) {
                window._userLocationMarker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 3000 }).addTo(map);
            } else {
                window._userLocationMarker.setLatLng([latitude, longitude]);
            }
        },
        (err) => console.warn("GPS Tracking Error:", err),
        { enableHighAccuracy: true }
    );
};

window._stationEditMode = false;
window.toggleStationEditMode = function (btn) {
    window._stationEditMode = !window._stationEditMode;
    if (window._stationEditMode) {
        btn.style.background = '#e74c3c';
        btn.style.color = '#fff';
        btn.innerHTML = '<i class="fas fa-stop-circle"></i> REJIMNI TO\'XTATISH';
        showToast("Xaritaga bosing - yangi stansiya qo'shish uchun!", "info");
    } else {
        btn.style.background = 'rgba(59, 130, 246, 0.1)';
        btn.style.color = '#3b82f6';
        btn.innerHTML = '<i class="fas fa-plus-circle"></i> STANSIYA QO\'SHISH (REJIM)';
    }
};

window.clearAllCustomStations = function () {
    if (confirm("Barcha saqlangan stansiyalarni o'chirib yuborasizmi?")) {
        localStorage.removeItem('PCH16_CUSTOM_STATIONS');
        location.reload();
    }
};

console.log('✅ PCH Xarita moduli yuklandi');

// ============================================================
// PREMIUM: RULER (MASOFA O'LCHASH) TOOLI
// ============================================================
window._rulerMode = false;
window._rulerPoints = [];
window._rulerPolyline = null;
window._rulerLabels = [];

window.toggleRulerMode = function(btn) {
    window._rulerMode = !window._rulerMode;
    const map = window._pchMap;
    if (!map) return;

    if (window._rulerMode) {
        btn.classList.add('ruler-active');
        map.getContainer().classList.add('ruler-mode');
        window._rulerPoints = [];
        
        map.on('click', handleRulerClick);
        showToast("O'lchash rejimi faollashtirildi. Xaritada ikkita nuqtani bosing.", "info");
    } else {
        btn.classList.remove('ruler-active');
        map.getContainer().classList.remove('ruler-mode');
        clearRuler();
        map.off('click', handleRulerClick);
    }
};

function handleRulerClick(e) {
    if (!window._rulerMode) return;
    const map = window._pchMap;
    window._rulerPoints.push(e.latlng);

    // Marker qo'yish
    const pointMarker = L.circleMarker(e.latlng, { radius: 5, color: '#ffd700', fillColor: '#fff', fillOpacity: 1, interactive: false }).addTo(map);
    window._rulerLabels.push(pointMarker);

    if (window._rulerPoints.length === 2) {
        // Chiziq tortish
        window._rulerPolyline = L.polyline(window._rulerPoints, { color: '#ffd700', weight: 4, dashArray: '5, 10' }).addTo(map);
        
        // Masofani hisoblash (km)
        const dist = (window._rulerPoints[0].distanceTo(window._rulerPoints[1]) / 1000).toFixed(2);
        
        // Markaziga yozuv qo'yish
        const center = [
            (window._rulerPoints[0].lat + window._rulerPoints[1].lat) / 2,
            (window._rulerPoints[0].lng + window._rulerPoints[1].lng) / 2
        ];
        
        const label = L.marker(center, {
            icon: L.divIcon({
                className: '',
                html: `<div style="background: rgba(255,215,0,0.9); color: #000; font-weight: 900; padding: 4px 10px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.4); white-space: nowrap;">📏 ${dist} km</div>`,
                iconSize: [0, 0]
            }),
            interactive: false
        }).addTo(map);
        window._rulerLabels.push(label);

        // O'chirib tashlash imkoniyati
        setTimeout(() => {
            window._rulerPoints = [e.latlng]; // Oxirgi nuqtani saqlab qolish
        }, 100);
    }
}

function clearRuler() {
    const map = window._pchMap;
    if (window._rulerPolyline) map.removeLayer(window._rulerPolyline);
    window._rulerLabels.forEach(l => map.removeLayer(l));
    window._rulerPoints = [];
    window._rulerLabels = [];
}

// ============================================================
// PREMIUM: ANIMATED TRAINS SIMULATION
// ============================================================
window._activeTrains = [];

function initAnimatedTrains() {
    const map = window._pchMap;
    const stations = window.PCH_STATIONS_DATA?.pch16;
    if (!map || !stations || stations.length < 2) return;

    if (window._activeTrains.length > 0) {
        window._activeTrains.forEach(t => map.removeLayer(t));
        window._activeTrains = [];
    }

    // Demoni ko'rsatish uchun ikkita simulyatsion poyezd
    const trains = [
        { type: "Yuk poyezdi", num: "No 3402", color: "#f59e0b", startIdx: 2, endIdx: 6, progress: 0.2 },
        { type: "Tezyurar", num: "Afrosiyob", color: "#3b82f6", startIdx: 15, endIdx: 11, progress: 0.7 }
    ];

    trains.forEach(t => {
        const start = stations[t.startIdx];
        const end = stations[t.endIdx];
        const lat = start.lat + (end.lat - start.lat) * t.progress;
        const lng = start.lng + (end.lng - start.lng) * t.progress;

        const iconHTML = `
            <div class="train-marker" style="position:relative; display:flex; align-items:center; justify-content:center;">
                <div style="width:20px; height:20px; background:${t.color}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">
                    <i class="fas fa-train"></i>
                </div>
                <div style="position:absolute; top:-25px; background:rgba(15,23,42,0.8); backdrop-filter:blur(4px); border:1px solid ${t.color}55; padding:2px 8px; border-radius:4px; font-size:9px; font-weight:800; color:#fff; white-space:nowrap;">
                    ${t.num} <span style="color:${t.color}">${t.type}</span>
                </div>
            </div>
        `;

        const marker = L.marker([lat, lng], {
            icon: L.divIcon({ html: iconHTML, className: '', iconSize: [20, 20], iconAnchor: [10, 10] })
        }).addTo(map);

        window._activeTrains.push(marker);

        // Simple animation loop (moves trains slightly every second for demo)
        setInterval(() => {
            t.progress += 0.01;
            if (t.progress > 1) t.progress = 0;
            const newLat = start.lat + (end.lat - start.lat) * t.progress;
            const newLng = start.lng + (end.lng - start.lng) * t.progress;
            marker.setLatLng([newLat, newLng]);
        }, 1000);
    });
}

// Mapni ishga tushirishda trainlarni ulash
const originalInit = window.initializePCHMap;
window.initializePCHMap = function(stationData, containerId) {
    if (originalInit) originalInit(stationData, containerId);
    setTimeout(initAnimatedTrains, 2000); // Wait for map to load
};

// ============================================================
// MODERNIZATION 4.0: SUPER-PREMIUM FEATURES
// ============================================================

// 1. Drone Flyover (Avtomatik ekskursiya)
window._droneInterval = null;
window._droneCurrentIndex = 0;

window.toggleDroneFlyover = function(btn) {
    const map = window._pchMap;
    const stations = window.PCH_STATIONS_DATA?.pch16;
    if (!map || !stations) return;

    if (window._droneInterval) {
        // Stop Drone
        clearInterval(window._droneInterval);
        window._droneInterval = null;
        btn.style.background = 'rgba(139, 92, 246, 0.2)';
        btn.innerHTML = '<i class="fas fa-helicopter"></i> DRON REJIMI';
    } else {
        // Start Drone
        btn.style.background = '#8b5cf6';
        btn.style.color = '#fff';
        btn.innerHTML = '<i class="fas fa-stop-circle"></i> TO\'XTATISH';
        
        switchBaseMap('hybrid'); // Switch to satellite for best view
        window._droneCurrentIndex = 0;
        
        const flyToNext = () => {
            if (window._droneCurrentIndex >= stations.length) window._droneCurrentIndex = 0;
            const st = stations[window._droneCurrentIndex];
            
            map.flyTo([st.lat, st.lng], 16, {
                animate: true,
                duration: 4,
                easeLinearity: 0.25
            });
            
            // Show panel automatically
            showStationInfo(st, '#8b5cf6', null);
            
            window._droneCurrentIndex++;
        };
        
        flyToNext();
        window._droneInterval = setInterval(flyToNext, 6000);
    }
};

// 2. Defect Heatmap Layer
window._heatmapLayer = null;
window._heatmapActive = false;

window.toggleHeatmap = function(btn) {
    const map = window._pchMap;
    if (!map) return;
    if (!window._heatmapLayer) window._heatmapLayer = L.layerGroup();

    window._heatmapActive = !window._heatmapActive;

    if (window._heatmapActive) {
        btn.style.background = '#ef4444';
        btn.style.color = '#fff';
        
        // Simulyatsiya qilingan issiqlik dog'lari (defektlar markazi)
        const stations = window.PCH_STATIONS_DATA?.pch16 || [];
        stations.forEach((st, i) => {
            if (i % 3 === 0 || i === 8 /* Qorlitog'-Kiyikli (danger) */) {
                const intensity = i === 8 ? 800 : 400; // Radius
                const color = i === 8 ? '#ef4444' : '#f59e0b';
                
                L.circle([st.lat, st.lng], {
                    color: 'transparent',
                    fillColor: color,
                    fillOpacity: 0.4,
                    radius: intensity,
                    className: 'heatmap-pulse'
                }).addTo(window._heatmapLayer);
            }
        });
        
        window._heatmapLayer.addTo(map);
        
        // Style qismi agar yo'q bo'lsa
        if (!document.getElementById('heatmap-style')) {
            const style = document.createElement('style');
            style.id = 'heatmap-style';
            style.innerHTML = `@keyframes heatPulse { 0% { opacity: 0.2; transform: scale(0.9); } 50% { opacity: 0.6; transform: scale(1.1); } 100% { opacity: 0.2; transform: scale(0.9); } } .heatmap-pulse { animation: heatPulse 3s infinite; filter: blur(10px); }`;
            document.head.appendChild(style);
        }
    } else {
        btn.style.background = 'rgba(239, 68, 68, 0.2)';
        btn.style.color = '#f87171';
        map.removeLayer(window._heatmapLayer);
        window._heatmapLayer.clearLayers();
    }
};

// 3. Live Weather Radar
window._weatherActive = false;
window._weatherOverlay = null;

window.toggleWeatherRadar = function(btn) {
    const map = window._pchMap;
    if (!map) return;

    window._weatherActive = !window._weatherActive;

    if (window._weatherActive) {
        btn.style.background = '#38bdf8';
        btn.style.color = '#fff';
        
        // We use a CSS animated gradient to simulate moving weather radar clouds over the entire map container
        const mapDiv = document.getElementById('pch-leaflet-map');
        
        const weatherDiv = document.createElement('div');
        weatherDiv.id = 'weather-radar-overlay';
        weatherDiv.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 800; pointer-events: none;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3"/></filter></defs><rect width="100%" height="100%" filter="url(%23f)" opacity="0.3" fill="%2338bdf8"/></svg>');
            background-size: cover;
            opacity: 0.4;
            mix-blend-mode: overlay;
            animation: weatherMove 30s linear infinite;
        `;
        
        if (!document.getElementById('weather-style')) {
            const style = document.createElement('style');
            style.id = 'weather-style';
            style.innerHTML = `@keyframes weatherMove { from { background-position: 0 0; } to { background-position: 1000px 500px; } }`;
            document.head.appendChild(style);
        }
        
        mapDiv.appendChild(weatherDiv);
        
        // Add rain effect style dynamically
        mapDiv.style.filter = "saturate(0.8) brightness(0.9)";
        
    } else {
        btn.style.background = 'rgba(56, 189, 248, 0.2)';
        btn.style.color = '#7dd3fc';
        const overlay = document.getElementById('weather-radar-overlay');
        if (overlay) overlay.remove();
        document.getElementById('pch-leaflet-map').style.filter = "none";
    }
};
