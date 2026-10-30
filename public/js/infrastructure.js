/**
 * INFRASTRUCTURE & DIGITAL WARNINGS MODULE
 * ========================================
 * Points 1 & 2 of the Digital PCH proposal:
 * 1. Daily and Long-term warnings (speed limits, hazards)
 * 2. Real-time track and turnout status visualization
 */

const Infrastructure = {
    warnings: [],
    statuses: [],

    init: async function() {
        console.log('🏗️ Infrastructure module initializing...');
        await this.fetchData();
        this.setupSocketListeners();
    },

    fetchData: async function() {
        try {
            const [warnings, statuses] = await Promise.all([
                SmartUtils.fetchAPI('/infrastructure/warnings'),
                SmartUtils.fetchAPI('/infrastructure/status')
            ]);
            this.warnings = warnings || [];
            this.statuses = statuses || [];
            console.log('✅ Infrastructure data loaded');
        } catch (e) {
            console.error('Error fetching infrastructure data:', e);
        }
    },

    setupSocketListeners: function() {
        if (typeof socket !== 'undefined') {
            socket.on('new_warning', (warning) => {
                this.warnings.unshift(warning);
                if (window.PchMap && window.PchMap.active) {
                    this.renderWarningMarker(warning);
                }
                SmartUtils.showToast(`Yangi ogohlantirish: ${warning.title}`, 'warning');
            });

            socket.on('infrastructure_update', (update) => {
                const idx = this.statuses.findIndex(s => s.id === update.id);
                if (idx !== -1) {
                    this.statuses[idx] = { ...this.statuses[idx], ...update };
                    if (window.PchMap && window.PchMap.active) {
                        this.updateMapObject(update);
                    }
                }
            });
        }
    },

    // --- UI RENDERING ---

    renderWarningsList: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.warnings.length === 0) {
            container.innerHTML = '<div style="color:#64748b; text-align:center; padding:20px;">Hozircha ogohlantirishlar yo\'q</div>';
            return;
        }

        container.innerHTML = this.warnings.map(w => `
            <div class="warning-item priority-${w.priority}" style="margin-bottom:10px; padding:12px; border-radius:8px; background:rgba(255,255,255,0.05); border-left:4px solid ${this.getPriorityColor(w.priority)};">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="font-weight:bold; color:white;">${escapeHtml(w.title)}</div>
                    <span style="font-size:0.75rem; color:#64748b;">${new Date(w.created_at).toLocaleDateString()}</span>
                </div>
                <div style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">${escapeHtml(w.message)}</div>
                ${w.speed_limit ? `<div style="margin-top:8px; font-size:0.8rem; font-weight:bold; color:#f59e0b;">
                    <i class="fas fa-tachometer-alt"></i> Tezlik: ${w.speed_limit} km/soat
                </div>` : ''}
                <div style="margin-top:5px; font-size:0.75rem; color:#64748b;">
                    <i class="fas fa-map-marker-alt"></i> ${w.km} km, ${w.pk} pk
                </div>
            </div>
        `).join('');
    },

    getPriorityColor: function(priority) {
        switch (priority) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f59e0b';
            case 'normal': return '#3b82f6';
            default: return '#10b981';
        }
    },

    // --- MAP INTEGRATION ---
    // These functions will be called by pchMap.js when rendering objects

    getInfraStatusColor: function(status) {
        switch (status) {
            case 'closed': return '#ef4444'; // Red
            case 'maintenance': return '#f59e0b'; // Orange
            case 'open': return '#10b981'; // Green
            default: return '#94a3b8';
        }
    },

    // Logic to be injected into Map rendering
    renderMapOverlays: function(mapInstance) {
        // Render turnouts and track sections from this.statuses
        this.statuses.forEach(item => {
            if (item.geometry) {
                try {
                    const geo = JSON.parse(item.geometry);
                    let leafletObj;

                    if (item.type === 'turnout') {
                        leafletObj = L.circleMarker([geo.lat, geo.lng], {
                            radius: 8,
                            fillColor: this.getInfraStatusColor(item.status),
                            color: "#fff",
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.8
                        });
                    } else if (item.type === 'track_section') {
                        leafletObj = L.polyline(geo.points, {
                            color: this.getInfraStatusColor(item.status),
                            weight: 5,
                            opacity: 0.8
                        });
                    }

                    if (leafletObj) {
                        leafletObj.addTo(mapInstance).bindPopup(`
                            <div style="font-family:'Inter', sans-serif;">
                                <strong style="color:#1e293b;">${escapeHtml(item.name)}</strong><br>
                                Holat: <span style="color:${this.getInfraStatusColor(item.status)}; font-weight:bold;">${item.status.toUpperCase()}</span><br>
                                ${escapeHtml(item.details || '')}
                            </div>
                        `);
                    }
                } catch (e) {
                    console.error('Invalid geometry for infra item:', item.id, e);
                }
            }
        });

        // Render warnings as markers
        this.warnings.forEach(w => this.renderWarningMarker(w, mapInstance));
    },

    renderWarningMarker: function(w, mapInstance) {
        // Logic to place warning marker based on KM/PK or random nearby if unknown
        // For now, if we have coordinates in message or separate field (to be added)
        if (w.lat && w.lng) {
            const icon = L.divIcon({
                className: 'warning-marker',
                html: `<div style="background:${this.getPriorityColor(w.priority)}; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:2px solid white; box-shadow:0 0 10px rgba(0,0,0,0.5);">
                        <i class="fas fa-exclamation"></i>
                      </div>`,
                iconSize: [30, 30]
            });

            L.marker([w.lat, w.lng], { icon }).addTo(mapInstance || window.PchMap.instance).bindPopup(`
                <div style="padding:5px;">
                    <strong style="color:#ef4444;">Dahshatli Ogohlantirish</strong><br>
                    ${escapeHtml(w.message)}<br>
                    ${w.speed_limit ? `Limit: <strong>${w.speed_limit} km/soat</strong>` : ''}
                </div>
            `);
        }
    }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    Infrastructure.init();
});

window.Infrastructure = Infrastructure;
