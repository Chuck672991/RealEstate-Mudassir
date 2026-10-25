import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { CONTENT_TAG } from "@/lib/sanity/fetch";

/**
 * Sanity webhook target — publishing in the Studio expires the cached content so
 * the site updates without a redeploy. Configure the webhook (see README) with:
 *   URL      https://<site>/api/revalidate
 *   Secret   the value of SANITY_REVALIDATE_SECRET
 *   Trigger  create / update / delete on this dataset
 * The signature is verified; an unsigned or wrongly-signed request does nothing.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ message: "Revalidation webhook is not configured." }, { status: 501 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);
  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  }

  revalidateTag(CONTENT_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true, type: body?._type ?? null });
}
