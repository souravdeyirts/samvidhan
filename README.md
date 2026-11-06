# Samvidhan Explorer — draft v0.1

A static web app for exploring the Constitution of India. It has no build step and no backend.

**Live site:** https://souravdeyirts.github.io/samvidhan/ (GitHub Pages, published from the `main` branch).

## Run

```bash
python -m http.server 8765
```

Then open http://localhost:8765. You need the local server because the data files load as scripts and the browser won't load them from `file://`.

## What's inside

| View | Route | Source |
|---|---|---|
| Parts → Chapters → Articles | `#/parts`, `#/part/III`, `#/article/21` | `data/structure.js` |
| Verbatim text plus official amendment footnotes | article pages | `data/constitution-text.js` |
| Plain-language explanations (506 articles plus the Preamble) | article pages | `data/explain-1..5.js` |
| Themes (23) | `#/themes`, `#/theme/rights` | `data/themes.js` |
| Schedules (12) | `#/schedules`, `#/schedule/Seventh` | `constitution-text.js` |
| Amendment history (106 amendments plus pending Bills) | `#/amendments`, `#/amendment/42` | `data/amendments.js` |
| Per-article version history | article side panel | `data/amendment-index.js`, built from the footnotes |
| Landmark judgments (68) | `#/cases`, `#/case/kesavananda-bharati` | `data/judgments.js` |
| Article graph | `#/graph`, `#/graph?focus=356`, `#/graph?theme=emergency` | `data/xrefs.js` plus themes and cases |

## Provenance

- **Verbatim text:** *The Constitution of India [As on 1st May, 2024]*, Legislative Department, Ministry of Law and Justice. It includes amendments up to the 106th Amendment. A script parsed the text from the official PDF.
- **`amendment-index.js` and `xrefs.js`:** generated automatically from that text.
- **Explanations, amendment summaries and case notes:** AI-drafted commentary, fact-checked against web and primary sources in November 2026 (see [FACTCHECK.md](FACTCHECK.md)). Case and amendment pages show their sources. An expert legal review is still recommended before publication.
- **Post-2024 developments:** `data/updates.js` holds editorial notes shown above the verbatim text, such as the 106th Amendment's commencement on 16 April 2026.

## Rebuilding the text data

The verbatim text is generated from the official PDF by the scripts in `tools/`:

```bash
pdftotext constitution.pdf coi.txt
python -I tools/parse.py coi.txt parsed.json
node tools/build_text.js parsed.json data
node tools/build_xref.js .
```

- The parser attaches every editorial footnote to its provision: 733 of 733, none orphaned.
- Notes printed on a Part heading (for example "Part IVA inserted by the 42nd Amendment") are attached to the first article of that Part.
- Notes that have no marker are listed as "other editorial notes on the same page".
- `tools/layout.js` repairs the PDF layout. It changes only whitespace and line breaks, and moves the stacked oath alternative inline ("swear in the name of God / solemnly affirm"). The word sequence is checked as unchanged.

## Design

- **Navigation:** always visible, never collapsed into a menu button. It sits under the header in four groups: Learn (Your rights, Journeys), Read (Parts, Schedules, Themes), History (Amendments, Judgments, Time machine) and Explore (Graph). On phones it is a swipeable strip that keeps the current section in view, and search opens as a full-width row from the search icon.
- **Themes:** **Tricolour** (the default: saffron, white, India green and Ashoka-chakra navy, with the saffron and green deepened for readable text), **Light** and **Dark**, chosen with the switch in the header. The choice is remembered per browser; first-time visitors whose device is set to dark mode get Dark.
- **Index pages** (Home, Parts, Themes, Schedules, Your rights) use grouped one-line rows rather than card grids: two columns on wide screens, one on phones.
- **Styles:** `css/style.css` holds the base styles and `css/redesign.css` holds the layout and phone rules.

## Know your rights

