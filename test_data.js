const fs = require('fs');
const file = 'd:\\\\расм\\\\public\\\\js\\\\pu74.js';
let content = fs.readFileSync(file, 'utf8');

const target = 'console.log("Loaded warnings for PU-74:", pu74Warnings);';
const replacement = `
        const testDate = yearMonth ? yearMonth + '-01' : '2026-07-01';
        pu74Warnings.push({
            title: "Dispetcher nazorati (TEST)",
            message: "Dispetcherga yuborgan (yoki u yerdan kelgan) ma'lumotlar xuddi shunday formatda ko'rinadi. Bu vizual tekshirish uchun maxsus qo'shildi.",
            start_date: testDate,
            type: "speed_limit",
            km: "15",
            pk: "4"
        });
        console.log("Loaded warnings for PU-74:", pu74Warnings);
`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Test data injected.');
