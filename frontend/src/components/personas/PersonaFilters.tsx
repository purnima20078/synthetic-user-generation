import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, HelpCircle, X, Lightbulb } from 'lucide-react';

interface PersonaFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedSegment: string;
  onSegmentChange: (segment: string) => void;
  segments: string[];
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalCount: number;
}

export function PersonaFilters({
  search,
  onSearchChange,
  selectedSegment,
  onSegmentChange,
  segments,
  sortBy,
  onSortChange,
  totalCount,
}: PersonaFiltersProps) {
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, occupation, location, quotes..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950/60 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segment Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSegment}
              onChange={(e) => onSegmentChange(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Segments ({totalCount})</option>
              {segments.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="age_asc">Age: Young to Old</option>
              <option value="age_desc">Age: Old to Young</option>
              <option value="openness">High Openness</option>
              <option value="conscientiousness">High Conscientiousness</option>
              <option value="extraversion">High Extraversion</option>
              <option value="agreeableness">High Agreeableness</option>
              <option value="neuroticism">High Neuroticism</option>
            </select>
          </div>

          {/* Tips Toggle */}
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              showTips
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Toggle filtering and sorting guidance"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${showTips ? 'text-amber-300' : 'text-amber-400'}`} />
            <span>Help & Tips</span>
          </button>
        </div>
      </div>

      {/* Non-intrusive Help/Tips Overlay / Box */}
      {showTips && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-xs text-slate-300 flex items-start gap-3 shadow-lg relative animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Guide to Segment Filtering & Sorting</span>
              <button
                onClick={() => setShowTips(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss tips"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Use these tools to zero in on precise target cohorts for your synthetic market research:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-200">Segment Filtering:</strong> Group personas by specific behavioral verticals (e.g. Enterprise Buyers, Gen Z, Tech Enthusiasts) to analyze niche adoption readiness.
              </li>
              <li>
                <strong className="text-slate-200">Psychometric & Age Sorting:</strong> Sort by Big-Five OCEAN traits (Openness, Conscientiousness, etc.) or age brackets to test resilience, risk tolerance, and UX preference variations.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
