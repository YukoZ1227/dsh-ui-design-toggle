/**
 * dsh-ui-design-toggle · browser half.
 *
 * Registers one switch in the sidebar footer (`sidebar.footer.action`). The
 * switch writes the plugin entry's live config through the settings transport
 * (`configForms` service) — the host half re-reads that config after the fiber
 * restarts and re-applies the skill gate.
 *
 * Module format: the DSH client module loader registers each bundle with
 * `window.__ModuleLoader__.load({ id, factory })`; the factory materializes on
 * first import. `inject` names client services, not modules.
 */
window.__ModuleLoader__.load({
  id: 'dsh-ui-design-toggle',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    const React = require('react')
    const primitives = require('@deepseek-ai/dsh-client-ui-primitives')

    /** Profile entry id (settings namespace). */
    const ENTRY_ID = 'ui-design-toggle'
    /** Skill gated by the switch. */
    const SKILL = 'ui-ux-pro-max'

    /** Required client services. */
    const inject = ['slots', 'configForms']

    /**
     * Subscribe one ConfigFormController into a React render.
     * @param {{ getSnapshot(): any, subscribe(listener: () => void): () => void }} form
     * @returns {{ status?: string, value?: { enabled?: boolean } }}
     */
    function useForm(form) {
      const subscribe = React.useCallback((listener) => form.subscribe(listener), [form])
      const getSnapshot = React.useCallback(() => form.getSnapshot(), [form])
      if (typeof React.useSyncExternalStore === 'function') {
        return React.useSyncExternalStore(subscribe, getSnapshot)
      }
      const [snapshot, setSnapshot] = React.useState(getSnapshot)
      React.useEffect(() => {
        setSnapshot(form.getSnapshot())
        return form.subscribe(() => setSnapshot(form.getSnapshot()))
      }, [form])
      return snapshot
    }

    /** Draw one small toggle track with an animated knob. */
    function SwitchTrack({ checked }) {
      const track = {
        position: 'relative',
        width: 32,
        height: 18,
        borderRadius: 9,
        flexShrink: 0,
        background: checked
          ? 'var(--dsw-alias-state-business-primary, #3B82F6)'
          : 'var(--dsw-static-neutral-400, #9CA3AF)',
        opacity: checked ? 1 : 0.55,
        transition: 'background 150ms ease, opacity 150ms ease',
        pointerEvents: 'none',
      }
      const knob = {
        position: 'absolute',
        top: 2,
        left: checked ? 16 : 2,
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'var(--dsw-static-neutral-00, #FFFFFF)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
        transition: 'left 150ms ease',
      }
      return React.createElement('span', { style: track, 'aria-hidden': 'true' }, React.createElement('span', { style: knob }))
    }

    /** Full-width footer row: skill icon + label + switch. */
    function ToggleRow({ wide, form, toggle }) {
      const snapshot = useForm(form)
      const enabled = snapshot?.value?.enabled !== false
      const label = 'UI 设计技能'
      const detail = enabled ? SKILL : `${SKILL} · 已关闭`

      const styleRoot = {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: wide ? '100%' : undefined,
        minWidth: 0,
        padding: wide ? '4px 8px' : 4,
        borderRadius: 10,
        cursor: 'pointer',
        color: 'var(--dsw-alias-label-secondary, #6B7280)',
        fontSize: 12,
        lineHeight: '16px',
        transition: 'background 120ms ease',
      }
      const styleIcon = {
        flexShrink: 0,
        width: 18,
        height: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: enabled ? 'var(--dsw-alias-brand-primary, #3B82F6)' : 'var(--dsw-alias-label-tertiary, #9CA3AF)',
      }
      const styleText = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }

      const row = React.createElement(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': enabled,
          'aria-label': `UI 设计技能开关（${SKILL}）`,
          title: enabled ? `${SKILL} 技能已启用` : `${SKILL} 技能已禁用`,
          onClick: toggle,
          style: styleRoot,
          onMouseEnter: (event) => {
            event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.12))'
          },
          onMouseLeave: (event) => {
            event.currentTarget.style.background = 'transparent'
          },
        },
        [
          React.createElement(
            'span',
            { key: 'icon', style: styleIcon },
            React.createElement(primitives.IconSkillOutlineRegular, { width: 18, height: 18 }),
          ),
          React.createElement(
            'span',
            { key: 'text', style: styleText },
            React.createElement('span', { style: { fontWeight: 500, color: 'var(--dsw-alias-label-primary, #111827)' } }, label),
            React.createElement(
              'span',
              { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, #9CA3AF)' } },
              detail,
            ),
          ),
          React.createElement(SwitchTrack, { key: 'switch', checked: enabled }),
        ],
      )

      // Collapsed rail: icon-only control with a native tooltip.
      if (!wide) {
        if (typeof primitives.Tooltip === 'function') {
          return React.createElement(
            primitives.Tooltip,
            { label: `${label}：${enabled ? '开' : '关'}`, delayMs: 400, children: row },
          )
        }
        return row
      }
      return row
    }

    /**
     * Client plugin body.
     * @param {object} ctx - client cordis context.
     */
    function apply(ctx) {
      const form = ctx.configForms.get(ENTRY_ID)
      const toggle = () => {
        const enabled = form.getSnapshot()?.value?.enabled !== false
        form.set('enabled', !enabled)
      }
      ctx.slots.inject('sidebar.footer.action', () =>
        ctx.slots.register(
          {
            name: 'sidebar.footer.action',
            id: ENTRY_ID,
            order: 20,
            inject: () => ({ form, toggle }),
          },
          ToggleRow,
        ),
      )
    }

    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
