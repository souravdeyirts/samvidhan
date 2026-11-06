/* Personal marks on plain-language cards: select text, then highlight it (four colours), make it bold, or erase.
   Marks are kept per card in this browser (localStorage), stored as character ranges of the card's own text,
   so they survive reloads and are dropped automatically if that text is ever rewritten. */
(function () {
  "use strict";
  const PFX = "coi-notes:";
  const COLORS = [["y", "Yellow"], ["g", "Green"], ["p", "Pink"], ["c", "Blue"]];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const load = key => { try { return JSON.parse(localStorage.getItem(PFX + key)) || {}; } catch (e) { return {}; } };
  const store = (key, d) => { try { Object.keys(d).length ? localStorage.setItem(PFX + key, JSON.stringify(d)) : localStorage.removeItem(PFX + key); } catch (e) { /* storage unavailable: marks last for this visit */ } };

  // runs <-> per-character arrays
  const toRuns = arr => { const out = []; let i = 0; while (i < arr.length) { if (!arr[i]) { i++; continue; } let j = i; while (j < arr.length && arr[j] === arr[i]) j++; out.push([i, j, arr[i]]); i = j; } return out; };
  const fromRuns = (runs, n) => { const a = new Array(n).fill(0); (runs || []).forEach(([s, e, v]) => { for (let i = Math.max(0, s); i < Math.min(n, e); i++) a[i] = v; }); return a; };

  function blocksOf(card) { return [...card.querySelectorAll(".nb")]; }
  function stateOf(card) {
    if (card._nk) return card._nk;
    const saved = load(card.dataset.nk);
    const blocks = blocksOf(card).map((el, i) => {
      if (el._t == null) el._t = el.textContent;
      const n = el._t.length, sv = saved[i];
      const ok = sv && sv.n === n;   // text changed since the marks were made: drop them
      return { el, n, hl: fromRuns(ok ? sv.h : null, n), bd: fromRuns(ok ? sv.b : null, n) };
    });
    return (card._nk = { key: card.dataset.nk, blocks });
  }
  function persist(st) {
    const d = {};
    st.blocks.forEach((b, i) => {
      const h = toRuns(b.hl), bb = toRuns(b.bd);
      if (h.length || bb.length) d[i] = { n: b.n, h, b: bb };
    });
    store(st.key, d);
  }
  function paint(st) {
    st.blocks.forEach(b => {
      const t = b.el._t;
      let html = "", i = 0;
      while (i < b.n) {
        let j = i + 1;
        while (j < b.n && b.hl[j] === b.hl[i] && b.bd[j] === b.bd[i]) j++;
        const seg = esc(t.slice(i, j));
        const cls = (b.hl[i] ? " hl-" + b.hl[i] : "") + (b.bd[i] ? " ub" : "");
        html += cls ? `<span class="um${cls}">${seg}</span>` : seg;
        i = j;
      }
      b.el.innerHTML = html;
    });
    const card = st.blocks.length && st.blocks[0].el.closest(".plain");
    const any = st.blocks.some(b => b.hl.some(Boolean) || b.bd.some(Boolean));
    if (card) { const c = card.querySelector(".nk-clear"); if (c) c.hidden = !any; const h = card.querySelector(".nk-hint"); if (h) h.hidden = any; }
  }

  // ------------------------------------------------------------ toolbar
  let bar = null, pending = null, t = null;
  function ensureBar() {
    if (bar) return bar;
    bar = document.createElement("div");
    bar.className = "nk-bar"; bar.setAttribute("role", "toolbar"); bar.setAttribute("aria-label", "Mark the selected text"); bar.hidden = true;
    bar.innerHTML = COLORS.map(([c, name]) => `<button type="button" class="nk-sw hl-${c}" data-act="hl" data-c="${c}" title="Highlight ${name.toLowerCase()}" aria-label="Highlight ${name.toLowerCase()}"></button>`).join("") +
      `<span class="nk-sep"></span><button type="button" data-act="bold" title="Bold" aria-label="Bold"><b>B</b></button>` +
      `<button type="button" data-act="erase" title="Remove marks from the selection" aria-label="Remove marks"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M16 3l5 5-10 10H6l-3-3z M9 9l6 6 M6 21h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></button>`;
    // keep the text selection alive while pressing a button
    bar.addEventListener("mousedown", e => e.preventDefault());
    bar.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b || !pending) return;
      apply(b.dataset.act, b.dataset.c);
    });
    document.body.appendChild(bar);
    return bar;
  }
  function hide() { if (bar) bar.hidden = true; pending = null; }

  function offsetIn(el, node, off) {
    const r = document.createRange(); r.setStart(el, 0);
    try { r.setEnd(node, off); } catch (e) { return 0; }
    return r.toString().length;
  }
  function readSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    const out = [];
    document.querySelectorAll(".plain[data-nk] .nb").forEach(el => {
      if (!range.intersectsNode(el)) return;
      const s = el.contains(range.startContainer) ? offsetIn(el, range.startContainer, range.startOffset) : 0;
      const e = el.contains(range.endContainer) ? offsetIn(el, range.endContainer, range.endOffset) : el.textContent.length;
      if (e > s) out.push({ el, s, e });
    });
    return out.length ? { parts: out, rect: range.getBoundingClientRect() } : null;
  }
  function check() {
    const got = readSelection();
    if (!got) return hide();
    pending = got.parts;
    const b = ensureBar(); b.hidden = false;
    const coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;
    const bw = b.offsetWidth, bh = b.offsetHeight, r = got.rect;
    let left = r.left + r.width / 2 - bw / 2 + window.scrollX;
    left = Math.max(window.scrollX + 8, Math.min(left, window.scrollX + document.documentElement.clientWidth - bw - 8));
    // on touch screens the system's own copy menu sits above the selection, so go below it
    let top = coarse || r.top < bh + 70 ? r.bottom + window.scrollY + 10 : r.top + window.scrollY - bh - 10;
    b.style.left = left + "px"; b.style.top = top + "px";
  }
  function apply(act, c) {
    const touched = new Set();
    const items = pending.map(p => { const card = p.el.closest(".plain[data-nk]"); const st = stateOf(card); touched.add(st); return { b: st.blocks.find(x => x.el === p.el), s: p.s, e: p.e }; }).filter(x => x.b);
    if (act === "bold") {
      const allBold = items.every(({ b, s, e }) => b.bd.slice(s, e).every(Boolean));
      items.forEach(({ b, s, e }) => { for (let i = s; i < e; i++) b.bd[i] = allBold ? 0 : 1; });
    } else if (act === "hl") {
      const same = items.every(({ b, s, e }) => b.hl.slice(s, e).every(v => v === c));   // same colour again = remove it
      items.forEach(({ b, s, e }) => { for (let i = s; i < e; i++) b.hl[i] = same ? 0 : c; });
    } else if (act === "erase") {
      items.forEach(({ b, s, e }) => { for (let i = s; i < e; i++) { b.hl[i] = 0; b.bd[i] = 0; } });
    }
    touched.forEach(st => { paint(st); persist(st); });
    const sel = window.getSelection(); if (sel) sel.removeAllRanges();
    hide();
  }

  // ------------------------------------------------------------ mount on each page render
  function mount(root) {
    hide();
    (root || document).querySelectorAll(".plain[data-nk]").forEach(card => {
      card._nk = null;
      const label = card.querySelector(".label");
      if (label && !label.querySelector(".nk-tools")) {
        label.insertAdjacentHTML("beforeend", `<span class="nk-tools"><span class="nk-hint">✎ Select text to highlight or bold it</span><button type="button" class="nk-clear" hidden>Clear my marks</button></span>`);
        label.querySelector(".nk-clear").addEventListener("click", () => {
          if (!confirm("Remove your highlights and bold text from this card?")) return;
          const st = stateOf(card);
          st.blocks.forEach(b => { b.hl.fill(0); b.bd.fill(0); });
          paint(st); persist(st);
        });
      }
      paint(stateOf(card));
    });
  }
  document.addEventListener("selectionchange", () => { clearTimeout(t); t = setTimeout(check, 180); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && bar && !bar.hidden) hide(); });
  window.addEventListener("resize", () => { if (bar && !bar.hidden) check(); });

  window.COI_NOTES = { mount };
})();
