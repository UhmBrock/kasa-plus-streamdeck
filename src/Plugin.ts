import { Streamdeck } from '@rweich/streamdeck-ts';

import KasaApi from './KasaApi';
import { KasaDevice } from './KasaTypeGuards';
import { isSettings, Settings } from './Settings';

const plugin = new Streamdeck().plugin();

// Keep track of the state of all actions based on their context
const bearerTokenCache: Record<string, string> = {};
const deviceListCache: Record<string, KasaDevice[]> = {};
const selectedDeviceIdCache: Record<string, string> = {};
const keypressTimerCache: Record<string, NodeJS.Timeout> = {};

/*
 * Helper Functions
 */

const getBearerToken = (context: string): string => bearerTokenCache[context] || '';
const getDeviceList = (context: string): KasaDevice[] => deviceListCache[context] || [];
const getSelectedDeviceId = (context: string): string => selectedDeviceIdCache[context] || '';

const getSelectedDevice = (context: string): KasaDevice | undefined => {
  const deviceId = selectedDeviceIdCache[context] || '';

  if (deviceId === '') {
    console.error('No device selected');
    return undefined;
  }

  return getDeviceList(context).find((device) => device.deviceId === deviceId);
};

function changeBearerToken(bearerToken: string, context: string): void {
  bearerTokenCache[context] = bearerToken;
}

function changeDeviceList(deviceList: KasaDevice[], context: string): void {
  deviceListCache[context] = deviceList;
}

function changeSelectedDeviceId(deviceId: string, context: string): void {
  selectedDeviceIdCache[context] = deviceId;
}

async function updateDeviceList(context: string): Promise<void> {
  const bearerToken = getBearerToken(context);

  if (bearerToken === '') {
    plugin.showAlert(context);
    console.error('No bearer token set');
    return;
  }

  const devices = await KasaApi.getDevices(bearerToken).catch((error) => {
    console.error(error);
    plugin.showAlert(context);
    throw error;
  });

  changeDeviceList(devices, context);
  saveSettings(context);
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
    selectedDeviceId: getSelectedDeviceId(context),
  } as Settings);
}

function isLongPress(context: string): boolean {
  return keypressTimerCache[context] === undefined;
}

/*
 * Action Handlers
 */

function actionShortPress(context: string): void {
  const bearerToken = getBearerToken(context);
  const device = getSelectedDevice(context);

  if (bearerToken === '') {
    plugin.showAlert(context);
    console.error('No bearer token set');
    return;
  }

  if (device === undefined) {
    plugin.showAlert(context);
    console.error('No device selected');
    return;
  }

  KasaApi.toggleDevice(device, bearerToken)
    .then((response) => {
      console.debug('Response from toggleDevice:', response);
      plugin.showOk(context);
      return response;
    })
    .catch((error) => {
      console.error(error);
      plugin.showAlert(context);
    });
}

function actionLongPress(context: string): void {
  updateDeviceList(context)
    .then(() => {
      plugin.showOk(context);
      return;
    })
    .catch((error) => {
      console.error(error);
      plugin.showAlert(context);
    });
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
  changeSelectedDeviceId(getSelectedDeviceId(context), context);
});

// Gets called after getSettings request completes, and whenever the user changes the settings in the property inspector
plugin.on('didReceiveSettings', ({ context, settings }) => {
  if (isSettings(settings)) {
    try {
      changeBearerToken(settings.bearerToken, context);
      changeDeviceList(JSON.parse(settings.deviceList), context);
      changeSelectedDeviceId(settings.selectedDeviceId, context);
      console.debug('Settings parsed successfully');
      console.debug('bearerToken:', bearerTokenCache[context]);
      console.debug('deviceList:', deviceListCache[context]);
      console.debug('selectedDeviceId:', selectedDeviceIdCache[context]);
    } catch (error) {
      console.error('Error parsing settings:', error);
    }
  }

  updateDeviceList(context);
});

// reset our caches when an action gets removed
plugin.on('willDisappear', ({ context }) => {
  delete bearerTokenCache[context];
  delete deviceListCache[context];
  delete selectedDeviceIdCache[context];
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
