const express = require('express');
const router = express.Router();
const db = require('../db');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Debug log
const DEBUG_LOG = path.join(__dirname, '../debug_ai.log');
const logDebug = (msg) => {
    try {
        fs.appendFileSync(DEBUG_LOG, `[${new Date().toISOString()}] ${msg}\n`);
    } catch (e) {}
};

// DB helpers
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

/**
 * Gets technical regulations (PTE) and standards for Knowledge Base
 */
function getTechnicalBasics() {
    return `
--- TEMIR YO'L TEXNIK QOIDALARI (PTE) VA ME'YORLAR (PCH-GPT Bilim Bazasi) ---

== KOLEYA VA SHABLON ==
1. Standart koleya kengligi: 1520 mm. Egri qismlarda (R < 350 m): 1530 mm.
2. Ruxsat etilgan og'ish: +6 mm (kengayish), -4 mm (torayish). Tezkor yo'llarda: +4/-2 mm.
3. Shablon (keng tomon): 1512-1548 mm — 120 km/soat gacha. 1510-1548 mm — 100 km/soat gacha.
4. Profil (ko'ndalang qiyalik): Rels boshi profilining ruxsat etilgan yeyilishi — boshning kengligidan 12-15 mm oshsa, almashtirish.

== STRELKALI O'TKAZGICHLAR ==
5. Fly-gap (ostryak bilan ramali rels orasidagi ochiqlik): 4 mm dan oshmasligi shart.
6. Ostryak uchi yeyilishi: 2 mm dan oshsa, strelka ishlamay qolishi mumkin.
7. Strelka kanopi (korit): Ramali relsdagi griben yeyilishi 6 mm dan oshmasin.
8. PU-29 tekshiruvi: Har oyda 1 marta hajmdagi ko'rik. Yiliga 2 marta — nazoratchi bilan birgalikda.

== RELS YEYILISHI ==
9. Yon yeyilish (боковой износ): Asosiy yo'l (I sinf) — 12 mm, II sinf — 15 mm, III sinf — 18 mm.
10. Vertikal yeyilish: Р65 relsi uchun — 9 mm. Shundan oshganda almashtirish majburiy.
11. Rels yorig'i (darz): Har qanday qalinlikdagi ko'ndalang darz topilsa — darhol tezlik cheklovi (15-25 km/soat) va xabar.

== HARORAT VA RAZRYADKA ==
12. Razryadka (uzilish) harorati: Qishda harorat -40 ga tushganda, rels qisqarishi xavfi — nazorat kuchaytiriladi.
13. Rels kengayishi: +50°C va undan yuqori — har 2 soatda nazorat, 60°C — tezlik 40 km/soat gacha cheklanadi.
14. Нейтральная температура: Relsi payvandlashda 0°C yaqinida amalga oshirilishi maqsadga muvofiq.

== SHPALLAR VA BALLAST ==
15. Shpal soni: To'g'ri yo'l — 1840 dona/km. Egri yo'l (R<350m) — 2000 dona/km.
16. Beton shpallar xizmat muddati: 40-50 yil. Yog'ochniki: 15-25 yil.
17. Ballast qalinligi: Shpal osti — 25-30 sm. Shpal yon tomonida — 40-45 sm.
18. Ballast turi: Granitli chaqiq tosh — eng yuqori sinf. Gravel va shag'al — oddiy yo'llar uchun.

== RELS BIRIKMALARI VA PAYVANDLASH ==
19. Rels ulanish joyi (styk) bo'shlig'i: Haroratga qarab 0-12 mm. (t=-40°C da ~12 mm, t=+40°C da ~0 mm).
20. Payvandlash orqali uzluksiz rels (БСП): Bo'g'inlar yo'qoladi, silliq harakat ta'minlanadi, xizmat muddati uzayadi.
21. Payvandlash usullari: Termit (Золотарёв) — maydon uchun, elektro-kontakt (zahira) — zavod uchun.

== DEFEKTOSKOPIYA ==
22. Defektoskopiyadan o'tkazish davriyligi: I sinf yo'l — har 10 kunda, II sinf — har 15 kunda, III sinf — har 25 kunda.
23. Ultratovush defektoskopi: УД2-12, ДУК (Дорожная ультразвуковая карета) — rels ichidagi darzlarni aniqlaydi.
24. Defekt topilganda amal: Darhol "Preduprejdenie" (ogohlantirish, 25 km/soat) e'lon qilinadi.

== TEZLIK ME'YORLARI ==
25. Normal harakat: Shablon, profil, ballast normada bo'lsa — ruxsat etilgan tezlik (O'ZTY ko'rsatmasi bo'yicha).
26. Ogohlantirish (Preduprejdenie): Tezlik: 25 km/soat — jiddiy nuqson, 40 km/soat — kichik og'ish, 60 km/soat — ehtiyot.
`;
}

