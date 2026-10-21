import { PageTile } from './PageMap.jsx';

// An eye chart, the subject's own object, drawn as a faint background picture behind the product.
const CHART = ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P'];
const CHART_SVG = (() => {
  let y = 0;
  const lines = CHART.map((letters, index) => {
    const size = Math.round(200 * 0.68 ** index);
    y += size * 1.12;
    return `<text x="300" y="${Math.round(y)}" font-size="${size}" letter-spacing="${Math.round(size * 0.12)}">${letters}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ${Math.round(y + 20)}"><g fill="#012866" font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="middle">${lines}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

// A real report from the bundled demo website (server/test/fixtures/site), drawn with the app's own parts.
const DEMO_TILES = ['critical', 'critical', 'critical', 'critical', 'clean', 'skipped', 'failed', 'clean', 'clean', 'clean'];
const DEMO_TEXT = ['2', '1', '1', '1', '0', '–', '!', '0', '0', '0'];

export function ProductPreview() {
  return (
    <div className="preview" aria-hidden="true">
      <div className="eye-chart" style={{ backgroundImage: CHART_SVG }} />

      <div className="preview-card preview-back" data-ui>
        <div className="pc-bar">
          <span className="pc-host">bakery.example</span>
          <span className="pc-dim">Scanning 6 of 10</span>
        </div>
        <div className="pc-progress">
          <span style={{ width: '60%' }} />
        </div>
        <div className="pc-tiles">
          {DEMO_TILES.map((kind, index) => (
            <PageTile key={index} kind={index < 6 ? kind : index === 6 ? 'scanning' : 'queued'} text={index < 6 ? DEMO_TEXT[index] : ''} />
          ))}
        </div>
      </div>

      <div className="preview-card preview-front" data-ui>
        <div className="pc-bar">
          <span className="pc-host">bakery.example</span>
          <span className="pc-pill">Report</span>
        </div>
        <p className="pc-fix">
          <strong>Fix first:</strong> Form elements must have labels.
        </p>
        <div className="pc-grid">
          <div>
            <p className="pc-label">Issues</p>
            <p className="pc-figure">5</p>
            <div className="pc-sev">
              <span className="sev-critical" style={{ flexGrow: 4 }} />
              <span className="sev-serious" style={{ flexGrow: 1 }} />
            </div>
            <p className="pc-dim">4 critical, 1 serious</p>
          </div>
          <div>
            <p className="pc-label">Pages</p>
            <div className="pc-tiles">
              {DEMO_TILES.map((kind, index) => (
                <PageTile key={index} kind={kind} text={DEMO_TEXT[index]} />
              ))}
            </div>
            <p className="pc-dim">8 scanned, 1 failed, 1 skipped</p>
          </div>
        </div>
        <ul className="pc-rows">
          <li>
            <span>/</span>
            <span>2</span>
          </li>
          <li>
            <span>/about.html</span>
            <span>1</span>
          </li>
          <li>
            <span>/contact/</span>
            <span>1</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
