const { suite, catchError } = require('../../test-helpers/recorder');
import { handleApiResponse } from '../../src/services/api';

const res = (status, body, badJson = false) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    if (badJson) throw new SyntaxError('Unexpected token <');
    return body;
  },
});

suite(
  {
    level: 'unit', id: 'UT-M06', name: 'handleApiResponse() - API response handler', uc: 'UC-M02 View Dashboard',
    objective: 'Verify HTTP responses are turned into data or meaningful error messages',
    pre: 'api.js module loaded; fake Response objects', steps: '1. Build fake response  2. Call handleApiResponse(response)  3. Compare result/error',
  },
  [
    { title: '200 OK returns parsed JSON', data: 'status 200, body [{id:1}]', expected: [{ id: 1 }], run: () => handleApiResponse(res(200, [{ id: 1 }])), priority: 'High' },
    { title: '404 gives "Resource not found (404)"', data: 'status 404', expected: 'throws: Resource not found (404)', run: catchError(() => handleApiResponse(res(404))) },
    { title: '500 gives "Server error (500)"', data: 'status 500', expected: 'throws: Server error (500)', run: catchError(() => handleApiResponse(res(500))), priority: 'High' },
    { title: 'Other 4xx gives generic "Request failed"', data: 'status 401', expected: 'throws: Request failed (401)', run: catchError(() => handleApiResponse(res(401))) },
    { title: 'Invalid JSON body is reported', data: 'status 200, body "<html>"', expected: 'throws: Invalid JSON in response', run: catchError(() => handleApiResponse(res(200, null, true))) },
    { title: 'Missing response is reported', data: 'undefined', expected: 'throws: No response from server', run: catchError(() => handleApiResponse(undefined)), priority: 'Low' },
  ]
);
