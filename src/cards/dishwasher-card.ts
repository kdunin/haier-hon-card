import { css, html, nothing } from "lit";
import type { CSSResultGroup, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { HonCycleCardBase, cycleCardStyles } from "../base/cycle-card-base";
import type { HonDishwasherCardConfig } from "../types";
import { fireMoreInfo } from "../util/controls";

const dishwasherStyles: CSSResultGroup = [
  cycleCardStyles,
  css`
    .problems {
      gap: 16px;
      color: var(--warning-color, #ff9800);
    }
    .problem {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .problem ha-icon {
      --mdc-icon-size: 18px;
    }
  `,
];

@customElement("hon-dishwasher-card")
export class HonDishwasherCard extends HonCycleCardBase<HonDishwasherCardConfig> {
  public static getStubConfig(): Partial<HonDishwasherCardConfig> {
    return {
      status_entity: "",
      program_entity: "",
      phase_entity: "",
      remaining_time_entity: "",
    };
  }

  protected _defaultName(): string {
    return "Dish Washer";
  }

  protected _extraTrackedKeys(): (keyof HonDishwasherCardConfig)[] {
    return ["salt_entity", "rinse_aid_entity"];
  }

  /** Only surfaces salt/rinse-aid rows when there is actually something to refill. */
  protected _renderExtraRows(): TemplateResult | typeof nothing {
    const lowSalt = this._entityState(this._config.salt_entity)?.state === "on";
    const lowRinseAid = this._entityState(this._config.rinse_aid_entity)?.state === "on";
    if (!lowSalt && !lowRinseAid) {
      return nothing;
    }
    return html`
      <div class="row problems">
        ${lowSalt
          ? html`
              <span class="problem clickable" @click=${() => fireMoreInfo(this, this._config.salt_entity)}
                ><ha-icon icon="mdi:shaker-outline"></ha-icon> Refill salt</span
              >
            `
          : nothing}
        ${lowRinseAid
          ? html`
              <span class="problem clickable" @click=${() => fireMoreInfo(this, this._config.rinse_aid_entity)}
                ><ha-icon icon="mdi:spray-bottle"></ha-icon> Refill rinse aid</span
              >
            `
          : nothing}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return dishwasherStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hon-dishwasher-card": HonDishwasherCard;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "hon-dishwasher-card",
  name: "Haier hOn Dishwasher",
  description: "Status card for a Haier hOn dishwasher, with salt & rinse-aid warnings.",
  preview: false,
});
