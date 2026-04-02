import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import {
  getDetailReloadTarget,
  getLandingReloadTarget,
  getLandingRestoreTarget,
  isHardLoadEntry,
} from "./scrollRestoreRoutePolicy";

const SCROLL_MAP_KEY = "scroll:positions:v7";
const SECTION_MAP_KEY = "scroll:sections:v1";

function loadJsonMap(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function saveJsonMap(key, map) {
  sessionStorage.setItem(key, JSON.stringify(map));
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

function getViewportHeight(el) {
  return isDocEl(el) ? window.innerHeight : el.clientHeight;
}

function getY(el) {
  return isDocEl(el) ? window.scrollY || 0 : el.scrollTop || 0;
}

function setY(el, y) {
  if (isDocEl(el)) {
    window.scrollTo(0, y);
  } else {
    el.scrollTop = y;
  }
}

function getMaxScrollableY(el) {
  if (isDocEl(el)) {
    const doc = document.documentElement;
    const body = document.body;
    const scrollHeight = Math.max(
      body?.scrollHeight || 0,
      doc?.scrollHeight || 0,
      body?.offsetHeight || 0,
      doc?.offsetHeight || 0,
      body?.clientHeight || 0,
      doc?.clientHeight || 0
    );
    return Math.max(0, scrollHeight - window.innerHeight);
  }

  return Math.max(0, el.scrollHeight - el.clientHeight);
}

function getElementTop(el, scrollEl) {
  if (!el) return 0;

  if (isDocEl(scrollEl)) {
    const rect = el.getBoundingClientRect();
    return (window.scrollY || 0) + rect.top;
  }

  const elRect = el.getBoundingClientRect();
  const scrollRect = scrollEl.getBoundingClientRect();
  return getY(scrollEl) + (elRect.top - scrollRect.top);
}

function getAnchorKey(el, index) {
  if (!el) return `auto:${index}`;
  return el.getAttribute("data-restore-anchor") || `auto:${index}`;
}

function isLatePageAnchor(anchorKey = "") {
  return anchorKey === "app-footer" || anchorKey.includes("footer") || anchorKey === "main-feedback";
}

function canUseLatePageSnapshot(scrollEl, currentY) {
  const maxY = getMaxScrollableY(scrollEl);
  const viewportHeight = getViewportHeight(scrollEl);
  return currentY >= Math.max(0, maxY - viewportHeight * 0.6);
}

function getSectionCandidates() {
  const explicit = Array.from(document.querySelectorAll("[data-restore-anchor]"));
  if (explicit.length > 0) {
    return explicit.filter((el) => el.getBoundingClientRect().height > 40);
  }

  const root =
    document.querySelector("main") ||
    document.querySelector("[data-page-root]") ||
    document.querySelector(".page");
  if (!root) return [];

  const children = Array.from(root.children).filter(
    (el) => el instanceof HTMLElement && el.getBoundingClientRect().height > 80
  );

  return children;
}

function getSectionSnapshot(scrollEl, routeKey) {
  const sections = getSectionCandidates();
  if (sections.length === 0) return null;

  const currentY = getY(scrollEl);
  const viewportHeight = getViewportHeight(scrollEl);
  const viewportTop = currentY;
  const viewportBottom = currentY + viewportHeight;
  const latePageAllowed = canUseLatePageSnapshot(scrollEl, currentY);

  let activeIndex = 0;
  let bestRatio = -1;
  let bestTop = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const top = getElementTop(section, scrollEl);
    const height = Math.max(1, section.getBoundingClientRect().height);
    const bottom = top + height;
    const visibleTop = Math.max(top, viewportTop);
    const visibleBottom = Math.min(bottom, viewportBottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibleRatio = visibleHeight / height;
    const anchorKey = getAnchorKey(section, index);

    if (visibleRatio <= 0) return;

    if (isLatePageAnchor(anchorKey) && visibleRatio < 0.5) {
      return;
    }

    if (
      visibleRatio > bestRatio ||
      (visibleRatio === bestRatio && top < bestTop)
    ) {
      bestRatio = visibleRatio;
      bestTop = top;
      activeIndex = index;
    }
  });

  if (bestRatio < 0) {
    const viewportMid = currentY + viewportHeight / 2;
    let bestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const top = getElementTop(section, scrollEl);
      const height = Math.max(1, section.getBoundingClientRect().height);
      const center = top + height / 2;
      const distance = Math.abs(center - viewportMid);
      const anchorKey = getAnchorKey(section, index);

      if (isLatePageAnchor(anchorKey) && !latePageAllowed) {
        return;
      }

      if (distance < bestDistance) {
        bestDistance = distance;
        activeIndex = index;
      }
    });
  }

  const section = sections[activeIndex];
  const top = getElementTop(section, scrollEl);
  const height = Math.max(1, section.getBoundingClientRect().height);
  const rawOffset = Math.max(0, currentY - top);
  const maxY = getMaxScrollableY(scrollEl);

  return {
    key: routeKey,
    anchorKey: getAnchorKey(section, activeIndex),
    index: activeIndex,
    offsetRatio: Math.max(0, Math.min(1, rawOffset / height)),
    visibleRatio: Math.max(0, Math.min(1, bestRatio)),
    pageRatio: maxY > 0 ? Math.max(0, Math.min(1, currentY / maxY)) : 0,
    y: currentY,
  };
}

