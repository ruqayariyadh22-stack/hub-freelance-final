import React, { useEffect, useState } from 'react';
import { Send, UserPlus, X } from 'lucide-react';
import { FreelancerItem, Project } from '../../types';
import { clientRequest, errorText } from '../../api';

interface InviteFreelancerModalProps {
  freelancer: FreelancerItem | null;
  projects: Project[];
  onClose: () => void;
  openNewProjectModal: () => void;
  isArabic: boolean;
}

export const InviteFreelancerModal: React.FC<InviteFreelancerModalProps> = ({
  freelancer,
  projects,
  onClose,
  openNewProjectModal,
  isArabic
}) => {
  const openProjects = projects.filter((p) => p.status === 'open' && /^\d+$/.test(p.id));
  const [projectId, setProjectId] = useState(openProjects[0]?.id || '');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setMessage(null);
    setProjectId(openProjects[0]?.id || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freelancer?.id]);

  if (!freelancer) return null;

  const send = async () => {
    if (!projectId || sending) return;
    setSending(true);
    setMessage(null);
    try {
      await clientRequest(`/projects/${projectId}/invitations`, {
        method: 'POST',
        body: { freelancer_id: Number(freelancer.id) }
      });
      setMessage({
        ok: true,
        text: isArabic
          ? `تم إرسال الدعوة إلى ${freelancer.name || 'المستقل'} بنجاح.`
          : `Invitation sent to ${freelancer.name || 'the freelancer'}.`
      });
    } catch (err) {
      setMessage({ ok: false, text: errorText(err, isArabic ? 'تعذر إرسال الدعوة' : 'Unable to send invitation') });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span>
              {isArabic ? 'دعوة للتقديم على مشروع' : 'Invite to a project'}
            </span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <img src={freelancer.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <p className="font-bold text-slate-900">{freelancer.name || `#${freelancer.id}`}</p>
            <p className="text-slate-400">{freelancer.specialty}</p>
          </div>
        </div>

        {openProjects.length === 0 ? (
          <div className="space-y-3">
            <p className="text-slate-600">
              {isArabic
                ? 'لا توجد لديك مشاريع مفتوحة حالياً. انشر مشروعاً أولاً ثم ادعُ المستقلين إليه.'
                : 'You have no open projects. Publish a project first, then invite freelancers to it.'}
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                openNewProjectModal();
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold"
            >
              {isArabic ? 'نشر مشروع جديد' : 'Post a new project'}
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'اختر المشروع' : 'Choose project'}
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              >
                {openProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {message && (
              <p className={`font-bold ${message.ok ? 'text-emerald-600' : 'text-red-600'}`}>{message.text}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
              <button
                type="button"
                onClick={send}
                disabled={sending || !projectId}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {sending ? (isArabic ? 'جاري الإرسال...' : 'Sending...') : isArabic ? 'إرسال الدعوة' : 'Send invitation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
