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
  { url: 'togel-sgp-hk.info',     deteksi: '2026-03-07', kategori: 'Togel',            risiko: 'Tinggi', status: 'Diblokir' },
  { url: 'rtp-live-hari-ini.cc',  deteksi: '2026-03-06', kategori: 'Slot Online',      risiko: 'Sedang', status: 'Aktif' },
  { url: 'bandar-bola138.org',    deteksi: '2026-03-06', kategori: 'Taruhan Olahraga', risiko: 'Tinggi', status: 'Aktif' },
];

const risikoConfig = {
  Tinggi: { dot: 'bg-secondary',  text: 'text-secondary',  bg: 'bg-secondary/10 border-secondary/25' },
  Sedang: { dot: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
};

const statusConfig = {
  Aktif:    { dot: 'bg-teal-500 animate-pulse', text: 'text-teal-700',  bg: 'bg-teal-50 border-teal-200' },
  Diblokir: { dot: 'bg-secondary',              text: 'text-secondary', bg: 'bg-secondary/10 border-secondary/25' },
};

const COLUMNS = ['URL', 'Terdeteksi', 'Kategori', 'Risiko', 'Status'];
const SUITS = ['♠', '♥', '♣', '♦'];

export default function Table() {
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="font-sans text-[10px] font-bold text-secondary/60 uppercase tracking-[0.2em]">
            {tableData.length} situs terdeteksi
          </span>
        </div>

        {/* Export button */}
        <button className="flex items-center gap-2 rounded-full border border-secondary/25 bg-primary px-4 py-2 transition-colors duration-200 hover:bg-secondary/5">
          <BiExport size={13} className="text-secondary/60" />
          <span className="font-sans text-[10px] font-bold text-secondary/60 uppercase tracking-[0.2em]">
            Export CSV
          </span>
        </button>
      </div>

      {/* ── Table card ── */}
      <div className="rounded-2xl border border-secondary/20 overflow-hidden bg-primary">

        {/* Ornate top border strip */}
        <div className="h-1 w-full bg-secondary" />

        {/* Column header */}
        <div className="grid grid-cols-[2fr_1fr_1.2fr_0.8fr_0.8fr] px-8 py-3 border-b border-secondary/15 bg-secondary/5">
          {COLUMNS.map((col, i) => (
            <span key={col} className="flex items-center gap-1.5 font-sans text-[10px] font-bold text-secondary/70 uppercase tracking-[0.2em]">
              <span className="text-secondary/30 font-display">{SUITS[i % SUITS.length]}</span>
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-secondary/10">
          {tableData.map((row, i) => {
            const risiko = risikoConfig[row.risiko];
            const status = statusConfig[row.status];
            const isHovered = hoveredRow === i;

            return (
              <div
                key={row.url}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`grid grid-cols-[2fr_1fr_1.2fr_0.8fr_0.8fr] px-8 py-4 items-center cursor-pointer transition-colors duration-200
                  ${isHovered ? 'bg-secondary/5' : 'bg-transparent'}`}
              >
                {/* URL */}
                <div className="flex items-center gap-3">
                  <AiOutlineWarning size={14} className="text-secondary/30 shrink-0" />
                  <span className="font-mono text-sm font-medium text-deep-earth tracking-tight truncate">
                    {row.url}
                  </span>
                  {isHovered && <BiLinkExternal size={12} className="text-secondary/40 shrink-0" />}
                </div>

                {/* Date */}
                <span className="font-sans text-xs text-deep-earth/40 tracking-wide">
                  {row.deteksi}
                </span>

                {/* Category */}
                <span className="font-sans text-xs text-deep-earth/60">
                  {row.kategori}
                </span>

                {/* Risk badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border w-fit ${risiko.bg} ${risiko.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${risiko.dot}`} />
                  {row.risiko}
                </span>

                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border w-fit ${status.bg} ${status.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {row.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-secondary/15 bg-secondary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-px w-6 bg-secondary/20" />
            <span className="font-sans text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em]">
              Menampilkan {tableData.length} data
            </span>
            <div className="h-px w-6 bg-secondary/20" />
          </div>

          {/* Pagination */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-full text-[10px] font-bold font-sans transition-colors duration-200
                  ${p === 1
                    ? 'bg-secondary text-primary'
                    : 'text-secondary/50 border border-secondary/20 hover:bg-secondary/10'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Ornate bottom border strip */}
        <div className="h-1 w-full bg-secondary" />
      </div>

      {/* Bottom suit ornament */}
      <div className="flex items-center justify-center gap-2 mt-5">
        <div className="h-px w-12 bg-secondary/15" />
        <span className="text-secondary/20 font-display text-sm tracking-widest select-none">♠ ♥ ♣ ♦</span>
        <div className="h-px w-12 bg-secondary/15" />
      </div>

    </div>
  );
}