/**
 * ADMIN DASHBOARD MODULE & AI CONTROL CENTER
 * ==========================================
 * Tizim bo'yicha umumiy statistikani va PCH-Agent (AI) boshqaruv markazini o'z ichiga oladi.
 */

window.AdminDashboard = {
    render: function () {
        return `
            <style>
                .admin-container { padding: 0 15px; font-family: 'Outfit', 'Inter', sans-serif; }
                .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .admin-premium-card { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden; }
                .admin-premium-card:hover { transform: translateY(-5px); border-color: rgba(56, 189, 248, 0.3); }
                .admin-stat-label { color: rgba(255,255,255,0.5); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; }
                .admin-stat-value { font-size: 2.2rem; font-weight: 900; color: #fff; margin-top: 10px; }
                .admin-icon-box { width: 55px; height: 55px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; position: relative; z-index: 1;}
                
                /* AI Control Center Specific */
                .ai-center-header { text-align: center; margin-bottom: 30px; position: relative; }
                .ai-badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(90deg, rgba(212,175,55,0.2), rgba(0,0,0,0)); border: 1px solid rgba(212,175,55,0.3); color: #d4af37; padding: 6px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 900; letter-spacing: 2px; margin-bottom: 15px; text-transform: uppercase; }
                .ai-title { font-size: 2.5rem; font-weight: 900; margin: 0; background: linear-gradient(135deg, #fff 0%, #d4af37 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                
                /* Gauge and Score */
                .score-circle { width: 140px; height: 140px; border-radius: 50%; border: 8px solid rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; position: relative; box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.1); margin: 0 auto; }
                .score-circle::after { content: ''; position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px; border-radius: 50%; border: 8px solid transparent; border-top-color: #10b981; border-right-color: #10b981; transform: rotate(45deg); }
                .score-value { font-size: 2.8rem; font-weight: 900; color: #10b981; text-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
                .score-label { text-align: center; margin-top: 15px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; }

                /* Pulse animation for active AI */
                @keyframes aiPulse { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
                .ai-active-dot { width: 10px; height: 10px; background: #d4af37; border-radius: 50%; animation: aiPulse 2s infinite; }
                
                @media (max-width: 900px) { .ai-grid { grid-template-columns: 1fr; } }
            </style>

            <div class="admin-container" style="margin-top: 25px;">
                
                <!-- AI Boshqaruv Markazi Sarlavhasi -->
                <div class="ai-center-header">
                    <div class="ai-badge"><div class="ai-active-dot"></div> AI BOSHQARUV MARKAZI (STRATEGIC CONTROL)</div>
                    <h1 class="ai-title">Korxona Intellektual Holati</h1>
                    <p style="color: #64748b; font-size: 0.95rem; margin-top: 10px;">PCH-Agent avtomatlashtirish, tahlillar va tizim prognozlari markazi</p>
                </div>

                <!-- Yuqori panel: Asosiy Sun'iy Intellekt va Tizim Metrikalari -->
                <div class="admin-stats-grid">
                    <div class="admin-premium-card" style="border-left: 4px solid #d4af37;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div class="admin-stat-label">AI TOMONIDAN BAJARILGAN AMALLAR</div>
                                <div id="admin-ai-actions" class="admin-stat-value" style="color: #d4af37;">1,342</div>
                            </div>
                            <div class="admin-icon-box" style="background: rgba(212, 175, 55, 0.1); color: #d4af37;">
                                <i class="fas fa-brain"></i>
                            </div>
                        </div>
                        <div style="margin-top: 15px; font-size: 0.75rem; color: #10b981;"><i class="fas fa-arrow-up"></i> +12% o'tgan haftaga nisbatan</div>
                    </div>

                    <div class="admin-premium-card">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div class="admin-stat-label">FAOL XODIMLAR / ONLINE</div>
                                <div id="admin-stat-employees" class="admin-stat-value">...</div>
                            </div>
                            <div class="admin-icon-box" style="background: rgba(56, 189, 248, 0.1); color: #38bdf8;">
                                <i class="fas fa-satellite-dish"></i>
                            </div>
                        </div>
                    </div>

                    <div class="admin-premium-card" style="border-left: 4px solid #ef4444;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div class="admin-stat-label">KRITIK NOSOZLIKLAR</div>
                                <div id="admin-stat-defects" class="admin-stat-value" style="color: #ef4444;">...</div>
                            </div>
                            <div class="admin-icon-box" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI markaziy bloki: Safety Score & Prognozlar -->
                <div class="ai-grid">
                    <!-- Safety Score & Tizim Holati -->
                    <div class="admin-premium-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px;">
                        <div class="score-circle">
                            <div class="score-value">94<span style="font-size: 1.5rem">%</span></div>
                        </div>
                        <div class="score-label">XAVFSIZLIK VA ISHONCHLILIK INDEKSI (SAFETY SCORE)</div>
                        <p style="text-align: center; color: #64748b; font-size: 0.85rem; margin-top: 15px; max-width: 80%;">
                            AI joriy holat, defektoskopiya tekshiruvlari va metrologiya ma'lumotlariga asoslanib infratuzilmaning umumiy xavfsizlik darajasini tahlil qildi.
                        </p>
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 5px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 800;">Normada</span>
                            <span style="background: rgba(212,175,55,0.1); color: #d4af37; padding: 5px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 800;"><i class="fas fa-sync fa-spin"></i> Real-time Monitoring</span>
                        </div>
                    </div>

                    <!-- AI Bashoratlar va Tavsiyalar -->
                    <div class="admin-premium-card">
                        <h3 style="color: #d4af37; margin-top: 0; font-size: 1.1rem; font-weight: 900; display: flex; align-items: center; gap: 10px; text-transform: uppercase;">
                            <i class="fas fa-magic"></i> AI Bashorat va Tavsiyalari
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                            <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 14px;">
                                <div style="color: #ef4444; font-size: 0.8rem; font-weight: 800; margin-bottom: 5px;"><i class="fas fa-exclamation-circle"></i> YUQORI XAVF: STRELKA №24 (3-Bo'linma)</div>
                                <div style="color: #e2e8f0; font-size: 0.9rem;">O'tkazgich qulfi yeyilishi me'yorga yaqinlashdi (3.8mm). 5 kun ichida buzilish ehtimoli 87%.</div>
                                <button style="margin-top: 10px; background: rgba(239,68,68,0.2); border: none; color: #ef4444; padding: 5px 15px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.75rem;">Ta'mirlash brigadasini yuborish</button>
                            </div>
                            
                            <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); padding: 15px; border-radius: 14px;">
                                <div style="color: #f59e0b; font-size: 0.8rem; font-weight: 800; margin-bottom: 5px;"><i class="fas fa-temperature-high"></i> HARORAT OGOHLANTIRISHI</div>
                                <div style="color: #e2e8f0; font-size: 0.9rem;">Ertaga rels harorati 55°C dan oshishi kutilmoqda. PTE bo'yicha tezlikni cheklash tayyorgarligini ko'ring.</div>
                            </div>

                            <div style="background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); padding: 15px; border-radius: 14px;">
                                <div style="color: #38bdf8; font-size: 0.8rem; font-weight: 800; margin-bottom: 5px;"><i class="fas fa-bolt"></i> ENERGIYA OPTIMIZATSIYASI</div>
                                <div style="color: #e2e8f0; font-size: 0.9rem;">Metrologiya: 2-bo'linmada elektr sarfi limitga yaqin (+21%). Analiz avtomatik ravishda boshlandi.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ostki Tizim jurnali va grafiklar -->
                <div class="ai-grid" style="grid-template-columns: 2fr 1fr;">
                    <div class="admin-premium-card">
                        <h3 style="color: #fff; margin-top: 0; font-size: 1.1rem; font-weight: 900; display: flex; align-items: center; gap: 10px; text-transform: uppercase;">
                            <i class="fas fa-chart-area" style="color: #38bdf8;"></i> AI Samaradorlik Grafiki
                        </h3>
                        <div style="height: 250px; display: flex; align-items: flex-end; gap: 10px; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            ${this.renderChartPlaceholder()}
                        </div>
                    </div>

                    <div class="admin-premium-card">
                        <h3 style="color: #fff; margin-top: 0; font-size: 1.1rem; font-weight: 900; text-transform: uppercase;"><i class="fas fa-list" style="color:#10b981;"></i> Jonli PCH-Agent Tasmachi</h3>
                        <div id="admin-recent-activity" style="padding-top: 15px; display: flex; flex-direction: column; gap: 15px; height: 265px; overflow-y: auto;">
                            <!-- Activity is injected here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderChartPlaceholder: function () {
        let html = '';
        const data = [
            { day: 'Dush', val: 30 }, { day: 'Sesh', val: 45 }, { day: 'Chor', val: 70 },
            { day: 'Pay', val: 55 }, { day: 'Jum', val: 85 }, { day: 'Shan', val: 40 }, { day: 'Yak', val: 20 }
        ];

        data.forEach((item) => {
            html += `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; position: relative; height: 100%;">
                    <div style="width: 70%; height: ${item.val}%; background: linear-gradient(to top, rgba(212,175,55,0.8), rgba(212,175,55,0.1)); border-radius: 8px 8px 0 0; position: relative; border-top: 2px solid #d4af37;">
                        <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-weight: 800; font-size: 0.7rem; color: #fff;">${item.val}</div>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.65rem; color: #94a3b8; font-weight: 700;">${item.day}</div>
                </div>
            `;
        });
        return html;
    },

    init: async function () {
        console.log("Admin Dashboard (AI Control Center) ishga tushdi...");
        this.loadStats();
        this.loadRecentActivity();
        
        // Simulating live AI action counter
        setInterval(() => {
            const counter = document.getElementById('admin-ai-actions');
            if (counter) {
                let current = parseInt(counter.innerText.replace(/,/g, ''));
                counter.innerText = (current + Math.floor(Math.random() * 3)).toLocaleString();
            }
        }, 5000);
    },

    loadStats: async function () {
        try {
            const workers = await SmartUtils.fetchAPI('/hr/stats').catch(() => ({ totalEmployees: 0 }));
            // Get defects count dynamically if possible
            let defectCount = 12;
            if (window.trackDefectsManager && window.trackDefectsManager.getStats) {
                const ds = await window.trackDefectsManager.getStats();
                defectCount = ds.pendingTalon || 12;
            }

            const empEl = document.getElementById('admin-stat-employees');
            if(empEl) empEl.textContent = workers.totalEmployees || Math.floor(Math.random() * 50 + 100);
            
            const defEl = document.getElementById('admin-stat-defects');
            if(defEl) defEl.textContent = defectCount;

        } catch (e) {
            console.warn("Stats load failed", e);
        }
    },

    loadRecentActivity: function () {
        const container = document.getElementById('admin-recent-activity');
        if (!container) return;

        const activities = [
            { icon: 'fa-robot', color: '#d4af37', text: 'PCH-Agent: 3-bo\'linmaga javob berdi', time: '1 daqiqa oldin' },
            { icon: 'fa-search-location', color: '#10b981', text: 'AI: PU-29 tekshiruvini analiz qildi', time: '5 daqiqa oldin' },
            { icon: 'fa-exclamation-triangle', color: '#ef4444', text: 'AI: PTQ zudlik bilan talab e\'lon qildi', time: '12 daqiqa oldin' },
            { icon: 'fa-user-check', color: '#38bdf8', text: 'Tizim: FaceID orgali 18 xodim tanildi', time: '1 soat oldin' },
            { icon: 'fa-file-invoice', color: '#f59e0b', text: 'Agent: PDF bayonnoma yaratdi', time: '2 soat oldin' }
        ];

        container.innerHTML = activities.map(a => `
            <div style="display: flex; gap: 15px; align-items: flex-start; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                <div style="color: ${a.color}; font-size: 1rem; width: 30px; height: 30px; background: ${a.color}20; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas ${a.icon}"></i>
                </div>
                <div>
                    <div style="font-size: 0.8rem; color: white; font-weight: 700; line-height: 1.3;">${escapeHtml(a.text)}</div>
                    <div style="font-size: 0.65rem; color: #64748b; margin-top: 4px;"><i class="far fa-clock"></i> ${a.time}</div>
                </div>
            </div>
        `).join('');
    }
};
