import React from "react";

function StateActions({ children }) {
  return <div className="detail__stateActions">{children}</div>;
}

export default function DetailStateView({
  status,
  message,
  onBack,
  onRetry,
  onHome,
  onSearch,
}) {
  if (status === "loading") {
    return (
      <div className="detail detail--state">
        <section className="detail__hero detail__hero--state">
          <div className="detail__heroSk" aria-hidden="true">
            <div className="detail__heroSkShimmer" />
          </div>

          <div className="detail__vignette" />

          <div className="detail__heroInner">
            <div className="detail__left">
              <div className="detail__micro">
                <span className="detail__microStrong">로딩 중</span>
                <span className="detail__microDot">•</span>
                <span>콘텐츠 정보를 불러오고 있습니다</span>
              </div>

              <div className="detail__stateBlock">
                <h1 className="detail__title">콘텐츠 정보를 불러오는 중입니다</h1>
                <p className="detail__infoBody">
                  콘텐츠 정보와 관련 메타 데이터를 불러오는 중입니다.
                </p>
              </div>
            </div>

            <div className="detail__wideSection">
              <div className="detail__divider" />
              <div className="detail__sectionLabel">상세 정보</div>

              <div className="detail__infoGrid3 detail__infoGrid3--clean">
                <div className="detail__infoCol detail__infoCol--main">
                  <div className="detail__stateSkeletonLine detail__stateSkeletonLine--lg" />
                  <div className="detail__stateSkeletonLine" />
                  <div className="detail__stateSkeletonLine" />
                  <div className="detail__stateSkeletonLine detail__stateSkeletonLine--sm" />
                </div>

                <dl className="detail__facts detail__facts--stack">
                  <div className="fact">
                    <dt>감독:</dt>
                    <dd>불러오는 중...</dd>
                  </div>
                  <div className="fact">
                    <dt>출연:</dt>
                    <dd>불러오는 중...</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="detail detail--state">
        <section className="detail__hero detail__hero--state">
          <div className="detail__vignette" />
          <div className="detail__heroInner">
            <div className="detail__left">
              <div className="detail__stateBlock">
                <div className="detail__sectionLabel">잘못된 접근</div>
                <h1 className="detail__title">요청한 주소를 확인할 수 없습니다</h1>
                <p className="detail__infoBody">
                  상세 페이지 경로의 `type` 또는 `id` 값이 올바르지 않습니다.
                </p>
                <StateActions>
                  <button className="btn btn--primary" onClick={onHome}>
                    메인으로 이동
                  </button>
                  <button className="btn btn--ghost" onClick={onBack}>
                    뒤로가기
                  </button>
                </StateActions>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="detail detail--state">
        <section className="detail__hero detail__hero--state">
          <div className="detail__vignette" />
          <div className="detail__heroInner">
            <div className="detail__left">
              <div className="detail__stateBlock">
                <div className="detail__sectionLabel">데이터 없음</div>
                <h1 className="detail__title">콘텐츠 정보를 찾을 수 없습니다</h1>
                <p className="detail__infoBody">
                  요청은 정상적으로 처리됐지만 표시할 데이터가 충분하지 않습니다.
                </p>
                <StateActions>
                  <button className="btn btn--primary" onClick={onSearch}>
                    검색으로 이동
                  </button>
                  <button className="btn btn--ghost" onClick={onHome}>
                    메인으로 이동
                  </button>
                </StateActions>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="detail detail--state">
        <section className="detail__hero detail__hero--state">
          <div className="detail__vignette" />
          <div className="detail__heroInner">
            <div className="detail__left">
              <div className="detail__stateBlock">
                <div className="detail__sectionLabel">API 오류</div>
                <h1 className="detail__title">상세 정보를 불러오지 못했습니다</h1>
                <p className="detail__infoBody">
                  {message || "잠시 후 다시 시도해 주세요."}
                </p>
                <StateActions>
                  <button className="btn btn--primary" onClick={onRetry}>
                    다시 시도
                  </button>
                  <button className="btn btn--ghost" onClick={onHome}>
                    메인으로 이동
                  </button>
                </StateActions>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return null;
}
