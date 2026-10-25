import { cacheLife } from "next/cache";

/**
 * The current year. `new Date()` is request-time data, so under Cache Components
 * it must be cached rather than computed while prerendering the shell; it then
 * refreshes at most once a day.
 */
export async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
