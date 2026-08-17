// Bo'linma Arxivi (Mening Arxivim) Moduli - Kengaytirilgan Versiya

window.openBolinmaArchiveDashboard = function (bolId) {
    if (!bolId) {
        showToast("Bo'linma ID topilmadi!", "error");
        return;
    }

    // Hide all other sections
    document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));

    // Check if the archive section already exists
    let archiveSection = document.getElementById("bolinma-archive-section");
    const mainContent = document.getElementById("mainContent");

    if (!archiveSection) {
        archiveSection = document.createElement("section");
        archiveSection.id = "bolinma-archive-section";
        archiveSection.className = "content-section active";
        mainContent.appendChild(archiveSection);
    } else {
        archiveSection.classList.add("active");
    }

    // Render the initial grid layout
    renderArchiveHome(bolId);
};

function renderArchiveHome(bolId) {
    const archiveSection = document.getElementById("bolinma-archive-section");
    const bolName = typeof window.getBolinmaName === 'function' ? window.getBolinmaName(bolId) : bolId;
    
    // Departments for the archive grid
    const archiveDepts = [
        { id: 'dispetcher', name: 'Dispetcher va Raportlar', icon: 'fas fa-tower-broadcast', color: '#10b981' },
        { id: 'xodimlar', name: 'Kadrlar va Davomat', icon: 'fas fa-users-gear', color: '#38bdf8' },
        { id: 'mexanika', name: 'Mexanika va Texnika', icon: 'fas fa-gears', color: '#f59e0b' },
        { id: 'bugalteriya', name: 'M-29 va Materiallar', icon: 'fas fa-calculator', color: '#f472b6' },
        { id: 'yol-xojaligi', name: 'PU-28 va Nuqsonlar', icon: 'fas fa-road', color: '#c084fc' },
        { id: 'xavfsizlik', name: 'Mehnat Muhofazasi', icon: 'fas fa-shield-halved', color: '#fb7185' }
    ];

    let html = `
        <style>
            .ba-container {
                padding: 30px;
                color: #f8fafc;
                font-family: 'Inter', sans-serif;
                animation: fadeIn 0.5s ease;
            }
            .ba-header {
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
                border: 1px solid rgba(212, 175, 55, 0.2);
                padding: 30px;
                border-radius: 20px;
                margin-bottom: 30px;
                position: relative;
                overflow: hidden;
            }
            .ba-header::after {
                content: '';
                position: absolute;
                top: 0; left: 0; width: 100%; height: 5px;
                background: linear-gradient(90deg, #10b981, #d4af37, #10b981);
            }
            .ba-title {
                font-size: 2.2rem;
                font-weight: 800;
                margin: 0;
                color: #fff;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .ba-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .ba-card {
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.08);
                padding: 30px;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                backdrop-filter: blur(10px);
                position: relative;
            }
            .ba-card:hover {
                background: rgba(30, 41, 59, 0.8);
                transform: translateY(-10px);
                border-color: rgba(212, 175, 55, 0.4);
                box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            }
            .ba-card i {
                font-size: 3rem;
                transition: transform 0.3s;
            }
            .ba-card:hover i {
                transform: scale(1.1);
            }
            .ba-card h3 {
                margin: 0;
                font-size: 1.3rem;
                font-weight: 700;
                color: #e2e8f0;
            }
            .ba-card .counts {
                font-size: 0.85rem;
                color: #94a3b8;
                background: rgba(0,0,0,0.2);
                padding: 4px 12px;
                border-radius: 20px;
            }
            
            /* Table Styles */
            .ba-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                background: rgba(15, 23, 42, 0.4);
                border-radius: 12px;
                overflow: hidden;
            }
            .ba-table th, .ba-table td {
                padding: 15px 20px;
                text-align: left;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }
            .ba-table th {
                background: rgba(0,0,0,0.3);
                color: #cbd5e1;
                font-weight: 600;
                font-size: 0.95rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .ba-table td {
                color: #e2e8f0;
                font-size: 0.95rem;
            }
            .ba-table tr:last-child td {
                border-bottom: none;
            }
            .ba-table tr:hover td {
                background: rgba(255,255,255,0.03);
            }
            
            /* Tab Styles */
            .ba-tab-btn {
                background: transparent;
                border: none;
                color: #94a3b8;
                font-size: 1rem;
                font-weight: 600;
                padding: 10px 20px;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.3s;
            }
            .ba-tab-btn:hover {
                color: #fff;
                background: rgba(255,255,255,0.05);
            }
            .ba-tab-btn.active {
                color: #d4af37;
                background: rgba(212, 175, 55, 0.1);
                border-bottom: 2px solid #d4af37;
            }
            
            /* Inner Content Area */
            .ba-inner-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                background: rgba(0,0,0,0.2);
                padding: 15px 25px;
                border-radius: 15px;
            }
            .ba-back-btn {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                color: #fff;
                padding: 8px 20px;
                border-radius: 10px;
                cursor: pointer;
                transition: 0.3s;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .ba-back-btn:hover {
                background: rgba(255,255,255,0.15);
            }
        </style>

        <div class="ba-container">
            <div class="ba-header">
                <h1 class="ba-title"><i class="fas fa-archive" style="color: #d4af37;"></i> ${bolName} - Arxiv Markazi</h1>
                <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 1.1rem;">Barcha bo'limlarga tegishli tarixiy hujjatlar va hisobotlar jamlanmasi.</p>
            </div>

            <div class="ba-grid" id="ba-main-grid">
                ${archiveDepts.map(dept => `
                    <div class="ba-card" onclick="window.openArchiveFolder('${dept.id}', '${bolId}')">
                        <div style="width: 80px; height: 80px; background: ${dept.color}15; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid ${dept.color}30;">
                            <i class="${dept.icon}" style="color: ${dept.color};"></i>
                        </div>
                        <h3>${dept.name}</h3>
                        <span class="counts">Hujjatlar mavjud</span>
                    </div>
                `).join('')}
            </div>

            <div id="ba-folder-content" style="display: none;"></div>
        </div>
    `;
    archiveSection.innerHTML = html;
}

