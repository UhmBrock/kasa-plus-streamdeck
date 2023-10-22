import { existsSync } from 'node:fs';
import * as path from 'node:path';

import { readFileSync, writeFileSync } from 'jsonfile';

import { manifestNs } from './manifest';

const version = process.argv[2];
if (version === undefined) {
  console.error('\n❌ Usage: yarn set-plugin-version <VERSION>\n');
  process.exit();
}

let manifestPath: string = path.join(__dirname, '../../dist/' + manifestNs + '.sdPlugin/manifest.json');
if (!existsSync(manifestPath)) {
  manifestPath = path.join(__dirname, '../../dist/dev.' + manifestNs + '.sdPlugin/manifest.json');
}

if (!existsSync(manifestPath)) {
  console.error('❌ could not find manifest.json in prod OR dev dist directories');
  process.exit(1);
}

console.info('📦 setting version to ' + version + ' ...');
let json = readFileSync(manifestPath);
json.Version = version;
writeFileSync(manifestPath, json, { spaces: 2 });

json = readFileSync(manifestPath);
if (json.Version !== version) {
  console.error('❌ unknown error on writing version to file ' + manifestPath);
  process.exit(1);
}
console.info('✅ version set in file ' + path.relative(process.cwd(), manifestPath));
