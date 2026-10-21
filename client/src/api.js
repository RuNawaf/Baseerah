const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { accept: 'application/json', ...(options?.body ? { 'content-type': 'application/json' } : {}) },
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Baseerah could not reach its server. Check your connection and try again.', 0);
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // fall through: a non-JSON answer is treated as a server error below
  }

  if (!response.ok) {
    const error = body?.error;
    throw new ApiError(
      error?.code ?? 'INTERNAL_ERROR',
      error?.message ?? 'Something went wrong on the server. Try again later.',
      response.status,
    );
  }
  return body;
}

export function startScan(url) {
  return request('/api/scans', { method: 'POST', body: JSON.stringify({ url }) });
}

export function getScan(scanId) {
  return request(`/api/scans/${encodeURIComponent(scanId)}`);
}

export function getHealth() {
  return request('/api/health');
}
