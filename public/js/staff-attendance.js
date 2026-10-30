/**
 * SMART PCH - Staff Attendance Widget Module
 * Handles branch-specific staff lists and Face ID operations
 */

const StaffAttendance = {
    employees: [],
    attendance: {}, // {empId: true/false} for today

    init: async function(bolinmaId) {
        try {
            if (!window.hrData || !window.hrData.employees || window.hrData.employees.length === 0) {
                await window.initHRData();
            }
            
            const currentUser = window.Auth?.currentUser || window.currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');
            let targetBolinmaId = bolinmaId;
            let isSub = false;

            if (currentUser) {
                const role = String(currentUser.role).toLowerCase();
                const username = String(currentUser.username || '').toLowerCase();
                isSub = role === 'bolinma' || role === 'subdivision' || username.includes('bolinma') || username.includes("bo'linma");
                
                if (isSub && role !== 'admin') {
                    let userBolinma = null;
                    const numMatch = username.match(/\d+/) || (currentUser.bolinmalar && currentUser.bolinmalar.length > 0 && currentUser.bolinmalar[0].match(/\d+/));
                    if (numMatch) {
                        userBolinma = `${numMatch[0]}-bo'linma`;
                    }
                    if (userBolinma) {
                        targetBolinmaId = userBolinma;
                    }
                }
            }
            
            // Filter employees for this branch (Handle both ID and Name)
            this.employees = (window.hrData.employees || []).filter(e => {
                if (!targetBolinmaId || targetBolinmaId === 'all') return true;
                
                const filterNumMatch = String(targetBolinmaId).match(/\d+/);
                const filterNum = filterNumMatch ? parseInt(filterNumMatch[0], 10) : null;
                const filterStr = String(targetBolinmaId).toLowerCase().trim();

                const depts = [e.bolinma, e.bolinmaId, e.department_id, e.department];
                return depts.some(d => {
                    if (!d) return false;
                    const dStr = String(d).toLowerCase().trim();
                    const dNumMatch = String(d).match(/\d+/);
                    const dNum = dNumMatch ? parseInt(dNumMatch[0], 10) : null;
                    
                    if (dStr === filterStr) return true;
                    if (filterNum && dNum === filterNum) return true;
                    return false;
                });
            });

            // Fetch today's attendance from timesheet
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth(); // 0-indexed
            const day = today.getDate();
            
            // Fetch timesheet for this month to see today's status
            const timesheetData = await SmartUtils.fetchAPI(`/timesheet/${year}/${month}?bolinma_id=${targetBolinmaId}`);
            if (timesheetData) {
                this.employees.forEach(emp => {
                    const key = `${emp.id}_${day}`;
                    this.attendance[emp.id] = !!timesheetData[key];
                });
            }

            this.render(targetBolinmaId);
        } catch (e) {
            console.error('StaffAttendance init error:', e);
        }
    },

    render: function(bolinmaId) {
        const container = document.getElementById('staff-attendance-widget-container');
        if (!container) return;

        if (this.employees.length === 0) {
            container.innerHTML = `
                <div class="smart-card" style="text-align: center; padding: 30px; border-color: rgba(255,255,255,0.1);">
                    <i class="fas fa-users-slash" style="font-size: 2rem; color: rgba(255,255,255,0.2); margin-bottom: 10px;"></i>
                    <p style="color: rgba(255,255,255,0.5);">Bu bo'linmada xodimlar topilmadi.</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="smart-card" style="border: 1.5px solid rgba(212, 175, 55, 0.3); background: rgba(30, 41, 59, 0.5); padding: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(212, 175, 55, 0.1); padding-bottom: 15px;">
                    <h3 style="margin: 0; color: #ffd700; font-weight: 850; text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);">
                        <i class="fas fa-users-viewfinder"></i> Xodimlar va Face ID Davomat
                    </h3>
                    <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 600; background: rgba(212, 175, 55, 0.05); padding: 4px 12px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.1);">
                        Bugun: ${new Date().toLocaleDateString()}
                    </div>
                </div>

                <div class="staff-list-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                    ${this.employees.map(emp => this.renderEmployeeCard(emp)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    renderEmployeeCard: function(emp) {
        const isCheckedIn = this.attendance[emp.id];
        const hasFace = !!emp.faceTemplate;
        
        return `
            <div class="staff-attendance-card" style="background: rgba(15, 23, 42, 0.6); border: 1px solid ${isCheckedIn ? 'rgba(46, 204, 113, 0.4)' : 'rgba(255, 255, 255, 0.05)'}; border-radius: 16px; padding: 15px; display: flex; align-items: center; gap: 15px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); hover: transform: translateY(-3px);box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                <div class="staff-avatar" style="width: 50px; height: 50px; border-radius: 14px; background: ${isCheckedIn ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #475569, #1e293b)'}; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; border: 1.5px solid ${isCheckedIn ? '#10b981' : 'rgba(255,255,255,0.1)'}; box-shadow: ${isCheckedIn ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none'};">
                    ${emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div style="flex: 1; overflow: hidden;">
                    <div style="font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.95rem;">${escapeHtml(emp.name)}</div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">${escapeHtml(emp.position)}</div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                        ${hasFace ? 
                            `<span style="font-size: 0.65rem; color: #ffd700; background: rgba(212, 175, 55, 0.1); padding: 2px 8px; border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.2); font-weight: 800;"><i class="fas fa-face-smile"></i> FACE O'RNATILGAN</span>` : 
                            `<span style="font-size: 0.65rem; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 2px 8px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); font-weight: 800;"><i class="fas fa-face-meh"></i> FACE YO'Q</span>`
                        }
                    </div>
                </div>
                <div style="display: flex; flex-direction: row; gap: 8px;">
                    ${isCheckedIn ? 
                        `<div style="color: #10b981; font-size: 1.2rem; min-width: 40px; text-align: center;" title="Bugun ishda"><i class="fas fa-check-circle"></i></div>` : 
                        `
                        ${hasFace ? `
                            <button onclick="StaffAttendance.startFingerprint(${emp.id}, ${!!emp.fingerprintTemplate})" class="btn-attendance" style="background: ${emp.fingerprintTemplate ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #f59e0b, #d97706)'}; border: 1px solid ${emp.fingerprintTemplate ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255,255,255,0.2)'}; color: ${emp.fingerprintTemplate ? '#ffd700' : 'white'}; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="${emp.fingerprintTemplate ? 'Barmoq izi orqali (ZKTeco)' : 'Barmoq izini biriktirish'}">
                                <i class="fas fa-fingerprint"></i>
                            </button>
                        ` : ''}
                        <button onclick="StaffAttendance.handleAction(${emp.id}, ${hasFace})" class="btn-attendance" style="background: ${hasFace ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #d4af37, #b4941f)'}; border: none; color: white; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="${hasFace ? 'Face ID orqali' : 'Yuzni biriktirish'}">
                            <i class="fas ${hasFace ? 'fa-id-card' : 'fa-plus-circle'}"></i>
                        </button>
                        `
                    }
                </div>
            </div>
        `;
    },

    handleAction: function(empId, hasFace) {
        if (hasFace) {
            this.startCheckIn(empId);
        } else {
            this.startRegistration(empId);
        }
    },

    startCheckIn: function(empId) {
        if (window.FaceIDAttendance) {
            window.FaceIDAttendance.openScanner(empId);
        } else {
            alert('Face ID moduli yuklanmagan!');
        }
    },

    startRegistration: function(empId) {
        if (window.FaceIDAttendance) {
            window.FaceIDAttendance.openScanner(empId, true); // true = Registration mode
        } else {
            alert('Face ID moduli yuklanmagan!');
        }
    },

    startFingerprint: function(empId, hasTemplate) {
        const worker = this.employees.find(e => e.id === empId);
        if (worker && window.FaceIDAttendance) {
            window.FaceIDAttendance.showZKTecoScanner(worker, !hasTemplate);
        } else {
            alert('Biometrik modul yuklanmagan!');
        }
    },

    openWidget: function() {
        if (typeof window.openHRDepartmentWindow === 'function') {
            window.openHRDepartmentWindow();
            if (typeof window.navigateToHRModule === 'function') {
                window.navigateToHRModule('attendance');
            }
        }
    }
};

window.renderStaffAttendanceWidget = (bolinmaId) => StaffAttendance.init(bolinmaId);
