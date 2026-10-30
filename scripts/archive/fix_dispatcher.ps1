# Find the file using a wildcard for the Cyrillic directory name
$targetFile = Get-ChildItem -Path "d:\*\public\js\dispatcher.js" | Select-Object -First 1
if (-not $targetFile) {
    Write-Error "Could not find dispatcher.js"
    exit 1
}

$path = $targetFile.FullName
$content = Get-Content $path
$newContent = New-Object System.Collections.Generic.List[string]

for ($i = 0; $i -lt $content.Count; $i++) {
    # Skip lines 1407-1410 (indices 1406-1409)
    if ($i -ge 1406 -and $i -le 1409) {
        continue
    }
    $line = $content[$i]
    $newContent.Add($line)
}

$newContent | Set-Content $path -Encoding UTF8
Write-Host "Successfully patched $path"
