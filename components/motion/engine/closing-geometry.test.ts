import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { WINDOWS_ALIGNED, WINDOWS_MERGED, WINDOWS_START, windowsPolygon, type WindowPair } from "./closing-geometry";

/**
 * The closing scene's two windows, held to the reference's measured geometry (brief §5.5–5.6, at
 * 1662 × 1080): each window 453 × 687 px, i.e. 27.3 % of the stage's width by 63.6 % of its height;
 * aligned, a 17 px gap (≈ 1 %) between them; at the start the left one sits ≈ 384 px (≈ 35 %) lower.
 * An earlier version applied the reference's half-panel percentages to the whole stage and drew
 * windows twice as wide that merged into a stepped block.
 */
const width = (w: { x0: number; x1: number }) => w.x1 - w.x0;
const height = (w: { y0: number; y1: number }) => w.y1 - w.y0;
const near = (actual: number, expected: number, tolerance: number, what: string) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${what}: ${actual} is not within ${tolerance} of ${expected}`);

describe("closing scene windows", () => {
  it("are portrait windows, each a little over a quarter of the stage wide", () => {
    for (const pair of [WINDOWS_START, WINDOWS_ALIGNED]) {
      near(width(pair.a), 27.2, 0.2, "window A width (% of stage)");
      near(width(pair.b), 27.2, 0.2, "window B width (% of stage)");
      near(height(pair.a), 63, 0.2, "window A height");
      near(height(pair.b), 63, 0.2, "window B height");
    }
    // portrait even on a 16:9 screen (% of width and % of height are of different lengths)
    assert.ok(height(WINDOWS_ALIGNED.a) * 9 > width(WINDOWS_ALIGNED.a) * 16, "taller than wide at 16:9");
  });

  it("start staggered (left low, right high), then align exactly", () => {
    near(WINDOWS_START.a.y0 - WINDOWS_START.b.y0, 35.185, 0.01, "start offset");
    assert.equal(WINDOWS_ALIGNED.a.y0, WINDOWS_ALIGNED.b.y0);
    assert.equal(WINDOWS_ALIGNED.a.y1, WINDOWS_ALIGNED.b.y1);
    // the offset closes symmetrically: the left rises as far as the right drops
    near(WINDOWS_START.a.y0 - WINDOWS_ALIGNED.a.y0, WINDOWS_ALIGNED.b.y0 - WINDOWS_START.b.y0, 0.01, "symmetric slide");
  });

  it("are centred on the stage with a hairline gap, and the gap closes at the centre line", () => {
    near((WINDOWS_ALIGNED.a.x0 + WINDOWS_ALIGNED.b.x1) / 2, 50, 0.01, "pair centre");
    near(WINDOWS_ALIGNED.b.x0 - WINDOWS_ALIGNED.a.x1, 1.111, 0.01, "aligned gap");
    assert.equal(WINDOWS_MERGED.a.x1, 50);
    assert.equal(WINDOWS_MERGED.b.x0, 50);
    // merging moves only the facing edges
    assert.equal(WINDOWS_MERGED.a.x0, WINDOWS_ALIGNED.a.x0);
    assert.equal(WINDOWS_MERGED.b.x1, WINDOWS_ALIGNED.b.x1);
  });

  it("the three states have the same number of points, so GSAP can tween between them", () => {
    const count = (p: WindowPair) => windowsPolygon(p).split(",").length;
    assert.equal(count(WINDOWS_START), count(WINDOWS_ALIGNED));
    assert.equal(count(WINDOWS_ALIGNED), count(WINDOWS_MERGED));
  });

  it("the polygon is two rectangles joined by a line of no area (out and back over the same two points)", () => {
    const points = windowsPolygon(WINDOWS_ALIGNED)
      .replace(/^polygon\(|\)$/g, "")
      .split(",")
      .map((p) => p.trim());
    // A: 4 corners + back to its start; then B: its start, 4 corners, its start again; then A's start again
    assert.equal(points.length, 11);
    assert.equal(points[0], points[4], "A closes on itself");
    assert.equal(points[5], points[9], "B closes on itself");
    // out along A-start → B-start (points 4 → 5), back along B-start → A-start (points 9 → 10): the same two points
    assert.equal(points[0], points[10], "the bridge returns to where it left");
  });
});
