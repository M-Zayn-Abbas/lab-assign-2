const { suite } = require('../../test-helpers/recorder');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { installFakeServer, renderApp, loginAndWaitForPosts, alertsLabel } from '../../test-helpers/appHarness';

async function saveProfileViaUI(name, age, phone) {
  await fireEvent.press(screen.getByTestId('tab-profile'));
  await fireEvent.changeText(screen.getByTestId('name-input'), name);
  await fireEvent.changeText(screen.getByTestId('age-input'), age);
  await fireEvent.changeText(screen.getByTestId('phone-input'), phone);
  await fireEvent.press(screen.getByTestId('save-profile'));
  await waitFor(() => screen.getByTestId('profile-message'));
}

suite(
  {
    level: 'integration', id: 'IT-M03', name: 'Notification Service <-> User Data', uc: 'UC-M03 Profile / UC-M04 Notifications',
    objective: 'Verify notifications react to the user\'s stored profile and posts data',
    pre: 'Storage cleared; fake API server installed; user Ali logs in', steps: 'Render <App/>, log in, change profile, open Alerts tab',
    beforeEach: () => { AsyncStorage.clear(); installFakeServer(); },
    meta: {
      modules: 'storage.js (profile) + api.js (posts)  ->  notifications.js (generateNotifications)  ->  App.js tab badge + NotificationsScreen',
      strategy: 'Bottom-Up Integration: storage and notification units (already tested) are combined first, then driven through App.js and the Notifications/Profile screens.',
      dataPassed: 'User {name}, posts[] (count, latest title), profile {age} -> notification list [{id, text, read}] -> unread badge count',
    },
  },
  [
    {
      title: 'New user without profile sees 3 unread alerts', data: 'login ali, no saved profile', expected: 'Alerts (3)', priority: 'High',
      run: async () => { await renderApp(); await loginAndWaitForPosts(); return alertsLabel(); },
    },
    {
      title: 'Saving an under-18 profile updates notifications', data: 'save profile {Ali, 16, 03001234567}, open Alerts', priority: 'High',
      expected: { underageNotice: true, completeProfileNotice: false },
      run: async () => {
        await renderApp(); await loginAndWaitForPosts();
        await saveProfileViaUI('Ali', '16', '03001234567');
        await fireEvent.press(screen.getByTestId('tab-notifications'));
        return { underageNotice: !!screen.queryByText(/restricted for users under 18/), completeProfileNotice: !!screen.queryByText(/Complete your profile/) };
      },
    },
    {
      title: 'Profile already in storage is used at login', data: 'AsyncStorage["profile:1"] = {Ali, 25, ...}; login', expected: 'Alerts (2)',
      run: async () => {
        await AsyncStorage.setItem('profile:1', JSON.stringify({ name: 'Ali', age: 25, phone: '03001234567' }));
        await renderApp(); await loginAndWaitForPosts();
        await waitFor(() => expect(alertsLabel()).toBe('Alerts (2)'));
        return alertsLabel();
      },
    },
    {
      title: 'Tapping a notification lowers the unread badge', data: 'open Alerts, tap "welcome"', expected: 'Alerts (2)',
      run: async () => {
        await renderApp(); await loginAndWaitForPosts();
        await fireEvent.press(screen.getByTestId('tab-notifications'));
        await fireEvent.press(screen.getByTestId('notif-welcome'));
        return alertsLabel();
      },
    },
    {
      title: 'Read notifications stay read after profile update', data: 'Mark all read -> save profile {Ali, 25, 03001234567}', priority: 'Medium',
      expectedText: '"Alerts" (0 unread: welcome/posts were already read, no new notices for age 25)',
      run: async () => {
        await renderApp(); await loginAndWaitForPosts();
        await fireEvent.press(screen.getByTestId('tab-notifications'));
        await fireEvent.press(screen.getByTestId('read-all'));
        await saveProfileViaUI('Ali', '25', '03001234567');
        return alertsLabel();
      },
      check: (label) => expect(label).toBe('Alerts'),
    },
  ]
);
