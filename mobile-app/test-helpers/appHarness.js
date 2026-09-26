// Helpers for integration tests that render the whole <App /> with a stubbed API server
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

export const rawPosts = (userId, n = 10) =>
  Array.from({ length: n }, (_, i) => ({ id: userId * 100 + i + 1, userId, title: `post ${i + 1} of user ${userId}`, body: `body text ${i + 1}` }));

export const rawUser = (id) => ({ id, name: `API User ${id}`, email: `u${id}@api.com`, address: { city: 'Gwenborough' }, company: { name: 'Romaguera-Crona' } });

// Stub "API server" installed as global fetch. failStatus makes every request fail with that status.
export function installFakeServer({ failStatus } = {}) {
  global.fetch = jest.fn(async (url) => {
    if (failStatus) return { ok: false, status: failStatus, json: async () => ({}) };
    const u = new URL(url);
    if (u.pathname === '/posts') return { ok: true, status: 200, json: async () => rawPosts(Number(u.searchParams.get('userId'))) };
    const m = u.pathname.match(/^\/users\/(\d+)$/);
    if (m) return { ok: true, status: 200, json: async () => rawUser(Number(m[1])) };
    return { ok: false, status: 404, json: async () => ({}) };
  });
  return global.fetch;
}

export async function renderApp() {
  await render(<App />);
}

export async function login(email = 'ali@test.com', password = 'ali123') {
  await waitFor(() => screen.getByTestId('login-button'));
  await fireEvent.changeText(screen.getByTestId('email-input'), email);
  await fireEvent.changeText(screen.getByTestId('password-input'), password);
  await fireEvent.press(screen.getByTestId('login-button'));
}

export async function loginAndWaitForPosts(email, password) {
  await login(email, password);
  await waitFor(() => screen.getByTestId('dashboard-title'));
  await waitFor(() => expect(screen.queryAllByTestId(/^post-/).length).toBeGreaterThan(0));
}

export const alertsLabel = () => screen.getByText(/^Alerts/).props.children;
