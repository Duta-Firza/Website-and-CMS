# Solutions Lottie animations

Drop Lottie JSON files here using the naming convention:

- `trading.json`
- `manufacturing.json`
- `epc.json`

The Solutions Spotlight on the landing page picks them up automatically — no
code change required. The file name must match the solution `key` value used
in the CMS (`trading` / `manufacturing` / `epc`).

## Recommendations

- **Source**: <https://lottiefiles.com> (search Industry / Engineering / Oil & Gas / Construction)
- **Format**: Lottie v5.x JSON (NOT the compressed `.lottie` package format)
- **ViewBox**: roughly 200 × 200 — square aspect renders best in the card slot
- **Palette**: prefer brand-deep (`#1d1a57`) strokes; brand-accent (`#9f1211`) for highlights
- **Duration**: 1.5 – 2.5 seconds. The component triggers playback on scroll-into-view
  and replays on hover, so the animation should **not loop**
- **Payload**: aim for ≤ 30 KB per file (use lottie-optimizer / lottie-cleaner if needed)

## Fallback behaviour

If any of these files is missing, the component falls back to a built-in SVG
line-art illustration with a staggered stroke-draw animation. The landing page
still looks polished, so you can ship without these files and upgrade later.
