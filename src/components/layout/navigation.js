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
} from 'lucide-react';

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

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items.map((item) => ({ ...item, group: g.label })));

export function findNavItem(pathname) {
  return (
    NAV_ITEMS.find((i) => i.path === pathname) ||
    NAV_ITEMS.filter((i) => !i.end && pathname.startsWith(i.path + '/')).sort((a, b) => b.path.length - a.path.length)[0]
  );
}
