import type { Metadata } from "next";

import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { getAgent } from "@/features/agent";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/** Shown for notFound() inside the site (e.g. a home that is no longer published). */
export default async function NotFound() {
  const agent = await getAgent();
  return <NotFoundContent phone={agent.phone} />;
}
