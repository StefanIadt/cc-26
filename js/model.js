(async function () {
  const res  = await fetch('data/programme-model.md');
  const text = await res.text();
  const html = marked.parse(text);
  const el   = document.getElementById('model-content');
  if (!el) return;
  el.innerHTML = html;

  el.querySelectorAll('a[href^="http"]').forEach(function (a) {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  // The h2 immediately after h1 is the intro tagline — styled via CSS sibling
  // selectors (.model-body > h1 + h2). Mark it so the label-rail wrapper skips it
  // and leaves it as a direct child of the article.
  const h1 = el.querySelector('h1');
  if (h1) {
    const next = h1.nextElementSibling;
    if (next && next.tagName === 'H2') next.classList.add('model-intro-skip');
  }

  wrapSectionsInLabelRail(el, 'model-intro-skip');

  // Markdown tables have no wrapper — give each one a scroll container.
  el.querySelectorAll('table').forEach(function (table) {
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // A paragraph that is ONLY a bold label (e.g. "**Staff**") should read as
  // a mini-heading. CSS :only-child can't detect this reliably — it ignores
  // text-node siblings, so "**Bold** trailing text" would false-match.
  el.querySelectorAll('p').forEach(function (p) {
    if (
      p.children.length === 1 &&
      p.firstElementChild.tagName === 'STRONG' &&
      p.textContent.trim() === p.firstElementChild.textContent.trim()
    ) {
      p.classList.add('is-label');
    }
  });
})();

function wrapSectionsInLabelRail(container, skipClass) {
  const children = Array.from(container.children);
  const output   = [];
  let current    = null;

  for (const node of children) {
    if (node.tagName === 'H2' && !(skipClass && node.classList.contains(skipClass))) {
      if (current) output.push(buildLabelRail(current.heading, current.nodes));
      current = { heading: node, nodes: [] };
    } else if (current) {
      current.nodes.push(node);
    } else {
      output.push(node);
    }
  }
  if (current) output.push(buildLabelRail(current.heading, current.nodes));

  container.innerHTML = '';
  output.forEach(function (n) { container.appendChild(n); });
}

function buildLabelRail(heading, nodes) {
  const rail = document.createElement('div');
  rail.className = 'label-rail';
  rail.appendChild(heading);
  const body = document.createElement('div');
  body.className = 'flow';
  nodes.forEach(function (n) { body.appendChild(n); });
  rail.appendChild(body);
  return rail;
}
