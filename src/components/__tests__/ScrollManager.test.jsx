import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import ScrollManager from "../ScrollManager";
import { useLocation, useNavigationType } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
  useNavigationType: jest.fn(),
}));

const mockedUseLocation = useLocation;
const mockedUseNavigationType = useNavigationType;

const SCROLL_MAP_KEY = "scroll:positions:v7";
const SECTION_MAP_KEY = "scroll:sections:v1";

function flushRafAndTimers(loop = 30) {
  for (let i = 0; i < loop; i += 1) {
    act(() => {
      jest.runOnlyPendingTimers();
    });
  }
}

function setLocation({
  pathname = "/main",
  search = "",
  key = "test-key",
  state = null,
} = {}) {
  mockedUseLocation.mockReturnValue({
    pathname,
    search,
    key,
    state,
  });
}

function setNavigationType(type = "PUSH") {
  mockedUseNavigationType.mockReturnValue(type);
}

function setNavigationEntryType(type = "navigate") {
  Object.defineProperty(window, "performance", {
    configurable: true,
    value: {
      getEntriesByType: jest.fn(() => [{ type }]),
    },
  });
}

function writeScrollMap(routeKey, y) {
  sessionStorage.setItem(
    SCROLL_MAP_KEY,
    JSON.stringify({
      [routeKey]: y,
    })
  );
}

function writeSectionMap(routeKey, snapshot) {
  sessionStorage.setItem(
    SECTION_MAP_KEY,
    JSON.stringify({
      [routeKey]: snapshot,
    })
  );
}

function createLayout({
  clientHeight = 600,
  initialScrollHeight = 2400,
  includeReadyMain = true,
} = {}) {
  let scrollHeightValue = initialScrollHeight;

  const layout = document.createElement("div");
  layout.className = "layout";
  layout.style.overflowY = "auto";
  layout.style.height = `${clientHeight}px`;

  let internalScrollTop = 0;

  Object.defineProperty(layout, "scrollTop", {
    configurable: true,
    get: () => internalScrollTop,
    set: (value) => {
      internalScrollTop = Number(value) || 0;
    },
  });

  Object.defineProperty(layout, "clientHeight", {
    configurable: true,
    get: () => clientHeight,
  });

  Object.defineProperty(layout, "scrollHeight", {
    configurable: true,
    get: () => scrollHeightValue,
  });

  document.body.appendChild(layout);

  if (includeReadyMain) {
    const main = document.createElement("main");
    main.setAttribute("data-rows-loaded", "1");
    document.body.appendChild(main);
  }

  return {
    layout,
    setScrollHeight(next) {
      scrollHeightValue = next;
    },
    get scrollTop() {
      return internalScrollTop;
    },
  };
}

function appendRestoreAnchor(parent, { anchorKey, top, height, id, scrollMarginTop }) {
  const tagName = anchorKey === "app-footer" ? "footer" : "section";
  const el = document.createElement(tagName);

  el.setAttribute("data-restore-anchor", anchorKey);
  if (id) {
    el.id = id;
  }
  if (scrollMarginTop != null) {
    el.style.scrollMarginTop = `${scrollMarginTop}px`;
  }

  Object.defineProperty(el, "offsetTop", {
    configurable: true,
    get: () => top,
  });

  Object.defineProperty(el, "offsetParent", {
    configurable: true,
    get: () => parent,
  });

  el.getBoundingClientRect = jest.fn(() => ({
    top: top - parent.scrollTop,
    bottom: top - parent.scrollTop + height,
    height,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top - parent.scrollTop,
    toJSON: () => ({}),
  }));

  parent.appendChild(el);
  return el;
}

