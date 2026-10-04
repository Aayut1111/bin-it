export function formatRelativeTime(isoString, t, locale) {
  const then = new Date(isoString).getTime();
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return t("time.now");
  if (diffMin < 60) return t("time.min", { n: diffMin });
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return t("time.hour", { n: diffHr });
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return t("time.day", { n: diffDay });
  return new Date(isoString).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}