import { useMemo, useState } from "react";
import Header from "./components/Header";
import NavTabs from "./components/NavTabs";
import LogView from "./components/LogView";
import DashboardView from "./components/DashboardView";
import BadgesView from "./components/BadgesView";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { computeStats } from "./utils/streak";

export default function App() {
  const [entries, setEntries] = useLocalStorage("bin-it-entries", []);
  const [activeTab, setActiveTab] = useState("log");
  const stats = useMemo(() => computeStats(entries), [entries]);

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
    </div>
  );
}