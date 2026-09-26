const { suite, catchError } = require('../../test-helpers/recorder');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveProfile, loadProfile, clearProfile, loadSession } from '../../src/services/storage';

const PROFILE = { name: 'Ali', age: 22, phone: '03001234567' };

suite(
  {
    level: 'unit', id: 'UT-M05', name: 'saveProfile() / loadProfile() / clearProfile() / loadSession() - Local storage', uc: 'UC-M03 Manage Profile',
    objective: 'Verify profile/session data is saved to and read from device storage (AsyncStorage) correctly',
    pre: 'AsyncStorage replaced by official in-memory Jest mock, cleared before each test',
    steps: '1. Call storage function(s)  2. Read back value  3. Compare with expected',
    beforeEach: () => AsyncStorage.clear(),
  },
  [
    { title: 'Saved profile can be loaded back', data: 'saveProfile(1, {Ali, 22, 03001234567}); loadProfile(1)', expected: PROFILE, run: async () => { await saveProfile(1, PROFILE); return loadProfile(1); }, priority: 'High' },
    { title: 'Loading profile of unknown user returns null', data: 'loadProfile(99)', expected: null, run: () => loadProfile(99) },
    { title: 'Corrupted profile JSON returns null instead of crashing', data: 'AsyncStorage["profile:1"] = "{bad json"', expected: null, run: async () => { await AsyncStorage.setItem('profile:1', '{bad json'); return loadProfile(1); } },
    { title: 'clearProfile removes the saved profile', data: 'saveProfile(1, ...); clearProfile(1); loadProfile(1)', expected: null, run: async () => { await saveProfile(1, PROFILE); await clearProfile(1); return loadProfile(1); } },
    { title: 'Saving without userId throws', data: 'saveProfile(undefined, profile)', expected: 'throws: userId is required', run: catchError(() => saveProfile(undefined, PROFILE)), priority: 'Low' },
    {
      title: 'Corrupted session JSON returns null instead of crashing', data: 'AsyncStorage["session"] = "{bad json"', expected: null, priority: 'High',
      run: async () => { await AsyncStorage.setItem('session', '{bad json'); return loadSession(); },
    },
  ]
);
