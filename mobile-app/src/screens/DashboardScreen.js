import { useState } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { toggleLike, stepCounter } from '../utils/handlers';
import s from './styles';

export default function DashboardScreen({ user, posts, loading, error, limit, onChangeLimit, onRefresh }) {
  const [liked, setLiked] = useState(new Set());

  return (
    <View style={{ flex: 1 }}>
      <Text style={s.title} testID="dashboard-title">Hello, {user.name}</Text>
      <View style={[s.row, { marginBottom: 10 }]}>
        <Text>Posts to show: {limit}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable testID="limit-minus" style={[s.button, { marginTop: 0, padding: 8 }]} onPress={() => onChangeLimit(stepCounter(limit, -5))}>
            <Text style={s.buttonText}> − </Text>
          </Pressable>
          <Pressable testID="limit-plus" style={[s.button, { marginTop: 0, padding: 8 }]} onPress={() => onChangeLimit(stepCounter(limit, 5))}>
            <Text style={s.buttonText}> + </Text>
          </Pressable>
          <Pressable testID="refresh-button" style={[s.button, { marginTop: 0, padding: 8 }]} onPress={onRefresh}>
            <Text style={s.buttonText}>Refresh</Text>
          </Pressable>
        </View>
      </View>
      {loading && <ActivityIndicator testID="loading" size="large" />}
      {error && <Text testID="api-error" style={s.error}>{error}</Text>}
      <FlatList
        data={posts}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <View style={s.card} testID={`post-${item.id}`}>
            <Text style={{ fontWeight: '600' }}>{item.title}</Text>
            <Text style={s.muted}>{item.preview}...</Text>
            <Pressable testID={`like-${item.id}`} onPress={() => setLiked(toggleLike(liked, item.id))}>
              <Text style={{ marginTop: 6 }}>{liked.has(item.id) ? '❤️ Liked' : '🤍 Like'}</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
