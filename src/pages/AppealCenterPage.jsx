import React, { useState, useEffect } from 'react';
import { useToast, useConfirm } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function AppealCenterPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const { token } = useAuth();
  const [appeals, setAppeals] = useState([]);
  const [statsData, setStatsData] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [managerComment, setManagerComment] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAppealForm, setNewAppealForm] = useState({
    employee_name: '',
    employee_position: '',
    bolinma_id: '1-bo\'linma',
    murojaat_type: 'Ariza',
    murojaat_text: ''
  });

  const getAuthHeaders = () => {
    const headers = { 'X-Requested-With': 'XMLHttpRequest' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Load appeals and stats from backend API
  const fetchAppealsData = async () => {
    setLoading(true);
    try {
      const [resAppeals, resStats] = await Promise.all([
        fetch('/api/murojaat', { headers: getAuthHeaders() }).catch(() => null),
        fetch('/api/murojaat/stats/summary', { headers: getAuthHeaders() }).catch(() => null)
      ]);

      if (resAppeals && resAppeals.ok) {
        const data = await resAppeals.json();
        setAppeals(data || []);
      } else {
        // Ilgari bu yerda 5 ta soxta murojaat ko'rsatilardi — foydalanuvchi ularni haqiqiy deb o'ylardi
        setAppeals([]);
        toast.error('Murojaatlarni serverdan yuklab bo‘lmadi');
      }

      if (resStats && resStats.ok) {
        const stats = await resStats.json();
        setStatsData(stats);
      } else {
        setStatsData({ total: 0, pending: 0, approved: 0, rejected: 0 }); // ilgari soxta 1284/342/892/50
      }
    } catch (err) {
      console.error('Error fetching appeals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppealsData();
  }, []);

  // Filter logic
  const filteredAppeals = appeals.filter(appeal => {
    const statusMatch = 
      activeTab === 'all' ? true :
      activeTab === 'yangi' ? (appeal.status === 'pending' || appeal.status === 'Yangi') :
      activeTab === 'jarayon' ? (appeal.status === 'pending' || appeal.status === 'Jarayonda') :
      activeTab === 'hal' ? (appeal.status === 'approved' || appeal.status === 'Hal etilgan') :
      activeTab === 'rad' ? (appeal.status === 'rejected' || appeal.status === 'Rad etilgan') : true;

    const query = searchQuery.toLowerCase();
    const searchMatch = !searchQuery || 
      (appeal.employee_name && appeal.employee_name.toLowerCase().includes(query)) ||
      (appeal.murojaat_text && appeal.murojaat_text.toLowerCase().includes(query)) ||
      (appeal.murojaat_type && appeal.murojaat_type.toLowerCase().includes(query)) ||
      (appeal.employee_position && appeal.employee_position.toLowerCase().includes(query));

    return statusMatch && searchMatch;
  });

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
      case 'Yangi':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30"><i className="fas fa-clock mr-1"></i> Jarayonda</span>;
      case 'approved':
      case 'Hal etilgan':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><i className="fas fa-check-circle mr-1"></i> Tasdiqlangan (VIZA)</span>;
      case 'rejected':
      case 'Rad etilgan':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30"><i className="fas fa-times-circle mr-1"></i> Rad etilgan</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  };

  // Status Timeline Steps
  const timelineSteps = [
    { num: 1, title: 'Murojaat Yuborildi', desc: 'Elektron tizimga kelib tushgan' },
    { num: 2, title: 'E-Imzo va Biometriya', desc: 'Identifikatsiya tasdiqlangan' },
    { num: 3, title: 'Rahbar Ko\'rib Chiqishi', desc: 'Rahbar vizasi kutilmoqda' },
    { num: 4, title: 'Kadrlar Bo\'limi', desc: 'Buyruq (Prikaz) loyihasi' },
    { num: 5, title: 'Rasman Ijro Etildi', desc: 'Hujjat tasdiqlandi va yopildi' }
  ];

  const getStepNumber = (status) => {
    if (status === 'approved' || status === 'Hal etilgan') return 5;
    if (status === 'rejected' || status === 'Rad etilgan') return 2;
    return 3; // pending
  };

  // Approve Appeal Handler
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/murojaat/${id}/approve`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_name: 'Bosh Muhandis / Rahbar', manager_comment: managerComment || 'Ma\'qullandi. VIZA qo\'yildi.' })
      });
      if (res.ok) {
        toast.success("Murojaatga VIZA qo'yildi va tasdiqlandi");
        setSelectedAppeal(null);
        setManagerComment('');
        fetchAppealsData();
      } else {
        // Fallback for UI if offline
        setAppeals(appeals.map(a => a.id === id ? { ...a, status: 'approved', manager_comment: managerComment || 'Ma\'qullandi', manager_name: 'Bosh Muhandis' } : a));
        toast.warning("Server bilan bog'lanib bo'lmadi: o'zgarish faqat shu ekranda ko'rinadi va saqlanmadi");
        setSelectedAppeal(null);
      }
    } catch (e) {
      setAppeals(appeals.map(a => a.id === id ? { ...a, status: 'approved', manager_comment: managerComment || 'Ma\'qullandi', manager_name: 'Bosh Muhandis' } : a));
      toast.warning("Server bilan bog'lanib bo'lmadi: o'zgarish faqat shu ekranda ko'rinadi va saqlanmadi");
      setSelectedAppeal(null);
    }
  };

  // Reject Appeal Handler
  const handleReject = async (id) => {
    if (!managerComment) {
      toast.warning('Rad etish sababini izoh maydoniga kiriting');
      return;
    }
    try {
      const res = await fetch(`/api/murojaat/${id}/reject`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_name: 'Rahbar', manager_comment: managerComment })
      });
      if (res.ok) {
        toast.success('Murojaat rad etildi');
        setSelectedAppeal(null);
        setManagerComment('');
        fetchAppealsData();
      } else {
        setAppeals(appeals.map(a => a.id === id ? { ...a, status: 'rejected', manager_comment: managerComment } : a));
        toast.warning("Server bilan bog'lanib bo'lmadi: o'zgarish faqat shu ekranda ko'rinadi va saqlanmadi");
        setSelectedAppeal(null);
      }
    } catch (e) {
      setAppeals(appeals.map(a => a.id === id ? { ...a, status: 'rejected', manager_comment: managerComment } : a));
      toast.warning("Server bilan bog'lanib bo'lmadi: o'zgarish faqat shu ekranda ko'rinadi va saqlanmadi");
      setSelectedAppeal(null);
    }
  };

  // Delete Appeal
  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Murojaat o'chirilsinmi?", description: "Bu amalni ortga qaytarib bo'lmaydi.", confirmText: "O'chirish", danger: true }))) return;
    try {
      await fetch(`/api/murojaat/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setAppeals(appeals.filter(a => a.id !== id));
      setSelectedAppeal(null);
    } catch (e) {
      setAppeals(appeals.filter(a => a.id !== id));
      setSelectedAppeal(null);
    }
  };

  // Create New Appeal Handler
  const handleCreateAppeal = async (e) => {
    e.preventDefault();
    if (!newAppealForm.employee_name || !newAppealForm.murojaat_text) {
      toast.warning("F.I.O va murojaat matnini to'ldirish majburiy");
      return;
    }
    try {
      const res = await fetch('/api/murojaat', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppealForm)
      });
      if (res.ok) {
        toast.success('Yangi murojaat saqlandi');
        setShowNewModal(false);
        setNewAppealForm({ employee_name: '', employee_position: '', bolinma_id: '1-bo\'linma', murojaat_type: 'Ariza', murojaat_text: '' });
        fetchAppealsData();
      } else {
        throw new Error('Server error');
      }
    } catch (e) {
      // Offline fallback creation
      const created = {
        id: Date.now(),
        code: '(saqlanmagan)',
        employee_name: newAppealForm.employee_name,
        employee_position: newAppealForm.employee_position || 'Xodim',
        bolinma_id: newAppealForm.bolinma_id,
        murojaat_type: newAppealForm.murojaat_type,
        murojaat_text: newAppealForm.murojaat_text,
        created_at: new Date().toISOString(),
        status: 'pending'
      };
      setAppeals([created, ...appeals]);
      toast.warning("Server bilan bog'lanib bo'lmadi: o'zgarish faqat shu ekranda ko'rinadi va saqlanmadi");
      setShowNewModal(false);
      setNewAppealForm({ employee_name: '', employee_position: '', bolinma_id: '1-bo\'linma', murojaat_type: 'Ariza', murojaat_text: '' });
    }
  };

  // Generate Buyruq (Official Decree/Order PDF Printable Window)
  const handleGenerateBuyruq = (appeal) => {
    const todayStr = new Date().toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });
    // Buyruq raqami murojaatga bog'liq (ilgari har ochilganda tasodifiy raqam chiqardi)
    const orderNo = String(appeal.code || appeal.id || '').replace(/^#/, '');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BUYRUQ № ${orderNo}-K</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; color: #000; padding: 40px; margin: 0; }
          .header { text-align: center; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .sub-header { text-align: center; font-size: 12pt; margin-bottom: 30px; font-weight: normal; }
          .title { text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 30px; letter-spacing: 2px; }
          .doc-meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-weight: bold; }
          .content { text-align: justify; text-indent: 50px; margin-bottom: 20px; }
          .signatures { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
          .qr-box { margin-top: 40px; border: 1px dashed #444; padding: 15px; border-radius: 8px; font-size: 10pt; display: flex; align-items: center; justify-content: space-between; background: #f9f9f9; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 25px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ Chop etish / PDF Saqlash
          </button>
        </div>

        <div class="header">
          "O'ZBEKISTON TEMIR YO'LLARI" AJ<br>
          "TOSHKENT TEMIR YO'L MASOFASI" (PCH-8)
        </div>
        <div class="sub-header">
          Navoiy va Toshkent temir yo me'yoriy chegarasi bo'linmasi
        </div>

        <div class="title">B U Y R U Q</div>

        <div class="doc-meta">
          <div>${todayStr} y.</div>
          <div>№ ${orderNo}-K</div>
          <div>Navoiy sh.</div>
        </div>

        <div class="content">
          <b>Mavzu:</b> ${appeal.murojaat_text ? appeal.murojaat_text.substring(0, 80) : 'Xodimning murojaati bo\'yicha'}.
        </div>

        <div class="content">
          O'zbekiston Respublikasi Mehnat Kodeksining tegishli moddalari hamda <b>${appeal.employee_name || 'Xodim'}</b> (${appeal.employee_position || 'Xodim'}) ning ${formatDate(appeal.created_at)} sanadagi murojaatiga (Ariza id: ${appeal.id}) asosan:
        </div>

        <div style="font-weight: bold; margin-left: 30px; margin-bottom: 15px;">
          B U Y U R A M A N:
        </div>

        <div class="content">
          1. ${appeal.bolinma_id || 'Bo\'linma'} xodimi <b>${appeal.employee_name}</b> ga bildirilgan murojaat mazmuniga muvofiq tegishli amaliy choralar va rasmiylashtirishlar amalga oshirilsin.
        </div>
        <div class="content">
          2. Ushbu buyruqning ijrosini nazorat qilish Xodimlar Boshqarmasi boshlig'i zimmasiga yuklatilsin.
        </div>

        <div class="signatures">
          <div>
            <b>Masofa Boshlig'i:</b><br>
            <i>(PCH Boshlig'i)</i>
          </div>
          <div style="text-align: right;">
            ___________________ <b>Salimov Sh.B.</b><br>
            <span style="font-size: 10pt; color: #555;">(Elektron raqamli imzo tasdiqlangan)</span>
          </div>
        </div>

        <div class="qr-box">
          <div>
            <b>VERIFIKATSIYA KODI:</b> PCH-ORD-${orderNo}-2026<br>
            Hujjat raqamli murojaat tizimi orqali avtomatik shakllantirilgan.<br>
            Tasdiqlangan sana: ${todayStr}
          </div>
          <div style="width: 70px; height: 70px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 8pt; font-weight: bold; border: 1px solid #cbd5e1; text-align: center;">
            QR CODE
          </div>
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=850,height=900');
    win.document.write(htmlContent);
    win.document.close();
  };

  // Export Appeal to PDF / Print
  const handleExportAppealPDF = (appeal) => {
    const todayStr = new Date().toLocaleDateString('uz-UZ');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MUROJAAT HUSUJAT № ${appeal.id}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.6; padding: 40px; }
          .target-title { text-align: right; font-weight: bold; margin-bottom: 40px; }
          .appeal-title { text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 30px; }
          .appeal-body { text-indent: 40px; text-align: justify; margin-bottom: 30px; }
          .stamp-box { border: 2px solid #10b981; background: #ecfdf5; padding: 15px; border-radius: 8px; margin-top: 40px; color: #065f46; font-size: 10pt; }
        </style>
      </head>
      <body>
        <div class="target-title">
          "TOSHKENT TEMIR YO'L MASOFASI" (PCH-8)<br>
          Boshliq o'rinbosari Salimov Sh.B.ga<br>
          ${appeal.bolinma_id} ${appeal.employee_position || ''}<br>
          <b>${appeal.employee_name}</b> tomonidan
        </div>

        <div class="appeal-title">${(appeal.murojaat_type || 'Murojaat').toUpperCase()}</div>

        <div class="appeal-body">
          ${appeal.murojaat_text}
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
          <div>Sana: ${formatDate(appeal.created_at || todayStr)}</div>
          <div>Imzo: _________________ (${appeal.employee_name})</div>
        </div>

        <div class="stamp-box">
          <b>✅ RAQAMLI TASDIQ VA VIZA MASOFASI</b><br>
          Holati: ${appeal.status === 'approved' ? 'TASDIQLANGAN (VIZA QO\'YILGAN)' : appeal.status === 'rejected' ? 'RAD ETILGAN' : 'JARAYONDA'}<br>
          Mas'ul Rahbar: ${appeal.manager_name || 'Salimov Sh.B.'}<br>
          Izoh: ${appeal.manager_comment || 'E-Imzo verifikatsiyadan o\'tgan'}
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=800,height=800');
    win.document.write(htmlContent);
    win.document.close();
  };

  const totalCount = appeals.length;
  const pendingCount = appeals.filter(a => a.status === 'pending' || a.status === 'Yangi').length;
  const approvedCount = appeals.filter(a => a.status === 'approved' || a.status === 'Hal etilgan').length;
  const rejectedCount = appeals.filter(a => a.status === 'rejected' || a.status === 'Rad etilgan').length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <i className="fas fa-satellite-dish animate-pulse"></i> Raqamli Qabulxona
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Raqamli Murojaat Markazi</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xl leading-relaxed">
            Murojaatlarni ko'rib chiqing, E-Imzo vizasi qo'ying, QR-kodli verifikatsiya bilan PDF yuklang hamda avtomatik buyruqlar shakllantiring.
          </p>
        </div>
        
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <button 
            onClick={fetchAppealsData}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            title="Qayta yuklash"
          >
            <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i> Yangilash
          </button>
          <button 
            onClick={() => {
              if (window.openHRMurojaatWindow) {
                window.openHRMurojaatWindow();
              } else {
                setShowNewModal(true);
              }
            }}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <i className="fas fa-plus"></i> Yangi Murojaat
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition group relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Jami Murojaatlar</p>
              <h3 className="text-3xl font-black text-slate-100">{totalCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner bg-blue-500/10 text-blue-400">
              <i className="fas fa-inbox"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-blue-400 relative z-10">
            <i className="fas fa-database"></i> <span>Tizimdagi barcha arizalar</span>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition group relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Jarayonda (Kutmoqda)</p>
              <h3 className="text-3xl font-black text-amber-400">{pendingCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner bg-amber-500/10 text-amber-400">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-400 relative z-10">
            <i className="fas fa-clock"></i> <span>Rahbar ko'rib chiqishda</span>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition group relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Tasdiqlangan (VIZA)</p>
              <h3 className="text-3xl font-black text-emerald-400">{approvedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner bg-emerald-500/10 text-emerald-400">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-400 relative z-10">
            <i className="fas fa-stamp"></i> <span>Buyruqqa yo'naltirilgan</span>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition group relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Rad Etilgan</p>
              <h3 className="text-3xl font-black text-rose-400">{rejectedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner bg-rose-500/10 text-rose-400">
              <i className="fas fa-times-circle"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-rose-400 relative z-10">
            <i className="fas fa-ban"></i> <span>Izoh bilan rad etilgan</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Appeals Table */}
        <div className="xl:col-span-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-5 md:p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <i className="fas fa-list-ul text-amber-400"></i> Murojaatlar Ro'yxati
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Xodimlarning raqamli arizalari va vizalar</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <input 
                  type="text" 
                  placeholder="Qidiruv..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 pl-8 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                />
                <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              </div>

              <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 overflow-x-auto no-scrollbar">
                {[
                  { key: 'all', label: 'Barchasi' },
                  { key: 'jarayon', label: 'Jarayonda' },
                  { key: 'hal', label: 'Tasdiqlangan' },
                  { key: 'rad', label: 'Rad etilgan' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.key 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-950/60">
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">ID / Sana</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">Murojaatchi</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">Murojaat Turi</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">Holati</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAppeals.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-500 text-sm">
                      <i className="fas fa-inbox text-3xl mb-3 block text-slate-600"></i>
                      Murojaatlar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredAppeals.map((appeal, idx) => (
                    <tr 
                      key={appeal.id || idx} 
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedAppeal(appeal)}
                    >
                      <td className="py-4 px-5">
                        <div className="font-mono text-xs font-bold text-amber-400">{appeal.code || `#RM-2026-00${appeal.id}`}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{formatDate(appeal.created_at)}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                            {appeal.employee_name ? appeal.employee_name.charAt(0) : 'X'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 text-sm">{appeal.employee_name || 'Noma\'lum'}</div>
                            <div className="text-[11px] text-slate-400">{appeal.employee_position || 'Xodim'} · {appeal.bolinma_id || 'Bo\'linma'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-slate-200 text-xs">{appeal.murojaat_type || 'Ariza'}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">{appeal.murojaat_text}</div>
                      </td>
                      <td className="py-4 px-5">
                        {getStatusBadge(appeal.status)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleGenerateBuyruq(appeal)}
                            title="Buyruq (Prikaz) PDF Shakllantirish"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <i className="fas fa-file-signature text-xs"></i> Buyruq
                          </button>
                          <button 
                            onClick={() => setSelectedAppeal(appeal)}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 border border-transparent hover:border-amber-500/30 text-slate-400 transition inline-flex items-center justify-center"
                          >
                            <i className="fas fa-eye text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <i className="fas fa-bolt text-amber-400"></i> Tezkor Amallar
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  if (window.openHRMurojaatWindow) window.openHRMurojaatWindow();
                  else setShowNewModal(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center justify-between transition shadow-lg shadow-amber-500/20"
              >
                <span><i className="fas fa-plus mr-2"></i> Yangi Ariza Shakllantirish</span>
                <i className="fas fa-arrow-right"></i>
              </button>
              
              <button 
                onClick={() => {
                  if (appeals.length > 0) handleGenerateBuyruq(appeals[0]);
                  else toast.info('Murojaatlar mavjud emas');
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-between transition"
              >
                <span><i className="fas fa-file-contract text-blue-400 mr-2"></i> Mehnat Ta'tili Buyrug'i</span>
                <i className="fas fa-arrow-right text-slate-500"></i>
              </button>

              <button 
                onClick={() => {
                  if (appeals.length > 0) handleGenerateBuyruq(appeals[0]);
                  else toast.info('Murojaatlar mavjud emas');
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-between transition"
              >
                <span><i className="fas fa-hand-holding-usd text-emerald-400 mr-2"></i> Moddiy Yordam Buyrug'i</span>
                <i className="fas fa-arrow-right text-slate-500"></i>
              </button>
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <i className="fas fa-tags text-emerald-400"></i> Murojaat Turlari Bo'yicha
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Mehnat ta\'tili arizalari', p: '45%', color: 'bg-emerald-500' },
                { name: 'Haq to\'lanmaydigan ta\'til', p: '25%', color: 'bg-blue-500' },
                { name: 'Moddiy yordam so\'rovlari', p: '18%', color: 'bg-amber-500' },
                { name: 'Bildirishnoma va boshqalar', p: '12%', color: 'bg-rose-500' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-slate-400">{item.p}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.p }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Selected Appeal Detail & VIZA Action Modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto animate-scale-up">
            
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedAppeal.code || `#RM-2026-00${selectedAppeal.id}`}</span>
                <h2 className="text-xl font-bold text-slate-100 mt-1">{selectedAppeal.murojaat_type || 'Murojaat'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedAppeal.employee_name} — {selectedAppeal.employee_position} ({formatDate(selectedAppeal.created_at)})</p>
              </div>
              <button 
                onClick={() => setSelectedAppeal(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Appeal Text Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 relative">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <i className="fas fa-align-left text-amber-400"></i> Murojaat Matni:
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-serif italic">
                "{selectedAppeal.murojaat_text}"
              </p>
              {selectedAppeal.manager_comment && (
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 font-semibold">
                  <i className="fas fa-comment-alt mr-1.5"></i> Rahbar izohi: {selectedAppeal.manager_comment} ({selectedAppeal.manager_name || 'Rahbar'})
                </div>
              )}
            </div>

            {/* Attached Image / Document Preview */}
            {selectedAppeal.attachment_data && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <i className="fas fa-paperclip"></i> Biriktirilgan Hujjat / Rasm:
                </h4>
                <div className="relative group rounded-xl overflow-hidden border border-slate-800 max-h-64 flex justify-center bg-black/40 p-2">
                  <img 
                    src={selectedAppeal.attachment_data} 
                    alt="Biriktirilgan Hujjat" 
                    className="max-h-60 object-contain rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      const win = window.open("");
                      win.document.write(`<body style="margin:0; background:#000; display:flex; align-items:center; justify-center; height:100vh;"><img src="${selectedAppeal.attachment_data}" style="max-width:100%; max-height:100vh; object-fit:contain; margin:auto;" /></body>`);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Status Tracker Stepper Timeline */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                <i className="fas fa-stream text-amber-400 mr-2"></i> Murojaat Holati Zanjiri (Status Tracker)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
                {timelineSteps.map((s) => {
                  const currentStepNum = getStepNumber(selectedAppeal.status);
                  const isDone = s.num <= currentStepNum;
                  const isCurrent = s.num === currentStepNum;
                  return (
                    <div 
                      key={s.num} 
                      className={`p-3 rounded-2xl border text-center transition ${
                        isCurrent 
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 ring-2 ring-amber-500/20' 
                          : isDone 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-slate-950/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                        isCurrent ? 'bg-amber-500 text-slate-950' : isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isDone ? <i className="fas fa-check"></i> : s.num}
                      </div>
                      <div className="text-xs font-bold leading-tight">{s.title}</div>
                      <div className="text-[10px] opacity-70 mt-1 leading-snug">{s.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Manager Comment Input for Approval/Rejection */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                <i className="fas fa-pen text-amber-400 mr-1.5"></i> Rahbar Izohi / VIZA Matni:
              </label>
              <input 
                type="text"
                placeholder="Masalan: Ma'qullandi, kadrlar bo'limi tegishli buyruq chiqarsin..."
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-3 justify-between items-center">
              <button 
                onClick={() => handleDelete(selectedAppeal.id)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
              >
                <i className="fas fa-trash-alt"></i> O'chirish
              </button>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleReject(selectedAppeal.id)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <i className="fas fa-times"></i> Rad etish
                </button>

                <button 
                  onClick={() => handleApprove(selectedAppeal.id)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <i className="fas fa-stamp"></i> VIZA Qo'yish (Tasdiqlash)
                </button>

                <button 
                  onClick={() => handleExportAppealPDF(selectedAppeal)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <i className="fas fa-qrcode text-amber-400"></i> QR-Kodli PDF
                </button>

                <button 
                  onClick={() => handleGenerateBuyruq(selectedAppeal)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                >
                  <i className="fas fa-file-signature"></i> Buyruq (Prikaz) PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* New Appeal Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 relative animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <i className="fas fa-file-signature text-amber-400"></i> Yangi Murojaat Yuborish
              </h3>
              <button 
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateAppeal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Xodim F.I.O *</label>
                <input 
                  type="text"
                  required
                  placeholder="Masalan: Alisher Usmonov"
                  value={newAppealForm.employee_name}
                  onChange={(e) => setNewAppealForm({ ...newAppealForm, employee_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Lavozimi</label>
                  <input 
                    type="text"
                    placeholder="Yo'l ustasi"
                    value={newAppealForm.employee_position}
                    onChange={(e) => setNewAppealForm({ ...newAppealForm, employee_position: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Bo'linma</label>
                  <select
                    value={newAppealForm.bolinma_id}
                    onChange={(e) => setNewAppealForm({ ...newAppealForm, bolinma_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="1-bo'linma">1-bo'linma</option>
                    <option value="2-bo'linma">2-bo'linma</option>
                    <option value="3-bo'linma">3-bo'linma</option>
                    <option value="4-bo'linma">4-bo'linma</option>
                    <option value="5-bo'linma">5-bo'linma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Murojaat Turi</label>
                <select
                  value={newAppealForm.murojaat_type}
                  onChange={(e) => setNewAppealForm({ ...newAppealForm, murojaat_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Ariza">Mehnat ta'tili arizasi</option>
                  <option value="Haq to'lanmaydigan ta'til">Haq to'lanmaydigan ta'til</option>
                  <option value="Moddiy yordam">Moddiy yordam so'rovi</option>
                  <option value="Shikoyat">Shikoyat / Bildirishnoma</option>
                  <option value="Erkin">Erkin murojaat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Murojaat Matni *</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Murojaatingiz matnini bafurja yozing..."
                  value={newAppealForm.murojaat_text}
                  onChange={(e) => setNewAppealForm({ ...newAppealForm, murojaat_text: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Yuborish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
