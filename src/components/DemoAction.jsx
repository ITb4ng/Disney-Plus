import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const ROUTES = {
  search: "/search",
  detail: (type, id) => `/detail/${type}/${id}`,
};

//주술회전
const SAMPLE = { type: "tv", id: 95479 };

const PRESS_DELAY_MS = 120;
const LERP = 0.12;
const PARALLAX = 1.2;
const PRESET_QUERIES = ["마블", "디즈니", "픽사", "스타워즈", "어벤져스"];

function pickRandom(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

export default function DemoActionSection() {
  const nav = useNavigate();

  const [randomLoading, setRandomLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ 최적화/안전: 언마운트/중복 요청 방지
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort?.();
    };
  }, []);

  const goSearch = useCallback(() => {
    const q = PRESET_QUERIES[Math.floor(Math.random() * PRESET_QUERIES.length)];
    const qs = new URLSearchParams({ q });
    nav(`${ROUTES.search}?${qs.toString()}`);
  }, [nav]);

  const goSampleDetail = useCallback(() => {
    nav(ROUTES.detail(SAMPLE.type, SAMPLE.id));
  }, [nav]);

  const goRandomPopularDetail = useCallback(async () => {
    if (randomLoading) return;

    setRandomLoading(true);
    setErrorMsg("");

    try {
      // ✅ 이전 요청이 남아있으면 취소
      abortRef.current?.abort?.();
      const ac = new AbortController();
      abortRef.current = ac;

      const res = await fetch("/api/tmdb?path=movie/popular&language=ko-KR&page=1", {
        method: "GET",
        signal: ac.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`popular fetch failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      const candidate = pickRandom(data?.results);

      if (!candidate?.id) throw new Error("no movie id in results");

      // ✅ 여기서 라우팅되면 컴포넌트가 언마운트될 수 있음
      nav(ROUTES.detail("movie", candidate.id));
    } catch (e) {
      if (e?.name === "AbortError") return;
      console.error("Random popular detail error:", e);
      if (mountedRef.current) {
        setErrorMsg("랜덤 콘텐츠를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      if (mountedRef.current) setRandomLoading(false);
    }
  }, [nav, randomLoading]);

  const cards = useMemo(
    () => [
      {
        key: "search",
        icon: "🔎",
        title: "검색 체험하기",
        desc: "검색 UX와 결과 동기화를 확인해보세요.",
        badge: "추천",
        action: goSearch,
      },
      {
        key: "detail",
        icon: "🎬",
        title: "샘플 디테일 보기",
        desc: "연출(비네팅/스크롤)과 정보 레이아웃을 확인해보세요.",
        badge: "안정",
        action: goSampleDetail,
      },
      {
        key: "random",
        icon: "🎲",
        title: randomLoading ? "랜덤 선택 중…" : "랜덤 인기 디테일",
        desc: "인기 목록에서 무작위로 하나 골라 디테일로 이동합니다.",
        badge: "재미",
        action: goRandomPopularDetail,
        disabled: randomLoading,
        loading: randomLoading,
      },
    ],
    [goSearch, goSampleDetail, goRandomPopularDetail, randomLoading]
  );

  return (
    <Wrap aria-label="체험 액션">
      <Header>
        <Eyebrow>이렇게 체험해 보세요</Eyebrow>
        <Title>핵심 인터랙션 빠르게 둘러보기</Title>
        <Sub>카드에 마우스를 올려 이동해보세요</Sub>
      </Header>

      <Grid>
        {cards.map((c) => (
          <JellyCard
            key={c.key}
            icon={c.icon}
            title={c.title}
            desc={c.desc}
            badge={c.badge}
            hint={c.key === "random" ? "클릭할 때마다 바뀜" : "클릭하면 이동"}
            onAction={c.action}
            disabled={!!c.disabled}
            loading={!!c.loading}
          />
        ))}
      </Grid>

      {errorMsg ? <ErrorBox role="status">{errorMsg}</ErrorBox> : null}
    </Wrap>
  );
}

/* =========================
   JellyCard (LERP spotlight + parallax + delayed action)
   ✅ 최적화: rAF 루프를 hover 중에만 실행
========================= */

function JellyCard({ icon, title, desc, badge, hint, onAction, disabled, loading }) {
  const ref = useRef(null);

  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const timeoutRef = useRef(0);

  // 목표/현재 위치
  const target = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const current = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const initCenter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
      target.current.x = el.clientWidth * 0.5;
      target.current.y = el.clientHeight * 0.12;
      target.current.px = 0;
      target.current.py = 0;

      current.current.x = target.current.x;
      current.current.y = target.current.y;
      current.current.px = 0;
      current.current.py = 0;

      el.style.setProperty("--mx", `${current.current.x}px`);
      el.style.setProperty("--my", `${current.current.y}px`);
      el.style.setProperty("--px", `${current.current.px}px`);
      el.style.setProperty("--py", `${current.current.py}px`);
  }, []);

  // ✅ 루프는 필요할 때만
  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;

    const tick = () => {
      const el = ref.current;
      if (!el || !runningRef.current) return;

      current.current.x += (target.current.x - current.current.x) * LERP;
      current.current.y += (target.current.y - current.current.y) * LERP;
      current.current.px += (target.current.px - current.current.px) * LERP;
      current.current.py += (target.current.py - current.current.py) * LERP;

      el.style.setProperty("--mx", `${current.current.x}px`);
      el.style.setProperty("--my", `${current.current.y}px`);
      el.style.setProperty("--px", `${current.current.px}px`);
      el.style.setProperty("--py", `${current.current.py}px`);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopLoopSoon = useCallback(() => {
    // ✅ leave 후에도 “복귀 애니메이션”이 보이도록 조금만 유지
    window.setTimeout(() => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    }, 220);
  }, []);

  useEffect(() => {
    // ✅ 초기 spotlight 좌표 세팅
    initCenter();
  }, [initCenter]);

  const onPointerEnter = useCallback(() => {
    startLoop();
  }, [startLoop]);

  const onPointerMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;

    // 터치(모바일)에서는 과한 효과 방지
    if (e.pointerType && e.pointerType !== "mouse") return;

    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    target.current.x = x;
    target.current.y = y;

    const nx = (x / r.width) * 2 - 1;
    const ny = (y / r.height) * 2 - 1;
    target.current.px = nx * PARALLAX;
    target.current.py = ny * (PARALLAX * 0.85);
  }, []);

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // 중앙으로 천천히 복귀
    target.current.x = el.clientWidth * 0.5;
    target.current.y = el.clientHeight * 0.12;
    target.current.px = 0;
    target.current.py = 0;

    stopLoopSoon();
  }, [stopLoopSoon]);

  const handleClick = useCallback(() => {
    if (disabled) return;

    setPressed(true);

    timeoutRef.current = window.setTimeout(async () => {
      try {
        await onAction?.();
      } finally {
        setPressed(false);
      }
    }, PRESS_DELAY_MS);
  }, [disabled, onAction]);

  return (
    <CardButton
      ref={ref}
      type="button"
      disabled={disabled}
      onPointerEnter={onPointerEnter} // ✅ 루프 시작
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave} // ✅ 루프 종료(지연)
      onClick={handleClick}
      aria-label={title}
      $pressed={pressed}
    >
      <CardInner>
          <CardTop>
            {loading ? (
              <Spinner aria-hidden="true" />
            ) : (
              <Icon aria-hidden="true">{icon}</Icon>
            )}
            {badge ? <Badge>{badge}</Badge> : null}
          </CardTop>
        <CardTitle>{title}</CardTitle>
        <CardDesc>{desc}</CardDesc>
        <CardHint>{hint}</CardHint>
      </CardInner>
    </CardButton>
  );
}

/* =========================
   Styled Components
   (아래는 원본 그대로 유지)
========================= */

const Wrap = styled.section`
  margin: 32px auto 40px;
  width: 100%;
  padding: 0 24px;
  @media (max-width: 640px) {
    padding: 0 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 14px;
`;

const Eyebrow = styled.div`
  font-size: 14px;
  opacity: 0.85;
`;

const Title = styled.h2`
  margin: 6px 0 0;
  font-size: 22px;
`;

const Sub = styled.div`
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.7;
  line-height: 1.45;
`;

const Grid = styled.div`
  display: grid;
  gap: 18px;

  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    & > *:first-child {
      grid-column: 1 / -1;
      min-height: 220px;
    }
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    & > *:first-child {
      grid-column: auto;
    }
  }
`;

const CardButton = styled.button`
  --mx: 50%;
  --my: 0%;
  --px: 0px;
  --py: 0px;

  position: relative;
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.075),
    rgba(255, 255, 255, 0.02)
  );
  color: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;

  padding: 22px 20px 22px;
  min-height: 176px;
  display: block;
  transition: transform 170ms ease, filter 170ms ease, box-shadow 170ms ease,
    border-color 170ms ease;

  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 16px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 160ms ease;
    background: radial-gradient(
      540px 280px at var(--mx) var(--my),
      rgba(255, 255, 255, 0.22),
      transparent 60%
    );
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    min-height: 190px;
    pointer-events: none;
    opacity: 0.55;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0) 42%,
      rgba(0, 0, 0, 0.12)
    );
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.36);
    filter: brightness(1.06);
  }
  &:hover::before {
    opacity: 1;
  }

  &:active {
    transform: translateY(-2px) scale(0.99);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.38);
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
    transform: none;
    box-shadow: none;
    filter: none;
  }

  @media (max-width: 640px) {
    min-height: 158px;
    padding: 20px 18px 20px;
  }

  @media (hover: none) and (pointer: coarse) {
    &::before {
      display: none;
    }
  }
`;
const CardInner = styled.div`
  position: relative;
  z-index: 1; /* ::after 그라디언트 위로 (필요 시) */
  display: flex;
  flex-direction: column;
  gap: 12px;
  transform: translate3d(var(--px), var(--py), 0);
  transition: transform 140ms ease;
  will-change: transform;

  @media (hover: none) and (pointer: coarse) {
    transform: none;
    transition: none;
  }
`;



const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Icon = styled.div`
  font-size: 26px;
  line-height: 1;
`;

const Badge = styled.div`
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  opacity: 0.92;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 640px) {
    top: 12px;
    right: 12px;
  }
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
`;

const CardDesc = styled.div`
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.8;

  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const CardHint = styled.div`
  font-size: 12px;
  opacity: 0.6;
`;

const Spinner = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.22);
  border-top-color: rgba(255, 255, 255, 0.7);
  animation: spin 700ms linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorBox = styled.div`
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 80, 80, 0.28);
  background: rgba(255, 80, 80, 0.08);
  font-size: 13px;
  opacity: 0.9;
`;