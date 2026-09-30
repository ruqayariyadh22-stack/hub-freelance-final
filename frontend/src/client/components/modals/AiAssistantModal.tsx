import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  CheckCircle2,
  Cpu,
  Layers,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  openNewProjectModal: () => void;
  isArabic: boolean;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  openNewProjectModal,
  isArabic
}) => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<
    { role: 'user' | 'assistant'; text: string; action?: string }[]
  >([
    {
      role: 'assistant',
      text: isArabic
        ? 'مرحباً بك في مساعد هاب فري لانسر الذكي! كيف يمكنني مساعدتك اليوم؟ يمكنني صياغة وتحديد نطاق مشروع جديد، تقدير الميزانيات العادلة، أو شرح آلية تقييم مطابقة المستقلين.'
        : 'Welcome to the Hub Freelance AI Assistant! How can I help you? I can help draft project scopes, estimate fair market budgets, or analyze candidate proposals.'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = isArabic
    ? [
        'كم التكلفة التقديرية لبناء متجر بـ Next.js و Stripe؟',
        'كيف يعمل نظام مطابقة المستقلين AI Matching؟',
        'ما هي شروط وإجراءات طلب تعديل النطاق Scope Change؟'
      ]
    : [
        'What is an estimated budget for a Next.js e-commerce app?',
        'How does the AI Candidate Matching algorithm work?',
        'What are the guidelines for Scope Change requests?'
      ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    setConversation((prev) => [...prev, { role: 'user', text }]);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (text.includes('Next.js') || text.includes('متجر') || text.includes('تكلفة') || text.includes('budget')) {
        reply = isArabic
          ? 'بناءً على مشاريع المنصة المكتملة:\n- متجر Next.js متوسط الحجم مع سلة دفع وإدارة مخزون يتراوح بين 800$ إلى 1,500$.\n- متوسط مدة التنفيذ المقترحة: من 20 إلى 30 يوماً.\n- أنصحك بطلب تقنيات: Next.js 14, Tailwind CSS, TypeScript, و Stripe لضمان أداء وسرعة عالية.'
          : 'Based on completed platform benchmarks:\n- A mid-sized Next.js store with checkout and dashboard ranges between $800 and $1,500.\n- Recommended timeline: 20 to 30 days.\n- Recommended stack: Next.js 14, Tailwind CSS, TypeScript, and Stripe for optimal performance.';
      } else if (text.includes('مطابقة') || text.includes('Matching') || text.includes('AI')) {
        reply = isArabic
          ? 'يقوم محرك الذكاء الاصطناعي بتحليل 4 محاور أساسية:\n1. تطابق المهارات التقنية المطلوبة (Skills Match).\n2. سابقة أعمال المستقل ومستوى المشاريع المشابهة (Portfolio Relevance).\n3. سنوات الخبرة العملية (Experience Match).\n4. تقييمات ومعدل التسليم في الموعد المحدد (Specialty & Rating).'
          : 'The AI Matching Engine scores candidates across 4 key vectors:\n1. Technical Skills Match (90-100%).\n2. Portfolio Relevance to your specific domain.\n3. Practical Experience years.\n4. Timeliness and customer satisfaction ratings.';
      } else if (text.includes('Scope') || text.includes('تعديل') || text.includes('نطاق')) {
        reply = isArabic
          ? 'في هاب فري لانسر، طلب تعديل النطاق (Scope Change Request) هو إجراء موثق يطلبه المستقل عند إضافة مزايا خارج الاتفاق المبدئي، ويشمل تحديد السعر الإضافي وعدد أيام التمديد. ولا يتم خصم أي مبالغ من محفظتك إلا بعد موافقتك الصريحة.'
          : 'In Hub Freelancer, Scope Change Requests are formal adjustments requested by freelancers when requirements expand. You have full discretion to Approve or Reject changes before escrow funds adjust.';
      } else {
        reply = isArabic
          ? 'شكراً لسؤالك! يمكنك البدء الآن بنشر مشروع جديد وتحديد أفكارك الأولية، وسأقوم بتحويلها تلقائياً إلى وثيقة نطاق عمل احترافية.'
          : 'Thank you for your question! You can post a new project right now, and our AI Assistant will refine the specifications for you.';
      }

      setConversation((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {isArabic ? 'مساعد هاب الذكي (Hub AI Advisor)' : 'Hub AI Advisor'}
              </h2>
              <p className="text-[11px] text-purple-600 font-semibold">
                {isArabic ? 'استشارات الميزانية ونطاق العمل' : 'Budget & Project Consultation'}
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

        {/* Quick Question suggestions */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium px-2.5 py-1 rounded-xl border border-purple-200 transition-colors text-start"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1 text-xs">
          {conversation.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'ms-auto flex-row-reverse max-w-[85%]' : 'max-w-[90%]'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold">
                  AI
                </div>
              )}
              <div
                className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-te-xs'
                    : 'bg-slate-100 text-slate-800 rounded-ts-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
              <span>{isArabic ? 'جاري التحليل والتفكير...' : 'Analyzing...'}</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="pt-2 border-t border-slate-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isArabic ? 'اسأل المساعد الذكي عن أي شيء يخص مشروعك...' : 'Ask anything about project scope or budget...'}
              className="flex-1 text-xs bg-slate-50 focus:bg-white rounded-xl py-2.5 px-3.5 border border-slate-200 focus:border-purple-500 outline-none"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
