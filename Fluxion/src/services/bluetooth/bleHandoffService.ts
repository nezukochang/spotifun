import {PermissionsAndroid, Platform} from 'react-native';
import type {HandoffPayload, Track} from '../../types/models';
import {env} from '../../config/env';
import {getMockTrackById} from '../mock/catalog';
import {handoffPlay} from '../audio/playerService';
import {publishHandoffCode} from './handoffCodeService';

type BleManagerLike = {
  state: () => Promise<string>;
  startDeviceScan: (
    uuids: null,
    opts: {allowDuplicates: boolean},
    cb: (error: Error | null, device: BleDevice | null) => void,
  ) => void;
  stopDeviceScan: () => void;
};

type BleDevice = {
  id: string;
  name: string | null;
  localName: string | null;
};

const DEVICE_NAME_PREFIX = 'Fluxion';
const BLE_STATE_POWERED_ON = 'PoweredOn';

let manager: BleManagerLike | null = null;

function getManager(): BleManagerLike | null {
  if (!manager) {
    try {
      const {BleManager} = require('react-native-ble-plx');
      manager = new BleManager();
    } catch {
      return null;
    }
  }
  return manager;
}

export async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(results).every(
      r => r === PermissionsAndroid.RESULTS.GRANTED,
    );
  }
  const loc = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return loc === PermissionsAndroid.RESULTS.GRANTED;
}

export async function isBleReady(): Promise<boolean> {
  try {
    const ble = getManager();
    if (!ble) return false;
    const state = await ble.state();
    return state === BLE_STATE_POWERED_ON;
  } catch {
    return false;
  }
}

export function createHandoffPayload(
  trackId: string,
  positionMs: number,
): HandoffPayload {
  return {
    sessionId: `ho-${Date.now()}`,
    trackId,
    positionMs,
    issuedAt: Date.now(),
  };
}

export async function applyHandoff(payload: HandoffPayload): Promise<void> {
  const track = getMockTrackById(payload.trackId);
  if (!track) {
    throw new Error('Morceau introuvable pour le handoff.');
  }
  await handoffPlay(track, payload.positionMs);
}

/** Envoie la lecture : code à 6 caractères (+ scan BLE optionnel) */
export async function sendHandoff(
  track: Track,
  positionMs: number,
): Promise<{code: string; bleActive: boolean}> {
  const payload = createHandoffPayload(track.id, positionMs);
  const code = await publishHandoffCode(payload);

  let bleActive = false;
  const granted = await requestBlePermissions();
  if (granted && (await isBleReady())) {
    bleActive = true;
    try {
      await scanNearbyDevices(() => {}, 3000);
    } catch {
      bleActive = false;
    }
  }

  void env.bleServiceUuid;
  return {code, bleActive};
}

export async function scanNearbyDevices(
  onDevice: (device: BleDevice) => void,
  timeoutMs = 8000,
): Promise<void> {
  const ble = getManager();
  if (!ble) {
    throw new Error('Bluetooth non disponible.');
  }
  const ready = await isBleReady();
  if (!ready) {
    throw new Error('Bluetooth désactivé.');
  }

  return new Promise((resolve, reject) => {
    const seen = new Set<string>();
    ble.startDeviceScan(
      null,
      {allowDuplicates: false},
      (error, device) => {
        if (error) {
          ble.stopDeviceScan();
          reject(error);
          return;
        }
        const name = device?.name ?? device?.localName ?? '';
        if (!name.startsWith(DEVICE_NAME_PREFIX)) {
          return;
        }
        if (device && !seen.has(device.id)) {
          seen.add(device.id);
          onDevice(device);
        }
      },
    );

    setTimeout(() => {
      ble.stopDeviceScan();
      resolve();
    }, timeoutMs);
  });
}
