import { useEffect, useRef, useState } from 'react';
import { displayHost, plural } from './format.js';

const BASE_TITLE = 'Baseerah – website accessibility scanner';
const RESULT_TITLES = new Set(['Scan complete – Baseerah', 'Scan failed – Baseerah']);
const ICON = '/favicon-64.png';

export function notificationPermission() {
  return typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'unsupported';
}

/** Must be called from a click/submit handler: browsers only show the prompt after a user action. */
export function requestNotificationPermission() {
  if (notificationPermission() !== 'default') return Promise.resolve(notificationPermission());
  try {
    return Promise.resolve(window.Notification.requestPermission()).catch(() => 'denied');
  } catch {
    return Promise.resolve('denied');
  }
}

function describe(phase, scan, failure) {
  if (phase === 'done') {
    const { totals } = scan.report;
    return {
      title: 'Scan complete',
      tabTitle: 'Scan complete – Baseerah',
      body: `${displayHost(scan.url)}: ${plural(totals.succeededPages, 'page')} checked, ${plural(totals.issues, 'accessibility issue')} found.`,
    };
  }
  return {
    title: 'Scan failed',
    tabTitle: 'Scan failed – Baseerah',
    body: failure?.message ?? 'The scan could not be completed.',
  };
}

/**
 * Tells the developer when a scan ends, even if they switched to another tab:
 * - a system notification (if allowed), which brings this tab back and opens the report when clicked
 * - the tab title shows live progress while scanning and the result afterwards, until the tab is viewed again
 */
export function useCompletionAlert({ phase, scan, failure, onOpenReport }) {
  const notifiedScanId = useRef(null);
  const notificationRef = useRef(null);
  const openReportRef = useRef(onOpenReport);
  openReportRef.current = onOpenReport;
  const [permission, setPermission] = useState(notificationPermission);

  // Coming back to the tab clears the result from the title and dismisses the notification.
  useEffect(() => {
    const onVisible = () => {
      if (document.hidden) return;
      if (RESULT_TITLES.has(document.title)) document.title = BASE_TITLE;
      notificationRef.current?.close();
      notificationRef.current = null;
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Live progress in the tab title.
  useEffect(() => {
    if (phase === 'scanning' && scan) {
      const { progress } = scan;
      const done = (progress?.succeeded ?? 0) + (progress?.failed ?? 0) + (progress?.skipped ?? 0);
      document.title = progress?.discovered ? `Scanning ${done}/${progress.discovered} – Baseerah` : 'Scanning… – Baseerah';
    } else if (phase === 'idle' || phase === 'starting') {
      document.title = BASE_TITLE;
    }
  }, [phase, scan]);

  // Result: notification and tab title, once per scan.
  useEffect(() => {
    if ((phase !== 'done' && phase !== 'failed') || !scan || notifiedScanId.current === scan.scanId) return;
    notifiedScanId.current = scan.scanId;

    if (!document.hidden) {
      document.title = BASE_TITLE; // the on-page notice is enough
      return;
    }

    const message = describe(phase, scan, failure);
    document.title = message.tabTitle;
    if (notificationPermission() !== 'granted') return;

    try {
      const notification = new window.Notification(message.title, {
        body: message.body,
        icon: ICON,
        tag: `baseerah-${scan.scanId}`,
      });
      notification.onclick = () => {
        window.focus();
        if (phase === 'done') openReportRef.current?.();
        notification.close();
      };
      notificationRef.current = notification;
    } catch {
      // Some browsers (e.g. Android Chrome) only allow notifications from a service worker; the tab title still works.
    }
  }, [phase, scan, failure]);

  return {
    permission,
    async ask() {
      setPermission(await requestNotificationPermission());
    },
  };
}
