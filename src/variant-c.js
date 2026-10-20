// ---------- C: boiler gauge + one color-graded pipe ----------
const GX = 110, GY = 112, GR = 88, N = 48;
const pt = (a, r) => `${(GX + r * Math.cos(a)).toFixed(2)} ${(GY - r * Math.sin(a)).toFixed(2)}`;
const fillP = tb === null ? -1 : pct(tb);
let arc = '';
for (let i = 0; i < N; i++) {
  const a0 = Math.PI - i * Math.PI / N, a1 = Math.PI - (i + 1) * Math.PI / N - 0.004;
  const mid = (i + .5) / N;
  arc += `<path d="M${pt(a0, GR)} A${GR} ${GR} 0 0 1 ${pt(a1, GR)}" style="fill:none;stroke:${tc(C.cold + mid * (C.hot - C.cold))};stroke-width:14;opacity:${mid * 100 <= fillP ? 1 : .14}"/>`;
}
const mark = (v, col, lbl) => {
  if (v === null) return '';
  const a = Math.PI - pct(v) / 100 * Math.PI;
  const [x, y] = pt(a, GR + 15).split(' ');
  return `<circle cx="${x}" cy="${y}" r="5" style="fill:${col};stroke:${CARD_BG};stroke-width:2"/>
    <text x="${x}" y="${(+y - 9).toFixed(1)}" text-anchor="middle" style="font-size:7.5px;font-weight:600;fill:${SEC}">${lbl}</text>`;
};
const gauge = `
<svg viewBox="-8 -10 236 140" style="width:100%;max-width:240px;height:auto;display:block" ${mi(C.boiler)}>
  ${arc}
  ${mark(t1, c1, 'prívod')}
  <text x="${GX}" y="66" text-anchor="middle" style="font-size:8px;letter-spacing:1.5px;font-weight:600;fill:${SEC}">BOJLER</text>
  <text x="${GX}" y="104" text-anchor="middle" style="font-size:36px;font-weight:400;fill:${cB};font-variant-numeric:tabular-nums">${tb === null ? '—' : tb.toFixed(1)}<tspan dy="-14" style="font-size:16px">°C</tspan></text>
  <text x="${GX - GR}" y="128" text-anchor="middle" style="font-size:8px;fill:${SEC}">${C.cold}°</text>
  <text x="${GX + GR}" y="128" text-anchor="middle" style="font-size:8px;fill:${SEC}">${C.hot}°</text>
</svg>`;

// pipe: supply -> valve -> coil in -> [boiler coil] -> coil out
const PY = 46, X0 = 10, X1 = 350, P1 = 40, PV = 108, P2 = 172, B0 = 214, B1 = 278, P3 = 324;
const off = x => ((x - X0) / (X1 - X0)).toFixed(3);
const zig = `M${B0} ${PY} l4 -10 l8 20 l8 -20 l8 20 l8 -20 l8 20 l8 -20 l8 20 l4 -10`;
const pipe = `
<svg viewBox="0 0 360 86" style="width:100%;height:auto;display:block;overflow:visible">
  <defs>
    <linearGradient id="p${U}" gradientUnits="userSpaceOnUse" x1="${X0}" y1="0" x2="${X1}" y2="0">
      <stop offset="${off(P1)}" style="stop-color:${c1}"/><stop offset="${off(PV)}" style="stop-color:${c1}"/>
      <stop offset="${off(P2)}" style="stop-color:${c2}"/><stop offset="${off(B0)}" style="stop-color:${c2}"/>
      <stop offset="${off(B1)}" style="stop-color:${c3}"/>
    </linearGradient>
  </defs>
  <rect x="${B0 - 4}" y="${PY - 24}" width="${B1 - B0 + 8}" height="48" rx="14" ${mi(C.boiler)} style="fill:${cB};fill-opacity:.12;stroke:${st.k === 'bad' ? ERR : SEC};stroke-opacity:${st.k === 'bad' ? 1 : .35};stroke-width:2"/>
  <text x="${(B0 + B1) / 2}" y="${PY - 30}" text-anchor="middle" style="font-size:7.5px;letter-spacing:1px;font-weight:600;fill:${SEC}">V BOJLERI</text>
  <path d="M${X0} ${PY} H${PV}" style="fill:none;stroke:url(#p${U});stroke-width:6;stroke-linecap:round"/>
  <path d="M${PV} ${PY} H${B0} ${zig.slice(zig.indexOf('l'))} H${X1}" style="fill:none;stroke:url(#p${U});stroke-width:${open ? 6 : 5};stroke-linecap:round;stroke-linejoin:round;opacity:${open ? 1 : .45}"/>
  ${flow(`M${X0} ${PY} H${B0} ${zig.slice(zig.indexOf('l'))} H${X1}`)}
  <g ${mi(C.valve)}>
    <path d="M${PV - 12} ${PY - 10} L${PV} ${PY} L${PV - 12} ${PY + 10} Z M${PV + 12} ${PY - 10} L${PV} ${PY} L${PV + 12} ${PY + 10} Z" style="fill:${vCol};fill-opacity:${open ? 1 : .55};stroke:${CARD_BG};stroke-width:1.5;stroke-linejoin:round"/>
    <text x="${PV}" y="${PY + 26}" text-anchor="middle" style="font-size:7.5px;letter-spacing:1px;font-weight:600;fill:${vCol}">${vTxt.toUpperCase()}</text>
  </g>
  ${tBadge(P1, PY, t1, C.supply, lbl('supply'), PY - 18)}
  ${tBadge(P2, PY, t2, C.coil_in, lbl('coil_in'), PY - 18)}
  ${tBadge(P3, PY, t3, C.coil_out, lbl('coil_out'), PY - 18)}
  <text x="${(B0 + B1) / 2}" y="${PY + 38}" text-anchor="middle" style="font-size:9px;font-weight:600;fill:${dCol};font-variant-numeric:tabular-nums">Δ ${sg(dCoil)}</text>
  <text x="${X0}" y="${PY + 38}" style="font-size:7.5px;fill:${SEC}">z kúrenia →</text>
  <text x="${X1}" y="${PY + 38}" text-anchor="end" style="font-size:7.5px;fill:${SEC}">→ do kúrenia</text>
</svg>`;

const stat = (label, val, col, id) => `
  <div ${mi(id)}>
    <div style="font-size:10px;color:${SEC}">${label}</div>
    <div style="font-size:15px;font-weight:500;color:${col};font-variant-numeric:tabular-nums;white-space:nowrap">${val}</div>
  </div>`;

return wrap(`
  ${header()}
  <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center">
    <div style="flex:1 1 200px;display:flex;justify-content:center">${gauge}</div>
    <div style="flex:1 1 120px;display:grid;grid-template-columns:1fr 1fr;gap:10px 12px">
      ${stat('prívod − bojler', sg(dSup), supCol, C.supply)}
      ${stat('výmenník Δ', sg(dCoil), dCol, C.coil_in)}
      ${stat('ventil', vTxt, vCol, C.valve)}
      ${stat(open ? 'otvorený už' : 'zmena pred', vOk ? ago(vS.last_changed) : '—', SEC, C.valve)}
    </div>
  </div>
  <div style="padding-top:12px;border-top:1px solid var(--divider-color)">${pipe}</div>
  ${banner()}`);
