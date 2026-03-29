import React from 'react'
import Live from './Live'
import Table from './Table'
import Charts from './Charts'


function HeatmapPlaceholder() {
  return (
    <div
      className="w-full rounded-[2.5rem] border-4 border-white bg-linear-to-b from-[#fdfbf9] to-[#F2EEE8] overflow-hidden relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.02),0_10px_30px_rgba(0,0,0,0.03)]"
      style={{ minHeight: '300px' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#9E4A36 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-[#9E4A36]/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
        </div>
        <div className="text-center">
            <span className="block font-display text-xl text-[#3d2b1f]/40 font-bold tracking-tight">
              Activity Heatmap
            </span>
            <span className="font-sans text-[10px] text-[#9E4A36]/40 font-bold uppercase tracking-widest">
              Initializing Neural Network — 2026
            </span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    // Mengurangi gap global dari 24 ke 16 agar kontrol jarak lebih presisi di tingkat section
    <section className="w-full relative min-h-screen py-20 flex flex-col gap-16 overflow-hidden bg-[#F2EEE8]/30">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-gradient-radial from-white to-transparent opacity-50 pointer-events-none" />
      <div className="absolute -right-24 top-48 w-96 h-96 bg-[#9E4A36]/5 blur-[100px] rounded-full" />
      <div className="absolute -left-24 bottom-48 w-96 h-96 bg-teal-500/5 blur-[100px] rounded-full" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col gap-20">
        
        {/* Hero Section: Live Statistics */}
        <div className="flex flex-col gap-10">
          <div className="space-y-3 text-center">
            <span className="font-sans text-xs font-bold text-[#9E4A36] uppercase tracking-[0.3em]">Internal Monitor</span>
            <h2 className="font-display font-black text-6xl md:text-7xl text-[#3d2b1f] leading-tight">
              Live Statistics
            </h2>
          </div>
          <Live />
        </div>

        {/* Section Wrapper: Menggunakan gap yang konsisten untuk setiap blok data */}
        <div className="grid grid-cols-1 gap-16">
          
          {/* Crawling Activities */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <h2 className="font-display font-bold text-2xl text-[#3d2b1f] whitespace-nowrap">
                Crawling Activities
              </h2>
              <div className="h-0.5 w-full bg-linear-to-r from-[#9E4A36]/20 to-transparent" />
            </div>
            <HeatmapPlaceholder />
          </div>

          {/* Blacklist Database */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <h2 className="font-display font-bold text-2xl text-[#3d2b1f] whitespace-nowrap">
                Blacklist Database
              </h2>
              <div className="h-0.5 w-full bg-linear-to-r from-[#9E4A36]/20 to-transparent" />
            </div>
            <div className="bg-white/50 rounded-4xl p-2 border border-white/50 shadow-sm">
               <Table />
            </div>
          </div>

          {/* Detection Trends */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <h2 className="font-display font-bold text-2xl text-[#3d2b1f] whitespace-nowrap">
                Detection Trends
              </h2>
              <div className="h-0.5 w-full bg-linear-to-r from-[#9E4A36]/20 to-transparent" />
            </div>
            <Charts />
          </div>

        </div>
      </div>
    </section>
  )
}