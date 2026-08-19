// Open HR Department Homepage Window
window.openHRDepartmentWindow = function () {
    // Create modal
    let modal = document.getElementById('hr-dept-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hr-dept-modal';
        modal.className = 'department-window';
        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #38bdf8; padding: 15px 30px;">
                <h2 class="department-name" style="color: #f8fafc; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-users-cog" style="color: #38bdf8; filter: drop-shadow(0 0 5px rgba(56,189,248,0.5));"></i> XODIMLAR VA BOSHQARUV PANELI
                </h2>
                <button class="close-btn" onclick="closeHRDepartmentWindow()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="window-content" id="hr-dept-content" style="background: radial-gradient(circle at top left, #0f172a, #020617);"></div>
        `;
        document.body.appendChild(modal);
    }

    // Render content
    document.getElementById('hr-dept-content').innerHTML = renderHRMainPortal();

    // Show modal
    modal.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');

    // Initialize charts after DOM is ready
    setTimeout(async () => {
        if (typeof initHRCharts === 'function') {
            initHRCharts();
        }
        const archiveContainer = document.getElementById('timesheet-archive-container');
        if (archiveContainer) {
            archiveContainer.innerHTML = await renderTimesheetArchiveWidget();
        }
    }, 100);
};

// Close HR Department Window
window.closeHRDepartmentWindow = function () {
    const modal = document.getElementById('hr-dept-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    const overlay = document.getElementById('department-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

// Initialize global HR data
window.hrData = window.hrData || { employees: [], attendance: {}, nextId: 1 };
let isHRDataLoading = false;
let hrDataInitPromise = null;

window.initHRData = async function () {
    if (window.hrData.employees && window.hrData.employees.length > 0 && !isHRDataLoading) {
        return window.hrData;
    }

    if (isHRDataLoading) {
        return hrDataInitPromise;
    }

    isHRDataLoading = true;
    hrDataInitPromise = (async () => {
        try {
            const employees = await SmartUtils.fetchAPI('/hr/employees');
            if (employees) {
                window.hrData.employees = employees.map(emp => ({
                    ...emp,
                    name: emp.full_name || emp.name,
                    full_name: emp.full_name || emp.name,
                    role: emp.position || emp.role,
                    position: emp.position || emp.role,
                    department: emp.bolinma_id || emp.department_id,
                    bolinma: emp.bolinma_id || emp.department_id,
                    bolinmaId: emp.bolinma_id || emp.department_id,
                    tabelNumber: emp.tabel_number || emp.tabelNumber,
                    birthday: emp.birth_date || emp.birthday,
                    hireDate: emp.hired_date || emp.hireDate,
                    medicalDate: emp.medical_checkup_date || emp.medicalDate,
                    medicalCheckupDate: emp.medical_checkup_date || emp.medicalDate,
                    faceTemplate: emp.face_template
                }));

                console.log('✅ HR ma\'lumotlari serverdan yuklandi');
            } else {
                window.hrData = { employees: [], attendance: {}, nextId: 1 };
            }

            // Attendance data simulation if not exists
            if (window.hrData && !window.hrData.attendance) {
                const attendance = {};
                const today = new Date();
                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

                for (let i = 1; i <= daysInMonth; i++) {
                    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    const present = Math.floor(Math.random() * 3) + 6;
                    attendance[date] = { present: present, absent: 8 - present, leave: 0 };
                }
                window.hrData.attendance = attendance;
            }
        } catch (e) {
            console.error('HR ma\'lumotlarini serverdan yuklashda xatolik:', e);
            if (!window.hrData) window.hrData = { employees: [], attendance: {}, nextId: 1 };
        } finally {
            isHRDataLoading = false;
        }
        return window.hrData;
    })();

    return hrDataInitPromise;
}

// Helper: extracts the numeric part from any subdivision ID format
function extractBolinmaNum(val) {
    if (!val) return null;
    const m = String(val).match(/\d+/);
    return m ? m[0] : null;
}

// Helper to get robust user subdivision info
function checkHRSubdivisionUser() {
    let currentUser = window.Auth?.currentUser || window.currentUser;
    if (!currentUser) {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            try {
                currentUser = JSON.parse(saved);
            } catch (e) {}
        }
    }
    
    let isSubdivisionUser = false;
    let userBolinmalar = [];
    let userBolinma = 'all';
    
    if (currentUser) {
        const role = String(currentUser.role).toLowerCase();
        const username = String(currentUser.username || '').toLowerCase();
        
        // Admin ALWAYS sees everything - never restrict
        if (role === 'admin') {
            console.log('[HR-CHECK] Admin foydalanuvchi - cheklovsiz');
            return { isSubdivisionUser: false, userBolinmalar: [], userBolinma: 'all' };
        }
        
        let rawBolinma = null;
        
        // 1. Fallback to username pattern FIRST (most reliable, works even if bolinmalar is empty in DB)
        if (username.includes('bolinma') || username.includes("bo'linma")) {
            const numMatch = username.match(/\d+/);
            if (numMatch) {
                rawBolinma = `${numMatch[0]}-bo'linma`;
                isSubdivisionUser = true;
                console.log('[HR-CHECK] Username orqali aniqlandi:', username, '->', rawBolinma);
            }
        }
        
        // 2. Check if user has explicit bolinmalar array (overrides username if found)
        if (!isSubdivisionUser && currentUser.bolinmalar && currentUser.bolinmalar.length > 0) {
            rawBolinma = currentUser.bolinmalar[0];
            userBolinmalar = currentUser.bolinmalar;
            isSubdivisionUser = true;
            console.log('[HR-CHECK] Bolinmalar massividan aniqlandi:', rawBolinma);
        } 
        // 3. Check if user has bolinma_id property
        else if (!isSubdivisionUser && currentUser.bolinma_id && currentUser.bolinma_id !== 'all') {
            rawBolinma = currentUser.bolinma_id;
            isSubdivisionUser = true;
            console.log('[HR-CHECK] bolinma_id dan aniqlandi:', rawBolinma);
        }
        
        // Populate full list and standard name if identified as subdivision user
        if (isSubdivisionUser && rawBolinma) {
            const numMatch = String(rawBolinma).match(/\d+/);
            if (numMatch) {
                const num = numMatch[0];
                userBolinma = `${num}-bo'linma`;
                userBolinmalar = [userBolinma, `bolinma${num}`, num];
            } else {
                userBolinma = String(rawBolinma);
                userBolinmalar = [userBolinma];
            }
        }
        
        // 4. Force check for roles that are inherently subdivision roles
        if (!isSubdivisionUser && (role === 'bolinma' || role === 'subdivision')) {
            isSubdivisionUser = true;
            const numMatch = username.match(/\d+/);
            const num = numMatch ? numMatch[0] : '1';
            userBolinma = `${num}-bo'linma`;
            userBolinmalar = [userBolinma, `bolinma${num}`, num];
        }
        
        console.log('[HR-CHECK] Natija:', { isSubdivisionUser, userBolinma, userBolinmalar, role, username });
    }
    
    return { isSubdivisionUser, userBolinmalar, userBolinma };
}

// Helper to get filtered employees list
function getEmployeesList(deptId = 'all') {
    if (!window.hrData || !window.hrData.employees) return [];
    
    const { isSubdivisionUser, userBolinmalar } = checkHRSubdivisionUser();
    
    let employees = window.hrData.employees;
    if (isSubdivisionUser) {
        // Get the user's bolinma number as integer for strict comparison
        const userNums = userBolinmalar.map(b => {
            const m = String(b).match(/\d+/);
            return m ? parseInt(m[0], 10) : null;
        }).filter(n => n !== null);
        
        const userNum = userNums.length > 0 ? userNums[0] : null;
        
        console.log('[HR-FILTER] Bo\'linma filtrlash:', { userNum, userBolinmalar, totalEmployees: employees.length });
        
        if (userNum !== null) {
            employees = employees.filter(emp => {
                const empDept = String(emp.department || emp.bolinma || emp.bolinmaId || '').trim();
                const empNumMatch = empDept.match(/\d+/);
                const empNum = empNumMatch ? parseInt(empNumMatch[0], 10) : null;
                // Strict integer comparison: 1 !== 11, 1 !== 12, etc.
                return empNum === userNum;
            });
        }
        
        console.log('[HR-FILTER] Filtrlangan xodimlar soni:', employees.length);
    }

    const isAll = !deptId || deptId === 'all' || deptId === '' || deptId === 'undefined' || deptId === 'xodimlar';
    if (isAll) return employees;

    const filterNumMatch = String(deptId).match(/\d+/);
    const filterNum = filterNumMatch ? parseInt(filterNumMatch[0], 10) : null;
    const filterStr = String(deptId).toLowerCase().trim();

    return employees.filter(emp => {
        const depts = [emp.department, emp.bolinma, emp.bolinmaId, emp.bolinma_id];
        return depts.some(d => {
            if (!d) return false;
            const dStr = String(d).toLowerCase().trim();
            const dNumMatch = String(d).match(/\d+/);
            const dNum = dNumMatch ? parseInt(dNumMatch[0], 10) : null;
            // Match by integer number (strict: 1 !== 11)
            if (filterNum !== null && dNum !== null && filterNum === dNum) return true;
            // Match by exact full string
            if (dStr === filterStr) return true;
            return false;
        });
    });
}

