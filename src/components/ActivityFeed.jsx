import { getActionType } from "../data/actionTypes";
import { formatRelativeTime } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";

export default function ActivityFeed({ entries }) {
  const { t, lang } = useLanguage();

  if (entries.length === 0) {
    return <p className="empty-state">{t("dash.empty")}</p>;
  }

  const recent = [...entries]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 10);

  return (
    <ul className="activity-feed">
      {recent.map((entry) => {
        const type = getActionType(entry.typeId);
        return (
          <li key={entry.id} className="activity-item">
            <span
              className="activity-icon"
              dangerouslySetInnerHTML={{ __html: type?.icon || "" }}
            />
            {entry.photo && (
              <img src={entry.photo} alt="" className="activity-photo" />
            )}
            <div className="activity-body">
              <span className="activity-label">
                {type ? t(`action.${type.id}.label`) : t("dash.fallbackAction")}
              </span>
              {entry.note && <span className="activity-note">{entry.note}</span>}
              {entry.pending && (
                <span className="activity-pending">⏳ {t("dash.waiting")}</span>
              )}
              {entry.location && (
                <a
                  className="activity-map-link"
                  href={`https://www.google.com/maps?q=${entry.location.lat},${entry.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("dash.viewMap")}
                </a>
              )}
            </div>
            <span className="activity-time">
              {formatRelativeTime(entry.timestamp, t, lang)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}