const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { safeArray, safeObject } = require('../utils/safe');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set!');
    process.exit(1);
}

const authMiddleware = require('../middleware/auth');

// Foydalanuvchi topilmaganda ham bcrypt hisobini bajarish uchun soxta hash.
// Bu javob vaqtini tenglashtiradi va login mavjudligini vaqt bo'yicha aniqlashning oldini oladi.
// (Formati to'g'ri, haqiqiy hech kimning paroli emas.)
const DUMMY_HASH = bcrypt.hashSync('smart-pch-dummy-password', 10);

// Tizimda amaldagi rollar (barcha foydalanuvchilar shulardan biriga ega)
const ALLOWED_ROLES = ['admin', 'department', 'bolinma'];

// Parol murakkabligi uchun umumiy qoida
const MIN_PASSWORD_LENGTH = 8;
function validatePassword(password) {
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        return `Parol kamida ${MIN_PASSWORD_LENGTH} ta belgidan iborat bo'lishi kerak`;
    }
    if (password.length > 128) {
        return 'Parol juda uzun (maksimal 128 belgi)';
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return 'Parol kamida bitta harf va bitta raqamdan iborat bo\'lishi kerak';
    }
    return null;
}

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Login va parol kiritilishi shart' });
    }

    // Foydalanuvchi bor-yo'qligini oshkor qilmaydigan yagona xabar
    const INVALID_CREDENTIALS = 'Login yoki parol noto\'g\'ri';

    db.get('SELECT * FROM users WHERE username = ?', [username.trim()], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Ma\'lumotlar bazasida xatolik' });

        if (!user) {
            // Timing attack'ning oldini olish uchun baribir hash solishtiramiz.
            // Xato bo'lsa ham e'tiborsiz qoldiramiz — javob har doim 401 bo'lishi kerak.
            try {
                await bcrypt.compare(password, DUMMY_HASH);
            } catch (e) { /* ataylab e'tiborsiz */ }
            return res.status(401).json({ message: INVALID_CREDENTIALS });
        }

        try {
            if (user.status === 'inactive') {
                return res.status(403).json({ message: 'Profilingiz bloklangan. Administratorga murojaat qiling.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: INVALID_CREDENTIALS });
        } catch (e) {
            console.error('Login compare error:', e.message);
            return res.status(500).json({ message: 'Serverda ichki xatolik' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name,
                departments: safeArray(user.departments),
                bolinmalar: safeArray(user.bolinmalar),
                avatar: user.avatar,
                phone: user.phone,
                employee_id: user.employee_id,
                settings: safeObject(user.settings)
            }
        });
    });
});

// Google OAuth Login
router.post('/google', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
        return res.status(400).json({ message: 'ID Token topilmadi' });
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) {
        console.error('Google Auth: GOOGLE_CLIENT_ID .env faylda sozlanmagan.');
        return res.status(503).json({ message: 'Google orqali kirish sozlanmagan' });
    }

    try {
        const fetch = require('node-fetch');
        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;

        const googleRes = await fetch(verifyUrl);
        const googleData = await googleRes.json();

        if (googleData.error || !googleData.email) {
            return res.status(401).json({ message: 'Google token xato' });
        }

        // === XAVFSIZLIK: token AYNAN shu ilova uchun berilganini tekshirish ===
        // Busiz istalgan Google ilovasining tokeni bilan tizimga kirish mumkin edi.
        if (googleData.aud !== GOOGLE_CLIENT_ID) {
            console.warn(`Google Auth: noto'g'ri audience (${googleData.aud})`);
            return res.status(401).json({ message: 'Google token boshqa ilova uchun berilgan' });
        }

        // Token muddati (tokeninfo sekundlarda qaytaradi)
        if (googleData.exp && Number(googleData.exp) * 1000 < Date.now()) {
            return res.status(401).json({ message: 'Google token muddati tugagan' });
        }

        // Emaili tasdiqlanmagan akkauntlarga ruxsat yo'q
        if (googleData.email_verified !== true && googleData.email_verified !== 'true') {
            return res.status(401).json({ message: 'Google emailingiz tasdiqlanmagan' });
        }

        // Google issuer tekshiruvi
        const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
        if (googleData.iss && !validIssuers.includes(googleData.iss)) {
            return res.status(401).json({ message: 'Google token manbasi noto\'g\'ri' });
        }

        const email = String(googleData.email).toLowerCase();

        // Faqat username (email) bo'yicha qidiramiz.
        // Ilgari "OR phone = googleData.sub" ham bor edi — bu noto'g'ri mapping va
        // telefon maydoniga sub yozilib qolgan holatda hisobni egallash xavfini tug'diradi.
        db.get('SELECT * FROM users WHERE LOWER(username) = ?', [email], (err, user) => {
            if (err) return res.status(500).json({ message: 'Bazaga ulanishda xato' });

            if (!user) {
                return res.status(401).json({
                    message: `Sizning Google akkauntingiz (${email}) tizimda ro'yxatdan o'tmagan. Iltimos login/parol orqali kiring.`
                });
            }

            if (user.status === 'inactive') return res.status(403).json({ message: 'Profilingiz bloklangan.' });

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '12h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    full_name: user.full_name,
                    departments: safeArray(user.departments),
                    bolinmalar: safeArray(user.bolinmalar),
                    avatar: user.avatar || googleData.picture,
                    phone: user.phone,
                    employee_id: user.employee_id
                }
            });
        });

    } catch (e) {
        console.error('Google Auth Error:', e);
        res.status(500).json({ message: 'Serverda xatolik yuz berdi' });
    }
});


