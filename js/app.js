/* Samvidhan Explorer — single-page app (no build step). */
(function () {
  "use strict";

  // ------------------------------------------------------------------ data
  const T = window.COI_TEXT;
  const PARTS = window.COI_PARTS;
  const THEMES = window.COI_THEMES;
  const EXPLAIN = window.COI_EXPLAIN || {};
  const AMENDS = (window.COI_AMENDMENTS || []).slice().sort((a, b) => a.n - b.n);
  const PENDING = window.COI_PENDING_AMENDMENTS || [];
  const CASES = (window.COI_CASES || []).slice().sort((a, b) => (a.year - b.year) || String(a.date).localeCompare(String(b.date)));
  const AIDX = window.COI_AMEND_INDEX || { byAmendment: {}, byArticle: {} };
  const XREFS = window.COI_XREFS || {};
  const SCHMETA = window.COI_SCHEDULES_META || {};

  const ARTS = T.articles;
  const byId = new Map(ARTS.map((a, i) => [a.id, Object.assign(a, { idx: i })]));
  const amendByN = new Map(AMENDS.map(a => [a.n, a]));
  const caseById = new Map(CASES.map(c => [c.id, c]));
  const themeById = new Map(THEMES.map(t => [t.id, t]));
  const ORD = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth"];

  // Part / chapter / sub-heading for each article
  PARTS.forEach(p => {
    const s = byId.get(p.from).idx, e = byId.get(p.to).idx;
    p.articles = ARTS.slice(s, e + 1);
    p.articles.forEach(a => { a.part = p; });
    (p.chapters || []).forEach(c => {
      const cs = byId.get(c.from).idx, ce = byId.get(c.to).idx;
      c.articles = ARTS.slice(cs, ce + 1);
      c.articles.forEach(a => { a.chapter = c; });
    });
  });
  let curSec = null, curPart = null;
  ARTS.forEach(a => {
    if (a.part !== curPart) { curPart = a.part; curSec = null; }
    if (a.section) curSec = a.section;
    if (!a.chapter && curSec && a.part && !a.part.chapters) a.sub = curSec;
    else if (a.chapter && a.section) a.sub = a.section;
  });

  // themes per article
  const themesOf = new Map();
  THEMES.forEach(t => t.articles.forEach(id => { if (!themesOf.has(id)) themesOf.set(id, []); themesOf.get(id).push(t); }));

  // amendments per article: union of footnote-derived index and curated dataset
  const amendsOf = new Map();
  const addA = (id, n) => { if (!amendsOf.has(id)) amendsOf.set(id, new Set()); amendsOf.get(id).add(n); };
  Object.entries(AIDX.byArticle).forEach(([id, ns]) => ns.forEach(n => addA(id, n)));
  AMENDS.forEach(a => (a.articles || []).forEach(id => addA(id, a.n)));

  // cases per article
  const casesOf = new Map();
  CASES.forEach(c => (c.articles || []).forEach(id => { if (!casesOf.has(id)) casesOf.set(id, []); casesOf.get(id).push(c); }));

  // reverse cross-refs
  const xrefIn = new Map();
  Object.entries(XREFS).forEach(([from, tos]) => tos.forEach(to => { if (!xrefIn.has(to)) xrefIn.set(to, []); xrefIn.get(to).push(from); }));

  // ---------------------------------------------------------------- helpers
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const view = $("#view");
  const artLink = (id, label) => byId.has(id) ? `<a href="#/article/${encodeURIComponent(id)}">${esc(label || "Art. " + id)}</a>` : esc(label || id);
  const refLink = id => {
    if (id === "Preamble") return `<a href="#/preamble">Preamble</a>`;
    if (/^Sch-/.test(id)) { const s = id.slice(4); return `<a href="#/schedule/${s}">${s} Schedule</a>`; }
    return artLink(id);
  };
  const amendName = n => { const a = amendByN.get(n); return a ? a.act : `Constitution (${ordinal(n)} Amendment) Act`; };
  function ordinal(n) { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  const explain = id => EXPLAIN[id] || null;
  const fnAmend = T.fnAmend || {};

  function setActiveNav(key) {
    let act = null;
    document.querySelectorAll("#mainnav a").forEach(a => { const on = a.dataset.nav === key; a.classList.toggle("active", on); if (on) act = a; });
    // keep the active item visible in the horizontally scrolling nav (phones)
    const nav = $("#mainnav");
    if (act && nav.scrollWidth > nav.clientWidth) {
      const r = act.getBoundingClientRect(), nr = nav.getBoundingClientRect();
      nav.scrollTo({ left: Math.max(0, nav.scrollLeft + r.left - nr.left - nav.clientWidth / 2 + r.width / 2), behavior: "smooth" });
    }
  }
  // a plain-language card the reader can mark up (js/notes.js)
  function plainCard(key, blocks) {
    return `<div class="plain" data-nk="${esc(key)}"><div class="label"><span>In plain language</span></div>${blocks.filter(b => b.t).map(b => `<div class="nb${b.cls ? " " + b.cls : ""}">${esc(b.t)}</div>`).join("")}</div>`;
  }
  function render(html, nav) {
    view.innerHTML = html;
    if (window.COI_NOTES) window.COI_NOTES.mount(view);
    setActiveNav(nav);
    window.scrollTo(0, 0);
    document.getElementById("topbar").classList.remove("search-open");
  }

  // Verbatim renderer: paragraphs, indentation, footnote superscripts
  const ROMAN = new Set(["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"]);
  function renderVerbatim(text, fn, omitted, pageNotes) {
    const local = new Map(); let k = 0;
    const order = [];
    const lines = String(text).split("\n");
    let lastLetter = null;
    const out = lines.map(raw => {
      let line = esc(raw);
      const plain = raw.replace(/⟦\d+⟧/g, "").replace(/[\uE000-\uE007]/g, "").replace(/^[\[\s]+/, "");
      let cls = "";
      let m;
      if (omitted) cls = "omit";
      else if ((m = plain.match(/^\((\d+[A-Z]?)\)/))) { cls = ""; lastLetter = null; }
      else if ((m = plain.match(/^\(([a-z]{1,4})\)/))) {
        const t = m[1];
        const isRoman = ROMAN.has(t) && !(t === "i" && lastLetter === "h") && !(t === "v" && lastLetter === "u") && !(t === "x" && lastLetter === "w");
        if (isRoman) cls = "l2"; else { cls = "l1"; lastLetter = t; }
      }
      else if (/^(Provided|Explanation)/.test(plain)) cls = "prov";
      line = line.replace(/⟦(\d+)⟧/g, (_, n) => {
        if (!local.has(n)) { local.set(n, ++k); order.push(n); }
        return `<sup class="fn" data-fn="${n}" title="${esc(fn[n] || "")}">${local.get(n)}</sup>`;
      });
      return `<p class="${cls}">${line}</p>`;
    }).join("");
    const notes = order.length ? `<div class="fnlist"><div class="small muted" style="margin-bottom:4px">Official editorial notes (amendment provenance)</div><ol>${order.map(n => {
      const an = fnAmend[n];
      return `<li id="fn-${n}">${esc(fn[n] || "")}${an ? ` — <a href="#/amendment/${an}">${ordinal(an)} Amendment</a>` : ""}</li>`;
    }).join("")}</ol></div>` : "";
    const pn = Object.entries(pageNotes || {});
    const extra = pn.length ? `<div class="fnlist pagenotes"><div class="small muted" style="margin-bottom:4px">Other editorial notes printed on the same page of the official edition</div><ul>${pn.map(([n, t]) => {
      const an = fnAmend[n];
      return `<li>${esc(t)}${an ? ` — <a href="#/amendment/${an}">${ordinal(an)} Amendment</a>` : ""}</li>`;
    }).join("")}</ul></div>` : "";
    return `<div class="vtext">${out}</div>${notes}${extra}`;
  }

  // footnote popover (hover/tap) + jump to list on click
  const pop = document.createElement("div");
  pop.className = "fnpop"; pop.hidden = true; document.body.appendChild(pop);
  function showPop(s) {
    const n = s.dataset.fn, li = document.getElementById("fn-" + n);
    if (!li) return;
    pop.innerHTML = `<div class="fnpop-k">Note ${esc(s.textContent)}</div>${li.innerHTML}`;
    pop.hidden = false;
    const r = s.getBoundingClientRect(), w = Math.min(360, window.innerWidth - 24);
    pop.style.width = w + "px";
    pop.style.left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left + window.scrollX - w / 2)) + "px";
    pop.style.top = (r.bottom + window.scrollY + 8) + "px";
  }
  let popT;
  pop.addEventListener("mouseenter", () => clearTimeout(popT));
  pop.addEventListener("mouseleave", () => { pop.hidden = true; });
  document.addEventListener("click", e => { if (!e.target.closest("sup.fn") && !e.target.closest(".fnpop")) pop.hidden = true; });
  function bindFootnotes(root) {
    root.querySelectorAll("sup.fn").forEach(s => {
      s.removeAttribute("title");
      s.setAttribute("tabindex", "0");
      s.addEventListener("mouseenter", () => { clearTimeout(popT); showPop(s); });
      s.addEventListener("mouseleave", () => { popT = setTimeout(() => { pop.hidden = true; }, 250); });
      s.addEventListener("focus", () => showPop(s));
      s.addEventListener("click", e => {
        e.stopPropagation();
        showPop(s);
        const li = document.getElementById("fn-" + s.dataset.fn);
        root.querySelectorAll(".fnlist li.hl").forEach(x => x.classList.remove("hl"));
        if (li) li.classList.add("hl");
      });
    });
  }

  // reading preferences
  const prefs = { size: 0, markers: true };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem("coi-read") || "{}")); } catch (e) { /* ignore */ }
  const savePrefs = () => { try { localStorage.setItem("coi-read", JSON.stringify(prefs)); } catch (e) { /* ignore */ } };
  function applyPrefs() {
    document.documentElement.style.setProperty("--vsize", (16.5 + prefs.size * 1.5) + "px");
    document.body.classList.toggle("hide-markers", !prefs.markers);
  }
  applyPrefs();
  function readToolbar() {
    return `<div class="readbar" role="toolbar" aria-label="Reading options">
      <button data-act="smaller" title="Smaller text">A−</button><button data-act="larger" title="Larger text">A+</button>
      <button data-act="markers" class="${prefs.markers ? "on" : ""}" title="Show or hide amendment markers">¹ notes</button>
      <button data-act="copy" title="Copy link to this article">Copy link</button></div>`;
  }
  function bindReadbar(root) {
    root.querySelectorAll(".readbar button").forEach(b => b.addEventListener("click", () => {
      const act = b.dataset.act;
      if (act === "smaller") prefs.size = Math.max(-2, prefs.size - 1);
      if (act === "larger") prefs.size = Math.min(4, prefs.size + 1);
      if (act === "markers") { prefs.markers = !prefs.markers; b.classList.toggle("on", prefs.markers); }
      if (act === "copy") {
        const done = () => { b.textContent = "Copied ✓"; setTimeout(() => { b.textContent = "Copy link"; }, 1400); };
        if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, () => {}); else done();
      }
      savePrefs(); applyPrefs();
    }));
  }

  const GRAPH_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 7l10 3M7 7l3 10M17 10l-7 7"/></g><g fill="currentColor"><circle cx="6" cy="6" r="2.6"/><circle cx="18" cy="10" r="2.6"/><circle cx="10" cy="18" r="2.6"/></g></svg>`;
  function artRow(a, opts) {
    const ex = explain(a.id);
    const row = `<a class="art-row${a.omitted ? " omitted" : ""}" href="#/article/${encodeURIComponent(a.id)}">
      <span class="anum">${esc(a.id)}</span>
      <span><span class="atitle">${esc(a.title)}</span>${ex ? `<span class="asum"> — ${esc(ex.s)}</span>` : ""}</span></a>`;
    if (!(opts && opts.graph) || a.omitted) return opts && opts.graph ? `<div class="art-item">${row}</div>` : row;
    return `<div class="art-item">${row}<a class="art-graph" href="#/graph?focus=${encodeURIComponent(a.id)}" title="Explore Art. ${esc(a.id)} in the graph" aria-label="Explore Article ${esc(a.id)} in the graph">${GRAPH_SVG}</a></div>`;
  }

  // ----------------------------------------------------------------- views
  // ------------------------------------------------------------ directory rows (calm index lists)
  function dirRow(o) {
    return `<a class="dir-row" href="${o.href}">
      <span class="dir-ico" style="--c:${o.color || "var(--accent)"}">${o.icon || ""}</span>
      <span class="dir-main"><span class="dir-t">${o.title}</span>${o.sub ? `<span class="dir-s">${o.sub}</span>` : ""}</span>
      ${o.meta ? `<span class="dir-meta">${o.meta}</span>` : ""}<span class="dir-chev" aria-hidden="true">›</span></a>`;
  }
  function dirGroup(title, rows, note) {
    return `<section class="dir-group">${title ? `<h2 class="dir-h">${title}${note ? `<span>${note}</span>` : ""}</h2>` : ""}<div class="dir">${rows.join("")}</div></section>`;
  }
  const ICONS = {
    rights: "⚖", learn: "✦", preamble: "❝", parts: "§", schedules: "▤", themes: "◈", amendments: "✎", cases: "⚑", time: "⏱", graph: "⌘"
  };

  function viewHome() {
    const live = ARTS.filter(a => !a.omitted).length;
    const pre = T.preamble.text.replace(/⟦\d+⟧/g, "");
    const latestAm = AMENDS.slice(-3).reverse();
    const recentCases = CASES.slice(-3).reverse();
    const explore = [
      { group: "Learn", rows: [
        { href: "#/rights", icon: ICONS.rights, color: "var(--accent)", title: "Know your rights", sub: `${RIGHTS.length} everyday situations, mapped to the Articles that protect you` },
        { href: "#/learn", icon: ICONS.learn, color: "var(--green)", title: "Learning journeys", sub: `${JOURNEYS.length} guided stories — the Emergency, Article 21, basic structure…` },
        { href: "#/visuals", icon: "◫", color: "var(--green)", title: "Visual guides", sub: "Diagrams of Parliament, the executive, the courts and law-making" } ] },
      { group: "Read", rows: [
        { href: "#/preamble", icon: ICONS.preamble, color: "var(--navy)", title: "The Preamble", sub: "We, the people of India…" },
        { href: "#/parts", icon: ICONS.parts, color: "var(--navy)", title: "Parts & Articles", sub: `${PARTS.length} Parts, ${ARTS.length} Articles, verbatim with explanations` },
        { href: "#/schedules", icon: ICONS.schedules, color: "var(--navy)", title: "Schedules", sub: "The 12 Schedules, including the Union, State and Concurrent Lists" },
        { href: "#/themes", icon: ICONS.themes, color: "var(--navy)", title: "Themes", sub: `${THEMES.length} cross-cutting themes, from federalism to free speech` } ] },
      { group: "History", rows: [
        { href: "#/amendments", icon: ICONS.amendments, color: "var(--accent)", title: "Amendments", sub: `All ${AMENDS.length} amendments since 1951 — what changed and why` },
        { href: "#/cases", icon: ICONS.cases, color: "var(--accent)", title: "Landmark judgments", sub: `${CASES.length} decisions that shaped what the text means` },
        { href: "#/timemachine", icon: ICONS.time, color: "var(--accent)", title: "Time machine", sub: "Read the Constitution as it stood on any date since 1950" },
        { href: "#/origins", icon: "❖", color: "var(--accent)", title: "Origins", sub: "How the Constituent Assembly made the Constitution, 1946–1950" },
        { href: "#/influences", icon: "◎", color: "var(--accent)", title: "World influences", sub: "What India drew from other constitutions, and how it adapted them" } ] },
      { group: "Explore", rows: [
        { href: "#/graph", icon: ICONS.graph, color: "var(--green)", title: "Article graph", sub: "See how Articles connect through cross-references, themes and cases" } ] }
    ];
    render(`
      <section class="home-hero">
        <div class="hh-main">
          <h1>The Constitution of India, explained.</h1>
          <p class="lede">Every Article in its official text, with a plain-language explanation, its full amendment history and the judgments that shaped it.</p>
          <form class="home-rights" id="homeRights">
            <label for="homeRq" class="hr-k">Know your rights</label>
            <div class="hr-row"><input id="homeRq" type="search" placeholder="What happened? e.g. police won't say why I was arrested" aria-label="Describe your situation">
            <button type="submit">Find</button></div>
          </form>
          <p class="hh-stats"><b>${PARTS.length}</b> Parts · <b>${live}</b> Articles in force · <b>${T.schedules.length}</b> Schedules · <b>${AMENDS.length}</b> Amendments</p>
        </div>
        <a class="preamble-card" href="#/preamble">
          <div class="label">The Preamble</div>
          <p>${esc(pre).replace(/(JUSTICE|LIBERTY|EQUALITY|FRATERNITY)/g, "<b>$1</b>")}</p>
          <span class="small">Read with explanation &amp; history →</span>
        </a>
      </section>

      <div class="home-start"><span class="hs-k">Popular Articles</span><div class="hs-row">
        ${[["14", "Equality"], ["19", "Free speech"], ["21", "Life & liberty"], ["32", "Remedies"], ["51A", "Duties"], ["246", "Union & State lists"], ["356", "President's Rule"], ["368", "Amendment"]]
          .map(([id, l]) => `<a class="startchip" href="#/article/${id}"><b>${id}</b> ${l}</a>`).join("")}</div></div>

      <div class="home-explore">${explore.map(g => dirGroup(g.group, g.rows.map(dirRow))).join("")}</div>

      ${JOURNEYS.length ? `<div class="section-title"><h2>Learn by following a story</h2><a href="#/learn">All ${JOURNEYS.length} →</a></div>
      <div class="hscroll">${JOURNEYS.map(j => `<a class="mini-journey" href="#/learn/${j.id}/1" style="--jc:${j.color}"><span class="mj-t">${esc(j.title)}</span><span class="mj-m">${j.minutes} min · ${j.steps.length} steps</span></a>`).join("")}</div>` : ""}

      <div class="home-recent">
        <section><div class="section-title"><h2>Latest amendments</h2><a href="#/amendments">All →</a></div>
          <div class="dir one">${latestAm.map(a => dirRow({ href: `#/amendment/${a.n}`, icon: `<b>${a.n}</b>`, color: "var(--navy)", title: esc(a.title), sub: `${a.year}${a.major ? " · major" : ""}` })).join("")}</div></section>
        <section><div class="section-title"><h2>Recent judgments</h2><a href="#/cases">All →</a></div>
          <div class="dir one">${recentCases.map(c => dirRow({ href: `#/case/${c.id}`, icon: ICONS.cases, color: "var(--accent)", title: esc(c.short || c.name), sub: String(c.year) })).join("")}</div></section>
      </div>
    `, "home");
    const hr = $("#homeRights");
    if (hr) hr.addEventListener("submit", e => { e.preventDefault(); const v = $("#homeRq").value.trim(); location.hash = v ? "#/rights?q=" + encodeURIComponent(v) : "#/rights"; });
  }

  function viewPreamble() {
    const ex = explain("Preamble");
    const hist = amendsOf.get("Preamble") ? [...amendsOf.get("Preamble")] : [];
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Preamble</div>
      <h1>The Preamble</h1>
      <div class="article-layout">
        <div>
          ${ex ? plainCard("Preamble", [{ cls: "s", t: ex.s }, { t: ex.e }]) : ""}
          <div class="verbatim"><div class="label">Verbatim text</div>${renderVerbatim(T.preamble.text, T.preamble.fn, false, T.preamble.notes)}</div>
        </div>
        <aside class="side">
          ${historyCard("Preamble", hist)}
          ${originsCard("Preamble")}
          ${casesCard(casesOf.get("Preamble") || [])}
        </aside>
      </div>`, "parts");
    bindFootnotes(view);
  }

  const PART_GROUPS = [
    ["Foundations", ["I", "II", "III", "IV", "IVA"]],
    ["The Union and the States", ["V", "VI", "VII", "VIII"]],
    ["Local self-government", ["IX", "IXA", "IXB"]],
    ["Federal relations, finance and services", ["X", "XI", "XII", "XIII", "XIV", "XIVA"]],
    ["Elections, special provisions and emergencies", ["XV", "XVI", "XVII", "XVIII", "XIX"]],
    ["Amendment and final provisions", ["XX", "XXI", "XXII"]]
  ];
  function viewParts() {
    const byPid = new Map(PARTS.map(p => [p.id, p]));
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Parts</div>
      <h1>Parts of the Constitution</h1>
      <p class="lede">${PARTS.length} Parts, from the Union and its territory to the final repeals. Larger Parts are divided into Chapters.</p>
      ${dirGroup("", [dirRow({ href: "#/preamble", icon: ICONS.preamble, color: "var(--navy)", title: "The Preamble", sub: "The Constitution's statement of purpose" })])}
      ${PART_GROUPS.map(([g, ids]) => dirGroup(g, ids.map(id => byPid.get(id)).filter(Boolean).map(p => dirRow({
        href: `#/part/${p.id}`, icon: `<b>${p.id}</b>`, color: /Omitted/.test(p.title) ? "var(--muted)" : "var(--navy)",
        title: esc(p.title), sub: esc(p.summary), meta: `Art. ${esc(p.from)}${p.from !== p.to ? "–" + esc(p.to) : ""}` })))).join("")}`, "parts");
  }

  function viewPart(id) {
    const p = PARTS.find(x => x.id === id);
    if (!p) return notFound();
    const i = PARTS.indexOf(p);
    let body = "";
    if (p.chapters) {
      body = p.chapters.map(c => {
        // sub-headings inside chapters
        let html = `<div class="chapter-h">${esc(c.title)}</div><div class="list">`;
        let lastSub = null;
        c.articles.forEach(a => {
          if (a.section && a.section !== lastSub && a !== c.articles[0]) { html += `</div><div class="small muted" style="margin:10px 2px 4px;font-weight:600">${esc(a.section)}</div><div class="list">`; }
          if (a.section) lastSub = a.section;
          html += artRow(a, { graph: true });
        });
        return html + "</div>";
      }).join("");
    } else {
      let html = `<div class="list">`; let lastSub = null;
      p.articles.forEach(a => {
        if (a.sub && a.sub !== lastSub) { html += `</div><div class="chapter-h">${esc(a.sub)}</div><div class="list">`; lastSub = a.sub; }
        html += artRow(a, { graph: true });
      });
      body = html + "</div>";
    }
    const themeCounts = {};
    p.articles.forEach(a => (themesOf.get(a.id) || []).forEach(t => { themeCounts[t.id] = (themeCounts[t.id] || 0) + 1; }));
    const topThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/parts">Parts</a><span class="sep">/</span>Part ${esc(p.id)}</div>
      <h1>Part ${esc(p.id)} — ${esc(p.title)}</h1>
      <p class="lede" style="max-width:75ch">${esc(p.summary)}</p>
      ${/Omitted/.test(p.title) ? "" : `<p><a class="btn btn-graph" href="#/graph?part=${encodeURIComponent(p.id)}">${GRAPH_SVG} Explore Part ${esc(p.id)} in the graph</a> <span class="small muted">or use the ${GRAPH_SVG.replace('width="16" height="16"', 'width="13" height="13"')} button beside any Article</span></p>`}
      ${VIS ? VIS.forPart(p.id).map(v => VIS.card(v, false)).join("") : ""}
      <p class="small muted">${p.articles.length} articles (${p.articles.filter(a => a.omitted).length} omitted)${topThemes.length ? " · Themes: " + topThemes.map(([t]) => `<a class="tag" href="#/theme/${t}">${esc(themeById.get(t).name)}</a>`).join("") : ""}</p>
      ${body}
      <div class="prevnext">
        ${i > 0 ? `<a href="#/part/${PARTS[i - 1].id}">← Part ${PARTS[i - 1].id}: ${esc(PARTS[i - 1].title)}</a>` : "<span></span>"}
        ${i < PARTS.length - 1 ? `<a class="next" href="#/part/${PARTS[i + 1].id}">Part ${PARTS[i + 1].id}: ${esc(PARTS[i + 1].title)} →</a>` : "<span></span>"}
      </div>`, "parts");
  }

  // tmArt: pass the article when the time machine can show its earlier text; each dot then switches the text in place
  function historyCard(id, ns, tmArt) {
    ns = (ns || []).slice().sort((a, b) => a - b);
    const pts = tmArt ? tmPoints(tmArt) : [];
    const dot = (iso, what) => iso ? `<button type="button" class="tl-dot" data-asof="${iso}" title="Show the text ${what}" aria-label="Show the text ${what}"></button>` : "";
    const afterIso = n => {
      if (!tmArt) return null;
      const hit = pts.filter(p => p.labels.some(l => l.startsWith(ordinal(n) + " "))).pop();
      if (hit) return hit.iso;
      const am = amendByN.get(n), d = am && TM.parseLong ? TM.parseLong(am.date) : null;
      return d ? isoDate(d) : null;
    };
    const items = ns.map(n => {
      const am = amendByN.get(n), iso = afterIso(n);
      return `<div class="tl-item${iso ? " has-dot" : ""}">${dot(iso, `as it read after the ${ordinal(n)} Amendment${iso ? " (" + fmtDate(parseIso(iso)) + ")" : ""}`)}<div class="tl-year">${am ? am.year : ""}</div>
        <div class="tl-title"><a href="#/amendment/${n}">${ordinal(n)} Amendment</a>${am && am.major ? ' <span class="tag major">major</span>' : ""}</div>
        ${am ? `<div class="tl-body">${esc(am.title)}</div>` : ""}</div>`;
    }).join("");
    return `<div class="card"><h3>Version history</h3>
      <div class="timeline">
        <div class="tl-item origin${tmArt ? " has-dot" : ""}">${tmArt ? dot(isoDate(TM.ORIGIN), "as it read on 26 January 1950") : ""}<div class="tl-year">1950</div><div class="tl-title">Constitution commences</div><div class="tl-body">26 January 1950${insertedBy(id) ? ` — this provision was <b>added later</b> by the ${ordinal(insertedBy(id))} Amendment` : ""}</div></div>
        ${items || `<div class="tl-item"><div class="tl-body muted">No amendments recorded in the official footnotes for this provision.</div></div>`}
      </div>
      <p class="small muted" style="margin:6px 0 0">${tmArt ? "Click a dot to see the text as it read at that point; the amendment name opens its page. " : ""}Derived from the official editorial footnotes; see the notes under the text for exact words inserted, substituted or omitted.</p></div>`;
  }
  function insertedBy(id) {
    const a = byId.get(id); if (!a) return null;
    // An article inserted by amendment carries a footnote right at its heading; we approximate using the first footnote whose text starts with "Ins." and that covers the whole article
    const first = a.text.match(/^⟦(\d+)⟧\[/);
    if (first && /^(Ins\.|Added)/.test(a.fn[first[1]] || "")) return fnAmend[first[1]] || null;
    return null;
  }

  function casesCard(cs) {
    if (!cs.length) return "";
    return `<div class="card"><h3>Landmark judgments</h3><ul>${cs.map(c => `<li><a href="#/case/${c.id}">${esc(c.short || c.name)}</a> <span class="muted small">(${c.year})</span></li>`).join("")}</ul></div>`;
  }

  // ------------------------------------------------------------ time machine
  const TM = window.COI_TM;
  const tmNote = TM ? TM.makeNoteParser({ fnAmend, amendments: AMENDS, fills: (window.COI_HISTORY_FILL || {}).fills }) : null;
  const partInsCache = new Map();
  function partInsOf(a) {
    if (!TM || !a.part) return null;
    if (!partInsCache.has(a.part.id)) partInsCache.set(a.part.id, TM.partInsertion(a.part.articles[0], tmNote, a.part.id));
    return partInsCache.get(a.part.id);
  }
  const fmtDate = d => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const isoDate = d => d.toISOString().slice(0, 10);
  const parseIso = s => { const d = new Date(String(s) + "T00:00:00Z"); return isNaN(d) ? null : d; };
  function tokensToHtml(html) {
    return html.replace(//g, '<ins class="tm-ins">').replace(//g, "</ins>")
      .replace(//g, '<del class="tm-del">').replace(//g, "</del>")
      .replace(//g, '<span class="tm-gap">').replace(//g, "</span>")
      .replace(//g, '<span class="tm-restored" title="Earlier wording restored from a historical transcription; not part of the official edition">').replace(//g, "</span>");
  }
  function tmPoints(a) {
    if (!TM) return [];
    const pts = TM.changePoints(a, tmNote);
    const pi = partInsOf(a);
    if (pi && pi.from && !pts.some(p => p.iso === isoDate(pi.from))) pts.push({ date: pi.from, iso: isoDate(pi.from), labels: [pi.label] });
    return pts.sort((x, y) => x.date - y.date);
  }
  function tmAvailable(a) { return !!TM && tmPoints(a).length > 0; }
  // how an article read on a date: {html, stats, status}
  function tmArticleView(a, date, mode) {
    const status = TM.statusOn(a, date, tmNote, partInsOf(a));
    if (status.state === "not-yet") {
      return { status, html: `<div class="tm-status">Article ${esc(a.id)} <b>did not exist</b> on ${fmtDate(date)}. It was added by the <b>${esc(status.by)}</b>, in force from ${fmtDate(status.since)}.</div>`, stats: { exact: 0, gaps: 0, changes: [] } };
    }
    if (status.state === "existed-omitted-later") {
      const until = status.until ? fmtDate(status.until) : "a later date";
      const hist = ((window.COI_HISTORY_FILL || {}).omitted || {})[a.id];
      const ver = hist ? hist.versions.filter(v => v.from <= isoDate(date)).pop() : null;
      if (ver) {
        return { status, restoredWhole: true, html: `<div class="tm-status">Article ${esc(a.id)} <b>was in force</b> on ${fmtDate(date)}; it was omitted with effect from ${until}. The current official edition no longer prints it, so the text below is <b>restored from a historical transcription</b> (version in force from ${fmtDate(parseIso(ver.from))}).</div>`
          + tokensToHtml(renderVerbatim(ver.text.split("\n").map(l => "" + l + "").join("\n"), {}, false)), stats: { exact: 0, gaps: 0, restored: 1, changes: [] } };
      }
      return { status, html: `<div class="tm-status">Article ${esc(a.id)} <b>was in force</b> on ${fmtDate(date)}. It was omitted with effect from ${until}; the current official edition does not reproduce its former text.</div>`, stats: { exact: 0, gaps: 1, changes: [] } };
    }
    const r = TM.renderAsOf(a.text, a.fn, date, mode, { note: tmNote });
    return { status, html: tokensToHtml(renderVerbatim(r.text, {}, a.omitted)), stats: r.stats };
  }
  function tmChangeList(changes) {
    if (!changes.length) return "";
    const sorted = changes.slice().sort((x, y) => (x.from || 0) - (y.from || 0));
    return `<div class="fnlist tm-changes"><div class="small muted" style="margin-bottom:4px">Changes made after this date (from the official footnotes)</div><ul>${sorted.map(n =>
      `<li><b>${n.from ? fmtDate(n.from) : ""}</b> · ${n.amend ? `<a href="#/amendment/${n.amend}">${esc(n.label)}</a>` : esc(n.label)} — <span class="muted">${esc(n.text)}</span></li>`).join("")}</ul></div>`;
  }
  function mountArticleTimeMachine(a, params) {
    const btn = $("#tmToggle");
    if (!btn) return;
    const bar = $("#tmbar"), body = $("#vbody"), label = $("#vlabel");
    const original = body.innerHTML, originalLabel = label.innerHTML;
    const pts = tmPoints(a);
    const opts = [{ iso: isoDate(TM.ORIGIN), text: "26 Jan 1950 — original Constitution" }]
      .concat(pts.map((p, i) => ({ iso: p.iso, text: `${fmtDate(p.date)} — after ${p.labels.join(", ")}${i === pts.length - 1 ? " (current text)" : ""}` })));
    const state = { on: false, asof: params.get("asof") || opts[0].iso, mode: params.get("tm") === "diff" ? "diff" : "read" };
    const setUrl = () => {
      const base = "#/article/" + encodeURIComponent(a.id);
      history.replaceState(null, "", state.on ? `${base}?asof=${state.asof}&tm=${state.mode}` : base);
    };
    const syncDots = () => document.querySelectorAll(".tl-dot").forEach(d => { const on = state.on && d.dataset.asof === state.asof; d.classList.toggle("on", on); d.setAttribute("aria-pressed", on); });
    function draw() {
      syncDots();
      if (!state.on) {
        bar.innerHTML = ""; body.innerHTML = original; label.innerHTML = originalLabel; btn.classList.remove("on");
        bindFootnotes(view); setUrl(); return;
      }
      btn.classList.add("on");
      const date = parseIso(state.asof) || TM.ORIGIN;
      if (!opts.some(o => o.iso === state.asof)) { opts.push({ iso: state.asof, text: fmtDate(date) + " — chosen date" }); opts.sort((x, y) => x.iso.localeCompare(y.iso)); }
      const v = tmArticleView(a, date, state.mode);
      const inForce = v.status.state === "in-force";
      const same = inForce && !v.stats.changes.length;
      const exact = inForce && v.stats.changes.length && !v.stats.gaps;
      const nr = v.stats.restored || 0;
      const restoredNote = nr ? ` · ${nr} passage${nr === 1 ? "" : "s"} restored from historical text` : "";
      const badge = v.restoredWhole ? `<span class="tm-badge restored">Restored from historical text</span>`
        : !inForce ? "" : same ? `<span class="tm-badge same">Identical to today's text</span>`
        : exact ? `<span class="tm-badge exact">✓ ${nr ? "Complete" : "Exact reconstruction"}${restoredNote}</span>`
        : `<span class="tm-badge partial">${v.stats.gaps} earlier passage${v.stats.gaps === 1 ? "" : "s"} not recorded${restoredNote}</span>`;
      bar.innerHTML = `<div class="tmbar">
        <label class="tm-field">As it read on
          <select id="tmDate">${opts.map(o => `<option value="${o.iso}" ${o.iso === state.asof ? "selected" : ""}>${esc(o.text)}</option>`).join("")}</select></label>
        <span class="seg"><button data-m="read" class="${state.mode === "read" ? "on" : ""}">Read as of</button><button data-m="diff" class="${state.mode === "diff" ? "on" : ""}">Changes since</button></span>
        ${badge}
        <button class="tm-close" id="tmClose" title="Back to the current text">✕ Today</button>
      </div>
      ${(state.mode === "diff" && inForce && !same) || nr ? `<div class="tm-legend small">${state.mode === "diff" ? `<ins class="tm-ins">added later</ins> <del class="tm-del">removed later</del> ` : ""}${nr ? `<span class="tm-restored">restored from historical text</span> ` : ""}${v.stats.gaps ? `<span class="tm-gap">earlier wording not recorded</span>` : ""}</div>` : ""}`;
      label.innerHTML = `Text as on <b>${fmtDate(date)}</b> <span class="muted" style="font-weight:500;text-transform:none;letter-spacing:0">· ${v.restoredWhole ? "restored from a historical transcription" : (v.stats.restored ? "reconstructed from the official footnotes, with restored passages" : "reconstructed from the official footnotes")}</span>`;
      body.innerHTML = v.html + tmChangeList(v.stats.changes);
      bar.querySelector("#tmDate").onchange = e => { state.asof = e.target.value; draw(); };
      bar.querySelectorAll("[data-m]").forEach(b => { b.onclick = () => { state.mode = b.dataset.m; draw(); }; });
      bar.querySelector("#tmClose").onclick = () => { state.on = false; draw(); };
      setUrl();
    }
    btn.onclick = () => { state.on = !state.on; draw(); };
    document.querySelectorAll(".tl-dot").forEach(d => d.addEventListener("click", () => {
      if (state.on && state.asof === d.dataset.asof) { state.on = false; draw(); return; }   // second click: back to today's text
      state.on = true; state.asof = d.dataset.asof; state.mode = "read"; draw();
      const v = $("#verbatim"), top = v.getBoundingClientRect().top, hdr = document.getElementById("topbar").offsetHeight;
      if (top < hdr || top > window.innerHeight * 0.6) window.scrollTo({ top: top + window.scrollY - hdr - 12, behavior: "smooth" });
    }));
    if (params.get("asof")) { state.on = true; draw(); }
  }

  // ------------------------------------------------------------ time machine page
  const TM_MOMENTS = [
    ["1950-01-26", "Commencement"],
    ["1951-06-17", "Before the 1st Amendment"],
    ["1956-10-31", "Before States reorganisation"],
    ["1975-06-24", "Eve of the Emergency"],
    ["1977-01-02", "Before the 42nd Amendment"],
    ["1979-06-19", "Before the 44th Amendment"],
    ["1993-04-23", "Before Panchayati Raj"],
    ["2010-03-31", "Before the Right to Education"],
    ["2016-09-15", "Before GST"]
  ];
  function constitutionOn(date) {
    const rows = [];
    let inForce = 0;
    ARTS.forEach(a => {
      const st = TM.statusOn(a, date, tmNote, partInsOf(a));
      if (st.state === "omitted") return;
      if (st.state === "not-yet") { rows.push({ a, kind: "added", note: `added later by the ${st.by} (${fmtDate(st.since)})`, date: st.since }); return; }
      inForce++;
      if (st.state === "existed-omitted-later") { rows.push({ a, kind: "removed", note: `omitted with effect from ${st.until ? fmtDate(st.until) : "a later date"}`, date: st.until }); return; }
      const r = TM.renderAsOf(a.text, a.fn, date, "read", { note: tmNote });
      if (r.stats.changes.length) {
        const labels = [...new Set(r.stats.changes.slice().sort((x, y) => (x.from || 0) - (y.from || 0)).map(n => n.label))];
        rows.push({ a, kind: "changed", note: labels.slice(0, 4).join(", ") + (labels.length > 4 ? ` +${labels.length - 4} more` : ""), gaps: r.stats.gaps });
      }
    });
    return { rows, inForce };
  }
  function amendDateOf(am) { return TM.parseLong(am.date) || new Date(Date.UTC(am.year, 0, 1)); }

  let tmPageDate = null;
  function viewTimeMachinePage(params) {
    if (!TM) return notFound();
    const startIso = params.get("date") || (tmPageDate ? isoDate(tmPageDate) : "1950-01-26");
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Time machine</div>
      <h1>Constitution time machine</h1>
      <p class="lede" style="max-width:78ch">Pick any date since 26 January 1950 to see the Constitution as it stood then: which Articles existed, which have been added or removed since, and exactly how the wording has changed. Every reconstruction comes from the official editorial footnotes; where they do not record the earlier wording, the gap is marked instead of guessed.</p>
      <div class="tm-slider">
        <div class="tm-year" id="tmYear"></div>
        <input type="range" id="tmRange" min="1950" max="2026" step="1" aria-label="Year">
        <input type="date" id="tmDateIn" min="1950-01-26" max="${isoDate(new Date())}" style="padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit">
      </div>
      <div class="tm-chips">${TM_MOMENTS.map(([d, l]) => `<button class="chip" data-d="${d}">${esc(l)}</button>`).join("")}</div>
      <div id="tmOut"></div>`, "timemachine");
    const out = $("#tmOut"), range = $("#tmRange"), din = $("#tmDateIn"), yearEl = $("#tmYear");
    let timer;
    function go(iso, fromRange) {
      const date = parseIso(iso) || TM.ORIGIN;
      tmPageDate = date;
      yearEl.textContent = fmtDate(date);
      if (!fromRange) range.value = String(date.getUTCFullYear());
      din.value = isoDate(date);
      history.replaceState(null, "", "#/timemachine?date=" + isoDate(date));
      document.querySelectorAll(".tm-chips .chip").forEach(c => c.classList.toggle("on", c.dataset.d === isoDate(date)));
      clearTimeout(timer);
      timer = setTimeout(() => drawOut(date), fromRange ? 60 : 0);
    }
    function drawOut(date) {
      const { rows, inForce } = constitutionOn(date);
      const amendsSince = AMENDS.filter(am => amendDateOf(am) > date);
      const amendsBy = AMENDS.length - amendsSince.length;
      const pre = TM.renderAsOf(T.preamble.text, T.preamble.fn, date, "diff", { note: tmNote });
      const byPart = new Map();
      rows.forEach(r => { const k = r.a.part; if (!byPart.has(k)) byPart.set(k, []); byPart.get(k).push(r); });
      const count = k => rows.filter(r => r.kind === k).length;
      const exactChanged = rows.filter(r => r.kind === "changed" && !r.gaps).length;
      out.innerHTML = `
        <div class="tm-stat-grid">
          <div class="stat"><b>${inForce}</b><span>Articles in force on this date</span></div>
          <div class="stat"><b>${amendsBy}</b><span>Amendments made by then</span></div>
          <div class="stat"><b>${count("changed")}</b><span>Articles worded differently from today</span></div>
          <div class="stat"><b>${count("added")} / ${count("removed")}</b><span>Articles added since / removed since</span></div>
        </div>
        <div class="verbatim" style="margin-bottom:18px"><div class="label"><span>The Preamble on ${fmtDate(date)}</span><a href="#/preamble" style="text-transform:none;letter-spacing:0;font-weight:500">Today's Preamble →</a></div>
          ${pre.stats.changes.length ? `<div class="tm-legend small"><ins class="tm-ins">added later</ins> <del class="tm-del">removed later</del></div>` : `<p class="small muted">Identical to today's Preamble.</p>`}
          ${tokensToHtml(renderVerbatim(pre.text, {}, false))}</div>
        ${amendsSince.length ? `<p class="small muted">${amendsSince.length} amendment${amendsSince.length === 1 ? "" : "s"} came after this date, from the <a href="#/amendment/${amendsSince[0].n}">${ordinal(amendsSince[0].n)}</a> (${esc(amendsSince[0].title)}) onwards. ${count("changed") ? (exactChanged === count("changed") ? `All ${count("changed")} changed Articles can be shown in full as they read then — from the official footnotes, with earlier wording they do not record restored from a historical transcription and marked as such.` : `${exactChanged} of the ${count("changed")} changed Articles can be shown in full — from the official footnotes, with some earlier passages restored from a historical transcription; the rest still contain passages whose earlier wording neither source records.`) : ""}</p>` : `<p class="small muted">No amendments have been made since this date.</p>`}
        ${rows.length ? [...byPart.entries()].map(([p, rs]) => `
          <div class="chapter-h">Part ${esc(p.id)} — ${esc(p.title)} <span class="muted" style="text-transform:none;letter-spacing:0;font-weight:500">· ${rs.length}</span></div>
          <div class="list">${rs.map(r => `<a class="tm-art" href="#/article/${encodeURIComponent(r.a.id)}?asof=${isoDate(date)}&tm=${r.kind === "changed" ? "diff" : "read"}">
            <span class="anum" style="font-weight:700;color:var(--navy)">${esc(r.a.id)}</span>
            <span><span style="font-weight:550">${esc(r.a.title)}</span><br><span class="small muted">${esc(r.note)}</span></span>
            <span class="tm-kind ${r.kind}">${r.kind === "added" ? "Added later" : r.kind === "removed" ? "Removed since" : "Changed since"}</span></a>`).join("")}</div>`).join("")
        : `<div class="empty">On this date the text was the same as today.</div>`}`;
    }
    range.addEventListener("input", () => { const y = +range.value; go(y === 1950 ? "1950-01-26" : `${y}-12-31`, true); });
    din.addEventListener("change", () => { if (din.value) go(din.value); });
    document.querySelectorAll(".tm-chips .chip").forEach(c => c.addEventListener("click", () => go(c.dataset.d)));
    go(startIso);
  }

  // ------------------------------------------------------------ learning journeys
  const JOURNEYS = window.COI_JOURNEYS || [];
  const journeyById = new Map(JOURNEYS.map(j => [j.id, j]));
  function loadLearn() { try { return JSON.parse(localStorage.getItem("coi-learn") || "{}"); } catch (e) { return {}; } }
  function saveLearn(p) { try { localStorage.setItem("coi-learn", JSON.stringify(p)); } catch (e) { /* ignore */ } }
  function journeyProgress(j) {
    const p = loadLearn()[j.id] || { visited: [], quiz: {} };
    const visited = new Set(p.visited || []);
    const quizzes = j.steps.map((s, i) => s.quiz ? i : -1).filter(i => i >= 0);
    const answered = quizzes.filter(i => p.quiz && p.quiz[i] !== undefined);
    const correct = answered.filter(i => p.quiz[i] === j.steps[i].quiz.answer);
    return { visited, seen: visited.size, total: j.steps.length, quizzes: quizzes.length, answered: answered.length, correct: correct.length, done: !!p.done };
  }
  function markVisited(j, i) {
    const all = loadLearn();
    const p = all[j.id] || { visited: [], quiz: {} };
    if (!p.visited.includes(i)) p.visited.push(i);
    all[j.id] = p; saveLearn(all);
  }

  function journeyCard(j) {
    const pr = journeyProgress(j);
    const pct = Math.round(pr.seen / pr.total * 100);
    const cta = pr.done ? "Review" : pr.seen ? "Continue" : "Start";
    const resume = pr.done || !pr.seen ? 1 : Math.min(pr.total, Math.max(...pr.visited) + 2);
    return `<a class="card journey-card" href="#/learn/${j.id}/${resume}" style="--jc:${j.color}">
      <div class="jc-band"></div>
      <h3>${esc(j.title)}</h3><p>${esc(j.tagline)}</p>
      <div class="jc-meta"><span>${j.minutes} min</span><span>${j.steps.length} steps</span><span>${pr.quizzes} quiz${pr.quizzes === 1 ? "" : "zes"}</span></div>
      <div class="jc-progress"><span style="width:${pct}%"></span></div>
      <div class="jc-foot"><span class="small muted">${pr.done ? `Completed · ${pr.correct}/${pr.quizzes} correct` : pr.seen ? `${pr.seen} of ${pr.total} steps` : "Not started"}</span><span class="jc-cta">${cta} →</span></div></a>`;
  }

  function viewLearn() {
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Learn</div>
      <h1>Learning journeys</h1>
      <p class="lede" style="max-width:75ch">Short guided stories through the Constitution. Each one walks through the real Articles, amendments and judgments — with the official text, time-machine views of how the words changed, and a few quick questions along the way.</p>
      <div class="grid cols-3" style="margin-top:18px">${JOURNEYS.map(journeyCard).join("")}</div>
      <p class="small muted" style="margin-top:14px">Your progress is saved in this browser only.</p>`, "learn");
  }

  function embedHtml(e) {
    if (e.kind === "article") {
      const a = byId.get(e.id); if (!a) return "";
      const ex = explain(a.id);
      return `<a class="embed embed-art" href="#/article/${encodeURIComponent(a.id)}">
        <div class="embed-k">Article ${esc(a.id)}${a.part ? ` · Part ${esc(a.part.id)}` : ""}</div>
        <div class="embed-t">${esc(a.title)}</div>${ex ? `<div class="embed-s">${esc(ex.s)}</div>` : ""}<div class="embed-go">Read the Article →</div></a>`;
    }
    if (e.kind === "case") {
      const c = caseById.get(e.id); if (!c) return "";
      return `<a class="embed embed-case" href="#/case/${c.id}">
        <div class="embed-k">Judgment · ${c.year}${c.bench ? ` · ${c.bench} judges` : ""}</div>
        <div class="embed-t">${esc(c.name)}</div><div class="embed-s">${esc((c.held || "").split(/(?<=\.)\s/)[0])}</div><div class="embed-go">Read the case note →</div></a>`;
    }
    if (e.kind === "amendment") {
      const am = amendByN.get(e.n); if (!am) return "";
      return `<a class="embed embed-am" href="#/amendment/${am.n}">
        <div class="embed-k">${ordinal(am.n)} Amendment · ${am.year}</div>
        <div class="embed-t">${esc(am.title)}</div><div class="embed-s">${esc(am.summary.split(/(?<=\.)\s/)[0])}</div><div class="embed-go">What changed →</div></a>`;
    }
    if (e.kind === "tm" && TM) {
      const date = parseIso(e.asof) || TM.ORIGIN;
      let body, link, changed = true;
      if (e.article === "Preamble") {
        const r = TM.renderAsOf(T.preamble.text, T.preamble.fn, date, e.mode || "diff", { note: tmNote });
        body = tokensToHtml(renderVerbatim(r.text, {}, false));
        changed = r.stats.changes.length > 0;
        link = `#/timemachine?date=${isoDate(date)}`;
      } else {
        const a = byId.get(e.article); if (!a) return "";
        const v = tmArticleView(a, date, e.mode || "diff");
        body = v.html;
        changed = v.status.state !== "in-force" || v.stats.changes.length > 0;
        link = `#/article/${encodeURIComponent(a.id)}?asof=${isoDate(date)}&tm=${e.mode || "diff"}`;
      }
      if (!changed) body = `<span class="tm-badge same">Identical to today's text</span>` + body;
      return `<div class="embed embed-tm">
        <div class="embed-k">⏱ Time machine · ${fmtDate(date)}</div>
        <div class="embed-t">${esc(e.caption || "")}</div>
        ${(e.mode || "diff") === "diff" && changed ? `<div class="tm-legend small"><ins class="tm-ins">added later</ins> <del class="tm-del">removed later</del> <span class="tm-gap">wording not recorded</span></div>` : ""}
        <div class="embed-tm-body">${body}</div>
        <a class="embed-go" href="${link}">Open in the time machine →</a></div>`;
    }
    return "";
  }

  function viewJourneyStep(jid, stepArg) {
    const j = journeyById.get(jid);
    if (!j) return notFound();
    if (stepArg === "done") return viewJourneyDone(j);
    const n = Math.max(1, Math.min(j.steps.length, parseInt(stepArg, 10) || 1));
    const i = n - 1, s = j.steps[i];
    markVisited(j, i);
    const pr = journeyProgress(j);
    const saved = (loadLearn()[j.id] || {}).quiz || {};
    const prevHref = n > 1 ? `#/learn/${j.id}/${n - 1}` : "#/learn";
    const nextHref = n < j.steps.length ? `#/learn/${j.id}/${n + 1}` : `#/learn/${j.id}/done`;
    const q = s.quiz;
    render(`
      <div class="journey" style="--jc:${j.color}">
        <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/learn">Learn</a><span class="sep">/</span>${esc(j.title)}</div>
        <div class="j-head">
          <div class="j-title">${esc(j.title)}</div>
          <div class="j-dots" role="navigation" aria-label="Steps">${j.steps.map((st, k) => `<a href="#/learn/${j.id}/${k + 1}" class="j-dot ${k === i ? "cur" : ""} ${pr.visited.has(k) ? "seen" : ""}" title="${k + 1}. ${esc(st.title)}" aria-label="Step ${k + 1}: ${esc(st.title)}"></a>`).join("")}</div>
          <div class="small muted">Step ${n} of ${j.steps.length}</div>
        </div>
        <article class="j-step">
          <h1>${esc(s.title)}</h1>
          <div class="j-body">${s.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
          ${(s.embeds || []).length ? `<div class="j-embeds ${s.embeds.some(e => e.kind === "tm") ? "has-tm" : ""}">${s.embeds.map(embedHtml).join("")}</div>` : ""}
          ${q ? `<div class="quiz" id="quiz"><div class="quiz-k">Quick check</div><div class="quiz-q">${esc(q.q)}</div>
            <div class="quiz-opts">${q.options.map((o, k) => `<button class="quiz-opt" data-k="${k}">${esc(o)}</button>`).join("")}</div>
            <div class="quiz-why" hidden></div></div>` : ""}
        </article>
        <div class="prevnext j-nav">
          <a href="${prevHref}">← ${n > 1 ? esc(j.steps[i - 1].title) : "All journeys"}</a>
          <a class="next primary" href="${nextHref}">${n < j.steps.length ? esc(j.steps[i + 1].title) + " →" : "Finish journey ✓"}</a>
        </div>
        <p class="small muted kbd-hint" style="text-align:center;margin-top:10px">Use <kbd>←</kbd> <kbd>→</kbd> to move between steps</p>
      </div>`, "learn");
    view.dataset.prevHref = prevHref; view.dataset.nextHref = nextHref;
    if (q) {
      const box = $("#quiz");
      const show = (k, persist) => {
        box.querySelectorAll(".quiz-opt").forEach(b => {
          const bk = +b.dataset.k;
          b.disabled = true;
          b.classList.toggle("right", bk === q.answer);
          b.classList.toggle("wrong", bk === k && k !== q.answer);
        });
        const why = box.querySelector(".quiz-why");
        why.hidden = false;
        why.innerHTML = `<b>${k === q.answer ? "Correct." : "Not quite."}</b> ${esc(q.why)}`;
        if (persist) {
          const all = loadLearn(); const p = all[j.id] || { visited: [], quiz: {} };
          p.quiz = p.quiz || {}; p.quiz[i] = k; all[j.id] = p; saveLearn(all);
        }
      };
      box.querySelectorAll(".quiz-opt").forEach(b => b.addEventListener("click", () => show(+b.dataset.k, true)));
      if (saved[i] !== undefined) show(saved[i], false);
    }
  }

  function viewJourneyDone(j) {
    const all = loadLearn(); const p = all[j.id] || { visited: [], quiz: {} }; p.done = true; all[j.id] = p; saveLearn(all);
    const pr = journeyProgress(j);
    const arts = [], cases = [], ams = [];
    j.steps.forEach(s => (s.embeds || []).forEach(e => {
      if ((e.kind === "article" || e.kind === "tm") && byId.has(e.id || e.article) && !arts.includes(e.id || e.article)) arts.push(e.id || e.article);
      if (e.kind === "case" && caseById.has(e.id) && !cases.includes(e.id)) cases.push(e.id);
      if (e.kind === "amendment" && !ams.includes(e.n)) ams.push(e.n);
    }));
    const idx = JOURNEYS.indexOf(j);
    const others = JOURNEYS.filter(x => x !== j && !journeyProgress(x).done);
    const next = others.find(x => JOURNEYS.indexOf(x) > idx) || others[0];
    render(`
      <div class="journey" style="--jc:${j.color}">
        <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/learn">Learn</a><span class="sep">/</span>${esc(j.title)}</div>
        <div class="j-done">
          <div class="j-done-badge">✓</div>
          <h1>Journey complete</h1>
          <p class="lede">${esc(j.title)}</p>
          ${pr.quizzes ? `<p class="j-score">${pr.correct} of ${pr.quizzes} questions answered correctly${pr.answered < pr.quizzes ? ` (${pr.quizzes - pr.answered} skipped)` : ""}</p>` : ""}
        </div>
        <div class="section-title"><h2>What you explored</h2></div>
        ${arts.length ? `<div class="small muted">Articles</div><div style="margin-bottom:10px">${arts.map(x => `<a class="tag" href="#/article/${encodeURIComponent(x)}">Art. ${esc(x)}</a>`).join("")}</div>` : ""}
        ${cases.length ? `<div class="small muted">Judgments</div><div style="margin-bottom:10px">${cases.map(x => `<a class="tag" href="#/case/${x}">${esc(caseById.get(x).short || caseById.get(x).name)}</a>`).join("")}</div>` : ""}
        ${ams.length ? `<div class="small muted">Amendments</div><div style="margin-bottom:10px">${ams.map(n => `<a class="tag" href="#/amendment/${n}">${ordinal(n)}</a>`).join("")}</div>` : ""}
        <div class="prevnext j-nav">
          <a href="#/learn/${j.id}/1">↺ Review from the start</a>
          ${next ? `<a class="next primary" href="#/learn/${next.id}/1">Next journey: ${esc(next.title)} →</a>` : `<a class="next primary" href="#/learn">All journeys →</a>`}
        </div>
      </div>`, "learn");
    view.dataset.prevHref = `#/learn/${j.id}/${j.steps.length}`; view.dataset.nextHref = next ? `#/learn/${next.id}/1` : "#/learn";
  }

  // ------------------------------------------------------------ know your rights
  const RIGHTS = window.COI_RIGHTS || [];
  const RCATS = window.COI_RIGHTS_CATS || [];
  const RHELP = window.COI_RIGHTS_HELP || {};
  const rightById = new Map(RIGHTS.map(r => [r.id, r]));
  const rightsOfArticle = new Map();
  RIGHTS.forEach(r => r.rights.forEach(x => x.refs.forEach(a => {
    if (!rightsOfArticle.has(a)) rightsOfArticle.set(a, []);
    if (!rightsOfArticle.get(a).includes(r)) rightsOfArticle.get(a).push(r);
  })));
  const RSTOP = new Set("i im i'm me my mine we our you your he she they them their it its a an the and or but if of to in on at for from by with without was were is are be been being am do does did done have has had can could should would will shall may might must not no yes this that these those there here what when where why how who whom which as about into over after before again very just also so than then too only own same some such any all both each few more most other let lets get got".split(" "));
  const RSYN = { documents: "records", document: "records", papers: "records", municipality: "government", municipal: "government", panchayat: "government", collector: "government", tehsil: "government", cops: "police", cop: "police", policeman: "police", thana: "police", lockup: "custody", jail: "custody", prison: "custody", detained: "arrest", picked: "arrest", arrested: "arrest", beaten: "custody", torture: "custody", tortured: "custody", fired: "job", sacked: "job", boss: "workplace", office: "workplace", employer: "workplace", salary: "wages", wages: "minimum wage", tweet: "social media", posted: "post", facebook: "social media", instagram: "social media", whatsapp: "social media", youtube: "social media", demonstration: "protest", rally: "protest", march: "protest", net: "internet", wifi: "internet", data: "data", dalit: "caste", lower: "caste", temple: "temple", church: "religion", mosque: "religion", gurdwara: "religion", pray: "prayer", trans: "transgender", gay: "lgbt", lesbian: "lgbt", queer: "lgbt", harassed: "harassment", harassing: "harassment", molested: "harassment", kid: "child", kids: "child", son: "child", daughter: "child", children: "child", bulldozer: "demolition", demolish: "demolition", evict: "eviction", evicted: "eviction", slum: "eviction", farm: "land", plot: "land", vote: "voting", voter: "voting", election: "voting", rti: "information", lawyer: "lawyer", advocate: "lawyer", poor: "legal aid", money: "afford", undertrial: "undertrial", bail: "bail", confess: "confess", narco: "narco", polygraph: "polygraph" };
  function rTokens(q) {
    return String(q).toLowerCase().replace(/[^a-z0-9%' ]+/g, " ").split(/\s+/).filter(w => w && !RSTOP.has(w)).map(w => RSYN[w] || w);
  }
  function rightsSearch(q) {
    const toks = rTokens(q);
    if (!toks.length) return [];
    return RIGHTS.map(r => {
      const tags = r.tags.join(" ").toLowerCase(), qq = r.q.toLowerCase(), body = (r.short + " " + r.steps.join(" ")).toLowerCase();
      let score = 0;
      toks.forEach(t => {
        const stem = t.length > 4 ? t.slice(0, t.length - 1) : t;
        if (tags.includes(t)) score += 4; else if (tags.includes(stem)) score += 3;
        if (qq.includes(stem)) score += 2;
        if (body.includes(stem)) score += 1;
      });
      return { r, score };
    }).filter(x => x.score >= 3).sort((a, b) => b.score - a.score).map(x => x.r);
  }
  function helpStrip(keys) {
    const ks = (keys && keys.length ? keys : Object.keys(RHELP)).filter(k => RHELP[k]);
    return `<div class="help-strip">${ks.map(k => `<a class="help-chip" href="tel:${RHELP[k].number}"><b>${esc(RHELP[k].number)}</b><span>${esc(RHELP[k].label)}</span></a>`).join("")}</div>`;
  }
  const RIGHTS_DISCLAIMER = `This is general information about your constitutional rights, not legal advice for your situation. Laws and procedures change; for a real problem, speak to a lawyer or a Legal Services Authority (free legal aid: <a href="tel:15100">15100</a>). In an emergency, call <a href="tel:112">112</a>.`;

  function rightCard(r) {
    const arts = [...new Set(r.rights.flatMap(x => x.refs))].slice(0, 3).map(a => `Art. ${esc(a)}`).join(", ");
    return dirRow({ href: `#/rights/${r.id}`, icon: ICONS.rights, color: "var(--accent)", title: esc(r.q), sub: "", meta: arts });
  }

  function viewRights(params) {
    const q0 = params.get("q") || "";
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Know your rights</div>
      <div class="rights-hero">
        <h1>Know your rights</h1>
        <p class="lede">Describe what happened in your own words, or pick a situation below. Each answer shows which Articles of the Constitution protect you, what you can do, and where the limits are.</p>
        <div class="rights-search"><input id="rq" type="search" placeholder="e.g. the police arrested my brother and won't say why" value="${esc(q0)}" aria-label="Describe your situation" autocomplete="off"></div>
        <div id="rres"></div>
      </div>
      <div class="notice">${RIGHTS_DISCLAIMER}</div>
      ${helpStrip()}
      <div class="jump-row" aria-label="Topics">${RCATS.filter(c => RIGHTS.some(r => r.cat === c.id)).map(c => `<a class="chip" href="#" data-jump="rc-${c.id}">${esc(c.name)}</a>`).join("")}</div>
      ${RCATS.map(c => {
        const rs = RIGHTS.filter(r => r.cat === c.id);
        return rs.length ? `<div id="rc-${c.id}">${dirGroup(esc(c.name), rs.map(rightCard), String(rs.length))}</div>` : "";
      }).join("")}`, "rights");
    view.querySelectorAll("[data-jump]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (document.getElementById("topbar").offsetHeight + 8), behavior: "smooth" }); }));
    const inp = $("#rq"), out = $("#rres");
    const draw = () => {
      const v = inp.value.trim();
      history.replaceState(null, "", v ? "#/rights?q=" + encodeURIComponent(v) : "#/rights");
      if (!v) { out.innerHTML = ""; return; }
      const res = rightsSearch(v).slice(0, 6);
      out.innerHTML = res.length
        ? `<div class="small muted" style="margin:10px 0 6px">Closest situations</div><div class="dir one">${res.map(rightCard).join("")}</div>`
        : `<p class="small muted" style="margin-top:10px">No close match. Try other words — or browse the situations below, or <a href="#" id="rfull">search the whole Constitution</a>.</p>`;
      const f = $("#rfull"); if (f) f.onclick = ev => { ev.preventDefault(); qin.value = v; qin.focus(); drawSearch(); };
    };
    let t; inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(draw, 120); });
    inp.addEventListener("keydown", e => { if (e.key === "Enter") { const first = out.querySelector("a.dir-row"); if (first) location.hash = first.getAttribute("href"); } });
    if (q0) draw(); else setTimeout(() => inp.focus(), 50);
  }

  function viewRight(id) {
    const r = rightById.get(id);
    if (!r) return notFound();
    const cat = RCATS.find(c => c.id === r.cat);
    const arts = [...new Set(r.rights.flatMap(x => x.refs))];
    const related = RIGHTS.filter(x => x !== r && (x.cat === r.cat || x.rights.some(y => y.refs.some(a => arts.includes(a))))).slice(0, 5);
    const artChip = a => { const art = byId.get(a); const ex = explain(a); return `<a class="tag art-chip" href="#/article/${encodeURIComponent(a)}" title="${esc(art ? art.title + (ex ? " — " + ex.s : "") : "")}">Art. ${esc(a)}</a>`; };
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/rights">Know your rights</a><span class="sep">/</span>${esc(cat ? cat.name : "")}</div>
      <div class="rc-k" style="margin-bottom:4px">${esc(cat ? cat.name : "")}</div>
      <h1>${esc(r.q)}</h1>
      <div class="article-layout">
        <div>
          <div class="plain"><div class="label">In short</div><div style="font-size:16px">${esc(r.short)}</div></div>
          <section class="r-sec"><h2>Your rights</h2>
            <ul class="r-rights">${r.rights.map(x => `<li><span>${esc(x.text)}</span> ${x.refs.map(artChip).join("")}</li>`).join("")}</ul></section>
          <section class="r-sec"><h2>What you can do</h2><ol class="r-steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></section>
          ${r.limits.length ? `<section class="r-sec"><h2>Limits and exceptions</h2><ul class="r-limits">${r.limits.map(s => `<li>${esc(s)}</li>`).join("")}</ul></section>` : ""}
          ${(r.cases.length || r.also.length) ? `<section class="r-sec"><h2>Judgments and laws</h2>
            ${r.cases.length ? `<div class="j-embeds" style="--jc:var(--navy);margin-top:8px">${r.cases.map(c => embedHtml({ kind: "case", id: c })).join("")}</div>` : ""}
            ${r.also.length ? `<ul class="r-also">${r.also.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}</section>` : ""}
          <div class="notice" style="margin-top:22px">${RIGHTS_DISCLAIMER}</div>
        </div>
        <aside class="side">
          ${r.help.length ? `<div class="card"><h3>Helplines</h3>${helpStrip(r.help)}</div>` : ""}
          <div class="card"><h3>The Articles behind this</h3><div class="j-embeds" style="--jc:var(--accent);grid-template-columns:1fr;margin:0">${arts.map(a => embedHtml({ kind: "article", id: a })).join("")}</div></div>
          ${related.length ? `<div class="card"><h3>Related situations</h3><ul>${related.map(x => `<li><a href="#/rights/${x.id}">${esc(x.q)}</a></li>`).join("")}</ul></div>` : ""}
        </aside>
      </div>`, "rights");
  }

  // ------------------------------------------------------------ visual guides (js/visuals.js)
  const VIS = window.COI_VISUALS || null;
  function viewVisuals() {
    if (!VIS) return notFound();
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Visual guides</div>
      <h1>Visual guides</h1>
      <p class="lede">Diagrams of how the institutions created by the Constitution fit together. Every box and arrow cites its Article, and the same guides appear beside the Articles they explain.</p>
      ${dirGroup("", VIS.LIST.map(v => dirRow({ href: "#/visual/" + v.id, icon: "◫", color: "var(--green)", title: esc(v.title), sub: esc(v.sub) })))}`, "visuals");
  }
  function viewVisual(id) {
    const v = VIS && VIS.byId(id);
    if (!v) return notFound();
    const i = VIS.LIST.indexOf(v), prev = VIS.LIST[i - 1], next = VIS.LIST[i + 1];
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/visuals">Visual guides</a><span class="sep">/</span>${esc(v.title)}</div>
      <h1>${esc(v.title)}</h1>
      <p class="lede">${esc(v.sub)}</p>
      ${VIS.full(v)}
      <div class="prevnext">${prev ? `<a href="#/visual/${prev.id}">← ${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a class="next" href="#/visual/${next.id}">${esc(next.title)} →</a>` : "<span></span>"}</div>`, "visuals");
  }

  // ------------------------------------------------------------ Constituent Assembly origins
  const CA = window.COI_CA || null;
  const DRAFT = window.COI_DRAFTING || {};
  const MON3 = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const debateUrl = iso => { const [y, m, d] = iso.split("-"); return `https://www.constitutionofindia.net/debates/${d}-${MON3[+m - 1]}-${y}/`; };
  const fmtIso = iso => fmtDate(parseIso(iso));
  function joinDates(list) {
    const ds = list.map(fmtIso);
    return ds.length <= 1 ? ds.join("") : ds.slice(0, -1).join(", ") + " and " + ds[ds.length - 1];
  }
  const borrowedOf = new Map();
  const INF_SRC = window.COI_INFLUENCES ? window.COI_INFLUENCES.sources.map(x => ({ source: x.name, id: x.id, features: x.features })) : (CA ? CA.borrowed : []);
  INF_SRC.forEach(b => b.features.forEach(f => f.articles.forEach(id => {
    if (!borrowedOf.has(id)) borrowedOf.set(id, []);
    borrowedOf.get(id).push({ source: b.source, f: f.f, id: b.id });
  })));
  const momentsOf = new Map();
  if (CA) CA.moments.forEach(m => m.articles.forEach(id => { if (!momentsOf.has(id)) momentsOf.set(id, []); momentsOf.get(id).push(m); }));

  function originsCard(id) {
    const d = DRAFT[id], b = borrowedOf.get(id) || [], ms = momentsOf.get(id) || [];
    if (!d && !b.length && !ms.length) return "";
    let html = `<div class="card origins-card"><h3>Origins</h3>`;
    if (d && d.draft && d.addedLater) {
      html += `<div class="og-draft">Not in the 1948 Draft; inserted during the debates as Draft Article <b>${esc(d.draft)}</b>.</div>`;
    } else if (d && d.draft) {
      html += `<div class="og-draft">Draft Article <b>${esc(d.draft)}</b> <span class="muted">· Draft Constitution, 1948</span></div>`;
      if (d.draftText) html += `<details class="og-text"><summary>Read the 1948 draft wording</summary><div class="og-draft-text">${d.draftText.split("\n").map(l => `<p>${esc(l)}</p>`).join("")}</div></details>`;
    } else if (d && d.partOf) {
      const host = Object.keys(DRAFT).find(k => DRAFT[k].draft === d.partOf && !DRAFT[k].addedLater);
      html += `<div class="og-draft">Part of Draft Article <b>${esc(d.partOf)}</b>${host ? ` (now <a href="#/article/${encodeURIComponent(host)}">Art. ${esc(host)}</a>)` : ""} in the 1948 Draft; later made a separate Article.</div>`;
    } else if (d && d.addedLater) {
      html += `<div class="og-draft">Not in the 1948 Draft; added during the Assembly's deliberations.</div>`;
    }
    if (d && d.debated && d.debated.length) {
      html += `<div class="og-dates"><span class="og-k">Debated</span> ${d.debated.map(x => `<a href="${debateUrl(x)}" target="_blank" rel="noopener noreferrer">${fmtIso(x)}</a>`).join(", ")}</div>`;
    } else if (d && d.notDebated) {
      html += `<div class="og-dates"><span class="og-k">Debated</span> <span class="muted">adopted without debate</span></div>`;
    }
    if (d && d.adopted) html += `<div class="og-dates"><span class="og-k">Adopted</span> ${fmtIso(d.adopted)}</div>`;
    if (b.length) html += `<div class="og-borrowed"><span class="og-k">Influences</span> ${b.map(x => x.id ? `<a class="tag" href="#/influences?src=${x.id}" title="${esc(x.f)}">${esc(x.source)}</a>` : `<span class="tag" title="${esc(x.f)}">${esc(x.source)}</span>`).join("")}<div class="small muted">${esc(b.map(x => x.f).join("; "))}</div></div>`;
    if (ms.length) html += `<div class="og-moments">${ms.map(m => `<a href="#/origins#m-${m.date}">${esc(m.title)}</a> <span class="small muted">· ${fmtIso(m.date)}</span>`).join("<br>")}</div>`;
    if (d && d.url) html += `<a class="small" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">Drafting history on constitutionofindia.net →</a>`;
    return html + `</div>`;
  }

  // ------------------------------------------------------------ world influences
  const INFL = window.COI_INFLUENCES || null;
  function viewInfluences(params) {
    if (!INFL) return notFound();
    const S = INFL.sources;
    const tagFor = id => id === "Preamble" ? `<a class="tag" href="#/preamble">Preamble</a>` : (byId.has(id) ? `<a class="tag" href="#/article/${encodeURIComponent(id)}">Art. ${esc(id)}</a>` : "");
    // radial diagram: India at the centre, sources around it, sized by how much was drawn from them
    const W = 680, H = 470, cx = W / 2, cy = H / 2, rx = 262, ry = 178;
    const pos = S.map((s, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / S.length; return { s, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), a }; });
    const rad = s => 15 + s.weight * 4;
    const diagram = `<svg viewBox="0 0 ${W} ${H}" class="inf-svg" role="group" aria-label="Sources that influenced the Constitution of India">
      ${pos.map(p => `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" class="inf-edge" data-src="${p.s.id}" stroke-width="${1 + p.s.weight * 1.3}"/>`).join("")}
      <circle cx="${cx}" cy="${cy}" r="56" class="inf-core"/>
      <text x="${cx}" y="${cy - 4}" class="inf-core-t">India</text><text x="${cx}" y="${cy + 15}" class="inf-core-s">Constitution, 1950</text>
      ${pos.map(p => {
        const below = Math.sin(p.a) > 0.2, ly = below ? p.y + rad(p.s) + 16 : p.y - rad(p.s) - 8;
        return `<g class="inf-node" data-src="${p.s.id}" tabindex="0" role="button" aria-label="${esc(p.s.name)}: ${p.s.features.length} features">
          <circle cx="${p.x}" cy="${p.y}" r="${rad(p.s)}"/>
          <text x="${p.x}" y="${p.y + 5}" class="inf-n">${p.s.features.length}</text>
          <text x="${p.x}" y="${ly}" class="inf-l">${esc(p.s.short)}</text></g>`;
      }).join("")}
    </svg>`;
    const detail = s => `<div class="inf-kicker">${esc(s.region)}</div><h2>${esc(s.name)}</h2><p>${esc(s.context)}</p>
      <table class="inf-table"><thead><tr><th>What India took</th><th>How India adapted it</th></tr></thead><tbody>
      ${s.features.map(f => `<tr><td><b>${esc(f.f)}</b><div class="inf-tags">${f.articles.map(tagFor).join("")}</div></td><td>${esc(f.how)}</td></tr>`).join("")}</tbody></table>`;
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>World influences</div>
      <h1>How the world shaped India's Constitution</h1>
      <p class="lede">${esc(INFL.intro)}</p>
      <div class="inf-chips" role="tablist" aria-label="Choose a source">${S.map(s => `<button role="tab" class="inf-chip" data-src="${s.id}">${esc(s.short)}</button>`).join("")}</div>
      <div class="inf-wrap">
        <div class="inf-diagram card">${diagram}<p class="small muted" style="margin:4px 0 0">Circle size and line thickness show roughly how much was drawn from each source; the number is how many features this guide lists. Click a source to read more.</p></div>
        <div class="inf-detail card" id="infDetail" aria-live="polite"></div>
      </div>

      <h2 class="og-h">Choices between systems</h2>
      <div class="inf-choices">${INFL.choices.map(c => `<div class="card inf-choice"><h3>${esc(c.title)}</h3>
        <div class="inf-vs"><span class="inf-yes">✓ ${esc(c.chose)}</span><span class="inf-no">✕ ${esc(c.over)}</span></div>
        <p>${esc(c.text)}</p><a class="small" href="${c.link}">${esc(c.linkText)} →</a></div>`).join("")}</div>

      <h2 class="og-h">Home-grown roots</h2>
      <p class="small muted" style="max-width:75ch">Much of the Constitution grew out of India's own freedom movement and social struggles.</p>
      <ol class="og-timeline">${INFL.roots.map(r => `<li><time>${esc(r.year)}</time><div><b>${r.link ? `<a href="${r.link}">${esc(r.title)}</a>` : esc(r.title)}</b><p>${esc(r.text)}</p></div></li>`).join("")}</ol>

      <h2 class="og-h">What India chose not to borrow</h2>
      <div class="inf-not">${INFL.notTaken.map(n => `<div><b>✕ ${esc(n.f)}</b><span>${esc(n.why)}</span></div>`).join("")}</div>
      <p class="small muted" style="margin-top:16px;max-width:75ch">${esc(INFL.note)} See also <a href="#/origins">how the Constituent Assembly made the Constitution</a>.</p>`, "influences");

    const det = $("#infDetail");
    function select(id, push) {
      const s = S.find(x => x.id === id) || S[0];
      det.innerHTML = detail(s);
      view.querySelectorAll("[data-src]").forEach(el => el.classList.toggle("on", el.dataset.src === s.id));
      view.querySelectorAll(".inf-chip").forEach(el => el.setAttribute("aria-selected", el.dataset.src === s.id));
      if (push) {
        history.replaceState(null, "", "#/influences?src=" + s.id);
        if (window.innerWidth < 900) det.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    view.querySelectorAll(".inf-node, .inf-chip").forEach(el => {
      el.addEventListener("click", () => select(el.dataset.src, true));
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(el.dataset.src, true); } });
    });
    view.querySelectorAll(".inf-node").forEach(el => {
      el.addEventListener("mouseenter", () => view.querySelectorAll(`.inf-edge[data-src="${el.dataset.src}"]`).forEach(x => x.classList.add("hover")));
      el.addEventListener("mouseleave", () => view.querySelectorAll(".inf-edge.hover").forEach(x => x.classList.remove("hover")));
    });
    select(params && params.get("src") || S[0].id, false);
  }

  function viewOrigins() {
    if (!CA) return notFound();
    const withDraft = Object.values(DRAFT).filter(d => d.draft).length;
    const debatedDays = new Set(Object.values(DRAFT).flatMap(d => d.debated || [])).size;
    const idLink = id => id === "Preamble" ? `<a class="tag" href="#/preamble">Preamble</a>` : (byId.has(id) ? `<a class="tag" href="#/article/${encodeURIComponent(id)}">Art. ${esc(id)}</a>` : "");
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Origins</div>
      <h1>How the Constitution was made</h1>
      <p class="lede">Between December 1946 and January 1950 the Constituent Assembly debated, amended and adopted the Constitution. Here is how it unfolded, the debates that shaped key Articles, and where its ideas came from. Every Article page also shows its counterpart in the 1948 Draft and the days the Assembly debated it.</p>
      <div class="tm-stat-grid og-stats">${CA.stats.map(s => `<div class="stat"><b>${esc(s.n)}</b><span>${esc(s.l)}</span></div>`).join("")}</div>
      ${withDraft ? `<p class="small muted">The app links ${withDraft} Articles to their 1948 Draft counterparts, debated across ${debatedDays} sitting days.</p>` : ""}

      <div class="og-find">
        <label for="ogq" class="hr-k">Find an Article's drafting history</label>
        <div class="hr-row"><input id="ogq" type="search" placeholder="Article number, e.g. 21, 32, 368" inputmode="search"><button id="ogGo">Go</button></div>
      </div>

      <h2 class="og-h">Timeline</h2>
      <ol class="og-timeline">${CA.timeline.map(t => `<li><time datetime="${t.date}">${fmtIso(t.date)}</time><div><b>${esc(t.title)}</b><p>${esc(t.text)}</p></div></li>`).join("")}</ol>

      <h2 class="og-h">Debates that shaped the text</h2>
      <div class="og-moments-list">${CA.moments.map(m => `<article class="og-moment" id="m-${m.date}">
        <div class="og-m-date"><a href="${debateUrl(m.date)}" target="_blank" rel="noopener noreferrer">${fmtIso(m.date)}</a></div>
        <h3>${esc(m.title)}</h3><p>${esc(m.text)}</p>
        ${m.quote ? `<blockquote>“${esc(m.quote)}”<cite>— ${esc(m.speaker)}</cite></blockquote>` : ""}
        <div>${m.articles.map(idLink).join("")}</div></article>`).join("")}</div>

      <h2 class="og-h">The people</h2>
      ${dirGroup("", CA.people.map(p => dirRow({ href: "#/origins", icon: "✦", color: "var(--navy)", title: esc(p.name), sub: esc(p.role) })))}
      <div class="card" style="margin-top:12px"><h3>The Drafting Committee</h3><ul class="plain-list">${CA.draftingCommittee.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>

      <h2 class="og-h">Where the ideas came from</h2>
      ${dirGroup("", [dirRow({ href: "#/influences", icon: "◎", color: "var(--accent)", title: "How the world shaped India's Constitution", sub: "What was drawn from Britain, the US, Ireland, Canada, the 1935 Act and others, how each idea was adapted, and what India chose not to borrow" })])}
      <p class="small muted" style="margin-top:16px">Debate dates and 1948 Draft text are drawn from <a href="https://www.constitutionofindia.net" target="_blank" rel="noopener noreferrer">constitutionofindia.net</a> (Centre for Law and Policy Research); quotations are from the official Constituent Assembly Debates.</p>`, "origins");
    const go = () => { const v = $("#ogq").value.trim().replace(/^art(icle)?\.?\s*/i, "").toUpperCase(); if (byId.has(v)) location.hash = "#/article/" + encodeURIComponent(v); };
    $("#ogGo").addEventListener("click", go);
    $("#ogq").addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    const h = location.hash.split("#")[2];
    if (h) { const el = document.getElementById(h); if (el) setTimeout(() => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (document.getElementById("topbar").offsetHeight + 12), behavior: "smooth" }), 50); }
  }

  function viewArticle(id, params) {
    const a = byId.get(id);
    if (!a) return notFound();
    const ex = explain(a.id);
    const prev = ARTS[a.idx - 1], next = ARTS[a.idx + 1];
    const themes = themesOf.get(a.id) || [];
    const outRefs = XREFS[a.id] || [], inRefs = xrefIn.get(a.id) || [];
    const hist = amendsOf.get(a.id) ? [...amendsOf.get(a.id)] : [];
    const cases = casesOf.get(a.id) || [];
    const related = new Set();
    themes.forEach(t => t.articles.forEach(x => { if (x !== a.id) related.add(x); }));
    const relList = [...related].filter(x => !outRefs.includes(x) && !inRefs.includes(x)).slice(0, 12);
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/part/${a.part.id}">Part ${a.part.id}</a>${a.chapter ? `<span class="sep">/</span>${esc(a.chapter.title)}` : ""}${a.sub ? `<span class="sep">/</span>${esc(a.sub)}` : ""}</div>
      <div class="article-head">
        <div class="article-num"><div><small>Article</small><b>${esc(a.id)}</b></div></div>
        <div><h1 style="margin-bottom:4px">${esc(a.title)}</h1>
          <div>${a.omitted ? '<span class="tag warn">Omitted</span>' : ""}${themes.map(t => `<a class="tag" href="#/theme/${t.id}"><span class="swatch" style="background:${t.color}"></span>${esc(t.name)}</a>`).join("")}</div></div>
      </div>
      <div class="article-layout">
        <div>
          ${ex ? plainCard("art:" + a.id, [{ cls: "s", t: ex.s }, { t: ex.e }])
               : `<div class="notice">Plain-language explanation not yet written for this article.</div>`}
          ${((window.COI_UPDATES || {})[a.id] || []).map(u => `<div class="update-note"><b>Update since this text edition (${esc(u.date)}):</b> ${esc(u.text)} ${(u.sources || []).filter(x => /^https?:/.test(x)).map(x => `<a href="${esc(x)}" target="_blank" rel="noopener noreferrer">Source</a>`).join(" ")}</div>`).join("")}
          ${VIS ? VIS.forArticle(a.id).map(v => VIS.card(v, false)).join("") : ""}
          <div class="verbatim" id="verbatim"><div class="label"><span id="vlabel">Verbatim text <span class="muted" style="font-weight:500;text-transform:none;letter-spacing:0">· as on 1 May 2024</span></span><span class="label-actions">${tmAvailable(a) ? `<button class="tmbtn" id="tmToggle" title="See how this article read on an earlier date">⏱ Time machine</button>` : ""}${readToolbar()}</span></div><div id="tmbar"></div><div id="vbody">${renderVerbatim(a.text, a.fn, a.omitted, a.notes)}</div></div>
          <div class="partpos small muted">Article ${a.part.articles.indexOf(a) + 1} of ${a.part.articles.length} in Part ${a.part.id} <span class="bar"><span style="width:${((a.part.articles.indexOf(a) + 1) / a.part.articles.length * 100).toFixed(1)}%"></span></span> <span class="kbd-hint">Use <kbd>←</kbd> <kbd>→</kbd> to move between articles</span></div>
          <div class="prevnext">
            ${prev ? `<a href="#/article/${encodeURIComponent(prev.id)}">← Art. ${esc(prev.id)} · ${esc(prev.title)}</a>` : "<span></span>"}
            ${next ? `<a class="next" href="#/article/${encodeURIComponent(next.id)}">Art. ${esc(next.id)} · ${esc(next.title)} →</a>` : "<span></span>"}
          </div>
        </div>
        <aside class="side">
          ${historyCard(a.id, hist, tmAvailable(a) ? a : null)}
          ${originsCard(a.id)}
          ${casesCard(cases)}
          ${(outRefs.length || inRefs.length) ? `<div class="card"><h3>Cross-references</h3>
            ${outRefs.length ? `<div class="small muted">This article refers to</div><div>${outRefs.map(x => `<a class="tag" href="#/article/${encodeURIComponent(x)}">${esc(x)}</a>`).join("")}</div>` : ""}
            ${inRefs.length ? `<div class="small muted" style="margin-top:8px">Referred to by</div><div>${inRefs.map(x => `<a class="tag" href="#/article/${encodeURIComponent(x)}">${esc(x)}</a>`).join("")}</div>` : ""}
          </div>` : ""}
          ${relList.length ? `<div class="card"><h3>Related by theme</h3><div>${relList.map(x => `<a class="tag" href="#/article/${encodeURIComponent(x)}" title="${esc(byId.get(x) ? byId.get(x).title : "")}">${esc(x)}</a>`).join("")}</div></div>` : ""}
          ${(rightsOfArticle.get(a.id) || []).length ? `<div class="card"><h3>Know your rights</h3><ul>${rightsOfArticle.get(a.id).slice(0, 5).map(r => `<li><a href="#/rights/${r.id}">${esc(r.q)}</a></li>`).join("")}</ul></div>` : ""}
          <div class="card"><h3>See it in the graph</h3><a class="btn btn-graph" href="#/graph?focus=${encodeURIComponent(a.id)}">${GRAPH_SVG} Explore Art. ${esc(a.id)} in the graph</a></div>
        </aside>
      </div>`, "parts");
    bindFootnotes(view);
    bindReadbar(view);
    view.dataset.prev = prev ? prev.id : ""; view.dataset.next = next ? next.id : "";
    mountArticleTimeMachine(a, params || new URLSearchParams());
  }

  const THEME_GROUPS = [
    ["Rights and freedoms", ["rights", "life-liberty", "free-speech", "religion", "property"]],
    ["Equality and social justice", ["equality", "reservation", "tribal-areas", "language", "dpsp"]],
    ["Institutions of government", ["executive", "legislature", "judiciary", "services", "elections", "anti-defection"]],
    ["Federalism, money and local government", ["federalism", "finance-tax", "local-government", "special-states"]],
    ["The Constitution's architecture", ["amendment-process", "emergency", "citizenship"]]
  ];
  function viewThemes() {
    const grouped = new Set(THEME_GROUPS.flatMap(g => g[1]));
    const groups = THEME_GROUPS.concat([["Other", THEMES.filter(t => !grouped.has(t.id)).map(t => t.id)]]).filter(g => g[1].length);
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Themes</div>
      <h1>Themes</h1>
      <p class="lede">Cross-cutting themes that gather Articles from different Parts. An Article can belong to several themes.</p>
      ${groups.map(([g, ids]) => dirGroup(g, ids.map(id => themeById.get(id)).filter(Boolean).map(t => {
        const nc = CASES.filter(c => (c.themes || []).includes(t.id)).length;
        return dirRow({ href: `#/theme/${t.id}`, icon: "", color: t.color, title: esc(t.name), sub: esc(t.about), meta: `${t.articles.length} Arts${nc ? ` · ${nc} cases` : ""}` });
      }))).join("")}`, "themes");
  }

  function viewTheme(id) {
    const t = themeById.get(id);
    if (!t) return notFound();
    const arts = t.articles.map(x => byId.get(x)).filter(Boolean).sort((a, b) => a.idx - b.idx);
    const cs = CASES.filter(c => (c.themes || []).includes(t.id));
    const am = AMENDS.filter(x => (x.themes || []).includes(t.id));
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/themes">Themes</a><span class="sep">/</span>${esc(t.name)}</div>
      <h1><span class="swatch" style="background:${t.color};width:16px;height:16px"></span> ${esc(t.name)}</h1>
      <p class="lede">${esc(t.about)}</p>
      <p><a href="#/graph?theme=${t.id}">View this theme in the article graph →</a></p>
      <div class="section-title"><h2>Articles</h2><span class="muted small">${arts.length}</span></div>
      <div class="list">${arts.map(artRow).join("")}</div>
      ${cs.length ? `<div class="section-title"><h2>Landmark judgments</h2><span class="muted small">${cs.length}</span></div><div class="list">${cs.map(caseCard).join("")}</div>` : ""}
      ${am.length ? `<div class="section-title"><h2>Amendments</h2><span class="muted small">${am.length}</span></div><div class="list">${am.map(amendCard).join("")}</div>` : ""}
    `, "themes");
  }

  function viewSchedules() {
    const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Schedules</div>
      <h1>The Schedules</h1>
      <p class="lede">Detailed lists and tables that the Articles refer to — from the list of States to the subjects on which Parliament and the States can make laws.</p>
      ${dirGroup("", T.schedules.map((sc, i) => dirRow({
        href: `#/schedule/${sc.id}`, icon: `<b>${ROMAN[i] || i + 1}</b>`, color: "var(--navy)",
        title: `${esc(sc.id)} Schedule — ${esc((SCHMETA[sc.id] || {}).title || "")}`, sub: esc((SCHMETA[sc.id] || {}).about || "") })))}`, "schedules");
  }

  function viewSchedule(id) {
    const s = T.schedules.find(x => x.id === id);
    if (!s) return notFound();
    const meta = SCHMETA[id] || {};
    const hist = amendsOf.get("Sch-" + id) ? [...amendsOf.get("Sch-" + id)] : [];
    // light formatting: break before numbered entries & PART/List headings
    const txt = s.text; // already line-normalised at build time (scripts/layout.js)
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/schedules">Schedules</a><span class="sep">/</span>${esc(id)} Schedule</div>
      <h1>${esc(id)} Schedule — ${esc(meta.title || "")}</h1>
      <div class="article-layout">
        <div>
          ${plainCard("sch:" + id, [{ t: meta.about || "" }])}
          ${id === "First" ? `<div class="notice">In the official edition this Schedule is a two-column table (Name | Territories). Text extracted from the PDF keeps every word in order, but some State names and their territory descriptions appear on separate lines rather than side by side.</div>` : ""}
          <div class="verbatim"><div class="label">Verbatim text</div>${renderVerbatim(txt, s.fn, false, s.notes)}</div>
        </div>
        <aside class="side">${historyCard("Sch-" + id, hist)}</aside>
      </div>`, "schedules");
    bindFootnotes(view);
  }

  // ----- amendments
  function amendCard(a) {
    return `<a class="amend-card" href="#/amendment/${a.n}">
      <div class="an">${a.n}<small>${a.year}</small></div>
      <div><div class="at">${esc(a.title)} ${a.major ? '<span class="tag major">major</span>' : ""}${a.struck ? '<span class="tag warn">struck down</span>' : ""}</div>
      <div class="as">${esc(a.summary)}</div></div></a>`;
  }

  const amendState = { major: false, theme: "", q: "" };
  function viewAmendments() {
    if (!AMENDS.length) return render(`<h1>Amendments</h1><div class="empty">Amendment data is still being prepared.</div>`, "amendments");
    const years = {}; AMENDS.forEach(a => { years[a.year] = (years[a.year] || 0) + 1; });
    const y0 = 1950, y1 = Math.max(2024, ...AMENDS.map(a => a.year));
    const maxY = Math.max(...Object.values(years));
    const bars = []; for (let y = y0; y <= y1; y++) bars.push(`<div class="${years[y] ? "" : "zero"}" style="height:${years[y] ? (years[y] / maxY * 100) : 3}%" title="${y}: ${years[y] || 0} amendment(s)"></div>`);
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Amendments</div>
      <h1>Amendment history</h1>
      <p class="muted" style="max-width:75ch">The Constitution has been amended ${AMENDS.length} times since 1951 under Article 368. Each amendment below links to the provisions it changed; on every Article page, the <em>Version history</em> panel and the official footnotes show what was inserted, substituted or omitted.</p>
      <div class="yearbar" aria-label="Amendments per year">${bars.join("")}</div>
      <div class="yearaxis"><span>1950</span><span>1975</span><span>2000</span><span>${y1}</span></div>
      <div class="toolbar">
        <input type="search" id="aq" placeholder="Filter amendments…" value="${esc(amendState.q)}">
        <select id="atheme"><option value="">All themes</option>${THEMES.map(t => `<option value="${t.id}" ${amendState.theme === t.id ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select>
        <button class="chip ${amendState.major ? "on" : ""}" id="amajor">Major only</button>
      </div>
      <div id="alist"></div>
      ${PENDING.length ? `<div class="section-title"><h2>Pending amendment bills</h2></div><div class="list">${PENDING.map(p => `<div class="amend-card"><div class="an" style="font-size:16px">Bill<small>${esc(p.year || "")}</small></div><div><div class="at">${esc(p.act || p.title)}</div><div class="as">${esc(p.summary || "")}</div><div class="small muted">${esc(p.status || "")}</div></div></div>`).join("")}</div>` : ""}
    `, "amendments");
    const draw = () => {
      const q = amendState.q.toLowerCase();
      const list = AMENDS.filter(a => (!amendState.major || a.major) && (!amendState.theme || (a.themes || []).includes(amendState.theme)) &&
        (!q || (a.title + " " + a.summary + " " + a.why + " " + a.act + " " + a.n).toLowerCase().includes(q)));
      const byDec = {};
      list.forEach(a => { const d = Math.floor(a.year / 10) * 10; (byDec[d] = byDec[d] || []).push(a); });
      $("#alist").innerHTML = Object.keys(byDec).sort().map(d => `<div class="decade">${d}s</div><div class="list">${byDec[d].map(amendCard).join("")}</div>`).join("") || `<div class="empty">No amendments match.</div>`;
    };
    $("#aq").addEventListener("input", e => { amendState.q = e.target.value; draw(); });
    $("#atheme").addEventListener("change", e => { amendState.theme = e.target.value; draw(); });
    $("#amajor").addEventListener("click", e => { amendState.major = !amendState.major; e.target.classList.toggle("on", amendState.major); draw(); });
    draw();
  }

  function viewAmendment(n) {
    n = +n;
    const a = amendByN.get(n);
    const touched = new Set([...(a && a.articles || []), ...((AIDX.byAmendment[n]) || [])]);
    const touchedSorted = [...touched].sort((x, y) => {
      const ix = byId.has(x) ? byId.get(x).idx : (x === "Preamble" ? -1 : 9999), iy = byId.has(y) ? byId.get(y).idx : (y === "Preamble" ? -1 : 9999);
      return ix - iy || x.localeCompare(y);
    });
    // official footnotes that cite this amendment
    const notes = [];
    const scan = (owner, fn) => Object.entries(fn || {}).forEach(([k, t]) => { if (fnAmend[k] === n) notes.push([owner, t]); });
    scan("Preamble", T.preamble.fn); ARTS.forEach(x => scan(x.id, x.fn)); T.schedules.forEach(s => scan("Sch-" + s.id, s.fn));
    const cs = (a && a.cases || []).map(id => caseById.get(id)).filter(Boolean);
    CASES.forEach(c => { if ((c.amendments || []).includes(n) && !cs.includes(c)) cs.push(c); });
    const prev = amendByN.get(n - 1), next = amendByN.get(n + 1);
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/amendments">Amendments</a><span class="sep">/</span>${ordinal(n)}</div>
      <h1>${esc(a ? a.act : amendName(n))}</h1>
      ${a ? `<p class="lede" style="font-size:18px"><b>${esc(a.title)}</b> ${a.major ? '<span class="tag major">major</span>' : ""}</p>` : ""}
      <div class="article-layout">
        <div class="prose">
          ${a ? `<dl class="kv card" style="box-shadow:none">
            <dt>Year</dt><dd>${a.year}</dd>
            ${a.date ? `<dt>In force / assent</dt><dd>${esc(a.date)}</dd>` : ""}
            ${a.pm ? `<dt>Prime Minister</dt><dd>${esc(a.pm)}</dd>` : ""}
            ${(a.themes || []).length ? `<dt>Themes</dt><dd>${a.themes.filter(t => themeById.has(t)).map(t => `<a class="tag" href="#/theme/${t}">${esc(themeById.get(t).name)}</a>`).join("")}</dd>` : ""}
          </dl>
          <h2>What changed</h2><p>${esc(a.summary)}</p>
          ${a.why ? `<h2>Why</h2><p>${esc(a.why)}</p>` : ""}` : `<p class="muted">Curated summary not available.</p>`}
          <h2>Provisions affected</h2>
          <div>${touchedSorted.map(id => `<span class="tag">${refLink(id)}</span>`).join("") || '<span class="muted">—</span>'}</div>
          ${notes.length ? `<h2>Official footnotes citing this amendment</h2>
          <div class="card" style="box-shadow:none"><ul style="margin:0;padding-left:1.2em;font-size:14px">${notes.map(([o, t]) => `<li>${refLink(o)}: ${esc(t)}</li>`).join("")}</ul></div>` : ""}
          <div class="prevnext">
            ${prev ? `<a href="#/amendment/${n - 1}">← ${ordinal(n - 1)}: ${esc(prev.title)}</a>` : "<span></span>"}
            ${next ? `<a class="next" href="#/amendment/${n + 1}">${ordinal(n + 1)}: ${esc(next.title)} →</a>` : "<span></span>"}
          </div>
        </div>
        <aside class="side">${sourcesCard(a)}${casesCard(cs)}</aside>
      </div>`, "amendments");
  }

  // ----- cases
  function caseCard(c) {
    return `<a class="case-card" href="#/case/${c.id}"><span class="cy">${c.year}</span><span class="cn">${esc(c.name)}</span>
      <div class="cs">${esc(c.held ? c.held.split(/(?<=\.)\s/)[0] : "")}</div>
      <div>${(c.articles || []).slice(0, 6).map(x => `<span class="tag">${x === "Preamble" ? "Preamble" : "Art. " + esc(x)}</span>`).join("")}${c.status && !/^good law/i.test(c.status) ? `<span class="tag warn">${esc(c.status)}</span>` : ""}</div></a>`;
  }
  const caseState = { theme: "", q: "", decade: "" };
  function viewCases() {
    if (!CASES.length) return render(`<h1>Landmark judgments</h1><div class="empty">Judgment data is still being prepared.</div>`, "cases");
    const decs = [...new Set(CASES.map(c => Math.floor(c.year / 10) * 10))].sort();
    const usedThemes = new Set(CASES.flatMap(c => c.themes || []));
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>Judgments</div>
      <h1>Landmark judgments</h1>
      <p class="muted" style="max-width:75ch">Decisions of the Supreme Court (and a few High Courts) that defined or redefined what the Constitution means. Each links to the Articles it interpreted.</p>
      <div class="toolbar">
        <input type="search" id="cq" placeholder="Filter judgments…" value="${esc(caseState.q)}">
        <select id="ctheme"><option value="">All themes</option>${[...usedThemes].sort().map(t => `<option value="${t}" ${caseState.theme === t ? "selected" : ""}>${esc(themeById.has(t) ? themeById.get(t).name : t)}</option>`).join("")}</select>
        <select id="cdec"><option value="">All decades</option>${decs.map(d => `<option value="${d}" ${String(caseState.decade) === String(d) ? "selected" : ""}>${d}s</option>`).join("")}</select>
      </div>
      <div class="list" id="clist"></div>`, "cases");
    const draw = () => {
      const q = caseState.q.toLowerCase();
      const list = CASES.filter(c => (!caseState.theme || (c.themes || []).includes(caseState.theme)) && (!caseState.decade || Math.floor(c.year / 10) * 10 === +caseState.decade) &&
        (!q || [c.name, c.short, c.question, c.held, c.impact, (c.articles || []).join(" ")].join(" ").toLowerCase().includes(q)));
      $("#clist").innerHTML = list.map(caseCard).join("") || `<div class="empty">No judgments match.</div>`;
    };
    $("#cq").addEventListener("input", e => { caseState.q = e.target.value; draw(); });
    $("#ctheme").addEventListener("change", e => { caseState.theme = e.target.value; draw(); });
    $("#cdec").addEventListener("change", e => { caseState.decade = e.target.value; draw(); });
    draw();
  }

  function viewCase(id) {
    const c = caseById.get(id);
    if (!c) return notFound();
    const i = CASES.indexOf(c);
    render(`
      <div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/cases">Judgments</a><span class="sep">/</span>${esc(c.short || c.name)}</div>
      <h1>${esc(c.name)}</h1>
      <div class="article-layout">
        <div class="prose">
          ${c.verify ? `<div class="notice">Details of this entry are flagged for editorial verification.</div>` : ""}
          <dl class="kv card" style="box-shadow:none">
            <dt>Year</dt><dd>${c.year}${c.date ? " · " + esc(c.date) : ""}</dd>
            ${c.citation ? `<dt>Citation</dt><dd>${esc(c.citation)}</dd>` : ""}
            ${c.bench ? `<dt>Bench</dt><dd>${c.bench} judges</dd>` : ""}
            <dt>Status</dt><dd>${esc(c.status || "")}</dd>
            <dt>Articles</dt><dd>${(c.articles || []).map(x => `<span class="tag">${refLink(x)}</span>`).join("")}</dd>
            ${(c.themes || []).length ? `<dt>Themes</dt><dd>${c.themes.map(t => themeById.has(t) ? `<a class="tag" href="#/theme/${t}">${esc(themeById.get(t).name)}</a>` : `<span class="tag">${esc(t)}</span>`).join("")}</dd>` : ""}
          </dl>
          <h2>The question</h2><p>${esc(c.question)}</p>
          <h2>What the Court held</h2><p>${esc(c.held)}</p>
          <h2>Why it matters</h2><p>${esc(c.impact)}</p>
          <div class="prevnext">
            ${i > 0 ? `<a href="#/case/${CASES[i - 1].id}">← ${esc(CASES[i - 1].short || CASES[i - 1].name)} (${CASES[i - 1].year})</a>` : "<span></span>"}
            ${i < CASES.length - 1 ? `<a class="next" href="#/case/${CASES[i + 1].id}">${esc(CASES[i + 1].short || CASES[i + 1].name)} (${CASES[i + 1].year}) →</a>` : "<span></span>"}
          </div>
        </div>
        <aside class="side">
          ${(c.related || []).length ? `<div class="card"><h3>Related judgments</h3><ul>${c.related.map(r => caseById.get(r)).filter(Boolean).map(r => `<li><a href="#/case/${r.id}">${esc(r.short || r.name)}</a> <span class="small muted">(${r.year})</span></li>`).join("")}</ul></div>` : ""}
          ${(c.amendments || []).length ? `<div class="card"><h3>Related amendments</h3><ul>${c.amendments.map(n => `<li><a href="#/amendment/${n}">${ordinal(n)} Amendment</a>${amendByN.get(n) ? ` <span class="small muted">— ${esc(amendByN.get(n).title)}</span>` : ""}</li>`).join("")}</ul></div>` : ""}
          ${sourcesCard(c)}
          <div class="card"><h3>In the graph</h3><a href="#/graph?case=${c.id}">Show this case's articles in the graph →</a></div>
        </aside>
      </div>`, "cases");
  }

  function sourcesCard(o) {
    const urls = (o && o.sources || []).filter(u => /^https?:\/\//i.test(u));
    if (!urls.length && !(o && o.checked)) return "";
    const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } };
    return `<div class="card"><h3>Sources</h3>${o.checked ? `<div class="checked-badge">✓ Fact-checked ${esc(o.checked)}</div>` : ""}
      ${urls.length ? `<ul>${urls.map(u => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(host(u))}</a></li>`).join("")}</ul>` : ""}</div>`;
  }

  function notFound() {
    render(`<div class="empty"><h1>Not found</h1><p>That page doesn't exist. <a href="#/">Go home</a>.</p></div>`, "");
  }

  // ---------------------------------------------------------------- search
  const SEARCH = [];
  SEARCH.push({ type: "Preamble", title: "Preamble", sub: "We, the people of India…", href: "#/preamble", text: (T.preamble.text + " " + (explain("Preamble") || {}).e).toLowerCase() });
  ARTS.forEach(a => {
    const ex = explain(a.id);
    SEARCH.push({ type: "Article " + a.id, id: a.id, title: a.title, sub: ex ? ex.s : "", href: "#/article/" + encodeURIComponent(a.id),
      ttl: a.title.toLowerCase(), text: (a.text + " " + (ex ? ex.s + " " + ex.e : "")).toLowerCase(), omitted: a.omitted });
  });
  PARTS.forEach(p => SEARCH.push({ type: "Part " + p.id, title: p.title, sub: p.summary, href: "#/part/" + p.id, ttl: p.title.toLowerCase(), text: p.summary.toLowerCase() }));
  THEMES.forEach(t => SEARCH.push({ type: "Theme", title: t.name, sub: t.about, href: "#/theme/" + t.id, ttl: t.name.toLowerCase(), text: t.about.toLowerCase() }));
  AMENDS.forEach(a => SEARCH.push({ type: ordinal(a.n) + " Amendment · " + a.year, title: a.title, sub: a.summary, href: "#/amendment/" + a.n, ttl: a.title.toLowerCase(), text: (a.summary + " " + (a.why || "")).toLowerCase() }));
  CASES.forEach(c => SEARCH.push({ type: "Judgment · " + c.year, title: c.name, sub: c.held, href: "#/case/" + c.id, ttl: (c.name + " " + (c.short || "")).toLowerCase(), text: (c.question + " " + c.held + " " + c.impact).toLowerCase() }));
  (window.COI_RIGHTS || []).forEach(r => SEARCH.push({ type: "Know your rights", title: r.q, sub: r.short, href: "#/rights/" + r.id, ttl: (r.q + " " + r.tags.join(" ")).toLowerCase(), text: (r.short + " " + r.steps.join(" ")).toLowerCase() }));
  T.schedules.forEach(s => SEARCH.push({ type: "Schedule", title: s.id + " Schedule — " + ((SCHMETA[s.id] || {}).title || ""), sub: (SCHMETA[s.id] || {}).about, href: "#/schedule/" + s.id, ttl: (s.id + " schedule " + ((SCHMETA[s.id] || {}).title || "")).toLowerCase(), text: "" }));

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    const m = q.match(/^(?:art(?:icle)?\.?\s*)?(\d{1,3}[a-z]{0,2})$/i);
    const res = [];
    if (m) { const id = m[1].toUpperCase(); if (byId.has(id)) res.push(Object.assign({ score: 1000 }, SEARCH.find(s => s.id === id))); }
    const am = q.match(/^(\d{1,3})(?:st|nd|rd|th)\s+amend/);
    if (am && amendByN.has(+am[1])) res.push(Object.assign({ score: 999 }, SEARCH.find(s => s.href === "#/amendment/" + am[1])));
    const words = q.split(/\s+/).filter(Boolean);
    SEARCH.forEach(s => {
      if (res.some(r => r.href === s.href)) return;
      let score = 0;
      const ttl = s.ttl || s.title.toLowerCase();
      if (ttl.includes(q)) score += 50;
      for (const w of words) {
        if (ttl.includes(w)) score += 10;
        else if (s.text.includes(w)) score += 2;
        else { score = 0; break; }
      }
      if (score && s.omitted) score -= 3;
      if (score > 0) res.push(Object.assign({ score }, s));
    });
    return res.sort((a, b) => b.score - a.score).slice(0, 25);
  }

  const qin = $("#q"), qres = $("#qresults");
  let qsel = -1;
  function drawSearch() {
    const r = search(qin.value);
    qsel = -1;
    if (!qin.value.trim()) { qres.hidden = true; return; }
    qres.hidden = false;
    qres.innerHTML = r.length ? r.map(s => `<a href="${s.href}"><span class="qt">${esc(s.type)}</span><br><b>${esc(s.title)}</b><span class="qs">${esc(s.sub || "")}</span></a>`).join("") : `<div class="empty small">No results</div>`;
  }
  qin.addEventListener("input", drawSearch);
  qin.addEventListener("focus", drawSearch);
  qin.addEventListener("keydown", e => {
    const items = [...qres.querySelectorAll("a")];
    if (e.key === "ArrowDown") { qsel = Math.min(items.length - 1, qsel + 1); e.preventDefault(); }
    else if (e.key === "ArrowUp") { qsel = Math.max(0, qsel - 1); e.preventDefault(); }
    else if (e.key === "Enter") { const t = items[Math.max(0, qsel)]; if (t) { location.hash = t.getAttribute("href"); qres.hidden = true; qin.blur(); } return; }
    else if (e.key === "Escape") { qres.hidden = true; qin.blur(); return; }
    items.forEach((x, i) => x.classList.toggle("sel", i === qsel));
    if (items[qsel]) items[qsel].scrollIntoView({ block: "nearest" });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".searchbox")) qres.hidden = true; });
  qres.addEventListener("click", e => { if (e.target.closest("a")) { qres.hidden = true; qin.value = ""; } });
  document.addEventListener("keydown", e => {
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if (e.key === "/" && !typing) { e.preventDefault(); qin.focus(); }
    if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && /^#\/learn\/[^/]+\/./.test(location.hash)) {
      const h = e.key === "ArrowLeft" ? view.dataset.prevHref : e.key === "ArrowRight" ? view.dataset.nextHref : null;
      if (h) location.hash = h;
      return;
    }
    if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && /^#\/article\//.test(location.hash)) {
      const t = e.key === "ArrowLeft" ? view.dataset.prev : e.key === "ArrowRight" ? view.dataset.next : null;
      if (t) location.hash = "#/article/" + encodeURIComponent(t);
    }
  });

  // ------------------------------------------------------------ theme/menu
  const root = document.documentElement;
  const THEMES_UI = ["tricolour", "light", "dark"];
  function applyTheme(t) {
    root.dataset.theme = t;
    document.querySelectorAll(".theme-switch button").forEach(b => { const on = b.dataset.t === t; b.classList.toggle("on", on); b.setAttribute("aria-checked", on ? "true" : "false"); });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim() || "#ffffff");
    window.dispatchEvent(new Event("coi-theme"));
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("coi-theme"); } catch (e) { /* ignore */ }
  applyTheme(THEMES_UI.includes(savedTheme) ? savedTheme : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "tricolour"));
  document.querySelectorAll(".theme-switch button").forEach(b => b.addEventListener("click", () => {
    applyTheme(b.dataset.t);
    try { localStorage.setItem("coi-theme", b.dataset.t); } catch (e) { /* ignore */ }
  }));
  // phones: search opens as a full-width row under the header
  $("#searchBtn").addEventListener("click", () => {
    const tb = document.getElementById("topbar");
    tb.classList.toggle("search-open");
    if (tb.classList.contains("search-open")) setTimeout(() => qin.focus(), 30); else { qres.hidden = true; }
  });

  // ---------------------------------------------------------------- router
  function route() {
    const h = decodeURIComponent(location.hash.slice(1) || "/").split("#")[0];
    const [path, qs] = h.split("?");
    const params = new URLSearchParams(qs || "");
    const seg = path.split("/").filter(Boolean);
    if (window.COI_GRAPH && window.COI_GRAPH.stop) window.COI_GRAPH.stop();
    switch (seg[0]) {
      case undefined: return viewHome();
      case "preamble": return viewPreamble();
      case "parts": return viewParts();
      case "part": return viewPart(seg[1]);
      case "article": return viewArticle(seg[1], params);
      case "themes": return viewThemes();
      case "theme": return viewTheme(seg[1]);
      case "schedules": return viewSchedules();
      case "schedule": return viewSchedule(seg[1]);
      case "amendments": return viewAmendments();
      case "amendment": return viewAmendment(seg[1]);
      case "cases": return viewCases();
      case "case": return viewCase(seg[1]);
      case "timemachine": return viewTimeMachinePage(params);
      case "learn": return seg[1] ? viewJourneyStep(seg[1], seg[2]) : viewLearn();
      case "rights": return seg[1] ? viewRight(seg[1]) : viewRights(params);
      case "origins": return viewOrigins();
      case "influences": return viewInfluences(params);
      case "visuals": return viewVisuals();
      case "visual": return viewVisual(seg[1]);
      case "graph":
        render(`<div id="graphRoot"></div>`, "graph");
        return window.COI_GRAPH ? window.COI_GRAPH.mount($("#graphRoot"), params) : null;
      default: return notFound();
    }
  }

  // expose shared model for graph.js
  window.COI_MODEL = { ARTS, byId, PARTS, THEMES, themesOf, CASES, caseById, XREFS, EXPLAIN, AMENDS, amendsOf, esc };
  window.addEventListener("hashchange", route);
  window.addEventListener("DOMContentLoaded", route);
  if (document.readyState !== "loading") setTimeout(route, 0);
})();
