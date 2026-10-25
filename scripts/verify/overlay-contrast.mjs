#!/usr/bin/env node
/**
 * Contrast of text that sits on GRADIENTS, TEXTURES and PHOTOGRAPHS, which token-based
 * checks cannot see.
 *
 * For each text element it (1) records the text colour, size and EFFECTIVE opacity (its own
 * and its ancestors'), (2) makes all text in the layer transparent, (3) screenshots the area
 * the text occupied, and (4) measures the background — using the LIGHTEST 5% of pixels as the
 * worst case for light text (and the darkest 5% for dark text). The text colour, blended with
 * that worst-case pixel by its effective opacity, must meet WCAG AA (4.5:1, or 3:1 for large
 * text).
 *
 *   node scripts/verify/overlay-contrast.mjs http://localhost:3000
 *   node scripts/verify/overlay-contrast.mjs http://localhost:3000 --stress white
 *
 * --stress white|black  replaces every photograph slot with a flat white (or black) picture —
 *                       the worst case for light (or dark) text — and re-measures the scenes
 *                       where text sits over a photo. No photographs exist yet, so this is how
 *                       "will the text stay legible on whatever the agent uploads?" is proved.
 */
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--stress") ?? "http://localhost:3000").replace(/\/$/, "");
const stress = args.includes("--stress") ? args[args.indexOf("--stress") + 1] : null;
if (stress && !["white", "black"].includes(stress)) {
  console.error("--stress takes white or black");
  process.exit(2);
}

/**
 * Each scene: where to scroll and which text elements to measure there.
 * `layer` is the container whose text is hidden while the background is photographed, so
 * words that overlap by design (the italic accent over the headline) do not count as
 * "background" for each other. `photo` is the selector of the photograph slot that --stress
 * replaces in that scene.
 */
const HERO = [".hero__eyebrow", ".hero__line", ".hero__accent", ".hero__sub", ".hero__meta"];
const HEADER = [".site-nav a"];
const SOLD = [".sold-show__heading h2", ".sold-show__heading p", ".sold-stage__price", ".sold-stage__where", ".sold-stage__caption p", ".sold-show__tab"];
const scenes = [
  { name: "hero", viewport: [1440, 900], scrollY: 0, layer: ".hero__stage", selectors: HERO, photo: ".hero__doorway-media" },
  { name: "hero", viewport: [1280, 720], scrollY: 0, layer: ".hero__stage", selectors: HERO.slice(1), photo: ".hero__doorway-media" },
  { name: "hero (zoomed)", viewport: [1440, 900], pin: ["[data-pin-area='hero']", 0.65], layer: ".hero__stage, .site-header", selectors: [...HERO.slice(1), ...HEADER], photo: ".hero__doorway-media" },
  { name: "hero (phone)", viewport: [390, 844], touch: true, scrollY: 0, layer: ".hero__stage", selectors: [...HERO, ".hero__cta .circle-btn__label"], photo: ".hero__doorway-media" },
  { name: "about", viewport: [1440, 900], section: "#about", layer: ".about__inner", selectors: [".about__label", ".about__statement", ".about__bio p", ".about__facts dt", ".about__facts dd"] },
  { name: "recently sold", viewport: [1440, 900], pin: ["[data-pin-area='sold']", 0.02], layer: ".sold-show__ui, .sold-stage__caption, .site-header", selectors: [...SOLD, ...HEADER], photo: ".sold-stage__media" },
  { name: "recently sold (mid)", viewport: [1440, 900], pin: ["[data-pin-area='sold']", 0.3], layer: ".sold-show__ui, .sold-stage__caption, .site-header", selectors: [...SOLD, ...HEADER], photo: ".sold-stage__media" },
  { name: "recently sold (phone)", viewport: [390, 844], touch: true, section: "#sold", layer: ".sold-show__ui, .sold-stage__caption, .site-header", selectors: [...SOLD, ".menu-btn"], photo: ".sold-stage__media" },
  // the menu over the “how I work” photograph (flush right, so the menu passes over it), and the copy under it
  { name: "how (menu over the right photograph)", viewport: [1470, 923], pin: [".how__img--r", 0.05], layer: ".site-header", selectors: HEADER, photo: ".how__photo--r" },
  { name: "how (copy)", viewport: [1470, 923], pin: [".how__copy", 0.3], layer: ".how__copy, .how__langs", selectors: [".how__statement", ".how__services li", ".how__langs p", ".how__langs li"] },
  { name: "closing scene", viewport: [1440, 900], pin: ["[data-pin-area='cta']", 0.72], layer: ".cta__content", selectors: [".cta__eyebrow", ".cta__giant", ".cta__row p", ".cta__phone"] },
  { name: "closing scene (phone)", viewport: [390, 844], touch: true, section: "#contact", layer: ".cta__content", selectors: [".cta__eyebrow", ".cta__giant", ".cta__row p", ".cta__phone", ".cta__actions .circle-btn__label"] },
];
const selected = stress ? scenes.filter((s) => s.photo) : scenes;

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
let failures = 0;
let measured = 0;

