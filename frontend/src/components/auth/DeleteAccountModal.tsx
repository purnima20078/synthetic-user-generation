import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Trash2, X, RefreshCw, ShieldAlert } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { user, deleteAccount } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    if (confirmText.trim().toLowerCase() !== 'delete') {
      setErrorMsg('Please type DELETE to confirm account deletion.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await deleteAccount();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl p-6 sm:p-7 text-slate-100 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
              Danger Zone
            </span>
            <h3 className="text-lg font-black text-white">Delete Account</h3>
          </div>
        </div>

        {/* Warning text */}
        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300 space-y-1.5 mb-4">
          <p className="font-semibold text-rose-200">
            This action is permanent and cannot be reversed.
          </p>
          <p className="text-[11px] text-rose-300/80 leading-relaxed">
            Deleting your account (<strong className="text-white">{user.email}</strong>) will permanently erase all your research workspaces, generated personas, survey logs, and custom feedback.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Confirmation Input */}
        <div className="space-y-2 mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Type <span className="font-mono text-rose-400 font-black">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Type DELETE"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading || confirmText.trim().toLowerCase() !== 'delete'}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting Account...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
