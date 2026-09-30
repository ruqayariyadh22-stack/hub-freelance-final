import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  X,
  Award,
  Sparkles
} from 'lucide-react';
import { Contract } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onSubmitReview: (contractId: string, rating: number, feedback: string, tags: string[]) => void;
  isArabic: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  contract,
  onSubmitReview,
  isArabic
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    isArabic ? 'احترافية عالية' : 'Professionalism',
    isArabic ? 'دقة بالمواعيد' : 'On-time Delivery'
  ]);

  if (!isOpen || !contract) return null;

  const availableTags = isArabic
    ? ['احترافية عالية', 'دقة بالمواعيد', 'جودة استثنائية', 'تواصل ممتاز', 'فهم عميق للمتطلبات', 'كود نظيف']
    : ['Professionalism', 'On-time Delivery', 'Top Quality', 'Great Communication', 'Clean Code'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    onSubmitReview(contract.id, rating, feedback.trim(), selectedTags);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isArabic ? 'تقييم أداء المستقل' : 'Rate Freelancer'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {contract.projectTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Freelancer Header */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <img
              src={contract.freelancerAvatar}
              alt={contract.freelancerName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{contract.freelancerName}</h3>
              <p className="text-slate-500 text-[11px]">{contract.freelancerSpecialty}</p>
            </div>
          </div>

          {/* Star Selection */}
          <div className="text-center py-2">
            <label className="font-bold text-slate-700 block mb-2">
              {isArabic ? 'كم تقييمك العام لجودة العمل والتعامل؟' : 'Overall Satisfaction'}
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 mt-1 block">
              {rating === 5
                ? isArabic ? 'ممتاز واحترافي جداً ★★★★★' : 'Excellent (5.0)'
                : rating === 4
                ? isArabic ? 'جيد جداً ★★★★' : 'Very Good (4.0)'
                : isArabic ? `${rating} نجوم` : `${rating} Stars`}
            </span>
          </div>

          {/* Tags */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              {isArabic ? 'أبرز المزايا التي لاحظتها:' : 'Key Strengths:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isArabic ? 'كلمة شكر أو ملاحظات تفصيلية للمستقل' : 'Detailed Feedback & Review'} *
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                isArabic
                  ? 'اكتب رأيك الصادق في جودة المخرجات، الالتزام بالوقت، وسرعة الاستجابة...'
                  : 'Share your honest feedback about quality, speed, and communication...'
              }
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none resize-none leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 font-semibold"
            >
              {isArabic ? 'لاحقاً' : 'Later'}
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isArabic ? 'نشر التقييم' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
