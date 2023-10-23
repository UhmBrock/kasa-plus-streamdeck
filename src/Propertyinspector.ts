import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { Streamdeck } from '@rweich/streamdeck-ts';

import KasaApi from './KasaApi';
import { KasaDevice } from './KasaTypeGuards';
import { isSettings, Settings } from './Settings';

const pi = new Streamdeck().propertyinspector();
let builder: FormBuilder<Settings> | undefined;

pi.on('websocketOpen', ({ uuid }) => pi.getSettings(uuid));

pi.on('didReceiveSettings', ({ settings }) => {
  if (builder === undefined) {
    const initialData: Settings = isSettings(settings)
      ? settings
      : { bearerToken: '', deviceList: '[]', selectedDeviceId: '' };
    builder = new FormBuilder<Settings>(initialData);

    builder.addHtml(
      builder
        .createDetails()
        .addSummary('How to get a bearer token')
        .addParagraph("Send a post request to 'https://wap.tplinkcloud.com' with the following body:")
        .addParagraph(
          `{
            "method": "login",
            "params": {
              "appType": "Kasa_Android",
              "cloudUserName": "yourEmail@here",
              "cloudPassword": "yourpasswordhere",
              "terminalUUID": "generatedUUIDhere"
            }
          }`,
        ),
    );

    const bearerTokenTextfield = builder.createInput().setLabel('Bearer Token');

    const devicesDropdown = builder.createDropdown().setLabel('deviceList');
    devicesDropdown.addOption('Select a device', '');

    const devices: KasaDevice[] = JSON.parse(initialData.deviceList) ?? [];

    for (const device of devices) {
      devicesDropdown.addOption(device.alias, device.deviceId);
    }

    builder.addElement('bearerToken', bearerTokenTextfield);
    builder.addElement('selectedDeviceId', devicesDropdown);
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
