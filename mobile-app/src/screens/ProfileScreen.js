import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { validateProfile } from '../utils/validation';
import s from './styles';

export default function ProfileScreen({ user, apiUser, profile, onSave, onClear, onLogout }) {
  const [name, setName] = useState(profile?.name || user.name);
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    setName(profile?.name || user.name);
    setAge(profile?.age ? String(profile.age) : '');
    setPhone(profile?.phone || '');
  }, [profile, user.name]);

  async function handleSave() {
    const v = validateProfile({ name, age, phone });
    setErrors(v.errors);
    if (!v.valid) return setMessage('');
    await onSave({ name: name.trim(), age: Number(age), phone });
    setMessage('Profile saved to device storage');
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text style={s.title}>My Profile</Text>
      <View style={s.card}>
        <Text>Email: {user.email}</Text>
        {apiUser && (
          <Text testID="api-user-info" style={s.muted}>
            Server data: {apiUser.city} · {apiUser.company}
          </Text>
        )}
      </View>
      <TextInput testID="name-input" style={s.input} placeholder="Name" value={name} onChangeText={setName} />
      {errors.name && <Text style={s.error}>{errors.name}</Text>}
      <TextInput testID="age-input" style={s.input} placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge} />
      {errors.age && <Text style={s.error}>{errors.age}</Text>}
      <TextInput testID="phone-input" style={s.input} placeholder="Phone (03001234567)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      {errors.phone && <Text style={s.error}>{errors.phone}</Text>}
      <Pressable testID="save-profile" style={s.button} onPress={handleSave}>
        <Text style={s.buttonText}>Save Profile</Text>
      </Pressable>
      {message ? <Text testID="profile-message" style={s.success}>{message}</Text> : null}
      <Pressable testID="clear-profile" style={[s.button, { backgroundColor: '#666' }]} onPress={() => { onClear(); setMessage('Profile cleared'); }}>
        <Text style={s.buttonText}>Clear Saved Profile</Text>
      </Pressable>
      <Pressable testID="logout-button" style={[s.button, s.buttonDanger]} onPress={onLogout}>
        <Text style={s.buttonText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}
