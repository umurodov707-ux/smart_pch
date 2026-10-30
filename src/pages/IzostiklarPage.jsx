import React, { useState, useEffect } from 'react';
import { useConfirm } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function IzostiklarPage() {
  const confirm = useConfirm();
  const { user, token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    group_name: '',
    num: '',
    type: 'R-65',
    location: '',
    km: '',
    last_date: '',
    performer: ''
  });

  const bolinmaId = user?.bolinmalar?.[0] || '1-bo\'linma';

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/izostiklar/${encodeURIComponent(bolinmaId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Error fetching izostiklar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bolinmaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openEditor = (item = null) => {
    if (item) {
      setFormData({
        id: item.id,
        group_name: item.group_name || '',
        num: item.num || '',
        type: item.type || 'R-65',
        location: item.location || '',
        km: item.km || '',
        last_date: item.last_date || '',
        performer: item.performer || ''
      });
    } else {
      setFormData({
        id: null,
        group_name: '',
        num: '',
        type: 'R-65',
        location: '',
        km: '',
        last_date: new Date().toISOString().split('T')[0],
        performer: user?.username || ''
      });
    }
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/izostiklar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          ...formData,
          bolinma_id: bolinmaId
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving izostik:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Ma'lumot o'chirilsinmi?", description: "Bu amalni ortga qaytarib bo'lmaydi.", confirmText: "O'chirish", danger: true }))) return;
    try {
      const res = await fetch(`/api/izostiklar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting izostik:', error);
    }
  };

  const handleRebuild = async (item) => {
    if (!(await confirm({ title: 'Izostik almashtirilganini tasdiqlaysizmi?' }))) return;
    try {
      const res = await fetch('/api/izostiklar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          ...item,
          last_date: new Date().toISOString().split('T')[0],
          history: [...(item.history || []), { date: new Date().toISOString().split('T')[0], action: 'Rebuilt' }]
        })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error rebuilding izostik:', error);
    }
  };

  const calculateStatus = (lastDateStr) => {
    if (!lastDateStr) return { status: 'unknown', diffDays: 0, nextDate: null };
    
    // Support parsing 'YYYY-MM-DD' or 'DD.MM.YYYY'
    const parts = lastDateStr.split(/[-.]/);
    let last = new Date();
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        last = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        last = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }

    const next = new Date(last);
    if (!isNaN(next.getTime())) {
      next.setMonth(next.getMonth() + 6);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
    
    let status = 'done';
    if (diffDays < 0) status = 'expired';
    else if (diffDays < 15) status = 'warning';
    
    return { status, diffDays, nextDate: next };
  };

  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (item.num && item.num.toLowerCase().includes(q)) || 
           (item.location && item.location.toLowerCase().includes(q)) ||
           (item.group_name && item.group_name.toLowerCase().includes(q));
  });

  const stats = {
    total: filteredData.length,
    expired: 0,
    warning: 0,
    done: 0
  };

  // Group by group_name
  const groupedData = {};
  filteredData.forEach(item => {
    const s = calculateStatus(item.last_date);
    if (s.status === 'expired') stats.expired++;
    else if (s.status === 'warning') stats.warning++;
    else stats.done++;

    if (!groupedData[item.group_name]) groupedData[item.group_name] = [];
    groupedData[item.group_name].push({ ...item, ...s });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/20 text-amber-500 flex items-center justify-center text-2xl shadow-inner border border-amber-500/30">
            <i className="fas fa-microchip"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Izostiklar</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Izolyatsiyalangan birikmalarni monitoring qilish va rejalashtirish tizimi ({bolinmaId})</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
              placeholder="Qidiruv (KM, №...)"
            />
          </div>
          <button 
            onClick={() => openEditor()}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg whitespace-nowrap"
          >
            <i className="fas fa-plus mr-2"></i> Yangi qo'shish
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="text-xs text-slate-500 font-extrabold tracking-wider uppercase mb-2">Jami izostiklar</div>
          <div className="text-3xl font-black text-slate-100">{stats.total}</div>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="text-xs text-red-500/80 font-extrabold tracking-wider uppercase mb-2">Muddati o'tgan</div>
          <div className="text-3xl font-black text-red-500">{stats.expired}</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="text-xs text-amber-500/80 font-extrabold tracking-wider uppercase mb-2">Muddati yaqin</div>
          <div className="text-3xl font-black text-amber-500">{stats.warning}</div>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="text-xs text-emerald-500/80 font-extrabold tracking-wider uppercase mb-2">Bajarildi</div>
          <div className="text-3xl font-black text-emerald-500">{stats.done}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider bg-slate-950/40">
                <th className="py-4 px-6 rounded-tl-xl">№</th>
                <th className="py-4 px-4">№ Izostik</th>
                <th className="py-4 px-4">Turi</th>
                <th className="py-4 px-4">Joylashuvi</th>
                <th className="py-4 px-4">Oxirgi sana</th>
                <th className="py-4 px-4">Keyingi sana</th>
                <th className="py-4 px-4">Holati</th>
                <th className="py-4 px-6 text-right rounded-tr-xl">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <i className="fas fa-spinner fa-spin text-2xl mb-3 text-amber-500"></i>
                    <p>Yuklanmoqda...</p>
                  </td>
                </tr>
              ) : Object.keys(groupedData).length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <i className="fas fa-search text-3xl mb-3 text-slate-600"></i>
                    <p>Ma'lumot topilmadi</p>
                  </td>
                </tr>
              ) : (
                Object.entries(groupedData).map(([groupName, items]) => (
                  <React.Fragment key={groupName}>
                    <tr className="bg-amber-500/5 border-b border-slate-800/50">
                      <td colSpan="8" className="py-3 px-6 text-amber-500 text-xs font-extrabold uppercase tracking-wider">
                        <i className="fas fa-map-signs mr-2"></i> {groupName || 'Boshqa'}
                      </td>
                    </tr>
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                        <td className="py-4 px-6 text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-4 px-4 font-bold text-slate-200">{item.num}</td>
                        <td className="py-4 px-4 text-slate-300">{item.type}</td>
                        <td className="py-4 px-4 text-slate-400">{item.location}</td>
                        <td className="py-4 px-4 text-slate-300">
                          {(item.last_date || '').includes('-') ? (item.last_date || '').split('-').reverse().join('.') : item.last_date}
                        </td>
                        <td className={`py-4 px-4 font-bold ${item.status === 'expired' ? 'text-red-500' : 'text-slate-200'}`}>
                          {item.nextDate && !isNaN(item.nextDate.getTime()) ? item.nextDate.toLocaleDateString('ru-RU') : '-'}
                        </td>
                        <td className="py-4 px-4">
                          {item.status === 'expired' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider">
                              <i className="fas fa-exclamation-circle"></i> Muddati o'tgan
                            </span>
                          )}
                          {item.status === 'warning' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                              <i className="fas fa-clock"></i> Yaqinlashmoqda
                            </span>
                          )}
                          {item.status === 'done' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                              <i className="fas fa-check-circle"></i> OK
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRebuild(item)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
                                item.status === 'expired'
                                  ? 'bg-red-500 text-slate-950 border-red-500 hover:bg-red-600'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              <i className="fas fa-tools"></i> Almashtirildi
                            </button>
                            <button
                              onClick={() => openEditor(item)}
                              className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 flex items-center justify-center transition"
                              title="Tahrirlash"
                            >
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center transition"
                              title="O'chirish"
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center relative z-10">
              <h3 className="font-black text-slate-100 text-lg">
                {formData.id ? 'Izostikni tahrirlash' : 'Yangi izostik qo\'shish'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 transition p-2 hover:bg-slate-800 rounded-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Guruh nomi (Peregon/Stansiya)</label>
                  <input
                    type="text"
                    name="group_name"
                    value={formData.group_name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Izostik №</label>
                  <input
                    type="text"
                    name="num"
                    value={formData.num}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Joylashuvi (KM PK)</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Turi</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                  >
                    <option value="R-65">R-65</option>
                    <option value="R-50">R-50</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Oxirgi almashtirilgan sana</label>
                  <input
                    type="date"
                    name="last_date"
                    value={formData.last_date}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bajaruvchi</label>
                  <input
                    type="text"
                    name="performer"
                    value={formData.performer}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-sm transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
