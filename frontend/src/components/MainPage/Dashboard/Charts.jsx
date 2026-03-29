'use client';
import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const dailyData = [
  { day: '01', value: 420 }, { day: '03', value: 390 }, { day: '05', value: 470 },
  { day: '07', value: 510 }, { day: '09', value: 480 }, { day: '11', value: 540 },
  { day: '13', value: 520 }, { day: '15', value: 580 }, { day: '17', value: 560 },
  { day: '19', value: 610 }, { day: '21', value: 590 }, { day: '23', value: 640 },
  { day: '25', value: 700 }, { day: '27', value: 730 }, { day: '28', value: 760 },
];

const donutData = [
  { label: 'Slot Online',      value: 42, color: '#9E4A36' },
  { label: 'Togel',            value: 25, color: '#3d2b1f' },
  { label: 'Casino',           value: 18, color: '#C5795F' },
  { label: 'Taruhan Olahraga', value: 10, color: '#D4A896' },
  { label: 'Lainnya',          value: 5,  color: '#E8DDD6' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-[#9E4A36]/10 bg-linear-to-br from-white/80 to-[#F2EEE8]/50 backdrop-blur-xl px-4 py-3 shadow-[0_8px_30px_rgba(61,43,31,0.12)]">
      <span className="block font-sans text-[10px] font-bold text-[#9E4A36]/60 uppercase tracking-[0.2em] mb-1">
        {label} Mar
      </span>
      <span className="font-display font-black text-2xl text-[#3d2b1f]">
        {payload[0].value.toLocaleString()}
      </span>
      <span className="font-sans text-[10px] text-[#3d2b1f]/40 ml-1">situs</span>
    </div>
  );
}

function DonutChart({ data, hoveredSlice, setHoveredSlice }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 80;
  const innerR = 50;
  const total = data.reduce((s, d) => s + d.value, 0);

  let cumAngle = -90;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle += angle;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const r = hoveredSlice === i ? outerR + 6 : outerR;
    const x1  = cx + r       * Math.cos(toRad(startAngle));
    const y1  = cy + r       * Math.sin(toRad(startAngle));
    const x2  = cx + r       * Math.cos(toRad(endAngle));
    const y2  = cy + r       * Math.sin(toRad(endAngle));
    const xi1 = cx + innerR  * Math.cos(toRad(startAngle));
    const yi1 = cy + innerR  * Math.sin(toRad(startAngle));
    const xi2 = cx + innerR  * Math.cos(toRad(endAngle));
    const yi2 = cy + innerR  * Math.sin(toRad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi2} ${yi2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1}`,
      'Z',
    ].join(' ');

    return { path, color: d.color, i };
  });

  const active = hoveredSlice !== null ? data[hoveredSlice] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        {slices.map(({ path, color, i }) => (
          <path
            key={i} d={path} fill={color}
            opacity={hoveredSlice !== null && hoveredSlice !== i ? 0.35 : 1}
            style={{ transition: 'all 0.25s ease', cursor: 'pointer' }}
            onMouseEnter={() => setHoveredSlice(i)}
            onMouseLeave={() => setHoveredSlice(null)}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
          fontSize="22" fontWeight="900" fill="#3d2b1f" fontFamily="serif">
          {active ? `${active.value}%` : `${total}%`}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fontWeight="700" fill="#9E4A36" letterSpacing="2"
          style={{ textTransform: 'uppercase' }}>
          {active ? active.label.toUpperCase() : 'TOTAL'}
        </text>
      </svg>

      {/* Legend — icon style matches Live.jsx */}
      <div className="grid grid-cols-1 gap-1.5 w-full">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="flex items-center justify-between px-4 py-2 rounded-2xl cursor-pointer transition-all duration-500 ease-out"
            style={{ background: hoveredSlice === i ? `${d.color}10` : 'transparent' }}
            onMouseEnter={() => setHoveredSlice(i)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="flex items-center gap-2.5">
              {/* dot wrapped like Live icon */}
              <div className="p-1 bg-[#F2EEE8] rounded-lg border border-white">
                <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              </div>
              <span className="font-sans text-xs font-medium text-[#3d2b1f]/60">{d.label}</span>
            </div>
            <span className="font-display font-black text-sm" style={{ color: d.color }}>
              {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Charts() {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">

      {/* ── Area Chart Card — same shell as Live.jsx ── */}
      <div className="group relative overflow-hidden rounded-3xl border border-[#9E4A36]/10 bg-linear-to-br from-white/80 to-[#F2EEE8]/50 backdrop-blur-xl px-8 py-7
        transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(61,43,31,0.15)]">

        {/* Shimmer */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="font-sans text-[10px] font-bold text-[#9E4A36]/60 uppercase tracking-[0.2em]">
              Tren Harian
            </span>
            <span className="font-display font-black text-4xl text-[#3d2b1f] tracking-tight group-hover:text-[#9E4A36] transition-colors">
              Maret 2026
            </span>
          </div>
          {/* Live badge — icon container style from Live.jsx */}
          <div className="flex items-center gap-2 my-auto p-3 bg-[#F2EEE8] rounded-2xl border border-white">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="font-sans text-[10px] font-bold text-teal-700/60 uppercase tracking-[0.2em]">Live</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={dailyData} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#9E4A36" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#9E4A36" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#9E4A36" strokeOpacity={0.06} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#3d2b1f', opacity: 0.35, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#3d2b1f', opacity: 0.30, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9E4A36', strokeWidth: 1, strokeOpacity: 0.2, strokeDasharray: '4 4' }} />
            <Area type="monotoneX" dataKey="value" stroke="#9E4A36" strokeWidth={2.5}
              fill="url(#areaGrad)" dot={false}
              activeDot={{ r: 5, fill: '#9E4A36', stroke: 'white', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Donut Chart Card — same shell as Live.jsx ── */}
      <div className="group relative overflow-hidden rounded-3xl border border-[#9E4A36]/10 bg-linear-to-br from-white/80 to-[#F2EEE8]/50 backdrop-blur-xl px-8 py-7
        transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(61,43,31,0.15)]">

        {/* Shimmer */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        <div className="flex flex-col gap-1.5 mb-8 relative z-10">
          <span className="font-sans text-[10px] font-bold text-[#9E4A36]/60 uppercase tracking-[0.2em]">
            Distribusi
          </span>
          <span className="font-display font-black text-4xl text-[#3d2b1f] tracking-tight group-hover:text-[#9E4A36] transition-colors">
            Kategori Situs Judi
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="shrink-0">
            <DonutChart data={donutData} hoveredSlice={hoveredSlice} setHoveredSlice={setHoveredSlice} />
          </div>

          {/* Progress bars */}
          <div className="flex-1 grid grid-cols-1 gap-3 w-full">
            {donutData.map((d, i) => (
              <div
                key={d.label}
                className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border transition-all duration-500 ease-out cursor-pointer"
                style={{
                  borderColor: hoveredSlice === i ? d.color : 'transparent',
                  background:  hoveredSlice === i ? `${d.color}08` : 'rgba(255,255,255,0.5)',
                }}
                onMouseEnter={() => setHoveredSlice(i)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex-1 h-1.5 rounded-full bg-[#F2EEE8] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-sans text-xs font-medium text-[#3d2b1f]/60 truncate">{d.label}</span>
                  <span className="font-display font-black text-base shrink-0" style={{ color: d.color }}>
                    {d.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}