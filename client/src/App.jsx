import { useCallback, useEffect, useRef, useState } from 'react';
import { getHealth } from './api.js';
import { useCompletionAlert } from './completionAlert.js';
import { CompletionNotice } from './components/CompletionNotice.jsx';
import { FailureNotice } from './components/FailureNotice.jsx';
import { Masthead } from './components/Masthead.jsx';
import { Report } from './components/Report.jsx';
import { ScanAbout } from './components/ScanAbout.jsx';
import { ScanForm } from './components/ScanForm.jsx';
import { ScanProgress, ScanProgressEmpty } from './components/ScanProgress.jsx';
import { useScan } from './useScan.js';
import { validateUrl } from './validateUrl.js';

const REPORT_HASH = /^#\/report\/([0-9a-f-]{36})$/i;

function reportIdFromHash() {
  return window.location.hash.match(REPORT_HASH)?.[1] ?? null;
}

export default function App({ pollIntervalMs = 1000 }) {
  const { phase, inputError, scan, failure, announcement, submit, resume, reset, clearInputError } = useScan({
    pollIntervalMs,
  });
  const [url, setUrl] = useState('');
  const [view, setView] = useState('scan');
  const [limits, setLimits] = useState(null);
  const inputRef = useRef(null);
  const reportHeadingRef = useRef(null);
  const noticeRef = useRef(null);
  const scanIdRef = useRef(null);
  scanIdRef.current = scan?.scanId ?? null;

  const busy = phase === 'starting' || phase === 'scanning';

  // The report has its own address (#/report/<id>), so it survives a reload and can be shared while the scan is kept.
  const openReport = useCallback(() => {
    if (scanIdRef.current) window.location.hash = `#/report/${scanIdRef.current}`;
    setView('report');
  }, []);
  const completionAlert = useCompletionAlert({ phase, scan, failure, onOpenReport: openReport });

  useEffect(() => {
    getHealth()
      .then((health) => setLimits(health.limits ?? null))
      .catch(() => setLimits(null));

    const id = reportIdFromHash();
    if (id) {
      resume(id).then((latest) => {
        if (latest?.report) setView('report');
      });
    }

    const onHashChange = () => {
      if (!reportIdFromHash()) setView('scan');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [resume]);

  useEffect(() => {
    if (inputError) inputRef.current?.focus();
  }, [inputError]);

  useEffect(() => {
    if (view === 'scan' && (phase === 'done' || phase === 'failed')) noticeRef.current?.focus();
  }, [phase, view]);

  useEffect(() => {
    if (view === 'report') {
      window.scrollTo?.(0, 0);
      reportHeadingRef.current?.focus();
    }
  }, [view]);

  function scanUrl(target) {
    // Ask while we still have the click: browsers ignore permission prompts that are not tied to a user action.
    if (!validateUrl(target).code) completionAlert.ask();
    submit(target);
  }

  function leaveReport() {
    if (reportIdFromHash()) window.history.pushState(null, '', window.location.pathname + window.location.search);
    setView('scan');
  }

  function startNewScan() {
    leaveReport();
    reset();
    setUrl('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function scanAgain(target) {
    leaveReport();
    setUrl(target);
    scanUrl(target);
  }

  return (
    <div className="frame">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Masthead onHome={startNewScan} />
      <main id="main" className="sheet" tabIndex={-1}>
        {/* Polite status messages for screen readers: scan started, finished, failed. */}
        <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>

        {view === 'report' && scan?.report ? (
          <Report scan={scan} headingRef={reportHeadingRef} onNewScan={startNewScan} onScanAgain={scanAgain} />
        ) : (
          <>
            <div className="title-row">
              <div>
                <h1 id="scan-title">Scan a website</h1>
                <p className="sub">
                  Baseerah follows a website&rsquo;s internal links, checks every page with axe-core and lists the barriers
                  page by page.
                </p>
              </div>
            </div>

            <div className="grid start">
              <section className="panel form-panel" aria-labelledby="scan-title">
                <ScanForm
                  value={url}
                  onChange={(value) => {
                    setUrl(value);
                    if (inputError) clearInputError();
                  }}
                  onSubmit={() => scanUrl(url)}
                  error={inputError}
                  busy={busy}
                  phase={phase}
                  inputRef={inputRef}
                />
              </section>
              <ScanAbout limits={limits} />
            </div>

            {phase === 'done' && scan?.report && <CompletionNotice ref={noticeRef} scan={scan} onViewReport={openReport} />}
            {phase === 'failed' && <FailureNotice ref={noticeRef} error={failure} onRetry={() => scanUrl(url)} />}

            {(phase === 'idle' || phase === 'starting') && !scan && <ScanProgressEmpty />}

            {scan && phase !== 'idle' && phase !== 'failed' && (
              <ScanProgress scan={scan} phase={phase} notifications={completionAlert.permission} />
            )}
          </>
        )}

        <footer className="sheet-footer">
          <p>
            Baseerah is a SWE 444 project by Inclusive Minds, King Saud University. Checks are powered by{' '}
            <a href="https://github.com/dequelabs/axe-core">axe-core</a>. Automated tools find some barriers, not all of
            them.
          </p>
        </footer>
      </main>
    </div>
  );
}
