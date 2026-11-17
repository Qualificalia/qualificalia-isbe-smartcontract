'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const name of ['standard-input.json', 'QualificaliaHashTimestampFacet.json']) {
  const generated = fs.readFileSync(path.join(root, 'build', name));
  const delivered = fs.readFileSync(path.join(root, 'compilacion', name));
  if (!generated.equals(delivered)) {
    throw new Error(`${name} differs from the delivery artifact; review and regenerate compilacion/`);
  }
  console.log(`${name}: delivery matches the reproducible build`);
}
