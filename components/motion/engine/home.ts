import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

import { WINDOWS_ALIGNED, WINDOWS_MERGED, WINDOWS_START, windowsPolygon } from "./closing-geometry";
import { MQ, MANUAL_REVEAL, noop, q, qa, readBezier } from "./config";
import { promoteWhileNear } from "./promote";
import { revealWhenVisible } from "./reveal";
import { isLite, whenLite } from "./tier";
import { getLenis, scrollToTarget } from "./scroll";

/**
 * HOME PAGE CHOREOGRAPHY — the scroll-linked (“scrubbed”) stage changes.
 *
 * Triggered text reveals are CSS (see engine/reveal.ts); GSAP + ScrollTrigger are
 * used ONLY for motion that must follow the scrollbar. Every stage is a native
 * `position: sticky` panel inside a tall area sized in CSS (styles/structure/
 * sections/*.css), so ScrollTrigger never has to add pin-spacers.
 *
 *   hero      dolly: type and wall drift upward, then the wall zooms ×2 into the doorway
 *   arch      the three words fan apart along the arc
 *   areas     vertical scroll → sideways travel through the communities (≥ 992px)
 *   horizon   the aerial photo slides ±15 % and settles from 1.15× to 1× under the clouds
 *   drift     paired photo columns and flower sprays drift in opposite directions
 *   sold      the stage scales ×2 and fades as the next arch panel rises over it
 *   cta       two windows merge onto one photograph, the stage zooms (flowers fly outward),
 *             then irises to the footer
 *   parallax  the timber plate in the About section
 *
 * Every block lives in `gsap.matchMedia()` so it is created and reverted
 * automatically when the viewport or the reduced-motion preference changes, and the
 * conditions repeat the CSS conditions exactly.
 */

type Gsap_ = typeof Gsap;
type ScrollTrigger_ = typeof ScrollTriggerType;

interface Kit {
  gsap: Gsap_;
  ScrollTrigger: ScrollTrigger_;
}

const OK = MQ.noReduced;
const PINNED = `${OK} and ${MQ.pinnable}`; // hero dolly, sold stage
const WIDE = `${MQ.desktop} and ${MQ.tall} and ${OK}`; // sideways chapter
const PINNED_CTA = `${MQ.desktop} and ${MQ.tall} and ${OK}`;
const UNPINNED_CTA = `${MQ.mobile}, ${MQ.short}, ${MQ.reduced}`;

/** The plugins are registered once per page load; later runs of the home choreography (a visitor coming back) must not touch it. */
let pluginsRegistered = false;

/**
 * Register GSAP plugins WITHOUT ScrollTrigger's endless idle frame loop, in Chromium.
 *
 * `ScrollTrigger.register()` starts `_rafBugFix`: an EMPTY requestAnimationFrame loop that never ends
 * ("in some browsers (like Firefox), screen repaints weren't consistent unless we had SOMETHING queued
 * up in requestAnimationFrame()"). In Chrome that one empty loop makes every transform animation on the
 * page cost a main-thread style recalculation per frame — here the header badge spins forever, so an idle,
 * parked tab did 60 recalcs/s and ≈ 35 ms/s of main-thread time (0 and 0.4 ms/s without the loop; measured
 * in headed and headless Chrome, docs/PERFORMANCE.md). So in Chromium the one rAF call made while the plugin
 * registers is dropped. Firefox and Safari keep the library's behaviour untouched.
 *
 * Three things keep that safe. (1) It is done ONCE per page load: ScrollTrigger registers itself only the first time,
 * so nothing starts the loop again, and a later call (the visitor navigated away and came back) must not intercept
 * anything. (2) GSAP's own ticker is woken first: `registerPlugin` wakes a sleeping ticker, and that wake-up is ALSO a
 * requestAnimationFrame call — dropped by mistake it leaves the ticker believing it is running with no frame scheduled,
 * so every scrubbed animation on the page stands still until a reload (this happened in the first version of this
 * function, whenever the home page was initialised again after GSAP had gone to sleep). With the ticker already
 * awake, the only call registration can make is the one being dropped. (3) A watchdog: two frames later the ticker's
 * frame counter must have moved, and if it has not the ticker is restarted. If a library update ever made the
 * registration call rAF more than once, the dropped callback is re-queued, i.e. back to the stock behaviour.
 */
