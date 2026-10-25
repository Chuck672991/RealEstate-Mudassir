import "server-only";

import { absoluteUrl } from "@/lib/site";

import { emailBody, emailSubject, webhookPayload } from "./format";
import type { InquiryInput } from "./validate";

/**
 * Where inquiries go. Inquiries contain personal data, so they are deliberately
 * NOT written to the Sanity dataset (a public dataset is readable by anyone).
 * Configure at least one transport in the server environment:
 *
 *   RESEND_API_KEY + INQUIRY_TO_EMAIL + INQUIRY_FROM_EMAIL   email via Resend
 *   INQUIRY_WEBHOOK_URL                                      any HTTPS webhook
 *
 * Only this module reads those variables (Data Access Layer rule).
 */
export type DeliveryResult =
  | { kind: "delivered" }
  | { kind: "unconfigured" }
  | { kind: "failed" };

const TIMEOUT_MS = 8000;

async function post(url: string, init: RequestInit): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function deliverInquiry(input: InquiryInput): Promise<DeliveryResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.INQUIRY_TO_EMAIL?.trim();
  const from = process.env.INQUIRY_FROM_EMAIL?.trim();
  const webhook = process.env.INQUIRY_WEBHOOK_URL?.trim();

  const hasEmail = !!(resendKey && to && from);
  if (!hasEmail && !webhook) return { kind: "unconfigured" };

  const results: boolean[] = [];

  if (hasEmail) {
    results.push(
      await post("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          // reply_to lets the agent answer directly. Only set when the address validated.
          ...(input.email ? { reply_to: input.email } : {}),
          subject: emailSubject(input),
          text: emailBody(input, absoluteUrl("/")),
        }),
      }),
    );
  }

  if (webhook) {
    results.push(
      await post(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload(input, absoluteUrl("/"), new Date().toISOString())),
      }),
    );
  }

  // Success if ANY configured transport accepted it.
  return results.some(Boolean) ? { kind: "delivered" } : { kind: "failed" };
}
