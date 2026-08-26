$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$files = @(
    (Join-Path $root 'runners/powershell/Run-ApifyActor.ps1')
) + @(
    Get-ChildItem -LiteralPath (Join-Path $root 'actors') -Recurse -Filter '*.ps1' | Select-Object -ExpandProperty FullName
)

foreach ($file in $files) {
    $parseErrors = $null
    [System.Management.Automation.Language.Parser]::ParseFile($file, [ref]$null, [ref]$parseErrors) | Out-Null
    if ($parseErrors.Count -gt 0) {
        $parseErrors | ForEach-Object { Write-Error "${file}: $($_.Message)" }
        throw "PowerShell parse failed: $file"
    }
}

Write-Output "PowerShell parse passed for $($files.Count) files."
