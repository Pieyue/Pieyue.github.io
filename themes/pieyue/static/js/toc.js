/* ==========================================================================
   toc.js —— 文章目录：章节折叠 + 滚动高亮 + 移动端展开
   ========================================================================== */
(() => {
  const { $, $$ } = window.PY;

  window.PY.pageInits.push(() => {
    const panel = $('.toc-panel');
    const nav = $('#TableOfContents');
    if (!panel || !nav || nav.dataset.init === '1') return;
    nav.dataset.init = '1';

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

    /* 移动端：点击「目录」标题展开/收起 */
    const head = $('.toc-head', panel);
    if (head) {
      head.addEventListener('click', () => panel.classList.toggle('open'));
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
