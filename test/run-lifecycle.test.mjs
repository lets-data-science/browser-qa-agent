import test from 'node:test';
import assert from 'node:assert/strict';
import { finalizeRun } from '../lib/run-lifecycle.mjs';

test('the next run cannot appear ready while Chrome or report saving is unfinished', async () => {
  let close, save;
  const run = { status: 'running', journeys: [] };
  let notified = false;
  const finishing = finalizeRun(run, { status: 'passed' }, {
    close: () => new Promise(resolve => { close = resolve; }),
    persist: (report) => {
      assert.equal(report.status, 'passed');
      return new Promise(resolve => { save = resolve; });
    },
  }, () => { notified = true; });
  assert.equal(run.status, 'running');
  close();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(run.status, 'running');
  assert.equal(notified, false);
  save();
  await finishing;
  assert.equal(run.status, 'passed');
  assert.equal(notified, true);
});

test('failed evidence persistence cannot publish a successful result', async () => {
  const run = { status: 'running' };
  await assert.rejects(finalizeRun(run, { status: 'passed' }, {
    close: async () => {},
    persist: async () => { throw new Error('Disk unavailable'); },
  }), /Disk unavailable/);
  assert.equal(run.status, 'running');
});
