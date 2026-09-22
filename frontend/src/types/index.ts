export interface User {
  _id: string;
  email: string;
  name: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  notification_prefs: {
    email_enabled: boolean;
    sound_enabled: boolean;
    desktop_enabled: boolean;
  };
}

export interface OTPRecord {
  _id: string;
  email: string;
  otp_hash: string;
  purpose: 'signup' | 'login';
  expires_at: string;
  attempts: number;
  consumed: boolean;
}

export interface TargetAudience {
  age_range: [number, number];
  age_min?: number;
  age_max?: number;
  gender: string;
  location: string;
  occupation: string;
  income: string;
  segment_tags: string[];
  extra_details?: string;
}

export interface Workspace {
  _id: string;
  user_id: string;
  name: string;
  product_name: string;
  product_description: string;
  category?: string;
  target_price?: string;
  target_audience: TargetAudience;
  research_objective: string;
  created_at: string;
  updated_at: string;
  // Stats
  persona_count?: number;
  survey_count?: number;
  interview_count?: number;
  insights_count?: number;
}

export interface OceanScores {
  openness: number; // 0-100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PersonalityTraits {
  ocean: OceanScores;
  labels: string[];
  archetype: string;
}

export interface PersonaBehaviour {
  shopping_habits: string;
  decision_style: string;
  tech_savviness: 'Low' | 'Medium' | 'High' | 'Very High';
  brand_loyalty: 'Low' | 'Moderate' | 'High' | 'Tribal';
  price_sensitivity: 'Bargain Hunter' | 'Value-Driven' | 'Quality-First' | 'Insensitive';
  media_channels: string[];
}

export interface PersonaPsychProfile {
  motivations: string[];
  frustrations: string[];
  values: string[];
  goals: string[];
  fears: string[];
}

export interface Persona {
  _id: string;
  workspace_id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  income_level: string;
  location: string;
  education: string;
  marital_status: string;
  personality_traits: PersonalityTraits;
  behaviour: PersonaBehaviour;
  psych_profile: PersonaPsychProfile;
  backstory: string;
  quote: string;
  avatar_seed: string;
  segment: string;
  created_at: string;
}

export interface StatedOpinion {
  topic: string;
  stance: string;
  strength: number; // 1-10
}

export interface FactItem {
  key: string;
  value: string;
  source_turn: number;
}

export interface MemoryTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface PersonaMemory {
  _id: string;
  persona_id: string;
  mode: 'survey' | 'interview' | 'general';
  summary: string;
  facts: FactItem[];
  stated_opinions: StatedOpinion[];
  turns: MemoryTurn[];
  updated_at: string;
}

export type QuestionType = 'open_ended' | 'multiple_choice' | 'likert' | 'yes_no';

export interface SurveyQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  description?: string;
}

export interface Survey {
  _id: string;
  workspace_id: string;
  title: string;
  questions: SurveyQuestion[];
  persona_ids: string[];
  status: 'draft' | 'running' | 'completed';
  created_at: string;
  completed_at?: string;
}

export interface SurveyResponse {
  _id: string;
  survey_id: string;
  persona_id: string;
  question_id: string;
  answer_text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number; // 0 to 100
  would_use: 'yes' | 'no' | 'maybe';
  would_use_score: number; // 0 to 100
  reasoning: string;
  created_at: string;
}

export interface InterviewTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggested_followups?: string[];
}

export interface Interview {
  _id: string;
  workspace_id: string;
  persona_id: string;
  title: string;
  turns?: InterviewTurn[];
  messages?: InterviewTurn[];
  created_at: string;
  updated_at?: string;
}

