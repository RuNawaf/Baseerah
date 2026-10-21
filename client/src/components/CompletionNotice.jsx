import { forwardRef } from 'react';
import { plural } from '../format.js';

export const CompletionNotice = forwardRef(function CompletionNotice({ scan, onViewReport }, ref) {
  const { totals, limitsReached } = scan.report;

  return (
    <section className="notice notice-done" aria-labelledby="done-title" ref={ref} tabIndex={-1}>
      <div className="notice-text">
        <h2 id="done-title">Scan complete</h2>
        <p>
          {plural(totals.succeededPages, 'page')} checked and {plural(totals.issues, 'accessibility issue')} found.
          {totals.failedPages > 0 && ` ${plural(totals.failedPages, 'page')} could not be scanned.`}
        </p>
        {limitsReached.length > 0 && <p className="notice-warning">Stopped early: {limitsReached[0].message}</p>}
      </div>
      <button type="button" className="btn btn-primary" onClick={onViewReport}>
        View report
      </button>
    </section>
  );
});
