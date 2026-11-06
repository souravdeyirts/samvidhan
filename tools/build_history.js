/* Fill time-machine gaps from a historical transcription of the Constitution.
   Usage: node tools/build_history.js <path-to-captn3m0-constitution-clone> <project-dir>
   Source repo: https://github.com/captn3m0/constitution (one commit per amendment; unofficial text).

   The official footnotes remain authoritative. This script only supplies wording the footnotes do not
   record: for each gap it takes the repository version just BEFORE the amendment that made the change,
   finds the passage between the same left/right context as our reconstruction, and records it.
   It also measures agreement with passages we can reconstruct exactly, as a quality check. */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const [, , REPO, PROJ] = process.argv;
global.window = {};
require(path.join(PROJ, "data/constitution-text.js"));
require(path.join(PROJ, "data/amendments.js"));
require(path.join(PROJ, "data/structure.js"));
const TM = require(path.join(PROJ, "js/timemachine.js"));
const T = window.COI_TEXT;
const git = args => cp.execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// ---------------------------------------------------------------- repository versions
const commits = git(["log", "--reverse", "--format=%H %s"]).trim().split("\n").map(l => { const i = l.indexOf(" "); return { hash: l.slice(0, i), subj: l.slice(i + 1) }; });
const amendCommitIdx = {};
commits.forEach((c, i) => { const m = c.subj.match(/^AMENDMENT_(\d+)_/); if (m && amendCommitIdx[+m[1]] === undefined) amendCommitIdx[+m[1]] = i; });
const originalIdx = commits.findIndex(c => /AMENDMENT_ORIGINAL/.test(c.subj));

const KEEP_HYPHEN = /(?:^|[^a-z])(sub|co|self|non|inter|ex|semi|anti|pre|post|quasi|re|ill|well|two|one|three|four|half|cross|counter|by|vice|deputy|under|over)$/i;
function cleanPartText(raw) {
  const lines = raw.replace(/\r/g, "").split("\n").filter(l => {
    const t = l.trim();
    if (/^\d{1,4}$/.test(t)) return false;                         // page numbers
    if (/^THE CONSTITUTION OF INDIA$/i.test(t)) return false;        // running header
    if (/^\((Part|Sch|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)[^)]*\)$/i.test(t)) return false;
    return true;
  });
  let s = lines.join("\n");
  s = s.replace(/([A-Za-z]+)-[ \t]*\n[ \t]*([a-z])/g, (m, a, b) => KEEP_HYPHEN.test(a) ? `${a}-${b}` : a + b);
  s = s.replace(/([A-Za-z]{2,})- ([a-z]{2,})/g, (m, a, b) => KEEP_HYPHEN.test(a) ? `${a}-${b}` : a + b);
  return s;
}
const versionCache = new Map();
function versionText(idx) {
  if (versionCache.has(idx)) return versionCache.get(idx);
  const h = commits[idx].hash;
  const files = git(["ls-tree", "--name-only", h]).trim().split("\n").filter(f => /^PART\d+[A-Z]?\.txt$/.test(f));
  const order = f => { const m = f.match(/^PART(\d+)([A-Z]?)/); return +m[1] * 10 + (m[2] ? m[2].charCodeAt(0) - 64 : 0); };
  files.sort((a, b) => order(a) - order(b));
  const text = files.map(f => cleanPartText(git(["show", `${h}:${f}`]))).join("\n");
  versionCache.set(idx, text);
  return text;
}

// alnum-only lowercase projection with index map back to the original string
function project(s) {
  let out = "", map = [];
  for (let i = 0; i < s.length; i++) { const c = s[i]; if (/[A-Za-z0-9]/.test(c)) { out += c.toLowerCase(); map.push(i); } }
  return { p: out, map };
}
const alnum = s => s.replace(/[^A-Za-z0-9]/g, "").toLowerCase();

