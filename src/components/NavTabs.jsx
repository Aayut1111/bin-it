const TABS = [
  { id: "log", label: "Log" },
  { id: "dashboard", label: "Dashboard" },
  { id: "badges", label: "Badges" },
];

export default function NavTabs({ active, onChange }) {
  return (
    <nav className="nav-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`nav-tab${active === tab.id ? " active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}