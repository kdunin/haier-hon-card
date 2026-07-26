import { css, html, nothing } from "lit";
import type { CSSResultGroup, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { HonClimateCardBase, climateCardStyles } from "../base/climate-card-base";
import type { HonOvenCardConfig } from "../types";
import { fireMoreInfo, toggleEntity } from "../util/controls";
import { formatMinutes } from "../util/format";

/** The climate base has no `.actions`/`.icon-button` rules - those live in cycleCardStyles. */
const ovenStyles: CSSResultGroup = [
  climateCardStyles,
  css`
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 0.95em;
    }
    .row ha-icon {
      --mdc-icon-size: 18px;
    }
    .program-name {
      color: var(--primary-text-color);
      font-weight: 500;
    }
    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 4px;
    }
    .icon-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .icon-button:hover {
      background: var(--divider-color);
    }
  `,
];

@customElement("hon-oven-card")
export class HonOvenCard extends HonClimateCardBase<HonOvenCardConfig> {
  public static getStubConfig(): Partial<HonOvenCardConfig> {
    return { zones: [{ climate_entity: "" }] };
  }

  protected _defaultName(): string {
    return "Oven";
  }

  protected _extraTrackedIds(): string[] {
    const { program_sensor_entity, remaining_time_entity, delay_time_entity, power_entity } = this._config;
    return [program_sensor_entity, remaining_time_entity, delay_time_entity, power_entity].filter(
      (id): id is string => Boolean(id),
    );
  }

  /**
   * The oven is half climate appliance, half program cycle: the base renders the
   * temperature zone, this adds the running program, remaining time, a delayed
   * start (only while actually scheduled) and the start/stop button.
   */
  protected _renderExtraRows(): TemplateResult | typeof nothing {
    const programState = this._entityState(this._config.program_sensor_entity);
    const remainingState = this._entityState(this._config.remaining_time_entity);
    const delayState = this._entityState(this._config.delay_time_entity);
    const powerState = this._entityState(this._config.power_entity);
    const delayMinutes = Number(delayState?.state);
    const showDelay = Number.isFinite(delayMinutes) && delayMinutes > 0;

    if (!programState && !remainingState && !showDelay && !powerState) {
      return nothing;
    }

    const running = powerState?.state === "on";

    return html`
      ${programState
        ? html`
            <div class="row clickable" @click=${() => fireMoreInfo(this, this._config.program_sensor_entity)}>
              <span class="program-name">${programState.state}</span>
            </div>
          `
        : nothing}
      ${remainingState
        ? html`
            <div class="row clickable" @click=${() => fireMoreInfo(this, this._config.remaining_time_entity)}>
              <ha-icon icon="mdi:timer-outline"></ha-icon>
              <span>${formatMinutes(remainingState.state)}</span>
            </div>
          `
        : nothing}
      ${showDelay
        ? html`
            <div class="row clickable" @click=${() => fireMoreInfo(this, this._config.delay_time_entity)}>
              <ha-icon icon="mdi:clock-start"></ha-icon>
              <span>Starts in ${formatMinutes(delayMinutes)}</span>
            </div>
          `
        : nothing}
      ${powerState
        ? html`
            <div class="actions">
              <button
                class="icon-button"
                title=${running ? "Stop" : "Start"}
                @click=${() => toggleEntity(this.hass, this._config.power_entity as string)}
              >
                <ha-icon icon=${running ? "mdi:stop" : "mdi:play"}></ha-icon>
              </button>
            </div>
          `
        : nothing}
    `;
  }

  static get styles(): CSSResultGroup {
    return ovenStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hon-oven-card": HonOvenCard;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "hon-oven-card",
  name: "Haier hOn Oven",
  description:
    "Card for a Haier hOn oven: target temperature stepper plus the running program, remaining time, " +
    "delayed start and a start/stop button.",
  preview: false,
});
