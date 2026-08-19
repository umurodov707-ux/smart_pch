const fs = require('fs');
const file = 'd:\\\\расм\\\\public\\\\css\\\\pu74.css';
let content = fs.readFileSync(file, 'utf8');

const target = `.pu74-cover-page .pu74-journal-table td {
    border: none !important;
}`;

const replacement = `.pu74-cross-formula::before {
    border-top-color: #8b5cf6;
}

.pu74-num-cell {
    text-align: center;
    font-variant-numeric: tabular-nums;
    font-weight: 500;
}

.pu74-vertical-header {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    text-align: center;
    vertical-align: middle;
    white-space: nowrap;
    padding: 10px 5px !important;
    height: 140px;
}

/* Cover Page Overrides */
.pu74-cover-page .pu74-journal-table {
    font-size: 14px;
}

.pu74-cover-page .pu74-journal-table td {
    border: none !important;
}`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Restored css');
