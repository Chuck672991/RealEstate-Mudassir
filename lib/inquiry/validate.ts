/**
 * Inquiry form validation — pure, dependency-free, shared by the server action
 * and its tests. All user input is untrusted: everything is trimmed, length-capped
 * and control characters are stripped before it can reach an email or webhook.
 */

export const FIELDS = ["name", "email", "phone", "topic", "message", "consent"] as const;
export type Field = (typeof FIELDS)[number];

export interface InquiryInput {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  /** Optional context, e.g. the property the visitor is asking about. */
  subject: string;
}

export type FieldErrors = Partial<Record<Field, string>>;

export type InquiryState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "unconfigured"; message: string }
  | { status: "error"; message: string; fieldErrors?: FieldErrors; values?: Partial<Record<Field | "subject", string>> };

export const LIMITS = { name: 100, email: 254, phone: 30, topic: 80, message: 2000, subject: 160 } as const;

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Trim, strip control characters (keeps \n and \t), cap length. */
export const sanitize = (value: FormDataEntryValue | null | undefined, max: number): string =>
  (typeof value === "string" ? value : "").replace(CONTROL, "").trim().slice(0, max);

/** Single-line version for subjects / names (no newlines at all). */
export const singleLine = (value: string): string => value.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

export function validateInquiry(
  form: FormData,
  allowedTopics: readonly string[],
): { ok: true; data: InquiryInput } | { ok: false; fieldErrors: FieldErrors; values: Partial<Record<Field | "subject", string>> } {
  const data: InquiryInput = {
    name: singleLine(sanitize(form.get("name"), LIMITS.name)),
    email: singleLine(sanitize(form.get("email"), LIMITS.email)),
    phone: singleLine(sanitize(form.get("phone"), LIMITS.phone)),
    topic: singleLine(sanitize(form.get("topic"), LIMITS.topic)),
    message: sanitize(form.get("message"), LIMITS.message),
    subject: singleLine(sanitize(form.get("subject"), LIMITS.subject)),
  };
  const consent = form.get("consent") === "on" || form.get("consent") === "true";

  const errors: FieldErrors = {};
  if (data.name.length < 2) errors.name = "Please enter your name.";
  if (!data.email && !data.phone) {
    errors.email = "Please give an email address or a phone number so Mudassir can reply.";
  }
  if (data.email && !EMAIL.test(data.email)) errors.email = "That email address doesn’t look right.";
  if (data.phone) {
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15 || !/^[\d\s().+-]+$/.test(data.phone)) {
      errors.phone = "That phone number doesn’t look right.";
    }
  }
  if (data.topic && allowedTopics.length && !allowedTopics.includes(data.topic)) {
    errors.topic = "Please choose one of the listed topics.";
  }
  if (data.message.length < 10) errors.message = "Please tell Mudassir a little about what you’re planning (at least 10 characters).";
  if (!consent) errors.consent = "Please confirm that Mudassir may contact you about this request.";

  if (Object.keys(errors).length) {
    return {
      ok: false,
      fieldErrors: errors,
      values: { name: data.name, email: data.email, phone: data.phone, topic: data.topic, message: data.message, subject: data.subject },
    };
  }
  return { ok: true, data };
}

/** Per-instance sliding-window limiter. Best-effort only (see docs/ABUSE.md). */
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now: number): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    // opportunistic cleanup so the map cannot grow without bound
    if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    return true;
  };
}
