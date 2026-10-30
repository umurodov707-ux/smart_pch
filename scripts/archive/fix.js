const fs = require('fs');
const file = 'd:\\\\расм\\\\public\\\\js\\\\pu74.js';
let content = fs.readFileSync(file, 'utf8');

const anchor = '    filtered.forEach(n => {';
const index = content.indexOf(anchor);

const correctEnding = `    filtered.forEach(n => {
        html += \`
            <div onclick="selectPU74Norm('\${n.id}')" style="padding:15px; border:1px solid #e2e8f0; margin-bottom:10px; border-radius:8px; cursor:pointer; transition:all 0.2s; background:white;" onmouseover="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 4px 6px -1px rgba(59,130,246,0.1)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                <div style="font-weight:bold; color:#1e293b; font-size:14px; margin-bottom:5px;">\${n.name}</div>
                <div style="display:flex; gap:15px; font-size:12px; color:#64748b;">
                    <span><i class="fas fa-hashtag"></i> \${n.paragraph}</span>
                    <span><i class="fas fa-ruler-combined"></i> \${n.unit}</span>
                    <span style="color:#10b981; font-weight:bold;"><i class="fas fa-clock"></i> Норма: \${n.norm}</span>
                </div>
            </div>
        \`;
    });
    listDiv.innerHTML = html;
}

window.selectPU74Norm = function(id) {
    try {
        if (!window.PU74_NORMS_DB) return;
        const norm = window.PU74_NORMS_DB.find(n => n.id === id);
        if (!norm) return;

        const R = activePU74NormRow;
        if (R === -1) return;

        console.log("Applying norm:", norm, "to row:", R);

        // Close modal immediately so UI doesn't freeze
        closePU74NormsModal();

        const key2 = pu74ActiveSheet + '_' + R + '_2';
        const key3 = pu74ActiveSheet + '_' + R + '_3';
        const key4 = pu74ActiveSheet + '_' + R + '_4';

        pu74EditedCells[key2] = norm.name;
        pu74EditedCells[key3] = norm.unit;
        pu74EditedCells[key4] = norm.paragraph + '\\nНорма: ' + norm.norm;

        // Save to local storage
        if (typeof pu74CurrentFile !== 'undefined') {
            localStorage.setItem('pu74_edits_' + pu74CurrentFile, JSON.stringify(pu74EditedCells));
        }

        // Re-render in timeout to prevent UI blocking
        setTimeout(() => {
            renderPU74Sheet(pu74ActiveSheet);
            if (window.SmartUtils) window.SmartUtils.showToast('Норма успешно применена!', 'success');
        }, 50);
    } catch(e) {
        console.error("Error applying norm:", e);
        closePU74NormsModal();
    }
};

// Tooltip functionality for PU-74 Date Headers
window.showPU74WarningTooltip = function(td, dayNum) {
    if (!pu74Warnings) return;

    let yearMonth = '';
    const match = window.location.href.match(/(\\d{4}-\\d{2})/);
    if (match) {
        yearMonth = match[1];
    } else {
        const ymMatch = String(typeof pu74CurrentFile !== 'undefined' ? pu74CurrentFile : '').match(/_(\\d{4})_(\\d{2})/);
        if (ymMatch) yearMonth = ymMatch[1] + '-' + ymMatch[2];
    }
    
    if (!yearMonth) {
        const d = new Date();
        yearMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    }

    const targetDate = \`\${yearMonth}-\${String(dayNum).padStart(2, '0')}\`;
    let activeWarnings = [];
    if (pu74Warnings.length > 0) {
        activeWarnings = pu74Warnings.filter(w => {
            if (!w || !w.start_date) return false;
            const start = String(w.start_date).substring(0, 10);
            const end = w.end_date ? String(w.end_date).substring(0, 10) : start;
            return targetDate >= start && targetDate <= end;
        });
    }

    let tooltip = document.getElementById('pu74-custom-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'pu74-custom-tooltip';
        tooltip.style.cssText = 'position:fixed; background:#1e293b; color:white; padding:15px; border-radius:10px; font-size:13px; z-index:999999; box-shadow:0 10px 25px -5px rgba(0,0,0,0.5); pointer-events:none; max-width:320px; transition:opacity 0.2s, transform 0.2s; opacity:0; border: 1px solid #334155; transform: translate(-50%, -100%) scale(0.95);';
        document.body.appendChild(tooltip);
    }

    let html = \`<div style="font-weight:bold; margin-bottom:12px; border-bottom:1px solid #334155; padding-bottom:8px; color:#94a3b8; display:flex; justify-content:space-between; align-items:center;">
        <span><i class="fas fa-calendar-day" style="margin-right:6px;"></i> \${targetDate}</span>
        <span style="background:\${activeWarnings.length > 0 ? '#ef4444' : '#10b981'}; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">\${activeWarnings.length} ta</span>
    </div>\`;
    
    if (activeWarnings.length === 0) {
        html += \`<div style="text-align:center; padding: 10px 0; color: #94a3b8;">
            <i class="fas fa-check-circle" style="font-size: 24px; color: #10b981; margin-bottom: 8px; display:block;"></i>
            Ogohlantirishlar yo'q
        </div>\`;
    } else {
        activeWarnings.forEach(w => {
            const color = w.type === 'speed_limit' ? '#fbbf24' : '#818cf8';
            const icon = w.type === 'speed_limit' ? 'fa-tachometer-alt' : 'fa-clock';
            html += \`<div style="margin-bottom:8px;">
                <div style="margin-bottom:4px; display:flex; align-items:flex-start;">
                    <i class="fas \${icon}" style="color:\${color}; margin-top:3px; margin-right:8px; width:14px;"></i> 
                    <b style="color:#f8fafc; line-height:1.3;">\${w.title}</b>
                </div>
                <div style="font-size:12px; color:#cbd5e1; padding-left:22px; line-height:1.4;">\${w.message.substring(0, 120)}\${w.message.length > 120 ? '...' : ''}</div>
            </div>\`;
        });
    }
    
    tooltip.innerHTML = html;
    
    const rect = td.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - 10) + 'px';
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translate(-50%, -100%) scale(1)';
};

window.hidePU74WarningTooltip = function() {
    const tooltip = document.getElementById('pu74-custom-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translate(-50%, -100%) scale(0.95)';
        setTimeout(() => { 
            if(tooltip.style.opacity === '0') {
                tooltip.style.left = '-9999px'; 
            }
        }, 200);
    }
};
`;

content = content.substring(0, index) + correctEnding;
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed EOF');
