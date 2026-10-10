import{test}from'node:test';import assert from'node:assert/strict';import{summarizeRun}from'../learner/report.mjs';
test('empty or interrupted runs cannot pass',()=>{assert.equal(summarizeRun([]).status,'error');assert.equal(summarizeRun([{status:'passed'},{status:'error'}]).status,'error');});
test('reports preserve failed assertions',()=>{assert.deepEqual(summarizeRun([{status:'passed'},{status:'failed'}]),{status:'failed',passed:1,total:2,label:'An expected result is missing'});assert.equal(summarizeRun([{status:'passed'}]).status,'passed');});
