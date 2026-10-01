import { useEffect, useRef, useState } from 'react';
import Navbar from '../Navbar';
import HeroContent from './HeroContent';
import HeroVisual from './HeroVisual';
import HeroIndicators from './HeroIndicators';
import {
  HERO_HOLD_MS,
  HERO_SLIDES,
} from '../../heroSlides';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}

function useIsCoarsePointer() {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setCoarse(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return coarse;
}

function useIsCompact() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)');
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return compact;
}

export default function Hero({ onSlideChange }) {
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useIsCoarsePointer();
  const compact = useIsCompact();

  const [activeIndex, setActiveIndex] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const activeRef = useRef(0);

  useEffect(() => {
    activeRef.current = activeIndex;
    onSlideChange?.(HERO_SLIDES[activeIndex], activeIndex);
  }, [activeIndex, onSlideChange]);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const next = (activeRef.current + 1) % HERO_SLIDES.length;
      setActiveIndex(next);
    }, HERO_HOLD_MS);

    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const goTo = (nextIndex) => {
    if (nextIndex === activeRef.current) {
      return;
    }
    setActiveIndex(nextIndex);
  };

  const onPointerMove = (event) => {
    if (reducedMotion || coarsePointer || !heroRef.current) {
      return;
    }

    const rect = heroRef.current.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    setParallax({
      x: Math.max(-8, Math.min(8, nx * 14)),
      y: Math.max(-6, Math.min(6, ny * 10)),
    });
  };

  const onPointerLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  return (
    <section
      className="fh-hero"
      ref={heroRef}
      onMouseMove={onPointerMove}
      onMouseLeave={onPointerLeave}
      aria-label="Freelance Hub introduction"
    >
      <div className="fh-hero__nav">
        <Navbar />
      </div>
      <div className="fh-hero__copy-col">
        <HeroContent slide={HERO_SLIDES[activeIndex]} />
      </div>
      <div className="fh-hero__visual-col">
        <HeroVisual
          slides={HERO_SLIDES}
          activeIndex={activeIndex}
          parallax={reducedMotion || coarsePointer ? { x: 0, y: 0 } : parallax}
          reduceLayers={compact || coarsePointer}
        />
        <HeroIndicators
          slides={HERO_SLIDES}
          activeIndex={activeIndex}
          onSelect={goTo}
          reducedMotion={reducedMotion}
        />
      </div>
    </section>
  );
}
