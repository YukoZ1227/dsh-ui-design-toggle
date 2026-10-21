# dsh-ui-design-toggle

![test](https://github.com/YukoZ1227/dsh-ui-design-toggle/actions/workflows/test.yml/badge.svg)

> A DeepSeek Harness plugin that adds a sidebar switch to enable or disable the
> `ui-ux-pro-max` UI/UX design skill at runtime.
>
> 中文说明见 [README.md](README.md)。

**Tested with** DSH `0.2.1-rc.2` · **Profile** `web`

---

## Quick start

```bash
# one command (requires dsh + pnpm on PATH)
dsh plugin --profile web add dsh-ui-design-toggle
```

Restart (or refresh) the Web GUI; the switch appears at the bottom of the sidebar.

Prefer no terminal? Open the Web GUI → account menu → **Settings → Plugin market**
and search for `dsh-ui-design-toggle`.

## Install

**Requirements** (all methods): DSH `0.2.1-rc.2` or newer · a `web` profile · `pnpm` on `PATH`.

```bash
dsh --version   # 0.2.1-rc.2 or newer
pnpm -v         # if missing: npm i -g pnpm
```

| Method | Best for | Terminal |
| --- | --- | --- |
| 1. Plugin market | no terminal at all | no |
| 2. npm | already using dsh | 1 command |
| 3. Release tarball | npm registry unavailable, or pinning a version | 1 command |
| 4. Install script | one-shot setup | 1 command |
| 5. From source | changing the code | 3 commands |

### 1. Plugin market

1. Web GUI → account menu → **Settings → Plugin market**
2. Search `dsh-ui-design-toggle` (category **UI Enhancements**)
3. Click **Install**, then refresh the page

### 2. npm

```bash
dsh plugin --profile web add dsh-ui-design-toggle
dsh --profile web --dump-config | grep -A2 ui-design-toggle
```

### 3. Release tarball

```bash
dsh plugin --profile web add https://github.com/YukoZ1227/dsh-ui-design-toggle/releases/download/v0.2.1/dsh-ui-design-toggle-0.2.1.tgz
```

### 4. Install script

```powershell
# Windows PowerShell 5.1+
irm https://raw.githubusercontent.com/YukoZ1227/dsh-ui-design-toggle/main/scripts/install.ps1 | iex
```

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/YukoZ1227/dsh-ui-design-toggle/main/scripts/install.sh | bash
```

### 5. From source

```bash
git clone https://github.com/YukoZ1227/dsh-ui-design-toggle.git
cd dsh-ui-design-toggle
dsh plugin --profile web add .
```

## What it does

- Renders a **UI design skill** switch in the `sidebar.footer.action` slot.
- Toggling takes effect immediately; the state persists across restarts.
- When off, the skill disappears from the `<available_skills>` catalog, the
  `skill` tool, and the `/ui-ux-pro-max` gesture (`snapshot()` / `list()` / `get()`).
- Both the gated skill name and the switch state are `volatile()` `Config` fields,
  editable from the profile settings document.
- Collapses to an icon button with a tooltip in the collapsed sidebar.
- No third-party runtime dependencies.

## Configuration

Written to the profile's `cordis.patch.yml` (or via the sidebar switch):

```yaml
- id: ui-design-toggle
  name: dsh-ui-design-toggle
  config:
    skill: ui-ux-pro-max   # skill to gate (default: ui-ux-pro-max)
    enabled: true          # switch state (default: true)
```

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `skill` | string | `ui-ux-pro-max` | kebab-case skill name to gate |
| `enabled` | boolean | `true` | `true` keeps the skill available |

## Development

```bash
node test/gate.test.mjs   # or: npm test
DSH_INSTALL=/path/to/@deepseek-ai/dsh npm test   # custom DSH install location
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full checklist.

## Compatibility

| DSH version | Status |
| --- | --- |
| `0.2.1-rc.2` | ✅ verified |
| `0.2.0` and older | ❌ removed settings API; use the 0.1.x line |

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Switch disappears after a DSH upgrade | The profile `node_modules` is recreated; reinstall with `dsh plugin --profile web add dsh-ui-design-toggle` |
| Not found in the plugin market | The market only lists plugins curated in awesome-dsh-plugin; use methods 2–4 meanwhile |
| `EADDRINUSE` on start | A stale `dsh web` process: find the PID and `taskkill /PID <pid> /T /F` |

## License

MIT — see [LICENSE](LICENSE).
