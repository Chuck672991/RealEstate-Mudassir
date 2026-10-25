import type { CSSProperties } from "react";

import { CircleButton } from "@/components/ui/CircleButton";
import { Flower } from "@/components/ui/Flower";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { RevealText } from "@/components/ui/RevealText";
import type { AgentDTO, ServiceAreaDTO } from "@/types/content";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * AREAS — the reference's horizontal chapter. On desktop, vertical scroll is
 * mapped to a sideways journey through the communities Mudassir works in, each
 * panel led by a real number (closed sales, last five years). On mobile and for
 * reduced motion the panels simply stack. The drawn line is abstract, NOT a map:
 * the dataset contains no coordinates, so nothing here implies geography.
 */
export function Areas({
  areas,
  agent,
  heading,
  intro,
}: {
  areas: ServiceAreaDTO[];
  agent: AgentDTO;
  heading?: string;
  intro?: string;
}) {
  const named = areas.filter((a) => !a.isOffice && a.closedSales5y != null);
  const office = areas.find((a) => a.isOffice);
  // The office is not a service area: without at least one real area there is no chapter to show.
  if (!named.length) return null;

  // number of panels in the rail: intro + named areas + (office) + closing panel
  const panelCount = 2 + named.length + (office ? 1 : 0);

  return (
    <section
      id="areas"
      className="areas"
      data-section="areas"
      data-bg="light"
      aria-labelledby="areas-h"
      style={{ "--n": panelCount } as CSSProperties}
    >
      <div className="areas__area" data-hscroll-area="">
        <div className="areas__sticky">
          <div className="areas__rail" data-hscroll-track="">
            <ul role="list" className="areas__track">
              <li className="area-panel area-panel--intro">
                <p className="t-label" data-reveal="ctn">
                  The areas
                </p>
                <RevealText as="h2" mode="w" id="areas-h" text={heading ?? "Where Mudassir works"} className="t-display t-h3" />
                {intro ? (
                  <p className="t-body" data-reveal="ctn">
                    {intro}
                  </p>
                ) : null}
                <p className="area-panel__hint t-label" aria-hidden="true">
                  Keep scrolling <span>→</span>
                </p>
                <Flower clip={1} placement="areas-intro" travel="intro" />
              </li>

              {named.map((a, i) => (
                <li key={a.id} className="area-panel" style={{ "--share": (a.sharePercent ?? 0) / 100 } as CSSProperties}>
                  <span className="area-panel__index t-label">{pad(i + 1)}</span>
                  {a.image ? (
                    <div className="area-panel__photo" data-reveal="slide">
                      <div className="rv-slide-inner">
                        <ImageSlot image={a.image} sizes="(min-width: 992px) 24vw, 80vw" className="area-panel__media" />
                      </div>
                    </div>
                  ) : null}
                  {i === 1 ? <Flower clip={2} placement="areas-mid" travel="mid" /> : null}
                  <p className="area-panel__count t-display" data-reveal="ctn">
                    <span className="tabular">{a.closedSales5y}</span>
                  </p>
                  <p className="t-label">closed sales · last five years</p>
                  <RevealText as="h3" mode="h" text={a.name} className="area-panel__name t-display t-h2" />
                  {a.sharePercent != null ? (
                    <>
                      <div className="area-panel__bar" role="img" aria-label={`${a.sharePercent}% of Mudassir's closed sales`}>
                        <span />
                      </div>
                      <p className="t-small t-muted">{a.sharePercent}% of closed sales</p>
                    </>
                  ) : null}
                </li>
              ))}

              {office ? (
                <li className="area-panel area-panel--office">
                  <span className="area-panel__index t-label">Office</span>
                  <RevealText as="h3" mode="h" text={office.name} className="area-panel__name t-display t-h2" />
                  {agent.brokerage?.name ? <p className="t-body">{agent.brokerage.name}</p> : null}
                  {agent.brokerage?.address ? <p className="t-small t-muted">{agent.brokerage.address.oneLine}</p> : null}
                </li>
              ) : null}

              <li className="area-panel area-panel--end">
                <CircleButton href="/properties" tone="light">
                  See current homes
                </CircleButton>
                <p className="t-small t-muted">
                  Sale counts follow Homes.com’s neighborhood labels, which can overlap.
                </p>
                <Flower clip={3} placement="areas-end" travel="end" />
              </li>
            </ul>

            <svg
              className="areas__route"
              data-reveal="line-x"
              viewBox="0 0 3000 120"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M0 60 C 150 10, 300 110, 450 60 S 750 10, 900 60 S 1200 110, 1350 60 S 1650 10, 1800 60 S 2100 110, 2250 60 S 2550 10, 2700 60 S 2900 90, 3000 60" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
