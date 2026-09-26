// COMPONENT: Login Module (mock auth server)
import { validateLogin } from '../utils/validation';

// Demo accounts. userId maps to a user on jsonplaceholder.typicode.com
export const USERS = [
  { email: 'ali@test.com', password: 'ali123', userId: 1, name: 'Ali Khan' },
  { email: 'sara@test.com', password: 'sara123', userId: 2, name: 'Sara Ahmed' },
];

export async function login(email, password) {
  const v = validateLogin(email, password);
  if (!v.valid) return { ok: false, errors: v.errors };
  await new Promise((r) => setTimeout(r, 300)); // simulate network latency
  const user = USERS.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
  if (!user) return { ok: false, errors: { form: 'Invalid email or password' } };
  return { ok: true, user: { userId: user.userId, email: user.email, name: user.name } };
}
