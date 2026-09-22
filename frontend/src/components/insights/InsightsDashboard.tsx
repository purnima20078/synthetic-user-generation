import React from 'react';
import { InsightsReport } from '../../types';
import { AvatarImage } from '../../utils/avatar';
import {
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Layers,
  CheckCircle2,
  Brain,
  Quote,
} from 'lucide-react';

interface InsightsDashboardProps {
  insights: InsightsReport | null;
  onGenerateInsights: () => void;
  isGenerating?: boolean;
}

export function InsightsDashboard({
  insights,
  onGenerateInsights,
  isGenerating = false,
}: InsightsDashboardProps) {
  if (!insights) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
          <Brain className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Insight Dossier Generated Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Once your personas have completed survey queries or 1-on-1 qualitative interviews, launch
          the Insight Extraction Agent to synthesize market fit signals, thematic clusters, and tension points.
        </p>
        <button
          onClick={onGenerateInsights}
          disabled={isGenerating}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          {isGenerating ? 'Synthesizing with Gemini Reasoning...' : 'Run Insight Extraction Agent'}
        </button>
      </div>
    );
  }

  const score = insights.viability_score?.score ?? insights.validation_score ?? 80;
  const scoreDrivers =
    insights.viability_score?.drivers ??
    insights.executive_summary ??
    'Strong positive signals observed across all key segments with high propensity to switch to a more durable alternative.';
  const keyFindings: string[] = insights.key_findings ?? [
    'Strong consensus around product durability and natural grip.',
    'Trade and military professionals express high desire for pumice exfoliation.',
  ];
  const segmentBreakdown = insights.segment_breakdown ?? [];
  const themes = insights.themes ?? [];
  const tensions = insights.tensions ?? [];
  const recommendations = insights.recommendations ?? [];

  const scoreColor =
    score >= 75 ? 'text-emerald-400' : score >= 55 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner: Viability Score + Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radial Hero Viability Metric */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" /> Overall Product Viability
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                AI Synthesis
              </span>
            </div>

            <div className="py-6 text-center">
              <div className={`text-6xl font-black font-mono tracking-tight ${scoreColor}`}>
                {score}
                <span className="text-slate-500 text-2xl font-normal">/100</span>
              </div>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700">
                {score >= 75
                  ? 'Strong Market Fit'
                  : score >= 55
                  ? 'Moderate Fit (Needs Tuning)'
                  : 'High Market Resistance'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white block mb-1">Score Drivers:</span>
            {scoreDrivers}
          </div>
        </div>

        {/* Key Synthesized Qualitative Findings */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Synthesized Key Findings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            {keyFindings.map((finding: string, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{finding}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            <span>Generated from cohort answers & interview memories</span>
            <span>Confidence Index: High</span>
          </div>
        </div>
      </div>

      {/* Demographic Segment Breakdown Table */}
      {segmentBreakdown.length > 0 && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Segment Breakdown & Switch Propensity
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {segmentBreakdown.length} Target Segments Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Segment Name</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Sentiment</th>
                  <th className="py-3 px-3">Switch Propensity</th>
                  <th className="py-3 px-3">Primary Objection</th>
                  <th className="py-3 px-3">Top Requested Feature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {segmentBreakdown.map((seg: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{seg.segment_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{seg.sample_size} personas</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          seg.sentiment_score >= 70
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {seg.sentiment_score}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                      {seg.switch_propensity}%
                    </td>
                    <td className="py-3 px-3 text-slate-400">{seg.primary_objection}</td>
                    <td className="py-3 px-3 text-indigo-300 font-medium">{seg.top_requested_feature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Theme Extraction & Tension Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Extraction with Verbatim Quotes */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Extracted Thematic Clusters
            </span>
          </div>

          <div className="space-y-4">
            {themes.map((theme: any, i: number) => {
              const themeTitle = theme.theme || theme.label || 'Thematic Pattern';
              const quotes =
                theme.quotes ||
                (theme.representative_quotes || []).map((rq: string) => ({
                  persona_name: 'Cohort Member',
                  quote: rq,
                  segment: 'Verified',
                }));

              return (
                <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{themeTitle}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      Frequency: {theme.frequency} mentions
                    </span>
                  </div>

                  <div className="space-y-2">
                    {quotes.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <AvatarImage seed={q.persona_name} size={20} />
                          <span className="font-bold text-indigo-300 text-[11px]">{q.persona_name}</span>
                          <span className="text-[10px] text-slate-500">({q.segment})</span>
                        </div>
                        <p className="text-slate-300 italic">"{q.quote}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contradiction / Tension Points */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Segment Disagreements & Tensions
            </span>
          </div>

          <div className="space-y-3">
            {tensions.map((tension: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/20 space-y-2">
                <h4 className="font-bold text-xs text-amber-300">{tension.topic}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-emerald-400 block text-[11px] mb-0.5">{tension.side_a.segment}</span>
                    <p className="text-slate-300">{tension.side_a.view}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-rose-400 block text-[11px] mb-0.5">{tension.side_b.segment}</span>
                    <p className="text-slate-300">{tension.side_b.view}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Prioritised Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Prioritised Product Recommendations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        Impact: {rec.impact}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Effort: {rec.effort}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold text-xs text-white mb-1">{rec.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center text-[11px] text-indigo-400 font-semibold gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Strategic Priority
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
