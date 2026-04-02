const { test, expect } = require("@playwright/test");

async function freezeTime(page) {
  await page.addInitScript(() => {
    const FIXED_NOW = new Date("2026-04-02T05:54:00+09:00").valueOf();
    const RealDate = Date;

    class MockDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          super(FIXED_NOW);
          return;
        }

        super(...args);
      }

      static now() {
        return FIXED_NOW;
      }
    }

    MockDate.parse = RealDate.parse;
    MockDate.UTC = RealDate.UTC;
    // eslint-disable-next-line no-global-assign
    Date = MockDate;
  });
}

async function enableAuthBypass(page, { guest = false } = {}) {
  await page.addInitScript(({ nextGuest }) => {
    window.__PW_E2E_AUTH_BYPASS__ = true;

    const fallbackUser = nextGuest
      ? {
          uid: "e2e-guest",
          displayName: "Demo Guest",
          email: "demo@disney.dev",
          photoURL: null,
        }
      : {
          uid: "e2e-user",
          displayName: "E2E User",
          email: "e2e@local.test",
          photoURL: null,
        };

    localStorage.setItem("userData", JSON.stringify(fallbackUser));
    localStorage.removeItem("isGuest");
    sessionStorage.removeItem("demo_banner");
  }, { nextGuest: guest });
}

async function gotoFeedback(page, url, { guest = false } = {}) {
  await freezeTime(page);
  await enableAuthBypass(page, { guest });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/feedback/);
}

test.describe("feedback visual snapshots", () => {
  test("mobile guest page snapshot", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeedback(page, "/feedback?debug=guest", { guest: true });

    await expect(page).toHaveScreenshot("feedback-mobile-guest.png", {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
    });
  });

  test("tablet guest page snapshot", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoFeedback(page, "/feedback?debug=guest", { guest: true });

    await expect(page).toHaveScreenshot("feedback-tablet-guest.png", {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
    });
  });

  test("mobile create notice snapshot", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeedback(page, "/feedback?debug=create-toast");

    await expect(page).toHaveScreenshot("feedback-mobile-create-toast.png", {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
    });
  });
});
