import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getActionType } from "../data/actionTypes";
import { formatRelativeTime } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";

const INDIA_CENTER = [22.5, 79];
const CELL = 0.005; // about 550 m: reports inside one cell count as one hotspot

function isSafeImage(src) {
  return typeof src === "string" && /^(data:image\/(jpeg|png|webp);base64,|https:\/\/)/.test(src);
}

function validLocation(loc) {
  return loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng);
}

// Groups nearby reports and returns the busiest areas first.
function findHotspots(reports) {
  const cells = new Map();
  for (const r of reports) {
    const key = `${Math.round(r.location.lat / CELL)},${Math.round(r.location.lng / CELL)}`;
    const cell = cells.get(key) || { count: 0, lat: 0, lng: 0 };
    cell.count += 1;
    cell.lat += r.location.lat;
    cell.lng += r.location.lng;
    cells.set(key, cell);
  }
  return [...cells.values()]
    .map((c) => ({ count: c.count, lat: c.lat / c.count, lng: c.lng / c.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Builds the popup with DOM nodes (textContent) so notes can never inject HTML.
function buildPopup(entry, t, lang) {
  const type = getActionType(entry.typeId);
  const box = document.createElement("div");
  box.className = "map-popup";

  if (isSafeImage(entry.photo)) {
    const img = document.createElement("img");
    img.src = entry.photo;
    img.alt = "";
    img.className = "map-popup-photo";
    box.appendChild(img);
  }
  const title = document.createElement("strong");
  title.textContent = type ? t(`action.${type.id}.label`) : t("dash.fallbackAction");
  box.appendChild(title);

  if (entry.note) {
    const note = document.createElement("p");
    note.textContent = entry.note;
    box.appendChild(note);
  }
  const time = document.createElement("small");
  time.textContent = formatRelativeTime(entry.timestamp, t, lang);
  box.appendChild(time);

  const link = document.createElement("a");
  link.href = `https://www.google.com/maps?q=${entry.location.lat},${entry.location.lng}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = t("map.openMaps");
  box.appendChild(link);
  return box;
}

export default function MapView({ entries }) {
  const { t, lang } = useLanguage();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const fittedRef = useRef(false);
  const [mode, setMode] = useState("pins"); // pins | heat

  const reports = useMemo(() => entries.filter((e) => validLocation(e.location)), [entries]);
  const hotspots = useMemo(() => findHotspots(reports), [reports]);

  // Create the map once.
  useEffect(() => {
    const map = L.map(containerRef.current, { zoomControl: true }).setView(INDIA_CENTER, 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Heat blobs live in their own pane so they can be blurred into a glow.
    map.createPane("heatPane");
    const pane = map.getPane("heatPane");
    pane.style.zIndex = 450;
    pane.style.filter = "blur(7px)";
    pane.style.pointerEvents = "none";

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const resize = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(resize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw pins or heat whenever the data or the mode changes.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    for (const r of reports) {
      const point = [r.location.lat, r.location.lng];
      if (mode === "heat") {
        L.circleMarker(point, {
          pane: "heatPane",
          radius: 26,
          stroke: false,
          fillColor: "#E8590C",
          fillOpacity: 0.28,
          interactive: false,
        }).addTo(layer);
      } else {
        const icon = L.divIcon({
          html: '<span class="map-pin">📍</span>',
          className: "map-pin-wrap",
          iconSize: [30, 30],
          iconAnchor: [15, 28],
          popupAnchor: [0, -26],
        });
        L.marker(point, { icon }).bindPopup(() => buildPopup(r, t, lang), { minWidth: 160 }).addTo(layer);
      }
    }

    if (!fittedRef.current && reports.length > 0) {
      const bounds = L.latLngBounds(reports.map((r) => [r.location.lat, r.location.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      fittedRef.current = true;
    }
  }, [reports, mode, t, lang]);

  function zoomToAll() {
    const map = mapRef.current;
    if (!map || reports.length === 0) return;
    map.fitBounds(L.latLngBounds(reports.map((r) => [r.location.lat, r.location.lng])), {
      padding: [40, 40],
      maxZoom: 15,
    });
  }

  function flyTo(spot) {
    mapRef.current?.flyTo([spot.lat, spot.lng], 16, { duration: 1 });
  }

  return (
    <section className="view map-view">
      <div className="map-toolbar">
        <div className="map-toggle" role="group">
          <button
            type="button"
            className={mode === "pins" ? "active" : ""}
            onClick={() => setMode("pins")}
          >
            📍 {t("map.pins")}
          </button>
          <button
            type="button"
            className={mode === "heat" ? "active" : ""}
            onClick={() => setMode("heat")}
          >
            🔥 {t("map.heat")}
          </button>
        </div>
        <button type="button" className="map-zoom-all" onClick={zoomToAll} disabled={reports.length === 0}>
          {t("map.zoomAll")}
        </button>
      </div>

      <div className="map-wrap">
        <div ref={containerRef} className="map-canvas" />
      </div>

      <div className="map-meta">
        <span>{t("map.reportCount", { n: reports.length })}</span>
        {mode === "heat" && (
          <span className="map-legend">
            {t("map.legendLow")} <i className="map-legend-bar" /> {t("map.legendHigh")}
          </span>
        )}
      </div>
      <p className="map-note">{t("map.photoNote")}</p>

      {reports.length === 0 ? (
        <p className="empty-state">{t("map.noReports")}</p>
      ) : (
        <>
          <h3 className="section-title">{t("map.hotspotsTitle")}</h3>
          <ul className="hotspot-list">
            {hotspots.map((h, i) => (
              <li key={`${h.lat}-${h.lng}`} className="hotspot-item">
                <span className="hotspot-rank">{i + 1}</span>
                <div className="hotspot-body">
                  <strong>{t("map.hotspotCount", { n: h.count })}</strong>
                  <small>
                    {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                  </small>
                </div>
                <button type="button" className="hotspot-view" onClick={() => flyTo(h)}>
                  {t("map.flyTo")}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}