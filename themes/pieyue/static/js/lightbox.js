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
    overlay.addEventListener('click', close);
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay && !overlay.hidden) close();
    });
    return overlay;
  }

  function openLightbox(src, alt) {
    ensureOverlay();
    lastFocus = document.activeElement;
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
