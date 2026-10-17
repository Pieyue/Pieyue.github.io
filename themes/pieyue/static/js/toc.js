/* ==========================================================================
   toc.js —— 文章目录：章节折叠 + 滚动高亮 + 移动端展开
   ========================================================================== */
(() => {
  const { $, $$ } = window.PY;

  let currentPanel = null;
  let currentFab = null;
  let docBound = false;

  window.PY.pageInits.push(() => {
    const panel = $('.toc-panel');
    const nav = $('#TableOfContents');
    if (!panel || !nav || nav.dataset.init === '1') return;
    nav.dataset.init = '1';
    currentPanel = panel;

    /* 为带子列表的章节加折叠开关 */
    $$('li', nav).forEach((li) => {
      const sub = li.querySelector(':scope > ul');
      if (!sub) return;
      const btn = document.createElement('button');
      btn.className = 'toc-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-label', '折叠/展开章节');
      btn.textContent = '▾';
      li.insertBefore(btn, li.firstChild);
      btn.addEventListener('click', () => {
        li.classList.toggle('collapsed');
        btn.textContent = li.classList.contains('collapsed') ? '▸' : '▾';
      });
    });

    /* 移动端：悬浮按钮开合；点其它位置或点目录内链接后收起 */
    const fab = $('#toc-fab');
    if (fab) {
      currentFab = fab;
      fab.addEventListener('click', (e) => {
        e.stopPropagation();
        currentPanel.classList.toggle('fab-open');
      });
      panel.addEventListener('click', (e) => {
        if (e.target.closest('a') && innerWidth <= 960) panel.classList.remove('fab-open');
      });
      if (!docBound) {
        docBound = true;
        document.addEventListener('click', (e) => {
          if (innerWidth <= 960 && currentPanel && currentPanel.classList.contains('fab-open') &&
              !currentPanel.contains(e.target) && !(currentFab && currentFab.contains(e.target))) {
            currentPanel.classList.remove('fab-open');
          }
        });
      }
    }

    /* 滚动时高亮当前章节 */
    const links = $$('a[href^="#"]', nav);
    const map = new Map();
    links.forEach((a) => {
      const id = decodeURIComponent((a.hash || '').slice(1));
      const h = id && document.getElementById(id);
      if (h) map.set(h, a);
    });
    if (!map.size || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const a = map.get(en.target);
        if (!a) return;
        links.forEach((l) => l.classList.remove('active'));
        a.classList.add('active');
      });
    }, { rootMargin: '-72px 0px -68% 0px', threshold: 0 });
    map.forEach((_, h) => io.observe(h));
  });
})();
