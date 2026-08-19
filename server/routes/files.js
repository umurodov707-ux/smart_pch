const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { firstBolinma, sanitizeSegment } = require('../utils/safe');

// Fayl saqlash konfiguratsiyasi
const uploadsDir = path.resolve(path.join(__dirname, '..', 'uploads'));
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ruxsat etilgan fayl turlari (kengaytma + MIME)
const ALLOWED_EXTENSIONS = new Set([
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.xlsm', '.csv', '.txt', '.rtf', '.odt', '.ods',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic',
    '.zip', '.rar', '.7z',
    '.dwg', '.dxf'
]);

// Hech qachon qabul qilinmaydigan (bajariladigan) kengaytmalar
const BLOCKED_EXTENSIONS = new Set([
    '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.ps1', '.sh', '.jar',
    '.js', '.mjs', '.cjs', '.php', '.asp', '.aspx', '.jsp', '.py', '.rb',
    '.html', '.htm', '.svg', '.xhtml', '.dll', '.so', '.vbs', '.hta'
]);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // XAVFSIZLIK: department foydalanuvchidan keladi.
        // Tozalanmasa "../../.." orqali ixtiyoriy papkaga yozish mumkin edi (path traversal).
        const dept = sanitizeSegment(req.body.department, 'general');
        const deptDir = path.resolve(path.join(uploadsDir, dept));

        // Ikkinchi himoya qatlami: natijaviy yo'l uploads ichida ekanini tasdiqlash
        if (deptDir !== uploadsDir && !deptDir.startsWith(uploadsDir + path.sep)) {
            return cb(new Error('Noto\'g\'ri papka nomi'));
        }

        try {
            if (!fs.existsSync(deptDir)) {
                fs.mkdirSync(deptDir, { recursive: true });
            }
        } catch (e) {
            return cb(e);
        }
        cb(null, deptDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        // Fayl nomi ham foydalanuvchidan keladi — faqat xavfsiz belgilarni qoldiramiz
        const base = sanitizeSegment(path.basename(file.originalname, path.extname(file.originalname)), 'file')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .slice(0, 60);
        // Tasodifiy qo'shimcha — nom to'qnashuvi va taxmin qilishning oldini oladi
        const rand = crypto.randomBytes(4).toString('hex');
        cb(null, `${base}_${Date.now()}_${rand}${ext}`);
    }
});

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();

    if (!ext || BLOCKED_EXTENSIONS.has(ext)) {
        return cb(new Error(`Bu turdagi fayllarni yuklash taqiqlangan (${ext || 'kengaytmasiz'})`));
    }
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return cb(new Error(`Ruxsat etilmagan fayl turi: ${ext}`));
    }
    // Ikki marta kengaytmali hiyla: "hisobot.php.pdf"
    const nameOnly = path.basename(file.originalname, ext).toLowerCase();
    const innerExt = path.extname(nameOnly);
    if (innerExt && BLOCKED_EXTENSIONS.has(innerExt)) {
        return cb(new Error('Shubhali qo\'sh kengaytmali fayl nomi'));
    }
    cb(null, true);
}

const upload = multer({
    storage: storage,
    fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
        files: 10,
        fields: 20
    }
});

// Multer xatolarini toza JSON javobga aylantirish
function handleUpload(middleware) {
    return (req, res, next) => middleware(req, res, (err) => {
        if (!err) return next();
        const tooLarge = err.code === 'LIMIT_FILE_SIZE';
        return res.status(400).json({
            message: tooLarge ? 'Fayl hajmi 25MB dan oshmasligi kerak' : (err.message || 'Faylni yuklashda xatolik')
        });
    });
}

