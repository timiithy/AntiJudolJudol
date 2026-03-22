"use client";

import React from 'react';
import { GiShield } from 'react-icons/gi'; 
import { HiDatabase } from 'react-icons/hi'; 
import { HiOutlinePresentationChartBar, HiOutlineArrowUpTray } from 'react-icons/hi2';

export default function Navbar() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#FFF5E9] border-b border-[#EEDCC6] z-50 px-8 py-3 flex items-center justify-between shadow-sm">
      
      <div 
        className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <GiShield className="text-[#7B3F1D] text-2xl" />
        <span className="text-[#1A365D] font-bold text-xl tracking-tight">
          AntiJudolJudol
        </span>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => scrollToSection('history')}
          className="flex items-center gap-2 text-[#4A5568] hover:text-[#7B3F1D] font-medium transition-all group"
        >
          <HiDatabase className="text-xl group-hover:scale-110 transition-transform" />
          <span>Blacklist Database</span>
        </button>
        
        <button 
          onClick={() => scrollToSection('statistics')}
          className="flex items-center gap-2 text-[#4A5568] hover:text-[#7B3F1D] font-medium transition-all group"
        >
          <HiOutlinePresentationChartBar className="text-xl group-hover:scale-110 transition-transform" />
          <span>Statistics</span>
        </button>

        <button 
          onClick={() => scrollToSection('export-data')}
          className="flex items-center gap-2 bg-[#7B3F1D] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#5E2F16] hover:shadow-lg active:scale-95 transition-all"
        >
          <HiOutlineArrowUpTray className="text-lg" />
          <span>Export Data</span>
        </button>
      </div>
    </nav>
  );
}