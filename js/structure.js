(async function () {
  const res  = await fetch('data/structure.json');
  const data = await res.json();
  const root = document.getElementById('structure-root');
  if (!root) return;

  root.appendChild(buildCalendar(data));

  const grid = document.createElement('div');
  grid.className = 'year-grid';
  data.years.forEach(function (year) {
    grid.appendChild(buildYearCard(year));
  });
  root.appendChild(grid);
})();


/* ── Calendar ── */

function buildCalendar(data) {
  const y1   = data.years[0].items.filter(function(i) { return i.type === 'sprint'; });
  const y2   = data.years[1].items.filter(function(i) { return i.type === 'sprint'; });
  const y3fe = data.years[2].streams[0].items.filter(function(i) { return i.type === 'sprint'; });
  const y3be = data.years[2].streams[1].items.filter(function(i) { return i.type === 'sprint'; });
  const y4   = data.years[3].items.filter(function(i) { return i.type === 'sprint'; });

  const details = document.createElement('details');
  details.className = 'sprint-calendar';

  const summary = document.createElement('summary');
  summary.className = 'sprint-calendar__toggle';
  summary.textContent = 'Sprint calendar — all 20 sprints at a glance';
  details.appendChild(summary);

  const scroll = document.createElement('div');
  scroll.className = 'sprint-calendar__scroll';

  const calGrid = document.createElement('div');
  calGrid.className = 'sprint-calendar__grid';

  calHeader(calGrid);

  calRow(calGrid, 'Year 1', data.years[0].theme, [
    cc('sprint', y1[0]), cc('sprint', y1[1]), cc('sprint', y1[2]), cc('empty'),
    cc('break'),
    cc('sprint', y1[3]), cc('sprint', y1[4]), cc('sprint', y1[5]), cc('empty'),
    cc('end'),
  ]);

  calRow(calGrid, 'Year 2', data.years[1].theme, [
    cc('sprint', y2[0]), cc('sprint', y2[1]), cc('sprint', y2[2]), cc('empty'),
    cc('break'),
    cc('sprint', y2[3]), cc('sprint', y2[4]), cc('sprint', y2[5]), cc('empty'),
    cc('end'),
  ]);

  calRow(calGrid, 'Year 3', 'Frontend + Experience', [
    cc('sprint', y3fe[0]), cc('sprint', y3fe[1]), cc('sprint', y3fe[2]), cc('sprint', y3fe[3]),
    cc('break'),
    cc('placement', null, 4),
    cc('end'),
  ]);

  calRow(calGrid, '', 'Backend + Systems', [
    cc('sprint', y3be[0]), cc('sprint', y3be[1]), cc('sprint', y3be[2]), cc('sprint', y3be[3]),
    cc('break'),
    cc('placement', null, 4),
    cc('end'),
  ]);

  calRow(calGrid, 'Year 4', data.years[3].theme, [
    cc('sprint', y4[0]), cc('sprint', y4[1]), cc('empty'), cc('empty'),
    cc('break'),
    cc('sprint', y4[2]), cc('sprint', y4[3]), cc('empty'), cc('empty'),
    cc('end'),
  ]);

  scroll.appendChild(calGrid);
  details.appendChild(scroll);
  return details;
}

function cc(type, sprint, span) {
  return { type: type, sprint: sprint || null, span: span || 1 };
}

function calHeader(grid) {
  grid.appendChild(document.createElement('div'));

  const s1 = document.createElement('div');
  s1.className = 'cal-header';
  s1.textContent = 'Semester 1';
  s1.style.gridColumn = 'span 4';
  grid.appendChild(s1);

  grid.appendChild(document.createElement('div'));

  const s2 = document.createElement('div');
  s2.className = 'cal-header';
  s2.textContent = 'Semester 2';
  s2.style.gridColumn = 'span 4';
  grid.appendChild(s2);

  grid.appendChild(document.createElement('div'));
}

function calRow(grid, yearLabel, trackLabel, cells) {
  const label = document.createElement('div');
  label.className = 'cal-row-label';
  if (yearLabel) {
    const y = document.createElement('span');
    y.className = 'cal-row-label__year';
    y.textContent = yearLabel;
    label.appendChild(y);
  }
  const t = document.createElement('span');
  t.className = 'cal-row-label__track';
  t.textContent = trackLabel;
  label.appendChild(t);
  grid.appendChild(label);

  cells.forEach(function(c) {
    const el = buildCalCell(c);
    if (c.span > 1) el.style.gridColumn = 'span ' + c.span;
    grid.appendChild(el);
  });
}

function buildCalCell(c) {
  const el = document.createElement('div');
  el.className = 'cal-cell cal-cell--' + c.type;

  if (c.type === 'sprint') {
    const s = c.sprint;
    el.innerHTML =
      '<span class="cal-sprint__num">Sprint ' + s.number + '</span>' +
      '<span class="cal-sprint__name">' + s.name + '</span>' +
      '<span class="cal-sprint__tagline">' + s.tagline + '</span>';
  } else if (c.type === 'placement') {
    el.innerHTML =
      '<span class="cal-sprint__num">Placement</span>' +
      '<span class="cal-sprint__name">20 ECTS</span>' +
      '<span class="cal-sprint__tagline">Sprint portfolio continues remotely</span>';
  }

  return el;
}


/* ── Year cards ── */

function buildYearCard(year) {
  const card = document.createElement('div');
  card.className = 'year-card';

  const header = document.createElement('div');
  header.className = 'year-card__header';
  header.innerHTML = `
    <p class="year-card__label">Year ${year.number}</p>
    <h2 class="year-card__theme">${year.theme}</h2>
    <p class="year-card__subtitle">${year.subtitle}</p>
  `;
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'year-card__body';

  if (year.streams) {
    const streamsEl = document.createElement('div');
    streamsEl.className = 'year-card__streams';
    year.streams.forEach(function (stream) {
      streamsEl.appendChild(buildStream(stream));
    });
    body.appendChild(streamsEl);
  } else {
    year.items.forEach(function (item) {
      body.appendChild(buildItem(item));
    });
  }

  card.appendChild(body);
  return card;
}

function buildStream(stream) {
  const el = document.createElement('div');
  el.className = 'year-stream';

  const header = document.createElement('p');
  header.className = 'year-stream__name';
  header.textContent = stream.name;
  el.appendChild(header);

  stream.items.forEach(function (item) {
    el.appendChild(buildItem(item));
  });

  return el;
}

function buildItem(item) {
  if (item.type === 'sprint')     return buildSprint(item);
  if (item.type === 'semester')   return buildDivider(item.label, 'semester');
  if (item.type === 'break')      return buildDivider(item.label, 'break');
  if (item.type === 'assessment') return buildDivider(item.label, 'assessment');
  if (item.type === 'placement')  return buildDivider(item.label, 'placement');
  return document.createTextNode('');
}

function buildSprint(sprint) {
  const el = document.createElement('div');
  el.className = 'sprint-item';
  el.innerHTML = `
    <p class="sprint-item__label">Sprint ${sprint.number}</p>
    <p class="sprint-item__name">${sprint.name}</p>
    <p class="sprint-item__tagline">${sprint.tagline}</p>
    <ul class="sprint-item__tags" aria-label="Skills">
      ${sprint.tags.map(t => `<li class="sprint-tag">${t}</li>`).join('')}
    </ul>
  `;
  return el;
}

function buildDivider(label, kind) {
  const el = document.createElement('p');
  el.className = `structure-divider structure-divider--${kind}`;
  el.textContent = label;
  return el;
}
