const path = require('path');
const dotenv = require('dotenv');

// MUHIM: .env faylni BIRINCHI yuklaymiz
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('---------------------------------------------------');
console.log('⚙️ LOYIHA SOZLAMALARI YUKLANMOQDA...');
if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET: Topildi');
} else {
    console.error('❌ JWT_SECRET: TOPILMADI! (.env faylni tekshiring)');
}
console.log(`🌍 MUHIT: ${process.env.NODE_ENV || 'development'}`);
console.log('---------------------------------------------------');

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Xavfsizlik va log paketlarini majburiy yuklash
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const taskRoutes = require('./routes/tasks');
const defectRoutes = require('./routes/defects');
const storageRoutes = require('./routes/storage');
const hrRoutes = require('./routes/hr');
const safetyRoutes = require('./routes/safety');
const mechanicsRoutes = require('./routes/mechanics');
const aiRoutes = require('./routes/ai');
const materialRoutes = require('./routes/materials');
const timesheetRoutes = require('./routes/timesheet');
const fileRoutes = require('./routes/files');
const pu80Routes = require('./routes/pu80');
const metrologyRoutes = require('./routes/metrology');
const pu28Routes = require('./routes/pu28');
const pu28Section2Routes = require('./routes/pu28_section2');
const murojaatRoutes = require('./routes/murojaat');
const workflowRoutes = require('./routes/workflow');
const infrastructureRoutes = require('./routes/infrastructure');
const oknoRoutes = require('./routes/okno');
const sandRoutes = require('./routes/sand');
const pu74Routes = require('./routes/pu74');
const pu74MonthlyRoutes = require('./routes/pu74_monthly');
const searchRoutes = require('./routes/search');
const pu29Routes = require('./routes/pu29');
const marketplaceRoutes = require('./routes/marketplace');
const imzoRoutes = require('./routes/imzo');
const izostiklarRoutes = require('./routes/izostiklar');
const pletsRoutes = require('./routes/plets');
const pkzRailsRoutes = require('./routes/pkz_rails');
const productionDashboardRoutes = require('./routes/production_dashboard');
const defectoscopeRoutes = require('./routes/defectoscope');
const fs = require('fs');

const { startAutoBackup } = require('../scripts/backup');

// Avtomatik backupni ishga tushirish
startAutoBackup();

const app = express();
const server = http.createServer(app);

// Ruxsat etilgan domenlar ro'yxati
const allowedOrigins = [
    'http://localhost:7007',
    'http://localhost:4000',
    'http://localhost:3000',
    'http://127.0.0.1:7007',
    'http://127.0.0.1:4000',
    'http://127.0.0.1:3000',
    process.env.ALLOWED_ORIGIN || 'https://smartpch.uz',
    'https://test.smartpch.uz',
    'http://test.smartpch.uz'
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});
app.set('io', io); // Attach to app to use in routes

// === XAVFSIZLIK MIDDLEWARE'LARI ===

// Helmet - security headers with proper CSP for CDN usage
if (helmet) {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],

                // === CSP va eski frontend haqida ===
                // public/ dagi sahifalar minglab inline `onclick="..."` atributlaridan
                // iborat. Agar scriptSrcAttr'ni 'none' qilsak, brauzer BARCHA tugmalarni
                // bloklaydi va ilova butunlay ishlamay qoladi.
                // Shu sababli odatiy holat — mos (legacy) rejim.
                //
                // public/ React'ga to'liq ko'chirilgandan keyin .env ga
                // STRICT_CSP=true qo'ying — shunda XSS himoyasi to'liq yoqiladi.
                scriptSrc: [
                    "'self'",
                    ...(process.env.STRICT_CSP === 'true' ? [] : ["'unsafe-inline'"]),
                    "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "stackpath.bootstrapcdn.com",
                    "unpkg.com", "cdn.sheetjs.com", "code.jquery.com", "cdn.socket.io", "https://meet.jit.si"
                ],

                // onclick="..." kabi inline atributlar
                scriptSrcAttr: process.env.STRICT_CSP === 'true' ? ["'none'"] : ["'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "stackpath.bootstrapcdn.com", "fonts.googleapis.com", "unpkg.com", "at.alicdn.com"],
                fontSrc: ["'self'", "data:", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "stackpath.bootstrapcdn.com", "fonts.gstatic.com", "fonts.googleapis.com", "unpkg.com", "at.alicdn.com"],
                imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
                connectSrc: ["'self'", "ws:", "wss:", "http://localhost:4000", "ws://localhost:4000", "http://127.0.0.1:4000", "ws://127.0.0.1:4000", "http://127.0.0.1:8080", "http://localhost:8080", "https://smartpch.uz", "wss://smartpch.uz", "https://test.smartpch.uz", "wss://test.smartpch.uz", "http://test.smartpch.uz", "https://api.openweathermap.org"],
                frameSrc: ["'self'", "https://hrm.railway.uz", "https://obs.railwayinfra.uz", "https://kmo.railwayinfra.uz", "https://tt.railwayinfra.uz", "https://meet.jit.si"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'", "blob:", "data:", "https:"],
                frameAncestors: ["'none'"],
                formAction: ["'self'"],
                upgradeInsecureRequests: []
            }
        },
        crossOriginEmbedderPolicy: false
    }));
}

