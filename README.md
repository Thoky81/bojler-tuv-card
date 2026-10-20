# Bojler TUV Card

A Home Assistant dashboard card for a combined hot-water boiler that can be heated two ways: by its electric element, or by water from the central-heating circuit through a coil, switched by a valve. *Bojler* is Slovak and Czech for boiler, *TUV* (*teplá úžitková voda*) for domestic hot water.

![Bojler TUV Card](docs/screenshot.png)

The card draws the boiler, the coil, the valve and the electric element. Pipe colors follow their temperature, from blue (0 °C) to red (80 °C). While the valve is open, moving dashes show the water flowing.

It also tells you what is going on:

| Status | Slovenčina | Čeština | When |
|---|---|---|---|
| **heated by heating** (green) | ohrev z kúrenia | ohřev z topení | Valve open and the heating water is warmer than the boiler |
| **boiler heats radiators** (red) | bojler kúri radiátory | bojler topí radiátory | Valve open but the heating water is colder than the boiler, so the boiler is heating your radiators |
| **heating is warm** (blue) | kúrenie je teplé | topení je teplé | Valve closed although the supply is warmer than the boiler by at least `min_delta` |
| **electric heating** (orange) | elektrický ohrev | elektrický ohřev | The electric element is on and the heating water is too cold to help |
| **peak tariff** (grey) | vysoký tarif | vysoký tarif | Only with a tariff entity: peak tariff, the electric element is switched off by the utility |
| **standby** (grey) | pohotovosť | pohotovost | Nothing is heating |

The values row under the drawing shows **supply − boiler** (positive means the heating water is warmer and worth using) and **coil Δ** (into the coil minus out of it: how much the water cooled in the boiler, shown only while the valve is open). Hover a value to see the calculation.

Below the drawing, a history section (last 24 hours by default) shows:

- **Summary:** how long the heating water heated the boiler, how long the electricity did, the electricity used in kWh, and, only if it happened, how long the boiler was heating the radiators.
- **Boiler vs. supply graph:** boiler as the thick line, supply as the thin one; green area where the heating water was warmer than the boiler, red where the valve was open although it was colder.
- **Hourly bars:** minutes per hour heated by the heating water (green) and by electricity (orange).
- **Element power (optional, `graph_power`):** the power sensor as a faint orange area in the lower part of the graph, each longer run labeled with the energy it used (e.g. *5.8 kWh*). Values are 5-minute averages, so a run of 2 minutes shows as a lower bump.

**Two tariffs (optional).** Where the utility switches the boiler off during the peak tariff (in Slovakia and Czechia *vysoký / nízký tarif*, *VT / NT*, controlled by *HDO*), pick your tariff entity in the editor. The card then shows an off-peak/peak badge, explains that the element is switched off during the peak tariff, and marks the off-peak periods under the hourly bars. With a second, optional sensor that contains the time of the next change (a text such as "Vysoky Tarif do 16:55", or a timestamp), the badge and status also say until when. Leave it empty if you have a single rate; the card then looks as before.

**Landscape on wide dashboards.** When the card is wider than 720 px (for example a section spanning two columns), the history moves to the right of the drawing; on narrower cards and phones it stays below. Set `layout` to keep it always below (`stacked`) or always beside (`side`).

Move the mouse or a finger over the graph to read the values at that time. Click any temperature, the valve or the element in the drawing to open its history in Home Assistant.

## Languages

The card speaks **English, Slovak and Czech**, including the card editor. By default it follows your Home Assistant language (English for any language other than Slovak or Czech); pick one in the editor under *Language* or set `language: en`, `sk` or `cs`. You can rename the title and the pipe labels; leave them empty for the default text of the chosen language.

### In the card

