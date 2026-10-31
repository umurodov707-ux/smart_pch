import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cellKey, findSplit, formatValue, toNumber } from './journalModel';

export const PAD_X = 40;      // betning chap/o'ng cheti
export const PAD_TOP = 34;
export const PAD_BOTTOM = 40;
export const GAP = 64;        // ikki bet orasidagi bo'shliq (umurtqa)
export const BOOKMARK_W = 50;
// ---------------------------------------------------------------------------
// Bitta varaqni chizish
// ---------------------------------------------------------------------------

function borderCss(code) {
  if (!code) return undefined;
  const w = Number(code[0]) || 1;
  const kind = { s: 'solid', d: 'dashed', o: 'dotted' }[code[1]] || 'solid';
  if (w >= 3) return `3px double var(--ink)`;
  return `${w}px ${kind} var(--ink)`;
}

export function buildLayout(tpl) {
  const split = findSplit(tpl);
  const cols = tpl.cols;
  const x = [0];
  cols.forEach((w) => x.push(x[x.length - 1] + w));
  const tableW = x[x.length - 1] + (split > 0 ? GAP : 0);
  const tableH = tpl.rows.reduce((a, b) => a + b, 0);
  return {
    split,
    x,
    tableW,
    width: tableW + PAD_X * 2,
    height: tableH + PAD_TOP + PAD_BOTTOM,
    leftW: split > 0 ? PAD_X + x[split] + GAP / 2 : 0,
  };
}

