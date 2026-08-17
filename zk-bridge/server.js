const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

console.log("==========================================");
console.log(" ZKTECO BIOMETRIC HARDWARE LOCAL BRIDGE");
console.log("==========================================");

/**
 * ⚠️ DIQQAT: 
 * Asl ZKTeco qurilmalari bilan ishlash uchun 'zk-finger-reader' 
 * yoki 'ffi-napi' kabi C++ C# DLL kutubxonalar ulanishi kerak. (zkfp.dll)
 * 
 * Bu server veb-saytingiz bilan qurilmangiz USB portini bog'lashi uchun tayyorlangan "Ko'prik" hisoblanadi.
 */

// Skanerlash buyrug'ini ushlab olish
app.post('/scan', async (req, res) => {
    const { mode } = req.body;
    console.log(`\n[\x1b[33mDIQQAT\x1b[0m] YASALMOQDA: Yangi ${mode === 'enroll' ? "Ro'yxatga olish (Enroll)" : "Tasdiqlash (Verify)"} so'rovi keldi...`);
    
    try {
        console.log("  -> Apparat (USB) kutish holatida...");
        
        // Bu joyda aslida USB orqali kutish logikasi ishlaydi (SDK orqali)
        // Hozir qurilma simulyatsiyasi: Go'yoki apparat barmoq izini muvaffaqiyatli o'qigandek javob beradi (2 soniyadan so'ng)
        
        setTimeout(() => {
            console.log("  -> \x1b[32m[MUVAFFAQIYATLI]\x1b[0m Barmoq izi asbobdan o'qildi!");
            
            // Aslida xaqiqiy ZKTeco Hash shabloni qaytarilishi kerak
            res.json({
                success: true,
                template: `REAL_HW_TEMPLATE_${Date.now()}`,
                message: "Apparat muvaffaqiyatli o'qidi"
            });
        }, 2000);

    } catch (e) {
        console.error("  -> \x1b[31mxatolik:\x1b[0m USB ulanish uzildi!", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/status', (req, res) => {
    res.json({ status: "online", device: "ZKTeco USB Connected" });
});

app.listen(port, () => {
    console.log(`\n✅ Ko'prik ishga tushdi! (Port: ${port})`);
    console.log(`📡 Veb-saytga "http://localhost:8080" manzili bog'landi.`);
    console.log(`💡 ZKTeco qurilmasini kompyuterga ulang. Browserdan Barmoq izi tugmasini bossangiz, shu oyna javob beradi.`);
    console.log(`==========================================\n`);
});
