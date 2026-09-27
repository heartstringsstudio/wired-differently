/**
 * WIRED DIFFERENTLY — App Logic
 * Navigation, progress tracking, localStorage, dark mode
 * Vanilla JS — no dependencies
 */

'use strict';

/* ============================================================
   Constants
   ============================================================ */
const LS = {
  LAST_CHAPTER:  'wired_lastChapter',
  SCROLL_PREFIX: 'wired_scroll_',
  DARK_MODE:     'wired_darkMode',
  FONT_SIZE:     'wired_fontSize',
  PROGRESS:      'wired_progress_',
  BOOKMARKS:     'wired_bookmarks',
  WORKSHEET:     'wired_worksheet_',
  THEME:         'wired_theme',
  LEADING:       'wired_leading',
  MARGINS:       'wired_margins',
  TYPEFACE:      'wired_typeface',
  IMMERSIVE_HINT:'wired_immersiveHint',
};

/* mins: reading time at ReadingTime.WPM with form text excluded — the
   same rule ReadingTime applies live. Recompute if chapter text changes. */
const CHAPTERS = [
  { id: 'ch01', num: 1,  title: 'Introduction',                     subtitle: 'What It Feels Like to Be You',                                              mins:  4, part: 1 },
  { id: 'ch02', num: 2,  title: 'What ADHD Actually Is',            subtitle: 'Not a Focus Problem. Not a Willpower Problem.',                             mins:  9, part: 1 },
  { id: 'ch03', num: 3,  title: 'What High IQ + ADHD Actually Means', subtitle: 'Intelligence Doesn\'t Cancel ADHD. It Disguises It.',                    mins: 10, part: 1 },
  { id: 'ch04', num: 4,  title: 'Twice-Exceptionality',             subtitle: 'When "Gifted" and "Struggling" Live in the Same Brain',                     mins: 11, part: 1 },
  { id: 'ch05', num: 5,  title: 'Common Signs and Patterns',        subtitle: 'The Specific Ways This Profile Shows Up in Real Life',                      mins: 15, part: 1 },
  { id: 'ch06', num: 6,  title: 'Strengths',                        subtitle: 'What\'s Actually There — Without the Mythology',                            mins: 11, part: 1 },
  { id: 'ch07', num: 7,  title: 'Challenges',                       subtitle: 'The Real Costs — Named Clearly, Without Flinching',                         mins: 14, part: 1 },
  { id: 'ch08', num: 8,  title: 'Why High IQ Can Delay Diagnosis',  subtitle: 'The Smarter You Are, The Longer It Can Take',                               mins: 14, part: 2 },
  { id: 'ch09', num: 9,  title: 'Diagnosis and Professional Evaluation', subtitle: 'What a Good Evaluation Actually Looks Like',                           mins: 14, part: 2 },
  { id: 'ch10', num: 10, title: 'Treatment Options',                subtitle: 'What Actually Works, and What the Evidence Says',                           mins: 17, part: 2 },
  { id: 'ch11', num: 11, title: 'The High-IQ ADHD Operating System', subtitle: 'A Working Model of Your Brain — Built for Actually Using It',             mins: 17, part: 3 },
  { id: 'ch12', num: 12, title: 'Daily Life Strategies',            subtitle: 'Practical Tools for a Brain That Doesn\'t Run on Willpower',               mins: 20, part: 4 },
  { id: 'ch13', num: 13, title: 'Productivity Strategies',          subtitle: 'Building Systems That Engage Rather Than Demand',                           mins: 18, part: 4 },
  { id: 'ch14', num: 14, title: 'Emotional Regulation',             subtitle: 'Feeling Everything at Full Volume — and Learning to Work With It',          mins: 20, part: 4 },
  { id: 'ch15', num: 15, title: 'Relationships',                    subtitle: 'How ADHD Affects the People You Love — and What Actually Helps',            mins: 18, part: 4 },
  { id: 'ch16', num: 16, title: 'Work and Career',                  subtitle: 'Finding Where You Thrive, Managing Where You Don\'t',                       mins: 19, part: 4 },
  { id: 'ch17', num: 17, title: 'Learning and Education',           subtitle: 'How the Gifted ADHD Brain Actually Learns',                                 mins: 20, part: 4 },
  { id: 'ch18', num: 18, title: 'Creativity and Entrepreneurship',  subtitle: 'The Engine, the Risks, and Building Something Sustainable',                 mins: 21, part: 4 },
  { id: 'ch19', num: 19, title: 'Burnout and Recovery',             subtitle: 'When the Compensation System Finally Runs Out',                             mins: 21, part: 5 },
  { id: 'ch20', num: 20, title: 'Health Habits',                    subtitle: 'The Physical Infrastructure of a Functioning ADHD Brain',                   mins: 23, part: 5 },
  { id: 'ch21', num: 21, title: 'Myths and Misunderstandings',      subtitle: 'The False Beliefs That Have Done the Most Damage',                          mins: 20, part: 6 },
  { id: 'ch22', num: 22, title: 'Self-Assessment Reflection Questions', subtitle: 'Not a Test — A Conversation With Yourself',                            mins: 16, part: 7 },
  { id: 'ch23', num: 23, title: 'Practical Worksheets',             subtitle: 'Tools You Can Actually Use',                                                mins: 13, part: 7 },
  { id: 'ch24', num: 24, title: 'Scripts',                          subtitle: 'What to Say When You Don\'t Know What to Say',                             mins: 22, part: 7 },
  { id: 'ch25', num: 25, title: 'The 30-Day Action Plan',           subtitle: 'A Structured First Month',                                                  mins: 19, part: 7 },
  { id: 'ch26', num: 26, title: 'Resources',                        subtitle: 'Going Further',                                                             mins: 21, part: 8 },
  { id: 'ch27', num: 27, title: 'Final Encouragement',              subtitle: 'A Letter to Close',                                                         mins: 10, part: 9 },
];

const PARTS = [
  { num: 1, label: 'Part One',   title: 'Understanding the Profile',   chapters: [1,2,3,4,5,6,7] },
  { num: 2, label: 'Part Two',   title: 'Getting Accurate Help',        chapters: [8,9,10] },
  { num: 3, label: 'Part Three', title: 'Understanding Your Operating System', chapters: [11] },
  { num: 4, label: 'Part Four',  title: 'Practical Strategies',         chapters: [12,13,14,15,16,17,18] },
  { num: 5, label: 'Part Five',  title: 'Sustainability',               chapters: [19,20] },
  { num: 6, label: 'Part Six',   title: 'Clearing the Ground',          chapters: [21] },
  { num: 7, label: 'Part Seven', title: 'The Work Itself',              chapters: [22,23,24,25] },
  { num: 8, label: 'Part Eight', title: 'Going Further',                chapters: [26] },
  { num: 9, label: 'Closing',    title: 'Final Encouragement',          chapters: [27] },
];

/* ============================================================
   Storage Helpers
   ============================================================ */
const Storage = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota exceeded */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  }
};

/* ============================================================
   Theme Manager
   Four reading palettes. Paper/Sepia render on the light base and
   Night/Black on the dark base, so data-theme stays 'light'/'dark'
   for every existing rule and data-palette layers on top. Until the
   reader picks one explicitly, the system preference decides (and the
   legacy wired_darkMode flag is honoured).
   ============================================================ */
