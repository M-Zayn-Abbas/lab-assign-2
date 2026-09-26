const { suite, catchError } = require('../../test-helpers/recorder');
import { fetchPosts, fetchUser, BASE_URL } from '../../src/services/api';

const rawPosts = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, userId: 1, title: `post ${i + 1}`, body: `body ${i + 1}` }));
const okFetch = (body) => jest.fn(async () => ({ ok: true, status: 200, json: async () => body }));

suite(
  {
    level: 'component', id: 'CT-M02', name: 'API Communication Module', uc: 'UC-M02 View Dashboard',
    objective: 'Verify fetchPosts/fetchUser build correct requests and return parsed models or errors',
    pre: 'fetch replaced with Jest stub returning jsonplaceholder-shaped data', steps: 'Call fetchPosts/fetchUser with stub fetch',
    meta: {
      component: 'API Communication Module (src/services/api.js)',
      units: ['fetchPosts()', 'fetchUser()', 'handleApiResponse()', 'parsePosts() / parseUser()'],
    },
  },
  [
    {
      title: 'fetchPosts calls the correct URL', data: 'fetchPosts(userId=1)', expected: `${BASE_URL}/posts?userId=1`, priority: 'High',
      run: async () => { const f = okFetch(rawPosts(3)); await fetchPosts(1, 10, f); return f.mock.calls[0][0]; },
    },
    {
      title: 'fetchPosts limits and parses results', data: 'server returns 10 posts, limit=5', expectedText: '5 posts, first title "Post 1"', priority: 'High',
      run: () => fetchPosts(1, 5, okFetch(rawPosts(10))),
      actualText: (p) => `${p.length} posts, first title "${p[0].title}"`,
      check: (p) => { expect(p).toHaveLength(5); expect(p[0].title).toBe('Post 1'); },
    },
    {
      title: 'fetchUser returns parsed user model', data: 'server returns {id:1, name:"Leanne Graham", address:{city:"Gwenborough"}, company:{name:"Romaguera-Crona"}}',
      expected: { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz', city: 'Gwenborough', company: 'Romaguera-Crona' },
      run: () => fetchUser(1, okFetch({ id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz', address: { city: 'Gwenborough' }, company: { name: 'Romaguera-Crona' } })),
    },
    {
      title: 'Server error is propagated as readable message', data: 'server returns 500', expected: 'throws: Server error (500)', priority: 'High',
      run: catchError(() => fetchPosts(1, 5, jest.fn(async () => ({ ok: false, status: 500 })))),
    },
    {
      title: 'Network failure is propagated', data: 'fetch rejects "Network request failed"', expected: 'throws: Network request failed',
      run: catchError(() => fetchPosts(1, 5, jest.fn(async () => { throw new Error('Network request failed'); }))),
    },
    {
      title: 'Malformed items in server list are skipped', data: 'server returns [{id:1}, {title:"broken"}, {id:3}]', expected: [1, 3],
      run: async () => (await fetchPosts(1, 10, okFetch([{ id: 1, title: 'a' }, { title: 'broken' }, { id: 3, title: 'c' }]))).map((p) => p.id),
    },
  ]
);
