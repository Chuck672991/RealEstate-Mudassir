#!/usr/bin/env node
/**
 * Behavioural checks in a real browser (playwright-core + installed Chrome):
 * dialogs, form validation, carousels, tabs, filters, keyboard paths, reduced motion.
 *
 *   npm run build && npm start        (in another terminal)
 *   node scripts/verify/interactions.mjs http://localhost:3000
 *
 * Prints PASS/FAIL lines and exits non-zero if anything failed. It does NOT submit
 * real inquiries to an inbox: with no delivery configured the form reports that
 * honestly, which is what is asserted here.
 */
import { chromium } from "playwright-core";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });

async function open(opts = {}) {
  const context = await browser.newContext({
    viewport: opts.viewport ?? { width: 1440, height: 900 },
    reducedMotion: opts.reduced ? "reduce" : "no-preference",
    hasTouch: !!opts.touch,
    isMobile: !!opts.touch,
  });
  const page = await context.newPage();
  const problems = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text().slice(0, 200)}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message.slice(0, 200)}`));
  page.on("response", (r) => r.status() >= 400 && !r.url().includes("/nope") && problems.push(`http ${r.status()}: ${r.url()}`));
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ms-intro", "1");
    } catch {}
  });
  return { context, page, problems };
}

/* ── 1. Contact dialog + form ─────────────────────────────────────────────── */
{
  const { context, page, problems } = await open();
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(1500);

  // The "Let's talk" button lives inside the pinned closing scene; open the dialog by its trigger.
  await page.evaluate(() => document.querySelector("[data-open-contact]")?.scrollIntoView({ block: "center" }));
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("ms:open-contact", { detail: { topic: "Buying a home" } })));
  await page.waitForSelector("dialog.contact-dialog[open]", { timeout: 4000 }).catch(() => {});
  const dialogOpen = await page.evaluate(() => !!document.querySelector("dialog.contact-dialog")?.open);
  check("contact dialog opens", dialogOpen);

  const focusInside = await page.evaluate(() => !!document.activeElement?.closest("dialog.contact-dialog"));
  check("focus moves into the dialog", focusInside);
  check(
    "topic is preselected",
    (await page.evaluate(() => document.querySelector("dialog.contact-dialog select")?.value)) === "Buying a home",
  );

  // empty submit → error summary (alert) + invalid fields
  await page.click("dialog.contact-dialog button[type=submit]");
  await page.waitForSelector("dialog.contact-dialog [role=alert]", { timeout: 6000 }).catch(() => {});
  const summary = await page.evaluate(() => document.querySelector("dialog.contact-dialog [role=alert]")?.textContent ?? "");
  check("empty submit shows an error summary", /fix the highlighted fields/i.test(summary), summary.slice(0, 80));
  const invalid = await page.evaluate(
    () => document.querySelectorAll("dialog.contact-dialog [aria-invalid=true]").length,
  );
  check("invalid fields are flagged with aria-invalid", invalid >= 3, `${invalid} fields`);
  const described = await page.evaluate(() => {
    const el = document.querySelector("dialog.contact-dialog [aria-invalid=true]");
    const id = el?.getAttribute("aria-describedby")?.split(" ")[0];
    return !!id && !!document.getElementById(id);
  });
  check("error text is linked via aria-describedby", described);

  // valid submit → honest "not connected" message (no inbox configured in this environment)
  await page.fill("dialog.contact-dialog input[name=name]", "Test Visitor");
  await page.fill("dialog.contact-dialog input[name=email]", "visitor@example.com");
  await page.fill("dialog.contact-dialog textarea[name=message]", "I would like to talk about buying a first home.");
  await page.check("dialog.contact-dialog input[name=consent]");
  await page.waitForTimeout(2800); // minimum fill time (anti-bot) has to elapse
  await page.click("dialog.contact-dialog button[type=submit]");
  await page.waitForSelector("dialog.contact-dialog .inquiry-done", { timeout: 8000 }).catch(() => {});
  const done = await page.evaluate(() => document.querySelector("dialog.contact-dialog .inquiry-done")?.textContent ?? "");
  check(
    "valid submit gives an honest result (sent, or 'not connected' when no inbox is configured)",
    /message sent|isn’t connected to an inbox/i.test(done),
    done.replace(/\s+/g, " ").slice(0, 110),
  );

  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  check("Escape closes the dialog", !(await page.evaluate(() => document.querySelector("dialog.contact-dialog")?.open)));
  check("page has no console errors / failed requests", problems.length === 0, problems.join(" | ").slice(0, 300));
  await context.close();
}

/* ── 2. Mobile menu ───────────────────────────────────────────────────────── */
{
  const { context, page, problems } = await open({ viewport: { width: 390, height: 844 }, touch: true });
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.click(".menu-btn[data-ui]");
  await page.waitForTimeout(500);
  check("mobile menu opens as a modal dialog", await page.evaluate(() => !!document.querySelector("dialog.menu-dialog")?.open));
  check(
    "menu lists the navigation links",
    (await page.evaluate(() => document.querySelectorAll("dialog.menu-dialog nav a").length)) >= 3,
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  check("Escape closes the menu", !(await page.evaluate(() => document.querySelector("dialog.menu-dialog")?.open)));
  check(
    "no horizontal overflow at 390px",
    (await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1,
  );
  check("mobile page has no console errors", problems.length === 0, problems.join(" | ").slice(0, 300));
  await context.close();
}

/* ── 3. Carousel, tabs, filters, keyboard ─────────────────────────────────── */
{
  const { context, page, problems } = await open();
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(1500);

  // skip link
  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  check("first Tab stop is the skip link", /skip to content/i.test(firstFocus ?? ""), firstFocus);

  // carousel: next button changes the active slide
  await page.evaluate(() => document.querySelector(".expertise")?.scrollIntoView());
  await page.waitForTimeout(1200);
  const before = await page.evaluate(() => document.querySelector(".expertise .slide[data-state=active] h3")?.textContent?.trim());
  await page.click(".expertise .slider__btn >> nth=1");
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => document.querySelector(".expertise .slide[data-state=active] h3")?.textContent?.trim());
  check("carousel 'next' changes the slide", !!before && !!after && before !== after, `${before} → ${after}`);
  const hasPause = await page.evaluate(() => !!document.querySelector(".expertise .slider__pause"));
  check("carousel has a pause control (WCAG 2.2.2)", hasPause);
  await page.click(".expertise .slider__pause");
  check(
    "pause control reports its state (aria-pressed)",
    (await page.evaluate(() => document.querySelector(".expertise .slider__pause")?.getAttribute("aria-pressed"))) === "true",
  );
  check(
    "inactive slides are inert and hidden from assistive tech",
    await page.evaluate(() => {
      const idle = document.querySelector(".expertise .slide[data-state=idle]");
      return !!idle && idle.hasAttribute("inert") && idle.getAttribute("aria-hidden") === "true";
    }),
  );

  // sold tabs: arrow keys
  await page.evaluate(() => document.querySelector(".sold-show__list [role=tab]")?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(800);
  await page.focus(".sold-show__list [role=tab][aria-selected=true]");
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(500);
  const selected = await page.evaluate(
    () => [...document.querySelectorAll(".sold-show__list [role=tab]")].findIndex((t) => t.getAttribute("aria-selected") === "true"),
  );
  check("sold tabs: ArrowDown selects the next tab", selected === 1, `selected index ${selected}`);
  check(
    "sold tabs: roving tabindex",
    await page.evaluate(() => {
      const tabs = [...document.querySelectorAll(".sold-show__list [role=tab]")];
      return tabs.filter((t) => t.tabIndex === 0).length === 1;
    }),
  );

  // properties filter
  await page.goto(`${base}/properties`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  const total = await page.evaluate(() => document.querySelectorAll(".property-grid > li").length);
  await page.click(".filter-group:first-child .chip:has-text('Sold')");
  await page.waitForTimeout(400);
  const visible = await page.evaluate(() => [...document.querySelectorAll(".property-grid > li")].filter((li) => !li.hidden).length);
  const onlySold = await page.evaluate(() =>
    [...document.querySelectorAll(".property-grid > li")].filter((li) => !li.hidden).every((li) => li.dataset.status === "sold"),
  );
  check("filter: 'Sold' hides everything else", visible > 0 && visible < total && onlySold, `${visible} of ${total}`);
  check("filter is reflected in the URL", new URL(page.url()).searchParams.get("status") === "sold", page.url());
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const afterReload = await page.evaluate(() => [...document.querySelectorAll(".property-grid > li")].filter((li) => !li.hidden).length);
  check("filter survives a reload (shareable link)", afterReload === visible, `${afterReload}`);
  check("properties page has no console errors", problems.length === 0, problems.join(" | ").slice(0, 300));
  await context.close();
}

/* ── 4. Reduced motion ────────────────────────────────────────────────────── */
{
  const { context, page, problems } = await open({ reduced: true });
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(1800);
  const state = await page.evaluate(() => ({
    cls: document.documentElement.className,
    height: document.documentElement.scrollHeight,
    vh: window.innerHeight,
    heroSticky: getComputedStyle(document.querySelector(".hero__sticky")).position,
    hiddenReveal: [...document.querySelectorAll("[data-reveal]")].filter((n) => getComputedStyle(n).opacity === "0").length,
    badgeAnimated: getComputedStyle(document.querySelector(".badge-ring")).animationName,
  }));
  check("reduced motion: no pinned stages (hero is not sticky)", state.heroSticky !== "sticky", state.heroSticky);
  check("reduced motion: nothing is hidden behind a reveal", state.hiddenReveal === 0, `${state.hiddenReveal} hidden`);
  check("reduced motion: badge does not spin", state.badgeAnimated === "none", state.badgeAnimated);
  check("reduced motion: no smooth-scroll engine", !/lenis/.test(state.cls), state.cls.replace(/\S*variable/g, "").trim());
  check("reduced motion: page is a normal-length document", state.height < state.vh * 22, `${(state.height / state.vh).toFixed(1)} screens`);
  check("reduced motion: no console errors", problems.length === 0, problems.join(" | ").slice(0, 300));
  await context.close();
}

/* ── 5. Without JavaScript ────────────────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: "load" });
  const info = await page.evaluate(() => ({
    hidden: [...document.querySelectorAll("[data-reveal]")].filter((n) => getComputedStyle(n).opacity === "0").length,
    h1: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
    slides: document.querySelectorAll(".expertise .slide").length,
  }));
  check("no JavaScript: content is not hidden", info.hidden === 0, `${info.hidden} hidden`);
  check("no JavaScript: headline is present", !!info.h1, info.h1);
  const shown = await page.evaluate(() =>
    [...document.querySelectorAll(".expertise .slide")].filter((s) => getComputedStyle(s).visibility !== "hidden").length,
  );
  check("no JavaScript: every carousel slide is listed", shown === info.slides && info.slides > 1, `${shown}/${info.slides}`);
  await context.close();
}

/* ── 6. Client-side navigation (route changes keep the motion layer healthy) ─── */
{
  const { context, page, problems } = await open();
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const dolly = () =>
    page.evaluate(() => {
      const el = document.querySelector("[data-hero-stage]");
      return el ? getComputedStyle(el).transform : "missing";
    });

  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(900);
  const before = await dolly();
  check("home: hero dolly is driven by scroll", before !== "none" && before !== "missing", before);

  await page.click(".site-nav a[href='/properties']");
  await page.waitForURL("**/properties", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(800);
  check("client navigation to /properties", new URL(page.url()).pathname === "/properties");
  check("…and the page rendered its own content", (await page.textContent("h1"))?.trim().toLowerCase() === "homes");

  await page.click(".property-card__link >> nth=0");
  await page.waitForURL(/\/properties\/.+/, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(800);
  check("client navigation to a home", /\/properties\/[^/]+$/.test(new URL(page.url()).pathname), page.url());

  await page.goBack();
  await page.waitForTimeout(600);
  await page.goBack();
  await page.waitForURL(`${base}/`, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);
  check("back to the home page", new URL(page.url()).pathname === "/");
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(1200);
  const after = await dolly();
  check("home: the choreography still runs after navigating away and back", after !== "none" && after !== "missing", after);
  check("navigation produced no console errors", problems.length === 0, problems.join(" | ").slice(0, 300));
  await context.close();
}

/* ── 7. Reflow and text scaling (WCAG 1.4.4 / 1.4.10) ─────────────────────── */
{
  for (const [label, opts, css] of [
    ["320 px wide (400% zoom equivalent)", { viewport: { width: 320, height: 640 }, touch: true }, ""],
    ["200% root font size at 390 px", { viewport: { width: 390, height: 844 }, touch: true }, "html{font-size:200% !important}"],
  ]) {
    const { context, page } = await open(opts);
    const overflows = [];
    for (const path of ["/", "/properties", "/properties/condo-in-lyons-sold-001", "/contact"]) {
      await page.goto(`${base}${path}`, { waitUntil: "load" });
      if (css) await page.addStyleTag({ content: css });
      await page.waitForTimeout(900);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) overflows.push(`${path} (+${over}px)`);
    }
    check(`no horizontal scrolling at ${label}`, overflows.length === 0, overflows.join(", "));
    await context.close();
  }
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
