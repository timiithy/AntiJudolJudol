"use client";

import Link from 'next/link';
import { GiShield } from 'react-icons/gi';
import { HiDatabase } from 'react-icons/hi';
import { HiOutlinePresentationChartBar, HiOutlineArrowUpTray } from 'react-icons/hi2';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-8 py-4 flex items-center justify-between 
      bg-primary/80 backdrop-blur-md border-b border-secondary/10 shadow-xs">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-103 duration-500">
        <div className="p-2 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors">
          <GiShield className="text-secondary text-2xl" />
        </div>
        <span className="font-display font-black text-2xl text-deep-earth tracking-tighter">
          Maxwin<span className="text-secondary">77</span>
        </span>
      </Link>

      <div className="flex items-center gap-8">
        <Link
          href="#history"
          className="flex items-center gap-2 text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm transition-all group"
        >
          <HiDatabase className="text-lg opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          <span className="tracking-wide">Database</span>
        </Link>

        <Link
          href="#statistics"
          className="flex items-center gap-2 text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm transition-all group"
        >
          <HiOutlinePresentationChartBar className="text-lg opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          <span className="tracking-wide">Statistics</span>
        </Link>

        <Link
          href="#export-data"
          className="flex items-center gap-2 bg-secondary text-primary px-6 py-2.5 rounded-full font-sans font-bold text-sm shadow-md shadow-secondary/20
            hover:bg-secondary-dark hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <HiOutlineArrowUpTray className="text-lg" />
          <span>Export</span>
        </Link>
      </div>
    </nav>
  );
}