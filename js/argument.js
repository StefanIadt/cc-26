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
})();