const Theme = {
  palettes: ['paper', 'sepia', 'night', 'black'],
  isDark(palette) { return palette === 'night' || palette === 'black'; },
  saved() {
    const p = Storage.get(LS.THEME);
    if (this.palettes.includes(p)) return p;
    const legacy = Storage.get(LS.DARK_MODE);
    return legacy === null ? null : (legacy ? 'night' : 'paper');
  },
  current() {
    return this.saved() ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'paper');
  },
  init() {
    this.apply(this.current());
    // Follow the system until the reader chooses a palette
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (this.saved() === null) this.apply(e.matches ? 'night' : 'paper');
    });
  },
  apply(palette) {
    const root = document.documentElement;
    root.setAttribute('data-palette', palette);
    root.setAttribute('data-theme', this.isDark(palette) ? 'dark' : 'light');
    this.updateToggle(this.isDark(palette));
    document.dispatchEvent(new CustomEvent('wired:palette', { detail: palette }));
  },
  set(palette) {
    if (!this.palettes.includes(palette)) return;
    Storage.set(LS.THEME, palette);
    this.apply(palette);
  },
  toggle() {
    this.set(this.isDark(this.current()) ? 'paper' : 'night');
  },
  updateToggle(isDark) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.querySelector('.icon-sun')?.classList.toggle('hidden', !isDark);
    btn.querySelector('.icon-moon')?.classList.toggle('hidden', isDark);
  }
};

/* ============================================================
   Reading Preferences — text size, line spacing, margins, typeface
   Each maps to a data-* attribute on <html>; the CSS does the rest.
   The inline head script applies the same attributes before first
   paint, so keep the storage keys and attribute names in sync.
   ============================================================ */
const Prefs = {
  defs: {
    fontSize: { key: LS.FONT_SIZE, attr: 'data-font-size', def: 'md',
                values: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] },
    leading:  { key: LS.LEADING,   attr: 'data-leading',   def: 'normal',
                values: ['tight', 'normal', 'loose'] },
    margins:  { key: LS.MARGINS,   attr: 'data-margins',   def: 'normal',
                values: ['narrow', 'normal', 'wide'] },
    typeface: { key: LS.TYPEFACE,  attr: 'data-typeface',  def: 'serif',
                values: ['serif', 'sans', 'hyper'] },
  },
  get(name) {
    const d = this.defs[name];
    const v = Storage.get(d.key);
    return d.values.includes(v) ? v : d.def;
  },
  init() {
    Object.keys(this.defs).forEach(name => this.apply(name, this.get(name)));
  },
  apply(name, value) {
    document.documentElement.setAttribute(this.defs[name].attr, value);
  },
  set(name, value) {
    const d = this.defs[name];
    if (!d.values.includes(value)) return;
    ReadingPlace.keep(() => this.apply(name, value));
    Storage.set(d.key, value);
  },
  step(name, delta) {
    const d = this.defs[name];
    const i = d.values.indexOf(this.get(name)) + delta;
    if (i >= 0 && i < d.values.length) this.set(name, d.values[i]);
  },
  reset() {
    ReadingPlace.keep(() => {
      Object.entries(this.defs).forEach(([name, d]) => {
        Storage.remove(d.key);
        this.apply(name, d.def);
      });
    });
  }
};

/* Keep the paragraph at the top of the screen in place while the layout
   reflows (bigger text, wider margins…) so the reader never loses the line */
const ReadingPlace = {
  keep(change) {
    const content = document.getElementById('chapter-content');
    const probeY = document.querySelector('.nav')?.getBoundingClientRect().bottom + 12 || 12;
    const hit = content && document.elementFromPoint(window.innerWidth / 2, probeY);
    const anchor = hit && content.contains(hit)
      ? hit.closest('p, li, h2, h3, h4, blockquote, table, fieldset, .callout') : null;
    const before = anchor?.getBoundingClientRect().top;
    change();
    if (anchor) {
      const root = document.documentElement;
      root.style.scrollBehavior = 'auto';
      window.scrollBy(0, anchor.getBoundingClientRect().top - before);
      root.style.scrollBehavior = '';
    }
  }
};

/* ============================================================
   Progress Tracker
   ============================================================ */
const Progress = {
  markRead(chId) {
    Storage.set(LS.PROGRESS + chId, true);
  },
  isRead(chId) {
    return Storage.get(LS.PROGRESS + chId, false);
  },
  getCount() {
    return CHAPTERS.filter(ch => this.isRead(ch.id)).length;
  },
  getPercent() {
    return Math.round((this.getCount() / CHAPTERS.length) * 100);
  },
  saveScroll(chId, position) {
    Storage.set(LS.SCROLL_PREFIX + chId, position);
  },
  getScroll(chId) {
    return Storage.get(LS.SCROLL_PREFIX + chId, 0);
  },
  saveLastChapter(chId) {
    Storage.set(LS.LAST_CHAPTER, chId);
  },
  getLastChapter() {
    return Storage.get(LS.LAST_CHAPTER);
  }
};

/* ============================================================
   Bookmarks
   ============================================================ */
const Bookmarks = {
  getAll() {
    return Storage.get(LS.BOOKMARKS, []);
  },
  toggle(chId) {
    const bookmarks = this.getAll();
    const idx = bookmarks.indexOf(chId);
    if (idx === -1) {
      bookmarks.push(chId);
    } else {
      bookmarks.splice(idx, 1);
    }
    Storage.set(LS.BOOKMARKS, bookmarks);
    return idx === -1; // true = now bookmarked
  },
  isBookmarked(chId) {
    return this.getAll().includes(chId);
  }
};

/* ============================================================
   Reading Progress Bar (scroll-linked)
   ============================================================ */
const ReadingProgressBar = {
  el: null,
  fill: null,
  ticking: false,
  init() {
    this.el = document.getElementById('reading-progress-bar');
    this.fill = document.getElementById('reading-progress-fill');
    if (!this.el) return;
    window.addEventListener('scroll', () => {
      if (this.ticking) return;
      this.ticking = true;
      requestAnimationFrame(() => {
        this.update();
        this.ticking = false;
      });
    }, { passive: true });
    this.update();
  },
  update() {
    if (!this.fill) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    this.fill.style.transform = `scaleX(${pct / 100})`;
  },
  show() { if (this.el) this.el.style.display = 'block'; },
  hide() { if (this.el) this.el.style.display = 'none'; }
};

/* ============================================================
   Paths — base-path-agnostic URLs
   Mirrors the relative-link convention used by the static HTML so
   navigation works whether the app is served at the domain root or
   under a subpath (e.g. /wired-differently/). Never hard-code a
   leading slash here — that would break the deployed base path.
   ============================================================ */
