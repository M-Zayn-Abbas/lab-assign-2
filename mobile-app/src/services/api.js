// COMPONENT: API Communication Module
import { parsePosts, parseUser } from '../utils/parser';

export const BASE_URL = 'https://jsonplaceholder.typicode.com';

// UNIT: API response handler
export async function handleApiResponse(response) {
  if (!response) throw new Error('No response from server');
  if (!response.ok) {
    if (response.status === 404) throw new Error('Resource not found (404)');
    if (response.status >= 500) throw new Error(`Server error (${response.status})`);
    throw new Error(`Request failed (${response.status})`);
  }
  try {
    return await response.json();
  } catch {
    throw new Error('Invalid JSON in response');
  }
}

export async function fetchUser(userId, fetchImpl = fetch) {
  const res = await fetchImpl(`${BASE_URL}/users/${userId}`);
  return parseUser(await handleApiResponse(res));
}

export async function fetchPosts(userId, limit = 10, fetchImpl = fetch) {
  const res = await fetchImpl(`${BASE_URL}/posts?userId=${userId}`);
  return parsePosts(await handleApiResponse(res)).slice(0, limit);
}
