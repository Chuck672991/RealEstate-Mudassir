#!/usr/bin/env node
/**
 * Technical-SEO audit of a RUNNING site (no browser needed).
 *
 *   NEXT_PUBLIC_SITE_URL=https://example.com npm run build && npm start   (terminal 1)
 *   node scripts/verify/seo.mjs http://localhost:3000 https://example.com  (terminal 2)
 *
 * argv[2] = where the server is reachable, argv[3] = the public origin the build was
 * made with (so canonical / sitemap URLs can be compared). Checks, per page: status,
 * lang, one <h1>, title and description length, canonical, Open Graph / Twitter tags,
 * robots meta, JSON-LD (parses, expected types, no invented ratings/reviews), image
 * alt text, internal links; plus robots.txt and sitemap.xml. Exits 1 on any FAIL.
 */
const server = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const origin = (process.argv[3] ?? server).replace(/\/$/, "");

let failures = 0;
const warn = [];
const ok = (cond, message, detail = "") => {
  if (!cond) failures += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${message}${detail ? `  — ${detail}` : ""}`);
};
const note = (message) => {
  warn.push(message);
  console.log(`NOTE  ${message}`);
};

const get = async (path) => {
  const res = await fetch(server + path, { redirect: "manual" });
  return { res, text: await res.text() };
};
const attr = (tag, name) => new RegExp(`${name}=["']([^"']*)["']`, "i").exec(tag)?.[1] ?? "";
const metaContent = (html, key, value) => {
  const m = html.match(new RegExp(`<meta[^>]*\\b${key}=["']${value}["'][^>]*>`, "i"));
  return m ? attr(m[0], "content") : "";
};

// ── sitemap ───────────────────────────────────────────────────────────────────
const sitemap = await get("/sitemap.xml");
const locs = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok(sitemap.res.status === 200 && locs.length > 3, "sitemap.xml lists routes", `${locs.length} URLs`);
ok(locs.every((u) => u.startsWith(origin)), "every sitemap URL uses the public origin", locs.find((u) => !u.startsWith(origin)) ?? "");
ok(!locs.some((u) => /\/(studio|api)(\/|$)/.test(u)), "sitemap never lists the Studio or API routes");
const paths = locs.map((u) => u.replace(origin, "") || "/");

// ── robots ────────────────────────────────────────────────────────────────────
const robots = await get("/robots.txt");
if (/Disallow:\s*\/\s*$/m.test(robots.text) && !/Allow:\s*\//.test(robots.text)) {
  note("robots.txt disallows everything — expected while NEXT_PUBLIC_SITE_URL is still the localhost placeholder");
} else {
  ok(/Disallow:\s*\/studio/.test(robots.text), "robots.txt disallows /studio");
  ok(/Disallow:\s*\/api\//.test(robots.text), "robots.txt disallows /api/");
  ok(new RegExp(`Sitemap:\\s*${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml`).test(robots.text), "robots.txt points at the sitemap");
}

// ── pages ─────────────────────────────────────────────────────────────────────
const internal = new Set();
for (const path of paths) {
  const { res, text: html } = await get(path);
  const label = path.length > 44 ? `${path.slice(0, 41)}…` : path;
  if (res.status !== 200) {
    ok(false, `${label} responds 200`, String(res.status));
    continue;
  }
  const lang = /<html[^>]*\blang=["']([^"']+)/i.exec(html)?.[1];
  const h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
  const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? "";
  const description = metaContent(html, "name", "description");
  const canonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.exec(html)?.[0];
  const canonicalHref = canonical ? attr(canonical, "href") : "";
  const robotsMeta = metaContent(html, "name", "robots");

  const problems = [];
  if (lang !== "en") problems.push(`lang=${lang}`);
  if (h1 !== 1) problems.push(`${h1} <h1>`);
  if (title.length < 10 || title.length > 75) problems.push(`title ${title.length} chars`);
  if (description.length < 50 || description.length > 210) problems.push(`description ${description.length} chars`);
  if (canonicalHref !== origin + (path === "/" ? "" : path) && canonicalHref !== origin + path) problems.push(`canonical=${canonicalHref}`);
  if (/noindex/i.test(robotsMeta)) problems.push("robots noindex");
  for (const k of ["og:title", "og:description", "og:url", "og:image", "og:type"]) {
    if (!metaContent(html, "property", k)) problems.push(`missing ${k}`);
  }
  if (!metaContent(html, "name", "twitter:card")) problems.push("missing twitter:card");

  // images
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\balt=/i.test(t)).length;
  if (noAlt) problems.push(`${noAlt} <img> without alt`);

  // JSON-LD
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocks.length) problems.push("no JSON-LD");
  const types = [];
  for (const raw of blocks) {
    try {
      const data = JSON.parse(raw.replace(/\\u003c/g, "<"));
      const nodes = data["@graph"] ?? [data];
      if (data["@context"] !== "https://schema.org") problems.push("JSON-LD @context");
      for (const n of nodes) {
        const t = n["@type"];
        types.push(Array.isArray(t) ? t.join("+") : t);
        if (/aggregateRating|review/i.test(JSON.stringify(n).replace(/"@type":"ListItem"/g, ""))) {
          problems.push("JSON-LD contains rating/review markup (must not be invented)");
        }
        if (n.url && !String(n.url).startsWith(origin)) problems.push(`JSON-LD url ${n.url}`);
        if (t === "BreadcrumbList") {
          const positions = n.itemListElement.map((e) => e.position);
          if (positions.join() !== positions.map((_, i) => i + 1).join()) problems.push("breadcrumb positions");
        }
      }
    } catch (e) {
      problems.push(`JSON-LD parse error: ${e.message}`);
    }
  }

  for (const m of html.matchAll(/<a\b[^>]*\bhref=["'](\/[^"'#?][^"']*)["']/gi)) internal.add(m[1].split("?")[0]);

  ok(problems.length === 0, `${label}`, problems.length ? problems.join("; ") : `${types.join(", ")}`);
}

// ── internal links resolve ────────────────────────────────────────────────────
const dead = [];
for (const href of internal) {
  if (/^\/(_next|api|studio)/.test(href)) continue;
  const res = await fetch(server + href, { redirect: "manual" });
  if (res.status >= 400) dead.push(`${href} (${res.status})`);
}
ok(dead.length === 0, `internal links resolve (${internal.size} checked)`, dead.slice(0, 5).join(", "));

// ── status codes ──────────────────────────────────────────────────────────────
const missing = await fetch(`${server}/definitely-not-a-page`);
ok(missing.status === 404, "unknown URL answers with a real 404", String(missing.status));
const html404 = await missing.text();
ok(/noindex/i.test(html404), "404 page is noindex");

console.log(`\n${failures ? `${failures} check(s) failed` : "All SEO checks passed"}${warn.length ? ` (${warn.length} note(s))` : ""}`);
process.exit(failures ? 1 : 0);