const Paths = {
  inChapters() { return /\/chapters\//.test(window.location.pathname); },
  root()       { return this.inChapters() ? '../' : ''; },
  toc()        { return this.root() + 'toc.html'; },
  index()      { return this.root() + 'index.html'; },
  chapter(id)  { return this.root() + 'chapters/' + id + '.html'; }
};

/* ============================================================
   Navigation — Chapter-to-Chapter
   ============================================================ */
const Nav = {
  chapterFromPath() {
    const path = window.location.pathname;
    const match = path.match(/ch(\d{2})\.html/);
    if (match) return CHAPTERS.find(c => c.id === 'ch' + match[1]);
    return null;
  },
  getChapterByNum(num) {
    return CHAPTERS.find(c => c.num === num) || null;
  },
  goToTOC() {
    window.location.href = Paths.toc();
  },
  goToChapter(chId) {
    window.location.href = Paths.chapter(chId);
  },
  goToCover() {
    window.location.href = Paths.index();
  }
};

/* ============================================================
   Scroll Persistence
   ============================================================ */
const ScrollPersist = {
  chId: null,
  saveTimer: null,
  init(chId, { restore = true } = {}) {
    this.chId = chId;
    // Restore saved position (skipped when a search result decides where to land)
    const saved = Progress.getScroll(chId);
    if (restore && saved > 0) {
      // Jump straight to the saved spot; the page-wide smooth scrolling
      // would otherwise animate down from the top on every open
      const restore = () => requestAnimationFrame(() => {
        const root = document.documentElement;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, saved);
        root.style.scrollBehavior = '';
      });
      if (document.fonts?.ready) document.fonts.ready.then(restore);
      else restore();
    }
    // Save on scroll (debounced)
    window.addEventListener('scroll', () => {
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        Progress.saveScroll(chId, window.scrollY);
        Progress.saveLastChapter(chId);
      }, 500);
    }, { passive: true });
    // Save on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        Progress.saveScroll(chId, window.scrollY);
        Progress.saveLastChapter(chId);
      }
    });
  }
};

/* ============================================================
   Mark-as-Read (triggers when user reaches bottom ~80%)
   ============================================================ */
const AutoRead = {
  init(chId) {
    let marked = Progress.isRead(chId);
    if (marked) return;
    const check = () => {
      if (marked) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total > 0.8) {
        marked = true;
        Progress.markRead(chId);
        document.dispatchEvent(new CustomEvent('wired:read', { detail: chId }));
        // Update checkmark in any TOC links visible
        document.querySelectorAll(`[data-ch="${chId}"]`).forEach(el => {
          el.classList.add('is-read');
        });
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
  }
};

/* ============================================================
   Worksheet Persistence (chapters with form fields, e.g. ch23)
   Snapshots every input/textarea inside #chapter-content to
   localStorage so answers survive navigation and reloads. Fields
   are keyed by DOM position, which is stable because chapter
   content is final. No-op on chapters without fields.
   ============================================================ */
const WorksheetPersist = {
  chId: null,
  fields: [],
  saveTimer: null,

  init(chId) {
    const container = document.getElementById('chapter-content');
    if (!container) return;
    this.fields = Array.from(container.querySelectorAll('input, textarea, select'));
    if (this.fields.length === 0) return;
    this.chId = chId;

    this.restore();

    container.addEventListener('input', () => this.scheduleSave());
    container.addEventListener('change', () => this.scheduleSave());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.save();
    });

    this.addClearControl(container);
  },

  key() {
    return LS.WORKSHEET + this.chId;
  },

  scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 400);
  },

  save() {
    clearTimeout(this.saveTimer);
    const data = {};
    this.fields.forEach((el, i) => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.checked) data[i] = true;
      } else if (el.value !== '') {
        data[i] = el.value;
      }
    });
    Storage.set(this.key(), data);
  },

  restore() {
    const data = Storage.get(this.key());
    if (!data) return;
    this.fields.forEach((el, i) => {
      if (!(i in data)) return;
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = true;
      } else {
        el.value = data[i];
      }
    });
  },

  clear() {
    Storage.remove(this.key());
    this.fields.forEach(el => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = '';
      }
    });
  },

  addClearControl(container) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'worksheet-clear-btn';
    btn.textContent = 'Clear saved answers';
    btn.setAttribute('aria-label', 'Clear all saved answers in this chapter');
    btn.addEventListener('click', () => {
      if (window.confirm('Clear all saved answers in this chapter? This cannot be undone.')) {
        this.clear();
      }
    });
    container.appendChild(btn);
  }
};

/* ============================================================
   Bookmark Button Init (in chapter pages)
   ============================================================ */
const BookmarkUI = {
  init(chId) {
    const btn = document.getElementById('bookmark-btn');
    if (!btn) return;
    btn.style.display = 'flex';

    // Set initial state
    if (Bookmarks.isBookmarked(chId)) btn.classList.add('is-bookmarked');

    btn.addEventListener('click', () => {
      const isNow = Bookmarks.toggle(chId);
      btn.classList.toggle('is-bookmarked', isNow);
      // Brief visual feedback
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => { btn.style.transform = ''; }, 200);
    });
  }
};

/* ============================================================
   Bookmark List (TOC page)
   Renders saved bookmarks as a section at the top of the TOC, in
   chapter order, each row matching the native .toc__link styling
   with an inline remove control. Hidden entirely when empty.
   ============================================================ */
const BookmarkList = {
  init() {
    this.section = document.getElementById('toc-bookmarks');
    this.list = document.getElementById('bookmark-list');
    if (!this.section || !this.list) return;
    this.render();
  },
  render() {
    const ids = Bookmarks.getAll();
    // Show in chapter order regardless of when each was added
    const items = CHAPTERS.filter(c => ids.includes(c.id));
    if (items.length === 0) {
      this.section.hidden = true;
      this.list.innerHTML = '';
      return;
    }
    this.section.hidden = false;
    this.list.innerHTML = items.map(ch => `
      <li class="toc__item bookmark-item" data-ch="${ch.id}">
        <a class="toc__link" href="${Paths.chapter(ch.id)}"
           aria-label="Bookmarked — Chapter ${ch.num}: ${this._esc(ch.title)}">
          <span class="toc__ch-num">Ch. ${ch.num}</span>
          <span class="toc__ch-content">
            <span class="toc__ch-title">${this._esc(ch.title)}</span>
            <span class="toc__ch-subtitle">${this._esc(ch.subtitle)}</span>
          </span>
        </a>
        <button class="bookmark-remove" type="button"
                aria-label="Remove bookmark for Chapter ${ch.num}">&times;</button>
      </li>`).join('');

    this.list.querySelectorAll('.bookmark-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.closest('.bookmark-item').dataset.ch;
        Bookmarks.toggle(id); // toggling an existing bookmark removes it
        this.render();
      });
    });
  },
  _esc(s) {
    return String(s).replace(/[&<>"]/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
};

/* ============================================================
   Cover Page — Resume Reading Link
   ============================================================ */
const CoverResume = {
  init() {
    const last = Progress.getLastChapter();
    if (!last) return;
    const ch = CHAPTERS.find(c => c.id === last);
    if (!ch) return;
    const el = document.getElementById('resume-reading');
    if (!el) return;
    el.innerHTML = `
      <a href="${Paths.chapter(ch.id)}" target="_self" data-direct-nav class="cover__resume-btn"
         aria-label="Continue reading — Chapter ${ch.num}: ${ch.title}">
        <span class="cover__resume-btn-kicker">Continue reading</span>
        <span class="cover__resume-btn-title">Ch. ${ch.num} — ${ch.title}</span>
      </a>`;
    el.classList.add('visible');
    // Returning readers resume; starting over becomes the secondary action
    document.querySelector('.cover__enter-btn')?.classList.add('cover__enter-btn--secondary');
  }
};

/* ============================================================
   Embedded Browser Compatibility
   Facebook/Messenger/Instagram WebViews occasionally suppress ordinary
   anchor navigation around animated overlays. Use an explicit same-window
   location change for the cover's primary actions in those environments.
   ============================================================ */
const EmbeddedBrowserCompat = {
  isEmbedded() {
    return document.documentElement.hasAttribute('data-embedded-browser') ||
      /FBAN|FBAV|FB_IAB|Messenger|Instagram/i.test(navigator.userAgent);
  },
  init() {
    if (!this.isEmbedded()) return;
    document.querySelectorAll('a[data-direct-nav]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        window.location.assign(link.href);
      });
    });
  }
};

