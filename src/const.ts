import type { StatusMeta } from "./types";

/**
 * Maps the "Machine Status" sensor's raw state (pyhOn's `washing_modes` values,
 * see custom_components/hon/translations/en.json in the haier_hon integration)
 * to a display label, accent color and icon.
 */
export const STATUS_META: Record<string, StatusMeta> = {
  ready: { label: "Ready", icon: "mdi:washing-machine", color: "var(--state-icon-color, #44739e)" },
  running: { label: "Running", icon: "mdi:washing-machine", color: "var(--state-active-color, #039be5)" },
  pause: { label: "Paused", icon: "mdi:pause-circle-outline", color: "var(--warning-color, #ff9800)" },
  scheduled: { label: "Scheduled", icon: "mdi:clock-outline", color: "var(--warning-color, #ff9800)" },
  error: { label: "Error", icon: "mdi:alert-circle", color: "var(--error-color, #db4437)" },
  ending: { label: "Stopping cycle…", icon: "mdi:washing-machine", color: "var(--warning-color, #ff9800)" },
  test: { label: "Test", icon: "mdi:washing-machine", color: "var(--disabled-text-color)" },
};

export const DEFAULT_STATUS_META: StatusMeta = {
  label: "Unknown",
  icon: "mdi:washing-machine",
  color: "var(--disabled-text-color)",
};

export const UNAVAILABLE_STATES = ["unavailable", "unknown", ""];
