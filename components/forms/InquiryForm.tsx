"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import { submitInquiry } from "@/app/actions/inquiry";
import type { Field, InquiryState } from "@/lib/inquiry/validate";

const initial: InquiryState = { status: "idle" };

interface Props {
  topics: string[];
  phone?: { display: string; href: string };
  /** Preselect a topic (e.g. from a property page). */
  defaultTopic?: string;
  /** Extra context sent with the message, e.g. "Condo in Lyons". */
  subject?: string;
  /** Called when the visitor has successfully sent a message. */
  onDone?: () => void;
  headingLevel?: "h2" | "h3";
}

/**
 * The inquiry form (used on /contact and in the “Book a call” dialog).
 *
 * Accessibility: every control has a visible <label>; errors are linked with
 * aria-describedby + aria-invalid; a summary receives focus after a failed submit
 * (role=alert) and a confirmation receives focus after a successful one
 * (role=status). Anti-abuse: a hidden honeypot and a minimum-fill-time token,
 * validated again on the server (the client checks are only a convenience).
 */
export function InquiryForm({ topics, phone, defaultTopic, subject, onDone, headingLevel = "h2" }: Props) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const uid = useId();
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const Heading = headingLevel;

  // Written on the client only (the clock must not be read while prerendering). It
  // is set as the input's *default* value so React's automatic post-submit form
  // reset restores it instead of blanking it.
  useEffect(() => {
    if (startedRef.current) startedRef.current.defaultValue = String(Date.now());
  }, []);

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
    if (state.status === "success" || state.status === "unconfigured") doneRef.current?.focus();
    if (state.status === "success") onDone?.();
  }, [state, onDone]);

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const id = (f: string) => `${uid}-${f}`;
  const err = (f: Field) => errors[f];
  const describe = (f: Field, hint?: string) =>
    [err(f) ? `${id(f)}-err` : null, hint ? `${id(f)}-hint` : null].filter(Boolean).join(" ") || undefined;

  if (state.status === "success" || state.status === "unconfigured") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className={`inquiry-done inquiry-done--${state.status}`}>
        <Heading className="t-display t-h5">{state.status === "success" ? "Message sent" : "Not sent yet"}</Heading>
        <p className="t-body">{state.message}</p>
        {state.status === "unconfigured" && phone ? (
          <a className="pill-btn t-label" href={phone.href}>
            Call {phone.display}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="inquiry" noValidate>
      {state.status === "error" ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="inquiry__summary t-small">
          {state.message}
        </div>
      ) : null}

      {phone ? (
        <p className="inquiry__phone t-small">
          Prefer to talk? <a href={phone.href}>Call {phone.display}</a>.
        </p>
      ) : null}

      <div className="field">
        <label htmlFor={id("name")} className="t-label">
          Your name <span aria-hidden="true">*</span>
        </label>
        <input
          id={id("name")}
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={100}
          defaultValue={values.name}
          aria-invalid={err("name") ? true : undefined}
          aria-describedby={describe("name")}
        />
        {err("name") ? (
          <p id={`${id("name")}-err`} className="field__error t-small">
            {err("name")}
          </p>
        ) : null}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={id("email")} className="t-label">
            Email
          </label>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            defaultValue={values.email}
            aria-invalid={err("email") ? true : undefined}
            aria-describedby={describe("email", "Email or phone — at least one.")}
          />
          <p id={`${id("email")}-hint`} className="field__hint t-small t-muted">
            Email or phone — at least one.
          </p>
          {err("email") ? (
            <p id={`${id("email")}-err`} className="field__error t-small">
              {err("email")}
            </p>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor={id("phone")} className="t-label">
            Phone
          </label>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            defaultValue={values.phone}
            aria-invalid={err("phone") ? true : undefined}
            aria-describedby={describe("phone")}
          />
          {err("phone") ? (
            <p id={`${id("phone")}-err`} className="field__error t-small">
              {err("phone")}
            </p>
          ) : null}
        </div>
      </div>

      {topics.length ? (
        <div className="field">
          <label htmlFor={id("topic")} className="t-label">
            What’s this about?
          </label>
          <select
            id={id("topic")}
            name="topic"
            defaultValue={values.topic ?? defaultTopic ?? ""}
            aria-invalid={err("topic") ? true : undefined}
            aria-describedby={describe("topic")}
          >
            <option value="">Choose a topic…</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {err("topic") ? (
            <p id={`${id("topic")}-err`} className="field__error t-small">
              {err("topic")}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor={id("message")} className="t-label">
          Your message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={id("message")}
          name="message"
          rows={5}
          required
          maxLength={2000}
          defaultValue={values.message}
          aria-invalid={err("message") ? true : undefined}
          aria-describedby={describe("message")}
        />
        {err("message") ? (
          <p id={`${id("message")}-err`} className="field__error t-small">
            {err("message")}
          </p>
        ) : null}
      </div>

      <div className="field field--check">
        <input
          id={id("consent")}
          name="consent"
          type="checkbox"
          required
          aria-invalid={err("consent") ? true : undefined}
          aria-describedby={describe("consent")}
        />
        <label htmlFor={id("consent")} className="t-small">
          I agree that Mudassir may contact me about this request. <span aria-hidden="true">*</span>
        </label>
        {err("consent") ? (
          <p id={`${id("consent")}-err`} className="field__error t-small">
            {err("consent")}
          </p>
        ) : null}
      </div>

      {/* Honeypot (hidden from people and assistive tech) + minimum-fill-time token. */}
      <div className="field--trap" aria-hidden="true">
        <label htmlFor={id("website")}>Leave this field empty</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />
      <input type="hidden" name="subject" value={values.subject ?? subject ?? ""} />

      <p className="t-small t-muted">Fields marked * are required.</p>

      <button type="submit" className="pill-btn t-label inquiry__submit" disabled={pending} aria-disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
