import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, collection, query, where, getDocs } from '../../services/firebase';
import {
  Sparkles,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User as UserIcon,
  X,
  Briefcase,
  ShieldCheck,
  Inbox,
  Check,
} from 'lucide-react';

const SUGGESTED_ROLES = ['UX Researcher', 'Product Manager', 'Startup Founder', 'Data Analyst'];

export function AuthModal() {
  const {
    user,
    login,
    signup,
    verifyOtp,
    loginWithGoogle,
    emails,
    setIsEmailViewerOpen,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
  } = useAuth();

  const [mode, setMode] = useState<'signup' | 'login'>(authModalMode || 'signup');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('UX Researcher');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [deliveryNote, setDeliveryNote] = useState<string | null>(null);
  const [accountExistsNotice, setAccountExistsNotice] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sync mode from context if changed
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setAccountExistsNotice(false);
    }
  }, [authModalMode]);

  // Resend countdown timer
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendSeconds > 0) {
      interval = setInterval(() => {
        setResendSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendSeconds]);

  // Focus first OTP input when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // If modal is not open, don't show
  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setAccountExistsNotice(false);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in with Google Firebase Auth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (mode === 'signup' && !cleanName) {
      setErrorMsg('Please enter your full name to create an account.');
      return;
    }

    setErrorMsg(null);
    setSuccessInfo(null);
    setAccountExistsNotice(false);
    setIsLoading(true);

    try {
      let res: any;
      if (mode === 'signup') {
        // Check Firebase/Firestore whether email already exists
        try {
          const userQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
          const userSnap = await getDocs(userQuery);
          if (!userSnap.empty) {
            setAccountExistsNotice(true);
            setErrorMsg('You already have an account. Please Sign In.');
            setIsLoading(false);
            return;
          }
        } catch (fbErr) {
          console.warn('Firestore existence check notice:', fbErr);
        }

        res = await signup(cleanName, cleanEmail);
      } else {
        res = await login(cleanEmail);
      }

      setDeliveryNote(
        res?.delivery_status === 'sent_via_smtp'
          ? 'Live verification email dispatched via SMTP to your inbox.'
          : 'Verification code dispatched to your email address.'
      );
      setSuccessInfo(`6-digit code dispatched to ${cleanEmail}`);

      setStep('otp');
      setResendSeconds(60);
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.includes('already exists') ||
        msg.includes('ACCOUNT_EXISTS') ||
        msg.includes('log in instead')
      ) {
        setAccountExistsNotice(true);
        setErrorMsg('You already have an account. Please Sign In.');
      } else {
        setErrorMsg(msg || 'Failed to send verification code. Please check email address.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || isLoading) return;
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim() || 'Researcher';
      if (mode === 'signup') {
        await signup(cleanName, cleanEmail);
      } else {
        await login(cleanEmail);
      }
      setResendSeconds(60);
      setSuccessInfo('A new verification code has been dispatched to your inbox.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const submitOtp = async (codeToSubmit: string) => {
    if (codeToSubmit.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await verifyOtp(email.trim().toLowerCase(), codeToSubmit, mode);
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code. Please check and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto move to next input
    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits are entered
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && !newOtp.includes('')) {
      submitOtp(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    if (pasteData.length === 6) {
      submitOtp(pasteData);
    } else {
      otpInputsRef.current[pasteData.length]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button (if user is already logged in or wishes to dismiss) */}
        {user && (
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Back to Landing Page button */}
        <button
          onClick={closeAuthModal}
          className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/50"
        >
          <span>← Back to Landing Page</span>
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-lg">
            ⚡
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-indigo-400">
              Synthetic User Platform
            </div>
            <h2 className="text-xl font-black text-white">
              {step === 'otp'
                ? 'Verify Your Email'
                : mode === 'signup'
                ? 'Create Your Account'
                : 'Sign in to Account'}
            </h2>
          </div>
        </div>

        {/* Mode Switcher Tabs (Only visible on Step 1) */}
        {step === 'email' && (
          <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setAuthModalMode('signup');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthModalMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Status / Error Alerts */}
        {accountExistsNotice && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 shadow-lg shadow-amber-950/20">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="font-bold text-white text-sm">Account Already Exists</div>
              <p className="text-amber-200/90 text-xs leading-relaxed">
                You already have an account. Please Sign In.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthModalMode('login');
                  setErrorMsg(null);
                  setAccountExistsNotice(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {!accountExistsNotice && errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successInfo && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successInfo}</span>
          </div>
        )}

        {/* Step 1: Input Name & Email, then Send OTP */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Alex Morgan"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Optional Role Tags */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Primary Role
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          selectedRole === role
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. purni20078@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                We'll dispatch a secure 6-digit OTP verification code to this inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching OTP Code...</span>
                </>
              ) : (
                <>
                  <span>Send OTP to Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-900 px-3 text-slate-500 font-bold">Or Continue With</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
                />
              </svg>
              <span>Google Firebase Auth</span>
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Verification code sent to:</span>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-bold"
                >
                  Change Email
                </button>
              </div>
              <div className="font-mono font-bold text-white text-sm">{email}</div>
              <p className="text-[11px] text-slate-400">
                Please check your email inbox (or spam folder) for the 6-digit passcode and enter it below.
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div>
              <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Enter 6-Digit One-Time Passcode
              </label>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Submit Verification Button */}
            <button
              type="button"
              onClick={() => submitOtp(otp.join(''))}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code & Activating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP & Complete Signup</span>
                </>
              )}
            </button>

            {/* Resend & Tools */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendSeconds > 0 || isLoading}
                className="text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                {resendSeconds > 0 ? `Resend OTP in ${resendSeconds}s` : 'Resend OTP Code'}
              </button>

              <button
                type="button"
                onClick={() => setIsEmailViewerOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                View Dispatched Outbox
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
