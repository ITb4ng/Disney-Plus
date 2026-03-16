import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { GoSearch } from "react-icons/go";
import { SiThemoviedatabase } from "react-icons/si";
import { IoDiceOutline } from "react-icons/io5";
import { useSearchTransition } from "../../../contexts/SearchTransitionContext";
import { getAppScrollY } from "../../../utils/scrollPosition";

const ROUTES = {
  search: "/search",
  detail: (type, id) => `/detail/${type}/${id}`,
};

const SAMPLE = { type: "movie", id: 674 };
const PRESS_DELAY_MS = 120;
const LERP = 0.12;
const PARALLAX = 1.2;
const PRESET_QUERIES = ["마블", "디즈니", "픽사", "스타워즈", "애니메이션"];

function pickRandom(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

export default function DemoActionSection() {
  const nav = useNavigate();
  const location = useLocation();
  const { triggerSearchTransition } = useSearchTransition();

  const [randomLoading, setRandomLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    triggerSearchTransition("demo-action");
    nav(`${ROUTES.search}?${qs.toString()}`, {
      state: {
        from: location.pathname + location.search,
        scrollY: getAppScrollY(),
      },
    });
  }, [location.pathname, location.search, nav, triggerSearchTransition]);

  const goSampleDetail = useCallback(() => {
    nav(ROUTES.detail(SAMPLE.type, SAMPLE.id));
  }, [nav]);

  const goRandomPopularDetail = useCallback(async () => {
    if (randomLoading) return;

    setRandomLoading(true);
    setErrorMsg("");

    try {
      abortRef.current?.abort?.();
      const ac = new AbortController();
      abortRef.current = ac;

      const res = await fetch("/api/tmdb?path=movie/911430/recommendations", {
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

      nav(ROUTES.detail("movie", candidate.id));
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Random popular detail error:", error);
      if (mountedRef.current) {
        setErrorMsg("추천 콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      if (mountedRef.current) setRandomLoading(false);
    }
  }, [nav, randomLoading]);

  const cards = useMemo(
    () => [
      {
        key: "search",
        icon: <GoSearch aria-hidden="true" />,
        title: "검색 체험하기",
        desc: "검색 UX와 결과 구성을 빠르게 확인해 보세요.",
        badge: "추천",
        action: goSearch,
      },
      {
        key: "detail",
        icon: <SiThemoviedatabase aria-hidden="true" />,
        title: "샘플 디테일 보기",
        desc: "배너 비주얼과 스크롤 구성을 포함한 상세 페이지를 바로 확인합니다.",
        badge: "고정",
        action: goSampleDetail,
      },
      {
        key: "random",
        icon: <IoDiceOutline aria-hidden="true" />,
        title: randomLoading ? "추천 불러오는 중" : "랜덤 추천 열기",
        desc: "추천 목록에서 무작위 작품 하나를 골라 상세 페이지로 이동합니다.",
        badge: "랜덤",
        action: goRandomPopularDetail,
        disabled: randomLoading,
        loading: randomLoading,
      },
    ],
    [goSearch, goSampleDetail, goRandomPopularDetail, randomLoading]
  );

  return (
    <Wrap aria-label="체험 섹션">
      <Header>
        <Eyebrow>빠르게 둘러보기</Eyebrow>
        <Title>주요 인터랙션 바로 이어보기</Title>
        <Sub>
          카드를 눌러 검색, 디테일, 추천 흐름을 바로 확인할 수 있습니다.
        </Sub>
      </Header>

      <Grid>
        {cards.map((card) => (
          <ActionCard
            key={card.key}
            testId={`demo-action-${card.key}`}
            icon={card.icon}
            title={card.title}
            desc={card.desc}
            badge={card.badge}
            hint={card.key === "random" ? "클릭 시 랜덤 추천으로 이동" : "클릭 시 바로 이동"}
            onAction={card.action}
            disabled={!!card.disabled}
            loading={!!card.loading}
          />
        ))}
      </Grid>

      {errorMsg ? <ErrorBox role="status">{errorMsg}</ErrorBox> : null}
    </Wrap>
  );
}
function ActionCard({
  testId,
  icon,
  title,
  desc,
  badge,
  hint,
  onAction,
  disabled,
  loading,
}) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const timeoutRef = useRef(0);

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
    window.setTimeout(() => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    }, 220);
  }, []);

  useEffect(() => {
    initCenter();
  }, [initCenter]);

  const onPointerEnter = useCallback(
    (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      startLoop();
    },
    [startLoop]
  );

  const onPointerMove = useCallback((event) => {
    const el = ref.current;
    if (!el) return;
    if (event.pointerType && event.pointerType !== "mouse") return;

    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    target.current.x = x;
    target.current.y = y;

    const nx = (x / rect.width) * 2 - 1;
    const ny = (y / rect.height) * 2 - 1;
    target.current.px = nx * PARALLAX;
    target.current.py = ny * (PARALLAX * 0.85);
  }, []);

  const onPointerLeave = useCallback(
    (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      const el = ref.current;
      if (!el) return;

      target.current.x = el.clientWidth * 0.5;
      target.current.y = el.clientHeight * 0.12;
      target.current.px = 0;
      target.current.py = 0;

      stopLoopSoon();
    },
    [stopLoopSoon]
  );

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
      data-testid={testId}
      disabled={disabled}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={handleClick}
      aria-label={title}
      $pressed={pressed}
    >
      <CardInner>
        <CardTop>
          {loading ? <Spinner aria-hidden="true" /> : <Icon>{icon}</Icon>}
          {badge ? <Badge>{badge}</Badge> : null}
        </CardTop>
        <CardTitle>{title}</CardTitle>
        <CardDesc>{desc}</CardDesc>
        <CardHint>{hint}</CardHint>
      </CardInner>
    </CardButton>
  );
}

const Wrap = styled.section`
  width: 100%;
  margin: 0;
`;

const Header = styled.div`
  max-width: 720px;
  margin-bottom: 18px;
`;

const Eyebrow = styled.div`
  font-size: 14px;
  font-weight: 700;
  opacity: 0.85;
`;

const Title = styled.h2`
  margin: 6px 0 0;
  font-size: 22px;
  line-height: 1.24;
`;

const Sub = styled.p`
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.72;
`;

const Grid = styled.div`
  display: grid;
  gap: clamp(14px, 1.4vw, 18px);
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
    gap: 12px;

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
  display: block;
  width: 100%;
  min-height: 176px;
  overflow: hidden;
  padding: 22px 20px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.075),
    rgba(255, 255, 255, 0.02)
  );
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    transform 170ms ease,
    filter 170ms ease,
    box-shadow 170ms ease,
    border-color 170ms ease;

  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 16px;
    opacity: 0;
    pointer-events: none;
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
    opacity: 0.55;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0) 42%,
      rgba(0, 0, 0, 0.12)
    );
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-4px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.36);
      filter: brightness(1.06);
    }

    &:hover::before {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.99);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
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
    padding: 20px 18px;
  }

  @media (hover: none) and (pointer: coarse) {
    &::before {
      display: none;
    }
  }
`;

const CardInner = styled.div`
  position: relative;
  z-index: 1;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  line-height: 1;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 11px;
  opacity: 0.92;
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
`;

const CardDesc = styled.p`
  display: -webkit-box;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.8;
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
  border: 2px solid rgba(255, 255, 255, 0.22);
  border-top-color: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
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
  border: 1px solid rgba(255, 80, 80, 0.28);
  border-radius: 12px;
  background: rgba(255, 80, 80, 0.08);
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.9;
`;