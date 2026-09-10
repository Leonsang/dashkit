# fabkit installer for Windows.
#
#   irm https://raw.githubusercontent.com/ericksang/fabkit/main/install.ps1 | iex
#
# Environment:
#   FABKIT_VERSION  release tag to install (default: latest)
#   FABKIT_BIN_DIR  install directory (default: %LOCALAPPDATA%\fabkit\bin)
$ErrorActionPreference = 'Stop'

function Write-Step($message) { Write-Host "fabkit " -NoNewline -ForegroundColor Cyan; Write-Host $message }

$repo    = if ($env:FABKIT_REPO) { $env:FABKIT_REPO } else { 'ericksang/fabkit' }
$version = if ($env:FABKIT_VERSION) { $env:FABKIT_VERSION } else { 'latest' }
$binDir  = if ($env:FABKIT_BIN_DIR) { $env:FABKIT_BIN_DIR } else { Join-Path $env:LOCALAPPDATA 'fabkit\bin' }

$arch = switch ($env:PROCESSOR_ARCHITECTURE) {
    'AMD64' { 'amd64' }
    'ARM64' { 'arm64' }
    default { throw "unsupported architecture: $env:PROCESSOR_ARCHITECTURE" }
}

if ($version -eq 'latest') {
    Write-Step 'looking up the latest release'
    $release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"
    $version = $release.tag_name
    if (-not $version) { throw 'could not determine the latest release; set FABKIT_VERSION' }
}

$asset = "fabkit_$($version.TrimStart('v'))_windows_$arch.zip"
$url   = "https://github.com/$repo/releases/download/$version/$asset"
$tmp   = Join-Path ([System.IO.Path]::GetTempPath()) ("fabkit-" + [System.Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp | Out-Null

try {
    Write-Step "downloading $version for windows/$arch"
    $archive = Join-Path $tmp $asset
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing

    # Verify against the release checksums when they are published.
    try {
        $sums = Invoke-WebRequest -Uri "https://github.com/$repo/releases/download/$version/checksums.txt" -UseBasicParsing
        $expected = ($sums.Content -split "`n" | Where-Object { $_ -match [regex]::Escape($asset) } | Select-Object -First 1) -split '\s+' | Select-Object -First 1
        if ($expected) {
            $actual = (Get-FileHash -Algorithm SHA256 -Path $archive).Hash.ToLower()
            if ($expected.ToLower() -ne $actual) { throw "checksum mismatch for $asset" }
        }
    } catch [System.Net.WebException] {
        # No checksums published for this release; continue.
    }

    Expand-Archive -Path $archive -DestinationPath $tmp -Force
    New-Item -ItemType Directory -Path $binDir -Force | Out-Null
    Copy-Item -Path (Join-Path $tmp 'fabkit.exe') -Destination (Join-Path $binDir 'fabkit.exe') -Force

    Write-Step "installed to $binDir\fabkit.exe"

    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($userPath -notlike "*$binDir*") {
        [Environment]::SetEnvironmentVariable('Path', "$userPath;$binDir", 'User')
        Write-Step 'added it to your user PATH — open a new terminal to pick it up'
    }

    Write-Step "run 'fabkit' to start the wizard, or 'fabkit doctor' to check prerequisites"
}
finally {
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
