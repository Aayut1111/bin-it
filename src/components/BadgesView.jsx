import { BADGES } from "../data/badges";
import BadgeCard from "./BadgeCard";

export default function BadgesView({ stats }) {
  const earnedIds = new Set(
    BADGES.filter((b) => b.test(stats)).map((b) => b.id)
  );

  return (
    <section className="view badges-view">
      <p className="badges-count">
        {earnedIds.size} / {BADGES.length} badges earned
      </p>
      <div className="badge-grid">
        {BADGES.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={earnedIds.has(badge.id)}
          />
        ))}
      </div>
    </section>
  );
}