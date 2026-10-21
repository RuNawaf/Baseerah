export function displayPath(url) {
  try {
    const { pathname, search } = new URL(url);
    return decodeURI(pathname) + search;
  } catch {
    return url;
  }
}

export function displayHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const timeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' });

export function formatTime(iso) {
  return iso ? timeFormat.format(new Date(iso)) : '—';
}

export function formatDuration(startIso, endIso) {
  if (!startIso || !endIso) return '';
  const seconds = Math.max(0, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 1000));
  if (seconds < 60) return `${seconds} s`;
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

export function plural(count, one, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}
