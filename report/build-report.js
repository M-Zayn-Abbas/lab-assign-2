/**
 * Builds Lab2_Testing_Report.docx from the real test results (test-results/*.json)
 * and the screenshots captured by capture-evidence.js / capture-ui.js.
 * Change TESTER / STUDENT below, then run: node build-report.js
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, HeadingLevel, AlignmentType,
  WidthType, ShadingType, BorderStyle, PageOrientation, PageBreak, TableOfContents, Footer, Header, PageNumber,
  LevelFormat, VerticalAlign, TableLayoutType,
} = require('docx');

const STUDENT = { name: '[Your Name]', roll: '[Roll Number]', course: 'Software Testing (Semester 8)', instructor: '[Instructor Name]' };
const TESTER = STUDENT.name;
const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(ROOT, 'screenshots');
const OUTPUT = path.join(ROOT, 'Lab2_Testing_Report.docx');

// A4 landscape, 0.5" margins -> usable width 15398 DXA (10.69")
const CONTENT_W = 16838 - 1440;
const DXA_PER_IN = 1440;
const BLUE = '2D6CDF';

// ------------------------------------------------------------------ data
const LEVEL_ORDER = { unit: 0, component: 1, integration: 2 };
function loadResults(dir, project) {
  const d = path.join(ROOT, dir, 'test-results');
  return fs
    .readdirSync(d)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: f, ...JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')) }))
    .map((r) => ({ ...r, cmd: commandFor(project, r) }))
    .sort((a, b) => LEVEL_ORDER[a.group.level] - LEVEL_ORDER[b.group.level] || a.group.id.localeCompare(b.group.id));
}
function commandFor(project, r) {
  const lvl = r.group.level;
  if (project === 'web') return `npx jest tests/${lvl}/${r.file.replace('.json', '.test.js')} --silent`;
  if (project === 'mobile') return `npx jest __tests__/${lvl}/${r.file.replace('.json', '.test.js')} --silent`;
  const d = path.join(ROOT, 'dsa-project', 'tests', lvl);
  const mod = fs.readdirSync(d).find((f) => f.startsWith(`test_${r.group.id.toLowerCase().replace('-', '_')}`)).replace('.py', '');
  return `python -m unittest tests.${lvl}.${mod} -v`;
}

const PROJECTS = [
  {
    key: 'web', dir: 'web-app', title: 'Web Application - ShopEase', short: 'Web App',
    about: 'ShopEase is a small e-commerce web application. The backend is Node.js + Express with an in-memory database; the frontend is HTML + vanilla JavaScript that talks to the REST API. Features: registration, login/logout with session tokens, product management (add/search/delete), cart, mock card-payment gateway and order history.',
    tools: 'Jest 29 (test runner & assertions), Supertest (HTTP calls into Express), real HTTP server + fetch for frontend/backend tests, headless Microsoft Edge (Playwright) for UI screenshots.',
    run: 'cd web-app  ->  npm install  ->  npm test   (application: npm start, http://localhost:3000)',
    useCases: [
      ['UC-W01', 'Register account', 'Visitor creates an account with name, email and strong password'],
      ['UC-W02', 'Login / Logout', 'User logs in with email + password, receives a session token, logs out'],
      ['UC-W03', 'Browse & manage products', 'View/search product list; logged-in user adds or deletes products'],
      ['UC-W04', 'Checkout & pay', 'User adds items to cart and pays by card; stock is reduced and an order is created'],
      ['UC-W05', 'View my orders', 'User sees only his/her own orders'],
    ],
  },
  {
    key: 'mobile', dir: 'mobile-app', title: 'Mobile Application - PostHub (Expo / React Native)', short: 'Mobile App',
    about: 'PostHub is an Expo (React Native, SDK 57) app. After logging in, the user sees a dashboard of posts fetched from the public REST API jsonplaceholder.typicode.com, can like posts and change how many are shown, edit a profile saved on the device (AsyncStorage) and read in-app notifications generated from his/her data.',
    tools: 'Jest 29 with the jest-expo preset, React Native Testing Library 14 (renders real screens and fires presses/typing), official AsyncStorage Jest mock, stubbed fetch for the API server, Expo web export + headless Edge (390x844 phone viewport) for UI screenshots against the live API.',
    run: 'cd mobile-app  ->  npm install  ->  npm test   (application: npx expo start, scan QR with Expo Go)',
    useCases: [
      ['UC-M01', 'Login', 'User logs in with demo credentials; session saved on device'],
      ['UC-M02', 'View dashboard', 'Posts of the user are loaded from the API server; like posts; change count; refresh'],
      ['UC-M03', 'Manage profile', 'User edits name/age/phone which is validated and saved to device storage'],
      ['UC-M04', 'View notifications', 'In-app alerts generated from user data; mark read / mark all read'],
    ],
  },
  {
    key: 'dsa', dir: 'dsa-project', title: 'DSA Semester Project - DSA Toolkit (Python)', short: 'DSA Project',
    about: 'DSA Toolkit is a Python 3 command-line program implementing a singly linked list, a binary search tree, a stack and a circular queue, four sorting algorithms with linear/binary search and a weighted graph (BFS, DFS, Dijkstra). A data-input module parses user text, a processing module builds the structures and a visualization module renders them as text.',
    tools: 'Python unittest (standard library), subprocess for end-to-end CLI tests, headless Edge for terminal screenshots.',
    run: 'cd dsa-project  ->  python -m unittest discover -s tests -t . -v   (application: python main.py)',
    useCases: [
      ['UC-D01', 'Manage linked list', 'Insert at head/tail/index, delete, search, reverse'],
      ['UC-D02', 'Tree operations', 'Build BST, search, delete, traversals, height/min/max'],
      ['UC-D03', 'Stack & queue', 'Push/pop/peek, enqueue/dequeue, bracket checking'],
      ['UC-D04', 'Sort & search', 'Sort a list with bubble/insertion/merge/quick sort; linear & binary search'],
      ['UC-D05', 'Graph processing', 'Build weighted graph from edge list; BFS, DFS, Dijkstra shortest path'],
    ],
  },
];
PROJECTS.forEach((p) => (p.results = loadResults(p.dir, p.key)));

const OBSERVED = {
  'CT-W01': 'Registration validates input, hashes the password (PBKDF2 + random salt) and stores the user; duplicate emails are blocked case-insensitively. Login issues a 48-character session token that resolves back to the user and logout removes it.',
  'CT-W02': 'Valid products get auto-increment IDs, invalid price/stock are rejected with both messages, search is case-insensitive, deleting an unknown ID returns 404 and reduceStock() prevents overselling. However, a product name containing HTML markup was accepted (201).',
  'CT-W03': 'The gateway validates the card before charging, records SUCCESS / DECLINED payments and stores only the last 4 digits of the card. Expired cards and zero amounts are rejected and nothing is recorded.',
  'IT-W01': 'Real HTTP requests made by the frontend handler reached the Express routes; JSON responses, validation errors and 401 Unauthorized came back unchanged, and a product added through the API was immediately visible in search.',
  'IT-W02': 'Every API call produced the expected database change: users stored with hashed passwords, sessions created/deleted on login/logout, product rows deleted, duplicate users prevented and orders filtered per user.',
  'IT-W03': 'Normal checkout, declined card, discount and insufficient-stock flows behaved correctly. When the same product appears in two cart lines whose total exceeds stock, each line passed the stock check, the card was charged and reduceStock() then threw, returning HTTP 500.',
  'CT-M01': 'The screen pre-fills the user name and shows API server data, blocks an invalid age with an inline error, saves valid data (age converted to a number) and confirms save/clear actions.',
  'CT-M02': 'Requests go to the correct jsonplaceholder URLs, results are parsed and limited, malformed items are skipped, and HTTP 500 / network failures surface as readable error messages.',
  'CT-M03': 'Notifications are derived from user, posts and profile (including the under-18 notice); unread counts update correctly and tapping an item in the UI calls onRead with its id.',
  'IT-M01': 'After login the Dashboard requested posts with the logged-in user id and rendered them; "+" and Refresh re-requested data; a 500 from the server was displayed as an error message.',
  'IT-M02': 'Wrong credentials kept the user on Login; a valid login passed the user to the Dashboard and saved the session; logout cleared it; re-opening the app with a saved session skipped Login.',
  'IT-M03': 'Notifications reacted to stored profile and posts (badge 3 -> 2, under-18 notice). However, after "Mark all read" and saving the profile, already-read notifications were regenerated as unread ("Alerts (2)").',
  'CT-D01': 'All linked-list operations kept the head pointer and size consistent, including 1000 inserts + 500 deletes, reversing empty/single-node lists and re-using a list after emptying it.',
  'CT-D02': 'Traversals, height/min/max, random deletes and empty-tree cases were correct. With 1500 keys inserted in sorted order the tree degenerates into a chain and the recursive height() raised RecursionError.',
  'CT-D03': 'BFS/DFS orders, Dijkstra (A->C->B->D = 8), unreachable vertices, edge removal and negative-weight rejection were correct. The recursive dfs() raised RecursionError on a 1501-vertex path graph.',
  'IT-D01': 'Parsed numbers and edge lists were handed correctly to the builders; invalid tokens and negative weights were stopped. A malformed edge "A-B-C:2" was silently accepted, creating a vertex named "B-C".',
  'IT-D02': 'Every structure was rendered correctly (list arrows, sideways tree, adjacency list, path, bars, empty placeholders). Bars are not scaled: a value of 1000 produced a 1008-character line.',
  'IT-D03': 'Keystrokes sent to main.py flowed through menu -> parser -> processing -> visualizer; all end-to-end scenarios printed the expected output and invalid input never crashed the program.',
};

const BUGS = [
  { id: 'BUG-W01', tc: 'UT-W01-07', project: 'Web', sev: 'Low', title: 'Email checker accepts consecutive dots in the domain',
    detail: 'validateEmail("ali@test..com") returns true, so malformed addresses can be registered.',
    fix: 'Use a stricter pattern that forbids empty domain labels, e.g. /^[^\\s@]+@([^\\s@.]+\\.)+[^\\s@.]{2,}$/.' },
  { id: 'BUG-W02', tc: 'CT-W02-07', project: 'Web', sev: 'High', title: 'Stored XSS / HTML injection through product name',
    detail: 'addProduct() accepts names such as <img src=x onerror=alert(1)> and the frontend inserts names with innerHTML, so the markup is executed for every visitor (see screenshot web-ui/11).',
    fix: 'Reject or escape "<" and ">" in validateProductForm() and render names with textContent instead of innerHTML.' },
  { id: 'BUG-W03', tc: 'IT-W03-05', project: 'Web', sev: 'Critical', title: 'Card charged but order fails when the same product is in two cart lines',
    detail: 'items [{productId:1, qty:6}, {productId:1, qty:6}] with stock 10: each line passes the stock check, the payment succeeds, then reduceStock() throws -> HTTP 500, no order is created, a SUCCESS payment is recorded and stock is left at 4.',
    fix: 'Aggregate quantities per product before the stock check, reserve stock before charging, and roll back / refund if any later step fails.' },
  { id: 'BUG-M01', tc: 'UT-M05-06', project: 'Mobile', sev: 'Medium', title: 'loadSession() crashes on corrupted session data',
    detail: 'If the saved "session" value is not valid JSON, loadSession() throws SyntaxError, while loadProfile() handles the same situation by returning null.',
    fix: 'Wrap JSON.parse in try/catch, remove the corrupted key and return null.' },
  { id: 'BUG-M02', tc: 'IT-M03-05', project: 'Mobile', sev: 'Low', title: 'Read notifications become unread after profile update',
    detail: 'App.js regenerates the whole notification list with read:false whenever the profile is saved, so the badge shows "Alerts (2)" again although the user already read them (see screenshot mobile-ui/10).',
    fix: 'When regenerating, copy the read flag from the previous list for notifications with the same id.' },
  { id: 'BUG-D01', tc: 'CT-D02-05', project: 'DSA', sev: 'Medium', title: 'BST height() fails with RecursionError on degenerate trees',
    detail: 'Inserting 1500 sorted keys creates a chain of depth 1500; the recursive height() (and the recursive traversals) exceed Python\'s default recursion limit of 1000.',
    fix: 'Implement height/traversals iteratively (explicit stack/queue) or use a self-balancing tree (AVL / Red-Black).' },
  { id: 'BUG-D02', tc: 'CT-D03-07', project: 'DSA', sev: 'Medium', title: 'Graph dfs() fails with RecursionError on long paths',
    detail: 'dfs() is recursive, so a path graph with 1501 vertices raises RecursionError instead of returning the visit order.',
    fix: 'Rewrite dfs() with an explicit stack.' },
  { id: 'BUG-D03', tc: 'IT-D01-07', project: 'DSA', sev: 'Low', title: 'Malformed edge "A-B-C" is silently accepted',
    detail: 'parse_edges() splits only on the first "-", so "A-B-C:2" becomes edge A -> "B-C" and a bogus vertex appears in the graph (see screenshot dsa-ui/07).',
    fix: 'Split on "-" and require exactly two non-empty vertex names, otherwise raise ValueError.' },
  { id: 'BUG-D04', tc: 'IT-D02-07', project: 'DSA', sev: 'Low', title: 'Bar chart is not scaled to terminal width',
    detail: 'render_bars([5, 1000]) prints a 1008-character line, which wraps and makes the visualization unreadable (see screenshot dsa-ui/08).',
    fix: 'Scale bars relative to the maximum value (e.g. max 50 characters) and print the value next to the bar.' },
];
const bugByTc = Object.fromEntries(BUGS.map((b) => [b.tc, b]));

// ------------------------------------------------------------------ docx helpers
const run = (text, o = {}) => new TextRun({ text: String(text), font: 'Calibri', ...o });
const P = (text, o = {}) => new Paragraph({ spacing: { after: 100 }, ...o, children: Array.isArray(text) ? text : [run(text, o.run || {})] });
const H = (text, level) => new Paragraph({ heading: level, spacing: { before: level === HeadingLevel.HEADING_1 ? 0 : 240, after: 120 }, children: [run(text)] });
const bullet = (text) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 40 }, children: Array.isArray(text) ? text : [run(text)] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
const caption = (text) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [run(text, { italics: true, size: 18, color: '555555' })] });
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE };

// zero-width spaces after , : / = give Word places to wrap long JSON values inside narrow cells
const wrap = (t) => String(t).replace(/([,:/=&|])(?=\S)/g, '$1​').replace(/(\S{24})(?=\S)/g, '$1​');

function cell(content, width, o = {}) {
  const lines = Array.isArray(content) ? content : wrap(content ?? '').split('\n');
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: o.borders || BORDERS,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 40, bottom: 40, left: 70, right: 70 },
    verticalAlign: o.vAlign || VerticalAlign.TOP,
    children: lines.map((l) =>
      l instanceof Paragraph ? l : new Paragraph({ alignment: o.align, children: [run(l, { size: o.size || 15, bold: o.bold, color: o.color })] })
    ),
  });
}

// widths given as relative weights -> scaled to fill the content width exactly
function scaleWidths(weights, total = CONTENT_W) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const w = weights.map((x) => Math.floor((x / sum) * total));
  w[w.length - 1] += total - w.reduce((a, b) => a + b, 0);
  return w;
}

function table(headers, rows, weights, o = {}) {
  const widths = scaleWidths(weights, o.total);
  const head = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => cell(h, widths[i], { fill: BLUE, bold: true, color: 'FFFFFF', size: o.size || 15 })),
  });
  const body = rows.map(
    (r) =>
      new TableRow({
        cantSplit: true,
        children: r.map((v, i) => {
          const st = o.statusCol === i ? (v === 'Pass' ? 'D7F5DD' : v === 'Fail' ? 'FBD5D5' : undefined) : undefined;
          const firstCol = o.labelCol && i === 0;
          return cell(v, widths[i], { size: o.size || 15, fill: st || (firstCol ? 'EAF1FB' : undefined), bold: firstCol || !!st });
        }),
      })
  );
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: widths, rows: [head, ...body] });
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), data: b };
}
function imageRun(file, maxWIn, maxHIn) {
  const { w, h, data } = pngSize(file);
  let wi = maxWIn;
  let hi = (wi * h) / w;
  if (hi > maxHIn) { hi = maxHIn; wi = (hi * w) / h; }
  return new ImageRun({ type: 'png', data, transformation: { width: Math.round(wi * 96), height: Math.round(hi * 96) }, altText: { title: path.basename(file), description: path.basename(file), name: path.basename(file) } });
}
function figure(file, cap, maxWIn = 9.8, maxHIn = 6.3) {
  if (!fs.existsSync(file)) {
    return [
      P(`[ Screenshot placeholder - paste ${path.relative(ROOT, file)} here ]`, { alignment: AlignmentType.CENTER, run: { color: 'A11111', bold: true } }),
      caption(cap),
    ];
  }
  return [new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120 }, children: [imageRun(file, maxWIn, maxHIn)] }), caption(cap)];
}
function gallery(items, cols, maxHIn) {
  const colW = Math.floor(CONTENT_W / cols);
  const rows = [];
  for (let i = 0; i < items.length; i += cols) {
    const slice = items.slice(i, i + cols);
    while (slice.length < cols) slice.push(null);
    rows.push(
      new TableRow({
        cantSplit: true,
        children: slice.map((it) =>
          cell(
            it
              ? [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(it.file, colW / DXA_PER_IN - 0.25, maxHIn)] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [run(it.caption, { italics: true, size: 16, color: '555555' })] }),
                ]
              : [new Paragraph('')],
            colW,
            { borders: NO_BORDERS }
          )
        ),
      })
    );
  }
  return new Table({ width: { size: colW * cols, type: WidthType.DXA }, layout: TableLayoutType.FIXED, columnWidths: Array(cols).fill(colW), rows });
}

// ------------------------------------------------------------------ report sections
const figNo = { n: 0 };
const fig = (text) => `Figure ${++figNo.n}: ${text}`;
const counts = (cases) => ({ total: cases.length, pass: cases.filter((c) => c.status === 'Pass').length, fail: cases.filter((c) => c.status !== 'Pass').length });

function testCaseTable(r) {
  const rows = r.cases.map((c) => [c.id, c.uc, c.title, c.objective, c.pre, c.steps, c.data, c.expected, c.actual, c.status, c.priority, TESTER, r.testDate]);
  return table(
    ['Test Case ID', 'Related Use Case ID', 'Test Case Title', 'Test Objective', 'Preconditions', 'Test Steps', 'Test Data', 'Expected Result', 'Actual Result', 'Status (Pass/Fail)', 'Priority', 'Tested By', 'Test Date'],
    rows,
    [8, 9, 12, 12, 10, 11, 14, 14, 14, 6, 6, 7, 7.5],
    { statusCol: 9, size: 14 }
  );
}

function bugsFor(r) {
  const failed = r.cases.filter((c) => c.status !== 'Pass');
  if (!failed.length) return 'None - all scenarios passed.';
  return failed.map((c) => (bugByTc[c.id] ? `${bugByTc[c.id].id} (${c.id}): ${bugByTc[c.id].title}` : `${c.id}: ${c.actual}`)).join('\n');
}

function evidence(p, r) {
  const f = path.join(SHOTS, p.key, `${r.group.id}.png`);
  const { pass, total } = counts(r.cases);
  return figure(f, fig(`${r.group.id} execution - "${r.cmd}" (terminal output) with the recorded inputs/outputs of all ${total} test cases (${pass} passed).`));
}

function unitSection(p) {
  const units = p.results.filter((r) => r.group.level === 'unit');
  const out = [H(`${p.num}.2 Unit Testing`, HeadingLevel.HEADING_2),
    P(`${units.length} units were identified and tested independently (external dependencies such as fetch, storage or the database were stubbed or reset). Each unit has at least 5 test cases in the required template format.`)];
  units.forEach((r, i) => {
    const c = counts(r.cases);
    out.push(H(`${p.num}.2.${i + 1} ${r.group.id} - ${r.group.name}`, HeadingLevel.HEADING_3));
    out.push(P([run('Result: ', { bold: true }), run(`${c.total} test cases executed, ${c.pass} passed, ${c.fail} failed.`)]));
    out.push(testCaseTable(r));
    out.push(...evidence(p, r));
  });
  return out;
}

function componentSection(p) {
  const comps = p.results.filter((r) => r.group.level === 'component');
  const out = [H(`${p.num}.3 Component Testing`, HeadingLevel.HEADING_2),
    P('Related units were grouped into components (modules) and tested together through the module\'s public functions or rendered screens.')];
  comps.forEach((r, i) => {
    const c = counts(r.cases);
    out.push(H(`${p.num}.3.${i + 1} ${r.group.id} - ${r.group.name}`, HeadingLevel.HEADING_3));
    out.push(
      table(['Deliverable', 'Details'], [
        ['Component Name', r.group.component],
        ['Included Units', r.group.units.join(', ')],
        ['Test Scenarios', r.cases.map((x) => `${x.id}: ${x.title}`).join('\n')],
        ['Observed Behavior', `${c.pass} of ${c.total} scenarios passed. ${OBSERVED[r.group.id] || ''}`],
        ['Bugs Found', bugsFor(r)],
      ], [18, 82], { labelCol: true, size: 17 })
    );
    out.push(P(''));
    out.push(P('Test scenarios (executed):', { run: { bold: true } }));
    out.push(testCaseTable(r));
    out.push(...evidence(p, r));
  });
  return out;
}

function integrationSection(p) {
  const its = p.results.filter((r) => r.group.level === 'integration');
  const out = [H(`${p.num}.4 Integration Testing`, HeadingLevel.HEADING_2),
    P('Interactions between modules were tested. Strategies used: ' + [...new Set(its.map((r) => r.group.strategy.split(':')[0]))].join(', ') + '.')];
  its.forEach((r, i) => {
    const c = counts(r.cases);
    out.push(H(`${p.num}.4.${i + 1} ${r.group.id} - ${r.group.name}`, HeadingLevel.HEADING_3));
    out.push(
      table(['Deliverable', 'Details'], [
        ['Modules Integrated', r.group.modules],
        ['Integration Strategy Used', r.group.strategy],
        ['Test Cases', r.cases.map((x) => `${x.id}: ${x.title}  [${x.status}]`).join('\n')],
        ['Data Passed Between Modules', r.group.dataPassed],
        ['Observed Behavior', `${c.pass} of ${c.total} test cases passed. ${OBSERVED[r.group.id] || ''}`],
        ['Errors / Failures Observed', bugsFor(r)],
      ], [18, 82], { labelCol: true, size: 17 })
    );
    out.push(P(''));
    out.push(P('Integration test cases (executed):', { run: { bold: true } }));
    out.push(testCaseTable(r));
    out.push(...evidence(p, r));
  });
  return out;
}

function uiSection(p) {
  const caps = JSON.parse(fs.readFileSync(path.join(SHOTS, 'ui-captions.json'), 'utf8'));
  const dir = path.join(SHOTS, `${p.key}-ui`);
  if (!fs.existsSync(dir)) return [];
  const items = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
    .map((f) => ({ file: path.join(dir, f), caption: fig(caps[`${p.key}-ui/${f}`] || f) }));
  const label = p.key === 'dsa' ? 'running program (CLI sessions)' : 'running application';
  return [
    H(`${p.num}.5 System Behaviour Screenshots (${label})`, HeadingLevel.HEADING_2),
    P(p.key === 'mobile'
      ? 'The Expo app was exported for web and driven in a 390x844 phone viewport. Posts and user data in these screenshots come from the live jsonplaceholder API server. Each caption names the test cases it demonstrates.'
      : p.key === 'web'
        ? 'The application was started with "npm start" and driven in Microsoft Edge. Each caption names the test cases it demonstrates.'
        : 'main.py was run with the keystrokes shown after each prompt. Each caption names the test cases it demonstrates.'),
    gallery(items, p.key === 'mobile' ? 3 : 2, p.key === 'mobile' ? 5.3 : 5.6),
  ];
}

function projectSection(p) {
  const c = counts(p.results.flatMap((r) => r.cases));
  return [
    pageBreak(),
    H(`${p.num}. ${p.title}`, HeadingLevel.HEADING_1),
    H(`${p.num}.1 System Under Test`, HeadingLevel.HEADING_2),
    P(p.about),
    P([run('Testing tools: ', { bold: true }), run(p.tools)]),
    P([run('How to run the tests: ', { bold: true }), run(p.run)]),
    P([run('Overall: ', { bold: true }), run(`${c.total} test cases executed, ${c.pass} passed, ${c.fail} failed.`)]),
    P('Use cases referenced by the test cases:', { run: { bold: true } }),
    table(['Use Case ID', 'Use Case', 'Description'], p.useCases, [12, 25, 63], { labelCol: true, size: 17 }),
    ...unitSection(p),
    ...componentSection(p),
    ...integrationSection(p),
    ...uiSection(p),
  ];
}

function summarySection() {
  const rows = [];
  let all = { total: 0, pass: 0, fail: 0 };
  for (const p of PROJECTS) {
    for (const lvl of ['unit', 'component', 'integration']) {
      const rs = p.results.filter((r) => r.group.level === lvl);
      const c = counts(rs.flatMap((r) => r.cases));
      all = { total: all.total + c.total, pass: all.pass + c.pass, fail: all.fail + c.fail };
      const label = lvl === 'unit' ? `${rs.length} units` : lvl === 'component' ? `${rs.length} components` : `${rs.length} scenarios`;
      rows.push([p.short, lvl[0].toUpperCase() + lvl.slice(1), label, String(c.total), String(c.pass), String(c.fail), `${((c.pass / c.total) * 100).toFixed(1)}%`]);
    }
  }
  rows.push(['TOTAL', '', '', String(all.total), String(all.pass), String(all.fail), `${((all.pass / all.total) * 100).toFixed(1)}%`]);
  return [
    pageBreak(),
    H('2. Summary of Results', HeadingLevel.HEADING_1),
    P(`All tests were executed on ${PROJECTS[0].results[0].testDate}. A failing test case means the system did not behave as specified - every failure below is a genuine defect in the application code (not in the test) and is described in section 6.`),
    table(['Project', 'Testing Level', 'Items Tested', 'Test Cases', 'Passed', 'Failed', 'Pass Rate'], rows, [14, 14, 16, 12, 10, 10, 10], { labelCol: true, size: 18 }),
    P(''),
    H('Requirement Coverage', HeadingLevel.HEADING_3),
    table(['Lab Requirement', 'Required', 'Web App', 'Mobile App', 'DSA Project'], [
      ['Units tested (Part I)', '>= 5 per project', ...PROJECTS.map((p) => String(p.results.filter((r) => r.group.level === 'unit').length))],
      ['Test cases per unit', '>= 5', ...PROJECTS.map((p) => `${Math.min(...p.results.filter((r) => r.group.level === 'unit').map((r) => r.cases.length))} - ${Math.max(...p.results.filter((r) => r.group.level === 'unit').map((r) => r.cases.length))}`)],
      ['Components tested (Part II)', '>= 3 per project', ...PROJECTS.map((p) => String(p.results.filter((r) => r.group.level === 'component').length))],
      ['Integration scenarios (Part III)', '>= 3 per project', ...PROJECTS.map((p) => String(p.results.filter((r) => r.group.level === 'integration').length))],
      ['Integration strategies applied', '>= 1', 'Top-Down, Bottom-Up, Incremental', 'Top-Down, Incremental, Bottom-Up', 'Bottom-Up, Incremental, Top-Down'],
      ['Screenshots', 'Every scenario', 'Every unit/component/integration group + 11 UI', 'Every group + 12 UI', 'Every group + 8 CLI sessions'],
    ], [26, 16, 19, 19, 20], { labelCol: true, size: 18 }),
    P(''),
    H('Defects Found', HeadingLevel.HEADING_3),
    table(['Bug ID', 'Project', 'Found by Test Case', 'Severity', 'Title'], BUGS.map((b) => [b.id, b.project, b.tc, b.sev, b.title]), [10, 10, 14, 10, 56], { labelCol: true, size: 18 }),
  ];
}

function introSection() {
  return [
    pageBreak(),
    H('1. Introduction', HeadingLevel.HEADING_1),
    H('1.1 Objective', HeadingLevel.HEADING_2),
    P('Apply three levels of testing - Unit Testing, Component Testing and Integration Testing - to three software projects: a Web Application, a Mobile Application and a Data Structures & Algorithms semester project, and document the test cases, results, defects and screenshot evidence.'),
    H('1.2 Testing Levels', HeadingLevel.HEADING_2),
    bullet([run('Unit testing: ', { bold: true }), run('each function/method/class is tested in isolation; external dependencies (network, storage, database) are stubbed, mocked or reset.')]),
    bullet([run('Component testing: ', { bold: true }), run('related units are grouped into a module (e.g. Authentication, Notification, Tree Operations) and tested through the module interface or rendered screen.')]),
    bullet([run('Integration testing: ', { bold: true }), run('the interaction and data flow between modules is tested using Top-Down, Bottom-Up and Incremental integration strategies.')]),
    H('1.3 Test Environment', HeadingLevel.HEADING_2),
    table(['Item', 'Value'], [
      ['Operating system', 'Windows 11 Pro'],
      ['Runtimes', 'Node.js v20.18.0, Python 3.13.7'],
      ['Web app', 'Express 4, Jest 29.7, Supertest 7'],
      ['Mobile app', 'Expo SDK 57, React Native 0.86, jest-expo, @testing-library/react-native 14, AsyncStorage Jest mock'],
      ['DSA project', 'Python unittest (standard library)'],
      ['Screenshots', 'Headless Microsoft Edge via Playwright; terminal output captured from the real test commands'],
    ], [25, 75], { labelCol: true, size: 18 }),
    H('1.4 Method', HeadingLevel.HEADING_2),
    P('All test cases are automated and table-driven. While a test runs, its input, expected result, actual result and Pass/Fail status are written to a JSON file (test-results folder of each project); the tables in this report are generated from those files, so the "Actual Result" and "Status" columns are the real outputs of the execution. For every unit, component and integration group, the real test command was run again and its terminal output was captured as a screenshot together with the recorded inputs/outputs. Screenshots of the running applications show the same behaviour from the user\'s point of view.'),
    P('Test case ID format: UT = unit, CT = component, IT = integration; W = web, M = mobile, D = DSA. For example UT-W01-03 is test case 3 of web unit 1.'),
  ];
}

function bugsSection() {
  const out = [pageBreak(), H('6. Defects Found and Recommendations', HeadingLevel.HEADING_1),
    P('The following defects were revealed by failing test cases. They were left unfixed so the report reflects the real test outcome; the recommended fix is listed for each.')];
  for (const b of BUGS) {
    out.push(H(`${b.id} - ${b.title}`, HeadingLevel.HEADING_3));
    out.push(table(['Field', 'Details'], [
      ['Project / Test Case', `${b.project} - ${b.tc}`],
      ['Severity', b.sev],
      ['Description', b.detail],
      ['Recommended Fix', b.fix],
      ['Status', 'Open'],
    ], [18, 82], { labelCol: true, size: 18 }));
  }
  return out;
}

function conclusion() {
  const all = counts(PROJECTS.flatMap((p) => p.results.flatMap((r) => r.cases)));
  return [
    pageBreak(),
    H('7. Conclusion', HeadingLevel.HEADING_1),
    P(`A total of ${all.total} automated test cases were designed and executed across the three projects (${all.pass} passed, ${all.fail} failed). Unit tests verified individual functions in isolation, component tests verified complete modules, and integration tests verified the data flow between modules using Top-Down, Bottom-Up and Incremental strategies.`),
    P('Each level found different kinds of defects: unit testing found a validation gap (email format), component testing found a security issue (HTML injection) and scalability limits (recursion depth), and integration testing found defects that only appear when modules interact - most importantly a checkout path where the customer is charged without an order being created. This shows why all three levels of testing are needed.'),
  ];
}

function titlePage() {
  return [
    new Paragraph({ spacing: { before: 1400 }, alignment: AlignmentType.CENTER, children: [run('LAB 2', { size: 36, bold: true, color: BLUE })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [run('Unit, Component & Integration Testing', { size: 52, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [run('Web Application  |  Mobile Application  |  DSA Semester Project', { size: 28, color: '555555' })] }),
    new Table({
      width: { size: 7200, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      columnWidths: [2400, 4800],
      rows: [['Submitted by', STUDENT.name], ['Roll Number', STUDENT.roll], ['Course', STUDENT.course], ['Submitted to', STUDENT.instructor], ['Date', PROJECTS[0].results[0].testDate]].map(
        ([k, v]) => new TableRow({ children: [cell(k, 2400, { bold: true, size: 24, fill: 'EAF1FB' }), cell(v, 4800, { size: 24 })] })
      ),
    }),
    pageBreak(),
    H('Table of Contents', HeadingLevel.HEADING_1),
    P('(If the table of contents is empty, right-click it in Word and choose "Update Field".)', { run: { italics: true, size: 18, color: '777777' } }),
    new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-2' }),
  ];
}

// ------------------------------------------------------------------ build
PROJECTS.forEach((p, i) => (p.num = i + 3));
const doc = new Document({
  creator: STUDENT.name,
  title: 'Lab 2 - Unit, Component & Integration Testing',
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: 'Calibri', size: 21 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 34, bold: true, color: BLUE, font: 'Calibri' }, paragraph: { spacing: { before: 0, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 27, bold: true, color: '1F3864', font: 'Calibri' }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 23, bold: true, color: '2F5496', font: 'Calibri' }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [
    {
      properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 1000, bottom: 720, left: 720, right: 720, header: 400, footer: 360 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [run('Lab 2 - Unit, Component & Integration Testing', { size: 16, color: '888888' })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Page ', { size: 16, color: '888888' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888' })] })] }) },
      children: [...titlePage(), ...introSection(), ...summarySection(), ...PROJECTS.flatMap(projectSection), ...bugsSection(), ...conclusion()],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUTPUT, buf);
  console.log(`Written ${OUTPUT} (${(buf.length / 1024 / 1024).toFixed(1)} MB), ${figNo.n} figures`);
});
