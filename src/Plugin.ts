import { Streamdeck } from '@rweich/streamdeck-ts';

import { isSettings } from './Settings';

const plugin = new Streamdeck().plugin();

// Keep track of the state of all actions based on their context

const numberCache: Record<string, number> = {};
const stepCache: Record<string, number> = {};
const keypressTimerCache: Record<string, NodeJS.Timeout> = {};

/*
 * Helper Functions
 */

const getNumber = (context: string): number => numberCache[context] || 0;
const getStep = (context: string): number => stepCache[context] || 1;

function changeNumber(number: number, context: string): void {
  number = number;
  if (number < 0) {
    number = 0;
  }
  numberCache[context] = number;
  plugin.setTitle(String(number), context);
  plugin.setFeedback({ indicator: { value: number }, value: String(number) }, context);
}

function changeStep(step: number, context: string): void {
  stepCache[context] = ((step - 1) % 3) + 1;
  plugin.setFeedback({ title: `Step: ${stepCache[context]}` }, context);
}

function startKeypressTimer(context: string): void {
  keypressTimerCache[context] = setTimeout(() => {
    changeNumber(0, context);
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
    number: String(getNumber(context)),
    step: String(getStep(context)),
  });
}

/*
 * Event Listeners
 */

plugin.on('willAppear', ({ context }) => {
  // Request Saved State
  plugin.getSettings(context);

  // display the initial state of the action
  changeNumber(getNumber(context), context);
  changeStep(getStep(context), context);
});

// Gets called after getSettings request completes, and whenever the user changes the settings in the property inspector
plugin.on('didReceiveSettings', ({ context, settings }) => {
  if (isSettings(settings)) {
    changeNumber(Number(settings.number), context);
    changeStep(Number(settings.step), context);
  }
});

// reset our caches when an action gets removed
plugin.on('willDisappear', ({ context }) => {
  delete numberCache[context];
  delete stepCache[context];
});

/*
 * Action Handlers / Event Dispatchers
 */

plugin.on('keyDown', ({ context }) => {
  startKeypressTimer(context);
});

plugin.on('keyUp', ({ context }) => {
  if (keypressTimerCache[context] === undefined) {
    return;
  }

  clearKeypressTimer(context);
  changeNumber(getNumber(context) + getStep(context), context);
  saveSettings(context);
});

plugin.on('touchTap', ({ context }) => {
  changeNumber(getNumber(context) + getStep(context), context);
  saveSettings(context);
});

plugin.on('dialPress', ({ context }) => {
  changeNumber(0, context);
  saveSettings(context);
});

plugin.on('dialRotate', ({ context, ticks }) => {
  changeNumber(getNumber(context) + ticks * getStep(context), context);
  saveSettings(context);
});

export default plugin;
