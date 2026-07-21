import { css, html, nothing } from "lit";
import type { CSSResultGroup, TemplateResult } from "lit";
import type { HomeAssistant } from "custom-card-helpers";

import type { HonSelectConfig, HonToggleConfig } from "../types";

/** Calls `<domain>.toggle` for any HA entity (switch, fan, lock, ...). */
export function toggleEntity(hass: HomeAssistant, entityId: string): void {
  const [domain] = entityId.split(".");
  void hass.callService(domain, "toggle", { entity_id: entityId });
}

/** Calls `select.select_option`. */
export function selectOption(hass: HomeAssistant, entityId: string, option: string): void {
  void hass.callService("select", "select_option", { entity_id: entityId, option });
}

/**
 * Renders a `select.*` entity's current option plus its full option list as a
 * native `<select>`, so program/mode pickers don't need to reinvent one.
 */
export function renderProgramSelect(
  hass: HomeAssistant,
  entityId: string | undefined,
  onSelect: (entityId: string, option: string) => void,
): TemplateResult | typeof nothing {
  const entityState = entityId ? hass.states[entityId] : undefined;
  if (!entityId || !entityState) {
    return nothing;
  }
  const options: string[] = entityState.attributes.options ?? [];
  return html`
    <div class="row program">
      <ha-icon icon="mdi:tune"></ha-icon>
      <select @change=${(e: Event) => onSelect(entityId, (e.target as HTMLSelectElement).value)}>
        ${options.map(
          (option) => html`<option value=${option} ?selected=${option === entityState.state}>${option}</option>`,
        )}
      </select>
    </div>
  `;
}

/**
 * Renders one labeled `select.*` entity as an icon + name + `<select>` row, for cards that
 * offer several distinct config selects (program, spin speed, temperature, ...) rather than
 * the single unlabeled mode/program picker `renderProgramSelect` covers.
 */
export function renderSelectRow(
  hass: HomeAssistant,
  select: HonSelectConfig,
  onSelect: (entityId: string, option: string) => void,
): TemplateResult | typeof nothing {
  const entityState = hass.states[select.entity];
  if (!entityState) {
    return nothing;
  }
  const options: string[] = entityState.attributes.options ?? [];
  const label = select.name || entityState.attributes.friendly_name || select.entity;
  return html`
    <div class="row program">
      <ha-icon icon=${select.icon || "mdi:tune"}></ha-icon>
      <span class="select-label">${label}</span>
      <select @change=${(e: Event) => onSelect(select.entity, (e.target as HTMLSelectElement).value)}>
        ${options.map(
          (option) => html`<option value=${option} ?selected=${option === entityState.state}>${option}</option>`,
        )}
      </select>
    </div>
  `;
}

/** Renders a row of pill-shaped toggle buttons for a list of switch/fan/lock entities. */
export function renderToggleChips(
  hass: HomeAssistant,
  toggles: HonToggleConfig[] | undefined,
  onToggle: (entityId: string) => void,
): TemplateResult | typeof nothing {
  const list = toggles ?? [];
  if (list.length === 0) {
    return nothing;
  }
  return html`
    <div class="toggles">
      ${list.map((toggle) => {
        const toggleState = hass.states[toggle.entity];
        if (!toggleState) {
          return nothing;
        }
        const active = toggleState.state === "on";
        const label = toggle.name || toggleState.attributes.friendly_name || toggle.entity;
        return html`
          <button class="chip ${active ? "active" : ""}" title=${label} @click=${() => onToggle(toggle.entity)}>
            <ha-icon icon=${toggle.icon || "mdi:toggle-switch-outline"}></ha-icon>
            <span>${label}</span>
          </button>
        `;
      })}
    </div>
  `;
}

/** Shared styles for `renderProgramSelect` and `renderToggleChips` output. */
export const controlStyles: CSSResultGroup = css`
  .row.program {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .row.program ha-icon {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
  }
  .row.program select {
    flex: 1;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--primary-text-color);
  }
  .select-label {
    min-width: 90px;
    color: var(--secondary-text-color);
  }
  .settings-toggle {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 0;
    border: none;
    background: none;
    color: var(--secondary-text-color);
    font-size: 0.85em;
    cursor: pointer;
  }
  .settings-toggle ha-icon {
    --mdc-icon-size: 16px;
  }
  .more-settings {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 16px;
    border: none;
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    cursor: pointer;
    font-size: 0.85em;
  }
  .chip ha-icon {
    --mdc-icon-size: 16px;
  }
  .chip.active {
    background: var(--state-active-color, #039be5);
    color: white;
  }
`;
