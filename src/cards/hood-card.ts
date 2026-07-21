import { customElement } from "lit/decorators.js";

import { HonSensorCardBase, sensorCardStyles } from "../base/sensor-card-base";
import type { HonSensorCardConfig } from "../types";

@customElement("hon-hood-card")
export class HonHoodCard extends HonSensorCardBase<HonSensorCardConfig> {
  public static getStubConfig(): Partial<HonSensorCardConfig> {
    return { tiles: [{ entity: "" }] };
  }

  protected _defaultName(): string {
    return "Hood";
  }

  protected _defaultIcon(): string {
    return "mdi:fan";
  }

  static get styles() {
    return sensorCardStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hon-hood-card": HonHoodCard;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "hon-hood-card",
  name: "Haier hOn Hood",
  description:
    "Status card for a Haier hOn extractor hood. Fan speed shows as a tile; use a toggle chip for on/off " +
    "(HA's fan more-info dialog covers fine-grained speed control).",
  preview: false,
});
