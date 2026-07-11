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
};

const CHAPTERS = [
  { id: 'ch01', num: 1,  title: 'Introduction',                     subtitle: 'What It Feels Like to Be You',                                              part: 1 },
  { id: 'ch02', num: 2,  title: 'What ADHD Actually Is',            subtitle: 'Not a Focus Problem. Not a Willpower Problem.',                             part: 1 },
  { id: 'ch03', num: 3,  title: 'What High IQ + ADHD Actually Means', subtitle: 'Intelligence Doesn\'t Cancel ADHD. It Disguises It.',                    part: 1 },
  { id: 'ch04', num: 4,  title: 'Twice-Exceptionality',             subtitle: 'When "Gifted" and "Struggling" Live in the Same Brain',                     part: 1 },
  { id: 'ch05', num: 5,  title: 'Common Signs and Patterns',        subtitle: 'The Specific Ways This Profile Shows Up in Real Life',                      part: 1 },
  { id: 'ch06', num: 6,  title: 'Strengths',                        subtitle: 'What\'s Actually There — Without the Mythology',                            part: 1 },
  { id: 'ch07', num: 7,  title: 'Challenges',                       subtitle: 'The Real Costs — Named Clearly, Without Flinching',                         part: 1 },
  { id: 'ch08', num: 8,  title: 'Why High IQ Can Delay Diagnosis',  subtitle: 'The Smarter You Are, The Longer It Can Take',                               part: 2 },
  { id: 'ch09', num: 9,  title: 'Diagnosis and Professional Evaluation', subtitle: 'What a Good Evaluation Actually Looks Like',                           part: 2 },
  { id: 'ch10', num: 10, title: 'Treatment Options',                subtitle: 'What Actually Works, and What the Evidence Says',                           part: 2 },
  { id: 'ch11', num: 11, title: 'The High-IQ ADHD Operating System', subtitle: 'A Working Model of Your Brain — Built for Actually Using It',             part: 3 },
  { id: 'ch12', num: 12, title: 'Daily Life Strategies',            subtitle: 'Practical Tools for a Brain That Doesn\'t Run on Willpower',               part: 4 },
  { id: 'ch13', num: 13, title: 'Productivity Strategies',          subtitle: 'Building Systems That Engage Rather Than Demand',                           part: 4 },
  { id: 'ch14', num: 14, title: 'Emotional Regulation',             subtitle: 'Feeling Everything at Full Volume — and Learning to Work With It',          part: 4 },
  { id: 'ch15', num: 15, title: 'Relationships',                    subtitle: 'How ADHD Affects the People You Love — and What Actually Helps',            part: 4 },
  { id: 'ch16', num: 16, title: 'Work and Career',                  subtitle: 'Finding Where You Thrive, Managing Where You Don\'t',                       part: 4 },
  { id: 'ch17', num: 17, title: 'Learning and Education',           subtitle: 'How the Gifted ADHD Brain Actually Learns',                                 part: 4 },
  { id: 'ch18', num: 18, title: 'Creativity and Entrepreneurship',  subtitle: 'The Engine, the Risks, and Building Something Sustainable',                 part: 4 },
  { id: 'ch19', num: 19, title: 'Burnout and Recovery',             subtitle: 'When the Compensation System Finally Runs Out',                             part: 5 },
  { id: 'ch20', num: 20, title: 'Health Habits',                    subtitle: 'The Physical Infrastructure of a Functioning ADHD Brain',                   part: 5 },
  { id: 'ch21', num: 21, title: 'Myths and Misunderstandings',      subtitle: 'The False Beliefs That Have Done the Most Damage',                          part: 6 },
  { id: 'ch22', num: 22, title: 'Self-Assessment Reflection Questions', subtitle: 'Not a Test — A Conversation With Yourself',                            part: 7 },
  { id: 'ch23', num: 23, title: 'Practical Worksheets',             subtitle: 'Tools You Can Actually Use',                                                part: 7 },
  { id: 'ch24', num: 24, title: 'Scripts',                          subtitle: 'What to Say When You Don\'t Know What to Say',                             part: 7 },
  { id: 'ch25', num: 25, title: 'The 30-Day Action Plan',           subtitle: 'A Structured First Month',                                                  part: 7 },
  { id: 'ch26', num: 26, title: 'Resources',                        subtitle: 'Going Further',                                                             part: 8 },
  { id: 'ch27', num: 27, title: 'Final Encouragement',              subtitle: 'A Letter to Close',                                                         part: 9 },
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
   ============================================================ */
const Theme = {
  init() {
    const saved = Storage.get(LS.DARK_MODE);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved !== null ? saved : prefersDark;
    this.apply(isDark);

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (Storage.get(LS.DARK_MODE) === null) this.apply(e.matches);
    });
  },
  apply(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    this.updateToggle(isDark);
  },
  toggle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    Storage.set(LS.DARK_MODE, !isDark);
    this.apply(!isDark);
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
   Font Size Manager
   ============================================================ */
