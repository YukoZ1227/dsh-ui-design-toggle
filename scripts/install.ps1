#Requires -Version 5.1
<#
  dsh-ui-design-toggle 一键安装（Windows PowerShell 5.1+）

  用法（推荐先下载看一遍再运行）：
      irm https://raw.githubusercontent.com/YukoZ1227/dsh-ui-design-toggle/main/scripts/install.ps1 -OutFile install.ps1
      powershell -ExecutionPolicy Bypass -File install.ps1

  可选参数：
      -DshProfile web     要装进哪个 dsh profile（默认 web，也可用环境变量 DSH_PROFILE）
      -ReleaseTag v0.2.1  指定 release tag（默认取 latest）
      -FromSource         不走 release，直接 dsh plugin add github:YukoZ1227/dsh-ui-design-toggle
      -DryRun             只检查环境并打印将执行的命令

  注意：参数名不用 -Profile，是为了避免覆盖 PowerShell 自带的自动变量 $PROFILE。
  本文件带 UTF-8 BOM：Windows PowerShell 5.1 在没有 BOM 时会按系统 ANSI 代码页读取，
  中文会变乱码并导致解析失败。
#>
[CmdletBinding()]
param(
    [string]$DshProfile = $(if ($env:DSH_PROFILE) { $env:DSH_PROFILE } else { 'web' }),
    [string]$ReleaseTag = '',
    [switch]$FromSource,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$Repo = 'YukoZ1227/dsh-ui-design-toggle'
$Package = 'dsh-ui-design-toggle'

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "OK  $msg" -ForegroundColor Green }
function Fail($msg) {
    Write-Host "ERR $msg" -ForegroundColor Red
    exit 1
}

# 1. 环境检查
Write-Step '检查 dsh 与 pnpm'

if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) {
    Fail '找不到 dsh。先安装 DeepSeek Harness：npm i -g @deepseek-ai/dsh'
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Fail '找不到 pnpm。先运行：npm i -g pnpm（或 corepack enable pnpm）'
}

$dshVersion = (& dsh --version 2>$null | Out-String).Trim()
Write-Ok "dsh $dshVersion · pnpm $(& pnpm -v) · profile $DshProfile"

# 2. 决定安装来源
$target = $null
$tmpFile = $null

if ($FromSource) {
    $target = "github:$Repo"
    Write-Ok "安装来源：GitHub 源码 $target"
}
else {
    $headers = @{ 'User-Agent' = 'dsh-ui-design-toggle-installer' }
    $releaseUrl = if ($ReleaseTag) {
        "https://api.github.com/repos/$Repo/releases/tags/$ReleaseTag"
    } else {
        "https://api.github.com/repos/$Repo/releases/latest"
    }

    try {
        Write-Step '查询 release 产物'
        $release = Invoke-RestMethod -Uri $releaseUrl -Headers $headers -TimeoutSec 20
        $asset = @($release.assets) | Where-Object { $_.name -like '*.tgz' } | Select-Object -First 1

        if ($asset) {
            $tmpFile = Join-Path $env:TEMP ("$Package-" + [guid]::NewGuid().ToString('N') + '.tgz')
            Write-Step "下载 $($asset.name)"
            Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $tmpFile -UseBasicParsing -TimeoutSec 180
            $target = $tmpFile
            Write-Ok "已下载到 $tmpFile"
        }
        else {
            Write-Host 'WARN 该 release 没有 .tgz 产物，回退到源码安装' -ForegroundColor Yellow
            $target = "github:$Repo"
        }
    }
    catch {
        Write-Host "WARN 查询 release 失败（$($_.Exception.Message)），回退到源码安装" -ForegroundColor Yellow
        $target = "github:$Repo"
    }
}

# 3. 安装
$dshArgs = @('plugin', '--profile', $DshProfile, 'add', $target)
Write-Step ("执行：dsh " + ($dshArgs -join ' '))
if ($DryRun) {
    Write-Ok 'DryRun：未实际执行'
    exit 0
}

& dsh @dshArgs
if ($LASTEXITCODE -ne 0) { Fail "dsh plugin add 失败（exit $LASTEXITCODE）" }

# 4. 校验
Write-Step '校验 profile 配置'

$dump = (& dsh --profile $DshProfile --dump-config 2>&1 | Out-String)
if ($dump -match 'ui-design-toggle') {
    Write-Ok '配置里已出现 ui-design-toggle 条目'
}
else {
    Fail "配置里没有 ui-design-toggle。请手动检查：dsh --profile $DshProfile --dump-config"
}

if ($dump -match 'skipping profile bundle') {
    Write-Host "WARN 存在被跳过的 bundle，执行 dsh --profile $DshProfile --dump-config 查看详情" -ForegroundColor Yellow
}

# 清理临时 tarball
if ($tmpFile -and (Test-Path $tmpFile)) {
    Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Ok '安装完成。重启 dsh web（或刷新页面）后，侧边栏底部出现「UI 设计技能」开关。'
