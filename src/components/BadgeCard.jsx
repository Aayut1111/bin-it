import { useLanguage } from "../i18n/LanguageContext";

export default function BadgeCard({ badge, earned, onShare }) {
  const { t } = useLanguage();
  return (
    <div className={`badge-card${earned ? " earned" : ""}`}>
      <div className="badge-icon" aria-hidden="true">
        {earned ? "🏅" : "🔒"}
      </div>
      <span className="badge-label">{t(`badge.${badge.id}.label`)}</span>
      <span className="badge-description">{t(`badge.${badge.id}.description`)}</span>
      {earned && (
        <button type="button" className="badge-share" onClick={() => onShare(badge)}>
          {t("badge.share")}
        </button>
      )}
    </div>
  );
}