function findSectionTarget(scrollEl, snapshot) {
  if (!snapshot) return null;

  const sections = getSectionCandidates();
  if (sections.length === 0) return null;

  let section =
    sections.find((el, index) => getAnchorKey(el, index) === snapshot.anchorKey) ||
    sections[snapshot.index] ||
    null;

  if (!section) return null;

  const top = getElementTop(section, scrollEl);
  const height = Math.max(1, section.getBoundingClientRect().height);
  return {
    y: Math.max(0, top + height * (snapshot.offsetRatio || 0)),
    top,
    height,
  };
}

function normalizeSnapshotForRestore(scrollEl, snapshot, fallbackY) {
  if (!snapshot) return null;
  if (!isLatePageAnchor(snapshot.anchorKey)) return snapshot;
  if ((snapshot.visibleRatio || 0) >= 0.5) return snapshot;
  if (canUseLatePageSnapshot(scrollEl, fallbackY)) return snapshot;
  return null;
}

function findSectionTargetFromY(scrollEl, savedY, snapshot) {
  if (!Number.isFinite(savedY) || savedY <= 0) return null;

  const sections = getSectionCandidates();
  if (sections.length === 0) return null;

  const viewportMid = savedY + getViewportHeight(scrollEl) / 2;
  const latePageAllowed = canUseLatePageSnapshot(scrollEl, savedY);

  let activeIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const top = getElementTop(section, scrollEl);
    const height = Math.max(1, section.getBoundingClientRect().height);
    const bottom = top + height;
    const anchorKey = getAnchorKey(section, index);

    if (
      isLatePageAnchor(anchorKey) &&
      !latePageAllowed &&
      !(
        snapshot &&
        snapshot.anchorKey === anchorKey &&
        (snapshot.visibleRatio || 0) >= 0.5
      )
    ) {
      return;
    }

    if (viewportMid >= top && viewportMid <= bottom) {
      activeIndex = index;
      bestDistance = -1;
      return;
    }

    if (bestDistance >= 0) {
      const center = top + height / 2;
      const distance = Math.abs(center - viewportMid);
      if (distance < bestDistance) {
        bestDistance = distance;
        activeIndex = index;
      }
    }
  });

  const section = sections[activeIndex];
  if (!section) return null;

  const top = getElementTop(section, scrollEl);
  const height = Math.max(1, section.getBoundingClientRect().height);
  const anchorKey = getAnchorKey(section, activeIndex);

  let offsetRatio = Math.max(0, Math.min(1, (savedY - top) / height));
  if (
    snapshot &&
    snapshot.anchorKey === anchorKey &&
    Number.isFinite(snapshot.offsetRatio) &&
    !isLatePageAnchor(anchorKey)
  ) {
    offsetRatio = snapshot.offsetRatio;
  }

  return {
    y: Math.max(0, top + height * offsetRatio),
    top,
    height,
  };
}