for (const scene of selected) {
  const context = await browser.newContext({
    viewport: { width: scene.viewport[0], height: scene.viewport[1] },
    hasTouch: !!scene.touch,
    isMobile: !!scene.touch,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ms-intro", "1");
    } catch {}
  });
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(1800);

  if (stress) {
    // a flat picture in every photograph slot of this scene: no texture, no glyph, no glow
    const flat = stress === "white" ? "white" : "black";
    await page.addStyleTag({
      content: `${scene.photo} { background: ${flat} !important; }
        ${scene.photo}::before, ${scene.photo}::after { content: none !important; }
        ${scene.photo} > *, .hero__doorway-light { display: none !important; }`,
    });
  }

  if (scene.pin) {
    const y = await page.evaluate(([sel, p]) => {
      const el = document.querySelector(sel);
      const top = el.getBoundingClientRect().top + window.scrollY;
      return Math.round(top + p * (el.offsetHeight - window.innerHeight));
    }, scene.pin);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
  } else if (scene.section) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 40);
    }, scene.section);
  } else {
    await page.evaluate((y) => window.scrollTo(0, y), scene.scrollY ?? 0);
  }
  await page.waitForTimeout(2200); // let reveals finish and stages settle
  // make every reveal final so the text is where it will rest
  await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((n) => n.setAttribute("data-revealed", "")));
  await page.waitForTimeout(1600);

  // 1) read every text colour FIRST: hiding text later makes fixed-UI colours transition,
  //    and a colour read mid-transition would be wrong
  const targets = [];
  for (const selector of scene.selectors) {
    const infos = await page.evaluate((sel) => {
      const out = [];
      document.querySelectorAll(sel).forEach((el, index) => {
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
        const cs = getComputedStyle(el);
        // opacity multiplies down the tree: a dimmed parent dims its text
        let opacity = 1;
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) opacity *= parseFloat(getComputedStyle(n).opacity);
        if (opacity < 0.05 || cs.visibility === "hidden") return; // not actually visible
        out.push({
          index,
          rect: { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(r.width, innerWidth - Math.max(0, r.left)), height: Math.min(r.height, innerHeight - Math.max(0, r.top)) },
          color: cs.color,
          size: parseFloat(cs.fontSize),
          weight: parseInt(cs.fontWeight, 10) || 400,
          opacity,
        });
      });
      return out.slice(0, 3);
    }, selector);
    for (const info of infos) targets.push({ selector, info });
  }

  // 2) photograph what is behind each one, with ALL the layer's text made transparent
  //    (backgrounds, veils and glows stay) and transitions off so nothing is mid-fade
  for (const { selector, info } of targets) {
    await page.evaluate((layer) => {
      const style = document.createElement("style");
      style.id = "__hide-text";
      style.textContent = `${layer}, ${layer} * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; stroke: transparent !important; transition: none !important; }`;
      document.head.appendChild(style);
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, scene.layer.split(",").map((l) => l.trim()).join(", "));
    const png = await page.screenshot({ clip: info.rect });
    await page.evaluate(() => document.getElementById("__hide-text")?.remove());

    const result = await page.evaluate(
      async ([b64, color, opacity]) => {
        const toLin = (v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        const lum = (r, g, b) => 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
        const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height).data;
        const px = [];
        for (let i = 0; i < data.length; i += 4) px.push({ l: lum(data[i], data[i + 1], data[i + 2]), rgb: [data[i], data[i + 1], data[i + 2]] });
        px.sort((a, b) => a.l - b.l);
        const at = (q) => px[Math.min(px.length - 1, Math.floor(q * px.length))];
        const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(color);
        const rgb = [Number(m[1]), Number(m[2]), Number(m[3])];
        const alpha = (m[4] === undefined ? 1 : Number(m[4])) * opacity;
        const lightText = lum(...rgb) > 0.4;
        const worst = lightText ? at(0.95) : at(0.05); // lightest 5% hurts light text; darkest 5% hurts dark text
        // the text as it is actually painted: its colour blended with what is behind it
        const eff = rgb.map((c, k) => alpha * c + (1 - alpha) * worst.rgb[k]);
        return { text: lum(...eff), bg: worst.l, alpha };
      },
      [png.toString("base64"), info.color, info.opacity],
    );

    const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const r = ratio(result.text, result.bg);
    const large = info.size >= 24 || (info.size >= 18.66 && info.weight >= 700);
    const need = large ? 3 : 4.5;
    const ok = r >= need;
    measured += 1;
    if (!ok) failures += 1;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${scene.name.padEnd(22)} ${scene.viewport.join("×").padEnd(9)} ${selector.padEnd(28)} ${r.toFixed(2).padStart(5)}:1 (need ${need}${large ? ", large" : ""})  ${Math.round(info.size)}px${result.alpha < 0.99 ? `  α${result.alpha.toFixed(2)}` : ""}`,
    );
  }
  await context.close();
}
await browser.close();
const mode = stress ? ` over a pure-${stress} photograph` : "";
console.log(
  failures
    ? `\n${failures} of ${measured} text/background pairing(s)${mode} below WCAG AA`
    : `\nAll ${measured} measured text/background pairings${mode} meet WCAG AA`,
);
process.exit(failures ? 1 : 0);
