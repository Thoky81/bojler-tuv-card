# Bojler TUV Card

A Home Assistant dashboard card for a combined hot-water boiler (Slovak *bojler*; *TUV* = *teplá úžitková voda*, domestic hot water) that can be heated two ways: by its electric element, or by water from the central-heating circuit through a coil, switched by a valve.

![Bojler TUV Card](docs/screenshot.png)

The card draws the boiler, the coil, the valve and the electric element. Pipe colors follow their temperature, from blue (0 °C) to red (80 °C). While the valve is open, moving dashes show the water flowing.

It also tells you what is going on:

| Status | In English | When |
|---|---|---|
| **ohrev z kúrenia** (green) | heated by the heating | Valve open and the heating water is warmer than the boiler |
| **bojler kúri radiátory** (red) | boiler is heating the radiators | Valve open but the heating water is colder than the boiler, so the boiler is heating your radiators |
| **kúrenie je teplé** (blue) | heating water is warm | Valve closed although the supply is warmer than the boiler by at least `min_delta` |
| **elektrický ohrev** (orange) | electric heating | The electric element is on and the heating water is too cold to help |
| **pohotovosť** (grey) | standby | Nothing is heating |

Below the drawing, a history section (last 24 hours by default) shows:

- **Summary:** how long the heating water heated the boiler, how long the electricity did, the electricity used in kWh, and, only if it happened, how long the boiler was heating the radiators.
- **Boiler vs. supply graph:** boiler as the thick line, supply as the thin one; green area where the heating water was warmer than the boiler, red where the valve was open although it was colder.
- **Hourly bars:** minutes per hour heated by the heating water (green) and by electricity (orange).

The values row under the drawing shows **prívod − bojler** (supply − boiler: positive means the heating water is warmer and worth using) and **výmenník Δ** (coil Δ: into the coil minus out of it: how much the water cooled in the boiler, shown only while the valve is open). Hover a value to see the calculation.

Move the mouse or a finger over the graph to read the values at that time. Click any temperature, the valve or the element in the drawing to open its history in Home Assistant. The card speaks **Slovak, Czech and English**: by default it follows your Home Assistant language, or pick one in the editor under *Language*. You can also rename the title and the pipe labels; leave them empty for the default text of the chosen language.

## Slovak labels

The card is also available in English and Czech (set *Language* in the editor). The tables below translate the Slovak texts for readers of this page and of the screenshot.

| In the card | In English |
|---|---|
| Bojler | Boiler |
| PRÍVOD · DO BOJLERA · SPIATOČKA | Supply · Into the boiler · Return |
| TEPLÁ VODA · STUDENÁ VODA | Hot water · Cold water |
| ventil · OTVORENÝ · ZATVORENÝ · nedostupný | valve · open · closed · unavailable |
| výmenník | coil (heat exchanger) |
| elektrina · špirála | electricity · electric element |
| ⚡ elektrina (header badge) | electric element is on |
| Kúrenie ohrieva bojler · výmenník odovzdáva 12.5° | The heating is heating the boiler · the coil passes on 12.5° |
| Ohrieva elektrina · kúrenie je chladnejšie ako bojler | Electricity is heating · the heating water is colder than the boiler |
| Prívod je o 9° teplejší ako bojler, ventil by mohol otvoriť | The supply is 9° warmer than the boiler, the valve could open |
| Ventil zatvorený · prívod je o 5° chladnejší ako bojler | Valve closed · the supply is 5° colder than the boiler |
| Teplotné senzory sú nedostupné | Temperature sensors are unavailable |
| HISTÓRIA · 24 h · teraz | History · 24 h · now |
| ohrev z kúrenia · elektrina · spotreba elektriny | heated by the heating · electricity · electricity used |
| bojler kúril radiátory | boiler heated the radiators |
| kúrenie 10 min · elektrina 0 min (graph hover) | heating 10 min · electricity 0 min in that hour |
| Načítavam históriu… · História nie je dostupná | Loading history… · History is not available |

| In the editor | In English |
|---|---|
| Názov | Title |
| Teplota bojlera | Boiler temperature |
| Prívod z kúrenia (pred ventilom) | Heating supply (in front of the valve) |
| Do bojlera (za ventilom) | Into the boiler (after the valve) |
| Spiatočka (z výmenníka) | Return (out of the coil) |
| Ventil | Valve |
| Aktuálny príkon špirály | Current power of the electric element |
| Elektrická špirála (zap/vyp) | Electric element (on/off) |
| História · Zobraziť históriu · Obdobie · Vyhladenie čiar | History · Show history · Period · Line smoothing |
| Rozšírené | Advanced |
| Modrá pri · Červená pri | Blue at · Red at |
| Min. rozdiel na ohrev · Tolerancia alarmu · Špirála kúri nad | Min. difference to heat · Alarm tolerance · Element heats above |
| Animácia toku · Hlavička · Riadok s hodnotami · Stavový pruh | Flow animation · Header · Values row · Status bar |
| Popis: prívod / do bojlera / spiatočka | Label: supply / into the boiler / return |

