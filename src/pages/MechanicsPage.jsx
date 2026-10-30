import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { ApiError } from '../utils/api';
import {
  Wrench, Truck, FileText, Plus, Search, Trash2, Save, X, RefreshCw,
  Printer, Boxes, Fuel, Calendar, Clock, CheckCircle2, AlertTriangle, ShieldAlert
} from 'lucide-react';

export default function MechanicsPage() {
  const { user } = useAuth();
  const isAdminOrDept = user?.role === 'admin' || user?.role === 'department' || user?.role === 'subdivision';

  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [parts, setParts] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'addVehicle', 'order', 'waybill', 'putovka', 'to', 'repair', 'parts', 'fuel'

  // Form states
  const [newVehicle, setNewVehicle] = useState({ name: '', number: '', garage_number: '', fuel_type: 'Dizel', fuel_norm: '' });
  const [newOrder, setNewOrder] = useState({ vehicle_id: '', task: '' });
  const [newRepair, setNewRepair] = useState({ vehicle_id: '', date: new Date().toISOString().slice(0, 10), description: '', parts_replaced: '', total_cost: '' });
  const [newPart, setNewPart] = useState({ name: '', part_number: '', quantity: '', unit: 'dona', min_limit: '5' });
  const [newTO, setNewTO] = useState({ vehicle_id: '', to_type: 'TO-1', date: new Date().toISOString().slice(0, 10), inspector: '', notes: '' });
  const [waybillForm, setWaybillForm] = useState({
    vehicle_id: '',
    driver_id: '1',
    start_time: '08:00',
    end_time: '17:00',
    start_km: '12500',
    end_km: '12740',
    fuel_filled: '0',
    fuel_end: '25'
  });

  const handleSaveWaybill = async (e) => {
    e.preventDefault();
    if (!waybillForm.vehicle_id) return setError('Texnikani tanlang!');
    const startKm = parseFloat(waybillForm.start_km) || 0;
    const endKm = parseFloat(waybillForm.end_km) || 0;
    if (endKm <= startKm) return setError('Yakuniy spidometr boshlang\'ichdan katta bo\'lishi kerak!');

    try {
      await api.post('/api/mechanics/waybills', {
        ...waybillForm,
        start_km: startKm,
        end_km: endKm,
        fuel_filled: parseFloat(waybillForm.fuel_filled) || 0,
        fuel_end: parseFloat(waybillForm.fuel_end) || 0,
        date: new Date().toISOString().slice(0, 10)
      });
      setNotice('Yo\'l varaqasi muvaffaqiyatli saqlandi!');
      setActiveModal(null);
      loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yo\'l varaqasini saqlashda xatolik');
    }
  };

  // Putovka / Waybill Printable state
  const [putovkaData, setPutovkaData] = useState({
    vehicleId: '',
    driverName: user?.name || 'Eshmatov Toshmat',
    startKm: '12500',
    endKm: '12740',
    startFuel: '45',
    filledFuel: '0',
    endFuel: '25'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [vData, oData, rData, pData, mData] = await Promise.all([
        api.get('/api/mechanics/vehicles').catch(() => []),
        api.get('/api/mechanics/orders').catch(() => []),
        api.get('/api/mechanics/repairs').catch(() => []),
        api.get('/api/mechanics/parts').catch(() => []),
        api.get('/api/mechanics/maintenance').catch(() => [])
      ]);

      const vList = Array.isArray(vData) && vData.length > 0 ? vData : [
        { id: 1, name: 'AGMU-722 Drezina', number: '01 777 PCH', garage_number: '14', fuel_type: 'Dizel', fuel_norm: 12.5, status: 'free' },
        { id: 2, name: 'Traktor Belarus 82.1', number: '01 234 PCH', garage_number: '05', fuel_type: 'Dizel', fuel_norm: 8.0, status: 'busy' },
        { id: 3, name: 'ZIL-131 Avtokran', number: '01 555 PCH', garage_number: '02', fuel_type: 'Benzin', fuel_norm: 25.0, status: 'repair' }
      ];

      setVehicles(vList);
      setOrders(Array.isArray(oData) ? oData : []);
      setRepairs(Array.isArray(rData) ? rData : []);
      setParts(Array.isArray(pData) ? pData : []);
      setMaintenance(Array.isArray(mData) ? mData : []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const stats = useMemo(() => ({
    total: vehicles.length,
    free: vehicles.filter(v => v.status === 'free').length,
    busy: vehicles.filter(v => v.status === 'busy').length,
    repair: vehicles.filter(v => v.status === 'repair').length
  }), [vehicles]);

  // Handle Add Vehicle
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.number) return setError('Texnika nomi va raqamini kiriting!');
    try {
      await api.post('/api/mechanics/vehicles', {
        ...newVehicle,
        fuel_norm: parseFloat(newVehicle.fuel_norm) || 10,
        bolinma_id: user?.bolinmalar?.[0] || 'bolinma1'
      });
      setNotice('Yangi texnika muvaffaqiyatli qo\'shildi!');
      setActiveModal(null);
      setNewVehicle({ name: '', number: '', garage_number: '', fuel_type: 'Dizel', fuel_norm: '' });
      loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Texnika qo\'shishda xatolik');
    }
  };

  // Handle Create Order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.vehicle_id || !newOrder.task) return setError('Texnika va vazifani kiriting!');
    const selectedV = vehicles.find(v => v.id == newOrder.vehicle_id);
    try {
      await api.post('/api/mechanics/orders', {
        vehicle_id: newOrder.vehicle_id,
        vehicle_name: selectedV ? selectedV.name : 'Texnika',
        task: newOrder.task,
        dept_name: user?.name || 'Noma\'lum bo\'lim',
        date: new Date().toLocaleString()
      });
      await api.put(`/api/mechanics/vehicles/${newOrder.vehicle_id}/status`, { status: 'busy' });
      setNotice('Buyurtma saqlandi!');
      setActiveModal(null);
      setNewOrder({ vehicle_id: '', task: '' });
      loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Buyurtma berishda xatolik');
    }
  };

  // Handle Add Repair
  const handleAddRepair = async (e) => {
    e.preventDefault();
    if (!newRepair.vehicle_id || !newRepair.description) return setError('Texnika va tavsifni kiriting!');
    try {
      await api.post('/api/mechanics/repairs', {
        ...newRepair,
        total_cost: parseFloat(newRepair.total_cost) || 0,
        mechanic_name: user?.name || 'Mechanic'
      });
      setNotice('Ta\'mir qaydi saqlandi!');
      setNewRepair({ vehicle_id: '', date: new Date().toISOString().slice(0, 10), description: '', parts_replaced: '', total_cost: '' });
      loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ta\'mir qaydini saqlashda xatolik');
    }
  };

  // Handle Add Part
  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!newPart.name) return setError('Ehtiyot qism nomini kiriting!');
    try {
      await api.post('/api/mechanics/parts', {
        ...newPart,
        quantity: parseInt(newPart.quantity) || 0,
        min_limit: parseInt(newPart.min_limit) || 5,
        price: 0
      });
      setNotice('Ehtiyot qism omborga qo\'shildi!');
      setNewPart({ name: '', part_number: '', quantity: '', unit: 'dona', min_limit: '5' });
      loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ehtiyot qism saqlashda xatolik');
    }
  };

  // Update Part Qty
  const handleUpdatePartQty = async (id, newQty) => {
    if (newQty < 0) return;
    try {
      await api.patch(`/api/mechanics/parts/${id}`, { quantity: newQty });
      setParts(prev => prev.map(p => p.id === id ? { ...p, quantity: newQty } : p));
    } catch (e) {
      setError('Miqdorni yangilashda xatolik');
    }
  };

  // Handle Add TO
  const handleAddTO = async (e) => {
    e.preventDefault();
    if (!newTO.vehicle_id || !newTO.inspector) return setError('Texnika va inspektorni kiriting!');
    try {
      await api.post('/api/mechanics/maintenance', {
        ...newTO,
        status: 'completed'
      });
      setNotice('Texnik xizmat qaydi saqlandi!');
      setNewTO({ vehicle_id: '', to_type: 'TO-1', date: new Date().toISOString().slice(0, 10), inspector: '', notes: '' });
      loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'TO qaydini saqlashda xatolik');
    }
  };

  // Print Putovka Document
  const handlePrintPutovka = () => {
    if (typeof window.openPrintableTipovaya712 === 'function') {
      window.openPrintableTipovaya712(putovkaData.vehicleId);
      setActiveModal(null);
      return;
    }

    const selectedV = vehicles.find(v => v.id == putovkaData.vehicleId) || vehicles[0] || { name: 'Cobalt', number: '01 777 AAA', fuel_norm: 8.5 };
    const nameLower = (selectedV.name || '').toLowerCase();
    const isTruck = nameLower.includes('drezina') || nameLower.includes('traktor') || nameLower.includes('kran') || 
                    nameLower.includes('zil') || nameLower.includes('isuzu') || nameLower.includes('kamaz') || 
                    nameLower.includes('gaz') || nameLower.includes('yuk') || nameLower.includes('truck');

    const dist = Math.max(0, (parseFloat(putovkaData.endKm) || 0) - (parseFloat(putovkaData.startKm) || 0));
    const normCons = ((dist / 100) * (selectedV.fuel_norm || 8.5)).toFixed(1);
    const factCons = ((parseFloat(putovkaData.startFuel) || 0) + (parseFloat(putovkaData.filledFuel) || 0) - (parseFloat(putovkaData.endFuel) || 0)).toFixed(1);

    const win = window.open('', '_blank', 'width=950,height=900');
    win.document.write(`
      <html>
        <head>
          <title>${isTruck ? 'Путевой лист грузового автомобиля' : 'Tipovaya f. № 712'}</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 20px; color: black; background: white; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid black; padding: 4px 6px; text-align: left; }
            th { background: #f1f5f9; text-align: center; }
            @media print { body { margin: 0; } .page-break { page-break-after: always; } }
          </style>
        </head>
        <body>
          ${isTruck ? `
            <div class="page-break">
              <div style="display:flex; justify-space-between; align-items:flex-start;">
                <div style="border:1px solid black; padding:5px; width:160px; text-align:center; font-size:10px;">Место для штампа предприятия</div>
                <div style="text-align:center; flex:1;">
                  <h2 style="margin:0; font-size:16px;">ПУТЕВОЙ ЛИСТ ГРУЗОВОГО АВТОМОБИЛЯ № ${Math.floor(100000 + Math.random() * 900000)}</h2>
                  <div>${new Date().toLocaleDateString('uz-UZ')} y.</div>
                </div>
              </div>
              <div style="margin-top:10px;"><b>Автомобиль:</b> ${selectedV.name} &nbsp;&nbsp; <b>Гос. №:</b> ${selectedV.number} &nbsp;&nbsp; <b>Гар. №:</b> ${selectedV.garage_number || '01'}</div>
              <div><b>Водитель:</b> ${putovkaData.driverName}</div>
              <table>
                <thead>
                  <tr><th>Показания спидометра (Выезд)</th><th>Показания спидометра (Возврат)</th><th>Пройдено km</th><th>Расход горючего (Норма)</th><th>Расход (Фактически)</th></tr>
                </thead>
                <tbody>
                  <tr style="text-align:center;"><td>${putovkaData.startKm} km</td><td>${putovkaData.endKm} km</td><td>${dist} km</td><td>${normCons} L</td><td>${factCons} L</td></tr>
                </tbody>
              </table>
              <h4 style="margin:15px 0 5px 0;">ЗАДАНИЕ ВОДИТЕЛЮ</h4>
              <table>
                <thead>
                  <tr><th>В чье распоряжение</th><th>Время</th><th>Откуда</th><th>Куда</th><th>Наименование груза</th><th>Расстояние km</th></tr>
                </thead>
                <tbody>
                  <tr><td>ПЧ Начальник</td><td>08:00</td><td>ПЧ Гараж</td><td>Перегон 142-145 km</td><td>Рельс и шпалы</td><td>${dist} km</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 style="text-align:center; margin-top:10px;">ПОСЛЕДОВАТЕЛЬНОСТЬ ВЫПОЛНЕНИЯ ЗАДАНИЯ И РЕЗУЛЬТАТЫ</h3>
              <table>
                <thead>
                  <tr><th>№ ТТН</th><th>Заказчик</th><th>Время прибытия</th><th>Время убытия</th><th>Подпись</th></tr>
                </thead>
                <tbody>
                  <tr><td>TTN-001</td><td>ПЧ-16 Bo'linma</td><td>08:30</td><td>16:45</td><td>Принято ____________</td></tr>
                </tbody>
              </table>
            </div>
          ` : `
            <div style="text-align: right; font-weight: bold; font-size: 11px;">Tipovaya f. № 712</div>
            <div style="text-align: center; margin-bottom: 15px;">
              <h2 style="margin: 0; text-transform: uppercase;">YENGIL AVTOMOBIL YO'L VARAQASI № ${Math.floor(100000 + Math.random() * 900000)}</h2>
              <div>Sana: ${new Date().toLocaleDateString('uz-UZ')}</div>
            </div>
            <div><b>Tashkilot:</b> "O'zbekiston Temir Yo'llari" AJ PCH bo'linmasi</div>
            <div><b>Haydovchi:</b> ${putovkaData.driverName} &nbsp;&nbsp;&nbsp; <b>Texnika:</b> ${selectedV.name} (${selectedV.number})</div>
            <table>
              <thead>
                <tr>
                  <th>Boshlang'ich km</th><th>Yakuniy km</th><th>O'tilgan masofa</th><th>Norma sarf (L)</th><th>Fakt sarf (L)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${putovkaData.startKm}</td><td>${putovkaData.endKm}</td><td>${dist} km</td><td>${normCons} L</td><td>${factCons} L</td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top: 30px; display: flex; justify-content: space-between;">
              <div>Haydovchi imzosi: ____________</div>
              <div>Mexanik imzosi: ____________</div>
            </div>
          `}
          <script>
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    win.document.close();
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha & Action header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Wrench size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Mexanika Bo'limi</h1>
            <p className="text-xs text-slate-500 font-semibold">
              Transport vositalari, yo'l varaqalari va ta'mir boshqaruvi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition disabled:opacity-50"
            title="Yangilash"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          {isAdminOrDept && (
            <button
              onClick={() => setActiveModal('addVehicle')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-sm hover:brightness-110 transition shadow-lg shadow-amber-500/10"
            >
              <Plus size={16} />
              Yangi Texnika
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          <span className="flex items-center gap-2"><AlertTriangle size={16} /> {error}</span>
          <button onClick={() => setError('')} className="text-red-400/60 hover:text-red-400"><X size={14} /></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Jami Texnikalar</div>
          <div className="text-2xl font-black mt-1 text-slate-100">{stats.total}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">Bo'sh</div>
          <div className="text-2xl font-black mt-1 text-emerald-400">{stats.free}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-red-500">Ishda</div>
          <div className="text-2xl font-black mt-1 text-red-400">{stats.busy}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">Ta'mirda</div>
          <div className="text-2xl font-black mt-1 text-amber-400">{stats.repair}</div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => setActiveModal('waybill')}
          className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 flex flex-col items-center gap-2 transition group"
        >
          <FileText size={20} className="group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-200">Yangi Yo'l Varaqasi</span>
        </button>

        <button
          onClick={() => setActiveModal('putovka')}
          className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 hover:border-sky-500/40 text-sky-400 flex flex-col items-center gap-2 transition group"
        >
          <Printer size={20} className="group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-200">Putovka f.712</span>
        </button>

        <button
          onClick={() => setActiveModal('order')}
          className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 flex flex-col items-center gap-2 transition group"
        >
          <Truck size={20} className="group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-200">Buyurtmalar</span>
        </button>

        <button
          onClick={() => setActiveModal('to')}
          className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 flex flex-col items-center gap-2 transition group"
        >
          <Wrench size={20} className="group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-200">Texnik Xizmat (TO)</span>
        </button>

        <button
          onClick={() => setActiveModal('repair')}
          className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 flex flex-col items-center gap-2 transition group"
        >
          <FileText size={20} className="group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-200">Ta'mir Jurnali</span>
        </button>

        <button
          onClick={() => setActiveModal('parts')}
          className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/40 text-teal-400 flex flex-col items-center gap-2 transition group"
        >
          <Boxes size={20} className="group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-200">Ehtiyot Qismlar</span>
        </button>

        <button
          onClick={() => setActiveModal('fuel')}
          className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 flex flex-col items-center gap-2 transition group"
        >
          <Fuel size={20} className="group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-200">Yoqilg'i Hisobi</span>
        </button>

        <button
          onClick={() => setActiveModal('vehiclesList')}
          className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 flex flex-col items-center gap-2 transition group"
        >
          <Truck size={20} className="group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-200">Texnikalar Ro'yxati</span>
        </button>
      </div>

      {/* Main Vehicle Fleet Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Truck size={16} className="text-amber-500" />
          Mavjud Transport va Texnikalar ({vehicles.length} ta)
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-semibold text-xs flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-500"></div>
            Yuklanmoqda...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">Hali texnikalar kiritilmagan.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(v => {
              const statusBg = v.status === 'free' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : v.status === 'busy' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              const statusText = v.status === 'free' ? 'Bo\'sh' : v.status === 'busy' ? 'Ishda' : 'Ta\'mirda';
              return (
                <div key={v.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                        {v.garage_number ? `Garaj №${v.garage_number}` : 'Texnika'}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${statusBg}`}>
                        {statusText}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-base">{v.name}</h4>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{v.number}</p>
                    <div className="mt-3 text-xs text-slate-500 space-y-1 border-t border-slate-900 pt-2">
                      <div>Yoqilg'i: <span className="text-slate-300 font-semibold">{v.fuel_type || 'Dizel'}</span> ({v.fuel_norm || 10} L/100km)</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-900">
                    <button
                      onClick={() => {
                        setWaybillForm(prev => ({ ...prev, vehicle_id: v.id }));
                        setActiveModal('waybill');
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold transition"
                    >
                      <FileText size={13} /> Yo'l Varaqasi
                    </button>
                    <button
                      onClick={() => {
                        setPutovkaData(prev => ({ ...prev, vehicleId: v.id }));
                        setActiveModal('putovka');
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 text-xs font-bold transition"
                    >
                      <Printer size={13} /> Putovka 712
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Orders List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-2">
          <Clock size={16} />
          Kelgan Buyurtmalar ({orders.length} ta)
        </h3>
        {orders.length === 0 ? (
          <div className="text-xs text-slate-500 py-4 text-center">Hali buyurtmalar kelmagan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px] font-extrabold">
                  <th className="py-2.5 px-3">Sana</th>
                  <th className="py-2.5 px-3">Bo'linma</th>
                  <th className="py-2.5 px-3">Texnika</th>
                  <th className="py-2.5 px-3">Vazifa</th>
                  <th className="py-2.5 px-3">Holat</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400">{o.date}</td>
                    <td className="py-2.5 px-3 font-bold text-sky-400">{o.dept_name || 'Noma\'lum'}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">{o.vehicle_name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{o.task}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {o.status === 'approved' ? 'Tasdiqlangan' : 'Kutilmoqda'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Add Vehicle Modal */}
      {activeModal === 'addVehicle' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddVehicle} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Truck size={18} className="text-amber-500" /> Yangi Texnika Qo'shish
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>
            <input value={newVehicle.name} onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} placeholder="Texnika nomi (Isuzu, AGMU)" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100" />
            <input value={newVehicle.number} onChange={e => setNewVehicle({ ...newVehicle, number: e.target.value })} placeholder="Davlat raqami (01 777 AAA)" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100" />
            <input value={newVehicle.garage_number} onChange={e => setNewVehicle({ ...newVehicle, garage_number: e.target.value })} placeholder="Garaj raqami" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100" />
            <select value={newVehicle.fuel_type} onChange={e => setNewVehicle({ ...newVehicle, fuel_type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100">
              <option value="Dizel">Dizel</option>
              <option value="Benzin">Benzin</option>
              <option value="Gaz">Gaz</option>
            </select>
            <input type="number" value={newVehicle.fuel_norm} onChange={e => setNewVehicle({ ...newVehicle, fuel_norm: e.target.value })} placeholder="Yoqilg'i normasi (L/100km)" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100" />
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-sm font-bold">Bekor qilish</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold">Saqlash</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Create Order Modal */}
      {activeModal === 'order' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateOrder} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Truck size={18} className="text-amber-500" /> Transport Buyurtma Berish
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>
            <select value={newOrder.vehicle_id} onChange={e => setNewOrder({ ...newOrder, vehicle_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100">
              <option value="">Texnikani tanlang</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.number}) - {v.status === 'free' ? 'Bo\'sh' : 'Band'}</option>
              ))}
            </select>
            <textarea value={newOrder.task} onChange={e => setNewOrder({ ...newOrder, task: e.target.value })} placeholder="Buyurtma tavsifi / Maqsadi" rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100" />
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-sm font-bold">Bekor qilish</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold">Yuborish</button>
            </div>
          </form>
        </div>
      )}

      {/* 2.5 Waybill Modal */}
      {activeModal === 'waybill' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveWaybill} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" /> Elektron Yo'l Varaqasi
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Texnika</label>
                <select value={waybillForm.vehicle_id} onChange={e => setWaybillForm({ ...waybillForm, vehicle_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1">
                  <option value="">Texnikani tanlang</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.number})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Boshlanish vaqti</label>
                  <input type="time" value={waybillForm.start_time} onChange={e => setWaybillForm({ ...waybillForm, start_time: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Tugash vaqti</label>
                  <input type="time" value={waybillForm.end_time} onChange={e => setWaybillForm({ ...waybillForm, end_time: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Spidometr (Boshlang'ich)</label>
                  <input type="number" value={waybillForm.start_km} onChange={e => setWaybillForm({ ...waybillForm, start_km: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Spidometr (Yakuniy)</label>
                  <input type="number" value={waybillForm.end_km} onChange={e => setWaybillForm({ ...waybillForm, end_km: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Quyilgan yoqilg'i (L)</label>
                  <input type="number" value={waybillForm.fuel_filled} onChange={e => setWaybillForm({ ...waybillForm, fuel_filled: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Bakdagi qoldiq (L)</label>
                  <input type="number" value={waybillForm.fuel_end} onChange={e => setWaybillForm({ ...waybillForm, fuel_end: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">O'tilgan masofa:</span>
                <span className="font-bold text-amber-400">{Math.max(0, (parseFloat(waybillForm.end_km) || 0) - (parseFloat(waybillForm.start_km) || 0))} km</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-sm font-bold">Bekor qilish</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold flex items-center gap-1.5"><Save size={15} /> Yo'l varaqasini saqlash</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Putovka Modal */}
      {activeModal === 'putovka' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Printer size={18} className="text-sky-400" /> Putovka f. № 712 Shakllantirish
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Texnika</label>
                <select value={putovkaData.vehicleId} onChange={e => setPutovkaData({ ...putovkaData, vehicleId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1">
                  <option value="">Tanlang</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.number})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Boshlang'ich km</label>
                  <input value={putovkaData.startKm} onChange={e => setPutovkaData({ ...putovkaData, startKm: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Yakuniy km</label>
                  <input value={putovkaData.endKm} onChange={e => setPutovkaData({ ...putovkaData, endKm: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Boshida benzin (L)</label>
                  <input value={putovkaData.startFuel} onChange={e => setPutovkaData({ ...putovkaData, startFuel: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Quyildi (L)</label>
                  <input value={putovkaData.filledFuel} onChange={e => setPutovkaData({ ...putovkaData, filledFuel: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Oxirida (L)</label>
                  <input value={putovkaData.endFuel} onChange={e => setPutovkaData({ ...putovkaData, endFuel: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 mt-1" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-sm font-bold">Yopish</button>
              <button type="button" onClick={handlePrintPutovka} className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-sm font-bold flex items-center gap-1.5"><Printer size={15} /> Chop Etish</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Repair Log Modal */}
      {activeModal === 'repair' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <FileText size={18} className="text-orange-400" /> Ta'mir Jurnali
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddRepair} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300">Yangi Ta'mir Qaydi</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={newRepair.vehicle_id} onChange={e => setNewRepair({ ...newRepair, vehicle_id: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100">
                  <option value="">Texnikani tanlang</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.number})</option>)}
                </select>
                <input type="date" value={newRepair.date} onChange={e => setNewRepair({ ...newRepair, date: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100" />
              </div>
              <input value={newRepair.description} onChange={e => setNewRepair({ ...newRepair, description: e.target.value })} placeholder="Ta'mir tavsifi (Nima qilindi?)" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={newRepair.parts_replaced} onChange={e => setNewRepair({ ...newRepair, parts_replaced: e.target.value })} placeholder="Almashtirilgan qismlar" className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100" />
                <input type="number" value={newRepair.total_cost} onChange={e => setNewRepair({ ...newRepair, total_cost: e.target.value })} placeholder="Xarajat (so'm)" className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100" />
              </div>
              <button type="submit" className="w-full py-2 bg-orange-500 text-slate-950 rounded-xl text-xs font-bold">Qaydni saqlash</button>
            </form>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400">Mavjud qaydlar</div>
              {repairs.length === 0 ? <div className="text-xs text-slate-500 py-4 text-center">Hali ta'mir qaydi yo'q</div> : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="py-2">Sana</th>
                      <th className="py-2">Texnika</th>
                      <th className="py-2">Tavsif</th>
                      <th className="py-2">Xarajat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.map(r => (
                      <tr key={r.id} className="border-b border-slate-800/60">
                        <td className="py-2 text-slate-400">{r.date}</td>
                        <td className="py-2 font-bold text-slate-200">{r.vehicle_name}</td>
                        <td className="py-2 text-slate-300">{r.description}</td>
                        <td className="py-2 text-emerald-400 font-mono">{(r.total_cost || 0).toLocaleString()} so'm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Spare Parts Modal */}
      {activeModal === 'parts' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Boxes size={18} className="text-teal-400" /> Ehtiyot Qismlar Ombori
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddPart} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300">Yangi Partiya Qo'shish</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input value={newPart.name} onChange={e => setNewPart({ ...newPart, name: e.target.value })} placeholder="Nomi" className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100" />
                <input value={newPart.part_number} onChange={e => setNewPart({ ...newPart, part_number: e.target.value })} placeholder="Artikul" className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100" />
                <input type="number" value={newPart.quantity} onChange={e => setNewPart({ ...newPart, quantity: e.target.value })} placeholder="Miqdor" className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100" />
                <button type="submit" className="py-2 bg-teal-500 text-slate-950 rounded-xl text-xs font-bold">Qo'shish</button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {parts.map(p => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200 text-xs">{p.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">{p.quantity} {p.unit || 'dona'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button onClick={() => handleUpdatePartQty(p.id, p.quantity - 1)} className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded text-xs font-bold hover:bg-slate-800">-</button>
                    <span className="text-[10px] text-slate-500">Miqdorni o'zgartirish</span>
                    <button onClick={() => handleUpdatePartQty(p.id, p.quantity + 1)} className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded text-xs font-bold hover:bg-slate-800">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Technical Maintenance (TO) Modal */}
      {activeModal === 'to' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Wrench size={18} className="text-blue-400" /> TO-1, TO-2, TO-3 Texnik Xizmat
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddTO} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300">Yangi TO Qaydi</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select value={newTO.vehicle_id} onChange={e => setNewTO({ ...newTO, vehicle_id: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100">
                  <option value="">Texnikani tanlang</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <select value={newTO.to_type} onChange={e => setNewTO({ ...newTO, to_type: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100">
                  <option value="TO-1">TO-1 (1000 km)</option>
                  <option value="TO-2">TO-2 (5000 km)</option>
                  <option value="TO-3">TO-3 (10000 km)</option>
                </select>
                <input value={newTO.inspector} onChange={e => setNewTO({ ...newTO, inspector: e.target.value })} placeholder="Inspektor F.I.Sh." className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100" />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-500 text-slate-950 rounded-xl text-xs font-bold">Saqlash</button>
            </form>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400">So'nggi TO qaydlari</div>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2">Sana</th>
                    <th className="py-2">Texnika</th>
                    <th className="py-2">Turi</th>
                    <th className="py-2">Inspektor</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map(m => (
                    <tr key={m.id} className="border-b border-slate-800/60">
                      <td className="py-2 text-slate-400">{m.date}</td>
                      <td className="py-2 font-bold text-slate-200">{m.vehicle_name}</td>
                      <td className="py-2 text-blue-400 font-bold">{m.to_type}</td>
                      <td className="py-2 text-slate-300">{m.inspector}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. Fuel Report Modal */}
      {activeModal === 'fuel' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Fuel size={18} className="text-rose-400" /> Oylik Yoqilg'i Hisoboti
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {vehicles.map(v => (
                <div key={v.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{v.name} ({v.number})</div>
                    <div className="text-slate-500">Yoqilg'i: {v.fuel_type || 'Dizel'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">Norma: {v.fuel_norm || 10} L/100km</div>
                    <div className="text-slate-400">Holat: {v.status === 'free' ? 'Bo\'sh' : 'Ishda'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. Vehicles List Modal */}
      {activeModal === 'vehiclesList' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Truck size={18} className="text-purple-400" /> Texnikalar Ro'yxati
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px] font-extrabold">
                    <th className="py-2.5 px-3">T/R</th>
                    <th className="py-2.5 px-3">Texnika Nomi</th>
                    <th className="py-2.5 px-3">Davlat Raqami</th>
                    <th className="py-2.5 px-3">Garaj №</th>
                    <th className="py-2.5 px-3">Yoqilg'i Turi</th>
                    <th className="py-2.5 px-3">Norma (L)</th>
                    <th className="py-2.5 px-3">Holati</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, i) => (
                    <tr key={v.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-400">{i + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-200">{v.name}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono">{v.number}</td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">{v.garage_number || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-400">{v.fuel_type || 'Dizel'}</td>
                      <td className="py-2.5 px-3 text-slate-400">{v.fuel_norm || 10}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.status === 'free' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : v.status === 'busy' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {v.status === 'free' ? 'Bo\\'sh' : v.status === 'busy' ? 'Ishda' : 'Ta\\'mirda'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vehicles.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">Texnikalar topilmadi.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
