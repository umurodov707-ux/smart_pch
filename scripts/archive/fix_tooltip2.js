const fs = require('fs');
const file = 'd:\\\\расм\\\\public\\\\js\\\\pu74.js';
let content = fs.readFileSync(file, 'utf8');

const target = `    if (reports && reports[bolinmaKey]) {
        const rep = reports[bolinmaKey];
        const sd = rep.structuredData;
        if (sd && sd.generalWarnRows) {
            sd.generalWarnRows.forEach(gw => {
                activeWarnings.push({
                    title: 'Tezlikni cheklash: ' + (gw.speed || '') + ' km/s',
                    message: 'Sabab: ' + (gw.reason || '') + ' | ' + (gw.station || '') + ' | KM: ' + (gw.km || ''),
                    start_date: targetDate, // Setting start_date to targetDate ensures it gets displayed for the hovered cell
                    type: 'speed_limit'
                });
            });
        }
    }`;

const replacement = `    if (reports && reports[bolinmaKey]) {
        const rep = reports[bolinmaKey];
        const sd = rep.structuredData;
        if (sd && sd.generalWarnRows) {
            sd.generalWarnRows.forEach(gw => {
                activeWarnings.push({
                    title: 'Tezlikni cheklash: ' + (gw.speed || '') + ' km/s',
                    message: 'Sabab: ' + (gw.reason || '') + ' | ' + (gw.station || '') + ' | KM: ' + (gw.km || ''),
                    start_date: targetDate,
                    type: 'speed_limit'
                });
            });
        }
    }
    
    // Yuborilmagan, lekin dispetcher oynasida kiritilgan ma'lumotlarni ham tekshiramiz
    if (window.dispatcherState && window.dispatcherState.generalWarnRows) {
        window.dispatcherState.generalWarnRows.forEach(gw => {
            // Faqat takrorlanmasligi uchun tekshiramiz
            const exists = activeWarnings.some(w => w.message.includes(gw.reason) && w.title.includes(gw.speed));
            if (!exists) {
                activeWarnings.push({
                    title: 'Tezlikni cheklash (Kiritilmoqda): ' + (gw.speed || '') + ' km/s',
                    message: 'Sabab: ' + (gw.reason || '') + ' | ' + (gw.station || '') + ' | KM: ' + (gw.km || ''),
                    start_date: targetDate,
                    type: 'speed_limit'
                });
            }
        });
    }`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Done');
