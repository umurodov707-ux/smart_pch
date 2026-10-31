import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GitFork, Plus, RefreshCw, Search, Trash2, ChevronRight, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { allowedBolinmalar, pu29Wide } from '../utils/bolinma';
import SwitchJournal, { fmtDate } from '../components/pu29/SwitchJournal';
import { LINE_CATEGORIES, RAIL_TYPES, liveStats, normalizeCategory, recordIssues, recordStatus } from '../components/pu29/norms.js';
import '../components/pu29/pu29.css';

const STATUS = {
  ok: { label: 'Soz', cls: 'ok' },
  warning: { label: 'Ogohlantirish', cls: 'warning' },
  danger: { label: 'Xavfli', cls: 'danger' },
  none: { label: 'Tekshirilmagan', cls: 'none' },
};
const fmtNum = (v) => (v === null || v === undefined ? '—' : String(Math.round(v * 10) / 10).replace('.', ','));

export default function Pu29Page() {
  const { user } = useAuth();
  // Har bir bo'linma faqat o'z strelkalarini ko'radi (server ham shuni tekshiradi)
  const options = useMemo(() => allowedBolinmalar(user, pu29Wide), [user]);
  const [bolinma, setBolinma] = useState(() => {
    try { const s = localStorage.getItem('pu29_bolinma'); if (s && options.includes(s)) return s; } catch { /* yo'q */ }
    return options[0] || '';
  });
  const [switches, setSwitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', category: 'all', type: 'all', q: '' });
  const [adding, setAdding] = useState(false);
  const [newNo, setNewNo] = useState('');

  // foydalanuvchi ma'lumoti keyinroq yuklanadi — ro'yxat paydo bo'lganda birinchisini tanlaymiz
  useEffect(() => { if (!options.includes(bolinma)) setBolinma(options[0] || ''); }, [bolinma, options]);
  useEffect(() => { try { if (bolinma) localStorage.setItem('pu29_bolinma', bolinma); } catch { /* ahamiyatsiz */ } }, [bolinma]);

  const load = useCallback(async (quiet) => {
    if (!bolinma) { setLoading(false); return; }
    if (!quiet) setLoading(true);
    setError('');
    try {
      const r = await api.get(`/api/pu29/${encodeURIComponent(bolinma)}/switches`);
      setSwitches(r.switches || []);
    } catch (e) {
      setError(e.message || 'Yuklab bo‘lmadi');
    } finally {
      setLoading(false);
    }
  }, [bolinma]);
  useEffect(() => { setSelected(null); load(); }, [load]);

  const enriched = useMemo(() => switches.map((s) => {
    const values = s.last ? s.last.data : null;
    const meta = s.meta || {};
    return {
      ...s,
      category: normalizeCategory(meta.lineCategory || 'asosiy'),
      status: values ? recordStatus(values, meta) : 'none',
      issues: values ? recordIssues(values, meta) : [],
      stats: values ? liveStats(values) : {},
    };
  }), [switches]);

  const filtered = enriched.filter((s) => (filters.status === 'all' || s.status === filters.status)
    && (filters.category === 'all' || s.category === filters.category)
    && (filters.type === 'all' || (s.meta.type || 'R-65') === filters.type)
    && (!filters.q || String(s.switch_number).includes(filters.q.trim()) || String(s.meta.station || '').toLowerCase().includes(filters.q.trim().toLowerCase())));
  const counts = { total: filtered.length, ok: 0, warning: 0, danger: 0, none: 0 };
  filtered.forEach((s) => { counts[s.status]++; });

  const addSwitch = async () => {
    const no = newNo.trim();
    if (!no) return;
    try {
      await api.post(`/api/pu29/${encodeURIComponent(bolinma)}/switches`, { switch_number: no, meta: { lineCategory: 'asosiy', type: 'R-65', marka: '1/11', station: (switches[0] && switches[0].meta.station) || '' } });
      setNewNo('');
      setAdding(false);
      await load(true);
      setSelected(no);
    } catch (e) { setError(e.message); }
  };

  const removeSwitch = async (s) => {
    const warn = s.checks ? `\n\nDiqqat: ${s.checks} ta tekshiruv ham o‘chiriladi (faqat admin).` : '';
    if (!window.confirm(`№ ${s.switch_number} strelka ro‘yxatdan o‘chirilsinmi?${warn}`)) return;
    try {
      await api.delete(`/api/pu29/${encodeURIComponent(bolinma)}/switches/${encodeURIComponent(s.switch_number)}`);
      if (selected === s.switch_number) setSelected(null);
      load(true);
    } catch (e) { setError(e.message); }
  };

  const current = selected ? enriched.find((s) => s.switch_number === selected) : null;

  if (!bolinma) {
    return (
      <div className="pu29">
        <div className="pu29-msg err">{user ? 'Profilingizga bo‘linma biriktirilmagan — PU-29 jurnalini ko‘rish uchun administratorga murojaat qiling.' : 'Yuklanmoqda…'}</div>
      </div>
    );
  }

  return (
    <div className="pu29">
      <div className="pu29-head no-print">
        <div className="pu29-title">
          <div className="ic"><GitFork size={22} /></div>
          <div>
            <h1>PU-29 Jurnal</h1>
            <p>Strelkali o‘tkazgichlarni tekshirish</p>
          </div>
        </div>
        <div className="pu29-head-r">
          {options.length > 1 ? (
            <select className="pu29-select" value={bolinma} onChange={(e) => setBolinma(e.target.value)} aria-label="Bo‘linma">
              {options.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          ) : bolinma ? <span className="pu29-own">{bolinma}</span> : null}
          <button type="button" className="pu29-icon" aria-label="Yangilash" onClick={() => load()}><RefreshCw size={16} className={loading ? 'spin' : ''} /></button>
        </div>
      </div>

      {error && <div className="pu29-msg err no-print">{error}</div>}

      <div className="pu29-layout">
        <aside className="pu29-side no-print">
          <button type="button" className={`pu29-side-main${!current ? ' on' : ''}`} onClick={() => setSelected(null)}>
            <LayoutGrid size={16} /> UMUMIY KO‘RINISH
          </button>
          {adding ? (
            <div className="pu29-add">
              <input autoFocus value={newNo} onChange={(e) => setNewNo(e.target.value)} placeholder="Strelka №" onKeyDown={(e) => { if (e.key === 'Enter') addSwitch(); if (e.key === 'Escape') setAdding(false); }} />
              <button type="button" className="pu29-btn gold small" disabled={!newNo.trim()} onClick={addSwitch}>Qo‘shish</button>
            </div>
          ) : (
            <button type="button" className="pu29-side-add" onClick={() => setAdding(true)}><Plus size={16} /> YANGI STRELKA</button>
          )}
          {LINE_CATEGORIES.map((cat) => {
            const list = enriched.filter((s) => s.category === cat.id);
            if (!list.length) return null;
            return (
              <div key={cat.id} className="pu29-side-group">
                <div className="g">{cat.label} <span>{list.length}</span></div>
                {list.map((s) => (
                  <div key={s.switch_number} className={`pu29-side-item${selected === s.switch_number ? ' on' : ''}`}>
                    <button type="button" onClick={() => setSelected(s.switch_number)}>
                      <i className={`dot ${STATUS[s.status].cls}`} aria-label={STATUS[s.status].label} />
                      № {s.switch_number}
                      <ChevronRight size={14} className="chev" />
                    </button>
                    <button type="button" className="del" aria-label={`№ ${s.switch_number} ni o‘chirish`} onClick={() => removeSwitch(s)}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            );
          })}
          {!loading && !enriched.length && <div className="pu29-side-empty">Strelkalar yo‘q</div>}
        </aside>

        <main className="pu29-main">
          {current ? (
            <SwitchJournal
              key={`${bolinma}/${current.switch_number}`}
              bolinma={bolinma}
              sw={current}
              switches={enriched}
              user={user}
              onSelect={setSelected}
              onBack={() => setSelected(null)}
              onChanged={() => load(true)}
            />
          ) : (
            <div className="pu29-dash">
              <div className="pu29-kpis">
                <div className="k total"><span>JAMI</span><b>{counts.total}</b></div>
                <div className="k ok"><span>SOZ</span><b>{counts.ok}</b></div>
                <div className="k warning"><span>OGOHLANTIRISH</span><b>{counts.warning}</b></div>
                <div className="k danger"><span>XAVFLI</span><b>{counts.danger}</b></div>
              </div>

              <div className="pu29-panel">
                <div className="pu29-panel-h">
                  <div>
                    <div className="eyebrow">{bolinma}</div>
                    <h2>STRELKALAR DIAGNOSTIKASI</h2>
                  </div>
                  <div className="pu29-filters">
                    <label className="search"><Search size={14} /><input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="№ yoki stansiya" /></label>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} aria-label="Holat">
                      <option value="all">Barcha holatlar</option>
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} aria-label="Yo‘l turi">
                      <option value="all">Barcha yo‘llar</option>
                      {LINE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} aria-label="Rels turi">
                      <option value="all">Barcha relslar</option>
                      {RAIL_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                {counts.danger > 0 && <div className="pu29-alert">{counts.danger} ta strelkada xavfli chetlanish bor — tekshiring.</div>}
                {counts.none > 0 && <div className="pu29-note">{counts.none} ta strelka hali tekshirilmagan.</div>}

                {LINE_CATEGORIES.map((cat) => {
                  const list = filtered.filter((s) => s.category === cat.id);
                  if (!list.length) return null;
                  const c = { ok: 0, warning: 0, danger: 0 };
                  list.forEach((s) => { if (c[s.status] !== undefined) c[s.status]++; });
                  return (
                    <div key={cat.id} className={`pu29-group g-${cat.id}`}>
                      <div className="gh">
                        <b>{cat.label.toUpperCase()}</b><span className="n">{list.length} ta</span>
                        <span className="sum">{c.ok ? <em className="ok">Soz: {c.ok}</em> : null}{c.warning ? <em className="warning">Ogoh.: {c.warning}</em> : null}{c.danger ? <em className="danger">Xavfli: {c.danger}</em> : null}</span>
                      </div>
                      <div className="pu29-table-wrap">
                        <table className="pu29-list">
                          <thead><tr><th>№</th><th>Holat</th><th>Rels</th><th>Marka</th><th>Tonna</th><th>Yeyilish</th><th>Jelob</th><th>Oxirgi tekshiruv</th><th>Nosozliklar</th></tr></thead>
                          <tbody>
                            {list.map((s) => (
                              <tr key={s.switch_number} onClick={() => setSelected(s.switch_number)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelected(s.switch_number); }}>
                                <td className="no">№ {s.switch_number}<small>{s.meta.station}</small></td>
                                <td><span className={`st ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span></td>
                                <td><span className={`rail r${(s.meta.type || 'R-65').replace(/\D/g, '')}`}>{s.meta.type || 'R-65'}</span></td>
                                <td>{s.meta.marka || '1/11'}</td>
                                <td className="num">{fmtNum(s.stats.load)}<small> mln t</small></td>
                                <td className="num">{fmtNum(s.stats.wear)}<small> mm</small></td>
                                <td className="num">{fmtNum(s.stats.gutter)}<small> mm</small></td>
                                <td>{s.last ? fmtDate(s.last.date) : '—'}</td>
                                <td className="issues">
                                  {s.issues.length
                                    ? s.issues.slice(0, 4).map((i) => <span key={i.key} className={`chip ${i.level}`}>{i.label}: {i.value}</span>)
                                    : <span className="muted">—</span>}
                                  {s.issues.length > 4 && <span className="muted"> +{s.issues.length - 4}</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
                {!loading && !filtered.length && <div className="pu29-empty">Tanlangan filtr bo‘yicha strelka topilmadi.</div>}
                {loading && <div className="pu29-empty">Yuklanmoqda…</div>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