// Global filter function for HR portal
window.filterEmployees = function() {
    const searchInput = document.getElementById('hr-portal-search');
    const deptSelect = document.getElementById('hr-portal-dept-select');
    const searchVal = searchInput ? searchInput.value : '';
    const deptVal = deptSelect ? deptSelect.value : 'all';
    
    const tableBody = document.getElementById('hr-portal-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = renderPremiumTableRows(searchVal, deptVal);
};


function getHRStats(deptId = 'all') {
    if (!window.hrData || !window.hrData.employees) {
        return {
            totalEmployees: 0,
            newThisMonth: 0,
            attendance: { percent: 0, present: 0, total: 0 },
            birthdaysThisWeek: 0,
            birthdayEmployees: [],
            trainingAlerts: 0,
            alertEmployees: []
        };
    }
    // Use shared filtering logic so all formats match correctly
    let employees = getEmployeesList(deptId);
    const today = new Date();
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Today's attendance
    if (!window.hrData || !window.hrData.employees) {
        return {
            totalEmployees: 0,
            newThisMonth: 0,
            attendance: { percent: 0, present: 0, total: 0 },
            birthdaysThisWeek: 0,
            birthdayEmployees: [],
            trainingAlerts: 0,
            alertEmployees: []
        };
    }
    const todayKey = today.toISOString().split('T')[0];
    const todayAttendance = (window.hrData.attendance && window.hrData.attendance[todayKey]) || { present: 0, absent: 0 };
    const attendancePercent = employees.length > 0 ? Math.round((todayAttendance.present / employees.length) * 100) : 0;

    // Birthdays this week
    const birthdaysThisWeek = employees.filter(emp => {
        if (!emp.birthday) return false;
        const bday = new Date(emp.birthday);
        const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        return thisYearBday >= today && thisYearBday <= thisWeek;
    });

    // New employees this month
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const newThisMonth = employees.filter(emp => {
        if (!emp.hireDate) return false;
        const hireDate = new Date(emp.hireDate);
        return hireDate.getMonth() === thisMonth && hireDate.getFullYear() === thisYear;
    }).length;

    // Training alerts
    const fifteenDays = 15 * 24 * 60 * 60 * 1000;
    const trainingAlerts = employees.filter(emp => {
        if (!emp.medicalCheckupDate) return true;
        const medicalDate = new Date(emp.medicalCheckupDate);
        return medicalDate < new Date(today.getTime() + fifteenDays);
    });

    return {
        totalEmployees: employees.length,
        newThisMonth: newThisMonth,
        attendance: {
            percent: attendancePercent,
            present: todayAttendance.present,
            total: employees.length
        },
        birthdaysThisWeek: birthdaysThisWeek.length,
        birthdayEmployees: birthdaysThisWeek,
        trainingAlerts: trainingAlerts.length,
        alertEmployees: trainingAlerts
    };
}

// Get department distribution for pie chart
function getDepartmentDistribution() {
    if (!window.hrData || !window.hrData.employees) return {};
    const departments = {};

    getEmployeesList().forEach(emp => {
        departments[emp.department] = (departments[emp.department] || 0) + 1;
    });

    return departments;
}

// HR Main Portal (Ultra-Clean Premium Version)
function renderHRMainPortal(deptId = 'all') {
    const { isSubdivisionUser, userBolinma } = checkHRSubdivisionUser();
    let targetDeptId = deptId;
    if (isSubdivisionUser && userBolinma) {
        targetDeptId = userBolinma;
    }
    const stats = getHRStats(targetDeptId);
    window.hrCurrentDeptId = targetDeptId;
    
    return `
        <style>
            .hr-premium-container {
                padding: 30px;
                background: radial-gradient(circle at top right, rgba(30, 41, 59, 0.7), transparent), 
                            radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.8), #020617);
                min-height: 100%;
                color: #f8fafc;
                font-family: 'Inter', sans-serif;
            }

            /* --- HERO HUB SECTION --- */
            .hr-hub-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }

            .hr-hub-card {
                position: relative;
                padding: 25px;
                border-radius: 24px;
                background: rgba(30, 41, 59, 0.4);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }

            .hr-hub-card:hover {
                transform: translateY(-10px) scale(1.03);
                border-color: var(--card-accent);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px var(--card-glow);
            }

            .hr-hub-card::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, var(--card-accent) 0%, transparent 60%);
                opacity: 0.05;
                transition: 0.5s;
            }

            .hr-hub-card:hover::before {
                opacity: 0.15;
            }

            .hr-hub-icon {
                width: 65px;
                height: 65px;
                background: var(--card-gradient);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                color: white;
                margin-bottom: 15px;
                box-shadow: 0 8px 20px var(--card-glow);
                transition: 0.4s;
            }

            .hr-hub-card:hover .hr-hub-icon {
                transform: rotate(10deg) scale(1.1);
            }

            .hr-hub-title {
                font-size: 1.1rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 0;
            }

            .hr-hub-desc {
                font-size: 0.75rem;
                color: rgba(248, 250, 252, 0.5);
                margin-top: 5px;
            }

            /* --- STATS SECTION --- */
            .hr-stats-banner {
                display: flex;
                gap: 20px;
                margin-bottom: 40px;
                flex-wrap: wrap;
            }

            .hr-stat-mini {
                flex: 1;
                min-width: 200px;
                background: rgba(30, 41, 59, 0.3);
                border-radius: 20px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .hr-stat-mini-icon {
                font-size: 1.5rem;
                color: var(--stat-color);
            }

            .hr-stat-mini-info h4 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 800;
            }

            .hr-stat-mini-info p {
                margin: 0;
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.4);
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* --- TABLE SECTION --- */
            .hr-table-wrap {
                background: rgba(15, 23, 42, 0.5);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 15px 45px rgba(0,0,0,0.3);
            }

            /* --- ANIMATIONS --- */
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .anim-fade-up { animation: fadeInUp 0.6s ease-out both; }
        </style>

        <div class="hr-premium-container">
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px;" class="anim-fade-up">
                <div>
                    <h1 style="margin: 0; font-size: 2.2rem; font-weight: 900; background: var(--gold-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Xodimlar Boshqaruvi</h1>
                    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.4); font-weight: 600; letter-spacing: 1px;">PERSONNEL MANAGEMENT SYSTEM v2.0</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.8rem; color: #ffd700; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Bugungi Sana</div>
    return {
        totalEmployees: employees.length,
        newThisMonth: newThisMonth,
        attendance: {
            percent: attendancePercent,
            present: todayAttendance.present,
            total: employees.length
        },
        birthdaysThisWeek: birthdaysThisWeek.length,
        birthdayEmployees: birthdaysThisWeek,
        trainingAlerts: trainingAlerts.length,
        alertEmployees: trainingAlerts
    };
}

// Get department distribution for pie chart
function getDepartmentDistribution() {
    if (!window.hrData || !window.hrData.employees) return {};
    const departments = {};

    getEmployeesList().forEach(emp => {
        departments[emp.department] = (departments[emp.department] || 0) + 1;
    });

    return departments;
}

// HR Main Portal (Ultra-Clean Premium Version)
function renderHRMainPortal(deptId = 'all') {
    const { isSubdivisionUser, userBolinma } = checkHRSubdivisionUser();
    let targetDeptId = deptId;
    if (isSubdivisionUser && userBolinma) {
        targetDeptId = userBolinma;
    }
    const stats = getHRStats(targetDeptId);
    window.hrCurrentDeptId = targetDeptId;
    
    return `
        <style>
            .hr-premium-container {
                padding: 30px;
                background: radial-gradient(circle at top right, rgba(30, 41, 59, 0.7), transparent), 
                            radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.8), #020617);
                min-height: 100%;
                color: #f8fafc;
                font-family: 'Inter', sans-serif;
            }

            /* --- HERO HUB SECTION --- */
            .hr-hub-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }

            .hr-hub-card {
                position: relative;
                padding: 25px;
                border-radius: 24px;
                background: rgba(30, 41, 59, 0.4);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }

            .hr-hub-card:hover {
                transform: translateY(-10px) scale(1.03);
                border-color: var(--card-accent);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px var(--card-glow);
            }

            .hr-hub-card::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, var(--card-accent) 0%, transparent 60%);
                opacity: 0.05;
                transition: 0.5s;
            }

            .hr-hub-card:hover::before {
                opacity: 0.15;
            }

            .hr-hub-icon {
                width: 65px;
                height: 65px;
                background: var(--card-gradient);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                color: white;
                margin-bottom: 15px;
                box-shadow: 0 8px 20px var(--card-glow);
                transition: 0.4s;
            }

            .hr-hub-card:hover .hr-hub-icon {
                transform: rotate(10deg) scale(1.1);
            }

            .hr-hub-title {
                font-size: 1.1rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 0;
            }

            .hr-hub-desc {
                font-size: 0.75rem;
                color: rgba(248, 250, 252, 0.5);
                margin-top: 5px;
            }

            /* --- STATS SECTION --- */
            .hr-stats-banner {
                display: flex;
                gap: 20px;
                margin-bottom: 40px;
                flex-wrap: wrap;
            }

            .hr-stat-mini {
                flex: 1;
                min-width: 200px;
                background: rgba(30, 41, 59, 0.3);
                border-radius: 20px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .hr-stat-mini-icon {
                font-size: 1.5rem;
                color: var(--stat-color);
            }

            .hr-stat-mini-info h4 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 800;
            }

            .hr-stat-mini-info p {
                margin: 0;
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.4);
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* --- TABLE SECTION --- */
            .hr-table-wrap {
                background: rgba(15, 23, 42, 0.5);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 15px 45px rgba(0,0,0,0.3);
            }

            /* --- ANIMATIONS --- */
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .anim-fade-up { animation: fadeInUp 0.6s ease-out both; }
        </style>

        <div class="hr-premium-container">
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px;" class="anim-fade-up">
                <div>
                    <h1 style="margin: 0; font-size: 2.2rem; font-weight: 900; background: var(--gold-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Xodimlar Boshqaruvi</h1>
                    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.4); font-weight: 600; letter-spacing: 1px;">PERSONNEL MANAGEMENT SYSTEM v2.0</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.8rem; color: #ffd700; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Bugungi Sana</div>
                    <div style="font-size: 1.2rem; font-weight: 700;">${new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
            </div>

            <!-- HUB SECTION: The 5 Requested Buttons -->
            <div class="hr-hub-grid">
                <!-- 1. TABEL -->
                <div class="hr-hub-card anim-fade-up" style="--card-accent: #38bdf8; --card-glow: rgba(56, 189, 248, 0.3); --card-gradient: linear-gradient(135deg, #0ea5e9, #38bdf8); animation-delay: 0.1s;" onclick="if(window.openTimesheet) window.openTimesheet(window.hrCurrentDeptId || 'all'); else SmartUtils.showToast('Tabel moduli yuklanmoqda...', 'info')">
                    <div class="hr-hub-icon"><i class="fas fa-table-list"></i></div>
                    <h3 class="hr-hub-title">Tabel</h3>
                    <p class="hr-hub-desc">Elektron ish vaqti hisobi (Jadval)</p>
                </div>

                <!-- 2. MUROJAAT -->
                <div class="hr-hub-card anim-fade-up" style="--card-accent: #f59e0b; --card-glow: rgba(245, 158, 11, 0.3); --card-gradient: linear-gradient(135deg, #d97706, #f59e0b); animation-delay: 0.2s;" onclick="navigateToHRModule('murojaat')">
                    <div class="hr-hub-icon"><i class="fas fa-paper-plane"></i></div>
                    <h3 class="hr-hub-title">Murojaat</h3>
                    <p class="hr-hub-desc">Ariza va bildirishnomalar yuborish</p>
                </div>

                <!-- 3. ARXIV -->
                <div class="hr-hub-card anim-fade-up" style="--card-accent: #10b981; --card-glow: rgba(16, 185, 129, 0.3); --card-gradient: linear-gradient(135deg, #059669, #10b981); animation-delay: 0.3s;" onclick="navigateToHRModule('archive')">
                    <div class="hr-hub-icon"><i class="fas fa-box-archive"></i></div>
                    <h3 class="hr-hub-title">Arxiv</h3>
                    <p class="hr-hub-desc">Hujjatlar va ma'lumotlar ombori</p>
                </div>

                <!-- 4. DAVOMAT -->
                <div class="hr-hub-card anim-fade-up" style="--card-accent: #6366f1; --card-glow: rgba(99, 102, 241, 0.3); --card-gradient: linear-gradient(135deg, #4f46e5, #6366f1); animation-delay: 0.4s;" onclick="navigateToHRModule('attendance')">
                    <div class="hr-hub-icon"><i class="fas fa-fingerprint"></i></div>
                    <h3 class="hr-hub-title">Davomat</h3>
                    <p class="hr-hub-desc">Face ID va onlayn monitoring</p>
                </div>

                <!-- 5. XODIMLAR RO'YXATI -->
                <div class="hr-hub-card anim-fade-up" style="--card-accent: #ffd700; --card-glow: rgba(212, 175, 55, 0.3); --card-gradient: var(--gold-gradient); animation-delay: 0.5s;" onclick="window.openEmployeesListModal()">
                    <div class="hr-hub-icon" style="color: #000;"><i class="fas fa-users"></i></div>
                    <h3 class="hr-hub-title">Xodimlar</h3>
                    <p class="hr-hub-desc">Barcha xodimlar ma'lumotlar bazasi</p>
                </div>
            </div>

            <!-- Stats Banner -->
            <div class="hr-stats-banner anim-fade-up" style="animation-delay: 0.6s;">
                <div class="hr-stat-mini" style="--stat-color: #38bdf8;">
                    <div class="hr-stat-mini-icon"><i class="fas fa-user-group"></i></div>
                    <div class="hr-stat-mini-info">
                        <h4>${stats.totalEmployees}</h4>
                        <p>Umumiy Shtat</p>
                    </div>
                </div>
                <div class="hr-stat-mini" style="--stat-color: #10b981;">
                    <div class="hr-stat-mini-icon"><i class="fas fa-user-check"></i></div>
                    <div class="hr-stat-mini-info">
                        <h4>${stats.attendance.percent}%</h4>
                        <p>Bugungi Davomat</p>
                    </div>
                </div>
                <div class="hr-stat-mini" style="--stat-color: #f59e0b;">
                    <div class="hr-stat-mini-icon"><i class="fas fa-cake-candles"></i></div>
                    <div class="hr-stat-mini-info">
                        <h4>${stats.birthdaysThisWeek}</h4>
                        <p>Tug'ilgan Kunlar</p>
                    </div>
                </div>
            </div>

            <!-- Grid for extra widgets -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; margin-top: 40px;" class="anim-fade-up" style="animation-delay: 0.8s;">
                <div class="hr-table-wrap">
                    <h3 style="margin-top: 0; color: #38bdf8;"><i class="fas fa-chart-line"></i> Davomat Dinamikasi</h3>
                    <canvas id="attendance-chart" height="200"></canvas>
                </div>
                <div class="hr-table-wrap">
                    <h3 style="margin-top: 0; color: #ffd700;"><i class="fas fa-chart-pie"></i> Bo'limlar Ulushi</h3>
                    <canvas id="dept-chart" height="200"></canvas>
                </div>
            </div>
        </div>
    `;
}

// Helper to render high-end table rows
function renderPremiumTableRows(filter = '', dept = 'all') {
    const list = getEmployeesList(dept);
    const filtered = list.filter(e => 
        (e.name.toLowerCase().includes(filter.toLowerCase()) || 
         e.role.toLowerCase().includes(filter.toLowerCase()))
    );

    if (filtered.length === 0) {
        return `<tr><td colspan="5" style="text-align: center; padding: 50px; color: rgba(255,255,255,0.2);">Ma'lumot topilmadi</td></tr>`;
    }

    return filtered.map(e => {
        const medicalDate = e.medicalCheckupDate || e.medicalDate;
        const isMedicalValid = medicalDate ? new Date(medicalDate) > new Date() : false;
        const status = e.status || 'active';
        const statusText = status === 'active' || status === 'ishda' ? 'Ishda' : (status === 'leave' ? 'Ta\'tilda' : 'Yo\'q');
        const statusClass = status === 'active' || status === 'ishda' ? 'active' : 'absent';

        return `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(56, 189, 248, 0.1); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 1px solid rgba(56, 189, 248, 0.2);">
                        ${e.name ? e.name.charAt(0) : 'X'}
                    </div>
                    <div>
                        <div style="font-weight: 700; color: white;">${e.name || 'Noma\'lum'} ${e.is_head ? '<i class="fas fa-crown" style="color:#ffd700; font-size:0.7rem;"></i>' : ''}</div>
                        <div style="font-size: 0.7rem; color: rgba(255,255,255,0.4);">№ ${e.tabelNumber || e.id || '---'}</div>
                    </div>
                </div>
            </td>
            <td>
                <div style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">${e.role || e.position || 'Xodim'}</div>
                <div style="font-size: 0.7rem; color: #38bdf8; font-weight: 600;">${e.bolinma || 'Asosiy'}</div>
            </td>
            <td>
                <span class="status-tag ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div style="font-size: 0.85rem; color: ${isMedicalValid ? '#10b981' : '#f43f5e'};">
                    <i class="fas ${isMedicalValid ? 'fa-check-circle' : 'fa-triangle-exclamation'}"></i> 
                    ${medicalDate ? new Date(medicalDate).toLocaleDateString() : 'Belgilanmagan'}
                </div>
                <div style="font-size: 0.65rem; color: rgba(255,255,255,0.3);">Tibbiy ko'rik holati</div>
            </td>
            <td>
                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="premium-nav-btn" style="padding: 8px 12px; background: rgba(56, 189, 248, 0.1); color: #38bdf8;" onclick="window.viewEmployeeProfile('${e.id}')" title="Profil">
                        <i class="fas fa-id-card"></i>
                    </button>
                    <button class="premium-nav-btn" style="padding: 8px 12px; background: rgba(212, 175, 55, 0.1); color: #ffd700;" onclick="window.editEmployee('${e.id}')" title="Tahrirlash">
                        <i class="fas fa-user-pen"></i>
                    </button>
                </div>
            </td>
        </tr>
    `; }).join('');
}

// Navigation between HR modules
window.navigateToHRModule = function(moduleName) {
    const content = document.getElementById('hr-dept-content');
    if (!content) return;

    // Add back button for sub-modules
    const renderWithBack = (html) => `
        <div style="position: relative; padding-top: 50px;">
            <button class="portal-back-btn" onclick="document.getElementById('hr-dept-content').innerHTML = renderHRMainPortal()">
                <i class="fas fa-arrow-left"></i> Bosh sahifaga qaytish
            </button>
            ${html}
        </div>
    `;

    switch(moduleName) {
        case 'dashboard':
            content.innerHTML = renderHRMainPortal();
            setTimeout(() => initHRCharts(), 100);
            break;
        case 'attendance':
            content.innerHTML = renderWithBack(`
                <div style="padding: 30px; text-align: center;">
                    <h2 style="color: #8b5cf6; margin-bottom: 25px;"><i class="fas fa-fingerprint"></i> Davomat Monitori</h2>
                    <div id="staff-attendance-widget-container"></div>
                </div>
            `);
            if (typeof window.renderStaffAttendanceWidget === 'function') {
                window.renderStaffAttendanceWidget(window.hrCurrentDeptId || 'all');
            }
            break;
        case 'timesheet':
            // Tabel o'zining to'liq ekran modalini chiqaradi
            if (typeof window.openTimesheet === 'function') {
                window.openTimesheet(window.hrCurrentDeptId || 'all');
            } else {
                SmartUtils.showToast('Tabel moduli yuklanmagan!', 'warning');
            }
            break;
        case 'murojaat':
            // Murojaat modalni bevosita ochish
            if (typeof openHRMurojaatWindow === 'function') {
                openHRMurojaatWindow();
            }
            break;
        case 'safety':
            // Logic for safety
            content.innerHTML = renderWithBack(`
                <div style="padding: 30px; text-align: center;">
                    <h2 style="color: #f43f5e;"><i class="fas fa-shield-heart"></i> Xavfsizlik va Texnik O'quv</h2>
                    <p>Ushbu bo'limda TNU-19 va TNU-20 jurnallari boshqariladi.</p>
                    <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
                        <button onclick="if(typeof openSafetyTNU19 === 'function') openSafetyTNU19('all')" class="premium-btn" style="background: #e11d48">TNU-19 Jurnal</button>
                        <button onclick="if(typeof openTechnicalTrainingModule === 'function') openTechnicalTrainingModule()" class="premium-btn" style="background: #f59e0b">Texnik O'quv</button>
                    </div>
                </div>
            `);
            break;
        case 'biometrics':
            // Logic for biometrics
            content.innerHTML = renderWithBack(`
                <div style="padding: 30px; text-align: center;">
                    <h2 style="color: #6366f1;"><i class="fas fa-id-card-clip"></i> Biometrika Boshqaruvi</h2>
                    <div id="biometrics-container"></div>
                </div>
            `);
            SmartUtils.showToast("Biometrika boshqaruv paneli ochilmoqda...", "info");
            break;
        case 'analytics':
            // Show only charts
            content.innerHTML = renderWithBack(`
                <div class="charts-grid" style="grid-template-columns: 1fr 1fr; padding: 20px;">
                    <div class="chart-container" style="height: 400px;">
                        <h3 class="widget-title"><i class="fas fa-chart-pie"></i> Bo'limlar Bo'yicha</h3>
                        <canvas id="dept-chart-full"></canvas>
                    </div>
                    <div class="chart-container" style="height: 400px;">
                        <h3 class="widget-title"><i class="fas fa-chart-line"></i> Davomat Dinamikasi</h3>
                        <canvas id="attendance-chart-full"></canvas>
                    </div>
                </div>
            `);
            // Custom init for full charts
            setTimeout(() => {
                 // Clone chart logic here for full view
                 initHRCharts(); 
                 // Adjust chart IDs if needed or use existing
            }, 100);
            break;
        case 'archive':
            content.innerHTML = renderWithBack(`
                <div id="archive-full-view" style="padding: 20px;">
                    <h2 style="color: white; margin-bottom: 20px;"><i class="fas fa-archive"></i> Hujjatlar Arxivi</h2>
                    <div id="timesheet-archive-full-container"></div>
                </div>
            `);
            setTimeout(async () => {
                const archiveContainer = document.getElementById('timesheet-archive-full-container');
                if (archiveContainer) archiveContainer.innerHTML = await renderTimesheetArchiveWidget();
            }, 100);
            break;
        default:
            content.innerHTML = renderHRDashboard();
    }
}

