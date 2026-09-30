import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, Empty, PageHeader } from '../components/freelance-UI';
import {
  errorMessage,
  freelancerGet,
  getFreelancerProfileId,
} from '../api';

export default function Reviews({ lang }) {
  const profileId = getFreelancerProfileId();
  const [reviews, setReviews] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (profileId == null) {
      setError(t(lang, 'تعذر تحديد ملف المستقل', 'Freelancer profile not found'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [reviewData, profileData] = await Promise.all([
        freelancerGet(`/freelancers/${profileId}/reviews`),
        freelancerGet(`/freelancers/${profileId}`),
      ]);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
      setProfile(profileData);
    } catch (err) {
      setError(errorMessage(err, t(lang, 'تعذر تحميل التقييمات', 'Failed to load reviews')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const avg =
    profile?.rating_avg != null ? Number(profile.rating_avg).toFixed(1) : '—';

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="التقييمات والملاحظات"
        titleEn="Reviews & Ratings"
        subAr="تقييمات العملاء المرتبطة بملفك."
        subEn="Client reviews linked to your profile."
        action={
          <div className="rating-pill">
            <Star size={15} fill="currentColor" /> {avg}{' '}
            <span>/ 5.0</span>
          </div>
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
      {!loading && !error && reviews.length === 0 && (
        <Empty
          lang={lang}
          titleAr="لا تقييمات"
          titleEn="No reviews"
          bodyAr="لا توجد تقييمات بعد."
          bodyEn="You have no reviews yet."
        />
      )}
      {!loading && !error && reviews.length > 0 && (
        <Card>
          <div className="card-head">
            <div>
              <h3>{t(lang, 'سجل التقييمات', 'Review history')}</h3>
            </div>
          </div>
          {reviews.map((r) => (
            <div className="review" key={r.id}>
              <div className="review-head">
                <div>
                  <b>
                    {t(lang, 'عقد', 'Contract')} #{r.contract_id}
                  </b>
                  <small>
                    {t(lang, 'من', 'From')} #{r.reviewer_id}
                  </small>
                </div>
                <div className="stars">
                  {'★'.repeat(Math.max(0, Math.round(Number(r.rating) || 0)))}
                  <span>{r.rating != null ? Number(r.rating).toFixed(1) : '—'}</span>
                </div>
              </div>
              <p>{r.comment || '—'}</p>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
