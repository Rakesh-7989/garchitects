$projectsFolder = "c:\Users\boyap\Downloads\garchitectsandinteriors-main\garchitectsandinteriors-main\content\projects"

Write-Host "Fixing image paths in project files..." -ForegroundColor Cyan

function ConvertTo-WebPath {
    param([string]$winPath)
    $result = $winPath.Trim()
    # Remove various Windows base path prefixes
    $prefixes = @(
        "C:\Users\boyap\Downloads\garchitectsandinteriors-main\garchitectsandinteriors-main\images\uploads\",
        "C:\Users\boyap\Downloads\garchitectsandinteriors-main\garchitectsandinteriors-main\images\uploads/",
        "garchitectsandinteriors-main\images\uploads\",
        "garchitectsandinteriors-main\images\uploads/"
    )
    foreach ($prefix in $prefixes) {
        if ($result.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            $result = $result.Substring($prefix.Length)
            break
        }
    }
    # Replace backslashes with forward slashes
    $result = $result -replace '\\', '/'
    # Remove leading slash if present to avoid double //
    $result = $result.TrimStart('/')
    return "/images/uploads/$result"
}

$files = Get-ChildItem -Path $projectsFolder -Filter "*.md"

foreach ($file in $files) {
    $lines = Get-Content -Path $file.FullName -Encoding UTF8
    $result = New-Object System.Collections.ArrayList
    $i = 0
    $changed = $false

    while ($i -lt $lines.Count) {
        $line = $lines[$i]

        # Check if this line contains a Windows path
        if ($line -match 'C:\\Users\\boyap\\|garchitectsandinteriors-main\\images\\uploads\\') {
            # Collect any continuation lines (indented lines that continue the path)
            $j = $i + 1
            while ($j -lt $lines.Count) {
                $nextLine = $lines[$j]
                # A continuation line is indented and doesn't look like a new YAML key
                if ($nextLine -match '^\s+\S' -and $nextLine -notmatch '^\s{0,6}(image|caption|cover_image|gallery|title|description|status|category|location|year|budget|featured|order|units|towers|site_area|total_sqft|unit_type|built_up_area|special_features|area|body|slug)\s*:' -and $nextLine -notmatch '^\s{0,4}-\s+image\s*:') {
                    $j++
                } else {
                    break
                }
            }

            # Join continuation lines with a space (YAML plain scalar continuation)
            $pathLines = @($lines[$i..($j-1)])
            $fullLine = $pathLines[0]
            for ($k = 1; $k -lt $pathLines.Count; $k++) {
                $fullLine = $fullLine + " " + $pathLines[$k].Trim()
            }

            # Extract the YAML key prefix and path value
            if ($fullLine -match '^(\s*(?:-\s+)?(?:image|cover_image)\s*:\s*)(.+)$') {
                $prefix = $Matches[1]
                $winPath = $Matches[2].Trim()
                $webPath = ConvertTo-WebPath -winPath $winPath
                $newLine = "${prefix}${webPath}"
                [void]$result.Add($newLine)
                $changed = $true
                Write-Host "  Fixed path: $($file.Name)" -ForegroundColor Green
            } else {
                [void]$result.Add($fullLine)
            }

            $i = $j
        } else {
            [void]$result.Add($line)
            $i++
        }
    }

    if ($changed) {
        $result | Set-Content -Path $file.FullName -Encoding UTF8 -NoNewline:$false
        Write-Host "Saved: $($file.Name)" -ForegroundColor Cyan
    }
}

# Update manifest.json with ALL project files
Write-Host "`nUpdating manifest.json..." -ForegroundColor Cyan
$allMdFiles = Get-ChildItem -Path $projectsFolder -Filter "*.md" | Select-Object -ExpandProperty Name
$manifestPath = Join-Path $projectsFolder "manifest.json"
$allMdFiles | ConvertTo-Json | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "manifest.json updated with $($allMdFiles.Count) projects!" -ForegroundColor Green

Write-Host "`nAll done! Refresh your browser to see changes." -ForegroundColor Yellow
