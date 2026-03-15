const { test, expect } = require("@playwright/test");

const MAIN_ROW_CARDS =
  '#TR [data-testid="row-card"], #TN [data-testid="row-card"], #AM [data-testid="row-card"], #CM [data-testid="row-card"]';

function makeListItem(id) {
  return {
    id,
    title: `테스트 콘텐츠 ${id}`,
    name: `테스트 콘텐츠 ${id}`,
    media_type: "movie",
    overview: "E2E 테스트용 개요",
    release_date: "2024-01-01",
    first_air_date: "2024-01-01",
    backdrop_path: `/mock-backdrop-${id}.jpg`,
    poster_path: `/mock-poster-${id}.jpg`,
    vote_average: 7.8,
  };
}

function makeDetail(id, type = "movie") {
  const hasTrailer = id % 2 === 1;

  return {
    id,
    title: `상세 테스트 콘텐츠 ${id}`,
    name: `상세 테스트 콘텐츠 ${id}`,
    media_type: type,
    overview: "상세 페이지 E2E 테스트용 데이터",
    release_date: "2024-01-01",
    first_air_date: "2024-01-01",
    backdrop_path: `/mock-backdrop-${id}.jpg`,
    poster_path: `/mock-poster-${id}.jpg`,
    vote_average: 8.1,
    genres: [{ id: 1, name: "Action" }],
    runtime: 120,
    episode_run_time: [45],
    videos: {
      results: hasTrailer
        ? [{ site: "YouTube", type: "Trailer", key: `mockTrailer${id}` }]
        : [],
    },
    credits: {
      cast: [{ id: 1001, name: "Tester Actor", character: "Lead" }],
      crew: [{ id: 2001, job: "Director", name: "Tester Director" }],
    },
    release_dates: {
      results: [{ iso_3166_1: "KR", release_dates: [{ certification: "12" }] }],
    },
    content_ratings: {
      results: [{ iso_3166_1: "KR", rating: "12" }],
    },
  };
}

async function enableAuthBypass(page) {
  await page.addInitScript(() => {
    window.__PW_E2E_AUTH_BYPASS__ = true;

    localStorage.setItem(
      "userData",
      JSON.stringify({
        uid: "e2e-user",
        displayName: "E2E User",
        email: "e2e@local.test",
        photoURL: null,
      })
    );

    localStorage.removeItem("isGuest");
    sessionStorage.removeItem("demo_banner");
  });
}

async function installTmdbMock(page) {
  await page.route("**/api/tmdb**", async (route) => {
    const reqUrl = new URL(route.request().url());
    const path = reqUrl.searchParams.get("path") || "";

    const detailMatch = path.match(/^(movie|tv)\/(\d+)$/);
    if (detailMatch) {
      const [, type, idRaw] = detailMatch;
      const id = Number(idRaw);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(makeDetail(id, type)),
      });
    }

    if (path.includes("recommendations")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: Array.from({ length: 12 }, (_, i) => makeListItem(3000 + i)),
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: Array.from({ length: 20 }, (_, i) => makeListItem(1000 + i)),
      }),
    });
  });
}

async function waitForOverlayHidden(page) {
  const overlay = page.locator(".layout-restore-overlay");
  if ((await overlay.count()) > 0) {
    await expect(overlay).toBeHidden({ timeout: 10000 });
  }
}

async function waitForMainReady(page) {
  await page.waitForURL(/\/main/);
  await page.locator(".layout").waitFor({ state: "visible" });
  await page.locator('main[data-rows-loaded="1"]').waitFor({ state: "visible" });

  await expect
    .poll(async () => page.getByTestId("row-card").count(), {
      timeout: 15000,
    })
    .toBeGreaterThan(0);

  await expect(page.getByTestId("row-card").first()).toBeVisible({
    timeout: 15000,
  });

  await waitForOverlayHidden(page);
}

async function waitForLandingReady(page) {
  await page.waitForURL(/\/$/);
  await page.locator(".layout").waitFor({ state: "visible" });
  await page.locator('[data-restore-anchor="landing-hero"]').waitFor({ state: "visible" });
  await page.locator('[data-restore-anchor="landing-top10"]').waitFor({ state: "visible" });
  await page.locator('[data-restore-anchor="app-footer"]').waitFor({ state: "visible" });
}

async function waitForDetailReady(page, anchorToWait = null) {
  await page.waitForURL(/\/detail\/(movie|tv)\/\d+/);
  await page.locator(".layout").waitFor({ state: "visible" });
  await page.locator(".detail").waitFor({ state: "visible" });
  await waitForOverlayHidden(page);

  if (anchorToWait) {
    await page.locator(`[data-restore-anchor="${anchorToWait}"]`).waitFor({
      state: "visible",
      timeout: 15000,
    });
  }
}

