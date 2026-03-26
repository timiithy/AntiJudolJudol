import React from 'react'

const stats = [
  {
    label: 'Total URLs Scanned',
    value: '1,234,356',
    sub: '+ 1,200 today',
    // icon: (
    //   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    //     <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
    //     <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
    //   </svg>
    // ),
  },
  {
    label: 'Gambling Sites Detected',
    value: '34,700',
    sub: '+ 100 today',
    // icon: (
    //   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    //     <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    //     <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    //   </svg>
    // ),
  },
  {
    label: 'Verified Safe Sites',
    value: '800,000',
    sub: '+ 3,491 today',
    // icon: (
    //   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    //     <circle cx="11" cy="11" r="8"/>
    //     <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    //     <polyline points="9 11 11 13 15 9"/>
    //   </svg>
    // ),
  },
  {
    label: 'Active Crawlers',
    value: '24/7',
    sub: 'All crawlers active',
    // icon: (
    //   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    //     <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    //   </svg>
    // ),
  },
]

export default function Live() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="
            rounded-2xl border border-secondary/15
            bg-primary/60 backdrop-blur-sm
            px-6 py-5
            flex items-start justify-between
            hover:border-secondary/30 hover:bg-primary/80
            transition-all duration-200
          "
        >
          {/* Text */}
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs font-medium text-secondary/50 tracking-wide">
              {stat.label}
            </span>
            <span className="font-display font-bold text-3xl text-secondary leading-tight">
              {stat.value}
            </span>
            <span className="font-sans text-xs text-secondary/40 mt-0.5">
              {stat.sub}
            </span>
          </div>

          {/* Icon */}
          <div className="text-secondary/30 mt-1 shrink-0">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  )
}
