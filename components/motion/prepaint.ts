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
var seen=false;try{seen=!!sessionStorage.getItem('ms-intro')}catch(e){}
if(!seen&&location.pathname==='/')d.classList.add('intro-on');
setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('motion-ok','intro-on')},5000);
}catch(e){}})();`;
