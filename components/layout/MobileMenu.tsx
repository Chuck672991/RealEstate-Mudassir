"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { SmartLink } from "@/components/ui/SmartLink";
import { Monogram } from "@/components/ui/Monogram";
import type { LinkDTO, PhoneDTO } from "@/types/content";

/**
 * Full-screen menu for narrow viewports.
 *
 * Built on the native <dialog> element: showModal() gives us a focus trap,
 * Esc-to-close, an inert background and top-layer stacking for free. We add:
 * backdrop click, close-on-navigate, focus return (native), and scroll-lock
 * events so the smooth-scroll layer pauses while the menu is open.
 */
export function MobileMenu({ links, phone, name }: { links: LinkDTO[]; phone?: PhoneDTO; name: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const id = useId();

  const close = useCallback(() => ref.current?.close(), []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      window.dispatchEvent(new CustomEvent("ms:scroll-unlock"));
    };
    dialog.addEventListener("close", onClose);
    // Leaving the page (Activity hides it) must not leave the dialog open.
    return () => {
      dialog.removeEventListener("close", onClose);
      if (dialog.open) dialog.close();
    };
  }, []);

  const show = () => {
    ref.current?.showModal();
    setOpen(true);
    window.dispatchEvent(new CustomEvent("ms:scroll-lock"));
  };

  return (
    <>
      <button
        type="button"
        className="menu-btn t-label"
        data-ui=""
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={show}
      >
        <span>Menu</span>
        <span className="menu-btn__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>

      <dialog
        id={id}
        ref={ref}
        className="menu-dialog"
        data-bg="dark"
        aria-label="Site menu"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="menu-dialog__inner">
          <div className="menu-dialog__top">
            <Monogram className="menu-dialog__mark" />
            <button type="button" className="menu-btn t-label" onClick={close}>
              <span>Close</span>
              <span className="menu-btn__x" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Primary">
            <ul role="list" className="menu-dialog__list">
              {links.map((l) => (
                <li key={l.href + l.label}>
                  <SmartLink href={l.href} className="t-display t-h3" onClick={close} data-open-contact={l.opensContactForm ? "" : undefined}>
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="menu-dialog__foot">
            {phone ? (
              <a href={phone.href} className="t-label menu-dialog__phone">
                <span className="sr-only">Call {name}: </span>
                {phone.display}
              </a>
            ) : null}
            <p className="t-label t-muted">{name}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
