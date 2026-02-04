export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function todayKey() {
  return toDateKey(new Date());
}

export function lastNDaysKeys(days: number) {
  const keys: string[] = [];
  const base = new Date();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() - i);
    keys.push(toDateKey(d));
  }
  return keys;
}
