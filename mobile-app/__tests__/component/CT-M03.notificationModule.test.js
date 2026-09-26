const { suite } = require('../../test-helpers/recorder');
import { render, screen, fireEvent } from '@testing-library/react-native';
import { generateNotifications, markAsRead, markAllAsRead, unreadCount } from '../../src/services/notifications';
import NotificationsScreen from '../../src/screens/NotificationsScreen';

const USER = { userId: 1, name: 'Ali Khan' };
const POSTS = [{ id: 1, title: 'First post' }, { id: 2, title: 'Second' }];

suite(
  {
    level: 'component', id: 'CT-M03', name: 'Notification Module', uc: 'UC-M04 View Notifications',
    objective: 'Verify notifications are generated from user data and read-state is tracked',
    pre: 'notifications.js loaded; user Ali Khan with 2 posts', steps: 'Generate notifications and apply read actions',
    meta: {
      component: 'Notification Module (notifications.js + NotificationsScreen.js)',
      units: ['generateNotifications()', 'markAsRead()', 'markAllAsRead()', 'unreadCount()', 'NotificationsScreen (UI)'],
    },
  },
  [
    { title: 'No user means no notifications', data: 'generateNotifications(null)', expected: [], run: () => generateNotifications(null) },
    {
      title: 'User without profile gets welcome, complete-profile and posts notifications', data: 'user=Ali, posts=2, profile=null', priority: 'High',
      expected: ['welcome', 'profile', 'posts'], run: () => generateNotifications(USER, POSTS, null).map((n) => n.id),
    },
    {
      title: 'Under-18 profile gets restriction notice', data: 'profile.age=16', expected: ['welcome', 'posts', 'minor'],
      run: () => generateNotifications(USER, POSTS, { name: 'Ali', age: 16 }).map((n) => n.id),
    },
    {
      title: 'markAsRead reduces unread count by 1', data: '3 unread, markAsRead("welcome")', expected: { before: 3, after: 2 }, priority: 'High',
      run: () => { const l = generateNotifications(USER, POSTS, null); return { before: unreadCount(l), after: unreadCount(markAsRead(l, 'welcome')) }; },
    },
    {
      title: 'markAllAsRead sets unread count to 0', data: '3 unread, markAllAsRead()', expected: 0,
      run: () => unreadCount(markAllAsRead(generateNotifications(USER, POSTS, null))),
    },
    {
      title: 'Tapping a notification in the UI calls onRead with its id', data: 'render NotificationsScreen, press item "profile"', expected: ['profile'], priority: 'High',
      run: async () => {
        const onRead = jest.fn();
        await render(<NotificationsScreen notifications={generateNotifications(USER, POSTS, null)} onRead={onRead} onReadAll={jest.fn()} />);
        await fireEvent.press(screen.getByTestId('notif-profile'));
        return onRead.mock.calls[0];
      },
    },
  ]
);