/* ============================================================
   TOC — Render dynamic state (read markers, current chapter)
   ============================================================ */
const TOCState = {
  init() {
    const last = Progress.getLastChapter();
    // Mark read chapters
    document.querySelectorAll('.toc__link[data-ch]').forEach(link => {
      const chId = link.dataset.ch;
      if (Progress.isRead(chId)) link.classList.add('is-read');
      if (chId === last) link.classList.add('is-current');
    });
    // Update progress bar
    const fill = document.getElementById('toc-progress-fill');
    const label = document.getElementById('toc-progress-label');
    const pct = Progress.getPercent();
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '% complete';
    document.getElementById('toc-progress-fill-wrap')?.setAttribute('aria-valuenow', String(pct));
  }
};

/* Register once from the shared script so service-worker behavior cannot
   drift between the cover, contents, and chapter templates. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(Paths.root() + 'sw.js').catch(() => {});
  });
}

/* ============================================================
   Reader Settings Panel ("Aa")
   A native <dialog>: focus trapping, Esc and inertness come for free.
   Built once from JS so no page template has to carry its markup.
   Every control applies live, so the reader sees the page change
   behind the lightly dimmed backdrop.
   ============================================================ */
const ReaderSettings = {
  dialog: null,

  groups: [
    { name: 'typeface', label: 'Typeface', options: [
      { value: 'serif', label: 'Serif',        face: 'Aa' },
      { value: 'sans',  label: 'Sans',         face: 'Aa' },
      { value: 'hyper', label: 'Hyperlegible', face: 'Aa' } ] },
    { name: 'leading', label: 'Line spacing', options: [
      { value: 'tight',  label: 'Compact' },
      { value: 'normal', label: 'Standard' },
      { value: 'loose',  label: 'Airy' } ] },
    { name: 'margins', label: 'Margins', options: [
      { value: 'narrow', label: 'Narrow' },
      { value: 'normal', label: 'Standard' },
      { value: 'wide',   label: 'Wide' } ] },
  ],

  palettes: [
    { value: 'paper', label: 'Paper' },
    { value: 'sepia', label: 'Sepia' },
    { value: 'night', label: 'Night' },
    { value: 'black', label: 'Black' },
  ],

  icons: {
    // Line spacing: three lines whose gap grows left to right
    leading: {
      tight:  '<path d="M5 8h14M5 12h14M5 16h14"/>',
      normal: '<path d="M5 6.5h14M5 12h14M5 17.5h14"/>',
      loose:  '<path d="M5 5h14M5 12h14M5 19h14"/>',
    },
    // Margins: a page outline with a text block that narrows
    margins: {
      narrow: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M6 8.5h12M6 12h12M6 15.5h12"/>',
      normal: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M7.5 8.5h9M7.5 12h9M7.5 15.5h9"/>',
      wide:   '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M9 8.5h6M9 12h6M9 15.5h6"/>',
    },
  },

  init() {
    const trigger = document.getElementById('reader-settings-btn');
    if (!trigger) return;
    this.trigger = trigger;
    trigger.addEventListener('click', () => this.open());
  },

  build() {
    const d = document.createElement('dialog');
    d.className = 'reader-settings';
    d.id = 'reader-settings';
    d.setAttribute('aria-labelledby', 'rs-title');
    const radios = g => g.options.map(o => `
        <label class="rs-opt">
          <input type="radio" name="rs-${g.name}" value="${o.value}">
          <span class="rs-opt__face${g.name === 'typeface' ? ' rs-opt__face--' + o.value : ''}">
            ${o.face ? `<span class="rs-opt__sample" aria-hidden="true">${o.face}</span>`
                     : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${this.icons[g.name][o.value]}</svg>`}
            <span class="rs-opt__label">${o.label}</span>
          </span>
        </label>`).join('');

    d.innerHTML = `
      <div class="reader-settings__inner">
        <div class="reader-settings__grip" aria-hidden="true"></div>
        <header class="reader-settings__head">
          <h2 class="reader-settings__title" id="rs-title">Reading settings</h2>
          <button type="button" class="reader-settings__done" data-close>Done</button>
        </header>

        <div class="rs-row" role="group" aria-labelledby="rs-size-label">
          <span class="rs-label" id="rs-size-label">Text size</span>
          <div class="rs-size">
            <button type="button" class="rs-size__btn rs-size__btn--down" data-size="-1" aria-label="Smaller text">A</button>
            <div class="rs-size__track" aria-hidden="true">
              ${Prefs.defs.fontSize.values.map(() => '<span class="rs-size__dot"></span>').join('')}
            </div>
            <button type="button" class="rs-size__btn rs-size__btn--up" data-size="1" aria-label="Larger text">A</button>
          </div>
          <output class="sr-only" id="rs-size-status" aria-live="polite"></output>
        </div>

        ${this.groups.map(g => `
        <fieldset class="rs-row">
          <legend class="rs-label">${g.label}</legend>
          <div class="rs-seg">${radios(g)}</div>
        </fieldset>`).join('')}

        <fieldset class="rs-row">
          <legend class="rs-label">Theme</legend>
          <div class="rs-seg rs-seg--themes">
            ${this.palettes.map(p => `
            <label class="rs-opt">
              <input type="radio" name="rs-palette" value="${p.value}">
              <span class="rs-opt__face rs-swatch rs-swatch--${p.value}">
                <span class="rs-swatch__chip" aria-hidden="true">Aa</span>
                <span class="rs-opt__label">${p.label}</span>
              </span>
            </label>`).join('')}
          </div>
        </fieldset>

        <button type="button" class="rs-reset">Reset text settings</button>
      </div>`;

    d.addEventListener('change', e => {
      const input = e.target;
      if (input.name === 'rs-palette') Theme.set(input.value);
      else Prefs.set(input.name.replace('rs-', ''), input.value);
    });
    d.addEventListener('click', e => {
      const sizeBtn = e.target.closest('[data-size]');
      if (sizeBtn) { Prefs.step('fontSize', Number(sizeBtn.dataset.size)); this.sync(true); return; }
      if (e.target.closest('[data-close]')) { this.close(); return; }
      if (e.target.closest('.rs-reset')) { Prefs.reset(); this.sync(); return; }
      // Tap on the backdrop (the dialog box itself, outside the sheet) closes
      if (e.target === d) this.close();
    });
    d.addEventListener('close', () => {
      document.body.classList.remove('is-settings-open');
      this.trigger?.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('wired:palette', () => this.sync());

    document.body.appendChild(d);
    this.dialog = d;
  },

  sync(announce = false) {
    const d = this.dialog;
    if (!d) return;
    ['typeface', 'leading', 'margins'].forEach(name => {
      const el = d.querySelector(`input[name="rs-${name}"][value="${Prefs.get(name)}"]`);
      if (el) el.checked = true;
    });
    const pal = d.querySelector(`input[name="rs-palette"][value="${Theme.current()}"]`);
    if (pal) pal.checked = true;

    const sizes = Prefs.defs.fontSize.values;
    const idx = sizes.indexOf(Prefs.get('fontSize'));
    d.querySelectorAll('.rs-size__dot').forEach((dot, i) => dot.classList.toggle('is-on', i <= idx));
    d.querySelector('.rs-size__btn--down').disabled = idx === 0;
    d.querySelector('.rs-size__btn--up').disabled = idx === sizes.length - 1;
    if (announce) d.querySelector('#rs-size-status').textContent = `Text size ${idx + 1} of ${sizes.length}`;
  },

  open() {
    if (!this.dialog) this.build();
    this.sync();
    Immersive.show();
    document.body.classList.add('is-settings-open');
    this.trigger?.setAttribute('aria-expanded', 'true');
    if (typeof this.dialog.showModal === 'function') this.dialog.showModal();
    else this.dialog.setAttribute('open', '');
  },

  close() {
    if (!this.dialog) return;
    if (typeof this.dialog.close === 'function') this.dialog.close();
    else { this.dialog.removeAttribute('open'); this.dialog.dispatchEvent(new Event('close')); }
  },

  isOpen() { return Boolean(this.dialog?.open); }
};

/* ============================================================
   Immersive Reading
   Chrome (nav bar, bookmark button) slides away while reading forward
   and returns on scroll-up, at either end of the chapter, on a tap in
   the page, or when keyboard focus moves into it. The progress hairline
   stays, riding up to the top edge.
   ============================================================ */
const Immersive = {
  active: false,
  pointerType: '',

  init() {
    this.meta = document.querySelector('meta[name="theme-color"]');
    this.navColor = this.meta?.getAttribute('content') || '#06101F';
    let lastY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 96;
        if (ReaderSettings.isOpen() || y < 96 || atEnd) this.show();
        else if (y > lastY + 6) this.hide();
        else if (y < lastY - 6) this.show();
        lastY = y;
        ticking = false;
      });
    }, { passive: true });

    // Tap anywhere in the text toggles the chrome, touch/pen only, so a
    // desktop click to place the caret or select text never does
    document.addEventListener('pointerdown', e => { this.pointerType = e.pointerType; }, { passive: true });
    document.addEventListener('click', e => {
      if (this.pointerType !== 'touch' && this.pointerType !== 'pen') return;
      if (e.target.closest('a, button, input, textarea, select, label, summary, dialog, .nav, [contenteditable]')) return;
      if (!window.getSelection()?.isCollapsed) return;
      if (window.scrollY < 96) return;
      this.active ? this.show() : this.hide();
    });

    // Keyboard users tabbing into hidden chrome bring it back
    document.addEventListener('focusin', e => {
      if (e.target.closest('.nav, .bookmark-btn')) this.show();
    });

    document.addEventListener('wired:palette', () => this.paintStatusBar());
  },

  hide() {
    if (this.active) return;
    this.active = true;
    document.body.classList.add('is-immersive');
    this.paintStatusBar();
    this.hintOnce();
  },

  show() {
    if (!this.active) return;
    this.active = false;
    document.body.classList.remove('is-immersive');
    this.paintStatusBar();
  },

  // Browser/status-bar tint follows whatever sits at the top edge
  paintStatusBar() {
    if (!this.meta) return;
    const page = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
    this.meta.setAttribute('content', this.active && page ? page : this.navColor);
  },

  hintOnce() {
    if (Storage.get(LS.IMMERSIVE_HINT)) return;
    Storage.set(LS.IMMERSIVE_HINT, true);
    const tip = document.createElement('div');
    tip.className = 'reader-hint';
    tip.setAttribute('role', 'status');
    tip.textContent = matchMedia('(pointer: coarse)').matches
      ? 'Tap the page or scroll up to show controls'
      : 'Scroll up to show controls';
    document.body.appendChild(tip);
    requestAnimationFrame(() => tip.classList.add('is-visible'));
    setTimeout(() => {
      tip.classList.remove('is-visible');
      setTimeout(() => tip.remove(), 400);
    }, 3200);
  }
};

/* ============================================================
   Touch Navigation — deliberate horizontal swipe only
   ============================================================ */
const TouchNav = {
  startX: 0,
  startY: 0,
  startedOnControl: false,
  init(chapterNum) {
    document.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      this.startedOnControl = Boolean(e.target.closest('a, button, input, textarea, select, label'));
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', e => {
      if (this.startedOnControl || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - this.startX;
      const dy = e.changedTouches[0].clientY - this.startY;
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      const target = Nav.getChapterByNum(chapterNum + (dx < 0 ? 1 : -1));
      if (target) window.location.href = Paths.chapter(target.id);
    }, { passive: true });
  }
};

/* ============================================================
   Search Text — one matching rule shared by the TOC index and the
   in-chapter highlighter, so "hit 3" means the same match in both.
   Whitespace in the query matches any run of whitespace; skipped
   elements are form controls whose text isn't reading text.
   ============================================================ */
const SearchText = {
  SKIP: 'textarea, script, style, option, button, select',
  pattern(query) {
    const escaped = query.trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+/g, '\\s+')
      // Straight and curly quotes match each other (the book is set curly)
      .replace(/['‘’]/g, "['‘’]")
      .replace(/["“”]/g, '["“”]');
    return new RegExp(escaped, 'gi');
  },
  hits(text, query) {
    const re = this.pattern(query);
    const out = [];
    let m;
    while ((m = re.exec(text))) {
      if (!m[0].length) { re.lastIndex += 1; continue; }
      out.push([m.index, m.index + m[0].length]);
    }
    return out;
  },
  findLink(chId, query, hit) {
    return `${Paths.chapter(chId)}#${new URLSearchParams({ find: query, hit: String(hit) })}`;
  }
};

