import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

const locales = [
  { lang: "en", dir: "ltr", home: "/" },
  { lang: "ar", dir: "rtl", home: "/ar/" },
  { lang: "he", dir: "rtl", home: "/he/" },
  { lang: "de", dir: "ltr", home: "/de/" },
];
const projectSlugs = ["pathy", "travelscan-ai", "taskflow"];

for (const locale of locales) {
  test(`${locale.lang}: case studies remain accessible on phone and desktop`, async ({
    page,
  }) => {
    for (const slug of projectSlugs) {
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${locale.home}projects/${slug}/`);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
        await expect(page.locator("html")).toHaveAttribute("dir", locale.dir);
        await expect(page.locator("h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        for (const image of await page.locator("img").all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((element) =>
            (element as HTMLImageElement).decode(),
          );
        }
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        const scan = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(scan.violations).toEqual([]);
        await mkdir("artifacts/screenshots", { recursive: true });
        await page.screenshot({
          path: `artifacts/screenshots/case-${slug}-${locale.lang}-${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
    }
  });
}

for (const locale of locales) {
  for (const width of [360, 390, 768, 1440]) {
    test(`${locale.lang} ${width}px: readable, responsive page and real imagery`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.goto(locale.home);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
      await expect(page.locator("html")).toHaveAttribute("dir", locale.dir);
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.locator("h1").count()).toBe(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      for (const image of await page.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(
            () =>
              image.evaluate((element) => {
                const loadedImage = element as HTMLImageElement;
                return loadedImage.complete && loadedImage.naturalWidth > 0;
              }),
            {
              message: `Image should load: ${await image.getAttribute("src")}`,
            },
          )
          .toBe(true);
      }
      expect(errors).toEqual([]);
      await page.evaluate(() => scrollTo(0, 0));
      await mkdir("artifacts/screenshots", { recursive: true });
      await page.screenshot({
        path: `artifacts/screenshots/home-${locale.lang}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
    });
  }

  test(`${locale.lang}: visible content meets accessibility checks`, async ({
    page,
  }) => {
    await page.goto(locale.home);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test(`${locale.lang}: real project links resolve`, async ({
    page,
    request,
  }) => {
    await page.goto(locale.home);
    const links = await page
      .locator('a[href*="/projects/"]')
      .evaluateAll((anchors) => [
        ...new Set(
          anchors.map((anchor) => (anchor as HTMLAnchorElement).pathname),
        ),
      ]);
    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const href of links) {
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
      await page.goto(href);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
  });

  for (const slug of [null, ...projectSlugs]) {
    const suffix = slug ? `projects/${slug}/` : "";
    test(`${locale.lang}: ${slug || "home"} switches to every language without changing the page`, async ({
      page,
    }) => {
      for (const target of locales) {
        await page.goto(`${locale.home}${suffix}`);
        await page.getByTestId("language-toggle").click();
        await expect(
          page.locator(`a[hreflang="${locale.lang}"][aria-current="page"]`),
        ).toBeVisible();
        const languageLink = page
          .locator(`a[hreflang="${target.lang}"]`)
          .first();
        await expect(languageLink).toBeVisible();
        await expect(languageLink).toHaveAttribute(
          "href",
          `${target.home}${suffix}`,
        );
        await languageLink.click();
        await expect
          .poll(() => new URL(page.url()).pathname)
          .toBe(`${target.home}${suffix}`);
        await expect(page.locator("html")).toHaveAttribute("lang", target.lang);
        await expect(page.locator("html")).toHaveAttribute("dir", target.dir);
        await expect(page.locator("h1")).toBeVisible();
      }
    });
  }

  test(`${locale.lang}: language choices work with a phone keyboard and remain accessible`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(locale.home);
    const toggle = page.getByTestId("language-toggle");
    await toggle.focus();
    await page.keyboard.press("Enter");
    for (const target of locales) {
      await expect(
        page.locator(`a[hreflang="${target.lang}"]`).first(),
      ).toBeVisible();
    }
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });

  test(`${locale.lang}: mobile menu supports keyboard and closes on navigation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(locale.home);
    const toggle = page.getByTestId("menu-toggle");
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const nav = page.locator("header nav");
    await nav.locator('a[href$="#work"]').click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#work")).toBeInViewport();
  });
}

test("English stays the default for Arabic, Hebrew and German browser preferences", async ({
  browser,
}) => {
  for (const language of ["ar", "he", "de"]) {
    const context = await browser.newContext({ locale: language });
    try {
      const page = await context.newPage();
      await page.goto("http://127.0.0.1:3000/");
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      expect(new URL(page.url()).pathname).toBe("/");
    } finally {
      await context.close();
    }
  }
});

test("contact email copies the real address with honest feedback", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const copy = page.getByTestId("copy-email");
  await copy.click();
  await expect(page.getByRole("status")).toContainText(/copied/i);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "samiaburaed42@gmail.com",
  );
});

test("keyboard navigation has visible focus and an operable skip link", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveAttribute("href", "#main");
  await expect(focused).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("reduced motion preference removes substantial animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  const longAnimations = await page.locator("body *").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const style = getComputedStyle(element);
        return (
          style.animationName !== "none" &&
          style.animationDuration
            .split(",")
            .some((duration) => parseFloat(duration) > 0.01)
        );
      })
      .map((element) => element.className),
  );
  expect(longAnimations).toEqual([]);
  await expect(page.locator("h1")).toBeVisible();
});

for (const locale of locales) {
  test(`${locale.lang}: metadata and internal links remain valid`, async ({
    page,
    request,
  }) => {
    for (const route of [
      locale.home,
      ...projectSlugs.map((slug) => `${locale.home}projects/${slug}/`),
    ]) {
      await page.goto(route);
      expect((await page.title()).length).toBeGreaterThan(15);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /\S.{40}/,
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        /\S/,
      );
      const internalLinks = await page
        .locator("a[href]")
        .evaluateAll((anchors) => [
          ...new Set(
            anchors
              .map((anchor) => (anchor as HTMLAnchorElement).href)
              .filter((href) => href.startsWith(location.origin)),
          ),
        ]);
      for (const href of internalLinks) {
        const url = new URL(href);
        const response = await request.get(url.pathname);
        expect(response.status(), href).toBe(200);
      }
      expect(await page.locator('a[href=""], a[href="#"]').count()).toBe(0);
    }
  });
}

test("unknown pages return an actual 404 response", async ({ request }) => {
  expect((await request.get("/this-page-does-not-exist/")).status()).toBe(404);
});
