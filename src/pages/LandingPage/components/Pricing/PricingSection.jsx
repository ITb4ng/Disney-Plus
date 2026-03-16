import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa6";
import "./PricingSection.css";

import {
  TABS,
  DISNEY_PLANS,
  DISNEY_ROWS,
  BUNDLE_PLANS,
  BUNDLE_ROWS,
  FOOTNOTES,
} from "./PricingData";
import { useSectionObserve } from "./useSectionObserve";

function cx(...names) {
  return names.filter(Boolean).join(" ");
}

function CheckIcon() {
  return (
    <svg width="25" height="18" viewBox="0 0 25 18" fill="none" aria-hidden="true">
      <path
        d="M20.8142 0.733645L9.27242 12.2746L3.85204 6.85426C3.2349 6.23712 2.23455 6.23712 1.61741 6.85426L0.796352 7.67532C0.179211 8.29246 0.179211 9.29358 0.796352 9.91073L8.15587 17.2672C8.77301 17.8843 9.77336 17.8843 10.3905 17.2672L23.8706 3.78934C24.4878 3.1722 24.4878 2.17184 23.8706 1.55393L23.0496 0.732875C22.4324 0.115734 21.4321 0.115734 20.8149 0.732875L20.8142 0.733645Z"
        fill="currentColor"
      />
    </svg>
  );
}

// 각주 번호를 버튼으로 렌더링해 바로 상세 영역으로 이동시킨다.
function SupMarks({ ids, onClick }) {
  if (!Array.isArray(ids) || ids.length === 0) return null;

  return (
    <>
      {ids.map((id) => (
        <sup key={id} className="fn-markWrap" aria-label={`각주 ${id}`}>
          <button type="button" className="fn-markBtn" onClick={() => onClick?.(id)}>
            {id}
          </button>
        </sup>
      ))}
    </>
  );
}

function getLayoutScrollTarget() {
  return document.querySelector(".layout") || window;
}

function getScrollTop(target) {
  return target === window ? window.scrollY : target.scrollTop;
}

function scrollToElementWithOffset(element, extraOffset = 24) {
  if (!element) return;

  const scrollTarget = getLayoutScrollTarget();
  const navHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-h") || "0"
  );

  if (scrollTarget === window) {
    const nextTop = window.scrollY + element.getBoundingClientRect().top - navHeight - extraOffset;
    window.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
    return;
  }

  const containerRect = scrollTarget.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const nextTop =
    getScrollTop(scrollTarget) + (elementRect.top - containerRect.top) - navHeight - extraOffset;

  scrollTarget.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
}

