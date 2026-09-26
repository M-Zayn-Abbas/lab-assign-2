import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { login } from '../services/auth';
import s from './styles';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) return setErrors(res.errors);
    setErrors({});
    onLogin(res.user);
  }

  return (
    <View style={s.screen}>
      <Text style={s.title}>PostHub Login</Text>
      <TextInput testID="email-input" style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      {errors.email && <Text testID="email-error" style={s.error}>{errors.email}</Text>}
      <TextInput testID="password-input" style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {errors.password && <Text testID="password-error" style={s.error}>{errors.password}</Text>}
      {errors.form && <Text testID="form-error" style={s.error}>{errors.form}</Text>}
      <Pressable testID="login-button" style={s.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Login</Text>}
      </Pressable>
      <Text style={[s.muted, { marginTop: 20 }]}>Demo: ali@test.com / ali123  or  sara@test.com / sara123</Text>
    </View>
  );
}
