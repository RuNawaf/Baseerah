import { forwardRef } from 'react';

export const FailureNotice = forwardRef(function FailureNotice({ error, onRetry }, ref) {
  return (
    <section className="notice notice-failed" aria-labelledby="failed-title" ref={ref} tabIndex={-1}>
      <div className="notice-text">
        <h2 id="failed-title">The scan could not be completed</h2>
        <p>{error?.message ?? 'The scan stopped because of an unexpected error.'}</p>
        <p className="notice-detail">No report was created, because no pages could be checked.</p>
      </div>
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        Try again
      </button>
    </section>
  );
});