// Token yangilash (refresh)
router.post('/refresh', authMiddleware, (req, res) => {
    const token = jwt.sign(
        { id: req.user.id, username: req.user.username, role: req.user.role },
        JWT_SECRET,
        { expiresIn: '12h' }
    );
    res.json({ token });
});

// Parol o'zgartirish
router.post('/change-password', authMiddleware, (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Joriy va yangi parolni kiriting' });
    }

    const pwError = validatePassword(newPassword);
    if (pwError) return res.status(400).json({ message: pwError });

    if (currentPassword === newPassword) {
        return res.status(400).json({ message: 'Yangi parol joriy paroldan farq qilishi kerak' });
    }

    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Ma\'lumotlar bazasida xatolik' });
        if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(currentPassword, user.password);
        } catch (e) {
            return res.status(500).json({ message: 'Serverda ichki xatolik' });
        }
        if (!isMatch) return res.status(401).json({ message: 'Joriy parol noto\'g\'ri' });

        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id], (err) => {
            if (err) return res.status(500).json({ message: 'Parolni o\'zgartirishda xatolik' });
            authMiddleware.invalidateUser(req.user.id);
            res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' });
        });
    });
});

// Get all users (Admin only)
router.get('/users', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    db.all('SELECT id, username, role, full_name, departments, bolinmalar, employee_id, avatar, phone, settings, status FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Ma\'lumotlar bazasida xatolik' });

        const users = rows.map(user => ({
            ...user,
            departments: safeArray(user.departments),
            bolinmalar: safeArray(user.bolinmalar),
            settings: safeObject(user.settings),
            status: user.status || 'active'
        }));

        res.json(users);
    });
});

