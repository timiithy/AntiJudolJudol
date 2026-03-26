import React from 'react'
import Live from './Live'

function HeatmapPlaceholder() {
  return (
    <div
      className="
        w-full rounded-2xl
        border border-secondary/15
        bg-primary/60
        overflow-hidden
        relative
      "
      style={{ minHeight: '220px' }}
    >
      {/* Grid lines decoration */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(var(--secondary) 1px, transparent 1px),
            linear-gradient(90deg, var(--secondary) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Centered placeholder text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <svg
          width="32" height="32" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          className="text-secondary/20"
        >
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span className="font-sans text-sm text-secondary/25 font-medium">
          Heatmap — coming soon
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-16 flex flex-col gap-14">

      {/* Live Statistics */}
      <div className="flex flex-col gap-6">
        <h2 className="font-display font-bold text-3xl text-secondary text-center">
          Live Statistics
        </h2>
        <Live />
      </div>

      {/* Heatmap Crawling Activities */}
      <div className="flex flex-col gap-6">
        <h2 className="font-display font-bold text-3xl text-secondary text-center">
          Heatmap Crawling Activities
        </h2>
        <HeatmapPlaceholder />
      </div>

    </section>
  )
}
