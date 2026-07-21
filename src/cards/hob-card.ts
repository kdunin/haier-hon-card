import { css, html, nothing } from "lit";
import type { CSSResultGroup, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { HonSensorCardBase, sensorCardStyles } from "../base/sensor-card-base";
import type { HonHobCardConfig, HonHobZoneConfig } from "../types";
import { formatMinutes } from "../util/format";

/** Error sensor values that mean "nothing wrong", so no error row is rendered. */
const NO_ERROR_STATES = ["ok", "none", "no_error", "0", "unknown", "unavailable"];

/** Power-sensor values that mean the zone isn't cooking. */
const OFF_POWER_STATES = ["0", "off", "unknown", "unavailable", ""];

const hobStyles: CSSResultGroup = [
  sensorCardStyles,
  css`
    .zones {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 8px;
    }
    .zone {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px;
      border-radius: 10px;
      background: var(--secondary-background-color);
    }
    .zone.idle {
      opacity: 0.55;
    }
    .zone-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      font-size: 0.75em;
      color: var(--secondary-text-color);
    }
    .zone-flags {
      display: flex;
      gap: 2px;
    }
    .zone-flags ha-icon {
      --mdc-icon-size: 14px;
    }
    .zone-flags .hot {
      color: var(--warning-color, #ff9800);
    }
    .zone-flags .no-pan {
      color: var(--disabled-text-color);
    }
    .zone-power {
      font-size: 1.4em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .zone-detail {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    .zone-detail ha-icon {
      --mdc-icon-size: 14px;
    }
    .warnings {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 0.95em;
      color: var(--warning-color, #ff9800);
    }
    .warning {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .warning.error {
      color: var(--error-color);
    }
    .warning ha-icon {
      --mdc-icon-size: 18px;
    }
  `,
];

@customElement("hon-hob-card")
export class HonHobCard extends HonSensorCardBase<HonHobCardConfig> {
  public static getStubConfig(): Partial<HonHobCardConfig> {
    return { zones: [{}] };
  }

  /**
   * Unlike the other sensor cards, a hob can be described purely by its zones,
   * so `tiles` is only required when there are none.
   */
  public setConfig(config: HonHobCardConfig): void {
    const hasZones = (config.zones?.length ?? 0) > 0;
    const hasTiles = (config.tiles?.length ?? 0) > 0;
    if (!hasZones && !hasTiles) {
      throw new Error('"zones" or "tiles" must list at least one entry');
    }
    this._config = { ...config, tiles: config.tiles ?? [] };
  }

  public getCardSize(): number {
    return 2 + Math.ceil((this._config.zones?.length ?? 0) / 2);
  }

  protected _defaultName(): string {
    return "Induction Hob";
  }

  protected _defaultIcon(): string {
    return "mdi:stove";
  }

  protected _extraTrackedIds(): string[] {
    const { hot_entity, pan_entity, error_entity } = this._config;
    const ids = [hot_entity, pan_entity, error_entity];
    for (const zone of this._config.zones ?? []) {
      ids.push(
        zone.power_entity,
        zone.temperature_entity,
        zone.remaining_time_entity,
        zone.program_entity,
        zone.hot_entity,
        zone.pan_entity,
      );
    }
    return ids.filter((id): id is string => Boolean(id));
  }

  /**
   * A zone is "idle" when it isn't drawing power - dimmed rather than hidden, so
   * the grid keeps a stable shape that matches the physical hob layout.
   */
  private _renderZone(zone: HonHobZoneConfig, index: number): TemplateResult {
    const powerState = this._entityState(zone.power_entity);
    const tempState = this._entityState(zone.temperature_entity);
    const remainingState = this._entityState(zone.remaining_time_entity);
    const programState = this._entityState(zone.program_entity);
    const hot = this._entityState(zone.hot_entity)?.state === "on";
    const panState = this._entityState(zone.pan_entity);
    const noPan = panState?.state === "off";

    const power = powerState?.state ?? "";
    const idle = OFF_POWER_STATES.includes(power.toLowerCase());
    const label = zone.name || `Zone ${index + 1}`;

    return html`
      <div class="zone ${idle ? "idle" : ""}">
        <div class="zone-label">
          <span>${label}</span>
          <span class="zone-flags">
            ${hot ? html`<ha-icon class="hot" icon="mdi:heat-wave" title="Still hot"></ha-icon>` : nothing}
            ${noPan
              ? html`<ha-icon class="no-pan" icon="mdi:pot-mix-outline" title="No pan detected"></ha-icon>`
              : nothing}
          </span>
        </div>
        <div class="zone-power">${powerState ? power : "–"}</div>
        ${programState && !idle ? html`<div class="zone-detail">${programState.state}</div>` : nothing}
        ${tempState
          ? html`
              <div class="zone-detail">
                <ha-icon icon="mdi:thermometer"></ha-icon>
                <span>${tempState.state}${tempState.attributes.unit_of_measurement ?? ""}</span>
              </div>
            `
          : nothing}
        ${remainingState && !idle
          ? html`
              <div class="zone-detail">
                <ha-icon icon="mdi:timer-outline"></ha-icon>
                <span>${formatMinutes(remainingState.state)}</span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  /** Zone grid, then the hob-wide safety row - the latter only when triggered. */
  protected _renderExtraRows(): TemplateResult | typeof nothing {
    const zones = this._config.zones ?? [];
    const stillHot = this._entityState(this._config.hot_entity)?.state === "on";
    const noPan = this._entityState(this._config.pan_entity)?.state === "off";
    const errorState = this._entityState(this._config.error_entity);
    const error =
      errorState && !NO_ERROR_STATES.includes(errorState.state.toLowerCase()) ? errorState.state : undefined;

    if (zones.length === 0 && !stillHot && !noPan && !error) {
      return nothing;
    }

    return html`
      ${zones.length > 0
        ? html`<div class="zones">${zones.map((zone, index) => this._renderZone(zone, index))}</div>`
        : nothing}
      ${stillHot || noPan || error
        ? html`
            <div class="warnings">
              ${stillHot
                ? html`<span class="warning"><ha-icon icon="mdi:heat-wave"></ha-icon> Surface still hot</span>`
                : nothing}
              ${noPan
                ? html`<span class="warning"><ha-icon icon="mdi:pot-mix-outline"></ha-icon> No pan detected</span>`
                : nothing}
              ${error
                ? html`<span class="warning error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${error}</span>`
                : nothing}
            </div>
          `
        : nothing}
    `;
  }

  static get styles(): CSSResultGroup {
    return hobStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hon-hob-card": HonHobCard;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "hon-hob-card",
  name: "Haier hOn Induction Hob",
  description:
    "Card for a Haier hOn induction hob: a per-zone grid (Z1-Z4) of power, temperature and remaining time " +
    "with still-hot and no-pan flags, plus hob-wide tiles and warnings.",
  preview: false,
});
