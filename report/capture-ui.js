/**
 * Captures real UI screenshots of the three running applications:
 *   web    - ShopEase served by `node server.js`, driven in headless Edge
 *   mobile - PostHub exported with `expo export -p web`, shown at phone size (390x844)
 *   dsa    - interactive CLI sessions of main.py (typed keys echoed like a terminal)
 * Usage: node capture-ui.js [web|mobile|dsa]
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, spawnSync } = require('child_process');
const { chromium } = require('playwright-core');
const { esc, launch } = require('./lib');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'screenshots');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const captions = {};

async function shot(page, project, name, caption, fullPage = true) {
  const dir = path.join(OUT, `${project}-ui`);
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage });
  captions[`${project}-ui/${name}.png`] = caption;
  console.log(`${project}-ui/${name}.png`);
}

// ---------------- WEB ----------------
async function web(browser) {
  const PORT = 3456;
  const server = spawn('node', ['server.js'], { cwd: path.join(ROOT, 'web-app'), env: { ...process.env, PORT } });
  await wait(1500);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const url = `http://localhost:${PORT}`;
  const $ = (id) => page.locator(`#${id}`);
  const msg = async (id) => { await page.waitForFunction((i) => document.getElementById(i).textContent.trim() !== '', id); };
  try {
    await page.goto(url);
    await page.waitForSelector('#productTable tr');
    await shot(page, 'web', '01-home-products', 'Home page: product list loaded from backend (GET /api/products) - IT-W01-01');

    await $('regName').fill('A');
    await $('regEmail').fill('ali@test');
    await $('regPassword').fill('abc');
    await $('registerBtn').click();
    await msg('regMsg');
    await shot(page, 'web', '02-register-validation-errors', 'Register with invalid data: backend validation errors displayed in UI - IT-W01-03, UT-W01/UT-W02');

    await $('regName').fill('Ali Khan');
    await $('regEmail').fill('ali@test.com');
    await $('regPassword').fill('Secret123');
    await $('registerBtn').click();
    await page.waitForFunction(() => document.getElementById('regMsg').textContent.includes('successful'));
    await shot(page, 'web', '03-register-success', 'Successful registration (POST /api/register -> 201) - CT-W01-01, IT-W02-01');

    await $('loginEmail').fill('ali@test.com');
    await $('loginPassword').fill('Wrong1234');
    await $('loginBtn').click();
    await msg('loginMsg');
    await shot(page, 'web', '04-login-wrong-password', 'Login with wrong password rejected (401 "Invalid email or password") - CT-W01-06');

    await $('loginPassword').fill('Secret123');
    await $('loginBtn').click();
    await page.waitForSelector('#logoutBtn:not(.hidden)');
    await shot(page, 'web', '05-login-success', 'Login success: session token issued, header shows user, protected sections visible - IT-W01-02');

    await $('prodName').fill('Monitor');
    await $('prodPrice').fill('30000');
    await $('prodStock').fill('3');
    await $('addProductBtn').click();
    await page.waitForFunction(() => document.getElementById('productTable').textContent.includes('Monitor'));
    await shot(page, 'web', '06-add-product', 'Product added through UI appears in product list - IT-W01-05, CT-W02-01');

    await page.fill('#qty-1', '2');
    await page.click('button[onclick="addToCart(1)"]');
    await $('cardNumber').fill('4000 0000 0000 0002');
    await $('cardExpiry').fill('12/30');
    await $('cardCvv').fill('123');
    await $('payBtn').click();
    await msg('payMsg');
    await shot(page, 'web', '07-payment-declined', 'Checkout with declined card: "Payment declined by bank", no order created, stock unchanged - IT-W03-02');

    await $('cardNumber').fill('4242 4242 4242 4242');
    await $('payBtn').click();
    await page.waitForFunction(() => document.getElementById('payMsg').textContent.includes('placed'));
    await shot(page, 'web', '08-payment-success', 'Checkout with valid card: order PAID, Mouse stock 10 -> 8, order listed in My Orders - IT-W03-01');

    await page.fill('#qty-2', '6');
    await page.click('button[onclick="addToCart(2)"]');
    await $('payBtn').click();
    await page.waitForFunction(() => document.getElementById('payMsg').textContent.includes('Insufficient'));
    await shot(page, 'web', '09-insufficient-stock', 'Ordering 6 keyboards (stock 5): "Insufficient stock" returned before charging - IT-W03-04');
    await $('clearCartBtn').click();

    await page.fill('#qty-2', '2');
    await page.click('button[onclick="addToCart(2)"]');
    await $('payBtn').click();
    await page.waitForFunction(() => document.getElementById('payMsg').textContent.includes('11,700'));
    await shot(page, 'web', '10-discount-order', 'Order of 2 keyboards (13,000) charged 11,700 after 10% discount - IT-W03-03, UT-W07');

    await $('prodName').fill('<b style="color:red;font-size:22px">HACKED</b>');
    await $('prodPrice').fill('10');
    await $('prodStock').fill('1');
    await $('addProductBtn').click();
    await page.waitForFunction(() => document.getElementById('productTable').textContent.includes('HACKED'));
    await shot(page, 'web', '11-bug-html-injection', 'BUG (CT-W02-07): product name containing HTML is accepted and rendered as markup (red "HACKED") - stored XSS risk');
  } finally {
    await page.close();
    server.kill();
  }
}

// ---------------- MOBILE ----------------
function serveStatic(dir, port) {
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.json': 'application/json' };
  return http
    .createServer((req, res) => {
      let p = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(dir, 'index.html');
      res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    })
    .listen(port);
}

async function mobile(browser) {
  const appDir = path.join(ROOT, 'mobile-app');
  const dist = path.join(require('os').tmpdir(), 'posthub-web');
  console.log('Exporting Expo app for web...');
  const r = spawnSync(`npx expo export -p web --output-dir "${dist}"`, { cwd: appDir, shell: true, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  const server = serveStatic(dist, 8765);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const t = (id) => page.locator(`[data-testid="${id}"]`);
  const shotM = (name, caption) => shot(page, 'mobile', name, caption, false);
  try {
    await page.goto('http://localhost:8765');
    await t('login-button').waitFor();
    await t('login-button').click();
    await t('email-error').waitFor();
    await shotM('01-login-validation', 'Login pressed with empty fields: input validation errors shown - UT-M01-06');

    await t('email-input').fill('ali@test.com');
    await t('password-input').fill('wrong99');
    await t('login-button').click();
    await t('form-error').waitFor();
    await shotM('02-login-invalid-credentials', 'Wrong password: stays on Login with "Invalid email or password" - IT-M02-01');

    await t('password-input').fill('ali123');
    await t('login-button').click();
    await t('dashboard-title').waitFor();
    await page.locator('[data-testid^="post-"]').first().waitFor();
    await shotM('03-dashboard-posts', 'Login success -> Dashboard "Hello, Ali Khan" with 5 posts fetched live from jsonplaceholder API - IT-M02-02, IT-M01-01');

    const firstLike = page.locator('[data-testid^="like-"]').first();
    await firstLike.click();
    await t('limit-plus').click();
    await page.waitForFunction(() => document.querySelectorAll('[data-testid^="post-"]').length === 10);
    await shotM('04-dashboard-10-posts-like', 'Pressing "+" re-requests the API and shows 10 posts; first post Liked (button click handler) - IT-M01-02, UT-M03');

    await t('tab-profile').click();
    await t('age-input').fill('abc');
    await t('phone-input').fill('123');
    await t('save-profile').click();
    await page.getByText('Age must be a whole number').waitFor();
    await shotM('05-profile-validation', 'Profile save with invalid age/phone: validation errors shown - CT-M01-03, UT-M02');

    await t('age-input').fill('16');
    await t('phone-input').fill('03001234567');
    await t('save-profile').click();
    await t('profile-message').waitFor();
    await page.getByText('Server data').waitFor();
    await shotM('06-profile-saved', 'Valid profile saved to device storage; server data (city/company) from API shown - CT-M01-04, UT-M05');

    await t('tab-notifications').click();
    await page.getByText(/restricted for users under 18/).waitFor();
    await shotM('07-notifications-under18', 'Alerts after saving age 16: under-18 notice generated from user data - IT-M03-02');

    await t('notif-welcome').click();
    await wait(300);
    await shotM('08-notification-read', 'Tapping a notification marks it read; unread badge decreases - IT-M03-04, CT-M03-04');

    await t('read-all').click();
    await wait(300);
    await shotM('09-all-read', 'Mark all read: badge shows "Alerts" with no count - CT-M03-05');

    await t('tab-profile').click();
    await t('age-input').fill('25');
    await t('save-profile').click();
    await wait(500);
    await shotM('10-bug-read-state-reset', 'BUG (IT-M03-05): after saving the profile, already-read notifications become unread again (badge back to a count)');

    await page.reload();
    await t('dashboard-title').waitFor();
    await shotM('11-session-restored', 'App reopened (page reload): saved session restores Dashboard without login - IT-M02-05');

    await t('tab-profile').click();
    await t('logout-button').click();
    await t('login-button').waitFor();
    await shotM('12-logout', 'Logout returns to Login screen and clears session - IT-M02-04');
  } finally {
    await ctx.close();
    server.close();
  }
}

// ---------------- DSA CLI ----------------
function terminalHtml(cmd, output) {
  const cwd = path.join(ROOT, 'dsa-project');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#fff;width:980px;font-family:Segoe UI,Arial}
  .win{margin:10px;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.35)}
  .bar{background:#2d2d30;color:#ccc;font-size:12px;padding:7px 12px}
  pre{margin:0;background:#012456;color:#eee;font:13px/1.4 Consolas,monospace;padding:12px 14px;white-space:pre-wrap;word-break:break-all}
  </style></head><body><div class="win"><div class="bar">Windows PowerShell</div>
  <pre>PS ${esc(cwd)}&gt; ${esc(cmd)}\n${esc(output.trimEnd())}\nPS ${esc(cwd)}&gt; </pre></div></body></html>`;
}

async function dsa(browser) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 }, deviceScaleFactor: 1.5 });
  const sessions = [
    ['01-linked-list', ['1', '5 3 8', 'i', '10', 'h', '1', 'd', '3', 's', '10', 'r', 'b', '0'], 'Linked List menu: insert tail/head, delete, search, reverse - UT-D01, UT-D02, CT-D01, IT-D03-03'],
    ['02-bst', ['2', '50 30 70 20 40 60 80', 't', 'd', '50', 't', 'b', '0'], 'BST menu: build tree, traversals, delete root (successor 60 replaces it) - UT-D03, CT-D02'],
    ['03-stack-queue', ['3', '1', 'A', '1', 'B', '2', '3', 'X', '3', 'Y', '4', '5', '{[()]}', '5', '(]', '2', '2', 'b', '0'], 'Stack/Queue menu: push/pop (LIFO), enqueue/dequeue (FIFO), bracket check, underflow error - UT-D06'],
    ['04-sorting-search', ['4', '38 27 43 3 9 82 10', 'merge', '43', '0'], 'Sorting menu: merge sort shown as bars before/after, binary search - UT-D04, UT-D05, IT-D03-01'],
    ['05-graph', ['5', 'A-B:4, A-C:1, C-B:2, B-D:5, C-E:8, D-E:3', 'A', 'E', '0'], 'Graph menu: adjacency list, BFS, DFS, Dijkstra shortest path - CT-D03, IT-D02, IT-D03-02'],
    ['06-invalid-input', ['4', '5, abc', '9', '0'], 'Invalid numeric input and invalid menu choice are reported without crashing - IT-D03-05, IT-D03-06'],
    ['07-bug-malformed-edge', ['5', 'A-B-C:2', 'A', 'B-C', '0'], 'BUG (IT-D01-07): malformed edge "A-B-C:2" is accepted and creates a vertex named "B-C"'],
    ['08-bug-bar-width', ['4', '5 300', 'merge', '', '0'], 'BUG (IT-D02-07): bar chart is not scaled - value 300 prints 300 "#" characters and overflows the terminal'],
  ];
  for (const [name, keys, caption] of sessions) {
    const r = spawnSync('python', [path.join(__dirname, 'cli_session.py'), ...keys], { encoding: 'utf8' });
    await page.setContent(terminalHtml('python main.py', (r.stdout || '') + (r.stderr || '')));
    await shot(page, 'dsa', name, caption);
  }
  await page.close();
}

(async () => {
  const which = process.argv[2];
  const browser = await launch(chromium);
  try {
    if (!which || which === 'web') await web(browser);
    if (!which || which === 'dsa') await dsa(browser);
    if (!which || which === 'mobile') await mobile(browser);
  } finally {
    await browser.close();
    const capFile = path.join(OUT, 'ui-captions.json');
    const prev = fs.existsSync(capFile) ? JSON.parse(fs.readFileSync(capFile, 'utf8')) : {};
    fs.writeFileSync(capFile, JSON.stringify({ ...prev, ...captions }, null, 2));
  }
})();
