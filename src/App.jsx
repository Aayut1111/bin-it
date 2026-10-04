import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import NavTabs from "./components/NavTabs";
import LogView from "./components/LogView";
import DashboardView from "./components/DashboardView";
import BadgesView from "./components/BadgesView";
import LearnView from "./components/LearnView";
import { fetchEntries, createEntry, isRetryable } from "./api/entries";
import { computeStats } from "./utils/streak";
import {
  enqueue,
  loadQueue,
  removeFromQueue,
  saveEntriesCache,
  loadEntriesCache,
} from "./utils/offlineQueue";
import { BADGES } from "./data/badges";
import { useLanguage } from "./i18n/LanguageContext";

export default function App() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]); // saved on the server
  const [pending, setPending] = useState(loadQueue); // waiting to upload
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [activeTab, setActiveTab] = useState("log");
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(navigator.onLine);

  const toastTimer = useRef(null);
  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  }, []);

  // Everything the user has logged: saved entries + ones still waiting to upload.
  const allEntries = useMemo(
    () => [
      ...entries,
      ...pending.map((p) => ({
        id: p.localId,
        typeId: p.typeId,
        note: p.note,
        timestamp: p.timestamp,
        ...(p.location ? { location: p.location } : {}),
        ...(p.photo ? { photo: p.photo } : {}),
        pending: true,
      })),
    ],
    [entries, pending]
  );

  const reloadEntries = useCallback(async () => {
    const data = await fetchEntries();
    setEntries(data);
    return data;
  }, []);

  // First load. If the server can't be reached, fall back to the last copy
  // saved on this phone so the app still opens.
  useEffect(() => {
    let cancelled = false;
    fetchEntries()
      .then((data) => {
        if (cancelled) return;
        setEntries(data);
        setLoadState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        const cached = loadEntriesCache();
        if (cached || !navigator.onLine) {
          setEntries(cached || []);
          setLoadState("ready");
        } else {
          setLoadState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loadState === "ready") saveEntriesCache(entries);
  }, [entries, loadState]);

  // Upload queued actions, oldest first. Stops at the first failure and
  // tries again later.
  const flushing = useRef(false);
  const flushQueue = useCallback(async () => {
    if (flushing.current) return;
    if (loadQueue().length === 0) return;
    flushing.current = true;
    let uploaded = 0;
    try {
      for (const item of loadQueue()) {
        try {
          const saved = await createEntry(item);
          removeFromQueue(item.localId);
          setEntries((prev) => [...prev, saved]);
          setPending(loadQueue());
          uploaded++;
        } catch (err) {
          if (isRetryable(err)) break;
          // The server rejected it for good — drop it so it can't block the rest.
          removeFromQueue(item.localId);
          setPending(loadQueue());
        }
      }
    } finally {
      flushing.current = false;
    }
    if (uploaded > 0) {
      showToast(t("toast.synced", { n: uploaded }));
      reloadEntries().catch(() => {});
    }
  }, [reloadEntries, showToast, t]);

  // Retry when the connection comes back, once the app is ready, and every
  // 30 seconds while something is still waiting (e.g. a sleeping server).
  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      flushQueue();
    }
    function handleOffline() {
      setOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flushQueue]);

  useEffect(() => {
    if (loadState !== "ready") return;
    flushQueue();
    const timer = setInterval(flushQueue, 30000);
    return () => clearInterval(timer);
  }, [loadState, flushQueue]);

  const stats = useMemo(() => computeStats(allEntries), [allEntries]);
  const earnedIds = useMemo(
    () => new Set(BADGES.filter((b) => b.test(stats)).map((b) => b.id)),
    [stats]
  );

  // Badge-unlocked toast. The first pass after loading only records what is
  // already earned, so old badges don't pop up on every page load.
  const prevEarnedCount = useRef(0);
  const badgesPrimed = useRef(false);
  useEffect(() => {
    if (loadState !== "ready") return;
    if (!badgesPrimed.current) {
      badgesPrimed.current = true;
      prevEarnedCount.current = earnedIds.size;
      return;
    }
    if (earnedIds.size > prevEarnedCount.current) {
      const newest = BADGES.filter((b) => earnedIds.has(b.id)).pop();
      if (newest) {
        showToast(t("toast.badge", { badge: t(`badge.${newest.id}.label`) }));
      }
    }
    prevEarnedCount.current = earnedIds.size;
  }, [earnedIds, loadState, showToast, t]);

  function queueItem(item) {
    enqueue(item);
    setPending(loadQueue());
    showToast(t("toast.queued"));
  }

  async function handleLog(typeId, note, extra = {}) {
    const item = {
      localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      typeId,
      note,
      timestamp: new Date().toISOString(),
      ...extra,
    };

    if (!navigator.onLine) {
      queueItem(item);
      return;
    }
    try {
      const saved = await createEntry(item);
      setEntries((prev) => [...prev, saved]);
    } catch (err) {
      if (isRetryable(err)) queueItem(item);
      else showToast(t("toast.saveFailed"));
    }
  }

  return (
    <div className="app-shell">
      <Header />
      <NavTabs active={activeTab} onChange={setActiveTab} />

      {!online && <div className="status-banner offline">{t("status.offline")}</div>}
      {pending.length > 0 && (
        <div className="status-banner pending">
          ⏳ {t("status.pending", { n: pending.length })}
        </div>
      )}

      <main className="app-main">
        {loadState === "loading" && <p className="empty-state">{t("status.loading")}</p>}
        {loadState === "error" && <p className="empty-state">{t("status.loadError")}</p>}
        {loadState === "ready" && (
          <>
            {activeTab === "log" && <LogView onLog={handleLog} />}
            {activeTab === "dashboard" && (
              <DashboardView entries={allEntries} stats={stats} />
            )}
            {activeTab === "badges" && (
              <BadgesView stats={stats} onToast={showToast} />
            )}
            {activeTab === "learn" && <LearnView />}
          </>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}