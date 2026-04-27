'use client';
import React from 'react';
import { BiScan } from "react-icons/bi";
import { GoShieldCheck } from "react-icons/go";
import { AiOutlineWarning } from "react-icons/ai";
import { GoCodescanCheckmark } from "react-icons/go";

const stats = [
  {
    label: 'Total URLs',
    sublabel: 'Scanned',
    value: '1,234,356',
    sub: '+ 1,200 today',
    badge: 'Live',
    badgeColor: 'teal',
    icon: <BiScan size={22} />,
  },
  {
    label: 'Gambling Sites',
    sublabel: 'Detected',
    value: '34,700',
    sub: '+ 100 today',
    badge: 'Aktif',
    badgeColor: 'red',
    icon: <AiOutlineWarning size={22} />,
  },
  {
    label: 'Verified',
    sublabel: 'Safe Sites',
    value: '800,000',
    sub: '+ 3,491 today',
    badge: 'Aman',
    badgeColor: 'teal',
    icon: <GoShieldCheck size={22} />,
  },
  {
    label: 'Active',
    sublabel: 'Crawlers',
    value: '24/7',
    sub: 'All crawlers active',
    badge: 'Online',
    badgeColor: 'teal',
    icon: <GoCodescanCheckmark size={22} />,
  },
];

const badgeStyles = {
  red: 'bg-secondary text-primary',
  teal: 'bg-teal text-primary',
  green: 'bg-teal-dark text-primary',
};

export default function Live() {
  return (
    <section className="w-full py-20 px-6">
      {/* Header Section */}
      <div className="text-center mb-14">
        <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-secondary/50 block mb-3">
          Live Statistics
        </span>
        <h2 className="font-display font-black text-4xl sm:text-5xl text-deep-earth tracking-tight">
          Statistik <span className="italic text-secondary">Real-time</span>
        </h2>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group relative rounded-3xl overflow-hidden border border-secondary/10 bg-primary shadow-sm"
          >
            {/* Red Arch Background */}
            <div className="absolute top-0 left-0 right-0 h-[75%] bg-secondary rounded-b-[50%] z-0" />

            {/* Card Content */}
            <div className="relative z-10 px-8 pt-8 pb-6 flex flex-col h-full">
              
              {/* Top: Icon & Sublabel */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-primary/90">
                  {stat.icon}
                </div>
                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 mt-1">
                  {stat.sublabel}
                </span>
              </div>

              {/* Middle: Label & Value */}
              <div className="text-center my-auto">
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70">
                  {stat.label}
                </p>
                <span className="font-display font-black italic text-5xl text-primary leading-none drop-shadow-md">
                  {stat.value}
                </span>
              </div>

              {/* Bottom: Sub & Badge */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary/10">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_6px_rgba(161,37,33,0.6)]" />
                  <span className="font-sans text-xs text-deep-earth/70 font-medium">
                    {stat.sub}
                  </span>
                </div>
                <span className={`font-sans text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${badgeStyles[stat.badgeColor]}`}>
                  {stat.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}