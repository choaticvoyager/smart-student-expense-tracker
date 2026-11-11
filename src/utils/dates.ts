const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export type Period = 'all' | 'week' | 'month';

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function daysAgoISO(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return toISODate(date);
}

export function isValidISODate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day || month < 1 || month > 12) {
    return iso;
  }
  return `${day} ${SHORT_MONTHS[month - 1]} ${year}`;
}

export function formatMonthLabel(date = new Date()): string {
  return `${LONG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatRecorded(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function periodRange(period: Period): { from: string; to: string } | null {
  const today = new Date();
  if (period === 'all') {
    return null;
  }

  if (period === 'month') {
    return {
      from: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: toISODate(today),
    };
  }

  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  return { from: toISODate(start), to: toISODate(today) };
}

export function currentMonthRange(): { from: string; to: string } {
  const range = periodRange('month');
  if (!range) {
    const today = todayISO();
    return { from: today, to: today };
  }
  return range;
}
