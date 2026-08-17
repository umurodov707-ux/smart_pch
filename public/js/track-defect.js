/**
 * SMART TRACK-DEFECT MONITOR v2.0
 * Lenta yuklash + Kamchiliklar monitoring tizimi
 * - Ishlab chiqarish: Umumiy PDF lenta yuklaydi (har sahifa = 1 KM)
 * - Bo'linmalar: Faqat o'z KM chegarasidagi lentalarni ko'radi
 * - 3-4 daraja kamchiliklar batafsil, 2-daraja faqat soni
 */

const BOLINMA_BORDERS = [
    { name: "1-bo'linma", start: 4020, end: 4050 },
    { name: "2-bo'linma", start: 4051, end: 4083 },
    { name: "3-bo'linma", start: 4084, end: 4117 },
    { name: "4-bo'linma", start: 4118, end: 4150 },
    { name: "5-bo'linma", start: 4151, end: 4183 },
    { name: "6-bo'linma", start: 4184, end: 4205 },
    { name: "7-bo'linma", start: 4206, end: 4233 },
    { name: "8-bo'linma", start: 4234, end: 4260 },
    { name: "9-bo'linma", start: 4261, end: 4289 },
    { name: "10-bo'linma", start: 4290, end: 4303 }
];

function findBolinmaByKm(km) {
    for (let bol of BOLINMA_BORDERS) {
        if (km >= bol.start && km <= bol.end) return bol.name;
    }
    return "Noma'lum";
}

function getBolinmaKmRange(bolinmaId) {
    if (!bolinmaId || bolinmaId === 'ishlab-chiqarish' || bolinmaId === 'all') return null;
    for (let bol of BOLINMA_BORDERS) {
        if (bol.name === bolinmaId || bolinmaId.includes(bol.name.replace("-bo'linma", ''))) return bol;
    }
    return null;
}

// ===================== IndexedDB for Tape Images =====================
const TAPE_DB_NAME = 'SmartTrackTapeDB';
const TAPE_STORE = 'tapeImages';
const PROMER_STORE = 'promerImages'; 

function openTapeDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(TAPE_DB_NAME, 5); // Upgrade to v5 for page-based Promer
        req.onupgradeneeded = e => { 
            const db = e.target.result;
            if (!db.objectStoreNames.contains(TAPE_STORE)) {
                db.createObjectStore(TAPE_STORE, { keyPath: 'km' }); 
            }
            // Re-create PROMER_STORE with 'page' as keyPath
            if (db.objectStoreNames.contains(PROMER_STORE)) {
                db.deleteObjectStore(PROMER_STORE);
            }
            db.createObjectStore(PROMER_STORE, { keyPath: 'page' }); 
        };
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => {
            console.error('IndexedDB Error:', e.target.error);
            reject(e.target.error);
        };
    });
}

async function saveTapeImage(km, imageDataUrl) {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(TAPE_STORE, 'readwrite');
        tx.objectStore(TAPE_STORE).put({ km: parseInt(km), image: imageDataUrl, uploadDate: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e.target.error);
    });
}

async function savePromerPage(page, imageDataUrl) {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PROMER_STORE, 'readwrite');
        tx.objectStore(PROMER_STORE).put({ page: parseInt(page), image: imageDataUrl, uploadDate: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e.target.error);
    });
}

async function getPromerPage(page) {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PROMER_STORE, 'readonly');
        const req = tx.objectStore(PROMER_STORE).get(parseInt(page));
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = e => reject(e.target.error);
    });
}

async function clearPromerStore() {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PROMER_STORE, 'readwrite');
        tx.objectStore(PROMER_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e.target.error);
    });
}

async function getPromerPagesCount() {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PROMER_STORE, 'readonly');
        const req = tx.objectStore(PROMER_STORE).count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
    });
}

async function getTapeImage(km) {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(TAPE_STORE, 'readonly');
        const req = tx.objectStore(TAPE_STORE).get(parseInt(km));
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = e => reject(e.target.error);
    });
}

async function getAllTapeKms() {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(TAPE_STORE, 'readonly');
        const req = tx.objectStore(TAPE_STORE).getAllKeys();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = e => reject(e.target.error);
    });
}