function isNotFoundRoutePath(pathname = "") {
  if (pathname === "/" || pathname === "/login" || pathname === "/main" || pathname === "/search") {
    return false;
  }

  if (pathname.startsWith("/detail/")) {
    return false;
  }

  if (pathname === "/feedback" || pathname === "/feedback/new" || pathname.startsWith("/feedback/")) {
    return false;
  }

  return true;
}

export default function ScrollManager({ onRestoreComplete }) {
  const location = useLocation();
  const navType = useNavigationType();

  const scrollElRef = useRef(null);
  const isRestoringRef = useRef(true);
  const handledEntryRef = useRef("");
  const forceCompleteTimerRef = useRef(null);
  const topPinFrameRef = useRef(null);
  const overflowAnchorRef = useRef(null);

  const routeKey = useMemo(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search]
  );
  const isMainRoute = location.pathname === "/main";
  const isLandingRoute = location.pathname === "/";
  const isDetailRoute = location.pathname.startsWith("/detail/");
  const isNotFoundRoute = isNotFoundRoutePath(location.pathname);
  const consumedRestoreStateRef = useRef("");
  const initialAppLoadRef = useRef(true);

  const persistScroll = useCallback(
    (y) => {
      const map = loadJsonMap(SCROLL_MAP_KEY);
      map[routeKey] = y;
      saveJsonMap(SCROLL_MAP_KEY, map);

      if (isMainRoute) {
        return;
      }

      const sectionMap = loadJsonMap(SECTION_MAP_KEY);
      const snapshot = getSectionSnapshot(scrollElRef.current || getScrollEl(), routeKey);
      if (snapshot) {
        sectionMap[routeKey] = snapshot;
        saveJsonMap(SECTION_MAP_KEY, sectionMap);
      }
    },
    [isMainRoute, routeKey]
  );

  useEffect(() => {
    const el = getScrollEl();
    scrollElRef.current = el;

    const onScroll = () => {
      if (isRestoringRef.current) return;
      persistScroll(getY(el));
    };

    const target = isDocEl(el) ? window : el;
    target.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", onScroll);
    };
  }, [persistScroll, routeKey]);

  useLayoutEffect(() => {
    const entryToken = `${location.key || "nokey"}|${routeKey}`;

    if (handledEntryRef.current === entryToken) {
      return;
    }

    handledEntryRef.current = entryToken;
    isRestoringRef.current = true;
    const isInitialAppLoad = initialAppLoadRef.current;
    initialAppLoadRef.current = false;

    const el = scrollElRef.current || getScrollEl();
    scrollElRef.current = el;

    if (!isDocEl(el) && el instanceof HTMLElement) {
      overflowAnchorRef.current = el.style.overflowAnchor;
      el.style.overflowAnchor = "none";
    }

    const scrollMap = loadJsonMap(SCROLL_MAP_KEY);
    const sectionMap = loadJsonMap(SECTION_MAP_KEY);
    const savedY = Number(scrollMap[routeKey] ?? 0);
    const savedSection = normalizeSnapshotForRestore(
      el,
      sectionMap[routeKey] || null,
      savedY
    );

    const explicitRestore =
      location.state?.restoreScroll === true &&
      typeof location.state?.restoreScrollY === "number";

    if (explicitRestore && consumedRestoreStateRef.current !== entryToken) {
      consumedRestoreStateRef.current = entryToken;

      try {
        const currentState = window.history.state || {};
        const usr = currentState.usr || {};
        const nextUsr = { ...usr };
        delete nextUsr.restoreScroll;
        delete nextUsr.restoreScrollY;

        window.history.replaceState(
          { ...currentState, usr: nextUsr },
          "",
          window.location.href
        );
      } catch {
        // no-op
      }
    }

    if (isMainRoute && explicitRestore) {
      scrollMap[routeKey] = location.state.restoreScrollY;
      saveJsonMap(SCROLL_MAP_KEY, scrollMap);
      delete sectionMap[routeKey];
      saveJsonMap(SECTION_MAP_KEY, sectionMap);
    }

    const hardLoadEntry =
      isHardLoadEntry(isInitialAppLoad) &&
      !explicitRestore &&
      navType !== "POP";
    const canRestore =
      !hardLoadEntry && !isDetailRoute && !isNotFoundRoute && (explicitRestore || navType === "POP");
    if (!canRestore) {
      const resolveNonRestoreTarget = () => {
        if (isNotFoundRoute) {
          return { y: 0, pinUntilStable: true };
        }

        if (isMainRoute) {
          return { y: 0, pinUntilStable: true };
        }

        return (
          getLandingReloadTarget({
            pathname: location.pathname,
            isInitialAppLoad,
            scrollEl: el,
            savedY,
            sectionSnapshot: savedSection,
            resolveSectionTarget: findSectionTarget,
          }) ||
          getDetailReloadTarget({
            pathname: location.pathname,
            isInitialAppLoad,
            scrollEl: el,
            sectionSnapshot: savedSection,
            resolveSectionTarget: findSectionTarget,
          }) || { y: 0, pinUntilStable: false }
        );
      };

      const finishNonRestore = (targetY = 0) => {
        if (forceCompleteTimerRef.current) {
          clearTimeout(forceCompleteTimerRef.current);
          forceCompleteTimerRef.current = null;
        }
        if (topPinFrameRef.current) {
          cancelAnimationFrame(topPinFrameRef.current);
          topPinFrameRef.current = null;
        }
        setY(el, targetY);
        isRestoringRef.current = false;
        persistScroll(targetY);
        if (!isDocEl(el) && el instanceof HTMLElement) {
          el.style.overflowAnchor = overflowAnchorRef.current || "";
        }
        onRestoreComplete?.();
      };

      let tries = 0;
      let lastMaxY = -1;
      let stableMaxYCount = 0;

      const keepNonRestoreTargetPinned = () => {
        if (!isRestoringRef.current) return;

        const maxY = getMaxScrollableY(el);
        const nextTarget = resolveNonRestoreTarget();
        const boundedTarget = Math.min(Math.max(0, nextTarget.y || 0), maxY);
        const requiredStableFrames = nextTarget.waitForMaxDepth ? Number.POSITIVE_INFINITY : 12;

        setY(el, boundedTarget);

        if (maxY === lastMaxY) {
          stableMaxYCount += 1;
        } else {
          stableMaxYCount = 0;
          lastMaxY = maxY;
        }

        if (
          ((!nextTarget.waitForAnchor &&
            stableMaxYCount >= requiredStableFrames &&
            Math.abs(getY(el) - boundedTarget) <= 2) ||
            tries >= (nextTarget.waitForMaxDepth ? 240 : 180))
        ) {
          finishNonRestore(boundedTarget);
          return;
        }

        tries += 1;
        topPinFrameRef.current = requestAnimationFrame(keepNonRestoreTargetPinned);
      };

      const initialNonRestoreTarget = resolveNonRestoreTarget();
      const initialTargetY = Math.max(0, initialNonRestoreTarget.y || 0);

      setY(el, initialTargetY);
      requestAnimationFrame(() => {
        setY(el, initialTargetY);
        requestAnimationFrame(() => {
          const nextTarget = resolveNonRestoreTarget();
          const nextTargetY = Math.max(0, nextTarget.y || 0);

          setY(el, nextTargetY);
          if (nextTarget.pinUntilStable) {
            keepNonRestoreTargetPinned();
            forceCompleteTimerRef.current = window.setTimeout(
              () => finishNonRestore(Math.max(0, resolveNonRestoreTarget().y || 0)),
              nextTarget.waitForMaxDepth ? 5200 : 4000
            );
            return;
          }
          finishNonRestore(nextTargetY);
        });
      });
      return () => {
        if (forceCompleteTimerRef.current) {
          clearTimeout(forceCompleteTimerRef.current);
          forceCompleteTimerRef.current = null;
        }
        if (topPinFrameRef.current) {
          cancelAnimationFrame(topPinFrameRef.current);
          topPinFrameRef.current = null;
        }
        if (!isDocEl(el) && el instanceof HTMLElement) {
          el.style.overflowAnchor = overflowAnchorRef.current || "";
        }
      };
    }

    const finishRestore = () => {
      if (!isRestoringRef.current) return;
      isRestoringRef.current = false;
      if (forceCompleteTimerRef.current) {
        clearTimeout(forceCompleteTimerRef.current);
        forceCompleteTimerRef.current = null;
      }
      persistScroll(getY(el));
      if (!isDocEl(el) && el instanceof HTMLElement) {
        el.style.overflowAnchor = overflowAnchorRef.current || "";
      }
      onRestoreComplete?.();
    };

    const abortRestore = () => finishRestore();
    const handleUserScrollIntent = () => abortRestore();

    window.addEventListener("wheel", handleUserScrollIntent, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchmove", handleUserScrollIntent, {
      passive: true,
      capture: true,
    });
    window.addEventListener("keydown", handleUserScrollIntent, {
      passive: true,
      capture: true,
    });

    const fallbackY = explicitRestore ? location.state.restoreScrollY : savedY;
    const initialTarget = isMainRoute
      ? fallbackY > 0
        ? { y: fallbackY }
        : null
      : isLandingRoute
        ? getLandingRestoreTarget({
            pathname: location.pathname,
            scrollEl: el,
            savedY,
            sectionSnapshot: savedSection,
            resolveSectionTarget: findSectionTarget,
          })
        : findSectionTargetFromY(el, savedY, savedSection) || findSectionTarget(el, savedSection);
    if (initialTarget && getY(el) > initialTarget.y + 2) {
      setY(el, initialTarget.y);
    } else if (!initialTarget && fallbackY > 0 && getY(el) > fallbackY + 2) {
      setY(el, fallbackY);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let tries = 0;
        let lastMaxY = -1;
        let stableMaxYCount = 0;

        const settle = () => {
          if (!isRestoringRef.current) return;

          const sectionTarget = isMainRoute
            ? null
            : isLandingRoute
              ? getLandingRestoreTarget({
                  pathname: location.pathname,
                  scrollEl: el,
                  savedY,
                  sectionSnapshot: savedSection,
                  resolveSectionTarget: findSectionTarget,
                })
              : findSectionTargetFromY(el, savedY, savedSection) ||
                findSectionTarget(el, savedSection);
          const targetY = sectionTarget ? sectionTarget.y : fallbackY;
          const maxY = getMaxScrollableY(el);
          const boundedTarget = Math.min(Math.max(0, targetY), maxY);
          const canReachTarget = maxY >= Math.max(0, targetY) - 2;

          if (maxY === lastMaxY) {
            stableMaxYCount += 1;
          } else {
            stableMaxYCount = 0;
            lastMaxY = maxY;
          }

          setY(el, boundedTarget);

          const currentY = getY(el);
          const reached = Math.abs(currentY - boundedTarget) <= 2;
          const enough = isMainRoute
            ? reached && canReachTarget
            : reached && (!sectionTarget || canReachTarget || stableMaxYCount >= 8);
          const gaveUp = tries >= 96 && stableMaxYCount >= 12;

          if (enough || gaveUp) {
            finishRestore();
            return;
          }

          tries += 1;
          setTimeout(settle, 24);
        };

        settle();
      });
    });

    forceCompleteTimerRef.current = setTimeout(() => {
      finishRestore();
    }, isMainRoute ? 4000 : 2400);

    return () => {
      if (forceCompleteTimerRef.current) {
        clearTimeout(forceCompleteTimerRef.current);
        forceCompleteTimerRef.current = null;
      }
      if (topPinFrameRef.current) {
        cancelAnimationFrame(topPinFrameRef.current);
        topPinFrameRef.current = null;
      }
      if (!isDocEl(el) && el instanceof HTMLElement) {
        el.style.overflowAnchor = overflowAnchorRef.current || "";
      }
      window.removeEventListener("wheel", handleUserScrollIntent, true);
      window.removeEventListener("touchmove", handleUserScrollIntent, true);
      window.removeEventListener("keydown", handleUserScrollIntent, true);
    };
  }, [
    isMainRoute,
    isLandingRoute,
    isDetailRoute,
    isNotFoundRoute,
    location.key,
    location.pathname,
    location.state?.restoreScroll,
    location.state?.restoreScrollY,
    navType,
    onRestoreComplete,
    persistScroll,
    routeKey,
  ]);

  return null;
}
