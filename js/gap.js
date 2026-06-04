/* ============================================================
   IADT DEGREE PROPOSAL – GAP PAGE
   Canvas matrix, tooltip, sortable table
   Depends on: data/programmes.json
============================================================ */

(async function () {

  /* ── Load data ── */
  const DATA = await fetch("data/programmes.json").then(r => r.json());

  /* ── Read CSS tokens – single source of truth ── */
  const styles = getComputedStyle(document.documentElement);
  const token  = name => styles.getPropertyValue(name).trim();

  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  /* Dot colours read from CSS custom properties – no hardcoding */
  function dotColor(type) {
    const map = {
      university: token("--color-dot-university"),
      tu:         token("--color-dot-tu"),
      other:      token("--color-dot-other"),
      iadt:       token("--color-dot-iadt"),
      proposed:   token("--color-dot-proposed"),
    };
    return map[type] ?? map.other;
  }

  /* ── CAO radius scaling ── */
  const caos   = DATA.filter(d => d.cao_points).map(d => d.cao_points);
  const minCao = Math.min(...caos);
  const maxCao = Math.max(...caos);

  function radius(cao, scale) {
    if (!cao) return 5 * scale;
    return (5 + ((cao - minCao) / (maxCao - minCao)) * 9) * scale;
  }

  /* ── Canvas setup ── */
  const canvas = document.getElementById("matrix");
  const ctx    = canvas.getContext("2d");
  const PAD    = { top: 40, right: 40, bottom: 70, left: 70 };

  function plotCoords(x, y, W, H) {
    const pW = W - PAD.left - PAD.right;
    const pH = H - PAD.top  - PAD.bottom;
    return {
      cx: PAD.left + ((x - 1) / 9) * pW,
      cy: PAD.top  + ((10 - y) / 9) * pH,
    };
  }

  /* ── Draw ── */
  function draw() {
    const W = canvas.width, H = canvas.height, sc = W / 1200;

    ctx.clearRect(0, 0, W, H);

    /* Background */
    ctx.fillStyle = token("--color-bg");
    ctx.fillRect(0, 0, W, H);

    /* Grid */
    ctx.strokeStyle = token("--color-border");
    ctx.lineWidth = 0.5 * sc;
    for (let i = 1; i <= 10; i++) {
      const { cx } = plotCoords(i, 1, W, H);
      ctx.beginPath(); ctx.moveTo(cx, PAD.top); ctx.lineTo(cx, H - PAD.bottom); ctx.stroke();
      const { cy } = plotCoords(1, i, W, H);
      ctx.beginPath(); ctx.moveTo(PAD.left, cy); ctx.lineTo(W - PAD.right, cy); ctx.stroke();
    }

    /* Gap zone highlight */
    const zx1 = plotCoords(5.5, 1, W, H).cx;
    const zx2 = plotCoords(10,  1, W, H).cx + 2;
    const zy1 = plotCoords(1, 10, W, H).cy - 2;
    const zy2 = plotCoords(1, 5.5, W, H).cy;

    ctx.fillStyle   = dark ? "rgba(200,255,0,0.04)" : "rgba(200,255,0,0.12)"; /* accent tint – no token for alpha variants */
    ctx.strokeStyle = dark ? "rgba(200,255,0,0.18)" : "rgba(160,200,0,0.5)"; /* accent stroke – no token for alpha variants */
    ctx.lineWidth   = 1 * sc;
    ctx.setLineDash([4 * sc, 4 * sc]);
    ctx.beginPath();
    ctx.rect(zx1, zy1, zx2 - zx1, zy2 - zy1);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    /* Zone label */
    ctx.font      = `500 ${11 * sc}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = dark ? "rgba(200,255,0,0.5)" : "rgba(70,90,0,0.5)"; /* zone label – alpha variant */
    ctx.textAlign = "right";
    ctx.fillText("unoccupied", (W - PAD.right) - 6 * sc, PAD.top + 18 * sc);

    /* Axis ticks */
    ctx.font      = `400 ${10 * sc}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = token("--color-muted");
    ctx.textAlign = "center";
    for (let i = 1; i <= 10; i++) {
      const { cx } = plotCoords(i, 1, W, H);
      ctx.fillText(i, cx, H - PAD.bottom + 18 * sc);
      const { cy } = plotCoords(1, i, W, H);
      ctx.textAlign = "right";
      ctx.fillText(i, PAD.left - 8 * sc, cy + 4 * sc);
      ctx.textAlign = "center";
    }

    /* Axis labels */
    ctx.font      = `500 ${11 * sc}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = token("--color-text");
    ctx.textAlign = "center";
    ctx.fillText("TECHNICAL DEPTH →", W / 2, H - 12 * sc);
    ctx.save();
    ctx.translate(16 * sc, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("← CREATIVE AMBITION", 0, 0);
    ctx.restore();

    /* Dots – render in type order so IADT/proposed render on top */
    const ORDER = ["university", "tu", "other", "iadt", "proposed"];
    [...DATA]
      .sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type))
      .forEach(d => {
        const { cx, cy } = plotCoords(d.x, d.y, W, H);
        const r = radius(d.cao_points, sc);

        if (d.type === "proposed") {
          /* Diamond */
          ctx.save();
          ctx.translate(cx, cy);
          const s = (r + 4) * 1.4;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.4, -s * 0.4); ctx.lineTo(s, 0);
          ctx.lineTo(s * 0.4,  s * 0.4); ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.4, s * 0.4); ctx.lineTo(-s, 0);
          ctx.lineTo(-s * 0.4, -s * 0.4);
          ctx.closePath();
          ctx.fillStyle   = token("--color-dot-proposed");
          ctx.fill();
          ctx.strokeStyle = token("--color-text");
          ctx.lineWidth   = 1.5 * sc;
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.globalAlpha = d.type === "tu" ? 0.6 : d.type === "other" ? 0.5 : 0.85;
          ctx.fillStyle   = dotColor(d.type);
          ctx.fill();
          ctx.globalAlpha = 1;

          /* Asterisk on IADT */
          if (d.type === "iadt") {
            ctx.font      = `700 ${22 * sc}px Inter, system-ui, sans-serif`;
            ctx.fillStyle = token("--color-orange"); /* asterisk on IADT dot */
            ctx.textAlign = "left";
            ctx.fillText("*", cx + r + 2 * sc, cy - r * 0.2);
          }
        }
      });
  }

  draw();
  new ResizeObserver(() => draw()).observe(canvas);

  /* ── Row expand/collapse ── */
  function toggleRow(row) {
    const panelRow = document.getElementById("panel-" + row.id);
    if (!panelRow) return;
    const isOpen = row.dataset.open === "true";
    row.dataset.open = isOpen ? "false" : "true";
    row.setAttribute("aria-expanded", String(!isOpen));
    panelRow.hidden = isOpen;
  }

  document.getElementById("table-body").addEventListener("click", e => {
    const row = e.target.closest(".prog-row");
    if (row) toggleRow(row);
  });

  document.getElementById("table-body").addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      const row = e.target.closest(".prog-row");
      if (row) { e.preventDefault(); toggleRow(row); }
    }
  });

  /* ── Tooltip ── */
  const tooltip = document.getElementById("tooltip");

  function findHovered(mx, my) {
    const rect  = canvas.getBoundingClientRect();
    const canX  = mx * (canvas.width  / rect.width);
    const canY  = my * (canvas.height / rect.height);
    const W = canvas.width, H = canvas.height;
    let closest = null, minDist = Infinity;

    DATA.forEach(d => {
      const pos  = plotCoords(d.x, d.y, W, H);
      const r    = radius(d.cao_points, W / 1200) + 6;
      const dist = Math.hypot(pos.cx - canX, pos.cy - canY);
      if (dist < r + 8 && dist < minDist) { minDist = dist; closest = d; }
    });

    return closest;
  }

  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const d    = findHovered(e.clientX - rect.left, e.clientY - rect.top);

    if (d) {
      tooltip.innerHTML = `
        <p class="tooltip__name">${d.name}</p>
        <p class="tooltip__inst">${d.institution_full}</p>
        <p class="tooltip__scores">
          <span>Technical: ${d.x}/10</span>
          <span>Creative: ${d.y}/10</span>
        </p>
        ${d.cao_points ? `<p class="tooltip__cao">CAO points: ${d.cao_points}</p>` : ""}
        <p class="tooltip__hint">↓ click row to see modules</p>
      `;
      tooltip.setAttribute("aria-hidden", "false");

      const tW = 240, tH = 110;
      let left = (e.clientX - rect.left) + 14;
      let top  = (e.clientY - rect.top)  - 20;
      if (left + tW > rect.width)  left = (e.clientX - rect.left) - tW - 14;
      if (top  + tH > rect.height) top  = rect.height - tH - 8;
      if (top < 0) top = 8;

      tooltip.style.left = left + "px";
      tooltip.style.top  = top  + "px";
      canvas.style.cursor = "pointer";
    } else {
      tooltip.setAttribute("aria-hidden", "true");
      canvas.style.cursor = "crosshair";
    }
  });

  canvas.addEventListener("mouseleave", () => {
    tooltip.setAttribute("aria-hidden", "true");
  });

  /* Click dot → open matching table row */
  canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const d    = findHovered(e.clientX - rect.left, e.clientY - rect.top);
    if (!d) return;

    const rowId = `row-${d.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
    const row   = document.getElementById(rowId);
    if (!row) return;

    row.scrollIntoView({ behavior: "smooth", block: "center" });
    toggleRow(row);
    row.dataset.highlighted = "true";
    setTimeout(() => delete row.dataset.highlighted, 2000);
  });

  /* ── Module renderer ── */
  function renderModules(d) {
    if (!d.modules || (Array.isArray(d.modules) && d.modules.length === 0)) {
      return d.programme_url
        ? `<p class="u-color-muted">Full module list not publicly available.
             <a class="prog-panel__link" href="${d.programme_url}" target="_blank" rel="noopener noreferrer">
               View programme page ↗
             </a>
           </p>`
        : `<p class="u-color-muted">Module list not yet available.</p>`;
    }

    if (Array.isArray(d.modules)) {
      return `<ul class="module-list">${d.modules.map(m => `<li>${m}</li>`).join("")}</ul>`;
    }

    let html = "";
    for (const [year, content] of Object.entries(d.modules)) {
      const label = year.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      html += `<h3 class="prog-panel__year">${label}</h3>`;

      if (typeof content === "string") {
        html += `<ul class="module-list"><li>${content}</li></ul>`;
      } else if (Array.isArray(content)) {
        html += `<ul class="module-list">${content.map(m => `<li>${m}</li>`).join("")}</ul>`;
      } else if (typeof content === "object") {
        for (const [sem, mods] of Object.entries(content)) {
          const semLabel = sem.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          html += `<h4 class="prog-panel__year prog-panel__year--sem">${semLabel}</h4>`;
          if (Array.isArray(mods)) {
            html += `<ul class="module-list">${mods.map(m => `<li>${m}</li>`).join("")}</ul>`;
          }
        }
      }
    }
    return html;
  }

  /* ── Table ── */
  let sortCol = "cao_points";
  let sortDir = -1;

  function renderTable(sortedData) {
    const tbody = document.getElementById("table-body");

    tbody.innerHTML = sortedData.map(d => {
      const rowId = `row-${d.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

      const xBar = `
        <div class="score-bar">
          <div class="score-bar__track">
            <div class="score-bar__fill" style="width:${d.x * 10}%" data-axis="technical"></div>
          </div>
          <span class="score-num">${d.x}</span>
        </div>`;

      const yBar = `
        <div class="score-bar">
          <div class="score-bar__track">
            <div class="score-bar__fill" style="width:${d.y * 10}%" data-axis="creative"></div>
          </div>
          <span class="score-num">${d.y}</span>
        </div>`;

      const panel = `
        <div class="prog-panel">
          <dl class="prog-panel__meta">
            <div class="prog-panel__meta-item">
              <dt class="prog-panel__meta-label">Full name</dt>
              <dd class="prog-panel__meta-value">${d.full_name}</dd>
            </div>
            <div class="prog-panel__meta-item">
              <dt class="prog-panel__meta-label">Location</dt>
              <dd class="prog-panel__meta-value">${d.location || "–"}</dd>
            </div>
            <div class="prog-panel__meta-item">
              <dt class="prog-panel__meta-label">Award</dt>
              <dd class="prog-panel__meta-value">${d.award || "BSc (Hons)"}</dd>
            </div>
            <div class="prog-panel__meta-item">
              <dt class="prog-panel__meta-label">CAO code</dt>
              <dd class="prog-panel__meta-value">${d.cao_code || "–"}</dd>
            </div>
            <div class="prog-panel__meta-item">
              <dt class="prog-panel__meta-label">Placement</dt>
              <dd class="prog-panel__meta-value">${d.work_placement ? "Yes" : "No"}</dd>
            </div>
          </dl>
          ${d.note ? `<p class="prog-panel__note">${d.note}</p>` : ""}
          <div class="prog-panel__modules">${renderModules(d)}</div>
          ${d.programme_url
            ? `<a class="prog-panel__link" href="${d.programme_url}" target="_blank" rel="noopener noreferrer">
                 View full programme ↗
               </a>`
            : ""}
        </div>`;

      return `
        <tr
          class="prog-row"
          id="${rowId}"
          data-prog-type="${d.type}"
          data-has-note="${d.note ? "true" : "false"}"
          data-open="false"
          tabindex="0"
          aria-expanded="false"
        >
          <td class="prog-cell prog-cell--name">
            <span class="prog-summary__name">${d.name}</span>
          </td>
          <td class="prog-cell prog-cell--inst">${d.institution}</td>
          <td class="prog-cell prog-cell--cao">${d.cao_points ?? "–"}</td>
          <td class="prog-cell">${xBar}</td>
          <td class="prog-cell">${yBar}</td>
        </tr>
        <tr
          class="prog-panel-row"
          id="panel-${rowId}"
          data-prog-type="${d.type}"
          hidden
        >
          <td colspan="5" class="prog-panel-cell">
            ${panel}
          </td>
        </tr>`;
    }).join("");
  }

  function sortData(col) {
    sortDir = sortCol === col ? sortDir * -1 : (col === "name" || col === "institution" ? 1 : -1);
    sortCol = col;

    const sorted = [...DATA].sort((a, b) => {
      let av = a[col] ?? (sortDir === 1 ? Infinity : -Infinity);
      let bv = b[col] ?? (sortDir === 1 ? Infinity : -Infinity);
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return av < bv ? -sortDir : av > bv ? sortDir : 0;
    });

    document.querySelectorAll("thead th").forEach(th => th.setAttribute("aria-sort", "none"));
    const activeHeader = document.querySelector(`[data-col="${col}"]`);
    if (activeHeader) {
      activeHeader.setAttribute("aria-sort", sortDir === 1 ? "ascending" : "descending");
    }

    renderTable(sorted);
  }

  /* Init */
  sortData("cao_points");

  document.querySelectorAll("thead th[data-col]").forEach(th => {
    th.setAttribute("tabindex", "0");
    th.setAttribute("role", "button");
    th.addEventListener("click", () => sortData(th.dataset.col));
    th.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        sortData(th.dataset.col);
      }
    });
  });

})();
