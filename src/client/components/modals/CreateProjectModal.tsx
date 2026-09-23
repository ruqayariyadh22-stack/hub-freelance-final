import React, { useState } from 'react';
import {
  FolderPlus,
  Sparkles,
  DollarSign,
  Calendar,
  Layers,
  Wand2,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { Project } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: (projectData: Omit<Project, 'id' | 'clientId' | 'proposalsCount' | 'publishedAt'>) => void;
  isArabic: boolean;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSaveProject,
  isArabic
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Development');
  const [budgetMin, setBudgetMin] = useState(500);
  const [budgetMax, setBudgetMax] = useState(1200);
  const [durationDays, setDurationDays] = useState(15);
  const [skillsInput, setSkillsInput] = useState('React, Tailwind CSS, TypeScript');
  const [rawIdea, setRawIdea] = useState('');
  const [description, setDescription] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!isOpen) return null;

  // AI Description Assistant simulation (from PDF Section 6 & 14)
  const handleGenerateAiDescription = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const generated = isArabic
        ? `[نطاق العمل ومواصفات المشروع - صياغة الذكاء الاصطناعي]:
نبحث عن محترف متخصص في مجالات (${category}) لتنفيذ المشروع بكفاءة وأعلى معايير الجودة البرمجية.

■ المخرجات والمهام المطلوبة (Scope of Work):
1. بناء وتطوير الواجهات الرئيسية المتجاوبة مع كافة مقاسات الشاشات والهواتف الذكية.
2. الالتزام بالتقنيات المطلوبة: ${skillsInput}.
3. ربط وتكامل واجهات برمجة التطبيقات (APIs) مع معالجة حالات الخطأ والتحميل بكفاءة.
4. إجراء الفحص والاختبار الشامل للتأكد من خلو المشروع من أي أخطاء وثغرات برمجية.
5. تسليم الكود البرمجي مع توثيق شامل لدليل التشغيل (Documentation).

■ الشروط الفنية والتسليم:
- الميزانية المرصودة: $${budgetMin} - $${budgetMax}
- مدة الإنجاز القصوى: ${durationDays} يوماً
- المتابعة الدورية عبر مساحة العمل وتحديث قائمة المهام أسبوعياً.`
        : `[Project Scope of Work - Formulated by AI Assistant]:
We are seeking an expert specialized in ${category} to deliver this project with high standards of craftsmanship and code performance.

■ Key Deliverables & Responsibilities:
1. Develop responsive, performant views matching modern UX best practices.
2. Leverage the required core stack: ${skillsInput}.
3. Implement clean state management, modular architecture, and API integration.
4. Comprehensive QA, cross-browser compatibility, and speed optimization.
5. Complete codebase handoff with clear documentation and deployment setup.

■ Project Constraints:
- Budget Range: $${budgetMin} - $${budgetMax}
- Timeline: ${durationDays} days
- Communication: Regular sprint syncs through Hub Freelance Workspace.`;

      setDescription(generated);
      setIsGeneratingAi(false);
    }, 900);
  };

  const handleSubmit = (status: 'open' | 'draft') => {
    if (!title.trim() || !description.trim()) {
      alert(isArabic ? 'يرجى إدخال عنوان المشروع والوصف' : 'Please fill in title and description');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSaveProject({
      title: title.trim(),
      description: description.trim(),
      category,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      durationDays: Number(durationDays),
      requiredSkills: skills.length > 0 ? skills : ['General'],
      attachments: [],
      status,
      deadline: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isArabic ? 'نشر مشروع جديد (Create New Project)' : 'Create New Project'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isArabic ? 'مدعوم بمساعد الذكاء الاصطناعي لكتابة المواصفات' : 'Powered by AI Description Assistant'}
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

        {/* Scrollable Modal Content */}
        <div className="space-y-4 overflow-y-auto flex-1 pe-1 text-xs">
          {/* Title */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isArabic ? 'عنوان المشروع' : 'Project Title'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isArabic ? 'مثال: تطوير تطبيق حجز مواعيد للأطباء بـ Flutter' : 'e.g. Full-Stack SaaS Landing & Dashboard'}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              required
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'التصنيف الرئيسي' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              >
                <option value="Development">{isArabic ? 'تطوير وبرمجة (Development)' : 'Development'}</option>
                <option value="Design">{isArabic ? 'تصميم واجهات وتجربة مستخدم (Design & UI/UX)' : 'Design'}</option>
                <option value="Writing">{isArabic ? 'كتابة محتوى وترجمة وسيو (Writing & SEO)' : 'Writing'}</option>
                <option value="Marketing">{isArabic ? 'تسويق رقمي وإعلانات (Marketing)' : 'Marketing'}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'مدة الإنجاز المقترحة (بالأيام)' : 'Estimated Duration (Days)'}
              </label>
              <input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Budget Min and Max */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'الحد الأدنى للميزانية ($)' : 'Min Budget ($)'}
              </label>
              <input
                type="number"
                min={50}
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'الحد الأقصى للميزانية ($)' : 'Max Budget ($)'}
              </label>
              <input
                type="number"
                min={budgetMin}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isArabic ? 'المهارات المطلوبة (مفصولة بفاصلة)' : 'Required Skills (comma separated)'}
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Next.js, Tailwind, TypeScript, Figma"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* AI Assistant Section (Feature described in PDF Page 14) */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-4 rounded-2xl border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-extrabold text-purple-900 text-xs">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>{isArabic ? 'مساعد الذكاء الاصطناعي AI Description Assistant' : 'AI Description Assistant'}</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingAi}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isGeneratingAi ? (isArabic ? 'جاري التوليد...' : 'Generating...') : (isArabic ? 'توليد صياغة احترافية' : 'Generate with AI')}</span>
              </button>
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              {isArabic
                ? 'اضغط زر التوليد لتحويل أفكارك ومهامك إلى وثيقة نطاق عمل (Scope of Work) احترافية تزيد من دقة عروض المستقلين.'
                : 'Turn rough requirements into a professional scope of work that attracts top tier proposals.'}
            </p>
          </div>

          {/* Project Detailed Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isArabic ? 'وصف ونطاق عمل المشروع' : 'Project Scope & Requirements'} *
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isArabic ? 'اكتب تفاصيل المشروع أو استخدم المساعد الذكي بالأعلى...' : 'Write detailed requirements or generate with AI above...'}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none leading-relaxed resize-none font-sans"
              required
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-semibold text-xs px-4 py-2"
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              {isArabic ? 'حفظ كمسودة' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('open')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isArabic ? 'نشر المشروع وتلقي العروض' : 'Publish Project'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
