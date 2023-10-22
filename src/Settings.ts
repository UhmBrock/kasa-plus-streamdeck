import { isSomething } from 'ts-type-guards';

export function isSettings(value: unknown): value is Settings {
  return (
    (value as Settings).hasOwnProperty('bearerToken') &&
    isSomething((value as Settings).bearerToken) &&
    (value as Settings).hasOwnProperty('deviceList') &&
    isSomething((value as Settings).deviceList)
  );
}

export type Settings = {
  bearerToken: string;
  deviceList: string;
};