function registerPlugins(gsap: Gsap_, plugins: object[]): void {
  if (pluginsRegistered) return void gsap.registerPlugin(...plugins);
  pluginsRegistered = true;

  // Chrome, Edge, Opera, Samsung Internet… (and HeadlessChrome). Not iOS "Chrome" (CriOS, which is WebKit), Firefox or Safari.
  const brands = (navigator as Navigator & { userAgentData?: { brands?: Array<{ brand: string }> } }).userAgentData?.brands;
  const chromium = !!brands?.some((b) => b.brand === "Chromium") || /Chrom(e|ium)\//.test(navigator.userAgent);
  if (!chromium) return void gsap.registerPlugin(...plugins);

  gsap.ticker.wake(); // awake BEFORE the window opens, so registration cannot make the ticker request a frame inside it
  const nativeRaf = window.requestAnimationFrame;
  let dropped: FrameRequestCallback | null = null;
  let calls = 0;
  window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    calls += 1;
    if (calls === 1) {
      dropped = callback;
      return 0;
    }
    return nativeRaf.call(window, callback);
  };
  try {
    gsap.registerPlugin(...plugins);
  } finally {
    window.requestAnimationFrame = nativeRaf;
  }
  if (calls > 1 && dropped) nativeRaf.call(window, dropped);

  const frame = gsap.ticker.frame;
  nativeRaf.call(window, () =>
    nativeRaf.call(window, () => {
      if (gsap.ticker.frame === frame) gsap.ticker.wake();
    }),
  );
}

export async function initHomeChoreography(signal: AbortSignal): Promise<() => void> {
  const [{ gsap }, { ScrollTrigger }, { CustomEase }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/CustomEase"),
  ]);
  // The component may have unmounted (or React's dev double-mount cleaned up) while
  // the chunks were loading. A stale run must create nothing: its late teardown would
  // otherwise revert the inline styles a newer run had just set.
  if (signal.aborted) return noop;
  registerPlugins(gsap, [ScrollTrigger, CustomEase]);
  gsap.ticker.lagSmoothing(0);

  // Easings come from the active theme's tokens, so a theme change re-tunes motion.
  CustomEase.create("msIn", readBezier("--ease-in", "0.5,0,0.75,0"));
  CustomEase.create("msInOut", readBezier("--ease-in-out", "0.75,0,0.25,1"));
  CustomEase.create("msSoft", readBezier("--ease-soft", "0.25,0.1,0.25,1"));
  CustomEase.create("msHScroll", readBezier("--ease-hscroll", "0.25,0,0.75,1"));

  const kit: Kit = { gsap, ScrollTrigger };
  const mm = gsap.matchMedia();

  // The scenes that tell the story (the hero dolly, the sold stage, the sideways chapter, the closing zoom).
  mm.add(PINNED, () => heroDolly(kit));
  mm.add(PINNED, () => soldStage(kit));
  mm.add(WIDE, () => areasChapter(kit));
  mm.add(PINNED_CTA, () => closingScene(kit));
  mm.add(UNPINNED_CTA, () => closingSceneFlat());

  // The purely decorative scrubs: skipped in the lite tier, and reverted (back to their resting state) if the
  // page is judged too slow for them while it is running (engine/tier.ts).
  const decor = gsap.matchMedia();
  if (!isLite()) {
    decor.add(OK, () => archSpread(kit));
    decor.add(OK, () => parallaxPlates(kit));
    decor.add(`${MQ.desktop} and ${OK}`, () => horizonParallax(kit));
    decor.add(`${MQ.desktop} and ${OK}`, () => drifts(kit));
  }
  const offLite = whenLite(() => decor.revert());

  // Keep ScrollTrigger in step with the smooth scroller and with late layout changes.
  const lenis = getLenis();
  const onLenis = () => ScrollTrigger.update();
  lenis?.on("scroll", onLenis);

  const refresh = () => ScrollTrigger.refresh();
  let cancelled = false;
  void document.fonts?.ready.then(() => !cancelled && refresh());
  window.addEventListener("load", refresh);

  return () => {
    cancelled = true;
    window.removeEventListener("load", refresh);
    lenis?.off("scroll", onLenis);
    offLite();
    decor.revert();
    decor.kill();
    mm.revert();
    mm.kill();
  };
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */

