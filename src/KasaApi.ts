import {
  isKasaGetDevicesResponse,
  isKasaToggleDeviceResponse,
  KasaDevice,
  KasaGetDevicesResponse,
  KasaToggleDeviceResponse,
} from './KasaTypeGuards';

const DEFAULT_KASA_BASE_URL = 'https://wap.tplinkcloud.com';

async function getDevices(bearerToken: string): Promise<KasaDevice[]> {
  const url = new URL(DEFAULT_KASA_BASE_URL);
  url.searchParams.append('token', bearerToken);

  console.debug('Fetching device list from', url.toString());

  return fetch(url.toString(), {
    body: JSON.stringify({
      method: 'getDeviceList',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((response) => response.json())
    .then((json: object) => {
      if (!isKasaGetDevicesResponse(json)) {
        throw new Error('Invalid response from Kasa API', json);
      }
      if (json.error_code !== 0) {
        throw new Error(`Error code received whilefetching device list: ${json}`);
      }

      return json.result.deviceList;
    });
}

async function toggleDevice(device: KasaDevice, bearerToken: string): Promise<KasaToggleDeviceResponse> {
  const url = new URL(device.appServerUrl);
  url.searchParams.append('token', bearerToken);

  console.log('Toggling device', device.alias, 'at', url.toString(), 'to', device.status === 1 ? 'off' : 'on');

  return await fetch(url.toString(), {
    body: JSON.stringify({
      method: 'passthrough',
      params: {
        deviceId: device.deviceId,
        requestData: {
          system: {
            set_relay_state: {
              state: device.status === 1 ? 0 : 1,
            },
          },
        },
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((response) => response.json())
    .then((json: object) => {
      if (!isKasaToggleDeviceResponse(json)) {
        throw new Error('Invalid response from Kasa API', json);
      }
      if (json.error_code !== 0) {
        throw new Error(`Error code received while toggling device: ${json}`);
      }

      return json;
    });
}

const KasaApi = {
  getDevices,
  toggleDevice,
};

export default KasaApi;