describe("ScrollManager", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    sessionStorage.clear();
    cleanup();

    mockedUseLocation.mockReset();
    mockedUseNavigationType.mockReset();

    setLocation();
    setNavigationType("PUSH");
    setNavigationEntryType("navigate");

    global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    global.cancelAnimationFrame = (id) => clearTimeout(id);

    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: jest.fn(),
    });

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
    document.body.innerHTML = "";
    document.documentElement.style.removeProperty("--nav-h");
    sessionStorage.clear();
  });

  test("reload on /main resets scroll to top instead of restoring saved scroll", () => {
    const { layout } = createLayout({
      initialScrollHeight: 3200,
    });

    setLocation({
      pathname: "/main",
      key: "reload-main",
    });
    setNavigationEntryType("reload");
    writeScrollMap("/main", 980);

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(0);
  });

  test("explicit restoreScrollY from detail restores /main to that exact y", () => {
    const { layout } = createLayout({
      initialScrollHeight: 3000,
    });

    setLocation({
      pathname: "/main",
      key: "back-from-detail",
      state: {
        restoreScroll: true,
        restoreScrollY: 1234,
      },
    });
    setNavigationType("POP");

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(1234);
  });

  test("plain POP navigation restores saved scroll from session storage", () => {
    const { layout } = createLayout({
      initialScrollHeight: 2600,
    });

    setLocation({
      pathname: "/search",
      key: "pop-nav",
    });
    setNavigationType("POP");
    writeScrollMap("/search", 777);

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(777);
  });

  test("non-POP navigation without explicit restore resets to top", () => {
    const { layout } = createLayout({
      initialScrollHeight: 2600,
    });

    setLocation({
      pathname: "/search",
      key: "push-nav",
    });
    setNavigationType("PUSH");
    writeScrollMap("/search", 777);

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(0);
  });

  test("reload on / keeps footer just below nav when footer was mostly visible", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 2800,
    });

    appendRestoreAnchor(layout, {
      anchorKey: "app-footer",
      top: 1960,
      height: 420,
    });

    document.documentElement.style.setProperty("--nav-h", "72px");

    setLocation({
      pathname: "/",
      key: "default",
    });
    setNavigationType("POP");
    setNavigationEntryType("reload");
    writeScrollMap("/", 2120);
    writeSectionMap("/", {
      anchorKey: "app-footer",
      index: 0,
      offsetRatio: 0.55,
      visibleRatio: 0.62,
      pageRatio: 0.964,
      y: 2120,
    });

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(1888);
  });

  test("reload on / keeps hero at top when hero is still the active section", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 2400,
    });

    appendRestoreAnchor(layout, {
      anchorKey: "landing-hero",
      top: 0,
      height: 860,
    });
    appendRestoreAnchor(layout, {
      anchorKey: "landing-top10",
      top: 900,
      height: 640,
    });

    document.documentElement.style.setProperty("--nav-h", "72px");

    setLocation({
      pathname: "/",
      key: "default",
    });
    setNavigationType("PUSH");
    setNavigationEntryType("reload");
    writeSectionMap("/", {
      anchorKey: "landing-hero",
      index: 0,
      offsetRatio: 0.22,
      visibleRatio: 0.66,
      pageRatio: 0.1,
      y: 180,
    });

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(0);
  });

  test("reload on / aligns top10 just below nav when top10 was the active section", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 2600,
    });

    appendRestoreAnchor(layout, {
      anchorKey: "landing-hero",
      top: 0,
      height: 820,
    });
    appendRestoreAnchor(layout, {
      anchorKey: "landing-top10",
      top: 880,
      height: 640,
      id: "home-content",
      scrollMarginTop: 90,
    });

    document.documentElement.style.setProperty("--nav-h", "72px");

    setLocation({
      pathname: "/",
      key: "default",
    });
    setNavigationType("PUSH");
    setNavigationEntryType("reload");
    writeSectionMap("/", {
      anchorKey: "landing-top10",
      index: 1,
      offsetRatio: 0.31,
      visibleRatio: 0.58,
      pageRatio: 0.49,
      y: 980,
    });

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(790);
  });

  test("POP restore on / stays at top until top10 threshold passes halfway", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 2600,
    });

    appendRestoreAnchor(layout, {
      anchorKey: "landing-hero",
      top: 0,
      height: 820,
    });
    appendRestoreAnchor(layout, {
      anchorKey: "landing-top10",
      top: 880,
      height: 640,
      id: "home-content",
      scrollMarginTop: 90,
    });

    document.documentElement.style.setProperty("--nav-h", "72px");

    setLocation({
      pathname: "/",
      key: "landing-pop",
    });
    setNavigationType("POP");
    writeScrollMap("/", 320);
    writeSectionMap("/", {
      anchorKey: "landing-hero",
      index: 0,
      offsetRatio: 0.39,
      visibleRatio: 0.44,
      pageRatio: 0.16,
      y: 320,
    });

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(0);
  });

  test("POP navigation on /detail stays at top instead of restoring prior y", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 3200,
    });

    setLocation({
      pathname: "/detail/movie/1",
      key: "detail-pop",
    });
    setNavigationType("POP");
    writeScrollMap("/detail/movie/1", 1180);

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(0);
  });

  test("reload on /detail aligns row top below nav when row was at least half visible", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 3200,
    });

    appendRestoreAnchor(layout, {
      anchorKey: "detail-hero",
      top: 0,
      height: 1120,
    });
    appendRestoreAnchor(layout, {
      anchorKey: "detail-row",
      top: 1540,
      height: 760,
    });

    document.documentElement.style.setProperty("--nav-h", "72px");

    setLocation({
      pathname: "/detail/movie/1",
      key: "default",
    });
    setNavigationType("PUSH");
    setNavigationEntryType("reload");
    writeScrollMap("/detail/movie/1", 1760);
    writeSectionMap("/detail/movie/1", {
      anchorKey: "detail-row",
      index: 1,
      offsetRatio: 0.18,
      visibleRatio: 0.58,
      y: 1760,
    });

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(1468);
  });

  test("reload on /detail stays at top when row was below the half-visible threshold", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 3200,
    });

    appendRestoreAnchor(layout, {
      anchorKey: "detail-hero",
      top: 0,
      height: 1120,
    });
    appendRestoreAnchor(layout, {
      anchorKey: "detail-row",
      top: 1540,
      height: 760,
    });

    document.documentElement.style.setProperty("--nav-h", "72px");

    setLocation({
      pathname: "/detail/movie/1",
      key: "default",
    });
    setNavigationType("PUSH");
    setNavigationEntryType("reload");
    writeScrollMap("/detail/movie/1", 1500);
    writeSectionMap("/detail/movie/1", {
      anchorKey: "detail-row",
      index: 1,
      offsetRatio: 0.04,
      visibleRatio: 0.49,
      y: 1500,
    });

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(0);
  });

  test("reload on /detail aligns trailer top below nav when trailer was at least half visible", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 3600,
    });

    appendRestoreAnchor(layout, {
      anchorKey: "detail-hero",
      top: 0,
      height: 1120,
    });
    appendRestoreAnchor(layout, {
      anchorKey: "detail-trailer",
      top: 1260,
      height: 720,
    });
    appendRestoreAnchor(layout, {
      anchorKey: "detail-row",
      top: 2140,
      height: 760,
    });

    document.documentElement.style.setProperty("--nav-h", "72px");

    setLocation({
      pathname: "/detail/movie/2",
      key: "default",
    });
    setNavigationType("PUSH");
    setNavigationEntryType("reload");
    writeScrollMap("/detail/movie/2", 1480);
    writeSectionMap("/detail/movie/2", {
      anchorKey: "detail-trailer",
      index: 1,
      offsetRatio: 0.22,
      visibleRatio: 0.61,
      y: 1480,
    });

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(1188);
  });

  test("reload on /detail still restores trailer target even when history key is not default", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 3600,
    });

    appendRestoreAnchor(layout, {
      anchorKey: "detail-hero",
      top: 0,
      height: 1120,
    });
    appendRestoreAnchor(layout, {
      anchorKey: "detail-trailer",
      top: 1260,
      height: 720,
    });

    document.documentElement.style.setProperty("--nav-h", "72px");

    setLocation({
      pathname: "/detail/movie/3",
      key: "retained-history-key",
    });
    setNavigationType("PUSH");
    setNavigationEntryType("reload");
    writeScrollMap("/detail/movie/3", 1480);
    writeSectionMap("/detail/movie/3", {
      anchorKey: "detail-trailer",
      index: 1,
      offsetRatio: 0.22,
      visibleRatio: 0.61,
      y: 1480,
    });

    render(<ScrollManager />);
    flushRafAndTimers();

    expect(layout.scrollTop).toBe(1188);
  });

  test("reload on /detail waits for trailer anchor before completing restore", () => {
    const { layout } = createLayout({
      includeReadyMain: false,
      initialScrollHeight: 3600,
    });

    document.documentElement.style.setProperty("--nav-h", "72px");

    setLocation({
      pathname: "/detail/movie/4",
      key: "retained-history-key",
    });
    setNavigationType("PUSH");
    setNavigationEntryType("reload");
    writeScrollMap("/detail/movie/4", 1480);
    writeSectionMap("/detail/movie/4", {
      anchorKey: "detail-trailer",
      index: 1,
      offsetRatio: 0.22,
      visibleRatio: 0.61,
      y: 1480,
    });

    render(<ScrollManager />);
    act(() => {
      jest.advanceTimersByTime(20);
    });

    appendRestoreAnchor(layout, {
      anchorKey: "detail-hero",
      top: 0,
      height: 1120,
    });
    appendRestoreAnchor(layout, {
      anchorKey: "detail-trailer",
      top: 1260,
      height: 720,
    });

    flushRafAndTimers();

    expect(layout.scrollTop).toBe(1188);
  });
});