window.openArchiveFolder = function(deptId, bolId) {
    const grid = document.getElementById('ba-main-grid');
    const folder = document.getElementById('ba-folder-content');
    
    grid.style.display = 'none';
    folder.style.display = 'block';
    folder.innerHTML = `<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>`;

    // Map departments to their sub-views
    setTimeout(() => {
        if (deptId === 'dispetcher') {
            renderDepartmentArchive(deptId, 'Ish rejalar va raportlar', bolId, ['Raportlar', 'Statistika']);
        } else if (deptId === 'xodimlar') {
            renderDepartmentArchive(deptId, 'Kadrlar va Davomat', bolId, ['Tabel', 'Face ID Tarixi']);
        } else if (deptId === 'mexanika') {
            renderDepartmentArchive(deptId, 'Mexanizatsiya', bolId, ['Texnik xizmat', 'Yoqilg\'i']);
        } else if (deptId === 'bugalteriya') {
            renderDepartmentArchive(deptId, 'Buxgalteriya', bolId, ['M-29 Aktlar', 'Invoice']);
        } else if (deptId === 'yol-xojaligi') {
            renderDepartmentArchive(deptId, 'Yo\'l xo\'jaligi', bolId, ['PU-28 Daftari', 'Defektlar']);
        } else {
            renderDepartmentArchive(deptId, 'Arxiv Bo\'limi', bolId, ['Hujjatlar']);
        }
    }, 300);
};

function renderDepartmentArchive(deptId, title, bolId, tabs) {
    const folder = document.getElementById('ba-folder-content');
    
    let html = `
        <div class="ba-inner-header">
            <h2 style="margin:0; font-size: 1.5rem; color: #f8fafc; font-weight: 700;">
                <i class="fas fa-folder-open" style="color: #d4af37; margin-right: 12px;"></i> ${title}
            </h2>
            <button class="ba-back-btn" onclick="document.getElementById('ba-main-grid').style.display='grid'; document.getElementById('ba-folder-content').style.display='none';">
                <i class="fas fa-arrow-left"></i> Orqaga
            </button>
        </div>

        <div class="ba-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
            ${tabs.map((tab, idx) => `
                <button class="ba-tab-btn ${idx === 0 ? 'active' : ''}" 
                        onclick="loadBolinmaArchiveData('${deptId}', '${tab}', '${bolId}', this)">
                    ${tab}
                </button>
            `).join('')}
        </div>

        <div id="ba-data-table-container">
             <div style="text-align:center; padding:50px; color:#94a3b8;">Hujjatlarni yuklash uchun tabni tanlang.</div>
        </div>
    `;
    folder.innerHTML = html;
    
    // Auto load first tab
    if (tabs.length > 0) {
        const firstTabBtn = folder.querySelector('.ba-tab-btn');
        loadBolinmaArchiveData(deptId, tabs[0], bolId, firstTabBtn);
    }
}

window.loadBolinmaArchiveData = async function(deptId, tab, bolId, btnElement) {
    // UI update
    if (btnElement) {
        btnElement.parentElement.querySelectorAll('.ba-tab-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }

    const container = document.getElementById('ba-data-table-container');
    container.innerHTML = `<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>Yuklanmoqda...</div>`;

    try {
        if (deptId === 'dispetcher' && tab === 'Raportlar') {
            const all = await SmartUtils.fetchAPI('/reports');
            const data = (all || []).filter(r => r.bolinma_id === bolId).sort((a,b) => new Date(b.date) - new Date(a.date));
            renderTable(container, data, ['Sana', 'Vaqt', 'Mazmuni', 'Status'], ['date', 'time', 'content', 'status']);
        } 
        else if (deptId === 'bugalteriya' && tab === 'M-29 Aktlar') {
            const all = await SmartUtils.fetchAPI('/material_acts');
            const data = (all || []).filter(a => a.bolinma_id === bolId);
            renderTable(container, data, ['ID', 'Sana', 'Material', 'Miqdori'], ['id', 'date', 'material_name', 'quantity']);
        }
        else if (deptId === 'yol-xojaligi' && tab === 'PU-28 Daftari') {
            const data = await SmartUtils.fetchAPI(`/api/pu28/${bolId}`);
            renderTable(container, data, ['Sana', 'KM', 'PK', 'ZV', 'Nosozlik', 'Holat'], ['date', 'km', 'pk', 'zv', 'defect_desc', 'resolved_status']);
        }
        else {
            container.innerHTML = `<div style="text-align:center; padding:100px; color:#94a3b8;">
                <i class="fas fa-folder-closed fa-3x" style="margin-bottom: 20px; opacity:0.3;"></i><br>
                Ushbu bo'limda hozircha ma'lumotlar mavjud emas yoki backendga ulanmagan.
            </div>`;
        }
    } catch (e) {
        container.innerHTML = `<div style="text-align:center; color:#ef4444; padding:50px;">Xatolik: ${e.message}</div>`;
    }
};

function renderTable(container, data, headers, keys) {
    if (!data || data.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#94a3b8;">Ma'lumotlar topilmadi.</div>`;
        return;
    }

    let html = `
        <table class="ba-table" style="width:100%; border-collapse: collapse;">
            <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        ${keys.map(k => {
                            let val = row[k] || '-';
                            if (k === 'status') val = `<span style="color:#10b981;">${val}</span>`;
                            return `<td>${val}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}
