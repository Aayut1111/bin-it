import { BADGES } from "../data/badges";
import BadgeCard from "./BadgeCard";
import { useLanguage } from "../i18n/LanguageContext";
import { shareBadge } from "../utils/share";

export default function BadgesView({ stats, onToast }) {
  const { t } = useLanguage();
  const earnedIds = new Set(
    BADGES.filter((b) => b.test(stats)).map((b) => b.id)
  );

  async function handleShare(badge) {
    const badgeLabel = t(`badge.${badge.id}.label`);
    try {
      const result = await shareBadge({
        earnedText: t("share.earned"),
        badgeLabel,
        onText: t("share.on"),
        shareText: t("share.text", { badge: badgeLabel }),
      });
      if (result === "downloaded") onToast(t("toast.imageSaved"));
    } catch {
      onToast(t("toast.shareFailed"));
    }
  }

  return (
    <section className="view badges-view">
      <p className="badges-count">
        {t("badge.count", { earned: earnedIds.size, total: BADGES.length })}
      </p>
      <div className="badge-grid">
        {BADGES.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={earnedIds.has(badge.id)}
            onShare={handleShare}
          />
        ))}
      </div>
    </section>
  );
}