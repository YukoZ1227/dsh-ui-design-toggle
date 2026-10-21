# Contributing

感谢你考虑为 dsh-ui-design-toggle 贡献代码！请先阅读以下约定。

## 开发环境

- Node.js >= 20，pnpm（`dsh plugin` 依赖）
- 已安装 DSH `0.2.1-rc.2`（`dsh --version` 可确认）
- 一个可用的 web profile（默认 `web`）

## 本地开发流程

1. 克隆仓库后，用 `link:` 方式装进 profile：
   ```bash
   dsh plugin --profile web add <仓库路径>
   dsh web   # 重启 web 服务（用你自己的命令，例如 node <dsh>/lib/bin.js web）
   ```
2. 修改 `lib/` 后重启服务验证（宿主模块默认不热重载）。
3. 修改 `lib/gate.js` 等纯逻辑时，直接跑测试：
   ```bash
   node test/gate.test.mjs
   ```
   测试会对已安装 DSH 的真实 `SkillRegistry` 做断言；可用 `DSH_INSTALL` 指向非标准安装路径。

## 提交前检查清单

- [ ] `node test/gate.test.mjs` 通过
- [ ] `dsh --profile web --dump-config` 无 `skipping profile bundle` / `patch: entry` 警告
- [ ] 真实 web 服务启动、侧边栏开关出现且切换生效
- [ ] 改动保持最小化，不与兼容性无关的重构混在同一个 PR
- [ ] CHANGELOG.md 记录变更（适配的 DSH 版本、依赖版本）

## 提交规范

- 一个 PR 一个主题；commit message 使用祈使句（如 `fix: reinstall after DSH profile reset`）。
- 引用相关 Issue；破坏性变更标注 `BREAKING CHANGE:`。
- 不要提交 `node_modules/`、日志、本地 profile 配置或任何密钥/令牌。

## 版本策略

- 补丁版本：bug 修复、文档修正
- 次版本：新增功能、适配新的 DSH 次版本
- 主版本：破坏性变更（如 DSH 设置 API 变更导致的适配）

## 报告问题

请附带：DSH 版本（`dsh --version`）、profile 名称、`dsh --profile web --dump-config` 中与插件相关的输出、以及复现步骤。
