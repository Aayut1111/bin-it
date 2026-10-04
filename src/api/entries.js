const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

// Thrown when the request never reached the server (no signal, DNS, etc.).
export class NetworkError extends Error {}

function fromRow(row) {
  return {
    id: row.id,
    typeId: row.type_id,
    note: row.note || "",
    timestamp: row.created_at,
    ...(row.location ? { location: row.location } : {}),
    ...(row.photo_url ? { photo: row.photo_url } : {}),
  };
}

export async function fetchEntries() {
  let res;
  try {
    res = await fetch(`${API_URL}/api/entries`);
  } catch {
    throw new NetworkError("Network unavailable");
  }
  if (!res.ok) throw new Error("Failed to load entries");
  const rows = await res.json();
  return rows.map(fromRow);
}

export async function createEntry({ typeId, note, location, photo, timestamp }) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type_id: typeId,
        note,
        location: location || null,
        photo_url: photo || null,
        created_at: timestamp || null,
      }),
    });
  } catch {
    throw new NetworkError("Network unavailable");
  }
  if (!res.ok) {
    const err = new Error("Failed to save entry");
    err.status = res.status;
    throw err;
  }
  const row = await res.json();
  return fromRow(row);
}

// True when it's worth keeping the action and trying again later.
export function isRetryable(err) {
  return err instanceof NetworkError || (err && err.status >= 500);
}