|  | English | Slovenčina | Čeština |
| --- | --- | --- | --- |
| Title | Boiler | Bojler | Bojler |
| Pipe labels | SUPPLY · TO BOILER · RETURN | PRÍVOD · DO BOJLERA · SPIATOČKA | PŘÍVOD · DO BOJLERU · ZPÁTEČKA |
| Water pipes | HOT WATER · COLD WATER | TEPLÁ VODA · STUDENÁ VODA | TEPLÁ VODA · STUDENÁ VODA |
| Valve | valve · open · closed · unavailable | ventil · otvorený · zatvorený · nedostupný | ventil · otevřený · zavřený · nedostupný |
| Values row | boiler · supply − boiler · coil Δ · electricity | bojler · prívod − bojler · výmenník Δ · elektrina | bojler · přívod − bojler · výměník Δ · elektřina |
| Header badges | ⚡ electric · valve unavailable | ⚡ elektrina · ventil nedostupný | ⚡ elektřina · ventil nedostupný |
| Status: heated by heating | heated by heating — The heating is warming the boiler · the coil passes on 12.5° | ohrev z kúrenia — Kúrenie ohrieva bojler · výmenník odovzdáva 12.5° | ohřev z topení — Topení ohřívá bojler · výměník předává 12.5° |
| Status: boiler heats radiators | boiler heats radiators — The valve is open, but the heating water (44.0°) is colder than the boiler (51.5°). The boiler is heating the radiators. | bojler kúri radiátory — Ventil je otvorený, ale voda z kúrenia (44.0°) je chladnejšia ako bojler (51.5°). Bojler ohrieva radiátory. | bojler topí radiátory — Ventil je otevřený, ale voda z topení (44.0°) je chladnější než bojler (51.5°). Bojler ohřívá radiátory. |
| Status: heating is warm | heating is warm — The supply is 9.0° warmer than the boiler, the valve could open | kúrenie je teplé — Prívod je o 9.0° teplejší ako bojler, ventil by mohol otvoriť | topení je teplé — Přívod je o 9.0° teplejší než bojler, ventil by mohl otevřít |
| Status: electric heating | electric heating — Electricity is heating · the heating water is colder than the boiler | elektrický ohrev — Ohrieva elektrina · kúrenie je chladnejšie ako bojler | elektrický ohřev — Ohřívá elektřina · topení je chladnější než bojler |
| Status: standby | standby — Valve closed · the supply is 5.0° colder than the boiler | pohotovosť — Ventil zatvorený · prívod je o 5.0° chladnejší ako bojler | pohotovost — Ventil zavřený · přívod je o 5.0° chladnější než bojler |
| Status: peak tariff | peak tariff until 16:55 — Peak tariff: the electric element is switched off until 16:55 | vysoký tarif do 16:55 — Vysoký tarif: elektrická špirála je vypnutá do 16:55 | vysoký tarif do 16:55 — Vysoký tarif: elektrická spirála je vypnutá do 16:55 |
| Tariff badge | off-peak · peak until 16:55 (off-peak tariff · peak tariff) | NT · VT do 16:55 (nízky tarif · vysoký tarif) | NT · VT do 16:55 (nízký tarif · vysoký tarif) |
| Status: unavailable | unavailable — Temperature sensors are unavailable | nedostupné — Teplotné senzory sú nedostupné | nedostupné — Teplotní senzory jsou nedostupné |
| History | HISTORY · now · heated by heating · electricity · electricity used · boiler heated radiators | HISTÓRIA · teraz · ohrev z kúrenia · elektrina · spotreba elektriny · bojler kúril radiátory | HISTORIE · teď · ohřev z topení · elektřina · spotřeba elektřiny · bojler topil radiátory |
| Graph hover | heating 10 min · electricity 0 min | kúrenie 10 min · elektrina 0 min | topení 10 min · elektřina 0 min |
| Messages | Loading history… · History is not available · Pick the boiler temperature and the valve in the card editor. | Načítavam históriu… · História nie je dostupná · Vyber entitu bojlera (teplota) a ventilu v editore karty. | Načítám historii… · Historie není dostupná · Vyberte entitu teploty bojleru a ventil v editoru karty. |

### In the editor