// Faylni saqlash (Helper)
function saveFileInfo(fileData) {
    return new Promise((resolve, reject) => {
        const { filename, originalname, path, size, mimetype, department, user_id, bolinma_id, module, status } = fileData;
        const fileStatus = status || 'pending';
        db.run(
            `INSERT INTO files (filename, original_name, file_path, file_type, file_size, module, bolinma_id, uploaded_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [filename, originalname, path, mimetype, size, module || department, bolinma_id || department, user_id, fileStatus],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

// Bitta fayl yuklash
router.post('/upload', authMiddleware, handleUpload(upload.single('file')), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Fayl tanlanmagan' });

    // IDOR: foydalanuvchi o'zga bo'linma nomidan fayl yuklay olmasligi kerak
    const requested = req.body.bolinma_id;
    if (requested && !req.hasAccessToBolinma(requested)) {
        try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
        return res.status(403).json({ message: 'Ushbu bo\'linma uchun ruxsat yo\'q' });
    }

    try {
        const fileId = await saveFileInfo({
            ...req.file,
            department: req.body.department,
            user_id: req.user.id,
            // req.user.bolinmalar auth middleware'da ALLAQACHON massivga aylantirilgan.
            // Uni qayta JSON.parse qilish 500 xatosini keltirib chiqarardi.
            bolinma_id: requested || firstBolinma(req.user),
            module: req.body.module,
            status: req.body.status || 'pending'
        });

        res.json({ message: 'Fayl yuklandi', fileId });
    } catch (err) {
        res.status(500).json({ message: 'Bazaga yozishda xatolik: ' + err.message });
    }
});

// Tasdiqlashni kutayotgan fayllar
router.get('/pending', authMiddleware, (req, res) => {
    // Multi level visibility: Adminga 'dept_approved' va 'pending', Bo'limlarga faqat 'pending'
    const isAdmin = ['admin', 'director', 'rahbar'].includes(req.user.role);
    const query = isAdmin
        ? "SELECT f.*, u.username as uploader FROM files f LEFT JOIN users u ON f.uploaded_by = u.id WHERE f.status IN ('pending', 'dept_approved')"
        : "SELECT f.*, u.username as uploader FROM files f LEFT JOIN users u ON f.uploaded_by = u.id WHERE f.status = 'pending' AND f.bolinma_id = ?";

    const params = isAdmin ? [] : [firstBolinma(req.user)];

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Tasdiqlash yoki rad etish (Multi-level)
router.patch('/approve/:id', authMiddleware, (req, res) => {
    let { status } = req.body; // 'approved' yoki 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Noto\'g\'ri status' });
    }

    if (status === 'approved') {
        const isAdmin = ['admin', 'director', 'rahbar'].includes(req.user.role);
        if (!isAdmin) {
            status = 'dept_approved'; // 1st level
        } else {
            status = 'approved'; // final level
        }
    }

    // IDOR: bo'lim rahbari faqat o'z bo'linmasi faylini tasdiqlay olsin
    db.get('SELECT bolinma_id FROM files WHERE id = ?', [req.params.id], (err, file) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!file) return res.status(404).json({ message: 'Fayl topilmadi' });

        const isAdmin = ['admin', 'director', 'rahbar'].includes(req.user.role);
        if (!isAdmin && !req.hasAccessToBolinma(file.bolinma_id)) {
            return res.status(403).json({ message: 'Ushbu faylni tasdiqlashga ruxsat yo\'q' });
        }

        db.run(
            `UPDATE files SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [status, req.user.id, req.params.id],
            function (err2) {
                if (err2) return res.status(500).json({ message: err2.message });
                if (this.changes === 0) return res.status(404).json({ message: 'Fayl topilmadi' });
                res.json({ message: `Fayl ${status === 'rejected' ? 'rad etildi' : 'tasdiqlandi'}` });
            }
        );
    });
});

// Bo'lim bo'yicha tasdiqlangan fayllar
router.get('/list/:bolinma_id', authMiddleware, (req, res) => {
    // IDOR: ilgari istalgan foydalanuvchi istalgan bo'linma fayllarini ko'ra olardi
    const isViewer = ['admin', 'director', 'rahbar', 'dispetcher'].includes(req.user.role);
    if (!isViewer && !req.hasAccessToBolinma(req.params.bolinma_id)) {
        return res.status(403).json({ message: 'Ushbu bo\'linma fayllariga ruxsat yo\'q' });
    }

    db.all(
        "SELECT * FROM files WHERE bolinma_id = ? AND status = 'approved' ORDER BY created_at DESC",
        [req.params.bolinma_id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        }
    );
});

// Modul bo'yicha fayllarni olish (masalan, 'timesheet_archive')
router.get('/module/:module_name', authMiddleware, (req, res) => {
    const query = req.user.role === 'admin'
        ? "SELECT * FROM files WHERE module = ? ORDER BY created_at DESC"
        : "SELECT * FROM files WHERE module = ? AND (bolinma_id = ? OR bolinma_id IS NULL) ORDER BY created_at DESC";

    const params = req.user.role === 'admin'
        ? [req.params.module_name]
        : [req.params.module_name, firstBolinma(req.user)];

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

module.exports = router;