// CORS - faqat ruxsat etilgan domenlar
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        // Qat'iy tekshiruv: faqat haqiqiy localhost yoki ichki tarmoq IP manziliga ruxsat
        const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isLocalNetwork = /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin);
        
        if (isLocalhost || isLocalNetwork || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS blocked: ' + origin));
        }
    },
    credentials: true
}));

// Rate Limiting
if (rateLimit) {
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 daqiqa
        max: 500, // bitta IP dan maksimal 500 ta zapros
        message: 'Juda ko\'p so\'rov yuborildi, keyinroq qayta urinib ko\'ring'
    });
    
    const loginLimiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 daqiqa
        max: 5, // bitta IP dan maksimal 5 ta login urinishi
        message: 'Juda ko\'p login urinishlari, 5 daqiqadan so\'ng qayta urinib ko\'ring'
    });
    
    app.use('/api', apiLimiter);
    app.use('/api/auth/login', loginLimiter);
}

// CSRF Protection (Custom Header Check for SPAs)
app.use((req, res, next) => {
    // Only check state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        // Skip check if authenticated via JWT token or if it's public auth routes
        // JWT header authentication is naturally immune to CSRF attacks
        const hasAuth = req.headers.authorization;
        const isPublicAuth = req.path === '/api/auth/login' || 
                             req.path === '/api/auth/google' || 
                             req.path.endsWith('/auth/login') || 
                             req.path.endsWith('/auth/google');
        
        if (hasAuth || isPublicAuth) {
            return next();
        }

        if (!req.get('X-Requested-With')) {
            return res.status(403).json({ 
                message: 'Security Block: X-Requested-With header missing. This request may be a CSRF attempt.' 
            });
        }
    }
    next();
});

// Body parsers
// 50MB barcha endpointlarga ochiq bo'lishi DoS vektori edi.
// Odatiy chegara 2MB; katta yuklamalar faqat kerakli marshrutlarda.
// Eski public/ moduli qanday hajmda ma'lumot yuborishini to'liq sinab
// ko'rish imkoni bo'lmagani uchun odatiy chegara ehtiyotkorlik bilan 10MB
// qilib qo'yildi (avval 50MB edi). Kerak bo'lsa .env dan oshirish mumkin.
const DEFAULT_BODY_LIMIT = process.env.BODY_LIMIT || '10mb';
const LARGE_BODY_LIMIT = process.env.LARGE_BODY_LIMIT || '25mb';

// Katta JSON talab qiladigan marshrutlar (base64 rasm, ommaviy import va h.k.)
const LARGE_BODY_ROUTES = ['/api/files', '/api/imzo', '/api/hr/import', '/api/ai'];
app.use(LARGE_BODY_ROUTES, express.json({ limit: LARGE_BODY_LIMIT }));

app.use(express.json({ limit: DEFAULT_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: DEFAULT_BODY_LIMIT }));

// Buzuq JSON kelganda express standart HTML xato sahifasi o'rniga toza JSON qaytaramiz
app.use((err, req, res, next) => {
    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'So\'rov tanasi noto\'g\'ri JSON formatida' });
    }
    if (err && err.type === 'entity.too.large') {
        return res.status(413).json({ success: false, message: 'So\'rov hajmi juda katta' });
    }
    next(err);
});