// ===================== MAIN HTML GENERATOR =====================
window.generateTrackDefectHTML = function (bolinmaId, isInline = false) {
    let defects = window.trackDefectsData || [];
    window.trackDefectsData = defects;

    let isMasterKey = (bolinmaId === 'ishlab-chiqarish' || !bolinmaId || bolinmaId === 'all');
    let filteredDefects = isMasterKey
        ? defects
        : defects.filter(d => d.isAutoExtracted || (d.bolinma === bolinmaId || bolinmaId.includes(d.bolinma.replace("-bo'linma", ''))));

    // Separate by degree
    let critical34 = filteredDefects.filter(d => d.degree >= 3 && d.status !== 'fixed');
    let degree2Count = filteredDefects.filter(d => d.degree === 2).length;
    let total = filteredDefects.length;
    let fixed = filteredDefects.filter(d => d.status === 'fixed').length;

    // Group 2-degree by KM for summary
    let degree2ByKm = {};
    filteredDefects.filter(d => d.degree === 2).forEach(d => {
        degree2ByKm[d.km] = (degree2ByKm[d.km] || 0) + 1;
    });

    // Get KM range for bolinma filtering
    let bolinmaRange = getBolinmaKmRange(bolinmaId);

    return `
        <div class="window-header" style="background: linear-gradient(135deg, #1e293b, #0f172a); border-bottom: 2px solid #e74c3c; ${isInline ? 'border-radius: 15px 15px 0 0;' : ''}">
            <div>
                <h2 class="department-name" style="color: #e74c3c; text-shadow: 0 0 10px rgba(231, 76, 60, 0.4); display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-satellite-dish"></i> SMART TRACK-DEFECT MONITOR (${isMasterKey ? "Barcha bo'linmalar" : bolinmaId})
                </h2>
                <div style="color: #94a3b8; font-size: 0.9rem; margin-top: 5px; font-weight: bold;">
                    <i class="fas fa-map-marker-alt" style="color: #f59e0b;"></i> ${bolinmaRange ? bolinmaRange.start + ' km – ' + bolinmaRange.end + ' km' : '4020 km – 4303 km (284 km)'}
                </div>
            </div>
            ${!isInline ? `
            <button type="button" class="close-btn" onclick="document.getElementById('track-defect-modal').classList.remove('active')" style="color: #cbd5e1; transition: 0.3s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#cbd5e1'">
                <i class="fas fa-times"></i>
            </button>` : ''}
        </div>
        <div class="window-content" style="padding: 20px; background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%); color: #f8fafc; display: flex; flex-direction: column; gap: 15px; ${isInline ? 'border-radius: 0 0 15px 15px; height: 800px; max-height: 85vh;' : ''}">
            
            <!-- PROMER METADATA BAR -->
            <div id="promer-info-bar" style="display: flex; align-items: center; justify-content: space-between; background: rgba(56,189,248,0.05); border: 1px solid rgba(56,189,248,0.2); padding: 8px 15px; border-radius: 10px; font-size: 0.85rem; color: #38bdf8;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-file-invoice" style="font-size: 1.1rem;"></i>
                    <span id="promer-summary-text">Oxirgi yuklangan hisobot: <b id="last-promer-name">Noma'lum</b></span>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span id="last-promer-date" style="font-weight: bold; color: #94a3b8;">-</span>
                    <i class="fas fa-history" style="cursor: pointer; opacity: 0.7;" onclick="window.SmartUtils.showToast('Hisobotlar tarixi yaqin orada qo\'shiladi', 'info')"></i>
                </div>
            </div>

            <!-- KPI Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #94a3b8; font-size: 0.8rem; font-weight: bold;">JAMI</div>
                        <div style="font-size: 1.8rem; font-weight: 800;">${total}</div>
                    </div>
                    <i class="fas fa-clipboard-list" style="font-size: 2rem; color: #38bdf8; opacity: 0.5;"></i>
                </div>
                <div style="background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #ef4444; font-size: 0.8rem; font-weight: bold;">3-4 DARAJA</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #ef4444;">${critical34.length}</div>
                    </div>
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; opacity: 0.8;"></i>
                </div>
                <div style="background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #f59e0b; font-size: 0.8rem; font-weight: bold;">2-DARAJA (soni)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #f59e0b;">${degree2Count}</div>
                    </div>
                    <i class="fas fa-info-circle" style="font-size: 2rem; color: #f59e0b; opacity: 0.8;"></i>
                </div>
                <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #10b981; font-size: 0.8rem; font-weight: bold;">YOPILGAN</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #10b981;">${fixed}</div>
                    </div>
                    <i class="fas fa-check-circle" style="font-size: 2rem; color: #10b981; opacity: 0.8;"></i>
                </div>
            </div>

            <!-- MAINTENANCE HEATMAP (LOCALIZED) -->
            <div id="subdivision-heatmap-container" style="background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255, 215, 0, 0.1); border-radius: 15px; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <div style="font-size: 0.8rem; font-weight: bold; color: #d4af37; text-transform: uppercase;">Bo'linma Ta'mirlash Xaritasi (Heatmap)</div>
                    <div style="font-size: 0.75rem; color: #94a3b8;">4-daraja: <span style="background: #ef4444; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span> | 3-daraja: <span style="background: #f59e0b; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span></div>
                </div>
                <div style="display: flex; height: 35px; background: rgba(0,0,0,0.3); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); position: relative;">
                    ${(() => {
                        let segments = '';
                        if (bolinmaRange) {
                            let totalKm = bolinmaRange.end - bolinmaRange.start + 1;
                            for (let k = bolinmaRange.start; k <= bolinmaRange.end; k++) {
                                let kmDefects = filteredDefects.filter(d => d.km === k);
                                let maxDegree = Math.max(0, ...kmDefects.map(d => d.degree));
                                let color = 'transparent';
                                if (maxDegree === 4) color = 'rgba(239, 68, 68, 0.6)';
                                else if (maxDegree === 3) color = 'rgba(245, 158, 11, 0.4)';
                                else if (maxDegree === 2) color = 'rgba(56, 189, 248, 0.2)';
                                
                                segments += `<div style="flex: 1; background: ${color}; border-right: 1px solid rgba(255,255,255,0.03);" title="${k}-km: ${kmDefects.length} ta kamchilik"></div>`;
                            }
                        } else {
                            segments = '<div style="flex: 1; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #94a3b8;">Yirik masshtabda heatmap mavjud emas</div>';
                        }
                        return segments;
                    })()}
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0 5px; font-size: 0.7rem; color: #64748b;">
                    <span>${bolinmaRange ? bolinmaRange.start + ' KM' : 'Mavjud emas'}</span>
                    <span>${bolinmaRange ? bolinmaRange.end + ' KM' : ''}</span>
                </div>
            </div>

            <!-- Main Area: Lenta + Defects -->
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; flex: 1; overflow: hidden; min-height: 0;">
                
                <!-- LEFT: Lenta Panel -->
                <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; display: flex; flex-direction: column; min-height: 0;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(56,189,248,0.3);">
                        <h3 style="color: #38bdf8; margin: 0; font-size: 1rem;">
                            <i class="fas fa-scroll"></i> Yo'l Lentasi
                        </h3>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            ${bolinmaId === 'ishlab-chiqarish' ? `<button type="button" onclick="window.openLentaUploadModal()" style="background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.3); color: #38bdf8; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
                                <i class="fas fa-upload"></i> Lenta yuklash
                            </button>` : ''}
                            <select id="lentaKmSelect" onchange="window.showTapeForKm(this.value)" style="background: #0f172a; border: 1px solid #334155; color: #38bdf8; padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 0.85rem;">
                                <option value="">KM tanlang...</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- 2-daraja KM summary -->
                    ${Object.keys(degree2ByKm).length > 0 ? `
                    <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; font-size: 0.8rem;">
                        <div style="color: #f59e0b; font-weight: bold; margin-bottom: 4px;"><i class="fas fa-info-circle"></i> 2-daraja kamchiliklar (faqat soni):</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${Object.entries(degree2ByKm).map(([km, count]) => `
                                <span style="background: rgba(245,158,11,0.15); padding: 2px 8px; border-radius: 10px; color: #fbbf24; font-weight: bold; cursor: pointer;" onclick="window.showTapeForKm(${km})">km ${km}: ${count} ta</span>
                            `).join('')}
                        </div>
                    </div>` : ''}

                    <!-- Tape Image Display Area -->
                    <div id="tape-display-area" style="flex: 1; background: #000; border: 1px solid #334155; border-radius: 8px; overflow-y: auto; display: flex; align-items: center; justify-content: center; min-height: 200px;">
                        <div style="text-align: center; color: #475569; padding: 30px;">
                            <i class="fas fa-scroll" style="font-size: 3rem; opacity: 0.3;"></i>
                            <p style="margin-top: 10px; font-size: 0.85rem;">KM tanlang yoki kamchilik ustiga bosing</p>
                            <p style="font-size: 0.75rem; color: #334155;">Lenta yuklanmagan bo'lsa, "Lenta yuklash" tugmasini bosing</p>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: Monitor Context (Promer + Defects) -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; display: flex; flex-direction: column; min-height: 0;">
                    <!-- PROMER UPLOAD CENTER -->
                    ${bolinmaId === 'ishlab-chiqarish' ? `
                    <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.05), rgba(16, 185, 129, 0.05)); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0; color: #38bdf8; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-file-pdf"></i> Promer Yuklash Markazi (AI)
                            </h4>
                            <p style="margin: 3px 0 0 0; font-size: 0.7rem; color: #94a3b8; line-height: 1.3;">
                                Tizim nuqsonlarni aniqlaydi va hisobot varaqlarini monitoring monitoriga saqlaydi.
                            </p>
                        </div>
                        <button type="button" onclick="window.openPromerUploadModal()" style="background: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(16,185,129,0.3); transition: 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                            <i class="fas fa-cloud-upload-alt"></i> PROMER YUKLASH
                        </button>
                    </div>` : ''}

                    <!-- DUAL VIEW MONITOR AREA -->
                    <div style="display: flex; gap: 15px; flex: 1; min-height: 0;">
                        
                        <!-- MONITOR: PROMER REPORT VIEWER -->
                        <div id="promer-viewer-column" style="flex: 1.2; background: #070b14; border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                            <div style="padding: 6px 12px; background: rgba(16,185,129,0.1); border-bottom: 1px solid rgba(16,185,129,0.2); display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <button type="button" onclick="window.promerNavigate(-1)" style="background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #10b981; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.7rem;"><i class="fas fa-chevron-left"></i></button>
                                    <div id="promer-viewer-page-text" style="font-size: 0.7rem; color: #10b981; font-weight: bold; min-width: 80px; text-align: center;">Varaq --</div>
                                    <button type="button" onclick="window.promerNavigate(1)" style="background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #10b981; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.7rem;"><i class="fas fa-chevron-right"></i></button>
                                </div>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <button type="button" id="promer-zoom-btn" style="display:none; background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #10b981; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.65rem; font-weight: bold; transition: 0.2s;" onclick="window.openPromerViewerFullScreen()" onmouseover="this.style.background='rgba(16,185,129,0.3)'" onmouseout="this.style.background='rgba(16,185,129,0.2)'">
                                        <i class="fas fa-expand-arrows-alt"></i> TAHLIL
                                    </button>
                                </div>
                            </div>
                            <div id="promer-image-display" style="flex: 1; display: flex; align-items: center; justify-content: center; background: #000; overflow: auto; padding: 10px; position: relative;">
                                <div style="text-align: center; color: #334155; padding: 20px;">
                                    <i class="fas fa-microchip" style="font-size: 2.5rem; margin-bottom: 10px; opacity: 0.3;"></i>
                                    <div style="font-size: 0.75rem; line-height: 1.4;">Nuqsonni tanlang<br>yoki hisobotni yuklang</div>
                                </div>
                            </div>
                        </div>

                        <!-- MONITOR: DEFECT LIST -->
                        <div style="flex: 1; display: flex; flex-direction: column; min-width: 300px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(56,189,248,0.3); padding-bottom: 8px; margin-bottom: 10px; flex-shrink: 0;">
                                <h3 style="color: #f8fafc; margin: 0; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-satellite-dish" style="color: #38bdf8;"></i> 3-4 MONITORING
                                </h3>
                                <div style="display: flex; gap: 5px;">
                                    ${bolinmaId === 'ishlab-chiqarish' ? `
                                    <button type="button" onclick="window.openAddDefectModal()" style="background: rgba(231,76,60,0.1); border: 1px solid #e74c3c; color: #e74c3c; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.65rem;">
                                        <i class="fas fa-plus"></i> Qo'lda
                                    </button>` : ''}
                                </div>
                            </div>

                            <div id="track-defect-list" style="flex: 1; overflow-y: auto; padding-right: 5px; display: flex; flex-direction: column; gap: 8px;" class="custom-scrollbar">
                                ${critical34.length > 0 ? critical34.sort((a, b) => b.id - a.id).map(d => {
                                    let sc = d.status === 'fixed' ? '#10b981' : (d.status === 'in_progress' ? '#f59e0b' : '#ef4444');
                                    let repeatBadge = d.isRepeated ? `<span style="background: rgba(245,158,11,0.2); border: 1px solid #f59e0b; color: #f59e0b; padding: 1px 4px; border-radius: 3px; font-size: 0.6rem; font-weight: bold; margin-left:5px;">TAKRORIY</span>` : '';

                                    return `
                                    <div onclick="${d.pageNumber ? `window.showPromerPage(${d.pageNumber})` : `window.showTapeForKm(${d.km}, ${d.pk})`}" class="defect-card-elite" style="border-left: 3px solid ${sc}; cursor: pointer; transition: 0.2s; display: grid; grid-template-columns: 1fr 2fr auto; gap: 8px; align-items: center; padding: 10px; background: rgba(30, 41, 59, 0.4); border-radius: 8px;" onmouseover="this.style.background='rgba(56, 189, 248, 0.08)'" onmouseout="this.style.background='rgba(30, 41, 59, 0.4)'">
                                        <div>
                                            <div style="font-size: 0.85rem; font-weight: bold; color: #f8fafc; font-family: monospace;">km ${d.km} pk ${d.pk} ${repeatBadge}</div>
                                            <div style="color: ${d.degree >= 4 ? '#ef4444' : '#f59e0b'}; font-weight: bold; font-size: 0.7rem; margin-top: 2px;">${d.degree}-daraja</div>
                                        </div>
                                        <div style="border-left: 1px solid rgba(255,255,255,0.1); padding-left: 8px;">
                                            <div style="color: #38bdf8; font-weight: bold; font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d.type}</div>
                                            <div style="color: #cbd5e1; font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.description}</div>
                                        </div>
                                        <div style="text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
                                            ${d.degree >= 3 ? `<button onclick="event.stopPropagation(); window.generateDalolatnoma(${d.id})" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #ef4444; padding: 3px 6px; border-radius: 4px; font-size: 0.6rem; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.4)'" onmouseout="this.style.background='rgba(239,68,68,0.2)'"><i class="fas fa-file-pdf"></i> PU-28</button>` : ''}
                                            <span style="color: #475569; font-size: 0.6rem;"><i class="fas fa-eye"></i> Ko'rish</span>
                                        </div>
                                    </div>`}).join('') : `
                                <div style="text-align: center; color: #64748b; padding: 25px 10px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px;">
                                    <i class="fas fa-file-upload" style="font-size: 2.2rem; opacity: 0.2; margin-bottom: 8px;"></i>
                                    <h5 style="color: #94a3b8; margin: 0 0 3px 0;">PROMER mavjud emas</h5>
                                    <p style="font-size: 0.65rem;">Hisobotni yuqoridan yuklang</p>
                                </div>`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- NEW: Chronic Issues Summary (Master Control) -->
            ${filteredDefects.filter(d => d.isRepeated).length > 0 ? `
            <div style="background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); border-radius: 12px; padding: 12px 15px; display: flex; align-items: center; gap: 20px;">
                <div style="background: #f59e0b; color: #000; width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                    <i class="fas fa-user-shield" style="color: #000 !important;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="color: #f59e0b; font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Xronik nuqsonlar tahlili (Nazorat)</div>
                    <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 2px;">
                        Aniqlangan ${filteredDefects.filter(d => d.isRepeated).length} ta takroriy nuqson yo'l ustalarining ish sifatiga past baho berilishiga asos bo'ladi.
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    ${[...new Set(filteredDefects.filter(d => d.isRepeated).map(d => d.bolinma))].map(bol => `
                        <span style="background: rgba(239,68,68,0.1); border: 1px solid #ef4444; color: #ef4444; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">
                            <i class="fas fa-exclamation-circle"></i> ${bol}
                        </span>
                    `).join('')}
                </div>
            </div>` : ''}
        </div>
        <style>
            @keyframes pulseRed {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
            @keyframes pulseYellow {
                0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
                100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
            }
            .repeat-pulse { animation: pulseYellow 2s infinite; }
        </style>
    `;
};

