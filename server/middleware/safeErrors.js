/**
 * 5xx javoblarda ichki xato matnini yashirish.
 *
 * Ko'p marshrutlar `res.status(500).json({ message: err.message })` qaytaradi — bu
 * foydalanuvchiga SQL matni, jadval/ustun nomlari, fayl yo'llarini ko'rsatadi va
 * oddiy foydalanuvchini chalg'itadi. Har birini alohida tuzatish o'rniga bu yerda
 * umumiy qoida: 5xx javobidagi texnik matn serverga yoziladi, mijozga esa
 * tushunarli xabar boradi. O'zbekcha, ataylab yozilgan xabarlar o'zgarmaydi.
 */
const TECHNICAL = /SQLITE|sqlite|syntax error|no such (table|column)|constraint|relation "|column "|duplicate key|violates|ECONN|ENOENT|EACCES|Cannot read prop|is not a function|is not defined|undefined|Unexpected token|JSON|at \w+ \(|\/home\/|\/var\/|\\\\|stack/i;

const GENERIC = 'Serverda ichki xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.';

function scrub(body, req) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return body;
    let changed = false;
    const out = { ...body };
    for (const k of ['message', 'error', 'details', 'detail']) {
        const v = out[k];
        if (typeof v === 'string' && TECHNICAL.test(v)) {
            console.error(`[${req.method} ${req.originalUrl}] ${k}:`, v);
            if (k === 'message') out[k] = GENERIC; else delete out[k];
            changed = true;
        } else if (v && typeof v === 'object' && k !== 'message') {
            delete out[k]; changed = true;
        }
    }
    if (out.stack) { delete out.stack; changed = true; }
    if (changed && !out.message) out.message = GENERIC;
    return out;
}

function safeErrors(req, res, next) {
    const json = res.json.bind(res);
    res.json = (body) => (res.statusCode >= 500 ? json(scrub(body, req)) : json(body));
    next();
}

module.exports = { safeErrors, scrub, GENERIC };