/**
 * Gets general system context for chat
 */
async function getSystemContext() {
    try {
        const empCount    = await dbGet('SELECT COUNT(*) as count FROM employees').catch(() => ({ count: '?' }));
        const defectCount = await dbGet("SELECT COUNT(*) as count FROM defects WHERE status = 'active'").catch(() => ({ count: '?' }));
        
        let ctx = `\n\n--- JORIY TIZIM HOLATI (${new Date().toLocaleString('uz-UZ')}) ---\n`;
        ctx += `- Jami xodimlar: ${empCount?.count || 0}\n`;
        ctx += `- Faol nuqsonlar: ${defectCount?.count || 0}\n`;
        ctx += getTechnicalBasics();
        return ctx;
    } catch (e) {
        logDebug('Context error: ' + e.message);
        return getTechnicalBasics();
    }
}

/**
 * AI CORE CHAT
 */
router.post('/chat', async (req, res) => {
    const { message, task, data } = req.body;

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.json({ response: "AI API kaliti sozlanmagan." });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        let systemPrompt = "";
        let userPrompt = message;

        // TASK: VOICE PARSING (For PU-29 and others)
        if (task === 'voice_parse') {
            systemPrompt = `Siz raqamli ma'lumotlarni parse qiluvchi yordamchisiz. 
            Foydalanuvchi aytgan gapdan faqat raqamlarni va ularning ma'nosini ajrating.
            Javobni FAQAT JSON formatida qaytaring. 
            Misol: "Shablon 1520, uroven nol" -> {"shablon": 1520, "uroven": 0}
            Hech qanday tushuntirish bermang, faqat JSON.`;
        } 
        
        // TASK: PREDICTIVE MAINTENANCE
        else if (task === 'predict_maintenance') {
            systemPrompt = `Siz temir yo'l infratuzilmasi tahlilchisisiz.
            Berilgan tarixiy o'lchovlar asosida ob'ektning kelajakdagi holatini bashorat qiling.
            Yeyilish tezligini va xavf darajasini aniqlang.
            O'zbek tilida, texnik jihatdan asoslangan, qisqa javob bering.`;
            userPrompt = `Ushbu ob'ekt o'lchovlari tarixini tahlil qiling va bashorat bering: ${JSON.stringify(data)}`;
        }

        // TASK: DEFECT FORECAST (Bo'linmalar bo'yicha nuqson xavfini bashoratlash)
        else if (task === 'predict_defects') {
            const stats = await dbAll(`
                SELECT bolinma_id,
                       COUNT(*) as total,
                       SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active_count,
                       SUM(CASE WHEN is_repeated=1 THEN 1 ELSE 0 END) as repeated_count,
                       AVG(degree) as avg_degree
                FROM defects
                GROUP BY bolinma_id
                ORDER BY active_count DESC
            `).catch(() => []);

            systemPrompt = `Siz temir yo'l infratuzilmasi bo'yicha bashoratchi tahlilchisiz.
Sizga bo'linmalar (PCH uchastkalari) bo'yicha joriy nuqsonlar statistikasi beriladi:
har bir bo'linma uchun jami nuqsonlar soni, faol (tuzatilmagan) nuqsonlar soni,
takrorlanuvchi nuqsonlar soni va o'rtacha og'irlik darajasi (degree).

Shu ma'lumotlar asosida:
1. Qaysi bo'linmalarda yaqin kelajakda nuqsonlar ko'payishi xavfi yuqoriroqligini aniqlang
   (faol nuqson soni ko'p, takrorlanish yuqori yoki og'irlik darajasi katta bo'lganlar xavfliroq).
2. Bo'linmalarni xavf darajasi bo'yicha (Yuqori/O'rta/Past) tartiblang.
3. Har bir yuqori xavfli bo'linma uchun bir jumlali asos ko'rsating.

O'zbek tilida, qisqa va texnik jihatdan asoslangan javob bering.
Javobni albatta quyidagi JSON formatida qaytaring:
{
  "response": "Foydalanuvchiga ko'rsatiladigan bashorat matni (Markdown **bold** bilan bo'linma nomlarini ajrating)",
  "action": "none",
  "params": {}
}`;
            userPrompt = `Bo'linmalar bo'yicha nuqson statistikasi: ${JSON.stringify(stats)}`;
        }

        // AGENT MODE (DEFAULT)
        else {
            const systemContext = await getSystemContext();
            systemPrompt = `Siz "PCH-Agent" — O'zbekiston Temir Yo'llari Smart PCH tizimi uchun AQLLI AGENT hisoblanasiz.
Siz faqat savolga javob bermaysiz, balki foydalanuvchi so'raganda AMALLAR ham bajarasiz.

Quyidagi amallarni bajara olasiz (action maydoni orqali):
- navigate_dispatcher: Dispetcher bo'limiga o'tish
- navigate_pu29: PU-29 strelkalar moduliga o'tish
- navigate_production: Ishlab chiqarish bo'limiga o'tish
- navigate_defect: Defektoskopiya moduliga o'tish
- navigate_hr: Kadrlar bo'limiga o'tish
- open_attendance: Davomat kiritish oynasini ochish
- open_warning: Ogohlantirish kiritish oynasini ochish
- open_report: Hisobot ko'rish
- show_stats: Tizim statistikasini ko'rsatish
- none: Faqat matn javob (amal yo'q)

JAVOB FORMATI: Har doim FAQAT quyidagi JSON formatida javob bering:
{
  "response": "Foydalanuvchiga ko'rsatiladigan matn (O'zbek tilida, qisqa va aniq)",
  "action": "action_nomi yoki none",
  "params": {}
}

TEMIR YO'L TEXNIK BILIMLAR:
${getTechnicalBasics()}

JORIY TIZIM:
${systemContext}

Muhim: Agar foydalanuvchi biror bo'limga o'tishni, ma'lumot kiritishni yoki biror narsa ko'rishni so'rasa — tegishli action qaytaring. Aks holda action: "none".`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nFoydalanuvchi so'rovi: ${userPrompt}` }]
                }],
                generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
            })
        });

        const result = await response.json();
        const rawReply = result.candidates?.[0]?.content?.parts?.[0]?.text || '{"response":"AI javob bera olmadi.","action":"none"}';
        
        // Handle JSON response for internal tasks
        if (task === 'voice_parse') {
            try {
                const cleaned = rawReply.replace(/```json|```/g, '').trim();
                return res.json(JSON.parse(cleaned));
            } catch (e) {
                return res.json({ error: "Parsing failed", raw: rawReply });
            }
        }

        // Parse agent response
        try {
            const cleaned = rawReply.replace(/```json|```/g, '').trim();
            const agentReply = JSON.parse(cleaned);
            return res.json({
                response: agentReply.response || rawReply,
                action: agentReply.action || 'none',
                params: agentReply.params || {}
            });
        } catch (e) {
            // Fallback: treat as plain text
            return res.json({ response: rawReply, action: 'none', params: {} });
        }

    } catch (err) {
        logDebug(`AI Error: ${err.message}`);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
