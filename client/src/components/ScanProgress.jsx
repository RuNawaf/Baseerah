import { displayHost, plural } from '../format.js';
import { PageMap, PageMapLegend } from './PageMap.jsx';

const NOTIFY_HINT = {
  granted: 'You can switch to another tab. Baseerah will send a notification when the scan finishes.',
  default: 'You can switch to another tab. The tab title shows the progress and the result.',
  denied:
    'You can switch to another tab. The tab title shows the progress and the result. Notifications are blocked for this site in your browser settings.',
  unsupported: 'You can switch to another tab. The tab title shows the progress and the result.',
};

export function ScanProgress({ scan, phase, notifications = 'unsupported' }) {
  const { progress = {}, pages = [] } = scan;
  const done = (progress.succeeded ?? 0) + (progress.failed ?? 0) + (progress.skipped ?? 0);
  const total = Math.max(progress.discovered ?? 0, 1);
  const running = phase === 'scanning';

  return (
    <section className="panel progress" aria-labelledby="progress-title" aria-busy={running}>
      <header className="panel-head">
        <h2 id="progress-title">
          {running ? `Scanning ${displayHost(scan.url)}` : `Scanned ${displayHost(scan.url)}`}
        </h2>
        {running && <p className="meta">{NOTIFY_HINT[notifications] ?? NOTIFY_HINT.unsupported}</p>}
      </header>

      {running && !progress.discovered ? (
        <p className="progress-line">Opening the first page…</p>
      ) : (
        <>
          <label className="progress-line" htmlFor="crawl-progress">
            {plural(done, 'page')} of {progress.discovered} done
            {running && progress.queued > 0 ? `, ${progress.queued} waiting in the queue` : ''}
          </label>
          <progress id="crawl-progress" max={total} value={done} />
        </>
      )}

      <dl className="strip">
        <div>
          <dt>Found</dt>
          <dd data-testid="count-discovered">{progress.discovered ?? 0}</dd>
        </div>
        <div>
          <dt>In queue</dt>
          <dd data-testid="count-queued">{progress.queued ?? 0}</dd>
        </div>
        <div>
          <dt>Checked</dt>
          <dd data-testid="count-succeeded">{progress.succeeded ?? 0}</dd>
        </div>
        <div>
          <dt>Failed</dt>
          <dd data-testid="count-failed">{progress.failed ?? 0}</dd>
        </div>
        <div>
          <dt>Skipped</dt>
          <dd data-testid="count-skipped">{progress.skipped ?? 0}</dd>
        </div>
      </dl>

      {pages.length > 0 && (
        <div className="map-block">
          <PageMap pages={pages} />
          <PageMapLegend pages={pages} />
        </div>
      )}
    </section>
  );
}

