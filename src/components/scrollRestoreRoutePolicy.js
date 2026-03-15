function getNavigationEntryType() {
  try {
    return window.performance?.getEntriesByType?.("navigation")?.[0]?.type || "navigate";
  } catch {
    return "navigate";
  }
}

function getNavHeight() {
  const cssValue = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
  );
  if (Number.isFinite(cssValue) && cssValue > 0) {
    return cssValue;
  }

  const nav = document.querySelector(".app-nav");
  if (!nav) return 0;

  return Math.ceil(nav.getBoundingClientRect().height || 0);
}

function getSectionAlignOffset(sectionEl) {
  const navHeight = getNavHeight();
  if (!sectionEl) return navHeight;

  const scrollMarginTop = Number.parseFloat(getComputedStyle(sectionEl).scrollMarginTop);
  if (Number.isFinite(scrollMarginTop) && scrollMarginTop > 0) {
    return Math.max(navHeight, scrollMarginTop);
  }

  return navHeight;
}

function isDocEl(el) {
  const docEl = document.scrollingElement || document.documentElement;
  return el === docEl || el === document.documentElement || el === document.body;
}

function getMaxScrollableY(scrollEl) {
  if (!scrollEl) return 0;

  if (isDocEl(scrollEl)) {
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

  return Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

const LANDING_HERO_ANCHOR = "landing-hero";
const LANDING_RELOAD_ANCHORS = new Set([
  LANDING_HERO_ANCHOR,
  "landing-top10",
  "landing-pricing",
  "landing-faq",
  "app-footer",
]);

function getLandingSections(scrollEl, resolveSectionTarget) {
  return Array.from(document.querySelectorAll("[data-restore-anchor]"))
    .map((sectionEl, index) => {
      const anchorKey = sectionEl.getAttribute("data-restore-anchor") || `auto:${index}`;
      if (!LANDING_RELOAD_ANCHORS.has(anchorKey)) return null;

      const sectionTarget = resolveSectionTarget(scrollEl, {
        anchorKey,
        index,
        offsetRatio: 0,
      });

      if (!sectionTarget) return null;

      const alignOffset = getSectionAlignOffset(sectionEl);
      return {
        anchorKey,
        top: sectionTarget.top,
        y: Math.max(0, sectionTarget.top - alignOffset),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.top - b.top);
}

function getLandingCompareY(scrollEl, savedY, sectionSnapshot) {
  const currentMaxY = getMaxScrollableY(scrollEl);
  const fallbackY =
    Number.isFinite(savedY) && savedY > 0
      ? savedY
      : Number.isFinite(sectionSnapshot?.y)
        ? sectionSnapshot.y
        : 0;

  if (Number.isFinite(sectionSnapshot?.pageRatio) && currentMaxY > 0) {
    return clamp01(sectionSnapshot.pageRatio) * currentMaxY;
  }

  return Math.max(0, fallbackY);
}

function resolveLandingTarget(scrollEl, savedY, sectionSnapshot, resolveSectionTarget) {
  const landingSections = getLandingSections(scrollEl, resolveSectionTarget);

  if (landingSections.length === 0) {
    return {
      y: 0,
      pinUntilStable: true,
    };
  }

  const restorableSections = landingSections.filter(
    (section) => section.anchorKey !== LANDING_HERO_ANCHOR
  );
  const compareY = getLandingCompareY(scrollEl, savedY, sectionSnapshot);

  let targetY = 0;
  restorableSections.forEach((section, index) => {
    const previousY = index === 0 ? 0 : restorableSections[index - 1].y;
    const thresholdY = previousY + (section.y - previousY) / 2;

    if (compareY >= thresholdY - 1) {
      targetY = section.y;
    }
  });

  return {
    y: targetY,
    pinUntilStable: true,
  };
}

export function isHardLoadEntry(isInitialAppLoad) {
  if (!isInitialAppLoad) return false;
  const type = getNavigationEntryType();
  return type === "navigate" || type === "reload";
}

export function getLandingReloadTarget({
  pathname,
  isInitialAppLoad,
  scrollEl,
  savedY,
  sectionSnapshot,
  resolveSectionTarget,
}) {
  if (pathname !== "/") return null;
  if (!isInitialAppLoad) return null;
  if (getNavigationEntryType() !== "reload") return null;
  return resolveLandingTarget(scrollEl, savedY, sectionSnapshot, resolveSectionTarget);
}

export function getLandingRestoreTarget({
  pathname,
  scrollEl,
  savedY,
  sectionSnapshot,
  resolveSectionTarget,
}) {
  if (pathname !== "/") return null;
  return resolveLandingTarget(scrollEl, savedY, sectionSnapshot, resolveSectionTarget);
}

export function getDetailReloadTarget({
  pathname,
  isInitialAppLoad,
  scrollEl,
  sectionSnapshot,
  resolveSectionTarget,
}) {
  if (!pathname.startsWith("/detail/")) return null;
  if (!isInitialAppLoad) return null;
  if (getNavigationEntryType() !== "reload") return null;

  const targetAnchor = sectionSnapshot?.anchorKey;
  const isRestorableAnchor =
    targetAnchor === "detail-trailer" || targetAnchor === "detail-row";

  if (!isRestorableAnchor || (sectionSnapshot.visibleRatio || 0) < 0.5) {
    return {
      y: 0,
      pinUntilStable: true,
    };
  }

  const rowTarget = resolveSectionTarget(scrollEl, {
    ...sectionSnapshot,
    offsetRatio: 0,
  });

  if (!rowTarget) {
    if (targetAnchor === "detail-trailer" || targetAnchor === "detail-row") {
      return {
        y: 0,
        pinUntilStable: true,
        waitForAnchor: true,
      };
    }

    return {
      y: 0,
      pinUntilStable: true,
    };
  }

  const targetEl = document.querySelector(
    `[data-restore-anchor="${sectionSnapshot.anchorKey}"]`
  );

  return {
    y: Math.max(0, rowTarget.top - getSectionAlignOffset(targetEl)),
    pinUntilStable: true,
  };
}
