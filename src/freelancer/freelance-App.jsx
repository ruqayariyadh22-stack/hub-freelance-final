import React,{useState} from 'react';
import { Routes,Route,Navigate } from 'react-router-dom';
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

export default function App(){
 const [lang,setLang]=useState('ar');
 const [mobileOpen,setMobileOpen]=useState(false);
 const [aiOpen,setAiOpen]=useState(false);
 const [toast,setToast]=useState(null);
 const [input,setInput]=useState('');
 const [messages,setMessages]=useState([{role:'ai',text:t(lang,'مرحباً! أنا Hub AI. أقدر أحلل المشروع والميزانية، أقارن المطابقة، وأساعدك بصياغة العرض ووصف الخدمة.','Hi! I’m Hub AI. I can analyze projects and budgets, compare matching, and help draft proposals and service descriptions.')}]);
 React.useEffect(()=>{setMessages(m=>m.map(x=>x.role==='ai'&&m.length===1?{...x,text:t(lang,'مرحباً! أنا Hub AI. أقدر أحلل المشروع والميزانية، أقارن المطابقة، وأساعدك بصياغة العرض ووصف الخدمة.','Hi! I’m Hub AI. I can analyze projects and budgets, compare matching, and help draft proposals and service descriptions.')}:x));},[lang]);
 function notify(message){setToast(message);window.clearTimeout(window.__toast);window.__toast=window.setTimeout(()=>setToast(null),2400)}
 function sendAI(){if(!input.trim())return;const q=input.trim();setMessages(m=>[...m,{role:'user',text:q}]);setInput('');window.setTimeout(()=>setMessages(m=>[...m,{role:'ai',text:t(lang,'اعتماداً على معلومات المشروع، راجع الميزانية والمدة والمهارات المطلوبة مع ملفك وأعمالك السابقة. أستطيع أيضاً مساعدتك في تجهيز نقاط عرض واضحة دون اتخاذ القرار بالنيابة عنك.','Based on the project information, review the budget, timeline, and required skills against your profile and portfolio. I can also help prepare clear proposal points without making the decision for you.')}]),350)}
 return <><AppShell lang={lang} setLang={setLang} setAiOpen={setAiOpen} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}><Routes>
 <Route index element={<Dashboard lang={lang} notify={notify}/>}/>
 <Route path="projects" element={<Projects lang={lang} notify={notify}/>}/>
 <Route path="proposals" element={<Proposals lang={lang} notify={notify}/>}/>
 <Route path="workspace" element={<Workspace lang={lang} notify={notify}/>}/>
 <Route path="services" element={<Services lang={lang} notify={notify}/>}/>
 <Route path="profile" element={<Profile lang={lang} notify={notify}/>}/>
 <Route path="wallet" element={<Wallet lang={lang} notify={notify}/>}/>
 <Route path="subscriptions" element={<Subscriptions lang={lang} notify={notify}/>}/>
 <Route path="reviews" element={<Reviews lang={lang}/>}/>
 <Route path="disputes" element={<Disputes lang={lang} notify={notify}/>}/>
 <Route path="notifications" element={<Notifications lang={lang}/>}/>
 <Route path="settings" element={<Settings lang={lang} notify={notify}/>}/>
 <Route path="*" element={<Navigate to="/freelancer" replace/>}/>
 </Routes></AppShell>{aiOpen&&<AIHub lang={lang} onClose={()=>setAiOpen(false)} messages={messages} input={input} setInput={setInput} onSend={sendAI}/>} {toast&&<div className="toast">✓ {toast}</div>}</>;
}
