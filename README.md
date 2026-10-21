# dsh-ui-design-toggle

> DeepSeek Harness 插件：在侧边栏底部加一个开关，一键启用/停用 **ui-ux-pro-max** 设计技能。

A DeepSeek Harness plugin that adds a sidebar switch to enable or disable the
`ui-ux-pro-max` UI/UX design skill (installed under `%DSH_HOME%/skills` or
`~/.agents/skills`) at runtime.

- **适配 DSH 版本**：`0.2.1-rc.2`（同时依赖 `@deepseek-ai/cordis ~4.0.5`、`@deepseek-ai/dsh-skill 0.2.1-rc.2`、`@deepseek-ai/schemastery ~3.18.5`）
- **适用 profile**：`web`（需要 `slots`、`configForms` 客户端服务与 settings 宿主服务）

## 功能

- 侧边栏底部（`sidebar.footer.action` 槽位）出现「UI 设计技能」开关：
  - **开启**：`ui-ux-pro-max` 正常出现在技能目录，可被模型加载；
  - **关闭**：从 `<available_skills>` 目录与 `skill` 工具中隐藏，`/ui-ux-pro-max` 手势也不再注入内容；
  - 收起侧边栏时自动变为图标按钮 + 悬浮提示。
- 状态通过 DSH 设置文档持久化（profile `cordis.patch.yml` 的 `ui-design-toggle` 行），刷新/重启后保持。
- 技能门控覆盖所有消费路径：`snapshot()`（目录）、`list()`（委托 snapshot）、`get()`（加载）。

## 安装

> 前置：DSH `0.2.1-rc.2`，profile 已存在（例如 `web`），且 `pnpm` 在 PATH 中。

```bash
# 在插件源码目录执行（或任意目录下给出绝对路径）：
dsh plugin --profile web add D:\APPS\Git\dsh-ui-design-toggle
```

`dsh plugin add` 会把本包安装为 profile 依赖（`file:` 链接），并自动把
`dsh-ui-design-toggle` 追加到 profile `package.json` 的 `dsh.profile.bundles`。

也可以手动安装（无 pnpm 时）：

1. 把本目录复制到 `%DSH_HOME%/profiles/web/node_modules/dsh-ui-design-toggle`；
2. 在 `%DSH_HOME%/profiles/web/package.json` 的 `dsh.profile.bundles` 末尾加入
   `"dsh-ui-design-toggle"`。

安装后**重启 web 服务**（关闭旧的 `dsh web` 进程并重新启动）即生效。

## 使用

1. 打开 Web GUI，侧边栏底部出现「UI 设计技能」开关与开关状态（`ui-ux-pro-max · 已关闭/已启用`）。
2. 点击开关切换状态，立即生效（无需重启）。
3. 验证：
   - 开启时对模型说「用 ui-ux-pro-max 设计一个页面」，技能正常加载；
   - 关闭时技能目录不再包含它。

## 配置

插件配置写入 profile `cordis.patch.yml` 的 `ui-design-toggle` 行：

```yaml
- id: ui-design-toggle
  name: dsh-ui-design-toggle
  config:
    skill: ui-ux-pro-max   # 要门控的技能名
    enabled: true          # 开关状态
```

字段均为 `volatile()`，通过设置文档实时编辑；改动后宿主会重启该插件实例并重新装配门控。

## 兼容性说明

| DSH 版本 | 状态 |
| --- | --- |
| `0.2.1-rc.2` | ✅ 已验证（本项目开发基线） |
| `0.2.0` 及更早 | ❌ 旧版 settings API（`ctx.settings.register(settingsNamespace(...))`）已移除，需使用 0.1.x 版本或按旧 API 适配 |

## 开发与测试

```bash
# 依赖门控逻辑的单元验证（在 DSH 安装目录内运行，以便解析 @deepseek-ai/* 包）：
# 见仓库讨论或 CI 脚本；核心断言：
#   1. 关闭时 snapshot()/get() 均不含被门控技能
#   2. 开启时目录恢复
```

## License

MIT