// ===================== Show Tape for KM =====================
window.showTapeForKm = async function (km, pk = null) {
    if (!km) return;
    km = parseInt(km);
    const display = document.getElementById('tape-display-area');
    if (!display) return;

    // Update selector
    const sel = document.getElementById('lentaKmSelect');
    if (sel) sel.value = km;

    display.innerHTML = `<div style="text-align: center; color: #38bdf8; padding: 20px;"><i class="fas fa-spinner fa-spin" style="font-size: 1.5rem;"></i><p style="font-size: 0.8rem; margin-top: 8px;">km ${km} lentasi yuklanmoqda...</p></div>`;

    try {
        const tape = await getTapeImage(km);
        if (tape && tape.image) {
            display.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; position: relative; border-radius: 8px; overflow: hidden;">
                    <div style="background: rgba(15, 23, 42, 0.95); padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; z-index: 5; border-bottom: 1px solid rgba(56,189,248,0.3);">
                        <span style="color: #38bdf8; font-weight: bold; font-size: 0.9rem;"><i class="fas fa-scroll"></i> KM ${km} Lentasi</span>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <span style="color: #64748b; font-size: 0.75rem;">${tape.uploadDate ? new Date(tape.uploadDate).toLocaleDateString() : ''}</span>
                            <button type="button" onclick="window.openTapeViewerFullScreen(${km}, ${pk})" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: white; padding: 6px 15px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); text-shadow: 0 1px 2px rgba(0,0,0,0.5); transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                <i class="fas fa-expand"></i> Katta ko'rish (Analiz)
                            </button>
                        </div>
                    </div>
                    <div style="position: relative; width: 100%; flex: 1; min-height: 250px; cursor: zoom-in; overflow: hidden; display: flex; align-items: flex-start; justify-content: center; background: #000;" onclick="window.openTapeViewerFullScreen(${km}, ${pk})">
                        <img src="${tape.image}" style="max-width: 100%; height: auto; max-height: 100%; object-fit: contain; display: block;" alt="KM ${km} lentasi"/>
                        <div style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0); transition: 0.3s;" onmouseover="this.style.background='rgba(56, 189, 248, 0.05)'; this.childNodes[1].style.transform='scale(1)'; this.childNodes[1].style.opacity='1';" onmouseout="this.style.background='rgba(0,0,0,0)'; this.childNodes[1].style.transform='scale(0.8)'; this.childNodes[1].style.opacity='0';">
                            <div style="background: rgba(0,0,0,0.8); padding: 15px 30px; border-radius: 50px; border: 1px solid #38bdf8; color: #38bdf8; font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; transform: scale(0.8); opacity: 0; transition: 0.3s; box-shadow: 0 0 25px rgba(56,189,248,0.5);">
                                <i class="fas fa-search-plus"></i> Analiz Rejimi
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            display.innerHTML = `
                <div style="text-align: center; color: #64748b; padding: 30px;">
                    <i class="fas fa-image" style="font-size: 2.5rem; opacity: 0.3;"></i>
                    <p style="margin-top: 10px; font-size: 0.85rem;">KM ${km} uchun lenta yuklanmagan</p>
                    <p style="font-size: 0.75rem; color: #475569;">Ishlab chiqarish bo'limi "PDF Yuklash" orqali yuklashi kerak</p>
                </div>`;
        }
    } catch (err) {
        display.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 20px;"><i class="fas fa-exclamation-circle"></i> Xatolik: ${err.message}</div>`;
    }
};

