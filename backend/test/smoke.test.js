const test = require('node:test');
const assert = require('node:assert/strict');

test('node runtime is available', () => {
  assert.equal(typeof process.version, 'string');
});
