import React, { useMemo } from 'react';
import { MARKA_SLOPE, NODES, worstLevel } from './switchSchema.js';

const COLORS = { green: '#22c55e', yellow: '#eab308', red: '#ef4444', '': '#cfc4ab' };
const TEXT = { green: '#166534', yellow: '#a16207', red: '#b91c1c', '': '#8a7d63' };
const W = 1100;
const H = 250;

/**
 * Oddiy strelkali o'tkazgich rejasi: rama relslari, ostryaklar, ulovchi relslar,
 * krestovina (usoviklar, serdechnik), kontrrelslar, brusyalar.
 * O'ng strelka — yon yo'l pastga, chap — yuqoriga. Krestovina burchagi markaga bog'liq.
 */
export default function SwitchSchematic({ values = {}, meta = {}, selected, onSelect, compact = false, focus = null }) {
  const geo = useMemo(() => {
    const G = 50;
    const Y1 = 100;
    const Y2 = Y1 + G;
    const X0 = 110;
    const XH = 290;
    const S = MARKA_SLOPE[meta.marka] || MARKA_SLOPE['1/11'];
    const XF = Math.min(X0 + (2 * G) / S, 760);
    const K = G / (XF - X0) ** 2;
    const slope = 2 * K * (XF - X0);
    const XE = W - 20;
    const right = !String(meta.switchType || '').toLowerCase().includes('chap');
    // chap strelka: yon yo'l yuqoriga; o'ng: pastga (ko'zgu)
    const fy = (y) => (right ? Y1 + Y2 - y : y);
    const rd = (x) => (x <= XF ? Y2 - K * (x - X0) ** 2 : Y1 - slope * (x - XF));
    const ld = (x) => rd(x) - G;
    const path = (f, a, b) => {
      const pts = [];
      for (let x = a; x < b; x += 6) pts.push(`${x.toFixed(1)} ${fy(f(x)).toFixed(1)}`);
      pts.push(`${b.toFixed(1)} ${fy(f(b)).toFixed(1)}`);
      return `M${pts.join(' L')}`;
    };
    const mid = (x) => (rd(x) + ld(x)) / 2;
    const midS = (Y1 + Y2) / 2;
    const pos = {
      stik: [55, midS], ostr: [X0 + 12, midS], koren: [XH, midS + 3], egri: [X0 + (XF - X0) * 0.62, mid(X0 + (XF - X0) * 0.62) - 2],
      kr_t: [XF + 40, midS - 2], kr_y: [XF + 40, mid(XF + 40) + 2], orqa_t: [XE - 110, midS], orqa_y: [XE - 110, mid(XE - 110)],
    };
    const sleepers = [];
    for (let x = 24; x <= XE; x += 34) sleepers.push({ x, y1: fy((x > X0 ? Math.min(Y1, ld(x)) : Y1) - 16), y2: fy(Y2 + 16) });
    return { G, Y1, Y2, X0, XH, XF, XE, fy, rd, ld, path, pos, sleepers, right };
  }, [meta.marka, meta.switchType]);

  const { Y1, Y2, X0, XH, XF, XE, fy, rd, ld, path, pos, sleepers } = geo;
  const T = XF - 26;
  const R = '#2b3645';
  const P = '#8a6d3b';
  const C = '#5a6b80';
  const ys = [fy(Y1), fy(Y2), fy(ld(XE)), fy(rd(XE))];
  const yMin = Math.min(...ys) - (compact ? 22 : 46);
  const yMax = Math.max(...ys) + (compact ? 22 : 46);

  return (
    <svg
      className="pu29-schema"
      viewBox={`0 ${yMin} ${W} ${yMax - yMin}`}
      width="100%"
      role="img"
      aria-label="Strelkali o‘tkazgich sxemasi va o‘lchov nuqtalari"
      style={{ maxHeight: compact ? 120 : H }}
    >
      {sleepers.map((s) => <line key={s.x} x1={s.x} x2={s.x} y1={s.y1} y2={s.y2} stroke="#ddd0b2" strokeWidth="9" />)}
      {/* rama relslari: biri to'g'ri yo'lga, ikkinchisi yon yo'lga davom etadi */}
      <line x1="14" y1={fy(Y2)} x2={XE} y2={fy(Y2)} stroke={R} strokeWidth="5" />
      <path d={`M14 ${fy(Y1)} L${X0} ${fy(Y1)} ${path(ld, X0, XE).replace('M', 'L')}`} stroke={R} strokeWidth="5" fill="none" />
      {/* ostryaklar */}
      <path d={`M${X0} ${fy(Y1 + 4)} L${XH} ${fy(Y1)}`} stroke={P} strokeWidth="6" strokeLinecap="round" />
      <path d={path((x) => rd(x) - 4, X0, XH)} stroke={P} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* ulovchi relslar */}
      <line x1={XH} y1={fy(Y1)} x2={T} y2={fy(Y1)} stroke={R} strokeWidth="5" />
      <path d={path(rd, XH, T)} stroke={R} strokeWidth="5" fill="none" />
      {/* krestovina: usoviklar, serdechnik */}
      <path d={`M${T} ${fy(Y1)} L${XF - 4} ${fy(Y1 - 3)} L${XF + 60} ${fy(rd(XF + 60) - 7)}`} stroke={R} strokeWidth="4" fill="none" />
      <path d={`M${T} ${fy(rd(T))} L${XF - 4} ${fy(Y1 + 3)} L${XF + 60} ${fy(Y1 + 7)}`} stroke={R} strokeWidth="4" fill="none" />
      <path d={`M${XF + 10} ${fy(Y1)} L${XF + 70} ${fy(Y1 + 1.5)} L${XF + 70} ${fy(rd(XF + 70) - 1.5)} Z`} fill={R} />
      <line x1={XF + 70} y1={fy(Y1)} x2={XE} y2={fy(Y1)} stroke={R} strokeWidth="5" />
      <line x1={XF + 70} y1={fy(rd(XF + 70))} x2={XE} y2={fy(rd(XE))} stroke={R} strokeWidth="5" />
      {/* kontrrelslar */}
      <line x1={XF - 60} y1={fy(Y2 - 8)} x2={XF + 70} y2={fy(Y2 - 8)} stroke={C} strokeWidth="4" />
      <line x1={XF - 60} y1={fy(ld(XF - 60) + 8)} x2={XF + 70} y2={fy(ld(XF + 70) + 8)} stroke={C} strokeWidth="4" />

      {!compact && (
        <g fontSize="12" fill="#8a7d63" fontStyle="italic" textAnchor="middle">
          <text x="60" y={fy(Y2) + (geo.right ? -26 : 34)}>rama relslari</text>
          <text x={(X0 + XH) / 2} y={fy(Y2) + (geo.right ? -26 : 34)}>ostryaklar</text>
          <text x={XF + 5} y={fy(Y2) + (geo.right ? -26 : 34)}>krestovina</text>
          <text x={XE - 4} y={fy(Y1) + (geo.right ? 18 : -8)} textAnchor="end">to‘g‘ri yo‘l</text>
          <text x={XE - 4} y={fy(ld(XE)) + (geo.right ? 22 : -10)} textAnchor="end">yon yo‘l</text>
        </g>
      )}

      {NODES.map((n) => {
        const [x, y0] = pos[n.id];
        const y = fy(y0);
        const lv = worstLevel(n.keys, values, meta);
        const isSel = selected === n.id;
        const isFocus = focus === n.id;
        const r = lv === 'red' || isSel || isFocus ? 15 : 12;
        return (
          <g
            key={n.id}
            className={onSelect ? 'node' : undefined}
            onClick={onSelect ? () => onSelect(n.id) : undefined}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={`${n.no}. ${n.title}`}
            onKeyDown={onSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(n.id); } } : undefined}
          >
            {(lv === 'red' || isFocus) && <circle cx={x} cy={y} r={25} fill="none" stroke={isFocus ? '#1f4fa3' : '#ef4444'} strokeWidth="2.5" opacity=".55" />}
            {isSel && <circle cx={x} cy={y} r={21} fill="none" stroke="#1d2a3a" strokeWidth="2.5" />}
            <circle cx={x} cy={y} r={r} fill={isFocus ? '#1f4fa3' : COLORS[lv]} stroke="#fff" strokeWidth="3" />
            <text x={x} y={y + 4.5} fontSize="12" fontWeight="800" textAnchor="middle" fill={lv || isFocus ? '#fff' : TEXT['']}>{n.no}</text>
          </g>
        );
      })}
    </svg>
  );
}

export { COLORS as LEVEL_COLORS, TEXT as LEVEL_TEXT };
