import React from 'react';
import { Workspace, Persona, Survey, Interview, InsightsReport } from '../../types';
import { AvatarImage } from '../../utils/avatar';
import {
  Users,
  ClipboardList,
  MessageSquare,
  Award,
  Sparkles,
  Plus,
  Play,
  ArrowRight,
  Target,
  Brain,
} from 'lucide-react';

interface OverviewDashboardProps {
  workspace: Workspace;
  personas: Persona[];
  surveys: Survey[];
  interviews: Interview[];
  insights: InsightsReport | null;
  onGeneratePersonas: (count: number) => void;
  onOpenGenerateModal?: () => void;
  onSeedDemo: (count?: number) => void;
  onNavigate: (view: 'dashboard' | 'personas' | 'surveys' | 'interviews' | 'would-use' | 'insights' | 'reports') => void;
}

export function OverviewDashboard({
  workspace,
  personas,
  surveys,
  interviews,
  insights,
  onGeneratePersonas,
  onOpenGenerateModal,
  onSeedDemo,
  onNavigate,
}: OverviewDashboardProps) {
  const viabilityScore = insights?.viability_score?.score ?? insights?.validation_score ?? 78;

  // Compute segment breakdown
  const segmentCounts: Record<string, number> = {};
  personas.forEach((p) => {
    const seg = p.segment || 'General';
    segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Hero Workspace Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Active Research Study
              </span>
              <span className="text-xs text-slate-400">• {personas.length} Synthetic Agents Generated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {workspace.product_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {workspace.product_description}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Audience: <strong>{workspace.target_audience.occupation}</strong> ({workspace.target_audience.age_range[0]}–{workspace.target_audience.age_range[1]} yrs)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Objective: <strong>{workspace.research_objective.slice(0, 60)}...</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => {
                if (onOpenGenerateModal) {
                  onOpenGenerateModal();
                } else {
                  onGeneratePersonas(10);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" /> Generate Personas...
            </button>
            <button
              onClick={() => onSeedDemo(50)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-indigo-400" /> Populate 50 Demo Cohort
            </button>
            <button
              onClick={() => onNavigate('surveys')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/60 flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" /> Run Survey Mode
            </button>
            <button
              onClick={() => onNavigate('would-use')}
              className="px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" /> "Would Use" Score
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('personas')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cohort Population</span>
            <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{personas.length}</div>
          <p className="text-[11px] text-slate-400">Active synthetic personas in character</p>
        </div>

        <div
          onClick={() => onNavigate('surveys')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Survey Runs</span>
            <ClipboardList className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{surveys.length}</div>
          <p className="text-[11px] text-slate-400">Structured question sets answered</p>
        </div>

        <div
          onClick={() => onNavigate('interviews')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">1-on-1 Interviews</span>
            <MessageSquare className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{interviews.length}</div>
          <p className="text-[11px] text-slate-400">Multi-turn deep qualitative chats</p>
        </div>

        <div
          onClick={() => onNavigate('insights')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Viability Score</span>
            <Award className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {viabilityScore}
            <span className="text-lg text-slate-500 font-normal">/100</span>
          </div>
          <p className="text-[11px] text-slate-400">Validated product-market fit index</p>
        </div>
      </div>

      {/* Cohort Segments & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Segments Breakdown */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Segment Distribution
            </h3>
            <span className="text-xs text-slate-400">{Object.keys(segmentCounts).length} Segments</span>
          </div>

          <div className="space-y-3">
            {Object.entries(segmentCounts).map(([seg, count]) => {
              const pct = Math.round((count / (personas.length || 1)) * 100);
              return (
                <div key={seg} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{seg}</span>
                    <span className="text-indigo-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('personas')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              Browse All Personas & Memory Timelines <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Featured Persona Spotlights */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Cohort Agent Sample
            </h3>
            <button
              onClick={() => onNavigate('personas')}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              View Full Grid ({personas.length}) →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {personas.slice(0, 4).map((p) => (
              <div
                key={p._id}
                onClick={() => onNavigate('personas')}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center gap-3">
                  <AvatarImage seed={p.avatar_seed || p.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-xs truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {p.age}y • {p.occupation}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-bold">
                    {p.segment}
                  </span>
                </div>

                {p.quote && (
                  <p className="text-[11px] italic text-slate-300 line-clamp-2">
                    "{p.quote}"
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Each persona maintains an OCEAN psychological profile and conversational memory.</span>
            <button
              onClick={() => onNavigate('interviews')}
              className="text-cyan-400 hover:underline font-bold"
            >
              Start 1-on-1 Interview →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
