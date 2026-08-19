# Tuzatishlar hisoboti — Smart PCH

## 1. PU-74 tugmasi nega ishlamasdi

Ikkita alohida sabab bor edi:

**Frontend.** `DashboardLayout.jsx:25` da `/dashboard/pu74` menyu bandi bor edi, lekin
`App.jsx` da unga mos `<Route>` yo'q edi. Natijada eng pastdagi
`<Route path="*" element={<Navigate to="/dashboard" />} />` qoidasi ishga tushib,
foydalanuvchini hech qanday xabarsiz asosiy panelga qaytarib yuborardi —
tashqaridan bu "tugma bosilmayapti"dek ko'rinardi.

**Backend.** `routes/pu74.js:46` da:

```js
const user_bolinma = req.user?.bolinmalar ? JSON.parse(req.user.bolinmalar)[0] : null;
```

`req.user.bolinmalar` ni auth middleware ALLAQACHON massivga aylantirib bergan.
Uni qayta `JSON.parse` qilish `SyntaxError` bilan yiqilardi, ya'ni
`POST /api/pu74/records` har doim 500 qaytarardi. Route yaratilganda ham
saqlash ishlamas edi.

Xuddi shu xato `routes/files.js` da yana 3 joyda bor edi — ular ham tuzatildi.

### Nima qo'shildi

- `src/pages/Pu74Page.jsx` — to'liq ishlaydigan jurnal: ro'yxat, qidiruv,
  holat filtri, statistika kartalari, yangi dalolatnoma modali, o'chirish.
- `src/utils/api.js` — markazlashgan API mijoz (token + `X-Requested-With` avtomatik,
  401 da sessiyani tozalaydi, xatolarni bir xil formatga keltiradi).
- `src/pages/ComingSoonPage.jsx` — menyudagi PU-29 va AI Dispetcher ham
  route'siz edi; endi jimgina qaytarish o'rniga aniq xabar ko'rsatiladi.
- `routes/pu74.js` qayta yozildi: `GET /records/:id`, `PUT /records/:id` qo'shildi,
  validatsiya, bo'linma bo'yicha filtrlash, IDOR tekshiruvlari.

---

## 2. Xavfsizlik tuzatishlari

| # | Muammo | Fayl | Yechim |
|---|--------|------|--------|
| 1 | Google OAuth `aud` tekshirilmasdi — istalgan Google ilovasi tokeni bilan kirish mumkin edi | `routes/auth.js` | `aud`, `iss`, `exp`, `email_verified` tekshiriladi; `GOOGLE_CLIENT_ID` majburiy |
| 2 | Path traversal: `department` to'g'ridan-to'g'ri `path.join` ga | `routes/files.js` | `sanitizeSegment()` + natijaviy yo'l `uploads/` ichida ekanini tasdiqlash |
| 3 | Fayl turi filtri yo'q edi | `routes/files.js` | Oq/qora ro'yxat, qo'sh kengaytma himoyasi, 50MB → 25MB |
| 4 | IDOR: istalgan foydalanuvchi istalgan yozuvni o'chira/ko'ra olardi | `pu74.js`, `files.js` | `hasAccessToBolinma()` tekshiruvi barcha yozish/o'qish yo'llarida |
| 5 | Socket.io autentifikatsiyasiz — istalgan odam `dispetcher` xonasiga kirib barcha hisobotlarni o'qiy olardi | `index.js` | JWT `io.use()` middleware + xonaga ruxsat tekshiruvi |
| 6 | CSP da `'unsafe-inline'` | `index.js` | Sozlanuvchi qilindi. **Odatiy holat o'zgarmadi** — eski `public/` ilovasi inline `onclick` ga tayangani uchun uni o'chirish barcha tugmalarni buzardi. `STRICT_CSP=true` bilan yoqiladi |
| 7 | `express.json({limit:'50mb'})` hamma joyda — DoS vektori | `index.js` | Odatiy 10MB, katta yuklamalar (fayl/imzo/AI) uchun 25MB |
| 8 | Login xabari foydalanuvchi mavjudligini oshkor qilardi | `routes/auth.js` | Yagona xabar + timing attack himoyasi |
| 9 | Parol minimal 6 belgi, bcrypt rounds 10 | `routes/auth.js` | 8 belgi + harf/raqam talabi, rounds 12 |
| 10 | Rol maydoni validatsiyasiz — ixtiyoriy qiymat yozish mumkin edi | `routes/auth.js` | Oq ro'yxat |
| 11 | Zaif `JWT_SECRET` tekshirilmasdi | `middleware/auth.js` | <32 belgi: productionda to'xtatadi, devda ogohlantiradi |

---

## 3. Barqarorlik va ishlash tuzatishlari

- **Race condition** (`db.js` + `index.js`): `db.init()` async edi, lekin natijasi
  kutilmasdi — server jadvallar yaratilmasdan turib so'rov qabul qilishi mumkin edi.
  Endi `db.whenReady()` Promise'i `server.listen()` dan oldin kutiladi.
