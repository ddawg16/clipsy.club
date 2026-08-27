export function rate(value: number | null): string {
  return value == null ? '—' : `$${value % 1 === 0 ? value : value.toFixed(2)}`;
}

export function views(value: number | null): string {
  if (value == null) return 'No view minimum';
  return `${new Intl.NumberFormat('en-US').format(value)} views to qualify`;
}

export function timeLeft(endsAt: string | null): string {
  if (!endsAt) return 'No deadline';
  const ms = new Date(endsAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return 'No deadline';
  if (ms <= 0) return 'Closed';

  const hours = Math.floor(ms / 3_600_000);
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ${hours % 24}h left`;
  return `${days}d left`;
}

export function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return '';
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

export function payout(days: number | null): string {
  return days == null ? 'Varies' : `${days} days`;
}

/** Human freshness from the last real ingest run. Never claims a schedule. */
export function freshness(iso: string | null): string {
  if (!iso) return 'recently';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (Number.isNaN(mins) || mins < 0) return 'just now';
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/** Compact dollars: 1250 -> "$1.3K", 4_200_000 -> "$4.2M". */
export function money(value: number | null): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return '—';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return `$${Math.round(value)}`;
}

/** Exact dollars with separators, for the earnings calculator. */
export function dollars(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '$0';
  return `$${Math.round(value).toLocaleString('en-US')}`;
}
