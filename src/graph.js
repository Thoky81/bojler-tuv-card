// ---------- history (HACS card only): summary + boiler vs. supply graph + hourly heat sources ----------
// Perf: boiler, supply and power come from 5-minute statistics (288 points per sensor per day) instead of raw
// history; raw history only for the valve/heater switch or sensors without statistics. After loading, new
// points are appended from live state updates and the graph is redrawn at most once a minute.
const G = { W: 400, PL: 34, PR: 394, PT: 6, PB: 100, BT: 114, BB: 150, H: 170 };
const ON_STATES = ['on', 'open', 'opening'];
const bucketMs = cfg => Math.max(60e3, cfg.graph_hours * 3600e3 / 300);
const barMs = cfg => Math.ceil(cfg.graph_hours / 48) * 3600e3;
const gTc = (t, cfg) => {
  if (t === null || t === undefined) return 'var(--disabled-text-color, #9e9e9e)';
  const k = Math.max(0, Math.min(1, (t - cfg.cold) / (cfg.hot - cfg.cold)));
  return `hsl(${Math.round(215 - 215 * k)},78%,${Math.round(50 - 7 * Math.sin(Math.PI * k))}%)`;
};
const numOf = s => { const v = s ? parseFloat(s) : NaN; return isFinite(v) ? v : null; };
const wFactor = (hass, id) => ({ kW: 1e3, MW: 1e6 }[hass.states[id]?.attributes?.unit_of_measurement] || 1);
const graphKey = cfg => JSON.stringify([cfg.tariff, cfg.tariff_low, cfg.graph_smooth, cfg.show_graph, cfg.graph_hours, cfg.boiler, cfg.supply, cfg.valve, cfg.heater, cfg.heater_power, cfg.heater_on_w]);
const GSUC = 'var(--success-color, #43a047)', GERR = 'var(--error-color, #db4437)', GWRN = 'var(--warning-color, #ffa600)', GSEC = 'var(--secondary-text-color, #727272)';

async function loadHistory(hass, cfg) {
  const t1 = Date.now(), t0 = t1 - cfg.graph_hours * 3600e3, start_time = new Date(t0).toISOString();
  const numIds = [...new Set([cfg.boiler, cfg.supply, cfg.heater_power].filter(Boolean))];
  let stats = {};
  try {
    stats = await hass.callWS({ type: 'recorder/statistics_during_period', start_time, statistic_ids: numIds, period: '5minute', types: ['mean'], units: { power: 'W' } });
  } catch (e) { stats = {}; }
  const hasStats = id => stats[id] && stats[id].length;
  const histIds = [...new Set([cfg.valve, cfg.tariff, cfg.heater_power ? '' : cfg.heater, ...numIds.filter(id => !hasStats(id))].filter(Boolean))];
  const hist = histIds.length ? await hass.callWS({
    type: 'history/history_during_period', start_time, entity_ids: histIds,
    minimal_response: true, no_attributes: true, significant_changes_only: false,
  }) : {};
  const raw = id => (hist[id] || []).map(p => [Math.max(t0, (p.lc ?? p.lu) * 1000), p.s]);
  const ms = v => typeof v === 'number' ? v : Date.parse(v);
  const thin = pts => {  // mean per bucket, so the raw history of a chatty sensor stays small
    const b = bucketMs(cfg), out = [];
    let cur = null;
    for (const [t, v] of pts) {
      const k = Math.floor(t / b);
      if (cur && cur.k === k) { if (v !== null) { cur.sum += v; cur.n++; } continue; }
      if (cur) out.push([cur.t, cur.n ? cur.sum / cur.n : null]);
      cur = { k, t, sum: v ?? 0, n: v === null ? 0 : 1 };
    }
    if (cur) out.push([cur.t, cur.n ? cur.sum / cur.n : null]);
    return out;
  };
  const numeric = id => !id ? [] : hasStats(id)
    ? stats[id].map(p => [ms(p.start), p.mean ?? null])
    : thin(raw(id).map(([t, s]) => [t, numOf(s)]));
  const pf = cfg.heater_power && !hasStats(cfg.heater_power) ? wFactor(hass, cfg.heater_power) : 1;
  const power = cfg.heater_power ? numeric(cfg.heater_power).map(([t, v]) => [t, v === null ? null : v * pf]) : null;
  return {
    t0, t1, power,
    series: { boiler: numeric(cfg.boiler), supply: numeric(cfg.supply) },
    valve: raw(cfg.valve).map(([t, s]) => [t, ON_STATES.includes(s)]),
    tariff: cfg.tariff ? raw(cfg.tariff).map(([t, s]) => [t, isLowTariff(s, cfg.tariff_low)]) : null,
    heat: power ? power.map(([t, v]) => [t, v !== null && v > cfg.heater_on_w])
      : cfg.heater ? raw(cfg.heater).map(([t, s]) => [t, ON_STATES.includes(s)]) : null,
  };
}

