import React, { useState, useEffect } from 'react';
import { useConfirm } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import TimesheetTab from '../components/hr/TimesheetTab';

const TABS = [
  { id: 'employees', label: 'Xodimlar ro\'yxati', icon: 'fas fa-users' },
  { id: 'tabel',     label: 'Tabel',              icon: 'fas fa-table' },
  { id: 'murojaat',  label: 'Murojaat',            icon: 'fas fa-envelope-open-text' },
  { id: 'davomat',   label: 'Davomat',             icon: 'fas fa-clipboard-check' },
];
export default function HrPortal() {
  const confirm = useConfirm();
  const { token, user } = useAuth();

  // Check if the user is a subdivision user
  const role = user?.role?.toLowerCase();
  const username = user?.username?.toLowerCase();
  
  // Robust check
  let isSubdivisionUser = false;
  let userBolinma = 'all';
  
  if (user && role !== 'admin') {
    let rawBolinma = null;
    
    // 1. Username pattern
    if (username?.includes('bolinma') || username?.includes("bo'linma") || username?.includes('sex') || username?.includes("bo'lim") || username?.includes('bolim')) {
      const numMatch = username.match(/\d+/);
      if (numMatch) {
        rawBolinma = username.includes('sex') ? `${numMatch[0]}-sex` : `${numMatch[0]}-bo'linma`;
        isSubdivisionUser = true;
      }
    }
    // 2. Explicit bolinmalar
    if (!isSubdivisionUser && user.bolinmalar && user.bolinmalar.length > 0) {
      rawBolinma = user.bolinmalar[0];
      isSubdivisionUser = true;
    }
    // 3. bolinma_id
    if (!isSubdivisionUser && user.bolinma_id && user.bolinma_id !== 'all') {
      rawBolinma = user.bolinma_id;
      isSubdivisionUser = true;
    }
    // 4. departments containing a bo'linma/bo'lim
    if (!isSubdivisionUser && user.departments && user.departments.length > 0) {
      const d0 = user.departments[0];
      const d0Low = String(d0).toLowerCase();
      if (d0Low.includes('bo\'linma') || d0Low.includes('bolinma') || d0Low.includes('bo\'lim') || d0Low.includes('bolim') || d0Low.includes('sex')) {
        const numMatch = String(d0).match(/\d+/);
        if (numMatch) {
          rawBolinma = d0Low.includes('sex') ? `${numMatch[0]}-sex` : `${numMatch[0]}-bo'linma`;
        } else {
          rawBolinma = d0;
        }
        isSubdivisionUser = true;
      }
    }
    // 5. inherently subdivision roles
    if (!isSubdivisionUser && (role === 'bolinma' || role === 'subdivision')) {
      isSubdivisionUser = true;
      const numMatch = username?.match(/\d+/);
      rawBolinma = numMatch ? `${numMatch[0]}-bo'linma` : '1-bo\'linma';
    }
    
    if (isSubdivisionUser && rawBolinma) {
      const numMatch = String(rawBolinma).match(/\d+/);
      if (numMatch) {
        const num = numMatch[0];
        userBolinma = String(rawBolinma).toLowerCase().includes('sex') ? `${num}-sex` : `${num}-bo'linma`;
      } else {
        userBolinma = String(rawBolinma);
      }
    }
  }

  const [activeTab, setActiveTab] = useState('employees');
  const [formTab, setFormTab] = useState('personal');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, on_vacation: 0, inactive: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [bolinmaFilter, setBolinmaFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Viewing Employee Details Modal
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [viewingTab, setViewingTab] = useState('obektivka');

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    bolinma_id: '1-bo\'linma',
    department_id: 'Temir yo\'l',
    position: '',
    rank: '',
    birth_date: '',
    phone: '',
    hired_date: '',
    medical_checkup_date: '',
    last_training_date: '',
    status: 'active',
    education: '',
    specialty: '',
    biography: '',
    current_position_date: '',
    birth_place: '',
    nationality: '',
    party_membership: '',
    education_level: '',
    graduated_institutions: '',
    academic_degree: '',
    academic_title: '',
    languages: '',
    state_awards: '',
    deputy_status: '',
    career: [],
    relatives: []
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  // Sync bolinma filter and form values when user details are loaded/resolved
  useEffect(() => {
    if (isSubdivisionUser && userBolinma !== 'all') {
      setBolinmaFilter(userBolinma);
      setFormData(prev => ({ ...prev, bolinma_id: userBolinma }));
    }
  }, [isSubdivisionUser, userBolinma]);
  const bolinmalar = Array.from({ length: 10 }, (_, i) => `${i + 1}-bo'linma`);

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [bolinmaFilter, searchQuery, isSubdivisionUser, userBolinma]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const activeFilter = isSubdivisionUser ? userBolinma : bolinmaFilter;
      let url = '/api/hr/employees?';
      if (activeFilter !== 'all') url += `bolinma_id=${encodeURIComponent(activeFilter)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const activeFilter = isSubdivisionUser ? userBolinma : bolinmaFilter;
      let url = '/api/hr/stats?';
      if (activeFilter !== 'all') url += `bolinma_id=${encodeURIComponent(activeFilter)}&`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showSuccess = (text) => {
    setMessage({ type: 'success', text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const showError = (text) => {
    setMessage({ type: 'error', text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingEmployee;
    const url = isEdit ? `/api/hr/employees/${editingEmployee.id}` : '/api/hr';
    const method = isEdit ? 'PUT' : 'POST';

    const serializedObektivka = JSON.stringify({
      education: formData.education || '',
      specialty: formData.specialty || '',
      biography: formData.biography || '',
      current_position_date: formData.current_position_date || '',
      birth_place: formData.birth_place || '',
      nationality: formData.nationality || '',
      party_membership: formData.party_membership || '',
      education_level: formData.education_level || '',
      graduated_institutions: formData.graduated_institutions || '',
      academic_degree: formData.academic_degree || '',
      academic_title: formData.academic_title || '',
      languages: formData.languages || '',
      state_awards: formData.state_awards || '',
      deputy_status: formData.deputy_status || '',
      career: formData.career || []
    });
    const serializedRelatives = JSON.stringify(formData.relatives || []);

    const payload = {
      full_name: formData.full_name,
      bolinma_id: formData.bolinma_id,
      department_id: formData.department_id,
      position: formData.position,
      rank: formData.rank,
      birth_date: formData.birth_date,
      phone: formData.phone,
      hired_date: formData.hired_date,
      medical_checkup_date: formData.medical_checkup_date,
      last_training_date: formData.last_training_date,
      status: formData.status,
      obektivka: serializedObektivka,
      relatives: serializedRelatives
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showSuccess(isEdit ? 'Xodim ma\'lumotlari muvaffaqiyatli yangilandi' : 'Yangi xodim muvaffaqiyatli qo\'shildi');
        setShowAddModal(false);
        setEditingEmployee(null);
        resetForm();
        fetchEmployees();
        fetchStats();
      } else {
        const err = await response.json();
        showError(err.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      showError('Tarmoq xatosi yuz berdi');
    }
  };

  const handleEdit = (emp) => {
    let obData = {};
    let relList = [];
    try {
      obData = emp.obektivka ? (typeof emp.obektivka === 'string' ? JSON.parse(emp.obektivka) : emp.obektivka) : {};
    } catch (e) {
      console.error('Error parsing obektivka:', e);
    }
    try {
      relList = emp.relatives ? (typeof emp.relatives === 'string' ? JSON.parse(emp.relatives) : emp.relatives) : [];
    } catch (e) {
      console.error('Error parsing relatives:', e);
    }

    setFormTab('personal');
    setEditingEmployee(emp);
    setFormData({
      full_name: emp.full_name || '',
      bolinma_id: emp.bolinma_id || (isSubdivisionUser ? userBolinma : '1-bo\'linma'),
      department_id: emp.department_id || 'Temir yo\'l',
      position: emp.position || '',
      rank: emp.rank || '',
      birth_date: emp.birth_date || '',
      phone: emp.phone || '',
      hired_date: emp.hired_date || '',
      medical_checkup_date: emp.medical_checkup_date || '',
      last_training_date: emp.last_training_date || '',
      status: emp.status || 'active',
      education: obData.education || '',
      specialty: obData.specialty || '',
      biography: obData.biography || '',
      current_position_date: obData.current_position_date || '',
      birth_place: obData.birth_place || '',
      nationality: obData.nationality || '',
      party_membership: obData.party_membership || '',
      education_level: obData.education_level || '',
      graduated_institutions: obData.graduated_institutions || '',
      academic_degree: obData.academic_degree || '',
      academic_title: obData.academic_title || '',
      languages: obData.languages || '',
      state_awards: obData.state_awards || '',
      deputy_status: obData.deputy_status || '',
      career: obData.career || [],
      relatives: relList || []
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Xodim tizimdan o'chirilsinmi?", description: "Bu amalni ortga qaytarib bo'lmaydi.", confirmText: "O'chirish", danger: true }))) return;

    try {
      const response = await fetch(`/api/hr/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.ok) {
        showSuccess('Xodim muvaffaqiyatli o\'chirildi');
        fetchEmployees();
        fetchStats();
      } else {
        const err = await response.json();
        showError(err.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      showError('Tarmoq xatosi yuz berdi');
    }
  };

  const handleCareerChange = (index, field, value) => {
    const updatedCareer = [...formData.career];
    updatedCareer[index] = { ...updatedCareer[index], [field]: value };
    setFormData(prev => ({ ...prev, career: updatedCareer }));
  };

  const removeCareerRow = (index) => {
    const updatedCareer = formData.career.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, career: updatedCareer }));
  };

  const addCareerRow = () => {
    setFormData(prev => ({
      ...prev,
      career: [...prev.career, { years: '', position: '', organization: '' }]
    }));
  };

  const handleRelativeChange = (index, field, value) => {
    const updatedRelatives = [...formData.relatives];
    updatedRelatives[index] = { ...updatedRelatives[index], [field]: value };
    setFormData(prev => ({ ...prev, relatives: updatedRelatives }));
  };

  const removeRelativeRow = (index) => {
    const updatedRelatives = formData.relatives.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, relatives: updatedRelatives }));
  };

  const addRelativeRow = () => {
    setFormData(prev => ({
      ...prev,
      relatives: [...prev.relatives, { relation: '', full_name: '', birth_year_place: '', workplace_position: '', residence: '' }]
    }));
  };

  const handlePrint = (employee) => {
    let ob = {};
    let relatives = [];
    try {
      ob = employee.obektivka ? (typeof employee.obektivka === 'string' ? JSON.parse(employee.obektivka) : employee.obektivka) : {};
    } catch (e) {
      console.error(e);
    }
    try {
      relatives = employee.relatives ? (typeof employee.relatives === 'string' ? JSON.parse(employee.relatives) : employee.relatives) : [];
    } catch (e) {
      console.error(e);
    }
    const career = ob.career || [];

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ma'lumotnoma - \${employee.full_name || employee.name}</title>
          <style>
            @page { size: A4; margin: 2cm; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #000; background: #fff; padding: 0; margin: 0; }
            .header-title { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 25px; }
            .employee-name { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 30px; }
            .photo-frame { width: 3cm; height: 4cm; border: 1px solid #000; text-align: center; font-size: 9pt; display: flex; align-items: center; justify-content: center; float: right; margin-left: 20px; margin-bottom: 20px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .meta-table td { padding: 4px 0; vertical-align: top; }
            .meta-table td.label { font-weight: bold; width: 50%; }
            .section-title { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-top: 30px; margin-bottom: 15px; border-bottom: 1.5px solid #000; padding-bottom: 4px; }
            .timeline-item { margin-bottom: 10px; font-size: 12pt; text-align: justify; }
            .relatives-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11pt; }
            .relatives-table th, .relatives-table td { border: 1px solid #000; padding: 8px 10px; vertical-align: top; }
            .relatives-table th { background: #f2f2f2; font-weight: bold; text-align: center; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div>
            <div class="photo-frame">
              \${employee.face_template ? 
                \`<img src="\${employee.face_template}" style="width: 100%; height: 100%; object-fit: cover;">\` : 
                \`3x4 sm<br>rasm\`
              }
            </div>
            
            <div class="header-title">MA'LUMOTNOMA</div>
            <div class="employee-name">
              \${employee.full_name || employee.name}
            </div>
            
            <div style="margin-bottom: 25px; text-align: justify;">
              <strong>\${ob.current_position_date || '—'} dan:</strong><br>
              \${employee.position || '—'}
            </div>
            
            <table class="meta-table">
              <tr>
                <td class="label">Tug'ilgan yili:</td>
                <td class="label">Tug'ilgan joyi:</td>
              </tr>
              <tr>
                <td>\${employee.birth_date || '—'}</td>
                <td>\${ob.birth_place || '—'}</td>
              </tr>
              <tr style="height: 12px;"><td></td><td></td></tr>
              <tr>
                <td class="label">Millati:</td>
                <td class="label">Partiyaviyligi:</td>
              </tr>
              <tr>
                <td>\${ob.nationality || '—'}</td>
                <td>\${ob.party_membership || '—'}</td>
              </tr>
              <tr style="height: 12px;"><td></td><td></td></tr>
              <tr>
                <td class="label">Ma'lumoti:</td>
                <td class="label">Tamomlagan:</td>
              </tr>
              <tr>
                <td>\${ob.education || '—'}</td>
                <td style="white-space: pre-line;">\${ob.graduated_institutions || '—'}</td>
              </tr>
            </table>
            
            <table class="meta-table" style="margin-top: 20px;">
              <tr>
                <td style="width: 45%; font-weight: bold; padding: 4px 0;">Ma'lumoti bo'yicha mutaxassisligi:</td>
                <td style="padding: 4px 0;">\${ob.specialty || '—'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 4px 0;">Ilmiy darajasi:</td>
                <td style="padding: 4px 0;">\${ob.academic_degree || '—'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 4px 0;">Ilmiy unvoni:</td>
                <td style="padding: 4px 0;">\${ob.academic_title || '—'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 4px 0;">Qaysi chet tillarini biladi:</td>
                <td style="padding: 4px 0;">\${ob.languages || '—'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 4px 0;">Davlat mukofotlari bilan taqdirlanganmi (qanaqa):</td>
                <td style="padding: 4px 0;">\${ob.state_awards || '—'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 4px 0; vertical-align: top;">Saylanadigan organlarning a'zoligi:</td>
                <td style="padding: 4px 0;">\${ob.deputy_status || '—'}</td>
              </tr>
            </table>
            
            <div class="section-title">MEHNAT FAOLIYATI</div>
            <div style="margin-top: 15px;">
              \${career.length === 0 ? 
                \`<p style="font-style: italic;">Mavjud emas</p>\` :
                career.map(c => \`
                  <div class="timeline-item">
                    <strong>\${c.years || '—'} yy.</strong> - \${c.position || '—'} (\${c.organization || '—'})
                  </div>
                \`).join('')
              }
            </div>
          </div>
          
          <div class="page-break">
            <div class="header-title" style="font-size: 12pt; text-transform: none; font-weight: bold;">
              \${employee.full_name || employee.name}ning yaqin qarindoshlari haqida<br>
              MA'LUMOT
            </div>
            
            <table class="relatives-table">
              <thead>
                <tr>
                  <th style="width: 15%;">Qarindoshligi</th>
                  <th style="width: 25%;">Familiyasi, ismi va otasining ismi</th>
                  <th style="width: 20%;">Tug'ilgan yili va joyi</th>
                  <th style="width: 20%;">Ish joyi va lavozimi</th>
                  <th style="width: 20%;">Turar joyi</th>
                </tr>
              </thead>
              <tbody>
                \${relatives.length === 0 ? 
                  \`<tr><td colspan="5" style="text-align: center; font-style: italic;">Kiritilmagan</td></tr>\` :
                  relatives.map(r => \`
                    <tr>
                      <td><strong>\${r.relation || '—'}</strong></td>
                      <td>\${r.full_name || '—'}</td>
                      <td>\${r.birth_year_place || '—'}</td>
                      <td>\${r.workplace_position || '—'}</td>
                      <td>\${r.residence || '—'}</td>
                    </tr>
                  \`).join('')
                }
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Trigger print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Auto close after window print dialog is dismissed
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
  };

  const resetForm = () => {
    setFormTab('personal');
    setFormData({
      full_name: '',
      bolinma_id: isSubdivisionUser ? userBolinma : '1-bo\'linma',
      department_id: 'Temir yo\'l',
      position: '',
      rank: '',
      birth_date: '',
      phone: '',
      hired_date: '',
      medical_checkup_date: '',
      last_training_date: '',
      status: 'active',
      education: '',
      specialty: '',
      biography: '',
      current_position_date: '',
      birth_place: '',
      nationality: '',
      party_membership: '',
      education_level: '',
      graduated_institutions: '',
      academic_degree: '',
      academic_title: '',
      languages: '',
      state_awards: '',
      deputy_status: '',
      career: [],
      relatives: []
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <i className="fas fa-users-cog text-amber-500"></i>
            Xodimlar va Kadrlar Boshqaruvi
          </h1>
          <p className="text-xs text-slate-400 mt-1">Xodimlar ro'yxati, tabel, murojaat va davomat boshqaruvi</p>
        </div>
        {activeTab === 'employees' && (
          <button
            onClick={() => { resetForm(); setEditingEmployee(null); setShowAddModal(true); }}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2 text-sm shrink-0 transition"
          >
            <i className="fas fa-user-plus"></i>
            Xodim qo'shish
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500/15 to-amber-600/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <i className={`${tab.icon} text-sm ${activeTab === tab.id ? 'text-amber-500' : 'text-slate-500'}`}></i>
            {tab.label}
            {activeTab === tab.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      {/* ============ TAB: XODIMLAR RO'YXATI ============ */}
      {activeTab === 'employees' && (
        <>
          {/* Notifications */}
          {message.text && (
            <div className={`p-4 rounded-xl text-sm leading-relaxed border ${
              message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Jami xodimlar</span>
              <div className="text-2xl font-black text-slate-100">{stats.total || 0} ta</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Faol xodimlar</span>
              <div className="text-2xl font-black text-emerald-400">{stats.active || 0} ta</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Ta'tildagilar</span>
              <div className="text-2xl font-black text-amber-400">{stats.on_vacation || 0} ta</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Noaktivlar</span>
              <div className="text-2xl font-black text-red-400">{stats.inactive || 0} ta</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
                placeholder="F.I.Sh. bo'yicha qidirish..."
              />
            </div>
            
            {!isSubdivisionUser && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setBolinmaFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    bolinmaFilter === 'all' 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Barchasi
                </button>
                {bolinmalar.map(b => (
                  <button
                    key={b}
                    onClick={() => setBolinmaFilter(b)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      bolinmaFilter === b 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {b.split('-')[0]}-PCh
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Employees Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider bg-slate-950/40">
                    <th className="py-4 px-6">Familiyasi, ismi, otasining ismi</th>
                    <th className="py-4 px-4">Bo'lim / Bo'linma</th>
                    <th className="py-4 px-4">Lavozimi / Razryad</th>
                    <th className="py-4 px-4">Telefon</th>
                    <th className="py-4 px-4">Tibbiy Ko'rik</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                          Yuklanmoqda...
                        </div>
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-500">
                        Xodimlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-800/20 transition">
                        <td 
                          className="py-4 px-6 font-bold text-slate-200 cursor-pointer hover:text-amber-400 hover:underline transition"
                          onClick={() => { setViewingEmployee(emp); setViewingTab('obektivka'); }}
                        >
                          {emp.full_name || emp.name}
                        </td>
                        <td className="py-4 px-4">
                          <div>{emp.department_id || 'Temir yo\'l'}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">{emp.bolinma_id}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div>{emp.position || 'Ishchi'}</div>
                          <div className="text-[10px] text-amber-500/80 font-bold">{emp.rank ? `${emp.rank}-razryad` : '—'}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs">{emp.phone || '—'}</td>
                        <td className="py-4 px-4 text-xs font-mono">{emp.medical_checkup_date || '—'}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            emp.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : emp.status === 'vacation' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}>
                            {emp.status === 'active' ? 'Faol' : emp.status === 'vacation' ? 'Ta\'tilda' : 'Noaktiv'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => { setViewingEmployee(emp); setViewingTab('obektivka'); }}
                            className="p-2 text-slate-400 hover:text-sky-400 bg-slate-950 border border-slate-800 hover:border-sky-500/30 rounded-xl transition text-xs"
                            title="Batafsil ma'lumot (Obyektivka)"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => handleEdit(emp)}
                            className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 border border-slate-800 hover:border-amber-500/30 rounded-xl transition text-xs"
                            title="Tahrirlash"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 border border-slate-800 hover:border-red-500/30 rounded-xl transition text-xs"
                            title="O'chirish"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============ TAB: TABEL ============ */}
      {activeTab === 'tabel' && (
        <TimesheetTab
          bolinmaFilter={bolinmaFilter}
          isSubdivisionUser={isSubdivisionUser}
          userBolinma={userBolinma}
        />
      )}

      {/* ============ TAB: MUROJAAT (placeholder) ============ */}
      {activeTab === 'murojaat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <i className="fas fa-envelope-open-text text-4xl text-slate-700 mb-4 block"></i>
          <h3 className="text-lg font-bold text-slate-400 mb-2">Murojaat bo'limi</h3>
          <p className="text-sm text-slate-500">Tez orada ishga tushiriladi...</p>
        </div>
      )}

      {/* ============ TAB: DAVOMAT (placeholder) ============ */}
      {activeTab === 'davomat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <i className="fas fa-clipboard-check text-4xl text-slate-700 mb-4 block"></i>
          <h3 className="text-lg font-bold text-slate-400 mb-2">Davomat bo'limi</h3>
          <p className="text-sm text-slate-500">Tez orada ishga tushiriladi...</p>
        </div>
      )}

      {/* Add / Edit Sliding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <h3 className="font-extrabold text-slate-200 flex items-center gap-2">
                <i className="fas fa-user-edit text-amber-500"></i>
                {editingEmployee ? 'Xodim ma\'lumotlarini tahrirlash' : 'Yangi xodim qo\'shish'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Form Tab Navigation */}
            <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-2 flex gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFormTab('personal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  formTab === 'personal'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Shaxsiy va Xizmat
              </button>
              <button
                type="button"
                onClick={() => setFormTab('resume')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  formTab === 'resume'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tarjimai hol
              </button>
              <button
                type="button"
                onClick={() => setFormTab('timeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  formTab === 'timeline'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mehnat faoliyati
              </button>
              <button
                type="button"
                onClick={() => setFormTab('relatives')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  formTab === 'relatives'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Qarindoshlar
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {formTab === 'personal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">F.I.Sh. (To'liq)</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                      placeholder="Masalan: Karimov Alisher"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Telefon</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                      placeholder="+998 90 123 45 67"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">PCh Bo'linmasi</label>
                    {isSubdivisionUser ? (
                      <input
                        type="text"
                        value={formData.bolinma_id}
                        disabled
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-500 cursor-not-allowed focus:outline-none"
                      />
                    ) : (
                      <select
                        name="bolinma_id"
                        value={formData.bolinma_id}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                      >
                        {bolinmalar.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bo'lim / Sohasi</label>
                    <input
                      type="text"
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                      placeholder="Masalan: Temir yo'l"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lavozimi</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                      placeholder="Masalan: Yo'l ustasi, Monter..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Razryad</label>
                    <input
                      type="number"
                      name="rank"
                      value={formData.rank}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                      placeholder="Masalan: 5"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tug'ilgan sanasi</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ishga kirgan sanasi</label>
                    <input
                      type="date"
                      name="hired_date"
                      value={formData.hired_date}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tibbiy ko'rik sanasi</label>
                    <input
                      type="date"
                      name="medical_checkup_date"
                      value={formData.medical_checkup_date}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Oxirgi o'quv sanasi</label>
                    <input
                      type="date"
                      name="last_training_date"
                      value={formData.last_training_date}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Holati (Status)</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                    >
                      <option value="active">Faol</option>
                      <option value="vacation">Ta'tilda</option>
                      <option value="inactive">Noaktiv</option>
                    </select>
                  </div>
                </div>
              )}

              {formTab === 'resume' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lavozimda boshlagan sanasi</label>
                      <input
                        type="text"
                        name="current_position_date"
                        value={formData.current_position_date}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                        placeholder="Masalan: 2010 yil 06 sentyabrdan:"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tug'ilgan joyi</label>
                      <input
                        type="text"
                        name="birth_place"
                        value={formData.birth_place}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                        placeholder="Masalan: Qashqadaryo viloyati, Nishon tumani"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Millati</label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                        placeholder="Masalan: o'zbek"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Partiyaviyligi</label>
                      <input
                        type="text"
                        name="party_membership"
                        value={formData.party_membership}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                        placeholder="Masalan: O'zbekiston Xalq demokratik partiyasi a'zosi"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ma'lumoti</label>
                      <select
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none transition"
                      >
                        <option value="">Tanlang...</option>
                        <option value="Oliy">Oliy</option>
                        <option value="O'rta maxsus">O'rta maxsus</option>
                        <option value="O'rta">O'rta</option>
                        <option value="Tugallanmagan oliy">Tugallanmagan oliy</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ma'lumoti bo'yicha mutaxassisligi</label>
                      <input
                        type="text"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                        placeholder="Masalan: temir yo'l muhandisi"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ilmiy darajasi</label>
                      <input
                        type="text"
                        name="academic_degree"
                        value={formData.academic_degree}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                        placeholder="Masalan: falsafa fanlari nomzodi"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ilmiy unvoni</label>
                      <input
                        type="text"
                        name="academic_title"
                        value={formData.academic_title}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                        placeholder="Masalan: dotsent, professor"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tamomlagan ta'lim muassasalari</label>
                    <textarea
                      name="graduated_institutions"
                      value={formData.graduated_institutions}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition resize-none"
                      placeholder="Masalan: 1997 y. Toshkent davlat universiteti (bakalavriat)..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Qaysi chet tillarini biladi</label>
                    <input
                      type="text"
                      name="languages"
                      value={formData.languages}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                      placeholder="Masalan: rus, ingliz tillari"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Davlat mukofotlari bilan taqdirlanganmi (qanaqa)</label>
                    <input
                      type="text"
                      name="state_awards"
                      value={formData.state_awards}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                      placeholder="Masalan: yo'q"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Xalq deputatlari kengashlari deputatimi yoki boshqa</label>
                    <input
                      type="text"
                      name="deputy_status"
                      value={formData.deputy_status}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition"
                      placeholder="Masalan: yo'q"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Qo'shimcha biografiya</label>
                    <textarea
                      name="biography"
                      value={formData.biography}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition resize-none"
                      placeholder="Tarjimai holning boshqa qismlari..."
                    />
                  </div>
                </div>
              )}

              {formTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mehnat faoliyati xronologiyasi</h4>
                    <button
                      type="button"
                      onClick={addCareerRow}
                      className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                    >
                      <i className="fas fa-plus"></i> Yangi qo'shish
                    </button>
                  </div>
                  
                  {formData.career.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-2xl text-sm">
                      Hech qanday mehnat faoliyati kiritilmagan. "Yangi qo'shish" tugmasini bosing.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.career.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-slate-950/40 p-4 border border-slate-850 rounded-2xl relative">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">Yillar (masalan, 2018-2022)</label>
                              <input
                                type="text"
                                value={item.years || ''}
                                onChange={(e) => handleCareerChange(idx, 'years', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                                placeholder="Masalan: 2018-2022"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">Lavozim</label>
                              <input
                                type="text"
                                value={item.position || ''}
                                onChange={(e) => handleCareerChange(idx, 'position', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                                placeholder="Masalan: Monter"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">Tashkilot / Joy</label>
                              <input
                                type="text"
                                value={item.organization || ''}
                                onChange={(e) => handleCareerChange(idx, 'organization', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                                placeholder="Masalan: PCh-1"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCareerRow(idx)}
                            className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition mt-5 text-sm"
                            title="O'chirish"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {formTab === 'relatives' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yaqin qarindoshlari ro'yxati</h4>
                    <button
                      type="button"
                      onClick={addRelativeRow}
                      className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                    >
                      <i className="fas fa-plus"></i> Yangi qo'shish
                    </button>
                  </div>
                  
                  {formData.relatives.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-2xl text-sm">
                      Yaqin qarindoshlar haqida ma'lumot kiritilmagan. "Yangi qo'shish" tugmasini bosing.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.relatives.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-slate-950/40 p-4 border border-slate-850 rounded-2xl relative">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">Qarindoshligi</label>
                              <select
                                value={item.relation || ''}
                                onChange={(e) => handleRelativeChange(idx, 'relation', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                              >
                                <option value="">Tanlang...</option>
                                <option value="Otasi">Otasi</option>
                                <option value="Onasi">Onasi</option>
                                <option value="Turmush o'rtog'i">Turmush o'rtog'i</option>
                                <option value="O'g'li">O'g'li</option>
                                <option value="Qizi">Qizi</option>
                                <option value="Akasi">Akasi</option>
                                <option value="Ukasi">Ukasi</option>
                                <option value="Opasi">Opasi</option>
                                <option value="Singlisi">Singlisi</option>
                                <option value="Qaynotasi">Qaynotasi</option>
                                <option value="Qaynonasi">Qaynonasi</option>
                              </select>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">F.I.Sh.</label>
                              <input
                                type="text"
                                value={item.full_name || ''}
                                onChange={(e) => handleRelativeChange(idx, 'full_name', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                                placeholder="To'liq ismi"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">Tug'ilgan yili va joyi</label>
                              <input
                                type="text"
                                value={item.birth_year_place || ''}
                                onChange={(e) => handleRelativeChange(idx, 'birth_year_place', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                                placeholder="1941 y., Samarqand sh."
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">Ish joyi va lavozimi</label>
                              <input
                                type="text"
                                value={item.workplace_position || ''}
                                onChange={(e) => handleRelativeChange(idx, 'workplace_position', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                                placeholder="Lavozimi va tashkiloti"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">Turar joyi (Manzili)</label>
                              <input
                                type="text"
                                value={item.residence || ''}
                                onChange={(e) => handleRelativeChange(idx, 'residence', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                                placeholder="Ko'chasi, uyi va xonadoni"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRelativeRow(idx)}
                            className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition mt-5 text-sm"
                            title="O'chirish"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 bg-slate-900">
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

      {/* Viewing Employee Details Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-extrabold text-lg shadow-inner overflow-hidden shrink-0">
                  {viewingEmployee.face_template ? (
                    <img src={viewingEmployee.face_template} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    (viewingEmployee.full_name || viewingEmployee.name || 'X').charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-lg leading-tight">
                    {viewingEmployee.full_name || viewingEmployee.name}
                  </h3>
                  <p className="text-xs text-amber-500/80 font-bold mt-0.5">
                    {viewingEmployee.position || 'Ishchi'} • {viewingEmployee.bolinma_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingEmployee(null)}
                className="text-slate-400 hover:text-slate-200 p-2 hover:bg-slate-800/50 rounded-xl transition"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-2 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setViewingTab('obektivka')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  viewingTab === 'obektivka'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className="fas fa-file-invoice text-sm"></i>
                Obyektivka / Tarjimai hol
              </button>
              <button
                onClick={() => setViewingTab('relatives')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  viewingTab === 'relatives'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className="fas fa-users text-sm"></i>
                Yaqin qarindoshlari
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {viewingTab === 'obektivka' ? (
                <div className="space-y-6">
                  {/* Official Government Layout Card */}
                  <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                    {/* 3x4 Photo Frame */}
                    <div className="w-[90px] h-[120px] border border-slate-800 rounded-xl text-slate-500 text-[10px] flex flex-col items-center justify-center float-right ml-4 mb-4 bg-slate-950/80 overflow-hidden shadow-inner shrink-0">
                      {viewingEmployee.face_template ? (
                        <img src={viewingEmployee.face_template} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <i className="fas fa-user-tie text-2xl mb-1 text-slate-600"></i>
                          <span>3x4 rasm</span>
                        </>
                      )}
                    </div>

                    <div className="text-center font-extrabold text-slate-200 text-sm uppercase tracking-widest mb-1">
                      MA'LUMOTNOMA
                    </div>
                    <div className="text-center font-extrabold text-amber-500 text-base mb-6">
                      {viewingEmployee.full_name || viewingEmployee.name}
                    </div>

                    {/* Current Position (Xizmat faoliyati) */}
                    <div className="text-xs text-slate-350 mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-850">
                      <div className="font-bold text-amber-500/90 font-mono mb-1">
                        {(() => {
                          try {
                            const ob = viewingEmployee.obektivka ? (typeof viewingEmployee.obektivka === 'string' ? JSON.parse(viewingEmployee.obektivka) : viewingEmployee.obektivka) : {};
                            return ob.current_position_date || '—';
                          } catch(e) { return '—'; }
                        })()} dan:
                      </div>
                      <div className="text-slate-100 font-extrabold text-sm leading-relaxed">{viewingEmployee.position || '—'}</div>
                    </div>

                    {/* Grid metadata */}
                    {(() => {
                      try {
                        const ob = viewingEmployee.obektivka ? (typeof viewingEmployee.obektivka === 'string' ? JSON.parse(viewingEmployee.obektivka) : viewingEmployee.obektivka) : {};
                        return (
                          <div className="space-y-4 clear-both">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Tug'ilgan yili va sanasi</span>
                                <span className="text-xs font-bold text-slate-200">{viewingEmployee.birth_date || '—'}</span>
                              </div>
                              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Tug'ilgan joyi</span>
                                <span className="text-xs font-bold text-slate-200">{ob.birth_place || '—'}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Millati</span>
                                <span className="text-xs font-bold text-slate-200">{ob.nationality || '—'}</span>
                              </div>
                              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Partiyaviyligi</span>
                                <span className="text-xs font-bold text-slate-200">{ob.party_membership || '—'}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Ma'lumoti</span>
                                <span className="text-xs font-bold text-slate-200">{ob.education || '—'}</span>
                              </div>
                              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Tamomlagan</span>
                                <span className="text-xs font-bold text-slate-200 whitespace-pre-line leading-relaxed">{ob.graduated_institutions || '—'}</span>
                              </div>
                            </div>

                            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs leading-relaxed">
                              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-850/40 gap-1">
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] sm:text-xs">Mutaxassisligi:</span>
                                <span className="text-slate-200 font-semibold text-xs sm:text-right">{ob.specialty || '—'}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-850/40 gap-1">
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] sm:text-xs">Ilmiy darajasi:</span>
                                <span className="text-slate-200 font-semibold text-xs sm:text-right">{ob.academic_degree || '—'}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-850/40 gap-1">
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] sm:text-xs">Ilmiy unvoni:</span>
                                <span className="text-slate-200 font-semibold text-xs sm:text-right">{ob.academic_title || '—'}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-850/40 gap-1">
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] sm:text-xs">Chet tillari:</span>
                                <span className="text-slate-200 font-semibold text-xs sm:text-right">{ob.languages || '—'}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-850/40 gap-1">
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] sm:text-xs">Davlat mukofotlari:</span>
                                <span className="text-slate-200 font-semibold text-xs sm:text-right">{ob.state_awards || '—'}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:justify-between py-2 gap-1">
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] sm:text-xs">Saylanadigan deputatlik organlari:</span>
                                <span className="text-slate-200 font-semibold text-xs sm:text-right">{ob.deputy_status || '—'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      } catch(e) { return <div className="text-xs text-red-400">Ma'lumotlarni o'qishda xatolik.</div>; }
                    })()}
                  </div>

                  {/* Career Timeline */}
                  <div className="bg-slate-950/30 border border-slate-800 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <i className="fas fa-history text-amber-500"></i>
                      MEHNAT FAOLIYATI
                    </h4>
                    {(() => {
                      try {
                        const ob = viewingEmployee.obektivka ? (typeof viewingEmployee.obektivka === 'string' ? JSON.parse(viewingEmployee.obektivka) : viewingEmployee.obektivka) : {};
                        const career = ob.career || [];
                        if (career.length === 0) {
                          return <div className="text-xs text-slate-500 font-semibold italic">Mehnat faoliyati ma'lumotlari mavjud emas.</div>;
                        }
                        return (
                          <div className="relative border-l border-slate-800 pl-6 ml-3 space-y-6">
                            {career.map((item, idx) => (
                              <div key={idx} className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-slate-900 border border-slate-950"></div>
                                {/* Content Card */}
                                <div className="space-y-0.5">
                                  <span className="inline-block text-[10px] font-bold text-amber-500/90 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mb-1">
                                    {item.years || '—'}
                                  </span>
                                  <h5 className="text-xs font-extrabold text-slate-200">{item.position || 'Noma\'lum lavozim'}</h5>
                                  <p className="text-[11px] text-slate-400">{item.organization || 'Noma\'lum tashkilot'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      } catch(e) { return <div className="text-xs text-slate-500">Xatolik yuz berdi.</div>; }
                    })()}
                  </div>
                </div>
              ) : (
                /* Relatives Tab */
                <div className="space-y-4">
                  <div className="text-center font-bold text-slate-300 text-xs mb-2">
                    {viewingEmployee.full_name || viewingEmployee.name}ning yaqin qarindoshlari haqida
                    <div className="text-amber-500 uppercase tracking-widest mt-1 text-sm">MA'LUMOT</div>
                  </div>
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider bg-slate-950/40">
                            <th className="py-3 px-4 w-[15%]">Qarindoshligi</th>
                            <th className="py-3 px-4 w-[25%]">F.I.Sh. (To'liq)</th>
                            <th className="py-3 px-4 w-[20%]">Tug'ilgan yili va joyi</th>
                            <th className="py-3 px-4 w-[20%]">Ish joyi va lavozimi</th>
                            <th className="py-3 px-4 w-[20%]">Turar joyi (Manzili)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                          {(() => {
                            try {
                              const relatives = viewingEmployee.relatives ? (typeof viewingEmployee.relatives === 'string' ? JSON.parse(viewingEmployee.relatives) : viewingEmployee.relatives) : [];
                              if (relatives.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-500 font-semibold italic">
                                      Yaqin qarindoshlari haqida ma'lumot kiritilmagan
                                    </td>
                                  </tr>
                                );
                              }
                              return relatives.map((rel, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/10 transition">
                                  <td className="py-3 px-4 font-bold text-amber-500/80">{rel.relation || '—'}</td>
                                  <td className="py-3 px-4 font-extrabold text-slate-200">{rel.full_name || '—'}</td>
                                  <td className="py-3 px-4 font-mono">{rel.birth_year_place || '—'}</td>
                                  <td className="py-3 px-4 text-slate-400">{rel.workplace_position || '—'}</td>
                                  <td className="py-3 px-4 text-slate-400">{rel.residence || '—'}</td>
                                </tr>
                              ));
                            } catch(e) {
                              return (
                                <tr>
                                  <td colSpan="5" className="text-center py-8 text-slate-500">
                                    Xatolik yuz berdi
                                  </td>
                                </tr>
                              );
                            }
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3">
              <button
                onClick={() => handlePrint(viewingEmployee)}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg"
              >
                <i className="fas fa-print"></i> Chop etish (PDF)
              </button>
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