// ===================== FULLSCREEN LENTA VIEWER (ANALIZ) =====================
window.openTapeViewerFullScreen = async function (km, highlightPk = null) {
    if (!km) return;
    const tape = await getTapeImage(km);
    if (!tape || !tape.image) return;

    let defects = window.trackDefectsData || [];
    let kmDefects = defects.filter(d => d.km === km && d.status !== 'fixed' && d.degree >= 3);

    let modal = document.getElementById('tape-fullscreen-viewer');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tape-fullscreen-viewer';
        modal.innerHTML = `
            <style>
                .glass-panel-top {
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }
                .zoom-btn {
                    background: rgba(255,255,255,0.05); color: #f8fafc; border: 1px solid rgba(255,255,255,0.1);
                    width: 44px; height: 44px; border-radius: 10px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: 0.2s;
                }
                .zoom-btn:hover { background: rgba(56,189,248,0.2); border-color: #38bdf8; color: #38bdf8; box-shadow: 0 0 15px rgba(56,189,248,0.3); transform: translateY(-2px); }
                .zoom-btn:active { transform: translateY(0); }
                
                .defect-box {
                    position: absolute; border: 2px solid; background: transparent; 
                    cursor: pointer; transition: 0.2s; border-radius: 4px; z-index: 10;
                }
                .defect-box:hover { z-index: 1000; background: rgba(255,255,255,0.1); }
                .defect-tooltip {
                    position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
                    background: rgba(15,23,42,0.95); color: white; padding: 8px 12px; border-radius: 8px;
                    font-size: 0.8rem; white-space: nowrap; pointer-events: none; opacity: 0; transition: 0.3s;
                    border: 1px solid; margin-bottom: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.8); backdrop-filter: blur(5px);
                }
                .defect-box:hover .defect-tooltip { opacity: 1; bottom: calc(100% + 5px); }
                
                .ruler-x { position: absolute; top: 0; bottom: 0; width: 1.5px; background: #38bdf8; pointer-events: none; display: none; box-shadow: 0 0 8px #38bdf8, 0 0 2px #fff; z-index: 50;}
                .ruler-y { position: absolute; left: 0; right: 0; height: 1.5px; background: #38bdf8; pointer-events: none; display: none; box-shadow: 0 0 8px #38bdf8, 0 0 2px #fff; z-index: 50;}
                .ruler-label { 
                    position: absolute; background: rgba(15,23,42,0.9); color: #38bdf8; padding: 5px 10px; font-size: 0.8rem; 
                    border-radius: 6px; pointer-events: none; z-index: 51; border: 1px solid rgba(56,189,248,0.5); font-weight: bold; font-family: monospace;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                }
                
                .night-mode-active img { filter: invert(0.9) hue-rotate(180deg) brightness(1.3) contrast(1.5); }
                
                @keyframes pulseRedElite {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0), inset 0 0 5px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0), inset 0 0 10px rgba(239, 68, 68, 0); }
                }
            </style>
            
            <div class="glass-panel-top" style="position: absolute; top: 25px; left: 50%; transform: translateX(-50%); padding: 12px 25px; border-radius: 16px; z-index: 100; display: flex; gap: 20px; align-items: center;">
                <div style="color: #f8fafc; font-weight: bold; font-size: 1.2rem; display: flex; align-items: center; gap: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                    <i class="fas fa-satellite-dish" style="color: #38bdf8;"></i> RADAR / KM ${km} ${highlightPk ? ` | PK ${highlightPk}` : ''}
                </div>
                <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.15);"></div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="zoom-btn" onclick="window.tapeZoomAction(-0.3)" title="Kichraytirish"><i class="fas fa-search-minus"></i></button>
                    <button type="button" class="zoom-btn" onclick="window.tapeZoomAction(0.3)" title="Kattalashtirish"><i class="fas fa-search-plus"></i></button>
                    <button type="button" class="zoom-btn" onclick="window.resetTapeZoomAction()" title="Asliga qaytarish"><i class="fas fa-expand-arrows-alt"></i></button>
                    <button type="button" id="nightModeBtn" class="zoom-btn" onclick="window.toggleNightModeAction()" title="Tungi rejim (Kontrast)"><i class="fas fa-moon"></i></button>
                </div>
                <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.15);"></div>
                
                <!-- QALAM USKUNALARI (PENCIL TOOLS) -->
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button type="button" id="pencilBtn" class="zoom-btn" onclick="window.togglePencilMode()" title="Qalam (Chizish rejimini yoqish/o'chirish)">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button type="button" id="clearDrawBtn" class="zoom-btn" onclick="window.clearTapeDrawBoard()" title="Chizuvni tozalash" style="display:none; color: #ef4444;">
                        <i class="fas fa-eraser"></i>
                    </button>
                    <button type="button" id="saveDrawBtn" class="zoom-btn" onclick="window.saveTapeDrawing()" title="Chizilgan lentani saqlash" style="display:none; color: #10b981; border-color: rgba(16,185,129,0.3);">
                        <i class="fas fa-save"></i>
                    </button>
                </div>

                <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.15);"></div>
                <button type="button" onclick="window.closeTapeViewerAction()" style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; transition: 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.3)'; this.style.borderColor='#ef4444';" onmouseout="this.style.background='rgba(239,68,68,0.15)'; this.style.borderColor='rgba(239,68,68,0.4)';">
                    <i class="fas fa-times-circle"></i> Yopish
                </button>
            </div>

            <div id="tape-wrapper" style="width: 100%; height: 100%; position: relative; overflow: hidden; background: #070b14; cursor: grab;">
                <div id="tape-transform-layer" style="transform-origin: 0 0; position: absolute; top: 0; left: 0; transition: transform 0.1s ease-out;">
                    <img id="tape-image" src="" alt="Tape" style="display: block; pointer-events: none; user-select: none; box-shadow: 0 0 50px rgba(255,255,255,0.05);">
                    <canvas id="tape-draw-layer" style="position: absolute; top: 0; left: 0; pointer-events: none; z-index: 5;"></canvas>
                    <div id="tape-defects-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto; z-index: 6;"></div>
                </div>

                <!-- Radar Lines -->
                <div id="radar-x" class="ruler-x"></div>
                <div id="radar-y" class="ruler-y"></div>
                <div id="radar-label" class="ruler-label" style="display: none;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(2, 6, 23, 0.95); z-index:10030; display:flex; flex-direction:column; overflow:hidden; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: scale(1.02); backdrop-filter: blur(5px);';

        // Expose functions globally once
        window.tapeState = { scale: 1, panX: 0, panY: 0, isPanning: false, km: km };

        window.applyTapeTransform = function () {
            const layer = document.getElementById('tape-transform-layer');
            if (layer) layer.style.transform = `translate(${window.tapeState.panX}px, ${window.tapeState.panY}px) scale(${window.tapeState.scale})`;
        };

        window.tapeZoomAction = function (delta, originX = null, originY = null) {
            let newScale = window.tapeState.scale + delta;
            if (newScale < 0.2) newScale = 0.2;
            if (newScale > 10) newScale = 10;

            const wrapper = document.getElementById('tape-wrapper');
            let cx = originX !== null ? originX : wrapper.clientWidth / 2;
            let cy = originY !== null ? originY : wrapper.clientHeight / 2;

            window.tapeState.panX = cx - (cx - window.tapeState.panX) * (newScale / window.tapeState.scale);
            window.tapeState.panY = cy - (cy - window.tapeState.panY) * (newScale / window.tapeState.scale);
            window.tapeState.scale = newScale;
            window.applyTapeTransform();
        };

        window.resetTapeZoomAction = function () {
            const img = document.getElementById('tape-image');
            const wrapper = document.getElementById('tape-wrapper');
            if (img.naturalWidth > 0 && wrapper.clientWidth > 0) {
                // Fit to width by default so it's readable
                let wScale = wrapper.clientWidth / img.naturalWidth;
                window.tapeState.scale = wScale < 1 ? wScale * 0.9 : 1;
            } else {
                window.tapeState.scale = 1;
            }
            window.tapeState.panX = (wrapper.clientWidth - (img.naturalWidth * window.tapeState.scale)) / 2;
            
            // If highlighted PK, scroll to it
            if (highlightPk && img.naturalHeight) {
                const ratio = ((highlightPk - 1) / 10) + 0.05;
                window.tapeState.panY = -(ratio * img.naturalHeight * window.tapeState.scale) + (wrapper.clientHeight / 2);
            } else {
                window.tapeState.panY = 50;
            }
            window.applyTapeTransform();
        };

        window.toggleNightModeAction = function () {
            const wrapper = document.getElementById('tape-wrapper');
            const btn = document.getElementById('nightModeBtn');
            if (wrapper.classList.contains('night-mode-active')) {
                wrapper.classList.remove('night-mode-active');
                btn.innerHTML = '<i class="fas fa-moon"></i>';
                btn.style.color = "#f8fafc";
                btn.style.borderColor = "rgba(255,255,255,0.1)";
            } else {
                wrapper.classList.add('night-mode-active');
                btn.innerHTML = '<i class="fas fa-sun"></i>';
                btn.style.color = "#f59e0b";
                btn.style.borderColor = "#f59e0b";
            }
        };

        window.closeTapeViewerAction = function () {
            const m = document.getElementById('tape-fullscreen-viewer');
            if (m) {
                m.style.opacity = '0';
                m.style.transform = 'scale(0.98)';
                setTimeout(() => { m.remove(); }, 400);
            }
        };

        // Render Defects AI Boxes
        window.renderDefectAIBox = function (defects, imgW, imgH) {
            const container = document.getElementById('tape-defects-container');
            container.innerHTML = '';
            defects.forEach(d => {
                let pkRatio = d.pk ? ((d.pk - 1) / 10) + 0.05 : Math.random() * 0.9;
                // Assumes Y-axis is longitudinal length
                let boxHeight = imgH * 0.05; // 5% of height per defect box approx
                let boxWidth = imgW * 0.2;   // 20% width per lane
                let yPos = pkRatio * imgH - (boxHeight / 2);

                let laneIdx = 0;
                if (d.type.includes('Siljish') || d.type.includes('Burchak')) laneIdx = 1;
                else if (d.type.includes('Kengayish') || d.type.includes('Torayish')) laneIdx = 2;
                else if (d.type.includes('Kortka')) laneIdx = 3;
                let xPos = (imgW / 4) * laneIdx + (imgW / 8) - (boxWidth / 2);

                let isCritical = d.degree === 4;
                let color = isCritical ? '#ef4444' : '#f59e0b';

                const box = document.createElement('div');
                box.className = 'defect-box';
                box.style.width = boxWidth + 'px';
                box.style.height = boxHeight + 'px';
                box.style.left = xPos + 'px';
                box.style.top = yPos + 'px';
                box.style.borderColor = color;
                box.style.backgroundColor = isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';

                if (isCritical) {
                    box.style.animation = 'pulseRedElite 2s infinite';
                    box.style.boxShadow = '0 0 20px rgba(239,68,68,0.5), inset 0 0 10px rgba(239,68,68,0.5)';
                }

                box.innerHTML = `
                    <div class="defect-tooltip" style="border-color: ${color}">
                        <div style="font-size: 0.95rem; color: ${color}; margin-bottom: 3px;">
                            ${isCritical ? '<i class="fas fa-skull-crossbones"></i> O\'TA XAVFLI' : '<i class="fas fa-exclamation-triangle"></i> XAVFLI'}
                        </div>
                        <span style="color: #cbd5e1">${d.type}</span><br>
                        <span style="color: #94a3b8; font-size: 0.7rem;">km ${d.km} pk ${d.pk}</span>
                    </div>
                `;
                container.appendChild(box);
            });
        };

        // Events listeners for pan/zoom/radar
        const wrap = document.getElementById('tape-wrapper');
        let startX = 0, startY = 0, pStartX = 0, pStartY = 0;

        wrap.addEventListener('mousedown', (e) => {
            if (e.target.closest('.glass-panel-top')) return;
            if (window.tapeState.isDrawingMode) return; // Qalam yoqilgan bo'lsa, surgatishni to'xtatish
            window.tapeState.isPanning = true;
            startX = e.clientX; startY = e.clientY;
            pStartX = window.tapeState.panX; pStartY = window.tapeState.panY;
            wrap.style.cursor = 'grabbing';
            document.getElementById('tape-transform-layer').style.transition = 'none'; // disable transition while panning
        });

        window.addEventListener('mousemove', (e) => {
            const mViewer = document.getElementById('tape-fullscreen-viewer');
            if (!mViewer) return;

            const rect = wrap.getBoundingClientRect();
            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;

            // Radar
            const rx = document.getElementById('radar-x');
            const ry = document.getElementById('radar-y');
            const rL = document.getElementById('radar-label');

            if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height && !e.target.closest('.glass-panel-top')) {
                rx.style.display = 'block'; ry.style.display = 'block'; rL.style.display = 'block';
                rx.style.left = mouseX + 'px'; ry.style.top = mouseY + 'px';
                rL.style.left = (mouseX + 15) + 'px'; rL.style.top = (mouseY + 15) + 'px';

                const img = document.getElementById('tape-image');
                if (img && img.naturalHeight) {
                    const realY = (mouseY - window.tapeState.panY) / window.tapeState.scale;
                    let ratio = realY / img.naturalHeight;
                    ratio = Math.max(0, Math.min(1, ratio));
                    let metr = Math.round(ratio * 1000);
                    let pk = Math.floor(metr / 100) + 1;
                    if (pk > 10) pk = 10;
                    rL.innerHTML = `<i class="fas fa-crosshairs"></i> PK ${pk} | ${metr}m`;
                }
            } else {
                rx.style.display = 'none'; ry.style.display = 'none'; rL.style.display = 'none';
            }

            // Panning
            if (!window.tapeState.isPanning) return;
            window.tapeState.panX = pStartX + (e.clientX - startX);
            window.tapeState.panY = pStartY + (e.clientY - startY);
            window.applyTapeTransform();
        });

        window.addEventListener('mouseup', () => {
            window.tapeState.isPanning = false;
            wrap.style.cursor = 'grab';
            document.getElementById('tape-transform-layer').style.transition = 'transform 0.1s ease-out';
        });

        wrap.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = wrap.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            let delta = e.deltaY < 0 ? 0.3 : -0.3;
            window.tapeZoomAction(delta, mx, my);
        }, { passive: false });
    }

    // Update image and show
    const img = document.getElementById('tape-image');
    img.src = tape.image;
    window.tapeState.km = km;
    window.tapeState.isDrawingMode = false;

    // Drawing context
    let ctx = null;
    let isDrawing = false;
    let lastX = 0; let lastY = 0;

    img.onload = () => {
        window.resetTapeZoomAction();
        window.renderDefectAIBox(kmDefects, img.naturalWidth, img.naturalHeight);

        // Setup Canvas for Drawing
        const canvas = document.getElementById('tape-draw-layer');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#ef4444'; // Red pointer/pencil marker
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        canvas.addEventListener('mousedown', (e) => {
            if (!window.tapeState.isDrawingMode) return;
            isDrawing = true;
            // offsetX / offsetY elementning haqiqiy (scale'dan qat'iy nazar) koordinatasini beradi
            lastX = e.offsetX;
            lastY = e.offsetY;
            e.stopPropagation(); // Prevent panning
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!window.tapeState.isDrawingMode || !isDrawing) return;
            let currentX = e.offsetX;
            let currentY = e.offsetY;

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();

            lastX = currentX;
            lastY = currentY;
            e.stopPropagation();
        });

        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('mouseout', () => { isDrawing = false; });
    };

    // Export Drawing Methods
    window.togglePencilMode = function () {
        window.tapeState.isDrawingMode = !window.tapeState.isDrawingMode;
        const btn = document.getElementById('pencilBtn');
        const drawLayer = document.getElementById('tape-draw-layer');
        if (window.tapeState.isDrawingMode) {
            btn.style.background = 'rgba(245,158,11,0.4)';
            btn.style.color = '#fff';
            document.getElementById('clearDrawBtn').style.display = 'flex';
            document.getElementById('saveDrawBtn').style.display = 'flex';
            drawLayer.style.pointerEvents = 'auto'; // allow drawing
            drawLayer.style.zIndex = '20'; // defect-box-larni (z-index: 6) yopib turishi uchun
            document.getElementById('tape-wrapper').style.cursor = 'crosshair';
        } else {
            btn.style.background = 'rgba(255,255,255,0.05)';
            btn.style.color = '#f8fafc';
            document.getElementById('clearDrawBtn').style.display = 'none';
            document.getElementById('saveDrawBtn').style.display = 'none';
            drawLayer.style.pointerEvents = 'none';
            drawLayer.style.zIndex = '5';
            document.getElementById('tape-wrapper').style.cursor = 'grab';
        }
    };

    window.clearTapeDrawBoard = function () {
        const canvas = document.getElementById('tape-draw-layer');
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    window.saveTapeDrawing = async function () {
        const canvas = document.getElementById('tape-draw-layer');

        // Merge image and drawing
        const mergedGrid = document.createElement('canvas');
        mergedGrid.width = img.naturalWidth;
        mergedGrid.height = img.naturalHeight;
        const mCtx = mergedGrid.getContext('2d');

        // Background white (just in case)
        mCtx.fillStyle = "#fff";
        mCtx.fillRect(0, 0, mergedGrid.width, mergedGrid.height);
        mCtx.drawImage(img, 0, 0); // Original
        mCtx.drawImage(canvas, 0, 0); // Overlay drawings

        const mergedDataUrl = mergedGrid.toDataURL('image/jpeg', 0.85);

        try {
            document.getElementById('saveDrawBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            await saveTapeImage(window.tapeState.km, mergedDataUrl);
            window.SmartUtils.showToast("Chizmalar lentaga muhrlandi!", "success");

            // Refresh Image
            img.src = mergedDataUrl;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            window.togglePencilMode(); // Turn off
            document.getElementById('saveDrawBtn').innerHTML = '<i class="fas fa-save"></i>';
        } catch (err) {
            window.SmartUtils.showToast("Dasturda xatolik: Chizmalar saqlanmadi", "error");
            document.getElementById('saveDrawBtn').innerHTML = '<i class="fas fa-save"></i>';
        }
    };

    // Show modal with animation
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);
};



// ===================== FULLSCREEN PROMER VIEWER (ANALIZ) =====================
window.openPromerViewerFullScreen = async function (page = null) {
    const targetPage = page || window.currentPromerPage;
    if (!targetPage) return;
    
    const record = await getPromerPage(targetPage);
    if (!record || !record.image) {
        window.SmartUtils.showToast("Promer rasmi topilmadi", "error");
        return;
    }

    let modal = document.getElementById('promer-fullscreen-viewer');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'promer-fullscreen-viewer';
        modal.innerHTML = `
            <style>
                .promer-glass-top {
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
                }
                .p-zoom-btn {
                    background: rgba(255,255,255,0.05); color: #f8fafc; border: 1px solid rgba(255,255,255,0.1);
                    width: 44px; height: 44px; border-radius: 12px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: 0.2s;
                }
                .p-zoom-btn:hover { background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.3); transform: translateY(-2px); }
                .p-zoom-btn:active { transform: translateY(0); }
                
                .promer-night-mode img { filter: invert(0.9) hue-rotate(180deg) brightness(1.2) contrast(1.4); }
            </style>
            
            <div class="promer-glass-top" style="position: absolute; top: 25px; left: 50%; transform: translateX(-50%); padding: 12px 25px; border-radius: 18px; z-index: 100; display: flex; gap: 20px; align-items: center;">
                <div style="color: #f8fafc; font-weight: bold; font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-file-invoice" style="color: #10b981;"></i> PROMER TAHLIL | SAHIFA ${targetPage}
                </div>
                <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.15);"></div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="p-zoom-btn" onclick="window.promerZoomAction(-0.4)" title="Kichraytirish"><i class="fas fa-search-minus"></i></button>
                    <button type="button" class="p-zoom-btn" onclick="window.promerZoomAction(0.4)" title="Kattalashtirish"><i class="fas fa-search-plus"></i></button>
                    <button type="button" class="p-zoom-btn" onclick="window.resetPromerZoomAction()" title="Asliga qaytarish"><i class="fas fa-expand-arrows-alt"></i></button>
                    <button type="button" id="promerNightBtn" class="p-zoom-btn" onclick="window.togglePromerNightMode()" title="Tungi rejim"><i class="fas fa-moon"></i></button>
                </div>
                <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.15);"></div>
                <button type="button" onclick="window.closePromerViewerAction()" style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 10px; transition: 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.3)'; this.style.borderColor='#ef4444';" onmouseout="this.style.background='rgba(239,68,68,0.15)'; this.style.borderColor='rgba(239,68,68,0.4)';">
                    <i class="fas fa-times-circle"></i> Yopish
                </button>
            </div>

            <div id="promer-wrapper" style="width: 100%; height: 100%; position: relative; overflow: hidden; background: #000; cursor: grab;">
                <div id="promer-transform-layer" style="transform-origin: 0 0; position: absolute; top: 0; left: 0; transition: transform 0.1s ease-out;">
                    <img id="promer-zoom-image" src="${record.image}" style="display: block; pointer-events: none; user-select: none; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10031; display:flex; flex-direction:column; overflow:hidden; opacity: 0; transform: scale(1.02); transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); backdrop-filter: blur(10px);';

        window.promerState = { scale: 1, panX: 0, panY: 0, isPanning: false };

        window.applyPromerTransform = function () {
            const layer = document.getElementById('promer-transform-layer');
            if (layer) layer.style.transform = `translate(${window.promerState.panX}px, ${window.promerState.panY}px) scale(${window.promerState.scale})`;
        };

        window.promerZoomAction = function (delta) {
            let newScale = window.promerState.scale * (1 + delta);
            if (newScale < 0.1) newScale = 0.1;
            if (newScale > 15) newScale = 15;

            const wrapper = document.getElementById('promer-wrapper');
            let cx = wrapper.clientWidth / 2;
            let cy = wrapper.clientHeight / 2;

            window.promerState.panX = cx - (cx - window.promerState.panX) * (newScale / window.promerState.scale);
            window.promerState.panY = cy - (cy - window.promerState.panY) * (newScale / window.promerState.scale);
            window.promerState.scale = newScale;
            window.applyPromerTransform();
        };

        window.resetPromerZoomAction = function () {
            const img = document.getElementById('promer-zoom-image');
            const wrapper = document.getElementById('promer-wrapper');
            if (img.naturalWidth > 0) {
                let wScale = wrapper.clientWidth / img.naturalWidth;
                let hScale = wrapper.clientHeight / img.naturalHeight;
                window.promerState.scale = Math.min(wScale, hScale) * 0.9;
                window.promerState.panX = (wrapper.clientWidth - img.naturalWidth * window.promerState.scale) / 2;
                window.promerState.panY = (wrapper.clientHeight - img.naturalHeight * window.promerState.scale) / 2;
                window.applyPromerTransform();
            }
        };

        window.togglePromerNightMode = function() {
            const wrapper = document.getElementById('promer-wrapper');
            const btn = document.getElementById('promerNightBtn');
            if (wrapper.classList.contains('promer-night-mode')) {
                wrapper.classList.remove('promer-night-mode');
                btn.innerHTML = '<i class="fas fa-moon"></i>';
                btn.style.color = '#fff';
            } else {
                wrapper.classList.add('promer-night-mode');
                btn.innerHTML = '<i class="fas fa-sun"></i>';
                btn.style.color = '#f59e0b';
            }
        };

        window.closePromerViewerAction = function () {
            const m = document.getElementById('promer-fullscreen-viewer');
            if (m) {
                m.style.opacity = '0';
                m.style.transform = 'scale(1.02)';
                setTimeout(() => m.remove(), 400);
            }
        };

        // PANNING LOGIC
        const wrapper = document.getElementById('promer-wrapper');
        wrapper.onmousedown = e => { window.promerState.isPanning = true; wrapper.style.cursor = 'grabbing'; };
        window.onmousemove = e => {
            if (!window.promerState.isPanning) return;
            window.promerState.panX += e.movementX;
            window.promerState.panY += e.movementY;
            window.applyPromerTransform();
        };
        window.onmouseup = () => { window.promerState.isPanning = false; if(wrapper) wrapper.style.cursor = 'grab'; };
        wrapper.onwheel = e => {
            e.preventDefault();
            window.promerZoomAction(e.deltaY > 0 ? -0.1 : 0.1);
        };

        // Initial Reset
        const img = document.getElementById('promer-zoom-image');
        if (img.complete) window.resetPromerZoomAction();
        else img.onload = () => window.resetPromerZoomAction();
    }

    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);
};

