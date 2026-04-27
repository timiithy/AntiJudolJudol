"use client";

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-center px-8 py-5">
      <div className="flex items-center gap-1 bg-primary-light backdrop-blur-md rounded-full px-2 py-2 shadow-sm border border-secondary/10">

        {/* Utama - Active */}
        <Link
          href="/"
          className="bg-secondary text-primary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200"
        >
          Home
        </Link>

        {/* Dashboard */}
        <Link
          href="#dashboard"
          className="text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:bg-secondary/5"
        >
          Database
        </Link>

        {/* Statistics */}
        <Link
          href="#faq"
          className="flex items-center gap-2 text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:bg-secondary/5"
        >
          Statistics
        </Link>

        {/* Export */}
        <Link
          href="#faq"
          className="flex items-center gap-2 text-deep-earth/70 hover:text-secondary font-sans font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:bg-secondary/5"
        >
          Export
        </Link>
      </div>
    </nav>
  );
}