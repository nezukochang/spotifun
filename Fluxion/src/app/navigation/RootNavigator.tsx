import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, View } from 'react-native';
import type { MainTabParamList, RootStackParamList } from './types';
import { navigationRef, navigateToPlayer } from './navigationRef';
import { AuthScreen } from '../../features/auth/AuthScreen';
import { HomeScreen } from '../../features/home/HomeScreen';
import { SearchScreen } from '../../features/search/SearchScreen';
import { LibraryScreen } from '../../features/library/LibraryScreen';
import { SettingsScreen } from '../../features/settings/SettingsScreen';
import { PlayerFullScreen } from '../../features/player/PlayerFullScreen';
import { HandoffScreen } from '../../features/bluetooth/HandoffScreen';
import { useAuthStore } from '../../stores/authStore';
import { MiniPlayer } from '../../shared/ui/MiniPlayer';
import { OfflineBanner } from '../../shared/ui/OfflineBanner';
import { usePlayerStore } from '../../stores/playerStore';
import { usePlaybackSync } from '../../hooks/usePlaybackSync';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineStore } from '../../stores/offlineStore';
import * as playerService from '../../services/audio/playerService';
import { colors } from '../../shared/theme/tokens';

const Stack = createStackNavigator<RootStackParamList>();

const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.void,
    card: colors.surface,
    text: colors.text,
    border: colors.elevated,
    primary: colors.accent,
  },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? colors.accent : colors.muted, fontSize: 11 }}>
      {label}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.elevated,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabIcon label="Accueil" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabIcon label="Chercher" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabIcon label="Bibliothèque" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabIcon label="Réglages" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function MainShell() {
  usePlaybackSync();
  const { isOnline } = useNetworkStatus();
  const refreshOffline = useOfflineStore(s => s.refresh);
  const track = usePlayerStore(s => s.currentTrack());
  const isPlaying = usePlayerStore(s => s.isPlaying);
  const fromCache = usePlayerStore(s => s.fromCache);

  React.useEffect(() => {
    refreshOffline();
  }, [refreshOffline]);

  return (
    <View style={{ flex: 1 }}>
      {!isOnline && <OfflineBanner />}
      <MainTabs />
      {track && (
        <MiniPlayer
          title={track.title}
          artist={track.artistName}
          artwork={track.coverUrl}
          isPlaying={isPlaying}
          fromCache={fromCache}
          onPress={navigateToPlayer}
          onPlayPause={() => playerService.togglePlayPause()}
        />
      )}
    </View>
  );
}

export function RootNavigator() {
  const { user, initialized, hydrate } = useAuthStore();

  React.useEffect(() => {
    const init = async () => {
      await hydrate();
      try {
        await playerService.setupPlayer();
      } catch (e) {
        console.warn('TrackPlayer setup failed', e);
      }
    };
    init();
  }, [hydrate]);


  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.void,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer
      key={user?.id ?? 'auth'}
      ref={navigationRef}
      theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainShell} />
            <Stack.Screen
              name="Player"
              component={PlayerFullScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="Handoff"
              component={HandoffScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
