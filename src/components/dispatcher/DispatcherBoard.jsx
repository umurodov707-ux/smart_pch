import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Check, ChevronDown, ChevronRight, Copy, Download, PenLine, Printer, Undo2 } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../ui';
import LineSchema from './LineSchema';
import { SECTIONS, rowsOf, rowFilled, sectionState, DEADLINE, RAIL_HOT } from './sections.js';
import { STATUS, boardRows, counts, lineMarks, totals, railClass, telegramText, excelSheets } from './summary.js';

const FILTERS = [
  { k: 'all', label: 'Hammasi' },
  { k: 'submitted', label: 'Ko‘rib chiqish kerak' },
  { k: 'returned', label: 'Qaytarilgan' },
  { k: 'missing', label: 'Yubormagan', red: true },
  { k: 'accepted', label: 'Qabul qilingan' },
];

const ACTIONS = { submit: 'Yuborildi', resubmit: 'Qayta yuborildi', accept: 'Qabul qilindi', return: 'Qaytarildi' };
const hhmm = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

function download(bytes, name) {
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export default function DispatcherBoard({ date, isToday, nowHHMM, reports, loading, reload, onEdit, canReview = true }) {
  const toast = useToast();
  const rows = useMemo(() => boardRows(reports, isToday ? nowHHMM : '23:59'), [reports, isToday, nowHHMM]);
  const c = useMemo(() => counts(rows), [rows]);
  const marks = useMemo(() => lineMarks(rows), [rows]);
  const tot = useMemo(() => totals(rows), [rows]);
  const tg = useMemo(() => telegramText(date, rows, isToday ? nowHHMM : null), [date, rows, isToday, nowHHMM]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const [history, setHistory] = useState([]);

  // birinchi ko'rib chiqilmagan hisobot avtomatik tanlanadi
  useEffect(() => {
    if (selected && rows.some((r) => r.n === selected)) return;
    const first = rows.find((r) => r.status === 'submitted') || rows.find((r) => r.report) || rows[0];
    if (first) setSelected(first.n);
  }, [rows, selected]);

  const sel = rows.find((r) => r.n === selected) || null;
  const reportId = sel && sel.report ? sel.report.id : null;
  const reportVersion = sel && sel.report ? sel.report.version : null;
  const reportStatus = sel && sel.report ? sel.report.status : null;

  useEffect(() => { setComment(''); setOpen(null); }, [selected]);
  useEffect(() => {
    let alive = true;
    if (!reportId) { setHistory([]); return undefined; }
    api.get(`/api/reports/${reportId}/versions`).then((h) => { if (alive) setHistory(Array.isArray(h) ? h : []); }).catch(() => { if (alive) setHistory([]); });
    return () => { alive = false; };
  }, [reportId, reportVersion, reportStatus]);

  const visible = rows.filter((r) => filter === 'all' || r.status === filter);
  const missing = rows.filter((r) => !r.report);

  async function review(action) {
    if (!sel || !sel.report) return;
    if (action === 'return' && comment.trim().length < 3) { toast.error('Qaytarishda nimani tuzatish kerakligini yozing'); return; }
    setBusy(true);
    try {
      await api.post(`/api/reports/${sel.report.id}/review`, { action, comment: comment.trim() });
      toast.success(action === 'accept' ? `${sel.label}: hisobot qabul qilindi` : `${sel.label}: hisobot qaytarildi`);
      setComment('');
      await reload();
      if (action === 'accept') {
        const next = rows.find((r) => r.n !== sel.n && r.status === 'submitted');
        if (next) setSelected(next.n);
      }
    } catch (e) { toast.error(e.message || 'Saqlab bo‘lmadi'); } finally { setBusy(false); }
  }

  async function remind(list) {
    if (!list.length) return;
    try {
      const r = await api.post('/api/reports/remind', { bolinmalar: list.map((x) => x.id), date });
      toast.success(r.message || 'Eslatma yuborildi');
    } catch (e) { toast.error(e.message || 'Eslatma yuborilmadi'); }
  }

  async function exportExcel() {
    try {
      const { buildXlsx, XS } = await import('../pu29/pu29Xlsx.js');
      const bytes = await buildXlsx(excelSheets(date, rows, XS));
      download(bytes, `Kunlik_hisobot_PCH-16_${date}.xlsx`);
    } catch (e) { toast.error('Excel faylni yaratib bo‘lmadi'); }
  }

  async function copyTg() {
    try { await navigator.clipboard.writeText(tg); toast.success('Telegram matni nusxalandi'); } catch { toast.error('Nusxalab bo‘lmadi — matnni qo‘lda belgilang'); }
  }

  const f = sel && sel.facts;

  return (
    <div className="dsp-wrap">
      <div className="dsp-desk-only">
        <LineSchema rows={rows} marks={marks} selected={selected} onSelect={setSelected} />
      </div>

      <div className="dsp-tabs" role="toolbar" aria-label="Holat bo‘yicha saralash">
        {FILTERS.map((x) => (
          <button key={x.k} type="button" className={`dsp-tab${x.red ? ' red' : ''}`} aria-pressed={filter === x.k} onClick={() => setFilter(x.k)}>
            {x.label}<b>{c[x.k]}</b>
          </button>
        ))}
        {canReview && isToday && missing.length > 0 && (
          <button type="button" className="dsp-btn push" onClick={() => remind(missing)}><Bell size={15} /> Yubormaganlarga eslatish</button>
        )}
      </div>

      <div className="dsp-grid">
        <div>
          <div className="dsp-tablewrap"><table className="dsp-table">
            <thead><tr>
              <th>Bo‘linma</th><th>Holat</th><th>Yuborildi</th><th className="n">Ogohl.</th><th className="n">Nuqson</th>
              <th className="n">Rels t° maks</th><th className="n">Davomat</th><th className="col-fill">To‘liqligi</th>
            </tr></thead>
            <tbody>
              {visible.map((r) => {
                const st = STATUS[r.status];
                return (
                  <tr key={r.n} className={`${selected === r.n ? 'sel' : ''} ${r.report ? '' : 'miss'}`} onClick={() => setSelected(r.n)}
                    tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelected(r.n); }} aria-selected={selected === r.n}>
                    <td><div className="dsp-bn">{r.label}</div><div className="dsp-boss">{r.boss}</div></td>
                    <td><span className={`dsp-st ${st.cls}`}>{st.short}</span>{r.late && <div className="dsp-late">kechikdi</div>}</td>
                    <td>{r.report ? <>{r.report.time}{r.report.version > 1 && <div className="dsp-boss">{r.report.version}-versiya</div>}</>
                      : canReview && isToday ? <button type="button" className="dsp-btn sm" onClick={(e) => { e.stopPropagation(); remind([r]); }}>Eslatish</button> : '—'}</td>
                    <td className="n">{r.facts ? r.facts.warnings.length : '—'}</td>
                    <td className="n">{r.facts ? r.facts.defects.length : '—'}</td>
                    <td className={`n ${r.facts ? railClass(r.facts.maxRail) : ''}`}>{r.facts && r.facts.maxRail !== null ? `${r.facts.maxRail}°` : '—'}</td>
                    <td className="n">{r.facts && r.facts.hasAtt ? `${r.facts.attFact} / ${r.facts.attTotal}` : '—'}</td>
                    <td className="col-fill">{r.facts ? (
                      <div className="dsp-fill"><span className="dsp-bar"><i style={{ width: `${Math.round((r.facts.progress.filled / r.facts.progress.total) * 100)}%` }} /></span>{r.facts.progress.filled}/{r.facts.progress.total}</div>
                    ) : null}</td>
                  </tr>
                );
              })}
              {!visible.length && <tr><td colSpan={8} className="dsp-empty">Bu holatda bo‘linma yo‘q</td></tr>}
            </tbody>
          </table></div>

          {/* telefon: kartochkalar */}
          <div className="dsp-cards">
            <LineSchema compact rows={rows} marks={marks} selected={selected} onSelect={setSelected} />
            {visible.map((r) => {
              const st = STATUS[r.status];
              return (
                <button key={r.n} type="button" className={`dsp-pc${selected === r.n ? ' sel' : ''}`} onClick={() => { setSelected(r.n); document.getElementById('dsp-detail')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <span className="dsp-bn">{r.label}</span><span className={`dsp-st ${st.cls}`}>{st.short}</span>
                  <span className="x">{r.report ? (<>
                    <span>{r.report.time}</span><span>Ogohl. {r.facts.warnings.length}</span><span>Nuqson {r.facts.defects.length}</span>
                    {r.facts.maxRail !== null && <span className={railClass(r.facts.maxRail)}>{r.facts.maxRail}°</span>}
                    {r.status === 'returned' && r.report.review_comment && <span>“{r.report.review_comment}”</span>}
                  </>) : (<><span>{r.boss}</span>{r.late && <span className="hot">muddat o‘tdi</span>}</>)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="dsp-det" id="dsp-detail" aria-live="polite">
          {!sel ? <div className="dsp-empty">Bo‘linmani tanlang</div> : (
            <>
              <div className="dsp-det-h">
                <h3>{sel.label}</h3>
                <div className="meta">
                  Boshliq {sel.boss}
                  {sel.report && `, ${sel.report.time} da yuborgan${sel.report.version > 1 ? ` (${sel.report.version}-versiya)` : ''}`}
                </div>
                <div style={{ marginTop: 8 }}><span className={`dsp-st ${STATUS[sel.status].cls}`}>{STATUS[sel.status].label}</span></div>
              </div>
              {!sel.report ? (
                <div className="dsp-det-b">
                  <div className={`dsp-note ${sel.late ? 'r' : 'w'}`}>
                    <b>{isToday ? (sel.late ? `Muddat (${DEADLINE}) o‘tdi, hisobot yo‘q` : `Hisobot hali yuborilmagan (muddat ${DEADLINE})`) : 'Bu kun uchun hisobot yuborilmagan'}</b>
                    Bo‘linmaga eslatma yuboring yoki telefon orqali olib, o‘zingiz kiriting.
                  </div>
                  {canReview && <div className="dsp-actions">
                    {isToday && <button type="button" className="dsp-btn" onClick={() => remind([sel])}><Bell size={15} /> Eslatish</button>}
                    <button type="button" className="dsp-btn" onClick={() => onEdit(sel.n)}><PenLine size={15} /> Bo‘linma nomidan kiritish</button>
                  </div>}
                </div>
              ) : (
                <>
                  <div className="dsp-det-b">
                    {sel.status === 'returned' && sel.report.review_comment && (
                      <div className="dsp-note w" style={{ marginBottom: 10 }}><b>Qaytarilgan: bo‘linma tuzatmoqda</b>“{sel.report.review_comment}”</div>
                    )}
                    {f.warnings.map((w, i) => (
                      <div key={`w${i}`} className="dsp-fact"><b>Ogohlantirish {w.speed ? `${w.speed} km/soat` : ''}</b> {w.km || ''}{w.path ? `, ${w.path}` : ''}{w.time ? `, ${w.time}` : ''}
                        {(w.reason || w.resp) && <small>{[w.reason && `Sabab: ${w.reason}`, w.resp && `Mas’ul: ${w.resp}`].filter(Boolean).join('. ')}</small>}</div>
                    ))}
                    {f.defects.map((d, i) => (
                      <div key={`d${i}`} className="dsp-fact"><b>Nuqson {d.code || ''}</b> {d.loc || ''}{d.side ? `, ${d.side}` : ''}{d.size ? `, ${d.size}` : ''}
                        {d.action && <small>Chora: {d.action}</small>}</div>
                    ))}
                    {f.hottest && (
                      <div className={`dsp-fact ${f.hottest.v >= RAIL_HOT ? '' : 'y'}`}><b>Rels harorati {f.hottest.v}°</b> {f.hottest.time || ''}{f.hottest.info ? `, ${f.hottest.info}` : ''}{f.hottest.air ? ` (havo ${f.hottest.air}°)` : ''}</div>
                    )}
                    <div style={{ marginTop: 6 }}>
                      {SECTIONS.map((s) => {
                        const st = sectionState(sel.report.structuredData, s);
                        const list = rowsOf(sel.report.structuredData, s).filter((x) => rowFilled(s, x));
                        const isOpen = open === s.key;
                        return (
                          <React.Fragment key={s.key}>
                            <div className="dsp-sec">
                              <span className={st.state === 'done' ? 'ok' : st.state === 'error' ? 'req' : 'no'}>{st.state === 'done' ? '✓' : st.state === 'error' ? '!' : '–'}</span>
                              {list.length ? (
                                <button type="button" onClick={() => setOpen(isOpen ? null : s.key)} aria-expanded={isOpen}>
                                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} {s.title}
                                </button>
                              ) : <span>{s.title}</span>}
                              <span className="c">{st.state === 'done' ? `${st.count} ta` : st.state === 'none' ? 'bugun yo‘q' : st.state === 'error' ? 'xato' : 'to‘ldirilmagan'}</span>
                            </div>
                            {isOpen && (
                              <div style={{ overflowX: 'auto' }}>
                                <table className="dsp-mini">
                                  <thead><tr>{s.cols.map((col) => <th key={col.k}>{col.label}</th>)}</tr></thead>
                                  <tbody>{list.map((x, i) => (
                                    <tr key={i}>{s.cols.map((col) => <td key={col.k} className={s.key === 'temp' && col.k === 'rail' ? railClass(parseFloat(x.rail)) : ''}>{x[col.k] || ''}</td>)}</tr>
                                  ))}</tbody>
                                </table>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {history.length > 0 && (
                      <div className="dsp-hist">
                        {history.map((h) => (
                          <div key={h.id}>{hhmm(h.created_at)} — {ACTIONS[h.action] || h.action}{h.username ? `, ${h.username}` : ''}{h.comment ? `: “${h.comment}”` : ''}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  {canReview && <div className="dsp-det-f">
                    <label htmlFor="dsp-comment" style={{ display: 'block', color: '#5F6E75', fontSize: 12.5, marginBottom: 4 }}>Qaytarsangiz, nimani tuzatish kerak (bo‘linma shu matnni ko‘radi)</label>
                    <textarea id="dsp-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Masalan: davomat jami mos emas" />
                    <div className="dsp-row2">
                      <button type="button" className="dsp-btn red" disabled={busy} onClick={() => review('return')}><Undo2 size={15} /> Qaytarish</button>
                      <button type="button" className="dsp-btn go" disabled={busy || sel.status === 'accepted'} onClick={() => review('accept')}>
                        <Check size={15} /> {sel.status === 'accepted' ? 'Qabul qilingan' : 'Qabul qilish'}
                      </button>
                    </div>
                    <div style={{ marginTop: 8, textAlign: 'right' }}>
                      <button type="button" className="dsp-btn sm ghost" onClick={() => onEdit(sel.n)}><PenLine size={13} /> Hisobotni ochish</button>
                    </div>
                  </div>}
                </>
              )}
            </>
          )}
        </aside>
      </div>

      <div className="dsp-sum">
        <div className="dsp-card">
          <h4>Liniya bo‘yicha jami</h4>
          <div className="dsp-kpi">
            <div><b>{tot.warnings}</b><span>ogohlantirish</span></div>
            <div><b>{tot.defects}</b><span>nuqson</span></div>
            <div><b className={tot.hottest ? railClass(tot.hottest.v) : ''}>{tot.hottest ? `${tot.hottest.v}°` : '—'}</b><span>{tot.hottest ? `eng issiq rels, ${tot.hottestN}-bo‘l.` : 'rels harorati kiritilmagan'}</span></div>
            <div><b>{tot.attTotal ? `${tot.attFact} / ${tot.attTotal}` : '—'}</b><span>ishda / ro‘yxatda</span></div>
          </div>
          <div className="dsp-actions">
            <button type="button" className="dsp-btn ink" onClick={exportExcel} disabled={loading}><Download size={15} /> Yig‘ma Excel</button>
            <button type="button" className="dsp-btn" onClick={() => window.print()}><Printer size={15} /> Chop etish</button>
            <button type="button" className="dsp-btn" onClick={copyTg}><Copy size={15} /> Telegram matnini nusxalash</button>
          </div>
        </div>
        <div className="dsp-card">
          <h4>Telegram uchun tayyor matn</h4>
          <pre className="dsp-tg">{tg}</pre>
        </div>
      </div>
    </div>
  );
}
