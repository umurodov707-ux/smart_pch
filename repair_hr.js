const fs = require('fs');
let code = fs.readFileSync('public/js/hr.js', 'utf8');

// The corrupted start
const startText = `        SmartUtils.showToast('Serverga bog\\'lanib bo\\'lmadi. Murojaat qurilmada saqlandi va aloqa tiklang/**`;
const startIndex = code.indexOf(startText);

// The corrupted end
const endText = `}atlar', JSON.stringify(murojaatlar));\r\n        SmartUtils.showToast('Murojaat boshliq (Salimov Sh.B) ga yo\\'naltirildi!', 'success');\r\n        renderHRDashboard('all');\r\n    }\r\n}`;
let endIndex = code.indexOf(endText);
if(endIndex === -1) {
    // Try \n instead of \r\n
    const endText2 = `}atlar', JSON.stringify(murojaatlar));\n        SmartUtils.showToast('Murojaat boshliq (Salimov Sh.B) ga yo\\'naltirildi!', 'success');\n        renderHRDashboard('all');\n    }\n}`;
    endIndex = code.indexOf(endText2);
    if(endIndex !== -1) endIndex += endText2.length;
} else {
    endIndex += endText.length;
}

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find patch points.", "startIndex:", startIndex, "endIndex:", endIndex);
    process.exit(1);
}

