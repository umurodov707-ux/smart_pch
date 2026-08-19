/**
 * SUBDIVISION PRODUCTION MODULE v1.0
 * Bo'linma darajasidagi ishlab chiqarishni boshqarish
 */

window.initSubdivisionProduction = function(bolinmaId) {
    console.log("Initializing Subdivision Production for", bolinmaId);
};

window.openDailyRepairLog = function(bolinmaId) {
    if (window.SmartUtils) window.SmartUtils.showToast("Kundalik ta'mirlash jurnali yuklanmoqda...", "info");
    alert("Kundalik ta'mirlash jurnali moduli tez kunda ishga tushadi!");
};

window.openInventoryStatus = function(bolinmaId) {
    const modal = document.createElement('div');
    modal.className = 'integration-window active';
    modal.style.zIndex = '200000';
    
    modal.innerHTML = `
        <div class="window-header" style="background: #0f172a; padding: 15px 25px;">
            <h2 style="margin:0; font-size:1.2rem;"><i class="fas fa-boxes" style="color:#1abc9c;"></i> BO'LINMA OMBOR HOLATI</h2>
            <button onclick="this.closest('.integration-window').remove()" style="background:none; border:none; color:#fff; cursor:pointer;"><i class="fas fa-times"></i></button>
        </div>
        <div class="window-content" style="padding:25px; background:#070b14; color:#fff;">
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px;">
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; border-left:4px solid #3498db;">
                    <div style="font-size:0.7rem; color:#94a3b8;">RELS (R-65)</div>
                    <div style="font-size:1.5rem; font-weight:900;">12 ta</div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; border-left:4px solid #1abc9c;">
                    <div style="font-size:0.7rem; color:#94a3b8;">SHPAL (BETON)</div>
                    <div style="font-size:1.5rem; font-weight:900;">85 ta</div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; border-left:4px solid #f1c40f;">
                    <div style="font-size:0.7rem; color:#94a3b8;">IZOSTIK TO'PLAMI</div>
                    <div style="font-size:1.5rem; font-weight:900;">6 ta</div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; border-left:4px solid #e67e22;">
                    <div style="font-size:0.7rem; color:#94a3b8;">BOLTLAR (KOMPLEKT)</div>
                    <div style="font-size:1.5rem; font-weight:900;">240 ta</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// REDIRECT TO PREMIUM PLET MODULE
window.openPletlarHisobiWindow = function(bolinmaId) {
    // If unified dashboard is open, just switch tab
    if (document.getElementById('production-unified-dashboard')) {
        if (window.switchProdTab) window.switchProdTab('plets');
        return;
    }

    if (window.PletsModule) {
        window.PletsModule.open(bolinmaId);
    } else {
        alert("Pletlar moduli topilmadi.");
    }
};
