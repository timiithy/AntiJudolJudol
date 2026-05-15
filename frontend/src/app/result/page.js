"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BiArrowBack, BiShield, BiError } from "react-icons/bi";
import { Suspense } from "react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-center px-8 py-5">
      <div className="flex items-center gap-1 bg-primary-light backdrop-blur-md rounded-full px-2 py-2 shadow-sm border border-secondary/10">
        <Link href="/" className="text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:bg-secondary/5">Home</Link>
        <Link href="/#dashboard" className="bg-secondary text-primary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200">Database</Link>
        <Link href="/#statistics" className="text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:bg-secondary/5">Statistics</Link>
        <Link href="/#export" className="text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:bg-secondary/5">Export</Link>
      </div>
    </nav>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();

  // Ambil data langsung — tidak perlu mounted state
  const url = searchParams.get('url') || '-';
  const status = searchParams.get('status') || 'Aman';
  
  const rawRiskScore = parseFloat(searchParams.get('risk_score') || '0');
  const riskScore = Math.min(100, Math.max(0, Math.round(rawRiskScore > 1 ? rawRiskScore : rawRiskScore * 100)));
  
  const riskLevel = searchParams.get('risk_level') || 'Rendah';
  const category = searchParams.get('category') || 'Normal';
  const keywords = (searchParams.get('keywords') || '').split(',').filter(Boolean);
  
  const rawDate = searchParams.get('detected_at');
  let detectedAt = "Baru saja";
  try {
    if (rawDate) {
      const d = new Date(rawDate.replace(' ', 'T'));
      detectedAt = !isNaN(d.getTime())
        ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  } catch (e) {
    detectedAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const isUnsafe = status === 'Tidak Aman' || status === 'JUDI' || riskScore > 50;
  const riskBadgeColor = riskScore > 60 ? 'bg-red-600' : riskScore > 30 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="max-w-2xl w-full mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="space-y-2">
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-primary font-bold leading-tight">
          Situs<br />Terdeteksi
        </h1>
        <h2 className="font-display text-6xl sm:text-7xl md:text-8xl text-primary italic font-black uppercase tracking-tighter">
          {isUnsafe ? 'Judi' : 'Aman'}
        </h2>
      </div>

      <div className="bg-primary/20 backdrop-blur-sm rounded-full px-8 py-4 border border-primary/30 max-w-md mx-auto overflow-hidden">
        <p className="font-mono text-sm sm:text-base text-primary/90 truncate">{url}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
        <div className="bg-primary/10 backdrop-blur-md rounded-3xl p-6 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BiError className="text-primary text-3xl" />
              <div className="text-left">
                <p className="font-sans text-primary/80 text-xs font-bold uppercase">Skor</p>
                <p className="font-sans text-primary/80 text-xs font-bold uppercase">Risiko</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-5xl font-black text-primary">{riskScore}%</p>
              <span className={`inline-block ${riskBadgeColor} text-primary text-[10px] uppercase font-black px-3 py-1 rounded-full mt-1 shadow-sm`}>
                {riskLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 backdrop-blur-md rounded-3xl p-6 border border-primary/20">
          <div className="flex items-start justify-between h-full">
            <div className="flex items-center gap-3">
              <BiShield className="text-primary text-3xl" />
              <div className="text-left">
                <p className="font-sans text-primary/80 text-xs font-bold uppercase">Kata</p>
                <p className="font-sans text-primary/80 text-xs font-bold uppercase">Kunci</p>
              </div>
            </div>
            <ul className="text-left space-y-1">
              {keywords.length > 0 ? keywords.map((keyword, i) => (
                <li key={i} className="font-sans text-primary/90 text-xs font-medium bg-primary/5 px-2 py-0.5 rounded border border-primary/10">• {keyword}</li>
              )) : (
                <li className="font-sans text-primary/60 text-xs italic">Tidak ditemukan</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-primary/20 flex flex-col items-center gap-1">
        <p className="font-sans text-primary/60 text-[10px] uppercase tracking-widest">
          Kategori: <span className="font-black text-primary/80">{category}</span>
        </p>
        <p className="font-sans text-primary/60 text-[10px] uppercase tracking-widest">
          Dipindai pada: <span className="font-black text-primary/80">{detectedAt}</span>
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary text-secondary font-sans font-black uppercase text-sm px-10 py-4 rounded-full hover:bg-primary-light transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 group"
      >
        <BiArrowBack size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali Cek Situs Lain
      </Link>
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className="min-h-screen bg-primary relative overflow-hidden">
      <Navbar />
      <div className="absolute bottom-0 left-0 w-full h-[85%] bg-secondary rounded-t-[100%] scale-110 pointer-events-none" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <Suspense fallback={<div className="text-primary font-display text-2xl animate-bounce">Menganalisis...</div>}>
          <ResultContent />
        </Suspense>
      </div>
    </main>
  );
}