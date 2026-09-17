import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import NavTabs from "./components/NavTabs";
import LogView from "./components/LogView";
import DashboardView from "./components/DashboardView";
import BadgesView from "./components/BadgesView";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { computeStats } from "./utils/streak";
import { BADGES } from "./data/badges";

export default function App() {
  const [entries, setEntries] = useLocalStorage("bin-it-entries", []);
  const [activeTab, setActiveTab] = useState("log");
  const [toast, setToast] = useState("");

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

  function handleLog(typeId, note) {
    setEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        typeId,
        note,
        timestamp: new Date().toISOString(),
      },
    ]);
  }

  return (
    <div className="app-shell">
      <Header />
      <NavTabs active={activeTab} onChange={setActiveTab} />

      <main className="app-main">
        {activeTab === "log" && <LogView onLog={handleLog} />}
        {activeTab === "dashboard" && (
          <DashboardView entries={entries} stats={stats} />
        )}
        {activeTab === "badges" && <BadgesView stats={stats} />}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}