const fs = require('fs');
let content = fs.readFileSync('d:/расм/public/js/pu74.js', 'utf8');

// Update sd.generalWarnRows
content = content.replace(
    /title: 'Tezlikni cheklash: ' \+ \(gw\.speed \|\| ''\) \+ ' km\/s',\s*message: 'Sabab: ' \+ \(gw\.reason \|\| ''\) \+ ' \| ' \+ \(gw\.station \|\| ''\) \+ ' \| KM: ' \+ \(gw\.km \|\| ''\),/g,
    "title: 'Tezlikni cheklash: ' + (gw.speed || '') + ' km/s',\n                    message: 'Sabab: ' + (gw.reason || '') + ' | ' + (gw.station || '') + ' | KM: ' + (gw.km || ''),\n                    time: gw.time || '',"
);

// Update draftData.generalWarnRows
content = content.replace(
    /title: 'Tezlikni cheklash \(Kiritilmoqda\): ' \+ \(gw\.speed \|\| ''\) \+ ' km\/s',\s*message: 'Sabab: ' \+ \(gw\.reason \|\| ''\) \+ ' \| ' \+ \(gw\.station \|\| ''\) \+ ' \| KM: ' \+ \(gw\.km \|\| ''\),/g,
    "title: 'Tezlikni cheklash (Kiritilmoqda): ' + (gw.speed || '') + ' km/s',\n                        message: 'Sabab: ' + (gw.reason || '') + ' | ' + (gw.station || '') + ' | KM: ' + (gw.km || ''),\n                        time: gw.time || '',"
);

// Update tooltip rendering
content = content.replace(
    /const icon = w\.type === 'speed_limit' \? 'fa-tachometer-alt' : 'fa-clock';\s*html \+= `<div style="margin-bottom:8px;">\s*<div style="margin-bottom:4px; display:flex; align-items:flex-start;">\s*<i class="fas \$\{icon\}" style="color:\$\{color\}; margin-top:3px; margin-right:8px; width:14px;"><\/i> \s*<b style="color:#f8fafc; line-height:1\.3;">\$\{w\.title\}<\/b>\s*<\/div>\s*<div style="font-size:12px; color:#cbd5e1; padding-left:22px; line-height:1\.4;">\$\{w\.message\.substring\(0, 120\)\}\$\{w\.message\.length > 120 \? '\.\.\.' : ''\}<\/div>\s*<\/div>`;/g,
    `const icon = w.type === 'speed_limit' ? 'fa-tachometer-alt' : 'fa-clock';
            const timeHtml = w.time ? \`<div style="color:#fbbf24; font-size:11px; font-weight:800; padding-left:22px; margin-bottom:4px;"><i class="fas fa-history"></i> Vaqti: \${w.time}</div>\` : '';
            html += \`<div style="margin-bottom:12px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="margin-bottom:6px; display:flex; align-items:flex-start;">
                    <i class="fas \${icon}" style="color:\${color}; margin-top:3px; margin-right:8px; width:14px;"></i> 
                    <b style="color:#f8fafc; line-height:1.3; font-size: 13px;">\${w.title}</b>
                </div>
                \${timeHtml}
                <div style="font-size:12px; color:#cbd5e1; padding-left:22px; line-height:1.4;">\${w.message.substring(0, 150)}\${w.message.length > 150 ? '...' : ''}</div>
            </div>\`;`
);

fs.writeFileSync('d:/расм/public/js/pu74.js', content);
console.log('Successfully updated PU74 tooltip logic!');