`#/rights` maps 37 everyday situations to the constitutional rights that apply. Examples include being arrested without being told why, violence in custody, sexual harassment at work, school admission, eviction, internet shutdowns and RTI. Each page lists the rights with their Articles, practical steps, limits and exceptions, the relevant judgments and laws, and helplines.

- **The finder** accepts plain-language descriptions and maps everyday words to legal terms (for example "cops" to police, "jail" to custody, "bulldoze" to demolition).
- **Article pages** link to every scenario that relies on that Article.
- **Content:** `data/rights.js`, fact-checked in November 2026, including the post-2024 criminal laws (BNSS and BSA), the 2025 Supreme Court rulings on grounds of arrest, the phased start of the DPDP Act, and the 2026 Transgender Persons Amendment Act.
- **Disclaimer:** every page states that this is general information, not legal advice, and gives the free legal aid (15100) and emergency (112) numbers.
- **Maintenance:** this section needs the most regular updating, because statutes and the status of pending challenges change often.

## Learning journeys

`#/learn` has six guided stories, each 8–9 minutes long with 6 steps:

- How a Bill becomes law
- The Emergency, 1975–77
- How Article 21 grew
- The basic structure doctrine
- Reservations and social justice
- Federalism and GST

Each step embeds live content from the app: article cards, case notes, amendment cards and time-machine snapshots. There are 13 quizzes with explanations. Progress is saved per browser in `localStorage`. The content is in `data/journeys.js`; to add a journey, append an object using the schema at the top of that file. All six were fact-checked against the official text and published sources in November 2026.

## Time machine

`#/timemachine` shows the Constitution on any date since 26 January 1950. On any article page, **⏱ Time machine** shows how that article read on an earlier date, either as clean text ("Read as of") or highlighted against today ("Changes since").

- **How it works:** `js/timemachine.js` reverses the changes recorded in the official footnotes.
  - Inserted passages are removed.
  - Substituted passages revert to the quoted earlier words.
  - Omitted passages are restored when the footnote quotes them.
  - Whole Articles and Parts added later (Part IVA, Part IX, Part IXA, Part IXB, Part XIVA) are shown as not yet existing before their commencement date.
