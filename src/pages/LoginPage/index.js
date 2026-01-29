import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

const AUTOPLAY_MS = 5200;
const FADE_MS = 900;


//이미지 데이터 따로 빼서 컴포넌트 시키기 최종으로

export default function LoginPage() {
  const slides = useMemo(
    () => [
      { 
        //해당 번들 캡션은 슬라이드 마다 띄우는 게 아닌 엘리먼트로 고정 플로팅 시키기 슬라이드 애니메이션 시 흐릿해짐
        id: "bundle",
        image:
          "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/2824AC39DD1B3F0CFD2B92551C65F7130CB64B111DB7C1E768BD39C653AE600A/compose?format=webp&width=2560",
        headline: "디즈니+ 티빙 웨이브 번들 출시!",
        logos: ["disney", "tving", "wavve"],
        primaryCta: { label: "번들로 할인 받기", onClick: () => {} }, //내일 이미지로 대체하기
        secondaryCta: { label: "디즈니+ 구독하기", onClick: () => {} }, //내일 이미지로 대체하기
        paragraphs: [
          {
            type: "normal",
            html: `디즈니+ 멤버십은 결제 화면에서 월간 또는 연간 결제 주기를 선택할 수 있습니다.<br/>
                  번들 멤버십은 디즈니+ 티빙 번들과 디즈니+ 티빙 웨이브 번들 중 선택할 수 있습니다.<br/>
                  <b>더 자세한 사항은 모든 멤버십 유형 보기에서 확인해 보세요.</b>`,
          },
          {
            type: "small",
            html: `디즈니+ 스탠다드는 월 9,900원부터, 디즈니+ 프리미엄은 월 13,900원부터 구독 가능합니다.<br/>
                  디즈니+ 티빙 번들은 월 18,000원에, 디즈니+ 티빙 웨이브 번들은 월 21,500원에 구독 가능합니다.<br/>
                  자세한 사항은 <u>여기서 확인</u>하세요.`,
          },
          { type: "xsmall", html: `*모든 가격은 부가세 포함. 추가 약관 적용.` },
        ],
        caption: { title: "디즈니+ 티빙 웨이브 번들", streamingText: "지금 확인하기" },
      },
      {
        id: "made-in-korea",
        image:
          "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/CE0C8820788B58D3C6321D68B563285CB1DFE670C85265B439214E63900375CE/compose?format=webp&width=2560",
                headline: "디즈니+ 티빙 웨이브 번들 출시!",
        logos: ["disney", "tving", "wavve"],
        primaryCta: { label: "번들로 할인 받기", onClick: () => {} },
        secondaryCta: { label: "디즈니+ 구독하기", onClick: () => {} },
        paragraphs: [
          {
            type: "normal",
            html: `디즈니+ 멤버십은 결제 화면에서 월간 또는 연간 결제 주기를 선택할 수 있습니다.<br/>
                  번들 멤버십은 디즈니+ 티빙 번들과 디즈니+ 티빙 웨이브 번들 중 선택할 수 있습니다.<br/>
                  <b>더 자세한 사항은 모든 멤버십 유형 보기에서 확인해 보세요.</b>`,
          },
          {
            type: "small",
            html: `디즈니+ 스탠다드는 월 9,900원부터, 디즈니+ 프리미엄은 월 13,900원부터 구독 가능합니다.<br/>
                  디즈니+ 티빙 번들은 월 18,000원에, 디즈니+ 티빙 웨이브 번들은 월 21,500원에 구독 가능합니다.<br/>
                  자세한 사항은 <u>여기서 확인</u>하세요.`,
          },
          { type: "xsmall", html: `*모든 가격은 부가세 포함. 추가 약관 적용.` },
        ],
        caption: { title: "메이드 인 코리아 시즌1", streamingText: "지금 스트리밍 중" },
      },
      {
        id: "is-this-right",
        image:
          "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/95E907C044C186E6D5798B140A88960290E899087FCDC3CF30EA2BC6ED7542D8/compose?format=webp&width=2560",
               headline: "디즈니+ 티빙 웨이브 번들 출시!",
        logos: ["disney", "tving", "wavve"],
        primaryCta: { label: "번들로 할인 받기", onClick: () => {} },
        secondaryCta: { label: "디즈니+ 구독하기", onClick: () => {} },
        paragraphs: [
          {
            type: "normal",
            html: `디즈니+ 멤버십은 결제 화면에서 월간 또는 연간 결제 주기를 선택할 수 있습니다.<br/>
                  번들 멤버십은 디즈니+ 티빙 번들과 디즈니+ 티빙 웨이브 번들 중 선택할 수 있습니다.<br/>
                  <b>더 자세한 사항은 모든 멤버십 유형 보기에서 확인해 보세요.</b>`,
          },
          {
            type: "small",
            html: `디즈니+ 스탠다드는 월 9,900원부터, 디즈니+ 프리미엄은 월 13,900원부터 구독 가능합니다.<br/>
                  디즈니+ 티빙 번들은 월 18,000원에, 디즈니+ 티빙 웨이브 번들은 월 21,500원에 구독 가능합니다.<br/>
                  자세한 사항은 <u>여기서 확인</u>하세요.`,
          },
          { type: "xsmall", html: `*모든 가격은 부가세 포함. 추가 약관 적용.` },
        ],
        caption: { title: "이게 맞아?! 시즌2", streamingText: "지금 스트리밍 중" },
      },
      {
        id: "taylor",
        image:
          "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/4983B8F330CCFF3FC94AEA951A9A358E646563DF7FFD4C2A8D0E9EEB646246DA/compose?format=webp&width=2560",
        headline: "디즈니+ 티빙 웨이브 번들 출시!",
        logos: ["disney", "tving", "wavve"], 
        primaryCta: { label: "번들로 할인 받기", onClick: () => {} },
        secondaryCta: { label: "디즈니+ 구독하기", onClick: () => {} },
        paragraphs: [
          {
            type: "normal",
            html: `디즈니+ 멤버십은 결제 화면에서 월간 또는 연간 결제 주기를 선택할 수 있습니다.<br/>
                  번들 멤버십은 디즈니+ 티빙 번들과 디즈니+ 티빙 웨이브 번들 중 선택할 수 있습니다.<br/>
                  <b>더 자세한 사항은 모든 멤버십 유형 보기에서 확인해 보세요.</b>`,
          },
          {
            type: "small",
            html: `디즈니+ 스탠다드는 월 9,900원부터, 디즈니+ 프리미엄은 월 13,900원부터 구독 가능합니다.<br/>
                  디즈니+ 티빙 번들은 월 18,000원에, 디즈니+ 티빙 웨이브 번들은 월 21,500원에 구독 가능합니다.<br/>
                  자세한 사항은 <u>여기서 확인</u>하세요.`,
          },
          { type: "xsmall", html: `*모든 가격은 부가세 포함. 추가 약관 적용.` },
        ],
        caption: {
          title: "The Eras Tour | The Final Show",
          streamingText: "지금 스트리밍 중",
        },
      },
      {
        id: "tron",
        image:
          "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/885E57193B187653BCE41017EF265DA89D0B316F4B088368B1DE670D2ABB5FDF/compose?format=webp&width=2560",
                headline: "디즈니+ 티빙 웨이브 번들 출시!",
        logos: ["disney", "tving", "wavve"],
        primaryCta: { label: "번들로 할인 받기", onClick: () => {} },
        secondaryCta: { label: "디즈니+ 구독하기", onClick: () => {} },
        paragraphs: [
          {
            type: "normal",
            html: `디즈니+ 멤버십은 결제 화면에서 월간 또는 연간 결제 주기를 선택할 수 있습니다.<br/>
                  번들 멤버십은 디즈니+ 티빙 번들과 디즈니+ 티빙 웨이브 번들 중 선택할 수 있습니다.<br/>
                  <b>더 자세한 사항은 모든 멤버십 유형 보기에서 확인해 보세요.</b>`,
          },
          {
            type: "small",
            html: `디즈니+ 스탠다드는 월 9,900원부터, 디즈니+ 프리미엄은 월 13,900원부터 구독 가능합니다.<br/>
                  디즈니+ 티빙 번들은 월 18,000원에, 디즈니+ 티빙 웨이브 번들은 월 21,500원에 구독 가능합니다.<br/>
                  자세한 사항은 <u>여기서 확인</u>하세요.`,
          },
          { type: "xsmall", html: `*모든 가격은 부가세 포함. 추가 약관 적용.` },
        ],
        caption: { title: "트론: 아레스", streamingText: "1월 7일 스트리밍" },
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const goTo = (i) => setIndex(i);
  const next = () => setIndex((prev) => (prev + 1) % slides.length);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, slides.length]);

  const active = slides[index];

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ ["--fade-ms"]: `${FADE_MS}ms` }}
    >
      <button
        type="button"
        className="hero__hintArrow"
        aria-label="아래로 이동"
        onClick={() => {
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
        }}
      >
        <span className="hero__hintIcon" />
      </button>

      {/* Background images */}
      <div className="hero__bgStack" aria-label="hero background slider">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`hero__bgSlide ${i === index ? "is-active" : ""}`}
            aria-hidden={i === index ? "false" : "true"}
          >
            <img
              className="hero__bgImg"
              src={s.image}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Left-dark overlay */}
      <div className="hero__overlay" />

      {/* Content */}
      <div className="hero__content">
        <div key={active.id} className="hero__contentFade">
          <h1 className="hero__headline">{active.headline}</h1>

          <div className="hero__logos">
            {active.logos.map((name) => (
              <span key={name} className={`hero__logo hero__logo--${name}`}>
                {name === "disney" ? "Disney+" : name}
              </span>
            ))}
          </div>

          <div className="hero__ctas">
            <button
              type="button"
              className="hero__cta hero__cta--primary"
              onClick={active.primaryCta.onClick}
            >
              {active.primaryCta.label}
            </button>
            <button
              type="button"
              className="hero__cta hero__cta--secondary"
              onClick={active.secondaryCta.onClick}
            >
              {active.secondaryCta.label}
            </button>
          </div>

          <div className="hero__body">
            {active.paragraphs.map((p, idx) => (
              <p
                key={idx}
                className={`hero__p hero__p--${p.type}`}
                dangerouslySetInnerHTML={{ __html: p.html }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="hero__bottomNav">
        <div className="hero__thinBars" aria-label="slide navigation">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`hero__thinBar ${i === index ? "is-active" : ""}`}
              aria-label={`${i + 1}번째 슬라이드로 이동`}
              aria-current={i === index ? "true" : "false"}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className="hero__playPause"
          aria-label={paused ? "재생" : "일시정지"}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "▶" : "Ⅱ"}
        </button>
      </div>

      <div className="hero__captionWrap" aria-hidden="true">
        <div key={active.id} className="hero__captionFade">
          <div className="hero__captionTitle">{active.caption.title}</div>
          <div className="hero__captionSub">{active.caption.streamingText}</div>
        </div>
      </div>
    </section>
  );
}
