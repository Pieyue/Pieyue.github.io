/* ==========================================================================
   search.js —— 搜索：主页搜索框即时联想 + /search/ 结果页
   数据源为 Hugo 生成的 /index.json
   ========================================================================== */
(() => {
  const { $ } = window.PY;

  let indexPromise = null;
  function loadIndex() {
    if (!indexPromise) indexPromise = fetch('/index.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
    return indexPromise;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function highlight(text, q) {
    let out = esc(text);
    q.toLowerCase().split(/\s+/).filter(Boolean).forEach((t) => {
      out = out.replace(new RegExp('(' + escRe(esc(t)) + ')', 'gi'), '<mark>$1</mark>');
    });
    return out;
  }

  function snippet(item, q) {
    const text = (item.text || '').replace(/\s+/g, ' ').trim();
    const lower = text.toLowerCase();
    const first = q.toLowerCase().split(/\s+/).filter(Boolean)
      .map((t) => lower.indexOf(t)).filter((i) => i >= 0)
      .sort((a, b) => a - b)[0];
    let window_;
    if (first == null) window_ = text.slice(0, 90) + (text.length > 90 ? '…' : '');
    else {
      const start = Math.max(0, first - 34);
      window_ = (start > 0 ? '…' : '') + text.slice(start, start + 120) + (start + 120 < text.length ? '…' : '');
    }
    return highlight(window_, q);
  }

  function search(items, q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const scored = [];
    for (const it of items) {
      const title = (it.title || '').toLowerCase();
      const tags = (it.tags || []).join(' ').toLowerCase();
      const text = (it.text || '').toLowerCase();
      let titleScore = 0, tagScore = 0, contentScore = 0;
      for (const t of terms) {
        if (title.includes(t)) titleScore += 10;
        if (title.startsWith(t)) titleScore += 6;         // 词在标题开头：更强信号
        if (tags.includes(t)) tagScore += 5;
        const hits = text.split(t).length - 1;
        contentScore += Math.min(8, hits);
      }
      /* 多词搜索：全部词都命中标题时额外加权 */
      if (terms.length > 1 && terms.every((t) => title.includes(t))) titleScore += 8;
      if (titleScore || tagScore || contentScore) {
        scored.push({ it, titleScore, tagScore, contentScore, date: it.date || '' });
      }
    }
    /* 排序：标题相关性 → 标签 → 正文内容 → 时间（新在前） */
    scored.sort((a, b) =>
      b.titleScore - a.titleScore ||
      b.tagScore - a.tagScore ||
      b.contentScore - a.contentScore ||
      b.date.localeCompare(a.date));
    return scored.slice(0, 20).map((x) => x.it);
  }

  function renderResults(box, items, q) {
    if (!q) { box.innerHTML = '<p class="muted">输入关键词，搜索全部文章…</p>'; return; }
    if (!items.length) { box.innerHTML = '<p class="muted">没有找到与「' + esc(q) + '」相关的文章。</p>'; return; }
    box.innerHTML = items.map((it) => {
      /* 有首图的文章：左侧预览图，版式与文章列表（list.html）一致 */
      const thumb = it.thumb
        ? '<a class="result-thumb" href="' + esc(it.url) + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + esc(it.thumb) + '" alt="" loading="lazy" decoding="async"></a>'
        : '';
      return '<div class="result">' +
        thumb +
        '<div class="result-body">' +
          '<h3><a href="' + esc(it.url) + '">' + highlight(it.title, q) + '</a></h3>' +
          '<p>' + snippet(it, q) + '</p>' +
          '<div class="result-meta"><time>' + esc(it.date) + '</time>' +
            (it.tags || []).map((t) => '<a class="tag" href="/search/?q=' + encodeURIComponent(t) + '"># ' + esc(t) + '</a>').join('') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window.PY.pageInits.push(() => {
    const page = document.body.dataset.page;

    /* 即时联想（主页搜索框 + 内容页顶栏搜索框共用） */
    const attachSuggest = (form, input, sug) => {
      if (!form || !input || !sug || form.dataset.suggestInit === '1') return;
      form.dataset.suggestInit = '1';
      let timer = 0;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        const q = input.value.trim();
        if (!q) { sug.classList.remove('show'); sug.innerHTML = ''; return; }
        timer = setTimeout(async () => {
          try {
            const found = search(await loadIndex(), q).slice(0, 8);
            sug.innerHTML = found.length
              ? found.map((it) =>
                  '<a href="' + esc(it.url) + '"><span class="s-title">' + highlight(it.title, q) +
                  '</span><span class="s-date">' + esc(it.date) + '</span></a>').join('')
              : '<div class="s-empty">没有找到相关文章</div>';
            sug.classList.add('show');
          } catch (e) { sug.classList.remove('show'); }
        }, 220);
      });
      input.addEventListener('focus', () => { if (input.value.trim() && sug.innerHTML) sug.classList.add('show'); });
      document.addEventListener('click', (e) => { if (!form.contains(e.target) && !sug.contains(e.target)) sug.classList.remove('show'); });
    };

    /* 主页搜索框：即时联想 */
    if (page === 'home') {
      const form = $('#hero-search');
      attachSuggest(form, form.querySelector('input[name="q"]'), $('#search-suggest'));
    }

    /* 内容页顶栏搜索框：即时联想（下拉动态创建在表单内） */
    if (page !== 'home') {
      const form = $('.topbar-search');
      const input = form && form.querySelector('input[name="q"]');
      if (form && input) {
        const sug = document.createElement('div');
        sug.className = 'search-suggest';
        form.appendChild(sug);
        attachSuggest(form, input, sug);
        /* 换页清空输入框时同步收起下拉 */
        window.PY.on('navigated', () => { sug.classList.remove('show'); sug.innerHTML = ''; });
      }
    }

    /* 搜索结果页 */
    if (page === 'search') {
      const input = $('#page-search input[name="q"]');
      const box = $('#search-results');
      if (!input || !box || input.dataset.init === '1') return;
      input.dataset.init = '1';
      const q = new URLSearchParams(location.search).get('q') || '';
      input.value = q;
      input.focus();
      const run = async () => {
        const query = input.value.trim();
        try { renderResults(box, search(await loadIndex(), query), query); }
        catch (e) { box.innerHTML = '<p class="muted">搜索索引加载失败，请刷新重试。</p>'; }
      };
      run();
      let timer = 0;
      input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 260); });
    }
  });
})();