// Main HR Dashboard HTML
function renderHRDashboard(deptId = 'all') {
    (async () => {
        if (!window.hrData || !window.hrData.employees || window.hrData.employees.length === 0) {
            await initHRData();
            // Re-render only if data was actually missing
            const content = document.getElementById('hr-dept-content');
            if (content) content.innerHTML = renderHRDashboard(deptId);
        }
    })();
    const stats = getHRStats(deptId);
    if (!stats) {
        return `
            <div id="hr-dept-content" style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5);">
                <i class="fas fa-spinner fa-spin fa-2x"></i><br><br>
                HR ma'lumotlari yuklanmoqda...
            </div>
        `;
    }

    return `
        <style>
            .hr-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .hr-stat-card {
                background: rgba(15, 23, 42, 0.8);
                border: 2px solid rgba(0, 198, 255, 0.3);
                border-radius: 15px;
                padding: 20px;
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            .hr-stat-card:hover {
                transform: translateY(-5px);
                border-color: var(--accent-color);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
            }
            .hr-stat-card::after {
                content: '';
                position: absolute;
                top: -50px;
                right: -50px;
                width: 150px;
                height: 150px;
                background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
                opacity: 0.1;
                pointer-events: none;
            }
            .hr-stat-icon {
                font-size: 1.8rem;
                width: 54px;
                height: 54px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                margin-bottom: 15px;
                transition: transform 0.3s;
            }
            .hr-stat-card:hover .hr-stat-icon {
                transform: scale(1.1);
            }
            .hr-stat-label {
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.9rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .hr-stat-value {
                font-size: 2.2rem;
                font-weight: 800;
                color: white;
                margin: 10px 0;
            }
            .hr-stat-badge {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: bold;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                width: fit-content;
            }
            .hr-main-content {
                display: flex;
                flex-direction: column;
                gap: 25px;
                margin-bottom: 25px;
            }
            .employee-table-container {
                background: rgba(15, 23, 42, 0.7);
                border-radius: 24px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(15px);
                overflow-x: auto;
                width: 100%;
            }
            .employee-table {
                width: 100%;
                border-collapse: collapse;
                min-width: 900px;
            }
            .premium-row {
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .premium-row:hover {
                background: rgba(0, 198, 255, 0.03) !important;
                border-color: rgba(0, 198, 255, 0.2);
            }
            .biometric-pill {
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.7rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 6px;
                text-transform: uppercase;
            }
            .employee-table th {
                text-align: left;
                padding: 12px;
                border-bottom: 2px solid rgba(0,198,255,0.3);
                color: #00c6ff;
                font-weight: 600;
                white-space: nowrap;
            }
            .employee-table td {
                padding: 12px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                vertical-align: middle;
            }
            .no-wrap {
                white-space: nowrap;
            }
            .employee-table tr:hover {
                background: rgba(0,198,255,0.05);
            }
            .employee-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            .status-badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.85rem;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .status-active {
                background: rgba(46,204,113,0.2);
                color: #2ecc71;
            }
            .status-leave {
                background: rgba(241,196,15,0.2);
                color: #f1c40f;
            }
            .sidebar-widget {
                background: rgba(15, 23, 42, 0.8);
                border: 2px solid rgba(0, 198, 255, 0.3);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            }
            .widget-title {
                color: #00c6ff;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 1.1rem;
            }
            .birthday-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px;
                border-radius: 8px;
                background: rgba(255,255,255,0.05);
                margin-bottom: 10px;
            }
            .chart-container {
                background: rgba(15, 23, 42, 0.8);
                border: 2px solid rgba(0, 198, 255, 0.3);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            }
            .charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
                gap: 20px;
            }
            @media (max-width: 1400px) {
                .hr-main-content {
                    grid-template-columns: 1fr;
                }
                .hr-stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                }
            }
            @media (max-width: 768px) {
                .charts-grid {
                    grid-template-columns: 1fr;
                }
                .hr-stats-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
        
        <!-- Stats Cards -->
        <div class="hr-stats-grid">
            <!-- Total Employees -->
            <div class="hr-stat-card" style="--accent-color: #0088ff;">
                <div class="hr-stat-icon" style="background: linear-gradient(135deg, #0088ff, #00c6ff); color: white; box-shadow: 0 4px 15px rgba(0, 136, 255, 0.4);">
                    <i class="fas fa-users-viewfinder"></i>
                </div>
                <div>
                   <div class="hr-stat-label">Xodimlar tarkibi</div>
                   <div class="hr-stat-value">${stats.totalEmployees}</div>
                </div>
                <div class="hr-stat-badge" style="background: rgba(46,204,113,0.15); color: #2ecc71; border: 1px solid rgba(46,204,113,0.2);">
                    <i class="fas fa-arrow-up"></i> +${stats.newThisMonth} yangi
                </div>
            </div>
            
            <!-- Today's Attendance -->
            <div class="hr-stat-card" style="--accent-color: #00f2fe;">
                <div class="hr-stat-icon" style="background: linear-gradient(135deg, #00f2fe, #4facfe); color: white; box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);">
                    <i class="fas fa-fingerprint"></i>
                </div>
                <div>
                    <div class="hr-stat-label">Kunlik Davomat</div>
                    <div class="hr-stat-value">${stats.attendance.percent}%</div>
                </div>
                <div class="hr-stat-badge" style="background: rgba(0,198,255,0.15); color: #00c6ff; border: 1px solid rgba(0,198,255,0.2);">
                    <i class="fas fa-check-circle"></i> ${stats.attendance.present} ishda
                </div>
            </div>
            
            <!-- Birthdays -->
            <div class="hr-stat-card" style="--accent-color: #ff9a9e;">
                <div class="hr-stat-icon" style="background: linear-gradient(135deg, #ff9a9e, #fecfef); color: white; box-shadow: 0 4px 15px rgba(255, 154, 158, 0.4);">
                    <i class="fas fa-cake-candles"></i>
                </div>
                <div>
                    <div class="hr-stat-label">Tug'ilgan Kunlar</div>
                    <div class="hr-stat-value">${stats.birthdaysThisWeek}</div>
                </div>
                <div class="hr-stat-badge" style="background: rgba(243,156,18,0.15); color: #f39c12; border: 1px solid rgba(243,156,18,0.2);">
                    <i class="fas fa-calendar-day"></i> Hafta davomida
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="hr-stat-card" style="--accent-color: #a18cd1; justify-content: flex-start; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <div class="hr-stat-label" style="margin:0">Boshqaruv</div>
                    <div style="color: #a18cd1; font-size: 1.2rem;"><i class="fas fa-shield-halved"></i></div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="openExodimImportModal()" style="flex: 1; padding: 10px 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; border-radius: 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; transition: 0.2s; white-space: nowrap;">
                        <i class="fas fa-file-import"></i> Yuklash
                    </button>
                    <button onclick="openAddEmployeeModal()" style="flex: 1; padding: 10px 8px; background: rgba(155, 89, 182, 0.15); border: 1px solid rgba(155, 89, 182, 0.3); color: #9b59b6; border-radius: 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; transition: 0.2s; white-space: nowrap;">
                        <i class="fas fa-user-plus"></i> Qo'shish
                    </button>
                    <button onclick="openHRMurojaatWindow()" style="flex: 1; padding: 10px 8px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; border-radius: 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; transition: 0.2s; white-space: nowrap;">
                        <i class="fas fa-envelope-open-text"></i> Yozish
                    </button>
                    <button onclick="openHRMurojaatInboxModal()" style="flex: 1; padding: 10px 8px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; transition: 0.2s; white-space: nowrap;">
                        <i class="fas fa-inbox"></i> Inbox
                    </button>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:nowrap; margin-top:5px;">
                    <button onclick="if(window.openTimesheet) window.openTimesheet(window.hrCurrentDeptId || 'all')" style="flex:1; padding:10px; background:linear-gradient(135deg, #4481eb, #04befe); border:none; color:white; border-radius:10px; cursor:pointer; font-size:0.75rem; font-weight:bold; box-shadow:0 4px 15px rgba(68,129,235,0.3);"><i class="fas fa-table-list"></i> Tabel</button>
                    <button onclick="if(window.openTimesheet) window.openTimesheet(window.hrCurrentDeptId || 'all'); setTimeout(() => renderTimesheetMonitor(), 300);" style="flex:1; padding:10px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:white; border-radius:10px; cursor:pointer; font-size:0.75rem; font-weight:bold; box-shadow:0 4px 15px rgba(245,158,11,0.3);"><i class="fas fa-desktop"></i> Monitor</button>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="hr-main-content">
            <!-- Employee Table -->
            <div class="employee-table-container">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                    <h3 style="color: #00c6ff; margin: 0; font-size: 1.3rem;">
                        <i class="fas fa-list-ul"></i> Xodimlar Ro'yxati
                    </h3>
                    <div style="display: flex; gap: 10px; flex-grow: 1; justify-content: flex-end; min-width: 300px;">
                        <input type="text" id="hr-search" placeholder="Ism yoki lavozim bo'yicha qidirish..." style="flex-grow: 1; max-width: 400px; padding: 10px 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; outline: none; transition: 0.3s;" onfocus="this.style.borderColor='#00c6ff'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" onkeyup="filterEmployees()">
                        <button onclick="SmartUtils.exportToPDF('employee-table-content', 'Xodimlar_Royxati')" 
                                style="padding: 10px 20px; background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); color: #e74c3c; border-radius: 10px; cursor: pointer; transition: 0.2s; white-space: nowrap;">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                    </div>
                </div>
                
                <div id="employee-table-content">
                    ${renderEmployeeTable('', deptId === 'all' ? '' : deptId)}
                </div>

                <!-- Restore: Murojaat Box (Old but Gold) -->
                <div class="murojaat-box" style="margin-top: 30px; background: rgba(0,0,0,0.2); padding: 25px; border-radius: 20px; border: 1px dashed rgba(0, 198, 255, 0.3); backdrop-filter: blur(5px);">
                    <h4 style="color: #00c6ff; margin-top: 0; display: flex; align-items: center; gap: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                        <i class="fas fa-paper-plane" style="color: #ffd700;"></i> Rahbariyatga Murojaat Yuborish
                    </h4>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px;">
                        <div style="flex: 1; min-width: 250px;">
                            <label style="display: block; color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-bottom: 5px; font-weight: 700;">MUROJAAT TURI</label>
                            <select id="murojaat-type-direct" style="width: 100%; padding: 12px; border-radius: 10px; background: rgba(15, 23, 42, 0.8); color: white; border: 1px solid rgba(255,255,255,0.1); font-weight: 600; outline: none;">
                                <option value="arza">Mehnat ta'tili uchun arza</option>
                                <option value="bildirishnoma">Bildirishnoma</option>
                                <option value="erkin">Erkin murojaat</option>
                            </select>
                        </div>
                        <div style="flex: 3; min-width: 300px;">
                            <label style="display: block; color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-bottom: 5px; font-weight: 700;">MUROJAAT MATNI</label>
                            <textarea id="murojaat-text-direct" placeholder="Xat matnini shu yerga yozing..." style="width: 100%; padding: 12px; border-radius: 10px; background: rgba(15, 23, 42, 0.8); color: white; border: 1px solid rgba(255,255,255,0.1); min-width: 300px; height: 80px; resize: none; font-family: 'Inter', sans-serif; outline: none; transition: 0.3s;" onfocus="this.style.borderColor='#00c6ff'"></textarea>
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button onclick="sendDirectMurojaat()" style="padding: 14px 40px; background: linear-gradient(135deg, #00c6ff, #0072ff); border: none; border-radius: 12px; color: white; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0, 198, 255, 0.3); transition: 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                <i class="fas fa-paper-plane"></i> YUBORISH
                            </button>
                        </div>
                    </div>
                    <p style="margin-top: 15px; font-size: 0.75rem; color: rgba(255,255,255,0.4);"><i class="fas fa-info-circle"></i> Eslatma: Murojaat yuborish uchun profil sahifasida shaxsingiz tasdiqlangan bo'lishi lozim.</p>
                </div>
            </div>
            
            <!-- Sidebar Widgets (Now at bottom for full width table) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div id="timesheet-archive-container"></div>
                ${renderDepartmentStatsWidget()}
                ${renderTrainingAlertWidget(stats.alertEmployees)}
                ${renderBirthdayWidget(stats.birthdayEmployees)}
                ${renderAttendanceCalendar()}
            </div>
        </div>
        
        <!-- Charts -->
        <div class="charts-grid">
            <div class="chart-container">
                <h3 class="widget-title">
                    <i class="fas fa-chart-pie"></i>
                    Bo'limlar Bo'yicha Taqsimot
                </h3>
                <canvas id="dept-chart" height="250"></canvas>
            </div>
            <div class="chart-container">
                <h3 class="widget-title">
                    <i class="fas fa-chart-line"></i>
                    Oylik Davomat Tendensiyasi
                </h3>
                <canvas id="attendance-chart" height="250"></canvas>
            </div>
        </div>
    `;
}

// Render employee table
function renderEmployeeTable(filterText = '', filterDept = '') {
    if (!window.hrData || !window.hrData.employees) {
        return '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">Ma\'lumotlar yuklanmoqda...</p>';
    }
    let employees = getEmployeesList(filterDept);

    // Apply filters
    if (filterText) {
        employees = employees.filter(emp =>
            emp.name.toLowerCase().includes(filterText.toLowerCase()) ||
            emp.position.toLowerCase().includes(filterText.toLowerCase())
        );
    }

    if (employees.length === 0) {
        console.log('❌ Xodim topilmadi! Filter:', { filterText, filterDept });
        return '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">Xodim topilmadi</p>';
    }

    const { isSubdivisionUser } = checkHRSubdivisionUser();
    const currentUser = window.Auth?.currentUser || window.currentUser;
    const canEdit = !isSubdivisionUser || currentUser?.role === 'master' || currentUser?.role === 'admin';

    return `
        <table class="employee-table">
            <thead>
                <tr>
                    <th style="width: 100px;">№ (Tabel)</th>
                    <th style="width: 250px;">Xodim Ism Sharifi</th>
                    <th>Lavozim</th>
                    <th style="width: 180px;">Bo'lim</th>
                    <th style="width: 130px;">Biometrika</th>
                    <th style="width: 110px;">Holat</th>
                    <th style="width: 130px;">Amallar</th>
                </tr>
            </thead>
            <tbody>
                ${employees.map(emp => `
                    <tr class="premium-row">
                        <td class="no-wrap" style="color: #0088ff; font-weight: bold; font-family: 'JetBrains Mono', monospace;">${emp.tabelNumber || emp.tabel_number || '---'}</td>
                        <td class="no-wrap" style="font-weight: 700; color: white;">${emp.name}</td>
                        <td style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">${emp.position}</td>
                        <td style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">
                             <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); display: inline-block; white-space: normal; max-width: 160px;">
                                ${emp.department}
                             </span>
                        </td>
                        <td class="no-wrap">
                            ${emp.faceTemplate ?
            `<div class="biometric-pill" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); padding: 4px 10px;">
                                    <i class="fas fa-face-smile"></i> FAOL
                                 </div>` :
            `<div class="biometric-pill" style="background: rgba(148, 163, 184, 0.05); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.1); padding: 4px 10px;">
                                    <i class="fas fa-face-meh"></i> YO'Q
                                 </div>`}
                        </td>
                        <td class="no-wrap">
                            <span class="status-badge ${emp.status === 'active' ? 'status-active' : 'status-leave'}" style="font-size: 0.7rem; padding: 4px 10px;">
                                <i class="fas ${emp.status === 'active' ? 'fa-check' : 'fa-clock'}"></i> ${emp.status === 'active' ? 'ISHDA' : 'TA\'TIL'}
                            </span>
                        </td>
                        <td class="no-wrap">
                            <div style="display: flex; gap: 6px;">
                                <button onclick="viewEmployeeDetails(${emp.id})" style="background: rgba(0,198,255,0.1); border: 1px solid rgba(0,198,255,0.2); color: #00c6ff; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; transition: 0.2s;" title="Ko'rish">
                                    <i class="fas fa-eye"></i>
                                </button>
                                ${canEdit ? `
                                <button onclick="editEmployee(${emp.id})" style="background: rgba(241,196,15,0.1); border: 1px solid rgba(241,196,15,0.2); color: #f1c40f; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; transition: 0.2s;" title="Tahrirlash">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteEmployee(${emp.id})" style="background: rgba(231,76,60,0.1); border: 1px solid rgba(231,76,60,0.2); color: #e74c3c; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; transition: 0.2s;" title="O'chirish">
                                    <i class="fas fa-trash"></i>
                                </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Filter employees
window.filterEmployees = function () {
    const searchEl = document.getElementById('hr-search');
    const deptEl = document.getElementById('hr-dept-filter');
    const tableEl = document.getElementById('employee-table-content');

    if (tableEl) {
        const searchText = searchEl ? searchEl.value : '';
        const deptFilter = deptEl ? deptEl.value : '';
        tableEl.innerHTML = renderEmployeeTable(searchText, deptFilter);
    }
};

// Training alert widget
function renderTrainingAlertWidget(alerts) {
    if (alerts.length === 0) {
        return `
            <div class="sidebar-widget" style="border-color: rgba(46, 204, 113, 0.3);">
                <h3 class="widget-title" style="color: #2ecc71;">
                    <i class="fas fa-check-shield"></i>
                    Xavfsizlik Nazorati
                </h3>
                <p style="text-align: center; padding: 20px; color: rgba(46,204,113,0.7); font-weight: 500;">
                    Barcha xodimlar yo'riqnomadan o'tgan
                </p>
            </div>
        `;
    }

    return `
        <div class="sidebar-widget" style="border-color: rgba(231, 76, 60, 0.5); background: rgba(231, 76, 60, 0.05);">
            <h3 class="widget-title" style="color: #e74c3c;">
                <i class="fas fa-exclamation-triangle"></i>
                Muddati Tugagan / Yaqin
            </h3>
            <div style="max-height: 300px; overflow-y: auto; padding-right: 5px;">
                ${alerts.map(emp => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: rgba(231, 76, 60, 0.1); margin-bottom: 10px; border-left: 3px solid #e74c3c;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: white;">${emp.name}</div>
                            <div style="font-size: 0.8rem; color: rgba(231, 76, 60, 0.8);">
                                ${emp.medicalCheckupDate ? `Muddati: ${emp.medicalCheckupDate}` : 'Yo\'riqnoma yo\'q!'}
                            </div>
                        </div>
                        <button onclick="openSafetyTNU19('${emp.department}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">
                            Imzolatish
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Timesheet Archive Widget (Persistent Repository)
async function renderTimesheetArchiveWidget() {
    try {
        const files = await SmartUtils.fetchAPI('/files/module/timesheet_archive');
        if (!files || files.length === 0) {
            return `
                <div class="sidebar-widget">
                    <h3 class="widget-title"><i class="fas fa-archive"></i> Tabel Arxivi</h3>
                    <p style="text-align: center; color: rgba(255,255,255,0.4); font-size: 0.85rem; padding: 15px;">Hozircha arxivlangan tabellar yo'q</p>
                </div>
            `;
        }

        return `
            <div class="sidebar-widget" style="border-top: 4px solid #f59e0b;">
                <h3 class="widget-title" style="color: #f59e0b;">
                    <i class="fas fa-file-pdf"></i>
                    Taqdim etilgan tabellar (PDF)
                </h3>
                <div style="max-height: 250px; overflow-y: auto; padding-right: 5px; display: grid; gap: 10px;">
                    ${files.map(f => {
            const date = new Date(f.created_at).toLocaleDateString();
            const bolinma = f.bolinma_id === 'all' ? 'UMUMIY' : f.bolinma_id;
            return `
                        <div style="background: rgba(255,165,0,0.05); border: 1px solid rgba(255,165,0,0.1); padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s;" onmouseover="this.style.background='rgba(255,165,0,0.1)'" onmouseout="this.style.background='rgba(255,165,0,0.05)'">
                            <div style="flex: 1; overflow: hidden;">
                                <div style="font-weight: bold; color: white; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; font-size: 0.8rem;">${f.original_name}</div>
                                <div style="font-size: 0.65rem; color: rgba(255,255,255,0.4); display: flex; gap: 10px;">
                                    <span><i class="fas fa-calendar"></i> ${date}</span>
                                    <span><i class="fas fa-building"></i> ${bolinma}</span>
                                </div>
                            </div>
                            <a href="/${f.file_path}" target="_blank" style="background: #f59e0b; color: white; width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);">
                                <i class="fas fa-download"></i>
                            </a>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    } catch (e) {
        return `
            <div class="sidebar-widget">
               <h3 class="widget-title"><i class="fas fa-archive"></i> Tabel Arxivi</h3>
               <p style="color: #e74c3c; font-size: 0.8rem;">Yuklashda xatolik</p>
            </div>
        `;
    }
}

// Birthday widget
function renderBirthdayWidget(birthdays) {
    if (birthdays.length === 0) {
        return `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-birthday-cake"></i>
                    Tug'ilgan Kunlar
                </h3>
                <p style="text-align: center; padding: 20px; color: rgba(255,255,255,0.5);">
                    Bu hafta tug'ilgan kunlar yo'q
                </p>
            </div>
        `;
    }

    return `
        <div class="sidebar-widget">
            <h3 class="widget-title">
                <i class="fas fa-birthday-cake"></i>
                Bu Hafta Tug'ilgan Kunlar
            </h3>
            ${birthdays.map(emp => {
        const bday = new Date(emp.birthday);
        const formatted = bday.toLocaleDateString('uz-UZ', { month: 'long', day: 'numeric' });
        return `
                    <div class="birthday-item">
                        <div class="employee-avatar" style="width: 45px; height: 45px;">
                            ${emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: white;">${emp.name}</div>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                                <i class="fas fa-calendar"></i> ${formatted}
                            </div>
                        </div>
                        <div style="font-size: 24px;">🎂</div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

// Department Stats Widget
function renderDepartmentStatsWidget() {
    initHRData();
    const dist = getDepartmentDistribution();
    // Sort by name (1-bo'linma, 2-bo'linma, etc.)
    const sortedDepts = Object.keys(dist).sort((a, b) => {
        if (a.includes('bo\'linma') && b.includes('bo\'linma')) {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        }
        return a.localeCompare(b);
    });

    return `
        <div class="sidebar-widget" style="border-left: 4px solid #00c6ff;">
            <h3 class="widget-title">
                <i class="fas fa-sitemap"></i>
                Bo'linmalar bo'yicha xodimlar
            </h3>
            <div style="display: grid; gap: 8px;">
                ${sortedDepts.map(dept => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: rgba(0, 198, 255, 0.05); border-radius: 10px; border: 1px solid rgba(0, 198, 255, 0.1); cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(0, 198, 255, 0.1)'" onmouseout="this.style.background='rgba(0, 198, 255, 0.05)'" onclick="document.getElementById('hr-search').value='${dept}'; window.filterEmployees();">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #00c6ff;"></div>
                            <span style="font-weight: 500; font-size: 0.9rem;">${dept}</span>
                        </div>
                        <div style="background: rgba(0, 198, 255, 0.2); color: #00c6ff; padding: 2px 10px; border-radius: 12px; font-weight: bold; font-size: 0.85rem;">
                            ${dist[dept]}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                <span style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">Jami:</span>
                <span style="color: white; font-weight: bold;">${getEmployeesList().length} ta xodim</span>
            </div>
        </div>
    `;
}

// Attendance calendar with navigation
// Global variable for calendar month tracking
if (!window.hrCalendarMonth) {
    window.hrCalendarMonth = new Date();
}

function renderAttendanceCalendar() {
    const calendarDate = new Date(window.hrCalendarMonth);
    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();

    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    const weekDays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

    let calendar = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-top: 10px;">';

    // Week days header with weekend highlighting
    weekDays.forEach((day, index) => {
        const isWeekend = index === 0 || index === 6; // Yakshanba (0) or Shanba (6)
        calendar += `<div style="text-align: center; font-size: 0.75rem; color: ${isWeekend ? '#e74c3c' : 'rgba(255,255,255,0.5)'}; padding: 5px; font-weight: ${isWeekend ? 'bold' : 'normal'};">${day}</div>`;
    });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        calendar += '<div></div>';
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const attendance = window.hrData.attendance[date];
        const dayOfWeek = new Date(year, month, day).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Yakshanba or Shanba
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

        let bgColor = 'rgba(255,255,255,0.05)';
        if (attendance) {
            const percent = (attendance.present / (getEmployeesList().length || 1)) * 100;
            if (percent >= 90) bgColor = 'rgba(46,204,113,0.3)';
            else if (percent >= 70) bgColor = 'rgba(0,198,255,0.2)';
            else bgColor = 'rgba(231,76,60,0.2)';
        }

        calendar += `
            <div 
                onclick="window.onCalendarDayClick('${date}')"
                style="
                    aspect-ratio: 1;
                    background: ${bgColor};
                    border: ${isToday ? '2px solid #00c6ff' : '1px solid rgba(255,255,255,0.05)'};
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    color: ${isWeekend ? '#ef4444' : (isToday ? '#00c6ff' : 'white')};
                    font-weight: ${isToday || isWeekend ? 'bold' : 'normal'};
                    cursor: pointer;
                    transition: 0.2s;
                "
                onmouseover="this.style.transform='scale(1.1)'; this.style.background='rgba(255,255,255,0.1)'"
                onmouseout="this.style.transform='scale(1)'; this.style.background='${bgColor}'"
                title="${date}${attendance ? `: ${attendance.present} xodim ishda` : ''}"
            >
                ${day}
            </div>
        `;
    }

    calendar += '</div>';

    return `
        <div class="sidebar-widget">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <button onclick="changeCalendarMonth(-1)" style="background: rgba(0,198,255,0.2); border: 1px solid rgba(0,198,255,0.4); color: #00c6ff; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h3 class="widget-title" style="margin: 0;">
                    <i class="fas fa-calendar-alt"></i>
                    ${monthNames[month]} ${year}
                </h3>
                <button onclick="changeCalendarMonth(1)" style="background: rgba(0,198,255,0.2); border: 1px solid rgba(0,198,255,0.4); color: #00c6ff; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            ${calendar}
            <div style="display: flex; gap: 15px; margin-top: 15px; font-size: 0.85rem; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 12px; height: 12px; background: rgba(46,204,113,0.3); border-radius: 3px;"></div>
                    <span style="color: rgba(255,255,255,0.7);">90%+</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 12px; height: 12px; background: rgba(0,198,255,0.2); border-radius: 3px;"></div>
                    <span style="color: rgba(255,255,255,0.7);">70-89%</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 12px; height: 12px; background: rgba(231,76,60,0.2); border-radius: 3px;"></div>
                    <span style="color: rgba(255,255,255,0.7);">&lt;70%</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="color: #e74c3c; font-weight: bold;">●</span>
                    <span style="color: rgba(255,255,255,0.7);">Dam olish</span>
                </div>
            </div>
        </div>
    `;
};

// Change calendar month
window.changeCalendarMonth = function (direction) {
    const current = new Date(window.hrCalendarMonth);
    current.setMonth(current.getMonth() + direction);
    window.hrCalendarMonth = current;

    // Re-render the calendar widget
    const widgetContainer = document.getElementById('hr-calendar-widget');
    if (widgetContainer) {
        widgetContainer.outerHTML = renderAttendanceCalendar();
    }
};

// Handle calendar day click
window.onCalendarDayClick = function(date) {
    console.log('📅 Kalendar kuni tanlandi:', date);
    if (window.selectedDispatcherDate !== undefined) {
        window.selectedDispatcherDate = date;
    }
    
    // Optionally trigger a specialized view or filter
    const searchInput = document.getElementById('hr-search');
    if (searchInput) {
        // Just as an example, we could show people present on this day
        SmartUtils.showToast(`${date} sanasidagi ma'lumotlar tanlandi`, 'info');
    }
};

// Initialize charts
window.hrCharts = window.hrCharts || {};
window.initHRCharts = function () {
    // 0. Destroy existing charts to prevent "Canvas is already in use" error
    if (window.hrCharts.dept) window.hrCharts.dept.destroy();
    if (window.hrCharts.attendance) window.hrCharts.attendance.destroy();

    // Department pie chart
    const deptData = getDepartmentDistribution();
    const deptCtx = document.getElementById('dept-chart');
    if (deptCtx && window.Chart) {
        window.hrCharts.dept = new Chart(deptCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(deptData),
                datasets: [{
                    data: Object.values(deptData),
                    backgroundColor: [
                        'rgba(243, 156, 18, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(155, 89, 182, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(26, 188, 156, 0.8)',
                        'rgba(241, 196, 15, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#0f172a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'rgba(255,255,255,0.8)', padding: 15 }
                    }
                }
            }
        });
    }

    // Attendance trends line chart
    const attendanceCtx = document.getElementById('attendance-chart');
    if (attendanceCtx && window.Chart) {
        const today = new Date();
        const labels = [];
        const data = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            labels.push(date.getDate());

            const att = window.hrData.attendance[dateKey];
            if (att) {
                const percent = Math.round((att.present / (getEmployeesList().length || 1)) * 100);
                data.push(percent);
            } else {
                data.push(null);
            }
        }

        window.hrCharts.attendance = new Chart(attendanceCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Davomat %',
                    data: data,
                    borderColor: 'rgba(0, 198, 255, 1)',
                    backgroundColor: 'rgba(0, 198, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: 'rgba(255,255,255,0.6)' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: 'rgba(255,255,255,0.6)' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: 'rgba(255,255,255,0.8)' }
                    }
                }
            }
        });
    }
};

