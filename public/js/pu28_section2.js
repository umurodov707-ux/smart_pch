/**
 * PU-28 2-BO'LIM: ANIQLANGAN DEFEKTLI RELSLAR VA NAKLADKALAR JURNALI
 * Alohida modul — mustaqil oyna sifatida ochiladi
 * 16 ustunli rasmiy hujjat (NTD/NTI standartiga mos)
 */

window.pu28Section2Data = [];

// ====================================================================
// NTI DEFEKT KODLARI KATALOGI (to'liq)
// ====================================================================
window.NTIDefectCatalog = [
    // 10-19: Головка рельса
    { code: '11.1-2', category: 'Kallak (Головка)', name: 'Выкрашивание металла на головке рельса', urgency: 'Urgent' },
    { code: '14', category: 'Kallak (Головка)', name: 'Волнообразный износ головки рельса', urgency: 'Normal' },
    { code: '17.1-2', category: 'Kallak (Головка)', name: 'Сминание и плющение головки рельса', urgency: 'Urgent' },
    { code: '18.1-2', category: 'Kallak (Головка)', name: 'Вертикальный / боковой износ головки', urgency: 'Normal' },

    // 20-29: Поперечные трещины в головке
    { code: '20.1-2', category: 'Ko\'ndalang darzlar (Поперечные трещины)', name: 'Поперечные трещины из-за внутренних дефектов', urgency: 'Critical' },
    { code: '21.1-2', category: 'Ko\'ndalang darzlar (Поперечные трещины)', name: 'Поперечные трещины в головке от выкрашивания', urgency: 'Critical' },
    { code: '24', category: 'Ko\'ndalang darzlar (Поперечные трещины)', name: 'Поперечные трещины из-за проскальзывания', urgency: 'Critical' },
    { code: '25', category: 'Ko\'ndalang darzlar (Поперечные трещины)', name: 'Продольные трещины под головкой', urgency: 'Critical' },
    { code: '26.1-2', category: 'Ko\'ndalang darzlar (Поперечные трещины)', name: 'Поперечные трещины из-за буксования', urgency: 'Critical' },
    { code: '27.1-2', category: 'Ko\'ndalang darzlar (Поперечные трещины)', name: 'Поперечные трещины в головке от сварного стыка', urgency: 'Critical' },

    // 30-39: Шейка рельса
    { code: '30В.1-2', category: 'Bo\'yin (Шейка)', name: 'Трещины в шейке от болтовых отверстий', urgency: 'Critical' },
    { code: '30Г.1-2', category: 'Bo\'yin (Шейка)', name: 'Продольные трещины в шейке рельса', urgency: 'Critical' },
    { code: '38.1-2', category: 'Bo\'yin (Шейка)', name: 'Трещины в шейке в зоне сварного стыка', urgency: 'Critical' },

    // 40-49: Подошва рельса
    { code: '41.1-2', category: 'Podoshva (Подошва)', name: 'Поперечная трещина в подошве / излом', urgency: 'Critical' },
    { code: '46.1-2', category: 'Podoshva (Подошва)', name: 'Трещины в подошве от коррозии', urgency: 'Urgent' },
    { code: '47.1-2', category: 'Podoshva (Подошва)', name: 'Трещины в подошве около сварного стыка', urgency: 'Critical' },

    // 50-59: Изломы рельса
    { code: '50.1-2', category: 'To\'liq sinish (Излом)', name: 'Поперечный излом рельса без видимых трещин', urgency: 'Critical' },
    { code: '52.1-2', category: 'To\'liq sinish (Излом)', name: 'Поперечный излом из-за дефектов головки', urgency: 'Critical' },
    { code: '53.1-2', category: 'To\'liq sinish (Излом)', name: 'Поперечный излом из-за дефектов шейки', urgency: 'Critical' },
    { code: '55.1-2', category: 'To\'liq sinish (Излом)', name: 'Поперечный излом из-за дефектов подошвы', urgency: 'Critical' },
    { code: '56.1-2', category: 'To\'liq sinish (Излом)', name: 'Излом по сварному стыку', urgency: 'Critical' },

    // 60-69: Сварные стыки
    { code: '60.1-2', category: 'Payvand choklar (Сварка)', name: 'Дефекты электроконтактной сварки', urgency: 'Urgent' },
    { code: '66.1-2', category: 'Payvand choklar (Сварка)', name: 'Выкрашивание наплавленного металла', urgency: 'Urgent' },
    { code: '69.1-2', category: 'Payvand choklar (Сварка)', name: 'Дефекты алюминотермитной сварки', urgency: 'Critical' },

    // 70-79: Прочие дефекты
    { code: '70.1-2', category: 'Boshqalar (Прочие)', name: 'Сильная коррозия рельса', urgency: 'Normal' },
    { code: '74.1-2', category: 'Boshqalar (Прочие)', name: 'Механические повреждения рельса', urgency: 'Urgent' },
    { code: '79.1-2', category: 'Boshqalar (Прочие)', name: 'Искривление рельса во всех плоскостях', urgency: 'Normal' },

    // 80-89: Дефекты накладок
    { code: 'Н11', category: 'Nakladkalar (Накладки)', name: 'Трещина в накладке', urgency: 'Urgent' },
    { code: 'Н12', category: 'Nakladkalar (Накладки)', name: 'Полный излом накладки', urgency: 'Critical' },
    { code: 'Н13', category: 'Nakladkalar (Накладки)', name: 'Выкрашивание прилегающих граней накладки', urgency: 'Normal' }
];

