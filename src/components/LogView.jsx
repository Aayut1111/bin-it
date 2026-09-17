import { useState } from "react";
import { ACTION_TYPES } from "../data/actionTypes";
import { resizeImage } from "../utils/image";

export default function LogView({ onLog }) {
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [photo, setPhoto] = useState(null);

  const selected = ACTION_TYPES.find((a) => a.id === selectedId) || null;
  const isDumpingSpot = selected?.id === "reported-spot";

  function selectAction(id) {
    setSelectedId((current) => (current === id ? null : id));
    setLocation(null);
    setLocationStatus("");
    setPhoto(null);
  }

  function handlePinLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation isn't supported in this browser.");
      return;
    }
    setLocationStatus("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("");
      },
      () => {
        setLocationStatus(
          "Couldn't get your location — check this site's location permission."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      setPhoto(dataUrl);
    } catch {
      setLocationStatus("Couldn't read that photo — try a different one.");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return;

    const extra = {};
    if (isDumpingSpot) {
      if (location) extra.location = location;
      if (photo) extra.photo = photo;
    }

    onLog(selected.id, note.trim(), extra);
    setConfirmation(`Logged: ${selected.label}`);
    setSelectedId(null);
    setNote("");
    setLocation(null);
    setLocationStatus("");
    setPhoto(null);
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
            onClick={() => selectAction(action.id)}
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

          {isDumpingSpot && (
            <>
              <div className="location-row">
                <button
                  type="button"
                  className={`pin-btn${location ? " pinned" : ""}`}
                  onClick={handlePinLocation}
                >
                  {location ? "📍 Location pinned" : "📍 Pin My Location"}
                </button>
                {location && (
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => setLocation(null)}
                  >
                    remove
                  </button>
                )}
              </div>
              {locationStatus && (
                <p className="location-status">{locationStatus}</p>
              )}

              <div className="photo-row">
                <label className="photo-input-label">
                  {photo ? "Change Photo" : "📷 Add Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                  />
                </label>
                {photo && (
                  <>
                    <img src={photo} alt="" className="photo-preview" />
                    <button
                      type="button"
                      className="photo-remove"
                      onClick={() => setPhoto(null)}
                    >
                      remove
                    </button>
                  </>
                )}
              </div>
            </>
          )}

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
