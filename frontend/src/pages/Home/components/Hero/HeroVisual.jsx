export default function HeroVisual({
  slides,
  activeIndex,
  parallax,
  reduceLayers,
}) {
  return (
    <div className="fh-visual" aria-hidden="true">
      <div className="fh-visual__orbit" />
      <div className="fh-visual__halo" />

      <div
        className="fh-visual__stage"
        style={{
          transform: `translate3d(${parallax.x * 0.45}px, ${parallax.y * 0.45}px, 0)`,
        }}
      >
        <div
          className="fh-visual__layer"
          style={{
            transform: `translate3d(${parallax.x * 0.7}px, ${parallax.y * 0.55}px, 0)`,
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={`primary-${slide.id}`}
              className={`fh-visual__plate fh-visual__plate--primary ${
                index === activeIndex ? 'is-active' : 'is-idle'
              }`}
            >
              <img
                src={slide.src}
                alt=""
                style={{ objectPosition: slide.objectPosition }}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {!reduceLayers && (
          <div
            className="fh-visual__layer"
            style={{
              transform: `translate3d(${parallax.x * 1.05}px, ${parallax.y * 0.8}px, 0)`,
            }}
          >
            <div className="fh-visual__glass-edge" />
          </div>
        )}
      </div>
    </div>
  );
}
