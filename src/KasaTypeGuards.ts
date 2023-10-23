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

export type KasaGetDevicesResponse = {
  error_code: number;
  result: {
    deviceList: KasaDevice[];
  };
};

export type KasaToggleDeviceResponse = {
  error_code: number;
  result: {
    responseData: {
      system: {
        set_relay_state: {
          err_code: number;
        };
      };
    };
  };
};

export function isKasaDevice(json: unknown): json is KasaDevice {
  if (typeof json !== 'object' || json === null) {
    return false;
  }

  const {
    deviceType,
    role,
    fwVer,
    appServerUrl,
    deviceRegion,
    deviceId,
    deviceName,
    deviceHwVer,
    alias,
    deviceMac,
    oemId,
    deviceModel,
    hwId,
    fwId,
    isSameRegion,
    status,
  } = json as KasaDevice;

  return (
    typeof deviceType === 'string' &&
    typeof role === 'number' &&
    typeof fwVer === 'string' &&
    typeof appServerUrl === 'string' &&
    typeof deviceRegion === 'string' &&
    typeof deviceId === 'string' &&
    typeof deviceName === 'string' &&
    typeof deviceHwVer === 'string' &&
    typeof alias === 'string' &&
    typeof deviceMac === 'string' &&
    typeof oemId === 'string' &&
    typeof deviceModel === 'string' &&
    typeof hwId === 'string' &&
    typeof fwId === 'string' &&
    typeof isSameRegion === 'boolean' &&
    typeof status === 'number'
  );
}

export function isKasaGetDevicesResponse(json: unknown): json is KasaGetDevicesResponse {
  if (typeof json !== 'object' || json === null) {
    console.error('KasaGetDevicesResponse: json is not an object', json);
    return false;
  }

  const { error_code, result } = json as KasaGetDevicesResponse;

  if (typeof error_code !== 'number' || typeof result !== 'object' || result === null) {
    console.error('KasaGetDevicesResponse: error_code or result is not the correct type', error_code, result);
    return false;
  }

  const { deviceList } = result;

  if (!Array.isArray(deviceList)) {
    console.error('KasaGetDevicesResponse: deviceList is not an array', deviceList);
    return false;
  }

  for (const device of deviceList) {
    if (!isKasaDevice(device)) {
      console.error('KasaGetDevicesResponse: device is not a KasaDevice', device);
      return false;
    }
  }

  return true;
}

export function isKasaToggleDeviceResponse(json: unknown): json is KasaToggleDeviceResponse {
  if (typeof json !== 'object' || json === null) {
    console.error('KasaToggleDeviceResponse: json is not an object', json);
    return false;
  }

  const { error_code, result } = json as KasaToggleDeviceResponse;

  if (typeof error_code !== 'number' || typeof result !== 'object' || result === null) {
    console.error('KasaToggleDeviceResponse: error_code or result is not the correct type', error_code, result);
    return false;
  }

  const { responseData } = result;

  if (typeof responseData !== 'object' || responseData === null) {
    console.error('KasaToggleDeviceResponse: responseData is not the correct type', responseData);
    return false;
  }

  const { system } = responseData;

  if (typeof system !== 'object' || system === null) {
    console.error('KasaToggleDeviceResponse: system is not the correct type', system);
    return false;
  }

  const { set_relay_state } = system;

  if (typeof set_relay_state !== 'object' || set_relay_state === null) {
    console.error('KasaToggleDeviceResponse: set_relay_state is not the correct type', set_relay_state);
    return false;
  }

  const { err_code } = set_relay_state;

  if (typeof err_code !== 'number') {
    console.error('KasaToggleDeviceResponse: err_code is not the correct type', err_code);
    return false;
  }

  return true;
}
