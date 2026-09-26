import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { fetchPosts, fetchUser } from './src/services/api';
import { saveProfile, loadProfile, clearProfile, saveSession, loadSession, clearSession } from './src/services/storage';
import { generateNotifications, markAsRead, markAllAsRead, unreadCount } from './src/services/notifications';
import s from './src/screens/styles';

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [posts, setPosts] = useState([]);
  const [apiUser, setApiUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(5);

  // Restore session on launch
  useEffect(() => {
    loadSession().then((u) => u && setUser(u)).catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [p, u, prof] = await Promise.all([fetchPosts(user.userId, limit), fetchUser(user.userId), loadProfile(user.userId)]);
      setPosts(p);
      setApiUser(u);
      setProfile(prof);
      setNotifications(generateNotifications(user, p, prof));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleLogin(u) {
    await saveSession(u);
    setTab('dashboard');
    setUser(u);
  }

  async function handleLogout() {
    await clearSession();
    setUser(null);
    setPosts([]);
    setProfile(null);
    setNotifications([]);
  }

  async function handleSaveProfile(p) {
    await saveProfile(user.userId, p);
    setProfile(p);
    setNotifications(generateNotifications(user, posts, p));
  }

  async function handleClearProfile() {
    await clearProfile(user.userId);
    setProfile(null);
    setNotifications(generateNotifications(user, posts, null));
  }

  if (!user) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <StatusBar style="auto" />
      </>
    );
  }

  const unread = unreadCount(notifications);
  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'notifications', label: `Alerts${unread ? ` (${unread})` : ''}` },
    { key: 'profile', label: 'Profile' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: s.screen.backgroundColor }}>
      <View style={[s.screen, { paddingBottom: 0 }]}>
        {tab === 'dashboard' && (
          <DashboardScreen user={user} posts={posts} loading={loading} error={error} limit={limit} onChangeLimit={setLimit} onRefresh={loadData} />
        )}
        {tab === 'notifications' && (
          <NotificationsScreen
            notifications={notifications}
            onRead={(id) => setNotifications(markAsRead(notifications, id))}
            onReadAll={() => setNotifications(markAllAsRead(notifications))}
          />
        )}
        {tab === 'profile' && (
          <ProfileScreen user={user} apiUser={apiUser} profile={profile} onSave={handleSaveProfile} onClear={handleClearProfile} onLogout={handleLogout} />
        )}
      </View>
      <View style={s.tabBar}>
        {tabs.map((t) => (
          <Pressable key={t.key} testID={`tab-${t.key}`} onPress={() => setTab(t.key)}>
            <Text style={[s.tab, tab === t.key && s.tabActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
