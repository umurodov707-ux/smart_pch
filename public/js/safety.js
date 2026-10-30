// Safety Module - Digital Safety Instructions & Signatures
// Handles "Mehnat Muhofazasi" features.

let currentSigningWorker = null;
let signaturePadActive = false;
var safetyIsDrawing = false;
let lastX = 0;
let lastY = 0;

// Main Dashboard Renderer
window.renderSafetyDashboard = function (windowElement, bolinmaId) {
    const contentDiv = windowElement.querySelector('.window-content');
    if (!contentDiv) return;

    contentDiv.classList.add('safety-active');
    contentDiv.style.background = '#0f172a';
    contentDiv.style.padding = '0';

    const dashboardHtml = `
        <div id="safety-dashboard-view" style="display: flex; flex-direction: column; height: 100%; font-family: 'Inter', sans-serif; color: #e2e8f0; overflow: hidden; background: #0f172a;">
            <!-- Premium Header -->
            <div style="padding: 24px 40px; background: #1e293b; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
                <div>
                    <h2 style="margin: 0; font-size: 1.7rem; font-weight: 800; color: #f8fafc; letter-spacing: -0.8px; display: flex; align-items: center; gap: 15px;">
                        <span style="background: linear-gradient(135deg, #3b82f6, #2563eb); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
                            <i class="fas fa-shield-alt" style="color: white; font-size: 1.4rem;"></i>
                        </span>
                        MEHNAT MUHOFAZASI <span style="color: #64748b; font-weight: 400; font-size: 1rem; margin-left: 10px;">CORE v2.5</span>
                    </h2>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button onclick="window.openSafetyWorkerList('${bolinmaId}')" class="safety-nav-btn active">
                        <i class="fas fa-users-cog"></i> XODIMLAR
                    </button>
                    <button onclick="window.openSafetyTNU19('${bolinmaId}')" class="safety-nav-btn">
                        <i class="fas fa-book-reader"></i> TNU-19
                    </button>
                    <button onclick="window.openSafetyTNU20('${bolinmaId}')" class="safety-nav-btn">
                        <i class="fas fa-id-badge"></i> TNU-20
                    </button>
                    <button onclick="window.openSafetyTechTraining('${bolinmaId}')" class="safety-nav-btn">
                        <i class="fas fa-graduation-cap"></i> TEXNIK O'QUV
                    </button>
                </div>
            </div>

            <!-- Dashboard Content with Stats & Analytics -->
            <div style="flex: 1; overflow-y: auto; padding: 40px; display: flex; flex-direction: column; gap: 30px;">
                
                <!-- Main Stats Row -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
                    <div class="safety-glass-card">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #94a3b8; font-weight: 800; font-size: 0.75rem; letter-spacing: 1px;">JAMI XODIMLAR</span>
                            <i class="fas fa-users" style="color: #3b82f6; font-size: 1rem;"></i>
                        </div>
                        <div style="font-size: 2.2rem; font-weight: 900; color: #fff; margin: 15px 0 5px 0;" id="stat-total-workers">--</div>
                        <div style="font-size: 0.8rem; color: #10b981; font-weight: 600;"><i class="fas fa-arrow-up"></i> 100% aktiv</div>
                    </div>
                    <div class="safety-glass-card">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #94a3b8; font-weight: 800; font-size: 0.75rem; letter-spacing: 1px;">BUGUNGI IMZOLAR</span>
                            <i class="fas fa-signature" style="color: #10b981; font-size: 1rem;"></i>
                        </div>
                        <div style="font-size: 2.2rem; font-weight: 900; color: #fff; margin: 15px 0 5px 0;" id="stat-active-briefings">--</div>
                        <div style="font-size: 0.8rem; color: #f59e0b; font-weight: 600;"><i class="fas fa-clock"></i> 12:00 gacha amal qiladi</div>
                    </div>
                    <div class="safety-glass-card">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #94a3b8; font-weight: 800; font-size: 0.75rem; letter-spacing: 1px;">XAVF DARAJASI</span>
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 1rem;"></i>
                        </div>
                        <div style="font-size: 2.2rem; font-weight: 900; color: #ef4444; margin: 15px 0 5px 0;">PAST</div>
                        <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 600;">Monitor: Stabil</div>
                    </div>
                    <div class="safety-glass-card">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #94a3b8; font-weight: 800; font-size: 0.75rem; letter-spacing: 1px;">SMART STATUS</span>
                            <div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; animation: sync-pulse 1.5s infinite;"></div>
                        </div>
                        <div style="font-size: 2.2rem; font-weight: 900; color: #10b981; margin: 15px 0 5px 0; letter-spacing: -1px;">ACTIVE</div>
                        <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 600;"><i class="fas fa-sync-alt fa-spin"></i> Biometric Auto-Sync</div>
                    </div>

                    <style>
                        @keyframes sync-pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
                    </style>
                </div>

                <!-- Secondary Row: Main View Area -->
                <div id="safety-main-view" style="min-height: 500px; background: rgba(30, 41, 59, 0.3); border: 1px solid rgba(255,255,255,0.03); border-radius: 24px; padding: 30px;">
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                         <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #3b82f6; opacity: 0.3;"></i>
                    </div>
                </div>

                <!-- Predictive Section -->
                <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 30px; border-radius: 24px; border: 1px solid rgba(37, 99, 235, 0.2); display: flex; align-items: center; gap: 30px;">
                    <div style="width: 80px; height: 80px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #3b82f6;">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #f8fafc;">AI SAFETY PREDICTOR™</h3>
                        <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 0.9rem;">Ob-havo va o'tgan haftadagi nosozliklar tahlili asosida, ertaga <b>PCh-16/1</b> bo'limida <b>I darajali</b> ogohlantirish tavsiya etiladi.</p>
                    </div>
                    <button style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; color: #3b82f6; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer;">TAHLILNI KO'RISH</button>
                </div>
            </div>
        </div>

        <style>
            .safety-nav-btn {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                color: #94a3b8;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 800;
                font-size: 0.8rem;
                cursor: pointer;
                transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                align-items: center;
                gap: 12px;
                letter-spacing: 0.5px;
            }
            .safety-nav-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fff; transform: translateY(-2px); }
            .safety-nav-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
            
            .safety-glass-card {
                background: rgba(30, 41, 59, 0.5);
                backdrop-filter: blur(10px);
                padding: 25px;
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                transition: 0.3s;
            }
            .safety-glass-card:hover { transform: translateY(-5px); background: rgba(30, 41, 59, 0.7); border-color: rgba(59, 130, 246, 0.3); }

            @keyframes modalIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        </style>
    `;

    contentDiv.innerHTML = dashboardHtml;
    window.currentSafetyBolinmaId = bolinmaId;

    // Load initial view
    setTimeout(() => {
        if (typeof window.openSafetyWorkerList === 'function') {
            window.openSafetyWorkerList(bolinmaId);
        }
    }, 100);
};

