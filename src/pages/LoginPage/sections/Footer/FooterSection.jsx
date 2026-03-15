import "./Footer.css";
import { footerColumns, footerSns, footerLegal, languages } from "./FooterData";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TfiAngleDown } from "react-icons/tfi";
import { AiOutlineGlobal } from "react-icons/ai";
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
import { getAppScrollY } from "../../../../utils/scrollPosition";

function FooterNavLink({ link, location }) {
  const navigate = useNavigate();

  if (link.type === "disabled") {
    return <span className="footer-link footer-link-disabled">{link.label}</span>;
  }

  return (
    <button
      type="button"
      className="footer-link"
      onClick={() =>
        navigate(link.to || "/not-found", {
          state: {
            from: location.pathname + location.search,
            scrollY: getAppScrollY(),
          },
        })
      }
    >
      {link.label}
    </button>
  );
}

function renderLinks(links, location) {
  return links.map((link) => (
    <li key={link.label}>
      <FooterNavLink link={link} location={location} />
    </li>
  ));
}

function FooterCol({ title, links, isFirst, location }) {
  return (
    <div className="footer-col">
      <div className="footer-col-desktop">
        <h6 className="footer-col-title">{title}</h6>
        <ul className="footer-col-list">{renderLinks(links, location)}</ul>
      </div>

      {isFirst ? (
        <div className="footer-col-mobile footer-col-mobile-static">
          <h6 className="footer-col-title">{title}</h6>
          <ul className="footer-col-list">{renderLinks(links, location)}</ul>
        </div>
      ) : (
        <details className="footer-col-mobile footer-col-mobile-accordion">
          <summary className="footer-col-summary">
            <span>{title}</span>
            <span className="footer-col-caret">
              <TfiAngleDown />
            </span>
          </summary>
          <ul className="footer-col-list">{renderLinks(links, location)}</ul>
        </details>
      )}
    </div>
  );
}

export default function FooterSection() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const getLegalIcon = (label) => {
    const key = label.toLowerCase();
    if (key.includes("github")) return <FaGithub aria-hidden="true" />;
    if (key.includes("email") || key.includes("mail")) {
      return <FaEnvelope aria-hidden="true" />;
    }
    if (key.includes("portfolio")) return <FaBriefcase aria-hidden="true" />;
    if (key.includes("x") || key.includes("twitter")) return <FaXTwitter />;
    if (key.includes("instagram")) return <FaInstagram />;
    if (key.includes("facebook")) return <FaFacebookF />;
    if (key.includes("youtube")) return <FaYoutube />;
    if (key.includes("tiktok")) return <FaTiktok />;
    return null;
  };

  return (
    <footer
      className="footer"
      data-testid="disneyplus-footer"
      data-restore-anchor="app-footer"
    >
      <div className="footer-inner">
        <section className="footer-block">
          <div className="footer-row footer-row-lang">
            <div className="footer-lang">
              <label className="footer-lang-label" htmlFor="language-selector">
                언어
              </label>

              <select id="language-selector" className="footer-lang-select" defaultValue="ko-kr">
                {languages.map((language) => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>

              <span className="footer-lang-icon" aria-hidden="true">
                <AiOutlineGlobal />
              </span>
              <span className="footer-lang-caret" aria-hidden="true">
                <TfiAngleDown />
              </span>
            </div>
          </div>

          <div className="footer-row footer-row-menu">
            <div className="footer-cols">
              {footerColumns.map((column, index) => (
                <FooterCol
                  key={column.title}
                  title={column.title}
                  links={column.links}
                  isFirst={index === 0}
                  location={location}
                />
              ))}
            </div>
          </div>

          <div className="footer-row footer-row-sns">
            <ul className="footer-sns">
              {footerSns.map((item) => (
                <li key={item.label}>
                  <a
                    className="footer-sns-link"
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    aria-label={item.label}
                  >
                    {getLegalIcon(item.label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

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

          <div className="footer-row footer-row-legal">
            <ul className="footer-legal footer-legal-icons">
              {footerLegal.map((item, index) => {
                if (item.type === "links") {
                  return (
                    <li key={index} className="footer-legal-icon-group">
                      {item.value.map((link) => {
                        if (link.type === "disabled") {
                          return (
                            <span
                              key={link.label}
                              className="footer-legal-icon-link is-disabled"
                              aria-label={link.label}
                              aria-disabled="true"
                            >
                              {getLegalIcon(link.label)}
                            </span>
                          );
                        }

                        return (
                          <a
                            key={link.label}
                            className="footer-legal-icon-link"
                            href={link.href}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noreferrer" : undefined}
                            aria-label={link.label}
                          >
                            {getLegalIcon(link.label)}
                          </a>
                        );
                      })}
                    </li>
                  );
                }

                return (
                  <li key={index}>
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
