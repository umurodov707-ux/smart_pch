# ZKTeco Barmoq Izi Qurilmasini Sozlash (ZK4500 / ZK9500)

Ushbu qo'llanma barmoq izi skanerini Smart PCH tizimiga ulash uchun kerak.

## 1. Drayverni yuklab olish
Qurilma ishlashi uchun **ZKFinger SDK 5.0** o'rnatilgan bo'lishi shart.
- **Rasmiy havola:** [ZKTeco Download Center](https://www.zkteco.com/en/download_cat/SDK.html)
- **Qidiruv:** "ZKFinger SDK 5.0" yoki "ZK4500 Driver for Windows 10"

## 2. O'rnatish bosqichlari (Sizning rasmingiz bo'yicha)
1. Rasmingizda ko'ringan **`setup.exe`** faylini toping.
2. Uni sichqonchaning o'ng tugmasi bilan bosib, **"Запуск от имени администратора"** (Administrator sifatida ishga tushirish) ni tanlang.
3. O'rnatish oynasi ochilganda "Next" tugmalarini bosib oxirigacha boring.
4. O'rnatish yakunlangach, kompyuterni qayta yoqing.

## 3. Loyihaga bog'lash (Muhim!)
O'rnatishdan so'ng, tizim ishga tushishi uchun:
1. Rasmingizdagi **`C#`** papkasining ichiga kiring.
2. U yerda **`libzkfp.dll`** (yoki shunga o'xshash nomdagi) faylni qidiring.
3. Ushbu faylni loyihangizdagi `zk-bridge` papkasiga (Bridge.exe joylashgan joyga) nusxalab oling.

## 4. Bridge-ni ishga tushirish
`START_HARDWARE_BRIDGE.bat` faylini oching. Agar hammasi to'g'ri bo'lsa, qora oynada quyidagicha yozuv chiqadi:
`✅ ZKTeco SDK drayveri topildi va ishga tushdi.`

Endi brauzerda barmoq izini ro'yxatdan o'tkazish tugmasini bosib, barmog'ingizni qo'ysangiz bazaga saqlaydi.
