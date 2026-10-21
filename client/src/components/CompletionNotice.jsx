import { forwardRef } from 'react';
import { plural } from '../format.js';

export const CompletionNotice = forwardRef(function CompletionNotice({ scan, onViewReport }, ref) {
  const { totals, limitsReached } = scan.report;
  const withErrors = scan.status === 'completed_with_errors';

  return (
    <section className="notice notice-done" aria-labelledby="done-title" ref={ref} tabIndex={-1}>
      <h2 id="done-title">Scan complete</h2>
      <p>
        {plural(totals.succeededPages, 'page')} checked and {plural(totals.issues, 'accessibility issue')} found.
        {withErrors && ` ${plural(totals.failedPages, 'page')} could not be scanned.`}
      </p>
      {limitsReached.length > 0 && <p className="notice-warning">Stopped early: {limitsReached[0].message}</p>}
      <button type="button" className="button-primary" onClick={onViewReport}>
        View report
      </button>
    </section>
  );
});
