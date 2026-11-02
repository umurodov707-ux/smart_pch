/**
 * PCH-16 liniyasi: stansiyalar va bo'linmalar uchastkalari (km).
 * Stansiyalar public/js/pchMap.js (PCH_STATIONS_DATA.pch16) dan olingan.
 * Uchastka chegaralari — pastdagi izohga qarang.
 */
export const LINE_START = 4020;
export const LINE_END = 4304;

export const STATIONS = [
  { name: 'Navbahor', km: 4035 },
  { name: 'Yaxshilik', km: 4066 },
  { name: 'Parvoz', km: 4098 },
  { name: 'Qorlitog‘', km: 4137 },
  { name: 'Kiyikli', km: 4168 },
  { name: 'Xizirbobo', km: 4200 },
  { name: 'Jayhun', km: 4232 },
  { name: 'Dautepa', km: 4261 },
  { name: 'Turon', km: 4297 },
];

// Uchastka chegaralari eski tizimdagi bo'linmalar ro'yxatidan (public/js/script.js, subdivisions):
// 1: 4020–4050, 2: 4051–4083, 3: 4084–4117, 4: 4118–4150, 5: 4151–4183, 6: 4184–4205,
// 9: 4261–4289, 10: 4290–4303. 7 va 8 uchun km ko'rsatilmagan — 4206–4260 oralig'i
// stansiyalar bo'yicha bo'lingan (Jayhun 4232 — 7, Jayhun–Dautepa 4246 — 8).
export const SEGMENTS = [
  { n: 1, from: 4020, to: 4050.9, boss: 'Rajabov E.' },
  { n: 2, from: 4051, to: 4083.9, boss: 'Roziyev A.' },
  { n: 3, from: 4084, to: 4117.9, boss: 'Islomov S.' },
  { n: 4, from: 4118, to: 4150.9, boss: 'Atadjanov J.' },
  { n: 5, from: 4151, to: 4183.9, boss: 'Choriyev Y.' },
  { n: 6, from: 4184, to: 4205.9, boss: 'Islomov F.' },
  { n: 7, from: 4206, to: 4240.9, boss: 'Mambetov A.' },
  { n: 8, from: 4241, to: 4260.9, boss: 'Qutimov R.' },
  { n: 9, from: 4261, to: 4289.9, boss: 'Kerimov U.' },
  { n: 10, from: 4290, to: 4303.9, boss: 'Davletov Sh.' },
];

export const bolinmaName = (n) => `${n}-bo'linma`;
export const bolinmaLabel = (n) => `${n}-bo‘linma`;

/** "3-bo'linma" / "bolinma3" → 3 */
export function bolinmaNum(id) {
  const m = /(\d{1,3})/.exec(String(id || ''));
  return m ? Number(m[1]) : null;
}

/** Matndan km ni ajratish: "4098 km 3 pk" → 4098 */
export function parseKm(text) {
  const m = /(\d{4})(?:[.,](\d+))?\s*(?:km|км)?/i.exec(String(text || ''));
  if (!m) return null;
  const km = Number(m[1]);
  return km >= LINE_START - 20 && km <= LINE_END + 20 ? km : null;
}
