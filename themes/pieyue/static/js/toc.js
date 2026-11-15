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

    /* 为带子列表的章节加折叠开关（子列表包一层 .toc-sub 以实现高度过渡） */
    $$('li', nav).forEach((li) => {
      const sub = li.querySelector(':scope > ul');
      if (!sub) return;
      const wrap = document.createElement('div');
      wrap.className = 'toc-sub';
      li.insertBefore(wrap, sub);
      wrap.appendChild(sub);

      const btn = document.createElement('button');
      btn.className = 'toc-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-label', '折叠/展开章节');
      btn.setAttribute('aria-expanded', 'true');
      btn.title = '折叠/展开章节';
      /* 固定向下的三角形：收起时由 CSS 旋转为朝右 */
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8 L20 8 L12 19 Z"/></svg>';
      li.insertBefore(btn, li.firstChild);
      btn.addEventListener('click', () => {
        const collapsed = li.classList.toggle('collapsed');
        btn.setAttribute('aria-expanded', String(!collapsed));
      });
    });

    /* 移动端：悬浮按钮开合（可拖动）；点其它位置或点目录内链接后收起 */
    const fab = $('#toc-fab');
    if (fab) {
      currentFab = fab;

      const EDGE = 12;      // 距屏幕左右边缘的吸附距离
      const MIN_TOP = 70;   // 不可进入顶栏（主页/文章/天气按钮那一行）
      const panelOffset = { dx: 0, dy: 0 };   // 面板打开时相对按钮的偏移（拖动时保持）
      const clampFab = () => {
        /* 无内联 left/top（原始 right/bottom 定位）时，取当前渲染位置钳制，
           不能把缺失值当作 0，否则首次点击按钮会"弹"到左上角 */
        const r = fab.getBoundingClientRect();
        const curL = fab.style.left !== '' ? parseFloat(fab.style.left) : r.left;
        const curT = fab.style.top !== '' ? parseFloat(fab.style.top) : r.top;
        const x = Math.min(innerWidth - fab.offsetWidth - EDGE, Math.max(EDGE, curL));
        const y = Math.min(innerHeight - fab.offsetHeight - 24, Math.max(MIN_TOP, curT));
        fab.style.left = x + 'px';
        fab.style.top = y + 'px';
        fab.style.right = 'auto';
        fab.style.bottom = 'auto';
      };
      /* 松手后左右吸附，保存位置 */
      const fabSnap = () => {
        const r = fab.getBoundingClientRect();
        const onLeft = (r.left + r.width / 2) < innerWidth / 2;
        fab.style.left = (onLeft ? EDGE : innerWidth - fab.offsetWidth - EDGE) + 'px';
        fab.style.right = 'auto';
        placePanel(true);   // 吸附后面板重新贴到按钮旁（带移动动画）
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

      /* 面板紧靠按钮放置（水平/垂直跟随按钮所在一侧），并记录相对偏移供拖动时保持。
         animated=true 时面板位置变化带移动动画（吸附/边界重摆场景） */
      const placePanel = (animated) => {
        const r = fab.getBoundingClientRect();
        const pw = currentPanel.offsetWidth || 286;
        const ph = currentPanel.offsetHeight || 277;
        const onLeft = (r.left + r.width / 2) < innerWidth / 2;
        const onTop = (r.top + r.height / 2) < innerHeight / 2;
        const px = onLeft ? EDGE : innerWidth - pw - EDGE;
        let py = onTop ? r.bottom + 12 : r.top - ph - 12;
        py = Math.max(MIN_TOP + 10, Math.min(innerHeight - ph - 30, py));
        currentPanel.style.transformOrigin = onTop ? 'top center' : 'bottom center';
        if (animated) {
          currentPanel.classList.add('snapping');
          setTimeout(() => currentPanel.classList.remove('snapping'), 420);
        }
        currentPanel.style.left = px + 'px';
        currentPanel.style.top = py + 'px';
        currentPanel.style.right = 'auto';
        currentPanel.style.bottom = 'auto';
        const pr = currentPanel.getBoundingClientRect();
        panelOffset.dx = pr.left - r.left;
        panelOffset.dy = pr.top - r.top;
      };

      /* 拖动刚结束时浏览器会派发 click，短窗口内忽略之（避免误关面板） */
      let dragEndTime = 0;
      fab.addEventListener('click', (e) => {
        e.stopPropagation();
        if (performance.now() - dragEndTime < 150) return;   // 拖动收尾的 click，忽略
        currentPanel.classList.toggle('fab-open');
        if (currentPanel.classList.contains('fab-open') && innerWidth <= 960) placePanel(false);
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
          /* 面板打开时实时跟随按钮（保持相对偏移）；
             面板被推到屏幕边界（明显出界）时自动重摆到有空间的一侧（带移动动画） */
          if (currentPanel.classList.contains('fab-open')) {
            const pw = currentPanel.offsetWidth;
            const ph = currentPanel.offsetHeight;
            const idealX = nx + panelOffset.dx;
            const idealY = ny + panelOffset.dy;
            const clX = Math.min(innerWidth - pw, Math.max(0, idealX));
            const clY = Math.min(innerHeight - ph - 20, Math.max(0, idealY));
            if (Math.abs(clX - idealX) > 40 || Math.abs(clY - idealY) > 40) {
              placePanel(true);
            } else {
              currentPanel.style.left = clX + 'px';
              currentPanel.style.top = clY + 'px';
              currentPanel.style.right = 'auto';
              currentPanel.style.bottom = 'auto';
            }
          }
        };
        const up = () => {
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', up);
          document.removeEventListener('pointercancel', up);
          if (moved) {
            dragEndTime = performance.now();   // 拖后短窗口内的 click 一律忽略
            fab.classList.add('snapping');     // 先加过渡类，吸附位移才有动画
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

    /* 滚动时高亮当前章节：按滚动位置判定（进入某节内容即高亮，双向滚动都准确）。
       IntersectionObserver 只盯标题本身（高度仅几像素），滚动到章节中部时不会触发 */
    const links = $$('a[href^="#"]', nav);
    const items = links
      .map((a) => ({ a, h: document.getElementById(decodeURIComponent((a.hash || '').slice(1))) }))
      .filter((x) => x.h);
    if (!items.length) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = scrollY + 100;   // 判定线：顶栏之下一点
      let current = null;
      for (const { a, h } of items) {
        if (h.getBoundingClientRect().top + scrollY <= y) current = a;
        else break;   // items 按文档顺序排列
      }
      links.forEach((l) => l.classList.toggle('active', l === current));
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; setTimeout(update, 60); }   // setTimeout 节流（后台标签 rAF 会被暂停）
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  });
})();
