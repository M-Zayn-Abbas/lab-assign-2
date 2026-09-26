jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Integration tests render the whole app; give async UI updates more time on slower machines
require('@testing-library/react-native').configure({ asyncUtilTimeout: 5000 });