// Logging
if (morgan) {
    if (process.env.NODE_ENV === 'production') {
        // Production: fayl ga yozish
        const logDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        const logStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
        app.use(morgan('combined', { stream: logStream }));
    } else {
        // Development: konsolga yozish
        app.use(morgan('dev'));
    }
}

const authMiddleware = require('./middleware/auth');
const { auditLog, router: auditRoutes } = require('./middleware/auditLog');

const broadcastRoutes = require('./routes/broadcast');

// (io allaqachon yuqorida app.set('io', io) orqali biriktirilgan)

// Routes
app.use('/api/auth', authRoutes); // Login is public
app.use('/api/broadcast', authMiddleware, broadcastRoutes);
app.use('/api/reports', authMiddleware, auditLog('report', 'reports'), reportRoutes);
app.use('/api/tasks', authMiddleware, auditLog('task', 'tasks'), taskRoutes);
app.use('/api/defects', authMiddleware, auditLog('defect', 'defects'), defectRoutes);
app.use('/api/storage', authMiddleware, auditLog('storage', 'kv_storage'), storageRoutes);
app.use('/api/hr', authMiddleware, auditLog('hr', 'employees'), hrRoutes);
app.use('/api/safety', authMiddleware, auditLog('safety', 'safety'), safetyRoutes);
app.use('/api/mechanics', authMiddleware, auditLog('mechanics', 'vehicles'), mechanicsRoutes);
app.use('/api/ai', authMiddleware, auditLog('ai', 'ai_assistant'), aiRoutes);
app.use('/api/materials', authMiddleware, auditLog('materials', 'material_acts'), materialRoutes);
app.use('/api/timesheet', authMiddleware, auditLog('timesheet', 'timesheet'), timesheetRoutes);
app.use('/api/files', authMiddleware, auditLog('files', 'uploads'), fileRoutes);
app.use('/api/pu80', authMiddleware, auditLog('pu80', 'inventory'), pu80Routes);
app.use('/api/metrology', authMiddleware, auditLog('metrology', 'metrology_devices'), metrologyRoutes);
app.use('/api/pu28', authMiddleware, auditLog('pu28', 'pu28_entries'), pu28Routes);
app.use('/api/pu28-section2', authMiddleware, auditLog('pu28_section2', 'pu28_section2_records'), pu28Section2Routes);
app.use('/api/murojaat', authMiddleware, auditLog('murojaat', 'murojaat'), murojaatRoutes);
app.use('/api/workflow', authMiddleware, auditLog('workflow', 'workflow'), workflowRoutes);
app.use('/api/infrastructure', authMiddleware, auditLog('infrastructure', 'assets'), infrastructureRoutes);
app.use('/api/okno', authMiddleware, auditLog('okno', 'work_windows'), oknoRoutes);
app.use('/api/sand', authMiddleware, auditLog('sand', 'sand_inventory'), sandRoutes);
app.use('/api/pu29', authMiddleware, auditLog('pu29', 'pu29_records'), pu29Routes);
app.use('/api/pu74', authMiddleware, auditLog('pu74', 'pu74_data'), pu74Routes);
app.use('/api/pu74_monthly', authMiddleware, auditLog('pu74_monthly', 'pu74_monthly_documents'), pu74MonthlyRoutes);
app.use('/api/search', authMiddleware, searchRoutes);
app.use('/api/marketplace', authMiddleware, auditLog('marketplace', 'marketplace_items'), marketplaceRoutes);
app.use('/api/imzo', authMiddleware, imzoRoutes);
app.use('/api/izostiklar', authMiddleware, auditLog('izostiklar', 'izostiklar'), izostiklarRoutes);
app.use('/api/plets', authMiddleware, auditLog('plets', 'plets'), pletsRoutes(db, authMiddleware.requireRole, authMiddleware.adminOnly));
app.use('/api/pkz-rails', authMiddleware, auditLog('pkz_rails', 'pkz_rails'), pkzRailsRoutes(db, authMiddleware.requireRole));
app.use('/api/production/dashboard', authMiddleware, auditLog('production_dashboard', 'assets'), productionDashboardRoutes(db, authMiddleware.requireRole));
app.use('/api/defectoscope', authMiddleware, defectoscopeRoutes);
app.use('/api/audit', auditRoutes); // Admin audit log API


// Health Check Endpoint - Tizim holatini tekshirish uchun
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '2.2.0'
    });
});