/* ============================================================
   TOC Search — loads the cached chapter text only when requested.
   Each result links to the exact match; the chapter highlights it.
   ============================================================ */
const BookSearch = {
  index: null,
  timer: null,
  SNIPPETS_PER_CHAPTER: 3,
  init() {
    this.input = document.getElementById('book-search');
    this.results = document.getElementById('search-results');
    this.status = document.getElementById('search-status');
    if (!this.input || !this.results) return;
    this.input.addEventListener('input', () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.run(this.input.value.trim()), 250);
    });
  },
  async buildIndex() {
    if (this.index) return this.index;
    this.status.textContent = 'Preparing book search…';
    this.index = await Promise.all(CHAPTERS.map(async ch => {
      try {
        const response = await fetch(Paths.chapter(ch.id));
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.querySelector('#chapter-content');
        content?.querySelectorAll(SearchText.SKIP).forEach(el => el.remove());
        return { ...ch, text: (content?.textContent || '').replace(/\s+/g, ' ').trim() };
      } catch {
        return { ...ch, text: '' };
      }
    }));
    this.status.textContent = '';
    return this.index;
  },
  async run(query) {
    if (query.length < 2) {
      this.results.innerHTML = '';
      this.status.textContent = query ? 'Type at least two characters.' : '';
      return;
    }
    const index = await this.buildIndex();
    if (query !== this.input.value.trim()) return; // a newer search is on its way
    const inTitle = ch => SearchText.hits(`${ch.title} ${ch.subtitle}`, query).length > 0;
    const matches = index
      .map(ch => ({ ch, hits: SearchText.hits(ch.text, query) }))
      .filter(({ ch, hits }) => hits.length || inTitle(ch));

    const total = matches.reduce((n, m) => n + m.hits.length, 0);
    this.status.textContent = matches.length
      ? `${total} match${total === 1 ? '' : 'es'} in ${matches.length} chapter${matches.length === 1 ? '' : 's'}`
      : 'No matches';

    this.results.innerHTML = matches.map(({ ch, hits }) => {
      const shown = hits.slice(0, this.SNIPPETS_PER_CHAPTER);
      const more = hits.length - shown.length;
      const snippets = shown.map((range, i) => `
        <li><a class="search-hit" href="${SearchText.findLink(ch.id, query, i)}">${this.snippet(ch.text, range)}</a></li>`).join('');
      return `
      <li class="search-chapter">
        <a class="search-chapter__head" href="${hits.length ? SearchText.findLink(ch.id, query, 0) : Paths.chapter(ch.id)}">
          <strong>Ch. ${ch.num}: ${this.escape(ch.title)}</strong>
          <span class="search-chapter__count">${hits.length ? `${hits.length} match${hits.length === 1 ? '' : 'es'}` : 'Title match'}</span>
        </a>
        ${snippets ? `<ol class="search-hits">${snippets}</ol>` : ''}
        ${more > 0 ? `<a class="search-more" href="${SearchText.findLink(ch.id, query, shown.length)}">${more} more in this chapter →</a>` : ''}
      </li>`;
    }).join('');
  },
  // ~70 characters either side of the match, with the match marked
  snippet(text, [start, end]) {
    const from = Math.max(0, text.lastIndexOf(' ', Math.max(0, start - 70)) + 1);
    let to = text.indexOf(' ', Math.min(text.length, end + 90));
    if (to === -1) to = text.length;
    return `${from > 0 ? '…' : ''}${this.escape(text.slice(from, start))}<mark>${this.escape(text.slice(start, end))}</mark>${this.escape(text.slice(end, to))}${to < text.length ? '…' : ''}`;
  },
  escape(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
};

