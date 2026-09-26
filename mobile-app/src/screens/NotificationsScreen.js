import { View, Text, Pressable, FlatList } from 'react-native';
import s from './styles';

export default function NotificationsScreen({ notifications, onRead, onReadAll }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={s.row}>
        <Text style={s.title}>Notifications</Text>
        <Pressable testID="read-all" onPress={onReadAll}>
          <Text style={{ color: '#2d6cdf' }}>Mark all read</Text>
        </Pressable>
      </View>
      {notifications.length === 0 && <Text style={s.muted}>No notifications</Text>}
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <Pressable testID={`notif-${item.id}`} onPress={() => onRead(item.id)} style={[s.card, { opacity: item.read ? 0.5 : 1 }]}>
            <Text style={{ fontWeight: item.read ? '400' : '700' }}>
              {item.read ? '' : '● '}
              {item.text}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
