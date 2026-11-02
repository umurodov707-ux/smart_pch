import {
  LayoutDashboard,
  Network,
  FileText,
  Calculator,
  Users,
  CalendarDays,
  Cpu,
  Microscope,
  Truck,
  Headset,
  Factory,
  Wallet,
  TrendingUp,
  HardHat,
  MapPinned,
  Gauge,
  Wrench,
} from 'lucide-react';
import { allowedBolinmalar } from '../../utils/bolinma';

const role = (u) => String((u && u.role) || '').toLowerCase();
const depts = (u) => (Array.isArray(u && u.departments) ? u.departments : []);
/** admin yoki shu bo'lim xodimi */
const inDept = (...ids) => (u) => role(u) === 'admin' || (role(u) === 'department' && ids.some((d) => depts(u).includes(d)));
const notBolinma = (u) => role(u) !== 'bolinma';

// Yon menyu va Ctrl+K qidiruvi shu ro'yxatdan quriladi
export const NAV_GROUPS = [
  {
    label: 'Umumiy',
    items: [
      { path: '/dashboard', label: 'Asosiy panel', icon: LayoutDashboard, end: true, keywords: 'bosh sahifa dashboard' },
      { path: '/dashboard/dispatcher', label: 'AI Dispetcher', icon: Network, keywords: 'dispetcher poyezd' },
      { path: '/dashboard/appeals', label: 'Raqamli Murojaat', icon: Headset, keywords: 'ariza murojaat viza' },
    ],
  },
  {
    label: 'Jurnallar',
    items: [
      { path: '/dashboard/pu29', label: 'PU-29 Jurnal', icon: FileText, keywords: 'strelka jurnal' },
      { path: '/dashboard/pu74', label: 'PU-74 Jurnal', icon: Calculator, keywords: 'dalolatnoma jurnal' },
    ],
  },
  {
    label: 'Kadrlar',
    items: [
      { path: '/dashboard/hr', label: 'Xodimlar (HR)', icon: Users, keywords: 'xodim kadr tabel' },
      { path: '/dashboard/leave', label: "Ta'tillar boshqaruvi", icon: CalendarDays, keywords: "ta'til otpusk" },
    ],
  },
  {
    label: 'Texnik bo\'limlar',
    items: [
      { path: '/dashboard/izostiklar', label: 'Izostiklar', icon: Cpu, keywords: 'izolyatsiya birikma' },
      { path: '/dashboard/metrology', label: 'Metrologiya', icon: Microscope, keywords: 'asbob elektr hisoblagich' },
      { path: '/dashboard/mechanics', label: "Mexanika bo'limi", icon: Truck, keywords: 'texnika transport yoqilgi' },
    ],
  },
];

// Eski interfeysdagi bo'lim oynalari: yangi saytning ichida ochiladi (/dashboard/bolim/:id)
// va keyingi bosqichlarda birma-bir yangi sahifalarga ko'chiriladi.
export const CLASSIC_DEPARTMENTS = [
  { id: 'ishlab-chiqarish', label: 'Ishlab chiqarish', icon: Factory, keywords: 'pu-28 pu-80 reja ishlab', show: inDept('ishlab-chiqarish') },
  { id: 'xodimlar', label: 'Xodimlar bo‘limi', icon: HardHat, keywords: 'kadr tabel tnu yo‘riqnoma', show: inDept('xodimlar') },
  { id: 'bugalteriya', label: 'Buxgalteriya', icon: Wallet, keywords: 'material akt m-29 ombor', show: inDept('bugalteriya') },
  { id: 'iqtisod', label: 'Iqtisod', icon: TrendingUp, keywords: 'iqtisodiy tahlil', show: inDept('iqtisod') },
  { id: 'mexanika', label: 'Mexanika (to‘liq)', icon: Wrench, keywords: 'texnika yo‘l varaqasi', show: inDept('mexanika') },
  { id: 'metrologiya', label: 'Metrologiya (to‘liq)', icon: Gauge, keywords: 'elektr hisoblagich', show: inDept('metrologiya') },
];

NAV_GROUPS.push(
  {
    label: 'Bo‘lim oynalari',
    items: CLASSIC_DEPARTMENTS.map((d) => ({ path: `/dashboard/bolim/${d.id}`, label: d.label, icon: d.icon, keywords: d.keywords, show: d.show })),
  },
  {
    label: 'Bo‘linmalar',
    items: Array.from({ length: 10 }, (_, i) => ({
      path: `/dashboard/bolim/bolinma${i + 1}`,
      label: `${i + 1}-bo‘linma`,
      icon: MapPinned,
      keywords: `bolinma ${i + 1} pu-28 pu-80 materiallar tnu`,
      // bo'linma faqat o'zini, bo'lim — biriktirilganlarini (yoki hammasini), admin — hammasini
      show: (u) => allowedBolinmalar(u).includes(`${i + 1}-bo'linma`),
    })),
  },
);

/** Foydalanuvchiga ko'rinadigan menyu */
export function navGroupsFor(user) {
  return NAV_GROUPS
    .map((g) => ({ ...g, items: g.items.filter((it) => !it.show || it.show(user)) }))
    .filter((g) => g.items.length);
}

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items.map((item) => ({ ...item, group: g.label })));

export function findNavItem(pathname) {
  return (
    NAV_ITEMS.find((i) => i.path === pathname) ||
    NAV_ITEMS.filter((i) => !i.end && pathname.startsWith(i.path + '/')).sort((a, b) => b.path.length - a.path.length)[0]
  );
}
