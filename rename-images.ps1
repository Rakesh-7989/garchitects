$uploadsFolder = "c:\Users\boyap\Downloads\garchitectsandinteriors-main\garchitectsandinteriors-main\images\uploads"

Write-Host "Renaming images (spaces -> hyphens)..." -ForegroundColor Cyan

$images = Get-ChildItem -Path $uploadsFolder -File -Include "*.jpg","*.jpeg","*.png","*.webp","*.gif","*.JPG","*.JPEG","*.PNG"

$renamed = 0
$skipped = 0

foreach ($img in $images) {
    # Replace spaces and special chars with hyphens, lowercase
    $newName = $img.Name `
        -replace '\s+', '-' `
        -replace '[()]+', '' `
        -replace '-+', '-' `
        -replace '^-|-$', ''
    
    # Lowercase the whole name
    $newName = $newName.ToLower()

    if ($newName -eq $img.Name.ToLower() -and $img.Name -eq $newName) {
        $skipped++
        continue
    }

    $destPath = Join-Path $uploadsFolder $newName

    if (Test-Path $destPath) {
        Write-Host "Already exists: $newName" -ForegroundColor Yellow
        $skipped++
        continue
    }

    try {
        Rename-Item -Path $img.FullName -NewName $newName -Force
        Write-Host "Renamed: '$($img.Name)' -> '$newName'" -ForegroundColor Green
        $renamed++
    } catch {
        Write-Host "Failed: $($img.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $skipped++
    }
}

Write-Host ""
Write-Host "Done! Renamed: $renamed, Skipped: $skipped" -ForegroundColor Cyan
Write-Host "Now update image paths in your project markdown files!" -ForegroundColor Yellow
