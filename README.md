# The G Code™ — V3 THOR Site

**Digital Media With Flavor** · Operator media + Same-Day MVP Launch™ by Da PLG.

Premium dark "operator lounge" landing site built from the V3 THOR build document. Static — no build step.

## Stack
- Static HTML / CSS / vanilla JS (zero dependencies, instant deploy)
- Google Fonts: Archivo (display), Oswald (kickers), Inter (body)

## Local preview
```bash
python3 -m http.server 5173
# open http://localhost:5173
```

## Deploy
Connected to Vercel — pushes to `main` auto-deploy to **the-g-code.vercel.app**.

## Structure
- `index.html` — homepage (hero → motion → Same-Day MVP → world → Da PLG → close)
- `styles.css` — design system (coal/onyx base, platinum lead, surgical ember)
- `script.js` — nav scroll state + scroll-reveal

## Visual system
| Token | Hex |
|---|---|
| onyx | `#0B0B0D` |
| coal | `#141519` |
| graphite | `#23252B` |
| platinum | `#C7CBD1` |
| gold | `#C8A24B` |
| ember (surgical) | `#7A2230` |

> Contact CTAs currently point to `hello@the-g-code.com` (placeholder — update to the real inbox).
