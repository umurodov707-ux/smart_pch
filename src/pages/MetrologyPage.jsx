import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
// lucide-react v1 da ikonka nomlari o'zgargan (CheckCircle2, AlertTriangle,
// XCircle, PlusCircle, BarChart3 endi mavjud emas). Eski nomlar `undefined`
// bo'lib qolgani uchun bu sahifa "Element type is invalid" xatosi bilan
// ochilmasdi. Yangi nomlar eski nomlarga alias qilindi.
import {
    Activity, Zap, ShieldAlert, Clock, Calendar, TrendingUp, TrendingDown,
    Save, X, FileText, Check, MessageSquare,
    CircleCheckBig as CheckCircle2,
    TriangleAlert as AlertTriangle,
    CircleX as XCircle,
    CirclePlus as PlusCircle,
    ChartColumnBig as BarChart3
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    ReferenceLine, LineChart, Line, Legend
} from 'recharts';

export default function MetrologyPage() {
  const toast = useToast();
    const { token, user: authUser } = useAuth();
    const [viewMode, setViewMode] = useState('electricity'); // 'electricity' | 'devices'
    const [userRole, setUserRole] = useState('subdivision');
    const [bolinmaId, setBolinmaId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [electricityHistory, setElectricityHistory] = useState([]);
    const [devices, setDevices] = useState([]);
    
    // Form states for Subdivision
    const [currentReading, setCurrentReading] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
    const [limitVal, setLimitVal] = useState(10000); // Default limit
    
    // Admin Review States
    const [pendingReviews, setPendingReviews] = useState([]);
    const [reviewReason, setReviewReason] = useState('');
    
    // New Device Modal
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', serial: '', stampDate: '' });

    const getAuthHeaders = () => {
        const headers = { 'X-Requested-With': 'XMLHttpRequest' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    useEffect(() => {
        const user = authUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const role = (user.role === 'admin' || user.bolinmalar?.[0] === 'admin') ? 'admin' : 'subdivision';
        const bId = user.bolinmalar?.[0] || '1-bolinma';
        setUserRole(role);
        setBolinmaId(bId);
        
        fetchData(role, bId);
    }, [authUser, token]);

    const fetchData = async (role, bId) => {
        setIsLoading(true);
        try {
            // Fetch devices
            const devRes = await fetch(`/api/metrology/devices${role !== 'admin' ? `?bolinma_id=${bId}` : ''}`, { headers: getAuthHeaders() });
            if(devRes.ok) {
                const devData = await devRes.json();
                setDevices(devData);
            }

            // Fetch electricity
            const elecRes = await fetch(`/api/metrology/electricity/${role === 'admin' ? 'summary' : bId}`, { headers: getAuthHeaders() });
            if (elecRes.ok) {
                const elecData = await elecRes.json();
                setElectricityHistory(elecData);
                
                if (role === 'admin') {
                    setPendingReviews(elecData.filter(e => e.status === 'pending'));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleElectricitySubmit = async () => {
        if (!currentReading) return toast.warning("Ko'rsatkichni kiriting");
        
        try {
            // Calculate consumption based on previous reading
            let prevReading = 0;
            if (electricityHistory.length > 0) {
                prevReading = electricityHistory[0].currentMonth || 0;
            }
            
            const req = await fetch('/api/metrology/electricity', {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bolinmaId,
                    lastReading: prevReading,
                    currentMonth: Number(currentReading),
                    month_year: selectedMonth
                })
            });
            if (req.ok) {
                toast.success('Hisobot tasdiqlash uchun yuborildi');
                setCurrentReading('');
                fetchData(userRole, bolinmaId);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleReview = async (id, status) => {
        if (status === 'rejected' && !reviewReason) {
            const reason = prompt("Rad etish sababini yozing:");
            if (!reason) return;
            setReviewReason(reason);
            try {
                const req = await fetch(`/api/metrology/electricity/${id}/status`, {
                    method: 'PUT',
                    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status, rejection_reason: reason })
                });
                if (req.ok) {
                    setReviewReason('');
                    fetchData(userRole, bolinmaId);
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            try {
                const req = await fetch(`/api/metrology/electricity/${id}/status`, {
                    method: 'PUT',
                    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });
                if (req.ok) {
                    fetchData(userRole, bolinmaId);
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleAddDevice = async () => {
        if (!newDevice.name || !newDevice.stampDate) return toast.warning('Asbob nomi va sanasini kiriting');
        try {
            const req = await fetch('/api/metrology/devices', {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bolinma_id: bolinmaId,
                    name: newDevice.name,
                    serial: newDevice.serial,
                    stampDate: newDevice.stampDate
                })
            });
            if (req.ok) {
                setShowDeviceModal(false);
                setNewDevice({ name: '', serial: '', stampDate: '' });
                fetchData(userRole, bolinmaId);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getDeviceStatus = (stampDate, isElektr) => {
        if (!stampDate) return { class: 'text-slate-400 bg-slate-800', label: 'Noma\'lum', days: 0, pct: 0 };
        const stamp = new Date(stampDate);
        const years = isElektr ? 4 : 1;
        const expiry = new Date(stamp.getFullYear() + years, stamp.getMonth(), stamp.getDate());
        const daysLeft = Math.floor((expiry - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) return { class: 'text-red-500 bg-red-500/10 border-red-500/30', label: 'Muddati o\'tgan', days: daysLeft, pct: 100 };
        if (daysLeft <= (isElektr ? 180 : 30)) return { class: 'text-amber-500 bg-amber-500/10 border-amber-500/30', label: 'Yaqinlashmoqda', days: daysLeft, pct: 85 };
        return { class: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', label: 'Soz holatda', days: daysLeft, pct: Math.min(100, (daysLeft/365)*100) };
    };

    const chartData = [...electricityHistory].reverse().map(h => {
        const consumption = h.currentMonth - h.lastReading;
        return {
            name: h.month_year || h.date.substring(0,7),
            Sarf: consumption > 0 ? consumption : 0,
            Limit: limitVal
        };
    });

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-cyan-500"><Activity className="animate-spin w-8 h-8" /></div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
                        Metrologiya va Elektr
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium">
                        {userRole === 'admin' ? 'Markaziy Nazorat Paneli' : `${bolinmaId.toUpperCase()} Laboratoriyasi`}
                    </p>
                </div>
                
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    <button 
                        onClick={() => setViewMode('electricity')}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'electricity' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Zap className="w-4 h-4" /> Elektr Monitori
                    </button>
                    <button 
                        onClick={() => setViewMode('devices')}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'devices' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Activity className="w-4 h-4" /> Asboblar Pasporti
                    </button>
                </div>
            </div>

            {viewMode === 'electricity' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {userRole === 'admin' && (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                            <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-amber-400" /> 
                                Kutilayotgan Tasdiqlar ({pendingReviews.length})
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            <th className="p-3">Bo'linma</th>
                                            <th className="p-3">Oy</th>
                                            <th className="p-3">Ko'rsatkich</th>
                                            <th className="p-3">Harakat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {pendingReviews.map(r => (
                                            <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="p-3 font-medium text-slate-50">{r.bolinma_id}</td>
                                                <td className="p-3 text-cyan-400">{r.month_year || r.date}</td>
                                                <td className="p-3 font-bold text-amber-400">{r.currentMonth} kWh</td>
                                                <td className="p-3 flex gap-2">
                                                    <button onClick={() => handleReview(r.id, 'approved')} className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md hover:bg-emerald-500/20 flex items-center gap-1 text-sm font-medium transition-colors"><Check className="w-4 h-4"/> Qabul</button>
                                                    <button onClick={() => handleReview(r.id, 'rejected')} className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md hover:bg-red-500/20 flex items-center gap-1 text-sm font-medium transition-colors"><X className="w-4 h-4"/> Rad etish</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingReviews.length === 0 && (
                                            <tr><td colSpan="4" className="p-6 text-center text-slate-500 font-medium">Yangi hisobotlar yo'q</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {userRole === 'subdivision' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-cyan-500/10 transition-colors"></div>
                                    <div className="text-sm font-bold text-slate-400 mb-2">JORIY OY SARFI</div>
                                    <div className="text-4xl font-black text-slate-50 flex items-baseline gap-2">
                                        {chartData.length > 0 ? chartData[chartData.length-1].Sarf : 0} 
                                        <span className="text-lg font-medium text-cyan-500">kWh</span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-sm">
                                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                                        <span className="text-emerald-400 font-medium">-12% tejaldi</span>
                                        <span className="text-slate-500">o'tgan oyga nisbatan</span>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                                    <div className="text-sm font-bold text-slate-400 mb-2">LIMIT HOLATI (10,000 kWh)</div>
                                    <div className="text-3xl font-black text-slate-50 mb-3">
                                        {Math.round(((chartData.length > 0 ? chartData[chartData.length-1].Sarf : 0) / limitVal) * 100) || 0}%
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden">
                                        <div className="bg-gradient-to-r from-emerald-400 to-cyan-500 h-2.5 rounded-full" style={{ width: `${Math.round(((chartData.length > 0 ? chartData[chartData.length-1].Sarf : 0) / limitVal) * 100)}%` }}></div>
                                    </div>
                                    <div className="text-xs text-slate-400 flex justify-between">
                                        <span>Xavfsiz hudud</span>
                                        <span>{limitVal - (chartData.length > 0 ? chartData[chartData.length-1].Sarf : 0)} kWh qoldi</span>
                                    </div>
                                </div>

                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                                    {new Date().getDate() >= 20 && new Date().getDate() <= 25 && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-sm font-bold text-amber-400 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> 25-SANA HISOBOTI
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-50 text-sm outline-none focus:border-cyan-500/50" />
                                        <input type="number" placeholder="Ko'rsatkich..." value={currentReading} onChange={e => setCurrentReading(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-50 font-bold outline-none focus:border-cyan-500/50" />
                                    </div>
                                    <button onClick={handleElectricitySubmit} className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex justify-center items-center gap-2">
                                        <Save className="w-4 h-4" /> Yuborish (Kutilmoqda)
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-slate-50 mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-cyan-400" /> Yillik Sarf Tarixi
                                </h2>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', color: '#fff'}} />
                                            <Legend />
                                            <Bar dataKey="Sarf" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                            <Line type="monotone" dataKey="Limit" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {viewMode === 'devices' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-400" /> Asbob-uskunalar Pasporti
                        </h2>
                        {userRole === 'subdivision' && (
                            <button onClick={() => setShowDeviceModal(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" /> Yangi qo'shish
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800/80 bg-slate-900/80 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="p-4">Asbob / S/N</th>
                                    {userRole === 'admin' && <th className="p-4">Bo'linma</th>}
                                    <th className="p-4">Oxirgi Kalibrovka</th>
                                    <th className="p-4">Holati</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {devices.map(d => {
                                    const status = getDeviceStatus(d.stampDate, (d.name||'').toLowerCase().includes('elektr'));
                                    return (
                                        <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-50">{d.name}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-1">SN: {d.serial || 'Yo\'q'}</div>
                                            </td>
                                            {userRole === 'admin' && <td className="p-4 text-slate-300 font-medium">{d.bolinma_id}</td>}
                                            <td className="p-4">
                                                <div className="text-slate-300 font-medium">{d.stampDate || '---'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded-md text-xs font-bold border ${status.class}`}>
                                                        {status.label}
                                                    </span>
                                                    <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                        <div className={`h-1.5 rounded-full ${status.class.includes('red') ? 'bg-red-500' : status.class.includes('amber') ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${status.pct}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {devices.length === 0 && (
                                    <tr><td colSpan={userRole === 'admin' ? 4 : 3} className="p-8 text-center text-slate-500">Ma'lumot topilmadi</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showDeviceModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-cyan-900/20">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                            <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-cyan-400" /> Yangi Asbob
                            </h3>
                            <button onClick={() => setShowDeviceModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2">ASBOB NOMI</label>
                                <input type="text" value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-50 outline-none focus:border-cyan-500/50" placeholder="Masalan: Shtangensirkul" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2">SERIYA RAQAMI</label>
                                <input type="text" value={newDevice.serial} onChange={e => setNewDevice({...newDevice, serial: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-50 outline-none focus:border-cyan-500/50" placeholder="S/N..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2">KALIBROVKA SANASI</label>
                                <input type="date" value={newDevice.stampDate} onChange={e => setNewDevice({...newDevice, stampDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 outline-none focus:border-cyan-500/50" />
                            </div>
                            <button onClick={handleAddDevice} className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20">
                                Saqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
