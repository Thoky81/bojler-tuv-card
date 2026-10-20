// ---------- schematic ----------
const SY = 124, RY = 166, VX = 112, TX = 168, WALL = 214;
const dim = open ? 1 : 0.4;
const coil = `M${WALL} ${SY} H292 a7 7 0 0 1 0 14 H240 a7 7 0 0 0 0 14 H292 a7 7 0 0 1 0 14 H${WALL}`;

const svg = `
<svg viewBox="0 0 400 244" style="width:100%;height:auto;display:block;overflow:visible">
  <defs>
    <linearGradient id="w${U}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:${tc(tb === null ? null : tb + 3)}"/>
      <stop offset="1" style="stop-color:${tc(tb === null ? null : tb - 12)}"/>
    </linearGradient>
    <linearGradient id="c${U}" gradientUnits="userSpaceOnUse" x1="0" y1="${SY}" x2="0" y2="${RY}">
      <stop offset="0" style="stop-color:${c2}"/><stop offset="1" style="stop-color:${c3}"/>
    </linearGradient>
  </defs>

  <!-- hot / cold water -->
  <path d="M266 18 V8 H392" style="fill:none;stroke:${cB};stroke-width:5;stroke-linecap:round;stroke-opacity:.55"/>
  <text x="392" y="24" text-anchor="end" style="font-size:8.5px;letter-spacing:1px;font-weight:600;fill:${SEC}">TEPLÁ VODA</text>
  <path d="M266 226 V236 H392" style="fill:none;stroke:${tc(C.cold)};stroke-width:5;stroke-linecap:round;stroke-opacity:.7"/>
  <text x="392" y="228" text-anchor="end" style="font-size:8.5px;letter-spacing:1px;font-weight:600;fill:${SEC}">STUDENÁ VODA</text>

  <!-- tank -->
  <g ${mi(C.boiler)}>
    <rect x="${WALL}" y="18" width="104" height="208" rx="40" style="fill:url(#w${U});fill-opacity:.2;stroke:${st.k === 'bad' ? ERR : SEC};stroke-opacity:${st.k === 'bad' ? 1 : .35};stroke-width:3"/>
    <text x="266" y="62" text-anchor="middle" style="font-size:9px;letter-spacing:1.5px;font-weight:600;fill:${SEC}">BOJLER</text>
    <text x="266" y="96" text-anchor="middle" style="font-size:30px;font-weight:500;fill:${cB};font-variant-numeric:tabular-nums">${tb === null ? '—' : tb.toFixed(1)}<tspan style="font-size:16px" dy="-11">°C</tspan></text>
  </g>

  <!-- coil -->
  <path d="${coil}" style="fill:none;stroke:url(#c${U});stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:${open ? 1 : .5}"/>
  ${flow(coil)}

  <!-- electric element -->
  <g ${mi(C.heater || C.heater_power)}>
    ${heating ? `<path d="M318 192 H246 a5 5 0 0 0 0 10 H318" style="fill:none;stroke:${WRN};stroke-opacity:.25;stroke-width:9;stroke-linecap:round"/>` : ''}
    <path d="M318 192 H246 a5 5 0 0 0 0 10 H318" style="fill:none;stroke:${heating ? WRN : SEC};stroke-opacity:${heating ? 1 : .45};stroke-width:3;stroke-linecap:round"/>
    <rect x="315" y="186" width="9" height="22" rx="2" style="fill:${SEC};fill-opacity:.5"/>
    ${hasHeater ? `<path d="M7,2V13H10V22L17,10H13L17,2H7Z" transform="translate(326 183) scale(.8)" style="fill:${heating ? WRN : SEC};fill-opacity:${heating ? 1 : .5}"/>` : ''}
    ${pw !== null && heating ? `<text x="338" y="215" text-anchor="middle" style="font-size:8.5px;font-weight:600;fill:${heating ? WRN : SEC}">${pw >= 1000 ? (pw / 1000).toFixed(1) + ' kW' : Math.round(pw) + ' W'}</text>` : ''}
  </g>

  <!-- heating circuit -->
  <g style="fill:${SEC};fill-opacity:.55">
    <rect x="2" y="134" width="4" height="22" rx="2"/><rect x="8" y="134" width="4" height="22" rx="2"/><rect x="14" y="134" width="4" height="22" rx="2"/>
  </g>
  <path d="M10 134 V${SY} H${VX}" style="fill:none;stroke:${c1};stroke-width:6;stroke-linecap:round;stroke-linejoin:round"/>
  <path d="M${VX} ${SY} H${WALL}" style="fill:none;stroke:${c2};stroke-width:6;stroke-linecap:round;opacity:${dim}"/>
  <path d="M${WALL} ${RY} H10 V156" style="fill:none;stroke:${c3};stroke-width:6;stroke-linecap:round;stroke-linejoin:round;opacity:${dim}"/>
  ${flow(`M10 134 V${SY} H${WALL}`)}
  ${flow(`M${WALL} ${RY} H10 V156`)}

  <!-- valve -->
  <g ${mi(C.valve)}>
    <rect x="${VX - 9}" y="94" width="18" height="12" rx="2.5" style="fill:${vCol};fill-opacity:${open ? 1 : .55}"/>
    <rect x="${VX - 1}" y="106" width="2" height="9" style="fill:${vCol}"/>
    <path d="M${VX - 12} 114 L${VX} ${SY} L${VX - 12} 134 Z M${VX + 12} 114 L${VX} ${SY} L${VX + 12} 134 Z" style="fill:${vCol};fill-opacity:${open ? 1 : .55};stroke:${CARD_BG};stroke-width:1.5;stroke-linejoin:round"/>
    <text x="${VX}" y="151" text-anchor="middle" style="font-size:8.5px;letter-spacing:1px;font-weight:600;fill:${vCol}">${!vOk ? 'VENTIL ?' : open ? 'OTVORENÝ' : 'ZATVORENÝ'}</text>
  </g>

  ${tBadge(52, SY, t1, C.supply, C.label_supply, 105)}
  ${tBadge(TX, SY, t2, C.coil_in, C.label_coil_in, 105)}
  ${tBadge(TX, RY, t3, C.coil_out, C.label_coil_out, 193)}
  ${open ? `<text x="${TX}" y="149" text-anchor="middle" style="font-size:10px;font-weight:600;fill:${dCol};font-variant-numeric:tabular-nums"><title>${C.label_coil_in.toLowerCase()} ${f(t2)} − ${C.label_coil_out.toLowerCase()} ${f(t3)}</title>Δ ${sg(dCoil)}</text>` : ''}
</svg>`;

