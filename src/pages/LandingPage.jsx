import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background blobs for premium glowing look */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      {/* Main Header / Hero Section */}
      <header className="container mx-auto px-6 py-20 flex flex-col items-center text-center z-10 max-w-4xl">
        <div className="mb-8 p-1 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl shadow-xl shadow-amber-500/10">
          <img 
            src="/img/logo.png" 
            alt="Smart PCH Logo" 
            className="w-28 h-28 object-contain rounded-xl"
            onError={(e) => {
              // Fallback logo icon if image not loaded
              e.target.style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 mb-6 drop-shadow-sm">
          SMART PCH
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          O&apos;zbekiston Temir Yo&apos;llari uchun intellektual dispetcherlik, ishlab chiqarish va xavfsizlik boshqaruv platformasi. 
          Barcha bo&apos;limlar integratsiyasi yagona interfeysda.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl transition duration-300 transform hover:scale-[1.03] shadow-lg shadow-amber-500/20 w-full sm:w-auto"
          >
            Tizimga Kirish
          </button>
          <a 
            href="#features" 
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold rounded-xl border border-slate-800 transition duration-300 transform hover:scale-[1.03] w-full sm:w-auto text-center"
          >
            Batafsil ma&apos;lumot
          </a>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-12 z-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-8 rounded-2xl hover:border-amber-500/40 transition duration-300 group">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <i className="fas fa-microchip text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">AI Dispetcher</h3>
            <p className="text-slate-400 leading-relaxed">
              Tizim ma&apos;lumotlarni tahlil qiladi va dispetcherlarga tezkor qaror qabul qilishda tavsiyalar bilan yordam beradi.
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-8 rounded-2xl hover:border-amber-500/40 transition duration-300 group">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <i className="fas fa-route text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Real-Vaqt Xaritasi</h3>
            <p className="text-slate-400 leading-relaxed">
              Poyezdlar, xodimlar, masofalar va texnikalar harakatini interaktiv geo-xaritada onlayn kuzatish imkoniyati.
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-8 rounded-2xl hover:border-amber-500/40 transition duration-300 group">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <i className="fas fa-file-signature text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Raqamli Hujjatlar</h3>
            <p className="text-slate-400 leading-relaxed">
              Barcha rasmiy temir yo&apos;l jurnallari (PU-29, PU-74, PU-28 va boshqalar) va dalolatnomalarni raqamli yuritish.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900/40 border-t border-slate-900 py-12 z-10">
        <div className="container mx-auto px-6 max-w-4xl flex justify-around text-center">
          <div>
            <h4 className="text-3xl md:text-4xl font-extrabold text-amber-400">24/7</h4>
            <p className="text-xs md:text-sm text-slate-500 uppercase tracking-wider mt-1">Onlayn Nazorat</p>
          </div>
          <div className="border-r border-slate-800 h-12 self-center"></div>
          <div>
            <h4 className="text-3xl md:text-4xl font-extrabold text-amber-400">100%</h4>
            <p className="text-xs md:text-sm text-slate-500 uppercase tracking-wider mt-1">Ishonchlilik</p>
          </div>
          <div className="border-r border-slate-800 h-12 self-center"></div>
          <div>
            <h4 className="text-3xl md:text-4xl font-extrabold text-amber-400">10+</h4>
            <p className="text-xs md:text-sm text-slate-500 uppercase tracking-wider mt-1">Integratsiyalar</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-900/60 z-10">
        <p>&copy; {new Date().getFullYear()} O&apos;zbekiston Temir Yo&apos;llari. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
}
