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
}

export type HonWashingMachineCardConfig = HonCycleCardConfig;

export interface HonDishwasherCardConfig extends HonCycleCardConfig {
  /** The "Salt" binary_sensor (device_class problem). Surfaces a "Refill salt" warning when on. */
  salt_entity?: string;
  /** The "Rinse Aid" binary_sensor (device_class problem). Surfaces a "Refill rinse aid" warning when on. */
  rinse_aid_entity?: string;
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

// ---- Sensor/status cards: air purifier / hood ------------------------------
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

export interface StatusMeta {
  label: string;
  color: string;
  icon: string;
}
