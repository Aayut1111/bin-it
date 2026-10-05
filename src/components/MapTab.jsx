import { useState } from "react";
import MapView from "./MapView";
import EwasteFinder from "./EwasteFinder";
import { useLanguage } from "../i18n/LanguageContext";

export default function MapTab({ entries, onLog }) {
  const { t } = useLanguage();
  const [section, setSection] = useState("spots"); // spots | ewaste

  return (
    <div className="map-tab">
      <div className="section-switch" role="group">
        <button
          type="button"
          className={section === "spots" ? "active" : ""}
          onClick={() => setSection("spots")}
        >
          🗑️ {t("map.tabSpots")}
        </button>
        <button
          type="button"
          className={section === "ewaste" ? "active" : ""}
          onClick={() => setSection("ewaste")}
        >
          ♻️ {t("map.tabEwaste")}
        </button>
      </div>

      {section === "spots" ? <MapView entries={entries} /> : <EwasteFinder onLog={onLog} />}
    </div>
  );
}