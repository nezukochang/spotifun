import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './navigation/RootNavigator';
import { colors } from '../shared/theme/tokens';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar barStyle="light-content" backgroundColor={colors.void} />
            <RootNavigator />
          </QueryClientProvider>
        </SafeAreaProvider>
      </ErrorBoundary>

    </GestureHandlerRootView>
  );
}
