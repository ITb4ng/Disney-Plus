import { test, expect } from "@playwright/test";

async function enableAuthBypass(page) {
  await page.addInitScript(() => {
    window.__PW_E2E_AUTH_BYPASS__ = true;

    const fallbackUser = {
      uid: "e2e-user",
      displayName: "E2E User",
      email: "e2e@local.test",
      photoURL: null,
    };

    localStorage.setItem("userData", JSON.stringify(fallbackUser));
    localStorage.removeItem("isGuest");
    sessionStorage.removeItem("demo_banner");
  });
}

async function gotoMain(page) {
  await enableAuthBypass(page);
  await page.goto("/main", { waitUntil: "domcontentloaded" });
  await waitForMainReady(page);
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
  await page.locator("footer").waitFor({ state: "visible" });
  await expect(page.locator(".layout-restore-overlay")).toBeHidden();
}

async function getScrollInfo(page) {
  return page.evaluate(() => {
    const layout = document.querySelector(".layout");
    return {
      y: layout?.scrollTop || 0,
      clientHeight: layout?.clientHeight || 0,
      scrollHeight: layout?.scrollHeight || 0,
    };
  });
}

async function getScrollY(page) {
  const info = await getScrollInfo(page);
  return info.y;
}

async function getRouteStateScrollY(page) {
  return page.evaluate(() => {
    const y = window.history.state?.usr?.scrollY;
    return typeof y === "number" ? Math.round(y) : null;
  });
}

async function scrollToY(page, y) {
  await page.evaluate((nextY) => {
    const layout = document.querySelector(".layout");
    layout?.scrollTo({ top: nextY, behavior: "auto" });
  }, y);

  await expect
    .poll(async () => {
      const info = await getScrollInfo(page);
      return info.y;
    })
    .toBeGreaterThanOrEqual(Math.max(0, y - 120));
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
}

async function waitForDetailReady(page) {
  await page.waitForURL(/\/detail\//);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(300);
}

test.describe("/main reload overlay", () => {
  test("reload from top keeps /main at top", async ({ page }) => {
    await gotoMain(page);

    const before = await getScrollY(page);
    expect(before).toBeLessThanOrEqual(20);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(".layout-restore-overlay")).toBeVisible();
    await waitForMainReady(page);
    await expect(page.locator(".layout-restore-overlay")).toBeHidden();

    const after = await getScrollY(page);
    expect(after).toBeLessThanOrEqual(30);
  });

  test("reload after scrolling shows overlay and resets /main to top", async ({ page }) => {
    await gotoMain(page);
    await scrollToY(page, 900);

    const before = await getScrollY(page);
    expect(before).toBeGreaterThanOrEqual(800);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(".layout-restore-overlay")).toBeVisible();
    await waitForMainReady(page);
    await expect(page.locator(".layout-restore-overlay")).toBeHidden();

    const after = await getScrollY(page);
    expect(after).toBeLessThanOrEqual(30);
  });

  test("back from detail restores /main scroll position", async ({ page }) => {
    await gotoMain(page);
    await scrollToY(page, 1000);

    const before = await getScrollY(page);
    expect(before).toBeGreaterThanOrEqual(900);

    await openFirstVisibleCardToDetail(page);
    await waitForDetailReady(page);
    const expectedBackY = await getRouteStateScrollY(page);
    await page.locator(".detail__backWrap .btn--primary").click();
    await waitForMainReady(page);

    const after = await getScrollY(page);
    expect(after).toBeGreaterThanOrEqual((expectedBackY ?? before) - 140);
    expect(after).toBeLessThanOrEqual((expectedBackY ?? before) + 180);
  });
});