async function gotoMain(page) {
  await page.goto("/main", { waitUntil: "domcontentloaded" });
  await waitForMainReady(page);
}

async function gotoLanding(page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForLandingReady(page);
}

async function gotoDetail(page, path, anchorToWait = null) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await waitForDetailReady(page, anchorToWait);
}

async function getLayoutScrollInfo(page) {
  return page.evaluate(() => {
    const layout = document.querySelector(".layout");
    return {
      y: Math.round(layout?.scrollTop || 0),
      clientHeight: layout?.clientHeight || 0,
      scrollHeight: layout?.scrollHeight || 0,
    };
  });
}

async function getLayoutScrollY(page) {
  const info = await getLayoutScrollInfo(page);
  return info.y;
}

async function getRouteStateScrollY(page) {
  return page.evaluate(() => {
    const y = window.history.state?.usr?.scrollY;
    return typeof y === "number" ? Math.round(y) : null;
  });
}

async function scrollLayoutToY(page, y) {
  await page.evaluate((nextY) => {
    const layout = document.querySelector(".layout");
    layout?.scrollTo({ top: nextY, behavior: "auto" });
  }, y);

  await expect
    .poll(async () => getLayoutScrollY(page), {
      timeout: 8000,
    })
    .toBeGreaterThanOrEqual(Math.max(0, y - 120));
}

async function scrollToMostlyShowAnchor(page, selector) {
  const targetY = await page.evaluate((sel) => {
    const layout = document.querySelector(".layout");
    const el = document.querySelector(sel);
    if (!layout || !el) return 0;

    const layoutRect = layout.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const currentY = layout.scrollTop || 0;
    const top = currentY + (elRect.top - layoutRect.top);
    const centerY = top + elRect.height / 2 - layout.clientHeight / 2;
    return Math.max(0, Math.round(centerY));
  }, selector);

  await scrollLayoutToY(page, targetY);
  return targetY;
}

async function getAnchorViewportTop(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return Math.round(el.getBoundingClientRect().top);
  }, selector);
}

async function getExpectedAnchorTop(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const cssNav = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
    );
    const navHeight = Number.isFinite(cssNav) && cssNav > 0
      ? cssNav
      : Math.ceil(document.querySelector(".app-nav")?.getBoundingClientRect().height || 0);
    const scrollMarginTop = el
      ? Number.parseFloat(getComputedStyle(el).scrollMarginTop)
      : 0;
    return Math.round(
      Math.max(navHeight, Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0)
    );
  }, selector);
}

async function expectAnchorAligned(page, selector, tolerance = 36) {
  const expectedTop = await getExpectedAnchorTop(page, selector);

  await expect
    .poll(async () => {
      const actualTop = await getAnchorViewportTop(page, selector);
      if (actualTop == null) return Number.POSITIVE_INFINITY;
      return Math.abs(actualTop - expectedTop);
    }, { timeout: 10000 })
    .toBeLessThanOrEqual(tolerance);
}

async function clickFirstVisibleCard(page) {
  const cards = page.getByTestId("row-card");
  const count = await cards.count();

  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    if (await card.isVisible()) {
      await card.click();
      return;
    }
  }

  throw new Error("No visible row-card found");
}

async function openFirstVisibleCardToDetail(page) {
  await clickFirstVisibleCard(page);

  const modal = page.getByRole("dialog");
  if (await modal.isVisible().catch(() => false)) {
    const goDetailButton = page.getByTestId("modal-go-detail");
    await expect(goDetailButton).toBeVisible();
    await goDetailButton.click();
  }

  await waitForDetailReady(page);
}

async function getRowActiveIndex(page, rowId = "TR") {
  return page.evaluate((id) => {
    const root = document.getElementById(id);
    const swiperEl = root?.querySelector(".swiper");
    const swiper = swiperEl?.swiper;
    const idx = Number(swiper?.activeIndex ?? 0);
    return Number.isFinite(idx) ? idx : 0;
  }, rowId);
}

