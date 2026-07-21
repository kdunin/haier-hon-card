import type { LovelaceCardConfig } from "custom-card-helpers";

// ---- Cycle cards: washing machine / tumble dryer / dishwasher -------------
// (status/program/phase/remaining-time header + optional door + start/stop/pause)

export interface HonCycleCardConfig extends LovelaceCardConfig {
  /** Overrides the name shown in the header. Defaults to the device name derived from status_entity. */
  name?: string;
  /** The "Machine Status" sensor, e.g. sensor.washing_machine_machine_status */
  status_entity: string;
  /** The "Program" sensor, e.g. sensor.washing_machine_program */
  program_entity?: string;
  /** The "Program Phase" sensor, e.g. sensor.washing_machine_program_phase */
  phase_entity?: string;
  /** The "Remaining Time" sensor (minutes), e.g. sensor.washing_machine_remaining_time */
  remaining_time_entity?: string;
  /** The "Door" binary_sensor. Shows an open/closed indicator when set. */
  door_entity?: string;
  /** The start/stop switch, e.g. switch.washing_machine_washing_machine. Adds a start/stop button when set. */
  power_entity?: string;
  /** The pause/resume switch, e.g. switch.washing_machine_pause_washing_machine. Adds a pause button when set. */
  pause_entity?: string;
  /**
   * Pre-start config selects (program, spin speed, temperature, steam level, ...). The first
   * entry renders inline; any further entries sit behind a "more settings" expander.
   */
  selects?: HonSelectConfig[];
  /** Pre-start config switches (half load, extra dry, prewash, ...). Rendered as chips, always visible. */
  toggles?: HonToggleConfig[];
}

export type HonWashingMachineCardConfig = HonCycleCardConfig;

export interface HonDishwasherCardConfig extends HonCycleCardConfig {
  /** The "Salt" binary_sensor (device_class problem). Surfaces a "Refill salt" warning when on. */
  salt_entity?: string;
  /** The "Rinse Aid" binary_sensor (device_class problem). Surfaces a "Refill rinse aid" warning when on. */
  rinse_aid_entity?: string;
}

export interface HonSelectConfig {
  /** A select.* entity, e.g. select.washing_machine_spin_speed. */
  entity: string;
  /** Row label. Defaults to the entity's friendly_name. */
  name?: string;
  /** mdi icon override for the row. Defaults to mdi:tune. */
  icon?: string;
}

// ---- Climate cards: AC / oven / fridge & freezer / wine cellar ------------
// (1-3 zones of current + target temperature, plus a program select and toggle chips)

export interface HonClimateZoneConfig {
  /** Zone label, e.g. "Fridge" / "Freezer" / "MyZone". Defaults to the climate entity's friendly_name. */
  name?: string;
  /** A climate.* entity, e.g. climate.fridge_fridge. Required per zone. */
  climate_entity: string;
}

export interface HonToggleConfig {
  /** Any toggleable entity: switch.*, fan.*, lock.*, ... */
  entity: string;
  /** Chip label. Defaults to the entity's friendly_name. */
  name?: string;
  /** mdi icon override for the chip. */
  icon?: string;
}

export interface HonClimateCardConfig extends LovelaceCardConfig {
  name?: string;
  /** 1-3 zones, e.g. a single AC unit, or a fridge with Fridge/Freezer/MyZone zones. */
  zones: HonClimateZoneConfig[];
  /** A select.* entity for the program/mode, e.g. select.air_conditioner_program. */
  program_entity?: string;
  /** Optional status sensor used only to fill in the header name if `name` isn't set. */
  status_entity?: string;
  /** Extra controls rendered as chips, e.g. Eco Mode, Silent Mode, Super Cool switches. */
  toggles?: HonToggleConfig[];
}

// ---- Oven: a climate zone plus the program/remaining-time half of a cycle ---

export interface HonOvenCardConfig extends HonClimateCardConfig {
  /** The "Program" sensor, e.g. sensor.oven_program (read-only; `program_entity` is the select). */
  program_sensor_entity?: string;
  /** The "Remaining Time" sensor (minutes), e.g. sensor.oven_remaining_time */
  remaining_time_entity?: string;
  /** The "Start Time" delay sensor (minutes), e.g. sensor.oven_start_time. Only shown when non-zero. */
  delay_time_entity?: string;
  /** The start/stop switch, e.g. switch.oven_oven. Adds a start/stop button when set. */
  power_entity?: string;
}

// ---- Sensor/status cards: air purifier / hood / induction hob --------------
// (header status + a grid of read-only value tiles + optional mode select + toggle chips)

export interface HonSensorTileConfig {
  entity: string;
  /** Tile label. Defaults to the entity's friendly_name. */
  name?: string;
  /** mdi icon override for the tile. */
  icon?: string;
  /** Unit override; defaults to the entity's own unit_of_measurement. */
  unit?: string;
}

export interface HonSensorCardConfig extends LovelaceCardConfig {
  name?: string;
  /** An on/off sensor (e.g. binary_sensor "On") used to color the header icon. */
  status_entity?: string;
  /** A select.* entity for a mode (e.g. Air Purifier "Mode", Diffuser Level). */
  mode_entity?: string;
  /** Value tiles, e.g. Air Quality, PM2.5, VOC, Filter life. At least one required. */
  tiles: HonSensorTileConfig[];
  /** Extra controls rendered as chips, e.g. a child-lock switch. */
  toggles?: HonToggleConfig[];
}

/**
 * One cooking zone of an induction hob (the Z1-Z4 entity sets). Every field is
 * optional - a zone renders whichever of them you point at an entity.
 */
export interface HonHobZoneConfig {
  /** Zone label, e.g. "Z1" / "Front left". Defaults to "Zone <n>". */
  name?: string;
  /** The zone's "Power" sensor (power level), e.g. sensor.induction_hob_power_z1 */
  power_entity?: string;
  /** The zone's "Temperature" sensor. */
  temperature_entity?: string;
  /** The zone's "Remaining Time" sensor (minutes). */
  remaining_time_entity?: string;
  /** The zone's "Program" sensor. */
  program_entity?: string;
  /** The zone's "Hot Status" binary_sensor. Marks the zone as still hot. */
  hot_entity?: string;
  /** The zone's "Pan Status" binary_sensor. Marks the zone as having no pan. */
  pan_entity?: string;
}

export interface HonHobCardConfig extends HonSensorCardConfig {
  /** Per-zone entity sets (Z1-Z4). Optional - a single-zone hob can use `tiles` alone. */
  zones?: HonHobZoneConfig[];
  /** Hob-wide "Hot Status" binary_sensor. Surfaces a "Surface still hot" warning while on. */
  hot_entity?: string;
  /** Hob-wide "Pan Status" binary_sensor. Surfaces "No pan detected" while off. */
  pan_entity?: string;
  /** Hob-wide "Error" sensor. Surfaces the error text unless it reads ok/none/0. */
  error_entity?: string;
}

export interface StatusMeta {
  label: string;
  color: string;
  icon: string;
}
