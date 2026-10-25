#!/usr/bin/env node
/**
 * CONTENT-STATE AUDIT of a RUNNING site: does every page degrade gracefully, whatever
 * the dataset holds? Works against the full dataset, a half-filled CMS or an empty one.
 *
 *   node scripts/verify/states.mjs http://localhost:3000            any dataset
 *   node scripts/verify/states.mjs http://localhost:3000 --empty    + checks that only hold with NO documents
 *
 * In a desktop, a phone and a reduced-motion browser it scrolls each page end to end
 * and requires:
 *   • no console error/warning, uncaught exception or failed request
 *   • no placeholder text ("undefined", "NaN", "[object", "lorem ipsum", "null")
 *   • no horizontal overflow
 *   • no empty section, heading-only section, empty landmark/list, or footer heading
 *     without content — "no empty sections" is a requirement, not a hope
 *   • exactly one <h1> on a real page, and primary navigation present
 *   • the status codes the routing promises (200 for pages, 404 for a made-up URL)
 * Every property detail page linked from /properties is audited as well, so a record
 * with thin data cannot hide behind the richest one.
 *
 * With --empty it also requires the layout's default <title> on the home page and no
 * "data collected from…" claim in the footer (there is no data to make it about).
 *
 * How to get an empty dataset to point this at: docs/VERIFICATION.md → "Missing content".
 */
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000").replace(/\/$/, "");
const expectEmpty = args.includes("--empty");

const PLACEHOLDER = /undefined|\bNaN\b|\[object|lorem ipsum|\bnull\b/i;
const contexts = [
  { label: "desktop", viewport: { width: 1440, height: 900 } },
  { label: "phone", viewport: { width: 390, height: 844 }, touch: true },
  { label: "reduced motion", viewport: { width: 1440, height: 900 }, reduced: true },
];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
let failures = 0;
const check = (ok, message) => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${message}`);
};

/** The page reads like a finished page: nothing empty, nothing broken. */
function inspect() {
  const text = document.body.innerText;
  const empty = (el) => !el.textContent.trim() && !el.querySelector("img, svg, canvas, picture, input, button, a");
  const headingOnly = (section) => {
    const lines = section.innerText.trim().split(/\n+/).filter(Boolean);
    return lines.length === 1 && !!section.querySelector("h2");
  };
  return {
    title: document.title,
    text,
    h1: document.querySelectorAll("h1").length,
    sections: [...document.querySelectorAll("main section[id]")].map((s) => s.id),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    emptySections: [...document.querySelectorAll("main section")].filter(empty).map((s) => s.id || s.className),
    headingOnly: [...document.querySelectorAll("main section")].filter(headingOnly).map((s) => s.id || s.className),
    emptyLandmarks: [...document.querySelectorAll("nav, aside, address, ul[role=list], ol")]
      .filter(empty)
      .map((n) => `${n.tagName.toLowerCase()}.${n.className}`),
    footerHeadingsWithoutContent: [...document.querySelectorAll("footer h2")]
      .filter((h) => !(h.parentElement?.innerText ?? "").replace(h.textContent ?? "", "").trim())
      .map((h) => h.textContent?.trim()),
    navLinks: [...document.querySelectorAll("header nav a, .site-nav a")].map((a) => a.getAttribute("href")),
    footerText: `${document.querySelector("footer")?.innerText ?? ""} ${document.querySelector(".legal-strip")?.innerText ?? ""}`,
    propertyLinks: [...new Set([...document.querySelectorAll('a[href^="/properties/"]')].map((a) => a.getAttribute("href")))],
  };
}

let propertyPaths = [];

for (const c of contexts) {
  const context = await browser.newContext({
    viewport: c.viewport,
    hasTouch: !!c.touch,
    isMobile: !!c.touch,
    reducedMotion: c.reduced ? "reduce" : "no-preference",
  });
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("ms-intro", "1"); // the intro is exercised by verify:intro
    } catch {}
  });

  const pages = [
    { path: "/", status: 200 },
    { path: "/properties", status: 200 },
    { path: "/contact", status: 200 },
    { path: "/definitely-not-a-page", status: 404 },
    ...propertyPaths.map((path) => ({ path, status: 200 })),
  ];

  for (const { path, status } of pages) {
    const page = await context.newPage();
    const problems = [];
    page.on("console", (m) => {
      if (/status of 404/.test(m.text())) return; // the browser logs the 404 document itself
      if (["error", "warning"].includes(m.type())) problems.push(`console.${m.type()}: ${m.text().replace(/\s+/g, " ").slice(0, 200)}`);
    });
    page.on("pageerror", (e) => problems.push(`exception: ${e.message.slice(0, 200)}`));
    page.on("requestfailed", (r) => problems.push(`request failed: ${r.url().slice(0, 120)}`));

    const response = await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(900);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(c.viewport.height * 0.8)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const info = await page.evaluate(inspect);
    const label = `${c.label.padEnd(14)} ${path}`;

    check(response?.status() === status, `${label}: status ${response?.status()} (expected ${status})`);
    check(problems.length === 0, `${label}: console and network clean${problems.length ? `\n        ${problems.join("\n        ")}` : ""}`);
    check(!PLACEHOLDER.test(info.text), `${label}: no placeholder text${PLACEHOLDER.test(info.text) ? ` ("${info.text.match(PLACEHOLDER)?.[0]}")` : ""}`);
    check(info.overflowX <= 0, `${label}: no horizontal overflow (${info.overflowX}px)`);
    check(
      !info.emptySections.length && !info.headingOnly.length && !info.emptyLandmarks.length && !info.footerHeadingsWithoutContent.length,
      `${label}: nothing empty${JSON.stringify([info.emptySections, info.headingOnly, info.emptyLandmarks, info.footerHeadingsWithoutContent]) === "[[],[],[],[]]" ? "" : ` ${JSON.stringify({ sections: info.emptySections, headingOnly: info.headingOnly, landmarks: info.emptyLandmarks, footer: info.footerHeadingsWithoutContent })}`}`,
    );
    if (status === 200) {
      check(info.h1 === 1, `${label}: exactly one <h1> (${info.h1})`);
      check(info.navLinks.length >= 2, `${label}: primary navigation present (${info.navLinks.length} links)`);
    }
    if (path === "/") console.log(`        home sections: ${info.sections.join(", ") || "(none)"}`);
    if (expectEmpty && path === "/") {
      check(info.title === "Mudassir Siddiqui — Real Estate", `${label}: home inherits the layout's default title (got "${info.title}")`);
    }
    if (expectEmpty) {
      check(!/collected from/.test(info.footerText), `${label}: no data-source claim without data`);
    }
    if (path === "/properties" && !propertyPaths.length) {
      propertyPaths = info.propertyLinks.filter((href) => /^\/properties\/[^/?#]+$/.test(href));
      console.log(`        property pages linked from /properties: ${propertyPaths.length}`);
    }
    await page.close();
  }
  await context.close();
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nEvery page degrades gracefully");
process.exit(failures ? 1 : 0);