- **Gaps and restored text:** where the official footnotes do not record the earlier wording (for example "Subs. … for cl. (2)"), it is restored and shaded as "restored from historical text". It is never presented as official.
  - **Main source:** a historical transcription of every version of the Constitution ([captn3m0/constitution](https://github.com/captn3m0/constitution), one git commit per amendment), taken from the version just before the change.
  - **Hand-checked overrides:** 18 passages in `tools/history-overrides.json`, each with its source. Some have dated versions where a passage changed more than once, for example Art. 71 in 1950, 1961 and 1975, the Art. 240 Union-territory entries, the Art. 356 Punjab proviso and Art. 371(1).
  - **Other sources used:** the 1950 text on constitutionofindia.net and the amendment Acts' texts.
  - **Coverage:** against the 1950 text no unrecorded passages remain, and all 202 changed Articles reconstruct in full at every date their text changed. Articles omitted since 1950 (27, including Art. 31) show their historical versions by date.
- **Quality check:** for the 298 Articles the official footnotes reconstruct exactly, the transcription agrees on at least 90% of the wording for 292. It does contain OCR slips (for example "article 64" for "article 54" in the original Art. 368), so restored passages are never presented as official. Rebuild with `node tools/build_history.js <clone of captn3m0/constitution> .`
- **Dates:** each change takes effect from the "w.e.f." date in its footnote. Where a footnote gives none, the amendment's date is used. The 106th Amendment uses its 16 April 2026 commencement, which came after this text edition.
- **Tests:** `node tools/test_timemachine.js "<project path>"` checks known history, including the 1950 Preamble, Art. 19 before 1951, Art. 21A before 2010, Art. 31 before 1978, and Parts IX and IVA.

## Visual guides

`js/visuals.js` draws seven diagrams:
- how the Union government works
- how a State government works
- how a Bill becomes law
- the courts
- how the Constitution is amended
- emergency powers (Arts. 352, 356 and 360)
- how elections work

Every box and arrow cites its Article, and the boxes link to those Articles. The guides are listed at `#/visuals`, and they appear as collapsible cards on the Part and Article pages they explain. The two network diagrams are SVG, which scrolls sideways on phones and comes with a numbered step list; the others are HTML that reflows.

## Personal marks

Readers can select text in any "In plain language" card and highlight it (four colours), make it bold, or erase marks (`js/notes.js`). Marks are stored per card in the browser's localStorage as character ranges. If an explanation is rewritten, its marks are dropped.

## World influences

`#/influences` covers how other constitutions and political systems shaped India's. The data is in `data/influences.js`, written for this app.

- **Interactive diagram:** India at the centre, with eleven sources around it: the 1935 Act, the UK, the US, Ireland, Canada, Australia, Japan, Weimar Germany, the USSR, France and South Africa. On phones, chips replace the diagram.
- **Each source:** the context, then a table of what India took and how India adapted it, with links to the Articles.
- **Choices between systems:** parliamentary versus presidential, a strong Union, "procedure established by law" versus due process, a nominal President, and one integrated system.
- **Home-grown roots:** the Nehru Report, the Karachi Resolution, the Sapru Committee, the Objectives Resolution, Gandhian ideas, and the struggle against caste.
- **What India chose not to borrow.**
- **Article pages:** the Origins card's "Influences" tags link to the matching source.
- **Note:** the conventional "borrowed features" list is flagged as a teaching device, including where the attribution is too neat (for example, the 1935 Act already had a concurrent list).

## Origins (Constituent Assembly)

`#/origins` shows how the Constituent Assembly made the Constitution between 1946 and 1950. Each article page also has an **Origins** card.

- **The Origins page:**
  - a timeline of the Assembly
  - key figures and the Drafting Committee
  - twelve debates that shaped particular Articles, each linking to that day's debate record
  - the conventional "borrowed features" map, which notes that the framers adapted rather than copied
- **The Origins card:**
  - the Article's number in the Draft Constitution of 1948, with the draft wording
  - whether the Article was part of a larger draft Article, or inserted during the debates
  - the days the Assembly debated it, and the day it was adopted
  - the influences and key debates that touch the Article
  - a link to its drafting history on constitutionofindia.net
- **`data/origins.js`:** written for this app and fact-checked against the debate records and constitutionofindia.net. Quotations from the Constituent Assembly Debates are kept short.
- **`data/drafting.js`:** built by `tools/build_drafting.py` from the Article pages of [constitutionofindia.net](https://www.constitutionofindia.net) (Centre for Law and Policy Research).
  - **What is taken:** only facts (draft Article numbers and dates) and the 1948 Draft's own wording, which is a public document. Their summaries are not copied, and every card links back to the source page.
  - **Rebuild:** download the Article pages (politely, about one request a second), then run `python -I tools/build_drafting.py <pages-dir> <url-list> data/drafting.js`.
  - **Limits:** dates are read from the site's prose. Where an adoption date falls before a later debate on the same Article (because the provision was revisited), the adoption date is left out. Articles inserted by later amendments have no Assembly history.

## Known gaps (draft)

- Arts. 168, 310 and 342 each still show a stray footnote number ("1[2[", "42***", "45***"). In the PDF the matching footnote is printed on a different page from its marker.
- The First Schedule is a two-column table in the PDF. Every word is kept in order, but some names and territory descriptions sit on separate lines.
- The text of Art. 256 ends with a colon. That is how the official 2024 PDF prints it.
- See [FACTCHECK.md](FACTCHECK.md) for open items: the Sabarimala reference, pending challenges, and a few missing citations.
- Article 238 is a synthetic stub, because all of Part VII was omitted in 1956.
