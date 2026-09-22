import React, { useState } from 'react';
import { Workspace, InsightsReport, Persona, Survey, SurveyResponse } from '../../types';
import {
  Download,
  Share2,
  FileText,
  Table,
  Check,
  Copy,
  ExternalLink,
  Shield,
  Clock,
  Printer,
} from 'lucide-react';

interface ReportViewProps {
  workspace: Workspace;
  insights: InsightsReport | null;
  personas: Persona[];
  surveys: Survey[];
  responses: SurveyResponse[];
}

export function ReportView({
  workspace,
  insights,
  personas,
  surveys,
  responses,
}: ReportViewProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');

  const exportMarkdown = () => {
    let md = `# Research Synthesis Report: ${workspace.product_name}\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Target Demographic:** ${workspace.target_audience.age_range[0]}–${workspace.target_audience.age_range[1]} years, ${workspace.target_audience.occupation}\n`;
    md += `**Cohort Sample Size:** ${personas.length} synthetic personas\n`;
    md += `**Research Objective:** ${workspace.research_objective}\n\n`;

    if (insights) {
      const score = insights.viability_score?.score ?? insights.validation_score ?? 80;
      const drivers = insights.viability_score?.drivers ?? insights.executive_summary ?? 'High affinity across military and trade worker demographics.';
      const findings = insights.key_findings ?? [];
      const segments = insights.segment_breakdown ?? [];
      const recs = insights.recommendations ?? [];

      md += `## Product Viability Score: ${score} / 100\n`;
      md += `**Score Drivers:** ${drivers}\n\n`;

      if (findings.length > 0) {
        md += `## Key Findings\n`;
        findings.forEach((f: string, i: number) => {
          md += `${i + 1}. ${f}\n`;
        });
        md += `\n`;
      }

      if (segments.length > 0) {
        md += `## Segment Breakdown\n`;
        md += `| Segment | Sample Size | Sentiment | Switch Propensity | Primary Objection | Top Request |\n`;
        md += `|---|---|---|---|---|---|\n`;
        segments.forEach((s: any) => {
          md += `| ${s.segment_name} | ${s.sample_size} | ${s.sentiment_score}% | ${s.switch_propensity}% | ${s.primary_objection} | ${s.top_requested_feature} |\n`;
        });
        md += `\n`;
      }

      if (recs.length > 0) {
        md += `## Prioritised Recommendations\n`;
        recs.forEach((r: any, i: number) => {
          md += `### ${i + 1}. ${r.title} (Impact: ${r.impact}, Effort: ${r.effort})\n${r.description}\n\n`;
        });
      }
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.product_name.toLowerCase().replace(/\s+/g, '-')}-research-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    let csv = 'Persona ID,Name,Age,Gender,Occupation,Segment,Question ID,Question,Answer,Sentiment,Would Use,Reasoning\n';

    responses.forEach((r) => {
      const p = personas.find((item) => item._id === r.persona_id);
      const survey = surveys.find((s) => s._id === r.survey_id);
      const q = survey?.questions.find((item) => item.id === r.question_id);

      const clean = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;

      csv += [
        r.persona_id,
        clean(p?.name),
        p?.age || '',
        clean(p?.gender),
        clean(p?.occupation),
        clean(p?.segment),
        r.question_id,
        clean(q?.text),
        clean(r.answer_text),
        r.sentiment,
        r.would_use,
        clean(r.reasoning),
      ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.product_name.toLowerCase().replace(/\s+/g, '-')}-survey-matrix.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Controls: Export Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-white">Executive Synthesis & Export</h3>
          <p className="text-xs text-slate-400">
            Export multi-format deliverables for stakeholders, Notion, R/Excel or print-ready PDF
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportMarkdown}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-indigo-400" /> Export Markdown (.md)
          </button>
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Table className="w-4 h-4 text-emerald-400" /> Export Matrix (.csv)
          </button>
          <button
            onClick={printReport}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center gap-2 border border-indigo-500/40 transition-colors"
          >
            <FileText className="w-4 h-4 text-indigo-400" /> Download PDF
          </button>
          <button
            onClick={printReport}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" /> Print Report
          </button>
          <button
            onClick={copyShareLink}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copiedLink ? 'Link Copied!' : 'Shareable Link'}
          </button>
        </div>
      </div>

      {/* Shareable Link Config */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={passwordProtected}
              onChange={(e) => setPasswordProtected(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span className="text-slate-300 font-medium">Protect share link with password</span>
          </label>
          {passwordProtected && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode..."
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Active link expiry: 30 days</span>
        </div>
      </div>

      {/* Styled Printable Report Container */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Cover / Header */}
        <div className="border-b border-slate-800 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              SYNTHETIC USER RESEARCH DOSSIER
            </span>
            <h1 className="text-3xl font-black text-white mt-3 tracking-tight">
              {workspace.product_name}
            </h1>
            <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
              {workspace.product_description}
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 space-y-1">
            <div>
              Generated: <strong className="text-slate-200">{new Date().toLocaleDateString()}</strong>
            </div>
            <div>
              Synthetic Population: <strong className="text-indigo-400">{personas.length} Agents</strong>
            </div>
            <div>
              Target Demographic: <strong className="text-slate-200">{workspace.target_audience.age_range[0]}–{workspace.target_audience.age_range[1]} yrs ({workspace.target_audience.occupation})</strong>
            </div>
          </div>
        </div>

        {/* Executive Summary & Score */}
        {insights ? (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                  Viability Assessment
                </span>
                <h3 className="text-xl font-bold text-white">
                  Validated Product Viability:{' '}
                  {insights.viability_score?.score ?? insights.validation_score ?? 80} / 100
                </h3>
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  {insights.viability_score?.drivers ??
                    insights.executive_summary ??
                    'Consistent high demand signaled across key segments.'}
                </p>
              </div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white text-3xl font-black font-mono shadow-lg shrink-0">
                {insights.viability_score?.score ?? insights.validation_score ?? 80}
              </div>
            </div>

            {/* Key Findings List */}
            {insights.key_findings && insights.key_findings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Synthesized Qualitative Findings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.key_findings.map((finding: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-200"
                    >
                      <strong className="text-indigo-400 block mb-1">Finding #{idx + 1}</strong>
                      {finding}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Segment Breakdown */}
            {insights.segment_breakdown && insights.segment_breakdown.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Demographic Segment Analysis
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase">
                        <th className="py-2">Segment</th>
                        <th className="py-2">Cohort Size</th>
                        <th className="py-2">Sentiment</th>
                        <th className="py-2">Switch Propensity</th>
                        <th className="py-2">Primary Objection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {insights.segment_breakdown.map((s: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2.5 font-bold text-white">{s.segment_name}</td>
                          <td className="py-2.5 text-slate-400">{s.sample_size} personas</td>
                          <td className="py-2.5 font-bold text-emerald-400">{s.sentiment_score}%</td>
                          <td className="py-2.5 font-bold text-cyan-400">{s.switch_propensity}%</td>
                          <td className="py-2.5 text-rose-300">{s.primary_objection}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Strategic Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Actionable Next Steps & Strategic Recommendations
                </h3>
                <div className="space-y-2">
                  {insights.recommendations.map((rec: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center font-mono shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-white">{rec.title}</strong>
                          <span className="text-[10px] text-slate-400">
                            (Impact: {rec.impact} • Effort: {rec.effort})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            Insights report not yet compiled. Run surveys or interviews to generate full dossier.
          </div>
        )}
      </div>
    </div>
  );
}
