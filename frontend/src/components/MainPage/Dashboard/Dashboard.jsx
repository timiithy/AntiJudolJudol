import React from 'react'
import Live from './Live'
import Table from './Table'
import Charts from './Charts'
import WordCloud from './WordCloud'

export default function Dashboard() {
  return (
    <section className="w-full relative min-h-screen py-20 flex flex-col gap-16 overflow-hidden bg-primary/40">
      
      {/* Background Decor - Updated with new palette */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-gradient-radial from-primary-light/40 to-transparent opacity-60 pointer-events-none" />
      <div className="absolute -right-32 top-48 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />
      <div className="absolute -left-32 bottom-48 w-96 h-96 bg-teal/10 blur-[120px] rounded-full" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col gap-20">
        
        {/* Hero Section: Live Statistics */}
        <div id="live-statistics" className="flex flex-col gap-10">
          <Live />
        </div>

        {/* Section Wrapper */}
        <div className="grid grid-cols-1 gap-16">
          
          {/* Keyword Cloud */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <h2 className="font-display font-bold text-2xl text-deep-earth whitespace-nowrap">
                Keyword Cloud
              </h2>
              <div className="h-0.5 w-full bg-linear-to-r from-secondary/25 to-transparent" />
            </div>
            <WordCloud />
          </div>

          {/* Blacklist Database */}
          <div id="blacklist-database" className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <h2 className="font-display font-bold text-2xl text-deep-earth whitespace-nowrap">
                Blacklist Database
              </h2>
              <div className="h-0.5 w-full bg-linear-to-r from-secondary/25 to-transparent" />
            </div>
            <div className="bg-primary/60 backdrop-blur-sm rounded-4xl p-2 border border-secondary/15 shadow-sm">
               <Table />
            </div>
          </div>

          {/* Detection Trends */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <h2 className="font-display font-bold text-2xl text-deep-earth whitespace-nowrap">
                Detection Trends
              </h2>
              <div className="h-0.5 w-full bg-linear-to-r from-secondary/25 to-transparent" />
            </div>
            <Charts />
          </div>

        </div>
      </div>
    </section>
  )
}