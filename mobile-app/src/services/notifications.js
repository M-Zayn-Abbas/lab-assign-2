// COMPONENT: Notification Module (in-app notifications derived from user data)

export function generateNotifications(user, posts = [], profile = null) {
  if (!user) return [];
  const list = [{ id: 'welcome', text: `Welcome back, ${user.name}!`, read: false }];
  if (!profile) {
    list.push({ id: 'profile', text: 'Complete your profile to get personalised updates.', read: false });
  }
  if (posts.length > 0) {
    list.push({ id: 'posts', text: `You have ${posts.length} posts. Latest: "${posts[0].title}"`, read: false });
  }
  if (profile && Number(profile.age) < 18) {
    list.push({ id: 'minor', text: 'Some features are restricted for users under 18.', read: false });
  }
  return list;
}

export function markAsRead(list, id) {
  return list.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export function markAllAsRead(list) {
  return list.map((n) => ({ ...n, read: true }));
}

export function unreadCount(list) {
  return list.filter((n) => !n.read).length;
}
