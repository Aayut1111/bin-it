const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

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
  const res = await fetch(`${API_URL}/api/entries`);
  if (!res.ok) throw new Error("Failed to load entries");
  const rows = await res.json();
  return rows.map(fromRow);
}

export async function createEntry({ typeId, note, location, photo }) {
  const res = await fetch(`${API_URL}/api/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type_id: typeId,
      note,
      location: location || null,
      photo_url: photo || null,
    }),
  });
  if (!res.ok) throw new Error("Failed to save entry");
  const row = await res.json();
  return fromRow(row);
}