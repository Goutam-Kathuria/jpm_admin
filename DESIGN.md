# Design Brief

## Direction

Premium Luxury Admin — warm, refined, spacious interface inspired by high-end furniture showrooms.

## Tone

Sophisticated minimalism with warm undertones — elegant serif headings paired with modern sans-serif body, soft gold accents used sparingly, all surfaces elevated through careful depth.

## Differentiation

Warm cream and gold palette creates a furniture-showroom aesthetic rare in admin interfaces; combined with deliberate spacing and soft shadows, this produces an immediately recognizable, premium interface.

## Color Palette

| Token      | OKLCH          | Role                           |
| ---------- | -------------- | ------------------------------ |
| background | 0.96 0.015 75  | Warm cream base; spacious feel |
| foreground | 0.2 0.03 50    | Charcoal text for readability  |
| card       | 0.98 0.01 75   | Subtle elevation above base    |
| primary    | 0.55 0.12 30   | Warm gold; calls-to-action     |
| accent     | 0.5 0.1 160    | Muted sage; secondary emphasis |
| muted      | 0.92 0.02 75   | Subtle separators, disabled UI |

## Typography

- Display: Lora — serif headings, page titles, section labels (font-weight: bold)
- Body: DM Sans — body text, form labels, UI copy (font-weight: normal)
- Scale: hero `text-4xl font-bold tracking-tight`, h2 `text-2xl font-bold tracking-tight`, label `text-xs font-semibold uppercase`, body `text-base`

## Elevation & Depth

Soft shadow hierarchy: card borders via 1px border-border, subtle shadows on hover, no drop shadows at rest; layers created through background color shifts (background → card → popover).

## Structural Zones

| Zone    | Background  | Border        | Notes                                       |
| ------- | ----------- | ------------- | ------------------------------------------- |
| Header  | bg-card     | border-b      | Top navbar; search + profile; soft elevated |
| Sidebar | bg-sidebar  | border-r      | Left nav; smooth hover states on items      |
| Content | bg-background | —            | Main grid area; card sections alternate     |
| Footer  | bg-card     | border-t      | Sticky footer; settings, metadata           |

## Spacing & Rhythm

Spacious grid (gap-6 between sections, p-8 inside cards); micro-spacing uses 4px/8px increments; section breaks use full background color shifts rather than lines.

## Component Patterns

- Buttons: rounded-lg, bg-primary text-primary-foreground, hover:opacity-90, transition-smooth
- Cards: bg-card rounded-lg border border-border shadow-subtle, p-6, transition-smooth
- Badges: rounded-full, bg-muted text-muted-foreground, text-xs font-semibold
- Tables: striped rows via bg-card/bg-background alternation, subtle borders

## Motion

- Entrance: buttons/cards fade in over 200ms ease-out on mount
- Hover: buttons brighten via opacity-90, cards lift via shadow-elevated, text darkens slightly
- Decorative: none; animation reserved for interaction feedback

## Constraints

- No raw hex or named colors; OKLCH variables only
- Rounded corners always via --radius (8px); avoid sharp edges
- Shadows: use shadow-subtle (rest), shadow-elevated (hover), never use default Tailwind shadows
- Chroma kept low across palette (0.01–0.17) to maintain luxury softness

## Signature Detail

Warm gold accents in a cream interface create unexpected sophistication — borrowed from furniture design language but rarely seen in digital admin UIs, making the interface instantly memorable and differentiated.
