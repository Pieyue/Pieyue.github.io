/* ==========================================================================
   player.js —— 背景音乐：进入随机起播、跨页不断、右下角播放器 UI
   正常模式：随机起播 + 列表循环，可静音/暂停/切歌
   通透模式：与壁纸配对，可切换曲目（壁纸跟随淡入淡出），单曲循环，禁止静音/暂停
   ========================================================================== */
(() => {
  const { $, state, on, emit, toast, shake, ensureThoroughPair } = window.PY;

  /* 音频元素放在 window 级，SPA 换页不影响 */
  if (!state.audio) {
    const audio = new Audio();
    audio.preload = 'auto';
    const v = parseFloat(localStorage.getItem('py-volume'));
    audio.volume = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.7;
    state.audio = audio;
  }
  const audio = state.audio;

  const normalList = (window.PY.assets.normal_music || []).map((t) => ({ title: t.title, src: t.src }));
  const thoroughList = (window.PY.assets.thorough_pairs || []).map((p) => ({ title: p.title, src: p.music }));
  let list = state.mode === 'thorough' ? thoroughList : normalList;
  let idx = 0;
  let savedNormal = null;   // 切去通透模式前记住的位置（仅本次访问内有效）

  const fmt = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  function setPlayingUI(playing) {
    state.playing = playing;
    const note = $('#btn-note');
    const play = $('#p-play');
    if (note) {
      note.classList.toggle('playing', playing && !audio.muted);
      note.classList.toggle('silent', !playing || audio.muted);
    }
    if (play) play.classList.toggle('is-playing', playing);
  }

  function updateControls() {
    /* 通透模式只锁暂停键；切歌允许 */
    const play = $('#p-play');
    if (play) play.classList.toggle('locked', state.mode === 'thorough');
  }

  function renderPlaylist() {
    const ul = $('#playlist');
    if (!ul) return;
    ul.innerHTML = '';
    list.forEach((t, i) => {
      const li = document.createElement('li');
      li.textContent = t.title;
      if (i === idx) li.classList.add('current');
      li.addEventListener('click', () => load(i));
      ul.appendChild(li);
    });
  }

  function updateTrackUI() {
    const t = list[idx];
    const title = $('#player-title');
    if (title) title.textContent = t ? t.title : '即将开始播放…';
    renderPlaylist();
    updateControls();
  }

  function load(i, { autoplay = true, resumeAt = 0 } = {}) {
    idx = ((i % list.length) + list.length) % list.length;
    const t = list[idx];
    if (!t) return;
    audio.loop = state.mode === 'thorough';
    audio.src = t.src;
    audio.currentTime = resumeAt || 0;
    if (state.mode === 'thorough') {
      state.thoroughPair = idx;   // 记住当前配对，壁纸跟随
      emit('pairChanged', idx);
    }
    updateTrackUI();
    if (autoplay) tryPlay();
  }

  function tryPlay() {
    audio.play().then(() => setPlayingUI(true)).catch(() => {
      /* 浏览器拦截了自动播放：等用户的第一次点击/按键 */
      setPlayingUI(false);
      const kick = () => {
        document.removeEventListener('pointerdown', kick, true);
        document.removeEventListener('keydown', kick, true);
        audio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
      };
      document.addEventListener('pointerdown', kick, true);
      document.addEventListener('keydown', kick, true);
    });
  }

  function start() {
    state.audioStarted = true;
    if (state.mode === 'thorough') {
      load(ensureThoroughPair(thoroughList.length));
    } else {
      load(Math.floor(Math.random() * normalList.length)); // 每次进入/刷新都随机起播
    }
  }

  /* ---------- 音频事件 ---------- */
  audio.addEventListener('ended', () => {
    if (audio.loop) { audio.currentTime = 0; audio.play().catch(() => {}); return; }
    load(idx + 1); // 列表循环
  });
  audio.addEventListener('play', () => setPlayingUI(true));
  audio.addEventListener('pause', () => setPlayingUI(false));
  audio.addEventListener('timeupdate', () => {
    const fill = $('#progress-fill');
    const d = audio.duration || 0;
    if (fill) fill.style.width = (d ? (audio.currentTime / d) * 100 : 0) + '%';
    const cur = $('#t-cur'); if (cur) cur.textContent = fmt(audio.currentTime);
    const total = $('#t-total'); if (total) total.textContent = fmt(d);
  });

  /* ---------- 进度条拖拽 ---------- */
  const bar = $('#progress-bar');
  if (bar) {
    bar.addEventListener('pointerdown', (e) => {
      const seek = (ev) => {
        const r = bar.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
        if (audio.duration) audio.currentTime = ratio * audio.duration;
      };
      seek(e);
      try { bar.setPointerCapture(e.pointerId); } catch (err) {}
      const mv = (ev) => seek(ev);
      bar.addEventListener('pointermove', mv);
      bar.addEventListener('pointerup', () => bar.removeEventListener('pointermove', mv), { once: true });
    });
  }

  /* ---------- 播放器按钮 ---------- */
  $('#p-play').addEventListener('click', () => {
    if (state.mode === 'thorough') { shake($('#p-play')); toast('通透世界禁止暂停音乐！'); return; }
    if (!state.audioStarted) { start(); return; }
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  });
  $('#p-prev').addEventListener('click', () => load(idx - 1));
  $('#p-next').addEventListener('click', () => load(idx + 1));
  $('#btn-note').addEventListener('click', () => {
    if (state.mode === 'thorough') { shake($('#btn-note')); toast('通透世界禁止静音！'); return; }
    if (!state.audioStarted || (!state.playing && audio.paused && !audio.src)) { start(); return; }
    if (!state.playing && audio.paused) { audio.play().catch(() => {}); return; }
    audio.muted = !audio.muted;
    setPlayingUI(state.playing);
    toast(audio.muted ? '已静音' : '继续播放 ♪');
  });

  /* 音量 */
  const vol = $('#volume');
  if (vol) {
    vol.value = Math.round(audio.volume * 100);
    vol.addEventListener('input', () => {
      audio.volume = vol.value / 100;
      if (audio.volume > 0 && audio.muted) audio.muted = false;
      try { localStorage.setItem('py-volume', String(audio.volume)); } catch (e) {}
      setPlayingUI(state.playing);
    });
  }

  /* 播放列表开关（带展开/收起动画） */
  const plBtn = $('#btn-playlist');
  if (plBtn) {
    plBtn.addEventListener('click', () => {
      const ul = $('#playlist');
      if (ul.hidden) {
        ul.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => ul.classList.add('open')));
        plBtn.setAttribute('aria-expanded', 'true');
        plBtn.classList.add('active');
      } else {
        ul.classList.remove('open');
        plBtn.setAttribute('aria-expanded', 'false');
        plBtn.classList.remove('active');
        setTimeout(() => { if (!ul.classList.contains('open')) ul.hidden = true; }, 360);
      }
    });
  }

  /* ---------- 悬浮收起/弹出 ---------- */
  const player = $('#player');
  const hot = $('#player-hotzone');
  if (hot && player) {
    hot.addEventListener('mouseenter', () => player.classList.add('open'));
    hot.addEventListener('mouseleave', () => { if (!player.matches(':hover')) player.classList.remove('open'); });
    player.addEventListener('mouseleave', () => player.classList.remove('open'));
    player.addEventListener('focusin', () => player.classList.add('open'));
    player.addEventListener('focusout', () => { if (!player.contains(document.activeElement)) player.classList.remove('open'); });
  }
  /* 触屏设备：热区已禁用，点击露出的边缘条打开播放器 */
  if (player) {
    player.addEventListener('click', (e) => {
      if (player.classList.contains('open')) return;
      if (e.target.closest('button, input, #playlist')) return;
      player.classList.add('open');
    });
  }

  /* ---------- 模式切换联动 ---------- */
  on('modeChanged', (m) => {
    if (m === 'thorough') {
      if (list === normalList) savedNormal = { index: idx, time: audio.currentTime || 0 };
      list = thoroughList;
      audio.muted = false;
      load(ensureThoroughPair(thoroughList.length));
    } else {
      audio.loop = false;
      list = normalList;
      if (savedNormal && normalList[savedNormal.index]) {
        load(savedNormal.index, { resumeAt: savedNormal.time || 0 }); // 同一次访问内切回来接着听
      } else {
        load(Math.floor(Math.random() * normalList.length));
      }
    }
  });

  /* 启动：进入博客即尝试随机播放（被浏览器拦截时等待首次交互） */
  start();
})();