window.processExcelData = function (jsonData, detectedColumns) {
    let newCount = 0;
    let errorCount = 0;
    let updatedCount = 0; // Assuming this might be used for future updates

    const employeesToImport = [];

    jsonData.forEach((row, index) => {
        try {
            // Use detected columns or common defaults
            const name = row[detectedColumns.name || 'F.I.SH'] || row['F.I.SH'] || row['Ism'] || row['Name'] || '';
            const position = row[detectedColumns.position || 'Lavozimi'] || row['Lavozimi'] || row['Position'] || '';
            const department = row[detectedColumns.department || 'Bo\'linma'] || row['Bo\'linma'] || row['Department'] || '';

            if (name) {
                employeesToImport.push({
                    full_name: name,
                    position: position,
                    department_id: department
                });
                newCount++;
            }
        } catch (err) {
            console.error(`Xatolik qatorda ${index + 1}:`, err);
            errorCount++;
        }
    });

    if (employeesToImport.length > 0) {
        showToast(`Serverga ${employeesToImport.length} ta xodim yuklanmoqda...`, 'info');

        SmartUtils.fetchAPI('/hr/import-exodim', {
            method: 'POST',
            body: JSON.stringify({ employees: employeesToImport })
        }).then(result => {
            showToast(`${employeesToImport.length} ta xodim muvaffaqiyatli yuklandi!`, 'success');
            initHRData(); // Refresh data
        }).catch(err => {
            console.error('Import error:', err);
            showToast('Yuklashda xatolik yuz berdi', 'error');
        });
    }

    console.log(`=== IMPORT YAKUNLANDI: ${newCount} qo'shildi, ${updatedCount} yangilandi, ${errorCount} xato ===`);
};

// Add employee modal
window.openAddEmployeeModal = function () {
    const { isSubdivisionUser, userBolinma } = checkHRSubdivisionUser();

    let departmentSelectHTML = '';
    if (isSubdivisionUser) {
        departmentSelectHTML = `
            <select id="emp-department" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;" disabled>
                <option value="${userBolinma}" selected>${userBolinma}</option>
            </select>
        `;
    } else {
        departmentSelectHTML = `
            <select id="emp-department" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                <option value="">Tanlang...</option>
                <option value="1-bo'linma">1-bo'linma</option>
                <option value="2-bo'linma">2-bo'linma</option>
                <option value="3-bo'linma">3-bo'linma</option>
                <option value="4-bo'linma">4-bo'linma</option>
                <option value="5-bo'linma">5-bo'linma</option>
                <option value="6-bo'linma">6-bo'linma</option>
                <option value="7-bo'linma">7-bo'linma</option>
                <option value="8-bo'linma">8-bo'linma</option>
                <option value="9-bo'linma">9-bo'linma</option>
                <option value="10-bo'linma">10-bo'linma</option>
            </select>
        `;
    }

    const modal = document.createElement('div');
    modal.id = 'employee-modal';
    modal.className = 'department-window active';
    modal.style.zIndex = '10001';

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #38bdf8; padding: 15px 30px;">
            <h2 class="department-name" style="color: #f8fafc; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-user-plus" style="color: #38bdf8;"></i> YANGI XODIM QO'SHISH
            </h2>
            <button class="close-btn" onclick="closeEmployeeModal()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="padding: 30px; max-height: 70vh; overflow-y: auto;">
            <form id="employee-form" style="display: grid; gap: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-user"></i> Ism Familiya *
                        </label>
                        <input type="text" id="emp-name" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-briefcase"></i> Lavozim *
                        </label>
                        <input type="text" id="emp-position" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-building"></i> Bo'lim *
                        </label>
                        ${departmentSelectHTML}
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-phone"></i> Telefon *
                        </label>
                        <input type="tel" id="emp-phone" required placeholder="+998901234567" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-id-card"></i> Tabel Raqami *
                        </label>
                        <input type="text" id="emp-tabel-number" required placeholder="101" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-heartbeat"></i> Tibbiy Ko'rik Kuni
                        </label>
                        <input type="date" id="emp-medical-date" placeholder="дд.мм.гггг" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-birthday-cake"></i> Tug'ilgan Kun
                        </label>
                        <input type="date" id="emp-birthday" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-calendar-check"></i> Ish Boshlagan Sana
                        </label>
                        <input type="date" id="emp-hire-date" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-plane-departure"></i> Ta'til Boshlanish Sanasi
                        </label>
                        <input type="date" id="emp-vacation-start" onchange="checkVacationStatus()" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-plane-arrival"></i> Ta'til Tugash Sanasi
                        </label>
                        <input type="date" id="emp-vacation-end" onchange="checkVacationStatus()" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                        <i class="fas fa-info-circle"></i> Holat
                        <span style="font-size: 0.75rem; opacity: 0.7; font-weight: normal; margin-left: 8px;">(Ta'til sanalariga qarab avtomatik o'zgaradi)</span>
                    </label>
                    <select id="emp-status" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                        <option value="active">Faol</option>
                        <option value="on_leave">Ta'tilda</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" onclick="closeEmployeeModal()" style="padding: 12px 30px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-times"></i> Bekor qilish
                    </button>
                    <button type="submit" style="padding: 12px 30px; background: linear-gradient(135deg, #00c6ff, #0099cc); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-save"></i> Saqlash
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('department-overlay').classList.add('active');

    // Form submit handler
    document.getElementById('employee-form').onsubmit = async function (e) {
        e.preventDefault();

        const vacationStart = document.getElementById('emp-vacation-start').value;
        const vacationEnd = document.getElementById('emp-vacation-end').value;
        const today = new Date().toISOString().split('T')[0];

        // Auto-detect vacation status
        let autoStatus = 'active';
        if (vacationStart && vacationEnd) {
            if (today >= vacationStart && today <= vacationEnd) {
                autoStatus = 'on_leave';
            }
        }

        const employeeData = {
            full_name: document.getElementById('emp-name').value,
            position: document.getElementById('emp-position').value,
            department_id: 'pch', // Default or specific
            bolinma_id: document.getElementById('emp-department').value,
            phone: document.getElementById('emp-phone').value,
            rank: '1', // Placeholder or add to form
            birth_date: document.getElementById('emp-birthday').value || today,
            hired_date: document.getElementById('emp-hire-date').value || today,
            status: autoStatus
        };

        try {
            showToast('Saqlanmoqda...', 'info');
            const result = await SmartUtils.fetchAPI('/hr/employees', {
                method: 'POST',
                body: JSON.stringify(employeeData)
            });

            if (result && result.id) {
                showToast('Xodim muvaffaqiyatli qo\'shildi!', 'success');
                closeEmployeeModal();
                await initHRData();
                filterEmployees();
                if (typeof window.filterModalEmployees === 'function') {
                    window.filterModalEmployees();
                }
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            showToast('Xatoli: ' + error.message, 'error');
        }
    };

    // Add vacation status checker function
    window.checkVacationStatus = function () {
        const vacationStart = document.getElementById('emp-vacation-start')?.value;
        const vacationEnd = document.getElementById('emp-vacation-end')?.value;
        const statusSelect = document.getElementById('emp-status');

        if (!statusSelect) return;

        if (vacationStart && vacationEnd) {
            const today = new Date().toISOString().split('T')[0];
            if (today >= vacationStart && today <= vacationEnd) {
                statusSelect.value = 'on_leave';
                statusSelect.style.background = 'rgba(255, 193, 7, 0.2)';
            } else {
                statusSelect.value = 'active';
                statusSelect.style.background = 'rgba(0,0,0,0.3)';
            }
        }
    };
};

// View employee details
window.viewEmployeeDetails = function (id) {
    const employee = window.hrData.employees.find(e => e.id === id);
    if (!employee) return;

    const modal = document.createElement('div');
    modal.id = 'employee-details-modal';
    modal.className = 'department-window active';
    modal.style.zIndex = '10100';
    modal.style.maxWidth = '600px';

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-bottom: 2px solid #38bdf8;">
            <h2 class="department-name" style="color: #f8fafc; font-weight: 900; letter-spacing: 1.5px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-id-badge" style="color: #38bdf8;"></i> XODIM PROFILI
            </h2>
            <button class="close-btn" onclick="document.getElementById('employee-details-modal').remove()" style="background: rgba(239, 68, 68, 0.1); border: 1.5px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="padding: 30px; display: flex; gap: 30px;">
            <div style="flex-shrink: 0;">
                <div style="width: 180px; height: 220px; border-radius: 12px; background: #161b22; border: 2px solid #30363d; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    ${employee.faceTemplate ?
            `<img src="${employee.faceTemplate}" style="width: 100%; height: 100%; object-fit: cover;">` :
            `<div style="text-align: center; color: rgba(255,255,255,0.1);">
                            <i class="fas fa-user" style="font-size: 4rem; display: block; margin-bottom: 10px;"></i>
                            <span style="font-size: 0.8rem;">RASM YO'Q</span>
                         </div>`}
                </div>
                ${employee.faceTemplate ?
            `<div style="text-align: center; margin-top: 10px; color: #2ecc71; font-weight: bold; font-size: 0.8rem;">
                        <i class="fas fa-check-double"></i> FACE ID TASDIQLANGAN
                     </div>` : ''}
            </div>

            <div style="flex: 1; display: grid; gap: 15px;">
                <div>
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem; text-transform: uppercase;">Ism Familiya</div>
                    <div style="font-size: 1.2rem; font-weight: bold; color: white;">${employee.name}</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Tabel №</div>
                        <div style="color: #00c6ff; font-family: monospace; font-weight: bold;">${employee.tabelNumber || '---'}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Holat</div>
                        <div style="color: ${employee.status === 'active' ? '#2ecc71' : '#f1c40f'}; font-weight: bold;">
                            ${employee.status === 'active' ? 'Faol' : 'Ta\'tilda'}
                        </div>
                    </div>
                </div>
                <div>
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Lavozimi</div>
                    <div style="color: rgba(255,255,255,0.9);">${employee.position}</div>
                </div>
                <div>
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Bo'linma</div>
                    <div style="color: rgba(255,255,255,0.9);">${employee.department}</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Telefon</div>
                        <div style="color: rgba(255,255,255,0.9);">${employee.phone || '---'}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Tug'ilgan kuni</div>
                        <div style="color: rgba(255,255,255,0.9);">${employee.birthday || '---'}</div>
                    </div>
                </div>
            </div>
        </div>
        <div style="padding: 20px; border-top: 1px solid #30363d; display: flex; justify-content: space-between; background: rgba(0,0,0,0.2);">
            <div>
                <button onclick="window.openFaceRegistrationModal(${employee.id})" style="padding: 10px 25px; background: rgba(0,198,255,0.1); border: 1px solid #00c6ff; color: #00c6ff; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-camera"></i> Face ID Biriktirish
                </button>
                <button onclick="window.openFingerprintRegistrationModal(${employee.id})" style="padding: 10px 25px; background: rgba(245,158,11,0.1); border: 1px solid #f59e0b; color: #f59e0b; border-radius: 8px; cursor: pointer; font-weight: bold; margin-left: 15px;">
                    <i class="fas fa-fingerprint"></i> Barmoq Izi Biriktirish
                </button>
            </div>
            <button onclick="document.getElementById('employee-details-modal').remove()" style="padding: 10px 25px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px; cursor: pointer;">
                Yopish
            </button>
        </div>
    `;

    document.body.appendChild(modal);
};

// Open Face ID Registration Modal
window.openFaceRegistrationModal = async function (id) {
    const employee = window.hrData.employees.find(e => e.id === id);
    if (!employee) return;

    let overlay = document.getElementById('face-register-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'face-register-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0'; overlay.style.left = '0';
        overlay.style.width = '100vw'; overlay.style.height = '100vh';
        overlay.style.background = 'rgba(13, 17, 23, 0.98)';
        overlay.style.zIndex = '20002';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.backdropFilter = 'blur(15px)';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: rgba(0,198,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 2px solid #00c6ff;">
                <i class="fas fa-camera-retro" style="font-size: 2rem; color: #00c6ff;"></i>
            </div>
            <h2 style="color: white; font-size: 1.8rem; letter-spacing: 2px; margin: 0;">FACE ID RO'YXATGA OLISH</h2>
            <p style="color: #8b949e; margin-top: 10px;">${employee.name}</p>
        </div>
        
        <div style="position: relative; width: 320px; height: 320px; border-radius: 50%; border: 4px solid #30363d; overflow: hidden; background: #000; box-shadow: 0 0 50px rgba(0, 198, 255, 0.2);">
            <video id="hr-face-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 260px; border: 2px dashed rgba(0,198,255,0.5); border-radius: 50%/40%; pointer-events: none;"></div>
        </div>
        
        <div style="margin-top: 40px; display: flex; gap: 20px;">
            <button onclick="window.closeFaceRegistration()" style="padding: 12px 30px; background: transparent; border: 1px solid #f85149; color: #f85149; border-radius: 30px; cursor: pointer; font-weight: bold;">BEKOR QILISH</button>
            <button id="hr-capture-face-btn" style="padding: 12px 50px; background: #00c6ff; color: white; border: none; border-radius: 30px; font-weight: bold; cursor: pointer; box-shadow: 0 5px 20px rgba(0, 198, 255, 0.4);">SKANERLASH</button>
        </div>
    `;

    overlay.style.display = 'flex';

    const video = document.getElementById('hr-face-video');
    try {
        window.hrFaceStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = window.hrFaceStream;
    } catch (err) {
        SmartUtils.showToast("Kamera ochilishida xatolik: " + err.message, "error");
        window.closeFaceRegistration();
        return;
    }

    // Capture button logic
    const captureBtn = document.getElementById('hr-capture-face-btn');
    if (captureBtn) {
        captureBtn.onclick = async () => {
            try {
                captureBtn.innerText = "KUTILMOQDA...";
                captureBtn.disabled = true;

                // Get descriptor array via FaceService
                const descriptor = await window.FaceService.getDescriptorFromVideo(video);

                // Generate simple visual snapshot (Base64)
                const canvas = document.createElement('canvas');
                canvas.width = 160; canvas.height = 160;
                const ctx = canvas.getContext('2d');
                const size = Math.min(video.videoWidth, video.videoHeight) * 0.65;
                const sx = (video.videoWidth - size) / 2;
                const sy = (video.videoHeight - size) / 2;
                ctx.drawImage(video, sx, sy, size, size, 0, 0, 160, 160);
                const faceImageString = canvas.toDataURL('image/jpeg', 0.6);

                // We will store stringified float array
                const arr = Array.from(descriptor);
                const templateStr = JSON.stringify({
                    image: faceImageString, // Save image snapshot together
                    descriptor: arr
                });

                // Save to DB
                await SmartUtils.fetchAPI(`/hr/employees/${id}/face`, {
                    method: 'PATCH',
                    body: JSON.stringify({ face_template: templateStr })
                });

                showToast("Face ID muvaffaqiyatli saqlandi!", "success");
                window.closeFaceRegistration();
                const modal = document.getElementById('employee-details-modal');
                if (modal) modal.remove();
                await initHRData();
                filterEmployees();
            } catch (err) {
                console.error(err);
                SmartUtils.showToast(err.message || "Xatolik ro'y berdi.", "error");
                captureBtn.innerText = "SKANERLASH";
                captureBtn.disabled = false;
            }
        };
    }
};

