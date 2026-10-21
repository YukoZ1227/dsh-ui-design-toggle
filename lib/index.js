/**
 * dsh-ui-design-toggle · host half.
 *
 * Registers the profile entry's live config (`enabled` / `skill`) as the source
 * of truth for the skill gate, and hides the plugin's automatic settings page
 * because the sidebar switch is its UI surface.
 *
 * DSH 0.2.1-rc.2 contract notes:
 *   - settings live in the profile patch document, edited through the entry's
 *     volatile Config fields (`SettingsForms.describe()/mutate()`);
 *   - a config edit restarts the fiber (`Fiber.update()` → `restart()`), so the
 *     `apply()` below re-runs with the new config every time.
 *
 * @module dsh-ui-design-toggle
 */
import z from '@deepseek-ai/schemastery'
import { SkillRegistry } from '@deepseek-ai/dsh-skill'
import {
  DEFAULT_SKILL,
  applyGateConfig,
  createGate,
  installSkillGate,
} from './gate.js'

/** Profile entry id; also the settings namespace the browser half writes to. */
export const ENTRY_ID = 'ui-design-toggle'

/** Plugin name shown in loader diagnostics. */
export const name = 'ui-design-toggle'

/**
 * Live config schema. Both fields are `volatile()` so the settings document
 * (profile `cordis.patch.yml`) can edit them without a profile reload.
 */
export const Config = z.object({
  skill: z.string().default(DEFAULT_SKILL).description('Skill name to gate').volatile(),
  enabled: z.boolean().default(true).description('Whether the gated skill is available').volatile(),
})

/** Shared gate state; the browser switch flips it through the settings document. */
const gate = createGate()

/**
 * Install the skill gate and bind the plugin's live config to it.
 *
 * @param {object} ctx - host plugin context.
 * @param {{ enabled?: unknown, skill?: unknown }} config - validated, possibly volatile config.
 */
export function apply(ctx, config) {
  applyGateConfig(gate, config)
  installSkillGate(SkillRegistry, gate)
  ctx.logger.info(
    '[ui-design-toggle] skill gate %s · "%s"',
    gate.enabled ? 'enabled' : 'disabled',
    gate.skill,
  )

  // The sidebar switch owns this preference; keep the automatic settings page out of Settings.
  ctx.inject(['settings'], (settings) => {
    settings.effect(
      () => settings.settings.configure({ auto: false }, ctx.fiber),
      'ui-design-toggle: hide automatic settings page',
    )
  })
}

export default { apply, name, Config }
