/* Visual guides: diagrams of how the institutions set up by the Constitution fit together.
   Every box and arrow cites the Article it comes from; boxes link to that Article. */
(function () {
  "use strict";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const A = id => `#/article/${encodeURIComponent(id)}`;
  const art = id => `<a href="${A(id)}">Art. ${esc(id)}</a>`;

  // ---------------------------------------------------------------- tiny SVG kit
  function box(x, y, w, h, tone, title, lines, href) {
    const body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="ig-box ${tone}"/>
      <text x="${x + w / 2}" y="${y + 24}" class="ig-t">${esc(title)}</text>
      ${lines.map((l, i) => `<text x="${x + w / 2}" y="${y + 43 + i * 15}" class="ig-s">${esc(l)}</text>`).join("")}`;
    return href ? `<a href="${href}" class="ig-link" aria-label="${esc(title)} — open the Article">${body}</a>` : body;
  }
  function arrow(pts, opts) {
    opts = opts || {};
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
    return `<path d="${d}" class="ig-arrow${opts.cls ? " " + opts.cls : ""}" marker-end="url(#ig-head)"/>`;
  }
  function label(x, y, lines, anchor, cls) {
    return lines.map((l, i) => `<text x="${x}" y="${y + i * 13}" class="ig-l${cls ? " " + cls : ""}" text-anchor="${anchor || "middle"}">${esc(l)}</text>`).join("");
  }
  const svg = (w, h, title, inner) => `<div class="ig-scroll"><svg viewBox="0 0 ${w} ${h}" class="ig-svg" style="--ig-w:${w}px" role="img" aria-label="${esc(title)}">
    <defs><marker id="ig-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ig-headfill"/></marker></defs>
    ${inner}</svg></div>`;

  // ---------------------------------------------------------------- 1. Union government
  function union() {
    return svg(760, 520, "How the Union government is formed and works", `
      ${box(270, 14, 220, 58, "t-people", "The people", ["Every citizen aged 18+ votes (Art. 326)"], A("326"))}
      ${box(20, 130, 230, 70, "t-leg", "Lok Sabha", ["House of the People · up to 550 elected", "members · 5-year term (Arts. 81, 83)"], A("81"))}
      ${box(510, 130, 230, 70, "t-leg", "State Legislative Assemblies", ["MLAs directly elected in every", "State (Art. 170)"], A("170"))}
      ${box(20, 290, 200, 84, "t-exec", "PM & Council of Ministers", ["The real executive: runs the", "government day to day", "(Arts. 74, 75)"], A("75"))}
      ${box(300, 290, 160, 84, "t-head", "President", ["Head of State", "5-year term", "(Arts. 52, 56)"], A("52"))}
      ${box(520, 290, 220, 84, "t-leg", "Rajya Sabha", ["Council of States · up to 250:", "238 elected, 12 nominated", "(Art. 80)"], A("80"))}
      ${box(280, 432, 200, 72, "t-head", "Vice-President", ["Elected by both Houses;", "chairs the Rajya Sabha (Arts. 63–66)"], A("63"))}

      ${arrow([[310, 72], [180, 128]])}${label(232, 94, ["vote"])}
      ${arrow([[450, 72], [580, 128]])}${label(528, 94, ["vote"])}
      ${arrow([[630, 200], [630, 288]])}${label(622, 238, ["elected MLAs elect", "its members (Art. 80(4))"], "end")}
      ${arrow([[240, 200], [325, 288]])}${arrow([[520, 200], [435, 288]])}${arrow([[520, 332], [462, 332]])}
      ${label(380, 214, ["Electoral college:", "elected MPs and MLAs", "elect the President (Art. 54)"], "middle", "ig-strong")}
      ${arrow([[60, 290], [60, 202]])}${label(66, 236, ["collectively", "responsible to", "it (Art. 75(3))"], "start")}
      ${arrow([[298, 312], [222, 312]])}${label(260, 305, ["appoints"])}
      ${arrow([[222, 352], [298, 352]])}${label(260, 368, ["aid & advise"])}
      ${arrow([[480, 466], [625, 376]])}${label(585, 446, ["chairs (Art. 64)"])}`);
  }
  const unionSteps = [
    `Citizens aged 18 and over elect the <b>Lok Sabha</b> and their <b>State Legislative Assemblies</b> (${art("326")}).`,
    `The elected members of each State Assembly elect that State's members of the <b>Rajya Sabha</b>; the President nominates 12 more for their knowledge of literature, science, art or social service (${art("80")}).`,
    `An electoral college of the elected members of both Houses and of the State Assemblies elects the <b>President</b> for five years (${art("54")}, ${art("56")}).`,
    `The President appoints the <b>Prime Minister</b>, and other ministers on the PM's advice (${art("75")}). In practice the PM is whoever commands a majority in the Lok Sabha.`,
    `The Council of Ministers <b>aids and advises</b> the President, who must act on that advice (the President may send it back once for reconsideration) (${art("74")}).`,
    `The Council of Ministers is <b>collectively responsible to the Lok Sabha</b>: if it loses the House's confidence, the government falls (${art("75")}(3)).`,
    `<b>Parliament</b> is the President plus the two Houses (${art("79")}). It makes laws and controls taxes and spending.`
  ];

  // ---------------------------------------------------------------- 2. State government
  function state() {
    return svg(760, 400, "How a State government is formed and works", `
      ${box(20, 14, 180, 58, "t-head", "President", ["of India"], A("155"))}
      ${box(270, 14, 220, 58, "t-people", "The people of the State", ["vote (Art. 326)"], A("326"))}
      ${box(20, 150, 200, 80, "t-head", "Governor", ["Head of the State · appointed", "by the President (Arts. 153–156)"], A("155"))}
      ${box(520, 150, 220, 80, "t-leg", "Legislative Assembly", ["60–500 members, directly", "elected · 5 years (Arts. 170, 172)"], A("170"))}
      ${box(20, 290, 200, 84, "t-exec", "CM & Council of Ministers", ["The real executive", "of the State", "(Arts. 163, 164)"], A("164"))}
      ${box(520, 290, 220, 96, "t-leg", "Legislative Council", ["Only in some States: Andhra", "Pradesh, Bihar, Karnataka,", "Maharashtra, Telangana, UP", ""], A("169"))}
      ${label(630, 378, ["(Arts. 169, 171)"], "middle", "ig-in")}

      ${arrow([[110, 72], [110, 148]])}${label(118, 108, ["appoints", "(Art. 155)"], "start")}
      ${arrow([[450, 72], [590, 148]])}${label(536, 100, ["elect"])}
      ${arrow([[60, 230], [60, 288]])}${label(66, 256, ["appoints", "(Art. 164(1))"], "start")}
      ${arrow([[170, 288], [170, 232]])}${label(176, 256, ["aid & advise", "(Art. 163)"], "start")}
      ${arrow([[222, 340], [400, 340], [400, 200], [518, 200]])}${label(310, 318, ["collectively responsible", "to the Assembly (Art. 164(2))"])}`);
  }
  const stateSteps = [
    `The President appoints a <b>Governor</b> for each State, who holds office during the President's pleasure (${art("155")}, ${art("156")}).`,
    `Voters elect the <b>Legislative Assembly</b> (${art("170")}). Six States also have a <b>Legislative Council</b>, created or abolished by Parliament on the Assembly's request (${art("169")}).`,
    `The Governor appoints the <b>Chief Minister</b>, and other ministers on the CM's advice (${art("164")}(1)); in practice the CM is the leader of the Assembly majority.`,
    `The Council of Ministers aids and advises the Governor, except where the Constitution leaves something to the Governor's discretion (${art("163")}).`,
    `The Council of Ministers is collectively responsible to the <b>Legislative Assembly</b> (${art("164")}(2)).`
  ];

  // ---------------------------------------------------------------- 3. How a Bill becomes law (HTML, reflows on phones)
  function bill() {
    const step = (n, t, s) => `<li><span class="ig-n">${n}</span><div><b>${t}</b><span>${s}</span></div></li>`;
    return `<div class="ig-lanes">
      <div class="ig-lane t-leg"><h4>Ordinary Bill</h4><ol>
        ${step(1, "Introduced in either House", `Lok Sabha or Rajya Sabha (${art("107")})`)}
        ${step(2, "Debated and passed by that House", "Usually after committee scrutiny")}
        ${step(3, "Passed by the other House", "If it agrees, the Bill goes to the President")}
        <li class="ig-branch"><span class="ig-n">!</span><div><b>Deadlock?</b><span>If one House rejects it, the Houses disagree on amendments, or six months pass, the President may call a <b>joint sitting</b>; a majority of members present and voting decides (${art("108")}).</span></div></li>
        ${step(4, "President's assent", `Assent, withhold assent, or return it once for reconsideration; if both Houses pass it again, the President must assent (${art("111")})`)}
      </ol></div>
      <div class="ig-lane t-exec"><h4>Money Bill</h4><ol>
        ${step(1, "Introduced only in the Lok Sabha", `And only on the President's recommendation (${art("109")}, ${art("117")})`)}
        ${step(2, "Speaker certifies it as a Money Bill", `The Speaker's decision is final (${art("110")})`)}
        ${step(3, "Rajya Sabha has 14 days", `It may only recommend changes; the Lok Sabha may accept or reject them. No joint sitting (${art("109")})`)}
        ${step(4, "President's assent", `It cannot be returned for reconsideration (${art("111")})`)}
      </ol></div>
    </div>
    <div class="ig-result">⟶ The Bill becomes an <b>Act of Parliament</b>.</div>`;
  }
  const billSteps = [
    `A <b>Money Bill</b> deals only with taxes, borrowing, and money paid into or out of the Consolidated Fund (${art("110")}).`,
    `A Bill to <b>amend the Constitution</b> follows ${art("368")} instead: each House must pass it separately by a special majority, there is no joint sitting, and the President must assent.`,
    `State laws follow a similar path through the State Legislature and the Governor, who may also reserve a Bill for the President (${art("200")}).`
  ];

  // ---------------------------------------------------------------- 4. The courts (HTML pyramid)
  function courts() {
    const tier = (cls, title, sub, items) => `<div class="ig-tier ${cls}"><div class="ig-tier-h"><b>${title}</b><span>${sub}</span></div><ul>${items.map(i => `<li>${i}</li>`).join("")}</ul></div>`;
    return `<div class="ig-pyramid">
      ${tier("lv1", "Supreme Court", `Chief Justice and other judges (${art("124")})`, [
        `Hears appeals from High Courts, and grants special leave to appeal (${art("132")}–${art("136")})`,
        `Enforces Fundamental Rights directly through writs (${art("32")})`,
        `Settles disputes between the Union and States (${art("131")}); advises the President on referral (${art("143")})`,
        `Its rulings bind every court in India (${art("141")})`])}
      ${tier("lv2", "High Courts", `One for each State, or shared (${art("214")}, ${art("231")})`, [
        `Issue writs for Fundamental Rights <i>and</i> any other legal right (${art("226")})`,
        `Supervise all courts in their territory (${art("227")})`])}
      ${tier("lv3", "District and subordinate courts", `${art("233")}–${art("237")}`, [
        `District judges are appointed by the Governor in consultation with the High Court (${art("233")})`,
        `The High Court controls the subordinate courts (${art("235")})`])}
    </div>
    <div class="ig-aside"><b>Independence of judges.</b> Supreme Court and High Court judges are appointed by the President (${art("124")}, ${art("217")}); since the Second Judges case (1993) this is in practice on the recommendation of a collegium of senior judges. They can be removed only by an order of the President, passed after each House of Parliament votes for removal by a special majority, for proved misbehaviour or incapacity (${art("124")}(4), ${art("217")}).</div>`;
  }

  // ---------------------------------------------------------------- 5. Amending the Constitution (HTML)
  function amend() {
    const col = (cls, h, how, ex) => `<div class="ig-col ${cls}"><h4>${h}</h4><p class="ig-how">${how}</p><p class="small">${ex}</p></div>`;
    return `<div class="ig-cols">
      ${col("t-people", "Simple majority", "Passed like an ordinary law; these are not treated as amendments under Art. 368.",
        `Examples: forming new States or changing boundaries (${art("2")}–${art("4")}); creating or abolishing a Legislative Council (${art("169")})`)}
      ${col("t-leg", "Special majority", "In each House: a majority of its total membership <i>and</i> two-thirds of the members present and voting.",
        `Most of the Constitution, including the Fundamental Rights and Directive Principles (${art("368")}(2))`)}
      ${col("t-exec", "Special majority + half the States", "As above, then ratified by the Legislatures of at least half the States.",
        `Provisions on the federal balance: election of the President (${art("54")}, ${art("55")}), extent of Union and State executive power (${art("73")}, ${art("162")}), the Supreme Court and High Courts, the Seventh Schedule lists, States' representation in Parliament, GST Council (${art("279A")}), and ${art("368")} itself`)}
    </div>
    <div class="ig-aside"><b>The limit.</b> In <a href="#/case/kesavananda-bharati">Kesavananda Bharati (1973)</a> the Supreme Court held that Parliament can amend any part of the Constitution but cannot destroy its <b>basic structure</b>, such as democracy, federalism, secularism, judicial review and the rule of law. A Bill to amend the Constitution has no joint sitting, and the President must assent to it (${art("368")}(2)).</div>`;
  }

  // ---------------------------------------------------------------- 6. Emergency provisions (HTML columns)
  const cs = (id, name) => `<a href="#/case/${id}">${esc(name)}</a>`;
  function emergency() {
    const row = (k, v) => `<div class="ig-kv"><dt>${k}</dt><dd>${v}</dd></div>`;
    const col = (cls, h, art_, rows) => `<div class="ig-col ${cls}"><h4>${h}</h4><p class="small muted ig-art">${art_}</p><dl>${rows.join("")}</dl></div>`;
    return `<div class="ig-cols">
      ${col("t-exec", "National Emergency", art("352"), [
        row("When", "War, external aggression or <b>armed rebellion</b> threatens the security of India or any part of it"),
        row("Who decides", `The President, only on the <b>written advice of the Union Cabinet</b> (${art("352")}(3))`),
        row("Approval", "Each House within <b>one month</b>, by special majority"),
        row("How long", "Six months at a time, renewable with fresh approval; the Lok Sabha can end it by a simple-majority vote"),
        row("Effects", `The Union may direct the States and Parliament may legislate on State subjects (${art("250")}, ${art("353")}); Art. 19 is suspended in a war or external-aggression emergency (${art("358")}); enforcement of other rights may be suspended, <b>but never Arts. 20 and 21</b> (${art("359")})`),
        row("Used", "1962 (China war), 1971 (war with Pakistan), 1975–77 (on the ground of “internal disturbance”)")])}
      ${col("t-leg", "President's Rule in a State", art("356"), [
        row("When", "The State government cannot be carried on in accordance with the Constitution, on the Governor's report or otherwise"),
        row("Who decides", "The President, on the Union Cabinet's advice"),
        row("Approval", "Both Houses within <b>two months</b>, by simple majority"),
        row("How long", "Six months at a time, up to three years; beyond one year only during a National Emergency or if the Election Commission certifies that elections cannot be held"),
        row("Effects", "The President takes over the State executive and Parliament makes the State's laws; the High Court is unaffected"),
        row("Checks", `Open to judicial review; a government's majority is to be tested on the floor of the House (${cs("sr-bommai", "S.R. Bommai, 1994")})`)])}
      ${col("t-people", "Financial Emergency", art("360"), [
        row("When", "The financial stability or credit of India, or of any part of it, is threatened"),
        row("Approval", "Both Houses within <b>two months</b>, by simple majority"),
        row("How long", "Until revoked, once approved"),
        row("Effects", "The Union may direct the States on financial matters, order salary cuts for public servants, including judges, and require States' Money Bills to be reserved for the President"),
        row("Used", "Never")])}
    </div>
    <div class="ig-aside"><b>Lessons of 1975–77.</b> During the internal Emergency, the Supreme Court held in ${cs("adm-jabalpur", "ADM Jabalpur (1976)")} that no one could go to court to enforce the right to life. The <a href="#/amendment/44">44th Amendment (1978)</a> answered that: it replaced “internal disturbance” with “armed rebellion”, required the Cabinet's advice in writing and a special majority in Parliament, and put Arts. 20 and 21 beyond suspension. ${cs("puttaswamy-privacy", "Puttaswamy (2017)")} later overruled ADM Jabalpur.</div>`;
  }

  // ---------------------------------------------------------------- 7. Elections (HTML pipeline)
  function elections() {
    const st = (n, t, s) => `<li><span class="ig-n">${n}</span><div><b>${t}</b><span>${s}</span></div></li>`;
    return `<div class="ig-lanes ig-lanes-1">
      <div class="ig-lane t-people"><h4>From constituency to legislature</h4><ol>
        ${st(1, "Constituencies are drawn", `Seats are readjusted after each census (${art("82")}, ${art("170")}); the number of seats per State stays frozen on the 1971 census until the first census after 2026`)}
        ${st(2, "Seats are reserved", `For Scheduled Castes and Scheduled Tribes in proportion to population (${art("330")}, ${art("332")}). One-third of seats will be reserved for women once the next delimitation is done (${art("330A")}, ${art("332A")}, ${art("334A")})`)}
        ${st(3, "Every adult can vote", `One general electoral roll per constituency, open to every citizen aged 18 or over, with no one excluded for religion, race, caste or sex (${art("325")}, ${art("326")})`)}
        ${st(4, "The Election Commission runs the poll", `It superintends, directs and controls elections to Parliament, the State Legislatures and the offices of President and Vice-President (${art("324")})`)}
        ${st(5, "Disputes go to court only after the election", `Through an election petition under the Representation of the People Act, 1951; courts cannot halt the process midway (${art("329")}). Disputes over the President's or Vice-President's election go to the Supreme Court (${art("71")})`)}
        ${st(6, "Members stay bound to their party", `A member who defects can be disqualified under the anti-defection law in the <a href="#/schedule/Tenth">Tenth Schedule</a>; the Speaker or Chairman decides, subject to judicial review (${cs("kihoto-hollohan", "Kihoto Hollohan, 1992")})`)}
      </ol></div>
    </div>
    <div class="ig-aside"><b>Independence of the Election Commission.</b> The Chief Election Commissioner can be removed only in the same way as a Supreme Court judge (${art("324")}(5)). In ${cs("anoop-baranwal", "Anoop Baranwal (2023)")} the Supreme Court said appointments should not rest with the government alone. Parliament then passed the Chief Election Commissioner and Other Election Commissioners Act, 2023: the President appoints on the recommendation of a committee of the Prime Minister, the Leader of the Opposition in the Lok Sabha and a Union Cabinet Minister.</div>`;
  }

  const LIST = [
    { id: "union", title: "How the Union government works", sub: "The people, Parliament, the President and the Prime Minister", parts: ["V"], arts: [[52, 88]], extra: ["326"], html: () => union(), steps: unionSteps,
      caption: "Parliament is the President plus the Lok Sabha and the Rajya Sabha (Art. 79). The President is the formal head; real power lies with the Council of Ministers, which answers to the Lok Sabha." },
    { id: "state", title: "How a State government works", sub: "Governor, Chief Minister and the State Legislature", parts: ["VI"], arts: [[153, 177]], html: () => state(), steps: stateSteps,
      caption: "A State Legislature is the Governor plus the Legislative Assembly and, where one exists, the Legislative Council (Art. 168)." },
    { id: "bill", title: "How a Bill becomes law", sub: "Ordinary Bills and Money Bills in Parliament", parts: ["V"], arts: [[107, 122]], html: () => bill(), steps: billSteps },
    { id: "courts", title: "The courts", sub: "Supreme Court, High Courts and subordinate courts", parts: ["V", "VI"], arts: [[124, 147], [214, 237], [32, 32]], html: () => courts() },
    { id: "amend", title: "How the Constitution is amended", sub: "Three routes, and the basic-structure limit", parts: ["XX"], arts: [[368, 368]], extra: ["2", "3", "4"], html: () => amend() },
    { id: "emergency", title: "Emergency powers", sub: "National Emergency, President's Rule and Financial Emergency", parts: ["XVIII"], arts: [[352, 360]], extra: ["250"], html: () => emergency() },
    { id: "elections", title: "How elections work", sub: "Constituencies, voting, the Election Commission and disputes", parts: ["XV"], arts: [[324, 329]], extra: ["325", "326", "330", "330A", "332", "332A", "334A", "71"], html: () => elections() }
  ];
  const num = id => { const m = String(id).match(/^(\d+)/); return m ? +m[1] : NaN; };
  function forArticle(id) {
    const n = num(id);
    return LIST.filter(v => (v.extra || []).includes(String(id)) || v.arts.some(([a, b]) => n >= a && n <= b));
  }
  const forPart = pid => LIST.filter(v => v.parts.includes(pid));
  const byId = id => LIST.find(v => v.id === id);

  function full(v) {
    return `<figure class="ig">${v.html()}${v.caption ? `<figcaption class="small muted">${esc(v.caption)}${/<svg/.test(v.html()) ? " Tap or click a box to open its Article." : ""}</figcaption>` : ""}
      ${v.steps ? `<ol class="ig-steps">${v.steps.map(s => `<li>${s}</li>`).join("")}</ol>` : ""}</figure>`;
  }
  // collapsible card for Article and Part pages
  function card(v, open) {
    return `<details class="ig-card"${open ? " open" : ""}><summary><span class="ig-ico" aria-hidden="true">◫</span><span><b>Visual guide: ${esc(v.title)}</b><small>${esc(v.sub)}</small></span></summary>${full(v)}
      <p class="small"><a href="#/visual/${v.id}">Open full screen →</a> · <a href="#/visuals">All visual guides</a></p></details>`;
  }

  window.COI_VISUALS = { LIST, forArticle, forPart, byId, full, card };
})();
