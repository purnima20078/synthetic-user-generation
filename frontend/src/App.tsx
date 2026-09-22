import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { JobProgressModal } from './components/common/JobProgressModal';
import { AuthModal } from './components/auth/AuthModal';
import { EmailViewerModal } from './components/common/EmailViewerModal';
import { WorkspaceWizardModal } from './components/workspace/WorkspaceWizardModal';
import { WorkspaceListModal } from './components/workspace/WorkspaceListModal';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { Sidebar, ViewMode } from './components/common/Sidebar';
import { WouldUseScoreView } from './components/would-use/WouldUseScoreView';
import { PersonaCard } from './components/personas/PersonaCard';
import { PersonaDetailModal } from './components/personas/PersonaDetailModal';
import { PersonaFilters } from './components/personas/PersonaFilters';
import { GeneratePersonasModal } from './components/personas/GeneratePersonasModal';
import { SurveyBuilder } from './components/surveys/SurveyBuilder';
import { SurveyResultsGrid } from './components/surveys/SurveyResultsGrid';
import { InterviewChat } from './components/interviews/InterviewChat';
import { InsightsDashboard } from './components/insights/InsightsDashboard';
import { ReportView } from './components/reports/ReportView';
import { AskAiModal } from './components/common/AskAiModal';
import { QAValidationPage } from './pages/QAValidationPage';
import { LandingPage } from './components/landing/LandingPage';
import { ALL_101_QA_PERSONAS, convertQAPersonaToPersona } from './data/qaPersonas';
import { motion, AnimatePresence } from 'motion/react';
import { Persona, Survey, SurveyResponse, Interview } from './types';
import { api } from './services/api';
import { AvatarImage } from './utils/avatar';
import { playAlertSound, playNotificationChime } from './utils/audio';
import {
  Sparkles,
  Users,
  ClipboardList,
  Plus,
  Minus,
  Play,
  Layers,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Search,
  AlertCircle,
  Loader2,
  Sliders,
  Volume2,
} from 'lucide-react';

