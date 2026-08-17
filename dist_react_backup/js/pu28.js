/**
 * PU-28: YO'L KO'RIK JURNALI (Word-style 7 ustunli format)
 */

let pu28Data = [];
let currentPU28Department = null;

function initPU28Data() {
    const savedData = localStorage.getItem('pu28_data');
    if (savedData) {
        pu28Data = JSON.parse(savedData);
    } 
    // Trigger sync to get latest data from server
    if (window.ApiClient) {
        syncPU28WithServer();
    }
}

function savePU28DataLocal() {
    localStorage.setItem('pu28_data', JSON.stringify(pu28Data));
}

window.openPU28Window = function (departmentId) {
    console.log("PU-28 Opened for:", departmentId);
    currentPU28Department = departmentId;

    if (pu28Data.length === 0) {
        initPU28Data();
    }

    let modal = document.getElementById('pu28-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu28-modal';
        modal.className = 'integration-window';
        modal.style.setProperty('z-index', '200000', 'important');
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid var(--glass-border); padding: 15px 30px;">
            <h2 class="department-name" style="font-size: 1.3rem; margin: 0; display: flex; align-items: center; gap: 12px; font-weight: 800; color: #fff; text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);">
                <i class="fas fa-clipboard-check" style="color: var(--accent-gold);"></i> PU-28: YO'L KO'RIK JURNALI
            </h2>
            <div style="display:flex; align-items:center; gap:25px;">
                <button class="action-btn delete" onclick="document.getElementById('pu28-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; transition: all 0.3s;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="window-content" style="padding: 0; background: #e2e8f0; color: #000; overflow-x: auto; overflow-y: auto; height: calc(100% - 70px); box-sizing: border-box;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; background: #0f172a; border-bottom: 1px solid #333;">
                <h3 style="margin: 0; color: #fff; font-weight: 700; font-size: 1.2rem;">${departmentId === 'ishlab-chiqarish' ? 'Barcha bo\'linmalar' : (window.subdivisions?.find(s => s.id === departmentId)?.name || departmentId)}</h3>
                <div style="display: flex; gap: 15px;">
                    ${window.Auth.currentUser?.role !== 'department' ? `
                        <button onclick="createNewPU28RecordManual()" style="background: #3b82f6; border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2); transition: 0.3s;">
                            <i class="fas fa-edit"></i> YANGI TEKSHIRUV (QO'LDA)
                        </button>
                    ` : ''}
                    <button onclick="exportPU28ToExcel()" style="background: #3b82f6; border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);">
                        <i class="fas fa-file-excel"></i> EXPORT (EXCEL)
                    </button>
                </div>
            </div>

            <div id="pu28-table-content" style="padding: 30px; display: flex; justify-content: center; min-height: 100%;">
                ${generatePU28TableHTML(departmentId)}
            </div>

        </div>
    `;

    modal.classList.add('active');
};

window.refreshPU28Table = function () {
    const tableContainer = document.getElementById('pu28-table-content');
    if (tableContainer) {
        tableContainer.innerHTML = generatePU28TableHTML(currentPU28Department);
    }
}

window.exportPU28ToExcel = function() {
    let records = pu28Data;
    if (currentPU28Department !== 'ishlab-chiqarish') {
        records = records.filter(r => r.departmentId === currentPU28Department || r.bolinma_id === currentPU28Department);
    }
    
    if (records.length === 0) {
        if (window.SmartUtils) SmartUtils.showToast("Eksport uchun ma'lumot yo'q!", "warning");
        return;
    }

    const dataForExport = records.map(r => ({
        'Sana': r.date,
        'Usul': r.checkMethod || r.check_method,
        'KM': r.km,
        'PK': r.pk,
        'ZV': r.zv,
        'Nosozlik': r.defectDesc || r.defect_desc,
        'Holat': (r.resolvedStatus || r.resolved_status) === 'resolved' ? 'Bartaraf etildi' : 'Kutilmoqda',
        'Bartaraf sanasi': r.dateResolved || r.date_resolved || '-'
    }));

    if (window.SmartReporting) {
        SmartReporting.exportToExcel(dataForExport, `PU28_Jurnali_${currentPU28Department}.xlsx`);
    } else {
        console.error("SmartReporting utility not found");
    }
};

function generatePU28TableHTML(deptId) {
    let records = pu28Data;
    if (deptId !== 'ishlab-chiqarish') {
        records = records.filter(r => r.departmentId === deptId || r.bolinma_id === deptId);
    }

    // Default 15 bo'sh qator ko'rsatish
    const minRows = 15;
    let tableRows = '';

    for (let i = 0; i < Math.max(records.length, minRows); i++) {
        if (i < records.length) {
            const r = records[i];
            const isResolved = (r.resolvedStatus || r.resolved_status) === 'resolved';
            const defectText = r.defectDesc || r.defect_desc;
            const checkMethod = r.checkMethod || r.check_method;

            tableRows += `
            <tr class="pu28-filled-row">
                <td style="text-align: center;">${r.date}</td>
                <td style="text-align: center;">${checkMethod}</td>
                <td style="text-align: center; font-weight: bold;">${r.km}</td>
                <td style="text-align: center; font-weight: bold;">${r.pk}</td>
                <td style="text-align: center; font-weight: bold;">${r.zv}</td>
                <td style="padding: 10px;">
                    ${defectText}
                    ${!isResolved ? (window.Auth.currentUser?.role !== 'department' ? `
                    <div style="margin-top:8px; display:flex; gap:8px;">
                        <button onclick="resolvePU28Defect(${r.id})" title="Bajarildi" style="background:#10b981; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;"><i class="fas fa-check"></i></button>
                        <button onclick="deletePU28Entry(${r.id})" title="O'chirish" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                    ` : ``) : ''}
                </td>
                <td style="padding: 10px;">
                    ${isResolved 
                        ? `<div style="text-align:center;"><i class="fas fa-check" style="color: #059669;"></i> Bartaraf etildi<br/>${r.dateResolved || r.date_resolved}</div>` 
                        : `<div style="text-align:center; color:#dc2626;">Bartaraf etilmagan</div>`}
                </td>
            </tr>`;
        } else {
            tableRows += `
            <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
            </tr>`;
        }
    }

    return `
        <style>
            .pu28-doc {
                width: 100%;
                max-width: 1200px;
                background: #fff;
                padding: 40px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                border: 1px solid #ccc;
                font-family: 'Times New Roman', Times, serif;
            }
            .pu28-doc-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .pu28-doc-table th, .pu28-doc-table td {
                border: 1px solid #000;
                padding: 8px;
                font-size: 14px;
                vertical-align: top;
            }
            .pu28-doc-table th {
                text-align: center;
                font-weight: bold;
                background: #fdfdfd;
                vertical-align: middle;
            }
            .pu28-filled-row:hover {
                background: #f1f5f9;
            }
        </style>
        <div class="pu28-doc">
            <h2 style="text-align: center; margin-bottom: 20px; font-weight: bold; text-transform: uppercase;">YO'LLARDAGI ANIQLANGAN NOSOZLIKLARNI QAYD ETISH JURNALI (PU-28)</h2>
            <table class="pu28-doc-table">
                <thead>
                    <tr>
                        <th style="width: 100px;">Дата проверки<br/><span style="font-weight: normal;">(Tekshiruv sanasi)</span></th>
                        <th style="width: 120px;">Способ проверки<br/><span style="font-weight: normal;">(Tekshirish usuli)</span></th>
                        <th style="width: 60px;">Км<br/><span style="font-weight: normal;">(Km)</span></th>
                        <th style="width: 60px;">Пк<br/><span style="font-weight: normal;">(Pk)</span></th>
                        <th style="width: 60px;">Зв<br/><span style="font-weight: normal;">(Zv)</span></th>
                        <th>Обнаруженные неисправности (величина, дробь, протяжение)<br/><span style="font-weight: normal;">(Aniqlangan nosozliklar (kattaligi, kasr, uzunligi))</span></th>
                        <th style="width: 200px;">Отметка об устранении неисправностей<br/><span style="font-weight: normal;">(Nosozliklar bartaraf etilganligi haqida belgi)</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

window.resolvePU28Defect = async function (recordId) {
    if (confirm("Ushbu kamchilik bartaraf etilganligini tasdiqlaysizmi?")) {
        const record = pu28Data.find(r => r.id === recordId);
        if (record) {
            try {
                // If the record has a real server ID (integer), call the API
                if (Number.isInteger(recordId) && recordId < 1000000000) {
                    await ApiClient.put(`/api/pu28/${recordId}/resolve`);
                }
                
                record.resolvedStatus = 'resolved';
                record.resolved_status = 'resolved';
                const now = new Date().toISOString().split('T')[0];
                record.dateResolved = now;
                record.date_resolved = now;
                
                savePU28DataLocal();
                refreshPU28Table();
                if (window.SmartUtils) SmartUtils.showToast("Kamchilik maqomi 'Bajarildi' etib belgilandi!", 'success');
            } catch (err) {
                console.error("Resolve error:", err);
                alert("Xatolik yuz berdi");
            }
        }
    }
};

window.deletePU28Entry = async function (recordId) {
    if (confirm("Yozuvni o'chirib yuborasizmi?")) {
        try {
            if (Number.isInteger(recordId) && recordId < 1000000000) {
                await ApiClient.delete(`/api/pu28/${recordId}`);
            }
            pu28Data = pu28Data.filter(r => r.id !== recordId);
            savePU28DataLocal();
            refreshPU28Table();
            if (window.SmartUtils) SmartUtils.showToast("O'chirildi", "info");
        } catch (err) {
            console.error("Delete error:", err);
            alert("O'chirishda xatolik");
        }
    }
}

window.syncPU28WithServer = async function() {
    if (!currentPU28Department || currentPU28Department === 'ishlab-chiqarish') return;

    try {
        console.log("Syncing PU-28 with server for:", currentPU28Department);
        
        // 1. Get server data
        const serverData = await ApiClient.get(`/api/pu28/${currentPU28Department}`);
        
        // 2. Identify local-only records (temporary IDs)
        const localOnly = pu28Data.filter(r => r.id > 1000000000 && (r.departmentId === currentPU28Department || r.bolinma_id === currentPU28Department));
        
        if (localOnly.length > 0) {
            // Sync local to server
            await ApiClient.post('/api/pu28/bulk-sync', {
                bolinma_id: currentPU28Department,
                records: localOnly
            });
            // Re-fetch to get real IDs
            const updatedServerData = await ApiClient.get(`/api/pu28/${currentPU28Department}`);
            
            // Merge: keep non-dept records, replace dept records with server data
            const otherDepts = pu28Data.filter(r => (r.departmentId && r.departmentId !== currentPU28Department) || (r.bolinma_id && r.bolinma_id !== currentPU28Department));
            pu28Data = [...otherDepts, ...updatedServerData];
        } else {
            // Just update local from server
            const otherDepts = pu28Data.filter(r => (r.departmentId && r.departmentId !== currentPU28Department) || (r.bolinma_id && r.bolinma_id !== currentPU28Department));
            pu28Data = [...otherDepts, ...serverData];
        }

        savePU28DataLocal();
        refreshPU28Table();
        return true;
    } catch (err) {
        console.error("PU-28 Sync Error:", err);
        return false;
    }
};

// ----------------------------------------------------
// AI VOICE ASSISTANT MODAL & NLP LOGIC FOR PU-28 (Simplified)
// ----------------------------------------------------
window.createNewPU28RecordVoice = function () {
    let modal = document.getElementById('pu28-entry-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu28-entry-modal';
        modal.className = 'integration-window';
        modal.style.setProperty('z-index', '200010', 'important');
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(90deg, #1e293b 0%, #020617 100%); border-bottom: 2px solid var(--glass-border); padding: 15px 30px;">
            <h2 style="color: #fff; margin:0; display:flex; align-items:center; gap:12px; font-weight:800; font-size:1.3rem;">
                <i class="fas fa-robot" style="color: var(--accent-gold);"></i> PU-28 AI Kiritish oynasi
            </h2>
            <button class="close-btn" onclick="document.getElementById('pu28-entry-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="background: #020617; color: var(--text-primary); padding: 25px !important; display: grid; grid-template-columns: 1fr 1fr; gap: 25px; font-family: 'Inter', sans-serif; height: calc(100% - 70px); box-sizing: border-box; overflow-y: hidden;">
            
            <!-- Chap tomon: Ovozli kiritish -->
            <div style="background: rgba(30, 41, 59, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; padding: 30px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; backdrop-filter: blur(10px);">
                <h3 style="color: var(--accent-gold); margin-top: 0; margin-bottom: 15px; font-size: 1.2rem; font-weight: 900; display: flex; align-items: center; gap: 12px; text-transform: uppercase;">
                    <i class="fas fa-microphone-alt"></i> Ovozli Kiritish
                </h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border-left: 3px solid var(--accent-gold);">
                    Yordam: <i style="color: #fff; font-weight: 500;">"Vizual tekshiruv. 3840-kilometr, 5-piket, ikkinchi zveno. Kamchilik: yog'och shpal yorilgan."</i>
                </p>
                
                <div id="pu28-voice-log" style="flex: 1; background: rgba(0, 0, 0, 0.5); border: 1px solid var(--glass-border); border-radius: 20px; margin-bottom: 25px; padding: 25px; overflow-y: auto; color: #fff; font-size: 1.1rem; line-height: 1.6; box-shadow: inset 0 2px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; text-align: center; font-style: italic; opacity: 0.7;">
                    Tayyor... Gapirish uchun pastdagi tugmani bosing.
                </div>

                <button id="pu28-mic-btn" onclick="startPU28VoiceRecognition()" style="background: linear-gradient(135deg, #ef4444, #991b1b); border: none; color: white; padding: 20px; border-radius: 50px; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 15px; transition: 0.3s; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3); font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px;">
                    <i class="fas fa-microphone"></i> <span>Gapirishni boshlash</span>
                </button>
            </div>

            <!-- O'ng tomon: Natija formasi -->
            <div style="background: rgba(30, 41, 59, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; padding: 30px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; backdrop-filter: blur(10px);">
                <h3 style="color: var(--accent-gold); margin-top: 0; margin-bottom: 25px; font-size: 1.2rem; font-weight: 900; display: flex; align-items: center; gap: 12px; text-transform: uppercase;">
                    <i class="fas fa-clipboard-check"></i> Formani to'ldirish
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #cbd5e1; font-size: 0.8rem;">Sana</label>
                            <input type="date" id="ai28-entry-date" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: #fff; font-family: inherit;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #cbd5e1; font-size: 0.8rem;">Tekshirish usuli</label>
                            <select id="ai28-entry-method" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: #fff; font-family: inherit;">
                                <option value="Arava">Arava</option>
                                <option value="Vizual">Vizual / Piyoda</option>
                                <option value="Kommision">Kommision</option>
                                <option value="Defektoskop">Defektoskop</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #cbd5e1; font-size: 0.8rem;">Kilometr (Km)</label>
                            <input type="number" id="ai28-entry-km" placeholder="Km" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: #fff;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #cbd5e1; font-size: 0.8rem;">Piket (Pk)</label>
                            <input type="number" id="ai28-entry-pk" placeholder="Pk" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: #fff;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #cbd5e1; font-size: 0.8rem;">Zveno (Zv)</label>
                            <input type="number" id="ai28-entry-zv" placeholder="Zv" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: #fff;">
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; flex: 1;">
                        <label style="display: block; margin-bottom: 5px; color: #ef4444; font-weight: 800; font-size: 0.8rem;">Aniqlangan Kamchiliklar</label>
                        <textarea id="ai28-entry-defect" style="width: 100%; height: 120px; padding: 12px; border-radius: 8px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color: #fff; resize: none; font-size: 0.95rem; line-height: 1.4;" placeholder="Kamchilik mavjud bo'lsa kiriting... (yoki bo'sh qoldiring)"></textarea>
                    </div>
                </div>

                <div style="display: flex; gap: 20px; margin-top: auto; padding-top: 20px;">
                    <button onclick="savePU28AIEntry()" style="flex: 2; background: var(--gold-gradient); border: none; color: #000; padding: 18px; border-radius: 12px; cursor: pointer; font-size: 1.1rem; font-weight: 900; text-transform: uppercase;">
                        <i class="fas fa-save"></i> SAQLASH
                    </button>
                    <button onclick="document.getElementById('pu28-entry-modal').classList.remove('active')" style="flex: 1; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: #fff; padding: 18px; border-radius: 12px; cursor: pointer; font-size: 1rem; font-weight: 700; text-transform: uppercase;">
                        BEKOR
                    </button>
                </div>
            </div>

        </div>
    `;

    modal.classList.add('active');
};

let pu28Recognition = null;
let ai28ParsingTimeout = null;

window.startPU28VoiceRecognition = function () {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        if (window.SmartUtils) SmartUtils.showToast("Kechirasiz, brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi.", "error");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!pu28Recognition) {
        pu28Recognition = new SpeechRecognition();
        pu28Recognition.lang = 'uz-UZ';
        pu28Recognition.interimResults = true;
        pu28Recognition.maxAlternatives = 1;

        pu28Recognition.onstart = function () {
            const btn = document.getElementById('pu28-mic-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Eshitilmoqda, gapiring...</span>';
            btn.style.background = 'linear-gradient(135deg, #f39c12, #f1c40f)';
            document.getElementById('pu28-voice-log').innerHTML = "<span style='color: #1abc9c;'><i class='fas fa-assistive-listening-systems'></i> Quloq solinmoqda...</span><br/><br/>";
        };

        pu28Recognition.onresult = function (event) {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (interimTranscript.trim().length > 0 || finalTranscript.trim().length > 0) {
                document.getElementById('pu28-voice-log').innerHTML = `
                    <div style="margin-bottom: 10px; color: #95a5a6;">${interimTranscript}</div>
                    <div style="color: white; font-weight: bold;">${finalTranscript}</div>
                 `;
            }

            if (finalTranscript !== '') {
                document.getElementById('pu28-voice-log').innerHTML = `
                    <b style="color:#f1c40f;">Siz aytdingiz:</b><br/>"${finalTranscript}"<br/><br/>
                    <span style="color:#1abc9c;"><i class="fas fa-magic"></i> AI Tahlil qilmoqda...</span>
                `;

                clearTimeout(ai28ParsingTimeout);
                ai28ParsingTimeout = setTimeout(() => {
                    parsePU28VoiceToForm(finalTranscript.toLowerCase());
                }, 500);
            }
        };

        pu28Recognition.onerror = function (event) {
            console.error(event.error);
            document.getElementById('pu28-voice-log').innerHTML = `<span style="color:#e74c3c;"><i class="fas fa-exclamation-circle"></i> Xatolik yuz berdi: ${event.error}.</span>`;
            resetPU28MicButton();
        };

        pu28Recognition.onend = function () {
            resetPU28MicButton();
        }
    }

    try { pu28Recognition.start(); } catch (e) { pu28Recognition.stop(); setTimeout(() => { pu28Recognition.start(); }, 100); }
};

function resetPU28MicButton() {
    const btn = document.getElementById('pu28-mic-btn');
    if (btn && btn.innerHTML.includes('Eshitilmoqda')) {
        btn.innerHTML = '<i class="fas fa-microphone"></i> <span>Yana gapirish</span>';
        btn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    }
}

// PU-28 AI NLP Parser
window.parsePU28VoiceToForm = function (text) {
    console.log("PU-28 AI Parsed form:", text);

    // 1. Check Method
    if (text.includes('arava') || text.includes('defektoskop')) document.getElementById('ai28-entry-method').value = 'Arava';
    else if (text.includes('komissiya') || text.includes('kommision')) document.getElementById('ai28-entry-method').value = 'Kommision';
    else if (text.includes('vizual') || text.includes('piyoda')) document.getElementById('ai28-entry-method').value = 'Vizual';

    // 2. KM (Kilometr)
    let kmMatch = text.match(/(\d+)\s*(?:-|l|) *kilometr/);
    if (!kmMatch) kmMatch = text.match(/(\d{2,4})\s*km/);
    if (kmMatch) document.getElementById('ai28-entry-km').value = kmMatch[1];

    // 3. PK (Piket)
    const numMap = { 'bir': 1, 'birinchi': 1, 'ikki': 2, 'ikkinchi': 2, 'uch': 3, 'uchinchi': 3, 'to\'rt': 4, 'to\'rtinchi': 4, "besh": 5, "beshinchi": 5, "olti": 6, "oltinchi": 6, "yetti": 7, "yettinchi": 7, "sakkiz": 8, "sakkizinchi": 8, "to'qqiz": 9, "to'qqizinchi": 9, "o'n": 10, "o'ninchi": 10 };

    let pkMatch = text.match(/((bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n|1|2|3|4|5|6|7|8|9|10)[-a-z\s]*)\s*piket/);
    if (!pkMatch) pkMatch = text.match(/piket\s*((bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n|1|2|3|4|5|6|7|8|9|10)[-a-z\s]*)/);
    if (pkMatch) {
        let rawVal = pkMatch[1].replace(/inchi/g, '').replace(/-/, '').trim();
        document.getElementById('ai28-entry-pk').value = numMap[rawVal] || parseInt(rawVal) || 0;
    } else {
        let pkFallbackMatch = text.match(/pk\s*(\d+)/i) || text.match(/(\d+)\s*pk/i);
        if (pkFallbackMatch) document.getElementById('ai28-entry-pk').value = pkFallbackMatch[1];
    }

    // 4. ZV (Zveno)
    let zvMatch = text.match(/((bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n|1|2|3|4|5|6|7|8|9|10)[-a-z\s]*)\s*zveno/);
    if (zvMatch) {
        let rawVal = zvMatch[1].replace(/inchi/g, '').replace(/-/, '').trim();
        document.getElementById('ai28-entry-zv').value = numMap[rawVal] || parseInt(rawVal) || 0;
    }

    // 5. Defect 
    let defectKeywords = ['kamchilik', 'muammo', 'nuqson', 'shikast', 'qayd'];
    for (let kw of defectKeywords) {
        if (text.includes(kw)) {
            let defectText = text.substring(text.indexOf(kw) + kw.length).replace(/(:|-)/g, '').trim();
            defectText = defectText.charAt(0).toUpperCase() + defectText.slice(1);
            document.getElementById('ai28-entry-defect').value = defectText;
            break;
        }
    }

    document.getElementById('pu28-voice-log').innerHTML += `<br/><span style="color:#1abc9c; font-weight:bold;"><i class="fas fa-check-double"></i> Ma'lumotlar tahlil qilinib formaga joylandi! O'ng tomonni tekshiring.</span>`;
};

window.savePU28AIEntry = async function () {
    const date = document.getElementById('ai28-entry-date').value;
    const method = document.getElementById('ai28-entry-method').value;
    const km = document.getElementById('ai28-entry-km').value;
    const pk = document.getElementById('ai28-entry-pk').value;
    const zv = document.getElementById('ai28-entry-zv').value;
    const defect = document.getElementById('ai28-entry-defect').value;

    if (!km) {
        if (window.SmartUtils) SmartUtils.showToast("Kilometr kiritilishi shart!", "warning");
        return;
    }

    const newRecord = {
        id: Date.now(),
        bolinma_id: currentPU28Department,
        departmentId: currentPU28Department, // Legacy support
        date: date || new Date().toISOString().split('T')[0],
        check_method: method,
        checkMethod: method, // Legacy support
        km: parseInt(km),
        pk: parseInt(pk) || 0,
        zv: parseInt(zv) || 0,
        defect_desc: defect.trim() || 'Kamchiliksiz',
        defectDesc: defect.trim() || 'Kamchiliksiz', // Legacy support
        resolved_status: defect.trim() ? 'pending' : 'resolved',
        resolvedStatus: defect.trim() ? 'pending' : 'resolved', // Legacy support
        date_resolved: defect.trim() ? null : date,
        dateResolved: defect.trim() ? null : date // Legacy support
    };

    pu28Data.push(newRecord);
    savePU28DataLocal();

    document.getElementById('pu28-entry-modal').classList.remove('active');
    refreshPU28Table();

    if (window.SmartUtils) {
        SmartUtils.showToast("PU-28 jurnaliga ma'lumot saqlandi! Serverga yuborilmoqda...", "info");
    }

    // Trigger sync
    syncPU28WithServer();
};
