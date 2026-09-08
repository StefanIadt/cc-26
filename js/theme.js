/* ============================================================
   CC 26 – THEME TOGGLE
   Reads/writes localStorage. Applies data-theme to <html>.
   Loaded with defer — DOM is fully parsed when this runs.
============================================================ */

(function () {
  const KEY  = 'cc26-theme';
  const html = document.documentElement;

  function isDark() {
    return html.dataset.theme === 'dark' ||
      (!html.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function syncButtons() {
    const dark = isDark();
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(dark));
      const icon = btn.querySelector('[aria-hidden]');
      if (icon) icon.textContent = dark ? '☀' : '☽';
    });
  }

  /* Apply saved preference before first paint */
  const saved = localStorage.getItem(KEY);
  if (saved) html.dataset.theme = saved;

  /* Wire toggle buttons */
  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const dark = !isDark();
      html.dataset.theme = dark ? 'dark' : 'light';
      localStorage.setItem(KEY, dark ? 'dark' : 'light');
      syncButtons();
    });
  });

  /* Set initial button state to match actual theme */
  syncButtons();

  /* Mark the active nav link based on the current filename */
  var filename = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav__link').forEach(function (a) {
    if (a.getAttribute('href') === filename) {
      a.setAttribute('aria-current', 'page');
    }
  });
})();
