import { displayPath, plural } from '../format.js';
import { IMPACT_LABEL } from '../reportData.js';

// One page of the website is drawn as a sheet of paper with a folded corner. Its fill says how it went:
// navy steps for the worst issue on the page, red for a page that could not be scanned.
const KINDS = {
  queued: { legend: 'Waiting' },
  scanning: { legend: 'Checking now' },
  critical: { legend: 'Worst issue critical' },
  serious: { legend: 'Worst issue serious' },
  moderate: { legend: 'Worst issue moderate' },
  minor: { legend: 'Worst issue minor' },
  clean: { legend: 'No issues found' },
  failed: { legend: 'Could not be scanned' },
  skipped: { legend: 'Skipped' },
};
const KIND_ORDER = Object.keys(KINDS);

export function tileKind(page) {
  if (page.status === 'succeeded') return page.worstImpact ?? (page.issueCount > 0 ? 'minor' : 'clean');
  return KINDS[page.status] ? page.status : 'queued';
}

function tileText(page, kind) {
  if (page.status === 'succeeded') return page.issueCount > 99 ? '99+' : String(page.issueCount);
  if (kind === 'failed') return '!';
  if (kind === 'skipped') return '–';
  return '';
}

export function tileLabel(page) {
  const path = displayPath(page.url);
  switch (page.status) {
    case 'succeeded':
      // The visible number is part of the name (WCAG 2.5.3), so voice users can say what they see.
      return page.issueCount === 0
        ? `${path}: checked, 0 issues`
        : `${path}: checked, ${plural(page.issueCount, 'issue')}, worst ${IMPACT_LABEL[page.worstImpact]?.toLowerCase() ?? 'minor'}`;
    case 'failed':
      return `${path}: could not be scanned`;
    case 'skipped':
      return `${path}: skipped`;
    case 'scanning':
      return `${path}: checking now`;
    default:
      return `${path}: waiting`;
  }
}

export function PageTile({ kind, text = '', small = false }) {
  return (
    <svg className={`tile tile-${kind}${small ? ' tile-small' : ''}`} viewBox="0 0 26 34" aria-hidden="true" focusable="false">
      <path className="tile-sheet" d="M1 1h17l7 7v25H1z" />
      <path className="tile-fold" d="M18 1v7h7" />
      {kind === 'scanning' && <rect className="tile-scan" x="4" y="6" width="18" height="2" />}
      {text && (
        <text x="13" y="23" textAnchor="middle">
          {text}
        </text>
      )}
    </svg>
  );
}

/**
 * The site's pages as tiles in crawl order. With `onSelect`, each tile is a button that jumps to the page's row.
 */
export function PageMap({ pages, label = 'Pages found on the website', onSelect }) {
  return (
    <ol className="page-map" aria-label={label}>
      {pages.map((page) => {
        const kind = tileKind(page);
        const description = tileLabel(page);
        return (
          <li key={page.url} title={description}>
            {onSelect ? (
              <button type="button" className="tile-button" onClick={() => onSelect(page)} aria-label={description}>
                <PageTile kind={kind} text={tileText(page, kind)} />
              </button>
            ) : (
              <>
                <PageTile kind={kind} text={tileText(page, kind)} />
                <span className="visually-hidden">{description}</span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Lists only the kinds that are on screen (or the given kinds), each with its own tile as the swatch. */
export function PageMapLegend({ pages = [], kinds: only }) {
  const present = new Set(only ?? pages.map(tileKind));
  const kinds = KIND_ORDER.filter((kind) => present.has(kind));
  return (
    <ul className="legend" aria-label="Key">
      {kinds.map((kind) => (
        <li key={kind}>
          <PageTile kind={kind} small text={kind === 'failed' ? '!' : kind === 'skipped' ? '–' : ''} />
          {KINDS[kind].legend}
        </li>
      ))}
    </ul>
  );
}
