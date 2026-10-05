// Finds e-waste collection points near a position using OpenStreetMap data.
// Overpass answers "what is tagged as recycling near here?" and Nominatim
// turns a typed place name into a position. Both are free public services.

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// OpenStreetMap tags that mean "takes electronics". Order = display order.
export const ACCEPT_KEYS = [
  "electrical_items",
  "small_appliances",
  "computers",
  "mobile_phones",
  "tv",
  "electronics",
  "batteries",
];

export function haversineKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function buildQuery(lat, lng, radiusKm) {
  const r = Math.round(radiusKm * 1000);
  const keys = ACCEPT_KEYS.join("|");
  return `[out:json][timeout:25];
(
  nwr["amenity"="recycling"][~"^recycling:(${keys})$"~"^yes$"](around:${r},${lat},${lng});
  nwr["amenity"="recycling"]["name"~"e-?waste|electronic",i](around:${r},${lat},${lng});
);
out center tags 80;`;
}

async function postWithTimeout(url, query, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      method: "POST",
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function parseElements(elements, origin) {
  const seen = new Set();
  const places = [];
  for (const el of elements || []) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const key = `${el.type}/${el.id}`;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || seen.has(key)) continue;
    seen.add(key);

    const tags = el.tags || {};
    const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], tags["addr:city"]]
      .filter(Boolean)
      .join(", ");
    const phone = (tags.phone || tags["contact:phone"] || "").split(";")[0].trim();

    places.push({
      id: key,
      name: tags.name || "",
      lat,
      lng,
      distanceKm: haversineKm(origin, { lat, lng }),
      accepts: ACCEPT_KEYS.filter((k) => tags[`recycling:${k}`] === "yes"),
      hours: tags.opening_hours || "",
      phone: /^[+\d\s()-]{5,20}$/.test(phone) ? phone : "",
      address,
    });
  }
  return places.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 25);
}

// Returns places sorted nearest first. Throws if every server fails.
export async function findDropoffs(lat, lng, radiusKm) {
  const query = buildQuery(lat, lng, radiusKm);
  let lastError;
  for (const url of OVERPASS_URLS) {
    try {
      const data = await postWithTimeout(url, query, 28000);
      return parseElements(data.elements, { lat, lng });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Search failed");
}

// Turns "Pune" or "Andheri East, Mumbai" into { lat, lng }, or null.
export async function geocodePlace(text) {
  const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const rows = await res.json();
  if (!rows.length) return null;
  return { lat: parseFloat(rows[0].lat), lng: parseFloat(rows[0].lon) };
}

export function googleMapsSearchUrl(lat, lng) {
  const q = encodeURIComponent(`e-waste recycling centre near ${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function directionsUrl(place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
}