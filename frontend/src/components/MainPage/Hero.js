'use client'
import React, { useState } from 'react'
import { IoSearch } from "react-icons/io5";

export default function Hero() {
  const [url, setUrl] = useState('')

  const handleScan = () => {
    if (!url.trim()) return
    // pas dah ada logic
    alert(`Scanning: ${url}`)
  }

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--secondary) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="mb-8 z-10 px-5 py-2 rounded-full border border-secondary/25 bg-secondary/10 backdrop-blur-sm">
        <span className="font-sans font-semibold tracking-[0.18em] text-secondary/80 text-xs uppercase">
          URL Hunter — Proactive Detection
        </span>
      </div>

      {/* Heading */}
      <h1 className="z-10 text-center font-display font-black text-secondary text-6xl sm:text-7xl md:text-8xl tracking-tight mb-7 max-w-4xl lg:text-nowrap text-wrap ">
        Anti Judol Judol Club
      </h1>

      {/* Description */}
      <p className="z-10 text-center font-sans font-normal text-secondary/70 text-base sm:text-lg max-w-1/2 leading-relaxed mb-14">
        Is that link safe? Use our Naive Bayes-driven AI to scan and detect
        online gambling sites automatically. Enter any suspicious URL below
        for immediate verification.
      </p>

      {/* Search Bar */}
      <div className="z-10 w-full max-w-xl flex items-center gap-0 bg-secondary rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.18)] overflow-hidden px-4">
        <IoSearch className='w-5 h-10 text-primary-dim' />

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          placeholder="Enter suspicious URL..."
          className="flex-1 bg-transparent outline-none border-none font-sans text-sm text-primary placeholder:text-primary/35 py-4 ml-3"
        />

        <button
          onClick={handleScan}
          suppressHydrationWarning
          className="ml-2 shrink-0 bg-primary text-secondary font-sans font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-300 ease-in-out cursor-pointer hover:shadow-[0_0_10px_2px_rgba(242,238,232,0.6)] "
        >
          Scan URL
        </button>
      </div>

      {/* glowing wingwing*/}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-150 h-50 opacity-20 blur-[80px]"
        style={{ background: 'var(--secondary)' }}
      />
    </section>
  )
}