/* ============================================================
   Find in Chapter — lands on a search result.
   Reads #find=<query>&hit=<n>, highlights every match in the chapter,
   centres match n, and offers a small bar to step through the rest.
   A hash (not a query string) keeps the offline cache keyed per page.
   ============================================================ */
const FindInChapter = {
  groups: [],   // one array of <mark> elements per match
  current: -1,
  query: '',

  request() {
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith('find=')) return null;
    const params = new URLSearchParams(hash);
    const q = (params.get('find') || '').trim();
    return q.length >= 2 ? { q, hit: Math.max(0, parseInt(params.get('hit'), 10) || 0) } : null;
  },

  // Returns true when it took charge of the landing position
  init() {
    const req = this.request();
    if (!req) return false;
    this.content = document.getElementById('chapter-content');
    if (!this.content || !this.highlight(req.q)) { this.clearHash(); return false; }
    this.query = req.q;
    this.buildBar();
    const land = () => requestAnimationFrame(() => this.go(Math.min(req.hit, this.groups.length - 1), false));
    if (document.fonts?.ready) document.fonts.ready.then(land); else land();
    return true;
  },

  highlight(query) {
    const walker = document.createTreeWalker(this.content, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest(SearchText.SKIP)
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    let text = '';
    while (walker.nextNode()) {
      nodes.push({ node: walker.currentNode, start: text.length, len: walker.currentNode.nodeValue.length });
      text += walker.currentNode.nodeValue;
    }
    const hits = SearchText.hits(text, query);
    // Wrap right-to-left: splitting a text node keeps its earlier part in
    // the original node, so offsets still to be processed stay valid
    const groups = [];
    for (let h = hits.length - 1; h >= 0; h--) {
      const [s, e] = hits[h];
      const group = [];
      for (let i = nodes.length - 1; i >= 0; i--) {
        const { node, start, len } = nodes[i];
        if (start >= e || start + len <= s) continue;
        const range = document.createRange();
        range.setStart(node, Math.max(0, s - start));
        range.setEnd(node, Math.min(len, e - start));
        if (range.collapsed || !range.toString().trim()) continue;
        const mark = document.createElement('mark');
        mark.className = 'find-hit';
        range.surroundContents(mark);
        group.unshift(mark);
      }
      if (group.length) groups.unshift(group);
    }
    this.groups = groups;
    return groups.length;
  },

  buildBar() {
    const bar = document.createElement('div');
    bar.className = 'find-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Search results in this chapter');
    bar.innerHTML = `
      <span class="find-bar__term"></span>
      <span class="find-bar__count" aria-live="polite"></span>
      <button type="button" class="find-bar__btn" data-find="-1" aria-label="Previous match">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <button type="button" class="find-bar__btn" data-find="1" aria-label="Next match">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
      </button>
      <button type="button" class="find-bar__btn" data-find="close" aria-label="Clear search highlights">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>`;
    bar.querySelector('.find-bar__term').textContent = `“${this.query}”`;
    bar.addEventListener('click', e => {
      const btn = e.target.closest('[data-find]');
      if (!btn) return;
      if (btn.dataset.find === 'close') this.clear();
      else this.go(this.current + Number(btn.dataset.find));
    });
    document.addEventListener('keydown', this.onKey = e => {
      if (e.key === 'Escape' && !ReaderSettings.isOpen()) this.clear();
    });
    document.body.appendChild(bar);
    document.body.classList.add('is-finding');
    this.bar = bar;
  },

  go(i, smooth = true) {
    const n = this.groups.length;
    if (!n) return;
    const next = ((i % n) + n) % n; // wrap around at either end
    this.groups[this.current]?.forEach(m => m.classList.remove('is-current'));
    this.current = next;
    const group = this.groups[next];
    group.forEach(m => m.classList.add('is-current'));
    const root = document.documentElement;
    if (!smooth) root.style.scrollBehavior = 'auto';
    group[0].scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' });
    if (!smooth) root.style.scrollBehavior = '';
    this.bar.querySelector('.find-bar__count').textContent = `${next + 1} of ${n}`;
  },

  clear() {
    this.groups.flat().forEach(mark => mark.replaceWith(...mark.childNodes));
    this.content?.normalize();
    this.groups = [];
    this.bar?.remove();
    document.removeEventListener('keydown', this.onKey);
    document.body.classList.remove('is-finding');
    this.clearHash();
  },

  clearHash() {
    history.replaceState(history.state, '', window.location.pathname + window.location.search);
  }
};

/* ============================================================
   Sections — "In this chapter"
   Gives every chapter heading a stable id (so #section links work),
   and turns the nav's chapter label into a button that opens a sheet
   listing the sections, each with its reading time and a marker on
   the one being read.
   ============================================================ */
