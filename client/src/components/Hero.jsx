import { ProductPreview } from './ProductPreview.jsx';
import { ScanForm } from './ScanForm.jsx';

export function Hero(props) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <a className="badge" href="#how">
          <span className="badge-tag">New</span>
          <span>Scans the whole website, not just one page</span>
          <svg className="arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
          </svg>
        </a>
        <h1 id="hero-title">Baseerah</h1>
        <p className="tagline">Accessibility checks for every page of your website.</p>
        <p className="hero-lede">
          Paste a link. Baseerah follows the site&rsquo;s own links, runs axe-core on each page and shows what blocks
          people who are blind or have low vision, page by page.
        </p>
        <ScanForm {...props} />
        <div className="hero-links">
          <a className="pill pill-outline" href="#how">
            How a scan works
            <svg className="arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M8 3v9M4.5 8.5 8 12l3.5-3.5" />
            </svg>
          </a>
        </div>
      </div>
      <ProductPreview />
    </section>
  );
}
