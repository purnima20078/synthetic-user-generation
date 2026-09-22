import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Bell, CheckCheck, X, Mail, Sparkles, ExternalLink, Clock, CheckCircle2, Send, Loader2 } from 'lucide-react';

export function NotificationDrawer() {
  const {
    user,
    notifications,
    isNotificationOpen,
    setIsNotificationOpen,
    markNotificationRead,
    markAllNotificationsRead,
    isEmailViewerOpen,
    setIsEmailViewerOpen,
    emails,
    refreshEmails,
  } = useAuth();

  const [testSending, setTestSending] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const handleSendTestEmail = async () => {
    setTestSending(true);
    setTestMessage(null);
    try {
      const targetEmail = user?.email || 'user@example.com';
      const res = await api.sendTestEmail(targetEmail);
      if (res.success) {
        setTestMessage(`Test email sent to ${targetEmail}`);
        await refreshEmails();
      } else {
        setTestMessage(res.error || 'Failed to dispatch test email');
      }
    } catch (err: any) {
      setTestMessage(err?.message || 'Error sending test email');
    } finally {
      setTestSending(false);
    }
  };

  return (
    <>
      {/* Notification Dropdown Panel */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" onClick={() => setIsNotificationOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs" />
          <div
            className="absolute top-16 right-4 sm:right-8 w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-950/50 p-4 text-slate-100 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-sm">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some((n) => !n.is_read) && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 max-h-96 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => markNotificationRead(item._id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      item.is_read
                        ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                        : 'bg-indigo-950/30 border-indigo-500/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        {item.title}
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.body}</p>
                    {item.link && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline font-medium">
                        View results <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simulated Email Outbox / Viewer (Section 5.1 & 8.3) */}
      {isEmailViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsEmailViewerOpen(false)}>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-10 text-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Email Dispatch Inbox</h3>
                  <p className="text-xs text-slate-400">
                    Inspect dispatched OTP verification & job completion HTML emails
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailViewerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brevo SMTP Relay Indicator */}
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300 font-medium">SMTP: smtp-relay.brevo.com:587</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Brevo Live
                </span>
              </div>
              <button
                onClick={handleSendTestEmail}
                disabled={testSending}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                {testSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Test Email
              </button>
            </div>
            {testMessage && (
              <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-800/40 text-xs text-indigo-300 flex items-center justify-between">
                <span>{testMessage}</span>
                <button onClick={() => setTestMessage(null)} className="text-slate-400 hover:text-white text-[10px]">Dismiss</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {emails.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No emails dispatched yet. Sign up or start a background job to trigger email delivery.
                </div>
              ) : (
                emails.map((email) => (
                  <div key={email.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">To:</span> <strong className="text-slate-200">{email.to}</strong>
                        {email.delivery_status === 'sent_via_smtp' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Live SMTP (Brevo)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            In-App Relay
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500">
                        {new Date(email.sent_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="font-bold text-sm text-indigo-300">
                      Subject: {email.subject}
                    </div>

                    {email.smtp_info && (
                      <p className="text-[11px] text-slate-400 font-mono">
                        {email.smtp_info}
                      </p>
                    )}

                    {email.otp_code && (
                      <div className="p-3 bg-indigo-950/50 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs text-indigo-300 font-semibold block">6-Digit Verification Code</span>
                          <span className="text-2xl font-mono font-black tracking-widest text-cyan-300">
                            {email.otp_code}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(email.otp_code || '');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                        >
                          Copy OTP
                        </button>
                      </div>
                    )}

                    {/* Render branded email HTML in a safe container */}
                    <div
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: email.html }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
