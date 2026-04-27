'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Komponen Kartu Floating
function FloatingCard({ src, className, delay = 0 }) {
  return (
    <div 
      className={`absolute animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {src ? (
        <div className="relative w-full h-full">
          <Image 
            src={src} 
            alt="card" 
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <svg viewBox="0 0 100 140" className="w-24 h-32 drop-shadow-xl">
          <rect x="5" y="5" width="90" height="130" rx="8" fill="#fff" stroke="#9E4A36" strokeWidth="2"/>
          <text x="15" y="28" fontSize="20" fill="#9E4A36">K</text>
          <text x="50" y="75" fontSize="40" fill="#9E4A36" textAnchor="middle">♠</text>
          <text x="85" y="118" fontSize="20" fill="#9E4A36" textAnchor="end">K</text>
        </svg>
      )}
    </div>
  )
}

// Komponen Loading Overlay
function ScanningOverlay({ url, onCancel }) {
  const [step, setStep] = useState(0)
  const steps = [
    'Menghubungkan ke server...',
    'Menganalisis struktur URL...',
    'Menjalankan model Naive Bayes...',
    'Mengecek database blacklist...',
    'Menyusun laporan keamanan...',
  ]

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 backdrop-blur-md">
      <div className="max-w-md w-full mx-4 text-center space-y-6">
        
        {/* Animated Scanner Icon */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-secondary/20 animate-ping" />
          <div className="relative w-full h-full rounded-full bg-secondary/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-secondary animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Status Text */}
        <div>
          <h3 className="font-display font-bold text-xl text-deep-earth mb-2">
            Sedang Memindai...
          </h3>
          <p className="font-sans text-sm text-secondary/70 truncate">
            {url}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-2 text-left">
          {steps.map((text, i) => (
            <div 
              key={i}
              className={`flex items-center gap-3 text-xs font-sans transition-all duration-300 ${
                i < step ? 'text-secondary' : i === step ? 'text-deep-earth' : 'text-deep-earth/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                i < step ? 'bg-secondary' : i === step ? 'bg-secondary animate-pulse' : 'bg-deep-earth/20'
              }`} />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-secondary/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-secondary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="text-xs text-deep-earth/40 hover:text-secondary font-sans underline transition-colors"
        >
          Batalkan
        </button>

      </div>
    </div>
  )
}

export default function Hero() {
  const [url, setUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const router = useRouter()

  // ✅ FIX: Tambahkan parameter 'e' dan panggil e.preventDefault()
  const handleScan = (e) => {
    e.preventDefault() // Mencegah browser navigasi ke URL input secara default
    
    if (!url.trim()) return
    
    // 1. Mulai proses scanning
    setIsScanning(true)

    // 2. Simulasi delay AI scanning (2.5-3.5 detik)
    const scanDuration = 2500 + Math.random() * 1000
    
    setTimeout(() => {
      // 3. Setelah "selesai", redirect ke halaman result (BUKAN ke URL input)
      router.push(`/result?url=${encodeURIComponent(url)}`)
    }, scanDuration)
  }

  const handleCancel = () => {
    setIsScanning(false)
  }

  return (
    <section className="min-h-screen w-full flex flex-col justify-center relative overflow-hidden pt-20">

      {/* Background Grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--secondary) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Lingkaran Merah */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-200 h-200 bg-secondary rounded-full"
      />

      {/* KARTU FLOATING */}
      <FloatingCard 
        src="/King_Test.png"
        className="top-20 left-10 w-40 h-56 rotate-45 hidden sm:block"
        delay={0}
      />
      <FloatingCard 
        src="/King_Test.png"
        className="top-50 left-400 w-40 h-56 rotate-105 hidden sm:block"
        delay={0}
      />
      <FloatingCard 
        src="/King_Test.png"
        className="top-160 left-300 w-40 h-56 rotate-55 hidden sm:block"
        delay={0}
      />

      {/* Loading Overlay */}
      {isScanning && <ScanningOverlay url={url} onCancel={handleCancel} />}

      {/* Main Content */}
      <div className="relative z-10 flex flex-row items-center w-full max-w-7xl mx-auto px-10 lg:px-16 gap-0">
        <div className="flex flex-col justify-center flex-1 min-w-0 py-12">

          {/* Heading */}
          <h1 className="font-display text-deep-earth leading-[0.95] mb-6">
            <span className="block font-black text-[clamp(4rem,9vw,8rem)] tracking-tight not-italic">
              Anti
            </span>
            <span className="block font-black italic text-[clamp(4rem,9vw,8rem)] tracking-tight">
              Judol Judol
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-sans font-bold text-deep-earth text-lg sm:text-xl max-w-sm leading-snug mb-10">
            Model AI yang dapat mendeteksi situs<br />judi online
          </p>

          {/* Search Bar - Menggunakan FORM */}
          <div className="w-full max-w-sm">
            <form 
              onSubmit={handleScan} 
              className="flex items-center rounded-full bg-primary-light px-2 py-2 shadow-sm border border-secondary/10"
            >
              
              {/* Input Area */}
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ada situs yang mencurigakan?"
                disabled={isScanning}
                className="flex-1 bg-transparent outline-none border-none italic font-display text-sm text-deep-earth/80 placeholder:text-deep-earth/50 placeholder:italic px-4 py-2 disabled:opacity-50"
              />

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={isScanning}
                className="shrink-0 bg-secondary hover:bg-secondary-dark text-primary font-sans font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ...
                  </span>
                ) : 'Cek'}
              </button>
              
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}