function heroDolly({ gsap }: Kit): () => void {
  const area = q(".hero__area");
  const bg = q("[data-hero-bg]");
  const stage = q("[data-hero-stage]");
  if (!area || !bg || !stage) return noop;
  const desktop = window.matchMedia(MQ.desktop).matches;

  const timeline = gsap.timeline({
    scrollTrigger: { trigger: area, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
  });

  // Desktop: the type drifts up faster than the wall (parallax) for the first 60%…
  if (desktop) {
    timeline
      .fromTo(
        stage,
        { y: 0 },
        { y: () => -(1.25 * bg.offsetHeight - window.innerHeight), ease: "msSoft", duration: 0.6 },
      )
      .fromTo(
        bg,
        { y: 0 },
        { y: () => -(bg.offsetHeight - window.innerHeight), ease: "msSoft", duration: 0.6 },
        "<",
      );
  }
  // …then the wall zooms ×2 into the doorway about its lower centre, accelerating.
  // Mobile has no drift: the zoom spans the whole (shorter) area.
  timeline.fromTo(
    bg,
    { scale: 1 },
    { scale: 2, ease: "msIn", duration: 0.6, transformOrigin: "50% 75%" },
    desktop ? "-=0.2" : ">",
  );

  const demote = promoteWhileNear(area, [bg, stage]);
  return () => {
    demote();
    gsap.set([bg, stage], { clearProps: "transform" });
  };
}

/* ── Arch intro ───────────────────────────────────────────────────────────── */

function archSpread({ gsap }: Kit): void {
  const words = q(".arc-words");
  const section = q(".arch-intro");
  if (!words || !section) return;
  const mobile = window.matchMedia(MQ.mobile).matches;

  gsap.fromTo(
    words,
    { "--spread": mobile ? "54deg" : "36deg" },
    {
      "--spread": mobile ? "64deg" : "56deg",
      ease: "none",
      scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
    },
  );
}

/* ── Parallax ─────────────────────────────────────────────────────────────── */

function parallaxPlates({ gsap }: Kit): () => void {
  const demotions: Array<() => void> = [];
  for (const plate of qa("[data-parallax='plate']")) {
    const section = plate.closest("section") ?? plate.parentElement;
    if (!section) continue;
    demotions.push(promoteWhileNear(section, [plate]));
    gsap.fromTo(
      plate,
      { yPercent: -11 },
      { yPercent: 11, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.5 } },
    );
  }
  return () => demotions.forEach((demote) => demote());
}

/* ── Recently sold stage ──────────────────────────────────────────────────── */

function soldStage({ gsap }: Kit): () => void {
  const area = q("[data-pin-area='sold']");
  const wrap = q(".sold-show");
  const plates = qa(".sold-stage__plate");
  if (!area || !wrap || !plates.length) return noop;

  gsap
    .timeline({ scrollTrigger: { trigger: area, start: "top top", end: "bottom bottom", scrub: true } })
    .fromTo(plates, { scale: 1 }, { scale: 2, ease: "msIn", transformOrigin: "50% 60%" })
    .fromTo(wrap, { opacity: 1 }, { opacity: 0, ease: "msIn" }, "<");

  return promoteWhileNear(area, plates);
}

/* ── Horizon: photo parallax under the clouds ─────────────────────────────── */

function horizonParallax({ gsap }: Kit): () => void {
  const section = q(".horizon");
  const bg = q("[data-horizon-bg]");
  const photo = q("[data-horizon-photo]");
  if (!section || !bg || !photo) return noop;

  // The photo wrapper slides a little faster than the page, so the clouds (which scroll 1:1
  // and drift on their own) separate from the landscape behind them.
  gsap.fromTo(
    bg,
    { yPercent: -15 },
    { yPercent: 15, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.5 } },
  );
  // …and the photo settles from slightly zoomed to normal, about its bottom edge.
  gsap.fromTo(
    photo,
    { scale: 1.15, transformOrigin: "50% 100%" },
    { scale: 1, ease: "msSoft", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom bottom", scrub: 0.25 } },
  );

  return promoteWhileNear(section, [bg, photo]);
}

/* ── Drift: paired columns and flower sprays move against each other ──────── */

function drifts({ gsap }: Kit): () => void {
  const demotions: Array<() => void> = [];
  // `fwd` rises −10 % → +10 % of the element's own height across its pass through the viewport,
  // `rev` the reverse: neighbouring elements cross each other and separate.
  for (const el of qa("[data-drift], .flower[data-parallax]")) {
    const dir = (el.dataset.drift ?? el.dataset.parallax) === "rev" ? -1 : 1;
    demotions.push(promoteWhileNear(el, [el], "50%"));
    gsap.fromTo(
      el,
      { yPercent: -10 * dir },
      { yPercent: 10 * dir, ease: "none", scrollTrigger: { trigger: el, start: "top 125%", end: "bottom -25%", scrub: 0.5 } },
    );
  }
  return () => demotions.forEach((demote) => demote());
}

/* ── Areas: vertical scroll → horizontal travel ───────────────────────────── */

