import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "scroll:positions:v4";

function loadMap() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveMap(map) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

// ✅ 실제 스크롤 엘리먼트 찾기 (layout이 스크롤이면 그걸 쓰고, 아니면 문서)
function getScrollEl() {
  const layout = document.querySelector(".layout");
  if (layout) {
    const oy = getComputedStyle(layout).overflowY;
    if (oy && oy !== "visible") return layout;
  }
  return document.scrollingElement || document.documentElement;
}

function isDocEl(el) {
  const docEl = document.scrollingElement || document.documentElement;
  return el === docEl || el === document.documentElement || el === document.body;
}

function getY(el) {
  return isDocEl(el) ? window.scrollY || 0 : el.scrollTop || 0;
}

function setY(el, y) {
  if (isDocEl(el)) window.scrollTo(0, y);
  else el.scrollTop = y;
}

export default function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType(); // PUSH | POP | REPLACE

  // ✅ "페이지 단위"로 스크롤을 기억하려면 routeKey로 통일해야 함
  const routeKey = useMemo(
    () => location.pathname + location.search,
    [location.pathname, location.search]
  );

  const scrollElRef = useRef(null);

  // ✅ 스크롤 이벤트로 계속 저장 (routeKey로 저장!)
  useEffect(() => {
    const el = getScrollEl();
    scrollElRef.current = el;

    const onScroll = () => {
      const map = loadMap();
      map[routeKey] = getY(el);
      saveMap(map);
    };

    const target = isDocEl(el) ? window : el;

    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // 초기 저장

    return () => target.removeEventListener("scroll", onScroll);
  }, [routeKey]);

  // ✅ 라우트 변경 시 복구 (POP 또는 restoreScroll 플래그)
  useLayoutEffect(() => {
    const el = scrollElRef.current || getScrollEl();
    scrollElRef.current = el;

    const map = loadMap();
    const savedY = Number(map[routeKey] ?? 0);

    const apply = (y) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => setY(el, y), 80);
        });
      });
    };

    const shouldRestore =
      navType === "POP" || location.state?.restoreScroll === true;

    if (shouldRestore) apply(savedY);
    else apply(0);
  }, [routeKey, navType, location.state?.restoreScroll]);

  return null;
}