const replacement = `        SmartUtils.showToast('Serverga bog\\'lanib bo\\'lmadi. Murojaat qurilmada saqlandi va aloqa tiklangach yuboriladi.', 'warning');
        
        const modal = document.getElementById('hr-murojaat-modal');
        if (modal) modal.classList.remove('active');
    }
};

/**
 * HR Inbox Widget for Murojaatlar
 */
function renderHRMurojaatInbox() {
    // Disabled as we now use openHRMurojaatInboxModal
    return '';
}

window.openHRMurojaatInboxModal = async function () {
    const userRole = window.Auth?.currentUser?.role || 'guest';
    
    // Create Inbox Modal
    let modal = document.getElementById('murojaat-inbox-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'murojaat-inbox-modal';
        modal.className = 'department-window';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = \`
        <div class="window-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #38bdf8; padding: 15px 30px;">
            <h2 class="department-name" style="color: #f8fafc; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-inbox" style="color: #38bdf8; filter: drop-shadow(0 0 5px rgba(56,189,248,0.5));"></i> KELGAN MUROJAATLAR
            </h2>
            <button class="close-btn" onclick="document.getElementById('murojaat-inbox-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="background: radial-gradient(circle at top left, #0f172a, #020617); padding: 30px; overflow-y: auto; height: calc(100% - 70px);">
            <div id="murojaat-inbox-content" style="display: flex; flex-direction: column; gap: 15px;">
                <div style="text-align: center; color: white; margin-top: 50px;">
                    <i class="fas fa-spinner fa-spin fa-3x"></i><br><br>Ma'lumotlar yuklanmoqda...
                </div>
            </div>
        </div>
    \`;
    modal.classList.add('active');

    try {
        const murojaatlar = await SmartUtils.fetchAPI('/murojaat');
        let filtered = [];
        let title = "";
        let btnColor = "linear-gradient(135deg, #10b981, #059669)";
        
        if (userRole === 'admin') {
            filtered = murojaatlar.filter(m => m.status === 'pending');
            title = "Tasdiqlash uchun (Boshliqda)";
            btnColor = "linear-gradient(135deg, #d4af37, #b8860b)";
        } else {
            filtered = murojaatlar.filter(m => m.status === 'pending');
            title = "Kelgan Murojaatlar";
        }

        const container = document.getElementById('murojaat-inbox-content');
        if (filtered.length === 0) {
            container.innerHTML = \`
                <div style="text-align: center; padding: 50px; border: 1px dashed rgba(255,255,255,0.2); border-radius: 20px;">
                    <i class="fas fa-envelope-open" style="font-size: 3rem; color: rgba(255,255,255,0.2); margin-bottom: 15px; display:block;"></i>
                    <h3 style="color: #cbd5e1;">Hozircha murojaatlar yo'q</h3>
                </div>
            \`;
            return;
        }

        container.innerHTML = filtered.map(m => \`
            <div style="background: rgba(30, 41, 59, 0.6); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: 0.3s;" onmouseover="this.style.borderColor='#38bdf8'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <strong style="font-size: 1.1rem; color: white;">\${m.employee_name || 'Noma\\'lum'} (\${m.employee_position || ''})</strong>
                    <span style="font-size: 0.8rem; color: #94a3b8;"><i class="fas fa-clock"></i> \${new Date(m.created_at).toLocaleString('uz-UZ')}</span>
                </div>
                <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 15px;">
                    <i class="fas fa-building" style="color: #d4af37;"></i> \${m.bolinma_id} <span style="margin: 0 10px;">|</span> <i class="fas fa-file-alt" style="color: #3b82f6;"></i> \${m.murojaat_type}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="viewMurojaatDetails(\${m.id})" style="flex: 1; padding: 12px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                        <i class="fas fa-eye"></i> KO'RISH
                    </button>
                    \${userRole === 'admin' ? \`
                        <button onclick="approveMurojaatByAdmin(\${m.id})" style="flex: 2; padding: 12px; background: \${btnColor}; border: none; color: white; border-radius: 10px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
                            <i class="fas fa-check"></i> TASDIQLASH (VIZA)
                        </button>
                        <button onclick="rejectMurojaatByAdmin(\${m.id})" style="flex: 1; padding: 12px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; border-radius: 10px; font-weight: bold; cursor: pointer;">
                            <i class="fas fa-times"></i> RAD ETISH
                        </button>
                    \` : ''}
                </div>
            </div>
        \`).join('');
    } catch (e) {
        console.error('Inbox yuklashda xato:', e);
        document.getElementById('murojaat-inbox-content').innerHTML = \`<p style="color:red; text-align:center;">Ma'lumotlarni yuklashda xatolik yuz berdi.</p>\`;
    }
}

window.approveMurojaatByAdmin = function (id) {
    let modal = document.createElement('div');
    modal.id = 'admin-visa-modal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.9); z-index:20005; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); font-family: "Inter", sans-serif;';
    
    modal.innerHTML = \`
        <div style="background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%); width: 700px; border-radius: 20px; border: 1px solid rgba(56,189,248,0.3); color: white; box-shadow: 0 15px 50px rgba(0,0,0,0.5); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0284c7, #0369a1); padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #38bdf8;">
                <h3 style="margin: 0; font-size: 1.3rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-stamp"></i> Korxona Rahbari Vizasi</h3>
                <button onclick="document.getElementById('admin-visa-modal').remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; transition: 0.3s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='white'">&times;</button>
            </div>
            
            <div style="padding: 30px;">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #38bdf8; font-weight: 600;">
                        <i class="fas fa-pen-nib"></i> Boshliq rezolyutsiyasi (buyruq):
                    </label>
                    <textarea id="admin-visa-text" style="width: 100%; height: 100px; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(56,189,248,0.3); color: white; border-radius: 12px; outline: none; font-size: 1rem; resize: none; transition: 0.3s;" onfocus="this.style.borderColor='#38bdf8'" onblur="this.style.borderColor='rgba(56,189,248,0.3)'">O'zbekiston Respublikasi Mehnat Kodeksiga asosan ruxsat berilsin. Xodimlar va Buxgalteriya bo'limiga ijro uchun.</textarea>
                </div>
                
                <div style="display: flex; gap: 15px; margin-top: 20px;">
                    <button onclick="document.getElementById('admin-visa-modal').remove()" style="flex: 1; padding: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 12px; cursor: pointer; font-weight: bold; transition: 0.2s;">
                        Bekor qilish
                    </button>
                    <button onclick="finalizeAdminVisa(\${id})" style="flex: 2; padding: 15px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(16,185,129,0.4);">
                        <i class="fas fa-check-double"></i> Tasdiqlash
                    </button>
                </div>
            </div>
        </div>
    \`;
    document.body.appendChild(modal);
}

window.rejectMurojaatByAdmin = async function (id) {
    if (confirm("Ushbu murojaatni rad etishni tasdiqlaysizmi?")) {
        try {
            await SmartUtils.fetchAPI(\`/murojaat/\${id}/reject\`, {
                method: 'PATCH',
                body: JSON.stringify({ manager_name: window.Auth?.currentUser?.name || 'Rahbar' })
            });
            SmartUtils.showToast('Murojaat rad etildi!', 'success');
            openHRMurojaatInboxModal();
        } catch (e) {
            SmartUtils.showToast("Xatolik", 'error');
        }
    }
}

window.finalizeAdminVisa = async function (id) {
    const visaText = document.getElementById('admin-visa-text').value;
    const managerName = window.Auth?.currentUser?.name || 'Rahbar';
    
    try {
        await SmartUtils.fetchAPI(\`/murojaat/\${id}/approve\`, {
            method: 'PATCH',
            body: JSON.stringify({ manager_name: managerName, manager_comment: visaText })
        });
        
        SmartUtils.showToast('Murojaat korxona rahbari tomonidan tasdiqlandi!', 'success');
        document.getElementById('admin-visa-modal').remove();
        
        openHRMurojaatInboxModal();
        
    } catch (e) {
        SmartUtils.showToast("Tasdiqlashda xatolik yuz berdi", 'error');
    }
}

window.viewMurojaatDetails = async function (id) {
    try {
        const m = await SmartUtils.fetchAPI(\`/murojaat/\${id}\`);
        if (!m) return;
        
        let preview = document.createElement('div');
        preview.id = 'murojaat-preview-modal';
        preview.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:20002; display:flex; align-items:center; justify-content:center;';
        preview.innerHTML = \`
            <div style="background:#1e293b; width:600px; padding:30px; border-radius:20px; border:1px solid rgba(255,255,255,0.1); color:white; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                    <h3 style="margin:0"><i class="fas fa-file-alt"></i> Murojaat tafsilotlari - \${m.murojaat_type}</h3>
                    <button onclick="document.getElementById('murojaat-preview-modal').remove()" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                <div style="background:white; color:black; padding:30px; border-radius:10px; font-family:'Times New Roman', serif; line-height:1.6; font-size:14pt; margin-bottom:20px; white-space:pre-wrap; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    \${m.murojaat_text}
                    
                    <div style="margin-top:40px; border-top:1px solid #ddd; padding-top:20px; display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <div style="color: \${m.face_verified ? '#27ae60' : '#e74c3c'}; font-weight: bold; font-size: 10pt;">
                                <i class="fas \${m.face_verified ? 'fa-check-circle' : 'fa-times-circle'}"></i> Face ID \${m.face_verified ? 'bilan tasdiqlangan' : 'mavjud emas'}
                            </div>
                            \${m.signature_data ? \`<img src="\${m.signature_data}" style="max-height: 70px; display:block; margin-top:10px; border-bottom: 1px solid #333;">\` : ''}
                            <div style="font-size:10pt; color: #333; margin-top: 5px;">(\${m.employee_name}) imzosi</div>
                        </div>
                    </div>

                    \${m.status === 'approved' ? \`
                    <div style="margin-top:30px; background: rgba(56, 189, 248, 0.05); border: 2px solid #38bdf8; border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
                        <h4 style="color: #0369a1; margin: 0 0 10px 0; font-family: 'Inter', sans-serif;"><i class="fas fa-gavel"></i> KORXONA RAHBARI VIZASI</h4>
                        <p style="font-weight: bold; font-size: 1.1rem; color: #0f172a; margin-bottom: 15px; font-style: italic;">"\${m.manager_comment}"</p>
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #cbd5e1; padding-top: 15px;">
                            <div>
                                <span style="font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #64748b; font-weight: bold;">TASDIQLANDI (ERI)</span><br>
                                <span style="font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #94a3b8;">Sana: \${new Date(m.approved_date).toLocaleString()}</span>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.9rem; color: #000; font-family: 'Inter', sans-serif; font-weight: bold; margin-top: 5px;">\${m.manager_name}</div>
                            </div>
                        </div>
                    </div>
                    \` : ''}
                </div>
                <div style="display: flex; gap: 10px;">
                     <button onclick="document.getElementById('murojaat-preview-modal').remove()" style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); border: none; color: white; border-radius: 10px; cursor: pointer;">Yopish</button>
                </div>
            </div>
        \`;
        document.body.appendChild(preview);
    } catch (e) {
        console.error(e);
        SmartUtils.showToast("Murojaat yuklanmadi", 'error');
    }
}

window.forwardMurojaatToAdmin = function (id) {
    // Disabled as both HR and Admin use the centralized inbox
}`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('public/js/hr.js', code);
console.log('Fixed hr.js successfully!');
