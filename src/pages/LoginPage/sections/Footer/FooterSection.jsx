import "./Footer.css";
import { footerColumns, footerSns, footerLegal, languages } from "./FooterData";
import { Link } from "react-router-dom";
import {
  FaXTwitter,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTiktok,
  FaGithub,
  FaEnvelope,
  FaBriefcase,
} from "react-icons/fa6";

function renderLinks(links) {
  return links.map((l) => {
    if (l.type === "disabled") {
      return (
        <li key={l.label}>
          <span className="footer-link footer-link-disabled">{l.label}</span>
        </li>
      );
    }

    return (
      <li key={l.label}>
        <a
          className="footer-link"
          href={l.href}
          target={l.type === "external" ? "_blank" : undefined}
          rel={l.type === "external" ? "noreferrer" : undefined}
        >
          {l.label}
        </a>
      </li>
    );
  });
}

function FooterCol({ title, links, isFirst }) {
  return (
    <div className="footer-col">
      {/* 데스크탑 */}
      <div className="footer-col-desktop">
        <h6 className="footer-col-title">{title}</h6>
        <ul className="footer-col-list">{renderLinks(links)}</ul>
      </div>

       {/* 모바일 */}
       {isFirst ? (
        <div className="footer-col-mobile footer-col-mobile-static">
          <h6 className="footer-col-title">{title}</h6>
          <ul className="footer-col-list">{renderLinks(links)}</ul>
        </div>
      ) : (
        <details className="footer-col-mobile footer-col-mobile-accordion">
          <summary className="footer-col-summary">
            <span>{title}</span>
            <span className="footer-col-caret">▼</span>
          </summary>

          <ul className="footer-col-list">{renderLinks(links)}</ul>
        </details>
      )}
    </div>
  );
}

export default function FooterSection() {
  const currentYear = new Date().getFullYear();
  const getLegalIcon = (label) => {
  const key = label.toLowerCase();
    if (key.includes("github")) return <FaGithub aria-hidden="true" />;
    if (key.includes("email") || key.includes("mail")) return <FaEnvelope aria-hidden="true" />;
    if (key.includes("portfolio")) return <FaBriefcase aria-hidden="true" />;
    if (key.includes("x") || key.includes("twitter")) return <FaXTwitter />;
    if (key.includes("instagram")) return <FaInstagram />;
    if (key.includes("facebook")) return <FaFacebookF />;
    if (key.includes("youtube")) return <FaYoutube />;
    if (key.includes("tiktok")) return <FaTiktok />;
  return null;
};
  return (
    <footer className="footer" data-testid="disneyplus-footer">
      <div className="footer-inner">
        <section className="footer-block">
          {/* 1) language row */}
          <div className="footer-row footer-row-lang">
            <div className="footer-lang">
              <label className="footer-lang-label" htmlFor="language-selector">
                언어
              </label>

              <select id="language-selector" className="footer-lang-select" defaultValue="ko-kr">
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>

              <span className="footer-lang-icon" aria-hidden="true">
                🌐
              </span>
              <span className="footer-lang-caret" aria-hidden="true">
                ▾
              </span>
            </div>
          </div>

          {/* 2) menu row (4 columns) */}
          <div className="footer-row footer-row-menu">
            <div className="footer-cols">
              {footerColumns.map((c, idx) => (
                <FooterCol key={c.title} title={c.title} links={c.links} isFirst={idx === 0} />
              ))}
            </div>
          </div>

          {/* 3) sns row */}
         <div className="footer-row footer-row-sns">
          <ul className="footer-sns">
            {footerSns.map((s) => (
              <li key={s.label}>
                <a
                  className="footer-sns-link"
                  href={s.href}
                  target={s.external ? "_blank" : undefined}
                  rel={s.external ? "noreferrer" : undefined}
                  aria-label={s.label}
                >
                  {getLegalIcon(s.label)}
                </a>
              </li>
            ))}
          </ul>
        </div>

          {/* 4) logo row */}
          <div className="footer-row footer-row-logo">
            <div className="footer-logo">
              <Link to="/" className="footer-logo-link" aria-label="홈으로 이동">
                <img
                  src="https://cnbl-cdn.bamgrid.com/assets/e41a64255b8a5840df6162a10642ad98f42a80d3ca8aeb5ebcd70f74d096c0b0/original"
                  alt="Disney+"
                  loading="lazy"
                  width="120"
                  height="66"
                />
              </Link>
            </div>
          </div>

          {/* 5) legal row */}
          <div className="footer-row footer-row-legal">
            <ul className="footer-legal footer-legal-icons">
              {footerLegal.map((item, idx) => {
                if (item.type === "links") {
                  return (
                    <li key={idx} className="footer-legal-icon-group">
                      {item.value.map((l) => {
                        const isDisabled = l.type === "disabled";

                        if (isDisabled) {
                          return (
                            <span
                              key={l.label}
                              className="footer-legal-icon-link is-disabled"
                              aria-label={l.label}
                              aria-disabled="true"
                            >
                              {getLegalIcon(l.label)}
                            </span>
                          );
                        }

                        return (
                          <a
                            key={l.label}
                            className="footer-legal-icon-link"
                            href={l.href}
                            target={l.external ? "_blank" : undefined}
                            rel={l.external ? "noreferrer" : undefined}
                            aria-label={l.label}
                          >
                            {getLegalIcon(l.label)}
                          </a>
                        );
                      })}
                    </li>
                  );
                }

                return (
                  <li key={idx}>
                    <span>{item.value.replace("{{year}}", String(currentYear))}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </footer>
  );
}
