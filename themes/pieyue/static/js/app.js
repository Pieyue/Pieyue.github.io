/* ==========================================================================
   app.js —— 全局核心：共享状态、SPA 路由（音乐跨页不中断的关键）、
   页面级初始化调度、代码块复制、Giscus 评论区
   ========================================================================== */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const parseJSON = (id) => {
    const el = document.getElementById(id);
    try { return el ? JSON.parse(el.textContent) : {}; } catch (e) { console.error('[py] JSON 解析失败:', id, e); return {}; }
  };
  const config = parseJSON('site-config');
  const assets = parseJSON('site-assets');

  const state = {
    page: document.body.dataset.page || 'home',
    mode: sessionStorage.getItem('py-mode') || 'normal',
    night: localStorage.getItem('py-night') === '1',
    rainPref: localStorage.getItem('py-rain'),   // '1' | '0' | null（自动跟随天气）
    isRaining: false,
    rainOn: false,
    playing: false,
    audioStarted: false,
    thoroughPair: null,
  };

  const listeners = {};
  const on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  const emit = (ev, data) => { (listeners[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } }); };

  let toastTimer = 0;
  function toast(msg, ms = 2400) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  /* 通透模式的配对选择：每次进入/刷新重新随机，本次访问内保持不变 */
  function ensureThoroughPair(n) {
    if (n <= 0) return 0;
    if (state.thoroughPair == null) state.thoroughPair = Math.floor(Math.random() * n);
    return state.thoroughPair;
  }

  function applyBodyState() {
    const b = document.body;
    b.classList.toggle('is-home', state.page === 'home');
    b.classList.toggle('is-content', state.page !== 'home');
    b.classList.toggle('night', state.night);
    b.classList.toggle('mode-thorough', state.mode === 'thorough');
  }

  /* ------------------------------------------------------------------
     SPA 导航：站内跳转只替换 #app-main，<audio> 等全局元素永不销毁
     ------------------------------------------------------------------ */
  const NO_SPA_RE = /\.(mp3|mp4|webm|ogg|wav|flac|json|xml|txt|pdf|zip|rar|7z|jpg|jpeg|png|webp|avif|gif|svg|ico|css|js)([?#]|$)/i;

  let renderedUrl = location.pathname + location.search;   // 当前已渲染页面（不含 hash）

  async function swap(url, push) {
    const res = await fetch(url, { credentials: 'same-origin', headers: { 'X-Requested-With': 'py-spa' } });
    if (!res.ok) throw new Error(res.status + ' ' + url);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const nextMain = doc.querySelector('#app-main');
    if (!nextMain) { window.location.href = url; return; }

    const doSwap = () => {
      const target = new URL(url, location.href);
      /* 先更新 URL：页面初始化（如搜索页读取 location.search）必须看到新地址 */
      if (push) history.pushState({}, '', target.href);
      renderedUrl = target.pathname + target.search;
      $('#app-main').innerHTML = nextMain.innerHTML;
      document.title = doc.title;
      state.page = doc.body.dataset.page || 'home';
      document.body.dataset.page = state.page;
      applyBodyState();
      window.scrollTo(0, 0);
      runPageInits();
      emit('navigated', { url });
    };

    if (document.startViewTransition) {
      await document.startViewTransition(doSwap).updateCallbackDone;
    } else {
      const main = $('#app-main');
      main.classList.add('swap-fade');
      await new Promise((r) => setTimeout(r, 170));
      doSwap();
      requestAnimationFrame(() => main.classList.remove('swap-fade'));
    }
  }

  function navigate(url) {
    const u = new URL(url, location.href);
    if (u.origin !== location.origin) { window.location.href = url; return; }
    if (u.href === location.href) return;
    swap(u.href, true).catch((err) => { console.error('[py] SPA 导航失败，回退整页加载', err); window.location.href = url; });
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download') || a.hasAttribute('data-no-spa')) return;
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#')) return;
    if (NO_SPA_RE.test(href)) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return;
    e.preventDefault();
    navigate(u.href);
  });

  /* 站内搜索表单 → SPA 跳转到 /search/?q= */
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (!(f instanceof HTMLFormElement)) return;
    const action = f.getAttribute('action');
    if (!action || (f.method || 'get').toLowerCase() !== 'get') return;
    if (new URL(action, location.href).pathname.replace(/\/$/, '') !== '/search') return;
    e.preventDefault();
    const input = f.querySelector('input[name="q"]');
    const q = input ? input.value.trim() : '';
    const u = new URL(action, location.href);
    u.search = q ? '?q=' + encodeURIComponent(q) : '';
    navigate(u.href);
  });

  /* 某些环境下回车不触发表单隐式提交，这里兜底 */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target || !e.target.matches) return;
    const input = e.target.closest('form[action*="search"] input[name="q"]');
    if (!input || !input.form) return;
    e.preventDefault();
    input.form.requestSubmit();
  });

  window.addEventListener('popstate', () => {
    /* 仅 hash 变化（如点击目录锚点）时浏览器已自行滚动到目标，无需重渲染 */
    const here = location.pathname + location.search;
    if (here === renderedUrl) return;
    swap(location.href, false).catch(() => window.location.reload());
  });

  /* ------------------------------------------------------------------
     页面级初始化（每次进入页面都会执行，需自行保证幂等）
     ------------------------------------------------------------------ */
  const pageInits = [];
  function runPageInits() { pageInits.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }

  /* 代码块：语言标识 + 复制按钮 */
  function initCodeCopy() {
    $$('.highlight').forEach((hl) => {
      /* C/C++ 预处理行中，Chroma 会把 `#include <...>` 后面的注释并进 .cpf token，
         这里把注释部分拆出来，恢复注释样式 */
      $$('.chroma .cpf', hl).forEach((el) => {
        if (el.dataset.split === '1') return;
        const text = el.textContent;
        const iLine = text.indexOf('//');
        const iBlock = text.indexOf('/*');
        let idx = -1;
        let cls = 'c1';
        if (iLine >= 0 && (iBlock < 0 || iLine < iBlock)) { idx = iLine; cls = 'c1'; }
        else if (iBlock >= 0) { idx = iBlock; cls = 'cm'; }
        if (idx <= 0) return;
        el.dataset.split = '1';
        el.textContent = text.slice(0, idx);
        const span = document.createElement('span');
        span.className = cls;
        span.textContent = text.slice(idx);
        el.after(span);
      });
      if (hl.querySelector('.code-header')) return;
      const codeEl = hl.querySelector('pre code');
      const lang = codeEl ? (codeEl.getAttribute('data-lang') || ((codeEl.className.match(/language-([\w+#.-]+)/) || [])[1])) : '';

      const header = document.createElement('div');
      header.className = 'code-header';

      if (lang) {
        const tag = document.createElement('span');
        tag.className = 'code-lang';
        tag.textContent = lang;
        header.appendChild(tag);
      }

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.title = '复制代码';
      btn.setAttribute('aria-label', '复制代码');
      btn.innerHTML =
        '<svg class="ic-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
        '<svg class="ic-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      btn.addEventListener('click', async () => {
        const codeTarget = hl.querySelector('pre code') || hl.querySelector('pre');
        const text = (codeTarget ? codeTarget.innerText : hl.innerText).replace(/\n$/, '');
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add('copied');
        } catch (e) {
          /* 降级路径：隐藏选区 + execCommand（非安全上下文/无权限时） */
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          let ok = false;
          try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
          ta.remove();
          if (ok) btn.classList.add('copied'); else toast('复制失败，请手动选择');
        }
        setTimeout(() => { btn.classList.remove('copied'); }, 1500);
      });
      header.appendChild(btn);

      hl.insertBefore(header, hl.firstChild);
    });
  }

  /* Giscus 评论区（文章页） */
  function initGiscus() {
    const box = $('#giscus-container');
    if (!box || box.dataset.done === '1') return;
    const g = config.giscus || {};
    if (!g.repoId || !g.categoryId) {
      box.innerHTML = '<p class="giscus-hint">评论区尚未启用：请在 <code>hugo.toml</code> 的 <code>[params.giscus]</code> 中填入 <code>repoId</code> 和 <code>categoryId</code>（到 <a href="https://giscus.app/zh-CN" target="_blank" rel="noopener">giscus.app</a> 生成后粘贴即可）。</p>';
      return;
    }
    box.dataset.done = '1';
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    const attrs = {
      'data-repo': g.repo,
      'data-repo-id': g.repoId,
      'data-category': g.category,
      'data-category-id': g.categoryId,
      'data-mapping': g.mapping || 'pathname',
      'data-strict': g.strict || '0',
      'data-reactions-enabled': g.reactionsEnabled || '1',
      'data-emit-metadata': g.emitMetadata || '0',
      'data-input-position': g.inputPosition || 'top',
      'data-theme': state.night ? 'dark' : 'light',
      'data-lang': g.lang || 'zh-CN',
      'data-loading': g.loading || 'lazy',
    };
    for (const [k, v] of Object.entries(attrs)) if (v != null) s.setAttribute(k, v);
    box.appendChild(s);
  }

  pageInits.push(initCodeCopy, initGiscus);

  /* 首次启动（defer 脚本全部执行完、DOMContentLoaded 触发时） */
  function boot() {
    applyBodyState();
    document.body.classList.add('boot-fade');
    runPageInits();
    emit('navigated', { url: location.href, first: true });
  }
  if (document.readyState === 'complete') boot();
  else document.addEventListener('DOMContentLoaded', boot);

  window.PY = {
    $, $$, config, assets, state, on, emit, toast, shake, navigate,
    ensureThoroughPair, applyBodyState, pageInits, runPageInits,
  };
})();
