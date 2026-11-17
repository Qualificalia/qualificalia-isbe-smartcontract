'use strict';
const assert = require('node:assert/strict');
const {BrowserProvider, ContractFactory, id, sha256, toUtf8Bytes} = require('ethers');
const hre = require('hardhat');
const qualificaliaArtifact = require('../build/QualificaliaHashTimestampHarness.json');
const facet = require('../build/QualificaliaHashTimestampFacet.json');

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
    assert.equal(await instance.businessIdIntrospection(), id('isbe.customers.qualificalia.documentRegistry.resolver.key'));
    assert.equal(await instance.businessIdIntrospection(), '0x1731c65d9dd332bcfd4ee398add0a7f786149f91a2dd48abc865b4ebeff1bb3b');
    const interfaceId = ['timestampHash(bytes32)', 'exists(bytes32)', 'getTimestamp(bytes32)']
      .map(signature => BigInt(id(signature).slice(0, 10)))
      .reduce((value, selector) => value ^ selector, 0n);
    assert.deepEqual([...await instance.interfacesIntrospection()], ['0x' + interfaceId.toString(16).padStart(8, '0')]);
    for (const name of ['timestampHash', 'exists', 'getTimestamp', 'HashTimestamped'])
      assert(facet.abi.some(x => x.name === name), name);
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
    const previous = digest('record before pause');
    await (await instance.connect(operator).timestampHash(previous)).wait();
    const previousTimestamp = await instance.getTimestamp(previous);
    await denied(instance.connect(stranger).timestampHash.staticCall(hash), 'AccountHasNoRole(address,bytes32)');
    await denied(instance.connect(stranger).mockSetPaused.staticCall(true), '0x08c379a0');
    await (await instance.mockSetPaused(true)).wait();
    await denied(instance.connect(operator).timestampHash.staticCall(hash), 'IsPaused()');
    assert.equal(await instance.exists(hash), false);
    assert.equal(await instance.exists(previous), true);
    assert.equal(await instance.getTimestamp(previous), previousTimestamp);
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

  it('enforces simulated role grants and revocations without erasing history', async function () {
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
