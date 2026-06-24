/**
 * Format a timestamp as a human-readable "time ago" string.
 * Example: "2m ago", "3h ago", "1d ago"
 */
export function timeAgo(epochMs: number): string {
  const now = Date.now();
  const diffSeconds = Math.floor((now - epochMs) / 1000);

  if (diffSeconds < 60) return 'just now';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
