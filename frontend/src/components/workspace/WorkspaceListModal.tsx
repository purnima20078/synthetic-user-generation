import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Workspace } from '../../types';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  X,
  Sparkles,
  Users,
  Edit2,
  Check,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface WorkspaceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewWizard: () => void;
}

export function WorkspaceListModal({
  isOpen,
  onClose,
  onOpenNewWizard,
}: WorkspaceListModalProps) {
  const { workspaces, activeWorkspace, setActiveWorkspace, updateWorkspace, deleteWorkspace } =
    useWorkspace();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (ws: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(ws._id);
    setEditingName(ws.product_name || ws.name);
    setDeletingId(null);
  };

  const handleSaveEdit = async (wsId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const clean = editingName.trim();
    if (!clean) return;

    setIsSavingName(true);
    try {
      await updateWorkspace(wsId, {
        name: clean,
        product_name: clean,
      });
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update workspace name:', err);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingName('');
  };

  const handleConfirmDelete = async (wsId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteWorkspace(wsId);
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete workspace:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Research Projects</h3>
              <p className="text-xs text-slate-400">Manage, rename, or switch between research workspaces</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspaces List */}
        <div className="space-y-3 max-h-84 overflow-y-auto pr-1">
          {workspaces.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No workspaces created yet. Click below to launch your first research cohort.
            </div>
          ) : (
            workspaces.map((ws) => {
              const isActive = activeWorkspace?._id === ws._id;
              const isEditingThis = editingId === ws._id;
              const isDeletingThis = deletingId === ws._id;

              return (
                <div
                  key={ws._id}
                  onClick={() => {
                    if (!isEditingThis && !isDeletingThis) {
                      setActiveWorkspace(ws);
                      onClose();
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Info or Edit Input */}
                  <div className="space-y-1 min-w-0 flex-1 w-full">
                    {isEditingThis ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(ws._id, e as any);
                            if (e.key === 'Escape') handleCancelEdit(e as any);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-500 text-sm text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleSaveEdit(ws._id, e)}
                          disabled={isSavingName || !editingName.trim()}
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                          title="Save Name"
                        >
                          {isSavingName ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isSavingName}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm truncate text-white">{ws.product_name || ws.name}</h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/40">
                            Active
                          </span>
                        )}
                      </div>
                    )}

                    {!isEditingThis && (
                      <>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {ws.research_objective || ws.product_description || 'Synthetic user research workspace'}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                          <span>Audience: {ws.target_audience?.occupation || 'General'}</span>
                          <span>•</span>
                          <span>Category: {ws.category || 'Product'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    {isDeletingThis ? (
                      <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/40 p-1.5 rounded-xl">
                        <span className="text-[11px] text-rose-300 font-bold px-1">Delete project?</span>
                        <button
                          type="button"
                          onClick={(e) => handleConfirmDelete(ws._id, e)}
                          disabled={isDeleting}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          {isDeleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(null);
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {!isEditingThis && (
                          <button
                            type="button"
                            onClick={(e) => handleStartEdit(ws, e)}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                            title="Edit Project Name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(ws._id);
                            setEditingId(null);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ArrowRight className="w-4 h-4 text-slate-500 ml-1" />
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action button: Launch Wizard */}
        <button
          onClick={() => {
            onClose();
            onOpenNewWizard();
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Workspace
        </button>
      </div>
    </div>
  );
}
