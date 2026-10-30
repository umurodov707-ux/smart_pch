
$baseDir = Join-Path (Get-Location) "dispetcher"
$outDir = Join-Path (Get-Location) "dispetcher_txt"
$tempDir = Join-Path (Get-Location) "temp_extract"

if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir }

$files = Get-ChildItem "$baseDir\*.docx"
foreach ($file in $files) {
    try {
        if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
        New-Item -ItemType Directory -Path $tempDir
        
        $zipPath = Join-Path $tempDir "temp.zip"
        Copy-Item $file.FullName $zipPath
        
        Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
        
        $xmlPath = Join-Path $tempDir "word\document.xml"
        if (Test-Path $xmlPath) {
            $xml = Get-Content -Path $xmlPath -Raw -Encoding utf8
            
            # Simple regex to strip XML tags and keep some structure
            $text = $xml -replace '<w:p\s*[^>]*>', "`r`n"
            $text = $text -replace '<[^>]+>', " "
            $text = $text.Replace("&quot;", '"').Replace("&amp;", "&").Replace("&lt;", "<").Replace("&gt;", ">").Replace("&nbsp;", " ")
            
            $outPath = Join-Path $outDir ($file.BaseName + ".txt")
            $text | Out-File -FilePath $outPath -Encoding utf8
            Write-Host "Extracted: $($file.Name)"
        }
    }
    catch {
        Write-Host "Failed $($file.Name): $($_.Exception.Message)"
    }
}
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
