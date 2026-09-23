import React from 'react';

export default function HubLogo({ size = 'md', showText = false, subtitle = '' }) {
  const large = size === 'lg';
  return (
    <div className={`hub-logo-wrap ${large ? 'hub-logo-lg' : ''}`}>
      <div className="hub-logo-mark" aria-label="Freelance Hub logo">
        <svg viewBox="0 0 64 64" role="img">
          <defs>
            <linearGradient id="hubLogoGradient" x1="8" y1="8" x2="56" y2="56">
              <stop offset="0" stopColor="#5eead4" />
              <stop offset="1" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <rect x="7" y="7" width="50" height="50" rx="15" fill="url(#hubLogoGradient)" />
          <path d="M18 20h28v7H25v5h17v7H25v5h21v7H18z" fill="#071525" />
          <circle cx="47" cy="20" r="3" fill="#fff" />
        </svg>
      </div>
      {showText && <div className="hub-logo-text"><strong>Hub Freelance</strong>{subtitle && <span>{subtitle}</span>}</div>}
    </div>
  );
}
