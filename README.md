# Haier hOn Cards

Lovelace cards for Home Assistant showing status, program, temperature and
air-quality info for appliances set up via the
[Haier hOn integration](https://github.com/KDunin/haier_hon).

No dependency on the integration itself - every card just reads whichever
entities you point it at via YAML config, so they work with any integration
that exposes similarly-shaped sensors.

One bundle (`haier-hon-card.js`) registers seven card types:

| Card type (`custom:`) | For | Shape |
|---|---|---|
| `hon-washing-machine-card` | Washing machine, tumble dryer, washer-dryer | Status/program/phase/remaining-time cycle + mode settings |
| `hon-dishwasher-card` | Dishwasher | Same cycle shape + salt/rinse-aid warnings + mode settings |
| `hon-climate-card` | Air conditioner, fridge/freezer, wine cellar | 1-3 temperature zones + mode + toggles |
| `hon-oven-card` | Oven | Temperature zone + program/remaining time + start/stop |
| `hon-air-purifier-card` | Air purifier, air scanner | Air quality/filter tiles + mode + toggles |
| `hon-hood-card` | Extractor hood | Status tiles (fan speed, filter) + toggles |
| `hon-hob-card` | Induction hob | Per-zone (Z1-Z4) power/temp/time tiles + still-hot/no-pan warnings |

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

All seven card types are registered from that one resource - you only add it once.

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

#### Mode settings (`selects` / `toggles`)

Both `hon-washing-machine-card` and `hon-dishwasher-card` also accept `selects`
and `toggles`, for the pre-start `select.*`/`switch.*` config entities each
appliance exposes (program, spin speed, half load, ...). The first `selects`
entry renders inline; any further ones collapse behind a "N more settings"
expander. `toggles` chips are always visible.

```yaml
selects:
  - entity: select.washing_machine_program        # renders inline
    name: Program
  - entity: select.washing_machine_spin_speed      # collapsed until expanded
    name: Spin speed
    icon: mdi:numeric
  - entity: select.washing_machine_temperature
    name: Temperature
toggles:
  - entity: switch.washing_machine_prewash
    name: Prewash
  - entity: switch.washing_machine_extra_rinse_1
    name: Extra rinse
  - entity: switch.washing_machine_good_night
    name: Good night
```

### `hon-dishwasher-card`

Same fields as the washing-machine card (including `selects`/`toggles` above),
plus two optional problem indicators:

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
selects:
  - entity: select.dish_washer_program
    name: Program
toggles:
  - entity: switch.dish_washer_half_load
    name: Half load
    icon: mdi:fraction-one-half
  - entity: switch.dish_washer_extra_dry
    name: Extra dry
  - entity: switch.dish_washer_eco_express
    name: Eco
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

A **wine cellar** (up to 2 zones) follows the same pattern. Ovens have their own
card - see below.

### `hon-oven-card`

An oven is half climate appliance, half program cycle, so this card stacks the
temperature stepper from `hon-climate-card` on top of the program/remaining-time
rows and a start/stop button. Only `zones` (exactly one, the oven's `climate.*`
entity) is required.

```yaml
type: custom:hon-oven-card
name: Oven
zones:
  - climate_entity: climate.oven_oven                  # required
program_sensor_entity: sensor.oven_program             # running program name
remaining_time_entity: sensor.oven_remaining_time
delay_time_entity: sensor.oven_start_time              # only shown while > 0
power_entity: switch.oven_oven                         # adds a start/stop button
program_entity: select.oven_program                    # optional program picker
toggles:
  - entity: switch.oven_preheat
    name: Preheat
```

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

### `hon-hob-card`

An induction hob's entities come in a per-zone shape - `zones` renders each
cooking zone (Z1-Z4) as its own tile with power, temperature, remaining time
and hot/no-pan flags, dimmed when the zone isn't drawing power. `hot_entity` /
`pan_entity` / `error_entity` are hob-wide (the plain "Z" entity set) and
surface as a warning row only when actually triggered. `tiles` still works for
anything extra (mode select, child lock) and, on a hob with no `zones`, is
required on its own.

```yaml
type: custom:hon-hob-card
name: Induction Hob
mode_entity: select.hob_program
zones:
  - name: Front left
    power_entity: sensor.induction_hob_power_z1
    temperature_entity: sensor.induction_hob_temperature_z1
    remaining_time_entity: sensor.induction_hob_remaining_time_z1
    hot_entity: binary_sensor.induction_hob_hot_status_z1
    pan_entity: binary_sensor.induction_hob_pan_status_z1
  - name: Front right
    power_entity: sensor.induction_hob_power_z2
    temperature_entity: sensor.induction_hob_temperature_z2
    remaining_time_entity: sensor.induction_hob_remaining_time_z2
    hot_entity: binary_sensor.induction_hob_hot_status_z2
    pan_entity: binary_sensor.induction_hob_pan_status_z2
  - name: Rear left
    power_entity: sensor.induction_hob_power_z3
  - name: Rear right
    power_entity: sensor.induction_hob_power_z4
tiles:
  - entity: binary_sensor.induction_hob_hob_lock   # read-only on a hOn hob
    name: Child lock
    icon: mdi:lock
hot_entity: binary_sensor.induction_hob_hot_status       # hob-wide "Surface still hot"
pan_entity: binary_sensor.induction_hob_pan_status         # hob-wide "No pan detected" when off
error_entity: sensor.induction_hob_error
```

A single-zone hob (or one without per-zone entities) can skip `zones` entirely
and use `tiles` the same way the hood card does.

### Microwave, robot vacuum

- **Microwave** is a cycle-shaped appliance (program + time), so point
  `hon-washing-machine-card` or `hon-dishwasher-card` at its `programName` /
  `remainingTimeMM` entities - both cards already degrade gracefully when a
  field isn't set.
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
    climate-card-base.ts   1-3 temperature zones + mode + toggles (oven builds on this)
    sensor-card-base.ts    status tiles + mode + toggles (hood, hob, air purifier)
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
