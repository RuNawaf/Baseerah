import { displayPath } from '../format.js';

export const PAGE_STATES = {
  queued: { label: 'Waiting', glyph: '' },
  scanning: { label: 'Checking now', glyph: '' },
  succeeded: { label: 'Checked', glyph: '' },
  failed: { label: 'Could not be scanned', glyph: '!' },
  skipped: { label: 'Skipped', glyph: '–' },
};

function tileText(page) {
  if (page.status === 'succeeded') return page.issueCount > 99 ? '99+' : String(page.issueCount);
  return PAGE_STATES[page.status]?.glyph ?? '';
}

function tileLabel(page) {
  const state = PAGE_STATES[page.status]?.label ?? page.status;
  const issues = page.status === 'succeeded' ? `, ${page.issueCount} ${page.issueCount === 1 ? 'issue' : 'issues'}` : '';
  return `${displayPath(page.url)}: ${state}${issues}`;
}

/** One page-shaped tile per discovered page; it fills in as the crawler reaches it. */
export function PageMap({ pages }) {
  return (
    <ol className="page-map" aria-label="Pages found on the website">
      {pages.map((page) => (
        <li key={page.url} className={`tile tile-${page.status}`} title={tileLabel(page)}>
          <span className="visually-hidden">{tileLabel(page)}</span>
          <span className="tile-text" aria-hidden="true">
            {tileText(page)}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PageMapLegend() {
  return (
    <ul className="legend" aria-label="Legend">
      <li>
        <span className="tile tile-mini tile-queued" aria-hidden="true" /> Waiting
      </li>
      <li>
        <span className="tile tile-mini tile-scanning" aria-hidden="true" /> Checking now
      </li>
      <li>
        <span className="tile tile-mini tile-succeeded" aria-hidden="true">
          <span className="tile-text">3</span>
        </span>{' '}
        Checked, with issue count
      </li>
      <li>
        <span className="tile tile-mini tile-failed" aria-hidden="true">
          <span className="tile-text">!</span>
        </span>{' '}
        Could not be scanned
      </li>
    </ul>
  );
}
