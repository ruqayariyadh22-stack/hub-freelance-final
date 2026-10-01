export default function HeroIndicators({
  slides,
  activeIndex,
  onSelect,
  reducedMotion,
}) {
  const current = String(activeIndex + 1).padStart(2, '0');
  const total = String(slides.length).padStart(2, '0');
  const label = slides[activeIndex]?.label || '';

  return (
    <div className="fh-indicators" aria-label="Hero visual sequence">
      <div className="fh-indicators__count">
        <span>{current}</span>
        {' / '}
        {total}
      </div>

      <div className="fh-indicators__track" role="tablist" aria-label="Select hero visual">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Show visual ${index + 1}: ${slide.label}`}
            className={`fh-indicators__dot${index === activeIndex ? ' is-active' : ''}`}
            onClick={() => onSelect(index)}
          />
        ))}
      </div>

      {!reducedMotion && <div className="fh-indicators__label">{label}</div>}
    </div>
  );
}
