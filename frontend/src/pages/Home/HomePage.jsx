import { useCallback, useEffect, useState } from 'react';
import Hero from './components/Hero/Hero';
import './home.css';

export default function HomePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const onSlideChange = useCallback((slide) => {
    if (!slide) {
      return;
    }
    const root = document.querySelector('.fh-landing');
    if (!root) {
      return;
    }
    root.style.setProperty('--hero-glow', slide.glowRgb);
    root.style.setProperty('--hero-accent', slide.accent);
    root.style.setProperty('--hero-depth', slide.depth);
  }, []);

  return (
    <div className={`fh-landing${ready ? ' is-ready' : ''}`}>
      <div className="fh-landing__grain" aria-hidden="true" />
      <div className="fh-landing__frame">
        <Hero onSlideChange={onSlideChange} />
      </div>
    </div>
  );
}
