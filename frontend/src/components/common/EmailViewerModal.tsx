import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Mail,
  X,
  RefreshCw,
  CheckCircle2,
  Clock,
  KeyRound,
  Send,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface EmailViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailViewerModal({ isOpen, onClose }: EmailViewerModalProps) {
  const { emails, refreshEmails, user } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleCopyOtp = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshEmails();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = testEmailAddress.trim() || user?.email || 'purni20078@gmail.com';
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await api.sendTestEmail(target);
      if (res.success) {
        setTestResult(`Test email dispatched to ${target}!`);
        await refreshEmails();
      } else {
        setTestResult(`Dispatch error: ${res.error || 'Check SMTP configuration'}`);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message || 'Delivery failed'}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const activeEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Dispatched Email & OTP Inspector</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {emails.length} Dispatched
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live delivery logs for OTP verification codes and system notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
              title="Refresh Emails"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Email List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-950/20 overflow-hidden">
            {/* Quick Test Dispatch Bar */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/60">
              <form onSubmit={handleSendTestEmail} className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Live Test Dispatch
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="Enter email to test SMTP..."
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingTest}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    {isSendingTest ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  </button>
                </div>
                {testResult && (
                  <div className="text-[10px] text-indigo-300 truncate">{testResult}</div>
                )}
              </form>
            </div>

            {/* Email list scroll */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No emails dispatched yet. Click "Send OTP" to test verification!
                </div>
              ) : (
                emails.map((item) => {
                  const isSelected = activeEmail?.id === item.id;
                  const isSMTP = item.delivery_status === 'sent_via_smtp';
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedEmailId(item.id)}
                      className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600/15 border-l-4 border-indigo-500 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold truncate max-w-[170px]">{item.to}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            isSMTP
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {isSMTP ? 'SMTP Live' : 'Outbox'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {item.subject}
                      </div>
                      {item.otp_code && (
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            OTP: {item.otp_code}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.sent_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Email Content Preview */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900 p-6">
            {activeEmail ? (
              <div className="space-y-4 max-w-2xl mx-auto w-full">
                {/* Meta details */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">To:</span>
                    <span className="text-xs font-bold font-mono text-white">{activeEmail.to}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Subject:</span>
                    <span className="text-xs font-semibold text-slate-200">{activeEmail.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Sent At:</span>
                    <span className="text-xs text-slate-300">
                      {new Date(activeEmail.sent_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Relay Status:</span>
                    <span className="text-xs font-medium text-indigo-300">
                      {activeEmail.smtp_info || 'Dispatched'}
                    </span>
                  </div>

                  {activeEmail.otp_code && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between bg-indigo-950/40 -mx-4 -mb-4 p-4 rounded-b-2xl">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                          One-Time Passcode (OTP)
                        </div>
                        <div className="text-2xl font-black font-mono tracking-widest text-cyan-300">
                          {activeEmail.otp_code}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyOtp(activeEmail.otp_code!, activeEmail.id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                      >
                        {copiedId === activeEmail.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* HTML Body Preview */}
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 p-4">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Dispatched Email Preview
                  </div>
                  <div
                    className="p-4 rounded-xl bg-[#090d16] text-slate-100 border border-slate-800"
                    dangerouslySetInnerHTML={{ __html: activeEmail.html }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Select an email from the left to inspect its contents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
