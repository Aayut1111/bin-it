export default function BadgeCard({ badge, earned }) {
  return (
    <div className={`badge-card${earned ? " earned" : ""}`}>
      <div className="badge-icon" aria-hidden="true">
        {earned ? "🏅" : "🔒"}
      </div>
      <span className="badge-label">{badge.label}</span>
      <span className="badge-description">{badge.description}</span>
    </div>
  );
}