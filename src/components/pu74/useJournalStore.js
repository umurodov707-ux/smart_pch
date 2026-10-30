/**
 * PU-74 jurnali: brigada + oy bo'yicha tahrirlarni server bilan sinxronlash.
 *
 * - Har bir o'zgarish darhol brauzerga yoziladi (internet uzilsa ham yo'qolmaydi)
 * - 0.8 soniyadan keyin serverga yuboriladi (versiya bilan — birovning ishini bosib ketmaslik uchun)
 * - Server javob bermasa, ish shu qurilmada davom etadi va keyingi ochishda yuboriladi
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import api, { ApiError } from '../../utils/api';

const API = '/api/pu74-journal';
const localKey = (brigade, month) => `pu74_j_${brigade}_${month}`;
// 1-PR va eski versiya kaliti (oylarsiz)
const legacyKey = (file) => `pu74_edits_${file}`;

function readLocal(brigade, month) {
  try { return JSON.parse(localStorage.getItem(localKey(brigade, month)) || 'null'); } catch { return null; }
}
function writeLocal(brigade, month, rec) {
  try { localStorage.setItem(localKey(brigade, month), JSON.stringify(rec)); } catch { /* xotira to'la */ }
}
function localMonths(brigade) {
  const out = [];
  try {
    const prefix = `pu74_j_${brigade}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) out.push(k.slice(prefix.length));
    }
  } catch { /* ahamiyatsiz */ }
  return out;
}

/** Eski (oylarsiz) tahrirlar: serverdagi kv yoki brauzer */
export async function loadLegacyEdits(file) {
  try {
    const remote = await api.get(`/api/storage/load/${encodeURIComponent(legacyKey(file))}`);
    if (remote && remote.edits && Object.keys(remote.edits).length) return remote.edits;
  } catch { /* yo'q */ }
  try {
    const local = JSON.parse(localStorage.getItem(legacyKey(file)) || '{}');
    if (local && Object.keys(local).length) return local;
  } catch { /* yo'q */ }
  return {};
}

const isOffline = (e) => !(e instanceof ApiError) || e.status === 0 || (e.status === 404 && typeof e.body === 'string');

export default function useJournalStore(brigade, month) {
  const [months, setMonths] = useState([]);         // [{month, status, ...}]
  const [journal, setJournal] = useState(null);     // server meta: status, version, can_edit ...
  const [edits, setEditsState] = useState({});
  const [phase, setPhase] = useState('loading');    // loading | ready | missing | error
  const [offline, setOffline] = useState(false);
  const [sync, setSync] = useState({ state: 'idle', text: '' });
  const [conflict, setConflict] = useState(null);   // serverdagi yangi versiya
  const timer = useRef(null);
  const seq = useRef(0);
  const current = useRef({ brigade, month });
  current.current = { brigade, month };
  const verRef = useRef(0);

  const refreshMonths = useCallback(async () => {
    try {
      const r = await api.get(`${API}/${brigade}`);
      const server = r.months || [];
      const extra = localMonths(brigade).filter((m) => !server.some((s) => s.month === m)).map((m) => ({ month: m, status: 'draft', local: true }));
      setMonths([...server, ...extra].sort((a, b) => (a.month < b.month ? 1 : -1)));
      setOffline(false);
      return server;
    } catch (e) {
      setMonths(localMonths(brigade).sort().reverse().map((m) => ({ month: m, status: 'draft', local: true })));
      if (isOffline(e)) setOffline(true);
      return null;
    }
  }, [brigade]);

  const pushToServer = useCallback(async (b, m, rec, mySeq) => {
    try {
      const body = rec.version ? { edits: rec.edits, version: rec.version } : { edits: rec.edits };
      const saved = await api.put(`${API}/${b}/${m}`, body);
      if (current.current.brigade !== b || current.current.month !== m) return;
      verRef.current = saved.version;
      const latest = readLocal(b, m);
      const stillDirty = latest && latest.seq !== undefined && latest.seq > mySeq;
      writeLocal(b, m, { ...(stillDirty ? latest : rec), version: saved.version, dirty: !!stillDirty });
      setJournal(saved);
      setOffline(false);
      setSync({ state: 'saved', text: 'Serverga saqlandi' });
      if (rec.version === 0 || !rec.version) refreshMonths();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.body && e.body.journal) {
        setConflict(e.body.journal);
        setSync({ state: 'warn', text: 'Boshqa foydalanuvchi ham o‘zgartirgan' });
      } else if (e instanceof ApiError && e.status === 423) {
        if (e.body && e.body.journal) setJournal(e.body.journal);
        setSync({ state: 'warn', text: 'Jurnal qulflangan — o‘zgarishlar saqlanmadi' });
      } else {
        setOffline(true);
        setSync({ state: 'warn', text: 'Internet yo‘q — shu qurilmada saqlandi, keyin yuboriladi' });
      }
    }
  }, [refreshMonths]);

  // Boshqa oylarda internet yo'qligida qolgan saqlanmagan o'zgarishlarni yuborish
  const syncPending = useCallback(async () => {
    for (const m of localMonths(brigade)) {
      if (m === current.current.month && brigade === current.current.brigade) continue;
      const rec = readLocal(brigade, m);
      if (!rec || !rec.dirty) continue;
      try {
        const body = rec.version ? { edits: rec.edits, version: rec.version } : { edits: rec.edits };
        const saved = await api.put(`${API}/${brigade}/${m}`, body);
        const latest = readLocal(brigade, m);
        if (latest && (latest.seq || 0) === (rec.seq || 0)) writeLocal(brigade, m, { ...rec, version: saved.version, dirty: false });
      } catch { /* ziddiyat yoki oflayn — oy ochilganda hal qilinadi */ }
    }
  }, [brigade]);

  // Oyni yuklash
  const load = useCallback(async () => {
    clearTimeout(timer.current);
    setPhase('loading');
    setConflict(null);
    setSync({ state: 'idle', text: '' });
    const serverMonths = await refreshMonths();
    if (serverMonths) syncPending().then(() => refreshMonths());
    const local = readLocal(brigade, month);
    try {
      const j = await api.get(`${API}/${brigade}/${month}`);
      if (current.current.month !== month || current.current.brigade !== brigade) return;
      verRef.current = j.version;
      if (local && local.dirty && local.version === j.version && j.can_edit) {
        setEditsState(local.edits);
        setJournal(j);
        setPhase('ready');
        pushToServer(brigade, month, local, local.seq || 0);
      } else {
        writeLocal(brigade, month, { edits: j.edits, version: j.version, dirty: false, status: j.status });
        setEditsState(j.edits);
        setJournal(j);
        setPhase('ready');
        if (local && local.dirty && local.version !== j.version) {
          setConflict(j);
          setEditsState(local.edits);
          setSync({ state: 'warn', text: 'Bu qurilmadagi saqlanmagan o‘zgarishlar serverdagidan farq qiladi' });
        }
      }
      setOffline(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404 && typeof e.body !== 'string') {
        if (local && local.dirty) {
          verRef.current = 0;
          setEditsState(local.edits);
          setJournal({ status: 'draft', version: 0, can_edit: true });
          setPhase('ready');
          pushToServer(brigade, month, { ...local, version: 0 }, local.seq || 0);
        } else {
          setEditsState({});
          setJournal(null);
          setPhase('missing');
        }
        return;
      }
      setOffline(true);
      if (local) {
        verRef.current = local.version || 0;
        setEditsState(local.edits || {});
        setJournal({ status: local.status || 'draft', version: local.version || 0, can_edit: local.status !== 'approved' && local.status !== 'submitted' });
        setPhase('ready');
        setSync({ state: 'warn', text: 'Server javob bermadi — shu qurilmadagi nusxa ochildi' });
      } else {
        setPhase('missing');
      }
    }
  }, [brigade, month, refreshMonths, pushToServer, syncPending]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => clearTimeout(timer.current), []);

  /** Tahrirlarni o'zgartirish (darhol lokal, keyin server) */
  const setEdits = useCallback((updater) => {
    setEditsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next === prev) return prev;
      const mySeq = ++seq.current;
      const rec = { edits: next, version: verRef.current, dirty: true, seq: mySeq, ts: Date.now() };
      writeLocal(brigade, month, rec);
      setSync({ state: 'saving', text: 'Saqlanmoqda…' });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => pushToServer(brigade, month, rec, mySeq), 800);
      return next;
    });
  }, [brigade, month, pushToServer]);

  /** Yangi oyni ochish */
  const create = useCallback(async (initialEdits) => {
    const rec = { edits: initialEdits, version: 0, dirty: true, seq: ++seq.current, ts: Date.now() };
    writeLocal(brigade, month, rec);
    verRef.current = 0;
    setEditsState(initialEdits);
    setJournal({ status: 'draft', version: 0, can_edit: true });
    setPhase('ready');
    await pushToServer(brigade, month, rec, rec.seq);
  }, [brigade, month, pushToServer]);

  /** Ziddiyatni hal qilish */
  const resolveConflict = useCallback(async (keepMine) => {
    if (!conflict) return;
    const server = conflict;
    setConflict(null);
    verRef.current = server.version;
    if (keepMine) {
      const local = readLocal(brigade, month) || { edits };
      const rec = { edits: local.edits, version: server.version, dirty: true, seq: ++seq.current };
      writeLocal(brigade, month, rec);
      await pushToServer(brigade, month, rec, rec.seq);
    } else {
      writeLocal(brigade, month, { edits: server.edits, version: server.version, dirty: false, status: server.status });
      setEditsState(server.edits);
      setJournal(server);
      setSync({ state: 'saved', text: 'Serverdagi nusxa olindi' });
    }
  }, [conflict, brigade, month, edits, pushToServer]);

  /** Holatni o'zgartirish: submit | approve | return | reopen */
  const changeStatus = useCallback(async (action, comment) => {
    clearTimeout(timer.current);
    const local = readLocal(brigade, month);
    if (local && local.dirty) await pushToServer(brigade, month, local, local.seq || 0);
    const j = await api.post(`${API}/${brigade}/${month}/status`, { action, comment });
    verRef.current = j.version;
    writeLocal(brigade, month, { edits: j.edits, version: j.version, dirty: false, status: j.status });
    setJournal(j);
    refreshMonths();
    return j;
  }, [brigade, month, pushToServer, refreshMonths]);

  /** Server-tomonidagi oxirgi tahrirlar (yangi oy uchun asos) */
  const fetchMonthEdits = useCallback(async (m) => {
    try {
      const j = await api.get(`${API}/${brigade}/${m}`);
      return j.edits || {};
    } catch {
      const l = readLocal(brigade, m);
      return l ? l.edits : null;
    }
  }, [brigade]);

  return { months, journal, edits, setEdits, phase, offline, sync, conflict, resolveConflict, create, changeStatus, reload: load, fetchMonthEdits };
}
