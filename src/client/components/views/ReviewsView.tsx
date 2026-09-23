import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  Award,
  CheckCircle,
  ThumbsUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { ReviewRecord, Contract } from '../../types';

interface ReviewsViewProps {
  reviews: ReviewRecord[];
  contracts: Contract[];
  onOpenReviewModal: (contract: Contract) => void;
  isArabic: boolean;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  reviews,
  contracts,
  onOpenReviewModal,
  isArabic
}) => {
  // Check completed contracts that haven't been reviewed yet
  const unreviewedCompletedContracts = contracts.filter(
    (c) => c.status === 'completed' && !reviews.some((r) => r.contractId === c.id)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header matching Screen 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isArabic ? 'التقييمات والملاحظات (Reviews & Comments)' : 'Reviews & Comments'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isArabic
              ? 'مراجعة التقييمات المتبادلة مع المستقلين وتوثيق جودة الإنجاز والاحترافية'
              : 'Monitor ratings and manage feedback for completed milestones'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{isArabic ? 'متوسط تقييمك للمستقلين: 5.0' : 'Avg Rating Given: 5.0'}</span>
          </div>
        </div>
      </div>

      {/* Contracts waiting for review alert */}
      {unreviewedCompletedContracts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                {isArabic ? 'لديك مشاريع مكتملة بانتظار تقييمك!' : 'Pending Reviews for Completed Projects'}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {isArabic
                  ? `أكملت بنجاح مشروع "${unreviewedCompletedContracts[0].projectTitle}". ساهم في دعم المستقل بإضافة تقييمك.`
                  : `Successfully completed project "${unreviewedCompletedContracts[0].projectTitle}". Leave a review.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenReviewModal(unreviewedCompletedContracts[0])}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all shrink-0 active:scale-95"
          >
            {isArabic ? 'إضافة تقييم الآن ★' : 'Write Review Now'}
          </button>
        </div>
      )}

      {/* Past Reviews List matching Screen 9 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          {isArabic ? 'سجل التقييمات الممنوحة' : 'Given Reviews History'}
        </h3>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {isArabic ? 'لا توجد تقييمات سابقة مسجلة' : 'No past reviews yet'}
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={rev.freelancerAvatar}
                      alt={rev.freelancerName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{rev.freelancerName}</span>
                        <span className="text-[11px] text-blue-600 font-semibold">• {rev.freelancerSpecialty}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isArabic ? `عن مشروع: ${rev.projectTitle}` : `Project: ${rev.projectTitle}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700">({rev.rating}.0)</span>
                    <span className="text-[10px] text-slate-400 ms-2">{rev.createdAt}</span>
                  </div>
                </div>

                {/* Review body */}
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                  {rev.feedback}
                </p>

                {/* Tag pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rev.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
