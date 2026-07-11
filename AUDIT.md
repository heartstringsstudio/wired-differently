# Wired Differently — PWA Ebook Audit

**Date:** 2026-07-11 · **Scope:** full audit of reader usability, PWA correctness, performance, code health, accessibility, and discoverability. Read-only — no code changed. Supersedes the 2026-06-11 reading-experience audit (most of its HIGH findings — content re-segmentation, worksheet rebuild, path bugs, arrow-key hijack, broken SW precache — have since been fixed and are re-verified below).

## Executive Summary

The build is in good shape: all 27 chapters share one consistent template, every TOC and prev/next link resolves correctly, offline precaching is complete, and progress tracking works and survives refresh. The three problems that most hurt a reader today are the 1.9 MB cover image that dominates every launch and the service-worker payload, the splash screen that demands a tap on every single open, and the 200+ worksheet fields in Chapter 23 that silently lose everything a reader types. The service worker works but its cache-first-everything strategy means any deploy that forgets to bump the version string leaves readers stale forever. Code health is solid at the JS/CSS level but the 29 HTML pages carry hand-copied chrome (nav, footer, inline scripts) that has already drifted once (ch01's Next button). Accessibility is above average for a hand-built app, with two real gaps: muted-text contrast fails WCAG AA in both themes, and several tap targets are under 44 px.

---

## 1. Reader Usability

### Navigation & resume

| # | Sev | Location | Finding | Fix |
|---|-----|----------|---------|-----|
| U1 | **HIGH** | `index.html:47–73`, `css/style.css:1285–1322` | The book-cover splash demands a tap on **every** open of `index.html` — including every return via the "Wired Differently" brand link in the nav. There is no memory (no sessionStorage flag) and no auto-dismiss, so a returning reader pays an extra tap plus a 1.9 MB image (F1) before they can do anything. | Auto-dismiss after ~1.5 s (keep tap-to-skip), and skip it entirely within a session / for returning readers via a sessionStorage flag. |
| U2 | **HIGH** | `chapters/ch23.html` (214 inputs), `js/app.js` (0 matches for "worksheet") | Chapter 23's worksheets are now real form fields — but **nothing persists them**. Fill in a worksheet, turn the page (or the tab reloads), and every answer is gone. For a workbook aimed at ADHD readers this is silent data loss on the book's most interactive chapter. | Add a small module that saves/restores field values to localStorage (debounced, keyed `wired_ws_ch23_<n>`), plus a "clear worksheet" control. |
| U3 | MED | `index.html:126`, `css/style.css:367–373` | The resume path is buried: the "Resume: Chapter N" link is 0.8125 rem muted text below the fold of attention, and reaching it first requires dismissing the splash (U1). Fastest resume is 2 taps; via TOC it's 4. | Make resume the primary action for returning readers (full-size button above "Begin Reading"), or make the splash tap itself resume. |
| U4 | MED | `chapters/*.html` footer nav; `js/app.js:428–447` | Mid-chapter there is no way to turn the page on touch devices: prev/next live only at the absolute bottom, there are no swipe gestures or edge tap zones, and keyboard arrows are desktop-only. Long chapters (ch19–ch26 run 90–137 paragraphs) have a large dead zone. | Add horizontal swipe with a vertical-scroll cancel threshold, or persistent edge tap zones. |
| U6 | LOW | `chapters/ch01.html:176–187` vs all others | ch01's Next button puts the label before the SVG; the other 26 chapters put the SVG first. With `flex-direction: row-reverse` (`css/style.css:1019–1022`) ch01's Next arrow renders on the **left** — the only chapter where it points the wrong way. | Reorder ch01's children to match ch02–ch27. |
| U7 | LOW | `js/app.js:270–273` | Scroll restore fires in a single `requestAnimationFrame`, before web fonts settle, so the restored position can land a paragraph off; it also restores silently when you arrive via Next into a previously-read chapter. | Restore after `document.fonts.ready`; skip restore (or offer it) when arriving from prev/next. |
| U8 | LOW | `js/app.js:295–313` | Mark-as-read requires a *scroll event* past 80% — a chapter re-opened already near the bottom (restored scroll) never fires it until the reader wiggles the page. | Run the threshold check once on init as well as on scroll. |
| U9 | LOW | `css/style.css:239, 1239` | The nav chapter label is ellipsized at 180 px / 130 px, truncating most titles ("Ch. 12 of 27 — Daily…"). | Show just "Ch. 12 / 27" on small screens. |

### Reading experience / typography consistency

**Good news:** the June audit's core problem is fixed. All 27 chapters now share identical head, nav, header, and prose structure; headings are semantic `<h2>`/`<h3>`; quotes are typographic (zero `&quot;` remnants); every chapter has a unique correct `<title>` and meta description. Chapters that still drift from the pack, by filename:

| # | Sev | Location | Finding | Fix |
|---|-----|----------|---------|-----|
| U10 | LOW | `chapters/ch21.html:74–218` | ch21 is the only chapter whose main sections are `<h3>` (10 "Myth" sections) with the single `<h2>` at line 238 — an h1→h3 skip, and its section headings render in the small uppercase h3 style instead of the serif h2 style every other chapter uses. | Promote the 10 Myth headings to `<h2>` (demote none). |
| U11 | LOW | `chapters/ch01.html:115,133,150`, `ch27.html`, `ch01.html:160–163` | Editorial furniture is unevenly applied: `<hr>` dividers appear only in ch01 (3) and ch27 (1); the `.callout` box appears only in ch01; `<blockquote>` only in ch15/ch16/ch24. Not wrong per chapter, but the book's "designed" moments are concentrated in the first chapter. | Optional: add a closing callout/divider pattern to each chapter, or accept as-is. |
| U12 | LOW | `chapters/ch01.html:101` | ch01's prose div is the only one missing `id="chapter-content"` (present in ch02–ch27). Harmless today; a trap for any future script or CSS hook. | Add the id. |

### Progress tracking

Verified working: keys are consistently namespaced (`wired_lastChapter`, `wired_scroll_<ch>`, `wired_darkMode`, `wired_fontSize`, `wired_progress_<ch>`, `wired_bookmarks`), the 30 inline FOUC scripts read the same literals `js/app.js:12–19` writes, position saves on scroll (debounced 500 ms) and on `visibilitychange`, and everything survives refresh and SW updates (localStorage is origin-scoped, independent of the cache).

| # | Sev | Location | Finding | Fix |
|---|-----|----------|---------|-----|
| U13 | LOW | (architecture) | App **reinstall** is platform-dependent: on iOS, deleting the installed PWA deletes its localStorage — all progress, bookmarks, and (once U2 is fixed) worksheet answers. There is no export/backup. | Low-cost option: a "copy my progress" export/import string on the TOC page. Document the caveat either way. |

### Mobile (~380 px)

| # | Sev | Location | Finding | Fix |
|---|-----|----------|---------|-----|
| U14 | MED | `css/style.css:213–214` (38 px `.nav__btn`), `:1034–1044` (Contents text button, ~8 px padding), `:1115–1116` (28 px bookmark-remove) | Several tap targets are under the 44 px minimum; the four nav buttons are also adjacent 38 px targets, easy to mis-tap while reading one-handed. | Bump to ≥44 px hit areas (padding, not icon size). |
| U15 | MED | no `viewport-fit=cover` / `env(safe-area-inset-*)` anywhere; `css/style.css:255,262` `min-height: 100vh` | Installed/standalone on notched phones: the fixed nav sits under the status bar area and the floating bookmark button collides with the iOS home indicator; `100vh` causes content jump as the URL bar collapses (splash already uses `dvh`, the rest doesn't). | Add `viewport-fit=cover`, pad fixed elements with safe-area insets, switch to `100dvh` with fallback. |
| U16 | — | (verified good) | Text reflow is sound: `--measure: 68ch`, `overflow-x: clip` guard on `html`, the ch23 tracker table scrolls in its own container, prev/next buttons shrink correctly (the phone overflow bug is fixed). No horizontal breakage found at 380 px. | — |

---

## 2. PWA Correctness

**Verified good:** `manifest.json` is valid and complete (name, 10 icon sizes including 192/512, `start_url`/`scope` correctly set for the GitHub Pages subpath `/wired-differently/`, `display: standalone`, theme/background colors). The SW registers on all 29 pages with correct relative paths and scope; the precache list matches the repo exactly (all 27 chapters, fonts, icons — the phantom `icon.svg` from the June audit is gone), so offline reading of the whole book works after first visit. `skipWaiting`/`clients.claim` are present.

| # | Sev | Location | Finding | Fix |
|---|-----|----------|---------|-----|
| P1 | **HIGH** | `sw.js:7, 103–135` | Cache-first for **everything** with a hand-bumped version (`wired-differently-v9`): any deploy that forgets the bump leaves every returning reader on stale HTML/CSS/JS forever — the exact "stuck on stale content" failure mode. The version history (v9) shows bumps are manual and routine. | Serve HTML/CSS/JS stale-while-revalidate (or network-first with cache fallback); keep cache-first for fonts/icons/images. Then the version bump only matters for precache membership, not freshness. |
| P2 | MED | `sw.js:9–72` | Every version bump throws away and re-downloads the entire ~3.2 MB precache — dominated by the 1.9 MB cover (F1) — even for a one-line CSS fix. | Fix F1 first (biggest win); optionally split immutable assets (fonts, icons) into a separate long-lived cache that survives version bumps. |
| P3 | MED | `sw.js:128–131`, `offline.html:21,58` | The offline fallback is served **under the requested URL** (e.g. `/wired-differently/chapters/ch05.html`), but `offline.html` uses relative hrefs — its stylesheet resolves to `chapters/css/style.css` (uncached → unstyled page) and "Go to table of contents" resolves to `chapters/toc.html` (broken). Latent today because all chapters are precached, but it's the page shown exactly when things have already gone wrong. | Use root-relative or absolute URLs inside `offline.html` (or inline its CSS). |
| P4 | LOW | `sw.js:11–71,130` vs everything else | The SW hardcodes `/wired-differently/` in 60+ URLs while all pages/JS are deliberately base-path-agnostic (`js/app.js:223–235`). Correct for the current GH Pages deploy, but a rename or custom domain silently kills install + fallback. | Build the list from relative URLs resolved against `self.registration.scope`. |
| P5 | LOW | `manifest.json:14–15` | 192/512 icons declare `"purpose": "any maskable"` combined — if the artwork lacks a maskable safe zone, Android crops it into a circle badly. Also no `id` field, and `short_name` "Wired Differently" (17 chars) exceeds the ~12-char guidance and may truncate under the icon. | Provide a dedicated maskable icon pair, add `"id"`, shorten `short_name` (e.g. "Wired Diff." or "WD Manual"). |
| P6 | LOW | `index.html:24–26` only | `apple-mobile-web-app-*` metas exist only on index.html, so iOS standalone behavior differs if the app is (re)launched from a chapter URL; `theme-color` meta is a static `#2D6A6A` in both themes, so the dark-mode status bar clashes. | Copy the metas to all pages (a template job — C1); add a second `theme-color` meta with `media="(prefers-color-scheme: dark)"`. |
| P7 | LOW | (absent) | No `beforeinstallprompt` handling and no install affordance — install relies on browser defaults (omnibox icon on desktop Chrome, menu on Android, manual Share→Add on iOS). Acceptable, but ADHD readers benefit from an explicit one-tap prompt. | Optional: capture `beforeinstallprompt` and show a dismissible "Add to home screen" hint on the TOC. |

---

## 3. Performance

**Verified good:** chapters load strictly on demand (each is its own 25–50 KB page; nothing loads all 27 at once); CSS is 31 KB, JS 21 KB; fonts are self-hosted variable woff2 with `font-display: swap`; the only render-blocking resource is the single stylesheet, which is normal.

| # | Sev | Location | Finding | Fix |
|---|-----|----------|---------|-----|
| F1 | **HIGH** | `images/bookcover.png` (1,892,379 bytes, 1024×1536 PNG), `index.html:49`, `sw.js:13` | The cover is a 1.9 MB PNG — ~60% of the entire app payload. It's displayed fullscreen on **every** launch (splash, U1), precached on install, and re-downloaded on every cache-version bump (P2). | Re-encode as WebP/AVIF or quality-80 JPEG (photographic art → expect ~150–250 KB), keep dimensions. Quickest single win in the audit. |
| F2 | LOW | `icons/icons/` (10 files, `icon-*.png.png`) | Junk directory of double-extension duplicates from an icon-generation session — shipped in the repo and on Pages, referenced by nothing. | Delete the directory. |
| F3 | LOW | `css/style.css:660`, `js/app.js:206–217` | The reading-progress fill animates `width` with a 100 ms transition driven by an unthrottled scroll handler — visible rubber-banding on fast scrolls and continuous style/layout work. | Drop the transition and update `transform: scaleX()` inside a rAF guard. |
| F4 | LOW | all pages preload only `fonts/lora-var.woff2` | DM Sans (all UI text: nav, buttons, subtitles) and Lora italic load late, causing a small font-swap shift on each page. | Add the other two `<link rel="preload">`s (template job — C1). |
| F5 | LOW | `chapters/*.html` | No `<link rel="prefetch">` of the next chapter, so every page turn pays full network latency when online. One line per page. | Prefetch `chNN+1.html` (template job — C1). |

Layout shift is otherwise minimal: the fade-in animations translate content 8 px but reserve space; no images in prose; fonts are the only real shift source (F4).

---

## 4. Code Health

**Verified good:** every TOC link (27/27), every prev/next link (52/52), `initChapter()` id, `data-ch-id`, header "Chapter N of 27", and part label was checked — the chain ch01 Introduction → ch27 Final Encouragement is complete with **zero off-by-one or broken internal links**, and `js/app.js` CHAPTERS/PARTS match `toc.html` and the chapter files. `js/sw.js` (the June duplicate) is gone. No dead HTML drafts in the repo besides F2.

| # | Sev | Location | Finding | Fix |
|---|-----|----------|---------|-----|
| C1 | **HIGH** | all 29 pages | Shared chrome is hand-copied with no template: FOUC script ×30 files, SW-registration snippet ×29, top-nav block ×29 (2 variants), chapter footer ×27 (2 variants — ch01's divergence, U6, is this failure mode already happening), bookmark button ×27, inline kicker style `style="font-size:0.75rem;display:block"` ×52. Chapter metadata (number/title/subtitle/part) is maintained in **4 places**: `toc.html`, `js/app.js` CHAPTERS, each chapter's header, and both neighbors' prev/next labels. Every chrome or title change is 29+ hand edits. | Introduce a tiny generation step (one template + per-chapter content files, output committed so Pages still serves static HTML), or inject chrome client-side from `app.js`. This one fix is the prerequisite that turns half the LOW items in this audit into one-line changes. |
| C2 | MED | `css/print.css` vs `css/style.css:1259–1280` | Two competing print systems: `print.css` (the good one, with worksheet print styles) is linked only from `ch23.html:29`, while every other page falls back to the weaker inline `@media print` block in style.css. They already disagree (link-URL printing, page margins). | Link `print.css` with `media="print"` from all chapters and delete the inline block. |
| C3 | LOW | `css/style.css:1144–1171` (`.font-size-controls` — chapters use `.nav__btn` ids instead), `:1182–1190` (`.loading`), `.text-accent`, `.sr-only` (0 uses each); `css/print.css:98–100` (`.worksheet-page-break`, 0 uses) | Dead CSS that will mislead the next edit. | Delete, or (for `.sr-only`) start actually using it. |
| C4 | LOW | `js/app.js:444` | The `b` shortcut is the confused expression `BookmarkUI.init && document.getElementById('bookmark-btn')?.click()` — works by accident (truthiness of a function reference). | Call a real method: `document.getElementById('bookmark-btn')?.click()` or `Bookmarks.toggle(...)` + UI update. |
| C5 | LOW | `js/app.js:322, 331–332` vs `css/style.css:1069, 1075` | BookmarkUI fights the stylesheet with inline styles: force-sets `display:flex` over the CSS `display:none`, and animates via inline `transform` + `setTimeout` while CSS `:hover` also sets transform. | Toggle classes (`.is-visible`, keyframed `.pop`) instead of inline styles. |
| C6 | LOW | `toc.html:321` | ch13's aria-label says "Productivity Strategies for Smart, Restless Brains" while the visible title (and app.js) say "Productivity Strategies" — stale copy from an earlier title. | Align the aria-label with the visible text. |
| C7 | LOW | (absent) | No `404.html` — a mistyped/moved URL on GitHub Pages gets the default GitHub 404 with no way back into the book. | Add a small 404.html linking to the TOC. |

---

## 5. Accessibility

**Verified good:** `prefers-reduced-motion` globally disables animations *and* the view transitions (`css/style.css:1342–1355`); every page has `lang="en"`, semantic landmarks, and labeled controls; ch23's 214 inputs carry 112 `<label>`s + 153 aria-labels; icons are `aria-hidden` with text alternatives; the theme respects and tracks system preference; pinch zoom is not disabled.

| # | Sev | Location | Finding | Fix |
|---|-----|----------|---------|-----|
| A1 | MED | `css/style.css:42` (`--text-muted: #8A7F74` on `#FAF7F2` ≈ **3.7:1**), `:97` (`#6E6660` on `#141414` ≈ **3.3:1**) | Muted text fails WCAG AA (4.5:1) in both themes — and it's used for *small* text: TOC subtitles (0.8 rem), chapter numbers, the resume link, prev/next kickers, the progress label. Dark mode is the worse offender. | Darken to ~`#6F655A` (light) and lighten to ~`#8F877E` (dark); both keep the palette feel and clear 4.5:1. |
| A2 | MED | `css/style.css:57, 1174–1177, 1216–1231` | The root font size is fixed in px (`--font-size-base: 18px` on `html`), so browser/OS user font-size preferences are ignored entirely; only the in-app 4-step control (16–22 px) scales text. | Express the base as a percentage/rem multiple of the user default (e.g. `font-size: calc(1rem * var(--scale))` pattern) so OS-level scaling and the app control compose. |
| A3 | LOW | `toc.html:68–69`, `js/app.js:407–423` | The TOC progressbar has `role="progressbar"` + min/max but `aria-valuenow` is never set; the in-chapter progress bar is `aria-hidden` with no assistive equivalent. | Set `aria-valuenow` in `TOCState.init`; the visible "% complete" label partially compensates. |
| A4 | LOW | `css/style.css:829–833` | `.worksheet-field:focus` sets `outline: none`, leaving only a 1 px bottom-border color change as the focus indicator — very hard to spot. Elsewhere the app relies on default browser outlines (fine) with custom `:focus-visible` only on `.bookmark-remove`. | Give worksheet fields a visible focus style (2 px outline or box-shadow); consider a consistent `:focus-visible` treatment app-wide. |
| A5 | LOW | `chapters/ch21.html:74–218` | Heading-level skip h1→h3 (see U10) affects screen-reader outline navigation. | Same fix as U10. |
| A6 | LOW | `chapters/*.html` headers, `css/style.css:1332–1339` + `1355–1373` | Every chapter turn replays the header/prose entrance fade (100 ms stagger) **on top of** the view-transition cross-fade — a double animation on every page for motion-sensitive and attention-sensitive readers (reduced-motion users are exempt, but default users get it 27 times). Otherwise the design is calm — this is the one attention-hostile repetition. | Keep the view transition; drop the per-load `fade-in` classes from chapter pages (or run them only on first visit via sessionStorage). |

---

## 6. Discoverability

**Verified good:** all 27 chapter titles are unique and well-formed ("Ch. N: Title — Wired Differently"); all meta descriptions are unique and descriptive; no duplicates anywhere; favicons (16/32/180) exist and are linked.

| # | Sev | Location | Finding | Fix |
|---|-----|----------|---------|-----|
| D1 | MED | all 30 HTML files | Zero Open Graph / Twitter Card tags anywhere — any share of the book or a chapter renders as a bare URL with no cover, title card, or description. The 1.9 MB cover art (once optimized, F1) is sitting right there unused. | Add `og:title`, `og:description`, `og:image` (a ~1200×630 crop of the cover), `og:type: book`, and `twitter:card: summary_large_image` — per page via the C1 template. |
| D2 | LOW | `chapters/*.html:26–27` | Chapter pages link only the 32 px favicon + 180 px touch icon (index also links 16 px); no `favicon.ico` at root for legacy/agent requests. | Minor; align via template. |
| D3 | LOW | (absent) | No canonical URLs, no `robots.txt`/`sitemap.xml`. For a 27-page book this is cheap insurance against odd crawling of the Pages subpath. | Optional: add a sitemap listing the 29 pages. |

---

## Top 10 Fixes by Impact

Ordered for one-PR-at-a-time implementation; each is independent unless noted.

| # | Fix | Findings | Effort |
|---|-----|----------|--------|
| 1 | Re-encode `images/bookcover.png` → WebP/JPEG ≤ 250 KB | F1, P2 | **quick** |
| 2 | Splash: auto-dismiss + skip for returning readers; make Resume the prominent action on the cover | U1, U3 | **quick** |
| 3 | Persist Chapter 23 worksheet inputs to localStorage (debounced save/restore + clear button) | U2 | **moderate** |
| 4 | SW: stale-while-revalidate for HTML/CSS/JS, cache-first for fonts/icons; switch precache list to scope-relative URLs | P1, P4 | **moderate** |
| 5 | Fix `offline.html` link/stylesheet resolution (root-relative hrefs or inlined CSS) | P3 | **quick** |
| 6 | Contrast + tap targets: bump `--text-muted` both themes to ≥4.5:1; ≥44 px hit areas on nav buttons, Contents link, bookmark-remove | A1, U14 | **quick** |
| 7 | Stop replaying entrance animations on chapter turns (remove `fade-in` from chapter pages; keep view transitions) | A6, U5 | **quick** |
| 8 | Add swipe / edge-tap chapter navigation on touch devices | U4 | **moderate** |
| 9 | Templatize the 29-page shared chrome (single source for nav, footer, metas, scripts; chapter metadata in one place) — unlocks F4, F5, P6, D1, D2, U6, U12 as one-line follow-ups | C1 | **significant** |
| 10 | Batch of one-liners: ch01 Next-button order (U6), ch21 headings (U10/A5), `b`-key handler (C4), toc ch13 aria-label (C6), `aria-valuenow` (A3), worksheet focus style (A4), delete `icons/icons/` (F2) + dead CSS (C3), link `print.css` everywhere (C2) | — | **quick** |

**Suggested order rationale:** #1–#2 change what every reader feels on every open; #3 stops active data loss; #4–#5 make updates and offline failure honest; #6–#8 are the mobile-reader polish; #9 is the investment that makes everything after it cheap; #10 sweeps the floor.
