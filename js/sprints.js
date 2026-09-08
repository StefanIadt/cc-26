(async function () {
  const res  = await fetch('data/structure.json');
  const data = await res.json();
  const root = document.getElementById('sprints-root');
  if (!root) return;

  data.years.forEach(function(year) {
    root.appendChild(buildYearSection(year));
  });
})();


function buildYearSection(year) {
  const section = document.createElement('section');
  section.className = 'sb-year';

  const header = document.createElement('div');
  header.className = 'sb-year__header';
  header.innerHTML =
    '<p class="year-card__label">Year ' + year.number + '</p>' +
    '<h2 class="year-card__theme">' + year.theme + '</h2>' +
    '<p class="year-card__subtitle">' + year.subtitle + '</p>';
  section.appendChild(header);

  const body = document.createElement('div');
  body.className = 'sb-year__body';

  if (year.streams) {
    // Stream headers span full grid width; cards sit directly in the grid
    year.streams.forEach(function(stream) {
      const streamHeader = document.createElement('p');
      streamHeader.className = 'sb-stream__name';
      streamHeader.textContent = stream.name;
      body.appendChild(streamHeader);

      stream.items.forEach(function(item) {
        if (item.type === 'sprint') body.appendChild(buildSprintCard(item));
      });
    });
  } else {
    year.items.forEach(function(item) {
      if (item.type === 'sprint') body.appendChild(buildSprintCard(item));
    });
  }

  section.appendChild(body);
  return section;
}


function buildSprintCard(sprint) {
  const card = document.createElement('article');
  card.className = 'sb-card';

  const body = document.createElement('div');
  body.className = 'sb-card__body';

  // Sprint number + name + module
  const heading = document.createElement('div');
  heading.className = 'sb-card__heading';
  heading.innerHTML =
    '<span class="sprint-item__label" aria-hidden="true">Sprint ' + sprint.number + '</span>' +
    '<h3 class="sprint-item__name">' + sprint.name + '</h3>' +
    '<span class="sprint-item__tagline">' + sprint.module + '</span>';
  body.appendChild(heading);

  // What you build
  if (sprint.build) {
    const buildEl = document.createElement('p');
    buildEl.className = 'sb-card__build';
    buildEl.textContent = sprint.build;
    body.appendChild(buildEl);
  }

  // Moving parts
  if (sprint.parts && sprint.parts.length) {
    const partsWrap = document.createElement('div');
    partsWrap.className = 'sb-card__parts';

    const partsLabel = document.createElement('p');
    partsLabel.className = 'sb-card__parts-label';
    partsLabel.textContent = 'Moving parts';
    partsWrap.appendChild(partsLabel);

    const list = document.createElement('ul');
    list.className = 'sb-card__parts-list';
    sprint.parts.forEach(function(part) {
      const li = document.createElement('li');
      li.textContent = part;
      list.appendChild(li);
    });
    partsWrap.appendChild(list);
    body.appendChild(partsWrap);
  }

  // The constraint
  if (sprint.constraint) {
    const constraintEl = document.createElement('p');
    constraintEl.className = 'sb-card__constraint';
    constraintEl.innerHTML =
      '<span class="sb-card__constraint-label">The constraint — </span>' +
      sprint.constraint;
    body.appendChild(constraintEl);
  }

  // Tags
  if (sprint.tags && sprint.tags.length) {
    const tags = document.createElement('ul');
    tags.className = 'sprint-item__tags';
    tags.setAttribute('aria-label', 'Skills');
    sprint.tags.forEach(function(t) {
      const li = document.createElement('li');
      li.className = 'sprint-tag';
      li.textContent = t;
      tags.appendChild(li);
    });
    body.appendChild(tags);
  }

  card.appendChild(body);
  return card;
}
