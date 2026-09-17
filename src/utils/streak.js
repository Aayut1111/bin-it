import { getActionType } from "../data/actionTypes";

export function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

// Every distinct calendar day (YYYY-MM-DD) that has at least one entry,
// sorted oldest first.
export function getActiveDays(entries) {
  return [...new Set(entries.map((e) => e.timestamp.slice(0, 10)))].sort();
}

// Days logged in a row, counting backward from today. If nothing has been
// logged yet today, the streak can still be "alive" through yesterday —
// it only breaks once a full day is missed.
export function computeCurrentStreak(entries) {
  const daySet = new Set(getActiveDays(entries));
  let streak = 0;
  const cursor = new Date();
  if (!daySet.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daySet.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Longest run of consecutive calendar days anywhere in the history.
export function computeBestStreak(entries) {
  const days = getActiveDays(entries);
  if (days.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const diffDays = Math.round(
      (new Date(days[i]) - new Date(days[i - 1])) / 86400000
    );
    run = diffDays === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

export function computeStats(entries) {
  const totalActions = entries.length;
  const impactPoints = entries.reduce(
    (sum, e) => sum + (getActionType(e.typeId)?.points || 0),
    0
  );
  return {
    totalActions,
    impactPoints,
    currentStreak: computeCurrentStreak(entries),
    bestStreak: computeBestStreak(entries),
  };
}

// Activity counts for the last n days (default 14), oldest first — used to
// draw a small contribution-style bar strip on the dashboard.
export function getRecentActivity(entries, n = 14) {
  const counts = {};
  entries.forEach((e) => {
    const key = e.timestamp.slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  });
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    days.push({ date: key, count: counts[key] || 0 });
  }
  return days;
}