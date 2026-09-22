import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, NotificationItem, EmailRecord } from '../types';
import { api, getAuthToken, setAuthToken } from '../services/api';
import { playNotificationChime } from '../utils/audio';
import {
  auth,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  deleteDoc,
  handleFirestoreError,
  OperationType,
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  emails: EmailRecord[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isEmailViewerOpen: boolean;
  setIsEmailViewerOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signup' | 'login';
  setAuthModalMode: (mode: 'signup' | 'login') => void;
  openAuthModal: (mode?: 'signup' | 'login') => void;
  closeAuthModal: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  // Auth actions
  login: (email: string) => Promise<{ success: boolean; message: string; requires_otp: boolean; delivery_status?: string; smtp_info?: string; otp_preview?: string }>;
  signup: (name: string, email: string) => Promise<{ success: boolean; message: string; requires_otp: boolean; delivery_status?: string; smtp_info?: string; otp_preview?: string }>;
  verifyOtp: (email: string, otp: string, purpose: 'signup' | 'login') => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshEmails: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isEmailViewerOpen, setIsEmailViewerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  // Initialize session and Firebase Auth listener
  useEffect(() => {
    async function init() {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setSoundEnabledState(res.user.notification_prefs?.sound_enabled ?? true);
        } catch {
          setAuthToken(null);
          setTokenState(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    init();

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const u: User = {
          _id: fbUser.uid,
          email: fbUser.email || 'user@example.com',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Researcher',
          avatar_url: fbUser.photoURL || undefined,
          is_verified: true,
          created_at: new Date().toISOString(),
          notification_prefs: {
            sound_enabled: true,
            email_enabled: true,
            desktop_enabled: true,
          },
        };
        setUser(u);
        setAuthToken(`fb_${fbUser.uid}`);
        setTokenState(`fb_${fbUser.uid}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const items = await api.getNotifications();
      if (Array.isArray(items)) {
        setNotifications(items);
      }
    } catch {
      // Gracefully silent on transient polling drop
    }
  }, []);

  const refreshEmails = useCallback(async () => {
    try {
      const emailList = await api.getEmailInbox();
      if (Array.isArray(emailList)) {
        setEmails(emailList);
      }
    } catch {
      // Gracefully silent on transient polling drop
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      refreshEmails();
      const interval = setInterval(() => {
        refreshNotifications();
        refreshEmails();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications, refreshEmails]);

  const setSoundEnabled = async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('sug_sound_enabled', enabled ? 'true' : 'false');
    if (user) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              notification_prefs: {
                ...(prev.notification_prefs || { email_enabled: true, desktop_enabled: true }),
                sound_enabled: enabled,
              },
            }
          : null
      );

      try {
        const updated = await api.updateNotificationPrefs({ sound_enabled: enabled });
        if (updated?.user) {
          setUser(updated.user);
        }
      } catch (err) {
        console.warn('Backend sound pref sync notice:', err);
      }

      if (auth.currentUser) {
        try {
          await setDoc(
            doc(db, 'users', auth.currentUser.uid),
            {
              notification_prefs: { sound_enabled: enabled },
            },
            { merge: true }
          );
        } catch (fbErr) {
          console.warn('Firestore sound pref sync notice:', fbErr);
        }
      }
    }
  };

  const login = async (email: string) => {
    const res = await api.login(email);
    refreshEmails();
    return res;
  };

  const signup = async (name: string, email: string) => {
    const res = await api.signup(name, email);
    refreshEmails();
    return res;
  };

  const openAuthModal = (mode: 'signup' | 'login' = 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const verifyOtp = async (email: string, otp: string, purpose: 'signup' | 'login') => {
    const res = await api.verifyOtp(email, otp, purpose);
    setUser(res.user);
    setTokenState(res.access_token);
    setSoundEnabledState(res.user.notification_prefs?.sound_enabled ?? true);
    setIsAuthModalOpen(false);

    // Sync authenticated profile to Firestore database
    try {
      await setDoc(
        doc(db, 'users', res.user._id),
        {
          uid: res.user._id,
          email: res.user.email,
          displayName: res.user.name,
          is_verified: true,
          createdAt: res.user.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (fbErr) {
      console.warn('Firestore user profile sync notice:', fbErr);
    }

    playNotificationChime(true);
    refreshNotifications();
    refreshEmails();
    return res.user;
  };

  const loginWithGoogle = async (): Promise<User> => {
    const res = await signInWithPopup(auth, googleProvider);
    const fbUser = res.user;
    const userObj: User = {
      _id: fbUser.uid,
      email: fbUser.email || 'user@example.com',
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Researcher',
      avatar_url: fbUser.photoURL || undefined,
      is_verified: true,
      created_at: new Date().toISOString(),
      notification_prefs: {
        sound_enabled: true,
        email_enabled: true,
        desktop_enabled: true,
      },
    };

    try {
      await setDoc(
        doc(db, 'users', fbUser.uid),
        {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: userObj.name,
          photoURL: fbUser.photoURL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      if (e instanceof Error && e.message.includes('permission')) {
        handleFirestoreError(e, OperationType.WRITE, `users/${fbUser.uid}`);
      } else {
        console.warn('Firestore user profile sync notice:', e);
      }
    }

    setUser(userObj);
    setAuthToken(`fb_${fbUser.uid}`);
    setTokenState(`fb_${fbUser.uid}`);
    setIsAuthModalOpen(false);
    playNotificationChime(true);
    return userObj;
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout notice:', e);
    }
    try {
      await api.logout();
    } catch (e) {
      console.warn('API logout notice:', e);
    }
    setAuthToken(null);
    setUser(null);
    setTokenState(null);
    setNotifications([]);
    setIsAuthModalOpen(true);
    setAuthModalMode('signup');
  };

  const deleteAccount = async () => {
    const currentUid = user?._id || auth.currentUser?.uid;
    try {
      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'users', auth.currentUser.uid));
        } catch (e) {
          console.warn('Firebase user doc delete notice:', e);
        }
        try {
          await fbSignOut(auth);
        } catch (e) {
          console.warn('Firebase signout on delete notice:', e);
        }
      }
      await api.deleteAccount();
    } catch (e) {
      console.warn('Delete account notice:', e);
    } finally {
      setAuthToken(null);
      setUser(null);
      setTokenState(null);
      setNotifications([]);
      setEmails([]);
      localStorage.removeItem('sug_auth_token');
      localStorage.removeItem('sug_cached_workspaces');
      setIsAuthModalOpen(true);
      setAuthModalMode('signup');
    }
  };

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        notifications,
        unreadNotificationCount,
        emails,
        isNotificationOpen,
        setIsNotificationOpen,
        isEmailViewerOpen,
        setIsEmailViewerOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        soundEnabled,
        setSoundEnabled,
        login,
        signup,
        verifyOtp,
        loginWithGoogle,
        logout,
        deleteAccount,
        markNotificationRead,
        markAllNotificationsRead,
        refreshNotifications,
        refreshEmails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
