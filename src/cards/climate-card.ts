import { customElement } from "lit/decorators.js";

import { HonClimateCardBase, climateCardStyles } from "../base/climate-card-base";
import type { HonClimateCardConfig } from "../types";

@customElement("hon-climate-card")
export class HonClimateCard extends HonClimateCardBase<HonClimateCardConfig> {
  public static getStubConfig(): Partial<HonClimateCardConfig> {
    return { zones: [{ climate_entity: "" }] };
  }

  protected _defaultName(): string {
    return "Climate";
  }

  static get styles() {
    return climateCardStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hon-climate-card": HonClimateCard;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "hon-climate-card",
  name: "Haier hOn Climate",
  description:
    "Temperature card for a Haier hOn air conditioner, oven, fridge/freezer or wine cellar (1-3 zones).",
  preview: false,
});
