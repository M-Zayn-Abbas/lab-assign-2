const { suite } = require('../helpers/recorder');
const { apiRequest } = require('../../public/api');

// Stub fetch that returns a canned response and remembers what it was called with
function stubFetch({ status = 200, json, jsonThrows = false, networkError } = {}) {
  const f = jest.fn(async () => {
    if (networkError) throw new Error(networkError);
    return {
      status,
      json: async () => {
        if (jsonThrows) throw new SyntaxError('Unexpected token <');
        return json;
      },
    };
  });
  return f;
}

suite(
  {
    level: 'unit', id: 'UT-W05', name: 'apiRequest() - Frontend API request handler', uc: 'UC-W03 Browse Products / all API calls',
    objective: 'Verify the API request handler builds requests correctly and normalises responses/errors',
    pre: 'public/api.js loaded; fetch replaced by a Jest stub (no server needed)',
    steps: '1. Create stub fetch  2. Call apiRequest(url, options)  3. Inspect result and stub call arguments',
  },
  [
    {
      title: 'GET request returns status + parsed JSON body', data: 'GET /api/products; stub -> 200 {ok:true, products:[{id:1}]}',
      expected: { status: 200, ok: true, products: [{ id: 1 }] }, priority: 'High',
      run: () => apiRequest('/api/products', { fetchImpl: stubFetch({ json: { ok: true, products: [{ id: 1 }] } }) }),
    },
    {
      title: 'POST request sends JSON body and Content-Type header', data: 'POST /api/login body={email:"a@b.com"}',
      expected: { method: 'POST', body: '{"email":"a@b.com"}', contentType: 'application/json' },
      run: async () => {
        const f = stubFetch({ json: { ok: true } });
        await apiRequest('/api/login', { method: 'POST', body: { email: 'a@b.com' }, fetchImpl: f });
        const opts = f.mock.calls[0][1];
        return { method: opts.method, body: opts.body, contentType: opts.headers['Content-Type'] };
      },
    },
    {
      title: 'Token is sent as Bearer Authorization header', data: 'token="abc123"', expected: 'Bearer abc123', priority: 'High',
      run: async () => {
        const f = stubFetch({ json: { ok: true } });
        await apiRequest('/api/orders', { token: 'abc123', fetchImpl: f });
        return f.mock.calls[0][1].headers.Authorization;
      },
    },
    {
      title: 'Non-JSON response is converted to an error object', data: 'stub -> 500, body is HTML (json() throws)',
      expected: { status: 500, ok: false, errors: ['Invalid JSON response'] },
      run: () => apiRequest('/api/x', { fetchImpl: stubFetch({ status: 500, jsonThrows: true }) }),
    },
    {
      title: 'Network failure returns status 0 with message', data: 'stub throws "Failed to fetch"',
      expected: { status: 0, ok: false, errors: ['Network error: Failed to fetch'] }, priority: 'High',
      run: () => apiRequest('/api/x', { fetchImpl: stubFetch({ networkError: 'Failed to fetch' }) }),
    },
    {
      title: 'No Authorization header when token is absent', data: 'token=undefined', expected: undefined, priority: 'Low', expectedText: 'undefined (header not set)',
      run: async () => {
        const f = stubFetch({ json: { ok: true } });
        await apiRequest('/api/products', { fetchImpl: f });
        return f.mock.calls[0][1].headers.Authorization;
      },
    },
  ]
);