test.describe("supplemental scroll restoration policy", () => {
  test.beforeEach(async ({ page }) => {
    await enableAuthBypass(page);
    await installTmdbMock(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("/ landing hero 구간 새로고침은 top 유지", async ({ page }) => {
    await gotoLanding(page);
    await scrollLayoutToY(page, 220);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForLandingReady(page);

    const after = await getLayoutScrollY(page);
    expect(after).toBeLessThanOrEqual(40);
  });

  test("/ landing top10 구간 새로고침은 top10 래퍼를 nav 아래로 맞춘다", async ({ page }) => {
    await gotoLanding(page);
    await scrollToMostlyShowAnchor(page, '[data-restore-anchor="landing-top10"]');

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForLandingReady(page);
    await expectAnchorAligned(page, '[data-restore-anchor="landing-top10"]');
  });

  test("/ landing footer 구간 새로고침은 footer 래퍼를 nav 아래로 맞춘다", async ({ page }) => {
    await gotoLanding(page);
    await scrollToMostlyShowAnchor(page, '[data-restore-anchor="app-footer"]');

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForLandingReady(page);
    await expectAnchorAligned(page, '[data-restore-anchor="app-footer"]');
  });

  test("/detail trailer 구간 새로고침은 trailer 래퍼를 nav 아래로 맞춘다", async ({
    page,
  }) => {
    await gotoDetail(page, "/detail/movie/1001", "detail-trailer");
    await scrollToMostlyShowAnchor(page, '[data-restore-anchor="detail-trailer"]');

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForDetailReady(page, "detail-trailer");
    await expectAnchorAligned(page, '[data-restore-anchor="detail-trailer"]');
  });

  test("/detail row 구간 새로고침은 row 래퍼를 nav 아래로 맞춘다", async ({ page }) => {
    await gotoDetail(page, "/detail/movie/1002", "detail-row");
    await scrollToMostlyShowAnchor(page, '[data-restore-anchor="detail-row"]');

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForDetailReady(page, "detail-row");
    await expectAnchorAligned(page, '[data-restore-anchor="detail-row"]');
  });

  test("/detail 조건 미달 새로고침은 top 유지", async ({ page }) => {
    await gotoDetail(page, "/detail/movie/1001", "detail-trailer");
    await scrollLayoutToY(page, 180);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForDetailReady(page, "detail-trailer");

    const after = await getLayoutScrollY(page);
    expect(after).toBeLessThanOrEqual(40);
  });

  test("/main 검색 체험하기 -> search 닫기 시 기존 스크롤 복원", async ({ page }) => {
    await gotoMain(page);
    await scrollLayoutToY(page, 320);

    const beforeSearchClick = await getLayoutScrollY(page);
    await expect(page.locator(".nav-mobile-search")).toBeVisible();
    await page.locator(".nav-mobile-search").click();
    await page.waitForURL(/\/search/, { timeout: 10000 });

    await page.getByTestId("search-close-btn").click();
    await waitForMainReady(page);

    const after = await getLayoutScrollY(page);
    expect(after).toBeGreaterThanOrEqual(beforeSearchClick - 120);
    expect(after).toBeLessThanOrEqual(beforeSearchClick + 160);
  });

  test("/main 피드백 남기기 -> 피드백 뒤로가기 시 기존 스크롤 복원", async ({ page }) => {
    await gotoMain(page);
    await scrollLayoutToY(page, 360);

    const beforeFeedbackClick = await getLayoutScrollY(page);
    await page.getByTestId("feedback-open-btn").click();
    await page.waitForURL(/\/feedback/, { timeout: 10000 });

    const expectedBackY = await getRouteStateScrollY(page);
    await page.getByTestId("feedback-back-btn").click();
    await waitForMainReady(page);

    const after = await getLayoutScrollY(page);
    expect(after).toBeGreaterThanOrEqual((expectedBackY ?? beforeFeedbackClick) - 120);
    expect(after).toBeLessThanOrEqual((expectedBackY ?? beforeFeedbackClick) + 160);
  });

  test("/main 스와이프 후 detail 왕복 시 스와이프 인덱스 복원", async ({ page }) => {
    await gotoMain(page);

    const rightArrow = page.locator("#TR .arrowZone.right").first();
    await expect(rightArrow).toBeVisible();
    for (let i = 0; i < 4; i += 1) {
      await rightArrow.click();
      await page.waitForTimeout(220);
    }
    await page.waitForTimeout(500);

    const swipeIndexBefore = await getRowActiveIndex(page, "TR");
    expect(swipeIndexBefore).toBeGreaterThan(6);

    await page.locator(".banner__button--primary").first().click();
    await waitForDetailReady(page);
    await page.locator(".detail__backWrap .btn--primary").click();
    await waitForMainReady(page);

    const swipeIndexAfter = await getRowActiveIndex(page, "TR");
    expect(swipeIndexAfter).toBe(swipeIndexBefore);
  });

  test("/main 스와이프 후 새로고침 시 스와이프 인덱스 유지", async ({ page }) => {
    await gotoMain(page);

    const rightArrow = page.locator("#TR .arrowZone.right").first();
    await expect(rightArrow).toBeVisible();
    for (let i = 0; i < 4; i += 1) {
      await rightArrow.click();
      await page.waitForTimeout(220);
    }
    await page.waitForTimeout(500);

    const swipeIndexBeforeReload = await getRowActiveIndex(page, "TR");
    expect(swipeIndexBeforeReload).toBeGreaterThan(6);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForMainReady(page);

    const swipeIndexAfterReload = await getRowActiveIndex(page, "TR");
    expect(swipeIndexAfterReload).toBe(swipeIndexBeforeReload);
  });
});
