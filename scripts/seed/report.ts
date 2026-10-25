import type { RunReport } from "./run";

const pad = (s: string | number, n: number) => String(s).padEnd(n);
const num = (s: string | number, n: number) => String(s).padStart(n);

/** Human-readable report: imported / updated / skipped / failed, per document type. */
export function formatReport(report: RunReport, opts: { dryRun: boolean; warnings: string[] }): string {
  const lines: string[] = [];
  const verb = opts.dryRun ? "would be" : "were";
  lines.push("");
  lines.push(opts.dryRun ? "SEED PLAN (dry run — nothing was written)" : "SEED RESULT");
  lines.push("─".repeat(78));
  lines.push(
    `${pad("document type", 20)}${num("created", 9)}${num("updated", 9)}${num("unchanged", 11)}${num("skipped", 9)}${num("conflicts", 11)}`,
  );
  for (const [type, s] of Object.entries(report.byType).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(
      `${pad(type, 20)}${num(s.created, 9)}${num(s.updated, 9)}${num(s.unchanged, 11)}${num(s.skipped, 9)}${num(s.conflicts, 11)}`,
    );
  }
  lines.push("─".repeat(78));
  const t = report.total;
  lines.push(
    `${pad("TOTAL", 20)}${num(t.created, 9)}${num(t.updated, 9)}${num(t.unchanged, 11)}${num(t.skipped, 9)}${num(t.conflicts, 11)}`,
  );
  lines.push("");
  lines.push(
    `${t.created} document(s) ${verb} created, ${t.updated} ${verb} updated, ${t.unchanged} already up to date, ${t.skipped} skipped, ${report.failures.length} failed.`,
  );

  const conflicts = report.actions.filter((a) => (a.kind === "update" || a.kind === "unchanged") && a.conflicts.length);
  if (conflicts.length) {
    lines.push("");
    lines.push("Kept your edits (dataset differs from what is in Studio):");
    for (const a of conflicts) {
      if (a.kind === "update" || a.kind === "unchanged") lines.push(`  • ${a.id}: ${a.conflicts.join(", ")}`);
    }
  }
  const skipped = report.actions.filter((a) => a.kind === "skip");
  if (skipped.length) {
    lines.push("");
    lines.push("Skipped:");
    for (const a of skipped) if (a.kind === "skip") lines.push(`  • ${a.id}: ${a.reason}`);
  }
  if (opts.warnings.length) {
    lines.push("");
    lines.push("Data notes:");
    for (const w of opts.warnings) lines.push(`  • ${w}`);
  }
  if (report.failures.length) {
    lines.push("");
    lines.push("FAILED:");
    for (const f of report.failures) lines.push(`  ✖ ${f.type} ${f.id}: ${f.error}`);
  }
  lines.push("");
  return lines.join("\n");
}
