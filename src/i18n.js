// ---------- translations (language: auto = Home Assistant's language, sk, cs, en) ----------
const I18N = {
  sk: {
    title: 'Bojler', BOILER: 'BOJLER', boiler: 'bojler',
    supply: 'PRÍVOD', coil_in: 'DO BOJLERA', coil_out: 'SPIATOČKA',
    hot_water: 'TEPLÁ VODA', cold_water: 'STUDENÁ VODA',
    open: 'otvorený', closed: 'zatvorený', unavailable: 'nedostupný', valve: 'ventil', valve_q: 'VENTIL ?',
    valve_unavailable: 'ventil nedostupný', el_badge: '⚡ elektrina',
    na: 'nedostupné', na_txt: 'Teplotné senzory sú nedostupné',
    bad: 'bojler kúri radiátory',
    bad_txt: (tin, tb) => `Ventil je otvorený, ale voda z kúrenia (${tin}) je chladnejšia ako bojler (${tb}). Bojler ohrieva radiátory.`,
    tuv: 'ohrev z kúrenia', tuv_txt: d => 'Kúrenie ohrieva bojler' + (d !== null ? ` · výmenník odovzdáva ${d.toFixed(1)}°` : ''),
    ready: 'kúrenie je teplé', ready_txt: d => `Prívod je o ${d.toFixed(1)}° teplejší ako bojler, ventil by mohol otvoriť`,
    el: 'elektrický ohrev', el_txt: colder => `Ohrieva elektrina · kúrenie je ${colder ? 'chladnejšie ako bojler' : 'málo teplé'}`,
    idle: 'pohotovosť',
    idle_txt: d => d === null ? 'Ventil zatvorený' : `Ventil zatvorený · prívod je ${d >= 0 ? 'len o ' + d.toFixed(1) + '° teplejší' : 'o ' + (-d).toFixed(1) + '° chladnejší'} ako bojler`,
    s_sup: 'prívod − bojler', s_coil: 'výmenník Δ', s_el: 'elektrina', el_on: 'zapnutá', el_off: 'vypnutá',
    coil_only_open: 'len pri otvorenom ventile',
    just_now: 'práve',
    hist: 'HISTÓRIA', hist_now: 'teraz', c_heat: 'ohrev z kúrenia', c_el: 'elektrina', c_kwh: 'spotreba elektriny',
    c_rev: 'bojler kúril radiátory', h_heat: 'kúrenie', h_el: 'elektrina', h_valve: 'ventil', h_element: 'špirála',
    loading: 'Načítavam históriu…', hist_err: 'História nie je dostupná: ',
    pick: 'Vyber entitu bojlera (teplota) a ventilu v editore karty.',
    off_peak_txt: 'Vysoký tarif: špirála je vypnutá', el_peak: 'kúri vo vysokom tarife', el_peak_txt: 'Elektrická špirála kúri vo vysokom tarife (drahšia elektrina)',
    sw_on: 'ZAP', sw_off: 'VYP', sw_off_label: 'špirála vypnutá', sw_off_txt: 'Elektrická špirála je vypnutá vypínačom',
    until: 'do', nt: 'NT', vt: 'VT', nt_long: 'nízky tarif', vt_long: 'vysoký tarif',
    blocked: 'vysoký tarif', blocked_txt: 'Vysoký tarif: špirála je bez prúdu',
  },
  cs: {
    title: 'Bojler', BOILER: 'BOJLER', boiler: 'bojler',
    supply: 'PŘÍVOD', coil_in: 'DO BOJLERU', coil_out: 'ZPÁTEČKA',
    hot_water: 'TEPLÁ VODA', cold_water: 'STUDENÁ VODA',
    open: 'otevřený', closed: 'zavřený', unavailable: 'nedostupný', valve: 'ventil', valve_q: 'VENTIL ?',
    valve_unavailable: 'ventil nedostupný', el_badge: '⚡ elektřina',
    na: 'nedostupné', na_txt: 'Teplotní senzory jsou nedostupné',
    bad: 'bojler topí radiátory',
    bad_txt: (tin, tb) => `Ventil je otevřený, ale voda z topení (${tin}) je chladnější než bojler (${tb}). Bojler ohřívá radiátory.`,
    tuv: 'ohřev z topení', tuv_txt: d => 'Topení ohřívá bojler' + (d !== null ? ` · výměník předává ${d.toFixed(1)}°` : ''),
    ready: 'topení je teplé', ready_txt: d => `Přívod je o ${d.toFixed(1)}° teplejší než bojler, ventil by mohl otevřít`,
    el: 'elektrický ohřev', el_txt: colder => `Ohřívá elektřina · topení je ${colder ? 'chladnější než bojler' : 'málo teplé'}`,
    idle: 'pohotovost',
    idle_txt: d => d === null ? 'Ventil zavřený' : `Ventil zavřený · přívod je ${d >= 0 ? 'jen o ' + d.toFixed(1) + '° teplejší' : 'o ' + (-d).toFixed(1) + '° chladnější'} než bojler`,
    s_sup: 'přívod − bojler', s_coil: 'výměník Δ', s_el: 'elektřina', el_on: 'zapnutá', el_off: 'vypnutá',
    coil_only_open: 'jen při otevřeném ventilu',
    just_now: 'právě',
    hist: 'HISTORIE', hist_now: 'teď', c_heat: 'ohřev z topení', c_el: 'elektřina', c_kwh: 'spotřeba elektřiny',
    c_rev: 'bojler topil radiátory', h_heat: 'topení', h_el: 'elektřina', h_valve: 'ventil', h_element: 'spirála',
    loading: 'Načítám historii…', hist_err: 'Historie není dostupná: ',
    pick: 'Vyberte entitu teploty bojleru a ventil v editoru karty.',
    off_peak_txt: 'Vysoký tarif: spirála je vypnutá', el_peak: 'topí ve vysokém tarifu', el_peak_txt: 'Elektrická spirála topí ve vysokém tarifu (dražší elektřina)',
    sw_on: 'ZAP', sw_off: 'VYP', sw_off_label: 'spirála vypnutá', sw_off_txt: 'Elektrická spirála je vypnutá vypínačem',
    until: 'do', nt: 'NT', vt: 'VT', nt_long: 'nízký tarif', vt_long: 'vysoký tarif',
    blocked: 'vysoký tarif', blocked_txt: 'Vysoký tarif: spirála je bez proudu',
  },
  en: {
    title: 'Boiler', BOILER: 'BOILER', boiler: 'boiler',
    supply: 'SUPPLY', coil_in: 'TO BOILER', coil_out: 'RETURN',
    hot_water: 'HOT WATER', cold_water: 'COLD WATER',
    open: 'open', closed: 'closed', unavailable: 'unavailable', valve: 'valve', valve_q: 'VALVE ?',
    valve_unavailable: 'valve unavailable', el_badge: '⚡ electric',
    na: 'unavailable', na_txt: 'Temperature sensors are unavailable',
    bad: 'boiler heats radiators',
    bad_txt: (tin, tb) => `The valve is open, but the heating water (${tin}) is colder than the boiler (${tb}). The boiler is heating the radiators.`,
    tuv: 'heated by heating', tuv_txt: d => 'The heating is warming the boiler' + (d !== null ? ` · the coil passes on ${d.toFixed(1)}°` : ''),
    ready: 'heating is warm', ready_txt: d => `The supply is ${d.toFixed(1)}° warmer than the boiler, the valve could open`,
    el: 'electric heating', el_txt: colder => `Electricity is heating · the heating water is ${colder ? 'colder than the boiler' : 'not warm enough'}`,
    idle: 'standby',
    idle_txt: d => d === null ? 'Valve closed' : `Valve closed · the supply is ${d >= 0 ? 'only ' + d.toFixed(1) + '° warmer' : (-d).toFixed(1) + '° colder'} than the boiler`,
    s_sup: 'supply − boiler', s_coil: 'coil Δ', s_el: 'electricity', el_on: 'on', el_off: 'off',
    coil_only_open: 'only while the valve is open',
    just_now: 'now',
    hist: 'HISTORY', hist_now: 'now', c_heat: 'heated by heating', c_el: 'electricity', c_kwh: 'electricity used',
    c_rev: 'boiler heated radiators', h_heat: 'heating', h_el: 'electricity', h_valve: 'valve', h_element: 'element',
    loading: 'Loading history…', hist_err: 'History is not available: ',
    pick: 'Pick the boiler temperature and the valve in the card editor.',
    off_peak_txt: 'Peak tariff: the element is switched off', el_peak: 'heating at peak tariff', el_peak_txt: 'The electric element is heating at the peak tariff (more expensive electricity)',
    sw_on: 'ON', sw_off: 'OFF', sw_off_label: 'element off', sw_off_txt: 'The electric element is switched off',
    until: 'until', nt: 'off-peak', vt: 'peak', nt_long: 'off-peak tariff', vt_long: 'peak tariff',
    blocked: 'peak tariff', blocked_txt: 'Peak tariff: the element gets no power',
  },
};
// optional tariff entity: true = low tariff, false = high tariff, null = no tariff / unknown.
// tariff_low lists the states that mean low tariff (comma-separated). Matching ignores case and accents, and a
// token also matches as a whole word of a longer text, so "Nizky Tarif do 18:35" counts as low via "nizky".
const plainText = v => String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const isLowTariff = (state, lowList) => {
  if (state === undefined || state === null || ['unknown', 'unavailable', ''].includes(state)) return null;
  const st = plainText(state), words = st.split(/[^a-z0-9-]+/);
  const exactOnly = ['on', 'off', 'true', 'false', '0', '1'];  // switch-like states never match inside a longer text
  return String(lowList || '').split(',').map(plainText).filter(Boolean)
    .some(tok => st === tok || (!exactOnly.includes(tok) && words.includes(tok)));
};
const i18nLang = (language, haLang) => {
  const l = String((language && language !== 'auto' ? language : haLang) || 'sk').slice(0, 2);
  return I18N[l] ? l : 'en';
};
// custom label if the user set one, otherwise the default of the current language
// (a saved default from any language counts as "not set", so switching language translates it)
const i18nText = (cfg, key, cfgKey) => {
  const v = cfg[cfgKey], T = I18N[cfg.lang || 'sk'];
  return v && !Object.values(I18N).some(t => t[key] === v) ? v : T[key];
};
