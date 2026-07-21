import { LitElement, html, css, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCard } from "custom-card-helpers";

import { DEFAULT_STATUS_META, STATUS_META, UNAVAILABLE_STATES } from "./const";
import type { HonWashingMachineCardConfig } from "./types";
import { formatMinutes } from "./util/format";

const TRACKED_ENTITY_KEYS = [
  "status_entity",
  "program_entity",
  "phase_entity",
  "remaining_time_entity",
  "door_entity",
  "power_entity",
  "pause_entity",
] as const;

@customElement("hon-washing-machine-card")
export class HonWashingMachineCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: HonWashingMachineCardConfig;

  public setConfig(config: HonWashingMachineCardConfig): void {
    if (!config.status_entity) {
      throw new Error('"status_entity" is required (the appliance\'s Machine Status sensor)');
    }
    this._config = config;
  }

  public getCardSize(): number {
    return 3;
  }

  public static getStubConfig(): Partial<HonWashingMachineCardConfig> {
    return {
      status_entity: "",
      program_entity: "",
      phase_entity: "",
      remaining_time_entity: "",
    };
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

  private _trackedEntityIds(): string[] {
    return TRACKED_ENTITY_KEYS.map((key) => this._config[key]).filter(
      (id): id is string => Boolean(id),
    );
  }

  private _entityState(entityId?: string) {
    return entityId ? this.hass.states[entityId] : undefined;
  }

  private _toggle(entityId?: string): void {
    if (!entityId) {
      return;
    }
    const [domain] = entityId.split(".");
    void this.hass.callService(domain, "toggle", { entity_id: entityId });
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
        ${powerState || pauseState
          ? html`
              <div class="actions">
                ${powerState
                  ? html`
                      <button
                        class="icon-button"
                        title=${isRunning ? "Stop" : "Start"}
                        @click=${() => this._toggle(this._config.power_entity)}
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
                        @click=${() => this._toggle(this._config.pause_entity)}
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

  /** Strips the entity description's suffix (e.g. "Washing Machine Machine Status" -> "Washing Machine"). */
  private _deviceName(friendlyName?: string): string {
    if (!friendlyName) {
      return "Washing Machine";
    }
    return friendlyName.replace(/\s+(Machine Status)$/i, "");
  }

  static get styles(): CSSResultGroup {
    return css`
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
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hon-washing-machine-card": HonWashingMachineCard;
  }
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "hon-washing-machine-card",
  name: "Haier hOn Washing Machine",
  description: "Status card for a Haier hOn washing machine or tumble dryer appliance.",
  preview: false,
});