const Sections = {
  items: [],
  dialog: null,

  // Runs before scroll restore; returns true when a #section link
  // decided where the page lands
  prepare() {
    const content = document.getElementById('chapter-content');
    if (!content) return false;
    const used = new Set();
    this.items = Array.from(content.querySelectorAll('h2')).map(h => {
      if (!h.id) {
        const base = h.textContent.toLowerCase()
          .replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
        let id = base;
        for (let n = 2; used.has(id) || document.getElementById(id); n++) id = `${base}-${n}`;
        h.id = id;
      }
      used.add(h.id);
      return { el: h, id: h.id, title: h.textContent.trim() };
    });
    this.measure(content);

    const target = decodeURIComponent(window.location.hash.slice(1));
    const hit = target && !target.startsWith('find=') && this.items.find(s => s.id === target);
    if (!hit) return false;
    const land = () => requestAnimationFrame(() => this.scrollTo(hit, false));
    if (document.fonts?.ready) document.fonts.ready.then(land); else land();
    return true;
  },

  // Words between consecutive headings -> minutes per section
  measure(content) {
    let current = null;
    const opening = { words: 0 };
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest(SearchText.SKIP)
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const byHeading = new Map(this.items.map(s => [s.el, s]));
    this.items.forEach(s => { s.words = 0; });
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const heading = node.parentElement.closest('h2');
      if (heading && byHeading.has(heading)) { current = byHeading.get(heading); continue; }
      // A text node belongs to the last heading that precedes it
      for (const s of this.items) {
        if (s.el.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) current = s;
        else break;
      }
      (current || opening).words += (node.nodeValue.match(/\S+/g) || []).length;
    }
    this.openingWords = opening.words;
  },

  init(ch) {
    this.ch = ch;
    this.trigger = document.getElementById('sections-btn');
    if (!this.trigger) return;
    if (!this.items.length) { this.trigger.disabled = true; return; }
    const chevron = document.createElement('span');
    chevron.className = 'nav__chapter-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
    this.trigger.querySelector('.nav__chapter-line')?.append(chevron);
    this.trigger.addEventListener('click', () => this.open());
  },

  minutes(words) {
    return `${Math.max(1, Math.round(words / ReadingTime.WPM))} min`;
  },

  build() {
    const d = document.createElement('dialog');
    d.className = 'reader-settings sections-sheet';
    d.setAttribute('aria-labelledby', 'sections-title');
    const row = (label, mins, attrs) => `
      <li><a class="sections-sheet__link" ${attrs}>
        <span class="sections-sheet__title">${BookSearch.escape(label)}</span>
        <span class="sections-sheet__mins">${mins}</span>
      </a></li>`;
    d.innerHTML = `
      <div class="reader-settings__inner">
        <div class="reader-settings__grip" aria-hidden="true"></div>
        <header class="reader-settings__head">
          <div>
            <p class="sections-sheet__kicker">Chapter ${this.ch.num} · In this chapter</p>
            <h2 class="reader-settings__title" id="sections-title">${BookSearch.escape(this.ch.title)}</h2>
          </div>
          <button type="button" class="reader-settings__done" data-close>Done</button>
        </header>
        <ol class="sections-sheet__list">
          ${row('Chapter opening', this.minutes(this.openingWords), 'href="#" data-section="__top"')}
          ${this.items.map(s => row(s.title, this.minutes(s.words), `href="#${s.id}" data-section="${s.id}"`)).join('')}
        </ol>
      </div>`;
    d.addEventListener('click', e => {
      const link = e.target.closest('[data-section]');
      if (link) {
        e.preventDefault();
        const target = this.items.find(s => s.id === link.dataset.section) || null;
        this.close();
        this.scrollTo(target, true);
        return;
      }
      if (e.target.closest('[data-close]') || e.target === d) this.close();
    });
    d.addEventListener('close', () => this.trigger?.setAttribute('aria-expanded', 'false'));
    document.body.appendChild(d);
    this.dialog = d;
  },

  // The section being read: the last heading above the top third
  currentIndex() {
    const line = window.innerHeight / 3;
    let idx = -1;
    this.items.forEach((s, i) => { if (s.el.getBoundingClientRect().top <= line) idx = i; });
    return idx;
  },

  open() {
    if (!this.items.length) return;
    if (!this.dialog) this.build();
    const idx = this.currentIndex();
    this.dialog.querySelectorAll('.sections-sheet__link').forEach((a, i) => {
      const here = i === idx + 1; // row 0 is the chapter opening
      a.classList.toggle('is-current', here);
      if (here) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    Immersive.show();
    this.trigger?.setAttribute('aria-expanded', 'true');
    if (typeof this.dialog.showModal === 'function') this.dialog.showModal();
    else this.dialog.setAttribute('open', '');
    this.dialog.querySelector('.is-current')?.scrollIntoView({ block: 'nearest' });
  },

  close() {
    if (!this.dialog) return;
    if (typeof this.dialog.close === 'function') this.dialog.close();
    else { this.dialog.removeAttribute('open'); this.dialog.dispatchEvent(new Event('close')); }
  },

  isOpen() { return Boolean(this.dialog?.open); },

  scrollTo(section, smooth) {
    const root = document.documentElement;
    if (!smooth) root.style.scrollBehavior = 'auto';
    if (section) section.el.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
    else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    if (!smooth) root.style.scrollBehavior = '';
    history.replaceState(history.state, '',
      window.location.pathname + window.location.search + (section ? `#${section.id}` : ''));
  }
};

/* ============================================================
   End-of-Chapter Card — "Chapter complete", book progress, and the
   next chapter with its reading time. Replaces the bare Next button;
   the last chapter gets a closing card instead.
   ============================================================ */
const ChapterEnd = {
  init(ch) {
    const nav = document.querySelector('.chapter-nav');
    if (!nav) return;
    this.ch = ch;
    this.card = document.createElement('section');
    this.card.className = 'chapter-end';
    this.card.setAttribute('aria-labelledby', 'chapter-end-title');
    nav.before(this.card);
    this.render();
    document.addEventListener('wired:read', () => this.render());
  },

  render() {
    const { ch } = this;
    const read = Progress.isRead(ch.id);
    const count = Progress.getCount();
    const total = CHAPTERS.length;
    const next = Nav.getChapterByNum(ch.num + 1);
    const esc = s => BookSearch.escape(s);
    const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

    const progress = `
      <div class="chapter-end__progress">
        <div class="chapter-end__bar" role="progressbar" aria-label="Book progress"
             aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}">
          <span style="transform:scaleX(${count / total})"></span>
        </div>
        <span class="chapter-end__count">${count} of ${total} chapters read</span>
      </div>`;

    if (!next) {
      this.card.classList.add('chapter-end--finale');
      this.card.innerHTML = `
        <div class="chapter-end__seal${read ? ' is-read' : ''}">${check}</div>
        <p class="chapter-end__kicker">The end</p>
        <h2 class="chapter-end__title" id="chapter-end-title">You’ve reached the end of <em>Wired Differently</em></h2>
        <p class="chapter-end__note">Come back to any chapter whenever you need it. The worksheets and scripts are always here.</p>
        ${progress}
        <div class="chapter-end__actions">
          <a class="chapter-end__btn" href="${Paths.toc()}">Back to Contents</a>
        </div>`;
      return;
    }

    const nextPart = PARTS.find(p => p.chapters[0] === next.num && p.num !== ch.part);
    this.card.innerHTML = `
      <div class="chapter-end__seal${read ? ' is-read' : ''}">${check}</div>
      <p class="chapter-end__kicker">${read ? 'Chapter complete' : `End of Chapter ${ch.num}`}</p>
      <h2 class="chapter-end__title" id="chapter-end-title">${esc(ch.title)}</h2>
      ${progress}
      <a class="chapter-end__next" href="${Paths.chapter(next.id)}">
        <span class="chapter-end__next-kicker">Up next${nextPart ? ` · ${esc(nextPart.num === 9 ? 'Closing' : `${nextPart.label} begins`)}` : ''}</span>
        <span class="chapter-end__next-title">${esc(next.title)}</span>
        <span class="chapter-end__next-sub">${esc(next.subtitle)}</span>
        <span class="chapter-end__next-meta">Chapter ${next.num} · ${next.mins} min read</span>
        <span class="chapter-end__next-arrow">${arrow}</span>
      </a>`;
  }
};

/* ============================================================
   Reading Time — "18 min read" in the chapter header and a live
   "12 min left" under the chapter label in the nav
   ============================================================ */
const ReadingTime = {
  WPM: 230,
  init() {
    this.content = document.getElementById('chapter-content');
    if (!this.content) return;
    const clone = this.content.cloneNode(true);
    clone.querySelectorAll(SearchText.SKIP).forEach(el => el.remove());
    this.words = (clone.textContent.match(/\S+/g) || []).length;
    const total = Math.max(1, Math.round(this.words / this.WPM));

    const header = document.querySelector('.chapter-header__number');
    if (header) {
      const time = document.createElement('span');
      time.className = 'chapter-header__time';
      time.textContent = ` · ${total} min read`;
      header.appendChild(time);
    }

    this.meta = document.createElement('span');
    this.meta.className = 'nav__chapter-meta';
    document.querySelector('.nav__chapter-label')?.appendChild(this.meta);

    let ticking = false;
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { this.update(); ticking = false; });
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    this.update();
    document.fonts?.ready.then(() => this.update());
  },
  update() {
    const rect = this.content.getBoundingClientRect();
    const left = Math.min(1, Math.max(0, (rect.bottom - window.innerHeight) / rect.height));
    const minutes = (this.words * left) / this.WPM;
    this.meta.textContent = left === 0 ? 'End of chapter'
      : minutes < 1 ? 'Under a minute left'
      : `${Math.ceil(minutes)} min left`;
  }
};

