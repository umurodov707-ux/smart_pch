import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function MainDashboard() {
  const { user } = useAuth();
  const [liveStats, setLiveStats] = useState({
    employees: 0,
    appealsPending: 0,
    izostiklarCount: 0,
    devicesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [resEmp, resApp, resIz, resDev] = await Promise.all([
          fetch('/api/hr/stats').catch(() => null),
          fetch('/api/murojaat/stats/summary').catch(() => null),
          fetch('/api/izostiklar/1-bo\'linma').catch(() => null),
          fetch('/api/metrology/devices').catch(() => null)
        ]);

        let empTotal = 0;
        if (resEmp && resEmp.ok) {
          const empData = await resEmp.json();
          empTotal = empData.total || empData.active || 0;
        }

        let appealsPending = 0;
        if (resApp && resApp.ok) {
          const appData = await resApp.json();
          appealsPending = appData.pending || appData.total || 0;
        }

        let izCount = 0;
        if (resIz && resIz.ok) {
          const izData = await resIz.json();
          izCount = Array.isArray(izData) ? izData.length : 0;
        }

        let devCount = 0;
        if (resDev && resDev.ok) {
          const devData = await resDev.json();
          devCount = Array.isArray(devData) ? devData.length : 0;
        }

        setLiveStats({
          employees: empTotal,
          appealsPending,
          izostiklarCount: izCount,
          devicesCount: devCount
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const stats = [
    { label: 'Jami Xodimlar (HR)', value: liveStats.employees || '—', icon: 'fas fa-users', color: 'from-emerald-500 to-emerald-600', text: 'text-emerald-500', link: '/dashboard/hr' },
    { label: 'Kutilayotgan Murojaatlar', value: liveStats.appealsPending || '0', icon: 'fas fa-envelope-open-text', color: 'from-amber-500 to-amber-600', text: 'text-amber-500', link: '/dashboard/appeals' },
    { label: 'Izostiklar Obyektlari', value: liveStats.izostiklarCount || '—', icon: 'fas fa-microchip', color: 'from-blue-500 to-blue-600', text: 'text-blue-500', link: '/dashboard/izostiklar' },
    { label: 'Metrologiya Asboblari', value: liveStats.devicesCount || '—', icon: 'fas fa-tachometer-alt', color: 'from-purple-500 to-purple-600', text: 'text-purple-500', link: '/dashboard/metrology' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1.5 z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100">
            Xush kelibsiz, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-400">{user?.name || user?.username || 'Foydalanuvchi'}</span>!
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Tizim ishchi holatda. Barcha dispetcherlik nazorati ma'lumotlari, HR, murojaat va jurnallarni tezkor boshqarishingiz mumkin.
          </p>
        </div>
        <div className="flex gap-3 z-10 shrink-0">
          <div className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Server status: ONLINE
          </div>
        </div>
      </div>

      {/* Grid stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link
            key={i} 
            to={stat.link}
            className="bg-slate-900/60 backdrop-blur border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between hover:border-amber-500/40 transition duration-300 group cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{stat.label}</span>
              <span className="text-3xl font-black text-slate-100 block">
                {loading ? <i className="fas fa-spinner fa-spin text-sm text-amber-500"></i> : stat.value}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center ${stat.text} text-xl group-hover:scale-110 transition duration-300 shadow-inner`}>
              <i className={stat.icon}></i>
            </div>
          </Link>
        ))}
      </div>

      {/* Main dashboard content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main content block - System overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <i className="fas fa-network-wired text-amber-500"></i>
              Dispetcherlik Nazorati Markazi
            </h3>
            <div className="border-t border-slate-800/60 my-3"></div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bu bo'limda siz temir yo'l masofasidagi barcha kundalik dispetcherlik hisobotlari, murojaatlar va real vaqtdagi hodisalarni nazorat qilishingiz mumkin. Barcha ma'lumotlar saqlanishi (database persistence) avtomatlashtirilgan.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Link to="/dashboard/hr" className="p-4 bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 rounded-xl transition group">
                <div className="text-amber-400 font-bold text-sm mb-1 group-hover:translate-x-1 transition-transform">
                  👥 HR va Kadrlar <i className="fas fa-arrow-right text-xs ml-1"></i>
                </div>
                <div className="text-xs text-slate-500">Xodimlar ro'yxati, tabel va o'chmaydigan obyektivka saqlash.</div>
              </Link>
              
              <Link to="/dashboard/appeals" className="p-4 bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 rounded-xl transition group">
                <div className="text-amber-400 font-bold text-sm mb-1 group-hover:translate-x-1 transition-transform">
                  📨 Murojaatlar Markazi <i className="fas fa-arrow-right text-xs ml-1"></i>
                </div>
                <div className="text-xs text-slate-500">Arizalar, E-Imzo vizalari va QR-kodli buyruqlar.</div>
              </Link>
              
              <Link to="/dashboard/izostiklar" className="p-4 bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 rounded-xl transition group">
                <div className="text-amber-400 font-bold text-sm mb-1 group-hover:translate-x-1 transition-transform">
                  🛠️ Izostiklar Monitori <i className="fas fa-arrow-right text-xs ml-1"></i>
                </div>
                <div className="text-xs text-slate-500">Izolyatsiyalangan birikmalar va almashtirish jurnali.</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right side panel - System activity */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <i className="fas fa-history text-amber-500"></i>
              Tizim statusi
            </h3>
            <div className="border-t border-slate-800/60 my-3"></div>
            <ul className="space-y-4">
              <li className="flex gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                <div>
                  <div className="font-bold text-slate-300">SQLite Bazasi Birlashtirildi</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Ma'lumotlar saqlanishi 100% faol</div>
                  <p className="text-slate-400 mt-1">Barcha yozuvlar sahifa yangilanganda ham o'chmay saqlanadi.</p>
                </div>
              </li>
              <li className="flex gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"></div>
                <div>
                  <div className="font-bold text-slate-300">Raqamli Buyruqlar Shakllantirish</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Verifikatsiyalangan PDF</div>
                  <p className="text-slate-400 mt-1">Murojaatlarga avtomatik QR-kodli buyruq shakllantirish ishchi holatda.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
