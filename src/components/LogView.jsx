import { useState } from "react";
import { ACTION_TYPES } from "../data/actionTypes";

export default function LogView({ onLog }) {
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const selected = ACTION_TYPES.find((a) => a.id === selectedId) || null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return;
    onLog(selected.id, note.trim());
    setConfirmation(`Logged: ${selected.label}`);
    setSelectedId(null);
    setNote("");
    setTimeout(() => setConfirmation(""), 2500);
  }

  return (
    <section className="view log-view">
      <p className="log-prompt">What did you just do?</p>

      <div className="action-grid">
        {ACTION_TYPES.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`action-card${selectedId === action.id ? " selected" : ""}`}
            onClick={() => setSelectedId(action.id)}
          >
            <span
              className="action-icon"
              dangerouslySetInnerHTML={{ __html: action.icon }}
            />
            <span className="action-label">{action.label}</span>
            <span className="action-points">+{action.points}</span>
          </button>
        ))}
      </div>

      {selected && (
        <form className="log-form" onSubmit={handleSubmit}>
          <p className="log-form-description">{selected.description}</p>
          <textarea
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          <button type="submit" className="log-submit">
            Log It
          </button>
        </form>
      )}

      {confirmation && <p className="log-confirmation">{confirmation}</p>}
    </section>
  );
}