// ===================== Populate KM Selector =====================
window.populateLentaKmSelector = async function (bolinmaId) {
    const sel = document.getElementById('lentaKmSelect');
    if (!sel) return;

    const allKms = await getAllTapeKms();
    const range = getBolinmaKmRange(bolinmaId);

    // Filter KMs by bolinma range
    const filteredKms = range ? allKms.filter(km => km >= range.start && km <= range.end) : allKms;

    sel.innerHTML = '<option value="">KM tanlang...</option>';
    filteredKms.sort((a, b) => a - b).forEach(km => {
        const opt = document.createElement('option');
        opt.value = km;
        opt.textContent = 'km ' + km;
        sel.appendChild(opt);
    });
};

// ===================== LENTA (TAPE) UPLOAD MODAL =====================
window.openLentaUploadModal = function () {
    let modal = document.getElementById('lenta-upload-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'lenta-upload-modal';
        modal.className = 'active';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10020; display:flex; align-items:center; justify-content:center;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#1e293b; width: 550px; padding: 30px; border-radius: 20px; border: 1px solid rgba(56,189,248,0.2); color: white;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #38bdf8;"><i class="fas fa-scroll"></i> Yo'l Lentasi (Rasm) Yuklash</h3>
                <button type="button" onclick="document.getElementById('lenta-upload-modal').remove()" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>

            <div style="background: rgba(56,189,248,0.05); border: 1px dashed rgba(56,189,248,0.3); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 20px;">
                <i class="fas fa-images" style="font-size: 3rem; color: #38bdf8; margin-bottom: 10px;"></i>
                <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 20px;">
                    Lenta rasmlarini yoki PDFni tanlang. Rasmlar tartib bilan KMlarga saqlanadi.
                </p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; text-align: left;">
                    <div style="${window.currentBolinmaId === 'ishlab-chiqarish' ? 'display: none;' : ''}">
                        <label style="display: block; margin-bottom: 5px; color: #94a3b8; font-size: 0.8rem;">Boshlanish KM</label>
                        <input type="number" id="lentaStartKm" value="4020" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white;">
                    </div>
                    <div style="${window.currentBolinmaId === 'ishlab-chiqarish' ? 'grid-column: span 2;' : ''}">
                        <label style="display: block; margin-bottom: 5px; color: #94a3b8; font-size: 0.8rem;">Fayl Turi</label>
                        <div style="padding: 10px; background: #0f172a; border-radius: 8px; border: 1px solid #334155; font-size: 0.85rem; color: #38bdf8;">Lenta (Visual)</div>
                    </div>
                </div>

                <input type="file" id="lentaFiles" accept=".pdf,.jpg,.jpeg,.png" multiple style="display: none;">
                <button type="button" onclick="document.getElementById('lentaFiles').click()" style="background: #38bdf8; color: #0f172a; border: none; padding: 12px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 1rem; width: 100%;">
                    <i class="fas fa-folder-open"></i> Fayllarni tanlash
                </button>
                <p id="lentaFileInfo" style="color: #64748b; font-size: 0.8rem; margin-top: 10px;"></p>
            </div>

            <div id="lentaUploadProgress" style="display: none;">
                <div style="background: #0f172a; border-radius: 10px; overflow: hidden; height: 8px; margin-bottom: 5px;">
                    <div id="lentaProgressBar" style="height: 100%; background: #10b981; width: 0%; transition: width 0.2s;"></div>
                </div>
                <div id="lentaProgressText" style="text-align: right; font-size: 0.75rem; color: #38bdf8;">0%</div>
            </div>

            <div id="lentaUploadResult" style="display: none; padding: 10px; background: rgba(16,185,129,0.1); border-radius: 8px; color: #10b981; text-align: center; margin-top: 10px;"></div>
        </div>
    `;

    document.getElementById('lentaFiles').addEventListener('change', window.handleLentaFileSelect);
};

// ===================== PROMER (AI) UPLOAD MODAL =====================
window.openPromerUploadModal = function () {
    let modal = document.getElementById('promer-upload-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'promer-upload-modal';
        modal.className = 'active';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10020; display:flex; align-items:center; justify-content:center;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#1e293b; width: 600px; padding: 35px; border-radius: 20px; border: 1px solid rgba(16,185,129,0.3); color: white; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #10b981; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-robot"></i> Promer AI Tahlil (Nuqsonlar)
                </h3>
                <button type="button" onclick="document.getElementById('promer-upload-modal').remove()" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>

            <div style="background: rgba(16,185,129,0.05); border: 2px dashed rgba(16,185,129,0.3); border-radius: 15px; padding: 30px; text-align: center; margin-bottom: 20px;">
                <i class="fas fa-file-invoice" style="font-size: 4rem; color: #10b981; margin-bottom: 15px; opacity: 0.8;"></i>
                <h4 style="margin: 0 0 10px 0; color: #f8fafc;">Promer PDF hisobotini yuklang</h4>
                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 25px; line-height: 1.5;">
                    Tizim hisobot matnini tahlil qiladi va 3-4 darajali nuqsonlarni avtomatik ravishda monitoring ro'yxatiga kiritadi.
                </p>

                <input type="file" id="promerPdfFile" accept=".pdf" style="display: none;">
                <button type="button" onclick="document.getElementById('promerPdfFile').click()" style="background: #10b981; color: white; border: none; padding: 15px 40px; border-radius: 10px; cursor: pointer; font-weight: 900; font-size: 1.1rem; width: 100%; box-shadow: 0 4px 20px rgba(16,185,129,0.4);">
                    <i class="fas fa-microchip"></i> HISOBOTNI TAHLIL QILISH
                </button>
                <p id="promerFileInfo" style="color: #64748b; font-size: 0.85rem; margin-top: 15px;"></p>
            </div>

            <div id="promerUploadProgress" style="display: none;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #94a3b8; font-size: 0.85rem;">AI Tahlil qilinmoqda...</span>
                    <span id="promerProgressText" style="color: #10b981; font-weight: bold;">0%</span>
                </div>
                <div style="background: #0f172a; border-radius: 10px; overflow: hidden; height: 10px;">
                    <div id="promerProgressBar" style="height: 100%; background: linear-gradient(90deg, #10b981, #10b981, #38bdf8); width: 0%; transition: width 0.3s;"></div>
                </div>
            </div>

            <div id="promerUploadResult" style="display: none; margin-top: 20px;"></div>
        </div>
    `;

    document.getElementById('promerPdfFile').addEventListener('change', window.handlePromerFileSelect);
};// ===================== Handle Lenta File Selection =====================
window.handleLentaFileSelect = async function (e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const startKm = parseInt(document.getElementById('lentaStartKm').value) || 4020;
    const infoEl = document.getElementById('lentaFileInfo');
    const progressDiv = document.getElementById('lentaUploadProgress');
    const progressBar = document.getElementById('lentaProgressBar');
    const progressText = document.getElementById('lentaProgressText');
    const resultDiv = document.getElementById('lentaUploadResult');

    const file = files[0];
    const isPdf = file.type === 'application/pdf';

    infoEl.textContent = `${files.length} ta fayl tanlandi: ${file.name}`;
    progressDiv.style.display = 'block';

    if (isPdf) {
        if (!window.pdfjsLib) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            document.head.appendChild(script);
            await new Promise((resolve) => { script.onload = resolve; });
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let saved = 0;
            let firstKm = null;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width; canvas.height = viewport.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
                
                const km = startKm + i - 1;
                if (i === 1) firstKm = km;
                await saveTapeImage(km, canvas.toDataURL('image/jpeg', 0.85));
                saved++;
                progressBar.style.width = Math.round((i / pdf.numPages) * 100) + '%';
                progressText.textContent = Math.round((i / pdf.numPages) * 100) + '%';
            }
            resultDiv.innerHTML = `<i class="fas fa-check"></i> ${saved} ta KM lentasi saqlandi!`;
            resultDiv.style.display = 'block';
            setTimeout(() => {
                window.populateLentaKmSelector('ishlab-chiqarish');
                if (firstKm) window.showTapeForKm(firstKm);
            }, 500);
        } catch (err) {
            resultDiv.innerHTML = `Xato: ${err.message}`;
            resultDiv.style.display = 'block';
        }
    } else {
        // Handle images
        let firstKm = startKm;
        for (let i = 0; i < files.length; i++) {
            const imageData = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(files[i]);
            });
            await saveTapeImage(startKm + i, imageData);
            progressBar.style.width = Math.round(((i + 1) / files.length) * 100) + '%';
        }
        resultDiv.innerHTML = `<i class="fas fa-check"></i> ${files.length} ta rasm saqlandi!`;
        resultDiv.style.display = 'block';
        setTimeout(() => {
            window.populateLentaKmSelector('ishlab-chiqarish');
            if (firstKm) window.showTapeForKm(firstKm);
        }, 500);
    }
};

