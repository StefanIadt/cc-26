(async function () {
  const res  = await fetch('data/argument.md');
  const text = await res.text();
  const html = marked.parse(text);
  const el   = document.getElementById('argument-content');
  if (!el) return;
  el.innerHTML = html;

  el.querySelectorAll('a[href^="http"]').forEach(function (a) {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  wrapSectionsInLabelRail(el, null);
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
