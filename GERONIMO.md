# GERONIMO Protocol — project reference (dayonemvp.com)

Run **only** on the explicit trigger: **"Incoming Geronimo — Build"**. Never auto-run on normal edits.

## The stack (sequential, hard GATE between each)

```
Incoming Geronimo — Build
 → MEGAMIND   govern: lock objective, version (V1=spec, V2=build), boundaries, mode
 → BORIS      verify: kill every unverified/fabricated claim before it ships
 → MAESTRO    route: lock toolchain + build sequence
 → THOR       build: AGILE — pick safe default, flag it, only halt if truly blocked
 → BILBO v1   early adversarial audit; fix criticals NOW          [git commit = snapshot #1]
 → ELROY ‖ CINDERELLA   parallel: motion ‖ polish (only independent pair)
 → BILBO v2   final security sweep + log + vault presets           [git commit = snapshot #2]
 → GAIA       archive, consolidate, markdown handoff, ship (push→Vercel)
```

Snapshots = real git commits at the two Bilbo gates + the Gaia ship commit.

## Agent ↔ standards mapping (this stack)

| Agent | Carries |
|---|---|
| Boris | calm-giant voice, claims-safety (qualify speed claims, no fabricated numbers/testimonials) |
| Maestro | self-hosted GSAP + CSP 'self', cache-bust plan, per-view search identity, Never Rebuild Twice |
| Thor | data-driven renderers (build.js/tier.js/audience.js), banner-opacity baking |
| Bilbo v1/v2 | adversarial security audit, run twice (early + final) |
| Elroy | motion system: immediateRender:false, reduced-motion guard, hero static, slow glide |
| Cinderella | content-is-king polish: mute bg 40-60%, gold breathes, contrast WCAG AA |
| Gaia | cache-bump + `git push origin main` (auto-deploys to dayonemvp.com) + handoff |

## Vaulted presets (reusable on this project)

- **Palette:** onyx #0B0B0D base · platinum #C7CBD1 · champagne/gold accent **#C8A86A** (var `--champagne-2`)
- **Elroy hero preset:** hero box STATIC (no entrance motion) on every page; scroll entrances slow glide (swipe 1.35s desktop / 1.05s mobile, `power2.out`, stagger 0.18; fade 1.2s). Swipe = left→right "swipe right" priming.
- **Cache-bust:** bump `styles.css?v=YYYYMMDD<letter>` on ALL pages after any CSS edit (current `v=20260626b`).
- **Section pattern:** `.method-grid`/`.method-card` (numbered outcome cards, static), `.stat-grid`/`.stat-cell` (proof numbers).
