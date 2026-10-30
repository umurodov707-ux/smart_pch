import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MailOpen, Cpu, Gauge, ArrowUpRight, Activity, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { NAV_ITEMS } from '../components/layout/navigation';
import { Card, CardHeader, CardBody, Badge, Skeleton, Button, cn } from '../components/ui';

// Har bir so'rov alohida: bittasi xato bersa, qolganlari baribir ko'rsatiladi
async function safe(promise) {
  try {
    return await promise;
  } catch (e) {
    return null;
  }
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Xayrli tun';
  if (h < 12) return 'Xayrli tong';
  if (h < 18) return 'Xayrli kun';
  return 'Xayrli kech';
}

function StatTile({ label, value, icon: Icon, tone, to, loading }) {
  return (
    <Link to={to} className="group">
      <Card interactive className="p-5 h-full">
        <div className="flex items-start justify-between">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', tone)}>
            <Icon size={19} />
          </div>
          <ArrowUpRight
            size={16}
            className="text-slate-600 group-hover:text-amber-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition"
          />
        </div>
        <div className="mt-4">
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-3xl font-extrabold text-slate-100 tabular-nums tracking-tight">{value ?? '—'}</div>
          )}
          <div className="text-xs font-medium text-slate-500 mt-1">{label}</div>
        </div>
      </Card>
    </Link>
  );
}

// Qismlarning umumiy ulushi: gorizontal bo'lingan chiziq + izoh
function SegmentBar({ segments, loading, emptyText }) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          {segments.map((s) => <Skeleton key={s.label} className="h-10" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex h-3 w-full gap-[2px] rounded-full overflow-hidden bg-slate-800/60">
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <div
                key={s.label}
                className={cn('h-full transition-[width] duration-700 first:rounded-l-full last:rounded-r-full hover:brightness-110', s.color)}
                style={{ width: `${(s.value / total) * 100}%` }}
                title={`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`}
              />
            ))}
      </div>
      {total === 0 ? (
        <p className="text-xs text-slate-500">{emptyText}</p>
      ) : (
        <dl className="grid grid-cols-3 gap-3">
          {segments.map((s) => (
            <div key={s.label} className="min-w-0">
              <dt className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 truncate">
                <span className={cn('w-2 h-2 rounded-sm shrink-0', s.color)} />
                {s.label}
              </dt>
              <dd className="mt-1 text-lg font-bold text-slate-100 tabular-nums">
                {s.value}
                <span className="ml-1 text-xs font-medium text-slate-500">
                  {Math.round((s.value / total) * 100)}%
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default function MainDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ hr: null, appeals: null, izostiklar: null, devices: null });
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  async function load() {
    setLoading(true);
    const [hr, appeals, izostiklar, devices] = await Promise.all([
      safe(api.get('/api/hr/stats')),
      safe(api.get('/api/murojaat/stats/summary')),
      safe(api.get("/api/izostiklar/1-bo'linma")),
      safe(api.get('/api/metrology/devices')),
    ]);
    setData({ hr, appeals, izostiklar, devices });
    setUpdatedAt(new Date());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const { hr, appeals, izostiklar, devices } = data;
  const online = !loading && (hr || appeals || izostiklar || devices);

  const stats = [
    { label: 'Jami xodimlar', value: hr?.total, icon: Users, tone: 'bg-emerald-500/10 text-emerald-400', to: '/dashboard/hr' },
    { label: 'Kutilayotgan murojaatlar', value: appeals?.pending ?? (appeals ? 0 : null), icon: MailOpen, tone: 'bg-amber-500/10 text-amber-400', to: '/dashboard/appeals' },
    { label: 'Izostik obyektlari', value: Array.isArray(izostiklar) ? izostiklar.length : null, icon: Cpu, tone: 'bg-blue-500/10 text-blue-400', to: '/dashboard/izostiklar' },
    { label: 'Metrologiya asboblari', value: Array.isArray(devices) ? devices.length : null, icon: Gauge, tone: 'bg-purple-500/10 text-purple-400', to: '/dashboard/metrology' },
  ];

  const modules = NAV_ITEMS.filter((i) => !i.end);

  return (
    <>
      {/* Salomlashish */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-slate-500">{greeting()},</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
              {user?.name || user?.username || 'Foydalanuvchi'}
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Dispetcherlik, kadrlar, murojaatlar va texnik jurnallar — barchasi bir joyda.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {loading ? (
              <Badge>Tekshirilmoqda...</Badge>
            ) : online ? (
              <Badge tone="success" dot>Server ishlayapti</Badge>
            ) : (
              <Badge tone="danger" dot>Server javob bermayapti</Badge>
            )}
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load} loading={loading}>
              Yangilash
            </Button>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatTile key={s.label} {...s} loading={loading} />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            icon={MailOpen}
            title="Murojaatlar holati"
            description={appeals ? `Jami ${appeals.total || 0} ta murojaat` : 'Ma‘lumot yo‘q'}
            action={<Link to="/dashboard/appeals" className="text-xs font-semibold text-amber-400 hover:underline">Barchasi</Link>}
          />
          <CardBody>
            <SegmentBar
              loading={loading}
              emptyText="Hozircha murojaatlar yo‘q."
              segments={[
                { label: 'Tasdiqlangan', value: appeals?.approved || 0, color: 'bg-emerald-500' },
                { label: 'Kutilmoqda', value: appeals?.pending || 0, color: 'bg-amber-500' },
                { label: 'Rad etilgan', value: appeals?.rejected || 0, color: 'bg-red-500' },
              ]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            icon={Users}
            title="Xodimlar holati"
            description={hr ? `Jami ${hr.total || 0} nafar xodim` : 'Ma‘lumot yo‘q'}
            action={<Link to="/dashboard/hr" className="text-xs font-semibold text-amber-400 hover:underline">Barchasi</Link>}
          />
          <CardBody>
            <SegmentBar
              loading={loading}
              emptyText="Xodimlar ro‘yxati bo‘sh."
              segments={[
                { label: 'Faol', value: hr?.active || 0, color: 'bg-emerald-500' },
                { label: 'Ta‘tilda', value: hr?.on_vacation || 0, color: 'bg-blue-500' },
                { label: 'Nofaol', value: hr?.inactive || 0, color: 'bg-slate-500' },
              ]}
            />
          </CardBody>
        </Card>
      </section>

      {/* Bo'limlar */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-amber-400" />
          <h2 className="text-sm font-bold text-slate-200">Bo‘limlar</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((m) => (
            <Link
              key={m.path}
              to={m.path}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-amber-400 flex items-center justify-center shrink-0 transition">
                <m.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">{m.label}</div>
                <div className="text-[11px] text-slate-500">{m.group}</div>
              </div>
              <ArrowUpRight size={15} className="text-slate-600 group-hover:text-amber-400 transition" />
            </Link>
          ))}
        </div>
      </section>

      {updatedAt && (
        <p className="text-[11px] text-slate-600 text-right tabular-nums">
          Yangilangan: {updatedAt.toLocaleTimeString('uz-UZ')}
        </p>
      )}
    </>
  );
}
