import React, { useState } from 'react';
import { Survey, SurveyResponse, Persona } from '../../types';
import { AvatarImage } from '../../utils/avatar';
import {
  Download,
  Grid,
  CreditCard,
  BarChart3,
  Filter,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';

interface SurveyResultsGridProps {
  survey: Survey;
  responses: SurveyResponse[];
  personas: Persona[];
  onOpenPersona: (persona: Persona) => void;
  onExportCsv: () => void;
}

export function SurveyResultsGrid({
  survey,
  responses,
  personas,
  onOpenPersona,
  onExportCsv,
}: SurveyResultsGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'cards' | 'analytics'>('grid');
  const [selectedSegment, setSelectedSegment] = useState('ALL');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [purchaseFilter, setPurchaseFilter] = useState('ALL');
  const [activeCellResponse, setActiveCellResponse] = useState<SurveyResponse | null>(null);

  const personaMap = new Map<string, Persona>(personas.map((p) => [p._id, p]));
  const segments = Array.from(new Set(personas.map((p) => p.segment).filter(Boolean)));

  // Filter personas
  const filteredPersonas = personas.filter((p) => {
    if (selectedSegment !== 'ALL' && p.segment !== selectedSegment) return false;
    return true;
  });

  // Filter responses
  const getResponse = (personaId: string, questionId: string) => {
    return responses.find((r) => r.persona_id === personaId && r.question_id === questionId);
  };

  const sentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'border-emerald-500 bg-emerald-950/20 text-emerald-300';
    if (sentiment === 'negative') return 'border-rose-500 bg-rose-950/20 text-rose-300';
    return 'border-amber-500 bg-amber-950/20 text-amber-300';
  };

  const wouldUseBadge = (wouldUse: string) => {
    if (wouldUse === 'yes') return <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 font-bold">Yes</span>;
    if (wouldUse === 'no') return <span className="px-1.5 py-0.5 text-[10px] rounded bg-rose-500/20 text-rose-300 font-bold">No</span>;
    return <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold">Maybe</span>;
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950/80 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Comparison Matrix
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Response Cards
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'analytics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Question Breakdown
            </button>
          </div>

          {/* Segment Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-700/70 text-slate-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Segments ({personas.length})</option>
              {segments.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-700/70 text-slate-200 text-xs focus:outline-none"
          >
            <option value="ALL">All Sentiments</option>
            <option value="positive">Positive Only</option>
            <option value="neutral">Neutral Only</option>
            <option value="negative">Negative Only</option>
          </select>
        </div>

        {/* CSV Export */}
        <button
          onClick={onExportCsv}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" /> Export Matrix to CSV
        </button>
      </div>

      {/* VIEW 1: Side-by-Side Comparison Matrix Grid (Section 6.2 Flagship) */}
      {viewMode === 'grid' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse">
              {/* Sticky Top Persona Headers */}
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="sticky left-0 z-20 bg-slate-950 p-4 min-w-[280px] max-w-[280px] text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-800 shadow-md">
                    Questions \ Synthetic Personas ({filteredPersonas.length})
                  </th>
                  {filteredPersonas.map((p) => (
                    <th
                      key={p._id}
                      className="p-3 min-w-[240px] max-w-[240px] text-xs font-semibold text-slate-200 border-r border-slate-800/80 align-top"
                    >
                      <div className="flex items-center gap-2.5">
                        <AvatarImage seed={p.avatar_seed || p.name} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {p.age}y • {p.segment}
                          </div>
                        </div>
                        <button
                          onClick={() => onOpenPersona(p)}
                          title="View Persona Card & Memory"
                          className="p-1 rounded-md bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Rows (Questions as rows) */}
              <tbody className="divide-y divide-slate-800">
                {survey.questions.map((q, qIdx) => (
                  <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Sticky Left Question Column */}
                    <td className="sticky left-0 z-10 bg-slate-900/95 p-4 min-w-[280px] max-w-[280px] border-r border-slate-800 shadow-md align-top">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold font-mono flex items-center justify-center">
                          Q{qIdx + 1}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          {q.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 leading-snug">{q.text}</p>
                    </td>

                    {/* Personas Response Cells */}
                    {filteredPersonas.map((p) => {
                      const res = getResponse(p._id, q.id);
                      if (!res) {
                        return (
                          <td key={p._id} className="p-3 border-r border-slate-800/60 text-slate-600 text-xs italic">
                            Pending answer...
                          </td>
                        );
                      }

                      // Check sentiment filter
                      if (sentimentFilter !== 'ALL' && res.sentiment !== sentimentFilter) {
                        return (
                          <td key={p._id} className="p-3 border-r border-slate-800/60 opacity-20 text-xs">
                            Filtered
                          </td>
                        );
                      }

                      return (
                        <td
                          key={p._id}
                          onClick={() => setActiveCellResponse(res)}
                          className="p-3 border-r border-slate-800/60 align-top cursor-pointer hover:bg-slate-800/60 transition-colors"
                        >
                          {/* Sentiment Color Strip on left */}
                          <div className={`p-2.5 rounded-xl border-l-4 ${sentimentColor(res.sentiment)} space-y-1.5`}>
                            <div className="flex items-center justify-between gap-1 text-[10px]">
                              {wouldUseBadge(res.would_use)}
                              <span className="capitalize font-semibold text-slate-400">
                                {res.sentiment}
                              </span>
                            </div>
                            <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                              "{res.answer_text}"
                            </p>
                            {res.reasoning && (
                              <p className="text-[10px] text-slate-400 italic line-clamp-1 border-t border-slate-800/60 pt-1">
                                Why: {res.reasoning}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Response Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersonas.map((p) => {
            const personaResponses = responses.filter((r) => r.persona_id === p._id);
            return (
              <div key={p._id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <AvatarImage seed={p.avatar_seed || p.name} size={32} />
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.age}y • {p.segment}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenPersona(p)}
                    className="text-[11px] text-indigo-400 hover:underline font-semibold"
                  >
                    Profile
                  </button>
                </div>

                <div className="space-y-2">
                  {personaResponses.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Question {i + 1}</span>
                        <span className="capitalize">{r.sentiment}</span>
                      </div>
                      <p className="text-slate-200">"{r.answer_text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: Per-Question Analytics Breakdown */}
      {viewMode === 'analytics' && (
        <div className="space-y-4">
          {survey.questions.map((q, idx) => {
            const qResponses = responses.filter((r) => r.question_id === q.id);
            const pos = qResponses.filter((r) => r.sentiment === 'positive').length;
            const neu = qResponses.filter((r) => r.sentiment === 'neutral').length;
            const neg = qResponses.filter((r) => r.sentiment === 'negative').length;
            const total = qResponses.length || 1;

            const wouldUseYes = qResponses.filter((r) => r.would_use === 'yes').length;
            const wouldUseNo = qResponses.filter((r) => r.would_use === 'no').length;
            const wouldUseMaybe = qResponses.filter((r) => r.would_use === 'maybe').length;

            return (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                      Question {idx + 1} ({q.type.replace('_', ' ')})
                    </span>
                    <h4 className="text-sm font-bold text-white">{q.text}</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {qResponses.length} answers
                  </span>
                </div>

                {/* Sentiment Distribution Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Sentiment Breakdown</span>
                    <span>
                      {Math.round((pos / total) * 100)}% Pos / {Math.round((neu / total) * 100)}% Neu / {Math.round((neg / total) * 100)}% Neg
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(pos / total) * 100}%` }} title={`Positive: ${pos}`} />
                    <div className="bg-amber-500 h-full" style={{ width: `${(neu / total) * 100}%` }} title={`Neutral: ${neu}`} />
                    <div className="bg-rose-500 h-full" style={{ width: `${(neg / total) * 100}%` }} title={`Negative: ${neg}`} />
                  </div>
                </div>

                {/* Purchase Intent Breakdown */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold block">Would Use (Yes)</span>
                    <span className="text-base font-bold text-white font-mono">{wouldUseYes} ({Math.round((wouldUseYes / total) * 100)}%)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">Undecided (Maybe)</span>
                    <span className="text-base font-bold text-white font-mono">{wouldUseMaybe} ({Math.round((wouldUseMaybe / total) * 100)}%)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 uppercase font-bold block">Would Not Use (No)</span>
                    <span className="text-base font-bold text-white font-mono">{wouldUseNo} ({Math.round((wouldUseNo / total) * 100)}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Response Detail Modal on cell click */}
      {activeCellResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveCellResponse(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <AvatarImage seed={personaMap.get(activeCellResponse.persona_id)?.avatar_seed || 'user'} size={40} />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {personaMap.get(activeCellResponse.persona_id)?.name}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {personaMap.get(activeCellResponse.persona_id)?.occupation} • {personaMap.get(activeCellResponse.persona_id)?.segment}
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveCellResponse(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">Answer</span>
                <p className="text-sm leading-relaxed text-slate-100 font-medium">"{activeCellResponse.answer_text}"</p>
              </div>

              {activeCellResponse.reasoning && (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reasoning & Cognitive Driver</span>
                  <p className="text-slate-300 leading-relaxed">{activeCellResponse.reasoning}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Sentiment</span>
                  <strong className="capitalize text-cyan-300">{activeCellResponse.sentiment}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Would Use Intent</span>
                  <strong className="capitalize text-emerald-400">{activeCellResponse.would_use}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
