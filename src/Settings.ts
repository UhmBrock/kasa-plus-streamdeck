import { isSomething } from 'ts-type-guards';

export function isSettings(value: unknown): value is Settings {
  return (
    (value as Settings).hasOwnProperty('number') &&
    isSomething((value as Settings).number) &&
    (value as Settings).hasOwnProperty('step') &&
    isSomething((value as Settings).step)
  );
}

export type Settings = {
  number: string;
  step: string;
};
