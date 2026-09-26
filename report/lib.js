const fs = require('fs');

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const FG = { 30: '#555', 31: '#f14c4c', 32: '#23d18b', 33: '#e5e510', 34: '#3b8eea', 35: '#d670d6', 36: '#29b8db', 37: '#e5e5e5',
  90: '#8a8a8a', 91: '#f14c4c', 92: '#23d18b', 93: '#f5f543', 94: '#3b8eea', 95: '#d670d6', 96: '#29b8db', 97: '#fff' };

// Minimal ANSI SGR -> HTML converter (enough for Jest's colour output)
function ansiToHtml(s) {
  const st = { fg: null, bg: null, bold: false, dim: false, inv: false };
  let out = '';
  let open = false;
  const parts = s.replace(/\r/g, '').split(/\x1b\[([0-9;]*)m/);
  parts.forEach((p, i) => {
    if (i % 2 === 0) {
      out += esc(p);
      return;
    }
    for (const c of (p || '0').split(';').map(Number)) {
      if (c === 0) Object.assign(st, { fg: null, bg: null, bold: false, dim: false, inv: false });
      else if (c === 1) st.bold = true;
      else if (c === 2) st.dim = true;
      else if (c === 22) st.bold = st.dim = false;
      else if (c === 7) st.inv = true;
      else if (c === 27) st.inv = false;
      else if (c === 39) st.fg = null;
      else if (c === 49) st.bg = null;
      else if (FG[c]) st.fg = FG[c];
      else if (c >= 40 && c <= 47) st.bg = FG[c - 10];
    }
    if (open) out += '</span>';
    let fg = st.fg, bg = st.bg;
    if (st.inv) { bg = fg || '#d4d4d4'; fg = '#1e1e1e'; }
    out += `<span style="${fg ? `color:${fg};` : ''}${bg ? `background:${bg};` : ''}${st.bold ? 'font-weight:700;' : ''}${st.dim ? 'opacity:.7;' : ''}">`;
    open = true;
  });
  return out + (open ? '</span>' : '');
}

const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
function launch(chromium) {
  const executablePath = BROWSERS.find((b) => fs.existsSync(b));
  return chromium.launch({ executablePath, headless: true });
}

module.exports = { esc, ansiToHtml, launch };
