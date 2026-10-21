import { useCallback, useEffect, useRef, useState } from 'react';
import { useCompletionAlert } from './completionAlert.js';
import { CompletionNotice } from './components/CompletionNotice.jsx';
import { FailureNotice } from './components/FailureNotice.jsx';
import { Masthead } from './components/Masthead.jsx';
import { Report } from './components/Report.jsx';
import { ScanForm } from './components/ScanForm.jsx';
import { ScanProgress } from './components/ScanProgress.jsx';
import { useScan } from './useScan.js';
import { validateUrl } from './validateUrl.js';

export default function App({ pollIntervalMs = 1000 }) {
  const { phase, inputError, scan, failure, announcement, submit, reset, clearInputError } = useScan({ pollIntervalMs });
  const [url, setUrl] = useState('');
  const [view, setView] = useState('scan');
  const inputRef = useRef(null);
  const reportHeadingRef = useRef(null);
  const noticeRef = useRef(null);

  const busy = phase === 'starting' || phase === 'scanning';
  const openReport = useCallback(() => setView('report'), []);
  const completionAlert = useCompletionAlert({ phase, scan, failure, onOpenReport: openReport });

  function handleSubmit() {
    // Ask while we still have the click: browsers ignore permission prompts that are not tied to a user action.
    if (!validateUrl(url).code) completionAlert.ask();
    submit(url);
  }

  useEffect(() => {
    if (inputError) inputRef.current?.focus();
  }, [inputError]);

  useEffect(() => {
    if (phase === 'done' || phase === 'failed') noticeRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (view === 'report') {
      window.scrollTo?.(0, 0);
      reportHeadingRef.current?.focus();
    }
  }, [view]);

  function startNewScan() {
    reset();
    setView('scan');
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Masthead />
      <main id="main" className="page" tabIndex={-1}>
        {/* Polite status messages for screen readers: scan started, finished, failed. */}
        <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>

        {view === 'report' && scan?.report ? (
          <Report scan={scan} headingRef={reportHeadingRef} onNewScan={startNewScan} />
        ) : (
          <>
            <section className="intro" aria-labelledby="intro-title">
              <h1 id="intro-title">Check a whole website for accessibility barriers</h1>
              <p className="lede">
                Enter the address of a public website. Baseerah follows its internal links, checks every page it finds
                with axe-core, and lists the problems page by page.
              </p>
              <ScanForm
                value={url}
                onChange={(value) => {
                  setUrl(value);
                  if (inputError) clearInputError();
                }}
                onSubmit={handleSubmit}
                error={inputError}
                busy={busy}
                phase={phase}
                inputRef={inputRef}
              />
            </section>

            {scan && phase !== 'idle' && phase !== 'failed' && <ScanProgress scan={scan} phase={phase} notifications={completionAlert.permission} />}

            {phase === 'done' && (
              <CompletionNotice ref={noticeRef} scan={scan} onViewReport={openReport} />
            )}
            {phase === 'failed' && <FailureNotice ref={noticeRef} error={failure} onRetry={handleSubmit} />}
          </>
        )}
      </main>
      <footer className="site-footer">
        <p>
          Baseerah is a SWE 444 project by Inclusive Minds, King Saud University. Checks are powered by{' '}
          <a href="https://github.com/dequelabs/axe-core">axe-core</a>; automated tools find some barriers, not all of them.
        </p>
      </footer>
    </>
  );
}
