import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

// Oy nomlari
const OY_NOMLARI = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

// Tabel belgilari
const BELGILAR = {
  'Я':  { label: 'Я — Ish kuni',         color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'Б':  { label: 'Б — Kasallik',          color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  'О':  { label: 'О — Ta\'til',           color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'В':  { label: 'В — Dam olish',         color: 'bg-slate-700/40 text-slate-400 border-slate-600/30' },
  'К':  { label: 'К — Xizmat safari',     color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  'НН': { label: 'НН — Sababsiz',         color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  'Р':  { label: 'Р — Tug\'ruq ta\'tili', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  '':   { label: '— Bo\'sh',              color: 'bg-transparent text-slate-600 border-slate-800' },
};

const BELGI_KEYS = Object.keys(BELGILAR).filter(k => k !== '');

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function TimesheetTab({ bolinmaFilter, isSubdivisionUser, userBolinma }) {
  const { token } = useAuth();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [employees, setEmployees] = useState([]);
  const [tabelData, setTabelData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingCell, setEditingCell] = useState(null); // {empId, day}

  const daysInMonth = getDaysInMonth(year, month);
  const currentBolinma = isSubdivisionUser ? userBolinma : bolinmaFilter;

  // Fetch employees for the current bo'linma
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/hr/employees?';
      if (currentBolinma && currentBolinma !== 'all') {
        url += `bolinma_id=${encodeURIComponent(currentBolinma)}&`;
      }
      url += 'status=active';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Sort by full_name
        data.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, [token, currentBolinma]);

  // Fetch timesheet data for this month
  const fetchTimesheetData = useCallback(async () => {
    try {
      let url = `/api/timesheet/${year}/${month}?`;
      if (currentBolinma && currentBolinma !== 'all') {
        url += `bolinma_id=${encodeURIComponent(currentBolinma)}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTabelData(data || {});
      }
    } catch (error) {
      console.error('Error fetching timesheet:', error);
    } finally {
      setLoading(false);
    }
  }, [token, year, month, currentBolinma]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchTimesheetData();
  }, [fetchTimesheetData]);

  // Set a cell value
  const setCellValue = (empId, day, value) => {
    const key = `${empId}_${day}`;
    setTabelData(prev => ({ ...prev, [key]: value }));
    setEditingCell(null);
  };

  // Get cell value
  const getCellValue = (empId, day) => {
    return tabelData[`${empId}_${day}`] || '';
  };

  // Count work days for an employee
  const countByType = (empId, type) => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (getCellValue(empId, d) === type) count++;
    }
    return count;
  };

  // Save timesheet
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/timesheet/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          year,
          month,
          bolinma_id: currentBolinma || 'all',
          data: tabelData
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Tabel muvaffaqiyatli saqlandi!' });
      } else {
        setMessage({ type: 'error', text: 'Saqlashda xatolik yuz berdi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Tarmoq xatosi yuz berdi' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  // Fill all Sundays as "В" (dam olish)
  const fillWeekends = () => {
    const newData = { ...tabelData };
    employees.forEach(emp => {
      for (let d = 1; d <= daysInMonth; d++) {
        const dayOfWeek = new Date(year, month - 1, d).getDay();
        // Sunday = 0
        if (dayOfWeek === 0) {
          newData[`${emp.id}_${d}`] = 'В';
        }
      }
    });
    setTabelData(newData);
  };

  // Fill all empty cells as "Я" (ish kuni) except Sundays
  const fillWorkDays = () => {
    const newData = { ...tabelData };
    employees.forEach(emp => {
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${emp.id}_${d}`;
        const dayOfWeek = new Date(year, month - 1, d).getDay();
        if (!newData[key]) {
          newData[key] = dayOfWeek === 0 ? 'В' : 'Я';
        }
      }
    });
    setTabelData(newData);
  };

  // Get day of week name (short)
  const getDayName = (day) => {
    const names = ['Як', 'Ду', 'Се', 'Чо', 'Па', 'Жу', 'Ша'];
    const d = new Date(year, month - 1, day);
    return names[d.getDay()];
  };

  const isSunday = (day) => {
    return new Date(year, month - 1, day).getDay() === 0;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Top strip */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 border-b border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <i className="fas fa-table text-amber-500"></i>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-100 tracking-tight">
                    T A B E L
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {year}-yil {OY_NOMLARI[month - 1]} oyi uchun ish vaqtidan foydalanishni hisobga olish
                  </p>
                </div>
              </div>
            </div>

            {/* Month/Year selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/50 transition"
              >
                {OY_NOMLARI.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/50 transition"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">
              Xodimlar soni: <span className="font-extrabold text-amber-400">{employees.length}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Bo'lim: <span className="font-extrabold text-slate-200">
                {currentBolinma && currentBolinma !== 'all'
                  ? currentBolinma.toUpperCase()
                  : 'UMUMIY'}
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Kunlar: <span className="font-extrabold text-slate-200">{daysInMonth}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fillWeekends}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition"
              title="Barcha yakshanba kunlarni 'В' bilan to'ldirish"
            >
              <i className="fas fa-calendar-week mr-1"></i> Dam olish kunlari
            </button>
            <button
              onClick={fillWorkDays}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition"
              title="Bo'sh katakchalarni ish kuni bilan to'ldirish"
            >
              <i className="fas fa-fill mr-1"></i> Ish kunlarini to'ldirish
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="fas fa-save"></i>
              )}
              Saqlash
            </button>
          </div>
        </div>

        {/* Belgilar legend */}
        <div className="px-6 py-2.5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap gap-2">
          {BELGI_KEYS.map(key => (
            <span key={key} className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border ${BELGILAR[key].color}`}>
              {BELGILAR[key].label}
            </span>
          ))}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-3 rounded-xl text-sm border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-slate-500 text-sm">Yuklanmoqda...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <i className="fas fa-users-slash text-3xl text-slate-700 mb-3"></i>
          <p className="text-slate-500 text-sm">
            {currentBolinma && currentBolinma !== 'all'
              ? `${currentBolinma} bo'yicha xodimlar topilmadi`
              : 'Xodimlar topilmadi'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]" style={{ minWidth: `${700 + daysInMonth * 36}px` }}>
              <thead>
                {/* Row 1: № + Name + Day numbers */}
                <tr className="bg-slate-950/80">
                  <th className="sticky left-0 z-20 bg-slate-950 border-b border-r border-slate-700 px-2 py-2 text-center text-[9px] text-slate-500 font-extrabold w-10" rowSpan={2}>
                    №
                  </th>
                  <th className="sticky left-10 z-20 bg-slate-950 border-b border-r border-slate-700 px-3 py-2 text-left text-[9px] text-slate-500 font-extrabold uppercase tracking-wider min-w-[220px]" rowSpan={2}>
                    Familiyasi, ismi, otasining ismi
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <th
                      key={day}
                      className={`border-b border-r border-slate-700 px-0 py-1.5 text-center font-extrabold w-[34px] ${
                        isSunday(day)
                          ? 'bg-red-500/10 text-red-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                  {/* Summary columns */}
                  <th className="border-b border-r border-slate-700 px-2 py-1.5 text-center text-[9px] text-emerald-400 font-extrabold bg-emerald-500/5" rowSpan={2} title="Ish kunlari">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-briefcase text-[10px]"></i>
                      <span>Я</span>
                    </div>
                  </th>
                  <th className="border-b border-r border-slate-700 px-2 py-1.5 text-center text-[9px] text-blue-400 font-extrabold bg-blue-500/5" rowSpan={2} title="Ta'til">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-umbrella-beach text-[10px]"></i>
                      <span>О</span>
                    </div>
                  </th>
                  <th className="border-b border-r border-slate-700 px-2 py-1.5 text-center text-[9px] text-red-400 font-extrabold bg-red-500/5" rowSpan={2} title="Kasallik">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-notes-medical text-[10px]"></i>
                      <span>Б</span>
                    </div>
                  </th>
                  <th className="border-b border-slate-700 px-2 py-1.5 text-center text-[9px] text-orange-400 font-extrabold bg-orange-500/5" rowSpan={2} title="Sababsiz">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-exclamation-triangle text-[10px]"></i>
                      <span>НН</span>
                    </div>
                  </th>
                </tr>
                {/* Row 2: Day of week */}
                <tr className="bg-slate-950/60">
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <th
                      key={day}
                      className={`border-b border-r border-slate-700 px-0 py-1 text-center text-[8px] font-bold ${
                        isSunday(day)
                          ? 'bg-red-500/10 text-red-500/60'
                          : 'text-slate-600'
                      }`}
                    >
                      {getDayName(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-slate-800/20 transition group">
                    {/* Row number */}
                    <td className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800/40 border-b border-r border-slate-800 px-2 py-2 text-center text-[10px] text-slate-500 font-bold transition">
                      {idx + 1}
                    </td>
                    {/* Employee name */}
                    <td className="sticky left-10 z-10 bg-slate-900 group-hover:bg-slate-800/40 border-b border-r border-slate-800 px-3 py-2 transition">
                      <div className="font-bold text-slate-200 text-[11px] truncate max-w-[220px]" title={emp.full_name || emp.name}>
                        {emp.full_name || emp.name}
                      </div>
                      <div className="text-[9px] text-slate-500 font-semibold truncate">
                        {emp.position || 'Ishchi'}{emp.tabel_number ? ` (№${emp.tabel_number})` : ''}
                      </div>
                    </td>
                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const value = getCellValue(emp.id, day);
                      const sunday = isSunday(day);
                      const belgiStyle = BELGILAR[value] || BELGILAR[''];
                      const isEditing = editingCell?.empId === emp.id && editingCell?.day === day;

                      return (
                        <td
                          key={day}
                          className={`border-b border-r border-slate-800 px-0 py-0 text-center relative ${
                            sunday ? 'bg-red-500/5' : ''
                          }`}
                        >
                          {isEditing ? (
                            <div className="absolute inset-0 z-30 bg-slate-800 border-2 border-amber-500 rounded shadow-lg shadow-amber-500/20 flex flex-col overflow-visible"
                              style={{ width: '80px', marginLeft: '-23px', marginTop: '-4px' }}
                            >
                              {BELGI_KEYS.map(key => (
                                <button
                                  key={key}
                                  onClick={() => setCellValue(emp.id, day, key)}
                                  className={`px-1 py-0.5 text-[9px] font-bold hover:bg-slate-700 transition text-left ${
                                    value === key ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300'
                                  }`}
                                >
                                  {key}
                                </button>
                              ))}
                              <button
                                onClick={() => setCellValue(emp.id, day, '')}
                                className="px-1 py-0.5 text-[9px] font-bold hover:bg-slate-700 transition text-left text-slate-500"
                              >
                                ✕ Tozalash
                              </button>
                              <button
                                onClick={() => setEditingCell(null)}
                                className="px-1 py-0.5 text-[9px] font-bold hover:bg-red-500/20 transition text-left text-red-400 border-t border-slate-700"
                              >
                                Yopish
                              </button>
                            </div>
                          ) : null}
                          <button
                            onClick={() => setEditingCell({ empId: emp.id, day })}
                            className={`w-full h-full min-h-[28px] min-w-[32px] flex items-center justify-center text-[10px] font-extrabold border transition hover:border-amber-500/40 hover:bg-amber-500/5 ${belgiStyle.color}`}
                          >
                            {value || ''}
                          </button>
                        </td>
                      );
                    })}
                    {/* Summary cells */}
                    <td className="border-b border-r border-slate-800 px-1 py-2 text-center text-[11px] font-extrabold text-emerald-400 bg-emerald-500/5">
                      {countByType(emp.id, 'Я') || '—'}
                    </td>
                    <td className="border-b border-r border-slate-800 px-1 py-2 text-center text-[11px] font-extrabold text-blue-400 bg-blue-500/5">
                      {countByType(emp.id, 'О') || '—'}
                    </td>
                    <td className="border-b border-r border-slate-800 px-1 py-2 text-center text-[11px] font-extrabold text-red-400 bg-red-500/5">
                      {countByType(emp.id, 'Б') || '—'}
                    </td>
                    <td className="border-b border-slate-800 px-1 py-2 text-center text-[11px] font-extrabold text-orange-400 bg-orange-500/5">
                      {countByType(emp.id, 'НН') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
