/**
 * Table-driven test helper. Every case is a real Jest test; in addition its
 * metadata + actual result + status are written to test-results/<file>.json
 * so the lab report tables can be generated from the real execution.
 */
const fs = require('fs');
const path = require('path');

const TEST_DATE = new Date().toISOString().slice(0, 10);
const records = [];
let groupInfo = null;

function fmt(v) {
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);
  if (v === Infinity) return 'Infinity';
  try {
    return JSON.stringify(v, (k, x) => (x instanceof Set ? [...x] : x));
  } catch {
    return String(v);
  }
}

/**
 * group: { level, id, name, uc, objective, pre, steps, fn, beforeEach, meta }
 * cases: [{ title, args, expected, run, check, data, expectedText, actualText, priority, pre, steps, objective, uc }]
 */
function suite(group, cases) {
  groupInfo = { level: group.level, id: group.id, name: group.name, ...(group.meta || {}) };
  describe(`${group.id} ${group.name}`, () => {
    if (group.beforeEach) beforeEach(group.beforeEach);
    cases.forEach((c, i) => {
      const id = `${group.id}-${String(i + 1).padStart(2, '0')}`;
      test(`${id}: ${c.title}`, async () => {
        const rec = {
          id,
          uc: c.uc || group.uc,
          title: c.title,
          objective: c.objective || group.objective,
          pre: c.pre || group.pre || 'None',
          steps: c.steps || group.steps,
          data: c.data !== undefined ? c.data : fmt(c.args),
          expected: c.expectedText || fmt(c.expected),
          actual: '',
          status: 'Fail',
          priority: c.priority || 'Medium',
        };
        records.push(rec);
        const run = c.run || (() => group.fn(...c.args));
        let actual;
        try {
          actual = await run();
        } catch (e) {
          rec.actual = 'Threw error: ' + e.message.split('\n')[0];
          throw e;
        }
        rec.actual = c.actualText ? c.actualText(actual) : fmt(actual);
        if (c.check) await c.check(actual);
        else expect(actual).toEqual(c.expected);
        rec.status = 'Pass';
      });
    });
  });
}

// Helper for cases that expect an exception: returns "throws: <message>"
function catchError(fn) {
  return async () => {
    try {
      const v = await fn();
      return { noError: true, value: v };
    } catch (e) {
      return `throws: ${e.message}`;
    }
  };
}

afterAll(() => {
  const outDir = path.join(__dirname, '..', '..', 'test-results');
  fs.mkdirSync(outDir, { recursive: true });
  const name = path.basename(expect.getState().testPath).replace(/\.test\.js$/, '');
  fs.writeFileSync(
    path.join(outDir, `${name}.json`),
    JSON.stringify({ project: 'web', group: groupInfo, testDate: TEST_DATE, cases: records }, null, 2)
  );
});

module.exports = { suite, fmt, catchError };
