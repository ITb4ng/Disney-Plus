const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000";
const SCROLL_TOLERANCE = 40;
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
    videos: { results: [] },
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

    // Row/Banner 등 목록성 API는 동일한 더미 목록으로 응답
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: Array.from({ length: 20 }, (_, i) => makeListItem(1000 + i)),
      }),
    });
  });
}

async function getScrollY(page) {
  return page.evaluate(() => Math.round(window.scrollY || 0));
}

async function getRouteStateScrollY(page) {
  return page.evaluate(() => {
    const y = window.history.state?.usr?.scrollY;
    return typeof y === "number" ? Math.round(y) : null;
  });
}

async function setScrollY(page, y) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(180);
}

async function waitForRouteSettle(page, waitMs = 700) {
  await page.waitForTimeout(waitMs);
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

async function expectScrollNear(page, expected, tolerance = SCROLL_TOLERANCE) {
  await expect
    .poll(async () => {
      const actual = await getScrollY(page);
      return Math.abs(actual - expected);
    }, { timeout: 5000 })
    .toBeLessThanOrEqual(tolerance);
}

async function ensureMainAccess(page) {
  await page.goto(`${BASE_URL}/main`, { waitUntil: "domcontentloaded" });
  await waitForRouteSettle(page);
  await expect(page).toHaveURL(/\/main/);
  await waitForMainCards(page);
}

async function waitForMainCards(page) {
  const cards = page.locator(MAIN_ROW_CARDS);

  await expect
    .poll(async () => cards.count(), {
      timeout: 15000,
      message: "메인 Row 카드 렌더 대기 실패",
    })
    .toBeGreaterThan(0);

  await expect(cards.first()).toBeVisible();
}

async function openFirstMainCardToDetail(page, preferredRowId = null) {
  await waitForMainCards(page);

  const rowCandidates = preferredRowId
    ? [preferredRowId, "TR", "TN", "AM", "CM"]
    : ["TR", "TN", "AM", "CM"];
  const uniqueRows = [...new Set(rowCandidates)];

  const sourceScrollY = await getScrollY(page);

  let clicked = false;
  for (const rowId of uniqueRows) {
    const visibleCard = page
      .locator(`#${rowId} [data-testid="row-card"]:visible`)
      .first();
    if ((await visibleCard.count()) > 0) {
      await visibleCard.click({ force: true });
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    throw new Error("클릭 가능한 visible row-card를 찾지 못했습니다.");
  }

  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();

  const goDetailBtn = modal.getByTestId("modal-go-detail");
  await expect(goDetailBtn).toBeVisible();
  await goDetailBtn.click();

  await page.waitForURL(/\/detail\/(movie|tv)\/\d+/, { timeout: 15000 });
  await waitForRouteSettle(page);
  return { sourceScrollY };
}

test.describe("scroll restoration policy", () => {
  test.beforeEach(async ({ page }) => {
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
      localStorage.setItem("isGuest", "1");
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await installTmdbMock(page);
  });

  test("main -> detail 진입은 0, 뒤로가면 main 스크롤 복원, 재진입 detail은 다시 0", async ({
    page,
  }) => {
    await ensureMainAccess(page);

    await setScrollY(page, 200);
    await expectScrollNear(page, 200);

    await openFirstMainCardToDetail(page);
    await expectScrollNear(page, 0);

    const expectedBackY = await getRouteStateScrollY(page);

    await page.locator(".detail__backWrap .btn--primary").click();
    await page.waitForURL(/\/main/, { timeout: 10000 });
    await waitForRouteSettle(page);
    await expectScrollNear(page, expectedBackY ?? 200);

    await openFirstMainCardToDetail(page);
    await expectScrollNear(page, 0);
  });

  test("detail에서 무스크롤 연속 새로고침 시 현재 스크롤 위치 유지", async ({ page }) => {
    await ensureMainAccess(page);
    await openFirstMainCardToDetail(page);

    await setScrollY(page, 220);
    await expectScrollNear(page, 220);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForRouteSettle(page);
    await expectScrollNear(page, 220);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForRouteSettle(page);
    await expectScrollNear(page, 220);
  });

  test("복원 후 다시 스크롤하면 다음 새로고침에서 해당 값 복원", async ({ page }) => {
    await ensureMainAccess(page);
    await openFirstMainCardToDetail(page);

    await setScrollY(page, 180);
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForRouteSettle(page);
    await expectScrollNear(page, 180);

    await setScrollY(page, 260);
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForRouteSettle(page);
    await expectScrollNear(page, 260);
  });

  test("/(login 랜딩)에서 재스크롤 후 재새로고침까지 현재 스크롤 유지", async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await waitForRouteSettle(page);

    await setScrollY(page, 260);
    await expectScrollNear(page, 260);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForRouteSettle(page);
    await expectScrollNear(page, 260);

    await setScrollY(page, 420);
    await expectScrollNear(page, 420);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForRouteSettle(page);
    await expectScrollNear(page, 420);
  });

  test("/main 검색 체험하기 -> search 닫기 시 기존 스크롤 복원", async ({ page }) => {
    await ensureMainAccess(page);

    await setScrollY(page, 320);
    await expectScrollNear(page, 320);

    const beforeSearchClick = await getScrollY(page);
    await page.getByTestId("demo-action-search").click();
    await page.waitForURL(/\/search/, { timeout: 10000 });
    await waitForRouteSettle(page);

    await page.getByTestId("search-close-btn").click();
    await page.waitForURL(/\/main/, { timeout: 10000 });
    await waitForRouteSettle(page);
    await expectScrollNear(page, beforeSearchClick);
  });

  test("/main 피드백 남기기 -> 피드백 뒤로가기 시 기존 스크롤 복원", async ({ page }) => {
    await ensureMainAccess(page);

    await setScrollY(page, 360);
    await expectScrollNear(page, 360);

    const beforeFeedbackClick = await getScrollY(page);
    await page.getByTestId("feedback-open-btn").click();
    await page.waitForURL(/\/feedback/, { timeout: 10000 });
    await waitForRouteSettle(page);

    const expectedBackY = await getRouteStateScrollY(page);

    await page.getByTestId("feedback-back-btn").click();
    await page.waitForURL(/\/main/, { timeout: 10000 });
    await waitForRouteSettle(page);
    await expectScrollNear(page, expectedBackY ?? beforeFeedbackClick);
  });

  test("/main 스와이프 후 detail 왕복 시 스와이프 인덱스 복원", async ({ page }) => {
    await ensureMainAccess(page);

    const rightArrow = page.locator("#TR .arrowZone.right").first();
    await expect(rightArrow).toBeVisible();
    for (let i = 0; i < 4; i += 1) {
      await rightArrow.click();
      await waitForRouteSettle(page, 220);
    }
    await waitForRouteSettle(page, 500);

    const swipeIndexBefore = await getRowActiveIndex(page, "TR");
    expect(swipeIndexBefore).toBeGreaterThan(6);

    await page.locator(".banner__button--primary").first().click();
    await page.waitForURL(/\/detail\/(movie|tv)\/\d+/, { timeout: 10000 });
    await waitForRouteSettle(page);
    await expectScrollNear(page, 0);

    await page.locator(".detail__backWrap .btn--primary").click();
    await page.waitForURL(/\/main/, { timeout: 10000 });
    await waitForRouteSettle(page);

    const swipeIndexAfter = await getRowActiveIndex(page, "TR");
    expect(swipeIndexAfter).toBe(swipeIndexBefore);
  });

  test("/main 스와이프 후 새로고침 시 스와이프 인덱스 유지", async ({ page }) => {
    await ensureMainAccess(page);

    const rightArrow = page.locator("#TR .arrowZone.right").first();
    await expect(rightArrow).toBeVisible();
    for (let i = 0; i < 4; i += 1) {
      await rightArrow.click();
      await waitForRouteSettle(page, 220);
    }
    await waitForRouteSettle(page, 500);

    const swipeIndexBeforeReload = await getRowActiveIndex(page, "TR");
    expect(swipeIndexBeforeReload).toBeGreaterThan(6);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForRouteSettle(page);

    const swipeIndexAfterReload = await getRowActiveIndex(page, "TR");
    expect(swipeIndexAfterReload).toBe(swipeIndexBeforeReload);
  });
});
