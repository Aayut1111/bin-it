import { useLanguage } from "../i18n/LanguageContext";

// Action counts that unlock badges (see data/badges.js).
const MILESTONES = [1, 10, 50, 100];

export default function NextMilestone({ total }) {
  const { t } = useLanguage();
  const next = MILESTONES.find((m) => total < m);

  if (!next) {
    return <div className="milestone-card done">🏆 {t("dash.allMilestones")}</div>;
  }

  const previous = [...MILESTONES].reverse().find((m) => m <= total) ?? 0;
  const percent = Math.round(((total - previous) / (next - previous)) * 100);

  return (
    <div className="milestone-card">
      <div className="milestone-top">
        <span>{t("dash.nextMilestone", { n: next })}</span>
        <strong>
          {total} / {next}
        </strong>
      </div>
      <div className="milestone-bar">
        <div className="milestone-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="milestone-note">{t("dash.toGo", { n: next - total })}</p>
    </div>
  );
}