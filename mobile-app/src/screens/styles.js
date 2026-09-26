import { StyleSheet } from 'react-native';

export const colors = { primary: '#2d6cdf', danger: '#d9534f', bg: '#f4f6f8', text: '#222', muted: '#777' };

export default StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: colors.text },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8 },
  button: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonDanger: { backgroundColor: colors.danger },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: colors.danger, marginTop: 4, fontSize: 13 },
  success: { color: '#2e7d32', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muted: { color: colors.muted },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ddd' },
  tab: { fontSize: 15, color: colors.muted },
  tabActive: { color: colors.primary, fontWeight: '700' },
});
