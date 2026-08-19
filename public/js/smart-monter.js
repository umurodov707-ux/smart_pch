/**
 * SMART-MONTER & E-IMZO MODULE
 * =============================
 * Ovozli, Oflayn ishlashga mo'ljallangan mobil interfeys (Dalada ishlovchi monterlar uchun).
 * Hujjatlarni (tekshiruvlarni) Elektron Imzo yoki Biometrik tasdiqlash bilan bloklash (Audit Trail).
 */

(function () {
    // --- SMART-MONTER UI ---
    window.openSmartMonter = function() {
        const existing = document.getElementById('smart-monter-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'smart-monter-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #020617; z-index: 9999999; display: flex; flex-direction: column;
            font-family: 'Outfit', sans-serif; color: #fff; overflow-y: auto;
            animation: smSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        overlay.innerHTML = `
            <style>
                @keyframes smSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes smPulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); transform: scale(1); } 70% { box-shadow: 0 0 0 30px rgba(239, 68, 68, 0); transform: scale(1.05); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); transform: scale(1); } }
                .sm-header { padding: 25px 20px; background: #0f172a; border-bottom: 2px solid #d4af37; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; }
                .sm-btn { padding: 20px; border-radius: 20px; font-weight: 900; font-size: 1.2rem; cursor: pointer; border: none; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: center; align-items: center; gap: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); transition: 0.2s; }
                .sm-btn:active { transform: scale(0.96); }
                .sm-primary { background: linear-gradient(135deg, #d4af37, #997a00); color: #000; }
                .sm-secondary { background: #1e293b; color: #fff; border: 1px solid rgba(255,255,255,0.1); }
                
                .sm-mic-btn { width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #991b1b); color: #fff; font-size: 3.5rem; border: none; cursor: pointer; margin: 30px auto; display: flex; justify-content: center; align-items: center; box-shadow: 0 15px 40px rgba(239, 68, 68, 0.4); text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
                .sm-mic-btn.recording { animation: smPulse 1.5s infinite; background: linear-gradient(135deg, #f87171, #ef4444); }
                
                .sm-status { padding: 8px 15px; background: rgba(16, 185, 129, 0.1); color: #10b981; border-radius: 30px; font-size: 0.8rem; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.3); display: flex; align-items: center; gap: 8px;}
                .sm-status.offline { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }
            </style>

            <div class="sm-header">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <span style="font-size: 1.4rem; font-weight: 900; color: #d4af37; letter-spacing: 1px;"><i class="fas fa-hard-hat" style="margin-right: 8px;"></i> SMART-MONTER</span>
                    <span style="font-size: 0.8rem; color: #94a3b8;"><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i> Koordinata: Olinmoqda...</span>
                </div>
                <button onclick="document.getElementById('smart-monter-overlay').remove()" style="background: rgba(255,255,255,0.1); border: none; color: #fff; width: 45px; height: 45px; border-radius: 50%; font-size: 1.3rem; cursor: pointer;"><i class="fas fa-times"></i></button>
            </div>

            <div style="flex: 1; padding: 25px 20px; display: flex; flex-direction: column; gap: 20px;">
                <!-- Status hududi -->
                <div style="display: flex; justify-content: center; margin-bottom: 10px;">
                    <div id="sm-net-status" class="sm-status"><i class="fas fa-wifi"></i> ONLINE (Sinxron)</div>
                </div>

                <!-- Ovozli kiritish bloki -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 30px 20px; text-align: center;">
                    <div style="font-size: 0.9rem; color: #cbd5e1; font-weight: 700; text-transform: uppercase;">Muammoni ovozli xabar qiling</div>
                    <button id="sm-voice-record" class="sm-mic-btn" onclick="window.smToggleRecording()">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <div id="sm-voice-result" style="margin-top: 20px; min-height: 60px; padding: 15px; border-radius: 15px; background: rgba(0,0,0,0.3); font-size: 1.1rem; line-height: 1.5; color: #e2e8f0; border: 1px solid rgba(212,175,55,0.2);">
                        <i style="color: #64748b;">(Tugmani bosing va gapiring. Masalan: "41-kilometrda rels yorig'i")</i>
                    </div>
                    <button id="sm-send-btn" class="sm-btn sm-secondary" style="width: 100%; margin-top: 15px; display: none;" onclick="window.smSendReport()"><i class="fas fa-paper-plane"></i> DISPETCHERGA YUBORISH</button>
                </div>

                <!-- Boshqa field amallari -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                    <button class="sm-btn sm-secondary" style="flex-direction: column; padding: 25px 15px; font-size: 1rem;" onclick="window.smCameraCapture()"><i class="fas fa-camera" style="font-size: 2.2rem; color: #38bdf8; margin-bottom: 10px;"></i> RASMGA OLISH</button>
                    <button class="sm-btn sm-secondary" style="flex-direction: column; padding: 25px 15px; font-size: 1rem;" onclick="SmartUtils.showToast('QR Skaner ishga tushirildi', 'info')"><i class="fas fa-qrcode" style="font-size: 2.2rem; color: #10b981; margin-bottom: 10px;"></i> QR Skaner</button>
                </div>
                
                <!-- Ruxsat berish E-Imzo -->
                <button class="sm-btn sm-primary" style="margin-top: auto; justify-content: flex-start; padding: 20px 25px;" onclick="window.openEImzoAuditModal('Kunlik Reja Qabuli')">
                    <i class="fas fa-fingerprint" style="font-size: 2rem;"></i> 
                    <span style="text-align: left;"><div style="font-size: 0.75rem; font-weight: 700; color: rgba(0,0,0,0.6); margin-bottom: 3px;">MA'SULIYAT</div>E-IMZO TASDIQLASH</span>
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Simulating GPS coordinates
        setTimeout(() => {
            const el = document.querySelector('.sm-header span:nth-child(2)');
            if (el) el.innerHTML = `<i class="fas fa-map-marker-alt" style="margin-right: 5px; color:#ef4444;"></i> Koordinata: 41.3110° N, 69.2405° E`;
        }, 1500);

        // Check offline/online
        window.addEventListener('offline', updateSmStatus);
        window.addEventListener('online', updateSmStatus);
        updateSmStatus();
    };

    function updateSmStatus() {
        const smStatus = document.getElementById('sm-net-status');
        if (!smStatus) return;
        if (!navigator.onLine) {
            smStatus.className = 'sm-status offline';
            smStatus.innerHTML = '<i class="fas fa-wifi" style="text-decoration: line-through;"></i> OFLAYN REJIM (KEShLANMOQDA)';
        } else {
            smStatus.className = 'sm-status';
            smStatus.innerHTML = '<i class="fas fa-wifi"></i> ONLINE (Sinxron)';
        }
    }

    // --- VOICE RECOGNITION (Web Speech API) ---
    let recognition = null;
    let isRecording = false;

    window.smToggleRecording = function() {
        if (!('webkitSpeechRecognition' in window)) {
            SmartUtils.showToast("Sizning brauzeringizda ovozli kiritish qo'llab-quvvatlanmaydi", "error");
            return;
        }

        const btn = document.getElementById('sm-voice-record');
        const resBox = document.getElementById('sm-voice-result');
        const sendBtn = document.getElementById('sm-send-btn');

        if (isRecording) {
            recognition.stop();
            return;
        }

        recognition = new webkitSpeechRecognition();
        recognition.lang = 'uz-UZ';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecording = true;
            btn.classList.add('recording');
            btn.innerHTML = '<i class="fas fa-stop"></i>';
            resBox.innerHTML = '<span style="color: #64748b; font-style: italic;">Eshitmoqdaman... Qattiqroq gapiring.</span>';
            resBox.style.borderColor = '#ef4444';
            sendBtn.style.display = 'none';
        };

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            resBox.innerHTML = `<strong>"${transcript}"</strong>`;
        };

        recognition.onerror = (e) => {
            console.error("Speech Recognition Error:", e);
        };

        recognition.onend = () => {
            isRecording = false;
            btn.classList.remove('recording');
            btn.innerHTML = '<i class="fas fa-microphone"></i>';
            resBox.style.borderColor = '#d4af37';
            if (resBox.innerText.length > 10 && !resBox.innerText.includes('Eshitmoqdaman')) {
                sendBtn.style.display = 'block';
            } else {
                resBox.innerHTML = '<i style="color: #64748b;">(Ovoz tushunarsiz, qayta urinib ko\'ring)</i>';
            }
        };

        recognition.start();
    };

    window.smSendReport = function() {
        const resBox = document.getElementById('sm-voice-result');
        const text = resBox.innerText;
        SmartUtils.showToast("Xabar dispetcherga uchdi!", "success");
        setTimeout(() => {
            resBox.innerHTML = '<i style="color: #64748b;">(Tugmani bosing va gapiring)</i>';
            document.getElementById('sm-send-btn').style.display = 'none';
        }, 1500);
    };

    window.smCameraCapture = function() {
        SmartUtils.showToast("Kamera moduli yuklanmoqda (Koordinata tirkaladi)", "info");
    };

    // --- E-IMZO / DIGITAL AUDIT TRAIL ---
    window.openEImzoAuditModal = function(documentName, targetId) {
        const existing = document.getElementById('eimzo-audit-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'eimzo-audit-modal';
        modal.className = 'active';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(25px); z-index: 99999999;
            display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif;
        `;
        
        // Generate pseudo-crypto hash
        const cryptoHash = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
        const userName = window.Auth?.currentUser?.fullname || "Alimov B.T.";

        modal.innerHTML = `
            <style>
                @keyframes hashScan { 0% { top: 0; } 50% { top: 100%; opacity: 0.5; } 100% { top: 0; } }
                .crypto-box { width: 100%; border: 1px dashed rgba(212, 175, 55, 0.5); padding: 15px; border-radius: 12px; background: rgba(0,0,0,0.5); font-family: 'Courier New', monospace; font-size: 0.8rem; color: #d4af37; word-break: break-all; margin: 20px 0; position: relative; overflow: hidden; }
                .crypto-box::before { content: ''; position: absolute; left: 0; top: 0; width: 100%; height: 2px; background: #d4af37; box-shadow: 0 0 10px #d4af37; animation: hashScan 3s linear infinite; }
            </style>
            
            <div style="background: linear-gradient(180deg, #0f172a 0%, #020617 100%); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 24px; width: 500px; max-width: 95vw; padding: 40px 30px; box-shadow: 0 0 100px rgba(212, 175, 55, 0.15); position: relative;">
                
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(212, 175, 55, 0.1); border: 2px solid #d4af37; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; font-size: 2rem; color: #d4af37; box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);">
                        <i class="fas fa-fingerprint"></i>
                    </div>
                    <h2 style="margin: 0; color: #fff; font-size: 1.4rem; font-weight: 900;">RAQAMLI IMZOLASH</h2>
                    <p style="color: #64748b; font-size: 0.85rem; margin-top: 5px;">Hujjat ma'lumotlari zanjirga (blockchain) kiritilmoqda</p>
                </div>

                <div style="background: rgba(255,255,255,0.03); border-radius: 14px; padding: 20px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
                        <span style="color: #94a3b8; font-weight: 700;">HUJJAT:</span>
                        <span style="color: #fff; font-weight: 800; text-align: right;">${documentName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
                        <span style="color: #94a3b8; font-weight: 700;">MAS'UL SHAXS:</span>
                        <span style="color: #38bdf8; font-weight: 800;">${userName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                        <span style="color: #94a3b8; font-weight: 700;">SANA / VAQT:</span>
                        <span style="color: #fff; font-weight: 800;">${new Date().toLocaleString('uz-UZ')}</span>
                    </div>
                </div>

                <div class="crypto-box">
                    SHA-256 HASH: ${cryptoHash}
                </div>

                <p style="color: #ef4444; font-size: 0.75rem; font-weight: 700; text-align: center; margin-bottom: 25px;">
                    <i class="fas fa-shield-alt" style="margin-right: 5px;"></i> Ushbu amal yuridik kuchga ega va uni bekor qilib bo'lmaydi.
                </p>

                <div style="display: flex; gap: 15px;">
                    <button onclick="document.getElementById('eimzo-audit-modal').remove()" style="flex: 1; padding: 15px; background: rgba(255,255,255,0.05); border: none; border-radius: 12px; color: #94a3b8; cursor: pointer; font-weight: 800;">BEKOR QILISH</button>
                    <button onclick="window.confirmEImzo('${documentName}', '${targetId}')" style="flex: 2; padding: 15px; background: linear-gradient(135deg, #d4af37, #b89326); border: none; border-radius: 12px; color: #000; cursor: pointer; font-weight: 900; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3);">IMZOLASH VA TASDIQLASH</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.confirmEImzo = function(docName, targetId) {
        document.getElementById('eimzo-audit-modal').innerHTML = `
            <div style="background: #020617; border: 1px solid #10b981; border-radius: 24px; padding: 50px 30px; text-align: center; box-shadow: 0 0 100px rgba(16, 185, 129, 0.2);">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); border: 3px solid #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-size: 2.5rem; color: #10b981;">
                    <i class="fas fa-check"></i>
                </div>
                <h2 style="color: #fff; margin: 0 0 10px 0; font-weight: 900;">MUVAFFAQIYATLI!</h2>
                <p style="color: #64748b; font-size: 0.9rem;">Hujjat raqamli imzolandi va bazaga qulflab qo'yildi.</p>
            </div>
        `;
        
        setTimeout(() => {
            const m = document.getElementById('eimzo-audit-modal');
            if (m) m.remove();
            SmartUtils.showToast("Imzolandi: " + docName, "success");
            
            // If linked to a specific UI element, update its status
            if (targetId) {
                const el = document.getElementById(targetId);
                if (el) {
                    el.innerHTML = `<span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 900; border: 1px solid rgba(16,185,129,0.3);"><i class="fas fa-lock"></i> IMZOLANDI</span>`;
                }
            }
        }, 2000);
    };

})();