export interface ThemeCluster {
  id?: string;
  theme?: string;
  label?: string;
  description?: string;
  frequency: number;
  representative_quotes?: string[];
  quotes?: Array<{ persona_name: string; quote: string; segment: string }>;
  strong_segments?: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SegmentScore {
  segment_name: string;
  score: number;
  explanation: string;
  verdict: 'Strong Fit' | 'Moderate Fit' | 'Weak Fit' | 'Poor Fit';
}

export interface KeyQuote {
  quote: string;
  persona_id: string;
  persona_name: string;
  persona_segment: string;
  context: string;
}

export interface InsightsReport {
  _id?: string;
  workspace_id: string;
  source?: 'survey' | 'interview' | 'combined';
  viability_score?: { score: number; drivers: string };
  key_findings?: string[];
  segment_breakdown?: Array<{
    segment_name: string;
    sample_size: number;
    sentiment_score: number;
    switch_propensity: number;
    primary_objection: string;
    top_requested_feature: string;
  }>;
  themes: ThemeCluster[];
  tensions?: Array<{
    topic: string;
    side_a: { segment: string; view: string };
    side_b: { segment: string; view: string };
  }>;
  recommendations?: Array<{
    title: string;
    impact: string;
    effort: string;
    description: string;
  }>;
  sentiment_breakdown?: {
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
    by_question?: Record<string, { positive: number; neutral: number; negative: number }>;
    by_segment?: Record<string, { positive: number; neutral: number; negative: number }>;
  };
  agreement_patterns?: Array<{
    topic: string;
    consensus_pct: number;
    dividing_attribute: string;
    notes: string;
  }>;
  behavioural_trends?: Array<{
    driver: string;
    blocker: string;
    price_signal: string;
  }>;
  key_quotes?: KeyQuote[];
  validation_score?: number; // 0-100
  validation_verdict?: 'Strong Fit' | 'Moderate Fit' | 'Weak Fit' | 'Poor Fit';
  segment_scores?: SegmentScore[];
  generated_at?: string;
  created_at?: string;
  executive_summary?: string;
}

export type JobType = 'generate_personas' | 'run_survey' | 'generate_insights' | 'generate_report';
export type JobStatus = 'queued' | 'running' | 'completed' | 'completed_with_errors' | 'failed';

export interface BackgroundJob {
  _id: string;
  user_id: string;
  workspace_id: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0 to 100
  total: number;
  completed_count: number;
  error?: string;
  result_ref?: string;
  preview_items?: Array<{ id: string; title: string; subtitle: string; avatar?: string }>;
  started_at: string;
  finished_at?: string;
}

export interface NotificationItem {
  _id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'job_completed' | 'job_failed' | 'survey_ready' | 'report_ready' | 'system';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  sent_at: string;
  otp_code?: string;
  delivery_status?: 'sent_via_smtp' | 'simulated' | 'pending' | 'error';
  smtp_info?: string;
}

export interface WouldUsePersonaResult {
  persona_id: string;
  persona_name: string;
  avatar_seed: string;
  age: number;
  gender: string;
  occupation: string;
  segment: string;
  archetype: string;
  verdict: 'Definite Yes' | 'Maybe / Conditional' | 'Unlikely / Pass';
  score: number; // 0 to 100
  confidence: number; // 0 to 100
  primary_reason: string;
  trigger_feature: string;
  price_barrier: string;
}

export interface WouldUseScoreData {
  workspace_id: string;
  product_name: string;
  overall_score: number; // 0 to 100
  adoption_verdict: 'Exceptional Market Fit' | 'High Market Potential' | 'Moderate Traction' | 'Niche Appeal' | 'Low Immediate Demand';
  breakdown: {
    definite_yes_pct: number;
    conditional_maybe_pct: number;
    unlikely_no_pct: number;
  };
  total_personas_evaluated: number;
  segment_breakdown: Array<{
    segment_name: string;
    sample_size: number;
    score: number;
    adoption_rate: number;
    primary_appeal: string;
    hesitation: string;
  }>;
  persona_results: WouldUsePersonaResult[];
  conversion_levers: Array<{
    title: string;
    impact: 'High' | 'Medium';
    lift_pct: string;
    description: string;
  }>;
  evaluated_at: string;
}

export interface QABenchmarkMetric {
  name: string;
  target_score: number;
  actual_score: number;
  status: 'passed' | 'warning' | 'failed';
  description: string;
}

export interface QAPersonaValidationResult {
  persona_id: string;
  name: string;
  occupation: string;
  location: string;
  price_sensitivity: string;
  answer_text: string;
  accuracy_score: number;
  consistency_score: number;
  realism_score: number;
  verdict: 'Fair / Approved' | 'Reasonable' | 'Expensive / Conditional' | 'Budget Barrier';
  hallucination_detected: boolean;
  contradiction_detected: boolean;
  regional_voice_match: boolean;
}

export interface QAValidationSuiteData {
  workspace_id: string;
  product_name: string;
  target_price: string;
  test_question: string;
  selected_model: string;
  tested_at: string;
  total_tested: number;
  overall_passed: boolean;
  benchmarks: {
    accuracy: QABenchmarkMetric;
    consistency: QABenchmarkMetric;
    realism: QABenchmarkMetric;
  };
  persona_results: QAPersonaValidationResult[];
}
