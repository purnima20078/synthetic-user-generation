import React, { useState, useEffect } from 'react';
import { Persona, PersonaMemory } from '../../types';
import { api } from '../../services/api';
import { AvatarImage } from '../../utils/avatar';
import {
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  BookOpen,
  Compass,
  DollarSign,
  Heart,
  AlertTriangle,
  Brain,
  Sparkles,
} from 'lucide-react';

interface PersonaDetailModalProps {
  persona: Persona | null;
  onClose: () => void;
  onRegenerate: (id: string) => Promise<void>;
  onStartInterview: (personaId: string) => void;
}

export function PersonaDetailModal({ persona, onClose, onRegenerate, onStartInterview }: PersonaDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'memory'>('profile');
  const [memory, setMemory] = useState<PersonaMemory | null>(null);
  const [loadingMemory, setLoadingMemory] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (persona) {
      setLoadingMemory(true);
      api
        .getPersonaMemory(persona._id)
        .then((data) => setMemory(data))
        .catch((err) => console.warn('Notice loading memory:', err?.message || err))
        .finally(() => setLoadingMemory(false));
    }
  }, [persona]);

  if (!persona) return null;

  const handleRegen = async () => {
    try {
      setIsRegenerating(true);
      await onRegenerate(persona._id);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 z-10 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <AvatarImage seed={persona.avatar_seed || persona.name} size={64} className="ring-2 ring-indigo-500/50" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{persona.name}</h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {persona.segment || 'Segment'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {persona.age} years old • {persona.gender} • {persona.occupation} • {persona.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegen}
              disabled={isRegenerating}
              title="Regenerate this persona with fresh attributes"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Psychological & Behavioural Profile
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            Memory & Consistency Timeline
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' ? (
            <>
              {/* Backstory & Signature Quote */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">Backstory</span>
                <p className="text-xs leading-relaxed text-slate-300">{persona.backstory}</p>
                {persona.quote && (
                  <p className="text-xs italic text-cyan-300 pt-1 border-t border-slate-800/80">
                    "{persona.quote}"
                  </p>
                )}
              </div>

              {/* Personality Profile Breakdown (Replaces OCEAN) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Personality Profile & Cognitive Style
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {persona.personality_traits?.archetype || 'Pragmatic Evaluator'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                      Core Personality Traits
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(persona.personality_traits?.labels || ['Discerning', 'Analytical', 'Health-Conscious', 'Grounded']).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-950/50 text-indigo-200 border border-indigo-500/30"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                      Cognitive & Decision Making Style
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {persona.behaviour?.decision_style || 'Balances scientific ingredient transparency against verified user reviews before purchase.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                      Temperament & Communication
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Realistic, articulate, and practical. Engages with constructive curiosity but resists exaggerated marketing slogans.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                      Demographic & Education Base
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {persona.education || 'Graduate'} • {persona.marital_status || 'Single'} • Monthly Income: <span className="text-emerald-400 font-semibold">{persona.income_level || '₹60,000 / month'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Motivations, Frustrations, Goals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" /> Core Motivations
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {persona.psych_profile.motivations.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Frustrations & Fears
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {persona.psych_profile.frustrations.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Behaviour & Purchasing Style */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Consumer Behaviour & Habits
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Shopping Habit</span>
                    <strong className="text-slate-200">{persona.behaviour.shopping_habits}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Decision Style</span>
                    <strong className="text-slate-200">{persona.behaviour.decision_style}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Price Sensitivity</span>
                    <strong className="text-cyan-400">{persona.behaviour.price_sensitivity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Brand Loyalty</span>
                    <strong className="text-slate-200">{persona.behaviour.brand_loyalty}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Tech Savviness</span>
                    <strong className="text-indigo-400">{persona.behaviour.tech_savviness}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Income Tier</span>
                    <strong className="text-slate-200">{persona.income_level}</strong>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Memory & Consistency Timeline (Section 6.1) */
            <div className="space-y-6">
              {loadingMemory ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading persona memory graph...</div>
              ) : memory ? (
                <>
                  {/* Rolling Summary */}
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-cyan-400" /> Rolling Persona Memory Summary
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {memory.summary || 'No conversation history has accumulated yet. Engage in interview or run a survey to establish conversational memory.'}
                    </p>
                  </div>

                  {/* Stated Opinions (Consistency Guard Source) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Stated Opinions & Stances (Consistency Guard)
                    </span>
                    {memory.stated_opinions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl">
                        No stated stances registered yet. The persona will form opinions through survey questions and interviews.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {memory.stated_opinions.map((op, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-indigo-300">{op.topic}</span>
                              <p className="text-slate-300 mt-0.5">{op.stance}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                              Strength {op.strength}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Extracted Facts */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Extracted Facts & Attributes
                    </span>
                    {memory.facts.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl">
                        No auxiliary facts extracted yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {memory.facts.map((fact, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                            <span className="text-slate-400 text-[10px] block">{fact.key}</span>
                            <span className="text-slate-200 font-medium">{fact.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Turns Timeline */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Interaction History ({memory.turns.length} turns)
                    </span>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {memory.turns.map((turn, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            turn.role === 'user'
                              ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                              : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold">
                            <span className="capitalize">{turn.role === 'user' ? 'Researcher' : persona.name}</span>
                            <span>{new Date(turn.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p>{turn.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">No memory graph recorded.</div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">Deterministic ID: {persona._id.slice(0, 10)}...</span>
          <button
            onClick={() => {
              onClose();
              onStartInterview(persona._id);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2"
          >
            Start 1-on-1 Interview with {persona.name} →
          </button>
        </div>
      </div>
    </div>
  );
}
