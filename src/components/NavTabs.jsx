import { useLanguage } from "../i18n/LanguageContext";

const TABS = [
  { id: "log", key: "nav.log", icon: "📝" },
  { id: "dashboard", key: "nav.dashboard", icon: "📊" },
  { id: "badges", key: "nav.badges", icon: "🏅" },
  { id: "learn", key: "nav.learn", icon: "📖" },
];

export default function NavTabs({ active, onChange }) {
  const { t } = useLanguage();
  return (
    <nav className="nav-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`nav-tab${active === tab.id ? " active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="nav-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span>{t(tab.key)}</span>
        </button>
      ))}
    </nav>
  );
}