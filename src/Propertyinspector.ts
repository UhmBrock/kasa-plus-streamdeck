import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { Streamdeck } from '@rweich/streamdeck-ts';

import { isSettings, Settings } from './Settings';

const pi = new Streamdeck().propertyinspector();
let builder: FormBuilder<Settings> | undefined;

pi.on('websocketOpen', ({ uuid }) => pi.getSettings(uuid)); // trigger the didReceiveSettings event

pi.on('didReceiveSettings', ({ settings }) => {
  if (builder === undefined) {
    const initialData: Settings = isSettings(settings) ? settings : { number: '0', step: '1' };
    builder = new FormBuilder<Settings>(initialData);

    const numbers = builder.createDropdown().setLabel('Change Value');
    for (const [index] of Array.from({ length: 10 }).entries()) {
      numbers.addOption(index.toString(), index.toString());
    }

    // element name has to correspond with property on Settings object
    builder.addElement('number', numbers);
    builder.addElement(
      'step',
      builder.createDropdown().setLabel('Step').addOption('1', '1').addOption('2', '2').addOption('3', '3'),
    );

    builder.appendTo(document.querySelector('.sdpi-wrapper') ?? document.body);

    builder.on('change-settings', () => {
      if (pi.pluginUUID === undefined) {
        console.error('pi has no uuid! is it registered already?', pi.pluginUUID);
        return;
      }
      pi.setSettings(pi.pluginUUID, builder?.getFormData());
    });
  } else if (isSettings(settings)) {
    builder.setFormData(settings);
  }
});

export default pi;
