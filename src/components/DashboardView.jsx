import StatCard from "./StatCard";
import NextMilestone from "./NextMilestone";
import ActivityFeed from "./ActivityFeed";
import ActivityStrip from "./ActivityStrip";
import { getRecentActivity } from "../utils/streak";
import { useLanguage } from "../i18n/LanguageContext";

export default function DashboardView({ entries, stats }) {
  const { t } = useLanguage();
  const recentDays = getRecentActivity(entries, 14);

  return (
    <section className="view dashboard-view">
      <div className="stat-grid">
        <StatCard icon="♻️" label={t("dash.total")} value={stats.totalActions} />
        <StatCard icon="⭐" label={t("dash.points")} value={stats.impactPoints} />
        <StatCard
          icon="🔥"
          label={t("dash.streak")}
          value={t("dash.days", { n: stats.currentStreak })}
        />
      </div>

      <NextMilestone total={stats.totalActions} />

      <h3 className="section-title">{t("dash.last14")}</h3>
      <ActivityStrip days={recentDays} />

      <h3 className="section-title">{t("dash.recent")}</h3>
      <ActivityFeed entries={entries} />
    </section>
  );
}