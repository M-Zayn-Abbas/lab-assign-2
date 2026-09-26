// UNIT: Data parsing functions (API JSON -> app models)

export function parsePost(raw) {
  if (!raw || typeof raw !== 'object' || raw.id === undefined) {
    throw new Error('Invalid post data');
  }
  const title = String(raw.title || '').trim();
  return {
    id: raw.id,
    userId: raw.userId,
    title: title ? title.charAt(0).toUpperCase() + title.slice(1) : '(untitled)',
    body: String(raw.body || '').trim(),
    preview: String(raw.body || '').trim().replace(/\s+/g, ' ').slice(0, 60),
  };
}

export function parsePosts(rawList) {
  if (!Array.isArray(rawList)) throw new Error('Expected an array of posts');
  return rawList.filter((p) => p && p.id !== undefined).map(parsePost);
}

export function parseUser(raw) {
  if (!raw || typeof raw !== 'object' || !raw.id) throw new Error('Invalid user data');
  return {
    id: raw.id,
    name: raw.name || 'Unknown',
    email: raw.email || '',
    city: raw.address?.city || 'N/A',
    company: raw.company?.name || 'N/A',
  };
}
