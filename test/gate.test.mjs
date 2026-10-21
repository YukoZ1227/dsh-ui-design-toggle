/**
 * Gate unit test — verifies dsh-ui-design-toggle's skill gate against the REAL
 * `@deepseek-ai/dsh-skill` SkillRegistry from an installed DSH.
 *
 * Run:  node test/gate.test.mjs
 *
 * Environment:
 *   DSH_INSTALL — optional path to the installed `@deepseek-ai/dsh` package
 *                 (defaults to the standard global npm location for this OS).
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const candidates = [
  process.env.DSH_INSTALL,
  process.env.APPDATA
    ? join(process.env.APPDATA, 'npm', 'node_modules', '@deepseek-ai', 'dsh')
    : undefined,
  '/usr/local/lib/node_modules/@deepseek-ai/dsh',
  '/usr/lib/node_modules/@deepseek-ai/dsh',
].filter(Boolean)

const install = candidates.find((dir) =>
  existsSync(join(dir, 'node_modules', '@deepseek-ai', 'cordis', 'lib', 'index.js')),
)
if (!install) {
  console.error('Cannot find an installed DSH (@deepseek-ai/dsh). Set DSH_INSTALL to its package directory.')
  process.exit(1)
}

const cordis = await import(
  pathToFileURL(join(install, 'node_modules', '@deepseek-ai', 'cordis', 'lib', 'index.js')).href
)
const skill = await import(
  pathToFileURL(join(install, 'node_modules', '@deepseek-ai', 'dsh-skill', 'lib', 'index.js')).href
)
const { createGate, installSkillGate, applyGateConfig, unwrap } = await import('../lib/gate.js')

const { Context } = cordis
const { SkillRegistry } = skill

const ctx = new Context()
const registry = new SkillRegistry(ctx)
const gate = createGate()

assert.equal(installSkillGate(SkillRegistry, gate), true)
assert.equal(installSkillGate(SkillRegistry, gate), true, 'install is idempotent')

registry.register({
  name: 'ui-ux-pro-max',
  description: 'UI/UX design intelligence',
  content: '# ui-ux-pro-max',
  source: 'test',
})
registry.register({
  name: 'plain-skill',
  description: 'another skill',
  content: '# plain',
  source: 'test',
})

const names = async () => (await registry.list()).map((s) => s.name)

// Gate ON: both skills listed and loadable.
applyGateConfig(gate, { enabled: true })
assert.ok((await names()).includes('ui-ux-pro-max'))
assert.equal((await registry.get('ui-ux-pro-max'))?.name, 'ui-ux-pro-max')

// Gate OFF: the gated skill disappears from list/snapshot/get, others survive.
applyGateConfig(gate, { enabled: false })
assert.ok(!(await names()).includes('ui-ux-pro-max'))
assert.ok(!(await registry.snapshot()).skills.some((s) => s.name === 'ui-ux-pro-max'))
assert.equal(await registry.get('ui-ux-pro-max'), undefined)
assert.ok((await names()).includes('plain-skill'))
assert.equal((await registry.get('plain-skill'))?.name, 'plain-skill')

// Gate ON again: restored.
applyGateConfig(gate, { enabled: true })
assert.ok((await names()).includes('ui-ux-pro-max'))

// Volatile wrappers unwrap; the gate can be pointed at another skill at runtime.
assert.equal(unwrap(undefined, 'fallback'), 'fallback')
applyGateConfig(gate, { enabled: { get: () => false }, skill: { get: () => 'plain-skill' } })
assert.equal(gate.enabled, false)
assert.equal(gate.skill, 'plain-skill')
assert.ok(!(await names()).includes('plain-skill'))
assert.ok((await names()).includes('ui-ux-pro-max'))

console.log('gate.test.mjs: all assertions passed')
