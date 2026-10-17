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

    /* 移动端：悬浮按钮开合（可拖动）；点其它位置或点目录内链接后收起 */
    const fab = $('#toc-fab');
    if (fab) {
      currentFab = fab;

      const EDGE = 12;      // 距屏幕左右边缘的吸附距离
      const MIN_TOP = 70;   // 不可进入顶栏（主页/文章/天气按钮那一行）
      const clampFab = () => {
        const x = Math.min(innerWidth - fab.offsetWidth - EDGE, Math.max(EDGE, parseFloat(fab.style.left) || 0));
        const y = Math.min(innerHeight - fab.offsetHeight - 24, Math.max(MIN_TOP, parseFloat(fab.style.top) || 0));
        fab.style.left = x + 'px';
        fab.style.top = y + 'px';
      };
      /* 松手后左右吸附，保存位置 */
      const fabSnap = () => {
        const r = fab.getBoundingClientRect();
        const onLeft = (r.left + r.width / 2) < innerWidth / 2;
        fab.style.left = (onLeft ? EDGE : innerWidth - fab.offsetWidth - EDGE) + 'px';
        fab.style.right = 'auto';
        try {
          sessionStorage.setItem('py-tocfab', JSON.stringify({
            x: Math.round(parseFloat(fab.style.left) || 0),
            y: Math.round(parseFloat(fab.style.top) || 0),
          }));
        } catch (err) { /* 忽略 */ }
      };

      /* 恢复上次位置并做边界校正 */
      try {
        const saved = JSON.parse(sessionStorage.getItem('py-tocfab') || 'null');
        if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) &&
            saved.x < innerWidth - 20 && saved.y < innerHeight - 20) {
          fab.style.left = saved.x + 'px';
          fab.style.top = saved.y + 'px';
          fab.style.right = 'auto';
          fab.style.bottom = 'auto';
          clampFab();
        }
      } catch (e) { /* 忽略 */ }

      fab.addEventListener('click', (e) => {
        e.stopPropagation();
        if (fab.dataset.dragged === '1') { delete fab.dataset.dragged; return; }  // 拖动结束不触发开合
        currentPanel.classList.toggle('fab-open');
        /* 面板跟随按钮所在的一侧弹出 */
        if (currentPanel.classList.contains('fab-open') && innerWidth <= 960) {
          const r = fab.getBoundingClientRect();
          const onLeft = (r.left + r.width / 2) < innerWidth / 2;
          currentPanel.style.left = onLeft ? '16px' : 'auto';
          currentPanel.style.right = onLeft ? 'auto' : '16px';
        }
        clampFab();
      });

      /* 拖动（触摸 / 鼠标通用）：document 级监听；纵向不可进入顶栏，松手左右吸附（带过渡） */
      fab.addEventListener('pointerdown', (e) => {
        if (innerWidth > 960) return;
        e.preventDefault();   // 防止拖动时选中页面文字
        fab.classList.remove('snapping');   // 拖动时紧跟手指
        const startX = e.clientX;
        const startY = e.clientY;
        const rect = fab.getBoundingClientRect();
        const offX = startX - rect.left;
        const offY = startY - rect.top;
        let moved = false;
        const move = (ev) => {
          if (!moved && Math.abs(ev.clientX - startX) < 6 && Math.abs(ev.clientY - startY) < 6) return;
          moved = true;
          const nx = Math.min(innerWidth - fab.offsetWidth - EDGE, Math.max(EDGE, ev.clientX - offX));
          const ny = Math.min(innerHeight - fab.offsetHeight - 24, Math.max(MIN_TOP, ev.clientY - offY));
          fab.style.left = nx + 'px';
          fab.style.top = ny + 'px';
          fab.style.right = 'auto';
          fab.style.bottom = 'auto';
        };
        const up = () => {
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', up);
          document.removeEventListener('pointercancel', up);
          if (moved) {
            fab.dataset.dragged = '1';
            fab.classList.add('snapping');   // 吸附过渡
            fabSnap();
            setTimeout(() => fab.classList.remove('snapping'), 380);
          }
        };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
        document.addEventListener('pointercancel', up);
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
