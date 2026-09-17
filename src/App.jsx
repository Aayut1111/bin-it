import { useState } from "react";
import Header from "./components/Header";
import NavTabs from "./components/NavTabs";
import LogView from "./components/LogView";
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function App() {
  const [entries, setEntries] = useLocalStorage("bin-it-entries", []);
  const [activeTab, setActiveTab] = useState("log");

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
        {activeTab !== "log" && (
          <p className="empty-state">You're on the "{activeTab}" tab.</p>
        )}
      </main>
    </div>
  );
}