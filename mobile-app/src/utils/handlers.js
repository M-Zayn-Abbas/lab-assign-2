// UNIT: Button click handlers (pure state updaters, used by screens)

// Like / unlike a post. Returns a NEW set of liked ids.
export function toggleLike(likedIds, postId) {
  const next = new Set(likedIds);
  if (next.has(postId)) next.delete(postId);
  else next.add(postId);
  return next;
}

// Counter with bounds (used for "posts to show" stepper on Dashboard)
export function stepCounter(value, step, min = 5, max = 20) {
  const next = value + step;
  if (next < min) return min;
  if (next > max) return max;
  return next;
}
