import { displayHost, displayPath, formatDuration, formatTime, plural } from '../format.js';

const IMPACT_LEVEL = { critical: 4, serious: 3, moderate: 2, minor: 1 };

function Impact({ impact }) {
  const level = IMPACT_LEVEL[impact] ?? 0;
  return (
    <span className={`impact impact-${impact}`}>
      <span className="impact-meter" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={n <= level ? 'on' : ''} />
        ))}
      </span>
      {impact.charAt(0).toUpperCase() + impact.slice(1)}
    </span>
  );
}

function Violation({ violation }) {
  return (
    <li className="violation">
      <div className="violation-head">
        <h4>{violation.help}</h4>
        <Impact impact={violation.impact} />
      </div>
      <p className="violation-meta">
        {plural(violation.nodeCount, 'element')} affected. Rule <code>{violation.id}</code>
        {violation.wcag.length > 0 && <>, WCAG tags {violation.wcag.join(', ')}</>}.
      </p>
      <p>{violation.description}</p>
      <ul className="nodes">
        {violation.nodes.map((node, index) => (
          <li key={`${node.target}-${index}`}>
            <code className="node-target">{node.target}</code>
            <pre className="node-html">
              <code>{node.html}</code>
            </pre>
          </li>
        ))}
      </ul>
      {violation.nodeCount > violation.nodes.length && (
        <p className="violation-more">
          Showing {violation.nodes.length} of {violation.nodeCount} elements.
        </p>
      )}
      <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer">
        Learn about this rule on Deque University<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    </li>
  );
}

function CheckedPage({ page }) {
  const path = displayPath(page.url);
  return (
    <li className="page-result">
      <details>
        <summary>
          <span className="page-path">{path}</span>
          <span className={`issue-count${page.issueCount === 0 ? ' is-zero' : ''}`}>
            {page.issueCount === 0 ? 'No issues found' : plural(page.issueCount, 'issue')}
          </span>
        </summary>
        <div className="page-body">
          <p className="page-link">
            <a href={page.finalUrl} target="_blank" rel="noopener noreferrer">
              Open {path}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </p>
          {page.violations.length === 0 ? (
            <p>axe-core found no issues on this page. Automated checks cannot catch every barrier, so test it by hand too.</p>
          ) : (
            <ul className="violations">
              {page.violations.map((violation) => (
                <Violation key={violation.id} violation={violation} />
              ))}
            </ul>
          )}
        </div>
      </details>
    </li>
  );
}

export function Report({ scan, headingRef, onNewScan }) {
  const { report } = scan;
  const { totals } = report;
  const checked = report.pages.filter((p) => p.status === 'succeeded').sort((a, b) => b.issueCount - a.issueCount);
  const failed = report.pages.filter((p) => p.status === 'failed');
  const skipped = report.pages.filter((p) => p.status === 'skipped');

  return (
    <article className="report" aria-labelledby="report-title">
      <header className="report-head">
        <h1 id="report-title" ref={headingRef} tabIndex={-1}>
          Accessibility report for {displayHost(report.url)}
        </h1>
        <button type="button" className="button-secondary" onClick={onNewScan}>
          Scan another website
        </button>
      </header>

      <p className="report-summary">
        Baseerah checked {plural(totals.succeededPages, 'page')} and found{' '}
        <strong>{plural(totals.issues, 'accessibility issue')}</strong>.
        {totals.failedPages > 0 && ` ${plural(totals.failedPages, 'page')} could not be scanned.`}
      </p>

      {report.limitsReached.map((limit) => (
        <p key={limit.type} className="report-warning">
          <strong>Partial scan.</strong> {limit.message}
        </p>
      ))}

      <dl className="report-facts">
        <div className="fact-wide">
          <dt>Website</dt>
          <dd>
            <a href={report.url} target="_blank" rel="noopener noreferrer" className="mono">
              {report.url}
            </a>
          </dd>
        </div>
        <div className="fact-half">
          <dt>Started</dt>
          <dd>{formatTime(report.startedAt)}</dd>
        </div>
        <div className="fact-half">
          <dt>Finished</dt>
          <dd>
            {formatTime(report.finishedAt)} ({formatDuration(report.startedAt, report.finishedAt)})
          </dd>
        </div>
        <div>
          <dt>Pages found</dt>
          <dd data-testid="total-discovered">{totals.discoveredPages}</dd>
        </div>
        <div>
          <dt>Scanned successfully</dt>
          <dd data-testid="total-succeeded">{totals.succeededPages}</dd>
        </div>
        <div>
          <dt>Failed</dt>
          <dd data-testid="total-failed">{totals.failedPages}</dd>
        </div>
        <div>
          <dt>Accessibility issues</dt>
          <dd data-testid="total-issues">{totals.issues}</dd>
        </div>
      </dl>

      <section aria-labelledby="checked-title" className="report-section">
        <h2 id="checked-title">Scanned pages ({checked.length})</h2>
        <p className="section-hint">Sorted by number of issues. Open a page to see each issue and the elements involved.</p>
        {checked.length === 0 ? (
          <p>No pages could be checked.</p>
        ) : (
          <ul className="page-results">
            {checked.map((page) => (
              <CheckedPage key={page.url} page={page} />
            ))}
          </ul>
        )}
      </section>

      {failed.length > 0 && (
        <section aria-labelledby="failed-pages-title" className="report-section">
          <h2 id="failed-pages-title">Pages that could not be scanned ({failed.length})</h2>
          <ul className="failed-pages">
            {failed.map((page) => (
              <li key={page.url}>
                <span className="failed-mark" aria-hidden="true">
                  !
                </span>
                <div>
                  <span className="page-path">{displayPath(page.url)}</span>
                  <p>{page.error?.message ?? 'Unknown error.'}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {skipped.length > 0 && (
        <section aria-labelledby="skipped-title" className="report-section">
          <h2 id="skipped-title">Skipped ({skipped.length})</h2>
          <ul className="skipped-pages">
            {skipped.map((page) => (
              <li key={page.url}>
                <span className="page-path">{displayPath(page.url)}</span> {page.note}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
