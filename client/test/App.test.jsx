import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../src/App.jsx';
import { completedReport, jsonResponse, mockApi, page, scanState, SITE } from './fakeApi.js';

function setup() {
  const user = userEvent.setup();
  render(<App pollIntervalMs={5} />);
  const input = screen.getByLabelText('Website URL');
  const button = screen.getByRole('button', { name: 'Scan website' });
  return { user, input, button };
}

describe('US-01: enter a website URL', () => {
  it('shows a labeled URL field and a Scan website button', () => {
    const { input, button } = setup();
    expect(input).toHaveAttribute('id', 'url');
    expect(button).toBeEnabled();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/accessibility barriers/i);
  });

  it('shows a required-field message and does not start a scan when the input is empty', async () => {
    const fetchMock = mockApi({ post: [202, {}] });
    const { user, button, input } = setup();
    await user.click(button);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a website URL to scan.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('can be submitted with the keyboard', async () => {
    const fetchMock = mockApi({ post: [202, scanState('queued')], polls: [scanState('running')] });
    const { user, input } = setup();
    await user.type(input, 'bakery.example{Enter}');
    expect(fetchMock).toHaveBeenCalledWith('/api/scans', expect.objectContaining({ method: 'POST', body: JSON.stringify({ url: 'bakery.example' }) }));
  });
});

describe('US-02 / US-03: invalid URL errors', () => {
  it.each([
    ['http://exa mple.com', 'not a valid web address'],
    ['ftp://bakery.example/file', 'Only http:// and https://'],
    ['https://user:pw@bakery.example', 'Remove the username or password'],
  ])('rejects %s in the browser without calling the API', async (value, message) => {
    const fetchMock = mockApi({ post: [202, {}] });
    const { user, input, button } = setup();
    await user.type(input, value);
    await user.click(button);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(input).toHaveValue(value);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['BLOCKED_ADDRESS', 400, 'This address points to a private or internal network (such as localhost).'],
    ['UNREACHABLE', 422, 'The website could not be reached. Check that it is online and publicly accessible.'],
    ['TIMEOUT', 422, 'The website took too long to respond.'],
    ['DNS_NOT_FOUND', 422, 'No website was found at this domain.'],
  ])('shows the server message for %s and keeps the URL for correction', async (code, status, message) => {
    mockApi({ post: [status, { error: { code, message } }] });
    const { user, input, button } = setup();
    await user.type(input, 'https://internal.example');
    await user.click(button);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(message);
    expect(input).toHaveValue('https://internal.example');
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('url-error'));
    expect(button).toBeEnabled();
    expect(screen.queryByRole('heading', { name: /Scanning/ })).not.toBeInTheDocument();
  });

  it('clears the error when the URL is edited', async () => {
    mockApi({ post: [202, {}] });
    const { user, input, button } = setup();
    await user.click(button);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.type(input, 'b');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains when the Baseerah server cannot be reached', async () => {
    mockApi({ post: () => Promise.reject(new TypeError('Failed to fetch')) });
    const { user, input, button } = setup();
    await user.type(input, 'https://bakery.example');
    await user.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('Baseerah could not reach its server');
  });
});

