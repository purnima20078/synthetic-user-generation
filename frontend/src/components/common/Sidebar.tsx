import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MessageSquare,
  Target,
  Brain,
  FileText,
  LogOut,
  Layers,
  ChevronDown,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  Mail,
  Loader2,
  CheckCircle2,
  Menu,
  X,
  ShieldCheck,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { DeleteAccountModal } from '../auth/DeleteAccountModal';

export type ViewMode = 'dashboard' | 'personas' | 'surveys' | 'interviews' | 'would-use' | 'validation' | 'insights' | 'reports';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenWorkspaceList: () => void;
}

export function Sidebar({ currentView, onNavigate, onOpenWorkspaceList }: SidebarProps) {
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isJobRunning = activeJob && (activeJob.status === 'running' || activeJob.status === 'queued');

  const navItems: { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'personas', label: 'Personas', icon: Users },
    { id: 'surveys', label: 'Survey Mode', icon: ClipboardList },
    { id: 'interviews', label: 'Interview Mode', icon: MessageSquare },
    {
      id: 'would-use',
      label: 'Would Use This Product',
      icon: Target,
      badge: 'Score',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'validation',
      label: 'QA Validation Suite',
      icon: ShieldCheck,
      badge: 'Passed',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    { id: 'insights', label: 'Insights & Scoring', icon: Brain },
    { id: 'reports', label: 'Report & Export', icon: FileText },
  ];

  const handleNavClick = (view: ViewMode) => {
    onNavigate(view);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div
          onClick={onOpenWorkspaceList}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight text-white truncate">
                SYNTHETIC USER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Research Platform
            </p>
          </div>
        </div>

        {/* Workspace Switcher Pill */}
        {activeWorkspace && (
          <button
            onClick={onOpenWorkspaceList}
            className="w-full mt-4 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate max-w-[150px]">{activeWorkspace.name}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-colors" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation Modes
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    item.badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Job Progress Mini Pill if active */}
      {activeJob && (
        <div className="px-3 pb-2">
          <button
            onClick={() => setIsJobModalOpen(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              isJobRunning
                ? 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200 hover:border-indigo-400 animate-pulse'
                : activeJob.status === 'completed'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isJobRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              )}
              <span className="truncate text-[11px]">
                {isJobRunning ? 'Processing Job...' : 'Job Completed'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-900/80 rounded">
              {activeJob.progress}%
            </span>
          </button>
        </div>
      )}

      {/* Utility Toolbar (Sound, Emails, Notifications) */}
      <div className="px-3 py-2 border-t border-slate-800/80 flex items-center justify-around text-slate-400">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          className={`p-2 rounded-lg border transition-colors ${
            soundEnabled
              ? 'bg-slate-800 border-slate-700 text-indigo-400 hover:text-indigo-300'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setIsEmailViewerOpen(!isEmailViewerOpen)}
          title="Inspect Sent OTP & Notification Emails"
          className={`p-2 rounded-lg border transition-colors ${
            isEmailViewerOpen
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          title="Notifications"
          className={`relative p-2 rounded-lg border transition-colors ${
            isNotificationOpen
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadNotificationCount}
            </span>
          )}
        </button>
      </div>

      {/* User Footer & Static Logout / Sign In */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>

            {/* Dedicated Static Logout & Delete Account Buttons */}
            <div className="space-y-1.5">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700 text-xs font-semibold text-slate-300 transition-all group shadow-sm active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-950/30 text-[11px] font-semibold text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('signup')}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all active:scale-98"
          >
            <KeyRound className="w-4 h-4" />
            <span>Create Account / Sign In</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar with Drawer Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xs text-white">SYNTHETIC USER</span>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex">
          <div className="w-72 h-full max-w-full">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
