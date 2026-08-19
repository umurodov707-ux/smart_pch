const fs = require('fs');
const execSync = require('child_process').execSync;

const original = fs.readFileSync('public/js/hr.js', 'utf8');
const lines = original.split('\n');

function testRange(start, end) {
    const tempLines = [...lines];
    for (let i = start; i <= end; i++) {
        tempLines[i] = ''; // clear line
    }
    const tempContent = tempLines.join('\n');
    fs.writeFileSync('public/js/hr_temp.js', tempContent, 'utf8');
    try {
        execSync('node --check public/js/hr_temp.js', { stdio: 'ignore' });
        return true; // syntactically valid when this range is commented out
    } catch (e) {
        return false;
    }
}

let start = 0;
let end = lines.length - 1;

console.log(`Bisecting between line ${start + 1} and ${end + 1}...`);
if (!testRange(start, end)) {
    console.log("Empty file does not compile? That means node --check itself is failing or we have a environment issue.");
    try { fs.unlinkSync('public/js/hr_temp.js'); } catch(e) {}
    process.exit(1);
}

let low = start;
let high = end;
while (low < high) {
    let mid = Math.floor((low + high) / 2);
    if (testRange(low, mid)) {
        high = mid;
    } else {
        low = mid + 1;
    }
}

console.log(`First syntax error is at line ${low + 1}:`);
console.log(lines[low]);

try {
    fs.unlinkSync('public/js/hr_temp.js');
} catch(e) {}