describe('US-04 / US-05: progress, completion and report', () => {
  const running = scanState('running', {
    pages: [page('/', 'succeeded', { issueCount: 3 }), page('/about.html', 'scanning'), page('/contact/', 'queued')],
  });

  it('shows a loading state and disables repeat submissions', async () => {
    let resolvePost;
    mockApi({ post: () => new Promise((resolve) => (resolvePost = resolve)), polls: [running] });
    const { user, input, button } = setup();
    await user.type(input, SITE);
    await user.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Checking address…');
    expect(input).toHaveAttribute('readonly');
    resolvePost(await jsonResponse(202, scanState('queued')));
    expect(await screen.findByRole('button', { name: 'Scanning…' })).toBeDisabled();
  });

  it('shows crawl progress while pages are being scanned', async () => {
    mockApi({ post: [202, scanState('queued')], polls: [running] });
    const { user, input, button } = setup();
    await user.type(input, SITE);
    await user.click(button);

    expect(await screen.findByRole('heading', { name: 'Scanning bakery.example' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('count-discovered')).toHaveTextContent('3'));
    expect(screen.getByTestId('count-queued')).toHaveTextContent('1');
    expect(screen.getByTestId('count-succeeded')).toHaveTextContent('1');
    const map = screen.getByRole('list', { name: 'Pages found on the website' });
    expect(within(map).getAllByRole('listitem')).toHaveLength(3);
    expect(within(map).getByText('/about.html: Checking now')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '3');
  });

  it('announces completion and opens the report', async () => {
    const done = scanState('completed_with_errors', { pages: completedReport.pages, report: completedReport });
    mockApi({ post: [202, scanState('queued')], polls: [running, done] });
    const { user, input, button } = setup();
    await user.type(input, SITE);
    await user.click(button);

    const notice = await screen.findByRole('region', { name: 'Scan complete' });
    expect(notice).toHaveTextContent('2 pages checked and 4 accessibility issues found. 1 page could not be scanned.');
    expect(notice).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Scan complete. 2 pages checked, 4 accessibility issues found.');

    await user.click(within(notice).getByRole('button', { name: 'View report' }));

    const heading = screen.getByRole('heading', { level: 1, name: 'Accessibility report for bakery.example' });
    expect(heading).toHaveFocus();
    expect(screen.getByTestId('total-discovered')).toHaveTextContent('3');
    expect(screen.getByTestId('total-succeeded')).toHaveTextContent('2');
    expect(screen.getByTestId('total-failed')).toHaveTextContent('1');
    expect(screen.getByTestId('total-issues')).toHaveTextContent('4');
    expect(screen.getByText('Started')).toBeInTheDocument();
    expect(screen.getByText('Finished')).toBeInTheDocument();

    const scanned = screen.getByRole('region', { name: 'Scanned pages (2)' });
    expect(within(scanned).getByText('/')).toBeInTheDocument();
    expect(within(scanned).getByText('3 issues')).toBeInTheDocument();
    await user.click(within(scanned).getByText('/'));
    expect(screen.getByRole('heading', { name: 'Images must have alternative text' })).toBeVisible();

    const failed = screen.getByRole('region', { name: 'Pages that could not be scanned (1)' });
    expect(failed).toHaveTextContent('/missing.html');
    expect(failed).toHaveTextContent('The page responded with HTTP 404.');

    expect(screen.queryByText(/bronze|silver|gold/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Scan another website' }));
    expect(screen.getByLabelText('Website URL')).toBeInTheDocument();
  });

  it('shows a warning when a safety limit stopped the scan', async () => {
    const limited = { ...completedReport, limitsReached: [{ type: 'maxPages', message: 'The scan stopped at the 50-page limit, so some pages on this website were not scanned.' }] };
    const done = { ...scanState('completed', { pages: completedReport.pages, report: limited }), limitsReached: limited.limitsReached };
    mockApi({ post: [202, scanState('queued')], polls: [done] });
    const { user, input, button } = setup();
    await user.type(input, SITE);
    await user.click(button);
    expect(await screen.findByText(/Stopped early: The scan stopped at the 50-page limit/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'View report' }));
    expect(screen.getByText(/Partial scan\./)).toBeInTheDocument();
  });
});

describe('US-06: complete scan failure', () => {
  it('shows the reason, no report and no results', async () => {
    const failed = scanState('failed', { error: { code: 'TIMEOUT', message: 'The page did not finish loading within 15 seconds.' } });
    mockApi({ post: [202, scanState('queued')], polls: [failed] });
    const { user, input, button } = setup();
    await user.type(input, SITE);
    await user.click(button);

    const notice = await screen.findByRole('region', { name: 'The scan could not be completed' });
    expect(notice).toHaveTextContent('The page did not finish loading within 15 seconds.');
    expect(notice).toHaveTextContent('No report was created');
    expect(screen.queryByRole('button', { name: 'View report' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Pages found on the website' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Scan failed.');
    expect(button).toBeEnabled();
    expect(notice).not.toHaveTextContent(/at .*\.js|stack/i);
  });

  it('fails cleanly when the scan expires on the server', async () => {
    mockApi({
      post: [202, scanState('queued')],
      polls: [() => jsonResponse(404, { error: { code: 'SCAN_NOT_FOUND', message: 'This scan does not exist or has expired. Start a new scan.' } })],
    });
    const { user, input, button } = setup();
    await user.type(input, SITE);
    await user.click(button);
    expect(await screen.findByRole('region', { name: 'The scan could not be completed' })).toHaveTextContent('has expired');
  });
});
