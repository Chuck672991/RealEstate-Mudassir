import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createFrameJudge, GAP_MS, SLOW_FRAME_MS, SLOW_SHARE, TRUST_AFTER, WARMUP_FRAMES, WINDOW, type Verdict } from "./tier";

/**
 * The frame-rate judge decides, from measured frame intervals, whether scrolling is janky enough to switch the
 * site to its lite tier. The cost of a wrong answer is asymmetric and the tests are written around that:
 * downgrading a healthy machine for one hiccup would make the site worse for no reason (and the downgrade is
 * permanent for the session), while failing to downgrade a machine that is really struggling is the problem
 * the tier exists to solve.
 */
const FAST = 16.7;
const SLOW = 50;

/** Feed a stream of intervals; return the first non-"ok" verdict and the frame it came on. */
function feed(intervals: number[], judge = createFrameJudge()): { verdict: Verdict; at: number } {
  for (let i = 0; i < intervals.length; i++) {
    const v = judge.push(intervals[i]!);
    if (v !== "ok") return { verdict: v, at: i };
  }
  return { verdict: "ok", at: -1 };
}
const repeat = (n: number, v: number) => Array.from({ length: n }, () => v);
/** A repeating pattern, e.g. pattern(100, [FAST, FAST, SLOW]) is one slow frame in three. */
const pattern = (n: number, p: number[]) => Array.from({ length: n }, (_, i) => p[i % p.length]!);

describe("frame judge: what must NOT downgrade", () => {
  it("a steady 60 fps scroll is never judged slow, and the machine is eventually trusted", () => {
    const r = feed(repeat(WARMUP_FRAMES + WINDOW + TRUST_AFTER + 10, FAST));
    assert.equal(r.verdict, "trusted");
  });

  it("a brief hiccup (a few dropped frames among many good ones) is not enough", () => {
    // 5 slow frames in a 60-frame window = 8 %, well under the 25 % that counts as sustained
    const stream = [...repeat(WARMUP_FRAMES + 40, FAST), ...repeat(5, SLOW), ...repeat(60, FAST)];
    assert.notEqual(feed(stream).verdict, "slow");
  });

  it("the first frames of a scroll streak are ignored (waking up is allowed to be slow)", () => {
    const stream = [...repeat(WARMUP_FRAMES, 200), ...repeat(WINDOW + 20, FAST)];
    assert.notEqual(feed(stream).verdict, "slow");
  });

  it("long gaps (a hidden tab, an idle page) are not slow frames", () => {
    const stream = [...repeat(WARMUP_FRAMES + 10, FAST), ...repeat(80, GAP_MS + 1), ...repeat(WINDOW, FAST)];
    assert.notEqual(feed(stream).verdict, "slow");
  });

  it("nonsense samples (zero or negative intervals) are not evidence", () => {
    assert.notEqual(feed(repeat(500, 0)).verdict, "slow");
    assert.notEqual(feed(repeat(500, -5)).verdict, "slow");
  });

  it("just under the threshold does not trip it", () => {
    // one slow frame in five = 20 % < 25 %
    assert.notEqual(feed(pattern(WARMUP_FRAMES + WINDOW * 3, [FAST, FAST, FAST, FAST, SLOW])).verdict, "slow");
  });
});

describe("frame judge: what must downgrade", () => {
  it("a sustained stutter (every other frame dropped) is judged slow", () => {
    const r = feed(pattern(WARMUP_FRAMES + WINDOW * 2, [FAST, SLOW]));
    assert.equal(r.verdict, "slow");
  });

  it("a machine that never reaches 30 fps is judged slow as soon as the window has filled", () => {
    const r = feed(repeat(WARMUP_FRAMES + WINDOW * 2, SLOW));
    assert.equal(r.verdict, "slow");
    assert.ok(r.at <= WARMUP_FRAMES + WINDOW, `took ${r.at} frames to notice`);
  });

  it("exactly at the threshold counts", () => {
    // one slow frame in four = 25 %
    assert.equal(feed(pattern(WARMUP_FRAMES + WINDOW * 3, [FAST, FAST, FAST, SLOW])).verdict, "slow");
    assert.equal(SLOW_SHARE, 0.25);
  });

  it("needs a full window of evidence: a handful of terrible frames at the start cannot decide it", () => {
    const r = feed([...repeat(WARMUP_FRAMES, FAST), ...repeat(20, 300 - 1), ...repeat(5, SLOW)]);
    assert.notEqual(r.verdict, "slow", "20 very slow frames in a window of fewer than 60 are not yet a verdict");
  });
});

describe("frame judge: sessions and streaks", () => {
  it("reset() starts a new scroll streak: the warm-up applies again", () => {
    const judge = createFrameJudge();
    feed(repeat(WARMUP_FRAMES + WINDOW, FAST), judge);
    judge.reset();
    // the first WARMUP_FRAMES of the new streak are slow (a wake-up) and must be forgiven
    const r = feed([...repeat(WARMUP_FRAMES, 120), ...repeat(WINDOW, FAST)], judge);
    assert.notEqual(r.verdict, "slow");
  });

  it("the slow-frame threshold sits between normal jitter and one dropped 60 Hz refresh", () => {
    assert.ok(SLOW_FRAME_MS > 20, "ordinary jitter around 16.7 ms must not count");
    assert.ok(SLOW_FRAME_MS < 33, "a dropped refresh (33.3 ms) must count");
  });

  it("jitter around 60 fps (13–20 ms) is not slow, and a steady 30 fps is", () => {
    assert.notEqual(feed(pattern(WARMUP_FRAMES + WINDOW * 3, [13, 20, 16.7, 18, 15])).verdict, "slow");
    assert.equal(feed(repeat(WARMUP_FRAMES + WINDOW * 2, 33.3)).verdict, "slow");
  });
});