function MainApp() {
  const { user, openAuthModal, isEmailViewerOpen, setIsEmailViewerOpen } = useAuth();
  const {
    activeWorkspace,
    workspaces,
    personas,
    surveys,
    interviews,
    insights,
    generatePersonas,
    seedDemoPersonas,
    regeneratePersona,
    createSurvey,
    runSurvey,
    createInterview,
    generateInsights,
    loadQAPersonas,
    refreshAllActiveWorkspaceData,
  } = useWorkspace();

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isWorkspaceListOpen, setIsWorkspaceListOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [quickPersonaCount, setQuickPersonaCount] = useState<number>(10);
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);

  // Persona View state
  const [selectedPersonaForModal, setSelectedPersonaForModal] = useState<Persona | null>(null);
  const [personaSearch, setPersonaSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('ALL');
  const [personaSort, setPersonaSort] = useState('newest');

  // Survey View state
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false);
  const [isSurveyRunning, setIsSurveyRunning] = useState(false);

  // Interview View state
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [interviewPersona, setInterviewPersona] = useState<Persona | null>(null);
  const [interviewSearch, setInterviewSearch] = useState('');

  // Insights generation loading
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Auto select default survey if available
  useEffect(() => {
    if (surveys.length > 0 && !activeSurvey) {
      setActiveSurvey(surveys[0]);
    }
  }, [surveys, activeSurvey]);

  // Fetch responses when active survey changes
  useEffect(() => {
    if (activeSurvey) {
      api
        .getSurveyResponses(activeSurvey._id)
        .then((res) => setSurveyResponses(res))
        .catch((err) => console.warn('Notice fetching survey responses:', err?.message || err));
    } else {
      setSurveyResponses([]);
    }
  }, [activeSurvey]);

  // Ensure an interview is selected or prepared when entering interview view
  useEffect(() => {
    if (currentView === 'interviews' && personas.length > 0 && !interviewPersona) {
      setInterviewPersona(personas[0]);
    }
  }, [currentView, personas, interviewPersona]);

  // Load or create interview session for active interview persona
  useEffect(() => {
    if (interviewPersona && activeWorkspace) {
      // Find existing interview or create new
      const existing = interviews.find((i) => i.persona_id === interviewPersona._id);
      if (existing) {
        setActiveInterview(existing);
      } else {
        createInterview(interviewPersona._id, `Interview with ${interviewPersona.name}`).then((inv) => {
          setActiveInterview(inv);
        });
      }
    }
  }, [interviewPersona, activeWorkspace]);

  // Auto prompt workspace wizard if user has no workspaces
  useEffect(() => {
    if (user && workspaces.length === 0) {
      setIsWizardOpen(true);
    }
  }, [user, workspaces.length]);

  // Filter & sort personas
  const segments = Array.from(new Set(personas.map((p) => p.segment).filter(Boolean)));
  const filteredPersonas = personas
    .filter((p) => {
      if (selectedSegment !== 'ALL' && p.segment !== selectedSegment) return false;
      if (personaSearch.trim()) {
        const query = personaSearch.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchOcc = p.occupation.toLowerCase().includes(query);
        const matchLoc = p.location.toLowerCase().includes(query);
        const matchQuote = p.quote?.toLowerCase().includes(query);
        return matchName || matchOcc || matchLoc || matchQuote;
      }
      return true;
    })
    .sort((a, b) => {
      if (personaSort === 'age_asc') return a.age - b.age;
      if (personaSort === 'age_desc') return b.age - a.age;
      if (personaSort === 'openness')
        return b.personality_traits.ocean.openness - a.personality_traits.ocean.openness;
      if (personaSort === 'conscientiousness')
        return b.personality_traits.ocean.conscientiousness - a.personality_traits.ocean.conscientiousness;
      if (personaSort === 'extraversion')
        return b.personality_traits.ocean.extraversion - a.personality_traits.ocean.extraversion;
      if (personaSort === 'agreeableness')
        return b.personality_traits.ocean.agreeableness - a.personality_traits.ocean.agreeableness;
      if (personaSort === 'neuroticism')
        return b.personality_traits.ocean.neuroticism - a.personality_traits.ocean.neuroticism;
      return 0; // newest
    });

  const handleStartInterview = (personaId: string) => {
    const p = personas.find((item) => item._id === personaId);
    if (p) {
      setInterviewPersona(p);
      setCurrentView('interviews');
    }
  };

  const handleSaveNewSurvey = async (title: string, questions: any[]) => {
    try {
      const created = await createSurvey({ title, questions });
      setActiveSurvey(created);
      setIsCreatingSurvey(false);
    } catch (err) {
      console.error('Failed to create survey:', err);
    }
  };

  const handleRunActiveSurvey = async () => {
    if (!activeSurvey) return;
    try {
      setIsSurveyRunning(true);
      await runSurvey(activeSurvey._id);
      const res = await api.getSurveyResponses(activeSurvey._id);
      setSurveyResponses(res);
      playNotificationChime(true);
    } catch (err) {
      console.error('Survey execution error:', err);
    } finally {
      setIsSurveyRunning(false);
    }
  };

  const handleTriggerInsights = async () => {
    try {
      setIsGeneratingInsights(true);
      await generateInsights();
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (!user) {
    return (
      <>
        <LandingPage
          onEnterStudio={() => openAuthModal('signup')}
          onOpenAuth={(tab) => openAuthModal(tab)}
        />
        <AuthModal />
        <EmailViewerModal
          isOpen={isEmailViewerOpen}
          onClose={() => setIsEmailViewerOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Static Persistent Sidebar with Navigation and Logout */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenWorkspaceList={() => setIsWorkspaceListOpen(true)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pt-14 lg:pt-0">
        {/* Top Context Bar */}
        {activeWorkspace && (
          <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                {currentView === 'dashboard'
                  ? 'Overview'
                  : currentView === 'personas'
                  ? 'Synthetic Personas'
                  : currentView === 'surveys'
                  ? 'Survey Mode'
                  : currentView === 'interviews'
                  ? 'Interview Mode'
                  : currentView === 'would-use'
                  ? 'Would Use This Product'
                  : currentView === 'validation'
                  ? 'QA Validation Suite'
                  : currentView === 'insights'
                  ? 'Insights & Scoring'
                  : 'Report & Export'}
              </span>
              <span className="text-xs text-slate-400 truncate hidden sm:inline">
                Product: <strong className="text-slate-200">{activeWorkspace.product_name}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                title="Firebase Firestore Database connected and synchronized"
                className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Firebase Synced
              </span>
              <button
                onClick={() => setIsAskAiOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                title="Ask AI for doubts or research guidance"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Workspace</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Workspace Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!activeWorkspace ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No Active Research Workspace</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a synthetic cohort for your product to start validating assumptions.
            </p>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              Launch Workspace Wizard
            </button>
          </div>
        ) : (
          <>
            {/* VIEW 1: OVERVIEW DASHBOARD */}
            {currentView === 'dashboard' && (
              <OverviewDashboard
                workspace={activeWorkspace}
                personas={personas}
                surveys={surveys}
                interviews={interviews}
                insights={insights}
                onGeneratePersonas={(c) => generatePersonas(c)}
                onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
                onSeedDemo={(c) => seedDemoPersonas(c)}
                onNavigate={setCurrentView}
              />
            )}

            {/* VIEW 2: PERSONAS DIRECTORY */}
            {currentView === 'personas' && (
              <div className="space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" />
                      Synthetic Population ({personas.length})
                    </h2>
                    <p className="text-xs text-slate-400">
                      High-fidelity AI personas with OCEAN psychological profiles, consumer habits, and memory timelines
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Interactive Count Stepper & Generator */}
                    <div className="flex items-center bg-slate-900 border border-indigo-500/30 rounded-xl p-1 gap-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setQuickPersonaCount((prev) => Math.max(1, prev - 5))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold transition-colors"
                        title="Decrease count by 5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div className="px-1.5 flex items-center gap-1 text-xs">
                        <span className="text-slate-400 text-[11px]">Count:</span>
                        <input
                          type="number"
                          min={1}
                          max={250}
                          value={quickPersonaCount}
                          onChange={(e) =>
                            setQuickPersonaCount(
                              Math.max(1, Math.min(250, parseInt(e.target.value, 10) || 1))
                            )
                          }
                          className="w-10 bg-transparent text-center font-mono font-bold text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuickPersonaCount((prev) => Math.min(250, prev + 5))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold transition-colors"
                        title="Increase count by 5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => generatePersonas(quickPersonaCount)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 active:scale-98"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Generate +{quickPersonaCount}</span>
                      </button>
                    </div>

                    {/* Open Full Count Modal */}
                    <button
                      onClick={() => setIsGenerateModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-indigo-500/30 transition-colors"
                      title="Choose count, presets, and audio alert options"
                    >
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Custom Count...</span>
                    </button>

                    {/* Test Completion Alert Sound */}
                    <button
                      onClick={() => {
                        setIsTestingSound(true);
                        playAlertSound(true);
                        setTimeout(() => setIsTestingSound(false), 1200);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors active:scale-95"
                      title="Test the completion alert chime right now"
                    >
                      <Volume2
                        className={`w-3.5 h-3.5 ${
                          isTestingSound ? 'text-cyan-400 animate-bounce' : 'text-slate-400'
                        }`}
                      />
                      <span className="hidden sm:inline">
                        {isTestingSound ? 'Alert Sounding...' : 'Test Alert Sound'}
                      </span>
                    </button>

                    <button
                      onClick={loadQAPersonas}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" /> Load 101 QA
                    </button>
                  </div>
                </div>

                {/* Filters, Search & Sort */}
                <PersonaFilters
                  search={personaSearch}
                  onSearchChange={setPersonaSearch}
                  selectedSegment={selectedSegment}
                  onSegmentChange={setSelectedSegment}
                  segments={segments}
                  sortBy={personaSort}
                  onSortChange={setPersonaSort}
                  totalCount={personas.length}
                />

                {/* Personas Grid */}
                {filteredPersonas.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
                    No synthetic personas found matching your search criteria.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPersonas.map((persona) => (
                      <PersonaCard
                        key={persona._id}
                        persona={persona}
                        onClick={(p) => setSelectedPersonaForModal(p)}
                        onRegenerate={async (e, id) => {
                          e.stopPropagation();
                          await regeneratePersona(id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: SURVEY MODE */}
            {currentView === 'surveys' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-indigo-400" />
                      Survey Mode (Cohort Evaluation)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Query your entire synthetic audience simultaneously with structured question sets
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSurvey && !isCreatingSurvey && (
                      <button
                        onClick={handleRunActiveSurvey}
                        disabled={isSurveyRunning || personas.length === 0}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 transition-all"
                      >
                        {isSurveyRunning ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating Responses...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" /> Run Survey on {personas.length} Personas
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setIsCreatingSurvey(!isCreatingSurvey)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isCreatingSurvey
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isCreatingSurvey ? 'Cancel Builder' : 'New Survey'}
                    </button>
                  </div>
                </div>

                {/* Constraint Warning: Must generate personas before running survey */}
                {personas.length === 0 && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
                    <div className="flex items-center gap-2.5 text-xs font-semibold">
                      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>No synthetic personas generated yet. A target audience cohort must be synthesized before executing surveys.</span>
                    </div>
                    <button
                      onClick={() => setCurrentView('personas')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 transition-colors"
                    >
                      Generate Personas →
                    </button>
                  </div>
                )}

                {/* Survey Ready Banner when personas exist but survey hasn't been executed yet */}
                {personas.length > 0 && surveyResponses.length === 0 && !isCreatingSurvey && (
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-200">
                    <div className="flex items-center gap-2.5 text-xs font-semibold">
                      <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                      <span>Cohort of {personas.length} synthetic personas ready. Click <strong>"Run Survey on {personas.length} Personas"</strong> to simulate responses across all demographic segments.</span>
                    </div>
                    <button
                      onClick={handleRunActiveSurvey}
                      disabled={isSurveyRunning}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 shrink-0 transition-all"
                    >
                      {isSurveyRunning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" /> Run Survey Now
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Survey Selector if multiple */}
                {surveys.length > 1 && !isCreatingSurvey && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Active Survey:
                    </span>
                    {surveys.map((s) => (
                      <button
                        key={s._id}
                        onClick={() => setActiveSurvey(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                          activeSurvey?._id === s._id
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                )}

                {isCreatingSurvey ? (
                  <SurveyBuilder onSaveSurvey={handleSaveNewSurvey} isLoading={false} />
                ) : activeSurvey ? (
                  <SurveyResultsGrid
                    survey={activeSurvey}
                    responses={surveyResponses}
                    personas={personas}
                    onOpenPersona={(p) => setSelectedPersonaForModal(p)}
                    onExportCsv={() => setCurrentView('reports')}
                  />
                ) : (
                  <div className="py-16 text-center text-xs text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                    No survey created yet. Click "New Survey" above to compose a questionnaire.
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 4: INTERVIEW MODE */}
            {currentView === 'interviews' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      1-on-1 Qualitative Interview Mode
                    </h2>
                    <p className="text-xs text-slate-400">
                      Engage in deep, multi-turn grounded conversations with any individual persona
                    </p>
                  </div>

                  {/* Persona Selector Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Interviewing:</span>
                    <select
                      value={interviewPersona?._id || ''}
                      onChange={(e) => {
                        const p = personas.find((item) => item._id === e.target.value);
                        if (p) setInterviewPersona(p);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    >
                      {personas.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.occupation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {interviewPersona && activeInterview ? (
                  <InterviewChat
                    persona={interviewPersona}
                    interview={activeInterview}
                    onUpdateInterview={(updated) => setActiveInterview(updated)}
                    onOpenPersonaModal={(p) => setSelectedPersonaForModal(p)}
                  />
                ) : (
                  <div className="py-16 text-center text-xs text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                    Please generate personas first to begin 1-on-1 interviews.
                  </div>
                )}
              </div>
            )}

            {/* VIEW: WOULD USE THIS PRODUCT */}
            {currentView === 'would-use' && (
              <WouldUseScoreView
                workspaceId={activeWorkspace._id}
                productName={activeWorkspace.product_name}
                onNavigateToPersonas={() => setCurrentView('personas')}
              />
            )}

            {/* VIEW: QA VALIDATION SUITE */}
            {currentView === 'validation' && (
              <QAValidationPage />
            )}

            {/* VIEW 5: INSIGHTS & SCORING */}
            {currentView === 'insights' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Insight Extraction & Product Viability Scoring
                  </h2>
                  <p className="text-xs text-slate-400">
                    Synthesized market fit analysis, tension points, and prioritised recommendations powered by Gemini
                  </p>
                </div>

                <InsightsDashboard
                  insights={insights}
                  onGenerateInsights={handleTriggerInsights}
                  isGenerating={isGeneratingInsights}
                />
              </div>
            )}

            {/* VIEW 6: REPORT & EXPORT */}
            {currentView === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Executive Dossier & Multi-Format Export
                  </h2>
                  <p className="text-xs text-slate-400">
                    Export complete research deliverables to Markdown, CSV matrix, print-ready PDF or shareable links
                  </p>
                </div>

                <ReportView
                  workspace={activeWorkspace}
                  insights={insights}
                  personas={personas}
                  surveys={surveys}
                  responses={surveyResponses}
                />
              </div>
            )}
          </>
        )}
      </main>
      </div>

      {/* Global Modals & Overlays */}
      <AuthModal />
      <EmailViewerModal
        isOpen={isEmailViewerOpen}
        onClose={() => setIsEmailViewerOpen(false)}
      />
      <NotificationDrawer />
      <JobProgressModal onNavigateToTab={(tab) => setCurrentView(tab)} />

      <WorkspaceWizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />

      <GeneratePersonasModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={(c) => generatePersonas(c)}
        workspace={activeWorkspace}
        currentPersonaCount={personas.length}
      />

      <WorkspaceListModal
        isOpen={isWorkspaceListOpen}
        onClose={() => setIsWorkspaceListOpen(false)}
        onOpenNewWizard={() => {
          setIsWorkspaceListOpen(false);
          setIsWizardOpen(true);
        }}
      />

      <PersonaDetailModal
        persona={selectedPersonaForModal}
        onClose={() => setSelectedPersonaForModal(null)}
        onRegenerate={async (id) => {
          const updated = await regeneratePersona(id);
          setSelectedPersonaForModal(updated);
        }}
        onStartInterview={handleStartInterview}
      />

      <AskAiModal isOpen={isAskAiOpen} onClose={() => setIsAskAiOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <MainApp />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
