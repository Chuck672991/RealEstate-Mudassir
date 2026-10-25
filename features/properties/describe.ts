import type { AgentDTO, PropertyDTO } from "@/types/content";

/**
 * One factual sentence-group describing a home, for meta descriptions and share
 * cards. Built ONLY from fields the page itself shows (status, price, date, facts,
 * location), so the snippet can never promise more than the page delivers — no
 * adjectives, no "dream home".
 *
 *   "Condo in Lyons, IL. Sold Sep 2026 for $251,000. 2 beds, 2 baths, 1,120 sq ft.
 *    Mudassir Siddiqui, HomeSmart Connect LLC."
 */
export function describeProperty(property: PropertyDTO, agent: Pick<AgentDTO, "displayName" | "brokerage">): string {
  const where = `${property.typeLabel} in ${property.location}`;

  let offer: string | undefined;
  if (property.status === "sold") {
    offer = `${property.dateLabel ?? "Sold"} for ${property.priceLabel}`;
  } else if (property.status === "pending") {
    offer = `Under contract, listed at ${property.priceLabel}`;
  } else if (property.status === "active") {
    offer = `For sale at ${property.priceLabel}${property.dateLabel ? `, ${property.dateLabel.toLowerCase()}` : ""}`;
  } else {
    offer = property.priceLabel;
  }

  const facts = property.facts.length
    ? property.facts.map((f) => `${f.value} ${f.label.toLowerCase()}`).join(", ")
    : undefined;

  const who = [agent.displayName, agent.brokerage?.name].filter(Boolean).join(", ");
  return [where, offer, facts, who]
    .filter((part): part is string => !!part)
    .map((part) => (part.endsWith(".") ? part : `${part}.`))
    .join(" ");
}
