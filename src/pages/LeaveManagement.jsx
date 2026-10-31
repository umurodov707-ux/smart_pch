import React, { useState, useEffect } from 'react';
import { useConfirm } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { ownBolinma } from '../utils/bolinma';

export default function LeaveManagement() {
  const confirm = useConfirm();
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [vacationEmployees, setVacationEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [vacationStart, setVacationStart] = useState('');
  const [vacationEnd, setVacationEnd] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Bo'linma foydalanuvchisi faqat o'z bo'linmasini ko'radi (qoida: utils/bolinma.js)
  const { isSubdivisionUser, userBolinma } = ownBolinma(user);

  useEffect(() => {
    fetchEmployees();
  }, [isSubdivisionUser, userBolinma]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const activeFilter = isSubdivisionUser ? userBolinma : 'all';
      let url = '/api/hr/employees';
      if (activeFilter !== 'all') {
        url += `?bolinma_id=${encodeURIComponent(activeFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        
        // Filter those who have vacation dates configured
        const onVac = data.filter(emp => emp.vacation_start_date || emp.status === 'vacation');
        setVacationEmployees(onVac);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterLeave = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId || !vacationStart) {
      setError('Xodim va ta‘til boshlanish sanasini belgilang');
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Update vacation dates
      const vacationResponse = await fetch(`/api/hr/employees/${selectedEmployeeId}/vacation`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          vacation_start_date: vacationStart,
          vacation_end_date: vacationEnd || null
        })
      });

      if (!vacationResponse.ok) {
        throw new Error('Ta‘til sanalarini yangilashda xatolik yuz berdi');
      }

      // 2. Fetch employee details to update status to "vacation"
      const currentEmp = employees.find(emp => emp.id === parseInt(selectedEmployeeId));
      if (currentEmp) {
        const updateResponse = await fetch(`/api/hr/employees/${selectedEmployeeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            ...currentEmp,
            status: 'vacation' // Automatically change status to vacation
          })
        });
        if (!updateResponse.ok) {
          console.warn('Status could not be updated to vacation automatically');
        }
      }

      setMessage({ type: 'success', text: 'Ta‘til muddati muvaffaqiyatli ro‘yxatga olindi va xodim statusi o‘zgartirildi.' });
      setSelectedEmployeeId('');
      setVacationStart('');
      setVacationEnd('');
      fetchEmployees();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (emp) => {
    if (!(await confirm({ title: `${emp.full_name || emp.name}ning ta‘tili bekor qilinsinmi?`, confirmText: 'Ta‘tilni bekor qilish', cancelText: 'Orqaga', danger: true }))) return;

    try {
      // Reset vacation dates
      await fetch(`/api/hr/employees/${emp.id}/vacation`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          vacation_start_date: null,
          vacation_end_date: null
        })
      });

      // Change status to active
      await fetch(`/api/hr/employees/${emp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          ...emp,
          status: 'active'
        })
      });

      setMessage({ type: 'success', text: 'Ta‘til muvaffaqiyatli bekor qilindi.' });
      fetchEmployees();
    } catch (error) {
      setMessage({ type: 'error', text: 'Ta‘tilni bekor qilishda xatolik yuz berdi' });
    }
  };

  // Helper to check if a vacation is active today
  const isVacationActive = (start, end) => {
    if (!start) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    if (endDate) {
      return today >= startDate && today <= endDate;
    }
    return today >= startDate;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <i className="fas fa-calendar-alt text-amber-500"></i>
          Xodimlar Ta‘tillari va Grafiklari
        </h1>
        <p className="text-xs text-slate-400 mt-1">Xodimlarning mehnat ta‘tillarini rejalashtirish, tasdiqlash va monitoring qilish bo‘limi</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Grid: Form on Left, List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 h-fit">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <i className="fas fa-edit text-amber-500"></i>
            Ta‘tilni rasmiylashtirish
          </h3>
          <div className="border-t border-slate-800/60 my-2"></div>
          
          <form onSubmit={handleRegisterLeave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Xodimni tanlang</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                required
              >
                <option value="">— Tanlang —</option>
                {employees
                  .filter(emp => emp.status !== 'inactive')
                  .map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name || emp.name} ({emp.position || 'Ishchi'})
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ta‘til boshlanishi</label>
              <input
                type="date"
                value={vacationStart}
                onChange={(e) => setVacationStart(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ta‘til tugashi (Ixtiyoriy)</label>
              <input
                type="date"
                value={vacationEnd}
                onChange={(e) => setVacationEnd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  Ta‘tilga yuborish
                </>
              )}
            </button>
          </form>
        </div>

        {/* List of active / scheduled vacations */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <i className="fas fa-plane-departure text-amber-500"></i>
            Ta‘tildagi xodimlar ro‘yxati {isSubdivisionUser ? `(${userBolinma})` : ''}
          </h3>
          <div className="border-t border-slate-800/60 my-2"></div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : vacationEmployees.length === 0 ? (
            <p className="text-sm text-slate-500 py-10 text-center">Hozirda hech kim ta‘tilda emas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider bg-slate-950/40">
                    <th className="py-3 px-4">Xodim</th>
                    <th className="py-3 px-4">Lavozimi</th>
                    <th className="py-3 px-4">Ta‘til muddati</th>
                    <th className="py-3 px-4 text-center">Holati</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                  {vacationEmployees.map((emp) => {
                    const active = isVacationActive(emp.vacation_start_date, emp.vacation_end_date);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/20 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-200">{emp.full_name || emp.name}</td>
                        <td className="py-3.5 px-4 text-xs">{emp.position || 'Ishchi'}</td>
                        <td className="py-3.5 px-4 text-xs font-mono">
                          {emp.vacation_start_date || '—'} 
                          <i className="fas fa-arrow-right mx-1.5 text-[9px] text-slate-600"></i> 
                          {emp.vacation_end_date || 'Noma‘lum'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            active 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {active ? 'Faol ta‘til' : 'Rejalashtirilgan'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleCancelLeave(emp)}
                            className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-red-500/30 hover:text-red-400 text-slate-500 rounded-lg text-xs font-bold transition"
                            title="Ta‘tilni tugatish/bekor qilish"
                          >
                            Bekor qilish
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