// Weather Proxy (API kaliti faqat .env dan)
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    const API_KEY = process.env.WEATHER_API_KEY;
    
    // Fallback when OpenWeatherMap API key is not configured
    if (!API_KEY) {
        return res.json({
            main: { temp: 28, feels_like: 27, humidity: 40, pressure: 1012 },
            wind: { speed: 3.5, deg: 210 },
            weather: [{ description: 'musaffo osmon', icon: '01d', main: 'Clear' }],
            dt: Math.floor(Date.now() / 1000),
            name: 'Buxoro (Simulyatsiya)'
        });
    }
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=uz`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        // Fallback when OpenWeatherMap API fetch fails
        res.json({
            main: { temp: 28, feels_like: 27, humidity: 40, pressure: 1012 },
            wind: { speed: 3.5, deg: 210 },
            weather: [{ description: 'musaffo osmon', icon: '01d', main: 'Clear' }],
            dt: Math.floor(Date.now() / 1000),
            name: 'Buxoro (Fallback)'
        });
    }
});

// === STATIK FAYLLARNI XIZMAT QILISH ===
// 1) Asosiy to'liq tizim (public/) — asosiy frontend
const publicPath = path.join(__dirname, '..', 'public');
// 2) React production build (dist/) — yangi komponentlar
const distPath = path.join(__dirname, '..', 'dist');

// Yuklangan fayllar (uploads/) ni ham xizmat qilish
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.use(express.static(publicPath));
app.use(express.static(distPath));

// Handle SPAs / Routes — Odatiy holatda asosiy public/index.html ni uzatish
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.includes('.')) {
        return next();
    }
    // React dashboard marshrutlari uchun dist/index.html ga yo'naltirish
    if (req.path.startsWith('/react') || req.path.startsWith('/dashboard')) {
        const reactIndex = path.join(distPath, 'index.html');
        if (fs.existsSync(reactIndex)) {
            return res.sendFile(reactIndex);
        }
    }
    // Asosiy to'liq ilova: public/index.html
    const publicIndex = path.join(publicPath, 'index.html');
    if (fs.existsSync(publicIndex)) {
        res.sendFile(publicIndex);
    } else {
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

// === SOCKET.IO AUTENTIFIKATSIYASI ===
// Ilgari ulanish ochiq edi: istalgan odam 'dispetcher' xonasiga qo'shilib,
// barcha bo'linmalar hisobotlarini o'qiy olardi.
const jwt = require('jsonwebtoken');
const { safeArray } = require('./utils/safe');

io.use((socket, next) => {
    const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization || '').replace('Bearer ', '');

    if (!token) return next(new Error('Avtorizatsiya talab qilinadi'));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        db.get('SELECT id, username, role, bolinmalar, status FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err) return next(new Error('Server xatosi'));
            if (!user || user.status === 'inactive') return next(new Error('Foydalanuvchi faol emas'));

            socket.user = {
                id: user.id,
                username: user.username,
                role: user.role,
                bolinmalar: safeArray(user.bolinmalar)
            };
            next();
        });
    } catch (e) {
        next(new Error('Token noto\'g\'ri yoki muddati o\'tgan'));
    }
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
    const u = socket.user;
    console.log(`Socket ulandi: ${u.username} (${u.role})`);

    // Foydalanuvchi shu xonaga qo'shila oladimi?
    const canJoin = (roomName) => {
        if (u.role === 'admin') return true;
        if (roomName === 'dispetcher') return ['dispetcher', 'director', 'rahbar'].includes(u.role);
        return u.bolinmalar.includes(roomName);
    };

    socket.on('join_room', (roomName) => {
        if (typeof roomName !== 'string' || !roomName) return;
        if (!canJoin(roomName)) {
            console.warn(`Rad etildi: ${u.username} -> ${roomName}`);
            return socket.emit('join_denied', { room: roomName, message: 'Ushbu xonaga ruxsat yo\'q' });
        }
        socket.join(roomName);
        socket.emit('join_ok', { room: roomName });
        console.log(`${u.username} xonaga qo'shildi: ${roomName}`);
    });

    socket.on('send_report', (data) => {
        if (!data || typeof data !== 'object') return;

        // Bo'linmani mijozdan emas, tasdiqlangan sessiyadan olamiz
        const bolinma = u.role === 'admin' ? data.bolinma_id : (u.bolinmalar[0] || null);
        if (!bolinma) return;
        if (u.role !== 'admin' && data.bolinma_id && !u.bolinmalar.includes(data.bolinma_id)) {
            return socket.emit('error_message', { message: 'Ushbu bo\'linma nomidan yuborish mumkin emas' });
        }

        const payload = { ...data, bolinma_id: bolinma, sender: u.username, at: new Date().toISOString() };
        io.to('dispetcher').to(bolinma).emit('new_report', payload);
        console.log(`Report from ${bolinma} broadcasted to rooms.`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket uzildi: ${u.username}`);
    });
});

// === 404 HANDLER (API uchun) ===
// Mavjud bo'lmagan /api/... manzillari SPA index.html qaytarmasligi kerak
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: `Topilmadi: ${req.method} ${req.originalUrl}` });
});

// === GLOBAL ERROR HANDLER ===
// MUHIM: bu server.listen() dan OLDIN ro'yxatdan o'tishi va
// barcha marshrutlardan KEYIN turishi shart.
app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    console.error(`\n[${timestamp}] ❌ Unhandled Error at ${req.method} ${req.originalUrl}`);
    console.error(`Client IP: ${req.ip}`);
    console.error(`Error Message: ${err.message}`);
    console.error(`Stack Trace:`, err.stack);
    console.error('---------------------------------------------------\n');

    // Optionally write to an error log file
    try {
        const logDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        const logMsg = `[${timestamp}] ${req.method} ${req.originalUrl} - ${err.message}\n${err.stack}\n\n`;
        fs.appendFileSync(path.join(logDir, 'error.log'), logMsg);
    } catch (fsErr) {
        console.error('Kutilmagan xato (Faylga yozishda):', fsErr.message);
    }

    if (res.headersSent) return next(err);

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Serverda ichki xatolik yuz berdi'
            : err.message
    });
});

// === SERVERNI ISHGA TUSHIRISH ===
const PORT = process.env.PORT || 7007;

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [ERROR] ${PORT}-port band!`);
        console.error(`Diks: Bu portda boshqa server ishlayapti.`);
        console.error(`Tavsiya: "START_STABLE_SERVER.bat" orqali ishga tushiring.`);
        console.error('---------------------------------------------------\n');
        process.exit(1); // Batch file loops this
    } else {
        console.error('\n❌ SERVER XATOLIGI:', err.message);
        console.error(err);
        process.exit(1);
    }
});