window.closeFaceRegistration = function () {
    const overlay = document.getElementById('face-register-overlay');
    if (overlay) overlay.style.display = 'none';
    if (window.hrFaceStream) {
        window.hrFaceStream.getTracks().forEach(t => t.stop());
    }
};

// Open Fingerprint Registration Modal
window.openFingerprintRegistrationModal = async function (id) {
    const employee = window.hrData.employees.find(e => e.id === id);
    if (!employee) return;

    let overlay = document.getElementById('fingerprint-register-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'fingerprint-register-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0'; overlay.style.left = '0';
        overlay.style.width = '100vw'; overlay.style.height = '100vh';
        overlay.style.background = 'rgba(13, 17, 23, 0.98)';
        overlay.style.zIndex = '20002';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.backdropFilter = 'blur(15px)';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: rgba(245,158,11,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 2px solid #f59e0b;">
                <i class="fas fa-fingerprint" style="font-size: 2.5rem; color: #f59e0b;"></i>
            </div>
            <h2 style="color: white; font-size: 1.8rem; letter-spacing: 2px; margin: 0;">BARMOQ IZI RO'YXATGA OLISH</h2>
            <p style="color: #8b949e; margin-top: 10px;">${employee.name}</p>
        </div>
        
        <div style="position: relative; width: 250px; height: 250px; border-radius: 20px; border: 4px solid #30363d; overflow: hidden; background: #000; box-shadow: 0 0 50px rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center;">
            <i id="hr-finger-icon" class="fas fa-fingerprint" style="font-size: 120px; color: rgba(245, 158, 11, 0.3); transition: all 0.3s; z-index: 2;"></i>
            
            <div id="hr-finger-scan-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: #f59e0b; box-shadow: 0 0 20px 5px rgba(245, 158, 11, 0.5); z-index: 3; display: none;"></div>
        </div>
        
        <div id="hr-finger-status" style="margin-top: 20px; font-weight: bold; color: rgba(255,255,255,0.7); min-height: 24px;">Qurilmaga barmoq qo'yilishi kutilmoqda...</div>
        
        <div style="margin-top: 30px; display: flex; gap: 20px;">
            <button onclick="window.closeFingerprintRegistration()" style="padding: 12px 30px; background: transparent; border: 1px solid #f85149; color: #f85149; border-radius: 30px; cursor: pointer; font-weight: bold;">BEKOR QILISH</button>
            <button id="hr-capture-finger-btn" style="padding: 12px 50px; background: #f59e0b; color: white; border: none; border-radius: 30px; font-weight: bold; cursor: pointer; box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);">SKANERLASH BOSH</button>
        </div>
    `;

    overlay.style.display = 'flex';

    const captureBtn = document.getElementById('hr-capture-finger-btn');
    const fingerIcon = document.getElementById('hr-finger-icon');
    const scanLine = document.getElementById('hr-finger-scan-line');
    const statusText = document.getElementById('hr-finger-status');

    if (captureBtn) {
        captureBtn.onclick = async () => {
            try {
                captureBtn.innerText = "QURILMADAN KUTILMOQDA...";
                captureBtn.disabled = true;
                
                // Animation Start
                fingerIcon.style.color = '#f59e0b';
                scanLine.style.display = 'block';
                statusText.innerText = "Qurilmaga barmog'ingizni 3 marta bosing...";
                statusText.style.color = '#00c6ff';
                
                scanLine.animate([
                    { top: '0%' },
                    { top: '98%' },
                    { top: '0%' }
                ], {
                    duration: 1500,
                    iterations: Infinity
                });

                // AbortController to allow waiting for hardware
                const controller = new AbortController();
                // Real ZKTeco enroll can take up to 30-60 seconds 
                const timeoutId = setTimeout(() => controller.abort(), 60000);

                const response = await fetch('http://127.0.0.1:8080/scan', { 
                    method: 'POST', 
                    body: JSON.stringify({ mode: 'enroll' }),
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error("Local bridge error: " + response.statusText);
                }

                const result = await response.json();
                
                if (result.success && result.template) {
                    // Stop animation
                    scanLine.style.display = 'none';
                    statusText.innerText = 'Saqlanmoqda...';

                    // Save to system DB
                    await SmartUtils.fetchAPI(`/hr/employees/${id}/fingerprint`, {
                        method: 'PATCH',
                        body: JSON.stringify({ fingerprint_template: result.template })
                    });

                    showToast("Barmoq izi muvaffaqiyatli saqlandi!", "success");
                    
                    fingerIcon.style.color = '#2ecc71';
                    statusText.innerText = 'Muvaffaqiyatli bajarildi!';
                    statusText.style.color = '#2ecc71';
                    
                    setTimeout(async () => {
                        window.closeFingerprintRegistration();
                        const modal = document.getElementById('employee-details-modal');
                        if (modal) modal.remove();
                        await initHRData();
                        filterEmployees();
                    }, 1500);
                } else {
                    throw new Error("Hardware failed to read fingerprint.");
                }
            } catch (err) {
                console.error("Hardware FP Error:", err);
                scanLine.style.display = 'none';
                captureBtn.innerText = "QAYTA URINISH";
                captureBtn.disabled = false;
                fingerIcon.style.color = '#f85149';
                
                if (err.name === 'AbortError') {
                    statusText.innerText = 'Xatolik: Vaqt tugadi. Ulanishni tekshiring.';
                } else {
                    statusText.innerText = 'Xatolik: Qurilma ishlamayapti yoki topilmadi.';
                }
                statusText.style.color = '#f85149';
            }
        };
    }
};

window.closeFingerprintRegistration = function () {
    const overlay = document.getElementById('fingerprint-register-overlay');
    if (overlay) overlay.style.display = 'none';
};

// Edit employee modal
window.editEmployee = function (id) {
    const employee = window.hrData.employees.find(e => e.id === id);
    if (!employee) return;

    const { isSubdivisionUser, userBolinma } = checkHRSubdivisionUser();

    let departmentSelectHTML = '';
    if (isSubdivisionUser) {
        departmentSelectHTML = `
            <select id="emp-department" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;" disabled>
                <option value="${userBolinma}" selected>${userBolinma}</option>
            </select>
        `;
    } else {
        departmentSelectHTML = `
            <select id="emp-department" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                <option value="">Tanlang...</option>
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `
                    <option value="${n}-bo'linma" ${employee.department === n + "-bo'linma" ? 'selected' : ''}>${n}-bo'linma</option>
                `).join('')}
            </select>
        `;
    }

    const modal = document.createElement('div');
    modal.id = 'employee-modal';
    modal.className = 'department-window active';
    modal.style.zIndex = '10001';

    modal.innerHTML = `
                <div class="window-header">
            <h2 class="department-name">
                <i class="fas fa-edit"></i> Xodim Ma'lumotlarini Tahrirlash
            </h2>
            <button class="close-btn" onclick="closeEmployeeModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
                <div class="window-content" style="padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <form id="employee-form" style="display: grid; gap: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                                    <i class="fas fa-user"></i> Ism Familiya *
                                </label>
                                <input type="text" id="emp-name" value="${employee.name}" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                            </div>

                            <div>
                                <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                                    <i class="fas fa-briefcase"></i> Lavozim *
                                </label>
                                <input type="text" id="emp-position" value="${employee.position}" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                                    <i class="fas fa-building"></i> Bo'lim *
                                </label>
                                ${departmentSelectHTML}
                            </div>

                            <div>
                                <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                                    <i class="fas fa-phone"></i> Telefon *
                                </label>
                                <input type="tel" id="emp-phone" value="${employee.phone}" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                                    <i class="fas fa-birthday-cake"></i> Tug'ilgan Kun
                                </label>
                                <input type="date" id="emp-birthday" value="${employee.birthday}" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                            </div>

                            <div>
                                <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                                    <i class="fas fa-calendar-check"></i> Ish Boshlagan Sana
                                </label>
                                <input type="date" id="emp-hire-date" value="${employee.hireDate}" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                            </div>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                                <i class="fas fa-info-circle"></i> Holat
                            </label>
                            <select id="emp-status" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                                <option value="active" ${employee.status === 'active' ? 'selected' : ''}>Faol</option>
                                <option value="on_leave" ${employee.status === 'on_leave' ? 'selected' : ''}>Ta'tilda</option>
                            </select>
                        </div>

                        <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" onclick="closeEmployeeModal()" style="padding: 12px 30px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                <i class="fas fa-times"></i> Bekor qilish
                            </button>
                            <button type="submit" style="padding: 12px 30px; background: linear-gradient(135deg, #00c6ff, #0099cc); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                <i class="fas fa-save"></i> Saqlash
                            </button>
                        </div>
                    </form>
                </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('department-overlay').classList.add('active');

    // Form submit handler
    document.getElementById('employee-form').onsubmit = async function (e) {
        e.preventDefault();

        const employeeData = {
            full_name: document.getElementById('emp-name').value,
            position: document.getElementById('emp-position').value,
            department_id: 'pch',
            bolinma_id: document.getElementById('emp-department').value,
            phone: document.getElementById('emp-phone').value,
            rank: '1',
            birth_date: document.getElementById('emp-birthday').value,
            hired_date: document.getElementById('emp-hire-date').value,
            status: document.getElementById('emp-status').value
        };

        try {
            showToast('Saqlanmoqda...', 'info');
            await SmartUtils.fetchAPI(`/ hr / employees / ${id}`, {
                method: 'PUT',
                body: JSON.stringify(employeeData)
            });

            showToast('O\'zgarishlar saqlandi!', 'success');
            closeEmployeeModal();
            await initHRData();
            filterEmployees();
            if (typeof window.filterModalEmployees === 'function') {
                window.filterModalEmployees();
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            showToast('Xatolik: ' + error.message, 'error');
        }
    };
};

// Delete employee
window.deleteEmployee = async function (id) {
    if (confirm('Xodimni o\'chirmoqchimisiz?')) {
        try {
            showToast('O\'chirilmoqda...', 'info');
            await SmartUtils.fetchAPI(`/ hr / employees / ${id}`, {
                method: 'DELETE'
            });

            showToast('Xodim o\'chirildi!', 'success');
            await initHRData();
            filterEmployees();
            if (typeof window.filterModalEmployees === 'function') {
                window.filterModalEmployees();
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            showToast('Xatolik: ' + error.message, 'error');
        }
    }
};

// Close employee modal
window.closeEmployeeModal = function () {
    const modal = document.getElementById('employee-modal');
    if (modal) {
        modal.remove();
    }
    const overlay = document.getElementById('department-overlay');
    if (overlay && !document.querySelector('.department-window.active')) {
        overlay.classList.remove('active');
    }
};

// Initialize on load
// initHRData(); // Removed global invocation. Called via Auth check.

// The HR dashboard auto-render was removed because it was redundant (already handled in script.js)
// and caused the HR panel to appear at the bottom of all sections.


// E-Xodim Import Modal
window.openExodimImportModal = function () {
    const modal = document.createElement('div');
    modal.id = 'exodim-import-modal';
    modal.className = 'department-window';
    modal.style.cssText = 'z-index: 10050;';

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(135deg, #10b981, #059669);">
            <h2 class="department-name">
                <i class="fas fa-file-excel"></i> E-Xodim Integratsiyasi
            </h2>
            <button class="close-btn" onclick="closeExodimImportModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
                <div class="window-content" style="padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <style>
                        .import-zone {
                            border: 3px dashed rgba(16, 185, 129, 0.4);
                        border-radius: 16px;
                        padding: 60px 40px;
                        text-align: center;
                        background: rgba(16, 185, 129, 0.05);
                        cursor: pointer;
                        transition: all 0.3s ease;
                        margin-bottom: 30px;
                }
                        .import-zone:hover {
                            border - color: #10b981;
                        background: rgba(16, 185, 129, 0.1);
                        transform: translateY(-2px);
                }
                        .import-zone.dragover {
                            border - color: #10b981;
                        background: rgba(16, 185, 129, 0.15);
                        transform: scale(1.02);
                }
                        .import-icon {
                            font - size: 4rem;
                        color: #10b981;
                        margin-bottom: 20px;
                        animation: bounce 2s infinite;
                }
                        @keyframes bounce {
                            0 %, 100 % { transform: translateY(0); }
                    50% {transform: translateY(-10px); }
                }
                        .import-instructions {
                            background: rgba(0, 0, 0, 0.3);
                        border-radius: 12px;
                        padding: 20px;
                        margin-top: 20px;
                        border-left: 4px solid #10b981;
                }
                        .import-step {
                            display: flex;
                        align-items: flex-start;
                        gap: 15px;
                        margin-bottom: 15px;
                        padding: 12px;
                        background: rgba(255, 255, 255, 0.03);
                        border-radius: 8px;
                }
                        .step-number {
                            width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        flex-shrink: 0;
                }
                        .import-result {
                            display: none;
                        margin-top: 20px;
                        padding: 20px;
                        border-radius: 12px;
                        background: rgba(16, 185, 129, 0.1);
                        border: 2px solid #10b981;
                }
                        .result-stats {
                            display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                        margin-top: 15px;
                }
                        .result-stat {
                            text - align: center;
                        padding: 15px;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 8px;
                }
                        .result-stat-value {
                            font - size: 2rem;
                        font-weight: bold;
                        color: #10b981;
                }
                        .result-stat-label {
                            font - size: 0.85rem;
                        color: rgba(255, 255, 255, 0.7);
                        margin-top: 5px;
                }
                    </style>

                    <div class="import-zone" id="import-drop-zone" onclick="document.getElementById('excel-file-input').click()">
                        <div class="import-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 1.5rem;">Excel Faylni Yuklash</h3>
                        <p style="color: rgba(255, 255, 255, 0.7); margin: 0 0 15px 0;">
                            Faylni bu yerga sudrab tashlang yoki bosib tanlang
                        </p>
                        <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.9rem; margin: 0;">
                            Qo'llab-quvvatlanadigan formatlar: .xlsx, .xls, .csv
                        </p>
                        <input type="file" id="excel-file-input" accept=".xlsx,.xls,.csv" style="display: none;" onchange="handleExcelFile(this.files[0])">
                    </div>

                    <div class="import-instructions">
                        <h4 style="color: #10b981; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-info-circle"></i> Qanday ishlaydi?
                        </h4>

                        <div class="import-step">
                            <div class="step-number">1</div>
                            <div>
                                <strong style="color: #00c6ff;">E-Xodim tizimiga kiring</strong>
                                <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
                                    E-Xodim platformasiga login qiling
                                </p>
                            </div>
                        </div>

                        <div class="import-step">
                            <div class="step-number">2</div>
                            <div>
                                <strong style="color: #00c6ff;">Xodimlar ro'yxatini yuklab oling</strong>
                                <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
                                    "Export" yoki "Excel ga yuklash" tugmasini bosing
                                </p>
                            </div>
                        </div>

                        <div class="import-step">
                            <div class="step-number">3</div>
                            <div>
                                <strong style="color: #00c6ff;">Faylni bu yerga yuklang</strong>
                                <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
                                    Yuqoridagi maydonga faylni sudrab tashlang yoki tanlang
                                </p>
                            </div>
                        </div>

                        <div class="import-step">
                            <div class="step-number">4</div>
                            <div>
                                <strong style="color: #00c6ff;">Avtomatik import</strong>
                                <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
                                    Tizim avtomatik ravishda barcha xodimlarni bazaga qo'shadi
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="import-result" id="import-result">
                        <h4 style="color: #10b981; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-check-circle"></i> Import Muvaffaqiyatli!
                        </h4>
                        <div class="result-stats">
                            <div class="result-stat">
                                <div class="result-stat-value" id="result-total">0</div>
                                <div class="result-stat-label">Jami Yuklandi</div>
                            </div>
                            <div class="result-stat">
                                <div class="result-stat-value" id="result-new" style="color: #10b981;">0</div>
                                <div class="result-stat-label">Yangi Qo'shildi</div>
                            </div>
                            <div class="result-stat">
                                <div class="result-stat-value" id="result-updated" style="color: #f59e0b;">0</div>
                                <div class="result-stat-label">Yangilandi</div>
                            </div>
                            <div class="result-stat">
                                <div class="result-stat-value" id="result-errors" style="color: #ef4444;">0</div>
                                <div class="result-stat-label">Xatoliklar</div>
                            </div>
                        </div>
                        <button onclick="closeExodimImportModal(); filterEmployees();" style="width: 100%; margin-top: 20px; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">
                            <i class="fas fa-check"></i> Tayyor
                        </button>
                    </div>
                </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('department-overlay').classList.add('active');
    setTimeout(() => modal.classList.add('active'), 10);
};

window.closeExodimImportModal = function () {
    const modal = document.getElementById('exodim-import-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    document.getElementById('department-overlay').classList.remove('active');
};

// Handle Excel file processing
window.handleExcelFile = async function (file) {
    if (!file) return;

    // Check file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        SmartUtils.showToast("Iltimos, to'g'ri Excel fayl formatini tanlang (.xlsx, .xls, .csv)", "warning");
        return;
    }

    // Show loading
    const dropZone = document.getElementById('import-drop-zone');
    dropZone.innerHTML = `
        <div class="import-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <h3 style="color: #10b981; margin: 0;">Fayl o'qilmoqda...</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0;">${file.name}</p>
    `;

    // Check if XLSX is loaded
    if (typeof XLSX === 'undefined') {
        console.error('XLSX library not loaded');
        dropZone.innerHTML = `
            <div class="import-icon" style="color: #ef4444;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 style="color: #ef4444; margin: 0;">Xatolik: Kutubxona yuklanmagan</h3>
            <p style="color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0;">SheetJS (XLSX) kutubxonasi yuklanmagan. Iltimos, internet aloqasini tekshiring va sahifani yangilang.</p>
            <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; background:#3498db; border:none; color:white; border-radius:5px; cursor:pointer;">Sahifani yangilash</button>
        `;
        return;
    }

    try {
        // Read file
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // Read as array of arrays to find header row manually
                const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                if (!rows || rows.length === 0) {
                    throw new Error('Fayl bo\'sh yoki ma\'lumotlar topilmadi!');
                }

                // Header rowni qidirish (F.I.O, Ism, №, Tabel qidiramiz)
                let headerRowIndex = -1;
                for (let i = 0; i < Math.min(rows.length, 15); i++) {
                    const row = rows[i];
                    if (!row || !Array.isArray(row)) continue;
                    
                    const isHeader = row.some(cell => {
                        if (!cell) return false;
                        const c = cell.toString().toLowerCase();
                        return c.includes('f.i.o') || c.includes('фио') || c.includes('ism') || 
                               c.includes('tabel') || c.includes('lavozim') || c.includes('№');
                    });
                    
                    if (isHeader) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    console.warn('Header row topilmadi, 1-qatordan boshlaymiz');
                    headerRowIndex = 0;
                }

                // Headerlarni olish
                const rawHeaders = rows[headerRowIndex];
                const cleanHeaders = rawHeaders.map(h => (h || '').toString().trim());
                
                // Ma'lumotlarni obyektga o'girish
                const jsonData = [];
                for (let i = headerRowIndex + 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length === 0) continue;
                    
                    const obj = {};
                    let hasData = false;
                    cleanHeaders.forEach((header, idx) => {
                        if (header) {
                            obj[header] = row[idx];
                            if (row[idx] !== undefined && row[idx] !== null && row[idx] !== '') hasData = true;
                        }
                    });
                    
                    if (hasData) jsonData.push(obj);
                }

                // Process data
                if (jsonData && jsonData.length > 0) {
                    console.log(`Excel o'qildi: ${jsonData.length} ta xodim`, jsonData[0]);
                    
                    // Darhol jarayonni boshlaymiz (Default: Qo'shish / Append)
                    processExcelData(jsonData, file.name, false);
                } else {
                    throw new Error('Ma\'lumotlar topilmadi (Headerdan keyin qatorlar bo\'sh bo\'lishi mumkin)');
                }
            } catch (error) {
                console.error('Excel parsing error:', error);
                dropZone.innerHTML = `
                    <div class="import-icon" style="color: #ef4444;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="color: #ef4444; margin: 0;">Xatolik: ${error.message}</h3>
                    <p style="color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0;">Iltimos, faylni tekshirib qaytadan yuklang</p>
                    <button onclick="openExodimImportModal()" style="margin-top:20px; padding:10px 20px; background:#30363d; border:none; color:white; border-radius:5px; cursor:pointer;">Qaytadan urinish</button>
                `;
            }
        };
        reader.onerror = function(ex) {
            console.error('FileReader error:', ex);
            dropZone.innerHTML = `
                <div class="import-icon" style="color: #ef4444;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: #ef4444; margin: 0;">Faylni o'qishda xatolik</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0;">Brauzer faylni o'qiy olmadi.</p>
            `;
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        console.error('File reading error:', error);
        SmartUtils.showToast('Faylni o\'qishda kutilmagan xatolik: ' + error.message, "error");
    }
};

// Process Excel data and import employees
window.processExcelData = async function (jsonData, fileName, shouldClear = false) {
    const dropZone = document.getElementById('import-drop-zone');
    if (dropZone) {
        dropZone.innerHTML = `
            <div class="import-icon" style="color: #3498db;">
                <i class="fas fa-sync fa-spin"></i>
            </div>
            <h3 style="color: #3498db; margin: 0;">Ma'lumotlar saqlanmoqda...</h3>
            <p id="import-progress-text" style="color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0;">Tayyorlanmoqda...</p>
        `;
    }

    let newEmployees = [];
    let errorCount = 0;
    const total = jsonData.length;

    console.log(`Processing ${total} rows...`);

    jsonData.forEach((row, index) => {
        try {
            if (index % 50 === 0) {
                const progressText = document.getElementById('import-progress-text');
                if (progressText) progressText.innerText = `${index} / ${total} xodim tayyorlandi...`;
            }

            const columns = {};
            const keys = Object.keys(row);
            keys.forEach(key => {
                columns[key.toLowerCase().trim()] = row[key];
            });

            // Fuzzy column detection
            let name = '', position = '', department = '', phone = '', tabelNumber = '', birthday = '', hireDate = '', medicalDate = '', vacationStart = '';

            for (let key in columns) {
                const val = columns[key];
                if (val === undefined || val === null) continue;

                const k = key.toLowerCase().trim();
                if (k.includes('ism') || k.includes('f.i.o') || k.includes('ф.и.о') || k.includes('фио') || k.includes('имя') || k.includes('full name')) {
                    name = val.toString().trim();
                } else if (k.includes('lavozim') || k.includes('position') || k.includes('должность') || k.includes('штат')) {
                    position = val.toString().trim();
                } else if ((k.includes('bo') && (k.includes('lim') || k.includes('linma') || k.includes('бўлим') || k.includes('бўлинma'))) || k.includes('отдел') || k.includes('подразделение') || k.includes('структур') || k.includes('sex') || k.includes('сех')) {
                    department = val.toString().trim();
                } else if (k.includes('tel') || k.includes('phone') || k.includes('номер') || k.includes('телефон')) {
                    phone = val.toString().trim();
                } else if (k.includes('tabel') || k.includes('№') || k.includes('ident') || k.includes('id') || k.includes('пинфл') || k.includes('персонал')) {
                    tabelNumber = val.toString().trim();
                } else if (k.includes('tug') || k.includes('birth') || k.includes('рожде')) {
                    birthday = val.toString().trim();
                } else if (k.includes('ish') || k.includes('hire') || k.includes('прием')) {
                    hireDate = val.toString().trim();
                } else if (k.includes('tibbiy') || k.includes('medical') || k.includes('медиц')) {
                    medicalDate = val.toString().trim();
                } else if (k.includes('tatil') || k.includes('ta\'til') || k.includes('vacation') || k.includes('отпуск')) {
                    vacationStart = val.toString().trim();
                }
            }

            if (!name || name.trim() === '') {
                errorCount++;
                return;
            }

            // Normalize department name
            let normalizedDepartment = department || '';
            if (normalizedDepartment) {
                const deptStr = normalizedDepartment.toString().toLowerCase().trim();

                // Use regex for more accurate bo'linma/sex detection
                const boMatch = deptStr.match(/(\d+)\s*(-| )?\s*(bo['`‘’ʻl]inma|бўлинma|bo'lim|bolim|bo‘lim|boʻlim|bo’lim)/i) || deptStr.match(/^(\d+)$/);
                const sexMatch = deptStr.match(/(\d+)\s*(-| )?\s*(sex|сех)/i);

                if (boMatch) {
                    normalizedDepartment = boMatch[1] + "-bo'linma";
                } else if (sexMatch) {
                    normalizedDepartment = sexMatch[1] + "-sex";
                } else if (deptStr.includes('5-tarmoq') || deptStr.includes('kiyakit')) {
                    normalizedDepartment = "5-bo'linma";
                } else if (deptStr.includes('6-tarmoq') || deptStr.includes('qorlitog')) {
                    normalizedDepartment = "6-bo'linma";
                } else if (deptStr.includes('dispetcher')) {
                    normalizedDepartment = 'Dispetcher';
                } else if (deptStr.includes('buxgalter') || deptStr.includes('iqtisod')) {
                    normalizedDepartment = 'Buxgalteriya';
                } else if (deptStr.includes('xodim') || deptStr.includes('kadr')) {
                    normalizedDepartment = 'Xodimlar';
                } else if (deptStr.includes('xavfsizlik') || deptStr.includes('mehnat')) {
                    normalizedDepartment = 'Xavfsizlik';
                }
            }

            newEmployees.push({
                name,
                position: position || 'Xodim',
                department: normalizedDepartment || 'Noma\'lum',
                phone: phone || '',
                tabelNumber: tabelNumber || '',
                birthday: birthday || '',
                hireDate: hireDate || '',
                medicalDate: medicalDate || '',
                vacationStart: vacationStart || '',
                status: 'active'
            });
        } catch (error) {
            console.error('Row error:', error);
            errorCount++;
        }
    });

    // Loop tugagandan so'ng xabarni yangilash
    const progressText = document.getElementById('import-progress-text');
    if (progressText) progressText.innerText = `Barcha (${newEmployees.length}) xodimlar tayyorlandi. Bazaga saqlanmoqda...`;

    try {
        console.log('Sending data to server...', newEmployees.length);
        const response = await SmartUtils.fetchAPI('/hr/import-exodim', {
            method: 'POST',
            body: JSON.stringify({
                employees: newEmployees,
                clearFirst: shouldClear
            })
        });

        if (response) {
            // Update display
            const resultTotal = document.getElementById('result-total');
            if (resultTotal) resultTotal.innerText = jsonData.length;
            const resultNew = document.getElementById('result-new');
            if (resultNew) resultNew.innerText = newEmployees.length;
            const resultErrors = document.getElementById('result-errors');
            if (resultErrors) resultErrors.innerText = errorCount;

            const importResult = document.getElementById('import-result');
            if (importResult) importResult.style.display = 'block';
            const importInstructions = document.querySelector('.import-instructions');
            if (importInstructions) importInstructions.style.display = 'none';
            const importZone = document.getElementById('import-drop-zone');
            if (importZone) importZone.style.display = 'none';

            // Reload data
            await initHRData();
            if (typeof filterEmployees === 'function') filterEmployees();

            // Auto-close after success
            setTimeout(() => {
                const modal = document.getElementById('exodim-import-modal');
                if (modal) {
                    modal.style.opacity = '0';
                    modal.style.transform = 'scale(0.95)';
                    modal.style.transition = 'all 0.3s ease';
                    setTimeout(() => closeExodimImportModal(), 300);
                }
            }, 1500);
        } else {
            // Server javob bermadi yoki null qaytardi
            throw new Error('Server javob bermadi. Iltimos, tizimga qayta kirib urinib ko\'ring.');
        }
    } catch (e) {
        console.error('Import failed:', e);
        const dropZone = document.getElementById('import-drop-zone');
        if (dropZone) {
            dropZone.innerHTML = `
                <div class="import-icon" style="color: #ef4444;">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3 style="color: #ef4444; margin: 0;">Import xatoligi</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0;">${e.message || 'Serverga yuborishda xatolik yuz berdi'}</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; background:#3498db; border:none; color:white; border-radius:5px; cursor:pointer;">Qayta yuklash</button>
            `;
        }
    }
};

/**
 * Digital Application Submission logic
 */
window.openHRMurojaatWindow = async function (deptId) {
    let modal = document.getElementById('hr-murojaat-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hr-murojaat-modal';
        modal.className = 'department-window';
        modal.style.zIndex = '20005';
        document.body.appendChild(modal);
    }
    modal.style.zIndex = '20005'; // Ensure it is set even if modal already exists

    if (!window.hrData || !window.hrData.employees || window.hrData.employees.length === 0) {
        if (typeof window.initHRData === 'function') {
            await window.initHRData();
        }
    }

    let employees = [];
    if (window.hrData && window.hrData.employees && window.hrData.employees.length > 0) {
        employees = window.hrData.employees;
    } else {
        const savedHR = JSON.parse(localStorage.getItem('smart_pch_employees'));
        const legacyWorkers = JSON.parse(localStorage.getItem('smart_pch_workers')) || (window.INITIAL_DATA ? window.INITIAL_DATA.workers : null);
        
        if (savedHR && savedHR.length > 0) {
            employees = savedHR;
        } else if (legacyWorkers && legacyWorkers.length > 0) {
            employees = legacyWorkers.map(w => ({
                id: w.id || Date.now() + Math.random(),
                name: w.shaxs || w.name,
                full_name: w.shaxs || w.name,
                position: w.shtat || w.position,
                department: w.bolinma || w.department
            }));
        }
    }

    const { isSubdivisionUser, userBolinma } = checkHRSubdivisionUser();
    const targetDeptId = isSubdivisionUser ? userBolinma : deptId;

    const cleanDept = SmartUtils.normalizeBolinmaId(targetDeptId);
    const filteredEmployees = targetDeptId
        ? employees.filter(e => {
            const eDept = SmartUtils.normalizeBolinmaId(e.department || e.bolinmaId || e.bolinma || '');
            return eDept === cleanDept || eDept === targetDeptId; // Support both normalized and raw match
        })
        : employees;

    const employeeOptions = filteredEmployees.length > 0
        ? filteredEmployees.map(e => `<option value="${e.id}" data-name="${e.name}" data-position="${e.position}">${e.name} — ${e.position}</option>`).join('')
        : '<option value="">Xodimlar topilmadi</option>';

    modal.innerHTML = `
        <style>
            .premium-murojaat-content {
                background: radial-gradient(circle at top left, #0f172a, #020617) !important;
                backdrop-filter: blur(25px);
            }
            .murojaat-form-side {
                background: rgba(15, 23, 42, 0.8) !important;
                border: 1px solid rgba(148, 163, 184, 0.2) !important;
                box-shadow: 0 20px 50px rgba(0,0,0,0.6), inset 0 0 30px rgba(255,255,255,0.02);
                position: relative;
                overflow: hidden;
            }
            .glass-input-murojaat {
                background: rgba(2, 6, 23, 0.6) !important;
                border: 1px solid rgba(148, 163, 184, 0.2) !important;
                color: #f8fafc !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
            }
            .glass-input-murojaat:focus {
                border-color: #38bdf8 !important;
                background: rgba(2, 6, 23, 0.8) !important;
                box-shadow: 0 0 20px rgba(56, 189, 248, 0.15), inset 0 2px 4px rgba(0,0,0,0.3);
            }
            .form-label-premium {
                display: block;
                margin-bottom: 8px;
                color: #64748b;
                font-weight: 800;
                font-size: 0.7rem;
                text-transform: uppercase;
                letter-spacing: 1.5px;
            }
            .send-murojaat-btn {
                background: linear-gradient(135deg, #0ea5e9, #2563eb);
                color: white;
                border: none;
                padding: 18px;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                width: 100%;
            }
            .send-murojaat-btn:hover {
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 15px 35px rgba(37, 99, 235, 0.4);
                filter: brightness(1.1);
            }
            .send-murojaat-btn:active {
                transform: scale(0.98);
            }
        </style>
        <div class="window-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 1.5px solid rgba(148, 163, 184, 0.2); padding: 20px 35px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 class="department-name" style="font-size: 1.5rem; margin: 0; display: flex; align-items: center; gap: 15px; font-weight: 950; color: #f8fafc; letter-spacing: 2px; text-transform: uppercase;">
                <i class="fas fa-paper-plane" style="color: #38bdf8; filter: drop-shadow(0 0 8px rgba(56,189,248,0.4));"></i> Raqamli Murojaat Markazi
            </h2>
            <button class="close-btn" onclick="document.getElementById('hr-murojaat-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1.5px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s;">
                <i class="fas fa-times" style="font-size: 1.2rem;"></i>
            </button>
        </div>
        <div class="window-content premium-murojaat-content" style="padding: 25px !important; color: var(--text-primary); display: grid; grid-template-columns: 1.2fr 1fr; gap: 25px; font-family: 'Inter', sans-serif; height: calc(100% - 70px); box-sizing: border-box; overflow-y: hidden;">
            
            <!-- Chap tomon: Forma -->
            <div class="murojaat-form-side" style="border-radius: 20px; padding: 30px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; backdrop-filter: blur(15px);">
                <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 25px; font-size: 1.1rem; font-weight: 900; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 2px;">
                    <i class="fas fa-edit"></i> Ma'lumotlarni To'ldirish
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label class="form-label-premium"><i class="fas fa-user-tag" style="color: #38bdf8;"></i> Xodimni tanlang:</label>
                        <select id="murojaat-employee-select" class="glass-input-murojaat" data-bolinma="${targetDeptId || '1-bo\'linma'}" style="width: 100%; padding: 14px; border-radius: 12px; outline: none; font-weight: 600; appearance: none; cursor: pointer; font-size: 0.95rem;" onchange="updateMurojaatTemplate()">
                            <option value="" disabled selected>Ro'yxatdan tanlang...</option>
                            ${employeeOptions}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label-premium"><i class="fas fa-clipboard-list" style="color: #38bdf8;"></i> Murojaat turi:</label>
                        <select id="murojaat-type" class="glass-input-murojaat" style="width: 100%; padding: 14px; border-radius: 12px; outline: none; appearance: none; font-size: 0.95rem; font-weight: 600;" onchange="updateMurojaatTemplate()">
                            <option value="arza">Mehnat ta'tili uchun arza</option>
                            <option value="bildirishnoma">Bildirishnoma</option>
                            <option value="tushuntirish">Tushuntirish xati</option>
                            <option value="erkin">Erkin murojaat</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="flex: 1; display: flex; flex-direction: column;">
                    <label class="form-label-premium"><i class="fas fa-paragraph" style="color: #38bdf8;"></i> Murojaat matni:</label>
                    <textarea id="murojaat-text" class="glass-input-murojaat" style="width: 100%; flex: 1; padding: 25px; border-radius: 16px; outline: none; resize: none; font-family: 'Times New Roman', serif; font-size: 1.25rem; line-height: 1.7; text-align: justify;"></textarea>
                </div>
            </div>

            <!-- O'ng tomon: Tasdiqlash -->
            <div class="murojaat-auth-side" style="display: flex; flex-direction: column; gap: 20px; height: 100%;">
                
                <!-- Face ID -->
                <div id="face-id-section" style="flex: 1.2; background: rgba(30, 41, 59, 0.4); border: 1.5px solid rgba(148, 163, 184, 0.1); border-radius: 20px; padding: 25px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; backdrop-filter: blur(15px); position: relative;">
                    <h4 style="color: #38bdf8; margin-top: 0; margin-bottom: 20px; font-weight: 900; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px;"><i class="fas fa-fingerprint"></i> BIOMETRIK TASDIQ</h4>
                    
                    <div id="face-id-status" style="margin-bottom: 20px; flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; position: relative;">
                        <i id="face-icon-placeholder" class="fas fa-camera" style="font-size: 3.5rem; color: rgba(56, 189, 248, 0.3); filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.2));"></i>
                        
                        <div id="camera-container" style="display: none; position: relative; width: 160px; height: 160px; border-radius: 20px; overflow: hidden; border: 3px solid #38bdf8; box-shadow: 0 0 30px rgba(58, 190, 248, 0.3);">
                            <video id="face-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                            <div style="position: absolute; width: 100%; height: 4px; background: #38bdf8; top: 0; left: 0; animation: faceScanMove 2.5s infinite linear; z-index: 10; box-shadow: 0 0 15px #38bdf8;"></div>
                        </div>
                    </div>

                    <p id="face-id-text" style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 20px; font-weight: 500;">Shaxsingizni tasdiqlash uchun Face ID dan foydalaning</p>
                    
                    <button id="verify-face-btn" onclick="simulateFaceID()" style="padding: 14px 40px; background: rgba(56, 189, 248, 0.1); border: 1.5px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 12px; cursor: pointer; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                        <i class="fas fa-video"></i> TASDIQLASH
                    </button>
                    <input type="hidden" id="face-verified" value="false">
                </div>

                <!-- Imzo -->
                <div class="signature-section" style="flex: 1; background: rgba(30, 41, 59, 0.4); border: 1.5px solid rgba(148, 163, 184, 0.1); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; box-sizing: border-box; backdrop-filter: blur(15px);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="color: #f8fafc; margin: 0; font-weight: 900; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px;"><i class="fas fa-signature" style="color: #38bdf8;"></i> QO'LDA IMZO:</h4>
                        <button onclick="clearSignature()" style="background: rgba(239, 68, 68, 0.1); border: 1.5px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 0.7rem; font-weight: 800; transition: 0.3s;">
                            <i class="fas fa-eraser"></i> TOZALASH
                        </button>
                    </div>
                    <canvas id="signature-canvas" width="400" height="150" style="background: rgba(2, 6, 23, 0.8); border: 1.5px solid rgba(148, 163, 184, 0.1); border-radius: 12px; cursor: crosshair; width: 100%; flex: 1;"></canvas>
                </div>

                <!-- Tugmalar -->
                <div style="display: flex; gap: 15px; width: 100%;">
                    <button onclick="exportMurojaatToPDF()" id="pdf-murojaat-btn" style="flex: 1; padding: 18px; background: rgba(239, 68, 68, 0.1); border: 1.5px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 12px; cursor: pointer; font-weight: 900; font-size: 0.9rem; text-transform: uppercase; transition: all 0.3s;">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button id="submit-murojaat-btn" onclick="sendMurojaatToServer()" class="send-murojaat-btn" style="flex: 2.5;">
                        <i class="fas fa-paper-plane"></i> YUBORISH
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    updateMurojaatTemplate();
    initSignaturePad();
};

window.sendDirectMurojaat = async function () {
    const type = document.getElementById('murojaat-type-direct').value;
    const text = document.getElementById('murojaat-text-direct').value;
    const currentUser = window.Auth?.currentUser;

    if (!text.trim()) {
        return SmartUtils.showToast('Murojaat matnini yozing!', 'warning');
    }

    if (!currentUser) {
        return SmartUtils.showToast('Tizimga kirmagansiz!', 'error');
    }

    try {
        const payload = {
            murojaat_type: type,
            murojaat_text: text,
            employee_id: currentUser.id,
            employee_name: currentUser.name || currentUser.username,
            employee_position: currentUser.role === 'bolinma' ? 'Bo\'linma mas\'uli' : currentUser.role,
            bolinma_id: currentUser.bolinmalar ? currentUser.bolinmalar[0] : 'Noma\'lum',
            status: 'pending',
            created_at: new Date().toISOString()
        };

        const res = await SmartUtils.fetchAPI('/murojaat', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res) {
            SmartUtils.showToast('Murojaat rahbar (Salimov Sh.B) ga muvaffaqiyatli yo\'naltirildi!', 'success');
            document.getElementById('murojaat-text-direct').value = '';
        }
    } catch (e) {
        console.error('Direct Murojaat Error:', e);
        // Fallback to local storage if API fails
        const legacyMurojaat = JSON.parse(localStorage.getItem('smart_pch_murojaatlar') || '[]');
        legacyMurojaat.push({
            id: Date.now(),
            text: text,
            type: type,
            user: currentUser.username,
            date: new Date().toLocaleDateString(),
            status: 'pending'
        });
        localStorage.setItem('smart_pch_murojaatlar', JSON.stringify(legacyMurojaat));
        SmartUtils.showToast('Server bilan bog\'lanishda xatolik, lekin murojaat vaqtinchalik xotiraga saqlandi!', 'warning');
        document.getElementById('murojaat-text-direct').value = '';
    }
};

// Application Templates
function updateMurojaatTemplate() {
    const type = document.getElementById('murojaat-type').value;
    const textArea = document.getElementById('murojaat-text');
    const empSelect = document.getElementById('murojaat-employee-select');

    let user = { name: '[Ismingiz]', position: '[Lavozimingiz]' };

    // Tanlangan xodim ma'lumotlarini olish
    if (empSelect && empSelect.selectedIndex > 0) {
        const selectedOption = empSelect.options[empSelect.selectedIndex];
        user = {
            name: selectedOption.getAttribute('data-name'),
            position: selectedOption.getAttribute('data-position')
        };
    }

    const templates = {
        'arza': `\"Qorlitog' temir yo'l masofasi\" boshlig'i Salimov Sh.B.ga\n\n${user.position} ${user.name}dan\n\nARZA\n\nMen, ${user.name}, quyidagicha arz qilamanki, menga 2026-yilning ___-______ kunidan boshlab ____ ish kunidan iborat bo'lgan navbatdagi mehnat ta'tili berishingizni so'rayman.\n\nSana: ${new Date().toLocaleDateString()}\n\nXodim: ${user.name}`,
        'bildirishnoma': `\"Qorlitog' temir yo'l masofasi\" boshlig'i Salimov Sh.B.ga\n\n${user.position} ${user.name}dan\n\nBILDIRISHNOMA\n\nShu bilan sizga ma'lum qilamanki, [bu yerga bildirishnoma sababi yoziladi...]\n\nSana: ${new Date().toLocaleDateString()}\n\nXodim: ${user.name}`,
        'tushuntirish': `\"Qorlitog' temir yo'l masofasi\" boshlig'i Salimov Sh.B.ga\n\n${user.position} ${user.name}dan\n\nTUSHUNTIRISH XATI\n\nMen, ${user.name}, 2026-yil ___-_______ kunida yuz bergan [sabab] bo'yicha shuni ma'lum qilamanki, [tafsilotlar...]\n\nSana: ${new Date().toLocaleDateString()}\n\nXodim: ${user.name}`,
        'erkin': `\"Qorlitog' temir yo'l masofasi\" boshlig'i Salimov Sh.B.ga\n\n${user.position} ${user.name}dan\n\nMUROJAAT\n\n[Murojaat matni bu yerda...]\n\nSana: ${new Date().toLocaleDateString()}\n\nXodim: ${user.name}`
    };

    textArea.value = templates[type] || '';
}

// Signature Pad Logic
let signatureCanvas, signatureCtx, isHrDrawing = false;

function initSignaturePad() {
    signatureCanvas = document.getElementById('signature-canvas');
    if (!signatureCanvas) return;
    signatureCtx = signatureCanvas.getContext('2d');
    signatureCtx.strokeStyle = '#ffd700';
    signatureCtx.lineWidth = 3;
    signatureCtx.lineCap = 'round';

    function getMousePos(canvasDom, touchOrMouseEvent) {
        const rect = canvasDom.getBoundingClientRect();
        const clientX = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientX : touchOrMouseEvent.clientX;
        const clientY = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientY : touchOrMouseEvent.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    const startDrawing = (e) => {
        isHrDrawing = true;
        const pos = getMousePos(signatureCanvas, e);
        signatureCtx.beginPath();
        signatureCtx.moveTo(pos.x, pos.y);
        e.preventDefault();
    };

    const draw = (e) => {
        if (!isHrDrawing) return;
        const pos = getMousePos(signatureCanvas, e);
        signatureCtx.lineTo(pos.x, pos.y);
        signatureCtx.stroke();
        e.preventDefault();
    };

    const stopDrawing = () => {
        isHrDrawing = false;
        signatureCtx.closePath();
    };

    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);

    signatureCanvas.addEventListener('touchstart', startDrawing);
    signatureCanvas.addEventListener('touchmove', draw);
    signatureCanvas.addEventListener('touchend', stopDrawing);
}

window.clearSignature = function () {
    if (signatureCtx && signatureCanvas) {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
}

// Face ID Simulation with Camera
window.simulateFaceID = async function () {
    const empSelect = document.getElementById('murojaat-employee-select');
    if (!empSelect || empSelect.selectedIndex === 0 || !empSelect.value) {
        SmartUtils.showToast("Iltimos, avval xodimni ro'yxatdan tanlang!", 'error');
        empSelect.focus();
        empSelect.style.border = '1px solid #e74c3c';
        return;
    }

    const selectedOption = empSelect.options[empSelect.selectedIndex];
    const employeeName = selectedOption.getAttribute('data-name');

    const btn = document.getElementById('verify-face-btn');
    const statusDiv = document.getElementById('face-id-status');
    const text = document.getElementById('face-id-text');
    const section = document.getElementById('face-id-section');
    const cameraContainer = document.getElementById('camera-container');
    const placeholderIcon = document.getElementById('face-icon-placeholder');
    const video = document.getElementById('face-video');

    try {
        // Kamera ruxsatini so'rash
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300, facingMode: "user" } });

        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Skanerlanmoqda...`;

        // UI ni kameraga o'zgartirish
        if (placeholderIcon) placeholderIcon.style.display = 'none';
        if (cameraContainer) cameraContainer.style.display = 'block';
        if (video) video.srcObject = stream;

        text.innerHTML = `<strong>${employeeName}</strong> shaxsini aniqlash jarayoni...`;
        text.style.color = '#00c6ff';

        // Animatsiya uchun CSS qo'shish
        if (!document.getElementById('face-id-scan-style')) {
            const style = document.createElement('style');
            style.id = 'face-id-scan-style';
            style.innerHTML = `
                @keyframes faceScanMove {
                    0% { top: 0; opacity: 1; }
                    50% { top: 100%; opacity: 0.5; }
                    100% { top: 0; opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Skanerlash simulyatsiyasi (3.5 soniya)
        await new Promise(resolve => setTimeout(resolve, 3500));

        // Kameralarni o'chirish
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());

        if (cameraContainer) cameraContainer.style.display = 'none';
        statusDiv.innerHTML = '<i class="fas fa-check-circle" style="font-size: 5rem; color: #2ecc71; filter: drop-shadow(0 0 10px rgba(46,204,113,0.5));"></i>';

        text.innerHTML = `<i class="fas fa-check"></i> <strong>${employeeName}</strong> — Shaxs tasdiqlandi!`;
        text.style.color = '#2ecc71';
        btn.style.display = 'none';
        section.style.background = 'rgba(46, 204, 113, 0.1)';
        section.style.borderColor = '#2ecc71';
        document.getElementById('face-verified').value = 'true';

        // Xodim va turi tanlovini qulflash
        empSelect.disabled = true;
        document.getElementById('murojaat-type').disabled = true;

        SmartUtils.showToast(`${employeeName} muvaffaqiyatli tasdiqlandi!`, 'success');

    } catch (err) {
        console.error("Kameraga ulanishda xatolik:", err);
        SmartUtils.showToast("Kameraga ulanib bo'lmadi! Iltimos, ruxsat berilganini tekshiring.", 'error');
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.innerHTML = '<i class="fas fa-video"></i> Qaytadan urinish';
    }
}

