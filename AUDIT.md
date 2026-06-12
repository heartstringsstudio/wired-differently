# Wired Differently — Reading Experience Audit

**Date:** 2026-06-11 · **Scope:** read-only audit of typography, page mechanics, responsive behavior, code quality, and premium-reader gap. No code was modified.

**TL;DR:** The design system (`css/style.css`) is genuinely good — warm palette, serif body, sensible tokens. The product problem is that **26 of 27 chapters are raw PDF/Word text dumps poured into `<p>` tags**, so the design system never gets applied to them; and the page mechanics are multi-page-app reloads with replaying entry animations, a hijacked arrow-key scheme, and a service worker that silently fails to install. Chapter 1 (hand-authored) shows what the book is supposed to look like; chapters 2–27 don't match it.

---

## 1. Typography & Formatting

### 1.1 Content structure collapsed by document conversion — the root cause

| # | Severity | Location | Finding | Fix |
|---|----------|----------|---------|-----|
| T1 | **HIGH** | `chapters/ch02.html:53`, `ch09.html`, and all of ch02–ch27 | Section headings exist only as plain text *inside* paragraph runs (e.g. "What ADHD Actually Is", "The Core Systems Affected" at `ch02.html:53–54` are not headings). Heading counts swing arbitrarily: ch02 and ch09 have **zero** `<h2>`, ch25 has six. Chapter 1 (`ch01.html:102,120,137`) is properly structured — the only one. | Re-segment every chapter's source text into semantic `<h2>`/`<h3>`/`<p>`/`<ol>` markup (scriptable from the original manuscript). |
| T2 | **HIGH** | `chapters/ch02.html:53` (2,128 chars), `ch09.html` (2,715 chars) vs `ch01.html` (max 443 chars) | Wall-of-text paragraphs 5–6× longer than the hand-authored chapter; multiple topics, lists, and headings fused into single `<p>` blocks. | Split paragraphs at the original manuscript's paragraph boundaries. |
| T3 | **HIGH** | `chapters/ch03.html:72`, `ch23.html:59,76,79` | The few `<h2>`s that *do* exist in converted chapters are mid-sentence fragments promoted by accident: "Gender compounds the delay further Research indicates that women and girls with ADHD" is an `<h2>` that breaks a sentence in half. | Audit every existing `<h2>` in ch02–ch27 against the manuscript; none can be trusted. |
| T4 | **HIGH** | `chapters/ch23.html:53–83` | Worksheets are unusable as shipped: 76-character literal underscore runs as "fill-in lines", `☐` glyphs as checkboxes inside run-on prose, and PDF column-extraction artifacts ("Statu s" `:64`, "Ste p" `:69`, "Note s" `:73`) where tables were flattened to text. | Rebuild worksheets as real HTML (fieldsets, labeled inputs, tables) — `css/print.css` already defines `.worksheet-field`/`.worksheet-textarea` styles waiting for this markup. |
| T5 | MED | `chapters/ch02.html:55,99` | Numbered sub-sections ("1. Executive Function", "Predominantly Inattentive Presentation") run inline as body text instead of `<h3>`; `.prose h3`/`h4` styles (`css/style.css:656–676`) have **zero usages** book-wide, so hierarchy is h1→h2-only at best, h1→nothing in ch02/ch09. | Promote sub-sections to `<h3>` during re-segmentation. |
| T6 | MED | `chapters/ch01.html:100,145` vs all others | Editorial furniture is inconsistent: `<hr>` section dividers (3) and the `.callout` box appear **only in ch01**; `<blockquote>` is styled (`css/style.css:688–700`) but used in zero chapters. The book has one designed chapter and 26 undesigned ones. | Define a per-chapter content template (dividers between major sections, callout for key takeaway) and apply uniformly. |
| T7 | MED | `css/style.css:658` vs `:665` | `.prose h3` declares `font-size: 1rem` then `font-size: 0.8125rem` in the same rule — conflicting duplicate; whichever survives a future edit changes all h3s. | Delete the stray `font-size: 1rem` at `:658`. |
| T8 | LOW | `css/style.css:36` | Measure is good: `--measure: 68ch` on `.prose` stays under the ~75ch ceiling at all four font sizes. Only the ch23 underscore runs (76 unbreakable chars) exceed it. | No change to the token; fix the underscore content (T4). |
| T9 | LOW | `chapters/ch02.html:53` etc. | `&quot;` entities render straight quotes in converted chapters while ch01 and headers use typographic quotes — mixed quote styles mid-book. | Normalize to curly quotes during re-segmentation. |
| T10 | LOW | `css/style.css:630–643` | No screen-side orphan/widow or hyphenation control (`orphans`/`widows` only in `@media print` `:992`); long-word overflow unguarded (`overflow-wrap` unset). | Add `text-wrap: pretty` on `.prose p`, `text-wrap: balance` on headings, `overflow-wrap: break-word` on `.prose`. |
| T11 | LOW | `chapters/ch01.html:86` | ch01's prose div lacks the `id="chapter-content"` present in every other chapter — harmless today, a trap for any future script targeting it. | Add the id for consistency. |

