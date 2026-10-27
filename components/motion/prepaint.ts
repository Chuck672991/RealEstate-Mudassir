/**
 * PRE-PAINT SCRIPT (runs synchronously while the HTML is parsed, before first paint)
 *
 * Sets progressive-enhancement classes on <html> so CSS can start in the right
 * state without a flash and without waiting for hydration (see
 * styles/structure/motion.css for the contract):
 *
 *   js           scripting is available (layout that depends on hydration applies)
 *   motion-ok    the visitor has not asked for reduced motion
 *   intro-on     first visit this tab session AND on the home page → play the intro
 *   data-perf    "lite" when the lighter tier applies from the start (see engine/tier.ts): `?perf=lite`, a
 *                tier already chosen earlier in this session, or Save-Data / a 3G-or-slower connection.
 *                `?perf=full` pins the full tier (benchmarks). The intro is skipped in the lite tier.
 *
 * Watchdog: if the motion layer has not added `motion-ready` within 5s (script
 * blocked, bundle failed, slow network) every enhancement is removed, so content
 * can never remain hidden behind a reveal or an intro overlay.
 *
 * Kept as a plain string (not Function#toString) so the transpiler cannot inject
 * helpers into it.
 */
export const PREPAINT_SCRIPT = `(function(){var d=document.documentElement;try{
d.classList.add('js');
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
d.classList.add('motion-ok');
var tier=null;try{var q=/[?&]perf=(lite|full)/.exec(location.search),c=navigator.connection;
if(q){tier=q[1];if(tier==='lite')sessionStorage.setItem('ms-perf','lite');else sessionStorage.removeItem('ms-perf')}
else if(sessionStorage.getItem('ms-perf')==='lite'||(c&&(c.saveData||/^(slow-2g|2g|3g)$/.test(c.effectiveType||''))))tier='lite'}catch(e){}
if(tier)d.setAttribute('data-perf',tier);
var seen=false;try{seen=!!sessionStorage.getItem('ms-intro')}catch(e){}
if(!seen&&tier!=='lite'&&location.pathname==='/')d.classList.add('intro-on');
setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('motion-ok','intro-on')},5000);
}catch(e){}})();`;
