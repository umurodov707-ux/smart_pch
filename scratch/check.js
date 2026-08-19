const fs = require('fs');
const content = fs.readFileSync('public/js/hr.js', 'utf8');

let stack = [];
let inString = false;
let stringChar = '';
let inRegex = false;
let inComment = false;
let commentChar = '';
let line = 1;
let col = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '\n') {
        line++;
        col = 0;
    } else {
        col++;
    }

    if (inComment) {
        if (commentChar === '//' && char === '\n') {
            inComment = false;
        } else if (commentChar === '/*' && char === '*' && content[i + 1] === '/') {
            inComment = false;
            i++;
        }
        continue;
    }

    if (inString) {
        if (char === '\\') {
            i++; // skip next char
            continue;
        }
        if (char === stringChar) {
            inString = false;
        }
        continue;
    }

    // Comment detection
    if (char === '/' && content[i + 1] === '/') {
        inComment = true;
        commentChar = '//';
        i++;
        continue;
    }
    if (char === '/' && content[i + 1] === '*') {
        inComment = true;
        commentChar = '/*';
        i++;
        continue;
    }

    // String detection
    if (char === '"' || char === "'" || char === '`') {
        inString = true;
        stringChar = char;
        continue;
    }

    if (char === '{') {
        stack.push({ char, line, col });
    } else if (char === '}') {
        if (stack.length === 0) {
            console.log(`Unmatched closing brace at line ${line}, col ${col}`);
        } else {
            stack.pop();
        }
    }
}

if (stack.length > 0) {
    console.log(`Unclosed open braces:`);
    stack.forEach(b => console.log(`  { at line ${b.line}, col ${b.col}`));
} else {
    console.log('Braces matched successfully!');
}
