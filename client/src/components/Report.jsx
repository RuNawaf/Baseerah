import { useMemo, useRef } from 'react';
import { displayHost, displayPath, formatDuration, formatTime, plural } from '../format.js';
import { IMPACT_LABEL, IMPACTS, summarizeReport } from '../reportData.js';
import { PageMap, PageMapLegend, PageTile, tileKind } from './PageMap.jsx';

const MAX_RULES = 5;

function Impact({ impact }) {
  const level = 4 - IMPACTS.indexOf(impact);
  return (
    <span className="impact">
      <span className="impact-meter" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={n <= level ? `on sev-${impact}` : ''} />
        ))}
      </span>
      {IMPACT_LABEL[impact] ?? impact}
    </span>
  );
}

/** A 100% bar of the issues by severity, with the legend as a table that carries the figures. */
function SeverityBreakdown({ byImpact, total }) {
  return (
    <>
      <div className="sev-bar" aria-hidden="true">
        {total > 0 ? (
          IMPACTS.filter((impact) => byImpact[impact] > 0).map((impact) => (
            <span key={impact} className={`sev-${impact}`} style={{ flexGrow: byImpact[impact] }} />
          ))
        ) : (
          <span className="sev-none" />
        )}
      </div>
      <table className="sev-table">
        <caption className="visually-hidden">Issues by severity</caption>
        <thead className="visually-hidden">
          <tr>
            <th scope="col">Severity</th>
            <th scope="col">Issues</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {IMPACTS.map((impact) => (
            <tr key={impact} className={byImpact[impact] === 0 ? 'is-zero' : ''}>
              <th scope="row">
                <span className={`swatch sev-${impact}`} aria-hidden="true" />
                {IMPACT_LABEL[impact]}
              </th>
              <td className="num" data-testid={`sev-${impact}`}>
                {byImpact[impact]}
              </td>
              <td className="num share">{total ? `${Math.round((byImpact[impact] / total) * 100)}%` : '–'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td className="num">{total}</td>
            <td className="num share">{total ? '100%' : '–'}</td>
          </tr>
        </tfoot>
      </table>
    </>
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
        How to fix it, on Deque University<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    </li>
  );
}

function SeverityCells({ counts }) {
  return IMPACTS.map((impact) => (
    <span key={impact} className={`cell num${counts && counts[impact] === 0 ? ' is-zero' : ''}`}>
      {counts ? counts[impact] : '–'}
      <span className="visually-hidden"> {IMPACT_LABEL[impact].toLowerCase()}</span>
    </span>
  ));
}

function severityText(counts) {
  const parts = IMPACTS.filter((impact) => counts[impact] > 0).map((impact) => `${counts[impact]} ${impact}`);
  return parts.length ? parts.join(', ') : 'No issues';
}

export function Report({ scan, headingRef, onNewScan, onScanAgain }) {
  const { report } = scan;
  const summary = useMemo(() => summarizeReport(report), [report]);
  const rowRefs = useRef(new Map());
  const host = displayHost(report.url);
  const { topRule, counts } = summary;

  function showPage(page) {
    const row = rowRefs.current.get(page.url);
    if (!row) return;
    if (row.tagName === 'DETAILS') row.open = true;
    row.scrollIntoView({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    row.querySelector('summary, .row-main')?.focus();
  }

  return (
    <article className="report" aria-labelledby="report-title">
      <div className="title-row">
        <div>
          <h1 id="report-title" ref={headingRef} tabIndex={-1}>
            <span className="visually-hidden">Accessibility report for</span> {host}
          </h1>
          <p className="sub">
            <a href={report.url} target="_blank" rel="noopener noreferrer" className="url">
              {report.url}
            </a>
            <span className="stamp">
              Started {formatTime(report.startedAt)}, finished {formatTime(report.finishedAt)} (
              {formatDuration(report.startedAt, report.finishedAt)})
            </span>
          </p>
        </div>
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={onNewScan}>
            Scan another website
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onScanAgain(report.url)}>
            Scan again
          </button>
        </div>
      </div>

      <p className="finding">
        {topRule ? (
          <>
            <strong>Fix first:</strong> {topRule.help}. {IMPACT_LABEL[topRule.impact]}, {plural(topRule.elements, 'element')} on{' '}
            {plural(topRule.pages, 'page')}.
          </>
        ) : (
          <>axe-core found no issues on the {plural(counts.scanned, 'scanned page')}. Automated checks find some barriers, not all, so test by hand too.</>
        )}
      </p>

      {report.limitsReached.map((limit) => (
        <p key={limit.type} className="notice-warning">
          <strong>Partial scan.</strong> {limit.message}
        </p>
      ))}

      <div className="grid overview">
        <section className="panel" aria-labelledby="issues-title">
          <header className="panel-head">
            <h2 id="issues-title">Issues</h2>
            <p className="meta">Affected elements</p>
          </header>
          <p className="answer">
            <span className="answer-figure num" data-testid="total-issues">
              {summary.issues}
            </span>{' '}
            <span className="answer-unit">{summary.issues === 1 ? 'issue' : 'issues'}</span>
          </p>
          <p className="answer-sub">
            On {summary.pagesWithIssues} of {plural(counts.scanned, 'scanned page')}
          </p>
          <SeverityBreakdown byImpact={summary.byImpact} total={summary.issues} />
        </section>

        <section className="panel" aria-labelledby="rules-title">
          <header className="panel-head">
            <h2 id="rules-title">Rules broken</h2>
            <p className="meta">{plural(summary.rules.length, 'rule')}</p>
          </header>
          {summary.rules.length === 0 ? (
            <p className="empty-line">No axe-core rule failed on the scanned pages.</p>
          ) : (
            <ol className="rule-list">
              {summary.rules.slice(0, MAX_RULES).map((rule, index) => (
                <li key={rule.id}>
                  <div className="rule-line">
                    <span className="rule-name">{rule.help}</span>
                    <span className="num rule-value">{rule.elements}</span>
                  </div>
                  <div className="rule-bar" aria-hidden="true">
                    <span
                      className={index === 0 ? 'lead' : ''}
                      style={{ width: `${Math.max(4, (rule.elements / summary.rules[0].elements) * 88)}%` }}
                    />
                  </div>
                  <p className="rule-meta">
                    {IMPACT_LABEL[rule.impact]}, on {plural(rule.pages, 'page')}
                  </p>
                </li>
              ))}
            </ol>
          )}
          {summary.rules.length > MAX_RULES && (
            <p className="rule-more">{summary.rules.length - MAX_RULES} more in the page list below.</p>
          )}
        </section>

        <section className="panel" aria-labelledby="map-title">
          <header className="panel-head">
            <h2 id="map-title">Pages</h2>
            <p className="meta">Select a page to open it</p>
          </header>
          <PageMap pages={report.pages} label="Pages on the website" onSelect={showPage} />
          <PageMapLegend pages={report.pages} />
          <dl className="kv tally">
            <div>
              <dt>Found</dt>
              <dd className="num" data-testid="total-discovered">
                {counts.found}
              </dd>
            </div>
            <div>
              <dt>Scanned</dt>
              <dd className="num" data-testid="total-succeeded">
                {counts.scanned}
              </dd>
            </div>
            <div>
              <dt>Could not be scanned</dt>
              <dd className="num" data-testid="total-failed">
                {counts.failed}
              </dd>
            </div>
            <div>
              <dt>Skipped</dt>
              <dd className="num" data-testid="total-skipped">
                {counts.skipped}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="panel pages" aria-labelledby="pages-title">
        <header className="panel-head">
          <h2 id="pages-title">Page by page</h2>
          <p className="meta">Most severe first. Open a page to see each issue and the elements involved.</p>
        </header>

        <div className="page-grid page-grid-head" aria-hidden="true">
          <span className="cell-page">Page</span>
          {IMPACTS.map((impact) => (
            <span key={impact} className="cell num">
              {IMPACT_LABEL[impact]}
            </span>
          ))}
          <span className="cell num">Issues</span>
        </div>

        <ul className="page-rows">
          {summary.pages.map((page) => (
            <li key={page.url}>
              <details ref={(node) => (node ? rowRefs.current.set(page.url, node) : rowRefs.current.delete(page.url))}>
                <summary className="page-grid">
                  <span className="cell-page">
                    <PageTile kind={tileKind(page)} small />
                    <span className="page-lines">
                      <span className="page-path">{displayPath(page.url)}</span>
                      <span className="sev-inline" aria-hidden="true">
                        {severityText(page.counts)}
                      </span>
                    </span>
                  </span>
                  <SeverityCells counts={page.counts} />
                  <span className={`cell num total${page.issueCount === 0 ? ' is-clean' : ''}`}>
                    {page.issueCount === 0 ? 'None' : page.issueCount}
                    <span className="visually-hidden">{page.issueCount === 1 ? ' issue' : ' issues'}</span>
                  </span>
                </summary>
                <div className="page-body">
                  <p className="page-link">
                    <a href={page.finalUrl} target="_blank" rel="noopener noreferrer">
                      Open {displayPath(page.url)}
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
          ))}

          {[...summary.failed, ...summary.skipped].map((page) => (
            <li key={page.url}>
              <div
                className={`page-grid row-${page.status}`}
                ref={(node) => (node ? rowRefs.current.set(page.url, node) : rowRefs.current.delete(page.url))}
              >
                <span className="cell-page row-main" tabIndex={-1}>
                  <PageTile kind={tileKind(page)} small text={page.status === 'failed' ? '!' : '–'} />
                  <span>
                    <span className="page-path">{displayPath(page.url)}</span>
                    <span className="row-reason">
                      {page.status === 'failed'
                        ? `Could not be scanned. ${page.error?.message ?? ''}`
                        : `Skipped. ${page.note ?? ''}`}
                    </span>
                  </span>
                </span>
                <SeverityCells counts={null} />
                <span className="cell num">–</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
