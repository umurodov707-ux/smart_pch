window.addEventListener('DOMContentLoaded', () => {
    // 00. Check protocol
    if (window.location.protocol === 'file:') {
        const warning = document.createElement('div');
        warning.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; text-align:center; padding:20px; font-family:sans-serif;';
        warning.innerHTML = `
            <h1 style="background:var(--gold-gradient); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:20px; font-weight:900;">DIQQAT! TIZIMGA ULANISH</h1>
            <p style="font-size:1.2rem; margin-bottom:30px; color:var(--text-silver);">Siz tizimni brauzer xavfsizlik cheklovlari bilan ochdingiz.<br>Tizim ma'lumotlar bazasi va barcha funksiyalar server orqali ishlashi shart!</p>
            <div style="background:rgba(212,175,55,0.05); padding:20px; border-radius:15px; border-left:5px solid var(--accent-gold); margin-bottom:30px; text-align:left; border:1px solid var(--glass-border);">
                <p style="margin-bottom:10px; color:var(--accent-gold);"><strong>Qanday qilib to'g'ri ishga tushirish kerak?</strong></p>
                <ol style="color:var(--text-silver);">
                    <li>Terminalda <code>npm start</code> yoki <code>AUTO_START_SERVER.bat</code> ni ishga tushiring</li>
                    <li>Brauzerda <code>localhost:4000</code> yoki <code>localhost:6878</code> manzilini oching</li>
                </ol>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <a href="http://localhost:4000" class="btn-primary" style="display:inline-flex; text-decoration:none; background: #10b981; border-color: #10b981;">PORT 4000 GA O'TISH</a>
                <a href="http://localhost:6878" class="btn-primary" style="display:inline-flex; text-decoration:none;">PORT 6878 GA O'TISH</a>
            </div>
        `;
        document.body.appendChild(warning);
        return; // Stop further execution
    }

    // 0. Agar port boshqa bo'lsa va lokal server ishlamayotgan bo'lsa, ogohlantirish oynasini chiqarish
    if (window.location.hostname === 'localhost' && window.location.port === '5500') {
        const warning = document.createElement('div');
        warning.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.95); z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; text-align:center; font-family:"Inter",sans-serif; padding:20px;';
        warning.innerHTML = `
            <img src="img/logo.png" style="width:120px; margin-bottom:20px;">
            <h1 style="color:var(--accent-gold); margin-bottom:10px;">LOKAL SERVER PORT XATOLIGI</h1>
            <p style="color:#94a3b8; max-width:500px; margin-bottom:20px;">Siz ushbu sahifani Visual Studio Code "Live Server" (Port: 5500) orqali ochdingiz. Ushbu rejimda API va Socket.io ishlamaydi!</p>
            <div style="background:rgba(212,175,55,0.05); padding:20px; border-radius:15px; border-left:5px solid var(--accent-gold); margin-bottom:30px; text-align:left; border:1px solid var(--glass-border);">
                <p style="margin-bottom:10px; color:var(--accent-gold);"><strong>Qanday qilib to'g'ri ishga tushirish kerak?</strong></p>
                <ol style="color:var(--text-silver);">
                    <li>Terminalda <code>npm start</code> yoki <code>AUTO_START_SERVER.bat</code> ni ishga tushiring</li>
                    <li>Brauzerda <code>localhost:4000</code> yoki <code>localhost:6878</code> manzilini oching</li>
                </ol>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <a href="http://localhost:4000" class="btn-primary" style="display:inline-flex; text-decoration:none; background: #10b981; border-color: #10b981;">PORT 4000 GA O'TISH</a>
                <a href="http://localhost:6878" class="btn-primary" style="display:inline-flex; text-decoration:none;">PORT 6878 GA O'TISH</a>
            </div>
        `;
        document.body.appendChild(warning);
        return; // Stop further execution
    }

    // 1. Avval masofa tizimini ishga tushirish
    if (typeof initMasofaSystem === 'function') {
        initMasofaSystem();
    }

    // 2. Umumiy tizimni ishga tushirish
    if (typeof initSmartSystem === 'function') {
        initSmartSystem();
    }

    // 3. Server Monitoring (Always Online)
    if (window.SmartUtils && window.SmartUtils.startServerWatchdog) {
        window.SmartUtils.startServerWatchdog();
    }

    // Set dynamic copyright year
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 3. HR va TNU-19 ma'lumotlarini yuklash (Faqat login qilingan bo'lsa)
    (async () => {
        if (window.Auth && window.Auth.isLoggedIn()) {
            if (typeof initHRData === 'function') {
                await initHRData();
            }
            if (typeof loadTNU19Records === 'function') {
                await loadTNU19Records();
            }
            console.log('✅ System data initialized for logged in user');
        } else {
            console.log('ℹ️ Waiting for login to initialize data');
        }
    })();
});
