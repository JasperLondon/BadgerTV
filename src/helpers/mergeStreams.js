// Merges two arrays of stream objects by id, preserving scroll position and updating changed fields.
// If a stream exists in both, update its fields; if new, add; if missing, remove.
// Used for background refresh to avoid blowing away scroll position.
export default function mergeStreams(prev, next) {
  if (!Array.isArray(prev) || !Array.isArray(next)) return next || [];
  const nextMap = new Map(next.map(s => [s.id, s]));
  // Update existing, keep order of prev for scroll position
  const merged = prev
    .map(s => (nextMap.has(s.id) ? { ...s, ...nextMap.get(s.id) } : null))
    .filter(Boolean);
  // Add new streams that weren't in prev
  const prevIds = new Set(prev.map(s => s.id));
  next.forEach(s => {
    if (!prevIds.has(s.id)) merged.push(s);
  });
  return merged;
}