const { suite } = require('../../test-helpers/recorder');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { installFakeServer, renderApp, login, loginAndWaitForPosts } from '../../test-helpers/appHarness';

suite(
  {
    level: 'integration', id: 'IT-M02', name: 'Login Module <-> Dashboard', uc: 'UC-M01 Login / UC-M02 Dashboard',
    objective: 'Verify successful login hands the user/session to the Dashboard and logout returns to Login',
    pre: 'Storage cleared; fake API server installed', steps: 'Render <App/>, perform login/logout flows',
    beforeEach: () => { AsyncStorage.clear(); installFakeServer(); },
    meta: {
      modules: 'LoginScreen + auth.js (login)  ->  App.js (session state + storage.saveSession)  ->  DashboardScreen / ProfileScreen (logout)',
      strategy: 'Incremental Integration: Login module was integrated with App state first, then Dashboard, then session storage and logout were added one at a time, re-testing after each addition.',
      dataPassed: 'Login -> App: user {userId, email, name};  App -> Storage: "session" JSON;  App -> Dashboard: user prop (name shown in greeting)',
    },
  },
  [
    {
      title: 'Wrong password keeps user on Login screen', data: 'ali@test.com / wrong99', priority: 'High',
      expected: { error: 'Invalid email or password', dashboardVisible: false },
      run: async () => {
        await renderApp(); await login('ali@test.com', 'wrong99');
        await waitFor(() => screen.getByTestId('form-error'));
        return { error: screen.getByTestId('form-error').props.children, dashboardVisible: !!screen.queryByTestId('dashboard-title') };
      },
    },
    {
      title: 'Valid login opens Dashboard with user name', data: 'ali@test.com / ali123', expected: 'Hello, Ali Khan', priority: 'High',
      run: async () => {
        await renderApp(); await loginAndWaitForPosts();
        return [].concat(screen.getByTestId('dashboard-title').props.children).join('');
      },
    },
    {
      title: 'Login stores the session on the device', data: 'login ali, read AsyncStorage["session"]', expected: { userId: 1, email: 'ali@test.com', name: 'Ali Khan' },
      run: async () => { await renderApp(); await loginAndWaitForPosts(); return JSON.parse(await AsyncStorage.getItem('session')); },
    },
    {
      title: 'Logout returns to Login screen and clears session', data: 'login -> Profile tab -> Logout', priority: 'High',
      expected: { loginVisible: true, session: null },
      run: async () => {
        await renderApp(); await loginAndWaitForPosts();
        await fireEvent.press(screen.getByTestId('tab-profile'));
        await fireEvent.press(screen.getByTestId('logout-button'));
        await waitFor(() => screen.getByTestId('login-button'));
        return { loginVisible: !!screen.queryByTestId('login-button'), session: await AsyncStorage.getItem('session') };
      },
    },
    {
      title: 'Re-opening the app with a saved session skips Login', data: 'AsyncStorage["session"] = Sara; render App', expected: 'Hello, Sara Ahmed',
      run: async () => {
        await AsyncStorage.setItem('session', JSON.stringify({ userId: 2, email: 'sara@test.com', name: 'Sara Ahmed' }));
        await renderApp();
        await waitFor(() => screen.getByTestId('dashboard-title'));
        return [].concat(screen.getByTestId('dashboard-title').props.children).join('');
      },
    },
  ]
);
