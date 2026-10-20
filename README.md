# MURSHAD Studio — Cinematic Case Study Template

**Premium Interactive Behance Case Study Template for Multi-Industry Social Advertising**

A dark charcoal + electric-blue editorial system inspired by premium creative studios, experimental portfolios, and cinematic art direction. Build as a *template only* — no advertising creatives are invented. Every visual is a replaceable placeholder for your original PNGs.

> **Live Preview:** `python3 -m http.server 8000` → open `/` — scroll drives the film.

---

## ✨ Experience Highlights

- **Full-screen background video** — 1920×1080+, `object-fit: cover`, dark gradient overlay for readability, poster fallback, `muted playsinline`.
- **Scroll-controlled playback** — scroll progress → video `currentTime` with `requestAnimationFrame` lerp (0.08), reverse on scroll up, pause on idle, throttled seeking to avoid decode stutter.
- **Custom cursor** — central dot + delayed translucent ring (`mix-blend-mode: difference`), expands on hover, magnetic attraction on primary CTAs, contextual labels (`EXPLORE / VIEW / DRAG / REPLACE`), disabled on touch.
- **Scroll motion** — GSAP ScrollTrigger + Lenis smooth scroll, parallax headlines, clip-mask reveals, staggered grids (60ms), opacity/scale/translate, pinned-feel sections without layout jank.
- **Typography** — Syne (display), Instrument Serif (italic), IBM Plex Mono (labels), Space Grotesk (body). Oversized editorial scale (8vw clamp), uppercase mono labels, generous negative space, 8px spacing system.
- **10 chapters:** Cinematic Opening → Introduction → Creative Direction → Industry Overview → Featured Work → Campaign Gallery (asymmetrical) → Individual Showcase (full-width + split + triptych) → Visual Details → Final Gallery → Closing.

## 🎬 Sections

| # | Section | Layout |
|---|---------|--------|
| 01 | Cinematic Opening | Full-screen video, oversized `SOCIAL / ADVERTISING / PORTFOLIO`, timecode, nav indicator |
| 02 | Project Introduction | Editorial copy + editable metadata card (Client/Year/Role/Deliverables/Industries) |
| 03 | Creative Direction | 3 principles + mood-strip placeholders (16:9 / 4:5 / 1:1 / 21:9) |
| 04 | Industry Overview | Modular cards: Digital Services, Fragrance, Medical Billing, Custom (duplicate to add industries) |
| 05 | Featured Work | 2 hero showcases (4:5 + 1:1) with `contain` matte — no cropping |
| 06 | Campaign Gallery | 6-cell asymmetrical grid (4:5 / 1:1 / 9:16 story / 16:9 cover) |
| 07 | Individual Showcase | Full-width hero (16:9) + split-screen ×2 + triptych |
| 08 | Visual Details | Type / Palette / Composition / Spacing system panels |
| 09 | Final Gallery | Cinematic 3-col masonry + quote |
| 10 | Closing Experience | `LET'S CREATE — CINEMATIC`, contact placeholders, footer |

## 🧩 Asset Replacement System

> **No client work is invented.** Every image area is a charcoal matte placeholder with preserved ratio.

**Video**
```html
<!-- in index.html → .video-stage -->
<video id="bgVideo" muted playsinline preload="auto" poster="YOUR_POSTER.jpg">
  <source src="YOUR_1920x1080.mp4" type="video/mp4">
</video>
```
- Keep `muted playsinline` (required for seek + autoplay fallback).
- High-quality poster shows while video loads. Overlay `linear-gradient` keeps text readable over bright frames.

**Images — two ways**
1. **Click** any placeholder → file picker → preview instantly (object-fit: contain + charcoal matte, original ratio untouched).
2. **Drag & drop** PNG/JPG/WebP onto any placeholder.

For production, replace by editing HTML or swapping `src`— the grid uses `contain` so nothing is cropped. Labels show expected ratios: `1080×1350 (4:5)`, `1080×1080 (1:1)`, `1080×1920 (9:16)`, `1920×1080 (16:9)`.

**Text** — all copy is plain HTML. Search `contenteditable` (metadata) or edit directly. Duplicate `.industry-card` to add categories.

**Export for Behance** — each section header has `EXPORT PNG` → dynamically loads `html2canvas` (2× scale) and downloads `murshad-section-XX.png` for still-frame Behance upload. Motion-inspired masks are preserved as static crops.

## 🎨 Visual Language

```
--bg: #08080A        // charcoal-black foundation
--text: #F8F8F6      // warm white typography
--accent: #3358FF    // electric-blue primary
--accent-2: #00D9FF  // cyan accent gradient
--line: rgba(255,255,255,0.08)
```
- Generous margins (32px pad, 120px section rhythm), `18–28px` radii, subtle grain + vignette.
- Restrained motion: no bounce, no particles, no excessive blur. GPU-light (transform/opacity only).

## ⚡ Technical

- **Stack:** Vanilla HTML/CSS/JS + GSAP 3.12 (ScrollTrigger) + Lenis 1.1 (smooth scroll). No build step — CDN-ready.
- **Video sync:** `scrollY / (scrollHeight - vh)` → `targetTime`; `rAF` lerp 0.08; seek only if `|currentTime - videoTime| > 0.04` to prevent decode spam. Poster + duration fallback on error. `prefers-reduced-motion` → normal autoplay loop.
- **Performance:** `preload="auto"` metadata, poster, image `loading` deferred (below-fold via IntersectionObserver), `will-change` on transforms only, dashed matte placeholders (no heavy video on mobile throttle).
- **Accessibility:** `prefers-reduced-motion` disables cursor + parallax, semantic headings, editable fields keyboard-accessible, 11px mono labels 4.5:1 over charcoal.
- **Fallbacks:** Video poster if `error`/`canplay` fails; cursor disabled on `pointer: coarse`; Lenis optional (graceful no-smooth-scroll).

## 📁 Structure

```
index.html          // 10 sections + video-stage + cursor + drawers
css/style.css       // charcoal theme, grid, placeholders, grain/vignette, responsive (980px / 600px)
js/app.js           // loader, Lenis, video scroll-sync, cursor, reveals, drag-drop, lightbox, export
assets/             // put your MP4/poster here (currently CDN placeholders)
```

## 🚀 Use

```bash
# preview
python3 -m http.server 8000 --bind 0.0.0.0
# open http://localhost:8000

# replace video
# edit index.html → #bgVideo <source src="assets/your-film.mp4">

# replace images
# click any placeholder or drag PNG → it previews with contain matte
```

### For Behance (static)

1. Replace all placeholders (video poster + images) + edit copy.
2. Click `EXPORT PNG` per section → upload stills to Behance in order (01→10).
3. Keep motion language: section labels, timecode, and editorials convey cinematic intent even as stills.

## 📝 Notes

- Template only — no logos/stats/results invented.
- All ratios use `object-fit: contain` + `#0A0A0F` letterbox to preserve your artwork.
- Right rail dots, top progress, and `TC 00:00:00 — SYNCED TO SCROLL` are synchronized to video progress.

---

©2025 Murshad Studio — Template v1.0 — Dark charcoal foundation, electric-blue accents, cinematic scroll. Replace placeholders to publish.

