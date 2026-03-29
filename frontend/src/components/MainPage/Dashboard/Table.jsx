'use client';
import React, { useState } from 'react';
import { BiExport, BiLinkExternal } from 'react-icons/bi';
import { AiOutlineWarning } from 'react-icons/ai';

const tableData = [
  { url: 'slot-gacor88.xyz',      deteksi: '2026-03-09', kategori: 'Slot Online',      risiko: 'Tinggi', status: 'Aktif' },
  { url: 'jp-maxwin777.net',      deteksi: '2026-03-09', kategori: 'Togel',            risiko: 'Tinggi', status: 'Aktif' },
  { url: 'judol-terpercaya.com',  deteksi: '2026-03-08', kategori: 'Casino',           risiko: 'Tinggi', status: 'Diblokir' },
  { url: 'bonus-harian99.site',   deteksi: '2026-03-08', kategori: 'Slot Online',      risiko: 'Sedang', status: 'Aktif' },
  { url: 'scatter-hitam.pro',     deteksi: '2026-03-07', kategori: 'Slot Online',      risiko: 'Tinggi', status: 'Aktif' },
  { url: 'togel-sgp-hk.info',    deteksi: '2026-03-07', kategori: 'Togel',            risiko: 'Tinggi', status: 'Diblokir' },
  { url: 'rtp-live-hari-ini.cc',  deteksi: '2026-03-06', kategori: 'Slot Online',      risiko: 'Sedang', status: 'Aktif' },
  { url: 'bandar-bola138.org',    deteksi: '2026-03-06', kategori: 'Taruhan Olahraga', risiko: 'Tinggi', status: 'Aktif' },
];

const badgeBase =
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border';

const risikoConfig = {
  Tinggi: { dot: 'bg-red-500',   text: 'text-red-700',   bg: 'bg-red-50 border-red-200' },
  Sedang: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
};

const statusConfig = {
  Aktif:    { dot: 'bg-teal-500 animate-pulse', text: 'text-teal-700',  bg: 'bg-teal-50 border-teal-200' },
  Diblokir: { dot: 'bg-[#9E4A36]',              text: 'text-[#9E4A36]', bg: 'bg-[#9E4A36]/10 border-[#9E4A36]/30' },
};

export default function Table() {
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="font-sans text-[10px] font-bold text-[#9E4A36]/60 uppercase tracking-[0.2em]">
            {tableData.length} situs terdeteksi
          </span>
        </div>

        {/* Export button — same pattern as Live card */}
        <button className="group relative overflow-hidden flex items-center gap-2 rounded-2xl border border-[#9E4A36]/10 bg-linear-to-br from-white/80 to-[#F2EEE8]/50 backdrop-blur-xl px-4 py-2
          transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(61,43,31,0.15)]">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="p-1 bg-[#F2EEE8] rounded-lg border border-white text-[#3d2b1f]/20 group-hover:text-[#9E4A36]/80 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <BiExport size={13} />
          </div>
          <span className="font-sans text-[10px] font-bold text-[#9E4A36]/60 uppercase tracking-[0.2em] relative z-10">
            Export CSV
          </span>
        </button>
      </div>

      {/* TABLE CARD — same shell as Live.jsx */}
      <div className="group relative overflow-hidden rounded-3xl border border-[#9E4A36]/10 bg-linear-to-br from-white/80 to-[#F2EEE8]/50 backdrop-blur-xl
        transition-all duration-500 ease-out hover:shadow-[0_20px_40px_-15px_rgba(61,43,31,0.15)]">

        {/* Shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/40 to-transparent pointer-events-none z-10" />

        {/* HEAD */}
        <div className="grid grid-cols-[2fr_1fr_1.2fr_0.8fr_0.8fr] px-8 py-4 border-b border-[#9E4A36]/10">
          {['URL', 'Terdeteksi', 'Kategori', 'Risiko', 'Status'].map((col) => (
            <span key={col} className="font-sans text-[10px] font-bold text-[#9E4A36]/60 uppercase tracking-[0.2em]">
              {col}
            </span>
          ))}
        </div>

        {/* ROWS */}
        <div className="divide-y divide-[#9E4A36]/5">
          {tableData.map((row, i) => {
            const risiko = risikoConfig[row.risiko];
            const status = statusConfig[row.status];
            const isHovered = hoveredRow === i;

            return (
              <div
                key={row.url}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`grid grid-cols-[2fr_1fr_1.2fr_0.8fr_0.8fr] px-8 py-4 items-center cursor-pointer transition-all duration-500 ease-out
                  ${isHovered ? 'bg-white/60' : 'bg-transparent'}`}
              >
                {/* URL */}
                <div className="flex items-center gap-3">
                  {/* Icon — same pattern: p-3 bg-[#F2EEE8] rounded-2xl border border-white */}
                  <div className={`p-1.5 bg-[#F2EEE8] rounded-2xl border border-white transition-all duration-500
                    ${isHovered ? 'text-[#9E4A36]/80 scale-110 rotate-6' : 'text-[#3d2b1f]/20'}`}
                  >
                    <AiOutlineWarning size={14} />
                  </div>
                  <span className="font-mono text-sm font-medium text-[#3d2b1f] tracking-tight truncate">
                    {row.url}
                  </span>
                  {isHovered && <BiLinkExternal size={13} className="text-[#9E4A36]/40 shrink-0" />}
                </div>

                {/* DATE */}
                <span className="font-sans text-xs font-medium text-[#3d2b1f]/40 tracking-wide">
                  {row.deteksi}
                </span>

                {/* CATEGORY */}
                <span className="font-sans text-xs text-[#3d2b1f]/60">
                  {row.kategori}
                </span>

                {/* RISK */}
                <span className={`${badgeBase} ${risiko.bg} ${risiko.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${risiko.dot}`} />
                  {row.risiko}
                </span>

                {/* STATUS */}
                <span className={`${badgeBase} ${status.bg} ${status.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {row.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t border-[#9E4A36]/10 flex items-center justify-between">
          <span className="font-sans text-[10px] font-bold text-[#9E4A36]/40 uppercase tracking-[0.2em]">
            Menampilkan {tableData.length} data
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-xl text-[10px] font-bold transition-all duration-300
                  ${p === 1
                    ? 'bg-[#9E4A36] text-white'
                    : 'font-sans text-[#9E4A36]/40 hover:bg-white hover:text-[#9E4A36] border border-transparent hover:border-[#9E4A36]/10'}
                `}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}