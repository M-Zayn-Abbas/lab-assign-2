const { suite } = require('../../test-helpers/recorder');
import { toggleLike, stepCounter } from '../../src/utils/handlers';

suite(
  {
    level: 'unit', id: 'UT-M03', name: 'toggleLike() / stepCounter() - Button click handlers', uc: 'UC-M02 View Dashboard',
    objective: 'Verify the Like button and +/- stepper handlers compute the correct next state',
    pre: 'handlers.js module loaded', steps: '1. Call handler with current state  2. Compare new state with expected',
  },
  [
    { title: 'Like button adds post id to liked set', data: 'toggleLike(Set[], 1)', expected: [1], run: () => [...toggleLike(new Set(), 1)], priority: 'High' },
    { title: 'Pressing Like again removes the like', data: 'toggleLike(Set[1], 1)', expected: [], run: () => [...toggleLike(new Set([1]), 1)], priority: 'High' },
    {
      title: 'Handler does not mutate previous state', data: 'prev=Set[2]; toggleLike(prev, 3)', expected: { prev: [2], next: [2, 3] },
      run: () => { const prev = new Set([2]); const next = toggleLike(prev, 3); return { prev: [...prev], next: [...next] }; },
    },
    { title: '"+" increases posts limit by 5', data: 'stepCounter(5, +5)', expected: 10, run: () => stepCounter(5, 5), priority: 'High' },
    { title: '"+" at maximum stays at 20 (upper bound)', data: 'stepCounter(20, +5)', expected: 20, run: () => stepCounter(20, 5) },
    { title: '"-" at minimum stays at 5 (lower bound)', data: 'stepCounter(5, -5)', expected: 5, run: () => stepCounter(5, -5) },
  ]
);
