/**
 * @format
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/app/navigation/RootNavigator', () => {
  const {Text} = require('react-native');
  return {
    RootNavigator: () => <Text>Fluxion</Text>,
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
