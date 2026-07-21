# Haier hOn Cards

Lovelace cards for Home Assistant showing status, program, temperature and
air-quality info for appliances set up via the
[Haier hOn integration](https://github.com/KDunin/haier_hon).

No dependency on the integration itself - every card just reads whichever
entities you point it at via YAML config, so they work with any integration
that exposes similarly-shaped sensors.

One bundle (`haier-hon-card.js`) registers five card types:

| Card type (`custom:`) | For | Shape |
|---|---|---|
| `hon-washing-machine-card` | Washing machine, tumble dryer, washer-dryer | Status/program/phase/remaining-time cycle |
| `hon-dishwasher-card` | Dishwasher | Same cycle shape + salt/rinse-aid warnings |
| `hon-climate-card` | Air conditioner, oven, fridge/freezer, wine cellar | 1-3 temperature zones + mode + toggles |
| `hon-air-purifier-card` | Air purifier, air scanner | Air quality/filter tiles + mode + toggles |
| `hon-hood-card` | Extractor hood | Status tiles (fan speed, filter) + toggles |

## Installation

### HACS (once this repo has a release)
1. HACS > Frontend > ⋮ > Custom repositories > add this repo's URL, category "Dashboard".
2. Install "Haier hOn Cards".
3. Add resource automatically happens via HACS; otherwise see manual step 3 below.

### Manual
1. Build the card (or download `haier-hon-card.js` from a [release](../../releases)):
   ```bash
   npm ci
   npm run build
   ```
2. Copy `dist/haier-hon-card.js` into `<config>/www/haier-hon-card.js`.
3. Settings > Dashboards > ⋮ > Resources > Add Resource:
   - URL: `/local/haier-hon-card.js`
   - Resource type: JavaScript Module

All five card types are registered from that one resource - you only add it once.

## Usage

Find your appliance's entity IDs under Settings > Devices & Services > Entities,
filtered by the hOn device, or from the
[haier_hon README's per-appliance entity tables](https://github.com/KDunin/haier_hon#readme).

### `hon-washing-machine-card`

Only `status_entity` is required; every other field adds one more row/control.

```yaml
type: custom:hon-washing-machine-card
name: Washing Machine                                       # optional, overrides the auto title
status_entity: sensor.washing_machine_machine_status         # required
program_entity: sensor.washing_machine_program
phase_entity: sensor.washing_machine_program_phase
remaining_time_entity: sensor.washing_machine_remaining_time
door_entity: binary_sensor.washing_machine_door
power_entity: switch.washing_machine_washing_machine          # adds a start/stop button
pause_entity: switch.washing_machine_pause_washing_machine     # adds a pause/resume button
```

A tumble dryer or washer-dryer uses the exact same config shape, just pointed
at that appliance's entities.

### `hon-dishwasher-card`

Same fields as the washing-machine card, plus two optional problem indicators:

```yaml
type: custom:hon-dishwasher-card
status_entity: sensor.dish_washer_machine_status              # required
program_entity: sensor.dish_washer_program
phase_entity: sensor.dish_washer_program_phase
remaining_time_entity: sensor.dish_washer_remaining_time
door_entity: binary_sensor.dish_washer_door
power_entity: switch.dish_washer_dish_washer
salt_entity: binary_sensor.dish_washer_salt                   # shows "Refill salt" when triggered
rinse_aid_entity: binary_sensor.dish_washer_rinse_aid          # shows "Refill rinse aid" when triggered
```

### `hon-climate-card`

`zones` is required (1-3 entries); everything else is optional. Each zone
needs a `climate.*` entity - the card reads current/target temperature and
steps the target by 0.5° via `climate.set_temperature`.

**Air conditioner** (1 zone):
```yaml
type: custom:hon-climate-card
name: Air Conditioner
zones:
  - climate_entity: climate.air_conditioner_air_conditioner
program_entity: select.air_conditioner_program
toggles:
  - entity: switch.air_conditioner_silent_mode
    name: Silent
  - entity: switch.air_conditioner_rapid_mode
    name: Rapid
  - entity: switch.air_conditioner_self_cleaning
    name: Self-clean
```

**Fridge** (3 zones - drop the ones you don't have):
```yaml
type: custom:hon-climate-card
name: Fridge
zones:
  - name: Fridge
    climate_entity: climate.fridge_fridge
  - name: Freezer
    climate_entity: climate.fridge_freezer
  - name: MyZone
    climate_entity: climate.fridge_myzone
toggles:
  - entity: switch.fridge_super_cool
  - entity: switch.fridge_super_freeze
  - entity: switch.fridge_auto_set_mode
    name: Auto-Set
```

**Oven** (1 zone) and **wine cellar** (up to 2 zones) follow the same pattern.

### `hon-air-purifier-card`

`tiles` is required (at least one). `mode_entity` is the Mode/Diffuser select;
`status_entity` (an on/off sensor) only colors the header icon.

```yaml
type: custom:hon-air-purifier-card
name: Air Purifier
status_entity: binary_sensor.air_purifier_on
mode_entity: select.air_purifier_mode
tiles:
  - entity: sensor.air_purifier_air_quality
    icon: mdi:weather-dust
  - entity: sensor.air_purifier_pm_2_5
    name: PM2.5
  - entity: sensor.air_purifier_pm_10
    name: PM10
  - entity: sensor.air_purifier_voc
    name: VOC
  - entity: sensor.air_purifier_main_filter_status
    name: Filter
    icon: mdi:air-filter
toggles:
  - entity: lock.air_purifier_lock_status
    name: Child lock
```

### `hon-hood-card`

Same shape as the air purifier card; the fan entity's speed is shown as a
read-only tile (use HA's fan more-info dialog for fine-grained speed control).

```yaml
type: custom:hon-hood-card
name: Hood
tiles:
  - entity: fan.hood_wind_speed
    name: Fan speed
    icon: mdi:fan
  - entity: sensor.hood_filter_cleaning_status
    name: Filter
toggles:
  - entity: switch.hood_hood
    name: Power
  - entity: light.hood_light_status
    name: Light
```

### Microwave, induction hob, robot vacuum

- **Microwave / induction hob** are cycle-shaped appliances too (program +
  time), so point `hon-washing-machine-card` or `hon-dishwasher-card` at
  their `programName` / `remainingTimeMM` entities - both cards already
  degrade gracefully when a field isn't set.
- **Robot vacuum**: use Home Assistant's built-in vacuum card
  (`type: vacuum-card` in the visual editor / a `vacuum.*` entity) rather
  than a custom one here - it already covers status, battery and commands.

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build        # outputs dist/haier-hon-card.js
```

`npm run dev` rebuilds on change; point your dashboard resource straight at
`dist/haier-hon-card.js` while iterating (with cache disabled in your browser
dev tools).

### Code layout

```
src/
  base/                   shared LitElement base classes (one per card "shape")
    cycle-card-base.ts     status/program/phase/remaining-time cycle
    climate-card-base.ts   1-3 temperature zones + mode + toggles
    sensor-card-base.ts    status tiles + mode + toggles
  cards/                  thin @customElement subclasses of a base
  util/
    controls.ts            shared select/toggle-chip renderers + service calls
    format.ts               formatMinutes()
  const.ts                 STATUS_META (machMode -> label/color/icon) for cycle cards
  types.ts                 one config interface per card
  index.ts                 bundle entry: imports every card module
```

New appliance, existing shape → add a `src/cards/*.ts` file extending the
matching base (see `dishwasher-card.ts` for the smallest example). New shape
entirely → add a base class following the same pattern.

## License

MIT
