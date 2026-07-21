import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCard } from "custom-card-helpers";

import { DEFAULT_STATUS_META, STATUS_META, UNAVAILABLE_STATES } from "../const";
import type { HonCycleCardConfig } from "../types";
import { toggleEntity } from "../util/controls";
import { formatMinutes } from "../util/format";

const BASE_TRACKED_KEYS: (keyof HonCycleCardConfig)[] = [
  "status_entity",
  "program_entity",
  "phase_entity",
  "remaining_time_entity",
  "door_entity",
  "power_entity",
  "pause_entity",
];

export const cycleCardStyles: CSSResultGroup = css`
  ha-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .header ha-icon {
    --mdc-icon-size: 32px;
  }
  .title {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .name {
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status {
    font-size: 0.9em;
  }
  .door {
    --mdc-icon-size: 20px;
    color: var(--disabled-text-color);
  }
  .door.open {
    color: var(--warning-color, #ff9800);
  }
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
  .program {
    justify-content: space-between;
  }
  .program-name {
    color: var(--primary-text-color);
    font-weight: 500;
  }
  .not-found {
    padding: 16px;
    color: var(--error-color);
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
`;

/**
 * Shared implementation for "program cycle" appliances: a status/program/phase/
 * remaining-time header, an optional door indicator, and optional start/stop +
 * pause buttons. Used by the washing machine and dishwasher cards.
 *
 * Subclasses register their own `@customElement` tag and can override
 * `_defaultName`, `_extraTrackedKeys` and `_renderExtraRows` to add
 * appliance-specific content (e.g. the dishwasher's salt/rinse-aid warnings).
 */
export abstract class HonCycleCardBase<TConfig extends HonCycleCardConfig = HonCycleCardConfig>
  extends LitElement
  implements LovelaceCard
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() protected _config!: TConfig;

  public setConfig(config: TConfig): void {
    if (!config.status_entity) {
      throw new Error('"status_entity" is required (the appliance\'s Machine Status sensor)');
    }
    this._config = config;
  }

  public getCardSize(): number {
    return 3;
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

  /** Config keys (beyond the shared cycle fields) this card should also watch for changes. */
  protected _extraTrackedKeys(): (keyof TConfig)[] {
    return [];
  }

  private _trackedEntityIds(): string[] {
    const keys = [...(BASE_TRACKED_KEYS as (keyof TConfig)[]), ...this._extraTrackedKeys()];
    return keys
      .map((key) => this._config[key] as unknown as string | undefined)
      .filter((id): id is string => Boolean(id));
  }

  protected _entityState(entityId?: string) {
    return entityId ? this.hass.states[entityId] : undefined;
  }

  /** Fallback name used when neither config.name nor a derivable friendly_name is available. */
  protected _defaultName(): string {
    return "Appliance";
  }

  /** Strips the status entity's own name from its friendly_name, e.g. "Dish Washer Machine Status" -> "Dish Washer". */
  protected _deviceName(friendlyName?: string): string {
    if (!friendlyName) {
      return this._defaultName();
    }
    return friendlyName.replace(/\s+(Machine Status)$/i, "");
  }

  /** Extension point: extra rows rendered between the remaining-time row and the start/stop actions. */
  protected _renderExtraRows(): TemplateResult | typeof nothing {
    return nothing;
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    const statusState = this._entityState(this._config.status_entity);
    if (!statusState) {
      return html`
        <ha-card>
          <div class="not-found">Entity not found: ${this._config.status_entity}</div>
        </ha-card>
      `;
    }

    const programState = this._entityState(this._config.program_entity);
    const phaseState = this._entityState(this._config.phase_entity);
    const remainingState = this._entityState(this._config.remaining_time_entity);
    const doorState = this._entityState(this._config.door_entity);
    const powerState = this._entityState(this._config.power_entity);
    const pauseState = this._entityState(this._config.pause_entity);

    const statusKey = statusState.state.toLowerCase();
    const isUnavailable = UNAVAILABLE_STATES.includes(statusKey);
    const meta = isUnavailable
      ? DEFAULT_STATUS_META
      : (STATUS_META[statusKey] ?? { ...DEFAULT_STATUS_META, label: statusState.state });
    const name = this._config.name || this._deviceName(statusState.attributes.friendly_name);
    const isRunning = statusKey === "running";
    const doorOpen = doorState?.state === "on";

    return html`
      <ha-card>
        <div class="header">
          <ha-icon .icon=${meta.icon} style="color: ${meta.color}"></ha-icon>
          <div class="title">
            <div class="name">${name}</div>
            <div class="status" style="color: ${meta.color}">${meta.label}</div>
          </div>
          ${doorState
            ? html`
                <ha-icon
                  class="door ${doorOpen ? "open" : ""}"
                  .icon=${doorOpen ? "mdi:door-open" : "mdi:door-closed-lock"}
                  title=${doorOpen ? "Door open" : "Door closed"}
                ></ha-icon>
              `
            : nothing}
        </div>

        ${programState || phaseState
          ? html`
              <div class="row program">
                ${programState ? html`<span class="program-name">${programState.state}</span>` : nothing}
                ${phaseState ? html`<span class="phase">${phaseState.state}</span>` : nothing}
              </div>
            `
          : nothing}
        ${remainingState
          ? html`
              <div class="row remaining">
                <ha-icon icon="mdi:timer-outline"></ha-icon>
                <span>${formatMinutes(remainingState.state)}</span>
              </div>
            `
          : nothing}
        ${this._renderExtraRows()}
        ${powerState || pauseState
          ? html`
              <div class="actions">
                ${powerState
                  ? html`
                      <button
                        class="icon-button"
                        title=${isRunning ? "Stop" : "Start"}
                        @click=${() => toggleEntity(this.hass, this._config.power_entity as string)}
                      >
                        <ha-icon icon=${isRunning ? "mdi:stop" : "mdi:play"}></ha-icon>
                      </button>
                    `
                  : nothing}
                ${pauseState
                  ? html`
                      <button
                        class="icon-button"
                        title="Pause / resume"
                        @click=${() => toggleEntity(this.hass, this._config.pause_entity as string)}
                      >
                        <ha-icon icon="mdi:pause"></ha-icon>
                      </button>
                    `
                  : nothing}
              </div>
            `
          : nothing}
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return cycleCardStyles;
  }
}
