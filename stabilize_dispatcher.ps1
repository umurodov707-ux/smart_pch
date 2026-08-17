$targetFile = Get-ChildItem -Path "d:\*\public\js\dispatcher.js" | Select-Object -First 1
if (-not $targetFile) {
    Write-Error "Could not find dispatcher.js"
    exit 1
}

$path = $targetFile.FullName
$content = [System.IO.File]::ReadAllText($path)

# 1. Expose functions to global window object
$content = $content.Replace('async function initDispatcherData()', 'window.initDispatcherData = async function()')
$content = $content.Replace('function getDispatcherDashboardHTML()', 'window.getDispatcherDashboardHTML = function()')
$content = $content.Replace('function renderDispatcherListView()', 'window.renderDispatcherListView = function()')
$content = $content.Replace('function renderSubdivisionReportSendView(bolinmaId)', 'window.renderSubdivisionReportSendView = function(bolinmaId)')
$content = $content.Replace('function refreshReportingTables()', 'window.refreshReportingTables = function()')
$content = $content.Replace('async function refreshDispatcherData()', 'window.refreshDispatcherData = async function()')

# 2. Fix encoding artifacts
$content = $content.Replace('В°C', '°C')
$content = $content.Replace('VAQTД°', 'VAQTI')
$content = $content.Replace('LOKATSД°YA', 'LOKATSIYA')
$content = $content.Replace('Д°SH TURД°', 'ISH TURI')
$content = $content.Replace('Bekat вЂ” bekat', 'Bekat - bekat')

# 3. Save back as UTF8
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Successfully stabilized $path and exposed global functions."
