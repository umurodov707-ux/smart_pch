/**
 * SMART MOBILE FIELD ASSISTANT
 * Field-to-Office Integration: Camera, GPS & Voice for inspectors
 */

const MobileField = {
    isOpen: false,
    currentStream: null,

    open: function() {
        this.isOpen = true;
        this.render();
    },

    close: function() {
        this.stopCamera();
        this.isOpen = false;
        const modal = document.getElementById('mobile-field-modal');
        if (modal) modal.remove();
    },

    render: function() {
        const modalHtml = `
        <div id="mobile-field-modal" class="modern-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #020617; z-index: 100001; display: flex; flex-direction: column; animation: slideUp 0.4s ease-out;">
            <!-- Mobile Header -->
            <div style="padding: 15px 20px; background: #1e293b; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #d4af37;">
                <h3 style="margin: 0; color: #fff; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-camera" style="color: #ffd700;"></i> MOBIL NAZORAT
                </h3>
                <button onclick="MobileField.close()" style="background: none; border: none; color: #94a3b8; font-size: 1.5rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Preview / Camera Area -->
            <div id="field-camera-wrap" style="flex: 1; background: #000; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <video id="field-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                <canvas id="field-canvas" style="display:none;"></canvas>
                
                <!-- GPS & Time Overlay -->
                <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 10px; color: #fff; font-size: 0.75rem; border-left: 3px solid #ffd700;">
                    <div id="field-gps-status"><i class="fas fa-location-dot"></i> GPS aniqlanmoqda...</div>
                    <div id="field-timestamp"></div>
                </div>

                <!-- Shutter Button -->
                <button id="shutter-btn" onclick="MobileField.takePhoto()" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 70px; height: 70px; border-radius: 50%; border: 5px solid #fff; background: rgba(255,255,255,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: #fff;"></div>
                </button>
            </div>

            <!-- Form Area (Initially hidden) -->
            <div id="field-form-wrap" style="display: none; padding: 20px; background: #0f172a; color: #fff; flex: 1; overflow-y: auto;">
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <img id="field-photo-preview" style="width: 100px; height: 130px; object-fit: cover; border-radius: 10px; border: 2px solid #3b82f6;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0; color: #ffd700;">Nuqson Topildi</h4>
                        <p id="field-meta-info" style="font-size: 0.8rem; color: #94a3b8; margin: 5px 0;"></p>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 8px;">Tavsif (Ovozli yoki qo'lda):</label>
                    <div style="position: relative;">
                        <textarea id="field-desc" placeholder="Nuqson haqida qisqacha..." style="width: 100%; background: #1e293b; border: 1px solid #3b82f6; border-radius: 12px; padding: 15px; color: #fff; min-height: 100px;"></textarea>
                        <button onclick="MobileField.startVoice()" style="position: absolute; right: 10px; bottom: 10px; background: #3b82f6; border: none; width: 40px; height: 40px; border-radius: 50%; color: #fff; cursor: pointer;">
                            <i class="fas fa-microphone"></i>
                        </button>
                    </div>
                </div>

                <button onclick="MobileField.submitReport()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: #fff; border-radius: 14px; font-weight: 800; font-size: 1rem; cursor: pointer; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);">
                    OFFISGA YUBORISH <i class="fas fa-paper-plane" style="margin-left: 10px;"></i>
                </button>
                <button onclick="MobileField.reset()" style="width: 100%; margin-top: 15px; background: transparent; border: 1px solid #475569; color: #94a3b8; padding: 10px; border-radius: 10px; font-size: 0.9rem;">
                    Qayta rasmga olish
                </button>
            </div>

            <style>
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                #shutter-btn:active { transform: translateX(-50%) scale(0.9); }
            </style>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.initCamera();
        this.updateGPS();
        setInterval(() => {
            const el = document.getElementById('field-timestamp');
            if (el) el.textContent = new Date().toLocaleString('uz-UZ');
        }, 1000);
    },

    initCamera: async function() {
        try {
            const constraints = { video: { facingMode: "environment" } };
            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            const video = document.getElementById('field-video');
            if (video) video.srcObject = this.currentStream;
        } catch (err) {
            alert("Kamera ochilmadi. Iltimos ruxsat bering.");
            this.close();
        }
    },

    stopCamera: function() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
        }
    },

    takePhoto: function() {
        const video = document.getElementById('field-video');
        const canvas = document.getElementById('field-canvas');
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        const photoData = canvas.toDataURL('image/jpeg');
        document.getElementById('field-photo-preview').src = photoData;
        
        document.getElementById('field-camera-wrap').style.display = 'none';
        document.getElementById('field-form-wrap').style.display = 'block';
        
        this.stopCamera();
    },

    updateGPS: function() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(pos => {
            const el = document.getElementById('field-gps-status');
            const meta = document.getElementById('field-meta-info');
            const info = `Koordinatalar: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
            if (el) el.innerHTML = `<i class="fas fa-location-dot" style="color:#ffd700"></i> Localizatsiya: OK`;
            if (meta) meta.textContent = info;
        }, err => {
            const el = document.getElementById('field-gps-status');
            if (el) el.innerHTML = `<i class="fas fa-times-circle" style="color:#ef4444"></i> GPS xatosi`;
        });
    },

    startVoice: function() {
        if (!('webkitSpeechRecognition' in window)) return;
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'uz-UZ';
        recognition.onresult = (event) => {
            document.getElementById('field-desc').value += event.results[0][0].transcript;
        };
        recognition.start();
    },

    submitReport: function() {
        const desc = document.getElementById('field-desc').value;
        if (!desc) return alert("Iltimos tavsif yozing");

        if (window.SmartUtils && window.SmartUtils.showToast) {
            SmartUtils.showToast("Hisobot Offisga (Dispetcherga) yuborildi!", "success");
        }
        
        // Simulating data save
        setTimeout(() => {
            this.close();
            if (window.ModernAnalyticsAI && window.ModernAnalyticsAI.isOpen) window.ModernAnalyticsAI.fetchRealStats();
        }, 1000);
    },

    reset: function() {
        document.getElementById('field-camera-wrap').style.display = 'flex';
        document.getElementById('field-form-wrap').style.display = 'none';
        this.initCamera();
    }
};

window.MobileField = MobileField;
