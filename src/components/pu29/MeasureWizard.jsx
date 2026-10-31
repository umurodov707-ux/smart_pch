import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, TriangleAlert, Check, Send } from 'lucide-react';
import { STEPS, CHOICES, fieldInfo, isTextField } from './switchSchema.js';
import { cellLevel, normText, recordIssues } from './norms.js';
import SwitchSchematic from './SwitchSchematic.jsx';

const draftKey = (bolinma, sw) => `pu29_draft_${bolinma}_${sw}`;
const LV = { green: 'g', yellow: 'y', red: 'r' };

function readDraft(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

/**
 * Telefonda strelka bo'ylab qadamma-qadam o'lchov kiritish.
 * Qoralama telefonda saqlanib turadi (ilova yopilsa ham yo'qolmaydi).
 */
export default function MeasureWizard({ bolinma, sw, meta, onClose, onSave }) {
  const key = draftKey(bolinma, sw.switch_number);
  const saved = useMemo(() => readDraft(key), [key]);
  const [values, setValues] = useState(() => (saved && saved.values) || {});
  const [step, setStep] = useState(() => (saved && Number.isInteger(saved.step) ? Math.min(saved.step, STEPS.length) : 0));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const firstInput = useRef(null);
  const total = STEPS.length;
  const atSummary = step >= total;

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify({ values, step, ts: Date.now() })); } catch { /* xotira to'la */ }
  }, [key, values, step]);
  useEffect(() => { if (firstInput.current) firstInput.current.focus({ preventScroll: true }); }, [step]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const set = (k, v) => setValues((s) => {
    const n = { ...s };
    if (v === '' || v === null || v === undefined) delete n[k]; else n[k] = v;
    return n;
  });

  const filled = Object.keys(values).length;
  const issues = useMemo(() => recordIssues(values, meta), [values, meta]);
  const reds = issues.filter((i) => i.level === 'red').length;
  const yellows = issues.length - reds;
  const stepLevel = (s) => {
    const lv = s.keys.map((k) => { const f = fieldInfo(k); return cellLevel(f.type, values[k], meta, f.sec); });
    if (lv.includes('red')) return 'r';
    if (lv.includes('yellow')) return 'y';
    if (s.keys.some((k) => values[k] !== undefined)) return 'd';
    return '';
  };

  const finish = async (withDefects) => {
    if (!filled) { setError('Hech bo‘lmasa bitta o‘lchov kiriting'); return; }
    setBusy(true);
    setError('');
    try {
      await onSave(values, withDefects);
      try { localStorage.removeItem(key); } catch { /* ahamiyatsiz */ }
      onClose();
    } catch (e) {
      setError(`Saqlanmadi: ${e.message}. O‘lchovlar telefonda saqlanib turibdi — internet bo‘lganda qayta urinib ko‘ring.`);
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    if (filled && !window.confirm('Chiqasizmi? Kiritilgan o‘lchovlar qoralama sifatida saqlanib qoladi.')) return;
    onClose();
  };

  const discard = () => {
    if (!window.confirm('Qoralamadagi barcha o‘lchovlar o‘chirilsinmi?')) return;
    setValues({});
    setStep(0);
  };

  const cur = STEPS[Math.min(step, total - 1)];

  return (
    <div className="pu29w" role="dialog" aria-modal="true" aria-label={`Strelka № ${sw.switch_number} — o‘lchov kiritish`}>
      <div className="pu29w-box">
        <div className="pu29w-top">
          <div className="row">
            <button type="button" className="ic" aria-label="Yopish" onClick={cancel}><X size={22} /></button>
            <div className="ttl">
              <b>Strelka № {sw.switch_number}</b>
              <span>{[meta.station, meta.marka, meta.type].filter(Boolean).join(' · ')}</span>
            </div>
            <span className="cnt">{filled} ta</span>
          </div>
          <div className="prog">
            {STEPS.map((s, i) => (
              <button key={s.id} type="button" aria-label={`${i + 1}-qadam: ${s.title}`} className={`${i === step ? 'cur' : ''} ${stepLevel(s)}`} onClick={() => setStep(i)} />
            ))}
            <button type="button" aria-label="Xulosa" className={atSummary ? 'cur' : ''} onClick={() => setStep(total)} />
          </div>
        </div>

        {!atSummary ? (
          <div className="pu29w-body">
            <div className="step">{step + 1}-QADAM / {total}</div>
            <h2>{cur.title}</h2>
            <p className="hint">{cur.hint}</p>
            {cur.node && (
              <div className="mini">
                <SwitchSchematic values={values} meta={meta} compact focus={cur.node} />
              </div>
            )}
            {cur.keys.map((k, idx) => {
              const f = fieldInfo(k);
              const v = values[k] ?? '';
              const lv = cellLevel(f.type, v, meta, f.sec);
              const norm = normText(f.type, meta, f.sec);
              return (
                <div key={k} className={`fld ${LV[lv] || ''}`}>
                  <label htmlFor={`w-${k}`}>
                    <span>{f.label}</span>
                    {norm && <small>me’yor: {norm}</small>}
                  </label>
                  {isTextField(f.type) ? (
                    <div className="choices" id={`w-${k}`}>
                      {CHOICES[f.type].map((c) => (
                        <button key={c} type="button" aria-pressed={v === c} onClick={() => set(k, v === c ? '' : c)}>{c}</button>
                      ))}
                    </div>
                  ) : (
                    <input
                      id={`w-${k}`}
                      ref={idx === 0 ? firstInput : undefined}
                      value={v}
                      inputMode="decimal"
                      enterKeyHint={idx === cur.keys.length - 1 ? 'next' : 'next'}
                      autoComplete="off"
                      onChange={(e) => set(k, e.target.value.replace(/[^0-9.,\-+]/g, ''))}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return;
                        e.preventDefault();
                        const inputs = [...e.currentTarget.closest('.pu29w-body').querySelectorAll('input')];
                        const i = inputs.indexOf(e.currentTarget);
                        if (i >= 0 && i < inputs.length - 1) inputs[i + 1].focus();
                        else setStep((s) => s + 1);
                      }}
                    />
                  )}
                  {lv === 'red' && <div className="warn"><TriangleAlert size={14} /> Me’yordan tashqarida — xavfli. Qayta o‘lchang; to‘g‘ri bo‘lsa davom eting.</div>}
                </div>
              );
            })}
            <p className="skip">O‘lchanmagan kataklarni bo‘sh qoldiring.</p>
          </div>
        ) : (
          <div className="pu29w-body">
            <h2>Tekshiruv xulosasi</h2>
            <div className={`sumbar ${reds ? 'r' : yellows ? 'y' : filled ? 'g' : ''}`}>
              {filled
                ? `${reds} ta xavfli · ${yellows} ta ogohlantirish · ${filled - issues.length} ta me’yorda`
                : 'Hali o‘lchov kiritilmagan'}
            </div>
            <div className="list">
              {issues.map((i) => (
                <button key={i.key} type="button" className={`it ${LV[i.level]}`} onClick={() => setStep(STEPS.findIndex((s) => s.keys.includes(i.key)))}>
                  <span><i className={`dot ${LV[i.level]}`} />{i.label}<small>me’yor {i.norm}</small></span><b>{i.value}</b>
                </button>
              ))}
              {STEPS.flatMap((s) => s.keys).filter((k) => values[k] !== undefined && !issues.some((i) => i.key === k)).slice(0, 8).map((k) => (
                <div key={k} className="it"><span><i className="dot g" />{fieldInfo(k).label}</span><b>{values[k]}</b></div>
              ))}
              {filled - issues.length > 8 && <div className="more">… yana {filled - issues.length - 8} ta me’yordagi o‘lchov</div>}
            </div>
            {error && <div className="err">{error}</div>}
          </div>
        )}

        <div className="pu29w-nav">
          {!atSummary ? (
            <>
              <button type="button" className="sec" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}><ChevronLeft size={18} /> Orqaga</button>
              <button type="button" className="pri" onClick={() => setStep((s) => s + 1)}>{step === total - 1 ? 'Xulosa' : 'Keyingi'} <ChevronRight size={18} /></button>
            </>
          ) : (
            <div className="col">
              {reds > 0 && <button type="button" className="pri" disabled={busy} onClick={() => finish(true)}><Send size={17} /> Saqlash va Defektlarga yuborish</button>}
              <button type="button" className={reds ? 'sec' : 'pri'} disabled={busy} onClick={() => finish(false)}><Check size={18} /> {busy ? 'Saqlanmoqda…' : 'Saqlash'}</button>
              <div className="row2">
                <button type="button" className="link" onClick={() => setStep(0)}>Boshidan ko‘rib chiqish</button>
                {filled > 0 && <button type="button" className="link danger" onClick={discard}>Qoralamani o‘chirish</button>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function hasDraft(bolinma, switchNumber) {
  const d = readDraft(draftKey(bolinma, switchNumber));
  return !!(d && d.values && Object.keys(d.values).length);
}
