'use client';
import React, { useEffect, useMemo, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function scaleFont(count, minCount, maxCount) {
  if (maxCount === minCount) return 24;
  const minSize = 12;
  const maxSize = 42;
  const ratio = (count - minCount) / (maxCount - minCount);
  return Math.round(minSize + ratio * (maxSize - minSize));
}

function buildPalette(count) {
  const colors = [
    'var(--secondary)',
    'var(--deep-earth)',
    'var(--secondary-light)',
    'var(--primary-dim)',
    'var(--teal)',
  ];
  return colors[count % colors.length];
}

export default function WordCloud() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadKeywords = async () => {
      try {
        setIsLoading(true);
        setError('');

        const res = await fetch(`${BACKEND_URL}/api/dashboard/keywords`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Gagal mengambil data keyword');
        }

        const json = await res.json();
        if (!Array.isArray(json)) {
          throw new Error('Format data keyword tidak valid');
        }

        if (isActive) {
          setData(json);
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

    loadKeywords();
    return () => {
      isActive = false;
    };
  }, []);

  const words = useMemo(() => {
    if (!data.length) return [];
    const counts = data.map((item) => item.count || 0);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    return data.map((item, index) => ({
      keyword: item.keyword,
      count: item.count,
      size: scaleFont(item.count, minCount, maxCount),
      color: buildPalette(index),
      tilt: index % 3 === 0 ? '-6deg' : index % 3 === 1 ? '0deg' : '6deg',
    }));
  }, [data]);

  return (
    <div className="w-full rounded-[2.5rem] border-4 border-primary bg-linear-to-br from-primary to-primary/70 overflow-hidden relative shadow-[inset_0_2px_10px_rgba(161,37,33,0.03),0_10px_30px_rgba(161,37,33,0.08)]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--secondary) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative z-10 p-8 min-h-[320px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="block font-sans text-[10px] font-bold text-secondary/60 uppercase tracking-[0.25em]">
              Keyword Cloud
            </span>
            <h3 className="font-display font-black text-3xl text-deep-earth">
              Kata Kunci Terpopuler
            </h3>
          </div>
          <div className="text-right">
            <span className="font-sans text-[10px] font-bold text-secondary/50 uppercase tracking-[0.2em]">
              {data.length} keyword
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-sans text-xs text-secondary/60 uppercase tracking-[0.2em]">
              Memuat data...
            </span>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-sans text-xs text-secondary/70 uppercase tracking-[0.2em]">
              {error}
            </span>
          </div>
        ) : words.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-sans text-xs text-secondary/60 uppercase tracking-[0.2em]">
              Belum ada keyword terdeteksi
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {words.map((word) => (
              <span
                key={`${word.keyword}-${word.count}`}
                className="font-display font-black tracking-wide text-deep-earth/90"
                style={{
                  fontSize: `${word.size}px`,
                  color: word.color,
                  transform: `rotate(${word.tilt})`,
                  textTransform: 'capitalize',
                }}
                title={`${word.keyword} (${word.count})`}
              >
                {word.keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
