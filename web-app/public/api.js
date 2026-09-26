// UNIT: Frontend API request handler (works in browser and in Jest/Node 18+)
async function apiRequest(url, { method = 'GET', body, token, fetchImpl } = {}) {
  const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!f) throw new Error('fetch is not available');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await f(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    let data;
    try {
      data = await res.json();
    } catch {
      data = { ok: false, errors: ['Invalid JSON response'] };
    }
    return { status: res.status, ...data };
  } catch (err) {
    return { status: 0, ok: false, errors: ['Network error: ' + err.message] };
  }
}

// UNIT: Format price in PKR
function formatPrice(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return 'Rs. 0';
  return 'Rs. ' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

if (typeof module !== 'undefined') module.exports = { apiRequest, formatPrice };
