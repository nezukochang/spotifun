jest.mock('react-native-gesture-handler', () => {
  const {View} = require('react-native');
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
  };
});

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    setupPlayer: jest.fn(),
    updateOptions: jest.fn(),
    reset: jest.fn(),
    add: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    skip: jest.fn(),
    skipToNext: jest.fn(),
    skipToPrevious: jest.fn(),
    seekTo: jest.fn(),
    setRepeatMode: jest.fn(),
    getPlaybackState: jest.fn(() => ({state: 'paused'})),
    getProgress: jest.fn(() => ({position: 0, duration: 0})),
    getActiveTrack: jest.fn(),
    addEventListener: jest.fn(() => ({remove: jest.fn()})),
    registerPlaybackService: jest.fn(),
  },
  State: {Playing: 'playing', Paused: 'paused', Buffering: 'buffering'},
  Event: {RemotePlay: 'remote-play', RemotePause: 'remote-pause'},
  RepeatMode: {Off: 0},
  Capability: {},
  AppKilledPlaybackBehavior: {},
  useProgress: () => ({position: 0, duration: 0}),
}));

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => ({
    state: jest.fn(() => Promise.resolve('PoweredOn')),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
  })),
  State: {PoweredOn: 'PoweredOn'},
}));

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      dirs: {DocumentDir: '/tmp'},
      isDir: jest.fn(() => Promise.resolve(false)),
      mkdir: jest.fn(),
      exists: jest.fn(() => Promise.resolve(false)),
      unlink: jest.fn(),
      stat: jest.fn(() => Promise.resolve({size: 0})),
    },
    config: jest.fn(() => ({
      fetch: jest.fn(() => ({
        progress: jest.fn().mockReturnThis(),
        then: cb => {
          cb();
          return Promise.resolve({path: () => '/tmp/x.cache'});
        },
      })),
    })),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
  },
}));
