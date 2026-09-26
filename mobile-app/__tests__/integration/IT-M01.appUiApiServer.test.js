const { suite } = require('../../test-helpers/recorder');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { installFakeServer, renderApp, loginAndWaitForPosts, login } from '../../test-helpers/appHarness';

const postIds = () => screen.queryAllByTestId(/^post-/).map((n) => n.props.testID);
const postCalls = (f) => f.mock.calls.filter(([u]) => u.includes('/posts')).map(([u]) => u);

suite(
  {
    level: 'integration', id: 'IT-M01', name: 'App UI <-> API Server', uc: 'UC-M02 View Dashboard',
    objective: 'Verify the Dashboard UI requests data from the API server and displays / handles the responses',
    pre: 'Storage cleared; global fetch replaced by a fake jsonplaceholder server', steps: 'Render <App/>, log in, interact with Dashboard',
    beforeEach: () => AsyncStorage.clear(),
    meta: {
      modules: 'App.js + DashboardScreen (UI)  <->  api.js (fetchPosts/fetchUser)  <->  API server (jsonplaceholder, stubbed)',
      strategy: 'Top-Down Integration: the top-level App/Dashboard UI is integrated with the real API module; the remote server is replaced by a stub returning jsonplaceholder-shaped data.',
      dataPassed: 'UI -> API: userId, limit (GET /posts?userId=1, GET /users/1);  API -> UI: JSON posts[] / user{} parsed into models, or error message',
    },
  },
  [
    {
      title: 'After login dashboard shows first 5 posts from server', data: 'login ali@test.com/ali123; server returns 10 posts', priority: 'High',
      expectedText: '5 post cards rendered (post-101..post-105)',
      run: async () => { installFakeServer(); await renderApp(); await loginAndWaitForPosts(); return postIds(); },
      actualText: (ids) => `${ids.length} post cards rendered (${ids[0]}..${ids[ids.length - 1]})`,
      check: (ids) => expect(ids).toHaveLength(5),
    },
    {
      title: 'Pressing "+" re-requests and shows 10 posts', data: 'press limit-plus once', expectedText: '10 post cards rendered, /posts requested again',
      run: async () => {
        const f = installFakeServer(); await renderApp(); await loginAndWaitForPosts();
        await fireEvent.press(screen.getByTestId('limit-plus'));
        await waitFor(() => expect(postIds()).toHaveLength(10));
        return { cards: postIds().length, postRequests: postCalls(f).length };
      },
      actualText: (r) => `${r.cards} post cards rendered, /posts requested ${r.postRequests} times`,
      check: (r) => { expect(r.cards).toBe(10); expect(r.postRequests).toBe(2); },
    },
    {
      title: 'Server error is shown on the dashboard', data: 'server responds 500 to every request', expected: 'Server error (500)', priority: 'High',
      run: async () => {
        installFakeServer({ failStatus: 500 }); await renderApp(); await login();
        await waitFor(() => screen.getByTestId('api-error'));
        return screen.getByTestId('api-error').props.children;
      },
    },
    {
      title: 'Refresh button calls the API again', data: 'press refresh-button', expectedText: '/posts requested 2 times',
      run: async () => {
        const f = installFakeServer(); await renderApp(); await loginAndWaitForPosts();
        await fireEvent.press(screen.getByTestId('refresh-button'));
        await waitFor(() => expect(postCalls(f).length).toBe(2));
        return postCalls(f).length;
      },
      actualText: (n) => `/posts requested ${n} times`,
      check: (n) => expect(n).toBe(2),
    },
    {
      title: 'Logged-in user id is sent to the server', data: 'login sara@test.com/sara123 (userId 2)', priority: 'High',
      expectedText: 'request URL contains userId=2 and cards are post-201..',
      run: async () => {
        const f = installFakeServer(); await renderApp(); await loginAndWaitForPosts('sara@test.com', 'sara123');
        return { url: postCalls(f)[0], first: postIds()[0] };
      },
      check: (r) => { expect(r.url).toContain('userId=2'); expect(r.first).toBe('post-201'); },
    },
  ]
);
