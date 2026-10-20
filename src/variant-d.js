// ---------- D: compact tile ----------
const seg = (v, w) => `<div style="flex:${w};height:8px;background:${tc(v)};opacity:${v === null ? .25 : 1}"></div>`;
const tLbl = (t, v, col) => `<span style="white-space:nowrap"><span style="color:${SEC}">${t}</span> <b style="font-weight:600;color:${col}">${f(v)}</b></span>`;

return wrap(`
  <div style="display:flex;align-items:center;gap:12px">
    <div style="width:42px;height:42px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${tint(st.c, 15)};color:${st.c}">
      <ha-icon icon="${st.k === 'el' ? 'mdi:flash' : 'mdi:water-boiler'}" style="--mdc-icon-size:22px"></ha-icon>
    </div>
    <div style="min-width:0;flex:1">
      <div style="font-size:15px;font-weight:500">${TITLE}</div>
      <div style="font-size:12px;color:${st.c};font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${st.label}${heating && st.k !== 'el' ? ' · ⚡ elektrina' : ''}</div>
    </div>
    <div ${mi(C.boiler)} style="font-size:30px;font-weight:400;line-height:1;color:${cB};font-variant-numeric:tabular-nums">${tb === null ? '—' : tb.toFixed(1)}<span style="font-size:14px;vertical-align:top">°C</span></div>
  </div>
  <div style="display:flex;align-items:center;gap:0;border-radius:4px;overflow:visible">
    <div style="display:flex;flex:2;border-radius:4px 0 0 4px;overflow:hidden">${seg(t1, 1)}</div>
    <div ${mi(C.valve)} style="width:18px;height:18px;margin:0 3px;border-radius:50%;flex-shrink:0;box-sizing:border-box;border:3px solid ${vCol};background:${open ? vCol : CARD_BG}" title="ventil ${vTxt}"></div>
    <div style="display:flex;flex:3;border-radius:0 4px 4px 0;overflow:hidden;opacity:${open ? 1 : .45}">${seg(t2, 1)}${seg(t3, 1)}</div>
  </div>
  <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:11.5px;font-variant-numeric:tabular-nums">
    ${tLbl(lbl('supply').toLowerCase(), t1, c1)}${tLbl(lbl('coil_in').toLowerCase(), t2, c2)}${tLbl(lbl('coil_out').toLowerCase(), t3, c3)}
  </div>`);
