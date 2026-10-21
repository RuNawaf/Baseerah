export function BaseerahMark({ size = 40 }) {
  return (
    <svg className="mark" width={size} height={size / 2} viewBox="0 0 48 24" aria-hidden="true" focusable="false">
      <path d="M11 4 3 12l8 8M37 4l8 8-8 8" fill="none" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="12" r="7.5" />
      <circle cx="24" cy="12" r="2.6" className="pupil" />
    </svg>
  );
}

export function Masthead() {
  return (
    <header className="masthead">
      <div className="masthead-inner">
        <a className="brand" href="/" aria-label="Baseerah home">
          <BaseerahMark />
          <span className="brand-name">Baseerah</span>
          <span className="brand-name-ar" lang="ar" dir="rtl">
            بصيرة
          </span>
        </a>
      </div>
    </header>
  );
}
