import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCard } from "custom-card-helpers";

import type { HonClimateCardConfig, HonClimateZoneConfig } from "../types";
import { controlStyles, renderProgramSelect, renderToggleChips, selectOption, toggleEntity } from "../util/controls";

const TEMP_STEP = 0.5;

export const climateCardStyles: CSSResultGroup = [
  controlStyles,
  css`
    ha-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .header .name {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .zones {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .zone {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 100px;
    }
    .zone-label {
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }
    .current {
      font-size: 1.4em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .target-stepper {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .target {
      min-width: 3em;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .icon-button.small {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-button.small:hover {
      background: var(--divider-color);
    }
    .not-found {
      color: var(--error-color);
    }
  `,
];

/**
 * Shared implementation for temperature-driven appliances (AC, oven,
 * fridge/freezer, wine cellar): 1-3 zones of current + target temperature,
 * an optional program/mode select, and toggle chips for extra switches.
 *
 * Deliberately doesn't reinvent HA's thermostat dial - this sits alongside
 * or replaces the built-in `thermostat` card for appliances where you want
 * several zones and extra controls in one compact card.
 */
export abstract class HonClimateCardBase<TConfig extends HonClimateCardConfig = HonClimateCardConfig>
  extends LitElement
  implements LovelaceCard
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() protected _config!: TConfig;

  public setConfig(config: TConfig): void {
    if (!config.zones || config.zones.length === 0) {
      throw new Error('"zones" must list at least one { climate_entity: ... }');
    }
    this._config = config;
  }

  public getCardSize(): number {
    return 2 + this._config.zones.length;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("_config")) {
      return true;
    }
    if (!this._config || !changedProps.has("hass")) {
      return false;
    }
    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
    if (!oldHass) {
      return true;
    }
    return this._trackedEntityIds().some((id) => oldHass.states[id] !== this.hass.states[id]);
  }

  /** Entity ids (beyond the shared climate fields) this card should also watch for changes. */
  protected _extraTrackedIds(): string[] {
    return [];
  }

  private _trackedEntityIds(): string[] {
    const ids = this._config.zones.map((zone) => zone.climate_entity);
    if (this._config.program_entity) {
      ids.push(this._config.program_entity);
    }
    if (this._config.status_entity) {
      ids.push(this._config.status_entity);
    }
    for (const toggle of this._config.toggles ?? []) {
      ids.push(toggle.entity);
    }
    ids.push(...this._extraTrackedIds());
    return ids;
  }

  protected _entityState(entityId?: string) {
    return entityId ? this.hass.states[entityId] : undefined;
  }

  protected _defaultName(): string {
    return "Climate";
  }

  /** Extension point: extra rows rendered between the zones and the program select. */
  protected _renderExtraRows(): TemplateResult | typeof nothing {
    return nothing;
  }

  private _step(zone: HonClimateZoneConfig, delta: number): void {
    const zoneState = this._entityState(zone.climate_entity);
    if (!zoneState) {
      return;
    }
    const current = Number(zoneState.attributes.temperature);
    if (!Number.isFinite(current)) {
      return;
    }
    const min = Number(zoneState.attributes.min_temp ?? -Infinity);
    const max = Number(zoneState.attributes.max_temp ?? Infinity);
    const next = Math.min(max, Math.max(min, current + delta));
    void this.hass.callService("climate", "set_temperature", {
      entity_id: zone.climate_entity,
      temperature: next,
    });
  }

  private _renderZone(zone: HonClimateZoneConfig): TemplateResult {
    const zoneState = this._entityState(zone.climate_entity);
    if (!zoneState) {
      return html`<div class="not-found">Entity not found: ${zone.climate_entity}</div>`;
    }
    const current = zoneState.attributes.current_temperature;
    const target = zoneState.attributes.temperature;
    const unit = this.hass.config?.unit_system?.temperature ?? "";
    const label = zone.name || zoneState.attributes.friendly_name || "Zone";
    const off = zoneState.state === "off";

    return html`
      <div class="zone">
        <div class="zone-label">${label}</div>
        <span class="current">${current != null ? `${current}${unit}` : "–"}</span>
        ${!off && target != null
          ? html`
              <div class="target-stepper">
                <button class="icon-button small" title="Lower target" @click=${() => this._step(zone, -TEMP_STEP)}>
                  <ha-icon icon="mdi:minus"></ha-icon>
                </button>
                <span class="target">${target}${unit}</span>
                <button class="icon-button small" title="Raise target" @click=${() => this._step(zone, TEMP_STEP)}>
                  <ha-icon icon="mdi:plus"></ha-icon>
                </button>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    const statusState = this._entityState(this._config.status_entity);
    const name = this._config.name || statusState?.attributes.friendly_name || this._defaultName();

    return html`
      <ha-card>
        <div class="header"><div class="name">${name}</div></div>
        <div class="zones">${this._config.zones.map((zone) => this._renderZone(zone))}</div>
        ${this._renderExtraRows()}
        ${renderProgramSelect(this.hass, this._config.program_entity, (id, option) =>
          selectOption(this.hass, id, option),
        )}
        ${renderToggleChips(this.hass, this._config.toggles, (id) => toggleEntity(this.hass, id))}
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return climateCardStyles;
  }
}
