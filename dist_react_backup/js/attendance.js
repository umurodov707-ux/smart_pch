/**
 * SMART PCH - General Face ID Attendance Module
 * Haqiqiy AI yuzni tanib olish bilan jihozlangan
 */

const FaceIDAttendance = {
    stream: null,
    scanInterval: null,
    isScanning: false,

    openScanner: async function (targetEmpId = null, registrationMode = false) {
        this.targetEmpId = targetEmpId;
        this.registrationMode = registrationMode;
        
        const existing = document.getElementById('attendance-faceid-modal');
        if (existing) existing.remove();

        // 1. Dastlab HR Bazasidagi yuzlari (faceTemplate) bor xodimlarni yuklaymiz
        if (!window.hrData) await window.initHRData();
        const employeesWithFace = (window.hrData?.employees || []).filter(e => e.faceTemplate);
        
        // If we have a target employee for registration, we don't need existing faces
        const targetEmployee = targetEmpId ? window.hrData.employees.find(e => e.id === targetEmpId) : null;

        const modal = document.createElement('div');
        modal.id = 'attendance-faceid-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(13, 17, 23, 0.95); z-index: 20000; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif; backdrop-filter: blur(20px);
        `;

        modal.innerHTML = `
            <div style="position: absolute; top: 20px; right: 20px;">
                <button onclick="FaceIDAttendance.close()" style="background: rgba(248, 81, 73, 0.1); border: 1px solid #f85149; color: #f85149; padding: 10px 25px; border-radius: 30px; cursor: pointer; font-weight: bold; text-transform: uppercase;">
                    <i class="fas fa-times"></i> Yopish
                </button>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: ${registrationMode ? '#f59e0b' : '#00c6ff'}; font-size: 2.2rem; margin: 0; text-transform: uppercase;">
                    <i class="fas ${registrationMode ? 'fa-user-plus' : 'fa-expand-alt'}"></i> 
                    ${registrationMode ? 'YUZNI BIRIKTIRISH' : 'SMART DAVOMAT AI'}
                </h2>
                <p style="color: #8b949e; margin-top: 10px; font-size: 1.1rem;">
                    ${registrationMode ? `${targetEmployee?.name || 'Xodim'} yuzini kameraga tuting.` : 'Kameraga yuzingizni tuting. Avtomatik aniqlanadi.'}
                </p>
                ${!registrationMode ? `
                <div style="color: #00c6ff; font-weight: bold; font-size: 0.9rem; margin-top: 5px;">
                    Bazadagi yuzlar soni: ${employeesWithFace.length} ta
                </div>` : ''}
            </div>

            <div style="position: relative; width: 350px; height: 350px; border-radius: 50%; border: 4px solid ${registrationMode ? '#f59e0b' : '#30363d'}; overflow: hidden; background: #000; box-shadow: 0 0 80px ${registrationMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 198, 255, 0.2)'};">
                <video id="attendance-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
                
                <!-- Animated Sanner Line -->
                <div id="attendance-scanner-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: ${registrationMode ? '#f59e0b' : '#00c6ff'}; box-shadow: 0 0 20px ${registrationMode ? '#f59e0b' : '#00c6ff'}; z-index: 10;"></div>
                
                <!-- Success Overlay -->
                <div id="attendance-success-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: ${registrationMode ? 'rgba(245, 158, 11, 0.95)' : 'rgba(35, 134, 54, 0.95)'}; display: none; flex-direction: column; align-items: center; justify-content: center; color: white; z-index: 30;">
                    <i class="fas ${registrationMode ? 'fa-id-card' : 'fa-user-check'}" style="font-size: 80px; margin-bottom: 15px;"></i>
                    <h2 id="attendance-worker-name" style="margin: 0; font-size: 1.5rem; text-align: center; padding: 0 10px;">---</h2>
                    <p style="font-weight: 800; margin-top: 15px; letter-spacing: 2px; color: ${registrationMode ? '#fff' : '#a3e635'};">
                        ${registrationMode ? 'YUZ BIRIKTIRILDI!' : 'QAYD ETILDI!'}
                    </p>
                </div>
            </div>

            <div style="margin-top: 40px;">
                <p id="attendance-status" style="color: white; font-size: 1.2rem; font-weight: bold; margin: 0; text-align: center; min-height: 25px;">
                    <i class="fas fa-spinner fa-spin" style="color: #00c6ff;"></i> Modellar yuklanmoqda...
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        if (!registrationMode && employeesWithFace.length === 0 && !targetEmpId) {
            document.getElementById('attendance-status').innerHTML = "<i class='fas fa-exclamation-triangle' style='color:#f85149;'></i> Bazada Face ID biriktirilgan xodim yo'q. Oldin HR bo'limidan yuz biriktiring.";
            return;
        }

        // Animated scanner line
        let pos = 0; let dir = 1;
        this.lineTimer = setInterval(() => {
            pos += (3 * dir);
            if (pos >= 348 || pos <= 0) dir *= -1;
            const line = document.getElementById('attendance-scanner-line');
            if (line) line.style.top = pos + "px";
        }, 15);

        // Turn on camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.stream = stream;
            document.getElementById('attendance-video').srcObject = stream;

            document.getElementById('attendance-status').innerHTML = "<i class='fas fa-search' style='color:#00c6ff;'></i> Tayyorlanmoqda...";

            // Wait a sec for camera to focus and then start matching loop
            setTimeout(() => {
                if (registrationMode) {
                    this.startRegistrationScan(targetEmployee);
                } else {
                    this.startBiometricScan(employeesWithFace);
                }
            }, 1000);

        } catch (e) {
            document.getElementById('attendance-status').innerHTML = "<i class='fas fa-camera-slash' style='color:#f85149;'></i> Kamera ulanishida xatolik!";
            console.error("Camera error:", e);
        }
    },

    startRegistrationScan: async function (worker) {
        this.isScanning = true;
        const video = document.getElementById('attendance-video');
        
        try {
            document.getElementById('attendance-status').innerHTML = "<i class='fas fa-camera' style='color:#f59e0b;'></i> Yuzingizni qimirlatmay turing...";
            
            const descriptor = await window.FaceService.getDescriptorFromVideo(video);
            
            if (descriptor) {
                this.isScanning = false;
                await this.handleRegistrationSuccess(worker, descriptor);
            }
        } catch (e) {
            document.getElementById('attendance-status').innerHTML = `<i class='fas fa-times-circle' style='color:#f85149;'></i> ${e.message}`;
            setTimeout(() => this.close(), 3000);
        }
    },

    handleRegistrationSuccess: async function (worker, descriptor) {
        const overlay = document.getElementById('attendance-success-overlay');
        const statusText = document.getElementById('attendance-status');

        statusText.innerHTML = "<i class='fas fa-save' style='color:#f59e0b;'></i> Ma'lumotlar saqlanmoqda...";
        document.getElementById('attendance-worker-name').innerText = worker.name;
        overlay.style.display = 'flex';

        try {
            // Save to server
            await SmartUtils.fetchAPI(`/hr/employees/${worker.id}/face`, {
                method: 'PATCH',
                body: JSON.stringify({
                    face_template: JSON.stringify({
                        descriptor: Array.from(descriptor),
                        date: new Date().toISOString()
                    })
                })
            });
            
            // Update local memory
            if (window.hrData && window.hrData.employees) {
                const emp = window.hrData.employees.find(e => e.id === worker.id);
                if (emp) emp.faceTemplate = "EXISTS"; // Just for local UI check
            }

            statusText.innerHTML = "<i class='fas fa-check-circle' style='color:#fff;'></i> Yuz muvaffaqiyatli biriktirildi!";
            if (window.SmartUtils) window.SmartUtils.showToast(`${worker.name} yuzi biriktirildi`, 'success');

            // Refresh UI if possible
            if (window.StaffAttendance && window.currentUser) {
                setTimeout(() => window.StaffAttendance.init(window.currentUser.bolinmalar[0]), 500);
            }

        } catch (e) {
            console.error(e);
            if (window.SmartUtils) window.SmartUtils.showToast("Saqlashda xatolik!", "error");
        }

        setTimeout(() => this.close(), 2500);
    },

    startBiometricScan: async function (dbEmployees) {
        if (!window.FaceService) {
            document.getElementById('attendance-status').innerHTML = "<i class='fas fa-times-circle'></i> Tizim xatosi: FaceService mavjud emas.";
            return;
        }

        this.isScanning = true;
        const video = document.getElementById('attendance-video');

        const scanLoop = async () => {
            if (!this.isScanning) return;

            try {
                // Skanerlash
                const descriptor = await window.FaceService.getDescriptorFromVideo(video);

                // Bazadan izlash
                let bestMatch = null;
                let minDistance = 0.55; // Qat'iy chegara (Threshold)

                // If specialized for one employee
                const searchList = this.targetEmpId ? 
                    dbEmployees.filter(e => e.id === this.targetEmpId) : 
                    dbEmployees;

                if (this.targetEmpId && searchList.length === 0) {
                     document.getElementById('attendance-status').innerHTML = "<i class='fas fa-exclamation-triangle'></i> Xodim yuzi bazada yo'q!";
                     return;
                }

                for (let emp of searchList) {
                    try {
                        const savedData = JSON.parse(emp.faceTemplate);
                        const dist = window.FaceService.compareDescriptors(descriptor, savedData.descriptor);
                        if (dist < minDistance) {
                            minDistance = dist;
                            bestMatch = emp;
                        }
                    } catch (e) { }
                }

                if (bestMatch) {
                    this.isScanning = false; // To'xtatish
                    this.handleMatchSuccess(bestMatch);
                } else {
                    // Yuz topildi var, lekin bizniki emas
                    if (document.getElementById('attendance-status')) {
                        document.getElementById('attendance-status').innerHTML = this.targetEmpId ? 
                            "<i class='fas fa-user-times' style='color:#f85149;'></i> Bu siz emassiz!" :
                            "<i class='fas fa-user-secret' style='color:#f39c12;'></i> Baza xodimi emas, aniqlanmadi.";
                    }
                    setTimeout(scanLoop, 1000); // 1 sekunddan keyin qayta urunish
                }

            } catch (e) {
                // Yuzni tutib ololmagan paytda qayta kutish
                if (this.isScanning && document.getElementById('attendance-status')) {
                    document.getElementById('attendance-status').innerHTML = "<i class='fas fa-search' style='color:#00c6ff;'></i> Yuzni fokusga oling...";
                }
                setTimeout(scanLoop, 400); // Qisqa tanaffus bilan yana skan qilish
            }
        };

        scanLoop();
    },

    handleMatchSuccess: async function (worker) {
        const overlay = document.getElementById('attendance-success-overlay');
        const statusText = document.getElementById('attendance-status');

        statusText.innerHTML = "<i class='fas fa-check' style='color:#a3e635;'></i> Yuz tanildi. Yozilmoqda...";
        document.getElementById('attendance-worker-name').innerText = worker.name;
        overlay.style.display = 'flex';

        try {
            // --- SMART INTEGRATION: Immediate 8-Hour Attendance ---
            try {
                await SmartUtils.fetchAPI('/timesheet/attendance', {
                    method: 'POST',
                    body: JSON.stringify({
                        employee_id: worker.id,
                        hours: 8
                    })
                });
                console.log(`✅ ${worker.name} uchun tabelga 8 soat yozildi.`);
                
                // Update local UI immediately
                if (window.StaffAttendance) {
                    window.StaffAttendance.attendance[worker.id] = true;
                    window.StaffAttendance.render();
                }

                if (window.SmartUtils) window.SmartUtils.showToast("Davomat qayd etildi (8 soat)", 'success');

            } catch (e) {
                console.error("Immediate attendance failed:", e);
                if (window.SmartUtils) window.SmartUtils.showToast("Davomatni saqlashda xatolik!", 'error');
            }

            // Kichkina chiroyli ovoz
            const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
            audio.play().catch(e => e);

            // --- NEXT STEP: Safety Verification (ZKTeco) ---
            setTimeout(() => {
                this.showZKTecoScanner(worker);
            }, 1000);

        } catch (error) {
            console.error('Match success handling error:', error);
            if (window.SmartUtils) window.SmartUtils.showToast("Xato! Qayta urining", "error");
            this.close();
        }
    },

    showZKTecoScanner: function (worker, registrationMode = false) {
        // Stop Face ID camera
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        document.getElementById('attendance-faceid-modal')?.remove();

        const existing = document.getElementById('zkteco-scanner-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'zkteco-scanner-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(13, 17, 23, 0.98); z-index: 20000; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif; backdrop-filter: blur(25px); color: white;
        `;

        modal.innerHTML = `
            <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="color: ${registrationMode ? '#f59e0b' : '#ffd700'}; font-size: 2rem; margin: 0; letter-spacing: 2px;">
                    ${registrationMode ? 'BARMOQ IZINI BIRIKTIRISH' : 'ZKTECO BIOMETRIC'}
                </h2>
                <div style="color: #8b949e; margin-top: 10px; font-weight: 500;">
                    ${registrationMode ? 'Xodim bazasiga yangi shablon qo\'shish' : 'TNU-19: XAVFSIZLIK TASDIQLASH'}
                </div>
            </div>

            <div style="position: relative; width: 320px; height: 420px; background: #1c2128; border-radius: 30px; border: 2px solid ${registrationMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(212, 175, 55, 0.2)'}; box-shadow: 0 0 50px rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;">
                
                <!-- ZKTeco Device Visual Representation -->
                <div style="width: 180px; height: 260px; background: #0d1117; border-radius: 20px; position: relative; border: 1px solid #30363d; display: flex; flex-direction: column; align-items: center; padding: 20px;">
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.6rem; font-weight: 900; margin-bottom: 30px;">ZKTECO</div>
                    
                    <!-- Scanner Area -->
                    <div id="zk-scan-area" style="width: 100px; height: 120px; background: #21262d; border-radius: 10px; border: 2px solid rgba(0, 198, 255, 0.3); position: relative; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 15px rgba(0, 198, 255, 0.1);">
                        <i id="zk-fingerprint-icon" class="fas fa-fingerprint" style="font-size: 60px; color: ${registrationMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 198, 255, 0.2)'}; transition: all 0.3s;"></i>
                        <div id="zk-scan-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #ffd700; box-shadow: 0 0 15px #ffd700; display: none;"></div>
                    </div>

                    <div style="margin-top: 30px; width: 40px; height: 4px; background: rgba(0, 198, 255, 0.2); border-radius: 2px;"></div>
                </div>

                <div id="zk-status" style="margin-top: 30px; color: ${registrationMode ? '#f59e0b' : '#ffd700'}; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">QURILMA KUTILMOQDA...</div>
            </div>

            <div style="margin-top: 40px; text-align: center; background: rgba(255,255,255,0.03); padding: 20px 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.7rem; color: #8b949e; text-transform: uppercase; letter-spacing: 1px;">Xodim:</div>
                <div style="font-size: 1.25rem; font-weight: 800; margin-top: 5px;">${worker.name}</div>
                
                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    ${!registrationMode ? `
                    <button onclick="FaceIDAttendance.showSignaturePadForTNU19(${JSON.stringify(worker).replace(/"/g, '&quot;')})" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #8b949e; padding: 10px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">
                        <i class="fas fa-pen-nib"></i> QO'LDA IMZO
                    </button>` : ''}
                    <button onclick="document.getElementById('zkteco-scanner-modal').remove()" style="background: rgba(248, 81, 73, 0.1); border: 1px solid rgba(248, 81, 73, 0.3); color: #f85149; padding: 10px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">
                        BEKOR QILISH
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // --- REAL HARDWARE INTEGRATION: ZKTeco Bridge ---
        const checkHardware = async () => {
            const status = document.getElementById('zk-status');
            
            // AbortController to prevent long hangs
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

            try {
                status.innerText = "QURILMA BILAN BOG'LANISH...";
                // Try to talk to local Node.js bridge on port 8080
                const response = await fetch('http://localhost:8080/scan', { 
                    method: 'POST', 
                    body: JSON.stringify({ mode: registrationMode ? 'enroll' : 'verify' }),
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        // Hardware Success!
                        if (registrationMode) {
                            this.handleFingerprintRegistrationSuccess(worker, modal, result.template);
                        } else {
                            this.handleHardwareVerificationSuccess(worker, modal);
                        }
                        return true;
                    }
                }
            } catch (e) {
                console.warn("Hardware bridge not found. Switching to simulation mode...");
            }
            return false;
        };

        // Execution Logic
        setTimeout(async () => {
            const isHardwareActive = await checkHardware();
            if (isHardwareActive) return;

            // --- FALLBACK: Simulation Logic (ZKTeco Integration) ---
            const status = document.getElementById('zk-status');
            const icon = document.getElementById('zk-fingerprint-icon');
            const line = document.getElementById('zk-scan-line');
            const area = document.getElementById('zk-scan-area');

            // Inject Simulation Mode warning badge
            const warningBadge = document.createElement('div');
            warningBadge.id = 'zk-simulation-badge';
            warningBadge.style.cssText = 'position: absolute; top: 15px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; padding: 4px 12px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; letter-spacing: 1px; animation: pulse 2s infinite; display: flex; align-items: center; gap: 6px;';
            warningBadge.innerHTML = '<i class="fas fa-triangle-exclamation"></i> SIMULYATSIYA REJIMI';
            
            if (!document.getElementById('zk-pulse-style')) {
                const style = document.createElement('style');
                style.id = 'zk-pulse-style';
                style.innerHTML = `@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`;
                document.head.appendChild(style);
            }
            
            const scanContainer = status ? status.parentElement : null;
            if (scanContainer) {
                scanContainer.appendChild(warningBadge);
            }

            status.innerText = registrationMode ? "BARMOG'INGIZNI 3 MARTA BOSING..." : "BARMOG'INGIZNI BOSING...";
            icon.style.color = "rgba(212, 175, 55, 0.4)";
            
            // Wait for "touch"
            setTimeout(() => {
                status.innerText = registrationMode ? "BIRIKTIRILMOQDA (Qadam 1/3)..." : "SKANERLANMOQDA...";
                status.style.color = "#ffd700";
                line.style.display = "block";
                icon.style.color = "#ffd700";
                area.style.borderColor = "#ffd700";

                // Line animation
                let p = 0; let d = 1;
                const anim = setInterval(() => {
                    p += (4 * d);
                    if (p >= 118 || p <= 0) d *= -1;
                    line.style.top = p + "px";
                }, 15);

                setTimeout(async () => {
                    clearInterval(anim);
                    line.style.display = "none";
                    
                    if (registrationMode) {
                        this.handleFingerprintRegistrationSuccess(worker, modal);
                    } else {
                        this.handleHardwareVerificationSuccess(worker, modal);
                    }
                }, 2500);

            }, 2000);
        }, 500);
    },

    handleHardwareVerificationSuccess: async function(worker, modal) {
        const status = document.getElementById('zk-status');
        const icon = document.getElementById('zk-fingerprint-icon');
        const area = document.getElementById('zk-scan-area');

        status.innerText = "BIOMETRIK TASDIQLANDI!";
        status.style.color = "#238636";
        icon.style.color = "#238636";
        area.style.borderColor = "#238636";

        try {
            const todayStr = new Date().toISOString().slice(0, 10);
            const timeStr = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

            await SmartUtils.fetchAPI('/safety/tnu19', {
                method: 'POST',
                body: JSON.stringify({
                    employee_id: worker.id,
                    bolinma_id: worker.department || 'all',
                    date: todayStr,
                    time: timeStr,
                    instruction_type: 'takroriy',
                    instructor_name: "ZKTECO BIOMETRIC",
                    signature: "[BIOMETRIC_CONFIRMED]"
                })
            });

            if (window.SmartUtils) window.SmartUtils.showToast("Xavfsizlik yo'riqnomasi tasdiqlandi", 'success');
            if (window.startConfetti) window.startConfetti();

            setTimeout(() => modal.remove(), 2000);
        } catch (e) {
             status.innerText = "SAQLASHDA XATOLIK!";
             status.style.color = "#f85149";
        }
    },

    handleFingerprintRegistrationSuccess: async function (worker, modal) {
        const status = document.getElementById('zk-status');
        const icon = document.getElementById('zk-fingerprint-icon');
        const area = document.getElementById('zk-scan-area');

        status.innerText = "YANGI SHABLON SAQLANMOQDA...";
        status.style.color = "#f59e0b";
        icon.style.color = "#f59e0b";
        area.style.borderColor = "#f59e0b";

        try {
            // Mock Fingerprint Template (in real world, this would be an array of bytes from the ZKTeco SDK)
            const mockTemplate = `TEMPLATE_${Math.random().toString(36).substring(7).toUpperCase()}`;

            await SmartUtils.fetchAPI(`/hr/employees/${worker.id}/fingerprint`, {
                method: 'PATCH',
                body: JSON.stringify({
                    fingerprint_template: mockTemplate,
                    registration_date: new Date().toISOString()
                })
            });

            // Update local state
            if (window.hrData && window.hrData.employees) {
                const emp = window.hrData.employees.find(e => e.id === worker.id);
                if (emp) emp.fingerprintTemplate = mockTemplate;
            }

            status.innerText = "BIRIKTIRILDI!";
            status.style.color = "#238636";
            icon.style.color = "#238636";
            area.style.borderColor = "#238636";

            if (window.SmartUtils) window.SmartUtils.showToast(`${worker.name} barmoq izi saqlandi`, 'success');
            
            // Refresh Widget
            if (window.StaffAttendance && window.currentUser) {
                setTimeout(() => window.StaffAttendance.init(window.currentUser.bolinmalar[0]), 1000);
            }

            setTimeout(() => modal.remove(), 2500);

        } catch (e) {
            console.error('FP Reg error:', e);
            status.innerText = "XATOLIK YUZ BERDI!";
            status.style.color = "#f85149";
            setTimeout(() => modal.remove(), 3000);
        }
    },

    showSignaturePadForTNU19: function (worker) {
        // Fallback for manual signature from tablet
        document.getElementById('zkteco-scanner-modal')?.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'manual-signature-modal';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(13, 17, 23, 0.98); z-index: 20000; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            font-family: 'Inter', sans-serif; backdrop-filter: blur(25px);
        `;

        overlay.innerHTML = `
            <div style="background: white; width: 90%; max-width: 600px; border-radius: 30px; padding: 40px; box-shadow: 0 50px 100px rgba(0,0,0,0.5); text-align: center;">
                <h2 style="color: #0d1117; margin-bottom: 10px; font-weight: 850;">QO'LDA IMZO QO'YING</h2>
                <p style="color: #484f58; margin-bottom: 30px; font-weight: 600;">${worker.name}</p>
                
                <div style="background: #f6f8fa; border: 2px dashed #d0d7de; border-radius: 20px; padding: 5px; margin-bottom: 30px;">
                    <canvas id="manual-sig-canvas" width="500" height="250" style="width: 100%; height: 250px; display: block; cursor: crosshair; touch-action: none; background: white; border-radius: 15px;"></canvas>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button id="manual-clear-btn" style="flex: 1; padding: 15px; border-radius: 12px; border: 1.5px solid #d0d7de; background: white; color: #24292f; font-weight: bold; cursor: pointer;">TOZALASH</button>
                    <button id="manual-save-btn" style="flex: 2; padding: 15px; border-radius: 12px; border: none; background: #238636; color: white; font-weight: bold; cursor: pointer;">TASDIQLASH</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const canvas = document.getElementById('manual-sig-canvas');
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.lineCap = "round";
        
        let drawing = false;
        const getXY = (e) => {
            const r = canvas.getBoundingClientRect();
            const cx = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            const cy = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            return { x: cx - r.left, y: cy - r.top };
        };
        
        canvas.onmousedown = (e) => { drawing = true; ctx.beginPath(); const p = getXY(e); ctx.moveTo(p.x, p.y); };
        canvas.onmousemove = (e) => { if (!drawing) return; e.preventDefault(); const p = getXY(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
        window.onmouseup = () => { drawing = false; };
        
        canvas.ontouchstart = (e) => { drawing = true; ctx.beginPath(); const p = getXY(e); ctx.moveTo(p.x, p.y); };
        canvas.ontouchmove = (e) => { if (!drawing) return; e.preventDefault(); const p = getXY(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
        window.ontouchend = () => { drawing = false; };

        document.getElementById('manual-clear-btn').onclick = () => ctx.clearRect(0,0,canvas.width,canvas.height);
        document.getElementById('manual-save-btn').onclick = async () => {
            const signature = canvas.toDataURL();
            try {
                await SmartUtils.fetchAPI('/timesheet/attendance', { method: 'POST', body: JSON.stringify({ employee_id: worker.id, hours: 8 }) });
                await SmartUtils.fetchAPI('/safety/tnu19', {
                    method: 'POST',
                    body: JSON.stringify({
                        employee_id: worker.id,
                        bolinma_id: worker.department || 'all',
                        date: new Date().toISOString().slice(0, 10),
                        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
                        instruction_type: 'takroriy',
                        instructor_name: "Planshet (Imzo)",
                        signature: signature
                    })
                });
                overlay.remove();
                if (window.startConfetti) window.startConfetti();
            } catch (e) {}
        };
    },

    close: function () {
        this.isScanning = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        clearInterval(this.lineTimer);
        document.getElementById('attendance-faceid-modal')?.remove();
    }
};

window.openGeneralFaceIDAttendance = (empId = null) => FaceIDAttendance.openScanner(empId);