function appendLive(d, hass, cfg) {
  const now = Date.now(), b = bucketMs(cfg);
  const pushNum = (arr, v) => {
    const last = arr[arr.length - 1];
    if (last && last.live && now - last[0] < b) { last[1] = v; return; }
    const p = [now, v]; p.live = true; arr.push(p);
  };
  const pushBool = (arr, v) => { const last = arr[arr.length - 1]; if (!last || last[1] !== v) arr.push([now, v]); };
  if (cfg.boiler) pushNum(d.series.boiler, numOf(hass.states[cfg.boiler]?.state));
  if (cfg.supply) pushNum(d.series.supply, numOf(hass.states[cfg.supply]?.state));
  const vs = hass.states[cfg.valve]?.state;
  if (vs !== undefined) pushBool(d.valve, ON_STATES.includes(vs));
  if (d.tariff && hass.states[cfg.tariff]) pushBool(d.tariff, isLowTariff(hass.states[cfg.tariff].state, cfg.tariff_low));
  if (d.power) {
    const w0 = numOf(hass.states[cfg.heater_power]?.state), w = w0 === null ? null : w0 * wFactor(hass, cfg.heater_power);
    pushNum(d.power, w);
    pushBool(d.heat, w !== null && w > cfg.heater_on_w);
  } else if (d.heat) pushBool(d.heat, ON_STATES.includes(hass.states[cfg.heater]?.state));
  d.t1 = now; d.t0 = now - cfg.graph_hours * 3600e3;
  for (const arr of [d.series.boiler, d.series.supply, d.valve, d.heat || [], d.power || [], d.tariff || []]) while (arr.length > 1 && arr[1][0] < d.t0) arr.shift();
}