The blueprint's name, *Bojler – ohrev z kúrenia*, means "Boiler – heating from the central heating"; its settings are in English.

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
| `language` | `auto` | `auto` (Home Assistant's language), `sk`, `cs` or `en` |
| `title` | *Bojler* / *Boiler* | Card title; empty = default of the language |
| `boiler` | — | Boiler water temperature sensor (required) |
| `supply` | — | Heating supply temperature, before the valve |
| `coil_in` | — | Temperature after the valve, going into the coil |
| `coil_out` | — | Temperature coming out of the coil |
| `valve` | — | Valve entity; `on` / `open` counts as open (required) |
| `heater_power` | — | Electric element power sensor (W) |
| `heater` | — | Electric element on/off entity, if you have no power sensor |
| `heater_on_w` | `50` | Power above which the element counts as heating |
| `cold` / `hot` | `0` / `80` | Temperatures drawn fully blue / fully red |
| `min_delta` | `3` | How much warmer (°C) the supply must be to count as useful |
| `reverse_tol` | `0.5` | Tolerance (°C) before the "boiler heats radiators" alarm |
| `animate` | `true` | Moving dashes in the pipes while the valve is open |
| `show_header` / `show_stats` / `show_banner` | `true` | Show the header, the values row and the status bar |
| `show_graph` | `true` | Show the history section |
| `graph_hours` | `24` | Hours of history (1–168) |
| `graph_smooth` | `20` | Minutes of rolling average for the graph lines, so a cycling heat source doesn't zigzag (`0` = raw readings) |
| `label_supply` / `label_coil_in` / `label_coil_out` | language default | Pipe labels; empty = *PRÍVOD / DO BOJLERA / SPIATOČKA* (sk), *PŘÍVOD / DO BOJLERU / ZPÁTEČKA* (cs), *SUPPLY / TO BOILER / RETURN* (en) |

## Performance

The card redraws only when one of its own entities changes, not on every Home Assistant update. The history reads Home Assistant's 5-minute statistics (288 points per sensor per day) instead of the raw sensor history, loads once, then adds new readings from live updates and redraws at most once a minute. The boiler, supply and power sensors need a `state_class` (most temperature and power sensors have one); without it the card falls back to the raw history. The flow animation is plain CSS, limited to about 7 repaints per second because Safari repaints animated SVG on every frame. Set `animate: false` to turn it off on slow wall tablets.

## Valve automation (blueprint)

The card shows when the boiler heats the radiators; this blueprint keeps it from happening. It opens the valve when the heating water is at least 3 °C warmer than the boiler, closes it when it is less than 1 °C warmer, waits 2 minutes before each move so a cycling heat source doesn't flap the valve, sets the valve correctly after a restart, and closes it if a sensor becomes unavailable. All values can be changed when you create the automation.

[![Open your Home Assistant instance and show the blueprint import dialog.](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2FThoky81%2Fbojler-tuv-card%2Fblob%2Fmain%2Fblueprints%2Fbojler-ohrev-z-kurenia.yaml)

Or: Settings → Automations & scenes → Blueprints → **Import blueprint**, and paste `https://github.com/Thoky81/bojler-tuv-card/blob/main/blueprints/bojler-ohrev-z-kurenia.yaml`. Then create an automation from it and pick your supply sensor (in front of the valve), boiler sensor and valve switch. Disable any older automation that switches the same valve.

The default "Open above" of 3 °C matches the card's `min_delta`, so the card's blue "kúrenie je teplé" (heating water is warm) status and the automation agree.

## Without HACS

[`button-card/bojler-tuv-card.yaml`](button-card/bojler-tuv-card.yaml) is the same card (without the history section) as a [button-card](https://github.com/custom-cards/button-card) template, if you would rather paste YAML than install a card.

## Development

The card is generated from the files in `src/`:

```sh
python3 generate.py   # builds bojler-tuv-card.js, preview.html and the button-card YAML
```

Open `preview.html` in a browser to try all states with simulated values. It also shows three other layouts (B, C, D) that were considered; `python3 generate.py --yaml B` builds one of them as button-card YAML.
