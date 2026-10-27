import assert from "node:assert/strict";
import { describe, it } from "node:test";

import nextConfig from "../../next.config";

/**
 * The site's HTTP caching rules (next.config.ts). Files in public/ are served with `max-age=0` unless told
 * otherwise, which made every visit — and every range request of a multi-megabyte flower video — ask the
 * server again. These tests pin the rules that fixed that, and the one condition that makes the strongest of
 * them safe (the clips' names contain a hash of their content).
 */
const rules = async () => (await nextConfig.headers?.()) ?? [];
const cacheControl = async (source: string) => (await rules()).find((r) => r.source === source)?.headers.find((h) => h.key === "Cache-Control")?.value;

describe("caching headers", () => {
  it("the flower clips are immutable for a year", async () => {
    assert.equal(await cacheControl("/flowers/clips/:path*"), "public, max-age=31536000, immutable");
  });

  it("the clouds are cached for 30 days", async () => {
    assert.match((await cacheControl("/clouds/:path*")) ?? "", /^public, max-age=2592000\b/);
  });

  it("optimized photographs are cached for longer than the 4-hour default", () => {
    assert.ok((nextConfig.images?.minimumCacheTTL ?? 0) >= 60 * 60 * 24 * 7);
  });

  it("the security headers still apply to every route", async () => {
    const all = (await rules()).find((r) => r.source === "/:path*");
    assert.ok(all, "the catch-all rule is still there");
    for (const key of ["X-Content-Type-Options", "Referrer-Policy", "Content-Security-Policy"]) assert.ok(all.headers.some((h) => h.key === key), key);
  });
});