/* ============================================================
   Reader Data Backup — portable progress, settings and worksheets
   ============================================================ */
const DataPortability = {
  init() {
    this.status = document.getElementById('data-status');
    document.getElementById('export-data')?.addEventListener('click', () => this.export());
    const input = document.getElementById('import-data-file');
    document.getElementById('import-data')?.addEventListener('click', () => input?.click());
    input?.addEventListener('change', () => this.import(input.files?.[0]));
  },
  export() {
    const data = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith('wired_')) data[key] = localStorage.getItem(key);
    }
    const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `wired-differently-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    if (this.status) this.status.textContent = 'Backup downloaded.';
  },
  async import(file) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (payload?.version !== 1 || !payload.data || typeof payload.data !== 'object') throw new Error('Invalid backup');
      Object.entries(payload.data).forEach(([key, value]) => {
        if (key.startsWith('wired_') && typeof value === 'string') localStorage.setItem(key, value);
      });
      if (this.status) this.status.textContent = 'Backup restored. Refreshing…';
      window.setTimeout(() => window.location.reload(), 500);
    } catch {
      if (this.status) this.status.textContent = 'That file is not a valid Wired Differently backup.';
    }
  }
};

/* ============================================================
   Keyboard Navigation
   ============================================================ */
const KeyboardNav = {
  init(chapterNum) {
    document.addEventListener('keydown', e => {
      // Don't fire in inputs, or when a modifier is held
      if (e.target.matches('input, textarea, select')) return;
      if (ReaderSettings.isOpen() || Sections.isOpen()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Left/Right turn pages; Up/Down are left alone for normal scrolling
      if (e.key === 'ArrowLeft') {
        const prev = Nav.getChapterByNum(chapterNum - 1);
        if (prev) window.location.href = Paths.chapter(prev.id);
      }
      if (e.key === 'ArrowRight') {
        const next = Nav.getChapterByNum(chapterNum + 1);
        if (next) window.location.href = Paths.chapter(next.id);
      }
      if (e.key === 't' || e.key === 'T') Nav.goToTOC();
      if (e.key === 'a' || e.key === 'A') ReaderSettings.open();
      if (e.key === 's' || e.key === 'S') Sections.open();
      if (e.key === '+' || e.key === '=') Prefs.step('fontSize', 1);
      if (e.key === '-' || e.key === '_') Prefs.step('fontSize', -1);
      if (e.key === 'b' || e.key === 'B') document.getElementById('bookmark-btn')?.click();
    });
  }
};

/* ============================================================
   App Init — called from each page's inline script
   ============================================================ */
const App = {
  initCover() {
    Theme.init();
    Prefs.init();
    CoverResume.init();
    EmbeddedBrowserCompat.init();
    this._bindThemeToggle();
  },

  initTOC() {
    Theme.init();
    Prefs.init();
    ReaderSettings.init();
    TOCState.init();
    BookmarkList.init();
    BookSearch.init();
    DataPortability.init();
    this._bindThemeToggle();
  },

  initChapter(chId) {
    Theme.init();
    Prefs.init();
    ReaderSettings.init();
    ReadingProgressBar.init();
    ReadingProgressBar.show();
    WorksheetPersist.init(chId);
    const landedOnSection = Sections.prepare();
    const landedOnSearch = FindInChapter.init();
    ScrollPersist.init(chId, { restore: !landedOnSearch && !landedOnSection });
    AutoRead.init(chId);
    BookmarkUI.init(chId);

    const ch = CHAPTERS.find(c => c.id === chId);
    if (ch) {
      KeyboardNav.init(ch.num);
      TouchNav.init(ch.num);
      Progress.saveLastChapter(chId);
      // Nav label with position context ("Ch. 5 of 27 — Title"). It becomes
      // the button for the chapter's section list. Both text forms are
      // rendered; CSS picks one per screen width so rotation stays correct.
      const placeholder = document.querySelector('.nav__chapter-label');
      if (placeholder) {
        const label = document.createElement('button');
        label.type = 'button';
        label.className = 'nav__chapter-label';
        label.id = 'sections-btn';
        label.setAttribute('aria-haspopup', 'dialog');
        label.setAttribute('aria-expanded', 'false');
        label.setAttribute('aria-label', `Sections in Chapter ${ch.num}: ${ch.title}`);
        const long = document.createElement('span');
        long.className = 'nav__chapter-label-long';
        long.textContent = `Ch. ${ch.num} of ${CHAPTERS.length} — ${ch.title}`;
        const short = document.createElement('span');
        short.className = 'nav__chapter-label-short';
        short.textContent = `Ch. ${ch.num} · ${ch.title}`;
        const line = document.createElement('span');
        line.className = 'nav__chapter-line';
        line.append(long, short);
        label.append(line);
        placeholder.replaceWith(label);
      }
      document.querySelector('.chapter-header')?.setAttribute('data-num', String(ch.num));
      ReadingTime.init();
      Sections.init(ch);
      ChapterEnd.init(ch);
      document.body.classList.add('is-chapter');
      Immersive.init();
    }
    this._bindThemeToggle();
  },

  _bindThemeToggle() {
    document.getElementById('theme-toggle')?.addEventListener('click', () => Theme.toggle());
  }
};

// Expose to global scope for inline page scripts
window.App = App;
window.CHAPTERS = CHAPTERS;
window.PARTS = PARTS;
window.Progress = Progress;
window.Nav = Nav;
