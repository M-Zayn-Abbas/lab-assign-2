const { suite, catchError } = require('../../test-helpers/recorder');
import { parsePost, parsePosts, parseUser } from '../../src/utils/parser';

suite(
  {
    level: 'unit', id: 'UT-M04', name: 'parsePost() / parsePosts() / parseUser() - Data parsing', uc: 'UC-M02 View Dashboard / UC-M03 Profile',
    objective: 'Verify raw API JSON is converted into clean app models and bad data is handled',
    pre: 'parser.js module loaded', steps: '1. Call parser with raw JSON  2. Compare model with expected',
  },
  [
    {
      title: 'Post title is capitalised and preview created', data: '{id:1, userId:1, title:"hello world", body:"line one\\nline two"}', priority: 'High',
      expected: { id: 1, userId: 1, title: 'Hello world', body: 'line one\nline two', preview: 'line one line two' },
      run: () => parsePost({ id: 1, userId: 1, title: 'hello world', body: 'line one\nline two' }),
    },
    {
      title: 'Missing title becomes "(untitled)"', data: '{id:2, title:"", body:"x"}', expected: '(untitled)',
      run: () => parsePost({ id: 2, title: '', body: 'x' }).title,
    },
    {
      title: 'Preview is limited to 60 characters', data: 'body = "a" x 100', expected: 60,
      run: () => parsePost({ id: 3, title: 't', body: 'a'.repeat(100) }).preview.length,
    },
    { title: 'Null post throws "Invalid post data"', data: 'null', expected: 'throws: Invalid post data', run: catchError(() => parsePost(null)), priority: 'High' },
    {
      title: 'parsePosts skips entries without id', data: '[{id:1,title:"a"}, {title:"no id"}, null]', expected: [1],
      run: () => parsePosts([{ id: 1, title: 'a' }, { title: 'no id' }, null]).map((p) => p.id),
    },
    { title: 'parsePosts rejects non-array input', data: '{"error":"x"}', expected: 'throws: Expected an array of posts', run: catchError(() => parsePosts({ error: 'x' })) },
    {
      title: 'parseUser fills missing nested fields with N/A', data: '{id:5, name:"Sara"}', expected: { id: 5, name: 'Sara', email: '', city: 'N/A', company: 'N/A' },
      run: () => parseUser({ id: 5, name: 'Sara' }),
    },
  ]
);
