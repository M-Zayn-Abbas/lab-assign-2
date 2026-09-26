const { suite } = require('../../test-helpers/recorder');
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../src/screens/ProfileScreen';

const USER = { userId: 1, email: 'ali@test.com', name: 'Ali Khan' };
const API_USER = { id: 1, name: 'Leanne Graham', email: 'x', city: 'Gwenborough', company: 'Romaguera-Crona' };

async function renderProfile(props = {}) {
  const handlers = { onSave: jest.fn(async () => {}), onClear: jest.fn(), onLogout: jest.fn() };
  await render(<ProfileScreen user={USER} apiUser={API_USER} profile={null} {...handlers} {...props} />);
  return handlers;
}
async function fill(name, age, phone) {
  await fireEvent.changeText(screen.getByTestId('name-input'), name);
  await fireEvent.changeText(screen.getByTestId('age-input'), age);
  await fireEvent.changeText(screen.getByTestId('phone-input'), phone);
}

suite(
  {
    level: 'component', id: 'CT-M01', name: 'User Profile Module', uc: 'UC-M03 Manage Profile',
    objective: 'Verify the profile screen, its validation and save/clear actions work together',
    pre: 'ProfileScreen rendered with user Ali Khan; onSave/onClear are Jest spies', steps: 'Render screen, type into inputs, press buttons',
    meta: {
      component: 'User Profile Module (ProfileScreen.js + validation.js + storage callbacks)',
      units: ['ProfileScreen (UI)', 'validateProfile()', 'handleSave() click handler', 'onSave -> saveProfile()', 'onClear -> clearProfile()'],
    },
  },
  [
    {
      title: 'Screen pre-fills name from logged-in user', data: 'user.name="Ali Khan", profile=null', expected: 'Ali Khan',
      run: async () => { await renderProfile(); return screen.getByTestId('name-input').props.value; },
    },
    {
      title: 'Server data from API user is displayed', data: 'apiUser.city="Gwenborough", company="Romaguera-Crona"', expected: 'Server data: Gwenborough · Romaguera-Crona',
      run: async () => { await renderProfile(); const t = screen.getByTestId('api-user-info').props.children; return [].concat(t).join(''); },
    },
    {
      title: 'Invalid age shows error and does not save', data: 'name="Ali", age="abc", phone="03001234567" -> press Save', priority: 'High',
      expectedText: 'error "Age must be a whole number between 1 and 120" shown; onSave not called',
      run: async () => {
        const h = await renderProfile();
        await fill('Ali', 'abc', '03001234567');
        await fireEvent.press(screen.getByTestId('save-profile'));
        return { errorShown: !!screen.queryByText('Age must be a whole number between 1 and 120'), saveCalls: h.onSave.mock.calls.length };
      },
      check: (r) => expect(r).toEqual({ errorShown: true, saveCalls: 0 }),
    },
    {
      title: 'Valid data is saved and success message shown', data: 'name="Ali Raza", age="23", phone="03211234567" -> press Save', priority: 'High',
      expectedText: 'onSave({name:"Ali Raza", age:23, phone:"03211234567"}); message "Profile saved to device storage"',
      run: async () => {
        const h = await renderProfile();
        await fill('Ali Raza', '23', '03211234567');
        await fireEvent.press(screen.getByTestId('save-profile'));
        await waitFor(() => screen.getByTestId('profile-message'));
        return { savedWith: h.onSave.mock.calls[0][0], message: screen.getByTestId('profile-message').props.children };
      },
      check: (r) => expect(r).toEqual({ savedWith: { name: 'Ali Raza', age: 23, phone: '03211234567' }, message: 'Profile saved to device storage' }),
    },
    {
      title: 'Clear button clears profile and confirms', data: 'press "Clear Saved Profile"', expected: { clearCalls: 1, message: 'Profile cleared' },
      run: async () => {
        const h = await renderProfile({ profile: { name: 'Ali', age: 22, phone: '03001234567' } });
        await fireEvent.press(screen.getByTestId('clear-profile'));
        return { clearCalls: h.onClear.mock.calls.length, message: screen.getByTestId('profile-message').props.children };
      },
    },
    {
      title: 'Saved profile values are shown when screen opens', data: 'profile={name:"Ali", age:22, phone:"03001234567"}', expected: { name: 'Ali', age: '22', phone: '03001234567' },
      run: async () => {
        await renderProfile({ profile: { name: 'Ali', age: 22, phone: '03001234567' } });
        return { name: screen.getByTestId('name-input').props.value, age: screen.getByTestId('age-input').props.value, phone: screen.getByTestId('phone-input').props.value };
      },
    },
  ]
);
