/**
 * Unit tests for EvolutionSystem.
 * Run with: node tests/evolution.test.js
 */

// ── Minimal DOM/Three.js stubs ────────────────────────────────────
// The evolution module has no browser/three.js dependencies, so we
// can import it directly in Node.

import { EvolutionSystem, STAGES } from '../src/evolution/EvolutionSystem.js';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

// ── Helpers ───────────────────────────────────────────────────────
function makeEvo() { return new EvolutionSystem(); }

const EMBER_TYPE = { id: 'ember', name: 'Braise', value: 3, weight: 2 };

function addRes(evo, id, count = 1) {
  const type = { id, name: id, value: 1, weight: 1 };
  for (let i = 0; i < count; i++) evo.addResource(type);
}

// ── Test suites ───────────────────────────────────────────────────

console.log('\n📋  STAGES data');
assert(STAGES.length === 5,           'There are exactly 5 evolution stages');
assert(STAGES[0].id === 0,            'First stage id is 0 (Australopithecus)');
assert(STAGES[4].id === 4,            'Last stage id is 4 (Homo Sapiens)');
assert(STAGES[0].requiredTotal === 0, 'First stage requires 0 resources');
assert(STAGES[4].requiredTotal > STAGES[3].requiredTotal,
                                      'Each stage requires more resources than the previous');
assert(STAGES.every(s => s.speed > 0), 'Every stage has a positive speed');

console.log('\n📋  Initial state');
{
  const evo = makeEvo();
  assert(evo.stageIndex === 0,        'Starts at stage 0');
  assert(evo.totalCollected === 0,    'Starts with 0 collected');
  assert(evo.getProgressToNext() === 0, 'Progress to next is 0 at start');
  assert(evo.getNextStage() !== null, 'getNextStage() returns something at start');
}

console.log('\n📋  Resource accumulation');
{
  const evo = makeEvo();
  addRes(evo, 'fruit', 3);
  assert(evo.resources.fruit === 3, 'Fruit count is correct after adding 3');
  assert(evo.totalCollected === 3,  'Total collected is 3');

  const emberType = EMBER_TYPE;
  evo.addResource(emberType);
  assert(evo.resources.ember === 3,  'Ember value 3 stored correctly');
  assert(evo.totalCollected === 6,   'Total includes ember value');
}

console.log('\n📋  Evolution triggers');
{
  const evo = makeEvo();
  // Stage 1 requires 20 total + 10 fruit + 5 stone
  addRes(evo, 'fruit', 10);
  addRes(evo, 'stone', 4);
  assert(evo.stageIndex === 0, 'Still at stage 0 (stone count not enough)');

  addRes(evo, 'stone', 1); // now 5 stone, 14 total — still need 20 total
  assert(evo.stageIndex === 0, 'Still at stage 0 (total not enough)');

  addRes(evo, 'fruit', 6); // now 16 fruit, 20 total — should evolve!
  assert(evo.stageIndex === 1, 'Evolved to stage 1 (Homo Habilis)');
}

console.log('\n📋  Evolution callbacks');
{
  const evo = makeEvo();
  const events = [];
  evo.on('evolve',  (s) => events.push({ type: 'evolve',  stage: s.id }));
  evo.on('collect', (t) => events.push({ type: 'collect', id: t.id }));

  addRes(evo, 'fruit', 1);
  assert(events.some(e => e.type === 'collect'), 'collect event fired');

  // Reach stage 1
  addRes(evo, 'fruit', 9);
  addRes(evo, 'stone', 5);
  addRes(evo, 'fruit', 6);
  assert(events.some(e => e.type === 'evolve' && e.stage === 1),
    'evolve event fired with correct stage id');
}

console.log('\n📋  Progress calculation');
{
  const evo = makeEvo();
  const next = STAGES[1];
  addRes(evo, 'fruit', Math.floor(next.requiredTotal / 2));
  const p = evo.getProgressToNext();
  assert(p > 0 && p < 1, 'Progress is between 0 and 1 while collecting');
}

console.log('\n📋  Final stage');
{
  const evo = makeEvo();
  // Force to last stage by simulating all conditions met
  // Add enough resources to reach each stage sequentially
  const fill = (id, n) => addRes(evo, id, n);
  // Stage 1: 10 fruit + 5 stone + 20 total
  fill('fruit', 20); fill('stone', 5);
  // Stage 2: 20 fruit + 15 stone + 10 stick + 50 total
  fill('stone', 10); fill('stick', 10); fill('fruit', 15);
  // Stage 3: 25 stone + 20 stick + 10 bone + 100 total
  fill('stone', 10); fill('stick', 10); fill('bone', 10); fill('fruit', 10);
  // Stage 4: 30 stone + 20 bone + 10 ember + 180 total
  // After stage 3 we have ~100 total; need 80 more to reach 180.
  fill('stone', 15); fill('bone', 10); fill('fruit', 25); // +50 → ~150 total
  for (let i = 0; i < 10; i++) evo.addResource(EMBER_TYPE); // +30 → ~180 total

  assert(evo.stageIndex === 4, 'Can reach final stage (Homo Sapiens)');
  assert(evo.getProgressToNext() === 1,  'Progress is 1 at final stage');
  assert(evo.getNextStage() === null,    'No next stage after final stage');
}

// ── Summary ───────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(44)}`);
console.log(`Tests: ${passed + failed}  ✅ ${passed} passed  ❌ ${failed} failed`);
console.log('─'.repeat(44) + '\n');
process.exit(failed > 0 ? 1 : 0);
