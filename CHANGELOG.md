# Changelog

## 0.2.0 — 2026-10-21

DSH `0.2.1-rc.2` 兼容重建（打破性版本号提升，因插件从 0.1.x 的内部实现重建）。

### 修复

- **插件被 DSH 升级清掉后重新安装**：旧版 `dsh-ui-design-toggle` 包在 profile
  `node_modules` 中消失（profile 重装为 pnpm workspace），但 `dsh.profile.bundles`
  仍引用它，`dsh --profile web --dump-config` 报：
  `skipping profile bundle "dsh-ui-design-toggle": cannot resolve ...`。
- **适配 0.2.1-rc.2 设置 API**：
  - 不再使用已移除的 `ctx.settings.register(settingsNamespace(...))`；
  - 改为插件条目 `Config` 的 `volatile()` 字段 + profile patch 文档持久化；
  - 浏览器半通过 `ctx.configForms.get('ui-design-toggle')` 读写（`set('enabled', value)`）。
- **适配 bundle 补丁格式**：`cordis.patch.yml` 使用 `- insert:` 列表（旧版为顶层行列表）。
- **客户端模块格式**：`window.__ModuleLoader__.load({ id, factory })`，`id` 与包名一致，
  服务注入使用 `inject = ['slots', 'configForms']`。

### 变更

- 技能门控收敛为 `lib/gate.js`（可注入 `SkillRegistry` 的纯函数，便于单元测试）。
- 开关组件使用 `ConfigFormController` 快照订阅（`useSyncExternalStore`），
  收起侧边栏时显示图标 + Tooltip。
- 宿主侧隐藏自动设置页（`settings.configure({ auto: false })`），避免与侧边栏开关重复。

### 已知限制

- 仅验证于 `web` profile；headless 等不含 settings/slots 的 profile 不适用。
- 技能名可配置（默认 `ui-ux-pro-max`），但客户端标签固定显示该技能名。
