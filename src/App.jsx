import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import NavTabs from "./components/NavTabs";
import LogView from "./components/LogView";
import DashboardView from "./components/DashboardView";
import BadgesView from "./components/BadgesView";
import { fetchEntries, createEntry } from "./api/entries";
import { computeStats } from "./utils/streak";
import { BADGES } from "./data/badges";

export default function App() {
  const [entries, setEntries] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [activeTab, setActiveTab] = useState("log");
  const [toast, setToast] = useState("");

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
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => computeStats(entries), [entries]);
  const earnedIds = useMemo(
    () => new Set(BADGES.filter((b) => b.test(stats)).map((b) => b.id)),
    [stats]
  );
  const prevEarnedCount = useRef(earnedIds.size);

  useEffect(() => {
    if (earnedIds.size > prevEarnedCount.current) {
      const newest = BADGES.filter((b) => earnedIds.has(b.id)).pop();
      if (newest) {
        setToast(`Badge unlocked: ${newest.label}`);
        const timer = setTimeout(() => setToast(""), 3000);
        prevEarnedCount.current = earnedIds.size;
        return () => clearTimeout(timer);
      }
    }
    prevEarnedCount.current = earnedIds.size;
  }, [earnedIds]);

  async function handleLog(typeId, note, extra = {}) {
    try {
      const saved = await createEntry({ typeId, note, ...extra });
      setEntries((prev) => [...prev, saved]);
    } catch {
      setToast("Couldn't save that — check your connection and try again.");
      setTimeout(() => setToast(""), 3000);
    }
  }

  return (
    <div className="app-shell">
      <Header />
      <NavTabs active={activeTab} onChange={setActiveTab} />

      <main className="app-main">
        {loadState === "loading" && <p className="empty-state">Loading your activity…</p>}
        {loadState === "error" && (
          <p className="empty-state">Couldn't reach the server. Check your connection and reload.</p>
        )}
        {loadState === "ready" && (
          <>
            {activeTab === "log" && <LogView onLog={handleLog} />}
            {activeTab === "dashboard" && (
              <DashboardView entries={entries} stats={stats} />
            )}
            {activeTab === "badges" && <BadgesView stats={stats} />}
          </>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}