import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Users,
  Volume2,
  X,
  Target,
  Brain,
  Sliders,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Workspace } from '../../types';
import { playAlertSound } from '../../utils/audio';

interface GeneratePersonasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (count: number) => Promise<any> | void;
  workspace: Workspace | null;
  currentPersonaCount: number;
}

const PRESET_COUNTS = [5, 10, 20, 50, 100];

export function GeneratePersonasModal({
  isOpen,
  onClose,
  onGenerate,
  workspace,
  currentPersonaCount,
}: GeneratePersonasModalProps) {
  const [count, setCount] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false);

  if (!isOpen) return null;

  const handleTestSound = () => {
    setIsPlayingTestSound(true);
    playAlertSound(true);
    setTimeout(() => setIsPlayingTestSound(false), 1200);
  };

  const handleCountChange = (val: number) => {
    const clamped = Math.max(1, Math.min(250, val));
    setCount(clamped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0) return;
    try {
      setIsSubmitting(true);
      await onGenerate(count);
      onClose();
    } catch (err) {
      console.error('Failed to dispatch persona generation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 z-10 overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800/80 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Generate Synthetic Personas
              </h2>
              <p className="text-xs text-slate-400">
                Specify the exact cohort size you want to synthesize
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Target Audience Context Badge */}
          {workspace && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 text-xs">
              <Target className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-slate-400">Target Segment:</span>{' '}
                <span className="font-semibold text-slate-200">
                  {workspace.target_audience?.occupation || 'General Audience'}
                </span>{' '}
                <span className="text-slate-500 font-mono">
                  ({workspace.target_audience?.age_range?.[0]}–{workspace.target_audience?.age_range?.[1]} yrs)
                </span>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  Current population: {currentPersonaCount} personas
                </div>
              </div>
            </div>
          )}

          {/* Count Selector Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Number of Personas to Generate:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Custom count:</span>
                <input
                  type="number"
                  min={1}
                  max={250}
                  value={count}
                  onChange={(e) => handleCountChange(parseInt(e.target.value, 10) || 1)}
                  className="w-20 px-2.5 py-1 text-center font-mono font-bold text-sm bg-slate-950 border border-indigo-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Range slider */}
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={Math.min(count, 100)}
              onChange={(e) => handleCountChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 persona</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100 personas</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Quick Preset Counts:
              </span>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COUNTS.map((preset) => {
                  const isSelected = count === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCount(preset)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      +{preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Audio Alert Notice Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950/80 to-indigo-950/20 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-200">
                  Audio Alert Chime Enabled
                </div>
                <div className="text-[11px] text-slate-400">
                  A completion alert sound will play as soon as all {count} personas are ready.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTestSound}
              disabled={isPlayingTestSound}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 shrink-0 transition-colors flex items-center gap-1 active:scale-95"
              title="Test the alert sound right now"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingTestSound ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
              <span>{isPlayingTestSound ? 'Playing...' : 'Test Sound'}</span>
            </button>
          </div>

          {/* Quality & Diversity Indicators */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <Brain className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>OCEAN psychology variance</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Live background pipeline</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || count <= 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>{isSubmitting ? 'Synthesizing...' : `Generate ${count} Personas`}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
