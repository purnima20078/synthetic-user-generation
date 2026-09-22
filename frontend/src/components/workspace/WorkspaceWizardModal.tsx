import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TargetAudience } from '../../types';
import {
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface WorkspaceWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceWizardModal({ isOpen, onClose }: WorkspaceWizardModalProps) {
  const { createWorkspace, generatePersonas } = useWorkspace();

  // Asked exclusively: Project Name
  const [productName, setProductName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = productName.trim();

    if (!cleanName) {
      setErrorMsg('Please enter a project name to create the workspace.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const targetAudience: TargetAudience = {
        age_range: [18, 65],
        age_min: 18,
        age_max: 65,
        gender: 'All Genders (Balanced)',
        location: 'Pan-India & Global Cities',
        occupation: 'Diverse Consumers & Working Professionals',
        income: 'Middle & Upper-Middle Income',
        segment_tags: ['Target Consumers', 'Early Adopters', 'Mainstream Users'],
        extra_details: `Target consumer cohort evaluating ${cleanName}`,
      };

      const finalDescription = `${cleanName} — user research study and consumer feedback analysis.`;
      const finalObjective = `Evaluate value proposition, pricing receptivity, and feature adoption likelihood for ${cleanName}.`;

      // 1. Create the project with the specified project name
      const newWs = await createWorkspace({
        name: cleanName,
        product_name: cleanName,
        product_description: finalDescription,
        category: 'Consumer Product & Software',
        target_audience: targetAudience,
        research_objective: finalObjective,
        target_price: '',
      });

      setProductName('');
      onClose();
    } catch (err: any) {
      console.error('Failed to create workspace and start generation:', err);
      setErrorMsg(err.message || 'Failed to create workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 text-slate-100 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">
                New Project
              </span>
              <h2 className="text-lg font-black text-white">Create Workspace</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateAndStart} className="space-y-5 mt-5">
          {/* Project Name Only */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Project Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. VedaPure Herbal Skincare, Smart FinAI, NeoCRM..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
            <p className="text-[11px] text-slate-400">
              Your research cohort and synthetic user audience will be automatically created and ready for testing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !productName.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Project & Starting Generation...</span>
                </>
              ) : (
                <>
                  <span>Create Project & Start Generation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
