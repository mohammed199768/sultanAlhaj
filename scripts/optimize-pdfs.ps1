[CmdletBinding()]
param(
  [switch]$Apply,
  [string]$BackupIndex = "C:\Users\domim\Desktop\sultanshadi-media-source-backup\20260713-003648\media-source-index.json"
)

$ErrorActionPreference = "Stop"
$Repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path.TrimEnd("\")
$LogPath = Join-Path $Repo "docs\pdf-optimization-log.json"

# Source paths are URL encoded so Windows PowerShell 5 can parse this script
# without relying on its legacy source-file encoding behavior.
$Reviewed = @(
  @{ Source = "public/Sultan%20Shadi%20CV.pdf"; Action = "retain-required"; Pages = @(); Prefix = $null },
  @{ Source = "public/portfolio/branding/Final.pdf"; Action = "selected-previews"; Pages = @(2, 9, 12); Prefix = "public/portfolio/branding/previews/anco" },
  @{ Source = "public/portfolio/branding/arak%20Profile.pdf"; Action = "selected-previews"; Pages = @(1, 5, 9, 12); Prefix = "public/portfolio/branding/previews/arak" },
  @{ Source = "public/portfolio/branding/Final%20WTL.pdf"; Action = "selected-previews"; Pages = @(1, 4, 23); Prefix = "public/portfolio/branding/previews/wtl-tech" },
  @{ Source = "public/portfolio/branding/cataloge.pdf"; Action = "selected-previews"; Pages = @(1, 5, 10); Prefix = "public/portfolio/branding/previews/catalogue" },
  @{ Source = "public/portfolio/branding/X.pdf"; Action = "selected-previews"; Pages = @(1, 2, 3); Prefix = "public/portfolio/branding/previews/x-identity" },
  @{ Source = "public/portfolio/branding/%D8%A7%D9%84%D9%82%D8%B1%D9%88%D9%8A%D9%8A%D9%8A%D9%86.pdf"; Action = "selected-previews"; Pages = @(1, 2, 3); Prefix = "public/portfolio/branding/previews/alqrawiyeen" },
  @{ Source = "public/portfolio/branding/%D8%AA%D8%B3%D8%A7%D9%87%D9%8A%D9%84%20%D8%A7%D9%84%D8%A7%D8%B9%D9%85%D8%A7%D9%84.pdf"; Action = "selected-previews"; Pages = @(1, 2, 3); Prefix = "public/portfolio/branding/previews/tasaheel" },
  @{ Source = "public/portfolio/Padel%20Me%20Club/Static/Padel%20Me%20CC.pdf"; Action = "selected-previews"; Pages = @(1, 2, 6, 8); Prefix = "public/portfolio/Padel Me Club/Static/previews/padel-content" }
)

function Decode-Path([string]$Value) { return [Uri]::UnescapeDataString($Value) }

function Get-PageCount([string]$File) {
  $escaped = $File.Replace("\", "/").Replace("(", "\(").Replace(")", "\)")
  $result = & gswin64c -q -dNODISPLAY -dNOSAFER -c "($escaped) (r) file runpdfbegin pdfpagecount = quit"
  if ($LASTEXITCODE -ne 0 -or -not $result) { throw "Ghostscript page-count verification failed: $File" }
  return [int]$result
}

function Assert-PdfOpens([string]$File) {
  & gswin64c -q -dBATCH -dNOPAUSE -dSAFER -sDEVICE=nullpage -- $File
  if ($LASTEXITCODE -ne 0) { throw "Ghostscript could not open every page: $File" }
}

function Assert-Backup([string]$RelativePath, $IndexByPath) {
  if (-not $IndexByPath.ContainsKey($RelativePath)) { throw "External backup index has no entry for $RelativePath" }
  $entry = $IndexByPath[$RelativePath]
  if (-not (Test-Path -LiteralPath $entry.backupPath -PathType Leaf)) { throw "External backup is missing: $($entry.backupPath)" }
  $hash = (Get-FileHash -LiteralPath $entry.backupPath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($hash -ne [string]$entry.sha256) { throw "External backup hash mismatch: $RelativePath" }
  return $entry
}

function Compress-RequiredPdf([string]$Source, [string]$Relative, [int]$OriginalPages) {
  $temporary = "$Source.codex-pdf-tmp.pdf"
  $originalTemporary = "$Source.codex-original-tmp"
  foreach ($candidate in @($temporary, $originalTemporary)) { if (Test-Path -LiteralPath $candidate) { throw "Temporary file already exists: $candidate" } }
  & gswin64c -q -dBATCH -dNOPAUSE -dSAFER -sDEVICE=pdfwrite -dCompatibilityLevel=1.6 -dPDFSETTINGS=/ebook -dDetectDuplicateImages=true -dCompressFonts=true "-sOutputFile=$temporary" -- $Source
  if ($LASTEXITCODE -ne 0) { throw "Ghostscript PDF compression failed: $Relative" }
  Assert-PdfOpens $temporary
  if ((Get-PageCount $temporary) -ne $OriginalPages) { throw "Compressed PDF page count changed: $Relative" }
  $beforeSize = (Get-Item -LiteralPath $Source).Length
  $afterSize = (Get-Item -LiteralPath $temporary).Length
  if ($afterSize -ge $beforeSize) { Remove-Item -LiteralPath $temporary -Force; return "kept-smaller-original" }
  Move-Item -LiteralPath $Source -Destination $originalTemporary
  try {
    Move-Item -LiteralPath $temporary -Destination $Source
    Assert-PdfOpens $Source
    if ((Get-PageCount $Source) -ne $OriginalPages) { throw "Replacement PDF page count changed: $Relative" }
    Remove-Item -LiteralPath $originalTemporary -Force
    return "compressed"
  } catch {
    if (Test-Path -LiteralPath $Source) { Remove-Item -LiteralPath $Source -Force }
    Move-Item -LiteralPath $originalTemporary -Destination $Source
    if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
    throw
  }
}

if (-not (Test-Path -LiteralPath $BackupIndex -PathType Leaf)) { throw "Backup index not found: $BackupIndex" }
$Entries = Get-Content -Raw -Encoding UTF8 -LiteralPath $BackupIndex | ConvertFrom-Json
$IndexByPath = @{}
foreach ($entry in $Entries) { $IndexByPath[[string]$entry.repositorySourcePath] = $entry }
$Results = [System.Collections.Generic.List[object]]::new()

Write-Output ("PDF optimization mode: " + $(if ($Apply) { "apply" } else { "dry-run" }))
foreach ($item in $Reviewed) {
  $relative = Decode-Path ([string]$item.Source)
  $source = Join-Path $Repo ($relative.Replace("/", "\"))
  if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Reviewed PDF is missing: $relative" }
  $backup = Assert-Backup $relative $IndexByPath
  $pageCount = Get-PageCount $source
  Assert-PdfOpens $source
  $beforeSize = [int64](Get-Item -LiteralPath $source).Length
  foreach ($page in @($item.Pages)) { if ($page -lt 1 -or $page -gt $pageCount) { throw "Selected page $page is outside $relative ($pageCount pages)" } }

  if (-not $Apply) {
    Write-Output ("WOULD_{0} {1}: {2} pages, {3:N2} MB, selected pages [{4}]" -f ([string]$item.Action).ToUpperInvariant(), $relative, $pageCount, ($beforeSize / 1MB), (@($item.Pages) -join ", "))
    $Results.Add([pscustomobject][ordered]@{ path = $relative; action = [string]$item.Action; pageCount = $pageCount; beforeSizeBytes = $beforeSize })
    continue
  }

  $sourceHash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($sourceHash -ne [string]$backup.sha256) { throw "Current PDF no longer matches the verified external source: $relative" }

  if ($item.Action -eq "retain-required") {
    $Results.Add([pscustomobject][ordered]@{ path = $relative; action = "retained-required-download"; pageCount = $pageCount; beforeSizeBytes = $beforeSize; afterSizeBytes = $beforeSize; backupPath = [string]$backup.backupPath; backupSha256 = [string]$backup.sha256 })
    Write-Output ("RETAINED {0}: verified {1} pages, {2:N2} MB" -f $relative, $pageCount, ($beforeSize / 1MB))
    continue
  }

  if ($item.Action -eq "compress-required") {
    $action = Compress-RequiredPdf $source $relative $pageCount
    $afterSize = [int64](Get-Item -LiteralPath $source).Length
    $Results.Add([pscustomobject][ordered]@{ path = $relative; action = $action; pageCount = $pageCount; beforeSizeBytes = $beforeSize; afterSizeBytes = $afterSize; backupPath = [string]$backup.backupPath; backupSha256 = [string]$backup.sha256 })
    continue
  }

  $prefixRelative = [string]$item.Prefix
  $prefixAbsolute = Join-Path $Repo ($prefixRelative.Replace("/", "\"))
  $outputDirectory = Split-Path -Parent $prefixAbsolute
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
  $created = [System.Collections.Generic.List[string]]::new()
  $temporaryFiles = [System.Collections.Generic.List[string]]::new()
  try {
    foreach ($page in @($item.Pages)) {
      $output = ("{0}-{1:D2}.webp" -f $prefixAbsolute, [int]$page)
      $temporaryPng = "$output.codex-page-tmp.png"
      $temporaryWebp = "$output.codex-webp-tmp"
      foreach ($candidate in @($temporaryPng, $temporaryWebp, $output)) { if (Test-Path -LiteralPath $candidate) { throw "Refusing to overwrite existing preview or temporary file: $candidate" } }
      $temporaryFiles.Add($temporaryPng); $temporaryFiles.Add($temporaryWebp)
      & gswin64c -q -dBATCH -dNOPAUSE -dSAFER -sDEVICE=png16m -r180 -dTextAlphaBits=4 -dGraphicsAlphaBits=4 "-dFirstPage=$page" "-dLastPage=$page" "-sOutputFile=$temporaryPng" -- $source
      if ($LASTEXITCODE -ne 0) { throw "Ghostscript page render failed: $relative page $page" }
      & node -e "require('sharp')(process.argv[1]).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:86,effort:6}).toFile(process.argv[2]).catch(e=>{console.error(e);process.exit(1)})" $temporaryPng $temporaryWebp
      if ($LASTEXITCODE -ne 0) { throw "WebP encoding failed: $relative page $page" }
      & node -e "require('sharp')(process.argv[1]).metadata().then(m=>{if(!m.width||!m.height||m.format!=='webp')process.exit(2)}).catch(()=>process.exit(3))" $temporaryWebp
      if ($LASTEXITCODE -ne 0) { throw "WebP preview verification failed: $relative page $page" }
      Move-Item -LiteralPath $temporaryWebp -Destination $output
      $created.Add($output)
      Remove-Item -LiteralPath $temporaryPng -Force
    }
  } catch {
    foreach ($file in @($created) + @($temporaryFiles)) { if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file -Force } }
    throw
  }
  $previewBytes = [int64](($created | ForEach-Object { (Get-Item -LiteralPath $_).Length } | Measure-Object -Sum).Sum)
  if ($previewBytes -ge $beforeSize) { throw "Selected previews are not smaller than their source PDF: $relative" }
  $webPaths = @($created | ForEach-Object { $_.Substring($Repo.Length).TrimStart("\").Replace("\", "/") })
  Write-Output ("PREVIEWS {0}: {1:N2} MB -> {2:N2} MB across {3} selected pages" -f $relative, ($beforeSize / 1MB), ($previewBytes / 1MB), $created.Count)
  $Results.Add([pscustomobject][ordered]@{ path = $relative; action = "replaced-by-selected-previews"; pageCount = $pageCount; selectedPages = @($item.Pages); previewPaths = $webPaths; beforeSizeBytes = $beforeSize; afterSizeBytes = $previewBytes; backupPath = [string]$backup.backupPath; backupSha256 = [string]$backup.sha256 })
}

if ($Apply) {
  $payload = [pscustomobject][ordered]@{ generatedAt = (Get-Date).ToUniversalTime().ToString("o"); transformations = $Results }
  [System.IO.File]::WriteAllText($LogPath, ($payload | ConvertTo-Json -Depth 10), [System.Text.UTF8Encoding]::new($false))
  Write-Output "Transformation log: $LogPath"
} else {
  Write-Output "No files were modified. Re-run with -Apply after reviewing this list."
}
