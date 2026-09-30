import React, { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
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
} from '../api';

export default function Profile({ lang, notify }) {
  const user = getStoredUser();
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

  const addPortfolioItem = async () => {
    if (!workTitle.trim() || !workDescription.trim() || workBusy) return;
    setWorkBusy(true);
    try {
      const created = await freelancerPost(`/freelancers/${profileId}/portfolio`, {
        title: workTitle.trim(),
        description: workDescription.trim(),
        project_url: workUrl.trim() || null,
        image_url: null,
      });
      setPortfolio((prev) => [...prev, created]);
      setShowAddWork(false);
      setWorkTitle('');
      setWorkDescription('');
      setWorkUrl('');
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
              <img src={avatar} alt="" />
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
                      'عرض المهارات المرتبطة. الإضافة بالاسم الحر غير مدعومة دون كتالوج skills API.',
                      'Assigned skills. Free-text add needs a skills catalog API.',
                    )}
                  </p>
                </div>
              </div>
              <div className="tag-row large-tags">
                {skills.map((s) => (
                  <span className="tag" key={s.id}>
                    {s.name}
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
