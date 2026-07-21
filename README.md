# Haier hOn Washing Machine Card

A small Lovelace card for Home Assistant showing the status, program, phase, remaining
time and (optionally) door/start/pause controls for a washing machine or tumble dryer
set up via the [Haier hOn integration](https://github.com/KDunin/haier_hon).

No dependency on the integration itself — this card just reads whichever entities you
point it at, so it works with any integration that exposes similarly-shaped sensors.

## Installation

### HACS (once this repo has a release)
1. HACS > Frontend > ⋮ > Custom repositories > add this repo's URL, category "Dashboard".
2. Install "Haier hOn Washing Machine Card".
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

## Usage

Find your washer/dryer's entity IDs under Settings > Devices & Services > Entities,
filtered by the hOn device. Only `status_entity` is required — every other entity
adds one more row/control to the card when set.

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

See the [haier_hon README's entity tables](https://github.com/KDunin/haier_hon#readme) for
the full list of entities a washing machine or tumble dryer exposes.

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build        # outputs dist/haier-hon-card.js
```

`npm run dev` rebuilds on change; point your dashboard resource straight at
`dist/haier-hon-card.js` while iterating (with cache disabled in your browser dev tools).

## License

MIT
