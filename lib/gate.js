/**
 * dsh-ui-design-toggle · host-side skill gate.
 *
 * The gate filters one named skill out of the `ctx.skills` catalog while it is
 * disabled. DSH's SkillRegistry exposes `snapshot()` (catalog) and `get()`
 * (load one skill); `list()` delegates to `snapshot()`, so wrapping those two
 * prototype methods covers every consumer path:
 *
 *   - the per-step `<available_skills>` catalog (snapshot/list),
 *   - `/skill-name` gestures and explicit invocation (get).
 *
 * Everything here is dependency-injected (`installSkillGate` receives the
 * registry class) so the gate can be unit-tested against the real
 * `@deepseek-ai/dsh-skill` registry without loading the whole host.
 *
 * @module dsh-ui-design-toggle/gate
 */

/** Symbol stamping the prototype once the gate is installed (idempotent across plugin restarts). */
const PATCHED = Symbol.for('dsh-ui-design-toggle.gate.v1')

/** Skill name gated by default. */
export const DEFAULT_SKILL = 'ui-ux-pro-max'

/** Fresh gate state; the host half overwrites it from the plugin config. */
export function createGate() {
  return { enabled: true, skill: DEFAULT_SKILL }
}

/**
 * Read a config value that may be a plain value or a DSH volatile wrapper
 * (`{ get() }`). Returns `fallback` for `undefined`/`null`/throwing wrappers.
 *
 * @param {unknown} value - raw or volatile config value.
 * @param {unknown} fallback - value used when nothing usable is present.
 * @returns {unknown} the unwrapped value.
 */
export function unwrap(value, fallback) {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'object' && typeof value.get === 'function') {
    try {
      const read = value.get()
      return read === undefined ? fallback : read
    } catch {
      return fallback
    }
  }
  return value
}

/**
 * Copy the plugin config onto the gate object (mutates in place).
 *
 * @param {{ enabled: boolean, skill: string }} gate - live gate state.
 * @param {object | undefined} config - validated plugin config.
 */
export function applyGateConfig(gate, config) {
  const enabled = unwrap(config?.enabled, true)
  const skill = unwrap(config?.skill, DEFAULT_SKILL)
  gate.enabled = enabled !== false
  if (typeof skill === 'string' && skill.trim() !== '') gate.skill = skill.trim()
}

/**
 * Patch the SkillRegistry prototype with the gate (idempotent).
 *
 * @param {Function | undefined} registryClass - the `SkillRegistry` export of `@deepseek-ai/dsh-skill`.
 * @param {{ enabled: boolean, skill: string }} gate - live gate state read on every call.
 * @returns {boolean} whether the gate is installed.
 */
export function installSkillGate(registryClass, gate) {
  if (typeof registryClass !== 'function' || registryClass.prototype == null) return false
  const proto = registryClass.prototype
  if (proto[PATCHED]) return true

  const originalSnapshot = proto.snapshot
  const originalGet = proto.get

  if (typeof originalSnapshot === 'function') {
    proto.snapshot = async function snapshotWithGate(options) {
      const result = await originalSnapshot.call(this, options)
      if (!result || !Array.isArray(result.skills) || gate.enabled) return result
      return {
        ...result,
        skills: result.skills.filter((skill) => skill?.name !== gate.skill),
      }
    }
  }

  if (typeof originalGet === 'function') {
    proto.get = async function getWithGate(name, options) {
      if (!gate.enabled && name === gate.skill) return undefined
      return originalGet.call(this, name, options)
    }
  }

  Object.defineProperty(proto, PATCHED, { value: true, configurable: false, enumerable: false })
  return true
}
