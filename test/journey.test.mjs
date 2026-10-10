import{test}from'node:test';import assert from'node:assert/strict';import{selectJourneys}from'../learner/journey.mjs';
test('selection preserves user order and requires known unique journeys',()=>{assert.deepEqual(selectJourneys(['menu','signup']).map(j=>j.id),['menu','signup']);for(const input of [[],['bogus'],['search','search'],['__proto__'],'search',null])assert.throws(()=>selectJourneys(input));});
test('mobile journey uses the narrow viewport and an explicit assertion',()=>{const [j]=selectJourneys(['menu']);assert.equal(j.width,375);assert.equal(j.steps.at(-1).type,'expect');});
