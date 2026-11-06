/* Text time machine: reconstructs how a provision read on a given date by reversing the changes
   recorded in the official editorial footnotes of the current text.

   - "Ins." passages are removed for dates before they took effect (always exact).
   - "Subs. ... for "old words"" passages are swapped back to the quoted old words (exact).
   - Omitted passages ("***") are restored when the footnote quotes them (exact).
   - Otherwise a clearly marked gap is shown: the official edition does not reproduce the old wording.

   Output uses private-use characters as inline tokens; the app turns them into <ins>/<del>/gap markup. */
(function (root) {
  "use strict";
  const T_INS = "", T_INS_END = "", T_DEL = "", T_DEL_END = "", T_GAP = "", T_GAP_END = "";
  const ORIGIN = new Date(Date.UTC(1950, 0, 26));
  // amendments whose commencement is known from outside this text edition (see data/updates.js)
  const COMMENCEMENT_OVERRIDES = { 106: new Date(Date.UTC(2026, 3, 16)) };
  const MONTHS = { january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11 };

  function parseDMY(s) {
    const m = String(s).match(/(\d{1,2})\s*[-.\/]\s*(\d{1,2})\s*[-.\/]?\s*(\d{4})/);
    if (!m) return null;
    const d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
    return isNaN(d) ? null : d;
  }
  function parseLong(s) {
    const m = String(s || "").match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (!m || !(m[2].toLowerCase() in MONTHS)) return null;
    return new Date(Date.UTC(+m[3], MONTHS[m[2].toLowerCase()], +m[1]));
  }
  function allDates(t) {
    const out = [];
    const re = /w\.?\s?r?\.?\s?e\.?\s?f\.?\s*([0-9][0-9\s.\/-]{6,12}[0-9])/gi;
    let m;
    while ((m = re.exec(t))) { const d = parseDMY(m[1]); if (d) out.push(d); }
    return out;
  }

  // the opening quote must come soon after "for"; the quoted wording itself may be long
  function firstQuoteAfter(t, idx, within) {
    const head = t.slice(idx, idx + (within || 120));
    const o = head.search(/["“]/);
    if (o < 0) return null;
    const rest = t.slice(idx + o + 1);
    const c = rest.search(/["”]/);
    return c > 0 && c < 3000 ? rest.slice(0, c) : null;
  }

  function describe(t, kind) {
    let m = t.match(/\bfor\s+(?:the\s+)?((?:cls?\.|clauses?|sub-clauses?|arts?\.|articles?|provisos?|Explanations?|entr(?:y|ies)|paragraphs?|sub-paragraphs?|items?|Part|Chapter|heading|Schedule)\s*(?:[0-9A-Z]{1,6}\b\s*)?(?:\([^)]*\)(?:\s*(?:,|and)\s*\([^)]*\))*)?)/i);
    if (m) return "earlier " + m[1].replace(/\s+/g, " ").trim();
    if (kind === "omit" || kind === "window") {
      m = t.match(/^(.{2,60}?)\s+(?:was\s+)?(?:ins\.|inserted|omitted)/i);
      if (m && !/^the words/i.test(m[1])) return m[1].replace(/^Certain words$/i, "certain words").trim();
    }
    if (/certain words/i.test(t)) return "certain words";
    return "earlier wording";
  }

  // ------------------------------------------------------------------ notes
  function makeNoteParser(ctx) {
    const cache = new Map();
    const fnAmend = ctx.fnAmend || {};
    const amendDate = n => {
      if (COMMENCEMENT_OVERRIDES[n]) return COMMENCEMENT_OVERRIDES[n];
      const a = (ctx.amendments || []).find(x => x.n === n);
      return a ? parseLong(a.date) || (a.year ? new Date(Date.UTC(a.year, 0, 1)) : null) : null;
    };
    return function note(id, text) {
      if (cache.has(id)) return cache.get(id);
      const t = String(text || "");
      const r = { id, text: t, kind: "other", from: null, to: null, old: null, desc: null, never: false, amend: fnAmend[id] || null };
      if (/struck down/i.test(t) && !/^(Subs|Ins|Added|Omitted)/i.test(t)) { r.kind = "other"; }
      else if (/^Subs\.|substituted/i.test(t)) r.kind = "subs";
      else if (/^Ins\.[^.]*?\(w\.?\s?e\.?\s?f[^)]*\)\.\s*Original\b/i.test(t)) r.kind = "ins";   // "Ins. … Original cl. (2) was omitted …"
      else if (/\b(ins\.|inserted|added)(?!\w)/i.test(t) && /omitted/i.test(t)) r.kind = "window";
      else if (/omitted/i.test(t)) r.kind = "omit";
      else if (/re-?(numbered|lettered)/i.test(t)) r.kind = "renum";
      else if (/\b(ins\.|inserted|added)(?!\w)/i.test(t) || /^Ins/i.test(t)) r.kind = "ins";
      const dates = allDates(t);
      if (dates.length) { r.from = dates[0]; if (r.kind === "window" && dates.length > 1) r.to = dates[dates.length - 1]; }
      if (!r.from) {
        if (/not\s+(?:yet\s+)?(?:been\s+)?notifi?ed|yet to be notified|not enforced|never (?:brought|came) into force/i.test(t)) {
          if (r.amend && COMMENCEMENT_OVERRIDES[r.amend]) r.from = COMMENCEMENT_OVERRIDES[r.amend];
          else r.never = true;
        } else if (r.amend) r.from = amendDate(r.amend);
        else { const y = t.match(/Act,?\s*(\d{4})/); if (y) r.from = new Date(Date.UTC(+y[1], 0, 1)); }
      }
      // "Ins. by X (w.e.f. A). Original cl. (2) was omitted by Y (w.e.f. B)": a different, earlier clause existed until B
      const pm = t.match(/Original\s+((?:cl|clause|art|sub-clause)s?\.?\s*\([^)]+\))\s+was\s+omitted[\s\S]*?\(w\.?\s?e\.?\s?f\.?\s*([0-9][0-9\s.\/-]{6,12}[0-9])\)/i);
      if (pm) { r.prior = { desc: "original " + pm[1], until: parseDMY(pm[2]) }; r.from = dates[0] || r.from; }
      if (r.kind === "subs") {
        const i = t.search(/\bfor\b/i);
        r.old = i >= 0 ? firstQuoteAfter(t, i, 90) : null;
        // a few footnotes give the replaced words without quotation marks
        if (r.old === null) {
          const u = t.match(/\bfor ([a-z][^"“(]{8,300}?) \(w\.?\s?e\.?\s?f/);
          if (u && !/^(cls?\.|clauses?|sub-clauses?|arts?\.|articles?|the |certain|entr|items?|para|provisos?)/i.test(u[1])) r.old = u[1].trim();
        }
      } else if (r.kind === "omit" || r.kind === "window") {
        const m = t.match(/(?:words?|letters?|figures?|brackets?|marks?)[^"“]{0,40}["“]([^"”]{1,600})["”][^.]{0,80}omitted/i);
        r.old = m ? m[1] : null;
      } else if (r.kind === "renum") {
        const m = t.match(/^(?:Cl|Sub-clause|Clause|Item|Entry|Paragraph)s?\.?\s*(\([^)]+\))/i);
        r.old = m ? m[1] : (/^Arts?\.?\s/i.test(t) ? "" : null);
      }
      // earlier wording the official footnote does not record, restored from a historical transcription
      const fill = (ctx.fills || {})[id];
      if ((r.old === null || r.old === undefined) && fill && fill.versions && /^(subs|omit|window|renum)$/.test(r.kind)) {
        // hand-checked dated versions: the wording depends on the date being viewed
        r.oldVersions = fill.versions.slice().sort((x, y) => x.from.localeCompare(y.from));
        r.absentBefore = !!fill.absentBefore; r.restored = true; r.restoredFrom = fill.source;
        if (fill.effectiveFrom) { const ef = new Date(fill.effectiveFrom + "T00:00:00Z"); if (!isNaN(ef)) r.from = ef; }
      } else if ((r.old === null || r.old === undefined) && fill && fill.old && /^(subs|omit|window)$/.test(r.kind)) {
        r.old = fill.old; r.restored = true; r.restoredFrom = fill.base;
      }
      const pfill = (ctx.fills || {})[id + ":prior"];
      if (r.prior && pfill && pfill.old) { r.prior.old = pfill.old; r.prior.restored = true;
      }
      r.desc = describe(t, r.kind);
      r.label = labelFor(r);
      cache.set(id, r);
      return r;
    };
  }

  const WORD_ORD = (() => {
    const o = "first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth".split(" ");
    const tn = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const tnth = ["", "", "twentieth", "thirtieth", "fortieth", "fiftieth", "sixtieth", "seventieth", "eightieth", "ninetieth"];
    const m = {};
    for (let n = 1; n <= 110; n++) {
      const r = n % 100;
      let name = r === 0 ? "" : r < 20 ? o[r - 1] : (r % 10 ? tn[Math.floor(r / 10)] + o[r % 10 - 1] : tnth[Math.floor(r / 10)]);
      if (n >= 100) name = r === 0 ? "onehundredth" : "onehundredand" + name;
      m[name] = n;
    }
    return m;
  })();
  function wordOrdinal(s) { return WORD_ORD[String(s).toLowerCase().replace(/[^a-z]/g, "")] || null; }
  function ordinal(n) { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function labelFor(r) {
    if (r.amend) return ordinal(r.amend) + " Amendment";
    const m = r.text.match(/by (?:the )?([A-Z][A-Za-z().,'\s-]{3,90}?(?:Act|Order),?\s*\d{4})/);
    if (m) return m[1].replace(/\s+/g, " ");
    const c = r.text.match(/\b(C\.O\.\s*\d+)/);
    return c ? c[1] : "Editorial change";
  }

  // ------------------------------------------------------------------ text tree
  function parseTree(text) {
    const rootNode = { type: "root", kids: [] };
    const stack = [rootNode];
    let buf = "";
    const top = () => stack[stack.length - 1];
    const flush = () => { if (buf) { top().kids.push({ type: "text", s: buf }); buf = ""; } };
    let i = 0;
    while (i < text.length) {
      const c = text[i];
      if (c === "⟦") {
        const m = text.slice(i).match(/^⟦(\d+)⟧/);
        if (m) {
          i += m[0].length;
          flush();
          if (text[i] === "[") {
            const node = { type: "span", id: m[1], kids: [] };
            top().kids.push(node); stack.push(node); i++;
          } else if (text[i] === "*") {
            const s = text.slice(i).match(/^\*(?:\s*\*)*/)[0];
            top().kids.push({ type: "gap", id: m[1], s }); i += s.length;
          } else top().kids.push({ type: "mark", id: m[1] });
          continue;
        }
      }
      if (c === "[") { flush(); const node = { type: "lit", kids: [] }; top().kids.push(node); stack.push(node); i++; continue; }
      if (c === "]" && stack.length > 1) { flush(); stack.pop(); i++; continue; }
      buf += c; i++;
    }
    flush();
    return rootNode;
  }

  // ------------------------------------------------------------------ render
  function renderAsOf(text, fn, asOf, mode, ctx) {
    const note = ctx.note;
    const stats = { exact: 0, gaps: 0, restored: 0, changes: [] };
    const asIso = asOf.toISOString().slice(0, 10);
    // wording in force on the viewed date (hand-checked versions), "" if the passage did not exist yet, null if unknown
    const effOld = n => { if (!n.oldVersions) return n.old; const v = n.oldVersions.filter(x => x.from <= asIso).pop(); return v ? v.old : (n.absentBefore ? "" : null); };
    const oldText = n => { const o = effOld(n); return n.restored && o ? "" + o + "" : o; };
    const tally = n => { if (n.restored) stats.restored++; else stats.exact++; };
    // counts made while rendering text that ends up hidden (replaced by earlier wording) must not be reported
    const snapStats = () => ({ e: stats.exact, g: stats.gaps, r: stats.restored, c: stats.changes.length });
    const undoStats = (a, b) => {
      stats.exact -= b.e - a.e; stats.gaps -= b.g - a.g; stats.restored -= b.r - a.r;
      stats.changes.splice(a.c, b.c - a.c).forEach(x => seen.delete(x.id));
    };
    const tree = parseTree(text);
    const seen = new Set();
    const record = (n) => { if (!seen.has(n.id)) { seen.add(n.id); stats.changes.push(n); } };
    const gapTok = (desc) => T_GAP + "[" + desc + " — not reproduced in the official edition]" + T_GAP_END;

    function kids(node) { return node.kids.map(walk).join(""); }
    function walk(node) {
      if (node.type === "text") return node.s;
      if (node.type === "mark") return "";
      if (node.type === "lit") return "[" + kids(node) + "]";
      if (node.type === "root") return kids(node);
      const n = note(node.id, fn[node.id]);
      if (node.type === "span") {
        const s0 = snapStats();
        const inner = kids(node);
        const s1 = snapStats();
        const out = (() => {
        if (n.never || !n.from || n.kind === "other") return inner;
        if (n.kind === "omit") {
          // a bracketed placeholder for something omitted later, e.g. "[(f)* * * * *]"
          if (asOf >= n.from) return inner;
          record(n);
          if (effOld(n) === "") return ""; if (effOld(n)) { tally(n); return mode === "diff" ? T_DEL + oldText(n) + T_DEL_END : oldText(n); }
          stats.gaps++;
          return gapTok(n.desc);
        }
        if (n.kind === "window") {
          // inserted then omitted, yet text still present: treat insertion date only
          if (asOf >= n.from) return inner;
        } else if (asOf >= n.from) return inner;
        record(n);
        if (n.kind === "ins" && n.prior && n.prior.until && asOf < n.prior.until) {
          // before an even earlier clause was omitted, that clause stood here
          const added = mode === "diff" ? " " + T_INS + inner + T_INS_END : "";
          if (n.prior.old) {
            stats.restored++;
            const o = "" + n.prior.old + "";
            return mode === "diff" ? T_DEL + o + T_DEL_END + added : o;
          }
          stats.gaps++;
          return gapTok(n.prior.desc) + added;
        }
        if (n.kind === "ins" || n.kind === "window") { stats.exact++; return mode === "diff" ? T_INS + inner + T_INS_END : ""; }
        if (effOld(n) !== null && effOld(n) !== undefined) {
          tally(n);
          return mode === "diff" ? (effOld(n) ? T_DEL + oldText(n) + T_DEL_END + " " : "") + T_INS + inner + T_INS_END : oldText(n);
        }
        stats.gaps++;
        return mode === "diff" ? gapTok(n.desc) + " " + T_INS + inner + T_INS_END : gapTok(n.desc);
        })();
        if (inner && !out.includes(inner)) undoStats(s0, s1);
        return out;
      }
      if (node.type === "gap") {
        if (n.never || !n.from) return mode === "diff" ? "" : "";
        // an insertion note on a "* * *" placeholder never hides earlier wording
        if (n.kind === "ins" || n.kind === "renum") return "";
        let existed;
        if (n.kind === "window") existed = asOf >= n.from && (!n.to || asOf < n.to);
        else existed = asOf < n.from; // omitted (or substituted away) after asOf
        if (!existed) {
          if (n.kind === "window" && asOf < n.from) return "";
          return "";
        }
        record(n);
        if (effOld(n) === "") return ""; if (effOld(n)) { tally(n); return mode === "diff" ? T_DEL + oldText(n) + T_DEL_END : oldText(n); }
        stats.gaps++;
        return gapTok(n.desc);
      }
      return "";
    }
    let out = walk(tree);
    out = out.replace(/[ \t]{2,}/g, " ").replace(/ +([,.;:])/g, "$1").replace(/\n{3,}/g, "\n\n");
    return { text: balanceTokens(out), stats };
  }

  // tokens must not span lines (the app renders one paragraph per line)
  function balanceTokens(s) {
    const pairs = { "": "", "": "", "": "" };
    pairs[""] = "";
    const closers = new Set(Object.values(pairs));
    let open = [];
    return s.split("\n").map(line => {
      let pre = open.join("");
      for (const ch of line) {
        if (pairs[ch]) open.push(ch);
        else if (closers.has(ch)) open.pop();
      }
      const post = open.slice().reverse().map(o => pairs[o]).join("");
      return pre + line + post;
    }).join("\n");
  }

  // ------------------------------------------------------------------ article-level facts
  function wholeInsertion(article, note) {
    const tree = parseTree(article.text);
    const real = tree.kids.filter(k => !(k.type === "text" && !k.s.trim()));
    if (real.length === 1 && real[0].type === "span") {
      const n = note(real[0].id, article.fn[real[0].id]);
      if ((n.kind === "ins" || n.kind === "window") && n.from) return n;
    }
    // heading-level notes such as "Art 338A ins. by ..." anywhere in the article's notes/footnotes
    const all = Object.assign({}, article.fn, article.notes || {});
    for (const [id, t] of Object.entries(all)) {
      if (new RegExp("^Arts?\\.?\\s*[^.]*\\b" + article.id.replace(/([A-Z]+)$/, "\\s*$1") + "\\b[^.]*\\bins\\.", "i").test(t)) {
        const n = note(id, t); if (n.from) return n;
      }
    }
    return null;
  }
  function omission(article) {
    if (!article.omitted) return null;
    const d = allDates(article.text);
    return d.length ? d[d.length - 1] : null;
  }

  function changePoints(article, note) {
    const pts = new Map();
    const add = (d, n) => {
      if (!d || d <= ORIGIN) return;
      const k = d.toISOString().slice(0, 10);
      if (!pts.has(k)) pts.set(k, { date: d, labels: new Set() });
      pts.get(k).labels.add(n.label);
    };
    Object.entries(article.fn || {}).forEach(([id, t]) => {
      const n = note(id, t);
      if (n.never || n.kind === "other") return;
      add(n.from, n); if (n.to) add(n.to, n);
    });
    Object.entries(article.notes || {}).forEach(([id, t]) => { const n = note(id, t); if (!n.never && n.kind !== "other") add(n.from, n); });
    const om = omission(article);
    if (om) add(om, { label: "Omitted" });
    return [...pts.values()].sort((a, b) => a.date - b.date).map(p => ({ date: p.date, iso: p.date.toISOString().slice(0, 10), labels: [...p.labels] }));
  }

  // A Part inserted by amendment carries its insertion note on the Part heading; the parser attaches
  // that note to the Part's first article. Returns {from, label} or null.
  // partId is used to accept a plain "Ins." heading note only for Parts that were themselves added later
  // (IVA, IXA, IXB, XIVA); other Parts existed in 1950 and a heading note there concerns wording only.
  function partInsertion(firstArticle, note, partId) {
    const head = new Set(firstArticle.headNotes || []);
    for (const [id, t] of Object.entries(firstArticle.notes || {})) {
      if (!head.has(id)) continue;
      // "Part IXA ins. by ..." or "Original Part IX ... omitted ... and subsequently ins. by ... (w.e.f. X)"
      if (/\bPart\s+[IVXL]+[A-Z]?\b/.test(t) && /\bins\./i.test(t)) {
        const at = t.search(/\bins\.(?![\s\S]*\bins\.)/i);
        const d = allDates(t.slice(at))[0];
        if (d) {
          const amend = t.slice(at).match(/Constitution \(([A-Za-z\- ]+?) Amendment\)/);
          const num = amend ? wordOrdinal(amend[1]) : null;
          return { from: d, label: num ? ordinal(num) + " Amendment" : note(id, t).label };
        }
      }
      if (/^Ins\.\s/i.test(t) && /^[IVXL]+[AB]$/.test(partId || "")) { const n = note(id, t); if (n.from) return { from: n.from, label: n.label }; }
    }
    return null;
  }

  function statusOn(article, asOf, note, partIns) {
    if (partIns && partIns.from && asOf < partIns.from) return { state: "not-yet", since: partIns.from, by: partIns.label };
    const ins = wholeInsertion(article, note);
    if (ins && asOf < ins.from) return { state: "not-yet", since: ins.from, by: ins.label };
    const om = omission(article);
    if (article.omitted) {
      if (om && asOf < om) return { state: "existed-omitted-later", until: om };
      return { state: "omitted", until: om };
    }
    return { state: "in-force" };
  }

  const api = {
    ORIGIN, parseTree, renderAsOf, changePoints, statusOn, wholeInsertion, partInsertion, makeNoteParser, parseDMY, parseLong,
    TOKENS: { T_INS, T_INS_END, T_DEL, T_DEL_END, T_GAP, T_GAP_END }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.COI_TM = api;
})(typeof window !== "undefined" ? window : globalThis);
