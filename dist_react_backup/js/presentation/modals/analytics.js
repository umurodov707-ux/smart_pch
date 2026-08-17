/**
 * CENTRALIZED ANALYTICS (BI)
 * Visualizes trends using Chart.js
 */
const ModernAnalytics = {
    open: function() {
        const modalId = 'modern-analytics-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'department-window active';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 95%; max-width: 1400px; height: 90vh;
            z-index: 10003; display: flex; flex-direction: column;
            background: rgba(15, 23, 42, 0.98); backdrop-filter: blur(30px);
            border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 30px;
            box-shadow: 0 40px 100px rgba(0,0,0,0.8);
            animation: modalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        `;

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, rgba(212, 175, 55, 0.1), transparent); padding: 30px 40px; border-bottom: 1px solid rgba(212, 175, 55, 0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 55px; height: 55px; background: rgba(212, 175, 55, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(212, 175, 55, 0.2);">
                        <i class="fas fa-chart-line" style="font-size: 1.8rem; color: #ffd700;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.8rem; color: #fff; letter-spacing: 2px; font-weight: 900; text-transform: uppercase;">BI <span style="color: #ffd700; font-weight: 400;">ANALYTICS</span></h2>
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Ma'lumotlar tahlili va bashoratlash tizimi</div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px;">
                    <button onclick="ModernAnalytics.refresh()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px 25px; border-radius: 14px; cursor: pointer; font-weight: 800; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-sync"></i> YANGILASH
                    </button>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; width: 50px; height: 50px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times" style="font-size: 1.5rem;"></i>
                    </button>
                </div>
            </div>
            <div class="window-content" style="padding: 40px; flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px;">
                <!-- Summary Cards -->
                <div style="grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 10px;">
                    <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 20px; padding: 25px;">
                        <div style="color: #60a5fa; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">Xavfsizlik darajasi</div>
                        <div style="color: #fff; font-size: 2.2rem; font-weight: 900;">94% <span style="font-size: 1rem; color: #10b981;">+2%</span></div>
                    </div>
                    <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 20px; padding: 25px;">
                        <div style="color: #f87171; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">Faol Nosozliklar</div>
                        <div style="color: #fff; font-size: 2.2rem; font-weight: 900;" id="bi-active-defects">0</div>
                    </div>
                    <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 20px; padding: 25px;">
                        <div style="color: #34d399; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">Bugungi OKNOlar</div>
                        <div style="color: #fff; font-size: 2.2rem; font-weight: 900;" id="bi-today-okno">0</div>
                    </div>
                    <div style="background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 20px; padding: 25px;">
                        <div style="color: #ffd700; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">Xodimlarning chiqishi</div>
                        <div style="color: #fff; font-size: 2.2rem; font-weight: 900;">91%</div>
                    </div>
                </div>

                <!-- Charts -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px;">
                    <h3 style="color: #ffd700; margin-top: 0; margin-bottom: 25px; font-size: 1.1rem;"><i class="fas fa-thermometer-half"></i> Harorat Dinamikasi (Oxirgi 7 kun)</h3>
                    <canvas id="chart-temperature" style="max-height: 350px;"></canvas>
                </div>

                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px;">
                    <h3 style="color: #ffd700; margin-top: 0; margin-bottom: 25px; font-size: 1.1rem;"><i class="fas fa-bug"></i> Defektlar Statistikasi (Bo'linmalar bo'yicha)</h3>
                    <canvas id="chart-defects" style="max-height: 350px;"></canvas>
                </div>

                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px;">
                    <h3 style="color: #ffd700; margin-top: 0; margin-bottom: 25px; font-size: 1.1rem;"><i class="fas fa-users-cog"></i> Xodimlar Intizomi</h3>
                    <canvas id="chart-attendance" style="max-height: 350px;"></canvas>
                </div>

                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px;">
                    <h3 style="color: #ffd700; margin-top: 0; margin-bottom: 25px; font-size: 1.1rem;"><i class="fas fa-tasks"></i> Reja bajarilishi (M-29 bo'yicha)</h3>
                    <canvas id="chart-m29" style="max-height: 350px;"></canvas>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.initCharts();
    },

    refresh: function() {
        this.initCharts();
        if (window.showToast) window.showToast("Ma'lumotlar yangilandi", "info");
    },

    initCharts: async function() {
        if (window.LazyLoader) await window.LazyLoader.loadChart();

        // Fetch Real Data
        let defectsData = [];
        let oknoData = [];
        try {
            defectsData = await ApiClient.get('/api/defects');
            oknoData = await ModernizationRepo.getOKNOPlans();
            
            document.getElementById('bi-active-defects').textContent = defectsData.length;
            document.getElementById('bi-today-okno').textContent = oknoData.filter(d => d.status === 'planned').length;
        } catch (e) {
            console.error('BI Data fetch error', e);
        }

        // 1. Temperature Chart (Mocked trend for now)
        new Chart(document.getElementById('chart-temperature'), {
            type: 'line',
            data: {
                labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
                datasets: [{
                    label: "Rels Harorati (°C)",
                    data: [18, 22, 25, 29, 35, 41, 38],
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Havo Harorati (°C)',
                    data: [15, 18, 20, 22, 25, 28, 27],
                    borderColor: '#60a5fa',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#fff' } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display : false }, ticks: { color: '#94a3b8' } }
                }
            }
        });

        // 2. Defects Chart
        const bCounts = {};
        defectsData.forEach(d => { bCounts[d.bolinma_id] = (bCounts[d.bolinma_id] || 0) + 1; });

        new Chart(document.getElementById('chart-defects'), {
            type: 'bar',
            data: {
                labels: Object.keys(bCounts).length ? Object.keys(bCounts) : ['PD-1', 'PD-2', 'PD-3', 'PD-4', 'PD-5'],
                datasets: [{
                    label: 'Nosozliklar soni',
                    data: Object.values(bCounts).length ? Object.values(bCounts) : [12, 19, 3, 5, 2],
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderColor: '#ef4444',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#fff' } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { ticks: { color: '#94a3b8' } }
                }
            }
        });

        // 3. Attendance Chart (Mocked)
        new Chart(document.getElementById('chart-attendance'), {
            type: 'doughnut',
            data: {
                labels: ['Ishda', 'Kasal', "O'tpuska", 'Sababsiz'],
                datasets: [{
                    data: [85, 5, 8, 2],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'right', labels: { color: '#fff', padding: 20 } } }
            }
        });

        // 4. M-29 Execution
        new Chart(document.getElementById('chart-m29'), {
            type: 'radar',
            data: {
                labels: ['Psh-1', 'Psh-2', 'Psh-3', 'Psh-4', 'Psh-5'],
                datasets: [{
                    label: 'Reja',
                    data: [100, 100, 100, 100, 100],
                    borderColor: 'rgba(255,255,255,0.2)',
                    backgroundColor: 'transparent'
                }, {
                    label: 'Amalda',
                    data: [90, 85, 95, 70, 92],
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(212, 175, 55, 0.2)'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#fff' } } },
                scales: {
                    r: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#fff' },
                        ticks: { display: false }
                    }
                }
            }
        });
    }
};

window.ModernAnalytics = ModernAnalytics;
