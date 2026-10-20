#!/usr/bin/env python3
"""Generates the Bojler + TUV Lovelace card (Misol style, custom:button-card).

Run:  python3 generate.py
  bojler-tuv-card.js              HACS card (custom:bojler-tuv-card, variant A, visual editor)
  preview.html                    all layout variants with simulated values
  button-card/bojler-tuv-card.yaml  same card as a custom:button-card template (no install)
  python3 generate.py --yaml B    button-card YAML for another variant (A/B/C/D)
Card logic: src/common.js (values, status, header) + src/variant-X.js (layout).
CONFIG holds the author's entities for the preview and the button-card YAML;
its non-entity values are the defaults of the HACS card.

Performance (see ../Home Assistant Speed Up): templates read only the entities below,
never loop over `states`; explicit triggers_update; no update_timer; flow animation is CSS
stepped to ~7 repaints/s and can be switched off with "animate": False.
"""
import json
import sys
from pathlib import Path

CONFIG = {
    "title": "",           # empty = default title in the card language
    "language": "auto",    # auto (Home Assistant language), sk, cs, en
    "boiler":   "sensor.bojler_temp_tuv_bojler",       # water temperature in the tank
    "supply":   "sensor.tuv_sensors_tuv_pipe_near",    # heating supply, before the valve
    "coil_in":  "sensor.bojler_temp_tuv_pipe",         # after the valve, into the boiler coil
    "coil_out": "sensor.tuv_sensors_tuv_pipe_near_2",  # out of the coil, back to heating
    "valve":    "switch.tuv_bojler_valve",             # switch / valve / binary_sensor
    "heater": "",          # optional: switch/binary_sensor of the electric element
    "heater_power": "sensor.bojler_power",  # power sensor (W) of the electric element
    "heater_on_w": 50,     # W above which the element counts as heating
    "tariff": "binary_sensor.d1_mini_v4_switchboard_hdo_tarif_relay",  # optional: low/high tariff (empty = single tariff)
    "tariff_until": "sensor.power_tariff_times",  # optional: text/timestamp with the next tariff change
    "tariff_low": "on, nt, low, nízky, nizky, nízký, offpeak, off-peak",  # its states meaning low tariff
    "label_supply": "",    # empty = default pipe labels in the card language
    "label_coil_in": "",
    "label_coil_out": "",
    "cold": 0,             # °C shown fully blue
    "hot": 80,             # °C shown fully red
    "min_delta": 3,        # °C supply must beat the boiler by to be worth opening
    "reverse_tol": 0.5,    # °C tolerance before "boiler heats radiators" alarm
    "animate": True,       # moving dashes in the pipes while the valve is open
    "show_header": True,
    "show_stats": True,
    "show_banner": True,
    "show_graph": True,    # history below the card (HACS card only)
    "graph_hours": 24,
    "graph_smooth": 20,    # minutes of rolling mean for the graph lines (0 = raw)
    "graph_power": False,  # element power as an area in the graph, with kWh per run
}
VERSION = "1.5.0"
# the author's own settings for the button-card YAML and the preview (not defaults of the HACS card)
AUTHOR = {"tariff_low": "off"}  # this HDO relay is on during the high tariff
# preview only: extra config for the simulated page
PREVIEW_EXTRA = {}

HERE = Path(__file__).parent
SRC = HERE / "src"
COMMON = (SRC / "common.js").read_text()
I18N_JS = (SRC / "i18n.js").read_text()
VARIANTS = "ABCD"


def template(v, i18n=True):
    # the HACS card has i18n.js at top level (shared with the graph), the other outputs inline it
    return (I18N_JS + "\n" if i18n else "") + COMMON + "\n" + (SRC / f"variant-{v.lower()}.js").read_text()

ENTITY_KEYS = ["boiler", "supply", "coil_in", "coil_out", "valve", "heater", "heater_power", "tariff", "tariff_until"]


def yaml_card(v):
    TEMPLATE = template(v).replace("/*CFG*/", json.dumps({**CONFIG, **AUTHOR}, ensure_ascii=False))
    triggers = "\n".join(f"- {CONFIG[k]}" for k in ENTITY_KEYS if CONFIG[k])
    body = "\n".join(("    " + l) if l.strip() else "" for l in ["[[[", *TEMPLATE.splitlines(), "]]]"])
    return f"""type: custom:button-card
entity: {CONFIG['boiler']}
show_name: false
show_icon: false
show_state: false
triggers_update:
{triggers}
tap_action:
  action: none
hold_action:
  action: none
styles:
  card:
  - padding: 16px
  - border-radius: 12px
  grid:
  - grid-template-areas: '"main"'
  - grid-template-columns: 1fr
  custom_fields:
    main:
    - width: 100%
custom_fields:
  main: |
{body}
"""


def preview():
    shell = (SRC / "preview-shell.html").read_text()
    fns = "\n".join(
        f"function render{v}(states, C) {{\n" + template(v).replace("const C = /*CFG*/;", "") + "\n}"
        for v in VARIANTS)
    cfg = {**CONFIG, **AUTHOR, **PREVIEW_EXTRA}
    head = '<!doctype html>\n<html lang="sk">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    return head + shell.replace("/*RENDER*/", fns).replace("/*CFG*/", json.dumps(cfg, ensure_ascii=False))


def card_js():
    defaults = {k: ("" if k in ENTITY_KEYS else v) for k, v in CONFIG.items()}
    fn = "function renderCard(states, C) {\n" + template("A", i18n=False).replace("const C = /*CFG*/;", "") + "\n}"
    return ((SRC / "card-shell.js").read_text()
            .replace("/*VERSION*/", VERSION)
            .replace("/*DEFAULTS*/", json.dumps(defaults, ensure_ascii=False))
            .replace("/*I18N*/", I18N_JS)
            .replace("/*RENDER*/", fn)
            .replace("/*GRAPH*/", (SRC / "graph.js").read_text()))


v = sys.argv[sys.argv.index("--yaml") + 1].upper() if "--yaml" in sys.argv else "A"
(HERE / "button-card" / "bojler-tuv-card.yaml").write_text(yaml_card(v))
(HERE / "preview.html").write_text(preview())
(HERE / "bojler-tuv-card.js").write_text(card_js())
print(f"wrote bojler-tuv-card.js, preview.html, button-card/bojler-tuv-card.yaml (variant {v})")
