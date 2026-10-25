/**
 * Renders JSON-LD. `<` is escaped so CMS-supplied text can never close the script
 * tag (the XSS vector Next.js's own JSON-LD guide warns about). A native <script>
 * is correct here: JSON-LD is data, not executable code.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
