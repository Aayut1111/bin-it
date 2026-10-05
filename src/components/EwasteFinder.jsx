import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../i18n/LanguageContext";
import {
  findDropoffs,
  geocodePlace,
  googleMapsSearchUrl,
  directionsUrl,
} from "../utils/ewaste";

const RADII = [5, 10, 25];
const INDIA_CENTER = [22.5, 79];
const OFFICIAL_FAQ = "https://eprewaste.cpcb.gov.in/assets/PDF/faqewaste.pdf";

// Same quote all day, a new one tomorrow.
const quoteOfTheDay = (Math.floor(Date.now() / 86400000) % 5) + 1;

export default function EwasteFinder({ onLog }) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  const [radius, setRadius] = useState(10);
  const [center, setCenter] = useState(null); // { lat, lng }
  const [status, setStatus] = useState("idle"); // idle | locating | loading | done | error
  const [message, setMessage] = useState("");
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [logged, setLogged] = useState({}); // place id -> true

  // Create the map once.
  useEffect(() => {
    const map = L.map(containerRef.current).setView(INDIA_CENTER, 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const resize = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(resize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw "you are here" and the drop-off points.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !center) return;
    layer.clearLayers();

    L.circleMarker([center.lat, center.lng], {
      radius: 9,
      color: "#fff",
      weight: 3,
      fillColor: "#1C7ED6",
      fillOpacity: 1,
    }).addTo(layer);

    const points = [[center.lat, center.lng]];
    places.forEach((p, i) => {
      const icon = L.divIcon({
        html: `<span class="ew-pin">${i + 1}</span>`,
        className: "ew-pin-wrap",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(layer);
      marker.on("click", () => document.getElementById(`ew-${i}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
      points.push([p.lat, p.lng]);
    });

    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 15 });
    else map.setView([center.lat, center.lng], 13);
  }, [center, places]);

  async function runSearch(position, km = radius) {
    setCenter(position);
    setStatus("loading");
    setMessage("");
    try {
      const found = await findDropoffs(position.lat, position.lng, km);
      setPlaces(found);
      setStatus("done");
    } catch {
      setPlaces([]);
      setStatus("error");
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage(t("log.geoUnsupported"));
      return;
    }
    setStatus("locating");
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => runSearch({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setStatus("error");
        setMessage(t("log.geoFailed"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function searchByName(e) {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    setStatus("locating");
    setMessage("");
    try {
      const position = await geocodePlace(text);
      if (!position) {
        setStatus("error");
        setMessage(t("ewaste.placeNotFound"));
        return;
      }
      runSearch(position);
    } catch {
      setStatus("error");
      setMessage(t("ewaste.error"));
    }
  }

  function changeRadius(km) {
    setRadius(km);
    if (center) runSearch(center, km);
  }

  function flyTo(p) {
    mapRef.current?.flyTo([p.lat, p.lng], 16, { duration: 0.8 });
  }

  function logPlace(p) {
    onLog("ewaste-dropoff", p.name || "");
    setLogged((prev) => ({ ...prev, [p.id]: true }));
  }

  const busy = status === "locating" || status === "loading";

  return (
    <div className="ewaste">
      <h3 className="ewaste-title">♻️ {t("ewaste.title")}</h3>
      <p className="ewaste-intro">{t("ewaste.intro")}</p>
      <blockquote className="ewaste-quote">“{t(`ewaste.quote.${quoteOfTheDay}`)}”</blockquote>

      <button type="button" className="ewaste-locate" onClick={useMyLocation} disabled={busy}>
        {t("ewaste.useLocation")}
      </button>

      <form className="ewaste-search" onSubmit={searchByName}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("ewaste.searchPlaceholder")}
          aria-label={t("ewaste.searchPlaceholder")}
        />
        <button type="submit" disabled={busy || !query.trim()}>
          {t("ewaste.searchBtn")}
        </button>
      </form>

      <div className="ewaste-radius" role="group" aria-label={t("ewaste.radius")}>
        <span>{t("ewaste.radius")}:</span>
        {RADII.map((km) => (
          <button
            key={km}
            type="button"
            className={radius === km ? "active" : ""}
            onClick={() => changeRadius(km)}
            disabled={busy}
          >
            {t("ewaste.km", { n: km })}
          </button>
        ))}
      </div>

      <div className="map-wrap">
        <div ref={containerRef} className="map-canvas ewaste-map" />
      </div>

      {busy && (
        <p className="ewaste-status">
          {status === "locating" ? t("log.geoGetting") : t("ewaste.searching")}
        </p>
      )}
      {status === "error" && (
        <p className="ewaste-status warn">{message || t("ewaste.error")}</p>
      )}
      {status === "done" && places.length === 0 && (
        <p className="ewaste-status warn">{t("ewaste.none", { km: radius })}</p>
      )}
      {status === "done" && places.length > 0 && (
        <p className="ewaste-status">{t("ewaste.found", { n: places.length })}</p>
      )}

      {places.length > 0 && (
        <ul className="ewaste-list">
          {places.map((p, i) => (
            <li key={p.id} id={`ew-${i}`} className="ewaste-card">
              <div className="ewaste-card-top" onClick={() => flyTo(p)}>
                <span className="ew-rank">{i + 1}</span>
                <div className="ewaste-card-body">
                  <strong>{p.name || t("ewaste.unnamed")}</strong>
                  {p.address && <small>{p.address}</small>}
                  {p.accepts.length > 0 && (
                    <small>
                      {t("ewaste.accepts", {
                        list: p.accepts.map((k) => t(`ewaste.item.${k}`)).join(", "),
                      })}
                    </small>
                  )}
                  {p.hours && <small>🕒 {p.hours}</small>}
                </div>
                <span className="ewaste-distance">{p.distanceKm.toFixed(1)} km</span>
              </div>
              <div className="ewaste-card-actions">
                <a href={directionsUrl(p)} target="_blank" rel="noopener noreferrer">
                  {t("ewaste.directions")}
                </a>
                {p.phone && <a href={`tel:${p.phone.replace(/\s+/g, "")}`}>{t("ewaste.call")}</a>}
                <button
                  type="button"
                  className="ewaste-log"
                  onClick={() => logPlace(p)}
                  disabled={logged[p.id]}
                >
                  {logged[p.id] ? t("ewaste.logged") : t("ewaste.logIt")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {center && (
        <a
          className="ewaste-google"
          href={googleMapsSearchUrl(center.lat, center.lng)}
          target="_blank"
          rel="noopener noreferrer"
        >
          🔎 {t("ewaste.googleSearch")}
        </a>
      )}

      <p className="ewaste-disclaimer">{t("ewaste.disclaimer")}</p>

      <h3 className="section-title">{t("ewaste.why.title")}</h3>
      <ul className="ewaste-why">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n}>{t(`ewaste.why.${n}`)}</li>
        ))}
      </ul>

      <h3 className="section-title">{t("ewaste.quotesTitle")}</h3>
      <ul className="ewaste-quotes">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n}>“{t(`ewaste.quote.${n}`)}”</li>
        ))}
      </ul>

      <h3 className="section-title">{t("ewaste.tipsTitle")}</h3>
      <ul className="ewaste-tips">
        {[1, 2, 3, 4].map((n) => (
          <li key={n}>{t(`ewaste.tip.${n}`)}</li>
        ))}
      </ul>
      <a className="ewaste-official" href={OFFICIAL_FAQ} target="_blank" rel="noopener noreferrer">
        {t("ewaste.officialLink")}
      </a>
    </div>
  );
}