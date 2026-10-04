import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../i18n/LanguageContext";

export default function Header() {
  const { t } = useLanguage();
  return (
    <header className="app-header">
      <div className="header-top">
        <LanguageSwitcher />
      </div>
      <h1>Bin It</h1>
      <p className="tagline">{t("app.tagline")}</p>
    </header>
  );
}