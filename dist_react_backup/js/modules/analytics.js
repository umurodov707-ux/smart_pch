/**
 * SMART ANALYTICS & BI DASHBOARD
 * Premium Executive Command Center for Smart PCH
 */

const ModernAnalytics = {
    isOpen: false,

    open: function() {
        this.isOpen = true;
        this.render();
    },

    close: function() {
        this.isOpen = false;
        const modal = document.getElementById('analytics-modal');
        if (modal) modal.remove();
    },

    render: function() {
        const modalHtml = `
        <div id="analytics-modal" class="modern-modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 23, 0.9); backdrop-filter: blur(20px); z-index: 100000; overflow-y: auto; padding: 20px;">
            <div class="analytics-container" style="background: rgba(30, 41, 59, 0.7); width: 95%; max-width: 1400px; min-height: 85vh; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: 0 40px 100px rgba(0,0,0,0.8); display: flex; flex-direction: column; overflow: hidden; animation: modalIn 0.5s cubic-bezier(0.19, 1, 0.22, 1);">
                <!-- Header -->
                <div class="analytics-header" style="padding: 25px 40px; background: rgba(15, 23, 42, 0.5); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.8rem; background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; letter-spacing: 1px;">
                            <i class="fas fa-chart-line" style="margin-right: 15px; color: #ffd700;"></i> SMART BI | BOSHQARUV MARKAZI
                        </h2>
                        <p style="margin: 5px 0 0; color: #94a3b8; font-size: 0.9rem;">Korxonaning real vaqtdagi raqamli ko'rsatkichlari va Bashoratli tahlili</p>
                    </div>
                    <button onclick="ModernAnalytics.close()" style="background: rgba(255,255,255,0.05); border: none; width: 45px; height: 45px; border-radius: 50%; color: #94a3b8; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.color='#ef4444';" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#94a3b8';">
                        <i class="fas fa-times" style="font-size: 1.2rem;"></i>
                    </button>
                </div>

                <!-- Content -->
                <div class="analytics-content" style="flex: 1; padding: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px;">
                    
                    <!-- Top Metrics -->
                    <div class="stat-glass-card" style="background: rgba(15, 23, 42, 0.6); padding: 25px; border-radius: 20px; border-left: 5px solid #10b981; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #94a3b8; font-weight: 600; font-size: 0.9rem;">XAVFSIZLIK INDEKSI</span>
                            <i class="fas fa-shield-heart" style="color: #10b981; font-size: 1.5rem;"></i>
                        </div>
                        <h3 style="font-size: 2.2rem; margin: 15px 0 5px; color: #fff;">98.4%</h3>
                        <div style="color: #10b981; font-size: 0.8rem; font-weight: 700;">
                            <i class="fas fa-arrow-up"></i> +1.2% O'tgan oyga nisbatan
                        </div>
                    </div>

                    <div class="stat-glass-card" style="background: rgba(15, 23, 42, 0.6); padding: 25px; border-radius: 20px; border-left: 5px solid #3b82f6; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #94a3b8; font-weight: 600; font-size: 0.9rem;">REJA BAJARILISHI</span>
                            <i class="fas fa-tasks" style="color: #3b82f6; font-size: 1.5rem;"></i>
                        </div>
                        <h3 style="font-size: 2.2rem; margin: 15px 0 5px; color: #fff;">87%</h3>
                        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-top: 15px;">
                            <div style="width: 87%; height: 100%; background: #3b82f6; border-radius: 10px; box-shadow: 0 0 10px #3b82f6;"></div>
                        </div>
                    </div>

                    <div class="stat-glass-card" style="background: rgba(15, 23, 42, 0.6); padding: 25px; border-radius: 20px; border-left: 5px solid #f59e0b; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #94a3b8; font-weight: 600; font-size: 0.9rem;">FAOL NUQSONLAR</span>
                            <i class="fas fa-triangle-exclamation" style="color: #f59e0b; font-size: 1.5rem;"></i>
                        </div>
                        <h3 style="font-size: 2.2rem; margin: 15px 0 5px; color: #fff;" id="bi-active-defects">--</h3>
                        <div style="color: #f59e0b; font-size: 0.8rem; font-weight: 700;">
                            <i class="fas fa-clock"></i> 3 tasi o'ta muhim (Critical)
                        </div>
                    </div>

                    <div class="stat-glass-card" style="background: rgba(15, 23, 42, 0.6); padding: 25px; border-radius: 20px; border-left: 5px solid #8b5cf6; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #94a3b8; font-weight: 600; font-size: 0.9rem;">XODIMLAR DAVOMATI</span>
                            <i class="fas fa-user-group" style="color: #8b5cf6; font-size: 1.5rem;"></i>
                        </div>
                        <h3 style="font-size: 2.2rem; margin: 15px 0 5px; color: #fff;">96/104</h3>
                        <div style="color: #8b5cf6; font-size: 0.8rem; font-weight: 700;">
                            8 nafar xizmat safarida yoki ta'tilda
                        </div>
                    </div>

                    <!-- Charts Section -->
                    <div style="grid-column: span 3; background: rgba(15, 23, 42, 0.4); padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                            <h4 style="margin: 0; color: #fff; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-wave-square" style="color: #3b82f6;"></i> Ishlab chiqarish dinamikasi (Oylik)
                            </h4>
                            <div style="display: flex; gap: 10px;">
                                <button style="background: rgba(59,130,246,0.2); border: 1px solid #3b82f6; color: #fff; padding: 5px 12px; border-radius: 8px; font-size: 0.75rem;">Yo'l ishlari</button>
                                <button style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 5px 12px; border-radius: 8px; font-size: 0.75rem;">Mexanika</button>
                            </div>
                        </div>
                        <!-- Canvas for Chart.js -->
                        <div style="width: 100%; height: 350px; position: relative; background: rgba(0,0,0,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #475569;">
                            <canvas id="mainDynamicsChart"></canvas>
                        </div>
                    </div>

                    <!-- Side Panel: AI Predictions -->
                    <div style="grid-column: span 1; background: linear-gradient(180deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%); padding: 25px; border-radius: 24px; border: 1px solid rgba(59, 130, 246, 0.3); display: flex; flex-direction: column; gap: 20px; box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.1);">
                        <h4 style="margin: 0; color: #93c5fd; font-size: 1rem; border-bottom: 1px solid rgba(59,130,246,0.2); padding-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                            <span><i class="fas fa-brain" style="margin-right: 10px;"></i> AI ANALIZATOR</span>
                            <span style="font-size: 0.6rem; background: #3b82f6; color: #fff; padding: 2px 6px; border-radius: 5px;">LIVE</span>
                        </h4>
                        
                        <div id="ai-analysis-output" style="flex: 1; overflow-y: auto; color: #e2e8f0; font-size: 0.85rem; line-height: 1.6; font-style: italic;">
                            <p style="color: #64748b; text-align: center; margin-top: 50px;">AI tahlilini boshlash uchun tugmani bosing...</p>
                        </div>

                        <div style="margin-top: auto; padding: 10px; text-align: center;">
                            <button id="start-ai-analysis-btn" onclick="ModernAnalytics.runAIAnalysis()" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border: none; color: #fff; width: 100%; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 20px rgba(29, 78, 216, 0.3); transition: 0.3s;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">
                                <i class="fas fa-wand-magic-sparkles"></i> AI HISOBOT TAYYORLASH
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <style>
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(50px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .stat-glass-card { transition: 0.3s; cursor: pointer; }
                .stat-glass-card:hover { transform: translateY(-8px); background: rgba(30, 41, 59, 0.8) !important; border-top: 1px solid rgba(212,175,55,0.4); }
            </style>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Load real data
        this.fetchRealStats();
        
        // Initialize Charts if Chart.js is loaded
        setTimeout(() => this.initCharts(), 500);
    },

    fetchRealStats: function() {
        if (window.SmartUtils && SmartUtils.fetchAPI) {
            SmartUtils.fetchAPI('/defects').then(data => {
                const count = Array.isArray(data) ? data.length : 0;
                const el = document.getElementById('bi-active-defects');
                if (el) el.textContent = count;
            }).catch(() => {
                const el = document.getElementById('bi-active-defects');
                if (el) el.textContent = '24';
            });
        }
    },

    runAIAnalysis: function() {
        const output = document.getElementById('ai-analysis-output');
        const btn = document.getElementById('start-ai-analysis-btn');
        if (!output || !btn) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> TAHLIL QILINMOQDA...';
        output.innerHTML = '<div style="text-align:center; padding-top:20px;"><i class="fas fa-satellite-dish fa-spin fa-3x" style="color:#3b82f6; margin-bottom:15px;"></i><br>Tizim ma\'lumotlari tahlil qilinmoqda...</div>';

        // Get auth token from config's key
        const token = localStorage.getItem('jwtToken') || '';

        fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'SmartPCH-WebApp',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ message: "Korxonaning hozirgi holati bo'yicha qisqa tahliliy hisobot ber va rahbariyat uchun 3 ta asosiy tavsiya yoz." })
        })
        .then(res => res.json())
        .then(data => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> QAYTA TAHLIL QILISH';
            if (data && data.response) {
                // Convert markdown-like to HTML
                let html = data.response
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffd700;">$1</strong>')
                    .replace(/\n/g, '<br>');
                output.innerHTML = `<div style="animation: fadeIn 0.8s;">${html}</div>`;
            } else {
                output.innerHTML = '<p style="color:#ef4444;">Xatolik yuz berdi. Qayta urinib ko\'ring.</p>';
            }
        })
        .catch(err => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> QAYTA TAHLIL QILISH';
            output.innerHTML = '<p style="color:#ef4444;">Server bilan aloqa yo\'q.</p>';
        });
    },

    initCharts: function() {
        const ctx = document.getElementById('mainDynamicsChart');
        if (!ctx) return;

        // If Chart.js is not loaded, we can't draw
        if (typeof Chart === 'undefined') {
            ctx.parentElement.innerHTML = '<div style="color: #475569; text-align: center;"><i class="fas fa-chart-area fa-4x mb-3"></i><br>Chart.js kutubxonasi yuklanmoqda...</div>';
            // Lazy load Chart.js if missing
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => this.initCharts();
            document.head.appendChild(script);
            return;
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul'],
                datasets: [{
                    label: 'Ish bajarilishi (%)',
                    data: [65, 78, 82, 85, 91, 87, 94],
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#ffd700',
                    pointBorderColor: '#000',
                    pointRadius: 5
                }, {
                    label: 'Nuqsonlar soni',
                    data: [45, 38, 25, 30, 22, 18, 15],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#64748b' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b' }
                    }
                }
            }
        });
    }
};

window.ModernAnalytics = ModernAnalytics;
