import { Flower } from "@/components/ui/Flower";
import { Reveal, RevealText } from "@/components/ui/RevealText";
import { formatInt, formatLongDate, formatUsd } from "@/lib/utils/format";
import type { MarketStatsDTO } from "@/types/content";

/** Round to the nearest thousand for prose (“about $324,000”). */
const about = (n: number) => formatUsd(Math.round(n / 1000) * 1000);

/**
 * MARKET EXPERIENCE — the reference's “range statement”. Every number comes from
 * the Market statistics document and is shown with its source and date:
 *  • the five-year headline (100 closed sales, ~$324K average) is published by
 *    Homes.com and reconciles arithmetically;
 *  • the price bands are CALCULATED from the sales in this dataset that carry a
 *    price (a subset), and are footnoted as such;
 *  • the $193K–$990K headline range is never shown (it contradicts the profile's
 *    own component ranges) and component ranges appear only once confirmed.
 */
export function Market({ stats, heading }: { stats: MarketStatsDTO | null; heading?: string }) {
  if (!stats) return null;
  const statement =
    stats.closedSales && stats.average
      ? `${formatInt(stats.closedSales)} closed sales over ${stats.windowLabel}, averaging about ${about(stats.average)}.`
      : null;
  const bands = stats.showBands ? stats.bands : [];
  const ranges = stats.ranges?.buyer || stats.ranges?.seller ? stats.ranges : undefined;
  // A heading and a source line over nothing is an empty section — render nothing instead.
  if (!statement && !stats.lastYear && !stats.fiveYear && !ranges && !bands.length) return null;

  const asOf = formatLongDate(stats.asOf);
  const maxBand = Math.max(...bands.map((b) => b.count), 1);

  return (
    <section id="experience" className="market" data-section="market" data-bg="color" aria-labelledby="market-h">
      <Flower clip={4} placement="market" parallax="fwd" />
      <div className="market__inner">
        <Reveal mode="line" className="hairline hairline--v" />
        <h2 id="market-h" className="t-label" data-reveal="ctn">
          {heading ?? "Experience across price points"}
        </h2>

        {statement ? <RevealText as="p" mode="w" text={statement} className="market__statement t-display t-h4" /> : null}

        {stats.lastYear || stats.fiveYear || ranges ? (
          <dl className="market__stats" data-reveal="ctn">
            {stats.lastYear ? (
              <div>
                <dt className="t-label t-muted">Last 12 months</dt>
                <dd>
                  <span className="t-display t-h4 tabular">{stats.lastYear.deals}</span> closings
                  <span className="t-small t-muted">
                    {" "}
                    ({stats.lastYear.sellerSide} seller-side · {stats.lastYear.buyerSide} buyer-side)
                  </span>
                </dd>
              </div>
            ) : null}
            {stats.fiveYear ? (
              <div>
                <dt className="t-label t-muted">Last five years</dt>
                <dd>
                  <span className="t-display t-h4 tabular">{stats.fiveYear.buyerSide}</span> buyer-side ·{" "}
                  <span className="t-display t-h4 tabular">{stats.fiveYear.sellerSide}</span> seller-side
                </dd>
              </div>
            ) : null}
            {ranges ? (
              <div>
                <dt className="t-label t-muted">Price range, five years</dt>
                <dd>
                  {ranges.buyer ? <>Buyer-side {ranges.buyer}</> : null}
                  {ranges.buyer && ranges.seller ? " · " : null}
                  {ranges.seller ? <>Seller-side {ranges.seller}</> : null}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {bands.length ? (
          <figure className="market__bands" data-reveal="ctn">
            <table className="bands">
              <caption className="t-label t-muted">Where the closed sales in this dataset fall</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Price band</th>
                  <th scope="col">Share (bar)</th>
                  <th scope="col">Closed sales</th>
                </tr>
              </thead>
              <tbody>
                {bands.map((b) => (
                  <tr key={b.label}>
                    <th scope="row" className="t-small">
                      {b.label}
                    </th>
                    <td aria-hidden="true">
                      <span className="bands__bar" style={{ width: `${(b.count / maxBand) * 100}%` }} />
                    </td>
                    <td className="tabular t-small">{b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.bandsBasis ? <figcaption className="t-small t-muted">{stats.bandsBasis}</figcaption> : null}
          </figure>
        ) : null}

        <p className="market__source t-label t-muted" data-reveal="ctn">
          Source: {stats.source}
          {asOf ? `, as of ${asOf}` : ""}
        </p>
      </div>
    </section>
  );
}
