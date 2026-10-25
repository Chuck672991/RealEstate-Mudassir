"use server";

import { headers } from "next/headers";

import { getAgent } from "@/features/agent";
import { getSiteSettings } from "@/features/site";
import { deliverInquiry } from "@/lib/inquiry/deliver";
import { createRateLimiter, validateInquiry, type InquiryState } from "@/lib/inquiry/validate";

// 4 submissions / 10 minutes / client, per server instance. Best-effort: on
// serverless each instance has its own memory, so put a real limiter (or your
// provider's WAF) in front for production traffic.
const allow = createRateLimiter(4, 10 * 60 * 1000);

/** A submission faster than this after the form rendered is almost certainly a bot. */
const MIN_FILL_MS = 2500;

const ok = (agentPhone?: string): InquiryState => ({
  status: "success",
  message: `Thank you — your message has been sent.${agentPhone ? ` If it’s urgent, call ${agentPhone}.` : ""}`,
});

/**
 * Server Action for the contact form. Treated as a public endpoint: validate
 * everything, rate-limit, honeypot, never log personal data, return minimal state.
 */
export async function submitInquiry(_previous: InquiryState, form: FormData): Promise<InquiryState> {
  const [agent, settings, h] = await Promise.all([getAgent(), getSiteSettings(), headers()]);
  const phone = agent.phone?.display;

  // Honeypot: real people never see or fill this field. Pretend success so bots learn nothing.
  if (typeof form.get("website") === "string" && (form.get("website") as string).trim() !== "") return ok(phone);

  // Mistakes a person can fix come first: a visitor who submits an empty or partly
  // filled form straight after opening it must see which fields need attention, not
  // an anti-bot message. Validation has no side effects, so it is safe to run first.
  const result = validateInquiry(form, settings.inquiryTopics);
  if (!result.ok) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: result.fieldErrors,
      values: result.values,
    };
  }

  // Advisory only: the token is written by client JS, so visitors without JS (the
  // form still posts) simply have none. When present, an implausibly fast fill of an
  // otherwise valid form is refused.
  const started = Number(form.get("startedAt"));
  if (Number.isFinite(started) && started > 0 && started <= Date.now() && Date.now() - started < MIN_FILL_MS) {
    return {
      status: "error",
      message: "That was a little quick — please check your details and send again.",
      values: result.data,
    };
  }

  // Only attempts that would actually be delivered count against the limit.
  const client = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  if (!allow(client, Date.now())) {
    return {
      status: "error",
      message: `You’ve sent several messages recently. Please wait a few minutes${phone ? ` or call ${phone}` : ""}.`,
      values: result.data,
    };
  }

  const delivery = await deliverInquiry(result.data);
  if (delivery.kind === "delivered") return ok(phone);
  if (delivery.kind === "unconfigured") {
    return {
      status: "unconfigured",
      message: `This form isn’t connected to an inbox yet, so your message was not sent.${phone ? ` Please call ${phone} instead.` : " Please try again later."}`,
    };
  }
  return {
    status: "error",
    message: `We couldn’t send your message just now.${phone ? ` Please try again, or call ${phone}.` : " Please try again."}`,
    values: {
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      topic: result.data.topic,
      message: result.data.message,
      subject: result.data.subject,
    },
  };
}
