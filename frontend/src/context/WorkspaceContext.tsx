import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Workspace,
  Persona,
  Survey,
  Interview,
  InsightsReport,
  BackgroundJob,
} from '../types';
import { api } from '../services/api';
import { ALL_101_QA_PERSONAS, convertQAPersonaToPersona } from '../data/qaPersonas';
import { useAuth } from './AuthContext';
import { playNotificationChime, playAlertSound } from '../utils/audio';
import {
  db,
  auth,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  collection,
  query,
  where,
  handleFirestoreError,
  OperationType,
} from '../services/firebase';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace | null) => void;
  personas: Persona[];
  surveys: Survey[];
  interviews: Interview[];
  insights: InsightsReport | null;
  activeJob: BackgroundJob | null;
  isJobModalOpen: boolean;
  setIsJobModalOpen: (open: boolean) => void;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchWorkspaces: () => Promise<void>;
  selectWorkspaceById: (id: string) => Promise<void>;
  createWorkspace: (data: Omit<Workspace, '_id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Workspace>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<Workspace | void>;
  deleteWorkspace: (id: string) => Promise<void>;
  fetchPersonas: () => Promise<void>;
  generatePersonas: (count: number, targetWsId?: string) => Promise<string>;
  seedDemoPersonas: (count?: number, targetWsId?: string) => Promise<string>;
  regeneratePersona: (id: string) => Promise<Persona>;
  loadQAPersonas: () => void;
  fetchSurveys: () => Promise<void>;
  createSurvey: (data: { title: string; questions: Survey['questions'] }) => Promise<Survey>;
  runSurvey: (surveyId: string, personaIds?: string[]) => Promise<string>;
  fetchInterviews: () => Promise<void>;
  createInterview: (personaId: string, title?: string) => Promise<Interview>;
  fetchInsights: () => Promise<void>;
  generateInsights: () => Promise<string>;
  refreshAllActiveWorkspaceData: () => Promise<void>;
}

