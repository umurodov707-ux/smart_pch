
/**
 * SMART PCH - Integrated Plets Management
 * Dedicated view for rail strings within the Production department.
 */

(function () {
    let currentBolinmaId = 'all';

    window.openProductionDashboard = async function (bolinmaId) {
        currentBolinmaId = bolinmaId || 'all';

        const bolinmaName = currentBolinmaId === 'all' ? 'UMUMIY DASHBORD' :
            (typeof window.getBolinmaName === 'function' ? window.getBolinmaName(currentBolinmaId) : currentBolinmaId);

        const modalId = 'production-unified-dashboard';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'integration-window active';
        modal.style.zIndex = '200000';
        modal.style.border = '1px solid rgba(212, 175, 55, 0.2)';
        modal.style.boxShadow = '0 0 80px rgba(0,0,0,0.8)';
        modal.style.background = '#0f172a';

        const canSwitch = window.currentUser && (window.currentUser.role === 'admin' || window.currentUser.role === 'dispatcher');

        modal.innerHTML = `
        <div class="window-header" style="background: rgba(15, 23, 42, 0.9); border-bottom: 2px solid var(--accent-gold); padding: 20px 30px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:20px;">
                <div style="width:48px; height:48px; border-radius:14px; background:var(--gold-gradient); display:flex; align-items:center; justify-content:center; font-size:1.4rem; color:#000;">
                    <i class="fas fa-ruler-combined"></i>
                </div>
                <div>
                    <h2 style="margin:0; font-size:1.4rem; font-weight:900; background:var(--gold-gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">${bolinmaName.toUpperCase()}</h2>
                    <div style="font-size:0.75rem; color:#94a3b8; font-weight:700; margin-top:2px;">ISHLAB CHIQARISH: PLETLAR HISOBI</div>
                </div>
            </div>
            <div style="display:flex; gap:15px; align-items:center;">
                ${canSwitch ? `
                <select onchange="window.openProductionDashboard(this.value)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px 15px; border-radius:10px; cursor:pointer; outline:none;">
                    <option value="all" ${currentBolinmaId === 'all' ? 'selected' : ''}>Barcha bo'linmalar</option>
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="bolinma${n}" ${currentBolinmaId === `bolinma${n}` ? 'selected' : ''}>${n}-bo'linma</option>`).join('')}
                </select>
                ` : `<div style="color:#ffd700; font-weight:800; font-size:0.8rem; background:rgba(212,175,55,0.1); padding:8px 15px; border-radius:10px; border:1px solid rgba(212,175,55,0.2);"><i class="fas fa-lock"></i> CHEKLANGAN KIRISH</div>`}
                <div class="close-window" onclick="this.closest('.integration-window').remove()" style="width:40px; height:40px; border-radius:12px; background:rgba(239,68,68,0.1); color:#ef4444; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        </div>

        <div class="window-content" id="prod-tab-content" style="padding: 0; background: #0f172a; flex: 1; overflow: hidden;">
            <!-- Plets module will be rendered here -->
            <div style="padding:100px; text-align:center; color:#38bdf8;">
                <i class="fas fa-circle-notch fa-spin" style="font-size:2rem; margin-bottom:15px; display:block;"></i>
                YUKLANMOQDA...
            </div>
        </div>
        `;

        document.body.appendChild(modal);

        // Immediately render Plets
        if (window.PletsModule && window.PletsModule.renderInContainer) {
            window.PletsModule.renderInContainer(document.getElementById('prod-tab-content'), currentBolinmaId);
        }
    };

    window.refreshProductionDashboard = function () {
        if (window.openProductionDashboard) window.openProductionDashboard(currentBolinmaId);
    };

    // Compatibility for legacy calls
    window.switchProdTab = function (tab) {
        window.refreshProductionDashboard();
    };

})();