// ---------- stats ----------
const cell = (label, val, col, id, tip = '') => `
  <div ${mi(id)} ${tip ? `title="${tip}"` : ''} style="min-width:0">
    <div style="font-size:11px;color:${SEC};white-space:nowrap">${label}</div>
    <div style="font-size:15px;font-weight:500;color:${col};white-space:nowrap;font-variant-numeric:tabular-nums">${val}</div>
  </div>`;
let cells = cell('bojler', f(tb), cB, C.boiler)
  + cell('prívod − bojler', sg(dSup), supCol, C.supply, `${C.label_supply.toLowerCase()} ${f(t1)} − bojler ${f(tb)}`)
  // with the valve closed the water in the coil stands still, so in − out says nothing
  + cell('výmenník Δ', open ? sg(dCoil) : '—', dCol, C.coil_in,
    open ? `${C.label_coil_in.toLowerCase()} ${f(t2)} − ${C.label_coil_out.toLowerCase()} ${f(t3)}` : 'len pri otvorenom ventile')
  + cell(vOk ? `ventil · ${ago(vS.last_changed)}` : 'ventil', vTxt, vCol, C.valve);
if (pw !== null) cells += cell('elektrina', pw >= 1000 ? (pw / 1000).toFixed(2) + ' kW' : Math.round(pw) + ' W', heating ? WRN : SEC, C.heater_power);
else if (C.heater) cells += cell('elektrina', heating ? 'zapnutá' : 'vypnutá', heating ? WRN : SEC, C.heater);

return wrap(`
  ${C.show_header !== false ? header() : ''}
  ${svg}
  ${C.show_stats !== false ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(76px,1fr));gap:8px;padding-top:10px;border-top:1px solid var(--divider-color)">${cells}</div>` : ''}
  ${C.show_banner !== false ? banner() : ''}`);