const DEFAULT_STARTER_WORKSPACE: Workspace = {
  _id: 'ws_ironbark_soap',
  user_id: 'usr_demo',
  name: 'Ironbark Tactical Soap',
  product_name: 'Ironbark Tactical Soap',
  product_description:
    'A heavy-duty, all-natural exfoliating bar soap engineered for veterans, active outdoorspeople, and trade workers. Formulated with pumice, tea tree oil, and pine pitch without synthetic fragrances or slippery residue.',
  target_audience: {
    age_range: [50, 60],
    gender: 'All Genders',
    location: 'United States (Suburban & Rural)',
    occupation: 'Military Veterans & Trade Workers',
    income: '$50,000 - $100,000',
    segment_tags: ['Military', 'Trades & Labor', 'Outdoor Enthusiasts'],
    extra_details: 'Value long-lasting bar durability, skin cleanliness, and grip.',
  },
  research_objective:
    'How many people in this demographic would prefer a different soap with natural grip and grit instead of supermarket bars?',
  created_at: '2026-09-18T12:00:00.000Z',
  updated_at: '2026-09-18T12:00:00.000Z',
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, soundEnabled, refreshNotifications } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const cached = localStorage.getItem('sug_cached_workspaces');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [DEFAULT_STARTER_WORKSPACE];
  });

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(() => {
    try {
      const cached = localStorage.getItem('sug_cached_workspaces');
      const cachedActiveId = localStorage.getItem('sug_active_workspace_id');
      if (cached) {
        const parsed: Workspace[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (cachedActiveId) {
            const found = parsed.find((w) => w._id === cachedActiveId);
            if (found) return found;
          }
          return parsed[0];
        }
      }
    } catch (e) {}
    return DEFAULT_STARTER_WORKSPACE;
  });

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [insights, setInsights] = useState<InsightsReport | null>(null);
  const [activeJob, setActiveJob] = useState<BackgroundJob | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prevJobStatusRef = useRef<string | null>(null);

  // Helper to persist cached workspaces
  const persistCachedWorkspaces = (list: Workspace[]) => {
    try {
      localStorage.setItem('sug_cached_workspaces', JSON.stringify(list));
    } catch (e) {}
  };

  // Fetch workspaces when user signs in
  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);

      // 1. Check Firestore for previously saved workspaces for this user
      let firestoreWorkspaces: Workspace[] = [];
      try {
        const snap = await getDocs(collection(db, 'workspaces'));
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          const targetUid = user._id || auth.currentUser?.uid || 'usr_default';
          if (!d.userId || d.userId === targetUid || d.user_id === targetUid) {
            firestoreWorkspaces.push({
              _id: docSnap.id,
              user_id: targetUid,
              name: d.name || d.product_name || 'Workspace',
              product_name: d.product_name || d.name || 'Workspace',
              product_description: d.product_description || '',
              target_audience: d.target_audience || DEFAULT_STARTER_WORKSPACE.target_audience,
              research_objective: d.research_objective || '',
              target_price: d.target_price,
              created_at: d.created_at || new Date().toISOString(),
              updated_at: d.updated_at || new Date().toISOString(),
            });
          }
        });
      } catch (fbErr) {
        console.warn('Firestore workspace query notice:', fbErr);
      }

      // 2. If Firebase has existing workspaces for this user, load them
      if (firestoreWorkspaces.length > 0) {
        setWorkspaces(firestoreWorkspaces);
        persistCachedWorkspaces(firestoreWorkspaces);
        api.syncWorkspaces(firestoreWorkspaces).catch(() => {});
        setActiveWorkspace((curr) => {
          if (curr && firestoreWorkspaces.some((w) => w._id === curr._id)) {
            return curr;
          }
          const next = firestoreWorkspaces[0];
          try {
            localStorage.setItem('sug_active_workspace_id', next._id);
          } catch (e) {}
          return next;
        });
      } else {
        // 3. Newly logged in user with no data in Firebase yet!
        // Save the previous workspace data (from memory or localStorage) to Firebase Firestore
        let previousWorkspaces: Workspace[] = [];
        try {
          const cached = localStorage.getItem('sug_cached_workspaces');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              previousWorkspaces = parsed;
            }
          }
        } catch {}

        if (previousWorkspaces.length === 0) {
          previousWorkspaces = workspaces.length > 0 ? workspaces : [DEFAULT_STARTER_WORKSPACE];
        }

        const targetUid = user._id || auth.currentUser?.uid || 'usr_default';
        const savedWorkspaces: Workspace[] = [];

        for (const ws of previousWorkspaces) {
          const wsToSave: Workspace = {
            ...ws,
            user_id: targetUid,
            updated_at: new Date().toISOString(),
          };

          try {
            await setDoc(
              doc(db, 'workspaces', wsToSave._id),
              {
                id: wsToSave._id,
                userId: targetUid,
                user_id: targetUid,
                name: wsToSave.name,
                product_name: wsToSave.product_name,
                product_description: wsToSave.product_description,
                target_audience: wsToSave.target_audience,
                research_objective: wsToSave.research_objective,
                target_price: wsToSave.target_price || null,
                status: 'active',
                created_at: wsToSave.created_at || new Date().toISOString(),
                updated_at: wsToSave.updated_at || new Date().toISOString(),
              },
              { merge: true }
            );
            savedWorkspaces.push(wsToSave);
          } catch (err) {
            console.warn('Error saving initial workspace to Firebase on login:', err);
          }
        }

        const finalWorkspaces = savedWorkspaces.length > 0 ? savedWorkspaces : previousWorkspaces;
        setWorkspaces(finalWorkspaces);
        persistCachedWorkspaces(finalWorkspaces);
        api.syncWorkspaces(finalWorkspaces).catch(() => {});
        setActiveWorkspace(finalWorkspaces[0]);
      }
    } catch (err: any) {
      console.warn('Workspace sync notification (serving cached state):', err?.message || err);
      // Retain existing or cached workspace so interface remains fully functional
      setWorkspaces((prev) => (prev.length > 0 ? prev : [DEFAULT_STARTER_WORKSPACE]));
      setActiveWorkspace((curr) => curr || DEFAULT_STARTER_WORKSPACE);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([DEFAULT_STARTER_WORKSPACE]);
      setActiveWorkspace(DEFAULT_STARTER_WORKSPACE);
      setPersonas([]);
      setSurveys([]);
      setInterviews([]);
      setInsights(null);
      setActiveJob(null);
    }
  }, [user, fetchWorkspaces]);

  // Load workspace details when activeWorkspace changes
  const refreshAllActiveWorkspaceData = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      const [personasData, surveysData, interviewsData, insightsData] = await Promise.all([
        api.getPersonas(activeWorkspace._id).catch(() => []),
        api.getSurveys(activeWorkspace._id).catch(() => []),
        api.getInterviews(activeWorkspace._id).catch(() => []),
        api.getInsights(activeWorkspace._id).catch(() => null),
      ]);
      if (personasData && personasData.length > 0) {
        setPersonas(personasData);
      } else {
        setPersonas([]);
      }
      setSurveys(surveysData || []);
      setInterviews(interviewsData || []);
      setInsights(insightsData || null);
    } catch (err) {
      console.warn('Workspace data sync notice (falling back gracefully):', err);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeWorkspace) {
      refreshAllActiveWorkspaceData();
    }
  }, [activeWorkspace, refreshAllActiveWorkspaceData]);

  // Active Job Polling
  useEffect(() => {
    if (!user) return;

    const checkJobs = async () => {
      try {
        const jobs = await api.getActiveJobs();
        const relevantJob = activeWorkspace
          ? jobs.find((j) => j.workspace_id === activeWorkspace._id && (j.status === 'running' || j.status === 'queued'))
          : jobs[0];

        if (relevantJob) {
          setActiveJob(relevantJob);
          prevJobStatusRef.current = relevantJob.status;
        } else if (activeJob && (activeJob.status === 'running' || activeJob.status === 'queued')) {
          // Check the specific job to see if it just finished
          const updated = await api.getJob(activeJob._id);
          if (updated) {
            setActiveJob(updated);

            if (
              (updated.status === 'completed' || updated.status === 'completed_with_errors' || updated.status === 'failed') &&
              prevJobStatusRef.current !== updated.status
            ) {
              prevJobStatusRef.current = updated.status;
              if (updated.status === 'completed' || updated.status === 'completed_with_errors') {
                playNotificationChime(soundEnabled);
              }
              refreshNotifications();
              refreshAllActiveWorkspaceData();
            }
          }
        }
      } catch (err) {
        console.error('Job polling error:', err);
      }
    };

    checkJobs();
    const interval = setInterval(checkJobs, 2000);
    return () => clearInterval(interval);
  }, [user, activeWorkspace, activeJob, soundEnabled, refreshNotifications, refreshAllActiveWorkspaceData]);

  const selectWorkspaceById = async (id: string) => {
    const ws = workspaces.find((w) => w._id === id);
    if (ws) {
      setActiveWorkspace(ws);
    } else {
      try {
        const fetched = await api.getWorkspace(id);
        setActiveWorkspace(fetched);
      } catch (err) {
        console.error('Failed to select workspace:', err);
      }
    }
  };

  const createWorkspace = async (data: Omit<Workspace, '_id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newWs = await api.createWorkspace(data);
    setWorkspaces((prev) => {
      const updated = [newWs, ...prev];
      persistCachedWorkspaces(updated);
      return updated;
    });
    setActiveWorkspace(newWs);

    const uid = auth.currentUser?.uid || user?._id;
    if (uid) {
      try {
        await setDoc(
          doc(db, 'workspaces', newWs._id),
          {
            id: newWs._id,
            userId: uid,
            user_id: uid,
            name: newWs.name,
            product_name: newWs.product_name,
            product_description: newWs.product_description,
            target_audience: newWs.target_audience,
            research_objective: newWs.research_objective,
            target_price: newWs.target_price || null,
            status: 'active',
            created_at: newWs.created_at || new Date().toISOString(),
            updated_at: newWs.updated_at || new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        if (err instanceof Error && err.message.includes('permission')) {
          handleFirestoreError(err, OperationType.WRITE, `workspaces/${newWs._id}`);
        } else {
          console.warn('Firestore workspace sync notice:', err);
        }
      }
    }

    return newWs;
  };

  const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
    try {
      const res = await api.updateWorkspace(id, updates);
      const updatedWs = res.workspace || {
        ...(workspaces.find((w) => w._id === id) as Workspace),
        ...updates,
      };
      setWorkspaces((prev) => prev.map((w) => (w._id === id ? { ...w, ...updatedWs } : w)));
      if (activeWorkspace?._id === id) {
        setActiveWorkspace((prev) => (prev ? { ...prev, ...updatedWs } : updatedWs));
      }
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'workspaces', id), updates, { merge: true });
        } catch (err) {
          console.warn('Firestore workspace update notice:', err);
        }
      }
      return updatedWs;
    } catch (err) {
      console.warn('Backend workspace update fallback:', err);
      setWorkspaces((prev) =>
        prev.map((w) => (w._id === id ? { ...w, ...updates } : w))
      );
      if (activeWorkspace?._id === id) {
        setActiveWorkspace((prev) => (prev ? { ...prev, ...updates } : null));
      }
    }
  };

  const deleteWorkspace = async (id: string) => {
    await api.deleteWorkspace(id);
    setWorkspaces((prev) => prev.filter((w) => w._id !== id));
    if (activeWorkspace?._id === id) {
      const remaining = workspaces.filter((w) => w._id !== id);
      setActiveWorkspace(remaining.length > 0 ? remaining[0] : null);
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'workspaces', id));
      } catch (err) {
        if (err instanceof Error && err.message.includes('permission')) {
          handleFirestoreError(err, OperationType.DELETE, `workspaces/${id}`);
        } else {
          console.warn('Firestore workspace delete notice:', err);
        }
      }
    }
  };

  const fetchPersonas = async () => {
    if (!activeWorkspace) return;
    const data = await api.getPersonas(activeWorkspace._id);
    setPersonas(data);
  };

  const trackJobCompletion = (jobId: string, onComplete?: () => void) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const job = await api.getJob(jobId);
        if (job) {
          setActiveJob(job);
          if (job.status === 'completed' || job.status === 'completed_with_errors' || job.progress >= 100) {
            clearInterval(interval);
            // Play alert sound for persona generation
            if (job.type === 'generate_personas') {
              playAlertSound(soundEnabled);
            } else {
              playNotificationChime(soundEnabled);
            }
            await fetchPersonas();
            await refreshAllActiveWorkspaceData();
            refreshNotifications();
            if (onComplete) onComplete();
          } else if (job.status === 'failed' || attempts > 60) {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.warn('Track job error:', err);
      }
    }, 350);
  };

  const generatePersonas = async (count: number, targetWsId?: string) => {
    const wsId = targetWsId || activeWorkspace?._id;
    if (!wsId) throw new Error('No active workspace');
    const res = await api.generatePersonas(wsId, count);
    const job = await api.getJob(res.job_id);
    setActiveJob(job);
    setIsJobModalOpen(true);
    trackJobCompletion(res.job_id, () => {
      playAlertSound(soundEnabled);
    });
    return res.job_id;
  };

  const seedDemoPersonas = async (count = 100, targetWsId?: string) => {
    const wsId = targetWsId || activeWorkspace?._id;
    if (!wsId) throw new Error('No active workspace');
    const res = await api.seedDemoPersonas(wsId, count);
    const job = await api.getJob(res.job_id);
    setActiveJob(job);
    setIsJobModalOpen(true);
    trackJobCompletion(res.job_id, () => {
      playNotificationChime(soundEnabled);
    });
    return res.job_id;
  };

  const regeneratePersona = async (personaId: string) => {
    const updated = await api.regeneratePersona(personaId);
    setPersonas((prev) => prev.map((p) => (p._id === personaId ? updated : p)));
    return updated;
  };

  const loadQAPersonas = () => {
    if (!activeWorkspace) return;
    const fallbackPersonas = ALL_101_QA_PERSONAS.map((p) => convertQAPersonaToPersona(p, activeWorkspace._id));
    setPersonas(fallbackPersonas);
  };

  const fetchSurveys = async () => {
    if (!activeWorkspace) return;
    const data = await api.getSurveys(activeWorkspace._id);
    setSurveys(data);
  };

  const createSurvey = async (data: { title: string; questions: Survey['questions'] }) => {
    if (!activeWorkspace) throw new Error('No active workspace');
    const newSurvey = await api.createSurvey(activeWorkspace._id, data);
    setSurveys((prev) => [newSurvey, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(
          doc(db, 'workspaces', activeWorkspace._id, 'surveys', newSurvey._id),
          {
            id: newSurvey._id,
            workspace_id: activeWorkspace._id,
            title: newSurvey.title,
            status: newSurvey.status || 'draft',
            questions: newSurvey.questions,
            created_at: newSurvey.created_at || new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        if (err instanceof Error && err.message.includes('permission')) {
          handleFirestoreError(
            err,
            OperationType.WRITE,
            `workspaces/${activeWorkspace._id}/surveys/${newSurvey._id}`
          );
        } else {
          console.warn('Firestore survey sync notice:', err);
        }
      }
    }

    return newSurvey;
  };

  const runSurvey = async (surveyId: string, personaIds?: string[]) => {
    const res = await api.runSurvey(surveyId, personaIds);
    if (res.job_id) {
      try {
        const job = await api.getJob(res.job_id);
        setActiveJob(job);
      } catch (e) {}
    }
    playNotificationChime(soundEnabled);
    await refreshAllActiveWorkspaceData();
    refreshNotifications();
    return res.job_id;
  };

  const fetchInterviews = async () => {
    if (!activeWorkspace) return;
    const data = await api.getInterviews(activeWorkspace._id);
    setInterviews(data);
  };

  const createInterview = async (personaId: string, title?: string) => {
    if (!activeWorkspace) throw new Error('No active workspace');
    const newInterview = await api.createInterview(activeWorkspace._id, personaId, title);
    setInterviews((prev) => [newInterview, ...prev]);
    return newInterview;
  };

  const fetchInsights = async () => {
    if (!activeWorkspace) return;
    const data = await api.getInsights(activeWorkspace._id);
    setInsights(data);
  };

  const generateInsights = async () => {
    if (!activeWorkspace) throw new Error('No active workspace');
    const res = await api.generateInsights(activeWorkspace._id);
    const job = await api.getJob(res.job_id);
    setActiveJob(job);
    setIsJobModalOpen(true);
    return res.job_id;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        personas,
        surveys,
        interviews,
        insights,
        activeJob,
        isJobModalOpen,
        setIsJobModalOpen,
        isLoading,
        error,
        fetchWorkspaces,
        selectWorkspaceById,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        fetchPersonas,
        generatePersonas,
        seedDemoPersonas,
        regeneratePersona,
        loadQAPersonas,
        fetchSurveys,
        createSurvey,
        runSurvey,
        fetchInterviews,
        createInterview,
        fetchInsights,
        generateInsights,
        refreshAllActiveWorkspaceData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
