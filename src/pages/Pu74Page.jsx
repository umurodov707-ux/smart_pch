import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConfirm } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api, { ApiError } from '../utils/api';
// DIQQAT: lucide-react v1 da ba'zi ikonka nomlari o'zgargan.
// AlertTriangle -> TriangleAlert, CheckCircle2 -> CircleCheckBig,
// FileSignature -> FilePenLine. Eski nomlar `undefined` bo'lib,
// React "Element type is invalid" xatosi bilan sahifani yiqitadi.
import {
  ClipboardList, Plus, Search, Trash2, Save, X, RefreshCw, MapPin, Calendar,
  TriangleAlert as AlertTriangle,
  CircleCheckBig as CheckCircle2,
  FilePenLine as FileSignature,
} from 'lucide-react';

const WORK_TYPES = [
  'Joriy ta\'mirlash',
  'Kapital ta\'mirlash',
  'Rels almashtirish',
  'Shpal almashtirish',
  'Ballast tozalash',
  'Payvandlash',
  'Ko\'prik ko\'rigi',
  'Strelka ta\'miri',
  'Boshqa',
];

const STATUS_META = {
  draft: { label: 'Qoralama', cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  submitted: { label: 'Yuborilgan', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  approved: { label: 'Tasdiqlangan', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Rad etilgan', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  date: today(),
  act_number: '',
  location_name: '',
  km: '',
  pk: '',
  work_type: WORK_TYPES[0],
  bridge_id: '',
  status: 'draft',
  details: { executor: '', volume: '', note: '' },
});

export default function Pu74Page() {
  const confirm = useConfirm();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const userBolinma = user?.bolinmalar?.[0] || null;

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/pu74/records');
      setRecords(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ma\'lumotlarni yuklab bo\'lmadi');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Xabarlarni avtomatik o'chirish
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (statusFilter !== 'all' && (r.status || 'draft') !== statusFilter) return false;
      if (!q) return true;
      return [r.act_number, r.location_name, r.work_type, r.bolinma_id, r.km, r.pk]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [records, search, statusFilter]);

  const stats = useMemo(() => ({
    total: records.length,
    draft: records.filter((r) => (r.status || 'draft') === 'draft').length,
    approved: records.filter((r) => r.status === 'approved').length,
    thisMonth: records.filter((r) => (r.date || '').startsWith(today().slice(0, 7))).length,
  }), [records]);

  const openNew = () => {
    setForm(emptyForm());
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.act_number.trim()) return setFormError('Dalolatnoma raqamini kiriting');
    if (!form.location_name.trim()) return setFormError('Obyekt nomini kiriting');
    if (!form.date) return setFormError('Sanani tanlang');

    setSaving(true);
    try {
      await api.post('/api/pu74/records', {
        ...form,
        act_number: form.act_number.trim(),
        location_name: form.location_name.trim(),
        bolinma_id: isAdmin ? (form.bolinma_id || userBolinma) : undefined,
      });
      setShowForm(false);
      setForm(emptyForm());
      setNotice('Dalolatnoma saqlandi');
      await loadRecords();
    } catch (e2) {
      setFormError(e2 instanceof ApiError ? e2.message : 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!(await confirm({ title: `№${record.act_number} dalolatnomasi o'chirilsinmi?`, confirmText: "O'chirish", danger: true }))) return;
    try {
      await api.delete(`/api/pu74/records/${record.id}`);
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      setNotice('Dalolatnoma o\'chirildi');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'O\'chirishda xatolik');
    }
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setDetail = (key, value) =>
    setForm((f) => ({ ...f, details: { ...f.details, [key]: value } }));

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">PU-74 Jurnal</h1>
            <p className="text-xs text-slate-500 font-semibold">
              Bajarilgan ishlar dalolatnomalari
              {userBolinma && !isAdmin && <span className="text-amber-500/80"> · {userBolinma}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRecords}
            disabled={loading}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition disabled:opacity-50"
            title="Yangilash"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-sm hover:brightness-110 transition shadow-lg shadow-amber-500/10"
          >
            <Plus size={16} />
            Yangi dalolatnoma
          </button>
        </div>
      </div>

      {/* Bildirishnomalar */}
      {notice && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          <span className="flex items-center gap-2"><AlertTriangle size={16} /> {error}</span>
          <button onClick={() => setError('')} className="text-red-400/60 hover:text-red-400"><X size={14} /></button>
        </div>
      )}

      {/* Statistika */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Jami', value: stats.total, color: 'text-slate-100' },
          { label: 'Shu oyda', value: stats.thisMonth, color: 'text-amber-400' },
          { label: 'Qoralama', value: stats.draft, color: 'text-blue-400' },
          { label: 'Tasdiqlangan', value: stats.approved, color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{s.label}</div>
            <div className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filtrlar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={15} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Raqam, obyekt yoki ish turi bo'yicha qidirish..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none transition"
        >
          <option value="all">Barcha holatlar</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Jadval */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
            <span className="text-xs font-semibold">Yuklanmoqda...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
            <FileSignature size={32} className="opacity-40" />
            <span className="text-sm font-semibold">
              {records.length === 0 ? 'Hozircha dalolatnoma yo\'q' : 'Qidiruv bo\'yicha natija topilmadi'}
            </span>
            {records.length === 0 && (
              <button onClick={openNew} className="text-xs font-bold text-amber-500 hover:text-amber-400">
                Birinchisini qo'shish →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 font-extrabold">
                  <th className="text-left px-4 py-3">Dalolatnoma</th>
                  <th className="text-left px-4 py-3">Sana</th>
                  <th className="text-left px-4 py-3">Obyekt</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Km / PK</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Ish turi</th>
                  <th className="text-left px-4 py-3">Holat</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const meta = STATUS_META[r.status] || STATUS_META.draft;
                  return (
                    <tr key={r.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-200">№{r.act_number}</div>
                        {r.bolinma_id && <div className="text-[10px] text-slate-500 font-semibold">{r.bolinma_id}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{r.date}</td>
                      <td className="px-4 py-3 text-slate-300">{r.location_name}</td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell whitespace-nowrap">
                        {[r.km && `${r.km} km`, r.pk && `PK ${r.pk}`].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{r.work_type || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(r)}
                          className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/5 transition"
                          title="O'chirish"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Yangi dalolatnoma modali */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8 shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="font-black text-slate-100 flex items-center gap-2">
                <FileSignature size={18} className="text-amber-500" />
                Yangi PU-74 dalolatnomasi
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  <AlertTriangle size={14} /> {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Dalolatnoma raqami *" icon={<FileSignature size={13} />}>
                  <input
                    value={form.act_number}
                    onChange={(e) => setField('act_number', e.target.value)}
                    placeholder="74/2026-001"
                    className={inputCls}
                  />
                </Field>

                <Field label="Sana *" icon={<Calendar size={13} />}>
                  <input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} className={inputCls} />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Obyekt nomi *" icon={<MapPin size={13} />}>
                    <input
                      value={form.location_name}
                      onChange={(e) => setField('location_name', e.target.value)}
                      placeholder="Masalan: Buxoro — Kogon oralig'i"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Kilometr">
                  <input value={form.km} onChange={(e) => setField('km', e.target.value)} placeholder="245" className={inputCls} />
                </Field>

                <Field label="Piket (PK)">
                  <input value={form.pk} onChange={(e) => setField('pk', e.target.value)} placeholder="7" className={inputCls} />
                </Field>

                <Field label="Ish turi">
                  <select value={form.work_type} onChange={(e) => setField('work_type', e.target.value)} className={inputCls}>
                    {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </Field>

                <Field label="Ko'prik / inshoot ID">
                  <input value={form.bridge_id} onChange={(e) => setField('bridge_id', e.target.value)} placeholder="ixtiyoriy" className={inputCls} />
                </Field>

                <Field label="Ish bajaruvchi">
                  <input value={form.details.executor} onChange={(e) => setDetail('executor', e.target.value)} placeholder="F.I.Sh." className={inputCls} />
                </Field>

                <Field label="Hajm">
                  <input value={form.details.volume} onChange={(e) => setDetail('volume', e.target.value)} placeholder="Masalan: 120 m" className={inputCls} />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Izoh">
                    <textarea
                      value={form.details.note}
                      onChange={(e) => setDetail('note', e.target.value)}
                      rows={3}
                      placeholder="Qo'shimcha ma'lumot..."
                      className={`${inputCls} resize-none`}
                    />
                  </Field>
                </div>

                <Field label="Holat">
                  <select value={form.status} onChange={(e) => setField('status', e.target.value)} className={inputCls}>
                    <option value="draft">Qoralama</option>
                    <option value="submitted">Yuborilgan</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-bold transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-sm hover:brightness-110 transition disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputCls =
  'w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition';

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}
