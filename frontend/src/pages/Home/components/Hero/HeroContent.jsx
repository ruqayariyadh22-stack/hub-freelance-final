import { Link } from 'react-router-dom';

export default function HeroContent({ slide }) {
  return (
    <div className="fh-hero__copy">
      <p className="fh-hero__eyebrow">
        <span className="fh-hero__eyebrow-line" aria-hidden="true" />
        Freelance Hub
      </p>

      <h1 className="fh-hero__title">
        Where clients meet <em>trusted freelancers</em>
      </h1>

      <p className="fh-hero__lead">
        Freelance Hub is a connected workspace for discovery, proposals, delivery,
        and secure collaboration — built for serious work.
      </p>

      <div className="fh-hero__actions">
        <Link className="fh-hero__btn fh-hero__btn--primary" to="/login">
          Get Started
        </Link>
        <Link className="fh-hero__btn fh-hero__btn--ghost" to="/about">
          About the platform
        </Link>
      </div>

      <div className="fh-hero__meta" aria-live="polite">
        <span>Curated matching</span>
        <span className="fh-hero__meta-sep" aria-hidden="true" />
        <span>{slide?.label || 'Live marketplace'}</span>
      </div>
    </div>
  );
}
