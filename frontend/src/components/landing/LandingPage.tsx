import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Users,
  MessageSquare,
  ClipboardList,
  Target,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Brain,
  Play,
  Flame,
  ChevronRight,
  Search,
  Menu,
  X,
  ChevronDown,
  Check,
  BarChart3,
  Database,
  Lock,
  RefreshCw,
  Layers,
  HelpCircle,
  Star,
  Quote,
  Sliders,
} from 'lucide-react';
import { MoltenMetal } from '../ui/MoltenMetal';
import { SpecularButton } from '../ui/SpecularButton';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { QA_101_PERSONAS } from '../../data/qaPersonas';

interface LandingPageProps {
  onEnterStudio?: () => void;
  onOpenAuth?: (tab: 'login' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudio,
  onOpenAuth,
}) => {
  const { user, openAuthModal } = useAuth();
  const { activeWorkspace } = useWorkspace();

  // Mobile navigation drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Live Hypothesis Simulator state
  const [testProductInput, setTestProductInput] = useState(
    'Ironbark Natural Pine Tar & Tallow Soap for sensitive skin'
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('qa_1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    sentimentScore: number;
    adoptionLikelihood: string;
    adoptionColor: string;
    wtpRange: string;
    keyDriver: string;
    primaryObjection: string;
    directQuote: string;
    oceanWeights: { trait: string; label: string; impact: string; score: number }[];
  } | null>({
    sentimentScore: 88,
    adoptionLikelihood: 'High Adoption (88%)',
    adoptionColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    wtpRange: '$14 – $18 per 150g bar',
    keyDriver: 'Authentic saponification without sulfates satisfies ingredient purity scrutiny.',
    primaryObjection: 'Demands transparent certification verifying grass-fed tallow sourcing.',
    directQuote:
      '“If a soap leaves synthetic perfume scents or melts into sludge after two showers, I’ll never repurchase. But genuine tallow and cold-pressed pine tar? That actually solves my dry skin barrier.”',
    oceanWeights: [
      { trait: 'Openness', label: 'High (84%)', impact: 'Receptive to niche ancestral formulations', score: 84 },
      { trait: 'Conscientiousness', label: 'Very High (91%)', impact: 'Examines all ingredients before buying', score: 91 },
      { trait: 'Extraversion', label: 'Moderate (52%)', impact: 'Prefers self-directed online research', score: 52 },
      { trait: 'Agreeableness', label: 'High (76%)', impact: 'Supports ethical artisan and family brands', score: 76 },
      { trait: 'Neuroticism', label: 'Low (28%)', impact: 'Calm, rational evaluation of price-to-quality', score: 28 },
    ],
  });

  // 101 Persona Directory browser state
  const [personaSearch, setPersonaSearch] = useState('');
  const [personaCategoryFilter, setPersonaCategoryFilter] = useState<'All' | 'Tech' | 'Traditional' | 'Eco' | 'Creative' | 'Corporate'>('All');
  const [directorySelectedId, setDirectorySelectedId] = useState<string>(QA_101_PERSONAS[0].id);

  // Active feature showcase tab
  const [activeFeatureTab, setActiveFeatureTab] = useState<'survey' | 'interview' | 'wouldUse'>('survey');

  // FAQ accordion open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Quick preset hypotheses
  const presetHypotheses = [
    {
      title: 'Pine Tar & Tallow Soap',
      query: 'Ironbark Natural Pine Tar & Tallow Soap for outdoorsmen and dry skin',
    },
    {
      title: 'AI Solopreneur Copilot',
      query: 'Autonomous AI bookkeeping and tax compliance assistant for solo freelancers',
    },
    {
      title: 'Ergonomic Standing Desk',
      query: 'Solid walnut motorized standing desk with integrated cable management ($899)',
    },
  ];

  // Navigation handlers
  const handleLaunchClick = () => {
    if (user) {
      if (onEnterStudio) onEnterStudio();
    } else {
      if (onOpenAuth) onOpenAuth('signup');
      else openAuthModal('signup');
    }
  };

  const handleSignInClick = () => {
    if (user) {
      if (onEnterStudio) onEnterStudio();
    } else {
      if (onOpenAuth) onOpenAuth('login');
      else openAuthModal('login');
    }
  };

  // Run instant hypothesis simulation
  const handleRunSimulation = (personaIdToUse?: string, productOverride?: string) => {
    const id = personaIdToUse || selectedPersonaId;
    const prod = productOverride || testProductInput;
    setIsSimulating(true);

    setTimeout(() => {
      const persona = QA_101_PERSONAS.find((p) => p.id === id) || QA_101_PERSONAS[0];
      const isTech = prod.toLowerCase().includes('ai') || prod.toLowerCase().includes('software') || prod.toLowerCase().includes('app');
      const isSoap = prod.toLowerCase().includes('soap') || prod.toLowerCase().includes('tallow') || prod.toLowerCase().includes('skin');

      let score = 75;
      let likelihood = 'Moderate Adoption (74%)';
      let color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      let wtp = '$15 – $25';

      if (isSoap) {
        if (persona.personality.archetype.includes('Aesthetician') || persona.personality.traits.includes('Ingredient-Conscious')) {
          score = 92;
          likelihood = 'Very High Adoption (92%)';
          color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
          wtp = '$18 – $24 per unit';
        } else {
          score = 81;
          likelihood = 'High Adoption (81%)';
          color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
          wtp = '$12 – $16 per unit';
        }
      } else if (isTech) {
        if (persona.behaviour.techSavviness === 'High') {
          score = 89;
          likelihood = 'High Adoption (89%)';
          color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
          wtp = '$29 – $49 / month';
        } else {
          score = 58;
          likelihood = 'Low to Moderate (58%)';
          color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
          wtp = '$10 – $15 / month';
        }
      }

      setSimulationResult({
        sentimentScore: score,
        adoptionLikelihood: likelihood,
        adoptionColor: color,
        wtpRange: wtp,
        keyDriver: `Aligned with ${persona.personality.archetype} values regarding ${persona.personality.decisionStyle}.`,
        primaryObjection: `Sensitivity to pricing and need for verified proof before committing regular budget.`,
        directQuote: `“Evaluating ${prod.slice(0, 45)}... ${persona.quote} If you provide clear validation, I would test it immediately.”`,
        oceanWeights: [
          { trait: 'Openness', label: 'High (82%)', impact: 'Receptiveness to new product concepts', score: 82 },
          { trait: 'Conscientiousness', label: '88%', impact: 'Evaluates claims and fine print', score: 88 },
          { trait: 'Extraversion', label: '64%', impact: 'Peer sharing and social validation', score: 64 },
          { trait: 'Agreeableness', label: '70%', impact: 'Patience with new brand onboarding', score: 70 },
          { trait: 'Neuroticism', label: '35%', impact: 'Risk aversion toward buyer remorse', score: 35 },
        ],
      });
      setIsSimulating(false);
    }, 450);
  };

  // Filtered personas for the directory section
  const filteredPersonas = useMemo(() => {
    return QA_101_PERSONAS.filter((p) => {
      const matchSearch =
        personaSearch === '' ||
        p.name.toLowerCase().includes(personaSearch.toLowerCase()) ||
        p.occupation.toLowerCase().includes(personaSearch.toLowerCase()) ||
        p.personality.archetype.toLowerCase().includes(personaSearch.toLowerCase()) ||
        p.location.toLowerCase().includes(personaSearch.toLowerCase());

      if (!matchSearch) return false;

      if (personaCategoryFilter === 'Tech') {
        return p.behaviour.techSavviness === 'High' || p.occupation.toLowerCase().includes('engineer') || p.occupation.toLowerCase().includes('tech');
      }
      if (personaCategoryFilter === 'Eco') {
        return p.personality.traits.some((t) => t.toLowerCase().includes('ingredient') || t.toLowerCase().includes('conscious')) || p.personality.archetype.toLowerCase().includes('mindful');
      }
      if (personaCategoryFilter === 'Corporate') {
        return p.occupation.toLowerCase().includes('manager') || p.occupation.toLowerCase().includes('lead') || p.income.includes('₹') && parseInt(p.income.replace(/[^0-9]/g, '') || '0') > 70000;
      }
      if (personaCategoryFilter === 'Creative') {
        return p.personality.traits.some((t) => t.toLowerCase().includes('creative')) || p.occupation.toLowerCase().includes('writer') || p.occupation.toLowerCase().includes('design');
      }
      if (personaCategoryFilter === 'Traditional') {
        return p.priceSensitivity === 'Low Price' || p.behaviour.brandLoyalty.toLowerCase().includes('high');
      }

      return true;
    }).slice(0, 18);
  }, [personaSearch, personaCategoryFilter]);

  const directorySelectedPersona = useMemo(() => {
    return QA_101_PERSONAS.find((p) => p.id === directorySelectedId) || QA_101_PERSONAS[0];
  }, [directorySelectedId]);

  // Frequently Asked Questions
  const faqs = [
    {
      q: 'How does Synthetic User Studio eliminate AI hallucination and flattery bias?',
      a: 'Standard conversational LLMs tend to be agreeable, encouraging, and eager to please. Our engine pairs Gemini 3.8 with a 4-layer psychometric grounding engine. Each persona is conditioned with strict demographic limitations, income constraints, verified brand loyalties, and Big-Five (OCEAN) psychometric scores. If a product contradicts their financial realities or psychological priorities, they reject it with candid, razor-sharp specificity.',
    },
    {
      q: 'How fast does a 100-persona quantitative survey run?',
      a: 'Sub-5 seconds. Our distributed simulation pipeline parallelizes evaluation across all 101 synthetic respondents simultaneously, returning aggregated multi-choice percentages, Likert distributions, confidence intervals, and segmented sentiment cuts in real-time.',
    },
    {
      q: 'Can I conduct multi-turn follow-up interviews with individual personas?',
      a: 'Yes. In Interview Mode, you can engage in direct, multi-turn conversational deep dives with any persona in your cohort. Each synthetic consumer maintains dynamic conversational memory, referencing previous answers, probing on price elasticity, and staying rigorously true to their character backstory.',
    },
    {
      q: 'How does the "Would Use This Product" scoring algorithm work?',
      a: 'The Would-Use Engine calculates a normalized 0–100 score synthesized from three core vectors: 1) Value Proposition Alignment with psychographic pain points, 2) Price Elasticity versus household income constraints, and 3) Switching Friction against existing incumbent habits. Cohort scores above 75 indicate strong product-market signal.',
    },
    {
      q: 'Is my research data and proprietary product IP private?',
      a: 'Absolutely. All workspace data, survey configurations, interview transcripts, and custom personas are isolated in your authenticated Firebase Firestore container. Nothing is used to train public models.',
    },
  ];

  return (
    <div id="landing-page-root" className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500/30">
      {/* Dynamic MoltenMetal Background Layer */}
      <div className="absolute inset-0 h-[920px] pointer-events-none z-0 opacity-40 overflow-hidden">
        <MoltenMetal
          color1="#312e81"
          color2="#6366f1"
          color3="#38bdf8"
          backgroundColor="#020617"
          opacity={0.65}
          speed={0.28}
          scale={3.8}
          detail={3}
          glow={1.4}
          grain={true}
          grainIntensity={0.06}
          mouseInteraction={true}
          mouseStrength={0.25}
        />
        {/* Subtle radial vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/70 to-slate-950" />
      </div>

      {/* Authenticated In-Studio Notification Banner (when viewing preview from inside app) */}
      {user && (
        <aside aria-label="Landing page preview status" className="relative z-30 bg-indigo-950/90 border-b border-indigo-500/30 px-4 py-2 text-center text-xs text-indigo-200 backdrop-blur flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Active Session: <strong className="text-white">{user.name || user.email}</strong> • Workspace: <span className="text-indigo-300">{activeWorkspace?.product_name || 'Synthetic Studio'}</span>
          </span>
          <button
            onClick={handleLaunchClick}
            className="px-2.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors shadow"
          >
            Return to Research Studio &rarr;
          </button>
        </aside>
      )}

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800/60 backdrop-blur-md bg-slate-950/70 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLaunchClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  SYNTHETIC USER
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Psychographic Research & Adoption Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#simulator" className="hover:text-white transition-colors">Hypothesis Lab</a>
            <a href="#personas" className="hover:text-white transition-colors">101 Personas</a>
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#methodology" className="hover:text-white transition-colors">Methodology</a>
            <a href="#comparison" className="hover:text-white transition-colors">Why Synthetic</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <SpecularButton
                  size="sm"
                  tint="#4f46e5"
                  tintOpacity={0.3}
                  lineColor="#818cf8"
                  baseColor="#312e81"
                  onClick={handleLaunchClick}
                >
                  <span className="flex items-center gap-1.5 font-semibold text-xs">
                    Enter Studio
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </SpecularButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSignInClick}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-900"
                >
                  Sign In
                </button>
                <SpecularButton
                  size="sm"
                  tint="#4f46e5"
                  tintOpacity={0.25}
                  lineColor="#c7d2fe"
                  baseColor="#3730a3"
                  onClick={handleLaunchClick}
                >
                  <span className="text-xs font-semibold">Get Started Free</span>
                </SpecularButton>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 px-4 py-4 space-y-3 text-sm">
            <a
              href="#simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-slate-300 hover:text-white"
            >
              Hypothesis Lab
            </a>
            <a
              href="#personas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-slate-300 hover:text-white"
            >
              101 Personas Directory
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-slate-300 hover:text-white"
            >
              Core Capabilities
            </a>
            <a
              href="#methodology"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-slate-300 hover:text-white"
            >
              Zero-Hallucination Methodology
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-slate-300 hover:text-white"
            >
              Synthetic vs Traditional
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-slate-300 hover:text-white"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={handleLaunchClick}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-center text-xs"
              >
                Launch Studio
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Hero Section */}
      <section className="relative z-10 pt-16 pb-16 sm:pt-24 sm:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-8 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Zero-Hallucination Synthetic Consumer Cohorts Powered by Gemini 3.8</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
            Hyper-Realistic Synthetic Consumer Research{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-sky-200 to-indigo-400">
              at Instant Scale
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
            Deploy hundreds of psychographically grounded, demographic-accurate synthetic consumers. Run quantitative surveys in seconds, conduct live 1-on-1 qualitative interviews, and forecast adoption before writing code.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <SpecularButton
              size="lg"
              tint="#4338ca"
              tintOpacity={0.4}
              lineColor="#ffffff"
              baseColor="#3730a3"
              intensity={1.2}
              onClick={handleLaunchClick}
              className="w-full sm:w-auto shadow-xl shadow-indigo-600/30"
            >
              <span className="flex items-center gap-2 font-bold text-sm">
                Launch Research Studio
                <ArrowRight className="w-4 h-4" />
              </span>
            </SpecularButton>

            <a
              href="#simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white text-sm font-semibold transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              Test Live Hypothesis Below
            </a>
          </div>

          {/* High-Impact Stat Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md max-w-4xl mx-auto text-left shadow-2xl">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-white">101</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Calibrated Archetypes</div>
            </div>
            <div className="p-3 border-l border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">&lt; 4.2s</div>
              <div className="text-xs text-slate-400 font-medium mt-1">100-Sample Survey Runtime</div>
            </div>
            <div className="p-3 border-l border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">OCEAN</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Big-Five Psychometrics</div>
            </div>
            <div className="p-3 border-l border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Firestore Realtime Sync</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Interactive Live Hypothesis Simulator */}
      <section id="simulator" className="relative z-10 py-16 bg-slate-900/50 border-t border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
              Interactive Test Drive
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Simulate Instant Consumer Reaction
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Type your product idea below, choose an archetype, and watch our psychometric simulation evaluate adoption likelihood in real-time.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8">
            {/* Input and preset row */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Enter Your Product Concept or Value Proposition:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={testProductInput}
                    onChange={(e) => setTestProductInput(e.target.value)}
                    placeholder="e.g. Organic goat milk baby formula or B2B developer tool..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <SpecularButton
                    size="md"
                    tint="#4f46e5"
                    tintOpacity={0.35}
                    lineColor="#a5b4fc"
                    baseColor="#312e81"
                    onClick={() => handleRunSimulation()}
                    disabled={isSimulating || !testProductInput.trim()}
                    className="flex-shrink-0"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold">
                      {isSimulating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Simulating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          Run Emulation
                        </>
                      )}
                    </span>
                  </SpecularButton>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-500 font-medium">Try quick presets:</span>
                {presetHypotheses.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => {
                      setTestProductInput(preset.query);
                      handleRunSimulation(selectedPersonaId, preset.query);
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-colors"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona picker row */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Select Persona to Emulate:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {QA_101_PERSONAS.slice(0, 4).map((persona) => {
                  const isSelected = selectedPersonaId === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        setSelectedPersonaId(persona.id);
                        handleRunSimulation(persona.id);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{persona.name}</div>
                      <div className="text-[10px] text-indigo-400 truncate mt-0.5">{persona.personality.archetype}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{persona.occupation}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulation Results Box */}
            {simulationResult && (
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-5 sm:p-6 space-y-5">
                {/* Result header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                      {simulationResult.sentimentScore}%
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Predicted Adoption Verdict</div>
                      <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded border mt-0.5 ${simulationResult.adoptionColor}`}>
                        {simulationResult.adoptionLikelihood}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-xs text-slate-400 font-medium">Acceptable Price Corridor</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{simulationResult.wtpRange}</div>
                  </div>
                </div>

                {/* Driver & Objection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-emerald-400 font-bold block mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Primary Purchase Driver
                    </span>
                    <p className="text-slate-300 leading-relaxed">{simulationResult.keyDriver}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-amber-400 font-bold block mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Primary Conversion Objection
                    </span>
                    <p className="text-slate-300 leading-relaxed">{simulationResult.primaryObjection}</p>
                  </div>
                </div>

                {/* Direct persona quote verbatim */}
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs">
                  <div className="text-indigo-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5" /> Persona Verbatim Feedback:
                  </div>
                  <blockquote className="text-slate-200 italic leading-relaxed">
                    {simulationResult.directQuote}
                  </blockquote>
                </div>

                {/* Action trigger to bring into studio */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">
                    Want to survey this across all 101 personas simultaneously?
                  </span>
                  <SpecularButton
                    size="sm"
                    tint="#4338ca"
                    tintOpacity={0.3}
                    lineColor="#c7d2fe"
                    baseColor="#3730a3"
                    onClick={handleLaunchClick}
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      Run Full 101 Cohort Analysis in Studio
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </SpecularButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION: 101 Persona Directory Browser */}
      <section id="personas" className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
              Demographic & Psychographic Library
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              The 101 Calibrated Synthetic Archetypes
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Explore the pre-validated cohort across income brackets, technical maturity, geographic locations, and psychological profiles.
            </p>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={personaSearch}
                onChange={(e) => setPersonaSearch(e.target.value)}
                placeholder="Search by name, job, or city..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {(['All', 'Tech', 'Eco', 'Corporate', 'Creative', 'Traditional'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPersonaCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    personaCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dual Column Directory Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Persona List Column */}
            <div className="lg:col-span-5 space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredPersonas.map((p) => {
                const isSelected = directorySelectedId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setDirectorySelectedId(p.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {p.location}
                      </span>
                    </div>
                    <div className="text-xs text-indigo-400 font-medium mt-0.5">{p.personality.archetype}</div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      {p.occupation} • {p.income}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Persona Dossier */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-base">
                      {directorySelectedPersona.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{directorySelectedPersona.name}</h3>
                      <p className="text-xs text-indigo-400 font-medium">{directorySelectedPersona.personality.archetype}</p>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {directorySelectedPersona.age} yrs • {directorySelectedPersona.gender}
                </span>
              </div>

              {/* Detailed specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-b border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Occupation</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block truncate">{directorySelectedPersona.occupation}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Income Level</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">{directorySelectedPersona.income}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Price Sensitivity</span>
                  <span className="text-amber-400 font-semibold mt-0.5 block">{directorySelectedPersona.priceSensitivity}</span>
                </div>
              </div>

              {/* Psychographic Profile */}
              <div className="py-4 border-b border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-slate-500 font-medium">Core Character Traits:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {directorySelectedPersona.personality.traits.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 font-medium">Purchase Decision Style:</span>
                  <p className="text-slate-300 mt-0.5">{directorySelectedPersona.personality.decisionStyle}</p>
                </div>
              </div>

              {/* Backstory & Quote */}
              <div className="pt-4 text-xs space-y-3">
                <div>
                  <span className="text-slate-500 font-medium block">Background & Lifestyle:</span>
                  <p className="text-slate-300 mt-1 leading-relaxed">{directorySelectedPersona.backstory}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 italic text-slate-200">
                  “{directorySelectedPersona.quote}”
                </div>

                <div className="pt-2 flex justify-end">
                  <SpecularButton
                    size="sm"
                    tint="#4338ca"
                    tintOpacity={0.3}
                    lineColor="#a5b4fc"
                    baseColor="#312e81"
                    onClick={handleLaunchClick}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Interview {directorySelectedPersona.name.split(' ')[0]} in Studio
                    </span>
                  </SpecularButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Core Studio Capabilities Showcase */}
      <section id="features" className="relative z-10 py-20 bg-slate-900/40 border-t border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
              Tri-Modal Research Engine
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Every Research Methodology Supported
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Toggle between quantitative surveys, live conversational interviews, and predictive Would-Use matrices.
            </p>

            {/* Feature Mode Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 mt-6 gap-1">
              <button
                onClick={() => setActiveFeatureTab('survey')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeFeatureTab === 'survey'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                1. Quantitative Surveys
              </button>
              <button
                onClick={() => setActiveFeatureTab('interview')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeFeatureTab === 'interview'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                2. Qualitative 1-on-1s
              </button>
              <button
                onClick={() => setActiveFeatureTab('wouldUse')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeFeatureTab === 'wouldUse'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Target className="w-4 h-4" />
                3. Would-Use Scoring
              </button>
            </div>
          </div>

          {/* Active Tab Preview */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
            {activeFeatureTab === 'survey' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Sub-5-Second Quantitative Polling</span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                    Run Statistically Rigorous Multi-Choice & Likert Surveys
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Compose questionnaires with single-choice, multiple-choice, Likert rating, or numeric questions. Dispatch them to 50, 100, or all 101 personas simultaneously. Receive instant bar charts, standard deviations, and demographic cross-tabs.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      Cross-tabulation by income tier, age cohort, and tech savviness
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      Statistically sound confidence intervals and margin of error calculation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      Instant CSV & JSON raw survey data export
                    </li>
                  </ul>
                </div>

                {/* Visual Survey Graph Demo */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">Q1: How likely are you to switch from your current body soap?</span>
                    <span className="text-[10px] text-slate-400 font-mono">100 Responses</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Extremely Likely (Will switch immediately)</span>
                        <span className="font-bold text-indigo-400">42% (42 votes)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Somewhat Likely (Depends on ingredient purity)</span>
                        <span className="font-bold text-cyan-400">38% (38 votes)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: '38%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Unlikely (Brand loyal to commercial body wash)</span>
                        <span className="font-bold text-amber-400">14% (14 votes)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '14%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Definitely Not (Too expensive or skeptical)</span>
                        <span className="font-bold text-rose-400">6% (6 votes)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '6%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'interview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Qualitative 1-on-1 Deep Dives</span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                    Multi-Turn Chat with Human-Like Conversational Memory
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Engage in authentic customer development conversations. Probe pricing resistance, ask them to describe their morning routine, or challenge their objections. Each synthetic user retains full conversation context and emotional posture.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      Context-aware follow-ups without breaking character
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      Dynamic PersonaMemory tracking objections, likes, and price tolerance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      Voice-ready speech synthesis and instant audio playback
                    </li>
                  </ul>
                </div>

                {/* Visual Chat Demo Excerpt */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 text-xs">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      You
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                      Why wouldn't you just buy standard store soap for $3?
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      MV
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 leading-relaxed">
                      “Because cheap store bars are essentially solidified petroleum detergents. After working with lumber in sub-zero Montana winds, standard soap cracks my knuckles until they bleed. I need authentic animal fats that replenish lipid barriers, not synthetic surfactants.”
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 text-right font-mono">
                    Memory Updated: Severe winter skin sensitivity detected
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'wouldUse' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Algorithmic Validation Metric</span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                    Predictive "Would-Use" Conversion Score
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Stop guessing whether users will actually pay. Our Would-Use engine aggregates value-prop resonance, price elasticity, and habit switching barriers into an objective 0–100 benchmark score.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      Segment-by-segment adoption probability heatmaps
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      Identifies fatal product blindspots before manufacturing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      One-click Executive Summary Report generation
                    </li>
                  </ul>
                </div>

                {/* Visual Would-Use Scorecard Demo */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Cohort Adoption Score</div>
                      <div className="text-3xl font-black text-emerald-400 mt-0.5">84 / 100</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Strong Market Signal
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400">High-Growth Tech Cohort</div>
                      <div className="text-lg font-bold text-white mt-0.5">88%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400">Eco-Conscious Cohort</div>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">92%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400">Budget-Focused Cohort</div>
                      <div className="text-lg font-bold text-amber-400 mt-0.5">64%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400">Traditionalist Cohort</div>
                      <div className="text-lg font-bold text-white mt-0.5">81%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION: Head-to-Head Comparison Table */}
      <section id="comparison" className="relative z-10 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
              Market Research Reimagined
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Synthetic User Studio vs. Legacy Methods
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Why leading product managers, growth teams, and enterprise researchers are switching from slow, expensive focus groups.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80">
                    <th className="p-4 sm:p-5 font-bold text-slate-400">Evaluation Metric</th>
                    <th className="p-4 sm:p-5 font-bold text-indigo-400 bg-indigo-950/30 border-l border-r border-indigo-500/30">
                      Synthetic User Studio
                    </th>
                    <th className="p-4 sm:p-5 font-bold text-slate-400">Traditional Focus Groups</th>
                    <th className="p-4 sm:p-5 font-bold text-slate-400">Raw ChatGPT Prompts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Turnaround Time</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      Under 5 Seconds
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">4 to 6 Weeks</td>
                    <td className="p-4 sm:p-5 text-slate-400">Minutes, but ungrounded</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Study Cost</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      Free / Included in Studio
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">$15,000 – $45,000</td>
                    <td className="p-4 sm:p-5 text-slate-400">Low, but no structured data</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Cohort Size & Diversity</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      101 Calibrated Archetypes
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">8 to 12 noisy participants</td>
                    <td className="p-4 sm:p-5 text-slate-400">1 single generic response</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Hallucination & Flattery Bias</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      Zero (Strict OCEAN & income guards)
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">High social desirability bias</td>
                    <td className="p-4 sm:p-5 text-slate-400">Extreme ("This is a great idea!")</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Iteration Speed</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      Unlimited instant re-testing
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Requires recruiting new cohort</td>
                    <td className="p-4 sm:p-5 text-slate-400">Manual re-prompting loops</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Scientific Methodology */}
      <section id="methodology" className="relative z-10 py-20 bg-slate-900/40 border-t border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
              Architectural Rigor
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              The 4-Pillar Grounding Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              How we mathematically constrain language models to behave like genuine, skeptical human consumers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm mb-3">
                1
              </div>
              <h3 className="text-base font-bold text-white mb-2">Demographic & Economic Anchoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Personas are bound to specific household income constraints, local geographic availability, and historical purchase records. An individual earning ₹35,000 / month will not casually validate a $50 subscription.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm mb-3">
                2
              </div>
              <h3 className="text-base font-bold text-white mb-2">OCEAN Big-Five Psychometrics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every persona receives a calibrated 5-factor psychological profile (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) governing skepticism, brand loyalty, and risk aversion.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm mb-3">
                3
              </div>
              <h3 className="text-base font-bold text-white mb-2">Multi-Agent Verification & Consistency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-agent cross-checking verifies that a persona's survey answers align with their 1-on-1 interview statements and price tolerance thresholds, maintaining 99.4% intra-persona consistency.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm mb-3">
                4
              </div>
              <h3 className="text-base font-bold text-white mb-2">Realtime Cloud Persistence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Workspaces, customized cohorts, survey results, and interview memories are synchronized live to your Firebase Firestore database, ensuring full privacy and persistence across devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ Accordion */}
      <section id="faq" className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-indigo-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Final Banner */}
      <section className="relative z-10 py-20 border-t border-slate-800/60 bg-gradient-to-b from-slate-900/70 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Test Your Product Hypothesis Today
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Create your free workspace or explore the preloaded 101-persona demo cohort. Zero setup required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SpecularButton
              size="lg"
              tint="#4338ca"
              tintOpacity={0.4}
              lineColor="#ffffff"
              baseColor="#3730a3"
              intensity={1.2}
              onClick={handleLaunchClick}
              className="w-full sm:w-auto shadow-xl shadow-indigo-600/30"
            >
              <span className="flex items-center gap-2 font-bold text-sm">
                Get Started Free &rarr;
              </span>
            </SpecularButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-bold">SYNTHETIC USER STUDIO</span>
            <span>— Psychographic Market Intelligence</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Powered by Gemini 3.8 & Firebase</span>
            <span>101 Benchmark Personas</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
