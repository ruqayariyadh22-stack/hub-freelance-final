import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, AIHub } from './components/freelance-Shell';
import Dashboard from './pages/freelance-Dashboard';
import Projects from './pages/freelance-Projects';
import Proposals from './pages/freelance-Proposals';
import Workspace from './pages/freelance-Workspace';
import Services from './pages/freelance-Services';
import Profile from './pages/freelance-Profile';
import Wallet from './pages/freelance-Wallet';
import Subscriptions from './pages/freelance-Subscriptions';
import Reviews from './pages/freelance-Reviews';
import Disputes from './pages/freelance-Disputes';
import Notifications from './pages/freelance-Notifications';
import Settings from './pages/freelance-Settings';
import { t } from './freelance-i18n';
import { errorMessage, freelancerPost } from './api';
import './freelance-styles.css';

function extractAiText(data) {
  if (!data) return null;
  if (typeof data.result === 'string' && data.result.trim()) return data.result;
  if (typeof data.analysis === 'string' && data.analysis.trim()) return data.analysis;
  if (typeof data.message === 'string' && data.message.trim()) return data.message;
  if (typeof data.text === 'string' && data.text.trim()) return data.text;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export default function App() {
  const [lang, setLang] = useState('ar');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: t(
        lang,
        'مرحباً! أستطيع تحليل المشروع أو الميزانية عبر واجهات الذكاء الاصطناعي المعتمدة للمستقل.',
        'Hi! I can run Freelancer project analysis or budget analysis through the real AI endpoints.',
      ),
    },
  ]);

  React.useEffect(() => {
    setMessages((m) =>
      m.length === 1 && m[0].role === 'ai'
        ? [
            {
              role: 'ai',
              text: t(
                lang,
                'مرحباً! أستطيع تحليل المشروع أو الميزانية عبر واجهات الذكاء الاصطناعي المعتمدة للمستقل.',
                'Hi! I can run Freelancer project analysis or budget analysis through the real AI endpoints.',
              ),
            },
          ]
        : m,
    );
  }, [lang]);

  function notify(message) {
    setToast(message);
    window.clearTimeout(window.__toast);
    window.__toast = window.setTimeout(() => setToast(null), 2400);
  }

  async function sendAI() {
    if (!input.trim() || sending) return;
    const q = input.trim();
    setInput('');
    setAiError(null);
    setMessages((m) => [...m, { role: 'user', text: q }]);

    const lower = q.toLowerCase();
    const wantsBudget =
      lower.includes('budget') || q.includes('ميزاني');
    const wantsProject =
      !wantsBudget &&
      (q.includes('حلل مشروع') || q.includes('تحليل المشروع') || lower.includes('analyze my project') || lower.includes('project analysis'));
    const history = messages
      .slice(1)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }))
      .filter((m) => m.text);

    setSending(true);
    try {
      let text;
      if (wantsBudget || wantsProject) {
        const data = await freelancerPost(wantsBudget ? '/ai/budget-analysis' : '/ai/project-analysis', {});
        text = extractAiText(data);
      } else {
        const data = await freelancerPost('/ai/assistant', { message: q, history });
        text = data?.reply;
      }
      setMessages((m) => [
        ...m,
        { role: 'ai', text: text || t(lang, 'تم إكمال التحليل.', 'Analysis completed.') },
      ]);
    } catch (err) {
      const msg =
        err?.status === 503
          ? t(
              lang,
              'المساعد الذكي غير متاح حالياً: لم يتم إعداد مفتاح Gemini على الخادم.',
              'The AI assistant is unavailable: the Gemini API key is not configured on the server.',
            )
          : err?.status === 429
            ? t(lang, 'وصلت للحد اليومي لطلبات الذكاء الاصطناعي. حاول غداً.', 'Daily AI limit reached. Try again tomorrow.')
            : errorMessage(err, t(lang, 'فشل طلب الذكاء الاصطناعي', 'AI request failed'));
      setAiError(msg);
      setMessages((m) => [...m, { role: 'ai', text: msg }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AppShell
        lang={lang}
        setLang={setLang}
        setAiOpen={setAiOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      >
        <Routes>
          <Route index element={<Dashboard lang={lang} notify={notify} />} />
          <Route path="projects" element={<Projects lang={lang} notify={notify} />} />
          <Route path="proposals" element={<Proposals lang={lang} notify={notify} />} />
          <Route path="workspace" element={<Workspace lang={lang} notify={notify} />} />
          <Route path="services" element={<Services lang={lang} notify={notify} />} />
          <Route path="profile" element={<Profile lang={lang} notify={notify} />} />
          <Route path="wallet" element={<Wallet lang={lang} notify={notify} />} />
          <Route
            path="subscriptions"
            element={<Subscriptions lang={lang} notify={notify} />}
          />
          <Route path="reviews" element={<Reviews lang={lang} />} />
          <Route path="disputes" element={<Disputes lang={lang} notify={notify} />} />
          <Route path="notifications" element={<Notifications lang={lang} notify={notify} />} />
          <Route path="settings" element={<Settings lang={lang} notify={notify} />} />
          <Route path="*" element={<Navigate to="/freelancer" replace />} />
        </Routes>
      </AppShell>
      {aiOpen && (
        <AIHub
          lang={lang}
          onClose={() => setAiOpen(false)}
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={sendAI}
          sending={sending}
          aiError={aiError}
        />
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}
