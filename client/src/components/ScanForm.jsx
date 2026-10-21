export function ScanForm({ value, onChange, onSubmit, error, busy, phase, inputRef }) {
  const describedBy = ['url-hint', error ? 'url-error' : null].filter(Boolean).join(' ');

  return (
    <form
      className="scan-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy) onSubmit();
      }}
    >
      <label htmlFor="url" className="field-label">
        Website URL
      </label>
      <p id="url-hint" className="field-hint">
        The start page of a public website, for example https://www.ksu.edu.sa.
      </p>
      <div className={`field-row${error ? ' has-error' : ''}`}>
        <input
          ref={inputRef}
          id="url"
          name="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck="false"
          placeholder="https://"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          readOnly={busy}
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {phase === 'starting' ? 'Checking address…' : phase === 'scanning' ? 'Scanning…' : 'Scan website'}
        </button>
      </div>
      {error && (
        <p id="url-error" className="field-error" role="alert">
          <svg className="field-error-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M8 1.5 15 14H1z" />
            <path d="M8 6v3.6M8 11.4v.1" className="stroke" />
          </svg>
          {error.message}
        </p>
      )}
    </form>
  );
}