export default function PricingSection() {
  const [tab, setTab] = useState("bundle");
  const [openNotes, setOpenNotes] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);

  const footnotePanelRef = useRef(null);
  const clearTimerRef = useRef(null);

  const { sectionRef, activeId } = useSectionObserve("pricing");

  const isBundle = tab === "bundle";
  const plans = isBundle ? BUNDLE_PLANS : DISNEY_PLANS;
  const rows = isBundle ? BUNDLE_ROWS : DISNEY_ROWS;

  const leftPlan = plans?.[0];
  const rightPlan = plans?.[1];
  const leftKey = leftPlan?.key ?? "";
  const rightKey = rightPlan?.key ?? "";

  const handleFootnoteClick = (id) => {
    setActiveNoteId(id);
    setOpenNotes(true);

    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    requestAnimationFrame(() => {
      const item = document.querySelector(`[data-footnote-id="${id}"]`);
      const panel = footnotePanelRef.current;

      if (panel && !item) {
        scrollToElementWithOffset(panel, 28);
        return;
      }

      if (item) {
        const extraOffset = id === 1 ? 44 : 28;
        scrollToElementWithOffset(item, extraOffset);
        item.focus?.();
      }
    });

    clearTimerRef.current = window.setTimeout(() => {
      setActiveNoteId(null);
      clearTimerRef.current = null;
    }, 2500);
  };

  const usedFootnoteIds = useMemo(() => {
    if (!Array.isArray(rows) || !leftKey || !rightKey) return [];

    const result = new Set();

    rows.forEach((row) => {
      row?.featureFootnotes?.forEach((id) => result.add(id));
      [row?.[leftKey], row?.[rightKey]].forEach((cell) => {
        cell?.footnotes?.forEach((id) => result.add(id));
      });
    });

    [leftPlan, rightPlan].forEach((plan) => {
      plan?.annualFootnotes?.forEach((id) => result.add(id));
    });

    return Array.from(result).sort((a, b) => a - b);
  }, [leftKey, leftPlan, rightKey, rightPlan, rows]);

  if (!Array.isArray(plans) || plans.length < 2) return null;
  if (!Array.isArray(rows)) return null;
  if (!leftKey || !rightKey) return null;

  const renderCell = (cell, plan) => {
    if (!cell) return null;

    if (cell.type === "annualBtn") {
      return (
        <div className="pricing-cellStack">
          <button type="button" className="pricing-ctaSecondary">
            {plan.annualLabel}
          </button>

          {plan.annualSub && (
            <div className="pricing-subNote">
              {plan.annualSub}
              <SupMarks ids={plan.annualFootnotes} onClick={handleFootnoteClick} />
            </div>
          )}
        </div>
      );
    }

    if (cell.type === "check") {
      return (
        <div className="pricing-check" role="img" aria-label="포함된 기능">
          <CheckIcon />
          <SupMarks ids={cell.footnotes} onClick={handleFootnoteClick} />
        </div>
      );
    }

    return (
      <div className="pricing-cellText">
        {cell.text}
        <SupMarks ids={cell.footnotes} onClick={handleFootnoteClick} />
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="pricing-section"
      id="pricing"
      data-restore-anchor="landing-pricing"
    >
      <div className="pricing-inner">
        <header className="pricing-header">
          <h2 className="pricing-title">원하는 멤버십을 선택해 보세요</h2>
          <p className="pricing-desc">멤버십은 언제든 변경하거나 취소할 수 있습니다.</p>

          <div className="pricing-tabs" role="tablist" aria-label="요금제 유형 선택">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                className={cx("pricing-tab", tab === item.key && "is-active")}
                aria-selected={tab === item.key}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <div className="pricing-surface">
          <div className={cx("pricing-sticky", activeId === "pricing" && "is-active")}>
            <div className="pricing-row pricing-rowPlan">
              <div className="pricing-featureEmpty" />

              <div className={cx("pricing-planCell", leftPlan.isReco && "is-reco")}>
                <div className="pricing-planInner">
                  {leftPlan.badge && (
                    <div className="pricing-badgeFloat" aria-label="추천">
                      {leftPlan.badge}
                    </div>
                  )}

                  <div className="pricing-logoSlot">
                    <img
                      className={cx("pricing-logo", leftPlan.logoVariant && `is-${leftPlan.logoVariant}`)}
                      src={leftPlan.logoImg}
                      alt={leftPlan.logoAlt || "Disney+"}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="pricing-planName">{leftPlan.name}</div>
                </div>
              </div>

              <div
                className={cx(
                  "pricing-planCell",
                  rightPlan.isReco && "is-reco",
                  rightPlan.isFlat && "is-flat"
                )}
              >
                <div className="pricing-planInner">
                  {rightPlan.badge && (
                    <div className="pricing-badgeFloat" aria-label="추천">
                      {rightPlan.badge}
                    </div>
                  )}

                  <div className="pricing-logoSlot">
                    <img
                      className={cx(
                        "pricing-logo",
                        rightPlan.logoVariant && `is-${rightPlan.logoVariant}`
                      )}
                      src={rightPlan.logoImg}
                      alt={rightPlan.logoAlt || "Disney+"}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="pricing-planName">{rightPlan.name}</div>
                </div>
              </div>
            </div>

            <div className="pricing-row pricing-rowCta">
              <div className="pricing-featureEmpty" />

              <div className={cx("pricing-planCell", leftPlan.isReco && "is-reco")}>
                <div className="pricing-planInner">
                  <button type="button" className="pricing-ctaPrimary">
                    {leftPlan.monthlyLabel}
                  </button>
                </div>
              </div>

              <div
                className={cx(
                  "pricing-planCell",
                  rightPlan.isReco && "is-reco",
                  rightPlan.isFlat && "is-flat"
                )}
              >
                <div className="pricing-planInner">
                  <button type="button" className="pricing-ctaPrimary">
                    {rightPlan.monthlyLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pricing-surfaceClip">
            <div className="pricing-body" role="rowgroup">
              {rows.map((row) => {
                const left = row[leftKey];
                const right = row[rightKey];

                return (
                  <div className="pricing-row pricing-rowBody" key={row.feature}>
                    <div className="pricing-featureCell">
                      {row.feature}
                      <SupMarks ids={row.featureFootnotes} onClick={handleFootnoteClick} />
                    </div>

                    <div className={cx("pricing-dataCell", leftPlan.isReco && "is-reco")}>
                      {renderCell(left, leftPlan)}
                    </div>

                    <div
                      className={cx(
                        "pricing-dataCell",
                        rightPlan.isReco && "is-reco",
                        rightPlan.isFlat && "is-flat"
                      )}
                    >
                      {renderCell(right, rightPlan)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pricing-footnote">
            <p className="fn-guide">
              멤버십 구독 시 연령과 서비스 이용 조건에 따라 일부 기능이 제한될 수 있습니다. 번들
              멤버십은 만 19세 이상부터 구독 가능하며, 각 서비스의 정책에 따라 이용 가능한 기기가
              달라질 수 있습니다.
            </p>

            <button
              type="button"
              className={cx("fn-toggle", openNotes && "is-open")}
              aria-expanded={openNotes}
              onClick={() => setOpenNotes((value) => !value)}
            >
              자세히 보기
              <span className={`fn-toggleIcon ${openNotes ? "is-open" : ""}`} aria-hidden="true">
                <FaAngleDown />
              </span>
            </button>

            {openNotes && (
              <div
                className="fn-panel"
                ref={footnotePanelRef}
                role="region"
                aria-label="멤버십 조건 상세"
              >
                <ul className="fn-list">
                  {usedFootnoteIds.map((id) => {
                    const note = FOOTNOTES?.[id];
                    if (!note) return null;

                    const isActive = activeNoteId === id;

                    return (
                      <li
                        key={id}
                        className={cx("fn-item", isActive && "is-active")}
                        data-footnote-id={id}
                        tabIndex={-1}
                      >
                        <div className="fn-head">
                          <sup className="fn-mark">{id}</sup>
                          <span className="fn-title">{note.title}</span>
                          {isActive && <span className="fn-pill">선택됨</span>}
                        </div>

                        <div className="fn-text">{note.summary}</div>

                        {note.linkTo && (
                          <Link className="fn-link" to={note.linkTo}>
                            자세히 보기
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