// ===================== Handle Promer File Selection (AI ONLY) =====================
// ===================== Handle Promer File Selection (AI ONLY) =====================
window.handlePromerFileSelect = async function (e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const infoEl = document.getElementById('promerFileInfo');
    const progressDiv = document.getElementById('promerUploadProgress');
    const progressBar = document.getElementById('promerProgressBar');
    const progressText = document.getElementById('promerProgressText');
    const resultDiv = document.getElementById('promerUploadResult');

    infoEl.textContent = `PDF Tahlil: ${file.name}`;
    progressDiv.style.display = 'block';

    if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    try {
        await clearPromerStore(); // Clear old report visuals
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let totalExtracted = 0;
        let totalSaved = 0;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            
            // 1. Render for Visual
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width; canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
            const imageData = canvas.toDataURL('image/jpeg', 0.85);

            // 2. Extract Text for AI Analysis
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str).join(' ');
            
            // Detect KM for metadata and assignment (but storage is sequential)
            const kmMatch = textItems.match(/(?:Km|Км|КМ|KM)[:\s]*(\d{4})/i);
            const pageKm = kmMatch ? parseInt(kmMatch[1]) : null;

            // 3. Save Visual sequentially
            await savePromerPage(i, imageData);
            totalSaved++;

            const extracted = window.extractDefectsFromText(textItems, pageKm, i);
            if (extracted.length > 0) {
                window.mergeExtractedDefects(extracted);
                totalExtracted += extracted.length;
            }

            const pct = Math.round((i / pdf.numPages) * 100);
            progressBar.style.width = pct + '%';
            progressText.textContent = pct + '%';
        }

        // Save metadata
        localStorage.setItem('last_promer_info', JSON.stringify({ 
            name: file.name, 
            date: new Date().toISOString(), 
            pages: pdf.numPages 
        }));
        
        progressDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="background: rgba(16,185,129,0.1); border: 1px solid #10b981; padding: 15px; border-radius: 12px; text-align: center; color: #10b981;">
                <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <div style="font-size: 1.1rem; font-weight: bold;">Tahlil yakunlandi!</div>
                <div style="font-size: 0.9rem; margin-top: 5px;">Hisobotdan ${totalExtracted} ta nuqson topildi va ${totalSaved} ta varaq saqlandi.</div>
            </div>
        `;
        window.updatePromerMetadataUI();
        setTimeout(() => {
            window.showPromerPage(1); // Auto-show first page
        }, 500);
    } catch (err) {
        progressDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="color: #ef4444;">Xato: ${err.message}</div>`;
    }
};