- **Har so'rovda DB zapros** (`middleware/auth.js`): har bir requestda
  `SELECT * FROM users` bajarilardi. 30 soniyalik kesh qo'shildi;
  rol/parol/status o'zgarganda kesh avtomatik tozalanadi.
- **Error handler noto'g'ri joyda** (`index.js`): `server.listen()` dan keyin
  ro'yxatdan o'tardi. Endi barcha marshrutlardan keyin, listen'dan oldin.
- **`/api` uchun 404 handler**: mavjud bo'lmagan API manzillari endi SPA
  `index.html` o'rniga toza JSON qaytaradi.
- **Himoyasiz `JSON.parse`**: `utils/safe.js` yaratildi
  (`safeParse`, `safeArray`, `safeObject`, `firstBolinma`, `sanitizeSegment`).
  Buzuq ma'lumot endi serverni yiqitmaydi.
- **`uncaughtException`**: ilgari faqat log yozib, jarayon nosog'lom holatda
  ishlashda davom etardi. Endi log + nazorat ostida yopilish (pm2/render qayta ko'taradi).
- **Graceful shutdown**: `SIGINT` qo'shildi, 10 soniyalik majburiy timeout.
- **Buzuq JSON**: HTML xato sahifasi o'rniga toza JSON javob.

---

## 4. Konfiguratsiya tuzatishlari

- **`package.json`**: `multer` dependencies'da yo'q edi (faqat `server/node_modules`
  ichida mavjud). Toza `npm ci` da server ishga tushmasdi — qo'shildi.
- **`vite.config.js`**: proxy `localhost:6878` ga qattiq bog'langan edi, server esa
  `PORT || 4000` da. Endi `.env` dan o'qiladi — port qanday bo'lsa ham mos keladi.

---

## 5. Ishga tushirishdan oldin

1. `.env` ga yangi o'zgaruvchini qo'shing:

   ```
   GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   ```

   **Busiz Google orqali kirish 503 qaytaradi.** Agar Google login umuman
   ishlatilmasa — e'tibor bermasangiz ham bo'ladi.

2. Paketlarni yangilang:

   ```
   npm install
   ```

3. `JWT_SECRET` ni tekshiring — productionda 32 belgidan qisqa bo'lsa server
   ishga tushmaydi:

   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. `STRICT_CSP` ni **yoqmang** — eski `public/` ilovasi inline `onclick` ga
   tayanadi. Uni faqat public/ React'ga to'liq ko'chirilgandan keyin yoqing.

---

## 5a. Qaysi frontend ishlayotgani haqida

Bu muhim, chunki loyihada ikkita alohida frontend bor:

| Manzil | Nima ko'rinadi | Fayllar |
|--------|----------------|---------|
| `localhost:4000` (Express) | **Eski vanilla JS ilova** | `public/` |
| `localhost:3000` (`npm run frontend:dev`) | **Yangi React ilova** | `src/` |

`server/index.js` production'da faqat `public/` ni uzatadi — `dist/` (React build)
umuman uzatilmaydi. Ya'ni deploy qilingan saytda hozircha faqat eski ilova ishlaydi.

**PU-74 tugmasi ikkala ilovada ham bor va ular butunlay boshqa kod:**

- Eski (`public/index.html:792`) → `window.openPU74Window()` → `public/js/pu74.js`
  → Excel jurnali (`1-brigada.xlsx`)
- Yangi (`src/components/DashboardLayout.jsx:25`) → `/dashboard/pu74`
  → `src/pages/Pu74Page.jsx` → `/api/pu74/records`

### Eski PU-74 da topilgan va tuzatilgan xato

`public/js/pu74.js:107` va `:1746` da `window.Auth.currentUser` himoyasiz
chaqirilardi (`window.Auth` ning o'zi tekshirilmagan). `auth.js` hali yuklanmagan
yoki sessiya tiklanmagan paytda bu
`TypeError: Cannot read properties of undefined (reading 'currentUser')`
xatosini berib, brigada tanlangandan keyin jurnal ochilmay qolardi.

Tuzatildi: fayl boshiga `window.Auth` uchun himoya qatlami qo'shildi va
ikkala joyda `window.Auth?.currentUser?.` ishlatildi.

---

## 6. Hali qolgan ishlar (tavsiya)

- **Ikki parallel frontend.** `public/` da 104 ta vanilla JS fayl, `src/` da React.
  `hr.js`, `timesheet.js`, `metrology.js`, `pu28.js` ikkala joyda takrorlanadi.
  Bu eng katta texnik qarz — bosqichma-bosqich React'ga ko'chirish kerak.
- **JWT localStorage'da.** Kelishuvga ko'ra o'zgartirilmadi. Kelajakda
  httpOnly cookie'ga o'tish XSS xavfini butunlay yopadi.
- **Testlar.** Faqat 2 ta smoke test bor. PU-74, auth va fayl yuklash uchun
  integratsion testlar yozilsa yaxshi bo'lardi.
- **Ikkita `node_modules`** (root + `server/`) — ~30 000 fayl. Bittaga birlashtirish
  deploy vaqtini sezilarli qisqartiradi.
