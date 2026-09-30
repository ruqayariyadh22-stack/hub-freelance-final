import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  Award,
  Filter,
  Check
} from 'lucide-react';
import { Project, Proposal } from '../../types';

interface ProposalsViewProps {
  projects: Project[];
  proposals: Proposal[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  onAcceptProposal: (proposalId: string) => void;
  onRejectProposal: (proposalId: string) => void;
  onOpenChatWithFreelancer: (freelancerId: string, freelancerName: string) => void;
  isArabic: boolean;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({
  projects,
  proposals,
  selectedProjectId,
  setSelectedProjectId,
  onAcceptProposal,
  onRejectProposal,
  onOpenChatWithFreelancer,
  isArabic
}) => {
  const [filterScore, setFilterScore] = useState<'all' | 'high'>('all');

  // Filter proposals by project if selected
  const availableProjectsWithProposals = projects.filter((p) => p.proposalsCount > 0);
  const activeProjectId = selectedProjectId || (availableProjectsWithProposals[0]?.id ?? '');
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const displayedProposals = proposals.filter((prop) => {
    const matchesProject = activeProjectId ? prop.projectId === activeProjectId : true;
    const matchesScore = filterScore === 'high' ? prop.aiMatching.overallScore >= 90 : true;
    return matchesProject && matchesScore;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Project Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isArabic ? 'عروض المشاريع والمطابقة الذكية' : 'Proposals & AI Matching'}
            </h1>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              AI Matching Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isArabic
              ? 'مقارنة عروض المستقلين مع تحليل الذكاء الاصطناعي لتطابق المهارات والخبرة وسابقة الأعمال'
              : 'Compare candidate proposals ranked by AI skills matching and portfolio relevance'}
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 shrink-0">
            {isArabic ? 'اختر المشروع:' : 'Select Project:'}
          </label>
          <select
            value={activeProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.proposalsCount} {isArabic ? 'عروض' : 'bids'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Project Overview Card */}
      {activeProject && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {activeProject.category}
              </span>
              <span className="text-xs text-slate-400">
                {isArabic ? `الميزانية: $${activeProject.budgetMin} - $${activeProject.budgetMax}` : `Budget: $${activeProject.budgetMin} - $${activeProject.budgetMax}`}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{activeProject.title}</h2>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2 max-w-2xl">
              {activeProject.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setFilterScore(filterScore === 'all' ? 'high' : 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                filterScore === 'high'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isArabic ? 'الأعلى تطابقاً (90%+ AI)' : 'Top AI Matches (90%+)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        {displayedProposals.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">
              {isArabic ? 'لا توجد عروض مقدمة حالياً لهذا المشروع' : 'No proposals found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isArabic
                ? 'سيتم إشعارك فور تقديم المستقلين لعروضهم مع تحليل المطابقة الذكية.'
                : 'You will receive a notification as soon as freelancers submit their proposals.'}
            </p>
          </div>
        ) : (
          displayedProposals.map((proposal) => {
            const isAccepted = proposal.status === 'accepted';
            const isRejected = proposal.status === 'rejected';

            return (
              <div
                key={proposal.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs hover:shadow-md ${
                  isAccepted
                    ? 'border-emerald-500 ring-2 ring-emerald-100'
                    : isRejected
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200/90'
                }`}
              >
                {/* AI Matching Banner (from PDF requirements) */}
                <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-3.5 px-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-black text-sm shadow-md">
                      {proposal.aiMatching.overallScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold tracking-wide text-white">
                          {isArabic ? 'تقييم المطابقة الذكية (AI Matching):' : 'AI Matching Score:'}
                        </span>
                        <span className="text-xs text-amber-300 font-bold">
                          {proposal.aiMatching.overallScore >= 95
                            ? isArabic ? '★ تطابق استثنائي (Top Candidate)' : '★ Top Candidate'
                            : isArabic ? 'تطابق عالي جداً' : 'Strong Match'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1">
                        {proposal.aiMatching.aiRecommendation}
                      </p>
                    </div>
                  </div>

                  {/* Criteria mini-badges */}
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                      {isArabic ? 'المهارات:' : 'Skills:'} {proposal.aiMatching.skillsMatch}%
                    </span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                      {isArabic ? 'الخبرة:' : 'Exp:'} {proposal.aiMatching.experienceMatch}%
                    </span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                      {isArabic ? 'الأعمال السابقة:' : 'Portfolio:'} {proposal.aiMatching.portfolioRelevance}%
                    </span>
                  </div>
                </div>

                {/* Proposal Main Body */}
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Freelancer Profile Details */}
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={proposal.freelancerAvatar}
                        alt={proposal.freelancerName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {proposal.freelancerName}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{proposal.freelancerRating}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            ({proposal.freelancerCompletedCount} {isArabic ? 'مشاريع منجزة' : 'completed'})
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-blue-600">
                          {proposal.freelancerTitle}
                        </p>

                        <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 mt-2">
                          <span className="font-bold text-slate-900 block mb-1">
                            {isArabic ? 'رسالة العرض (Cover Letter):' : 'Cover Letter:'}
                          </span>
                          {proposal.coverLetter}
                        </div>

                        {/* AI Key Advantages */}
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1 mb-1">
                            <Award className="w-3.5 h-3.5 text-purple-600" />
                            {isArabic ? 'نقاط القوة حسب تحليل الذكاء الاصطناعي:' : 'AI Key Insights:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {proposal.aiMatching.aiPros.map((pro, i) => (
                              <span
                                key={i}
                                className="text-[11px] bg-purple-50 text-purple-800 font-medium px-2.5 py-0.5 rounded-full border border-purple-200"
                              >
                                ✓ {pro}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Terms & Actions Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 min-w-[220px] flex flex-col justify-between gap-4 shrink-0">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase">
                          {isArabic ? 'قيمة العرض المقترح' : 'Proposed Price'}
                        </div>
                        <div className="text-2xl font-black text-slate-900">
                          ${proposal.proposedPrice}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {isArabic ? `خلال ${proposal.proposedDurationDays} يوماً` : `In ${proposal.proposedDurationDays} days`}
                          </span>
                        </div>
                      </div>

                      {/* Escrow note */}
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{isArabic ? 'محمي بنظام الضمان المالي Escrow' : 'Protected by Escrow'}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2">
                        {isAccepted ? (
                          <div className="bg-emerald-600 text-white text-center py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                            <Check className="w-4 h-4" />
                            <span>{isArabic ? 'تم قبول العرض والتعاقد' : 'Contract Active'}</span>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => onAcceptProposal(proposal.id)}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{isArabic ? 'قبول العرض وبدء العقد' : 'Accept & Contract'}</span>
                            </button>

                            <button
                              onClick={() => onOpenChatWithFreelancer(proposal.freelancerId, proposal.freelancerName)}
                              className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isArabic ? 'محادثة المستقل' : 'Message'}</span>
                            </button>

                            <button
                              onClick={() => onRejectProposal(proposal.id)}
                              className="w-full text-slate-400 hover:text-red-600 text-[11px] font-medium py-1 transition-colors"
                            >
                              {isArabic ? 'استبعاد العرض' : 'Decline'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
