import React, { useState } from 'react';
import { SurveyQuestion, QuestionType } from '../../types';
import { Plus, Trash2, HelpCircle, Layers } from 'lucide-react';

interface SurveyBuilderProps {
  onSaveSurvey: (title: string, questions: SurveyQuestion[]) => Promise<void>;
  isLoading: boolean;
}

export function SurveyBuilder({ onSaveSurvey, isLoading }: SurveyBuilderProps) {
  const [title, setTitle] = useState('Product Concept & Switch Propensity Study');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    {
      id: 'q1',
      text: 'What are your biggest frustrations with standard store-bought bar soaps or body washes you currently use?',
      type: 'open_ended',
    },
    {
      id: 'q2',
      text: 'Would you be willing to switch to a heavy-duty, natural exfoliating soap with rugged grip and pumice grit?',
      type: 'yes_no',
    },
    {
      id: 'q3',
      text: 'On a scale of 1 to 5, how important is bar durability (not melting into mush) to your purchasing decision?',
      type: 'likert',
    },
    {
      id: 'q4',
      text: 'Which price point feels most reasonable for a high-performance 6oz bar soap?',
      type: 'multiple_choice',
      options: ['$4 - $6 per bar', '$7 - $9 per bar', '$10 - $12 per bar', '$13+ premium bundle'],
    },
  ]);

  const addQuestion = (type: QuestionType) => {
    const newQ: SurveyQuestion = {
      id: `q_${Date.now()}`,
      text: '',
      type,
      options: type === 'multiple_choice' ? ['Option A', 'Option B', 'Option C'] : undefined,
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const updateOption = (qId: string, optIdx: number, val: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId && q.options) {
          const updated = [...q.options];
          updated[optIdx] = val;
          return { ...q, options: updated };
        }
        return q;
      })
    );
  };

  const addOption = (qId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId && q.options) {
          return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
        }
        return q;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.some((q) => !q.text.trim())) return;
    await onSaveSurvey(title, questions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Info */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Survey Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ironbark Tactical Soap Validation Survey"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <p className="text-xs text-slate-400">
          Define multi-format questions. When launched, each synthetic persona will answer in character, returning text, sentiment classification, and purchase-intent scoring.
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Type: {q.type.replace('_', ' ')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => removeQuestion(q.id)}
                disabled={questions.length <= 1}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={q.text}
              onChange={(e) => updateQuestionText(q.id, e.target.value)}
              placeholder="Enter question prompt for synthetic users..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            {/* Multiple Choice Options Builder */}
            {q.type === 'multiple_choice' && q.options && (
              <div className="space-y-2 pl-2 border-l-2 border-slate-800 mt-2">
                <span className="text-[11px] font-semibold text-slate-400 block">Answer Choices:</span>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4 font-mono">{String.fromCharCode(65 + optIdx)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/50 border border-slate-700/60 text-xs text-white focus:outline-none"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(q.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-1 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Choice
                </button>
              </div>
            )}

            {q.type === 'likert' && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl">
                <span>1 (Strongly Disagree / Low)</span>
                <div className="flex-1 h-1 bg-slate-800 mx-2" />
                <span>5 (Strongly Agree / High)</span>
              </div>
            )}

            {q.type === 'yes_no' && (
              <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Yes</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">No</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">Maybe / Undecided</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Question Actions */}
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
          <Plus className="w-4 h-4 text-indigo-400" /> Add Question:
        </span>
        <button
          type="button"
          onClick={() => addQuestion('open_ended')}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          Open-Ended Text
        </button>
        <button
          type="button"
          onClick={() => addQuestion('multiple_choice')}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          Multiple Choice
        </button>
        <button
          type="button"
          onClick={() => addQuestion('likert')}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          Likert 1–5 Scale
        </button>
        <button
          type="button"
          onClick={() => addQuestion('yes_no')}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          Yes / No / Maybe
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !title.trim() || questions.some((q) => !q.text.trim())}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Layers className="w-4 h-4" /> Save Survey & Prepare Cohort Run
        </button>
      </div>
    </form>
  );
}