function areasChapter({ gsap, ScrollTrigger }: Kit): () => void {
  const area = q("[data-hscroll-area]");
  const rail = q("[data-hscroll-track]");
  if (!area || !rail) return noop;

  const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth);
  // scroll area height ≈ travel distance + one viewport (so scroll and travel are 1:1)
  const size = () => {
    area.style.height = `${distance() + window.innerHeight}px`;
  };
  size();

  gsap.to(rail, {
    x: () => -distance(),
    ease: "msHScroll",
    scrollTrigger: {
      trigger: area,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.25,
      invalidateOnRefresh: true,
      onRefreshInit: size,
    },
  });

  // The flower sprays in the chapter ride the same scroll, sideways against the rail (never
  // vertically: each is clipped at the stage's top or bottom edge, and that edge must stay put).
  const travel = { trigger: area, start: "top top", end: "bottom bottom", scrub: 0.25 };
  const flower = (name: string) => q(`.flower[data-travel="${name}"]`, rail);
  const intro = flower("intro");
  const mid = flower("mid");
  const end = flower("end");
  if (intro) gsap.fromTo(intro, { xPercent: -12 }, { xPercent: 16, ease: "none", scrollTrigger: travel });
  if (mid) gsap.fromTo(mid, { xPercent: 0 }, { xPercent: -25, ease: "none", scrollTrigger: travel });
  if (end) gsap.fromTo(end, { xPercent: 12 }, { xPercent: -14, ease: "none", scrollTrigger: travel });

  // Big numerals travel a little faster than their panels: depth without extra markup.
  gsap.fromTo(
    qa(".area-panel__count", rail),
    { x: 70 },
    { x: -70, ease: "none", scrollTrigger: { trigger: area, start: "top top", end: "bottom bottom", scrub: 0.25 } },
  );
  const demote = promoteWhileNear(area, [rail, intro, mid, end, ...qa(".area-panel__count", rail)]);

  // Keyboard: focusing a control inside the rail must scroll the page to where that
  // panel is on screen (the rail only moves with vertical scroll).
  const onFocus = (event: FocusEvent) => {
    const panel = (event.target as Element).closest<HTMLElement>(".area-panel");
    if (!panel) return;
    const travel = distance();
    if (!travel) return;
    const x = Math.min(Math.max(panel.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft || "0"), 0), travel);
    const scrollable = area.offsetHeight - window.innerHeight;
    const top = area.getBoundingClientRect().top + window.scrollY + (x / travel) * scrollable;
    scrollToTarget(top, { immediate: true });
  };
  rail.addEventListener("focusin", onFocus);

  return () => {
    demote();
    rail.removeEventListener("focusin", onFocus);
    area.style.height = "";
    gsap.set(rail, { clearProps: "transform" });
    ScrollTrigger.refresh();
  };
}

/* ── Closing scene → footer ───────────────────────────────────────────────── */

/**
 * One photograph seen through TWO portrait windows (a single clip-path polygon; the geometry is
 * in closing-geometry.ts).
 *
 * The windows start side by side on the cream page, the left one low and the right one high;
 * they slide into line (aligned: two equal portrait windows with a hairline gap, as in the
 * reference), the gap closes so they read as one wide picture, and the stage zooms until the
 * picture fills the screen (0 → 0.68). The giant word and contact actions then reveal; finally
 * the scene shrinks to an arched window over the top half while the footer arrives beneath it
 * (0.74 → 1).
 */
