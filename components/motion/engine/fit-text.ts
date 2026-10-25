/**
 * Fit text (reference §B.2 “fit text”): sizes a headline so the word fills its
 * container, e.g. the giant closing word. The CSS gives a close fluid default, so
 * this only refines it (no visible jump) — and it re-fits on resize and once the
 * display font has loaded.
 */
export function initFitText(): () => void {
  const items = Array.from(document.querySelectorAll<HTMLElement>("[data-fit-text]"));
  if (!items.length) return () => {};
  const REFERENCE = 100; // px

  const fit = (el: HTMLElement) => {
    const host = el.parentElement;
    if (!host) return;
    const styles = getComputedStyle(host);
    const available = host.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    if (available <= 0) return;
    const previous = el.style.fontSize;
    el.style.fontSize = `${REFERENCE}px`;
    const width = el.getBoundingClientRect().width;
    el.style.fontSize = previous;
    if (width > 0) el.style.fontSize = `${Math.floor(((REFERENCE * available) / width) * 100) / 100}px`;
  };

  const run = () => items.forEach(fit);
  const observer = new ResizeObserver(run);
  const hosts = new Set(items.map((el) => el.parentElement).filter((n): n is HTMLElement => !!n));
  hosts.forEach((host) => observer.observe(host));
  let cancelled = false;
  void document.fonts?.ready.then(() => {
    if (!cancelled) run();
  });
  run();

  return () => {
    cancelled = true;
    observer.disconnect();
    items.forEach((el) => (el.style.fontSize = ""));
  };
}
