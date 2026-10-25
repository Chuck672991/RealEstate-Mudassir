import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildMetadata } from "./metadata";

/**
 * Next merges a page's metadata into the layout's key by key, and a key that is
 * present-but-undefined overwrites the inherited value with "empty". These tests pin
 * the rule that matters most for SEO: a page with no title of its own must INHERIT the
 * layout's default title, not erase it.
 */
describe("buildMetadata", () => {
  it("omits title and description entirely when there is nothing to say", () => {
    const m = buildMetadata({ path: "/" });
    assert.equal("title" in m, false, "an undefined title key erases the layout default");
    assert.equal("description" in m, false);
    assert.equal("robots" in m, false);
    assert.equal(m.alternates?.canonical, "/");
    // the sharing card still works without a title
    assert.ok(m.openGraph && "images" in m.openGraph);
    assert.equal("title" in (m.openGraph ?? {}), false);
    assert.equal("title" in (m.twitter ?? {}), false);
  });

  it("uses page → fallback → site default, in that order", () => {
    const defaults = { title: "Site", description: "Site description" };
    assert.equal(buildMetadata({ path: "/a", seo: { title: "Page" }, fallbackTitle: "Fallback", defaults }).title, "Page");
    assert.equal(buildMetadata({ path: "/a", fallbackTitle: "Fallback", defaults }).title, "Fallback");
    assert.equal(buildMetadata({ path: "/a", defaults }).title, "Site");
    assert.equal(
      buildMetadata({ path: "/a", fallbackDescription: "Page text", defaults }).description,
      "Page text",
      "a page's own text beats the site-wide description",
    );
    assert.equal(buildMetadata({ path: "/a", defaults }).description, "Site description");
  });

  it("sets the title on the share cards too, and can bypass the template", () => {
    const m = buildMetadata({ path: "/a", seo: { title: "Page" }, absoluteTitle: true });
    assert.deepEqual(m.title, { absolute: "Page" });
    assert.equal(m.openGraph && "title" in m.openGraph ? m.openGraph.title : undefined, "Page");
    assert.equal(m.twitter && "title" in m.twitter ? m.twitter.title : undefined, "Page");
  });

  it("keeps a page out of the index only when asked", () => {
    assert.equal("robots" in buildMetadata({ path: "/a" }), false);
    assert.deepEqual(buildMetadata({ path: "/a", noIndex: true }).robots, { index: false, follow: false });
    assert.deepEqual(buildMetadata({ path: "/a", seo: { noIndex: true } }).robots, { index: false, follow: false });
  });

  it("clips long descriptions to 200 characters", () => {
    const m = buildMetadata({ path: "/a", seo: { description: "word ".repeat(100) } });
    assert.ok((m.description ?? "").length <= 200);
    assert.match(m.description ?? "", /…$/);
  });

  it("uses the editor's canonical URL when one is set", () => {
    assert.equal(buildMetadata({ path: "/a", seo: { canonicalUrl: "https://example.com/x" } }).alternates?.canonical, "https://example.com/x");
  });
});
