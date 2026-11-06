/* Article graph — two modes:
   Overview: every article around theme hubs, laid out once, labels appear as you zoom in.
   Focus:    one node and its neighbourhood (1 or 2 hops) in rings, fully labelled. */
(function () {
  "use strict";
  let sim = null;

  const PART_COLORS = ["#c2410c", "#b45309", "#a16207", "#4d7c0f", "#15803d", "#0f766e", "#0e7490", "#0369a1", "#1d4ed8", "#4338ca",
    "#6d28d9", "#7e22ce", "#a21caf", "#be185d", "#be123c", "#b91c1c", "#78716c", "#57534e", "#0891b2", "#65a30d", "#ca8a04", "#9333ea", "#db2777", "#475569", "#334155", "#0d9488"];
  const trunc = (s, n) => s.length > n ? s.slice(0, n - 1) + "…" : s;

  function mount(root, params) {
    const M = window.COI_MODEL;
    const { byId, PARTS, THEMES, themesOf, CASES, caseById, XREFS, EXPLAIN, esc } = M;
    const partColor = new Map(PARTS.map((p, i) => [p.id, PART_COLORS[i % PART_COLORS.length]]));

    const state = {
      xref: true, themes: true, cases: true,
      activeThemes: new Set(params.get("theme") ? [params.get("theme")] : THEMES.map(t => t.id)),
      focus: params.get("focus") ? "a:" + params.get("focus") : params.get("case") ? "c:" + params.get("case") : null,
      depth: 1,
      colorBy: "part",
      part: params.get("part") || "",
      show: "all"
    };
    let sticky = null;   // legend group pinned by a click

    root.innerHTML = `
      <div class="graph-head">
        <div>
          <div class="crumbs" style="margin:0"><a href="#/">Home</a><span class="sep">/</span>Article graph</div>
          <h1 style="margin:2px 0 0;font-size:26px">Article graph</h1>
        </div>
        <div class="graph-find">
          <input id="gq" list="gqlist" type="search" placeholder="Focus on… (e.g. 21, Kesavananda)" autocomplete="off">
          <datalist id="gqlist"></datalist>
        </div>
      </div>
      <div class="graph-wrap">
        <div class="graph-panel" id="gctl">
          <h3>Show connections</h3>
          <label class="sw"><input type="checkbox" id="gx" checked><span class="line solid"></span>Cross-references in text</label>
          <label class="sw"><input type="checkbox" id="gt" checked><span class="line faint"></span>Shared themes</label>
          <label class="sw"><input type="checkbox" id="gc" checked><span class="line dashed"></span>Landmark judgments</label>
          <h3>Colour articles by</h3>
          <div class="seg" id="gcol"><button data-v="part" class="on">Part</button><button data-v="theme">Theme</button></div>
          <h3>Themes <span class="h3-actions"><a href="#" id="gall">all</a> · <a href="#" id="gnone">none</a></span></h3>
          <div id="gthemes" class="theme-chips">${THEMES.map(t => `<button class="tchip ${state.activeThemes.has(t.id) ? "on" : ""}" data-t="${t.id}" style="--c:${t.color}" title="${esc(t.about)}">${esc(t.name)}</button>`).join("")}</div>
        </div>
        <div class="graph-canvas" id="gcanvas">
          <div class="graph-mode" id="gmode"></div>
          <div class="graph-tools">
            <button id="zin" title="Zoom in" aria-label="Zoom in">+</button><button id="zout" title="Zoom out" aria-label="Zoom out">−</button><button id="zfit" title="Fit to view" aria-label="Fit to view">⤢</button>
          </div>
          <div class="graph-actions">
            <button id="gfilter" aria-expanded="false" aria-controls="gfpop"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4-2v-4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>Filter<span class="gf-count" id="gfcount"></span></button>
            <button id="greset" title="Back to the whole graph, all filters cleared"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Reset</button>
          </div>
          <div class="graph-filter" id="gfpop" hidden>
            <h3>Show</h3>
            <div class="seg gf-show" id="gfshow">
              <button data-v="all">Everything</button><button data-v="articles">Articles</button><button data-v="themes">Themes</button><button data-v="cases">Judgments</button>
            </div>
            <p class="small muted gf-help" id="gfhelp"></p>
            <h3>Part</h3>
            <select id="gfpart"><option value="">All Parts</option>${PARTS.filter(p => !/Omitted/.test(p.title)).map(p => `<option value="${esc(p.id)}">Part ${esc(p.id)} — ${esc(trunc(p.title, 40))}</option>`).join("")}</select>
            <h3>Theme</h3>
            <select id="gftheme"><option value="">All themes</option>${THEMES.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("")}</select>
            <div class="gf-foot"><button class="linklike" id="gfclear">Clear filters</button><button class="btn-sm" id="gfdone">Done</button></div>
          </div>
          <div class="graph-tip" id="gtip"></div>
          <div class="graph-legend" id="glegend"></div>
        </div>
        <div class="graph-panel" id="ginfo"></div>
      </div>`;

    const canvas = root.querySelector("#gcanvas");
    const tip = root.querySelector("#gtip");
    const info = root.querySelector("#ginfo");
    const modeBar = root.querySelector("#gmode");

    // datalist for the finder
    root.querySelector("#gqlist").innerHTML =
      M.ARTS.filter(a => !a.omitted).map(a => `<option value="Art. ${esc(a.id)} — ${esc(trunc(a.title, 70))}">`).join("") +
      CASES.map(c => `<option value="${esc(c.short || c.name)} (${c.year})">`).join("") +
      THEMES.map(t => `<option value="Theme: ${esc(t.name)}">`).join("");

    // ---------------------------------------------------------- full graph model
    function buildAll() {
      const nodes = new Map(), links = [];
      const addArt = id => {
        const a = byId.get(id); if (!a || a.omitted) return null;
        if (!nodes.has("a:" + id)) nodes.set("a:" + id, { id: "a:" + id, kind: "art", ref: id, label: id, title: a.title, part: a.part.id, deg: 0 });
        return nodes.get("a:" + id);
      };
      const inPart = id => !state.part || (byId.get(id) && byId.get(id).part.id === state.part);
      const allowed = id => inPart(id) && (state.activeThemes.size === THEMES.length || (themesOf.get(id) || []).some(t => state.activeThemes.has(t.id)));
      if (state.themes) THEMES.filter(t => state.activeThemes.has(t.id)).forEach(t => {
        const arts = t.articles.filter(inPart);
        if (!arts.length) return;
        const h = { id: "t:" + t.id, kind: "theme", ref: t.id, label: t.name, title: t.name, color: t.color, deg: 0 };
        nodes.set(h.id, h);
        arts.forEach(aid => { const n = addArt(aid); if (n) links.push({ source: h.id, target: n.id, kind: "theme", color: t.color }); });
      });
      if (state.xref) Object.entries(XREFS).forEach(([from, tos]) => tos.forEach(to => {
        if (state.part ? !(allowed(from) && allowed(to)) : (!allowed(from) && !allowed(to))) return;
        const a = addArt(from), b = addArt(to);
        if (a && b) links.push({ source: a.id, target: b.id, kind: "xref" });
      }));
      if (state.cases) CASES.forEach(c => {
        const arts = (c.articles || []).filter(x => byId.has(x) && allowed(x));
        if (!arts.length) return;
        const cn = { id: "c:" + c.id, kind: "case", ref: c.id, label: c.short || c.name, title: c.name, year: c.year, deg: 0 };
        nodes.set(cn.id, cn);
        arts.forEach(aid => { const n = addArt(aid); if (n) links.push({ source: cn.id, target: n.id, kind: "case" }); });
      });
      // ensure a focused node exists even if filtered out
      if (state.focus && !nodes.has(state.focus)) {
        const [k, ref] = state.focus.split(/:(.+)/);
        if (k === "a") addArt(ref);
      }
      links.forEach(l => { nodes.get(l.source).deg++; nodes.get(l.target).deg++; });
      return { nodes: [...nodes.values()], links };
    }

    function egoOf(all, centerId, depth) {
      const adj = new Map();
      all.links.forEach(l => {
        [[l.source, l.target], [l.target, l.source]].forEach(([a, b]) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push(b); });
      });
      const hop = new Map([[centerId, 0]]);
      let frontier = [centerId];
      for (let d = 1; d <= depth; d++) {
        const next = [];
        frontier.forEach(id => (adj.get(id) || []).forEach(nb => {
          if (hop.has(nb)) return;
          // on the second hop, don't expand through theme hubs (they would pull in everything)
          if (d === 2 && id.startsWith("t:")) return;
          hop.set(nb, d); next.push(nb);
        }));
        frontier = next;
      }
      const byIdN = new Map(all.nodes.map(n => [n.id, n]));
      const nodes = [...hop.keys()].map(id => Object.assign({}, byIdN.get(id), { hop: hop.get(id) }));
      const keep = new Set(hop.keys());
      const links = all.links.filter(l => keep.has(l.source) && keep.has(l.target)).map(l => Object.assign({}, l));
      return { nodes, links };
    }

    // ---------------------------------------------------------- rendering
    const svg = d3.select(canvas).append("svg");
    const g = svg.append("g");
    const gl = g.append("g"), gn = g.append("g"), gt = g.append("g");
    let k = 1;
    const zoom = d3.zoom().scaleExtent([0.1, 8]).on("zoom", e => {
      g.attr("transform", e.transform);
      const changed = e.transform.k !== k; k = e.transform.k;
      if (changed) { applyLabelVisibility(); positionLabels(); }
    });
    svg.call(zoom).on("dblclick.zoom", null);
    let data, nodeSel, linkSel, labelSel, mode = "overview";

    const artColor = n => {
      if (state.colorBy === "theme") { const t = (themesOf.get(n.ref) || [])[0]; return t ? t.color : "#94a3b8"; }
      return partColor.get(n.part) || "#94a3b8";
    };
    const fill = n => n.kind === "theme" ? n.color : n.kind === "case" ? "var(--ink-2)" : artColor(n);
    const radius = n => {
      if (mode === "focus" && n.hop === 0) return 18;
      if (n.kind === "theme") return mode === "focus" ? 12 : 15;
      if (n.kind === "case") return 6;
      return Math.min(3.5 + Math.sqrt(n.deg) * 1.5, 12);
    };

    function labelText(n) {
      if (mode === "focus") {
        if (n.kind === "art") return n.hop === 0 ? `Art. ${n.ref} · ${trunc(n.title, 42)}` : `${n.ref} · ${trunc(n.title, 28)}`;
        if (n.kind === "case") return `${trunc(n.label, 26)} (${n.year})`;
        return n.label;
      }
      return n.label;
    }

    // Labels, halos and offsets are divided by the zoom factor so text stays the same size on screen.
    function applyLabelVisibility() {
      if (!labelSel) return;
      gt.selectAll("text.node-label").attr("font-size", (mode === "focus" ? 11 : 10.5) / k).attr("stroke-width", 3 / k);
      gt.selectAll("text.hub-label").attr("font-size", 13 / k).attr("stroke-width", 4 / k);
      if (mode === "focus") { labelSel.style("display", null); return; }
      labelSel.style("display", n => isLit(n) === false ? "none" : n.kind === "theme" || k > 1.5 || (k > 0.9 && n.deg > 7) || (litNodes && litNodes.has(n.id) && litNodes.size < 60) ? null : "none");
    }

    function draw() {
      if (sim) sim.stop();
      sticky = null; litNodes = litLinks = null;
      const all = buildAll();
      if (state.focus && all.nodes.some(n => n.id === state.focus)) { mode = "focus"; data = egoOf(all, state.focus, state.depth); }
      else { mode = "overview"; state.focus = null; data = all; }
      const W = canvas.clientWidth, H = canvas.clientHeight;

      // layout: computed up-front (no jitter), then drawn
      data.nodes.forEach(n => { n.x = W / 2 + (Math.random() - 0.5) * W * 0.6; n.y = H / 2 + (Math.random() - 0.5) * H * 0.6; });
      sim = d3.forceSimulation(data.nodes).stop()
        .force("link", d3.forceLink(data.links).id(n => n.id)
          .distance(l => mode === "focus" ? 90 : l.kind === "theme" ? 80 : l.kind === "case" ? 28 : 40)
          .strength(l => mode === "focus" ? 0.15 : l.kind === "theme" ? 0.12 : 0.5))
        .force("charge", d3.forceManyBody().strength(n => mode === "focus" ? -260 : n.kind === "theme" ? -900 : -30).distanceMax(mode === "focus" ? 600 : 400))
        .force("collide", d3.forceCollide().radius(n => radius(n) + (mode === "focus" ? 26 : 2)))
        .force("x", d3.forceX(W / 2).strength(mode === "focus" ? 0.02 : 0.05))
        .force("y", d3.forceY(H / 2).strength(mode === "focus" ? 0.02 : 0.05));
      if (mode === "focus") {
        const c = data.nodes.find(n => n.hop === 0); c.fx = W / 2; c.fy = H / 2;
        const n1 = data.nodes.filter(n => n.hop === 1).length;
        const R1 = Math.max(140, n1 * 8), R2 = R1 * 1.8;
        sim.force("radial", d3.forceRadial(n => n.hop === 0 ? 0 : n.hop === 1 ? R1 : R2, W / 2, H / 2).strength(0.9));
        sim.force("collide", d3.forceCollide().radius(n => radius(n) + 14));
      }
      for (let i = 0; i < (mode === "focus" ? 260 : 320); i++) sim.tick();

      gl.selectAll("*").remove(); gn.selectAll("*").remove(); gt.selectAll("*").remove();
      linkSel = gl.selectAll("line").data(data.links).join("line")
        .attr("stroke", l => l.kind === "theme" ? l.color : l.kind === "case" ? "var(--muted)" : "var(--navy)")
        .attr("stroke-opacity", l => l.kind === "theme" ? (mode === "focus" ? 0.45 : 0.1) : l.kind === "case" ? 0.5 : 0.55)
        .attr("stroke-width", l => l.kind === "xref" ? 1.5 : 1)
        .attr("stroke-dasharray", l => l.kind === "case" ? "3,3" : null);
      nodeSel = gn.selectAll("path").data(data.nodes).join("path")
        .attr("d", n => d3.symbol().type(n.kind === "case" ? d3.symbolDiamond : n.kind === "theme" ? d3.symbolCircle : d3.symbolCircle).size(Math.PI * radius(n) ** 2 * (n.kind === "case" ? 1.7 : 1))())
        .attr("fill", fill)
        .attr("stroke", n => mode === "focus" && n.hop === 0 ? "var(--accent)" : "var(--surface)")
        .attr("stroke-width", n => mode === "focus" && n.hop === 0 ? 4 : n.kind === "theme" ? 3 : 1.2)
        .attr("class", "gnode")
        .on("mouseover", (e, n) => { hover(n); tip.style.display = "block"; tip.innerHTML = tipHtml(n); })
        .on("mousemove", e => { const r = canvas.getBoundingClientRect(); tip.style.left = Math.max(4, Math.min(e.clientX - r.left + 14, r.width - 290)) + "px"; tip.style.top = Math.min(e.clientY - r.top + 14, r.height - 80) + "px"; })
        .on("mouseout", () => { hover(null); tip.style.display = "none"; })
        .on("click", (e, n) => { e.stopPropagation(); setFocus(n.id); })
        .on("dblclick", (e, n) => { location.hash = n.kind === "art" ? "#/article/" + n.ref : n.kind === "case" ? "#/case/" + n.ref : "#/theme/" + n.ref; })
        .call(d3.drag()
          .on("start", (e, n) => { n.fx = n.x; n.fy = n.y; })
          .on("drag", (e, n) => { n.fx = n.x = e.x; n.fy = n.y = e.y; position(); })
          .on("end", (e, n) => { if (!(mode === "focus" && n.hop === 0)) { n.fx = null; n.fy = null; } }));
      labelSel = gt.selectAll("text").data(data.nodes).join("text")
        .attr("class", n => n.kind === "theme" || (mode === "focus" && n.hop === 0) ? "hub-label" : "node-label")
        .attr("text-anchor", "middle")
        .text(labelText);
      position();
      applyLabelVisibility();
      fit(false);
      positionLabels();
      syncFilterUi();
      svg.on("click", () => { if (mode === "overview") showOverviewInfo(); });
      renderMode();
      if (mode === "focus") showNodeInfo(data.nodes.find(n => n.hop === 0)); else showOverviewInfo();
      renderLegend();
    }

    function position() {
      linkSel.attr("x1", l => l.source.x).attr("y1", l => l.source.y).attr("x2", l => l.target.x).attr("y2", l => l.target.y);
      nodeSel.attr("transform", n => `translate(${n.x},${n.y})`);
      positionLabels();
    }

    function positionLabels() {
      if (!labelSel || !data) return;
      const u = 1 / k;   // one screen pixel in graph units
      if (mode === "focus") {
        const c = data.nodes.find(n => n.hop === 0);
        labelSel.each(function (n) {
          const el = d3.select(this);
          if (n === c) { el.attr("x", n.x).attr("y", n.y + radius(n) + 16 * u).attr("text-anchor", "middle"); return; }
          const dx = n.x - c.x, dy = n.y - c.y, d = Math.hypot(dx, dy) || 1;
          const r = radius(n) + 5 * u;
          el.attr("x", n.x + dx / d * r).attr("y", n.y + dy / d * r + 3.5 * u).attr("text-anchor", Math.abs(dx / d) < 0.25 ? "middle" : dx > 0 ? "start" : "end");
          if (Math.abs(dx / d) < 0.25) el.attr("y", n.y + (dy > 0 ? r + 9 * u : -r));
        });
      } else {
        labelSel.attr("x", n => n.x).attr("y", n => n.y - radius(n) - (n.kind === "theme" ? 6 : 4) * u);
      }
    }

    function fit(animate, subset) {
      const ns = subset && subset.length ? subset : data.nodes;
      if (!ns.length) return;
      const W = canvas.clientWidth, H = canvas.clientHeight, pad = 40, padX = mode === "focus" ? 170 : subset ? 80 : 40;
      const xs = ns.map(n => n.x), ys = ns.map(n => n.y);
      const x0 = Math.min(...xs) - padX, x1 = Math.max(...xs) + padX, y0 = Math.min(...ys) - pad - 30, y1 = Math.max(...ys) + pad + 10;
      const s = Math.max(0.1, Math.min(subset ? 3 : 2.2, Math.min(W / Math.max(x1 - x0, 1), H / Math.max(y1 - y0, 1))));
      const t = d3.zoomIdentity.translate(W / 2 - s * (x0 + x1) / 2, H / 2 - s * (y0 + y1) / 2).scale(s);
      (animate ? svg.transition().duration(500) : svg).call(zoom.transform, t);
    }

    // ---------------------------------------------------------- legend groups: hover to highlight, click to focus
    let litNodes = null, litLinks = null;
    const isLit = n => litNodes ? litNodes.has(n.id) : null;
    const GROUPS = {
      art: { n: x => x.kind === "art" },
      theme: { n: x => x.kind === "theme" },
      case: { n: x => x.kind === "case" },
      xref: { l: l => l.kind === "xref" },
      themelink: { l: l => l.kind === "theme" },
      caselink: { l: l => l.kind === "case" }
    };
    function groupOf(key) {
      if (GROUPS[key]) return GROUPS[key];
      const [kind, ref] = key.split(/:(.+)/);
      if (kind === "part") return { n: x => x.kind === "art" && x.part === ref };
      if (kind === "tcol") return { n: x => (x.kind === "art" && ((themesOf.get(x.ref) || [])[0] || {}).id === ref) || (x.kind === "theme" && x.ref === ref) };
      return null;
    }
    function light(key) {
      const grp = key && groupOf(key);
      if (!grp || !data) { litNodes = litLinks = null; }
      else {
        litNodes = new Set(); litLinks = new Set();
        if (grp.n) data.nodes.forEach(x => { if (grp.n(x)) litNodes.add(x.id); });
        if (grp.l) data.links.forEach(l => { if (grp.l(l)) { litLinks.add(l); litNodes.add(l.source.id); litNodes.add(l.target.id); } });
        if (grp.n) data.links.forEach(l => { if (litNodes.has(l.source.id) && litNodes.has(l.target.id)) litLinks.add(l); });
      }
      if (!nodeSel) return;
      nodeSel.attr("opacity", x => !litNodes || litNodes.has(x.id) ? 1 : 0.1);
      linkSel.attr("opacity", l => !litLinks || litLinks.has(l) ? 1 : 0.04);
      labelSel.attr("opacity", x => !litNodes || litNodes.has(x.id) ? 1 : 0.08);
      applyLabelVisibility();
      root.querySelectorAll("[data-hl]").forEach(el => el.classList.toggle("on", el.dataset.hl === key && key === sticky));
    }
    function pin(key) {
      sticky = sticky === key ? null : key;
      light(sticky);
      if (sticky && litNodes && litNodes.size) fit(true, data.nodes.filter(x => litNodes.has(x.id)));
      else fit(true);
    }
    root.addEventListener("mouseover", e => { const el = e.target.closest("[data-hl]"); if (el) light(el.dataset.hl); });
    root.addEventListener("mouseout", e => { const el = e.target.closest("[data-hl]"); if (el && !el.contains(e.relatedTarget)) light(sticky); });
    root.addEventListener("focusin", e => { const el = e.target.closest("[data-hl]"); if (el) light(el.dataset.hl); });
    root.addEventListener("focusout", e => { if (e.target.closest("[data-hl]")) light(sticky); });
    root.addEventListener("click", e => { const el = e.target.closest("[data-hl]"); if (el) { e.preventDefault(); pin(el.dataset.hl); } });
    const hl = (key, html) => `<a href="#" class="hl" data-hl="${key}" title="Hover to highlight · click to zoom to these">${html}</a>`;

    function hover(n) {
      if (!n) { light(sticky); return; }
      const nb = new Set([n.id]);
      data.links.forEach(l => { if (l.source.id === n.id) nb.add(l.target.id); if (l.target.id === n.id) nb.add(l.source.id); });
      nodeSel.attr("opacity", x => nb.has(x.id) ? 1 : 0.15);
      linkSel.attr("opacity", l => (l.source.id === n.id || l.target.id === n.id) ? 1 : 0.05);
      labelSel.attr("opacity", x => nb.has(x.id) ? 1 : 0.1).style("display", x => nb.has(x.id) || x.kind === "theme" || mode === "focus" ? null : "none");
    }

    function tipHtml(n) {
      if (n.kind === "art") { const ex = EXPLAIN[n.ref]; return `<b>Art. ${esc(n.ref)}</b> · ${esc(n.title)}${ex ? `<br><span style="opacity:.85">${esc(ex.s)}</span>` : ""}<br><span class="tip-hint">click to focus · double-click to open</span>`; }
      if (n.kind === "case") return `<b>${esc(n.title)}</b> (${n.year})<br><span class="tip-hint">click to focus · double-click to open</span>`;
      return `<b>Theme:</b> ${esc(n.label)}<br><span class="tip-hint">click to focus · double-click to open</span>`;
    }

    function setFocus(id) { state.focus = id; history.replaceState(null, "", focusHash(id)); draw(); }
    function focusHash(id) {
      if (!id) return "#/graph";
      const [kind, ref] = id.split(/:(.+)/);
      return kind === "a" ? `#/graph?focus=${encodeURIComponent(ref)}` : kind === "c" ? `#/graph?case=${encodeURIComponent(ref)}` : `#/graph?theme=${encodeURIComponent(ref)}`;
    }

    function renderMode() {
      if (mode === "overview") {
        const f = filterSummary();
        modeBar.innerHTML = `<span class="mode-pill">Overview</span>${f ? `<span class="mode-pill filt">${esc(f)}</span>` : ""}<span class="muted small">${data.nodes.filter(n => n.kind === "art").length} articles · ${data.links.length} links · zoom in to read labels · click any node to focus</span>`;
      } else {
        const c = data.nodes.find(n => n.hop === 0);
        modeBar.innerHTML = `<button class="back" id="gback">← Overview</button>
          <span class="mode-pill focus">Focus: ${esc(c.kind === "art" ? "Art. " + c.ref : c.label)}</span>
          <span class="seg small-seg"><button data-d="1" class="${state.depth === 1 ? "on" : ""}">1 hop</button><button data-d="2" class="${state.depth === 2 ? "on" : ""}">2 hops</button></span>
          <span class="muted small">${data.nodes.length - 1} connected</span>`;
        modeBar.querySelector("#gback").onclick = () => setFocus(null);
        modeBar.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { state.depth = +b.dataset.d; draw(); });
      }
    }

    function renderLegend() {
      root.querySelector("#glegend").innerHTML =
        hl("art", `<i class="lg-dot"></i>Article`) + hl("theme", `<i class="lg-hub"></i>Theme`) + hl("case", `<i class="lg-dia"></i>Judgment`) +
        hl("xref", `<i class="lg-line solid"></i>Cross-ref`) + hl("caselink", `<i class="lg-line dashed"></i>Interpreted in`);
      light(sticky);
    }

    function showOverviewInfo() {
      info.innerHTML = `<h3>How to read this</h3>
        <p class="small muted">Hover over a highlighted term to light it up in the graph; click it to zoom to it (click again to let go).</p>
        <p>Each small dot is an ${hl("art", "<b>Article</b>")}, sized by how connected it is. Large labelled circles are ${hl("theme", "<b>theme hubs</b>")}; ◆ diamonds are ${hl("case", "<b>landmark judgments</b>")}.</p>
        <p>${hl("xref", "<b>Blue lines</b>")} are explicit cross-references in the constitutional text — e.g. Article 368 referring to Article 13. ${hl("themelink", "Faint coloured lines")} tie an Article to its themes; ${hl("caselink", "dashed lines")} link a judgment to the Articles it interpreted.</p>
        <p><b>Click</b> any node to focus on its neighbourhood; <b>double-click</b> to open it. <b>Reset</b> returns to the whole graph.</p>
        <h3>Try</h3>
        <div>${["21", "32", "368", "356", "246", "14", "279A"].map(x => `<a class="tag" href="${focusHash("a:" + x)}">Art. ${x}</a>`).join("")}
        ${["kesavananda-bharati", "sr-bommai", "puttaswamy-privacy"].filter(id => caseById.has(id)).map(id => `<a class="tag" href="${focusHash("c:" + id)}">${esc(caseById.get(id).short)}</a>`).join("")}</div>
        <h3>${state.colorBy === "part" ? "Colours = Parts" : "Colours = first theme"}</h3>
        ${state.colorBy === "part" ? PARTS.filter(p => !/Omitted/.test(p.title)).map(p => `<div class="small">${hl("part:" + p.id, `<span class="swatch" style="background:${partColor.get(p.id)}"></span>${p.id} — ${esc(p.title)}`)}</div>`).join("")
          : THEMES.map(t => `<div class="small">${hl("tcol:" + t.id, `<span class="swatch" style="background:${t.color}"></span>${esc(t.name)}`)}</div>`).join("")}`;
      light(sticky);
    }

    function showNodeInfo(n) {
      const nb = data.nodes.filter(x => x.hop === 1);
      const grp = kd => nb.filter(x => x.kind === kd);
      const artsHtml = grp("art").sort((a, b) => byId.get(a.ref).idx - byId.get(b.ref).idx)
        .map(x => `<a class="tag" href="${focusHash(x.id)}" title="${esc(x.title)}">${esc(x.ref)}</a>`).join("");
      const casesHtml = grp("case").sort((a, b) => a.year - b.year).map(c => `<li><a href="${focusHash(c.id)}">${esc(c.label)}</a> <span class="muted small">${c.year}</span></li>`).join("");
      const themesHtml = grp("theme").map(t => `<a class="tag" href="${focusHash(t.id)}"><span class="swatch" style="background:${t.color}"></span>${esc(t.label)}</a>`).join("");
      if (n.kind === "art") {
        const a = byId.get(n.ref), ex = EXPLAIN[n.ref];
        const out = (XREFS[n.ref] || []), inn = Object.keys(XREFS).filter(k2 => XREFS[k2].includes(n.ref));
        info.innerHTML = `<div class="info-kicker">Article ${esc(n.ref)} · Part ${a.part.id}</div><h2 style="font-size:18px;margin:2px 0 8px">${esc(a.title)}</h2>
          ${ex ? `<p>${esc(ex.s)}</p>` : ""}
          <p><a class="btn" href="#/article/${encodeURIComponent(n.ref)}">Read the article →</a></p>
          ${out.length ? `<h3>Refers to</h3>${out.map(x => `<a class="tag" href="${focusHash("a:" + x)}">${esc(x)}</a>`).join("")}` : ""}
          ${inn.length ? `<h3>Referred to by</h3>${inn.map(x => `<a class="tag" href="${focusHash("a:" + x)}">${esc(x)}</a>`).join("")}` : ""}
          ${themesHtml ? `<h3>Themes</h3>${themesHtml}` : ""}
          ${casesHtml ? `<h3>Judgments</h3><ul class="plain-list">${casesHtml}</ul>` : ""}`;
      } else if (n.kind === "case") {
        const c = caseById.get(n.ref);
        info.innerHTML = `<div class="info-kicker">Judgment · ${c.year}</div><h2 style="font-size:18px;margin:2px 0 8px">${esc(c.name)}</h2><p>${esc(c.held)}</p>
          <p><a class="btn" href="#/case/${c.id}">Read the case note →</a></p><h3>Articles interpreted</h3>${artsHtml}`;
      } else {
        const t = THEMES.find(x => x.id === n.ref);
        info.innerHTML = `<div class="info-kicker">Theme</div><h2 style="font-size:18px;margin:2px 0 8px">${esc(t.name)}</h2><p>${esc(t.about)}</p>
          <p><a class="btn" href="#/theme/${t.id}">Open the theme →</a></p><h3>Articles (${grp("art").length})</h3>${artsHtml}`;
      }
    }

    // ---------------------------------------------------------- controls
    const ctl = root.querySelector("#gctl");
    ctl.querySelector("#gx").addEventListener("change", e => { state.xref = e.target.checked; draw(); });
    ctl.querySelector("#gt").addEventListener("change", e => { state.themes = e.target.checked; draw(); });
    ctl.querySelector("#gc").addEventListener("change", e => { state.cases = e.target.checked; draw(); });
    ctl.querySelectorAll("#gcol button").forEach(b => b.addEventListener("click", () => {
      state.colorBy = b.dataset.v; ctl.querySelectorAll("#gcol button").forEach(x => x.classList.toggle("on", x === b));
      nodeSel.attr("fill", fill); if (mode === "overview") showOverviewInfo();
    }));
    ctl.querySelectorAll(".tchip").forEach(b => b.addEventListener("click", () => {
      const t = b.dataset.t;
      state.activeThemes.has(t) ? state.activeThemes.delete(t) : state.activeThemes.add(t);
      b.classList.toggle("on", state.activeThemes.has(t)); draw();
    }));
    const setAll = on => { ctl.querySelectorAll(".tchip").forEach(b => { b.classList.toggle("on", on); on ? state.activeThemes.add(b.dataset.t) : state.activeThemes.delete(b.dataset.t); }); draw(); };
    ctl.querySelector("#gall").addEventListener("click", e => { e.preventDefault(); setAll(true); });
    ctl.querySelector("#gnone").addEventListener("click", e => { e.preventDefault(); setAll(false); });
    root.querySelector("#zin").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1.4);
    root.querySelector("#zout").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.4);
    root.querySelector("#zfit").onclick = () => fit(true);

    const SHOW = {
      all: { xref: true, themes: true, cases: true, help: "Articles, theme hubs and judgments, with every kind of link." },
      articles: { xref: true, themes: false, cases: false, help: "Only Articles linked by cross-references in the text." },
      themes: { xref: false, themes: true, cases: false, help: "Theme hubs and the Articles grouped under them." },
      cases: { xref: false, themes: false, cases: true, help: "Landmark judgments and the Articles they interpreted." }
    };
    const showKey = () => Object.keys(SHOW).find(k2 => SHOW[k2].xref === state.xref && SHOW[k2].themes === state.themes && SHOW[k2].cases === state.cases) || "";
    function filterSummary() {
      const bits = [];
      const sk = showKey();
      if (sk !== "all") bits.push(sk ? { articles: "Articles", themes: "Themes", cases: "Judgments" }[sk] : "Custom links");
      if (state.part) bits.push("Part " + state.part);
      if (state.activeThemes.size !== THEMES.length) bits.push(state.activeThemes.size === 1 ? (THEMES.find(t => state.activeThemes.has(t.id)) || {}).name : state.activeThemes.size + " themes");
      return bits.join(" · ");
    }
    function syncFilterUi() {
      const sk = showKey();
      root.querySelectorAll("#gfshow button").forEach(b => b.classList.toggle("on", b.dataset.v === sk));
      root.querySelector("#gfhelp").textContent = sk ? SHOW[sk].help : "A custom mix of links, set in the side panel.";
      root.querySelector("#gfpart").value = state.part;
      root.querySelector("#gftheme").value = state.activeThemes.size === 1 ? [...state.activeThemes][0] : "";
      ctl.querySelector("#gx").checked = state.xref; ctl.querySelector("#gt").checked = state.themes; ctl.querySelector("#gc").checked = state.cases;
      ctl.querySelectorAll(".tchip").forEach(b => b.classList.toggle("on", state.activeThemes.has(b.dataset.t)));
      ctl.querySelectorAll("#gcol button").forEach(b => b.classList.toggle("on", b.dataset.v === state.colorBy));
      const n = [sk !== "all", !!state.part, state.activeThemes.size !== THEMES.length].filter(Boolean).length;
      root.querySelector("#gfcount").textContent = n ? n : "";
    }
    const pop = root.querySelector("#gfpop"), fbtn = root.querySelector("#gfilter");
    const openPop = on => { pop.hidden = !on; fbtn.setAttribute("aria-expanded", on); fbtn.classList.toggle("on", on); };
    fbtn.onclick = e => { e.stopPropagation(); openPop(pop.hidden); };
    pop.addEventListener("click", e => e.stopPropagation());
    document.addEventListener("click", function closePop(e) { if (!document.body.contains(pop)) return document.removeEventListener("click", closePop); if (!pop.hidden && !pop.contains(e.target)) openPop(false); });
    root.querySelectorAll("#gfshow button").forEach(b => b.onclick = () => { Object.assign(state, { xref: SHOW[b.dataset.v].xref, themes: SHOW[b.dataset.v].themes, cases: SHOW[b.dataset.v].cases }); draw(); });
    root.querySelector("#gfpart").onchange = e => { state.part = e.target.value; draw(); };
    root.querySelector("#gftheme").onchange = e => { const v = e.target.value; state.activeThemes = new Set(v ? [v] : THEMES.map(t => t.id)); draw(); };
    function resetAll() {
      Object.assign(state, { xref: true, themes: true, cases: true, part: "", focus: null, depth: 1, colorBy: "part" });
      state.activeThemes = new Set(THEMES.map(t => t.id));
      history.replaceState(null, "", "#/graph");
      draw(); fit(true);
    }
    root.querySelector("#gfclear").onclick = () => { Object.assign(state, { xref: true, themes: true, cases: true, part: "" }); state.activeThemes = new Set(THEMES.map(t => t.id)); draw(); };
    root.querySelector("#gfdone").onclick = () => openPop(false);
    root.querySelector("#greset").onclick = resetAll;
    root.addEventListener("keydown", e => { if (e.key === "Escape" && !pop.hidden) { openPop(false); fbtn.focus(); } });

    const gq = root.querySelector("#gq");
    function findAndFocus(v) {
      v = v.trim(); if (!v) return;
      let m = v.match(/^(?:art(?:icle)?\.?\s*)?(\d{1,3}[a-z]{0,2})\b/i);
      if (m && byId.has(m[1].toUpperCase())) return setFocus("a:" + m[1].toUpperCase());
      m = v.match(/^Theme:\s*(.+)$/);
      const lv = (m ? m[1] : v).toLowerCase();
      const t = THEMES.find(x => x.name.toLowerCase() === lv || x.name.toLowerCase().includes(lv));
      if (m && t) return setFocus("t:" + t.id);
      const c = CASES.find(x => (x.short || "").toLowerCase() === lv.replace(/\s*\(\d{4}\)$/, "") || x.name.toLowerCase().includes(lv.replace(/\s*\(\d{4}\)$/, "")));
      if (c) return setFocus("c:" + c.id);
      if (t) return setFocus("t:" + t.id);
    }
    gq.addEventListener("change", () => { findAndFocus(gq.value); gq.value = ""; });
    gq.addEventListener("keydown", e => { if (e.key === "Enter") { findAndFocus(gq.value); gq.value = ""; } });

    // single-theme deep link opens focused on that theme hub
    if (!state.focus && params.get("theme")) state.focus = "t:" + params.get("theme");
    draw();
    let rt;
    if (onResize) window.removeEventListener("resize", onResize);
    onResize = () => { clearTimeout(rt); rt = setTimeout(() => { if (document.body.contains(canvas)) { fit(false); positionLabels(); } }, 200); };
    window.addEventListener("resize", onResize);
  }
  let onResize = null;

  window.COI_GRAPH = { mount, stop() { if (sim) sim.stop(); if (onResize) { window.removeEventListener("resize", onResize); onResize = null; } } };
})();
