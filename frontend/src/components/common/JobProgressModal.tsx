import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AvatarImage } from '../../utils/avatar';
import { playAlertSound } from '../../utils/audio';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  ClipboardList,
  Users,
  Volume2,
} from 'lucide-react';

interface JobProgressModalProps {
  onNavigateToTab?: (tab: 'dashboard' | 'personas' | 'surveys' | 'interviews' | 'would-use' | 'insights' | 'reports') => void;
}

export function JobProgressModal({ onNavigateToTab }: JobProgressModalProps) {
  const { activeJob, isJobModalOpen, setIsJobModalOpen } = useWorkspace();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeJob || (activeJob.status !== 'running' && activeJob.status !== 'queued')) {
      return;
    }

    const start = activeJob.started_at ? new Date(activeJob.started_at).getTime() : Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJob]);

  if (!isJobModalOpen || !activeJob) return null;

  const isCompleted = activeJob.status === 'completed';
  const isFailed = activeJob.status === 'failed';
  const isRunning = activeJob.status === 'running' || activeJob.status === 'queued';

  // Estimate remaining time based on progress
  let etaSeconds = 0;
  if (isRunning && activeJob.progress > 5 && elapsedSeconds > 2) {
    const ratePerSec = activeJob.progress / elapsedSeconds;
    const remainingPct = 100 - activeJob.progress;
    etaSeconds = Math.round(remainingPct / (ratePerSec || 1));
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleGoToSurveys = () => {
    setIsJobModalOpen(false);
    if (onNavigateToTab) {
      onNavigateToTab('surveys');
    }
  };

  const handleGoToPersonas = () => {
    setIsJobModalOpen(false);
    if (onNavigateToTab) {
      onNavigateToTab('personas');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={() => setIsJobModalOpen(false)}
      />
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 12 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 z-10"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isFailed
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isFailed ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold capitalize">
                {activeJob.type.replace('_', ' ')}
              </h3>
              <p className="text-xs text-slate-400">
                {isRunning
                  ? 'Active synthetic generation pipeline in progress'
                  : isCompleted
                  ? 'Synthetic cohort generation complete and saved'
                  : 'Task completed with notices'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsJobModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Numerical Metrics */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">
              {activeJob.completed_count} of {activeJob.total}{' '}
              {activeJob.type === 'generate_personas' ? 'personas synthesized' : 'items processed'}
            </span>
            <span className="text-indigo-400 font-mono text-sm font-bold">{activeJob.progress}%</span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : isFailed
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 animate-pulse'
              }`}
              style={{ width: `${Math.max(5, activeJob.progress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Elapsed: {formatTime(elapsedSeconds)}</span>
            </div>
            {isRunning ? (
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Est. Remaining: {etaSeconds > 0 ? formatTime(etaSeconds) : 'Synthesizing...'}</span>
              </div>
            ) : isCompleted ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for evaluation
              </span>
            ) : null}
          </div>
        </div>

        {/* Running Live Stream of Completed Items */}
        {activeJob.preview_items && activeJob.preview_items.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Live Generated Population Stream
              </span>
              <span className="text-[10px] text-slate-500">Latest synthesized</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
              {activeJob.preview_items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800/60"
                >
                  <AvatarImage seed={item.avatar || item.title} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{item.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-medium shrink-0">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Action Banner */}
        {isCompleted && (
          <div className="mt-6 space-y-3">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-300">
                  Synthetic Population Ready!
                </div>
                <div className="text-[11px] text-slate-300">
                  Click below to go directly to the Surveys tab and run your cohort survey.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoToPersonas}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" /> Personas
                </button>
                <button
                  onClick={handleGoToSurveys}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <ClipboardList className="w-3.5 h-3.5" /> Run Survey <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Alert sound indicator bar */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] text-slate-300">Generation alert chime was sounded</span>
              </div>
              <button
                type="button"
                onClick={() => playAlertSound(true)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-indigo-300 border border-slate-700 flex items-center gap-1 transition-colors active:scale-95"
              >
                <Volume2 className="w-3 h-3" /> Replay Sound
              </button>
            </div>
          </div>
        )}

        {/* Notice for background execution */}
        {!isCompleted && (
          <div className="mt-6 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs text-slate-300">
            <span>You can safely close this panel or navigate to other tabs while generation completes in the background.</span>
            <button
              onClick={() => setIsJobModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 ml-3"
            >
              Minimize
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