// ====================================================================
// ALOHIDA OYNA — openPU28Section2Window
// ====================================================================
window.openPU28Section2Window = function(departmentId) {
    let modal = document.getElementById('pu28-section2-standalone-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'pu28-section2-standalone-modal';
    modal.className = 'integration-window active';
    modal.style.cssText = `
        z-index: 200000; max-width: 1500px; width: 98%; height: 95vh;
        top: 50%; left: 50%; transform: translate(-50%, -50%);
        border-radius: 30px; overflow: hidden;
        background: var(--bg-deep, #020617);
        box-shadow: 0 50px 100px rgba(0,0,0,0.8), inset 0 0 80px rgba(239, 68, 68, 0.04);
        border: 1px solid rgba(239, 68, 68, 0.2);
    `;

    const deptName = departmentId === 'ishlab-chiqarish' ? 'Barcha bo\'linmalar' : (window.subdivisions?.find(s => s.id === departmentId)?.name || departmentId);

    modal.innerHTML = `
        <div class="window-header" style="padding: 18px 30px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)); border-bottom: 1px solid rgba(239, 68, 68, 0.25); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.15)); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(239, 68, 68, 0.3);">
                    <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 1.2rem;"></i>
                </div>
                <div>
                    <h3 style="margin: 0; color: #f8fafc; font-weight: 900; font-size: 1.15rem; letter-spacing: 0.5px;">
                        PU-28 / 2-BO'LIM: DEFEKTLI RELSLAR VA NAKLADKALAR
                    </h3>
                    <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px; font-weight: 600;">
                        ${deptName} — 16 ustunli rasmiy jurnal (NTD/NTI)
                    </div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <button onclick="openPU28Section2NewModal('${departmentId}')" style="padding: 10px 20px; background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none; color: white; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.82rem; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3); transition: 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                    <i class="fas fa-plus-circle"></i> YANGI DEFEKT
                </button>
                <button onclick="exportPU28Section2ToExcel('${departmentId}')" style="padding: 10px 20px; background: rgba(16, 163, 127, 0.12); border: 1px solid rgba(16, 163, 127, 0.3); color: #10b981; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 0.82rem; display: flex; align-items: center; gap: 8px; transition: 0.3s;" onmouseover="this.style.background='rgba(16,163,127,0.25)'" onmouseout="this.style.background='rgba(16,163,127,0.12)'">
                    <i class="fas fa-file-excel"></i> EXCEL
                </button>
                <button onclick="printPU28Section2('${departmentId}')" style="padding: 10px 20px; background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.2); color: #cbd5e1; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 0.82rem; display: flex; align-items: center; gap: 8px; transition: 0.3s;" onmouseover="this.style.background='rgba(148,163,184,0.2)'" onmouseout="this.style.background='rgba(148,163,184,0.1)'">
                    <i class="fas fa-print"></i> PRINT
                </button>
                <button onclick="document.getElementById('pu28-section2-standalone-modal').remove()" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25); cursor: pointer; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; transition: 0.3s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff';" onmouseout="this.style.background='rgba(239,68,68,0.12)'; this.style.color='#ef4444';">
                    &times;
                </button>
            </div>
        </div>
        <div class="window-content" style="padding: 0; background: #e2e8f0; color: #000; overflow-x: auto; overflow-y: auto; height: calc(100% - 80px); box-sizing: border-box;">
            <div id="pu28-section2-content" style="padding: 25px; overflow-x: auto; min-height: 100%;">
                <div style="text-align: center; color: #64748b; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i><br/><br/>Ma'lumotlar yuklanmoqda...
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Ma'lumotlarni yuklash
    window.loadPU28Section2Data(departmentId);
};

// ====================================================================
// MA'LUMOTLAR YUKLASH
// ====================================================================
window.loadPU28Section2Data = async function(deptId) {
    const container = document.getElementById('pu28-section2-content');
    if (!container) return;

    let localData = [];
    try {
        localData = JSON.parse(localStorage.getItem(`pu28_section2_${deptId}`)) || [];
    } catch(err) {
        localData = [];
    }

    try {
        let serverData = [];
        if (window.ApiClient) {
            serverData = await ApiClient.get(`/api/pu28-section2/${deptId}`);
        }
        if (Array.isArray(serverData) && serverData.length > 0) {
            const mergedMap = new Map();
            (serverData || []).forEach(item => mergedMap.set(item.id, item));
            (localData || []).forEach(item => {
                if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
            });
            window.pu28Section2Data = Array.from(mergedMap.values());
        } else {
            window.pu28Section2Data = localData;
        }
        localStorage.setItem(`pu28_section2_${deptId}`, JSON.stringify(window.pu28Section2Data));
    } catch(e) {
        console.warn("Failed to fetch Section 2 from server, fallback to local:", e);
        window.pu28Section2Data = localData;
    }

    container.innerHTML = generatePU28Section2TableBody(deptId);
};

// ====================================================================
// JADVAL GENERATSIYA
// ====================================================================
function generatePU28Section2TableBody(deptId) {
    const records = window.pu28Section2Data || [];
    
    let tableRows = '';
    const minRows = 12;

    for (let i = 0; i < Math.max(records.length, minRows); i++) {
        if (i < records.length) {
            const r = records[i];
            const isReplaced = r.resolved_status === 'replaced' || r.resolvedStatus === 'replaced';
            
            tableRows += `
                <tr style="background: ${isReplaced ? 'rgba(16, 185, 129, 0.04)' : '#fff'}; border-bottom: 1px solid #cbd5e1;">
                    <td style="text-align: center; font-weight: bold; color: #475569; padding: 10px 6px;">${i + 1}</td>
                    <td style="text-align: center; font-size: 0.85rem; padding: 10px 6px;">${r.date_detected || r.dateDetected || '-'}</td>
                    <td style="text-align: center; font-weight: bold; padding: 10px 6px;">${r.track_no || r.trackNo || '1'}</td>
                    <td style="text-align: center; font-weight: bold; color: #0284c7; padding: 10px 6px;">${r.km}</td>
                    <td style="text-align: center; font-weight: bold; color: #0284c7; padding: 10px 6px;">${r.pk}</td>
                    <td style="text-align: center; font-weight: bold; padding: 10px 6px;">${r.zveno}</td>
                    <td style="text-align: center; padding: 10px 6px;">
                        <span style="padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; background: ${r.thread_side === 'O\'ng' || r.threadSide === 'O\'ng' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${r.thread_side === 'O\'ng' || r.threadSide === 'O\'ng' ? '#0284c7' : '#d97706'};">
                            ${r.thread_side || r.threadSide || 'O\'ng'}
                        </span>
                    </td>
                    <td style="text-align: center; font-size: 0.85rem; padding: 10px 6px;">${r.factory_mark || r.factoryMark || '-'}</td>
                    <td style="text-align: center; font-size: 0.85rem; padding: 10px 6px;">${r.rolling_year || r.rollingYear || '-'}</td>
                    <td style="text-align: center; font-weight: bold; font-family: monospace; padding: 10px 6px;">${r.heat_no || r.heatNo || '-'}</td>
                    <td style="text-align: center; font-weight: bold; padding: 10px 6px;">${r.rail_type || r.railType || 'R-65'}</td>
                    <td style="text-align: center; padding: 10px 6px;">
                        <span style="padding: 4px 10px; border-radius: 6px; font-weight: 900; font-family: monospace; font-size: 0.85rem; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;">
                            ${r.defect_code || r.defectCode || '-'}
                        </span>
                    </td>
                    <td style="padding: 10px 8px; font-size: 0.85rem; line-height: 1.4;">
                        <div>${r.defect_desc || r.defectDesc || '-'}</div>
                        ${r.defect_photo || r.defectPhoto ? `
                            <div style="margin-top: 6px;">
                                <img src="${r.defect_photo || r.defectPhoto}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 2px solid #ef4444; cursor: pointer;" onclick="window.openFullPU28Photo && window.openFullPU28Photo(this.src)" title="Defekt fotosurati" />
                            </div>
                        ` : ''}
                    </td>
                    <td style="text-align: center; font-size: 0.82rem; font-weight: bold; color: #d97706; padding: 10px 6px;">
                        ${r.replacement_deadline || r.replacementDeadline || '-'}
                    </td>
                    <td style="text-align: center; font-size: 0.82rem; padding: 10px 6px;">
                        ${r.defective_fishplates || r.defectiveFishplates || 'Yo\'q'}
                    </td>
                    <td style="text-align: center; padding: 10px 6px;">
                        ${isReplaced ? `
                            <div style="color: #059669; font-weight: bold; font-size: 0.8rem;">
                                <i class="fas fa-check-circle"></i> ${r.date_replaced || r.dateReplaced}<br/>
                                <span style="font-size: 0.7rem; color: #10b981;">(Almashtirildi)</span>
                            </div>
                            ${r.work_photo || r.workPhoto ? `
                                <div style="display: flex; gap: 4px; justify-content: center; margin-top: 4px;">
                                    <img src="${r.work_photo || r.workPhoto}" style="width: 36px; height: 36px; border-radius: 4px; object-fit: cover; border: 1px solid #10b981; cursor: pointer;" onclick="window.openFullPU28Photo && window.openFullPU28Photo(this.src)" title="Bajarilgan ish" />
                                    ${r.face_photo || r.facePhoto ? `<img src="${r.face_photo || r.facePhoto}" style="width: 36px; height: 36px; border-radius: 4px; object-fit: cover; border: 1px solid #3b82f6; cursor: pointer;" onclick="window.openFullPU28Photo && window.openFullPU28Photo(this.src)" title="Tasdiqlovchi (Face ID)" />` : ''}
                                </div>
                            ` : ''}
                        ` : `
                            <div style="display: flex; flex-direction: column; gap: 5px; align-items: center;">
                                <span style="color: #ef4444; font-size: 0.75rem; font-weight: bold;">Kutilmoqda</span>
                                <button onclick="resolvePU28Section2Defect(${r.id})" style="padding: 4px 10px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                                    <i class="fas fa-wrench"></i> Almashtirildi
                                </button>
                            </div>
                        `}
                    </td>
                </tr>
            `;
        } else {
            tableRows += `
                <tr style="border-bottom: 1px dashed #cbd5e1; height: 42px;">
                    <td style="text-align: center; color: #cbd5e1; font-size: 0.8rem;">${i + 1}</td>
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
            `;
        }
    }

    const deptName = deptId === 'ishlab-chiqarish' ? 'Barcha bo\'linmalar' : (window.subdivisions?.find(s => s.id === deptId)?.name || deptId);

    // Statistika hisoblash
    const totalDefects = records.length;
    const replacedCount = records.filter(r => r.resolved_status === 'replaced' || r.resolvedStatus === 'replaced').length;
    const pendingCount = totalDefects - replacedCount;
    const criticalCount = records.filter(r => {
        const code = r.defect_code || r.defectCode || '';
        const defect = window.NTIDefectCatalog.find(d => d.code === code);
        return defect && defect.urgency === 'Critical';
    }).length;

    return `
        <style>
            .pu28-sec2-doc {
                background: #fff;
                color: #000;
                padding: 25px;
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                font-family: 'Times New Roman', Times, serif;
                overflow-x: auto;
            }
            .pu28-sec2-table {
                width: 100%;
                border-collapse: collapse;
                min-width: 1300px;
            }
            .pu28-sec2-table th {
                background: #f8fafc;
                color: #0f172a;
                font-weight: bold;
                font-size: 0.8rem;
                text-align: center;
                border: 1px solid #64748b;
                padding: 8px 4px;
                vertical-align: middle;
            }
            .pu28-sec2-table td {
                border: 1px solid #94a3b8;
            }
        </style>

        <!-- Statistika paneli -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 18px 20px; border-radius: 14px; border-left: 4px solid #ef4444; display: flex; align-items: center; gap: 15px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(239,68,68,0.15); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 1.3rem;"></i>
                </div>
                <div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #ef4444;">${totalDefects}</div>
                    <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Jami defektlar</div>
                </div>
            </div>
            <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 18px 20px; border-radius: 14px; border-left: 4px solid #f59e0b; display: flex; align-items: center; gap: 15px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(245,158,11,0.15); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-clock" style="color: #f59e0b; font-size: 1.3rem;"></i>
                </div>
                <div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #f59e0b;">${pendingCount}</div>
                    <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Kutilmoqda</div>
                </div>
            </div>
            <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 18px 20px; border-radius: 14px; border-left: 4px solid #10b981; display: flex; align-items: center; gap: 15px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16,185,129,0.15); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.3rem;"></i>
                </div>
                <div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #10b981;">${replacedCount}</div>
                    <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Almashtirilgan</div>
                </div>
            </div>
            <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 18px 20px; border-radius: 14px; border-left: 4px solid #dc2626; display: flex; align-items: center; gap: 15px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(220,38,38,0.15); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-skull-crossbones" style="color: #dc2626; font-size: 1.3rem;"></i>
                </div>
                <div>
                    <div style="font-size: 1.8rem; font-weight: 900; color: #dc2626;">${criticalCount}</div>
                    <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Kritik (Critical)</div>
                </div>
            </div>
        </div>

        <div class="pu28-sec2-doc">
            <h3 style="text-align: center; margin-top: 0; margin-bottom: 5px; font-weight: bold; text-transform: uppercase; font-size: 1.1rem; color: #000;">
                2. Данные о выявленных дефектных рельсах и накладках, лежащих в главных и приемо-отправочных путях
            </h3>
            <div style="text-align: center; font-size: 0.9rem; color: #334155; margin-bottom: 20px; font-style: italic;">
                Bo'linma: <b>${deptName}</b>
            </div>

            <table class="pu28-sec2-table">
                <thead>
                    <tr>
                        <th rowspan="3" style="width: 35px;">№<br/>п/п</th>
                        <th rowspan="3" style="width: 90px;">Дата<br/>обнару-<br/>жения</th>
                        <th colspan="5">Место, где лежит обнаруженный дефектный рельс или накладка</th>
                        <th colspan="4">Характеристика рельса</th>
                        <th rowspan="3" style="width: 90px;">№ рисунка<br/>дефекта<br/>рельса</th>
                        <th rowspan="3">Характеристика<br/>дефектного<br/>рельса</th>
                        <th rowspan="3" style="width: 110px;">Указание о<br/>сроке замены<br/>дефектного<br/>рельса</th>
                        <th rowspan="3" style="width: 90px;">Наличие<br/>дефектных<br/>накладок</th>
                        <th rowspan="3" style="width: 120px;">Дата замены<br/>дефектного<br/>рельса или<br/>накладки</th>
                    </tr>
                    <tr>
                        <th rowspan="2" style="width: 50px;">№<br/>пути</th>
                        <th rowspan="2" style="width: 60px;">Км</th>
                        <th rowspan="2" style="width: 50px;">№<br/>пикета</th>
                        <th rowspan="2" style="width: 50px;">№<br/>звена</th>
                        <th rowspan="2" style="width: 65px;">Правая<br/>или левая<br/>нить</th>
                        <th rowspan="2" style="width: 70px;">Марка<br/>завода</th>
                        <th rowspan="2" style="width: 60px;">Год<br/>прокатки</th>
                        <th rowspan="2" style="width: 80px;">№ плавки<br/>(Р-43, Р-50,<br/>Р-65)</th>
                        <th rowspan="2" style="width: 65px;">Тип<br/>рельса</th>
                    </tr>
                    <tr></tr>
                    <tr style="background: #e2e8f0; font-size: 0.7rem; color: #475569; font-weight: bold;">
                        ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(num => `<td style="text-align: center; padding: 2px;">${num}</td>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// ====================================================================
// YANGI DEFEKT KIRITISH MODAL
// ====================================================================
window.openPU28Section2NewModal = function(deptId) {
    let modal = document.getElementById('pu28-sec2-new-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'pu28-sec2-new-modal';
    modal.className = 'active';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px);
        z-index: 250000; display: flex; align-items: center; justify-content: center; padding: 20px;
    `;

    const catalogOptions = window.NTIDefectCatalog.map(c => `
        <option value="${c.code}">[${c.code}] ${c.category}: ${c.name}</option>
    `).join('');

    modal.innerHTML = `
        <div style="background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 24px; padding: 30px; max-width: 750px; width: 100%; max-height: 90vh; overflow-y: auto; color: white; box-shadow: 0 25px 60px rgba(0,0,0,0.8);">
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #38bdf8; font-weight: 800; font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-plus-circle"></i> PU-28 2-Bo'lim: Yangi Defektli Rels / Nakladka Kiritish
                </h3>
                <button onclick="document.getElementById('pu28-sec2-new-modal').remove()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <form id="pu28-sec2-form" onsubmit="window.savePU28Section2Form(event, '${deptId}')" style="display: flex; flex-direction: column; gap: 16px;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">2. Aniqlangan sana *</label>
                        <input type="date" id="sec2-date" required value="${new Date().toISOString().split('T')[0]}" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">3. Yo'l № *</label>
                        <input type="text" id="sec2-track" required value="1" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">7. Nit (Ip) *</label>
                        <select id="sec2-thread" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;">
                            <option value="O'ng">O'ng nit (Правая)</option>
                            <option value="Chap">Chap nit (Левая)</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">4. KM *</label>
                        <input type="number" id="sec2-km" required placeholder="4020" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; font-weight: bold; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">5. PK *</label>
                        <input type="number" id="sec2-pk" required placeholder="4" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; font-weight: bold; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">6. Zveno № *</label>
                        <input type="number" id="sec2-zv" required placeholder="2" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; font-weight: bold; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">8. Zavod markasi</label>
                        <input type="text" id="sec2-factory" placeholder="K, AZ, TZ" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">9. Prokat yili</label>
                        <input type="text" id="sec2-year" placeholder="2018" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">10. Plavka №</label>
                        <input type="text" id="sec2-heat" placeholder="P-4821" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">11. Rels Turi</label>
                        <select id="sec2-type" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;">
                            <option value="R-65">R-65</option>
                            <option value="R-50">R-50</option>
                            <option value="R-75">R-75</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="font-size: 0.75rem; color: #f59e0b; font-weight: 800; display: block; margin-bottom: 4px;">12. № рисунка дефекта (NTI Defekt Kodi Katalogi) *</label>
                    <select id="sec2-code" required style="width: 100%; background: #020617; border: 1px solid #f59e0b; color: #facc15; padding: 10px; border-radius: 10px; font-size: 0.85rem; font-weight: bold; box-sizing: border-box;">
                        <option value="">-- Katalogdan Defekt Kodini Tanlang --</option>
                        ${catalogOptions}
                    </select>
                </div>

                <div>
                    <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">13. Defekt Tavsifi (Kattaligi, chuqurligi) *</label>
                    <textarea id="sec2-desc" required rows="2" placeholder="Masalan: Kallak yeyilishi 4.2mm, o'ng tomonda 12sm ko'ndalang darz..." style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;"></textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">14. Almashtirish Muddati (Срок замены)</label>
                        <input type="text" id="sec2-deadline" placeholder="Darhol (24 soat) / 3 kun" value="Darhol (24 soat)" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">15. Defektli Nakladkalar</label>
                        <select id="sec2-fishplates" style="width: 100%; background: #020617; border: 1px solid #334155; color: white; padding: 10px; border-radius: 10px; font-size: 0.85rem; box-sizing: border-box;">
                            <option value="Yo'q">Yo'q (Без дефектов)</option>
                            <option value="Н11 - Darz bor">Н11 - Darz bor</option>
                            <option value="Н12 - Sinik nakladka">Н12 - Sinik nakladka</option>
                        </select>
                    </div>
                </div>

                <!-- Photo Attachment -->
                <div style="background: rgba(2, 6, 23, 0.6); border: 1px dashed #38bdf8; border-radius: 12px; padding: 15px; text-align: center;">
                    <label style="font-size: 0.8rem; color: #38bdf8; font-weight: 800; display: block; margin-bottom: 10px;">
                        <i class="fas fa-camera"></i> Defekt Fotosuratini Biriktirish
                    </label>
                    <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                        <button type="button" onclick="if(window.openMurojaatDocCamera) openMurojaatDocCamera()" style="padding: 8px 16px; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">
                            <i class="fas fa-camera"></i> Kamera
                        </button>
                        <label style="padding: 8px 16px; background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; color: #f59e0b; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: bold; margin: 0;">
                            <i class="fas fa-folder-open"></i> Fayl
                            <input type="file" accept="image/*" style="display: none;" onchange="handleSec2FileSelect(this)">
                        </label>
                        <input type="hidden" id="sec2-attachment-data" value="">
                    </div>
                    <div id="sec2-attachment-preview" style="display: none; margin: 10px auto 0; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 2px solid #38bdf8; position: relative;">
                        <img id="sec2-attachment-img" src="" style="width: 100%; height: 100%; object-fit: cover;">
                        <button type="button" onclick="removeSec2Attachment()" style="position: absolute; top: 2px; right: 2px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer;">✕</button>
                    </div>
                </div>

                <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 10px;">
                    <button type="button" onclick="document.getElementById('pu28-sec2-new-modal').remove()" style="padding: 12px 25px; background: transparent; border: 1px solid #475569; color: #cbd5e1; border-radius: 10px; cursor: pointer; font-weight: bold;">
                        Bekor qilish
                    </button>
                    <button type="submit" style="padding: 12px 30px; background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none; color: white; border-radius: 10px; cursor: pointer; font-weight: 800; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);">
                        <i class="fas fa-save"></i> Saqlash va Yuborish
                    </button>
                </div>

            </form>
        </div>
    `;

    document.body.appendChild(modal);
};

// File select handler for Section 2
window.handleSec2FileSelect = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('sec2-attachment-data').value = e.target.result;
            document.getElementById('sec2-attachment-img').src = e.target.result;
            document.getElementById('sec2-attachment-preview').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.removeSec2Attachment = function() {
    document.getElementById('sec2-attachment-data').value = '';
    document.getElementById('sec2-attachment-preview').style.display = 'none';
};

// ====================================================================
// SAQLASH
// ====================================================================
window.savePU28Section2Form = async function(e, deptId) {
    e.preventDefault();
    
    const newRecord = {
        id: Date.now(),
        bolinma_id: deptId,
        departmentId: deptId,
        date_detected: document.getElementById('sec2-date').value,
        dateDetected: document.getElementById('sec2-date').value,
        track_no: document.getElementById('sec2-track').value,
        trackNo: document.getElementById('sec2-track').value,
        thread_side: document.getElementById('sec2-thread').value,
        threadSide: document.getElementById('sec2-thread').value,
        km: parseInt(document.getElementById('sec2-km').value) || 0,
        pk: parseInt(document.getElementById('sec2-pk').value) || 0,
        zveno: parseInt(document.getElementById('sec2-zv').value) || 0,
        factory_mark: document.getElementById('sec2-factory').value,
        factoryMark: document.getElementById('sec2-factory').value,
        rolling_year: document.getElementById('sec2-year').value,
        rollingYear: document.getElementById('sec2-year').value,
        heat_no: document.getElementById('sec2-heat').value,
        heatNo: document.getElementById('sec2-heat').value,
        rail_type: document.getElementById('sec2-type').value,
        railType: document.getElementById('sec2-type').value,
        defect_code: document.getElementById('sec2-code').value,
        defectCode: document.getElementById('sec2-code').value,
        defect_desc: document.getElementById('sec2-desc').value,
        defectDesc: document.getElementById('sec2-desc').value,
        replacement_deadline: document.getElementById('sec2-deadline').value,
        replacementDeadline: document.getElementById('sec2-deadline').value,
        defective_fishplates: document.getElementById('sec2-fishplates').value,
        defectiveFishplates: document.getElementById('sec2-fishplates').value,
        defect_photo: document.getElementById('sec2-attachment-data')?.value || null,
        defectPhoto: document.getElementById('sec2-attachment-data')?.value || null,
        resolved_status: 'pending',
        resolvedStatus: 'pending'
    };

    // Save locally first for robust performance
    if (!Array.isArray(window.pu28Section2Data)) window.pu28Section2Data = [];
    window.pu28Section2Data.unshift(newRecord);
    localStorage.setItem(`pu28_section2_${deptId}`, JSON.stringify(window.pu28Section2Data));

    // Try server sync asynchronously without throwing error dialogs
    try {
        if (window.ApiClient) {
            await ApiClient.post('/api/pu28-section2', newRecord);
        }
        if (window.SmartUtils) SmartUtils.showToast("Defektli rels muvaffaqiyatli saqlandi!", "success");
    } catch(err) {
        console.warn("Server sync notice (saved locally):", err);
        if (window.SmartUtils) SmartUtils.showToast("Defektli rels muvaffaqiyatli saqlandi!", "success");
    }

    const modal = document.getElementById('pu28-sec2-new-modal');
    if (modal) modal.remove();

    window.loadPU28Section2Data(deptId);
};

// ====================================================================
// DEFEKTNI HAL QILISH (Almashtirildi deb belgilash)
// ====================================================================
window.resolvePU28Section2Defect = async function(recordId) {
    const dateReplaced = new Date().toISOString().split('T')[0];
    
    // Update local state first
    if (Array.isArray(window.pu28Section2Data)) {
        const record = window.pu28Section2Data.find(r => r.id === recordId || String(r.id) === String(recordId));
        if (record) {
            record.resolved_status = 'replaced';
            record.resolvedStatus = 'replaced';
            record.date_replaced = dateReplaced;
            record.dateReplaced = dateReplaced;
        }
    }

    try {
        const numId = Number(recordId);
        if (window.ApiClient && !isNaN(numId) && numId < 1000000000) {
            await ApiClient.put(`/api/pu28-section2/${recordId}/resolve`, { date_replaced: dateReplaced });
        }
        if (window.SmartUtils) SmartUtils.showToast("Defekt 'Almashtirildi' deb belgilandi!", "success");
    } catch(err) {
        console.warn("Resolve server sync warning:", err);
        if (window.SmartUtils) SmartUtils.showToast("Defekt 'Almashtirildi' deb belgilandi!", "success");
    }

    const modal = document.getElementById('pu28-section2-standalone-modal');
    if (modal) {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('pu28_section2_'));
        if (keys.length > 0) {
            const lastDeptId = keys[keys.length - 1].replace('pu28_section2_', '');
            window.loadPU28Section2Data(lastDeptId);
        }
    }
};

// ====================================================================
// EXCEL EXPORT
// ====================================================================
window.exportPU28Section2ToExcel = function(deptId) {
    const records = window.pu28Section2Data || [];
    if (records.length === 0) {
        if (window.SmartUtils) SmartUtils.showToast("Eksport uchun ma'lumot yo'q!", "warning");
        return;
    }

    const dataForExport = records.map((r, i) => ({
        '№': i + 1,
        'Дата обнаружения': r.date_detected || r.dateDetected,
        '№ пути': r.track_no || r.trackNo,
        'Км': r.km,
        'Пк': r.pk,
        'Звено': r.zveno,
        'Нить': r.thread_side || r.threadSide,
        'Марка завода': r.factory_mark || r.factoryMark,
        'Год прокатки': r.rolling_year || r.rollingYear,
        '№ плавки': r.heat_no || r.heatNo,
        'Тип рельса': r.rail_type || r.railType,
        '№ дефекта': r.defect_code || r.defectCode,
        'Характеристика дефекта': r.defect_desc || r.defectDesc,
        'Срок замены': r.replacement_deadline || r.replacementDeadline,
        'Дефектные накладки': r.defective_fishplates || r.defectiveFishplates,
        'Дата замены': r.date_replaced || r.dateReplaced || 'Kutilmoqda'
    }));

    if (window.SmartReporting) {
        SmartReporting.exportToExcel(dataForExport, `PU28_Section2_Defektli_Relslar_${deptId}.xlsx`);
    } else {
        console.error("SmartReporting not found");
    }
};

// ====================================================================
// PRINT (PDF)
// ====================================================================
window.printPU28Section2 = function(deptId) {
    const content = generatePU28Section2TableBody(deptId);
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>PU-28 2-Bo'lim Report</title>
            <style>
                body { font-family: 'Times New Roman', serif; padding: 20px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <button onclick="window.print()" class="no-print" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; margin-bottom: 20px;">🖨️ Chop etish</button>
            ${content}
        </body>
        </html>
    `);
    win.document.close();
};