// ===================== Open/Render Functions =====================
window.openTrackDefectMonitor = async function (bolinmaId) {
    window.currentBolinmaId = bolinmaId;
    let modal = document.getElementById('track-defect-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'track-defect-modal';
        modal.className = 'department-window';
        modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; max-width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; z-index: 10030 !important;';
        document.body.appendChild(modal);
    }

    if (window.SmartUtils) {
        try {
            const apiBolinmaKey = (bolinmaId === 'ishlab-chiqarish' || !bolinmaId || bolinmaId === 'all') ? 'all' : bolinmaId;
            const liveDefects = await window.SmartUtils.fetchAPI(`/defects${apiBolinmaKey === 'all' ? '' : `/${apiBolinmaKey}`}`);
            if (liveDefects && Array.isArray(liveDefects)) {
                window.trackDefectsData = liveDefects.map(d => ({
                    ...d,
                    bolinma: d.bolinma_id,
                    type: d.issue,
                    isRepeated: d.is_repeated === 1
                }));
            }
        } catch(e) {
            console.error("Failed to fetch defects from backend", e);
        }
    }

    modal.innerHTML = window.generateTrackDefectHTML(bolinmaId, false);
    modal.classList.add('active');
    setTimeout(() => {
        window.populateLentaKmSelector(bolinmaId);
        window.updatePromerMetadataUI();
        window.showPromerPage(1);
    }, 300);
};

window.showPromerPage = async function (page) {
    const pageText = document.getElementById('promer-viewer-page-text');
    const display = document.getElementById('promer-image-display');
    const zoomBtn = document.getElementById('promer-zoom-btn');
    if (!pageText || !display) return;

    window.currentPromerPage = parseInt(page);
    pageText.textContent = `Sahifa: ${page}`;
    display.innerHTML = '<div style="color: #38bdf8;"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>';
    if (zoomBtn) zoomBtn.style.display = 'none';

    try {
        const record = await getPromerPage(page);
        if (record) {
            display.innerHTML = `<img src="${record.image}" style="max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 0 20px rgba(0,0,0,0.5); cursor: zoom-in;" onclick="window.openPromerViewerFullScreen()">`;
            if (zoomBtn) zoomBtn.style.display = 'block';
            
            const total = await getPromerPagesCount();
            pageText.textContent = `Varaq ${page} / ${total}`;
        } else {
            display.innerHTML = '<div style="color: #475569;">Ushbu sahifa topilmadi</div>';
        }
    } catch (err) {
        display.innerHTML = `<div style="color: #ef4444;">Xato: ${err.message}</div>`;
    }
};

window.promerNavigate = async function (delta) {
    const current = window.currentPromerPage || 1;
    const total = await getPromerPagesCount();
    let next = current + delta;
    if (next < 1) next = 1;
    if (next > total) next = total;
    window.showPromerPage(next);
};

window.renderInlineTrackDefectMonitor = async function (containerId, bolinmaId) {
    let container = document.getElementById(containerId);
    if (!container) return;

    if (window.SmartUtils) {
        try {
            const apiBolinmaKey = (bolinmaId === 'ishlab-chiqarish' || !bolinmaId || bolinmaId === 'all') ? 'all' : bolinmaId;
            const liveDefects = await window.SmartUtils.fetchAPI(`/defects${apiBolinmaKey === 'all' ? '' : `/${apiBolinmaKey}`}`);
            if (liveDefects && Array.isArray(liveDefects)) {
                window.trackDefectsData = liveDefects.map(d => ({
                    ...d,
                    bolinma: d.bolinma_id,
                    type: d.issue,
                    isRepeated: d.is_repeated === 1
                }));
            }
        } catch(e) {
            console.error("Failed to fetch inline defects from backend", e);
        }
    }

    container.innerHTML = window.generateTrackDefectHTML(bolinmaId, true);
    setTimeout(() => window.populateLentaKmSelector(bolinmaId), 300);
};

// ===================== UI HELPERS =====================
window.updatePromerMetadataUI = function() {
    const info = JSON.parse(localStorage.getItem('last_promer_info'));
    const nameEl = document.getElementById('last-promer-name');
    const dateEl = document.getElementById('last-promer-date');
    if (info && nameEl && dateEl) {
        nameEl.innerText = info.name;
        dateEl.innerText = new Date(info.date).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        // If start/end KM present, show range too
        if (info.kmStart && info.kmEnd) {
            const summary = document.getElementById('promer-summary-text');
            if (summary) summary.title = `Diapazon: km ${info.kmStart} - km ${info.kmEnd}`;
        }
    }
};