function closingScene({ gsap }: Kit): () => void {
  const wrap = q("[data-pin-area='cta']");
  const cta = q("[data-footer-clip]");
  const plate = q(".cta__plate");
  const window_ = q("[data-cta-window]");
  const content = q("[data-cta-content]");
  const footer = q("[data-footer-layer]");
  const footerInner = footer ? q(".site-footer__inner", footer) : null;
  const flowerL = q(".flower--windows-left", plate ?? undefined);
  const flowerR = q(".flower--windows-right", plate ?? undefined);
  const flowers = [flowerL, flowerR];
  if (!wrap || !cta || !plate || !window_ || !content || !footer || !footerInner) return noop;

  const texts = qa("[data-reveal]", content);
  let shown = false;

  const start = windowsPolygon(WINDOWS_START);
  const aligned = windowsPolygon(WINDOWS_ALIGNED);
  const merged = windowsPolygon(WINDOWS_MERGED);
  // the final arch: 40% of the viewport wide, round-topped, over the upper half
  const arch = () => {
    const radius = Math.round(window.innerWidth * 0.2);
    return `inset(7% 30% 50% 30% round ${radius}px ${radius}px 0px 0px)`;
  };
  const flat = "inset(0% 0% 0% 0% round 0px 0px 0px 0px)";

  gsap.set(window_, { clipPath: start });
  // the veil that keeps the words readable over the photograph appears with the zoom: the stage
  // is cream, so it must not show as dark bands before the scene fills the screen
  const veil = { v: 0 };
  const setVeil = () => content.style.setProperty("--veil", String(veil.v));
  gsap.set(content, { scale: 0.75, transformOrigin: "50% 0%" });
  setVeil();
  // Invisible until the iris, and not hit-testable: the header-tone hit-test and the
  // pointer must both see through it to the scene and the page.
  gsap.set(footer, { opacity: 0, pointerEvents: "none" });
  gsap.set(footerInner, { opacity: 0, scale: 0.75 });

  const timeline = gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          // text reveals once the scene fills the screen, hides again if you scroll back
          if (!shown && p >= 0.66) {
            shown = true;
            texts.forEach((n) => n.setAttribute("data-revealed", ""));
          } else if (shown && p < 0.6) {
            shown = false;
            texts.forEach((n) => n.removeAttribute("data-revealed"));
          }
        },
      },
    })
    // 0–36: the two windows slide into line (the left rises, the right drops)
    .to(window_, { clipPath: aligned, duration: 36 }, 0)
    // 36–43: the hairline gap closes; the two windows read as one picture
    .to(window_, { clipPath: merged, duration: 7 }, 36)
    // 43–68: the whole stage zooms until the scene fills the viewport
    .to(plate, { scale: 1.84, ease: "msInOut", duration: 25 }, 43)
    .to(content, { scale: 1, ease: "msInOut", duration: 25 }, 43)
    .to(veil, { v: 1, ease: "none", duration: 8, onUpdate: setVeil }, 62)
    // the flower pair swells and is thrown out past the left and right edges (on top of the stage's own zoom)
    .to(flowerL ?? [], { scale: 1.84, xPercent: -60, ease: "msInOut", duration: 25 }, 43)
    .to(flowerR ?? [], { scale: 1.84, xPercent: 60, ease: "msInOut", duration: 25 }, 43)
    // belt and braces: whatever is left of them at the end of the zoom is gone before the iris
    .to([flowerL, flowerR].filter(Boolean), { autoAlpha: 0, duration: 4 }, 66)
    // 74–100: the scene shrinks to an arch; the footer arrives beneath it
    .fromTo(cta, { clipPath: flat }, { clipPath: arch, duration: 26 }, 74)
    // the closing words and buttons clear away so the arch shows only the scene
    .to(content, { autoAlpha: 0, duration: 10 }, 74)
    .to(footer, { opacity: 1, duration: 4 }, 74)
    .set(footer, { pointerEvents: "auto" }, 78)
    .to(footerInner, { opacity: 1, scale: 1, duration: 26 }, 74);

  // Keyboard: the footer sits (invisibly) behind the scene until the end of the
  // scroll, and the closing words are hidden until the scene fills the screen.
  // Focusing a link in either scrolls the page to where it can be seen.
  const scrollToProgress = (progress: number) => {
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    scrollToTarget(top + progress * (wrap.offsetHeight - window.innerHeight), { immediate: true });
  };
  const onFooterFocus = () => scrollToProgress(1);
  const onContentFocus = () => {
    if (!shown) scrollToProgress(0.7);
  };
  footer.addEventListener("focusin", onFooterFocus);
  content.addEventListener("focusin", onContentFocus);
  // Deliberately NOT promoted (will-change): measured at 12× CPU slowdown it saved only ≈ 6 % of main-thread time per
  // frame here and no slow frames, while a promoted layer keeps its raster scale — and this scene scales a full-bleed
  // photograph to ×1.84 and the giant type from ×0.75 to ×1, which came out ≈ 4–7 % softer (docs/PERFORMANCE.md).

  return () => {
    footer.removeEventListener("focusin", onFooterFocus);
    content.removeEventListener("focusin", onContentFocus);
    timeline.scrollTrigger?.kill();
    timeline.kill();
    gsap.set([window_, content, footer, footerInner, cta, plate, ...flowers.filter(Boolean)], { clearProps: "all" });
    texts.forEach((n) => n.removeAttribute("data-revealed"));
  };
}

/** Without the pinned scene (mobile, short screens, reduced motion) the same text reveals on entry. */
function closingSceneFlat(): () => void {
  const nodes = qa(`${MANUAL_REVEAL} [data-reveal]`);
  revealWhenVisible(nodes);
  return noop;
}