// MUHIM: baza va schema tayyor bo'lgandan KEYIN so'rov qabul qilamiz.
// Ilgari listen() darhol chaqirilardi va jadvallar yaratilmasdan turib
// kelgan so'rovlar "no such table" xatosini berishi mumkin edi.
db.whenReady()
    .then(() => {
        server.listen(PORT, () => {
            const addr = server.address();
            console.log(`\n🚀 SERVER ISHGA TUSHDI: http://localhost:${addr.port}`);
            console.log(`📅 SANA: ${new Date().toLocaleString('uz-UZ')}`);
            console.log(`💻 HOLAT: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  BAZA: ${db.isPostgres ? 'PostgreSQL' : 'SQLite'}`);
            console.log(`🔌 API: http://localhost:${addr.port}/api`);
            console.log('---------------------------------------------------\n');
        });
    })
    .catch((err) => {
        console.error('\n❌ Baza tayyorlanmadi, server ishga tushmadi:', err.message);
        process.exit(1);
    });

// Graceful shutdown
let shuttingDown = false;
function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} signal received. Closing server...`);

    const forceExit = setTimeout(() => {
        console.error('Server 10 soniyada yopilmadi, majburiy to\'xtatilmoqda.');
        process.exit(1);
    }, 10000);
    forceExit.unref();

    io.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
    // Node'ning tavsiyasi: uncaughtException'dan keyin jarayon aniqlanmagan
    // holatda qoladi. Ilgari faqat log yozilib, server "nosog'lom" holatda
    // ishlashda davom etardi. Endi log yozilib, nazorat ostida qayta ishga tushadi
    // (pm2 / render avtomatik ko'taradi).
    console.error('❌ Uncaught Exception:', err);
    try {
        const logDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.appendFileSync(
            path.join(logDir, 'error.log'),
            `[${new Date().toISOString()}] UNCAUGHT: ${err.message}\n${err.stack}\n\n`
        );
    } catch (e) { /* ignore */ }
    shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});
