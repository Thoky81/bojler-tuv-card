const C = /*CFG*/;
const U = C.uid || 'bt';  // constant: each button-card has its own shadow root
const ok = s => s && !['unknown','unavailable'].includes(s.state);
const num = id => { if (!id) return null; const s = states[id]; if (!ok(s)) return null; const v = parseFloat(s.state); return isNaN(v) ? null : v; };
const isOn = id => { const s = id && states[id]; return !!s && ['on','open','opening'].includes(s.state); };
const hl = t => {
  const k = Math.max(0, Math.min(1, (t - C.cold) / (C.hot - C.cold)));
  return [Math.round(215 - 215 * k), Math.round(50 - 7 * Math.sin(Math.PI * k))];
};
const tc = t => {
  if (t === null) return 'var(--disabled-text-color, #9e9e9e)';
  const [h, l] = hl(t);
  return `hsl(${h},78%,${l}%)`;
};
// text on a pill filled with tc(t): white or near-black, whichever has more contrast
const ink = t => {
  if (t === null) return '#fff';
  const [h, l] = hl(t), L = l / 100, a = .78 * Math.min(L, 1 - L);
  const ch = n => {
    const k = (n + h / 30) % 12, v = L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  };
  const Y = .2126 * ch(0) + .7152 * ch(8) + .0722 * ch(4);
  return 1.05 / (Y + .05) >= (Y + .05) / .0625 ? '#fff' : '#1b1b1b';
};
const f = v => v === null ? '—' : v.toFixed(1) + '°';
const sg = v => v === null ? '—' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1) + '°';
const ago = ts => {
  if (!ts) return '';
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  return m < 1 ? 'práve' : m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)} h` : `${Math.floor(m / 1440)} d`;
};
const mi = id => id ? `class="bt-click" onclick="event.stopPropagation();this.dispatchEvent(new CustomEvent('hass-more-info',{bubbles:true,composed:true,detail:{entityId:'${id}'}}))"` : '';
const tint = (c, p) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

const tb = num(C.boiler), t1 = num(C.supply), t2 = num(C.coil_in), t3 = num(C.coil_out);
const vS = states[C.valve];
const vOk = ok(vS);
const open = isOn(C.valve);
// power as the sensor reports it (value + its own unit); pw is converted to W for the threshold
const pwUnit = (C.heater_power && states[C.heater_power]?.attributes?.unit_of_measurement) || 'W';
const pwRaw = num(C.heater_power);
const pw = pwRaw === null ? null : pwRaw * ({ kW: 1e3, MW: 1e6 }[pwUnit] || 1);
const pwTxt = pwRaw === null ? '' : `${pwUnit === 'W' ? Math.round(pwRaw) : +pwRaw.toFixed(2)} ${pwUnit}`;
const hasHeater = !!(C.heater || C.heater_power);
const heating = (C.heater && isOn(C.heater)) || (pw !== null && pw > C.heater_on_w);
const tin = t2 !== null ? t2 : t1;
const dSup = t1 !== null && tb !== null ? t1 - tb : null;
const dIn = tin !== null && tb !== null ? tin - tb : null;
const dCoil = t2 !== null && t3 !== null ? t2 - t3 : null;

const SUC = 'var(--success-color, #43a047)', ERR = 'var(--error-color, #db4437)', WRN = 'var(--warning-color, #ffa600)';
const INF = 'var(--info-color, #039be5)', SEC = 'var(--secondary-text-color, #727272)';
let st;
if (tb === null || tin === null) st = { k: 'na', c: SEC, icon: 'mdi:lan-disconnect', label: 'nedostupné', txt: 'Teplotné senzory sú nedostupné' };
else if (open && dIn < -C.reverse_tol) st = { k: 'bad', c: ERR, icon: 'mdi:alert', label: 'bojler kúri radiátory', txt: `Ventil je otvorený, ale voda z kúrenia (${f(tin)}) je chladnejšia ako bojler (${f(tb)}). Bojler ohrieva radiátory.` };
else if (open) st = { k: 'tuv', c: SUC, icon: 'mdi:check-circle', label: 'ohrev z kúrenia', txt: `Kúrenie ohrieva bojler` + (dCoil !== null ? ` · výmenník odovzdáva ${dCoil.toFixed(1)}°` : '') };
else if (dSup !== null && dSup >= C.min_delta) st = { k: 'ready', c: INF, icon: 'mdi:information', label: 'kúrenie je teplé', txt: `Prívod je o ${dSup.toFixed(1)}° teplejší ako bojler, ventil by mohol otvoriť` };
else if (heating) st = { k: 'el', c: WRN, icon: 'mdi:flash', label: 'elektrický ohrev', txt: `Ohrieva elektrina · kúrenie je ${dSup !== null && dSup < 0 ? 'chladnejšie ako bojler' : 'málo teplé'}` };
else st = { k: 'idle', c: SEC, icon: 'mdi:power-sleep', label: 'pohotovosť', txt: dSup === null ? 'Ventil zatvorený' : `Ventil zatvorený · prívod je ${dSup >= 0 ? 'len o ' + dSup.toFixed(1) + '° teplejší' : 'o ' + (-dSup).toFixed(1) + '° chladnejší'} ako bojler` };

const pill = (txt, c) => `<span style="font-size:12px;padding:4px 10px;border-radius:7px;font-weight:500;white-space:nowrap;background:${tint(c, 15)};color:${c}">${txt}</span>`;
let pills = '';
if (!vOk) pills += pill('ventil nedostupný', SEC);
if (heating && st.k !== 'el') pills += pill('⚡ elektrina', WRN);
pills += pill(st.label, st.c);


const cB = tc(tb), c1 = tc(t1), c2 = tc(t2), c3 = tc(t3);
const vCol = !vOk ? SEC : open ? SUC : SEC;
const vTxt = !vOk ? 'nedostupný' : open ? 'otvorený' : 'zatvorený';
const dCol = !open || dCoil === null ? SEC : dCoil >= 0 ? SUC : ERR;
const supCol = dSup === null ? SEC : dSup >= C.min_delta ? SUC : dSup >= 0 ? WRN : ERR;
const flowCol = st.k === 'bad' ? ERR : '#fff';
const CARD_BG = 'var(--ha-card-background, var(--card-background-color, #fff))';
const scaleGrad = dir => `linear-gradient(${dir}, ${[0, .25, .5, .75, 1].map(k => tc(C.cold + k * (C.hot - C.cold))).join(', ')})`;
const pct = v => Math.max(0, Math.min(100, (v - C.cold) / (C.hot - C.cold) * 100));
const flow = d => open ? `<path d="${d}" class="bt-flow" style="fill:none;stroke:${flowCol};stroke-opacity:.75;stroke-width:2;stroke-linecap:round"/>` : '';
// Perf: CSS-only animation, stepped to ~7 repaints/s (Safari repaints SVG dash animation every frame), off with animate: false
const STYLE = `
<style>
  .bt-click { cursor: pointer; }
  .bt-click:hover { opacity: .75; }
  .bt-flow { stroke-dasharray: 4 10; ${C.animate ? `animation: btf${U} 1s steps(7) infinite;` : ''} }
  @keyframes btf${U} { to { stroke-dashoffset: -14; } }
  @media (prefers-reduced-motion: reduce) { .bt-flow { animation: none; } }
