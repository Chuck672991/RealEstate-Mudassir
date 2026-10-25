import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { emailBody, emailSubject, webhookPayload } from "./format";
import { createRateLimiter, sanitize, singleLine, validateInquiry, type InquiryInput } from "./validate";

const TOPICS = ["Buying a home", "Selling a home"];

function form(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I would like to talk about buying a first home.",
  consent: "on",
};

describe("validateInquiry", () => {
  it("accepts a complete submission", () => {
    const r = validateInquiry(form(valid), TOPICS);
    assert.equal(r.ok, true);
  });

  it("requires a name, a way to reply, a real message and consent", () => {
    const r = validateInquiry(form({}), TOPICS);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.ok(r.fieldErrors.name);
    assert.ok(r.fieldErrors.email, "email-or-phone error is reported on the email field");
    assert.ok(r.fieldErrors.message);
    assert.ok(r.fieldErrors.consent);
  });

  it("accepts a phone number instead of an email", () => {
    const r = validateInquiry(form({ ...valid, email: "", phone: "(224) 555-0100" }), TOPICS);
    assert.equal(r.ok, true);
  });

  it("rejects malformed email and phone values", () => {
    const r = validateInquiry(form({ ...valid, email: "not-an-email", phone: "12" }), TOPICS);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.ok(r.fieldErrors.email);
    assert.ok(r.fieldErrors.phone);
  });

  it("rejects a topic that is not one of the CMS topics", () => {
    const r = validateInquiry(form({ ...valid, topic: "Free money" }), TOPICS);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.ok(r.fieldErrors.topic);
  });

  it("returns what the visitor typed so the form can be refilled", () => {
    const r = validateInquiry(form({ name: "A", message: "short" }), TOPICS);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.equal(r.values.message, "short");
  });

  it("caps field lengths", () => {
    const r = validateInquiry(form({ ...valid, message: "x".repeat(5000) }), TOPICS);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.data.message.length, 2000);
  });
});

describe("sanitising", () => {
  it("strips control characters but keeps line breaks in the message", () => {
    assert.equal(sanitize("a\u0000b\u0007c\nd", 50), "abc\nd");
  });

  it("collapses a name to a single line (header-injection guard)", () => {
    const r = validateInquiry(form({ ...valid, name: "Eve\r\nBcc: attacker@example.com" }), TOPICS);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.ok(!/[\r\n]/.test(r.data.name));
  });

  it("singleLine removes newlines and tabs", () => {
    assert.equal(singleLine("a\r\nb\tc"), "a b c");
  });
});

describe("email / webhook formatting", () => {
  const input: InquiryInput = {
    name: "Eve\r\nBcc: attacker@example.com",
    email: "eve@example.com",
    phone: "",
    topic: "Buying a home",
    message: "Hello",
    subject: "Condo in Lyons",
  };

  it("never lets a newline reach the Subject header", () => {
    assert.ok(!/[\r\n]/.test(emailSubject(input)));
    assert.ok(emailSubject(input).length <= 200);
  });

  it("includes the property context and the origin in the body", () => {
    const body = emailBody({ ...input, name: "Eve" }, "https://example.com/");
    assert.match(body, /About:\s+Condo in Lyons/);
    assert.match(body, /Sent from https:\/\/example\.com\//);
  });

  it("builds a typed webhook payload", () => {
    const p = webhookPayload({ ...input, name: "Eve" }, "https://example.com/", "2026-01-01T00:00:00.000Z");
    assert.equal(p.type, "website_inquiry");
    assert.equal(p.receivedAt, "2026-01-01T00:00:00.000Z");
    assert.equal(p.email, "eve@example.com");
  });
});

describe("rate limiter", () => {
  it("allows up to the limit inside the window, then refuses", () => {
    const allow = createRateLimiter(3, 1000);
    assert.equal(allow("ip", 0), true);
    assert.equal(allow("ip", 10), true);
    assert.equal(allow("ip", 20), true);
    assert.equal(allow("ip", 30), false);
  });

  it("recovers after the window passes and isolates clients", () => {
    const allow = createRateLimiter(1, 1000);
    assert.equal(allow("a", 0), true);
    assert.equal(allow("a", 500), false);
    assert.equal(allow("b", 500), true);
    assert.equal(allow("a", 1500), true);
  });
});
