# Use single quotes for all strings to prevent variable expansion
$targetFile = Get-ChildItem -Path 'd:\*\public\js\dispatcher.js' | Select-Object -First 1
if (-not $targetFile) {
    Write-Error 'Could not find dispatcher.js'
    exit 1
}

$path = $targetFile.FullName
$content = [System.IO.File]::ReadAllText($path)

# Correct the mis-escaped template literals
# Use $String.Replace() which is literal
$content = $content.Replace('? \`', '? `')
$content = $content.Replace('\` :', '` :')
$content = $content.Replace('\${', '${')

[System.IO.File]::WriteAllText($path, $content)
Write-Host "Successfully cleaned up template literals in $path"
