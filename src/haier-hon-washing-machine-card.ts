import { customElement } from "lit/decorators.js";

import { HonCycleCardBase, cycleCardStyles } from "./base/cycle-card-base";
import type { HonWashingMachineCardConfig } from "./types";

@customElement("hon-washing-machine-card")
export class HonWashingMachineCard extends HonCycleCardBase<HonWashingMachineCardConfig> {
  public static getStubConfig(): Partial<HonWashingMachineCardConfig> {
    return {
      status_entity: "",
      program_entity: "",
      phase_entity: "",
      remaining_time_entity: "",
    };
  }

  protected _defaultName(): string {
    return "Washing Machine";
  }

  static get styles() {
    return cycleCardStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hon-washing-machine-card": HonWashingMachineCard;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "hon-washing-machine-card",
  name: "Haier hOn Washing Machine",
  description: "Status card for a Haier hOn washing machine or tumble dryer appliance.",
  preview: false,
});
