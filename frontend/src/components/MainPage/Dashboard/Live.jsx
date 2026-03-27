'use client';

import React from 'react'
import { BiScan } from "react-icons/bi";
import { GoCodescanCheckmark, GoShieldCheck  } from "react-icons/go";
import { AiOutlineWarning } from "react-icons/ai";

const stats = [
  { label: 'Total URLs Scanned',      value: '1,234,356', sub: '+ 1,200 today',       icon: <BiScan size={30} /> },
  { label: 'Gambling Sites Detected', value: '34,700',    sub: '+ 100 today',          icon: <AiOutlineWarning size={30} /> },
  { label: 'Verified Safe Sites',     value: '800,000',   sub: '+ 3,491 today',        icon: <GoShieldCheck size={30} /> },
  { label: 'Active Crawlers',         value: '24/7',      sub: 'All crawlers active',  icon: <GoCodescanCheckmark size={30} /> },
]

export default function Live() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto w-full px-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-3xl border border-[#9E4A36]/10 bg-linear-to-br from-white/80 to-[#F2EEE8]/50 backdrop-blur-xl px-8 py-7 flex items-start justify-between
            transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(61,43,31,0.15)]
        ">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/40 to-transparent italic" />
          
          <div className="flex flex-col gap-1.5 relative z-10">
            <span className="font-sans text-[10px] font-bold text-[#9E4A36]/60 uppercase tracking-[0.2em]">
              {stat.label}
            </span>
            <span className="font-display font-black text-4xl text-[#3d2b1f] tracking-tight group-hover:text-[#9E4A36] transition-colors">
              {stat.value}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="font-sans text-xs text-teal-700/60 font-medium">
                {stat.sub}
              </span>
            </div>
          </div>

          <div className="text-[#3d2b1f]/20 group-hover:text-[#9E4A36]/80 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 my-auto p-3 bg-[#F2EEE8] rounded-2xl border border-white">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  )
}