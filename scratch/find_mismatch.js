const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('public/js/hr.js', 'utf8');
try {
    new vm.Script(code, { filename: 'public/js/hr.js' });
    console.log('No syntax errors!');
} catch (err) {
    console.error(err.stack || err.message);
}
