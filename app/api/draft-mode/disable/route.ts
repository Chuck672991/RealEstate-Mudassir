import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/** Leaves Draft Mode and returns to a same-site path (default “/”). */
export async function GET(request: Request) {
  (await draftMode()).disable();
  const url = new URL(request.url);
  const to = url.searchParams.get("redirect") ?? "/";
  // only same-site relative paths: never an open redirect
  const safe = to.startsWith("/") && !to.startsWith("//") && !to.includes("\\") ? to : "/";
  return NextResponse.redirect(new URL(safe, url));
}
