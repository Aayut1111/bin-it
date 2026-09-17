import StatCard from "./StatCard";
import ActivityFeed from "./ActivityFeed";
import ActivityStrip from "./ActivityStrip";
import { getRecentActivity } from "../utils/streak";

export default function DashboardView({ entries, stats }) {
  const recentDays = getRecentActivity(entries, 14);

  return (
    <section className="view dashboard-view">
      <div className="stat-grid">
        <StatCard label="Total Actions" value={stats.totalActions} />
        <StatCard label="Impact Points" value={stats.impactPoints} />
        <StatCard label="Current Streak" value={`${stats.currentStreak}d`} />
      </div>

      <h3 className="section-title">Last 14 Days</h3>
      <ActivityStrip days={recentDays} />

      <h3 className="section-title">Recent Activity</h3>
      <ActivityFeed entries={entries} />
    </section>
  );
}