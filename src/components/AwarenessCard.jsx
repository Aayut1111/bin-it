import { useLanguage } from "../i18n/LanguageContext";

const FACT_COUNT = 5;
const QUOTE_COUNT = 5;

// Same quote/fact all day, a new one tomorrow.
function dayIndex() {
  return Math.floor(Date.now() / 86400000);
}

export default function AwarenessCard() {
  const { t } = useLanguage();
  const day = dayIndex();
  const quote = (day % QUOTE_COUNT) + 1;
  const fact = ((day + 2) % FACT_COUNT) + 1;

  return (
    <aside className="awareness-card">
      <p className="awareness-quote">“{t(`quote.${quote}`)}”</p>
      <p className="awareness-fact">
        <strong>{t("learn.didYouKnow")}</strong> {t(`fact.${fact}`)}
      </p>
    </aside>
  );
}