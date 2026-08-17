const jwt = require('jsonwebtoken');
const db = require('../db');
const { safeArray } = require('../utils/safe');

const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET on startup
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set!');
    console.error('Please set JWT_SECRET in your .env file');
    process.exit(1);
}

// Zaif sirlarni tekshirish.
// Productionda ishga tushishni bloklaymiz, developmentda faqat ogohlantiramiz —
// shunda mavjud lokal muhit birdaniga ishlamay qolmaydi.
if (JWT_SECRET.length < 32) {
    const msg = `JWT_SECRET juda qisqa (${JWT_SECRET.length} belgi, kamida 32 bo'lishi kerak).`;
    const howTo = 'Yangi kalit: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"';
    if (process.env.NODE_ENV === 'production') {
        console.error(`FATAL: ${msg}`);
        console.error(howTo);
        process.exit(1);
    }
    console.warn(`\n⚠️  OGOHLANTIRISH: ${msg}`);
    console.warn(`   ${howTo}`);
    console.warn('   Productionga chiqishdan oldin albatta almashtiring!\n');
}

/**
 * Foydalanuvchi keshi.
 * Ilgari HAR BIR so'rovda "SELECT * FROM users" bajarilardi.
 * Endi natija qisqa muddatga keshlanadi (rol/status o'zgarishi 30s ichida yetib boradi).
 */
const USER_CACHE_TTL_MS = 30 * 1000;
const userCache = new Map();

function getCachedUser(id) {
    const hit = userCache.get(id);
    if (!hit) return null;
    if (Date.now() - hit.at > USER_CACHE_TTL_MS) {
        userCache.delete(id);
        return null;
    }
    return hit.user;
}

function setCachedUser(id, user) {
    userCache.set(id, { user, at: Date.now() });
    // Keshni cheklab turamiz (xotira oqishining oldini olish)
    if (userCache.size > 1000) {
        const oldestKey = userCache.keys().next().value;
        userCache.delete(oldestKey);
    }
}

/** Parol/rol/status o'zgarganda tashqaridan chaqiriladi */
function invalidateUser(id) {
    userCache.delete(Number(id));
    userCache.delete(String(id));
}

function attachUser(req, user) {
    req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        departments: safeArray(user.departments),
        bolinmalar: safeArray(user.bolinmalar),
        employee_id: user.employee_id
    };

    // Helpful function for IDOR checks
    req.hasAccessToBolinma = (bId) => {
        if (req.user.role === 'admin') return true;
        if (!bId) return false;
        return req.user.bolinmalar.includes(bId);
    };

    req.hasAccessToDepartment = (dId) => {
        if (req.user.role === 'admin') return true;
        if (!dId) return false;
        return req.user.departments.includes(dId);
    };
}

const authMiddleware = (req, res, next) => {
    const header = req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!token) {
        return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        // Token bilan bog'liq xatolar shu yerda tugaydi.
        // Ilgari DB callback ichidagi xatolar ham shu blokka tushib,
        // chalg'ituvchi "token noto'g'ri" xabarini berardi.
        const expired = err.name === 'TokenExpiredError';
        return res.status(401).json({
            message: expired ? 'Sessiya muddati tugadi, qayta kiring' : 'Token noto\'g\'ri'
        });
    }

    const cached = getCachedUser(decoded.id);
    if (cached) {
        if (cached.status === 'inactive') {
            return res.status(403).json({ message: 'Profilingiz bloklangan' });
        }
        attachUser(req, cached);
        return next();
    }

    db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
        if (err) {
            console.error('Auth DB error:', err.message);
            return res.status(500).json({ message: 'Serverda ichki xatolik' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Foydalanuvchi topilmadi yoki o\'chirilgan' });
        }
        if (user.status === 'inactive') {
            return res.status(403).json({ message: 'Profilingiz bloklangan' });
        }

        setCachedUser(decoded.id, user);
        attachUser(req, user);
        next();
    });
};
/**
 * RBAC Middleware Factory
 * Checks if the user has one of the required roles
 */
authMiddleware.requireRole = (roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi' });
    }
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
        return next();
    }
    // Also check if the role matches any of their functional departments
    const userDepts = req.user.departments || [];
    if (roles.some(r => userDepts.includes(r))) {
        return next();
    }

    res.status(403).json({ message: 'Ushbu amal uchun ruxsat etilmagan' });
};

/**
 * Admin-Only Middleware
 */
authMiddleware.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Faqat administratorlar uchun' });
};

// Rol/parol/status o'zgarganda keshni tozalash uchun
authMiddleware.invalidateUser = invalidateUser;

module.exports = authMiddleware;
