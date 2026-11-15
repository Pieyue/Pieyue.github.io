/* ==========================================================================
   lightbox.js —— 正文图片点击放大查看
   点击图片打开全屏遮罩（背景毛玻璃），点击遮罩/图片/关闭按钮或按 Esc 关闭
   ========================================================================== */
(() => {
  const { $, $$ } = window.PY;

  let overlay = null;
  let imgEl = null;
  let lastFocus = null;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'lightbox';
    overlay.className = 'lightbox';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '图片预览');

    imgEl = document.createElement('img');
    imgEl.className = 'lightbox-img';
    imgEl.alt = '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', '关闭预览');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

    overlay.appendChild(imgEl);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    const close = () => closeLightbox();
    overlay.addEventListener('click', (e) => {
      /* 最近 300ms 内有过 pointer 交互（拖动/捏合/双击）→ 忽略此次 click */
      if (performance.now() - lastGestureEnd < 300) return;   /* 手势余波 click：忽略 */
      close();
    });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    bindGestures();
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay && !overlay.hidden) close();
    });
    return overlay;
  }

  /* ---------- 移动端捏合缩放 / 拖动查看 / 双击切换 ---------- */
  let scale = 1;
  let tx = 0;
  let ty = 0;
  const pointers = new Map();          // pointerId → { x, y, px, py }（py/px 为上次位置）
  let pinch = null;                    // { d0, cx0, cy0, s0, tx0, ty0 }
  let lastTap = { t: 0, x: 0, y: 0 };
  let lastGestureEnd = 0;              // 最近一次实质手势（拖动/捏合/双击）结束时间

  const applyTransform = () => {
    imgEl.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + scale + ')';
  };
  const clampPan = () => {
    /* 平移范围：缩放后图片超出视口的部分（各方向一半） */
    const lx = Math.max(0, (imgEl.offsetWidth * scale - innerWidth) / 2);
    const ly = Math.max(0, (imgEl.offsetHeight * scale - innerHeight) / 2);
    tx = Math.min(lx, Math.max(-lx, tx));
    ty = Math.min(ly, Math.max(-ly, ty));
  };
  const setZoom = (target, cx, cy) => {
    const prev = scale;
    scale = Math.min(5, Math.max(1, target));
    /* 视口点 (cx, cy) 在缩放前后保持对应同一图片位置 */
    tx = cx - ((cx - tx) / prev) * scale;
    ty = cy - ((cy - ty) / prev) * scale;
    if (scale <= 1.01) { scale = 1; tx = 0; ty = 0; }
    clampPan();
    applyTransform();
  };

  const resetZoom = () => {
    scale = 1; tx = 0; ty = 0;
    pointers.clear();
    pinch = null;
    imgEl.style.transition = '';
    imgEl.style.transform = '';
  };

  function bindGestures() {
    overlay.addEventListener('pointerdown', (e) => {
      if (overlay.hidden || e.target.closest('.lightbox-close')) return;
      const now = performance.now();
      /* 双击：以点击点为中心切换 2.5 倍 / 复位 */
      if (now - lastTap.t < 300 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40) {
        lastGestureEnd = performance.now();
        imgEl.style.transition = 'transform 0.18s ease';
        if (scale > 1) resetZoom(); else setZoom(2.5, e.clientX, e.clientY);
        setTimeout(() => { imgEl.style.transition = ''; }, 220);
        return;
      }
      lastTap = { t: now, x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const pts = [...pointers.values()];
        pinch = {
          d0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          s0: scale, tx0: tx, ty0: ty,
        };
        imgEl.style.transition = 'none';
      }
    });

    overlay.addEventListener('pointermove', (e) => {
      if (overlay.hidden || !pointers.has(e.pointerId)) return;
      const st = pointers.get(e.pointerId);
      const dx = e.clientX - st.x;
      const dy = e.clientY - st.y;
      st.x = e.clientX;
      st.y = e.clientY;
      if (pointers.size === 2 && pinch) {
        lastGestureEnd = performance.now();
        const pts = [...pointers.values()];
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        setZoom(pinch.s0 * (d / pinch.d0), (pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
      } else if (pointers.size === 1 && scale > 1) {
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) lastGestureEnd = performance.now();
        tx += dx;
        ty += dy;
        clampPan();
        applyTransform();
      }
    });

    const endPointer = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0 && scale <= 1.01 && !imgEl.style.transition) resetZoom();
    };
    overlay.addEventListener('pointerup', endPointer);
    overlay.addEventListener('pointercancel', endPointer);
  }

  function openLightbox(src, alt) {
    ensureOverlay();
    lastFocus = document.activeElement;
    resetZoom();
    imgEl.src = src;
    imgEl.alt = alt || '';
    overlay.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('show')));
    document.body.classList.add('lightbox-open');
    const btn = overlay.querySelector('.lightbox-close');
    if (btn) btn.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove('show');
    document.body.classList.remove('lightbox-open');
    setTimeout(() => {
      if (overlay && !overlay.classList.contains('show')) {
        overlay.hidden = true;
        imgEl.src = '';
        resetZoom();
      }
    }, 220);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
  }

  window.PY.pageInits.push(() => {
    $$('.post-body img').forEach((img) => {
      if (img.dataset.zoomable === '1') return;
      img.dataset.zoomable = '1';
      img.classList.add('zoomable');
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.title = '点击放大';
      const open = () => {
        /* 优先使用原图（外链图片本身即原图；Hugo 处理过的图片取 src） */
        const src = img.dataset.src || img.currentSrc || img.src;
        if (src) openLightbox(src, img.alt);
      };
      img.addEventListener('click', open);
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  });
})();
