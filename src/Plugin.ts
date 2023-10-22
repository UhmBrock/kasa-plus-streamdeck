import { Streamdeck } from '@rweich/streamdeck-ts';

import { isSettings, Settings } from './Settings';

export type KasaDevice = {
  deviceType: string;
  role: number;
  fwVer: string;
  appServerUrl: string;
  deviceRegion: string;
  deviceId: string;
  deviceName: string;
  deviceHwVer: string;
  alias: string;
  deviceMac: string;
  oemId: string;
  deviceModel: string;
  hwId: string;
  fwId: string;
  isSameRegion: boolean;
  status: number;
};

export type KasaQueryResponse = {
  error_code: number;
  result: {
    deviceList: KasaDevice[];
  };
};

const plugin = new Streamdeck().plugin();

// Keep track of the state of all actions based on their context
const bearerTokenCache: Record<string, string> = {};
const deviceListCache: Record<string, KasaDevice[]> = {};
const keypressTimerCache: Record<string, NodeJS.Timeout> = {};

const DEFAULT_KASA_BASE_URL = 'https://wap.tplinkcloud.com';

/*
 * Helper Functions
 */

const getBearerToken = (context: string): string => bearerTokenCache[context] || '';
const getDeviceList = (context: string): KasaDevice[] => deviceListCache[context] || [];

function changeBearerToken(bearerToken: string, context: string): void {
  bearerTokenCache[context] = bearerToken;
}

function changeDeviceList(deviceList: KasaDevice[], context: string): void {
  deviceListCache[context] = deviceList;
}

function updateDeviceList(context: string): void {
  const bearerToken = getBearerToken(context);

  if (bearerToken === '') {
    plugin.showAlert(context);
    console.error('No bearer token set');
    return;
  }

  const url = new URL(DEFAULT_KASA_BASE_URL);
  url.searchParams.append('token', bearerToken);

  console.debug('Fetching device list from', url.toString());

  fetch(url.toString(), {
    body: JSON.stringify({
      method: 'getDeviceList',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((response) => response.json())
    .then((json: KasaQueryResponse) => {
      if (json.error_code !== 0) {
        console.error('Error fetching device list:', json);
        return json;
      }

      changeDeviceList(json.result.deviceList, context);
      return json;
    })
    .finally(() => {
      saveSettings(context);
    })
    .catch((error) => {
      console.error(error);
      plugin.showAlert(context);
      throw error;
    });
}

function startKeypressTimer(context: string): void {
  keypressTimerCache[context] = setTimeout(() => {
    actionLongPress(context);
    delete keypressTimerCache[context];
    saveSettings(context);
  }, 1500);
}

function clearKeypressTimer(context: string): void {
  clearTimeout(keypressTimerCache[context]);
  delete keypressTimerCache[context];
}

function saveSettings(context: string): void {
  plugin.setSettings(context, {
    bearerToken: getBearerToken(context),
    deviceList: JSON.stringify(getDeviceList(context)),
  } as Settings);
}

function isLongPress(context: string): boolean {
  return keypressTimerCache[context] === undefined;
}

/*
 * Action Handlers
 */

function actionShortPress(context: string): void {
  // ? handle short press here
  return;
}

function actionLongPress(context: string): void {
  // ? handle long press here
  updateDeviceList(context);
  return;
}

/*
 * Event Listeners
 */

plugin.on('willAppear', ({ context }) => {
  // Request Saved State
  plugin.getSettings(context);

  // display the initial state of the action
  changeBearerToken(getBearerToken(context), context);
  changeDeviceList(getDeviceList(context), context);
});

// Gets called after getSettings request completes, and whenever the user changes the settings in the property inspector
plugin.on('didReceiveSettings', ({ context, settings }) => {
  if (isSettings(settings)) {
    bearerTokenCache[context] = settings.bearerToken;
    deviceListCache[context] = JSON.parse(settings.deviceList);
  }

  // updateDeviceList(context);
});

// reset our caches when an action gets removed
plugin.on('willDisappear', ({ context }) => {
  delete bearerTokenCache[context];
  delete deviceListCache[context];
  delete keypressTimerCache[context];
});

/*
 * Event Emitters
 */

plugin.on('keyDown', ({ context }) => {
  startKeypressTimer(context);
});

plugin.on('keyUp', ({ context }) => {
  if (isLongPress(context)) {
    return;
  }

  clearKeypressTimer(context);
  actionShortPress(context);
});

plugin.on('touchTap', ({ context }) => {
  saveSettings(context);
});

plugin.on('dialPress', ({ context }) => {
  saveSettings(context);
});

plugin.on('dialRotate', ({ context, ticks }) => {
  saveSettings(context);
});

export default plugin;
