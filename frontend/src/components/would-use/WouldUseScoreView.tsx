import React, { useState, useEffect } from 'react';
import { WouldUseScoreData, WouldUsePersonaResult } from '../../types';
import { api } from '../../services/api';
import { AvatarImage } from '../../utils/avatar';
import { playNotificationChime } from '../../utils/audio';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Zap,
  Target,
  Users,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';

interface WouldUseScoreViewProps {
  workspaceId: string;
  productName: string;
  soundEnabled?: boolean;
  onNavigateToPersonas?: () => void;
}

export function WouldUseScoreView({
  workspaceId,
  productName,
  soundEnabled = true,
  onNavigateToPersonas,
}: WouldUseScoreViewProps) {
  const [data, setData] = useState<WouldUseScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'all' | 'Definite Yes' | 'Maybe / Conditional' | 'Unlikely / Pass'>('all');
  const [selectedPersona, setSelectedPersona] = useState<WouldUsePersonaResult | null>(null);

  const fetchScore = async () => {
    try {
      setLoading(true);
      const res = await api.getWouldUseScore(workspaceId);
      setData(res);
      if (res.persona_results && res.persona_results.length > 0 && !selectedPersona) {
        setSelectedPersona(res.persona_results[0]);
      }
    } catch (err: any) {
      console.warn('Notice loading would-use score:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchScore();
    }
  }, [workspaceId]);

  const handleRecalculate = async () => {
    try {
      setEvaluating(true);
      const res = await api.evaluateWouldUseScore(workspaceId);
      setData(res);
      if (res.persona_results && res.persona_results.length > 0) {
        setSelectedPersona(res.persona_results[0]);
      }
      playNotificationChime(soundEnabled);
    } catch (err) {
      console.error('Failed to re-evaluate would-use score:', err);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-mono tracking-wider uppercase text-xs">
          Computing Propensity & Product Market Fit Across Cohort...
        </p>
      </div>
    );
  }

  if (!data || data.total_personas_evaluated === 0) {
    return (
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-12 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <Target className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            No Persona Cohort Available for Scoring
          </h3>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Generate your synthetic consumer or user cohort first. The "Would Use This Product" mode tests each persona's psychological drivers, OCEAN parameters, and price tolerances against <span className="text-emerald-300 font-semibold">{productName}</span>.
          </p>
        </div>
        {onNavigateToPersonas && (
          <button
            onClick={onNavigateToPersonas}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20"
          >
            Generate Synthetic Personas
          </button>
        )}
      </div>
    );
  }

  const filteredPersonas = (data.persona_results || []).filter((p) => {
    const matchesSearch =
      p.persona_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.segment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerdict = verdictFilter === 'all' || p.verdict === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 55) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getVerdictBadge = (verdict: string) => {
    if (verdict === 'Definite Yes') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Definite Yes
        </span>
      );
    }
    if (verdict === 'Maybe / Conditional') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Maybe / Conditional
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5" />
        Unlikely / Pass
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Propensity & Adoption Analysis Mode
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            "Would Use This Product" Score
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Empirical cohort test assessing whether target synthetic users will actively adopt <span className="text-slate-200 font-medium">{data.product_name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={evaluating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 active:scale-95 disabled:opacity-50 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin text-emerald-400' : ''}`} />
            {evaluating ? 'Re-scoring Cohort...' : 'Re-Evaluate Score'}
          </button>
        </div>
      </div>

      {/* Main Scorecard & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core Gauge Scorecard */}
        <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-7 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                Overall Propensity Score
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {data.total_personas_evaluated} Personas
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-6xl font-black text-white tracking-tighter">
                {data.overall_score}
              </span>
              <span className="text-xl font-bold text-slate-500">/ 100</span>
            </div>

            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {data.adoption_verdict}
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Based on psychological trait alignment, budget tolerance, and everyday problem resonance evaluated across the entire synthetic user group.
            </p>
          </div>

          {/* Mini progress meter */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Cohort Adoption Index</span>
              <span className="font-mono text-emerald-400 font-bold">{data.overall_score}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-1000"
                style={{ width: `${data.overall_score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown by Stance */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Definite Yes Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/20 p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Definite Yes</span>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {data.breakdown.definite_yes_pct}%
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Strong organic fit. Ready to integrate immediately into their active routine.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-mono">
              Primary Driver: Direct problem-solution match
            </div>
          </div>

          {/* Maybe / Conditional Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-amber-500/20 p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Maybe / Trial</span>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {data.breakdown.conditional_maybe_pct}%
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Willing to test if given proof of longevity, trial period, or guided onboarding.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-amber-400 font-mono">
              Key Lever: Risk-free trial or sample
            </div>
          </div>

          {/* Unlikely / Pass Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 text-rose-400 mb-3">
                <XCircle className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Unlikely / Pass</span>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {data.breakdown.unlikely_no_pct}%
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Satisfied with legacy habits or sensitive to initial price switching barriers.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 font-mono">
              Inertia: Habitual lock-in
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Tactical Levers to Boost "Would Use" Score */}
      {data.conversion_levers && data.conversion_levers.length > 0 && (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold tracking-tight">
                Recommended Actions to Boost "Would Use" Propensity
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Targeting the {data.breakdown.conditional_maybe_pct}% conditional cohort
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {data.conversion_levers.map((lever, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {lever.impact} Impact
                    </span>
                    <span className="text-xs font-bold text-cyan-400">
                      {lever.lift_pct}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">
                    {lever.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {lever.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Segment Breakdown */}
      {data.segment_breakdown && data.segment_breakdown.length > 0 && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Segment Adoption Comparison</h3>
            </div>
            <span className="text-xs text-slate-400">By synthetic audience cohort</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.segment_breakdown.map((seg, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{seg.segment_name}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {seg.adoption_rate}% would use
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${seg.adoption_rate}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 mb-2">
                    <span className="text-emerald-400 font-semibold">Appeal: </span>
                    {seg.primary_appeal}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <span className="text-amber-400 font-semibold">Hesitation: </span>
                    {seg.hesitation}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
                  Sample: {seg.sample_size} personas · Segment Score: {seg.score}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Persona Response Matrix */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Synthetic Persona Stance Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect specific reactions, purchase friction, and trigger requirements for each persona.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search personas, roles..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44"
              />
            </div>

            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Stances ({data.persona_results?.length})</option>
              <option value="Definite Yes">Definite Yes</option>
              <option value="Maybe / Conditional">Maybe / Conditional</option>
              <option value="Unlikely / Pass">Unlikely / Pass</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Persona List column */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredPersonas.map((p) => {
              const isSelected = selectedPersona?.persona_id === p.persona_id;
              return (
                <div
                  key={p.persona_id}
                  onClick={() => setSelectedPersona(p)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarImage
                      seed={p.avatar_seed || p.persona_name}
                      className="w-10 h-10 rounded-xl flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {p.persona_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.age}y
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {p.occupation}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${getScoreColor(p.score)}`}>
                      {p.score}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {p.verdict === 'Definite Yes' ? 'Yes' : p.verdict === 'Maybe / Conditional' ? 'Maybe' : 'Pass'}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredPersonas.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                No synthetic personas match the current filter.
              </div>
            )}
          </div>

          {/* Selected Persona Detail Deep-Dive */}
          <div className="lg:col-span-7">
            {selectedPersona ? (
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AvatarImage
                      seed={selectedPersona.avatar_seed || selectedPersona.persona_name}
                      className="w-12 h-12 rounded-2xl"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {selectedPersona.persona_name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {selectedPersona.occupation} · {selectedPersona.segment}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                        Archetype: {selectedPersona.archetype}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {getVerdictBadge(selectedPersona.verdict)}
                    <div className="text-xl font-mono font-black text-white mt-1">
                      {selectedPersona.score} <span className="text-xs text-slate-500 font-normal">/100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      Primary Adoption Reasoning
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedPersona.primary_reason}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                        Trigger Requirement
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedPersona.trigger_feature}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                        Price & Budget Tolerance
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedPersona.price_barrier}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 p-12 text-center text-xs text-slate-500">
                Select a persona from the left column to view their granular adoption profile.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
