# dsh-ui-design-toggle

![test](https://github.com/YukoZ1227/dsh-ui-design-toggle/actions/workflows/test.yml/badge.svg)

[English](README.en.md) | 中文

> DeepSeek Harness 插件：在侧边栏底部加一个开关，一键启用/停用 **ui-ux-pro-max** 设计技能。
>
> A DeepSeek Harness plugin that adds a sidebar switch to enable or disable the
> `ui-ux-pro-max` UI/UX design skill at runtime.

**适配版本**：DSH `0.2.1-rc.2`（依赖 `@deepseek-ai/cordis ~4.0.5`、`@deepseek-ai/dsh-skill 0.2.1-rc.2`、`@deepseek-ai/schemastery ~3.18.5`）· **适用 profile**：`web`

---

## 快速开始

```bash
# 一条命令装好（需要已安装 dsh 与 pnpm）
dsh plugin --profile web add dsh-ui-design-toggle
```

重启（或刷新）Web GUI，侧边栏底部就会出现「UI 设计技能」开关。

不想碰终端？打开 Web GUI → 账号菜单 → **设置 → 插件市场**，搜 `dsh-ui-design-toggle` 点安装即可。
其余装法（离线 tarball、一键脚本、源码）见[安装](#安装)。

## 功能特性

- **侧边栏开关**：在 `sidebar.footer.action` 槽位渲染「UI 设计技能」开关，不占用主界面空间。
- **运行时生效**：切换后立即生效，无需重启；状态持久化，重启后保持。
- **完整门控**：关闭时，技能从 `<available_skills>` 目录、`skill` 工具加载、`/ui-ux-pro-max` 手势三个消费路径全部移除（`snapshot()` / `list()` / `get()` 全覆盖）。
- **可配置**：门控的技能名与开关状态都是插件条目 `Config` 的 `volatile()` 字段，随 profile 设置文档保存。
- **收起侧边栏自适应**：收起时变为图标按钮 + 悬浮提示。
- **零第三方依赖**：宿主半仅依赖 DSH 安装自带的 `@deepseek-ai/*` 包；浏览器半只依赖 shell 已提供的 React 与服务。

## 安装

**环境要求**（下面所有方式相同）：DSH `0.2.1-rc.2` 及以上 · `web` profile · `pnpm` 在 `PATH` 中。

```bash
dsh --version   # 应显示 0.2.1-rc.2 或更高
pnpm -v         # 没有输出就先装：npm i -g pnpm
```

| 方式 | 适合谁 | 需要敲命令 |
| --- | --- | --- |
| 一、插件市场一键安装 | 不想碰终端 | 否 |
| 二、npm 一条命令 | 已经会用 dsh | 1 条 |
| 三、预构建 tarball | npm 源不可用 / 要锁版本 / 内网分发 | 1 条 |
| 四、一键安装脚本 | 想连版本检查也省掉 | 1 条 |
| 五、源码安装 | 要改代码、提 PR | 3 条 |

### 方式一：插件市场一键安装（最省事）

1. 打开 Web GUI，点右上角账号菜单 → **设置 → 插件市场**（DSH `0.2.1` 起设置入口从侧边栏移到了账号菜单）。
2. 搜索 `dsh-ui-design-toggle`，或翻到 **UI 增强** 分类。
3. 点 **安装**，等进度条走完，刷新页面即可。

市场会自己处理 pnpm、依赖和 `dsh.profile.bundles`，不需要你编辑任何配置文件。

### 方式二：npm 一条命令

```bash
dsh plugin --profile web add dsh-ui-design-toggle
```

`dsh plugin add` 会把本包安装为 profile 的依赖，并自动把
`dsh-ui-design-toggle` 追加到 `%DSH_HOME%/profiles/web/package.json` 的
`dsh.profile.bundles`。重启 web 服务即生效。

校验安装结果：

```bash
dsh --profile web --dump-config | grep -A2 ui-design-toggle
```

### 方式三：预构建 tarball（不走 npm registry）

适合 npm 源被墙、要固定某个版本，或内网分发：

```bash
dsh plugin --profile web add https://github.com/YukoZ1227/dsh-ui-design-toggle/releases/download/v0.2.1/dsh-ui-design-toggle-0.2.1.tgz
```

tarball 就是 `npm pack` 的产物，内容和 npm 包完全一致；不需要 clone，也不需要本地构建。

### 方式四：一键安装脚本

Windows（PowerShell 5.1+）：

```powershell
irm https://raw.githubusercontent.com/YukoZ1227/dsh-ui-design-toggle/main/scripts/install.ps1 | iex
```

macOS / Linux：

```bash
curl -fsSL https://raw.githubusercontent.com/YukoZ1227/dsh-ui-design-toggle/main/scripts/install.sh | bash
```

脚本会依次：检查 `dsh` 与 `pnpm` → 取最新 release 的 tarball → 调用
`dsh plugin --profile <profile> add <tarball>` → 用 `--dump-config` 确认条目已写入。
想先看再执行，就把管道去掉先下载：

```powershell
irm https://raw.githubusercontent.com/YukoZ1227/dsh-ui-design-toggle/main/scripts/install.ps1 -OutFile install.ps1
notepad install.ps1   # 看一遍
./install.ps1
```

### 方式五：源码安装（开发/改动时用）

```bash
git clone https://github.com/YukoZ1227/dsh-ui-design-toggle.git
cd dsh-ui-design-toggle
dsh plugin --profile web add .
```

> 💡 `dsh plugin` 对本地目录安装的是 `link:` 依赖：源码目录与 profile 中安装的副本是同一份；
> 修改源码后重启服务即可生效（宿主模块默认不热重载）。
> 代价是 profile 被重装/升级时这个 `link:` 可能失效，届时重新执行最后一条命令即可。

### 装完自检

```bash
dsh --profile web --dump-config | grep -A2 ui-design-toggle
```

看到 `id: ui-design-toggle`、`name: dsh-ui-design-toggle` 与 `config:` 就说明装好了；
打开 Web GUI，侧边栏底部出现「UI 设计技能」开关即安装成功。

## 使用

1. 打开 Web GUI，侧边栏底部出现「UI 设计技能」开关（副标题显示 `ui-ux-pro-max · 已启用/已关闭`）。
2. 点击切换：
   - **开启**：模型侧技能目录包含 `ui-ux-pro-max`，可直接使用；
   - **关闭**：技能从目录与 `skill` 工具中隐藏。
3. 收起侧边栏时开关变为图标按钮，悬停显示状态提示。

## 配置说明

插件配置写入 profile 的 `cordis.patch.yml`（设置文档），也可通过侧边栏开关修改：

```yaml
- id: ui-design-toggle
  name: dsh-ui-design-toggle
  config:
    skill: ui-ux-pro-max   # 要门控的技能名（默认 ui-ux-pro-max）
    enabled: true          # 开关状态（默认 true）
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `skill` | string | `ui-ux-pro-max` | 要门控的技能名（kebab-case） |
| `enabled` | boolean | `true` | `true` 时技能可用，`false` 时隐藏 |

两个字段都是 `volatile()`，通过设置文档实时编辑；改动后宿主会重启该插件实例并重新装配门控（`Fiber.update()` → `restart()` → `apply()`）。

## 目录结构

```
dsh-ui-design-toggle/
├── package.json            # 包元数据 + dsh.bundle / dsh.client 清单
├── cordis.patch.yml        # bundle 补丁：插入 ui-design-toggle 条目及默认配置
├── lib/
│   ├── index.js            # 宿主半：Config 定义、门控装配、隐藏自动设置页
│   ├── gate.js             # 技能门控纯函数（可注入 SkillRegistry，便于测试）
│   └── client.js           # 浏览器半：侧边栏开关组件（模块加载器格式）
├── scripts/
│   ├── install.ps1         # Windows 一键安装脚本
│   └── install.sh          # macOS / Linux 一键安装脚本
├── test/
│   └── gate.test.mjs       # 门控单元测试（对真实 SkillRegistry 断言）
├── .github/workflows/
│   ├── test.yml            # CI：跑门控测试
│   └── publish.yml         # CI：打 tag 时发布 npm + 上传 release tarball
├── README.md               # 本文档
├── README.en.md            # 英文说明（插件市场按界面语言展示）
├── CHANGELOG.md            # 版本与兼容性记录
├── CONTRIBUTING.md         # 贡献指南
├── LICENSE                 # MIT 许可证
└── .gitignore
```

### 关键约定

- `lib/client.js` 以 `window.__ModuleLoader__.load({ id, factory })` 注册，`id` 必须与包名一致；
- `cordis.patch.yml` 使用 `- insert:` 列表（bundle 补丁格式）；
- 条目 `id`（`ui-design-toggle`）同时是浏览器半 `configForms.get()` 使用的设置命名空间。

## 开发与测试

```bash
# 门控单元测试：对已安装 DSH 的真实 SkillRegistry 断言
node test/gate.test.mjs
# 或
npm test
```

测试会从标准全局安装路径自动发现 `@deepseek-ai/dsh`；自定义安装位置时设置环境变量：

```bash
DSH_INSTALL=/path/to/@deepseek-ai/dsh npm test
```

## 兼容性

| DSH 版本 | 状态 |
| --- | --- |
| `0.2.1-rc.2` | ✅ 已验证（开发基线，见下方验证记录） |
| `0.2.0` 及更早 | ❌ 旧版 settings API（`ctx.settings.register(settingsNamespace(...))`）已移除，需要按旧 API 适配的 0.1.x 版本 |

## 验证记录

以下验证均在本机 DSH `0.2.1-rc.2` 上执行：

| # | 验证项 | 结果 |
| --- | --- | --- |
| 1 | `gate.test.mjs` 对真实 `SkillRegistry` 断言（开启/关闭/恢复/volatile） | ✅ 全部通过 |
| 2 | `dsh --profile web --dump-config` 包含插件条目、无 skip/错误警告 | ✅ |
| 3 | 真实 web 服务启动后宿主半 `apply()` 执行 | ✅ |
| 4 | 设置文档写入 `enabled: false` 后 `apply()` 读到 `config.enabled=false` | ✅ |
| 5 | 浏览器半 bundle 经真实 boot 图 URL 下发（200，含模块 id/槽位/configForms） | ✅ |

## 故障排查

| 现象 | 原因与处理 |
| --- | --- |
| 升级 DSH 后开关消失 | DSH 升级/重装 profile 会清空 profile `node_modules`，插件包被移除而 `dsh.profile.bundles` 仍引用它。重新执行 `dsh plugin --profile web add dsh-ui-design-toggle`（源码安装则用 `add <本仓库路径>`）即可。`dsh --profile web --dump-config` 中出现 `skipping profile bundle "dsh-ui-design-toggle"` 即为此情况 |
| 插件市场里搜不到本插件 | 市场只展示收录在 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 精选列表里的插件。未收录时请改用上面的方式二/三/四，或到该列表提收录 PR |
| `npm error 404`（方式二失败） | npm 上还没有这个包。先按方式五从源码安装，或在仓库里执行一次 `npm publish --access public` |
| 启动报 `EADDRINUSE` | 旧 web 进程未退出（DSH 的 app 运行在子进程，需按进程树结束）：`netstat -ano \| findstr :<port>` 找到 PID 后 `taskkill /PID <pid> /T /F` |
| 开关不显示 | 确认 profile 为 `web`（需要 `slots`、`configForms` 服务），并重启 web 服务 |
| `npm i -g pnpm` 报权限错误（Windows） | 用 `corepack enable pnpm` 代替，或以管理员身份打开 PowerShell 再安装 |

## 许可证

本项目使用 **MIT** 许可证（见 [LICENSE](LICENSE)）。

选择理由：插件代码量小、希望被广泛复用与二创；MIT 的约束最少、兼容性最好（可与任何 DSH 生态插件/工具链组合，也方便被下游项目直接内联）。

## 贡献方式

欢迎提交 Issue / PR，请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。核心原则：

- 遵循「修复优先 → 可复现 → 最小改动 → 版本明确」；
- 提交前必须在本机当前 DSH 版本中跑通 `npm test` 与 `dsh --profile web --dump-config`；
- 破坏性变更需在 CHANGELOG 中明确标注。
