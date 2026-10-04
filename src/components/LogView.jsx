import { useState } from "react";
import { ACTION_TYPES } from "../data/actionTypes";
import { resizeImage } from "../utils/image";
import { useLanguage } from "../i18n/LanguageContext";
import AwarenessCard from "./AwarenessCard";

export default function LogView({ onLog }) {
  const { t } = useLanguage();
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
      setLocationStatus(t("log.geoUnsupported"));
      return;
    }
    setLocationStatus(t("log.geoGetting"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("");
      },
      () => {
        setLocationStatus(t("log.geoFailed"));
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
      setLocationStatus(t("log.photoFailed"));
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
    setConfirmation(t("log.logged", { label: t(`action.${selected.id}.label`) }));
    setSelectedId(null);
    setNote("");
    setLocation(null);
    setLocationStatus("");
    setPhoto(null);
    setTimeout(() => setConfirmation(""), 2500);
  }

  return (
    <section className="view log-view">
      <AwarenessCard />

      <p className="log-prompt">{t("log.prompt")}</p>

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
            <span className="action-label">{t(`action.${action.id}.label`)}</span>
            <span className="action-points">+{action.points}</span>
          </button>
        ))}
      </div>

      {selected && (
        <form className="log-form" onSubmit={handleSubmit}>
          <p className="log-form-description">
            {t(`action.${selected.id}.description`)}
          </p>

          {isDumpingSpot && (
            <>
              <div className="location-row">
                <button
                  type="button"
                  className={`pin-btn${location ? " pinned" : ""}`}
                  onClick={handlePinLocation}
                >
                  {location ? t("log.pinned") : t("log.pin")}
                </button>
                {location && (
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => setLocation(null)}
                  >
                    {t("log.remove")}
                  </button>
                )}
              </div>
              {locationStatus && (
                <p className="location-status">{locationStatus}</p>
              )}

              <div className="photo-row">
                <label className="photo-input-label">
                  {photo ? t("log.changePhoto") : t("log.addPhoto")}
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
                      {t("log.remove")}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          <textarea
            placeholder={t("log.notePlaceholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          <button type="submit" className="log-submit">
            {t("log.submit")}
          </button>
        </form>
      )}

      {confirmation && <p className="log-confirmation">{confirmation}</p>}
    </section>
  );
}