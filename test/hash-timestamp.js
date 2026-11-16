'use strict';
const assert = require('node:assert/strict');
const {BrowserProvider, ContractFactory, id, sha256, toUtf8Bytes} = require('ethers');
const hre = require('hardhat');
const artifact = require('../build/HashTimestampHarness.json');
const official = require('../build/HashTimestampFacet.json');
const qualificaliaArtifact = require('../build/QualificaliaHashTimestampHarness.json');
const officialInterface = require('../build/HashTimestampFacet.json');

describe('Official ISBE HashTimestamp 0.2.1 (MOCK governance only)', function () {
  let provider, admin, operator, stranger, instance;
  beforeEach(async function () {
    provider = new BrowserProvider(hre.network.provider);
    provider.pollingInterval = 10;
    admin = await provider.getSigner(0);
    operator = await provider.getSigner(1);
    stranger = await provider.getSigner(2);
    instance = await new ContractFactory(artifact.abi, artifact.bytecode, admin).deploy(await operator.getAddress());
    await instance.waitForDeployment();
  });
  const digest = x => sha256(toUtf8Bytes(x));
  const denied = async (operation, expected) => assert.rejects(operation, error => {
    const data = error.data || error.info?.error?.data;
    const selector = expected.startsWith('0x') ? expected : id(expected).slice(0, 10);
    return error.code === 'CALL_EXCEPTION' && typeof data === 'string' && data.startsWith(selector);
  });
  it('exposes the exact official selector set', async function () {
    const declared = await instance.selectorsIntrospection();
    const required = ['timestampHash(bytes32)', 'exists(bytes32)', 'getTimestamp(bytes32)'].map(x => id(x).slice(0, 10));
    assert.deepEqual([...declared].sort(), required.sort());
    for (const name of ['timestampHash', 'exists', 'getTimestamp', 'HashTimestamped'])
      assert(official.abi.some(x => x.name === name), name);
  });
  it('records independent PDF and credential hashes and emits the signer', async function () {
    const pdf = digest('synthetic signed pdf'), edc = digest('synthetic signed edci');
    assert.notEqual(pdf, edc);
    for (const value of [pdf, edc]) {
      assert.equal(await instance.exists(value), false);
      const receipt = await (await instance.connect(operator).timestampHash(value)).wait();
      const parsed = receipt.logs.map(x => { try { return instance.interface.parseLog(x); } catch { return null; } }).find(x => x && x.name === 'HashTimestamped');
      assert.equal(parsed.args.hash, value);
      assert.equal(parsed.args.sender, await operator.getAddress());
      assert.equal(await instance.exists(value), true);
      assert.equal(await instance.getTimestamp(value), parsed.args.timestamp);
      assert(parsed.args.timestamp > 0n);
    }
  });
  it('rejects unauthorized writers and duplicates without changing evidence', async function () {
    const value = digest('duplicate');
    await denied(instance.connect(stranger).timestampHash.staticCall(value), 'AccountHasNoRole(address,bytes32)');
    await (await instance.connect(operator).timestampHash(value)).wait();
    const timestamp = await instance.getTimestamp(value);
    await denied(instance.connect(operator).timestampHash.staticCall(value), 'HashAlreadyExists(bytes32)');
    assert.equal(await instance.getTimestamp(value), timestamp);
  });
  it('pauses writes, keeps reads, and restores authorized writes', async function () {
    const existing = digest('before pause'), next = digest('after pause');
    await (await instance.connect(operator).timestampHash(existing)).wait();
    await denied(instance.connect(stranger).mockSetPaused.staticCall(true), '0x08c379a0');
    await (await instance.mockSetPaused(true)).wait();
    assert.equal(await instance.mockPaused(), true);
    await denied(instance.connect(operator).timestampHash.staticCall(next), 'IsPaused()');
    assert.equal(await instance.exists(existing), true);
    assert((await instance.getTimestamp(existing)) > 0n);
    await (await instance.mockSetPaused(false)).wait();
    await (await instance.connect(operator).timestampHash(next)).wait();
    assert.equal(await instance.exists(next), true);
  });
  it('enforces mock role grants and revocations without erasing history', async function () {
    const a = digest('role-a'), b = digest('role-b');
    await (await instance.connect(operator).timestampHash(a)).wait();
    await denied(instance.connect(stranger).mockSetOperator.staticCall(await stranger.getAddress(), true), '0x08c379a0');
    await (await instance.mockSetOperator(await operator.getAddress(), false)).wait();
    await denied(instance.connect(operator).timestampHash.staticCall(b), 'AccountHasNoRole(address,bytes32)');
    await (await instance.mockSetOperator(await stranger.getAddress(), true)).wait();
    await (await instance.connect(stranger).timestampHash(b)).wait();
    assert.equal(await instance.exists(a), true);
    assert.equal(await instance.exists(b), true);
  });
});

