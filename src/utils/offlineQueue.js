// Actions logged while offline (or while the server is asleep) wait here in
// localStorage and are uploaded later. Each item looks like:
// { localId, typeId, note, timestamp, location?, photo? }

const QUEUE_KEY = "binit:queue";
const CACHE_KEY = "binit:entries-cache";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // storage full or blocked
  }
}

export function loadQueue() {
  const queue = read(QUEUE_KEY, []);
  return Array.isArray(queue) ? queue : [];
}

export function enqueue(item) {
  const queue = loadQueue();
  queue.push(item);
  if (!write(QUEUE_KEY, queue)) {
    // Photos can be large. If storage is full, keep the action but drop the photo.
    queue[queue.length - 1] = { ...item, photo: undefined };
    write(QUEUE_KEY, queue);
  }
}

export function removeFromQueue(localId) {
  write(
    QUEUE_KEY,
    loadQueue().filter((item) => item.localId !== localId)
  );
}

// Last list the server gave us, so the app still opens with no signal.
// Photos are left out to stay well under the storage limit.
export function saveEntriesCache(entries) {
  write(
    CACHE_KEY,
    entries.map(({ photo, ...rest }) => rest) // eslint-disable-line no-unused-vars
  );
}

export function loadEntriesCache() {
  const cached = read(CACHE_KEY, null);
  return Array.isArray(cached) ? cached : null;
}