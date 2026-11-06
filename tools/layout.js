// Layout normalisation for text extracted from the official PDF.
// Only whitespace / line structure changes, plus re-placing the stacked oath alternative
// ("swear in the name of God" over "solemnly affirm") inline. Words are never altered.
"use strict";

const M = "(?:\\u27e6\\d+\\u27e7)?\\[?"; // optional footnote marker + bracket

function fixOaths(t) {
  let out = "", i = 0;
  const key = "swear in the name of God";
  while (true) {
    const j = t.indexOf(key, i);
    if (j < 0) { out += t.slice(i); break; }
    const end = j + key.length;
    const k = t.indexOf("solemnly affirm", end);
    out += t.slice(i, end);
    if (k >= 0 && k - end < 320) {
      out += " / solemnly affirm";
      // remove the displaced alternative, joining the words around it with one space
      let between = t.slice(end, k).replace(/\s+$/, "");
      let after = t.slice(k + "solemnly affirm".length).replace(/^\s+/, " ");
      out += between;
      t = out + after; i = out.length; out = t.slice(0, i);
      continue;
    }
    i = end;
  }
  // a PDF artefact in some oath forms repeats "faith and" around the displaced phrase
  return out.replace(/\bfaith and\s+faith and\b/g, "faith and");
}

function collapseStars(t) {
  // "*\n\n*\n\n*" -> "* * *" (omitted-text placeholders)
  return t.replace(/\*(?:\s*\*)+/g, m => m.replace(/\s+/g, " ").replace(/\*(?=\*)/g, "* "));
}

const BLOCK = new RegExp("^(?:" + [
  M + "\\d{1,3}[A-Z]{0,2}\\.\\s",            // numbered entry "12. " / "2A. "
  M + "\\(\\w{1,5}\\)",                       // clause "(1)", "(a)", "(iv)"
  M + "(?:Provided|Explanation|Illustration)",
  M + "(?:List [IVX]+|PART [A-Z]+\\b|Part [IVX]+\\b)",
  M + "[IVX]{1,5}(?:\\s|$)",                  // roman heading "IV Form of oath..."
  M + "[A-Z]\\s+Form of",                     // "B Form of oath..."
  M + "Form of",
  M + "\"I, A\\.",
  M + "[A-Z][A-Z ,.'\\-()&]{6,}$",            // ALL-CAPS heading line
  M + "\\[(?:Article|Articles|See)",          // "[Articles 1 and 4]"
  "\\u27e6\\d+\\u27e7\\["                     // a line opening with an inserted passage
].join("|") + ")");

function joinLines(t) {
  const lines = t.split("\n").map(l => l.trim()).filter(l => l.length);
  const out = [];
  for (const l of lines) {
    if (!out.length || BLOCK.test(l)) out.push(l);
    else out[out.length - 1] += " " + l;
  }
  return out.join("\n");
}

function splitEntries(t) {
  // "15. War and peace. 16. Foreign jurisdiction." -> one entry per line
  return t.replace(new RegExp("([.;:\\]])\\s+(?=" + M + "\\d{1,3}[A-Z]{0,2}\\.\\s+(?:\\u27e6\\d+\\u27e7)?[\\[\"A-Z])", "g"), "$1\n")
          .replace(new RegExp("([.;:\\]])\\s+(?=" + M + "\\(\\w{1,5}\\)\\s)", "g"), "$1\n")
          .replace(/\s+(?=(?:⟦\d+⟧)?\[?List [IVX]+\b)/g, "\n");
}

function normaliseSchedule(t) {
  return splitEntries(joinLines(collapseStars(fixOaths(t))));
}
function normaliseArticle(t) {
  return collapseStars(fixOaths(t));
}

module.exports = { normaliseSchedule, normaliseArticle, fixOaths };