describe('Qualificalia HashTimestamp ISBE facet (MOCK governance only)', function () {
  let provider, admin, operator, stranger, instance;
  beforeEach(async function () {
    provider = new BrowserProvider(hre.network.provider);
    provider.pollingInterval = 10;
    admin = await provider.getSigner(0);
    operator = await provider.getSigner(1);
    stranger = await provider.getSigner(2);
    instance = await new ContractFactory(qualificaliaArtifact.abi, qualificaliaArtifact.bytecode, admin)
      .deploy(await operator.getAddress());
    await instance.waitForDeployment();
  });
  const digest = value => sha256(toUtf8Bytes(value));
  const denied = async (operation, expected) => assert.rejects(operation, error => {
    const data = error.data || error.info?.error?.data;
    const selector = expected.startsWith('0x') ? expected : id(expected).slice(0, 10);
    return error.code === 'CALL_EXCEPTION' && typeof data === 'string' && data.startsWith(selector);
  });

  it('keeps the official HashTimestamp interface and exposes its own provisional business ID', async function () {
    const selectors = await instance.selectorsIntrospection();
    const required = ['timestampHash(bytes32)', 'exists(bytes32)', 'getTimestamp(bytes32)'].map(x => id(x).slice(0, 10));
    assert.deepEqual([...selectors].sort(), required.sort());
    assert.notEqual(await instance.businessIdIntrospection(), '0x' + '00'.repeat(32));
    const interfaceId = ['timestampHash(bytes32)', 'exists(bytes32)', 'getTimestamp(bytes32)']
      .map(signature => BigInt(id(signature).slice(0, 10)))
      .reduce((value, selector) => value ^ selector, 0n);
    assert.deepEqual([...await instance.interfacesIntrospection()], ['0x' + interfaceId.toString(16).padStart(8, '0')]);
    for (const name of ['timestampHash', 'exists', 'getTimestamp', 'HashTimestamped'])
      assert(officialInterface.abi.some(x => x.name === name), name);
  });

  it('registers certificate and credential hashes from the authorized Qualificalia operator', async function () {
    const certificateHash = digest('synthetic final signed PDF');
    const credentialHash = digest('synthetic final signed credential');
    assert.notEqual(certificateHash, credentialHash);

    for (const hash of [certificateHash, credentialHash]) {
      assert.equal(await instance.exists(hash), false);
      const receipt = await (await instance.connect(operator).timestampHash(hash)).wait();
      const event = receipt.logs.map(log => {
        try { return instance.interface.parseLog(log); } catch { return null; }
      }).find(parsed => parsed && parsed.name === 'HashTimestamped');
      assert.equal(event.args.hash, hash);
      assert.equal(event.args.sender, await operator.getAddress());
      assert.equal(await instance.exists(hash), true);
      assert.equal(await instance.getTimestamp(hash), event.args.timestamp);
      assert(event.args.timestamp > 0n);
    }
  });

  it('rejects writes from other accounts and while paused, without changing reads', async function () {
    const hash = digest('access-control check');
    await denied(instance.connect(stranger).timestampHash.staticCall(hash), 'AccountHasNoRole(address,bytes32)');
    await (await instance.mockSetPaused(true)).wait();
    await denied(instance.connect(operator).timestampHash.staticCall(hash), 'IsPaused()');
    assert.equal(await instance.exists(hash), false);
    await (await instance.mockSetPaused(false)).wait();
    await (await instance.connect(operator).timestampHash(hash)).wait();
    assert.equal(await instance.exists(hash), true);
  });

  it('rejects a duplicate without changing its original timestamp', async function () {
    const hash = digest('duplicate record');
    await (await instance.connect(operator).timestampHash(hash)).wait();
    const firstTimestamp = await instance.getTimestamp(hash);
    await denied(instance.connect(operator).timestampHash.staticCall(hash), 'HashAlreadyExists(bytes32)');
    assert.equal(await instance.getTimestamp(hash), firstTimestamp);
  });
});