// Export to PDF
window.exportMurojaatToPDF = function () {
    const text = document.getElementById('murojaat-text').value;
    const isVerified = document.getElementById('face-verified').value === 'true';
    const signatureBase64 = signatureCanvas.toDataURL();

    // Check if drawing is empty (simple check)
    const blank = document.createElement('canvas');
    blank.width = signatureCanvas.width;
    blank.height = signatureCanvas.height;
    if (signatureCanvas.toDataURL() === blank.toDataURL()) {
        SmartUtils.showToast('Iltimos, imzo qo\'ying!', 'warning');
        return;
    }

    if (!isVerified) {
        SmartUtils.showToast('Iltimos, Face ID orqali shaxsingizni tasdiqlang!', 'warning');
        return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
        <div style="font-family: 'Times New Roman', serif; padding: 40px; color: black; line-height: 1.6;">
            <div style="white-space: pre-wrap; margin-bottom: 50px; font-size: 14pt;">
                ${text}
            </div>
            
            <div style="margin-top: 100px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <div style="color: #2ecc71; font-weight: bold; font-size: 10pt; margin-bottom: 10px;">
                        <img src="https://cdn-icons-png.flaticon.com/512/3642/3642651.png" style="width: 20px; vertical-align: middle;"> Face ID Verified (Tasdiqlangan)
                    </div>
                    <div style="font-size: 9pt; color: #666;">
                        Sana: ${new Date().toLocaleString()}
                    </div>
                    <div style="margin-top: 5px;">
                        <img src="${signatureBase64}" style="width: 150px; height: auto; border-bottom: 1px solid black;">
                        <div style="font-size: 10pt;">(Xodim imzosi)</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="width: 100px; height: 100px; border: 2px solid #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #ccc;">
                        M.U. (QR-KOD)
                    </div>
                </div>
            </div>
        </div>
    `;

    SmartUtils.exportToPDF(tempDiv, 'Murojaat', { title: 'ELEKTRON MUROJAAT' });
}

window.sendMurojaatToServer = async function () {
    const type = document.getElementById('murojaat-type').value;
    const text = document.getElementById('murojaat-text').value;
    const isVerified = document.getElementById('face-verified').value === 'true';
    const empSelect = document.getElementById('murojaat-employee-select');

    let user = window.Auth?.currentUser || { name: 'Noma\'lum', position: 'Xodim', department: '1-bo\'linma' };
    let employeeId = user.id || null;

    // Tanlangan xodim ma'lumotlarini olish
    if (empSelect && empSelect.selectedIndex > 0) {
        const selectedOption = empSelect.options[empSelect.selectedIndex];
        employeeId = empSelect.value;
        user = {
            name: selectedOption.getAttribute('data-name'),
            position: selectedOption.getAttribute('data-position'),
            department: empSelect.getAttribute('data-bolinma') || '1-bo\'linma'
        };
    }

    if (!isVerified) {
        SmartUtils.showToast('Iltimos, Face ID orqali tasdiqlang!', 'warning');
        return;
    }

    const signatureCanvas = document.getElementById('signature-canvas');
    const signature = signatureCanvas ? signatureCanvas.toDataURL() : null;

    const payload = {
        employee_id: employeeId,
        employee_name: user.name,
        employee_position: user.position,
        bolinma_id: user.department,
        murojaat_type: type === 'arza' ? 'Mehnat ta\'tili' : (type === 'bildirishnoma' ? 'Bildirishnoma' : (type === 'tushuntirish' ? 'Tushuntirish xati' : 'Erkin murojaat')),
        murojaat_text: text,
        signature_data: signature,
        face_verified: isVerified ? 1 : 0
    };

    try {
        const result = await SmartUtils.fetchAPI('/murojaat', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (result) {
            SmartUtils.showToast('Murojaat kadrlar bo\'limiga muvaffaqiyatli yuborildi!', 'success');
            
            // Modalni yopish
            const modal = document.getElementById('hr-murojaat-modal');
            if (modal) modal.classList.remove('active');
            
            // Agar Admin panelsak, listni yangilash
            if (window.loadAdminMurojaatlar) window.loadAdminMurojaatlar();
        }
    } catch (e) {
        console.error('Murojaat yuborishda xatolik:', e);
        
        // Offline/Error fallback to localStorage
        let localMurojaatlar = JSON.parse(localStorage.getItem('hr_murojaatlar')) || [];
        localMurojaatlar.push({ ...payload, id: Date.now(), status: 'pending_sync' });
        localStorage.setItem('hr_murojaatlar', JSON.stringify(localMurojaatlar));
        
        SmartUtils.showToast('Serverga bog\'lanib bo\'lmadi. Murojaat qurilmada saqlandi va aloqa tiklangach yuboriladi.', 'warning');
        
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
        modal.style.zIndex = '20005';
        document.body.appendChild(modal);
    }
    modal.style.zIndex = '20005'; // Ensure it is set even if modal already exists
    
    modal.innerHTML = `
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
    `;
    modal.classList.add('active');

    try {
        const murojaatlar = await SmartUtils.fetchAPI('/murojaat');
        
        const { isSubdivisionUser, userBolinmalar } = checkHRSubdivisionUser();
        
        let filtered = [];
        let title = "";
        let btnColor = "";
        
        if (isSubdivisionUser) {
            filtered = murojaatlar.filter(m => {
                const mBol = String(m.bolinma_id || '').toLowerCase().trim();
                const mNum = extractBolinmaNum(mBol);
                return userBolinmalar.some(b => {
                    const bStr = String(b).toLowerCase().trim();
                    const bNum = extractBolinmaNum(bStr);
                    if (bNum && mNum && bNum === mNum) return true;
                    return mBol.includes(bStr) || bStr.includes(mBol);
                });
            });
            title = "Bo'linma Murojaatlari";
            btnColor = "linear-gradient(135deg, #10b981, #059669)";
        } else if (userRole === 'admin') {
            filtered = murojaatlar.filter(m => m.status === 'pending');
            title = "Tasdiqlash uchun (Boshliqda)";
            btnColor = "linear-gradient(135deg, #d4af37, #b8860b)";
        } else {
            // HR sees all pending too or completed, but let's show all pending
            filtered = murojaatlar.filter(m => m.status === 'pending');
            title = "Kelgan Murojaatlar";
            btnColor = "linear-gradient(135deg, #10b981, #059669)";
        }

        const container = document.getElementById('murojaat-inbox-content');
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; border: 1px dashed rgba(255,255,255,0.2); border-radius: 20px;">
                    <i class="fas fa-envelope-open" style="font-size: 3rem; color: rgba(255,255,255,0.2); margin-bottom: 15px; display:block;"></i>
                    <h3 style="color: #cbd5e1;">Hozircha murojaatlar yo'q</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(m => `
            <div style="background: rgba(30, 41, 59, 0.6); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: 0.3s;" onmouseover="this.style.borderColor='#38bdf8'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <strong style="font-size: 1.1rem; color: white;">${m.employee_name || 'Noma\'lum'} (${m.employee_position || ''})</strong>
                    <span style="font-size: 0.8rem; color: #94a3b8;"><i class="fas fa-clock"></i> ${new Date(m.created_at).toLocaleString('uz-UZ')}</span>
                </div>
                <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 15px;">
                    <i class="fas fa-building" style="color: #d4af37;"></i> ${m.bolinma_id} <span style="margin: 0 10px;">|</span> <i class="fas fa-file-alt" style="color: #3b82f6;"></i> ${m.murojaat_type}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="viewMurojaatDetails(${m.id})" style="flex: 1; padding: 12px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                        <i class="fas fa-eye"></i> KO'RISH
                    </button>
                    ${userRole === 'admin' ? `
                        <button onclick="approveMurojaatByAdmin(${m.id})" style="flex: 2; padding: 12px; background: ${btnColor}; border: none; color: white; border-radius: 10px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
                            <i class="fas fa-check"></i> TASDIQLASH (VIZA)
                        </button>
                        <button onclick="rejectMurojaatByAdmin(${m.id})" style="flex: 1; padding: 12px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; border-radius: 10px; font-weight: bold; cursor: pointer;">
                            <i class="fas fa-times"></i> RAD ETISH
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error('Inbox yuklashda xato:', e);
        document.getElementById('murojaat-inbox-content').innerHTML = `<p style="color:red; text-align:center;">Ma'lumotlarni yuklashda xatolik yuz berdi.</p>`;
    }
}

window.approveMurojaatByAdmin = function (id) {
    let modal = document.createElement('div');
    modal.id = 'admin-visa-modal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.9); z-index:20005; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); font-family: "Inter", sans-serif;';
    
    modal.innerHTML = `
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
                    <button onclick="finalizeAdminVisa('${id}')" style="flex: 2; padding: 15px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(16,185,129,0.4);">
                        <i class="fas fa-check-double"></i> Tasdiqlash
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.rejectMurojaatByAdmin = async function (id) {
    if (confirm("Ushbu murojaatni rad etishni tasdiqlaysizmi?")) {
        try {
            await SmartUtils.fetchAPI(`/murojaat/${id}/reject`, {
                method: 'PATCH',
                body: JSON.stringify({ manager_name: window.Auth?.currentUser?.name || 'Rahbar' })
            });
            SmartUtils.showToast('Murojaat rad etildi!', 'success');
            openHRMurojaatInboxModal(); // Refresh modal
        } catch (e) {
            SmartUtils.showToast("Xatolik", 'error');
        }
    }
}

window.finalizeAdminVisa = async function (id) {
    const visaText = document.getElementById('admin-visa-text').value;
    const managerName = window.Auth?.currentUser?.name || 'Rahbar';
    
    try {
        await SmartUtils.fetchAPI(`/murojaat/${id}/approve`, {
            method: 'PATCH',
            body: JSON.stringify({ manager_name: managerName, manager_comment: visaText })
        });
        
        SmartUtils.showToast('Murojaat korxona rahbari tomonidan tasdiqlandi!', 'success');
        document.getElementById('admin-visa-modal').remove();
        
        // Refresh the inbox list
        openHRMurojaatInboxModal();
        
    } catch (e) {
        SmartUtils.showToast("Tasdiqlashda xatolik yuz berdi", 'error');
    }
}

window.viewMurojaatDetails = async function (id) {
    try {
        const m = await SmartUtils.fetchAPI(`/murojaat/${id}`);
        if (!m) return;
        
        let preview = document.createElement('div');
        preview.id = 'murojaat-preview-modal';
        preview.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:20002; display:flex; align-items:center; justify-content:center;';
        preview.innerHTML = `
            <div style="background:#1e293b; width:600px; padding:30px; border-radius:20px; border:1px solid rgba(255,255,255,0.1); color:white; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                    <h3 style="margin:0"><i class="fas fa-file-alt"></i> Murojaat tafsilotlari - ${m.murojaat_type}</h3>
                    <button onclick="document.getElementById('murojaat-preview-modal').remove()" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                <div style="background:white; color:black; padding:30px; border-radius:10px; font-family:'Times New Roman', serif; line-height:1.6; font-size:14pt; margin-bottom:20px; white-space:pre-wrap; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    ${m.murojaat_text}
                    
                    <div style="margin-top:40px; border-top:1px solid #ddd; padding-top:20px; display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <div style="color: ${m.face_verified ? '#27ae60' : '#e74c3c'}; font-weight: bold; font-size: 10pt;">
                                <i class="fas ${m.face_verified ? 'fa-check-circle' : 'fa-times-circle'}"></i> Face ID ${m.face_verified ? 'bilan tasdiqlangan' : 'mavjud emas'}
                            </div>
                            ${m.signature_data ? `<img src="${m.signature_data}" style="max-height: 70px; display:block; margin-top:10px; border-bottom: 1px solid #333;">` : ''}
                            <div style="font-size:10pt; color: #333; margin-top: 5px;">(${m.employee_name}) imzosi</div>
                        </div>
                    </div>

                    ${m.status === 'approved' ? `
                    <div style="margin-top:30px; background: rgba(56, 189, 248, 0.05); border: 2px solid #38bdf8; border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
                        <h4 style="color: #0369a1; margin: 0 0 10px 0; font-family: 'Inter', sans-serif;"><i class="fas fa-gavel"></i> KORXONA RAHBARI VIZASI</h4>
                        <p style="font-weight: bold; font-size: 1.1rem; color: #0f172a; margin-bottom: 15px; font-style: italic;">"${m.manager_comment}"</p>
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #cbd5e1; padding-top: 15px;">
                            <div>
                                <span style="font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #64748b; font-weight: bold;">TASDIQLANDI (ERI)</span><br>
                                <span style="font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #94a3b8;">Sana: ${new Date(m.approved_date).toLocaleString()}</span>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.9rem; color: #000; font-family: 'Inter', sans-serif; font-weight: bold; margin-top: 5px;">${m.manager_name}</div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 10px;">
                     <button onclick="document.getElementById('murojaat-preview-modal').remove()" style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); border: none; color: white; border-radius: 10px; cursor: pointer;">Yopish</button>
                </div>
            </div>
        `;
        document.body.appendChild(preview);
    } catch (e) {
        console.error(e);
        SmartUtils.showToast("Murojaat yuklanmadi", 'error');
    }
}

window.forwardMurojaatToAdmin = function (id) {
    // Disabled as both HR and Admin use the centralized inbox
}

// End of HR module
console.log('✅ HR Module Loaded');

/**
 * Standardized renderer for the main Dashboard integration
 */
window.renderHRSection = function(container, departmentId) {
    container.innerHTML = `
        <div class="hr-section-wrapper" style="padding: 20px; animation: fadeIn 0.5s ease;">
            ${renderHRDashboard('all')}
        </div>
    `;
    
    // Any post-render initialization if needed
    console.log('HR Section Rendered for:', departmentId);
};

/**
 * Custom Modal for scrollable employees list (restricted to subdivision for subdivision users)
 */
window.openEmployeesListModal = function() {
    let modal = document.getElementById('hr-employees-list-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hr-employees-list-modal';
        modal.className = 'department-window';
        document.body.appendChild(modal);
    }
    modal.style.zIndex = '20005';

    const { isSubdivisionUser, userBolinma } = checkHRSubdivisionUser();
    const currentUser = window.Auth?.currentUser || window.currentUser;
    const activeDeptNum = extractBolinmaNum(window.hrCurrentDeptId);
    let currentDept = 'all';
    if (activeDeptNum) {
        if (window.hrCurrentDeptId.includes('sex')) {
            currentDept = `${activeDeptNum}-sex`;
        } else {
            currentDept = `${activeDeptNum}-bo'linma`;
        }
    } else if (window.hrCurrentDeptId === 'dispetcher') {
        currentDept = 'dispetcher';
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #ffd700; padding: 15px 30px;">
            <h2 class="department-name" style="color: #f8fafc; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-users" style="color: #ffd700; filter: drop-shadow(0 0 5px rgba(255,215,0,0.5));"></i> 
                XODIMLAR RO'YXATI ${isSubdivisionUser ? `(${userBolinma})` : ''}
            </h2>
            <div style="display: flex; gap: 10px; align-items: center;">
                ${!isSubdivisionUser || currentUser?.role === 'master' || currentUser?.role === 'bolinma' ? `
                <button onclick="openAddEmployeeModal()" class="ts-btn ts-btn-success" style="background: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-user-plus"></i> Yangi Qo'shish
                </button>
                ` : ''}
                <button class="close-btn" onclick="document.getElementById('hr-employees-list-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="window-content" style="background: radial-gradient(circle at top left, #0f172a, #020617); padding: 30px; height: calc(100% - 70px); box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; flex-wrap: wrap;">
                <div style="position: relative; flex-grow: 1; max-width: 400px;">
                    <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.3);"></i>
                    <input type="text" id="hr-modal-search" placeholder="Ism yoki lavozim bo'yicha qidirish..." style="width: 100%; padding: 12px 15px 12px 45px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 14px; outline: none; transition: 0.3s;" onkeyup="window.filterModalEmployees()">
                </div>
                ${!isSubdivisionUser ? `
                <div style="flex-grow: 1; max-width: 300px;">
                    <select id="hr-modal-dept-filter" onchange="window.filterModalEmployees()" style="width: 100%; padding: 12px 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 14px; outline: none;">
                        <option value="all" ${currentDept === 'all' ? 'selected' : ''}>Barcha bo'limlar</option>
                        <option value="1-bo'linma" ${currentDept === "1-bo'linma" ? 'selected' : ''}>1-bo'linma</option>
                        <option value="2-bo'linma" ${currentDept === "2-bo'linma" ? 'selected' : ''}>2-bo'linma</option>
                        <option value="3-bo'linma" ${currentDept === "3-bo'linma" ? 'selected' : ''}>3-bo'linma</option>
                        <option value="4-bo'linma" ${currentDept === "4-bo'linma" ? 'selected' : ''}>4-bo'linma</option>
                        <option value="5-bo'linma" ${currentDept === "5-bo'linma" ? 'selected' : ''}>5-bo'linma</option>
                        <option value="6-bo'linma" ${currentDept === "6-bo'linma" ? 'selected' : ''}>6-bo'linma</option>
                        <option value="7-bo'linma" ${currentDept === "7-bo'linma" ? 'selected' : ''}>7-bo'linma</option>
                        <option value="8-bo'linma" ${currentDept === "8-bo'linma" ? 'selected' : ''}>8-bo'linma</option>
                        <option value="9-bo'linma" ${currentDept === "9-bo'linma" ? 'selected' : ''}>9-bo'linma</option>
                        <option value="11-sex" ${currentDept === "11-sex" ? 'selected' : ''}>11-sex</option>
                        <option value="12-sex" ${currentDept === "12-sex" ? 'selected' : ''}>12-sex</option>
                        <option value="16-sex" ${currentDept === "16-sex" ? 'selected' : ''}>16-sex</option>
                        <option value="17-sex" ${currentDept === "17-sex" ? 'selected' : ''}>17-sex</option>
                        <option value="dispetcher" ${currentDept === "dispetcher" ? 'selected' : ''}>Dispetcher</option>
                    </select>
                </div>
                ` : ''}
                <div style="display: flex; gap: 10px;">
                    <button onclick="SmartUtils.exportToPDF('hr-modal-table-content', 'Xodimlar_Royxati')" class="btn-primary" style="padding: 10px 20px; font-size: 0.8rem;">
                        <i class="fas fa-file-pdf"></i> PDF Eksport
                    </button>
                </div>
            </div>
            
            <div style="flex: 1; overflow-y: auto; border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; background: rgba(15, 23, 42, 0.4); padding: 15px; max-height: calc(100vh - 220px);">
                <div id="hr-modal-table-content">
                    <!-- Table content -->
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    window.filterModalEmployees();
};

window.filterModalEmployees = function() {
    const searchVal = document.getElementById('hr-modal-search')?.value || '';
    const deptSelect = document.getElementById('hr-modal-dept-filter');
    const container = document.getElementById('hr-modal-table-content');
    if (!container) return;

    const { isSubdivisionUser } = checkHRSubdivisionUser();
    
    // Determine the department filter
    let filterDept = isSubdivisionUser ? '' : (deptSelect ? deptSelect.value : '');
    if (!isSubdivisionUser && !deptSelect && window.hrCurrentDeptId) {
        const activeDeptNum = extractBolinmaNum(window.hrCurrentDeptId);
        if (activeDeptNum) {
            filterDept = window.hrCurrentDeptId.includes('sex') ? `${activeDeptNum}-sex` : `${activeDeptNum}-bo'linma`;
        } else if (window.hrCurrentDeptId === 'dispetcher') {
            filterDept = 'dispetcher';
        }
    }
    if (filterDept === 'all') filterDept = '';

    container.innerHTML = renderEmployeeTable(searchVal, filterDept);
};
