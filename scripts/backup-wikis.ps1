<#
.SYNOPSIS
    Backs up every research wiki under the wiki root to a Drive-synced folder
    and writes a per-file SHA-256 manifest so loss/corruption is detectable.

.DESCRIPTION
    Implements the "Knowledge-base safety (HARD RULE)" in CLAUDE.md. Markdown
    is the source of truth; this produces a ZIP snapshot per wiki plus a
    manifest.json catalog (per-file SHA-256). JSON is only the backup manifest,
    never the content store.

    Run after any session that creates or materially edits a wiki. The script
    exits 0 ONLY if at least one wiki was snapshotted and every produced ZIP was
    verified present and non-empty; otherwise it exits non-zero so the caller
    can confirm success before considering the task done.

.PARAMETER WikiRoot
    Folder containing one subfolder per wiki (the <slug> dirs).
    Default: ~/dair-wikis

.PARAMETER BackupDir
    Drive-synced destination for ZIP snapshots and manifest.json.
    Default: ~/My Drive/dair-wikis-backups

.EXAMPLE
    pwsh ./scripts/backup-wikis.ps1

.EXAMPLE
    pwsh ./scripts/backup-wikis.ps1 -WikiRoot 'D:\wikis' -BackupDir 'E:\backups'
#>
[CmdletBinding()]
param(
    [string]$WikiRoot  = (Join-Path $HOME 'dair-wikis'),
    [string]$BackupDir = (Join-Path $HOME 'My Drive\dair-wikis-backups')
)

$ErrorActionPreference = 'Stop'

function Fail([string]$msg) {
    Write-Error $msg
    exit 1
}

if (-not (Test-Path -LiteralPath $WikiRoot)) {
    Fail "Wiki root not found: $WikiRoot. Nothing backed up. (Create wikis under this path, or pass -WikiRoot.)"
}

$wikiDirs = @(Get-ChildItem -LiteralPath $WikiRoot -Directory -ErrorAction SilentlyContinue)
if ($wikiDirs.Count -eq 0) {
    Fail "No wiki folders found under $WikiRoot. Nothing to back up."
}

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

$stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$nowUtc = (Get-Date).ToUniversalTime().ToString('o')

$manifest = [ordered]@{
    generatedUtc = $nowUtc
    stamp        = $stamp
    wikiRoot     = $WikiRoot
    backupDir    = $BackupDir
    wikis        = @()
}

$errors = @()

foreach ($dir in $wikiDirs) {
    $slug = $dir.Name
    Write-Output "Backing up wiki: $slug"

    $files = @(Get-ChildItem -LiteralPath $dir.FullName -File -Recurse -ErrorAction SilentlyContinue)
    if ($files.Count -eq 0) {
        Write-Warning "  '$slug' has no files; skipping."
        $errors += "empty:$slug"
        continue
    }

    # Per-file SHA-256 catalog (relative paths, forward slashes for portability).
    $rootLen = $dir.FullName.TrimEnd('\').Length + 1
    $fileEntries = foreach ($f in $files) {
        $rel = $f.FullName.Substring($rootLen).Replace('\','/')
        [ordered]@{
            path   = $rel
            sha256 = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
            bytes  = $f.Length
        }
    }

    # ZIP snapshot into a per-slug subfolder.
    $slugBackupDir = Join-Path $BackupDir $slug
    New-Item -ItemType Directory -Path $slugBackupDir -Force | Out-Null
    $zipPath = Join-Path $slugBackupDir ("{0}_{1}.zip" -f $slug, $stamp)

    try {
        Compress-Archive -Path (Join-Path $dir.FullName '*') -DestinationPath $zipPath -Force
    } catch {
        Write-Warning "  ZIP failed for '$slug': $($_.Exception.Message)"
        $errors += "zipfail:$slug"
        continue
    }

    # Verify the ZIP exists and is non-empty.
    if (-not (Test-Path -LiteralPath $zipPath) -or (Get-Item -LiteralPath $zipPath).Length -eq 0) {
        Write-Warning "  ZIP missing or empty for '$slug'."
        $errors += "verifyfail:$slug"
        continue
    }

    $manifest.wikis += [ordered]@{
        slug      = $slug
        zip       = $zipPath
        zipSha256 = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
        zipBytes  = (Get-Item -LiteralPath $zipPath).Length
        fileCount = $files.Count
        files     = $fileEntries
    }

    Write-Output ("  OK: {0} files -> {1}" -f $files.Count, $zipPath)
}

# Write the manifest (latest snapshot) at the backup root.
$manifestPath = Join-Path $BackupDir 'manifest.json'
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

$ok = $manifest.wikis.Count
Write-Output ""
Write-Output ("Snapshotted {0} wiki(s). Manifest: {1}" -f $ok, $manifestPath)

if ($ok -eq 0) {
    Fail "Backup produced no snapshots. Errors: $($errors -join ', ')"
}
if ($errors.Count -gt 0) {
    Write-Warning "Completed with issues: $($errors -join ', ')"
    exit 2
}

Write-Output "Backup verified successfully."
exit 0
