/**
 * Runs every test group with its real command, captures the terminal output,
 * and screenshots it (plus the recorded inputs/outputs) with headless Edge.
 * Output: ../screenshots/<project>/<GROUP-ID>.png
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright-core');
const { ansiToHtml, esc, launch } = require('./lib');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'screenshots');

function jsGroups(project, dir, testRoot) {
  const groups = [];
  for (const level of ['unit', 'component', 'integration']) {
    const d = path.join(ROOT, dir, testRoot, level);
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.test.js')).sort()) {
      const rel = `${testRoot}/${level}/${f}`;
      groups.push({
        project, cwd: path.join(ROOT, dir), id: f.split('.')[0],
        cmd: `npx jest ${rel} --silent`,
        results: path.join(ROOT, dir, 'test-results', f.replace('.test.js', '.json')),
      });
    }
  }
  return groups;
}

function pyGroups() {
  const groups = [];
  for (const level of ['unit', 'component', 'integration']) {
    const d = path.join(ROOT, 'dsa-project', 'tests', level);
    for (const f of fs.readdirSync(d).filter((x) => /^test_.*\.py$/.test(x)).sort()) {
      const id = f.match(/^test_([a-z]+_d\d+)/)[1].toUpperCase().replace('_', '-');
      groups.push({
        project: 'dsa', cwd: path.join(ROOT, 'dsa-project'), id,
        cmd: `python -m unittest tests.${level}.${f.replace('.py', '')} -v`,
        results: path.join(ROOT, 'dsa-project', 'test-results', `${id}.json`),
      });
    }
  }
  return groups;
}

function page(g, output, data) {
  const rows = data.cases
    .map(
      (c) => `<tr class="${c.status === 'Pass' ? 'pass' : 'fail'}"><td>${esc(c.id)}</td><td>${esc(c.data)}</td><td>${esc(c.expected)}</td><td>${esc(c.actual)}</td><td class="st">${c.status}</td></tr>`
    )
    .join('');
  const winPath = g.cwd.replace(/\//g, '\\');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;background:#fff;font-family:Segoe UI,Arial,sans-serif;width:1180px}
    .win{margin:10px;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.35)}
    .bar{background:#2d2d30;color:#ccc;font-size:12px;padding:7px 12px;display:flex;gap:8px;align-items:center}
    .dot{width:11px;height:11px;border-radius:50%;display:inline-block}
    pre{margin:0;background:#1e1e1e;color:#d4d4d4;font:12.5px/1.45 Consolas,monospace;padding:12px 14px;white-space:pre-wrap;word-break:break-word}
    .prompt{color:#4ec9b0}
    h3{margin:14px 12px 6px;font-size:14px;color:#333}
    table{border-collapse:collapse;margin:0 10px 12px;width:1160px;font-size:11.5px;table-layout:fixed}
    th{background:#2d6cdf;color:#fff;text-align:left;padding:5px}
    td{border:1px solid #ccc;padding:4px 5px;vertical-align:top;word-break:break-word;font-family:Consolas,monospace}
    th:nth-child(1){width:90px}th:nth-child(5){width:50px}
    tr.pass .st{background:#d7f5dd;color:#1b6e2a;font-weight:700}
    tr.fail .st{background:#fbd5d5;color:#a11;font-weight:700}
  </style></head><body>
  <div class="win"><div class="bar"><span class="dot" style="background:#ff5f56"></span><span class="dot" style="background:#ffbd2e"></span><span class="dot" style="background:#27c93f"></span>
  <span>Windows PowerShell - ${esc(g.project)} - ${esc(g.id)}</span><span style="margin-left:auto">${esc(new Date().toLocaleString())}</span></div>
  <pre><span class="prompt">PS ${esc(winPath)}&gt;</span> ${esc(g.cmd)}\n${ansiToHtml(output.trimEnd())}\n<span class="prompt">PS ${esc(winPath)}&gt;</span> </pre></div>
  <h3>Recorded test inputs / outputs for ${esc(g.id)} (from ${esc(path.relative(ROOT, g.results).replace(/\\/g, '/'))})</h3>
  <table><tr><th>Test Case ID</th><th>Test Data (input)</th><th>Expected Result</th><th>Actual Result (output)</th><th>Status</th></tr>${rows}</table>
  </body></html>`;
}

(async () => {
  const only = process.argv[2]; // optional: web | mobile | dsa
  let groups = [...jsGroups('web', 'web-app', 'tests'), ...jsGroups('mobile', 'mobile-app', '__tests__'), ...pyGroups()];
  if (only) groups = groups.filter((g) => g.project === only);
  const browser = await launch(chromium);
  const pg = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1.5 });
  for (const g of groups) {
    const r = spawnSync(g.cmd, { cwd: g.cwd, shell: true, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '1' } });
    const output = (r.stdout || '') + (r.stderr || '');
    const data = JSON.parse(fs.readFileSync(g.results, 'utf8'));
    const dir = path.join(OUT, g.project);
    fs.mkdirSync(dir, { recursive: true });
    await pg.setContent(page(g, output, data));
    await pg.screenshot({ path: path.join(dir, `${g.id}.png`), fullPage: true });
    const failed = data.cases.filter((c) => c.status !== 'Pass').length;
    console.log(`${g.project} ${g.id}: ${data.cases.length} cases, ${failed} failed -> screenshots/${g.project}/${g.id}.png`);
  }
  await browser.close();
})();
