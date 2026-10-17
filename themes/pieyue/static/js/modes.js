/* ==========================================================================
   modes.js —— 壁纸选择、通透模式/正常模式切换、白天/黑夜模式
   ========================================================================== */
(() => {
  const { $, state, on, emit, toast, ensureThoroughPair, applyBodyState } = window.PY;

  const layer = $('#wallpaper-layer');
  const normalWPs = window.PY.assets.normal_wallpapers || [];
  const thoroughWPs = window.PY.assets.thorough_pairs || [];

  let normalWP = null;
  let thoroughWP = null;

  /* 壁纸淡入淡出：新壁纸叠在旧壁纸上方淡入，完成后移除旧节点 */
  let wpToken = 0;
  function render(wp) {
    if (!wp || !layer) return;
    if (layer.dataset.src === wp.src) return;   // 同一张壁纸不重复切换
    layer.dataset.src = wp.src;
    const token = ++wpToken;
    const el = document.createElement(wp.type === 'video' ? 'video' : 'img');
    if (wp.type === 'video') {
      el.autoplay = true;
      el.muted = true;
      el.loop = true;
      el.playsInline = true;
    } else {
      el.alt = '';
    }
    el.className = 'wp-item';
    el.src = wp.src;
    layer.appendChild(el);

    const reveal = () => el.classList.add('wp-show');
    if (wp.type === 'video') el.addEventListener('loadeddata', reveal, { once: true });
    else if (el.complete && el.naturalWidth) reveal();
    else el.addEventListener('load', reveal, { once: true });
    setTimeout(reveal, 1600);                    // 网络慢时的兜底

    setTimeout(() => {
      if (token !== wpToken) return;             // 期间又切了壁纸，交给最后一次清理
      [...layer.children].forEach((c) => { if (c !== el) c.remove(); });
    }, 2000);
  }

  function pickThoroughWP() {
    const p = ensureThoroughPair(thoroughWPs.length);
    const pair = thoroughWPs[p];
    thoroughWP = pair ? { title: pair.title, src: pair.wallpaper, type: 'image' } : null;
  }

  /* 每次进入/刷新都重新随机：正常壁纸始终先选好，
     这样从通透模式切回正常时也有壁纸可切 */
  normalWP = normalWPs[Math.floor(Math.random() * normalWPs.length)] || null;
  if (state.mode === 'thorough') {
    pickThoroughWP();
    render(thoroughWP);
  } else {
    render(normalWP);
  }

  /* ---------- 通透 / 正常 切换 ---------- */
  const modeLabel = $('#mode-label');
  const syncModeUI = () => {
    if (modeLabel) modeLabel.textContent = state.mode === 'thorough' ? '变回正常人类' : '通透模式';
    syncModeUI.done = true;
  };
  syncModeUI();

  $('#btn-mode').addEventListener('click', () => {
    const next = state.mode === 'normal' ? 'thorough' : 'normal';
    state.mode = next;
    try { sessionStorage.setItem('py-mode', next); } catch (e) {}
    applyBodyState();
    syncModeUI();
    if (next === 'thorough') {
      if (!thoroughWP) pickThoroughWP();
      render(thoroughWP);
      toast('这就是……通透世界！');
    } else {
      render(normalWP);
      toast('欢迎回到正常世界。');
    }
    emit('modeChanged', next);
  });

  /* 通透模式切歌：壁纸跟随配对切换（带淡入淡出） */
  on('pairChanged', (p) => {
    const pair = thoroughWPs[p];
    if (!pair) return;
    thoroughWP = { title: pair.title, src: pair.wallpaper, type: 'image' };
    if (state.mode === 'thorough') render(thoroughWP);
  });

  /* ---------- 白天 / 黑夜 ---------- */
  function applyNight() {
    document.body.classList.toggle('night', state.night);
    /* 已挂载的 Giscus 主题跟随切换 */
    const frame = document.querySelector('iframe.giscus-frame');
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ giscus: { setConfig: { theme: state.night ? 'dark' : 'light' } } }, 'https://giscus.app');
    }
  }
  applyNight();

  let nightFadeTimer = 0;
  $('#btn-night').addEventListener('click', () => {
    state.night = !state.night;
    try { localStorage.setItem('py-night', state.night ? '1' : '0'); } catch (e) {}
    /* 切换瞬间启用全局颜色过渡，随后移除 */
    document.body.classList.add('theme-fading');
    clearTimeout(nightFadeTimer);
    nightFadeTimer = setTimeout(() => document.body.classList.remove('theme-fading'), 650);
    applyNight();
    toast(state.night ? '已进入黑夜模式 🌙' : '已回到白天 ☀️');
  });
})();
