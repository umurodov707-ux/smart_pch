/**
 * SMART PCH - Real-time Map & Tracking System
 */

// Use var to avoid redeclaration errors with script.js
var liveMap = liveMap || null;
var trainLiveMap = trainLiveMap || null;
var subdivisionMarkers = subdivisionMarkers || [];
var trainMarkers = trainMarkers || [];
var workerMarkers = workerMarkers || [];
var routePolylines = routePolylines || [];

// 1. Overview Live Map
async function createLiveMap() {
    const mapContainer = document.getElementById('live-map');
    if (!mapContainer) return;

    if (window.LazyLoader) await window.LazyLoader.loadLeaflet();

    liveMap = L.map('live-map').setView([41.3111, 69.2797], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(liveMap);

    updateMapMarkers();

    setInterval(() => {
        if (typeof updateSubdivisionLocations === 'function') updateSubdivisionLocations();
        updateMapMarkers();
    }, 10000);
}

function updateMapMarkers() {
    if (!liveMap) return;
    subdivisionMarkers.forEach(marker => liveMap.removeLayer(marker));
    subdivisionMarkers = [];

    if (typeof subdivisions === 'undefined') return;

    subdivisions.forEach(sub => {
        const marker = L.marker([sub.location.lat, sub.location.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: ${getDepartmentColor(sub.department)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white;">${sub.name.substring(0, 1)}</div>`
            })
        }).addTo(liveMap);

        marker.bindPopup(`
            <div style="color: #333;">
                <strong>${escapeHtml(sub.name)}</strong><br>
                <strong>Mas'ul:</strong> ${sub.manager}<br>
                <strong>Bo'lim:</strong> ${getDepartmentName(sub.department)}<br>
                <strong>Holat:</strong> Faol
            </div>
        `);
        subdivisionMarkers.push(marker);
    });
}

function updateSubdivisionLocations() {
    if (typeof subdivisions === 'undefined') return;
    subdivisions.forEach(sub => {
        /* sub.location.lat: ilgari tasodifiy siljitilardi (soxta \"jonli\" harakat) — haqiqiy GPS bo'lmaguncha joyida */
        /* sub.location.lng: ilgari tasodifiy siljitilardi (soxta \"jonli\" harakat) — haqiqiy GPS bo'lmaguncha joyida */
        sub.location.lat = Math.max(36, Math.min(45, sub.location.lat));
        sub.location.lng = Math.max(56, Math.min(73, sub.location.lng));
    });
}

// Specialized Train Radar Map removed - logic consolidated into pchMap.js

// Global Helpers (If needed elsewhere)
window.createLiveMap = createLiveMap;
window.updateMapMarkers = updateMapMarkers;

