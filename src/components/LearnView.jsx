import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { shareLink } from "../utils/share";

const PLEDGE_KEY = "binit:pledged";

function readPledged() {
  try {
    return localStorage.getItem(PLEDGE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function LearnView() {
  const { t } = useLanguage();
  const [pledged, setPledged] = useState(readPledged);

  function takePledge() {
    setPledged(true);
    try {
      localStorage.setItem(PLEDGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  return (
    <section className="view learn-view">
      <div className="pledge-card">
        <h3 className="pledge-title">🚆 {t("learn.pledgeTitle")}</h3>
        <p className="pledge-intro">{t("learn.pledgeIntro")}</p>
        <ul className="pledge-list">
          {[1, 2, 3, 4].map((n) => (
            <li key={n}>{t(`learn.pledge.${n}`)}</li>
          ))}
        </ul>
        {pledged ? (
          <button
            type="button"
            className="pledge-btn done"
            onClick={() => shareLink(t("learn.shareText"))}
          >
            {t("learn.pledged")} · {t("learn.sharePledge")}
          </button>
        ) : (
          <button type="button" className="pledge-btn" onClick={takePledge}>
            {t("learn.takePledge")}
          </button>
        )}
      </div>

      <h3 className="section-title">{t("learn.quoteTitle")}</h3>
      <ul className="quote-list">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n} className="quote-item">
            “{t(`quote.${n}`)}”
          </li>
        ))}
      </ul>

      <h3 className="section-title">{t("learn.factsTitle")}</h3>
      <ul className="fact-list">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n} className="fact-item">
            {t(`fact.${n}`)}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="challenge-btn"
        onClick={() => shareLink(t("learn.shareText"))}
      >
        {t("learn.challenge")}
      </button>
    </section>
  );
}