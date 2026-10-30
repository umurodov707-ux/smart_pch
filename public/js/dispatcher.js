(function () {
    // SMART PCH - Dispatcher Module (v12.5) - Modern Dark Edition

    window.subdivisionReports = window.subdivisionReports || {};
    let subdivisionReports = window.subdivisionReports;
    let recentReports = [];

    const subdivisions = window.subdivisions || [
        { id: 'bolinma1', name: '1-bo\'linma', manager: 'Rajabov E.' },
        { id: 'bolinma2', name: '2-bo\'linma', manager: 'Roziyev A.' },
        { id: 'bolinma3', name: '3-bo\'linma', manager: 'Islomov S.' },
        { id: 'bolinma4', name: '4-bo\'linma', manager: 'Atadjanov J.' },
        { id: 'bolinma5', name: '5-bo\'linma', manager: 'Choriyev Y.' },
        { id: 'bolinma6', name: '6-bo\'linma', manager: 'Islomov F.' },
        { id: 'bolinma7', name: '7-bo\'linma', manager: 'Mambetov A.' },
        { id: 'bolinma8', name: '8-bo\'linma', manager: 'Qutimov R.' },
        { id: 'bolinma9', name: '9-bo\'linma', manager: 'Kerimov U.' },
        { id: 'bolinma10', name: '10-bo\'linma', manager: 'Davletov Sh.' }
    ];

    // --- GLOBAL DISPATCHER STATE ---
    window.selectedDispatcherDate = new Date().toISOString().split('T')[0];
    window.dispatcherState = {
        attendanceRows: [],
        dayWarnRows: [],
        generalWarnRows: [],
        spravkaRows: [],
        planRows: [],
        obxodRows: [],
        oynaRows: [],
        tempData: [],
        defects: [],
        razryadka: [],
        materials: [],
        transport: []
    };

    // Draft Persistence Helper
    function getDraftKey() {
        const bid = window.currentUser?.bolinmalar?.[0] || 'global';
        return `dispatcher_draft_${bid}_${window.selectedDispatcherDate}`;
    }

    window.saveStateToDraft = function() {
        localStorage.setItem(getDraftKey(), JSON.stringify(window.dispatcherState));
    };

    window.clearStateDraft = function() {
        localStorage.removeItem(getDraftKey());
    };

    // --- UI HELPERS ---
    function getUzbekDateString(dateStr) {
        if (!dateStr) return '';
        const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${d.getDate()} - ${months[d.getMonth()]}, ${d.getFullYear()}`;
    }

    window.openDispatcherModal = function(moduleKey) {
        const modal = document.getElementById('dispatcher-modal');
        const content = document.getElementById('dispatcher-modal-content');
        if (!modal || !content) return;
        
        let formHTML = '';
        if (moduleKey === 'ogoh') {
            formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #ef4444; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444; filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.5));"></i>
                            YANGI OGOHLANTIRISH QO'SHISH
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Bekat - bekat oralig'i</label>
                            <input id="m-ogoh-station" placeholder="Qorlitog' - Bo'ston" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight: 600;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">KM PK</label>
                            <input id="m-ogoh-km" placeholder="4031 KM 2 PK" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">Yo'l</label>
                            <input id="m-ogoh-path" placeholder="1-yo'l" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">Tezlik (KM/SOAT)</label>
                            <input id="m-ogoh-speed" type="number" placeholder="25" style="width:100%; padding:14px; background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.3); color:#f87171; border-radius:12px; font-weight:900; font-size: 1.2rem;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">Sabab</label>
                            <input id="m-ogoh-reason" placeholder="Relyslar orasidagi masofa buzilgan..." style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">Vaqti (Qachondan - Qachongacha)</label>
                            <input id="m-ogoh-time" placeholder="08:00 - 12:00" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight: 700;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">Aybdor tomon (PCH/PDB)</label>
                            <input id="m-ogoh-resp" placeholder="PCH-16 (PDB-1)" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px; cursor: pointer; font-weight: 600; transition: 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #ef4444, #991b1b); color: #fff; border: none; border-radius: 12px; cursor: pointer; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); transition: 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(239, 68, 68, 0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(239, 68, 68, 0.4)'">OGOHLANTIRISHNI SAQLASH</button>
                    </div>
                </div>
            `;
        } else if (moduleKey === 'spravka') {
            formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #38bdf8; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-file-contract" style="color: #38bdf8; filter: drop-shadow(0 0 5px rgba(56,189,248,0.5));"></i>
                            KUNLIK BAJARILGAN ISHLAR
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div style="grid-column: span 3;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">HUDUD (BO'LIM / PDB)</label>
                            <input id="m-sp-area" placeholder="PDB-1" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:700;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">OBXOD</label>
                            <input id="m-sp-obxod" value="0" type="number" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">ISSO</label>
                            <input id="m-sp-isso" value="0" type="number" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">PUTEY</label>
                            <input id="m-sp-putey" value="0" type="number" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">MAS'UL RAHBAR</label>
                            <input id="m-sp-leader" placeholder="Ism Familiya" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight: 700;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">IJROCHILAR (ISM-FAMILIYA)</label>
                            <input id="m-sp-exec" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div style="background: rgba(239, 68, 68, 0.05); padding: 12px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
                            <label style="display:block; color:#fca5a5; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">ANIQLANDI</label>
                            <input id="m-sp-vyav" type="number" value="0" style="width:100%; background:transparent; border:none; color:#ef4444; font-size: 1.5rem; font-weight: 900; outline: none; text-align: center;">
                        </div>
                        <div style="background: rgba(16, 185, 129, 0.05); padding: 12px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2);">
                            <label style="display:block; color:#6ee7b7; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">TUZATILDI</label>
                            <input id="m-sp-ustr" type="number" value="0" style="width:100%; background:transparent; border:none; color:#10b981; font-size: 1.5rem; font-weight: 900; outline: none; text-align: center;">
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.03); padding: 12px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">QOLDI</label>
                            <input id="m-sp-not-ustr" type="number" value="0" style="width:100%; background:transparent; border:none; color:#fff; font-size: 1.5rem; font-weight: 900; outline: none; text-align: center;">
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px;">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #3b82f6, #1e40af); color: #fff; border: none; border-radius: 12px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">HISOBOTNI SAQLASH</button>
                    </div>
                </div>
            `;
        } else if (moduleKey === 'reja') {
             // AUTO-FILL BOLINMA NAME
             const userSub = window.currentUser?.bolinmalar?.[0] || '';
             const subName = subdivisions.find(s => s.id === userSub)?.name || '';

             formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #3b82f6; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-calendar-check" style="color: #3b82f6; filter: drop-shadow(0 0 5px rgba(59,130,246,0.5));"></i>
                            ERTANGI KUN REJASI (PU-28)
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">HUDUD (BO'LIM / PDB)</label>
                            <input id="m-reja-area" value="${subName}" placeholder="PDB-1" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:700;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">BAJARILADIGAN ISH</label>
                            <input id="m-reja-work" list="pu74-norms-list" placeholder="Joriy tamirlash ishlari olib boriladi..." style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                            ${window.PU74_NORMS_DB ? `<datalist id="pu74-norms-list">${window.PU74_NORMS_DB.map(n => `<option value="${escapeHtml(n.name)}"></option>`).join('')}</datalist>` : ''}
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">MANZIL (KM PK)</label>
                            <input id="m-reja-location" placeholder="4031-4032" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">XODIMLAR SONI</label>
                            <input id="m-reja-staff" type="number" placeholder="18" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight: 900; font-size: 1.1rem;">
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px;">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #10b981, #047857); color: #fff; border: none; border-radius: 12px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">REJANI SAQLASH</button>
                    </div>
                </div>
            `;
        } else if (moduleKey === 'obxod') {
             formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #172554 100%); border-bottom: 2px solid #3b82f6; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-hiking" style="color: #3b82f6; filter: drop-shadow(0 0 5px rgba(59,130,246,0.5));"></i>
                            PIYODA TEKSHIRUV (OBXOD)
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">HUDUD (BO'LIM / PDB)</label>
                            <input id="m-obxod-area" placeholder="PDB-1" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:700;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">XODIM F.I.SH</label>
                            <input id="m-obxod-name" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">TELEFON</label>
                            <input id="m-obxod-tel" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">MANZIL (KM PK)</label>
                            <input id="m-obxod-km" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">KAMCHILIKLAR</label>
                            <input id="m-obxod-kamchilik" style="width:100%; padding:14px; background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.2); color:#fca5a5; border-radius:12px; border-left: 5px solid #ef4444;">
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px;">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #1d4ed8, #1e40af); color: #fff; border: none; border-radius: 12px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(30, 64, 175, 0.4);">SAQLASH</button>
                    </div>
                </div>
            `;
        } else if (moduleKey === 'defect') {
             formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #450a0a 100%); border-bottom: 2px solid #ef4444; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-radiation" style="color: #ef4444; filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.5));"></i>
                            O'TKIR DEFEKT (PITCH)
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">HUDUD (BO'LIM / PDB)</label>
                            <input id="m-def-area" placeholder="PDB-1" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:700;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">STANTSIYA / PEREGON</label>
                            <input id="m-def-station" placeholder="Qorlitog' - Bo'ston" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">KM PK (MANZIL)</label>
                            <input id="m-def-loc" placeholder="3840 KM 5 PK" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">TOMON</label>
                            <select id="m-def-side" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                                <option value="O'ng">O'ng</option>
                                <option value="Chap">Chap</option>
                                <option value="Har ikkala">Har ikkala</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; color:#fca5a5; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">KODI (NTD)</label>
                            <input id="m-def-code" placeholder="21.1 / 53.1" style="width:100%; padding:14px; background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); color:#ef4444; border-radius:12px; font-weight:900; font-size: 1.2rem;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">TOPSHIRIQ / CHORA</label>
                            <input id="m-def-action" placeholder="Tezlikni 25 km/soatgacha tushirish..." style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight: 600;">
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px;">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #ef4444, #991b1b); color: #fff; border: none; border-radius: 12px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">XAVFNI SAQLASH</button>
                    </div>
                </div>
            `;
        } else if (moduleKey === 'attendance') {
            formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #172554 100%); border-bottom: 2px solid #3b82f6; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-user-clock" style="color: #3b82f6; filter: drop-shadow(0 0 5px rgba(59,130,246,0.5));"></i>
                            XODIMLAR DAVOMATI
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">BO'LIM / PDB</label>
                            <input id="m-att-area" placeholder="PDB-1" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:800;">
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); grid-column: span 2; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">JAMI RO'YXAT (SPISOK)</span>
                                <input id="m-att-total" type="number" readonly style="background:transparent; border:none; color:#fbbf24; font-size: 1.8rem; font-weight: 900; outline: none; width: 100px;">
                            </div>
                            <div style="text-align: right;">
                                <span style="display:block; color:#6ee7b7; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">ISHDA (FAKT)</span>
                                <input id="m-att-fact" type="number" oninput="window.calcAttTotal()" style="background:transparent; border:none; color:#10b981; font-size: 2.2rem; font-weight: 900; outline: none; text-align: right; width: 120px;">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-column: span 2; gap: 15px;">
                            <div><label style="display:block; color:#94a3b8; font-size: 0.65rem; font-weight: 700; margin-bottom: 5px;">SAFAR</label><input id="m-att-trip" type="number" value="0" oninput="window.calcAttTotal()" style="width:100%; padding:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:8px;"></div>
                            <div><label style="display:block; color:#94a3b8; font-size: 0.65rem; font-weight: 700; margin-bottom: 5px;">DAM OLISH</label><input id="m-att-otpusk" type="number" value="0" oninput="window.calcAttTotal()" style="width:100%; padding:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:8px;"></div>
                            <div><label style="display:block; color:#94a3b8; font-size: 0.65rem; font-weight: 700; margin-bottom: 5px;">KASAL</label><input id="m-att-sick" type="number" value="0" oninput="window.calcAttTotal()" style="width:100%; padding:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:8px;"></div>
                            <div><label style="display:block; color:#94a3b8; font-size: 0.65rem; font-weight: 700; margin-bottom: 5px;">O'QISH</label><input id="m-att-study" type="number" value="0" oninput="window.calcAttTotal()" style="width:100%; padding:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:8px;"></div>
                            <div><label style="display:block; color:#94a3b8; font-size: 0.65rem; font-weight: 700; margin-bottom: 5px;">MA'MURIY</label><input id="m-att-mp" type="number" value="0" oninput="window.calcAttTotal()" style="width:100%; padding:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:8px;"></div>
                            <div><label style="display:block; color:#94a3b8; font-size: 0.65rem; font-weight: 700; margin-bottom: 5px;">BOSHQA</label><input id="m-att-other" type="number" value="0" oninput="window.calcAttTotal()" style="width:100%; padding:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:8px;"></div>
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px;">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #1d4ed8, #1e40af); color: #fff; border: none; border-radius: 12px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(30, 64, 175, 0.4);">SAQLASH</button>
                    </div>
                </div>
            `;
        } else if (moduleKey === 'oyna') {
            formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%); border-bottom: 2px solid #a855f7; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-clock-rotate-left" style="color: #a855f7; filter: drop-shadow(0 0 5px rgba(168,85,247,0.5));"></i>
                            ISHLASH OYNASI (WINDOW)
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">BEKAT / PEREGON</label>
                            <input id="m-oyna-loc" placeholder="Qorlitog' - Bo'ston" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:700;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">VAQTI (MUDDATI)</label>
                            <input id="m-oyna-time" placeholder="10:00 - 12:00" style="width:100%; padding:14px; background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.2); color:#c084fc; border-radius:12px; font-weight: 900;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">TOIFASI</label>
                            <select id="m-oyna-type" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                                <option value="Yakkalik">Yakkalik</option>
                                <option value="Ikkilik">Ikkilik</option>
                                <option value="Oraliq">Oraliq</option>
                            </select>
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">BAJARILADIGAN ISH</label>
                            <input id="m-oyna-work" placeholder="Relys almashtirish..." style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px;">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; border: none; border-radius: 12px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);">OYNA SAQLASH</button>
                    </div>
                </div>
            `;
        } else if (moduleKey === 'razryadka') {
            formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #172554 100%); border-bottom: 2px solid #f97316; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-fire-alt" style="color: #f97316; filter: drop-shadow(0 0 5px rgba(249,115,22,0.5));"></i>
                            PLET RAZRYADKA REJASI
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Bekat va bekatlar oralig'i</label>
                            <input id="m-raz-station" placeholder="Jayhun-Dautepa" style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px; font-weight: 600;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Yo'l</label>
                            <input id="m-raz-path" placeholder="Asosiy yo'l" style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Rels turi</label>
                            <input id="m-raz-railtype" placeholder="R65" style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Plet boshi</label>
                            <input id="m-raz-startkm" placeholder="4248 / 8" style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Plet oxiri</label>
                            <input id="m-raz-endkm" placeholder="4249 / 5" style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Uzunligi (m)</label>
                            <input id="m-raz-length" placeholder="711" style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fbbf24; border-radius:10px; font-weight: 900;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Sana</label>
                            <input id="m-raz-date" type="date" value="${window.selectedDispatcherDate}" style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                        </div>
                        <div>
                            <label style="display:block; color:#fb923c; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">t° kutilgan</label>
                            <input id="m-raz-exptemp" placeholder="+38" style="width:100%; padding:12px; background:rgba(249, 115, 22, 0.1); border:1px solid rgba(249, 115, 22, 0.3); color:#f97316; border-radius:10px; font-weight: 900;">
                        </div>
                        <div>
                            <label style="display:block; color:#4ade80; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">t° fakt</label>
                            <input id="m-raz-facttemp" placeholder="+40" style="width:100%; padding:12px; background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); color:#10b981; border-radius:10px; font-weight: 900;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Vaqti</label>
                            <input id="m-raz-time" placeholder="14:30-16:30" style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Uzayish (mm)</label>
                            <input id="m-raz-elongation" placeholder="70 / 85" style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px; font-weight: 800;">
                        </div>
                        <div style="grid-column: span 4;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 4px; text-transform: uppercase;">Sabab / Izoh</label>
                            <input id="m-raz-reason" placeholder="Uloqsiz temir yo'l izlarini..." style="width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px;">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 12px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);">REJANI SAQLASH</button>
                    </div>
                </div>
            `;
        } else if (moduleKey === 'material') {
            formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #064e3b 100%); border-bottom: 2px solid #10b981; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-boxes-stacked" style="color: #10b981; filter: drop-shadow(0 0 5px rgba(16,185,129,0.5));"></i>
                            MATERIAL SARFI
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">MATERIAL NOMI</label>
                            <input id="m-mat-name" placeholder="Shpal (beton)" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:700;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">BIRLIGI</label>
                            <input id="m-mat-unit" placeholder="dona / t" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#10b981; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">SARFLANGAN MIQDOR</label>
                            <input id="m-mat-qty" type="number" placeholder="50" style="width:100%; padding:14px; background:rgba(16, 185, 129, 0.05); border:1px solid rgba(16, 185, 129, 0.3); color:#34d399; border-radius:12px; font-weight: 900; font-size: 1.2rem;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">MANZIL (FOYDALANILGAN JOY)</label>
                            <input id="m-mat-loc" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px;">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #10b981, #065f46); color: #fff; border: none; border-radius: 12px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">SARFNI SAQLASH</button>
                    </div>
                </div>
            `;
        } else if (moduleKey === 'transport') {
            formHTML = `
                <div style="padding: 0; background: transparent;">
                    <div class="modal-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #fbbf24; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #f8fafc; font-size: 1.3rem; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-train" style="color: #fbbf24; filter: drop-shadow(0 0 5px rgba(251,191,36,0.5));"></i>
                            MOTORELSLI TRANSPORT
                        </h2>
                        <button onclick="window.closeDispatcherModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 35px; height: 35px; cursor: pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">LOKOMOTIV TURI</label>
                            <input id="m-tr-type" placeholder="AGMU / Drezina" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:700;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">NOMERI</label>
                            <input id="m-tr-num" placeholder="№ 532" style="width:100%; padding:14px; background:rgba(251, 191, 36, 0.05); border:1px solid rgba(251, 191, 36, 0.3); color:#fcd34d; border-radius:12px; font-weight: 900; font-size: 1.2rem;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">MASHINIST (F.I.SH)</label>
                            <input id="m-tr-name" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">VAQTI</label>
                            <input id="m-tr-time" type="time" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                        <div>
                            <label style="display:block; color:#94a3b8; font-size: 0.7rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">LOKATSIYA (KM)</label>
                            <input id="m-tr-loc" style="width:100%; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px;">
                        </div>
                    </div>
                    <div style="padding: 20px 30px; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 15px;">
                        <button onclick="window.closeDispatcherModal()" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 12px;">Bekor qilish</button>
                        <button onclick="window.saveModuleData('${moduleKey}')" style="padding: 12px 35px; background: linear-gradient(135deg, #fbbf24, #d97706); color: #000; border: none; border-radius: 12px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);">HARAKATNI SAQLASH</button>
                    </div>
                </div>
            `;
        }
        
        content.innerHTML = formHTML;
        modal.style.display = 'flex';
    };

    window.closeDispatcherModal = function() {
        document.getElementById('dispatcher-modal').style.display = 'none';
    };

    window.calcRazDiff = function() {
        const r = parseFloat(document.getElementById('m-raz-temp-r')?.value || 0);
        const h = parseFloat(document.getElementById('m-raz-temp-h')?.value || 0);
        const diff = (h - r).toFixed(1);
        const diffEl = document.getElementById('m-raz-diff');
        if (diffEl) diffEl.value = (diff > 0 ? '+' : '') + diff;
    };

    window.calcAttTotal = function() {
        const ids = ['m-att-fact', 'm-att-trip', 'm-att-otpusk', 'm-att-sick', 'm-att-study', 'm-att-mp', 'm-att-other'];
        let total = 0;
        ids.forEach(id => {
            const val = parseInt(document.getElementById(id)?.value || 0);
            total += val;
        });
        const totalEl = document.getElementById('m-att-total');
        if (totalEl) totalEl.value = total;
    };

    window.saveModuleData = function(moduleKey) {
        const data = { id: Date.now(), timestamp: new Date().toISOString() };

        try {
            if (moduleKey === 'ogoh') {
                data.station = document.getElementById('m-ogoh-station').value;
                data.km = document.getElementById('m-ogoh-km').value;
                data.path = document.getElementById('m-ogoh-path').value;
                data.speed = document.getElementById('m-ogoh-speed').value;
                data.reason = document.getElementById('m-ogoh-reason').value;
                data.time = document.getElementById('m-ogoh-time').value;
                data.resp = document.getElementById('m-ogoh-resp').value;
                window.dispatcherState.generalWarnRows.push(data);
            } else if (moduleKey === 'spravka') {
                data.area = document.getElementById('m-sp-area').value;
                data.obxod = document.getElementById('m-sp-obxod').value;
                data.isso = document.getElementById('m-sp-isso').value;
                data.putey = document.getElementById('m-sp-putey').value;
                data.kont = document.getElementById('m-sp-kont').value;
                data.mech = document.getElementById('m-sp-mech').value;
                data.leader = document.getElementById('m-sp-leader').value;
                data.exec = document.getElementById('m-sp-exec').value;
                data.vyav = document.getElementById('m-sp-vyav').value;
                data.ustr = document.getElementById('m-sp-ustr').value;
                window.dispatcherState.spravkaRows.push(data);
            } else if (moduleKey === 'reja') {
                data.area = document.getElementById('m-reja-area').value;
                data.work = document.getElementById('m-reja-work').value;
                data.location = document.getElementById('m-reja-location').value;
                data.staff = document.getElementById('m-reja-staff').value;
                data.machines = document.getElementById('m-reja-machines').value;
                window.dispatcherState.planRows.push(data);
            } else if (moduleKey === 'attendance') {
                data.area = document.getElementById('m-att-area').value;
                data.total = document.getElementById('m-att-total').value;
                data.fact = document.getElementById('m-att-fact').value;
                data.trip = document.getElementById('m-att-trip').value;
                data.otpusk = document.getElementById('m-att-otpusk').value;
                data.sick = document.getElementById('m-att-sick').value;
                data.study = document.getElementById('m-att-study').value;
                data.mp = document.getElementById('m-att-mp').value;
                data.other = document.getElementById('m-att-other').value;
                window.dispatcherState.attendanceRows.push(data);
            } else if (moduleKey === 'obxod') {
                data.area = document.getElementById('m-obxod-area').value;
                data.name = document.getElementById('m-obxod-name').value;
                data.tel = document.getElementById('m-obxod-tel').value;
                data.km = document.getElementById('m-obxod-km').value;
                data.kamchilik = document.getElementById('m-obxod-kamchilik').value;
                window.dispatcherState.obxodRows.push(data);
            } else if (moduleKey === 'oyna') {
                data.time = document.getElementById('m-oyna-time').value;
                data.loc = document.getElementById('m-oyna-loc').value;
                data.work = document.getElementById('m-oyna-work').value;
                data.type = document.getElementById('m-oyna-type').value;
                data.machines = document.getElementById('m-oyna-machines').value;
                data.status = document.getElementById('m-oyna-status').value;
                window.dispatcherState.oynaRows.push(data);
            } else if (moduleKey === 'temp') {
                data.area = document.getElementById('m-temp-area')?.value || '-';
                data.time = document.getElementById('m-temp-time')?.value || '-';
                data.info = document.getElementById('m-temp-info')?.value || '-';
                data.rail = document.getElementById('m-temp-rail')?.value || '0';
                data.air = document.getElementById('m-temp-air')?.value || '0';
                window.dispatcherState.tempData.push(data);
            } else if (moduleKey === 'defect') {
                data.area = document.getElementById('m-def-area').value;
                data.station = document.getElementById('m-def-station').value;
                data.loc = document.getElementById('m-def-loc').value;
                data.side = document.getElementById('m-def-side').value;
                data.code = document.getElementById('m-def-code').value;
                data.size = document.getElementById('m-def-size').value;
                data.action = document.getElementById('m-def-action').value;
                window.dispatcherState.defects.push(data);
            } else if (moduleKey === 'razryadka') {
                data.station = document.getElementById('m-raz-station').value;
                data.path = document.getElementById('m-raz-path').value;
                data.railType = document.getElementById('m-raz-railtype').value;
                data.startKM = document.getElementById('m-raz-startkm').value;
                data.endKM = document.getElementById('m-raz-endkm').value;
                data.length = document.getElementById('m-raz-length').value;
                data.date = document.getElementById('m-raz-date').value;
                data.expTemp = document.getElementById('m-raz-exptemp').value;
                data.factTemp = document.getElementById('m-raz-facttemp').value;
                data.startTemp = document.getElementById('m-raz-starttemp').value;
                data.endTemp = document.getElementById('m-raz-endtemp').value;
                data.elongation = document.getElementById('m-raz-elongation').value;
                data.time = document.getElementById('m-raz-time').value;
                data.reason = document.getElementById('m-raz-reason').value;
                window.dispatcherState.razryadka.push(data);
            } else if (moduleKey === 'material') {
                data.name = document.getElementById('m-mat-name').value;
                data.unit = document.getElementById('m-mat-unit').value;
                data.qty = document.getElementById('m-mat-qty').value;
                data.loc = document.getElementById('m-mat-loc').value;
                window.dispatcherState.materials.push(data);
            } else if (moduleKey === 'transport') {
                data.type = document.getElementById('m-tr-type').value;
                data.num = document.getElementById('m-tr-num').value;
                data.name = document.getElementById('m-tr-name').value;
                data.time = document.getElementById('m-tr-time').value;
                data.loc = document.getElementById('m-tr-loc').value;
                window.dispatcherState.transport.push(data);
            }

            window.refreshReportingTables();
            window.closeDispatcherModal();
            if (window.saveStateToDraft) window.saveStateToDraft();
        } catch (e) {
            console.error("Save error:", e);
            alert("Ma'lumotni saqlashda xatolik yuz berdi!");
        }
    };

    window.refreshReportingTables = function() {
        const state = window.dispatcherState;

        // Common row generator for consistency
        const rowWrap = (content, idx, deleteArray, deleteIdx) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}; transition: 0.3s;" onmouseover="this.style.background='rgba(56, 189, 248, 0.05)'" onmouseout="this.style.background='${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}'">
                ${content}
                <td style="padding: 12px 16px; text-align: center;">
                    <button onclick="window.deleteRow('${deleteArray}', ${deleteIdx})" style="color: rgba(239, 68, 68, 0.5); background: none; border: none; cursor: pointer; transition: 0.3s;" onmouseover="this.style.color='#ef4444'"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;

        // Attendance
        const attBody = document.getElementById('attendance-table-body');
        if (attBody) {
            attBody.innerHTML = state.attendanceRows.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; font-weight: 700; color: #f8fafc;">${row.area}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.total}</td>
                    <td style="padding: 15px 16px; text-align: center; font-weight: 800; color: #10b981; font-size: 1.1rem;">${row.fact}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.trip}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.otpusk}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.sick}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.study}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.mp}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.other}</td>
            `, idx, 'attendanceRows', idx)).join('') || '<tr><td colspan="10" style="padding: 40px; text-align: center; color: #475569; font-weight: 600;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Ogohlantirishlar
        const warnBody = document.getElementById('warn-table-body');
        if (warnBody) {
            warnBody.innerHTML = state.generalWarnRows.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; color: #f1f5f9; font-weight:600;">${row.station}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.km}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.path}</td>
                    <td style="padding: 15px 16px; text-align: center;"><span style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 5px 10px; border-radius: 6px; font-weight: 900; border: 1px solid rgba(239, 68, 68, 0.2);">${row.speed}</span></td>
                    <td style="padding: 15px 16px; color: #94a3b8; font-size: 0.85rem;">${escapeHtml(row.reason)}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.time}</td>
                    <td style="padding: 15px 16px; color: #38bdf8;">${row.resp}</td>
            `, idx, 'generalWarnRows', idx)).join('') || '<tr><td colspan="8" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Spravka
        const spravkaBody = document.getElementById('spravka-table-body');
        if (spravkaBody) {
            spravkaBody.innerHTML = state.spravkaRows.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; font-weight: 700; color: #f8fafc;">${row.area}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.obxod}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.isso}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.putey}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.kont}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.mech}</td>
                    <td style="padding: 15px 16px; color: #f1f5f9;">${row.leader}</td>
                    <td style="padding: 15px 16px; text-align: center;"><span style="color: #ef4444; font-weight: 900; font-size: 1rem; text-shadow: 0 0 10px rgba(239,68,68,0.3);">${row.vyav}</span></td>
                    <td style="padding: 15px 16px; text-align: center;"><span style="color: #10b981; font-weight: 900; font-size: 1rem; text-shadow: 0 0 10px rgba(16,185,129,0.3);">${row.ustr}</span></td>
            `, idx, 'spravkaRows', idx)).join('') || '<tr><td colspan="10" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Reja
        const planBody = document.getElementById('plan-table-body');
        if (planBody) {
            planBody.innerHTML = state.planRows.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; font-weight: 700; color: #f8fafc;">${row.area}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${escapeHtml(row.location)}</td>
                    <td style="padding: 15px 16px; color: #38bdf8; font-weight: 600;">${row.work}</td>
                    <td style="padding: 15px 16px; text-align: center;"><span style="background: rgba(56, 189, 248, 0.1); color: #38bdf8; padding: 4px 12px; border-radius: 20px; font-weight: 800; border: 1px solid rgba(56, 189, 248, 0.2);">${row.staff}</span></td>
                    <td style="padding: 15px 16px; color: #94a3b8; font-size: 0.85rem;">${row.machines}</td>
            `, idx, 'planRows', idx)).join('') || '<tr><td colspan="6" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Obxod
        const obxodBody = document.getElementById('obxod-table-body');
        if (obxodBody) {
            obxodBody.innerHTML = state.obxodRows.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; font-weight: 700; color: #f8fafc;">${row.area}</td>
                    <td style="padding: 15px 16px; color: #f1f5f9;">${escapeHtml(row.name)}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.tel}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.km}</td>
                    <td style="padding: 15px 16px;"><span style="color: #ef4444; font-size: 0.85rem; font-weight: 600;">${row.kamchilik}</span></td>
            `, idx, 'obxodRows', idx)).join('') || '<tr><td colspan="6" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Temp
        const tempBody = document.getElementById('temp-table-body');
        if (tempBody) {
            tempBody.innerHTML = state.tempData.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; font-weight: 700; color: #f8fafc;">${row.area}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.time}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.info}</td>
                    <td style="padding: 15px 16px; text-align: center;"><span style="color: #fb923c; font-weight: 900; font-size: 1.1rem; text-shadow: 0 0 10px rgba(249,115,22,0.3);">${row.rail}°C</span></td>
                    <td style="padding: 15px 16px; text-align: center;"><span style="color: #60a5fa; font-weight: 900; font-size: 1.1rem; text-shadow: 0 0 10px rgba(96,165,250,0.3);">${row.air}°C</span></td>
            `, idx, 'tempData', idx)).join('') || '<tr><td colspan="6" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Oyna
        const oynaBody = document.getElementById('oyna-table-body');
        if (oynaBody) {
            oynaBody.innerHTML = state.oynaRows.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; color: #a855f7; font-weight: 800;"><i class="fas fa-clock"></i> ${row.time}</td>
                    <td style="padding: 15px 16px; color: #f8fafc; font-weight: 600;">${row.loc}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.work}</td>
                    <td style="padding: 15px 16px; text-align: center;"><span style="background: rgba(168, 85, 247, 0.1); color: #c084fc; padding: 4px 10px; border-radius: 6px; font-weight: 800; border: 1px solid rgba(168, 85, 247, 0.2);">${row.type || 'Yakkalik'}</span></td>
                    <td style="padding: 15px 16px; color: #94a3b8; font-size: 0.85rem;">${row.machines || '-'}</td>
            `, idx, 'oynaRows', idx)).join('') || '<tr><td colspan="6" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Defects
        const defectBody = document.getElementById('defect-table-body');
        if (defectBody) {
            defectBody.innerHTML = state.defects.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; font-weight: 700; color: #f8fafc;">${row.area}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.station}</td>
                    <td style="padding: 15px 16px; color: #f1f5f9;">${row.loc}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.side}</td>
                    <td style="padding: 15px 16px; text-align: center;"><span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 4px 8px; border-radius: 4px; font-weight: 900; border: 1px solid #ef4444;">${row.code}</span></td>
                    <td style="padding: 15px 16px; text-align: center; font-weight: 800; color: #f1f5f9;">${row.size || '-'}</td>
                    <td style="padding: 15px 16px; color: #ef4444; font-weight: 600; font-size: 0.85rem;">${row.action}</td>
            `, idx, 'defects', idx)).join('') || '<tr><td colspan="8" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Razryadka
        const razBody = document.getElementById('razryadka-table-body');
        if (razBody) {
            razBody.innerHTML = state.razryadka.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; font-weight: 700; color: #f8fafc;">${row.station}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.path}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.startKM} - ${row.endKM}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #fbbf24; font-weight: 900;">${row.length}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #f97316; font-weight: 800;">${row.factTemp}°C</td>
                    <td style="padding: 15px 16px; text-align: center; color: #10b981; font-weight: 800;">${row.elongation}</td>
                    <td style="padding: 15px 16px; color: #94a3b8; font-size: 0.85rem;">${row.time}</td>
            `, idx, 'razryadka', idx)).join('') || '<tr><td colspan="8" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Materials
        const matBody = document.getElementById('material-table-body');
        if (matBody) {
            matBody.innerHTML = state.materials.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; font-weight: 700; color: #f8fafc;">${escapeHtml(row.name)}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.unit}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #10b981; font-weight: 900; font-size: 1.1rem;">${row.qty}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.loc}</td>
            `, idx, 'materials', idx)).join('') || '<tr><td colspan="5" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }

        // Transport
        const trBody = document.getElementById('transport-table-body');
        if (trBody) {
            trBody.innerHTML = state.transport.map((row, idx) => rowWrap(`
                    <td style="padding: 15px 16px; font-weight: 700; color: #f8fafc;">${row.type}</td>
                    <td style="padding: 15px 16px; color: #fbbf24; font-weight: 800;">${row.num}</td>
                    <td style="padding: 15px 16px; color: #f1f5f9;">${escapeHtml(row.name)}</td>
                    <td style="padding: 15px 16px; text-align: center; color: #94a3b8;">${row.time}</td>
                    <td style="padding: 15px 16px; color: #94a3b8;">${row.loc}</td>
            `, idx, 'transport', idx)).join('') || '<tr><td colspan="6" style="padding: 40px; text-align: center; color: #475569;">Ma\'lumot kiritilmagan</td></tr>';
        }
    };

    window.deleteRow = function(arrayKey, index) {
        if (!confirm('Ushbu ma\'lumotni o\'chirmoqchimisiz?')) return;
        
        let targetKey = arrayKey;
        // Simple mapping for keys that might differ between table calls and state
        if (arrayKey === 'ogoh') targetKey = (window.currentWarnTab === 'day') ? 'dayWarnRows' : 'generalWarnRows';
        if (arrayKey === 'spravka') targetKey = 'spravkaRows';
        if (arrayKey === 'reja') targetKey = 'planRows';
        if (arrayKey === 'obxod') targetKey = 'obxodRows';
        if (arrayKey === 'oyna') targetKey = 'oynaRows';
        if (arrayKey === 'material') targetKey = 'materials';
        if (arrayKey === 'transport') targetKey = 'transport';

        if (window.dispatcherState[targetKey]) {
            window.dispatcherState[targetKey].splice(index, 1);
            window.refreshReportingTables();
            if (window.saveStateToDraft) window.saveStateToDraft();
        }
    };

    window.setDispatcherGlobalDate = function(val) {
        window.selectedDispatcherDate = val;
        if (typeof initDispatcherData === 'function') {
            initDispatcherData().then(() => {
                window.refreshReportingTables();
            });
        } else {
            window.refreshReportingTables();
        }
    };

    window.currentWarnTab = 'day';
    window.switchWarnSubTab = function(type) {
        window.currentWarnTab = type;
        document.querySelectorAll('.warn-subtab').forEach(b => {
             b.style.background = 'transparent';
             b.style.color = '#64748b';
        });
        const activeBtn = document.getElementById('btn-warn-' + type);
        if (activeBtn) {
            activeBtn.style.background = '#3b82f6';
            activeBtn.style.color = '#fff';
        }
        window.refreshReportingTables();
    };

    window.renderWarnTable = function() {
        const tbody = document.getElementById('warn-table-body');
        if (!tbody) return;
        
        const rows = (window.currentWarnTab === 'day') ? window.dispatcherState.dayWarnRows : window.dispatcherState.generalWarnRows;
        
        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="padding: 40px; text-align: center; color: #334155; font-style: italic; border-bottom: 1px solid #cbd5e1;">Ma'lumotlar mavjud emas. "Qo'shish" tugmasini bosing.</td></tr>`;
            return;
        }

        tbody.innerHTML = rows.map((row, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding: 12px 16px; color: #0f172a; font-weight: 600;">${row.station}</td>
                <td style="padding: 12px 16px; color: #334155;">${row.km}</td>
                <td style="padding: 12px 16px; color: #334155;">${row.path}</td>
                <td style="padding: 12px 16px; color: #ef4444; font-weight: 800; font-size: 1rem;">${row.speed}</td>
                <td style="padding: 12px 16px; color: #0f172a;">${escapeHtml(row.reason)}</td>
                <td style="padding: 12px 16px; color: #334155; font-size: 0.85rem;">${row.time}</td>
                <td style="padding: 12px 16px; color: #334155;">${row.resp}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('ogoh', ${idx})" style="cursor: pointer; color: #334155; padding: 5px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };

    window.renderSpravkaTable = function() {
        const tbody = document.getElementById('spravka-table-body');
        if (!tbody) return;
        
        if (window.dispatcherState.spravkaRows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="12" style="padding: 40px; text-align: center; color: #334155; font-style: italic; border-bottom: 1px solid #cbd5e1;">Ma'lumotlar mavjud emas.</td></tr>`;
            return;
        }

        tbody.innerHTML = window.dispatcherState.spravkaRows.map((row, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding: 12px 16px; color: #1e3a8a; font-weight: 700;">${row.area || '-'}</td>
                <td style="padding: 12px 16px; color: #0f172a; font-weight: 600;">${row.obxod || '-'}</td>
                <td style="padding: 12px 16px; color: #334155;">${row.isso || '-'}</td>
                <td style="padding: 12px 16px; color: #334155;">${row.putey || '-'}</td>
                <td style="padding: 12px 16px; color: #0f172a; text-align: center;">${row.kont || '0'}</td>
                <td style="padding: 12px 16px; color: #334155;">${row.mech || '-'}</td>
                <td style="padding: 12px 16px; color: #0f172a; font-weight: 700;">${row.leader || '-'}</td>
                <td style="padding: 12px 16px; color: #334155;">${row.exec || '-'}</td>
                <td style="padding: 12px 16px; color: #f59e0b; font-weight: 800; text-align: center;">${row.vyav || '0'}</td>
                <td style="padding: 12px 16px; color: #10b981; font-weight: 800; text-align: center;">${row.ustr || '0'}</td>
                <td style="padding: 12px 16px; color: #ef4444; font-weight: 800; text-align: center;">${row.not_ustr || '0'}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('spravka', ${idx})" style="cursor: pointer; color: #334155; padding: 5px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };

    window.renderTempTable = function() {
        const body = document.getElementById('temp-table-body');
        if (!body) return;
        
        if (window.dispatcherState.tempData.length === 0) {
            body.innerHTML = `<tr><td colspan="7" style="padding: 40px; text-align: center; color: #334155; font-style: italic; border-bottom: 1px solid #cbd5e1;">Ma'lumotlar mavjud emas.</td></tr>`;
            return;
        }

        body.innerHTML = window.dispatcherState.tempData.map((t, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding: 12px 16px; text-align: center; color: #334155; font-weight: 600;">${idx + 1}</td>
                <td style="padding: 12px 16px; font-weight: 700; color: #1e3a8a;">${t.area || '-'}</td>
                <td style="padding: 12px 16px; text-align: center; color: #0f172a;">${t.time}</td>
                <td style="padding: 12px 16px; font-style: italic; color: #334155;">${t.info || '-'}</td>
                <td style="padding: 12px 16px; color: #ef4444; font-weight: 800; text-align: center; font-size: 1.1rem;">${t.rail}°C</td>
                <td style="padding: 12px 16px; color: #3b82f6; font-weight: 800; text-align: center; font-size: 1.1rem;">${t.air}°C</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('temp', ${idx})" style="cursor: pointer; color: #334155; padding: 5px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };

    window.renderDefectTable = function() {
        const body = document.getElementById('defect-table-body');
        if (!body) return;
        
        if (window.dispatcherState.defects.length === 0) {
            body.innerHTML = `<tr><td colspan="9" style="padding: 40px; text-align: center; color: #334155; font-style: italic; border-bottom: 1px solid #cbd5e1;">Defektlar aniqlanmagan.</td></tr>`;
            return;
        }

        body.innerHTML = window.dispatcherState.defects.map((d, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding: 12px 16px; text-align: center; color: #334155; font-weight: 600;">${idx + 1}</td>
                <td style="padding: 12px 16px; color: #1e3a8a; font-weight: 700;">${d.area || '-'}</td>
                <td style="padding: 12px 16px; color: #0f172a;">${d.station || '-'}</td>
                <td style="padding: 12px 16px; font-weight: 600; color: #334155;">${d.loc}</td>
                <td style="padding: 12px 16px; text-align: center; color: #0f172a;">${d.side}</td>
                <td style="padding: 12px 16px; color: #ef4444; font-weight: 800; text-align: center;">${d.code}</td>
                <td style="padding: 12px 16px; text-align: center; color: #0f172a;">${d.size} mm</td>
                <td style="padding: 12px 16px; color: #3b82f6; font-weight: 600;">${d.action || '-'}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('defect', ${idx})" style="cursor: pointer; color: #334155; padding: 5px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };

    window.renderPlanTable = function() {
        const tbody = document.getElementById('plan-table-body');
        if (!tbody) return;
        
        if (window.dispatcherState.planRows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 40px; text-align: center; color: #334155; font-style: italic; border-bottom: 1px solid #cbd5e1;">Ma'lumotlar mavjud emas.</td></tr>`;
            return;
        }

        let totalStaff = 0;
        tbody.innerHTML = window.dispatcherState.planRows.map((row, idx) => {
            const rowStaff = parseInt(row.staff) || 0;
            totalStaff += rowStaff;
            return `
                <tr style="border-bottom: 1px solid #cbd5e1; background: #fff; transition: background 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='#fff'">
                    <td style="padding: 12px 16px; color: #0f172a; font-weight: 500;">${window.currentUser?.bolinmalar?.[0] || 'Bo\'lim'}</td>
                    <td style="padding: 12px 16px; color: #0f172a;">${escapeHtml(row.location || '-')}</td>
                    <td style="padding: 12px 16px; color: #0f172a;">${row.work || '-'}</td>
                    <td style="padding: 12px 16px; color: #0f172a; font-weight: 600; text-align: center;">${row.staff}</td>
                    <td style="padding: 12px 16px; color: #0f172a;">${row.machines || '-'}</td>
                    <td style="padding: 12px 16px; text-align: center; color: #334155;">
                        <i class="fas fa-trash-alt" onclick="window.deleteRow('reja', ${idx})" style="cursor: pointer; padding: 5px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                    </td>
                </tr>
            `;
        }).join('');

        // Update Total Footer
        const tfoot = document.getElementById('plan-table-footer');
        if (tfoot) {
            tfoot.innerHTML = `
                <tr>
                    <td colspan="3" style="padding: 16px; text-align: right; font-weight: 700; color: #0f172a; font-size: 0.875rem;">Jami kishi:</td>
                    <td style="padding: 16px; text-align: center; font-weight: 700; color: #0f172a; font-size: 1rem; border-top: 1px solid #cbd5e1;">${totalStaff}</td>
                    <td colspan="2"></td>
                </tr>
            `;
        }
    };

    window.renderOynaTable = function() {
        const tbody = document.getElementById('oyna-table-body');
        if (!tbody) return;
        
        if (window.dispatcherState.oynaRows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 40px; text-align: center; color: #334155; font-style: italic; border-bottom: 1px solid #cbd5e1;">Texnik oynalar mavjud emas.</td></tr>`;
            return;
        }

        tbody.innerHTML = window.dispatcherState.oynaRows.map((row, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding: 12px 16px; color: #1e3a8a; font-weight: 700;">${row.time || '-'}</td>
                <td style="padding: 12px 16px; color: #0f172a; font-weight: 600;">${row.loc || '-'}</td>
                <td style="padding: 12px 16px; color: #0f172a;">${row.work || '-'}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <span style="padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; background: ${row.status === 'Bajarildi' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'}; color: ${row.status === 'Bajarildi' ? '#10b981' : '#f59e0b'};">
                        ${row.status || '-'}
                    </span>
                </td>
                <td style="padding: 12px 16px; color: #334155; font-size: 0.85rem;">${escapeHtml(row.comment || '-')}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('oyna', ${idx})" style="cursor: pointer; color: #334155; padding: 5px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };

    window.renderAttendanceTable = function() {
        const body = document.getElementById('attendance-table-body');
        if (!body) return;
        
        if (window.dispatcherState.attendanceRows.length === 0) {
            body.innerHTML = `<tr><td colspan="10" style="padding: 40px; text-align: center; color: #334155; font-style: italic; border-bottom: 1px solid #cbd5e1;">Ma'lumotlar mavjud emas. "Qo'shish" tugmasini bosing.</td></tr>`;
            return;
        }

        body.innerHTML = window.dispatcherState.attendanceRows.map((row, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding: 12px 16px; color: #1e3a8a; font-weight: 700;">${row.area || '-'}</td>
                <td style="padding: 12px 16px; text-align: center; color: #0f172a; font-weight: 700;">${row.total || 0}</td>
                <td style="padding: 12px 16px; text-align: center; color: #10b981; font-weight: 800;">${row.fact || 0}</td>
                <td style="padding: 12px 16px; text-align: center; color: #334155;">${row.trip || 0}</td>
                <td style="padding: 12px 16px; text-align: center; color: #334155;">${row.otpusk || 0}</td>
                <td style="padding: 12px 16px; text-align: center; color: #334155;">${row.sick || 0}</td>
                <td style="padding: 12px 16px; text-align: center; color: #334155;">${row.study || 0}</td>
                <td style="padding: 12px 16px; text-align: center; color: #334155;">${row.mp || 0}</td>
                <td style="padding: 12px 16px; text-align: center; color: #334155;">${row.other || 0}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('attendance', ${idx})" style="cursor: pointer; color: #334155; padding: 5px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };

    window.renderObxodTable = function() {
        const tbody = document.getElementById('obxod-table-body');
        if (!tbody) return;
        
        if (window.dispatcherState.obxodRows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 40px; text-align: center; color: #334155; font-style: italic; border-bottom: 1px solid #cbd5e1;">Ma'lumotlar mavjud emas.</td></tr>`;
            return;
        }

        tbody.innerHTML = window.dispatcherState.obxodRows.map((row, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding: 12px 16px; color: #1e3a8a; font-weight: 700;">${row.area || '-'}</td>
                <td style="padding: 12px 16px; color: #0f172a; font-weight: 600;">${escapeHtml(row.name)}</td>
                <td style="padding: 12px 16px; color: #3b82f6; text-align: center;">${row.tel || row.phone}</td>
                <td style="padding: 12px 16px; color: #0f172a; text-align: center; font-weight: 700;">${row.km}</td>
                <td style="padding: 12px 16px; color: #ef4444;">${row.kamchilik || row.defect || 'Kamchilik yo\'q'}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('obxod', ${idx})" style="cursor: pointer; color: #334155; padding: 5px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };
 
    window.renderRazryadkaTable = function() {
        const body = document.getElementById('razryadka-table-body');
        if (!body) return;
        if (window.dispatcherState.razryadka.length === 0) {
            body.innerHTML = `<tr><td colspan="10" style="padding:40px; text-align:center; color:#334155; font-style:italic; border-bottom: 1px solid #cbd5e1;">Ma'lumotlar mavjud emas.</td></tr>`;
            return;
        }
        body.innerHTML = window.dispatcherState.razryadka.map((r, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding: 12px 16px; text-align: center; color: #334155; font-weight: 600;">${idx + 1}</td>
                <td style="padding: 12px 16px; font-weight: 700; color: #1e3a8a; text-align: left;">${r.area}</td>
                <td style="padding: 12px 16px; text-align: left; color: #0f172a;">${r.station}</td>
                <td style="padding: 12px 16px; font-weight: 600; color: #334155; text-align: center;">${r.loc}</td>
                <td style="padding: 12px 16px; color: #0f172a; text-align: center;">${r.path}</td>
                <td style="padding: 12px 16px; color: #10b981; font-weight: 800; text-align: center;">${r.tempR}°C</td>
                <td style="padding: 12px 16px; color: #3b82f6; text-align: center;">${r.tempA || '-'}°C</td>
                <td style="padding: 12px 16px; color: #ef4444; font-weight: 800; text-align: center;">${r.tempH}°C</td>
                <td style="padding: 12px 16px; font-weight: 700; color: #1e3a8a; text-align: center;">${r.diff}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('razryadka', ${idx})" style="cursor: pointer; color: #334155; padding: 5px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };

    window.renderMaterialTable = function() {
        const body = document.getElementById('material-table-body');
        if (!body) return;
        if (window.dispatcherState.materials.length === 0) {
            body.innerHTML = `<tr><td colspan="5" style="padding:40px; text-align:center; color:#334155; font-style:italic; border-bottom: 1px solid #cbd5e1;">Ma'lumotlar mavjud emas.</td></tr>`;
            return;
        }
        body.innerHTML = window.dispatcherState.materials.map((m, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding:12px 16px; font-weight:600; color: #0f172a;">${escapeHtml(m.name)}</td>
                <td style="padding:12px 16px; color: #334155; text-align:center;">${m.unit}</td>
                <td style="padding:12px 16px; text-align:center; font-weight:700; color:#10b981;">${m.qty}</td>
                <td style="padding:12px 16px; color: #334155;">${m.loc}</td>
                <td style="padding:12px 16px; text-align:center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('material', ${idx})" style="cursor:pointer; color: #334155; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };

    window.renderTransportTable = function() {
        const body = document.getElementById('transport-table-body');
        if (!body) return;
        if (window.dispatcherState.transport.length === 0) {
            body.innerHTML = `<tr><td colspan="6" style="padding:40px; text-align:center; color:#334155; font-style:italic; border-bottom: 1px solid #cbd5e1;">Ma'lumotlar mavjud emas.</td></tr>`;
            return;
        }
        body.innerHTML = window.dispatcherState.transport.map((t, idx) => `
            <tr style="border-bottom: 1px solid #cbd5e1; transition: 0.2s;" onmouseover="this.style.background='hsl(210, 40%, 96.1%, 0.5)'" onmouseout="this.style.background='white'">
                <td style="padding: 12px 16px; font-weight:600; color: #0f172a;">${t.type}</td>
                <td style="padding: 12px 16px; font-weight:700; color: #f59e0b; text-align:center;">${t.num}</td>
                <td style="padding: 12px 16px; color: #0f172a; font-weight: 500;">${escapeHtml(t.name)}</td>
                <td style="padding: 12px 16px; text-align:center; color: #3b82f6; font-weight:600;">${t.time}</td>
                <td style="padding: 12px 16px; color: #334155;">${t.loc}</td>
                <td style="padding: 12px 16px; text-align:center;">
                    <i class="fas fa-trash-alt" onclick="window.deleteRow('transport', ${idx})" style="cursor:pointer; color: #334155; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#334155'"></i>
                </td>
            </tr>
        `).join('');
    };

    window.initDispatcherData = async function() {
        try {
            const dateStr = window.selectedDispatcherDate;
            const reports = await SmartUtils.fetchAPI(`/reports?date=${dateStr}`) || [];
            
            // Clear existing reports
            for (let key in window.subdivisionReports) { delete window.subdivisionReports[key]; }
            reports.forEach(r => { window.subdivisionReports[r.bolinma_id] = r; });
            
            // 1. Reset state
            Object.keys(window.dispatcherState).forEach(k => {
                window.dispatcherState[k] = Array.isArray(window.dispatcherState[k]) ? [] : window.dispatcherState[k];
            });

            // 2. Load from Server (if user is bolinma and report exists)
            let loadedFromServer = false;
            if (window.currentUser && window.currentUser.role === 'bolinma') {
                const bid = window.currentUser.bolinmalar?.[0];
                if (bid && window.subdivisionReports[bid]) {
                    const sd = window.subdivisionReports[bid].structuredData;
                    if (sd) {
                        window.dispatcherState.dayWarnRows = sd.dayWarnRows || [];
                        window.dispatcherState.generalWarnRows = sd.generalWarnRows || [];
                        window.dispatcherState.spravkaRows = sd.spravkaData || [];
                        window.dispatcherState.planRows = sd.planData || [];
                        window.dispatcherState.obxodRows = sd.obxodData || [];
                        window.dispatcherState.oynaRows = sd.oynaData || [];
                        window.dispatcherState.attendanceRows = sd.attendance || [];
                        window.dispatcherState.tempData = sd.tempData || [];
                        window.dispatcherState.defects = sd.defektData || [];
                        window.dispatcherState.razryadka = sd.razryadkaData || [];
                        window.dispatcherState.materials = sd.materialsData || [];
                        window.dispatcherState.transport = sd.transportData || [];
                        loadedFromServer = true;
                    }
                }
            }

            // 3. Merge with Draft (Local Changes)
            const draft = localStorage.getItem(getDraftKey());
            if (draft) {
                try {
                    const localData = JSON.parse(draft);
                    // If server has data, we might want to ask or just merge
                    // For now, let's prioritize local draft if it contains more/newer data
                    Object.keys(localData).forEach(key => {
                        if (Array.isArray(localData[key]) && localData[key].length > 0) {
                             // Use local if server was empty or if user wants to continue editing
                             if (!loadedFromServer || localData[key].length > window.dispatcherState[key].length) {
                                 window.dispatcherState[key] = localData[key];
                             }
                        }
                    });
                    console.log("Draft data merged successfully.");
                } catch (e) { console.error("Draft load error:", e); }
            }

            recentReports = await SmartUtils.fetchAPI('/reports/history') || [];
            window.refreshReportingTables();
        } catch (e) { console.error("Data error:", e); }
    }

    window.getDispatcherDashboardHTML = function() {
        if (!window.currentUser) {
            const saved = localStorage.getItem('currentUser');
            if (saved) window.currentUser = JSON.parse(saved);
        }
        if (!window.currentUser) return '<div style="padding:40px; text-align:center; color:#fff;">Tizimga kirilmagan.</div>';

        const isDispatcher = window.currentUser.role === 'admin' || (window.currentUser.departments && window.currentUser.departments.includes('dispetcher'));

        if (isDispatcher) {
            return renderDispatcherListView();
        }

        if (window.currentUser.role === 'bolinma') {
            const bid = window.currentUser.bolinmalar?.[0];
            if (!bid) return '<div style="padding:40px; text-align:center; color:#fff;">Sizga biriktirilgan bo\'linma topilmadi.</div>';
            return renderSubdivisionReportSendView(bid);
        }

        return '<div style="padding:40px; text-align:center; color:#64748b;">Hisobot yuborish uchun huquqingiz yetarli emas.</div>';
    }

    /**
     * DISPATCHER (ADMIN) VIEW - CLEAN DARK
     */
    window.renderDispatcherListView = function() {
        const allReps = Object.values(window.subdivisionReports);
        const analytics = {
            maxTemp: allReps.reduce((max, r) => {
                const mt = r.structuredData?.tempData?.length > 0
                    ? Math.max(...r.structuredData.tempData.map(t => parseFloat(t.temp))) : 0;
                return Math.max(max, mt);
            }, 45.2),
            activeWarnings: allReps.reduce((s, r) => s + (r.structuredData?.warningForm?.zayavka ? 1 : 0), 0),
            pendingDefects: allReps.reduce((s, r) => s + (r.structuredData?.defektData?.length || 0), 0),
            activePersonnel: allReps.reduce((s, r) => s + (r.structuredData?.spravkaData?.length || 0), 0),
            submissionCount: allReps.length,
            activeTransport: 0 
        };
        
        const todayDateText = new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
        const weekdayText = new Date().toLocaleDateString('uz-UZ', { weekday: 'long' });

        return `
            <div id="dispatcher-dashboard" style="background: #f1f5f9; min-height: 100vh; padding: 40px; font-family: 'Inter', sans-serif; display: flex; flex-direction: column;">
                
                <!-- 0. ADMIN TOP NAVIGATION & DATE PICKER -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <h1 style="margin:0; font-size: 1.5rem; font-weight: 950; color: #020617; letter-spacing: -0.02em;">DISPETCHER BOSHQARUV PANELI</h1>
                        
                        <div style="position: relative; display: flex; align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px 15px; gap: 10px; color: #020617; font-weight: 700; font-size: 0.95rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;">
                            <i class="fas fa-calendar-alt" style="color: #64748b; font-size: 0.9rem;"></i>
                            <span>${getUzbekDateString(window.selectedDispatcherDate)}</span>
                            <input type="date" value="${window.selectedDispatcherDate}" onchange="window.setDispatcherGlobalDate(this.value)" 
                                   style="position: absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor: pointer; z-index: 2;">
                        </div>
                        <button onclick="window.selectedDispatcherDate = new Date().toISOString().split('T')[0]; window.refreshDispatcherData();" style="padding: 8px 20px; background: #fff; color: #020617; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.9rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Bugun</button>
                    </div>
                    <div style="color: #94a3b8; font-weight: 600; font-size: 0.9rem;">
                        <span style="margin-right: 15px;">Navbatchi dispetcher</span>
                        <i class="fas fa-user-circle"></i>
                    </div>
                </div>

                <!-- 1. KPI HEADER (CARDS) -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                    <!-- Personnel Card -->
                    <div style="background: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                         <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div style="color: #64748b; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Kontingent (fakt / reja)</div>
                            <i class="fas fa-users" style="color: #3b82f6; opacity: 0.8;"></i>
                         </div>
                         <div style="font-size: 2.2rem; font-weight: 900; color: #0f172a;">${analytics.activePersonnel} / 26</div>
                         <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">Yo'q: 0</div>
                    </div>
                    <!-- Warnings Card -->
                    <div style="background: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #ef444455; border-bottom: 3px solid #ef4444;">
                         <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div style="color: #64748b; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Faol ogohlantirishlar</div>
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                         </div>
                         <div style="font-size: 2.2rem; font-weight: 900; color: #0f172a;">${analytics.activeWarnings}</div>
                         <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">Bugun qo'shildi: ${analytics.activeWarnings}</div>
                    </div>
                    <!-- Oynalar Card -->
                    <div style="background: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                         <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div style="color: #64748b; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Oynalar (Bajarildi / Jami)</div>
                            <i class="fas fa-window-restore" style="color: #10b981;"></i>
                         </div>
                         <div style="font-size: 2.2rem; font-weight: 900; color: #0f172a;">0 / 0</div>
                         <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">Kelishilgan: 0</div>
                    </div>
                    <!-- Temp Card -->
                    <div style="background: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                         <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div style="color: #64748b; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Rels harorati</div>
                            <i class="fas fa-thermometer-half" style="color: #f59e0b;"></i>
                         </div>
                         <div style="font-size: 2.2rem; font-weight: 900; color: #0f172a;">${analytics.maxTemp} °C</div>
                         <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">Kunlik maks: ${analytics.maxTemp} °C</div>
                    </div>
                </div>

                <!-- 2. LIVE PLAN MONITORING BOARD -->
                <div style="margin-bottom: 30px; background: #fff; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 1.2rem; color: #0f172a; font-weight: 900; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-satellite-dish" style="color: #3b82f6;"></i> OPERATIV REJALAR NAZOROTI (PU-28)
                        </h3>
                        <button onclick="window.openUnifiedPlanModal()" style="padding: 8px 15px; background: #fbbf24; border: none; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 0.85rem; color: #000;">
                            <i class="fas fa-list-ul"></i> Jami rejalarni ko'rish
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px;">
                        ${subdivisions.map(sub => {
                            const r = window.subdivisionReports[sub.id];
                            const plans = r?.structuredData?.planData || [];
                            const isSubmitted = plans.length > 0;
                            return `
                                <div onclick="window.openSubdivisionAnalytics('${sub.id}')" style="background: ${isSubmitted ? 'rgba(16, 185, 129, 0.05)' : '#f8fafc'}; border: 1px solid ${isSubmitted ? '#10b981' : '#e2e8f0'}; border-radius: 12px; padding: 15px; cursor: pointer; transition: 0.2s; position: relative;">
                                    <div style="font-weight: 800; color: #1e293b; font-size: 0.85rem; margin-bottom: 5px;">${escapeHtml(sub.name)}</div>
                                    <div style="display: flex; align-items: center; gap: 5px;">
                                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${isSubmitted ? '#10b981' : '#f59e0b'};"></div>
                                        <span style="font-size: 0.75rem; color: ${isSubmitted ? '#059669' : '#d97706'}; font-weight: 700;">
                                            ${isSubmitted ? 'Reja yuborilgan' : 'Kutilmoqda...'}
                                        </span>
                                    </div>
                                    ${isSubmitted ? `
                                        <div style="margin-top: 8px; font-size: 0.7rem; color: #64748b; font-style: italic;">
                                            ${plans.length} ta operativ topshiriq
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- 3. ANALYTICS & GRID VIEW -->
                <div style="display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 20px;">
                    
                    <!-- Left Column: Status Monitor -->
                    <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h3 style="margin: 0 0 20px 0; font-size: 1.1rem; color: #0f172a; font-weight: 800;">Tizim ko'rsatkichlari</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${subdivisions.map(sub => {
                                const r = window.subdivisionReports[sub.id];
                                const sd = r?.structuredData;
                                return `
                                    <div onclick="window.openSubdivisionAnalytics('${sub.id}')" style="padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.2s;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                            <span style="font-weight: 800; color: #1e293b;">${escapeHtml(sub.name)}</span>
                                            <i class="fas fa-circle" style="color: ${r ? '#10b981' : '#f59e0b'}; font-size: 0.6rem;"></i>
                                        </div>
                                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; font-size: 0.75rem; color: #94a3b8;">
                                            <div title="Xodimlar" style="text-align: center; background: ${sd?.spravkaData?.length || sd?.attendance?.length ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}; padding: 5px; border-radius: 6px; color: ${sd?.spravkaData?.length || sd?.attendance?.length? '#3b82f6' : '#94a3b8'};">
                                                <i class="fas fa-users"></i>
                                            </div>
                                            <div title="Ogohlantirishlar" style="text-align: center; background: ${sd?.dayWarnRows?.length || sd?.generalWarnRows?.length ? 'rgba(239, 68, 68, 0.1)' : 'transparent'}; padding: 5px; border-radius: 6px; color: ${sd?.dayWarnRows?.length || sd?.generalWarnRows?.length ? '#ef4444' : '#94a3b8'};">
                                                <i class="fas fa-exclamation-triangle"></i>
                                            </div>
                                            <div title="Defektlar" style="text-align: center; background: ${sd?.defektData?.length ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}; padding: 5px; border-radius: 6px; color: ${sd?.defektData?.length ? '#10b981' : '#94a3b8'};">
                                                <i class="fas fa-microscope"></i>
                                            </div>
                                            <div title="Reja" style="text-align: center; background: ${sd?.planData?.length ? 'rgba(245, 158, 11, 0.1)' : 'transparent'}; padding: 5px; border-radius: 6px; color: ${sd?.planData?.length ? '#f59e0b' : '#94a3b8'};">
                                                <i class="fas fa-calendar-check"></i>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Middle Column: Harorat Grafiki (Mock) -->
                    <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: relative;">
                        <h3 style="margin: 0 0 20px 0; font-size: 1.1rem; color: #0f172a; font-weight: 800;">Harorat grafiki</h3>
                        <div style="height: 300px; width: 100%; border-bottom: 2px solid #cbd5e1; position: relative; margin-top: 50px;">
                            <!-- SVG Chart Path Mock -->
                            <svg width="100%" height="300" style="position: absolute; bottom: 0; left: 0;">
                                <path d="M0,150 L100,140 L200,120 L300,100 L400,130 L500,160 L600,180" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="0" opacity="0.6"></path>
                                <path d="M0,200 L100,210 L200,190 L300,180 L400,200 L500,220 L600,230" fill="none" stroke="#3b82f6" stroke-width="3" stroke-dasharray="0" opacity="0.4"></path>
                            </svg>
                            <div style="position: absolute; bottom: -25px; width: 100%; display: flex; justify-content: space-between; color: #94a3b8; font-size: 0.75rem; font-weight: 600;">
                                <span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>00:00</span><span>04:00</span><span>07:00</span>
                            </div>
                        </div>
                        <div style="margin-top: 40px; display: flex; justify-content: center; gap: 20px; font-size: 0.8rem; font-weight: 700;">
                            <span style="color: #ef4444; display: flex; align-items: center; gap: 8px;"><div style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></div> Rels</span>
                            <span style="color: #3b82f6; display: flex; align-items: center; gap: 8px;"><div style="width: 10px; height: 10px; border-radius: 50%; background: #3b82f6;"></div> Havo</span>
                        </div>
                    </div>

                    <!-- Right Column: Recent Activity Feed -->
                    <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h3 style="margin: 0 0 20px 0; font-size: 1.1rem; color: #0f172a; font-weight: 800;">So'nggi amallar</h3>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            ${recentReports.length > 0 ? recentReports.map(rep => rep.content ? `
                                <div style="display: flex; gap: 15px; align-items: flex-start;">
                                    <div style="width: 40px; height: 40px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #3b82f6; font-size: 0.9rem;">
                                        <i class="fas fa-clipboard-list"></i>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="font-size: 0.9rem; font-weight: 700; color: #1e293b;">${rep.bolinma_id}: ${escapeHtml(rep.content)}</div>
                                        <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">${rep.time || '12:00'}</div>
                                    </div>
                                </div>
                            ` : '').join('') : `
                                <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 0.8rem;">Ma'lumotlar mavjud emas</div>
                            `}
                        </div>
                    </div>

                </div>
            </div>`;
    }

    /**
     * SUBDIVISION (BOLINMA) FORM - DOCUMENT FAITHFUL EDITION
     * Replicates official Spravka, Obxodchik, and Temperatura docs.
     */
    window.renderSubdivisionReportSendView = function(bolinmaId) {
        const sub = subdivisions.find(s => s.id === bolinmaId);

        return `
        <div style="background: #0f172a; height: 100vh; display: flex; flex-direction: column; color: #fff; font-family: 'Inter', sans-serif;">
            <!-- MODAL OVERLAY - PREMIUM GLASSMORPHISM -->
            <div id="dispatcher-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(12px); z-index: 99999; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                <div id="dispatcher-modal-content" style="background: radial-gradient(circle at top left, #0f172a, #020617); border: 2px solid rgba(56, 189, 248, 0.3); border-radius: 24px; width: 750px; max-width: 95%; box-shadow: 0 0 50px rgba(0, 0, 0, 0.8), 0 0 100px rgba(56, 189, 248, 0.1); overflow: hidden; transform: scale(1); animation: modalEnter 0.3s ease-out;">
                    <style>@keyframes modalEnter { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }</style>
                </div>
            </div>
            <!-- TOP SUB-HEADER -->
            <div style="padding: 18px 40px; background: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; z-index: 1000; backdrop-filter:blur(10px);">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div onclick="window.renderDispatcherMain()" style="cursor: pointer; background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; transition:0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" onmouseover="this.style.color='#fff'; this.style.background='rgba(59,130,246,0.2)'" onmouseout="this.style.color='#94a3b8'; this.style.background='rgba(255,255,255,0.03)'">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                    <div style="height: 24px; width: 1px; background: rgba(255,255,255,0.1);"></div>
                    <h2 style="margin:0; font-size: 1.15rem; color: #fff; font-weight: 900; letter-spacing:0.5px; display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-satellite-dish" style="color:#d4af37;"></i> ${escapeHtml(sub?.name || 'Bolinma')} <span style="color:#64748b; font-weight:600; font-size:0.8rem;">HISOBOT MARKAZI</span>
                    </h2>
                </div>
                
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 0.8rem; color: #94a3b8;">Hisobot sanasi:</span>
                    <div style="position: relative; display: flex; align-items: center; background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 2px 10px;">
                        <span style="color: #fbbf24; font-weight: 800; font-size: 0.9rem; padding: 5px 10px;">${getUzbekDateString(window.selectedDispatcherDate)}</span>
                        <input type="date" value="${window.selectedDispatcherDate}" onchange="window.setDispatcherGlobalDate(this.value)" 
                               style="position: absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor: pointer; z-index: 2;">
                        <i class="fas fa-calendar-alt" style="color: #94a3b8; font-size: 0.8rem;"></i>
                    </div>
                </div>
            </div>

            <div style="flex: 1; display: flex; overflow: hidden;">
                <!-- SIDEBAR -->
                <div id="dispatcher-sidebar" style="width: 280px; background: #020617; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0;">
                    <div style="padding: 30px 25px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #d4af37, #f59e0b); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 900; font-size: 1.4rem; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);">YD</div>
                            <div>
                                <div style="font-weight: 900; font-size: 0.95rem; color: #fff; letter-spacing:0.5px;">Yo'l dispetcheri</div>
                                <div style="font-size: 0.65rem; color: #64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Qorlitog' PCH-16</div>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 20px 0;">
                        <div style="padding: 0 25px; font-size: 0.65rem; font-weight: 800; color: #64748b; letter-spacing: 1px; margin-bottom: 15px; text-transform: uppercase;">BOSHQARUV</div>
                        <div class="sidebar-item active" onclick="switchReportTab(this, 'tab-dashboard')">
                            <i class="fas fa-th-large"></i> <span>Boshqaruv paneli</span>
                        </div>

                        <div style="padding: 20px 16px 8px; font-size: 0.65rem; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">TEZKOR REJALASHTIRISH</div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-reja')">
                            <i class="fas fa-calendar-check"></i> <span>Ish rejasi </span>
                        </div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-spravka')">
                            <i class="fas fa-file-signature"></i> <span>Bajarilgan ish (Spravka)</span>
                        </div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-oyna')">
                            <i class="fas fa-clock"></i> <span>Texnik oynalar</span>
                        </div>

                        <div style="padding: 20px 16px 8px; font-size: 0.65rem; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">TEXNIK NAZORAT</div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-temp')">
                            <i class="fas fa-thermometer-half"></i> <span>Harorat monitoringi</span>
                        </div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-defekt')">
                            <i class="fas fa-microscope"></i> <span>Defektoskopiya</span>
                        </div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-razryadka')">
                            <i class="fas fa-hammer"></i> <span>Razryadka monitoringi</span>
                        </div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-material')">
                            <i class="fas fa-boxes"></i> <span>Materiallar sarfi</span>
                        </div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-transport')">
                            <i class="fas fa-truck"></i> <span>Motorelsli transport</span>
                        </div>

                        <div style="padding: 20px 16px 8px; font-size: 0.65rem; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">YORDAMCHI TIZIMLAR</div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-external')" style="padding: 10px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-radius: 6px; margin-bottom: 4px; transition: 0.2s; opacity: 0.7;">
                            <i class="fas fa-external-link-alt"></i> <span>Razryadka (Tashqi)</span>
                        </div>

                        <div style="padding: 20px 16px 8px; font-size: 0.65rem; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">MA'MURIY</div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-obxod')">
                            <i class="fas fa-walking"></i> <span>Piyoda tekshiruv</span>
                        </div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-attendance')">
                            <i class="fas fa-users"></i> <span>Ishga chiqish</span>
                        </div>
                        <div class="sidebar-item" onclick="switchReportTab(this, 'tab-ogoh')">
                            <i class="fas fa-exclamation-triangle"></i> <span>Ogohlantirishlar</span>
                        </div>
                    </div>
                </div>

                <!-- MAIN CONTENT AREA -->
                <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #020617; position:relative;">
                    <div style="position:absolute; top:-200px; right:-200px; width:500px; height:500px; background:radial-gradient(circle, rgba(54,82,246,0.05) 0%, transparent 70%); pointer-events:none;"></div>
                    
                    <div id="tab-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; position:relative; z-index:2;">
                        
                        <!-- 1. DASHBOARD -->
                        <div id="tab-dashboard" class="report-tab-content" style="padding: 50px 60px; height: 100%; display: flex; flex-direction: column; gap: 30px;">
                        <div style="max-width: 1100px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
                                <div>
                                    <h2 style="color: #fff; margin: 0; font-size: 2.6rem; font-weight: 950; letter-spacing: -0.04em;">Kunlik hisobot tayyorlash</h2>
                                    <p style="color: #64748b; font-size: 1.15rem; font-weight: 600; margin-top: 12px; max-width:600px; line-height:1.6;">Barcha bo'limlar bo'yicha tezkor ma'lumotlarni to'ldiring va markaziy dispetcherga xavfsiz kanallar orqali yuboring.</p>
                                </div>
                                <div id="report-overall-status" style="padding: 12px 24px; background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.2); border-radius: 12px; color: #f59e0b; font-weight: 900; font-size: 0.85rem; letter-spacing:1px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.1);">
                                    <div style="width:8px; height:8px; background:#f59e0b; border-radius:50%; animation: pulseAmber 1.5s infinite;"></div>
                                    <style>@keyframes pulseAmber { 0%{opacity:0.3; transform:scale(1);} 50%{opacity:1; transform:scale(1.2);} 100%{opacity:0.3; transform:scale(1);} }</style>
                                    <span>TO'LDIRILMOQDA...</span>
                                </div>
                            </div>
                            
                            <div id="submission-checklist" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
                                <!-- DYNAMIC CHECKLIST ITEMS -->
                            </div>

                            <div style="margin-top: 50px; padding: 40px; background: rgba(255, 255, 255, 0.02); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: space-between; backdrop-filter: blur(10px); box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
                                <div style="display:flex; gap:25px; align-items:center;">
                                    <div style="width:70px; height:70px; background:linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.3)); border-radius:20px; display:flex; align-items:center; justify-content:center; color:#3b82f6; font-size:1.8rem; border:1px solid rgba(59,130,246,0.2);">
                                        <i class="fas fa-check-shield"></i>
                                    </div>
                                    <div>
                                        <h3 style="margin: 0; color: #fff; font-weight: 900; font-size: 1.5rem;">Hisobotni yakunlash</h3>
                                        <p style="margin: 8px 0 0 0; color: #94a3b8; font-weight: 600; font-size: 1rem;">Ma'lumotlar butunligi AI tomonidan tekshirildi.</p>
                                    </div>
                                </div>
                                <button onclick="window.submitDetailedReport('${bolinmaId}')" style="padding: 20px 48px; background: linear-gradient(135deg, #3b82f6, #1e40af); color: #fff; border: none; border-radius: 16px; font-weight: 950; cursor: pointer; transition: 0.3s; font-size: 1.1rem; letter-spacing:1px; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 15px 40px rgba(59,130,246,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 30px rgba(59, 130, 246, 0.3)'">
                                    <i class="fas fa-paper-plane" style="margin-right:12px;"></i> TASDIQLASH VA YUBORISH
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 2. ISHGA CHIQISH SECTION -->
                    <div id="tab-attendance" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="width:40px; height:40px; background:rgba(59,130,246,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#3b82f6; font-size:1.2rem;">
                                    <i class="fas fa-users-cog"></i>
                                </div>
                                <h1 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing:-0.5px;">Xodimlarning ishga chiqishi (Davomat)</h1>
                            </div>
                            <button onclick="window.openDispatcherModal('attendance')" style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(59,130,246,0.2);">
                                <i class="fas fa-plus-circle"></i> Ma'lumot kiritish
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr>
                                                <th style="text-align: left;">PDB / BO'LIM</th>
                                                <th style="width: 60px; text-align: center;">JAMI</th>
                                                <th style="width: 60px; text-align: center;">FAKT</th>
                                                <th style="width: 60px; text-align: center;">SAFAR</th>
                                                <th style="width: 60px; text-align: center;">OTP.</th>
                                                <th style="width: 60px; text-align: center;">KASAL</th>
                                                <th style="width: 60px; text-align: center;">O'QISH</th>
                                                <th style="width: 60px; text-align: center;">MP</th>
                                                <th style="width: 60px; text-align: center;">BOSHQA</th>
                                                <th style="text-align: center; width: 80px;">AMAL</th>
                                            </tr>
                                        </thead>
                                        <tbody id="attendance-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. OGOHLANTIRISHLAR -->
                    <div id="tab-ogoh" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="width: 40px; height: 40px; background: rgba(239, 68, 68, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #ef4444; font-size:1.2rem;">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <h1 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing:-0.5px;">Tezlikni cheklash (Ogohlantirish)</h1>
                            </div>
                            <button onclick="window.openDispatcherModal('ogoh')" style="background: linear-gradient(135deg, #ef4444, #991b1b); color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);">
                                <i class="fas fa-plus-circle"></i> Yangi qo'shish
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr>
                                                <th>STANTSIYA / PEREGON</th>
                                                <th style="width: 100px;">KM / PK</th>
                                                <th style="width: 80px;">YO'L</th>
                                                <th style="color: #ef4444; width: 100px;">TEZLIK</th>
                                                <th>SABABI</th>
                                                <th style="width: 100px;">VAQTI</th>
                                                <th>MAS'UL</th>
                                                <th style="text-align: center; width: 80px;">AMAL</th>
                                            </tr>
                                        </thead>
                                        <tbody id="warn-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 4. ISH REJASI -->
                    <div id="tab-reja" class="report-tab-content" style="display: none; height: 100%; overflow: hidden; display: flex; flex-direction: column;">
                        <div class="tab-header-polished">
                            <div style="display: flex; align-items: center; gap: 30px;">
                                <div style="width: 40px; height: 40px; background: rgba(16, 185, 129, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #10b981; font-size:1.2rem;">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                                <h2 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing:-0.5px;">Yo'l ishlari rejasi</h2>
                                <div style="display: flex; align-items: center; gap: 10px; padding: 8px 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; background: rgba(255,255,255,0.03);">
                                    <span style="font-size: 0.9rem; color: #fbbf24; font-weight: 800;">${window.selectedDispatcherDate}</span>
                                    <i class="far fa-clock" style="color: #94a3b8;"></i>
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 12px;">
                                <button onclick="window.exportUnifiedPlanExcel()" style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #e2e8f0; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: 0.2s;">
                                    <i class="fas fa-file-excel" style="color: #10b981;"></i> Excel
                                </button>
                                <button onclick="window.print()" style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #e2e8f0; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: 0.2s;">
                                    <i class="fas fa-print" style="color: #94a3b8;"></i> Chop etish
                                </button>
                                <button onclick="window.openDispatcherModal('reja')" style="display: flex; align-items: center; gap: 8px; padding: 10px 25px; background: linear-gradient(135deg, #10b981, #065f46); border: none; border-radius: 10px; color: #fff; font-weight: 800; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2); transition: 0.2s;">
                                    <i class="fas fa-plus"></i> Qo'shish
                                </button>
                            </div>
                        </div>

                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 180px;">PD</th>
                                                <th>Xizmat ko'rsatish chegarasi</th>
                                                <th>Bajariladigan ish</th>
                                                <th style="width: 100px; text-align: center;">Kontingent</th>
                                                <th>Kichik mexanizmlar</th>
                                                <th style="width: 80px; text-align: center;"></th>
                                            </tr>
                                        </thead>
                                        <tbody id="plan-table-body"></tbody>
                                        <tfoot id="plan-table-footer"></tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 5. BAJARILGAN ISHLAR -->
                    <div id="tab-spravka" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="width:40px; height:40px; background:rgba(16,185,129,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#10b981; font-size:1.2rem;">
                                    <i class="fas fa-tasks"></i>
                                </div>
                                <h1 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing:-0.5px;">Bajarilgan ishlar (Spravka)</h1>
                            </div>
                            <button onclick="window.openDispatcherModal('spravka')" style="background: linear-gradient(135deg, #10b981, #047857); color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(16,185,129,0.2);">
                                <i class="fas fa-check-double"></i> Hisobot qo'shish
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr style="text-align: center;">
                                                <th rowspan="2">PDB / BO'LIM</th>
                                                <th colspan="5" style="text-align: center;">TEXNIK XIZMAT KO'RSATISH</th>
                                                <th colspan="2" style="text-align: center;">RAHBARIYAT</th>
                                                <th colspan="3" style="text-align: center;">NUQSONLAR</th>
                                                <th rowspan="2" style="text-align: center; width: 80px;">AMAL</th>
                                            </tr>
                                            <tr style="text-align: center; border-top: 1px solid #cbd5e1;">
                                                <th style="text-align: center;">OBXOD</th>
                                                <th style="text-align: center;">ISSO</th>
                                                <th style="text-align: center;">PUTEY</th>
                                                <th style="text-align: center;">KONT.</th>
                                                <th style="text-align: center;">MEX.</th>
                                                <th style="text-align: center;">RAHBAR</th>
                                                <th style="text-align: center;">IJROCHI</th>
                                                <th style="text-align: center;">ANIQL</th>
                                                <th style="text-align: center;">TUZAT</th>
                                                <th style="text-align: center;">QOLDI</th>
                                            </tr>
                                        </thead>
                                        <tbody id="spravka-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 6. PIYODA TEKSHIRUV -->
                    <div id="tab-obxod" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="width:40px; height:40px; background:rgba(212,175,55,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#d4af37; font-size:1.2rem;">
                                    <i class="fas fa-walking"></i>
                                </div>
                                <h1 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing:-0.5px;">Piyoda tekshiruvlar jurnali</h1>
                            </div>
                            <button onclick="window.openDispatcherModal('obxod')" style="background: linear-gradient(135deg, #d4af37, #b45309); color: #000; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(212,175,55,0.2);">
                                <i class="fas fa-shoe-prints"></i> Tekshiruv natijasi
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 180px;">PDB / BO'LIM</th>
                                                <th>XODIM (F.I.SH)</th>
                                                <th style="width: 130px;">TEL.</th>
                                                <th style="width: 100px;">KM PK</th>
                                                <th>KAMCHILIKLAR</th>
                                                <th style="text-align: center; width: 80px;">AMAL</th>
                                            </tr>
                                        </thead>
                                        <tbody id="obxod-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 7. ISH OYNALARI -->
                    <div id="tab-oyna" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="width:40px; height:40px; background:rgba(168,85,247,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#a855f7; font-size:1.2rem;">
                                    <i class="fas fa-clock-rotate-left"></i>
                                </div>
                                <h1 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing:-0.5px;">Texnik ish oynalari (Window)</h1>
                            </div>
                            <button onclick="window.openDispatcherModal('oyna')" style="background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(168,85,247,0.2);">
                                <i class="fas fa-clock"></i> Oyna kiritish
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 120px;">VAQTI</th>
                                                <th>MANZILI</th>
                                                <th>ISH MAZMUNI</th>
                                                <th style="text-align: center; width: 100px;">TOIFASI</th>
                                                <th>MEXANIZMLAR</th>
                                                <th style="text-align: center; width: 120px;">HOLATI</th>
                                                <th style="text-align: center; width: 80px;">AMAL</th>
                                            </tr>
                                        </thead>
                                        <tbody id="oyna-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 8. HARORAT MONITORINGI -->
                    <div id="tab-temp" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="width:40px; height:40px; background:rgba(217,119,6,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#f59e0b; font-size:1.2rem;">
                                    <i class="fas fa-thermometer-half"></i>
                                </div>
                                <h1 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing:-0.5px;">Rels harorati monitoringi</h1>
                            </div>
                            <button onclick="window.openDispatcherModal('temp')" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(217,119,6,0.2);">
                                <i class="fas fa-plus-circle"></i> Harorat kiritish
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 50px; text-align: center;">T/r</th>
                                                <th>PDB / BO'LIM</th>
                                                <th style="width: 100px; text-align: center;">VAQT</th>
                                                <th>IZOH / MANZIL</th>
                                                <th style="width: 100px; text-align: center; color: #ef4444;">RELS °C</th>
                                                <th style="width: 100px; text-align: center; color: #3b82f6;">HAVO °C</th>
                                                <th style="text-align: center; width: 80px;">AMAL</th>
                                            </tr>
                                        </thead>
                                        <tbody id="temp-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 9. DEFEKTOSKOPIYA -->
                    <div id="tab-defekt" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <h1 style="margin: 0; font-size: 1.3rem; font-weight: 800; color: #0f172a;">Rels nuqsonlari monitoringi</h1>
                            <button onclick="window.openDispatcherModal('defect')" style="background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem;">
                                <i class="fas fa-search-plus"></i> Nuqsonni qayd etish
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 50px; text-align: center;">T/r</th>
                                                <th style="width: 150px;">PDB / BO'LIM</th>
                                                <th>STANTSIYA / PEREGON</th>
                                                <th style="width: 120px;">KM PK</th>
                                                <th style="width: 80px; text-align: center;">TOMON</th>
                                                <th style="width: 100px; text-align: center; color: #ef4444;">KOD</th>
                                                <th style="width: 100px; text-align: center;">O'LCHAM</th>
                                                <th>TOPSHIRIQ (TEZLIK)</th>
                                                <th style="text-align: center; width: 80px;">AMAL</th>
                                            </tr>
                                        </thead>
                                        <tbody id="defect-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- RAZRYADKA MODULLARDAN BIRI SIFATIDA -->
                    <div id="tab-razryadka" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <h1 style="margin: 0; font-size: 1.3rem; font-weight: 800; color: #0f172a;">Pletlarni razryadka qilish rejasi</h1>
                                <p style="margin: 0; color: #64748b; font-size: 0.85rem; font-weight: 500;">Bahor mavsumida razryadka qilish ishlari monitoringi</p>
                            </div>
                            <button onclick="window.openDispatcherModal('razryadka')" style="background: #0f172a; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem;">
                                <i class="fas fa-plus"></i> Qo'shish
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished" style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                                <div class="table-wrapper-polished" style="overflow-x: auto;">
                                    <table class="polished-table" style="width: 100%; border-collapse: collapse; min-width: 1400px;">
                                        <thead>
                                            <tr style="background: #f8fafc; border-bottom: 2px solid #f1f5f9;">
                                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; width: 180px;">Bekat va oralig'i</th>
                                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Yo'l</th>
                                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Boshi</th>
                                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Oxiri</th>
                                                <th style="padding: 15px 12px; text-align: center; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Uzun.</th>
                                                <th style="padding: 15px 12px; text-align: center; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Rels</th>
                                                <th style="padding: 15px 12px; text-align: center; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">t kut.</th>
                                                <th style="padding: 15px 12px; text-align: center; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">t fakt</th>
                                                <th style="padding: 15px 12px; text-align: center; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Bosh t°</th>
                                                <th style="padding: 15px 12px; text-align: center; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Tug t°</th>
                                                <th style="padding: 15px 12px; text-align: center; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Uzayish</th>
                                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Sana</th>
                                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Vaqti</th>
                                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Sabab</th>
                                                <th style="padding: 15px 12px; text-align: center; color: #475569; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; width: 60px;">Amal</th>
                                            </tr>
                                        </thead>
                                        <tbody id="razryadka-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 11. MATERIAL SARFI -->
                    <div id="tab-material" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="width:40px; height:40px; background:rgba(16,185,129,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#10b981; font-size:1.2rem;">
                                    <i class="fas fa-cubes"></i>
                                </div>
                                <h1 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing:-0.5px;">Materiallar sarfi monitoringi</h1>
                            </div>
                            <button onclick="window.openDispatcherModal('material')" style="background: linear-gradient(135deg, #10b981, #065f46); color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(16,185,129,0.2);">
                                <i class="fas fa-boxes"></i> Material qo'shish
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr>
                                                <th>NOMI</th>
                                                <th style="text-align: center; width: 150px;">O'LCHOV BIRLIGI</th>
                                                <th style="text-align: center; width: 100px;">SONI</th>
                                                <th>LOKATSIYA (MANZILI)</th>
                                                <th style="text-align: center; width: 80px;">AMAL</th>
                                            </tr>
                                        </thead>
                                        <tbody id="material-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 12. TRANSPORT SECTION -->
                    <div id="tab-transport" class="report-tab-content" style="display: none;">
                        <div class="tab-header-polished">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="width:40px; height:40px; background:rgba(251,191,36,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fbbf24; font-size:1.2rem;">
                                    <i class="fas fa-truck-pickup"></i>
                                </div>
                                <h1 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing:-0.5px;">Transport monitoringi</h1>
                            </div>
                            <button onclick="window.openDispatcherModal('transport')" style="background: linear-gradient(135deg, #fbbf24, #d97706); color: #000; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(251,191,36,0.2);">
                                <i class="fas fa-plus-circle"></i> Transport qo'shish
                            </button>
                        </div>
                        <div class="tab-body-polished">
                            <div class="table-card-polished">
                                <div class="table-wrapper-polished">
                                    <table class="polished-table">
                                        <thead>
                                            <tr>
                                                <th>LOKOMOTIV TURI</th>
                                                <th style="text-align: center; width: 120px;">NOMERI</th>
                                                <th>MASHINIST</th>
                                                <th style="text-align: center; width: 120px;">VAQTI</th>
                                                <th>LOKATSIYA</th>
                                                <th style="text-align: center; width: 80px;">AMAL</th>
                                            </tr>
                                        </thead>
                                        <tbody id="transport-table-body"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                <!-- FINAL SUBMIT FOOTER -->
                <div style="padding: 24px 40px; background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end; gap: 18px; flex-shrink: 0; backdrop-filter:blur(15px);">
                    <button onclick="window.previewMyReport()" style="padding: 12px 28px; background: rgba(255,255,255,0.03); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; font-size: 0.9rem;" onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.color='#94a3b8'">
                        <i class="fas fa-eye" style="margin-right:8px;"></i> Hisobotni ko'rish
                    </button>
                    <button onclick="window.submitDetailedReport('${bolinmaId}')" style="padding: 12px 35px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; font-size: 0.95rem; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2); letter-spacing:0.5px;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(16, 185, 129, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(16, 185, 129, 0.2)'">
                        <i class="fas fa-paper-plane" style="margin-right:8px;"></i> TASDIQLASH VA YUBORISH
                    </button>
                </div>
            </div>
        </div>
        </div>
        <style>
             .report-tab-content { 
                 animation: tabAppear 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
                 height: 100%; 
                 display: flex; 
                 flex-direction: column; 
                 overflow: hidden; 
             }
             @keyframes tabAppear { from { opacity: 0; transform: translateY(10px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
             
             .sidebar-item { 
                 color: #94a3b8; 
                 border-left: 4px solid transparent;
                 margin: 4px 15px;
                 padding: 12px 20px !important;
                 border-radius: 12px;
                 font-weight: 600;
                 font-size: 0.88rem;
                 transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
             }
             .sidebar-item:hover { 
                 background: rgba(255, 255, 255, 0.05); 
                 color: #fff; 
                 transform: translateX(4px);
             }
             .sidebar-item.active { 
                 background: rgba(59, 130, 246, 0.1) !important; 
                 color: #60a5fa !important; 
                 border-left-color: #3b82f6 !important;
                 font-weight: 800;
                 box-shadow: 0 4px 15px rgba(0,0,0,0.2);
             }
             .sidebar-item i { width: 24px; font-size: 1.1rem; }
             
             .tab-header-polished { 
                 padding: 30px 45px; 
                 background: rgba(2, 6, 23, 0.5); 
                 border-bottom: 1px solid rgba(255,255,255,0.06); 
                 display: flex; 
                 justify-content: space-between; 
                 align-items: center; 
                 flex-shrink: 0;
                 backdrop-filter: blur(10px);
             }
             .tab-body-polished { 
                 flex: 1; 
                 padding: 40px 45px; 
                 overflow-y: auto; 
                 background: transparent;
             }
             
             .table-card-polished { 
                 background: rgba(255, 255, 255, 0.02); 
                 border-radius: 20px; 
                 border: 1px solid rgba(255, 255, 255, 0.06); 
                 box-shadow: 0 20px 40px rgba(0,0,0,0.4); 
                 overflow: hidden;
                 backdrop-filter: blur(5px);
             }
             .table-wrapper-polished { 
                 width: 100%; 
                 overflow-x: auto; 
                 scrollbar-width: thin;
             }
             
             .polished-table { 
                 width: 100%; 
                 border-collapse: collapse; 
                 font-size: 0.9rem;
             }
             .polished-table thead th { 
                 background: rgba(255, 255, 255, 0.03); 
                 padding: 18px 24px; 
                 text-align: left; 
                 font-weight: 800; 
                 color: #94a3b8; 
                 border-bottom: 1px solid rgba(255,255,255,0.08);
                 white-space: nowrap;
                 text-transform: uppercase;
                 letter-spacing: 0.8px;
                 font-size: 0.75rem;
             }
             .polished-table tbody td { 
                 padding: 18px 24px; 
                 border-bottom: 1px solid rgba(255,255,255,0.04); 
                 color: #e2e8f0; 
                 white-space: nowrap;
                 font-weight: 600;
             }
             .polished-table tbody tr:hover td { 
                 background: rgba(59, 130, 246, 0.04); 
                 color: #fff;
             }
             
             /* Scrollbar Styling */
             ::-webkit-scrollbar { width: 6px; height: 6px; }
             ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
             ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
             ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        </style>
        `;
    }

    // Dynamic Helper for Warning Forms
    window.switchWarningForm = function (type) {
        const structured = document.getElementById('warning-structured-container');
        if (type === 'none') {
            structured.style.display = 'none';
        } else {
            structured.style.display = 'block';
        }
    }

    window.getStructuredState = function() {
        return {
            dayWarnRows: window.dispatcherState.dayWarnRows,
            generalWarnRows: window.dispatcherState.generalWarnRows,
            spravkaData: window.dispatcherState.spravkaRows,
            planData: window.dispatcherState.planRows,
            obxodData: window.dispatcherState.obxodRows,
            oynaData: window.dispatcherState.oynaRows,
            attendance: window.dispatcherState.attendanceRows,
            tempData: window.dispatcherState.tempData,
            defektData: window.dispatcherState.defects,
            razryadkaData: window.dispatcherState.razryadka,
            materialsData: window.dispatcherState.materials,
            transportData: window.dispatcherState.transport
        };
    };

    window.previewMyReport = function() {
        const data = window.getStructuredState();
        const html = window.renderReportSummary(data, "HISOBOT PREVYUSI");
        
        let modal = document.createElement('div');
        modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:200500; display:flex; align-items:center; justify-content:center; overflow-y:auto; padding: 40px 0;`;
        modal.innerHTML = `
            <div style="background:#fff; width:1000px; border-radius:15px; padding:0; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.5); color:#000;">
                <div style="padding: 20px 40px; border-bottom: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 15px 15px 0 0;">
                    <h2 style="margin:0; color:#0f172a;">Hisobotni ko'rib chiqish</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#94a3b8;">&times;</button>
                </div>
                <div style="padding: 40px;">${html}</div>
                <div style="padding: 20px 40px; border-top: 1px solid #f1f5f9; text-align: right; background: #f8fafc; border-radius: 0 0 15px 15px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 10px 25px; background: #1e293b; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Yopish</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.submitDetailedReport = async function (bolinmaId) {
        const structuredData = window.getStructuredState();
        
        let overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.95); z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:"Inter", sans-serif; backdrop-filter: blur(5px);';
        overlay.innerHTML = `
            <style>
              @keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }
            </style>
            <div style="position: relative; width: 100px; height: 100px; display: flex; justify-content: center; align-items: center;">
                 <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 4px solid #3b82f6; animation: pulseRing 1.5s infinite;"></div>
                 <i class="fas fa-satellite-dish" style="font-size: 3.5rem; color: #fbbf24; z-index: 2;"></i>
            </div>
            <h2 style="margin-top: 30px; font-weight: 800; color: #fff; font-size: 1.8rem; letter-spacing: 1px;">Markaziy serverga ulanmoqda...</h2>
            <p style="color: #94a3b8; font-style: italic; font-size: 1.1rem; margin-top: 10px;">Qorlitog' dispetcherlik apparatiga yuborilmoqda...</p>
        `;
        document.body.appendChild(overlay);

        try {
            const response = await SmartUtils.fetchAPI('/reports', {
                method: 'POST',
                body: JSON.stringify({
                    bolinma_id: bolinmaId,
                    content: `Kunlik tezkor hisobot (${window.selectedDispatcherDate})`,
                    structuredData: structuredData
                })
            });

            if (response) {
                // Clear draft after successful submission
                if (window.clearStateDraft) window.clearStateDraft();
                
                // BROADCAST SUBMISSION TO ALL (Real-time monitoring)
                if (window.AppSocket && window.AppSocket.connected) {
                    window.AppSocket.emit('report_submitted', {
                        bolinma_id: bolinmaId,
                        date: window.selectedDispatcherDate,
                        manager: window.currentUser?.fullname || bolinmaId
                    });
                }

                overlay.innerHTML = `
                    <i class="fas fa-check-circle" style="font-size: 6rem; color: #10b981;"></i>
                    <h2 style="margin-top: 30px; font-weight: 800; text-align: center; color: #fff; font-size: 2rem;">Hisobot Muvaffaqiyatli Yuborildi!</h2>
                    <p style="color: #94a3b8; text-align: center; font-size: 1.1rem; margin-bottom: 40px;">Barcha tuzilgan ma'lumotlar markaziy bazaga saqlandi va tasdiqlandi.</p>
                    <div style="display: flex; gap: 20px;">
                        <button onclick="this.parentElement.parentElement.remove(); window.location.reload();" style="padding: 15px 40px; background: #334155; color: #fff; border: 1px solid #475569; border-radius: 12px; font-weight: 800; font-size: 1.1rem; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='#475569'" onmouseout="this.style.background='#334155'">
                            <i class="fas fa-arrow-left"></i> Qaytish
                        </button>
                        <button onclick="window.generateTelegramReport()" style="padding: 15px 40px; background: #0088cc; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px rgba(0, 136, 204, 0.4); transition: 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                             <i class="fab fa-telegram-plane"></i> Telegram orqali jo'natish
                        </button>
                    </div>
                `;
                localStorage.setItem('dispatcher_report_sent_' + window.selectedDispatcherDate, 'true');
            }
        } catch (err) {
            console.error("Report Submission Error:", err);
            overlay.innerHTML = `
                <i class="fas fa-exclamation-circle" style="font-size: 6rem; color: #ef4444;"></i>
                <h2 style="margin-top: 30px; font-weight: 800; text-align: center; color: #fff; font-size: 2rem;">Xatolik yuz berdi!</h2>
                <p style="color: #94a3b8; text-align: center; font-size: 1.1rem; margin-bottom: 20px;">Server bilan bog'lanishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.</p>
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 10px 20px; font-size: 0.85rem; color: #f87171; font-family: monospace; margin-bottom: 30px;">
                    ERROR: ${escapeHtml(err.message || 'Unknown Network Error')}
                </div>
                <button onclick="this.parentElement.remove()" style="padding: 15px 40px; background: #334155; color: #fff; border: 1px solid #475569; border-radius: 12px; font-weight: 800; font-size: 1.1rem; cursor: pointer;">Yopish</button>
            `;
        }
    };

    window.generateTelegramReport = function() {
        const sd = window.getStructuredState();
        let text = `📅 *KUNLIK TEZKOR HISOBOT* - ${window.selectedDispatcherDate}\n`;
        text += `🏢 *Qorlitog' temir yo'l masofasi*\n\n`;
        
        if (sd.attendance && sd.attendance.length > 0) {
            text += `👥 *Ishga chiqish (Davomat):*\n`;
            sd.attendance.forEach(a => text += `- ${a.area}: ${a.fact}/${a.total} kishi.\n`);
            text += `\n`;
        }
        
        if (sd.defektData && sd.defektData.length > 0) {
            text += `🚨 *Aniqlangan nuqsonlar:*\n`;
            sd.defektData.forEach(d => text += `- ${d.station} (${d.loc}): Kod ${d.code}, O'lcham ${d.size}mm\n`);
            text += `\n`;
        }
        
        if (sd.oynaData && sd.oynaData.length > 0) {
            text += `🛠️ *Texnik oynalar:*\n`;
            sd.oynaData.forEach(o => text += `- ${o.time}: ${o.task}\n`);
            text += `\n`;
        }
        
        text += `✅ *Dispetcherlik apparatidan o'tgan.*\n*Tizim orqali avtomatik shakllantirildi.*`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            SmartUtils.showToast("Telegram hisoboti nusxalandi! Endi guruhga Paste qiling.", "success");
            // Optional: Try deep linking
            window.open('https://t.me/share/url?url=' + encodeURIComponent(text), '_blank');
        }).catch(err => {
            console.error('Nusxa olishda xatolik', err);
            SmartUtils.showToast("Nusxa olish bekor qilindi.", "error");
        });
    };

    window.setDispatcherGlobalDate = function(newDate) {
        window.selectedDispatcherDate = newDate;
        SmartUtils.showToast(`${newDate} sanasiga o'tildi`, "info");
        window.refreshDispatcherData();
    };

    window.refreshDispatcherData = async function() {
        console.log("Refreshing data for:", window.selectedDispatcherDate);
        
        // 1. Fetch latest data from server
        await initDispatcherData();
        
        // 2. Identify current UI state
        const isSubdivisionView = !!document.querySelector('#tab-container');
        
        if (isSubdivisionView) {
            // Re-render the current active tab to show latest data
            const activeItem = document.querySelector('.sidebar-item.active');
            if (activeItem) {
                const onclickStr = activeItem.getAttribute('onclick');
                if (onclickStr) {
                    const tabIdMatch = onclickStr.match(/'([^']+)'/);
                    if (tabIdMatch) {
                        window.switchReportTab(activeItem, tabIdMatch[1]);
                    }
                }
            }
        } else {
            // Re-render the main dashboard
            const main = document.getElementById('main-content');
            if (main) { main.innerHTML = getDispatcherDashboardHTML(); }
        }
    }


    window.renderReportSummary = function(sd, title = "TEZKOR HISOBOT") {
        if (!sd) return '<div style="padding:40px; text-align:center; color:#334155; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px;">Ma\'lumotlar yo\'q</div>';

        const sContainer = (content, label, icon = 'fa-layer-group') => `
            <div style="margin-bottom: 24px; background: #fff; border-radius: 12px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <h3 style="background: #f1f5f9; color: #0f172a; text-shadow: none !important; -webkit-text-fill-color: #0f172a !important; border-bottom: 2px solid #cbd5e1; padding: 14px 20px; margin: 0; font-size: 0.95rem; font-weight: 900; display: flex; align-items: center; gap: 10px;">
                    <i class="fas ${icon}" style="font-size: 1rem; color: #1e3a8a;"></i>
                    <span style="text-transform: uppercase; letter-spacing: 0.5px; text-shadow: none !important; color: #0f172a;">${label}</span>
                </h3>
                <div style="padding: 0; overflow-x: auto;">${content}</div>
            </div>
        `;

        const tableStyle = "width:100%; border-collapse:collapse; font-size:0.9rem; color: #0f172a;";
        const thStyle = "padding:14px 16px; background: #e2e8f0; color: #1e293b; font-weight: 800; text-align: center; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;";
        const tdStyle = "padding:12px 16px; border-bottom:1px solid #e2e8f0; text-align: center; font-weight: 500;";

        // 1. Attendance Table
        let attHTML = `<table style="${tableStyle}">
            <thead>
                <tr>
                    <th style="${thStyle} text-align: left;">PDB / BO'LIM</th>
                    <th style="${thStyle}">JAMI</th>
                    <th style="${thStyle} color: #10b981;">FAKT</th>
                    <th style="${thStyle}">SAFAR</th>
                    <th style="${thStyle}">OTP</th>
                    <th style="${thStyle}">KASAL</th>
                    <th style="${thStyle}">O'QISh</th>
                    <th style="${thStyle}">MP</th>
                    <th style="${thStyle}">BOSHQA</th>
                </tr>
            </thead>
            <tbody>
            ${(sd.attendance || []).map(r => `
                <tr>
                    <td style="${tdStyle} text-align: left; font-weight: 700; color: #1e3a8a;">${r.area}</td>
                    <td style="${tdStyle}">${r.total}</td>
                    <td style="${tdStyle} font-weight: 800; color: #10b981;">${r.fact}</td>
                    <td style="${tdStyle}">${r.trip}</td>
                    <td style="${tdStyle}">${r.otpusk}</td>
                    <td style="${tdStyle}">${r.sick}</td>
                    <td style="${tdStyle}">${r.study}</td>
                    <td style="${tdStyle}">${r.mp}</td>
                    <td style="${tdStyle}">${r.other}</td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;

        // 2. Warnings
        let warnHTML = `<table style="${tableStyle}">
            <thead>
                <tr>
                    <th style="${thStyle} text-align: left;">STANTSIYA</th>
                    <th style="${thStyle}">KM PK</th>
                    <th style="${thStyle}">YO'L</th>
                    <th style="${thStyle} color: #ef4444;">TEZLIK</th>
                    <th style="${thStyle}">SABAB</th>
                </tr>
            </thead>
            <tbody>
            ${(sd.dayWarnRows || []).map(r => `
                <tr>
                    <td style="${tdStyle} text-align: left; font-weight: 600;">${r.station}</td>
                    <td style="${tdStyle}">${r.km}</td>
                    <td style="${tdStyle}">${r.path}</td>
                    <td style="${tdStyle} font-weight: 800; color: #ef4444;">${r.speed} (K)</td>
                    <td style="${tdStyle} text-align: left; white-space: normal;">${escapeHtml(r.reason)}</td>
                </tr>
            `).join('')}
            ${(sd.generalWarnRows || []).map(r => `
                <tr>
                    <td style="${tdStyle} text-align: left; font-weight: 600;">${r.station}</td>
                    <td style="${tdStyle}">${r.km}</td>
                    <td style="${tdStyle}">${r.path}</td>
                    <td style="${tdStyle} font-weight: 800; color: #ef4444;">${r.speed} (D)</td>
                    <td style="${tdStyle} text-align: left; white-space: normal;">${escapeHtml(r.reason)}</td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;

        // 3. Plan
        let planHTML = `<table style="${tableStyle}">
            <thead>
                <tr>
                    <th style="${thStyle} text-align: left;">PDB / HUDUD</th>
                    <th style="${thStyle}">ISH MAZMUNI</th>
                    <th style="${thStyle}">MANZIL</th>
                    <th style="${thStyle}">RAHBAR / XODIM</th>
                    <th style="${thStyle} color: #ef4444;">OYNA</th>
                </tr>
            </thead>
            <tbody>
            ${(sd.planRows || sd.planData || []).map(r => `
                <tr>
                    <td style="${tdStyle} text-align: left; font-weight: 700; color: #1e3a8a;">${r.area}</td>
                    <td style="${tdStyle} text-align: left; white-space: normal;">${r.work}</td>
                    <td style="${tdStyle}">${escapeHtml(r.location)}</td>
                    <td style="${tdStyle}">${r.leader} (${r.staff})</td>
                    <td style="${tdStyle} font-weight: 800; color: #ef4444;">${r.window || '-'}</td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;

        // 4. Completed Work (Spravka)
        let spHTML = `<table style="${tableStyle}">
            <thead>
                <tr>
                    <th style="${thStyle}">PDB</th>
                    <th style="${thStyle}">OBXOD</th>
                    <th style="${thStyle}">ISSO</th>
                    <th style="${thStyle}">PUTEY</th>
                    <th style="${thStyle}">KONT</th>
                    <th style="${thStyle}">MECH</th>
                    <th style="${thStyle}">RAHBAR</th>
                </tr>
            </thead>
            <tbody>
            ${(sd.spravkaRows || sd.spravkaData || []).map(r => `
                <tr>
                    <td style="${tdStyle} font-weight: 700; color: #1e3a8a;">${r.area}</td>
                    <td style="${tdStyle}">${r.obxod}</td>
                    <td style="${tdStyle}">${r.isso}</td>
                    <td style="${tdStyle}">${r.putey}</td>
                    <td style="${tdStyle}">${r.kont}</td>
                    <td style="${tdStyle}">${r.mech}</td>
                    <td style="${tdStyle} font-weight: 600;">${r.leader}</td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;

        // 5. Temperatura (Harorat)
        let tempHTML = `<table style="${tableStyle}">
            <thead>
                <tr>
                    <th style="${thStyle}">HUDUD (PDB)</th>
                    <th style="${thStyle}">VAQT</th>
                    <th style="${thStyle}">IZOH</th>
                    <th style="${thStyle} color: #ef4444;">RELS</th>
                    <th style="${thStyle} color: #3b82f6;">HAVO</th>
                </tr>
            </thead>
            <tbody>
            ${(sd.tempData || []).map(r => `
                <tr>
                    <td style="${tdStyle} font-weight: 700; color: #1e3a8a;">${r.area}</td>
                    <td style="${tdStyle}">${r.time}</td>
                    <td style="${tdStyle} text-align: left; font-style: italic;">${r.info || '-'}</td>
                    <td style="${tdStyle} font-weight: 800; color: #ef4444;">${r.rail}°C</td>
                    <td style="${tdStyle} color: #3b82f6; font-weight: 600;">${r.air}°C</td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;

        // 6. Defektoskopiya
        let defHTML = `<table style="${tableStyle}">
            <thead>
                <tr>
                    <th style="${thStyle}">HUDUD</th>
                    <th style="${thStyle}">MANZIL</th>
                    <th style="${thStyle}">KOD</th>
                    <th style="${thStyle}">O'LCHAM</th>
                    <th style="${thStyle}">CHORA</th>
                </tr>
            </thead>
            <tbody>
            ${(sd.defects || sd.defektData || []).map(r => `
                <tr>
                    <td style="${tdStyle} font-weight: 700; color: #1e3a8a;">${r.area}</td>
                    <td style="${tdStyle}">${r.station} ${r.loc}</td>
                    <td style="${tdStyle} color: #ef4444; font-weight: 800;">${r.code}</td>
                    <td style="${tdStyle}">${r.size} mm</td>
                    <td style="${tdStyle} color: #3b82f6; font-weight: 600;">${r.action}</td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;

        return `
            <div style="font-family:'Inter', sans-serif; background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px;">
                <div style="text-align:center; margin-bottom: 32px;">
                    <h1 style="color: #0f172a !important; text-shadow: none !important; -webkit-text-fill-color: #0f172a !important; margin: 0; font-size: 1.5rem; font-weight: 900; text-transform:uppercase; letter-spacing: 1px;">
                        ${title}
                    </h1>
                    <div style="color: #475569; font-size: 0.95rem; margin-top: 10px; font-weight: 600;">Qorlitog' temir yo'l masofasi — Operativ hisobot veriifikatsiyasi</div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${sContainer(planHTML, "1. ERTANGI KUN ISH REJASI", "fa-calendar-check")}
                    ${sContainer(spHTML, "2. KUNLIK BAJARILGAN ISHLAR (SPRAVKA)", "fa-file-signature")}
                    
                    ${(sd.oynaRows || sd.oynaData)?.length > 0 ? sContainer(`
                        <table style="${tableStyle}">
                            <thead>
                                <tr>
                                    <th style="${thStyle}">VAQTI</th><th style="${thStyle}">LOKATSIYA</th><th style="${thStyle}">ISH TURI</th><th style="${thStyle}">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(sd.oynaRows || sd.oynaData).map(o => `
                                    <tr><td style="${tdStyle}">${o.time}</td><td style="${tdStyle}">${o.loc || o.location}</td><td style="${tdStyle} font-weight:700;">${o.work}</td><td style="${tdStyle}"><span style="padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: rgba(16, 185, 129, 0.1); color: #10b981;">${o.status}</span></td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `, "3. TEXNIK OYNALAR NATIJALARI", "fa-clock") : ''}

                    ${sContainer(tempHTML, "4. TEXNIK NAZORAT: HARORAT MONITORINGI", "fa-thermometer-half")}
                    ${sContainer(defHTML, "5. TEXNIK NAZORAT: DEFEKTOSKOPIYA", "fa-microscope")}
                    
                    ${(sd.razryadka || sd.razryadkaData)?.length > 0 ? sContainer(`
                        <table style="${tableStyle}">
                            <thead>
                                <tr>
                                    <th style="${thStyle}">PDB</th>
                                    <th style="${thStyle}">KM PK</th>
                                    <th style="${thStyle} color:#10b981;">RAZRYADKA</th>
                                    <th style="${thStyle} color:#ef4444;">HOZIRGI</th>
                                    <th style="${thStyle}">FARQ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(sd.razryadka || sd.razryadkaData).map(r => `
                                    <tr>
                                        <td style="${tdStyle} font-weight: 700; color: #1e3a8a;">${r.area}</td>
                                        <td style="${tdStyle}">${r.loc}</td>
                                        <td style="${tdStyle} color:#10b981; font-weight:700;">${r.tempR}°C</td>
                                        <td style="${tdStyle} color:#ef4444; font-weight:700;">${r.tempH}°C</td>
                                        <td style="${tdStyle} font-weight:800; color: #0f172a;">${r.diff}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `, "6. TEXNIK NAZORAT: RAZRYADKA MONITORINGI", "fa-hammer") : ''}

                    ${(sd.materials || sd.materialsData)?.length > 0 ? sContainer(`
                        <table style="${tableStyle}">
                            <thead>
                                <tr>
                                    <th style="${thStyle} text-align: left;">NOM NOMI</th><th style="${thStyle}">O'LCHOV</th><th style="${thStyle}">SONI</th><th style="${thStyle}">MANZIL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(sd.materials || sd.materialsData).map(m => `
                                    <tr><td style="${tdStyle} text-align: left; font-weight: 600;">${escapeHtml(m.name)}</td><td style="${tdStyle}">${m.unit}</td><td style="${tdStyle} font-weight:800; color:#10b981;">${m.qty}</td><td style="${tdStyle}">${m.loc}</td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `, "7. MODDIY TA'MINOT: MATERIALLAR SARFI", "fa-boxes") : ''}

                    ${(sd.transport || sd.transportData)?.length > 0 ? sContainer(`
                        <table style="${tableStyle}">
                            <thead>
                                <tr>
                                    <th style="${thStyle}">LOKOMOTIV</th><th style="${thStyle}">NOMERI</th><th style="${thStyle}">MASHINIST</th><th style="${thStyle}">LOKATSIYA</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(sd.transport || sd.transportData).map(t => `
                                    <tr><td style="${tdStyle} font-weight: 600;">${t.type}</td><td style="${tdStyle} font-weight:800; color: #f59e0b;">${t.num}</td><td style="${tdStyle}">${escapeHtml(t.name)}</td><td style="${tdStyle}">${t.loc}</td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `, "8. MODDIY TA'MINOT: TRANSPORT", "fa-truck-pickup") : ''}

                    ${sContainer(attHTML, "9. MA'MURIY: XODIMLAR DAVOMATI", "fa-users")}
                    ${sContainer(warnHTML, "10. HAVFSIZLIK: TEZLIKNI CHEKLASH", "fa-exclamation-triangle")}
                </div>

                <div style="font-size: 0.75rem; color: #334155; margin-top:32px; text-align:right; border-top:1px solid #cbd5e1; padding-top:16px; font-weight: 500;">
                    <i class="fas fa-fingerprint"></i> Smart PCH-16 Tizimi tomonidan tasdiqlandi. Sana: ${new Date().toLocaleString('uz-UZ')}
                </div>
            </div>
        `;
    };

    // Explicit exports to global window object
    window.openSubdivisionAnalytics = function (id) {
        const sub = subdivisions.find(s => s.id === id);
        if (!sub) return;

        const r = window.subdivisionReports[id];
        const sd = r ? r.structuredData : null;

        let modal = document.createElement('div');
        modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.95); backdrop-filter:blur(30px); z-index:200200; display:flex; align-items:center; justify-content:center;`;

        modal.innerHTML = `
            <div style="background:#fff; width:1100px; max-height: 90vh; overflow-y: auto; border-radius:30px; border:1px solid rgba(255,255,255,0.1); padding:0; position:relative; box-shadow:0 30px 60px rgba(0,0,0,0.8);">
                <div style="background:#0f172a; padding:40px; border-radius:30px 30px 0 0;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="position:absolute; top:30px; right:30px; background:none; border:none; color:#94a3b8; font-size:1.8rem; cursor:pointer;"><i class="fas fa-times"></i></button>
                    <h2 style="margin:0; font-size:2rem; font-weight:900; color:#38bdf8; display:flex; align-items:center; gap:15px;">
                        <i class="fas fa-chart-line"></i> ${escapeHtml(sub.name)} - OPERATIV ANALITIKA
                    </h2>
                    <p style="color:#94a3b8; margin-top:10px;">Bo'lim dispetcheri tomonidan yuborilgan strukturalangan hisobot</p>
                </div>
                
                <div style="padding:40px; color:#000;">
                    ${r ? window.renderReportSummary(sd, "QABUL QILINGAN HISOBOT") : '<div style="text-align:center; padding:100px; color:#94a3b8;">Hali hisobot yuborilmagan</div>'}
                    
                    <div style="margin-top:40px; display:flex; gap:20px;">
                        <button onclick="window.issueTaskModal('${sub.id}')" style="flex:1; padding:20px; background:#1e293b; color:#fff; border:none; border-radius:15px; font-weight:900; cursor:pointer; font-size:1rem;">TOPSHIRIQ BERISH</button>
                        <button onclick="window.downloadReportPDF('${sub.id}')" style="flex:1; padding:20px; background:#f1f5f9; color:#0f172a; border:1px solid #e2e8f0; border-radius:15px; font-weight:700; cursor:pointer; font-size:1rem;">HISOBOTNI PDF YUKLASH</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.issueTaskModal = function (bolinmaId = '') {
        let modal = document.createElement('div');
        modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:200300; display:flex; align-items:center; justify-content:center;`;

        modal.innerHTML = `
            <div style="background:#0f172a; width:500px; border-radius:30px; border:1px solid #38bdf8; padding:40px; box-shadow:0 0 100px rgba(56,189,248,0.2);">
                <h2 style="color:#38bdf8; margin-top:0;">TOPSHIRIQ YUBORISH</h2>
                <div style="margin-bottom:20px;">
                    <label style="color:#94a3b8; font-size:0.8rem; display:block; margin-bottom:8px;">QABUL QILUVCHI</label>
                    <select id="task-target" style="width:100%; padding:12px; background:#1e293b; border:1px solid #334155; border-radius:8px; color:#fff;">
                        <option value="all">Barcha bo'linmalar</option>
                        ${subdivisions.map(s => `<option value="${s.id}" ${s.id === bolinmaId ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}
                    </select>
                </div>
                <div style="margin-bottom:30px;">
                    <label style="color:#94a3b8; font-size:0.8rem; display:block; margin-bottom:8px;">TOPSHIRIQ MATNI</label>
                    <textarea id="task-content" placeholder="Topshiriq tafsilotini kiriting..." style="width:100%; height:120px; padding:12px; background:#1e293b; border:1px solid #334155; border-radius:8px; color:#fff; resize:none;"></textarea>
                </div>
                <div style="display:flex; gap:15px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="flex:1; padding:15px; background:rgba(255,255,255,0.05); color:#fff; border:none; border-radius:12px; cursor:pointer;">BEKOR QILISH</button>
                    <button onclick="window.sendBroadcastTask()" style="flex:1; padding:15px; background:#38bdf8; color:#000; border:none; border-radius:12px; font-weight:800; cursor:pointer;">YUBORISH</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.sendBroadcastTask = function () {
        const target = document.getElementById('task-target').value;
        const msg = document.getElementById('task-content').value;
        if (!msg) return SmartUtils.showToast("Topshiriq matnini kiriting!", "warning");

        // Real broadcast using Socket.io
        if (window.AppSocket && window.AppSocket.connected) {
            window.AppSocket.emit('system_alert', { message: msg, target: target });
            SmartUtils.showToast("Topshiriq muvaffaqiyatli yuborildi!", "success");
        } else {
            SmartUtils.showToast("Topshiriq yuborildi (Simulyatsiya - Socket ulanmagan)", "info");
        }
        
        const modal = document.querySelector('[style*="z-index:200300"]');
        if (modal) modal.remove();
    };

    window.openUnifiedPlanModal = function () {
        const reports = window.subdivisionReports;
        let modal = document.createElement('div');
        modal.className = 'unified-plan-modal'; // For easier styling if needed
        modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); backdrop-filter:blur(5px); z-index:200500; display:flex; align-items:center; justify-content:center; font-family:'Inter', sans-serif;`;

        let rowsHTML = '';
        let totalStaff = 0;

        subdivisions.forEach(sub => {
            const report = reports[sub.id];
            const plans = report?.structuredData?.planData || [];
            
            if (plans.length > 0) {
                plans.forEach((p, idx) => {
                    const rowStaff = parseInt(p.staff) || 0;
                    totalStaff += rowStaff;
                    rowsHTML += `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 15px; color: #0f172a; font-weight: 500;">${idx === 0 ? sub.name : ''}</td>
                            <td style="padding: 15px; color: #475569;">${escapeHtml(p.location || '-')}</td>
                            <td style="padding: 15px; color: #475569;">${p.work || '-'}</td>
                            <td style="padding: 15px; color: #0f172a; font-weight: 600; text-align: center;">${rowStaff}</td>
                            <td style="padding: 15px; color: #475569;">${p.machines || '-'}</td>
                            <td style="padding: 15px; text-align: center; color: #94a3b8;">
                                <i class="fas fa-pen" style="margin-right: 15px; cursor: pointer;"></i>
                                <i class="fas fa-trash" style="cursor: pointer;"></i>
                            </td>
                        </tr>
                    `;
                });
            }
        });

        if (!rowsHTML) {
            rowsHTML = '<tr><td colspan="6" style="padding: 50px; text-align: center; color: #94a3b8;">Hozircha reja kiritilmagan</td></tr>';
        }

        modal.innerHTML = `
            <div style="background: #fff; width: 1200px; max-height: 90vh; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden; position: relative;">
                
                <!-- HEADER AREA -->
                <div style="padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9;">
                    <div style="display: flex; align-items: center; gap: 40px;">
                        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800; color: #1e293b;">Yo'l ishlari rejasi</h2>
                        <div style="display: flex; align-items: center; gap: 10px; padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
                            <span style="font-size: 0.9rem; color: #64748b;">${window.selectedDispatcherDate}</span>
                            <i class="far fa-calendar-alt" style="color: #64748b;"></i>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button onclick="window.exportUnifiedPlanExcel()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; color: #475569; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                            <i class="fas fa-file-excel" style="color: #10b981;"></i> Excel
                        </button>
                        <button onclick="window.print()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; color: #475569; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                            <i class="fas fa-print" style="color: #64748b;"></i> Chop etish / PDF
                        </button>
                        <button onclick="this.closest('.unified-plan-modal').remove()" style="padding: 8px; background: #f8fafc; border: none; border-radius: 6px; cursor: pointer; color: #94a3b8;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- TABLE AREA -->
                <div style="flex: 1; overflow-y: auto; padding: 0 32px 32px;">
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="text-align: left; background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                                <th style="padding: 12px 15px; border-bottom: 2px solid #f1f5f9; width: 220px;">PD</th>
                                <th style="padding: 12px 15px; border-bottom: 2px solid #f1f5f9;">Xizmat ko'rsatish chegarasi</th>
                                <th style="padding: 12px 15px; border-bottom: 2px solid #f1f5f9;">Bajariladigan ish</th>
                                <th style="padding: 12px 15px; border-bottom: 2px solid #f1f5f9; width: 100px; text-align: center;">Kontingent</th>
                                <th style="padding: 12px 15px; border-bottom: 2px solid #f1f5f9;">Kichik mexanizmlar</th>
                                <th style="padding: 12px 15px; border-bottom: 2px solid #f1f5f9; width: 100px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHTML}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="padding: 20px 15px; text-align: right; font-weight: 800; color: #1e293b; font-size: 1rem;">Jami: kishi:</td>
                                <td style="padding: 20px 15px; text-align: center; font-weight: 800; color: #0f172a; font-size: 1.1rem; border-top: 2px solid #f1f5f9;">${totalStaff}</td>
                                <td colspan="2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- FOOTER BRANDING (Optional) -->
                <div style="padding: 12px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end;">
                    <span style="font-size: 0.7rem; color: #94a3b8; font-weight: 500;">AKTIVATSIYA WINDOWS: Smart PCH-16 Tizimi</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.downloadReportPDF = function (bid) {
        const sub = subdivisions.find(s => s.id === bid);
        const report = window.subdivisionReports[bid];
        if (!report) return SmartUtils.showToast("Eksport uchun hisobot yo'q!", "error");

        const container = document.createElement('div');
        container.innerHTML = window.renderReportSummary(report.structuredData, "QABUL QILINGAN HISOBOT");
        
        SmartUtils.exportToPDF(container, `${sub.name}_Hisoboti`, {
            title: sub.name.toUpperCase() + ' - OPERATIV HISOBOT',
            subtitle: ' Smart PCH-16 Tizimi Hisoboti'
        });
    };

    window.exportUnifiedPlanExcel = function() {
        const reports = window.subdivisionReports;
        let csv = "PD,Xizmat ko'rsatish chegarasi,Bajariladigan ish,Kontingent,Kichik mexanizmlar\n";
        
        subdivisions.forEach(sub => {
            const report = reports[sub.id];
            const plans = report?.structuredData?.planData || [];
            plans.forEach(p => {
                csv += `"${sub.name}","${p.location || ''}","${p.work || ''}","${p.staff || ''}","${p.machines || ''}"\n`;
            });
        });

        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Yo'l_ishlari_rejasi_${window.selectedDispatcherDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        SmartUtils.showToast("Excel (CSV) fayli tayyorlandi", "success");
    };

    window.exportRazryadkaExcel = function() {
        const rows = window.dispatcherState.razryadka;
        if (rows.length === 0) {
            SmartUtils.showToast("Eksport qilish uchun ma'lumot yo'q", "warning");
            return;
        }

        let csv = "PDB,Stantsiya,KM PK,Yo'l,R.Harorat,A.Harorat,H.Harorat,Farq\n";
        rows.forEach(r => {
            csv += `"${r.area}","${r.station}","${r.loc}","${r.path}","${r.tempR}","${r.tempA}","${r.tempH}","${r.diff}"\n`;
        });

        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Razryadka_monitoringi_${window.selectedDispatcherDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        SmartUtils.showToast("Excel (CSV) fayli tayyorlandi", "success");
    };

    // Global functions are already exposed via window assignments above.


    window.switchReportTab = function(el, tabId) {
        // Handle Sidebar Active State
        document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
        if (el) {
            el.classList.add('active');
        } else {
            const sideItem = document.querySelector(`.sidebar-item[onclick*="${tabId}"]`);
            if (sideItem) sideItem.classList.add('active');
        }

        // Handle Tab Content visibility
        document.querySelectorAll('.report-tab-content').forEach(content => {
            content.style.display = 'none';
        });

        const target = document.getElementById(tabId);
        if (target) {
            target.style.display = 'flex'; // Use flex for the new responsive dashboard
            // Scroll to top
            const container = document.getElementById('tab-container');
            if (container) container.scrollTop = 0;

            // Trigger re-renders for data-driven tabs
            if (tabId === 'tab-attendance') window.renderAttendanceTable();
            if (tabId === 'tab-ogoh') window.renderWarnTable();
            if (tabId === 'tab-spravka') window.renderSpravkaTable();
            if (tabId === 'tab-reja') window.renderPlanTable();
            if (tabId === 'tab-obxod') window.renderObxodTable();
            if (tabId === 'tab-oyna') window.renderOynaTable();
            if (tabId === 'tab-temp') window.renderTempTable();
            if (tabId === 'tab-defekt') window.renderDefectTable();
            
            // NEW: UPDATE DASHBOARD CHECKLIST
            if (tabId === 'tab-dashboard') window.updateSubmissionChecklist();
        }
    }

    window.updateSubmissionChecklist = function() {
        const checkContainer = document.getElementById('submission-checklist');
        if (!checkContainer) return;

        const modules = [
            { id: 'reja', name: 'Ertangi kun rejasi', icon: 'fa-calendar-alt', data: window.dispatcherState.planRows },
            { id: 'spravka', name: 'Bajarilgan ishlar', icon: 'fa-file-alt', data: window.dispatcherState.spravkaRows },
            { id: 'oyna', name: 'Texnik ish oynalari', icon: 'fa-window-restore', data: window.dispatcherState.oynaRows },
            { id: 'temp', name: 'Harorat monitoringi', icon: 'fa-thermometer-half', data: window.dispatcherState.tempData },
            { id: 'defekt', name: 'Relis nuqsonlari', icon: 'fa-microscope', data: window.dispatcherState.defects },
            { id: 'razryadka', name: 'Razryadka', icon: 'fa-hammer', data: window.dispatcherState.razryadka },
            { id: 'attendance', name: 'Kadrlar davomati', icon: 'fa-users', data: window.dispatcherState.attendanceRows },
            { id: 'obxod', name: 'Piyoda tekshiruv', icon: 'fa-walking', data: window.dispatcherState.obxodRows },
            { id: 'ogoh', name: 'Ogohlantirishlar', icon: 'fa-exclamation-triangle', data: window.dispatcherState.dayWarnRows }
        ];

        let completedCount = 0;
        checkContainer.innerHTML = modules.map(mod => {
            const isDone = !!(mod.data && mod.data.length > 0);
            if (isDone) completedCount++;
            
            const cardBg = isDone ? 'rgba(16, 185, 129, 0.08)' : '#ffffff';
            const cardBorder = isDone ? 'rgba(16, 185, 129, 0.3)' : '#cbd5e1';
            const textColor = isDone ? '#065f46' : '#0f172a';
            const iconColor = isDone ? '#059669' : '#475569';
            const statusText = isDone ? 'To\'ldirildi' : 'To\'ldirilmagan';
            const checkIcon = isDone ? 'fa-check-circle' : 'fa-circle';

            return `
                <div onclick="window.switchReportTab(null, 'tab-${mod.id}')" style="background: ${cardBg}; border: 1px solid ${cardBorder}; padding: 20px; border-radius: 12px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <i class="fas ${mod.icon}" style="color: ${iconColor}; font-size: 1.3rem;"></i>
                        <i class="fas ${checkIcon}" style="color: ${isDone ? '#10b981' : '#cbd5e1'}; font-size: 1rem;"></i>
                    </div>
                    <div style="margin-top: 18px;">
                        <div style="font-weight: 800; font-size: 0.95rem; color: ${textColor}; letter-spacing: 0.2px;">${escapeHtml(mod.name)}</div>
                        <div style="font-size: 0.8rem; font-weight: 600; color: ${isDone ? '#047857' : '#64748b'}; margin-top: 6px;">
                            ${isDone ? '<i class="fas fa-check"></i> ' : ''}${statusText}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const statusEl = document.getElementById('report-overall-status');
        if (completedCount === modules.length) {
            statusEl.innerHTML = '<i class="fas fa-check-double"></i> TAYYOR';
            statusEl.style.background = 'hsl(142, 70%, 45%, 0.1)';
            statusEl.style.color = 'hsl(142, 70%, 35%)';
            statusEl.style.borderColor = 'hsl(142, 70%, 45%, 0.3)';
        } else {
            statusEl.innerHTML = '<i class="fas fa-clock"></i> JARAYONDA: ' + completedCount + '/' + modules.length;
            statusEl.style.color = '#f59e0b';
        }
    };


    // Alias for consistency between old and new reporting engines
    window.submitGlobalReport = window.submitDetailedReport;

    // Update switchReportTab to handle the inner container
    const oldSwitchTab = window.switchReportTab;
    window.switchReportTab = function(btn, tabId) {
        // Toggle Sidebar state
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        if (btn) btn.classList.add('active');

        // Hide all inner content
        document.querySelectorAll('.report-tab-content').forEach(c => c.style.display = 'none');
        
        const target = document.getElementById(tabId);
        if (target) {
            target.style.display = (tabId === 'tab-dashboard' ? 'flex' : 'block');
            
            // Trigger UI updates
            if (tabId === 'tab-dashboard') {
                if (window.updateSubmissionChecklist) window.updateSubmissionChecklist();
            } else {
                window.refreshReportingTables();
            }
        }
    };

    // INITIALIZE GLOBAL SOCKET LISTENERS
    if (window.AppSocket) {
        window.AppSocket.on('report_submitted', (data) => {
            console.log("New report received from:", data.bolinma_id);
            SmartUtils.showToast(`${data.bolinma_id} yangi hisobot yubordi`, "success");
            // Silent refresh
            window.refreshDispatcherData();
        });
    } else {
        // Fallback for window.socket if AppSocket is not used consistently
        if (window.socket) {
            window.socket.on('report_submitted', (data) => {
                console.log("New report received from:", data.bolinma_id);
                SmartUtils.showToast(`${data.bolinma_id} yangi hisobot yubordi`, "success");
                window.refreshDispatcherData();
            });
        }
    }

    // Initialize sidebar styling once
    const style = document.createElement('style');
    style.innerHTML = `
        .sidebar-item { border-radius: 0 25px 25px 0; margin-right: 20px; color: #94a3b8; }
        .sidebar-item:hover { background: rgba(56, 189, 248, 0.05); color: #38bdf8; }
        .sidebar-item.active { background: #3b82f6 !important; color: #fff !important; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
        .report-tab-content { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
    `;
    document.head.appendChild(style);
})();
