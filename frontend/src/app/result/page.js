// src/app/result/page.js
"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BiArrowBack, BiShield, BiError } from "react-icons/bi";

// Navbar Component
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-center px-8 py-5">
      <div className="flex items-center gap-1 bg-primary-light backdrop-blur-md rounded-full px-2 py-2 shadow-sm border border-secondary/10">
        <Link
          href="/"
          className="text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:bg-secondary/5"
        >
          Home
        </Link>
        <Link
          href="/#dashboard"
          className="bg-secondary text-primary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200"
        >
          Database
        </Link>
        <Link
          href="/#statistics"
          className="text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:bg-secondary/5"
        >
          Statistics
        </Link>
        <Link
          href="/#export"
          className="text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:bg-secondary/5"
        >
          Export
        </Link>
      </div>
    </nav>
  );
}

import { Suspense } from "react";

function ResultContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "example.com";

  // Dummy data
  const riskScore = 90;
  const riskLevel = "Tinggi";
  const keywords = ["Sapi", "Gacor", "Gacoan", "Wizzmie"];
  const category = "Judi Online";
  const detectedAt = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl w-full mx-auto text-center space-y-8">
      {/* Main Title */}
      <div className="space-y-2">
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-primary font-bold leading-tight">
          Situs
          <br />
          Terdeteksi
        </h1>
        <h2 className="font-display text-6xl sm:text-7xl md:text-8xl text-primary italic font-black">
          Judi
        </h2>
      </div>

      {/* URL Display */}
      <div className="bg-primary/20 backdrop-blur-sm rounded-full px-8 py-4 border border-primary/30 max-w-md mx-auto">
        <p className="font-mono text-sm sm:text-base text-primary/90 truncate">
          {url}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
        {/* Risk Level Card */}
        <div className="bg-primary/10 backdrop-blur-md rounded-3xl p-6 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BiError className="text-primary text-3xl" />
              <div className="text-left">
                <p className="font-sans text-primary/80 text-sm font-semibold">
                  Tingkat
                </p>
                <p className="font-sans text-primary/80 text-sm font-semibold">
                  Risiko
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-5xl font-black text-primary">
                {riskScore}
              </p>
              <span className="inline-block bg-[#D97706] text-primary text-xs font-bold px-3 py-1 rounded-full mt-1">
                {riskLevel}
              </span>
            </div>
          </div>
        </div>
        {/* Keywords Card */}
        <div className="bg-primary/10 backdrop-blur-md rounded-3xl p-6 border border-primary/20">
          <div className="flex items-start justify-between h-full">
            <div className="flex items-center gap-3">
              <BiShield className="text-primary text-3xl" />
              <div className="text-left">
                <p className="font-sans text-primary/80 text-sm font-semibold">
                  Kata
                </p>
                <p className="font-sans text-primary/80 text-sm font-semibold">
                  kunci
                </p>
              </div>
            </div>
            <ul className="text-left space-y-1">
              {keywords.map((keyword, i) => (
                <li key={i} className="font-sans text-primary/90 text-sm">
                  • {keyword}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 pt-6 border-t border-primary/20">
        <p className="font-sans text-primary/60 text-xs">
          Kategori: <span className="font-semibold">{category}</span>
        </p>
        <p className="font-sans text-primary/60 text-xs mt-1">
          Terdeteksi pada: <span className="font-semibold">{detectedAt}</span>
        </p>
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary text-secondary font-sans font-bold px-8 py-3 rounded-full hover:bg-primary-light transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
      >
        <BiArrowBack size={20} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className="min-h-screen bg-primary relative overflow-hidden">
      <Navbar />
      {/* Red Semicircle Background */}
      <div className="absolute bottom-0 left-0 w-full h-[85%] bg-secondary rounded-t-[100%] scale-110 pointer-events-none" />
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <Suspense fallback={<div>Loading...</div>}>
          <ResultContent />
        </Suspense>
      </div>
    </main>
  );
}
