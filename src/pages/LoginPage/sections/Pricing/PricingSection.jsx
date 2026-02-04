import { useState } from "react";
import "./PricingSection.css";
import {
  TABS,
  DISNEY_PLANS,
  DISNEY_ROWS,
  BUNDLE_PLANS,
  BUNDLE_ROWS,
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

export default function PricingSection() {
  const [tab, setTab] = useState("disney");
  const { sectionRef, activeId } = useSectionObserve("pricing");

  const isBundle = tab === "bundle";
  const plans = isBundle ? BUNDLE_PLANS : DISNEY_PLANS;
  const rows  = isBundle ? BUNDLE_ROWS  : DISNEY_ROWS;

  if (!Array.isArray(plans) || plans.length < 2) return null;
  if (!Array.isArray(rows)) return null;

  const leftKey = plans[0].key;
  const rightKey = plans[1].key;

  const leftPlan = plans[0];
  const rightPlan = plans[1];
  if (!leftKey || !rightKey) return null;

  const colTemplate = "42% repeat(2, 1fr)";

  const renderCell = (cell, plan) => {
    if (!cell) return null;

    if (cell.type === "annualBtn") {
      return (
        <div className="pricing-cellStack">
          <button type="button" className="pricing-ctaSecondary">
            {plan.annualLabel}
          </button>
          <div className="pricing-subNote">{plan.annualSub}</div>
        </div>
      );
    }

    if (cell.type === "check") {
      return (
        <div className="pricing-check" role="img" aria-label="포함된 기능">
          <CheckIcon />
        </div>
      );
    }

    return <div className="pricing-cellText">{cell.text}</div>;
  };

  

  return (
    <section ref={sectionRef} className="pricing-section" id="pricing">
      <div className="pricing-inner">
        <header className="pricing-header">
          <h2 className="pricing-title">원하는 멤버십을 선택하세요.</h2>
          <p className="pricing-desc">멤버십은 언제든지 변경* 또는 취소** 할 수 있습니다.</p>

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

        <div className="pricing-surface" style={{ "--col-tablet": colTemplate }}>
          {/* sticky */}
          <div className={cx("pricing-sticky", activeId === "pricing" && "is-active")}>
            {/* badge row */}
            <div className="pricing-row pricing-rowBadge">
              <div className="pricing-featureEmpty" />

              <div className={cx("pricing-planCell", leftPlan.isReco && "is-reco")}>
                <div className="pricing-planInner">
                  {leftPlan.badge && <div className="pricing-badgeFloat">{leftPlan.badge}</div>}
                </div>
              </div>

              <div className={cx("pricing-planCell", rightPlan.isReco && "is-reco", rightPlan.isFlat && "is-flat")}>
                <div className="pricing-planInner">
                  {rightPlan.badge && <div className="pricing-badgeFloat">{rightPlan.badge}</div>}
                </div>
              </div>
            </div>

            {/* plan row */}
            <div className="pricing-row pricing-rowPlan">
              <div className="pricing-featureEmpty" />

              <div className={cx("pricing-planCell", leftPlan.isReco && "is-reco")}>
                <div className="pricing-planInner">
                  <div className="pricing-logoText">{leftPlan.logoText}</div>
                  <div className="pricing-planName">{leftPlan.name}</div>
                </div>
              </div>

              <div className={cx("pricing-planCell", rightPlan.isReco && "is-reco", rightPlan.isFlat && "is-flat")}>
                <div className="pricing-planInner">
                  <div className="pricing-logoText">{rightPlan.logoText}</div>
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
                    <div className="pricing-featureCell">{r.feature}</div>

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

          {/* footnote는 기존 그대로 두면 됨 */}
          <div className="pricing-footnote">
					<p className="fn-text">
						멤버십 구독이 필요합니다. 19세 이상 구독 가능.
						<u className="fn-underline">
							해당 멤버십은 회원님의 가구에 연동된 기기에서만 이용할 수 있습니다.
						</u>
    			</p>
					<ul className="fn-list" aria-label="주요 유의사항 목록">
						<li className="fn-item">
							<span className="fn-mark">*</span>
						멤버십 유형에 따라 멤버십 변경의 적용 시점 및 (해당 시) 즉시 청구되는 금액이 다를 수 있습니다.
						</li>

						<li className="fn-item">
							<span className="fn-mark">**</span>
						결제 주기 종료 시 자동 갱신이 취소 처리됩니다. 즉시 취소를 포함한 취소 및 환불에 관한 자세한 사항은
							<a className="fn-link" href="/legal/cancellation-and-refund-policy" rel="noreferrer">
									<u>관련 정책</u>
							</a>
						을 확인하거나
							<a className="fn-link" href="https://help.disneyplus.com/ko/contact-us" rel="noreferrer">
									<u>고객 서비스팀</u>
							</a>
						으로 문의하시기 바랍니다.
						</li>

						<li className="fn-item">
						<span className="fn-mark">***</span>
							영상 화질/오디오 및 저장 기능은 인터넷 서비스, 기기 성능, 멤버십 유형 및 각 콘텐츠에 따라 달라질 수 있습니다.
							각 콘텐츠별 다양한 기능 표시가 있을 수 있으나, 해당 멤버십 유형에서 사용 가능한 최대 사양까지만 이용할 수 있습니다.
						<a className="fn-link" href="https://help.disneyplus.com/article/disneyplus-ko-kr-price" rel="noreferrer">
								<u>더 알아보기</u>
						</a>
						</li>

						<li className="fn-item">
							<span className="fn-mark">^</span>
								월간 멤버십 12개월 구독료 대비 할인된 가격입니다.
							<a className="fn-link" href="/legal/%EB%94%94%EC%A6%88%EB%8B%88+-%EC%9D%B4%EC%9A%A9%EC%95%BD%EA%B4%80" rel="noreferrer">
									<u>추가 약관 적용</u>
							</a>
						.
						</li>

						<li className="fn-item">
							<span className="fn-mark">†</span>
							라이브 채널 스트리밍 및 생방송 프로그램에는 광고가 포함될 수 있으며, 모든 멤버십 유형에서 특정 홍보 및 협찬 콘텐츠를 경험하게 될 수 있습니다.
							자세한 내용은
								<a className="fn-link" href="https://help.disneyplus.com/ko/article/disneyplus-ko-kr-ads" rel="noopener nofollow">
										<u>고객센터</u>
								</a>
							에서 알아보세요.
						</li>
					</ul>
        </div>
        </div>
      </div>
    </section>
  );
}
