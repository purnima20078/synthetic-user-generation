import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DeleteAccountModal } from '../auth/DeleteAccountModal';
import {
  Bell,
  Volume2,
  VolumeX,
  Mail,
  Loader2,
  CheckCircle2,
  Sparkles,
  Layers,
  LogOut,
  ChevronDown,
  KeyRound,
  Trash2,
  UserX,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'dashboard' | 'personas' | 'surveys' | 'interviews' | 'insights' | 'reports';
  onNavigate: (view: 'dashboard' | 'personas' | 'surveys' | 'interviews' | 'insights' | 'reports') => void;
  onOpenWorkspaceList: () => void;
}

export function Header({ currentView, onNavigate, onOpenWorkspaceList }: HeaderProps) {
  const {
    user,
    logout,
    openAuthModal,
    unreadNotificationCount,
    isNotificationOpen,
    setIsNotificationOpen,
    isEmailViewerOpen,
    setIsEmailViewerOpen,
    soundEnabled,
    setSoundEnabled,
  } = useAuth();

  const { activeWorkspace, activeJob, setIsJobModalOpen } = useWorkspace();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isJobRunning = activeJob && (activeJob.status === 'running' || activeJob.status === 'queued');

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Workspace Switcher */}
        <div className="flex items-center gap-6">
          <div
            onClick={onOpenWorkspaceList}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  SYNTHETIC USER GENERATION
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Studio
                </span>
                <span
                  title="Firebase Firestore Database connected and synchronized"
                  className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/10 text-amber-300 border border-amber-500/30"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Firebase
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Synthetic User Research Platform</p>
            </div>
          </div>

          {activeWorkspace && (
            <button
              onClick={onOpenWorkspaceList}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[140px] truncate">{activeWorkspace.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        {/* Center: Navigation tabs if workspace is active */}
        {activeWorkspace && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            {(
              [
                { id: 'dashboard', label: 'Overview' },
                { id: 'personas', label: 'Personas' },
                { id: 'surveys', label: 'Survey Mode' },
                { id: 'interviews', label: 'Interview Mode' },
                { id: 'insights', label: 'Insights & Scoring' },
                { id: 'reports', label: 'Report & Export' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentView === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right: Job Mini Pill + Controls + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Job Progress Mini Pill (Section 8.3) */}
          {activeJob && (
            <button
              onClick={() => setIsJobModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isJobRunning
                  ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 hover:border-indigo-400 animate-pulse'
                  : activeJob.status === 'completed'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 hover:border-emerald-400'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
              }`}
            >
              {isJobRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden sm:inline">
                {isJobRunning
                  ? `${activeJob.completed_count} of ${activeJob.total} ${
                      activeJob.type === 'generate_personas' ? 'personas' : 'items'
                    }`
                  : 'Job Complete'}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.2 bg-slate-900/60 rounded">
                {activeJob.progress}%
              </span>
            </button>
          )}

          {/* Sound Toggle (Section 8.3) */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-indigo-400 hover:text-indigo-300'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Live Simulated Email Outbox Button (Section 5.1 & 8.3) */}
          <button
            onClick={() => setIsEmailViewerOpen(!isEmailViewerOpen)}
            title="Inspect Sent OTP & Notification Emails"
            className={`relative p-2 rounded-lg border transition-colors ${
              isEmailViewerOpen
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="sr-only">Email Inbox</span>
          </button>

          {/* In-app Notification Bell (Section 8.3) */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative p-2 rounded-lg border transition-colors ${
                isNotificationOpen
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          </div>

          {/* User Avatar & Logout or Sign In CTA */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex flex-col text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300 shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                title="Delete Account"
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-950/30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </header>
  );
}
