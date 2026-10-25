import type { PropertyCategory } from "@/sanity/lib/enums";

/**
 * Original line-art glyphs. They give photograph-less cards and slides an
 * architectural identity instead of an empty grey box, and they stay honest: a
 * drawing of "a townhouse" is not pretending to be a photo of THIS townhouse.
 * Strokes are drawn by CSS (`.material__glyph`), so a theme can recolour them.
 */
type GlyphName = PropertyCategory | "key" | "building" | "circles" | "pin" | "speech" | "arch";

const DRAWINGS: Record<GlyphName, React.ReactNode> = {
  house: (
    <>
      <path d="M18 84 L100 22 L182 84" />
      <path d="M34 72 V140 H166 V72" />
      <path d="M86 140 V100 H114 V140" />
      <rect x="46" y="88" width="26" height="26" />
      <rect x="128" y="88" width="26" height="26" />
      <path d="M10 140 H190" />
    </>
  ),
  condo: (
    <>
      <path d="M62 140 V20 H138 V140" />
      <path d="M38 140 H162" />
      {[0, 1, 2, 3, 4].flatMap((row) =>
        [0, 1, 2].map((col) => (
          <rect key={`${row}-${col}`} x={74 + col * 20} y={34 + row * 21} width="12" height="13" />
        )),
      )}
      <path d="M92 140 V124 H108 V140" />
    </>
  ),
  townhouse: (
    <>
      {[0, 1, 2].map((i) => {
        const x = 16 + i * 56;
        return (
          <g key={i}>
            <path d={`M${x} 72 L${x + 28} 40 L${x + 56} 72`} />
            <path d={`M${x} 72 V140`} />
            <rect x={x + 18} y={106} width="20" height="34" />
            <rect x={x + 18} y={80} width="20" height="16" />
          </g>
        );
      })}
      <path d="M184 72 V140" />
      <path d="M8 140 H192" />
    </>
  ),
  multifamily: (
    <>
      <path d="M26 64 L100 24 L174 64" />
      <path d="M38 64 V140 H162 V64" />
      <path d="M38 102 H162" />
      <path d="M100 64 V140" />
      <rect x="52" y="76" width="30" height="16" />
      <rect x="118" y="76" width="30" height="16" />
      <rect x="52" y="114" width="30" height="16" />
      <rect x="118" y="114" width="30" height="16" />
      <path d="M48 102 H86 M114 102 H152" />
      <path d="M8 140 H192" />
    </>
  ),
  other: (
    <>
      <path d="M40 140 V70 A60 60 0 0 1 160 70 V140" />
      <path d="M70 140 V92 A30 30 0 0 1 130 92 V140" />
      <path d="M20 140 H180" />
    </>
  ),
  key: (
    <>
      <circle cx="62" cy="80" r="26" />
      <circle cx="62" cy="80" r="9" />
      <path d="M88 80 H172" />
      <path d="M140 80 V104 M158 80 V96" />
    </>
  ),
  building: (
    <>
      <path d="M36 140 V56 H92 V140" />
      <path d="M92 140 V28 H164 V140" />
      <path d="M18 140 H182" />
      {[0, 1, 2, 3].map((r) => (
        <path key={r} d={`M108 ${44 + r * 24} H148`} />
      ))}
      {[0, 1, 2].map((r) => (
        <path key={`l${r}`} d={`M50 ${72 + r * 22} H78`} />
      ))}
    </>
  ),
  circles: (
    <>
      <circle cx="76" cy="80" r="42" />
      <circle cx="124" cy="80" r="42" />
      <path d="M100 42 V118" />
    </>
  ),
  pin: (
    <>
      <path d="M100 150 C100 150 52 100 52 70 A48 48 0 0 1 148 70 C148 100 100 150 100 150 Z" />
      <circle cx="100" cy="70" r="16" />
    </>
  ),
  speech: (
    <>
      <path d="M26 34 H126 V92 H70 L48 114 V92 H26 Z" />
      <path d="M146 62 H178 V118 H160 V138 L140 118 H92 V104" />
    </>
  ),
  arch: (
    <>
      <path d="M44 146 V74 A56 56 0 0 1 156 74 V146" />
      <path d="M74 146 V92 A26 26 0 0 1 126 92 V146" />
      <path d="M26 146 H174" />
    </>
  ),
};

export function PropertyGlyph({ name, className }: { name: GlyphName; className?: string }) {
  return (
    <svg
      className={className ?? "material__glyph"}
      viewBox="0 0 200 160"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {DRAWINGS[name]}
    </svg>
  );
}

export type { GlyphName };
