import React from 'react';
import { LINE_START, LINE_END, STATIONS } from './line.js';
import { STATUS } from './summary.js';

const W = 1360;
const PAD = 30;
const X = (km) => PAD + ((km - LINE_START) / (LINE_END - LINE_START)) * (W - PAD * 2);
const FILL = { go: '#1E8A4E', new: '#2D5DA8', wait: '#B57F00' };

/**
 * Liniya sxemasi: Navbahor → Turon, har bir bo'linma o'z uchastkasida holat rangida.
 * Ogohlantirishlar (tezlik) — uchburchak, nuqsonlar — qizil nuqta.
 */
export default function LineSchema({ rows, marks, selected, onSelect, compact = false }) {
  if (compact) {
    return (
      <div className="dsp-line">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rows.length}, 1fr)`, gap: 3 }}>
          {rows.map((r) => {
            const cls = STATUS[r.status].cls;
            const style = cls === 'stop'
              ? { background: 'repeating-linear-gradient(45deg,#C2392D 0 4px,#E9A79F 4px 7px)' }
              : { background: FILL[cls] };
            return (
              <button key={r.n} type="button" onClick={() => onSelect(r.n)} aria-label={`${r.label}: ${STATUS[r.status].label}`}
                style={{ ...style, border: selected === r.n ? '2px solid #17232A' : '0', height: 28, borderRadius: 4, color: '#fff', font: '600 11px Inter', padding: 0 }}>
                <span style={cls === 'stop' ? { background: '#fff', color: '#C2392D', borderRadius: 3, padding: '0 3px' } : undefined}>{r.n}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5F6E75', fontSize: 11, marginTop: 3 }}>
          <span>{STATIONS[0].name} {STATIONS[0].km}</span><span>{STATIONS[STATIONS.length - 1].name} {STATIONS[STATIONS.length - 1].km}</span>
        </div>
      </div>
    );
  }

  const sleepers = [];
  for (let x = PAD + 4; x < W - PAD; x += 9) sleepers.push(x);
  // bir km dagi bir nechta ogohlantirish bitta belgi bo'lib chiqadi
  const warnByKm = new Map();
  marks.warns.forEach((w) => {
    const k = Math.round(w.km);
    const prev = warnByKm.get(k);
    if (!prev || (w.speed !== null && (prev.speed === null || w.speed < prev.speed))) warnByKm.set(k, w);
  });

  return (
    <div className="dsp-line">
      <div className="dsp-line-h">
        <h2>Liniya bo‘yicha holat</h2>
        <span className="hint">Bo‘linma ustiga bosing — tafsiloti ochiladi</span>
        <div className="dsp-legend">
          <span><i style={{ background: FILL.go }} />Qabul qilindi</span>
          <span><i style={{ background: FILL.new }} />Yangi, ko‘rib chiqing</span>
          <span><i style={{ background: FILL.wait }} />Qaytarildi</span>
          <span><i style={{ background: 'repeating-linear-gradient(45deg,#C2392D 0 4px,#E9A79F 4px 7px)' }} />Yubormagan</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} 150`} role="group" aria-label="Navbahor–Turon liniyasi, bo‘linmalar holati">
        <defs>
          <pattern id="dsp-miss" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#E9A79F" /><rect width="4" height="8" fill="#C2392D" />
          </pattern>
        </defs>
        {sleepers.map((x) => <line key={x} x1={x} x2={x} y1={74} y2={90} stroke="#9FAEA6" strokeWidth="1.4" />)}
        <line x1={PAD} x2={W - PAD} y1={78} y2={78} stroke="#17232A" strokeWidth="2" />
        <line x1={PAD} x2={W - PAD} y1={86} y2={86} stroke="#17232A" strokeWidth="2" />
        {rows.map((r) => {
          const x1 = X(r.segment.from); const x2 = X(r.segment.to);
          const cls = STATUS[r.status].cls;
          const cx = (x1 + x2) / 2;
          return (
            <g key={r.n} className="dsp-seg-hit" tabIndex={0} role="button"
              aria-label={`${r.label}: ${STATUS[r.status].label}`} aria-pressed={selected === r.n}
              onClick={() => onSelect(r.n)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(r.n); } }}>
              <rect className="base" x={x1 + 1} y={100} width={Math.max(4, x2 - x1 - 2)} height={22} rx={3} fill={cls === 'stop' ? 'url(#dsp-miss)' : FILL[cls]} />
              {selected === r.n && <rect x={x1 - 1} y={98} width={x2 - x1 + 2} height={26} rx={4} fill="none" stroke="#17232A" strokeWidth="2" />}
              {cls === 'stop' && <rect x={cx - 11} y={103} width={22} height={16} rx={3} fill="#fff" />}
              <text x={cx} y={116} textAnchor="middle" fontSize="12" fontWeight="700" fill={cls === 'stop' ? '#C2392D' : '#fff'}>{r.n}</text>
            </g>
          );
        })}
        {STATIONS.map((s) => (
          <g key={s.name}>
            <rect x={X(s.km) - 14} y={72} width={28} height={20} rx={3} fill="#F6F8F6" stroke="#17232A" strokeWidth="1.5" />
            <text x={X(s.km)} y={62} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#17232A">{s.name}</text>
            <text x={X(s.km)} y={140} textAnchor="middle" fontSize="11" fill="#5F6E75">{s.km} km</text>
          </g>
        ))}
        {[...warnByKm.values()].map((w) => {
          const x = X(w.km);
          return (
            <g key={`w${w.km}`}>
              <title>{`${w.km} km: ogohlantirish ${w.speed ?? ''} km/s (${w.n}-bo‘linma)`}</title>
              <path d={`M${x} 22 L${x + 11} 42 L${x - 11} 42 Z`} fill="#F6EBCC" stroke="#B57F00" strokeWidth="1.8" />
              <text x={x} y={39} textAnchor="middle" fontSize="10" fontWeight="700" fill="#5C4300">!</text>
              {w.speed !== null && <text x={x + 15} y={37} fontSize="11.5" fontWeight="700" fill="#7A5600">{w.speed} km/s</text>}
            </g>
          );
        })}
        {marks.defects.map((d, i) => (
          <circle key={`d${i}`} cx={X(d.km)} cy={82} r={5} fill="#C2392D" stroke="#fff" strokeWidth="1.5">
            <title>{`${d.km} km: nuqson ${d.code || ''} (${d.n}-bo‘linma)`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
