import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_MAP_KEY = "scroll:positions:v6";
const RELOAD_TOKEN_KEY = "scroll:reload:token:v1";

function loadMap() {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_MAP_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveMap(map) {
  sessionStorage.setItem(SCROLL_MAP_KEY, JSON.stringify(map));
}

function readReloadToken() {
  try {
    const raw = sessionStorage.getItem(RELOAD_TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeReloadToken(token) {
  sessionStorage.setItem(RELOAD_TOKEN_KEY, JSON.stringify(token));
}

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

export default function ScrollManager({ onRestoreComplete }) {
  const location = useLocation();
  const navType = useNavigationType(); // POP | PUSH | REPLACE

  const scrollElRef = useRef(null);
  const isRestoringRef = useRef(true);
  const handledEntryRef = useRef("");
  const firstEntryRef = useRef(true);

  const routeKey = useMemo(
    () => location.pathname + location.search,
    [location.pathname, location.search]
  );

  const isReload = useMemo(() => {
    try {
      const nav = performance.getEntriesByType("navigation")?.[0];
      return nav?.type === "reload";
    } catch {
      return false;
    }
  }, []);

  // 새로고침 직전에는 항상 현재 스크롤을 저장한다.
  // 무스크롤 새로고침에서도 동일 위치를 유지하는 방향이다.
  useEffect(() => {
    const saveForReload = () => {
      const el = scrollElRef.current || getScrollEl();
      writeReloadToken({
        key: routeKey,
        y: getY(el),
        t: Date.now(),
      });
    };

    window.addEventListener("beforeunload", saveForReload);
    window.addEventListener("pagehide", saveForReload);
    return () => {
      window.removeEventListener("beforeunload", saveForReload);
      window.removeEventListener("pagehide", saveForReload);
    };
  }, [routeKey]);

  // 라우트별 현재 스크롤을 계속 저장한다.
  useEffect(() => {
    const el = getScrollEl();
    scrollElRef.current = el;

    const onScroll = () => {
      const y = getY(el);
      const map = loadMap();
      map[routeKey] = y;
      saveMap(map);
      // 새로고침 이벤트(beforeunload/pagehide)가 누락되더라도
      // 마지막 스크롤 값을 사용할 수 있도록 reload 토큰도 동기화한다.
      writeReloadToken({
        key: routeKey,
        y,
        t: Date.now(),
      });
    };

    const target = isDocEl(el) ? window : el;
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [routeKey]);

  useLayoutEffect(() => {
    const entryToken = `${location.key || "nokey"}|${routeKey}`;
    if (handledEntryRef.current === entryToken) {
      onRestoreComplete?.();
      return;
    }

    handledEntryRef.current = entryToken;
    isRestoringRef.current = true;

    const el = scrollElRef.current || getScrollEl();
    scrollElRef.current = el;

    const map = loadMap();
    const savedY = Number(map[routeKey] ?? 0);
    const reloadToken = readReloadToken();

    const explicitRestore =
      location.state?.restoreScroll === true &&
      typeof location.state?.restoreScrollY === "number";

    const allowReloadRestore = firstEntryRef.current && isReload;
    firstEntryRef.current = false;

    let targetY = 0;

    if (explicitRestore) {
      targetY = location.state.restoreScrollY;
    } else if (allowReloadRestore) {
      if (reloadToken?.key === routeKey && typeof reloadToken?.y === "number") {
        targetY = reloadToken.y;
      } else {
        targetY = savedY;
      }
    } else if (navType === "POP") {
      targetY = savedY;
    } else {
      targetY = 0;
    }

    const nextMap = loadMap();
    nextMap[routeKey] = targetY;
    saveMap(nextMap);

    setY(el, targetY);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let tries = 0;
        const maxTries = 12;

        const settle = () => {
          setY(el, targetY);
          const ok = Math.abs(getY(el) - targetY) <= 2;

          if (ok || tries >= maxTries) {
            isRestoringRef.current = false;
            onRestoreComplete?.();
            return;
          }

          tries += 1;
          setTimeout(settle, 40);
        };

        settle();
      });
    });
  }, [
    location.key,
    routeKey,
    navType,
    isReload,
    location.state?.restoreScroll,
    location.state?.restoreScrollY,
    onRestoreComplete,
  ]);

  return null;
}
