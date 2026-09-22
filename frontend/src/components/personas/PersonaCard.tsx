import React from 'react';
import { Persona } from '../../types';
import { AvatarImage } from '../../utils/avatar';
import { MapPin, Briefcase, Quote, Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  onClick: (persona: Persona) => void;
  onRegenerate?: (e: React.MouseEvent, id: string) => void;
}

export function PersonaCard({ persona, onClick }: PersonaCardProps) {
  const personalityTraits = persona.personality_traits?.labels || ['Discerning', 'Analytical', 'Health-Conscious'];
  const archetype = persona.personality_traits?.archetype || 'Pragmatic Evaluator';
  const priceSensitivity = persona.behaviour?.price_sensitivity || 'Moderate Price';
  const decisionStyle = persona.behaviour?.decision_style || 'Ingredient & Efficacy Driven';
  const shoppingHabits = persona.behaviour?.shopping_habits || 'Online & verified store buyer';
  const brandLoyalty = persona.behaviour?.brand_loyalty || 'Moderate';
  const techSavvy = persona.behaviour?.tech_savviness || 'Medium';

  return (
    <div
      onClick={() => onClick(persona)}
      className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-slate-700/80 via-slate-800/40 to-slate-900 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 cursor-pointer hover:-translate-y-1"
    >
      <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-sm p-5 flex flex-col justify-between h-full overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

        <div>
          {/* Header Row: Avatar, Identity, Segment Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AvatarImage seed={persona.avatar_seed || persona.name} size={48} className="ring-2 ring-indigo-500/30" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" title="Active synthetic persona" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white group-hover:text-indigo-200 transition-colors">
                  {persona.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>{persona.age} yrs</span>
                  <span>•</span>
                  <span>{persona.gender}</span>
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0">
              {persona.segment || 'General'}
            </span>
          </div>

          {/* Demographic details */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 truncate">
              <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate" title={persona.occupation}>{persona.occupation}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate" title={persona.location}>{persona.location}</span>
            </div>
          </div>

          {/* Signature Quote */}
          {persona.quote && (
            <div className="mt-3.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs italic text-slate-300 flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-relaxed">"{persona.quote}"</p>
            </div>
          )}

          {/* Personality Details (Replaces OCEAN traits) */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Personality
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {archetype}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {personalityTraits.slice(0, 3).map((trait, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800/80 text-slate-200 border border-slate-700/60"
                >
                  {trait}
                </span>
              ))}
            </div>

            <div className="text-[11px] text-slate-300 flex items-start gap-1.5 pt-1">
              <span className="text-slate-500 shrink-0 font-medium">Decision:</span>
              <span className="line-clamp-1 text-slate-300">{decisionStyle}</span>
            </div>
          </div>

          {/* Behaviour Details (Replaces OCEAN traits) */}
          <div className="mt-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" /> Behaviour
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {priceSensitivity}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Brand Loyalty</span>
                <span className="text-slate-200 font-medium truncate block">{brandLoyalty}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tech Comfort</span>
                <span className="text-slate-200 font-medium truncate block">{techSavvy}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 flex items-start gap-1.5 pt-0.5">
              <span className="text-slate-500 shrink-0 font-medium">Habit:</span>
              <span className="line-clamp-1 text-slate-300">{shoppingHabits}</span>
            </div>
          </div>

          {/* Motivations & Frustrations Chips */}
          <div className="mt-3 space-y-1.5">
            {persona.psych_profile?.motivations?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {persona.psych_profile.motivations.slice(0, 2).map((m, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 truncate max-w-[170px]"
                    title={m}
                  >
                    +{m}
                  </span>
                ))}
              </div>
            )}
            {persona.psych_profile?.frustrations?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {persona.psych_profile.frustrations.slice(0, 2).map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[10px] rounded-md bg-rose-950/40 text-rose-300 border border-rose-500/20 truncate max-w-[170px]"
                    title={f}
                  >
                    -{f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer: Click prompt */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Income: {persona.income_level || '₹50,000 / mo'}
          </span>
          <span className="text-indigo-400 group-hover:text-indigo-300 font-semibold text-[11px] flex items-center gap-1">
            Explore Profile →
          </span>
        </div>
      </div>
    </div>
  );
}