</style>`;
const header = (extra = '') => `
  <div style="display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--divider-color)">
    <ha-icon icon="mdi:water-boiler" style="--mdc-icon-size:18px;color:${st.c};flex-shrink:0"></ha-icon>
    <span style="font-size:15px;font-weight:500">${C.title}</span>${extra}
    <span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${pills}</span>
  </div>`;
const banner = () => `
  <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;background:${tint(st.c, 12)};color:${st.c}">
    <ha-icon icon="${st.icon}" style="--mdc-icon-size:18px;flex-shrink:0"></ha-icon>
    <span style="font-size:12.5px;line-height:1.35;color:${st.k === 'idle' || st.k === 'na' ? SEC : 'var(--primary-text-color)'}">${st.txt}</span>
  </div>`;
const wrap = inner => `${STYLE}<div style="display:flex;flex-direction:column;gap:12px;text-align:left;color:var(--primary-text-color)">${inner}</div>`;
// temperature pill on a pipe: filled with the temperature color, label above or below
const tBadge = (x, y, v, id, label, ly) => `
  <g ${mi(id)}>
    <text x="${x}" y="${ly}" text-anchor="middle" style="font-size:9px;letter-spacing:.8px;font-weight:600;fill:${SEC}">${label}</text>
    <rect x="${x - 29}" y="${y - 12}" width="58" height="24" rx="12" style="fill:${tc(v)};stroke:${CARD_BG};stroke-width:2"/>
    <text x="${x}" y="${y + 4.8}" text-anchor="middle" style="font-size:13.5px;font-weight:600;fill:${ink(v)};font-variant-numeric:tabular-nums">${f(v)}</text>
  </g>`;