// ===================== Update Defect Card UI =====================
// Custom CSS for compact and professional cards
const customTrackStyles = document.createElement('style');
customTrackStyles.textContent = `
    .defect-card-elite {
        background: rgba(30, 41, 59, 0.4) !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
        border-left-width: 5px !important;
        margin-bottom: 8px !important;
        padding: 10px 15px !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
    }
    .defect-card-elite:hover {
        background: rgba(56, 189, 248, 0.05) !important;
        border-color: rgba(56, 189, 248, 0.2) !important;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(customTrackStyles);

window.openFixDefectModal = async function (defectId) {
    let defects = window.trackDefectsData || [];
    let idx = defects.findIndex(d => d.id === defectId || String(d.id) === String(defectId));
    if (idx === -1) return;
    if (confirm("Kamchilik bartaraf etilganini tasdiqlaysizmi?")) {
        if (window.SmartUtils) {
            try {
                await window.SmartUtils.fetchAPI(`/defects/${defectId}/fix`, { method: 'PUT' });
            } catch (e) {
                console.error("Failed to fix defect", e);
            }
        }
        defects[idx].status = 'fixed';
        if (window.SmartUtils) window.SmartUtils.showToast("Kamchilik yopildi!", "success");
        const modal = document.getElementById('track-defect-modal');
        if (modal) modal.classList.remove('active');
        setTimeout(() => window.openTrackDefectMonitor(defects[idx].bolinma), 100);
    }
};

window.generateDalolatnoma = async function (defectId) {
    let defects = window.trackDefectsData || [];
    let defect = defects.find(d => d.id === defectId);
    if (!defect) return;

    window.SmartUtils.showToast("PU-28/PU-29 dalolatnomasi generatsiya qilinmoqda...", "info");
    
    // Simulate generation delay
    setTimeout(() => {
        window.SmartUtils.showToast("Dalolatnoma tayyor! Yuklab olinmoqda...", "success");
        // Here we could window.open('/api/defects/pdf/' + defectId)
        
        // Let's create a fake PDF blob download for demonstration
        const text = `O'ZBEKISTON TEMIR YO'LLARI\nPU-28 / PU-29 DALOLATNOMASI\n\nSana: ${new Date().toLocaleDateString()}\nBo'linma: ${defect.bolinma}\nKM: ${defect.km} | PK: ${defect.pk}\nDaraja: ${defect.degree}\nNuqson: ${defect.type}\nIzoh: ${defect.description}\n\nUshbu nuqson bo'yicha zudlik bilan chora ko'rilishi so'raladi.`;
        const blob = new Blob([text], { type: 'text/plain' }); // plain text fallback for demo
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PU-28_km${defect.km}_pk${defect.pk}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }, 1500);
};

// ===================== Add Defect Modal (3-4 degree only) =====================
window.openAddDefectModal = function () {
    let modal = document.getElementById('add-defect-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'add-defect-modal';
        modal.className = 'active';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10010; display:flex; align-items:center; justify-content:center;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#1e293b; width: 650px; max-height: 90vh; overflow-y: auto; padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); color: white; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            
            <!-- Left: Form -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; grid-column: 1/-1;">
                    <h3 style="margin: 0; color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> 3-4 Daraja Nuqson Kiritish</h3>
                    <button type="button" onclick="document.getElementById('add-defect-modal').remove()" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">KM</label>
                        <input type="number" id="newDefectKm" oninput="previewBolinma(); previewDefectTape();" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;" placeholder="4055">
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">PK</label>
                        <input type="number" id="newDefectPk" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;" placeholder="1-10">
                    </div>
                </div>

                <div style="background: rgba(16,185,129,0.1); border: 1px dashed #10b981; padding: 6px 10px; border-radius: 6px; text-align: center;">
                    <span style="color: #94a3b8; font-size: 0.8rem;">Mas'ul:</span>
                    <strong id="previewBolinmaText" style="color: #10b981; font-size: 0.95rem;"> -</strong>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                    <div>
                        <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">Nuqson Turi</label>
                        <select id="newDefectType" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;">
                            <option>Cho'kish (Pr)</option><option>Siljish (R)</option>
                            <option>Kengayish (Ush)</option><option>Torayish (Suj)</option>
                            <option>Balandlik (V)</option><option>Burchak</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">Daraja</label>
                        <select id="newDefectDegree" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;">
                            <option value="3" selected>3-daraja</option>
                            <option value="4">4-daraja</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">Izoh</label>
                    <textarea id="newDefectDesc" rows="2" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;" placeholder="Tezlikni 40km/s ga cheklash..."></textarea>
                </div>
                <button type="button" onclick="saveNewDefect()" style="padding:10px; background:linear-gradient(135deg, #ef4444, #dc2626); border:none; color:white; border-radius:8px; font-weight:bold; cursor:pointer;">
                    <i class="fas fa-save"></i> Kiritish va Lentaga Biriktirish
                </button>
            </div>
            
            <!-- Right: Auto Tape Preview -->
            <div style="display: flex; flex-direction: column;">
                <div style="color: #38bdf8; font-weight: bold; font-size: 0.85rem; margin-bottom: 8px;"><i class="fas fa-scroll"></i> KM Lentasi (Avtomatik)</div>
                <div id="defect-tape-preview" style="flex: 1; background: #000; border: 1px solid #334155; border-radius: 8px; overflow-y: auto; display: flex; align-items: center; justify-content: center; min-height: 250px;">
                    <div style="text-align: center; color: #475569; padding: 20px;">
                        <i class="fas fa-scroll" style="font-size: 2rem; opacity: 0.3;"></i>
                        <p style="font-size: 0.8rem; margin-top: 8px;">KM kiriting — lenta avtomatik ko'rinadi</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    window.previewBolinma = function () {
        let km = parseInt(document.getElementById('newDefectKm').value);
        const el = document.getElementById('previewBolinmaText');
        if (!km) { el.innerText = '-'; el.style.color = '#10b981'; return; }
        let b = findBolinmaByKm(km);
        el.innerText = b;
        el.style.color = b.includes("Noma'lum") ? '#ef4444' : '#10b981';
    };

    window.previewDefectTape = async function () {
        let km = parseInt(document.getElementById('newDefectKm').value);
        const preview = document.getElementById('defect-tape-preview');
        if (!km || !preview) return;
        try {
            const tape = await getTapeImage(km);
            if (tape && tape.image) {
                preview.innerHTML = `<img src="${tape.image}" style="width: 100%; height: auto;" alt="km ${km}"/>`;
            } else {
                preview.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;"><i class="fas fa-image" style="font-size: 2rem; opacity: 0.3;"></i><p style="font-size: 0.8rem; margin-top: 8px;">km ${km} uchun lenta topilmadi</p></div>`;
            }
        } catch (e) { /* ignore */ }
    };

    window.saveNewDefect = async function () {
        let km = parseInt(document.getElementById('newDefectKm').value);
        let pk = parseInt(document.getElementById('newDefectPk').value);
        let type = document.getElementById('newDefectType').value;
        let degree = parseInt(document.getElementById('newDefectDegree').value);
        let desc = document.getElementById('newDefectDesc').value;

        if (!km || !pk) { alert("KM va PK ni kiriting!"); return; }
        let bolinmaName = findBolinmaByKm(km);

        let defects = window.trackDefectsData || [];
        let isRepeated = defects.some(old => 
            old.km === km && old.pk === pk && old.type === type && 
            old.status !== 'fixed'
        );

        if (window.SmartUtils) {
            try {
                await window.SmartUtils.fetchAPI('/defects', {
                    method: 'POST',
                    body: JSON.stringify({
                        bolinma_id: bolinmaName,
                        km, pk, degree,
                        issue: type,
                        description: desc,
                        is_repeated: isRepeated ? 1 : 0
                    })
                });
            } catch (e) {
                console.error("Failed to add new defect", e);
            }
        }

        window.SmartUtils.showToast(`${degree}-daraja nuqson km ${km} ga kiritildi → ${bolinmaName}`, "success");
        document.getElementById('add-defect-modal').remove();

        // Refresh view and auto-show the tape
        let modal = document.getElementById('track-defect-modal');
        if (modal) modal.classList.remove('active');
        window.openTrackDefectMonitor('ishlab-chiqarish');
        setTimeout(() => window.showTapeForKm(km), 600);
    };
};

// ===================== AI Extraction Logic =====================
window.extractDefectsFromText = function(text, currentKm, pageNumber) {
    const defects = [];
    // Regex patterns for different defect types and degrees
    // Case 1: "3-daraja", "4-daraja", "III-степень", "IV-степень"
    // Case 2: PK identification "pk 4", "пк 4", "4 пк"
    // Case 3: Type identification: "Ush" (Уширение), "Pr" (Просадка), "R" (Рихтовка), "V" (Вертикаль), "Tor" (Сужение)
    
    const lines = text.split(/[.!?\n\r]/);
    
    for (let line of lines) {
        // Look for degree first (3 or 4)
        const degreeMatch = line.match(/(?:3|4|III|IV)[-\s]*(?:daraja|степень|ctepenh)/i);
        if (!degreeMatch) continue;
        
        let degree = 3;
        if (line.includes('4') || line.toUpperCase().includes('IV')) degree = 4;
        
        // Find PK
        const pkMatch = line.match(/(?:pk|пк|пикет)[:\s]*(\d+)/i) || line.match(/(\d+)[:\s]*(?:pk|пк)/i);
        let pk = pkMatch ? parseInt(pkMatch[1]) : 1;
        if (pk > 10) pk = 10;
        
        // Find KM (if mentioned in line, else use currentKm)
        const kmMatch = line.match(/(?:km|км)[:\s]*(\d{4})/i);
        let km = kmMatch ? parseInt(kmMatch[1]) : currentKm;

        // Find Type
        let type = "Boshqa";
        let desc = line.trim().substring(0, 50) + "...";
        
        if (line.match(/ush|ушир|кeng/i)) { type = "Kengayish (Ush)"; desc = "Kengayish aniqlandi"; }
        else if (line.match(/pr|прос|чо|cho/i)) { type = "Cho'kish (Pr)"; desc = "Rels cho'kishi"; }
        else if (line.match(/r|рих|сил|sil/i)) { type = "Siljish (R)"; desc = "Yo'l siljishi (R)"; }
        else if (line.match(/v|верт|бал|bal/i)) { type = "Balandlik (V)"; desc = "Balandlik o'zgarishi"; }
        else if (line.match(/suj|тор|tor/i)) { type = "Torayish (Suj)"; desc = "Yo'l torayishi"; }
        
        defects.push({
            km, pk, degree, type,
            pageNumber: parseInt(pageNumber),
            bolinma: findBolinmaByKm(km),
            status: "open",
            date: new Date().toISOString().split('T')[0],
            description: desc,
            isAutoExtracted: true
        });
    }
    return defects;
};

window.mergeExtractedDefects = async function(newDefects) {
    let current = window.trackDefectsData || [];
    let addedCount = 0;
    
    for (let d of newDefects) {
        const exists = current.some(old => old.km === d.km && old.pk === d.pk && old.type === d.type && old.degree === d.degree && old.status === 'open');
        if (!exists) {
            const isRepeated = current.some(old => old.km === d.km && old.pk === d.pk && old.type === d.type);
            // Save to server
            if (window.SmartUtils) {
                try {
                    await window.SmartUtils.fetchAPI('/defects', {
                        method: 'POST',
                        body: JSON.stringify({
                            bolinma_id: d.bolinma,
                            km: d.km, pk: d.pk, degree: d.degree,
                            issue: d.type,
                            description: d.description,
                            is_repeated: isRepeated ? 1 : 0
                        })
                    });
                } catch (e) {
                    console.error('Failed to save extracted defect', e);
                }
            }
            addedCount++;
        }
    }
    
    if (addedCount > 0) {
        // Refresh from server
        try {
            const freshData = await window.SmartUtils.fetchAPI('/defects');
            if (freshData) window.trackDefectsData = freshData;
        } catch(e) { /* use existing */ }
    }
    return addedCount;
};

console.log('✅ Track Defect Monitor v2.1 Loaded (AI Auto-Extraction)');

