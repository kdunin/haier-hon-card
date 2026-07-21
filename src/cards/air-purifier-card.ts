import { customElement } from "lit/decorators.js";

import { HonSensorCardBase, sensorCardStyles } from "../base/sensor-card-base";
import type { HonSensorCardConfig } from "../types";

@customElement("hon-air-purifier-card")
export class HonAirPurifierCard extends HonSensorCardBase<HonSensorCardConfig> {
  public static getStubConfig(): Partial<HonSensorCardConfig> {
    return { tiles: [{ entity: "" }] };
  }

  protected _defaultName(): string {
    return "Air Purifier";
  }

  protected _defaultIcon(): string {
    return "mdi:air-purifier";
  }

  static get styles() {
    return sensorCardStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hon-air-purifier-card": HonAirPurifierCard;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "hon-air-purifier-card",
  name: "Haier hOn Air Purifier",
  description: "Air quality, filter life and mode card for a Haier hOn air purifier or air scanner.",
  preview: false,
});
