[CmdletBinding()]
param(
  [switch]$Apply,
  [string]$BackupIndex = "C:\Users\domim\Desktop\sultanshadi-media-source-backup\20260713-003648\media-source-index.json"
)

$ErrorActionPreference = "Stop"
$Repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path.TrimEnd("\")
$LogPath = Join-Path $Repo "docs\video-optimization-log.json"

# This is the reviewed production input list. Files not listed here are never
# transformed by this script and remain subject to the editorial removal pass.
$ReviewedInputUris = @(
  "public/portfolio/digital/%D8%B9%D9%84%D8%A7%D8%AC%20%D8%A7%D9%84%D8%B9%D8%B5%D8%A8.mp4",
  "public/portfolio/digital/%D9%81%D9%8A%D8%AF%D9%8A%D9%88%20%D8%A7%D9%84%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9.mp4",
  "public/portfolio/Dr. Mohannad Alharbi/Copy of snab 7.mp4",
  "public/portfolio/HAMC/%D9%85%D8%AC%D9%85%D8%B9%20%D8%A7%D8%AE%D9%8A%D8%B1.mp4",
  "public/portfolio/Harmony/vid/%D9%85%D9%86%20%D8%BA%D9%8A%D8%B1%20%D8%AF%D9%81%D8%B9%D8%A9%20%D8%A7%D9%88%D9%84%D9%89.mp4",
  "public/portfolio/ibtsm/vid/%D8%AA%D9%82%D9%88%D9%8A%D9%85%20%D8%A7%D9%84%D8%A7%D8%B3%D9%86%D8%A7%D9%86(2).mp4",
  "public/portfolio/ibtsm/vid/%D9%85%D8%AC%D9%85%D8%B9%20%D8%AF%D9%83%D8%A7%D8%AA%D8%B1%D9%87%20%D8%A7%D8%A8%D8%AA%D8%B3%D9%85(2).mp4",
  "public/portfolio/Padel Me Club/Reel/Copy of Coach_Manoo_V02.mp4",
  "public/portfolio/Padel Me Club/Reel/Copy of copy_782345FE-9417-49AE-9EA1-AB5201D27643.mp4",
  "public/portfolio/Padel Me Club/Reel/Copy of PadelMe-DAY1.mp4",
  "public/portfolio/SKN%20Clinics/Skn2-%D9%85%D9%88%D8%B1%D9%81%D9%8A%D8%B3.mp4",
  "public/portfolio/SKN%20Clinics/%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%201skn%20-%20%D8%B9%D8%A7%D9%85%20.mp4",
  "public/portfolio/SKN%20Clinics/%D9%81%D9%8A%D8%AF%D9%8A%D9%88%20%D8%A8%D8%B1%D9%88%D9%85%D9%88%20%D9%84%D9%84%D9%82%D8%A7%D8%A1%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%AE%D8%A7%D9%86%20%D9%88%D9%86%D8%B3%D9%85%D8%A9.mp4"
)
$ReviewedInputs = @($ReviewedInputUris | ForEach-Object { [Uri]::UnescapeDataString($_) })

function Normalize-Path([string]$Value) {
  return $Value.Replace("\", "/")
}

function Get-FrameRate([string]$Ratio) {
  if (-not $Ratio) { return 0.0 }
  $parts = $Ratio.Split("/")
  if ($parts.Count -eq 2 -and [double]$parts[1] -ne 0) {
    return [double]$parts[0] / [double]$parts[1]
  }
  return [double]$Ratio
}

function Get-Probe([string]$File) {
  $raw = & ffprobe -v error -show_entries "format=duration,bit_rate,size:stream=codec_type,codec_name,pix_fmt,width,height,avg_frame_rate,channels,channel_layout,sample_rate" -of json -- $File
  if ($LASTEXITCODE -ne 0) { throw "ffprobe failed: $File" }
  $probe = ($raw -join "`n") | ConvertFrom-Json
  $video = @($probe.streams | Where-Object { $_.codec_type -eq "video" }) | Select-Object -First 1
  $audio = @($probe.streams | Where-Object { $_.codec_type -eq "audio" }) | Select-Object -First 1
  if (-not $video) { throw "No video stream: $File" }
  return [pscustomobject][ordered]@{
    codec = [string]$video.codec_name
    pixelFormat = [string]$video.pix_fmt
    width = [int]$video.width
    height = [int]$video.height
    frameRate = [string]$video.avg_frame_rate
    frameRateValue = Get-FrameRate ([string]$video.avg_frame_rate)
    durationSeconds = [double]$probe.format.duration
    bitRate = [int64]$probe.format.bit_rate
    sizeBytes = [int64](Get-Item -LiteralPath $File).Length
    audioCodec = if ($audio) { [string]$audio.codec_name } else { $null }
    audioChannels = if ($audio) { [int]$audio.channels } else { 0 }
    audioLayout = if ($audio) { [string]$audio.channel_layout } else { $null }
  }
}

function Assert-Backup([string]$RelativePath, $IndexByPath) {
  if (-not $IndexByPath.ContainsKey($RelativePath)) {
    throw "External backup index has no entry for $RelativePath"
  }
  $entry = $IndexByPath[$RelativePath]
  if (-not (Test-Path -LiteralPath $entry.backupPath -PathType Leaf)) {
    throw "External backup file is missing: $($entry.backupPath)"
  }
  $backupHash = (Get-FileHash -LiteralPath $entry.backupPath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($backupHash -ne [string]$entry.sha256) {
    throw "External backup hash mismatch: $RelativePath"
  }
  return $entry
}

function New-Poster([string]$VideoPath, [string]$PosterPath) {
  $temporaryPng = "$PosterPath.codex-frame-tmp.png"
  $temporaryWebp = "$PosterPath.codex-poster-tmp"
  foreach ($candidate in @($temporaryPng, $temporaryWebp)) {
    if (Test-Path -LiteralPath $candidate) { throw "Temporary file already exists: $candidate" }
  }
  try {
    & ffmpeg -v error -y -ss 1 -i $VideoPath -frames:v 1 -f image2 $temporaryPng
    if ($LASTEXITCODE -ne 0) { throw "Poster frame extraction failed: $VideoPath" }
    & node -e "require('sharp')(process.argv[1]).rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:82,effort:5}).toFile(process.argv[2]).catch(e=>{console.error(e);process.exit(1)})" $temporaryPng $temporaryWebp
    if ($LASTEXITCODE -ne 0) { throw "Poster WebP encoding failed: $VideoPath" }
    & node -e "require('sharp')(process.argv[1]).metadata().then(m=>{if(!m.width||!m.height)process.exit(2)}).catch(()=>process.exit(3))" $temporaryWebp
    if ($LASTEXITCODE -ne 0) { throw "Poster WebP verification failed: $VideoPath" }
    Move-Item -LiteralPath $temporaryWebp -Destination $PosterPath -Force
  } finally {
    if (Test-Path -LiteralPath $temporaryPng) { Remove-Item -LiteralPath $temporaryPng -Force }
    if (Test-Path -LiteralPath $temporaryWebp) { Remove-Item -LiteralPath $temporaryWebp -Force }
  }
}

if (-not (Test-Path -LiteralPath $BackupIndex -PathType Leaf)) {
  throw "Backup index not found: $BackupIndex"
}
$BackupEntries = Get-Content -Raw -Encoding UTF8 -LiteralPath $BackupIndex | ConvertFrom-Json
$IndexByPath = @{}
foreach ($entry in $BackupEntries) { $IndexByPath[[string]$entry.repositorySourcePath] = $entry }

$Results = [System.Collections.Generic.List[object]]::new()
Write-Output ("Video optimization mode: " + $(if ($Apply) { "apply" } else { "dry-run" }))

foreach ($relative in $ReviewedInputs) {
  $absolute = Join-Path $Repo ($relative.Replace("/", "\"))
  if (-not (Test-Path -LiteralPath $absolute -PathType Leaf)) { throw "Reviewed input is missing: $relative" }
  $backupEntry = Assert-Backup $relative $IndexByPath
  $before = Get-Probe $absolute
  if ($before.audioChannels -lt 1) { throw "Reviewed meaningful video unexpectedly has no audio: $relative" }

  $portrait = $before.height -gt $before.width
  $maxWidth = if ($portrait) { 1080 } else { 1920 }
  $maxHeight = if ($portrait) { 1920 } else { 1080 }
  $targetWidth = [Math]::Min($before.width, $maxWidth)
  $targetHeight = [Math]::Min($before.height, $maxHeight)
  if (($targetWidth % 2) -ne 0) { $targetWidth-- }
  if (($targetHeight % 2) -ne 0) { $targetHeight-- }
  $filter = "scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease:force_divisible_by=2"
  if ($before.frameRateValue -gt 30.001) { $filter += ",fps=30" }
  $extension = [System.IO.Path]::GetExtension($relative)
  $posterRelative = $relative.Substring(0, $relative.Length - $extension.Length) + ".poster.webp"
  $posterAbsolute = Join-Path $Repo ($posterRelative.Replace("/", "\"))

  if (-not $Apply) {
    Write-Output ("WOULD_OPTIMIZE {0}: {1:N2} MB, {2}x{3}, {4:N2}s, audio {5}/{6}ch" -f $relative, ($before.sizeBytes / 1MB), $before.width, $before.height, $before.durationSeconds, $before.audioCodec, $before.audioChannels)
    $Results.Add([pscustomobject][ordered]@{ path = $relative; poster = $posterRelative; action = "dry-run"; before = $before })
    continue
  }

  $sourceHash = (Get-FileHash -LiteralPath $absolute -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($sourceHash -ne [string]$backupEntry.sha256) {
    throw "Current source no longer matches the verified external original: $relative"
  }
  $temporary = "$absolute.codex-video-tmp.mp4"
  $originalTemporary = "$absolute.codex-original-tmp"
  foreach ($candidate in @($temporary, $originalTemporary)) {
    if (Test-Path -LiteralPath $candidate) { throw "Temporary file already exists: $candidate" }
  }

  & ffmpeg -v error -y -i $absolute -map "0:v:0" -map "0:a:0?" -vf $filter -c:v libx264 -preset medium -crf 27 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart $temporary
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg encode failed: $relative" }
  $candidateProbe = Get-Probe $temporary
  if ($candidateProbe.codec -ne "h264" -or $candidateProbe.pixelFormat -ne "yuv420p") { throw "Output codec verification failed: $relative" }
  if ($candidateProbe.width -gt $maxWidth -or $candidateProbe.height -gt $maxHeight) { throw "Output dimensions exceed reviewed maximum: $relative" }
  if ($candidateProbe.frameRateValue -gt 30.001) { throw "Output frame rate exceeds 30 fps: $relative" }
  if ([Math]::Abs($candidateProbe.durationSeconds - $before.durationSeconds) -gt 0.5) { throw "Output duration differs by more than 0.5 seconds: $relative" }
  if ($candidateProbe.audioCodec -ne "aac" -or $candidateProbe.audioChannels -ne $before.audioChannels) { throw "Output audio verification failed: $relative" }

  $action = "optimized"
  if ($candidateProbe.sizeBytes -ge $before.sizeBytes) {
    Remove-Item -LiteralPath $temporary -Force
    $action = "kept-smaller-original"
  } else {
    Move-Item -LiteralPath $absolute -Destination $originalTemporary
    try {
      Move-Item -LiteralPath $temporary -Destination $absolute
      $afterMove = Get-Probe $absolute
      if ($afterMove.codec -ne "h264" -or $afterMove.pixelFormat -ne "yuv420p") { throw "Replacement verification failed: $relative" }
      Remove-Item -LiteralPath $originalTemporary -Force
    } catch {
      if (Test-Path -LiteralPath $absolute) { Remove-Item -LiteralPath $absolute -Force }
      Move-Item -LiteralPath $originalTemporary -Destination $absolute
      if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
      throw
    }
  }

  New-Poster $absolute $posterAbsolute
  $after = Get-Probe $absolute
  Write-Output ("OPTIMIZED {0}: {1:N2} MB -> {2:N2} MB; poster {3}" -f $relative, ($before.sizeBytes / 1MB), ($after.sizeBytes / 1MB), $posterRelative)
  $Results.Add([pscustomobject][ordered]@{
    path = $relative
    poster = $posterRelative
    action = $action
    backupPath = [string]$backupEntry.backupPath
    backupSha256 = [string]$backupEntry.sha256
    before = $before
    after = $after
  })
}

if ($Apply) {
  $payload = [pscustomobject][ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    settings = [pscustomobject][ordered]@{ codec = "H.264"; pixelFormat = "yuv420p"; crf = 27; audio = "AAC 128k"; faststart = $true; maximumFps = 30 }
    transformations = $Results
  }
  $json = $payload | ConvertTo-Json -Depth 10
  [System.IO.File]::WriteAllText($LogPath, $json, [System.Text.UTF8Encoding]::new($false))
  Write-Output "Transformation log: $LogPath"
} else {
  Write-Output "No files were modified. Re-run with -Apply after reviewing this list."
}
