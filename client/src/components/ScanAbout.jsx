import { PageTile } from './PageMap.jsx';

/** How a scan works: its three stages with a piece of the real interface each, then the server's real limits. */
export function ScanAbout({ limits }) {
  const facts = [
    { figure: limits ? limits.maxPages : 50, unit: 'pages', text: 'on the same website, found through its own links' },
    { figure: limits ? limits.maxDepth : 5, unit: 'links deep', text: 'from the page you start on' },
    {
      figure: limits ? Math.round(limits.pageTimeoutMs / 1000) : 15,
      unit: 's per page',
      text: `with ${limits ? limits.concurrency : 3} pages checked at a time`,
    },
    { figure: 0, unit: 'forms sent', text: 'it never clicks, submits or signs in' },
  ];

  return (
    <section className="facts reveal" id="how" aria-labelledby="about-title">
      <h2 id="about-title">What a scan does</h2>
      <p className="facts-lede">
        Baseerah opens each page in Chrome, runs the axe-core rules for WCAG 2 A and AA plus best practices, and records
        every element that fails.
      </p>

      <ol className="stages">
        <li className="stage">
          <h3>It follows the site&rsquo;s links</h3>
          <p>Every internal page it can reach joins the queue once. Other websites, files and email links are left alone.</p>
          <div className="fragment" data-ui aria-hidden="true">
            {[
              ['/', 'critical', '2'],
              ['/about.html', 'critical', '1'],
              ['/about.html?a=1&b=2', 'critical', '1'],
              ['/missing.html', 'failed', '!'],
              ['/contact/', 'scanning', ''],
              ['/deep/1.html', 'queued', ''],
            ].map(([path, kind, text]) => (
              <div className="frag-row" key={path}>
                <PageTile kind={kind} small text={text} />
                <span>{path}</span>
                <span className="frag-dim">
                  {{ scanning: 'Checking', queued: 'Waiting', failed: 'HTTP 404' }[kind] ?? 'Checked'}
                </span>
              </div>
            ))}
          </div>
        </li>
        <li className="stage">
          <h3>It checks every element</h3>
          <p>Each page is loaded like a visitor would see it, then each failing element is recorded with its code.</p>
          <div className="fragment" data-ui aria-hidden="true">
            <div className="frag-head">
              <strong>Images must have alternative text</strong>
              <span className="frag-impact">
                <span className="impact-meter">
                  <span className="on sev-critical" />
                  <span className="on sev-critical" />
                  <span className="on sev-critical" />
                  <span className="on sev-critical" />
                </span>
                Critical
              </span>
            </div>
            <code className="frag-code">&lt;img src=&quot;img/logo.png&quot; width=&quot;64&quot;&gt;</code>
            <p className="frag-dim">Blind visitors hear nothing for this image.</p>
            <p className="frag-line">
              <strong>Fix:</strong> describe the image in an <code>alt</code> attribute, or mark it as decorative with{' '}
              <code>alt=&quot;&quot;</code>.
            </p>
            <p className="frag-dim">WCAG 1.1.1, found on 1 page.</p>
          </div>
        </li>
        <li className="stage">
          <h3>It tells you what to fix first</h3>
          <p>The report adds up the issues by severity and puts the rule that matters most at the top.</p>
          <div className="fragment" data-ui aria-hidden="true">
            <p className="frag-fix">
              <strong>Fix first:</strong> Form elements must have labels.
            </p>
            <div className="frag-sev">
              <span className="sev-critical" style={{ flexGrow: 4 }} />
              <span className="sev-serious" style={{ flexGrow: 1 }} />
            </div>
            <div className="frag-row frag-split">
              <span>Critical</span>
              <strong>4</strong>
            </div>
            <div className="frag-row frag-split">
              <span>Serious</span>
              <strong>1</strong>
            </div>
            <div className="frag-row frag-split is-zero">
              <span>Moderate</span>
              <strong>0</strong>
            </div>
            <div className="frag-row frag-split is-zero">
              <span>Minor</span>
              <strong>0</strong>
            </div>
          </div>
        </li>
      </ol>

      <dl className="facts-row">
        {facts.map((fact) => (
          <div key={fact.unit}>
            <dt>
              <span className="fact-figure">{fact.figure}</span> {fact.unit}
            </dt>
            <dd>{fact.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
