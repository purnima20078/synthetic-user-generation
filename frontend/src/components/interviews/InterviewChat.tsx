import React, { useState, useEffect, useRef } from 'react';
import { Persona, Interview, PersonaMemory, InterviewTurn } from '../../types';
import { api } from '../../services/api';
import { AvatarImage } from '../../utils/avatar';
import { SpecularButton } from '../ui/SpecularButton';
import {
  Send,
  Sparkles,
  Download,
  Brain,
  ShieldCheck,
  HelpCircle,
  Clock,
  User,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

interface InterviewChatProps {
  persona: Persona;
  interview: Interview;
  onUpdateInterview: (updated: Interview) => void;
  onOpenPersonaModal: (p: Persona) => void;
}

export function InterviewChat({
  persona,
  interview,
  onUpdateInterview,
  onOpenPersonaModal,
}: InterviewChatProps) {
  const [messages, setMessages] = useState<InterviewTurn[]>(interview.messages || interview.turns || []);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'Can you tell me about the last time you were truly frustrated by your current product?',
    'What would make you immediately decide NOT to purchase this?',
    'How does your daily routine affect how and when you would use this?',
    'If price were not an issue, what is the single most important quality you look for?',
  ]);
  const [showInterviewGuide, setShowInterviewGuide] = useState(true);
  const [memory, setMemory] = useState<PersonaMemory | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(interview.messages || interview.turns || []);
  }, [interview]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Load persona memory for side panel
  useEffect(() => {
    api
      .getPersonaMemory(persona._id)
      .then((m) => setMemory(m))
      .catch((err) => console.warn('Notice fetching memory:', err?.message || err));
  }, [persona._id, messages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    setInputText('');
    setIsSending(true);

    // Optimistic user message
    const userMsg = {
      role: 'user' as const,
      content: text,
      timestamp: new Date().toISOString(),
    };
    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);

    try {
      const res = await api.sendInterviewMessage(interview._id, text, persona);
      setMessages(res.messages);
      onUpdateInterview(res.interview);

      // Generate next 4 suggested probing questions dynamically based on latest turn
      setSuggestedQuestions([
        `Could you elaborate more on why you feel "${text.slice(0, 30)}..." is critical?`,
        `How does that compare to what your colleagues or peers do?`,
        `What is an acceptable trade-off or alternative you have considered?`,
        `If this brand offered a money-back guarantee, would your skepticism remain?`,
      ]);
    } catch (err) {
      console.error('Failed to send interview message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleExportMarkdown = () => {
    let md = `# Interview Transcript: ${persona.name}\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Persona:** ${persona.name} (${persona.age}y, ${persona.occupation}, ${persona.segment})\n`;
    md += `**Location:** ${persona.location}\n\n---\n\n`;

    messages.forEach((m: InterviewTurn) => {
      const speaker = m.role === 'user' ? 'Researcher' : persona.name;
      md += `### ${speaker} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${persona.name.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[78vh]">
      {/* LEFT COLUMN: Persona Profile & Memory Panel (Cols 1–4) */}
      <div className="lg:col-span-4 rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
            <AvatarImage seed={persona.avatar_seed || persona.name} size={56} className="ring-2 ring-indigo-500/40" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{persona.name}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300">
                  {persona.segment}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {persona.age}y • {persona.occupation}
              </p>
              <p className="text-[11px] text-slate-500">{persona.location}</p>
            </div>
          </div>

          {/* Consistency Guard Badge */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Consistency Guard active (memory-checked turns)</span>
          </div>

          {/* Quote & Backstory excerpt */}
          {persona.quote && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs italic text-slate-300">
              "{persona.quote}"
            </div>
          )}

          {/* OCEAN Mini Bars */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Personality Traits (OCEAN)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>Open: {persona.personality_traits.ocean.openness}%</div>
              <div>Conscientious: {persona.personality_traits.ocean.conscientiousness}%</div>
              <div>Extraverted: {persona.personality_traits.ocean.extraversion}%</div>
              <div>Agreeable: {persona.personality_traits.ocean.agreeableness}%</div>
            </div>
          </div>

          {/* Memory Summary & Stated Opinions */}
          {memory && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-cyan-400" /> Grounded Stances ({memory.stated_opinions.length})
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {memory.stated_opinions.map((op, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px]">
                    <span className="font-semibold text-slate-200">{op.topic}: </span>
                    <span className="text-slate-400">{op.stance}</span>
                  </div>
                ))}
                {memory.stated_opinions.length === 0 && (
                  <span className="text-[11px] text-slate-500 italic">No formal stances established yet.</span>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => onOpenPersonaModal(persona)}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          View Complete Persona Profile →
        </button>
      </div>

      {/* RIGHT COLUMN: Chat Area (Cols 5–12) */}
      <div className="lg:col-span-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden shadow-xl">
        {/* Chat Top Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">
              1-on-1 Research Interview with {persona.name}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInterviewGuide(!showInterviewGuide)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                showInterviewGuide
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Interview Guide
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" /> Export (.md)
            </button>
          </div>
        </div>

        {/* Suggested Interview Guide Chips */}
        {showInterviewGuide && (
          <div className="p-3 bg-indigo-950/20 border-b border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> AI Probing Suggestions (Click to Ask):
              </span>
              <span className="text-slate-500">Gemini reasoning</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-left text-[11px] p-2 rounded-lg bg-slate-900 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-colors truncate"
                  title={q}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <AvatarImage seed={persona.avatar_seed || persona.name} size={64} className="mx-auto" />
              <div className="text-sm font-bold text-slate-200">
                Start speaking with {persona.name}
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Ask about their daily routines, expectations, past product frustrations, or price thresholds.
              </p>
            </div>
          ) : (
            messages.map((m: InterviewTurn, idx: number) => {
              const isUser = m.role === 'user';
              return (
                <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <AvatarImage seed={persona.avatar_seed || persona.name} size={32} className="shrink-0 mt-1" />
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1 shadow-md ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                      <span className="font-semibold">{isUser ? 'Researcher' : persona.name}</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1 text-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-center gap-3">
              <AvatarImage seed={persona.avatar_seed || persona.name} size={32} />
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                <span className="animate-pulse">{persona.name} is thinking in character...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-800 bg-slate-900/95 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${persona.name} a question...`}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <SpecularButton
            type="submit"
            size="sm"
            tint="#4f46e5"
            tintOpacity={0.4}
            lineColor="#a5b4fc"
            baseColor="#312e81"
            disabled={isSending || !inputText.trim()}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <Send className="w-3.5 h-3.5" /> Send
            </span>
          </SpecularButton>
        </form>
      </div>
    </div>
  );
}
