export type VulnerabilityStatus =
  | { kind: 'upcoming'; opensInMs: number }
  | { kind: 'open'; closesInMs: number }
  | { kind: 'closed' };

export function getVulnerabilityStatus(start: string, end: string): VulnerabilityStatus {
  const now = Date.now();
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();

  if (now < startMs) return { kind: 'upcoming', opensInMs: startMs - now };
  if (now < endMs) return { kind: 'open', closesInMs: endMs - now };
  return { kind: 'closed' };
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
