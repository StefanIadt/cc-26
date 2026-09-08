(async function () {
  const res  = await fetch('data/programmes.json');
  const all  = await res.json();
  const root = document.getElementById('compare-root');
  if (!root) return;

  const usable = all.filter(function(p) {
    const m = p.modules;
    return m && !Array.isArray(m) && (m.year_1 || m.year_2);
  });

  const proposedIdx = usable.findIndex(function(p) { return p.type === 'proposed'; });
  const iadtIdx     = usable.findIndex(function(p) { return p.type === 'iadt'; });
  const tcdIdx      = usable.findIndex(function(p) { return p.institution === 'TCD' && p.x >= 9; });
  const tuIdx       = usable.findIndex(function(p) {
    return p.institution === 'TU Dublin' && p.name.includes('Information Technology');
  });
  const defaults = [proposedIdx, iadtIdx, tcdIdx, tuIdx].filter(function(i) { return i >= 0; });

  // Draggable order for non-pinned columns
  var columnOrder = usable.map(function(_, i) { return i; })
    .filter(function(i) { return i !== iadtIdx && i !== proposedIdx; });

  root.innerHTML = '';
  const gridWrap = document.createElement('div');
  gridWrap.className = 'compare-grid-wrap';

  function getActive() {
    var active = [];
    picker.querySelectorAll('.compare-chip').forEach(function(btn) {
      if (btn.getAttribute('aria-pressed') === 'true') {
        active.push(parseInt(btn.dataset.idx, 10));
      }
    });
    return active;
  }

  function reorder(fromIdx, toIdx) {
    var f = columnOrder.indexOf(fromIdx);
    var t = columnOrder.indexOf(toIdx);
    if (f !== -1 && t !== -1 && f !== t) {
      columnOrder.splice(f, 1);
      columnOrder.splice(t, 0, fromIdx);
      rerender();
    }
  }

  function rerender() {
    renderGrid(gridWrap, usable, getActive(), columnOrder, iadtIdx, proposedIdx, reorder);
  }

  const picker = buildPicker(usable, defaults, proposedIdx, iadtIdx, rerender);

  root.appendChild(picker);
  root.appendChild(gridWrap);
  renderGrid(gridWrap, usable, defaults, columnOrder, iadtIdx, proposedIdx, reorder);
  root.appendChild(buildLegend());

  // Handle ?show=CAOCODE from gap page — activate that programme's chip
  var showCode = new URLSearchParams(location.search).get('show');
  if (showCode) {
    var matchIdx = usable.findIndex(function(p) {
      return p.cao_code === showCode || p.type === showCode;
    });
    if (matchIdx >= 0) {
      var chip = picker.querySelector('[data-idx="' + matchIdx + '"]');
      if (chip && chip.getAttribute('aria-pressed') !== 'true') {
        chip.setAttribute('aria-pressed', 'true');
        chip.classList.add('compare-chip--active');
        rerender();
      }
      if (chip) chip.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
})();


/* ── Picker ── */

function buildPicker(progs, defaults, proposedIdx, iadtIdx, onToggle) {
  const wrap = document.createElement('div');
  wrap.className = 'compare-picker';

  const label = document.createElement('p');
  label.className = 'compare-picker__label';
  label.textContent = 'Show / hide:';
  wrap.appendChild(label);

  const chips = document.createElement('div');
  chips.className = 'compare-picker__chips';
  wrap.appendChild(chips);

  // Chip order: iadt first, proposed second, rest in original order
  var chipOrder = progs.map(function(_, i) { return i; })
    .filter(function(i) { return i !== iadtIdx && i !== proposedIdx; });
  if (proposedIdx >= 0) chipOrder.unshift(proposedIdx);
  if (iadtIdx >= 0)     chipOrder.unshift(iadtIdx);

  chipOrder.forEach(function(i) {
    const prog = progs[i];
    const on   = defaults.indexOf(i) !== -1;
    const btn  = document.createElement('button');
    btn.className   = 'compare-chip' + (on ? ' compare-chip--active' : '');
    btn.dataset.idx = i;
    btn.textContent = chipLabel(prog);
    btn.title       = prog.full_name + ' — ' + prog.institution_full;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');

    if (i === proposedIdx) btn.classList.add('compare-chip--cc26');

    btn.addEventListener('click', function() {
      var nowOn = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', nowOn ? 'true' : 'false');
      btn.classList.toggle('compare-chip--active', nowOn);
      onToggle();
    });

    chips.appendChild(btn);
  });

  return wrap;
}

function chipLabel(prog) {
  if (prog.type === 'proposed') return 'CC 26 — Proposed';
  if (prog.type === 'iadt')     return 'IADT — Current';
  return prog.institution + ' ' + shortName(prog.name);
}

function shortName(name) {
  return name
    .replace(/^BSc\s+/i, '')
    .replace(/^BA \(Mod\)\s+/i, '')
    .replace(/^BA\s+/i, '')
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/\s+—.*$/, '')
    .trim();
}


/* ── Grid ── */

function renderGrid(wrap, progs, selected, columnOrder, iadtIdx, proposedIdx, reorder) {
  wrap.innerHTML = '';

  if (selected.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'compare-loading';
    empty.textContent = 'Select at least one programme above to compare.';
    wrap.appendChild(empty);
    return;
  }

  // Column order: Creative Computing always first, CC 26 always second, rest draggable
  var ordered = [];
  if (selected.indexOf(iadtIdx)     !== -1) ordered.push(iadtIdx);
  if (selected.indexOf(proposedIdx) !== -1) ordered.push(proposedIdx);
  columnOrder.forEach(function(idx) {
    if (selected.indexOf(idx) !== -1) ordered.push(idx);
  });

  const scroll = document.createElement('div');
  scroll.className = 'compare-scroll';

  const table = document.createElement('table');
  table.className = 'compare-table';
  table.setAttribute('role', 'grid');

  // Thead
  const thead     = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const yearTh = document.createElement('th');
  yearTh.className = 'compare-th--year';
  yearTh.scope = 'col';
  headerRow.appendChild(yearTh);

  ordered.forEach(function(idx) {
    const prog     = progs[idx];
    const isPinned = idx === iadtIdx || idx === proposedIdx;
    const th = document.createElement('th');
    th.scope = 'col';
    th.className = 'compare-th--prog';
    if (prog.type === 'proposed') th.classList.add('compare-th--pinned');
    if (!isPinned) {
      th.classList.add('compare-th--draggable');
      th.setAttribute('draggable', 'true');
      addDragHandlers(th, idx, reorder);
    }

    var gapKey  = prog.cao_code || prog.type;
    var gapHref = 'index.html?q=' + encodeURIComponent(gapKey);

    th.innerHTML =
      (!isPinned ? '<span class="drag-handle" aria-hidden="true">⠿</span>' : '') +
      '<span class="compare-prog__name">' + headerProgName(prog) + '</span>' +
      '<span class="compare-prog__inst">' + prog.institution + '</span>' +
      '<span class="compare-prog__scores">' +
        '<span class="compare-prog__score">' +
          '<span class="compare-prog__score-key">Technical depth</span>' +
          '<strong class="compare-prog__score-val">' + prog.x + '</strong>' +
        '</span>' +
        '<span class="compare-prog__score">' +
          '<span class="compare-prog__score-key">Creative ambition</span>' +
          '<strong class="compare-prog__score-val">' + prog.y + '</strong>' +
        '</span>' +
      '</span>' +
      '<a class="compare-prog__gap-link" href="' + gapHref + '">See on map ↗</a>';

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Tbody
  const tbody = document.createElement('tbody');
  const years = [
    { key: 'year_1', label: 'Year 1' },
    { key: 'year_2', label: 'Year 2' },
    { key: 'year_3', label: 'Year 3' },
    { key: 'year_4', label: 'Year 4' },
  ];

  years.forEach(function(year) {
    const tr = document.createElement('tr');
    tr.className = 'compare-row';

    const yearTh = document.createElement('th');
    yearTh.scope     = 'row';
    yearTh.className = 'compare-year-label';
    yearTh.textContent = year.label;
    tr.appendChild(yearTh);

    ordered.forEach(function(idx) {
      const prog = progs[idx];
      const sems = semModules(prog.modules, year.key);
      const td   = document.createElement('td');
      td.className = 'compare-cell';
      if (prog.type === 'proposed') td.classList.add('compare-cell--pinned');

      var hasAny = sems.s1.length || sems.s2.length || sems.unsorted.length;

      if (!hasAny) {
        td.innerHTML = '<span class="compare-cell__empty">—</span>';
      } else if (!sems.s1.length && !sems.s2.length) {
        // Flat data — no semester structure
        var tags = document.createElement('div');
        tags.className = 'compare-tags';
        sems.unsorted.forEach(function(mod) { tags.appendChild(buildModTag(mod)); });
        td.appendChild(tags);
      } else {
        // Semester groups
        [['s1', 'S1'], ['s2', 'S2']].forEach(function(pair) {
          var key = pair[0], semLabel = pair[1];
          if (!sems[key].length) return;
          var group = document.createElement('div');
          group.className = 'compare-sem';
          var lbl = document.createElement('p');
          lbl.className = 'compare-sem__label';
          lbl.textContent = semLabel;
          group.appendChild(lbl);
          var tags = document.createElement('div');
          tags.className = 'compare-tags';
          sems[key].forEach(function(mod) { tags.appendChild(buildModTag(mod)); });
          group.appendChild(tags);
          td.appendChild(group);
        });
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  scroll.appendChild(table);
  wrap.appendChild(scroll);
}

function addDragHandlers(th, idx, reorder) {
  th.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
    th.classList.add('compare-th--dragging');
  });

  th.addEventListener('dragend', function() {
    th.classList.remove('compare-th--dragging');
  });

  th.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    th.classList.add('compare-th--dragover');
  });

  th.addEventListener('dragleave', function() {
    th.classList.remove('compare-th--dragover');
  });

  th.addEventListener('drop', function(e) {
    e.preventDefault();
    th.classList.remove('compare-th--dragover');
    var fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIdx) && fromIdx !== idx) {
      reorder(fromIdx, idx);
    }
  });
}

function headerProgName(prog) {
  if (prog.type === 'proposed') return 'CC 26';
  if (prog.type === 'iadt')     return 'Creative Computing';
  return shortName(prog.name);
}


/* ── Module helpers ── */

function semModules(modules, yearKey) {
  var empty = { s1: [], s2: [], unsorted: [] };
  if (!modules || Array.isArray(modules)) return empty;
  var year = modules[yearKey];
  if (!year) return empty;

  if (Array.isArray(year)) {
    return { s1: [], s2: [], unsorted: splitElectives(year.filter(Boolean)) };
  }

  // Semester structure: { semester_1: [...], semester_2: [...] }
  return {
    s1:       splitElectives((year.semester_1 || []).filter(Boolean)),
    s2:       splitElectives((year.semester_2 || []).filter(Boolean)),
    unsorted: [],
  };
}

function splitElectives(arr) {
  var out = [];
  arr.forEach(function(mod) {
    if (mod.indexOf(' / ') !== -1) {
      mod.split(' / ').forEach(function(p) { var t = p.trim(); if (t) out.push(t); });
    } else {
      out.push(mod);
    }
  });
  return out;
}

function buildModTag(name) {
  const el = document.createElement('span');
  el.className = 'mod-tag mod-tag--' + categorize(name);
  el.textContent = name;
  el.title = name;
  return el;
}

const CAT_RULES = [
  { cat: 'design',       re: /design|ux|user.?experience|prototyp|creative.?cod|creative|visual|media|figma|interaction|animation|motion|typography|film|photograph|art\b/i },
  { cat: 'theory',       re: /math|calculus|discrete|statistic|formal|algorithm|complexity|automata|logic|proof|combinat|cryptograph|computer.?science\b/i },
  { cat: 'data',         re: /\bdata\b|database|analytic|machine.?learn|artificial.?intel|\bai\b|deep.?learn|neural|natural.?lang|\bnlp\b/i },
  { cat: 'systems',      re: /network|cloud|security|infrastructure|operating.?system|devops|cyber|hardware|embedded|iot|distributed|protocol|physical.?interact|physical/i },
  { cat: 'professional', re: /business|entrepren|professional|placement|work.?based|industry|employab|career|ethics|law|project.?manage|research|writing|exhibition/i },
];

function categorize(name) {
  for (var i = 0; i < CAT_RULES.length; i++) {
    if (CAT_RULES[i].re.test(name)) return CAT_RULES[i].cat;
  }
  return 'engineering';
}


/* ── Legend ── */

function buildLegend() {
  const items = [
    { cat: 'design',       label: 'Design / Creative' },
    { cat: 'engineering',  label: 'Engineering / Programming' },
    { cat: 'theory',       label: 'Theory / Mathematics' },
    { cat: 'data',         label: 'Data / AI' },
    { cat: 'systems',      label: 'Networks / Systems' },
    { cat: 'professional', label: 'Professional / Project' },
  ];
  const wrap = document.createElement('div');
  wrap.className = 'compare-legend';
  items.forEach(function(item) {
    const el = document.createElement('div');
    el.className = 'compare-legend__item';
    el.innerHTML =
      '<span class="mod-tag mod-tag--' + item.cat + '" aria-hidden="true">&nbsp;&nbsp;&nbsp;</span>' +
      item.label;
    wrap.appendChild(el);
  });
  return wrap;
}
