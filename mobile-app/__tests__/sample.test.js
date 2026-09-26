// Sample tests showing one example of each level. Add your own test cases alongside this file.
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { validateEmail } from '../src/utils/validation';
import { saveProfile, loadProfile } from '../src/services/storage';
import { fetchPosts } from '../src/services/api';
import LoginScreen from '../src/screens/LoginScreen';

describe('Unit: validateEmail', () => {
  test('accepts a valid email', () => expect(validateEmail('ali@test.com')).toBe(true));
  test('rejects email without domain', () => expect(validateEmail('ali@')).toBe(false));
});

describe('Component: User Profile storage', () => {
  test('saves and loads a profile', async () => {
    await saveProfile(1, { name: 'Ali', age: 22, phone: '03001234567' });
    expect(await loadProfile(1)).toEqual({ name: 'Ali', age: 22, phone: '03001234567' });
  });
});

describe('Component: API Communication (mocked fetch)', () => {
  test('fetchPosts parses and limits results', async () => {
    const fakeFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { id: 1, userId: 1, title: 'first post', body: 'hello world' },
        { id: 2, userId: 1, title: 'second post', body: 'bye' },
      ],
    });
    const posts = await fetchPosts(1, 1, fakeFetch);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('First post');
  });
});

describe('Integration: Login UI -> Auth module', () => {
  test('shows validation error for empty form', async () => {
    await render(<LoginScreen onLogin={jest.fn()} />);
    await fireEvent.press(screen.getByTestId('login-button'));
    await waitFor(() => expect(screen.getByTestId('email-error')).toBeTruthy());
  });

  test('calls onLogin with the user on valid credentials', async () => {
    const onLogin = jest.fn();
    await render(<LoginScreen onLogin={onLogin} />);
    await fireEvent.changeText(screen.getByTestId('email-input'), 'ali@test.com');
    await fireEvent.changeText(screen.getByTestId('password-input'), 'ali123');
    await fireEvent.press(screen.getByTestId('login-button'));
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith({ userId: 1, email: 'ali@test.com', name: 'Ali Khan' }));
  });
});
