// ---------- B: temperature bars, dashed line = boiler ----------
const p0 = tb === null ? null : pct(tb);
const COLS = 'grid-template-columns:76px minmax(0,1fr) 46px 40px;column-gap:10px';
const dc = d => d === null ? SEC : d >= C.min_delta ? SUC : d >= 0 ? WRN : ERR;
const ref = p0 !== null ? `<div style="position:absolute;top:0;bottom:0;left:${p0}%;border-left:1.5px dashed ${cB};opacity:.8"></div>` : '';
const row = (label, v, id) => {
  const p = v === null ? 0 : pct(v);
  const d = v !== null && tb !== null ? v - tb : null;
  return `
  <div ${mi(id)} style="display:grid;${COLS};align-items:center;height:30px">
    <div style="font-size:9.5px;letter-spacing:1px;font-weight:600;color:${SEC};white-space:nowrap">${label}</div>
    <div style="position:relative;height:100%">
      <div style="position:absolute;left:0;right:0;top:11px;height:8px;border-radius:4px;background:${scaleGrad('90deg')};opacity:.16"></div>
      <div style="position:absolute;left:0;top:11px;height:8px;border-radius:4px;width:${p}%;background:${scaleGrad('90deg')};background-size:${p > 0 ? 10000 / p : 100}% 100%"></div>
      ${ref}
      ${v !== null ? `<div style="position:absolute;top:8px;left:calc(${p}% - 7px);width:14px;height:14px;border-radius:50%;background:${CARD_BG};border:3px solid ${tc(v)};box-sizing:border-box"></div>` : ''}
    </div>
    <div style="font-size:14px;font-weight:600;color:${tc(v)};text-align:right;font-variant-numeric:tabular-nums">${f(v)}</div>
    <div style="font-size:11px;font-weight:500;color:${dc(d)};text-align:right;font-variant-numeric:tabular-nums">${sg(d)}</div>
  </div>`;
};
const valveRow = `
  <div ${mi(C.valve)} style="display:grid;${COLS};align-items:center;height:30px">
    <div style="font-size:9.5px;letter-spacing:1px;font-weight:600;color:${SEC}">VENTIL</div>
    <div style="position:relative;height:100%;display:flex;align-items:center">
      ${ref}
      <span style="position:relative;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:12px;background:linear-gradient(${tint(vCol, open ? 16 : 10)}, ${tint(vCol, open ? 16 : 10)}), ${CARD_BG};color:${vCol}">
        <span style="width:7px;height:7px;border-radius:50%;background:${vCol}"></span>${vTxt}
        <span style="font-weight:400;color:${SEC}">${vOk ? ago(vS.last_changed) : ''}</span>
      </span>
    </div>
    <div></div><div></div>
  </div>`;
const ticks = [0, .25, .5, .75, 1].map(k => {
  const t = C.cold + k * (C.hot - C.cold);
  return `<span style="position:absolute;left:${k * 100}%;transform:translateX(${k === 0 ? 0 : k === 1 ? -100 : -50}%)">${Math.round(t)}°</span>`;
}).join('');

return wrap(`
  ${header()}
  <div style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap">
    <div ${mi(C.boiler)}>
      <div style="font-size:9.5px;letter-spacing:1.5px;font-weight:600;color:${SEC}">BOJLER</div>
      <div style="font-size:40px;line-height:1.1;font-weight:400;color:${cB};font-variant-numeric:tabular-nums">${tb === null ? '—' : tb.toFixed(1)}<span style="font-size:18px;vertical-align:top;margin-left:2px">°C</span></div>
    </div>
    <div style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:3px;font-size:10.5px;color:${SEC}">
      <span style="display:flex;align-items:center;gap:6px"><span style="width:16px;border-top:1.5px dashed ${cB}"></span>teplota bojlera</span>
      ${heating ? `<span style="color:${WRN};font-weight:600">⚡ elektrina ${pw !== null ? pwTxt : 'zapnutá'}</span>` : ''}
    </div>
  </div>
  <div>
    <div style="display:grid;${COLS};font-size:9px;color:${SEC};padding-bottom:2px"><span></span><span></span><span style="text-align:right">°C</span><span style="text-align:right">Δ bojler</span></div>
    ${row(lbl('supply'), t1, C.supply)}
    ${valveRow}
    ${row(lbl('coil_in'), t2, C.coil_in)}
    ${row(lbl('coil_out'), t3, C.coil_out)}
    <div style="display:grid;${COLS};font-size:9px;color:${SEC};padding-top:4px"><span></span><span style="position:relative;height:12px">${ticks}</span><span></span><span></span></div>
  </div>
  ${banner()}`);