| Option | English | Slovenčina | Čeština |
| --- | --- | --- | --- |
| `language` | Language | Jazyk | Jazyk |
| `title` | Title | Názov | Název |
| `boiler` | Boiler temperature | Teplota bojlera | Teplota bojleru |
| `supply` | Heating supply (in front of the valve) | Prívod z kúrenia (pred ventilom) | Přívod z topení (před ventilem) |
| `coil_in` | Into the boiler (after the valve) | Do bojlera (za ventilom) | Do bojleru (za ventilem) |
| `coil_out` | Return (out of the coil) | Spiatočka (z výmenníka) | Zpátečka (z výměníku) |
| `valve` | Valve | Ventil | Ventil |
| `heater_power` | Current power of the electric element (W or kW sensor) | Aktuálny príkon špirály (senzor W alebo kW) | Aktuální příkon spirály (senzor W nebo kW) |
| `heater` | Electric element (on/off) | Elektrická špirála (zap/vyp) | Elektrická spirála (zap/vyp) |
| `tariff` | Tariff (off-peak / peak) | Tarif (nízky / vysoký) | Tarif (nízký / vysoký) |
| `tariff_until` | Tariff change (sensor with the time) | Zmena tarifu (senzor s časom) | Změna tarifu (senzor s časem) |
| *(section)* | History | História | Historie |
| `show_graph` | Show history | Zobraziť históriu | Zobrazit historii |
| `graph_hours` | Period | Obdobie | Období |
| `graph_smooth` | Line smoothing | Vyhladenie čiar | Vyhlazení čar |
| `graph_power` | Element power in the graph | Príkon špirály v grafe | Příkon spirály v grafu |
| *(section)* | Advanced | Rozšírené | Rozšířené |
| `cold` | Blue at | Modrá pri | Modrá při |
| `hot` | Red at | Červená pri | Červená při |
| `min_delta` | Min. difference to heat | Min. rozdiel na ohrev | Min. rozdíl pro ohřev |
| `reverse_tol` | Alarm tolerance | Tolerancia alarmu | Tolerance alarmu |
| `heater_on_w` | Element heats above | Špirála kúri nad | Spirála topí nad |
| `animate` | Flow animation | Animácia toku | Animace toku |
| `show_header` | Header | Hlavička | Hlavička |
| `show_stats` | Values row | Riadok s hodnotami | Řádek s hodnotami |
| `layout` | Layout | Rozloženie | Rozložení |
| `show_banner` | Status bar | Stavový pruh | Stavový pruh |
| `tariff_low` | Tariff states that mean off-peak | Stavy tarifu, ktoré znamenajú nízky tarif | Stavy tarifu, které znamenají nízký tarif |
| `label_supply` | Label: supply | Popis: prívod | Popisek: přívod |
| `label_coil_in` | Label: into the boiler | Popis: do bojlera | Popisek: do bojleru |
| `label_coil_out` | Label: return | Popis: spiatočka | Popisek: zpátečka |

## Install with HACS

1. HACS → ⋮ (top right) → **Custom repositories**
2. Repository: `https://github.com/Thoky81/bojler-tuv-card`, type **Dashboard** → **Add**
3. Search for **Bojler TUV Card** in HACS → **Download**
4. Reload the browser (on the Companion app, pull down to refresh)

## Add the card

Edit a dashboard → **Add card** → search for **Bojler + TUV**. Pick the entities in the editor. Everything can be set there, no YAML needed.

Or in YAML:

```yaml
type: custom:bojler-tuv-card
boiler: sensor.bojler_temp_tuv_bojler          # boiler water temperature (required)
supply: sensor.tuv_sensors_tuv_pipe_near       # heating supply, before the valve
coil_in: sensor.bojler_temp_tuv_pipe           # after the valve, into the boiler coil
coil_out: sensor.tuv_sensors_tuv_pipe_near_2   # out of the coil, back to the heating
valve: switch.tuv_bojler_valve                 # switch, valve, binary_sensor or input_boolean (required)
heater_power: sensor.bojler_power              # electric element power in W
```

### All options

