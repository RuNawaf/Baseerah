import { displayHost, plural } from '../format.js';
import { PageMap, PageMapLegend } from './PageMap.jsx';

export function ScanProgress({ scan, phase }) {
  const { progress = {}, pages = [] } = scan;
  const done = (progress.succeeded ?? 0) + (progress.failed ?? 0) + (progress.skipped ?? 0);
  const total = Math.max(progress.discovered ?? 0, 1);
  const running = phase === 'scanning';

  return (
    <section className="progress" aria-labelledby="progress-title" aria-busy={running}>
      <h2 id="progress-title">
        {running ? `Scanning ${displayHost(scan.url)}` : `Scanned ${displayHost(scan.url)}`}
      </h2>

      {running && progress.discovered === 0 ? (
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

      <dl className="counts">
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
      </dl>

      {pages.length > 0 && (
        <>
          <PageMap pages={pages} />
          <PageMapLegend />
        </>
      )}
    </section>
  );
}
