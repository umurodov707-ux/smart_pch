const fs = require('fs');
const file = 'd:\\\\расм\\\\public\\\\js\\\\pu74.js';
let content = fs.readFileSync(file, 'utf8');

const target = 'if (pu74Warnings.length > 0) {';
const replacement = `
    let bolinma = window.Auth?.currentUser?.subdivision || '';
    if (!bolinma) {
        const brigadeMatch = String(typeof pu74CurrentFile !== 'undefined' ? pu74CurrentFile : '1-brigada').match(/(\\d+)/);
        const brigadeNum = brigadeMatch ? brigadeMatch[1] : '1';
        bolinma = brigadeNum + "-bo'linma";
    }

    if (window.subdivisionReports && window.subdivisionReports[bolinma]) {
        const sd = window.subdivisionReports[bolinma].structuredData;
        if (sd && sd.generalWarnRows) {
            sd.generalWarnRows.forEach(gw => {
                // Dispetcherdan kelgan tezlikni cheklash
                activeWarnings.push({
                    title: 'Tezlikni cheklash: ' + gw.speed + ' km/s',
                    message: 'Sabab: ' + gw.reason + ' | ' + gw.station + ' | KM: ' + gw.km,
                    start_date: targetDate,
                    type: 'speed_limit'
                });
            });
        }
    }

    if (pu74Warnings.length > 0) {`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('generalWarnRows injected.');
