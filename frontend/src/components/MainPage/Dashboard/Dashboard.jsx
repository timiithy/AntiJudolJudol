import React from 'react'
import Live from './Live'
import Table from './Table'
import Charts from './Charts'

function HeatmapPlaceholder() {
  return (
    <div
      className="w-full rounded-[2.5rem] border-4 border-primary bg-linear-to-b from-primary to-primary/60 overflow-hidden relative shadow-[inset_0_2px_10px_rgba(161,37,33,0.03),0_10px_30px_rgba(161,37,33,0.08)]"
      style={{ minHeight: '300px' }}
    >
      {/* Grid pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--secondary) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-light/60 backdrop-blur-sm shadow-sm flex items-center justify-center text-secondary/30 border border-secondary/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
        </div>
        <div className="text-center">
            <span className="block font-display text-xl text-deep-earth/50 font-bold tracking-tight">
              Activity Heatmap
            </span>
            <span className="font-sans text-[10px] text-secondary/50 font-bold uppercase tracking-widest">
              Initializing Neural Network — 2026
            </span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <section className="w-full relative min-h-screen py-20 flex flex-col gap-16 overflow-hidden bg-primary/40">
      
      {/* Background Decor - Updated with new palette */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-gradient-radial from-primary-light/40 to-transparent opacity-60 pointer-events-none" />
      <div className="absolute -right-32 top-48 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />
      <div className="absolute -left-32 bottom-48 w-96 h-96 bg-teal/10 blur-[120px] rounded-full" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col gap-20">
        
        {/* Hero Section: Live Statistics */}
        <div className="flex flex-col gap-10">
          <Live />
        </div>

        {/* Section Wrapper */}
        <div className="grid grid-cols-1 gap-16">
          
          {/* Crawling Activities */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <h2 className="font-display font-bold text-2xl text-deep-earth whitespace-nowrap">
                Crawling Activities
              </h2>
              <div className="h-0.5 w-full bg-linear-to-r from-secondary/25 to-transparent" />
            </div>
            <HeatmapPlaceholder />
          </div>

          {/* Blacklist Database */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <h2 className="font-display font-bold text-2xl text-deep-earth whitespace-nowrap">
                Blacklist Database
              </h2>
              <div className="h-0.5 w-full bg-linear-to-r from-secondary/25 to-transparent" />
            </div>
            <div className="bg-primary/60 backdrop-blur-sm rounded-4xl p-2 border border-secondary/15 shadow-sm">
               <Table />
            </div>
          </div>

          {/* Detection Trends */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <h2 className="font-display font-bold text-2xl text-deep-earth whitespace-nowrap">
                Detection Trends
              </h2>
              <div className="h-0.5 w-full bg-linear-to-r from-secondary/25 to-transparent" />
            </div>
            <Charts />
          </div>

        </div>
      </div>
    </section>
  )
}