/**
 * PU-74 jurnalini asl Excel shaklida yuklab olish.
 *
 * Brigada faylining o'zi (xlsx = zip) olinadi va faqat o'zgargan kataklarning
 * qiymatlari varaq XML'ida almashtiriladi. Shu sababli chegaralar, shriftlar,
 * ustun kengliklari, birlashtirishlar, chop etish sozlamalari — hammasi aynan
 * asl fayldagidek qoladi (SheetJS bepul versiyasi yozishda bularni yo'qotadi).
 *
 * Formulali kataklarga hisoblangan qiymat yoziladi va Excel ochilganda
 * hammasini qayta hisoblashi uchun fullCalcOnLoad yoqiladi.
 *
 * Brauzerda ham, Node 18+ da ham ishlaydi (DecompressionStream / CompressionStream).
 */

// ---------------------------------------------------------------------------
// ZIP
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

async function streamThrough(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

const inflateRaw = (b) => streamThrough(b, new DecompressionStream('deflate-raw'));
const deflateRaw = (b) => (typeof CompressionStream !== 'undefined'
  ? streamThrough(b, new CompressionStream('deflate-raw'))
  : null);

/** @returns {Promise<{name: string, data: Uint8Array}[]>} */
export async function readZip(input) {
  const buf = input instanceof Uint8Array ? input : new Uint8Array(input);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Excel fayli buzilgan (zip oxiri topilmadi)');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  const entries = [];
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Excel fayli buzilgan (markaziy katalog)');
    const method = dv.getUint16(p + 10, true);
    const compSize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    const name = dec.decode(buf.subarray(p + 46, p + 46 + nameLen));
    const lNameLen = dv.getUint16(local + 26, true);
    const lExtraLen = dv.getUint16(local + 28, true);
    const start = local + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compSize);
    let data;
    if (method === 0) data = raw.slice();
    else if (method === 8) data = await inflateRaw(raw);
    else throw new Error(`Qo'llab-quvvatlanmaydigan siqish usuli: ${method}`);
    entries.push({ name, data });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

export async function writeZip(entries) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBytes = enc.encode(name);
    const crc = crc32(data);
    let method = 0;
    let body = data;
    if (data.length > 64) {
      const z = await deflateRaw(data);
      if (z && z.length < data.length) { method = 8; body = z; }
    }
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(6, 0x0800, true); // UTF-8 nomlar
    lh.setUint16(8, method, true);
    lh.setUint16(10, 0, true);
    lh.setUint16(12, 0x21, true); // 1980-01-01
    lh.setUint32(14, crc, true);
    lh.setUint32(18, body.length, true);
    lh.setUint32(22, data.length, true);
    lh.setUint16(26, nameBytes.length, true);
    lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), nameBytes, body);

    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true);
    ch.setUint16(10, method, true);
    ch.setUint16(12, 0, true);
    ch.setUint16(14, 0x21, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, body.length, true);
    ch.setUint32(24, data.length, true);
    ch.setUint16(28, nameBytes.length, true);
    ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), nameBytes);
    offset += 30 + nameBytes.length + body.length;
  }
  const centralSize = central.reduce((a, b) => a + b.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
  let o = 0;
  for (const a of all) { out.set(a, o); o += a.length; }
  return out;
}

