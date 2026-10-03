import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Plus, X } from 'lucide-react';
import { t } from '../freelance-i18n';
import { img } from '../freelance-data';
import { Card, PageHeader } from '../components/freelance-UI';
import {
  errorMessage,
  freelancerGet,
  freelancerPatch,
  freelancerPost,
  getFreelancerProfileId,
  getStoredUser,
  freelancerUpload,
  freelancerDelete,
} from '../api';

export default function Profile({ lang, notify }) {
  const [user, setUser] = useState(getStoredUser);
  const avatarInputRef = useRef(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [workImage, setWorkImage] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [skillBusy, setSkillBusy] = useState(false);
  const profileId = getFreelancerProfileId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('0');
  const [specialtyId, setSpecialtyId] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [skills, setSkills] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [workTitle, setWorkTitle] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [workUrl, setWorkUrl] = useState('');
  const [workBusy, setWorkBusy] = useState(false);

  const load = async () => {
    if (profileId == null) {
      setError(t(lang, 'تعذر تحديد ملف المستقل', 'Freelancer profile not found'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [profileData, specialtyData, skillData, portfolioData] = await Promise.all([
        freelancerGet(`/freelancers/${profileId}`),
        freelancerGet('/specialties'),
        freelancerGet(`/freelancers/${profileId}/skills`),
        freelancerGet(`/freelancers/${profileId}/portfolio`),
      ]);
      setProfile(profileData);
      setBio(profileData.bio || '');
      setExperienceYears(
        profileData.experience_years != null ? String(profileData.experience_years) : '0',
      );
      setSpecialtyId(
        profileData.specialty_id != null ? String(profileData.specialty_id) : '',
      );
      setSpecialties(Array.isArray(specialtyData) ? specialtyData : []);
      setSkills(Array.isArray(skillData) ? skillData : []);
      setPortfolio(Array.isArray(portfolioData) ? portfolioData : []);
    } catch (err) {
      setError(errorMessage(err, t(lang, 'تعذر تحميل الملف', 'Failed to load profile')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfile = async () => {
    if (profileId == null || saving) return;
    const years = Number(experienceYears);
    if (!Number.isInteger(years) || years < 0) {
      notify(t(lang, 'سنوات الخبرة غير صحيحة', 'Invalid experience years'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        bio: bio.trim() || null,
        experience_years: years,
      };
      if (specialtyId !== '') {
        payload.specialty_id = Number(specialtyId);
      } else {
        payload.specialty_id = null;
      }
      const updated = await freelancerPatch(`/freelancers/${profileId}`, payload);
      setProfile(updated);
      notify(t(lang, 'تم حفظ الملف', 'Profile saved'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل حفظ الملف', 'Failed to save profile')));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const term = skillInput.trim();
    if (term.length < 1) {
      setSkillSuggestions([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      freelancerGet(`/skills?search=${encodeURIComponent(term)}`)
        .then((rows) => setSkillSuggestions(Array.isArray(rows) ? rows : []))
        .catch(() => setSkillSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [skillInput]);

  const addSkill = async (name) => {
    const value = (name ?? skillInput).trim();
    if (!value || skillBusy) return;
    if (skills.some((s) => s.name.toLowerCase() === value.toLowerCase())) {
      notify(t(lang, 'المهارة مضافة مسبقاً', 'Skill already added'));
      return;
    }
    setSkillBusy(true);
    try {
      const created = await freelancerPost(`/freelancers/${profileId}/skills`, { name: value });
      setSkills((prev) =>
        [...prev, { id: created.skill_id, name: created.name }].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSkillInput('');
      setSkillSuggestions([]);
    } catch (err) {
      notify(errorMessage(err, t(lang, 'تعذر إضافة المهارة', 'Failed to add skill')));
    } finally {
      setSkillBusy(false);
    }
  };

  const removeSkill = async (skill) => {
    if (skillBusy) return;
    setSkillBusy(true);
    try {
      await freelancerDelete(`/freelancers/${profileId}/skills/${skill.id}`);
      setSkills((prev) => prev.filter((s) => s.id !== skill.id));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'تعذر حذف المهارة', 'Failed to remove skill')));
    } finally {
      setSkillBusy(false);
    }
  };

  const changeAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || avatarBusy) return;
    if (!file.type.startsWith('image/')) {
      notify(t(lang, 'يرجى اختيار صورة', 'Please choose an image'));
      return;
    }
    setAvatarBusy(true);
    try {
      const uploaded = await freelancerUpload('/uploads', file);
      const updated = await freelancerPatch('/users/me', { profile_image: uploaded.file_url });
      const nextUser = { ...getStoredUser(), ...updated };
      localStorage.setItem('hub_user', JSON.stringify(nextUser));
      setUser(nextUser);
      notify(t(lang, 'تم تحديث الصورة الشخصية', 'Profile photo updated'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل رفع الصورة', 'Failed to upload photo')));
    } finally {
      setAvatarBusy(false);
    }
  };

  const addPortfolioItem = async () => {
    if (!workTitle.trim() || !workDescription.trim() || workBusy) return;
    setWorkBusy(true);
    try {
      let imageUrl = null;
      if (workImage) {
        const uploaded = await freelancerUpload('/uploads', workImage);
        imageUrl = uploaded.file_url;
      }
      const created = await freelancerPost(`/freelancers/${profileId}/portfolio`, {
        title: workTitle.trim(),
        description: workDescription.trim(),
        project_url: workUrl.trim() || null,
        image_url: imageUrl,
      });
      setPortfolio((prev) => [...prev, created]);
      setShowAddWork(false);
      setWorkTitle('');
      setWorkDescription('');
      setWorkUrl('');
      setWorkImage(null);
      notify(t(lang, 'تمت إضافة العمل', 'Portfolio item added'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل إضافة العمل', 'Failed to add portfolio item')));
    } finally {
      setWorkBusy(false);
    }
  };

  const avatar = user?.profile_image || img.placeholder;

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="الملف الشخصي والأعمال"
        titleEn="Profile & Portfolio"
        subAr="حدّث تخصصك ومهاراتك وأعمالك السابقة."
        subEn="Keep your specialty, skills, and portfolio up to date."
        action={
          <button className="primary" type="button" disabled={saving || loading} onClick={saveProfile}>
            <Check size={15} />
            {saving
              ? t(lang, 'جاري الحفظ...', 'Saving...')
              : t(lang, 'حفظ التغييرات', 'Save changes')}
          </button>
        }
      />

      {loading && <Card><p>{t(lang, 'جاري التحميل...', 'Loading...')}</p></Card>}
      {error && (
        <Card>
          <p className="notice amber">{error}</p>
          <button className="primary" type="button" onClick={load}>
            {t(lang, 'إعادة المحاولة', 'Retry')}
          </button>
        </Card>
      )}

      {!loading && !error && (
        <>
          <Card className="profile-card">
            <div className="profile-hero">
              <div style={{ position: 'relative' }}>
                <img src={avatar} alt="" />
                <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={changeAvatar} />
                <button
                  className="icon-btn"
                  type="button"
                  disabled={avatarBusy}
                  title={t(lang, 'تغيير الصورة', 'Change photo')}
                  onClick={() => avatarInputRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, insetInlineEnd: 0 }}
                >
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h2>{user?.name || '—'}</h2>
                <p>{user?.email || ''}</p>
                <div className="mini-stats">
                  <span>
                    {profile?.experience_years ?? 0} {t(lang, 'سنوات خبرة', 'years')}
                  </span>
                  <span>
                    {profile?.completed_projects_count ?? 0} {t(lang, 'مشروعاً', 'projects')}
                  </span>
                  <span>
                    {profile?.rating_avg != null
                      ? `${Number(profile.rating_avg).toFixed(1)} ★`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
            <div className="form-grid">
              <label>
                {t(lang, 'التخصص الرئيسي', 'Primary specialty')}
                <select
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value)}
                >
                  <option value="">{t(lang, 'بدون تخصص', 'No specialty')}</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t(lang, 'سنوات الخبرة', 'Experience years')}
                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </label>
              <label className="full">
                {t(lang, 'نبذة عنك', 'Bio')}
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
              </label>
            </div>
          </Card>

          <div className="grid-2">
            <Card>
              <div className="card-head">
                <div>
                  <h3>{t(lang, 'المهارات', 'Skills')}</h3>
                  <p>
                    {t(
                      lang,
                      'أضف مهاراتك ليتمكن العملاء والمطابقة الذكية من العثور عليك.',
                      'Add your skills so clients and AI matching can find you.',
                    )}
                  </p>
                </div>
              </div>
              <form
                className="chat-input"
                style={{ marginBottom: 12 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  addSkill();
                }}
              >
                <input
                  value={skillInput}
                  list="skill-suggestions"
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder={t(lang, 'مثال: React، Figma، SEO', 'e.g. React, Figma, SEO')}
                  disabled={skillBusy}
                />
                <datalist id="skill-suggestions">
                  {skillSuggestions.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
                <button className="primary round" type="submit" disabled={skillBusy || !skillInput.trim()}>
                  <Plus size={15} />
                </button>
              </form>
              <div className="tag-row large-tags">
                {skills.map((s) => (
                  <span className="tag" key={s.id}>
                    {s.name}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      disabled={skillBusy}
                      aria-label={t(lang, 'حذف', 'Remove')}
                      style={{ marginInlineStart: 6, background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span>{t(lang, 'لا مهارات مسجلة', 'No skills assigned')}</span>
                )}
              </div>
            </Card>

            <Card>
              <div className="card-head">
                <div>
                  <h3>{t(lang, 'المحفظة', 'Portfolio')}</h3>
                  <p>{t(lang, 'أعمالك السابقة', 'Previous work')}</p>
                </div>
                <button className="ghost" type="button" onClick={() => setShowAddWork(true)}>
                  <Plus size={14} />
                  {t(lang, 'إضافة عمل', 'Add item')}
                </button>
              </div>
              <div className="portfolio-grid">
                {portfolio.map((work) => (
                  <div className="portfolio-item" key={work.id}>
                    <img src={work.image_url || img.placeholder} alt="" />
                    <div>
                      <b>{work.title}</b>
                      <small>{work.description}</small>
                    </div>
                  </div>
                ))}
                {portfolio.length === 0 && (
                  <p>{t(lang, 'لا أعمال بعد', 'No portfolio items yet')}</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {showAddWork && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>{t(lang, 'إضافة عمل جديد', 'Add Portfolio Item')}</h3>
              </div>
              <button className="icon-btn" type="button" onClick={() => setShowAddWork(false)}>
                <X size={17} />
              </button>
            </div>
            <div className="form-grid">
              <label className="full">
                {t(lang, 'اسم العمل', 'Project title')}
                <input value={workTitle} onChange={(e) => setWorkTitle(e.target.value)} />
              </label>
              <label className="full">
                {t(lang, 'الوصف', 'Description')}
                <textarea
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                />
              </label>
              <label className="full">
                {t(lang, 'رابط المشروع (اختياري)', 'Project URL (optional)')}
                <input value={workUrl} onChange={(e) => setWorkUrl(e.target.value)} />
              </label>
              <label className="full">
                {t(lang, 'صورة العمل (اختياري)', 'Cover image (optional)')}
                <input type="file" accept="image/*" onChange={(e) => setWorkImage(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="modal-actions">
              <button className="ghost" type="button" onClick={() => setShowAddWork(false)}>
                {t(lang, 'إلغاء', 'Cancel')}
              </button>
              <button className="primary" type="button" disabled={workBusy} onClick={addPortfolioItem}>
                {workBusy
                  ? t(lang, 'جاري الحفظ...', 'Saving...')
                  : t(lang, 'حفظ', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
