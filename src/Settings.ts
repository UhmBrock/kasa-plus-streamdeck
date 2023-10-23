import { isSomething } from 'ts-type-guards';

export function isSettings(value: unknown): value is Settings {
  const result =
    (value as Settings).hasOwnProperty('bearerToken') &&
    isSomething((value as Settings).bearerToken) &&
    (value as Settings).hasOwnProperty('deviceList') &&
    isSomething((value as Settings).deviceList) &&
    (value as Settings).hasOwnProperty('selectedDeviceId') &&
    isSomething((value as Settings).selectedDeviceId);

  if (!result) {
    console.error('Settings TypeGuard Failed!', value);
  }

  return result;
}

export type Settings = {
  bearerToken: string;
  deviceList: string;
  selectedDeviceId: string;
};
