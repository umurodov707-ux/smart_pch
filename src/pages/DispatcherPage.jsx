import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/ui';
import api from '../utils/api';
import { allowedBolinmalar } from '../utils/bolinma';
import DispatcherBoard from '../components/dispatcher/DispatcherBoard';
import BolinmaReport, { minutesLeft } from '../components/dispatcher/BolinmaReport';
import { DEADLINE } from '../components/dispatcher/sections.js';
import { bolinmaLabel, bolinmaNum } from '../components/dispatcher/line.js';
import '../components/dispatcher/dispatcher.css';

const pad = (x) => String(x).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (iso, days) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + days); return isoOf(d); };
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const DAYS = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];
const human = (iso) => { const d = new Date(`${iso}T12:00:00`); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${DAYS[d.getDay()]}`; };
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

function Deadline({ isToday, now, extra }) {
  if (!isToday) return <div className="dsp-dl">O‘tgan kun hisobotlari</div>;
  const left = minutesLeft(now, DEADLINE);
  if (left < 0) return <div className="dsp-dl bad">Muddat {DEADLINE} edi{extra ? <>, <b>{extra}</b></> : ''}</div>;
  const txt = left >= 60 ? `${Math.floor(left / 60)} soat ${left % 60} daqiqa qoldi` : `${left} daqiqa qoldi`;
  return <div className={`dsp-dl${left <= 90 ? ' soon' : ''}`}>Topshirish <b>{DEADLINE} gacha</b>, {txt}{extra ? `. ${extra}` : ''}</div>;
}

export default function DispatcherPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const toast = useToast();
  const role = String((user && user.role) || '').toLowerCase();
  const depts = Array.isArray(user && user.departments) ? user.departments : [];
  const isDispatcher = role === 'admin' || (role === 'department' && depts.includes('dispetcher'));
  const ownN = useMemo(() => {
    if (role !== 'bolinma') return null;
    const own = allowedBolinmalar(user);
    return own.length ? bolinmaNum(own[0]) : null;
  }, [user, role]);

  const [today, setToday] = useState(() => isoOf(new Date()));
  const [date, setDate] = useState(today);
  const [now, setNow] = useState(nowHM);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editN, setEditN] = useState(null); // dispetcher bo'linma nomidan kiritmoqda

  useEffect(() => {
    const t = setInterval(() => {
      setNow(nowHM());
      const iso = isoOf(new Date());
      setToday((prev) => (prev === iso ? prev : iso));
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const reload = useCallback(async () => {
    try {
      const list = await api.get(`/api/reports?date=${date}`);
      setReports(Array.isArray(list) ? list : []);
      setError('');
    } catch (e) {
      setError(e.message || 'Hisobotlarni yuklab bo‘lmadi');
    } finally { setLoading(false); }
  }, [date]);

  useEffect(() => { setLoading(true); reload(); }, [reload]);

  // real vaqt: yangi hisobot, ko'rib chiqildi, eslatma
  useEffect(() => {
    if (!socket) return undefined;
    const onSubmitted = (p) => { if (p && p.date === date) { reload(); if (isDispatcher) toast.info(`${bolinmaLabel(bolinmaNum(p.bolinma_id))} hisobot yubordi`); } };
    const onReviewed = (p) => {
      if (!p) return;
      if (p.date === date) reload();
      if (!isDispatcher) toast[p.status === 'accepted' ? 'success' : 'warning'](p.status === 'accepted' ? 'Hisobotingiz qabul qilindi' : `Hisobot qaytarildi: ${p.comment || ''}`);
    };
    const onRemind = (p) => { if (!isDispatcher && p) toast.warning(`Dispetcher eslatmoqda: ${p.date} hisobotini yuboring`); };
    socket.on('report_submitted', onSubmitted);
    socket.on('report_reviewed', onReviewed);
    socket.on('report_reminder', onRemind);
    return () => { socket.off('report_submitted', onSubmitted); socket.off('report_reviewed', onReviewed); socket.off('report_reminder', onRemind); };
  }, [socket, date, reload, isDispatcher, toast]);

  // ulanish yo'q bo'lsa ham har 60 soniyada yangilanadi
  useEffect(() => { const t = setInterval(reload, 60000); return () => clearInterval(t); }, [reload]);

  const isToday = date === today;
  const yesterday = shift(today, -1);
  const reportOf = (n) => reports.find((r) => bolinmaNum(r.bolinma_id) === n) || null;

  if (!isDispatcher && role === 'bolinma' && !ownN) {
    return <div className="dsp"><div className="dsp-empty">Profilingizga bo‘linma biriktirilmagan. Administratorga murojaat qiling.</div></div>;
  }

  const editing = isDispatcher ? editN : ownN;
  const missingCount = 10 - reports.length;

  return (
    <div className="dsp">
      <header className="dsp-top">
        <h1>{editing ? `${bolinmaLabel(editing)} hisoboti` : 'Kunlik hisobotlar'}<small>{editing ? human(date) : 'PCH-16 Qorlitog‘'}</small></h1>
        {editing && !isDispatcher ? (
          <div className="dsp-seg" role="group" aria-label="Kun">
            <button type="button" aria-pressed={date === yesterday} onClick={() => setDate(yesterday)}>Kecha</button>
            <button type="button" aria-pressed={date === today} onClick={() => setDate(today)}>Bugun</button>
          </div>
        ) : (
          <div className="dsp-date">
            <button type="button" aria-label="Oldingi kun" onClick={() => setDate(shift(date, -1))}><ChevronLeft size={16} /></button>
            <label style={{ position: 'relative', cursor: 'pointer' }}>
              <span>{human(date)}</span>
              <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Sana" />
            </label>
            <button type="button" aria-label="Keyingi kun" disabled={date >= today} onClick={() => setDate(shift(date, 1))}><ChevronRight size={16} /></button>
            {!isToday && <button type="button" style={{ width: 'auto', padding: '0 10px' }} onClick={() => setDate(today)}>Bugun</button>}
          </div>
        )}
        <Deadline isToday={isToday} now={now}
          extra={!editing && isToday && minutesLeft(now, DEADLINE) < 0 && missingCount > 0 ? `${missingCount} ta bo‘linma hali yubormagan` : ''} />
        <div className="dsp-who">{user && (user.full_name || user.username)}</div>
      </header>

      {error && <div className="dsp-wrap" style={{ paddingBottom: 0 }}><div className="dsp-note r"><b>Xatolik</b>{error}</div></div>}

      {editing ? (
        <BolinmaReport key={`${editing}-${date}`} n={editing} date={date} yesterday={shift(date, -1)} report={reportOf(editing)}
          reload={reload} asDispatcher={isDispatcher} onBack={() => setEditN(null)} />
      ) : loading && !reports.length ? (
        <div className="dsp-empty">Yuklanmoqda…</div>
      ) : (
        <DispatcherBoard date={date} isToday={isToday} nowHHMM={now} reports={reports} loading={loading} reload={reload}
          canReview={isDispatcher} onEdit={(n) => setEditN(n)} />
      )}
    </div>
  );
}