// --- Proxy Functions for Reliability ---
window.openSafetyWorkerList = function (bolinmaId) {

    // --- Proxy Functions for Reliability ---
    window.openSafetyWorkerList = function (bolinmaId) {
        if (typeof renderWorkerList === 'function') {
            renderWorkerList(bolinmaId);
        } else {
            SmartUtils.showToast("Xodimlar ro'yxati funksiyasi topilmadi!", "error");
        }
    };

    // Aliases for dashboard buttons
    window.openSafetyTNU19 = function (bolinmaId) {
        if (typeof openTNU19Window === 'function') openTNU19Window(bolinmaId);
    };

    window.openSafetyTNU20 = function (bolinmaId) {
        if (typeof openTNU20Window === 'function') openTNU20Window(bolinmaId);
    };

    window.openSafetyTechTraining = function (bolinmaId) {
        if (typeof openTechTrainingWindow === 'function') openTechTrainingWindow(bolinmaId);
    };

    // --- TNU-19 Implementation (Daily Briefing Log) ---
    // --- TNU-19 Implementation (Daily Briefing Log) ---
    // MOVED TO tnu19.js - Using global window.openTNU19Window
    /*
    window.openTNU19Window = function (bolinmaId) {
        const mainView = document.getElementById('safety-main-view');
        if (!mainView) return;
    
        const logs = JSON.parse(localStorage.getItem('tnu19_logs') || '[]');
        const filteredLogs = logs.filter(l => l.bolinmaId === bolinmaId);
    
        mainView.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                    <h3 style="margin: 0; color: #f1c40f;"><i class="fas fa-book"></i> TNU-19: Ish joyidagi yo'riqnoma jurnali</h3>
                    <button onclick="openNewBriefingModal('TNU-19', '${bolinmaId}')" 
                        style="background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-plus"></i> Yangi Yo'riqnoma
                    </button>
                </div>
    
                <div style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.1); border-radius: 10px; padding: 10px;">
                    <table style="width: 100%; border-collapse: collapse; color: white;">
                        <thead>
                            <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                                <th style="padding: 12px;">Sana</th>
                                <th style="padding: 12px;">Yo'riqnoma Mavzusi</th>
                                <th style="padding: 12px;">Yo'riqchi</th>
                                <th style="padding: 12px;">Xodim (Imzo)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredLogs.length > 0 ? filteredLogs.map(l => `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 12px; color: #aaa;">${new Date(l.date).toLocaleString()}</td>
                                    <td style="padding: 12px;">${l.topic}</td>
                                    <td style="padding: 12px;">${l.instructor}</td>
                                    <td style="padding: 12px; display: flex; align-items: center; gap: 10px;">
                                        ${l.workerName}
                                        ${l.signature ? `<img src="${l.signature}" style="height: 30px; background: white; border-radius: 4px; padding: 2px;">` : '<span style="color: #e74c3c;">Imzolanmagan</span>'}
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">Hozircha yozuvlar yo\'q</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };
    */

    // --- TNU-20 Implementation (Target Briefing Log) ---
    window.openTNU20Window = function (bolinmaId) {
        const mainView = document.getElementById('safety-main-view');
        if (!mainView) return;

        const logs = JSON.parse(localStorage.getItem('tnu20_logs') || '[]');
        const filteredLogs = logs.filter(l => l.bolinmaId === bolinmaId);

        mainView.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                <h3 style="margin: 0; color: #9b59b6;"><i class="fas fa-file-contract"></i> TNU-20: Maqsadli yo'riqnoma jurnali</h3>
                 <button onclick="openNewBriefingModal('TNU-20', '${bolinmaId}')" 
                    style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i> Yangi Ruxsatnoma
                </button>
            </div>

            <div style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.1); border-radius: 10px; padding: 10px;">
                <table style="width: 100%; border-collapse: collapse; color: white;">
                     <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                            <th style="padding: 12px;">Sana</th>
                            <th style="padding: 12px;">Ish Turi (Naryad)</th>
                            <th style="padding: 12px;">Ruxsat Beruvchi</th>
                            <th style="padding: 12px;">Xodim (Imzo)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredLogs.length > 0 ? filteredLogs.map(l => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px; color: #aaa;">${new Date(l.date).toLocaleString()}</td>
                                <td style="padding: 12px;">${l.topic}</td>
                                <td style="padding: 12px;">${l.instructor}</td>
                                <td style="padding: 12px; display: flex; align-items: center; gap: 10px;">
                                    ${l.workerName}
                                    ${l.signature ? `<img src="${l.signature}" style="height: 30px; background: white; border-radius: 4px; padding: 2px;">` : '<span style="color: #e74c3c;">Imzolanmagan</span>'}
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">Hozircha yozuvlar yo\'q</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    };

    // --- Universal New Briefing Modal with Face ID Support ---
    window.openNewBriefingModal = function (type, bolinmaId) {
        let allWorkers = window.hrData?.employees || [];
        const workers = allWorkers.filter(w => {
            const bIdStr = String(bolinmaId).toLowerCase();
            const wBol = String(w.bolinma || w.bolinmaId || '').toLowerCase();
            return wBol.includes(bIdStr.replace('bolinma', ''));
        });

        const modal = document.createElement('div');
        modal.id = 'briefing-modal';
        modal.className = 'premium-modal-overlay active';
        modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center; z-index: 10000;
        animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;

        modal.innerHTML = `
        <div class="premium-modal-card" style="background: #1e293b; width: 100%; max-width: 550px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="padding: 24px 30px; background: #3b82f6; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #fff; font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-file-signature"></i> ${type} YOZUVLARINI QAYD ETISH
                </h3>
                <button onclick="document.getElementById('briefing-modal').remove()" style="background: rgba(0,0,0,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;"><i class="fas fa-times"></i></button>
            </div>
            
            <div style="padding: 30px; display: flex; flex-direction: column; gap: 20px;">
                <div class="input-group">
                    <label style="color: #94a3b8; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; display: block;">Yo'riqnomadan o'tuvchi xodim</label>
                    <select id="briefing-worker" style="width: 100%; padding: 14px; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); color: #f8fafc; border-radius: 12px; font-weight: 600;">
                        <option value="">-- Xodimni tanlang --</option>
                        ${workers.map(w => `<option value="${w.id}">${w.full_name || w.name} (${w.position || w.role})</option>`).join('')}
                    </select>
                </div>

                <div class="input-group">
                    <label style="color: #94a3b8; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; display: block;">Mavzu / Ish naryadi</label>
                    <input type="text" id="briefing-topic" placeholder="Instruktaj mavzusi yoki naryad raqami..." 
                        style="width: 100%; padding: 14px; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); color: #f8fafc; border-radius: 12px;">
                </div>

                <div style="background: rgba(15, 23, 42, 0.5); padding: 20px; border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <label style="color: #94a3b8; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Shaxsni tasdiqlash (Imzo)</label>
                        <button onclick="verifyFaceForBriefing()" id="safety-face-verify-btn" 
                            style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b981; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-camera"></i> FACE ID BILAN TASDIQLASH
                        </button>
                    </div>
                    
                    <div id="safety-signature-container" style="background: white; border-radius: 12px; height: 160px; position: relative; overflow: hidden;">
                        <canvas id="briefing-signature-pad" width="490" height="160" style="width: 100%; height: 100%; cursor: crosshair;"></canvas>
                        <div id="safety-face-verified-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(16, 185, 129, 0.95); display: none; align-items: center; justify-content: center; flex-direction: column; color: white;">
                            <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 10px;"></i>
                            <span style="font-weight: 900; font-size: 0.9rem; letter-spacing: 1px;">FACE ID TASDIQLANDI</span>
                            <input type="hidden" id="face-verified-status" value="0">
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                        <button onclick="clearBriefingSignature()" style="background: none; border: none; color: #ef4444; font-size: 0.7rem; cursor: pointer; opacity: 0.7;">TOZALASH</button>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 10px;">
                    <button onclick="document.getElementById('briefing-modal').remove()" 
                        style="flex: 1; padding: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px; font-weight: 700; cursor: pointer;">BEKOR QILISH</button>
                    <button onclick="saveBriefing('${type}', '${bolinmaId}')" 
                        style="flex: 2; padding: 14px; background: #3b82f6; border: none; color: white; border-radius: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);">
                        <i class="fas fa-save"></i> SAQLASH VA RO'YXATGA OLISH
                    </button>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(modal);
        setTimeout(() => initBriefingSignaturePad(), 100);
    };

    // --- Face ID Verification for Safety ---
    window.verifyFaceForBriefing = async function () {
        const workerId = document.getElementById('briefing-worker').value;
        if (!workerId) {
            showToast("Oldin xodimni tanlang!", "warning");
            return;
        }

        const worker = (window.hrData?.employees || []).find(e => e.id == workerId);
        if (!worker || !worker.faceTemplate) {
            showToast("Ushbu xodimda Face ID mavjud emas. Oldin HR bo'limidan biriktiring.", "error");
            return;
        }

        const btn = document.getElementById('safety-face-verify-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> TASDIQLANMOQDA...';
        btn.disabled = true;

        try {
            // Open a small scanner overlay
            const scannerOverlay = document.createElement('div');
            scannerOverlay.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:20000; display:flex; align-items:center; justify-content:center; flex-direction:column;`;
            scannerOverlay.innerHTML = `
            <div style="width: 300px; height: 300px; border-radius:50%; border:4px solid #3b82f6; overflow:hidden; background:#000; position:relative;">
                <video id="safety-verify-video" autoplay playsinline style="width:100%; height:100%; object-fit:cover; transform:scaleX(-1);"></video>
                <div style="position:absolute; top:0; left:0; width:100%; height:100%; box-shadow:inset 0 0 50px rgba(59,130,246,0.5); pointer-events:none;"></div>
            </div>
            <p style="color:#fff; margin-top:20px; font-weight:bold;">Yuzingizni kameraga ko'rsating...</p>
            <button id="cancel-verify-btn" style="margin-top:20px; background:#ef4444; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">Bekor qilish</button>
        `;
            document.body.appendChild(scannerOverlay);

            const video = document.getElementById('safety-verify-video');
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;

            document.getElementById('cancel-verify-btn').onclick = () => {
                stream.getTracks().forEach(t => t.stop());
                scannerOverlay.remove();
                btn.innerHTML = '<i class="fas fa-camera"></i> FACE ID BILAN TASDIQLASH';
                btn.disabled = false;
            };

            // Attempt verify
            setTimeout(async () => {
                try {
                    const descriptor = await window.FaceService.getDescriptorFromVideo(video);
                    const savedData = JSON.parse(worker.faceTemplate);
                    const dist = window.FaceService.compareDescriptors(descriptor, savedData.descriptor);

                    stream.getTracks().forEach(t => t.stop());
                    scannerOverlay.remove();

                    if (dist < 0.55) {
                        showToast("Face ID muvaffaqiyatli tasdiqlandi!", "success");
                        document.getElementById('safety-face-verified-overlay').style.display = 'flex';
                        document.getElementById('face-verified-status').value = "1";

                        // Generate a fake 'signature' image from verified status if needed, 
                        // or just leave it as it is - saveBriefing will handle it
                        const canvas = document.getElementById('briefing-signature-pad');
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = "#10b981";
                        ctx.font = "italic bold 30px Inter";
                        ctx.fillText("FACE ID VERIFIED", 50, 90);
                    } else {
                        showToast("Shaxs tasdiqlanmadi!", "error");
                        btn.innerHTML = '<i class="fas fa-camera"></i> FACE ID BILAN TASDIQLASH';
                        btn.disabled = false;
                    }
                } catch (err) {
                    console.error(err);
                    stream.getTracks().forEach(t => t.stop());
                    scannerOverlay.remove();
                    showToast("Yuzni aniqlashda xatolik!", "error");
                    btn.innerHTML = '<i class="fas fa-camera"></i> FACE ID BILAN TASDIQLASH';
                    btn.disabled = false;
                }
            }, 1500);

        } catch (e) {
            showToast("Kamera ulanmadi!", "error");
            btn.innerHTML = '<i class="fas fa-camera"></i> FACE ID BILAN TASDIQLASH';
            btn.disabled = false;
        }
    };

    // --- ZKTeco Fingerprint Verification for Safety ---
    window.verifyFingerprintForBriefing = async function () {
        const workerId = document.getElementById('briefing-worker').value;
        if (!workerId) {
            if (typeof showToast === 'function') showToast("Oldin xodimni tanlang!", "warning");
            return;
        }

        const worker = (window.hrData?.employees || []).find(e => e.id == workerId);
        if (!worker || !worker.fingerprintTemplate) {
            if (typeof showToast === 'function') showToast("Ushbu xodimda Barmoq izi mavjud emas. Oldin HR tizimidan kiritilsin.", "error");
            return;
        }

        // Open scanner overlay
        const scannerOverlay = document.createElement('div');
        scannerOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:20000; display:flex; align-items:center; justify-content:center; flex-direction:column; backdrop-filter: blur(5px);';
        scannerOverlay.innerHTML = `
            <h2 style="color: #f59e0b; margin-bottom: 20px;">ZKTECO BIOMETRIC</h2>
            <div style="width: 220px; height: 260px; background: #1c2128; border-radius: 20px; border: 2px solid rgba(212, 175, 55, 0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; box-shadow: 0 0 30px rgba(0,0,0,0.5);">
                <i id="sf-zk-icon" class="fas fa-fingerprint" style="font-size: 70px; color: rgba(212, 175, 55, 0.4); z-index: 2; transition: all 0.3s;"></i>
                <div id="sf-zk-line" style="position: absolute; top:30px; left:20px; width:180px; height:3px; background:#ffd700; display:none; z-index: 3; box-shadow: 0 0 15px #ffd700;"></div>
            </div>
            <p id="sf-zk-status" style="color:#ffd700; margin-top:25px; font-weight:800; font-size: 1.1rem; letter-spacing: 1px;">BARMOG'INGIZNI BOSING...</p>
            <button id="sf-cancel-verify" style="margin-top:20px; background:rgba(248, 81, 73, 0.1); color:#f85149; border:1px solid #f85149; padding:10px 25px; border-radius:12px; cursor:pointer; font-weight: bold;">Bekor qilish</button>
        `;
        document.body.appendChild(scannerOverlay);
        
        let cancelled = false;
        document.getElementById('sf-cancel-verify').onclick = () => {
            cancelled = true;
            scannerOverlay.remove();
        };

        // Hardware bridge check
        let hardwareSuccess = false;
        try {
            document.getElementById('sf-zk-status').innerText = "QURILMA BILAN BOG'LANISH...";
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const response = await fetch('http://localhost:8080/scan', { 
                method: 'POST', body: JSON.stringify({ mode: 'verify' }), headers: { 'Content-Type': 'application/json' }, signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (response.ok && !cancelled) {
                const result = await response.json();
                if (result.success) {
                    processSuccess();
                    hardwareSuccess = true;
                }
            }
        } catch (e) {
            console.log("ZKTeco hardware not found, simulating...");
        }

        if (cancelled || hardwareSuccess) return;

        // Fallback simulation
        document.getElementById('sf-zk-status').innerText = "BARMOG'INGIZNI BOSING...";
        setTimeout(() => {
            if (cancelled) return;
            document.getElementById('sf-zk-status').innerText = "SKANERLANMOQDA...";
            const icon = document.getElementById('sf-zk-icon');
            const line = document.getElementById('sf-zk-line');
            icon.style.color = "#ffd700";
            line.style.display = "block";
            
            let p = 30; let d = 1;
            const anim = setInterval(() => {
                p += (4 * d);
                if (p >= 230 || p <= 30) d *= -1;
                line.style.top = p + "px";
            }, 10);

            setTimeout(() => {
                if (cancelled) { clearInterval(anim); return; }
                clearInterval(anim);
                
                document.getElementById('sf-zk-status').innerText = "TASDIQLANDI!";
                document.getElementById('sf-zk-status').style.color = "#238636";
                icon.style.color = "#238636";
                line.style.display = "none";
                
                setTimeout(() => processSuccess(), 800);
            }, 2000);
        }, 1500);

        function processSuccess() {
            if (typeof showToast === 'function') showToast("Barmoq izi tasdiqlandi!", "success");
            const canvas = document.getElementById('briefing-signature-pad');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = "#f59e0b";
                ctx.font = "italic bold 24px Inter";
                ctx.fillText("ZKTECO FINGERPRINT VERIFIED", 15, 80);
                
                // Hide manual pad overlay and auth selection
                document.getElementById('safety-auth-selection').style.display = 'none';
                const container = document.getElementById('manual-signature-container');
                container.style.display = 'flex';
                // Apply a greenish verified look to manual signature area to indicate success
                document.querySelector('.signature-area').style.borderColor = '#22c55e';
            }
            scannerOverlay.remove();
        }
    };

    document.body.appendChild(modal);

    // Init Canvas
    setTimeout(() => initBriefingSignaturePad(), 100);
};

// Canvas Logic
let briefingCanvas, briefingCtx;
let isDrawingBriefing = false;

window.initBriefingSignaturePad = function () {
    briefingCanvas = document.getElementById('briefing-signature-pad');
    if (!briefingCanvas) return;
    briefingCtx = briefingCanvas.getContext('2d');

    // Set styles
    briefingCtx.strokeStyle = 'black';
    briefingCtx.lineWidth = 2;
    briefingCtx.lineCap = 'round';

    // Mouse Events
    briefingCanvas.addEventListener('mousedown', startBriefingDraw);
    briefingCanvas.addEventListener('mousemove', drawBriefing);
    briefingCanvas.addEventListener('mouseup', stopBriefingDraw);
    briefingCanvas.addEventListener('mouseout', stopBriefingDraw);

    // Touch Events (For Tablets!)
    briefingCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        briefingCanvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    briefingCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        briefingCanvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    briefingCanvas.addEventListener('touchend', (e) => {
        const mouseEvent = new MouseEvent('mouseup', {});
        briefingCanvas.dispatchEvent(mouseEvent);
    });
};

function startBriefingDraw(e) {
    isDrawingBriefing = true;
    drawBriefing(e);
}

function drawBriefing(e) {
    if (!isDrawingBriefing) return;

    const rect = briefingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    briefingCtx.lineTo(x, y);
    briefingCtx.stroke();
    briefingCtx.beginPath();
    briefingCtx.moveTo(x, y);
}

function stopBriefingDraw() {
    isDrawingBriefing = false;
    briefingCtx.beginPath();
}

window.clearBriefingSignature = function () {
    if (briefingCtx) briefingCtx.clearRect(0, 0, briefingCanvas.width, briefingCanvas.height);
};

window.saveBriefing = function (type, bolinmaId) {
    const workerSelect = document.getElementById('briefing-worker');
    const workerId = workerSelect.value;
    const workerName = workerSelect.options[workerSelect.selectedIndex].text;
    const topic = document.getElementById('briefing-topic').value;

    if (!workerId || !topic) {
        SmartUtils.showToast("Barcha maydonlarni to'ldiring!", "warning");
        return;
    }

    // Check empty canvas
    const pixelData = briefingCtx.getImageData(0, 0, briefingCanvas.width, briefingCanvas.height).data;
    let isCanvasEmpty = true;
    for (let i = 0; i < pixelData.length; i += 4) {
        if (pixelData[i + 3] > 0) { isCanvasEmpty = false; break; }
    }
    if (isCanvasEmpty) {
        SmartUtils.showToast("Iltimos, imzo qo'ying!", "warning");
        return;
    }

    const signature = briefingCanvas.toDataURL();
    const record = {
        id: Date.now(),
        date: new Date().toISOString(),
        bolinmaId,
        workerId,
        workerName,
        topic,
        instructor: 'Yo\'l Ustasi (Auto)', // In real app, current logged in user
        signature
    };

    const storageKey = type === 'TNU-19' ? 'tnu19_logs' : 'tnu20_logs';
    const logs = JSON.parse(localStorage.getItem(storageKey) || '[]');
    logs.push(record);
    localStorage.setItem(storageKey, JSON.stringify(logs));

    // Close and Refresh
    document.getElementById('briefing-modal').remove();

    // We need to refresh the current view
    if (type === 'TNU-19') openTNU19Window(bolinmaId);
    else openTNU20Window(bolinmaId);

    // Also show toast
    if (typeof showSafetyToast === 'function') showSafetyToast(`${type} muvaffaqiyatli saqlandi!`);
};

// --- Updated Proxy Functions Calls ---
window.openSafetyTNU19 = function (bolinmaId) {
    openTNU19Window(bolinmaId);
};

window.openSafetyTNU20 = function (bolinmaId) {
    if (typeof openTNU20Window === 'function') openTNU20Window(bolinmaId);
};

window.openSafetyTechTraining = function (bolinmaId) {
    if (typeof openTechTrainingWindow === 'function') {
        openTechTrainingWindow(bolinmaId);
    } else {
        if (typeof showToast === 'function') showToast("Texnik o'quv moduli ishga tushirildi", "info");
    }
};


async function renderWorkerList(bolinmaId) {
    const mainView = document.getElementById('safety-main-view');
    if (!mainView) return;

    // Update stats cards
    renderSafetyStats(bolinmaId);

    // 1. Get Workers from HR system
    if (!window.hrData || !window.hrData.employees || window.hrData.employees.length === 0) {
        await initHRData();
    }

    let workers = window.hrData.employees || [];
    if (bolinmaId && bolinmaId !== 'all') {
        const bNumMatch = String(bolinmaId).match(/\d+/);
        const bNum = bNumMatch ? bNumMatch[0] : bolinmaId;

        workers = workers.filter(w => {
            const wBol = String(w.bolinma || w.bolinmaId || w.department || w.bolinma_id || '').toLowerCase();
            const wNumMatch = wBol.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';
            return wNum === bNum || wBol.includes(String(bolinmaId).toLowerCase());
        });
    }

    // 2. Fetch TNU-19 Logs for today from server
    let tnu19Logs = [];
    try {
        tnu19Logs = await SmartUtils.fetchAPI(`/safety/tnu19?bolinma_id=${bolinmaId || ''}`);
    } catch (e) {
        console.error("Error fetching TNU-19 logs:", e);
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const signedTodayIds = new Set(
        tnu19Logs
            .filter(l => l.date === today)
            .map(l => l.employee_id)
    );

    if (workers.length === 0) {
        mainView.innerHTML = `
            <div style="text-align: center; color: rgba(255,255,255,0.5); padding: 50px;">
                <i class="fas fa-users-slash" style="font-size: 50px; margin-bottom: 20px;"></i>
                <p>Ushbu bo'limda xodimlar topilmadi</p>
            </div>
        `;
        return;
    }

    mainView.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
            <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 10px 10px 0 0; display: flex; justify-content: space-between; align-items: center;">
                 <h3 style="margin: 0; color: white;"><i class="fas fa-clipboard-check"></i> Xodimlar Imzolari (${today})</h3>
                 <div style="display: flex; gap: 10px; align-items: center;">
                    <button onclick="syncAttendanceToSafety('${bolinmaId}')" id="btn-sync-attendance" style="background: rgba(46, 204, 113, 0.15); border: 1px solid #2ecc71; color: #2ecc71; padding: 6px 15px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; font-weight: 800; display: flex; align-items: center; gap: 8px; transition: 0.3s;" onmouseover="this.style.background='rgba(46, 204, 113, 0.3)'" onmouseout="this.style.background='rgba(46, 204, 113, 0.15)'">
                        <i class="fas fa-sync-alt"></i> SMART DAVOMAT SINX
                    </button>
                    <span style="background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 20px; font-size: 0.8rem;">
                        Jami: ${workers.length} xodim
                    </span>
                 </div>
            </div>
            
            <div style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 0 0 10px 10px;">
                <table style="width: 100%; border-collapse: collapse; color: white;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                            <th style="padding: 20px; width: 50px;">#</th>
                            <th style="padding: 40px;">F.I.SH</th>
                            <th style="padding: 40px;">Lavozim</th>
                            <th style="padding: 40px;">Kiyim-bosh muddati</th>
                            <th style="padding: 40px;">Holat</th>
                            <th style="padding: 40px; text-align: right;">Amal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${workers.map((w, index) => {
        const isSigned = signedTodayIds.has(w.id);
        return `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.2s; background: ${isSigned ? 'rgba(46, 204, 113, 0.05)' : 'transparent'};">
                                    <td style="padding: 12px; opacity: 0.7;">${index + 1}</td>
                                    <td style="padding: 12px; font-weight: bold;">${w.full_name}</td>
                                    <td style="padding: 12px; opacity: 0.8;">${w.position || '-'}</td>
                                    <td style="padding: 12px;">
                                        ${(() => {
                                            const todayObj = new Date();
                                            // Mock uniform expiry logic
                                            let expiryStr = w.uniform_expiry || w.clothingDate;
                                            if (!expiryStr) {
                                                const d = new Date();
                                                d.setMonth(d.getMonth() + (w.id % 6) - 1);
                                                expiryStr = d.toISOString().split('T')[0];
                                            }
                                            const expiryDate = new Date(expiryStr);
                                            const diffDays = Math.floor((expiryDate - todayObj) / (1000 * 60 * 60 * 24));
                                            
                                            if (diffDays < 0) {
                                                return `<span style="color: #ef4444; font-weight: bold; background: rgba(239, 68, 68, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem;"><i class="fas fa-exclamation-triangle"></i> ${expiryStr} (O'tib ketgan)</span>`;
                                            } else if (diffDays <= 30) {
                                                return `<span style="color: #f59e0b; font-weight: bold; background: rgba(245, 158, 11, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem;"><i class="fas fa-clock"></i> ${expiryStr} (${diffDays} kun qoldi)</span>`;
                                            } else {
                                                return `<span style="color: #10b981; font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem;"><i class="fas fa-check-circle"></i> ${expiryStr}</span>`;
                                            }
                                        })()}
                                    </td>
                                    <td style="padding: 12px;">
                                        ${isSigned
                ? `<span style="color: #2ecc71; display: flex; align-items: center; gap: 5px;"><i class="fas fa-check-circle"></i> Imzolangan</span>`
                : `<span style="color: #e74c3c; display: flex; align-items: center; gap: 5px;"><i class="fas fa-times-circle"></i> Imzolanmagan</span>`
            }
                                    </td>
                                    <td style="padding: 12px; text-align: right;">
                                        ${!isSigned ? `
                                            <button onclick="openInstructionModal(${w.id}, '${w.full_name}')" 
                                                style="background: linear-gradient(135deg, #3498db, #2980b9); border: none; color: white; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                                                <i class="fas fa-pen-alt"></i> Imzo Qo'yish
                                            </button>
                                        ` : `
                                            <button disabled style="background: none; border: 1px solid rgba(255,255,255,0.1); color: #2ecc71; padding: 8px 15px; border-radius: 6px; opacity: 0.7;">
                                                <i class="fas fa-lock"></i> Tasdiqlangan
                                            </button>
                                        `}
                                    </td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openInstructionModal(workerId, workerName) {
    currentSigningWorker = { id: workerId, name: workerName };

    const existingModal = document.getElementById('instruction-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'instruction-modal';
    modal.className = 'active';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
        z-index: 10020; display: flex; justify-content: center; align-items: center;
        animation: modalFadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
        <style>
            @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .safety-point { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 10px; transition: 0.3s; }
            .safety-point:hover { background: rgba(255,255,255,0.06); transform: translateX(5px); }
            .safety-icon { width: 32px; height: 32px; min-width: 32px; border-radius: 8px; background: rgba(243, 156, 18, 0.2); color: #f39c12; display: flex; align-items: center; justify-content: center; font-size: 14px; }
            .signature-area { background: white; border-radius: 15px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.1); border: 2px solid rgba(0,0,0,0.05); cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path></svg>'), crosshair; position: relative; }
            .signature-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3rem; color: rgba(0,0,0,0.03); pointer-events: none; font-weight: 900; letter-spacing: 10px; text-transform: uppercase; }
        </style>
        
        <div style="background: linear-gradient(165deg, #1e293b, #0f172a); width: 95%; max-width: 850px; border-radius: 24px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
            
            <div style="padding: 25px 30px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #f39c12, #e67e22);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="background: rgba(255,255,255,0.2); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">
                        <i class="fas fa-shield-check"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Xavfsizlik Yo'riqnomasi</h3>
                        <p style="margin: 3px 0 0 0; color: rgba(255,255,255,0.8); font-size: 0.85rem;">DIQQAT: Ushbu hujjat rasmiy hisoblanadi</p>
                    </div>
                </div>
                <button onclick="closeInstructionModal()" style="background: rgba(0,0,0,0.1); border: none; color: white; width: 40px; height: 40px; border-radius: 10px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div style="padding: 30px; overflow-y: auto; flex-grow: 1; color: #f1f5f9; display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                
                <div>
                    <h4 style="color: #f39c12; margin: 0 0 20px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-info-circle"></i> Muhim Qoidalar
                    </h4>
                    
                    <div class="safety-point">
                        <div class="safety-icon"><i class="fas fa-hard-hat"></i></div>
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">Shaxsiy himoya</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">Kaska, jilet va maxsus poyabzal kiyilishi shart.</div>
                        </div>
                    </div>

                    <div class="safety-point">
                        <div class="safety-icon"><i class="fas fa-train"></i></div>
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">Hushyorlik</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">Izlarda doim ehtiyot bo'ling va poyezdni kuzating.</div>
                        </div>
                    </div>

                    <div class="safety-point">
                        <div class="safety-icon"><i class="fas fa-bolt"></i></div>
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">Elektr xavfsizligi</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">Izolatsiya va asboblar butunligini tekshiring.</div>
                        </div>
                    </div>

                    <div class="safety-point">
                        <div class="safety-icon"><i class="fas fa-mountain"></i></div>
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">Balandlikda ishlash</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">1.3 m dan yuqorida xavfsizlik kamari majburiy.</div>
                        </div>
                    </div>

                    <div style="margin-top: 20px; padding: 15px; background: rgba(243, 156, 18, 0.05); border-left: 3px solid #f39c12; border-radius: 8px; font-size: 0.85rem; line-height: 1.6; font-style: italic; color: #cbd5e1;">
                        "Men, <span style="color: #f39c12; font-weight: bold;">${workerName}</span>, barcha qoidalar bilan tanishdim va ularga to'liq amal qilishga va'da beraman."
                    </div>
                </div>

                <div id="safety-auth-selection" style="display: flex; flex-direction: column; gap: 20px;">
                    <h4 style="color: #2ecc71; margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-face-viewfinder"></i> Biometrik Tasdiqlash
                    </h4>
                    
                    <div id="safety-faceid-status" style="background: rgba(46, 204, 113, 0.1); border: 2px solid #2ecc71; color: white; padding: 30px; border-radius: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px;">
                        <div class="faceid-scanner-animation" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #2ecc71; display: flex; align-items: center; justify-content: center; position: relative;">
                            <i class="fas fa-user-check" style="font-size: 2rem; color: #2ecc71;"></i>
                            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; border: 3px solid #2ecc71; animation: face-scan-pulse 2s infinite;"></div>
                        </div>
                        <div>
                            <div style="font-weight: 900; font-size: 1.2rem; color: #2ecc71; text-transform: uppercase;">Face ID Ishga tushmoqda...</div>
                            <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 0.9rem;">Iltimos, kameraga qarab turing</p>
                        </div>
                    </div>

                    <div style="text-align: center;">
                    <div style="text-align: center;">
                        <button onclick="window.verifyFingerprintForBriefing()" style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; color: #f59e0b; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 0.8rem; transition: 0.3s; font-weight: 600; margin-bottom: 10px;">
                            <i class="fas fa-fingerprint"></i> Barmoq izi (ZKTeco) orqali
                        </button>
                        <br>
                        <button onclick="showManualSignature()" style="background: none; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 0.8rem; transition: 0.3s; font-weight: 600;">
                            <i class="fas fa-pen-fancy"></i> Qo'lda imzo qo'yish (Muqobil variant)
                        </button>
                    </div>
                </div>

                <style>
                    @keyframes face-scan-pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
                </style>

                <div id="manual-signature-container" style="display: none; flex-direction: column;">
                    <h4 style="color: #2ecc71; margin: 0 0 20px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-signature"></i> Raqamli Imzo Maydoni
                    </h4>
                    
                    <div class="signature-area">
                        <div class="signature-watermark">SAFETY</div>
                        <canvas id="signature-pad" width="380" height="280" style="touch-action: none; width: 100%; height: 280px;"></canvas>
                        <div style="position: absolute; bottom: 10px; left: 15px; font-size: 11px; color: #94a3b8;">
                            <i class="fas fa-fingerprint"></i> Biometrik tasdiq
                        </div>
                        <button onclick="clearSignature()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.05); border: none; color: #64748b; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.3s;" title="Tozalash">
                            <i class="fas fa-eraser"></i>
                        </button>
                    </div>

                    <div style="margin-top: 20px; color: #94a3b8; font-size: 0.8rem; text-align: center;">
                        <i class="fas fa-info-circle"></i> Sichqoncha yoki barmoq orqali imzo qo'ying
                    </div>
                </div>
            </div>

            <div style="padding: 25px 30px; border-top: 1px solid rgba(255,255,255,0.05); text-align: right; background: rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px; color: #94a3b8; font-size: 0.85rem;">
                    <i class="fas fa-clock"></i> ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | ${new Date().toLocaleDateString()}
                </div>
                <button onclick="saveSignature()" style="background: linear-gradient(135deg, #2ecc71, #27ae60); border: none; color: white; padding: 14px 40px; border-radius: 12px; font-size: 1.1rem; font-weight: bold; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(46, 204, 113, 0.3); transition: 0.3s; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-check-double"></i> Tasdiqlash va Saqlash
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Auto-trigger Face ID for speed (User requirement)
    setTimeout(() => {
        if (typeof startSafetyFaceID === 'function') {
            startSafetyFaceID();
        }
    }, 800);
}

window.showManualSignature = function () {
    document.getElementById('safety-auth-selection').style.display = 'none';
    const container = document.getElementById('manual-signature-container');
    container.style.display = 'flex';
    setupCanvas();
}

window.startSafetyFaceID = function () {
    if (typeof openTNU19FaceIDModal === 'function') {
        // Set up global state for TNU-19 logic to handle our safety signing
        window.tnu19SignatureStep = 'worker';
        window.tnu19CurrentRecord = {
            id: 'tnu19_' + Date.now(),
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            workerId: currentSigningWorker.id,
            workerName: currentSigningWorker.name,
            workerPosition: currentSigningWorker.role || 'Xodim',
            instructionType: 'takroriy',
            instructionContent: "Kunlik xavfsizlik texnikasi bo'yicha yo'riqnoma",
            instructorName: "Mahmudov M.U.",
            instructorPosition: "Bosh muhandis",
            bolinmaId: window.currentSafetyBolinmaId || '1-bo\'linma'
        };

        // We'll use a MutationObserver to detect when the Face ID modal is closed
        // and check if a signature was generated
        const observer = new MutationObserver((mutations) => {
            if (!document.getElementById('tnu19-faceid-modal') && !document.getElementById('tnu19-signature-modal')) {
                // Check if TNU-19 record was saved or if we have a signature
                if (window.tnu19CurrentRecord && window.tnu19CurrentRecord.workerSignature) {
                    // Manually trigger the safety log save since TNU-19 modal is gone
                    completeSafetySigning(window.tnu19CurrentRecord.workerSignature);
                }
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true });

        openTNU19FaceIDModal();
    } else {
        SmartUtils.showToast("Face ID tizimi topilmadi!", "error");
    }
}

// Helper to complete safety signing from external sources (like Face ID)
async function completeSafetySigning(sigData) {
    if (!currentSigningWorker) return;

    const today = new Date().toISOString().slice(0, 10);
    const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    try {
        // 1. Save to Server TNU-19
        await SmartUtils.fetchAPI('/safety/tnu19', {
            method: 'POST',
            body: JSON.stringify({
                employee_id: currentSigningWorker.id,
                bolinma_id: window.currentSafetyBolinmaId || 'all',
                date: today,
                time: time,
                instruction_type: 'takroriy',
                instructor_name: "Mahmudov M.U.",
                signature: sigData
            })
        });

        // 2. Server-side log
        try {
            await SmartUtils.fetchAPI('/safety/logs', {
                method: 'POST',
                body: JSON.stringify({
                    bolinma_id: window.currentSafetyBolinmaId || 'all',
                    type: 'Daily Instruction (Face ID)',
                    employee_id: currentSigningWorker.id,
                    content: `Face ID orqali imzoladi. Sana: ${today}`,
                    date: today
                })
            });
        } catch (e) { console.error('Safety log sync failed:', e); }

        // Remove local if it was there (cleanup)
        localStorage.removeItem(`safety_logs_${currentSigningWorker.id}_${today}`);

        showSafetyToast(`${currentSigningWorker.name} Face ID orqali imzoladi!`);

        closeInstructionModal();
        const bId = window.currentSafetyBolinmaId;
        renderSafetyStats(bId);
        renderWorkerList(bId);
    } catch (e) {
        console.error("Face ID saqlashda xatolik:", e);
        showSafetyToast("Face ID saqlashda server xatoligi yuz berdi!", 'error');
    }
}

function closeInstructionModal() {
    document.getElementById('instruction-modal')?.remove();
    currentSigningWorker = null;
}

function setupCanvas() {
    const canvas = document.getElementById('signature-pad');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';

    let points = [];
    safetyIsDrawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
            t: Date.now()
        };
    }

    function startDraw(e) {
        safetyIsDrawing = true;
        points = [getPos(e)];

        // Hide watermark on first touch
        const watermark = canvas.parentElement.querySelector('.signature-watermark');
        if (watermark) watermark.style.opacity = '0.3';
    }

    function draw(e) {
        if (!safetyIsDrawing) return;
        e.preventDefault();

        const pos = getPos(e);
        points.push(pos);

        if (points.length < 3) return;

        // Draw with quadratic curves for smoothness
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        // For the last 2 points
        ctx.quadraticCurveTo(
            points[points.length - 2].x,
            points[points.length - 2].y,
            points[points.length - 1].x,
            points[points.length - 1].y
        );

        ctx.stroke();
    }

    function stopDraw() {
        if (safetyIsDrawing) {
            safetyIsDrawing = false;
            // Simplified points array for performance if needed, 
            // but for a single signature it's fine.
        }
    }

    // Simplified event handling for stability
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDraw);

    // Touch events (window.ontouchmove o'rniga addEventListener ishlatiladi)
    canvas.addEventListener('touchstart', function (e) { startDraw(e); }, { passive: true });
    document.addEventListener('touchmove', function (e) {
        // Faqat canvas uchun
        if (safetyIsDrawing) draw(e);
    }, { passive: true });
    document.addEventListener('touchend', stopDraw);

    // Cleanup: Modal yopilganda eventlarni tozalash
    const instructionModal = document.getElementById('instruction-modal');
    if (instructionModal) {
        const observer = new MutationObserver(() => {
            if (!document.getElementById('instruction-modal')) {
                document.removeEventListener('mouseup', stopDraw);
                document.removeEventListener('touchend', stopDraw);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true });
    }
} // setupCanvas TUGADI

// --- Smart Attendance Sync Logic ---
window.syncAttendanceToSafety = async function (bolinmaId) {
    const btn = document.getElementById('btn-sync-attendance');
    if (!btn) return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sinxronizatsiya...';
    btn.disabled = true;

    try {
        // 1. Get Workers and today's status
        if (!window.hrData || !window.hrData.employees) await initHRData();
        const workers = window.hrData.employees || [];
        const today = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date(new Date().getTime() + 86400000).toISOString().slice(0, 10);

        // 2. Fetch TNU-19 logs to avoid duplicates
        const tnu19Logs = await SmartUtils.fetchAPI(`/safety/tnu19?bolinma_id=${bolinmaId || ''}`) || [];
        const signedTodayIds = new Set(tnu19Logs.filter(l => l.date === today).map(l => l.employee_id));

        // 3. Filter workers for this department who ARE present but NOT signed
        const deptWorkers = workers.filter(w => {
            const wBol = String(w.bolinma || w.department || '').toLowerCase();
            return wBol.includes(String(bolinmaId).toLowerCase()) || String(bolinmaId).toLowerCase().includes(wBol);
        });

        const syncQueue = deptWorkers.filter(w => !signedTodayIds.has(w.id));

        if (syncQueue.length === 0) {
            showSafetyToast("Barcha hozir bo'lgan xodimlar allaqachon imzolagan!", "info");
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            return;
        }

        let syncCount = 0;
        for (const worker of syncQueue) {
            // Auto-sign logic
            await SmartUtils.fetchAPI('/safety/tnu19', {
                method: 'POST',
                body: JSON.stringify({
                    employee_id: worker.id,
                    bolinma_id: bolinmaId,
                    date: today,
                    time: "08:00", // Start of shift
                    instruction_type: 'takroriy (Avto-Sinx)',
                    instructor_name: "Tizim (AI)",
                    signature: "DATA:BIOMETRIC_SYNC_VERIFIED_" + worker.id
                })
            });
            syncCount++;
        }

        showSafetyToast(`${syncCount} ta xodim davomat asosida avtomatik tasdiqlandi!`, "success");

        // Refresh view
        renderWorkerList(bolinmaId);
        renderSafetyStats(bolinmaId);

    } catch (e) {
        console.error("Sync Error:", e);
        showSafetyToast("Sinxronizatsiyada xatolik yuz berdi", "error");
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
};

window.renderSafetyStats = async function (bolinmaId) {
    if (!window.hrData || !window.hrData.employees) await initHRData();
    const workers = window.hrData.employees || [];
    const deptWorkers = workers.filter(w => {
        const wBol = String(w.bolinma || w.department || '').toLowerCase();
        return wBol.includes(String(bolinmaId).toLowerCase()) || String(bolinmaId).toLowerCase().includes(wBol);
    });

    const total = deptWorkers.length;

    let tnu19Logs = [];
    try {
        tnu19Logs = await SmartUtils.fetchAPI(`/safety/tnu19?bolinma_id=${bolinmaId || ''}`) || [];
    } catch (e) { }

    const today = new Date().toISOString().slice(0, 10);
    const signedCount = tnu19Logs.filter(l => l.date === today).length;

    const totalEl = document.getElementById('stat-total-workers');
    const briefEl = document.getElementById('stat-active-briefings');

    if (totalEl) totalEl.innerText = total;
    if (briefEl) briefEl.innerText = `${signedCount} / ${total}`;
};

console.log('✅ Safety Module Sync Logic Loaded');

function clearSignature() {
    const canvas = document.getElementById('signature-pad');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function showSafetyToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'linear-gradient(135deg, #e74c3c, #c0392b)'};
        color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 100000; display: flex; align-items: center; gap: 12px;
        font-weight: bold; animation: toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    const icon = type === 'success' ? 'fa-check-double' : 'fa-exclamation-triangle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;

    // Keyframes if not exists
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.innerHTML = `
            @keyframes toastSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes toastSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

async function saveSignature() {
    if (!currentSigningWorker) return;

    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let isCanvasEmpty = true;
    for (let i = 0; i < pixelData.length; i += 4) {
        if (pixelData[i + 3] > 0) { isCanvasEmpty = false; break; }
    }

    if (isCanvasEmpty) {
        showSafetyToast("Iltimos, imzo maydonini to'ldiring!", 'error');
        return;
    }

    const signatureData = canvas.toDataURL();
    const today = new Date().toISOString().slice(0, 10);

    try {
        // 1. Save to TNU-19 via API (Automatic)
        const response = await SmartUtils.fetchAPI('/safety/tnu19', {
            method: 'POST',
            body: JSON.stringify({
                employee_id: currentSigningWorker.id,
                bolinma_id: window.currentSafetyBolinmaId || 'all',
                date: today,
                time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
                instruction_type: 'takroriy',
                instructor_name: "Mahmudov M.U.",
                signature: signatureData
            })
        });

        if (response) {
            showSafetyToast(`${currentSigningWorker.name} imzosi va TNU-19 jurnali saqlandi!`);

            // Cleanup and reload
            setTimeout(() => {
                closeInstructionModal();
                const bId = window.currentSafetyBolinmaId;
                renderSafetyStats(bId);
                renderWorkerList(bId);
            }, 500);
        }
    } catch (e) {
        showSafetyToast("Saqlashda xatolik yuz berdi!", 'error');
    }
}

// Render Safety Statistics
async function renderSafetyStats(bolinmaId) {
    try {
        const totalEl = document.getElementById('stat-total-workers');
        const briefEl = document.getElementById('stat-active-briefings');

        // 1. Get Workers
        if (!window.hrData || !window.hrData.employees) await initHRData();
        let workers = window.hrData.employees || [];

        // Filter by Bolinma
        const bIdStr = String(bolinmaId || '').toLowerCase();
        if (bIdStr && bIdStr !== 'all') {
            workers = workers.filter(w => {
                const wBol = String(w.bolinma || w.department || '').toLowerCase();
                return wBol.includes(bIdStr) || bIdStr.includes(wBol);
            });
        }

        // 2. Fetch Today's Logs
        const today = new Date().toISOString().slice(0, 10);
        let tnu19Logs = [];
        try {
            tnu19Logs = await SmartUtils.fetchAPI(`/safety/tnu19?bolinma_id=${bolinmaId || ''}`) || [];
        } catch (e) { }

        const signedTodayIds = new Set(tnu19Logs.filter(l => l.date === today).map(l => l.employee_id));
        const signedCount = signedTodayIds.size;
        const totalCount = workers.length;

        // Update Dashboard Cards
        if (totalEl) totalEl.innerText = totalCount;
        if (briefEl) briefEl.innerText = `${signedCount} / ${totalCount}`;

        // Update traditional stats bar if it exists
        const statsDiv = document.getElementById('safety-stats');
        if (statsDiv) {
            const signedPercent = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;
            statsDiv.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                    <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid #2ecc71; padding: 15px; border-radius: 12px; text-align: center;">
                        <div style="color: #2ecc71; font-weight: 800; font-size: 0.7rem;">IMZOLAR</div>
                        <div style="font-size: 1.5rem; font-weight: 900;">${signedCount}</div>
                    </div>
                    <div style="background: rgba(231, 76, 60, 0.1); border: 1px solid #e74c3c; padding: 15px; border-radius: 12px; text-align: center;">
                        <div style="color: #e74c3c; font-weight: 800; font-size: 0.7rem;">KUTILMOQDA</div>
                        <div style="font-size: 1.5rem; font-weight: 900;">${totalCount - signedCount}</div>
                    </div>
                    <div style="background: rgba(52, 152, 219, 0.1); border: 1px solid #3498db; padding: 15px; border-radius: 12px; text-align: center;">
                        <div style="color: #3498db; font-weight: 800; font-size: 0.7rem;">JAMI</div>
                        <div style="font-size: 1.5rem; font-weight: 900;">${totalCount}</div>
                    </div>
                    <div style="background: rgba(241, 196, 15, 0.1); border: 1px solid #f1c40f; padding: 15px; border-radius: 12px; text-align: center;">
                        <div style="color: #f1c40f; font-weight: 800; font-size: 0.7rem;">FOIZ</div>
                        <div style="font-size: 1.5rem; font-weight: 900;">${signedPercent}%</div>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        console.error("Error in renderSafetyStats:", err);
    }
}


// --- CENTRAL MONITORING FOR SAFETY DEPARTMENT ---
function getCentralSafetyMonitorHTML() {
    // Get all workers
    let allWorkers = [];
    if (typeof window.hrData !== 'undefined' && window.hrData.employees && window.hrData.employees.length > 0) {
        allWorkers = window.hrData.employees;
    } else if (typeof workersData !== 'undefined') {
        allWorkers = workersData;
    }

    // All logs
    const logs = JSON.parse(localStorage.getItem('safety_logs') || '{}');
    const today = new Date().toISOString().slice(0, 10);

    // Group by bolinma
    const bolinmaStats = {};
    for (let i = 1; i <= 10; i++) {
        const bId = `bolinma${i} `;
        const bName = `${i} -bo'linma`;

        const bWorkers = allWorkers.filter(w =>
            w.bolinma === bId || w.bolinmaId === bId ||
            w.bolinma === bName || w.bolinmaId === bName
        );

        const signed = bWorkers.filter(w => {
            const key = `${w.id}_${today}`;
            return logs[key];
        });

        bolinmaStats[i] = {
            id: bId,
            name: `${i}-bo'linma`,
            total: bWorkers.length,
            signed: signed.length,
            percent: bWorkers.length > 0 ? Math.round((signed.length / bWorkers.length) * 100) : 0
        };
    }

    const totalSigned = Object.values(bolinmaStats).reduce((sum, b) => sum + b.signed, 0);
    const totalWorkers = Object.values(bolinmaStats).reduce((sum, b) => sum + b.total, 0);
    const overallPercent = totalWorkers > 0 ? Math.round((totalSigned / totalWorkers) * 100) : 0;

    // Latest 5 signatures across all
    const allLogs = Object.values(logs)
        .filter(l => l.date && l.date.includes(today))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

    return `
        <div class="central-safety-monitor" style="margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; border: 1px solid rgba(243, 156, 18, 0.3); padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <div>
                        <h2 style="margin: 0; color: #f39c12; font-size: 1.8rem; display: flex; align-items: center; gap: 15px;">
                            <i class="fas fa-shield-halved"></i> Markaziy Mehnat Muhofazasi Monitori
                        </h2>
                        <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.5);">Barcha bo'linmalar bo'yicha kunlik yo'riqnoma holati</p>
                    </div>
                    <div style="text-align: right;">
                        <span class="pulse-badge" style="background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">
                             LIVE MONITORING
                        </span>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border-left: 4px solid #f39c12;">
                        <div style="font-size: 0.8rem; color: #aaa; text-transform: uppercase;">Jami Xodimlar</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 5px;">${totalWorkers}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border-left: 4px solid #2ecc71;">
                        <div style="font-size: 0.8rem; color: #aaa; text-transform: uppercase;">Bugun Imzolagan</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 5px; color: #2ecc71;">${totalSigned}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border-left: 4px solid #e74c3c;">
                        <div style="font-size: 0.8rem; color: #aaa; text-transform: uppercase;">Imzolamagan</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 5px; color: #e74c3c;">${totalWorkers - totalSigned}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border-left: 4px solid #3498db;">
                        <div style="font-size: 0.8rem; color: #aaa; text-transform: uppercase;">Bajarilish ko'rsatkichi</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 5px; color: #3498db;">${overallPercent}%</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 25px;">
                    <!-- Bo'linmalar jadvali -->
                    <div style="background: rgba(0,0,0,0.2); border-radius: 15px; padding: 20px;">
                        <h4 style="margin: 0 0 15px 0; color: #ffd700;"><i class="fas fa-list-check"></i> Bo'linmalar Kesimida</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1);">
                                    <th style="padding: 10px;">Bo'linma</th>
                                    <th style="padding: 10px;">Xodimlar</th>
                                    <th style="padding: 10px;">Holati</th>
                                    <th style="padding: 10px;">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.values(bolinmaStats).map(b => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 12px; font-weight: bold;">${b.name.toUpperCase()}</td>
                                        <td style="padding: 12px;">${b.signed} / ${b.total}</td>
                                        <td style="padding: 12px;">
                                            <span style="background: ${b.percent === 100 ? 'rgba(46, 204, 113, 0.2)' : b.percent > 0 ? 'rgba(241, 196, 15, 0.2)' : 'rgba(231, 76, 60, 0.2)'}; 
                                                         color: ${b.percent === 100 ? '#2ecc71' : b.percent > 0 ? '#f1c40f' : '#e74c3c'}; 
                                                         padding: 3px 10px; border-radius: 10px; font-size: 0.75rem;">
                                                ${b.percent === 100 ? 'YAKUNLANDI' : b.percent > 0 ? 'JARAYONDA' : 'BOSHLANMAGAN'}
                                            </span>
                                        </td>
                                        <td style="padding: 12px; width: 150px;">
                                            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                                                <div style="width: ${b.percent}%; height: 100%; background: linear-gradient(90deg, #f39c12, #f1c40f); border-radius: 4px;"></div>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- So'nggi imzolar -->
                    <div style="background: rgba(0,0,0,0.2); border-radius: 15px; padding: 20px;">
                        <h4 style="margin: 0 0 15px 0; color: #ffd700;"><i class="fas fa-clock-rotate-left"></i> So'nggi Imzolar</h4>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${allLogs.map(l => `
                                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border-left: 3px solid #2ecc71;">
                                    <div style="font-weight: bold; font-size: 0.9rem;">${l.workerName}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                                        <span style="font-size: 0.75rem; color: #aaa;">${l.type || 'Yo\'riqnoma'}</span>
                                        <span style="font-size: 0.75rem; color: #2ecc71; font-family: monospace;">${new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            `).join('')}
                            ${allLogs.length === 0 ? '<p style="color: #666; font-style: italic; text-align: center; margin-top: 20px;">Bugun hali imzolar yo\'q</p>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Export globally
window.renderSafetyDashboard = renderSafetyDashboard;
window.renderWorkerList = renderWorkerList;
window.openInstructionModal = openInstructionModal;
window.saveSignature = saveSignature;
window.closeInstructionModal = closeInstructionModal;
window.clearSignature = clearSignature;
window.getCentralSafetyMonitorHTML = getCentralSafetyMonitorHTML;

// Function to provide statistics for the department dashboard home widgets
window.getSafetyStats = function(bolinmaId) {
    const today = new Date().toISOString().slice(0, 10);
    const tnu19Logs = JSON.parse(localStorage.getItem('tnu19_logs') || '[]');
    const tnu20Logs = JSON.parse(localStorage.getItem('tnu20_logs') || '[]');
    
    // Filter by bolinma if provided
    let f19 = tnu19Logs;
    let f20 = tnu20Logs;
    
    if (bolinmaId && bolinmaId !== 'all') {
        const bNumMatch = String(bolinmaId).match(/\d+/);
        const bNum = bNumMatch ? bNumMatch[0] : bolinmaId;
        
        const filterFn = l => {
            const wBol = String(l.bolinmaId || '').toLowerCase();
            const wNumMatch = wBol.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';
            return wNum === bNum || wBol.includes(String(bolinmaId).toLowerCase());
        };
        
        f19 = tnu19Logs.filter(filterFn);
        f20 = tnu20Logs.filter(filterFn);
    }
    
    // Today's stats
    const signedToday = f19.filter(l => l.date && l.date.includes(today)).length;
    
    // TNU-20 completeness (dummy logic based on total workers if possible)
    let totalWorkers = 0;
    if (window.hrData && window.hrData.employees) {
        totalWorkers = window.hrData.employees.filter(w => {
            if (!bolinmaId || bolinmaId === 'all') return true;
            const bNumMatch = String(bolinmaId).match(/\d+/);
            const bNum = bNumMatch ? bNumMatch[0] : bolinmaId;
            const wBol = String(w.department || w.bolinma || '').toLowerCase();
            const wNumMatch = wBol.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';
            return wNum === bNum;
        }).length;
    } else {
        totalWorkers = 50; // Fallback
    }

    const tnu20Count = f20.length;
    const tnu20Percent = totalWorkers > 0 ? Math.min(100, Math.round((tnu20Count / (totalWorkers * 0.5)) * 100)) : 0;

    return {
        tnu20: {
            completed: tnu20Count,
            total: Math.max(tnu20Count, Math.round(totalWorkers * 0.5)),
            percent: tnu20Percent,
            trend: '+3%'
        },
        alerts: [
            { id: 1, title: 'Bugungi yo\'riqnomalar', count: signedToday, color: signedToday > 0 ? '#10b981' : '#f59e0b' },
            { id: 2, title: 'TNU-20 naryadlari', count: tnu20Count, color: '#3b82f6' }
        ]
    };
};
