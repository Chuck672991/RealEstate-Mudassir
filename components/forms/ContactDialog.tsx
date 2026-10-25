"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PhoneDTO } from "@/types/content";

import { InquiryForm } from "./InquiryForm";

interface OpenDetail {
  topic?: string;
  subject?: string;
}

/**
 * “Book a call” modal. Progressive enhancement: every trigger is a normal link
 * to /contact (data-open-contact); with JS the click is intercepted and this
 * native <dialog> opens instead (focus trap, Esc and inert background come from
 * showModal()). Programmatic opens use the `ms:open-contact` event.
 */
export function ContactDialog({
  topics,
  phone,
  name,
}: {
  topics: string[];
  phone?: PhoneDTO;
  name: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState<OpenDetail>({});
  const [key, setKey] = useState(0);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const open = useCallback((d: OpenDetail = {}) => {
    setDetail(d);
    setKey((k) => k + 1); // fresh form each time
    ref.current?.showModal();
    window.dispatchEvent(new CustomEvent("ms:scroll-lock"));
  }, []);

  const close = useCallback(() => ref.current?.close(), []);

  useEffect(() => {
    const dialog = ref.current;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-open-contact]");
      if (!el) return;
      e.preventDefault();
      lastTrigger.current = el;
      open({ topic: el.dataset.topic, subject: el.dataset.subject });
    };
    const onEvent = (e: Event) => open((e as CustomEvent<OpenDetail>).detail ?? {});
    const onClose = () => {
      window.dispatchEvent(new CustomEvent("ms:scroll-unlock"));
      lastTrigger.current?.focus?.();
    };
    document.addEventListener("click", onClick);
    window.addEventListener("ms:open-contact", onEvent);
    dialog?.addEventListener("close", onClose);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("ms:open-contact", onEvent);
      dialog?.removeEventListener("close", onClose);
      if (dialog?.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="contact-dialog"
      data-bg="color"
      aria-labelledby="contact-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="contact-dialog__card">
        <button type="button" className="contact-dialog__close t-label" onClick={close}>
          <span className="sr-only">Close</span>
          <span className="menu-btn__x" aria-hidden="true" />
        </button>
        <div className="contact-dialog__intro">
          <h2 id="contact-dialog-title" className="t-accent t-accent-lg">
            Book a call
          </h2>
          <p className="t-small t-muted">Send {name} a few details about what you’re planning.</p>
        </div>
        <div className="contact-dialog__form">
          {/* Mounted on first open only, so closed pages carry no form markup; remounted on each open. */}
          {key > 0 ? (
            <InquiryForm
              key={key}
              topics={topics}
              phone={phone}
              defaultTopic={detail.topic}
              subject={detail.subject}
              headingLevel="h3"
            />
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
