import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./PricingSection.css";
import { FaAngleDown } from "react-icons/fa6";

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

/**
 * 각주 마크 (서비스 느낌 버전)
 * - 클릭 가능 (button)
 * - 접근성: aria-label
 */
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

export default function PricingSection() {
  const [tab, setTab] = useState("bundle");
  const [openNotes, setOpenNotes] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);

  // 토글 패널로 스크롤용
  const footnotePanelRef = useRef(null);
  // 하이라이트 자동 해제 타이머
  const clearTimerRef = useRef(null);

  const { sectionRef, activeId } = useSectionObserve("pricing");

  const isBundle = tab === "bundle";
  const plans = isBundle ? BUNDLE_PLANS : DISNEY_PLANS;
  const rows = isBundle ? BUNDLE_ROWS : DISNEY_ROWS;

  // 훅 순서 고정용: 안전한 기본값
  const leftPlan = plans?.[0];
  const rightPlan = plans?.[1];
  const leftKey = leftPlan?.key ?? "";
  const rightKey = rightPlan?.key ?? "";

  /**
   * - 각주 클릭하면 토글 자동 오픈
   * - 패널로 스크롤 + 해당 항목으로 스크롤
   * - 하이라이트 표시
   * - 2.5초 후 하이라이트 자동 해제
   */
  const handleFootnoteClick = (id) => {
    setActiveNoteId(id);
    setOpenNotes(true);

    // 이전 타이머 제거
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    // 토글이 열려 DOM이 그려진 다음 스크롤
    requestAnimationFrame(() => {
      footnotePanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      const el = document.querySelector(`[data-footnote-id="${id}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });

      // 키보드 유저도 "지금 이거야"를 알 수 있게 포커스(선택)
      el?.focus?.();
    });

    // 하이라이트 자동 해제
    clearTimerRef.current = window.setTimeout(() => {
      setActiveNoteId(null);
      clearTimerRef.current = null;
    }, 2500);
  };

  // 사용된 footnote id만 모으기 (토글에 표시)
  const usedFootnoteIds = useMemo(() => {
    if (!Array.isArray(rows) || !leftKey || !rightKey) return [];

    const set = new Set();

    rows.forEach((r) => {
      if (r?.featureFootnotes?.length) {
        r.featureFootnotes.forEach((id) => set.add(id));
      }

      const left = r?.[leftKey];
      const right = r?.[rightKey];

      [left, right].forEach((cell) => {
        if (cell?.footnotes?.length) {
          cell.footnotes.forEach((id) => set.add(id));
        }
      });
    });

    [leftPlan, rightPlan].forEach((p) => {
      if (p?.annualFootnotes?.length) {
        p.annualFootnotes.forEach((id) => set.add(id));
      }
    });

    return Array.from(set).sort((a, b) => a - b);
  }, [rows, leftKey, rightKey, leftPlan, rightPlan]);

  // 훅 호출 이후에만 조기 return
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
              {/* ✅ 연간 서브 문구 각주도 클릭 가능 */}
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
          {/* ✅ 체크 항목 각주 */}
          <SupMarks ids={cell.footnotes} onClick={handleFootnoteClick} />
        </div>
      );
    }

    return (
      <div className="pricing-cellText">
        {cell.text}
        {/* ✅ 텍스트 항목 각주 */}
        <SupMarks ids={cell.footnotes} onClick={handleFootnoteClick} />
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="pricing-section" id="pricing">
      <div className="pricing-inner">
        <header className="pricing-header">
          <h2 className="pricing-title">원하는 멤버십을 선택하세요.</h2>
          <p className="pricing-desc">멤버십은 언제든지 변경 또는 취소할 수 있습니다.</p>

          <div className="pricing-tabs" role="tablist" aria-label="요금제 탭">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                className={cx("pricing-tab", tab === t.key && "is-active")}
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

<div className="pricing-surface">
  {/* sticky */}
  <div className={cx("pricing-sticky", activeId === "pricing" && "is-active")}>
    {/* ✅ badge row 제거: 배지를 plan row 내부로 합침 */}

    {/* plan row */}
    <div className="pricing-row pricing-rowPlan">
      <div className="pricing-featureEmpty" />

      <div className={cx("pricing-planCell", leftPlan.isReco && "is-reco")}>
        <div className="pricing-planInner">
          {/* ✅ 추천 배지: 카드 내부에 포함(같이 움직임) */}
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

      <div className={cx("pricing-planCell", rightPlan.isReco && "is-reco", rightPlan.isFlat && "is-flat")}>
        <div className="pricing-planInner">
          {/* ✅ 추천 배지: 카드 내부에 포함(같이 움직임) */}
          {rightPlan.badge && (
            <div className="pricing-badgeFloat" aria-label="추천">
              {rightPlan.badge}
            </div>
          )}

          <div className="pricing-logoSlot">
            <img
              className={cx("pricing-logo", rightPlan.logoVariant && `is-${rightPlan.logoVariant}`)}
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

            {/* cta row */}
            <div className="pricing-row pricing-rowCta">
              <div className="pricing-featureEmpty" />

              <div className={cx("pricing-planCell", leftPlan.isReco && "is-reco")}>
                <div className="pricing-planInner">
                  <button type="button" className="pricing-ctaPrimary">
                    {leftPlan.monthlyLabel}
                  </button>
                </div>
              </div>

              <div className={cx("pricing-planCell", rightPlan.isReco && "is-reco", rightPlan.isFlat && "is-flat")}>
                <div className="pricing-planInner">
                  <button type="button" className="pricing-ctaPrimary">
                    {rightPlan.monthlyLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* body */}
          <div className="pricing-surfaceClip">
            <div className="pricing-body" role="rowgroup">
              {rows.map((r) => {
                const left = r[leftKey];
                const right = r[rightKey];

                return (
                  <div className="pricing-row pricing-rowBody" key={r.feature}>
                    <div className="pricing-featureCell">
                      {r.feature}
                      {/* ✅ 왼쪽 feature에도 각주 클릭 적용 */}
                      <SupMarks ids={r.featureFootnotes} onClick={handleFootnoteClick} />
                    </div>

                    <div className={cx("pricing-dataCell", leftPlan.isReco && "is-reco")}>
                      {renderCell(left, leftPlan)}
                    </div>

                    <div className={cx("pricing-dataCell", rightPlan.isReco && "is-reco", rightPlan.isFlat && "is-flat")}>
                      {renderCell(right, rightPlan)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* footnote guide + toggle */}
          <div className="pricing-footnote">
            <p className="fn-guide">
              멤버십 구독이 필요합니다. 디즈니+에서 직접 결제로 구독 가능한 본 번들 멤버십은{" "}
              <u className="fn-underline">만 19세 이상만</u> 구독 가능하며,{" "}
              <u className="fn-underline">디즈니+ 멤버십은 회원님의 가구에 연동된 기기에서만 이용할 수 있습니다.</u>
            </p>

            <button
              type="button"
              className={cx("fn-toggle", openNotes && "is-open")}
              aria-expanded={openNotes}
              onClick={() => setOpenNotes((v) => !v)}
            >
              자세히 보기
              <span
                className={`fn-toggleIcon ${openNotes ? "is-open" : ""}`}
                aria-hidden="true"
              >
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
                        tabIndex={-1} // focus 가능하게
                      >
                        <div className="fn-head">
                          <sup className="fn-mark">{id}</sup>
                          <span className="fn-title">{note.title}</span>

                          {/* 선택됨을 아주 작게 표시(서비스 느낌) */}
                          {isActive && <span className="fn-pill">클릭한</span>}
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