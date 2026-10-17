/* ==========================================================================
   weather.js —— 天气面板（所在地当前 + 未来一周预报）+ Canvas 天气特效
   特效：雨 / 雪 / 冰雹，按天气代码自动匹配
   数据：ip138（首选定位）+ ipwho.is / geojs / freeipapi / ipapi.co，
        天气来自 Open-Meteo
   ========================================================================== */
(() => {
  const { $, state, on, toast } = window.PY;

  const btn = $('#btn-weather');
  const canvas = $('#rain-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  /* ---------------- Canvas 天气特效（雨 / 雪 / 冰雹） ---------------- */
  let effectType = null;        // 'rain' | 'snow' | 'hail' | null
  let drops = [];               // 雨
  let flakes = [];              // 雪
  let stones = [];              // 冰雹
  let ripples = [];
  let running = false;
  let raf = 0;
  let lastT = 0;
  let W = 0;
  let H = 0;
  let DPR = 1;

  function newDrop(fromTop) {
    const speed = (520 + Math.random() * 460) * DPR;
    const len = (10 + Math.random() * 16) * DPR;
    return {
      x: Math.random() * (W + 160) - 80,
      y: fromTop ? -len - Math.random() * 90 : Math.random() * H,
      len,
      speed,
      vx: -(26 + Math.random() * 60) * DPR,
      alpha: 0.13 + Math.random() * 0.22,
    };
  }

  function newFlake(fromTop) {
    return {
      x: Math.random() * W,
      y: fromTop ? -6 * DPR - Math.random() * 40 * DPR : Math.random() * H,
      r: (1.1 + Math.random() * 2.3) * DPR,
      vy: (34 + Math.random() * 62) * DPR,
      phase: Math.random() * Math.PI * 2,
      freq: 0.5 + Math.random() * 1.1,
      sway: (8 + Math.random() * 30) * DPR,
      alpha: 0.45 + Math.random() * 0.5,
    };
  }

  function newStone(fromTop) {
    return {
      x: Math.random() * W,
      y: fromTop ? -8 * DPR - Math.random() * 60 * DPR : Math.random() * H * 0.5,
      r: (1.6 + Math.random() * 2.6) * DPR,
      vx: (Math.random() - 0.5) * 90 * DPR,
      vy: (420 + Math.random() * 320) * DPR,
      bounces: 0,
      alpha: 0.65 + Math.random() * 0.35,
    };
  }

  function resize() {
    if (!canvas) return;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.width = Math.floor(innerWidth * DPR);
    H = canvas.height = Math.floor(innerHeight * DPR);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    const area = innerWidth * innerHeight;
    if (effectType === 'rain') {
      const target = Math.min(240, Math.round(area / 9000));
      drops = Array.from({ length: target }, () => newDrop(false));
    } else if (effectType === 'snow') {
      const target = Math.min(150, Math.round(area / 15000));
      flakes = Array.from({ length: target }, () => newFlake(false));
    } else if (effectType === 'hail') {
      const target = Math.min(90, Math.round(area / 24000));
      stones = Array.from({ length: target }, () => newStone(false));
    }
  }

  function frame(t) {
    if (!running || !ctx) return;
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';

    if (effectType === 'rain') {
      ctx.lineWidth = Math.max(1, 1.1 * DPR);
      for (const d of drops) {
        const k = d.len / d.speed;
        ctx.strokeStyle = 'rgba(174, 197, 235,' + d.alpha + ')';
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.vx * k, d.y - d.speed * k);
        ctx.stroke();
        d.y += d.speed * dt;
        d.x += d.vx * dt;
        if (d.y > H + d.len) {
          if (Math.random() < 0.16) ripples.push({ x: d.x, y: H - 3 * DPR, r: 1.5 * DPR, a: 0.45 });
          Object.assign(d, newDrop(true));
        }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 36 * DPR * dt;
        r.a -= 1.5 * dt;
        if (r.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(174, 197, 235,' + r.a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r, r.r * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (effectType === 'snow') {
      for (const f of flakes) {
        f.phase += f.freq * dt;
        f.y += f.vy * dt;
        f.x += Math.sin(f.phase) * f.sway * dt;
        ctx.fillStyle = 'rgba(255, 255, 255,' + f.alpha + ')';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        if (f.y > H + f.r) Object.assign(f, newFlake(true));
        if (f.x < -12) f.x = W + 12;
        else if (f.x > W + 12) f.x = -12;
      }
    } else if (effectType === 'hail') {
      for (const s of stones) {
        s.vy += 2400 * DPR * dt;
        s.y += s.vy * dt;
        s.x += s.vx * dt;
        /* 运动拖尾 */
        ctx.strokeStyle = 'rgba(222, 238, 255,' + (s.alpha * 0.5).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - s.vy * 0.03);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(228, 242, 255,' + s.alpha + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.y > H - s.r) {
          if (s.bounces < 1 && Math.abs(s.vy) > 120 * DPR) {
            s.y = H - s.r;
            s.vy = -Math.abs(s.vy) * 0.32;   // 落地弹跳一次
            s.bounces++;
          } else {
            Object.assign(s, newStone(true));
          }
        }
      }
    }

    raf = requestAnimationFrame(frame);
  }

  function startEffect(type) {
    stopEffect();
    effectType = type;
    if (!canvas || !type) return;
    running = true;
    resize();
    window.addEventListener('resize', resize);
    lastT = performance.now();
    raf = requestAnimationFrame(frame);
    canvas.classList.add('on');
  }

  function stopEffect() {
    running = false;
    effectType = null;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    if (ctx) ctx.clearRect(0, 0, W, H);
    if (canvas) canvas.classList.remove('on');
  }

  /* ---------------- WMO 天气代码 → 文案/图标 ---------------- */
  const WMO = [
    [0, '晴', '☀️', '🌙'], [1, '基本晴', '🌤️', '🌙'], [2, '局部多云', '⛅', '☁️'],
    [3, '阴', '☁️', '☁️'], [45, '雾', '🌫️', '🌫️'], [48, '雾凇', '🌫️', '🌫️'],
    [51, '毛毛雨', '🌦️', '🌧️'], [53, '毛毛雨', '🌦️', '🌧️'], [55, '浓毛毛雨', '🌧️', '🌧️'],
    [56, '冻毛毛雨', '🌧️', '🌧️'], [57, '冻毛毛雨', '🌧️', '🌧️'],
    [61, '小雨', '🌦️', '🌧️'], [63, '中雨', '🌧️', '🌧️'], [65, '大雨', '🌧️', '🌧️'],
    [66, '冻雨', '🌧️', '🌧️'], [67, '冻雨', '🌧️', '🌧️'],
    [71, '小雪', '🌨️', '🌨️'], [73, '中雪', '🌨️', '🌨️'], [75, '大雪', '❄️', '❄️'],
    [77, '雪粒', '❄️', '❄️'], [80, '阵雨', '🌦️', '🌧️'], [81, '阵雨', '🌧️', '🌧️'],
    [82, '强阵雨', '🌧️', '🌧️'], [85, '阵雪', '🌨️', '🌨️'], [86, '阵雪', '❄️', '❄️'],
    [95, '雷暴', '⛈️', '⛈️'], [96, '雷暴伴冰雹', '⛈️', '⛈️'], [99, '雷暴伴冰雹', '⛈️', '⛈️'],
  ];
  const wmoInfo = (code, isDay = true) => {
    const row = WMO.find((r) => r[0] === code);
    return row
      ? { text: row[1], icon: isDay ? row[2] : row[3] }
      : { text: '未知', icon: '🌡️' };
  };

  /* 美标 AQI 分级 */
  function aqiLevel(a) {
    if (a == null) return { text: '—', color: 'inherit' };
    if (a <= 50) return { text: '优', color: '#15803d' };
    if (a <= 100) return { text: '良', color: '#b45309' };
    if (a <= 150) return { text: '轻度污染', color: '#ea580c' };
    if (a <= 200) return { text: '中度污染', color: '#dc2626' };
    if (a <= 300) return { text: '重度污染', color: '#9333ea' };
    return { text: '严重污染', color: '#be123c' };
  }
  const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95]);
  const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
  const HAIL_CODES = new Set([96, 99]);   // 雷暴伴冰雹
  const EFFECT_EMOJI = { rain: '🌧️', snow: '❄️', hail: '🧊' };

  function detectEffect(c) {
    if (SNOW_CODES.has(c.weather_code)) return 'snow';
    if (HAIL_CODES.has(c.weather_code)) return 'hail';
    if (RAIN_CODES.has(c.weather_code) || (c.precipitation || 0) > 0) return 'rain';
    return null;
  }

  /* ---------------- 数据获取 ---------------- */
  state.weather = null;          // { place, current:{...}, days:[...] } 或 { failed: true }
  state.weatherEffect = null;    // 'rain' | 'snow' | 'hail' | null

  /* 中文地名 → 坐标：按传入顺序从末位（区）到首位（省）逐级尝试 */
  async function geocodeByName(names, place) {
    const uniq = names.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
    for (const name of [...uniq].reverse()) {
      const g = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(name) + '&count=1&language=zh&format=json', { cache: 'no-store' });
      if (!g.ok) continue;
      const gj = await g.json();
      const hit = gj.results && gj.results[0];
      if (hit && Number.isFinite(hit.latitude)) {
        return { lat: hit.latitude, lon: hit.longitude, place: place || uniq.join(' · ') };
      }
    }
    throw new Error('地名未匹配到坐标');
  }

  async function getGeo() {
    let coordsOnly = null;
    const sources = [
      async () => {
        /* ip138（首选）：返回 HTML 页面，从中提取
           「来自：中国 省 市 区 运营商」；站点已放行跨域（ACAO:*），
           浏览器访问时自动携带访客真实 UA 与 IP */
        const r = await fetch('https://2026.ip138.com/', { cache: 'no-store' });
        if (!r.ok) throw new Error('ip138 ' + r.status);
        const html = await r.text();
        const m = html.match(/来自[：:]\s*([^<]+)/);
        if (!m) throw new Error('ip138 页面中未找到地址');
        const tokens = m[1].trim().split(/\s+/);
        if (tokens[0] === '中国') tokens.shift();
        if (tokens.length > 1) tokens.pop();          // 末位是运营商
        const uniq = [];
        tokens.forEach((t) => { if (t && t !== uniq[uniq.length - 1]) uniq.push(t); });
        return geocodeByName(uniq, uniq.join(' · '));
      },
      async () => {
        /* myip.ipip.net：纯文本「当前 IP：x  来自于：国家 省 市 区 运营商」 */
        const r = await fetch('https://myip.ipip.net/', { cache: 'no-store' });
        if (!r.ok) throw new Error('ipip ' + r.status);
        const text = (await r.text()).trim();
        const m = text.match(/来自于[：:]\s*(.+)$/);
        if (!m) throw new Error('ipip 响应格式未知');
        const tokens = m[1].trim().split(/\s+/).filter(Boolean);
        if (tokens[0] === '中国') tokens.shift();
        if (tokens.length > 1) tokens.pop();          // 末位是运营商
        if (!tokens.length) throw new Error('ipip 未返回地名');
        return geocodeByName(tokens, tokens.filter((v, i, a) => a.indexOf(v) === i).join(' · '));
      },
      async () => {
        const r = await fetch('https://ipwho.is/', { cache: 'no-store' });
        if (!r.ok) throw new Error('ipwho ' + r.status);
        const j = await r.json();
        return { lat: j.latitude, lon: j.longitude, place: [j.city, j.region].filter(Boolean).join(' · ') };
      },
      async () => {
        const r = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' });
        if (!r.ok) throw new Error('geojs ' + r.status);
        const j = await r.json();
        return { lat: Number(j.latitude), lon: Number(j.longitude), place: [j.city, j.region].filter(Boolean).join(' · ') };
      },
      async () => {
        const r = await fetch('https://freeipapi.com/api/json', { cache: 'no-store' });
        if (!r.ok) throw new Error('freeipapi ' + r.status);
        const j = await r.json();
        return { lat: Number(j.latitude), lon: Number(j.longitude), place: [j.cityName, j.regionName].filter(Boolean).join(' · ') };
      },
      async () => {
        const r = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
        if (!r.ok) throw new Error('ipapi ' + r.status);
        const j = await r.json();
        return { lat: j.latitude, lon: j.longitude, place: [j.city, j.region].filter(Boolean).join(' · ') };
      },
    ];
    for (const s of sources) {
      try {
        const g = await s();
        if (!Number.isFinite(g.lat) || !Number.isFinite(g.lon)) continue;
        /* 优先采用「坐标 + 城市名」齐全的源，避免城市和坐标张冠李戴 */
        if (g.place) return g;
        if (!coordsOnly) coordsOnly = g;
      } catch (e) { /* 尝试下一个源 */ }
    }
    return coordsOnly;
  }

  async function fetchWeather(geoOverride) {
    const geo = geoOverride || (await getGeo());
    if (!geo) { state.weather = { failed: true }; renderPanel(); return; }
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + geo.lat + '&longitude=' + geo.lon +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&timezone=auto&forecast_days=8';
    const r = await fetch(url);
    if (!r.ok) throw new Error('open-meteo ' + r.status);
    const j = await r.json();
    const c = j.current || {};
    const d = j.daily || {};
    state.weatherEffect = detectEffect(c);
    state.geoPrecise = !!geoOverride;

    /* 空气质量（美标 AQI + PM2.5 / PM10），失败不影响天气展示 */
    let air = null;
    try {
      const ar = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + geo.lat + '&longitude=' + geo.lon + '&current=us_aqi,pm2_5,pm10&timezone=auto');
      if (ar.ok) {
        const aj = await ar.json();
        const ac = aj.current || {};
        air = {
          aqi: ac.us_aqi != null ? Math.round(ac.us_aqi) : null,
          pm25: ac.pm2_5 != null ? Math.round(ac.pm2_5) : null,
          pm10: ac.pm10 != null ? Math.round(ac.pm10) : null,
        };
        if (air.aqi == null && air.pm25 == null && air.pm10 == null) air = null;
      }
    } catch (e) { /* 空气质量获取失败时跳过该行 */ }

    state.weather = {
      place: geo.place || '当前位置',
      air,
      current: {
        temp: Math.round(c.temperature_2m),
        feels: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        wind: Math.round(c.wind_speed_10m),
        isDay: c.is_day !== 0,
        code: c.weather_code,
      },
      days: (d.time || []).map((t, i) => ({
        date: t,
        code: d.weather_code[i],
        max: Math.round(d.temperature_2m_max[i]),
        min: Math.round(d.temperature_2m_min[i]),
        pop: d.precipitation_probability_max ? d.precipitation_probability_max[i] : null,
      })),
    };
    console.info('[weather] 天气特效类型:', state.weatherEffect);
    updateBtnIcon();
    apply();
    renderPanel();
  }

  /* ---------------- 显隐规则 ----------------
     特效类型跟随天气（雨/雪/冰雹），主页恒开，内容页可开关
     ------------------------------------------- */
  function effectiveEffect() {
    const detected = state.weatherEffect || null;
    if (state.page === 'home') return detected;              // 主页恒开
    if (state.rainPref === '0') return null;                 // 手动关
    return detected;                                         // 开/自动：天气匹配才播放
  }

  function apply() {
    const type = effectiveEffect();
    state.rainOn = !!type;
    if (type !== effectType) {
      if (type) startEffect(type); else stopEffect();
    }
    /* 同步面板里的开关与标签 */
    if (panel) {
      const sw = panel.querySelector('#rain-switch');
      if (sw) {
        sw.classList.toggle('on', state.rainOn);
        sw.setAttribute('aria-checked', String(state.rainOn));
      }
      const label = panel.querySelector('.wp-rainlabel');
      if (label) label.innerHTML = rainLabelHtml();
    }
  }

  on('navigated', () => {
    apply();
    /* 面板全站可用：换页后刷新内容（特效类型与“主页恒开”提示可能变化） */
    if (panel && !panel.hidden) renderPanel();
  });

  /* 精确定位：浏览器 Geolocation + 中文反向地理编码 */
  async function reverseGeocode(lat, lon) {
    const r = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lon + '&localityLanguage=zh', { cache: 'no-store' });
    if (!r.ok) throw new Error('bdc ' + r.status);
    const j = await r.json();
    return [j.city || j.locality, j.principalSubdivision].filter(Boolean).join(' · ');
  }

  function setRelocating(busy) {
    const b = panel && panel.querySelector('#btn-relocate');
    if (b) {
      b.disabled = busy;
      b.textContent = busy ? '定位中…' : '📍 重新定位';
    }
  }

  function relocate() {
    if (!navigator.geolocation) { toast('浏览器不支持定位'); return; }
    setRelocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          let place = '';
          try { place = await reverseGeocode(lat, lon); } catch (e) { /* 拿不到地名不影响天气 */ }
          await fetchWeather({ lat, lon, place });
          toast('已按精确定位更新天气');
        } catch (e) {
          toast('天气更新失败');
        }
        setRelocating(false);
      },
      (err) => {
        setRelocating(false);
        toast(err && err.code === 1 ? '已拒绝定位权限' : '定位失败，可稍后重试');
      },
      { timeout: 8000, maximumAge: 600000 }
    );
  }

  /* ---------------- 天气面板 ---------------- */
  let panel = null;
  let hoverTimer = 0;
  let leaveTimer = 0;
  let openedByHover = false;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function rainLabelHtml() {
    const eff = effectiveEffect();
    const icon = eff ? EFFECT_EMOJI[eff] : '🌦️';
    const forced = state.page === 'home' && state.rainOn && state.rainPref !== '1';
    const hint = forced ? '<em class="wp-rain-hint">主页恒开</em>' : '';
    return icon + ' 天气特效' + hint;
  }

  function rainRowHtml() {
    return '<div class="wp-rainrow"><span class="wp-rainlabel">' + rainLabelHtml() + '</span>' +
      '<button id="rain-switch" class="switch' + (state.rainOn ? ' on' : '') + '" role="switch" aria-checked="' + state.rainOn + '"><span class="knob"></span></button></div>';
  }

  function bindRainSwitch() {
    const sw = panel.querySelector('#rain-switch');
    if (!sw) return;
    sw.addEventListener('click', () => {
      state.rainPref = state.rainOn ? '0' : '1';
      try { localStorage.setItem('py-rain', state.rainPref); } catch (e) {}
      apply();
    });
  }

  function renderPanel() {
    ensurePanel();
    const p = panel;
    if (!state.weather) {
      p.innerHTML = '<div class="wp-loading">正在获取天气…</div>';
      return;
    }
    if (state.weather.failed) {
      p.innerHTML = '<div class="wp-loading">天气获取失败（网络或定位不可用）</div>' + rainRowHtml() +
        '<div class="wp-foot">数据来源 Open-Meteo</div>';
      bindRainSwitch();
      return;
    }

    const w = state.weather;
    const cur = w.current;
    const ci = wmoInfo(cur.code, cur.isDay);
    const rows = w.days.map((d, i) => {
      const dt = new Date(d.date + 'T12:00:00');
      const label = i === 0 ? '今天' : i === 1 ? '明天' : WEEK[dt.getDay()];
      const di = wmoInfo(d.code, true);
      return '<div class="wf-row' + (i === 0 ? ' today' : '') + '">' +
        '<span class="wf-day">' + label + '</span>' +
        '<span class="wf-icon" title="' + esc(di.text) + '">' + di.icon + '</span>' +
        '<span class="wf-cond">' + esc(di.text) + (d.pop != null ? '<em>降水 ' + d.pop + '%</em>' : '') + '</span>' +
        '<span class="wf-temp">' + d.max + '° <i>/ ' + d.min + '°</i></span>' +
        '</div>';
    }).join('');

    let airHtml = '';
    if (w.air && w.air.aqi != null) {
      const lv = aqiLevel(w.air.aqi);
      const pm = [];
      if (w.air.pm25 != null) pm.push('PM2.5 ' + w.air.pm25);
      if (w.air.pm10 != null) pm.push('PM10 ' + w.air.pm10);
      airHtml = '<div class="wp-air">🌿 空气质量 <b style="color:' + lv.color + '">' + lv.text + ' · AQI ' + w.air.aqi + '</b>' +
        (pm.length ? '<span class="wp-air-pm">' + pm.join(' · ') + ' μg/m³</span>' : '') + '</div>';
    }

    p.innerHTML =
      '<button id="btn-relocate" class="wp-relocate" title="IP 定位可能不准，用浏览器定位更精确">📍 重新定位</button>' +
      '<div class="wp-head"><span class="wp-icon">' + ci.icon + '</span>' +
        '<div class="wp-now"><div class="wp-temp">' + cur.temp + '°C<b>' + esc(ci.text) + '</b></div>' +
        '<div class="wp-place">' + esc(w.place || '当前位置') + '</div></div></div>' +
      '<div class="wp-meta">体感 ' + cur.feels + '° · 湿度 ' + cur.humidity + '% · 风速 ' + cur.wind + ' km/h</div>' +
      airHtml +
      '<div class="wf-list">' + rows + '</div>' +
      rainRowHtml() +
      '<div class="wp-foot">数据来源 Open-Meteo · 定位' + (state.geoPrecise ? '浏览器精确' : 'IP（可在上方重新定位）') + '</div>';
    bindRainSwitch();
    const rel = p.querySelector('#btn-relocate');
    if (rel) rel.addEventListener('click', relocate);
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'weather-panel';
    panel.className = 'weather-panel';
    panel.hidden = true;
    document.body.appendChild(panel);
    document.addEventListener('click', (e) => {
      if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel && !panel.hidden) closePanel();
    });
    panel.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
    panel.addEventListener('mouseleave', () => {
      clearTimeout(leaveTimer);
      if (openedByHover) {
        leaveTimer = setTimeout(() => { if (openedByHover && panel && !panel.hidden) closePanel(); }, 280);
      }
    });
    return panel;
  }

  function openPanel() {
    ensurePanel();
    renderPanel();
    panel.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('show')));
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    if (!panel) return;
    openedByHover = false;
    panel.classList.remove('show');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (panel && !panel.classList.contains('show')) panel.hidden = true; }, 300);
  }

  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openedByHover = false;
      if (!panel || panel.hidden) openPanel(); else closePanel();
    });
    /* 悬停展开（与播放器一致） */
    btn.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
      if (panel && !panel.hidden) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => { openedByHover = true; openPanel(); }, 160);
    });
    btn.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      if (openedByHover) {
        /* 悬停打开的面板：移开后若未进入面板则自动收起 */
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(() => { if (openedByHover && panel && !panel.hidden) closePanel(); }, 420);
      }
    });
  }

  /* 顶栏按钮图标跟随实时天气 */
  function updateBtnIcon() {
    if (!btn || !state.weather || state.weather.failed) return;
    const ci = wmoInfo(state.weather.current.code, state.weather.current.isDay);
    btn.innerHTML = '<span class="btn-emoji" title="' + esc(ci.text) + '">' + ci.icon + '</span>';
    btn.title = '天气：' + ci.text + ' · 点击查看预报';
  }

  /* ---------------- 启动 ---------------- */
  (async () => {
    try {
      await fetchWeather();
    } catch (e) {
      state.weather = { failed: true };
      console.info('[weather] 天气获取失败', e);
      renderPanel();
    }
  })();
})();
