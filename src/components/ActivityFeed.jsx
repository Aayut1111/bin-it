import { getActionType } from "../data/actionTypes";
import { formatRelativeTime } from "../utils/format";

export default function ActivityFeed({ entries }) {
  if (entries.length === 0) {
    return (
      <p className="empty-state">
        No actions logged yet — head to the Log tab and add your first one.
      </p>
    );
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
            <div className="activity-body">
              <span className="activity-label">{type?.label || "Action"}</span>
              {entry.note && <span className="activity-note">{entry.note}</span>}
            </div>
            <span className="activity-time">
              {formatRelativeTime(entry.timestamp)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}