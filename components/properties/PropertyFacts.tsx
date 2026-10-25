import type { FactDTO } from "@/types/content";

/** A compact definition list of facts (beds · baths · sq ft …). Renders nothing if empty. */
export function PropertyFacts({ facts, className = "property-facts" }: { facts: FactDTO[]; className?: string }) {
  if (!facts.length) return null;
  return (
    <dl className={className}>
      {facts.map((f) => (
        <div key={f.label}>
          <dt className="t-label t-muted">{f.label}</dt>
          <dd className="tabular">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
