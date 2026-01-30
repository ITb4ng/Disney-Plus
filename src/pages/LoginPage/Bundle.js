import "./Bundle.css";

export default function BundlePromo() {
  return (
    <div className="bundle">
      <h1 className="bundle-title">디즈니+ 티빙 웨이브 번들 출시!</h1>

      <div className="bundle-ctaGrid" aria-label="플랜 선택">
        {/* 카드 1: 번들 */}
        <div className="bundle-card">
          <div className="bundle-logoBox">
            <img
              className="bundle-logoImg"
              src="https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/00328ED2854929F667624303D1CD48BA99B8FFA2F49999E2E3417A2C3BFE0F45/compose?format=webp&width=420"
              alt="Disney+ TVING wavve"
              loading="eager"
            />
          </div>

          <a className="bundle-btn" href="/commerce/plans?default=bundle" rel="noreferrer">
            번들로 할인 받기
          </a>
        </div>

        {/* 카드 2: 디즈니+ */}
        <div className="bundle-card">
          <div className="bundle-logoBox">
            <img
              className="bundle-logoImg"
              src="https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/3600EEA25BEB4CAC2E8F0F82F03245FA7A8558F67A7EC9F49AEEFF2542EF3CD7/compose?format=webp&width=290"
              alt="Disney+"
              loading="eager"
            />
          </div>

          <a className="bundle-btn" href="/commerce/plans?default=standalone" rel="noreferrer">
            디즈니+ 구독하기
          </a>
        </div>
      </div>

      <p className="bundle-desc">
        디즈니+ 멤버십은 결제 화면에서 월간 또는 연간 결제 주기를 선택할 수 있습니다.
        <br />
        번들 멤버십은 디즈니+ 티빙 번들과 디즈니+ 티빙 웨이브 번들 중 선택할 수 있습니다.
        <br />
        <strong>더 자세한 사항은 모든 멤버십 유형 보기에서 확인해 보세요.</strong>
      </p>

      <p className="bundle-note">*모든 가격은 부가세를 포함합니다. 추가 약관 적용.</p>
    </div>
  );
}
