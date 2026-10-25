"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface FacetOption {
  value: string;
  label: string;
}

interface Item {
  status: string;
  category: string;
}

const SEARCH_EVENT = "ms:search";

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  window.addEventListener(SEARCH_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(SEARCH_EVENT, onChange);
  };
};
const getSearch = () => window.location.search;
const getServerSearch = () => "";

/**
 * Filters the (server-rendered) list of homes by status and type.
 *
 * Progressive enhancement: the full list is real HTML that exists without
 * scripting. With scripting, the chips hide non-matching `<li data-status
 * data-category>` items in place, and the choice is mirrored in the URL
 * (?status=sold&type=condo) so a filtered view can be shared. The visible count
 * is derived from the same facets, so it never disagrees with the list.
 */
export function PropertyBrowser({
  items,
  statuses,
  categories,
  emptyMessage,
  children,
}: {
  items: Item[];
  statuses: FacetOption[];
  categories: FacetOption[];
  emptyMessage: string;
  children: ReactNode;
}) {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const params = new URLSearchParams(search);
  const status = statuses.some((s) => s.value === params.get("status")) ? params.get("status")! : "all";
  const category = categories.some((c) => c.value === params.get("type")) ? params.get("type")! : "all";

  const list = useRef<HTMLDivElement>(null);

  // apply the filter to the server-rendered list
  useEffect(() => {
    list.current?.querySelectorAll<HTMLElement>("li[data-status]").forEach((li) => {
      const show =
        (status === "all" || li.dataset.status === status) && (category === "all" || li.dataset.category === category);
      li.hidden = !show;
    });
  }, [status, category]);

  const shown = items.filter(
    (i) => (status === "all" || i.status === status) && (category === "all" || i.category === category),
  ).length;

  const choose = (key: "status" | "type", value: string) => {
    const next = new URLSearchParams(window.location.search);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    const query = next.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    window.dispatchEvent(new Event(SEARCH_EVENT));
  };

  const reset = () => {
    window.history.replaceState(null, "", window.location.pathname);
    window.dispatchEvent(new Event(SEARCH_EVENT));
  };

  const chips = (key: "status" | "type", label: string, options: FacetOption[], current: string) => (
    <fieldset className="filter-group">
      <legend className="t-label">{label}</legend>
      <div className="filter-group__chips">
        {[{ value: "all", label: "All" }, ...options].map((o) => (
          <button
            key={o.value}
            type="button"
            className={cn("chip t-label")}
            aria-pressed={current === o.value}
            onClick={() => choose(key, o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div>
      {items.length > 1 ? (
        <div className="filters">
          {chips("status", "Status", statuses, status)}
          {chips("type", "Type", categories, category)}
          <p className="filters__count t-small" role="status" aria-live="polite">
            Showing {shown} of {items.length}
          </p>
        </div>
      ) : null}

      <div ref={list}>{children}</div>

      {shown === 0 && items.length > 0 ? (
        <div className="empty-state" role="status">
          <p className="t-body">{emptyMessage}</p>
          <button type="button" className="pill-btn t-label" onClick={reset}>
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
