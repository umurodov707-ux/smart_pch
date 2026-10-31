const express = require('express');
const router = express.Router();
// const fetch = require('node-fetch'); // package.json da bor

/**
 * /api/imzo/verify - E-Imzo PKCS#7 imzosining haqiqiyligini tekshirish
 * Bu yerda DSQ (Davlat Soliq Qo'mitasi) ning ochiq API yoki Maxsus E-Imzo Server 
 * (Masalan, E-IMZO E-hujjat xizmati) ishlatiladi.
 */
router.post('/verify', async (req, res) => {
    try {
        const { pkcs7, documentId, employeePinfl } = req.body;

        if (!pkcs7) {
            return res.status(400).json({ success: false, message: "PKCS#7 signature kiritilmadi!" });
        }

        // TODO: Real E-IMZO server-side API or node-forge verification
        // Hozirda tizim "Simulation" sifatida ishlaydi (DSQ API tokenlari yo'qligi sababli)
        // Haqiqiy loyihada DSQ API ga PKCS7 jo'natiladi
        
        console.log(`[E-IMZO] Imzo keldi. Hujjat ID: ${documentId}, Xodim PINFL: ${employeePinfl}`);

        // Matematik "mock" tekshiruv (imzoning uzunligi va formati orqali)
        if (pkcs7.length < 500) {
            return res.status(400).json({ success: false, message: "Imzo xato yoki to'liq emas (Invalid PKCS#7 length)." });
        }

        // Haqiqatdan ham tekshirish logikasi: (pseudo-code)
        /*
        const verifyResponse = await fetch('https://e-imzo.uz/api/v1/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pkcs7 })
        });
        const result = await verifyResponse.json();
        if (!result.isValid) throw new Error("CERTIFICATE IS INVALID");
        */

        // PKCS#7 base64 ko'rinishida bo'lishi kerak
        if (!/^[A-Za-z0-9+/=\s]+$/.test(pkcs7)) {
            return res.status(400).json({ success: false, message: "Imzo formati noto'g'ri (base64 emas)." });
        }

        // DIQQAT: sertifikat haqiqiyligi hali serverda tekshirilmaydi (DSQ API ulanmagan).
        // Ilgari javob "Verified" deb yozardi — bu foydalanuvchini chalg'itardi.
        res.json({
            success: true,
            verified: false,
            simulated: true,
            message: "Imzo qabul qilindi (sertifikat server tomonida hali tekshirilmaydi)",
            verification_id: "SIM-" + Date.now().toString(36).toUpperCase()
        });
    } catch (error) {
        console.error("E-Imzo tekshirishda xatolik:", error);
        res.status(500).json({ success: false, message: "Imzo tekshirish imkoni bo'lmadi" });
    }
});

module.exports = router;
