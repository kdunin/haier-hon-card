import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCard } from "custom-card-helpers";

import type { HonSensorCardConfig, HonSensorTileConfig } from "../types";
import { controlStyles, renderProgramSelect, renderToggleChips, selectOption, toggleEntity } from "../util/controls";

export const sensorCardStyles: CSSResultGroup = [
  controlStyles,
  css`
    ha-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header ha-icon {
      --mdc-icon-size: 28px;
    }
    .header .name {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 12px;
    }
    .tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      text-align: center;
    }
    .tile ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
    }
    .tile-value {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .tile-value .unit {
      font-size: 0.7em;
      font-weight: 400;
      color: var(--secondary-text-color);
      margin-left: 2px;
    }
    .tile-label {
      font-size: 0.75em;
      color: var(--secondary-text-color);
    }
  `,
];

/**
 * Shared implementation for status/air-quality appliances (air purifier,
 * hood): a header colored by an on/off status entity, a grid of read-only
 * value tiles, an optional mode select, and toggle chips.
 */
export abstract class HonSensorCardBase<TConfig extends HonSensorCardConfig = HonSensorCardConfig>
  extends LitElement
  implements LovelaceCard
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() protected _config!: TConfig;

  public setConfig(config: TConfig): void {
    if (!config.tiles || config.tiles.length === 0) {
      throw new Error('"tiles" must list at least one { entity: ... }');
    }
    this._config = config;
  }

  public getCardSize(): number {
    return 2;
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

  /** Entity ids (beyond the shared sensor fields) this card should also watch for changes. */
  protected _extraTrackedIds(): string[] {
    return [];
  }

  private _trackedEntityIds(): string[] {
    const ids = this._config.tiles.map((tile) => tile.entity);
    if (this._config.status_entity) {
      ids.push(this._config.status_entity);
    }
    if (this._config.mode_entity) {
      ids.push(this._config.mode_entity);
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
    return "Appliance";
  }

  /** Header icon; override per appliance (e.g. mdi:air-purifier). */
  protected _defaultIcon(): string {
    return "mdi:information-outline";
  }

  /** Extension point: extra rows rendered between the tiles and the mode select. */
  protected _renderExtraRows(): TemplateResult | typeof nothing {
    return nothing;
  }

  private _renderTile(tile: HonSensorTileConfig): TemplateResult | typeof nothing {
    const tileState = this._entityState(tile.entity);
    if (!tileState) {
      return nothing;
    }
    const label = tile.name || tileState.attributes.friendly_name || tile.entity;
    const unit = tile.unit ?? tileState.attributes.unit_of_measurement ?? "";
    return html`
      <div class="tile">
        <ha-icon icon=${tile.icon || "mdi:circle-medium"}></ha-icon>
        <div class="tile-value">${tileState.state}${unit ? html`<span class="unit">${unit}</span>` : nothing}</div>
        <div class="tile-label">${label}</div>
      </div>
    `;
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    const statusState = this._entityState(this._config.status_entity);
    const name = this._config.name || statusState?.attributes.friendly_name || this._defaultName();
    const isOn = statusState?.state === "on";
    const headerColor = statusState
      ? isOn
        ? "var(--state-active-color, #039be5)"
        : "var(--disabled-text-color)"
      : "var(--primary-text-color)";

    return html`
      <ha-card>
        <div class="header">
          <ha-icon .icon=${this._defaultIcon()} style="color: ${headerColor}"></ha-icon>
          <div class="name">${name}</div>
        </div>
        <div class="tiles">${this._config.tiles.map((tile) => this._renderTile(tile))}</div>
        ${this._renderExtraRows()}
        ${renderProgramSelect(this.hass, this._config.mode_entity, (id, option) =>
          selectOption(this.hass, id, option),
        )}
        ${renderToggleChips(this.hass, this._config.toggles, (id) => toggleEntity(this.hass, id))}
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return sensorCardStyles;
  }
}