const valueAt = (arr, T) => {
  let lo = 0, hi = arr.length - 1, r = null;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m][0] <= T) { r = arr[m][1]; lo = m + 1; } else hi = m - 1; }
  return r;
};
// time (ms) an on/off series was on within [a, b]
const onTime = (d, arr, a, b) => {
  let m = 0;
  for (let i = 0; i < arr.length; i++) {
    if (!arr[i][1]) continue;
    const s = Math.max(arr[i][0], a), e = Math.min(i + 1 < arr.length ? arr[i + 1][0] : d.t1, b);
    if (e > s) m += e - s;
  }
  return m;
};
const kwhIn = (d, a, b) => {
  let ws = 0;
  for (let i = 0; i < d.power.length; i++) {
    const s = Math.max(d.power[i][0], a), e = Math.min(i + 1 < d.power.length ? d.power[i + 1][0] : d.t1, b);
    if (e > s && d.power[i][1] !== null) ws += d.power[i][1] * (e - s);
  }
  return ws / 3.6e9;
};
// time the valve was open while the supply was colder than the boiler
const reverseTime = (d, cfg) => {
  const B = d.series.boiler, S = d.series.supply;
  if (!S.length) return 0;
  let m = 0;
  for (let i = 0; i < B.length; i++) {
    const t = Math.max(B[i][0], d.t0), e = i + 1 < B.length ? B[i + 1][0] : d.t1, s = valueAt(S, t);
    if (e > t && B[i][1] !== null && s !== null && valueAt(d.valve, t) && s < B[i][1] - cfg.reverse_tol) m += e - t;
  }
  return m;
};
// rolling mean over `win` ms for display; never averages across a gap, so missing data stays missing
const smooth = (arr, win, gap) => {
  if (!(win > 0)) return arr;
  const h = win / 2;
  return arr.map(([t, v], i) => {
    if (v === null) return [t, null];
    let s = v, n = 1;
    for (let j = i - 1; j >= 0 && arr[j][1] !== null && t - arr[j][0] <= h && arr[j + 1][0] - arr[j][0] <= gap; j--) { s += arr[j][1]; n++; }
    for (let j = i + 1; j < arr.length && arr[j][1] !== null && arr[j][0] - t <= h && arr[j][0] - arr[j - 1][0] <= gap; j++) { s += arr[j][1]; n++; }
    return [t, s / n];
  });
};
const fmtTime = (t, lang, withDate, hour12) => new Date(t).toLocaleString(lang, withDate
  ? { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', hour12 } : { hour: '2-digit', minute: '2-digit', hour12 });
const fmtDur = ms => { const m = Math.round(ms / 60e3); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };

function legendHtml(d, cfg, T, lang) {
  const sw = (dash, w, v) => `<svg width="18" height="6" viewBox="0 0 18 6"><path d="M1 3 H17" style="stroke:${gTc(v, cfg)};stroke-width:${w};stroke-dasharray:${dash};stroke-linecap:round"/></svg>`;
  const item = (label, v, dash, w) => `<span style="display:inline-flex;align-items:center;gap:5px;white-space:nowrap">${sw(dash, w, v)}
    <span style="color:${GSEC}">${label}</span><b style="font-weight:600;color:${gTc(v, cfg)};font-variant-numeric:tabular-nums">${v === null ? '—' : v.toFixed(1) + '°'}</b></span>`;
  const at = T ?? d.t1, L = I18N[cfg.lang || 'sk'];
  let out = `<span style="color:${GSEC};font-variant-numeric:tabular-nums;white-space:nowrap">${T == null ? L.hist_now : fmtTime(T, lang, cfg.graph_hours > 24, cfg.hour12)}</span>`;
  out += item(L.boiler, valueAt(d.series.boiler, at), 'none', 2.6);
  if (cfg.supply) out += item(i18nText(cfg, 'supply', 'label_supply').toLowerCase(), valueAt(d.series.supply, at), 'none', 1.6);
  if (T != null) {
    const bm = barMs(cfg), a = Math.floor(T / bm) * bm, b = a + bm;
    out += `<span style="white-space:nowrap;color:${GSEC}">${L.h_heat} <b style="font-weight:600;color:${GSUC}">${Math.round(onTime(d, d.valve, a, b) / 60e3)} min</b>`
      + (d.heat ? ` · ${L.h_el} <b style="font-weight:600;color:${GWRN}">${Math.round(onTime(d, d.heat, a, b) / 60e3)} min</b>` : '')
      + (d.tariff && valueAt(d.tariff, T) !== null ? ` · ${valueAt(d.tariff, T) ? L.nt : L.vt}` : '') + '</span>';
  }
  return out;
}

// low-tariff periods as a thin strip just under the hourly bars
const tariffStrip = (d, X, L) => {
  let out = `<text x="${G.PL - 5}" y="${G.BB + 7}" text-anchor="end" style="font-size:7px;fill:${GSEC}">${L.nt}</text>`;
  for (let i = 0; i < d.tariff.length; i++) {
    if (d.tariff[i][1] !== true) continue;
    const x0 = X(Math.max(d.tariff[i][0], d.t0)), x1 = X(i + 1 < d.tariff.length ? d.tariff[i + 1][0] : d.t1);
    if (x1 > x0) out += `<rect x="${x0.toFixed(1)}" y="${G.BB + 2.5}" width="${(x1 - x0).toFixed(1)}" height="4" rx="1" style="fill:var(--info-color, #039be5);fill-opacity:.55"><title>${L.nt_long}</title></rect>`;
  }
  return out;
};

function renderGraph(d, cfg, lang) {
  const span = d.t1 - d.t0, gap = Math.max(3 * bucketMs(cfg), 20 * 60e3), hours = cfg.graph_hours;
  const X = t => G.PL + (t - d.t0) / span * (G.PR - G.PL);
  const win = (cfg.graph_smooth || 0) * 60e3;
  const B = smooth(d.series.boiler, win, gap), S = smooth(d.series.supply, win, gap);
  let lo = Infinity, hi = -Infinity;
  for (const a of [B, S]) for (const [, v] of a) if (v !== null) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  if (!isFinite(lo)) { lo = cfg.cold; hi = cfg.hot; }
  const step = hi - lo > 40 ? 20 : 10;
  lo = Math.floor((lo - 1) / step) * step; hi = Math.ceil((hi + 1) / step) * step;
  const Y = v => G.PB - (v - lo) / (hi - lo) * (G.PB - G.PT);
  const pt = (t, v) => `${X(t).toFixed(1)} ${Y(v).toFixed(1)}`;

  // summary
  const valveMs = onTime(d, d.valve, d.t0, d.t1), heatMs = d.heat ? onTime(d, d.heat, d.t0, d.t1) : 0, revMs = reverseTime(d, cfg);
  const chip = (label, val, col) => `<div style="min-width:0"><div style="font-size:11px;color:${GSEC};white-space:nowrap">${label}</div>
    <div style="font-size:15px;font-weight:500;color:${col};white-space:nowrap;font-variant-numeric:tabular-nums">${val}</div></div>`;
  const L = I18N[cfg.lang || 'sk'];
  let chips = chip(L.c_heat, fmtDur(valveMs), GSUC);
  if (d.heat) chips += chip(L.c_el, fmtDur(heatMs), GWRN);
  if (d.power) chips += chip(L.c_kwh, kwhIn(d, d.t0, d.t1).toFixed(1) + ' kWh', 'var(--primary-text-color)');
  if (revMs >= 5 * 60e3) chips += chip(L.c_rev, fmtDur(revMs), GERR);

  // grid + time axis
  let grid = '';
  for (let v = lo; v <= hi; v += step) {
    grid += `<line x1="${G.PL}" x2="${G.PR}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--divider-color);stroke-width:1"/>
      <text x="${G.PL - 5}" y="${Y(v) + 3}" text-anchor="end" style="font-size:8.5px;fill:${GSEC};font-variant-numeric:tabular-nums">${v}°</text>`;
  }
  const sh = [1, 2, 3, 4, 6, 8, 12, 24, 48].find(s => hours / s <= 6) || 72;
  const tick = new Date(d.t0); tick.setMinutes(0, 0, 0);
  for (let i = 0; i < 400 && tick.getTime() <= d.t1; i++, tick.setHours(tick.getHours() + 1)) {
    const t = tick.getTime();
    if (t < d.t0 || (sh < 24 ? tick.getHours() % sh : tick.getHours() || Math.round(t / 864e5) % (sh / 24))) continue;
    const label = sh >= 24 ? tick.toLocaleDateString(lang, { day: 'numeric', month: 'numeric' }) : fmtTime(t, lang, false, cfg.hour12);
    grid += `<line x1="${X(t)}" x2="${X(t)}" y1="${G.PT}" y2="${G.BB}" style="stroke:var(--divider-color);stroke-width:1;stroke-dasharray:2 3"/>
      <text x="${X(t)}" y="${G.H - 2}" text-anchor="middle" style="font-size:8.5px;fill:${GSEC}">${label}</text>`;
  }

  // boiler vs supply: green where supply is warmer, red where the valve was open and the supply colder
  const line = a => { let p = '', prev = null; for (const [t, v] of a) { if (v === null) { prev = null; continue; } p += (prev === null || t - prev > gap ? 'M' : 'L') + pt(t, v); prev = t; } return p; };
  const solid = a => a.filter(p => p[1] !== null);
  const Bs = solid(B), Ss = solid(S);
  let areas = '';
  if (Bs.length > 1 && Ss.length > 1) {
    const between = 'M' + Ss.map(([t, v]) => pt(t, v)).join('L') + 'L' + Bs.slice().reverse().map(([t, v]) => pt(t, v)).join('L') + 'Z';
    const bl = 'M' + Bs.map(([t, v]) => pt(t, v)).join('L');
    const xa = X(Bs[0][0]).toFixed(1), xb = X(Bs[Bs.length - 1][0]).toFixed(1);
    const open = [];
    for (let i = 0; i < d.valve.length; i++) {
      if (!d.valve[i][1]) continue;
      const x0 = X(Math.max(d.valve[i][0], d.t0)), x1 = X(i + 1 < d.valve.length ? d.valve[i + 1][0] : d.t1);
      if (x1 > x0) open.push(`<rect x="${x0.toFixed(1)}" y="${G.PT - 30}" width="${(x1 - x0).toFixed(1)}" height="${G.PB - G.PT + 60}"/>`);
    }
    areas = `
      <defs>
        <clipPath id="hab"><path d="${bl}L${xb} ${G.PT - 30}L${xa} ${G.PT - 30}Z"/></clipPath>
        <clipPath id="hbe"><path d="${bl}L${xb} ${G.PB + 30}L${xa} ${G.PB + 30}Z"/></clipPath>
        <clipPath id="hop">${open.join('')}</clipPath>
      </defs>
      <g clip-path="url(#hab)"><path d="${between}" style="fill:${GSUC};fill-opacity:.22"/></g>
      ${open.length ? `<g clip-path="url(#hop)"><g clip-path="url(#hbe)"><path d="${between}" style="fill:${GERR};fill-opacity:.55"/></g></g>` : ''}`;
  }
  const stops = [0, .25, .5, .75, 1].map(k => `<stop offset="${k}" style="stop-color:${gTc(hi - k * (hi - lo), cfg)}"/>`).join('');

  // hourly bars: minutes from heating (green) and electricity (orange)
  const bm = barMs(cfg), bh = bm / 3600e3, BY = m => G.BB - m / bm * (G.BB - G.BT);
  let bars = '';
  for (let a = Math.floor(d.t0 / bm) * bm; a < d.t1; a += bm) {
    const s = Math.max(a, d.t0), e = Math.min(a + bm, d.t1), x0 = X(s), w = X(e) - x0;
    const half = d.heat ? Math.max(0, w / 2 - 0.8) : Math.max(0, w - 1.2);
    const v = onTime(d, d.valve, s, e), h = d.heat ? onTime(d, d.heat, s, e) : 0;
    if (v > 30e3) bars += `<rect x="${(x0 + .4).toFixed(1)}" y="${BY(v).toFixed(1)}" width="${half.toFixed(1)}" height="${(G.BB - BY(v)).toFixed(1)}" rx="1" style="fill:${GSUC}"/>`;
    if (h > 30e3) bars += `<rect x="${(x0 + w / 2).toFixed(1)}" y="${BY(h).toFixed(1)}" width="${half.toFixed(1)}" height="${(G.BB - BY(h)).toFixed(1)}" rx="1" style="fill:${GWRN}"/>`;
  }

  return `
  <div style="display:flex;flex-direction:column;gap:8px;padding-top:12px;margin-top:12px;border-top:1px solid var(--divider-color)">
    <div style="display:flex;align-items:center;gap:6px 12px;flex-wrap:wrap">
      <span style="font-size:11px;font-weight:600;letter-spacing:1.2px;color:${GSEC}">${L.hist} · ${hours} h</span>
      <span id="hleg" style="margin-left:auto;display:flex;gap:4px 12px;flex-wrap:wrap;justify-content:flex-end;align-items:center;font-size:11.5px">${legendHtml(d, cfg, null, lang)}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px">${chips}</div>
    <svg id="hsvg" viewBox="0 0 ${G.W} ${G.H}" style="width:100%;height:auto;display:block;overflow:visible;touch-action:pan-y;cursor:crosshair">
      <defs><linearGradient id="hgr" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${Y(hi)}" y2="${Y(lo)}">${stops}</linearGradient></defs>
      ${grid}
      ${areas}
      ${cfg.supply ? `<path d="${line(S)}" style="fill:none;stroke:url(#hgr);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round"/>` : ''}
      <path d="${line(B)}" style="fill:none;stroke:url(#hgr);stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round"/>
      <line x1="${G.PL}" x2="${G.PR}" y1="${G.BB}" y2="${G.BB}" style="stroke:var(--divider-color)"/>
      ${d.tariff ? tariffStrip(d, X, L) : ''}
      <line x1="${G.PL}" x2="${G.PR}" y1="${G.BT}" y2="${G.BT}" style="stroke:var(--divider-color);stroke-dasharray:2 3"/>
      <text x="${G.PL - 5}" y="${G.BT + 3}" text-anchor="end" style="font-size:8px;fill:${GSEC}">${bh === 1 ? '60 m' : bh + ' h'}</text>
      ${bars}
      <line id="hcur" x1="0" x2="0" y1="${G.PT}" y2="${G.BB}" style="stroke:var(--primary-text-color);stroke-opacity:.45;stroke-width:1;display:none"/>
    </svg>
  </div>`;
}
