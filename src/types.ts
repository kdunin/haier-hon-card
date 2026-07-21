import type { LovelaceCardConfig } from "custom-card-helpers";

export interface HonWashingMachineCardConfig extends LovelaceCardConfig {
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

export interface StatusMeta {
  label: string;
  color: string;
  icon: string;
}
