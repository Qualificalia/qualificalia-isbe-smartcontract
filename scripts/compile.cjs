'use strict';
const fs = require('node:fs');
const path = require('node:path');
const solc = require('solc');
const root = path.resolve(__dirname, '..');
const qualificaliaFacet = 'contracts/QualificaliaHashTimestampFacet.sol';
const qualificaliaHarness = 'test/QualificaliaHashTimestampHarness.sol';
const source = name => fs.readFileSync(path.join(root, name.startsWith('@') ? 'node_modules' : '', name), 'utf8');
if (!solc.version().startsWith('0.8.28+')) throw new Error('Expected pinned solc 0.8.28');
const input = {
  language: 'Solidity',
  sources: {
    [qualificaliaFacet]: {content: source(qualificaliaFacet)},
    [qualificaliaHarness]: {content: source(qualificaliaHarness)},
  },
  settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'istanbul',
    outputSelection: {'*': {'*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object', 'metadata']}} }
};
const importedSources = {};
const output = JSON.parse(solc.compile(JSON.stringify(input), {import(name) {
  try { const contents = source(name); importedSources[name] = {content: contents}; return {contents}; }
  catch (_) { return {error: 'Import not found: ' + name}; }
}}));
for (const diagnostic of output.errors || []) {
  if (diagnostic.severity === 'error') process.stderr.write(diagnostic.formattedMessage + '\n');
}
if ((output.errors || []).some(d => d.severity === 'error')) process.exit(1);
const outDir = path.join(root, 'build');
fs.mkdirSync(outDir, {recursive: true});
for (const [sourceName, contractName] of [
  [qualificaliaFacet, 'QualificaliaHashTimestampFacet'],
  [qualificaliaHarness, 'QualificaliaHashTimestampHarness'],
]) {
  const contract = output.contracts[sourceName][contractName];
  fs.writeFileSync(path.join(outDir, contractName + '.json'), JSON.stringify({
    contractName, sourceName, solc: solc.version(), optimizer: {enabled:true,runs:200}, evmVersion:'istanbul',
    abi: contract.abi, bytecode:'0x'+contract.evm.bytecode.object,
    deployedBytecode:'0x'+contract.evm.deployedBytecode.object, metadata: JSON.parse(contract.metadata)
  }, null, 2) + '\n');
}
const completeInput = {...input, sources: {...input.sources, ...importedSources}};
const reproduced = JSON.parse(solc.compile(JSON.stringify(completeInput)));
if ((reproduced.errors || []).some(d => d.severity === 'error') ||
    [[qualificaliaFacet, 'QualificaliaHashTimestampFacet'],
      [qualificaliaHarness, 'QualificaliaHashTimestampHarness']].some(([sourceName, contractName]) =>
      reproduced.contracts[sourceName][contractName].evm.bytecode.object !== output.contracts[sourceName][contractName].evm.bytecode.object)) {
  throw new Error('Self-contained Standard JSON Input failed bytecode reproduction');
}
fs.writeFileSync(path.join(outDir, 'standard-input.json'), JSON.stringify(completeInput, null, 2) + '\n');
console.log('Compiled Qualificalia ISBE facet and local-only harness with ' + solc.version());