| Option | Default | What it does |
|---|---|---|
| `language` | `auto` | `auto` (Home Assistant's language), `en`, `sk` or `cs` |
| `title` | *Boiler* / *Bojler* | Card title; empty = default of the language |
| `boiler` | — | Boiler water temperature sensor (required) |
| `supply` | — | Heating supply temperature, before the valve |
| `coil_in` | — | Temperature after the valve, going into the coil |
| `coil_out` | — | Temperature coming out of the coil |
| `valve` | — | Valve entity; `on` / `open` counts as open (required) |
| `heater_power` | — | Electric element power sensor (W) |
| `heater` | — | Electric element on/off entity, if you have no power sensor |
| `heater_on_w` | `50` | Power above which the element counts as heating |
| `tariff` | — | Optional off-peak/peak entity (binary_sensor, sensor, select, schedule…); empty = single rate |
| `tariff_low` | `on, nt, low, nízky, nizky, nízký, offpeak, off-peak` | States of `tariff` that mean off-peak (comma-separated, any case). If your HDO relay is **on during the peak tariff**, set `off` |
| `tariff_until` | — | Optional sensor with the time of the next tariff change: any text containing a time (`Vysoky Tarif do 16:55`) or a timestamp |
| `cold` / `hot` | `0` / `80` | Temperatures drawn fully blue / fully red |
| `min_delta` | `3` | How much warmer (°C) the supply must be to count as useful |
| `reverse_tol` | `0.5` | Tolerance (°C) before the "boiler heats radiators" alarm |
| `animate` | `true` | Moving dashes in the pipes while the valve is open |
| `layout` | `auto` | `auto`: history beside the drawing when the card is wider than 720 px, below otherwise; `stacked`: always below; `side`: always beside |
| `show_header` / `show_stats` / `show_banner` | `true` | Show the header, the values row and the status bar |
| `show_graph` | `true` | Show the history section |
| `graph_hours` | `24` | Hours of history (1–168) |
| `graph_power` | `false` | Show the element power in the graph, with kWh per run (needs `heater_power`) |
| `graph_smooth` | `20` | Minutes of rolling average for the graph lines, so a cycling heat source doesn't zigzag (`0` = raw readings) |
| `label_supply` / `label_coil_in` / `label_coil_out` | language default | Pipe labels; empty = *SUPPLY / TO BOILER / RETURN* (en), *PRÍVOD / DO BOJLERA / SPIATOČKA* (sk), *PŘÍVOD / DO BOJLERU / ZPÁTEČKA* (cs) |

## Performance

The card redraws only when one of its own entities changes, not on every Home Assistant update. The history reads Home Assistant's 5-minute statistics (288 points per sensor per day) instead of the raw sensor history, loads once, then adds new readings from live updates and redraws at most once a minute. The boiler, supply and power sensors need a `state_class` (most temperature and power sensors have one); without it the card falls back to the raw history. The flow animation is plain CSS, limited to about 7 repaints per second because Safari repaints animated SVG on every frame. Set `animate: false` to turn it off on slow wall tablets.

## Valve automation (blueprint)

The card shows when the boiler heats the radiators; this blueprint keeps it from happening. It opens the valve when the heating water is at least 3 °C warmer than the boiler, closes it when it is less than 1 °C warmer, waits 2 minutes before each move so a cycling heat source doesn't flap the valve, sets the valve correctly after a restart, and closes it if a sensor becomes unavailable. All values can be changed when you create the automation.

[![Open your Home Assistant instance and show the blueprint import dialog.](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2FThoky81%2Fbojler-tuv-card%2Fblob%2Fmain%2Fblueprints%2Fbojler-ohrev-z-kurenia.yaml)

Or: Settings → Automations & scenes → Blueprints → **Import blueprint**, and paste `https://github.com/Thoky81/bojler-tuv-card/blob/main/blueprints/bojler-ohrev-z-kurenia.yaml`. Then create an automation from it and pick your supply sensor (in front of the valve), boiler sensor and valve switch. Disable any older automation that switches the same valve.

The default "Open above" of 3 °C matches the card's `min_delta`, so the card's blue "heating is warm" status and the automation agree.

## Without HACS

[`button-card/bojler-tuv-card.yaml`](button-card/bojler-tuv-card.yaml) is the same card (without the history section) as a [button-card](https://github.com/custom-cards/button-card) template, if you would rather paste YAML than install a card.

## Development

The card is generated from the files in `src/`:

```sh
python3 generate.py   # builds bojler-tuv-card.js, preview.html and the button-card YAML
```

Open `preview.html` in a browser to try all states with simulated values. It also shows three other layouts (B, C, D) that were considered; `python3 generate.py --yaml B` builds one of them as button-card YAML.
