import { singleLine, type InquiryInput } from "./validate";

/**
 * How an inquiry is written into an email / webhook. Pure functions (no I/O, no
 * environment) so the formatting — especially header-injection safety — is unit
 * tested. Delivery itself lives in deliver.ts.
 */

/** One line, no control characters, capped: safe as an email Subject header. */
export function emailSubject(input: InquiryInput): string {
  return singleLine(`Website inquiry: ${input.topic || "General"} — ${input.name}`).slice(0, 200);
}

export function emailBody(input: InquiryInput, siteUrl: string): string {
  return [
    `New website inquiry`,
    ``,
    `Name:    ${input.name}`,
    `Email:   ${input.email || "—"}`,
    `Phone:   ${input.phone || "—"}`,
    `Topic:   ${input.topic || "—"}`,
    input.subject ? `About:   ${input.subject}` : null,
    ``,
    input.message,
    ``,
    `—`,
    `Sent from ${siteUrl}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function webhookPayload(input: InquiryInput, siteUrl: string, receivedAt: string) {
  return { type: "website_inquiry", receivedAt, source: siteUrl, ...input };
}