// Yangi foydalanuvchi yaratish (Admin only)
router.post('/users', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    const { username, password, role, full_name, departments, bolinmalar, employee_id, phone } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Login, parol va roli kiritilishi shart' });
    }

    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ message: pwError });

    // Faqat ma'lum rollarga ruxsat (ixtiyoriy rol kiritilishining oldini olish)
    if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({ message: `Noto'g'ri rol. Ruxsat etilganlar: ${ALLOWED_ROLES.join(', ')}` });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    db.run(
        `INSERT INTO users (username, password, role, full_name, departments, bolinmalar, employee_id, phone, settings, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username.trim(), hashedPassword, role, full_name || '', JSON.stringify(departments || []), JSON.stringify(bolinmalar || []), employee_id || null, phone || '', '{}', 'active'],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ message: 'Bu foydalanuvchi nomi allaqachon mavjud' });
                }
                return res.status(500).json({ message: err.message });
            }
            res.json({ id: this.lastID, message: 'Foydalanuvchi yaratildi' });
        }
    );
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
    const { full_name, phone, avatar, settings } = req.body;
    let query = 'UPDATE users SET ';
    const params = [];

    if (full_name !== undefined) { query += 'full_name = ?, '; params.push(full_name); }
    if (phone !== undefined) { query += 'phone = ?, '; params.push(phone); }
    if (avatar !== undefined) { query += 'avatar = ?, '; params.push(avatar); }
    if (settings !== undefined) { query += 'settings = ?, '; params.push(JSON.stringify(settings)); }

    if (params.length === 0) return res.status(400).json({ message: 'Tahrirlash uchun ma\'lumot kerak' });

    query = query.slice(0, -2) + ' WHERE id = ?';
    params.push(req.user.id);

    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Profil muvaffaqiyatli yangilandi' });
    });
});

// Admin tomondan foydalanuvchini tahrirlash
router.put('/users/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    const { full_name, role, departments, bolinmalar } = req.body;
    const userId = parseInt(req.params.id, 10);

    if (Number.isNaN(userId)) {
        return res.status(400).json({ message: 'Noto\'g\'ri foydalanuvchi ID' });
    }

    if (userId === req.user.id && role && role !== 'admin') {
        return res.status(400).json({ message: 'O\'z rolingizni pasaytira olmaysiz' });
    }

    if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({ message: 'Noto\'g\'ri rol' });
    }
    if (departments !== undefined && !Array.isArray(departments)) {
        return res.status(400).json({ message: 'departments massiv bo\'lishi kerak' });
    }
    if (bolinmalar !== undefined && !Array.isArray(bolinmalar)) {
        return res.status(400).json({ message: 'bolinmalar massiv bo\'lishi kerak' });
    }

    let query = 'UPDATE users SET ';
    const params = [];

    if (full_name !== undefined) { query += 'full_name = ?, '; params.push(full_name); }
    if (role !== undefined) { query += 'role = ?, '; params.push(role); }
    if (departments !== undefined) { query += 'departments = ?, '; params.push(JSON.stringify(departments)); }
    if (bolinmalar !== undefined) { query += 'bolinmalar = ?, '; params.push(JSON.stringify(bolinmalar)); }

    if (params.length === 0) return res.status(400).json({ message: 'Ma\'lumot kiritilmadi' });

    query = query.slice(0, -2) + ' WHERE id = ?';
    params.push(userId);

    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
        authMiddleware.invalidateUser(userId); // yangi rol darhol kuchga kirsin
        res.json({ message: 'Foydalanuvchi muvaffaqiyatli yangilandi' });
    });
});


// Foydalanuvchi parolini tiklash (Admin only)
router.post('/users/:id/reset-password', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    const { password } = req.body;
    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ message: pwError });

    const targetId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetId)) return res.status(400).json({ message: 'Noto\'g\'ri foydalanuvchi ID' });

    const hashedPassword = bcrypt.hashSync(password, 12);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, targetId], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
        authMiddleware.invalidateUser(targetId);
        res.json({ message: 'Parol muvaffaqiyatli yangilandi' });
    });
});

// Foydalanuvchini holatini o'zgartirish (Deaktivatsiya / Aktivatsiya)
router.patch('/users/:id/status', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Noto\'g\'ri holat' });
    }

    // Admin o'zini bloklay olmaydi
    if (parseInt(req.params.id) === req.user.id && status === 'inactive') {
        return res.status(400).json({ message: 'O\'z hisobingizni bloklay olmaysiz' });
    }

    db.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
        authMiddleware.invalidateUser(req.params.id); // bloklash darhol kuchga kirsin
        res.json({ message: `Foydalanuvchi ${status === 'active' ? 'faollashtirildi' : 'bloklandi'}` });
    });
});

// Foydalanuvchini o'chirish (Admin only) - Aslida bu butunlay o'chirish, lekin UI da bloklash ishlatiladi
router.delete('/users/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ message: 'O\'zingizni o\'chira olmaysiz' });
    }

    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        authMiddleware.invalidateUser(req.params.id);
        res.json({ message: 'Foydalanuvchi bazadan o\'chirildi' });
    });
});

module.exports = router;
