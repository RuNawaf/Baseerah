/** What a scan will do, with the server's real limits. */
export function ScanAbout({ limits }) {
  return (
    <section className="panel about" aria-labelledby="about-title">
      <h2 id="about-title">What a scan does</h2>
      <dl className="kv">
        <div>
          <dt>Pages</dt>
          <dd>{limits ? `Up to ${limits.maxPages} on the same website` : 'Every page on the same website'}</dd>
        </div>
        <div>
          <dt>Depth</dt>
          <dd>{limits ? `${limits.maxDepth} links from the start page` : 'Follows internal links'}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>
            {limits
              ? `${Math.round(limits.pageTimeoutMs / 1000)} s per page, ${limits.concurrency} pages at a time`
              : 'A few seconds per page'}
          </dd>
        </div>
        <div>
          <dt>Checks</dt>
          <dd>axe-core rules for WCAG 2 A and AA, plus best practices</dd>
        </div>
        <div>
          <dt>Never</dt>
          <dd>Submits forms, clicks buttons or signs in</dd>
        </div>
      </dl>
    </section>
  );
}