// ---------------------------------------------------------------------------
// Varaq XML
// ---------------------------------------------------------------------------
export function colName(c) {
  let s = '';
  let n = c + 1;
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
const colNum = (letters) => [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
const escXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function attr(tag, name) {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return m ? m[1] : null;
}

/**
 * Bitta katak uchun yangi XML.
 * @param {{v:any, f?:string, keepFormula:boolean}} cell
 */
function buildCell(ref, oldXml, cell) {
  const openTag = oldXml ? /^<c\b[^>]*?\/?>/.exec(oldXml)[0] : '';
  const s = openTag ? attr(openTag, 's') : null;
  const sAttr = s !== null ? ` s="${s}"` : '';
  const v = cell.v;

  if (cell.keepFormula) {
    const fMatch = oldXml && /<f\b[^>]*\/>|<f\b[^>]*>[\s\S]*?<\/f>/.exec(oldXml);
    const f = fMatch ? fMatch[0] : '';
    if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${sAttr}>${f}<v>${v}</v></c>`;
    if (v === null || v === undefined || v === '') return `<c r="${ref}"${sAttr}>${f}</c>`;
    return `<c r="${ref}"${sAttr} t="str">${f}<v>${escXml(v)}</v></c>`;
  }
  if (v === null || v === undefined || v === '') return `<c r="${ref}"${sAttr}/>`;
  if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${sAttr}><v>${v}</v></c>`;
  return `<c r="${ref}"${sAttr} t="inlineStr"><is><t xml:space="preserve">${escXml(v)}</t></is></c>`;
}

/**
 * Varaq XML'ida kataklarni almashtiradi yoki qo'shadi.
 * @param {string} xml
 * @param {Map<string, {r:number,c:number,v:any,keepFormula:boolean}>} cells kalit "r,c"
 */
export function patchSheetXml(xml, cells) {
  if (!cells.size) return xml;
  const byRow = new Map();
  for (const cell of cells.values()) {
    if (!byRow.has(cell.r)) byRow.set(cell.r, []);
    byRow.get(cell.r).push(cell);
  }

  const sdStart = xml.indexOf('<sheetData');
  if (sdStart < 0) throw new Error('Varaqda sheetData yo‘q');
  const selfClosing = /^<sheetData\s*\/>/.test(xml.slice(sdStart));
  let head; let body; let tail;
  if (selfClosing) {
    const end = xml.indexOf('>', sdStart) + 1;
    head = `${xml.slice(0, sdStart)}<sheetData>`;
    body = '';
    tail = `</sheetData>${xml.slice(end)}`;
  } else {
    const open = xml.indexOf('>', sdStart) + 1;
    const close = xml.indexOf('</sheetData>', open);
    head = xml.slice(0, open);
    body = xml.slice(open, close);
    tail = xml.slice(close);
  }

  // qatorlarni ajratish
  const rowRe = /<row\b[^>]*?(?:\/>|>[\s\S]*?<\/row>)/g;
  const rows = [];
  let m;
  while ((m = rowRe.exec(body))) {
    const r = parseInt(attr(m[0], 'r'), 10) - 1;
    rows.push({ r, xml: m[0] });
  }

  const cellRe = /<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g;
  const done = new Set();
  const patchRow = (rowXml, r, list) => {
    const isSelf = /^<row\b[^>]*\/>$/.test(rowXml);
    const openTag = isSelf ? rowXml.replace(/\/>$/, '>') : /^<row\b[^>]*>/.exec(rowXml)[0];
    const inner = isSelf ? '' : rowXml.slice(openTag.length, rowXml.length - '</row>'.length);
    const existing = [];
    let cm;
    cellRe.lastIndex = 0;
    while ((cm = cellRe.exec(inner))) {
      const ref = attr(cm[0].slice(0, cm[0].indexOf('>') + 1), 'r');
      const c = ref ? colNum(/^[A-Z]+/.exec(ref)[0]) : existing.length ? existing[existing.length - 1].c + 1 : 0;
      existing.push({ c, xml: cm[0] });
    }
    const want = new Map(list.map((x) => [x.c, x]));
    const out = [];
    for (const e of existing) {
      const w = want.get(e.c);
      if (w) { out.push({ c: e.c, xml: buildCell(colName(e.c) + (r + 1), e.xml, w) }); want.delete(e.c); }
      else out.push(e);
    }
    for (const w of want.values()) out.push({ c: w.c, xml: buildCell(colName(w.c) + (r + 1), null, w) });
    out.sort((a, b) => a.c - b.c);
    // "spans" atributi eskirib qolishi mumkin — olib tashlaymiz (ixtiyoriy atribut)
    const tag = openTag.replace(/\sspans="[^"]*"/, '');
    return `${tag}${out.map((x) => x.xml).join('')}</row>`;
  };

  const newRows = rows.map((row) => {
    const list = byRow.get(row.r);
    if (!list) return row;
    done.add(row.r);
    return { r: row.r, xml: patchRow(row.xml, row.r, list) };
  });
  for (const [r, list] of byRow) {
    if (done.has(r)) continue;
    newRows.push({ r, xml: patchRow(`<row r="${r + 1}"/>`, r, list) });
  }
  newRows.sort((a, b) => a.r - b.r);

  // <dimension> yangi kataklarni ham qamrab olsin (aks holda ba'zi dasturlar ularni ko'rmaydi)
  let maxR = 0; let maxC = 0;
  for (const cell of cells.values()) { maxR = Math.max(maxR, cell.r); maxC = Math.max(maxC, cell.c); }
  head = head.replace(/<dimension\s+ref="([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?"\s*\/>/, (all, c1, r1, c2, r2) => {
    const endC = Math.max(colNum(c2 || c1), maxC);
    const endR = Math.max(parseInt(r2 || r1, 10) - 1, maxR);
    return `<dimension ref="${c1}${r1}:${colName(endC)}${endR + 1}"/>`;
  });

  // qatorlar orasidagi bo'sh joylarni saqlamaymiz — sheetData faqat <row> lardan iborat
  return head + newRows.map((x) => x.xml).join('') + tail;
}

// ---------------------------------------------------------------------------
// Workbook
// ---------------------------------------------------------------------------
function resolveTarget(target) {
  if (target.startsWith('/')) return target.slice(1);
  const parts = `xl/${target}`.split('/');
  const out = [];
  for (const p of parts) { if (p === '..') out.pop(); else if (p !== '.') out.push(p); }
  return out.join('/');
}

/**
 * @param {ArrayBuffer|Uint8Array} original asl brigada fayli
 * @param {{name: string, cells: Object<string, {v:any, f?:string, edited?:boolean}>}[]} sheets hisoblangan model (computeWorkbook natijasi)
 * @returns {Promise<Uint8Array>}
 */
export async function buildJournalXlsx(original, sheets) {
  const entries = await readZip(original);
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  const byName = new Map(entries.map((e) => [e.name, e]));
  const text = (n) => dec.decode(byName.get(n).data);
  const setText = (n, s) => { byName.get(n).data = enc.encode(s); };

  const wbXml = text('xl/workbook.xml');
  const relsXml = text('xl/_rels/workbook.xml.rels');
  const rels = new Map();
  for (const m of relsXml.matchAll(/<Relationship\b[^>]*>/g)) rels.set(attr(m[0], 'Id'), { target: attr(m[0], 'Target'), type: attr(m[0], 'Type') });
  const sheetFiles = [...wbXml.matchAll(/<sheet\b[^>]*>/g)].map((m) => {
    const rid = attr(m[0], 'r:id');
    return resolveTarget(rels.get(rid).target);
  });

  sheets.forEach((sheet, si) => {
    const file = sheetFiles[si];
    if (!file || !byName.has(file)) return;
    const cells = new Map();
    for (const [key, cell] of Object.entries(sheet.cells)) {
      if (!cell.edited && !cell.f) continue;
      const [r, c] = key.split(',').map(Number);
      cells.set(key, { r, c, v: cell.v, keepFormula: !cell.edited && !!cell.f });
    }
    if (cells.size) setText(file, patchSheetXml(text(file), cells));
  });

  // Excel ochilganda hammasini qayta hisoblasin
  let wb = wbXml;
  if (/<calcPr\b/.test(wb)) {
    wb = wb.replace(/<calcPr\b([^>]*?)(\/?)>/, (all, attrs, slash) => `<calcPr${attrs.replace(/\sfullCalcOnLoad="[^"]*"/, '')} fullCalcOnLoad="1"${slash}>`);
  } else if (/<\/definedNames>/.test(wb)) {
    wb = wb.replace('</definedNames>', '</definedNames><calcPr fullCalcOnLoad="1"/>');
  } else {
    wb = wb.replace(/(<\/sheets>)/, '$1<calcPr fullCalcOnLoad="1"/>');
  }
  setText('xl/workbook.xml', wb);

  // calcChain formulasi o'chirilgan kataklarga ishora qilsa Excel faylni "tiklash"ni so'raydi
  if (byName.has('xl/calcChain.xml')) {
    byName.delete('xl/calcChain.xml');
    setText('xl/_rels/workbook.xml.rels', relsXml.replace(/<Relationship\b[^>]*calcChain[^>]*\/>/g, ''));
    const ct = text('[Content_Types].xml');
    setText('[Content_Types].xml', ct.replace(/<Override\b[^>]*calcChain[^>]*\/>/g, ''));
  }

  return writeZip(entries.filter((e) => byName.has(e.name)).map((e) => byName.get(e.name)));
}
