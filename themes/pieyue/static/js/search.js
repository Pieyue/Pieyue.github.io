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
      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += 12;
        if (tags.includes(t)) score += 6;
        const hits = text.split(t).length - 1;
        if (hits) score += Math.min(10, hits) * 2;
      }
      if (score > 0) scored.push([score, it]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    return scored.slice(0, 20).map((x) => x[1]);
  }

  function renderResults(box, items, q) {
    if (!q) { box.innerHTML = '<p class="muted">输入关键词，搜索全部文章…</p>'; return; }
    if (!items.length) { box.innerHTML = '<p class="muted">没有找到与「' + esc(q) + '」相关的文章。</p>'; return; }
    box.innerHTML = items.map((it) =>
      '<a class="result" href="' + esc(it.url) + '">' +
        '<h3>' + highlight(it.title, q) + '</h3>' +
        '<p>' + snippet(it, q) + '</p>' +
        '<div class="result-meta"><time>' + esc(it.date) + '</time>' +
          (it.tags || []).map((t) => '<span class="tag"># ' + esc(t) + '</span>').join('') +
        '</div>' +
      '</a>'
    ).join('');
  }

  window.PY.pageInits.push(() => {
    const page = document.body.dataset.page;

    /* 主页搜索框：即时联想 */
    if (page === 'home') {
      const form = $('#hero-search');
      const input = form && form.querySelector('input[name="q"]');
      const sug = $('#search-suggest');
      if (!form || form.dataset.init === '1') return;
      form.dataset.init = '1';
      let timer = 0;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        const q = input.value.trim();
        if (!q) { sug.hidden = true; sug.innerHTML = ''; return; }
        timer = setTimeout(async () => {
          try {
            const found = search(await loadIndex(), q).slice(0, 8);
            sug.innerHTML = found.length
              ? found.map((it) =>
                  '<a href="' + esc(it.url) + '"><span class="s-title">' + highlight(it.title, q) +
                  '</span><span class="s-date">' + esc(it.date) + '</span></a>').join('')
              : '<div class="s-empty">没有找到相关文章</div>';
            sug.hidden = false;
          } catch (e) { sug.hidden = true; }
        }, 220);
      });
      input.addEventListener('focus', () => { if (input.value.trim() && sug.innerHTML) sug.hidden = false; });
      document.addEventListener('click', (e) => { if (!form.contains(e.target) && !sug.contains(e.target)) sug.hidden = true; });
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
