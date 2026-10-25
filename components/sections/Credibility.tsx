import { Flower } from "@/components/ui/Flower";
import { Reveal } from "@/components/ui/RevealText";
import { SmartLink } from "@/components/ui/SmartLink";
import { formatInt, formatMonthYear } from "@/lib/utils/format";
import type { AgentDTO, TestimonialDTO } from "@/types/content";

/**
 * REVIEWS & CREDENTIALS — the reference's “credibility statement”.
 *
 * Handled conservatively on purpose (see content brief §8 and §2.3):
 *  • the 5.0 average is shown WITH its source and the dates it covers, so it is
 *    never mistaken for recent;
 *  • individual quotes appear only after the agent approves them and reviewer
 *    permission is confirmed (none yet — the CMS starts with zero approved);
 *  • designations and awards appear only when verified (none yet);
 *  • no star-rating structured data is emitted for this self-published summary.
 */
export function Credibility({
  agent,
  testimonials,
  showRating,
  heading,
}: {
  agent: AgentDTO;
  testimonials: TestimonialDTO[];
  showRating: boolean;
  heading?: string;
}) {
  const rating = showRating ? agent.rating : undefined;
  const brokerage = agent.brokerage;
  const profileLink = agent.links.find((l) => /homes\.com/i.test(l.href));
  if (!rating && !testimonials.length && !agent.credentials.length && !brokerage?.name) return null;

  const from = formatMonthYear(rating?.firstReviewDate);
  const to = formatMonthYear(rating?.lastReviewDate);

  return (
    <section id="reviews" className="proof" data-section="proof" data-bg="light" aria-labelledby="proof-h">
      <Flower clip={7} placement="closing" parallax="fwd" />
      <div className="proof__inner">
        <Reveal mode="line" className="hairline hairline--v" />
        <h2 id="proof-h" className="t-label" data-reveal="ctn">
          {heading ?? "Reviews & credentials"}
        </h2>

        {brokerage?.name ? (
          <p className="proof__statement t-display t-h4" data-reveal="ctn">
            Licensed in Illinois with {brokerage.name}
            {brokerage.address?.city ? `, ${brokerage.address.city}` : ""}.
          </p>
        ) : null}

        {rating ? (
          <div className="proof__rating" data-reveal="ctn">
            <p className="proof__score t-display">
              <span aria-hidden="true">{rating.average.toFixed(1)}</span>
              <span className="sr-only">{rating.average.toFixed(1)} out of 5</span>
            </p>
            <p className="t-body">
              average across <strong>{formatInt(rating.count)}</strong> reviews on Google and Homes.com
              {from && to ? (
                <>
                  , all dated <span className="tabular">{from}</span> to <span className="tabular">{to}</span>
                </>
              ) : null}
              .
            </p>
            {profileLink ? (
              <p>
                <SmartLink href={profileLink.href} className="t-label proof__link hit-slop">
                  Read the reviews on Homes.com
                </SmartLink>
                <span className="sr-only"> (opens in a new tab)</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {testimonials.length ? (
          <ul role="list" className="proof__quotes">
            {testimonials.map((t) => (
              <li key={t.id} data-reveal="ctn">
                <blockquote className="t-display t-h5">“{t.quote}”</blockquote>
                <p className="t-label t-muted">
                  {t.name}
                  {t.platform ? ` · ${t.platform}` : ""}
                  {t.date ? ` · ${formatMonthYear(t.date, true)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {agent.credentials.length ? (
          <ul role="list" className="proof__credentials t-small" data-reveal="ctn">
            {agent.credentials.map((c) => (
              <li key={c.name}>
                {c.name}
                {c.issuer ? ` — ${c.issuer}` : ""}
                {c.year ? `, ${c.year}` : ""}
              </li>
            ))}
          </ul>
        ) : null}

        {agent.license ? (
          <p className="t-small t-muted" data-reveal="ctn">
            Illinois licence #{agent.license.number}
          </p>
        ) : null}
      </div>
    </section>
  );
}