---

## 2. Page Mechanics

**How navigation currently works:** every chapter is a separate HTML page; readers scroll, then use small Prev/Next buttons in a footer `chapter-nav`, a "Contents" text link, arrow keys, or the nav-bar TOC icon. There are no swipe gestures and no tap zones. Each chapter change is a full page load.

| # | Severity | Location | Finding | Fix |
|---|----------|----------|---------|-----|
| M1 | **HIGH** | `js/app.js:367–374` | **ArrowUp/ArrowDown are bound to previous/next chapter.** The two most common scroll keys yank the reader out of the chapter mid-read — this alone makes the app feel broken on desktop. | Bind only ArrowLeft/ArrowRight (and don't navigate when a text selection or modifier is active). |
| M2 | **HIGH** | `css/style.css:1003–1010`; `chapters/ch01.html:78,86` | Every chapter turn is an abrupt full reload, then the header and body **replay the fade-in entrance animation** (with 100ms stagger) on every single page — a flash + content shift on each turn, the single biggest "amateur" tell. | Adopt cross-document View Transitions (`@view-transition { navigation: auto }`) with a subtle slide/fade, and only run entrance animations on first visit. |
| M3 | **HIGH** | `chapters/ch01.html:2`; `js/app.js:85–99,399` | **Dark-mode flash on every navigation:** `data-theme="light"` is hardcoded in each page's `<html>` and the saved theme is only applied at `DOMContentLoaded`, so dark-mode readers get a white flash on every chapter turn. | Apply the stored theme from a tiny inline `<head>` script before first paint. |
| M4 | MED | `js/app.js:236–243,333,369,373` | All JS navigation uses root-absolute paths (`/toc.html`, `/chapters/ch02.html`) while the manifest scopes the app to `/wired-differently/` (`manifest.json:5–6`). Keyboard nav, the `t` shortcut, and the cover Resume link 404 on the GitHub-Pages-style subpath the rest of the app assumes. | Use relative paths (or a single base-path constant) everywhere. |
| M5 | MED | `js/app.js:255–257` | Scroll restore fires in one `requestAnimationFrame` before web fonts (loaded via CSS `@import`) settle, so the restored position lands at the wrong paragraph; it also restores **silently** — tapping "Next" into a previously-visited chapter dumps you mid-page with no explanation. | Restore after `document.fonts.ready` (or anchor to an element), and skip restore / show a "resume from where you left off?" affordance when arriving via prev/next. |
| M6 | MED | `chapters/ch01.html:164–171` vs `ch02.html:123–129` | Prev/Next button markup order is inconsistent: ch01 puts the label before the SVG while ch02–ch27 put the SVG first; with `flex-direction: row-reverse` (`css/style.css:793`) ch01's "Next" arrow renders on the **wrong side**. | Standardize child order across all chapters (and drop `row-reverse` in favor of plain order). |
| M7 | MED | `css/style.css:183–184,803–812` | Touch targets under the 44px minimum: nav buttons are 38×38, the footer "Contents" link is a bare text button with ~8px padding. Chapter navigation is also *only* reachable after scrolling to the absolute bottom — a long dead zone with no way to turn the page. | Bump targets to ≥44px and add persistent prev/next affordances (edge tap zones or swipe). |
| M8 | MED | (absent) | No swipe gestures anywhere in a touch-first PWA ebook. | Add horizontal swipe (with threshold + cancel-on-vertical-scroll) for chapter turns. |
| M9 | LOW | `css/style.css:624`; `js/app.js:209–217` | Reading progress fill animates `width` with a 100ms transition behind an unthrottled scroll handler — visible rubber-banding on fast scrolls. | Drop the transition (or use `transform: scaleX` updated in rAF). |
| M10 | LOW | `js/app.js:303–318` | Bookmark feedback is an inline `style.transform = 'scale(1.2)'` + `setTimeout` — fights the stylesheet's own hover transform and feels abrupt. | Toggle a CSS class with a keyframed pop animation. |
| M11 | LOW | `js/app.js:284–296` | "Mark as read" requires a scroll event past 80% of page height — a short chapter that fits in the viewport (or ends near it) can never be marked read. | Also check the threshold once on load, or use an IntersectionObserver on the chapter-nav footer. |
| M12 | LOW | `js/app.js:376` | The `b` shortcut is the confused expression `BookmarkUI.init && document.getElementById('bookmark-btn')?.click()` — works by accident. | Call a real `Bookmarks` method. |
| M13 | LOW | `toc.html:53`; `js/app.js:350–355` | TOC progressbar never gets `aria-valuenow`; the in-chapter progress bar is `aria-hidden` with no accessible equivalent. | Set `aria-valuenow` in `TOCState.init`. |

**Progress indication:** partial credit — there *is* a scroll-linked bar and a TOC percent-complete. But there's no "Chapter 4 of 27", no position-in-book, and no time-remaining anywhere in the chapter view itself (the nav label `Ch. N — Title` is `aria-hidden` and ellipsized at 130px on phones, `css/style.css:952`).

---

## 3. Responsive & Mobile

| # | Severity | Location | Finding | Fix |
|---|----------|----------|---------|-----|
| R1 | **HIGH** | `chapters/ch23.html:54` etc. | 76-character unbreakable underscore runs overflow the prose column on any phone → horizontal scrolling / zoomed-out text for the whole chapter. | Replace with bordered input fields (see T4); interim: `overflow-wrap: anywhere` on `.prose`. |
| R2 | MED | `index.html:5`; `css/style.css:136–141,822–825` | Zero safe-area handling: no `viewport-fit=cover`, no `env(safe-area-inset-*)` anywhere. In installed/standalone mode the fixed nav sits under the notch and the floating bookmark button collides with the iOS home indicator. | Add `viewport-fit=cover` and pad fixed elements with `env(safe-area-inset-top/bottom)`. |
| R3 | MED | `css/style.css:224,231` | `min-height: 100vh` on `.page`/`.cover` — content jumps as the iOS/Android URL bar collapses. | Use `100dvh` (with `100vh` fallback). |
| R4 | MED | `manifest.json:5–6`; `index.html:8–10` vs `toc.html`/chapters | PWA config is internally contradictory: manifest `start_url`/`scope` assume a `/wired-differently/` subpath while nav JS assumes root (M4); `apple-mobile-web-app-*` metas exist **only on index.html**, so chapter pages behave differently in iOS standalone. | Pick one deployment base and align manifest, SW, JS paths, and metas; copy the apple metas to all pages. |
| R5 | LOW | `css/style.css:938–967` | Effectively one breakpoint: ≤480px tightens padding, ≥900px only adds padding. Tablets get a phone layout floating in space; no layout actually *breaks*, but nothing is designed for mid widths either. | Add a tablet tier (wider measure option, larger base size at ≥768px). |
| R6 | LOW | `css/style.css:204–213,952` | Nav chapter label capped at 180px/130px — ellipsizes nearly every title to "Ch. 12 — Daily…". | Show "Ch. 12 / 27" (short, informative) instead of the truncated title on small screens. |

---

## 4. Code Quality (as it affects the above)

| # | Severity | Location | Finding | Fix |
|---|----------|----------|---------|-----|
| C1 | **HIGH** | `sw.js:24` | Pre-cache list includes `/wired-differently/icons/icon.svg`, **which does not exist** → `cache.addAll()` rejects → the service worker never installs → the app's headline offline capability is silently dead. | Remove the entry (and cache non-critical assets individually so one 404 can't kill install). |
| C2 | MED | `sw.js:7,11–63,119–133` | Cache-first with a hand-bumped `v1` cache name and hardcoded `/wired-differently/` URLs: once C1 is fixed, every formatting fix in this audit will be invisible to returning users until someone remembers to bump the version; and the precache only matches at that exact subpath. | Move to stale-while-revalidate for HTML/CSS/JS, or generate the asset list + version at build time. |
| C3 | MED | `sw.js` vs `js/sw.js` | Two **byte-identical** service worker files; only the root one is registered. Guaranteed future drift. | Delete `js/sw.js`. |
| C4 | MED | `chapters/ch01.html:22–66` ×27, `toc.html:22–40` | ~1,500 lines of copy-pasted nav/SVG/footer boilerplate across 29 pages — every chrome change must be hand-applied 29 times (the ch01 vs ch02 button divergence in M6 is this failure mode already happening). **This is the main blocker to a clean reskin.** | Introduce a tiny build step (template + per-chapter content), or inject shared chrome client-side from `app.js`. |
| C5 | MED | `chapters/ch01.html:165`, `ch02.html:118,127`, all chapters | Inline `style="font-size:0.75rem;display:block"` repeated on every Prev/Next label — restyling the buttons requires editing 50+ inline attributes. | Replace with a `.chapter-nav__btn-kicker` class. |
| C6 | LOW | `js/app.js:307` vs `css/style.css:838` | JS fights CSS on the bookmark button: stylesheet says `display:none`, JS force-sets inline `display:flex` (plus the inline transform in M10). | Toggle a `.is-visible` class instead. |
| C7 | LOW | `css/style.css:866–899,688–700,904–912`; `css/print.css` | Dead weight that will mislead a reskin: `.font-size-controls` (chapters use `.nav__btn` instead), `.prose blockquote` (zero uses), `.loading` (zero uses); **`print.css` is linked from no page** and styles `.worksheet-*` classes that exist in no HTML — it duplicates/conflicts with the `@media print` block already in `style.css:972–993`. | Link print.css from chapter pages (it's the better print sheet) and delete the duplicate block + unused rules. |
| C8 | LOW | `icons/icons/` | Junk directory of double-extension files (`icon-72.png.png` …) shipped and cacheable. | Delete the directory. |
| C9 | LOW | `sw.js:136–140` | Offline fallback serves the **cover page** for any uncached HTML request — an offline reader tapping a chapter gets silently teleported to the cover. | Serve a dedicated offline page (or the TOC) with an explanatory message. |

---

## 5. Premium Gap Analysis (vs Kindle / Apple Books standard)

**Already present (good bones):** dark mode with system-preference sync, 4-step font sizing, per-chapter scroll memory, cover "Resume reading" link, auto read-tracking with TOC checkmarks and percent-complete, scroll progress bar, keyboard nav, offline architecture (currently broken, C1), print stylesheet (currently unlinked, C7).

**Missing or broken vs premium readers:**

| Capability | Status | Notes |
|---|---|---|
| Remembered position | ⚠️ Broken-ish | Restores to wrong offset pre-font-load and fires silently (M5). |
| Chapter transitions | ❌ | Full reload + replayed entrance animation (M2). |
| Page-turn interaction | ❌ | No swipe, no tap zones; nav buttons only at the very bottom (M7, M8). |
| Reading-position context | ❌ | No "Ch. 4 of 27", no % through book in-chapter, no time-left-in-chapter estimate. |
| Bookmarks | ❌ Dead-end | You can bookmark a chapter (`js/app.js:179–197`) but **no screen anywhere lists bookmarks** — the data is write-only. Surface them in the TOC. |
| Typography controls | ⚠️ Minimal | 4 font sizes only; no typeface choice, line-height/margin control, or sepia theme; no indication of current size or min/max when tapping A−/A+. |
| Font loading | ⚠️ | Google Fonts via CSS `@import` (`css/style.css:7`) — render-blocking serial fetch + FOUT on every chapter turn; self-host with `font-display: swap` and preload. |
| In-book search | ❌ | All 27 chapters are static and pre-cached — a client-side index is cheap to add. |
| In-chapter section nav | ❌ | Long chapters have no mini-TOC / "next section" affordance (blocked on T1's heading restoration). |
| Next-chapter preloading | ❌ | Every turn pays full network/parse; `<link rel="prefetch">` of the next chapter is one line per page. |
| Highlights / notes | ❌ | Reasonable v2; not table-stakes. |
| Offline | ❌ Broken | C1 — currently no offline at all. |

---

## Prioritized Fix List

### (a) Formatting consistency — do this first; nothing else matters while the text is broken
1. **T1/T2/T3 (HIGH):** Re-convert ch02–ch27 from the manuscript into semantic markup — real `<h2>`/`<h3>`, correct paragraph breaks, verified headings. This is one scripted conversion pass, not 26 manual edits.
2. **T4/R1 (HIGH):** Rebuild ch23's worksheets as real form markup (print.css already styles it); kills the mobile horizontal-overflow bug at the same time.
3. **T5/T6 (MED):** Apply ch01's editorial template (dividers, callouts, sub-headings) to all chapters; fix the `.prose h3` duplicate font-size.
4. **T9/T10/T11 (LOW):** Normalize quotes, add `text-wrap: pretty/balance` + `overflow-wrap`, add the missing `id` in ch01.

### (b) Mechanics / UX
5. **M1 (HIGH):** Unbind ArrowUp/ArrowDown from chapter navigation.
6. **M3 (HIGH):** Inline head script to apply theme before paint — removes the dark-mode flash on every page turn.
7. **M2 (HIGH):** View Transitions between chapters; entrance animations on first visit only.
8. **C1/C3/C9 (HIGH/LOW):** Fix the SW precache 404 so offline actually works; delete the duplicate `js/sw.js`; proper offline fallback.
9. **M4/R4 (MED):** Resolve the root-path vs `/wired-differently/` subpath contradiction across app.js, manifest, and sw.js.
10. **M5 (MED):** Font-aware scroll restore + explicit resume affordance.
11. **M6/M7/M8 (MED):** Standardize prev/next button markup, ≥44px touch targets, add swipe.
12. **C4/C5/C6 (MED):** Templatize the 29-page shared chrome and remove inline styles — prerequisite for reskinning cheaply.

### (c) Premium polish
13. Surface bookmarks in the TOC (the data layer already exists).
14. In-chapter context: "Chapter N of 27", % through book, estimated time left.
15. Self-host fonts with `font-display: swap`; prefetch the next chapter.
16. Extend typography settings: sepia theme, line-height/measure controls, current-size indicator on A−/A+.
17. Safe-area insets + `dvh` units for installed-app polish (R2/R3).
18. Per-chapter mini-TOC and client-side search (both unlocked by fix #1).
19. Link `print.css`, delete the duplicate print block and dead CSS (C7), remove `icons/icons/` junk (C8).