// locate an article's region in a version: heading line "<id>." or "<id> " at line start,
// searched in document order so that numbering in lists does not confuse it
const ORDER = T.articles.map(a => a.id);
function articleRegions(text) {
  const regions = new Map();
  let cursor = 0;
  const starts = [];
  for (const id of ORDER) {
    const re = new RegExp(`(?:^|\\n)[ \\t\\[]*${id.replace(/([A-Z]+)$/, "\\s?$1")}[.\\s—-]`, "g");
    re.lastIndex = cursor;
    const m = re.exec(text);
    if (m && m.index - cursor < 60000) { starts.push({ id, at: m.index }); cursor = m.index + 1; }
  }
  starts.forEach((s, i) => regions.set(s.id, [s.at, i + 1 < starts.length ? starts[i + 1].at : text.length]));
  return regions;
}
const regionCache = new Map();
function regionOf(idx, id) {
  if (!regionCache.has(idx)) regionCache.set(idx, articleRegions(versionText(idx)));
  const r = regionCache.get(idx).get(id);
  return r ? versionText(idx).slice(r[0], r[1]) : null;
}

// ---------------------------------------------------------------- gap extraction
const fnAmend = T.fnAmend || {};
const GAP_ID = /\[@@(\d+(?::prior)?)@@[^]*/g;
function gapContexts(article, date) {
  // render with each gap labelled by its footnote id
  const base = TM.makeNoteParser({ fnAmend, amendments: window.COI_AMENDMENTS });
  const note = (id, t) => { const n = base(id, t); const c = Object.assign({}, n, { desc: `@@${id}@@` }); if (n.prior) c.prior = Object.assign({}, n.prior, { desc: `@@${id}:prior@@` }); return c; };
  const r = TM.renderAsOf(article.text, article.fn, date, "read", { note });
  const text = r.text.replace(/[-]/g, "");
  const out = [];
  let m; GAP_ID.lastIndex = 0;
  const pieces = []; let last = 0;
  while ((m = GAP_ID.exec(text))) { pieces.push({ s: text.slice(last, m.index) }); pieces.push({ gap: m[1] }); last = m.index + m[0].length; }
  pieces.push({ s: text.slice(last) });
  for (let i = 0; i < pieces.length; i++) if (pieces[i].gap) out.push({ id: pieces[i].gap, left: (pieces[i - 1] || {}).s || "", right: (pieces[i + 1] || {}).s || "" });
  return out;
}

function extractBetween(region, left, right) {
  const P = project(region);
  const L = alnum(left), R = alnum(right);
  // whole provision substituted (no surrounding text): the earlier text is the whole region
  if (!L && !R) return { text: region, k: 0, unique: true, whole: true };
  for (const k of [60, 40, 25, 16, 10]) {
    const la = L.slice(-k), ra = R.slice(0, k);
    const starts = [];
    if (la) { let i = P.p.indexOf(la); while (i >= 0) { starts.push(i + la.length); i = P.p.indexOf(la, i + 1); } }
    else starts.push(0);
    for (const s of starts) {
      let e;
      if (ra) { e = P.p.indexOf(ra, s); if (e < 0) continue; }
      else e = P.p.length;
      if (e - s > 6000) continue;
      if (!la && !ra) return null;
      const a = s === 0 && !la ? 0 : P.map[s - 1] + 1;
      const b = e >= P.p.length ? region.length : P.map[e];
      return { text: region.slice(a, b), k, unique: starts.length === 1 };
    }
  }
  return null;
}
const tidy = s => s.replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
// trim the punctuation that belongs to the surrounding (anchor) text, and any heading that leaked in
// repair OCR word splits ("t he", "aut hority") using the official text's vocabulary:
// join two fragments only if the joined word is a real word there and one fragment is not
const VOCAB = new Set();
T.articles.forEach(a => (a.text.toLowerCase().match(/[a-z]+/g) || []).forEach(w => VOCAB.add(w)));
function fixSplits(s) {
  const parts = s.split(/( )/);           // keep the separators
  for (let i = 0; i + 2 < parts.length; i += 2) {
    const x = parts[i], y = parts[i + 2];
    if (!/^[A-Za-z]{1,6}$/.test(x) || !/^[a-z]{1,12}[,.;:]?$/.test(y)) continue;
    const yw = y.replace(/[,.;:]$/, "");
    const j = (x + yw).toLowerCase();
    if (VOCAB.has(j) && (!VOCAB.has(x.toLowerCase()) || !VOCAB.has(yw))) { parts[i] = x + y; parts.splice(i + 1, 2); i -= 2; }
  }
  return parts.join("");
}
// remove a leading "<id>." and, if present, the marginal title (matched against today's title)
function stripHeading(s, article) {
  s = s.replace(new RegExp("^\\[?" + article.id.replace(/([A-Z]+)$/, "\\s?$1") + "\\.?\\s*"), "");
  const want = alnum(article.title).slice(0, 18);
  if (want.length >= 8 && alnum(s.slice(0, 80)).startsWith(want)) {
    const cut = s.slice(Math.floor(article.title.length * 0.6)).search(/[.—](?=\s|—|-)/);
    if (cut >= 0) s = s.slice(Math.floor(article.title.length * 0.6) + cut + 1).replace(/^[\s—-]+/, "");
  }
  return s.trim();
}
function trimEdges(s, id) {
  s = s.replace(/^[\s.,;:—–-]+/, "").replace(/[\s(\[—–-]+$/, "");
  const h = new RegExp("^\\[?" + id.replace(/([A-Z]+)$/, "\\s?$1") + "\\.\\s*[^\\u2014]{0,200}?\\.?\\s*[\\u2014-]+\\s*");
  s = s.replace(h, "");
  const opens = (s.match(/\(/g) || []).length, closes = (s.match(/\)/g) || []).length;
  if (closes > opens && /^[^(]*\)/.test(s)) s = s.replace(/^[^(]*?\)\s*/, "");
  return s.trim();
}

const commitDateOf = c => { const m = c.subj.match(/_(\d{2})(\d{2})(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : null; };
const day = 86400000;
const ALL_FN = Object.assign({}, ...T.articles.map(x => x.fn));
const fills = {};
const report = { gaps: 0, filled: 0, noAmend: 0, noRegion: 0, noMatch: 0, rejected: 0, samples: [] };
const parse = TM.makeNoteParser({ fnAmend, amendments: window.COI_AMENDMENTS });
for (const a of T.articles) {
  const seen = new Set();
  // gaps appear at the date just before each change
  const dates = TM.changePoints(a, parse).map(p => new Date(p.date.getTime() - day)).concat([TM.ORIGIN]);
  for (const d of dates) {
    for (const g of gapContexts(a, d)) {
      if (seen.has(g.id)) continue;
      seen.add(g.id); report.gaps++;
      const isPrior = /:prior$/.test(g.id);
      const fid = g.id.replace(/:prior$/, "");
      const ftext = a.fn[fid] || "";
      const n = parse(fid, ftext);
      // the wording we need is the one in force just before the change that removed it.
      // - footnote names a constitutional amendment: the repository version just before that amendment
      //   ("ins. by X … omitted by Y": just before Y; "Original cl. … omitted by Y": just before Y)
      // - otherwise (other Acts, or "ibid." after one): the latest version dated before the change took effect
      let named = [...ftext.matchAll(/Constitution \(([A-Za-z\- ]+?) Amendment\)/g)].map(m => wordToNum(m[1])).filter(Boolean);
      let amend = null, baseIdx = -1;
      // "… ibid." refers to the Act named in the previous footnote: follow it when that was a constitutional amendment
      if (!named.length && /ibid/i.test(ftext)) {
        const prevText = ALL_FN[String(+fid - 1)] || "";
        if (/Constitution \(/.test(prevText) && fnAmend[fid]) named.push(fnAmend[fid]);
      }
      if (named.length) {
        amend = isPrior || (n.kind === "window" && named.length > 1) ? named[named.length - 1] : named[0];
        if (amendCommitIdx[amend] !== undefined) baseIdx = amendCommitIdx[amend] - 1;
      }
      if (baseIdx < 0) {
        const when = isPrior ? n.prior && n.prior.until : n.from;
        if (when) {
          const iso = when.toISOString().slice(0, 10);
          for (let i = originalIdx; i < commits.length; i++) { const cd = commitDateOf(commits[i]); if (cd && cd < iso) baseIdx = i; }
        }
      }
      if (baseIdx < 0) { report.noAmend++; report.why = (report.why || []); report.why.push(`${a.id}/fn${g.id}: no base version`); continue; }
      const region = regionOf(baseIdx, a.id);
      if (!region) { report.noRegion++; (report.why = report.why || []).push(`${a.id}/fn${g.id}: article not found in ${commits[baseIdx].subj}`); continue; }
      const x = extractBetween(region, g.left, g.right);
      if (!x) { report.noMatch++; (report.why = report.why || []).push(`${a.id}/fn${g.id}: context not matched in ${commits[baseIdx].subj}`); continue; }
      let old = trimEdges(tidy(x.text), a.id);
      if (x.whole) {
        old = stripHeading(old, a);
        old = old.replace(/\s+(?=\(\d+[A-Z]?\)\s)/g, "\n");
      }
      // sanity: footnote says "for cl. (2)" etc. — the old passage should start with that label
      const desc = isPrior ? n.prior.desc : n.desc;
      const lab = (desc || "").match(/\(([^)]+)\)/);
      const plausible = old.length > 0 && old.length < 4000 && !/\b(PART|CHAPTER) [IVX]+\b/.test(old) &&
        (!lab || /^(earlier\s+|original\s+)?(cl|sub-clause|clause|item|entry)/i.test(desc.replace(/^(earlier|original)\s+/, "")) === false || old.startsWith(`(${lab[1]})`) || old.includes(`(${lab[1]})`));
      if (!plausible) { report.rejected++; (report.why = report.why || []).push(`${a.id}/fn${g.id}: rejected (${desc}) <- ${old.slice(0, 90)}`); continue; }
      old = fixSplits(old);
      // cleanup: drop the transcription's editorial NOTES, leftover headings, and anything before the clause the footnote names
      old = old.replace(/\s*\bNOTES\b[\s\S]*$/, "").replace(/^[\s.,;:—-]+/, "");
      old = old.replace(new RegExp("^" + a.id.replace(/([A-Z]+)$/, "\\s?$1") + "\\.\\s+[^()]{3,160}?[.\\u2014-]\\s*(?=\\(|[A-Z])"), "");
      if (x.whole) {
        // a whole-provision passage may still start with the marginal title: keep from "(1)" when what precedes it is a title, not a sentence
        const k = old.search(/\(1\)\s/);
        if (k > 0 && k < 220 && !/[.;:]\s*$/.test(old.slice(0, k)) && !/\bshall\b/.test(old.slice(0, k))) old = old.slice(k);
        // or a title ending in a dash: "… to give directions as to accounts- The accounts …"
        const t = old.slice(0, 160).match(/^[A-Z][^.;:()]{5,140}?[—-]\s+(?=[A-Z])/);
        if (t && !/\bshall\b/.test(t[0])) old = old.slice(t[0].length);
      }
      if (lab && !old.startsWith("(") && old.includes(`(${lab[1]}) `) && /^(earlier\s+|original\s+)?(cl|sub-clause|clause)/i.test(desc)) old = old.slice(old.indexOf(`(${lab[1]}) `));
      old = old.trim();
      fills[g.id] = { old, amend, base: commits[baseIdx].subj, anchor: x.k };
      report.filled++;
      if (report.samples.length < 12) report.samples.push(`${a.id} fn${g.id} (${n.desc}) <- ${old.slice(0, 140)}`);
    }
  }
}

// ---------------------------------------------------------------- quality check against exact reconstructions
let agree = 0, compared = 0;
const disagreements = [];
for (const a of T.articles) {
  if (a.omitted) continue;
  const r = TM.renderAsOf(a.text, a.fn, TM.ORIGIN, "read", { note: parse });
  if (r.stats.gaps || TM.statusOn(a, TM.ORIGIN, parse).state !== "in-force") continue;
  const region = regionOf(originalIdx, a.id);
  if (!region) continue;
  const ours = alnum(r.text.replace(/[-]/g, "")), theirs = alnum(region).slice(0, ours.length + 400);
  if (ours.length < 40) continue;
  compared++;
  // similarity: share of our 12-char shingles found in theirs
  const sh = new Set(); for (let i = 0; i + 12 <= ours.length; i += 6) sh.add(ours.slice(i, i + 12));
  let hit = 0; sh.forEach(x => { if (theirs.includes(x)) hit++; });
  const sim = hit / sh.size;
  if (sim >= 0.9) agree++; else disagreements.push(`${a.id}:${sim.toFixed(2)}`);
}

// ---------------------------------------------------------------- omitted articles: text before omission
const omittedTexts = {};
const commitDate = c => { const m = c.subj.match(/_(\d{2})(\d{2})(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : null; };
function articleBody(idx, a) {
  const region = regionOf(idx, a.id);
  if (!region) return null;
  let txt = region.replace(/^\s*\[?\s*/, "");
  const lines = txt.split("\n").map(l => l.trim()).filter(Boolean);
  const body = fixSplits(stripHeading(tidy(lines.join(" ")), a)).replace(/\s+(?=\((?:\d+[A-Z]?)\)\s)/g, "\n");
  return body.length > 20 && body.length < 12000 ? body : null;
}
for (const a of T.articles) {
  if (!a.omitted) continue;
  const m = a.text.match(/Constitution \(([A-Za-z\- ]+?) Amendment\)/);
  const n = m ? wordToNum(m[1]) : null;
  if (!n || amendCommitIdx[n] === undefined) continue;
  // every distinct version from the original text up to the one just before omission
  const versions = [];
  for (let idx = originalIdx; idx < amendCommitIdx[n]; idx++) {
    const body = articleBody(idx, a);
    if (!body) continue;
    const prev = versions[versions.length - 1];
    if (prev && alnum(prev.text) === alnum(body)) continue;
    versions.push({ from: commitDate(commits[idx]) || "1950-01-26", text: body, source: commits[idx].subj });
  }
  if (versions.length) omittedTexts[a.id] = { omittedBy: n, versions };
}
function wordToNum(w) {
  const o = "first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth".split(" ");
  const tn = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"], tnth = ["", "", "twentieth", "thirtieth", "fortieth", "fiftieth", "sixtieth", "seventieth", "eightieth", "ninetieth"];
  const key = w.toLowerCase().replace(/[^a-z]/g, "");
  for (let n = 1; n <= 110; n++) {
    const r = n % 100;
    let name = r === 0 ? "" : r < 20 ? o[r - 1] : (r % 10 ? tn[Math.floor(r / 10)] + o[r % 10 - 1] : tnth[Math.floor(r / 10)]);
    if (n >= 100) name = r === 0 ? "onehundredth" : "onehundredand" + name;
    if (name === key) return n;
  }
  return null;
}

// hand-checked overrides win over automatic alignment (see tools/history-overrides.json)
const OVR = JSON.parse(fs.readFileSync(path.join(PROJ, "tools/history-overrides.json"), "utf8"));
let manual = 0;
for (const [k, v] of Object.entries(OVR)) {
  if (k.startsWith("_")) continue;
  fills[k] = { versions: v.versions, absentBefore: !!v.absentBefore, effectiveFrom: v.effectiveFrom || null, source: v.source, manual: true };
  manual++;
}
console.log("hand-checked overrides applied:", manual);
const out = { source: "https://github.com/captn3m0/constitution", note: "Unofficial transcription; used only where the official footnotes do not record earlier wording.", fills, omitted: omittedTexts };
fs.writeFileSync(path.join(PROJ, "data/history-fill.js"), "/* Earlier wording restored from a historical transcription (see tools/build_history.js). */\nwindow.COI_HISTORY_FILL=" + JSON.stringify(out) + ";\n");
console.log(JSON.stringify({ ...report, samples: undefined, why: undefined }, null, 0)); console.log('unresolved:\n  ' + (report.why || []).join('\n  '));
console.log("quality check vs exact 1950 reconstructions:", agree, "of", compared, "articles agree (>=90% shingles); low:", disagreements.slice(0, 25).join(" "));
console.log("omitted articles with restored text:", Object.keys(omittedTexts).length, Object.entries(omittedTexts).map(([k, v]) => k + "x" + v.versions.length).join(" "));
report.samples.forEach(s => console.log(" -", s));
