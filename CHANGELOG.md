# Changelog

## 0.2.1 — 2026-10-21

发布准备：让插件能「一条命令」装上，并具备进入 DSH 插件市场的元数据。

### 新增

- `scripts/install.ps1`（Windows PowerShell 5.1+）/ `scripts/install.sh`（macOS / Linux）一键安装：
  检查 `dsh` 与 `pnpm` → 优先取最新 release 的 tarball → 失败自动回退 `github:` 源码安装 →
  装完用 `dsh --profile <profile> --dump-config` 自检。
- GitHub Actions `publish.yml`：推 `v*` tag 时自动 `npm publish --provenance`，并把
  `npm pack` 产物挂到同一 Release（一键安装与 tarball 安装依赖它）。
- `README.en.md`：英文说明，插件目录按界面语言展示中/英描述。

### 变更

- `package.json` 补齐发布元数据：`repository` / `homepage` / `bugs` / `author` /
  `publishConfig`；`keywords` 增加 `dsh-plugin`、`dsh-plugin-market`、`sidebar`、`ui` 等检索词；
  `engines` 增加 `dsh: ">=0.2.1-rc.1"`，供插件市场展示宿主兼容性。
- README 安装章节重写为五档（插件市场 → npm → tarball → 一键脚本 → 源码），
  补上「先取得仓库」「pnpm 怎么装」「装完怎么自检」三处缺失；
  修正原文「安装为 `file:` 依赖」的事实错误（`dsh plugin` 装的是 `link:`）。

### 说明

- 本版本不修改插件运行时行为，`lib/` 与 `0.2.0` 一致。

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
