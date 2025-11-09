// Pure utility to get countdown parts from a start time
// Returns { hours, minutes, seconds } until startTime (never negative)
export function getCountdownParts(startTime) {
  const now = new Date();
  const start = new Date(startTime);
  let diff = Math.max(0, start - now);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * 1000 * 60;
  const seconds = Math.floor(diff / 1000);
  return { hours, minutes, seconds };
}
