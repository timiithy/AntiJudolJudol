'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { BiExport, BiLinkExternal } from 'react-icons/bi';
import { AiOutlineWarning } from 'react-icons/ai';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const risikoConfig = {
  Tinggi: { dot: 'bg-secondary',  text: 'text-secondary',  bg: 'bg-secondary/10 border-secondary/25' },
  Sedang: { dot: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  Rendah: { dot: 'bg-teal-500',   text: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200' },
};

const COLUMNS = ['URL', 'Nama Situs', 'Skor Risiko', 'Kategori'];
const SUITS = ['♠', '♥', '♣', '♦'];

const mapRiskLabel = (riskScore) => {
  const numeric = Number(riskScore ?? 0);
  const normalized = numeric > 1 ? numeric / 100 : numeric;

  if (normalized >= 0.7) return 'Tinggi';
  if (normalized >= 0.4) return 'Sedang';
  return 'Rendah';
};

export default function Table() {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadRows = async () => {
      try {
        setIsLoading(true);
        setError('');

        const res = await fetch(
          `${BACKEND_URL}/api/sites/gambling-sites?page=${page}&limit=8`,
          { cache: 'no-store' }
        );

        if (!res.ok) {
          throw new Error('Gagal mengambil data blacklist');
        }

        const json = await res.json();
        if (!json || !Array.isArray(json.data)) {
          throw new Error('Format data blacklist tidak valid');
        }

        if (isActive) {
          setRows(json.data);
          setTotal(json.total || 0);
          setTotalPages(json.total_pages || 1);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || 'Terjadi kesalahan');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadRows();
    return () => {
      isActive = false;
    };
  }, [page]);

  const pageButtons = useMemo(() => {
    const maxButtons = 5;
    const start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    const adjustedStart = Math.max(1, end - maxButtons + 1);

    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  }, [page, totalPages]);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="font-sans text-[10px] font-bold text-secondary/60 uppercase tracking-[0.2em]">
            {total} situs terdeteksi
          </span>
        </div>

        {/* Export button */}
        <a
          href={`${BACKEND_URL}/api/sites/gambling-sites/export`}
          className="flex items-center gap-2 rounded-full border border-secondary/25 bg-primary px-4 py-2 transition-colors duration-200 hover:bg-secondary/5"
        >
          <BiExport size={13} className="text-secondary/60" />
          <span className="font-sans text-[10px] font-bold text-secondary/60 uppercase tracking-[0.2em]">
            Export CSV
          </span>
        </a>
      </div>

      {/* ── Table card ── */}
      <div className="rounded-2xl border border-secondary/20 overflow-hidden bg-primary">

        {/* Ornate top border strip */}
        <div className="h-1 w-full bg-secondary" />

        {/* Column header */}
        <div className="grid grid-cols-[2.2fr_1.6fr_0.9fr_0.9fr] px-8 py-3 border-b border-secondary/15 bg-secondary/5">
          {COLUMNS.map((col, i) => (
            <span
              key={col}
              className="flex items-center gap-1.5 font-sans text-[10px] font-bold text-secondary/70 uppercase tracking-[0.2em] pr-4 border-r border-secondary/10 last:border-r-0"
            >
              <span className="text-secondary/30 font-display">{SUITS[i % SUITS.length]}</span>
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-secondary/10">
          {isLoading ? (
            <div className="px-8 py-10 text-center">
              <span className="font-sans text-[10px] font-bold text-secondary/60 uppercase tracking-[0.2em]">
                Memuat data...
              </span>
            </div>
          ) : error ? (
            <div className="px-8 py-10 text-center">
              <span className="font-sans text-[10px] font-bold text-secondary/70 uppercase tracking-[0.2em]">
                {error}
              </span>
            </div>
          ) : rows.length === 0 ? (
            <div className="px-8 py-10 text-center">
              <span className="font-sans text-[10px] font-bold text-secondary/60 uppercase tracking-[0.2em]">
                Belum ada data blacklist
              </span>
            </div>
          ) : (
            rows.map((row, i) => {
              const risikoLabel = mapRiskLabel(row.risk_score);
              const risiko = risikoConfig[risikoLabel];
              const isHovered = hoveredRow === i;

              return (
                <div
                  key={`${row.id_process}-${row.url}`}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`grid grid-cols-[2.2fr_1.6fr_0.9fr_0.9fr] px-8 py-4 items-center cursor-pointer transition-colors duration-200
                    ${isHovered ? 'bg-secondary/5' : 'bg-transparent'}`}
                >
                  {/* URL */}
                  <div className="flex items-center gap-3 pr-4 border-r border-secondary/10 min-w-0">
                    <AiOutlineWarning size={14} className="text-secondary/30 shrink-0" />
                    <span className="font-mono text-sm font-medium text-deep-earth tracking-tight truncate min-w-0">
                      {row.url}
                    </span>
                    {isHovered && <BiLinkExternal size={12} className="text-secondary/40 shrink-0" />}
                  </div>

                  {/* Nama situs */}
                  <span className="font-sans text-xs text-deep-earth/60 truncate pr-4 border-r border-secondary/10 min-w-0">
                    {row.html_title || 'Tanpa judul'}
                  </span>

                  {/* Skor risiko */}
                  <span className="font-sans text-xs text-deep-earth/60 pr-4 border-r border-secondary/10 min-w-0 truncate">
                    {Number(row.risk_score ?? 0).toFixed(2)}
                  </span>

                  {/* Kategori */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border w-fit ${risiko.bg} ${risiko.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${risiko.dot}`} />
                    {risikoLabel}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-secondary/15 bg-secondary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-px w-6 bg-secondary/20" />
            <span className="font-sans text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em]">
              Menampilkan {rows.length} data
            </span>
            <div className="h-px w-6 bg-secondary/20" />
          </div>

          {/* Pagination */}
          <div className="flex gap-1.5">
            {pageButtons.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-full text-[10px] font-bold font-sans transition-colors duration-200
                  ${p === page
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