const FontSize = {
  sizes: ['sm', 'md', 'lg', 'xl'],
  init() {
    const saved = Storage.get(LS.FONT_SIZE, 'md');
    this.apply(saved);
  },
  apply(size) {
    document.documentElement.setAttribute('data-font-size', size);
  },
  increase() {
    const current = document.documentElement.getAttribute('data-font-size') || 'md';
    const idx = this.sizes.indexOf(current);
    if (idx < this.sizes.length - 1) {
      const next = this.sizes[idx + 1];
      Storage.set(LS.FONT_SIZE, next);
      this.apply(next);
    }
  },
  decrease() {
    const current = document.documentElement.getAttribute('data-font-size') || 'md';
    const idx = this.sizes.indexOf(current);
    if (idx > 0) {
      const prev = this.sizes[idx - 1];
      Storage.set(LS.FONT_SIZE, prev);
      this.apply(prev);
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
  init() {
    this.el = document.getElementById('reading-progress-bar');
    this.fill = document.getElementById('reading-progress-fill');
    if (!this.el) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  },
  update() {
    if (!this.fill) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    this.fill.style.width = pct + '%';
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
  init(chId) {
    this.chId = chId;
    // Restore saved position
    const saved = Progress.getScroll(chId);
    if (saved > 0) {
      requestAnimationFrame(() => window.scrollTo(0, saved));
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
    window.addEventListener('scroll', () => {
      if (marked) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total > 0.8) {
        marked = true;
        Progress.markRead(chId);
        // Update checkmark in any TOC links visible
        document.querySelectorAll(`[data-ch="${chId}"]`).forEach(el => {
          el.classList.add('is-read');
        });
      }
    }, { passive: true });
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
      <a href="${Paths.chapter(ch.id)}" class="cover__resume-btn"
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
      if (e.key === 'b' || e.key === 'B') BookmarkUI.init && document.getElementById('bookmark-btn')?.click();
    });
  }
};

/* ============================================================
   App Init — called from each page's inline script
   ============================================================ */
const App = {
  initCover() {
    Theme.init();
    FontSize.init();
    CoverResume.init();
    this._bindThemeToggle();
  },

  initTOC() {
    Theme.init();
    FontSize.init();
    TOCState.init();
    BookmarkList.init();
    this._bindThemeToggle();
  },

  initChapter(chId) {
    Theme.init();
    FontSize.init();
    ReadingProgressBar.init();
    ReadingProgressBar.show();
    ScrollPersist.init(chId);
    AutoRead.init(chId);
    BookmarkUI.init(chId);
    WorksheetPersist.init(chId);

    const ch = CHAPTERS.find(c => c.id === chId);
    if (ch) {
      KeyboardNav.init(ch.num);
      Progress.saveLastChapter(chId);
      // Update nav label with position context ("Ch. 5 of 27 — Title")
      const label = document.querySelector('.nav__chapter-label');
      if (label) label.textContent = `Ch. ${ch.num} of ${CHAPTERS.length} — ${ch.title}`;
      document.body.classList.add('is-chapter');
    }
    this._bindThemeToggle();
    this._bindFontSizeControls();
  },

  _bindThemeToggle() {
    document.getElementById('theme-toggle')?.addEventListener('click', () => Theme.toggle());
  },

  _bindFontSizeControls() {
    document.getElementById('font-increase')?.addEventListener('click', () => FontSize.increase());
    document.getElementById('font-decrease')?.addEventListener('click', () => FontSize.decrease());
  }
};

// Expose to global scope for inline page scripts
window.App = App;
window.CHAPTERS = CHAPTERS;
window.PARTS = PARTS;
window.Progress = Progress;
window.Nav = Nav;
