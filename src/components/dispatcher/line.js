/**
 * PCH-16 liniyasi: stansiyalar va bo'linmalar uchastkalari (km).
 * Stansiyalar public/js/pchMap.js (PCH_STATIONS_DATA.pch16) dan olingan.
 * Uchastka chegaralari taxminiy — stansiyalar orasidagi o'rtacha nuqtalar.
 */
export const LINE_START = 4020;
export const LINE_END = 4310;

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

// [bo'linma raqami, boshlanish km, tugash km, boshliq]
export const SEGMENTS = [
  { n: 1, from: 4020, to: 4058, boss: 'Rajabov E.' },
  { n: 2, from: 4058, to: 4090, boss: 'Roziyev A.' },
  { n: 3, from: 4090, to: 4116, boss: 'Islomov S.' },
  { n: 4, from: 4116, to: 4160, boss: 'Atadjanov J.' },
  { n: 5, from: 4160, to: 4180, boss: 'Choriyev Y.' },
  { n: 6, from: 4180, to: 4205, boss: 'Islomov F.' },
  { n: 7, from: 4205, to: 4250, boss: 'Mambetov A.' },
  { n: 8, from: 4250, to: 4258, boss: 'Qutimov R.' },
  { n: 9, from: 4258, to: 4290, boss: 'Kerimov U.' },
  { n: 10, from: 4290, to: 4310, boss: 'Davletov Sh.' },
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
