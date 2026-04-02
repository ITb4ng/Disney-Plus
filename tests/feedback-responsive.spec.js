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

test.describe("feedback responsive", () => {
  test("mobile guest layout keeps key feedback UI readable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeedback(page, "/feedback?debug=guest", { guest: true });

    await expect(page.getByRole("heading", { name: "피드백" })).toBeVisible();
    await expect(page.getByText("체험 계정도 피드백 등록은 가능합니다.")).toBeVisible();
    await expect(page.getByText("접속 계정")).toBeVisible();
    await expect(page.getByRole("button", { name: "등록" })).toBeVisible();
    await expect(page.getByLabel("정렬 기준 선택")).toBeVisible();
    await expect(page.getByText("정렬", { exact: true })).toBeHidden();
    await expect(page.getByTestId("feedback-back-btn")).toBeVisible();
    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.getByText("작성자")).toBeVisible();
    await expect(firstCard.getByText("작성일")).toBeVisible();
  });

  test("desktop keeps segmented sort UI and hides mobile select", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFeedback(page, "/feedback?debug=guest", { guest: true });

    await expect(page.getByRole("button", { name: "최신순" })).toBeVisible();
    await expect(page.getByRole("button", { name: "오래된 순" })).toBeVisible();
    await expect(page.getByLabel("정렬 기준 선택")).toBeHidden();
    await expect(page.getByRole("button", { name: "새로고침" })).toBeVisible();
  });

  test("tablet keeps summary chips and segmented toolbar readable", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoFeedback(page, "/feedback?debug=guest", { guest: true });

    const accountChip = page
      .locator("span")
      .filter({ has: page.getByText("접속 계정", { exact: true }) })
      .first();

    await expect(page.getByRole("heading", { name: "피드백" })).toBeVisible();
    await expect(page.getByText("2건")).toBeVisible();
    await expect(accountChip).toContainText("체험 계정");
    await expect(page.getByRole("button", { name: "최신순" })).toBeVisible();
    await expect(page.getByRole("button", { name: "오래된 순" })).toBeVisible();
    await expect(page.getByRole("button", { name: "등록" })).toBeVisible();
  });

  test("mobile create success notice stays centered and readable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeedback(page, "/feedback?debug=create-toast");

    await expect(page.getByText("등록이 완료되었습니다.")).toBeVisible();
    await expect(page.getByRole("button", { name: "확인" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "취소" })).toHaveCount(0);
  });

  test("mobile delete confirm notice shows both actions", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeedback(page, "/feedback?debug=delete-toast");

    await expect(page.getByText("정말 삭제하시겠습니까?")).toBeVisible();
    await expect(page.getByRole("button", { name: "확인" })).toBeVisible();
    await expect(page.getByRole("button", { name: "취소" })).toBeVisible();
  });

  test("mobile create form keeps 16px inputs to avoid zoom", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeedback(page, "/feedback/new");

    const titleInput = page.locator("#fb-title");
    const messageInput = page.locator("#fb-message");

    await expect(titleInput).toBeVisible();
    await expect(messageInput).toBeVisible();

    const fontSizes = await page.evaluate(() => {
      const title = window.getComputedStyle(document.querySelector("#fb-title")).fontSize;
      const message = window.getComputedStyle(document.querySelector("#fb-message")).fontSize;
      return { title, message };
    });

    expect(fontSizes.title).toBe("16px");
    expect(fontSizes.message).toBe("16px");
  });

  test("mobile create form shows required notice on empty submit", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeedback(page, "/feedback/new");

    await page.getByRole("button", { name: "등록" }).click();
    await expect(page.getByText("제목과 내용을 입력해 주세요.")).toBeVisible();
  });

  test("mobile create form shows length validation notice", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeedback(page, "/feedback/new");

    await page.locator("#fb-title").fill("a");
    await page.locator("#fb-message").fill("abcd");
    await page.getByRole("button", { name: "등록" }).click();

    await expect(page.getByText("제목은 2글자 이상 입력해 주세요.")).toBeVisible();
  });
});