export const SheetView = React.memo(function SheetView({
  si, tpl, styles, cells, layout, analysis, editing, active, onActivate, onCommit, bookmarks, stamp,
}) {
  const { split, leftW, width } = layout;
  const { anchorOf, headerTop, headerBottom, totalRow, dayCols, offDays, mismatches, groups } = analysis;

  const rowClass = useMemo(() => {
    const m = new Map();
    if (dayCols.size) {
      for (const g of groups) if (!g.active) for (let r = g.start; r <= g.end; r++) m.set(r, 'idle');
    }
    if (totalRow >= 0) m.set(totalRow, 'total');
    return m;
  }, [groups, dayCols, totalRow]);

  const pairTop = useMemo(() => {
    const s = new Set();
    for (const g of groups) if (g.end === g.start + 1) s.add(g.start);
    return s;
  }, [groups]);

  const merged = useMemo(() => {
    const m = new Map();
    for (const [r1, c1, r2, c2] of tpl.merges) m.set(cellKey(r1, c1), [r2 - r1 + 1, c2 - c1 + 1]);
    return m;
  }, [tpl]);

  const offRowsFrom = headerTop >= 0 ? headerTop : 0;
  const offRowsTo = totalRow >= 0 ? totalRow : -1;

  const rows = [];
  for (let r = 0; r < tpl.rows.length; r++) {
    const h = tpl.rows[r];
    if (h === 0) continue;
    const tds = [];
    let gapPlaced = split <= 0;
    for (let c = 0; c < tpl.cols.length; c++) {
      if (!gapPlaced && c >= split) {
        tds.push(<td key="gap" className="gap" />);
        gapPlaced = true;
      }
      const key = cellKey(r, c);
      const anchor = anchorOf.get(key);
      if (anchor && (anchor[0] !== r || anchor[1] !== c)) continue;
      if (tpl.cols[c] === 0) continue;
      const span = merged.get(key);
      const st = styles[tpl.styles[key]] || {};
      const cell = cells[key];
      const value = cell ? cell.v : null;
      const isNum = toNumber(value) !== null;
      const isHead = r >= headerTop && r <= headerBottom && headerTop >= 0;
      const right = cells[cellKey(r, c + 1)];
      const nextFilled = c + 1 < tpl.cols.length && (anchorOf.has(cellKey(r, c + 1)) ||
        (right && right.v !== null && right.v !== undefined && formatValue(right.v) !== ''));

      const cls = [];
      const style = { height: h };
      if (st.bd) {
        const [t, ri, b, l] = st.bd;
        if (t) style.borderTop = borderCss(t);
        if (ri) style.borderRight = borderCss(ri);
        if (b) style.borderBottom = borderCss(b);
        if (l) style.borderLeft = borderCss(l);
        if ((t || ri || b || l) && (isNum || nextFilled || span)) cls.push('bd');
        if (isHead && (t || ri || b || l)) cls.push('head');
      }
      if (st.b) style.fontWeight = 700;
      if (st.i) style.fontStyle = 'italic';
      if (st.u) style.textDecoration = 'underline';
      style.fontSize = `${Math.max(9, ((st.sz || 11) * 4) / 3 * 0.92).toFixed(1)}px`;
      const h2 = st.h || (isHead || dayCols.has(c) ? 'c' : isNum ? 'r' : 'l');
      style.textAlign = { l: 'left', c: 'center', r: 'right', j: 'justify', d: 'center', f: 'left' }[h2] || 'left';
      style.verticalAlign = { c: 'middle', t: 'top', j: 'middle', d: 'middle' }[st.v] || 'bottom';
      if (st.w || isHead) cls.push('wrap');
      if (cell && cell.f && !isHead) cls.push('calc');
      if (cell && cell.edited) cls.push('edited');
      if (analysis.checkRow >= 0 && pairTop.has(r) && dayCols.has(c) && !span) cls.push('pairtop');
      if (offDays.has(c) && r > headerBottom && r >= offRowsFrom && r <= offRowsTo + 2) cls.push('off');
      if (mismatches.has(key)) cls.push('bad');

      const canEdit = editing && !(cell && cell.f && !cell.edited) && !isHead;
      if (editing) cls.push(canEdit ? 'editable' : 'locked');
      const isActive = active && active.si === si && active.r === r && active.c === c;
      if (isActive) cls.push('active');

      const text = formatValue(value);
      let content = text;
      if (st.rot && text) content = <span className="rot">{text}</span>;
      if (isActive) {
        content = (
          <CellInput
            initial={cell && cell.v !== null && cell.v !== undefined ? String(cell.v) : ''}
            onDone={(v, move) => onCommit(si, r, c, v, move)}
          />
        );
      }

      const title = cell && cell.f && editing && !cell.edited ? 'Avtomatik hisoblanadi' : undefined;
      tds.push(
        <td
          key={c}
          rowSpan={span ? span[0] : undefined}
          colSpan={span ? span[1] : undefined}
          className={cls.join(' ') || undefined}
          style={style}
          title={title}
          onClick={canEdit && !isActive ? () => onActivate({ si, r, c }) : undefined}
        >
          {content}
        </td>,
      );
    }
    if (!gapPlaced) tds.push(<td key="gap" className="gap" />);
    rows.push(<tr key={r} className={rowClass.get(r)}>{tds}</tr>);
  }

  return (
    <div className="pu74j-book" style={{ width: width + (bookmarks ? BOOKMARK_W : 0), padding: `${PAD_TOP}px 0 ${PAD_BOTTOM}px ${PAD_X}px` }}>
      {split > 0 ? (
        <>
          <div className="pu74j-sheet-bg left" style={{ left: 0, width: leftW }} />
          <div className="pu74j-sheet-bg right" style={{ left: leftW, width: width - leftW }} />
          <div className="pu74j-spine" style={{ left: leftW - 3 }} />
        </>
      ) : (
        <div className="pu74j-sheet-bg single" style={{ left: 0, width }} />
      )}
      {bookmarks && <div className="pu74j-bookmarks" style={{ left: width }}>{bookmarks}</div>}
      {stamp && (
        <div className="pu74j-stamp" style={{ right: (bookmarks ? BOOKMARK_W : 0) + PAD_X + 30 }} aria-label="Tasdiqlangan">
          TASDIQLANDI
          <small>{stamp.at}</small>
          <small>{stamp.by}</small>
        </div>
      )}
      <table className="pu74j-table" style={{ width: layout.tableW }}>
        <colgroup>
          {tpl.cols.map((w, c) => (
            <React.Fragment key={c}>
              {split > 0 && c === split && <col style={{ width: GAP }} />}
              <col style={{ width: w }} />
            </React.Fragment>
          ))}
          {split > 0 && split >= tpl.cols.length && <col style={{ width: GAP }} />}
        </colgroup>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
});

function CellInput({ initial, onDone }) {
  const [v, setV] = useState(initial);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const finish = (value, move) => {
    if (done.current) return;
    done.current = true;
    onDone(value, move);
  };
  return (
    <input
      ref={ref}
      value={v}
      inputMode="decimal"
      onChange={(e) => setV(e.target.value)}
      onBlur={() => finish(v, null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); finish(v, e.shiftKey ? 'up' : 'down'); }
        else if (e.key === 'Tab') { e.preventDefault(); finish(v, e.shiftKey ? 'left' : 'right'); }
        else if (e.key === 'Escape') { e.preventDefault(); finish(null, null); }
      }}
    />
  );
}

